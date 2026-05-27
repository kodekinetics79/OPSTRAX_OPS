
import React, { useState } from "react";
import DynamicTable from "@/components/common/DynamicTable";
import { Shield, CheckCircle, AlertCircle, Plus } from "lucide-react";
import CustomInput from "@/components/common/CustomInput";
import { PremiumHeader, StatsCard, Modal } from "@/components";
import { INSURANCE_DATA, INSURANCE_COLUMNS, INSURANCE_GRADIENT, INSURANCE_TITLE, INSURANCE_SUBTITLE, createInsuranceStats } from "@/constants/admin/drive/insurance";

const data = INSURANCE_DATA;

const Insurance = () => {
  const stats = createInsuranceStats(data);

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput label="Policy Number" placeholder="INS-..." />
      <CustomInput label="Provider" placeholder="Geico" />
      <CustomInput
        type="select"
        label="Type"
        options={[{ value: "comp", label: "Comprehensive" }]}
      />
      <CustomInput label="Vehicle Plate" placeholder="ABC-1234" />
      <CustomInput type="date" label="Start Date" />
      <CustomInput type="date" label="End Date" />
      <CustomInput label="Premium ($)" placeholder="1000/year" />
    </div>
  );

  const columns = INSURANCE_COLUMNS;

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={Shield} title={INSURANCE_TITLE} subtitle={INSURANCE_SUBTITLE} gradient="from-blue-900/40 via-gray-900 to-fade" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={data} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Policy" subtitle="Enter details" icon={Shield}>
        {modalContent}
      </Modal>
    </div>
  );
};

export default Insurance;
