import { DynamicTable, StatusBadge, CustomInput, PremiumHeader, StatsCard, Modal } from "@/components";
import { Wrench, TimerOff, ClipboardCheck, AlertCircle } from "lucide-react";
import { WORK_ORDERS } from "./maintenance.data";
import { useState } from "react";

const WorkOrders = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stats = [
    { label: "Open Orders", value: WORK_ORDERS.length, icon: Wrench, variant: "primary" },
    { label: "Overdue", value: "1", icon: AlertCircle, variant: "danger" },
    { label: "Completed (Mo)", value: "15", icon: ClipboardCheck, variant: "success" },
  ];

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput label="Vehicle" placeholder="Select vehicle..." />
      <CustomInput type="select" label="Priority" options={[{ value: "high", label: "High" }]} />
      <CustomInput label="Issue Type" placeholder="Engine / Tire / etc" />
      <CustomInput type="date" label="Due Date" />
      <div className="md:col-span-2">
        <CustomInput type="textarea" label="Description" placeholder="Describe the issue..." />
      </div>
    </div>
  );

  const columns = [
    { header: "WO #", accessor: "id", render: (row) => <span className="font-mono text-sm font-bold text-gray-800">{row.id}</span> },
    { header: "Vehicle", accessor: "vehicle" },
    { header: "Type", accessor: "type" },
    { header: "Description", accessor: "desc" },
    { header: "Due Date", accessor: "due" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader
        icon={Wrench}
        title="Work Orders"
        subtitle="Fleet maintenance and repairs"
        gradient="from-slate-900 via-orange-900 to-slate-900"
        onAddClick={() => setIsModalOpen(true)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>

      <DynamicTable data={WORK_ORDERS} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Work Order" subtitle="Enter details below" icon={Wrench} size="lg">
        {modalContent}
      </Modal>
    </div>
  );
};

export default WorkOrders;
