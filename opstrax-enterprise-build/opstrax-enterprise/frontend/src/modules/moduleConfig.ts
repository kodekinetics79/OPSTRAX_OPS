import type { ModuleConfig } from '../types';

export const modules: ModuleConfig[] = [
  { key: 'command-center', title: 'Command Center', path: '/command-center', description: 'Executive operations dashboard for active transport control.', table: 'kpi_records', icon: 'LayoutDashboard' },
  { key: 'control-tower', title: 'Live Map / Control Tower', path: '/control-tower', description: 'Simulated live map, route risk, geofences, and vehicle telemetry.', table: 'location_events', icon: 'Map' },
  { key: 'dispatch-board', title: 'Dispatch Board', path: '/dispatch-board', description: 'Kanban dispatch workflow across every active job state.', table: 'dispatch_assignments', icon: 'KanbanSquare' },
  { key: 'jobs-orders', title: 'Jobs & Orders', path: '/jobs-orders', description: 'Customer jobs, pickup windows, delivery windows, and exceptions.', table: 'jobs', icon: 'PackageCheck' },
  { key: 'route-planning', title: 'Route Planning', path: '/route-planning', description: 'Planned routes, stop sequencing, miles, ETAs, and risk.', table: 'routes', icon: 'Route' },
  { key: 'vehicles', title: 'Vehicles', path: '/vehicles', description: 'Fleet registry, assignment health, odometer, and status.', table: 'vehicles', icon: 'Truck' },
  { key: 'drivers', title: 'Drivers', path: '/drivers', description: 'Driver roster, certifications, availability, safety, and performance.', table: 'drivers', icon: 'Users' },
  { key: 'assets', title: 'Assets / Trailers / Equipment', path: '/assets', description: 'Trailer, chassis, container, and equipment visibility.', table: 'assets', icon: 'Boxes' },
  { key: 'maintenance', title: 'Maintenance', path: '/maintenance', description: 'Preventive maintenance tasks, due dates, and severity.', table: 'maintenance_items', icon: 'Wrench' },
  { key: 'work-orders', title: 'Work Orders', path: '/work-orders', description: 'Shop work orders, labor state, parts state, and priority.', table: 'work_orders', icon: 'ClipboardList' },
  { key: 'fuel-idling', title: 'Fuel & Idling', path: '/fuel-idling', description: 'Fuel spend, MPG, idle cost, and transaction monitoring.', table: 'fuel_transactions', icon: 'Fuel' },
  { key: 'safety', title: 'Safety', path: '/safety', description: 'Safety events, severity trends, coaching status, and risk.', table: 'safety_events', icon: 'ShieldAlert' },
  { key: 'dashcam', title: 'AI Dashcam / Incident Review', path: '/dashcam', description: 'Camera events, incident review queues, and evidence state.', table: 'dashcam_events', icon: 'Video' },
  { key: 'compliance', title: 'Compliance', path: '/compliance', description: 'Regulatory documents, expirations, warnings, and audit readiness.', table: 'compliance_documents', icon: 'FileCheck2' },
  { key: 'hos-eld', title: 'HOS / ELD Framework', path: '/hos-eld', description: 'Hours of service logs and ELD compliance framework.', table: 'hos_logs', icon: 'Clock3' },
  { key: 'dvir-inspections', title: 'DVIR / Inspections', path: '/dvir-inspections', description: 'Driver inspections, defects, repairs, and release state.', table: 'inspections', icon: 'SearchCheck' },
  { key: 'customer-eta-portal', title: 'Customer ETA Portal', path: '/customer-eta-portal', description: 'Customer-facing ETA and shipment visibility controls.', table: 'jobs', icon: 'RadioTower' },
  { key: 'clients-customers', title: 'Clients / Customers', path: '/clients-customers', description: 'Customer master data, service tiers, and contacts.', table: 'customers', icon: 'Building2' },
  { key: 'contracts-rates', title: 'Contracts / Rates', path: '/contracts-rates', description: 'Rate cards, lanes, contract status, and renewal risk.', table: 'contracts', icon: 'ReceiptText' },
  { key: 'carrier-management', title: 'Carrier Management', path: '/carrier-management', description: 'Partner carrier onboarding, insurance, scorecards, and capacity.', table: 'carriers', icon: 'Handshake' },
  { key: 'expenses', title: 'Expenses', path: '/expenses', description: 'Operational expenses, approvals, and margin impact.', table: 'expenses', icon: 'WalletCards' },
  { key: 'documents', title: 'Documents', path: '/documents', description: 'Operational document storage and workflow status.', table: 'documents', icon: 'Files' },
  { key: 'reports-analytics', title: 'Reports & Analytics', path: '/reports-analytics', description: 'Operational reports, analytics snapshots, and trends.', table: 'kpi_records', icon: 'BarChart3' },
  { key: 'sla-kpi-center', title: 'SLA / KPI Center', path: '/sla-kpi-center', description: 'SLA performance, KPI ownership, and threshold breaches.', table: 'sla_records', icon: 'Gauge' },
  { key: 'predictive-cost-margin', title: 'Predictive Cost & Margin', path: '/predictive-cost-margin', description: 'Margin risk signals, cost predictors, and lane economics.', table: 'kpi_records', icon: 'TrendingUp' },
  { key: 'audit-logs', title: 'Audit Logs', path: '/audit-logs', description: 'Security, data changes, operational traceability, and user actions.', table: 'audit_logs', icon: 'History' },
  { key: 'ai-copilot', title: 'OpsTrax AI Copilot', path: '/ai-copilot', description: 'AI-assisted operations briefings and decision support.', table: 'ai_insights', icon: 'Bot' },
  { key: 'integrations', title: 'Integrations', path: '/integrations', description: 'Telematics, ELD, fuel card, accounting, and customer integrations.', table: 'integrations', icon: 'PlugZap' },
  { key: 'user-management', title: 'User Management', path: '/user-management', description: 'Users, roles, departments, and access foundations.', table: 'users', icon: 'UserCog' },
  { key: 'settings', title: 'Settings', path: '/settings', description: 'Tenant settings, thresholds, notification policies, and preferences.', table: 'integrations', icon: 'Settings' },
  { key: 'billing-subscription', title: 'Billing / Subscription', path: '/billing-subscription', description: 'Subscription plans, invoices, seats, and usage controls.', table: 'subscription_plans', icon: 'CreditCard' }
];

export const getModule = (key?: string) => modules.find((item) => item.key === key) ?? modules[0];
