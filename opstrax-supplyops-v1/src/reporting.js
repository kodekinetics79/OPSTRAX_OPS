import { createHash } from 'node:crypto';
import { execute, insert, newId, nowIso, selectAll, selectOne, transaction } from './db.js';

const TENANT_REPORT_DEFINITIONS = [
  {
    report_key: 'inventory_stock_position',
    surface: 'TENANT',
    category: 'Operational Reports',
    title: 'Inventory Stock Position',
    description: 'Current stock, available quantity, and facility/bin posture for tenant inventory.',
    module_page: 'Inventory Control',
    required_feature: 'inventory_control'
  },
  {
    report_key: 'low_stock_reorder_risk',
    surface: 'TENANT',
    category: 'Operational Reports',
    title: 'Low Stock / Reorder Risk',
    description: 'Items at or below minimum stock with reorder posture and available balance.',
    module_page: 'Inventory Control',
    required_feature: 'inventory_control'
  },
  {
    report_key: 'warehouse_issue_activity',
    surface: 'TENANT',
    category: 'Operational Reports',
    title: 'Warehouse Issue Activity',
    description: 'Warehouse task and issue activity across the tenant.',
    module_page: 'Warehouse Workflows',
    required_feature: 'warehouse_workflows'
  },
  {
    report_key: 'internal_request_activity',
    surface: 'TENANT',
    category: 'Operational Reports',
    title: 'Internal Request Activity',
    description: 'Request lifecycle and departmental demand signals.',
    module_page: 'Request Center',
    required_feature: 'internal_storefront'
  },
  {
    report_key: 'receiving_activity',
    surface: 'TENANT',
    category: 'Operational Reports',
    title: 'Receiving Activity',
    description: 'Receive sessions, posted receipts, and exception posture.',
    module_page: 'Receiving Center',
    required_feature: 'receiving_core'
  },
  {
    report_key: 'procurement_pr_po_activity',
    surface: 'TENANT',
    category: 'Operational Reports',
    title: 'Procurement PR/PO Activity',
    description: 'Purchase request and purchase order lifecycle with approval posture.',
    module_page: 'Procurement Center',
    required_feature: 'procurement_purchasing'
  },
  {
    report_key: 'invoice_match_exceptions',
    surface: 'TENANT',
    category: 'Procure-to-Pay Intelligence',
    title: 'Procure-to-Pay Invoice Match Exceptions',
    description: 'Invoice extraction, matching, and exception posture for open items.',
    module_page: 'Invoice Intelligence',
    required_feature: 'procure_to_pay_intelligence'
  },
  {
    report_key: 'vendor_performance',
    surface: 'TENANT',
    category: 'Procurement Intelligence',
    title: 'Vendor / Supplier Performance',
    description: 'Supplier scorecard posture and risk signals.',
    module_page: 'Supplier Governance',
    required_feature: 'supplier_governance'
  },
  {
    report_key: 'finance_export_readiness',
    surface: 'TENANT',
    category: 'Finance Reports',
    title: 'Finance Export Readiness',
    description: 'Export validation posture, candidates, and blocked records.',
    module_page: 'Finance Export Hub',
    required_feature: 'finance_sync_export_hub'
  },
  {
    report_key: 'audit_trail_summary',
    surface: 'TENANT',
    category: 'Compliance Reports',
    title: 'Audit Trail Summary',
    description: 'Immutable audit activity across critical operational modules.',
    module_page: 'Audit Trail',
    required_feature: 'audit_black_box'
  },
  {
    report_key: 'evidence_coverage',
    surface: 'TENANT',
    category: 'Compliance Reports',
    title: 'Evidence Coverage',
    description: 'Evidence linked to workflow records and outstanding coverage gaps.',
    module_page: 'Evidence Vault',
    required_feature: 'documents_evidence_vault'
  },
  {
    report_key: 'offline_sync_conflicts',
    surface: 'TENANT',
    category: 'Operational Reports',
    title: 'Offline Sync Conflicts',
    description: 'Offline batches, replay posture, and conflict review signals.',
    module_page: 'Offline Sync',
    required_feature: 'offline_ops'
  },
  {
    report_key: 'device_trust_posture',
    surface: 'TENANT',
    category: 'Operational Reports',
    title: 'Device Trust Posture',
    description: 'Trusted, suspended, and revoked device posture for scan-driven workflows.',
    module_page: 'DeviceOps Center',
    required_feature: 'barcode_device_hub'
  },
  {
    report_key: 'inventory_accuracy_summary',
    surface: 'TENANT',
    category: 'Inventory Optimization',
    title: 'Inventory Accuracy Summary',
    description: 'Cycle count accuracy posture, open variances, and controlled-item variance signals.',
    module_page: 'Inventory Optimization',
    required_feature: 'inventory_optimization'
  },
  {
    report_key: 'cycle_count_variance_report',
    surface: 'TENANT',
    category: 'Inventory Optimization',
    title: 'Cycle Count Variance Report',
    description: 'Counted vs expected quantities, severity classification, and approval status per item.',
    module_page: 'Inventory Optimization',
    required_feature: 'inventory_optimization'
  },
  {
    report_key: 'replenishment_recommendations_report',
    surface: 'TENANT',
    category: 'Inventory Optimization',
    title: 'Replenishment Recommendations Report',
    description: 'Backend-generated reorder and expedite signals with on-hand, reorder point, and demand context.',
    module_page: 'Inventory Optimization',
    required_feature: 'inventory_optimization'
  },
  {
    report_key: 'abc_classification_report',
    surface: 'TENANT',
    category: 'Inventory Optimization',
    title: 'ABC Classification Report',
    description: 'Item classification (A/B/C) by value, movement, and criticality scores with insufficient-history flags.',
    module_page: 'Inventory Optimization',
    required_feature: 'inventory_optimization'
  },
  {
    report_key: 'asset_registry_report',
    surface: 'TENANT',
    category: 'Asset & Custody',
    title: 'Asset Registry Report',
    description: 'Full asset registry with status, custodian, category, serial number, and acquisition details.',
    module_page: 'Asset & Custody Center',
    required_feature: 'asset_custody'
  },
  {
    report_key: 'chain_of_custody_timeline_report',
    surface: 'TENANT',
    category: 'Asset & Custody',
    title: 'Chain-of-Custody Timeline Report',
    description: 'Ordered custody event log per asset: registrations, assignments, transfers, returns, damage, loss, and disposal.',
    module_page: 'Asset & Custody Center',
    required_feature: 'asset_custody'
  },
  {
    report_key: 'asset_assignment_report',
    surface: 'TENANT',
    category: 'Asset & Custody',
    title: 'Asset Assignment Report',
    description: 'Active and historical asset assignments with custodian, department, facility, and expected return dates.',
    module_page: 'Asset & Custody Center',
    required_feature: 'asset_custody'
  },
  {
    report_key: 'damaged_lost_asset_report',
    surface: 'TENANT',
    category: 'Asset & Custody',
    title: 'Damaged / Lost Asset Report',
    description: 'Assets in DAMAGED or LOST state with condition report descriptions and severity.',
    module_page: 'Asset & Custody Center',
    required_feature: 'asset_custody'
  },
  {
    report_key: 'disposal_approval_report',
    surface: 'TENANT',
    category: 'Asset & Custody',
    title: 'Disposal Approval Report',
    description: 'Disposal requests with approval posture, disposal method, reason, and audit trail.',
    module_page: 'Asset & Custody Center',
    required_feature: 'asset_custody'
  },
  {
    report_key: 'maintenance_case_report',
    surface: 'TENANT',
    category: 'Asset & Custody',
    title: 'Maintenance Case Report',
    description: 'Asset maintenance cases with type, status, description, and resolution.',
    module_page: 'Asset & Custody Center',
    required_feature: 'asset_custody'
  }
];

const PLATFORM_REPORT_DEFINITIONS = [
  {
    report_key: 'platform_tenant_summary',
    surface: 'PLATFORM',
    category: 'Platform Reports',
    title: 'Tenant Subscription Summary',
    description: 'Tenant plan, status, and subscription posture across the platform.',
    module_page: 'Platform Dashboard',
    required_role_capability: 'VIEW_PLATFORM_SUMMARY'
  },
  {
    report_key: 'platform_module_entitlement_summary',
    surface: 'PLATFORM',
    category: 'Platform Reports',
    title: 'Tenant Module Entitlement Summary',
    description: 'Tenant module entitlement posture and restricted module distribution.',
    module_page: 'Module Entitlements',
    required_role_capability: 'VIEW_PLATFORM_TENANT_MODULES'
  },
  {
    report_key: 'platform_usage_summary',
    surface: 'PLATFORM',
    category: 'Platform Reports',
    title: 'Tenant Usage Summary',
    description: 'Workspace usage posture by tenant and feature family.',
    module_page: 'Subscription & Plans',
    required_role_capability: 'VIEW_PLATFORM_TENANT_USAGE'
  },
  {
    report_key: 'platform_support_sessions_summary',
    surface: 'PLATFORM',
    category: 'Platform Reports',
    title: 'Support Session Summary',
    description: 'Open, active, and closed support sessions across tenants.',
    module_page: 'Support Sessions',
    required_role_capability: 'VIEW_PLATFORM_SUPPORT_SESSIONS'
  },
  {
    report_key: 'platform_audit_summary',
    surface: 'PLATFORM',
    category: 'Platform Reports',
    title: 'Platform Audit Summary',
    description: 'Platform audit events with target tenant and operator posture.',
    module_page: 'Security & Audit',
    required_role_capability: 'VIEW_PLATFORM_AUDIT_EVENTS'
  },
  {
    report_key: 'platform_security_event_summary',
    surface: 'PLATFORM',
    category: 'Platform Reports',
    title: 'Security Event Summary',
    description: 'Security and control-plane event posture for SaaS operators.',
    module_page: 'Security & Audit',
    required_role_capability: 'VIEW_PLATFORM_SECURITY_EVENTS'
  }
];

