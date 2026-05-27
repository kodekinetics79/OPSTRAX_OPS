import { DynamicTable, StatusBadge, CustomInput, PremiumHeader, StatsCard, Modal } from "@/components";
import { ClipboardList, CheckCircle, AlertTriangle } from "lucide-react";
import { DISPATCH_PLANS } from "./dispatch.data";
import { useState } from "react";

const DispatchPlans = () => {
  const stats = [
    { label: "Active Plans", value: DISPATCH_PLANS.length, icon: ClipboardList, variant: "primary" },
    { label: "Completed", value: DISPATCH_PLANS.filter((p) => p.status === "Compliant" || p.status === "Published").length, icon: CheckCircle, variant: "success" },
    { label: "Pending", value: "2", icon: AlertTriangle, variant: "warning" },
  ];

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput type="date" label="Plan Date" />
      <CustomInput type="select" label="Region" options={[{ value: "north", label: "North" }]} />
      <div className="md:col-span-2">
        <CustomInput label="Notes" placeholder=" dispatch notes..." />
      </div>
    </div>
  );

  const columns = [
    { header: "Plan ID", accessor: "id", render: (row) => <span className="font-mono text-xs">{row.id}</span> },
    { header: "Date", accessor: "date" },
    { header: "Region", accessor: "region" },
    { header: "Orders", accessor: "orders" },
    { header: "Vehicles", accessor: "vehicles" },
    { header: "Efficiency", accessor: "efficiency", render: (row) => <span className="text-green-600 font-bold">{row.efficiency}</span> },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={ClipboardList} title="Dispatch Plans" subtitle="Daily batch planning" gradient="from-blue-900 via-blue-800 to-indigo-900" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={DISPATCH_PLANS} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Dispatch Plan" subtitle="Enter details below" icon={ClipboardList} size="lg">
        {modalContent}
      </Modal>
    </div>
  );
};

export default DispatchPlans;
