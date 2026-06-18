import { execute, insert, newId, nowIso, selectAll, selectOne } from './db.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function nextAssetNo(tenantId) {
  const row = selectOne(
    `SELECT COALESCE(MAX(CAST(REPLACE(asset_no, 'ASSET-', '') AS INTEGER)), 0) AS n
     FROM asset_records WHERE tenant_id = ?`,
    [tenantId]
  );
  return `ASSET-${String((row?.n ?? 0) + 1).padStart(4, '0')}`;
}

function nextTransferNo(tenantId) {
  const row = selectOne(
    `SELECT COALESCE(MAX(CAST(REPLACE(transfer_no, 'TRF-', '') AS INTEGER)), 0) AS n
     FROM asset_transfer_requests WHERE tenant_id = ?`,
    [tenantId]
  );
  return `TRF-${String((row?.n ?? 0) + 1).padStart(4, '0')}`;
}

function nextReturnNo(tenantId) {
  const row = selectOne(
    `SELECT COALESCE(MAX(CAST(REPLACE(return_no, 'RET-', '') AS INTEGER)), 0) AS n
     FROM asset_return_requests WHERE tenant_id = ?`,
    [tenantId]
  );
  return `RET-${String((row?.n ?? 0) + 1).padStart(4, '0')}`;
}

function nextConditionNo(tenantId) {
  const row = selectOne(
    `SELECT COALESCE(MAX(CAST(REPLACE(report_no, 'CDR-', '') AS INTEGER)), 0) AS n
     FROM asset_condition_reports WHERE tenant_id = ?`,
    [tenantId]
  );
  return `CDR-${String((row?.n ?? 0) + 1).padStart(4, '0')}`;
}

function nextCaseNo(tenantId) {
  const row = selectOne(
    `SELECT COALESCE(MAX(CAST(REPLACE(case_no, 'MNT-', '') AS INTEGER)), 0) AS n
     FROM asset_maintenance_cases WHERE tenant_id = ?`,
    [tenantId]
  );
  return `MNT-${String((row?.n ?? 0) + 1).padStart(4, '0')}`;
}

function nextDisposalNo(tenantId) {
  const row = selectOne(
    `SELECT COALESCE(MAX(CAST(REPLACE(disposal_no, 'DIS-', '') AS INTEGER)), 0) AS n
     FROM asset_disposal_requests WHERE tenant_id = ?`,
    [tenantId]
  );
  return `DIS-${String((row?.n ?? 0) + 1).padStart(4, '0')}`;
}

function requireAsset(tenantId, assetId) {
  const asset = selectOne('SELECT * FROM asset_records WHERE tenant_id = ? AND id = ?', [tenantId, assetId]);
  if (!asset) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
  return asset;
}

function writeAudit(tenantId, userId, action, entityType, entityId, summary, before = null, after = null) {
  const user = selectOne('SELECT department_id, facility_id FROM users WHERE id = ?', [userId]);
  const roleRow = selectOne('SELECT role_key FROM user_roles WHERE user_id = ? LIMIT 1', [userId]);
  if (!user) return;
  insert('audit_logs', {
    id: newId('audit'),
    tenant_id: tenantId,
    actor_user_id: userId,
    actor_role: roleRow?.role_key || 'admin',
    department_id: user.department_id,
    facility_id: user.facility_id,
    action,
    entity_type: entityType,
    entity_id: entityId,
    summary,
    before_json: JSON.stringify(before ?? {}),
    after_json: JSON.stringify(after ?? {}),
    request_id: ''
  });
}

function appendCustodyEvent(tenantId, assetId, eventType, actorUserId, opts = {}) {
  insert('asset_custody_events', {
    id: newId('ace'),
    tenant_id: tenantId,
    asset_id: assetId,
    event_type: eventType,
    actor_user_id: actorUserId,
    from_custodian_user_id: opts.fromCustodian ?? null,
    to_custodian_user_id: opts.toCustodian ?? null,
    from_facility_id: opts.fromFacility ?? null,
    to_facility_id: opts.toFacility ?? null,
    from_department_id: opts.fromDepartment ?? null,
    to_department_id: opts.toDepartment ?? null,
    status_before: opts.statusBefore ?? '',
    status_after: opts.statusAfter ?? '',
    reference_id: opts.referenceId ?? '',
    reference_type: opts.referenceType ?? '',
    notes: opts.notes ?? '',
    created_at: nowIso()
  });
}

const TERMINAL_STATES = new Set(['DISPOSED', 'LOST']);

// ── Summary ───────────────────────────────────────────────────────────────────

export function getAssetCustodySummary(tenantId) {
  const counts = selectOne(
    `SELECT
       COUNT(*) AS total_assets,
       SUM(CASE WHEN status = 'AVAILABLE' THEN 1 ELSE 0 END) AS available,
       SUM(CASE WHEN status = 'ASSIGNED' THEN 1 ELSE 0 END) AS assigned,
       SUM(CASE WHEN status = 'IN_TRANSFER' THEN 1 ELSE 0 END) AS in_transfer,
       SUM(CASE WHEN status = 'RETURN_PENDING' THEN 1 ELSE 0 END) AS return_pending,
       SUM(CASE WHEN status = 'DAMAGED' THEN 1 ELSE 0 END) AS damaged,
       SUM(CASE WHEN status = 'LOST' THEN 1 ELSE 0 END) AS lost,
       SUM(CASE WHEN status = 'QUARANTINED' THEN 1 ELSE 0 END) AS quarantined,
       SUM(CASE WHEN status = 'IN_MAINTENANCE' THEN 1 ELSE 0 END) AS in_maintenance,
       SUM(CASE WHEN status = 'DISPOSAL_PENDING' THEN 1 ELSE 0 END) AS disposal_pending,
       SUM(CASE WHEN status = 'DISPOSED' THEN 1 ELSE 0 END) AS disposed,
       SUM(CASE WHEN status = 'ASSIGNED' AND high_value = 1 THEN 1 ELSE 0 END) AS high_value_assigned,
       SUM(CASE WHEN status = 'ASSIGNED' AND controlled = 1 THEN 1 ELSE 0 END) AS controlled_assigned
     FROM asset_records WHERE tenant_id = ?`,
    [tenantId]
  ) ?? {};
  const openDisposals = selectOne(
    `SELECT COUNT(*) AS n FROM asset_disposal_requests WHERE tenant_id = ? AND status IN ('SUBMITTED','APPROVAL_PENDING','APPROVED')`,
    [tenantId]
  )?.n ?? 0;
  const overdueTrans = selectOne(
    `SELECT COUNT(*) AS n FROM asset_transfer_requests WHERE tenant_id = ? AND status = 'PENDING_APPROVAL'`,
    [tenantId]
  )?.n ?? 0;
  return {
    total_assets: counts.total_assets ?? 0,
    available: counts.available ?? 0,
    assigned: counts.assigned ?? 0,
    in_transfer: counts.in_transfer ?? 0,
    return_pending: counts.return_pending ?? 0,
    damaged: counts.damaged ?? 0,
    lost: counts.lost ?? 0,
    quarantined: counts.quarantined ?? 0,
    in_maintenance: counts.in_maintenance ?? 0,
    disposal_pending: counts.disposal_pending ?? 0,
    disposed: counts.disposed ?? 0,
    high_value_assigned: counts.high_value_assigned ?? 0,
    controlled_assigned: counts.controlled_assigned ?? 0,
    open_disposals: openDisposals,
    overdue_transfers: overdueTrans
  };
}

// ── Asset Registry ────────────────────────────────────────────────────────────

export function listAssets(tenantId, filters = {}) {
  const status = String(filters.status || '').trim();
  const category = String(filters.category || '').trim();
  const controlled = filters.controlled === '1' ? 1 : null;
  const params = [tenantId];
  let where = '';
  if (status) { where += ' AND ar.status = ?'; params.push(status); }
  if (category) { where += ' AND ar.category = ?'; params.push(category); }
  if (controlled !== null) { where += ' AND ar.controlled = ?'; params.push(controlled); }
  return selectAll(
    `SELECT ar.id, ar.asset_no, ar.name, ar.description, ar.category, ar.subcategory,
            ar.serial_number, ar.asset_type, ar.status, ar.controlled, ar.high_value,
            ar.acquisition_cost, ar.acquisition_date, ar.last_audit_date,
            ar.facility_id, ar.department_id, ar.current_custodian_user_id,
            ar.created_at, ar.updated_at,
            u.name AS custodian_name,
            f.name AS facility_name, d.name AS department_name
     FROM asset_records ar
     LEFT JOIN users u ON u.id = ar.current_custodian_user_id
     LEFT JOIN facilities f ON f.id = ar.facility_id
     LEFT JOIN departments d ON d.id = ar.department_id
     WHERE ar.tenant_id = ?${where}
     ORDER BY ar.created_at DESC LIMIT 200`,
    params
  );
}

