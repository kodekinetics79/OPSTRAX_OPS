import { DynamicTable, StatusBadge, CustomInput, PremiumHeader, StatsCard, Modal } from "@/components";
import { Globe, Package, AlertOctagon } from "lucide-react";
import { PORTAL_BOOKINGS } from "./portal.data";
import { useState } from "react";

const PortalBookings = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stats = [
    { label: "New Bookings", value: PORTAL_BOOKINGS.length, icon: Package, variant: "primary" },
    { label: "Pending Review", value: PORTAL_BOOKINGS.filter((b) => b.status === "Pending").length, icon: AlertOctagon, variant: "warning" },
  ];

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput label="Customer" placeholder="Select Customer" />
      <CustomInput type="date" label="Pickup Date" />
      <CustomInput label="Origin" placeholder="City / Zip" />
      <CustomInput label="Destination" placeholder="City / Zip" />
      <div className="md:col-span-2">
        <CustomInput label="Cargo Details" placeholder="Description of goods..." />
      </div>
    </div>
  );

  const columns = [
    { header: "Booking Ref", accessor: "id", render: (row) => <span className="font-mono text-blue-600 font-medium">{row.id}</span> },
    { header: "Customer", accessor: "customer" },
    { header: "Date", accessor: "date" },
    { header: "Lane", accessor: "lane", render: (row) => <span>{row.origin} → {row.dest}</span> },
    { header: "Cargo", accessor: "items" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader
        icon={Globe}
        title="Portal Bookings"
        subtitle="Orders placed via customer portal"
        gradient="from-indigo-900 via-sky-900 to-slate-900"
        onAddClick={() => setIsModalOpen(true)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>

      <DynamicTable data={PORTAL_BOOKINGS} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Manual Booking" subtitle="Enter details below" icon={Globe} size="lg">
        {modalContent}
      </Modal>
    </div>
  );
};

export default PortalBookings;
