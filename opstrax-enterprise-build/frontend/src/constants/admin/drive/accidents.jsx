import { AlertOctagon, Car, Clock, DollarSign } from "lucide-react";
import { StatusBadge } from "@/components";

export const ACCIDENTS_TITLE = "Accident Records";
export const ACCIDENTS_SUBTITLE = "Track and manage vehicle accident reports";
export const ACCIDENTS_GRADIENT = "from-slate-900 via-red-900 to-slate-900";

export const ACCIDENTS_DATA = [
  {
    id: 1,
    employeeId: "EMP-001",
    employeeName: "John Smith",
    vehiclePlate: "ABC-1234",
    accidentDate: "2024-01-15",
    accidentTime: "14:30",
    location: "Highway 101, Mile 42",
    severity: "Minor",
    description:
      "Rear-end collision at low speed. Minor bumper damage. No injuries.",
    damageEstimate: "$1,500",
    insuranceClaim: "CLM-2024-001",
    status: "resolved",
    atFault: false,
    injuries: "None",
  },
  {
    id: 2,
    employeeId: "EMP-002",
    employeeName: "Sarah Johnson",
    vehiclePlate: "XYZ-5678",
    accidentDate: "2024-02-20",
    accidentTime: "08:15",
    location: "Downtown Intersection",
    severity: "Moderate",
    description:
      "Side collision with another vehicle. Door and fender damage. Minor injury to driver.",
    damageEstimate: "$4,200",
    insuranceClaim: "CLM-2024-002",
    status: "under_review",
    atFault: true,
    injuries: "Minor bruising",
  },
  {
    id: 3,
    employeeId: "EMP-003",
    employeeName: "Mike Davis",
    vehiclePlate: "DEF-9012",
    accidentDate: "2023-11-05",
    accidentTime: "19:45",
    location: "Industrial Park Road",
    severity: "Major",
    description:
      "Vehicle hit a stationary object. Front-end damage. Vehicle towed.",
    damageEstimate: "$8,500",
    insuranceClaim: "CLM-2023-089",
    status: "pending_payment",
    atFault: true,
    injuries: "Whiplash",
  },
];

export const createAccidentStats = (data) => [
  {
    label: "Total Accidents",
    value: data.length,
    icon: AlertOctagon,
    variant: "primary",
  },
  {
    label: "Pending Claims",
    value: data.filter((a) => a.status !== "resolved").length,
    icon: Clock,
    variant: "warning",
  },
  {
    label: "Total Damage",
    value: "$14,200",
    icon: DollarSign,
    variant: "danger",
  },
  {
    label: "At Fault",
    value: data.filter((a) => a.atFault).length,
    icon: Car,
    variant: "default",
  },
];

export const ACCIDENT_COLUMNS = [
  { header: "Employee", accessor: "employeeName" },
  { header: "Vehicle", accessor: "vehiclePlate" },
  {
    header: "Date/Time",
    accessor: "accidentDate",
    render: (row) => (
      <div className="text-xs">
        <div>{new Date(row.accidentDate).toLocaleDateString()}</div>
        <div className="text-gray-500">{row.accidentTime}</div>
      </div>
    ),
  },
  {
    header: "Severity",
    accessor: "severity",
    render: (row) => (
      <span
        className={`px-2 py-0.5 text-xs font-bold rounded uppercase ${
          row.severity === "Minor"
            ? "bg-green-100 text-green-700"
            : row.severity === "Moderate"
              ? "bg-yellow-100 text-yellow-700"
              : "bg-red-100 text-red-700"
        }`}
      >
        {row.severity}
      </span>
    ),
  },
  { header: "Damage", accessor: "damageEstimate" },
  {
    header: "At Fault",
    accessor: "atFault",
    render: (row) => (
      <span
        className={row.atFault ? "text-red-500 font-bold" : "text-green-500"}
      >
        {row.atFault ? "Yes" : "No"}
      </span>
    ),
  },
  {
    header: "Status",
    accessor: "status",
    render: (row) => {
      const s = row.status
        .split("_")
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(" ");
      return <StatusBadge status={s} />;
    },
  },
];