export function createAsset(tenantId, userId, body) {
  const name = String(body.name || '').trim();
  if (!name) throw Object.assign(new Error('Asset name is required'), { statusCode: 400 });
  const assetNo = nextAssetNo(tenantId);
  const assetId = newId('asset');
  const now = nowIso();
  insert('asset_records', {
    id: assetId,
    tenant_id: tenantId,
    asset_no: assetNo,
    name,
    description: String(body.description || '').trim(),
    category: String(body.category || '').trim(),
    subcategory: String(body.subcategory || '').trim(),
    serial_number: String(body.serial_number || '').trim(),
    asset_type: ['SERIALIZED', 'CONTROLLED', 'STANDARD'].includes(body.asset_type) ? body.asset_type : 'STANDARD',
    status: 'AVAILABLE',
    item_id: body.item_id || null,
    facility_id: body.facility_id || null,
    department_id: body.department_id || null,
    current_custodian_user_id: null,
    acquisition_cost: body.acquisition_cost ? Number(body.acquisition_cost) : null,
    acquisition_date: body.acquisition_date || null,
    last_audit_date: null,
    disposal_at: null,
    controlled: body.controlled ? 1 : 0,
    high_value: body.high_value ? 1 : 0,
    notes: String(body.notes || '').trim(),
    created_by_user_id: userId,
    created_at: now,
    updated_at: now
  });
  appendCustodyEvent(tenantId, assetId, 'REGISTERED', userId, {
    statusBefore: '',
    statusAfter: 'AVAILABLE',
    notes: `Asset ${assetNo} registered`
  });
  writeAudit(tenantId, userId, 'CREATE_ASSET', 'asset_record', assetId, `Registered asset ${assetNo}: ${name}`);
  return selectOne('SELECT * FROM asset_records WHERE id = ?', [assetId]);
}

export function getAssetDetail(tenantId, assetId) {
  const asset = selectOne(
    `SELECT ar.*,
            u.name AS custodian_name,
            f.name AS facility_name, d.name AS department_name
     FROM asset_records ar
     LEFT JOIN users u ON u.id = ar.current_custodian_user_id
     LEFT JOIN facilities f ON f.id = ar.facility_id
     LEFT JOIN departments d ON d.id = ar.department_id
     WHERE ar.tenant_id = ? AND ar.id = ?`,
    [tenantId, assetId]
  );
  if (!asset) throw Object.assign(new Error('Asset not found'), { statusCode: 404 });
  const activeAssignment = selectOne(
    `SELECT aa.*, u.name AS custodian_name
     FROM asset_assignments aa
     LEFT JOIN users u ON u.id = aa.custodian_user_id
     WHERE aa.tenant_id = ? AND aa.asset_id = ? AND aa.status = 'ACTIVE' LIMIT 1`,
    [tenantId, assetId]
  );
  const openTransfer = selectOne(
    `SELECT * FROM asset_transfer_requests
     WHERE tenant_id = ? AND asset_id = ? AND status = 'PENDING_APPROVAL' LIMIT 1`,
    [tenantId, assetId]
  );
  return { asset, activeAssignment, openTransfer };
}

export function updateAsset(tenantId, userId, assetId, body) {
  const asset = requireAsset(tenantId, assetId);
  if (TERMINAL_STATES.has(asset.status)) {
    throw Object.assign(new Error(`Cannot update asset in ${asset.status} state`), { statusCode: 409 });
  }
  const now = nowIso();
  const updates = {
    name: body.name !== undefined ? String(body.name).trim() : asset.name,
    description: body.description !== undefined ? String(body.description).trim() : asset.description,
    category: body.category !== undefined ? String(body.category).trim() : asset.category,
    notes: body.notes !== undefined ? String(body.notes).trim() : asset.notes,
    updated_at: now
  };
  execute(
    `UPDATE asset_records SET name=?, description=?, category=?, notes=?, updated_at=? WHERE tenant_id=? AND id=?`,
    [updates.name, updates.description, updates.category, updates.notes, now, tenantId, assetId]
  );
  writeAudit(tenantId, userId, 'UPDATE_ASSET', 'asset_record', assetId, `Updated asset ${asset.asset_no}`, asset, updates);
  return selectOne('SELECT * FROM asset_records WHERE id = ?', [assetId]);
}

// ── Custody Timeline ──────────────────────────────────────────────────────────

export function getAssetTimeline(tenantId, assetId) {
  requireAsset(tenantId, assetId);
  return selectAll(
    `SELECT ace.*,
            u.name AS actor_name,
            uf.name AS from_custodian_name,
            ut.name AS to_custodian_name
     FROM asset_custody_events ace
     LEFT JOIN users u ON u.id = ace.actor_user_id
     LEFT JOIN users uf ON uf.id = ace.from_custodian_user_id
     LEFT JOIN users ut ON ut.id = ace.to_custodian_user_id
     WHERE ace.tenant_id = ? AND ace.asset_id = ?
     ORDER BY ace.created_at ASC`,
    [tenantId, assetId]
  );
}

// ── Assignment ────────────────────────────────────────────────────────────────

export function assignAsset(tenantId, userId, assetId, body) {
  const asset = requireAsset(tenantId, assetId);
  if (TERMINAL_STATES.has(asset.status)) {
    throw Object.assign(new Error(`Cannot assign asset in ${asset.status} state — terminal state`), { statusCode: 409 });
  }
  if (!['AVAILABLE', 'RETURNED'].includes(asset.status)) {
    throw Object.assign(new Error(`Asset must be AVAILABLE or RETURNED to assign (current: ${asset.status})`), { statusCode: 409 });
  }
  const custodianId = body.custodian_user_id;
  if (!custodianId) throw Object.assign(new Error('custodian_user_id is required'), { statusCode: 400 });
  const custodian = selectOne('SELECT id, department_id, facility_id FROM users WHERE id = ?', [custodianId]);
  if (!custodian) throw Object.assign(new Error('Custodian user not found'), { statusCode: 404 });
  const now = nowIso();
  const assignmentId = newId('asgn');
  insert('asset_assignments', {
    id: assignmentId,
    tenant_id: tenantId,
    asset_id: assetId,
    custodian_user_id: custodianId,
    department_id: body.department_id || custodian.department_id || null,
    facility_id: body.facility_id || custodian.facility_id || asset.facility_id || null,
    assigned_by_user_id: userId,
    assigned_at: now,
    expected_return_at: body.expected_return_at || null,
    return_requested_at: null,
    returned_at: null,
    status: 'ACTIVE',
    notes: String(body.notes || '').trim(),
    created_at: now,
    updated_at: now
  });
  execute(
    `UPDATE asset_records SET status='ASSIGNED', current_custodian_user_id=?, updated_at=? WHERE tenant_id=? AND id=?`,
    [custodianId, now, tenantId, assetId]
  );
  appendCustodyEvent(tenantId, assetId, 'ASSIGNED', userId, {
    toCustodian: custodianId,
    statusBefore: asset.status,
    statusAfter: 'ASSIGNED',
    referenceId: assignmentId,
    referenceType: 'asset_assignment',
    notes: body.notes || ''
  });
  writeAudit(tenantId, userId, 'ASSIGN_ASSET', 'asset_record', assetId, `Assigned asset ${asset.asset_no} to custodian ${custodianId}`);
  return selectOne('SELECT * FROM asset_assignments WHERE id = ?', [assignmentId]);
}

// ── Transfer ──────────────────────────────────────────────────────────────────

