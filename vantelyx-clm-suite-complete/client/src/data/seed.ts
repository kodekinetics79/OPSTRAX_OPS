import type { AppState, ClauseInsight, Contract, ContractDocument, Obligation, WorkflowStep } from '../types/domain';

const commonClauses: ClauseInsight[] = [
  {
    id: 'CL-001',
    name: 'Limitation of Liability',
    category: 'Legal',
    status: 'Needs Review',
    risk: 'High',
    position: 'Mutual liability cap at fees paid in prior 12 months; uncapped confidentiality, IP, fraud, and data breach carveouts.',
    fallback: 'Mutual cap at 2x annual fees with narrower carveouts subject to legal approval.',
    note: 'Counterparty proposed broad indirect damages exclusion and no data breach carveout.'
  },
  {
    id: 'CL-002',
    name: 'Auto-Renewal Notice',
    category: 'Commercial',
    status: 'Non-standard',
    risk: 'Medium',
    position: 'No auto-renewal unless renewal owner confirms in system; minimum 90-day notice window.',
    fallback: 'Auto-renewal allowed only when renewal alert and owner acknowledgment are configured.',
    note: 'Notice period is currently 45 days; playbook requires 90 days for enterprise agreements.'
  },
  {
    id: 'CL-003',
    name: 'Data Processing / Privacy',
    category: 'Privacy',
    status: 'Missing',
    risk: 'Critical',
    position: 'DPA required for systems processing personal, employee, customer, or regulated information.',
    fallback: 'Security/privacy review required before approval if DPA is omitted.',
    note: 'Agreement references customer data but does not attach a DPA.'
  }
];

function docs(contractId: string, base: string): ContractDocument[] {
  return [
    { id: `${contractId}-DOC-1`, contractId, name: `${base} Main Agreement.pdf`, type: 'Main Agreement', version: 'v1.0', status: 'Parsed', uploadedBy: 'Ayesha Malik', uploadedAt: '2026-05-24T14:20:00Z' },
    { id: `${contractId}-DOC-2`, contractId, name: `${base} Security Exhibit.docx`, type: 'Exhibit', version: 'v0.8', status: 'Reviewed', uploadedBy: 'Omar Reed', uploadedAt: '2026-05-25T10:45:00Z' }
  ];
}

const obligationsA: Obligation[] = [
  { id: 'OBL-1001', contractId: 'VCLM-2026-0001', title: 'Provide SOC 2 Type II report annually', owner: 'Security Ops', department: 'Information Security', dueDate: '2026-07-15', status: 'In Progress', priority: 'High', sourceClause: 'Security Exhibit', evidenceRequired: true },
  { id: 'OBL-1002', contractId: 'VCLM-2026-0001', title: 'Send renewal decision before notice deadline', owner: 'Procurement', department: 'Procurement', dueDate: '2026-08-01', status: 'Open', priority: 'Critical', sourceClause: 'Renewal Terms', evidenceRequired: false }
];

const obligationsB: Obligation[] = [
  { id: 'OBL-1003', contractId: 'VCLM-2026-0002', title: 'Verify cyber insurance certificate before execution', owner: 'Risk Team', department: 'Risk', dueDate: '2026-06-20', status: 'Open', priority: 'High', sourceClause: 'Insurance', evidenceRequired: true },
  { id: 'OBL-1004', contractId: 'VCLM-2026-0002', title: 'Confirm milestone acceptance criteria', owner: 'PMO', department: 'Operations', dueDate: '2026-06-12', status: 'Blocked', priority: 'Medium', sourceClause: 'SOW', evidenceRequired: false }
];

