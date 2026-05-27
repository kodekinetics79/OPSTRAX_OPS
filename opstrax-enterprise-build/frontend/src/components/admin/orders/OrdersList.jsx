import { DynamicTable, StatusBadge, PremiumHeader, StatsCard } from "@/components";
import { ShoppingCart, Package, DollarSign, Clock, Eye, Pencil, Truck } from "lucide-react";
import { ORDERS } from "./orders.data";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import moment from "moment";

const OrdersList = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const stats = [
    { label: "Total Orders", value: ORDERS.length, icon: ShoppingCart, variant: "primary" },
    { label: "Pending", value: ORDERS.filter((o) => o.status === "Pending").length, icon: Clock, variant: "warning" },
    { label: "Delivered", value: ORDERS.filter((o) => o.status === "Delivered").length, icon: Package, variant: "success" },
    { label: "Revenue", value: "$12.5k", icon: DollarSign, variant: "info" },
  ];

  const columns = [
    { 
      header: "Order ID", 
      accessor: "id", 
      render: (row) => <span className="font-mono text-xs font-bold text-primary">{row.id}</span> 
    },
    { 
      header: "Customer", 
      accessor: "customer",
      render: (row) => (
        <span className="font-medium text-gray-200">{row.customer}</span>
      )
    },
    { 
      header: "Date", 
      accessor: "date", 
      render: (row) => <span className="text-gray-400 text-sm">{row.date ? moment(row.date).format("YYYY-MM-DD") : "--"}</span> 
    },
    { 
      header: "Amount", 
      accessor: "amount",
      render: (row) => <span className="font-semibold text-emerald-400">{row.amount}</span>
    },
    { 
      header: "Status", 
      accessor: "status", 
      render: (row) => <StatusBadge status={row.status} /> 
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/orders/${row.id}`)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-primary transition-all group"
            title="View Details"
          >
            <Eye size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => navigate(`/admin/orders/edit/${row.id}`)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-amber-400 transition-all group"
            title="Edit Order"
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
        icon={Truck}
        title="Order Management"
        subtitle="Track and manage customer shipments"
        gradient="from-purple-900/50 via-slate-900 to-indigo-900"
        onAddClick={() => navigate("/admin/orders/create")}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>

      <DynamicTable data={ORDERS} columns={columns} />

    </div>
  );
};

export default OrdersList;