export function createTransferRequest(tenantId, userId, assetId, body) {
  const asset = requireAsset(tenantId, assetId);
  if (TERMINAL_STATES.has(asset.status)) {
    throw Object.assign(new Error(`Cannot transfer asset in ${asset.status} state`), { statusCode: 409 });
  }
  const toCustodianId = body.to_custodian_user_id;
  if (!toCustodianId) throw Object.assign(new Error('to_custodian_user_id is required'), { statusCode: 400 });
  const existingPending = selectOne(
    `SELECT id FROM asset_transfer_requests WHERE tenant_id=? AND asset_id=? AND status='PENDING_APPROVAL'`,
    [tenantId, assetId]
  );
  if (existingPending) throw Object.assign(new Error('A transfer request is already pending for this asset'), { statusCode: 409 });
  const now = nowIso();
  const transferId = newId('atr');
  const transferNo = nextTransferNo(tenantId);
  insert('asset_transfer_requests', {
    id: transferId,
    tenant_id: tenantId,
    asset_id: assetId,
    transfer_no: transferNo,
    from_custodian_user_id: asset.current_custodian_user_id || null,
    to_custodian_user_id: toCustodianId,
    from_facility_id: asset.facility_id || null,
    to_facility_id: body.to_facility_id || null,
    from_department_id: asset.department_id || null,
    to_department_id: body.to_department_id || null,
    requested_by_user_id: userId,
    approved_by_user_id: null,
    rejected_by_user_id: null,
    status: 'PENDING_APPROVAL',
    reason: String(body.reason || '').trim(),
    approval_notes: '',
    notes: String(body.notes || '').trim(),
    requested_at: now,
    approved_at: null,
    transferred_at: null,
    cancelled_at: null,
    created_at: now,
    updated_at: now
  });
  execute(`UPDATE asset_records SET status='IN_TRANSFER', updated_at=? WHERE tenant_id=? AND id=?`, [now, tenantId, assetId]);
  appendCustodyEvent(tenantId, assetId, 'TRANSFER_REQUESTED', userId, {
    fromCustodian: asset.current_custodian_user_id,
    toCustodian: toCustodianId,
    statusBefore: asset.status,
    statusAfter: 'IN_TRANSFER',
    referenceId: transferId,
    referenceType: 'asset_transfer_request',
    notes: body.reason || ''
  });
  writeAudit(tenantId, userId, 'CREATE_TRANSFER_REQUEST', 'asset_transfer_request', transferId, `Transfer request ${transferNo} for asset ${asset.asset_no}`);
  return selectOne('SELECT * FROM asset_transfer_requests WHERE id = ?', [transferId]);
}

export function approveTransferRequest(tenantId, userId, assetId, body) {
  const asset = requireAsset(tenantId, assetId);
  const transferId = body.transfer_request_id;
  if (!transferId) throw Object.assign(new Error('transfer_request_id is required'), { statusCode: 400 });
  const transfer = selectOne(
    `SELECT * FROM asset_transfer_requests WHERE tenant_id=? AND asset_id=? AND id=?`,
    [tenantId, assetId, transferId]
  );
  if (!transfer) throw Object.assign(new Error('Transfer request not found'), { statusCode: 404 });
  if (transfer.status !== 'PENDING_APPROVAL') {
    throw Object.assign(new Error(`Transfer request is not pending approval (status: ${transfer.status})`), { statusCode: 409 });
  }
  const now = nowIso();
  execute(
    `UPDATE asset_transfer_requests SET status='TRANSFERRED', approved_by_user_id=?, approved_at=?, transferred_at=?, approval_notes=?, updated_at=? WHERE tenant_id=? AND id=?`,
    [userId, now, now, String(body.notes || '').trim(), now, tenantId, transferId]
  );
  execute(
    `UPDATE asset_records SET status='ASSIGNED', current_custodian_user_id=?, facility_id=COALESCE(?, facility_id), department_id=COALESCE(?, department_id), updated_at=? WHERE tenant_id=? AND id=?`,
    [transfer.to_custodian_user_id, transfer.to_facility_id, transfer.to_department_id, now, tenantId, assetId]
  );
  const activeAssignment = selectOne(`SELECT id FROM asset_assignments WHERE tenant_id=? AND asset_id=? AND status='ACTIVE'`, [tenantId, assetId]);
  if (activeAssignment) {
    execute(`UPDATE asset_assignments SET status='RETURNED', returned_at=?, updated_at=? WHERE id=?`, [now, now, activeAssignment.id]);
  }
  const newAssignmentId = newId('asgn');
  insert('asset_assignments', {
    id: newAssignmentId,
    tenant_id: tenantId,
    asset_id: assetId,
    custodian_user_id: transfer.to_custodian_user_id,
    department_id: transfer.to_department_id || null,
    facility_id: transfer.to_facility_id || asset.facility_id || null,
    assigned_by_user_id: userId,
    assigned_at: now,
    expected_return_at: null,
    return_requested_at: null,
    returned_at: null,
    status: 'ACTIVE',
    notes: `Transfer ${transfer.transfer_no} approved`,
    created_at: now,
    updated_at: now
  });
  appendCustodyEvent(tenantId, assetId, 'TRANSFERRED', userId, {
    fromCustodian: transfer.from_custodian_user_id,
    toCustodian: transfer.to_custodian_user_id,
    statusBefore: 'IN_TRANSFER',
    statusAfter: 'ASSIGNED',
    referenceId: transferId,
    referenceType: 'asset_transfer_request',
    notes: body.notes || ''
  });
  writeAudit(tenantId, userId, 'APPROVE_TRANSFER', 'asset_transfer_request', transferId, `Approved transfer ${transfer.transfer_no} for asset ${asset.asset_no}`);
  return selectOne('SELECT * FROM asset_transfer_requests WHERE id = ?', [transferId]);
}

// ── Return ────────────────────────────────────────────────────────────────────

export function createReturnRequest(tenantId, userId, assetId, body) {
  const asset = requireAsset(tenantId, assetId);
  if (!['ASSIGNED', 'RETURN_PENDING'].includes(asset.status)) {
    throw Object.assign(new Error(`Asset must be ASSIGNED to request a return (current: ${asset.status})`), { statusCode: 409 });
  }
  const now = nowIso();
  const returnId = newId('aret');
  const returnNo = nextReturnNo(tenantId);
  const activeAssignment = selectOne(
    `SELECT id FROM asset_assignments WHERE tenant_id=? AND asset_id=? AND status='ACTIVE' LIMIT 1`,
    [tenantId, assetId]
  );
  insert('asset_return_requests', {
    id: returnId,
    tenant_id: tenantId,
    asset_id: assetId,
    assignment_id: activeAssignment?.id || null,
    return_no: returnNo,
    requested_by_user_id: userId,
    accepted_by_user_id: null,
    return_condition: 'GOOD',
    condition_notes: '',
    status: 'REQUESTED',
    requested_at: now,
    accepted_at: null,
    notes: String(body.notes || '').trim(),
    created_at: now,
    updated_at: now
  });
  execute(`UPDATE asset_records SET status='RETURN_PENDING', updated_at=? WHERE tenant_id=? AND id=?`, [now, tenantId, assetId]);
  if (activeAssignment) {
    execute(`UPDATE asset_assignments SET status='RETURN_PENDING', return_requested_at=?, updated_at=? WHERE id=?`, [now, now, activeAssignment.id]);
  }
  appendCustodyEvent(tenantId, assetId, 'RETURN_REQUESTED', userId, {
    fromCustodian: asset.current_custodian_user_id,
    statusBefore: asset.status,
    statusAfter: 'RETURN_PENDING',
    referenceId: returnId,
    referenceType: 'asset_return_request',
    notes: body.notes || ''
  });
  writeAudit(tenantId, userId, 'CREATE_RETURN_REQUEST', 'asset_return_request', returnId, `Return request ${returnNo} for asset ${asset.asset_no}`);
  return selectOne('SELECT * FROM asset_return_requests WHERE id = ?', [returnId]);
}

