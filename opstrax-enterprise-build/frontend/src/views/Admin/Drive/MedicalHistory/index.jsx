
import React, { useState } from "react";
import DynamicTable from "@/components/common/DynamicTable";
import StatusBadge from "@/components/common/StatusBadge";
import { Stethoscope, CheckCircle, Clock, FileText } from "lucide-react";
import CustomInput from "@/components/common/CustomInput";
import { PremiumHeader, StatsCard, Modal } from "@/components";

const mockMedicalHistoryData = [
  {
    id: 1,
    employeeId: "EMP-001",
    employeeName: "John Smith",
    examDate: "2024-01-15",
    examType: "Annual Checkup",
    physician: "Dr. Robert Wilson",
    bloodPressure: "120/80",
    result: "Fit for duty",
    nextExamDate: "2025-01-15",
    notes: "All vitals normal. Recommended regular exercise.",
    status: "passed",
  },
  {
    id: 2,
    employeeId: "EMP-002",
    employeeName: "Sarah Johnson",
    examDate: "2024-02-20",
    examType: "Vision Test",
    physician: "Dr. Emily Chen",
    bloodPressure: "118/75",
    result: "Fit with correction",
    nextExamDate: "2025-02-20",
    notes: "Requires corrective lenses for driving.",
    status: "conditional",
  },
  {
    id: 3,
    employeeId: "EMP-003",
    employeeName: "Mike Davis",
    examDate: "2023-11-10",
    examType: "Annual Checkup",
    physician: "Dr. Robert Wilson",
    bloodPressure: "145/95",
    result: "Requires follow-up",
    nextExamDate: "2024-02-10",
    notes: "High blood pressure detected. Needs medication review.",
    status: "pending",
  },
  {
    id: 4,
    employeeId: "EMP-004",
    employeeName: "Emily Brown",
    examDate: "2024-03-05",
    examType: "Drug Test",
    physician: "Dr. James Miller",
    bloodPressure: "115/72",
    result: "Clear",
    nextExamDate: "2024-09-05",
    notes: "Random drug screening - all clear.",
    status: "passed",
  },
];

const MedicalHistory = () => {
  const stats = [
    {
      label: "Total Exams",
      value: mockMedicalHistoryData.length,
      icon: FileText,
      variant: "primary",
    },
    {
      label: "Passed",
      value: mockMedicalHistoryData.filter((m) => m.status === "passed").length,
      icon: CheckCircle,
      variant: "success",
    },
    {
      label: "Pending",
      value: mockMedicalHistoryData.filter((m) => m.status === "pending")
        .length,
      icon: Clock,
      variant: "warning",
    },
  ];

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput label="Employee" placeholder="Select Employee" />
      <CustomInput type="date" label="Exam Date" />
      <CustomInput
        type="select"
        label="Exam Type"
        options={[{ value: "annual", label: "Annual Physical" }]}
      />
      <CustomInput label="Physician" placeholder="Dr. Name" />
      <CustomInput label="Result" placeholder="Fit for duty" />
      <CustomInput type="date" label="Next Due" />
      <div className="md:col-span-2">
        <CustomInput label="Notes" placeholder="Medical notes..." />
      </div>
    </div>
  );

  const columns = [
    { header: "Employee", accessor: "employeeName" },
    { header: "Date", accessor: "examDate" },
    { header: "Type", accessor: "examType" },
    { header: "Physician", accessor: "physician" },
    { header: "Result", accessor: "result", render: (row) => <span className="text-gray-300">{row.result}</span> },
    {
      header: "Status",
      accessor: "status",
      render: (row) => (
        <StatusBadge
          status={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
        />
      ),
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={Stethoscope} title="Medical History" subtitle="Driver health records and exams" gradient="from-cyan-900/40 via-gray-900 to-fade" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={mockMedicalHistoryData} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Log Medical Exam" subtitle="Enter details" icon={Stethoscope}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default MedicalHistory;
