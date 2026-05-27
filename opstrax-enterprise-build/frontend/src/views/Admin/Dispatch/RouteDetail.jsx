import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Map, 
  MapPin, 
  Clock, 
  Navigation, 
  ChevronLeft,
  Truck,
  User,
  Activity,
  AlertCircle,
  TrendingUp,
  Package,
  Calendar,
  CheckCircle2
} from "lucide-react";
import { PremiumHeader, StatusBadge } from "@/components";
import { ROUTES } from "@/components/admin/dispatch/dispatch.data";

const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm border border-slate-200/60 p-6 ${className}`}>
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-xl bg-slate-50 text-slate-300">
        <Icon size={20} />
      </div>
      <h3 className="font-bold text-slate-400 tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-4 mb-4 last:mb-0">
    {Icon && (
      <div className="mt-0.5 text-slate-400">
        <Icon size={16} />
      </div>
    )}
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-0.5">
        {label}
      </span>
      <span className="text-sm font-semibold text-slate-700">
        {value || <span className="text-slate-300 italic">Not provided</span>}
      </span>
    </div>
  </div>
);

const RouteDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const route = ROUTES.find((r) => r.id === id);

  if (!route) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-slate-500">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Route not found</p>
        <button 
          onClick={() => navigate("/admin/dispatch/routes")}
          className="mt-4 text-blue-600 font-semibold hover:underline"
        >
          Back to Route Plans
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-indigo-900 to-purple-950 p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-white/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center">
              <Map size={36} className="text-white" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold tracking-tight">
                  {route.name}
                </h1>
                <StatusBadge status={route.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-white/70 text-sm font-medium">
                <span className="flex items-center gap-1 font-mono">
                  <MapPin size={14} />
                  {route.id}
                </span>
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  ETA: {route.eta}
                </span>
                <span className="flex items-center gap-1">
                  <Navigation size={14} />
                  {route.stops} Stops
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/dispatch/routes")}
              className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/20 rounded-xl text-sm font-semibold transition-all"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Essential Journey Info */}
        <div className="lg:col-span-2 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <InfoCard title="Route Assignment" icon={Truck}>
               <div className="space-y-4">
                  <DetailRow label="Primary Driver" value={route.driver} icon={User} />
                  <DetailRow label="Assigned Vehicle" value={route.vehicle} icon={Truck} />
                  <DetailRow label="Route Type" value="Regional Delivery" />
               </div>
            </InfoCard>

            <InfoCard title="Schedule & Timing" icon={Clock}>
               <div className="space-y-4">
                  <DetailRow label="Departure Time" value="08:00 AM" icon={Activity} />
                  <DetailRow label="Estimated Arrival" value={route.eta} icon={Clock} />
                  <DetailRow label="Total Stops" value={route.stops} icon={Navigation} />
               </div>
            </InfoCard>
          </div>

          <InfoCard title="Live Journey Path" icon={MapPin}>
             <div className="relative py-4">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-100 z-0" />
                <div className="space-y-10 relative z-10 pl-10">
                   <div className="relative">
                      <div className="absolute -left-10 w-2.5 h-2.5 rounded-full bg-blue-600 mt-1" />
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Starting Point</p>
                         <h4 className="font-bold text-slate-400">Main Logistics Hub (DXB)</h4>
                         <p className="text-sm text-slate-500 mt-1">Status: Completed • 08:15 AM</p>
                      </div>
                   </div>
                   <div className="relative">
                      <div className="absolute -left-10 w-2.5 h-2.5 rounded-full bg-slate-300 mt-1 shadow-xs ring-4 ring-white" />
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Current Leg</p>
                         <h4 className="font-bold text-slate-400">Warehouse Stop #3 (Jebel Ali)</h4>
                         <p className="text-sm text-slate-500 mt-1">Status: In-Progress • ETA: 11:30 AM</p>
                      </div>
                   </div>
                   <div className="relative opacity-60">
                      <div className="absolute -left-10 w-2.5 h-2.5 rounded-full bg-slate-200 mt-1" />
                      <div>
                         <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">End Destination</p>
                         <h4 className="font-bold text-slate-400">Regional Distribution Center (AUH)</h4>
                         <p className="text-sm text-slate-500 mt-1">Status: Upcoming • ETA: 03:00 PM</p>
                      </div>
                   </div>
                </div>
             </div>
          </InfoCard>
        </div>

        {/* Right Column: Analytics & Metrics */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Performance Tracker" icon={TrendingUp}>
            <div className="space-y-4">
               <div className="p-4 rounded-xl bg-orange-50 border border-orange-100">
                  <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mb-1">Efficiency Score</p>
                  <p className="text-2xl font-black text-orange-900 tracking-tight">94.2%</p>
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <DetailRow label="Avg Speed" value="62 km/h" />
                  <DetailRow label="Idle Time" value="12 min" />
               </div>
            </div>
          </InfoCard>

          <InfoCard title="Load Information" icon={Package}>
             <div className="space-y-4">
                <DetailRow label="Total Weight" value="4.2 Tons" />
                <DetailRow label="Cargo Type" value="Perishables / Frozen" />
                <DetailRow label="Temp Control" value="-18°C Stable" icon={Activity} />
             </div>
          </InfoCard>

          <InfoCard title="Recent Activity" icon={Activity}>
             <div className="space-y-4 text-sm">
                <div className="flex gap-3 pb-3 border-b border-slate-50">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                   <p className="text-slate-300"><span className="font-bold text-slate-400">Hub exit</span> confirmed by system.</p>
                </div>
                <div className="flex gap-3 pb-3 border-b border-slate-50">
                   <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0" />
                   <p className="text-slate-300"><span className="font-bold text-slate-400">Overspeed alert</span> triggered at Route KM 42.</p>
                </div>
             </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default RouteDetail;