export function acceptReturn(tenantId, userId, assetId, body) {
  const asset = requireAsset(tenantId, assetId);
  if (asset.status !== 'RETURN_PENDING') {
    throw Object.assign(new Error(`Asset is not in RETURN_PENDING state (current: ${asset.status})`), { statusCode: 409 });
  }
  const returnId = body.return_request_id;
  if (!returnId) throw Object.assign(new Error('return_request_id is required'), { statusCode: 400 });
  const returnReq = selectOne(`SELECT * FROM asset_return_requests WHERE tenant_id=? AND asset_id=? AND id=?`, [tenantId, assetId, returnId]);
  if (!returnReq) throw Object.assign(new Error('Return request not found'), { statusCode: 404 });
  if (returnReq.status !== 'REQUESTED') throw Object.assign(new Error(`Return request is not in REQUESTED state (status: ${returnReq.status})`), { statusCode: 409 });
  const condition = body.return_condition || 'GOOD';
  const now = nowIso();
  const newStatus = ['MAJOR_DAMAGE'].includes(condition) ? 'DAMAGED' : 'AVAILABLE';
  execute(
    `UPDATE asset_return_requests SET status='ACCEPTED', accepted_by_user_id=?, accepted_at=?, return_condition=?, condition_notes=?, updated_at=? WHERE tenant_id=? AND id=?`,
    [userId, now, condition, String(body.condition_notes || '').trim(), now, tenantId, returnId]
  );
  execute(
    `UPDATE asset_records SET status=?, current_custodian_user_id=NULL, updated_at=? WHERE tenant_id=? AND id=?`,
    [newStatus, now, tenantId, assetId]
  );
  const activeAssignment = selectOne(`SELECT id FROM asset_assignments WHERE tenant_id=? AND asset_id=? AND status='RETURN_PENDING' LIMIT 1`, [tenantId, assetId]);
  if (activeAssignment) {
    execute(`UPDATE asset_assignments SET status='RETURNED', returned_at=?, updated_at=? WHERE id=?`, [now, now, activeAssignment.id]);
  }
  appendCustodyEvent(tenantId, assetId, 'RETURNED', userId, {
    fromCustodian: asset.current_custodian_user_id,
    statusBefore: 'RETURN_PENDING',
    statusAfter: newStatus,
    referenceId: returnId,
    referenceType: 'asset_return_request',
    notes: `Condition: ${condition}. ${body.condition_notes || ''}`
  });
  writeAudit(tenantId, userId, 'ACCEPT_RETURN', 'asset_return_request', returnId, `Accepted return ${returnReq.return_no} for asset ${asset.asset_no}. Condition: ${condition}`);
  return selectOne('SELECT * FROM asset_return_requests WHERE id = ?', [returnId]);
}

// ── Condition / Damage / Loss / Quarantine ────────────────────────────────────

export function createConditionReport(tenantId, userId, assetId, body) {
  requireAsset(tenantId, assetId);
  const description = String(body.description || '').trim();
  if (!description) throw Object.assign(new Error('description is required'), { statusCode: 400 });
  const reportId = newId('acr');
  const reportNo = nextConditionNo(tenantId);
  const now = nowIso();
  insert('asset_condition_reports', {
    id: reportId,
    tenant_id: tenantId,
    asset_id: assetId,
    report_no: reportNo,
    reported_by_user_id: userId,
    condition_type: body.condition_type || 'INSPECTION',
    severity: body.severity || 'LOW',
    description,
    repair_cost_estimate: body.repair_cost_estimate ? Number(body.repair_cost_estimate) : null,
    evidence_ref: String(body.evidence_ref || '').trim(),
    status: 'OPEN',
    resolved_by_user_id: null,
    resolved_at: null,
    notes: String(body.notes || '').trim(),
    created_at: now,
    updated_at: now
  });
  appendCustodyEvent(tenantId, assetId, 'CONDITION_REPORTED', userId, {
    referenceId: reportId,
    referenceType: 'asset_condition_report',
    notes: `${body.condition_type || 'INSPECTION'}: ${description.slice(0, 120)}`
  });
  writeAudit(tenantId, userId, 'CREATE_CONDITION_REPORT', 'asset_condition_report', reportId, `Condition report ${reportNo} for asset`);
  return selectOne('SELECT * FROM asset_condition_reports WHERE id = ?', [reportId]);
}

export function reportDamage(tenantId, userId, assetId, body) {
  const asset = requireAsset(tenantId, assetId);
  if (TERMINAL_STATES.has(asset.status)) {
    throw Object.assign(new Error(`Cannot report damage on asset in ${asset.status} state`), { statusCode: 409 });
  }
  const description = String(body.description || '').trim();
  if (!description) throw Object.assign(new Error('description is required for damage report'), { statusCode: 400 });
  const now = nowIso();
  const reportId = newId('acr');
  const reportNo = nextConditionNo(tenantId);
  insert('asset_condition_reports', {
    id: reportId,
    tenant_id: tenantId,
    asset_id: assetId,
    report_no: reportNo,
    reported_by_user_id: userId,
    condition_type: 'DAMAGE',
    severity: body.severity || 'MEDIUM',
    description,
    repair_cost_estimate: body.repair_cost_estimate ? Number(body.repair_cost_estimate) : null,
    evidence_ref: String(body.evidence_ref || '').trim(),
    status: 'OPEN',
    resolved_by_user_id: null,
    resolved_at: null,
    notes: String(body.notes || '').trim(),
    created_at: now,
    updated_at: now
  });
  execute(`UPDATE asset_records SET status='DAMAGED', updated_at=? WHERE tenant_id=? AND id=?`, [now, tenantId, assetId]);
  appendCustodyEvent(tenantId, assetId, 'DAMAGED', userId, {
    statusBefore: asset.status,
    statusAfter: 'DAMAGED',
    referenceId: reportId,
    referenceType: 'asset_condition_report',
    notes: description.slice(0, 200)
  });
  writeAudit(tenantId, userId, 'REPORT_DAMAGE', 'asset_condition_report', reportId, `Damage report ${reportNo} for asset ${asset.asset_no}: ${description.slice(0, 80)}`);
  return selectOne('SELECT * FROM asset_condition_reports WHERE id = ?', [reportId]);
}

export function reportLoss(tenantId, userId, assetId, body) {
  const asset = requireAsset(tenantId, assetId);
  if (asset.status === 'LOST' || asset.status === 'DISPOSED') {
    throw Object.assign(new Error(`Asset is already in ${asset.status} state`), { statusCode: 409 });
  }
  const description = String(body.description || '').trim();
  if (!description) throw Object.assign(new Error('description is required for loss report'), { statusCode: 400 });
  const now = nowIso();
  const reportId = newId('acr');
  const reportNo = nextConditionNo(tenantId);
  insert('asset_condition_reports', {
    id: reportId,
    tenant_id: tenantId,
    asset_id: assetId,
    report_no: reportNo,
    reported_by_user_id: userId,
    condition_type: 'LOSS',
    severity: 'CRITICAL',
    description,
    repair_cost_estimate: null,
    evidence_ref: String(body.evidence_ref || '').trim(),
    status: 'OPEN',
    resolved_by_user_id: null,
    resolved_at: null,
    notes: String(body.notes || '').trim(),
    created_at: now,
    updated_at: now
  });
  execute(
    `UPDATE asset_records SET status='LOST', current_custodian_user_id=NULL, updated_at=? WHERE tenant_id=? AND id=?`,
    [now, tenantId, assetId]
  );
  appendCustodyEvent(tenantId, assetId, 'LOST', userId, {
    fromCustodian: asset.current_custodian_user_id,
    statusBefore: asset.status,
    statusAfter: 'LOST',
    referenceId: reportId,
    referenceType: 'asset_condition_report',
    notes: description.slice(0, 200)
  });
  writeAudit(tenantId, userId, 'REPORT_LOSS', 'asset_condition_report', reportId, `Loss report ${reportNo} for asset ${asset.asset_no}: ${description.slice(0, 80)}`);
  return selectOne('SELECT * FROM asset_condition_reports WHERE id = ?', [reportId]);
}

export function quarantineAsset(tenantId, userId, assetId, body) {
  const asset = requireAsset(tenantId, assetId);
  if (TERMINAL_STATES.has(asset.status)) {
    throw Object.assign(new Error(`Cannot quarantine asset in ${asset.status} state`), { statusCode: 409 });
  }
  const now = nowIso();
  execute(`UPDATE asset_records SET status='QUARANTINED', updated_at=? WHERE tenant_id=? AND id=?`, [now, tenantId, assetId]);
  appendCustodyEvent(tenantId, assetId, 'QUARANTINED', userId, {
    statusBefore: asset.status,
    statusAfter: 'QUARANTINED',
    notes: String(body?.reason || '').trim()
  });
  writeAudit(tenantId, userId, 'QUARANTINE_ASSET', 'asset_record', assetId, `Quarantined asset ${asset.asset_no}. Reason: ${body?.reason || '(none)'}`);
  return selectOne('SELECT * FROM asset_records WHERE id = ?', [assetId]);
}

