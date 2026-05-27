
import React, { useState } from "react";
import DynamicTable from "@/components/common/DynamicTable";
import StatusBadge from "@/components/common/StatusBadge";
import { Heart, CheckCircle, Award, Users } from "lucide-react";
import CustomInput from "@/components/common/CustomInput";
import { PremiumHeader, StatsCard, Modal } from "@/components";

const mockMedicalInsuranceData = [
  {
    id: 1,
    employeeId: "EMP-001",
    employeeName: "John Smith",
    policyNumber: "MED-2024-001",
    insuranceCompany: "Blue Cross Blue Shield",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    grade: "Gold",
    dependents: 3,
    status: "active",
  },
  {
    id: 2,
    employeeId: "EMP-002",
    employeeName: "Sarah Johnson",
    policyNumber: "MED-2024-002",
    insuranceCompany: "Aetna",
    startDate: "2024-02-15",
    endDate: "2025-02-14",
    grade: "Platinum",
    dependents: 2,
    status: "active",
  },
  {
    id: 3,
    employeeId: "EMP-003",
    employeeName: "Mike Davis",
    policyNumber: "MED-2023-089",
    insuranceCompany: "Cigna",
    startDate: "2023-04-01",
    endDate: "2024-03-31",
    grade: "Silver",
    dependents: 0,
    status: "expired",
  },
  {
    id: 4,
    employeeId: "EMP-004",
    employeeName: "Emily Brown",
    policyNumber: "MED-2024-003",
    insuranceCompany: "United Healthcare",
    startDate: "2024-05-01",
    endDate: "2025-04-30",
    grade: "Bronze",
    dependents: 1,
    status: "active",
  },
];

const MedicalInsurance = () => {
  const stats = [
    {
      label: "Covered Employees",
      value: mockMedicalInsuranceData.length,
      icon: Users,
      variant: "primary",
    },
    {
      label: "Active Plans",
      value: mockMedicalInsuranceData.filter((i) => i.status === "active")
        .length,
      icon: CheckCircle,
      variant: "success",
    },
    {
      label: "Dependents",
      value: mockMedicalInsuranceData.reduce((sum, i) => sum + i.dependents, 0),
      icon: Award,
      variant: "info",
    },
  ];

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput label="Employee" placeholder="Select Employee" />
      <CustomInput label="Policy #" placeholder="MED-..." />
      <CustomInput label="Provider" placeholder="Blue Cross" />
      <CustomInput
        type="select"
        label="Plan Grade"
        options={[{ value: "gold", label: "Gold" }]}
      />
      <CustomInput type="date" label="Start Date" />
      <CustomInput type="date" label="End Date" />
      <CustomInput type="number" label="Dependents" placeholder="0" />
    </div>
  );

  const columns = [
    { header: "Employee", accessor: "employeeName" },
    { header: "Policy #", accessor: "policyNumber" },
    { header: "Provider", accessor: "insuranceCompany" },
    {
      header: "Grade",
      accessor: "grade",
      render: (row) => (
        <span
          className={`px-2 py-0.5 rounded text-xs font-bold ${row.grade === "Platinum" ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20" : "bg-white/10 text-gray-300 border border-white/10"}`}
        >
          {row.grade}
        </span>
      ),
    },
    { header: "Dependents", accessor: "dependents" },
    {
      header: "Validity",
      accessor: "endDate",
      render: (row) => (
        <div className="text-xs">
          <div className="text-gray-200">{new Date(row.startDate).toLocaleDateString()}</div>
          <div className="text-gray-500">
            to {new Date(row.endDate).toLocaleDateString()}
          </div>
        </div>
      ),
    },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={Heart} title="Medical Insurance" subtitle="Employee health coverage plans" gradient="from-pink-900/40 via-gray-900 to-fade" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={mockMedicalInsuranceData} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Enrol Insurance" subtitle="Enter details" icon={Heart}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default MedicalInsurance;
