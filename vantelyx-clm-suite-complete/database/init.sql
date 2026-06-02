CREATE DATABASE IF NOT EXISTS vantelyx_clm;
USE vantelyx_clm;

CREATE TABLE IF NOT EXISTS tenants (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(160) NOT NULL,
  slug VARCHAR(80) NOT NULL UNIQUE,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  full_name VARCHAR(160) NOT NULL,
  email VARCHAR(190) NOT NULL,
  role_name VARCHAR(100) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY uq_user_email_tenant (tenant_id, email),
  CONSTRAINT fk_users_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS counterparties (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  name VARCHAR(190) NOT NULL,
  category VARCHAR(120),
  risk_level VARCHAR(40) DEFAULT 'Medium',
  insurance_status VARCHAR(80) DEFAULT 'Pending Review',
  data_processing BOOLEAN DEFAULT FALSE,
  performance_score INT DEFAULT 75,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_counterparties_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS contracts (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  public_id VARCHAR(40) NOT NULL,
  title VARCHAR(240) NOT NULL,
  counterparty_id BIGINT NULL,
  counterparty_name VARCHAR(190) NOT NULL,
  contract_type VARCHAR(120) NOT NULL,
  status VARCHAR(80) NOT NULL DEFAULT 'Intake',
  contract_value DECIMAL(18,2) DEFAULT 0,
  currency CHAR(3) DEFAULT 'USD',
  owner_name VARCHAR(160),
  department VARCHAR(120),
  legal_entity VARCHAR(190),
  jurisdiction VARCHAR(120),
  payment_terms VARCHAR(120),
  start_date DATE NULL,
  end_date DATE NULL,
  renewal_date DATE NULL,
  renewal_notice_days INT DEFAULT 90,
  risk_score INT DEFAULT 0,
  risk_level VARCHAR(40) DEFAULT 'Low',
  business_priority VARCHAR(40) DEFAULT 'Medium',
  lifecycle_stage INT DEFAULT 0,
  ai_summary TEXT,
  next_action TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_contract_public_id (tenant_id, public_id),
  KEY idx_contract_status (tenant_id, status),
  KEY idx_contract_renewal (tenant_id, renewal_date),
  KEY idx_contract_risk (tenant_id, risk_level),
  CONSTRAINT fk_contract_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT fk_contract_counterparty FOREIGN KEY (counterparty_id) REFERENCES counterparties(id)
);

CREATE TABLE IF NOT EXISTS contract_tags (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  contract_id BIGINT NOT NULL,
  tag VARCHAR(80) NOT NULL,
  UNIQUE KEY uq_contract_tag (contract_id, tag),
  CONSTRAINT fk_tags_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS documents (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  contract_id BIGINT NOT NULL,
  document_name VARCHAR(240) NOT NULL,
  document_type VARCHAR(80) NOT NULL,
  version_label VARCHAR(40) DEFAULT 'v1.0',
  status VARCHAR(60) DEFAULT 'Uploaded',
  storage_uri VARCHAR(500),
  uploaded_by VARCHAR(160),
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_documents_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS clause_playbook (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  name VARCHAR(180) NOT NULL,
  category VARCHAR(80) NOT NULL,
  preferred_language TEXT,
  fallback_language TEXT,
  escalation_rule TEXT,
  risk_level VARCHAR(40) NOT NULL DEFAULT 'Medium',
  active BOOLEAN DEFAULT TRUE,
  CONSTRAINT fk_clause_playbook_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS contract_clauses (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  contract_id BIGINT NOT NULL,
  playbook_id BIGINT NULL,
  clause_name VARCHAR(180) NOT NULL,
  category VARCHAR(80),
  status VARCHAR(60) DEFAULT 'Needs Review',
  risk_level VARCHAR(40) DEFAULT 'Medium',
  extracted_text TEXT,
  note TEXT,
  CONSTRAINT fk_contract_clause_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE,
  CONSTRAINT fk_contract_clause_playbook FOREIGN KEY (playbook_id) REFERENCES clause_playbook(id)
);

CREATE TABLE IF NOT EXISTS obligations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  contract_id BIGINT NOT NULL,
  public_id VARCHAR(40) NOT NULL,
  title VARCHAR(240) NOT NULL,
  owner_name VARCHAR(160),
  department VARCHAR(120),
  due_date DATE NULL,
  status VARCHAR(60) DEFAULT 'Open',
  priority VARCHAR(40) DEFAULT 'Medium',
  source_clause VARCHAR(180),
  evidence_required BOOLEAN DEFAULT FALSE,
  evidence_uri VARCHAR(500),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_obligation_due (contract_id, due_date),
  KEY idx_obligation_status (contract_id, status),
  CONSTRAINT fk_obligation_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_instances (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  contract_id BIGINT NOT NULL,
  name VARCHAR(180) NOT NULL,
  status VARCHAR(60) DEFAULT 'Active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_workflow_contract FOREIGN KEY (contract_id) REFERENCES contracts(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS workflow_steps (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  workflow_instance_id BIGINT NOT NULL,
  step_name VARCHAR(160) NOT NULL,
  role_name VARCHAR(100),
  assignee_name VARCHAR(160),
  status VARCHAR(60) DEFAULT 'Waiting',
  sla_hours INT DEFAULT 24,
  started_at TIMESTAMP NULL,
  completed_at TIMESTAMP NULL,
  note TEXT,
  CONSTRAINT fk_workflow_step_instance FOREIGN KEY (workflow_instance_id) REFERENCES workflow_instances(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS templates (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  name VARCHAR(180) NOT NULL,
  contract_type VARCHAR(120) NOT NULL,
  department VARCHAR(120),
  risk_level VARCHAR(40) DEFAULT 'Low',
  version_label VARCHAR(40) DEFAULT '1.0',
  status VARCHAR(60) DEFAULT 'Active',
  file_uri VARCHAR(500),
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_templates_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS integrations (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  name VARCHAR(160) NOT NULL,
  category VARCHAR(80) NOT NULL,
  status VARCHAR(60) DEFAULT 'Planned',
  config_json JSON NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_integrations_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

CREATE TABLE IF NOT EXISTS audit_events (
  id BIGINT PRIMARY KEY AUTO_INCREMENT,
  tenant_id BIGINT NOT NULL,
  actor_name VARCHAR(160),
  action_name VARCHAR(160) NOT NULL,
  object_ref VARCHAR(120),
  detail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  KEY idx_audit_object (tenant_id, object_ref),
  KEY idx_audit_created (tenant_id, created_at),
  CONSTRAINT fk_audit_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

INSERT INTO tenants (name, slug) VALUES ('Kode Kinetics LLC', 'kode-kinetics')
ON DUPLICATE KEY UPDATE name = VALUES(name);

INSERT INTO users (tenant_id, full_name, email, role_name)
SELECT id, 'Zahid Khan', 'zahid@example.com', 'System Admin' FROM tenants WHERE slug='kode-kinetics'
ON DUPLICATE KEY UPDATE full_name=VALUES(full_name), role_name=VALUES(role_name);

INSERT INTO clause_playbook (tenant_id, name, category, preferred_language, fallback_language, escalation_rule, risk_level)
SELECT t.id, 'Limitation of Liability', 'Legal', 'Mutual cap at fees paid in prior 12 months with approved carveouts.', '2x annual fees with legal approval.', 'Escalate when cap exceeds threshold or carveouts are missing.', 'High' FROM tenants t WHERE t.slug='kode-kinetics';

INSERT INTO clause_playbook (tenant_id, name, category, preferred_language, fallback_language, escalation_rule, risk_level)
SELECT t.id, 'DPA / Privacy', 'Privacy', 'Attach approved DPA when personal or regulated data is processed.', 'Security and privacy approval required if DPA is omitted.', 'Escalate whenever regulated data is referenced.', 'Critical' FROM tenants t WHERE t.slug='kode-kinetics';
