import { DynamicTable, StatusBadge, CustomInput, PremiumHeader, StatsCard, Modal } from "@/components";
import { FileCheck, Globe } from "lucide-react";
import { CARRIER_RATES } from "./carriers.data";
import { useState } from "react";

const CarrierRateCards = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stats = [
    { label: "Active Rates", value: CARRIER_RATES.length, icon: FileCheck, variant: "info" },
    { label: "Routes Covered", value: "12", icon: Globe, variant: "success" },
  ];

  const columns = [
    { header: "Rate ID", accessor: "id", render: (row) => <span className="font-mono text-xs text-soft-gray">{row.id}</span> },
    { header: "Carrier", accessor: "carrier" },
    { header: "Origin", accessor: "origin" },
    { header: "Destination", accessor: "dest" },
    { header: "Vehicle Type", accessor: "vehicle" },
    { header: "Rate", accessor: "rate", render: (row) => <span className="font-bold text-white">{row.rate}</span> },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader
        icon={FileCheck}
        title="Carrier Rates"
        subtitle="Negotiated buying rates"
        onAddClick={() => setIsModalOpen(true)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} className="bg-card-dark border-white/5" />
        ))}
      </div>

      <DynamicTable data={CARRIER_RATES} columns={columns} />

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Rate Card"
        subtitle="Enter details below"
        icon={FileCheck}
        size="lg"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput label="Carrier" placeholder="Select Carrier" />
          <CustomInput label="Origin" placeholder="City A" />
          <CustomInput label="Destination" placeholder="City B" />
          <CustomInput label="Rate ($)" placeholder="1000" />
        </div>
      </Modal>
    </div>
  );
};

export default CarrierRateCards;
