import { DynamicTable, StatusBadge, CustomInput, PremiumHeader, StatsCard, Modal } from "@/components";
import { MapPin, Globe } from "lucide-react";
import { LOCATIONS } from "./masterData.data";
import { useState } from "react";

const Locations = () => {
  const stats = [
    { label: "Total Locations", value: LOCATIONS.length, icon: MapPin, variant: "primary" },
    { label: "Geofenced", value: LOCATIONS.filter((l) => l.geofence === "Active").length, icon: Globe, variant: "success" },
  ];

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput label="Location Name" placeholder="Warehouse A" />
      <CustomInput label="Address" placeholder="123 Main St" />
      <CustomInput label="City" placeholder="New York" />
      <CustomInput type="select" label="Type" options={[{ value: "warehouse", label: "Warehouse" }]} />
    </div>
  );

  const columns = [
    { header: "Location ID", accessor: "id", render: (row) => <span className="font-mono text-xs">{row.id}</span> },
    { header: "Name", accessor: "name", render: (row) => <span className="font-semibold">{row.name}</span> },
    { header: "City", accessor: "city" },
    { header: "Type", accessor: "type" },
    { header: "Geofence Status", accessor: "geofence", render: (row) => <span className="text-xs bg-gray-100 px-2 py-0.5 rounded text-gray-600">{row.geofence}</span> },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={MapPin} title="Location Master" subtitle="Geofences and points of interest" gradient="from-slate-800 via-slate-700 to-slate-900" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={LOCATIONS} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Location" subtitle="Enter details below" icon={MapPin}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default Locations;
