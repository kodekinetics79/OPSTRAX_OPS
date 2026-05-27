
import { DynamicTable, StatusBadge, CustomInput, PremiumHeader, StatsCard, Modal } from "@/components";
import { AlertOctagon, ShieldAlert } from "lucide-react";
import { EXCEPTIONS } from "./controlTower.data";
import { useState } from "react";

const ExceptionInbox = () => {
  const stats = [
    { label: "Active Exceptions", value: EXCEPTIONS.length, icon: AlertOctagon, variant: "danger" },
    { label: "Critical", value: EXCEPTIONS.filter((e) => e.severity === "High").length, icon: ShieldAlert, variant: "warning" },
  ];

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput label="Type" placeholder="Delay / Breakdown" />
      <CustomInput type="select" label="Severity" options={[{ value: "high", label: "High" }]} />
      <div className="md:col-span-2">
        <CustomInput type="textarea" label="Description" placeholder="Exception details..." />
      </div>
    </div>
  );

  const columns = [
    { header: "Exception ID", accessor: "id", render: (row) => <span className="font-mono text-red-400 font-bold">{row.id}</span> },
    { header: "Type", accessor: "type" },
    { header: "Description", accessor: "description" },
    { header: "Severity", accessor: "severity", render: (row) => <span className="px-2 py-0.5 rounded text-xs font-bold bg-red-500/10 text-red-400 border border-red-500/20 uppercase">{row.severity}</span> },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={AlertOctagon} title="Exception Inbox" subtitle="Operational alerts and issues" gradient="from-red-900/50 via-stone-900 to-slate-900" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={EXCEPTIONS} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Exception" subtitle="Enter details below" icon={AlertOctagon}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default ExceptionInbox;
