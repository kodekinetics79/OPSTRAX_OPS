
import React, { useState } from "react";
import DynamicTable from "@/components/common/DynamicTable";
import StatusBadge from "@/components/common/StatusBadge";
import { AlertTriangle, DollarSign, Clock, Target, Plus } from "lucide-react";
import CustomInput from "@/components/common/CustomInput";
import { PremiumHeader, StatsCard, Modal } from "@/components";

const mockViolationsData = [
  {
    id: 1,
    employeeId: "EMP-001",
    employeeName: "John Smith",
    vehiclePlate: "ABC-1234",
    violationType: "Speeding",
    violationDate: "2024-01-20",
    location: "Highway 101, Mile 25",
    fineAmount: "$150",
    points: 2,
    status: "paid",
  },
  {
    id: 2,
    employeeId: "EMP-002",
    employeeName: "Sarah Johnson",
    vehiclePlate: "XYZ-5678",
    violationType: "Red Light",
    violationDate: "2024-02-15",
    location: "Main St & 5th Ave",
    fineAmount: "$300",
    points: 3,
    status: "pending",
  },
  {
    id: 3,
    employeeId: "EMP-003",
    employeeName: "Mike Davis",
    vehiclePlate: "DEF-9012",
    violationType: "Illegal Parking",
    violationDate: "2024-03-01",
    location: "Downtown Plaza",
    fineAmount: "$75",
    points: 0,
    status: "disputed",
  },
  {
    id: 4,
    employeeId: "EMP-001",
    employeeName: "John Smith",
    vehiclePlate: "ABC-1234",
    violationType: "No Seatbelt",
    violationDate: "2023-11-10",
    location: "Industrial Area",
    fineAmount: "$100",
    points: 1,
    status: "paid",
  },
];

const TrafficViolations = () => {
  const stats = [
    {
      label: "Total Violations",
      value: mockViolationsData.length,
      icon: AlertTriangle,
      variant: "primary",
    },
    {
      label: "Pending Fines",
      value: mockViolationsData.filter((v) => v.status === "pending").length,
      icon: Clock,
      variant: "warning",
    },
    {
      label: "Total Fines",
      value: "$625",
      icon: DollarSign,
      variant: "danger",
    },
    { label: "Total Points", value: "6", icon: Target, variant: "default" },
  ];

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput label="Employee" placeholder="Select Employee" />
      <CustomInput label="Vehicle Plate" placeholder="ABC-1234" />
      <CustomInput
        type="select"
        label="Violation Type"
        options={[{ value: "speeding", label: "Speeding" }]}
      />
      <CustomInput type="date" label="Date" />
      <CustomInput label="Location" placeholder="Location details" />
      <CustomInput label="Fine Amount ($)" placeholder="0.00" />
      <CustomInput type="number" label="Points" placeholder="0" />
    </div>
  );

  const columns = [
    { header: "Employee", accessor: "employeeName" },
    { header: "Vehicle", accessor: "vehiclePlate" },
    { header: "Violation", accessor: "violationType" },
    { header: "Date", accessor: "violationDate" },
    { header: "Location", accessor: "location" },
    { header: "Fine", accessor: "fineAmount" },
    {
      header: "Points",
      accessor: "points",
      render: (row) => (
        <span
          className={
            row.points > 0 ? "text-red-400 font-bold" : "text-emerald-400"
          }
        >
          {row.points}
        </span>
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
      <PremiumHeader icon={AlertTriangle} title="Traffic Violations" subtitle="Track driver traffic violations and fines" gradient="from-orange-900/40 via-red-900/40 to-fade" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={mockViolationsData} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Record Violation" subtitle="Enter details below" icon={AlertTriangle}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default TrafficViolations;
