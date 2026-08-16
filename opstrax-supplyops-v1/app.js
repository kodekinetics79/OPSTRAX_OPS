const persistedPage = typeof localStorage !== 'undefined' ? localStorage.getItem('opstrax.page') : '';
const persistedPlatformPage = typeof localStorage !== 'undefined' ? localStorage.getItem('opstrax.platform.page') : '';
const persistedSearch = typeof localStorage !== 'undefined' ? localStorage.getItem('opstrax.search') || '' : '';
const initialPathname = typeof window !== 'undefined' ? window.location.pathname : '/';
const initialSurface = initialPathname.startsWith('/platform') ? 'platform' : 'tenant';

export const state = {
  surface: initialSurface,
  page: persistedPage || 'Command Center',
  platformPage: persistedPlatformPage || 'Platform Dashboard',
  platformTenantId: '',
  authMode: 'dev',
  authRequired: false,
  loginUrl: '/auth/login',
  authBootstrap: null,
  platformAuthBootstrap: null,
  identity: null,
  platformIdentity: null,
  bootstrap: null,
  platformBootstrap: null,
  data: null,
  platformData: null,
  evidenceDetails: {},
  receivingDetails: {},
  exportDetails: {},
  integrationDetails: {},
  procurementDetails: {},
  p2pDetails: {},
  reportDetails: {},
  p2pInvoiceLineDraft: null,
  procurementLineDraft: null,
  requestDetails: {},
  warehouseTaskDetails: {},
  availableRequestItems: null,
  requestLineDraft: null,
  complianceTab: 'Dashboard',
  drawerTab: 'Details',
  drawerFocus: { type: 'tenant', id: 'current' },
  search: persistedSearch,
  inventoryFilter: '',
  loading: true,
  error: '',
  toastTimer: null
};

const PAGE_GROUPS = [
  {
    title: 'Command Center',
    items: ['Command Center']
  },
  {
    title: 'Inventory & Warehouse',
    items: ['Inventory Control', 'Warehouse Workflows', 'Receiving Center', 'Internal Storefront', 'Barcode & Device Hub', 'OfflineOps', 'Worker-Safe Mode']
  },
  {
    title: 'Procurement',
    items: ['Procurement & Purchasing', 'Supplier Governance', 'Contract Repository', 'Budget Control', 'Procure-to-Pay Intelligence']
  },
  {
    title: 'Finance Control',
    items: ['FinanceSync Export Hub', 'Integration Center']
  },
  {
    title: 'Compliance & Trust',
    items: ['Documents & Evidence Vault', 'Audit Black Box', 'Compliance Center', 'Asset & Custody Center']
  },
  {
    title: 'AI Intelligence',
    items: ['Ask OpsTrax AI', 'Reports', 'Inventory Optimization']
  },
  {
    title: 'Admin / Settings',
    items: ['Admin']
  }
];

const PLATFORM_PAGE_GROUPS = [
  {
    title: 'Control Plane',
    items: ['Platform Dashboard', 'Tenant Directory', 'Tenant Detail', 'Subscription & Plans']
  },
  {
    title: 'Governance',
    items: ['Module Entitlements', 'User & Seats', 'Support Sessions', 'Security & Audit', 'System Health']
  }
];

const PLATFORM_PAGE_TITLES = {
  'Platform Dashboard': 'Platform Dashboard',
  'Tenant Directory': 'Tenant Directory',
  'Tenant Detail': 'Tenant Detail',
  'Subscription & Plans': 'Subscription & Plans',
  'Module Entitlements': 'Module Entitlements',
  'User & Seats': 'User & Seats',
  'Support Sessions': 'Support Sessions',
  'Security & Audit': 'Security & Audit',
  'System Health': 'System Health'
};

const PAGE_NAV_LABELS = {
  'Internal Storefront': 'Request Center',
  'Procurement & Purchasing': 'Procurement Center',
  'Supplier Governance': 'Supplier Governance',
  'Contract Repository': 'Contract Repository',
  'Budget Control': 'Budget Control',
  'Procure-to-Pay Intelligence': 'Invoice Intelligence',
  'Documents & Evidence Vault': 'Evidence Vault',
  'Barcode & Device Hub': 'DeviceOps Center',
  OfflineOps: 'Offline Sync',
  'Ask OpsTrax AI': 'AI Operations',
  'Audit Black Box': 'Audit Trail',
  'FinanceSync Export Hub': 'Finance Export Hub',
  'Worker-Safe Mode': 'Worker-Safe Mode',
  Reports: 'Reports',
  'Inventory Optimization': 'Inventory Optimization',
  'Asset & Custody Center': 'Asset & Custody',
  Admin: 'Admin / Settings'
};

const PAGE_FEATURES = {
  'Command Center': 'command_center',
  'Inventory Control': 'inventory_control',
  'Warehouse Workflows': 'warehouse_workflows',
  'Receiving Center': 'receiving_core',
  'Internal Storefront': 'internal_storefront',
  'Procurement & Purchasing': 'procurement_purchasing',
  'Supplier Governance': 'supplier_governance',
  'Contract Repository': 'contract_repository',
  'Budget Control': 'budget_controls',
  'Procure-to-Pay Intelligence': 'procure_to_pay_intelligence',
  OfflineOps: 'offline_ops',
  'Worker-Safe Mode': 'worker_safe_mode',
  'Barcode & Device Hub': 'barcode_device_hub',
  'Documents & Evidence Vault': 'documents_evidence_vault',
  'FinanceSync Export Hub': 'finance_sync_export_hub',
  'Integration Center': 'integration_center',
  'Audit Black Box': 'audit_black_box',
  'Compliance Center': 'compliance_center',
  'Ask OpsTrax AI': 'ask_opstrax_ai',
  Reports: 'reports',
  'Inventory Optimization': 'inventory_optimization',
  'Asset & Custody Center': 'asset_custody',
  Admin: 'admin'
};

const PAGE_CAPABILITIES = {
  Admin: 'manage_admin',
  'FinanceSync Export Hub': 'manage_exports',
  'Integration Center': 'view_integrations',
  'Warehouse Workflows': 'view_warehouse_tasks',
  'Procure-to-Pay Intelligence': 'view_procure_to_pay',
  'Inventory Optimization': 'view_inventory_optimization',
  'Asset & Custody Center': 'view_asset_custody'
};

const PAGE_TITLES = {
  'Command Center': 'Command Center',
  'Inventory Control': 'Inventory Control',
  'Warehouse Workflows': 'Warehouse Workflows',
  'Receiving Center': 'Receiving Center',
  'Internal Storefront': 'Request Center',
  'Procurement & Purchasing': 'Procurement Center',
  'Supplier Governance': 'Supplier Governance',
  'Contract Repository': 'Contract Repository',
  'Budget Control': 'Budget Control',
  'Procure-to-Pay Intelligence': 'Invoice Intelligence',
  OfflineOps: 'Offline Sync',
  'Worker-Safe Mode': 'Worker-Safe Mode',
  'Barcode & Device Hub': 'DeviceOps Center',
  'Documents & Evidence Vault': 'Evidence Vault',
  'FinanceSync Export Hub': 'Finance Export Hub',
  'Integration Center': 'Integration Center',
  'Audit Black Box': 'Audit Trail',
  'Compliance Center': 'Compliance Center',
  'Ask OpsTrax AI': 'AI Operations',
  Reports: 'Reports',
  'Inventory Optimization': 'Inventory Optimization Center',
  'Asset & Custody Center': 'Asset & Custody Center',
  Admin: 'Admin / Settings'
};

const SECTION_NOTE = {
  'Command Center': 'Operational summary across inventory, warehouse, procurement, receiving, finance readiness, evidence, and compliance posture.',
  'Inventory Control': 'Stock, bin, barcode, and min/max data backed directly by the tenant database.',
  'Warehouse Workflows': 'Receiving, putaway, picking, issue, and offline execution flows.',
  'Receiving Center': 'Purchase-order receipts, line capture, exceptions, and posting control.',
  'Internal Storefront': 'Department requests with server-side approvals and issue tracking.',
  'Procurement & Purchasing': 'Draft and approve purchase requests with accounting code checks.',
  'Supplier Governance': 'Supplier compliance documents, risk posture, waivers, and controlled usage checks.',
  'Contract Repository': 'Supplier contracts, expiry alerts, and non-contract spend detection.',
  'Budget Control': 'Department and cost-center budgets with reservation and consumption posture.',
  'Procure-to-Pay Intelligence': 'Invoice intelligence, RFQ comparison, quote award, and supplier intelligence.',
  OfflineOps: 'Disconnected batches staged for supervisor review before posting.',
  'Worker-Safe Mode': 'Restricted execution surface with no sensitive finance or admin controls.',
  'Barcode & Device Hub': 'Label queue and device trust registry for scan-driven operations.',
  'Documents & Evidence Vault': 'Evidence records are linked to the correct operational record and tracked in the audit log.',
  'FinanceSync Export Hub': 'Validation-first export generation for accounting handoff.',
  'Integration Center': 'Connection and job tracking for ERP handoff without external success claims.',
  'Audit Black Box': 'Immutable event trail for critical actions and reviews.',
  'Compliance Center': 'Operational controls that reflect live workflow posture.',
  'Ask OpsTrax AI': 'Heuristic operational insights built from current tenant state.',
  Reports: 'Executive reporting catalog and export-oriented views.',
  'Inventory Optimization': 'Cycle counts, variance control, replenishment recommendations, and ABC classification — backed by live tenant inventory.',
  'Asset & Custody Center': 'Every custody movement is audit-backed. Disposal and write-off require approval. Controlled assets require elevated custody approval.',
  Admin: 'Tenant-scoped platform settings, users, facilities, and devices.'
};

function h(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function fmt(value) {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.valueOf()) ? value : date.toLocaleString();
}

function money(value) {
  const amount = Number(value ?? 0);
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);
}

function safeJsonParse(value, fallback = {}) {
  if (!value) return fallback;
  try {
    return JSON.parse(value);
  } catch {
    return fallback;
  }
}

function badge(text) {
  const value = String(text ?? '').trim();
  const lower = value.toLowerCase();
  const klass =
    lower.includes('low') || lower.includes('medium') || lower.includes('pending') || lower.includes('draft') || lower.includes('warn') || lower.includes('review')
      ? 'amber'
      : lower.includes('error') || lower.includes('blocked') || lower.includes('failed') || lower.includes('reject') || lower.includes('high') || lower.includes('critical')
        ? 'red'
        : lower.includes('approved') || lower.includes('posted') || lower.includes('generated') || lower.includes('ready') || lower.includes('active')
          ? 'green'
          : lower.includes('open') || lower.includes('submitted') || lower.includes('picking') || lower.includes('queued')
            ? 'blue'
            : 'gray';
  return `<span class="badge ${klass}">${h(value)}</span>`;
}

function toast(message) {
  const node = document.getElementById('toast');
  if (!node) return;
  node.textContent = message;
  node.classList.add('show');
  clearTimeout(state.toastTimer);
  state.toastTimer = setTimeout(() => node.classList.remove('show'), 2600);
}

function tenantLabel() {
  return state.identity?.tenant?.name || state.bootstrap?.tenant?.name || 'OpsTrax';
}

function currentUser() {
  return state.identity?.user || state.bootstrap?.user || null;
}

function enabledFeatures() {
  return new Set(state.identity?.features || state.bootstrap?.features || []);
}

function isPageEnabled(page) {
  const feature = PAGE_FEATURES[page];
  if (!feature) return true;
  if (!state.bootstrap?.features) return true;
  return enabledFeatures().has(feature);
}

function visiblePages() {
  return PAGE_GROUPS.flatMap((group) => group.items).filter((page) => isPageEnabled(page));
}

function normalizePage(page) {
  if (isPageEnabled(page)) return page;
  return visiblePages()[0] || 'Command Center';
}

function capabilities() {
  return new Set(state.identity?.capabilities || state.bootstrap?.capabilities || []);
}

function can(capability) {
  return capabilities().has(capability);
}

function pageSignals() {
  const kpis = state.bootstrap?.summary?.kpis || {};
  const compliance = state.data?.compliance?.summary?.compliance || state.bootstrap?.summary?.compliance || {};
  const exportsSummary = state.data?.exports?.summary?.summary || {};
  const exportsData = state.data?.exports || { batches: [], errors: [] };
  return {
    lowStock: Number(kpis.lowStock || 0),
    openRequests: Number(kpis.openRequests || 0),
    offlineBatches: Number(kpis.offlineBatches || 0),
    exportErrors: Number(exportsSummary.openErrors ?? (exportsData.errors || []).length),
    auditCoverage: Number(compliance.auditCoverage || 0),
    exportReady: Number(compliance.exportReady || 0),
    evidenceAttached: Number(compliance.evidenceAttached || 0)
  };
}

function pageLens() {
  const signals = pageSignals();
  const page = state.page;
  const aiRole = {
    'Command Center': 'Command orchestrator that surfaces risks, approvals, and escalation paths.',
    'Inventory Control': 'Inventory analyst that predicts replenishment pressure and shrink signals.',
    'Warehouse Workflows': 'Floor copilot that sequences receive, pick, issue, and transfer work.',
    'Internal Storefront': 'Request intake assistant that drafts clean requests and flags missing context.',
    'Procurement & Purchasing': 'Buying analyst that checks codes, vendor fit, and approval completeness.',
    OfflineOps: 'Offline reconciler that batches worker actions and highlights conflicts before posting.',
    'Worker-Safe Mode': 'Task-only assistant that keeps workers focused on assigned scan actions.',
    'Barcode & Device Hub': 'Device operations helper that keeps label jobs and trusted hardware in sync.',
    'FinanceSync Export Hub': 'Validation copilot that blocks bad exports before finance receives them.',
    'Integration Center': 'Integration control helper that monitors job states and rejects false success claims.',
    'Audit Black Box': 'Evidence auditor that compresses event trails into review-ready summaries.',
    'Compliance Center': 'Control monitor that keeps readiness visible inside the workflow.',
    'Ask OpsTrax AI': 'General operations analyst that explains what to do next and why.',
    Reports: 'Reporting analyst that turns operational state into exportable views.',
    Admin: 'Platform governance assistant that shows access, devices, and trust posture.'
  }[page] || 'Commercial operations copilot for the current module.';

  return {
    mustHave: [
      'Tenant isolation and RBAC enforced server-side',
      'Audit logs for every critical write path',
      'Approval-backed inventory, request, and purchase workflows',
      'Offline review before worker actions post live',
      'Finance export validation before handoff'
    ],
    parity: [
      'Inventory, warehouse, procurement, and internal request modules',
      'Barcode and device operations for scan-driven execution',
      'Document evidence capture linked to records',
      'Compliance and audit views embedded in operations',
      'Admin controls for users, roles, facilities, and devices'
    ],
    bonus: [
      'Risk scoring on low stock, export blockers, and offline queues',
      'Role-aware landing surfaces for supervisor, worker, finance, and admin',
      'Evidence-first compliance posture with searchable operational history',
      'Premium glass UI with restrained motion and dense scanning layout'
    ],
    ai: [
      'Command Center triage and next-best-action ranking',
      'Procurement drafting, code checks, and approval gap detection',
      'Compliance evidence summarization and audit story generation',
      'Warehouse exception summarization and offline conflict prioritization'
    ],
    score: [
      signals.auditCoverage === 100 ? 'Audit coverage is already at full readiness.' : 'Raise audit coverage to 100 percent across write paths.',
      signals.exportErrors > 0 ? `${signals.exportErrors} export blocker(s) still need clearance.` : 'Keep FinanceSync validation clean before every export.',
      signals.lowStock > 0 ? `${signals.lowStock} low-stock item(s) need replenishment attention.` : 'Maintain replenishment discipline before shortages appear.',
      signals.offlineBatches > 0 ? `${signals.offlineBatches} offline batch(es) still need supervisor review.` : 'Keep offline posting gated until review is complete.',
      aiRole
    ]
  };
}

function activeIdentity() {
  return state.identity || state.bootstrap || null;
}

export function personaLabel(roleKey) {
  return (
    {
      admin: 'Platform Owner',
      supervisor: 'Warehouse Supervisor',
      requester: 'Requester',
      worker: 'Warehouse Worker',
      finance: 'Finance Officer'
    }[roleKey] || 'Executive Viewer'
  );
}

function pageFeature(page) {
  return PAGE_FEATURES[page] || '';
}

function pageCapability(page) {
  return PAGE_CAPABILITIES[page] || '';
}

export function pageIsAvailable(page) {
  const identity = activeIdentity();
  if (!identity) return true;
  const feature = pageFeature(page);
  if (feature && !(identity.features || []).includes(feature)) return false;
  const capability = pageCapability(page);
  if (capability && !(identity.capabilities || []).includes(capability)) return false;
  return true;
}

function pageAvailabilityReason(page) {
  const identity = activeIdentity();
  if (!identity) return '';
  const feature = pageFeature(page);
  if (feature && !(identity.features || []).includes(feature)) return `Feature disabled: ${feature}`;
  const capability = pageCapability(page);
  if (capability && !(identity.capabilities || []).includes(capability)) return `Missing capability: ${capability}`;
  return '';
}

export function visibleNavigationGroups() {
  const query = state.search.trim().toLowerCase();
  return PAGE_GROUPS.map((group) => {
    const items = group.items
      .filter((page) => pageIsAvailable(page))
      .filter((page) => {
        const label = PAGE_NAV_LABELS[page] || page;
        return !query || `${label} ${page} ${SECTION_NOTE[page] || ''}`.toLowerCase().includes(query);
      })
      .map((page) => ({
        page,
        title: PAGE_NAV_LABELS[page] || page,
        note: SECTION_NOTE[page] || '',
        active: state.page === page
      }));
    return { title: group.title, items };
  }).filter((group) => group.items.length > 0);
}

function currentSurface() {
  return state.surface || (typeof window !== 'undefined' && window.location.pathname.startsWith('/platform') ? 'platform' : 'tenant');
}

function platformIdentity() {
  return state.platformIdentity || state.platformBootstrap || null;
}

function platformCapabilities() {
  return new Set(platformIdentity()?.capabilities || []);
}

function canPlatform(capability) {
  return platformCapabilities().has('*') || platformCapabilities().has(capability);
}

function platformRoleLabel(roleKey) {
  return (
    {
      PLATFORM_OWNER: 'Platform Owner',
      PLATFORM_ADMIN: 'Platform Admin',
      PLATFORM_SUPPORT: 'Platform Support',
      PLATFORM_BILLING: 'Platform Billing',
      PLATFORM_SECURITY: 'Platform Security',
      PLATFORM_AUDITOR: 'Platform Auditor'
    }[roleKey] || 'Platform Viewer'
  );
}

function platformPageFromPathname(pathname = (typeof window !== 'undefined' ? window.location.pathname : '/platform')) {
  if (!pathname.startsWith('/platform')) return 'Platform Dashboard';
  if (pathname === '/platform' || pathname === '/platform/' || pathname === '/platform/dashboard' || pathname === '/platform/login') return 'Platform Dashboard';
  if (pathname.startsWith('/platform/tenants/')) return 'Tenant Detail';
  if (pathname === '/platform/tenants') return 'Tenant Directory';
  if (pathname === '/platform/subscriptions') return 'Subscription & Plans';
  if (pathname === '/platform/modules') return 'Module Entitlements';
  if (pathname === '/platform/users') return 'User & Seats';
  if (pathname === '/platform/support') return 'Support Sessions';
  if (pathname === '/platform/security') return 'Security & Audit';
  if (pathname === '/platform/health') return 'System Health';
  return 'Platform Dashboard';
}

function platformPathForPage(page, tenantId = state.platformTenantId || '') {
  if (page === 'Tenant Directory') return '/platform/tenants';
  if (page === 'Tenant Detail') return tenantId ? `/platform/tenants/${tenantId}` : '/platform/tenants';
  if (page === 'Subscription & Plans') return '/platform/subscriptions';
  if (page === 'Module Entitlements') return '/platform/modules';
  if (page === 'User & Seats') return '/platform/users';
  if (page === 'Support Sessions') return '/platform/support';
  if (page === 'Security & Audit') return '/platform/security';
  if (page === 'System Health') return '/platform/health';
  return '/platform/dashboard';
}

export function visiblePlatformNavigationGroups() {
  const query = state.search.trim().toLowerCase();
  return PLATFORM_PAGE_GROUPS.map((group) => {
    const items = group.items
      .filter((page) => {
        const label = PLATFORM_PAGE_TITLES[page] || page;
        return !query || `${label} ${page}`.toLowerCase().includes(query);
      })
      .map((page) => ({
        page,
        title: PLATFORM_PAGE_TITLES[page] || page,
        note: '',
        active: state.platformPage === page
      }));
    return { title: group.title, items };
  }).filter((group) => group.items.length > 0);
}

function clampCount(value) {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isNaN(num) ? null : num;
}

function countLabel(value) {
  const num = clampCount(value);
  return num === null ? 'Not configured' : String(num);
}

function countOrZero(value) {
  const num = clampCount(value);
  return num === null ? 0 : num;
}

function primaryFacilityName() {
  return state.bootstrap?.lookups?.facilities?.find((row) => (row.id || '').includes('_facility_main'))?.name
    || state.bootstrap?.lookups?.facilities?.[0]?.name
    || 'Main Distribution Center';
}

function shellSummary() {
  const kpis = state.bootstrap?.summary?.kpis || {};
  const compliance = state.data?.compliance?.summary?.compliance || state.bootstrap?.summary?.compliance || {};
  const procurement = state.data?.procurement?.summary?.summary || {};
  const deviceSummary = state.data?.deviceopsSummary || {};
  const deviceCounts = deviceSummary.devices || {};
  const aiSummary = state.data?.aiSummary || {};
  const exportsData = state.data?.exports || {};
  const exportCandidates = exportsData.candidates || {};
  return {
    workspaceStatus: state.bootstrap?.tenant?.status || 'ACTIVE',
    workspaceEnvironment: 'Operational',
    workspacePlan: 'Enterprise',
    activeModules: (state.identity?.features || []).length,
    facilities: (state.identity?.scopes?.facilityScopes || []).length,
    departments: (state.identity?.scopes?.departmentScopes || []).length,
    activeItems: countOrZero(kpis.activeItems),
    lowStock: countOrZero(kpis.lowStock),
    openRequests: countOrZero(kpis.openRequests),
    purchaseQueue: countOrZero(kpis.purchaseQueue),
    offlineBatches: countOrZero(kpis.offlineBatches),
    validationErrors: countOrZero(kpis.validationErrors),
    auditCoverage: countOrZero(compliance.auditCoverage),
    exportReady: countOrZero(compliance.exportReady),
    evidenceAttached: countOrZero(compliance.evidenceAttached),
    offlineReviewQueue: countOrZero(compliance.offlineReviewQueue),
    receivingExceptions: countOrZero(state.data?.receivingSummary?.summary?.openExceptions || state.data?.receivingSummary?.openExceptions || 0),
    financeExportCandidates: countOrZero((exportCandidates.purchaseOrders || []).length + (exportCandidates.receipts || []).length + (exportCandidates.movements || []).length),
    supplierRiskFlags: countOrZero(procurement.blockedVendors || 0),
    expiringContracts: countOrZero(procurement.expiringContracts || 0),
    budgetPressure: countOrZero(procurement.overBudget || 0),
    waiverCount: countOrZero(procurement.waivers || 0),
    integrationHealth: countOrZero(state.data?.integrations?.summary?.summary?.failedJobs || 0) > 0
      ? 'Needs attention'
      : (countOrZero(state.data?.integrations?.summary?.summary?.jobs || 0) > 0 ? 'Healthy' : 'Not configured'),
    deviceTrusted: countOrZero(deviceCounts.trusted),
    deviceReview: countOrZero(deviceCounts.untrusted) + countOrZero(deviceCounts.suspended) + countOrZero(deviceCounts.revoked),
    aiGovernance: aiSummary.providerStatus || 'SYSTEM_GENERATED'
  };
}

function filteredItems(items, query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return items;
  return items.filter((item) => `${item.title || ''} ${item.detail || ''} ${item.kind || ''}`.toLowerCase().includes(needle));
}

export function buildLandingModel() {
  const summary = shellSummary();
  const data = state.data || {};
  const me = activeIdentity() || {};
  const query = state.search.trim();
  const auditRows = data.audit?.audit || [];
  const documents = data.evidence?.documents || data.documents?.documents || [];
  const evidence = data.evidence?.documents || documents;
  const requests = data.requests?.requests || [];
  const purchases = data.purchaseRequests?.purchaseRequests || [];
  const warehouseTasks = data.warehouse?.tasks?.tasks || [];
  const receivingSessions = data.receiving?.sessions?.sessions || [];
  const batches = data.syncBatches?.syncBatches || [];
  const conflicts = data.conflicts?.conflicts || [];
  const exportsData = data.exports || { batches: [], errors: [], transfers: [] };
  const integrations = data.integrations || { summary: { summary: {} }, jobs: { jobs: [] } };
  const integrationSummary = integrations.summary?.summary || {};
  const integrationJobs = integrations.jobs?.jobs || [];
  const controls = data.compliance?.controls || [];
  const persona = personaLabel(me.user?.role_key || me.role_key || '');

  const queues = [];
  if (me.user?.role_key === 'worker') {
    queues.push(...requests.filter((row) => row.status === 'PICKING' || row.status === 'APPROVED').map((row) => ({
      kind: 'Request',
      title: row.request_no,
      detail: `${row.department_name} · ${row.status}`,
      page: 'Internal Storefront',
      focus: { type: 'request', id: row.id }
    })));
    queues.push(...warehouseTasks.filter((task) => task.assigned_to_user_id === me.user?.id && !['CLOSED', 'CANCELLED'].includes(task.status)).map((task) => ({
      kind: 'Warehouse task',
      title: task.task_no,
      detail: `${task.request_no} · ${task.status}`,
      page: 'Warehouse Workflows',
      focus: { type: 'warehouse-task', id: task.id }
    })));
  } else if (me.user?.role_key === 'finance') {
    queues.push(...purchases.filter((row) => row.status === 'DRAFT' || row.status === 'PENDING_APPROVAL').map((row) => ({
      kind: 'Purchase',
      title: row.pr_no,
      detail: `${row.vendor_name} · ${money(row.total_amount)}`,
      page: 'Procurement & Purchasing',
      focus: { type: 'purchase-request', id: row.id }
    })));
  } else {
    queues.push(...requests.filter((row) => row.status === 'SUBMITTED').map((row) => ({
      kind: 'Request',
      title: row.request_no,
      detail: `${row.department_name} · ${row.purpose}`,
      page: 'Internal Storefront',
      focus: { type: 'request', id: row.id }
    })));
    queues.push(...warehouseTasks.filter((task) => !['CLOSED', 'CANCELLED'].includes(task.status)).map((task) => ({
      kind: 'Warehouse task',
      title: task.task_no,
      detail: `${task.request_no} · ${task.status}`,
      page: 'Warehouse Workflows',
      focus: { type: 'warehouse-task', id: task.id }
    })));
    queues.push(...purchases.filter((row) => row.status === 'DRAFT' || row.status === 'PENDING_APPROVAL').map((row) => ({
      kind: 'Purchase',
      title: row.pr_no,
      detail: `${row.vendor_name} · ${row.status}`,
      page: 'Procurement & Purchasing',
      focus: { type: 'purchase-request', id: row.id }
    })));
  }

  const receivingQueue = filteredItems(receivingSessions.filter((session) => ['DRAFT', 'IN_PROGRESS'].includes(session.status)).map((session) => ({
    kind: 'Receiving',
    title: session.id,
    detail: `${session.po_no || session.purchase_order_id} · ${session.status}`,
    page: 'Receiving Center',
    focus: { type: 'receive-session', id: session.id }
  })), query);
  queues.push(...receivingQueue);

  const exceptions = [
    ...filteredItems((data.items?.items || []).filter((item) => Number(item.low_stock) === 1).map((item) => ({
      kind: 'Inventory',
      title: item.name,
      detail: `${item.on_hand} on hand · min ${item.min_qty}`,
      page: 'Inventory Control',
      focus: { type: 'item', id: item.id }
    })), query),
    ...filteredItems((data.exports?.errors || []).map((error) => ({
      kind: error.severity || 'Export',
      title: error.code,
      detail: error.message,
      page: 'FinanceSync Export Hub',
      focus: { type: 'export-error', id: error.code }
    })), query),
    ...filteredItems(conflicts.map((row) => ({
      kind: 'Offline',
      title: row.conflict_type,
      detail: `${row.batch_no} · ${row.severity}`,
      page: 'OfflineOps',
      focus: { type: 'sync-conflict', id: row.id }
    })), query),
    ...filteredItems(warehouseTasks.filter((task) => task.status === 'EXCEPTION' || (task.exception_reason || '').trim()).map((task) => ({
      kind: 'Warehouse',
      title: task.task_no,
      detail: `${task.request_no} · ${task.exception_reason || task.status}`,
      page: 'Warehouse Workflows',
      focus: { type: 'warehouse-task', id: task.id }
    })), query)
  ];

  const approvals = filteredItems([
    ...requests.filter((row) => row.status === 'SUBMITTED').map((row) => ({
      kind: 'Request approval',
      title: row.request_no,
      detail: `${row.department_name} · ${row.priority}`,
      page: 'Internal Storefront',
      focus: { type: 'request', id: row.id }
    })),
    ...purchases.filter((row) => row.status === 'DRAFT' || row.status === 'PENDING_APPROVAL').map((row) => ({
      kind: 'Purchase approval',
      title: row.pr_no,
      detail: `${row.vendor_name} · ${money(row.total_amount)}`,
      page: 'Procurement & Purchasing',
      focus: { type: 'purchase-request', id: row.id }
    }))
  ], query);

  const posture = filteredItems([
    { kind: 'OfflineOps', title: 'Review queue', detail: batches.filter((batch) => batch.review_status === 'PENDING').length > 0 ? `${batches.filter((batch) => batch.review_status === 'PENDING').length} batch(es) waiting` : 'Clear', page: 'OfflineOps', focus: { type: 'offline-summary', id: 'current' } },
    { kind: 'Audit', title: 'Audit coverage', detail: countLabel(summary.auditCoverage) === 'Not configured' ? 'Not configured' : `${summary.auditCoverage}% of critical writes covered`, page: 'Audit Black Box', focus: { type: 'audit-summary', id: 'current' } },
    { kind: 'Evidence', title: 'Documents linked', detail: countLabel(summary.evidenceAttached) === 'Not configured' ? 'Not configured' : `${summary.evidenceAttached}% evidence attached`, page: 'Documents & Evidence Vault', focus: { type: 'evidence-summary', id: 'current' } },
    { kind: 'Receiving', title: 'Open sessions', detail: receivingSessions.length ? `${receivingSessions.filter((session) => ['DRAFT', 'IN_PROGRESS'].includes(session.status)).length} open` : 'No sessions loaded', page: 'Receiving Center', focus: { type: 'receiving-summary', id: 'current' } },
    { kind: 'Compliance', title: 'Control readiness', detail: controls.length ? `${controls.length} control checks loaded` : 'Not configured', page: 'Compliance Center', focus: { type: 'compliance-summary', id: 'current' } },
    { kind: 'Integration', title: 'ERP queue', detail: integrationJobs.length ? `${integrationSummary.queuedJobs || 0} queued · ${integrationSummary.failedJobs || 0} failed` : 'No integration jobs loaded', page: 'Integration Center', focus: { type: 'integration-summary', id: 'current' } }
  ], query);

  const exportReadiness = filteredItems([
    { kind: 'Export', title: 'FinanceSync posture', detail: countLabel(summary.exportReady) === 'Not configured' ? 'Not configured' : `${summary.exportReady}% ready`, page: 'FinanceSync Export Hub', focus: { type: 'export-summary', id: 'current' } },
    { kind: 'Compliance', title: 'Control registry', detail: controls.length ? `${controls.length} active control(s)` : 'Not configured', page: 'Compliance Center', focus: { type: 'compliance-control', id: controls[0]?.key || 'current' } }
  ], query);

  const recent = filteredItems((auditRows || []).slice(0, 8).map((row) => ({
    kind: row.action,
    title: row.entity_id || row.entity_type || row.action,
    detail: `${row.summary} · ${fmt(row.created_at)}`,
    page: 'Audit Black Box',
    focus: { type: 'audit', id: row.id }
  })), query);

  const aiHints = [
    persona === 'Warehouse Worker'
      ? 'AI help is read-only and governed. It can explain what to do next, but it cannot post changes.'
      : `AI help is read-only for ${persona}. No execution is enabled yet.`,
    summary.lowStock > 0 ? `${summary.lowStock} low-stock item(s) deserve replenishment attention.` : 'Inventory is currently within the tracked threshold set.',
    summary.offlineBatches > 0 ? `${summary.offlineBatches} offline batch(es) still require review.` : 'Offline review queue is clear.',
    summary.validationErrors > 0 ? `${summary.validationErrors} export validation issue(s) are blocking handoff.` : 'FinanceSync validation is currently clean.'
  ].filter(Boolean);

  return {
    persona,
    summary,
    queues: filteredItems(queues, query),
    exceptions,
    approvals,
    posture,
    exportReadiness,
    recent,
    aiHints
  };
}

export function buildDrawerModel() {
  const data = state.data || {};
  const identity = activeIdentity() || {};
  const focus = state.drawerFocus || { type: 'tenant', id: 'current' };
  const auditRows = data.audit?.audit || [];
  const documents = data.documents?.documents || [];
  const inventory = data.inventory || {};
  const inventoryItems = inventory.items?.items || data.items?.items || [];
  const inventoryCategories = inventory.categories?.categories || [];
  const inventoryBalances = inventory.balances?.balances || [];
  const inventoryMovements = inventory.movements?.movements || [];
  const inventoryAdjustments = inventory.adjustments?.adjustments || [];
  const inventoryBins = inventory.bins?.bins || [];
  const warehouse = data.warehouse || {};
  const warehouseTasks = warehouse.tasks?.tasks || [];
  const warehouseIssueReadyRequests = warehouse.issueReadyRequests?.requests || [];
  const warehouseBins = warehouse.bins?.bins || [];
  const warehouseSummary = warehouse.summary?.summary || {};
  const evidenceDetail = focus.type === 'evidence' ? state.evidenceDetails?.[focus.id] || null : null;
  const receiving = data.receiving || {};
  const receivingPurchaseOrders = receiving.purchaseOrders?.purchaseOrders || [];
  const receivingSessions = receiving.sessions?.sessions || [];
  const receivingMovements = receiving.movements?.movements || [];
  const receivingDetail = focus.type === 'receive-session' ? state.receivingDetails?.[focus.id] || null : null;
  const exportsData = data.exports || {};
  const exportSummary = exportsData.summary?.summary || {};
  const exportBatches = exportsData.batches?.batches || [];
  const exportCandidates = exportsData.candidates || { purchaseOrders: [], receipts: [], movements: [] };
  const exportErrors = exportsData.errors || [];
  const exportTransfers = exportsData.transfers || [];
  const exportConnections = exportsData.connections || [];
  const exportJobs = exportsData.jobs || [];
  const exportBatchDetail = focus.type === 'export-batch' ? state.exportDetails?.[`export-batch:${focus.id}`] || null : null;
  const exportConnectionDetail = focus.type === 'integration-connection' ? state.integrationDetails?.[`integration-connection:${focus.id}`] || null : null;
  const exportJobDetail = focus.type === 'integration-job' ? state.integrationDetails?.[`integration-job:${focus.id}`] || null : null;
  const reportDetail = focus.type === 'report-run' ? state.reportDetails?.[focus.id] || null : null;
  const integrationSummary = data.integrations?.summary?.summary || {};
  const integrationConnections = data.integrations?.connections?.connections || [];
  const integrationJobs = data.integrations?.jobs?.jobs || [];
  const requests = data.requests?.requests || [];
  const procurement = data.procurement || {};
  const vendors = procurement.vendors?.vendors || [];
  const purchaseRequests = procurement.purchaseRequests?.purchaseRequests || data.purchaseRequests?.purchaseRequests || [];
  const purchaseOrders = procurement.purchaseOrders?.purchaseOrders || data.purchaseOrders?.purchaseOrders || [];
  const procurementSummary = procurement.summary?.summary || {};
  const procurementVendorDetail = focus.type === 'vendor' ? state.procurementDetails?.[`vendor:${focus.id}`] || null : null;
  const procurementRequestDetail = focus.type === 'purchase-request' ? state.procurementDetails?.[`purchase-request:${focus.id}`] || null : null;
  const procurementOrderDetail = focus.type === 'purchase-order' ? state.procurementDetails?.[`purchase-order:${focus.id}`] || null : null;
  const procurementContractDetail = focus.type === 'supplier-contract' ? state.procurementDetails?.[`supplier-contract:${focus.id}`] || null : null;
  const procurementBudgetDetail = focus.type === 'department-budget' ? state.procurementDetails?.[`department-budget:${focus.id}`] || null : null;
  const procurementWaiverDetail = focus.type === 'procurement-waiver' ? state.procurementDetails?.[`procurement-waiver:${focus.id}`] || null : null;
  const procureToPay = data.procureToPay || {};
  const vendorInvoices = procureToPay.vendorInvoices?.vendorInvoices || [];
  const rfqRequests = procureToPay.rfqRequests?.rfqRequests || [];
  const vendorQuotes = procureToPay.vendorQuotes?.vendorQuotes || [];
  const vendorScorecards = procureToPay.vendorScorecards?.vendorScorecards || [];
  const p2pInvoiceDetail = focus.type === 'vendor-invoice' ? state.p2pDetails?.[`vendor-invoice:${focus.id}`] || null : null;
  const p2pRfqDetail = focus.type === 'rfq-request' ? state.p2pDetails?.[`rfq-request:${focus.id}`] || null : null;
  const p2pQuoteDetail = focus.type === 'vendor-quote' ? state.p2pDetails?.[`vendor-quote:${focus.id}`] || null : null;
  const p2pInvoiceLines = focus.type === 'vendor-invoice' ? p2pInvoiceDetail?.lines || [] : [];
  const p2pInvoiceExceptions = focus.type === 'vendor-invoice' ? p2pInvoiceDetail?.exceptions || [] : [];
  const p2pInvoiceExtractionRuns = focus.type === 'vendor-invoice' ? p2pInvoiceDetail?.extractionRuns || [] : [];
  const p2pInvoiceMatchResults = focus.type === 'vendor-invoice' ? p2pInvoiceDetail?.matchResults || [] : [];
  const p2pInvoiceApprovalEvents = focus.type === 'vendor-invoice' ? p2pInvoiceDetail?.approvalEvents || [] : [];
  const batches = data.syncBatches?.syncBatches || [];
  const conflicts = data.conflicts?.conflicts || [];
  const requestDetail = focus.type === 'request' ? state.requestDetails?.[focus.id] || null : null;
  const warehouseTaskDetail = focus.type === 'warehouse-task' ? state.warehouseTaskDetails?.[focus.id] || null : null;
  const departmentNameById = new Map((state.bootstrap?.lookups?.departments || []).map((dept) => [dept.id, dept.name]));
  const facilityNameById = new Map((state.bootstrap?.lookups?.facilities || []).map((facility) => [facility.id, facility.name]));
  const tabs = ['Details', 'Actions', 'Evidence', 'Receiving', 'Audit trail', 'AI help'];

  let detailTitle = 'Tenant context';
  let detailLines = [
    `Workspace: ${state.bootstrap?.tenant?.name || 'Not available'}`,
    `Role: ${personaLabel(identity.user?.role_key || identity.role_key || '')}`,
    `Facility scopes: ${(identity.scopes?.facilityScopes || []).length || 0}`,
    `Department scopes: ${(identity.scopes?.departmentScopes || []).length || 0}`
  ];

  if (focus.type === 'request') {
    const row = requestDetail?.request || requests.find((item) => item.id === focus.id);
    const lines = requestDetail?.lines || [];
    detailTitle = row ? row.request_no : 'Request';
    detailLines = row ? [
      `Purpose: ${row.purpose}`,
      `Reason: ${row.reason || row.purpose}`,
      `Department: ${row.department_name}`,
      `Status: ${row.status}`,
      `Requested by: ${row.requester_name}`,
      `Priority: ${row.priority}`,
      `Submitted: ${row.submitted_at || 'Not submitted'}`,
      `Cancelled: ${row.canceled_at ? `${fmt(row.canceled_at)}${row.cancel_reason ? ` · ${row.cancel_reason}` : ''}` : 'No'}`,
      `Rejected: ${row.rejected_at ? `${fmt(row.rejected_at)}${row.rejection_reason ? ` · ${row.rejection_reason}` : ''}` : 'No'}`,
      `Lines: ${lines.length || row.line_count || 0}`
    ] : ['No request details found for the current tenant.'];
  } else if (focus.type === 'purchase-request') {
    const row = procurementRequestDetail?.purchaseRequest || purchaseRequests.find((item) => item.id === focus.id);
    const lines = procurementRequestDetail?.lines || [];
    detailTitle = row ? row.pr_no : 'Purchase request';
    detailLines = row ? [
      `Vendor: ${procurementRequestDetail?.vendor?.name || row.vendor_name || row.vendor_id}`,
      `Status: ${row.status}`,
      `Amount: ${money(row.total_amount)}`,
      `Accounting code: ${row.accounting_code || 'Missing'}`,
      `Department: ${departmentNameById.get(row.department_id) || row.department_id}`,
      `Facility: ${facilityNameById.get(row.facility_id) || row.facility_id}`,
      `Submitted: ${row.submitted_at || 'Not submitted'}`,
      `Approved: ${row.approved_at || 'Not approved'}`,
      `Lines: ${lines.length || row.line_count || 0}`
    ] : ['No purchase request details found for the current tenant.'];
  } else if (focus.type === 'purchase-order') {
    const row = procurementOrderDetail?.purchaseOrder || purchaseOrders.find((item) => item.id === focus.id);
    const lines = procurementOrderDetail?.lines || [];
    detailTitle = row ? row.po_no : 'Purchase order';
    detailLines = row ? [
      `Vendor: ${procurementOrderDetail?.vendor?.name || row.vendor_name || row.vendor_id}`,
      `Status: ${row.status}`,
      `Request: ${row.source_purchase_request_id || 'Not linked'}`,
      `Cost center: ${procurementOrderDetail?.costCenter?.name || procurementOrderDetail?.costCenter?.code || row.cost_center_id || 'Not linked'}`,
      `Budget: ${procurementOrderDetail?.budget ? money(procurementOrderDetail.budget.availableAmount) + ' available' : 'Not configured'}`,
      `Contract: ${procurementOrderDetail?.contractSignals?.status || 'Not evaluated'}`,
      `Department: ${departmentNameById.get(row.department_id) || row.department_id}`,
      `Facility: ${facilityNameById.get(row.facility_id) || row.facility_id}`,
      `Approved: ${row.approved_at || 'Not approved'}`,
      `Issued: ${row.issued_at || 'Not issued'}`,
      `Lines: ${lines.length || row.line_count || 0}`,
      `Notes: ${row.notes || 'None'}`
    ] : ['No purchase request details found for the current tenant.'];
  } else if (focus.type === 'supplier-contract') {
    const row = procurementContractDetail?.contract || null;
    detailTitle = row ? row.contract_no : 'Supplier contract';
    detailLines = row ? [
      `Vendor: ${procurementContractDetail?.vendor?.name || row.vendor_name || row.vendor_id}`,
      `Status: ${row.status}`,
      `Contract posture: ${row.contract_status || row.status}`,
      `Renewal posture: ${row.renewal_status || row.renewal_alert_status || 'UNKNOWN'}`,
      `Effective: ${row.effective_date}`,
      `Expiry: ${row.expiry_date}`,
      `Item/category: ${row.item_name || row.item_category || 'General'}`,
      `Pricing reference: ${row.pricing_reference || 'Not set'}`,
      `Evidence: ${procurementContractDetail?.sourceEvidence?.length || 0} linked record(s)`
    ] : ['No supplier contract details found for the current tenant.'];
  } else if (focus.type === 'department-budget') {
    const row = procurementBudgetDetail?.budget || null;
    detailTitle = row ? `${row.department_code || ''} budget`.trim() : 'Budget control';
    detailLines = row ? [
      `Department: ${row.department_name || row.department_id}`,
      `Cost center: ${row.cost_center_name || row.cost_center_code || row.cost_center_id}`,
      `Fiscal year: ${row.fiscal_year}`,
      `Budget amount: ${money(row.budget_amount)}`,
      `Reserved: ${money(row.reservedAmount)}`,
      `Consumed: ${money(row.consumedAmount)}`,
      `Available: ${money(row.availableAmount)}`,
      `Utilization: ${Number(row.utilizationPct || 0).toFixed(1)}%`,
      `Threshold: ${Number((row.alert_threshold_pct || 0) * 100).toFixed(0)}%`
    ] : ['No budget details found for the current tenant.'];
  } else if (focus.type === 'procurement-waiver') {
    const row = procurementWaiverDetail || null;
    detailTitle = row ? `${row.waiver_type}` : 'Procurement waiver';
    detailLines = row ? [
      `Entity: ${row.entity_type}:${row.entity_id}`,
      `Status: ${row.status}`,
      `Reason: ${row.reason}`,
      `Expires: ${row.expires_at || 'No expiry'}`,
      `Approved: ${row.approved_at || 'Not recorded'}`
    ] : ['No procurement waiver details found for the current tenant.'];
  } else if (focus.type === 'vendor-invoice') {
    const row = p2pInvoiceDetail?.vendorInvoice || vendorInvoices.find((item) => item.id === focus.id);
    const lines = p2pInvoiceDetail?.lines || [];
    detailTitle = row ? row.invoice_number : 'Vendor invoice';
    detailLines = row ? [
      `Vendor: ${p2pInvoiceDetail?.vendor?.name || row.vendor_name || row.vendor_id}`,
      `Status: ${row.status}`,
      `Purchase order: ${p2pInvoiceDetail?.purchaseOrder?.po_no || row.purchase_order_id || 'Not linked'}`,
      `Receiving session: ${p2pInvoiceDetail?.receivingSession?.id || row.receiving_session_id || 'Not linked'}`,
      `Extraction: ${row.extraction_status} · ${row.extraction_provider}`,
      `Extraction confidence: ${Number(row.extraction_confidence || 0).toFixed(2)}`,
      `Match: ${row.match_status} · ${row.match_mode}`,
      `Match confidence: ${Number(row.match_confidence || 0).toFixed(2)}`,
      `Export delivery: ${row.export_delivery_status || 'NOT_REQUESTED'}`,
      `Amount: ${money(row.total_amount)}`,
      `Lines: ${lines.length}`,
      `Exceptions: ${p2pInvoiceExceptions.length}`,
      `Approvals: ${(p2pInvoiceDetail?.approvalEvents || []).length}`
    ] : ['No invoice details found for the current tenant.'];
  } else if (focus.type === 'rfq-request') {
    const row = p2pRfqDetail?.rfqRequest || rfqRequests.find((item) => item.id === focus.id);
    const lines = p2pRfqDetail?.lines || [];
    detailTitle = row ? row.rfq_no : 'RFQ request';
    detailLines = row ? [
      `Subject: ${row.subject}`,
      `Status: ${row.status}`,
      `Department: ${departmentNameById.get(row.department_id) || row.department_id}`,
      `Facility: ${facilityNameById.get(row.facility_id) || row.facility_id}`,
      `Requested by: ${row.requester_name || row.requested_by_user_id}`,
      `Due: ${row.due_at || 'Not set'}`,
      `Awarded quote: ${row.awarded_quote_id || 'Not awarded'}`,
      `Lines: ${lines.length}`,
      `Quotes: ${(p2pRfqDetail?.quotes || []).length}`
    ] : ['No RFQ details found for the current tenant.'];
  } else if (focus.type === 'vendor-quote') {
    const row = p2pQuoteDetail?.vendorQuote || vendorQuotes.find((item) => item.id === focus.id);
    const lines = p2pQuoteDetail?.lines || [];
    detailTitle = row ? row.quote_no : 'Vendor quote';
    detailLines = row ? [
      `Vendor: ${p2pQuoteDetail?.vendor?.name || row.vendor_name || row.vendor_id}`,
      `RFQ: ${p2pQuoteDetail?.rfqRequest?.rfq_no || row.rfq_request_id}`,
      `Status: ${row.status}`,
      `Subtotal: ${money(row.subtotal_amount)}`,
      `Total: ${money(row.total_amount)}`,
      `Submitted: ${row.submitted_at || 'Not submitted'}`,
      `Awarded: ${row.awarded_at || 'Not awarded'}`,
      `Lines: ${lines.length}`
    ] : ['No quote details found for the current tenant.'];
  } else if (focus.type === 'vendor-scorecard') {
    const row = vendorScorecards.find((item) => item.id === focus.id);
    detailTitle = row ? `${row.vendor_name || row.vendor_id} scorecard` : 'Vendor scorecard';
    detailLines = row ? [
      `Score date: ${row.score_date}`,
      `Risk score: ${row.risk_score}`,
      `On-time delivery: ${row.on_time_delivery_rate}%`,
      `Invoice match: ${row.invoice_match_rate}%`,
      `RFQ win rate: ${row.rfq_win_rate}%`,
      `Quality: ${row.quality_rate}%`,
      `Open exceptions: ${row.open_exceptions}`,
      `Spend 90d: ${money(row.spend_90d)}`
    ] : ['No vendor scorecard found for the current tenant.'];
  } else if (focus.type === 'vendor') {
    const row = procurementVendorDetail?.vendor || vendors.find((item) => item.id === focus.id);
    const scoreRows = procurementVendorDetail?.scoreRows || [];
    detailTitle = row ? row.name : 'Vendor';
    detailLines = row ? [
      `Code: ${row.code}`,
      `Status: ${row.status}`,
      `Risk score: ${row.risk_score}`,
      `Average score: ${procurementVendorDetail?.averageScore ?? 0}`,
      `Contact: ${row.contact_name || 'Not set'}`,
      `Email: ${row.email || 'Not set'}`,
      `Phone: ${row.phone || 'Not set'}`,
      `Score records: ${scoreRows.length}`,
      `Requests: ${procurementVendorDetail?.purchaseRequests?.length || 0}`,
      `Orders: ${procurementVendorDetail?.purchaseOrders?.length || 0}`
    ] : ['No vendor details found for the current tenant.'];
  } else if (focus.type === 'sync-conflict') {
    const row = conflicts.find((item) => item.id === focus.id);
    detailTitle = row ? row.conflict_type : 'Sync conflict';
    detailLines = row ? [
      `Batch: ${row.batch_no}`,
      `Severity: ${row.severity}`,
      `Status: ${row.status}`,
      `Description: ${row.description}`
    ] : ['No sync conflict details found for the current tenant.'];
  } else if (focus.type === 'audit') {
    const row = auditRows.find((item) => item.id === focus.id);
    detailTitle = row ? row.action : 'Audit record';
    detailLines = row ? [
      `Summary: ${row.summary}`,
      `Actor: ${row.actor_name}`,
      `When: ${fmt(row.created_at)}`,
      `Request id: ${row.request_id || 'Not recorded'}`
    ] : ['No audit entry found for the current tenant.'];
  } else if (focus.type === 'compliance-control') {
    detailTitle = 'Compliance control';
    detailLines = ['Loaded control registry is view only.', 'No compliance mutation actions are enabled yet.'];
  } else if (focus.type === 'audit-summary') {
    detailTitle = 'Audit posture';
    detailLines = [auditRows.length ? `${auditRows.length} audit event(s) loaded.` : 'No audit events loaded yet.'];
  } else if (focus.type === 'evidence-summary') {
    detailTitle = 'Evidence posture';
    detailLines = [documents.length ? `${documents.length} linked document(s)` : 'No evidence uploaded yet.'];
  } else if (focus.type === 'receiving-summary') {
    detailTitle = 'Receiving posture';
    detailLines = [receivingSessions.length ? `${receivingSessions.length} receive session(s) loaded.` : 'No receiving sessions loaded yet.'];
  } else if (focus.type === 'offline-summary') {
    detailTitle = 'Offline posture';
    detailLines = [batches.length ? `${batches.length} batch(es) in view` : 'No offline batches loaded.'];
  } else if (focus.type === 'inventory-item') {
    const row = inventoryItems.find((item) => item.id === focus.id);
    detailTitle = row ? row.name : 'Inventory item';
    detailLines = row ? [
      `SKU: ${row.sku}`,
      `Category: ${row.category}`,
      `Status: ${row.status}`,
      `Controlled: ${Number(row.controlled) === 1 ? 'Yes' : 'No'}`,
      `On hand: ${row.on_hand} · Available: ${row.available}`,
      `Thresholds: min ${row.min_stock} / max ${row.max_stock} / reorder ${row.reorder_point}`,
      `Lot / serial / expiry: ${Number(row.lot_required) === 1 ? 'Lot required' : 'Lot optional'} · ${Number(row.serial_required) === 1 ? 'Serial required' : 'Serial optional'} · ${Number(row.expiry_required) === 1 ? 'Expiry tracked' : 'No expiry tracking'}`
    ] : ['No inventory item found for the current tenant.'];
  } else if (focus.type === 'inventory-adjustment') {
    const row = inventoryAdjustments.find((item) => item.id === focus.id);
    detailTitle = row ? `Adjustment ${row.id}` : 'Stock adjustment';
    detailLines = row ? [
      `Item: ${row.item_name || row.item_id}`,
      `Reason: ${row.reason}`,
      `Delta: ${row.quantity_delta > 0 ? '+' : ''}${row.quantity_delta}`,
      `Status: ${row.status}`,
      `Before / after: ${row.before_quantity} → ${row.after_quantity}`,
      `Evidence: ${row.evidence_document_id || 'Not linked'}`
    ] : ['No stock adjustment found for the current tenant.'];
  } else if (focus.type === 'inventory-movement') {
    const row = inventoryMovements.find((item) => item.id === focus.id);
    detailTitle = row ? `${row.movement_type} movement` : 'Stock movement';
    detailLines = row ? [
      `Item: ${row.item_name || row.item_id}`,
      `Bin: ${row.bin_code || 'Unassigned'}`,
      `Quantity: ${row.quantity > 0 ? '+' : ''}${row.quantity}`,
      `Before / after: ${row.before_quantity} → ${row.after_quantity}`,
      `Reference: ${row.reference_type} ${row.reference_id}`,
      `Actor: ${row.actor_name}`
    ] : ['No stock movement found for the current tenant.'];
  } else if (focus.type === 'inventory-category') {
    const row = inventoryCategories.find((item) => item.id === focus.id);
    detailTitle = row ? row.name : 'Item category';
    detailLines = row ? [
      `Code: ${row.code}`,
      `Items: ${row.item_count}`,
      `Restricted items: ${row.restricted_item_count === null ? 'Hidden by role' : row.restricted_item_count}`,
      `Status: ${row.active ? 'Active' : 'Inactive'}`
    ] : ['No category found for the current tenant.'];
  } else if (focus.type === 'inventory-bin') {
    const row = inventoryBins.find((item) => item.id === focus.id);
    detailTitle = row ? row.code : 'Bin';
    detailLines = row ? [
      `Facility: ${row.facility_name}`,
      `Zone / shelf: ${row.zone} / ${row.shelf}`,
      `Stocked items: ${row.stocked_item_count}`,
      `On hand: ${row.on_hand}`,
      `Available: ${row.available}`
    ] : ['No bin found for the current tenant.'];
  } else if (focus.type === 'warehouse-task') {
    const row = warehouseTaskDetail?.task || warehouseTasks.find((item) => item.id === focus.id);
    const lines = warehouseTaskDetail?.lines || [];
    detailTitle = row ? row.task_no : 'Warehouse task';
    detailLines = row ? [
      `Request: ${row.request_no}`,
      `Task type: ${row.task_type}`,
      `Status: ${row.status}`,
      `Department: ${row.department_name}`,
      `Facility: ${row.facility_name}`,
      `Assignee: ${row.assignee_name || 'Unassigned'}`,
      `Priority: ${row.priority}`,
      `Started: ${row.started_at || 'Not started'}`,
      `Picked / issued: ${row.picked_quantity || 0} / ${row.issued_quantity || 0}`,
      `Shortage: ${row.short_quantity || 0}`,
      `Lines: ${lines.length || row.line_count || 0}`
    ] : ['No warehouse task details found for the current tenant.'];
  } else if (focus.type === 'evidence') {
    const row = evidenceDetail?.evidence || documents.find((item) => item.id === focus.id);
    const links = evidenceDetail?.links || [];
    detailTitle = row ? row.file_name : 'Evidence';
    detailLines = row ? [
      `Entity: ${row.entity_type} · ${row.entity_id}`,
      `Type: ${row.doc_type}`,
      `Visibility: ${row.visibility}`,
      `State: ${row.evidence_state}`,
      `Uploaded by: ${row.uploaded_by_name || row.uploaded_by_user_id || 'Unknown'}`,
      `Linked records: ${links.length}`,
      `Checksum: ${row.checksum || 'Not recorded'}`
    ] : ['No evidence record found for the current tenant.'];
  } else if (focus.type === 'receive-session') {
    const row = receivingDetail?.session || receivingSessions.find((item) => item.id === focus.id);
    const lines = receivingDetail?.lines || [];
    detailTitle = row ? (receivingDetail?.purchaseOrder?.po_no || row.purchase_order_id) : 'Receive session';
    detailLines = row ? [
      `Purchase order: ${receivingDetail?.purchaseOrder?.po_no || row.purchase_order_id}`,
      `Vendor: ${receivingDetail?.vendor?.name || row.vendor_id || 'Unknown'}`,
      `Status: ${row.status}`,
      `Facility: ${row.facility_id}`,
      `Started: ${row.started_at || 'Not started'}`,
      `Posted: ${row.posted_at || 'Not posted'}`,
      `Cancelled: ${row.cancelled_at || 'No'}`,
      `Lines: ${lines.length}`,
      `Movements: ${receivingDetail?.movements?.length || 0}`
    ] : ['No receive session found for the current tenant.'];
  } else if (focus.type === 'export-batch') {
    const row = exportBatchDetail?.batch || exportBatches.find((item) => item.id === focus.id);
    const errors = exportBatchDetail?.errors || [];
    detailTitle = row ? row.batch_no : 'Export batch';
    detailLines = row ? [
      `Status: ${row.status}`,
      `Format: ${row.format}`,
      `Records: ${row.record_count}`,
      `Validation errors: ${row.validation_error_count || errors.length || 0}`,
      `Selection: ${row.date_from || 'Any'} → ${row.date_to || 'Any'}`,
      `Facility: ${row.facility_name || row.facility_id || 'Any'}`,
      `Department: ${row.department_name || row.department_id || 'Any'}`,
      `Generated: ${row.generated_at || 'Not generated'}`,
      `Dispatched: ${row.dispatched_at || 'Not dispatched'}`,
      `Payload hash: ${row.generated_payload_hash || 'Not generated'}`
    ] : ['No export batch found for the current tenant.'];
  } else if (focus.type === 'export-error') {
    const row = exportErrors.find((item) => item.id === focus.id);
    detailTitle = row ? row.code : 'Export validation error';
    detailLines = row ? [
      `Severity: ${row.severity}`,
      `Message: ${row.message}`,
      `Entity: ${row.entity_type} · ${row.entity_id}`,
      `Status: ${row.status}`,
      `Resolved: ${row.resolved_at || 'Open'}`
    ] : ['No export validation error found for the current tenant.'];
  } else if (focus.type === 'integration-connection') {
    const row = exportConnectionDetail?.connection || integrationConnections.find((item) => item.id === focus.id);
    detailTitle = row ? row.provider_name : 'Integration connection';
    detailLines = row ? [
      `Connection type: ${row.connection_type}`,
      `Status: ${row.status}`,
      `Auth mode: ${row.auth_mode}`,
      `Endpoint: ${row.endpoint_label}`,
      `Last tested: ${row.last_tested_at || 'Not tested'}`,
      `Last success: ${row.last_success_at || 'Not recorded'}`,
      `Has secret: ${row.has_secret ? 'Yes' : 'No'}`,
      `Last error: ${row.last_error || 'None'}`
    ] : ['No integration connection found for the current tenant.'];
  } else if (focus.type === 'integration-job') {
    const row = exportJobDetail?.job || integrationJobs.find((item) => item.id === focus.id);
    detailTitle = row ? `${row.job_type} job` : 'Integration job';
    detailLines = row ? [
      `Integration: ${row.provider_name || row.integration_key}`,
      `Status: ${row.status}`,
      `Attempt count: ${row.attempt_count}`,
      `Retry count: ${row.retry_count}`,
      `Batch: ${row.batch_no || row.export_batch_id || 'Unlinked'}`,
      `Connection: ${row.endpoint_label || row.connection_id || 'Unlinked'}`,
      `Queued: ${row.queued_at || 'Not queued'}`,
      `Started: ${row.started_at || 'Not started'}`,
      `Finished: ${row.finished_at || 'Not finished'}`,
      `Last error: ${row.last_error || 'None'}`
    ] : ['No integration job found for the current tenant.'];
  } else if (focus.type === 'report-run') {
    const row = reportDetail?.run || null;
    detailTitle = row ? row.report_title : 'Report run';
    detailLines = row ? [
      `Report key: ${row.report_key}`,
      `Category: ${row.report_category}`,
      `Module page: ${row.module_page}`,
      `Surface: ${row.surface}`,
      `Format: ${row.format}`,
      `Status: ${row.status}`,
      `Rows: ${row.row_count}`,
      `Filters: ${row.filters_json || '{}'}`,
      `Started: ${row.started_at || 'Not started'}`,
      `Completed: ${row.completed_at || 'Not completed'}`,
      `Cancelled: ${row.cancelled_at || 'No'}`,
      `Output: ${row.output_file_name || 'Not generated'}`,
      `Exports: ${(reportDetail?.exports || []).length}`,
      `Audit events: ${(reportDetail?.audit || []).length}`
    ] : ['No report run found for the current workspace.'];
  } else if (focus.type === 'export-summary') {
    detailTitle = 'FinanceSync readiness';
    detailLines = [
      `Readiness: ${exportSummary.readiness ?? 'Unknown'}`,
      `Open validation errors: ${exportSummary.openErrors ?? 0}`,
      `Exportable POs: ${exportSummary.exportableOrders ?? 0}`,
      `Posted receipts: ${exportSummary.exportableReceipts ?? 0}`,
      `Connections: ${integrationSummary.connections ?? 0}`,
      `Queued jobs: ${integrationSummary.queuedJobs ?? 0}`
    ];
  } else if (focus.type === 'integration-summary') {
    detailTitle = 'Integration posture';
    detailLines = [
      `Connections: ${integrationSummary.connections ?? 0}`,
      `Configured: ${integrationSummary.configured ?? 0}`,
      `Sandbox: ${integrationSummary.sandboxOnly ?? 0}`,
      `Jobs: ${integrationSummary.jobs ?? 0}`,
      `Queued: ${integrationSummary.queuedJobs ?? 0}`,
      `Failed: ${integrationSummary.failedJobs ?? 0}`
    ];
  }

  return {
    tabs,
    focus,
    detailTitle,
    detailLines,
    documents,
    auditRows,
    inventoryItems,
    inventoryCategories,
    inventoryBalances,
    inventoryMovements,
    inventoryAdjustments,
    inventoryBins,
    warehouseTasks,
    warehouseIssueReadyRequests,
    warehouseBins,
    warehouseSummary,
    warehouseTaskDetail,
    evidenceDetail,
    receivingPurchaseOrders,
    receivingSessions,
    receivingMovements,
    receivingDetail,
    exportSummary,
    exportBatches,
    exportCandidates,
    exportErrors,
    exportTransfers,
    exportConnections,
    exportJobs,
    exportBatchDetail,
    exportConnectionDetail,
    exportJobDetail,
    reportDetail,
    integrationSummary,
    integrationConnections,
    integrationJobs,
    identity,
    requests,
    requestDetail,
    vendors,
    purchaseRequests,
    purchaseOrders,
    procureToPay,
    vendorInvoices,
    rfqRequests,
    vendorQuotes,
    vendorScorecards,
    p2pInvoiceDetail,
    p2pRfqDetail,
    p2pQuoteDetail,
    procurementSummary,
    procurementVendorDetail,
    procurementRequestDetail,
    procurementOrderDetail,
    batches
  };
}

export function shellSkeleton() {
  return `
    <section class="panel shell-skeleton">
      <div class="skeleton-line skeleton-title"></div>
      <div class="skeleton-grid">
        ${Array.from({ length: 6 }).map(() => '<div class="skeleton-card"></div>').join('')}
      </div>
    </section>
  `;
}

function shellTopbar() {
  const identity = activeIdentity() || {};
  const summary = shellSummary();
  const role = personaLabel(identity.user?.role_key || identity.role_key || '');
  const facility = (identity.scopes?.facilityScopes || [])[0];
  const alertCount = [summary.lowStock, summary.validationErrors, summary.offlineBatches].reduce((total, value) => total + (Number(value || 0) > 0 ? Number(value || 0) : 0), 0);
  const readiness = summary.auditCoverage >= 95 && summary.exportReady >= 90 && summary.validationErrors === 0 ? 'Audit-backed' : summary.validationErrors > 0 ? 'Review required' : 'Operational';
  return `
    <header class="topbar shell-topbar">
      <div class="topbar-title">
        <div class="eyebrow">${h(PAGE_TITLES[state.page] || state.page)}</div>
        <h1>${h(PAGE_TITLES[state.page] || state.page)}</h1>
        <p class="topbar-summary">${h(SECTION_NOTE[state.page] || 'Live operational control with tenant-scoped data, approvals, audit logs, and compliance checks.')}</p>
        <div class="shell-context">
          <span class="chip">${h(state.bootstrap?.tenant?.name || 'Workspace unavailable')}</span>
          <span class="chip">${h(facility?.facility_name || 'Facility scope not assigned')}</span>
          <span class="chip">${h(role)}</span>
        </div>
      </div>
      <div class="command-bar">
        <label class="search-shell">
          <span class="visually-hidden">Search navigation and live queues</span>
          <input id="globalSearch" value="${h(state.search)}" placeholder="Search nav, queues, records" autocomplete="off" />
        </label>
        <button class="icon-button" data-drawer-tab="Audit trail" data-drawer-open="true" type="button" aria-label="Open notifications">
          <span aria-hidden="true">◌</span>
          <span class="badge-count">${h(alertCount)}</span>
        </button>
        <span class="status-pill ${readiness === 'Audit-backed' ? 'status-ok' : readiness === 'Review required' ? 'status-warn' : 'status-neutral'}">${h(readiness)}</span>
        <button class="ghost" data-action="refresh" type="button">Refresh workspace</button>
        ${state.bootstrap?.session ? `
          <details class="session-menu">
            <summary>${h(identity.user?.name || state.bootstrap?.user?.name || 'Session')}</summary>
            <div class="session-menu-panel">
              <div><strong>${h(identity.user?.email || state.bootstrap?.user?.email || '')}</strong></div>
              <div class="muted">${h(role)} · ${h(state.bootstrap?.tenant?.name || '')}</div>
              <div class="muted">${h(state.bootstrap?.tenant?.status || 'ACTIVE')} · ${h(state.authMode === 'oidc' ? 'SSO session' : 'Local workspace mode')}</div>
              <button class="ghost" data-action="logout" type="button">Sign out</button>
            </div>
          </details>
        ` : ''}
      </div>
    </header>
  `;
}

function shellSidebar() {
  const groups = visibleNavigationGroups();
  const identity = activeIdentity() || {};
  const summary = shellSummary();
  return `
    <aside class="sidebar shell-sidebar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" role="img" focusable="false" aria-hidden="true">
            <defs>
              <linearGradient id="opstraxMarkShell" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stop-color="#9be7ff"/>
                <stop offset="0.5" stop-color="#5b8cff"/>
                <stop offset="1" stop-color="#14b8a6"/>
              </linearGradient>
            </defs>
            <rect x="8" y="8" width="32" height="32" rx="12" fill="rgba(255,255,255,.05)" stroke="url(#opstraxMarkShell)" stroke-width="1.4"/>
            <path d="M14 25.5C17 19 22 15 28.7 15c4.2 0 7.4 1.4 9.9 4.2" fill="none" stroke="url(#opstraxMarkShell)" stroke-width="2.1" stroke-linecap="round"/>
            <path d="M34 22.5C31 29 26 33 19.3 33c-4.2 0-7.4-1.4-9.9-4.2" fill="none" stroke="url(#opstraxMarkShell)" stroke-width="2.1" stroke-linecap="round" opacity=".92"/>
            <circle cx="24" cy="24" r="4.1" fill="url(#opstraxMarkShell)"/>
          </svg>
        </div>
        <div>
          <div class="brand-title">OpsTrax</div>
          <div class="brand-subtitle">Enterprise SupplyOps</div>
        </div>
      </div>
      <div class="session-card">
        <label>Workspace</label>
        <div class="session-readout">
          <strong>Workspace: ${h(state.bootstrap?.tenant?.name || 'Workspace unavailable')}</strong>
          <span>${h(identity.user?.name || state.bootstrap?.user?.name || 'OpsTrax user')} · ${h(personaLabel(identity.user?.role_key || identity.role_key || ''))}</span>
          <small>${h(summary.workspaceEnvironment)} · ${h(summary.workspacePlan)} · ${h(summary.workspaceStatus)}</small>
        </div>
        <div class="shell-chips">
          <span class="chip">${h(summary.activeModules)} active modules</span>
          <span class="chip">${h(summary.facilities)} facilities</span>
          <span class="chip">${h(summary.departments)} departments</span>
        </div>
      </div>
      ${groups.length ? groups.map((group) => `
        <div class="nav-group">
          <div class="nav-title">${h(group.title)}</div>
          ${group.items.map((item) => `
            <button class="nav-item ${item.active ? 'active' : ''}" data-page="${h(item.page)}" type="button">
              <span class="nav-dot"></span>
              <span class="nav-label">${h(item.title)}</span>
            </button>
          `).join('')}
        </div>
      `).join('') : `
        <div class="empty-state nav-empty">
          No navigation matches the current search or feature set.
        </div>
      `}
      <div class="sidebar-footer">
        <div class="compliance-pill">Tenant Isolation · Audit Logging</div>
        <div class="footer-note">Workspace context stays isolated to ${h(state.bootstrap?.tenant?.industry || 'enterprise operations')}.</div>
      </div>
    </aside>
  `;
}

function shellKpis() {
  const summary = shellSummary();
  const cards = [
    ['Workspace Status', summary.workspaceEnvironment, `${summary.workspacePlan} · ${summary.workspaceStatus}`],
    ['Active Modules', summary.activeModules, 'Allowed by tenant policy'],
    ['Facilities', summary.facilities, 'Scoped operational sites'],
    ['Departments', summary.departments, 'Scoped business units'],
    ['Audit Coverage', `${countLabel(summary.auditCoverage)}%`, 'Write-path logging readiness'],
    ['Finance Readiness', `${countLabel(summary.exportReady)}%`, 'Validation posture']
  ];
  return `
    <section class="kpi-grid shell-kpi-grid">
      ${cards.map(([label, value, detail]) => `
        <article class="panel kpi">
          <div class="kpi-label">${h(label)}</div>
          <div class="kpi-value">${h(value)}</div>
          <div class="kpi-detail">${h(detail)}</div>
        </article>
      `).join('')}
    </section>
  `;
}

function landingSection(title, description, body, tone = '') {
  return `
    <section class="panel landing-section ${tone}">
      <div class="section-head">
        <div>
          <h2>${h(title)}</h2>
          <p>${h(description)}</p>
        </div>
      </div>
      ${body}
    </section>
  `;
}

function landingCard(item, extra = '') {
  return `
    <article class="landing-card ${extra}" data-drawer-focus="${h(item.focus?.type || 'tenant')}" data-drawer-id="${h(item.focus?.id || 'current')}" data-drawer-open="true">
      <div class="landing-card-head">
        <div>
          <div class="eyebrow">${h(item.kind)}</div>
          <strong>${h(item.title)}</strong>
        </div>
        <button class="ghost small" data-drawer-focus="${h(item.focus?.type || 'tenant')}" data-drawer-id="${h(item.focus?.id || 'current')}" type="button">Review</button>
      </div>
      <p>${h(item.detail)}</p>
    </article>
  `;
}

function shellDrawer() {
  const drawer = buildDrawerModel();
  const activeTab = state.drawerTab || 'Details';
  const tabs = drawer.tabs;
  const aiHelp = pageLens().ai;
  const identity = activeIdentity() || {};
  const exportSummary = drawer.exportSummary || null;
  const integrationSummary = drawer.integrationSummary || null;
  const request = drawer.focus.type === 'request' ? drawer.requestDetail?.request || drawer.requests.find((item) => item.id === drawer.focus.id) || null : null;
  const requestLines = drawer.focus.type === 'request' ? drawer.requestDetail?.lines || [] : [];
  const warehouseTask = drawer.focus.type === 'warehouse-task' ? drawer.warehouseTaskDetail?.task || drawer.warehouseTasks.find((item) => item.id === drawer.focus.id) || null : null;
  const warehouseTaskLines = drawer.focus.type === 'warehouse-task' ? drawer.warehouseTaskDetail?.lines || [] : [];
  const requestDocuments = request ? drawer.documents.filter((doc) => doc.entity_type === 'internal_request' && doc.entity_id === request.id) : drawer.documents;
  const warehouseTaskDocuments = warehouseTask ? drawer.documents.filter((doc) => doc.entity_type === 'warehouse_task' && doc.entity_id === warehouseTask.id) : drawer.documents;
  const evidenceRecord = drawer.focus.type === 'evidence' ? drawer.evidenceDetail?.evidence || drawer.documents.find((doc) => doc.id === drawer.focus.id) || null : null;
  const receivingSession = drawer.focus.type === 'receive-session' ? drawer.receivingDetail?.session || drawer.receivingSessions.find((row) => row.id === drawer.focus.id) || null : null;
  const receivingSessionLines = drawer.focus.type === 'receive-session' ? drawer.receivingDetail?.lines || [] : [];
  const requestAudit = request ? drawer.auditRows.filter((row) => row.entity_type === 'internal_request' && row.entity_id === request.id) : drawer.auditRows;
  const warehouseTaskAudit = warehouseTask ? drawer.auditRows.filter((row) => row.entity_type === 'warehouse_task' && row.entity_id === warehouseTask.id) : drawer.auditRows;
  const evidenceAudit = evidenceRecord ? drawer.auditRows.filter((row) => row.entity_type === 'document' && row.entity_id === evidenceRecord.id) : drawer.auditRows;
  const receivingAudit = receivingSession ? drawer.auditRows.filter((row) => row.entity_type === 'receive_session' && row.entity_id === receivingSession.id) : drawer.auditRows;
  const requestOwnedOrPrivileged = Boolean(request && (['admin', 'supervisor'].includes(identity.user?.role_key) || request.requested_by_user_id === identity.user?.id));
  const taskOwnedOrPrivileged = Boolean(warehouseTask && (['admin', 'supervisor'].includes(identity.user?.role_key) || warehouseTask.assigned_to_user_id === identity.user?.id || warehouseTask.department_id === identity.user?.department_id || warehouseTask.facility_id === identity.user?.facility_id));
  const privileged = Boolean(['admin', 'supervisor', 'finance'].includes(identity.user?.role_key));
  const procurementVendor = drawer.focus.type === 'vendor' ? drawer.procurementVendorDetail?.vendor || drawer.vendors.find((item) => item.id === drawer.focus.id) || null : null;
  const procurementRequest = drawer.focus.type === 'purchase-request' ? drawer.procurementRequestDetail?.purchaseRequest || drawer.purchaseRequests.find((item) => item.id === drawer.focus.id) || null : null;
  const procurementOrder = drawer.focus.type === 'purchase-order' ? drawer.procurementOrderDetail?.purchaseOrder || drawer.purchaseOrders.find((item) => item.id === drawer.focus.id) || null : null;
  const procurementContract = drawer.focus.type === 'supplier-contract' ? drawer.procurementContractDetail?.contract || null : null;
  const procurementBudget = drawer.focus.type === 'department-budget' ? drawer.procurementBudgetDetail?.budget || null : null;
  const procurementWaiver = drawer.focus.type === 'procurement-waiver' ? drawer.procurementWaiverDetail || null : null;
  const procurementRequestLines = drawer.focus.type === 'purchase-request' ? drawer.procurementRequestDetail?.lines || [] : [];
  const procurementOrderLines = drawer.focus.type === 'purchase-order' ? drawer.procurementOrderDetail?.lines || [] : [];
  const procurementRequestVendor = drawer.focus.type === 'purchase-request' ? drawer.procurementRequestDetail?.vendor || null : null;
  const procurementOrderVendor = drawer.focus.type === 'purchase-order' ? drawer.procurementOrderDetail?.vendor || null : null;
  const p2pInvoiceDetail = drawer.focus.type === 'vendor-invoice' ? drawer.p2pInvoiceDetail || null : null;
  const p2pInvoice = drawer.focus.type === 'vendor-invoice' ? drawer.p2pInvoiceDetail?.vendorInvoice || drawer.vendorInvoices.find((item) => item.id === drawer.focus.id) || null : null;
  const p2pRfq = drawer.focus.type === 'rfq-request' ? drawer.p2pRfqDetail?.rfqRequest || drawer.rfqRequests.find((item) => item.id === drawer.focus.id) || null : null;
  const p2pQuote = drawer.focus.type === 'vendor-quote' ? drawer.p2pQuoteDetail?.vendorQuote || drawer.vendorQuotes.find((item) => item.id === drawer.focus.id) || null : null;
  const p2pInvoiceLines = drawer.focus.type === 'vendor-invoice' ? drawer.p2pInvoiceDetail?.lines || [] : [];
  const p2pInvoiceExceptions = drawer.focus.type === 'vendor-invoice' ? drawer.p2pInvoiceDetail?.exceptions || [] : [];
  const p2pInvoiceExtractionRuns = drawer.focus.type === 'vendor-invoice' ? drawer.p2pInvoiceDetail?.extractionRuns || [] : [];
  const p2pInvoiceMatchResults = drawer.focus.type === 'vendor-invoice' ? drawer.p2pInvoiceDetail?.matchResults || [] : [];
  const p2pInvoiceApprovalEvents = drawer.focus.type === 'vendor-invoice' ? drawer.p2pInvoiceDetail?.approvalEvents || [] : [];
  const p2pInvoiceEditable = Boolean(p2pInvoice && ['DRAFT', 'UPLOADED', 'EXTRACTION_PENDING', 'EXTRACTED', 'MATCHING_PENDING', 'MATCHED', 'EXCEPTION', 'APPROVAL_PENDING', 'EXPORT_READY'].includes(p2pInvoice.status));
  const p2pRfqLines = drawer.focus.type === 'rfq-request' ? drawer.p2pRfqDetail?.lines || [] : [];
  const p2pQuoteLines = drawer.focus.type === 'vendor-quote' ? drawer.p2pQuoteDetail?.lines || [] : [];
  const procurementRequestDocs = procurementRequest ? drawer.documents.filter((doc) => doc.entity_type === 'purchase_request' && doc.entity_id === procurementRequest.id) : drawer.documents;
  const procurementOrderDocs = procurementOrder ? drawer.documents.filter((doc) => doc.entity_type === 'purchase_order' && doc.entity_id === procurementOrder.id) : drawer.documents;
  const procurementVendorDocs = procurementVendor ? drawer.documents.filter((doc) => doc.entity_type === 'vendor' && doc.entity_id === procurementVendor.id) : drawer.documents;
  const procurementContractDocs = procurementContract ? drawer.documents.filter((doc) => doc.entity_type === 'supplier_contract' && doc.entity_id === procurementContract.id) : drawer.documents;
  const procurementBudgetDocs = procurementBudget ? drawer.documents.filter((doc) => doc.entity_type === 'department_budget' && doc.entity_id === procurementBudget.id) : drawer.documents;
  const p2pInvoiceDocs = p2pInvoice ? drawer.documents.filter((doc) => doc.entity_type === 'vendor_invoice' && doc.entity_id === p2pInvoice.id) : drawer.documents;
  const p2pRfqDocs = p2pRfq ? drawer.documents.filter((doc) => doc.entity_type === 'rfq_request' && doc.entity_id === p2pRfq.id) : drawer.documents;
  const p2pQuoteDocs = p2pQuote ? drawer.documents.filter((doc) => doc.entity_type === 'vendor_quote' && doc.entity_id === p2pQuote.id) : drawer.documents;
  const procurementRequestAudit = procurementRequest ? drawer.auditRows.filter((row) => row.entity_type === 'purchase_request' && row.entity_id === procurementRequest.id) : drawer.auditRows;
  const procurementOrderAudit = procurementOrder ? drawer.auditRows.filter((row) => row.entity_type === 'purchase_order' && row.entity_id === procurementOrder.id) : drawer.auditRows;
  const procurementVendorAudit = procurementVendor ? drawer.auditRows.filter((row) => row.entity_type === 'vendor' && row.entity_id === procurementVendor.id) : drawer.auditRows;
  const procurementContractAudit = procurementContract ? drawer.auditRows.filter((row) => row.entity_type === 'supplier_contract' && row.entity_id === procurementContract.id) : drawer.auditRows;
  const procurementBudgetAudit = procurementBudget ? drawer.auditRows.filter((row) => row.entity_type === 'department_budget' && row.entity_id === procurementBudget.id) : drawer.auditRows;
  const procurementWaiverAudit = procurementWaiver ? drawer.auditRows.filter((row) => row.entity_type === 'procurement_waiver' && row.entity_id === procurementWaiver.id) : drawer.auditRows;
  const p2pInvoiceAudit = p2pInvoice ? drawer.auditRows.filter((row) => row.entity_type === 'vendor_invoice' && row.entity_id === p2pInvoice.id) : drawer.auditRows;
  const p2pRfqAudit = p2pRfq ? drawer.auditRows.filter((row) => row.entity_type === 'rfq_request' && row.entity_id === p2pRfq.id) : drawer.auditRows;
  const p2pQuoteAudit = p2pQuote ? drawer.auditRows.filter((row) => row.entity_type === 'vendor_quote' && row.entity_id === p2pQuote.id) : drawer.auditRows;
  const reportRun = drawer.focus.type === 'report-run'
    ? drawer.reportDetail?.run || drawer.reportDetail?.report || drawer.reportDetail?.runDetail || { id: drawer.focus.id, status: 'COMPLETED', report_title: 'Report run' }
    : null;
  const reportRunRows = drawer.focus.type === 'report-run' ? drawer.reportDetail?.rows || [] : [];
  const reportRunColumns = drawer.focus.type === 'report-run' ? drawer.reportDetail?.columns || [] : [];
  const reportRunExports = drawer.focus.type === 'report-run' ? drawer.reportDetail?.exports || [] : [];
  const reportRunAudit = drawer.focus.type === 'report-run' ? drawer.reportDetail?.audit || drawer.auditRows.filter((row) => row.entity_type === 'report_run' && row.entity_id === drawer.focus.id) : drawer.auditRows;
  const exportBatch = drawer.focus.type === 'export-batch' ? drawer.exportBatchDetail?.batch || drawer.exportBatches.find((item) => item.id === drawer.focus.id) || null : null;
  const exportBatchErrors = drawer.focus.type === 'export-batch' ? drawer.exportBatchDetail?.errors || drawer.exportErrors.filter((row) => row.export_batch_id === drawer.focus.id) : [];
  const exportBatchEvidence = drawer.focus.type === 'export-batch' ? drawer.exportBatchDetail?.evidenceLinks || [] : [];
  const exportBatchAudit = drawer.focus.type === 'export-batch' ? drawer.exportBatchDetail?.audit || drawer.auditRows.filter((row) => row.entity_type === 'export_batch' && row.entity_id === drawer.focus.id) : drawer.auditRows;
  const exportError = drawer.focus.type === 'export-error' ? drawer.exportErrors.find((row) => row.id === drawer.focus.id) || null : null;
  const integrationConnection = drawer.focus.type === 'integration-connection' ? drawer.exportConnectionDetail?.connection || drawer.integrationConnections.find((item) => item.id === drawer.focus.id) || null : null;
  const integrationConnectionJobs = drawer.focus.type === 'integration-connection' ? drawer.exportConnectionDetail?.jobs || drawer.integrationJobs.filter((job) => job.connection_id === drawer.focus.id) : [];
  const integrationConnectionAudit = drawer.focus.type === 'integration-connection' ? drawer.exportConnectionDetail?.audit || drawer.auditRows.filter((row) => row.entity_type === 'integration_connection' && row.entity_id === drawer.focus.id) : drawer.auditRows;
  const integrationJob = drawer.focus.type === 'integration-job' ? drawer.exportJobDetail?.job || drawer.integrationJobs.find((item) => item.id === drawer.focus.id) || null : null;
  const integrationJobAudit = drawer.focus.type === 'integration-job' ? drawer.exportJobDetail?.audit || drawer.auditRows.filter((row) => row.entity_type === 'integration_job' && row.entity_id === drawer.focus.id) : drawer.auditRows;
  const drawerSummaryChips = drawer.detailLines.slice(0, 4);
  const requestActions = request ? (() => {
    const actions = [];
    if (request.status === 'DRAFT') {
      if (requestOwnedOrPrivileged && can('submit_request')) actions.push(`<button class="ghost" data-action="submit-request" data-id="${h(request.id)}" type="button">Submit</button>`);
      if (requestOwnedOrPrivileged && can('cancel_request')) actions.push(`<button class="ghost" data-action="cancel-request" data-id="${h(request.id)}" type="button">Cancel</button>`);
    } else if (request.status === 'SUBMITTED') {
      if (can('approve_request')) actions.push(`<button class="ghost" data-action="approve-request" data-id="${h(request.id)}" type="button">Approve</button>`);
      if (requestOwnedOrPrivileged && can('cancel_request')) actions.push(`<button class="ghost" data-action="cancel-request" data-id="${h(request.id)}" type="button">Cancel</button>`);
    } else if (request.status === 'APPROVED' || request.status === 'ISSUE_READY' || request.status === 'PICKING' || request.status === 'PARTIALLY_ISSUED') {
      const warehouseTaskForRequest = drawer.warehouseTasks.find((task) => task.request_id === request.id && !['CLOSED', 'CANCELLED'].includes(task.status));
      if (warehouseTaskForRequest) {
        actions.push(`<button class="ghost" data-drawer-focus="warehouse-task" data-drawer-id="${h(warehouseTaskForRequest.id)}" data-drawer-open="true" type="button">Open warehouse task</button>`);
      } else if (can('manage_warehouse_tasks')) {
        actions.push(`<button class="ghost" data-action="create-warehouse-task" data-id="${h(request.id)}" type="button">Create warehouse task</button>`);
      } else {
        actions.push('<span class="muted">Warehouse execution is not available to this role.</span>');
      }
    } else if (request.status === 'REJECTED') {
      actions.push('<span class="muted">Rejected requests are closed to further edits.</span>');
    }
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">No actions are available for this request state.</div>';
  })() : '';
  const exportBatchActions = exportBatch ? (() => {
    const actions = [];
    if (can('validate_export_batch') && ['DRAFT', 'FAILED_VALIDATION', 'VALIDATED', 'APPROVED'].includes(exportBatch.status)) {
      actions.push(`<button class="ghost" data-action="validate-export-batch" data-id="${h(exportBatch.id)}" type="button">Validate Batch</button>`);
    }
    if (can('approve_export_batch') && !exportBatchErrors.some((row) => row.severity === 'ERROR') && ['DRAFT', 'FAILED_VALIDATION', 'VALIDATED'].includes(exportBatch.status)) {
      actions.push(`<button class="ghost" data-action="approve-export-batch" data-id="${h(exportBatch.id)}" type="button">Approve Batch</button>`);
    }
    if (can('generate_export_batch') && ['APPROVED', 'VALIDATED'].includes(exportBatch.status)) {
      actions.push(`<button class="ghost" data-action="generate-export-batch" data-id="${h(exportBatch.id)}" type="button">Generate Payload</button>`);
    }
    if (can('dispatch_export_batch') && exportBatch.status === 'GENERATED') {
      const connectionId = drawer.integrationConnections[0]?.id || '';
      actions.push(`<button class="ghost" data-action="dispatch-export-batch" data-id="${h(exportBatch.id)}" data-connection-id="${h(connectionId)}" type="button">Dispatch</button>`);
    }
    if (can('cancel_export_batch') && exportBatch.status !== 'CANCELLED') {
      actions.push(`<button class="ghost red" data-action="cancel-export-batch" data-id="${h(exportBatch.id)}" type="button">Cancel Batch</button>`);
    }
    actions.push(`<button class="ghost" data-page="Audit Black Box" type="button">Open Audit Trail</button>`);
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">No export actions are available for this batch state.</div>';
  })() : '';
  const exportErrorActions = exportError ? '<div class="empty-state compact-empty">Validation errors are view only. Clear the batch issue before approval.</div>' : '';
  const integrationConnectionActions = integrationConnection ? '<div class="empty-state compact-empty">Connection configuration is read only here. Secret material never leaves the backend.</div>' : '';
  const integrationJobActions = integrationJob ? (() => {
    const actions = [];
    if (can('retry_integration_job') && ['FAILED', 'BLOCKED', 'CANCELLED', 'QUEUED'].includes(integrationJob.status)) {
      actions.push(`<button class="ghost" data-action="retry-integration-job" data-id="${h(integrationJob.id)}" type="button">Retry Job</button>`);
    }
    if (can('cancel_integration_job') && !['DISPATCHED', 'COMPLETED'].includes(integrationJob.status)) {
      actions.push(`<button class="ghost red" data-action="cancel-integration-job" data-id="${h(integrationJob.id)}" type="button">Cancel Job</button>`);
    }
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">No integration job actions are available for this state.</div>';
  })() : '';
  const reportRunActions = reportRun ? (() => {
    const actions = [];
    if (can('run_reports') && ['QUEUED', 'RUNNING'].includes(reportRun.status)) {
      actions.push(`<button class="ghost red" data-action="cancel-report-run" data-id="${h(reportRun.id)}" type="button">Cancel Run</button>`);
    }
    actions.push(`<button class="ghost" data-action="download-report-csv" data-id="${h(reportRun.id)}" type="button">Download CSV</button>`);
    actions.push(`<button class="ghost" data-action="download-report-pdf" data-id="${h(reportRun.id)}" type="button">Download PDF</button>`);
    actions.push('<div class="empty-state compact-empty">Reports are generated by the backend and exported through controlled handlers. No client-side export logic is used.</div>');
    return actions.join('');
  })() : '';
  const warehouseTaskActions = warehouseTask ? (() => {
    const actions = [];
    if (can('execute_warehouse_tasks') && taskOwnedOrPrivileged) {
      if (warehouseTask.status === 'CREATED' || warehouseTask.status === 'ASSIGNED') {
        actions.push(`<button class="ghost" data-action="start-warehouse-task" data-id="${h(warehouseTask.id)}" type="button">Start</button>`);
      }
      if (warehouseTask.status === 'IN_PROGRESS' || warehouseTask.status === 'PICK_PENDING' || warehouseTask.status === 'PICKED' || warehouseTask.status === 'PARTIALLY_ISSUED' || warehouseTask.status === 'EXCEPTION') {
        const firstOpenLine = warehouseTaskLines.find((line) => line.status !== 'ISSUED' && line.status !== 'CANCELLED') || warehouseTaskLines[0];
        if (firstOpenLine) {
          actions.push(`<button class="ghost" data-action="pick-warehouse-task" data-id="${h(warehouseTask.id)}" data-line-id="${h(firstOpenLine.id)}" data-line-qty="${h(firstOpenLine.requested_quantity)}" data-bin-id="${h(firstOpenLine.bin_id || '')}" type="button">Pick line</button>`);
          actions.push(`<button class="ghost" data-action="issue-warehouse-task" data-id="${h(warehouseTask.id)}" data-line-id="${h(firstOpenLine.id)}" data-line-qty="${h(firstOpenLine.requested_quantity - firstOpenLine.issued_quantity)}" data-bin-id="${h(firstOpenLine.bin_id || '')}" type="button">Issue line</button>`);
        }
      }
    }
    if (can('manage_warehouse_tasks') && taskOwnedOrPrivileged && warehouseTask.status !== 'CLOSED' && warehouseTask.status !== 'CANCELLED') {
      actions.push(`<button class="ghost" data-action="close-warehouse-task" data-id="${h(warehouseTask.id)}" type="button">Close</button>`);
      actions.push(`<button class="ghost red" data-action="cancel-warehouse-task" data-id="${h(warehouseTask.id)}" type="button">Cancel</button>`);
    }
    if (can('manage_warehouse_tasks') && warehouseTask.request_id && (warehouseTask.status === 'CREATED' || warehouseTask.status === 'ASSIGNED')) {
      actions.push(`<button class="ghost" data-action="open-request-from-task" data-id="${h(warehouseTask.request_id)}" type="button">Open request</button>`);
    }
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">No warehouse actions are available for this task state.</div>';
  })() : '';
  const procurementVendorActions = procurementVendor ? (() => {
    const actions = [];
    const governance = drawer.procurementVendorDetail?.governance || {};
    if (can('manage_vendors')) {
      actions.push(`
        <form id="procurementVendorForm" class="form-grid">
          <input type="hidden" name="vendorId" value="${h(procurementVendor.id)}" />
          <label class="field">
            <span>Code</span>
            <input name="code" value="${h(procurementVendor.code)}" />
          </label>
          <label class="field">
            <span>Name</span>
            <input name="name" value="${h(procurementVendor.name)}" />
          </label>
          <label class="field">
            <span>Status</span>
            <select name="status">
              ${['DRAFT', 'ACTIVE', 'SUSPENDED', 'BLOCKED', 'ARCHIVED'].map((value) => `<option value="${value}" ${value === procurementVendor.status ? 'selected' : ''}>${value}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Risk score</span>
            <input name="riskScore" type="number" min="0" max="100" step="1" value="${h(procurementVendor.risk_score)}" />
          </label>
          <label class="field">
            <span>Contact</span>
            <input name="contactName" value="${h(procurementVendor.contact_name || '')}" />
          </label>
          <label class="field">
            <span>Email</span>
            <input name="email" type="email" value="${h(procurementVendor.email || '')}" />
          </label>
          <label class="field">
            <span>Phone</span>
            <input name="phone" value="${h(procurementVendor.phone || '')}" />
          </label>
          <label class="field">
            <span>Last reviewed</span>
            <input name="lastReviewedAt" type="date" value="${h((procurementVendor.last_reviewed_at || '').slice(0, 10))}" />
          </label>
          <div class="actions-row">
            <button class="primary" type="submit">Update Vendor</button>
          </div>
          </form>
        `);
      if (can('manage_procurement_waivers')) {
        actions.push(`
          <form id="procurementWaiverForm" class="form-grid">
            <input type="hidden" name="entityType" value="vendor" />
            <input type="hidden" name="entityId" value="${h(procurementVendor.id)}" />
            <label class="field">
              <span>Waiver type</span>
              <select name="waiverType">
                <option value="SUPPLIER_EXCEPTION">Supplier exception</option>
                <option value="CONTRACT_EXCEPTION">Contract exception</option>
              </select>
            </label>
            <label class="field" style="grid-column:1 / -1">
              <span>Reason</span>
              <textarea name="reason" placeholder="Explain why the waiver is necessary" required></textarea>
            </label>
            <div class="actions-row">
              <button class="primary" type="submit">Create Waiver</button>
            </div>
          </form>
        `);
      }
      if (governance.complianceStatus !== 'CLEAR') {
        actions.push('<div class="empty-state compact-empty">Supplier compliance is under review. Expired or missing documents block downstream use until a waiver is recorded.</div>');
      }
    }
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">Vendor maintenance is read only for this role.</div>';
  })() : '';
  const procurementContractActions = procurementContract ? (() => {
    const actions = [];
    if (can('manage_contract_repository')) {
      actions.push(`
        <form id="procurementContractForm" class="form-grid">
          <input type="hidden" name="contractId" value="${h(procurementContract.id)}" />
          <label class="field">
            <span>Contract no</span>
            <input name="contractNo" value="${h(procurementContract.contract_no)}" required />
          </label>
          <label class="field">
            <span>Title</span>
            <input name="title" value="${h(procurementContract.title)}" required />
          </label>
          <label class="field">
            <span>Status</span>
            <select name="status">
              ${['DRAFT', 'ACTIVE', 'SUSPENDED', 'EXPIRED', 'ARCHIVED'].map((value) => `<option value="${value}" ${value === procurementContract.status ? 'selected' : ''}>${value}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Effective date</span>
            <input name="effectiveDate" type="date" value="${h((procurementContract.effective_date || '').slice(0, 10))}" />
          </label>
          <label class="field">
            <span>Expiry date</span>
            <input name="expiryDate" type="date" value="${h((procurementContract.expiry_date || '').slice(0, 10))}" />
          </label>
          <label class="field">
            <span>Pricing reference</span>
            <input name="pricingReference" value="${h(procurementContract.pricing_reference || '')}" />
          </label>
          <div class="actions-row">
            <button class="primary" type="submit">Save Contract</button>
          </div>
        </form>
      `);
    }
    if (can('manage_procurement_waivers')) {
      actions.push(`
        <form id="procurementWaiverForm" class="form-grid">
          <input type="hidden" name="entityType" value="supplier_contract" />
          <input type="hidden" name="entityId" value="${h(procurementContract.id)}" />
          <label class="field">
            <span>Waiver type</span>
            <select name="waiverType">
              <option value="SUPPLIER_EXCEPTION">Supplier exception</option>
              <option value="CONTRACT_EXCEPTION">Contract exception</option>
            </select>
          </label>
          <label class="field" style="grid-column:1 / -1">
            <span>Reason</span>
            <textarea name="reason" placeholder="Explain why the waiver is necessary" required></textarea>
          </label>
          <div class="actions-row">
            <button class="primary" type="submit">Create Waiver</button>
          </div>
        </form>
      `);
    }
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">No contract actions are available for this role.</div>';
  })() : '';
  const procurementBudgetActions = procurementBudget ? (() => {
    const actions = [];
    if (can('manage_budget_controls')) {
      actions.push(`
        <form id="procurementBudgetForm" class="form-grid">
          <input type="hidden" name="budgetId" value="${h(procurementBudget.id)}" />
          <label class="field">
            <span>Budget amount</span>
            <input name="budgetAmount" type="number" min="0" step="0.01" value="${h(procurementBudget.budget_amount)}" />
          </label>
          <label class="field">
            <span>Alert threshold</span>
            <input name="alertThresholdPct" type="number" min="0.1" max="1" step="0.05" value="${h(procurementBudget.alert_threshold_pct)}" />
          </label>
          <label class="field">
            <span>Status</span>
            <select name="status">
              ${['ACTIVE', 'PAUSED', 'ARCHIVED'].map((value) => `<option value="${value}" ${value === procurementBudget.status ? 'selected' : ''}>${value}</option>`).join('')}
            </select>
          </label>
          <div class="actions-row">
            <button class="primary" type="submit">Save Budget</button>
          </div>
        </form>
      `);
    }
    if (can('manage_procurement_waivers')) {
      actions.push(`
        <form id="procurementWaiverForm" class="form-grid">
          <input type="hidden" name="entityType" value="department_budget" />
          <input type="hidden" name="entityId" value="${h(procurementBudget.id)}" />
          <label class="field">
            <span>Waiver type</span>
            <select name="waiverType">
              <option value="BUDGET_EXCEPTION">Budget exception</option>
            </select>
          </label>
          <label class="field" style="grid-column:1 / -1">
            <span>Reason</span>
            <textarea name="reason" placeholder="Explain why the budget exception is necessary" required></textarea>
          </label>
          <div class="actions-row">
            <button class="primary" type="submit">Create Waiver</button>
          </div>
        </form>
      `);
    }
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">No budget actions are available for this role.</div>';
  })() : '';
  const procurementWaiverActions = procurementWaiver ? `
    <div class="empty-state compact-empty">Waivers are read only in the shell. Use the underlying vendor, contract, or budget context to create a new waiver.</div>
  ` : '';
  const procurementRequestActions = procurementRequest ? (() => {
    const actions = [];
    const requestOwnedOrPrivilegedProcurement = Boolean(privileged || procurementRequest.requested_by_user_id === identity.user?.id);
    if (procurementRequest.status === 'DRAFT') {
      if (can('update_purchase_request')) {
        actions.push(`
          <form id="procurementRequestDraftForm" class="form-grid">
            <input type="hidden" name="purchaseRequestId" value="${h(procurementRequest.id)}" />
            <label class="field">
              <span>Vendor</span>
              <select name="vendorId">
                ${(drawer.vendors || []).map((vendor) => `<option value="${h(vendor.id)}" ${vendor.id === procurementRequest.vendor_id ? 'selected' : ''}>${h(vendor.name)} · ${h(vendor.code)}</option>`).join('')}
              </select>
            </label>
            <label class="field">
              <span>Accounting code</span>
              <input name="accountingCode" value="${h(procurementRequest.accounting_code || '')}" />
            </label>
            <label class="field">
              <span>Department</span>
              <select name="departmentId" ${privileged ? '' : 'disabled'}>
                ${(state.bootstrap?.lookups?.departments || []).map((dept) => `<option value="${h(dept.id)}" ${dept.id === procurementRequest.department_id ? 'selected' : ''}>${h(dept.name)}</option>`).join('')}
              </select>
            </label>
            <label class="field">
              <span>Facility</span>
              <select name="facilityId" ${privileged ? '' : 'disabled'}>
                ${(state.bootstrap?.lookups?.facilities || []).map((facility) => `<option value="${h(facility.id)}" ${facility.id === procurementRequest.facility_id ? 'selected' : ''}>${h(facility.name)}</option>`).join('')}
              </select>
            </label>
            <div class="actions-row">
              <button class="primary" type="submit">Update Draft</button>
            </div>
          </form>
        `);
        actions.push(`
          <form id="procurementRequestLineForm" class="form-grid">
            <input type="hidden" name="purchaseRequestId" value="${h(procurementRequest.id)}" />
            <input type="hidden" name="lineId" value="${h((state.procurementLineDraft?.requestId === procurementRequest.id ? state.procurementLineDraft?.lineId : '') || '')}" />
            <label class="field">
              <span>Item</span>
              <select name="itemId">
                ${(state.data?.items?.items || []).map((item) => `<option value="${h(item.id)}" ${item.id === (state.procurementLineDraft?.requestId === procurementRequest.id ? state.procurementLineDraft?.itemId : '') ? 'selected' : ''}>${h(item.name)}</option>`).join('')}
              </select>
            </label>
            <label class="field">
              <span>Description</span>
              <input name="description" value="${h(state.procurementLineDraft?.requestId === procurementRequest.id ? state.procurementLineDraft?.description || '' : '')}" placeholder="Line description" />
            </label>
            <label class="field">
              <span>Quantity</span>
              <input name="qty" type="number" min="1" step="1" value="${h(state.procurementLineDraft?.requestId === procurementRequest.id ? state.procurementLineDraft?.qty || 1 : 1)}" />
            </label>
            <label class="field">
              <span>Unit price</span>
              <input name="unitPrice" type="number" min="0" step="0.01" value="${h(state.procurementLineDraft?.requestId === procurementRequest.id ? state.procurementLineDraft?.unitPrice || 0 : 0)}" />
            </label>
            <div class="actions-row">
              <button class="primary" type="submit">${state.procurementLineDraft?.requestId === procurementRequest.id ? 'Update Line' : 'Add Line'}</button>
              ${state.procurementLineDraft?.requestId === procurementRequest.id ? '<button class="ghost" data-action="clear-procurement-line" type="button">Clear</button>' : ''}
            </div>
          </form>
        `);
      }
      if (requestOwnedOrPrivilegedProcurement && can('submit_purchase_request')) {
        actions.push('<button class="ghost" data-action="procure-submit-request" data-id="' + h(procurementRequest.id) + '" type="button">Submit Request</button>');
      }
      if (requestOwnedOrPrivilegedProcurement && can('cancel_purchase_request')) {
        actions.push('<button class="ghost red" data-action="procure-cancel-request" data-id="' + h(procurementRequest.id) + '" type="button">Cancel Request</button>');
      }
    } else if (procurementRequest.status === 'PENDING_APPROVAL') {
      if (can('approve_purchase_request')) actions.push('<button class="ghost" data-action="procure-approve-request" data-id="' + h(procurementRequest.id) + '" type="button">Approve Request</button>');
      if (can('reject_purchase_request')) actions.push('<button class="ghost red" data-action="procure-reject-request" data-id="' + h(procurementRequest.id) + '" type="button">Reject Request</button>');
      if (requestOwnedOrPrivilegedProcurement && can('cancel_purchase_request')) actions.push('<button class="ghost" data-action="procure-cancel-request" data-id="' + h(procurementRequest.id) + '" type="button">Cancel Request</button>');
    } else if (procurementRequest.status === 'APPROVED') {
      if (can('create_purchase_order')) actions.push('<button class="ghost" data-action="procure-create-po" data-id="' + h(procurementRequest.id) + '" type="button">Create Purchase Order</button>');
    }
    if (procurementRequest.status === 'DRAFT' && procurementRequestLines.length) {
      actions.push(`
        <div class="table-wrap">
          ${table(procurementRequestLines, ['Line', 'Qty', 'Price', 'Status', 'Action'], (line) => `
            <tr>
              <td>
                <strong>${h(line.item_name || line.item_id || line.description)}</strong>
                <div class="muted">${h(line.description)}</div>
              </td>
              <td>${h(line.qty_requested || line.qty || 0)}</td>
              <td>${money(line.unit_price)}</td>
              <td>${badge(line.status)}</td>
              <td>
                ${can('update_purchase_request') ? `
                  <button class="ghost small" type="button" data-action="edit-procurement-line" data-line-id="${h(line.id)}" data-item-id="${h(line.item_id || '')}" data-description="${h(line.description || '')}" data-qty="${h(line.qty || line.qty_requested || 1)}" data-unit-price="${h(line.unit_price || 0)}">Edit</button>
                  <button class="ghost small red" type="button" data-action="delete-procurement-line" data-line-id="${h(line.id)}">Delete</button>
                ` : '—'}
              </td>
            </tr>
          `)}
        </div>
      `);
    }
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">No procurement request actions are available for this state.</div>';
  })() : '';
  const procurementOrderActions = procurementOrder ? (() => {
    const actions = [];
    if (can('update_purchase_order') && procurementOrder.status === 'DRAFT') {
      actions.push(`
        <form id="procurementOrderForm" class="form-grid">
          <input type="hidden" name="purchaseOrderId" value="${h(procurementOrder.id)}" />
          <label class="field" style="grid-column:1 / -1">
            <span>Notes</span>
            <textarea name="notes">${h(procurementOrder.notes || '')}</textarea>
          </label>
          <div class="actions-row">
            <button class="primary" type="submit">Update PO</button>
          </div>
        </form>
      `);
    }
    if (procurementOrder.status === 'DRAFT' && can('approve_purchase_order')) {
      actions.push(`<button class="ghost" data-action="procure-approve-po" data-id="${h(procurementOrder.id)}" type="button">Approve PO</button>`);
    }
    if (procurementOrder.status === 'APPROVED' && can('issue_purchase_order')) {
      actions.push(`<button class="ghost" data-action="procure-issue-po" data-id="${h(procurementOrder.id)}" type="button">Issue PO</button>`);
    }
    if (['DRAFT', 'APPROVED'].includes(procurementOrder.status) && can('cancel_purchase_order')) {
      actions.push(`<button class="ghost red" data-action="procure-cancel-po" data-id="${h(procurementOrder.id)}" type="button">Cancel PO</button>`);
    }
    if (procurementOrderLines.length) {
      actions.push(`
        <div class="table-wrap">
          ${table(procurementOrderLines, ['Line', 'Qty', 'Price', 'Status'], (line) => `
            <tr>
              <td><strong>${h(line.item_name || line.item_id || line.description)}</strong><div class="muted">${h(line.description)}</div></td>
              <td>${h(line.qty_ordered)}</td>
              <td>${money(line.unit_price)}</td>
              <td>${badge(line.status)}</td>
            </tr>
          `)}
        </div>
      `);
    }
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">No purchase order actions are available for this state.</div>';
  })() : '';
  const p2pInvoiceActions = p2pInvoice ? (() => {
    const actions = [];
    const invoiceLineDraftActive = state.p2pInvoiceLineDraft?.requestId === p2pInvoice.id;
    if (can('update_vendor_invoice') && ['DRAFT', 'UPLOADED'].includes(p2pInvoice.status)) {
      actions.push(`<button class="ghost" data-action="p2p-upload-invoice" data-id="${h(p2pInvoice.id)}" type="button">Mark Uploaded</button>`);
    }
    if (can('extract_vendor_invoice') && ['DRAFT', 'UPLOADED', 'EXTRACTION_PENDING', 'EXTRACTED', 'EXCEPTION'].includes(p2pInvoice.status)) {
      actions.push(`<button class="ghost" data-action="p2p-extract-invoice" data-id="${h(p2pInvoice.id)}" type="button">Extract</button>`);
    }
    if (can('match_vendor_invoice') && ['EXTRACTED', 'EXCEPTION', 'MATCHED'].includes(p2pInvoice.status)) {
      actions.push(`<button class="ghost" data-action="p2p-match-invoice" data-id="${h(p2pInvoice.id)}" type="button">Match</button>`);
    }
    if (can('waive_invoice_exception') && (drawer.p2pInvoiceDetail?.exceptions || []).some((row) => !row.waived_at)) {
      actions.push(`<button class="ghost" data-action="p2p-waive-invoice-exception" data-id="${h(p2pInvoice.id)}" data-exception-id="${h((drawer.p2pInvoiceDetail?.exceptions || []).find((row) => !row.waived_at)?.id || '')}" type="button">Waive exception</button>`);
    }
    if (can('approve_vendor_invoice') && ['MATCHED', 'EXCEPTION', 'EXTRACTED'].includes(p2pInvoice.status)) {
      actions.push(`<button class="ghost" data-action="p2p-approve-invoice" data-id="${h(p2pInvoice.id)}" type="button">Approve Invoice</button>`);
    }
    if (can('reject_vendor_invoice') && ['DRAFT', 'UPLOADED', 'EXTRACTED', 'EXCEPTION'].includes(p2pInvoice.status)) {
      actions.push(`<button class="ghost red" data-action="p2p-reject-invoice" data-id="${h(p2pInvoice.id)}" type="button">Reject Invoice</button>`);
    }
    if (can('update_vendor_invoice') && p2pInvoiceEditable && !['EXPORTED', 'REJECTED', 'CANCELLED'].includes(p2pInvoice.status)) {
      actions.push(`<button class="ghost red" data-action="p2p-cancel-invoice" data-id="${h(p2pInvoice.id)}" type="button">Cancel Invoice</button>`);
    }
    if (can('mark_invoice_export_ready') && ['APPROVED'].includes(p2pInvoice.status)) {
      actions.push(`<button class="ghost" data-action="p2p-mark-export-ready" data-id="${h(p2pInvoice.id)}" type="button">Mark Export Ready</button>`);
    }
    if (can('export_vendor_invoice') && ['EXPORT_READY'].includes(p2pInvoice.status)) {
      actions.push(`<button class="ghost" data-action="p2p-export-invoice" data-id="${h(p2pInvoice.id)}" type="button">Export Invoice</button>`);
    }
    if (can('update_vendor_invoice') && p2pInvoiceEditable) {
      actions.push(`
        <form id="p2pInvoiceLineForm" class="form-grid">
          <input type="hidden" name="invoiceId" value="${h(p2pInvoice.id)}" />
          <input type="hidden" name="lineId" value="${h(invoiceLineDraftActive ? state.p2pInvoiceLineDraft?.lineId || '' : '')}" />
          <label class="field">
            <span>Item</span>
            <select name="itemId">
              <option value="">Not linked</option>
              ${(state.data?.items?.items || []).map((item) => `<option value="${h(item.id)}" ${item.id === (invoiceLineDraftActive ? state.p2pInvoiceLineDraft?.itemId : '') ? 'selected' : ''}>${h(item.name)}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Description</span>
            <input name="description" value="${h(invoiceLineDraftActive ? state.p2pInvoiceLineDraft?.description || '' : '')}" placeholder="Invoice line description" />
          </label>
          <label class="field">
            <span>Quantity</span>
            <input name="qty" type="number" min="1" step="1" value="${h(invoiceLineDraftActive ? state.p2pInvoiceLineDraft?.qty || 1 : 1)}" />
          </label>
          <label class="field">
            <span>Unit price</span>
            <input name="unitPrice" type="number" min="0" step="0.01" value="${h(invoiceLineDraftActive ? state.p2pInvoiceLineDraft?.unitPrice || 0 : 0)}" />
          </label>
          <label class="field" style="grid-column:1 / -1">
            <span>Purchase order line</span>
            <select name="purchaseOrderLineId">
              <option value="">Not linked</option>
              ${(p2pInvoiceDetail?.purchaseOrderLines || []).map((line) => `<option value="${h(line.id)}" ${line.id === (invoiceLineDraftActive ? state.p2pInvoiceLineDraft?.purchaseOrderLineId : '') ? 'selected' : ''}>${h(line.description)} · ${h(line.qty_ordered)} ordered</option>`).join('')}
            </select>
          </label>
          <div class="actions-row">
            <button class="primary" type="submit">${invoiceLineDraftActive ? 'Update Invoice Line' : 'Add Invoice Line'}</button>
            ${invoiceLineDraftActive ? '<button class="ghost" data-action="clear-p2p-invoice-line" type="button">Clear</button>' : ''}
          </div>
        </form>
      `);
    }
    if (can('update_vendor_invoice') && p2pInvoiceEditable) {
      actions.push(`
        <form id="p2pInvoiceHeaderForm" class="form-grid">
          <input type="hidden" name="invoiceId" value="${h(p2pInvoice.id)}" />
          <label class="field">
            <span>Invoice number</span>
            <input name="invoiceNumber" value="${h(p2pInvoice.invoice_number)}" />
          </label>
          <label class="field">
            <span>Vendor</span>
            <select name="vendorId">
              ${(drawer.vendors || []).map((vendor) => `<option value="${h(vendor.id)}" ${vendor.id === p2pInvoice.vendor_id ? 'selected' : ''}>${h(vendor.name)} · ${h(vendor.code)}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Department</span>
            <select name="departmentId">
              ${(state.bootstrap?.lookups?.departments || []).map((dept) => `<option value="${h(dept.id)}" ${dept.id === p2pInvoice.department_id ? 'selected' : ''}>${h(dept.name)}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Facility</span>
            <select name="facilityId">
              ${(state.bootstrap?.lookups?.facilities || []).map((facility) => `<option value="${h(facility.id)}" ${facility.id === p2pInvoice.facility_id ? 'selected' : ''}>${h(facility.name)}</option>`).join('')}
            </select>
          </label>
          <label class="field" style="grid-column:1 / -1">
            <span>Notes</span>
            <textarea name="notes">${h(p2pInvoice.notes || '')}</textarea>
          </label>
          <div class="actions-row">
            <button class="primary" type="submit">Update Invoice</button>
          </div>
        </form>
      `);
    }
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">No invoice actions are available for this state.</div>';
  })() : '';
  const p2pRfqActions = p2pRfq ? (() => {
    const actions = [];
    if (can('send_rfq_request') && p2pRfq.status === 'DRAFT') actions.push(`<button class="ghost" data-action="p2p-send-rfq" data-id="${h(p2pRfq.id)}" type="button">Send RFQ</button>`);
    if (can('evaluate_rfq_request') && ['SENT', 'QUOTES_RECEIVED'].includes(p2pRfq.status)) actions.push(`<button class="ghost" data-action="p2p-evaluate-rfq" data-id="${h(p2pRfq.id)}" type="button">Evaluate</button>`);
    if (can('award_rfq_request') && ['EVALUATED', 'QUOTES_RECEIVED'].includes(p2pRfq.status)) {
      const awardQuoteId = drawer.p2pRfqDetail?.quotes?.[0]?.id || '';
      actions.push(`<button class="ghost" data-action="p2p-award-rfq" data-id="${h(p2pRfq.id)}" data-quote-id="${h(awardQuoteId)}" type="button">Award</button>`);
    }
    if (can('cancel_rfq_request') && ['DRAFT', 'SENT'].includes(p2pRfq.status)) actions.push(`<button class="ghost red" data-action="p2p-cancel-rfq" data-id="${h(p2pRfq.id)}" type="button">Cancel RFQ</button>`);
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">No RFQ actions are available for this state.</div>';
  })() : '';
  const p2pQuoteActions = p2pQuote ? (() => {
    const actions = [];
    if (can('submit_vendor_quote') && p2pQuote.status === 'DRAFT') actions.push(`<button class="ghost" data-action="p2p-submit-quote" data-id="${h(p2pQuote.id)}" type="button">Submit Quote</button>`);
    if (can('shortlist_vendor_quote') && ['SUBMITTED', 'SHORTLISTED'].includes(p2pQuote.status)) actions.push(`<button class="ghost" data-action="p2p-shortlist-quote" data-id="${h(p2pQuote.id)}" type="button">Shortlist</button>`);
    if (can('award_vendor_quote') && ['SUBMITTED', 'SHORTLISTED'].includes(p2pQuote.status)) actions.push(`<button class="ghost" data-action="p2p-award-quote" data-id="${h(p2pQuote.id)}" type="button">Award Quote</button>`);
    if (can('reject_vendor_quote') && ['DRAFT', 'SUBMITTED', 'SHORTLISTED'].includes(p2pQuote.status)) actions.push(`<button class="ghost red" data-action="p2p-reject-quote" data-id="${h(p2pQuote.id)}" type="button">Reject Quote</button>`);
    if (can('expire_vendor_quote') && !['AWARDED', 'EXPIRED'].includes(p2pQuote.status)) actions.push(`<button class="ghost red" data-action="p2p-expire-quote" data-id="${h(p2pQuote.id)}" type="button">Expire Quote</button>`);
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">No quote actions are available for this state.</div>';
  })() : '';
  const evidenceActions = evidenceRecord ? (() => {
    const actions = [];
    if (can('manage_evidence')) {
      actions.push(`
        <form id="evidenceLinkForm" class="form-grid">
          <input type="hidden" name="evidenceId" value="${h(evidenceRecord.id)}" />
          <label class="field">
            <span>Entity type</span>
            <input name="entityType" value="${h(evidenceRecord.entity_type)}" />
          </label>
          <label class="field">
            <span>Entity ID</span>
            <input name="entityId" value="${h(evidenceRecord.entity_id)}" />
          </label>
          <div class="actions-row">
            <button class="primary" type="submit">Link Evidence</button>
          </div>
        </form>
      `);
    }
    if (can('verify_evidence')) {
      actions.push(`<button class="ghost" data-action="verify-evidence" data-id="${h(evidenceRecord.id)}" data-decision="VERIFIED" type="button">Verify</button>`);
      actions.push(`<button class="ghost red" data-action="verify-evidence" data-id="${h(evidenceRecord.id)}" data-decision="REJECTED" type="button">Reject</button>`);
    }
    if (can('archive_evidence')) {
      actions.push(`<button class="ghost red" data-action="archive-evidence" data-id="${h(evidenceRecord.id)}" type="button">Archive</button>`);
    }
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">Evidence actions are read only for this role.</div>';
  })() : '';
  const receivingActions = receivingSession ? (() => {
    const actions = [];
    if (receivingSession.status === 'DRAFT' && can('start_receive_session')) {
      actions.push(`<button class="ghost" data-action="start-receive-session" data-id="${h(receivingSession.id)}" type="button">Start Session</button>`);
    }
    if (receivingSession.status === 'IN_PROGRESS' && can('receive_stock')) {
      const firstOpenLine = receivingSessionLines.find((line) => Number(line.qty_received || 0) + Number(line.qty_damaged || 0) + Number(line.qty_short || 0) < Number(line.qty_ordered || 0)) || receivingSessionLines[0];
      if (firstOpenLine) {
        actions.push(`
          <form id="receiveLineForm" class="form-grid">
            <input type="hidden" name="sessionId" value="${h(receivingSession.id)}" />
            <input type="hidden" name="purchaseOrderLineId" value="${h(firstOpenLine.purchase_order_line_id)}" />
            <label class="field">
              <span>Received</span>
              <input name="qtyReceived" type="number" min="0" step="1" value="0" />
            </label>
            <label class="field">
              <span>Damaged</span>
              <input name="qtyDamaged" type="number" min="0" step="1" value="0" />
            </label>
            <label class="field">
              <span>Short</span>
              <input name="qtyShort" type="number" min="0" step="1" value="0" />
            </label>
            <label class="field">
              <span>Bin</span>
              <input name="binId" value="${h(firstOpenLine.bin_id || '')}" placeholder="Optional bin ID" />
            </label>
            <label class="field" style="grid-column:1 / -1">
              <span>Note</span>
              <input name="note" placeholder="Receiving note or exception note" />
            </label>
            <div class="actions-row">
              <button class="primary" type="submit">Capture Line</button>
            </div>
          </form>
        `);
      }
      actions.push(`<button class="ghost" data-action="post-receive-session" data-id="${h(receivingSession.id)}" type="button">Post Receipt</button>`);
      actions.push(`
        <form id="receiveExceptionForm" class="form-grid">
          <input type="hidden" name="sessionId" value="${h(receivingSession.id)}" />
          <label class="field" style="grid-column:1 / -1">
            <span>Exception</span>
            <input name="reason" placeholder="Short ship, damage, mismatch, or hold reason" required />
          </label>
          <div class="actions-row">
            <button class="ghost red" type="submit">Record Exception</button>
          </div>
        </form>
      `);
    }
    if (['DRAFT', 'IN_PROGRESS'].includes(receivingSession.status) && can('cancel_receive_session')) {
      actions.push(`<button class="ghost red" data-action="cancel-receive-session" data-id="${h(receivingSession.id)}" type="button">Cancel Session</button>`);
    }
    return actions.length ? actions.join('') : '<div class="empty-state compact-empty">No receiving actions are available for this state.</div>';
  })() : '';
  return `
    <aside class="drawer-shell panel">
      <div class="drawer-tabs">
        ${tabs.map((tab) => `<button class="drawer-tab ${tab === activeTab ? 'active' : ''}" data-drawer-tab="${h(tab)}" type="button">${h(tab)}</button>`).join('')}
      </div>
      <div class="drawer-body">
        <div class="drawer-masthead">
          <div>
            <div class="eyebrow">Selected record</div>
            <h3>${h(drawer.detailTitle || 'Workspace record')}</h3>
            <p>${h(activeTab === 'AI help' ? 'Read-only guidance sourced from tenant state and backend rules.' : 'Details, actions, evidence, and audit trail stay tenant-scoped and permissioned.')}</p>
          </div>
          <div class="drawer-chip-stack">
            ${drawerSummaryChips.length ? drawerSummaryChips.map((line) => `<span class="chip">${h(line)}</span>`).join('') : '<span class="chip">No summary available</span>'}
          </div>
        </div>
        ${activeTab === 'Details' ? `
          <div class="drawer-stack">
            <div class="drawer-title">${h(drawer.detailTitle)}</div>
            ${drawer.detailLines.map((line) => `<p class="muted">${h(line)}</p>`).join('')}
            ${requestLines.length ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Request lines</div>
              ${requestLines.map((line) => `
                <div class="drawer-row">
                  <strong>${h(line.item_name || line.item_id)}</strong>
                  <span>${h(line.qty_requested)} requested · ${badge(line.status)}</span>
                </div>
              `).join('')}
            ` : ''}
            ${warehouseTaskLines.length ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Task lines</div>
              ${warehouseTaskLines.map((line) => `
                <div class="drawer-row">
                  <strong>${h(line.item_name || line.item_id)}</strong>
                  <span>${h(line.requested_quantity)} requested · ${h(line.picked_quantity)} picked · ${h(line.issued_quantity)} issued · ${badge(line.status)}</span>
                </div>
              `).join('')}
            ` : ''}
            ${procurementRequestLines.length ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Request lines</div>
              ${procurementRequestLines.map((line) => `
                <div class="drawer-row">
                  <strong>${h(line.item_name || line.item_id || line.description)}</strong>
                  <span>${h(line.qty_ordered || line.qty || line.qty_requested || 0)} requested · ${money(line.unit_price)} · ${badge(line.status)}</span>
                </div>
              `).join('')}
            ` : ''}
            ${procurementOrderLines.length ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Order lines</div>
              ${procurementOrderLines.map((line) => `
                <div class="drawer-row">
                  <strong>${h(line.item_name || line.item_id || line.description)}</strong>
                  <span>${h(line.qty_ordered)} ordered · ${money(line.unit_price)} · ${badge(line.status)}</span>
                </div>
              `).join('')}
            ` : ''}
            ${p2pInvoiceLines.length ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Invoice lines</div>
              ${p2pInvoiceLines.map((line) => `
                <div class="drawer-row">
                  <strong>${h(line.item_name || line.purchase_order_line_description || line.description)}</strong>
                  <span>${h(line.qty)} units · ${money(line.unit_price)} · ${badge(line.match_status)}</span>
                </div>
                <div class="drawer-row">
                  <span class="muted">${h(line.note || 'No line note')}</span>
                  ${can('update_vendor_invoice') && p2pInvoiceEditable ? `
                    <span class="actions-inline">
                      <button class="ghost small" type="button" data-action="edit-p2p-invoice-line" data-line-id="${h(line.id)}" data-item-id="${h(line.item_id || '')}" data-purchase-order-line-id="${h(line.purchase_order_line_id || '')}" data-description="${h(line.description || '')}" data-qty="${h(line.qty || 1)}" data-unit-price="${h(line.unit_price || 0)}">Edit</button>
                      <button class="ghost small red" type="button" data-action="delete-p2p-invoice-line" data-line-id="${h(line.id)}">Delete</button>
                    </span>
                  ` : ''}
                </div>
              `).join('')}
            ` : ''}
            ${p2pInvoiceExtractionRuns.length ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Extraction panel</div>
              <div class="drawer-row">
                <strong>Status</strong>
                <span>${h(p2pInvoiceDetail.vendorInvoice.extraction_status)} · ${h(Number(p2pInvoiceDetail.vendorInvoice.extraction_confidence || 0).toFixed(2))}</span>
              </div>
              <div class="drawer-row">
                <strong>Provider</strong>
                <span>${h(p2pInvoiceDetail.vendorInvoice.extraction_provider)} · ${h(p2pInvoiceExtractionRuns[0]?.provider_status || 'NOT_CONFIGURED')}</span>
              </div>
              <div class="drawer-row">
                <strong>Proposed total</strong>
                <span>${money(Number(safeJsonParse(p2pInvoiceExtractionRuns[0]?.response_payload_json).proposed_total_amount || p2pInvoiceDetail.vendorInvoice.total_amount || 0))}</span>
              </div>
              <div class="drawer-row">
                <strong>Confidence</strong>
                <span>${h(Number(safeJsonParse(p2pInvoiceExtractionRuns[0]?.response_payload_json).confidence || p2pInvoiceDetail.vendorInvoice.extraction_confidence || 0).toFixed(2))}</span>
              </div>
            ` : ''}
            ${p2pInvoiceMatchResults.length ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Matching panel</div>
              <div class="drawer-row">
                <strong>Status</strong>
                <span>${h(p2pInvoiceDetail.vendorInvoice.match_status)} · ${h(Number(p2pInvoiceDetail.vendorInvoice.match_confidence || 0).toFixed(2))}</span>
              </div>
              <div class="drawer-row">
                <strong>Summary</strong>
                <span>${h(p2pInvoiceDetail.vendorInvoice.match_summary || p2pInvoiceMatchResults[0]?.summary || 'Pending review')}</span>
              </div>
              <div class="drawer-row">
                <strong>Mode</strong>
                <span>${h(p2pInvoiceDetail.vendorInvoice.match_mode)} · ${h(p2pInvoiceMatchResults[0]?.blocker_count || 0)} blocker(s)</span>
              </div>
            ` : ''}
            ${p2pInvoiceExceptions.length ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Exception queue</div>
              ${p2pInvoiceExceptions.map((exception) => `
                <div class="drawer-row">
                  <strong>${h(exception.code)}</strong>
                  <span>${h(exception.message)} · ${badge(exception.waived_at ? 'WAIVED' : exception.severity)}</span>
                </div>
                <div class="muted">${h(exception.expected_value || 'Expected value not captured')} · ${h(exception.actual_value || 'Actual value not captured')}</div>
              `).join('')}
            ` : ''}
            ${p2pInvoiceApprovalEvents.length ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Approval trail</div>
              ${p2pInvoiceApprovalEvents.map((event) => `
                <div class="drawer-row">
                  <strong>${h(event.event_type)}</strong>
                  <span>${h(event.reason || 'No reason recorded')} · ${fmt(event.created_at)}</span>
                </div>
              `).join('')}
            ` : ''}
            ${p2pRfqLines.length ? `
              <div class="section-divider"></div>
              <div class="drawer-title">RFQ lines</div>
              ${p2pRfqLines.map((line) => `
                <div class="drawer-row">
                  <strong>${h(line.item_name || line.description)}</strong>
                  <span>${h(line.qty)} requested · target ${money(line.target_unit_price)} · ${badge(line.status)}</span>
                </div>
              `).join('')}
            ` : ''}
            ${p2pQuoteLines.length ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Quote lines</div>
              ${p2pQuoteLines.map((line) => `
                <div class="drawer-row">
                  <strong>${h(line.item_name || line.rfq_line_description || line.description)}</strong>
                  <span>${h(line.qty)} quoted · ${money(line.unit_price)} · ${badge(line.status)}</span>
                </div>
              `).join('')}
            ` : ''}
            ${procurementVendor ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Scorecard</div>
              <div class="drawer-row">
                <strong>Average score</strong>
                <span>${h(Number(drawer.procurementVendorDetail?.averageScore || 0).toFixed(1))}</span>
              </div>
              ${(drawer.procurementVendorDetail?.scoreRows || []).slice(0, 4).map((row) => `
                <div class="drawer-row">
                  <strong>${h(row.score_type)}</strong>
                  <span>${h(row.score_value)} · ${fmt(row.scored_at)} · ${h(row.source || '')}</span>
                </div>
              `).join('')}
            ` : ''}
            ${exportBatch ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Export payload</div>
              <div class="drawer-row">
                <strong>Validation</strong>
                <span>${h(exportBatch.validation_summary || 'No validation summary yet')}</span>
              </div>
              <div class="drawer-row">
                <strong>Open errors</strong>
                <span>${h(exportBatchErrors.filter((row) => row.severity === 'ERROR').length)}</span>
              </div>
              <div class="drawer-row">
                <strong>Warnings</strong>
                <span>${h(exportBatchErrors.filter((row) => row.severity !== 'ERROR').length)}</span>
              </div>
              <div class="drawer-row">
                <strong>Payload hash</strong>
                <span>${h(exportBatch.generated_payload_hash || 'Not generated')}</span>
              </div>
              <div class="drawer-row">
                <strong>Payload format</strong>
                <span>${h(exportBatch.generated_payload_format || exportBatch.format || 'CSV')}</span>
              </div>
              <div class="drawer-row">
                <strong>Evidence links</strong>
                <span>${h(exportBatchEvidence.length)}</span>
              </div>
            ` : ''}
            ${exportError ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Validation issue</div>
              <div class="drawer-row">
                <strong>${h(exportError.code)}</strong>
                <span>${h(exportError.message)}</span>
              </div>
              <div class="drawer-row">
                <strong>Entity</strong>
                <span>${h(exportError.entity_type)} · ${h(exportError.entity_id)}</span>
              </div>
              <div class="drawer-row">
                <strong>State</strong>
                <span>${h(exportError.status)} · ${h(exportError.severity)}</span>
              </div>
            ` : ''}
            ${integrationConnection ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Integration connection</div>
              <div class="drawer-row"><strong>Provider</strong><span>${h(integrationConnection.provider_name)}</span></div>
              <div class="drawer-row"><strong>Status</strong><span>${h(integrationConnection.status)}</span></div>
              <div class="drawer-row"><strong>Auth mode</strong><span>${h(integrationConnection.auth_mode)}</span></div>
              <div class="drawer-row"><strong>Endpoint</strong><span>${h(integrationConnection.endpoint_label || '')}</span></div>
              <div class="drawer-row"><strong>Has secret</strong><span>${integrationConnection.has_secret ? 'Yes' : 'No'}</span></div>
              <div class="drawer-row"><strong>Last error</strong><span>${h(integrationConnection.last_error || 'None')}</span></div>
            ` : ''}
            ${integrationJob ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Integration job</div>
              <div class="drawer-row"><strong>Integration</strong><span>${h(integrationJob.provider_name || integrationJob.integration_key)}</span></div>
              <div class="drawer-row"><strong>Status</strong><span>${h(integrationJob.status)}</span></div>
              <div class="drawer-row"><strong>Retries</strong><span>${h(integrationJob.retry_count)}</span></div>
              <div class="drawer-row"><strong>Attempts</strong><span>${h(integrationJob.attempt_count)}</span></div>
              <div class="drawer-row"><strong>Batch</strong><span>${h(integrationJob.batch_no || integrationJob.export_batch_id || 'Unlinked')}</span></div>
              <div class="drawer-row"><strong>Queued</strong><span>${h(integrationJob.queued_at || 'Not queued')}</span></div>
            ` : ''}
            ${reportRun ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Report run</div>
              <div class="drawer-row"><strong>Report</strong><span>${h(reportRun.report_title)}</span></div>
              <div class="drawer-row"><strong>Surface</strong><span>${h(reportRun.surface)} · ${h(reportRun.format)}</span></div>
              <div class="drawer-row"><strong>Status</strong><span>${badge(reportRun.status)}</span></div>
              <div class="drawer-row"><strong>Rows</strong><span>${h(reportRun.row_count)}</span></div>
              <div class="drawer-row"><strong>Exports</strong><span>${h(reportRunExports.length)}</span></div>
              ${reportRunRows.length && reportRunColumns.length ? `
                <div class="section-divider"></div>
                <div class="drawer-title">Preview rows</div>
                <div class="table-wrap">
                  ${table(reportRunRows.slice(0, 5), reportRunColumns.map((column) => column.label || column.key), (row) => `
                    <tr>
                      ${reportRunColumns.map((column) => `<td>${h(row[column.key])}</td>`).join('')}
                    </tr>
                  `)}
                </div>
              ` : '<div class="empty-state compact-empty">No preview rows are available for this report run.</div>'}
            ` : ''}
            ${exportSummary ? `
              <div class="section-divider"></div>
              <div class="drawer-title">Readiness</div>
              <div class="drawer-row"><strong>Readiness</strong><span>${h(exportSummary.readiness ?? 0)}</span></div>
              <div class="drawer-row"><strong>Exportable records</strong><span>${h((exportSummary.exportableOrders || 0) + (exportSummary.exportableReceipts || 0))}</span></div>
              <div class="drawer-row"><strong>Integrations</strong><span>${h(integrationSummary.connections || 0)} connection(s)</span></div>
            ` : ''}
          </div>
        ` : ''}
        ${activeTab === 'Actions' ? `
          <div class="drawer-stack">
            <div class="drawer-title">${request ? 'Request actions' : warehouseTask ? 'Warehouse task actions' : procurementRequest ? 'Purchase request actions' : procurementOrder ? 'Purchase order actions' : procurementVendor ? 'Vendor actions' : procurementContract ? 'Contract actions' : procurementBudget ? 'Budget actions' : procurementWaiver ? 'Waiver details' : p2pInvoice ? 'Invoice actions' : p2pRfq ? 'RFQ actions' : p2pQuote ? 'Quote actions' : exportBatch ? 'Export actions' : integrationJob ? 'Integration actions' : integrationConnection ? 'Integration connection' : evidenceRecord ? 'Evidence actions' : receivingSession ? 'Receiving actions' : 'Real actions only'}</div>
            <div class="drawer-action-list">
              ${requestActions || ''}
              ${warehouseTaskActions || ''}
              ${procurementVendorActions || ''}
              ${procurementContractActions || ''}
              ${procurementBudgetActions || ''}
              ${procurementWaiverActions || ''}
              ${procurementRequestActions || ''}
              ${procurementOrderActions || ''}
              ${p2pInvoiceActions || ''}
              ${p2pRfqActions || ''}
              ${p2pQuoteActions || ''}
              ${exportBatchActions || ''}
              ${exportErrorActions || ''}
              ${integrationConnectionActions || ''}
              ${integrationJobActions || ''}
              ${reportRunActions || ''}
              ${evidenceActions || ''}
              ${receivingActions || ''}
              <button class="ghost" data-action="refresh" type="button">Refresh data</button>
              <button class="ghost" data-page="Audit Black Box" type="button">Open Audit Trail</button>
              <button class="ghost" data-page="Compliance Center" type="button">Open compliance</button>
              ${state.bootstrap?.session ? `<button class="ghost" data-action="logout" type="button">Sign out</button>` : ''}
            </div>
            ${request?.status === 'SUBMITTED' && requestOwnedOrPrivileged && can('reject_request') ? `
              <form id="drawerRejectForm" class="form-grid">
                <input type="hidden" name="requestId" value="${h(request.id)}" />
                <label class="field" style="grid-column:1 / -1">
                  <span>Reject reason</span>
                  <input name="reason" placeholder="Explain why the request is rejected" required />
                </label>
                <div class="actions-row">
                  <button class="ghost red" type="submit">Reject</button>
                </div>
              </form>
            ` : ''}
            <p class="muted">${request ? 'Actions shown here are backed by real request lifecycle endpoints.' : warehouseTask ? 'Warehouse actions write through task-specific backend endpoints only.' : procurementRequest ? 'Purchase request actions are backend-authorized and tenant-scoped.' : procurementOrder ? 'Purchase order actions remain server-controlled until receiving lands later.' : procurementVendor ? 'Vendor actions update the tenant master only through backend validation.' : procurementContract ? 'Contract actions remain tenant-scoped and audit-logged.' : procurementBudget ? 'Budget actions update live budget posture and log every waiver or edit.' : procurementWaiver ? 'Waivers are server-authored and immutable once approved.' : p2pInvoice ? 'Invoice actions are permissioned, tenant-scoped, and audit-logged.' : p2pRfq ? 'RFQ actions are governed by backend sourcing rules.' : p2pQuote ? 'Quote actions stay source-backed and tenant-scoped.' : exportBatch ? 'Export actions are permissioned, tenant-scoped, and never claim external ERP success.' : integrationJob ? 'Integration jobs can only be retried or cancelled by the backend. No external acknowledgement is fabricated.' : integrationConnection ? 'Integration connection records remain read only here and never expose secrets.' : evidenceRecord ? 'Evidence actions stay permissioned and audit-logged.' : receivingSession ? 'Receiving actions are permissioned, tenant-scoped, and posting-only for stock movement.' : 'Future workflow actions stay disabled until the backend contract exists.'}</p>
          </div>
        ` : ''}
        ${activeTab === 'Evidence' ? `
          <div class="drawer-stack">
            <div class="drawer-title">Evidence</div>
            ${p2pInvoice ? `
              ${(p2pInvoiceDocs).length ? p2pInvoiceDocs.slice(0, 4).map((doc) => `
                <div class="drawer-row">
                  <strong>${h(doc.file_name)}</strong>
                  <span>${h(doc.entity_type)} · ${h(doc.entity_id)}</span>
                </div>
              `).join('') : '<div class="empty-state compact-empty">No evidence linked to this invoice yet.</div>'}
            ` : p2pRfq ? `
              ${(p2pRfqDocs).length ? p2pRfqDocs.slice(0, 4).map((doc) => `
                <div class="drawer-row">
                  <strong>${h(doc.file_name)}</strong>
                  <span>${h(doc.entity_type)} · ${h(doc.entity_id)}</span>
                </div>
              `).join('') : '<div class="empty-state compact-empty">No evidence linked to this RFQ yet.</div>'}
            ` : p2pQuote ? `
              ${(p2pQuoteDocs).length ? p2pQuoteDocs.slice(0, 4).map((doc) => `
                <div class="drawer-row">
                  <strong>${h(doc.file_name)}</strong>
                  <span>${h(doc.entity_type)} · ${h(doc.entity_id)}</span>
                </div>
              `).join('') : '<div class="empty-state compact-empty">No evidence linked to this quote yet.</div>'}
            ` : exportBatch ? `
              ${exportBatchEvidence.length ? exportBatchEvidence.map((link) => `
                <div class="drawer-row">
                  <strong>${h(link.file_name)}</strong>
                  <span>${h(link.entity_type)} · ${h(link.entity_id)} · ${h(link.link_type)}</span>
                </div>
              `).join('') : '<div class="empty-state compact-empty">No evidence is linked to this export batch yet.</div>'}
            ` : evidenceRecord ? `
              <div class="drawer-row">
                <strong>${h(evidenceRecord.file_name)}</strong>
                <span>${h(evidenceRecord.entity_type)} · ${h(evidenceRecord.entity_id)}</span>
              </div>
              <div class="drawer-row">
                <strong>State</strong>
                <span>${h(evidenceRecord.evidence_state)} · ${h(evidenceRecord.checksum_algorithm || 'No checksum')}</span>
              </div>
              ${drawer.evidenceDetail?.links?.length ? drawer.evidenceDetail.links.map((link) => `
                <div class="drawer-row">
                  <strong>${h(link.entity_type)}</strong>
                  <span>${h(link.entity_id)} · ${h(link.link_type)}</span>
                </div>
              `).join('') : '<div class="empty-state compact-empty">No evidence links loaded for this record.</div>'}
            ` : procurementContract ? `
              ${(procurementContractDocs).length ? procurementContractDocs.slice(0, 4).map((doc) => `
              <div class="drawer-row">
                <strong>${h(doc.file_name)}</strong>
                <span>${h(doc.entity_type)} · ${h(doc.entity_id)}</span>
              </div>
            `).join('') : '<div class="empty-state compact-empty">No evidence linked to this contract yet.</div>'}
            ` : procurementBudget ? `
              ${(procurementBudgetDocs).length ? procurementBudgetDocs.slice(0, 4).map((doc) => `
              <div class="drawer-row">
                <strong>${h(doc.file_name)}</strong>
                <span>${h(doc.entity_type)} · ${h(doc.entity_id)}</span>
              </div>
            `).join('') : '<div class="empty-state compact-empty">No evidence linked to this budget yet.</div>'}
            ` : `
              ${(procurementRequest ? procurementRequestDocs : procurementOrder ? procurementOrderDocs : procurementVendor ? procurementVendorDocs : warehouseTask ? warehouseTaskDocuments : requestDocuments).length ? (procurementRequest ? procurementRequestDocs : procurementOrder ? procurementOrderDocs : procurementVendor ? procurementVendorDocs : warehouseTask ? warehouseTaskDocuments : requestDocuments).slice(0, 4).map((doc) => `
              <div class="drawer-row">
                <strong>${h(doc.file_name)}</strong>
                <span>${h(doc.entity_type)} · ${h(doc.entity_id)}</span>
              </div>
            `).join('') : `<div class="empty-state compact-empty">${procurementRequest ? 'No evidence linked to this purchase request.' : procurementOrder ? 'No evidence linked to this purchase order.' : procurementVendor ? 'No evidence linked to this vendor.' : request ? 'No evidence linked to this request.' : warehouseTask ? 'No evidence linked to this warehouse task.' : 'No evidence loaded for this tenant context.'}</div>`}
            `}
          </div>
        ` : ''}
        ${activeTab === 'Receiving' ? `
          <div class="drawer-stack">
            <div class="drawer-title">Receiving</div>
            ${receivingSession ? `
              <div class="drawer-row">
                <strong>${h(receivingSession.po_no || receivingSession.purchase_order_id)}</strong>
                <span>${h(receivingSession.status)} · ${h(receivingSession.purchase_order_status || '')}</span>
              </div>
              ${receivingSessionLines.length ? receivingSessionLines.map((line) => `
                <div class="drawer-row">
                  <strong>${h(line.item_name || line.description || line.item_id)}</strong>
                  <span>${h(line.qty_received || 0)}/${h(line.qty_ordered || 0)} received · ${h(line.qty_damaged || 0)} damaged · ${h(line.qty_short || 0)} short · ${badge(line.status)}</span>
                </div>
              `).join('') : '<div class="empty-state compact-empty">No receive lines loaded.</div>'}
              ${drawer.receivingDetail?.movements?.length ? `
                <div class="section-divider"></div>
                <div class="drawer-title">Receipt movements</div>
                ${drawer.receivingDetail.movements.slice(0, 5).map((movement) => `
                  <div class="drawer-row">
                    <strong>${h(movement.item_name || movement.item_id)}</strong>
                    <span>${h(movement.movement_type)} · ${h(movement.quantity)} · ${h(movement.bin_code || 'Unassigned')}</span>
                  </div>
                `).join('')}
              ` : ''}
            ` : `<div class="empty-state compact-empty">Select a receiving session to inspect its lines, posting posture, and movement trail.</div>`}
          </div>
        ` : ''}
        ${activeTab === 'Audit trail' ? `
          <div class="drawer-stack">
            <div class="drawer-title">Recent audit trail</div>
            ${(reportRun ? reportRunAudit : exportBatch ? exportBatchAudit : integrationConnection ? integrationConnectionAudit : integrationJob ? integrationJobAudit : evidenceRecord ? evidenceAudit : receivingSession ? receivingAudit : p2pInvoice ? p2pInvoiceAudit : p2pRfq ? p2pRfqAudit : p2pQuote ? p2pQuoteAudit : procurementContract ? procurementContractAudit : procurementBudget ? procurementBudgetAudit : procurementWaiver ? procurementWaiverAudit : procurementRequest ? procurementRequestAudit : procurementOrder ? procurementOrderAudit : procurementVendor ? procurementVendorAudit : warehouseTask ? warehouseTaskAudit : requestAudit).length ? (reportRun ? reportRunAudit : exportBatch ? exportBatchAudit : integrationConnection ? integrationConnectionAudit : integrationJob ? integrationJobAudit : evidenceRecord ? evidenceAudit : receivingSession ? receivingAudit : p2pInvoice ? p2pInvoiceAudit : p2pRfq ? p2pRfqAudit : p2pQuote ? p2pQuoteAudit : procurementContract ? procurementContractAudit : procurementBudget ? procurementBudgetAudit : procurementWaiver ? procurementWaiverAudit : procurementRequest ? procurementRequestAudit : procurementOrder ? procurementOrderAudit : procurementVendor ? procurementVendorAudit : warehouseTask ? warehouseTaskAudit : requestAudit).slice(0, 5).map((row) => `
              <div class="drawer-row">
                <strong>${h(row.action)}</strong>
                <span>${h(row.summary)} · ${fmt(row.created_at)}</span>
              </div>
            `).join('') : `<div class="empty-state compact-empty">${reportRun ? 'No audit records for this report run yet.' : exportBatch ? 'No audit records for this export batch yet.' : integrationConnection ? 'No audit records for this integration connection yet.' : integrationJob ? 'No audit records for this integration job yet.' : evidenceRecord ? 'No audit records for this evidence record yet.' : receivingSession ? 'No audit records for this receiving session yet.' : p2pInvoice ? 'No audit records for this invoice yet.' : p2pRfq ? 'No audit records for this RFQ yet.' : p2pQuote ? 'No audit records for this quote yet.' : procurementContract ? 'No audit records for this contract yet.' : procurementBudget ? 'No audit records for this budget yet.' : procurementWaiver ? 'No audit records for this waiver yet.' : procurementRequest ? 'No audit records for this purchase request yet.' : procurementOrder ? 'No audit records for this purchase order yet.' : procurementVendor ? 'No audit records for this vendor yet.' : request ? 'No audit records for this request yet.' : warehouseTask ? 'No audit records for this task yet.' : 'No audit records loaded.'}</div>`}
          </div>
        ` : ''}
        ${activeTab === 'AI help' ? `
          <div class="drawer-stack">
            <div class="drawer-title">Read-only AI help</div>
            ${aiHelp.map((hint) => `<p class="muted">${h(hint)}</p>`).join('')}
            <div class="empty-state compact-empty">AI execution remains disabled. It cannot perform procurement, export, or integration actions from the drawer.</div>
          </div>
        ` : ''}
      </div>
    </aside>
  `;
}

export function shellLanding() {
  const model = buildLandingModel();
  return `
    <div class="workspace-shell shell-shell">
      <div class="workspace-stage shell-stage">
        ${hero()}
        ${landingSection(
          'Operational Summary',
          'Operational summary across inventory, warehouse, procurement, receiving, finance readiness, evidence, and compliance posture.',
          shellKpis()
        )}
        ${landingSection(
          'Executive Briefing',
          'A concise view of workload, risk, and readiness from live tenant data.',
          executiveBriefing(model)
        )}
        ${landingSection(
          'Operational Work Queue',
          'Items that need the current role’s attention now. Click any record to inspect it in the drawer.',
          model.queues.length ? `<div class="landing-grid">${model.queues.map((item) => landingCard(item)).join('')}</div>` : '<div class="empty-state compact-empty">No actions are currently assigned to this tenant role.</div>'
        )}
        ${landingSection(
          'Exceptions & Risk Signals',
          'Operational exceptions, low stock, export blockers, and offline conflicts surfaced without invented counts.',
          model.exceptions.length ? `<div class="landing-grid">${model.exceptions.map((item) => landingCard(item, 'danger-tone')).join('')}</div>` : '<div class="empty-state compact-empty">No exceptions are currently loaded.</div>'
        )}
        ${landingSection(
          'Pending approvals',
          'Requests and purchase requests waiting for the next human decision.',
          model.approvals.length ? `<div class="landing-grid">${model.approvals.map((item) => landingCard(item)).join('')}</div>` : '<div class="empty-state compact-empty">No approvals are pending in this tenant scope.</div>'
        )}
        ${landingSection(
          'Product readiness',
          'Security, audit, offline, integration, and delivery posture from actual seeded and computed data.',
          productReadiness(model)
        )}
        ${landingSection(
          'Controlled Facility Advantage',
          'Commercial strengths evaluators look for in controlled-facility operations.',
          controlledFacilityAdvantage(model)
        )}
        ${landingSection(
          'Offline / sync posture',
          'Supervisor-reviewed batches and conflict review posture from the live tenant.',
          model.posture.length ? `<div class="landing-grid">${model.posture.map((item) => landingCard(item)).join('')}</div>` : '<div class="empty-state compact-empty">No offline or sync posture data is currently available.</div>'
        )}
        ${landingSection(
          'Governance & evidence posture',
          'Evidence and audit readiness, tied to the records the backend already knows about.',
          dataReadyHtml(model)
        )}
        ${landingSection(
          'Finance readiness',
          'Finance handoff and control readiness that only reflects server-returned state.',
          model.exportReadiness.length ? `<div class="landing-grid">${model.exportReadiness.map((item) => landingCard(item)).join('')}</div>` : '<div class="empty-state compact-empty">Export and compliance readiness is not configured for this tenant.</div>'
        )}
        ${landingSection(
          'Recently changed records',
          'Recent immutable activity from the audit log.',
          model.recent.length ? `<div class="timeline">${model.recent.slice(0, 6).map((item) => `
            <div class="timeline-row" data-drawer-focus="${h(item.focus.type)}" data-drawer-id="${h(item.focus.id)}" data-drawer-open="true">
              <div class="timeline-dot"></div>
              <div>
                <strong>${h(item.kind)}</strong>
                <span>${h(item.detail)}</span>
              </div>
            </div>
          `).join('')}</div>` : '<div class="empty-state compact-empty">No audit changes are loaded for this tenant yet.</div>'
        )}
        ${landingSection(
          'AI Operations',
          'AI is governed and read-only. Recommendations are system-generated insights — no autonomous action or write access.',
          `<div class="landing-grid">${model.aiHints.map((hint, index) => `
            <article class="landing-card ai-card">
              <div class="eyebrow">AI brief ${index + 1}</div>
              <p>${h(hint)}</p>
            </article>
          `).join('')}</div>`
        )}
      </div>
      ${shellDrawer()}
    </div>
  `;
}

function executiveBriefing(model) {
  const summary = shellSummary();
  const aiSummary = state.data?.aiSummary || {};
  const briefing = [
    { kind: 'Workload', title: 'Operational work queue', detail: `${model.queues.length + model.approvals.length} active item(s) need attention`, focus: { type: 'tenant', id: 'current' } },
    { kind: 'Inventory', title: 'Inventory risk', detail: summary.lowStock > 0 ? `${summary.lowStock} low-stock item(s)` : 'No stock risk flagged', focus: { type: 'inventory-summary', id: 'current' } },
    { kind: 'Procurement', title: 'Procurement & receiving', detail: `${summary.purchaseQueue} purchase item(s) · ${summary.receivingExceptions} receiving exception(s)`, focus: { type: 'purchase-request', id: model.approvals[0]?.focus?.id || 'current' } },
    { kind: 'Supplier', title: 'Supplier governance', detail: `${summary.supplierRiskFlags} supplier risk flag(s) · ${summary.expiringContracts} expiring contract(s)`, focus: { type: 'vendor', id: 'current' } },
    { kind: 'Budget', title: 'Budget posture', detail: `${summary.budgetPressure} budget warning(s) · ${summary.waiverCount} waiver(s)`, focus: { type: 'budget-control', id: 'current' } },
    { kind: 'Finance', title: 'Finance readiness', detail: summary.financeExportCandidates > 0 ? `${summary.financeExportCandidates} export candidate record(s)` : 'No export candidate records', focus: { type: 'export-summary', id: 'current' } },
    { kind: 'DeviceOps', title: 'Device trust posture', detail: `${summary.deviceTrusted} trusted · ${summary.deviceReview} under review`, focus: { type: 'device', id: 'current' } },
    { kind: 'OfflineOps', title: 'Offline sync posture', detail: `${summary.offlineBatches} batch(es) pending review`, focus: { type: 'offline-summary', id: 'current' } },
    { kind: 'Governance', title: 'Compliance posture', detail: `${summary.auditCoverage}% audit coverage · ${summary.evidenceAttached}% evidence linked`, focus: { type: 'audit-summary', id: 'current' } },
    { kind: 'AI Operations', title: 'AI recommendations', detail: aiSummary.open ?? 0 ? `${aiSummary.open} recommendation(s) open` : 'Read-only AI governance active', focus: { type: 'ai-summary', id: 'current' } }
  ];
  return `<div class="landing-grid">${briefing.map((item) => landingCard(item)).join('')}</div>`;
}

function productReadiness(model) {
  const summary = shellSummary();
  const controls = state.data?.compliance?.controls || [];
  const integrationJobs = state.data?.integrations?.jobs?.jobs || [];
  const cards = [
    { kind: 'Platform', title: 'Workspace status', detail: `${summary.workspaceEnvironment} · ${summary.workspacePlan} · ${summary.workspaceStatus}`, focus: { type: 'tenant', id: 'current' } },
    { kind: 'Security', title: 'Security controls', detail: 'Tenant isolation, RBAC, and scope enforcement are server-owned', focus: { type: 'compliance-summary', id: 'current' } },
    { kind: 'Audit', title: 'Audit coverage', detail: `${summary.auditCoverage}% of critical writes covered`, focus: { type: 'audit-summary', id: 'current' } },
    { kind: 'Evidence', title: 'Evidence coverage', detail: `${summary.evidenceAttached}% linked to records`, focus: { type: 'evidence-summary', id: 'current' } },
    { kind: 'Supplier', title: 'Supplier governance', detail: `${summary.supplierRiskFlags} risk flag(s) · ${summary.expiringContracts} expiring contract(s)`, focus: { type: 'vendor', id: 'current' } },
    { kind: 'Budget', title: 'Budget control', detail: `${summary.budgetPressure} budget warning(s) · ${summary.waiverCount} waiver(s)`, focus: { type: 'budget-control', id: 'current' } },
    { kind: 'Offline', title: 'Offline readiness', detail: `${summary.offlineBatches} batch(es) staged for review`, focus: { type: 'offline-summary', id: 'current' } },
    { kind: 'Integration', title: 'Integration readiness', detail: `${summary.integrationHealth} · ${integrationJobs.length} job record(s)`, focus: { type: 'integration-summary', id: 'current' } },
    { kind: 'Compliance', title: 'Control registry', detail: controls.length ? `${controls.length} active control(s)` : 'Not configured', focus: { type: 'compliance-control', id: 'current' } },
    { kind: 'AI governance', title: 'AI posture', detail: `${summary.aiGovernance} · recommendations remain read-only`, focus: { type: 'ai-summary', id: 'current' } }
  ];
  return `<div class="landing-grid">${cards.map((item) => landingCard(item)).join('')}</div>`;
}

function controlledFacilityAdvantage(model) {
  const summary = shellSummary();
  const aiSummary = state.data?.aiSummary || {};
  const cards = [
    { kind: 'Offline-first', title: 'Offline-first execution readiness', detail: `${summary.offlineBatches} batch(es) staged before posting`, focus: { type: 'offline-summary', id: 'current' } },
    { kind: 'Audit-backed', title: 'Evidence-backed audit trail', detail: `${summary.auditCoverage}% of critical writes are covered`, focus: { type: 'audit-summary', id: 'current' } },
    { kind: 'Scoped control', title: 'Tenant/facility/department isolation', detail: `${summary.facilities} facilities · ${summary.departments} departments`, focus: { type: 'tenant', id: 'current' } },
    { kind: 'Device trust', title: 'Device trust and scan governance', detail: `${summary.deviceTrusted} trusted devices · ${summary.deviceReview} under review`, focus: { type: 'device', id: 'current' } },
    { kind: 'Chain', title: 'Procurement-to-receiving-to-finance chain', detail: `${summary.purchaseQueue} procurement items · ${summary.receivingExceptions} receiving exceptions`, focus: { type: 'purchase-request', id: model.approvals[0]?.focus?.id || 'current' } },
    { kind: 'Governed AI', title: 'Governed AI with no autonomous writes', detail: aiSummary.providerStatus === 'NOT_CONFIGURED' ? 'Read-only deterministic posture' : `${aiSummary.providerStatus} · human approval required`, focus: { type: 'ai-summary', id: 'current' } },
    { kind: 'Restricted workspace', title: 'Restricted workspace controls', detail: 'Evostel remains server-denied where modules are disabled', focus: { type: 'tenant', id: 'current' } },
    { kind: 'ERP-ready', title: 'ERP-ready export posture', detail: `${summary.financeExportCandidates} export candidate record(s) ready for validation`, focus: { type: 'export-summary', id: 'current' } }
  ];
  return `<div class="landing-grid">${cards.map((item) => landingCard(item)).join('')}</div>`;
}

function dataReadyHtml(model) {
  const summary = shellSummary();
  const cards = [
    { kind: 'Audit', title: 'Coverage', detail: countLabel(summary.auditCoverage) === 'Not configured' ? 'Not configured' : `${summary.auditCoverage}% of critical writes`, focus: { type: 'audit-summary', id: 'current' } },
    { kind: 'Evidence', title: 'Coverage', detail: countLabel(summary.evidenceAttached) === 'Not configured' ? 'Not configured' : `${summary.evidenceAttached}% evidence linked`, focus: { type: 'evidence-summary', id: 'current' } },
    { kind: 'Compliance', title: 'Controls', detail: model.exportReadiness.length ? `${model.exportReadiness.length} control card(s)` : 'Not configured', focus: { type: 'compliance-summary', id: 'current' } }
  ];
  return `<div class="landing-grid">${cards.map((item) => landingCard(item)).join('')}</div>`;
}

function platformSummary() {
  return state.platformData?.summary || {};
}

function platformTenants() {
  return state.platformData?.tenants || [];
}

function selectedPlatformTenant() {
  if (!state.platformTenantId) return platformTenants()[0] || null;
  return state.platformData?.tenantDetail?.tenant || platformTenants().find((tenant) => tenant.id === state.platformTenantId) || null;
}

function platformShellKpis() {
  const summary = platformSummary();
  const cards = [
    ['Workspaces', summary.totalTenants ?? 0, 'All managed workspaces'],
    ['Active Plans', summary.activeTenants ?? 0, 'Commercial plans in force'],
    ['Restricted', summary.restrictedTenants ?? 0, 'Limited module surfaces'],
    ['Support Requested', summary.requestedSupportSessions ?? 0, 'Waiting on support action'],
    ['Support Active', summary.activeSupportSessions ?? 0, 'Open platform support'],
    ['Healthy', summary.healthyTenants ?? 0, 'Configured platform posture'],
    ['Security Events', summary.securityEvents ?? 0, 'Recorded in control plane'],
    ['Audit Events', summary.auditEvents ?? 0, 'Platform activity log']
  ];
  return `
    <section class="kpi-grid shell-kpi-grid">
      ${cards.map(([label, value, detail]) => `
        <article class="panel kpi">
          <div class="kpi-label">${h(label)}</div>
          <div class="kpi-value">${h(value)}</div>
          <div class="kpi-detail">${h(detail)}</div>
        </article>
      `).join('')}
    </section>
  `;
}

function platformSidebar() {
  const groups = visiblePlatformNavigationGroups();
  const identity = platformIdentity() || {};
  const summary = platformSummary();
  return `
    <aside class="sidebar platform-sidebar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" role="img" focusable="false" aria-hidden="true">
            <defs>
              <linearGradient id="opstraxPlatformMarkShell" x1="8" y1="8" x2="40" y2="40" gradientUnits="userSpaceOnUse">
                <stop stop-color="#9be7ff"/>
                <stop offset="0.5" stop-color="#5b8cff"/>
                <stop offset="1" stop-color="#14b8a6"/>
              </linearGradient>
            </defs>
            <rect x="8" y="8" width="32" height="32" rx="12" fill="rgba(255,255,255,.05)" stroke="url(#opstraxPlatformMarkShell)" stroke-width="1.4"/>
            <path d="M14 25.5C17 19 22 15 28.7 15c4.2 0 7.4 1.4 9.9 4.2" fill="none" stroke="url(#opstraxPlatformMarkShell)" stroke-width="2.1" stroke-linecap="round"/>
            <path d="M34 22.5C31 29 26 33 19.3 33c-4.2 0-7.4-1.4-9.9-4.2" fill="none" stroke="url(#opstraxPlatformMarkShell)" stroke-width="2.1" stroke-linecap="round" opacity=".92"/>
            <circle cx="24" cy="24" r="4.1" fill="url(#opstraxPlatformMarkShell)"/>
          </svg>
        </div>
        <div>
          <div class="brand-title">OpsTrax</div>
          <div class="brand-subtitle">Platform Control Plane</div>
        </div>
      </div>
      <div class="session-card">
        <label>Control plane</label>
        <div class="session-readout">
          <strong>${h(identity.user_name || identity.user?.name || 'Platform operator')}</strong>
          <span>${h(identity.user_email || identity.user?.email || '')} · ${h(platformRoleLabel(identity.user?.role_key || identity.role?.key || 'PLATFORM_ADMIN'))}</span>
          <small>${h(summary.totalTenants ?? 0)} tenants · ${h(summary.openSupportSessions ?? 0)} requested or active support sessions</small>
        </div>
        <div class="shell-chips">
          <span class="chip">Separate session</span>
          <span class="chip">Audit trail enabled</span>
        </div>
      </div>
      ${groups.length ? groups.map((group) => `
        <div class="nav-group">
          <div class="nav-title">${h(group.title)}</div>
          ${group.items.map((item) => `
            <button class="nav-item ${item.active ? 'active' : ''}" data-page="${h(item.page)}" type="button">
              <span class="nav-dot"></span>
              <span class="nav-label">${h(item.title)}</span>
            </button>
          `).join('')}
        </div>
      `).join('') : `<div class="empty-state nav-empty">No platform navigation is available.</div>`}
      <div class="sidebar-footer">
        <div class="compliance-pill">Platform Audit Trail · Support Sessions</div>
        <div class="footer-note">SaaS owner controls stay isolated from tenant operational data.</div>
      </div>
    </aside>
  `;
}

function platformTopbar() {
  const identity = platformIdentity() || {};
  const summary = platformSummary();
  const tenant = selectedPlatformTenant();
  return `
    <header class="topbar shell-topbar">
      <div class="topbar-title">
        <div class="eyebrow">Platform Control Plane</div>
        <h1>${h(PLATFORM_PAGE_TITLES[state.platformPage] || state.platformPage)}</h1>
        <p class="topbar-summary">Control plane oversight for tenant plans, support sessions, security events, billing posture, and platform audit trails.</p>
        <div class="shell-context">
          <span class="chip">Platform session</span>
          <span class="chip">${h(identity.user_name || identity.user?.name || 'Platform operator')}</span>
          <span class="chip">${h(tenant?.name || 'No tenant selected')}</span>
        </div>
      </div>
      <div class="command-bar">
        <label class="search-shell">
          <span class="visually-hidden">Search tenants and platform events</span>
          <input id="globalSearch" value="${h(state.search)}" placeholder="Search tenants, plans, events" autocomplete="off" />
        </label>
        <button class="icon-button" data-action="refresh" type="button" aria-label="Refresh control plane">
          <span aria-hidden="true">↻</span>
        </button>
        <span class="status-pill status-ok">Control plane active</span>
        ${state.platformBootstrap?.session ? `
          <details class="session-menu">
            <summary>${h(identity.user_name || identity.user?.name || 'Session')}</summary>
            <div class="session-menu-panel">
              <div><strong>${h(identity.user_email || identity.user?.email || '')}</strong></div>
              <div class="muted">${h(identity.user?.role_key || identity.role?.key || '')} · Platform</div>
              <div class="muted">${h(identity.session?.provider || state.platformBootstrap?.session?.provider || 'platform-demo')} · Separate session</div>
              <button class="ghost" data-action="platform-logout" type="button">Sign out</button>
            </div>
          </details>
        ` : ''}
      </div>
    </header>
  `;
}

function platformTenantDirectoryTable() {
  const query = state.search.trim().toLowerCase();
  const tenants = platformTenants().filter((tenant) => {
    if (!query) return true;
    return `${tenant.name} ${tenant.slug} ${tenant.industry} ${tenant.plan_name || ''} ${tenant.subscription_status || ''}`.toLowerCase().includes(query);
  });
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Tenant Directory</h2>
          <p>Managed workspaces with subscription posture, support engagement, and health snapshots.</p>
        </div>
        <span class="badge gray">${h(tenants.length)} workspaces</span>
      </div>
      <table class="table">
        <thead>
          <tr>
            <th>Tenant</th>
            <th>Plan</th>
            <th>Status</th>
            <th>Users</th>
            <th>Modules</th>
            <th>Health</th>
          </tr>
        </thead>
        <tbody>
          ${tenants.map((tenant) => `
            <tr data-platform-tenant="${h(tenant.id)}" class="clickable-row">
              <td>
                <strong>${h(tenant.name)}</strong><br />
                <span class="muted">${h(tenant.industry)}</span>
              </td>
              <td>${badge(tenant.plan_name || 'No plan')}<br /><span class="muted">${h(tenant.plan_code || 'PLAN')}</span></td>
              <td>${badge(tenant.subscription_status || 'Unknown', tenant.subscription_status === 'ACTIVE' ? 'green' : tenant.subscription_status === 'SUSPENDED' ? 'red' : 'amber')}</td>
              <td>${h(tenant.active_users_count || 0)}</td>
              <td>${h(tenant.active_modules || 0)}</td>
              <td>${badge(tenant.auth_status === 'CONFIGURED' && tenant.storage_status === 'CONFIGURED' ? 'Configured' : tenant.auth_status || 'Unknown', tenant.auth_status === 'CONFIGURED' ? 'green' : 'amber')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </section>
  `;
}

function platformDetailSummaryCards() {
  const tenant = selectedPlatformTenant();
  const detail = state.platformData?.tenantDetail || {};
  const usage = state.platformData?.tenantUsage || {};
  const health = state.platformData?.tenantHealth || {};
  const subscription = detail.subscription || {};
  const cards = [
    ['Workspace', tenant?.name || 'Not selected', tenant?.industry || ''],
    ['Plan', subscription.plan_name || 'No plan', `Seats ${subscription.consumed_seats || 0}/${subscription.seat_limit || 0}`],
    ['Usage', `${usage.active_users || 0} users`, `${usage.api_requests || 0} API requests`],
    ['Health', health.auth_status || 'Unknown', health.note || ''],
    ['Modules', state.platformData?.tenantModules?.length || 0, 'Entitlement coverage'],
    ['Support', (state.platformData?.supportSessions || []).filter((session) => session.tenant_id === tenant?.id).length || 0, 'Support sessions']
  ];
  return `
    <section class="kpi-grid shell-kpi-grid">
      ${cards.map(([label, value, detailText]) => `
        <article class="panel kpi">
          <div class="kpi-label">${h(label)}</div>
          <div class="kpi-value">${h(value)}</div>
          <div class="kpi-detail">${h(detailText || '')}</div>
        </article>
      `).join('')}
    </section>
  `;
}

function platformSupportSessionForm() {
  const tenant = selectedPlatformTenant();
  const tenantOptions = platformTenants().map((row) => `<option value="${h(row.id)}" ${row.id === tenant?.id ? 'selected' : ''}>${h(row.name)}</option>`).join('');
  return `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Request Support Session</h2>
          <p>Create an audited support engagement for a managed tenant.</p>
        </div>
      </div>
      <div class="form-grid">
        <label class="field">
          <span>Tenant</span>
          <select name="tenantId" data-platform-support-tenant>
            ${tenantOptions}
          </select>
        </label>
        <label class="field">
          <span>Session Type</span>
          <select name="sessionType" data-platform-support-type>
            <option value="ADVISORY">Advisory</option>
            <option value="AUDIT">Audit</option>
            <option value="BILLING">Billing</option>
            <option value="SECURITY">Security</option>
          </select>
        </label>
        <label class="field">
          <span>Summary</span>
          <input name="summary" data-platform-support-summary placeholder="Production runtime review" value="Support review session" />
        </label>
        <label class="field">
          <span>Reason</span>
          <input name="reason" data-platform-support-reason placeholder="Review tenant readiness" value="Review tenant readiness" />
        </label>
      </div>
      <div class="actions-row">
        <button class="primary" data-action="platform-create-support-session" type="button">Create Support Request</button>
      </div>
    </section>
  `;
}

function platformTenantDetailDrawer() {
  const tenant = selectedPlatformTenant();
  if (!tenant) {
    return `
      <aside class="drawer-shell">
        <div class="drawer-masthead">
          <h3>No tenant selected</h3>
          <p>Select a workspace to inspect plan, usage, users, modules, health, and support posture.</p>
        </div>
      </aside>
    `;
  }
  const detail = state.platformData?.tenantDetail || {};
  const subscription = detail.subscription || {};
  const users = state.platformData?.tenantUsers || [];
  const modules = state.platformData?.tenantModules || [];
  const auditEvents = (state.platformData?.auditEvents || []).filter((event) => event.tenant_id === tenant.id);
  const securityEvents = (state.platformData?.securityEvents || []).filter((event) => event.tenant_id === tenant.id);
  const supportSessions = (state.platformData?.supportSessions || []).filter((event) => event.tenant_id === tenant.id);
  const tabs = [
    ['Details', `${tenant.name}`],
    ['Plan', `${subscription.plan_name || 'Plan'}`],
    ['Usage', `${state.platformData?.tenantUsage?.active_users || 0} users`],
    ['Health', `${state.platformData?.tenantHealth?.auth_status || 'Unknown'}`],
    ['Support', `${supportSessions.length}`],
    ['Users', `${users.length}`],
    ['Modules', `${modules.length}`],
    ['Audit', `${auditEvents.length}`],
    ['Security', `${securityEvents.length}`]
  ];
  const activeTab = state.drawerTab || 'Details';
  const drawerBody = (() => {
    if (activeTab === 'Plan') {
      return `
        <div class="drawer-stack">
          <div class="drawer-row"><strong>Plan</strong><span>${h(subscription.plan_name || 'No plan')}</span></div>
          <div class="drawer-row"><strong>Plan code</strong><span>${h(subscription.plan_code || 'Unknown')}</span></div>
          <div class="drawer-row"><strong>Billing cycle</strong><span>${h(subscription.billing_cycle || 'Unknown')}</span></div>
          <div class="drawer-row"><strong>Seats</strong><span>${h(subscription.consumed_seats || 0)} consumed / ${h(subscription.seat_limit || 0)} limit</span></div>
          <div class="drawer-row"><strong>Renewal</strong><span>${h(subscription.renewal_at || 'Not scheduled')}</span></div>
        </div>
      `;
    }
    if (activeTab === 'Usage') {
      const usage = state.platformData?.tenantUsage || {};
      return `
        <div class="drawer-stack">
          <div class="drawer-row"><strong>Active users</strong><span>${h(usage.active_users || 0)}</span></div>
          <div class="drawer-row"><strong>Active devices</strong><span>${h(usage.active_devices || 0)}</span></div>
          <div class="drawer-row"><strong>API requests</strong><span>${h(usage.api_requests || 0)}</span></div>
          <div class="drawer-row"><strong>Open work items</strong><span>${h(usage.open_work_items || 0)}</span></div>
          <div class="drawer-row"><strong>Offline batches</strong><span>${h(usage.offline_batches || 0)}</span></div>
        </div>
      `;
    }
    if (activeTab === 'Health') {
      const health = state.platformData?.tenantHealth || {};
      return `
        <div class="drawer-stack">
          <div class="drawer-row"><strong>Auth posture</strong><span>${h(health.auth_status || 'Unknown')}</span></div>
          <div class="drawer-row"><strong>Storage posture</strong><span>${h(health.storage_status || 'Unknown')}</span></div>
          <div class="drawer-row"><strong>Integration posture</strong><span>${h(health.integration_status || 'Unknown')}</span></div>
          <div class="drawer-row"><strong>Audit posture</strong><span>${h(health.audit_status || 'Unknown')}</span></div>
          <div class="drawer-row"><strong>Support posture</strong><span>${h(health.support_status || 'Unknown')}</span></div>
        </div>
      `;
    }
    if (activeTab === 'Support') {
      const supportByStatus = supportSessions.reduce((acc, session) => {
        acc[session.status] = (acc[session.status] || 0) + 1;
        return acc;
      }, {});
      return `
        <div class="drawer-stack">
          <div class="drawer-row"><strong>Requested</strong><span>${h(supportByStatus.REQUESTED || 0)}</span></div>
          <div class="drawer-row"><strong>Active</strong><span>${h(supportByStatus.ACTIVE || 0)}</span></div>
          <div class="drawer-row"><strong>Expired</strong><span>${h(supportByStatus.EXPIRED || 0)}</span></div>
          <div class="drawer-row"><strong>Revoked</strong><span>${h(supportByStatus.REVOKED || 0)}</span></div>
          <div class="drawer-row"><strong>Denied</strong><span>${h(supportByStatus.DENIED || 0)}</span></div>
          ${supportSessions.slice(0, 5).map((session) => `
            <div class="drawer-row">
              <strong>${h(session.session_type)} · ${h(session.status)}</strong>
              <span>${h(session.summary || session.reason || '')}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
    if (activeTab === 'Users') {
      return `
        <div class="drawer-stack">
          ${users.map((user) => `
            <div class="drawer-row">
              <strong>${h(user.name)}</strong>
              <span>${h(user.email)} · ${h(platformRoleLabel(user.role_key))}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
    if (activeTab === 'Modules') {
      return `
        <div class="drawer-stack">
          ${modules.map((module) => `
            <div class="drawer-row">
              <strong>${h(module.feature_key)}</strong>
              <span>${h(module.entitlement_status)} · ${h(module.source)}</span>
            </div>
          `).join('')}
        </div>
      `;
    }
    if (activeTab === 'Audit') {
      return `
        <div class="drawer-stack">
          ${auditEvents.slice(0, 8).map((event) => `
            <div class="drawer-row">
              <strong>${h(event.action)}</strong>
              <span>${h(event.summary)}</span>
            </div>
          `).join('') || '<div class="empty-state compact-empty">No platform audit events for this tenant.</div>'}
        </div>
      `;
    }
    if (activeTab === 'Security') {
      return `
        <div class="drawer-stack">
          ${securityEvents.slice(0, 8).map((event) => `
            <div class="drawer-row">
              <strong>${h(event.event_type)}</strong>
              <span>${h(event.summary)}</span>
            </div>
          `).join('') || '<div class="empty-state compact-empty">No platform security events for this tenant.</div>'}
        </div>
      `;
    }
    return `
      <div class="drawer-stack">
        <div class="drawer-row"><strong>Workspace</strong><span>${h(tenant.name)}</span></div>
        <div class="drawer-row"><strong>Plan</strong><span>${h(subscription.plan_name || 'No plan')}</span></div>
        <div class="drawer-row"><strong>Status</strong><span>${h(subscription.status || tenant.subscription_status || 'Unknown')}</span></div>
        <div class="drawer-row"><strong>Support sessions</strong><span>${h(supportSessions.length)}</span></div>
      </div>
    `;
  })();
  const canSuspend = canPlatform('MANAGE_PLATFORM_TENANT_STATUS');
  const canSupport = canPlatform('MANAGE_PLATFORM_SUPPORT_SESSIONS');
  const supportButton = canSupport ? `<button class="primary" data-action="platform-create-support-session" type="button">Create Support Request</button>` : '';
  const suspendButton = canSuspend && subscription.status !== 'SUSPENDED'
    ? `<button class="danger" data-action="platform-suspend-tenant" type="button">Suspend Workspace</button>`
    : '';
  const reactivateButton = canSuspend && subscription.status === 'SUSPENDED'
    ? `<button class="success" data-action="platform-reactivate-tenant" type="button">Reactivate Workspace</button>`
    : '';
  return `
    <aside class="drawer-shell">
      <div class="drawer-masthead">
        <div class="drawer-chip-stack">
          <span class="chip">${h(tenant.name)}</span>
          <span class="chip">${h(subscription.plan_code || 'PLAN')}</span>
          <span class="chip">${h(subscription.plan_name || 'No plan')}</span>
          <span class="chip">${h(subscription.status || 'Unknown')}</span>
        </div>
        <h3>${h(tenant.name)}</h3>
        <p>Workspace: ${h(tenant.name)} · Plan: ${h(subscription.plan_name || 'No plan')} · Tenant ${h(tenant.id)}</p>
      </div>
      <div class="drawer-tabs">
        ${tabs.map(([tab, label]) => `<button class="drawer-tab ${activeTab === tab ? 'active' : ''}" data-drawer-tab="${h(tab)}" type="button">${h(label)}</button>`).join('')}
      </div>
      <div class="drawer-action-list">
        ${supportButton}
        ${suspendButton}
        ${reactivateButton}
      </div>
      <div class="drawer-body">
        ${drawerBody}
      </div>
    </aside>
  `;
}

function platformDashboardPage() {
  const summary = platformSummary();
  return `
    <div class="workspace-stage shell-stage">
      <section class="panel landing-section">
        <div class="section-head">
          <div>
            <h2>Platform Overview</h2>
            <p>Command plane for tenant plans, support, security, billing posture, and managed workspaces.</p>
          </div>
        </div>
        ${platformShellKpis()}
      </section>
      <section class="panel landing-section">
        <div class="section-head">
          <div>
            <h2>Executive Briefing</h2>
            <p>Operational summary across active modules, support posture, security, audit, and workspace health.</p>
          </div>
        </div>
        <div class="landing-grid">
          <article class="landing-card"><div class="eyebrow">Workspaces</div><strong>${h(summary.totalTenants || 0)}</strong><p>${h(summary.activeTenants || 0)} active · ${h(summary.restrictedTenants || 0)} restricted</p></article>
          <article class="landing-card"><div class="eyebrow">Active Modules</div><strong>${h(summary.totalModules || 0)}</strong><p>Enabled across managed tenants</p></article>
          <article class="landing-card"><div class="eyebrow">Support</div><strong>${h(summary.openSupportSessions || 0)}</strong><p>${h(summary.requestedSupportSessions || 0)} requested · ${h(summary.activeSupportSessions || 0)} active</p></article>
          <article class="landing-card"><div class="eyebrow">Health</div><strong>${h(summary.healthyTenants || 0)}</strong><p>Configured workspaces in good standing</p></article>
          <article class="landing-card"><div class="eyebrow">Security</div><strong>${h(summary.securityEvents || 0)}</strong><p>Recorded platform security events</p></article>
          <article class="landing-card"><div class="eyebrow">Audit</div><strong>${h(summary.auditEvents || 0)}</strong><p>Immutable platform audit trail entries</p></article>
        </div>
      </section>
      ${platformTenantDirectoryTable()}
      <section class="panel landing-section">
        <div class="section-head">
          <div>
            <h2>Support Sessions</h2>
            <p>Audited platform support sessions across managed tenants.</p>
          </div>
        </div>
        <div class="landing-grid">
          ${(state.platformData?.supportSessions || []).slice(0, 4).map((session) => `
            <article class="landing-card">
              <div class="eyebrow">${h(session.session_type)}</div>
              <strong>${h(session.tenant_name || session.tenant_id)}</strong>
              <p>${h(session.summary || session.reason || '')}</p>
            </article>
          `).join('')}
        </div>
      </section>
      <section class="panel landing-section">
        <div class="section-head">
          <div>
            <h2>Security & Billing</h2>
            <p>Latest control-plane events and commercial posture markers.</p>
          </div>
        </div>
        <div class="landing-grid">
          ${(state.platformData?.securityEvents || []).slice(0, 3).map((event) => `
            <article class="landing-card danger-tone">
              <div class="eyebrow">${h(event.event_type)}</div>
              <strong>${h(event.summary)}</strong>
              <p>${h(event.severity || 'INFO')}</p>
            </article>
          `).join('')}
          ${(state.platformData?.billingEvents || []).slice(0, 3).map((event) => `
            <article class="landing-card">
              <div class="eyebrow">${h(event.event_type)}</div>
              <strong>${h(event.summary)}</strong>
              <p>${h((event.amount_cents || 0) / 100)} ${h(event.currency || 'USD')}</p>
            </article>
          `).join('')}
        </div>
      </section>
      <section class="panel landing-section">
        <div class="section-head">
          <div>
            <h2>System Health</h2>
            <p>Tenant health snapshots across authentication, storage, integration, and support posture.</p>
          </div>
        </div>
        <div class="landing-grid">
          ${(state.platformData?.tenants || []).map((tenant) => {
            const health = tenant.auth_status || tenant.storage_status || tenant.integration_status;
            return `
              <article class="landing-card" data-platform-tenant="${h(tenant.id)}">
                <div class="eyebrow">${h(tenant.tier || 'tenant')}</div>
                <strong>${h(tenant.name)}</strong>
                <p>${h(health || 'CONFIGURATION_REQUIRED')} · ${h(tenant.health_note || 'No health note')}</p>
              </article>
            `;
          }).join('')}
        </div>
      </section>
    </div>
  `;
}

function platformPageBody() {
  if (state.platformPage === 'Tenant Directory') return platformTenantDirectoryTable();
  if (state.platformPage === 'Tenant Detail') {
    return `
      <div class="workspace-stage shell-stage">
        ${platformDetailSummaryCards()}
        ${platformSupportSessionForm()}
        <section class="panel landing-section">
          <div class="section-head">
            <div>
              <h2>Platform Events</h2>
              <p>Audit and security events for the selected tenant.</p>
            </div>
          </div>
          <div class="landing-grid">
            ${(state.platformData?.auditEvents || []).filter((event) => event.tenant_id === state.platformTenantId).slice(0, 4).map((event) => `
              <article class="landing-card">
                <div class="eyebrow">Audit</div>
                <strong>${h(event.action)}</strong>
                <p>${h(event.summary)}</p>
              </article>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }
  if (state.platformPage === 'Subscription & Plans') {
    return `
      <div class="workspace-stage shell-stage">
        <section class="panel landing-section">
          <div class="section-head">
            <div>
              <h2>Subscription & Plans</h2>
              <p>Commercial plan posture, seat limits, and renewal windows.</p>
            </div>
          </div>
          <table class="table">
            <thead>
              <tr><th>Tenant</th><th>Plan</th><th>Status</th><th>Seats</th><th>Renewal</th></tr>
            </thead>
            <tbody>
              ${platformTenants().map((tenant) => `
                <tr data-platform-tenant="${h(tenant.id)}" class="clickable-row">
                  <td><strong>${h(tenant.name)}</strong><br /><span class="muted">${h(tenant.slug)}</span></td>
                  <td>${h(tenant.plan_name || 'No plan')}</td>
                  <td>${badge(tenant.subscription_status || 'Unknown', tenant.subscription_status === 'ACTIVE' ? 'green' : tenant.subscription_status === 'SUSPENDED' ? 'red' : 'amber')}</td>
                  <td>${h(tenant.consumed_seats || 0)} / ${h(tenant.seat_limit || 0)}</td>
                  <td>${h(tenant.renewal_at || 'Not set')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      </div>
    `;
  }
  if (state.platformPage === 'Module Entitlements') {
    const tenant = selectedPlatformTenant();
    return `
      <div class="workspace-stage shell-stage">
        <section class="panel landing-section">
          <div class="section-head">
            <div>
              <h2>Module Entitlements</h2>
              <p>${h(tenant?.name || 'Selected workspace')} entitlement posture across enabled and restricted modules.</p>
            </div>
          </div>
          <table class="table">
            <thead><tr><th>Module</th><th>Status</th><th>Source</th><th>Notes</th></tr></thead>
            <tbody>
              ${(state.platformData?.tenantModules || []).map((module) => `
                <tr>
                  <td><strong>${h(module.feature_key)}</strong></td>
                  <td>${badge(module.entitlement_status, module.entitlement_status === 'ENABLED' ? 'green' : 'amber')}</td>
                  <td>${h(module.source)}</td>
                  <td>${h(module.notes)}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      </div>
    `;
  }
  if (state.platformPage === 'User & Seats') {
    const tenant = selectedPlatformTenant();
    return `
      <div class="workspace-stage shell-stage">
        <section class="panel landing-section">
          <div class="section-head">
            <div>
              <h2>User & Seats</h2>
              <p>${h(tenant?.name || 'Selected workspace')} user roster and seat posture.</p>
            </div>
          </div>
          <table class="table">
            <thead><tr><th>User</th><th>Role</th><th>Department</th><th>Facility</th></tr></thead>
            <tbody>
              ${(state.platformData?.tenantUsers || []).map((user) => `
                <tr>
                  <td><strong>${h(user.name)}</strong><br /><span class="muted">${h(user.email)}</span></td>
                  <td>${h(platformRoleLabel(user.role_key))}</td>
                  <td>${h(user.department_id || '—')}</td>
                  <td>${h(user.facility_id || '—')}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      </div>
    `;
  }
  if (state.platformPage === 'Support Sessions') {
    const supportSessions = state.platformData?.supportSessions || [];
    const supportStatusCounts = supportSessions.reduce((acc, session) => {
      const status = String(session.status || 'REQUESTED').toUpperCase();
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, { REQUESTED: 0, ACTIVE: 0, EXPIRED: 0, REVOKED: 0, DENIED: 0 });
    return `
      <div class="workspace-stage shell-stage">
        ${platformSupportSessionForm()}
        <section class="panel landing-section">
          <div class="section-head">
            <div>
              <h2>Support Sessions</h2>
              <p>Audited sessions across the control plane. Statuses include requested, active, expired, revoked, and denied.</p>
            </div>
          </div>
          <div class="shell-chips" aria-label="Support session status summary">
            ${['REQUESTED', 'ACTIVE', 'EXPIRED', 'REVOKED', 'DENIED'].map((status) => `<span class="status-pill ${status === 'ACTIVE' ? 'status-ok' : status === 'EXPIRED' || status === 'DENIED' || status === 'REVOKED' ? 'status-warn' : 'status-neutral'}">${status} ${h(String(supportStatusCounts[status] || 0))}</span>`).join('')}
          </div>
          <table class="table">
            <thead>
              <tr><th>Tenant</th><th>Type</th><th>Status</th><th>Reason</th><th>Action</th></tr>
            </thead>
            <tbody>
              ${supportSessions.map((session) => `
                <tr>
                  <td><strong>${h(session.tenant_name || session.tenant_id)}</strong><br /><span class="muted">${h(session.tenant_slug || '')}</span></td>
                  <td>${h(session.session_type)}</td>
                  <td>${badge(session.status || 'REQUESTED', session.status === 'ACTIVE' ? 'green' : session.status === 'DENIED' || session.status === 'REVOKED' ? 'red' : 'amber')}</td>
                  <td>${h(session.reason || session.summary || '')}</td>
                  <td>
                    ${['REQUESTED', 'ACTIVE'].includes(session.status)
                      ? `<button class="ghost small" data-action="platform-end-support-session" data-id="${h(session.id)}" type="button">End Session</button>`
                      : '<span class="muted">Closed</span>'}
                  </td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </section>
      </div>
    `;
  }
  if (state.platformPage === 'Security & Audit') {
    return `
      <div class="workspace-stage shell-stage">
        <section class="panel landing-section">
          <div class="section-head">
            <div>
              <h2>Security & Audit</h2>
              <p>Immutable platform events and security posture.</p>
            </div>
          </div>
          <div class="landing-grid">
            ${(state.platformData?.securityEvents || []).map((event) => `
              <article class="landing-card danger-tone">
                <div class="eyebrow">${h(event.event_type)}</div>
                <strong>${h(event.summary)}</strong>
                <p>${h(event.severity || 'INFO')}</p>
              </article>
            `).join('')}
            ${(state.platformData?.auditEvents || []).slice(0, 6).map((event) => `
              <article class="landing-card">
                <div class="eyebrow">Audit</div>
                <strong>${h(event.action)}</strong>
                <p>${h(event.summary)}</p>
              </article>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }
  if (state.platformPage === 'System Health') {
    return `
      <div class="workspace-stage shell-stage">
        <section class="panel landing-section">
          <div class="section-head">
            <div>
              <h2>System Health</h2>
              <p>Tenant posture across authentication, storage, and integrations.</p>
            </div>
          </div>
          <div class="landing-grid">
            ${(state.platformData?.tenants || []).map((tenant) => `
              <article class="landing-card" data-platform-tenant="${h(tenant.id)}">
                <div class="eyebrow">${h(tenant.name)}</div>
                <strong>${h(tenant.auth_status || 'CONFIGURATION_REQUIRED')}</strong>
                <p>${h(tenant.storage_status || 'CONFIGURATION_REQUIRED')} · ${h(tenant.integration_status || 'CONFIGURATION_REQUIRED')} · ${h(tenant.health_note || '')}</p>
              </article>
            `).join('')}
          </div>
        </section>
      </div>
    `;
  }
  return platformDashboardPage();
}

function platformWorkspaceShell() {
  return `
    <div class="workspace-shell shell-shell">
      ${platformSidebar()}
      <div class="workspace-stage shell-stage">
        ${platformTopbar()}
        ${state.loading ? shellSkeleton() : state.error ? `<section class="panel empty-state error-state">${h(state.error)}</section>` : platformPageBody()}
      </div>
      ${platformTenantDetailDrawer()}
    </div>
  `;
}

function modulePreviewPage(page) {
  const reason = pageAvailabilityReason(page);
  const note = SECTION_NOTE[page] || 'Commercial workspace module surface.';
  return `
    <div class="workspace-shell shell-shell">
      <div class="workspace-stage shell-stage">
        <section class="panel landing-section">
          <div class="section-head">
            <div>
              <h2>${h(page)}</h2>
              <p>${h(note)}</p>
            </div>
          </div>
          <div class="empty-state compact-empty">
            ${reason ? h(reason) : 'This module is not enabled for your current workspace configuration.'}
          </div>
          <div class="landing-grid">
            <article class="landing-card">
              <div class="eyebrow">Workspace configuration required</div>
              <p>Contact your platform admin to enable this module for your workspace.</p>
            </article>
            <article class="landing-card">
              <div class="eyebrow">Server controlled</div>
              <p>All active modules map to real permissioned API routes with tenant-scoped data.</p>
            </article>
          </div>
        </section>
      </div>
      ${shellDrawer()}
    </div>
  `;
}

function apiQuery() {
  return '';
}

async function api(path, options = {}) {
  const headers = new Headers(options.headers || {});
  const csrfToken = currentSurface() === 'platform'
    ? (state.platformBootstrap?.session?.csrf_token || state.platformIdentity?.session?.csrf_token || '')
    : (state.bootstrap?.session?.csrf_token || '');
  if (csrfToken && ['POST', 'PATCH', 'PUT', 'DELETE'].includes((options.method || 'GET').toUpperCase())) {
    headers.set('X-CSRF-Token', csrfToken);
  }
  if (options.body && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  const response = await fetch(path, {
    ...options,
    headers,
    body: options.body && !(options.body instanceof FormData) ? JSON.stringify(options.body) : options.body
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(payload.error || `Request failed (${response.status})`);
    error.status = response.status;
    throw error;
  }
  return payload;
}

async function safeApi(path) {
  try {
    return await api(path);
  } catch (error) {
    if (error.status === 403) return null;
    throw error;
  }
}

async function loadRequestDetail(requestId) {
  if (!requestId) return null;
  let detail = null;
  try {
    detail = await api(`/api/requests/${requestId}`);
  } catch (error) {
    if (![403, 404].includes(error.status)) throw error;
  }
  if (detail) {
    state.requestDetails = { ...(state.requestDetails || {}), [requestId]: detail };
  }
  return detail;
}

async function loadWarehouseTaskDetail(taskId) {
  if (!taskId) return null;
  let detail = null;
  try {
    detail = await api(`/api/warehouse/tasks/${taskId}`);
  } catch (error) {
    if (![403, 404].includes(error.status)) throw error;
  }
  if (detail) {
    state.warehouseTaskDetails = { ...(state.warehouseTaskDetails || {}), [taskId]: detail };
  }
  return detail;
}

async function loadEvidenceDetail(evidenceId) {
  if (!evidenceId) return null;
  let detail = null;
  try {
    detail = await api(`/api/evidence/${evidenceId}`);
  } catch (error) {
    if (![403, 404].includes(error.status)) throw error;
  }
  if (detail) {
    state.evidenceDetails = { ...(state.evidenceDetails || {}), [evidenceId]: detail };
  }
  return detail;
}

async function loadReceivingDetail(sessionId) {
  if (!sessionId) return null;
  let detail = null;
  try {
    detail = await api(`/api/receiving/sessions/${sessionId}`);
  } catch (error) {
    if (![403, 404].includes(error.status)) throw error;
  }
  if (detail) {
    state.receivingDetails = { ...(state.receivingDetails || {}), [sessionId]: detail };
  }
  return detail;
}

async function loadReportDetail(runId) {
  if (!runId) return null;
  let detail = null;
  try {
    detail = await api(`/api/reports/runs/${runId}`);
  } catch (error) {
    if (![403, 404].includes(error.status)) throw error;
  }
  if (detail) {
    state.reportDetails = { ...(state.reportDetails || {}), [runId]: detail };
  }
  return detail;
}

async function loadProcurementDetail(focusType, id) {
  if (!focusType || !id) return null;
  const key = `${focusType}:${id}`;
  let detail = null;
  try {
    if (focusType === 'vendor') detail = await api(`/api/procurement/vendors/${id}`);
    if (focusType === 'purchase-request') detail = await api(`/api/procurement/purchase-requests/${id}`);
    if (focusType === 'purchase-order') detail = await api(`/api/procurement/purchase-orders/${id}`);
    if (focusType === 'supplier-contract') detail = await api(`/api/procurement/contracts/${id}`);
    if (focusType === 'department-budget') detail = await api(`/api/procurement/budgets/${id}`);
    if (focusType === 'procurement-waiver') detail = await api(`/api/procurement/waivers/${id}`);
  } catch (error) {
    if (![403, 404].includes(error.status)) throw error;
  }
  if (detail) {
    state.procurementDetails = { ...(state.procurementDetails || {}), [key]: detail };
  }
  return detail;
}

async function loadProcureToPayDetail(focusType, id) {
  if (!focusType || !id) return null;
  const key = `${focusType}:${id}`;
  let detail = null;
  try {
    if (focusType === 'vendor-invoice') detail = await api(`/api/procure-to-pay/vendor-invoices/${id}`);
    if (focusType === 'rfq-request') detail = await api(`/api/procure-to-pay/rfqs/${id}`);
    if (focusType === 'vendor-quote') detail = await api(`/api/procure-to-pay/vendor-quotes/${id}`);
  } catch (error) {
    if (![403, 404].includes(error.status)) throw error;
  }
  if (detail) {
    state.p2pDetails = { ...(state.p2pDetails || {}), [key]: detail };
  }
  return detail;
}

async function loadExportDetail(focusType, id) {
  if (!focusType || !id) return null;
  const key = `${focusType}:${id}`;
  let detail = null;
  try {
    if (focusType === 'export-batch') detail = await api(`/api/exports/batches/${id}`);
    if (focusType === 'integration-connection') detail = await api(`/api/integrations/connections/${id}`);
    if (focusType === 'integration-job') detail = await api(`/api/integrations/jobs/${id}`);
  } catch (error) {
    if (![403, 404].includes(error.status)) throw error;
  }
  if (detail) {
    state.exportDetails = focusType === 'export-batch'
      ? { ...(state.exportDetails || {}), [key]: detail }
      : state.exportDetails;
    state.integrationDetails = focusType === 'integration-connection' || focusType === 'integration-job'
      ? { ...(state.integrationDetails || {}), [key]: detail }
      : state.integrationDetails;
  }
  return detail;
}

async function refreshWithRequestDetail(requestId = state.drawerFocus?.id) {
  await loadData();
  if (requestId) {
    await loadRequestDetail(requestId);
    render();
  }
}

async function refreshWithWarehouseTaskDetail(taskId = state.drawerFocus?.id) {
  await loadData();
  if (taskId) {
    await loadWarehouseTaskDetail(taskId);
    render();
  }
}

async function refreshWithEvidenceDetail(evidenceId = state.drawerFocus?.id) {
  await loadData();
  if (evidenceId) {
    await loadEvidenceDetail(evidenceId);
    render();
  }
}

async function refreshWithReceivingDetail(sessionId = state.drawerFocus?.id) {
  await loadData();
  if (sessionId) {
    await loadReceivingDetail(sessionId);
    render();
  }
}

async function refreshWithReportDetail(runId = state.drawerFocus?.id) {
  await loadData();
  if (runId) {
    await loadReportDetail(runId);
    render();
  }
}

async function refreshWithExportDetail(focusType = state.drawerFocus?.type, id = state.drawerFocus?.id) {
  await loadData();
  if (focusType && id) {
    await loadExportDetail(focusType, id);
    render();
  }
}

async function refreshWithProcurementDetail(focusType = state.drawerFocus?.type, id = state.drawerFocus?.id) {
  await loadData();
  if (focusType && id) {
    await loadProcurementDetail(focusType, id);
    render();
  }
}

async function refreshWithProcureToPayDetail(focusType = state.drawerFocus?.type, id = state.drawerFocus?.id) {
  await loadData();
  if (focusType && id) {
    await loadProcureToPayDetail(focusType, id);
    render();
  }
}

async function loadPlatformData() {
  state.loading = true;
  state.error = '';
  state.reportDetails = {};
  state.platformData = {};
  render();
  try {
    state.platformAuthBootstrap = await api('/api/platform/auth/bootstrap');
    const identity = await api('/api/platform/me');
    state.authRequired = false;
    state.platformIdentity = identity;
    state.platformBootstrap = identity;
    state.authMode = identity.auth?.mode || state.platformAuthBootstrap?.mode || state.authMode || 'dev';
    const path = typeof window !== 'undefined' ? window.location.pathname : '/platform/dashboard';
    const routeTenantId = path.match(/^\/platform\/tenants\/([^/]+)/)?.[1] || state.platformTenantId || '';
    state.platformTenantId = routeTenantId;
    state.platformPage = platformPageFromPathname(path);
    const [summary, tenants, audit, security, billing, support] = await Promise.all([
      safeApi('/api/platform/summary'),
      safeApi('/api/platform/tenants'),
      safeApi('/api/platform/audit-events'),
      safeApi('/api/platform/security-events'),
      safeApi('/api/platform/billing-events'),
      safeApi('/api/platform/support-sessions')
    ]);
    const [reportsSummary, reportsDefinitions, reportsRuns] = await Promise.all([
      safeApi('/api/platform/reports/summary'),
      safeApi('/api/platform/reports/definitions'),
      safeApi('/api/platform/reports/runs')
    ]);
    let tenantDetail = null;
    let tenantUsers = null;
    let tenantModules = null;
    let tenantUsage = null;
    let tenantHealth = null;
    const selectedTenantId = routeTenantId || tenants?.tenants?.[0]?.id || '';
    if (selectedTenantId && path.startsWith('/platform/tenants/')) {
      state.platformTenantId = selectedTenantId;
      [tenantDetail, tenantUsers, tenantModules, tenantUsage, tenantHealth] = await Promise.all([
        safeApi(`/api/platform/tenants/${selectedTenantId}`),
        safeApi(`/api/platform/tenants/${selectedTenantId}/users`),
        safeApi(`/api/platform/tenants/${selectedTenantId}/modules`),
        safeApi(`/api/platform/tenants/${selectedTenantId}/usage`),
        safeApi(`/api/platform/tenants/${selectedTenantId}/health`)
      ]);
    }
    state.platformData = {
      summary: summary?.summary || {},
      tenants: tenants?.tenants || [],
      auditEvents: audit?.events || [],
      securityEvents: security?.events || [],
      billingEvents: billing?.events || [],
      supportSessions: support?.sessions || [],
      tenantDetail,
      tenantUsers: tenantUsers?.users || [],
      tenantModules: tenantModules?.entitlements || [],
      tenantUsage: tenantUsage?.usage || null,
      tenantUsageHistory: tenantUsage?.history || [],
      tenantHealth: tenantHealth?.health || null,
      tenantHealthHistory: tenantHealth?.history || [],
      reports: {
        summary: reportsSummary || null,
        definitions: reportsDefinitions || null,
        runs: reportsRuns || null
      }
    };
  } catch (error) {
    if (error.status === 401) {
      state.authRequired = true;
      state.loginUrl = '/platform/login';
      state.error = error.message || 'Platform authentication required.';
      state.platformIdentity = null;
      state.platformBootstrap = null;
      state.platformData = null;
      state.loading = false;
      if (!state.platformAuthBootstrap) {
        try {
          state.platformAuthBootstrap = await api('/api/platform/auth/bootstrap');
        } catch {
          state.platformAuthBootstrap = { mode: 'locked', demo_login_enabled: false, login_required: true };
        }
      }
      render();
      return;
    }
    state.error = error.message || 'Unable to load platform data.';
  } finally {
    state.loading = false;
    render();
  }
}

async function loadData() {
  if (currentSurface() === 'platform') {
    await loadPlatformData();
    return;
  }
  state.loading = true;
  state.error = '';
  state.procurementDetails = {};
  state.procurementLineDraft = null;
  state.requestDetails = {};
  state.warehouseTaskDetails = {};
  state.evidenceDetails = {};
  state.receivingDetails = {};
  state.exportDetails = {};
  state.integrationDetails = {};
  state.requestLineDraft = null;
  state.availableRequestItems = null;
  state.p2pDetails = {};
  state.reportDetails = {};
  render();
  try {
    state.authBootstrap = await api('/api/auth/bootstrap');
    const identity = await api('/api/me');
    const bootstrap = await api('/api/bootstrap');
    state.authRequired = false;
    state.identity = identity;
    state.bootstrap = bootstrap;
    state.authMode = identity.auth?.mode || bootstrap.auth?.mode || state.authBootstrap?.mode || 'dev';
    const endpointMap = {
      inventorySummary: '/api/inventory/summary',
      inventoryCategories: '/api/inventory/categories',
      inventoryItems: '/api/inventory/items',
      inventoryBalances: '/api/inventory/balances',
      inventoryMovements: '/api/inventory/movements',
      inventoryAdjustments: '/api/inventory/adjustments',
      inventoryBins: '/api/inventory/bins',
      items: '/api/items',
      requests: '/api/requests',
      warehouseSummary: '/api/warehouse/summary',
      warehouseTasks: '/api/warehouse/tasks',
      warehouseIssueReadyRequests: '/api/warehouse/issue-ready-requests',
      warehouseBins: '/api/warehouse/bins',
      receivingSummary: '/api/receiving/summary',
      receivingPurchaseOrders: '/api/receiving/purchase-orders',
      receivingSessions: '/api/receiving/sessions',
      receivingMovements: '/api/receiving/movements',
      procurementSummary: '/api/procurement/summary',
      procurementVendors: '/api/procurement/vendors',
      procurementContracts: '/api/procurement/contracts',
      procurementBudgets: '/api/procurement/budgets',
      procurementWaivers: '/api/procurement/waivers',
      procurementAdvisory: '/api/procurement/advisory',
      procurementPurchaseRequests: '/api/procurement/purchase-requests',
      procurementPurchaseOrders: '/api/procurement/purchase-orders',
      procureToPaySummary: '/api/procure-to-pay/summary',
      procureToPayInvoices: '/api/procure-to-pay/vendor-invoices',
      procureToPayRfqs: '/api/procure-to-pay/rfqs',
      procureToPayQuotes: '/api/procure-to-pay/vendor-quotes',
      procureToPayScorecards: '/api/procure-to-pay/vendor-scorecards',
      syncBatches: '/api/sync-batches',
      conflicts: '/api/offline-conflicts',
      deviceopsSummary: '/api/deviceops/summary',
      deviceopsDevices: '/api/devices',
      offlineSummary: '/api/offline/summary',
      offlineBatches: '/api/offline/batches',
      offlineConflicts: '/api/offline/conflicts',
      offlineTasks: '/api/offline/tasks',
      labels: '/api/labels',
      exports: '/api/exports',
      exportsSummary: '/api/exports/summary',
      exportCandidates: '/api/exports/candidates',
      exportBatches: '/api/exports/batches',
      exportMovements: '/api/exports/movements',
      exportPurchaseOrders: '/api/exports/purchase-orders',
      exportReceipts: '/api/exports/receipts',
      integrationsSummary: '/api/integrations/summary',
      integrationConnections: '/api/integrations/connections',
      integrationJobs: '/api/integrations/jobs',
      audit: '/api/audit',
      auditSummary: '/api/audit/summary',
      documents: '/api/documents',
      evidence: '/api/evidence',
      compliance: '/api/compliance',
      complianceControls: '/api/compliance/controls',
      complianceEvidence: '/api/compliance/evidence',
      complianceAccessReviews: '/api/compliance/access-reviews',
      complianceRiskRegister: '/api/compliance/risk-register',
      complianceIncidents: '/api/compliance/incidents',
      complianceVendorRegister: '/api/compliance/vendor-register',
      complianceAiGovernance: '/api/compliance/ai-governance',
      complianceSecurityPosture: '/api/compliance/security-posture',
      complianceAvailabilityPosture: '/api/compliance/availability-posture',
      availableRequestItems: '/api/requests/available-items',
      reportsSummary: '/api/reports/summary',
      reportsDefinitions: '/api/reports/definitions',
      reportsRuns: '/api/reports/runs',
      aiSummary: '/api/ai/summary',
      aiRecommendations: '/api/ai/recommendations',
      aiRuns: '/api/ai/runs',
      aiAgents: '/api/ai/agents',
      invOptSummary: '/api/inventory-optimization/summary',
      invOptPlans: '/api/inventory-optimization/cycle-count-plans',
      invOptVariances: '/api/inventory-optimization/variances',
      invOptRecommendations: '/api/inventory-optimization/recommendations',
      invOptClassifications: '/api/inventory-optimization/classifications',
      assetCustodySummary: '/api/assets/summary',
      assetList: '/api/assets',
      assetMaintenance: '/api/assets/maintenance',
      assetDisposals: '/api/assets/disposal-requests',
      ocrStatus: '/api/ocr/status'
    };
    const extra = {};
    const result = await Promise.all(
      Object.entries(endpointMap).map(async ([key, endpoint]) => {
        const data = await safeApi(endpoint);
        extra[key] = data;
      })
    );
    void result;
    if (can('manage_admin')) {
      extra.admin = await api('/api/admin');
    } else {
      extra.admin = null;
    }
    extra.inventory = {
      summary: extra.inventorySummary,
      categories: extra.inventoryCategories,
      items: extra.inventoryItems,
      balances: extra.inventoryBalances,
      movements: extra.inventoryMovements,
      adjustments: extra.inventoryAdjustments,
      bins: extra.inventoryBins
    };
    extra.warehouse = {
      summary: extra.warehouseSummary,
      tasks: extra.warehouseTasks,
      issueReadyRequests: extra.warehouseIssueReadyRequests,
      bins: extra.warehouseBins
    };
    extra.receiving = {
      summary: extra.receivingSummary,
      purchaseOrders: extra.receivingPurchaseOrders,
      sessions: extra.receivingSessions,
      movements: extra.receivingMovements
    };
    extra.procurement = {
      summary: extra.procurementSummary,
      vendors: extra.procurementVendors,
      contracts: extra.procurementContracts,
      budgets: extra.procurementBudgets,
      waivers: extra.procurementWaivers,
      advisory: extra.procurementAdvisory,
      purchaseRequests: extra.procurementPurchaseRequests,
      purchaseOrders: extra.procurementPurchaseOrders
    };
    extra.procureToPay = {
      summary: extra.procureToPaySummary,
      vendorInvoices: extra.procureToPayInvoices,
      rfqRequests: extra.procureToPayRfqs,
      vendorQuotes: extra.procureToPayQuotes,
      vendorScorecards: extra.procureToPayScorecards
    };
    extra.reports = {
      summary: extra.reportsSummary,
      definitions: extra.reportsDefinitions,
      runs: extra.reportsRuns
    };
    extra.invOpt = {
      summary: extra.invOptSummary,
      plans: extra.invOptPlans?.plans || [],
      variances: extra.invOptVariances?.variances || [],
      recommendations: extra.invOptRecommendations?.recommendations || [],
      classifications: extra.invOptClassifications?.classifications || []
    };
    extra.exports = {
      summary: extra.exportsSummary,
      candidates: extra.exportCandidates,
      batches: extra.exportBatches,
      movements: extra.exportMovements,
      purchaseOrders: extra.exportPurchaseOrders,
      receipts: extra.exportReceipts,
      errors: extra.exports?.errors || [],
      transfers: extra.exports?.transfers || [],
      connections: extra.integrationConnections || [],
      jobs: extra.integrationJobs || []
    };
    extra.integrations = {
      summary: extra.integrationsSummary,
      connections: extra.integrationConnections || [],
      jobs: extra.integrationJobs || []
    };
    extra.purchaseRequests = extra.procurementPurchaseRequests;
    extra.purchaseOrders = extra.procurementPurchaseOrders;
    extra.audit = {
      audit: extra.audit?.audit || [],
      summary: extra.auditSummary
    };
    extra.assetCustody = {
      summary: extra.assetCustodySummary?.summary || {},
      assets: extra.assetList?.assets || [],
      maintenance: extra.assetMaintenance?.cases || [],
      disposals: extra.assetDisposals?.disposalRequests || []
    };
    state.data = extra;
    state.availableRequestItems = extra.availableRequestItems;
    if (typeof localStorage !== 'undefined') localStorage.setItem('opstrax.page', state.page);
    if (typeof localStorage !== 'undefined') localStorage.setItem('opstrax.search', state.search);
  } catch (error) {
    if (error.status === 401) {
      state.authRequired = true;
      state.loginUrl = error.loginUrl || '/auth/login';
      state.error = error.message || 'Authentication required.';
      state.identity = null;
      state.bootstrap = null;
      state.data = null;
      state.loading = false;
      if (!state.authBootstrap) {
        try {
          state.authBootstrap = await api('/api/auth/bootstrap');
        } catch {
          state.authBootstrap = { mode: 'locked', demo_login_enabled: false, login_required: true };
        }
      }
      render();
      return;
    }
    state.error = error.message || 'Unable to load application data.';
  } finally {
    state.loading = false;
    render();
  }
}

function setPage(page) {
  if (currentSurface() === 'platform' || PLATFORM_PAGE_TITLES[page]) {
    state.surface = 'platform';
    state.platformPage = page;
    state.platformTenantId = page === 'Tenant Detail' ? state.platformTenantId : state.platformTenantId;
    if (typeof localStorage !== 'undefined') localStorage.setItem('opstrax.platform.page', page);
    if (typeof window !== 'undefined') {
      const nextPath = platformPathForPage(page);
      if (window.location.pathname !== nextPath) window.history.pushState({}, '', nextPath);
    }
  } else {
    state.surface = 'tenant';
    state.page = page;
    state.workerMode = page === 'Worker-Safe Mode';
    if (typeof localStorage !== 'undefined') localStorage.setItem('opstrax.page', page);
  }
  render();
}

function activeTenant() {
  return state.bootstrap?.tenant || null;
}

function summaryCards() {
  const s = state.bootstrap?.summary?.kpis || {};
  return [
    ['Inventory Records', s.activeItems ?? 0, 'Live item catalog'],
    ['Inventory Risk', s.lowStock ?? 0, 'Below minimum threshold'],
    ['Operational Work', s.openRequests ?? 0, 'Submitted or in progress'],
    ['Procurement Queue', s.purchaseQueue ?? 0, 'Draft and pending approvals'],
    ['Offline Review', s.offlineBatches ?? 0, 'Supervisor review required'],
    ['Finance Readiness', s.validationErrors ?? 0, 'Validation blockers to clear']
  ];
}

function topbarActions() {
  return `
    <div class="topbar-actions">
      <button class="primary" data-action="refresh" type="button">Refresh Workspace</button>
      ${state.bootstrap?.session ? `<button class="ghost" data-action="logout" type="button">Sign out</button>` : ''}
    </div>
  `;
}

function sidebar() {
  const authMode = state.bootstrap?.auth?.mode || state.authMode || 'dev';
  const session = state.bootstrap?.session;
  const tenant = state.bootstrap?.tenant?.name || 'OpsTrax tenant';
  return `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 48 48" role="img" focusable="false" aria-hidden="true">
            <defs>
              <linearGradient id="opstraxMark" x1="6" y1="7" x2="42" y2="41" gradientUnits="userSpaceOnUse">
                <stop stop-color="#9be7ff"/>
                <stop offset="0.48" stop-color="#5b8cff"/>
                <stop offset="1" stop-color="#14b8a6"/>
              </linearGradient>
            </defs>
            <rect x="8" y="8" width="32" height="32" rx="12" fill="rgba(255,255,255,.05)" stroke="url(#opstraxMark)" stroke-width="1.4"/>
            <path d="M14 25.5C17 19 22 15 28.7 15c4.2 0 7.4 1.4 9.9 4.2" fill="none" stroke="url(#opstraxMark)" stroke-width="2.1" stroke-linecap="round"/>
            <path d="M34 22.5C31 29 26 33 19.3 33c-4.2 0-7.4-1.4-9.9-4.2" fill="none" stroke="url(#opstraxMark)" stroke-width="2.1" stroke-linecap="round" opacity=".92"/>
            <circle cx="24" cy="24" r="4.1" fill="url(#opstraxMark)"/>
          </svg>
        </div>
      <div>
          <div class="brand-title">OpsTrax</div>
          <div class="brand-subtitle">SupplyOps</div>
        </div>
      </div>
      <div class="session-card">
        <label>Workspace</label>
        <div class="session-readout">
          <strong>${h(tenant)}</strong>
          <span>${h(session?.display_name || state.bootstrap?.user?.name || 'OpsTrax user')}</span>
          <small>${authMode === 'oidc' ? 'SSO session active' : 'Local workspace mode active'}</small>
        </div>
      </div>
      ${PAGE_GROUPS.map((group) => `
        <div class="nav-group">
          <div class="nav-title">${h(group.title)}</div>
          ${group.items.filter((page) => isPageEnabled(page)).map((page) => `
            <button class="nav-item ${state.page === page ? 'active' : ''}" data-page="${h(page)}" type="button">
              <span class="nav-dot"></span>
              <span>${h(page)}</span>
            </button>
          `).join('')}
        </div>
      `).join('')}
      <div class="sidebar-footer">
        <div class="compliance-pill">Tenant Isolation · Audit Logging</div>
        <div class="footer-note">Tenant context stays isolated to ${h(activeTenant()?.industry || 'enterprise operations')}.</div>
      </div>
    </aside>
  `;
}

function hero(titleOverride = '', descriptionOverride = '') {
  const tenant = activeTenant();
  const user = currentUser();
  const summary = state.bootstrap?.summary?.compliance || {};
  const summaryState = shellSummary();
  const workQueue = Number(summaryState.openRequests || 0) + Number(summaryState.purchaseQueue || 0) + Number(summaryState.offlineBatches || 0);
  const readiness = Number(summary.auditCoverage || 0) >= 95 && Number(summary.exportReady || 0) >= 90 ? 'Audit-backed' : 'Review required';
  const title = titleOverride || 'OpsTrax SupplyOps';
  const description = descriptionOverride || `${SECTION_NOTE[state.page] || 'Live operational control with tenant-scoped data, approvals, audit logs, and compliance checks.'} Workspace: ${tenant?.name || 'OpsTrax tenant'}.`;
  return `
    <section class="hero">
      <div class="hero-copy">
        <div class="eyebrow">${h(tenant?.industry || 'Controlled facility operations')}</div>
        <h1>${h(title)}</h1>
        <p>${h(description)}</p>
        <div class="chip-row">
          <span class="chip">Workspace: ${h(tenant?.name || '')}</span>
          <span class="chip">Environment: Operational</span>
          <span class="chip">Plan: Enterprise</span>
          <span class="chip">Facilities: ${h(primaryFacilityName())}</span>
          <span class="chip">Operator: ${h(user?.name || '')}</span>
          <span class="chip">Role: ${h(user?.role_key || '')}</span>
          <span class="chip">Compliance posture: ${readiness}</span>
          <span class="chip">Finance readiness: ${Number(summary.exportReady || 0) >= 90 ? 'Ready' : 'Review'}</span>
        </div>
      </div>
      <div class="hero-aside">
        <div class="mini-metric">
          <span>Operational status</span>
          <strong>${readiness}</strong>
        </div>
        <div class="mini-metric">
          <span>Operational work queue</span>
          <strong>${workQueue}</strong>
        </div>
        <div class="mini-metric">
          <span>Exception signals</span>
          <strong>${Number(summary.offlineReviewQueue || 0) + Number(summary.evidenceAttached || 0) + Number(summary.auditCoverage || 0) > 0 ? 'Tracked' : 'Clear'}</strong>
        </div>
      </div>
    </section>
  `;
}

function moduleBanner({ eyebrow = 'Commercial workspace', title, purpose, status, chips = [], actions = [] }) {
  return `
    <section class="module-banner panel">
      <div class="module-banner-copy">
        <div class="eyebrow">${h(eyebrow)}</div>
        <h2>${h(title)}</h2>
        <p>${h(purpose)}</p>
        <div class="module-banner-meta">
          ${status ? `<span class="status-pill status-neutral">${h(status)}</span>` : ''}
          ${chips.length ? `<div class="shell-chips">${chips.map((chip) => `<span class="chip">${h(chip)}</span>`).join('')}</div>` : ''}
        </div>
      </div>
      ${actions.length ? `
        <div class="module-banner-actions">
          ${actions.join('')}
        </div>
      ` : ''}
    </section>
  `;
}

function moduleSignals(items) {
  return `
    <section class="module-signal-grid">
      ${items.map((item) => `
        <article class="signal-card ${h(item.tone || '')}">
          <div class="eyebrow">${h(item.kind)}</div>
          <strong>${h(item.title)}</strong>
          <p>${h(item.detail)}</p>
        </article>
      `).join('')}
    </section>
  `;
}

function tenantAuthPage() {
  const demoEnabled = Boolean(state.authBootstrap?.demo_login_enabled);
  const ssoEnabled = Boolean(state.authBootstrap?.enabled);
  return `
    <section class="auth-shell">
      <div class="auth-card panel">
        <div class="brand" style="margin-bottom:14px;padding:0">
          <div class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="img" focusable="false" aria-hidden="true">
              <defs>
                <linearGradient id="opstraxMarkAuth" x1="6" y1="7" x2="42" y2="41" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#9be7ff"/>
                  <stop offset="0.48" stop-color="#5b8cff"/>
                  <stop offset="1" stop-color="#14b8a6"/>
                </linearGradient>
              </defs>
              <rect x="8" y="8" width="32" height="32" rx="12" fill="rgba(255,255,255,.05)" stroke="url(#opstraxMarkAuth)" stroke-width="1.4"/>
              <path d="M14 25.5C17 19 22 15 28.7 15c4.2 0 7.4 1.4 9.9 4.2" fill="none" stroke="url(#opstraxMarkAuth)" stroke-width="2.1" stroke-linecap="round"/>
              <path d="M34 22.5C31 29 26 33 19.3 33c-4.2 0-7.4-1.4-9.9-4.2" fill="none" stroke="url(#opstraxMarkAuth)" stroke-width="2.1" stroke-linecap="round" opacity=".92"/>
              <circle cx="24" cy="24" r="4.1" fill="url(#opstraxMarkAuth)"/>
            </svg>
          </div>
          <div>
            <div class="brand-title">OpsTrax</div>
            <div class="brand-subtitle">SupplyOps</div>
          </div>
        </div>
        <div class="auth-grid">
          <div>
            <div class="eyebrow">Production access</div>
            <h1>Sign in with SSO</h1>
            <p>Use your organization identity provider to access the tenant-scoped operations workspace.</p>
            ${state.error ? `<p class="muted auth-error">${h(state.error)}</p>` : ''}
            <div class="auth-actions">
              ${ssoEnabled ? `<a class="primary auth-button" href="${h(state.authBootstrap?.start_url || state.loginUrl || '/auth/login')}">Continue with SSO</a>` : `<button class="primary auth-button" type="button" disabled>Continue with SSO</button>`}
              ${demoEnabled ? `<button class="ghost auth-button" data-action="demo-login" type="button">Enter Demo Workspace</button>` : ''}
            </div>
            ${ssoEnabled ? '' : `<p class="muted" style="margin-top:10px">SSO configuration required for this workspace.</p>`}
            ${demoEnabled ? `<p class="muted" style="margin-top:10px">Local demo mode only. Click Enter Demo Workspace to open the seeded IntelliFlow admin workspace.</p>` : ''}
          </div>
          <div class="auth-side">
            <div class="auth-metric"><span>Tenant isolation</span><strong>Server enforced</strong></div>
            <div class="auth-metric"><span>Audit trail</span><strong>Always on</strong></div>
            <div class="auth-metric"><span>Workflow posture</span><strong>Compliance-aware</strong></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

function platformAuthPage() {
  const demoEnabled = Boolean(state.platformAuthBootstrap?.demo_login_enabled);
  const ssoEnabled = Boolean(state.platformAuthBootstrap?.enabled);
  return `
    <section class="auth-shell">
      <div class="auth-card panel">
        <div class="brand" style="margin-bottom:14px;padding:0">
          <div class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 48 48" role="img" focusable="false" aria-hidden="true">
              <defs>
                <linearGradient id="opstraxPlatformMarkAuth" x1="6" y1="7" x2="42" y2="41" gradientUnits="userSpaceOnUse">
                  <stop stop-color="#9be7ff"/>
                  <stop offset="0.48" stop-color="#5b8cff"/>
                  <stop offset="1" stop-color="#14b8a6"/>
                </linearGradient>
              </defs>
              <rect x="8" y="8" width="32" height="32" rx="12" fill="rgba(255,255,255,.05)" stroke="url(#opstraxPlatformMarkAuth)" stroke-width="1.4"/>
              <path d="M14 25.5C17 19 22 15 28.7 15c4.2 0 7.4 1.4 9.9 4.2" fill="none" stroke="url(#opstraxPlatformMarkAuth)" stroke-width="2.1" stroke-linecap="round"/>
              <path d="M34 22.5C31 29 26 33 19.3 33c-4.2 0-7.4-1.4-9.9-4.2" fill="none" stroke="url(#opstraxPlatformMarkAuth)" stroke-width="2.1" stroke-linecap="round" opacity=".92"/>
              <circle cx="24" cy="24" r="4.1" fill="url(#opstraxPlatformMarkAuth)"/>
            </svg>
          </div>
          <div>
            <div class="brand-title">OpsTrax</div>
            <div class="brand-subtitle">Platform Control Plane</div>
          </div>
        </div>
        <div class="auth-grid">
          <div>
            <div class="eyebrow">Platform access</div>
            <h1>Platform Admin Sign-In</h1>
            <p>Use the platform control plane to manage tenants, plans, support sessions, and system posture.</p>
            ${state.error ? `<p class="muted auth-error">${h(state.error)}</p>` : ''}
            <div class="auth-actions">
              ${ssoEnabled ? `<a class="primary auth-button" href="${h(state.platformAuthBootstrap?.start_url || state.loginUrl || '/platform/login')}">Continue with Platform SSO</a>` : `<button class="primary auth-button" type="button" disabled>Continue with Platform SSO</button>`}
              ${demoEnabled ? `<button class="ghost auth-button" data-action="platform-demo-login" type="button">Enter Platform Workspace</button>` : ''}
            </div>
            ${ssoEnabled ? '' : `<p class="muted" style="margin-top:10px">Platform SSO configuration required before production access.</p>`}
            ${demoEnabled ? `<p class="muted" style="margin-top:10px">Local demo mode only. Use the seeded platform owner workspace for the control plane.</p>` : ''}
          </div>
          <div class="auth-side">
            <div class="auth-metric"><span>Platform isolation</span><strong>Separate session</strong></div>
            <div class="auth-metric"><span>Audit trail</span><strong>Platform-only</strong></div>
            <div class="auth-metric"><span>Support access</span><strong>Audited</strong></div>
          </div>
        </div>
      </div>
    </section>
  `;
}

export function authPage() {
  return currentSurface() === 'platform' ? platformAuthPage() : tenantAuthPage();
}

function strategyBoard() {
  const lens = pageLens();
  return `
    <section class="strategy-grid">
      <div class="strategy-card">
        <div class="eyebrow">Core controls</div>
        <ul>
          ${lens.mustHave.map((item) => `<li>${h(item)}</li>`).join('')}
        </ul>
      </div>
      <div class="strategy-card">
        <div class="eyebrow">Commercial parity</div>
        <ul>
          ${lens.parity.map((item) => `<li>${h(item)}</li>`).join('')}
        </ul>
      </div>
      <div class="strategy-card">
        <div class="eyebrow">Differentiators</div>
        <ul>
          ${lens.bonus.map((item) => `<li>${h(item)}</li>`).join('')}
        </ul>
      </div>
      <div class="strategy-card">
        <div class="eyebrow">AI governance</div>
        <ul>
          ${lens.ai.map((item) => `<li>${h(item)}</li>`).join('')}
        </ul>
      </div>
    </section>
  `;
}

function workspaceRail() {
  const lens = pageLens();
  const signals = pageSignals();
  return `
    <aside class="workspace-rail">
      <div class="rail-card rail-sticky">
        <div class="eyebrow">Live posture</div>
        <div class="rail-stat"><span>Audit coverage</span><strong>${signals.auditCoverage}%</strong></div>
        <div class="rail-stat"><span>Export readiness</span><strong>${signals.exportReady}%</strong></div>
        <div class="rail-stat"><span>Evidence attached</span><strong>${signals.evidenceAttached}%</strong></div>
      </div>
      <div class="rail-card">
        <div class="eyebrow">Next best action</div>
        <p>${h(lens.score[4])}</p>
        <p class="muted">${h(lens.score[0])}</p>
        <p class="muted">${h(lens.score[1])}</p>
        <p class="muted">${h(lens.score[2])}</p>
        <p class="muted">${h(lens.score[3])}</p>
      </div>
      <div class="rail-card">
        <div class="eyebrow">Controlled facility advantage</div>
        <ul>
          <li>Operational workflows own the compliance story, not static pages.</li>
          <li>AI sits beside the work queue and explains the risk, not just the result.</li>
          <li>Every action is tenant-scoped, permissioned, and auditable by default.</li>
        </ul>
      </div>
    </aside>
  `;
}

function workspaceShell(content) {
  return `
    <div class="workspace-shell">
      <div class="workspace-stage">
        ${content}
      </div>
      ${workspaceRail()}
    </div>
  `;
}

function kpiGrid() {
  return `
    <section class="kpi-grid">
      ${summaryCards().map(([label, value, detail]) => `
        <div class="panel kpi">
          <div class="kpi-label">${h(label)}</div>
          <div class="kpi-value">${h(value)}</div>
          <div class="kpi-detail">${h(detail)}</div>
        </div>
      `).join('')}
    </section>
  `;
}

function table(rows, headings, renderRow) {
  return `
    <table class="table">
      <thead>
        <tr>${headings.map((heading) => `<th>${h(heading)}</th>`).join('')}</tr>
      </thead>
      <tbody>
        ${rows.map(renderRow).join('')}
      </tbody>
    </table>
  `;
}

function commandCenter() {
  const items = state.data?.items?.items || [];
  const requests = state.data?.requests?.requests || [];
  const purchases = state.data?.purchaseRequests?.purchaseRequests || [];
  const syncBatches = state.data?.syncBatches?.syncBatches || [];
  const exportsData = state.data?.exports || { batches: [], errors: [] };
  return `
    ${hero()}
    ${kpiGrid()}
    ${strategyBoard()}
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Operational Exceptions</h2>
            <p>Low stock, review queues, and export blockers surface here first.</p>
          </div>
          ${isPageEnabled('FinanceSync Export Hub') ? `<button class="ghost" data-page="FinanceSync Export Hub" type="button">Open Finance Export Hub</button>` : ''}
        </div>
        ${table(
          [
            ...items.filter((item) => Number(item.low_stock) === 1).slice(0, 3).map((item) => ({ kind: 'Low stock', name: item.name, detail: `${item.on_hand} on hand / min ${item.min_qty}`, action: 'Procurement & Purchasing' })),
            ...syncBatches.filter((batch) => batch.review_status === 'PENDING').slice(0, 2).map((batch) => ({ kind: 'Offline batch', name: batch.id, detail: `${batch.task_count} tasks / ${batch.exception_count} exceptions`, action: 'OfflineOps' })),
            ...exportsData.errors.slice(0, 2).map((error) => ({ kind: error.severity, name: error.code, detail: error.message, action: 'FinanceSync Export Hub' }))
          ],
          ['Type', 'Record', 'Detail', 'Action'],
          (row) => `
            <tr>
              <td>${badge(row.kind)}</td>
              <td><strong>${h(row.name)}</strong></td>
              <td class="muted">${h(row.detail)}</td>
              <td><button class="ghost" data-page="${h(row.action)}" type="button">Open</button></td>
            </tr>
          `
        )}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Audit Timeline</h2>
            <p>Critical writes are logged with actor, scope, and before/after state.</p>
          </div>
        </div>
        <div class="timeline">
          ${(state.data?.audit?.audit || []).slice(0, 6).map((entry) => `
            <div class="timeline-row">
              <div class="timeline-dot"></div>
              <div>
                <strong>${h(entry.action)}</strong>
                <span>${h(entry.summary)} · ${h(entry.actor_name)} · ${fmt(entry.created_at)}</span>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Active Work</h2>
          <p>Current requests and purchasing posture from the live tenant.</p>
        </div>
        <button class="primary" data-page="Internal Storefront" type="button">Create Request</button>
      </div>
      <div class="two-up">
        <div>
          <h3 class="subhead">Internal Requests</h3>
          ${table(requests.slice(0, 4), ['Request', 'Department', 'Status', 'Age'], (row) => `
            <tr>
              <td><strong>${h(row.request_no)}</strong><div class="muted">${h(row.purpose)}</div></td>
              <td>${h(row.department_name)}</td>
              <td>${badge(row.status)}</td>
              <td>${fmt(row.created_at)}</td>
            </tr>
          `)}
        </div>
        <div>
          <h3 class="subhead">Purchase Requests</h3>
          ${table(purchases.slice(0, 4), ['PR', 'Vendor', 'Amount', 'Status'], (row) => `
            <tr>
              <td><strong>${h(row.pr_no)}</strong><div class="muted">${h(row.accounting_code || 'Missing accounting code')}</div></td>
              <td>${h(row.vendor_name)}</td>
              <td>${money(row.total_amount)}</td>
              <td>${badge(row.status)}</td>
            </tr>
          `)}
        </div>
      </div>
    </section>
  `;
}

export function requestsPage() {
  const requests = state.data?.requests?.requests || [];
  const requestItemSource = state.availableRequestItems?.items || [];
  const items = requestItemSource.length
    ? requestItemSource
    : (state.data?.inventory?.items?.items || state.data?.items?.items || []).filter((item) => Number(item.controlled ?? item.restricted ?? 0) === 0 || can('view_restricted_items'));
  const departments = state.bootstrap?.lookups?.departments || [];
  const facilities = state.bootstrap?.lookups?.facilities || [];
  const me = currentUser();
  const privileged = me && ['admin', 'supervisor'].includes(me.role_key);
  const defaultDepartmentId = me?.department_id || departments[0]?.id || '';
  const defaultFacilityId = me?.facility_id || facilities[0]?.id || '';
  const selectedRequestId = state.drawerFocus?.type === 'request' ? state.drawerFocus.id : '';
  const selectedRequest = state.requestDetails?.[selectedRequestId]?.request || requests.find((row) => row.id === selectedRequestId) || null;
  const selectedRequestStatus = selectedRequest?.status || '';
  const selectedLines = state.requestDetails?.[selectedRequestId]?.lines || [];
  const selectedLineDraft = state.requestLineDraft?.requestId === selectedRequestId ? state.requestLineDraft : null;
  const requestOwnedOrPrivileged = Boolean(selectedRequest && (privileged || selectedRequest.requested_by_user_id === me?.id));
  const requestCanEdit = Boolean(selectedRequest && selectedRequest.status === 'DRAFT' && requestOwnedOrPrivileged && can('create_request'));
  const requestCanReject = Boolean(selectedRequest && selectedRequest.status === 'SUBMITTED' && requestOwnedOrPrivileged && can('reject_request'));
  return `
    ${hero()}
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Request Draft</h2>
            <p>Drafts are created here, then submitted through the backend workflow.</p>
          </div>
        </div>
        ${can('create_request') ? '' : '<div class="empty-state compact-empty">Your role cannot create request drafts in this tenant.</div>'}
        <form id="requestForm" class="form-grid">
          <label class="field">
            <span>Department</span>
            <select name="departmentId" ${privileged ? '' : 'disabled'}>
              ${departments.map((dept) => `<option value="${h(dept.id)}" ${dept.id === defaultDepartmentId ? 'selected' : ''}>${h(dept.name)}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Facility</span>
            <select name="facilityId" ${privileged ? '' : 'disabled'}>
              ${facilities.map((facility) => `<option value="${h(facility.id)}" ${facility.id === defaultFacilityId ? 'selected' : ''}>${h(facility.name)}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Priority</span>
            <select name="priority">
              <option>LOW</option>
              <option selected>NORMAL</option>
              <option>HIGH</option>
              <option>URGENT</option>
            </select>
          </label>
          <label class="field" style="grid-column:1 / -1">
            <span>Purpose</span>
            <input name="purpose" placeholder="Restock clinic intake desk" />
          </label>
          <label class="field">
            <span>Item</span>
            <select name="itemId">
              ${items.map((item) => `<option value="${h(item.id)}">${h(item.name)}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Quantity</span>
            <input name="qty" type="number" min="1" step="1" value="10" />
          </label>
          <div class="actions-row">
            <button class="primary" type="submit" ${can('create_request') ? '' : 'disabled'}>Save Draft</button>
          </div>
        </form>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Request Queue</h2>
            <p>Draft, submitted, approved, issued, and cancelled states are all server-controlled.</p>
          </div>
        </div>
        ${table(requests, ['Request', 'Department', 'Status', 'Lines', 'Action'], (row) => {
          const buttons = [];
          const rowOwnedOrPrivileged = privileged || row.requested_by_user_id === me?.id;
          if (row.status === 'DRAFT') {
            if (rowOwnedOrPrivileged && can('submit_request')) buttons.push(`<button class="ghost" data-action="submit-request" data-id="${h(row.id)}" type="button">Submit</button>`);
            if (rowOwnedOrPrivileged && can('cancel_request')) buttons.push(`<button class="ghost" data-action="cancel-request" data-id="${h(row.id)}" type="button">Cancel</button>`);
          } else if (row.status === 'SUBMITTED') {
            if (can('approve_request')) buttons.push(`<button class="ghost" data-action="approve-request" data-id="${h(row.id)}" type="button">Approve</button>`);
            if (rowOwnedOrPrivileged && can('cancel_request')) buttons.push(`<button class="ghost" data-action="cancel-request" data-id="${h(row.id)}" type="button">Cancel</button>`);
          } else if (row.status === 'APPROVED' || row.status === 'ISSUE_READY' || row.status === 'PICKING') {
            buttons.push(`<span class="muted">Issue-ready in warehouse workflow</span>`);
          }
          return `
            <tr>
              <td>
                <button class="ghost small" data-drawer-focus="request" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.request_no)}</button>
                <div class="muted">${h(row.requester_name)}</div>
              </td>
              <td>${h(row.department_name)}<div class="muted">${h(row.facility_name)}</div></td>
              <td>${badge(row.status)}</td>
              <td>${h(row.line_count || 0)} line(s)</td>
              <td>${buttons.length ? buttons.join(' ') : '—'}</td>
            </tr>
          `;
        })}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Selected Request</h2>
            <p>Edit the request draft, manage lines, or reject a submitted request from the real backend contract.</p>
          </div>
        </div>
        ${selectedRequest ? `
          <div class="drawer-stack">
            <div class="drawer-row">
              <strong>${h(selectedRequest.request_no)}</strong>
              <span>${h(selectedRequest.department_name)} · ${h(selectedRequest.status)}</span>
            </div>
            ${requestCanEdit ? `
              <form id="requestDraftForm" class="form-grid">
                <input type="hidden" name="requestId" value="${h(selectedRequest.id)}" />
                <label class="field">
                  <span>Department</span>
                  <select name="departmentId" ${privileged ? '' : 'disabled'}>
                    ${departments.map((dept) => `<option value="${h(dept.id)}" ${dept.id === selectedRequest.department_id ? 'selected' : ''}>${h(dept.name)}</option>`).join('')}
                  </select>
                </label>
                <label class="field">
                  <span>Facility</span>
                  <select name="facilityId" ${privileged ? '' : 'disabled'}>
                    ${facilities.map((facility) => `<option value="${h(facility.id)}" ${facility.id === selectedRequest.facility_id ? 'selected' : ''}>${h(facility.name)}</option>`).join('')}
                  </select>
                </label>
                <label class="field">
                  <span>Priority</span>
                  <select name="priority">
                    ${['LOW', 'NORMAL', 'HIGH', 'URGENT'].map((value) => `<option value="${value}" ${value === selectedRequest.priority ? 'selected' : ''}>${value}</option>`).join('')}
                  </select>
                </label>
                <label class="field" style="grid-column:1 / -1">
                  <span>Reason</span>
                  <input name="reason" value="${h(selectedRequest.reason || selectedRequest.purpose || '')}" />
                </label>
                <label class="field" style="grid-column:1 / -1">
                  <span>Needed by</span>
                  <input name="neededByDate" value="${h(selectedRequest.needed_by_date || '')}" placeholder="2026-06-20" />
                </label>
                <div class="actions-row">
                  <button class="primary" type="submit">Update Draft</button>
                </div>
              </form>
            ` : `<div class="empty-state compact-empty">${selectedRequestStatus === 'DRAFT' ? 'You cannot edit this draft in the current role or scope.' : 'This request is no longer editable as a draft.'}</div>`}
            <div class="section-divider"></div>
            ${requestCanEdit ? `
              <form id="requestLineForm" class="form-grid">
                <input type="hidden" name="requestId" value="${h(selectedRequest.id)}" />
                <input type="hidden" name="lineId" value="${h(selectedLineDraft?.lineId || '')}" />
                <label class="field">
                  <span>Item</span>
                  <select name="itemId">
                    ${items.map((item) => `<option value="${h(item.id)}" ${item.id === (selectedLineDraft?.itemId || '') ? 'selected' : ''}>${h(item.name)}</option>`).join('')}
                  </select>
                </label>
                <label class="field">
                  <span>Quantity</span>
                  <input name="qty" type="number" min="1" step="1" value="${h(selectedLineDraft?.qty || 1)}" />
                </label>
                <div class="actions-row">
                  <button class="primary" type="submit">${selectedLineDraft ? 'Update Line' : 'Add Line'}</button>
                  ${selectedLineDraft ? `<button class="ghost" type="button" data-action="clear-request-line">Clear</button>` : ''}
                </div>
              </form>
            ` : '<div class="empty-state compact-empty">Line editing is only available while the request is a draft.</div>'}
            <div class="table-wrap">
              ${selectedLines.length ? table(selectedLines, ['Item', 'Qty', 'Status', 'Actions'], (line) => `
                <tr>
                  <td>
                    <strong>${h(line.item_name || line.item_id)}</strong>
                    <div class="muted">${h(line.category || '')} · ${h(line.barcode || '')}</div>
                  </td>
                  <td>${h(line.qty_requested)}</td>
                  <td>${badge(line.status)}</td>
                  <td>
                    ${requestCanEdit ? `
                      <button class="ghost small" type="button" data-action="edit-request-line" data-line-id="${h(line.id)}" data-item-id="${h(line.item_id)}" data-qty="${h(line.qty_requested)}">Edit</button>
                      <button class="ghost small" type="button" data-action="delete-request-line" data-line-id="${h(line.id)}">Delete</button>
                    ` : '—'}
                  </td>
                </tr>
              `) : '<div class="empty-state compact-empty">No request lines loaded for this selection.</div>'}
            </div>
            ${requestCanReject ? `
              <form id="requestRejectForm" class="form-grid">
                <input type="hidden" name="requestId" value="${h(selectedRequest.id)}" />
                <label class="field" style="grid-column:1 / -1">
                  <span>Reject reason</span>
                  <input name="reason" placeholder="Missing evidence, incorrect scope, or policy issue" required />
                </label>
                <div class="actions-row">
                  <button class="ghost red" type="submit">Reject Request</button>
                </div>
              </form>
            ` : ''}
          </div>
        ` : '<div class="empty-state compact-empty">Select a request row to inspect draft editing, line management, and reject controls.</div>'}
      </div>
    </section>
  `;
}

export function inventoryPage() {
  const inventory = state.data?.inventory || {};
  const items = inventory.items?.items || state.data?.items?.items || [];
  const categories = inventory.categories?.categories || [];
  const balances = inventory.balances?.balances || [];
  const movements = inventory.movements?.movements || [];
  const adjustments = inventory.adjustments?.adjustments || [];
  const bins = inventory.bins?.bins || [];
  const documents = state.data?.documents?.documents || [];
  const summary = inventory.summary?.items || {
    total: items.length,
    lowStock: items.filter((item) => Number(item.low_stock) === 1).length,
    restricted: items.filter((item) => Number(item.controlled) === 1).length,
    categories: categories.length,
    bins: bins.length,
    movements: movements.length,
    adjustments: adjustments.length
  };
  const filter = state.inventoryFilter.trim().toLowerCase();
  const rows = items.filter((item) => `${item.name} ${item.category} ${item.barcode} ${item.sku}`.toLowerCase().includes(filter));
  const selectedItemId = state.drawerFocus?.type === 'inventory-item' ? state.drawerFocus.id : '';
  const selectedItem = items.find((item) => item.id === selectedItemId) || null;
  const selectedCategoryId = selectedItem?.item_category_id || categories.find((category) => category.name === selectedItem?.category)?.id || categories[0]?.id || '';
  const selectedBinId = selectedItem ? (balances.find((balance) => balance.item_id === selectedItem.id)?.bin_id || bins.find((bin) => bin.facility_id === balances.find((balance) => balance.item_id === selectedItem.id)?.facility_id)?.id || bins[0]?.id || '') : bins[0]?.id || '';
  const canWrite = (state.identity?.features || state.bootstrap?.features || []).includes('inventory_core_write');
  const formDisabled = canWrite ? '' : 'disabled';
  const itemFormTitle = selectedItem ? `Update ${selectedItem.name}` : 'Create item';
  const itemFormButton = selectedItem ? 'Update Item' : 'Create Item';
  const itemTypeValue = selectedItem?.item_type || 'SUPPLY';
  const statusValue = selectedItem?.status || 'ACTIVE';
  const controlledValue = Number(selectedItem?.controlled ?? selectedItem?.restricted ?? 0) === 1 ? '1' : '0';
  const lotValue = Number(selectedItem?.lot_required ?? 0) === 1 ? '1' : '0';
  const serialValue = Number(selectedItem?.serial_required ?? 0) === 1 ? '1' : '0';
  const expiryValue = Number(selectedItem?.expiry_required ?? 0) === 1 ? '1' : '0';
  const currentAdjustment = adjustments[0] || null;
  const canViewRestricted = (state.identity?.capabilities || state.bootstrap?.capabilities || []).includes('view_restricted_items');
  return `
    <div class="workspace-shell shell-shell">
      <div class="workspace-stage shell-stage">
        <section class="panel landing-section">
          <div class="section-head">
            <div>
              <h2>Inventory Control</h2>
              <p>Tenant-scoped item master, balances, movements, and evidence-aware adjustments backed by live data.</p>
            </div>
            <div class="inline-controls">
              <input id="inventoryFilter" placeholder="Filter items, barcode, category" value="${h(state.inventoryFilter)}" />
            </div>
          </div>
          <div class="kpi-grid">
            <div class="panel kpi"><div class="kpi-label">Items</div><div class="kpi-value">${h(summary.total ?? 0)}</div><div class="kpi-detail">Visible to the current role.</div></div>
            <div class="panel kpi"><div class="kpi-label">Low Stock</div><div class="kpi-value">${h(summary.lowStock ?? 0)}</div><div class="kpi-detail">Below min threshold.</div></div>
            <div class="panel kpi"><div class="kpi-label">Restricted</div><div class="kpi-value">${h(canViewRestricted ? (summary.restricted ?? 0) : 0)}</div><div class="kpi-detail">${canViewRestricted ? 'Visible with restricted-item permission.' : 'Hidden by role when restricted.'}</div></div>
            <div class="panel kpi"><div class="kpi-label">Categories</div><div class="kpi-value">${h(summary.categories ?? 0)}</div><div class="kpi-detail">Normalized item groups.</div></div>
            <div class="panel kpi"><div class="kpi-label">Bins</div><div class="kpi-value">${h(summary.bins ?? 0)}</div><div class="kpi-detail">Tenant storage locations.</div></div>
            <div class="panel kpi"><div class="kpi-label">Movements</div><div class="kpi-value">${h(summary.movements ?? 0)}</div><div class="kpi-detail">Receipts, issues, and adjustments.</div></div>
          </div>
        </section>

        <section class="split">
          <div class="panel">
            <div class="panel-head">
              <div>
                <h2>Item Master</h2>
                <p>Click an item to inspect it in the drawer. The backend enforces tenant scope and write policy.</p>
              </div>
              ${canWrite ? `<span class="badge green">Writes enabled</span>` : `<span class="badge amber">Read only</span>`}
            </div>
            ${rows.length ? table(rows.slice(0, 12), ['Item', 'Barcode', 'Bin', 'On Hand', 'Min/Max', 'Status'], (row) => `
              <tr>
                <td>
                  <button class="ghost small" data-drawer-focus="inventory-item" data-drawer-id="${h(row.id)}" type="button">${h(row.name)}</button>
                  <div class="muted">${h(row.category)} · ${h(row.sku)}</div>
                </td>
                <td>${h(row.barcode)}</td>
                <td>${h(row.bin_count ? `${row.bin_count} bin(s)` : '—')}</td>
                <td>${h(row.on_hand)} <span class="muted">(${h(row.reserved)} reserved)</span></td>
                <td>${h(row.min_stock || row.min_qty)}/${h(row.max_stock || row.max_qty)}</td>
                <td>${Number(row.low_stock) === 1 ? badge('Low Stock') : Number(row.controlled) === 1 ? badge('Controlled') : badge('Healthy')}</td>
              </tr>
            `) : '<div class="empty-state compact-empty">No inventory items are available for this tenant context.</div>'}
          </div>

          <div class="panel">
            <div class="panel-head">
              <div>
                <h2>${h(itemFormTitle)}</h2>
                <p>${canWrite ? 'Changes are validated and audited by the backend.' : 'Write actions are disabled for this tenant or role.'}</p>
              </div>
            </div>
            ${canWrite ? `
              <form id="inventoryItemForm" class="form-grid">
                <input type="hidden" name="itemId" value="${h(selectedItem?.id || '')}" />
                <label class="field">
                  <span>SKU</span>
                  <input name="sku" value="${h(selectedItem?.sku || '')}" placeholder="INT-GLV-001" ${formDisabled} />
                </label>
                <label class="field">
                  <span>Name</span>
                  <input name="name" value="${h(selectedItem?.name || '')}" placeholder="Nitrile Gloves - Medium" ${formDisabled} />
                </label>
                <label class="field">
                  <span>Category</span>
                  <select name="categoryId" ${formDisabled}>
                    ${categories.map((category) => `<option value="${h(category.id)}" ${category.id === selectedCategoryId ? 'selected' : ''}>${h(category.name)}</option>`).join('')}
                  </select>
                </label>
                <label class="field">
                  <span>Unit of measure</span>
                  <input name="unitOfMeasure" value="${h(selectedItem?.unit_of_measure || selectedItem?.uom || '')}" placeholder="box" ${formDisabled} />
                </label>
                <label class="field">
                  <span>Item type</span>
                  <select name="itemType" ${formDisabled}>
                    ${['SUPPLY', 'CONSUMABLE', 'CONTROLLED', 'EQUIPMENT', 'SPARE', 'CHEMICAL', 'PPE'].map((value) => `<option value="${value}" ${value === itemTypeValue ? 'selected' : ''}>${value}</option>`).join('')}
                  </select>
                </label>
                <label class="field">
                  <span>Status</span>
                  <select name="status" ${formDisabled}>
                    ${['ACTIVE', 'HOLD', 'INACTIVE'].map((value) => `<option value="${value}" ${value === statusValue ? 'selected' : ''}>${value}</option>`).join('')}
                  </select>
                </label>
                <label class="field">
                  <span>Controlled</span>
                  <select name="controlled" ${formDisabled}>
                    <option value="0" ${controlledValue === '0' ? 'selected' : ''}>Standard</option>
                    <option value="1" ${controlledValue === '1' ? 'selected' : ''}>Controlled</option>
                  </select>
                </label>
                <label class="field">
                  <span>Supplier</span>
                  <input name="supplier" value="${h(selectedItem?.supplier || '')}" placeholder="MedSupply Direct" ${formDisabled} />
                </label>
                <label class="field">
                  <span>Min stock</span>
                  <input name="minStock" type="number" min="1" step="1" value="${h(selectedItem?.min_stock || selectedItem?.min_qty || 1)}" ${formDisabled} />
                </label>
                <label class="field">
                  <span>Max stock</span>
                  <input name="maxStock" type="number" min="1" step="1" value="${h(selectedItem?.max_stock || selectedItem?.max_qty || 1)}" ${formDisabled} />
                </label>
                <label class="field">
                  <span>Reorder point</span>
                  <input name="reorderPoint" type="number" min="1" step="1" value="${h(selectedItem?.reorder_point || selectedItem?.min_stock || selectedItem?.min_qty || 1)}" ${formDisabled} />
                </label>
                <label class="field">
                  <span>Lot required</span>
                  <select name="lotRequired" ${formDisabled}>
                    <option value="0" ${lotValue === '0' ? 'selected' : ''}>No</option>
                    <option value="1" ${lotValue === '1' ? 'selected' : ''}>Yes</option>
                  </select>
                </label>
                <label class="field">
                  <span>Serial required</span>
                  <select name="serialRequired" ${formDisabled}>
                    <option value="0" ${serialValue === '0' ? 'selected' : ''}>No</option>
                    <option value="1" ${serialValue === '1' ? 'selected' : ''}>Yes</option>
                  </select>
                </label>
                <label class="field">
                  <span>Expiry required</span>
                  <select name="expiryRequired" ${formDisabled}>
                    <option value="0" ${expiryValue === '0' ? 'selected' : ''}>No</option>
                    <option value="1" ${expiryValue === '1' ? 'selected' : ''}>Yes</option>
                  </select>
                </label>
                <label class="field" style="grid-column:1 / -1">
                  <span>Description</span>
                  <textarea name="description" placeholder="Operational description for the inventory passport." ${formDisabled}>${h(selectedItem?.description || '')}</textarea>
                </label>
                <div class="actions-row">
                  <button class="primary" type="submit">${h(itemFormButton)}</button>
                </div>
              </form>
            ` : `
              <div class="empty-state compact-empty">This workspace cannot create or edit inventory items in the current configuration.</div>
            `}
          </div>
        </section>

        <section class="split">
          <div class="panel">
            <div class="panel-head">
              <div>
                <h2>Stock Balances</h2>
                <p>Balance rows are tenant-scoped by facility and bin.</p>
              </div>
            </div>
            ${balances.length ? table(balances.slice(0, 12), ['Item', 'Bin', 'On Hand', 'Available', 'Facility'], (row) => `
              <tr>
                <td>
                  <button class="ghost small" data-drawer-focus="inventory-item" data-drawer-id="${h(row.item_id)}" type="button">${h(row.item_name)}</button>
                  <div class="muted">${h(row.category)} · ${h(row.sku)}</div>
                </td>
                <td>${h(row.bin_code || row.bin_id || '—')}</td>
                <td>${h(row.on_hand)}</td>
                <td>${h(row.available)}</td>
                <td>${h(row.facility_name || row.facility_id || '—')}</td>
              </tr>
            `) : '<div class="empty-state compact-empty">No balance rows are loaded for this tenant yet.</div>'}
          </div>

          <div class="panel">
            <div class="panel-head">
              <div>
                <h2>Post Stock Adjustment</h2>
                <p>Evidence linking is optional and uses a real document id when provided.</p>
              </div>
            </div>
            ${canWrite ? `
              <form id="stockAdjustmentForm" class="form-grid">
                <label class="field">
                  <span>Item</span>
                  <select name="itemId">
                    ${items.map((row) => `<option value="${h(row.id)}" ${row.id === selectedItem?.id ? 'selected' : ''}>${h(row.name)}</option>`).join('')}
                  </select>
                </label>
                <label class="field">
                  <span>Bin</span>
                  <select name="binId">
                    <option value="">Auto-select best bin</option>
                    ${bins.map((bin) => `<option value="${h(bin.id)}" ${bin.id === selectedBinId ? 'selected' : ''}>${h(bin.code)} · ${h(bin.zone)}</option>`).join('')}
                  </select>
                </label>
                <label class="field">
                  <span>Quantity delta</span>
                  <input name="quantityDelta" type="number" step="1" value="1" />
                </label>
                <label class="field">
                  <span>Evidence document</span>
                  <select name="evidenceDocumentId">
                    <option value="">No evidence linked in this workspace</option>
                    ${documents.map((doc) => `<option value="${h(doc.id)}">${h(doc.file_name)} · ${h(doc.doc_type)}</option>`).join('')}
                  </select>
                </label>
                <label class="field">
                  <span>Reason</span>
                  <input name="reason" value="${h(currentAdjustment?.reason || 'Cycle count correction')}" placeholder="Cycle count correction" />
                </label>
                <label class="field">
                  <span>Reference type</span>
                  <input name="referenceType" value="${h(currentAdjustment?.reference_type || 'manual_adjustment')}" />
                </label>
                <label class="field">
                  <span>Reference id</span>
                  <input name="referenceId" value="${h(currentAdjustment?.reference_id || '')}" placeholder="count session or audit reference" />
                </label>
                <label class="field">
                  <span>Lot no.</span>
                  <input name="lotNo" value="${h(currentAdjustment?.lot_no || '')}" />
                </label>
                <label class="field">
                  <span>Serial no.</span>
                  <input name="serialNo" value="${h(currentAdjustment?.serial_no || '')}" />
                </label>
                <label class="field">
                  <span>Expiry date</span>
                  <input name="expiryDate" type="date" value="${h(currentAdjustment?.expiry_date || '')}" />
                </label>
                <label class="field" style="grid-column:1 / -1">
                  <span>Note</span>
                  <textarea name="statusNote" placeholder="Optional status note">${h(currentAdjustment?.status_note || '')}</textarea>
                </label>
                <div class="actions-row">
                  <button class="primary" type="submit">Post Adjustment</button>
                </div>
              </form>
            ` : `
              <div class="empty-state compact-empty">This workspace cannot post stock adjustments in the current configuration.</div>
            `}
          </div>
        </section>

        <section class="split">
          <div class="panel">
            <div class="panel-head">
              <div>
                <h2>Movement History</h2>
                <p>Receipts, issues, and adjustments with before/after quantities.</p>
              </div>
            </div>
            ${movements.length ? table(movements.slice(0, 12), ['Movement', 'Item', 'Qty', 'Before/After', 'Reason'], (row) => `
              <tr>
                <td>
                  <button class="ghost small" data-drawer-focus="inventory-movement" data-drawer-id="${h(row.id)}" type="button">${h(row.movement_type)}</button>
                  <div class="muted">${fmt(row.created_at)}</div>
                </td>
                <td>
                  <button class="ghost small" data-drawer-focus="inventory-item" data-drawer-id="${h(row.item_id)}" type="button">${h(row.item_name)}</button>
                  <div class="muted">${h(row.sku)}</div>
                </td>
                <td>${row.quantity > 0 ? '+' : ''}${h(row.quantity)}</td>
                <td>${h(row.before_quantity)} → ${h(row.after_quantity)}</td>
                <td class="muted">${h(row.reason || row.note || row.reference_type)}</td>
              </tr>
            `) : '<div class="empty-state compact-empty">No stock movements are loaded yet.</div>'}
          </div>

          <div class="panel">
            <div class="panel-head">
              <div>
                <h2>Categories and Bins</h2>
                <p>Normalized item categories and storage locations stay visible in the shell.</p>
              </div>
            </div>
            <div class="field-stack">
              <div>
                <h3 class="subhead">Categories</h3>
                ${categories.length ? table(categories.slice(0, 8), ['Category', 'Items', 'State'], (row) => `
                  <tr>
                    <td>
                      <button class="ghost small" data-drawer-focus="inventory-category" data-drawer-id="${h(row.id)}" type="button">${h(row.name)}</button>
                      <div class="muted">${h(row.code)}</div>
                    </td>
                    <td>${h(row.item_count)}</td>
                    <td>${badge(row.active ? 'Active' : 'Inactive')}</td>
                  </tr>
                `) : '<div class="empty-state compact-empty">No item categories available.</div>'}
              </div>
              <div>
                <h3 class="subhead">Bins</h3>
                ${bins.length ? table(bins.slice(0, 8), ['Bin', 'Facility', 'Stocked', 'Available'], (row) => `
                  <tr>
                    <td>
                      <button class="ghost small" data-drawer-focus="inventory-bin" data-drawer-id="${h(row.id)}" type="button">${h(row.code)}</button>
                      <div class="muted">${h(row.zone)} · ${h(row.shelf)}</div>
                    </td>
                    <td>${h(row.facility_name)}</td>
                    <td>${h(row.stocked_item_count)}</td>
                    <td>${h(row.available)}</td>
                  </tr>
                `) : '<div class="empty-state compact-empty">No bins are available for this tenant.</div>'}
              </div>
            </div>
          </div>
        </section>
      </div>
      ${shellDrawer()}
    </div>
  `;
}

export function warehousePage() {
  const warehouse = state.data?.warehouse || {};
  const summary = warehouse.summary?.summary || {};
  const tasks = warehouse.tasks?.tasks || [];
  const readyRequests = warehouse.issueReadyRequests?.requests || [];
  const bins = warehouse.bins?.bins || [];
  const openTasks = tasks.filter((task) => !['CLOSED', 'CANCELLED'].includes(task.status));
  const manageTasks = can('manage_warehouse_tasks');
  const executeTasks = can('execute_warehouse_tasks');
  return `
    ${hero()}
    <section class="panel module-banner wms-launchpad">
      <div class="module-banner-copy">
        <div class="eyebrow">Warehouse Profitability OS</div>
        <h2>Run the complete warehouse operation</h2>
        <p>Move from capacity reservation through receiving, placement, quality, allocation, shipping, and 3PL billing in one operational control tower.</p>
        <div class="module-banner-meta">
          <span class="status-pill status-ok">Canonical stock synchronized</span>
          <span class="status-pill status-neutral">Capacity + LPN execution</span>
          <span class="status-pill status-neutral">3PL revenue evidence</span>
        </div>
      </div>
      <div class="module-banner-actions">
        <a class="primary wms-launch" href="/warehouse.html">Open WMS Control Tower <span aria-hidden="true">↗</span></a>
      </div>
    </section>
    <section class="kpi-grid">
      <div class="panel kpi"><div class="kpi-label">Open workflows</div><div class="kpi-value">${h(summary.openWorkflows ?? 0)}</div><div class="kpi-detail">Ready requests and active tasks.</div></div>
      <div class="panel kpi"><div class="kpi-label">Issue-ready requests</div><div class="kpi-value">${h(summary.issueReadyRequests ?? 0)}</div><div class="kpi-detail">Awaiting task creation.</div></div>
      <div class="panel kpi"><div class="kpi-label">Open tasks</div><div class="kpi-value">${h(summary.openTasks ?? 0)}</div><div class="kpi-detail">Task headers in progress.</div></div>
      <div class="panel kpi"><div class="kpi-label">Assigned to me</div><div class="kpi-value">${h(summary.assignedToMe ?? 0)}</div><div class="kpi-detail">Visible to the current user scope.</div></div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Issue-ready requests</h2>
            <p>Approved requests wait here until a warehouse task is created.</p>
          </div>
          <span class="badge blue">${h(readyRequests.length)} ready</span>
        </div>
        ${readyRequests.length ? table(readyRequests, ['Request', 'Department', 'Qty', 'Task'], (row) => `
          <tr>
            <td>
              <button class="ghost small" data-drawer-focus="request" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.request_no)}</button>
              <div class="muted">${h(row.requester_name)} · ${h(row.priority)}</div>
            </td>
            <td>${h(row.department_name)}</td>
            <td>${h(row.requested_quantity)} requested</td>
            <td>
              ${manageTasks ? `<button class="ghost" data-action="create-warehouse-task" data-id="${h(row.id)}" type="button">Create task</button>` : '<span class="muted">Read only</span>'}
            </td>
          </tr>
        `) : '<div class="empty-state compact-empty">No requests are currently ready for warehouse task creation.</div>'}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Warehouse task center</h2>
            <p>Real task headers with pick, issue, close, and cancel actions.</p>
          </div>
          <span class="badge green">${h(openTasks.length)} active</span>
        </div>
        ${tasks.length ? table(tasks, ['Task', 'Request', 'Status', 'Assigned', 'Action'], (row) => `
          <tr>
            <td>
              <button class="ghost small" data-drawer-focus="warehouse-task" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.task_no)}</button>
              <div class="muted">${h(row.task_type)} · ${h(row.facility_name)}</div>
            </td>
            <td>${h(row.request_no)}<div class="muted">${h(row.department_name)}</div></td>
            <td>${badge(row.status)}</td>
            <td>${h(row.assignee_name || 'Unassigned')}</td>
            <td>${executeTasks ? `<button class="ghost" data-drawer-focus="warehouse-task" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">Inspect</button>` : '<span class="muted">Restricted</span>'}</td>
          </tr>
        `) : '<div class="empty-state compact-empty">No warehouse tasks are loaded for this tenant.</div>'}
      </div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Bin availability snapshot</h2>
            <p>Current storage posture used for task bin selection and issue execution.</p>
          </div>
        </div>
        ${bins.length ? table(bins, ['Bin', 'Facility', 'On hand', 'Available'], (row) => `
          <tr>
            <td><strong>${h(row.code)}</strong><div class="muted">${h(row.zone)} · ${h(row.shelf)}</div></td>
            <td>${h(row.facility_name)}</td>
            <td>${h(row.on_hand)}</td>
            <td>${h(row.available)}</td>
          </tr>
        `) : '<div class="empty-state compact-empty">No bin data loaded for this tenant.</div>'}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Warehouse control posture</h2>
            <p>Worker-safe mode keeps actions scoped to task lifecycle endpoints.</p>
          </div>
        </div>
        <div class="field-stack">
          <div class="panel compact tint">
            <div class="two-col-stats">
              <div><span>Partial tasks</span><strong>${h(summary.partialTasks ?? 0)}</strong></div>
              <div><span>Exceptions</span><strong>${h(summary.exceptions ?? 0)}</strong></div>
            </div>
            <p class="muted">${h(executeTasks ? 'Execution actions are available to this role.' : 'Execution actions are limited by role and task assignment.')}</p>
          </div>
          <div class="empty-state compact-empty">Evidence and audit updates are attached to every task action. No autonomous actions are enabled.</div>
        </div>
      </div>
    </section>
    <section class="panel compact tint">
      <div class="panel-head">
        <div>
          <h2>Task center guidance</h2>
          <p>Pick from the request queue, issue against stock, then close only after every line resolves.</p>
        </div>
      </div>
      <p class="muted">Warehouse task management is controlled by the backend. The UI only surfaces current state and permitted actions.</p>
    </section>
    ${shellDrawer()}
  `;
}

export function procurementPage() {
  const procurement = state.data?.procurement || {};
  const summary = procurement.summary?.summary || {};
  const vendors = procurement.vendors?.vendors || [];
  const contracts = procurement.contracts?.contracts || [];
  const budgets = procurement.budgets?.budgets || [];
  const waivers = procurement.waivers?.waivers || [];
  const advisory = procurement.advisory || {};
  const purchaseRequests = procurement.purchaseRequests?.purchaseRequests || state.data?.purchaseRequests?.purchaseRequests || [];
  const purchaseOrders = procurement.purchaseOrders?.purchaseOrders || state.data?.purchaseOrders?.purchaseOrders || [];
  const items = state.data?.items?.items || [];
  const departments = state.bootstrap?.lookups?.departments || [];
  const facilities = state.bootstrap?.lookups?.facilities || [];
  const me = currentUser();
  const privileged = Boolean(me && ['admin', 'supervisor', 'finance'].includes(me.role_key));
  const defaultDepartmentId = me?.department_id || departments[0]?.id || '';
  const defaultFacilityId = me?.facility_id || facilities[0]?.id || '';
  const selectedVendorId = state.drawerFocus?.type === 'vendor' ? state.drawerFocus.id : '';
  const selectedVendor = state.procurementDetails?.[`vendor:${selectedVendorId}`]?.vendor || vendors.find((vendor) => vendor.id === selectedVendorId) || null;
  const selectedRequestId = state.drawerFocus?.type === 'purchase-request' ? state.drawerFocus.id : '';
  const selectedRequest = state.procurementDetails?.[`purchase-request:${selectedRequestId}`]?.purchaseRequest || purchaseRequests.find((row) => row.id === selectedRequestId) || null;
  const selectedRequestDetail = state.procurementDetails?.[`purchase-request:${selectedRequestId}`] || null;
  const selectedOrderId = state.drawerFocus?.type === 'purchase-order' ? state.drawerFocus.id : '';
  const selectedOrder = state.procurementDetails?.[`purchase-order:${selectedOrderId}`]?.purchaseOrder || purchaseOrders.find((row) => row.id === selectedOrderId) || null;
  const selectedOrderDetail = state.procurementDetails?.[`purchase-order:${selectedOrderId}`] || null;
  const selectedLineDraft = state.procurementLineDraft?.requestId === selectedRequestId ? state.procurementLineDraft : null;
  const canCreateRequest = can('create_purchase_request');
  const canManageVendors = can('manage_vendors');
  const canCreateOrder = can('create_purchase_order');
  return `
    ${hero()}
    ${moduleBanner({
      eyebrow: 'Procurement control',
      title: 'Procurement Center',
      purpose: 'Procurement, supplier, contract, and budget controls are visible in one governed workspace. Backend rules decide every lifecycle transition.',
      status: 'Workspace operational',
      chips: [
        `Workspace: ${state.bootstrap?.tenant?.name || 'OpsTrax tenant'}`,
        `Active modules: ${state.bootstrap?.features?.length || 0}`,
        `Approvals: ${purchaseRequests.filter((row) => row.status === 'PENDING_APPROVAL').length}`,
        `Finance readiness: ${summary.exportReady ?? 0}%`
      ],
      actions: [
        `<button class="ghost" data-page="Supplier Governance" type="button">Open Supplier Governance</button>`,
        `<button class="ghost" data-page="Budget Control" type="button">Review Budget Control</button>`
      ].filter(Boolean)
    })}
    <section class="kpi-grid">
      <div class="panel kpi"><div class="kpi-label">Vendors</div><div class="kpi-value">${h(summary.vendors ?? vendors.length ?? 0)}</div><div class="kpi-detail">Tenant vendor master.</div></div>
      <div class="panel kpi"><div class="kpi-label">Active vendors</div><div class="kpi-value">${h(summary.activeVendors ?? vendors.filter((vendor) => Number(vendor.active) === 1).length ?? 0)}</div><div class="kpi-detail">Ready for sourcing.</div></div>
      <div class="panel kpi"><div class="kpi-label">Pending approvals</div><div class="kpi-value">${h(summary.pendingRequests ?? purchaseRequests.filter((row) => row.status === 'PENDING_APPROVAL').length ?? 0)}</div><div class="kpi-detail">Purchase requests awaiting review.</div></div>
      <div class="panel kpi"><div class="kpi-label">Issued orders</div><div class="kpi-value">${h(summary.issuedOrders ?? purchaseOrders.filter((row) => row.status === 'ISSUED').length ?? 0)}</div><div class="kpi-detail">Issued without receiving inventory.</div></div>
    </section>
    ${moduleSignals([
      { kind: 'Supplier governance', title: `${h(summary.blockedVendors ?? vendors.filter((row) => ['BLOCKED', 'SUSPENDED', 'ARCHIVED'].includes(row.status)).length)} blocked or suspended supplier(s)`, detail: 'Supplier eligibility is enforced before RFQ, PO, and waiver actions.' },
      { kind: 'Contract repository', title: `${h(contracts.length)} contract record(s)`, detail: `${h(summary.expiringContracts ?? contracts.filter((row) => row.renewal_status === 'RENEWAL_ALERT').length)} renewal alert(s) and coverage warnings tracked.` },
      { kind: 'Budget control', title: `${h(budgets.length)} budget record(s)`, detail: `${h(summary.overBudget ?? budgets.filter((row) => Number(row.utilization_pct || 0) >= Number(row.alert_threshold_pct || 0.85) * 100).length)} over-threshold posture(s).` },
      { kind: 'Finance readiness', title: `${h(summary.exportReady ?? 0)}% export readiness`, detail: 'Approved orders and posted receipts are validated before handoff.' }
    ])}
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Supplier & Vendor Master</h2>
            <p>Supplier records, scorecards, compliance posture, and tenant eligibility are all backend controlled.</p>
          </div>
          <span class="badge green">${h(vendors.length)} loaded</span>
        </div>
        ${canManageVendors ? `
          <form id="procurementVendorCreateForm" class="form-grid">
            <label class="field">
              <span>Code</span>
              <input name="code" placeholder="MED-100" required />
            </label>
            <label class="field">
              <span>Name</span>
              <input name="name" placeholder="MedSupply Direct" required />
            </label>
            <label class="field">
              <span>Status</span>
              <select name="status">
                <option>ACTIVE</option>
                <option>SUSPENDED</option>
                <option>BLOCKED</option>
                <option>ARCHIVED</option>
              </select>
            </label>
            <label class="field">
              <span>Risk score</span>
              <input name="riskScore" type="number" min="0" max="100" step="1" value="10" />
            </label>
            <label class="field">
              <span>Contact</span>
              <input name="contactName" placeholder="Procurement contact" />
            </label>
            <label class="field">
              <span>Email</span>
              <input name="email" type="email" placeholder="contact@example.com" />
            </label>
            <label class="field">
              <span>Phone</span>
              <input name="phone" placeholder="+1 555 010 2000" />
            </label>
            <div class="actions-row">
              <button class="primary" type="submit">Create Vendor</button>
            </div>
          </form>
        ` : '<div class="empty-state compact-empty">This role cannot maintain vendor records.</div>'}
        ${vendors.length ? table(vendors, ['Vendor', 'Status', 'Risk', 'Score', 'Action'], (row) => `
          <tr>
            <td>
              <button class="ghost small" data-drawer-focus="vendor" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.name)}</button>
              <div class="muted">${h(row.code)} · ${h(row.contact_name || 'No contact')}</div>
              <div class="muted">${badge(row.compliance_status || 'UNKNOWN')} ${badge(row.contract_status || 'UNKNOWN')}</div>
            </td>
            <td>${badge(row.status)}</td>
            <td>${h(row.risk_score)}</td>
            <td>${h(Number(row.average_score || 0).toFixed ? Number(row.average_score || 0).toFixed(1) : row.average_score || 0)}</td>
            <td><button class="ghost" data-drawer-focus="vendor" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">Inspect</button></td>
          </tr>
        `) : '<div class="empty-state compact-empty">No vendor master records are loaded for this tenant.</div>'}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Purchase Request Draft</h2>
            <p>Requests start in draft, require backend approval, and can only turn into a PO after approval.</p>
          </div>
        </div>
        ${canCreateRequest ? `
          <form id="procurementRequestForm" class="form-grid">
            <label class="field">
              <span>Vendor</span>
              <select name="vendorId">
                ${vendors.map((vendor) => `<option value="${h(vendor.id)}">${h(vendor.name)} · ${h(vendor.code)}</option>`).join('')}
              </select>
            </label>
            <label class="field">
              <span>Accounting code</span>
              <input name="accountingCode" placeholder="MED-INV-4420" />
            </label>
            <label class="field">
              <span>Department</span>
              <select name="departmentId" ${privileged ? '' : 'disabled'}>
                ${departments.map((dept) => `<option value="${h(dept.id)}" ${dept.id === defaultDepartmentId ? 'selected' : ''}>${h(dept.name)}</option>`).join('')}
              </select>
            </label>
            <label class="field">
              <span>Facility</span>
              <select name="facilityId" ${privileged ? '' : 'disabled'}>
                ${facilities.map((facility) => `<option value="${h(facility.id)}" ${facility.id === defaultFacilityId ? 'selected' : ''}>${h(facility.name)}</option>`).join('')}
              </select>
            </label>
            <label class="field">
              <span>Item</span>
              <select name="itemId">
                ${items.map((item) => `<option value="${h(item.id)}">${h(item.name)}</option>`).join('')}
              </select>
            </label>
            <label class="field">
              <span>Quantity</span>
              <input name="qty" type="number" min="1" step="1" value="10" />
            </label>
            <label class="field">
              <span>Unit price</span>
              <input name="unitPrice" type="number" min="0" step="0.01" value="10.00" />
            </label>
            <label class="field" style="grid-column:1 / -1">
              <span>Description</span>
              <input name="description" placeholder="Replenishment for low stock and approved demand" />
            </label>
            <div class="actions-row">
              <button class="primary" type="submit">Draft Purchase Request</button>
            </div>
          </form>
        ` : '<div class="empty-state compact-empty">This role cannot create purchase requests.</div>'}
      </div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Purchase Request Queue</h2>
            <p>Drafts, submissions, approvals, rejections, and cancellations are permissioned server actions.</p>
          </div>
          <span class="badge blue">${h(purchaseRequests.length)} request(s)</span>
        </div>
        ${purchaseRequests.length ? table(purchaseRequests, ['PR', 'Vendor', 'Amount', 'Status', 'Action'], (row) => {
          const buttons = [];
          const ownedOrPrivileged = Boolean(privileged || row.requested_by_user_id === me?.id);
          if (row.status === 'DRAFT') {
            if (ownedOrPrivileged && can('submit_purchase_request')) buttons.push(`<button class="ghost" data-action="procure-submit-request" data-id="${h(row.id)}" type="button">Submit</button>`);
            if (ownedOrPrivileged && can('cancel_purchase_request')) buttons.push(`<button class="ghost" data-action="procure-cancel-request" data-id="${h(row.id)}" type="button">Cancel</button>`);
          } else if (row.status === 'PENDING_APPROVAL') {
            if (can('approve_purchase_request')) buttons.push(`<button class="ghost" data-action="procure-approve-request" data-id="${h(row.id)}" type="button">Approve</button>`);
            if (can('reject_purchase_request')) buttons.push(`<button class="ghost" data-action="procure-reject-request" data-id="${h(row.id)}" type="button">Reject</button>`);
            if (ownedOrPrivileged && can('cancel_purchase_request')) buttons.push(`<button class="ghost" data-action="procure-cancel-request" data-id="${h(row.id)}" type="button">Cancel</button>`);
          } else if (row.status === 'APPROVED') {
            if (canCreateOrder) buttons.push(`<button class="ghost" data-action="procure-create-po" data-id="${h(row.id)}" type="button">Create PO</button>`);
          }
          return `
            <tr>
              <td>
                <button class="ghost small" data-drawer-focus="purchase-request" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.pr_no)}</button>
                <div class="muted">${h(row.accounting_code || 'Missing accounting code')}</div>
              </td>
              <td>${h(row.vendor_name || row.vendor_id || 'No vendor')}</td>
              <td>${money(row.total_amount)}</td>
              <td>${badge(row.status)}</td>
              <td>${buttons.length ? buttons.join(' ') : '—'}</td>
            </tr>
          `;
        }) : '<div class="empty-state compact-empty">No purchase requests are loaded for this tenant.</div>'}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Purchase Order Queue</h2>
            <p>Approved requests can create POs, and issued POs do not receive stock until receiving lands later.</p>
          </div>
          <span class="badge green">${h(purchaseOrders.length)} order(s)</span>
        </div>
        ${purchaseOrders.length ? table(purchaseOrders, ['PO', 'Vendor', 'Status', 'Source', 'Action'], (row) => {
          const buttons = [];
          if (row.status === 'DRAFT' && can('approve_purchase_order')) {
            buttons.push(`<button class="ghost" data-action="procure-approve-po" data-id="${h(row.id)}" type="button">Approve</button>`);
          }
          if (row.status === 'APPROVED' && can('issue_purchase_order')) {
            buttons.push(`<button class="ghost" data-action="procure-issue-po" data-id="${h(row.id)}" type="button">Issue</button>`);
          }
          if (['DRAFT', 'APPROVED'].includes(row.status) && can('cancel_purchase_order')) {
            buttons.push(`<button class="ghost red" data-action="procure-cancel-po" data-id="${h(row.id)}" type="button">Cancel</button>`);
          }
          return `
            <tr>
              <td>
                <button class="ghost small" data-drawer-focus="purchase-order" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.po_no)}</button>
                <div class="muted">${h(row.vendor_code || row.vendor_name || '')}</div>
              </td>
              <td>${h(row.vendor_name || row.vendor_id || 'No vendor')}</td>
              <td>${badge(row.status)}</td>
              <td>${h(row.request_no || row.source_purchase_request_id || 'Unlinked')}</td>
              <td>${buttons.length ? buttons.join(' ') : '—'}</td>
            </tr>
          `;
        }) : '<div class="empty-state compact-empty">No purchase orders are loaded for this tenant.</div>'}
      </div>
    </section>
    <section class="panel compact tint">
      <div class="panel-head">
        <div>
          <h2>Procurement advisory</h2>
          <p>Read-only supplier, contract, and budget signals derived from live tenant records.</p>
        </div>
      </div>
      <div class="landing-grid">
        <article class="landing-card"><div class="eyebrow">Supplier recommendation</div><p>${h(advisory.supplierRecommendation || 'AI_PROVIDER_NOT_CONFIGURED')}</p></article>
        <article class="landing-card"><div class="eyebrow">Contract leakage</div><p>${h(advisory.contractLeakage || 'INSUFFICIENT_CONTRACT_DATA')}</p></article>
        <article class="landing-card"><div class="eyebrow">Budget risk</div><p>${h(advisory.budgetRisk || 'AI_PROVIDER_NOT_CONFIGURED')}</p></article>
      </div>
      <div class="muted">Total approved waivers: ${h(waivers.length)}</div>
    </section>
    ${shellDrawer()}
  `;
}

export function supplierGovernancePage() {
  const procurement = state.data?.procurement || {};
  const summary = procurement.summary?.summary || {};
  const vendors = procurement.vendors?.vendors || [];
  const waivers = procurement.waivers?.waivers || [];
  const canManage = can('manage_vendors') || can('manage_supplier_governance');
  return `
    ${hero()}
    ${moduleBanner({
      eyebrow: 'Supplier governance',
      title: 'Supplier Governance',
      purpose: 'Supplier lifecycle, compliance posture, and waiver control stay tenant-scoped and visible before sourcing can proceed.',
      status: 'Governance enabled',
      chips: [
        `Active suppliers: ${vendors.filter((row) => row.status === 'ACTIVE').length}`,
        `Blocked: ${summary.blockedVendors ?? vendors.filter((row) => ['BLOCKED', 'SUSPENDED', 'ARCHIVED'].includes(row.status)).length}`,
        `Compliance docs: ${vendors.reduce((total, row) => total + Number(row.compliance_document_count || 0), 0)}`,
        `Waivers: ${waivers.length}`
      ],
      actions: [
        `<button class="ghost" data-page="Procurement Center" type="button">Open Procurement Center</button>`,
        `<button class="ghost" data-page="Compliance Center" type="button">Open Compliance Center</button>`
      ]
    })}
    <section class="kpi-grid">
      <div class="panel kpi"><div class="kpi-label">Supplier profile</div><div class="kpi-value">${h(vendors.length)}</div><div class="kpi-detail">Tenant-scoped supplier master.</div></div>
      <div class="panel kpi"><div class="kpi-label">Blocked</div><div class="kpi-value">${h(summary.blockedVendors ?? vendors.filter((row) => ['BLOCKED', 'SUSPENDED', 'ARCHIVED'].includes(row.status)).length)}</div><div class="kpi-detail">Blocked or suspended suppliers.</div></div>
      <div class="panel kpi"><div class="kpi-label">Compliance documents</div><div class="kpi-value">${h(vendors.reduce((total, row) => total + Number(row.compliance_document_count || 0), 0))}</div><div class="kpi-detail">Document posture across suppliers.</div></div>
      <div class="panel kpi"><div class="kpi-label">Waivers</div><div class="kpi-value">${h(waivers.length)}</div><div class="kpi-detail">Approved exceptions on record.</div></div>
    </section>
    ${moduleSignals([
      { kind: 'Lifecycle', title: `${h(vendors.filter((row) => row.status === 'ACTIVE').length)} active · ${h(vendors.filter((row) => row.status === 'SUSPENDED').length)} suspended`, detail: 'Lifecycle status is enforced before a supplier can be used in sourcing or purchasing.' },
      { kind: 'Risk posture', title: `${h(vendors.filter((row) => Number(row.risk_score || 0) >= 70).length)} high-risk supplier(s)`, detail: 'Missing or expired compliance data increases the supplier risk posture.' },
      { kind: 'Compliance', title: `${h(vendors.reduce((total, row) => total + Number(row.compliance_document_count || 0), 0))} document(s) on file`, detail: 'Expiry posture and waivers remain visible in the drawer.' },
      { kind: 'Waivers', title: `${h(waivers.length)} waiver record(s)`, detail: 'Waivers require a reason and are audit logged.' }
    ])}
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Supplier Governance</h2>
            <p>Compliance status, risk posture, and downstream eligibility are enforced by the backend.</p>
          </div>
          ${badge('Governance enabled')}
        </div>
        ${table(vendors, ['Supplier', 'Status', 'Compliance', 'Contract', 'Risk'], (row) => `
          <tr>
            <td>
              <button class="ghost small" data-drawer-focus="vendor" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.name)}</button>
              <div class="muted">${h(row.code)} · ${h(row.blocked_reason || 'No block reason')}</div>
            </td>
            <td>${badge(row.status)}</td>
            <td>${badge(row.compliance_status || 'UNKNOWN')}</td>
            <td>${badge(row.contract_status || 'UNKNOWN')}</td>
            <td>${h(row.risk_posture || row.risk_score || 0)}</td>
          </tr>
        `)}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Compliance Posture</h2>
            <p>Missing or expired documents, blocked status, and waiver coverage are visible here.</p>
          </div>
        </div>
        ${waivers.length ? table(waivers, ['Waiver', 'Type', 'Entity', 'Reason'], (row) => `
          <tr>
            <td><button class="ghost small" data-drawer-focus="procurement-waiver" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.id)}</button></td>
            <td>${badge(row.waiver_type)}</td>
            <td>${h(row.entity_type)} · ${h(row.entity_id)}</td>
            <td class="muted">${h(row.reason)}</td>
          </tr>
        `) : '<div class="empty-state compact-empty">No supplier waivers are recorded for this tenant.</div>'}
        ${canManage ? '<div class="empty-state compact-empty">Create or manage supplier governance records from the vendor drawer.</div>' : '<div class="empty-state compact-empty">Supplier governance is view only for this role.</div>'}
      </div>
    </section>
    ${shellDrawer()}
  `;
}

export function contractRepositoryPage() {
  const procurement = state.data?.procurement || {};
  const contracts = procurement.contracts?.contracts || [];
  const advisory = procurement.advisory || {};
  return `
    ${hero()}
    ${moduleBanner({
      eyebrow: 'Contract governance',
      title: 'Contract Repository',
      purpose: 'Contract coverage, renewal posture, and contract leakage signals are visible before sourcing or approval decisions move forward.',
      status: 'Renewal aware',
      chips: [
        `Contracts: ${contracts.length}`,
        `Renewal alerts: ${contracts.filter((row) => row.renewal_status === 'RENEWAL_ALERT').length}`,
        `Active coverage: ${contracts.filter((row) => row.contract_status === 'ACTIVE').length}`,
        `Signal: ${advisory.contractLeakage || 'INSUFFICIENT_CONTRACT_DATA'}`
      ],
      actions: [
        `<button class="ghost" data-page="Supplier Governance" type="button">Open Supplier Governance</button>`,
        `<button class="ghost" data-page="Procurement Center" type="button">Review Procurement Queue</button>`
      ]
    })}
    <section class="kpi-grid">
      <div class="panel kpi"><div class="kpi-label">Contracts</div><div class="kpi-value">${h(contracts.length)}</div><div class="kpi-detail">Tenant contract repository.</div></div>
      <div class="panel kpi"><div class="kpi-label">Renewal alerts</div><div class="kpi-value">${h(contracts.filter((row) => row.renewal_status === 'RENEWAL_ALERT').length)}</div><div class="kpi-detail">Contracts needing attention.</div></div>
      <div class="panel kpi"><div class="kpi-label">Active coverage</div><div class="kpi-value">${h(contracts.filter((row) => row.contract_status === 'ACTIVE').length)}</div><div class="kpi-detail">Covered supplier/item links.</div></div>
      <div class="panel kpi"><div class="kpi-label">Contract signal</div><div class="kpi-value">${h(advisory.contractLeakage || 'INSUFFICIENT_CONTRACT_DATA')}</div><div class="kpi-detail">Advisory posture only.</div></div>
    </section>
    ${moduleSignals([
      { kind: 'Coverage', title: `${h(contracts.filter((row) => row.contract_status === 'ACTIVE').length)} active contract(s)`, detail: 'Contract status and supplier coverage remain tenant-scoped.' },
      { kind: 'Renewal', title: `${h(contracts.filter((row) => row.renewal_status === 'RENEWAL_ALERT').length)} renewal alert(s)`, detail: 'Expiry posture surfaces before a contract lapses.' },
      { kind: 'Leakage', title: advisory.contractLeakage || 'INSUFFICIENT_CONTRACT_DATA', detail: 'Non-contract spend is only surfaced when the data proves it.' },
      { kind: 'Evidence', title: `${h((state.data?.documents?.documents || []).filter((doc) => doc.entity_type === 'supplier_contract').length)} linked evidence record(s)`, detail: 'Contract records can be tied to evidence and audit history.' }
    ])}
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Contract Repository</h2>
            <p>Supplier contracts, item/category coverage, and renewal posture stay tenant-scoped.</p>
          </div>
          ${badge('Renewal aware')}
        </div>
        ${table(contracts, ['Contract', 'Supplier', 'Status', 'Coverage', 'Renewal'], (row) => `
          <tr>
            <td><button class="ghost small" data-drawer-focus="supplier-contract" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.contract_no)}</button><div class="muted">${h(row.title)}</div></td>
            <td>${h(row.vendor_name || row.vendor_code || row.vendor_id)}</td>
            <td>${badge(row.contract_status || row.status)}</td>
            <td class="muted">${h(row.item_name || row.item_category || 'All categories')}</td>
            <td>${badge(row.renewal_status || 'CLEAR')}</td>
          </tr>
        `)}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Contract intelligence</h2>
            <p>Non-contract spend is surfaced only when the tenant data proves it.</p>
          </div>
        </div>
        <div class="landing-grid">
          <article class="landing-card"><div class="eyebrow">Advisory status</div><p>${h(advisory.contractLeakage || 'INSUFFICIENT_CONTRACT_DATA')}</p></article>
          <article class="landing-card"><div class="eyebrow">Source rule</div><p>Read-only signals cite contracts, suppliers, and item/category posture.</p></article>
          <article class="landing-card"><div class="eyebrow">Evidence ready</div><p>Contract records can be linked to evidence and audit history from the drawer.</p></article>
        </div>
      </div>
    </section>
    ${shellDrawer()}
  `;
}

export function budgetControlPage() {
  const procurement = state.data?.procurement || {};
  const budgets = procurement.budgets?.budgets || [];
  const waivers = procurement.waivers?.waivers || [];
  const advisory = procurement.advisory || {};
  return `
    ${hero()}
    ${moduleBanner({
      eyebrow: 'Budget enforcement',
      title: 'Budget Control',
      purpose: 'Department and cost-center budgets are enforced during approval, PO issue, and invoice consumption decisions.',
      status: 'Budget aware',
      chips: [
        `Budgets: ${budgets.length}`,
        `Reserved: ${budgets.reduce((total, row) => total + Number(row.reserved_amount || 0), 0)}`,
        `Consumed: ${budgets.reduce((total, row) => total + Number(row.consumed_amount || 0), 0)}`,
        `Waivers: ${waivers.filter((row) => row.waiver_type === 'BUDGET_EXCEPTION').length}`
      ],
      actions: [
        `<button class="ghost" data-page="Procurement Center" type="button">Open Procurement Queue</button>`,
        `<button class="ghost" data-page="Procure-to-Pay Intelligence" type="button">Open Invoice Intelligence</button>`
      ]
    })}
    <section class="kpi-grid">
      <div class="panel kpi"><div class="kpi-label">Budgets</div><div class="kpi-value">${h(budgets.length)}</div><div class="kpi-detail">Department and cost-center coverage.</div></div>
      <div class="panel kpi"><div class="kpi-label">Reserved</div><div class="kpi-value">${h(budgets.reduce((total, row) => total + Number(row.reserved_amount || 0), 0))}</div><div class="kpi-detail">Committed approval posture.</div></div>
      <div class="panel kpi"><div class="kpi-label">Consumed</div><div class="kpi-value">${h(budgets.reduce((total, row) => total + Number(row.consumed_amount || 0), 0))}</div><div class="kpi-detail">Approved / exported consumption.</div></div>
      <div class="panel kpi"><div class="kpi-label">Waivers</div><div class="kpi-value">${h(waivers.filter((row) => row.waiver_type === 'BUDGET_EXCEPTION').length)}</div><div class="kpi-detail">Over-budget exceptions.</div></div>
    </section>
    ${moduleSignals([
      { kind: 'Allocated', title: `${h(budgets.reduce((total, row) => total + Number(row.budget_amount || 0), 0))} budget currency units`, detail: 'Allocations are tied to department and cost-center records.' },
      { kind: 'Reserved', title: `${h(budgets.reduce((total, row) => total + Number(row.reserved_amount || 0), 0))} reserved`, detail: 'Reservations occur when approval or PO issue requires it.' },
      { kind: 'Consumed', title: `${h(budgets.reduce((total, row) => total + Number(row.consumed_amount || 0), 0))} consumed`, detail: 'Consumption updates after invoice approval or export readiness where configured.' },
      { kind: 'Over-budget', title: `${h(waivers.filter((row) => row.waiver_type === 'BUDGET_EXCEPTION').length)} exception waiver(s)`, detail: 'Over-budget waivers require a reason, permission, and audit record.' }
    ])}
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Budget Control</h2>
            <p>Approval, PO issue, and invoice export all consult the live budget ledger.</p>
          </div>
          ${badge('Budget aware')}
        </div>
        ${table(budgets, ['Budget', 'Department', 'Status', 'Utilization', 'Alert'], (row) => `
          <tr>
            <td><button class="ghost small" data-drawer-focus="department-budget" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.cost_center_code)}</button><div class="muted">${h(row.cost_center_name)}</div></td>
            <td>${h(row.department_name || row.department_code)}</td>
            <td>${badge(row.status)}</td>
            <td>${h(row.utilization_pct || 0)}%</td>
            <td>${badge(Number(row.utilization_pct || 0) >= Number(row.alert_threshold_pct || 0.85) * 100 ? 'OVER_THRESHOLD' : 'CLEAR')}</td>
          </tr>
        `)}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Budget posture</h2>
            <p>Over-budget risk is only advisory until a permissioned waiver or workflow approval is recorded.</p>
          </div>
        </div>
        <div class="landing-grid">
          <article class="landing-card"><div class="eyebrow">Budget risk</div><p>${h(advisory.budgetRisk || 'AI_PROVIDER_NOT_CONFIGURED')}</p></article>
          <article class="landing-card"><div class="eyebrow">Approval check</div><p>Purchase request approval and PO issue reserve budget against the live ledger.</p></article>
          <article class="landing-card"><div class="eyebrow">Consumption</div><p>Invoice approval and export readiness consume budget where configured by policy.</p></article>
        </div>
      </div>
    </section>
    ${shellDrawer()}
  `;
}

const purchasingPage = procurementPage;

export function procureToPayPage() {
  const p2p = state.data?.procureToPay || {};
  const summary = p2p.summary?.summary || {};
  const vendorInvoices = p2p.vendorInvoices?.vendorInvoices || [];
  const rfqRequests = p2p.rfqRequests?.rfqRequests || [];
  const vendorQuotes = p2p.vendorQuotes?.vendorQuotes || [];
  const vendorScorecards = p2p.vendorScorecards?.vendorScorecards || [];
  const providerStatus = state.data?.aiSummary?.providerStatus ?? 'NOT_CONFIGURED';
  const ocrStatus = state.data?.ocrStatus?.ocrStatus || { provider: 'local', label: 'Local (Deterministic)', status: 'LOCAL', ready: true, message: 'Deterministic local extractor active.' };
  const ocrStatusBadgeKind = ocrStatus.status === 'LOCAL' ? 'INFO' : ocrStatus.status === 'CONFIGURED' ? 'ACTIVE' : ocrStatus.status === 'ERROR' ? 'FAILED' : 'PENDING';
  const ocrStatusLabel = { LOCAL: 'Local', CONFIGURED: 'Connected', NOT_CONFIGURED: 'Not Configured', ERROR: 'Error' }[ocrStatus.status] || ocrStatus.status;
  const canViewInvoices = can('view_vendor_invoices');
  const canViewRfqs = can('view_rfq_requests');
  const canViewQuotes = can('view_vendor_quotes');
  const canViewScorecards = can('view_vendor_scorecards');
  return `
    ${hero()}
    ${moduleBanner({
      eyebrow: 'Procure-to-pay intelligence',
      title: 'Invoice Intelligence',
      purpose: 'Invoice extraction, matching, exceptions, approval trail, and export readiness are surfaced as a governed operations workflow.',
      status: providerStatus === 'NOT_CONFIGURED' ? 'Connector required' : 'Operational',
      chips: [
        `Invoices: ${summary.invoices ?? vendorInvoices.length}`,
        `Export ready: ${summary.exportReady ?? vendorInvoices.filter((row) => ['EXPORT_READY', 'EXPORTED'].includes(row.status)).length}`,
        `Exceptions: ${summary.exceptions ?? 0}`,
        `RFQs: ${summary.rfqs ?? rfqRequests.length}`
      ],
      actions: [
        `<button class="ghost" data-page="Procurement Center" type="button">Open Procurement Center</button>`,
        `<button class="ghost" data-page="FinanceSync Export Hub" type="button">Open Finance Export Hub</button>`
      ]
    })}
    <section class="kpi-grid">
      <div class="panel kpi"><div class="kpi-label">Invoices</div><div class="kpi-value">${h(summary.invoices ?? vendorInvoices.length)}</div><div class="kpi-detail">Vendor invoice queue.</div></div>
      <div class="panel kpi"><div class="kpi-label">Export ready</div><div class="kpi-value">${h(summary.exportReady ?? vendorInvoices.filter((row) => ['EXPORT_READY', 'EXPORTED'].includes(row.status)).length)}</div><div class="kpi-detail">Finance-ready invoices.</div></div>
      <div class="panel kpi"><div class="kpi-label">Exceptions</div><div class="kpi-value">${h(summary.exceptions ?? 0)}</div><div class="kpi-detail">Unwaived match blockers.</div></div>
      <div class="panel kpi"><div class="kpi-label">RFQs</div><div class="kpi-value">${h(summary.rfqs ?? rfqRequests.length)}</div><div class="kpi-detail">Supplier sourcing work.</div></div>
      <div class="panel kpi"><div class="kpi-label">Quotes</div><div class="kpi-value">${h(summary.quotes ?? vendorQuotes.length)}</div><div class="kpi-detail">Bid comparisons.</div></div>
      <div class="panel kpi"><div class="kpi-label">Scorecards</div><div class="kpi-value">${h(summary.scorecards ?? vendorScorecards.length)}</div><div class="kpi-detail">Supplier performance history.</div></div>
    </section>
    ${moduleSignals([
      { kind: 'Extraction', title: `${h(vendorInvoices.filter((row) => row.extraction_status === 'EXTRACTED').length)} extracted invoice(s)`, detail: 'Deterministic extraction feeds the downstream matching workflow.' },
      { kind: 'Matching', title: `${h(vendorInvoices.filter((row) => row.match_status === 'MATCHED').length)} matched invoice(s)`, detail: 'Match results and blockers stay visible in the drawer.' },
      { kind: 'Exceptions', title: `${h(vendorInvoices.filter((row) => row.status === 'EXCEPTION').length)} invoice exception(s)`, detail: 'Exception queues remain honest and reviewable.' },
      { kind: 'Export posture', title: `${h(vendorInvoices.filter((row) => row.status === 'EXPORT_READY').length)} export-ready invoice(s)`, detail: 'Only validated records reach finance handoff posture.' }
    ])}
    <section class="panel ocr-provider-status">
      <div class="panel-head">
        <div>
          <h2>OCR Provider Status</h2>
          <p>OCR proposes values only. Approval, matching, export readiness, and payment remain human-controlled.</p>
        </div>
        ${badge(ocrStatusBadgeKind)}
      </div>
      <div class="metric-grid">
        <div class="metric"><div class="metric-label">Provider</div><div class="metric-value">${h(ocrStatus.label)}</div></div>
        <div class="metric"><div class="metric-label">Status</div><div class="metric-value">${h(ocrStatusLabel)}</div></div>
        <div class="metric"><div class="metric-label">Required</div><div class="metric-value">${ocrStatus.required ? 'Yes' : 'No'}</div></div>
        <div class="metric"><div class="metric-label">Review gate</div><div class="metric-value">Human required</div></div>
      </div>
      <div class="muted" style="margin-top:0.5rem">${h(ocrStatus.message)}</div>
      ${!ocrStatus.ready ? `<div class="alert-info" style="margin-top:0.75rem">External OCR extraction is disabled. ${ocrStatus.provider !== 'local' ? 'Configure OCR credentials to enable.' : 'Set OCR_PROVIDER to an external provider to enable.'} Local deterministic extraction remains available.</div>` : ''}
      <div class="compliance-note" style="margin-top:0.5rem">Review required — OCR proposes values only. No invoice field is overwritten without explicit human acceptance. Extraction, matching, approval, and export each require separate human action.</div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head"><div><h2>Invoice Intelligence</h2><p>Invoice intake, deterministic extraction, matching, exception review, and export readiness.</p></div></div>
        ${canViewInvoices ? table(vendorInvoices, ['Invoice', 'Vendor', 'Status', 'Amount', 'Action'], (row) => `
          <tr>
            <td><button class="ghost small" data-drawer-focus="vendor-invoice" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.invoice_number)}</button><div class="muted">${h(row.extraction_status)} · ${h(row.match_status)}</div></td>
            <td>${h(row.vendor_name)}</td>
            <td>${badge(row.status)}</td>
            <td>${money(row.total_amount)}</td>
            <td><button class="ghost small" data-drawer-focus="vendor-invoice" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">Inspect</button></td>
          </tr>
        `) : '<div class="empty-state compact-empty">This role cannot view invoice intelligence.</div>'}
      </div>
      <div class="panel">
        <div class="panel-head"><div><h2>Sourcing Intelligence</h2><p>RFQ comparison, quote award, and supplier performance are governed by the backend.</p></div></div>
        ${canViewRfqs ? table(rfqRequests, ['RFQ', 'Subject', 'Status', 'Action'], (row) => `
          <tr>
            <td><button class="ghost small" data-drawer-focus="rfq-request" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.rfq_no)}</button><div class="muted">${h(row.department_name)} · ${h(row.facility_name)}</div></td>
            <td>${h(row.subject)}</td>
            <td>${badge(row.status)}</td>
            <td><button class="ghost small" data-drawer-focus="rfq-request" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">Inspect</button></td>
          </tr>
        `) : '<div class="empty-state compact-empty">This role cannot view RFQ sourcing.</div>'}
      </div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head"><div><h2>Quotes</h2><p>Quote comparisons stay transparent and audit-backed.</p></div></div>
        ${canViewQuotes ? table(vendorQuotes, ['Quote', 'Vendor', 'RFQ', 'Status', 'Total'], (row) => `
          <tr>
            <td><button class="ghost small" data-drawer-focus="vendor-quote" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.quote_no)}</button></td>
            <td>${h(row.vendor_name)}</td>
            <td>${h(row.rfq_no)}</td>
            <td>${badge(row.status)}</td>
            <td>${money(row.total_amount)}</td>
          </tr>
        `) : '<div class="empty-state compact-empty">This role cannot view vendor quotes.</div>'}
      </div>
      <div class="panel">
        <div class="panel-head"><div><h2>Supplier Scorecards</h2><p>Supplier performance signals remain visible for sourcing and finance review.</p></div></div>
        ${canViewScorecards ? table(vendorScorecards, ['Vendor', 'Risk', 'On time', 'Match', 'Spend'], (row) => `
          <tr>
            <td><strong>${h(row.vendor_name)}</strong><div class="muted">${h(row.vendor_code)}</div></td>
            <td>${h(row.risk_score)}</td>
            <td>${h(Number(row.on_time_delivery_rate || 0).toFixed(0))}%</td>
            <td>${h(Number(row.invoice_match_rate || 0).toFixed(0))}%</td>
            <td>${money(row.spend_90d)}</td>
          </tr>
        `) : '<div class="empty-state compact-empty">This role cannot view supplier scorecards.</div>'}
      </div>
    </section>
    <section class="panel compact tint">
      <div class="panel-head"><div><h2>Commercial posture</h2><p>Every P2P action stays tenant-scoped, audit-backed, and governed by approval state.</p></div></div>
      <div class="landing-grid">
        <article class="landing-card"><div class="eyebrow">Governance enabled</div><p>Invoice and sourcing actions require backend approval.</p></article>
        <article class="landing-card"><div class="eyebrow">Evidence-backed workflow</div><p>Invoice, RFQ, and quote records retain linked evidence.</p></article>
        <article class="landing-card"><div class="eyebrow">Export readiness</div><p>Approved invoices move through export readiness before dispatch.</p></article>
      </div>
    </section>
    ${shellDrawer()}
  `;
}

export function offlineSyncPage() {
  const offlineSummary = state.data?.offlineSummary || {};
  const offlineBatches = state.data?.offlineBatches?.batches || [];
  const offlineConflicts = state.data?.offlineConflicts?.conflicts || [];
  const offlineTasks = state.data?.offlineTasks?.tasks || [];
  const legacyBatches = state.data?.syncBatches?.syncBatches || [];
  const legacyConflicts = state.data?.conflicts?.conflicts || [];
  return `
    ${hero()}
    <section class="kpi-strip">
      <div class="kpi-card"><span>Total Batches</span><strong>${h(offlineSummary.total ?? 0)}</strong></div>
      <div class="kpi-card"><span>Review Pending</span><strong class="${(offlineSummary.reviewPending ?? 0) > 0 ? 'warn' : ''}">${h(offlineSummary.reviewPending ?? 0)}</strong></div>
      <div class="kpi-card"><span>Open Conflicts</span><strong class="${(offlineSummary.openConflicts ?? 0) > 0 ? 'danger' : ''}">${h(offlineSummary.openConflicts ?? 0)}</strong></div>
      <div class="kpi-card"><span>Posted</span><strong class="state-ok">${h(offlineSummary.posted ?? 0)}</strong></div>
      <div class="kpi-card"><span>Failed/Rejected</span><strong class="${(offlineSummary.failed ?? 0) > 0 ? 'state-danger' : ''}">${h(offlineSummary.failed ?? 0)}</strong></div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Offline Batches</h2>
            <p>Batches are uploaded, validated server-side, then approved or rejected by a supervisor before replay.</p>
          </div>
        </div>
        ${table(offlineBatches, ['Batch Key', 'Device', 'Actions', 'Conflicts', 'Status', 'Review'], (row) => `
          <tr data-drawer-focus="offline-batch" data-drawer-id="${h(row.id)}">
            <td><strong>${h(row.batch_key)}</strong><div class="muted">${fmt(row.created_at)}</div></td>
            <td>${h(row.device_name)}</td>
            <td>${h(row.action_count)}</td>
            <td>${h(row.conflict_count)}</td>
            <td>${badge(row.status)}</td>
            <td>
              ${row.status === 'UPLOADED' ? `<button class="ghost small" data-action="validate-offline-batch" data-id="${h(row.id)}" type="button">Validate</button>` : ''}
              ${row.status === 'REVIEW_PENDING' ? `
                <button class="ghost small danger" data-action="reject-offline-batch" data-id="${h(row.id)}" type="button">Reject</button>
              ` : ''}
              ${row.status === 'APPROVED' ? `<button class="ghost small" data-action="replay-offline-batch" data-id="${h(row.id)}" type="button">Replay</button>` : ''}
              ${['CAPTURED', 'UPLOADED', 'VALIDATING'].includes(row.status) ? '' : ''}
            </td>
          </tr>
        `)}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Conflict Review Queue</h2>
            <p>Each conflict requires a supervisor decision before the batch can be approved.</p>
          </div>
        </div>
        ${table(offlineConflicts, ['Conflict', 'Type', 'Entity', 'Status', 'Actions'], (row) => `
          <tr>
            <td><strong>${h(row.conflict_type)}</strong><div class="muted">${h(row.conflict_summary || row.description)}</div></td>
            <td>${h(row.entity_type)}</td>
            <td class="muted">${h(row.entity_id)}</td>
            <td>${badge(row.status)}</td>
            <td>${row.status === 'OPEN' ? `
              <button class="ghost small" data-action="approve-sync-conflict" data-id="${h(row.id)}" type="button">Approve</button>
              <button class="ghost small danger" data-action="reject-sync-conflict" data-id="${h(row.id)}" type="button">Reject</button>
            ` : badge(row.supervisor_decision ?? row.status)}</td>
          </tr>
        `)}
        ${offlineConflicts.length === 0 && legacyConflicts.length > 0 ? `
          <div class="panel compact tint" style="margin-top:12px">
            <h3 class="subhead">Legacy Conflict Queue</h3>
            ${table(legacyConflicts, ['Conflict', 'Severity', 'Status', 'Action'], (row) => `
              <tr>
                <td><strong>${h(row.conflict_type)}</strong><div class="muted">${h(row.description)}</div></td>
                <td>${badge(row.severity)}</td>
                <td>${badge(row.status)}</td>
                <td>${row.status === 'PENDING' ? `
                  <button class="ghost small" data-action="resolve-conflict" data-id="${h(row.id)}" data-resolution="RESOLVE" type="button">Resolve</button>
                  <button class="ghost small" data-action="resolve-conflict" data-id="${h(row.id)}" data-resolution="IGNORE" type="button">Ignore</button>
                ` : '—'}</td>
              </tr>
            `)}
          </div>
        ` : ''}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Offline Task Log</h2>
          <p>Individual captured actions from all batches. Server replay decides whether each action posts.</p>
        </div>
      </div>
      ${table(offlineTasks.slice(0, 50), ['Action', 'Type', 'Entity', 'Batch', 'Status', 'Validation'], (row) => `
        <tr>
          <td><strong>${h(row.action_type)}</strong><div class="muted">${h(row.action_key)}</div></td>
          <td>${h(row.entity_type)}</td>
          <td class="muted">${h(row.entity_id)}</td>
          <td class="muted">${h(row.offline_batch_id)}</td>
          <td>${badge(row.status)}</td>
          <td class="muted">${h(row.validation_message || row.replay_result || '—')}</td>
        </tr>
      `)}
    </section>
    ${legacyBatches.length > 0 ? `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Legacy Sync Batches</h2>
          <p>Prior-generation offline batches pending supervisor review.</p>
        </div>
      </div>
      ${table(legacyBatches, ['Batch', 'Device', 'Tasks', 'Review'], (row) => `
        <tr>
          <td><strong>${h(row.id)}</strong><div class="muted">${fmt(row.created_at)}</div></td>
          <td>${h(row.device_name)}</td>
          <td>${h(row.task_count)}</td>
          <td>${badge(row.review_status)}</td>
        </tr>
      `)}
    </section>
    ` : ''}
  `;
}

function offlineOpsPage() {
  return offlineSyncPage();
}

export function workerPage() {
  const user = currentUser();
  const requests = state.data?.requests?.requests || [];
  const syncBatches = state.data?.syncBatches?.syncBatches || [];
  const workerRequests = requests.filter((row) => row.status === 'PICKING' || row.status === 'APPROVED').slice(0, 6);
  return `
    ${hero()}
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Worker-Safe Mode</h2>
          <p>Restricted to the current worker identity. Sensitive finance and admin data stay hidden.</p>
        </div>
      </div>
      ${user?.role_key === 'worker' ? `
        <div class="worker-grid">
          <div class="worker-card">
            <h3>Pick Items</h3>
            <p>Only assigned request lines and scan tasks are visible.</p>
            <div class="scan-box">Use barcode scanner to confirm pick</div>
          </div>
          <div class="worker-card">
            <h3>Receive Goods</h3>
            <p>Receipt drafts post through supervisor-reviewed sync batches.</p>
            <div class="scan-box">Scan receiving label</div>
          </div>
          <div class="worker-card">
            <h3>Report Damage</h3>
            <p>Damaged or rejected items stay in review until a supervisor posts them.</p>
            <div class="scan-box">Reason code required</div>
          </div>
          <div class="worker-card">
            <h3>Assigned Queue</h3>
            <p>Current approved or picking requests for the worker tenant context.</p>
            ${table(workerRequests, ['Request', 'Department', 'Status'], (row) => `
              <tr>
                <td><strong>${h(row.request_no)}</strong></td>
                <td>${h(row.department_name)}</td>
                <td>${badge(row.status)}</td>
              </tr>
            `)}
          </div>
        </div>
      ` : `
        <div class="empty-state">
          Select the worker user in the sidebar to enter restricted mode.
        </div>
      `}
      <div class="panel compact tint" style="margin-top:16px">
        <h3 class="subhead">Pending Offline Batches</h3>
        <p class="muted">${syncBatches.filter((batch) => batch.review_status === 'PENDING').length} batch(es) require supervisor approval before posting.</p>
      </div>
    </section>
  `;
}

export function deviceopsPage() {
  const summary = state.data?.deviceopsSummary || {};
  const devices = state.data?.deviceopsDevices?.devices || [];
  const labels = state.data?.labels?.labelJobs || [];
  const items = state.data?.items?.items || [];
  const dSum = summary.devices || {};
  const scanSum = summary.scans || {};
  return `
    ${hero()}
    <section class="kpi-strip">
      <div class="kpi-card"><span>Total Devices</span><strong>${h(dSum.total ?? 0)}</strong></div>
      <div class="kpi-card"><span>Trusted</span><strong class="state-ok">${h(dSum.trusted ?? 0)}</strong></div>
      <div class="kpi-card"><span>Untrusted</span><strong class="state-warn">${h(dSum.untrusted ?? 0)}</strong></div>
      <div class="kpi-card"><span>Suspended</span><strong class="state-warn">${h(dSum.suspended ?? 0)}</strong></div>
      <div class="kpi-card"><span>Revoked</span><strong class="state-danger">${h(dSum.revoked ?? 0)}</strong></div>
      <div class="kpi-card"><span>Scans (24h)</span><strong>${h(scanSum.last24h ?? 0)}</strong></div>
      <div class="kpi-card"><span>Failed Scans</span><strong class="${(scanSum.failed ?? 0) > 0 ? 'danger' : ''}">${h(scanSum.failed ?? 0)}</strong></div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Device Registry</h2>
            <p>All enrolled devices for this tenant. Trust must be granted by a supervisor.</p>
          </div>
        </div>
        ${table(devices, ['Device', 'Type', 'Facility', 'Trust State', 'Last Seen', 'Actions'], (row) => `
          <tr data-drawer-focus="device" data-drawer-id="${h(row.id)}">
            <td><strong>${h(row.name)}</strong><div class="muted">${h(row.device_code || row.id)}</div></td>
            <td>${h(row.device_type)}</td>
            <td>${h(row.facility_name || row.facility_id)}</td>
            <td>${badge(row.trust_state || (row.trusted ? 'TRUSTED' : 'UNTRUSTED'))}</td>
            <td class="muted">${fmt(row.last_seen_at)}</td>
            <td>
              ${row.trust_state === 'UNTRUSTED' || row.trust_state === 'SUSPENDED' ? `<button class="ghost small" data-action="trust-device" data-id="${h(row.id)}" type="button">Trust</button>` : ''}
              ${row.trust_state === 'TRUSTED' ? `<button class="ghost small" data-action="suspend-device" data-id="${h(row.id)}" type="button">Suspend</button>` : ''}
              ${row.trust_state !== 'REVOKED' ? `<button class="ghost small danger" data-action="revoke-device" data-id="${h(row.id)}" type="button">Revoke</button>` : badge('REVOKED')}
            </td>
          </tr>
        `)}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Sandbox Scan Validation</h2>
            <p class="muted warn-label">Manual input only — not connected to real scanner hardware.</p>
          </div>
        </div>
        <form id="scanValidateForm" class="form-grid">
          <label class="field" style="grid-column:1/-1">
            <span>Barcode / QR Value (manual sandbox input)</span>
            <input id="scanRawValue" name="raw_value" placeholder="e.g. OS-1001 or bin code" />
          </label>
          <label class="field">
            <span>Context Type (optional)</span>
            <select name="context_type">
              <option value="">None</option>
              <option value="warehouse_task">Warehouse Task</option>
              <option value="receive_session">Receive Session</option>
            </select>
          </label>
          <label class="field">
            <span>Context ID (optional)</span>
            <input name="context_id" placeholder="Task or session ID" />
          </label>
          <div class="actions-row">
            <button class="primary" data-action="validate-scan" type="button">Validate Scan</button>
          </div>
        </form>
        <div id="scanResult" class="panel compact tint" style="margin-top:12px;display:none"></div>
      </div>
    </section>
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Label Queue</h2>
          <p>Server-audited label print jobs by device.</p>
        </div>
      </div>
      ${table(labels, ['Job', 'Kind', 'Device', 'Status'], (row) => `
        <tr>
          <td><strong>${h(row.id)}</strong><div class="muted">${h(row.entity_type)} · ${h(row.entity_id)}</div></td>
          <td>${h(row.kind)}</td>
          <td>${h(row.device_name)}</td>
          <td>${badge(row.status)}</td>
        </tr>
      `)}
    </section>
    <section class="panel compact tint">
      <h3 class="subhead">Barcode Coverage</h3>
      <p class="muted">${items.length} catalogued items are ready for scan-driven workflows. Scan validation runs entirely server-side.</p>
    </section>`;
}

function barcodePage() {
  return deviceopsPage();
}

export function documentsPage() {
  const documents = state.data?.evidence?.documents || state.data?.documents?.documents || [];
  const summary = state.data?.audit?.summary?.summary || {};
  return `
    ${hero()}
    ${moduleBanner({
      eyebrow: 'Evidence and custody',
      title: 'Evidence Vault',
      purpose: 'Evidence records, document custody, and audit linkages remain tenant-scoped and visible to the current role.',
      status: 'Evidence-backed',
      chips: [
        `Evidence records: ${documents.length}`,
        `Linked records: ${documents.reduce((total, row) => total + Number(row.link_count || 0), 0)}`,
        `Audit events: ${summary.total ?? (state.data?.audit?.audit || []).length}`,
        `Denied actions: ${summary.denied ?? 0}`
      ],
      actions: [
        `<button class="ghost" data-page="Audit Black Box" type="button">Open Audit Log Explorer</button>`,
        `<button class="ghost" data-page="Compliance Center" type="button">Open Compliance Center</button>`
      ]
    })}
    <section class="kpi-grid">
      <div class="panel kpi"><div class="kpi-label">Evidence records</div><div class="kpi-value">${h(documents.length)}</div><div class="kpi-detail">Tenant-scoped documents in the vault.</div></div>
      <div class="panel kpi"><div class="kpi-label">Audit events</div><div class="kpi-value">${h(summary.total ?? (state.data?.audit?.audit || []).length)}</div><div class="kpi-detail">Immutable events tracked by the black box.</div></div>
      <div class="panel kpi"><div class="kpi-label">Denied actions</div><div class="kpi-value">${h(summary.denied ?? 0)}</div><div class="kpi-detail">Blocked attempts are preserved in audit history.</div></div>
      <div class="panel kpi"><div class="kpi-label">Linked records</div><div class="kpi-value">${h(documents.reduce((total, row) => total + Number(row.link_count || 0), 0))}</div><div class="kpi-detail">Evidence links to live operational entities.</div></div>
    </section>
    ${moduleSignals([
      { kind: 'Capture', title: `${h(documents.length)} evidence record(s)`, detail: 'Uploads are tenant-scoped and written with immutable custody posture.' },
      { kind: 'Linkage', title: `${h(documents.reduce((total, row) => total + Number(row.link_count || 0), 0))} linked record(s)`, detail: 'Evidence ties directly to requests, orders, sessions, and compliance artifacts.' },
      { kind: 'Audit', title: `${h(summary.total ?? (state.data?.audit?.audit || []).length)} audit event(s)`, detail: 'Critical changes remain in the immutable log stream.' },
      { kind: 'Denied actions', title: `${h(summary.denied ?? 0)} denied action(s)`, detail: 'Blocked attempts stay visible for reviewers and auditors.' }
    ])}
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Evidence Capture</h2>
            <p>Uploads are tenant-scoped, hashed, and written to the evidence ledger with immutable custody.</p>
          </div>
        </div>
        <form id="documentForm" class="form-grid">
          <label class="field" style="grid-column:1 / -1">
            <span>File</span>
            <input name="file" type="file" />
          </label>
          <label class="field">
            <span>Document Type</span>
            <select name="docType">
              <option>Invoice</option>
              <option>Quote</option>
              <option>Receipt</option>
              <option>Photo Evidence</option>
              <option>Compliance Record</option>
            </select>
          </label>
          <label class="field">
            <span>Visibility</span>
            <select name="visibility">
              <option>FINANCE_PLUS_PURCHASING</option>
              <option>PURCHASING</option>
              <option>SUPERVISOR_ONLY</option>
              <option>COMPLIANCE</option>
            </select>
          </label>
          <label class="field">
            <span>Entity Type</span>
            <select name="entityType">
              <option value="purchase_request">Purchase Request</option>
              <option value="purchase_order">Purchase Order</option>
              <option value="receive_session">Receive Session</option>
              <option value="internal_request">Internal Request</option>
              <option value="sync_conflict">Sync Conflict</option>
              <option value="item">Item</option>
              <option value="vendor">Vendor</option>
            </select>
          </label>
          <label class="field" style="grid-column:1 / -1">
            <span>Entity ID</span>
            <input name="entityId" placeholder="purchase request ID, purchase order ID, session ID, item ID, vendor ID, or conflict ID" />
          </label>
          <div class="actions-row">
            <button class="primary" type="submit">Upload Evidence</button>
          </div>
        </form>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Evidence Vault</h2>
            <p>Every upload is logged and can be opened from the drawer for linking, verification, and archival.</p>
          </div>
        </div>
        ${table(documents, ['Document', 'Linked To', 'Type', 'State', 'Action'], (row) => `
          <tr>
            <td>
              <button class="ghost small" data-drawer-focus="evidence" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.file_name)}</button>
              <div class="muted">${h(row.uploaded_by_name)}</div>
            </td>
            <td>${h(row.entity_type)} · ${h(row.entity_id)}</td>
            <td>${h(row.doc_type)}</td>
            <td>${badge(row.evidence_state || 'PENDING')}</td>
            <td><button class="ghost small" data-drawer-focus="evidence" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">Open</button></td>
          </tr>
        `)}
      </div>
    </section>
  `;
}

export function receivingPage() {
  const receiving = state.data?.receiving || {};
  const summary = receiving.summary?.summary || {};
  const purchaseOrders = receiving.purchaseOrders?.purchaseOrders || [];
  const sessions = receiving.sessions?.sessions || [];
  const movements = receiving.movements?.movements || [];
  const me = currentUser();
  return `
    ${hero()}
    <section class="kpi-grid">
      <div class="panel kpi"><div class="kpi-label">Issued orders</div><div class="kpi-value">${h(summary.purchaseOrders ?? purchaseOrders.length)}</div><div class="kpi-detail">Eligible purchase orders are ready for receipt.</div></div>
      <div class="panel kpi"><div class="kpi-label">Open sessions</div><div class="kpi-value">${h(summary.openSessions ?? sessions.filter((row) => ['DRAFT', 'IN_PROGRESS'].includes(row.status)).length)}</div><div class="kpi-detail">Draft and in-progress receipts waiting for posting.</div></div>
      <div class="panel kpi"><div class="kpi-label">Posted sessions</div><div class="kpi-value">${h(summary.postedSessions ?? sessions.filter((row) => row.status === 'POSTED').length)}</div><div class="kpi-detail">Stock moved through the posting transaction.</div></div>
      <div class="panel kpi"><div class="kpi-label">Receipt movements</div><div class="kpi-value">${h(movements.length)}</div><div class="kpi-detail">Tenant stock movements tied to receive sessions.</div></div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Receiving Queue</h2>
            <p>Issued purchase orders can be turned into a controlled receive session without touching inventory yet.</p>
          </div>
        </div>
        ${table(purchaseOrders, ['PO', 'Vendor', 'Status', 'Action'], (row) => `
          <tr>
            <td>
              <strong>${h(row.po_no)}</strong>
              <div class="muted">${h(row.request_no || row.source_purchase_request_id || '')}</div>
            </td>
            <td>${h(row.vendor_name || row.vendor_code)}</td>
            <td>${badge(row.status)}</td>
            <td>${row.status === 'ISSUED' || row.status === 'RECEIVING' || row.status === 'PARTIALLY_RECEIVED' ? `<button class="ghost" data-action="create-receive-session" data-id="${h(row.id)}" type="button">Create Session</button>` : '—'}</td>
          </tr>
        `)}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Receiving Sessions</h2>
            <p>Session state, capture, and posting all happen in the backend transaction.</p>
          </div>
        </div>
        ${table(sessions, ['Session', 'PO', 'Status', 'Action'], (row) => `
          <tr>
            <td>
              <button class="ghost small" data-drawer-focus="receive-session" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.id)}</button>
              <div class="muted">${fmt(row.created_at)}</div>
            </td>
            <td>${h(row.po_no || row.purchase_order_id)}</td>
            <td>${badge(row.status)}</td>
            <td><button class="ghost small" data-drawer-focus="receive-session" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">Open</button></td>
          </tr>
        `)}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Receiving Movements</h2>
          <p>Only posted receive sessions create inventory movements.</p>
        </div>
      </div>
      ${table(movements, ['When', 'Item', 'Qty', 'Bin', 'PO'], (row) => `
        <tr>
          <td>${fmt(row.created_at)}</td>
          <td><strong>${h(row.item_name || row.item_id)}</strong><div class="muted">${h(row.actor_name)}</div></td>
          <td>${h(row.quantity)}</td>
          <td>${h(row.bin_code || 'Unassigned')}</td>
          <td>${h(row.po_no || '')}</td>
        </tr>
      `)}
    </section>
    <section class="panel compact tint">
      <h3 class="subhead">Receiving posture</h3>
      <p class="muted">${me?.role_key === 'worker' ? 'Workers can inspect receiving sessions, but posting remains permission-gated.' : 'Supervisor and finance roles can stage, capture, and post receipts based on backend permissions.'}</p>
    </section>
  `;
}

export function financePage() {
  const exportsData = state.data?.exports || {};
  const summary = exportsData.summary?.summary || {};
  const statusCounts = exportsData.summary?.statusCounts || [];
  const batches = exportsData.batches?.batches || [];
  const candidates = exportsData.candidates || { purchaseOrders: [], receipts: [], movements: [] };
  const errors = exportsData.errors || [];
  const transfers = exportsData.transfers || [];
  const integrationSummary = state.data?.integrations?.summary?.summary || {};
  const connections = state.data?.integrations?.connections?.connections || [];
  const dispatchConnectionId = connections[0]?.id || '';
  return `
    ${hero()}
    ${moduleBanner({
      eyebrow: 'Finance readiness',
      title: 'Finance Export Hub',
      purpose: 'Export batches, validation errors, approved receipts, and dispatch posture stay visible before any finance handoff is attempted.',
      status: summary.readiness >= 90 && (summary.openErrors ?? errors.filter((row) => row.status === 'OPEN').length) === 0 ? 'Export ready' : 'Review required',
      chips: [
        `Readiness: ${summary.readiness ?? 0}`,
        `Open errors: ${summary.openErrors ?? errors.filter((row) => row.status === 'OPEN').length}`,
        `Exportables: ${(summary.exportableOrders ?? candidates.purchaseOrders.length) + (summary.exportableReceipts ?? candidates.receipts.length)}`,
        `Connections: ${summary.connections ?? connections.length}`
      ],
      actions: [
        `<button class="ghost" data-page="Audit Black Box" type="button">Open Audit Log Explorer</button>`,
        `<button class="ghost" data-page="Integration Center" type="button">Open Integration Center</button>`
      ]
    })}
    <section class="kpi-grid">
      <div class="panel kpi"><div class="kpi-label">Readiness</div><div class="kpi-value">${h(summary.readiness ?? 0)}</div><div class="kpi-detail">Server-scored export posture.</div></div>
      <div class="panel kpi"><div class="kpi-label">Open errors</div><div class="kpi-value">${h(summary.openErrors ?? errors.filter((row) => row.status === 'OPEN').length)}</div><div class="kpi-detail">Blocking export validation issues.</div></div>
      <div class="panel kpi"><div class="kpi-label">Exportable records</div><div class="kpi-value">${h((summary.exportableOrders ?? candidates.purchaseOrders.length) + (summary.exportableReceipts ?? candidates.receipts.length))}</div><div class="kpi-detail">Approved orders and posted receipts.</div></div>
      <div class="panel kpi"><div class="kpi-label">Connections</div><div class="kpi-value">${h(summary.connections ?? connections.length)}</div><div class="kpi-detail">ERP integration endpoints.</div></div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Export Batch Builder</h2>
            <p>Create a tenant-scoped export batch. Validation, approval, generation, and dispatch stay backend-owned.</p>
          </div>
          <span class="badge blue">${h(statusCounts.length)} status bucket(s)</span>
        </div>
        <form id="exportBatchForm" class="form-grid">
          <label class="field">
            <span>Format</span>
            <select name="format">
              <option>CSV</option>
              <option>JSON</option>
            </select>
          </label>
          <label class="field">
            <span>Date from</span>
            <input type="date" name="dateFrom" />
          </label>
          <label class="field">
            <span>Date to</span>
            <input type="date" name="dateTo" />
          </label>
          <label class="field">
            <span>Facility</span>
            <select name="facilityId">
              <option value="">All facilities</option>
              ${(state.bootstrap?.lookups?.facilities || []).map((facility) => `<option value="${h(facility.id)}">${h(facility.name)}</option>`).join('')}
            </select>
          </label>
          <label class="field">
            <span>Department</span>
            <select name="departmentId">
              <option value="">All departments</option>
              ${(state.bootstrap?.lookups?.departments || []).map((dept) => `<option value="${h(dept.id)}">${h(dept.name)}</option>`).join('')}
            </select>
          </label>
          <div class="actions-row">
            <button class="primary" type="submit">Create Batch</button>
          </div>
        </form>
        <div class="panel compact tint" style="margin-top: 16px;">
          <h3 class="subhead">Export candidates</h3>
          <p class="muted">${h(candidates.purchaseOrders.length)} approved order(s) · ${h(candidates.receipts.length)} posted receipt(s) · ${h(candidates.movements.length)} movement row(s)</p>
        </div>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Validation Errors</h2>
            <p>Blocking issues are surfaced before approval and generation.</p>
          </div>
          <button class="ghost" data-action="refresh" type="button">Refresh</button>
        </div>
        ${table(errors, ['Severity', 'Code', 'Message', 'Status'], (row) => `
          <tr>
            <td>${badge(row.severity)}</td>
            <td><button class="ghost small" data-drawer-focus="export-error" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.code)}</button></td>
            <td class="muted">${h(row.message)}</td>
            <td>${badge(row.status || 'OPEN')}</td>
          </tr>
        `)}
      </div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Export Batches</h2>
            <p>Batch status, payload hash, and dispatch posture are all visible here.</p>
          </div>
        </div>
        ${table(batches, ['Batch', 'Status', 'Records', 'Errors', 'Action'], (row) => {
          const buttons = [];
          if (can('validate_export_batch') && ['DRAFT', 'FAILED_VALIDATION', 'VALIDATED', 'APPROVED'].includes(row.status)) buttons.push(`<button class="ghost small" data-action="validate-export-batch" data-id="${h(row.id)}" type="button">Validate</button>`);
          if (can('approve_export_batch') && row.open_error_count === 0 && ['DRAFT', 'FAILED_VALIDATION', 'VALIDATED'].includes(row.status)) buttons.push(`<button class="ghost small" data-action="approve-export-batch" data-id="${h(row.id)}" type="button">Approve</button>`);
          if (can('generate_export_batch') && ['APPROVED', 'VALIDATED'].includes(row.status)) buttons.push(`<button class="ghost small" data-action="generate-export-batch" data-id="${h(row.id)}" type="button">Generate</button>`);
          if (can('dispatch_export_batch') && row.status === 'GENERATED') buttons.push(`<button class="ghost small" data-action="dispatch-export-batch" data-id="${h(row.id)}" data-connection-id="${h(dispatchConnectionId)}" type="button">Dispatch</button>`);
          if (can('cancel_export_batch') && row.status !== 'CANCELLED') buttons.push(`<button class="ghost small red" data-action="cancel-export-batch" data-id="${h(row.id)}" type="button">Cancel</button>`);
          return `
            <tr>
              <td>
                <button class="ghost small" data-drawer-focus="export-batch" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.batch_no)}</button>
                <div class="muted">${h(row.validation_summary || 'No summary')}</div>
              </td>
              <td>${badge(row.status)}</td>
              <td>${h(row.record_count)}</td>
              <td>${h(row.open_error_count || 0)}</td>
              <td>${buttons.length ? buttons.join(' ') : '—'}</td>
            </tr>
          `;
        })}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Dispatch Posture</h2>
            <p>ERP handoff stays local until the integration job explicitly moves it forward.</p>
          </div>
        </div>
        <div class="kpi-grid">
          <div class="panel kpi"><div class="kpi-label">Connections</div><div class="kpi-value">${h(integrationSummary.connections ?? connections.length)}</div><div class="kpi-detail">Configured integration endpoints.</div></div>
          <div class="panel kpi"><div class="kpi-label">Queued jobs</div><div class="kpi-value">${h(integrationSummary.queuedJobs ?? 0)}</div><div class="kpi-detail">Jobs awaiting backend processing.</div></div>
        </div>
        ${connections.length ? table(connections, ['Connection', 'Status', 'Auth', 'Action'], (row) => `
          <tr>
            <td>
              <button class="ghost small" data-drawer-focus="integration-connection" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.provider_name)}</button>
              <div class="muted">${h(row.endpoint_label)}</div>
            </td>
            <td>${badge(row.status)}</td>
            <td>${h(row.auth_mode)}</td>
            <td><button class="ghost small" data-drawer-focus="integration-connection" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">Inspect</button></td>
          </tr>
        `) : '<div class="empty-state compact-empty">No integration connections are configured for this tenant.</div>'}
      </div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Purchase Orders for Export</h2>
            <p>Approved and issued orders are candidates for finance export.</p>
          </div>
        </div>
        ${table(candidates.purchaseOrders, ['PO', 'Vendor', 'Amount', 'Status'], (row) => `
          <tr>
            <td><button class="ghost small" data-drawer-focus="purchase-order" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.po_no)}</button><div class="muted">${h(row.request_no || row.accounting_code || 'No source request')}</div></td>
            <td>${h(row.vendor_name)}</td>
            <td>${money(row.line_total)}</td>
            <td>${badge(row.status)}</td>
          </tr>
        `)}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Posted Receipts</h2>
            <p>Receiving evidence stays visible and tied to the export scope.</p>
          </div>
        </div>
        ${table(candidates.receipts, ['Receipt', 'PO', 'Qty', 'Status'], (row) => `
          <tr>
            <td><button class="ghost small" data-drawer-focus="receive-session" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.id)}</button><div class="muted">${h(row.vendor_name || '')}</div></td>
            <td>${h(row.po_no || row.purchase_order_id)}</td>
            <td>${h(row.qty_received || 0)}</td>
            <td>${badge(row.status)}</td>
          </tr>
        `)}
      </div>
    </section>
    ${shellDrawer()}
  `;
}

export function integrationPage() {
  const integrations = state.data?.integrations || {};
  const summary = integrations.summary?.summary || {};
  const connections = integrations.connections?.connections || [];
  const jobs = integrations.jobs?.jobs || [];
  return `
    ${hero()}
    ${moduleBanner({
      eyebrow: 'Integration posture',
      title: 'Integration Center',
      purpose: 'Connections and jobs are tracked locally with explicit failure states, configuration posture, and retry control.',
      status: summary.connections > 0 ? 'Configured' : 'Configuration required',
      chips: [
        `Connections: ${summary.connections ?? connections.length}`,
        `Sandbox: ${summary.sandboxOnly ?? connections.filter((row) => row.auth_mode === 'SANDBOX_ONLY').length}`,
        `Queued jobs: ${summary.queuedJobs ?? jobs.filter((row) => row.status === 'QUEUED').length}`,
        `Failed jobs: ${summary.failedJobs ?? jobs.filter((row) => row.status === 'FAILED').length}`
      ],
      actions: [
        `<button class="ghost" data-page="FinanceSync Export Hub" type="button">Open Finance Export Hub</button>`,
        `<button class="ghost" data-page="Compliance Center" type="button">Open Compliance Center</button>`
      ]
    })}
    <section class="kpi-grid">
      <div class="panel kpi"><div class="kpi-label">Connections</div><div class="kpi-value">${h(summary.connections ?? connections.length)}</div><div class="kpi-detail">Tenant integration records.</div></div>
      <div class="panel kpi"><div class="kpi-label">Sandbox</div><div class="kpi-value">${h(summary.sandboxOnly ?? connections.filter((row) => row.auth_mode === 'SANDBOX_ONLY').length)}</div><div class="kpi-detail">No external ERP ack is claimed.</div></div>
      <div class="panel kpi"><div class="kpi-label">Queued jobs</div><div class="kpi-value">${h(summary.queuedJobs ?? jobs.filter((row) => row.status === 'QUEUED').length)}</div><div class="kpi-detail">Local integration queue state.</div></div>
      <div class="panel kpi"><div class="kpi-label">Failed jobs</div><div class="kpi-value">${h(summary.failedJobs ?? jobs.filter((row) => row.status === 'FAILED').length)}</div><div class="kpi-detail">Retryable or blocked dispatches.</div></div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Integration Connections</h2>
            <p>Credentials stay server-side. Secrets are never rendered into the shell.</p>
          </div>
        </div>
        ${can('manage_integrations') ? `
          <form id="integrationConnectionForm" class="form-grid">
            <label class="field">
              <span>Provider</span>
              <input name="providerName" placeholder="ERP Sandbox" required />
            </label>
            <label class="field">
              <span>Type</span>
              <select name="connectionType">
                <option>ERP</option>
                <option>ACCOUNTING</option>
                <option>CUSTOM</option>
              </select>
            </label>
            <label class="field">
              <span>Auth mode</span>
              <select name="authMode">
                <option>SANDBOX_ONLY</option>
                <option>NONE</option>
                <option>BASIC</option>
                <option>OAUTH</option>
                <option>SAML</option>
              </select>
            </label>
            <label class="field">
              <span>Endpoint label</span>
              <input name="endpointLabel" placeholder="Sandbox endpoint" />
            </label>
            <div class="actions-row">
              <button class="primary" type="submit">Create Connection</button>
            </div>
          </form>
        ` : '<div class="empty-state compact-empty">This role can view integration posture but cannot create connections.</div>'}
        ${table(connections, ['Connection', 'Status', 'Auth', 'Secret'], (row) => `
          <tr>
            <td>
              <button class="ghost small" data-drawer-focus="integration-connection" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.provider_name)}</button>
              <div class="muted">${h(row.endpoint_label)}</div>
            </td>
            <td>${badge(row.status)}</td>
            <td>${h(row.auth_mode)}</td>
            <td>${row.has_secret ? 'Configured' : 'Missing'}</td>
          </tr>
        `)}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Integration Jobs</h2>
            <p>Retry and cancel only affect the local job record until a worker processes it.</p>
          </div>
        </div>
        ${table(jobs, ['Job', 'Batch', 'Status', 'Action'], (row) => {
          const buttons = [];
          if (can('retry_integration_job') && ['FAILED', 'BLOCKED', 'CANCELLED', 'QUEUED'].includes(row.status)) buttons.push(`<button class="ghost small" data-action="retry-integration-job" data-id="${h(row.id)}" type="button">Retry</button>`);
          if (can('cancel_integration_job') && !['DISPATCHED', 'COMPLETED'].includes(row.status)) buttons.push(`<button class="ghost small red" data-action="cancel-integration-job" data-id="${h(row.id)}" type="button">Cancel</button>`);
          return `
            <tr>
              <td>
                <button class="ghost small" data-drawer-focus="integration-job" data-drawer-id="${h(row.id)}" data-drawer-open="true" type="button">${h(row.job_type || row.integration_key)}</button>
                <div class="muted">${h(row.provider_name || row.integration_key)}</div>
              </td>
              <td>${h(row.batch_no || row.export_batch_id || 'Unlinked')}</td>
              <td>${badge(row.status)}</td>
              <td>${buttons.length ? buttons.join(' ') : '—'}</td>
            </tr>
          `;
        })}
      </div>
    </section>
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Integration posture</h2>
          <p>Sandbox and failure states are tracked without claiming a successful ERP handoff.</p>
        </div>
      </div>
      <div class="landing-grid">
        <article class="landing-card">
          <div class="eyebrow">Queued</div>
          <p>${h(summary.queuedJobs ?? 0)} job(s) waiting in the backend queue.</p>
        </article>
        <article class="landing-card">
          <div class="eyebrow">Failed</div>
          <p>${h(summary.failedJobs ?? 0)} job(s) need retry or cancellation.</p>
        </article>
        <article class="landing-card">
          <div class="eyebrow">Blocked</div>
          <p>${h(summary.blockedJobs ?? 0)} job(s) are blocked by missing configuration.</p>
        </article>
      </div>
    </section>
    ${shellDrawer()}
  `;
}

export function auditPage() {
  const audit = state.data?.audit?.audit || [];
  const summary = state.data?.audit?.summary?.summary || {};
  return `
    ${hero()}
    ${moduleBanner({
      eyebrow: 'Immutable history',
      title: 'Audit Log Explorer',
      purpose: 'Critical writes, denials, and workflow transitions are preserved as immutable operational history.',
      status: 'Audit-backed',
      chips: [
        `Events: ${summary.total ?? audit.length}`,
        `Denied: ${summary.denied ?? 0}`,
        `Entity types: ${(summary.byEntityType || []).length}`,
        `Days tracked: ${(summary.byDay || []).length}`
      ],
      actions: [
        `<button class="ghost" data-page="Documents & Evidence Vault" type="button">Open Evidence Vault</button>`,
        `<button class="ghost" data-page="Compliance Center" type="button">Open Compliance Center</button>`
      ]
    })}
    <section class="kpi-grid">
      <div class="panel kpi"><div class="kpi-label">Audit events</div><div class="kpi-value">${h(summary.total ?? audit.length)}</div><div class="kpi-detail">Immutable critical-write history.</div></div>
      <div class="panel kpi"><div class="kpi-label">Denied actions</div><div class="kpi-value">${h(summary.denied ?? 0)}</div><div class="kpi-detail">Blocked requests remain visible.</div></div>
      <div class="panel kpi"><div class="kpi-label">Entity types</div><div class="kpi-value">${h((summary.byEntityType || []).length)}</div><div class="kpi-detail">Modules reflected in the log stream.</div></div>
      <div class="panel kpi"><div class="kpi-label">Days tracked</div><div class="kpi-value">${h((summary.byDay || []).length)}</div><div class="kpi-detail">Rolling event history by day.</div></div>
    </section>
    ${moduleSignals([
      { kind: 'History', title: `${h(summary.total ?? audit.length)} total event(s)`, detail: 'Immutable critical-write history stays in the log stream.' },
      { kind: 'Denials', title: `${h(summary.denied ?? 0)} denied action(s)`, detail: 'Blocked attempts remain visible for review and compliance.' },
      { kind: 'Coverage', title: `${h((summary.byEntityType || []).length)} entity type(s)`, detail: 'Operational modules appear in the audit history.' },
      { kind: 'Recency', title: `${h((summary.byDay || []).length)} day bucket(s)`, detail: 'Rolling history is easy to scan for change windows.' }
    ])}
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Audit Trail</h2>
          <p>Immutable event trail with actor, scope, and state changes for critical writes.</p>
        </div>
      </div>
      ${summary.byAction?.length ? `
        <div class="landing-grid">
          ${(summary.byAction || []).slice(0, 4).map((row) => `
            <article class="landing-card">
              <div class="eyebrow">Action</div>
              <strong>${h(row.action)}</strong>
              <p>${h(row.count)} event(s)</p>
            </article>
          `).join('')}
        </div>
      ` : ''}
      <div class="timeline">
        ${audit.map((row) => `
          <div class="timeline-row" data-drawer-focus="audit" data-drawer-id="${h(row.id)}" data-drawer-open="true">
            <div class="timeline-dot"></div>
            <div>
              <strong>${h(row.action)}</strong>
              <span>${h(row.actor_name)} · ${h(row.summary)} · ${fmt(row.created_at)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    </section>
  `;
}

export function compliancePage() {
  const canManage = can('manage_compliance');
  const controls = state.data?.complianceControls?.controls || state.data?.compliance?.controls || [];
  const controlSummary = state.data?.compliance?.controlSummary || {};
  const accessReviews = state.data?.complianceAccessReviews?.reviews || [];
  const risks = state.data?.complianceRiskRegister?.risks || [];
  const incidents = state.data?.complianceIncidents?.incidents || [];
  const vendors = state.data?.complianceVendorRegister?.vendors || [];
  const aiLogs = state.data?.complianceAiGovernance?.logs || [];
  const aiLogSummary = state.data?.complianceAiGovernance?.summary || {};
  const securityPosture = state.data?.complianceSecurityPosture?.posture || {};
  const availPosture = state.data?.complianceAvailabilityPosture?.posture || {};
  const evidence = state.data?.complianceEvidence?.evidence || [];
  const opsSummary = state.data?.compliance?.summary?.compliance || {};
  const activeTab = state.complianceTab || 'Dashboard';

  const TABS = ['Dashboard', 'Controls', 'Evidence', 'Access Reviews', 'Risk', 'Incidents', 'Vendors', 'AI Governance', 'Security', 'Availability'];

  function tabNav() {
    return `<div class="drawer-tab-bar" style="margin-bottom:20px;gap:4px;display:flex;flex-wrap:wrap">
      ${TABS.map((t) => `<button class="drawer-tab ${t === activeTab ? 'active' : ''}" data-compliance-tab="${h(t)}" type="button">${h(t)}</button>`).join('')}
    </div>`;
  }

  function statusColor(s) {
    if (!s) return '';
    const v = s.toLowerCase();
    if (['implemented', 'enforced', 'active', 'configured', 'mitigated', 'confirmed', 'resolved', 'closed', 'completed', 'healthy', 'current'].some((k) => v.includes(k))) return 'color:var(--ok,#16a34a)';
    if (['not_started', 'configuration_required', 'not_configured', 'manual', 'roadmap'].some((k) => v.includes(k))) return 'color:var(--warn,#d97706)';
    if (['failed', 'blocked', 'exception', 'error', 'revoked', 'open'].some((k) => v.includes(k))) return 'color:var(--danger,#dc2626)';
    if (['in_progress', 'review', 'attention', 'pending', 'degraded'].some((k) => v.includes(k))) return 'color:var(--info,#2563eb)';
    return 'color:var(--muted,#6b7280)';
  }

  function posturePill(status, label) {
    return `<span class="chip" style="${statusColor(status)};font-weight:600">${h(label || status)}</span>`;
  }

  function dashboardTab() {
    const implemented = controlSummary.implemented || controls.filter((c) => c.status === 'implemented').length;
    const total = controlSummary.total || controls.length;
    const implementedPct = total ? Math.round((implemented / total) * 100) : 0;
    const openRisks = risks.filter((r) => r.status === 'OPEN').length;
    const openIncidents = incidents.filter((i) => i.status === 'OPEN').length;
    const activeReview = accessReviews.find((r) => r.status === 'IN_PROGRESS');
    const ssoStatus = securityPosture.sso?.status || 'CONFIGURATION_REQUIRED';
    const dbStatus = availPosture.database?.status || 'UNKNOWN';
    return `
      <div class="panel compact tint" style="border-left:4px solid #7c3aed;margin-bottom:16px">
        <strong>SOC2-Ready Posture</strong> — This workspace is <strong>audit-aligned, not SOC2-certified</strong>.
        Controls, evidence, and audit trails are structured to support a future SOC2 Type II engagement.
        <span class="muted"> · Last assessed: June 2026 · Framework: SOC2 CC1–CC9, A1, PI1, C1, P1</span>
      </div>
      <section class="kpi-grid">
        <div class="panel kpi"><div class="kpi-label">Controls Implemented</div><div class="kpi-value" style="${statusColor('implemented')}">${implementedPct}%</div><div class="kpi-detail">${implemented} of ${total} SOC2-aligned controls</div></div>
        <div class="panel kpi"><div class="kpi-label">Open Risks</div><div class="kpi-value" style="${openRisks > 0 ? statusColor('open') : statusColor('ok')}">${openRisks}</div><div class="kpi-detail">Active items in risk register</div></div>
        <div class="panel kpi"><div class="kpi-label">Open Incidents</div><div class="kpi-value" style="${openIncidents > 0 ? statusColor('open') : statusColor('ok')}">${openIncidents}</div><div class="kpi-detail">Unresolved incidents logged</div></div>
        <div class="panel kpi"><div class="kpi-label">Audit Coverage</div><div class="kpi-value">${opsSummary.auditCoverage ?? 0}%</div><div class="kpi-detail">Write-path audit logging live</div></div>
        <div class="panel kpi"><div class="kpi-label">Evidence Linked</div><div class="kpi-value">${opsSummary.evidenceAttached ?? 0}%</div><div class="kpi-detail">Documents linked to operational records</div></div>
        <div class="panel kpi"><div class="kpi-label">Access Review</div><div class="kpi-value" style="${activeReview ? statusColor('in_progress') : statusColor('ok')}">${activeReview ? 'Active' : 'Current'}</div><div class="kpi-detail">${activeReview ? `${activeReview.reviewed_entries}/${activeReview.total_entries} reviewed` : 'Last review complete'}</div></div>
      </section>
      <section class="split">
        <div class="panel">
          <div class="panel-head"><div><h2>Security Posture</h2><p>Key security controls status at a glance.</p></div></div>
          <div class="field-stack" style="gap:8px">
            <div class="panel compact" style="display:flex;align-items:center;justify-content:space-between">
              <div><strong>SSO / OIDC</strong><div class="muted">Identity provider configuration</div></div>
              ${posturePill(ssoStatus, ssoStatus === 'CONFIGURED' ? 'Configured' : 'CONFIGURATION_REQUIRED')}
            </div>
            <div class="panel compact" style="display:flex;align-items:center;justify-content:space-between">
              <div><strong>Tenant Isolation</strong><div class="muted">All queries scoped by tenant_id</div></div>
              ${posturePill('enforced', 'Enforced')}
            </div>
            <div class="panel compact" style="display:flex;align-items:center;justify-content:space-between">
              <div><strong>RBAC</strong><div class="muted">Role-based access on every route</div></div>
              ${posturePill('enforced', 'Enforced')}
            </div>
            <div class="panel compact" style="display:flex;align-items:center;justify-content:space-between">
              <div><strong>Security Headers</strong><div class="muted">CSP, X-Frame-Options, HSTS-ready</div></div>
              ${posturePill('active', 'Active')}
            </div>
            <div class="panel compact" style="display:flex;align-items:center;justify-content:space-between">
              <div><strong>Rate Limiting</strong><div class="muted">Reverse proxy configuration required</div></div>
              ${posturePill('configuration_required', 'CONFIGURATION_REQUIRED')}
            </div>
          </div>
        </div>
        <div class="panel">
          <div class="panel-head"><div><h2>Availability Posture</h2><p>Infrastructure and data protection readiness.</p></div></div>
          <div class="field-stack" style="gap:8px">
            <div class="panel compact" style="display:flex;align-items:center;justify-content:space-between">
              <div><strong>Health Endpoints</strong><div class="muted">/healthz and /healthz/ready</div></div>
              ${posturePill('active', 'Active')}
            </div>
            <div class="panel compact" style="display:flex;align-items:center;justify-content:space-between">
              <div><strong>Database Schema</strong><div class="muted">Migration version ${availPosture.database?.migrationVersion ?? '?'}</div></div>
              ${posturePill(dbStatus, dbStatus === 'CURRENT' ? 'Current' : dbStatus)}
            </div>
            <div class="panel compact" style="display:flex;align-items:center;justify-content:space-between">
              <div><strong>Backup Policy</strong><div class="muted">SQLite file must be backed up daily</div></div>
              ${posturePill(availPosture.backup?.status || 'CONFIGURATION_REQUIRED', availPosture.backup?.status || 'CONFIGURATION_REQUIRED')}
            </div>
            <div class="panel compact" style="display:flex;align-items:center;justify-content:space-between">
              <div><strong>Monitoring</strong><div class="muted">Uptime monitoring on /healthz</div></div>
              ${posturePill(availPosture.monitoring?.status || 'CONFIGURATION_REQUIRED', availPosture.monitoring?.status || 'CONFIGURATION_REQUIRED')}
            </div>
            <div class="panel compact" style="display:flex;align-items:center;justify-content:space-between">
              <div><strong>Integration Jobs</strong><div class="muted">${availPosture.integrationJobs?.recentFailures ?? 0} failures last 7 days</div></div>
              ${posturePill(availPosture.integrationJobs?.status || 'UNKNOWN', availPosture.integrationJobs?.status || 'UNKNOWN')}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function controlsTab() {
    const categories = [...new Set(controls.map((c) => c.category))].sort();
    return `
      <div class="panel-head" style="margin-bottom:12px"><div><h2>SOC2 Control Library</h2><p>${controls.length} controls across Security, Availability, Processing Integrity, Confidentiality, and Privacy.</p></div></div>
      ${categories.map((cat) => {
        const catControls = controls.filter((c) => c.category === cat);
        return `
          <section class="panel" style="margin-bottom:16px">
            <div class="panel-head" style="padding-bottom:8px">
              <div><h3 class="subhead" style="color:#7c3aed">${h(cat.replace(/_/g, ' '))}</h3><span class="muted">${catControls.length} controls</span></div>
            </div>
            ${table(catControls, ['Ref', 'Control', 'Domain', 'Evidence Source', 'Status', 'Next Review'], (c) => `
              <tr>
                <td><strong>${h(c.framework_ref)}</strong></td>
                <td>
                  <strong>${h(c.title || c.name)}</strong>
                  <div class="muted">${h((c.description || '').slice(0, 80))}</div>
                </td>
                <td class="muted">${h(c.domain)}</td>
                <td class="muted">${h(c.evidence_source)}</td>
                <td><span style="${statusColor(c.status)};font-weight:600">${h(c.status)}</span></td>
                <td class="muted">${c.next_review_due_at ? fmt(c.next_review_due_at) : '—'}</td>
              </tr>
            `)}
          </section>`;
      }).join('')}
    `;
  }

  function evidenceTab() {
    if (evidence.length === 0) {
      return `
        <div class="panel-head" style="margin-bottom:12px"><div><h2>Evidence Vault</h2><p>Evidence records are generated from real operational events and linked to SOC2 controls.</p></div></div>
        <div class="empty-state"><p>No evidence records linked to controls yet. Evidence is created automatically when documents are linked to entities in the Evidence Vault module.</p></div>
      `;
    }
    return `
      <div class="panel-head" style="margin-bottom:12px"><div><h2>Evidence Vault</h2><p>${evidence.length} evidence records linked to SOC2 controls.</p></div></div>
      <section class="panel">
        ${table(evidence, ['Control', 'Document', 'Type', 'Entity', 'Linked At', 'Status'], (row) => `
          <tr>
            <td><strong>${h(row.framework_ref)}</strong><div class="muted">${h(row.control_name)}</div></td>
            <td>${h(row.file_name)}</td>
            <td class="muted">${h(row.doc_type)}</td>
            <td class="muted">${h(row.entity_type)} · ${h(row.entity_id?.slice(-8))}</td>
            <td class="muted">${fmt(row.linked_at)}</td>
            <td><span style="${statusColor(row.status)};font-weight:600">${h(row.status)}</span></td>
          </tr>
        `)}
      </section>
    `;
  }

  function accessReviewsTab() {
    const currentReview = accessReviews.find((r) => r.status === 'IN_PROGRESS');
    return `
      <div class="panel-head" style="margin-bottom:12px">
        <div><h2>Access Review Center</h2><p>Quarterly user access reviews — confirm, modify, or revoke access per SOC2 CC6.2 and CC6.3.</p></div>
        ${canManage ? `<button class="primary" data-action="create-access-review" type="button">Start New Review</button>` : ''}
      </div>
      ${accessReviews.length === 0 ? `<div class="empty-state"><p>No access reviews started. ${canManage ? 'Click Start New Review to begin a quarterly access review.' : 'Contact an admin to start an access review.'}</p></div>` : ''}
      ${accessReviews.map((review) => `
        <section class="panel" style="margin-bottom:16px">
          <div class="panel-head">
            <div>
              <h3 class="subhead">${h(review.review_name)}</h3>
              <p class="muted">Reviewer: ${h(review.reviewer_name || '—')} · Started: ${fmt(review.started_at)} · Due: ${review.due_at ? fmt(review.due_at) : '—'}</p>
            </div>
            <span style="${statusColor(review.status)};font-weight:600">${h(review.status)}</span>
          </div>
          <div class="kpi-strip" style="margin-bottom:12px">
            <div class="kpi-card"><span>Total</span><strong>${review.total_entries}</strong></div>
            <div class="kpi-card"><span>Reviewed</span><strong style="${statusColor('ok')}">${review.reviewed_entries}</strong></div>
            <div class="kpi-card"><span>Pending</span><strong style="${(review.total_entries - review.reviewed_entries) > 0 ? statusColor('open') : statusColor('ok')}">${review.total_entries - review.reviewed_entries}</strong></div>
            <div class="kpi-card"><span>Revoked</span><strong style="${review.revoked_entries > 0 ? statusColor('open') : ''}">${review.revoked_entries}</strong></div>
          </div>
          ${review.entries && review.entries.length > 0 ? table(review.entries, ['User', 'Role', 'Last Login', 'Recommendation', 'Decision', 'Reviewed By'], (entry) => `
            <tr>
              <td><strong>${h(entry.subject_name)}</strong><div class="muted">${h(entry.subject_email || '')}</div></td>
              <td>${h(entry.current_role)}</td>
              <td class="muted">${entry.last_login_at ? fmt(entry.last_login_at) : '—'}</td>
              <td>${h(entry.recommendation)}</td>
              <td><span style="${statusColor(entry.decision || 'pending')};font-weight:600">${entry.decision || 'PENDING'}</span></td>
              <td class="muted">${entry.reviewed_by_user_id ? (entry.reviewed_at ? fmt(entry.reviewed_at) : '—') : '—'}</td>
            </tr>
          `) : ''}
        </section>
      `).join('')}
    `;
  }

  function riskTab() {
    const openRisks = risks.filter((r) => r.status === 'OPEN');
    const mitigatedRisks = risks.filter((r) => r.status === 'MITIGATED');
    return `
      <div class="panel-head" style="margin-bottom:12px">
        <div><h2>Risk Register</h2><p>${risks.length} risks tracked. ${openRisks.length} open · ${mitigatedRisks.length} mitigated.</p></div>
        ${canManage ? `<button class="primary" data-action="create-risk" type="button">Log Risk</button>` : ''}
      </div>
      ${risks.length === 0 ? `<div class="empty-state"><p>No risks logged yet.</p></div>` : ''}
      <section class="panel">
        ${table(risks, ['ID', 'Risk', 'Category', 'Probability', 'Impact', 'Score', 'Status', 'Mitigation Status'], (r) => `
          <tr>
            <td><strong>${h(r.risk_no)}</strong></td>
            <td>
              <strong>${h(r.title)}</strong>
              <div class="muted">${h((r.description || '').slice(0, 70))}</div>
            </td>
            <td class="muted">${h(r.category)}</td>
            <td><span style="${statusColor(r.probability === 'LOW' ? 'ok' : r.probability === 'MEDIUM' ? 'in_progress' : 'open')};font-weight:600">${h(r.probability)}</span></td>
            <td><span style="${statusColor(r.impact === 'LOW' ? 'ok' : r.impact === 'MEDIUM' ? 'in_progress' : 'open')};font-weight:600">${h(r.impact)}</span></td>
            <td><strong style="${statusColor(r.risk_score > 70 ? 'open' : r.risk_score > 40 ? 'in_progress' : 'ok')}">${r.risk_score ?? '—'}</strong></td>
            <td><span style="${statusColor(r.status)};font-weight:600">${h(r.status)}</span></td>
            <td><span style="${statusColor(r.mitigation_status)};font-weight:600">${h(r.mitigation_status)}</span></td>
          </tr>
        `)}
      </section>
    `;
  }

  function incidentsTab() {
    const open = incidents.filter((i) => i.status === 'OPEN').length;
    const resolved = incidents.filter((i) => i.status === 'RESOLVED' || i.status === 'CLOSED').length;
    return `
      <div class="panel-head" style="margin-bottom:12px">
        <div><h2>Incident Register</h2><p>${incidents.length} incidents · ${open} open · ${resolved} resolved/closed.</p></div>
        ${canManage ? `<button class="primary" data-action="create-incident" type="button">Log Incident</button>` : ''}
      </div>
      ${incidents.length === 0 ? `<div class="empty-state"><p>No incidents logged yet.</p></div>` : ''}
      <section class="panel">
        ${table(incidents, ['ID', 'Incident', 'Category', 'Severity', 'Status', 'Detected', 'Resolved'], (i) => `
          <tr>
            <td><strong>${h(i.incident_no)}</strong></td>
            <td>
              <strong>${h(i.title)}</strong>
              <div class="muted">${h((i.description || '').slice(0, 70))}</div>
            </td>
            <td class="muted">${h(i.category)}</td>
            <td><span style="${statusColor(i.severity === 'LOW' ? 'ok' : i.severity === 'MEDIUM' ? 'in_progress' : 'open')};font-weight:600">${h(i.severity)}</span></td>
            <td><span style="${statusColor(i.status)};font-weight:600">${h(i.status)}</span></td>
            <td class="muted">${fmt(i.detected_at)}</td>
            <td class="muted">${i.resolved_at ? fmt(i.resolved_at) : '—'}</td>
          </tr>
        `)}
      </section>
      ${incidents.filter((i) => i.post_mortem).length > 0 ? `
        <section class="panel" style="margin-top:16px">
          <div class="panel-head"><div><h3 class="subhead">Post-Mortem Records</h3><p>Root cause and resolution documentation for closed incidents.</p></div></div>
          ${incidents.filter((i) => i.post_mortem).map((i) => `
            <div class="panel compact" style="margin-bottom:8px">
              <div style="display:flex;justify-content:space-between;margin-bottom:4px">
                <strong>${h(i.incident_no)} — ${h(i.title)}</strong>
                <span style="${statusColor(i.status)};font-weight:600">${h(i.status)}</span>
              </div>
              <p class="muted"><strong>Root cause:</strong> ${h(i.root_cause)}</p>
              <p class="muted"><strong>Resolution:</strong> ${h(i.resolution)}</p>
              <p class="muted"><strong>Post-mortem:</strong> ${h(i.post_mortem)}</p>
            </div>
          `).join('')}
        </section>
      ` : ''}
    `;
  }

  function vendorsTab() {
    return `
      <div class="panel-head" style="margin-bottom:12px"><div><h2>Vendor / Integration Register</h2><p>Third-party vendors and integrations with data handling, risk level, and configuration status.</p></div></div>
      ${vendors.length === 0 ? `<div class="empty-state"><p>No vendors registered.</p></div>` : ''}
      <section class="panel">
        ${table(vendors, ['Vendor / Integration', 'Type', 'Data Handled', 'Risk', 'Status', 'Notes'], (v) => `
          <tr>
            <td><strong>${h(v.name)}</strong></td>
            <td class="muted">${h(v.type)}</td>
            <td class="muted" style="max-width:200px">${h(v.data_handled)}</td>
            <td><span style="${statusColor(v.risk_level === 'LOW' ? 'ok' : v.risk_level === 'MEDIUM' ? 'in_progress' : 'open')};font-weight:600">${h(v.risk_level)}</span></td>
            <td><span style="${statusColor(v.status)};font-weight:600">${h(v.status)}</span></td>
            <td class="muted" style="max-width:220px">${h(v.notes || '')}</td>
          </tr>
        `)}
      </section>
    `;
  }

  function aiGovernanceTab() {
    return `
      <div class="panel-head" style="margin-bottom:12px"><div><h2>AI Governance Log</h2><p>Every AI advisory request, copilot query, and human approval decision is recorded here.</p></div></div>
      <div class="panel compact tint" style="border-left:4px solid #0d9488;margin-bottom:16px">
        <strong>AI Governance Posture:</strong> All AI output is <strong>SYSTEM_GENERATED</strong> (deterministic rules only).
        No LLM provider is configured. All advisory outputs are read-only. Human approval is required before any domain action.
        Provider status: <strong>NOT_CONFIGURED</strong> — integration slot ready.
      </div>
      <section class="kpi-strip">
        <div class="kpi-card"><span>Total Events</span><strong>${aiLogSummary.total ?? aiLogs.length}</strong></div>
        <div class="kpi-card"><span>Advisory Requests</span><strong>${aiLogSummary.advisoryRequests ?? 0}</strong></div>
        <div class="kpi-card"><span>Copilot Queries</span><strong>${aiLogSummary.copilotQueries ?? 0}</strong></div>
        <div class="kpi-card"><span>Human Approved</span><strong>${aiLogSummary.humanApproved ?? 0}</strong></div>
        <div class="kpi-card"><span>Provider</span><strong class="muted">NOT_CONFIGURED</strong></div>
      </section>
      <section class="panel" style="margin-top:16px">
        ${table(aiLogs.slice(0, 50), ['Actor', 'Module', 'Agent', 'Event Type', 'Data Scope', 'Provider', 'Human Approval', 'At'], (log) => `
          <tr>
            <td><strong>${h(log.actor_name || log.actor_user_id)}</strong><div class="muted">${h(log.actor_role)}</div></td>
            <td class="muted">${h(log.module)}</td>
            <td class="muted">${h(log.agent_key)}</td>
            <td>${badge(log.event_type)}</td>
            <td class="muted" style="max-width:180px">${h(log.data_scope)}</td>
            <td>${badge(log.provider_status)}</td>
            <td>${log.human_approval_required ? `<span style="${statusColor(log.human_approved_at ? 'ok' : 'open')};font-weight:600">${log.human_approved_at ? 'Approved' : 'Required'}</span>` : '<span class="muted">Not required</span>'}</td>
            <td class="muted">${fmt(log.created_at)}</td>
          </tr>
        `)}
        ${aiLogs.length === 0 ? `<div class="empty-state compact-empty"><p>No AI governance events logged yet.</p></div>` : ''}
      </section>
    `;
  }

  function securityTab() {
    if (!securityPosture || Object.keys(securityPosture).length === 0) {
      return `<div class="empty-state"><p>Security posture data unavailable.</p></div>`;
    }
    const checks = [
      { label: 'Auth Mode', value: securityPosture.authMode, note: securityPosture.authMode === 'dev' ? 'Dev context — not for production.' : 'Configured.' },
      { label: 'Environment', value: securityPosture.environment, note: '' },
      { label: 'MFA', value: securityPosture.mfa?.status, note: securityPosture.mfa?.note },
      { label: 'SSO / OIDC', value: securityPosture.sso?.status, note: securityPosture.sso?.note },
      { label: 'SSO Provider', value: securityPosture.sso?.providerType || 'OIDC', note: securityPosture.sso?.issuer || 'Configuration required' },
      { label: 'Object Storage', value: securityPosture.objectStorage?.status, note: securityPosture.objectStorage?.note },
      { label: 'CSRF Protection', value: securityPosture.csrfProtection?.status, note: securityPosture.csrfProtection?.note },
      { label: 'Tenant Isolation', value: securityPosture.tenantIsolation?.status, note: securityPosture.tenantIsolation?.note },
      { label: 'RBAC', value: securityPosture.rbac?.status, note: securityPosture.rbac?.note },
      { label: 'Security Headers', value: securityPosture.securityHeaders?.status, note: (securityPosture.securityHeaders?.headers || []).join(', ') },
      { label: 'Stack Trace Suppression', value: securityPosture.stackTraces?.suppressed ? 'SUPPRESSED' : 'VISIBLE', note: securityPosture.stackTraces?.note },
      { label: 'Rate Limiting', value: securityPosture.rateLimiting?.status, note: securityPosture.rateLimiting?.note },
      { label: 'Dev Context Blocked', value: securityPosture.devContext?.blocked ? 'BLOCKED' : 'ACTIVE', note: securityPosture.devContext?.note }
    ];
    return `
      <div class="panel-head" style="margin-bottom:12px"><div><h2>Security Posture</h2><p>Live security control status — derived from current environment and system state.</p></div></div>
      <div class="panel compact tint" style="border-left:4px solid #2563eb;margin-bottom:16px">
        SOC2 CC6.1, CC6.6 compliance posture. Items marked <strong>CONFIGURATION_REQUIRED</strong> must be resolved before production deployment.
      </div>
      <section class="panel">
        <div class="field-stack" style="gap:8px">
          ${checks.map((c) => `
            <div class="panel compact" style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px">
              <div style="min-width:200px">
                <strong>${h(c.label)}</strong>
                ${c.note ? `<div class="muted">${h(c.note)}</div>` : ''}
              </div>
              <span style="${statusColor(c.value)};font-weight:600;white-space:nowrap">${h(c.value || '—')}</span>
            </div>
          `).join('')}
        </div>
      </section>
      ${(securityPosture.apiAudit?.recentFailedLogins || 0) > 0 ? `
        <section class="panel" style="margin-top:16px">
          <div class="panel-head"><div><h3 class="subhead">API Audit Signals</h3></div></div>
          <div class="muted" style="padding:12px">
            Failed login attempts (last 24h): <strong>${securityPosture.apiAudit.recentFailedLogins}</strong><br>
            Role changes (last 30d): <strong>${securityPosture.apiAudit.roleChangeCount ?? 0}</strong>
          </div>
        </section>
      ` : ''}
    `;
  }

  function availabilityTab() {
    if (!availPosture || Object.keys(availPosture).length === 0) {
      return `<div class="empty-state"><p>Availability posture data unavailable.</p></div>`;
    }
    return `
      <div class="panel-head" style="margin-bottom:12px"><div><h2>Availability Posture</h2><p>SOC2 A1.1 — capacity, backup, monitoring, and restore readiness.</p></div></div>
      <div class="panel compact tint" style="border-left:4px solid #2563eb;margin-bottom:16px">
        Items marked <strong>CONFIGURATION_REQUIRED</strong> must be resolved before production deployment per the production checklist.
      </div>
      <section class="panel">
        <div class="field-stack" style="gap:8px">
          <div class="panel compact" style="display:flex;align-items:flex-start;justify-content:space-between">
            <div><strong>Liveness endpoint</strong><div class="muted">${availPosture.healthEndpoints?.liveness?.path}</div></div>
            ${posturePill(availPosture.healthEndpoints?.liveness?.status || 'UNKNOWN', availPosture.healthEndpoints?.liveness?.status || 'UNKNOWN')}
          </div>
          <div class="panel compact" style="display:flex;align-items:flex-start;justify-content:space-between">
            <div><strong>Readiness endpoint</strong><div class="muted">${availPosture.healthEndpoints?.readiness?.path} · checks: ${(availPosture.healthEndpoints?.readiness?.checks || []).join(', ')}</div></div>
            ${posturePill(availPosture.healthEndpoints?.readiness?.status || 'UNKNOWN', availPosture.healthEndpoints?.readiness?.status || 'UNKNOWN')}
          </div>
          <div class="panel compact" style="display:flex;align-items:flex-start;justify-content:space-between">
            <div><strong>Database Schema</strong><div class="muted">Version ${availPosture.database?.migrationVersion ?? '?'} / ${availPosture.database?.expectedVersion ?? '?'} · ${availPosture.database?.path}</div></div>
            ${posturePill(availPosture.database?.status || 'UNKNOWN', availPosture.database?.status || 'UNKNOWN')}
          </div>
          <div class="panel compact" style="display:flex;align-items:flex-start;justify-content:space-between">
            <div><strong>Backup Policy</strong><div class="muted">${availPosture.backup?.note}</div></div>
            ${posturePill(availPosture.backup?.status || 'CONFIGURATION_REQUIRED', availPosture.backup?.status || 'CONFIGURATION_REQUIRED')}
          </div>
          <div class="muted" style="padding-left:4px;margin-top:-2px">Backup records: ${h(availPosture.backup?.records?.length || 0)}</div>
          <div class="panel compact" style="display:flex;align-items:flex-start;justify-content:space-between">
            <div><strong>Restore Posture</strong><div class="muted">${availPosture.restore?.note}</div></div>
            ${posturePill(availPosture.restore?.status || 'MANUAL', availPosture.restore?.status || 'MANUAL')}
          </div>
          <div class="muted" style="padding-left:4px;margin-top:-2px">Restore tests: ${h(availPosture.restore?.tests?.length || 0)}</div>
          <div class="panel compact" style="display:flex;align-items:flex-start;justify-content:space-between">
            <div><strong>Uptime Monitoring</strong><div class="muted">${availPosture.monitoring?.note}</div></div>
            ${posturePill(availPosture.monitoring?.status || 'CONFIGURATION_REQUIRED', availPosture.monitoring?.status || 'CONFIGURATION_REQUIRED')}
          </div>
          <div class="panel compact" style="display:flex;align-items:flex-start;justify-content:space-between">
            <div><strong>Integration Jobs (7d)</strong><div class="muted">${availPosture.integrationJobs?.recentFailures ?? 0} failures</div></div>
            ${posturePill(availPosture.integrationJobs?.status || 'UNKNOWN', availPosture.integrationJobs?.status || 'UNKNOWN')}
          </div>
          <div class="panel compact" style="display:flex;align-items:flex-start;justify-content:space-between">
            <div><strong>Offline Sync Queue</strong><div class="muted">${availPosture.offlineSync?.pendingBatches ?? 0} pending batches</div></div>
            ${posturePill(availPosture.offlineSync?.status || 'UNKNOWN', availPosture.offlineSync?.status || 'UNKNOWN')}
          </div>
        </div>
      </section>
    `;
  }

  function renderActiveTab() {
    if (activeTab === 'Dashboard') return dashboardTab();
    if (activeTab === 'Controls') return controlsTab();
    if (activeTab === 'Evidence') return evidenceTab();
    if (activeTab === 'Access Reviews') return accessReviewsTab();
    if (activeTab === 'Risk') return riskTab();
    if (activeTab === 'Incidents') return incidentsTab();
    if (activeTab === 'Vendors') return vendorsTab();
    if (activeTab === 'AI Governance') return aiGovernanceTab();
    if (activeTab === 'Security') return securityTab();
    if (activeTab === 'Availability') return availabilityTab();
    return dashboardTab();
  }

  return `
    ${hero()}
    ${moduleBanner({
      eyebrow: 'Compliance and trust',
      title: 'Compliance & Trust Center',
      purpose: 'Controls, evidence, access reviews, vendor risk, AI governance, and operational posture are visible for client and auditor review.',
      status: 'Audit-ready posture',
      chips: [
        `Controls: ${controls.length}`,
        `Evidence: ${evidence.length}`,
        `Access reviews: ${accessReviews.length}`,
        `AI events: ${aiLogs.length}`
      ],
      actions: [
        `<button class="ghost" data-page="Documents & Evidence Vault" type="button">Open Evidence Vault</button>`,
        `<button class="ghost" data-page="Audit Black Box" type="button">Open Audit Log Explorer</button>`
      ]
    })}
    ${moduleSignals([
      { kind: 'Controls', title: `${h(controls.length)} control record(s)`, detail: `${h(controlSummary.implemented || controls.filter((c) => c.status === 'implemented').length)} implemented or enforced.` },
      { kind: 'Evidence', title: `${h(evidence.length)} evidence record(s)`, detail: 'Evidence maps to real operational events and controls.' },
      { kind: 'Access reviews', title: `${h(accessReviews.length)} review cycle(s)`, detail: 'User access reviews stay visible and permissioned.' },
      { kind: 'AI governance', title: `${h(aiLogs.length)} AI governance event(s)`, detail: 'AI remains governed, read-only, and auditable.' }
    ])}
    ${tabNav()}
    ${renderActiveTab()}
  `;
}

export function aiOpsPage() {
  const aiSummary = state.data?.aiSummary || {};
  const recommendations = state.data?.aiRecommendations?.recommendations || [];
  const runs = state.data?.aiRuns?.runs || [];
  const agents = state.data?.aiAgents?.agents || aiSummary.agents || [];
  const providerStatus = aiSummary.providerStatus ?? 'NOT_CONFIGURED';
  const openRecs = recommendations.filter((r) => r.status === 'OPEN');
  const canGenerate = can('generate_ai_recommendations');
  const canDismiss = can('dismiss_ai_recommendations');
  const canApprove = can('approve_ai_placeholder');
  const canQuery = can('query_ops_copilot');
  return `
    ${hero()}
    ${moduleBanner({
      eyebrow: 'Governed intelligence',
      title: 'AI Operations',
      purpose: 'AI remains advisory-only. Recommendations cite source records, confidence, and review state before any human action.',
      status: providerStatus === 'NOT_CONFIGURED' ? 'Provider not configured' : 'Advisory enabled',
      chips: [
        `Open recommendations: ${aiSummary.open ?? 0}`,
        `Approval pending: ${aiSummary.approvalPending ?? 0}`,
        `Provider: ${providerStatus}`,
        `Total runs: ${aiSummary.totalRuns ?? 0}`
      ],
      actions: [
        `<button class="ghost" data-page="Compliance Center" type="button">Open Compliance Center</button>`,
        `<button class="ghost" data-page="Procurement Center" type="button">Open Procurement Center</button>`
      ]
    })}
    ${moduleSignals([
      { kind: 'Open recommendations', title: `${h(openRecs.length)} live recommendation(s)`, detail: 'Only source-backed recommendations are shown.' },
      { kind: 'Approval queue', title: `${h(aiSummary.approvalPending ?? 0)} approval-pending item(s)`, detail: 'Human approval remains required for any action.' },
      { kind: 'Provider posture', title: providerStatus, detail: 'If no provider is configured, advisory output stays deterministic and read-only.' },
      { kind: 'Audit trail', title: `${h(aiSummary.totalRuns ?? 0)} run(s) logged`, detail: 'Every AI run remains audit-visible.' }
    ])}
    <div class="panel compact tint" style="border-left:4px solid var(--warn,#d97706);margin-bottom:16px">
      <strong>Provider status: ${h(providerStatus)}</strong> —
      ${providerStatus === 'NOT_CONFIGURED'
        ? 'No AI model provider is configured. All insights are SYSTEM_GENERATED (deterministic rules). No LLM output.'
        : 'AI provider is configured. Outputs are model-generated and should be reviewed before action.'}
      <span class="muted"> · AI is read-only. No domain actions are executed automatically.</span>
    </div>
    <section class="kpi-strip">
      <div class="kpi-card"><span>Open</span><strong class="${(aiSummary.open ?? 0) > 0 ? 'warn' : ''}">${h(aiSummary.open ?? 0)}</strong></div>
      <div class="kpi-card"><span>Dismissed</span><strong>${h(aiSummary.dismissed ?? 0)}</strong></div>
      <div class="kpi-card"><span>Approval Pending</span><strong class="${(aiSummary.approvalPending ?? 0) > 0 ? 'warn' : ''}">${h(aiSummary.approvalPending ?? 0)}</strong></div>
      <div class="kpi-card"><span>Total Runs</span><strong>${h(aiSummary.totalRuns ?? 0)}</strong></div>
      <div class="kpi-card"><span>Last Run</span><strong class="muted">${aiSummary.lastRun ? fmt(aiSummary.lastRun.created_at) : '—'}</strong></div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Recommendation Queue</h2>
            <p>Source-backed, read-only. Each recommendation cites specific tenant records.</p>
          </div>
          ${canGenerate ? `<button class="ghost" data-action="generate-ai-recommendations" type="button">Generate</button>` : ''}
        </div>
        ${table(openRecs, ['Category', 'Title', 'Severity', 'Agent', 'Actions'], (row) => `
          <tr>
            <td>${badge(row.category)}</td>
            <td>
              <strong>${h(row.title)}</strong>
              <div class="muted">${h(row.human_summary?.slice(0, 80) || '')}</div>
            </td>
            <td>${badge(row.severity)}</td>
            <td class="muted">${h(row.agent_key)}</td>
            <td>
              ${canApprove && row.status === 'OPEN' ? `<button class="ghost small" data-action="approve-ai-placeholder" data-id="${h(row.id)}" type="button">Acknowledge</button>` : ''}
              ${canDismiss && row.status === 'OPEN' ? `<button class="ghost small danger" data-action="dismiss-ai-recommendation" data-id="${h(row.id)}" type="button">Dismiss</button>` : ''}
              ${!canDismiss && !canApprove ? badge(row.status) : ''}
            </td>
          </tr>
        `)}
        ${openRecs.length === 0 ? `<div class="empty-state"><p>No open recommendations. ${canGenerate ? 'Click Generate to run deterministic analysis.' : 'Contact a supervisor to generate recommendations.'}</p></div>` : ''}
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <h2>Agent Registry</h2>
            <p>All agents are read-only and governed. No autonomous action is taken.</p>
          </div>
        </div>
        ${table(agents, ['Agent', 'Category', 'Provider', 'Read-Only'], (row) => `
          <tr>
            <td><strong>${h(row.name)}</strong><div class="muted">${h(row.description?.slice(0, 60) || '')}</div></td>
            <td>${badge(row.category)}</td>
            <td>${badge(row.provider ?? 'NOT_CONFIGURED')}</td>
            <td><span class="state-ok">✓ Read only</span></td>
          </tr>
        `)}
      </div>
    </section>
    ${canQuery ? `
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>Ops Copilot</h2>
          <p>Read-only Q&A from tenant-safe operational context. ${providerStatus === 'NOT_CONFIGURED' ? '<strong>No LLM provider — returns SYSTEM_GENERATED deterministic insights only.</strong>' : 'Model-backed. Review all answers before action.'}</p>
        </div>
      </div>
      <div class="field-stack" style="max-width:640px">
        <label class="field">
          <span>Query (read-only — no domain actions will be triggered)</span>
          <input id="copilotQueryInput" type="text" maxlength="1000" placeholder="e.g. What inventory risks should I address today?" />
        </label>
        <button class="primary" data-action="copilot-query" type="button">Ask Ops Copilot</button>
        <div id="copilotResult" class="panel compact tint" style="display:none;white-space:pre-wrap"></div>
      </div>
    </section>
    ` : ''}
    <section class="panel">
      <div class="panel-head">
        <div>
          <h2>AI Run Log</h2>
          <p>Every generation run and copilot query is logged with input/output counts and provider status.</p>
        </div>
      </div>
      ${table(runs.slice(0, 30), ['Run ID', 'Agent', 'Type', 'Status', 'Provider', 'In/Out', 'At'], (row) => `
        <tr>
          <td class="muted">${h(row.id?.slice(0, 14))}</td>
          <td>${h(row.agent_key)}</td>
          <td>${h(row.run_type)}</td>
          <td>${badge(row.status)}</td>
          <td>${badge(row.provider)}</td>
          <td>${h(row.input_record_count)} / ${h(row.output_record_count)}</td>
          <td class="muted">${fmt(row.created_at)}</td>
        </tr>
      `)}
    </section>
    ${recommendations.filter((r) => r.status !== 'OPEN').length > 0 ? `
    <section class="panel">
      <div class="panel-head"><div><h2>Dismissed / Approved</h2><p>Closed recommendations for audit trail.</p></div></div>
      ${table(recommendations.filter((r) => r.status !== 'OPEN').slice(0, 20), ['Title', 'Category', 'Status', 'By'], (row) => `
        <tr>
          <td>${h(row.title)}</td>
          <td>${badge(row.category)}</td>
          <td>${badge(row.status)}</td>
          <td class="muted">${h(row.dismissed_by_user_id || row.updated_by_user_id || '—')}</td>
        </tr>
      `)}
    </section>
    ` : ''}
  `;
}

function aiPage() {
  return aiOpsPage();
}

export function reportsPage() {
  const reports = state.data?.reports || {};
  const summary = reports.summary || {};
  const definitions = reports.definitions?.definitions || [];
  const recentRuns = reports.runs?.runs || [];
  const groupedReports = definitions.reduce((groups, definition) => {
    const key = definition.category || 'Reports';
    if (!groups[key]) groups[key] = [];
    groups[key].push(definition);
    return groups;
  }, {});
  const kpis = [
    { label: 'Available reports', value: summary.availableReports ?? definitions.length },
    { label: 'Recent runs', value: summary.totalRuns ?? recentRuns.length },
    { label: 'Completed', value: summary.completedRuns ?? 0 },
    { label: 'Failed', value: summary.failedRuns ?? 0 },
    { label: 'Exports', value: summary.recentExports ?? 0 },
    { label: 'Last run', value: summary.latestRunAt ? fmt(summary.latestRunAt) : 'No runs yet' }
  ];
  return `
    ${hero('Reports Center', 'Executive reporting catalog with backend-owned runs, CSV/PDF exports, and tenant-safe audit-backed output.')}
    <section class="status-strip">
      ${kpis.map((kpi) => `
        <div class="status-card compact neutral">
          <span>${h(kpi.label)}</span>
          <strong>${h(kpi.value)}</strong>
        </div>
      `).join('')}
    </section>
    <section class="split">
      <div class="panel">
        <div class="section-head">
          <div>
            <h2>Report Catalog</h2>
            <p>Choose a governed report, run it from the backend, and export the result.</p>
          </div>
        </div>
        ${Object.entries(groupedReports).map(([category, items]) => `
          <div class="section-block">
            <div class="section-head compact-head">
              <div>
                <h3>${h(category)}</h3>
                <p class="muted">${items.length} report definition(s)</p>
              </div>
            </div>
            <div class="grid-2">
              ${items.map((report) => `
                <article class="landing-card" data-report-key="${h(report.report_key)}">
                  <div class="landing-card-head">
                    <div>
                      <div class="eyebrow">${h(report.module_page || 'Reports')}</div>
                      <strong>${h(report.title)}</strong>
                    </div>
                    <span class="chip">${h(report.default_format || 'CSV')}</span>
                  </div>
                  <p>${h(report.description)}</p>
                  <div class="actions-row">
                    <button class="primary" type="button" data-action="run-report" data-report-key="${h(report.report_key)}" data-format="CSV">Run CSV</button>
                    <button class="ghost" type="button" data-action="run-report" data-report-key="${h(report.report_key)}" data-format="PDF">Run PDF</button>
                  </div>
                </article>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div class="panel">
        <div class="section-head">
          <div>
            <h2>Recent Runs</h2>
            <p>Open a run to review result rows, exports, and audit history.</p>
          </div>
        </div>
        ${recentRuns.length ? table(recentRuns, ['Run', 'Report', 'Status', 'Rows', 'Format', 'Action'], (run) => `
          <tr data-report-run="${h(run.id)}">
            <td><strong>${h(run.run_no)}</strong><div class="muted">${h(fmt(run.created_at))}</div></td>
            <td>${h(run.report_title)}</td>
            <td>${badge(run.status)}</td>
            <td>${h(run.row_count)}</td>
            <td>${h(run.format)}</td>
            <td>
              <button class="ghost small" type="button" data-drawer-focus="report-run" data-drawer-id="${h(run.id)}" data-drawer-open="true">Open</button>
            </td>
          </tr>
        `) : '<div class="empty-state">No report runs yet. Run a report from the catalog to generate audit-backed output.</div>'}
      </div>
    </section>
    <section class="panel">
      <div class="section-head">
        <div>
          <h2>Export Promise</h2>
          <p>Reports are generated by the backend and exported as CSV or PDF with tenant-scoped audit trails.</p>
        </div>
      </div>
      <div class="grid-3">
        <div class="metric-card compact"><span>Tenant safe</span><strong>Yes</strong></div>
        <div class="metric-card compact"><span>Audit-backed</span><strong>Yes</strong></div>
        <div class="metric-card compact"><span>PDF export</span><strong>Available</strong></div>
      </div>
    </section>
    ${shellDrawer()}
  `;
}

function adminPage() {
  if (!can('manage_admin')) {
    return `
      ${hero()}
      <section class="panel">
        <div class="empty-state">
          This tenant user does not have access to admin controls.
        </div>
      </section>
    `;
  }
  const admin = state.data?.admin || { users: [], departments: [], facilities: [], devices: [], roles: [] };
  return `
    ${hero()}
    <section class="grid-3">
      <div class="panel compact"><h3 class="subhead">Users & Roles</h3><p class="muted">Tenant-scoped role mapping with server-side permissions.</p></div>
      <div class="panel compact"><h3 class="subhead">Departments</h3><p class="muted">${h(admin.departments.map((dept) => dept.name).join(', '))}</p></div>
      <div class="panel compact"><h3 class="subhead">Devices</h3><p class="muted">${h(admin.devices.length)} trusted device(s) tracked.</p></div>
    </section>
    <section class="split">
      <div class="panel">
        <div class="panel-head"><div><h2>Users</h2><p>Tenant users, roles, and facility assignments.</p></div></div>
        ${table(admin.users, ['Name', 'Role', 'Department', 'Facility'], (row) => `
          <tr>
            <td><strong>${h(row.name)}</strong><div class="muted">${h(row.email)}</div></td>
            <td>${h(row.role_key)}</td>
            <td>${h(admin.departments.find((dept) => dept.id === row.department_id)?.name || '')}</td>
            <td>${h(admin.facilities.find((facility) => facility.id === row.facility_id)?.name || '')}</td>
          </tr>
        `)}
      </div>
      <div class="panel">
        <div class="panel-head"><div><h2>Devices</h2><p>Trusted workstations and tablets assigned to the tenant.</p></div></div>
        ${table(admin.devices, ['Device', 'Facility', 'Type', 'Trusted'], (row) => `
          <tr>
            <td><strong>${h(row.name)}</strong><div class="muted">${fmt(row.last_seen_at)}</div></td>
            <td>${h(admin.facilities.find((facility) => facility.id === row.facility_id)?.name || '')}</td>
            <td>${h(row.device_type)}</td>
            <td>${badge(row.trusted ? 'Trusted' : 'Review')}</td>
          </tr>
        `)}
      </div>
    </section>
  `;
}

export function inventoryOptimizationPage() {
  const invOpt = state.data?.invOpt || {};
  const summary = invOpt.summary || {};
  const plans = invOpt.plans || [];
  const variances = invOpt.variances || [];
  const recommendations = invOpt.recommendations || [];
  const classifications = invOpt.classifications || [];

  const kpis = [
    { label: 'Accuracy', value: summary.accuracyPct != null ? `${Number(summary.accuracyPct).toFixed(1)}%` : '—', tone: summary.accuracyPct != null && summary.accuracyPct >= 95 ? 'ok' : 'warn' },
    { label: 'Open variances', value: summary.openVariances ?? 0, tone: (summary.openVariances ?? 0) > 0 ? 'warn' : 'ok' },
    { label: 'Blocker variances', value: summary.blockerVariances ?? 0, tone: (summary.blockerVariances ?? 0) > 0 ? 'alert' : 'ok' },
    { label: 'Controlled variances', value: summary.controlledVariances ?? 0, tone: (summary.controlledVariances ?? 0) > 0 ? 'alert' : 'ok' },
    { label: 'Cycle counts due', value: summary.cycleDue ?? 0, tone: (summary.cycleDue ?? 0) > 0 ? 'warn' : 'neutral' },
    { label: 'Reorder risks', value: summary.reorderRisks ?? 0, tone: (summary.reorderRisks ?? 0) > 0 ? 'warn' : 'neutral' },
    { label: 'Stockout risks', value: summary.stockoutRisks ?? 0, tone: (summary.stockoutRisks ?? 0) > 0 ? 'alert' : 'ok' }
  ];

  const planStatusTone = { DRAFT: 'neutral', SCHEDULED: 'info', IN_PROGRESS: 'warn', REVIEW_PENDING: 'warn', APPROVED: 'ok', POSTED: 'ok', CANCELLED: 'muted' };
  const varianceTone = { OPEN: 'warn', UNDER_REVIEW: 'warn', APPROVED: 'ok', REJECTED: 'muted', POSTED: 'ok', WAIVED: 'muted' };
  const severityTone = { INFO: 'neutral', WARNING: 'warn', BLOCKER: 'alert' };
  const recTone = { OPEN: 'warn', REVIEWED: 'info', APPROVED: 'ok', CONVERTED_TO_REQUEST: 'ok', DISMISSED: 'muted', EXPIRED: 'muted' };
  const priorityTone = { CRITICAL: 'alert', HIGH: 'warn', MEDIUM: 'info', LOW: 'neutral' };
  const classificationTone = { A: 'alert', B: 'warn', C: 'neutral' };

  return `
    ${hero('Inventory Optimization Center', 'Cycle counts, variance control, replenishment planning, and ABC classification — backed by live tenant inventory data. Recommendations are reviewable. Stock adjustments require approved posting.')}
    <section class="status-strip">
      ${kpis.map((kpi) => `
        <div class="status-card compact ${kpi.tone || 'neutral'}">
          <span>${h(kpi.label)}</span>
          <strong>${h(kpi.value)}</strong>
        </div>
      `).join('')}
    </section>

    <section class="split">
      <div class="panel">
        <div class="section-head">
          <div><h2>Cycle Count Plans</h2><p>Scheduled and active inventory count plans across facilities.</p></div>
          <div class="actions">
            <button class="btn-primary" data-action="create-cycle-count-plan">New Plan</button>
          </div>
        </div>
        ${table(plans, ['Plan', 'Scope', 'Status', 'Scheduled', 'Lines'], (row) => `
          <tr>
            <td><strong>${h(row.plan_no)}</strong><div class="muted">${h(row.title)}</div></td>
            <td>${h(row.scope_type || 'FULL')}</td>
            <td>${badge(row.status, planStatusTone[row.status] || 'neutral')}</td>
            <td>${h(row.scheduled_date ? fmt(row.scheduled_date) : '—')}</td>
            <td>${h(row.line_count ?? '—')}</td>
          </tr>
        `)}
      </div>
      <div class="panel">
        <div class="section-head">
          <div><h2>Variance Review Queue</h2><p>Counted quantities that differ from expected. Controlled-item variances require elevated approval.</p></div>
        </div>
        ${table(variances, ['Item', 'Variance', 'Severity', 'Status', 'Controlled'], (row) => `
          <tr>
            <td><strong>${h(row.item_name || row.item_id)}</strong><div class="muted">${h(row.sku || '')}</div></td>
            <td>${h(row.variance_qty > 0 ? '+' : '')}${h(Number(row.variance_qty || 0).toFixed(0))} <span class="muted">(${h(Number(row.variance_pct || 0).toFixed(1))}%)</span></td>
            <td>${badge(row.severity, severityTone[row.severity] || 'neutral')}</td>
            <td>${badge(row.status, varianceTone[row.status] || 'neutral')}</td>
            <td>${row.controlled ? badge('Controlled', 'alert') : badge('Standard', 'ok')}</td>
          </tr>
        `)}
      </div>
    </section>

    <section class="split">
      <div class="panel">
        <div class="section-head">
          <div><h2>Replenishment Recommendations</h2><p>Backend-generated reorder signals from live stock, demand, and PO data. Recommendations are reviewable only — no automatic PO or request creation.</p></div>
          <div class="actions">
            <button class="btn-secondary" data-action="generate-replenishment-recs">Generate</button>
          </div>
        </div>
        ${table(recommendations, ['Item', 'Type', 'Priority', 'On Hand', 'Suggested Qty', 'Status'], (row) => `
          <tr>
            <td><strong>${h(row.item_name || row.item_id)}</strong><div class="muted">${h(row.sku || '')}</div></td>
            <td>${h(row.recommendation_type)}</td>
            <td>${badge(row.priority, priorityTone[row.priority] || 'neutral')}</td>
            <td>${h(Number(row.on_hand_qty || row.current_on_hand || 0).toFixed(0))}</td>
            <td>${h(Number(row.suggested_qty || 0).toFixed(0))}</td>
            <td>${badge(row.status, recTone[row.status] || 'neutral')}</td>
          </tr>
        `)}
        <p class="muted note">Recommendations are reviewable. Stock adjustments require approved posting. Inventory accuracy is audit-backed.</p>
      </div>
      <div class="panel">
        <div class="section-head">
          <div><h2>ABC Classification</h2><p>Items ranked by inventory value, movement frequency, and criticality. Controlled items are elevated to higher review priority.</p></div>
          <div class="actions">
            <button class="btn-secondary" data-action="recalculate-classifications">Recalculate</button>
          </div>
        </div>
        ${table(classifications, ['Item', 'Class', 'Score', 'Reason'], (row) => `
          <tr>
            <td><strong>${h(row.item_name || row.item_id)}</strong><div class="muted">${h(row.sku || '')}</div></td>
            <td>${badge(row.classification, classificationTone[row.classification] || 'neutral')}</td>
            <td>${h(Number(row.score || 0).toFixed(1))}</td>
            <td class="muted">${h(row.reason ? row.reason.slice(0, 60) + (row.reason.length > 60 ? '…' : '') : '—')}</td>
          </tr>
        `)}
        <p class="muted note">If insufficient movement history is detected, classification is based on inventory value and criticality only.</p>
      </div>
    </section>
  `;
}

// ── Phase 3J: Asset & Custody Center ─────────────────────────────────────────

export function assetCustodyPage() {
  const ac = state.data?.assetCustody || {};
  const summary = ac.summary || {};
  const assets = ac.assets || [];
  const maintenance = ac.maintenance || [];
  const disposals = ac.disposals || [];

  const kpis = [
    { label: 'Total assets', value: summary.total_assets ?? 0, tone: 'neutral' },
    { label: 'Assigned', value: summary.assigned ?? 0, tone: (summary.assigned ?? 0) > 0 ? 'info' : 'neutral' },
    { label: 'In transfer', value: summary.in_transfer ?? 0, tone: (summary.in_transfer ?? 0) > 0 ? 'warn' : 'neutral' },
    { label: 'Return pending', value: summary.return_pending ?? 0, tone: (summary.return_pending ?? 0) > 0 ? 'warn' : 'neutral' },
    { label: 'Damaged / Lost', value: (summary.damaged ?? 0) + (summary.lost ?? 0), tone: ((summary.damaged ?? 0) + (summary.lost ?? 0)) > 0 ? 'alert' : 'ok' },
    { label: 'Disposal pending', value: summary.disposal_pending ?? 0, tone: (summary.disposal_pending ?? 0) > 0 ? 'warn' : 'neutral' },
    { label: 'Controlled assigned', value: summary.controlled_assigned ?? 0, tone: (summary.controlled_assigned ?? 0) > 0 ? 'alert' : 'ok' }
  ];

  const statusTone = {
    AVAILABLE: 'ok', ASSIGNED: 'info', IN_TRANSFER: 'warn', RETURN_PENDING: 'warn',
    RETURNED: 'ok', DAMAGED: 'alert', LOST: 'alert', QUARANTINED: 'warn',
    IN_MAINTENANCE: 'warn', DISPOSAL_PENDING: 'warn', DISPOSED: 'muted', RETIRED: 'muted'
  };
  const disposalStatusTone = {
    DRAFT: 'neutral', SUBMITTED: 'info', APPROVAL_PENDING: 'warn',
    APPROVED: 'ok', REJECTED: 'muted', DISPOSED: 'muted', CANCELLED: 'muted'
  };
  const maintenanceStatusTone = { OPEN: 'warn', IN_PROGRESS: 'info', AWAITING_PARTS: 'warn', COMPLETED: 'ok', CANCELLED: 'muted' };

  return `
    ${hero('Asset & Custody Center', 'Every custody movement is audit-backed. Disposal and write-off require approval. Controlled assets require elevated custody approval.')}
    <section class="status-strip">
      ${kpis.map((kpi) => `
        <div class="status-card compact ${kpi.tone || 'neutral'}">
          <span>${h(kpi.label)}</span>
          <strong>${h(kpi.value)}</strong>
        </div>
      `).join('')}
    </section>

    <section class="split">
      <div class="panel">
        <div class="section-head">
          <div><h2>Asset Registry</h2><p>Serialized, controlled, and standard assets tracked from receipt to disposal.</p></div>
          <div class="actions">
            <button class="btn-primary" data-action="register-asset" type="button">Register Asset</button>
          </div>
        </div>
        ${table(assets, ['Asset', 'Type', 'Category', 'Serial', 'Status', 'Custodian'], (row) => `
          <tr>
            <td><strong>${h(row.asset_no)}</strong><div class="muted">${h(row.name)}</div></td>
            <td>${badge(row.asset_type || 'STANDARD', row.controlled ? 'alert' : 'neutral')}</td>
            <td>${h(row.category || '—')}</td>
            <td class="muted">${h(row.serial_number || '—')}</td>
            <td>${badge(row.status, statusTone[row.status] || 'neutral')}</td>
            <td>${h(row.custodian_name || '—')}</td>
          </tr>
        `)}
      </div>
      <div class="panel">
        <div class="section-head">
          <div><h2>Disposal Approval Queue</h2><p>Disposal and write-off require supervisor or admin approval. Requester cannot approve their own request.</p></div>
        </div>
        ${table(disposals, ['Request', 'Asset', 'Method', 'Status', 'Reason'], (row) => `
          <tr>
            <td><strong>${h(row.disposal_no)}</strong></td>
            <td>${h(row.asset_name || row.asset_id)}</td>
            <td>${h(row.disposal_method || '—')}</td>
            <td>${badge(row.status, disposalStatusTone[row.status] || 'neutral')}</td>
            <td class="muted">${h((row.reason || '').slice(0, 60))}${(row.reason || '').length > 60 ? '…' : ''}</td>
          </tr>
        `)}
      </div>
    </section>

    <section class="split">
      <div class="panel">
        <div class="section-head">
          <div><h2>Maintenance Queue</h2><p>Asset maintenance cases. Closing a case returns the asset to AVAILABLE state.</p></div>
        </div>
        ${table(maintenance, ['Case', 'Asset', 'Type', 'Status', 'Opened'], (row) => `
          <tr>
            <td><strong>${h(row.case_no)}</strong></td>
            <td>${h(row.asset_name || row.asset_id)}<div class="muted">${h(row.asset_no || '')}</div></td>
            <td>${h(row.maintenance_type || '—')}</td>
            <td>${badge(row.status, maintenanceStatusTone[row.status] || 'neutral')}</td>
            <td>${h(row.created_at ? fmt(row.created_at) : '—')}</td>
          </tr>
        `)}
      </div>
      <div class="panel">
        <div class="section-head">
          <div><h2>Custody Posture</h2><p>Live custody state across the asset fleet. Controlled and high-value assets are tracked separately.</p></div>
        </div>
        <div class="metric-grid">
          <div class="metric"><span>Available</span><strong>${h(summary.available ?? 0)}</strong></div>
          <div class="metric"><span>Assigned</span><strong>${h(summary.assigned ?? 0)}</strong></div>
          <div class="metric"><span>In Transfer</span><strong>${h(summary.in_transfer ?? 0)}</strong></div>
          <div class="metric"><span>Return Pending</span><strong>${h(summary.return_pending ?? 0)}</strong></div>
          <div class="metric"><span>Damaged</span><strong>${h(summary.damaged ?? 0)}</strong></div>
          <div class="metric"><span>Lost</span><strong>${h(summary.lost ?? 0)}</strong></div>
          <div class="metric"><span>Quarantined</span><strong>${h(summary.quarantined ?? 0)}</strong></div>
          <div class="metric"><span>In Maintenance</span><strong>${h(summary.in_maintenance ?? 0)}</strong></div>
          <div class="metric"><span>Disposal Pending</span><strong>${h(summary.disposal_pending ?? 0)}</strong></div>
          <div class="metric"><span>Disposed</span><strong>${h(summary.disposed ?? 0)}</strong></div>
          <div class="metric"><span>High-value Assigned</span><strong>${h(summary.high_value_assigned ?? 0)}</strong></div>
          <div class="metric"><span>Controlled Assigned</span><strong>${h(summary.controlled_assigned ?? 0)}</strong></div>
        </div>
        <div class="posture-notes">
          <p class="muted note">Disposal and write-off require human approval and an audit-backed posting event. Disposed assets cannot be reassigned.</p>
          <p class="muted note">Lost assets remain in LOST state until a formal custody review is conducted — they do not silently re-enter available stock.</p>
        </div>
      </div>
    </section>
  `;
}

function renderPage() {
  if (currentSurface() === 'platform') return platformPageBody();
  if (state.page === 'Command Center') return shellLanding();
  if (state.page === 'Inventory Control') return inventoryPage();
  if (state.page === 'Warehouse Workflows') return warehousePage();
  if (state.page === 'Receiving Center') return receivingPage();
  if (state.page === 'Internal Storefront') return requestsPage();
  if (state.page === 'Procurement & Purchasing') return procurementPage();
  if (state.page === 'Supplier Governance') return supplierGovernancePage();
  if (state.page === 'Contract Repository') return contractRepositoryPage();
  if (state.page === 'Budget Control') return budgetControlPage();
  if (state.page === 'Procure-to-Pay Intelligence') return procureToPayPage();
  if (state.page === 'FinanceSync Export Hub') return financePage();
  if (state.page === 'Integration Center') return integrationPage();
  if (state.page === 'Documents & Evidence Vault') return documentsPage();
  if (state.page === 'Audit Black Box') return auditPage();
  if (state.page === 'Barcode & Device Hub') return deviceopsPage();
  if (state.page === 'OfflineOps') return offlineSyncPage();
  if (state.page === 'Ask OpsTrax AI') return aiOpsPage();
  if (state.page === 'Compliance Center') return compliancePage();
  if (state.page === 'Admin') return adminPage();
  if (state.page === 'Worker-Safe Mode') return workerPage();
  if (state.page === 'Reports') return reportsPage();
  if (state.page === 'Inventory Optimization') return inventoryOptimizationPage();
  if (state.page === 'Asset & Custody Center') return assetCustodyPage();
  return modulePreviewPage(state.page);
}

function render() {
  const root = document.getElementById('app');
  if (!root) return;
  if (state.authRequired) {
    root.innerHTML = authPage();
    return;
  }
  if (currentSurface() === 'platform') {
    const normalizedPage = PLATFORM_PAGE_TITLES[state.platformPage] ? state.platformPage : platformPageFromPathname(typeof window !== 'undefined' ? window.location.pathname : '/platform/dashboard');
    if (normalizedPage !== state.platformPage) {
      state.platformPage = normalizedPage;
      if (typeof localStorage !== 'undefined') localStorage.setItem('opstrax.platform.page', state.platformPage);
    }
    root.innerHTML = `
      ${platformWorkspaceShell()}
    `;
    return;
  }
  const normalizedPage = normalizePage(state.page);
  if (normalizedPage !== state.page) {
    state.page = normalizedPage;
    if (typeof localStorage !== 'undefined') localStorage.setItem('opstrax.page', state.page);
  }
  root.innerHTML = `
    ${shellSidebar()}
    <main class="main">
      ${shellTopbar()}
      ${state.loading ? shellSkeleton() : state.error ? `<section class="panel empty-state error-state">${h(state.error)}</section>` : renderPage()}
    </main>
  `;
}

async function refresh() {
  await loadData();
}

if (typeof document !== 'undefined') {
  document.addEventListener('change', async (event) => {
    const { target } = event;
    if (!(target instanceof HTMLSelectElement || target instanceof HTMLInputElement)) return;
  });

  document.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLInputElement)) return;
    if (target.id === 'globalSearch') {
      state.search = target.value;
      if (typeof localStorage !== 'undefined') localStorage.setItem('opstrax.search', state.search);
      render();
      return;
    }
    if (target.id === 'inventoryFilter') {
      state.inventoryFilter = target.value;
      render();
    }
  });

  document.addEventListener('click', async (event) => {
    const focusNode = event.target.closest('[data-drawer-focus]');
    if (focusNode) {
      state.drawerFocus = {
        type: focusNode.dataset.drawerFocus || 'tenant',
        id: focusNode.dataset.drawerId || 'current'
      };
      state.drawerTab = 'Details';
      state.requestLineDraft = null;
      state.procurementLineDraft = null;
      state.p2pInvoiceLineDraft = null;
      if (state.drawerFocus.type === 'request') {
        await loadRequestDetail(state.drawerFocus.id);
      }
      if (state.drawerFocus.type === 'warehouse-task') {
        await loadWarehouseTaskDetail(state.drawerFocus.id);
      }
      if (['vendor', 'purchase-request', 'purchase-order'].includes(state.drawerFocus.type)) {
        await loadProcurementDetail(state.drawerFocus.type, state.drawerFocus.id);
      }
      if (['vendor-invoice', 'rfq-request', 'vendor-quote'].includes(state.drawerFocus.type)) {
        await loadProcureToPayDetail(state.drawerFocus.type, state.drawerFocus.id);
      }
      if (state.drawerFocus.type === 'evidence') {
        await loadEvidenceDetail(state.drawerFocus.id);
      }
      if (state.drawerFocus.type === 'receive-session') {
        await loadReceivingDetail(state.drawerFocus.id);
      }
      if (state.drawerFocus.type === 'report-run') {
        await loadReportDetail(state.drawerFocus.id);
      }
      if (['export-batch', 'integration-connection', 'integration-job'].includes(state.drawerFocus.type)) {
        await loadExportDetail(state.drawerFocus.type, state.drawerFocus.id);
      }
      render();
      return;
    }
    const complianceTabNode = event.target.closest('button[data-compliance-tab]');
    if (complianceTabNode) {
      state.complianceTab = complianceTabNode.dataset.complianceTab || 'Dashboard';
      render();
      return;
    }
    const tabNode = event.target.closest('button[data-drawer-tab]');
    if (tabNode) {
      state.drawerTab = tabNode.dataset.drawerTab || 'Details';
      render();
      return;
    }
    const button = event.target.closest('button[data-page],button[data-action]');
    if (!button) return;
    const page = button.dataset.page;
    const action = button.dataset.action;
    if (page) {
      setPage(page);
      return;
    }
    if (action === 'refresh') {
      await refresh();
      return;
    }
    if (action === 'logout') {
      await fetch('/auth/logout', { method: 'POST' });
      window.location.reload();
      return;
    }
  if (action === 'demo-login') {
      try {
        await api('/api/dev/demo-login', {
          method: 'POST',
          body: {}
        });
        state.authRequired = false;
        state.error = '';
        await loadData();
      } catch (error) {
        state.error = error.message || 'Unable to enter workspace.';
        render();
      }
      return;
    }
    if (action === 'platform-demo-login') {
      try {
        await api('/api/platform/dev/demo-login', {
          method: 'POST',
          body: {}
        });
        state.authRequired = false;
        state.error = '';
        await loadPlatformData();
      } catch (error) {
        state.error = error.message || 'Unable to enter platform workspace.';
        render();
      }
      return;
    }
    if (action === 'platform-logout') {
      try {
        await api('/api/platform/logout', { method: 'POST', body: {} });
      } finally {
        window.location.href = '/platform/login';
      }
      return;
    }
    if (action === 'clear-request-line') {
      state.requestLineDraft = null;
      render();
      return;
    }
    if (action === 'clear-procurement-line') {
      state.procurementLineDraft = null;
      render();
      return;
    }
    if (action === 'clear-p2p-invoice-line') {
      state.p2pInvoiceLineDraft = null;
      render();
      return;
    }
    if (action === 'edit-request-line') {
      state.requestLineDraft = {
        requestId: state.drawerFocus?.id,
        lineId: button.dataset.lineId || '',
        itemId: button.dataset.itemId || '',
        qty: Number(button.dataset.qty || 1)
      };
      render();
      return;
      }
      if (action === 'edit-p2p-invoice-line') {
        state.p2pInvoiceLineDraft = {
          requestId: state.drawerFocus?.id,
          lineId: button.dataset.lineId || '',
          itemId: button.dataset.itemId || '',
          purchaseOrderLineId: button.dataset.purchaseOrderLineId || '',
          description: button.dataset.description || '',
          qty: Number(button.dataset.qty || 1),
          unitPrice: Number(button.dataset.unitPrice || 0)
        };
        render();
        return;
      }
      if (action === 'edit-procurement-line') {
        state.procurementLineDraft = {
          requestId: state.drawerFocus?.id,
          lineId: button.dataset.lineId || '',
          itemId: button.dataset.itemId || '',
          description: button.dataset.description || '',
          qty: Number(button.dataset.qty || 1),
          unitPrice: Number(button.dataset.unitPrice || 0)
        };
        render();
        return;
      }
      if (action === 'delete-procurement-line') {
        const requestId = state.drawerFocus?.id;
        await api(`/api/procurement/purchase-requests/${requestId}/lines/${button.dataset.lineId}`, { method: 'DELETE', body: {} });
        state.procurementLineDraft = null;
        toast('Purchase request line deleted.');
        await refreshWithProcurementDetail('purchase-request', requestId);
        return;
      }
      if (action === 'delete-p2p-invoice-line') {
        const invoiceId = state.drawerFocus?.id;
        await api(`/api/procure-to-pay/vendor-invoices/${invoiceId}/lines/${button.dataset.lineId}`, { method: 'DELETE', body: {} });
        state.p2pInvoiceLineDraft = null;
        toast('Invoice line deleted.');
        await refreshWithProcureToPayDetail('vendor-invoice', invoiceId);
        return;
      }
    if (action === 'delete-request-line') {
      const requestId = state.drawerFocus?.id;
      await api(`/api/requests/${requestId}/lines/${button.dataset.lineId}`, { method: 'DELETE', body: {} });
      state.requestLineDraft = null;
      toast('Request line deleted.');
      await refreshWithRequestDetail(requestId);
      return;
    }
    if (action === 'platform-create-support-session') {
      const form = button.closest('section, .panel, .workspace-stage') || document;
      const tenantId = form.querySelector?.('[data-platform-support-tenant]')?.value || state.platformTenantId || '';
      const sessionType = form.querySelector?.('[data-platform-support-type]')?.value || 'ADVISORY';
      const summary = form.querySelector?.('[data-platform-support-summary]')?.value || 'Support review session';
      const reason = form.querySelector?.('[data-platform-support-reason]')?.value || 'Review tenant readiness';
      try {
        await api('/api/platform/support-sessions', {
          method: 'POST',
          body: { tenantId, sessionType, summary, reason }
        });
        toast('Support session created.');
        await loadPlatformData();
        render();
      } catch (error) {
        state.error = error.message || 'Unable to create support session.';
        render();
      }
      return;
    }
    if (action === 'platform-end-support-session') {
      const sessionId = button.dataset.id || '';
      if (!sessionId) return;
      const status = prompt('End status (EXPIRED, REVOKED, DENIED)', 'EXPIRED');
      if (!status) return;
      const reason = prompt('Reason for ending the session', 'Review complete');
      if (!reason) return;
      const summary = prompt('Session summary', 'Support session closed') || 'Support session closed';
      try {
        await api(`/api/platform/support-sessions/${sessionId}/end`, {
          method: 'POST',
          body: { status, reason, summary }
        });
        toast('Support session updated.');
        await loadPlatformData();
        render();
      } catch (error) {
        state.error = error.message || 'Unable to end support session.';
        render();
      }
      return;
    }
    if (action === 'platform-suspend-tenant') {
      const tenantId = state.platformTenantId || selectedPlatformTenant()?.id || '';
      if (!tenantId) return;
      const reason = prompt('Reason for suspension', 'Compliance or billing issue');
      if (!reason) return;
      await api(`/api/platform/tenants/${tenantId}/suspend`, {
        method: 'POST',
        body: { reason }
      });
      toast('Workspace suspended.');
      await loadPlatformData();
      render();
      return;
    }
    if (action === 'platform-reactivate-tenant') {
      const tenantId = state.platformTenantId || selectedPlatformTenant()?.id || '';
      if (!tenantId) return;
      const reason = prompt('Reason for reactivation', 'Issue resolved');
      if (!reason) return;
      await api(`/api/platform/tenants/${tenantId}/reactivate`, {
        method: 'POST',
        body: { reason }
      });
      toast('Workspace reactivated.');
      await loadPlatformData();
      render();
      return;
    }
    if (action === 'platform-view-tenant') {
      const tenantId = button.dataset.tenantId || button.closest('[data-platform-tenant]')?.dataset.platformTenant || '';
      if (!tenantId) return;
      state.surface = 'platform';
      state.platformTenantId = tenantId;
      state.platformPage = 'Tenant Detail';
      state.drawerTab = 'Details';
      if (typeof localStorage !== 'undefined') localStorage.setItem('opstrax.platform.page', state.platformPage);
      if (typeof history !== 'undefined') history.pushState({}, '', `/platform/tenants/${tenantId}`);
      await loadPlatformData();
      render();
      return;
    }
    try {
      if (action === 'create-vendor') {
        await api('/api/procurement/vendors', { method: 'POST', body: {
          name: button.dataset.name || '',
          code: button.dataset.code || '',
          status: button.dataset.status || 'ACTIVE',
          contactName: button.dataset.contactName || '',
          email: button.dataset.email || '',
          phone: button.dataset.phone || '',
          riskScore: Number(button.dataset.riskScore || 0)
        } });
        toast('Vendor created.');
        await refreshWithProcurementDetail('vendor', state.drawerFocus?.id);
        return;
      }
      if (action === 'procure-create-po') {
        const created = await api(`/api/procurement/purchase-orders/from-purchase-request/${button.dataset.id}`, { method: 'POST', body: {} });
        toast('Purchase order created.');
        await loadData();
        if (created?.purchaseOrder?.id) {
          state.drawerFocus = { type: 'purchase-order', id: created.purchaseOrder.id };
          await loadProcurementDetail('purchase-order', created.purchaseOrder.id);
        }
        render();
        return;
      }
      if (action === 'update-vendor') {
        await api(`/api/procurement/vendors/${button.dataset.id}`, { method: 'PATCH', body: {
          status: button.dataset.status || undefined,
          riskScore: button.dataset.riskScore ? Number(button.dataset.riskScore) : undefined,
          contactName: button.dataset.contactName || undefined,
          email: button.dataset.email || undefined,
          phone: button.dataset.phone || undefined
        } });
        toast('Vendor updated.');
        await refreshWithProcurementDetail('vendor', button.dataset.id);
        return;
      }
      if (action === 'procure-submit-request') {
        await api(`/api/procurement/purchase-requests/${button.dataset.id}/submit`, { method: 'POST', body: {} });
        toast('Purchase request submitted.');
        await refreshWithProcurementDetail('purchase-request', button.dataset.id);
        return;
      }
      if (action === 'procure-approve-request') {
        await api(`/api/procurement/purchase-requests/${button.dataset.id}/approve`, { method: 'POST', body: {} });
        toast('Purchase request approved.');
        await refreshWithProcurementDetail('purchase-request', button.dataset.id);
        return;
      }
      if (action === 'procure-reject-request') {
        await api(`/api/procurement/purchase-requests/${button.dataset.id}/reject`, { method: 'POST', body: { reason: button.dataset.reason || 'Rejected from drawer' } });
        toast('Purchase request rejected.');
        await refreshWithProcurementDetail('purchase-request', button.dataset.id);
        return;
      }
      if (action === 'procure-cancel-request') {
        await api(`/api/procurement/purchase-requests/${button.dataset.id}/cancel`, { method: 'POST', body: { reason: button.dataset.reason || 'Cancelled from drawer' } });
        toast('Purchase request cancelled.');
        await refreshWithProcurementDetail('purchase-request', button.dataset.id);
        return;
      }
      if (action === 'procure-approve-po') {
        await api(`/api/procurement/purchase-orders/${button.dataset.id}/approve`, { method: 'POST', body: {} });
        toast('Purchase order approved.');
        await refreshWithProcurementDetail('purchase-order', button.dataset.id);
        return;
      }
      if (action === 'procure-issue-po') {
        await api(`/api/procurement/purchase-orders/${button.dataset.id}/issue`, { method: 'POST', body: {} });
        toast('Purchase order issued.');
        await refreshWithProcurementDetail('purchase-order', button.dataset.id);
        return;
      }
      if (action === 'procure-cancel-po') {
        await api(`/api/procurement/purchase-orders/${button.dataset.id}/cancel`, { method: 'POST', body: { reason: button.dataset.reason || 'Cancelled from drawer' } });
        toast('Purchase order cancelled.');
        await refreshWithProcurementDetail('purchase-order', button.dataset.id);
        return;
      }
      if (action === 'run-report') {
        const reportKey = button.dataset.reportKey || '';
        const format = button.dataset.format || 'CSV';
        const result = await api('/api/reports/runs', { method: 'POST', body: { reportKey, format } });
        toast('Report run completed.');
        state.drawerFocus = { type: 'report-run', id: result.run.id };
        state.drawerOpen = true;
        await loadReportDetail(result.run.id);
        render();
        return;
      }
      if (action === 'cancel-report-run') {
        await api(`/api/reports/runs/${button.dataset.id}/cancel`, { method: 'POST', body: { reason: 'Cancelled from report drawer' } });
        toast('Report run cancelled.');
        await refreshWithReportDetail(button.dataset.id);
        return;
      }
      if (action === 'download-report-csv') {
        const response = await fetch(`/api/reports/runs/${button.dataset.id}/export.csv`, { credentials: 'include' });
        if (!response.ok) throw new Error(`CSV export failed (${response.status})`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${button.dataset.id}.csv`;
        link.click();
        URL.revokeObjectURL(url);
        toast('CSV export downloaded.');
        await refreshWithReportDetail(button.dataset.id);
        return;
      }
      if (action === 'download-report-pdf') {
        const response = await fetch(`/api/reports/runs/${button.dataset.id}/export.pdf`, { credentials: 'include' });
        if (!response.ok) throw new Error(`PDF export failed (${response.status})`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report-${button.dataset.id}.pdf`;
        link.click();
        URL.revokeObjectURL(url);
        toast('PDF export downloaded.');
        await refreshWithReportDetail(button.dataset.id);
        return;
      }
      if (action === 'p2p-upload-invoice') {
        await api(`/api/procure-to-pay/vendor-invoices/${button.dataset.id}/upload`, { method: 'POST', body: { reason: 'Local workspace upload' } });
        toast('Invoice marked uploaded.');
        await refreshWithProcureToPayDetail('vendor-invoice', button.dataset.id);
        return;
      }
      if (action === 'p2p-extract-invoice') {
        await api(`/api/procure-to-pay/vendor-invoices/${button.dataset.id}/extract`, { method: 'POST', body: {} });
        toast('Invoice extracted.');
        await refreshWithProcureToPayDetail('vendor-invoice', button.dataset.id);
        return;
      }
      if (action === 'p2p-match-invoice') {
        await api(`/api/procure-to-pay/vendor-invoices/${button.dataset.id}/match`, { method: 'POST', body: {} });
        toast('Invoice matched.');
        await refreshWithProcureToPayDetail('vendor-invoice', button.dataset.id);
        return;
      }
      if (action === 'p2p-waive-invoice-exception') {
        await api(`/api/procure-to-pay/vendor-invoices/${button.dataset.id}/exceptions/${button.dataset.exceptionId}/waive`, { method: 'POST', body: { reason: 'Waived from invoice drawer' } });
        toast('Invoice exception waived.');
        await refreshWithProcureToPayDetail('vendor-invoice', button.dataset.id);
        return;
      }
      if (action === 'p2p-approve-invoice') {
        await api(`/api/procure-to-pay/vendor-invoices/${button.dataset.id}/approve`, { method: 'POST', body: {} });
        toast('Invoice approved.');
        await refreshWithProcureToPayDetail('vendor-invoice', button.dataset.id);
        return;
      }
      if (action === 'p2p-reject-invoice') {
        await api(`/api/procure-to-pay/vendor-invoices/${button.dataset.id}/reject`, { method: 'POST', body: { reason: button.dataset.reason || 'Rejected from invoice drawer' } });
        toast('Invoice rejected.');
        await refreshWithProcureToPayDetail('vendor-invoice', button.dataset.id);
        return;
      }
      if (action === 'p2p-cancel-invoice') {
        await api(`/api/procure-to-pay/vendor-invoices/${button.dataset.id}/cancel`, { method: 'POST', body: { reason: 'Cancelled from invoice drawer' } });
        toast('Invoice cancelled.');
        await refreshWithProcureToPayDetail('vendor-invoice', button.dataset.id);
        return;
      }
      if (action === 'p2p-mark-export-ready') {
        await api(`/api/procure-to-pay/vendor-invoices/${button.dataset.id}/export-ready`, { method: 'POST', body: {} });
        toast('Invoice marked export-ready.');
        await refreshWithProcureToPayDetail('vendor-invoice', button.dataset.id);
        return;
      }
      if (action === 'p2p-export-invoice') {
        await api(`/api/procure-to-pay/vendor-invoices/${button.dataset.id}/export`, { method: 'POST', body: {} });
        toast('Invoice exported.');
        await refreshWithProcureToPayDetail('vendor-invoice', button.dataset.id);
        return;
      }
      if (action === 'p2p-send-rfq') {
        await api(`/api/procure-to-pay/rfqs/${button.dataset.id}/send`, { method: 'POST', body: {} });
        toast('RFQ sent.');
        await refreshWithProcureToPayDetail('rfq-request', button.dataset.id);
        return;
      }
      if (action === 'p2p-evaluate-rfq') {
        await api(`/api/procure-to-pay/rfqs/${button.dataset.id}/evaluate`, { method: 'POST', body: {} });
        toast('RFQ evaluated.');
        await refreshWithProcureToPayDetail('rfq-request', button.dataset.id);
        return;
      }
      if (action === 'p2p-award-rfq') {
        await api(`/api/procure-to-pay/rfqs/${button.dataset.id}/award`, { method: 'POST', body: { quoteId: button.dataset.quoteId || '' } });
        toast('RFQ awarded.');
        await refreshWithProcureToPayDetail('rfq-request', button.dataset.id);
        return;
      }
      if (action === 'p2p-cancel-rfq') {
        await api(`/api/procure-to-pay/rfqs/${button.dataset.id}/cancel`, { method: 'POST', body: { reason: 'Cancelled from RFQ drawer' } });
        toast('RFQ cancelled.');
        await refreshWithProcureToPayDetail('rfq-request', button.dataset.id);
        return;
      }
      if (action === 'p2p-submit-quote') {
        await api(`/api/procure-to-pay/vendor-quotes/${button.dataset.id}/submit`, { method: 'POST', body: {} });
        toast('Quote submitted.');
        await refreshWithProcureToPayDetail('vendor-quote', button.dataset.id);
        return;
      }
      if (action === 'p2p-shortlist-quote') {
        await api(`/api/procure-to-pay/vendor-quotes/${button.dataset.id}/shortlist`, { method: 'POST', body: {} });
        toast('Quote shortlisted.');
        await refreshWithProcureToPayDetail('vendor-quote', button.dataset.id);
        return;
      }
      if (action === 'p2p-award-quote') {
        await api(`/api/procure-to-pay/vendor-quotes/${button.dataset.id}/award`, { method: 'POST', body: {} });
        toast('Quote awarded.');
        await refreshWithProcureToPayDetail('vendor-quote', button.dataset.id);
        return;
      }
      if (action === 'p2p-reject-quote') {
        await api(`/api/procure-to-pay/vendor-quotes/${button.dataset.id}/reject`, { method: 'POST', body: { reason: button.dataset.reason || 'Rejected from quote drawer' } });
        toast('Quote rejected.');
        await refreshWithProcureToPayDetail('vendor-quote', button.dataset.id);
        return;
      }
      if (action === 'p2p-expire-quote') {
        await api(`/api/procure-to-pay/vendor-quotes/${button.dataset.id}/expire`, { method: 'POST', body: {} });
        toast('Quote expired.');
        await refreshWithProcureToPayDetail('vendor-quote', button.dataset.id);
        return;
      }
      if (action === 'validate-export-batch') {
        await api(`/api/exports/batches/${button.dataset.id}/validate`, { method: 'POST', body: {} });
        toast('Export batch validated.');
        await refreshWithExportDetail('export-batch', button.dataset.id);
        return;
      }
      if (action === 'approve-export-batch') {
        await api(`/api/exports/batches/${button.dataset.id}/approve`, { method: 'POST', body: { note: 'Approved from shell drawer' } });
        toast('Export batch approved.');
        await refreshWithExportDetail('export-batch', button.dataset.id);
        return;
      }
      if (action === 'generate-export-batch') {
        await api(`/api/exports/batches/${button.dataset.id}/generate`, { method: 'POST', body: {} });
        toast('Export payload generated.');
        await refreshWithExportDetail('export-batch', button.dataset.id);
        return;
      }
      if (action === 'dispatch-export-batch') {
        await api(`/api/exports/batches/${button.dataset.id}/dispatch`, {
          method: 'POST',
          body: { destination: 'Finance ERP', connectionId: button.dataset.connectionId || '' }
        });
        toast('Export dispatch queued locally.');
        await refreshWithExportDetail('export-batch', button.dataset.id);
        return;
      }
      if (action === 'cancel-export-batch') {
        await api(`/api/exports/batches/${button.dataset.id}/cancel`, { method: 'POST', body: { reason: 'Cancelled from drawer' } });
        toast('Export batch cancelled.');
        await refreshWithExportDetail('export-batch', button.dataset.id);
        return;
      }
      if (action === 'retry-integration-job') {
        await api(`/api/integrations/jobs/${button.dataset.id}/retry`, { method: 'POST', body: {} });
        toast('Integration job retry queued.');
        await refreshWithExportDetail('integration-job', button.dataset.id);
        return;
      }
      if (action === 'cancel-integration-job') {
        await api(`/api/integrations/jobs/${button.dataset.id}/cancel`, { method: 'POST', body: {} });
        toast('Integration job cancelled.');
        await refreshWithExportDetail('integration-job', button.dataset.id);
        return;
      }
      if (action === 'verify-evidence') {
        await api(`/api/evidence/${button.dataset.id}/verify`, {
          method: 'PATCH',
          body: { decision: button.dataset.decision || 'VERIFIED', note: button.dataset.decision === 'REJECTED' ? 'Rejected from drawer' : 'Verified from drawer' }
        });
        toast(button.dataset.decision === 'REJECTED' ? 'Evidence rejected.' : 'Evidence verified.');
        await refreshWithEvidenceDetail(button.dataset.id);
        return;
      }
      if (action === 'archive-evidence') {
        await api(`/api/evidence/${button.dataset.id}/archive`, { method: 'PATCH', body: { note: 'Archived from drawer' } });
        toast('Evidence archived.');
        await refreshWithEvidenceDetail(button.dataset.id);
        return;
      }
      if (action === 'create-receive-session') {
        const created = await api(`/api/receiving/sessions/from-purchase-order/${button.dataset.id}`, { method: 'POST', body: {} });
        toast('Receive session created.');
        await loadData();
        if (created?.session?.id) {
          state.drawerFocus = { type: 'receive-session', id: created.session.id };
          await loadReceivingDetail(created.session.id);
        }
        render();
        return;
      }
      if (action === 'start-receive-session') {
        await api(`/api/receiving/sessions/${button.dataset.id}/start`, { method: 'POST', body: { note: 'Started from receiving center' } });
        toast('Receive session started.');
        await refreshWithReceivingDetail(button.dataset.id);
        return;
      }
      if (action === 'post-receive-session') {
        await api(`/api/receiving/sessions/${button.dataset.id}/post`, { method: 'POST', body: { note: 'Posted from receiving center' } });
        toast('Receive session posted.');
        await refreshWithReceivingDetail(button.dataset.id);
        return;
      }
      if (action === 'cancel-receive-session') {
        await api(`/api/receiving/sessions/${button.dataset.id}/cancel`, { method: 'POST', body: { reason: 'Cancelled from receiving center' } });
        toast('Receive session cancelled.');
        await refreshWithReceivingDetail(button.dataset.id);
        return;
      }
      if (action === 'create-warehouse-task') {
        const created = await api(`/api/warehouse/tasks/from-request/${button.dataset.id}`, { method: 'POST', body: {} });
        toast('Warehouse task created.');
        await loadData();
        if (created?.task?.id) {
          state.drawerFocus = { type: 'warehouse-task', id: created.task.id };
          await loadWarehouseTaskDetail(created.task.id);
        }
        render();
        return;
      }
      if (action === 'start-warehouse-task') {
        await api(`/api/warehouse/tasks/${button.dataset.id}/start`, { method: 'POST', body: {} });
        toast('Warehouse task started.');
        await refreshWithWarehouseTaskDetail(button.dataset.id);
        return;
      }
      if (action === 'pick-warehouse-task') {
        await api(`/api/warehouse/tasks/${button.dataset.id}/pick`, {
          method: 'POST',
          body: {
            lineId: button.dataset.lineId,
            qty: Number(button.dataset.lineQty || 0),
            binId: button.dataset.binId || ''
          }
        });
        toast('Warehouse task line picked.');
        await refreshWithWarehouseTaskDetail(button.dataset.id);
        return;
      }
      if (action === 'issue-warehouse-task') {
        await api(`/api/warehouse/tasks/${button.dataset.id}/issue`, {
          method: 'POST',
          body: {
            lineId: button.dataset.lineId,
            qty: Number(button.dataset.lineQty || 0),
            binId: button.dataset.binId || ''
          }
        });
        toast('Warehouse task line issued.');
        await refreshWithWarehouseTaskDetail(button.dataset.id);
        return;
      }
      if (action === 'close-warehouse-task') {
        await api(`/api/warehouse/tasks/${button.dataset.id}/close`, { method: 'POST', body: { reason: 'Closed from warehouse drawer' } });
        toast('Warehouse task closed.');
        await refreshWithWarehouseTaskDetail(button.dataset.id);
        return;
      }
      if (action === 'cancel-warehouse-task') {
        await api(`/api/warehouse/tasks/${button.dataset.id}/cancel`, { method: 'POST', body: { reason: 'Cancelled from warehouse drawer' } });
        toast('Warehouse task cancelled.');
        await refreshWithWarehouseTaskDetail(button.dataset.id);
        return;
      }
      if (action === 'open-request-from-task') {
        setPage('Internal Storefront');
        state.drawerFocus = { type: 'request', id: button.dataset.id };
        await loadRequestDetail(button.dataset.id);
        render();
        return;
      }
      if (action === 'approve-request') {
        await api(`/api/requests/${button.dataset.id}/approve`, { method: 'POST', body: {} });
        toast('Internal request approved.');
        await refreshWithRequestDetail(button.dataset.id);
      }
      if (action === 'submit-request') {
        await api(`/api/requests/${button.dataset.id}/submit`, { method: 'POST', body: {} });
        toast('Internal request submitted.');
        await refreshWithRequestDetail(button.dataset.id);
      }
      if (action === 'cancel-request') {
        await api(`/api/requests/${button.dataset.id}/cancel`, {
          method: 'POST',
          body: { reason: 'Cancelled from request queue' }
        });
        toast('Internal request cancelled.');
        await refreshWithRequestDetail(button.dataset.id);
      }
      if (action === 'approve-purchase') {
        await api(`/api/purchase-requests/${button.dataset.id}/approve`, { method: 'POST', body: {} });
        toast('Purchase request approved.');
        await refresh();
      }
      if (action === 'review-sync') {
        await api(`/api/sync-batches/${button.dataset.id}/review`, {
          method: 'POST',
          body: { decision: button.dataset.decision || 'APPROVE' }
        });
        toast(`Sync batch ${button.dataset.decision === 'REJECT' ? 'rejected' : 'approved and posted'}.`);
        await refresh();
      }
      if (action === 'validate-export') {
        await api('/api/exports/validate', { method: 'POST', body: {} });
        toast('FinanceSync validation completed.');
        await refresh();
      }
      if (action === 'generate-export') {
        await api('/api/exports/generate', { method: 'POST', body: {} });
        toast('Clean export generated.');
        await refresh();
      }
      if (action === 'send-transfer') {
        await api(`/api/exports/${button.dataset.id}/dispatch`, {
          method: 'POST',
          body: { destination: button.dataset.destination || 'Finance ERP' }
        });
        toast('Export transfer queued.');
        await refresh();
      }
      if (action === 'resolve-conflict') {
        await api(`/api/offline-conflicts/${button.dataset.id}/resolve`, {
          method: 'POST',
          body: {
            resolutionAction: button.dataset.resolution || 'RESOLVE',
            resolutionNote: button.dataset.resolution === 'IGNORE' ? 'Ignored after supervisor review' : 'Resolved after supervisor review'
          }
        });
        toast(`Conflict ${button.dataset.resolution === 'IGNORE' ? 'ignored' : 'resolved'}.`);
        await refresh();
      }
      if (action === 'trust-device') {
        await api(`/api/devices/${button.dataset.id}/trust`, { method: 'POST', body: {} });
        toast('Device trusted.');
        await refresh();
      }
      if (action === 'suspend-device') {
        const reason = window.prompt('Suspension reason (required):');
        if (!reason) return;
        await api(`/api/devices/${button.dataset.id}/suspend`, { method: 'POST', body: { reason } });
        toast('Device suspended.');
        await refresh();
      }
      if (action === 'revoke-device') {
        const reason = window.prompt('Revocation reason (required). This is irreversible:');
        if (!reason) return;
        const confirmed = window.confirm(`Permanently revoke this device? This cannot be undone.`);
        if (!confirmed) return;
        await api(`/api/devices/${button.dataset.id}/revoke`, { method: 'POST', body: { reason } });
        toast('Device revoked permanently.');
        await refresh();
      }
      if (action === 'validate-scan') {
        const rawValue = document.getElementById('sandboxScanInput')?.value?.trim();
        if (!rawValue) { toast('Enter a scan value first.'); return; }
        const result = await api('/api/scan/validate', { method: 'POST', body: { rawValue } });
        const out = document.getElementById('sandboxScanResult');
        if (out) out.textContent = JSON.stringify(result, null, 2);
        toast(`Scan resolved: ${result?.scanType || 'unknown'}`);
      }
      if (action === 'validate-offline-batch') {
        await api(`/api/offline-batches/${button.dataset.id}/validate`, { method: 'POST', body: {} });
        toast('Batch validation started.');
        await refresh();
      }
      if (action === 'replay-offline-batch') {
        await api(`/api/offline-batches/${button.dataset.id}/replay`, { method: 'POST', body: {} });
        toast('Batch replay started. Server is replaying each action.');
        await refresh();
      }
      if (action === 'approve-offline-batch') {
        const notes = window.prompt('Approval notes (optional):') || '';
        await api(`/api/offline-batches/${button.dataset.id}/approve`, { method: 'POST', body: { notes } });
        toast('Batch approved. All staged tasks will be eligible for replay.');
        await refresh();
      }
      if (action === 'reject-offline-batch') {
        const reason = window.prompt('Rejection reason (required):');
        if (!reason) return;
        await api(`/api/offline-batches/${button.dataset.id}/reject`, { method: 'POST', body: { reason } });
        toast('Batch rejected.');
        await refresh();
      }
      if (action === 'approve-sync-conflict') {
        const notes = window.prompt('Approval notes (optional):') || '';
        await api(`/api/offline-conflicts/${button.dataset.id}/approve`, { method: 'POST', body: { notes } });
        toast('Conflict approved. Task staged for replay.');
        await refresh();
      }
      if (action === 'reject-sync-conflict') {
        const reason = window.prompt('Rejection reason (optional):') || '';
        await api(`/api/offline-conflicts/${button.dataset.id}/reject`, { method: 'POST', body: { reason } });
        toast('Conflict rejected. Task will not be replayed.');
        await refresh();
      }
      if (action === 'generate-ai-recommendations') {
        const result = await api('/api/ai/recommendations/generate', { method: 'POST', body: {} });
        toast(`Generated ${result?.generated ?? 0} recommendation(s). Label: ${result?.label ?? 'SYSTEM_GENERATED'}.`);
        await refresh();
      }
      if (action === 'dismiss-ai-recommendation') {
        const note = window.prompt('Dismiss reason (optional):') || '';
        await api(`/api/ai/recommendations/${button.dataset.id}/dismiss`, { method: 'PATCH', body: { note } });
        toast('Recommendation dismissed.');
        await refresh();
      }
      if (action === 'approve-ai-placeholder') {
        const notes = window.prompt('Acknowledgement notes (optional). Note: this records intent only — no domain action is executed:') || '';
        const result = await api(`/api/ai/recommendations/${button.dataset.id}/approve-placeholder`, { method: 'POST', body: { notes } });
        toast(`Acknowledged. ${result?.notice ?? 'No domain action was executed.'}`);
        await refresh();
      }
      if (action === 'copilot-query') {
        const input = document.getElementById('copilotQueryInput');
        const query = input?.value?.trim();
        if (!query) { toast('Enter a query first.'); return; }
        const result = await api('/api/ai/copilot/query', { method: 'POST', body: { query } });
        const out = document.getElementById('copilotResult');
        if (out) {
          out.style.display = 'block';
          out.textContent = `[${result.responseType}] ${result.answer}\n\nProvider: ${result.providerStatus}\n${result.notice}`;
        }
        toast(`Copilot response received (${result.providerStatus}).`);
      }
    } catch (error) {
      toast(error.message);
    }
  });
  document.addEventListener('click', async (event) => {
    const tenantNode = event.target.closest('[data-platform-tenant]');
    if (!tenantNode) return;
    const tenantId = tenantNode.dataset.platformTenant || '';
    if (!tenantId) return;
    state.surface = 'platform';
    state.platformTenantId = tenantId;
    state.platformPage = 'Tenant Detail';
    state.drawerTab = 'Details';
    if (typeof localStorage !== 'undefined') localStorage.setItem('opstrax.platform.page', state.platformPage);
    if (typeof history !== 'undefined') history.pushState({}, '', `/platform/tenants/${tenantId}`);
    await loadPlatformData();
    render();
  });
  if (typeof window !== 'undefined') {
    window.addEventListener('popstate', async () => {
      if (currentSurface() === 'platform') {
        state.platformPage = platformPageFromPathname(window.location.pathname);
        state.platformTenantId = window.location.pathname.match(/^\/platform\/tenants\/([^/]+)/)?.[1] || state.platformTenantId || '';
        await loadPlatformData();
        render();
      } else {
        state.currentPage = typeof window !== 'undefined' ? pageFromPathname(window.location.pathname) : state.currentPage;
        await loadData();
        render();
      }
    });
  }

  document.addEventListener('submit', async (event) => {
    const form = event.target;
    if (!(form instanceof HTMLFormElement)) return;
    event.preventDefault();
    const fd = new FormData(form);
    try {
      if (form.id === 'requestForm') {
        const user = currentUser();
        const privileged = user && ['admin', 'supervisor'].includes(user.role_key);
        const body = {
          departmentId: privileged ? fd.get('departmentId') : user?.department_id,
          facilityId: privileged ? fd.get('facilityId') : user?.facility_id,
          priority: fd.get('priority'),
          purpose: fd.get('purpose'),
          lines: [
            {
              itemId: fd.get('itemId'),
              qty: Number(fd.get('qty') || 1)
            }
          ]
        };
        await api('/api/requests', { method: 'POST', body });
        form.reset();
        toast('Internal request draft saved.');
        await refresh();
      }
      if (form.id === 'requestDraftForm') {
        const requestId = fd.get('requestId');
        const body = {
          departmentId: fd.get('departmentId'),
          facilityId: fd.get('facilityId'),
          priority: fd.get('priority'),
          reason: fd.get('reason'),
          neededByDate: fd.get('neededByDate')
        };
        await api(`/api/requests/${requestId}`, { method: 'PATCH', body });
        toast('Request draft updated.');
        await refreshWithRequestDetail(String(requestId));
      }
      if (form.id === 'requestLineForm') {
        const requestId = String(fd.get('requestId') || '');
        const lineId = String(fd.get('lineId') || '');
        const body = {
          itemId: fd.get('itemId'),
          qty: Number(fd.get('qty') || 1)
        };
        if (lineId) {
          await api(`/api/requests/${requestId}/lines/${lineId}`, { method: 'PATCH', body });
          toast('Request line updated.');
        } else {
          await api(`/api/requests/${requestId}/lines`, { method: 'POST', body });
          toast('Request line added.');
        }
        state.requestLineDraft = null;
        await refreshWithRequestDetail(requestId);
      }
      if (form.id === 'requestRejectForm' || form.id === 'drawerRejectForm') {
        const requestId = String(fd.get('requestId') || '');
        const reason = String(fd.get('reason') || '').trim();
        await api(`/api/requests/${requestId}/reject`, { method: 'POST', body: { reason } });
        toast('Internal request rejected.');
        if (state.drawerFocus?.type === 'request' && state.drawerFocus.id === requestId) {
          state.requestLineDraft = null;
        }
        await refreshWithRequestDetail(requestId);
      }
      if (form.id === 'exportBatchForm') {
        await api('/api/exports/batches', {
          method: 'POST',
          body: {
            format: fd.get('format'),
            dateFrom: fd.get('dateFrom'),
            dateTo: fd.get('dateTo'),
            facilityId: fd.get('facilityId'),
            departmentId: fd.get('departmentId')
          }
        });
        toast('Export batch created.');
        await refresh();
      }
      if (form.id === 'integrationConnectionForm') {
        await api('/api/integrations/connections', {
          method: 'POST',
          body: {
            providerName: fd.get('providerName'),
            connectionType: fd.get('connectionType'),
            authMode: fd.get('authMode'),
            endpointLabel: fd.get('endpointLabel')
          }
        });
        toast('Integration connection created.');
        await refresh();
      }
      if (form.id === 'purchaseForm') {
        const body = {
          vendorName: fd.get('vendorName'),
          accountingCode: fd.get('accountingCode'),
          lines: [
            {
              itemId: fd.get('itemId'),
              description: fd.get('description'),
              qty: Number(fd.get('qty') || 1),
              unitPrice: Number(fd.get('unitPrice') || 0)
            }
          ]
        };
        await api('/api/purchase-requests', { method: 'POST', body });
        form.reset();
        toast('Purchase request drafted.');
        await refresh();
      }
      if (form.id === 'procurementVendorCreateForm') {
        const body = {
          name: fd.get('name'),
          code: fd.get('code'),
          status: fd.get('status'),
          riskScore: Number(fd.get('riskScore') || 0),
          contactName: fd.get('contactName'),
          email: fd.get('email'),
          phone: fd.get('phone')
        };
        await api('/api/procurement/vendors', { method: 'POST', body });
        form.reset();
        toast('Vendor created.');
        await refresh();
      }
      if (form.id === 'procurementVendorForm') {
        const vendorId = String(fd.get('vendorId') || '').trim();
        const body = {
          name: fd.get('name'),
          code: fd.get('code'),
          status: fd.get('status'),
          riskScore: Number(fd.get('riskScore') || 0),
          contactName: fd.get('contactName'),
          email: fd.get('email'),
          phone: fd.get('phone'),
          lastReviewedAt: fd.get('lastReviewedAt')
        };
        await api(`/api/procurement/vendors/${vendorId}`, { method: 'PATCH', body });
        toast('Vendor updated.');
        await refreshWithProcurementDetail('vendor', vendorId);
      }
      if (form.id === 'procurementContractForm') {
        const contractId = String(fd.get('contractId') || '').trim();
        const body = {
          contractNo: fd.get('contractNo'),
          title: fd.get('title'),
          status: fd.get('status'),
          effectiveDate: fd.get('effectiveDate'),
          expiryDate: fd.get('expiryDate'),
          pricingReference: fd.get('pricingReference')
        };
        await api(`/api/procurement/contracts/${contractId}`, { method: 'PATCH', body });
        toast('Contract updated.');
        await refreshWithProcurementDetail('supplier-contract', contractId);
      }
      if (form.id === 'procurementBudgetForm') {
        const budgetId = String(fd.get('budgetId') || '').trim();
        const body = {
          budgetAmount: Number(fd.get('budgetAmount') || 0),
          alertThresholdPct: Number(fd.get('alertThresholdPct') || 0),
          status: fd.get('status')
        };
        await api(`/api/procurement/budgets/${budgetId}`, { method: 'PATCH', body });
        toast('Budget updated.');
        await refreshWithProcurementDetail('department-budget', budgetId);
      }
      if (form.id === 'procurementWaiverForm') {
        const body = {
          waiverType: fd.get('waiverType'),
          entityType: fd.get('entityType'),
          entityId: fd.get('entityId'),
          reason: fd.get('reason'),
          expiresAt: fd.get('expiresAt')
        };
        await api('/api/procurement/waivers', { method: 'POST', body });
        form.reset();
        toast('Waiver approved.');
        await refresh();
      }
      if (form.id === 'procurementRequestForm') {
        const body = {
          vendorId: fd.get('vendorId'),
          accountingCode: fd.get('accountingCode'),
          departmentId: fd.get('departmentId'),
          facilityId: fd.get('facilityId'),
          lines: [
            {
              itemId: fd.get('itemId'),
              description: String(fd.get('description') || '').trim() || 'Procurement request line',
              qty: Number(fd.get('qty') || 1),
              unitPrice: Number(fd.get('unitPrice') || 0)
            }
          ]
        };
        await api('/api/procurement/purchase-requests', { method: 'POST', body });
        form.reset();
        toast('Purchase request drafted.');
        await refresh();
      }
      if (form.id === 'procurementRequestDraftForm') {
        const purchaseRequestId = String(fd.get('purchaseRequestId') || '').trim();
        const body = {
          vendorId: fd.get('vendorId'),
          accountingCode: fd.get('accountingCode'),
          departmentId: fd.get('departmentId'),
          facilityId: fd.get('facilityId')
        };
        await api(`/api/procurement/purchase-requests/${purchaseRequestId}`, { method: 'PATCH', body });
        toast('Purchase request draft updated.');
        await refreshWithProcurementDetail('purchase-request', purchaseRequestId);
      }
      if (form.id === 'procurementRequestLineForm') {
        const purchaseRequestId = String(fd.get('purchaseRequestId') || '').trim();
        const lineId = String(fd.get('lineId') || '').trim();
        const body = {
          itemId: fd.get('itemId'),
          description: fd.get('description'),
          qty: Number(fd.get('qty') || 1),
          unitPrice: Number(fd.get('unitPrice') || 0)
        };
        if (lineId) {
          await api(`/api/procurement/purchase-requests/${purchaseRequestId}/lines/${lineId}`, { method: 'PATCH', body });
          toast('Purchase request line updated.');
        } else {
          await api(`/api/procurement/purchase-requests/${purchaseRequestId}/lines`, { method: 'POST', body });
          toast('Purchase request line added.');
        }
        state.procurementLineDraft = null;
        await refreshWithProcurementDetail('purchase-request', purchaseRequestId);
      }
      if (form.id === 'procurementOrderForm') {
        const purchaseOrderId = String(fd.get('purchaseOrderId') || '').trim();
        await api(`/api/procurement/purchase-orders/${purchaseOrderId}`, { method: 'PATCH', body: { notes: fd.get('notes') } });
        toast('Purchase order updated.');
        await refreshWithProcurementDetail('purchase-order', purchaseOrderId);
      }
      if (form.id === 'p2pInvoiceHeaderForm') {
        const invoiceId = String(fd.get('invoiceId') || '').trim();
        const body = {
          invoiceNumber: fd.get('invoiceNumber'),
          vendorId: fd.get('vendorId'),
          departmentId: fd.get('departmentId'),
          facilityId: fd.get('facilityId'),
          notes: fd.get('notes')
        };
        await api(`/api/procure-to-pay/vendor-invoices/${invoiceId}`, { method: 'PATCH', body });
        toast('Invoice updated.');
        await refreshWithProcureToPayDetail('vendor-invoice', invoiceId);
      }
      if (form.id === 'p2pInvoiceLineForm') {
        const invoiceId = String(fd.get('invoiceId') || '').trim();
        const lineId = String(fd.get('lineId') || '').trim();
        const body = {
          itemId: fd.get('itemId') || null,
          purchaseOrderLineId: fd.get('purchaseOrderLineId') || null,
          description: fd.get('description'),
          qty: Number(fd.get('qty') || 1),
          unitPrice: Number(fd.get('unitPrice') || 0)
        };
        if (lineId) {
          await api(`/api/procure-to-pay/vendor-invoices/${invoiceId}/lines/${lineId}`, { method: 'PATCH', body });
          toast('Invoice line updated.');
        } else {
          await api(`/api/procure-to-pay/vendor-invoices/${invoiceId}/lines`, { method: 'POST', body });
          toast('Invoice line added.');
        }
        state.p2pInvoiceLineDraft = null;
        await refreshWithProcureToPayDetail('vendor-invoice', invoiceId);
      }
      if (form.id === 'evidenceLinkForm') {
        const evidenceId = String(fd.get('evidenceId') || '').trim();
        await api(`/api/evidence/${evidenceId}/link`, {
          method: 'POST',
          body: {
            entityType: fd.get('entityType'),
            entityId: fd.get('entityId')
          }
        });
        toast('Evidence linked.');
        await refreshWithEvidenceDetail(evidenceId);
      }
      if (form.id === 'receiveLineForm') {
        const sessionId = String(fd.get('sessionId') || '').trim();
        await api(`/api/receiving/sessions/${sessionId}/receive-line`, {
          method: 'POST',
          body: {
            lineId: fd.get('purchaseOrderLineId'),
            qtyReceived: Number(fd.get('qtyReceived') || 0),
            qtyDamaged: Number(fd.get('qtyDamaged') || 0),
            qtyShort: Number(fd.get('qtyShort') || 0),
            binId: fd.get('binId'),
            note: fd.get('note')
          }
        });
        toast('Receiving line captured.');
        await refreshWithReceivingDetail(sessionId);
      }
      if (form.id === 'receiveExceptionForm') {
        const sessionId = String(fd.get('sessionId') || '').trim();
        await api(`/api/receiving/sessions/${sessionId}/exception`, {
          method: 'POST',
          body: {
            reason: fd.get('reason')
          }
        });
        toast('Receiving exception recorded.');
        await refreshWithReceivingDetail(sessionId);
      }
      if (form.id === 'labelForm') {
        const body = {
          kind: fd.get('kind'),
          deviceId: fd.get('deviceId'),
          entityType: fd.get('entityType'),
          entityId: fd.get('entityId'),
          barcode: fd.get('barcode')
        };
        await api('/api/labels', { method: 'POST', body });
        toast('Label job queued.');
        await refresh();
      }
      if (form.id === 'documentForm') {
        const fileInput = form.querySelector('input[type="file"]');
        const file = fileInput?.files?.[0] || null;
        const contentBase64 = file ? await fileToBase64(file) : '';
        const body = {
          fileName: file?.name || `evidence-${Date.now()}.txt`,
          docType: fd.get('docType'),
          visibility: fd.get('visibility'),
          entityType: fd.get('entityType'),
          entityId: fd.get('entityId'),
          contentBase64,
          mimeType: file?.type || 'application/octet-stream'
        };
        await api('/api/evidence', { method: 'POST', body });
        form.reset();
        toast('Evidence uploaded.');
        await refresh();
      }
      if (form.id === 'inventoryItemForm') {
        const body = {
          sku: fd.get('sku'),
          name: fd.get('name'),
          categoryId: fd.get('categoryId'),
          unitOfMeasure: fd.get('unitOfMeasure'),
          itemType: fd.get('itemType'),
          status: fd.get('status'),
          controlled: fd.get('controlled'),
          supplier: fd.get('supplier'),
          minStock: Number(fd.get('minStock') || 1),
          maxStock: Number(fd.get('maxStock') || 1),
          reorderPoint: Number(fd.get('reorderPoint') || 1),
          lotRequired: fd.get('lotRequired'),
          serialRequired: fd.get('serialRequired'),
          expiryRequired: fd.get('expiryRequired'),
          description: fd.get('description')
        };
        const itemId = String(fd.get('itemId') || '').trim();
        if (itemId) {
          await api(`/api/inventory/items/${itemId}`, { method: 'PATCH', body });
          toast('Inventory item updated.');
        } else {
          await api('/api/inventory/items', { method: 'POST', body });
          toast('Inventory item created.');
        }
        await refresh();
      }
      if (form.id === 'stockAdjustmentForm') {
        const body = {
          itemId: fd.get('itemId') || selectedInventoryItemId(),
          binId: fd.get('binId'),
          quantityDelta: Number(fd.get('quantityDelta') || 0),
          evidenceDocumentId: fd.get('evidenceDocumentId'),
          reason: fd.get('reason'),
          referenceType: fd.get('referenceType'),
          referenceId: fd.get('referenceId'),
          lotNo: fd.get('lotNo'),
          serialNo: fd.get('serialNo'),
          expiryDate: fd.get('expiryDate'),
          statusNote: fd.get('statusNote')
        };
        await api('/api/inventory/adjustments', { method: 'POST', body });
        toast('Stock adjustment posted.');
        await refresh();
      }
    } catch (error) {
      toast(error.message);
    }
  });

  function selectedInventoryItemId() {
    return state.drawerFocus?.type === 'inventory-item' ? state.drawerFocus.id : '';
  }

  function fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = String(reader.result || '');
        resolve(result.includes('base64,') ? result.split('base64,')[1] : result);
      };
      reader.onerror = () => reject(new Error('Unable to read file'));
      reader.readAsDataURL(file);
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      state.page = 'Command Center';
      if (typeof localStorage !== 'undefined') localStorage.setItem('opstrax.page', state.page);
      render();
    }
  });

  window.addEventListener('load', () => {
    refresh();
  });
}
