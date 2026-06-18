import { execute, insert, newId, nowIso, selectAll, selectOne, transaction } from './db.js';

// ── Helpers ───────────────────────────────────────────────────────────────────

function nextPlanNo(tenantId) {
  const row = selectOne(
    `SELECT COALESCE(MAX(CAST(REPLACE(plan_no, 'CCP-', '') AS INTEGER)), 0) AS n
     FROM cycle_count_plans WHERE tenant_id = ?`,
    [tenantId]
  );
  return `CCP-${String((row?.n ?? 0) + 1).padStart(4, '0')}`;
}

function nextSessionNo(tenantId) {
  const row = selectOne(
    `SELECT COALESCE(MAX(CAST(REPLACE(session_no, 'CCS-', '') AS INTEGER)), 0) AS n
     FROM cycle_count_sessions WHERE tenant_id = ?`,
    [tenantId]
  );
  return `CCS-${String((row?.n ?? 0) + 1).padStart(4, '0')}`;
}

function nextRunNo(tenantId) {
  const row = selectOne(
    `SELECT COALESCE(MAX(CAST(REPLACE(id, 'invopt_', '') AS INTEGER)), 0) AS n
     FROM inventory_optimization_runs WHERE tenant_id = ?`,
    [tenantId]
  );
  return row?.n;
}

function requirePlan(tenantId, planId) {
  const plan = selectOne('SELECT * FROM cycle_count_plans WHERE tenant_id = ? AND id = ?', [tenantId, planId]);
  if (!plan) throw Object.assign(new Error('Cycle count plan not found'), { statusCode: 404 });
  return plan;
}

function requireSession(tenantId, sessionId) {
  const session = selectOne('SELECT * FROM cycle_count_sessions WHERE tenant_id = ? AND id = ?', [tenantId, sessionId]);
  if (!session) throw Object.assign(new Error('Cycle count session not found'), { statusCode: 404 });
  return session;
}

function requireVariance(tenantId, varianceId) {
  const variance = selectOne('SELECT * FROM inventory_variances WHERE tenant_id = ? AND id = ?', [tenantId, varianceId]);
  if (!variance) throw Object.assign(new Error('Inventory variance not found'), { statusCode: 404 });
  return variance;
}

function requireRecommendation(tenantId, recId) {
  const rec = selectOne('SELECT * FROM replenishment_recommendations WHERE tenant_id = ? AND id = ?', [tenantId, recId]);
  if (!rec) throw Object.assign(new Error('Recommendation not found'), { statusCode: 404 });
  return rec;
}

