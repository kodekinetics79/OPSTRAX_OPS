#!/usr/bin/env node
/**
 * verify-storage.mjs — validates the S3-compatible evidence path against the
 * external object store and signed tenant-scoped access tokens.
 */

process.env.NODE_ENV ||= 'production';
process.env.DATABASE_PROVIDER ||= process.env.OPSTRAX_DB_PROVIDER || 'postgres';
process.env.EVIDENCE_STORAGE_PROVIDER ||= process.env.OPSTRAX_EVIDENCE_STORAGE || 's3';

import crypto from 'node:crypto';

const { selectOne } = await import('../src/db.js');
const {
  getTenantById,
  getUserById,
  uploadDocument,
  getEvidenceDetail,
  downloadEvidenceContent
} = await import('../src/services.js');
const { probeEvidenceStorage } = await import('../src/evidence-storage.js');

function buildContext(tenantId, userId) {
  return {
    tenant: getTenantById(tenantId),
    user: getUserById(userId),
    device: null,
    requestId: 'verify-storage-runtime'
  };
}

function signToken(tenantId, evidenceId, expiresAt, secret) {
  const payload = `${tenantId}:${evidenceId}:${expiresAt}`;
  const signature = crypto.createHmac('sha256', secret).update(payload).digest('base64url');
  return Buffer.from(JSON.stringify({ tenantId, evidenceId, expiresAt, signature })).toString('base64url');
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

try {
  const probe = probeEvidenceStorage();
  assert(probe.ok && probe.reachable && probe.provider === 's3', 'Evidence storage should be reachable via S3');

  const adminCtx = buildContext('tenant_intelliflow_systems', 'tenant_intelliflow_systems_user_admin');
  const evostelCtx = buildContext('tenant_evostel', 'tenant_evostel_user_admin');
  const purchaseRequest = selectOne("SELECT id FROM purchase_requests WHERE tenant_id = ? ORDER BY created_at LIMIT 1", ['tenant_intelliflow_systems']);
  assert(Boolean(purchaseRequest?.id), 'Need a seeded purchase request for evidence validation');

  const auditBefore = Number(selectOne("SELECT COUNT(*) AS count FROM audit_logs WHERE tenant_id = ? AND action = 'VIEW_EVIDENCE_BINARY'", ['tenant_intelliflow_systems'])?.count || 0);

  const upload = uploadDocument(adminCtx, {
    fileName: 'production-validation-evidence.txt',
    docType: 'Evidence',
    visibility: 'SUPERVISOR_ONLY',
    entityType: 'purchase_request',
    entityId: purchaseRequest.id,
    contentBase64: Buffer.from('OpsTrax production validation evidence\n', 'utf8').toString('base64'),
    mimeType: 'text/plain'
  });

  const detail = getEvidenceDetail(adminCtx, upload.evidence.id);
  assert(detail.accessUrl.startsWith('/api/evidence/'), 'Access URL must be tenant-scoped API path');
  assert(!detail.accessUrl.includes('opstrax-evidence'), 'Access URL must not expose raw bucket path');

  const token = new URL(`http://local${detail.accessUrl}`).searchParams.get('token') || '';
  const content = downloadEvidenceContent(adminCtx, upload.evidence.id, token);
  assert(content.mimeType === 'text/plain', 'Uploaded evidence should round-trip through object storage');
  assert(content.content.toString('utf8').includes('production validation evidence'), 'Downloaded evidence content should match upload');

  let crossTenantDenied = false;
  try {
    downloadEvidenceContent(evostelCtx, upload.evidence.id, token);
  } catch (error) {
    crossTenantDenied = true;
  }
  assert(crossTenantDenied, 'Cross-tenant evidence access must be denied');

  const expiredToken = signToken(
    'tenant_intelliflow_systems',
    upload.evidence.id,
    new Date(Date.now() - 60_000).toISOString(),
    process.env.EVIDENCE_SIGNING_SECRET || process.env.OPSTRAX_EVIDENCE_SIGNING_SECRET || ''
  );
  let expiredDenied = false;
  try {
    downloadEvidenceContent(adminCtx, upload.evidence.id, expiredToken);
  } catch (error) {
    expiredDenied = /expired|denied|403/i.test(error.message);
  }
  assert(expiredDenied, 'Expired signed evidence token must be rejected');

  let invalidDenied = false;
  try {
    downloadEvidenceContent(adminCtx, upload.evidence.id, `${token.slice(0, -1)}x`);
  } catch (error) {
    invalidDenied = /Invalid signed access token|denied|403/i.test(error.message);
  }
  assert(invalidDenied, 'Invalid signed evidence token must be rejected');

  const auditAfter = Number(selectOne("SELECT COUNT(*) AS count FROM audit_logs WHERE tenant_id = ? AND action = 'VIEW_EVIDENCE_BINARY'", ['tenant_intelliflow_systems'])?.count || 0);
  assert(auditAfter > auditBefore, 'Evidence binary access should be audited');

  process.stdout.write(`[verify-storage] OK provider=s3 bucket=${probe.bucket || process.env.S3_BUCKET || process.env.OPSTRAX_EVIDENCE_BUCKET || ''} auditDelta=${auditAfter - auditBefore}\n`);
  process.exit(0);
} catch (error) {
  process.stderr.write(`[verify-storage] ERROR ${error.message}\n`);
  process.exit(1);
}
