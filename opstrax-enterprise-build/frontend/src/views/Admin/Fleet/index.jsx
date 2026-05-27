
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import DynamicTable from "@/components/common/DynamicTable";
import StatusBadge from "@/components/common/StatusBadge";
import Modal from "@/components/common/Modal";
import { MOCK_VEHICLES, MOCK_ASSETS } from "@/data/mock/fleet";
import {
  Truck,
  FileSpreadsheet,
  Activity,
  AlertCircle,
  Calendar,
  Bolt,
  Eye,
  Pencil,
} from "lucide-react";
import CustomInput from "@/components/common/CustomInput";
import Chart from "react-apexcharts";
import { Card, PremiumHeader, StatsCard } from "@/components/index";

export { default as AddVehicle } from "./AddVehicle";
export { default as VehicleDetail } from "./VehicleDetail";

export const VehicleList = () => {
  const navigate = useNavigate();
  const [vehicles, setVehicles] = useState(MOCK_VEHICLES);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const stats = [
    {
      label: "Total Vehicles",
      value: vehicles.length,
      icon: Truck,
      variant: "primary",
    },
    {
      label: "Active Fleet",
      value: vehicles.filter((v) => v.status === "Active").length,
      icon: Activity,
      variant: "success",
    },
    {
      label: "Maintenance",
      value: vehicles.filter((v) => v.status === "Maintenance").length,
      icon: AlertCircle,
      variant: "warning",
    },
    {
      label: "Avg Age",
      value: "3.2 Years",
      icon: Calendar,
      variant: "default",
    },
  ];

  const columns = [
    {
      header: "Vehicle ID",
      accessor: "vehicle_id",
      render: (row) => (
        <span className="font-mono text-xs text-gray-400">{row.vehicle_id || row.id}</span>
      ),
    },
    {
      header: "Plate Number",
      accessor: "plate_number",
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center justify-center">
            <Truck size={16} />
          </div>
          <span className="font-mono font-medium text-white">
            {row.plate_number || row.plate}
          </span>
        </div>
      ),
    },
    {
      header: "Make / Model",
      accessor: "make",
      render: (row) => (
        <span className="text-gray-200">
          {row.make} {row.model} <span className="text-gray-500">({row.year})</span>
        </span>
      ),
    },
    { header: "Owner Name", accessor: "owner_name" },
    { header: "Type of Vehicle", accessor: "type_of_vehicle" },
    {
      header: "Status",
      accessor: "vehicle_status",
      render: (row) => (
        <StatusBadge status={row.vehicle_status || row.status} />
      ),
    },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/fleet/vehicles/${row.vehicle_id || row.id}`)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-primary transition-all group"
            title="View Details"
          >
            <Eye size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => navigate(`/admin/fleet/vehicles/edit/${row.vehicle_id || row.id}`)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-amber-400 transition-all group"
            title="Edit Vehicle"
          >
            <Pencil size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];

  // Chart Data Calculations
  const statusCounts = vehicles.reduce((acc, curr) => {
    const s = curr.status || curr.vehicle_status;
    acc[s] = (acc[s] || 0) + 1;
    return acc;
  }, {});

  const typeCounts = vehicles.reduce((acc, curr) => {
    const t = curr.type_of_vehicle || curr.type || "Other";
    acc[t] = (acc[t] || 0) + 1;
    return acc;
  }, {});

  const statusChartOptions = {
    chart: { type: "bar", toolbar: { show: false }, background: "transparent" },
    theme: { mode: 'dark' },
    plotOptions: { bar: { borderRadius: 8, distributed: true } },
    dataLabels: { enabled: false },
    colors: ["#3b82f6", "#f59e0b", "#ef4444"],
    xaxis: { 
      categories: Object.keys(statusCounts),
      labels: { style: { colors: '#9ca3af' } }
    },
    yaxis: { labels: { style: { colors: '#9ca3af' } } },
    grid: { borderColor: '#333' },
    legend: { show: false },
  };

  const statusChartSeries = [
    {
      name: "Vehicles",
      data: Object.values(statusCounts),
    },
  ];

  const typeChartOptions = {
    chart: { type: "donut", background: "transparent" },
    theme: { mode: 'dark' },
    labels: Object.keys(typeCounts),
    colors: ["#1e3a8a", "#3b82f6", "#60a5fa", "#93c5fd"],
    legend: { position: "bottom", labels: { colors: '#9ca3af' } },
    dataLabels: { enabled: false },
    stroke: { width: 0 },
    plotOptions: { pie: { donut: { size: "75%" } } },
  };

  const typeChartSeries = Object.values(typeCounts);

  const trendChartOptions = {
    chart: {
      type: "area",
      toolbar: { show: false },
      sparkline: { enabled: true },
      background: "transparent"
    },
    theme: { mode: 'dark' },
    stroke: { curve: "smooth", width: 2 },
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.45, opacityTo: 0.05 },
    },
    colors: ["#F0F941"], // Primary Neon
    tooltip: { enabled: false },
  };

  const trendChartSeries = [
    {
      name: "Utilization",
      data: [31, 40, 28, 51, 42, 109, 100],
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Analytics Section */}
      <div className="grid grid-cols-1 laptop:grid-cols-3 gap-6">
        <Card className="p-5 bg-card-dark border border-white/5 shadow-lg flex flex-col justify-between rounded-xl">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Fleet Status
            </p>
            <Chart
              options={statusChartOptions}
              series={statusChartSeries}
              type="bar"
              height={160}
            />
          </div>
        </Card>

        <Card className="p-5 bg-card-dark border border-white/5 shadow-lg flex flex-col justify-between rounded-xl">
          <div>
            <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-4">
              Asset Composition
            </p>
            <Chart
              options={typeChartOptions}
              series={typeChartSeries}
              type="donut"
              height={180}
            />
          </div>
        </Card>

        <Card className="p-5 bg-card-dark border border-white/5 shadow-lg flex flex-col justify-between rounded-xl">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-[11px] font-semibold text-gray-500 uppercase tracking-wide mb-1">
                Weekly Utilization
              </p>
              <h4 className="text-2xl font-bold text-white">94.2%</h4>
            </div>
            <div className="p-2 bg-primary/10 text-primary rounded-lg border border-primary/20">
              <Activity size={18} />
            </div>
          </div>
          <Chart
            options={trendChartOptions}
            series={trendChartSeries}
            type="area"
            height={80}
          />
        </Card>
      </div>

      <PremiumHeader
        icon={Truck}
        title="Vehicle Registry"
        subtitle="Manage fleet vehicles and availability"
        gradient="from-blue-900/50 via-slate-900 to-fade"
        onAddClick={() => navigate("/admin/fleet/vehicles/add")}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={vehicles} columns={columns} />

      {isSuccessModalOpen && (
        <Modal
          isOpen={isSuccessModalOpen}
          onClose={() => setIsSuccessModalOpen(false)}
          title="Vehicle Added"
          subtitle="The vehicle has been registered successfully."
          icon={Truck}
          size="sm"
        >
          <div className="py-4">
            <p className="text-sm text-gray-300">
              The new vehicle now appears in the registry list.
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export const AssetRegistry = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stats = [
    { label: "Total Assets", value: MOCK_ASSETS.length, icon: FileSpreadsheet },
    { label: "Value", value: "$4.2M", icon: Activity, variant: "info" },
  ];

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput label="Asset ID" placeholder="AST-001" />
      <CustomInput label="Asset Name" placeholder="Generator X" />
      <CustomInput label="Category" placeholder="Equipment" />
      <CustomInput label="Value ($)" placeholder="5000" />
    </div>
  );

  const columns = [
    {
      header: "Asset ID",
      accessor: "id",
      render: (row) => <span className="font-mono text-xs text-gray-400">{row.id}</span>,
    },
    {
      header: "Asset Name",
      accessor: "name",
      render: (row) => <span className="font-medium text-white">{row.name}</span>,
    },
    { header: "Category", accessor: "category" },
    { header: "Brand", accessor: "brand" },
    { header: "Location", accessor: "location" },
    {
      header: "Status",
      accessor: "status",
      render: (row) => <StatusBadge status={row.status} />,
    },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={Bolt} title="Non-Fleet Assets" subtitle="Equipment, tools, and auxiliary machinery" gradient="from-indigo-900/50 via-slate-900 to-fade" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={MOCK_ASSETS} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Asset" subtitle="Enter details below" icon={Bolt}>
        {modalContent}
      </Modal>
    </div>
  );
};
