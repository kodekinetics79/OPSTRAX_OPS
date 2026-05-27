
import React from 'react';

export const MOCK_WORK_ORDERS = [
    { id: "WO-24-101", vehicle: "DXB-B-67890", type: "Preventive", desc: "Oil Change & Filter", scheduler: "system", due: "Yesterday", status: "Overdue" },
    { id: "WO-24-102", vehicle: "AUH-C-54321", type: "Repair", desc: "Brake Pad Replacement", scheduler: "John Doe", due: "Tomorrow", status: "Scheduled" },
];

export const MOCK_DOWNTIME = [
    { id: "DT-001", vehicle: "DXB-B-67890", start: "2024-03-10", end: "-", duration: "48h", reason: "Engine Overheating", status: "Active" },
    { id: "DT-002", vehicle: "SHJ-D-98765", start: "2024-03-01", end: "2024-03-02", duration: "24h", reason: "Scheduled Service", status: "Resolved" },
];
