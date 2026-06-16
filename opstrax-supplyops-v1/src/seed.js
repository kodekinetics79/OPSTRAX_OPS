const tenants = [
  {
    id: 'tenant_intelliflow_systems',
    name: 'IntelliFlow Systems',
    slug: 'intelliflow-systems',
    industry: 'Enterprise Supply Operations',
    tier: 'full'
  },
  {
    id: 'tenant_evostel',
    name: 'Evostel LLC',
    slug: 'evostel',
    industry: 'Restricted Field Operations',
    tier: 'restricted'
  }
];

const featureKeys = [
  'command_center',
  'inventory_control',
  'inventory_core_write',
  'warehouse_workflows',
  'internal_storefront',
  'procurement_purchasing',
  'supplier_governance',
  'contract_repository',
  'budget_controls',
  'procurement_waivers',
  'procurement_advisory',
  'procure_to_pay_intelligence',
  'receiving_core',
  'offline_ops',
  'worker_safe_mode',
  'barcode_device_hub',
  'finance_sync_export_hub',
  'integration_center',
  'documents_evidence_vault',
  'audit_black_box',
  'compliance_center',
  'ask_opstrax_ai',
  'reports',
  'admin'
];

const roles = [
  { key: 'admin', name: 'Platform Admin', description: 'Full tenant and platform control.' },
  { key: 'supervisor', name: 'Supervisor', description: 'Approvals, reviews, and oversight.' },
  { key: 'requester', name: 'Requester', description: 'Department requests and tracking.' },
  { key: 'worker', name: 'Worker', description: 'Warehouse execution and offline tasks.' },
  { key: 'finance', name: 'Finance', description: 'Export review and accounting controls.' }
];

const permissions = [
  { key: 'view_dashboard', name: 'View dashboard', description: 'Read the command center and summary surfaces.' },
  { key: 'view_inventory', name: 'View inventory', description: 'Read stock, bins, and item state.' },
  { key: 'manage_inventory', name: 'Manage inventory', description: 'Perform inventory writes and warehouse actions.' },
  { key: 'manage_items', name: 'Manage items', description: 'Create and update inventory item master records.' },
  { key: 'adjust_stock', name: 'Adjust stock', description: 'Post stock adjustments and linked movements.' },
  { key: 'view_stock_movements', name: 'View stock movements', description: 'Read movement and adjustment history.' },
  { key: 'view_restricted_items', name: 'View restricted items', description: 'See controlled or restricted inventory items.' },
  { key: 'manage_restricted_items', name: 'Manage restricted items', description: 'Create and update restricted inventory items.' },
  { key: 'view_requests', name: 'View requests', description: 'Read internal request records.' },
  { key: 'create_request', name: 'Create requests', description: 'Create internal requests.' },
  { key: 'submit_request', name: 'Submit requests', description: 'Submit internal requests for review.' },
  { key: 'approve_request', name: 'Approve requests', description: 'Approve internal requests.' },
  { key: 'reject_request', name: 'Reject requests', description: 'Reject internal requests after review.' },
  { key: 'cancel_request', name: 'Cancel requests', description: 'Cancel internal requests before issue.' },
  { key: 'issue_request', name: 'Issue requests', description: 'Issue inventory against internal requests.' },
  { key: 'view_warehouse_tasks', name: 'View warehouse tasks', description: 'Read warehouse task queues and task details.' },
  { key: 'manage_warehouse_tasks', name: 'Manage warehouse tasks', description: 'Create, assign, close, and cancel warehouse tasks.' },
  { key: 'execute_warehouse_tasks', name: 'Execute warehouse tasks', description: 'Start, pick, and issue warehouse task lines.' },
  { key: 'view_purchasing', name: 'View purchasing', description: 'Read purchase request records.' },
  { key: 'view_purchase_orders', name: 'View purchase orders', description: 'Read purchase order records.' },
  { key: 'create_purchase_request', name: 'Create purchase requests', description: 'Draft purchase requests.' },
  { key: 'update_purchase_request', name: 'Update purchase requests', description: 'Edit purchase requests before approval.' },
  { key: 'submit_purchase_request', name: 'Submit purchase requests', description: 'Submit purchase requests for approval.' },
  { key: 'approve_purchase_request', name: 'Approve purchase requests', description: 'Approve purchase requests.' },
  { key: 'reject_purchase_request', name: 'Reject purchase requests', description: 'Reject purchase requests.' },
  { key: 'cancel_purchase_request', name: 'Cancel purchase requests', description: 'Cancel purchase requests.' },
  { key: 'view_vendors', name: 'View vendors', description: 'Read vendor records.' },
  { key: 'manage_vendors', name: 'Manage vendors', description: 'Maintain vendor records.' },
  { key: 'view_supplier_governance', name: 'View supplier governance', description: 'Read supplier compliance, contract, and risk posture.' },
  { key: 'manage_supplier_governance', name: 'Manage supplier governance', description: 'Maintain supplier compliance documents and waivers.' },
  { key: 'view_contract_repository', name: 'View contract repository', description: 'Read supplier contract records and alerts.' },
  { key: 'manage_contract_repository', name: 'Manage contract repository', description: 'Maintain supplier contract records.' },
  { key: 'view_budget_controls', name: 'View budget controls', description: 'Read department and cost-center budgets.' },
  { key: 'manage_budget_controls', name: 'Manage budget controls', description: 'Maintain department and cost-center budgets.' },
  { key: 'approve_budget_exception', name: 'Approve budget exceptions', description: 'Approve over-budget waivers and escalations.' },
  { key: 'manage_procurement_waivers', name: 'Manage procurement waivers', description: 'Create and review procurement waivers.' },
  { key: 'view_procurement_advisory', name: 'View procurement advisory', description: 'Read advisory-only supplier, contract, and budget intelligence.' },
  { key: 'view_procure_to_pay', name: 'View procure-to-pay intelligence', description: 'Read invoice, RFQ, quote, and supplier intelligence surfaces.' },
  { key: 'view_vendor_invoices', name: 'View vendor invoices', description: 'Read vendor invoice records and match posture.' },
  { key: 'create_vendor_invoice', name: 'Create vendor invoices', description: 'Intake vendor invoices into the procure-to-pay workspace.' },
  { key: 'update_vendor_invoice', name: 'Update vendor invoices', description: 'Edit vendor invoice metadata before approval.' },
  { key: 'extract_vendor_invoice', name: 'Extract vendor invoices', description: 'Run deterministic invoice extraction and normalization.' },
  { key: 'match_vendor_invoice', name: 'Match vendor invoices', description: 'Run 2-way and 3-way invoice matching.' },
  { key: 'waive_invoice_exception', name: 'Waive invoice exceptions', description: 'Waive matching exceptions with a required reason.' },
  { key: 'approve_vendor_invoice', name: 'Approve vendor invoices', description: 'Approve invoices after matching is complete.' },
  { key: 'reject_vendor_invoice', name: 'Reject vendor invoices', description: 'Reject invoices that cannot be processed.' },
  { key: 'mark_invoice_export_ready', name: 'Mark invoice export ready', description: 'Mark approved invoices as export-ready.' },
  { key: 'export_vendor_invoice', name: 'Export vendor invoices', description: 'Create a local export event for approved invoices.' },
  { key: 'view_rfq_requests', name: 'View RFQ requests', description: 'Read RFQ records and quote comparison surfaces.' },
  { key: 'create_rfq_request', name: 'Create RFQ requests', description: 'Draft RFQ requests for supplier sourcing.' },
  { key: 'update_rfq_request', name: 'Update RFQ requests', description: 'Edit RFQ requests before sending.' },
  { key: 'send_rfq_request', name: 'Send RFQ requests', description: 'Move RFQs into the sent state.' },
  { key: 'evaluate_rfq_request', name: 'Evaluate RFQ requests', description: 'Compare vendor quotes against RFQ lines.' },
  { key: 'award_rfq_request', name: 'Award RFQ requests', description: 'Award a quote after evaluation.' },
  { key: 'cancel_rfq_request', name: 'Cancel RFQ requests', description: 'Cancel RFQ requests before award.' },
  { key: 'view_vendor_quotes', name: 'View vendor quotes', description: 'Read quote records and line comparisons.' },
  { key: 'create_vendor_quote', name: 'Create vendor quotes', description: 'Create vendor quote records for an RFQ.' },
  { key: 'update_vendor_quote', name: 'Update vendor quotes', description: 'Edit quote metadata before submission.' },
  { key: 'submit_vendor_quote', name: 'Submit vendor quotes', description: 'Submit a quote into comparison review.' },
  { key: 'shortlist_vendor_quote', name: 'Shortlist vendor quotes', description: 'Shortlist a vendor quote for award review.' },
  { key: 'award_vendor_quote', name: 'Award vendor quotes', description: 'Award a vendor quote.' },
  { key: 'reject_vendor_quote', name: 'Reject vendor quotes', description: 'Reject a vendor quote during evaluation.' },
  { key: 'expire_vendor_quote', name: 'Expire vendor quotes', description: 'Expire a stale vendor quote.' },
  { key: 'view_vendor_scorecards', name: 'View vendor scorecards', description: 'Read vendor scorecard history and risk posture.' },
  { key: 'view_exports', name: 'View exports', description: 'Read export batches, validation, and dispatch posture.' },
  { key: 'create_export_batch', name: 'Create export batch', description: 'Create a finance export batch from live tenant records.' },
  { key: 'validate_export_batch', name: 'Validate export batch', description: 'Run export validation against tenant data.' },
  { key: 'approve_export_batch', name: 'Approve export batch', description: 'Approve export batches for payload generation.' },
  { key: 'generate_export_batch', name: 'Generate export batch', description: 'Generate export payloads from validated tenant data.' },
  { key: 'dispatch_export_batch', name: 'Dispatch export batch', description: 'Dispatch export batches to configured or sandbox integration targets.' },
  { key: 'cancel_export_batch', name: 'Cancel export batch', description: 'Cancel export batches before dispatch.' },
  { key: 'view_export_errors', name: 'View export errors', description: 'Read export validation issues.' },
  { key: 'view_integrations', name: 'View integrations', description: 'Read integration connections and jobs.' },
  { key: 'retry_integration_job', name: 'Retry integration job', description: 'Retry failed integration jobs.' },
  { key: 'cancel_integration_job', name: 'Cancel integration job', description: 'Cancel queued or retrying integration jobs.' },
  { key: 'create_purchase_order', name: 'Create purchase orders', description: 'Create purchase orders from approved requests.' },
  { key: 'update_purchase_order', name: 'Update purchase orders', description: 'Edit purchase orders before approval.' },
  { key: 'approve_purchase_order', name: 'Approve purchase orders', description: 'Approve purchase orders.' },
  { key: 'issue_purchase_order', name: 'Issue purchase orders', description: 'Issue purchase orders without receiving stock.' },
  { key: 'cancel_purchase_order', name: 'Cancel purchase orders', description: 'Cancel purchase orders before or after approval.' },
  { key: 'view_receiving', name: 'View receiving', description: 'Read receiving sessions and receipt posture.' },
  { key: 'create_receive_session', name: 'Create receive sessions', description: 'Create receiving sessions from issued purchase orders.' },
  { key: 'start_receive_session', name: 'Start receive sessions', description: 'Start a receive session before capturing quantities.' },
  { key: 'receive_stock', name: 'Receive stock', description: 'Capture received, damaged, and short quantities.' },
  { key: 'post_receipt', name: 'Post receipt', description: 'Post receipt stock movements and close receive sessions.' },
  { key: 'cancel_receive_session', name: 'Cancel receive sessions', description: 'Cancel open receive sessions.' },
  { key: 'record_receive_exception', name: 'Record receiving exception', description: 'Record exceptions on receiving sessions.' },
  { key: 'over_receive_stock', name: 'Over receive stock', description: 'Allow receiving over the ordered quantity with review.' },
  { key: 'view_evidence', name: 'View evidence', description: 'Read evidence metadata and links.' },
  { key: 'manage_evidence', name: 'Manage evidence', description: 'Create and link evidence records.' },
  { key: 'verify_evidence', name: 'Verify evidence', description: 'Mark evidence as verified or rejected.' },
  { key: 'archive_evidence', name: 'Archive evidence', description: 'Archive evidence records.' },
  { key: 'upload_evidence', name: 'Upload evidence', description: 'Upload and link evidence documents.' },
  { key: 'view_audit', name: 'View audit', description: 'Read audit events and traces.' },
  { key: 'view_compliance', name: 'View compliance', description: 'Read compliance readiness data.' },
  { key: 'manage_compliance', name: 'Manage compliance', description: 'Update compliance controls and exceptions.' },
  { key: 'manage_exports', name: 'Manage exports', description: 'Validate, generate, and dispatch finance exports.' },
  { key: 'manage_devices', name: 'Manage devices', description: 'Control device trust and registry data.' },
  { key: 'manage_bins', name: 'Manage bins', description: 'Create and maintain storage bins.' },
  { key: 'manage_users', name: 'Manage users', description: 'Create and maintain user accounts.' },
  { key: 'manage_roles', name: 'Manage roles', description: 'Adjust role assignments and role policy.' },
  { key: 'manage_facilities', name: 'Manage facilities', description: 'Create and maintain facilities.' },
  { key: 'manage_departments', name: 'Manage departments', description: 'Create and maintain departments.' },
  { key: 'review_sync', name: 'Review sync batches', description: 'Review offline batches and conflicts.' },
  { key: 'manage_labels', name: 'Manage labels', description: 'Queue and review label jobs.' },
  { key: 'manage_ai_recommendations', name: 'Manage AI recommendations', description: 'Review AI recommendations.' },
  { key: 'approve_ai_action', name: 'Approve AI actions', description: 'Approve AI-assisted recommendations.' },
  { key: 'manage_integrations', name: 'Manage integrations', description: 'Maintain integration jobs and connectors.' },
  { key: 'manage_admin', name: 'Manage admin', description: 'Access tenant administration surfaces.' },
  { key: 'view_devices', name: 'View devices', description: 'Read device registry and trust posture.' },
  { key: 'manage_devices', name: 'Manage devices', description: 'Create and update devices in the registry.' },
  { key: 'trust_device', name: 'Trust device', description: 'Set device to trusted state.' },
  { key: 'suspend_device', name: 'Suspend device', description: 'Suspend a trusted device.' },
  { key: 'revoke_device', name: 'Revoke device', description: 'Permanently revoke a device.' },
  { key: 'record_scan_event', name: 'Record scan event', description: 'Record barcode or QR scan events from a device.' },
  { key: 'validate_scan', name: 'Validate scan', description: 'Validate scan input against inventory context.' },
  { key: 'view_offline_batches', name: 'View offline batches', description: 'Read offline sync batches and task detail.' },
  { key: 'create_offline_batch', name: 'Create offline batch', description: 'Create and upload offline sync batches.' },
  { key: 'validate_offline_batch', name: 'Validate offline batch', description: 'Run server-side validation on offline batches.' },
  { key: 'replay_offline_batch', name: 'Replay offline batch', description: 'Replay offline batch actions against backend services.' },
  { key: 'approve_offline_batch', name: 'Approve offline batch', description: 'Approve offline batches for posting.' },
  { key: 'reject_offline_batch', name: 'Reject offline batch', description: 'Reject offline batches from posting.' },
  { key: 'view_sync_conflicts', name: 'View sync conflicts', description: 'Read sync conflict records.' },
  { key: 'resolve_sync_conflicts', name: 'Resolve sync conflicts', description: 'Approve or reject individual sync conflicts.' },
  { key: 'view_ai_summary', name: 'View AI summary', description: 'View AI operations summary and KPIs.' },
  { key: 'view_ai_recommendations', name: 'View AI recommendations', description: 'Read AI recommendations and source citations.' },
  { key: 'generate_ai_recommendations', name: 'Generate AI recommendations', description: 'Trigger AI recommendation generation runs.' },
  { key: 'dismiss_ai_recommendations', name: 'Dismiss AI recommendations', description: 'Dismiss AI recommendations from the queue.' },
  { key: 'approve_ai_placeholder', name: 'Approve AI placeholder', description: 'Mark an AI recommendation as placeholder-approved (no domain action).' },
  { key: 'view_ai_runs', name: 'View AI runs', description: 'Read AI execution run logs.' },
  { key: 'query_ops_copilot', name: 'Query Ops Copilot', description: 'Submit read-only queries to the Ops Copilot.' },
  { key: 'view_restricted_ai_context', name: 'View restricted AI context', description: 'Allow AI context to include restricted/controlled items.' }
];

