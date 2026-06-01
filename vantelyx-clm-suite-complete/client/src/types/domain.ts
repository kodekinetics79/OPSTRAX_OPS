export type RiskLevel = 'Low' | 'Medium' | 'High' | 'Critical';

export type ContractStatus =
  | 'Intake'
  | 'Drafting'
  | 'Legal Review'
  | 'Finance Review'
  | 'Security Review'
  | 'Counterparty Review'
  | 'Approval Pending'
  | 'Ready for Signature'
  | 'Executed'
  | 'Renewal Window'
  | 'Expired'
  | 'Terminated';

export type ContractType =
  | 'Master Services Agreement'
  | 'NDA'
  | 'Statement of Work'
  | 'Lease'
  | 'Software License'
  | 'Purchase Agreement'
  | 'Grant Agreement'
  | 'Employment Agreement'
  | 'Data Processing Agreement'
  | 'Partner Agreement'
  | 'Vendor Agreement';

export type ClauseStatus = 'Approved' | 'Needs Review' | 'Missing' | 'Non-standard' | 'Negotiating';
export type WorkflowStatus = 'Waiting' | 'Active' | 'Approved' | 'Rejected' | 'Skipped';
export type ObligationStatus = 'Open' | 'In Progress' | 'Completed' | 'Overdue' | 'Blocked';
export type DocumentStatus = 'Uploaded' | 'Parsed' | 'Reviewed' | 'Signed' | 'Superseded';
export type IntegrationStatus = 'Connected' | 'Not Connected' | 'Needs Admin' | 'Planned';

export type ClauseInsight = {
  id: string;
  name: string;
  category: 'Commercial' | 'Legal' | 'Security' | 'Privacy' | 'Operational' | 'Compliance';
  status: ClauseStatus;
  risk: RiskLevel;
  position: string;
  fallback: string;
  note: string;
};

export type Obligation = {
  id: string;
  contractId: string;
  title: string;
  owner: string;
  department: string;
  dueDate: string;
  status: ObligationStatus;
  priority: RiskLevel;
  sourceClause: string;
  evidenceRequired: boolean;
};

export type WorkflowStep = {
  id: string;
  contractId: string;
  name: string;
  role: string;
  assignee: string;
  status: WorkflowStatus;
  slaHours: number;
  startedAt?: string;
  completedAt?: string;
  note?: string;
};

export type ContractDocument = {
  id: string;
  contractId: string;
  name: string;
  type: 'Main Agreement' | 'Exhibit' | 'SOW' | 'Redline' | 'Certificate' | 'Amendment';
  version: string;
  status: DocumentStatus;
  uploadedBy: string;
  uploadedAt: string;
};

export type Contract = {
  id: string;
  title: string;
  counterparty: string;
  type: ContractType;
  status: ContractStatus;
  value: number;
  currency: 'USD' | 'CAD' | 'EUR' | 'GBP';
  owner: string;
  department: string;
  legalEntity: string;
  jurisdiction: string;
  paymentTerms: string;
  startDate: string;
  endDate: string;
  renewalDate: string;
  renewalNoticeDays: number;
  riskScore: number;
  riskLevel: RiskLevel;
  businessPriority: RiskLevel;
  stage: number;
  tags: string[];
  aiSummary: string;
  nextAction: string;
  clauses: ClauseInsight[];
  obligations: Obligation[];
  documents: ContractDocument[];
};

export type Vendor = {
  id: string;
  name: string;
  category: string;
  risk: RiskLevel;
  activeContracts: number;
  expiringSoon: number;
  lastReview: string;
  insuranceStatus: 'Current' | 'Expired' | 'Missing' | 'Pending Review';
  dataProcessing: boolean;
  performanceScore: number;
};

export type AuditEvent = {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  object: string;
  detail: string;
};

export type Template = {
  id: string;
  name: string;
  type: ContractType;
  department: string;
  risk: RiskLevel;
  version: string;
  status: 'Active' | 'Draft' | 'Retired';
  lastUpdated: string;
};

export type ClausePlaybookItem = {
  id: string;
  name: string;
  category: ClauseInsight['category'];
  preferredLanguage: string;
  fallbackLanguage: string;
  escalationRule: string;
  risk: RiskLevel;
};

export type Integration = {
  id: string;
  name: string;
  category: 'Identity' | 'Document Storage' | 'E-Signature' | 'ERP' | 'CRM' | 'AI/OCR' | 'Notifications' | 'BI';
  status: IntegrationStatus;
  description: string;
};

export type RolePermission = {
  role: string;
  permissions: string[];
  users: number;
};

export type IntakeAnalysis = {
  id: string;
  fileName: string;
  agreementType: ContractType;
  counterparty: string;
  value: number;
  riskScore: number;
  riskLevel: RiskLevel;
  detectedDates: string[];
  flags: string[];
  suggestedRoute: string[];
  confidence: number;
};

export type AppState = {
  contracts: Contract[];
  obligations: Obligation[];
  workflowSteps: WorkflowStep[];
  vendors: Vendor[];
  auditEvents: AuditEvent[];
  templates: Template[];
  clausePlaybook: ClausePlaybookItem[];
  integrations: Integration[];
  roles: RolePermission[];
};
