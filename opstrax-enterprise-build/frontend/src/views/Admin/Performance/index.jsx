
import React, { useState } from 'react';
import DynamicTable from '@/components/common/DynamicTable';
import StatusBadge from '@/components/common/StatusBadge';
import { MOCK_SLA, MOCK_KPI } from '@/data/mock/analytics';
import { Gauge, BarChart3, Target, TrendingUp } from 'lucide-react';
import CustomInput from '@/components/common/CustomInput';
import { PremiumHeader, StatsCard, Modal } from '@/components';

export const SLAMonitoring = () => {
    const stats = [
        { label: "Active SLAs", value: MOCK_SLA.length, icon: Gauge, variant: "primary" },
        { label: "Breached", value: MOCK_SLA.filter(s => s.status === "Breached" || s.status === "Critical").length, icon: Target, variant: "danger" }
    ];

    const modalContent = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <CustomInput label="Metric Name" placeholder="On-Time Delivery" />
             <CustomInput label="Target Value" placeholder="98%" />
             <CustomInput type="select" label="Customer" options={[{value:'all', label:'All'}]} />
             <CustomInput label="Warning Threshold" placeholder="95%" />
        </div>
    );

    const columns = [
        { header: "Metric", accessor: "metric", render: (row) => <span className="font-bold text-gray-800">{row.metric}</span> },
        { header: "Target", accessor: "target" },
        { header: "Current", accessor: "current", render: (row) => <span className={`font-mono font-bold ${row.status === 'Warning' ? 'text-orange-500' : 'text-green-600'}`}>{row.current}</span> },
        { header: "Trend", accessor: "trend" },
        { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    ];
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
      <div className="w-full space-y-8 animate-fade-in">
        <PremiumHeader icon={Gauge} title="SLA Monitoring" subtitle="Service Level Agreement tracking" gradient="from-slate-900 via-indigo-900 to-red-900" onAddClick={() => setIsModalOpen(true)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, idx) => (
            <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
          ))}
        </div>
        <DynamicTable data={MOCK_SLA} columns={columns} />
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Define SLA" subtitle="Configure SLA parameters" icon={Gauge}>
          {modalContent}
        </Modal>
      </div>
    );
};

export const KPIDashboard = () => {
    const stats = [
        { label: "Tracked KPIs", value: MOCK_KPI.length, icon: BarChart3, variant: "info" },
        { label: "On Track", value: "85%", icon: TrendingUp, variant: "success" }
    ];

    const modalContent = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <CustomInput label="KPI Name" placeholder="Revenue / Mile" />
             <CustomInput label="Goal" placeholder="$2.50" />
        </div>
    );

    const columns = [
        { header: "KPI Name", accessor: "name", render: (row) => <span className="font-medium">{row.name}</span> },
        { header: "Period", accessor: "period" },
        { header: "Value", accessor: "value", render: (row) => <span className="text-xl font-bold text-blue-900">{row.value}</span> },
        { header: "Target", accessor: "target" },
    ];
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
      <div className="w-full space-y-8 animate-fade-in">
        <PremiumHeader icon={BarChart3} title="KPI Dashboard" subtitle="Key Performance Indicators" onAddClick={() => setIsModalOpen(true)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, idx) => (
            <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
          ))}
        </div>
        <DynamicTable data={MOCK_KPI} columns={columns} />
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add KPI Widget" subtitle="Add a KPI" icon={BarChart3}>
          {modalContent}
        </Modal>
      </div>
    );
};