const contracts: Contract[] = [
  {
    id: 'VCLM-2026-0001',
    title: 'Enterprise Analytics SaaS Agreement',
    counterparty: 'Northstar Analytics LLC',
    type: 'Software License',
    status: 'Legal Review',
    value: 428000,
    currency: 'USD',
    owner: 'Sarah Patel',
    department: 'IT',
    legalEntity: 'Kode Kinetics LLC',
    jurisdiction: 'Virginia',
    paymentTerms: 'Net 30',
    startDate: '2026-07-01',
    endDate: '2027-06-30',
    renewalDate: '2026-09-29',
    renewalNoticeDays: 90,
    riskScore: 78,
    riskLevel: 'High',
    businessPriority: 'High',
    stage: 56,
    tags: ['AI Review', 'DPA Required', 'SaaS'],
    aiSummary: 'Large-value SaaS agreement with sensitive data exposure, non-standard liability language, and renewal terms that need alignment with the company playbook before approval.',
    nextAction: 'Legal should resolve liability carveouts and Security should confirm DPA/SOC 2 obligations before finance approval.',
    clauses: commonClauses,
    obligations: obligationsA,
    documents: docs('VCLM-2026-0001', 'Northstar')
  },
  {
    id: 'VCLM-2026-0002',
    title: 'Facilities Maintenance Master Services Agreement',
    counterparty: 'Crown Facilities Group',
    type: 'Master Services Agreement',
    status: 'Finance Review',
    value: 935000,
    currency: 'USD',
    owner: 'Mark Evans',
    department: 'Operations',
    legalEntity: 'Kode Kinetics LLC',
    jurisdiction: 'Maryland',
    paymentTerms: 'Net 45',
    startDate: '2026-06-15',
    endDate: '2029-06-14',
    renewalDate: '2029-03-16',
    renewalNoticeDays: 90,
    riskScore: 65,
    riskLevel: 'Medium',
    businessPriority: 'Critical',
    stage: 68,
    tags: ['MSA', 'Insurance', 'Field Services'],
    aiSummary: 'Operationally important service agreement with insurance evidence, SLA credits, field safety obligations, and milestone acceptance items requiring ownership clarity.',
    nextAction: 'Finance should validate spend authority; Risk should verify insurance certificate and SLA credit wording.',
    clauses: [
      { ...commonClauses[0], id: 'CL-004', status: 'Approved', risk: 'Medium', note: 'Liability language aligns with approved MSA fallback.' },
      { ...commonClauses[1], id: 'CL-005', status: 'Approved', risk: 'Low', note: 'Renewal notice configured at 90 days.' },
      { id: 'CL-006', name: 'Insurance Requirements', category: 'Compliance', status: 'Needs Review', risk: 'High', position: 'CGL, auto, workers comp, umbrella, cyber, and professional liability as applicable.', fallback: 'Risk acceptance required when cyber or umbrella coverage is below threshold.', note: 'Certificate received but cyber coverage limit is below requested threshold.' }
    ],
    obligations: obligationsB,
    documents: docs('VCLM-2026-0002', 'Crown Facilities')
  },
  {
    id: 'VCLM-2026-0003',
    title: 'Strategic Partner Referral Agreement',
    counterparty: 'Avenick Commerce Partners',
    type: 'Partner Agreement',
    status: 'Approval Pending',
    value: 185000,
    currency: 'USD',
    owner: 'Zahid Khan',
    department: 'Sales',
    legalEntity: 'Kode Kinetics LLC',
    jurisdiction: 'Delaware',
    paymentTerms: 'Monthly commission settlement',
    startDate: '2026-06-10',
    endDate: '2027-06-09',
    renewalDate: '2027-03-11',
    renewalNoticeDays: 90,
    riskScore: 44,
    riskLevel: 'Medium',
    businessPriority: 'High',
    stage: 82,
    tags: ['Revenue', 'Partner', 'Commission'],
    aiSummary: 'Referral agreement is commercially attractive but requires cleaner commission rules, deal ownership definitions, and conflict handling before executive approval.',
    nextAction: 'Sales leadership should approve commission schedule and dispute handling language.',
    clauses: [
      { id: 'CL-007', name: 'Commission Schedule', category: 'Commercial', status: 'Negotiating', risk: 'Medium', position: 'Commission payable after customer payment is received and refund window expires.', fallback: 'Partial payout upon invoice payment with clawback language.', note: 'Partner requested payout at contract signature.' },
      { id: 'CL-008', name: 'Non-Circumvention', category: 'Legal', status: 'Approved', risk: 'Low', position: 'Mutual non-circumvention for registered opportunities.', fallback: 'Limit term to 12 months after opportunity registration.', note: 'Approved language accepted by both parties.' },
      { id: 'CL-009', name: 'Opportunity Registration', category: 'Operational', status: 'Needs Review', risk: 'Medium', position: 'Deal registration required in CRM before commission eligibility.', fallback: 'Email registration allowed for first 60 days after go-live.', note: 'CRM integration should create registration evidence automatically.' }
    ],
    obligations: [
      { id: 'OBL-1005', contractId: 'VCLM-2026-0003', title: 'Create CRM partner registration workflow', owner: 'Sales Ops', department: 'Sales', dueDate: '2026-06-30', status: 'Open', priority: 'Medium', sourceClause: 'Opportunity Registration', evidenceRequired: true }
    ],
    documents: docs('VCLM-2026-0003', 'Avenick Referral')
  },
  {
    id: 'VCLM-2026-0004',
    title: 'Public Sector Website Implementation SOW',
    counterparty: 'Municipal Digital Services',
    type: 'Statement of Work',
    status: 'Renewal Window',
    value: 39500,
    currency: 'USD',
    owner: 'Nadia Ruiz',
    department: 'Delivery',
    legalEntity: 'Kode Kinetics LLC',
    jurisdiction: 'North Carolina',
    paymentTerms: 'Milestone billing',
    startDate: '2026-05-01',
    endDate: '2026-10-31',
    renewalDate: '2026-06-25',
    renewalNoticeDays: 30,
    riskScore: 82,
    riskLevel: 'Critical',
    businessPriority: 'Critical',
    stage: 91,
    tags: ['Renewal Window', 'Public Sector', 'ADA'],
    aiSummary: 'SOW has high deadline exposure because renewal/change-order discussion is inside the notice period and acceptance criteria must be documented before continued work.',
    nextAction: 'Escalate to account owner today; confirm renewal/change-order path and preserve written notice evidence.',
    clauses: [
      { id: 'CL-010', name: 'Acceptance Criteria', category: 'Operational', status: 'Needs Review', risk: 'High', position: 'Milestone acceptance requires objective test criteria and 5-business-day review period.', fallback: 'Acceptance by deemed approval if no response within review period.', note: 'Client acceptance language is unclear and could delay billing.' },
      { id: 'CL-011', name: 'Accessibility Compliance', category: 'Compliance', status: 'Approved', risk: 'Medium', position: 'WCAG 2.1 AA testing, remediation, and launch evidence required.', fallback: 'Accessibility statement and remediation backlog accepted for non-critical content.', note: 'Approved for public-sector delivery requirements.' },
      { id: 'CL-012', name: 'Change Control', category: 'Commercial', status: 'Non-standard', risk: 'High', position: 'Any scope change must use written change order with price/schedule impact.', fallback: 'Email-approved change orders allowed below $5,000.', note: 'Client requested informal content updates not clearly inside scope.' }
    ],
    obligations: [
      { id: 'OBL-1006', contractId: 'VCLM-2026-0004', title: 'Send renewal/change-order notice', owner: 'Account Manager', department: 'Sales', dueDate: '2026-06-05', status: 'Overdue', priority: 'Critical', sourceClause: 'Renewal Terms', evidenceRequired: true },
      { id: 'OBL-1007', contractId: 'VCLM-2026-0004', title: 'Attach ADA testing evidence to project file', owner: 'QA Lead', department: 'Delivery', dueDate: '2026-08-30', status: 'Open', priority: 'High', sourceClause: 'Accessibility Compliance', evidenceRequired: true }
    ],
    documents: docs('VCLM-2026-0004', 'Municipal Website SOW')
  }
];

