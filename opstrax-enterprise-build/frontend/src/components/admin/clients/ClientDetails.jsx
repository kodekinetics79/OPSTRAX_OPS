
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  Building2, 
  MapPin, 
  Phone, 
  Mail, 
  Globe, 
  Briefcase, 
  FileText, 
  Calendar, 
  Clock, 
  CreditCard, 
  ShieldCheck, 
  ChevronLeft,
  AlertCircle,
  Package,
  Activity,
  User,
  Info,
  TrendingUp
} from "lucide-react";
import { PremiumHeader, StatusBadge } from "@/components";
import { CLIENTS } from "./clients.data";

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

const ClientDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const client = CLIENTS.find((c) => c.id === id);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Client profile not found</p>
        <button 
          onClick={() => navigate("/admin/clients")}
          className="mt-4 text-primary font-semibold hover:underline"
        >
          Back to Client List
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-gray-900 to-fade p-8 text-white shadow-xl border border-white/10">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-3xl font-bold text-primary">
              {client.companyName?.charAt(0) || <Building2 size={36} />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {client.companyName}
                </h1>
                <StatusBadge status={client.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm font-medium">
                <span className="flex items-center gap-1 font-mono text-gray-500">
                  <Info size={14} />
                  {client.id}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={14} />
                  {client.category}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin size={14} />
                  {client.location}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/clients")}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl text-sm font-semibold transition-all text-gray-300"
            >
              <ChevronLeft size={18} />
              Back
            </button>
            <button
              onClick={() => navigate(`/admin/clients/edit/${client.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
            >
              Edit Profile
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Business & Contact */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Business Profile" icon={Building2}>
            <div className="space-y-4">
              <DetailRow label="Legal Name" value={client.companyName} />
              <DetailRow label="Business Type" value={client.businessType} />
              <DetailRow label="Category" value={client.category} />
              <DetailRow label="Tax ID" value={client.taxId} icon={FileText} />
              <DetailRow label="Website" value={client.website} icon={Globe} />
              <DetailRow label="Registered Address" value={client.address} icon={MapPin} />
            </div>
          </InfoCard>

          <InfoCard title="Primary Contact" icon={User}>
            <div className="space-y-4">
              <DetailRow label="Contact Person" value={client.contactPerson} icon={User} />
              <DetailRow label="Email Address" value={client.email} icon={Mail} />
              <DetailRow label="Phone Number" value={client.phone} icon={Phone} />
            </div>
          </InfoCard>
        </div>

        {/* Middle Column: Contract & Logistics */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Logistics Preferences" icon={Package}>
            <div className="space-y-4">
              <DetailRow label="Preferred Load Type" value={client.preferredLoadType} icon={Package} />
              <DetailRow label="Avg Monthly Loads" value={client.avgMonthlyLoads} icon={Activity} />
              <DetailRow label="Delivery Window" value={`${client.deliveryStartTime} - ${client.deliveryEndTime}`} icon={Clock} />
              <div className="pt-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 block">Special Instructions</span>
                <p className="text-sm font-medium text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 italic">
                  "{client.specialInstruction || "No special instructions provided."}"
                </p>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Contract Status" icon={ShieldCheck}>
            <div className="space-y-4">
              <DetailRow label="Contract Expiry" value={client.contractExpiry} icon={Calendar} />
              <DetailRow label="Agreement Type" value="Service Level Agreement" />
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 mt-4">
                <div className="flex items-center gap-2 text-emerald-400 mb-1">
                  <ShieldCheck size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Compliance Status</span>
                </div>
                <p className="text-sm font-bold text-emerald-200">Fully Compliant</p>
              </div>
            </div>
          </InfoCard>
        </div>

        {/* Right Column: Financials & Analytics */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Financial Profile" icon={CreditCard}>
            <div className="space-y-4">
              <DetailRow label="Payment Method" value={client.paymentMethod} icon={CreditCard} />
              <div className="pt-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 block">Credit Limit</span>
                <p className="text-2xl font-black text-white tracking-tight">
                  {new Intl.NumberFormat("en-AE", { style: "currency", currency: "AED" }).format(client.creditLimit)}
                </p>
                <div className="w-full h-2 bg-white/10 rounded-full mt-3 overflow-hidden">
                  <div className="h-full bg-primary rounded-full w-[45%]" />
                </div>
                <div className="flex justify-between mt-1 text-[10px] font-bold uppercase tracking-widest">
                  <span className="text-primary">45% Utilized</span>
                  <span className="text-gray-500">55% Available</span>
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Account Overview" icon={Activity}>
             <div className="grid grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">Total Shipments</p>
                   <p className="text-xl font-bold text-white">842</p>
                </div>
                <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                   <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1">On-Time %</p>
                   <p className="text-xl font-bold text-emerald-400">98.5%</p>
                </div>
             </div>
             <div className="mt-4 p-4 rounded-xl bg-blue-500/10 border border-blue-500/20">
                <div className="flex items-center gap-2 text-blue-400 mb-1 font-bold text-sm">
                   <TrendingUp size={16} />
                   Relationship Score: Platinum
                </div>
                <p className="text-xs text-blue-300/80 font-medium">Top 5% priority client based on volume and reliability.</p>
             </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default ClientDetails;
