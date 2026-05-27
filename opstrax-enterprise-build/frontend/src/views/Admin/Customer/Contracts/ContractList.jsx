
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MOCK_CUSTOMERS } from '@/data/mock/customers';
import GradeBadge from '@/components/common/GradeBadge';
import { FileText, CheckCircle, Clock } from 'lucide-react';
import DynamicTable from "@/components/common/DynamicTable";
import CustomInput from '@/components/common/CustomInput';
import { PremiumHeader, StatsCard, Modal } from '@/components';
import { useState } from 'react';

const ContractList = () => {
  const navigate = useNavigate();

  // Flatten contracts for list view
  const allContracts = MOCK_CUSTOMERS.flatMap(c => 
    c.contracts.map(con => ({
        ...con,
        customerName: c.company_name,
        currency: c.currency
    }))
  );

  const stats = [
      { label: "Active Contracts", value: allContracts.length, icon: FileText, variant: "primary" },
      { label: "Expiring Soon", value: "3", icon: Clock, variant: "warning" }
  ];

  const modalContent = (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
           <CustomInput label="Contract Title" placeholder="Annual Service Agreement" />
           <CustomInput label="Customer" placeholder="Select Customer" />
           <CustomInput type="date" label="Start Date" />
           <CustomInput type="date" label="End Date" />
           <CustomInput type="select" label="Grade" options={[{value:'gold', label:'Gold'}]} />
      </div>
  );

  const columns = [
      { header: "Contract Title", accessor: "title", render: (row) => (
          <div>
              <p className="font-semibold text-white">{row.title}</p>
              <p className="text-xs text-gray-400 font-mono">{row.id}</p>
          </div>
      )},
      { header: "Customer", accessor: "customerName" },
      { header: "Grade", accessor: "grade", render: (row) => <GradeBadge grade={row.grade} /> },
      { header: "Load Type", accessor: "load_type" },
      { header: "Validity", accessor: "validity", render: (row) => (
          <div>
              <span className="block text-gray-200">{row.period.start}</span>
              <span className="text-xs text-gray-500">to {row.period.end}</span>
          </div>
      )},
      { header: "Resources", accessor: "resources", render: (row) => (
          <span className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs font-medium border border-blue-500/20">
              {row.vehicle_requirements?.reduce((acc, curr) => acc + curr.count, 0) || 0} Veh
          </span>
      )},
      { header: "Actions", accessor: "actions", render: (row) => (
          <button 
              onClick={(e) => { e.stopPropagation(); navigate(`/admin/customers/contracts/${row.id}`); }}
              className="text-primary hover:text-primary-foreground text-xs font-medium border border-primary/20 px-3 py-1.5 rounded-lg bg-primary/10 hover:bg-primary hover:border-primary transition-all duration-200"
          >
              View
          </button>
      )}
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={FileText} title="Contract Management" subtitle="Active agreements, rates, and vehicle commitments" gradient="from-slate-800 via-gray-900 to-fade" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={allContracts} columns={columns} placeholder="Search contracts..." />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Contract" subtitle="Enter contract details" icon={FileText} size="lg">
        {modalContent}
      </Modal>
    </div>
  );
};

export default ContractList;
