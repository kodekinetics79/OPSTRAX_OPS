CREATE DATABASE IF NOT EXISTS opstrax;
USE opstrax;

CREATE TABLE companies (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE roles (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(80), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE users (id INT AUTO_INCREMENT PRIMARY KEY, company_id INT, role_id INT, email VARCHAR(160), password_hash VARCHAR(160), name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE vehicles (id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), vin VARCHAR(40), odometer INT, vehicle_code VARCHAR(60), plate_number VARCHAR(40), vehicle_type VARCHAR(80), make VARCHAR(80), model VARCHAR(80), model_year INT, fuel_type VARCHAR(50), ownership_type VARCHAR(60), region VARCHAR(120), assigned_driver_id INT, device_id VARCHAR(80), camera_id VARCHAR(80), engine_hours DECIMAL(10,1), utilization_percent INT, safety_score INT, risk_score INT, maintenance_status VARCHAR(80), compliance_status VARCHAR(80), device_status VARCHAR(80), camera_status VARCHAR(80), notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, deleted_at DATETIME NULL, INDEX idx_vehicle_tenant (tenant_id), INDEX idx_vehicle_code (vehicle_code), INDEX idx_vehicle_driver (assigned_driver_id), INDEX idx_vehicle_status (status), INDEX idx_vehicle_region (region), INDEX idx_vehicle_risk (risk_score), INDEX idx_vehicle_deleted (deleted_at));
CREATE TABLE drivers (id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), license_no VARCHAR(60), safety_score INT, driver_code VARCHAR(60), first_name VARCHAR(80), last_name VARCHAR(80), phone VARCHAR(40), email VARCHAR(160), license_number VARCHAR(80), license_class VARCHAR(40), license_expiry DATE, medical_card_expiry DATE, region VARCHAR(120), availability VARCHAR(80), assigned_vehicle_id INT, driver_type VARCHAR(80), utilization_percent INT, hos_status VARCHAR(80), coaching_status VARCHAR(80), compliance_status VARCHAR(80), risk_score INT, notes TEXT, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, deleted_at DATETIME NULL, INDEX idx_driver_tenant (tenant_id), INDEX idx_driver_code (driver_code), INDEX idx_driver_vehicle (assigned_vehicle_id), INDEX idx_driver_status (status), INDEX idx_driver_region (region), INDEX idx_driver_risk (risk_score), INDEX idx_driver_deleted (deleted_at));
CREATE TABLE assets (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), asset_type VARCHAR(60), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE customers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), contact_email VARCHAR(160), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE contracts (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), rate DECIMAL(10,2), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE jobs (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), customer_id INT, pickup_window VARCHAR(80), delivery_window VARCHAR(80), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE routes (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), miles INT, eta VARCHAR(80), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE route_stops (id INT AUTO_INCREMENT PRIMARY KEY, route_id INT, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), stop_order INT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE dispatch_assignments (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), job_id INT, vehicle_id INT, driver_id INT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE trips (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), route_id INT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE location_events (id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, entity_type VARCHAR(60), entity_id INT, vehicle_id INT, driver_id INT, job_id INT, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), latitude DECIMAL(10,6), longitude DECIMAL(10,6), speed DECIMAL(8,2), heading INT, occurred_at DATETIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_location_tenant (tenant_id), INDEX idx_location_entity (entity_type, entity_id), INDEX idx_location_occurred (occurred_at));

CREATE TABLE maintenance_items (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), due_date DATE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE work_orders (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), cost DECIMAL(10,2), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE fuel_transactions (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), gallons DECIMAL(10,2), amount DECIMAL(10,2), idle_cost DECIMAL(10,2), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE safety_events (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), event_type VARCHAR(80), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE dashcam_events (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), clip_url VARCHAR(240), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE compliance_documents (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), expires_on DATE, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE inspections (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), defects INT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE hos_logs (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), hours_remaining DECIMAL(4,1), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE expenses (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), amount DECIMAL(10,2), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE carriers (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), mc_number VARCHAR(60), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE documents (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), doc_type VARCHAR(80), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE sla_records (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), score INT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE kpi_records (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), category VARCHAR(80), label VARCHAR(40), value INT, target INT, updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE ai_insights (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(220), priority VARCHAR(40), location VARCHAR(120), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE notifications (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(220), priority VARCHAR(40), location VARCHAR(120), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE audit_logs (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), actor VARCHAR(120), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE integrations (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), provider VARCHAR(120), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);
CREATE TABLE subscription_plans (id INT AUTO_INCREMENT PRIMARY KEY, name VARCHAR(120), status VARCHAR(40), owner VARCHAR(120), metric VARCHAR(160), priority VARCHAR(40), location VARCHAR(120), monthly_price DECIMAL(10,2), updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP);

CREATE TABLE command_center_actions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  title VARCHAR(180) NOT NULL,
  description VARCHAR(600) NOT NULL,
  category VARCHAR(80) NOT NULL,
  priority VARCHAR(40) NOT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Open',
  linked_entity_type VARCHAR(80) NOT NULL,
  linked_entity_id INT NULL,
  owner_role VARCHAR(100) NOT NULL,
  due_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_cca_tenant (tenant_id),
  INDEX idx_cca_status (status),
  INDEX idx_cca_priority (priority),
  INDEX idx_cca_linked (linked_entity_type, linked_entity_id)
);
CREATE TABLE operational_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  event_type VARCHAR(80) NOT NULL,
  severity VARCHAR(40) NOT NULL,
  title VARCHAR(180) NOT NULL,
  description VARCHAR(600) NOT NULL,
  linked_entity_type VARCHAR(80) NOT NULL,
  linked_entity_id INT NULL,
  occurred_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_oe_tenant (tenant_id),
  INDEX idx_oe_severity (severity),
  INDEX idx_oe_occurred (occurred_at),
  INDEX idx_oe_linked (linked_entity_type, linked_entity_id)
);
CREATE TABLE ai_recommendations (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  category VARCHAR(90) NOT NULL,
  severity VARCHAR(40) NOT NULL,
  title VARCHAR(180) NOT NULL,
  insight VARCHAR(800) NOT NULL,
  evidence_json JSON NULL,
  recommended_action VARCHAR(500) NOT NULL,
  linked_entity_type VARCHAR(80) NOT NULL,
  linked_entity_id INT NULL,
  status VARCHAR(40) NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_air_tenant (tenant_id),
  INDEX idx_air_status (status),
  INDEX idx_air_severity (severity),
  INDEX idx_air_linked (linked_entity_type, linked_entity_id)
);

