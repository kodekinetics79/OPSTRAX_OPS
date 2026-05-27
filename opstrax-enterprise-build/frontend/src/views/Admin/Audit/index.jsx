import React, { useState } from "react";
import DynamicTable from "@/components/common/DynamicTable";
import { MOCK_AUDIT } from "@/data/mock/analytics";
import { FileText, FolderOpen } from "lucide-react";
import { PremiumHeader, StatsCard, Modal } from "@/components";
import {
  AUDIT_COLUMNS,
  createAuditStats,
  AUDIT_GRADIENT,
  AUDIT_TITLE,
  AUDIT_SUBTITLE,
} from "@/constants/admin/audit";

export const AuditLogs = () => {
  const stats = createAuditStats(MOCK_AUDIT);

  const columns = AUDIT_COLUMNS;
  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader
        icon={FileText}
        title={AUDIT_TITLE}
        subtitle={AUDIT_SUBTITLE}
        gradient={AUDIT_GRADIENT}
        onAddClick={() => setIsModalOpen(true)}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard
            key={idx}
            icon={s.icon}
            label={s.label}
            value={s.value}
            variant={s.variant}
            className="bg-card-dark border-white/5"
          />
        ))}
      </div>
      <DynamicTable data={MOCK_AUDIT} columns={columns} />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Export Logs"
        subtitle="Configure export"
        icon={FileText}
      >
        <div className="p-4 text-white">Export Configuration</div>
      </Modal>
    </div>
  );
};

export const DocumentManagement = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const columns = [{ header: "Doc ID", accessor: "id" }];
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader
        icon={FolderOpen}
        title="Document Management"
        subtitle="Compliance docs and contracts"
        onAddClick={() => setIsModalOpen(true)}
      />
      <DynamicTable data={[]} columns={columns} />
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Upload Document"
        subtitle="Select a file"
        icon={FolderOpen}
      >
        <div className="p-4 text-white">Upload Dropzone</div>
      </Modal>
    </div>
  );
};
