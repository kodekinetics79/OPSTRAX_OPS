import { DynamicTable, StatusBadge, CustomInput, PremiumHeader, StatsCard, Modal } from "@/components";
import { Fuel, DollarSign } from "lucide-react";
import { FUEL_TRANSACTIONS } from "./financials.data";
import { useState } from "react";

const FuelTransactions = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stats = [
    { label: "Total Transactions", value: FUEL_TRANSACTIONS.length, icon: Fuel, variant: "primary" },
    { label: "Total Spent", value: "$45.2k", icon: DollarSign, variant: "danger" },
  ];

  const columns = [
    { header: "Txn ID", accessor: "id", render: (row) => <span className="font-mono text-xs">{row.id}</span> },
    { header: "Date", accessor: "date" },
    { header: "Vehicle", accessor: "vehicle" },
    { header: "Driver", accessor: "driver" },
    { header: "Station / Location", accessor: "location" },
    { header: "Quantity", accessor: "liters" },
    { header: "Amount", accessor: "amount", render: (row) => <span className="font-bold">{row.amount}</span> },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader
        icon={Fuel}
        title="Fuel Transactions"
        subtitle="Fuel card and cash logs"
        gradient="from-emerald-900 via-teal-900 to-slate-900"
        onAddClick={() => setIsModalOpen(true)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>

      <DynamicTable data={FUEL_TRANSACTIONS} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Fuel Transaction" subtitle="Enter details below" icon={Fuel} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput label="Vehicle" placeholder="Select Vehicle" />
          <CustomInput label="Driver" placeholder="Select Driver" />
          <CustomInput type="date" label="Date" />
          <CustomInput label="Station" placeholder="Shell - Highway 1" />
          <CustomInput label="Liters" placeholder="0.00" />
          <CustomInput label="Amount ($)" placeholder="0.00" />
        </div>
      </Modal>
    </div>
  );
};

export default FuelTransactions;