const REPORT_DEFINITIONS = [...TENANT_REPORT_DEFINITIONS, ...PLATFORM_REPORT_DEFINITIONS];

function reportSurface(surface) {
  return String(surface || 'TENANT').toUpperCase() === 'PLATFORM' ? 'PLATFORM' : 'TENANT';
}

function currentActor(context, surface) {
  if (surface === 'PLATFORM') {
    return context?.platformUser || context?.user || null;
  }
  return context?.user || null;
}

function currentTenantId(context, surface) {
  if (surface === 'PLATFORM') return null;
  return context?.tenant?.id || null;
}

function tenantFeatures(tenantId) {
  if (!tenantId) return new Set();
  return new Set(selectAll('SELECT feature_key FROM tenant_features WHERE tenant_id = ? AND enabled = 1', [tenantId]).map((row) => row.feature_key));
}

function reportDefinitionsForSurface(surface) {
  const normalized = reportSurface(surface);
  return REPORT_DEFINITIONS.filter((def) => def.surface === normalized);
}

function tenantReportAvailable(definition, context) {
  const tenantId = currentTenantId(context, 'TENANT');
  if (!tenantId) return false;
  const features = tenantFeatures(tenantId);
  return features.has('reports') && features.has(definition.required_feature);
}

function platformReportAvailable(definition, context) {
  const roleKey = context?.platformUser?.role_key || '';
  const roleCapabilities = {
    PLATFORM_OWNER: new Set(['*']),
    PLATFORM_ADMIN: new Set(['VIEW_PLATFORM_SUMMARY', 'VIEW_PLATFORM_TENANTS', 'VIEW_PLATFORM_TENANT_DETAIL', 'VIEW_PLATFORM_TENANT_USERS', 'VIEW_PLATFORM_TENANT_MODULES', 'VIEW_PLATFORM_TENANT_USAGE', 'VIEW_PLATFORM_TENANT_HEALTH', 'VIEW_PLATFORM_AUDIT_EVENTS', 'VIEW_PLATFORM_SECURITY_EVENTS', 'VIEW_PLATFORM_BILLING_EVENTS', 'VIEW_PLATFORM_SUPPORT_SESSIONS', 'MANAGE_PLATFORM_SUPPORT_SESSIONS', 'MANAGE_PLATFORM_SUBSCRIPTION', 'MANAGE_PLATFORM_ENTITLEMENTS', 'MANAGE_PLATFORM_TENANT_STATUS', 'VIEW_PLATFORM_SYSTEM_HEALTH']),
    PLATFORM_SUPPORT: new Set(['VIEW_PLATFORM_SUMMARY', 'VIEW_PLATFORM_TENANTS', 'VIEW_PLATFORM_TENANT_DETAIL', 'VIEW_PLATFORM_TENANT_USERS', 'VIEW_PLATFORM_TENANT_MODULES', 'VIEW_PLATFORM_TENANT_USAGE', 'VIEW_PLATFORM_TENANT_HEALTH', 'VIEW_PLATFORM_AUDIT_EVENTS', 'VIEW_PLATFORM_SECURITY_EVENTS', 'VIEW_PLATFORM_SUPPORT_SESSIONS', 'MANAGE_PLATFORM_SUPPORT_SESSIONS']),
    PLATFORM_BILLING: new Set(['VIEW_PLATFORM_SUMMARY', 'VIEW_PLATFORM_TENANTS', 'VIEW_PLATFORM_TENANT_DETAIL', 'VIEW_PLATFORM_TENANT_USAGE', 'VIEW_PLATFORM_TENANT_HEALTH', 'VIEW_PLATFORM_BILLING_EVENTS', 'MANAGE_PLATFORM_SUBSCRIPTION']),
    PLATFORM_SECURITY: new Set(['VIEW_PLATFORM_SUMMARY', 'VIEW_PLATFORM_TENANTS', 'VIEW_PLATFORM_TENANT_DETAIL', 'VIEW_PLATFORM_TENANT_HEALTH', 'VIEW_PLATFORM_AUDIT_EVENTS', 'VIEW_PLATFORM_SECURITY_EVENTS', 'MANAGE_PLATFORM_TENANT_STATUS']),
    PLATFORM_AUDITOR: new Set(['VIEW_PLATFORM_SUMMARY', 'VIEW_PLATFORM_TENANTS', 'VIEW_PLATFORM_TENANT_DETAIL', 'VIEW_PLATFORM_TENANT_USERS', 'VIEW_PLATFORM_TENANT_MODULES', 'VIEW_PLATFORM_TENANT_USAGE', 'VIEW_PLATFORM_TENANT_HEALTH', 'VIEW_PLATFORM_AUDIT_EVENTS', 'VIEW_PLATFORM_SECURITY_EVENTS', 'VIEW_PLATFORM_BILLING_EVENTS', 'VIEW_PLATFORM_SUPPORT_SESSIONS', 'VIEW_PLATFORM_SYSTEM_HEALTH'])
  };
  return roleCapabilities[roleKey]?.has('*') || roleCapabilities[roleKey]?.has(definition.required_role_capability);
}

function reportSummaryFromRows(rows) {
  return {
    row_count: rows.length,
    sample: rows.slice(0, 3)
  };
}

function safeCsvCell(value) {
  const text = String(value ?? '');
  const escaped = text.replaceAll('"', '""').replace(/\r?\n/g, ' ');
  return /^[=+\-@]/.test(escaped) || /^[\t\r]/.test(escaped) ? `'${escaped}` : escaped;
}

function csvText(columns, rows) {
  const header = columns.map((column) => safeCsvCell(column.label || column.key)).join(',');
  const body = rows.map((row) => columns.map((column) => safeCsvCell(row[column.key])).join(',')).join('\n');
  return `${header}\n${body}${body ? '\n' : ''}`;
}

function wrapLine(value, width = 96) {
  const text = String(value ?? '');
  if (text.length <= width) return [text];
  const lines = [];
  let remaining = text;
  while (remaining.length > width) {
    let splitAt = remaining.lastIndexOf(' ', width);
    if (splitAt < 20) splitAt = width;
    lines.push(remaining.slice(0, splitAt).trimEnd());
    remaining = remaining.slice(splitAt).trimStart();
  }
  if (remaining) lines.push(remaining);
  return lines;
}

function escapePdfText(value) {
  return String(value ?? '')
    .replaceAll('\\', '\\\\')
    .replaceAll('(', '\\(')
    .replaceAll(')', '\\)')
    .replaceAll('\r', ' ')
    .replaceAll('\n', ' ');
}

function buildPdfBuffer({ title, subtitle = '', columns = [], rows = [], summary = [] }) {
  const pageWidth = 612;
  const pageHeight = 792;
  const marginLeft = 48;
  const marginTop = 54;
  const fontSize = 10;
  const lineHeight = 13;
  const maxLinesPerPage = 48;

  const lines = [
    title,
    subtitle,
    '',
    ...summary.map((line) => `- ${line}`),
    '',
    columns.map((column) => column.label || column.key).join(' | ')
  ];

  for (const row of rows) {
    lines.push(columns.map((column) => String(row[column.key] ?? '')).join(' | '));
  }

  const wrapped = lines.flatMap((line) => wrapLine(line, 96));
  const pages = [];
  for (let index = 0; index < wrapped.length; index += maxLinesPerPage) {
    pages.push(wrapped.slice(index, index + maxLinesPerPage));
  }
  if (pages.length === 0) pages.push(['No rows available.']);

  const objects = [];
  const fontObjectNumber = 3 + pages.length * 2;

  const contentObjectNumbers = [];
  for (let i = 0; i < pages.length; i += 1) {
    contentObjectNumbers.push(3 + i * 2);
  }

  const pageObjectNumbers = [];
  for (let i = 0; i < pages.length; i += 1) {
    pageObjectNumbers.push(4 + i * 2);
  }

  const kids = pageObjectNumbers.map((n) => `${n} 0 R`).join(' ');

  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push(`2 0 obj\n<< /Type /Pages /Kids [ ${kids} ] /Count ${pages.length} >>\nendobj\n`);

  for (let i = 0; i < pages.length; i += 1) {
    const pageLines = pages[i];
    const content = [
      'BT',
      `/F1 ${fontSize} Tf`,
      `${marginLeft} ${pageHeight - marginTop} Td`,
      `(${escapePdfText(title)}) Tj`,
      `0 -${lineHeight * 1.5} Td`,
      `/F1 ${Math.max(8, fontSize - 1)} Tf`
    ];
    pageLines.forEach((line, lineIndex) => {
      if (lineIndex === 0) {
        content.push(`(${escapePdfText(line)}) Tj`);
      } else {
        content.push(`0 -${lineHeight} Td`);
        content.push(`(${escapePdfText(line)}) Tj`);
      }
    });
    content.push('ET');
    const contentStream = content.join('\n');
    objects.push(`${contentObjectNumbers[i]} 0 obj\n<< /Length ${Buffer.byteLength(contentStream, 'utf8')} >>\nstream\n${contentStream}\nendstream\nendobj\n`);
    objects.push(`${pageObjectNumbers[i]} 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontObjectNumber} 0 R >> >> /Contents ${contentObjectNumbers[i]} 0 R >>\nendobj\n`);
  }

  objects.push(`${fontObjectNumber} 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n`);

  const header = '%PDF-1.4\n';
  let body = header;
  const offsets = [0];
  for (const object of objects) {
    offsets.push(Buffer.byteLength(body, 'utf8'));
    body += object;
  }
  const xrefOffset = Buffer.byteLength(body, 'utf8');
  let xref = `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i < offsets.length; i += 1) {
    xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF\n`;
  return Buffer.from(body + xref + trailer, 'utf8');
}