const workflowSteps: WorkflowStep[] = [
  { id: 'WF-001', contractId: 'VCLM-2026-0001', name: 'Business Intake Review', role: 'Business Owner', assignee: 'Sarah Patel', status: 'Approved', slaHours: 12, completedAt: '2026-05-26T18:20:00Z' },
  { id: 'WF-002', contractId: 'VCLM-2026-0001', name: 'Legal Clause Review', role: 'Legal Reviewer', assignee: 'Priya Shah', status: 'Active', slaHours: 48, startedAt: '2026-05-30T13:00:00Z' },
  { id: 'WF-003', contractId: 'VCLM-2026-0001', name: 'Security Review', role: 'Security Reviewer', assignee: 'Omar Reed', status: 'Waiting', slaHours: 36 },
  { id: 'WF-004', contractId: 'VCLM-2026-0002', name: 'Finance Spend Approval', role: 'Finance Approver', assignee: 'Linda Brooks', status: 'Active', slaHours: 24, startedAt: '2026-05-31T09:00:00Z' },
  { id: 'WF-005', contractId: 'VCLM-2026-0003', name: 'Executive Approval', role: 'Executive Sponsor', assignee: 'Zahid Khan', status: 'Active', slaHours: 24, startedAt: '2026-05-31T15:30:00Z' }
];

const allObligations = contracts.flatMap(c => c.obligations);