CREATE TABLE geofences (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  name VARCHAR(160) NOT NULL,
  type VARCHAR(80) NOT NULL,
  center_latitude DECIMAL(10,6) NOT NULL,
  center_longitude DECIMAL(10,6) NOT NULL,
  radius_meters INT NOT NULL,
  polygon_json JSON NULL,
  status VARCHAR(40) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_geofence_tenant (tenant_id),
  INDEX idx_geofence_status (status)
);
CREATE TABLE geofence_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  geofence_id INT NOT NULL,
  entity_type VARCHAR(60) NOT NULL,
  entity_id INT NOT NULL,
  event_type VARCHAR(80) NOT NULL,
  occurred_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_gfe_tenant (tenant_id),
  INDEX idx_gfe_geofence (geofence_id),
  INDEX idx_gfe_entity (entity_type, entity_id),
  INDEX idx_gfe_occurred (occurred_at)
);
CREATE TABLE route_paths (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  route_id INT NOT NULL,
  path_json JSON NOT NULL,
  status VARCHAR(40) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_route_path_tenant (tenant_id),
  INDEX idx_route_path_route (route_id),
  INDEX idx_route_path_status (status)
);
CREATE TABLE eta_updates (
  id INT AUTO_INCREMENT PRIMARY KEY,
  tenant_id INT NOT NULL DEFAULT 1,
  job_id INT NOT NULL,
  customer_id INT NULL,
  channel VARCHAR(60) NOT NULL,
  message VARCHAR(600) NOT NULL,
  status VARCHAR(40) NOT NULL,
  sent_at DATETIME NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_eta_tenant (tenant_id),
  INDEX idx_eta_job (job_id),
  INDEX idx_eta_status (status)
);

CREATE TABLE vehicle_documents (id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, vehicle_id INT NOT NULL, document_type VARCHAR(80), document_number VARCHAR(100), expiry_date DATE, status VARCHAR(40), file_url VARCHAR(240), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_vdoc_tenant (tenant_id), INDEX idx_vdoc_vehicle (vehicle_id), INDEX idx_vdoc_expiry (expiry_date));
CREATE TABLE driver_documents (id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, driver_id INT NOT NULL, document_type VARCHAR(80), document_number VARCHAR(100), expiry_date DATE, status VARCHAR(40), file_url VARCHAR(240), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_ddoc_tenant (tenant_id), INDEX idx_ddoc_driver (driver_id), INDEX idx_ddoc_expiry (expiry_date));
CREATE TABLE vehicle_assignments (id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, vehicle_id INT NOT NULL, driver_id INT NOT NULL, assignment_type VARCHAR(80), start_at DATETIME, end_at DATETIME NULL, status VARCHAR(40), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_va_tenant (tenant_id), INDEX idx_va_vehicle (vehicle_id), INDEX idx_va_driver (driver_id), INDEX idx_va_status (status));
CREATE TABLE driver_certifications (id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, driver_id INT NOT NULL, certification_type VARCHAR(100), issued_at DATE, expires_at DATE, status VARCHAR(40), created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_dc_tenant (tenant_id), INDEX idx_dc_driver (driver_id), INDEX idx_dc_expiry (expires_at));
CREATE TABLE entity_timeline_events (id INT AUTO_INCREMENT PRIMARY KEY, tenant_id INT NOT NULL DEFAULT 1, entity_type VARCHAR(40), entity_id INT, event_type VARCHAR(80), severity VARCHAR(40), title VARCHAR(180), description VARCHAR(600), occurred_at DATETIME, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, INDEX idx_ete_tenant (tenant_id), INDEX idx_ete_entity (entity_type, entity_id), INDEX idx_ete_occurred (occurred_at));