function reportColumnsFor(definition) {
  const map = {
    inventory_stock_position: [
      { key: 'sku', label: 'SKU' },
      { key: 'item_name', label: 'Item' },
      { key: 'facility_name', label: 'Facility' },
      { key: 'bin_code', label: 'Bin' },
      { key: 'on_hand', label: 'On Hand' },
      { key: 'available', label: 'Available' },
      { key: 'low_stock', label: 'Low Stock' }
    ],
    low_stock_reorder_risk: [
      { key: 'sku', label: 'SKU' },
      { key: 'item_name', label: 'Item' },
      { key: 'facility_name', label: 'Facility' },
      { key: 'on_hand', label: 'On Hand' },
      { key: 'reorder_point', label: 'Reorder Point' },
      { key: 'risk', label: 'Risk' }
    ],
    warehouse_issue_activity: [
      { key: 'task_no', label: 'Task' },
      { key: 'request_no', label: 'Request' },
      { key: 'status', label: 'Status' },
      { key: 'department_name', label: 'Department' },
      { key: 'facility_name', label: 'Facility' },
      { key: 'issued_quantity', label: 'Issued Qty' }
    ],
    internal_request_activity: [
      { key: 'request_no', label: 'Request' },
      { key: 'department_name', label: 'Department' },
      { key: 'status', label: 'Status' },
      { key: 'priority', label: 'Priority' },
      { key: 'line_count', label: 'Lines' },
      { key: 'updated_at', label: 'Updated' }
    ],
    receiving_activity: [
      { key: 'session_id', label: 'Session' },
      { key: 'po_no', label: 'PO' },
      { key: 'vendor_name', label: 'Vendor' },
      { key: 'status', label: 'Status' },
      { key: 'qty_received', label: 'Received Qty' },
      { key: 'exception_count', label: 'Exceptions' }
    ],
    procurement_pr_po_activity: [
      { key: 'record_type', label: 'Type' },
      { key: 'record_no', label: 'Record' },
      { key: 'vendor_name', label: 'Vendor' },
      { key: 'department_name', label: 'Department' },
      { key: 'status', label: 'Status' },
      { key: 'amount', label: 'Amount' }
    ],
    invoice_match_exceptions: [
      { key: 'invoice_number', label: 'Invoice' },
      { key: 'vendor_name', label: 'Vendor' },
      { key: 'code', label: 'Code' },
      { key: 'severity', label: 'Severity' },
      { key: 'status', label: 'Status' },
      { key: 'message', label: 'Message' }
    ],
    vendor_performance: [
      { key: 'vendor_name', label: 'Vendor' },
      { key: 'status', label: 'Status' },
      { key: 'risk_score', label: 'Risk Score' },
      { key: 'on_time_delivery_rate', label: 'On-time %' },
      { key: 'invoice_match_rate', label: 'Match %' },
      { key: 'spend_90d', label: '90d Spend' }
    ],
    finance_export_readiness: [
      { key: 'batch_no', label: 'Batch' },
      { key: 'status', label: 'Status' },
      { key: 'record_count', label: 'Records' },
      { key: 'open_error_count', label: 'Open Errors' },
      { key: 'format', label: 'Format' },
      { key: 'generated_at', label: 'Generated' }
    ],
    audit_trail_summary: [
      { key: 'created_at', label: 'At' },
      { key: 'action', label: 'Action' },
      { key: 'entity_type', label: 'Entity' },
      { key: 'entity_id', label: 'Entity ID' },
      { key: 'actor_role', label: 'Role' },
      { key: 'summary', label: 'Summary' }
    ],
    evidence_coverage: [
      { key: 'file_name', label: 'File' },
      { key: 'entity_type', label: 'Entity Type' },
      { key: 'entity_id', label: 'Entity ID' },
      { key: 'link_count', label: 'Links' },
      { key: 'state', label: 'State' },
      { key: 'uploaded_at', label: 'Uploaded' }
    ],
    offline_sync_conflicts: [
      { key: 'batch_key', label: 'Batch' },
      { key: 'device_name', label: 'Device' },
      { key: 'conflict_type', label: 'Type' },
      { key: 'status', label: 'Status' },
      { key: 'severity', label: 'Severity' },
      { key: 'summary', label: 'Summary' }
    ],
    device_trust_posture: [
      { key: 'device_code', label: 'Code' },
      { key: 'name', label: 'Device' },
      { key: 'facility_name', label: 'Facility' },
      { key: 'device_type', label: 'Type' },
      { key: 'trust_state', label: 'Trust State' },
      { key: 'last_seen_at', label: 'Last Seen' }
    ],
    inventory_accuracy_summary: [
      { key: 'snapshot_date', label: 'Date' },
      { key: 'total_items', label: 'Total Items' },
      { key: 'items_counted', label: 'Counted' },
      { key: 'items_accurate', label: 'Accurate' },
      { key: 'accuracy_pct', label: 'Accuracy %' },
      { key: 'open_variances', label: 'Open Variances' },
      { key: 'blocker_variances', label: 'Blockers' },
      { key: 'controlled_variances', label: 'Controlled' },
      { key: 'reorder_risks', label: 'Reorder Risks' }
    ],
    cycle_count_variance_report: [
      { key: 'plan_no', label: 'Plan' },
      { key: 'item_name', label: 'Item' },
      { key: 'sku', label: 'SKU' },
      { key: 'expected_qty', label: 'Expected' },
      { key: 'counted_qty', label: 'Counted' },
      { key: 'variance_qty', label: 'Variance' },
      { key: 'variance_pct', label: 'Variance %' },
      { key: 'severity', label: 'Severity' },
      { key: 'status', label: 'Status' },
      { key: 'controlled', label: 'Controlled' }
    ],
    replenishment_recommendations_report: [
      { key: 'item_name', label: 'Item' },
      { key: 'sku', label: 'SKU' },
      { key: 'recommendation_type', label: 'Type' },
      { key: 'priority', label: 'Priority' },
      { key: 'on_hand_qty', label: 'On Hand' },
      { key: 'reorder_point', label: 'Reorder Point' },
      { key: 'suggested_qty', label: 'Suggested Qty' },
      { key: 'status', label: 'Status' },
      { key: 'reason', label: 'Reason' }
    ],
    abc_classification_report: [
      { key: 'item_name', label: 'Item' },
      { key: 'sku', label: 'SKU' },
      { key: 'classification', label: 'Classification' },
      { key: 'score', label: 'Score' },
      { key: 'value_score', label: 'Value Score' },
      { key: 'movement_score', label: 'Movement Score' },
      { key: 'criticality_score', label: 'Criticality Score' },
      { key: 'insufficient_history', label: 'Insufficient History' },
      { key: 'reason', label: 'Reason' },
      { key: 'calculated_at', label: 'Calculated' }
    ],
    platform_tenant_summary: [
      { key: 'tenant_name', label: 'Tenant' },
      { key: 'plan_name', label: 'Plan' },
      { key: 'status', label: 'Status' },
      { key: 'subscription_status', label: 'Subscription' },
      { key: 'module_count', label: 'Modules' },
      { key: 'support_sessions', label: 'Support Sessions' }
    ],
    platform_module_entitlement_summary: [
      { key: 'tenant_name', label: 'Tenant' },
      { key: 'module_key', label: 'Module' },
      { key: 'entitlement_status', label: 'Entitlement' },
      { key: 'scope', label: 'Scope' },
      { key: 'notes', label: 'Notes' }
    ],
    platform_usage_summary: [
      { key: 'tenant_name', label: 'Tenant' },
      { key: 'metric_key', label: 'Metric' },
      { key: 'metric_value', label: 'Value' },
      { key: 'window', label: 'Window' }
    ],
    platform_support_sessions_summary: [
      { key: 'session_no', label: 'Session' },
      { key: 'tenant_name', label: 'Tenant' },
      { key: 'status', label: 'Status' },
      { key: 'support_role', label: 'Support Role' },
      { key: 'opened_at', label: 'Opened' },
      { key: 'closed_at', label: 'Closed' }
    ],
    platform_audit_summary: [
      { key: 'created_at', label: 'At' },
      { key: 'tenant_name', label: 'Tenant' },
      { key: 'action', label: 'Action' },
      { key: 'entity_type', label: 'Entity' },
      { key: 'summary', label: 'Summary' }
    ],
    platform_security_event_summary: [
      { key: 'created_at', label: 'At' },
      { key: 'tenant_name', label: 'Tenant' },
      { key: 'event_type', label: 'Event' },
      { key: 'severity', label: 'Severity' },
      { key: 'status', label: 'Status' },
      { key: 'summary', label: 'Summary' }
    ]
  };
  return map[definition.report_key] || [{ key: 'label', label: 'Label' }, { key: 'value', label: 'Value' }];
}