export function releaseQuarantine(tenantId, userId, assetId, body) {
  const asset = requireAsset(tenantId, assetId);
  if (asset.status !== 'QUARANTINED') {
    throw Object.assign(new Error(`Asset is not QUARANTINED (current: ${asset.status})`), { statusCode: 409 });
  }
  const now = nowIso();
  execute(`UPDATE asset_records SET status='AVAILABLE', updated_at=? WHERE tenant_id=? AND id=?`, [now, tenantId, assetId]);
  appendCustodyEvent(tenantId, assetId, 'QUARANTINED', userId, {
    statusBefore: 'QUARANTINED',
    statusAfter: 'AVAILABLE',
    notes: `Released from quarantine. ${String(body?.notes || '').trim()}`
  });
  writeAudit(tenantId, userId, 'RELEASE_QUARANTINE', 'asset_record', assetId, `Released asset ${asset.asset_no} from quarantine`);
  return selectOne('SELECT * FROM asset_records WHERE id = ?', [assetId]);
}

// ── Maintenance ───────────────────────────────────────────────────────────────

export function openMaintenance(tenantId, userId, assetId, body) {
  const asset = requireAsset(tenantId, assetId);
  if (TERMINAL_STATES.has(asset.status)) {
    throw Object.assign(new Error(`Cannot open maintenance on asset in ${asset.status} state`), { statusCode: 409 });
  }
  const now = nowIso();
  const caseId = newId('amnt');
  const caseNo = nextCaseNo(tenantId);
  insert('asset_maintenance_cases', {
    id: caseId,
    tenant_id: tenantId,
    asset_id: assetId,
    case_no: caseNo,
    maintenance_type: body.maintenance_type || 'PREVENTIVE',
    status: 'OPEN',
    opened_by_user_id: userId,
    closed_by_user_id: null,
    description: String(body.description || '').trim(),
    resolution: '',
    scheduled_at: body.scheduled_at || null,
    started_at: now,
    completed_at: null,
    notes: String(body.notes || '').trim(),
    created_at: now,
    updated_at: now
  });
  execute(`UPDATE asset_records SET status='IN_MAINTENANCE', updated_at=? WHERE tenant_id=? AND id=?`, [now, tenantId, assetId]);
  appendCustodyEvent(tenantId, assetId, 'MAINTENANCE_OPENED', userId, {
    statusBefore: asset.status,
    statusAfter: 'IN_MAINTENANCE',
    referenceId: caseId,
    referenceType: 'asset_maintenance_case',
    notes: `${body.maintenance_type || 'PREVENTIVE'}: ${String(body.description || '').slice(0, 120)}`
  });
  writeAudit(tenantId, userId, 'OPEN_MAINTENANCE', 'asset_maintenance_case', caseId, `Opened maintenance case ${caseNo} for asset ${asset.asset_no}`);
  return selectOne('SELECT * FROM asset_maintenance_cases WHERE id = ?', [caseId]);
}

export function closeMaintenance(tenantId, userId, caseId, body) {
  const mainCase = selectOne('SELECT * FROM asset_maintenance_cases WHERE tenant_id = ? AND id = ?', [tenantId, caseId]);
  if (!mainCase) throw Object.assign(new Error('Maintenance case not found'), { statusCode: 404 });
  if (mainCase.status === 'COMPLETED') throw Object.assign(new Error('Maintenance case is already completed'), { statusCode: 409 });
  const now = nowIso();
  execute(
    `UPDATE asset_maintenance_cases SET status='COMPLETED', closed_by_user_id=?, completed_at=?, resolution=?, updated_at=? WHERE tenant_id=? AND id=?`,
    [userId, now, String(body.resolution || '').trim(), now, tenantId, caseId]
  );
  const asset = selectOne('SELECT * FROM asset_records WHERE tenant_id=? AND id=?', [tenantId, mainCase.asset_id]);
  if (asset && asset.status === 'IN_MAINTENANCE') {
    execute(`UPDATE asset_records SET status='AVAILABLE', updated_at=? WHERE tenant_id=? AND id=?`, [now, tenantId, mainCase.asset_id]);
    appendCustodyEvent(tenantId, mainCase.asset_id, 'MAINTENANCE_CLOSED', userId, {
      statusBefore: 'IN_MAINTENANCE',
      statusAfter: 'AVAILABLE',
      referenceId: caseId,
      referenceType: 'asset_maintenance_case',
      notes: body.resolution || ''
    });
  }
  writeAudit(tenantId, userId, 'CLOSE_MAINTENANCE', 'asset_maintenance_case', caseId, `Closed maintenance case ${mainCase.case_no}`);
  return selectOne('SELECT * FROM asset_maintenance_cases WHERE id = ?', [caseId]);
}

export function listMaintenanceCases(tenantId, filters = {}) {
  const status = String(filters.status || '').trim();
  const params = [tenantId];
  const where = status ? ' AND amc.status = ?' : '';
  if (status) params.push(status);
  return selectAll(
    `SELECT amc.*, ar.asset_no, ar.name AS asset_name, u.name AS opened_by_name
     FROM asset_maintenance_cases amc
     JOIN asset_records ar ON ar.id = amc.asset_id
     LEFT JOIN users u ON u.id = amc.opened_by_user_id
     WHERE amc.tenant_id = ?${where}
     ORDER BY amc.created_at DESC LIMIT 100`,
    params
  );
}

// ── Disposal ──────────────────────────────────────────────────────────────────

export function listDisposalRequests(tenantId, filters = {}) {
  const status = String(filters.status || '').trim();
  const params = [tenantId];
  const where = status ? ' AND adr.status = ?' : '';
  if (status) params.push(status);
  return selectAll(
    `SELECT adr.*, ar.asset_no, ar.name AS asset_name, u.name AS requested_by_name
     FROM asset_disposal_requests adr
     JOIN asset_records ar ON ar.id = adr.asset_id
     LEFT JOIN users u ON u.id = adr.requested_by_user_id
     WHERE adr.tenant_id = ?${where}
     ORDER BY adr.created_at DESC LIMIT 100`,
    params
  );
}

export function createDisposalRequest(tenantId, userId, assetId, body) {
  const asset = requireAsset(tenantId, assetId);
  if (asset.status === 'DISPOSED') {
    throw Object.assign(new Error('Asset is already disposed'), { statusCode: 409 });
  }
  const reason = String(body.reason || '').trim();
  if (!reason) throw Object.assign(new Error('reason is required for disposal request'), { statusCode: 400 });
  const existingPending = selectOne(
    `SELECT id FROM asset_disposal_requests WHERE tenant_id=? AND asset_id=? AND status IN ('DRAFT','SUBMITTED','APPROVAL_PENDING','APPROVED')`,
    [tenantId, assetId]
  );
  if (existingPending) throw Object.assign(new Error('A disposal request is already active for this asset'), { statusCode: 409 });
  const now = nowIso();
  const disposalId = newId('adis');
  const disposalNo = nextDisposalNo(tenantId);
  insert('asset_disposal_requests', {
    id: disposalId,
    tenant_id: tenantId,
    asset_id: assetId,
    disposal_no: disposalNo,
    requested_by_user_id: userId,
    approved_by_user_id: null,
    rejected_by_user_id: null,
    posted_by_user_id: null,
    status: 'APPROVAL_PENDING',
    reason,
    disposal_method: body.disposal_method || 'WRITE_OFF',
    disposal_value: body.disposal_value ? Number(body.disposal_value) : null,
    approval_notes: '',
    rejection_notes: '',
    notes: String(body.notes || '').trim(),
    submitted_at: now,
    approved_at: null,
    rejected_at: null,
    disposed_at: null,
    created_at: now,
    updated_at: now
  });
  execute(`UPDATE asset_records SET status='DISPOSAL_PENDING', updated_at=? WHERE tenant_id=? AND id=?`, [now, tenantId, assetId]);
  appendCustodyEvent(tenantId, assetId, 'DISPOSAL_REQUESTED', userId, {
    statusBefore: asset.status,
    statusAfter: 'DISPOSAL_PENDING',
    referenceId: disposalId,
    referenceType: 'asset_disposal_request',
    notes: reason.slice(0, 200)
  });
  writeAudit(tenantId, userId, 'CREATE_DISPOSAL_REQUEST', 'asset_disposal_request', disposalId, `Disposal request ${disposalNo} for asset ${asset.asset_no}. Reason: ${reason.slice(0, 80)}`);
  return selectOne('SELECT * FROM asset_disposal_requests WHERE id = ?', [disposalId]);
}

