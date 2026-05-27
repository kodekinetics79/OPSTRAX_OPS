
import React from 'react';

export const MOCK_RATE_CARDS = [
    { id: "RC-2024-STD", name: "Standard Tariff 2024", customer: "General", type: "Distance Based", status: "Active" },
    { id: "RC-OCEANIC", name: "Oceanic Contract Rates", customer: "Oceanic Seafoods", type: "Route Based", status: "Active" },
    { id: "RC-MEGA-VIP", name: "MegaBuild VIP Tariff", customer: "MegaBuild", type: "Weight Based", status: "Draft" },
];

export const MOCK_SIMULATIONS = [
    { id: "SIM-001", name: "Q2 Price Hike Impact", date: "2024-03-12", scenario: "+5% Fuel Cost", result: "-2% Margin", status: "Completed" },
    { id: "SIM-002", name: "New Route DXB-OMAN", date: "2024-03-10", scenario: "New Lane", result: "Positive ROI", status: "Saved" },
];
