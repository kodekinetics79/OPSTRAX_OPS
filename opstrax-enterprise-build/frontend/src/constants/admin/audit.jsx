import { FileText, Shield } from "lucide-react";

export const AUDIT_TITLE = "Audit Logs";
export const AUDIT_SUBTITLE = "Security and activity tracking";
export const AUDIT_GRADIENT = "from-slate-900 via-gray-900 to-fade";

export const AUDIT_COLUMNS = [
  {
    header: "Log ID",
    accessor: "id",
    render: (row) => <span className="font-mono text-xs">{row.id}</span>,
  },
  { header: "User", accessor: "user" },
  { header: "Action", accessor: "action" },
  { header: "Timestamp", accessor: "date" },
  {
    header: "IP Address",
    accessor: "ip",
    render: (row) => (
      <span className="font-mono text-xs text-gray-400">{row.ip}</span>
    ),
  },
];

export const createAuditStats = (data) => [
  {
    label: "Total Logs",
    value: data.length,
    icon: FileText,
    variant: "default",
  },
  { label: "Security Events", value: "0", icon: Shield, variant: "success" },
];
