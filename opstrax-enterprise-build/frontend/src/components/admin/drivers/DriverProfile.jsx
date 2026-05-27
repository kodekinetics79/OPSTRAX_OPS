
import { DynamicTable, StatusBadge, PremiumHeader, StatsCard, Modal } from "@/components";
import { Clock, ShieldCheck } from "lucide-react";
import { HOS_LOGS } from "./drivers.data";
import { useState } from "react";

const DriverProfile = () => {
  const stats = [
    { label: "Violations Today", value: "0", icon: ShieldCheck, variant: "success" },
    { label: "Near Limit", value: "3", icon: Clock, variant: "warning" },
  ];

  const columns = [
    { header: "Log ID", accessor: "id", render: (row) => <span className="font-mono text-xs text-gray-500">{row.id}</span> },
    { header: "Driver", accessor: "driver" },
    { header: "Date", accessor: "date" },
    { header: "Driving", accessor: "driving", render: (row) => <span className={row.driving > 10 ? "text-red-400 font-bold" : "text-gray-300"}>{row.driving}h</span> },
    { header: "On Duty", accessor: "on_duty" },
    { header: "Cycle Left", accessor: "cycle_left" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={Clock} title="HOS Compliance" subtitle="Hours of Service logs and monitoring" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={HOS_LOGS} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Entry" subtitle="Manual Log Entry" icon={Clock}>
        <div>Manual Log Entry Form</div>
      </Modal>
    </div>
  );
};

export default DriverProfile;
