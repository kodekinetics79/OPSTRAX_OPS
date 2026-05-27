import { DynamicTable, StatusBadge, CustomInput, PremiumHeader, StatsCard, CarrierModal } from "@/components";
import { Truck, Star } from "lucide-react";
import { CARRIERS } from "./carriers.data";
import { useState } from "react";

const CarrierList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stats = [
    { label: "Total Carriers", value: CARRIERS.length, icon: Truck, variant: "primary" },
    { label: "Top Rated", value: CARRIERS.filter((c) => c.rating > 4.5).length, icon: Star, variant: "warning" },
  ];

  const columns = [
    { header: "Carrier Name", accessor: "name", render: (row) => <span className="font-bold text-white">{row.name}</span> },
    { header: "Region", accessor: "region" },
    { header: "Type", accessor: "type" },
    { header: "Rating", accessor: "rating", render: (row) => <span className="text-primary font-bold">★ {row.rating}</span> },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader
        icon={Truck}
        title="Carrier Network"
        subtitle="External logistics partners"
        gradient="from-indigo-900 via-blue-900 to-slate-900"
        onAddClick={() => setIsModalOpen(true)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} className="bg-card-dark border-white/5" />
        ))}
      </div>

      <DynamicTable data={CARRIERS} columns={columns} />

      <CarrierModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default CarrierList;
