
import { DynamicTable, PremiumHeader, StatsCard, Modal } from "@/components";
import { CheckSquare } from "lucide-react";
import { useState } from "react";

const ResolutionTracking = () => {
  const stats = [{ label: "Resolved Today", value: "3", icon: CheckSquare, variant: "success" }];
  const [isModalOpen, setIsModalOpen] = useState(false);
  const columns = [{ header: "Log ID", accessor: "id" }];
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={CheckSquare} title="Resolution Tracking" subtitle="Corrective actions log" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={[]} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Resolution Log" subtitle="Log corrective action" icon={CheckSquare}>
        <div>Resolution Form</div>
      </Modal>
    </div>
  );
};

export default ResolutionTracking;
