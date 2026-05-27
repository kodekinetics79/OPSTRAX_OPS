
import React from 'react';

export const MOCK_SLA = [
    { id: "SLA-001", metric: "On-Time Delivery", target: "95%", current: "94.2%", trend: "Down", status: "Warning" },
    { id: "SLA-002", metric: "Order Accuracy", target: "99%", current: "99.5%", trend: "Up", status: "Healthy" },
];

export const MOCK_KPI = [
    { id: "KPI-FLEET", name: "Fleet Utilization", value: "82%", target: "85%", period: "Mar 2024" },
    { id: "KPI-FUEL", name: "Fuel Cost / km", value: "0.45 AED", target: "0.42 AED", period: "Mar 2024" },
];

export const MOCK_EXCEPTIONS = [
    { id: "EX-992", type: "Delay Alert", description: "Vehicle Breakdown on E11", severity: "High", status: "Open" },
    { id: "EX-993", type: "Geofence Entry", description: "Unplanned stop at border", severity: "Medium", status: "Investigating" },
];

export const MOCK_PREDICTIVE = [
    { id: "PRED-COST-01", type: "Cost Forecast", date: "Apr 2024", prediction: "$45,000", confidence: "89%" },
    { id: "PRED-MAINT-02", type: "Maint. Schedule", date: "May 2024", prediction: "5 Vehicles Due", confidence: "92%" },
];

export const MOCK_AUDIT = [
    { id: "AUD-1102", user: "Sarah Connor", action: "Updated Contract Rates", date: "2 mins ago", ip: "192.168.1.1" },
    { id: "AUD-1103", user: "John Doe", action: "Login Failed", date: "1 hour ago", ip: "10.0.0.5" },
];

export const MOCK_FEATURES = [
    { id: "FEAT-AI", name: "AI Dispatch V2", type: "Beta", enabled_for: "Select Tenants", status: "Active" },
    { id: "FEAT-IOT", name: "Advanced Telematics", type: "Add-on", enabled_for: "All", status: "Active" },
];
