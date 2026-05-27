import { DynamicTable, StatusBadge, PremiumHeader, StatsCard } from "@/components";
import { Map, TrendingUp, Eye, Pencil } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "./dispatch.data";
import { useState } from "react";

const RoutePlans = () => {
  const navigate = useNavigate();
  const stats = [
    { label: "Active Routes", value: ROUTES.length, icon: Map, variant: "info" },
    { label: "Avg Efficiency", value: "94%", icon: TrendingUp, variant: "success" },
  ];

  const columns = [
    { header: "Route ID", accessor: "id", render: (row) => <span className="font-mono text-xs">{row.id}</span> },
    { header: "Route Name", accessor: "name", render: (row) => <span className="font-medium">{row.name}</span> },
    { header: "Driver", accessor: "driver" },
    { header: "Vehicle", accessor: "vehicle", render: (row) => <span className="font-mono text-xs bg-gray-100 px-1 rounded">{row.vehicle}</span> },
    { header: "Stops", accessor: "stops" },
    { header: "ETA", accessor: "eta" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/dispatch/routes/${row.id}`)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-indigo-600 transition-all group"
            title="View Details"
          >
            <Eye size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => console.log("Edit Route", row.id)}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-amber-600 transition-all group"
            title="Edit Route"
          >
            <Pencil size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];

  const [isModalOpen, setIsModalOpen] = useState(false);
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader 
        icon={Map} 
        title="Active Routes" 
        subtitle="Monitoring and execution" 
        onAddClick={() => navigate("/admin/dispatch/routes/new")} 
        buttonLabel="Create Route Plan"
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={ROUTES} columns={columns} />
    </div>
  );
};

export default RoutePlans;
