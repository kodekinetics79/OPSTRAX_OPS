
import React from 'react';

export const MOCK_FUEL_TRANSACTIONS = [
    { id: "FUEL-TX-991", vehicle: "DXB-A-12345", driver: "Ali Khan", date: "2024-03-12", location: "Shell Dubai Investment Park", liters: "120L", amount: "360 AED", status: "Posted" },
    { id: "FUEL-TX-992", vehicle: "AUH-C-54321", driver: "John Smith", date: "2024-03-11", location: "ADNOC Mussafah", liters: "80L", amount: "240 AED", status: "Posted" },
];

export const MOCK_EXPENSES = [
    { id: "EXP-553", category: "Toll Gates (Salik)", amount: "450 AED", date: "2024-03-01", description: "Monthly fleet top-up", status: "Approved" },
    { id: "EXP-554", category: "Fines", amount: "600 AED", date: "2024-03-05", description: "Speeding violation - DXB-A-12345", status: "Pending" },
];

export const MOCK_LOCATIONS = [
    { id: "LOC-DXB-01", name: "Jebel Ali Port", city: "Dubai", type: "Port", geofence: "Polygon (12 pts)", status: "Active" },
    { id: "LOC-RUH-04", name: "Riyadh Dry Port", city: "Riyadh", type: "Port", geofence: "Circle (500m)", status: "Active" },
    { id: "LOC-CUST-99", name: "Oceanic Warehouse", city: "Sharjah", type: "Customer Site", geofence: "Polygon (4 pts)", status: "Active" },
];

export const MOCK_STATUS_CODES = [
    { id: "STS-100", code: "ORD_NEW", label: "Order Created", category: "Order", color: "Blue", status: "Active" },
    { id: "STS-200", code: "TRIP_STARTED", label: "Trip Started", category: "Trip", color: "Green", status: "Active" },
    { id: "STS-900", code: "INV_PAID", label: "Invoice Paid", category: "Finance", color: "Emerald", status: "Active" },
];
