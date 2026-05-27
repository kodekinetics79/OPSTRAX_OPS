
import React from 'react';

export const MOCK_CARRIERS = [
    { id: "CARR-001", name: "FastTrack Logistics", region: "UAE", type: "3PL", rating: "4.5", status: "Active" },
    { id: "CARR-002", name: "Gulf Haulage", region: "GCC", type: "Transporter", rating: "4.2", status: "Active" },
    { id: "CARR-003", name: "Speedy Delivery", region: "Dubai", type: "Last Mile", rating: "3.8", status: "On Hold" },
];

export const MOCK_CARRIER_RATES = [
    { id: "CR-001", carrier: "FastTrack Logistics", origin: "Jebel Ali", dest: "Riyadh", vehicle: "Reefer 40ft", rate: "3500 AED", status: "Active" },
    { id: "CR-002", carrier: "Gulf Haulage", origin: "Dammam", dest: "Jeddah", vehicle: "Flatbed", rate: "2800 SAR", status: "Active" },
];

export const MOCK_PORTAL_BOOKINGS = [
    { id: "BKG-9921", customer: "Oceanic Seafoods", date: "2024-03-12", origin: "Dubai", dest: "Abu Dhabi", items: "Fish", status: "Pending Approval" },
    { id: "BKG-9922", customer: "MegaBuild", date: "2024-03-11", origin: "Sharjah", dest: "Dubai", items: "Cement", status: "Approved" },
];

export const MOCK_PORTAL_USERS = [
    { id: "PUSER-01", name: "Guest User 1", company: "Oceanic Seafoods", email: "procurement@oceanic.com", last_login: "Today 09:00 AM", status: "Active" },
    { id: "PUSER-02", name: "Guest User 2", company: "MegaBuild", email: "logistics@megabuild.com", last_login: "Yesterday", status: "Active" },
];