function requireItem(tenantId, itemId) {
  const item = selectOne('SELECT * FROM items WHERE tenant_id = ? AND id = ?', [tenantId, itemId]);
  if (!item) throw Object.assign(new Error('Item not found'), { statusCode: 404 });
  return item;
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

function varianceSeverity(variancePct, controlled) {
  if (controlled) return 'BLOCKER';
  const abs = Math.abs(variancePct);
  if (abs >= 20) return 'BLOCKER';
  if (abs >= 5) return 'WARNING';
  return 'INFO';
}

// ── Summary ───────────────────────────────────────────────────────────────────

export function getInvOptSummary(tenantId) {
  const snapshot = selectOne(
    'SELECT * FROM inventory_accuracy_snapshots WHERE tenant_id = ? ORDER BY snapshot_date DESC LIMIT 1',
    [tenantId]
  );
  const openVariances = selectOne(
    `SELECT COUNT(*) AS n FROM inventory_variances WHERE tenant_id = ? AND status IN ('OPEN','UNDER_REVIEW')`,
    [tenantId]
  )?.n ?? 0;
  const blockerVariances = selectOne(
    `SELECT COUNT(*) AS n FROM inventory_variances WHERE tenant_id = ? AND severity = 'BLOCKER' AND status IN ('OPEN','UNDER_REVIEW')`,
    [tenantId]
  )?.n ?? 0;
  const controlledVariances = selectOne(
    `SELECT COUNT(*) AS n FROM inventory_variances WHERE tenant_id = ? AND controlled = 1 AND status IN ('OPEN','UNDER_REVIEW')`,
    [tenantId]
  )?.n ?? 0;
  const cycleDue = selectOne(
    `SELECT COUNT(*) AS n FROM cycle_count_plans WHERE tenant_id = ? AND status IN ('SCHEDULED','IN_PROGRESS','REVIEW_PENDING')`,
    [tenantId]
  )?.n ?? 0;
  const openRecs = selectOne(
    `SELECT COUNT(*) AS n FROM replenishment_recommendations WHERE tenant_id = ? AND status = 'OPEN'`,
    [tenantId]
  )?.n ?? 0;
  const reorderRisks = selectOne(
    `SELECT COUNT(*) AS n FROM replenishment_recommendations WHERE tenant_id = ? AND status = 'OPEN'
     AND recommendation_type IN ('REORDER','EXPEDITE_PO')`,
    [tenantId]
  )?.n ?? 0;
  const stockoutRisks = selectOne(
    `SELECT COUNT(*) AS n FROM replenishment_recommendations WHERE tenant_id = ? AND status = 'OPEN'
     AND priority = 'CRITICAL'`,
    [tenantId]
  )?.n ?? 0;
  return {
    total_items: snapshot?.total_items ?? 0,
    accuracyPct: snapshot?.accuracy_pct ?? null,
    openVariances,
    blockerVariances,
    controlledVariances,
    cycleDue,
    openRecs,
    reorderRisks,
    stockoutRisks,
    lastSnapshot: snapshot?.snapshot_date ?? null
  };
}

// ── Cycle Count Plans ─────────────────────────────────────────────────────────

export function listCycleCountPlans(tenantId, filters = {}) {
  const status = String(filters.status || '').trim();
  const whereStatus = status ? ' AND ccp.status = ?' : '';
  const params = [tenantId, ...(status ? [status] : [])];
  return selectAll(
    `SELECT ccp.*, f.name AS facility_name,
            u.name AS created_by_name,
            (SELECT COUNT(*) FROM cycle_count_plan_lines l WHERE l.plan_id = ccp.id) AS line_count
     FROM cycle_count_plans ccp
     LEFT JOIN facilities f ON f.id = ccp.facility_id
     LEFT JOIN users u ON u.id = ccp.created_by_user_id
     WHERE ccp.tenant_id = ?${whereStatus}
     ORDER BY ccp.created_at DESC LIMIT 200`,
    params
  );
}

export function createCycleCountPlan(tenantId, userId, body) {
  const title = String(body.title || '').trim();
  if (!title) throw Object.assign(new Error('title is required'), { statusCode: 400 });
  const facilityId = String(body.facilityId || body.facility_id || '').trim() || null;
  const description = String(body.description || '').trim();
  const scopeType = String(body.scopeType || body.scope_type || 'FULL').toUpperCase();
  const notes = String(body.notes || '').trim();

  const id = newId('ccp');
  const planNo = nextPlanNo(tenantId);
  const now = nowIso();
  return transaction(() => {
    insert('cycle_count_plans', {
      id, tenant_id: tenantId, plan_no: planNo, title, description,
      status: 'DRAFT', facility_id: facilityId, scope_type: scopeType,
      notes, created_by_user_id: userId, created_at: now, updated_at: now
    });
    writeAudit(tenantId, userId, 'CREATE_CYCLE_COUNT_PLAN', 'cycle_count_plan', id, `Plan ${planNo}: ${title}`, null, { id, planNo, title });
    return selectOne('SELECT * FROM cycle_count_plans WHERE id = ?', [id]);
  });
}

export function getCycleCountPlanDetail(tenantId, planId) {
  const plan = requirePlan(tenantId, planId);
  const lines = selectAll(
    `SELECT l.*, i.name AS item_name, i.sku, i.controlled,
            b.code AS bin_code
     FROM cycle_count_plan_lines l
     JOIN items i ON i.id = l.item_id
     LEFT JOIN bins b ON b.id = l.bin_id
     WHERE l.tenant_id = ? AND l.plan_id = ?
     ORDER BY i.name ASC`,
    [tenantId, planId]
  );
  const sessions = selectAll(
    'SELECT * FROM cycle_count_sessions WHERE tenant_id = ? AND plan_id = ? ORDER BY created_at DESC',
    [tenantId, planId]
  );
  return { plan, lines, sessions };
}

export function updateCycleCountPlan(tenantId, userId, planId, body) {
  const plan = requirePlan(tenantId, planId);
  if (!['DRAFT'].includes(plan.status)) throw Object.assign(new Error('Only DRAFT plans can be updated'), { statusCode: 409 });
  const title = String(body.title || plan.title).trim();
  const description = String(body.description ?? plan.description).trim();
  const notes = String(body.notes ?? plan.notes).trim();
  execute(
    'UPDATE cycle_count_plans SET title=?, description=?, notes=?, updated_at=? WHERE id=? AND tenant_id=?',
    [title, description, notes, nowIso(), planId, tenantId]
  );
  writeAudit(tenantId, userId, 'UPDATE_CYCLE_COUNT_PLAN', 'cycle_count_plan', planId, `Updated plan ${plan.plan_no}`, plan, { title, description, notes });
  return selectOne('SELECT * FROM cycle_count_plans WHERE id = ?', [planId]);
}

export function scheduleCycleCountPlan(tenantId, userId, planId, body) {
  const plan = requirePlan(tenantId, planId);
  if (!['DRAFT'].includes(plan.status)) throw Object.assign(new Error('Only DRAFT plans can be scheduled'), { statusCode: 409 });
  const scheduledDate = String(body.scheduledDate || body.scheduled_date || '').trim() || null;
  execute(
    'UPDATE cycle_count_plans SET status=?, scheduled_date=?, updated_at=? WHERE id=? AND tenant_id=?',
    ['SCHEDULED', scheduledDate, nowIso(), planId, tenantId]
  );
  writeAudit(tenantId, userId, 'SCHEDULE_CYCLE_COUNT_PLAN', 'cycle_count_plan', planId, `Scheduled plan ${plan.plan_no} for ${scheduledDate ?? 'TBD'}`, plan, { status: 'SCHEDULED', scheduledDate });
  return selectOne('SELECT * FROM cycle_count_plans WHERE id = ?', [planId]);
}

export function startCycleCountPlan(tenantId, userId, planId) {
  const plan = requirePlan(tenantId, planId);
  if (!['DRAFT', 'SCHEDULED'].includes(plan.status)) throw Object.assign(new Error('Only DRAFT or SCHEDULED plans can be started'), { statusCode: 409 });
  const now = nowIso();
  execute(
    'UPDATE cycle_count_plans SET status=?, started_at=?, updated_at=? WHERE id=? AND tenant_id=?',
    ['IN_PROGRESS', now, now, planId, tenantId]
  );
  writeAudit(tenantId, userId, 'START_CYCLE_COUNT_PLAN', 'cycle_count_plan', planId, `Started plan ${plan.plan_no}`, plan, { status: 'IN_PROGRESS' });
  return selectOne('SELECT * FROM cycle_count_plans WHERE id = ?', [planId]);
}

export function cancelCycleCountPlan(tenantId, userId, planId, body) {
  const plan = requirePlan(tenantId, planId);
  if (['POSTED', 'CANCELLED'].includes(plan.status)) throw Object.assign(new Error('Posted or already cancelled plans cannot be cancelled'), { statusCode: 409 });
  const now = nowIso();
  execute(
    'UPDATE cycle_count_plans SET status=?, cancelled_at=?, cancelled_by_user_id=?, notes=?, updated_at=? WHERE id=? AND tenant_id=?',
    ['CANCELLED', now, userId, String(body?.reason || body?.notes || plan.notes).trim(), now, planId, tenantId]
  );
  writeAudit(tenantId, userId, 'CANCEL_CYCLE_COUNT_PLAN', 'cycle_count_plan', planId, `Cancelled plan ${plan.plan_no}`, plan, { status: 'CANCELLED' });
  return selectOne('SELECT * FROM cycle_count_plans WHERE id = ?', [planId]);
}

export function addPlanLine(tenantId, userId, planId, body) {
  const plan = requirePlan(tenantId, planId);
  if (!['DRAFT', 'SCHEDULED'].includes(plan.status)) throw Object.assign(new Error('Lines can only be added to DRAFT or SCHEDULED plans'), { statusCode: 409 });
  const itemId = String(body.itemId || body.item_id || '').trim();
  if (!itemId) throw Object.assign(new Error('itemId is required'), { statusCode: 400 });
  requireItem(tenantId, itemId);
  const binId = String(body.binId || body.bin_id || '').trim() || null;
  const expectedQty = Math.max(0, Number(body.expectedQty ?? body.expected_qty ?? 0));
  const id = newId('ccpl');
  const now = nowIso();
  insert('cycle_count_plan_lines', {
    id, tenant_id: tenantId, plan_id: planId, item_id: itemId,
    bin_id: binId, expected_qty: expectedQty, status: 'PENDING',
    notes: '', created_at: now, updated_at: now
  });
  writeAudit(tenantId, userId, 'ADD_PLAN_LINE', 'cycle_count_plan_line', id, `Added line for item ${itemId} to plan ${plan.plan_no}`, null, { itemId, binId, expectedQty });
  return selectOne('SELECT * FROM cycle_count_plan_lines WHERE id = ?', [id]);
}

export function updatePlanLine(tenantId, userId, planId, lineId, body) {
  requirePlan(tenantId, planId);
  const line = selectOne('SELECT * FROM cycle_count_plan_lines WHERE tenant_id=? AND plan_id=? AND id=?', [tenantId, planId, lineId]);
  if (!line) throw Object.assign(new Error('Plan line not found'), { statusCode: 404 });
  const expectedQty = body.expectedQty !== undefined ? Math.max(0, Number(body.expectedQty)) : line.expected_qty;
  const notes = body.notes !== undefined ? String(body.notes).trim() : line.notes;
  execute(
    'UPDATE cycle_count_plan_lines SET expected_qty=?, notes=?, updated_at=? WHERE id=? AND tenant_id=?',
    [expectedQty, notes, nowIso(), lineId, tenantId]
  );
  writeAudit(tenantId, userId, 'UPDATE_PLAN_LINE', 'cycle_count_plan_line', lineId, `Updated line ${lineId}`, line, { expectedQty, notes });
  return selectOne('SELECT * FROM cycle_count_plan_lines WHERE id = ?', [lineId]);
}

// ── Count Sessions ────────────────────────────────────────────────────────────

export function createCountSession(tenantId, userId, planId, body) {
  const plan = requirePlan(tenantId, planId);
  if (!['IN_PROGRESS'].includes(plan.status)) throw Object.assign(new Error('Sessions can only be created for IN_PROGRESS plans'), { statusCode: 409 });

  return transaction(() => {
    const id = newId('ccs');
    const sessionNo = nextSessionNo(tenantId);
    const now = nowIso();
    insert('cycle_count_sessions', {
      id, tenant_id: tenantId, plan_id: planId,
      session_no: sessionNo, status: 'OPEN',
      counted_by_user_id: userId,
      notes: String(body?.notes || '').trim(),
      created_at: now, updated_at: now
    });
    const planLines = selectAll('SELECT * FROM cycle_count_plan_lines WHERE plan_id=? AND tenant_id=?', [planId, tenantId]);
    for (const line of planLines) {
      const balRow = selectOne('SELECT COALESCE(SUM(on_hand),0) AS qty FROM stock_balances WHERE tenant_id=? AND item_id=?', [tenantId, line.item_id]);
      const expectedQty = balRow?.qty ?? line.expected_qty;
      insert('cycle_count_session_lines', {
        id: newId('ccsl'),
        tenant_id: tenantId,
        session_id: id,
        plan_line_id: line.id,
        item_id: line.item_id,
        bin_id: line.bin_id,
        expected_qty: expectedQty,
        counted_qty: null,
        variance_qty: null,
        variance_pct: null,
        status: 'PENDING',
        counted_at: null,
        counted_by_user_id: null,
        notes: '',
        created_at: now,
        updated_at: now
      });
    }
    writeAudit(tenantId, userId, 'CREATE_COUNT_SESSION', 'cycle_count_session', id, `Session ${sessionNo} created for plan ${plan.plan_no}`, null, { id, sessionNo, planId });
    return selectOne('SELECT * FROM cycle_count_sessions WHERE id = ?', [id]);
  });
}

export function getCountSessionDetail(tenantId, sessionId) {
  const session = requireSession(tenantId, sessionId);
  const lines = selectAll(
    `SELECT l.*, i.name AS item_name, i.sku, i.controlled, b.code AS bin_code
     FROM cycle_count_session_lines l
     JOIN items i ON i.id = l.item_id
     LEFT JOIN bins b ON b.id = l.bin_id
     WHERE l.tenant_id = ? AND l.session_id = ?
     ORDER BY i.name ASC`,
    [tenantId, sessionId]
  );
  const variances = selectAll(
    'SELECT * FROM inventory_variances WHERE tenant_id=? AND session_id=? ORDER BY severity DESC, created_at DESC',
    [tenantId, sessionId]
  );
  return { session, lines, variances };
}

export function countSessionLine(tenantId, userId, sessionId, body) {
  const session = requireSession(tenantId, sessionId);
  if (!['OPEN'].includes(session.status)) throw Object.assign(new Error('Only OPEN sessions can accept counts'), { statusCode: 409 });
  const lineId = String(body.lineId || body.line_id || '').trim();
  if (!lineId) throw Object.assign(new Error('lineId is required'), { statusCode: 400 });
  const line = selectOne('SELECT * FROM cycle_count_session_lines WHERE tenant_id=? AND session_id=? AND id=?', [tenantId, sessionId, lineId]);
  if (!line) throw Object.assign(new Error('Session line not found'), { statusCode: 404 });
  const countedQty = Math.max(0, Number(body.countedQty ?? body.counted_qty ?? 0));
  const varianceQty = countedQty - line.expected_qty;
  const variancePct = line.expected_qty !== 0 ? (varianceQty / line.expected_qty) * 100 : (countedQty !== 0 ? 100 : 0);
  const hasVariance = Math.abs(varianceQty) > 0;
  const now = nowIso();
  return transaction(() => {
    execute(
      `UPDATE cycle_count_session_lines
       SET counted_qty=?, variance_qty=?, variance_pct=?, status=?, counted_at=?, counted_by_user_id=?, updated_at=?
       WHERE id=? AND tenant_id=?`,
      [countedQty, varianceQty, variancePct, hasVariance ? 'VARIANCE' : 'COUNTED', now, userId, now, lineId, tenantId]
    );
    if (hasVariance) {
      const item = requireItem(tenantId, line.item_id);
      const severity = varianceSeverity(variancePct, item.controlled || item.restricted || 0);
      const varianceId = newId('var');
      insert('inventory_variances', {
        id: varianceId,
        tenant_id: tenantId,
        session_id: sessionId,
        session_line_id: lineId,
        item_id: line.item_id,
        bin_id: line.bin_id,
        expected_qty: line.expected_qty,
        counted_qty: countedQty,
        variance_qty: varianceQty,
        variance_pct: variancePct,
        severity,
        status: 'OPEN',
        controlled: item.controlled || item.restricted || 0,
        waiver_reason: '',
        notes: '',
        created_at: now,
        updated_at: now
      });
      writeAudit(tenantId, userId, 'VARIANCE_DETECTED', 'inventory_variance', varianceId,
        `Variance ${varianceQty > 0 ? '+' : ''}${varianceQty.toFixed(2)} for item ${item.name || item.sku}`, null, { varianceId, severity, varianceQty, variancePct });
    }
    writeAudit(tenantId, userId, 'COUNT_SESSION_LINE', 'cycle_count_session_line', lineId,
      `Counted qty ${countedQty} for line ${lineId} in session ${session.session_no}`, line, { countedQty, varianceQty, variancePct });
    return selectOne('SELECT * FROM cycle_count_session_lines WHERE id = ?', [lineId]);
  });
}

export function submitSessionForReview(tenantId, userId, sessionId, body) {
  const session = requireSession(tenantId, sessionId);
  if (!['OPEN'].includes(session.status)) throw Object.assign(new Error('Only OPEN sessions can be submitted'), { statusCode: 409 });
  const now = nowIso();
  execute(
    'UPDATE cycle_count_sessions SET status=?, submitted_at=?, notes=?, updated_at=? WHERE id=? AND tenant_id=?',
    ['REVIEW_PENDING', now, String(body?.notes || session.notes).trim(), now, sessionId, tenantId]
  );
  execute(
    'UPDATE cycle_count_plans SET status=? WHERE id=? AND tenant_id=? AND status=?',
    ['REVIEW_PENDING', session.plan_id, tenantId, 'IN_PROGRESS']
  );
  writeAudit(tenantId, userId, 'SUBMIT_SESSION_REVIEW', 'cycle_count_session', sessionId, `Session ${session.session_no} submitted for review`, session, { status: 'REVIEW_PENDING' });
  return selectOne('SELECT * FROM cycle_count_sessions WHERE id = ?', [sessionId]);
}

export function approveCountSession(tenantId, userId, sessionId, body) {
  const session = requireSession(tenantId, sessionId);
  if (!['REVIEW_PENDING'].includes(session.status)) throw Object.assign(new Error('Only REVIEW_PENDING sessions can be approved'), { statusCode: 409 });
  const blockerVariances = selectAll(
    `SELECT id FROM inventory_variances WHERE tenant_id=? AND session_id=? AND severity='BLOCKER' AND status NOT IN ('APPROVED','WAIVED','POSTED')`,
    [tenantId, sessionId]
  );
  if (blockerVariances.length > 0) {
    throw Object.assign(new Error(`Cannot approve session: ${blockerVariances.length} BLOCKER variance(s) must be approved or waived first`), { statusCode: 409 });
  }
  const now = nowIso();
  execute(
    'UPDATE cycle_count_sessions SET status=?, approved_at=?, approved_by_user_id=?, reviewed_by_user_id=?, updated_at=? WHERE id=? AND tenant_id=?',
    ['APPROVED', now, userId, userId, now, sessionId, tenantId]
  );
  writeAudit(tenantId, userId, 'APPROVE_COUNT_SESSION', 'cycle_count_session', sessionId, `Session ${session.session_no} approved`, session, { status: 'APPROVED' });
  return selectOne('SELECT * FROM cycle_count_sessions WHERE id = ?', [sessionId]);
}

export function postCountSession(tenantId, userId, sessionId, body) {
  const session = requireSession(tenantId, sessionId);
  if (!['APPROVED'].includes(session.status)) throw Object.assign(new Error('Only APPROVED sessions can be posted'), { statusCode: 409 });
  if (session.posted_at) return selectOne('SELECT * FROM cycle_count_sessions WHERE id = ?', [sessionId]);

  const plan = session.plan_id ? selectOne('SELECT facility_id FROM cycle_count_plans WHERE id = ?', [session.plan_id]) : null;
  const facilityId = plan?.facility_id || selectOne('SELECT id FROM facilities WHERE tenant_id = ? LIMIT 1', [tenantId])?.id;
  const performer = selectOne('SELECT department_id FROM users WHERE id = ?', [userId]);
  const departmentId = performer?.department_id || selectOne('SELECT id FROM departments WHERE tenant_id = ? LIMIT 1', [tenantId])?.id;

  const variances = selectAll(
    `SELECT v.*, i.name AS item_name FROM inventory_variances v
     JOIN items i ON i.id = v.item_id
     WHERE v.tenant_id=? AND v.session_id=? AND v.status='APPROVED'`,
    [tenantId, sessionId]
  );
  const now = nowIso();
  return transaction(() => {
    for (const variance of variances) {
      const currentBalance = selectOne(
        'SELECT COALESCE(SUM(on_hand),0) AS qty FROM stock_balances WHERE tenant_id=? AND item_id=?',
        [tenantId, variance.item_id]
      )?.qty ?? 0;
      const adjustment = variance.counted_qty - variance.expected_qty;
      const newBalance = Math.max(0, currentBalance + adjustment);
      execute(
        'UPDATE stock_balances SET on_hand=?, updated_at=? WHERE tenant_id=? AND item_id=?',
        [newBalance, now, tenantId, variance.item_id]
      );
      const movId = newId('mov');
      insert('stock_movements', {
        id: movId,
        tenant_id: tenantId,
        item_id: variance.item_id,
        facility_id: facilityId,
        bin_id: variance.bin_id || null,
        movement_type: 'ADJUSTMENT',
        quantity: adjustment,
        before_quantity: currentBalance,
        after_quantity: newBalance,
        reference_type: 'cycle_count_session',
        reference_id: sessionId,
        performed_by_user_id: userId,
        department_id: departmentId,
        lot_no: '',
        serial_no: '',
        posted_by_user_id: userId,
        note: `Cycle count adjustment from session ${session.session_no}`,
        created_at: now
      });
      execute(
        'UPDATE inventory_variances SET status=?, posted_at=?, posted_by_user_id=?, stock_movement_id=?, updated_at=? WHERE id=? AND tenant_id=?',
        ['POSTED', now, userId, movId, now, variance.id, tenantId]
      );
      writeAudit(tenantId, userId, 'POST_VARIANCE_ADJUSTMENT', 'inventory_variance', variance.id,
        `Stock adjusted by ${adjustment > 0 ? '+' : ''}${adjustment} for ${variance.item_name}`, null, { adjustment, newBalance });
    }
    execute(
      'UPDATE cycle_count_sessions SET status=?, posted_at=?, posted_by_user_id=?, updated_at=? WHERE id=? AND tenant_id=?',
      ['POSTED', now, userId, now, sessionId, tenantId]
    );
    execute(
      'UPDATE cycle_count_plans SET status=?, posted_at=?, posted_by_user_id=?, completed_at=?, updated_at=? WHERE id=? AND tenant_id=?',
      ['POSTED', now, userId, now, now, session.plan_id, tenantId]
    );
    writeAudit(tenantId, userId, 'POST_COUNT_SESSION', 'cycle_count_session', sessionId,
      `Session ${session.session_no} posted — ${variances.length} variance adjustment(s) applied`, session, { status: 'POSTED', adjustmentsApplied: variances.length });
    return selectOne('SELECT * FROM cycle_count_sessions WHERE id = ?', [sessionId]);
  });
}

// ── Variances ─────────────────────────────────────────────────────────────────

export function listVariances(tenantId, filters = {}) {
  const status = String(filters.status || '').trim();
  const severity = String(filters.severity || '').trim();
  const whereStatus = status ? ' AND v.status = ?' : '';
  const whereSeverity = severity ? ' AND v.severity = ?' : '';
  const params = [tenantId, ...(status ? [status] : []), ...(severity ? [severity] : [])];
  return selectAll(
    `SELECT v.*, i.name AS item_name, i.sku, i.controlled,
            b.code AS bin_code, s.session_no
     FROM inventory_variances v
     JOIN items i ON i.id = v.item_id
     LEFT JOIN bins b ON b.id = v.bin_id
     LEFT JOIN cycle_count_sessions s ON s.id = v.session_id
     WHERE v.tenant_id = ?${whereStatus}${whereSeverity}
     ORDER BY v.severity DESC, v.created_at DESC LIMIT 500`,
    params
  );
}

export function getVarianceDetail(tenantId, varianceId) {
  const variance = requireVariance(tenantId, varianceId);
  const item = selectOne('SELECT * FROM items WHERE id = ?', [variance.item_id]);
  const session = variance.session_id
    ? selectOne('SELECT * FROM cycle_count_sessions WHERE id = ?', [variance.session_id])
    : null;
  return { variance, item, session };
}

export function approveVariance(tenantId, userId, varianceId, body) {
  const variance = requireVariance(tenantId, varianceId);
  if (!['OPEN', 'UNDER_REVIEW'].includes(variance.status)) throw Object.assign(new Error('Only OPEN or UNDER_REVIEW variances can be approved'), { statusCode: 409 });
  const now = nowIso();
  execute(
    'UPDATE inventory_variances SET status=?, approved_by_user_id=?, approved_at=?, updated_at=? WHERE id=? AND tenant_id=?',
    ['APPROVED', userId, now, now, varianceId, tenantId]
  );
  writeAudit(tenantId, userId, 'APPROVE_VARIANCE', 'inventory_variance', varianceId,
    `Variance ${varianceId} approved`, variance, { status: 'APPROVED' });
  return selectOne('SELECT * FROM inventory_variances WHERE id = ?', [varianceId]);
}

export function rejectVariance(tenantId, userId, varianceId, body) {
  const variance = requireVariance(tenantId, varianceId);
  if (!['OPEN', 'UNDER_REVIEW'].includes(variance.status)) throw Object.assign(new Error('Only OPEN or UNDER_REVIEW variances can be rejected'), { statusCode: 409 });
  const now = nowIso();
  execute(
    'UPDATE inventory_variances SET status=?, rejected_by_user_id=?, rejected_at=?, notes=?, updated_at=? WHERE id=? AND tenant_id=?',
    ['REJECTED', userId, now, String(body?.reason || body?.notes || variance.notes).trim(), now, varianceId, tenantId]
  );
  writeAudit(tenantId, userId, 'REJECT_VARIANCE', 'inventory_variance', varianceId,
    `Variance ${varianceId} rejected`, variance, { status: 'REJECTED' });
  return selectOne('SELECT * FROM inventory_variances WHERE id = ?', [varianceId]);
}

export function waiveVariance(tenantId, userId, varianceId, body) {
  const variance = requireVariance(tenantId, varianceId);
  if (!['OPEN', 'UNDER_REVIEW'].includes(variance.status)) throw Object.assign(new Error('Only OPEN or UNDER_REVIEW variances can be waived'), { statusCode: 409 });
  const reason = String(body?.reason || '').trim();
  if (!reason) throw Object.assign(new Error('A waiver reason is required'), { statusCode: 400 });
  const now = nowIso();
  execute(
    'UPDATE inventory_variances SET status=?, waiver_reason=?, waived_by_user_id=?, waived_at=?, updated_at=? WHERE id=? AND tenant_id=?',
    ['WAIVED', reason, userId, now, now, varianceId, tenantId]
  );
  writeAudit(tenantId, userId, 'WAIVE_VARIANCE', 'inventory_variance', varianceId,
    `Variance ${varianceId} waived: ${reason}`, variance, { status: 'WAIVED', reason });
  return selectOne('SELECT * FROM inventory_variances WHERE id = ?', [varianceId]);
}

// ── Replenishment Recommendations ─────────────────────────────────────────────

export function listRecommendations(tenantId, filters = {}) {
  const status = String(filters.status || '').trim();
  const recType = String(filters.type || '').trim();
  const whereStatus = status ? ' AND rr.status = ?' : '';
  const whereType = recType ? ' AND rr.recommendation_type = ?' : '';
  const params = [tenantId, ...(status ? [status] : []), ...(recType ? [recType] : [])];
  return selectAll(
    `SELECT rr.*, i.name AS item_name, i.sku, i.controlled,
            COALESCE((SELECT SUM(sb.on_hand) FROM stock_balances sb WHERE sb.tenant_id=rr.tenant_id AND sb.item_id=rr.item_id), 0) AS current_on_hand
     FROM replenishment_recommendations rr
     JOIN items i ON i.id = rr.item_id
     WHERE rr.tenant_id = ?${whereStatus}${whereType}
     ORDER BY
       CASE rr.priority WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END ASC,
       rr.created_at DESC
     LIMIT 200`,
    params
  );
}

export function generateRecommendations(tenantId, userId, body = {}) {
  const runId = newId('iorun');
  const now = nowIso();
  return transaction(() => {
    insert('inventory_optimization_runs', {
      id: runId,
      tenant_id: tenantId,
      run_type: 'REPLENISHMENT',
      status: 'RUNNING',
      items_analyzed: 0,
      recommendations_generated: 0,
      failure_reason: '',
      run_notes: '',
      created_by_user_id: userId,
      started_at: now,
      created_at: now,
      updated_at: now
    });

    const items = selectAll(
      `SELECT i.*, COALESCE(sb.on_hand, 0) AS on_hand,
              COALESCE(i.reorder_point, i.min_stock, 0) AS reorder_point,
              COALESCE(i.min_stock, 0) AS min_stock,
              COALESCE(i.max_stock, 0) AS max_stock
       FROM items i
       LEFT JOIN stock_balances sb ON sb.tenant_id=i.tenant_id AND sb.item_id=i.id
       WHERE i.tenant_id = ? AND UPPER(i.status) = 'ACTIVE'
       ORDER BY i.name ASC`,
      [tenantId]
    );

    const openPoLines = selectAll(
      `SELECT pol.item_id, SUM(pol.qty_ordered) AS open_qty
       FROM purchase_order_lines pol
       JOIN purchase_orders po ON po.id = pol.purchase_order_id
       WHERE pol.tenant_id = ? AND po.status IN ('APPROVED','ISSUED')
       GROUP BY pol.item_id`,
      [tenantId]
    );
    const openPoMap = new Map(openPoLines.map((r) => [r.item_id, r.open_qty]));

    const openRequests = selectAll(
      `SELECT rl.item_id, SUM(rl.qty_requested) AS demand_qty
       FROM request_lines rl
       JOIN internal_requests ir ON ir.id = rl.request_id
       WHERE rl.tenant_id = ? AND ir.status IN ('SUBMITTED','APPROVED')
       GROUP BY rl.item_id`,
      [tenantId]
    );
    const openReqMap = new Map(openRequests.map((r) => [r.item_id, r.demand_qty]));

    const recentMovements = selectAll(
      `SELECT item_id, SUM(ABS(quantity)) AS total_moved, COUNT(*) AS movement_count
       FROM stock_movements
       WHERE tenant_id = ? AND movement_type = 'ISSUE' AND created_at >= datetime('now', '-90 days')
       GROUP BY item_id`,
      [tenantId]
    );
    const movementMap = new Map(recentMovements.map((r) => [r.item_id, r]));

    let recsGenerated = 0;
    for (const item of items) {
      const onHand = Number(item.on_hand || 0);
      const reorderPoint = Number(item.reorder_point || 0);
      const maxStock = Number(item.max_stock || 0);
      const openPo = Number(openPoMap.get(item.id) || 0);
      const demand = Number(openReqMap.get(item.id) || 0);
      const movement = movementMap.get(item.id);
      const hasMovement = movement && Number(movement.movement_count || 0) > 0;
      const avgDailyIssue = hasMovement ? Number(movement.total_moved || 0) / 90 : 0;

      const availableQty = onHand + openPo;
      const daysOfSupply = avgDailyIssue > 0 ? availableQty / avgDailyIssue : null;
      const isStockout = onHand === 0 && demand > 0;
      const isLowStock = reorderPoint > 0 && onHand <= reorderPoint;
      const needsReorder = isLowStock && availableQty <= reorderPoint;

      let recType = null;
      let priority = 'MEDIUM';
      let reason = '';
      let suggestedQty = 0;

      if (isStockout) {
        recType = 'REORDER';
        priority = 'CRITICAL';
        reason = `Stockout: 0 on hand with ${demand.toFixed(0)} units in open requests`;
        suggestedQty = maxStock > 0 ? maxStock : reorderPoint * 2 || 10;
      } else if (needsReorder) {
        recType = 'REORDER';
        priority = daysOfSupply !== null && daysOfSupply < 7 ? 'HIGH' : 'MEDIUM';
        reason = `On hand (${onHand}) at or below reorder point (${reorderPoint})`;
        suggestedQty = maxStock > 0 ? Math.max(0, maxStock - onHand) : reorderPoint * 2 - onHand;
      } else if (openPo === 0 && isLowStock) {
        recType = 'EXPEDITE_PO';
        priority = 'HIGH';
        reason = `Low stock (${onHand}) with no open purchase orders`;
        suggestedQty = reorderPoint;
      }

      if (!recType) continue;

      const existing = selectOne(
        `SELECT id FROM replenishment_recommendations WHERE tenant_id=? AND item_id=? AND status='OPEN' AND recommendation_type=?`,
        [tenantId, item.id, recType]
      );
      if (existing) continue;

      const recId = newId('rec');
      const signals = {
        on_hand: onHand,
        open_po_qty: openPo,
        open_demand: demand,
        avg_daily_issue: avgDailyIssue,
        days_of_supply: daysOfSupply,
        reorder_point: reorderPoint,
        controlled: !!(item.controlled || item.restricted)
      };
      insert('replenishment_recommendations', {
        id: recId,
        tenant_id: tenantId,
        run_id: runId,
        item_id: item.id,
        recommendation_type: recType,
        status: 'OPEN',
        priority,
        on_hand_qty: onHand,
        reorder_point: reorderPoint,
        suggested_qty: Math.max(1, Math.round(suggestedQty)),
        reason,
        signal_details_json: JSON.stringify(signals),
        created_at: now,
        updated_at: now
      });
      recsGenerated++;
    }

    execute(
      'UPDATE inventory_optimization_runs SET status=?, completed_at=?, items_analyzed=?, recommendations_generated=?, updated_at=? WHERE id=?',
      ['COMPLETED', now, items.length, recsGenerated, now, runId]
    );
    writeAudit(tenantId, userId, 'GENERATE_REPLENISHMENT_RECS', 'inventory_optimization_run', runId,
      `Generated ${recsGenerated} recommendation(s) from ${items.length} items`, null, { runId, recsGenerated, itemsAnalyzed: items.length });
    return { runId, itemsAnalyzed: items.length, recommendationsGenerated: recsGenerated };
  });
}

export function approveRecommendation(tenantId, userId, recId, body) {
  const rec = requireRecommendation(tenantId, recId);
  if (!['OPEN', 'REVIEWED'].includes(rec.status)) throw Object.assign(new Error('Only OPEN or REVIEWED recommendations can be approved'), { statusCode: 409 });
  const now = nowIso();
  execute(
    'UPDATE replenishment_recommendations SET status=?, approved_by_user_id=?, approved_at=?, updated_at=? WHERE id=? AND tenant_id=?',
    ['APPROVED', userId, now, now, recId, tenantId]
  );
  writeAudit(tenantId, userId, 'APPROVE_RECOMMENDATION', 'replenishment_recommendation', recId,
    `Recommendation ${recId} approved`, rec, { status: 'APPROVED' });
  return selectOne('SELECT * FROM replenishment_recommendations WHERE id = ?', [recId]);
}

export function dismissRecommendation(tenantId, userId, recId, body) {
  const rec = requireRecommendation(tenantId, recId);
  if (!['OPEN', 'REVIEWED'].includes(rec.status)) throw Object.assign(new Error('Only OPEN or REVIEWED recommendations can be dismissed'), { statusCode: 409 });
  const reason = String(body?.reason || body?.dismissedReason || '').trim();
  const now = nowIso();
  execute(
    'UPDATE replenishment_recommendations SET status=?, dismissed_by_user_id=?, dismissed_at=?, dismissed_reason=?, updated_at=? WHERE id=? AND tenant_id=?',
    ['DISMISSED', userId, now, reason, now, recId, tenantId]
  );
  writeAudit(tenantId, userId, 'DISMISS_RECOMMENDATION', 'replenishment_recommendation', recId,
    `Recommendation ${recId} dismissed${reason ? ': ' + reason : ''}`, rec, { status: 'DISMISSED', reason });
  return selectOne('SELECT * FROM replenishment_recommendations WHERE id = ?', [recId]);
}

export function convertRecommendationToRequest(tenantId, userId, recId, body) {
  const rec = requireRecommendation(tenantId, recId);
  if (!['OPEN', 'REVIEWED', 'APPROVED'].includes(rec.status)) throw Object.assign(new Error('Only OPEN, REVIEWED, or APPROVED recommendations can be converted'), { statusCode: 409 });
  const item = requireItem(tenantId, rec.item_id);
  const now = nowIso();
  return transaction(() => {
    const requestId = newId('req');
    const reqRow = selectOne(
      `SELECT COALESCE(MAX(CAST(REPLACE(request_no,'REQ-','') AS INTEGER)),0) AS n FROM internal_requests WHERE tenant_id=?`,
      [tenantId]
    );
    const requestNo = `REQ-${String((reqRow?.n ?? 0) + 1).padStart(4, '0')}`;
    const requester = selectOne('SELECT department_id, facility_id FROM users WHERE id = ?', [userId]);
    const fallbackDept = selectOne('SELECT id FROM departments WHERE tenant_id = ? LIMIT 1', [tenantId]);
    const fallbackFac = selectOne('SELECT id FROM facilities WHERE tenant_id = ? LIMIT 1', [tenantId]);
    insert('internal_requests', {
      id: requestId,
      tenant_id: tenantId,
      request_no: requestNo,
      requested_by_user_id: userId,
      status: 'DRAFT',
      department_id: requester?.department_id || fallbackDept?.id,
      facility_id: requester?.facility_id || fallbackFac?.id,
      purpose: `Replenishment: ${item.name} — suggested qty: ${rec.suggested_qty}. ${rec.reason}`,
      priority: rec.priority === 'CRITICAL' || rec.priority === 'HIGH' ? 'HIGH' : 'NORMAL',
      audit_ref: '',
      created_at: now
    });
    const lineId = newId('reqline');
    insert('request_lines', {
      id: lineId,
      tenant_id: tenantId,
      request_id: requestId,
      item_id: rec.item_id,
      qty_requested: rec.suggested_qty,
      qty_issued: 0,
      status: 'PENDING'
    });
    execute(
      'UPDATE replenishment_recommendations SET status=?, converted_request_id=?, converted_at=?, updated_at=? WHERE id=? AND tenant_id=?',
      ['CONVERTED_TO_REQUEST', requestId, now, now, recId, tenantId]
    );
    writeAudit(tenantId, userId, 'CONVERT_REC_TO_REQUEST', 'replenishment_recommendation', recId,
      `Recommendation ${recId} converted to request ${requestNo} for ${item.name}`, rec, { requestId, requestNo, suggestedQty: rec.suggested_qty });
    return { recommendation: selectOne('SELECT * FROM replenishment_recommendations WHERE id = ?', [recId]), requestId, requestNo };
  });
}

// ── ABC Classification ────────────────────────────────────────────────────────

export function listClassifications(tenantId, filters = {}) {
  const classification = String(filters.classification || '').trim();
  const whereClass = classification ? ' AND ic.classification = ?' : '';
  const params = [tenantId, ...(classification ? [classification] : [])];
  return selectAll(
    `SELECT ic.*, i.name AS item_name, i.sku, i.controlled,
            COALESCE((SELECT SUM(sb.on_hand) FROM stock_balances sb WHERE sb.tenant_id=ic.tenant_id AND sb.item_id=ic.item_id), 0) AS on_hand
     FROM inventory_classifications ic
     JOIN items i ON i.id = ic.item_id
     WHERE ic.tenant_id = ?${whereClass}
     ORDER BY ic.classification ASC, ic.score DESC
     LIMIT 500`,
    params
  );
}

export function recalculateClassifications(tenantId, userId, body = {}) {
  const runId = newId('iorun');
  const now = nowIso();
  return transaction(() => {
    insert('inventory_optimization_runs', {
      id: runId,
      tenant_id: tenantId,
      run_type: 'CLASSIFICATION',
      status: 'RUNNING',
      items_analyzed: 0,
      recommendations_generated: 0,
      failure_reason: '',
      run_notes: '',
      created_by_user_id: userId,
      started_at: now,
      created_at: now,
      updated_at: now
    });

    const items = selectAll(
      `SELECT i.*, COALESCE(sb.on_hand, 0) AS on_hand
       FROM items i
       LEFT JOIN stock_balances sb ON sb.tenant_id=i.tenant_id AND sb.item_id=i.id
       WHERE i.tenant_id = ? AND UPPER(i.status) = 'ACTIVE'`,
      [tenantId]
    );

    const movements = selectAll(
      `SELECT item_id, SUM(ABS(quantity)) AS total_moved, COUNT(*) AS movement_count
       FROM stock_movements
       WHERE tenant_id = ? AND movement_type = 'ISSUE' AND created_at >= datetime('now', '-90 days')
       GROUP BY item_id`,
      [tenantId]
    );
    const movMap = new Map(movements.map((r) => [r.item_id, r]));

    const allValues = items.map((item) => Number(item.on_hand || 0));
    allValues.sort((a, b) => b - a);
    const maxValue = allValues[0] || 1;

    let classified = 0;
    for (const item of items) {
      const onHand = Number(item.on_hand || 0);
      const inventoryValue = onHand;
      const mov = movMap.get(item.id);
      const hasMovement = mov && Number(mov.movement_count || 0) >= 3;
      const totalMoved = Number(mov?.total_moved || 0);

      const valueScore = maxValue > 0 ? (inventoryValue / maxValue) * 40 : 0;
      const movementScore = hasMovement ? Math.min(40, (totalMoved / 100) * 40) : 0;
      const criticalityScore = (item.controlled || item.restricted) ? 20 : 0;
      const score = valueScore + movementScore + criticalityScore;

      let classification = 'C';
      if (score >= 60) classification = 'A';
      else if (score >= 25) classification = 'B';

      let reason = '';
      const parts = [];
      if (!hasMovement) parts.push('insufficient movement history (< 3 issues in 90 days)');
      if (criticalityScore > 0) parts.push('controlled/restricted item');
      if (valueScore >= 20) parts.push('high inventory value');
      else if (valueScore >= 5) parts.push('moderate inventory value');
      reason = parts.length > 0 ? parts.join('; ') : `Score ${score.toFixed(1)} from value+movement+criticality`;

      const existing = selectOne('SELECT id FROM inventory_classifications WHERE tenant_id=? AND item_id=?', [tenantId, item.id]);
      if (existing) {
        execute(
          `UPDATE inventory_classifications SET run_id=?, classification=?, score=?, reason=?,
           value_score=?, movement_score=?, criticality_score=?, insufficient_history=?, calculated_at=?, updated_at=?
           WHERE tenant_id=? AND item_id=?`,
          [runId, classification, score, reason, valueScore, movementScore, criticalityScore, hasMovement ? 0 : 1, now, now, tenantId, item.id]
        );
      } else {
        insert('inventory_classifications', {
          id: newId('cls'),
          tenant_id: tenantId,
          run_id: runId,
          item_id: item.id,
          classification,
          score,
          reason,
          value_score: valueScore,
          movement_score: movementScore,
          criticality_score: criticalityScore,
          insufficient_history: hasMovement ? 0 : 1,
          calculated_at: now,
          created_at: now,
          updated_at: now
        });
      }
      classified++;
    }

    execute(
      'UPDATE inventory_optimization_runs SET status=?, completed_at=?, items_analyzed=?, updated_at=? WHERE id=?',
      ['COMPLETED', now, classified, now, runId]
    );
    writeAudit(tenantId, userId, 'RECALCULATE_CLASSIFICATIONS', 'inventory_optimization_run', runId,
      `ABC classification recalculated for ${classified} items`, null, { runId, itemsClassified: classified });
    return { runId, itemsClassified: classified };
  });
}

// ── Accuracy Snapshots ────────────────────────────────────────────────────────

export function buildAccuracySnapshot(tenantId, userId) {
  const today = new Date().toISOString().slice(0, 10);
  const totalItems = selectOne('SELECT COUNT(*) AS n FROM items WHERE tenant_id=? AND status=?', [tenantId, 'active'])?.n ?? 0;
  const itemsCounted = selectOne(
    `SELECT COUNT(DISTINCT item_id) AS n FROM cycle_count_session_lines WHERE tenant_id=? AND status IN ('COUNTED','VARIANCE','APPROVED','POSTED')`,
    [tenantId]
  )?.n ?? 0;
  const itemsWithVariance = selectOne(
    `SELECT COUNT(DISTINCT item_id) AS n FROM inventory_variances WHERE tenant_id=? AND status NOT IN ('REJECTED','WAIVED')`,
    [tenantId]
  )?.n ?? 0;
  const itemsAccurate = Math.max(0, itemsCounted - itemsWithVariance);
  const accuracyPct = itemsCounted > 0 ? (itemsAccurate / itemsCounted) * 100 : null;
  const openVariances = selectOne(`SELECT COUNT(*) AS n FROM inventory_variances WHERE tenant_id=? AND status IN ('OPEN','UNDER_REVIEW')`, [tenantId])?.n ?? 0;
  const blockerVariances = selectOne(`SELECT COUNT(*) AS n FROM inventory_variances WHERE tenant_id=? AND severity='BLOCKER' AND status IN ('OPEN','UNDER_REVIEW')`, [tenantId])?.n ?? 0;
  const controlledVariances = selectOne(`SELECT COUNT(*) AS n FROM inventory_variances WHERE tenant_id=? AND controlled=1 AND status IN ('OPEN','UNDER_REVIEW')`, [tenantId])?.n ?? 0;
  const reorderRisks = selectOne(
    `SELECT COUNT(*) AS n FROM replenishment_recommendations WHERE tenant_id=? AND status='OPEN' AND recommendation_type IN ('REORDER','EXPEDITE_PO')`,
    [tenantId]
  )?.n ?? 0;
  const stockoutRisks = selectOne(
    `SELECT COUNT(*) AS n FROM replenishment_recommendations WHERE tenant_id=? AND status='OPEN' AND priority='CRITICAL'`,
    [tenantId]
  )?.n ?? 0;
  const snapshotId = newId('snap');
  execute(
    `INSERT INTO inventory_accuracy_snapshots
     (id, tenant_id, snapshot_date, total_items, items_counted, items_with_variance, items_accurate,
      accuracy_pct, open_variances, blocker_variances, controlled_variances, reorder_risks, stockout_risks, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(tenant_id, snapshot_date) DO UPDATE SET
       total_items=excluded.total_items, items_counted=excluded.items_counted,
       items_with_variance=excluded.items_with_variance, items_accurate=excluded.items_accurate,
       accuracy_pct=excluded.accuracy_pct, open_variances=excluded.open_variances,
       blocker_variances=excluded.blocker_variances, controlled_variances=excluded.controlled_variances,
       reorder_risks=excluded.reorder_risks, stockout_risks=excluded.stockout_risks`,
    [snapshotId, tenantId, today, totalItems, itemsCounted, itemsWithVariance, itemsAccurate,
     accuracyPct, openVariances, blockerVariances, controlledVariances, reorderRisks, stockoutRisks, nowIso()]
  );
  return selectOne('SELECT * FROM inventory_accuracy_snapshots WHERE tenant_id=? AND snapshot_date=?', [tenantId, today]);
}

// ── Seed rows ─────────────────────────────────────────────────────────────────

export function getInvOptSeedRows(tenantId, items = [], facilities = [], bins = [], users = []) {
  const adminUserId = users.find((u) => u.role === 'admin')?.id || null;
  const supervisorUserId = users.find((u) => u.role === 'supervisor')?.id || null;
  const now = nowIso();
  const itemA = items[0] || null;
  const itemB = items[1] || null;
  const itemC = items[2] || null;
  const facilityA = facilities[0] || null;
  const binA = bins[0] || null;

  if (!itemA || !itemB) return { cycleCountPlans: [], cycleCountPlanLines: [], cycleCountSessions: [],
    cycleCountSessionLines: [], inventoryVariances: [], replenishmentRecs: [], optimizationRuns: [],
    inventoryClassifications: [], accuracySnapshots: [] };

  const planId1 = `ccp_seed_plan_01_${tenantId}`;
  const planId2 = `ccp_seed_plan_02_${tenantId}`;
  const sessionId1 = `ccs_seed_session_01_${tenantId}`;
  const varId1 = `var_seed_01_${tenantId}`;
  const varId2 = `var_seed_controlled_01_${tenantId}`;
  const runId1 = `iorun_seed_01_${tenantId}`;
  const recId1 = `rec_seed_01_${tenantId}`;
  const recId2 = `rec_seed_02_${tenantId}`;
  const recId3 = `rec_seed_transfer_${tenantId}`;
  const clsId1 = `cls_seed_01_${tenantId}`;
  const clsId2 = `cls_seed_02_${tenantId}`;
  const clsId3 = `cls_seed_03_${tenantId}`;
  const snapId1 = `snap_seed_01_${tenantId}`;
  const planLineId1 = `ccpl_seed_01_${tenantId}`;
  const planLineId2 = `ccpl_seed_02_${tenantId}`;
  const sessionLineId1 = `ccsl_seed_01_${tenantId}`;
  const sessionLineId2 = `ccsl_seed_02_${tenantId}`;

  const today = new Date().toISOString().slice(0, 10);

  const cycleCountPlans = [
    {
      id: planId1, tenant_id: tenantId,
      plan_no: 'CCP-0001', title: 'Q2 Medical Supplies Cycle Count',
      description: 'Quarterly cycle count for medical supplies storage area',
      status: 'IN_PROGRESS',
      facility_id: facilityA?.id || null,
      scope_type: 'CATEGORY',
      scheduled_date: today,
      started_at: now,
      completed_at: null, approved_at: null, approved_by_user_id: null,
      posted_at: null, posted_by_user_id: null,
      cancelled_at: null, cancelled_by_user_id: null,
      notes: 'Focus on controlled medical items',
      created_by_user_id: adminUserId,
      created_at: now, updated_at: now
    },
    {
      id: planId2, tenant_id: tenantId,
      plan_no: 'CCP-0002', title: 'Annual Full Inventory Count',
      description: 'Annual full facility inventory count',
      status: 'SCHEDULED',
      facility_id: facilityA?.id || null,
      scope_type: 'FULL',
      scheduled_date: new Date(Date.now() + 30 * 86400000).toISOString().slice(0, 10),
      started_at: null, completed_at: null, approved_at: null, approved_by_user_id: null,
      posted_at: null, posted_by_user_id: null,
      cancelled_at: null, cancelled_by_user_id: null,
      notes: '',
      created_by_user_id: adminUserId,
      created_at: now, updated_at: now
    }
  ];

  const cycleCountPlanLines = [
    {
      id: planLineId1, tenant_id: tenantId, plan_id: planId1,
      item_id: itemA.id, bin_id: binA?.id || null,
      expected_qty: 100, status: 'VARIANCE', notes: '', created_at: now, updated_at: now
    },
    {
      id: planLineId2, tenant_id: tenantId, plan_id: planId1,
      item_id: itemB.id, bin_id: binA?.id || null,
      expected_qty: 50, status: 'PENDING', notes: '', created_at: now, updated_at: now
    }
  ];

  const cycleCountSessions = [
    {
      id: sessionId1, tenant_id: tenantId, plan_id: planId1,
      session_no: 'CCS-0001', status: 'REVIEW_PENDING',
      counted_by_user_id: adminUserId,
      reviewed_by_user_id: null, approved_by_user_id: null, posted_by_user_id: null,
      submitted_at: now, reviewed_at: null, approved_at: null, posted_at: null,
      notes: 'Count completed by Avery Grant',
      created_at: now, updated_at: now
    }
  ];

  const cycleCountSessionLines = [
    {
      id: sessionLineId1, tenant_id: tenantId, session_id: sessionId1,
      plan_line_id: planLineId1,
      item_id: itemA.id, bin_id: binA?.id || null,
      expected_qty: 100, counted_qty: 88, variance_qty: -12, variance_pct: -12,
      status: 'VARIANCE',
      counted_at: now, counted_by_user_id: adminUserId,
      notes: '', created_at: now, updated_at: now
    },
    {
      id: sessionLineId2, tenant_id: tenantId, session_id: sessionId1,
      plan_line_id: planLineId2,
      item_id: itemB.id, bin_id: binA?.id || null,
      expected_qty: 50, counted_qty: 50, variance_qty: 0, variance_pct: 0,
      status: 'COUNTED',
      counted_at: now, counted_by_user_id: adminUserId,
      notes: '', created_at: now, updated_at: now
    }
  ];

  const controlledItem = items.find((i) => i.controlled || i.restricted) || itemA;
  const inventoryVariances = [
    {
      id: varId1, tenant_id: tenantId,
      session_id: sessionId1, session_line_id: sessionLineId1,
      item_id: itemA.id, bin_id: binA?.id || null,
      expected_qty: 100, counted_qty: 88,
      variance_qty: -12, variance_pct: -12,
      severity: 'WARNING', status: 'OPEN',
      controlled: 0, waiver_reason: '',
      approved_by_user_id: null, approved_at: null,
      rejected_by_user_id: null, rejected_at: null,
      waived_by_user_id: null, waived_at: null,
      posted_at: null, posted_by_user_id: null,
      stock_movement_id: null, notes: '',
      created_at: now, updated_at: now
    },
    {
      id: varId2, tenant_id: tenantId,
      session_id: null, session_line_id: null,
      item_id: controlledItem.id, bin_id: binA?.id || null,
      expected_qty: 10, counted_qty: 7,
      variance_qty: -3, variance_pct: -30,
      severity: 'BLOCKER', status: 'OPEN',
      controlled: 1, waiver_reason: '',
      approved_by_user_id: null, approved_at: null,
      rejected_by_user_id: null, rejected_at: null,
      waived_by_user_id: null, waived_at: null,
      posted_at: null, posted_by_user_id: null,
      stock_movement_id: null,
      notes: 'Controlled item requires elevated approval',
      created_at: now, updated_at: now
    }
  ];

  const optimizationRuns = [
    {
      id: runId1, tenant_id: tenantId,
      run_type: 'REPLENISHMENT', status: 'COMPLETED',
      items_analyzed: items.length, recommendations_generated: 3,
      failure_reason: '', run_notes: '',
      created_by_user_id: adminUserId,
      started_at: now, completed_at: now,
      created_at: now, updated_at: now
    }
  ];

  const lowStockItem = itemC || itemA;
  const replenishmentRecs = [
    {
      id: recId1, tenant_id: tenantId, run_id: runId1,
      item_id: itemA.id,
      recommendation_type: 'REORDER',
      status: 'OPEN', priority: 'HIGH',
      on_hand_qty: 8, reorder_point: 20, suggested_qty: 50,
      reason: 'On hand (8) at or below reorder point (20)',
      signal_details_json: JSON.stringify({ on_hand: 8, reorder_point: 20, open_po_qty: 0 }),
      approved_by_user_id: null, approved_at: null,
      dismissed_by_user_id: null, dismissed_at: null, dismissed_reason: '',
      converted_request_id: null, converted_at: null,
      expires_at: null, created_at: now, updated_at: now
    },
    {
      id: recId2, tenant_id: tenantId, run_id: runId1,
      item_id: lowStockItem.id,
      recommendation_type: 'EXPEDITE_PO',
      status: 'OPEN', priority: 'MEDIUM',
      on_hand_qty: 0, reorder_point: 10, suggested_qty: 25,
      reason: 'Low stock (0) with no open purchase orders',
      signal_details_json: JSON.stringify({ on_hand: 0, reorder_point: 10, open_po_qty: 0 }),
      approved_by_user_id: null, approved_at: null,
      dismissed_by_user_id: null, dismissed_at: null, dismissed_reason: '',
      converted_request_id: null, converted_at: null,
      expires_at: null, created_at: now, updated_at: now
    },
    {
      id: recId3, tenant_id: tenantId, run_id: runId1,
      item_id: itemB.id,
      recommendation_type: 'TRANSFER',
      status: 'REVIEWED', priority: 'LOW',
      on_hand_qty: 5, reorder_point: 15, suggested_qty: 10,
      reason: 'Transfer from high-stock facility to cover reorder gap',
      signal_details_json: JSON.stringify({ on_hand: 5, reorder_point: 15 }),
      approved_by_user_id: supervisorUserId,
      approved_at: now,
      dismissed_by_user_id: null, dismissed_at: null, dismissed_reason: '',
      converted_request_id: null, converted_at: null,
      expires_at: null, created_at: now, updated_at: now
    }
  ];

  const inventoryClassifications = [
    {
      id: clsId1, tenant_id: tenantId, run_id: runId1,
      item_id: itemA.id, classification: 'A', score: 75,
      reason: 'High inventory value; controlled/restricted item',
      value_score: 35, movement_score: 20, criticality_score: 20,
      insufficient_history: 0, calculated_at: now, created_at: now, updated_at: now
    },
    {
      id: clsId2, tenant_id: tenantId, run_id: runId1,
      item_id: itemB.id, classification: 'B', score: 30,
      reason: 'Moderate inventory value',
      value_score: 20, movement_score: 10, criticality_score: 0,
      insufficient_history: 0, calculated_at: now, created_at: now, updated_at: now
    },
    ...(itemC ? [{
      id: clsId3, tenant_id: tenantId, run_id: runId1,
      item_id: itemC.id, classification: 'C', score: 5,
      reason: 'insufficient movement history (< 3 issues in 90 days)',
      value_score: 5, movement_score: 0, criticality_score: 0,
      insufficient_history: 1, calculated_at: now, created_at: now, updated_at: now
    }] : [])
  ];

  const accuracySnapshots = [
    {
      id: snapId1, tenant_id: tenantId,
      snapshot_date: today,
      total_items: items.length,
      items_counted: 2,
      items_with_variance: 1,
      items_accurate: 1,
      accuracy_pct: 50,
      open_variances: 2,
      blocker_variances: 1,
      controlled_variances: 1,
      reorder_risks: 2,
      stockout_risks: 0,
      created_at: now
    }
  ];

  return {
    cycleCountPlans,
    cycleCountPlanLines,
    cycleCountSessions,
    cycleCountSessionLines,
    inventoryVariances,
    replenishmentRecs,
    optimizationRuns,
    inventoryClassifications,
    accuracySnapshots
  };
}