export const seedState: AppState = {
  contracts,
  obligations: allObligations,
  workflowSteps,
  vendors: [
    { id: 'VEN-001', name: 'Northstar Analytics LLC', category: 'SaaS / AI', risk: 'High', activeContracts: 2, expiringSoon: 1, lastReview: '2026-05-26', insuranceStatus: 'Current', dataProcessing: true, performanceScore: 88 },
    { id: 'VEN-002', name: 'Crown Facilities Group', category: 'Facilities', risk: 'Medium', activeContracts: 4, expiringSoon: 0, lastReview: '2026-05-22', insuranceStatus: 'Pending Review', dataProcessing: false, performanceScore: 81 },
    { id: 'VEN-003', name: 'Avenick Commerce Partners', category: 'Partner / Referral', risk: 'Medium', activeContracts: 1, expiringSoon: 0, lastReview: '2026-05-15', insuranceStatus: 'Missing', dataProcessing: false, performanceScore: 76 },
    { id: 'VEN-004', name: 'Municipal Digital Services', category: 'Public Sector', risk: 'Critical', activeContracts: 1, expiringSoon: 1, lastReview: '2026-05-28', insuranceStatus: 'Current', dataProcessing: true, performanceScore: 92 }
  ],
  auditEvents: [
    { id: 'AUD-001', timestamp: '2026-06-01T11:42:00Z', actor: 'Vantelyx AI', action: 'Risk flag created', object: 'VCLM-2026-0004', detail: 'Renewal notice deadline is approaching and change-order evidence is missing.' },
    { id: 'AUD-002', timestamp: '2026-06-01T10:18:00Z', actor: 'Priya Shah', action: 'Clause comment added', object: 'VCLM-2026-0001', detail: 'Requested data breach carveout in limitation of liability.' },
    { id: 'AUD-003', timestamp: '2026-05-31T17:05:00Z', actor: 'Linda Brooks', action: 'Finance review opened', object: 'VCLM-2026-0002', detail: 'Spend authority validation started.' },
    { id: 'AUD-004', timestamp: '2026-05-31T14:54:00Z', actor: 'System', action: 'Workflow routed', object: 'VCLM-2026-0003', detail: 'Contract routed to executive approval because business priority is High.' }
  ],
  templates: [
    { id: 'TMP-001', name: 'Mutual NDA - Standard', type: 'NDA', department: 'All', risk: 'Low', version: '2.1', status: 'Active', lastUpdated: '2026-05-10' },
    { id: 'TMP-002', name: 'SaaS Subscription Agreement', type: 'Software License', department: 'IT', risk: 'Medium', version: '1.8', status: 'Active', lastUpdated: '2026-05-22' },
    { id: 'TMP-003', name: 'Professional Services SOW', type: 'Statement of Work', department: 'Delivery', risk: 'Medium', version: '3.0', status: 'Active', lastUpdated: '2026-05-18' },
    { id: 'TMP-004', name: 'Vendor MSA - Field Services', type: 'Master Services Agreement', department: 'Operations', risk: 'High', version: '1.4', status: 'Draft', lastUpdated: '2026-05-30' }
  ],
  clausePlaybook: [
    { id: 'PB-001', name: 'Limitation of Liability', category: 'Legal', preferredLanguage: 'Mutual cap at fees paid in prior 12 months with approved carveouts.', fallbackLanguage: '2x annual fees with legal approval.', escalationRule: 'Escalate when cap exceeds 2x fees, carveouts are missing, or consequential damages language is one-sided.', risk: 'High' },
    { id: 'PB-002', name: 'DPA / Privacy', category: 'Privacy', preferredLanguage: 'Attach approved DPA when personal or regulated data is processed.', fallbackLanguage: 'Security and privacy approval required if no DPA is attached.', escalationRule: 'Escalate whenever customer, employee, health, payment, or regulated data is referenced.', risk: 'Critical' },
    { id: 'PB-003', name: 'Renewal Notice', category: 'Commercial', preferredLanguage: 'No auto-renewal without system alert and owner confirmation.', fallbackLanguage: 'Auto-renewal allowed with 90-day notice and owner acknowledgment.', escalationRule: 'Escalate under 60-day notice or evergreen terms.', risk: 'Medium' },
    { id: 'PB-004', name: 'Insurance', category: 'Compliance', preferredLanguage: 'Coverage limits must match vendor category risk profile.', fallbackLanguage: 'Risk acceptance required for missing or reduced coverage.', escalationRule: 'Escalate expired, missing, or below-threshold certificates.', risk: 'High' }
  ],
  integrations: [
    { id: 'INT-001', name: 'Microsoft Entra ID / SSO', category: 'Identity', status: 'Needs Admin', description: 'OIDC/SAML-ready identity integration for enterprise login, groups, and role mapping.' },
    { id: 'INT-002', name: 'SharePoint / OneDrive', category: 'Document Storage', status: 'Planned', description: 'Central storage connector for signed contracts, exhibits, redlines, and evidence files.' },
    { id: 'INT-003', name: 'DocuSign / Adobe Sign', category: 'E-Signature', status: 'Planned', description: 'Signature packet creation, signer tracking, executed PDF retrieval, and audit certificate storage.' },
    { id: 'INT-004', name: 'Dynamics / QuickBooks / NetSuite', category: 'ERP', status: 'Planned', description: 'Vendor, customer, PO, invoice, and contract-value synchronization.' },
    { id: 'INT-005', name: 'Salesforce / HubSpot', category: 'CRM', status: 'Planned', description: 'Opportunity-to-contract handoff, account mapping, and renewal revenue workflow.' },
    { id: 'INT-006', name: 'AI/OCR Document Pipeline', category: 'AI/OCR', status: 'Connected', description: 'Abstraction layer for OCR, extraction, classification, clause comparison, and risk scoring.' },
    { id: 'INT-007', name: 'Teams / Slack / Email', category: 'Notifications', status: 'Planned', description: 'SLA nudges, renewal alerts, approval requests, and exception escalation.' },
    { id: 'INT-008', name: 'Power BI / Tableau', category: 'BI', status: 'Planned', description: 'Executive reporting dataset for portfolio exposure, cycle time, and renewal risk.' }
  ],
  roles: [
    { role: 'System Admin', users: 2, permissions: ['Manage users', 'Manage roles', 'Configure integrations', 'View audit logs'] },
    { role: 'Legal Reviewer', users: 5, permissions: ['Review clauses', 'Approve legal steps', 'Edit playbook', 'Comment on redlines'] },
    { role: 'Business Requester', users: 26, permissions: ['Submit requests', 'View owned contracts', 'Respond to tasks'] },
    { role: 'Finance Approver', users: 3, permissions: ['Approve spend', 'View contract value', 'Validate payment terms'] },
    { role: 'Security Reviewer', users: 4, permissions: ['Review DPA', 'Review security exhibits', 'Approve data-risk steps'] },
    { role: 'Vendor Portal User', users: 18, permissions: ['Upload certificates', 'Complete questionnaires', 'View assigned obligations'] },
    { role: 'Auditor / Read Only', users: 2, permissions: ['Read contracts', 'Export audit trail', 'View evidence'] }
  ]
};

