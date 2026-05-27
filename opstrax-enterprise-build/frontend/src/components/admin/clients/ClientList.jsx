import { useNavigate } from "react-router-dom";
import { DynamicTable, StatusBadge, PremiumHeader, StatsCard } from "@/components";
import { CLIENTS } from "./clients.data";
import { Building2, Users, Briefcase, FileText, Globe, Eye, Pencil } from "lucide-react";
import { useState } from "react";

const ClientList = () => {
  const navigate = useNavigate();
  const [clients] = useState(CLIENTS);

  const stats = [
    { label: "Total Clients", value: clients.length, icon: Building2, variant: "primary" },
    { label: "Active Contracts", value: "12", icon: FileText, variant: "success" },
    { label: "Pending Review", value: "3", icon: Briefcase, variant: "warning" },
    { label: "Global Partners", value: "5", icon: Globe, variant: "info" },
  ];

  const columns = [
    {
      header: "Company Name",
      accessor: "companyName",
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.companyName}</p>
          <p className="text-xs text-soft-gray/50">{row.id}</p>
        </div>
      ),
    },
    { header: "Category", accessor: "category" },
    { header: "Contact Person", accessor: "contactPerson" },
    { header: "Email", accessor: "email" },
    { header: "Phone", accessor: "phone" },
    { header: "Location", accessor: "location" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/clients/${row.id}`)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-soft-gray hover:text-primary transition-all group"
            title="View Details"
          >
            <Eye size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => navigate(`/admin/clients/edit/${row.id}`)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-soft-gray hover:text-amber-400 transition-all group"
            title="Edit Client"
          >
            <Pencil size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader
        icon={Building2}
        title="Client Management"
        subtitle="Manage client relationships and contracts"
        gradient="from-blue-900 via-blue-800 to-indigo-900"
        onAddClick={() => navigate("/admin/clients/add")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} className="bg-card-dark border-white/5" />
        ))}
      </div>
      <DynamicTable data={clients} columns={columns} />
    </div>
  );
};

export default ClientList;
