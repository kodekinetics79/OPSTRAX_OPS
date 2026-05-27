import { DynamicTable, StatusBadge, CustomInput, PremiumHeader, StatsCard, Modal } from "@/components";
import { Tag, Layers } from "lucide-react";
import { STATUS_CODES } from "./masterData.data";
import { useState } from "react";

const StatusCodes = () => {
  const stats = [
    { label: "Defined Codes", value: STATUS_CODES.length, icon: Tag, variant: "info" },
    { label: "Categories", value: "4", icon: Layers, variant: "default" },
  ];

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput label="Code" placeholder="STS-001" />
      <CustomInput label="Label" placeholder="Active" />
      <CustomInput label="Category" placeholder="General" />
      <CustomInput label="Color Hex" placeholder="#000000" />
    </div>
  );

  const columns = [
    { header: "Code", accessor: "code", render: (row) => <span className="font-mono text-sm font-bold">{row.code}</span> },
    { header: "Label", accessor: "label" },
    { header: "Category", accessor: "category" },
    { header: "Color", accessor: "color" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={Tag} title="Status Codes" subtitle="System-wide status definitions" gradient="from-slate-900 via-gray-800 to-slate-900" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={STATUS_CODES} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Define Status Code" subtitle="Enter details below" icon={Tag}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default StatusCodes;