const rolePermissions = {
  admin: permissions.map((permission) => permission.key),
  supervisor: [
    'view_dashboard',
    'view_inventory',
    'manage_inventory',
    'manage_items',
    'adjust_stock',
    'view_stock_movements',
    'view_restricted_items',
    'manage_restricted_items',
    'view_requests',
    'submit_request',
    'approve_request',
    'reject_request',
    'cancel_request',
    'issue_request',
    'view_warehouse_tasks',
    'manage_warehouse_tasks',
    'execute_warehouse_tasks',
    'view_purchasing',
    'view_purchase_orders',
    'create_purchase_request',
    'update_purchase_request',
    'submit_purchase_request',
    'approve_purchase_request',
    'reject_purchase_request',
    'cancel_purchase_request',
    'view_vendors',
    'manage_vendors',
    'view_supplier_governance',
    'manage_supplier_governance',
    'view_contract_repository',
    'manage_contract_repository',
    'view_budget_controls',
    'manage_budget_controls',
    'approve_budget_exception',
    'manage_procurement_waivers',
    'view_procurement_advisory',
    'view_procure_to_pay',
    'view_vendor_invoices',
    'create_vendor_invoice',
    'update_vendor_invoice',
    'extract_vendor_invoice',
    'match_vendor_invoice',
    'waive_invoice_exception',
    'approve_vendor_invoice',
    'reject_vendor_invoice',
    'mark_invoice_export_ready',
    'export_vendor_invoice',
    'view_rfq_requests',
    'create_rfq_request',
    'update_rfq_request',
    'send_rfq_request',
    'evaluate_rfq_request',
    'award_rfq_request',
    'cancel_rfq_request',
    'view_vendor_quotes',
    'create_vendor_quote',
    'update_vendor_quote',
    'submit_vendor_quote',
    'shortlist_vendor_quote',
    'award_vendor_quote',
    'reject_vendor_quote',
    'expire_vendor_quote',
    'view_vendor_scorecards',
    'view_exports',
    'create_export_batch',
    'validate_export_batch',
    'approve_export_batch',
    'generate_export_batch',
    'dispatch_export_batch',
    'cancel_export_batch',
    'view_export_errors',
    'view_integrations',
    'retry_integration_job',
    'cancel_integration_job',
    'create_purchase_order',
    'update_purchase_order',
    'approve_purchase_order',
    'issue_purchase_order',
    'cancel_purchase_order',
    'view_evidence',
    'manage_evidence',
    'verify_evidence',
    'archive_evidence',
    'upload_evidence',
    'view_receiving',
    'create_receive_session',
    'start_receive_session',
    'receive_stock',
    'post_receipt',
    'cancel_receive_session',
    'record_receive_exception',
    'over_receive_stock',
    'view_audit',
    'view_compliance',
    'manage_compliance',
    'manage_exports',
    'manage_devices',
    'manage_bins',
    'review_sync',
    'manage_labels',
    'manage_ai_recommendations',
    'approve_ai_action',
    'view_devices', 'trust_device', 'suspend_device', 'revoke_device',
    'record_scan_event', 'validate_scan',
    'view_offline_batches', 'create_offline_batch', 'validate_offline_batch',
    'replay_offline_batch', 'approve_offline_batch', 'reject_offline_batch',
    'view_sync_conflicts', 'resolve_sync_conflicts',
    'view_ai_summary', 'view_ai_recommendations', 'generate_ai_recommendations',
    'dismiss_ai_recommendations', 'approve_ai_placeholder', 'view_ai_runs', 'query_ops_copilot',
    'view_restricted_ai_context'
  ],
  requester: ['view_dashboard', 'view_inventory', 'view_requests', 'create_request', 'submit_request', 'cancel_request', 'view_purchasing', 'view_purchase_orders', 'view_vendors', 'view_supplier_governance', 'view_contract_repository', 'view_budget_controls', 'create_purchase_request', 'update_purchase_request', 'submit_purchase_request', 'cancel_purchase_request', 'view_evidence', 'upload_evidence', 'view_audit', 'view_ai_summary', 'query_ops_copilot'],
  worker: ['view_dashboard', 'view_inventory', 'view_requests', 'view_stock_movements', 'view_warehouse_tasks', 'execute_warehouse_tasks', 'manage_labels', 'review_sync', 'view_receiving', 'view_devices', 'record_scan_event', 'validate_scan', 'view_offline_batches', 'create_offline_batch', 'query_ops_copilot'],
  finance: [
    'view_dashboard',
    'view_inventory',
    'view_requests',
    'view_stock_movements',
    'view_warehouse_tasks',
    'view_purchasing',
    'view_purchase_orders',
    'view_vendors',
    'view_supplier_governance',
    'manage_supplier_governance',
    'view_contract_repository',
    'manage_contract_repository',
    'view_budget_controls',
    'manage_budget_controls',
    'approve_budget_exception',
    'manage_procurement_waivers',
    'view_procurement_advisory',
    'create_purchase_request',
    'update_purchase_request',
    'submit_purchase_request',
    'approve_purchase_request',
    'reject_purchase_request',
    'cancel_purchase_request',
    'view_procure_to_pay',
    'view_vendor_invoices',
    'create_vendor_invoice',
    'update_vendor_invoice',
    'extract_vendor_invoice',
    'match_vendor_invoice',
    'waive_invoice_exception',
    'approve_vendor_invoice',
    'reject_vendor_invoice',
    'mark_invoice_export_ready',
    'export_vendor_invoice',
    'view_rfq_requests',
    'create_rfq_request',
    'update_rfq_request',
    'send_rfq_request',
    'evaluate_rfq_request',
    'award_rfq_request',
    'cancel_rfq_request',
    'view_vendor_quotes',
    'create_vendor_quote',
    'update_vendor_quote',
    'submit_vendor_quote',
    'shortlist_vendor_quote',
    'award_vendor_quote',
    'reject_vendor_quote',
    'expire_vendor_quote',
    'view_vendor_scorecards',
    'view_exports',
    'create_export_batch',
    'validate_export_batch',
    'approve_export_batch',
    'generate_export_batch',
    'dispatch_export_batch',
    'cancel_export_batch',
    'view_export_errors',
    'view_integrations',
    'retry_integration_job',
    'cancel_integration_job',
    'manage_exports',
    'view_evidence',
    'manage_evidence',
    'verify_evidence',
    'archive_evidence',
    'view_audit',
    'view_compliance',
    'view_receiving',
    'create_purchase_order',
    'update_purchase_order',
    'approve_purchase_order',
    'issue_purchase_order',
    'cancel_purchase_order',
    'view_ai_summary', 'view_ai_recommendations', 'view_ai_runs', 'query_ops_copilot'
  ]
};

const departmentNames = [
  { key: 'operations', name: 'Operations', code: 'OPS' },
  { key: 'warehouse', name: 'Warehouse', code: 'WH' },
  { key: 'medical', name: 'Medical Unit', code: 'MED' },
  { key: 'facilities', name: 'Facilities', code: 'FAC' },
  { key: 'kitchen', name: 'Kitchen Ops', code: 'KIT' },
  { key: 'finance', name: 'Finance', code: 'FIN' }
];

const facilityNames = [
  { key: 'main', name: 'Main Distribution Center', code: 'WH1', city: 'Riverton', state: 'TX' },
  { key: 'north', name: 'North Stock Yard', code: 'YRD', city: 'Riverton', state: 'TX' }
];

const baseItems = [
  { key: 'gloves', sku: 'GLV-MED-001', name: 'Nitrile Gloves - Medium', category: 'Medical Supplies', uom: 'box', barcode: 'OS-1001', minQty: 200, maxQty: 750, restricted: 0, supplier: 'MedSupply Direct', onHand: 126, reserved: 18 },
  { key: 'cleaner', sku: 'JAN-CLN-002', name: 'Facility Cleaner Concentrate', category: 'Janitorial', uom: 'case', barcode: 'OS-1002', minQty: 40, maxQty: 160, restricted: 0, supplier: 'FacilityPro Wholesale', onHand: 84, reserved: 6 },
  { key: 'toolkit', sku: 'TOOL-SEC-003', name: 'Secure Tool Kit - Maintenance', category: 'Restricted Tools', uom: 'kit', barcode: 'OS-1003', minQty: 10, maxQty: 25, restricted: 1, supplier: 'SecureTool Supply', onHand: 12, reserved: 2 },
  { key: 'labels', sku: 'LAB-PRN-004', name: 'Printer Labels 4x6', category: 'Warehouse Supplies', uom: 'roll', barcode: 'OS-1004', minQty: 50, maxQty: 250, restricted: 0, supplier: 'LabelWorks', onHand: 36, reserved: 4 },
  { key: 'tube', sku: 'FAC-LGT-005', name: 'LED Replacement Tube', category: 'Facilities', uom: 'each', barcode: 'OS-1005', minQty: 60, maxQty: 300, restricted: 0, supplier: 'Lighting Supply Co', onHand: 210, reserved: 22 },
  { key: 'filters', sku: 'HVAC-FLT-006', name: 'HVAC Filter 20x20', category: 'Facilities', uom: 'each', barcode: 'OS-1006', minQty: 30, maxQty: 120, restricted: 0, supplier: 'AirFlow Supply', onHand: 28, reserved: 8 }
];

const categoryCatalog = [...new Set(baseItems.map((item) => item.category))].map((name, index) => ({
  id: `category_${String(index + 1).padStart(2, '0')}`,
  name,
  code: name.toUpperCase().replace(/[^A-Z0-9]+/g, '_').slice(0, 24)
}));

const baseRequestSets = [
  {
    no: 'REQ-2409',
    department: 'medical',
    status: 'PICKING',
    priority: 'HIGH',
    purpose: 'Replenish consumables for clinic intake desk.',
    requester: 'requester',
    lines: [
      { item: 'gloves', qty: 50, issued: 12 },
      { item: 'labels', qty: 6, issued: 0 }
    ]
  },
  {
    no: 'REQ-2410',
    department: 'facilities',
    status: 'APPROVED',
    priority: 'NORMAL',
    purpose: 'Replacement lighting for north corridor.',
    requester: 'requester',
    lines: [
      { item: 'tube', qty: 30, issued: 0 }
    ]
  },
  {
    no: 'REQ-2411',
    department: 'kitchen',
    status: 'SUBMITTED',
    priority: 'NORMAL',
    purpose: 'Sanitation restock for meal prep area.',
    requester: 'requester',
    lines: [
      { item: 'cleaner', qty: 8, issued: 0 }
    ]
  }
];

const basePurchaseRequests = [
  {
    no: 'PR-8812',
    vendor: 'MedSupply Direct',
    accountingCode: 'MED-INV-4420',
    status: 'PENDING_APPROVAL',
    amount: 2840,
    invoiceStatus: 'NOT_RECEIVED',
    lines: [
      { item: 'gloves', description: 'Nitrile Gloves - Medium', qty: 400, unitPrice: 5.7 }
    ]
  },
  {
    no: 'PR-8813',
    vendor: 'FacilityPro Wholesale',
    accountingCode: 'FAC-MAT-2210',
    status: 'APPROVED',
    amount: 7420,
    invoiceStatus: 'RECEIVED',
    lines: [
      { item: 'cleaner', description: 'Facility Cleaner Concentrate', qty: 120, unitPrice: 18.5 },
      { item: 'tube', description: 'LED Replacement Tube', qty: 220, unitPrice: 14.0 }
    ]
  },
  {
    no: 'PR-8814',
    vendor: 'LabelWorks',
    accountingCode: '',
    status: 'DRAFT',
    amount: 615,
    invoiceStatus: 'NOT_RECEIVED',
    lines: [
      { item: 'labels', description: 'Printer Labels 4x6', qty: 48, unitPrice: 12.8 }
    ]
  }
];

const baseVendorCatalog = [
  { name: 'MedSupply Direct', code: 'VND-MED-001', status: 'ACTIVE', risk: 18, contact: 'Dana Reed', email: 'orders@medsupplydirect.example', phone: '512-555-0110' },
  { name: 'FacilityPro Wholesale', code: 'VND-FAC-002', status: 'ACTIVE', risk: 22, contact: 'Iris Gomez', email: 'purchasing@facilitypro.example', phone: '512-555-0188' },
  { name: 'LabelWorks', code: 'VND-LAB-003', status: 'BLOCKED', risk: 34, contact: 'Mina Ortiz', email: 'sales@labelworks.example', phone: '512-555-0144' },
  { name: 'SecureTool Supply', code: 'VND-SEC-004', status: 'SUSPENDED', risk: 26, contact: 'Evan Cole', email: 'service@securetool.example', phone: '512-555-0191' }
];

const baseVendorScoreCards = [
  { vendor: 'MedSupply Direct', scoreType: 'ON_TIME_DELIVERY', value: 96, source: 'carrier-logs' },
  { vendor: 'MedSupply Direct', scoreType: 'QUALITY', value: 94, source: 'qa-review' },
  { vendor: 'FacilityPro Wholesale', scoreType: 'ON_TIME_DELIVERY', value: 91, source: 'carrier-logs' },
  { vendor: 'FacilityPro Wholesale', scoreType: 'QUALITY', value: 92, source: 'qa-review' },
  { vendor: 'LabelWorks', scoreType: 'ON_TIME_DELIVERY', value: 84, source: 'carrier-logs' },
  { vendor: 'LabelWorks', scoreType: 'QUALITY', value: 88, source: 'qa-review' },
  { vendor: 'LabelWorks', scoreType: 'LATE_DELIVERY', value: 72, source: 'carrier-logs' },
  { vendor: 'LabelWorks', scoreType: 'EXCEPTION_HISTORY', value: 64, source: 'procurement-review' },
  { vendor: 'SecureTool Supply', scoreType: 'LATE_DELIVERY', value: 68, source: 'carrier-logs' }
];

const baseSyncBatches = [
  {
    no: 'SYNC-4921',
    device: 'receiving',
    user: 'worker',
    taskCount: 27,
    exceptionCount: 1,
    status: 'NEEDS_SUPERVISOR_REVIEW',
    reviewStatus: 'PENDING',
    tasks: [
      { taskType: 'RECEIVE', entityType: 'purchase_request', entityKey: 'PR-8812', payload: { item: 'gloves', qty: 18, location: 'A-12-04' } },
      { taskType: 'PICK', entityType: 'internal_request', entityKey: 'REQ-2409', payload: { item: 'gloves', qty: 12, location: 'A-12-04' } },
      { taskType: 'ISSUE', entityType: 'internal_request', entityKey: 'REQ-2409', payload: { item: 'gloves', qty: 12, location: 'A-12-04' } }
    ]
  },
  {
    no: 'SYNC-4920',
    device: 'warehouse',
    user: 'supervisor',
    taskCount: 13,
    exceptionCount: 0,
    status: 'POSTED',
    reviewStatus: 'APPROVED',
    tasks: [
      { taskType: 'COUNT', entityType: 'bin_count', entityKey: 'A-12-04', payload: { item: 'gloves', counted: 126 } }
    ]
  }
];

function id(prefix, tenant, suffix) {
  return `${tenant.id}_${prefix}_${suffix}`;
}

function categoryId(tenant, name) {
  return id('category', tenant, name.toLowerCase().replace(/[^a-z0-9]+/g, '_'));
}

function featureFlagRows(tenant) {
  const enabled = new Set(
    tenant.tier === 'full'
      ? featureKeys
      : [
          'command_center',
          'inventory_control',
          'internal_storefront',
          'worker_safe_mode',
          'audit_black_box',
          'compliance_center',
          'reports'
        ]
  );
  return featureKeys.map((featureKey) => ({
    tenant_id: tenant.id,
    feature_key: featureKey,
    enabled: enabled.has(featureKey) ? 1 : 0
  }));
}

