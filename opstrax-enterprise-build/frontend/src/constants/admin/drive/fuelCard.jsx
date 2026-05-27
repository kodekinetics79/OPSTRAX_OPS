import { CreditCard, DollarSign, TrendingUp, CheckCircle } from "lucide-react";
import { StatusBadge } from "@/components";

export const FUEL_CARD_TITLE = "Fuel Cards";
export const FUEL_CARD_SUBTITLE =
  "Manage fuel card issuance, limits, and usage";
export const FUEL_CARD_GRADIENT =
  "from-status-success via-status-success/80 to-blue";

export const FUEL_CARD_DATA = [
  {
    id: 1,
    cardNumber: "****-****-****-4521",
    employeeId: "EMP-001",
    employeeName: "John Smith",
    vehiclePlate: "ABC-1234",
    monthlyLimit: "$500",
    usedAmount: "$320.50",
    remainingLimit: "$179.50",
    issueDate: "2024-01-15",
    expiryDate: "2026-01-15",
    status: "active",
  },
  {
    id: 2,
    cardNumber: "****-****-****-7832",
    employeeId: "EMP-002",
    employeeName: "Sarah Johnson",
    vehiclePlate: "XYZ-5678",
    monthlyLimit: "$400",
    usedAmount: "$398.00",
    remainingLimit: "$2.00",
    issueDate: "2024-02-01",
    expiryDate: "2026-02-01",
    status: "active",
  },
  {
    id: 3,
    cardNumber: "****-****-****-2190",
    employeeId: "EMP-003",
    employeeName: "Mike Davis",
    vehiclePlate: "DEF-9012",
    monthlyLimit: "$600",
    usedAmount: "$150.25",
    remainingLimit: "$449.75",
    issueDate: "2023-06-01",
    expiryDate: "2024-06-01",
    status: "expired",
  },
  {
    id: 4,
    cardNumber: "****-****-****-5567",
    employeeId: "EMP-004",
    employeeName: "Emily Brown",
    vehiclePlate: "GHI-3456",
    monthlyLimit: "$350",
    usedAmount: "$0.00",
    remainingLimit: "$350.00",
    issueDate: "2024-05-01",
    expiryDate: "2026-05-01",
    status: "blocked",
  },
];

const parseAmount = (s) => parseFloat(s.replace("$", "").replace(",", ""));

export const createFuelCardStats = (data) => {
  const totalCards = data.length;
  const activeCards = data.filter((c) => c.status === "active").length;
  const totalMonthlyUsage = data
    .filter((c) => c.status === "active")
    .reduce((sum, c) => sum + parseAmount(c.usedAmount), 0);
  const avgPerCard = totalCards ? totalMonthlyUsage / totalCards : 0;

  return [
    {
      label: "Total Cards",
      value: totalCards,
      icon: CreditCard,
      variant: "primary",
    },
    {
      label: "Active Cards",
      value: activeCards,
      icon: CheckCircle,
      variant: "success",
    },
    {
      label: "Monthly Usage",
      value: `$${totalMonthlyUsage.toLocaleString()}`,
      icon: DollarSign,
      variant: "info",
    },
    {
      label: "Avg. per Card",
      value: `$${avgPerCard.toFixed(2)}`,
      icon: TrendingUp,
      variant: "default",
    },
  ];
};

const getStatusVariant = (status) => {
  switch (status) {
    case "active":
      return "success";
    case "expired":
      return "expired";
    case "blocked":
      return "danger";
    default:
      return "neutral";
  }
};

export const FUEL_CARD_COLUMNS = [
  { label: "Card Number", accessor: "cardNumber" },
  { label: "Employee", accessor: "employeeName" },
  { label: "Vehicle Plate", accessor: "vehiclePlate" },
  { label: "Monthly Limit", accessor: "monthlyLimit" },
  { label: "Used Amount", accessor: "usedAmount" },
  { label: "Remaining", accessor: "remainingLimit" },
  {
    label: "Expiry Date",
    renderCell: (row) => (
      <span className="text-xs">
        {new Date(row.expiryDate).toLocaleDateString()}
      </span>
    ),
  },
  {
    label: "Status",
    renderCell: (row) => (
      <StatusBadge
        status={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        variant={getStatusVariant(row.status)}
        size="sm"
        pulse={row.status === "active"}
      />
    ),
  },
];
