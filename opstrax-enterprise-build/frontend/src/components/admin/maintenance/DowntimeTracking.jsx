import { DynamicTable, StatusBadge, PremiumHeader, StatsCard } from "@/components";
import { TimerOff } from "lucide-react";
import { DOWNTIME } from "./maintenance.data";

const DowntimeTracking = () => {
  const stats = [{ label: "Vehicles Down", value: DOWNTIME.length, icon: TimerOff, variant: "danger" }];

  const columns = [
    { header: "Event ID", accessor: "id", render: (row) => <span className="font-mono text-xs">{row.id}</span> },
    { header: "Vehicle", accessor: "vehicle" },
    { header: "Start Date", accessor: "start" },
    { header: "Duration", accessor: "duration" },
    { header: "Reason", accessor: "reason" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={TimerOff} title="Downtime Tracker" subtitle="Vehicle unavailability logs" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={DOWNTIME} columns={columns} />
    </div>
  );
};

export default DowntimeTracking;