export function approveDisposalRequest(tenantId, userId, disposalId, body) {
  const disposal = selectOne('SELECT * FROM asset_disposal_requests WHERE tenant_id=? AND id=?', [tenantId, disposalId]);
  if (!disposal) throw Object.assign(new Error('Disposal request not found'), { statusCode: 404 });
  if (disposal.status !== 'APPROVAL_PENDING') {
    throw Object.assign(new Error(`Disposal request is not pending approval (status: ${disposal.status})`), { statusCode: 409 });
  }
  if (disposal.requested_by_user_id === userId) {
    throw Object.assign(new Error('Requester cannot approve their own disposal request — segregation of duties required'), { statusCode: 403 });
  }
  const now = nowIso();
  execute(
    `UPDATE asset_disposal_requests SET status='APPROVED', approved_by_user_id=?, approved_at=?, approval_notes=?, updated_at=? WHERE tenant_id=? AND id=?`,
    [userId, now, String(body.notes || '').trim(), now, tenantId, disposalId]
  );
  appendCustodyEvent(tenantId, disposal.asset_id, 'DISPOSAL_APPROVED', userId, {
    statusBefore: 'DISPOSAL_PENDING',
    statusAfter: 'DISPOSAL_PENDING',
    referenceId: disposalId,
    referenceType: 'asset_disposal_request',
    notes: body.notes || ''
  });
  writeAudit(tenantId, userId, 'APPROVE_DISPOSAL', 'asset_disposal_request', disposalId, `Approved disposal request ${disposal.disposal_no}`);
  return selectOne('SELECT * FROM asset_disposal_requests WHERE id = ?', [disposalId]);
}

export function rejectDisposalRequest(tenantId, userId, disposalId, body) {
  const disposal = selectOne('SELECT * FROM asset_disposal_requests WHERE tenant_id=? AND id=?', [tenantId, disposalId]);
  if (!disposal) throw Object.assign(new Error('Disposal request not found'), { statusCode: 404 });
  if (!['APPROVAL_PENDING', 'APPROVED'].includes(disposal.status)) {
    throw Object.assign(new Error(`Cannot reject disposal in ${disposal.status} state`), { statusCode: 409 });
  }
  const reason = String(body.reason || '').trim();
  if (!reason) throw Object.assign(new Error('reason is required to reject disposal'), { statusCode: 400 });
  const now = nowIso();
  execute(
    `UPDATE asset_disposal_requests SET status='REJECTED', rejected_by_user_id=?, rejected_at=?, rejection_notes=?, updated_at=? WHERE tenant_id=? AND id=?`,
    [userId, now, reason, now, tenantId, disposalId]
  );
  execute(`UPDATE asset_records SET status='AVAILABLE', updated_at=? WHERE tenant_id=? AND id=?`, [now, tenantId, disposal.asset_id]);
  writeAudit(tenantId, userId, 'REJECT_DISPOSAL', 'asset_disposal_request', disposalId, `Rejected disposal request ${disposal.disposal_no}. Reason: ${reason.slice(0, 80)}`);
  return selectOne('SELECT * FROM asset_disposal_requests WHERE id = ?', [disposalId]);
}

export function postDisposal(tenantId, userId, disposalId, body) {
  const disposal = selectOne('SELECT * FROM asset_disposal_requests WHERE tenant_id=? AND id=?', [tenantId, disposalId]);
  if (!disposal) throw Object.assign(new Error('Disposal request not found'), { statusCode: 404 });
  if (disposal.status !== 'APPROVED') {
    throw Object.assign(new Error(`Disposal must be APPROVED before posting (status: ${disposal.status})`), { statusCode: 409 });
  }
  const now = nowIso();
  execute(
    `UPDATE asset_disposal_requests SET status='DISPOSED', posted_by_user_id=?, disposed_at=?, updated_at=? WHERE tenant_id=? AND id=?`,
    [userId, now, now, tenantId, disposalId]
  );
  execute(
    `UPDATE asset_records SET status='DISPOSED', current_custodian_user_id=NULL, disposal_at=?, updated_at=? WHERE tenant_id=? AND id=?`,
    [now, now, tenantId, disposal.asset_id]
  );
  const asset = selectOne('SELECT asset_no FROM asset_records WHERE id=?', [disposal.asset_id]);
  appendCustodyEvent(tenantId, disposal.asset_id, 'DISPOSED', userId, {
    statusBefore: 'DISPOSAL_PENDING',
    statusAfter: 'DISPOSED',
    referenceId: disposalId,
    referenceType: 'asset_disposal_request',
    notes: `Method: ${disposal.disposal_method}. ${body.notes || ''}`
  });
  writeAudit(tenantId, userId, 'POST_DISPOSAL', 'asset_disposal_request', disposalId, `Posted disposal for asset ${asset?.asset_no || disposal.asset_id}. Method: ${disposal.disposal_method}`);
  return selectOne('SELECT * FROM asset_disposal_requests WHERE id = ?', [disposalId]);
}

// ── Evidence ──────────────────────────────────────────────────────────────────

export function addAssetEvidence(tenantId, userId, assetId, body) {
  requireAsset(tenantId, assetId);
  const description = String(body.description || '').trim();
  const reference = String(body.reference || '').trim();
  if (!description) throw Object.assign(new Error('description is required'), { statusCode: 400 });
  const now = nowIso();
  const linkId = newId('ael');
  insert('asset_evidence_links', {
    id: linkId,
    tenant_id: tenantId,
    asset_id: assetId,
    event_id: body.event_id || null,
    evidence_type: body.evidence_type || 'DOCUMENT',
    description,
    reference,
    added_by_user_id: userId,
    created_at: now
  });
  writeAudit(tenantId, userId, 'ADD_ASSET_EVIDENCE', 'asset_evidence_link', linkId, `Added evidence link to asset ${assetId}: ${description.slice(0, 80)}`);
  return selectOne('SELECT * FROM asset_evidence_links WHERE id = ?', [linkId]);
}

export function getAssetEvidence(tenantId, assetId) {
  requireAsset(tenantId, assetId);
  return selectAll(
    `SELECT ael.*, u.name AS added_by_name
     FROM asset_evidence_links ael
     LEFT JOIN users u ON u.id = ael.added_by_user_id
     WHERE ael.tenant_id = ? AND ael.asset_id = ?
     ORDER BY ael.created_at DESC`,
    [tenantId, assetId]
  );
}

// ── Seed Data ─────────────────────────────────────────────────────────────────

