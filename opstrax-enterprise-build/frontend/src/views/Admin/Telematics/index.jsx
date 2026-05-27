
import React from 'react';
import DynamicTable from '@/components/common/DynamicTable';
import StatusBadge from '@/components/common/StatusBadge';
import { MOCK_DEVICES, MOCK_COLD_CHAIN } from '@/data/mock/telematics';
import { Plus, Wifi, ThermometerSnowflake, Activity, Battery, AlertTriangle } from 'lucide-react';
import CustomInput from '@/components/common/CustomInput';
import { PremiumHeader, StatsCard, Modal } from '@/components';

export const IoTDevices = () => {
    const stats = [
        { label: "Total Devices", value: MOCK_DEVICES.length, icon: Wifi, variant: "primary" },
        { label: "Online", value: MOCK_DEVICES.filter(d => d.status === "Active").length, icon: Activity, variant: "success" },
        { label: "Low Battery", value: "2", icon: Battery, variant: "warning" }
    ];

    const modalContent = (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <CustomInput label="Device ID" placeholder="IMEI / Serial" />
             <CustomInput label="Type" placeholder="GPS / Sensor" />
             <CustomInput label="Vehicle" placeholder="Select vehicle..." />
             <CustomInput label="SIM Card" placeholder="Mobile number" />
        </div>
    );

    const columns = [
        { header: "Device ID", accessor: "id", render: (row) => <span className="font-mono text-xs">{row.id}</span> },
        { header: "Type", accessor: "type" },
        { header: "Linked Vehicle", accessor: "vehicle" },
        { header: "Last Ping", accessor: "last_ping" },
        { header: "Data", accessor: "reading", render: (row) => row.reading || row.battery },
        { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    ];
    return (
      <div className="w-full space-y-8 animate-fade-in">
        <PremiumHeader icon={Wifi} title="IoT Device Manager" subtitle="Sensor inventory and health" gradient="from-slate-900 via-cyan-900 to-slate-900" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, idx) => (
            <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
          ))}
        </div>
        <DynamicTable data={MOCK_DEVICES} columns={columns} />
      </div>
    );
};

export const ColdChain = () => {
    const stats = [
        { label: "Active Trips", value: MOCK_COLD_CHAIN.length, icon: ThermometerSnowflake, variant: "info" },
        { label: "Temp Alerts", value: "0", icon: AlertTriangle, variant: "success" }
    ];
    
    const columns = [
        { header: "Log ID", accessor: "id", render: (row) => <span className="font-mono text-xs">{row.id}</span> },
        { header: "Vehicle", accessor: "vehicle" },
        { header: "Trip Context", accessor: "trip" },
        { header: "Set Point", accessor: "set_point" },
        { header: "Avg Temp", accessor: "avg_temp" },
        { header: "Violations", accessor: "violations", render: (row) => row.violations > 0 ? <span className="text-red-500 font-bold">{row.violations}</span> : <span className="text-gray-400">-</span> },
        { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    ];
    return (
      <div className="w-full space-y-8 animate-fade-in">
        <PremiumHeader icon={ThermometerSnowflake} title="Cold Chain Monitoring" subtitle="Temperature sensitive cargo logs" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, idx) => (
            <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
          ))}
        </div>
        <DynamicTable data={MOCK_COLD_CHAIN} columns={columns} />
      </div>
    );
};

// no-op
