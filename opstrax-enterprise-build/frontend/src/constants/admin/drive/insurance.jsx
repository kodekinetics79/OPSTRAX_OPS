import { Shield, CheckCircle, AlertCircle } from "lucide-react";
import { StatusBadge } from "@/components";

export const INSURANCE_TITLE = "Vehicle Insurance";
export const INSURANCE_SUBTITLE =
  "Manage vehicle insurance policies and validity";
export const INSURANCE_GRADIENT = "from-emerald-900 via-teal-900 to-slate-900";

export const INSURANCE_DATA = [
  {
    id: 1,
    policyNumber: "INS-2024-001",
    provider: "State Farm Insurance",
    type: "Comprehensive",
    startDate: "2024-01-01",
    endDate: "2025-01-01",
    premium: "$1,200/year",
    status: "active",
    vehiclePlate: "ABC-1234",
  },
  {
    id: 2,
    policyNumber: "INS-2024-002",
    provider: "Allstate Insurance",
    type: "Third Party",
    startDate: "2024-03-15",
    endDate: "2025-03-15",
    premium: "$800/year",
    status: "active",
    vehiclePlate: "XYZ-5678",
  },
  {
    id: 3,
    policyNumber: "INS-2023-045",
    provider: "Progressive",
    type: "Comprehensive",
    startDate: "2023-06-01",
    endDate: "2024-06-01",
    premium: "$950/year",
    status: "expired",
    vehiclePlate: "DEF-9012",
  },
];

export const createInsuranceStats = (data) => [
  {
    label: "Total Policies",
    value: data.length,
    icon: Shield,
    variant: "primary",
  },
  {
    label: "Active",
    value: data.filter((i) => i.status === "active").length,
    icon: CheckCircle,
    variant: "success",
  },
  {
    label: "Expired",
    value: data.filter((i) => i.status === "expired").length,
    icon: AlertCircle,
    variant: "danger",
  },
];

export const INSURANCE_COLUMNS = [
  { header: "Policy #", accessor: "policyNumber" },
  { header: "Provider", accessor: "provider" },
  { header: "Type", accessor: "type" },
  { header: "Vehicle", accessor: "vehiclePlate" },
  {
    header: "Validity",
    accessor: "endDate",
    render: (row) => (
      <div className="text-xs">
        <div>{new Date(row.startDate).toLocaleDateString()}</div>
        <div className="text-gray-500">
          to {new Date(row.endDate).toLocaleDateString()}
        </div>
      </div>
    ),
  },
  { header: "Premium", accessor: "premium" },
  {
    header: "Status",
    accessor: "status",
    render: (row) => <StatusBadge status={row.status} />,
  },
];
