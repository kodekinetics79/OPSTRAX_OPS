import { DynamicTable, StatusBadge, CustomInput, PremiumHeader, StatsCard, Modal } from "@/components";
import { Wallet, TrendingDown } from "lucide-react";
import { EXPENSES } from "./financials.data";
import { useState } from "react";

const ExpenseTracking = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stats = [
    { label: "Total Expenses", value: EXPENSES.length, icon: Wallet, variant: "warning" },
    { label: "This Month", value: "$12.4k", icon: TrendingDown, variant: "danger" },
  ];

  const columns = [
    { header: "Expense ID", accessor: "id", render: (row) => <span className="font-mono text-xs">{row.id}</span> },
    { header: "Date", accessor: "date" },
    { header: "Category", accessor: "category" },
    { header: "Description", accessor: "description" },
    { header: "Amount", accessor: "amount", render: (row) => <span className="font-bold text-red-600">-{row.amount}</span> },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader
        icon={Wallet}
        title="Expense Tracking"
        subtitle="Tolls, fines, and operational costs"
        gradient="from-slate-900 via-rose-900 to-slate-900"
        onAddClick={() => setIsModalOpen(true)}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>

      <DynamicTable data={EXPENSES} columns={columns} />

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Expense" subtitle="Enter details below" icon={Wallet} size="lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <CustomInput type="select" label="Category" options={[{ value: "toll", label: "Toll" }]} />
          <CustomInput type="date" label="Date" />
          <CustomInput label="Amount ($)" placeholder="0.00" />
          <div className="md:col-span-2">
            <CustomInput label="Description" placeholder="Expense details..." />
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ExpenseTracking;