function buildTenantData(tenant, index) {
  const departmentMap = Object.fromEntries(
    departmentNames.map((dept) => [dept.key, {
      id: id('dept', tenant, dept.key),
      tenant_id: tenant.id,
      name: dept.name,
      code: dept.code
    }])
  );

  const facilityMap = Object.fromEntries(
    facilityNames.map((facility) => [facility.key, {
      id: id('facility', tenant, facility.key),
      tenant_id: tenant.id,
      name: facility.name,
      code: facility.code,
      city: facility.city,
      state: facility.state
    }])
  );

  const users = [
    { key: 'admin', name: 'Avery Grant', role_key: 'admin', department: 'operations', facility: 'main' },
    { key: 'supervisor', name: 'Jordan Pike', role_key: 'supervisor', department: 'warehouse', facility: 'main' },
    { key: 'requester', name: 'Maya Patel', role_key: 'requester', department: 'medical', facility: 'main' },
    { key: 'worker', name: 'Riley Chen', role_key: 'worker', department: 'warehouse', facility: 'north' },
    { key: 'finance', name: 'Sam Ortiz', role_key: 'finance', department: 'finance', facility: 'main' }
  ].map((user) => ({
    id: id('user', tenant, user.key),
    tenant_id: tenant.id,
    department_id: departmentMap[user.department].id,
    facility_id: facilityMap[user.facility].id,
    role_key: user.role_key,
    name: user.name,
    email: `${user.key}@${tenant.slug}.ops.local`,
    active: 1
  }));

  const deviceMap = {
    receiving: {
      id: id('device', tenant, 'receiving'),
      tenant_id: tenant.id,
      facility_id: facilityMap.main.id,
      name: 'Tablet Receiving 1',
      device_type: 'tablet',
      trusted: 1,
      last_seen_at: '2026-06-13T08:15:00Z'
    },
    warehouse: {
      id: id('device', tenant, 'warehouse'),
      tenant_id: tenant.id,
      facility_id: facilityMap.main.id,
      name: 'Warehouse Workstation 3',
      device_type: 'workstation',
      trusted: 1,
      last_seen_at: '2026-06-13T09:20:00Z'
    }
  };

  const itemMap = Object.fromEntries(
    baseItems.map((item) => [item.key, {
      id: id('item', tenant, item.key),
      tenant_id: tenant.id,
      sku: `${tenant.slug}-${item.sku}`,
      name: item.name,
      category: item.category,
      uom: item.uom,
      unit_of_measure: item.uom,
      barcode: `${tenant.slug.toUpperCase()}-${item.barcode}`,
      min_qty: item.minQty,
      max_qty: item.maxQty,
      min_stock: item.minQty,
      max_stock: item.maxQty,
      reorder_point: Math.max(0, Math.floor(item.minQty * 0.75)),
      restricted: item.restricted,
      controlled: item.restricted,
      item_type: item.restricted ? 'CONTROLLED' : (item.category === 'Medical Supplies' ? 'CONSUMABLE' : 'SUPPLY'),
      description: `${item.name} stocked for ${tenant.name}.`,
      status: 'ACTIVE',
      lot_required: item.category === 'Medical Supplies' ? 1 : 0,
      serial_required: item.restricted ? 1 : 0,
      expiry_required: item.category === 'Medical Supplies' ? 1 : 0,
      supplier: item.supplier,
      active: 1,
      item_category_id: categoryId(tenant, item.category),
      created_by_user_id: users.find((user) => user.role_key === 'admin').id,
      updated_by_user_id: users.find((user) => user.role_key === 'admin').id,
      updated_at: '2026-06-13T10:00:00Z'
    }])
  );

  const vendorMap = Object.fromEntries(
    baseVendorCatalog.map((vendor) => [vendor.name, {
      id: id('vendor', tenant, vendor.code.toLowerCase()),
      tenant_id: tenant.id,
      name: vendor.name,
      code: vendor.code,
      status: vendor.status,
      risk_score: vendor.risk,
      active: 1,
      blocked_reason: vendor.status === 'BLOCKED' ? 'Compliance documents expired.' : '',
      last_compliance_review_at: '2026-06-13T09:10:00Z',
      last_contract_review_at: '2026-06-13T09:15:00Z',
      contact_name: vendor.contact,
      email: vendor.email,
      phone: vendor.phone,
      last_reviewed_at: '2026-06-13T09:10:00Z',
      created_at: '2026-06-13T08:40:00Z',
      updated_at: '2026-06-13T09:10:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    }])
  );

  const bins = [
    { key: 'a1204', code: 'A-12-04', zone: 'Clinic', shelf: 'A12', facility: 'main' },
    { key: 'c0301', code: 'C-03-01', zone: 'Janitorial', shelf: 'C03', facility: 'main' },
    { key: 'sec01', code: 'SEC-01', zone: 'Secure Cage', shelf: 'SEC', facility: 'main' },
    { key: 'b0802', code: 'B-08-02', zone: 'Warehouse', shelf: 'B08', facility: 'main' },
    { key: 'd1109', code: 'D-11-09', zone: 'Facilities', shelf: 'D11', facility: 'north' }
  ].map((bin) => ({
    id: id('bin', tenant, bin.key),
    tenant_id: tenant.id,
    facility_id: facilityMap[bin.facility].id,
    code: bin.code,
    zone: bin.zone,
    shelf: bin.shelf
  }));

  const stockBalances = baseItems.map((item, itemIndex) => {
    const bin = bins[itemIndex % bins.length];
    const current = item.onHand;
    const reserved = item.reserved;
    return {
      id: id('stock', tenant, item.key),
      tenant_id: tenant.id,
      item_id: itemMap[item.key].id,
      facility_id: bin.facility_id,
      bin_id: bin.id,
      on_hand: current,
      reserved,
      available: current - reserved,
      updated_at: '2026-06-13T10:00:00Z'
    };
  });

  const itemByKey = (key) => itemMap[key].id;
  const vendorByName = (name) => vendorMap[name].id;
  const costCenterMap = Object.fromEntries(
    Object.values(departmentMap).map((department) => [department.code, {
      id: id('cost_center', tenant, department.code.toLowerCase()),
      tenant_id: tenant.id,
      department_id: department.id,
      code: `CC-${department.code}`,
      name: `${department.name} Cost Center`,
      status: 'ACTIVE',
      created_at: '2026-06-13T08:15:00Z',
      updated_at: '2026-06-13T08:15:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'admin').id
    }])
  );
  const costCenterByDepartmentId = Object.fromEntries(
    Object.values(costCenterMap).map((center) => [center.department_id, center])
  );
  const departmentBudgets = Object.values(costCenterMap).map((center, index) => {
    const budgetAmount = [18500, 14250, 9800, 12000, 11250, 54000][index] || 10000;
    const reservedAmount = [4200, 1800, 900, 1500, 800, 2400][index] || 1000;
    const consumedAmount = [2600, 1250, 700, 900, 450, 1200][index] || 500;
    return {
      id: id('budget', tenant, center.code.toLowerCase()),
      tenant_id: tenant.id,
      department_id: center.department_id,
      cost_center_id: center.id,
      fiscal_year: 2026,
      currency: 'USD',
      budget_amount: budgetAmount,
      reserved_amount: reservedAmount,
      consumed_amount: consumedAmount,
      alert_threshold_pct: 0.85,
      status: 'ACTIVE',
      created_at: '2026-06-13T08:20:00Z',
      updated_at: '2026-06-13T08:25:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'admin').id,
      updated_by_user_id: users.find((user) => user.role_key === 'finance').id
    };
  });
  const budgetLedgerEntries = departmentBudgets.flatMap((budget, index) => [
    {
      id: id('budget_entry', tenant, `${budget.cost_center_id}_reserve`),
      tenant_id: tenant.id,
      department_budget_id: budget.id,
      entry_type: 'RESERVATION',
      entity_type: 'purchase_request',
      entity_id: [id('purchase', tenant, 'pr-8812'), id('purchase', tenant, 'pr-8813'), id('purchase', tenant, 'pr-8814')][index] || `seed-pr-${index}`,
      amount: budget.reserved_amount,
      status: 'ACTIVE',
      reason: 'Seeded reservation posture',
      created_at: '2026-06-13T08:30:00Z',
      updated_at: '2026-06-13T08:30:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'finance').id,
      updated_by_user_id: users.find((user) => user.role_key === 'finance').id
    },
    {
      id: id('budget_entry', tenant, `${budget.cost_center_id}_consume`),
      tenant_id: tenant.id,
      department_budget_id: budget.id,
      entry_type: 'CONSUMPTION',
      entity_type: 'vendor_invoice',
      entity_id: [id('vendor_invoice', tenant, '8813_001'), id('vendor_invoice', tenant, '8814_001')][index] || `seed-invoice-${index}`,
      amount: budget.consumed_amount,
      status: 'ACTIVE',
      reason: 'Seeded consumption posture',
      created_at: '2026-06-13T08:35:00Z',
      updated_at: '2026-06-13T08:35:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'finance').id,
      updated_by_user_id: users.find((user) => user.role_key === 'finance').id
    }
  ]);
  const supplierComplianceDocuments = [
    {
      id: id('supplier_doc', tenant, 'medsupply_insurance'),
      tenant_id: tenant.id,
      vendor_id: vendorByName('MedSupply Direct'),
      document_type: 'INSURANCE',
      document_number: 'INS-2026-1001',
      file_name: 'MedSupply-Insurance-Certificate.pdf',
      issued_at: '2026-01-01T00:00:00Z',
      expires_at: '2027-01-01T00:00:00Z',
      status: 'VALID',
      required: 1,
      evidence_document_id: null,
      notes: 'Current insurance on file.',
      created_at: '2026-06-13T08:40:00Z',
      updated_at: '2026-06-13T08:40:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    },
    {
      id: id('supplier_doc', tenant, 'medsupply_w9'),
      tenant_id: tenant.id,
      vendor_id: vendorByName('MedSupply Direct'),
      document_type: 'W9',
      document_number: 'W9-2026-001',
      file_name: 'MedSupply-W9.pdf',
      issued_at: '2026-01-01T00:00:00Z',
      expires_at: '2027-01-01T00:00:00Z',
      status: 'VALID',
      required: 1,
      evidence_document_id: null,
      notes: '',
      created_at: '2026-06-13T08:41:00Z',
      updated_at: '2026-06-13T08:41:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    },
    {
      id: id('supplier_doc', tenant, 'facilitypro_insurance'),
      tenant_id: tenant.id,
      vendor_id: vendorByName('FacilityPro Wholesale'),
      document_type: 'INSURANCE',
      document_number: 'INS-2026-2001',
      file_name: 'FacilityPro-Insurance-Certificate.pdf',
      issued_at: '2026-01-01T00:00:00Z',
      expires_at: '2026-12-31T00:00:00Z',
      status: 'VALID',
      required: 1,
      evidence_document_id: null,
      notes: '',
      created_at: '2026-06-13T08:42:00Z',
      updated_at: '2026-06-13T08:42:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    },
    {
      id: id('supplier_doc', tenant, 'facilitypro_w9'),
      tenant_id: tenant.id,
      vendor_id: vendorByName('FacilityPro Wholesale'),
      document_type: 'W9',
      document_number: 'W9-2026-2001',
      file_name: 'FacilityPro-W9.pdf',
      issued_at: '2026-01-01T00:00:00Z',
      expires_at: '2027-01-01T00:00:00Z',
      status: 'VALID',
      required: 1,
      evidence_document_id: null,
      notes: '',
      created_at: '2026-06-13T08:43:00Z',
      updated_at: '2026-06-13T08:43:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    },
    {
      id: id('supplier_doc', tenant, 'labelworks_insurance'),
      tenant_id: tenant.id,
      vendor_id: vendorByName('LabelWorks'),
      document_type: 'INSURANCE',
      document_number: 'INS-2025-3001',
      file_name: 'LabelWorks-Insurance-Certificate.pdf',
      issued_at: '2025-01-01T00:00:00Z',
      expires_at: '2026-01-15T00:00:00Z',
      status: 'EXPIRED',
      required: 1,
      evidence_document_id: null,
      notes: 'Expired during governance review.',
      created_at: '2026-06-13T08:44:00Z',
      updated_at: '2026-06-13T08:44:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    },
    {
      id: id('supplier_doc', tenant, 'securetool_insurance'),
      tenant_id: tenant.id,
      vendor_id: vendorByName('SecureTool Supply'),
      document_type: 'INSURANCE',
      document_number: 'INS-2025-4001',
      file_name: 'SecureTool-Insurance-Certificate.pdf',
      issued_at: '2025-01-01T00:00:00Z',
      expires_at: '2025-12-31T00:00:00Z',
      status: 'EXPIRED',
      required: 1,
      evidence_document_id: null,
      notes: 'Blocked until renewed.',
      created_at: '2026-06-13T08:45:00Z',
      updated_at: '2026-06-13T08:45:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    }
  ];
  const supplierContracts = [
    {
      id: id('contract', tenant, 'medsupply_medical_supplies'),
      tenant_id: tenant.id,
      vendor_id: vendorByName('MedSupply Direct'),
      contract_no: 'CON-1001',
      title: 'Clinical consumables master agreement',
      effective_date: '2026-01-01T00:00:00Z',
      expiry_date: '2026-12-31T00:00:00Z',
      status: 'ACTIVE',
      document_reference: 'DOC-CON-1001',
      item_id: itemMap.gloves.id,
      item_category: 'Medical Supplies',
      pricing_reference: 'Rate card v4',
      renewal_alert_at: '2026-11-15T00:00:00Z',
      renewal_alert_status: 'ACTIVE',
      notes: 'Primary supply agreement for gloves and related consumables.',
      created_at: '2026-06-13T08:50:00Z',
      updated_at: '2026-06-13T08:50:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'admin').id,
      updated_by_user_id: users.find((user) => user.role_key === 'admin').id
    },
    {
      id: id('contract', tenant, 'facilitypro_janitorial'),
      tenant_id: tenant.id,
      vendor_id: vendorByName('FacilityPro Wholesale'),
      contract_no: 'CON-1002',
      title: 'Facilities and janitorial supply agreement',
      effective_date: '2026-01-01T00:00:00Z',
      expiry_date: '2026-12-31T00:00:00Z',
      status: 'ACTIVE',
      document_reference: 'DOC-CON-1002',
      item_id: itemMap.cleaner.id,
      item_category: 'Janitorial',
      pricing_reference: 'Rate card v2',
      renewal_alert_at: '2026-11-15T00:00:00Z',
      renewal_alert_status: 'ACTIVE',
      notes: 'Primary supplier for cleaning products and facility consumables.',
      created_at: '2026-06-13T08:51:00Z',
      updated_at: '2026-06-13T08:51:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'admin').id,
      updated_by_user_id: users.find((user) => user.role_key === 'admin').id
    },
    {
      id: id('contract', tenant, 'facilitypro_warehouse_supplies'),
      tenant_id: tenant.id,
      vendor_id: vendorByName('FacilityPro Wholesale'),
      contract_no: 'CON-1003',
      title: 'Warehouse supplies replenishment agreement',
      effective_date: '2026-01-01T00:00:00Z',
      expiry_date: '2026-10-01T00:00:00Z',
      status: 'ACTIVE',
      document_reference: 'DOC-CON-1003',
      item_id: itemMap.labels.id,
      item_category: 'Warehouse Supplies',
      pricing_reference: 'Rate card v3',
      renewal_alert_at: '2026-09-01T00:00:00Z',
      renewal_alert_status: 'ACTIVE',
      notes: 'Preferred supplier for label and packaging stock.',
      created_at: '2026-06-13T08:52:00Z',
      updated_at: '2026-06-13T08:52:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'admin').id,
      updated_by_user_id: users.find((user) => user.role_key === 'admin').id
    },
    {
      id: id('contract', tenant, 'labelworks_backup'),
      tenant_id: tenant.id,
      vendor_id: vendorByName('LabelWorks'),
      contract_no: 'CON-1004',
      title: 'Backup labels supply agreement',
      effective_date: '2025-01-01T00:00:00Z',
      expiry_date: '2025-12-31T00:00:00Z',
      status: 'EXPIRED',
      document_reference: 'DOC-CON-1004',
      item_id: itemMap.labels.id,
      item_category: 'Warehouse Supplies',
      pricing_reference: 'Legacy rate card',
      renewal_alert_at: '2025-11-01T00:00:00Z',
      renewal_alert_status: 'EXPIRED',
      notes: 'Expired contract intentionally retained for leakage detection.',
      created_at: '2026-06-13T08:53:00Z',
      updated_at: '2026-06-13T08:53:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'admin').id,
      updated_by_user_id: users.find((user) => user.role_key === 'admin').id
    }
  ];
  const procurementWaivers = [
    {
      id: id('waiver', tenant, 'budget_seed'),
      tenant_id: tenant.id,
      waiver_type: 'BUDGET_EXCEPTION',
      entity_type: 'department_budget',
      entity_id: departmentBudgets[departmentBudgets.length - 1].id,
      reason: 'Seeded budget exception for finance backlog review.',
      status: 'APPROVED',
      expires_at: '2026-12-31T00:00:00Z',
      approved_by_user_id: users.find((user) => user.role_key === 'finance').id,
      approved_at: '2026-06-13T08:55:00Z',
      created_at: '2026-06-13T08:55:00Z',
      updated_at: '2026-06-13T08:55:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'finance').id,
      updated_by_user_id: users.find((user) => user.role_key === 'finance').id
    }
  ];

  const internalRequests = [];
  const requestLines = [];
  const requestIdByNo = {};
  baseRequestSets.forEach((request, requestIndex) => {
    const requestId = id('request', tenant, request.no.toLowerCase());
    requestIdByNo[request.no] = requestId;
    const requesterUser = users.find((user) => user.role_key === request.requester);
    const status = request.status;
    internalRequests.push({
      id: requestId,
      tenant_id: tenant.id,
      request_no: request.no,
      department_id: departmentMap[request.department].id,
      facility_id: facilityMap.main.id,
      requested_by_user_id: requesterUser.id,
      purpose: request.purpose,
      priority: request.priority,
      status,
      created_at: `2026-06-13T0${requestIndex + 8}:00:00Z`,
      approved_at: status !== 'SUBMITTED' ? '2026-06-13T11:00:00Z' : null,
      approved_by_user_id: status !== 'SUBMITTED' ? users.find((user) => user.role_key === 'supervisor').id : null,
      issued_at: status === 'PICKING' ? '2026-06-13T11:30:00Z' : null,
      issued_by_user_id: status === 'PICKING' ? users.find((user) => user.role_key === 'worker').id : null,
      audit_ref: ''
    });

    request.lines.forEach((line, lineIndex) => {
      requestLines.push({
        id: id('request_line', tenant, `${request.no.toLowerCase()}_${lineIndex}`),
        tenant_id: tenant.id,
        request_id: requestId,
        item_id: itemByKey(line.item),
        qty_requested: line.qty,
        qty_issued: line.issued,
        status: line.issued > 0 ? 'ISSUED' : status
      });
    });
  });

  const warehouseTasks = [
    {
      id: id('warehouse_task', tenant, 'req_2409'),
      tenant_id: tenant.id,
      task_no: 'WT-2409',
      request_id: requestIdByNo['REQ-2409'],
      department_id: departmentMap.medical.id,
      facility_id: facilityMap.main.id,
      task_type: 'REQUEST_ISSUE',
      status: 'PARTIALLY_ISSUED',
      priority: 'HIGH',
      assigned_to_user_id: users.find((user) => user.role_key === 'supervisor').id,
      source_type: 'internal_request',
      source_id: requestIdByNo['REQ-2409'],
      evidence_document_id: null,
      started_at: '2026-06-13T11:35:00Z',
      picked_at: '2026-06-13T11:45:00Z',
      issued_at: '2026-06-13T11:52:00Z',
      closed_at: null,
      cancelled_at: null,
      exception_reason: 'Clinic queue still has unissued labels',
      last_action_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      created_at: '2026-06-13T11:30:00Z',
      updated_at: '2026-06-13T11:52:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    }
  ];

  const warehouseTaskLines = [
    {
      id: id('warehouse_task_line', tenant, 'req_2409_gloves'),
      tenant_id: tenant.id,
      warehouse_task_id: warehouseTasks[0].id,
      request_line_id: id('request_line', tenant, 'req-2409_0'),
      item_id: itemByKey('gloves'),
      bin_id: bins.find((bin) => bin.code === 'A-12-04').id,
      requested_quantity: 50,
      picked_quantity: 50,
      issued_quantity: 12,
      short_quantity: 38,
      unit_of_measure: 'box',
      status: 'PARTIALLY_ISSUED',
      lot_no: '',
      serial_no: '',
      expiry_date: null,
      exception_reason: 'Partial issue staged for the clinic desk',
      evidence_document_id: null,
      created_at: '2026-06-13T11:30:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      updated_at: '2026-06-13T11:52:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    },
    {
      id: id('warehouse_task_line', tenant, 'req_2409_labels'),
      tenant_id: tenant.id,
      warehouse_task_id: warehouseTasks[0].id,
      request_line_id: id('request_line', tenant, 'req-2409_1'),
      item_id: itemByKey('labels'),
      bin_id: bins.find((bin) => bin.code === 'B-08-02').id,
      requested_quantity: 6,
      picked_quantity: 6,
      issued_quantity: 0,
      short_quantity: 0,
      unit_of_measure: 'roll',
      status: 'PICKED',
      lot_no: '',
      serial_no: '',
      expiry_date: null,
      exception_reason: '',
      evidence_document_id: null,
      created_at: '2026-06-13T11:30:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      updated_at: '2026-06-13T11:45:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    }
  ];

  const purchaseRequests = [];
  const purchaseRequestLines = [];
  basePurchaseRequests.forEach((pr, prIndex) => {
    const prId = id('purchase', tenant, pr.no.toLowerCase());
    const requester = users.find((user) => user.role_key === 'requester');
    purchaseRequests.push({
      id: prId,
      tenant_id: tenant.id,
      pr_no: pr.no,
      vendor_name: pr.vendor,
      vendor_id: vendorByName(pr.vendor),
      department_id: departmentMap.operations.id,
      facility_id: facilityMap.main.id,
      cost_center_id: costCenterByDepartmentId[departmentMap.operations.id].id,
      requested_by_user_id: requester.id,
      accounting_code: pr.accountingCode,
      status: pr.status,
      total_amount: pr.amount,
      created_at: `2026-06-13T0${prIndex + 9}:30:00Z`,
      submitted_at: pr.status === 'PENDING_APPROVAL' || pr.status === 'APPROVED' ? `2026-06-13T10:${prIndex}5:00Z` : null,
      submitted_by_user_id: pr.status === 'PENDING_APPROVAL' || pr.status === 'APPROVED' ? requester.id : null,
      approved_at: pr.status === 'APPROVED' ? '2026-06-13T11:20:00Z' : null,
      approved_by_user_id: pr.status === 'APPROVED' ? users.find((user) => user.role_key === 'supervisor').id : null,
      rejected_at: null,
      rejected_by_user_id: null,
      rejection_reason: '',
      cancelled_at: null,
      cancelled_by_user_id: null,
      cancel_reason: '',
      closed_at: null,
      closed_by_user_id: null,
      updated_at: `2026-06-13T0${prIndex + 9}:45:00Z`,
      updated_by_user_id: requester.id,
      invoice_status: pr.invoiceStatus
    });

    pr.lines.forEach((line, lineIndex) => {
      purchaseRequestLines.push({
        id: id('purchase_line', tenant, `${pr.no.toLowerCase()}_${lineIndex}`),
        tenant_id: tenant.id,
        purchase_request_id: prId,
        item_id: itemByKey(line.item),
        description: line.description,
        qty: line.qty,
        unit_price: line.unitPrice,
        line_total: Number((line.qty * line.unitPrice).toFixed(2)),
        status: pr.status === 'APPROVED' ? 'APPROVED' : pr.status === 'PENDING_APPROVAL' ? 'PENDING_APPROVAL' : 'DRAFT',
        created_at: `2026-06-13T0${prIndex + 9}:30:00Z`,
        updated_at: `2026-06-13T0${prIndex + 9}:45:00Z`,
        created_by_user_id: requester.id,
        updated_by_user_id: requester.id
      });
    });
  });

  const purchaseOrders = [
    {
      id: id('po', tenant, 'po_8813'),
      tenant_id: tenant.id,
      po_no: 'PO-4410',
      vendor_id: vendorByName('FacilityPro Wholesale'),
      department_id: departmentMap.operations.id,
      facility_id: facilityMap.main.id,
      cost_center_id: costCenterByDepartmentId[departmentMap.operations.id].id,
      status: 'ISSUED',
      total_amount: 7420,
      created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      source_purchase_request_id: purchaseRequests.find((request) => request.pr_no === 'PR-8813').id,
      approved_at: '2026-06-13T11:30:00Z',
      approved_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      issued_at: '2026-06-13T11:45:00Z',
      issued_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      cancelled_at: null,
      cancelled_by_user_id: null,
      closed_at: null,
      closed_by_user_id: null,
      notes: 'Seeded PO for finance-ready vendor review.',
      created_at: '2026-06-13T11:25:00Z',
      updated_at: '2026-06-13T11:30:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    }
  ];

  const purchaseOrderLines = [
    {
      id: id('po_line', tenant, 'po_8813_0'),
      tenant_id: tenant.id,
      purchase_order_id: purchaseOrders[0].id,
      purchase_request_line_id: purchaseRequestLines.find((line) => line.purchase_request_id === purchaseRequests.find((request) => request.pr_no === 'PR-8813').id && line.description.includes('Facility Cleaner')).id,
      item_id: itemByKey('cleaner'),
      description: 'Facility Cleaner Concentrate',
      qty_ordered: 120,
      unit_price: 18.5,
      line_total: Number((120 * 18.5).toFixed(2)),
      status: 'ISSUED',
      created_at: '2026-06-13T11:25:00Z',
      updated_at: '2026-06-13T11:30:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    },
    {
      id: id('po_line', tenant, 'po_8813_1'),
      tenant_id: tenant.id,
      purchase_order_id: purchaseOrders[0].id,
      purchase_request_line_id: purchaseRequestLines.find((line) => line.purchase_request_id === purchaseRequests.find((request) => request.pr_no === 'PR-8813').id && line.description.includes('LED Replacement')).id,
      item_id: itemByKey('tube'),
      description: 'LED Replacement Tube',
      qty_ordered: 220,
      unit_price: 14.0,
      line_total: Number((220 * 14).toFixed(2)),
      status: 'ISSUED',
      created_at: '2026-06-13T11:25:00Z',
      updated_at: '2026-06-13T11:30:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    }
  ];

  const receiveSessions = [
    {
      id: id('receive', tenant, 'po_8813'),
      tenant_id: tenant.id,
      facility_id: facilityMap.main.id,
      vendor_id: vendorByName('FacilityPro Wholesale'),
      purchase_order_id: purchaseOrders[0].id,
      status: 'IN_PROGRESS',
      started_by_user_id: users.find((user) => user.role_key === 'worker').id,
      completed_by_user_id: null,
      evidence_document_id: null,
      started_at: '2026-06-13T12:20:00Z',
      posted_at: null,
      cancelled_at: null,
      cancelled_by_user_id: null,
      cancel_reason: '',
      exception_reason: '',
      notes: 'Seeded receiving session with partial capture.',
      created_at: '2026-06-13T12:20:00Z',
      updated_at: '2026-06-13T12:22:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'worker').id
    }
  ];

  const receiveSessionLines = [
    {
      id: id('receive_line', tenant, 'po_8813_0'),
      tenant_id: tenant.id,
      receive_session_id: receiveSessions[0].id,
      purchase_order_line_id: purchaseOrderLines[0].id,
      item_id: itemByKey('cleaner'),
      bin_id: bins.find((bin) => bin.code === 'C-03-01').id,
      qty_ordered: 120,
      qty_received: 48,
      qty_damaged: 0,
      qty_short: 0,
      lot_no: 'LOT-20260613-A',
      serial_no: '',
      expiry_date: null,
      status: 'PARTIAL',
      exception_reason: '',
      evidence_document_id: null,
      created_at: '2026-06-13T12:20:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'worker').id,
      updated_at: '2026-06-13T12:22:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'worker').id
    },
    {
      id: id('receive_line', tenant, 'po_8813_1'),
      tenant_id: tenant.id,
      receive_session_id: receiveSessions[0].id,
      purchase_order_line_id: purchaseOrderLines[1].id,
      item_id: itemByKey('tube'),
      bin_id: bins.find((bin) => bin.code === 'D-11-09').id,
      qty_ordered: 220,
      qty_received: 0,
      qty_damaged: 12,
      qty_short: 0,
      lot_no: '',
      serial_no: '',
      expiry_date: null,
      status: 'EXCEPTION',
      exception_reason: 'Damaged cartons flagged at dock',
      evidence_document_id: null,
      created_at: '2026-06-13T12:20:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'worker').id,
      updated_at: '2026-06-13T12:22:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'worker').id
    }
  ];

  const vendors = baseVendorCatalog.map((vendor, vendorIndex) => ({
    id: vendorMap[vendor.name].id,
    tenant_id: tenant.id,
    name: vendor.name,
    code: vendor.code,
    status: vendor.status,
    risk_score: vendor.risk,
    active: 1,
    contact_name: vendor.contact,
    email: vendor.email,
    phone: vendor.phone,
    last_reviewed_at: '2026-06-13T09:10:00Z',
    created_at: `2026-06-13T08:${String(40 + vendorIndex).padStart(2, '0')}:00Z`,
    updated_at: `2026-06-13T09:10:00Z`,
    updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
  }));

  const vendorScores = baseVendorScoreCards.map((score, scoreIndex) => ({
    id: id('vendor_score', tenant, `${score.vendor.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${scoreIndex}`),
    tenant_id: tenant.id,
    vendor_id: vendorMap[score.vendor].id,
    score_type: score.scoreType,
    score_value: score.value,
    scored_at: `2026-06-13T09:${String(10 + scoreIndex).padStart(2, '0')}:00Z`,
    source: score.source,
    created_by_user_id: users.find((user) => user.role_key === 'supervisor').id
  }));

  const syncBatches = [];
  const syncTasks = [];
  baseSyncBatches.forEach((batch, batchIndex) => {
    const batchId = id('sync', tenant, batch.no.toLowerCase());
    const deviceId = deviceMap[batch.device].id;
    const userId = users.find((user) => user.role_key === batch.user).id;
    syncBatches.push({
      id: batchId,
      tenant_id: tenant.id,
      device_id: deviceId,
      user_id: userId,
      task_count: batch.taskCount,
      exception_count: batch.exceptionCount,
      status: batch.status,
      review_status: batch.reviewStatus,
      created_at: `2026-06-13T0${batchIndex + 10}:10:00Z`,
      reviewed_at: batch.reviewStatus === 'APPROVED' ? '2026-06-13T12:00:00Z' : null,
      reviewed_by_user_id: batch.reviewStatus === 'APPROVED' ? users.find((user) => user.role_key === 'supervisor').id : null,
      posted_at: batch.reviewStatus === 'APPROVED' ? '2026-06-13T12:01:00Z' : null,
      rejected_reason: ''
    });

    batch.tasks.forEach((task, taskIndex) => {
      syncTasks.push({
        id: id('sync_task', tenant, `${batch.no.toLowerCase()}_${taskIndex}`),
        tenant_id: tenant.id,
        batch_id: batchId,
        task_index: taskIndex + 1,
        task_type: task.taskType,
        entity_type: task.entityType,
        entity_id: task.entityKey,
        payload_json: JSON.stringify(task.payload)
      });
    });
  });

  const labelPrintJobs = [
    { kind: 'ITEM_LABEL', entityType: 'item', entityKey: 'gloves', barcode: 'OS-1001', status: 'QUEUED' },
    { kind: 'BIN_LABEL', entityType: 'bin', entityKey: 'a1204', barcode: 'A-12-04', status: 'PRINTED' }
  ].map((job, jobIndex) => ({
    id: id('label', tenant, job.kind.toLowerCase()),
    tenant_id: tenant.id,
    device_id: deviceMap.warehouse.id,
    kind: job.kind,
    entity_type: job.entityType,
    entity_id: job.entityKey,
    barcode: job.barcode,
    status: job.status,
    created_by_user_id: users.find((user) => user.role_key === 'worker').id,
    created_at: `2026-06-13T12:${jobIndex}0:00Z`
  }));

  const exportBatches = [
    { no: 'EXP-1102', kind: 'FINANCE_SYNC', format: 'CSV', status: 'GENERATED', recordCount: 22, fileName: 'finance_sync_1102.csv', summary: 'All records passed validation.' },
    { no: 'EXP-1103', kind: 'FINANCE_SYNC', format: 'XLSX', status: 'FAILED_VALIDATION', recordCount: 7, fileName: 'finance_sync_1103.xlsx', summary: 'Validation blocked due to missing accounting fields.' }
  ].map((batch, batchIndex) => ({
    id: id('export', tenant, batch.no.toLowerCase()),
    tenant_id: tenant.id,
    batch_no: batch.no,
    kind: batch.kind,
    format: batch.format,
    status: batch.status,
    date_from: '2026-06-13T00:00:00Z',
    date_to: '2026-06-13T23:59:59Z',
    facility_id: facilityMap.main.id,
    department_id: departmentMap.finance.id,
    record_count: batch.recordCount,
    validation_error_count: batch.status === 'FAILED_VALIDATION' ? 2 : 0,
    generated_payload_hash: batch.status === 'GENERATED' ? `sha256-${batch.no.toLowerCase()}` : '',
    generated_payload_format: batch.format,
    file_name: batch.fileName,
    created_by_user_id: users.find((user) => user.role_key === 'finance').id,
    created_at: `2026-06-13T12:${batchIndex}5:00Z`,
    generated_at: batch.status === 'GENERATED' ? `2026-06-13T12:${batchIndex}5:30Z` : null,
    approved_at: batch.status === 'GENERATED' ? '2026-06-13T12:10:00Z' : null,
    approved_by_user_id: batch.status === 'GENERATED' ? users.find((user) => user.role_key === 'finance').id : null,
    dispatched_at: batch.status === 'GENERATED' ? '2026-06-13T12:20:00Z' : null,
    cancelled_at: null,
    failure_reason: batch.status === 'FAILED_VALIDATION' ? 'Missing accounting code and linked evidence' : '',
    validation_summary: batch.summary,
    updated_at: `2026-06-13T12:${batchIndex}5:30Z`,
    updated_by_user_id: users.find((user) => user.role_key === 'finance').id,
    selection_json: JSON.stringify({
      exportType: 'FINANCE_SYNC',
      candidateTypes: batch.status === 'FAILED_VALIDATION' ? ['PURCHASE_REQUEST', 'RECEIPT'] : ['PURCHASE_ORDER', 'RECEIPT', 'STOCK_MOVEMENT'],
      dateFrom: '2026-06-13T00:00:00Z',
      dateTo: '2026-06-13T23:59:59Z',
      facilityId: facilityMap.main.id,
      departmentId: departmentMap.finance.id
    }),
    generated_payload_json: batch.status === 'GENERATED'
      ? JSON.stringify({ exportType: 'FINANCE_SYNC', batchNo: batch.no, records: batch.recordCount, format: batch.format })
      : '{}',
    generated_payload_text: batch.status === 'GENERATED'
      ? `record_type,record_id\npurchase_order,${purchaseOrders[0].po_no}\nreceive_session,${receiveSessions[0].id}`
      : ''
  }));

  const exportValidationErrors = [
    {
      id: id('export_err', tenant, 'pr_8814_accounting'),
      tenant_id: tenant.id,
      export_batch_id: exportBatches.find((batch) => batch.batch_no === 'EXP-1103').id,
      severity: 'ERROR',
      code: 'ACCOUNTING_CODE_REQUIRED',
      message: 'Purchase request PR-8814 is missing an accounting code.',
      entity_type: 'purchase_request',
      entity_id: purchaseRequests.find((request) => request.pr_no === 'PR-8814').id,
      status: 'OPEN',
      resolved_at: null,
      resolved_by_user_id: null,
      waived_at: null,
      waived_by_user_id: null,
      waiver_reason: '',
      updated_at: '2026-06-13T12:26:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'finance').id
    },
    {
      id: id('export_err', tenant, 'pr_8814_quote'),
      tenant_id: tenant.id,
      export_batch_id: exportBatches.find((batch) => batch.batch_no === 'EXP-1103').id,
      severity: 'ERROR',
      code: 'DOCUMENT_REQUIRED',
      message: 'Purchase request PR-8814 is missing a linked quote document.',
      entity_type: 'document',
      entity_id: purchaseRequests.find((request) => request.pr_no === 'PR-8814').id,
      status: 'OPEN',
      resolved_at: null,
      resolved_by_user_id: null,
      waived_at: null,
      waived_by_user_id: null,
      waiver_reason: '',
      updated_at: '2026-06-13T12:26:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'finance').id
    }
  ];

  const syncConflicts = [
    {
      id: id('conflict', tenant, 'sync_4921_1'),
      tenant_id: tenant.id,
      sync_batch_id: id('sync', tenant, 'sync-4921'),
      task_id: id('sync_task', tenant, 'sync-4921_1'),
      conflict_type: 'QUANTITY_MISMATCH',
      severity: 'HIGH',
      status: 'PENDING',
      description: 'Picked quantity did not match expected issue quantity for REQ-2409.',
      resolution_note: ''
    }
  ];

  const exportTransfers = [
    {
      id: id('xfer', tenant, 'export_1102'),
      tenant_id: tenant.id,
      export_batch_id: exportBatches.find((batch) => batch.batch_no === 'EXP-1102').id,
      destination: 'Finance ERP',
      status: 'QUEUED',
      sent_at: null,
      error_message: '',
      connection_id: null,
      job_id: null,
      dispatch_mode: 'NOT_CONFIGURED',
      attempted_at: '2026-06-13T12:20:00Z',
      updated_at: '2026-06-13T12:20:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'finance').id
    }
  ];

  const integrationConnections = [
    {
      id: id('integration', tenant, 'finance_erp_sandbox'),
      tenant_id: tenant.id,
      connection_type: 'ERP',
      provider_name: 'Finance ERP Sandbox',
      status: 'CONFIGURED',
      endpoint_label: 'Finance ERP Sandbox',
      auth_mode: 'SANDBOX_ONLY',
      secret_ref: `secret://${tenant.slug}/finance-erp-sandbox`,
      last_tested_at: '2026-06-13T12:05:00Z',
      last_success_at: null,
      last_error: 'Sandbox dispatch not yet executed.',
      created_at: '2026-06-13T08:20:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'admin').id,
      updated_at: '2026-06-13T12:05:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'admin').id
    }
  ];

  const integrationJobs = [
    {
      id: id('job', tenant, 'finance_erp_001'),
      tenant_id: tenant.id,
      connection_id: integrationConnections[0].id,
      export_batch_id: exportBatches.find((batch) => batch.batch_no === 'EXP-1102').id,
      integration_key: 'finance_erp_sandbox',
      job_type: 'EXPORT_DISPATCH',
      direction: 'OUTBOUND',
      status: 'FAILED',
      attempt_count: 1,
      last_error: 'Sandbox endpoint not invoked.',
      queued_at: '2026-06-13T12:19:00Z',
      started_at: '2026-06-13T12:19:30Z',
      finished_at: '2026-06-13T12:20:00Z',
      created_at: '2026-06-13T12:19:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'finance').id,
      updated_at: '2026-06-13T12:20:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'finance').id
    }
  ];

  const vendorInvoices = [];
  const vendorInvoiceLines = [];
  const invoiceExtractionRuns = [];
  const invoiceMatchResults = [];
  const invoiceMatchExceptions = [];
  const invoiceApprovalEvents = [];
  const rfqRequests = [];
  const rfqLines = [];
  const vendorQuotes = [];
  const vendorQuoteLines = [];
  const vendorScorecards = [];

  if (tenant.tier === 'full') {
    const approvedPo = purchaseOrders[0];
    const approvedPoLines = purchaseOrderLines.filter((line) => line.purchase_order_id === approvedPo.id);
    const receiveSession = receiveSessions[0];
    const medSupplyVendor = vendorMap['MedSupply Direct'].id;
    const facilityProVendor = vendorMap['FacilityPro Wholesale'].id;
    const labelWorksVendor = vendorMap['LabelWorks'].id;

    vendorInvoices.push(
      {
        id: id('vendor_invoice', tenant, '8813_001'),
        tenant_id: tenant.id,
        vendor_id: facilityProVendor,
        vendor_name: 'FacilityPro Wholesale',
        invoice_number: 'INV-8813-001',
        purchase_order_id: approvedPo.id,
        receiving_session_id: receiveSession.id,
        department_id: approvedPo.department_id,
        facility_id: approvedPo.facility_id,
        cost_center_id: costCenterByDepartmentId[approvedPo.department_id].id,
        currency: 'USD',
        status: 'EXPORT_READY',
        invoice_date: '2026-06-13T00:00:00Z',
        due_date: '2026-07-13T00:00:00Z',
        subtotal_amount: 7420,
        tax_amount: 0,
        freight_amount: 0,
        discount_amount: 0,
        total_amount: 7420,
        extraction_provider: 'DETERMINISTIC_DEMO',
        extraction_status: 'EXTRACTED',
        extraction_notes: 'Header and line values normalized from the seeded invoice artifact.',
        extraction_requested_at: '2026-06-13T12:31:00Z',
        extracted_at: '2026-06-13T12:31:05Z',
        match_mode: '3WAY',
        match_status: 'MATCHED',
        match_summary: 'Invoice matched to purchase order and receiving session.',
        submitted_at: '2026-06-13T12:33:00Z',
        submitted_by_user_id: users.find((user) => user.role_key === 'finance').id,
        approved_at: '2026-06-13T12:34:00Z',
        approved_by_user_id: users.find((user) => user.role_key === 'finance').id,
        rejected_at: null,
        rejected_by_user_id: null,
        rejection_reason: '',
        export_ready_at: '2026-06-13T12:35:00Z',
        exported_at: '2026-06-13T12:36:00Z',
        notes: 'Seeded finance-ready invoice.',
        created_at: '2026-06-13T12:30:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id,
        updated_at: '2026-06-13T12:36:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'finance').id
      },
      {
        id: id('vendor_invoice', tenant, '8814_001'),
        tenant_id: tenant.id,
        vendor_id: medSupplyVendor,
        vendor_name: 'MedSupply Direct',
        invoice_number: 'INV-8814-001',
        purchase_order_id: null,
        receiving_session_id: null,
        department_id: departmentMap.operations.id,
        facility_id: facilityMap.main.id,
        cost_center_id: costCenterByDepartmentId[departmentMap.operations.id].id,
        currency: 'USD',
        status: 'EXCEPTION',
        invoice_date: '2026-06-13T00:00:00Z',
        due_date: '2026-07-13T00:00:00Z',
        subtotal_amount: 1925,
        tax_amount: 0,
        freight_amount: 0,
        discount_amount: 0,
        total_amount: 1925,
        extraction_provider: 'DETERMINISTIC_DEMO',
        extraction_status: 'EXTRACTED',
        extraction_notes: 'Vendor name and totals normalized, but matching requires review.',
        extraction_requested_at: '2026-06-13T12:40:00Z',
        extracted_at: '2026-06-13T12:40:05Z',
        match_mode: '2WAY',
        match_status: 'EXCEPTION',
        match_summary: 'Invoice total exceeds ordered amount by policy threshold.',
        submitted_at: '2026-06-13T12:42:00Z',
        submitted_by_user_id: users.find((user) => user.role_key === 'finance').id,
        approved_at: null,
        approved_by_user_id: null,
        rejected_at: null,
        rejected_by_user_id: null,
        rejection_reason: '',
        export_ready_at: null,
        exported_at: null,
        notes: 'Requires waiver review for finance approval.',
        created_at: '2026-06-13T12:39:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id,
        updated_at: '2026-06-13T12:42:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'finance').id
      }
    );

    vendorInvoiceLines.push(
      {
        id: id('vendor_invoice_line', tenant, '8813_0'),
        tenant_id: tenant.id,
        vendor_invoice_id: vendorInvoices[0].id,
        purchase_order_line_id: approvedPoLines[0].id,
        item_id: approvedPoLines[0].item_id,
        description: approvedPoLines[0].description,
        qty: Number(approvedPoLines[0].qty_ordered),
        unit_price: Number(approvedPoLines[0].unit_price),
        line_total: Number((Number(approvedPoLines[0].qty_ordered) * Number(approvedPoLines[0].unit_price)).toFixed(2)),
        match_status: 'MATCHED',
        note: 'Exact match to purchase order and receipt.',
        created_at: '2026-06-13T12:30:30Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id,
        updated_at: '2026-06-13T12:31:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'finance').id
      },
      {
        id: id('vendor_invoice_line', tenant, '8813_1'),
        tenant_id: tenant.id,
        vendor_invoice_id: vendorInvoices[0].id,
        purchase_order_line_id: approvedPoLines[1].id,
        item_id: approvedPoLines[1].item_id,
        description: approvedPoLines[1].description,
        qty: Number(approvedPoLines[1].qty_ordered),
        unit_price: Number(approvedPoLines[1].unit_price),
        line_total: Number((Number(approvedPoLines[1].qty_ordered) * Number(approvedPoLines[1].unit_price)).toFixed(2)),
        match_status: 'MATCHED',
        note: 'Exact match to purchase order and receipt.',
        created_at: '2026-06-13T12:30:30Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id,
        updated_at: '2026-06-13T12:31:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'finance').id
      },
      {
        id: id('vendor_invoice_line', tenant, '8814_0'),
        tenant_id: tenant.id,
        vendor_invoice_id: vendorInvoices[1].id,
        purchase_order_line_id: null,
        item_id: itemMap.labels.id,
        description: 'Additional rush labels',
        qty: 35,
        unit_price: 55,
        line_total: 1925,
        match_status: 'EXCEPTION',
        note: 'Amount exceeds receiving-backed tolerance.',
        created_at: '2026-06-13T12:39:30Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id,
        updated_at: '2026-06-13T12:42:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'finance').id
      }
    );

    invoiceExtractionRuns.push(
      {
        id: id('invoice_extract', tenant, '8813_001'),
        tenant_id: tenant.id,
        vendor_invoice_id: vendorInvoices[0].id,
        provider_name: 'Deterministic Demo Extractor',
        provider_status: 'NOT_CONFIGURED',
        status: 'COMPLETED',
        request_payload_json: JSON.stringify({ source: 'seeded_invoice', invoiceNumber: 'INV-8813-001' }),
        response_payload_json: JSON.stringify({ invoice_number: 'INV-8813-001', vendor_name: 'FacilityPro Wholesale' }),
        normalized_payload_json: JSON.stringify({ invoice_number: 'INV-8813-001', total_amount: 7420 }),
        error_message: '',
        requested_at: '2026-06-13T12:31:00Z',
        started_at: '2026-06-13T12:31:01Z',
        completed_at: '2026-06-13T12:31:05Z',
        created_at: '2026-06-13T12:31:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id
      },
      {
        id: id('invoice_extract', tenant, '8814_001'),
        tenant_id: tenant.id,
        vendor_invoice_id: vendorInvoices[1].id,
        provider_name: 'Deterministic Demo Extractor',
        provider_status: 'NOT_CONFIGURED',
        status: 'COMPLETED',
        request_payload_json: JSON.stringify({ source: 'seeded_invoice', invoiceNumber: 'INV-8814-001' }),
        response_payload_json: JSON.stringify({ invoice_number: 'INV-8814-001', vendor_name: 'MedSupply Direct' }),
        normalized_payload_json: JSON.stringify({ invoice_number: 'INV-8814-001', total_amount: 1925 }),
        error_message: '',
        requested_at: '2026-06-13T12:40:00Z',
        started_at: '2026-06-13T12:40:01Z',
        completed_at: '2026-06-13T12:40:05Z',
        created_at: '2026-06-13T12:40:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id
      }
    );

    invoiceMatchResults.push(
      {
        id: id('invoice_match', tenant, '8813_001'),
        tenant_id: tenant.id,
        vendor_invoice_id: vendorInvoices[0].id,
        match_mode: '3WAY',
        status: 'MATCHED',
        blocker_count: 0,
        warning_count: 0,
        info_count: 2,
        summary: 'Invoice matched across PO, receipt, and invoice lines.',
        details_json: JSON.stringify({ po: approvedPo.po_no, receivingSession: receiveSession.id }),
        matched_at: '2026-06-13T12:32:00Z',
        created_at: '2026-06-13T12:32:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id
      },
      {
        id: id('invoice_match', tenant, '8814_001'),
        tenant_id: tenant.id,
        vendor_invoice_id: vendorInvoices[1].id,
        match_mode: '2WAY',
        status: 'EXCEPTION',
        blocker_count: 1,
        warning_count: 1,
        info_count: 0,
        summary: 'Invoice exceeded tolerance and needs waiver or rejection.',
        details_json: JSON.stringify({ variance: 450 }),
        matched_at: '2026-06-13T12:41:00Z',
        created_at: '2026-06-13T12:41:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id
      }
    );

    invoiceMatchExceptions.push({
      id: id('invoice_exception', tenant, '8814_001_amount'),
      tenant_id: tenant.id,
      vendor_invoice_id: vendorInvoices[1].id,
      vendor_invoice_line_id: vendorInvoiceLines[2].id,
      severity: 'BLOCKER',
      code: 'MATCH_VARIANCE',
      message: 'Invoice line total exceeds receiving-backed amount by policy threshold.',
      expected_value: '1500',
      actual_value: '1925',
      waived_at: null,
      waived_by_user_id: null,
      waiver_reason: '',
      created_at: '2026-06-13T12:41:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'finance').id,
      updated_at: '2026-06-13T12:41:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'finance').id
    });

    invoiceApprovalEvents.push(
      {
        id: id('invoice_event', tenant, '8813_001_submitted'),
        tenant_id: tenant.id,
        vendor_invoice_id: vendorInvoices[0].id,
        event_type: 'SUBMITTED',
        reason: 'Ready for finance approval',
        created_at: '2026-06-13T12:33:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id
      },
      {
        id: id('invoice_event', tenant, '8813_001_approved'),
        tenant_id: tenant.id,
        vendor_invoice_id: vendorInvoices[0].id,
        event_type: 'APPROVED',
        reason: 'Matched and export-ready',
        created_at: '2026-06-13T12:34:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id
      },
      {
        id: id('invoice_event', tenant, '8813_001_exported'),
        tenant_id: tenant.id,
        vendor_invoice_id: vendorInvoices[0].id,
        event_type: 'EXPORTED',
        reason: 'Included in finance export payload',
        created_at: '2026-06-13T12:36:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id
      },
      {
        id: id('invoice_event', tenant, '8814_001_exception'),
        tenant_id: tenant.id,
        vendor_invoice_id: vendorInvoices[1].id,
        event_type: 'EXCEPTION',
        reason: 'Variance requires waiver review',
        created_at: '2026-06-13T12:41:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id
      }
    );

    rfqRequests.push({
      id: id('rfq', tenant, '2301'),
      tenant_id: tenant.id,
      rfq_no: 'RFQ-2301',
      subject: 'Q3 replenishment for controlled and clinical supplies',
      status: 'QUOTES_RECEIVED',
      department_id: departmentMap.operations.id,
      facility_id: facilityMap.main.id,
      requested_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
      due_at: '2026-06-18T17:00:00Z',
      sent_at: '2026-06-13T13:00:00Z',
      evaluated_at: '2026-06-13T15:00:00Z',
      awarded_at: '2026-06-13T15:20:00Z',
      awarded_quote_id: id('quote', tenant, '2301_facilitypro'),
      cancelled_at: null,
      cancel_reason: '',
      notes: 'Compare facility supplies across approved vendors.',
      created_at: '2026-06-13T12:55:00Z',
      updated_at: '2026-06-13T15:20:00Z',
      updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
    });

    rfqLines.push(
      {
        id: id('rfq_line', tenant, '2301_0'),
        tenant_id: tenant.id,
        rfq_request_id: rfqRequests[0].id,
        item_id: itemMap.gloves.id,
        description: 'Nitrile gloves - medium',
        qty: 400,
        target_unit_price: 4.5,
        status: 'DRAFT',
        created_at: '2026-06-13T12:55:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
        updated_at: '2026-06-13T12:55:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
      },
      {
        id: id('rfq_line', tenant, '2301_1'),
        tenant_id: tenant.id,
        rfq_request_id: rfqRequests[0].id,
        item_id: itemMap.labels.id,
        description: 'Barcode label rolls',
        qty: 120,
        target_unit_price: 19.25,
        status: 'DRAFT',
        created_at: '2026-06-13T12:55:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
        updated_at: '2026-06-13T12:55:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
      }
    );

    vendorQuotes.push(
      {
        id: id('quote', tenant, '2301_facilitypro'),
        tenant_id: tenant.id,
        rfq_request_id: rfqRequests[0].id,
        vendor_id: facilityProVendor,
        quote_no: 'QUO-2301-01',
        status: 'AWARDED',
        subtotal_amount: 11840,
        freight_amount: 180,
        tax_amount: 0,
        total_amount: 12020,
        notes: 'Best overall delivery and service posture.',
        submitted_at: '2026-06-13T14:00:00Z',
        shortlisted_at: '2026-06-13T14:40:00Z',
        awarded_at: '2026-06-13T15:20:00Z',
        rejected_at: null,
        expired_at: null,
        created_at: '2026-06-13T14:00:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
        updated_at: '2026-06-13T15:20:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
      },
      {
        id: id('quote', tenant, '2301_labelworks'),
        tenant_id: tenant.id,
        rfq_request_id: rfqRequests[0].id,
        vendor_id: labelWorksVendor,
        quote_no: 'QUO-2301-02',
        status: 'SHORTLISTED',
        subtotal_amount: 12340,
        freight_amount: 220,
        tax_amount: 0,
        total_amount: 12560,
        notes: 'Alternate supplier kept as backup.',
        submitted_at: '2026-06-13T14:05:00Z',
        shortlisted_at: '2026-06-13T14:40:00Z',
        awarded_at: null,
        rejected_at: null,
        expired_at: null,
        created_at: '2026-06-13T14:05:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
        updated_at: '2026-06-13T14:40:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
      }
    );

    vendorQuoteLines.push(
      {
        id: id('quote_line', tenant, '2301_facilitypro_0'),
        tenant_id: tenant.id,
        vendor_quote_id: vendorQuotes[0].id,
        rfq_line_id: rfqLines[0].id,
        item_id: rfqLines[0].item_id,
        description: rfqLines[0].description,
        qty: 400,
        unit_price: 4.2,
        line_total: Number((400 * 4.2).toFixed(2)),
        lead_time_days: 7,
        status: 'AWARDED',
        created_at: '2026-06-13T14:00:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
        updated_at: '2026-06-13T15:20:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
      },
      {
        id: id('quote_line', tenant, '2301_facilitypro_1'),
        tenant_id: tenant.id,
        vendor_quote_id: vendorQuotes[0].id,
        rfq_line_id: rfqLines[1].id,
        item_id: rfqLines[1].item_id,
        description: rfqLines[1].description,
        qty: 120,
        unit_price: 18.7,
        line_total: Number((120 * 18.7).toFixed(2)),
        lead_time_days: 7,
        status: 'AWARDED',
        created_at: '2026-06-13T14:00:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
        updated_at: '2026-06-13T15:20:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
      },
      {
        id: id('quote_line', tenant, '2301_labelworks_0'),
        tenant_id: tenant.id,
        vendor_quote_id: vendorQuotes[1].id,
        rfq_line_id: rfqLines[0].id,
        item_id: rfqLines[0].item_id,
        description: rfqLines[0].description,
        qty: 400,
        unit_price: 4.5,
        line_total: 1800,
        lead_time_days: 9,
        status: 'SHORTLISTED',
        created_at: '2026-06-13T14:05:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
        updated_at: '2026-06-13T14:40:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
      }
    );

    vendorScorecards.push(
      {
        id: id('vendor_scorecard', tenant, 'facilitypro_20260613'),
        tenant_id: tenant.id,
        vendor_id: facilityProVendor,
        score_date: '2026-06-13',
        risk_score: 18,
        on_time_delivery_rate: 96,
        invoice_match_rate: 99,
        rfq_win_rate: 68,
        quality_rate: 97,
        open_exceptions: 0,
        spend_90d: 48210,
        status: 'ACTIVE',
        summary: 'Strong delivery and invoice match posture.',
        snapshot_json: JSON.stringify({ signal: 'balanced', trend: 'stable' }),
        created_at: '2026-06-13T15:30:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
        updated_at: '2026-06-13T15:30:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
      },
      {
        id: id('vendor_scorecard', tenant, 'labels_20260613'),
        tenant_id: tenant.id,
        vendor_id: labelWorksVendor,
        score_date: '2026-06-13',
        risk_score: 29,
        on_time_delivery_rate: 88,
        invoice_match_rate: 91,
        rfq_win_rate: 37,
        quality_rate: 89,
        open_exceptions: 1,
        spend_90d: 23390,
        status: 'ACTIVE',
        summary: 'Reliable backup supplier with mild variance exposure.',
        snapshot_json: JSON.stringify({ signal: 'watch', trend: 'steady' }),
        created_at: '2026-06-13T15:30:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'supervisor').id,
        updated_at: '2026-06-13T15:30:00Z',
        updated_by_user_id: users.find((user) => user.role_key === 'supervisor').id
      }
    );
  }

  const documents = [
    { fileName: 'MedSupply-Invoice-8812.pdf', entityType: 'purchase_request', entityKey: 'PR-8812', docType: 'Invoice', visibility: 'FINANCE_PLUS_PURCHASING', uploadedBy: 'finance' },
    { fileName: 'Receiving-Photo-SEC-01.jpg', entityType: 'reject', entityKey: 'R-102', docType: 'Evidence', visibility: 'SUPERVISOR_ONLY', uploadedBy: 'supervisor' },
    { fileName: 'LabelWorks-Quote.pdf', entityType: 'purchase_request', entityKey: 'PR-8814', docType: 'Quote', visibility: 'PURCHASING', uploadedBy: 'requester' }
  ].map((doc, docIndex) => ({
    id: id('doc', tenant, `${docIndex}`),
    tenant_id: tenant.id,
    entity_type: doc.entityType,
    entity_id: doc.entityKey,
    file_name: doc.fileName,
    doc_type: doc.docType,
    visibility: doc.visibility,
    uploaded_by_user_id: users.find((user) => user.role_key === doc.uploadedBy).id,
    created_at: `2026-06-13T12:${docIndex + 1}5:00Z`
  }));

  if (tenant.tier === 'full') {
    const fullDocs = [
      { fileName: 'FacilityPro-Invoice-8813.pdf', entityType: 'vendor_invoice', entityKey: vendorInvoices[0].id, docType: 'Invoice', visibility: 'FINANCE_PLUS_PURCHASING', uploadedBy: 'finance' },
      { fileName: 'MedSupply-Invoice-8814.pdf', entityType: 'vendor_invoice', entityKey: vendorInvoices[1].id, docType: 'Invoice', visibility: 'FINANCE_PLUS_PURCHASING', uploadedBy: 'finance' },
      { fileName: 'RFQ-2301.pdf', entityType: 'rfq_request', entityKey: rfqRequests[0].id, docType: 'RFQ', visibility: 'PURCHASING', uploadedBy: 'supervisor' },
      { fileName: 'FacilityPro-Quote-2301.pdf', entityType: 'vendor_quote', entityKey: vendorQuotes[0].id, docType: 'Quote', visibility: 'PURCHASING', uploadedBy: 'supervisor' },
      { fileName: 'LabelWorks-Quote-2301.pdf', entityType: 'vendor_quote', entityKey: vendorQuotes[1].id, docType: 'Quote', visibility: 'PURCHASING', uploadedBy: 'supervisor' }
    ].map((doc, idx) => ({
      id: id('doc', tenant, `p2p_${idx}`),
      tenant_id: tenant.id,
      entity_type: doc.entityType,
      entity_id: doc.entityKey,
      file_name: doc.fileName,
      doc_type: doc.docType,
      visibility: doc.visibility,
      uploaded_by_user_id: users.find((user) => user.role_key === doc.uploadedBy).id,
      created_at: `2026-06-13T13:${String(idx).padStart(2, '0')}:00Z`
    }));
    documents.push(...fullDocs);
  }

  const evidenceLinks = [
    {
      id: id('evidence_link', tenant, 'export_1102_invoice'),
      tenant_id: tenant.id,
      document_id: documents.find((doc) => doc.file_name === 'MedSupply-Invoice-8812.pdf').id,
      entity_type: 'export_batch',
      entity_id: exportBatches.find((batch) => batch.batch_no === 'EXP-1102').id,
      link_type: 'EXPORT_EVIDENCE',
      created_at: '2026-06-13T12:16:00Z',
      created_by_user_id: users.find((user) => user.role_key === 'finance').id
    }
  ];

  if (tenant.tier === 'full') {
    evidenceLinks.push(
      {
        id: id('evidence_link', tenant, 'p2p_invoice_8813'),
        tenant_id: tenant.id,
        document_id: documents.find((doc) => doc.file_name === 'FacilityPro-Invoice-8813.pdf').id,
        entity_type: 'vendor_invoice',
        entity_id: vendorInvoices[0].id,
        link_type: 'INVOICE_EVIDENCE',
        created_at: '2026-06-13T13:05:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id
      },
      {
        id: id('evidence_link', tenant, 'p2p_invoice_8814'),
        tenant_id: tenant.id,
        document_id: documents.find((doc) => doc.file_name === 'MedSupply-Invoice-8814.pdf').id,
        entity_type: 'vendor_invoice',
        entity_id: vendorInvoices[1].id,
        link_type: 'INVOICE_EXCEPTION_EVIDENCE',
        created_at: '2026-06-13T13:06:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'finance').id
      },
      {
        id: id('evidence_link', tenant, 'p2p_rfq_2301'),
        tenant_id: tenant.id,
        document_id: documents.find((doc) => doc.file_name === 'RFQ-2301.pdf').id,
        entity_type: 'rfq_request',
        entity_id: rfqRequests[0].id,
        link_type: 'RFQ_EVIDENCE',
        created_at: '2026-06-13T13:07:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'supervisor').id
      },
      {
        id: id('evidence_link', tenant, 'p2p_quote_2301'),
        tenant_id: tenant.id,
        document_id: documents.find((doc) => doc.file_name === 'FacilityPro-Quote-2301.pdf').id,
        entity_type: 'vendor_quote',
        entity_id: vendorQuotes[0].id,
        link_type: 'QUOTE_EVIDENCE',
        created_at: '2026-06-13T13:08:00Z',
        created_by_user_id: users.find((user) => user.role_key === 'supervisor').id
      }
    );
  }

  const auditLogs = [
    { action: 'CREATE_PURCHASE_REQUEST', entityType: 'purchase_request', entityId: purchaseRequests[0].id, summary: 'PR-8812 drafted for MedSupply Direct', actor: 'requester', at: '2026-06-13T10:02:00Z' },
    { action: 'REVIEW_SYNC_BATCH', entityType: 'sync_batch', entityId: syncBatches[0].id, summary: 'SYNC-4921 submitted from offline device awaiting review', actor: 'supervisor', at: '2026-06-13T11:58:00Z' },
    { action: 'GENERATE_EXPORT', entityType: 'export_batch', entityId: exportBatches[0].id, summary: 'FinanceSync export generated cleanly', actor: 'finance', at: '2026-06-13T12:15:00Z' },
    { action: 'CREATE_WAREHOUSE_TASK', entityType: 'warehouse_task', entityId: warehouseTasks[0].id, summary: 'WT-2409 created from REQ-2409 for clinic issue work', actor: 'supervisor', at: '2026-06-13T11:30:00Z' },
    { action: 'AUDIT_LOW_STOCK', entityType: 'item', entityId: itemMap.gloves.id, summary: 'Nitrile Gloves - Medium fell below minimum threshold', actor: 'admin', at: '2026-06-13T08:30:00Z' }
  ].map((log, logIndex) => {
    const actorUser = users.find((user) => user.role_key === log.actor);
    return {
      id: id('audit', tenant, `${logIndex}`),
      tenant_id: tenant.id,
      actor_user_id: actorUser.id,
      actor_role: actorUser.role_key,
      department_id: actorUser.department_id,
      facility_id: actorUser.facility_id,
      device_id: deviceMap[log.actor === 'worker' ? 'receiving' : 'warehouse'].id,
      action: log.action,
      entity_type: log.entityType,
      entity_id: log.entityId,
      summary: log.summary,
      before_json: '{}',
      after_json: '{}',
      request_id: '',
      created_at: log.at
    };
  });

  if (tenant.tier === 'full') {
    auditLogs.push(
      {
        id: id('audit', tenant, 'p2p_0'),
        tenant_id: tenant.id,
        actor_user_id: users.find((user) => user.role_key === 'finance').id,
        actor_role: 'finance',
        department_id: departmentMap.finance.id,
        facility_id: facilityMap.main.id,
        device_id: deviceMap.receiving.id,
        action: 'EXTRACT_VENDOR_INVOICE',
        entity_type: 'vendor_invoice',
        entity_id: vendorInvoices[0].id,
        summary: 'FacilityPro invoice extracted and normalized for matching',
        before_json: '{}',
        after_json: '{}',
        request_id: '',
        created_at: '2026-06-13T12:31:05Z'
      },
      {
        id: id('audit', tenant, 'p2p_1'),
        tenant_id: tenant.id,
        actor_user_id: users.find((user) => user.role_key === 'supervisor').id,
        actor_role: 'supervisor',
        department_id: departmentMap.operations.id,
        facility_id: facilityMap.main.id,
        device_id: deviceMap.warehouse.id,
        action: 'AWARD_RFQ_REQUEST',
        entity_type: 'rfq_request',
        entity_id: rfqRequests[0].id,
        summary: 'RFQ-2301 awarded to FacilityPro Wholesale',
        before_json: '{}',
        after_json: '{}',
        request_id: '',
        created_at: '2026-06-13T15:20:00Z'
      },
      {
        id: id('audit', tenant, 'p2p_2'),
        tenant_id: tenant.id,
        actor_user_id: users.find((user) => user.role_key === 'finance').id,
        actor_role: 'finance',
        department_id: departmentMap.finance.id,
        facility_id: facilityMap.main.id,
        device_id: deviceMap.receiving.id,
        action: 'APPROVE_VENDOR_INVOICE',
        entity_type: 'vendor_invoice',
        entity_id: vendorInvoices[0].id,
        summary: 'Invoice approved after 3-way match and export readiness',
        before_json: '{}',
        after_json: '{}',
        request_id: '',
        created_at: '2026-06-13T12:34:00Z'
      },
      {
        id: id('audit', tenant, 'p2p_3'),
        tenant_id: tenant.id,
        actor_user_id: users.find((user) => user.role_key === 'finance').id,
        actor_role: 'finance',
        department_id: departmentMap.finance.id,
        facility_id: facilityMap.main.id,
        device_id: deviceMap.receiving.id,
        action: 'DENIED_ROUTE_ACCESS',
        entity_type: 'api_route',
        entity_id: '/api/procure-to-pay/vendors',
        summary: 'GET /api/procure-to-pay/vendors denied for missing feature',
        before_json: '{}',
        after_json: '{}',
        request_id: '',
        created_at: '2026-06-13T12:45:00Z'
      }
    );
  }

  const userRoles = users.map((user) => ({
    id: id('user_role', tenant, user.role_key),
    tenant_id: tenant.id,
    user_id: user.id,
    role_key: user.role_key,
    granted_by_user_id: users.find((candidate) => candidate.role_key === 'admin').id,
    granted_at: '2026-06-13T08:00:00Z'
  }));

  const userScopes = users.map((user) => ({
    id: id('user_scope', tenant, user.role_key),
    tenant_id: tenant.id,
    user_id: user.id,
    facility_id: user.facility_id,
    department_id: user.department_id,
    scope_type: 'PRIMARY',
    created_at: '2026-06-13T08:00:00Z',
    created_by_user_id: users.find((candidate) => candidate.role_key === 'admin').id
  }));

  const adminUserId = users.find((u) => u.role_key === 'admin').id;
  const supervisorUserId = users.find((u) => u.role_key === 'supervisor').id;
  const financeUserId = users.find((u) => u.role_key === 'finance').id;

  // SOC2-aligned compliance controls
  const complianceControlDefs = [
    { key: 'cc1_1', ref: 'CC1.1', name: 'Control Environment', title: 'Board and Management Oversight', category: 'SECURITY', domain: 'Control Environment', description: 'Management and board of directors demonstrate commitment to integrity and ethical values.', evidence_source: 'audit_logs', status: 'implemented', owner: 'admin' },
    { key: 'cc2_1', ref: 'CC2.1', name: 'Communication & Information', title: 'Information Quality', category: 'SECURITY', domain: 'Communication', description: 'The entity obtains or generates and uses relevant quality information to support internal control.', evidence_source: 'audit_logs', status: 'implemented', owner: 'admin' },
    { key: 'cc3_1', ref: 'CC3.1', name: 'Risk Assessment', title: 'Risk Identification', category: 'SECURITY', domain: 'Risk Assessment', description: 'The entity specifies objectives with sufficient clarity to enable identification and assessment of risks.', evidence_source: 'risk_register', status: 'in_progress', owner: 'admin' },
    { key: 'cc3_2', ref: 'CC3.2', name: 'Risk Assessment', title: 'Risk Analysis', category: 'SECURITY', domain: 'Risk Assessment', description: 'The entity identifies risks to achievement of its objectives across the entity.', evidence_source: 'risk_register', status: 'in_progress', owner: 'admin' },
    { key: 'cc4_1', ref: 'CC4.1', name: 'Monitoring Activities', title: 'Ongoing and Separate Evaluations', category: 'AVAILABILITY', domain: 'Monitoring', description: 'The entity selects, develops, and performs ongoing and/or separate evaluations.', evidence_source: 'audit_logs', status: 'implemented', owner: 'supervisor' },
    { key: 'cc5_1', ref: 'CC5.1', name: 'Control Activities', title: 'Control Selection', category: 'PROCESSING_INTEGRITY', domain: 'Control Activities', description: 'The entity selects and develops control activities that contribute to mitigation of risks.', evidence_source: 'audit_logs', status: 'implemented', owner: 'admin' },
    { key: 'cc6_1', ref: 'CC6.1', name: 'Logical Access Controls', title: 'Access Control Implementation', category: 'CONFIDENTIALITY', domain: 'Access Control', description: 'The entity implements logical access security software, infrastructure, and architectures.', evidence_source: 'access_reviews', status: 'implemented', owner: 'admin' },
    { key: 'cc6_2', ref: 'CC6.2', name: 'Logical Access Controls', title: 'Provisioning and Deprovisioning', category: 'CONFIDENTIALITY', domain: 'Access Control', description: 'Prior to issuing credentials and granting access, the entity registers and authorizes new users.', evidence_source: 'access_reviews', status: 'implemented', owner: 'admin' },
    { key: 'cc6_3', ref: 'CC6.3', name: 'Logical Access Controls', title: 'Role-Based Access Control', category: 'CONFIDENTIALITY', domain: 'Access Control', description: 'The entity authorizes, modifies, or removes access to data based on roles.', evidence_source: 'audit_logs', status: 'implemented', owner: 'admin' },
    { key: 'cc6_6', ref: 'CC6.6', name: 'Logical Access Controls', title: 'External Access Threats', category: 'SECURITY', domain: 'Access Control', description: 'The entity implements controls to prevent or detect and act upon the introduction of unauthorized or malicious software.', evidence_source: 'security_posture', status: 'in_progress', owner: 'admin' },
    { key: 'cc7_1', ref: 'CC7.1', name: 'System Operations', title: 'Detection of Configuration Changes', category: 'AVAILABILITY', domain: 'System Operations', description: 'The entity uses detection and monitoring procedures to identify changes to configurations.', evidence_source: 'audit_logs', status: 'implemented', owner: 'supervisor' },
    { key: 'cc7_2', ref: 'CC7.2', name: 'System Operations', title: 'Security Event Monitoring', category: 'AVAILABILITY', domain: 'System Operations', description: 'The entity monitors system components for anomalies.', evidence_source: 'audit_logs', status: 'in_progress', owner: 'supervisor' },
    { key: 'cc7_4', ref: 'CC7.4', name: 'System Operations', title: 'Incident Response', category: 'AVAILABILITY', domain: 'System Operations', description: 'The entity responds to identified security incidents by executing a defined incident management program.', evidence_source: 'incident_register', status: 'in_progress', owner: 'admin' },
    { key: 'cc8_1', ref: 'CC8.1', name: 'Change Management', title: 'Authorized Change Management', category: 'PROCESSING_INTEGRITY', domain: 'Change Management', description: 'The entity authorizes, designs, develops or acquires, configures, documents, tests, approves, and implements changes.', evidence_source: 'audit_logs', status: 'implemented', owner: 'admin' },
    { key: 'cc9_1', ref: 'CC9.1', name: 'Risk Mitigation', title: 'Risk Mitigation Activities', category: 'SECURITY', domain: 'Risk Mitigation', description: 'The entity identifies, selects, and develops risk mitigation activities for identified risks.', evidence_source: 'risk_register', status: 'in_progress', owner: 'admin' },
    { key: 'cc9_2', ref: 'CC9.2', name: 'Risk Mitigation', title: 'Vendor Risk Management', category: 'SECURITY', domain: 'Vendor Risk', description: 'The entity assesses and manages risks associated with vendors and business partners.', evidence_source: 'vendor_register', status: 'not_started', owner: 'finance' },
    { key: 'a1_1', ref: 'A1.1', name: 'Availability', title: 'Availability Capacity', category: 'AVAILABILITY', domain: 'Availability', description: 'The entity maintains, monitors, and evaluates current processing capacity and use of system components.', evidence_source: 'availability_posture', status: 'in_progress', owner: 'admin' },
    { key: 'pi1_1', ref: 'PI1.1', name: 'Processing Integrity', title: 'Processing Completeness', category: 'PROCESSING_INTEGRITY', domain: 'Processing Integrity', description: 'The entity obtains or generates, uses, and communicates relevant and quality information to support processing integrity.', evidence_source: 'audit_logs', status: 'implemented', owner: 'supervisor' },
    { key: 'c1_1', ref: 'C1.1', name: 'Confidentiality', title: 'Confidential Information Controls', category: 'CONFIDENTIALITY', domain: 'Confidentiality', description: 'The entity identifies and maintains confidential information to meet the entity\'s objectives.', evidence_source: 'documents_vault', status: 'implemented', owner: 'admin' },
    { key: 'p1_1', ref: 'P1.1', name: 'Privacy', title: 'Privacy Notice', category: 'PRIVACY', domain: 'Privacy', description: 'The entity provides notice to data subjects about privacy practices and data handling.', evidence_source: 'security_posture', status: 'not_started', owner: 'admin' }
  ];

  const ownerMap = { admin: adminUserId, supervisor: supervisorUserId, finance: financeUserId };

  const complianceControls = complianceControlDefs.map((def) => ({
    id: id('control', tenant, def.key),
    tenant_id: tenant.id,
    control_key: def.key,
    name: def.name,
    title: def.title,
    description: def.description,
    category: def.category,
    domain: def.domain,
    framework_ref: def.ref,
    evidence_source: def.evidence_source,
    status: def.status,
    owner_role_key: def.owner,
    review_frequency: 'QUARTERLY',
    last_reviewed_at: def.status === 'implemented' ? '2026-05-01T10:00:00Z' : null,
    next_review_due_at: '2026-08-01T10:00:00Z',
    exception_count: 0,
    created_at: '2026-01-15T08:00:00Z',
    updated_at: '2026-05-01T10:00:00Z'
  }));

  // Access review cycles (IntelliFlow only)
  const accessReviews = tenant.tier === 'full' ? [
    {
      id: id('access_review', tenant, 'q1_2026'),
      tenant_id: tenant.id,
      review_name: 'Q1 2026 Quarterly Access Review',
      reviewer_user_id: adminUserId,
      status: 'COMPLETED',
      started_at: '2026-03-28T09:00:00Z',
      completed_at: '2026-03-31T17:00:00Z',
      due_at: '2026-03-31T17:00:00Z',
      total_entries: 5,
      reviewed_entries: 5,
      revoked_entries: 0,
      notes: 'All access confirmed current. No revocations required.',
      created_at: '2026-03-28T09:00:00Z',
      updated_at: '2026-03-31T17:00:00Z',
      created_by_user_id: adminUserId
    },
    {
      id: id('access_review', tenant, 'q2_2026'),
      tenant_id: tenant.id,
      review_name: 'Q2 2026 Quarterly Access Review',
      reviewer_user_id: adminUserId,
      status: 'IN_PROGRESS',
      started_at: '2026-06-16T09:00:00Z',
      completed_at: null,
      due_at: '2026-06-30T17:00:00Z',
      total_entries: 5,
      reviewed_entries: 2,
      revoked_entries: 0,
      notes: 'Review in progress. 3 entries pending.',
      created_at: '2026-06-16T09:00:00Z',
      updated_at: '2026-06-16T09:00:00Z',
      created_by_user_id: adminUserId
    }
  ] : [];

  const accessReviewEntries = tenant.tier === 'full' ? [
    // Q1 2026 entries — all CONFIRMED
    ...users.map((user, idx) => ({
      id: id('are', tenant, `q1_${user.role_key}`),
      tenant_id: tenant.id,
      access_review_id: id('access_review', tenant, 'q1_2026'),
      subject_user_id: user.id,
      current_role: user.role_key,
      current_facility: 'Main Facility',
      current_department: user.department_id,
      permission_snapshot: '[]',
      last_login_at: `2026-03-${String(28 - idx).padStart(2, '0')}T08:00:00Z`,
      days_since_login: idx + 1,
      recommendation: 'RETAIN',
      decision: 'CONFIRMED',
      decision_reason: 'Access is current and appropriate for role.',
      reviewed_by_user_id: adminUserId,
      reviewed_at: `2026-03-3${Math.min(idx + 1, 1)}T${10 + idx}:00:00Z`,
      created_at: '2026-03-28T09:00:00Z',
      updated_at: `2026-03-3${Math.min(idx + 1, 1)}T${10 + idx}:00:00Z`
    })),
    // Q2 2026 entries — 2 reviewed, 3 pending
    ...users.map((user, idx) => ({
      id: id('are', tenant, `q2_${user.role_key}`),
      tenant_id: tenant.id,
      access_review_id: id('access_review', tenant, 'q2_2026'),
      subject_user_id: user.id,
      current_role: user.role_key,
      current_facility: 'Main Facility',
      current_department: user.department_id,
      permission_snapshot: '[]',
      last_login_at: `2026-06-${String(16 - idx).padStart(2, '0')}T08:00:00Z`,
      days_since_login: idx,
      recommendation: 'RETAIN',
      decision: idx < 2 ? 'CONFIRMED' : null,
      decision_reason: idx < 2 ? 'Access is current and appropriate.' : '',
      reviewed_by_user_id: idx < 2 ? adminUserId : null,
      reviewed_at: idx < 2 ? `2026-06-16T${10 + idx}:00:00Z` : null,
      created_at: '2026-06-16T09:00:00Z',
      updated_at: idx < 2 ? `2026-06-16T${10 + idx}:00:00Z` : '2026-06-16T09:00:00Z'
    }))
  ] : [];

  // Risk register
  const riskRegister = tenant.tier === 'full' ? [
    {
      id: id('risk', tenant, 'r001'),
      tenant_id: tenant.id,
      risk_no: 'RSK-001',
      title: 'Unauthorized Access to Sensitive Inventory',
      description: 'Risk that restricted or controlled inventory items are accessed by users without appropriate permissions.',
      category: 'SECURITY',
      domain: 'Access Control',
      probability: 'LOW',
      impact: 'HIGH',
      risk_score: 75,
      status: 'MITIGATED',
      mitigation: 'RBAC enforced server-side. Controlled items flagged with role-based visibility restrictions.',
      mitigation_status: 'IMPLEMENTED',
      owner_user_id: adminUserId,
      owner_role: 'admin',
      related_control_id: id('control', tenant, 'cc6_3'),
      last_reviewed_at: '2026-05-01T10:00:00Z',
      next_review_at: '2026-08-01T10:00:00Z',
      closed_at: null,
      created_at: '2026-01-15T08:00:00Z',
      updated_at: '2026-05-01T10:00:00Z',
      created_by_user_id: adminUserId,
      updated_by_user_id: adminUserId
    },
    {
      id: id('risk', tenant, 'r002'),
      tenant_id: tenant.id,
      risk_no: 'RSK-002',
      title: 'Cross-Tenant Data Leakage',
      description: 'Risk that multi-tenant query isolation fails and one tenant can see another tenant\'s data.',
      category: 'CONFIDENTIALITY',
      domain: 'Data Isolation',
      probability: 'LOW',
      impact: 'CRITICAL',
      risk_score: 90,
      status: 'MITIGATED',
      mitigation: 'All queries include tenant_id binding. Evostel restriction confirmed by automated tests.',
      mitigation_status: 'IMPLEMENTED',
      owner_user_id: adminUserId,
      owner_role: 'admin',
      related_control_id: id('control', tenant, 'cc6_1'),
      last_reviewed_at: '2026-05-15T10:00:00Z',
      next_review_at: '2026-08-15T10:00:00Z',
      closed_at: null,
      created_at: '2026-01-15T08:00:00Z',
      updated_at: '2026-05-15T10:00:00Z',
      created_by_user_id: adminUserId,
      updated_by_user_id: adminUserId
    },
    {
      id: id('risk', tenant, 'r003'),
      tenant_id: tenant.id,
      risk_no: 'RSK-003',
      title: 'AI Advisory Output Used Without Human Review',
      description: 'Risk that AI recommendation outputs are acted upon directly without human approval.',
      category: 'PROCESSING_INTEGRITY',
      domain: 'AI Governance',
      probability: 'MEDIUM',
      impact: 'MEDIUM',
      risk_score: 50,
      status: 'OPEN',
      mitigation: 'AI is read-only. No domain mutations are triggered by AI. All outputs are labeled SYSTEM_GENERATED.',
      mitigation_status: 'IN_PROGRESS',
      owner_user_id: adminUserId,
      owner_role: 'admin',
      related_control_id: id('control', tenant, 'cc5_1'),
      last_reviewed_at: '2026-06-01T10:00:00Z',
      next_review_at: '2026-09-01T10:00:00Z',
      closed_at: null,
      created_at: '2026-03-01T08:00:00Z',
      updated_at: '2026-06-01T10:00:00Z',
      created_by_user_id: adminUserId,
      updated_by_user_id: adminUserId
    },
    {
      id: id('risk', tenant, 'r004'),
      tenant_id: tenant.id,
      risk_no: 'RSK-004',
      title: 'Missing SSO / MFA in Production',
      description: 'Dev-context authentication mode must not be deployed to production. OIDC provider must be configured.',
      category: 'SECURITY',
      domain: 'Authentication',
      probability: 'MEDIUM',
      impact: 'HIGH',
      risk_score: 70,
      status: 'OPEN',
      mitigation: 'Startup check blocks OPSTRAX_ALLOW_DEV_CONTEXT=1 in NODE_ENV=production. OIDC is CONFIGURATION_REQUIRED.',
      mitigation_status: 'IN_PROGRESS',
      owner_user_id: adminUserId,
      owner_role: 'admin',
      related_control_id: id('control', tenant, 'cc6_6'),
      last_reviewed_at: '2026-06-01T10:00:00Z',
      next_review_at: '2026-09-01T10:00:00Z',
      closed_at: null,
      created_at: '2026-04-01T08:00:00Z',
      updated_at: '2026-06-01T10:00:00Z',
      created_by_user_id: adminUserId,
      updated_by_user_id: adminUserId
    },
    {
      id: id('risk', tenant, 'r005'),
      tenant_id: tenant.id,
      risk_no: 'RSK-005',
      title: 'Vendor Compliance Document Expiry',
      description: 'Expired supplier compliance documents may block procurement workflows or expose compliance gaps.',
      category: 'OPERATIONAL',
      domain: 'Vendor Risk',
      probability: 'MEDIUM',
      impact: 'MEDIUM',
      risk_score: 45,
      status: 'OPEN',
      mitigation: 'Supplier Governance module enforces compliance checks before procurement. Waivers require approval.',
      mitigation_status: 'IMPLEMENTED',
      owner_user_id: financeUserId,
      owner_role: 'finance',
      related_control_id: id('control', tenant, 'cc9_2'),
      last_reviewed_at: '2026-06-01T10:00:00Z',
      next_review_at: '2026-09-01T10:00:00Z',
      closed_at: null,
      created_at: '2026-04-01T08:00:00Z',
      updated_at: '2026-06-01T10:00:00Z',
      created_by_user_id: financeUserId,
      updated_by_user_id: adminUserId
    }
  ] : [];

  // Incident register
  const incidentRegister = tenant.tier === 'full' ? [
    {
      id: id('incident', tenant, 'inc001'),
      tenant_id: tenant.id,
      incident_no: 'INC-001',
      title: 'Offline Sync Conflict — Duplicate Stock Movement',
      description: 'Worker submitted an offline batch that conflicted with a concurrent stock adjustment, resulting in a duplicate movement record flagged for supervisor review.',
      category: 'OPERATIONAL',
      severity: 'LOW',
      status: 'RESOLVED',
      root_cause: 'Offline batch replay executed against stale stock snapshot. Conflict detection correctly flagged it.',
      resolution: 'Supervisor reviewed and rejected the conflicting offline batch. Stock was reconciled manually.',
      affected_systems: 'Offline Sync, Inventory Control',
      affected_user_count: 2,
      detected_at: '2026-05-14T10:30:00Z',
      reported_at: '2026-05-14T11:00:00Z',
      contained_at: '2026-05-14T12:00:00Z',
      resolved_at: '2026-05-14T15:00:00Z',
      owner_user_id: supervisorUserId,
      related_control_id: id('control', tenant, 'cc7_4'),
      related_risk_id: null,
      post_mortem: 'Conflict detection worked correctly. No data loss. Added test coverage for concurrent batch replay.',
      created_at: '2026-05-14T11:00:00Z',
      updated_at: '2026-05-14T15:00:00Z',
      created_by_user_id: supervisorUserId,
      updated_by_user_id: adminUserId
    },
    {
      id: id('incident', tenant, 'inc002'),
      tenant_id: tenant.id,
      incident_no: 'INC-002',
      title: 'Finance Export Validation Failure — Blocked Batch',
      description: 'An export batch was blocked during validation due to missing accounting codes on 3 purchase order lines.',
      category: 'PROCESSING_INTEGRITY',
      severity: 'MEDIUM',
      status: 'RESOLVED',
      root_cause: 'Purchase orders created before accounting code requirement was enforced did not have cost center codes.',
      resolution: 'Finance team updated the PO lines with correct accounting codes. Batch re-validated and dispatched.',
      affected_systems: 'Finance Export Hub, Integration Center',
      affected_user_count: 1,
      detected_at: '2026-06-02T09:00:00Z',
      reported_at: '2026-06-02T09:15:00Z',
      contained_at: '2026-06-02T09:15:00Z',
      resolved_at: '2026-06-02T14:00:00Z',
      owner_user_id: financeUserId,
      related_control_id: id('control', tenant, 'cc8_1'),
      related_risk_id: null,
      post_mortem: 'Accounting code validation is now enforced at PO creation. Historical records backfilled.',
      created_at: '2026-06-02T09:15:00Z',
      updated_at: '2026-06-02T14:00:00Z',
      created_by_user_id: financeUserId,
      updated_by_user_id: adminUserId
    },
    {
      id: id('incident', tenant, 'inc003'),
      tenant_id: tenant.id,
      incident_no: 'INC-003',
      title: 'Supplier Compliance Waiver — Expired Certificate',
      description: 'A purchase request was submitted referencing a supplier whose ISO certificate expired. The compliance gate blocked downstream processing until a waiver was issued.',
      category: 'OPERATIONAL',
      severity: 'MEDIUM',
      status: 'CLOSED',
      root_cause: 'Supplier did not renew ISO certificate before expiry. Alert system notified 30 days prior but no action was taken.',
      resolution: 'Compliance team issued a time-limited waiver. Supplier was notified to renew certificate within 30 days.',
      affected_systems: 'Supplier Governance, Procurement Center',
      affected_user_count: 3,
      detected_at: '2026-06-05T14:00:00Z',
      reported_at: '2026-06-05T14:30:00Z',
      contained_at: '2026-06-05T16:00:00Z',
      resolved_at: '2026-06-06T10:00:00Z',
      owner_user_id: adminUserId,
      related_control_id: id('control', tenant, 'cc9_2'),
      related_risk_id: id('risk', tenant, 'r005'),
      post_mortem: 'Renewal alert process improved. Automated escalation added if certificate is not renewed 14 days after initial alert.',
      created_at: '2026-06-05T14:30:00Z',
      updated_at: '2026-06-06T10:00:00Z',
      created_by_user_id: adminUserId,
      updated_by_user_id: adminUserId
    }
  ] : [];

  // AI governance logs
  const aiGovernanceLogs = tenant.tier === 'full' ? [
    {
      id: id('ai_gov', tenant, 'log001'),
      tenant_id: tenant.id,
      actor_user_id: adminUserId,
      actor_role: 'admin',
      module: 'AI Operations',
      agent_key: 'inventory_agent',
      event_type: 'ADVISORY_REQUEST',
      data_scope: 'inventory_items, stock_balances',
      provider_status: 'NOT_CONFIGURED',
      output_type: 'ADVISORY_ONLY',
      human_approval_required: 0,
      human_approved_by_user_id: null,
      human_approved_at: null,
      input_record_count: 12,
      output_record_count: 3,
      token_input_count: 0,
      token_output_count: 0,
      estimated_cost: 0.0,
      notes: 'SYSTEM_GENERATED: Low stock detection. No LLM used.',
      created_at: '2026-06-13T09:00:00Z'
    },
    {
      id: id('ai_gov', tenant, 'log002'),
      tenant_id: tenant.id,
      actor_user_id: adminUserId,
      actor_role: 'admin',
      module: 'AI Operations',
      agent_key: 'procurement_agent',
      event_type: 'ADVISORY_REQUEST',
      data_scope: 'purchase_requests, vendors',
      provider_status: 'NOT_CONFIGURED',
      output_type: 'ADVISORY_ONLY',
      human_approval_required: 0,
      human_approved_by_user_id: null,
      human_approved_at: null,
      input_record_count: 8,
      output_record_count: 2,
      token_input_count: 0,
      token_output_count: 0,
      estimated_cost: 0.0,
      notes: 'SYSTEM_GENERATED: Procurement exception detection. No LLM used.',
      created_at: '2026-06-13T09:05:00Z'
    },
    {
      id: id('ai_gov', tenant, 'log003'),
      tenant_id: tenant.id,
      actor_user_id: adminUserId,
      actor_role: 'admin',
      module: 'AI Operations',
      agent_key: 'compliance_agent',
      event_type: 'ADVISORY_REQUEST',
      data_scope: 'audit_logs, compliance_controls',
      provider_status: 'NOT_CONFIGURED',
      output_type: 'ADVISORY_ONLY',
      human_approval_required: 0,
      human_approved_by_user_id: null,
      human_approved_at: null,
      input_record_count: 30,
      output_record_count: 2,
      token_input_count: 0,
      token_output_count: 0,
      estimated_cost: 0.0,
      notes: 'SYSTEM_GENERATED: Compliance gap detection. No LLM used.',
      created_at: '2026-06-13T09:10:00Z'
    },
    {
      id: id('ai_gov', tenant, 'log004'),
      tenant_id: tenant.id,
      actor_user_id: adminUserId,
      actor_role: 'admin',
      module: 'AI Operations',
      agent_key: 'ops_copilot',
      event_type: 'COPILOT_QUERY',
      data_scope: 'inventory_items, purchase_requests, audit_logs',
      provider_status: 'NOT_CONFIGURED',
      output_type: 'ADVISORY_ONLY',
      human_approval_required: 0,
      human_approved_by_user_id: null,
      human_approved_at: null,
      input_record_count: 50,
      output_record_count: 1,
      token_input_count: 0,
      token_output_count: 0,
      estimated_cost: 0.0,
      notes: 'SYSTEM_GENERATED copilot response. Query: "What inventory risks should I address today?"',
      created_at: '2026-06-13T10:00:00Z'
    },
    {
      id: id('ai_gov', tenant, 'log005'),
      tenant_id: tenant.id,
      actor_user_id: supervisorUserId,
      actor_role: 'supervisor',
      module: 'AI Operations',
      agent_key: 'inventory_agent',
      event_type: 'RECOMMENDATION_ACKNOWLEDGED',
      data_scope: 'ai_recommendations',
      provider_status: 'NOT_CONFIGURED',
      output_type: 'ADVISORY_ONLY',
      human_approval_required: 1,
      human_approved_by_user_id: supervisorUserId,
      human_approved_at: '2026-06-13T11:30:00Z',
      input_record_count: 1,
      output_record_count: 1,
      token_input_count: 0,
      token_output_count: 0,
      estimated_cost: 0.0,
      notes: 'Supervisor acknowledged low-stock recommendation. Human approval recorded.',
      created_at: '2026-06-13T11:30:00Z'
    },
    {
      id: id('ai_gov', tenant, 'log006'),
      tenant_id: tenant.id,
      actor_user_id: adminUserId,
      actor_role: 'admin',
      module: 'AI Operations',
      agent_key: 'compliance_agent',
      event_type: 'ADVISORY_REQUEST',
      data_scope: 'audit_logs, risk_register',
      provider_status: 'NOT_CONFIGURED',
      output_type: 'ADVISORY_ONLY',
      human_approval_required: 0,
      human_approved_by_user_id: null,
      human_approved_at: null,
      input_record_count: 20,
      output_record_count: 1,
      token_input_count: 0,
      token_output_count: 0,
      estimated_cost: 0.0,
      notes: 'SYSTEM_GENERATED: Overdue control review detection.',
      created_at: '2026-06-14T09:00:00Z'
    }
  ] : [];

  return {
    tenants: [tenant],
    tenantFeatures: featureFlagRows(tenant),
    permissions,
    rolePermissions: Object.entries(rolePermissions).flatMap(([roleKey, permissionKeys]) =>
      permissionKeys.map((permissionKey) => ({
        role_key: roleKey,
        permission_key: permissionKey,
        enabled: 1
      }))
    ),
    userRoles,
    userScopes,
    vendors,
    vendorScores,
    costCenters: Object.values(costCenterMap),
    supplierComplianceDocuments,
    supplierContracts,
    procurementWaivers,
    departmentBudgets,
    budgetLedgerEntries,
    itemCategories: categoryCatalog.map((category) => ({
      id: id('category', tenant, category.code.toLowerCase()),
      tenant_id: tenant.id,
      name: category.name,
      code: category.code,
      active: 1
    })),
    departments: Object.values(departmentMap),
    facilities: Object.values(facilityMap),
    users,
    devices: Object.values(deviceMap),
    items: Object.values(itemMap),
    bins,
    stockBalances,
    internalRequests,
    requestLines,
    warehouseTasks,
    warehouseTaskLines,
    purchaseRequests,
    purchaseRequestLines,
    purchaseOrders,
    purchaseOrderLines,
    receiveSessions,
    receiveSessionLines,
    syncBatches,
    syncTasks,
    labelPrintJobs,
    exportBatches,
    exportValidationErrors,
    evidenceLinks,
    syncConflicts,
    exportTransfers,
    integrationConnections,
    integrationJobs,
    vendorInvoices,
    vendorInvoiceLines,
    invoiceExtractionRuns,
    invoiceMatchResults,
    invoiceMatchExceptions,
    invoiceApprovalEvents,
    rfqRequests,
    rfqLines,
    vendorQuotes,
    vendorQuoteLines,
    vendorScorecards,
    documents,
    auditLogs,
    complianceControls,
    accessReviews,
    accessReviewEntries,
    riskRegister,
    incidentRegister,
    aiGovernanceLogs,
    backupRecords: [],
    restoreTestRecords: [],
    ssoConfigurations: []
  };
}

const seeded = tenants.map(buildTenantData);

export const seedData = {
  tenants,
  roles,
  permissions,
  rolePermissions: seeded.flatMap((tenant) => tenant.rolePermissions),
  userRoles: seeded.flatMap((tenant) => tenant.userRoles),
  userScopes: seeded.flatMap((tenant) => tenant.userScopes),
  tenantFeatures: seeded.flatMap((tenant) => tenant.tenantFeatures),
  vendors: seeded.flatMap((tenant) => tenant.vendors),
  vendorScores: seeded.flatMap((tenant) => tenant.vendorScores),
  costCenters: seeded.flatMap((tenant) => tenant.costCenters),
  supplierComplianceDocuments: seeded.flatMap((tenant) => tenant.supplierComplianceDocuments),
  supplierContracts: seeded.flatMap((tenant) => tenant.supplierContracts),
  procurementWaivers: seeded.flatMap((tenant) => tenant.procurementWaivers),
  departmentBudgets: seeded.flatMap((tenant) => tenant.departmentBudgets),
  budgetLedgerEntries: seeded.flatMap((tenant) => tenant.budgetLedgerEntries),
  itemCategories: seeded.flatMap((tenant) => tenant.itemCategories),
  departments: seeded.flatMap((tenant) => tenant.departments),
  facilities: seeded.flatMap((tenant) => tenant.facilities),
  users: seeded.flatMap((tenant) => tenant.users),
  devices: seeded.flatMap((tenant) => tenant.devices),
  items: seeded.flatMap((tenant) => tenant.items),
  bins: seeded.flatMap((tenant) => tenant.bins),
  stockBalances: seeded.flatMap((tenant) => tenant.stockBalances),
  internalRequests: seeded.flatMap((tenant) => tenant.internalRequests),
  requestLines: seeded.flatMap((tenant) => tenant.requestLines),
  purchaseOrders: seeded.flatMap((tenant) => tenant.purchaseOrders),
  purchaseOrderLines: seeded.flatMap((tenant) => tenant.purchaseOrderLines),
  receiveSessions: seeded.flatMap((tenant) => tenant.receiveSessions),
  receiveSessionLines: seeded.flatMap((tenant) => tenant.receiveSessionLines),
  warehouseTasks: seeded.flatMap((tenant) => tenant.warehouseTasks),
  warehouseTaskLines: seeded.flatMap((tenant) => tenant.warehouseTaskLines),
  purchaseRequests: seeded.flatMap((tenant) => tenant.purchaseRequests),
  purchaseRequestLines: seeded.flatMap((tenant) => tenant.purchaseRequestLines),
  syncBatches: seeded.flatMap((tenant) => tenant.syncBatches),
  syncTasks: seeded.flatMap((tenant) => tenant.syncTasks),
  labelPrintJobs: seeded.flatMap((tenant) => tenant.labelPrintJobs),
  exportBatches: seeded.flatMap((tenant) => tenant.exportBatches),
  exportValidationErrors: seeded.flatMap((tenant) => tenant.exportValidationErrors),
  evidenceLinks: seeded.flatMap((tenant) => tenant.evidenceLinks),
  syncConflicts: seeded.flatMap((tenant) => tenant.syncConflicts),
  exportTransfers: seeded.flatMap((tenant) => tenant.exportTransfers),
  integrationConnections: seeded.flatMap((tenant) => tenant.integrationConnections),
  integrationJobs: seeded.flatMap((tenant) => tenant.integrationJobs),
  vendorInvoices: seeded.flatMap((tenant) => tenant.vendorInvoices),
  vendorInvoiceLines: seeded.flatMap((tenant) => tenant.vendorInvoiceLines),
  invoiceExtractionRuns: seeded.flatMap((tenant) => tenant.invoiceExtractionRuns),
  invoiceMatchResults: seeded.flatMap((tenant) => tenant.invoiceMatchResults),
  invoiceMatchExceptions: seeded.flatMap((tenant) => tenant.invoiceMatchExceptions),
  invoiceApprovalEvents: seeded.flatMap((tenant) => tenant.invoiceApprovalEvents),
  rfqRequests: seeded.flatMap((tenant) => tenant.rfqRequests),
  rfqLines: seeded.flatMap((tenant) => tenant.rfqLines),
  vendorQuotes: seeded.flatMap((tenant) => tenant.vendorQuotes),
  vendorQuoteLines: seeded.flatMap((tenant) => tenant.vendorQuoteLines),
  vendorScorecards: seeded.flatMap((tenant) => tenant.vendorScorecards),
  documents: seeded.flatMap((tenant) => tenant.documents),
  auditLogs: seeded.flatMap((tenant) => tenant.auditLogs),
  complianceControls: seeded.flatMap((tenant) => tenant.complianceControls),
  accessReviews: seeded.flatMap((tenant) => tenant.accessReviews),
  accessReviewEntries: seeded.flatMap((tenant) => tenant.accessReviewEntries),
  riskRegister: seeded.flatMap((tenant) => tenant.riskRegister),
  incidentRegister: seeded.flatMap((tenant) => tenant.incidentRegister),
  aiGovernanceLogs: seeded.flatMap((tenant) => tenant.aiGovernanceLogs),
  backupRecords: seeded.flatMap((tenant) => tenant.backupRecords),
  restoreTestRecords: seeded.flatMap((tenant) => tenant.restoreTestRecords),
  ssoConfigurations: seeded.flatMap((tenant) => tenant.ssoConfigurations)
};
