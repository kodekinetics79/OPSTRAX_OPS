
import React, { useState } from 'react';
import DynamicTable from '@/components/common/DynamicTable';
import { MOCK_PREDICTIVE } from '@/data/mock/analytics';
import { Calculator, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import CustomInput from '@/components/common/CustomInput';
import { PremiumHeader, StatsCard, Modal } from '@/components';

export const CostEstimation = () => {
    const stats = [
        { label: "Forecasts", value: MOCK_PREDICTIVE.length, icon: Calculator, variant: "primary" },
        { label: "Savings Opportunity", value: "$45k", icon: DollarSign, variant: "success" }
    ];

    const modalContent = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <CustomInput type="select" label="Model" options={[{value:'linear', label:'Linear Reg'}]} />
             <CustomInput type="date" label="Forecast Period" />
             <CustomInput label="Parameters" placeholder="Fuel, Labor..." />
        </div>
    );

    const columns = [
        { header: "Forecast ID", accessor: "id" },
        { header: "Type", accessor: "type" },
        { header: "Target Date", accessor: "date" },
        { header: "Prediction", accessor: "prediction", render: (row) => <span className="text-xl font-bold">{row.prediction}</span> },
        { header: "Confidence", accessor: "confidence", render: (row) => <span className="text-green-600">{row.confidence}</span> },
    ];
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
      <div className="w-full space-y-8 animate-fade-in">
        <PremiumHeader icon={Calculator} title="Cost Estimation (AI)" subtitle="Predictive expense modeling" gradient="from-slate-900 via-emerald-900 to-slate-900" onAddClick={() => setIsModalOpen(true)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, idx) => (
            <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
          ))}
        </div>
        <DynamicTable data={MOCK_PREDICTIVE} columns={columns} />
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Run Forecast" subtitle="Configure parameters" icon={Calculator}>
          {modalContent}
        </Modal>
      </div>
    );
};

export const MarginAnalysis = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const stats = [{ label: "Proj. Margin", value: "12%", icon: TrendingUp, variant: "info" }];
    const columns = [{header: 'ID', accessor: 'id'}];
    return (
      <div className="w-full space-y-8 animate-fade-in">
        <PremiumHeader icon={TrendingUp} title="Margin Analysis" subtitle="Profitability forecasting" onAddClick={() => setIsModalOpen(true)} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, idx) => (
            <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
          ))}
        </div>
        <DynamicTable data={[]} columns={columns} />
        <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Margin Analysis" subtitle="Enter details" icon={TrendingUp}>
          <div>Margin Analysis Config</div>
        </Modal>
      </div>
    );
};
