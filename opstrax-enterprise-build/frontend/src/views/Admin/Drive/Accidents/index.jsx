
import React, { useState } from "react";
import DynamicTable from "@/components/common/DynamicTable";
import { AlertOctagon, Car } from "lucide-react";
import CustomInput from "@/components/common/CustomInput";
import { PremiumHeader, StatsCard, Modal } from "@/components";
import { ACCIDENTS_DATA, ACCIDENT_COLUMNS, createAccidentStats, ACCIDENTS_GRADIENT } from "@/constants/admin/drive/accidents";

const data = ACCIDENTS_DATA;

const Accidents = () => {
  const stats = createAccidentStats(data);

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput label="Employee ID" placeholder="EMP-001" />
      <CustomInput label="Vehicle Plate" placeholder="ABC-1234" />
      <CustomInput type="date" label="Date" />
      <CustomInput type="time" label="Time" />
      <CustomInput
        type="select"
        label="Severity"
        options={[
          { value: "minor", label: "Minor" },
          { value: "major", label: "Major" },
        ]}
      />
      <CustomInput label="Location" placeholder="Location details" />
      <CustomInput label="Damage Estimate ($)" placeholder="0.00" />
      <CustomInput
        type="select"
        label="At Fault?"
        options={[
          { value: "yes", label: "Yes" },
          { value: "no", label: "No" },
        ]}
      />
      <div className="md:col-span-2">
        <CustomInput
          type="textarea"
          label="Description"
          placeholder="Accident details..."
          rows={3}
        />
      </div>
    </div>
  );

  const columns = ACCIDENT_COLUMNS;

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={Car} title="Accident Records" subtitle="Track and manage vehicle accident reports" gradient="from-red-900/40 via-gray-900 to-fade" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={data} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Report Accident" subtitle="Enter details" icon={AlertOctagon}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default Accidents;
