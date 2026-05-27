import { MOCK_DRIVERS } from "@/data/mock/fleet";

export const DRIVERS = MOCK_DRIVERS;

export const HOS_LOGS = [
  {
    id: "LOG-001",
    driver: "John Doe",
    date: "2024-03-01",
    driving: 8.5,
    on_duty: 10,
    cycle_left: 60,
    status: "Compliant",
  },
  {
    id: "LOG-002",
    driver: "Jane Smith",
    date: "2024-03-01",
    driving: 11,
    on_duty: 14,
    cycle_left: 45,
    status: "Violation",
  },
];
