
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Truck, 
  Calendar, 
  MapPin, 
  ShieldCheck, 
  CreditCard, 
  Activity,
  ChevronLeft,
  DollarSign,
  Bolt,
  FileText,
  AlertCircle,
  Wrench,
  Fuel,
  Info
} from "lucide-react";
import { PremiumHeader, StatusBadge } from "@/components";
import { MOCK_VEHICLES } from "@/data/mock/fleet";

const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
  <div className={`bg-card-dark rounded-2xl shadow-lg border border-white/5 p-6 ${className}`}>
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-xl bg-white/5 text-gray-200 border border-white/5">
        <Icon size={20} />
      </div>
      <h3 className="font-bold text-white tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-4 mb-4 last:mb-0">
    {Icon && (
      <div className="mt-0.5 text-gray-500">
        <Icon size={16} />
      </div>
    )}
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-200">
        {value || <span className="text-gray-600 italic">Not provided</span>}
      </span>
    </div>
  </div>
);

const VehicleDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const vehicle = MOCK_VEHICLES.find((v) => v.vehicle_id === id || v.id === id);

  if (!vehicle) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Vehicle not found</p>
        <button 
          onClick={() => navigate("/admin/fleet/vehicles")}
          className="mt-4 text-primary font-semibold hover:underline"
        >
          Back to Vehicle Registry
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-blue-900/50 to-fade p-8 text-white shadow-xl border border-white/10">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center">
              <Truck size={36} className="text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {vehicle.make} {vehicle.model}
                </h1>
                <StatusBadge status={vehicle.vehicle_status || vehicle.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm font-medium">
                <span className="flex items-center gap-1 font-mono text-gray-500">
                  <Info size={14} />
                  {vehicle.vehicle_id || vehicle.id}
                </span>
                <span className="flex items-center gap-1">
                  <CreditCard size={14} />
                  {vehicle.plate_number || vehicle.plate}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {vehicle.year}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/fleet/vehicles")}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl text-sm font-semibold transition-all text-gray-300"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Basic & Spec */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="General Specifications" icon={Truck}>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Make" value={vehicle.make} />
              <DetailRow label="Model" value={vehicle.model} />
              <DetailRow label="Year" value={vehicle.year} />
              <DetailRow label="Color" value={vehicle.colour || vehicle.color} />
              <DetailRow label="Type" value={vehicle.type_of_vehicle || vehicle.type} />
              <DetailRow label="Unit No" value={vehicle.unit_no || vehicle.unitNo} />
            </div>
          </InfoCard>

          <InfoCard title="Technical Details" icon={Bolt}>
            <div className="space-y-4">
              <DetailRow label="VIN" value={vehicle.vin} icon={FileText} />
              <DetailRow label="Engine No" value={vehicle.engine_no || vehicle.engineNo} icon={Bolt} />
              <DetailRow label="Truck Length" value={vehicle.truck_length || vehicle.length} />
            </div>
          </InfoCard>
        </div>

        {/* Middle Column: Registration & Compliance */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Registration & Lease" icon={FileText}>
            <div className="space-y-4">
              <DetailRow label="Plate Number" value={vehicle.plate_number || vehicle.plate} icon={CreditCard} />
              <DetailRow label="Owner Name" value={vehicle.owner_name} />
              <DetailRow label="Lease Start" value={vehicle.lease_start_date} icon={Calendar} />
              <DetailRow label="Lease End" value={vehicle.lease_end_date} icon={Calendar} />
              <DetailRow label="Lease Term" value={vehicle.lease_term} />
            </div>
          </InfoCard>

          <InfoCard title="Insurance & Safety" icon={ShieldCheck}>
            <div className="space-y-4">
              <DetailRow label="Insurance Provider" value={vehicle.insurance_company} />
              <DetailRow label="Policy Number" value={vehicle.policy_number} />
              <DetailRow label="Insurance Period" value={vehicle.insurance_start && vehicle.insurance_end ? `${vehicle.insurance_start} - ${vehicle.insurance_end}` : null} />
              <DetailRow label="MVI Safety Due" value={vehicle.mvi_safety_due} icon={Calendar} />
            </div>
          </InfoCard>
        </div>

        {/* Right Column: Maintenance & Usage */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Usage & Financials" icon={DollarSign}>
            <div className="space-y-4">
              <DetailRow label="Purchase Price" value={vehicle.purchase_price ? `${vehicle.purchase_price} AED` : null} />
              <DetailRow label="Monthly Lease" value={vehicle.lease_amount ? `${vehicle.lease_amount} AED` : null} />
              <DetailRow label="Tax Rate" value={vehicle.tax_rate ? `${vehicle.tax_rate}%` : null} />
            </div>
          </InfoCard>

          <InfoCard title="Telematics & Equipment" icon={Activity}>
            <div className="space-y-4">
              <DetailRow label="Tracker ID" value={vehicle.tracker} icon={MapPin} />
              <DetailRow label="Dashcam" value={vehicle.dashcam} />
              <DetailRow label="Fuel Card" value={vehicle.fuel_card} icon={Fuel} />
            </div>
          </InfoCard>

          <InfoCard title="Service Status" icon={Wrench}>
             <div className="space-y-4">
                <DetailRow label="Current Status" value={vehicle.vehicle_status || vehicle.status} icon={Activity} />
                <DetailRow label="Last Inspection" value={vehicle.last_inspection || "Pending"} icon={Calendar} />
             </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default VehicleDetail;
