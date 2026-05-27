import { DynamicTable, StatusBadge, PremiumHeader, Modal } from "@/components";
import { BrainCircuit } from "lucide-react";
import { AI_RUNS } from "./dispatch.data";
import { useState } from "react";

const AIDispatch = () => {
  const columns = [
    { header: "Run ID", accessor: "id", render: (row) => <span className="font-mono text-xs text-blue-600">{row.id}</span> },
    { header: "Algorithm", accessor: "algorithm" },
    { header: "Timestamp", accessor: "timestamp" },
    { header: "Models Scored", accessor: "candidates" },
    { header: "Proj. Impact", accessor: "impact", render: (row) => <span className="text-green-600">{row.impact}</span> },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={BrainCircuit} title="AI Optimization Engine" subtitle="Algorithm run history" onAddClick={() => setIsModalOpen(true)} />
      <DynamicTable data={AI_RUNS} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Run AI Analysis" subtitle="Configure parameters" icon={BrainCircuit}>
        <div>AI Configuration Parameters</div>
      </Modal>
    </div>
  );
};

export default AIDispatch;