function reportDataForTenant(definition, context, filters = {}) {
  const tenantId = currentTenantId(context, 'TENANT');
  const dateFrom = filters.dateFrom || '';
  const dateTo = filters.dateTo || '';
  switch (definition.report_key) {
    case 'inventory_stock_position': {
      const rows = selectAll(
        `SELECT i.sku, i.name AS item_name, COALESCE(f.name, '') AS facility_name, COALESCE(b.code, '') AS bin_code, COALESCE(SUM(sb.on_hand), 0) AS on_hand, COALESCE(SUM(sb.available), 0) AS available, CASE WHEN COALESCE(SUM(sb.on_hand), 0) < COALESCE(i.min_stock, i.min_qty, 0) THEN 1 ELSE 0 END AS low_stock
         FROM items i
         LEFT JOIN stock_balances sb ON sb.item_id = i.id AND sb.tenant_id = i.tenant_id
         LEFT JOIN facilities f ON f.id = sb.facility_id
         LEFT JOIN bins b ON b.id = sb.bin_id
         WHERE i.tenant_id = ?
         GROUP BY i.id, f.name, b.code
         ORDER BY low_stock DESC, i.name ASC`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { total_items: rows.length, low_stock: rows.filter((row) => Number(row.low_stock) === 1).length } };
    }
    case 'low_stock_reorder_risk': {
      const rows = selectAll(
        `SELECT i.sku, i.name AS item_name, COALESCE(f.name, '') AS facility_name, COALESCE(SUM(sb.on_hand), 0) AS on_hand, COALESCE(i.reorder_point, i.min_stock, i.min_qty, 0) AS reorder_point, CASE WHEN COALESCE(SUM(sb.on_hand), 0) <= COALESCE(i.reorder_point, i.min_stock, i.min_qty, 0) THEN 'REORDER' ELSE 'WATCH' END AS risk
         FROM items i
         LEFT JOIN stock_balances sb ON sb.item_id = i.id AND sb.tenant_id = i.tenant_id
         LEFT JOIN facilities f ON f.id = sb.facility_id
         WHERE i.tenant_id = ?
         GROUP BY i.id, f.name
         HAVING COALESCE(SUM(sb.on_hand), 0) <= COALESCE(i.reorder_point, i.min_stock, i.min_qty, 0)
         ORDER BY on_hand ASC, i.name ASC`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'warehouse_issue_activity': {
      const rows = selectAll(
        `SELECT wt.task_no, wt.request_no, wt.status, wt.department_name, wt.facility_name, COALESCE(SUM(wtl.issued_quantity), 0) AS issued_quantity
         FROM warehouse_tasks wt
         LEFT JOIN warehouse_task_lines wtl ON wtl.warehouse_task_id = wt.id AND wtl.tenant_id = wt.tenant_id
         WHERE wt.tenant_id = ?
         GROUP BY wt.id
         ORDER BY wt.created_at DESC, wt.id DESC
         LIMIT 100`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'internal_request_activity': {
      const clauses = ['tenant_id = ?'];
      const params = [tenantId];
      if (dateFrom) {
        clauses.push('created_at >= ?');
        params.push(dateFrom);
      }
      if (dateTo) {
        clauses.push('created_at <= ?');
        params.push(dateTo);
      }
      const rows = selectAll(
        `SELECT request_no, department_name, status, priority, line_count, updated_at
         FROM internal_requests
         WHERE ${clauses.join(' AND ')}
         ORDER BY updated_at DESC, created_at DESC
         LIMIT 100`,
        params
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'receiving_activity': {
      const rows = selectAll(
        `SELECT rs.id AS session_id, po.po_no, COALESCE(v.name, '') AS vendor_name, rs.status, COALESCE(SUM(rsl.qty_received), 0) AS qty_received, COALESCE(SUM(CASE WHEN rsl.qty_short > 0 THEN 1 ELSE 0 END), 0) AS exception_count
         FROM receive_sessions rs
         LEFT JOIN receive_session_lines rsl ON rsl.receive_session_id = rs.id AND rsl.tenant_id = rs.tenant_id
         LEFT JOIN purchase_orders po ON po.id = rs.purchase_order_id
         LEFT JOIN vendors v ON v.id = po.vendor_id AND v.tenant_id = rs.tenant_id
         WHERE rs.tenant_id = ?
         GROUP BY rs.id, po.po_no, v.name
         ORDER BY rs.created_at DESC, rs.id DESC
         LIMIT 100`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'procurement_pr_po_activity': {
      const rows = [
        ...selectAll(
          `SELECT 'PR' AS record_type, pr.pr_no AS record_no, pr.vendor_name, d.name AS department_name, pr.status, pr.total_amount AS amount
           FROM purchase_requests pr
           LEFT JOIN departments d ON d.id = pr.department_id
           WHERE pr.tenant_id = ?
           ORDER BY pr.created_at DESC, pr.id DESC
           LIMIT 100`,
          [tenantId]
        ),
        ...selectAll(
          `SELECT 'PO' AS record_type, po.po_no AS record_no, po.vendor_name, d.name AS department_name, po.status, po.line_total AS amount
           FROM purchase_orders po
           LEFT JOIN departments d ON d.id = po.department_id
           WHERE po.tenant_id = ?
           ORDER BY po.created_at DESC, po.id DESC
           LIMIT 100`,
          [tenantId]
        )
      ];
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'invoice_match_exceptions': {
      const rows = selectAll(
        `SELECT vi.invoice_number, vi.vendor_name, ime.code, ime.severity, CASE WHEN ime.waived_at IS NOT NULL THEN 'WAIVED' ELSE 'OPEN' END AS status, ime.message
         FROM invoice_match_exceptions ime
         JOIN vendor_invoices vi ON vi.id = ime.vendor_invoice_id
         WHERE ime.tenant_id = ?
         ORDER BY ime.created_at DESC, ime.id DESC
         LIMIT 100`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'vendor_performance': {
      const rows = selectAll(
        `SELECT v.name AS vendor_name, v.status, COALESCE(v.risk_score, 0) AS risk_score, COALESCE(vs.on_time_delivery_rate, 0) AS on_time_delivery_rate, COALESCE(vs.invoice_match_rate, 0) AS invoice_match_rate, COALESCE(vs.spend_90d, 0) AS spend_90d
         FROM vendors v
         LEFT JOIN (
           SELECT vendor_id, AVG(on_time_delivery_rate) AS on_time_delivery_rate, AVG(invoice_match_rate) AS invoice_match_rate, SUM(spend_90d) AS spend_90d
           FROM vendor_scorecards
           WHERE tenant_id = ?
           GROUP BY vendor_id
         ) vs ON vs.vendor_id = v.id
         WHERE v.tenant_id = ?
         ORDER BY COALESCE(v.risk_score, 0) DESC, v.name ASC`,
        [tenantId, tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'finance_export_readiness': {
      const rows = selectAll(
        `SELECT batch_no, status, record_count, COALESCE(validation_error_count, 0) AS open_error_count, format, generated_at
         FROM export_batches
         WHERE tenant_id = ?
         ORDER BY created_at DESC, id DESC
         LIMIT 100`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'audit_trail_summary': {
      const rows = selectAll(
        `SELECT created_at, action, entity_type, entity_id, actor_role, summary
         FROM audit_logs
         WHERE tenant_id = ?
         ORDER BY created_at DESC, id DESC
         LIMIT 100`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'evidence_coverage': {
      const rows = selectAll(
        `SELECT d.file_name, d.entity_type, d.entity_id, COALESCE(ec.link_count, 0) AS link_count, d.evidence_state AS state, d.uploaded_at
         FROM documents d
         LEFT JOIN (
           SELECT document_id, COUNT(*) AS link_count
           FROM evidence_links
           WHERE tenant_id = ?
           GROUP BY document_id
         ) ec ON ec.document_id = d.id
         WHERE d.tenant_id = ?
         ORDER BY d.uploaded_at DESC, d.created_at DESC
         LIMIT 100`,
        [tenantId, tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'offline_sync_conflicts': {
      const rows = selectAll(
        `SELECT sc.batch_no AS batch_key, COALESCE(d.name, '') AS device_name, sc.conflict_type, sc.status, sc.severity, COALESCE(sc.description, sc.conflict_summary, '') AS summary
         FROM sync_conflicts sc
         LEFT JOIN offline_batches ob ON ob.id = sc.offline_batch_id
         LEFT JOIN devices d ON d.id = ob.device_id
         WHERE sc.tenant_id = ?
         ORDER BY sc.created_at DESC, sc.id DESC
         LIMIT 100`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'device_trust_posture': {
      const rows = selectAll(
        `SELECT d.device_code, d.name, COALESCE(f.name, '') AS facility_name, d.device_type, d.trust_state, d.last_seen_at
         FROM devices d
         LEFT JOIN facilities f ON f.id = d.facility_id
         WHERE d.tenant_id = ?
         ORDER BY d.trust_state ASC, d.name ASC`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'inventory_accuracy_summary': {
      const rows = selectAll(
        `SELECT snapshot_date, total_items, items_counted, items_accurate,
                ROUND(COALESCE(accuracy_pct, 0), 2) AS accuracy_pct,
                open_variances, blocker_variances, controlled_variances, reorder_risks
         FROM inventory_accuracy_snapshots WHERE tenant_id = ? ORDER BY snapshot_date DESC LIMIT 90`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length, latestAccuracy: rows[0]?.accuracy_pct ?? null } };
    }
    case 'cycle_count_variance_report': {
      const rows = selectAll(
        `SELECT ccp.plan_no, i.name AS item_name, i.sku,
                v.expected_qty, v.counted_qty, v.variance_qty,
                ROUND(COALESCE(v.variance_pct, 0), 2) AS variance_pct,
                v.severity, v.status,
                CASE WHEN v.controlled = 1 THEN 'Yes' ELSE 'No' END AS controlled
         FROM inventory_variances v
         JOIN items i ON i.id = v.item_id
         LEFT JOIN cycle_count_sessions ccs ON ccs.id = v.session_id
         LEFT JOIN cycle_count_plans ccp ON ccp.id = ccs.plan_id
         WHERE v.tenant_id = ? ORDER BY v.severity DESC, v.created_at DESC LIMIT 500`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length, blockers: rows.filter((r) => r.severity === 'BLOCKER').length } };
    }
    case 'replenishment_recommendations_report': {
      const rows = selectAll(
        `SELECT i.name AS item_name, i.sku,
                rr.recommendation_type, rr.priority,
                rr.on_hand_qty, rr.reorder_point, rr.suggested_qty, rr.status, rr.reason
         FROM replenishment_recommendations rr
         JOIN items i ON i.id = rr.item_id
         WHERE rr.tenant_id = ? ORDER BY
           CASE rr.priority WHEN 'CRITICAL' THEN 0 WHEN 'HIGH' THEN 1 WHEN 'MEDIUM' THEN 2 ELSE 3 END ASC,
           rr.created_at DESC LIMIT 500`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length, openRecs: rows.filter((r) => r.status === 'OPEN').length } };
    }
    case 'abc_classification_report': {
      const rows = selectAll(
        `SELECT i.name AS item_name, i.sku,
                ic.classification, ROUND(ic.score, 2) AS score,
                ROUND(ic.value_score, 2) AS value_score,
                ROUND(ic.movement_score, 2) AS movement_score,
                ROUND(ic.criticality_score, 2) AS criticality_score,
                CASE WHEN ic.insufficient_history = 1 THEN 'Yes' ELSE 'No' END AS insufficient_history,
                ic.reason, ic.calculated_at
         FROM inventory_classifications ic
         JOIN items i ON i.id = ic.item_id
         WHERE ic.tenant_id = ? ORDER BY ic.classification ASC, ic.score DESC LIMIT 500`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'asset_registry_report': {
      const rows = selectAll(
        `SELECT ar.asset_no, ar.name, ar.category, ar.subcategory, ar.serial_number, ar.asset_type,
                ar.status, ar.acquisition_cost, ar.acquisition_date, ar.last_audit_date,
                CASE WHEN ar.controlled = 1 THEN 'Yes' ELSE 'No' END AS controlled,
                CASE WHEN ar.high_value = 1 THEN 'Yes' ELSE 'No' END AS high_value,
                u.name AS custodian_name, f.name AS facility_name
         FROM asset_records ar
         LEFT JOIN users u ON u.id = ar.current_custodian_user_id
         LEFT JOIN facilities f ON f.id = ar.facility_id
         WHERE ar.tenant_id = ? ORDER BY ar.asset_no ASC LIMIT 500`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'chain_of_custody_timeline_report': {
      const rows = selectAll(
        `SELECT ar.asset_no, ar.name AS asset_name, ace.event_type, ace.status_before, ace.status_after,
                u.name AS actor_name, ace.notes, ace.created_at
         FROM asset_custody_events ace
         JOIN asset_records ar ON ar.id = ace.asset_id
         LEFT JOIN users u ON u.id = ace.actor_user_id
         WHERE ace.tenant_id = ? ORDER BY ar.asset_no ASC, ace.created_at ASC LIMIT 1000`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'asset_assignment_report': {
      const rows = selectAll(
        `SELECT ar.asset_no, ar.name AS asset_name, aa.status,
                u.name AS custodian_name, d.name AS department_name, f.name AS facility_name,
                aa.assigned_at, aa.expected_return_at, aa.returned_at
         FROM asset_assignments aa
         JOIN asset_records ar ON ar.id = aa.asset_id
         LEFT JOIN users u ON u.id = aa.custodian_user_id
         LEFT JOIN departments d ON d.id = aa.department_id
         LEFT JOIN facilities f ON f.id = aa.facility_id
         WHERE aa.tenant_id = ? ORDER BY aa.assigned_at DESC LIMIT 500`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length, active: rows.filter((r) => r.status === 'ACTIVE').length } };
    }
    case 'damaged_lost_asset_report': {
      const rows = selectAll(
        `SELECT ar.asset_no, ar.name AS asset_name, ar.status,
                acr.condition_type, acr.severity, acr.description, acr.repair_cost_estimate, acr.created_at
         FROM asset_records ar
         LEFT JOIN asset_condition_reports acr ON acr.asset_id = ar.id AND acr.tenant_id = ar.tenant_id
         WHERE ar.tenant_id = ? AND ar.status IN ('DAMAGED','LOST')
         ORDER BY acr.severity DESC, acr.created_at DESC LIMIT 500`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'disposal_approval_report': {
      const rows = selectAll(
        `SELECT adr.disposal_no, ar.asset_no, ar.name AS asset_name,
                adr.status, adr.disposal_method, adr.disposal_value, adr.reason,
                u.name AS requested_by_name,
                adr.submitted_at, adr.approved_at, adr.disposed_at
         FROM asset_disposal_requests adr
         JOIN asset_records ar ON ar.id = adr.asset_id
         LEFT JOIN users u ON u.id = adr.requested_by_user_id
         WHERE adr.tenant_id = ? ORDER BY adr.created_at DESC LIMIT 500`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length, pending: rows.filter((r) => r.status === 'APPROVAL_PENDING').length } };
    }
    case 'maintenance_case_report': {
      const rows = selectAll(
        `SELECT amc.case_no, ar.asset_no, ar.name AS asset_name,
                amc.maintenance_type, amc.status, amc.description, amc.resolution,
                amc.started_at, amc.completed_at
         FROM asset_maintenance_cases amc
         JOIN asset_records ar ON ar.id = amc.asset_id
         WHERE amc.tenant_id = ? ORDER BY amc.created_at DESC LIMIT 500`,
        [tenantId]
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length, open: rows.filter((r) => r.status === 'OPEN').length } };
    }
    default:
      return { columns: reportColumnsFor(definition), rows: [], summary: { rows: 0 } };
  }
}

function reportDataForPlatform(definition) {
  switch (definition.report_key) {
    case 'platform_tenant_summary': {
      const rows = selectAll(
        `SELECT t.name AS tenant_name, p.plan_name, t.status, s.status AS subscription_status, COALESCE(m.module_count, 0) AS module_count, COALESCE(ss.support_sessions, 0) AS support_sessions
         FROM tenants t
         LEFT JOIN tenant_subscriptions s ON s.tenant_id = t.id
         LEFT JOIN tenant_plans p ON p.id = s.plan_id
         LEFT JOIN (
           SELECT tenant_id, COUNT(*) AS module_count FROM tenant_feature_entitlements GROUP BY tenant_id
         ) m ON m.tenant_id = t.id
         LEFT JOIN (
           SELECT tenant_id, COUNT(*) AS support_sessions FROM platform_support_sessions GROUP BY tenant_id
         ) ss ON ss.tenant_id = t.id
         ORDER BY t.name ASC`
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'platform_module_entitlement_summary': {
      const rows = selectAll(
        `SELECT t.name AS tenant_name, e.module_key, e.entitlement_status, COALESCE(e.scope_type, 'TENANT') AS scope, COALESCE(e.notes, '') AS notes
         FROM tenant_feature_entitlements e
         JOIN tenants t ON t.id = e.tenant_id
         ORDER BY t.name ASC, e.module_key ASC`
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'platform_usage_summary': {
      const rows = selectAll(
        `SELECT t.name AS tenant_name, u.metric_key, u.metric_value, u.window_label AS window
         FROM tenant_usage_snapshots u
         JOIN tenants t ON t.id = u.tenant_id
         ORDER BY u.recorded_at DESC, t.name ASC`
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'platform_support_sessions_summary': {
      const rows = selectAll(
        `SELECT ps.session_no, t.name AS tenant_name, ps.status, ps.support_role, ps.opened_at, ps.closed_at
         FROM platform_support_sessions ps
         JOIN tenants t ON t.id = ps.tenant_id
         ORDER BY ps.created_at DESC, ps.id DESC`
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'platform_audit_summary': {
      const rows = selectAll(
        `SELECT pa.created_at, t.name AS tenant_name, pa.action, pa.entity_type, pa.summary
         FROM platform_audit_events pa
         LEFT JOIN tenants t ON t.id = pa.tenant_id
         ORDER BY pa.created_at DESC, pa.id DESC
         LIMIT 100`
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    case 'platform_security_event_summary': {
      const rows = selectAll(
        `SELECT pse.created_at, t.name AS tenant_name, pse.event_type, pse.severity, pse.status, pse.summary
         FROM platform_security_events pse
         LEFT JOIN tenants t ON t.id = pse.tenant_id
         ORDER BY pse.created_at DESC, pse.id DESC
         LIMIT 100`
      );
      return { columns: reportColumnsFor(definition), rows, summary: { rows: rows.length } };
    }
    default:
      return { columns: reportColumnsFor(definition), rows: [], summary: { rows: 0 } };
  }
}

function findDefinition(surface, reportKey) {
  return reportDefinitionsForSurface(surface).find((definition) => definition.report_key === reportKey) || null;
}

function runStatusCounts(surface, tenantId = null) {
  const rows = selectAll(
    `SELECT status, COUNT(*) AS count
     FROM report_runs
     WHERE surface = ?${tenantId ? ' AND tenant_id = ?' : ' AND tenant_id IS NULL'}
     GROUP BY status`,
    tenantId ? [surface, tenantId] : [surface]
  );
  const counts = { QUEUED: 0, RUNNING: 0, COMPLETED: 0, FAILED: 0, CANCELLED: 0 };
  for (const row of rows) counts[row.status] = Number(row.count || 0);
  return counts;
}

function reportRunsQuery(surface, tenantId = null) {
  return selectAll(
    `SELECT rr.*, rd.title AS definition_title, rd.report_category AS definition_category, rd.module_page, re.export_format, re.file_name AS export_file_name, re.content_type AS export_content_type
     FROM report_runs rr
     LEFT JOIN report_definitions rd ON rd.surface = rr.surface AND rd.report_key = rr.report_key
     LEFT JOIN report_exports re ON re.report_run_id = rr.id AND re.export_format = rr.format
     WHERE rr.surface = ?${tenantId ? ' AND rr.tenant_id = ?' : ' AND rr.tenant_id IS NULL'}
     ORDER BY rr.created_at DESC, rr.id DESC
     LIMIT 100`,
    tenantId ? [surface, tenantId] : [surface]
  );
}

function scopeAuditEntity(surface) {
  return surface === 'PLATFORM' ? 'platform_report_run' : 'report_run';
}

function auditReportAction(surface, context, runId, reportKey, action, summary, before = {}, after = {}) {
  if (surface === 'PLATFORM') {
    insert('platform_audit_events', {
      id: newId('platform_audit'),
      platform_user_id: context?.platformUser?.id ?? null,
      tenant_id: null,
      actor_role: context?.platformUser?.role_key || 'UNAUTHENTICATED',
      action,
      entity_type: 'platform_report_run',
      entity_id: runId,
      summary,
      details_json: JSON.stringify({ report_key: reportKey, before, after }),
      request_id: context?.requestId || '',
      created_at: nowIso()
    });
    return;
  }
  insert('audit_logs', {
    id: newId('audit'),
    tenant_id: context?.tenant?.id ?? null,
    actor_user_id: context?.user?.id ?? null,
    actor_role: context?.user?.role_key || 'UNAUTHENTICATED',
    department_id: context?.user?.department_id ?? null,
    facility_id: context?.user?.facility_id ?? null,
    device_id: context?.device?.id ?? null,
    action,
    entity_type: scopeAuditEntity(surface),
    entity_id: runId,
    summary,
    before_json: JSON.stringify(before),
    after_json: JSON.stringify(after),
    request_id: context?.requestId || ''
  });
}

function auditDeniedReportAction(surface, context, reportKey, reason) {
  if (surface === 'PLATFORM') {
    insert('platform_security_events', {
      id: newId('platform_security'),
      platform_user_id: context?.platformUser?.id ?? null,
      tenant_id: null,
      event_type: 'DENIED_REPORT_ACCESS',
      severity: 'WARN',
      status: 'RECORDED',
      summary: `${reportKey} denied: ${reason}`,
      details_json: JSON.stringify({ report_key: reportKey, reason }),
      created_at: nowIso(),
      updated_at: nowIso()
    });
    return;
  }
  if (context?.tenant?.id && context?.user?.id) {
    insert('audit_logs', {
      id: newId('audit'),
      tenant_id: context.tenant.id,
      actor_user_id: context.user.id,
      actor_role: context.user.role_key,
      department_id: context.user.department_id,
      facility_id: context.user.facility_id,
      device_id: context.device?.id ?? null,
      action: 'DENIED_REPORT_ACCESS',
      entity_type: 'report_run',
      entity_id: reportKey,
      summary: `Report access denied for ${reportKey}: ${reason}`,
      before_json: JSON.stringify({}),
      after_json: JSON.stringify({ report_key: reportKey, reason }),
      request_id: context.requestId || ''
    });
  }
}

function reportDefinitionAccess(surface, context, definition) {
  if (surface === 'PLATFORM') return platformReportAvailable(definition, context);
  return tenantReportAvailable(definition, context);
}

function reportLookupRows(surface, context, reportKey, filters = {}) {
  const definition = findDefinition(surface, reportKey);
  if (!definition) throw new Error(`Unknown report: ${reportKey}`);
  if (!reportDefinitionAccess(surface, context, definition)) throw new Error(`Feature disabled: ${reportKey}`);
  return surface === 'PLATFORM' ? reportDataForPlatform(definition, context, filters) : reportDataForTenant(definition, context, filters);
}

function reportBaseSummary(surface, context) {
  const tenantId = currentTenantId(context, surface);
  const rows = reportRunsQuery(surface, tenantId);
  const statuses = runStatusCounts(surface, tenantId);
  const completed = statuses.COMPLETED || 0;
  const failed = statuses.FAILED || 0;
  const recentExportCutoff = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const recentExports = selectOne(
    `SELECT COUNT(*) AS count FROM report_exports WHERE surface = ?${tenantId ? ' AND tenant_id = ?' : ' AND tenant_id IS NULL'} AND created_at >= ?`,
    tenantId ? [surface, tenantId, recentExportCutoff] : [surface, recentExportCutoff]
  )?.count || 0;
  return {
    summary: {
      surface,
      availableReports: reportDefinitionsForSurface(surface).filter((definition) => reportDefinitionAccess(surface, context, definition)).length,
      totalRuns: rows.length,
      completedRuns: completed,
      failedRuns: failed,
      recentExports: Number(recentExports || 0),
      latestRunAt: rows[0]?.created_at || null
    },
    recentRuns: rows.slice(0, 10),
    statusCounts: statuses
  };
}

function persistExport(surface, context, run, format, columns, rows, summary, options = {}) {
  const exportId = newId('report_export');
  const runNumber = String(run.run_no || run.id).replace(/[^a-zA-Z0-9-]+/g, '-');
  const baseName = `opstrax_${surface === 'PLATFORM' ? 'platform_' : ''}${run.report_key}_${runNumber}`.replace(/_+/g, '_');
  let contentType = 'text/csv; charset=utf-8';
  let contentText = '';
  let contentBlob = null;
  if (format === 'PDF') {
    contentType = 'application/pdf';
    contentBlob = buildPdfBuffer({
      title: run.report_title,
      subtitle: `${run.report_category} · ${run.surface === 'PLATFORM' ? 'Platform' : 'Tenant'} report`,
      columns,
      rows,
      summary: [
        `Run: ${run.run_no}`,
        `Status: ${run.status}`,
        `Rows: ${rows.length}`,
        `Created at: ${run.created_at}`,
        ...summary.map((line) => String(line))
      ]
    });
  } else if (format === 'JSON') {
    contentType = 'application/json; charset=utf-8';
    contentText = JSON.stringify({ report: run.report_title, report_key: run.report_key, summary: Object.fromEntries(summary.map((line) => [line.split(':')[0].trim(), line.split(':').slice(1).join(':').trim()])), columns, rows }, null, 2);
  } else {
    contentText = csvText(columns, rows);
  }
  const checksumSource = contentBlob || Buffer.from(contentText, 'utf8');
  insert('report_exports', {
    id: exportId,
    tenant_id: currentTenantId(context, surface),
    surface,
    report_run_id: run.id,
    export_format: format,
    file_name: `${baseName}.${format === 'PDF' ? 'pdf' : format === 'JSON' ? 'json' : 'csv'}`,
    content_type: contentType,
    content_text: contentText,
    content_blob: contentBlob,
    checksum_sha256: createHash('sha256').update(checksumSource).digest('hex'),
    created_at: nowIso(),
    created_by_user_id: surface === 'PLATFORM' ? null : context?.user?.id ?? null,
    created_by_platform_user_id: surface === 'PLATFORM' ? context?.platformUser?.id ?? null : null
  });
  execute('UPDATE report_runs SET output_file_name = ?, output_content_type = ?, updated_at = ? WHERE id = ?', [
    `${baseName}.${format === 'PDF' ? 'pdf' : format === 'JSON' ? 'json' : 'csv'}`,
    contentType,
    nowIso(),
    run.id
  ]);
  const exportRow = selectOne('SELECT * FROM report_exports WHERE id = ?', [exportId]);
  if (exportRow?.content_blob && !Buffer.isBuffer(exportRow.content_blob)) exportRow.content_blob = Buffer.from(exportRow.content_blob);
  return exportRow;
}

export function listReportDefinitions(surface, context) {
  const normalized = reportSurface(surface);
  const defs = reportDefinitionsForSurface(normalized).filter((definition) => reportDefinitionAccess(normalized, context, definition));
  return { definitions: defs.map((definition) => ({ ...definition, available: true })) };
}

export function listReportSummary(surface, context) {
  const normalized = reportSurface(surface);
  return reportBaseSummary(normalized, context);
}

export function listReportRuns(surface, context) {
  const normalized = reportSurface(surface);
  const tenantId = currentTenantId(context, normalized);
  return { runs: reportRunsQuery(normalized, tenantId) };
}

export function getReportRun(surface, context, runId) {
  const normalized = reportSurface(surface);
  const tenantId = currentTenantId(context, normalized);
  const run = selectOne(
    `SELECT rr.*, rd.title AS definition_title, rd.report_category AS definition_category, rd.module_page, rd.description AS definition_description
     FROM report_runs rr
     LEFT JOIN report_definitions rd ON rd.surface = rr.surface AND rd.report_key = rr.report_key
     WHERE rr.id = ? AND rr.surface = ?${tenantId ? ' AND rr.tenant_id = ?' : ' AND rr.tenant_id IS NULL'}`,
    tenantId ? [runId, normalized, tenantId] : [runId, normalized]
  );
  if (!run) throw new Error('Report run not found');
  const exportRows = selectAll('SELECT * FROM report_exports WHERE report_run_id = ? ORDER BY created_at DESC', [run.id]);
  let filters = {};
  try {
    filters = run.filters_json ? JSON.parse(run.filters_json) : {};
  } catch {
    filters = {};
  }
  const { columns, rows, summary } = reportLookupRows(normalized, context, run.report_key, filters);
  const auditRows = normalized === 'PLATFORM'
    ? selectAll('SELECT * FROM platform_audit_events WHERE entity_type = ? AND entity_id = ? ORDER BY created_at DESC', [scopeAuditEntity(normalized), run.id])
    : selectAll('SELECT * FROM audit_logs WHERE tenant_id = ? AND entity_type = ? AND entity_id = ? ORDER BY created_at DESC', [tenantId, scopeAuditEntity(normalized), run.id]);
  return {
    run,
    columns,
    rows,
    summary,
    exports: exportRows,
    audit: auditRows
  };
}

export function runReport(surface, context, body = {}) {
  const normalized = reportSurface(surface);
  const definition = findDefinition(normalized, body.reportKey || body.report_key);
  if (!definition) throw new Error(`Unknown report: ${body.reportKey || body.report_key || ''}`);
  if (!reportDefinitionAccess(normalized, context, definition)) throw new Error(`Feature disabled: ${definition.report_key}`);
  const format = String(body.format || 'CSV').toUpperCase();
  const filters = body.filters || body || {};
  const tenantId = currentTenantId(context, normalized);
  return transaction(() => {
    const runId = newId('report_run');
    const countRow = selectOne(
      `SELECT COUNT(*) AS count FROM report_runs WHERE surface = ?${tenantId ? ' AND tenant_id = ?' : ' AND tenant_id IS NULL'}`,
      tenantId ? [normalized, tenantId] : [normalized]
    );
    const runNo = `${normalized === 'PLATFORM' ? 'PRPT' : 'RPT'}-${String(Number(countRow?.count || 0) + 1).padStart(4, '0')}`;
    const run = {
      id: runId,
      tenant_id: tenantId,
      surface: normalized,
      report_key: definition.report_key,
      report_title: definition.title,
      report_category: definition.category,
      module_page: definition.module_page,
      format,
      status: 'QUEUED',
      run_no: runNo,
      filters_json: JSON.stringify(filters),
      row_count: 0,
      failure_reason: '',
      output_file_name: '',
      output_content_type: '',
      created_at: nowIso(),
      created_by_user_id: normalized === 'PLATFORM' ? null : context?.user?.id ?? null,
      created_by_platform_user_id: normalized === 'PLATFORM' ? context?.platformUser?.id ?? null : null,
      started_at: null,
      completed_at: null,
      cancelled_at: null,
      updated_at: null
    };
    insert('report_runs', run);
    execute('UPDATE report_runs SET status = ?, started_at = ?, updated_at = ? WHERE id = ?', ['RUNNING', nowIso(), nowIso(), runId]);
    const payload = reportLookupRows(normalized, context, definition.report_key, filters);
    const exportFormat = format === 'PDF' ? 'PDF' : format === 'JSON' ? 'JSON' : 'CSV';
    const exportRow = persistExport(normalized, context, { ...run, status: 'RUNNING' }, exportFormat, payload.columns, payload.rows, Object.entries(payload.summary || {}).map(([k, v]) => `${k}: ${v}`));
    execute(
      `UPDATE report_runs
       SET status = 'COMPLETED', row_count = ?, completed_at = ?, updated_at = ?, output_file_name = ?, output_content_type = ?, failure_reason = ''
       WHERE id = ?`,
      [payload.rows.length, nowIso(), nowIso(), exportRow.file_name, exportRow.content_type, runId]
    );
    const completed = selectOne('SELECT * FROM report_runs WHERE id = ?', [runId]);
    auditReportAction(normalized, context, runId, definition.report_key, 'RUN_REPORT', `${definition.title} generated (${payload.rows.length} row(s))`, {}, { status: 'COMPLETED', row_count: payload.rows.length, export_id: exportRow.id });
    return {
      run: completed,
      definition,
      columns: payload.columns,
      rows: payload.rows,
      summary: payload.summary,
      export: exportRow
    };
  });
}

export function cancelReportRun(surface, context, runId, body = {}) {
  const normalized = reportSurface(surface);
  const tenantId = currentTenantId(context, normalized);
  const run = selectOne('SELECT * FROM report_runs WHERE id = ? AND surface = ?' + (tenantId ? ' AND tenant_id = ?' : ' AND tenant_id IS NULL'), tenantId ? [runId, normalized, tenantId] : [runId, normalized]);
  if (!run) throw new Error('Report run not found');
  if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(run.status)) return { run };
  execute(
    `UPDATE report_runs SET status = 'CANCELLED', cancelled_at = ?, updated_at = ? WHERE id = ?`,
    [nowIso(), nowIso(), runId]
  );
  const updated = selectOne('SELECT * FROM report_runs WHERE id = ?', [runId]);
  auditReportAction(normalized, context, runId, run.report_key, 'CANCEL_REPORT_RUN', `${run.report_title} cancelled`, { status: run.status }, { status: 'CANCELLED', reason: body.reason || '' });
  return { run: updated };
}

function resolveExport(surface, context, runId, format) {
  const normalized = reportSurface(surface);
  const tenantId = currentTenantId(context, normalized);
  const run = selectOne('SELECT * FROM report_runs WHERE id = ? AND surface = ?' + (tenantId ? ' AND tenant_id = ?' : ' AND tenant_id IS NULL'), tenantId ? [runId, normalized, tenantId] : [runId, normalized]);
  if (!run) throw new Error('Report run not found');
  const existing = selectOne('SELECT * FROM report_exports WHERE report_run_id = ? AND export_format = ? ORDER BY created_at DESC LIMIT 1', [runId, format]);
  if (existing) {
    if (existing.content_blob && !Buffer.isBuffer(existing.content_blob)) existing.content_blob = Buffer.from(existing.content_blob);
    auditReportAction(normalized, context, runId, run.report_key, `DOWNLOAD_${format}`, `${run.report_title} ${format.toLowerCase()} export downloaded`, {}, { export_id: existing.id, format, reused: true });
    return { run, export: existing };
  }
  let filters = {};
  try {
    filters = run.filters_json ? JSON.parse(run.filters_json) : {};
  } catch {
    filters = {};
  }
  const payload = reportLookupRows(normalized, context, run.report_key, filters);
  const exportRow = persistExport(normalized, context, run, format, payload.columns, payload.rows, Object.entries(payload.summary || {}).map(([k, v]) => `${k}: ${v}`));
  auditReportAction(normalized, context, runId, run.report_key, `DOWNLOAD_${format}`, `${run.report_title} ${format.toLowerCase()} export downloaded`, {}, { export_id: exportRow.id, format });
  return { run, export: exportRow };
}

export function exportReportCsv(surface, context, runId) {
  return resolveExport(surface, context, runId, 'CSV');
}

export function exportReportPdf(surface, context, runId) {
  return resolveExport(surface, context, runId, 'PDF');
}

export function getReportDefinitionsSeed() {
  return REPORT_DEFINITIONS.map((definition) => ({
    id: newId(`report_def_${definition.surface.toLowerCase()}`),
    tenant_id: null,
    surface: definition.surface,
    report_key: definition.report_key,
    report_category: definition.category,
    title: definition.title,
    description: definition.description,
    module_page: definition.module_page,
    required_feature: definition.required_feature || '',
    required_role_capability: definition.required_role_capability || '',
    default_format: 'CSV',
    enabled: 1,
    printable: 1,
    created_at: nowIso(),
    updated_at: nowIso()
  }));
}

export function getReportSeedRows() {
  const reportRuns = [
    {
      id: 'report_run_intelli_stock_001',
      tenant_id: 'tenant_intelliflow_systems',
      surface: 'TENANT',
      report_key: 'inventory_stock_position',
      report_title: 'Inventory Stock Position',
      report_category: 'Operational Reports',
      module_page: 'Inventory Control',
      run_no: 'RPT-0001',
      format: 'CSV',
      status: 'COMPLETED',
      filters_json: JSON.stringify({ dateFrom: '', dateTo: '' }),
      row_count: 5,
      failure_reason: '',
      output_file_name: 'opstrax_inventory_stock_position_RPT-0001.csv',
      output_content_type: 'text/csv; charset=utf-8',
      created_at: '2026-06-15T08:10:00Z',
      created_by_user_id: 'tenant_intelliflow_systems_user_admin',
      created_by_platform_user_id: null,
      started_at: '2026-06-15T08:10:00Z',
      completed_at: '2026-06-15T08:10:01Z',
      cancelled_at: null,
      updated_at: '2026-06-15T08:10:01Z'
    },
    {
      id: 'report_run_intelli_procurement_001',
      tenant_id: 'tenant_intelliflow_systems',
      surface: 'TENANT',
      report_key: 'procurement_pr_po_activity',
      report_title: 'Procurement PR/PO Activity',
      report_category: 'Operational Reports',
      module_page: 'Procurement Center',
      run_no: 'RPT-0002',
      format: 'CSV',
      status: 'COMPLETED',
      filters_json: JSON.stringify({ dateFrom: '', dateTo: '' }),
      row_count: 6,
      failure_reason: '',
      output_file_name: 'opstrax_procurement_pr_po_activity_RPT-0002.csv',
      output_content_type: 'text/csv; charset=utf-8',
      created_at: '2026-06-15T09:20:00Z',
      created_by_user_id: 'tenant_intelliflow_systems_user_finance',
      created_by_platform_user_id: null,
      started_at: '2026-06-15T09:20:00Z',
      completed_at: '2026-06-15T09:20:02Z',
      cancelled_at: null,
      updated_at: '2026-06-15T09:20:02Z'
    },
    {
      id: 'report_run_intelli_audit_001',
      tenant_id: 'tenant_intelliflow_systems',
      surface: 'TENANT',
      report_key: 'audit_trail_summary',
      report_title: 'Audit Trail Summary',
      report_category: 'Compliance Reports',
      module_page: 'Audit Trail',
      run_no: 'RPT-0003',
      format: 'CSV',
      status: 'COMPLETED',
      filters_json: JSON.stringify({ dateFrom: '', dateTo: '' }),
      row_count: 8,
      failure_reason: '',
      output_file_name: 'opstrax_audit_trail_summary_RPT-0003.csv',
      output_content_type: 'text/csv; charset=utf-8',
      created_at: '2026-06-15T11:00:00Z',
      created_by_user_id: 'tenant_intelliflow_systems_user_admin',
      created_by_platform_user_id: null,
      started_at: '2026-06-15T11:00:00Z',
      completed_at: '2026-06-15T11:00:01Z',
      cancelled_at: null,
      updated_at: '2026-06-15T11:00:01Z'
    },
    {
      id: 'report_run_intelli_failed_001',
      tenant_id: 'tenant_intelliflow_systems',
      surface: 'TENANT',
      report_key: 'finance_export_readiness',
      report_title: 'Finance Export Readiness',
      report_category: 'Finance Reports',
      module_page: 'Finance Export Hub',
      run_no: 'RPT-0004',
      format: 'CSV',
      status: 'FAILED',
      filters_json: JSON.stringify({ dateFrom: '', dateTo: '' }),
      row_count: 0,
      failure_reason: 'Export validation blocked by unresolved accounting code mismatches.',
      output_file_name: '',
      output_content_type: '',
      created_at: '2026-06-15T12:40:00Z',
      created_by_user_id: 'tenant_intelliflow_systems_user_finance',
      created_by_platform_user_id: null,
      started_at: '2026-06-15T12:40:00Z',
      completed_at: '2026-06-15T12:40:02Z',
      cancelled_at: null,
      updated_at: '2026-06-15T12:40:02Z'
    },
    {
      id: 'report_run_platform_summary_001',
      tenant_id: null,
      surface: 'PLATFORM',
      report_key: 'platform_tenant_summary',
      report_title: 'Tenant Subscription Summary',
      report_category: 'Platform Reports',
      module_page: 'Platform Dashboard',
      run_no: 'PRPT-0001',
      format: 'CSV',
      status: 'COMPLETED',
      filters_json: JSON.stringify({}),
      row_count: 3,
      failure_reason: '',
      output_file_name: 'opstrax_platform_tenant_summary_PRPT-0001.csv',
      output_content_type: 'text/csv; charset=utf-8',
      created_at: '2026-06-15T13:30:00Z',
      created_by_user_id: null,
      created_by_platform_user_id: 'platform_user_admin',
      started_at: '2026-06-15T13:30:00Z',
      completed_at: '2026-06-15T13:30:01Z',
      cancelled_at: null,
      updated_at: '2026-06-15T13:30:01Z'
    }
  ];

  return {
    reportDefinitions: getReportDefinitionsSeed(),
    reportRuns,
    reportExports: [
      {
        id: 'report_export_intelli_stock_001',
        tenant_id: 'tenant_intelliflow_systems',
        surface: 'TENANT',
        report_run_id: 'report_run_intelli_stock_001',
        export_format: 'CSV',
        file_name: 'opstrax_inventory_stock_position_RPT-0001.csv',
        content_type: 'text/csv; charset=utf-8',
        content_text: 'SKU,Item,Facility,Bin,On Hand,Available,Low Stock\nGLV-100,Nitrile Gloves,Main Distribution Center,BIN-A-01,140,140,0\n',
        content_blob: null,
        checksum_sha256: 'seeded-stock-report',
        created_at: '2026-06-15T08:10:01Z',
        created_by_user_id: 'tenant_intelliflow_systems_user_admin',
        created_by_platform_user_id: null
      },
      {
        id: 'report_export_intelli_procurement_001',
        tenant_id: 'tenant_intelliflow_systems',
        surface: 'TENANT',
        report_run_id: 'report_run_intelli_procurement_001',
        export_format: 'CSV',
        file_name: 'opstrax_procurement_pr_po_activity_RPT-0002.csv',
        content_type: 'text/csv; charset=utf-8',
        content_text: 'Type,Record,Vendor,Department,Status,Amount\nPR,PR-24081,MedSupply Direct,Operations,APPROVED,2840\nPO,PO-24057,MedSupply Direct,Operations,ISSUED,2840\n',
        content_blob: null,
        checksum_sha256: 'seeded-procurement-report',
        created_at: '2026-06-15T09:20:02Z',
        created_by_user_id: 'tenant_intelliflow_systems_user_finance',
        created_by_platform_user_id: null
      },
      {
        id: 'report_export_intelli_audit_001',
        tenant_id: 'tenant_intelliflow_systems',
        surface: 'TENANT',
        report_run_id: 'report_run_intelli_audit_001',
        export_format: 'CSV',
        file_name: 'opstrax_audit_trail_summary_RPT-0003.csv',
        content_type: 'text/csv; charset=utf-8',
      content_text: 'At,Action,Entity,Entity ID,Role,Summary\n2026-06-15T11:00:00Z,APPROVE_PURCHASE_REQUEST,purchase_request,pr-1,supervisor,Approved purchase request PR-24081\n',
      content_blob: null,
        checksum_sha256: 'seeded-audit-report',
        created_at: '2026-06-15T11:00:01Z',
        created_by_user_id: 'tenant_intelliflow_systems_user_admin',
        created_by_platform_user_id: null
      },
      {
        id: 'report_export_platform_summary_001',
        tenant_id: null,
        surface: 'PLATFORM',
        report_run_id: 'report_run_platform_summary_001',
        export_format: 'CSV',
        file_name: 'opstrax_platform_tenant_summary_PRPT-0001.csv',
        content_type: 'text/csv; charset=utf-8',
        content_text: 'Tenant,Plan,Status,Subscription,Modules,Support Sessions\nIntelliFlow Systems,Enterprise,ACTIVE,ACTIVE,23,2\n',
        content_blob: null,
        checksum_sha256: 'seeded-platform-report',
        created_at: '2026-06-15T13:30:01Z',
        created_by_user_id: null,
        created_by_platform_user_id: 'platform_user_admin'
      }
    ]
  };
}