export function getAssetCustodySeedRows(tenantId, users, facilities, departments) {
  const u0 = users[0]?.id;
  const u1 = users[1]?.id;
  const u2 = users[2]?.id;
  const u3 = users[3]?.id || u0;
  const fac0 = facilities[0]?.id;
  const fac1 = facilities[1]?.id || fac0;
  const dep0 = departments[0]?.id;
  const dep1 = departments[1]?.id || dep0;
  const dep2 = departments[2]?.id || dep0;
  const now = new Date().toISOString();
  const d = (offset) => {
    const dt = new Date(Date.now() + offset * 86400000);
    return dt.toISOString();
  };

  const assetRecords = [
    {
      id: 'asset_seed_001', tenant_id: tenantId, asset_no: 'ASSET-0001',
      name: 'Laptop — Ops Field Unit', description: 'Ruggedized field laptop for operations supervisor',
      category: 'Computing', subcategory: 'Laptops', serial_number: 'SN-LAP-2024-001',
      asset_type: 'SERIALIZED', status: 'ASSIGNED',
      item_id: null, facility_id: fac0, department_id: dep0,
      current_custodian_user_id: u1,
      acquisition_cost: 2100.00, acquisition_date: '2024-03-01', last_audit_date: '2025-01-10',
      disposal_at: null, controlled: 1, high_value: 1,
      notes: 'Assigned to ops supervisor — quarterly review due', created_by_user_id: u0,
      created_at: d(-90), updated_at: d(-5)
    },
    {
      id: 'asset_seed_002', tenant_id: tenantId, asset_no: 'ASSET-0002',
      name: 'Barcode Scanner — Warehouse', description: 'Handheld scanner for receiving dock',
      category: 'Equipment', subcategory: 'Scanning', serial_number: 'SN-BCR-2024-007',
      asset_type: 'SERIALIZED', status: 'IN_TRANSFER',
      item_id: null, facility_id: fac0, department_id: dep1,
      current_custodian_user_id: u2,
      acquisition_cost: 850.00, acquisition_date: '2024-06-15', last_audit_date: null,
      disposal_at: null, controlled: 0, high_value: 0,
      notes: 'Transfer pending to North Stock Yard', created_by_user_id: u0,
      created_at: d(-60), updated_at: d(-2)
    },
    {
      id: 'asset_seed_003', tenant_id: tenantId, asset_no: 'ASSET-0003',
      name: 'Secure Tool Kit — Maintenance', description: 'Controlled tool kit for maintenance operations',
      category: 'Tools', subcategory: 'Controlled Tools', serial_number: 'SN-TLK-2023-004',
      asset_type: 'CONTROLLED', status: 'AVAILABLE',
      item_id: null, facility_id: fac0, department_id: dep0,
      current_custodian_user_id: null,
      acquisition_cost: 480.00, acquisition_date: '2023-09-10', last_audit_date: '2025-02-28',
      disposal_at: null, controlled: 1, high_value: 0,
      notes: 'Controlled item — sign-out required', created_by_user_id: u0,
      created_at: d(-180), updated_at: d(-30)
    },
    {
      id: 'asset_seed_004', tenant_id: tenantId, asset_no: 'ASSET-0004',
      name: 'Tablet — Inventory Capture', description: 'Tablet used for cycle count and inventory capture',
      category: 'Computing', subcategory: 'Tablets', serial_number: 'SN-TAB-2024-002',
      asset_type: 'SERIALIZED', status: 'RETURN_PENDING',
      item_id: null, facility_id: fac1, department_id: dep2,
      current_custodian_user_id: u3,
      acquisition_cost: 650.00, acquisition_date: '2024-04-20', last_audit_date: null,
      disposal_at: null, controlled: 0, high_value: 0,
      notes: 'Return requested — replacement unit ready', created_by_user_id: u0,
      created_at: d(-45), updated_at: d(-3)
    },
    {
      id: 'asset_seed_005', tenant_id: tenantId, asset_no: 'ASSET-0005',
      name: 'Label Printer — Dock Station', description: 'Thermal label printer at receiving dock',
      category: 'Equipment', subcategory: 'Printing', serial_number: 'SN-LPR-2023-011',
      asset_type: 'STANDARD', status: 'DAMAGED',
      item_id: null, facility_id: fac0, department_id: dep1,
      current_custodian_user_id: null,
      acquisition_cost: 340.00, acquisition_date: '2023-11-05', last_audit_date: null,
      disposal_at: null, controlled: 0, high_value: 0,
      notes: 'Damaged — paper jam caused motor failure', created_by_user_id: u0,
      created_at: d(-200), updated_at: d(-10)
    },
    {
      id: 'asset_seed_006', tenant_id: tenantId, asset_no: 'ASSET-0006',
      name: 'Server Rack Unit — Legacy', description: 'End-of-life server rack from 2019 infrastructure',
      category: 'IT Infrastructure', subcategory: 'Servers', serial_number: 'SN-SRV-2019-003',
      asset_type: 'STANDARD', status: 'DISPOSAL_PENDING',
      item_id: null, facility_id: fac0, department_id: dep0,
      current_custodian_user_id: null,
      acquisition_cost: 8200.00, acquisition_date: '2019-02-15', last_audit_date: '2024-12-01',
      disposal_at: null, controlled: 0, high_value: 1,
      notes: 'EOL — disposal approved pending final write-off', created_by_user_id: u0,
      created_at: d(-365), updated_at: d(-7)
    }
  ];

  const custodyEvents = [
    { id: 'ace_seed_001', tenant_id: tenantId, asset_id: 'asset_seed_001', event_type: 'REGISTERED', actor_user_id: u0, from_custodian_user_id: null, to_custodian_user_id: null, from_facility_id: null, to_facility_id: fac0, from_department_id: null, to_department_id: dep0, status_before: '', status_after: 'AVAILABLE', reference_id: '', reference_type: '', notes: 'Asset registered on receipt', created_at: d(-90) },
    { id: 'ace_seed_002', tenant_id: tenantId, asset_id: 'asset_seed_001', event_type: 'ASSIGNED', actor_user_id: u0, from_custodian_user_id: null, to_custodian_user_id: u1, from_facility_id: fac0, to_facility_id: fac0, from_department_id: dep0, to_department_id: dep0, status_before: 'AVAILABLE', status_after: 'ASSIGNED', reference_id: 'asgn_seed_001', reference_type: 'asset_assignment', notes: 'Assigned to ops supervisor', created_at: d(-85) },
    { id: 'ace_seed_003', tenant_id: tenantId, asset_id: 'asset_seed_002', event_type: 'REGISTERED', actor_user_id: u0, from_custodian_user_id: null, to_custodian_user_id: null, from_facility_id: null, to_facility_id: fac0, from_department_id: null, to_department_id: dep1, status_before: '', status_after: 'AVAILABLE', reference_id: '', reference_type: '', notes: 'Scanner registered', created_at: d(-60) },
    { id: 'ace_seed_004', tenant_id: tenantId, asset_id: 'asset_seed_002', event_type: 'ASSIGNED', actor_user_id: u0, from_custodian_user_id: null, to_custodian_user_id: u2, from_facility_id: fac0, to_facility_id: fac0, from_department_id: null, to_department_id: dep1, status_before: 'AVAILABLE', status_after: 'ASSIGNED', reference_id: 'asgn_seed_002', reference_type: 'asset_assignment', notes: 'Assigned to warehouse team', created_at: d(-55) },
    { id: 'ace_seed_005', tenant_id: tenantId, asset_id: 'asset_seed_002', event_type: 'TRANSFER_REQUESTED', actor_user_id: u2, from_custodian_user_id: u2, to_custodian_user_id: u3, from_facility_id: fac0, to_facility_id: fac1, from_department_id: dep1, to_department_id: dep2, status_before: 'ASSIGNED', status_after: 'IN_TRANSFER', reference_id: 'atr_seed_001', reference_type: 'asset_transfer_request', notes: 'Transfer to North Stock Yard team', created_at: d(-2) },
    { id: 'ace_seed_006', tenant_id: tenantId, asset_id: 'asset_seed_003', event_type: 'REGISTERED', actor_user_id: u0, from_custodian_user_id: null, to_custodian_user_id: null, from_facility_id: null, to_facility_id: fac0, from_department_id: null, to_department_id: dep0, status_before: '', status_after: 'AVAILABLE', reference_id: '', reference_type: '', notes: 'Tool kit registered as controlled asset', created_at: d(-180) },
    { id: 'ace_seed_007', tenant_id: tenantId, asset_id: 'asset_seed_004', event_type: 'REGISTERED', actor_user_id: u0, from_custodian_user_id: null, to_custodian_user_id: null, from_facility_id: null, to_facility_id: fac1, from_department_id: null, to_department_id: dep2, status_before: '', status_after: 'AVAILABLE', reference_id: '', reference_type: '', notes: 'Tablet registered', created_at: d(-45) },
    { id: 'ace_seed_008', tenant_id: tenantId, asset_id: 'asset_seed_004', event_type: 'ASSIGNED', actor_user_id: u0, from_custodian_user_id: null, to_custodian_user_id: u3, from_facility_id: fac1, to_facility_id: fac1, from_department_id: dep2, to_department_id: dep2, status_before: 'AVAILABLE', status_after: 'ASSIGNED', reference_id: 'asgn_seed_003', reference_type: 'asset_assignment', notes: 'Assigned for cycle count use', created_at: d(-40) },
    { id: 'ace_seed_009', tenant_id: tenantId, asset_id: 'asset_seed_004', event_type: 'RETURN_REQUESTED', actor_user_id: u3, from_custodian_user_id: u3, to_custodian_user_id: null, from_facility_id: fac1, to_facility_id: fac1, from_department_id: dep2, to_department_id: dep2, status_before: 'ASSIGNED', status_after: 'RETURN_PENDING', reference_id: 'aret_seed_001', reference_type: 'asset_return_request', notes: 'Returning tablet — replacement available', created_at: d(-3) },
    { id: 'ace_seed_010', tenant_id: tenantId, asset_id: 'asset_seed_005', event_type: 'REGISTERED', actor_user_id: u0, from_custodian_user_id: null, to_custodian_user_id: null, from_facility_id: null, to_facility_id: fac0, from_department_id: null, to_department_id: dep1, status_before: '', status_after: 'AVAILABLE', reference_id: '', reference_type: '', notes: 'Label printer registered', created_at: d(-200) },
    { id: 'ace_seed_011', tenant_id: tenantId, asset_id: 'asset_seed_005', event_type: 'DAMAGED', actor_user_id: u2, from_custodian_user_id: null, to_custodian_user_id: null, from_facility_id: fac0, to_facility_id: fac0, from_department_id: dep1, to_department_id: dep1, status_before: 'AVAILABLE', status_after: 'DAMAGED', reference_id: 'acr_seed_001', reference_type: 'asset_condition_report', notes: 'Paper jam caused motor failure', created_at: d(-10) },
    { id: 'ace_seed_012', tenant_id: tenantId, asset_id: 'asset_seed_006', event_type: 'REGISTERED', actor_user_id: u0, from_custodian_user_id: null, to_custodian_user_id: null, from_facility_id: null, to_facility_id: fac0, from_department_id: null, to_department_id: dep0, status_before: '', status_after: 'AVAILABLE', reference_id: '', reference_type: '', notes: 'Legacy server registered', created_at: d(-365) },
    { id: 'ace_seed_013', tenant_id: tenantId, asset_id: 'asset_seed_006', event_type: 'DISPOSAL_REQUESTED', actor_user_id: u1, from_custodian_user_id: null, to_custodian_user_id: null, from_facility_id: fac0, to_facility_id: fac0, from_department_id: dep0, to_department_id: dep0, status_before: 'AVAILABLE', status_after: 'DISPOSAL_PENDING', reference_id: 'adis_seed_001', reference_type: 'asset_disposal_request', notes: 'EOL — submitted for disposal approval', created_at: d(-7) }
  ];

  const assignments = [
    { id: 'asgn_seed_001', tenant_id: tenantId, asset_id: 'asset_seed_001', custodian_user_id: u1, department_id: dep0, facility_id: fac0, assigned_by_user_id: u0, assigned_at: d(-85), expected_return_at: null, return_requested_at: null, returned_at: null, status: 'ACTIVE', notes: 'Assigned to ops supervisor', created_at: d(-85), updated_at: d(-85) },
    { id: 'asgn_seed_002', tenant_id: tenantId, asset_id: 'asset_seed_002', custodian_user_id: u2, department_id: dep1, facility_id: fac0, assigned_by_user_id: u0, assigned_at: d(-55), expected_return_at: null, return_requested_at: null, returned_at: null, status: 'ACTIVE', notes: 'Warehouse team assignment', created_at: d(-55), updated_at: d(-2) },
    { id: 'asgn_seed_003', tenant_id: tenantId, asset_id: 'asset_seed_004', custodian_user_id: u3, department_id: dep2, facility_id: fac1, assigned_by_user_id: u0, assigned_at: d(-40), expected_return_at: null, return_requested_at: d(-3), returned_at: null, status: 'RETURN_PENDING', notes: 'Tablet for cycle count', created_at: d(-40), updated_at: d(-3) }
  ];

  const transferRequests = [
    { id: 'atr_seed_001', tenant_id: tenantId, asset_id: 'asset_seed_002', transfer_no: 'TRF-0001', from_custodian_user_id: u2, to_custodian_user_id: u3, from_facility_id: fac0, to_facility_id: fac1, from_department_id: dep1, to_department_id: dep2, requested_by_user_id: u2, approved_by_user_id: null, rejected_by_user_id: null, status: 'PENDING_APPROVAL', reason: 'Relocating scanner to North Stock Yard', approval_notes: '', notes: '', requested_at: d(-2), approved_at: null, transferred_at: null, cancelled_at: null, created_at: d(-2), updated_at: d(-2) }
  ];

  const returnRequests = [
    { id: 'aret_seed_001', tenant_id: tenantId, asset_id: 'asset_seed_004', assignment_id: 'asgn_seed_003', return_no: 'RET-0001', requested_by_user_id: u3, accepted_by_user_id: null, return_condition: 'GOOD', condition_notes: '', status: 'REQUESTED', requested_at: d(-3), accepted_at: null, notes: 'Returning — replacement tablet available', created_at: d(-3), updated_at: d(-3) }
  ];

  const conditionReports = [
    { id: 'acr_seed_001', tenant_id: tenantId, asset_id: 'asset_seed_005', report_no: 'CDR-0001', reported_by_user_id: u2, condition_type: 'DAMAGE', severity: 'HIGH', description: 'Paper jam caused motor failure — printer no longer functional', repair_cost_estimate: 220.00, evidence_ref: '', status: 'OPEN', resolved_by_user_id: null, resolved_at: null, notes: 'Dock unit out of service', created_at: d(-10), updated_at: d(-10) }
  ];

  const maintenanceCases = [
    { id: 'amnt_seed_001', tenant_id: tenantId, asset_id: 'asset_seed_003', case_no: 'MNT-0001', maintenance_type: 'PREVENTIVE', status: 'COMPLETED', opened_by_user_id: u0, closed_by_user_id: u1, description: 'Annual tool calibration and inspection', resolution: 'All tools calibrated — passed inspection', scheduled_at: d(-35), started_at: d(-33), completed_at: d(-31), notes: '', created_at: d(-35), updated_at: d(-31) }
  ];

  const disposalRequests = [
    { id: 'adis_seed_001', tenant_id: tenantId, asset_id: 'asset_seed_006', disposal_no: 'DIS-0001', requested_by_user_id: u1, approved_by_user_id: null, rejected_by_user_id: null, posted_by_user_id: null, status: 'APPROVAL_PENDING', reason: 'Asset reached end-of-life — hardware no longer serviceable', disposal_method: 'SCRAP', disposal_value: 0.00, approval_notes: '', rejection_notes: '', notes: 'Approved by IT director verbally — awaiting formal write-off', submitted_at: d(-7), approved_at: null, rejected_at: null, disposed_at: null, created_at: d(-7), updated_at: d(-7) }
  ];

  const evidenceLinks = [
    { id: 'ael_seed_001', tenant_id: tenantId, asset_id: 'asset_seed_001', event_id: 'ace_seed_002', evidence_type: 'DOCUMENT', description: 'Custody assignment form — ops supervisor sign-off', reference: 'FORM-2024-0312', added_by_user_id: u0, created_at: d(-85) },
    { id: 'ael_seed_002', tenant_id: tenantId, asset_id: 'asset_seed_005', event_id: 'ace_seed_011', evidence_type: 'PHOTO', description: 'Photo of damaged motor mechanism', reference: 'PHOTO-DMG-2025-001', added_by_user_id: u2, created_at: d(-10) },
    { id: 'ael_seed_003', tenant_id: tenantId, asset_id: 'asset_seed_006', event_id: 'ace_seed_013', evidence_type: 'DOCUMENT', description: 'IT EOL certification form', reference: 'IT-EOL-SRV-2025-003', added_by_user_id: u1, created_at: d(-7) }
  ];

  const lifeCycleSnapshots = [
    { id: 'als_seed_001', tenant_id: tenantId, snapshot_date: new Date(Date.now() - 86400000).toISOString().slice(0, 10), total_assets: 6, available: 1, assigned: 1, in_transfer: 1, return_pending: 1, damaged: 1, lost: 0, quarantined: 0, in_maintenance: 0, disposal_pending: 1, disposed: 0, high_value_assigned: 1, controlled_assigned: 1, created_at: now }
  ];

  return { assetRecords, custodyEvents, assignments, transferRequests, returnRequests, conditionReports, maintenanceCases, disposalRequests, evidenceLinks, lifeCycleSnapshots };
}
