
import React, { useState } from 'react';
import DynamicTable from '@/components/common/DynamicTable';
import StatusBadge from '@/components/common/StatusBadge';
import { MOCK_FEATURES } from '@/data/mock/analytics';
import { Package, ToggleLeft, Layers, Power } from 'lucide-react';
import CustomInput from '@/components/common/CustomInput';
import { PremiumHeader, StatsCard, Modal } from '@/components';

export const FeaturePacks = () => {
    const stats = [
        { label: "Available Packs", value: MOCK_FEATURES.length, icon: Package, variant: "primary" },
        { label: "Active", value: MOCK_FEATURES.filter(f => f.status === "Active").length, icon: Power, variant: "success" }
    ];

    const modalContent = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <CustomInput label="Feature Name" placeholder="Advanced Reporting" />
             <CustomInput label="Code" placeholder="FEAT_RPT" />
             <CustomInput type="select" label="Type" options={[{value:'addon', label:'Add-on'}]} />
             <CustomInput type="select" label="Status" options={[{value:'active', label:'Active'}]} />
        </div>
    );

    const columns = [
        { header: "Feature ID", accessor: "id", render: (row) => <span className="font-mono text-xs">{row.id}</span> },
        { header: "Feature Name", accessor: "name", render: (row) => <span className="font-bold">{row.name}</span> },
        { header: "Type", accessor: "type" },
        { header: "Availability", accessor: "enabled_for" },
        { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    ];
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
      <div className="w-full space-y-8 animate-fade-in">
        <PremiumHeader icon={Package} title="Feature Packs" subtitle="Module licensing and addons" gradient="from-indigo-900 via-purple-900 to-slate-900" onAddClick={() => setIsModalOpen(true)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, idx) => (
            <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
          ))}
        </div>
        <DynamicTable data={MOCK_FEATURES} columns={columns} />
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Feature Pack" subtitle="Enter details below" icon={Package}>
          {modalContent}
        </Modal>
      </div>
    );
};

export const FeatureFlags = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const columns = [{header: 'Flag', accessor: 'id'}];
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={ToggleLeft} title="Feature Flags" subtitle="Toggle system capabilities" onAddClick={() => setIsModalOpen(true)} />
      <DynamicTable data={[]} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Create Flag" subtitle="Configure flag" icon={ToggleLeft}>
        <div>Flag Config</div>
      </Modal>
    </div>
  );
};
