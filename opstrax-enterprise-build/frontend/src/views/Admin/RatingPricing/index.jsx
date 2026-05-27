
import React from 'react';
import DynamicTable from '@/components/common/DynamicTable';
import StatusBadge from '@/components/common/StatusBadge';
import { MOCK_RATE_CARDS, MOCK_SIMULATIONS } from '@/data/mock/pricing';
import { Plus, Tag, LineChart, TrendingUp, Shuffle } from 'lucide-react';
import CustomInput from '@/components/common/CustomInput';
import { PremiumHeader, StatsCard } from '@/components';

export const RateCards = () => {
    const stats = [
        { label: "Published Tariffs", value: MOCK_RATE_CARDS.length, icon: Tag, variant: "primary" },
    ];

    const modalContent = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <CustomInput label="Tariff Name" placeholder="Standard - 2024" />
             <CustomInput type="select" label="Customer Group" options={[{value:'all', label:'General'}]} />
             <CustomInput type="date" label="Effective Date" />
             <CustomInput type="date" label="Expiry Date" />
        </div>
    );

    const columns = [
        { header: "Card ID", accessor: "id", render: (row) => <span className="font-mono text-xs">{row.id}</span> },
        { header: "Tariff Name", accessor: "name", render: (row) => <span className="font-medium">{row.name}</span> },
        { header: "Customer / Group", accessor: "customer" },
        { header: "Type", accessor: "type" },
        { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    ];
    return (
      <div className="w-full space-y-8 animate-fade-in">
        <PremiumHeader icon={Tag} title="Rate Cards" subtitle="Sell rates and tariffs" gradient="from-emerald-900 via-green-900 to-slate-900" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, idx) => (
            <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
          ))}
        </div>
        <DynamicTable data={MOCK_RATE_CARDS} columns={columns} />
      </div>
    );
};

export const PriceSimulation = () => {
    const stats = [
        { label: "Simulations", value: MOCK_SIMULATIONS.length, icon: Shuffle, variant: "info" },
        { label: "Avg Impact", value: "+2.4%", icon: TrendingUp, variant: "success" }
    ];

    const columns = [
        { header: "Sim ID", accessor: "id", render: (row) => <span className="font-mono text-xs">{row.id}</span> },
        { header: "Simulation Name", accessor: "name" },
        { header: "Date", accessor: "date" },
        { header: "Scenario", accessor: "scenario" },
        { header: "Result", accessor: "result", render: (row) => <span className={row.result.includes('-') ? 'text-red-600' : 'text-green-600'}>{row.result}</span> },
        { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    ];
    return (
      <div className="w-full space-y-8 animate-fade-in">
        <PremiumHeader icon={LineChart} title="Price Simulator" subtitle="Impact analysis and forecasting" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, idx) => (
            <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
          ))}
        </div>
        <DynamicTable data={MOCK_SIMULATIONS} columns={columns} />
      </div>
    );
};
