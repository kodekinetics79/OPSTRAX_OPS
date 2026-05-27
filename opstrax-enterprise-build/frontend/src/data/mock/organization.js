
import React from 'react';
import StatusBadge from '@/components/common/StatusBadge';

export const MOCK_TENANTS = [
    { id: "TEN-001", name: "Global Logistics Co.", region: "MENA", plan: "Enterprise", status: "Active", users: 45 },
    { id: "TEN-002", name: "Swift Distro LLC", region: "NA", plan: "Standard", status: "Active", users: 12 },
    { id: "TEN-003", name: "ColdHaul Lines", region: "EU", plan: "Premium", status: "On Hold", users: 8 },
    { id: "TEN-004", name: "Desert Transporters", region: "GCC", plan: "Enterprise", status: "Active", users: 150 },
];

export const MOCK_BRANCHES = [
    { id: "BR-DXB", name: "Dubai HQ", tenant: "Global Logistics Co.", city: "Dubai", type: "Headquarters", status: "Active" },
    { id: "BR-RUH", name: "Riyadh Hub", tenant: "Global Logistics Co.", city: "Riyadh", type: "Distribution Center", status: "Active" },
    { id: "BR-LND", name: "London Office", tenant: "ColdHaul Lines", city: "London", type: "Sales Office", status: "Inactive" },
    { id: "BR-NYC", name: "New York Depot", tenant: "Swift Distro LLC", city: "New York", type: "Warehouse", status: "Active" },
];

export const MOCK_USERS = [
    { id: "USR-001", name: "Sarah Connor", email: "sarah@global.com", role: "Super Admin", branch: "Dubai HQ", status: "Active" },
    { id: "USR-002", name: "John Doe", email: "john@global.com", role: "Dispatcher", branch: "Riyadh Hub", status: "Active" },
    { id: "USR-003", name: "Kyle Reese", email: "kyle@swift.com", role: "Fleet Manager", branch: "New York Depot", status: "Active" },
    { id: "USR-004", name: "Ellen Ripley", email: "ellen@coldhaul.com", role: "Admin", branch: "London Office", status: "On Hold" },
];

export const MOCK_RBAC_ROLES = [
    { id: "ROLE-ADM", name: "Super Admin", description: "Full system access", users_count: 2 },
    { id: "ROLE-DISP", name: "Dispatcher", description: "Can manage orders and fleets", users_count: 15 },
    { id: "ROLE-DRV", name: "Driver", description: "Mobile app access only", users_count: 250 },
    { id: "ROLE-FIN", name: "Finance User", description: "Access to billing and reports", users_count: 5 },
];
