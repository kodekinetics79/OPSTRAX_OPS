
import React from 'react';

export const MOCK_DEVICES = [
    { id: "IOT-001", type: "GPS Tracker", vehicle: "DXB-A-12345", last_ping: "2 mins ago", status: "Online", battery: "100%" },
    { id: "IOT-002", type: "Temp Sensor", vehicle: "DXB-A-12345", last_ping: "2 mins ago", status: "Online", reading: "-18°C" },
    { id: "IOT-003", type: "OBD-II", vehicle: "AUH-C-54321", last_ping: "5 hours ago", status: "Offline", battery: "0%" },
];

export const MOCK_COLD_CHAIN = [
    { id: "CC-LOG-991", vehicle: "DXB-A-12345", trip: "RT-DXB-AUH-01", set_point: "-20°C", avg_temp: "-19.5°C", violations: 0, status: "Compliant" },
    { id: "CC-LOG-992", vehicle: "SHJ-D-98765", trip: "RT-INT-KSA-01", set_point: "-18°C", avg_temp: "-15.0°C", violations: 2, status: "Warning" },
];