export const trendData = [
  { month: 'Jan', created: 18, executed: 11, cycle: 22, obligations: 32 },
  { month: 'Feb', created: 24, executed: 15, cycle: 20, obligations: 38 },
  { month: 'Mar', created: 28, executed: 18, cycle: 17, obligations: 42 },
  { month: 'Apr', created: 31, executed: 24, cycle: 14, obligations: 51 },
  { month: 'May', created: 39, executed: 30, cycle: 12, obligations: 58 },
  { month: 'Jun', created: 43, executed: 34, cycle: 10, obligations: 64 }
];

export const rfpCoverage = [
  ['Central contract repository', 'Covered', 'Search, filter, versions, documents, metadata, audit trail'],
  ['Contract creation and intake', 'Covered', 'AI intake, business request portal, template-assisted creation'],
  ['Workflow and approvals', 'Covered', 'Policy-based steps, SLA, assignees, escalation-ready structure'],
  ['Obligation tracking', 'Covered', 'Obligation extraction, owner, due date, evidence, priority, status'],
  ['Renewals and alerts', 'Covered', 'Notice date tracking, renewal exposure, deadline prioritization'],
  ['Risk and compliance', 'Covered', 'Clause playbook, deviations, controls, audit evidence'],
  ['Reporting and analytics', 'Covered', 'Executive charts, report cards, CSV export-ready data'],
  ['Admin security / RBAC', 'Covered', 'Roles, permissions, audit logs, SSO-ready integration design'],
  ['Vendor/counterparty management', 'Enhanced', 'Vendor risk, insurance, portal-oriented evidence collection'],
  ['AI features', 'Bonus', 'Classification, extraction preview, risk scoring, clause comparison structure']
];
