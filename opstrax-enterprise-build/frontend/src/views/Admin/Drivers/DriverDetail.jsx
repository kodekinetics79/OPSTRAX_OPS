
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  UserSquare2, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Award, 
  ShieldCheck, 
  CreditCard, 
  HeartPulse, 
  AlertCircle,
  ChevronLeft,
  Briefcase,
  Activity,
  DollarSign,
  Ruler
} from "lucide-react";
import { PremiumHeader, StatusBadge } from "@/components";
import { MOCK_DRIVERS } from "@/data/mock/fleet";

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

const DriverDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const driver = MOCK_DRIVERS.find((d) => d.id === id);

  if (!driver) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Driver not found</p>
        <button 
          onClick={() => navigate("/admin/drivers/profiles")}
          className="mt-4 text-primary font-semibold hover:underline"
        >
          Back to Driver List
        </button>
      </div>
    );
  }

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-900 via-gray-900 to-fade p-8 text-white shadow-xl border border-white/10">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-3xl font-bold text-primary">
              {driver.name.charAt(0)}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {driver.name}
                </h1>
                <StatusBadge status={driver.status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm font-medium">
                <span className="flex items-center gap-1 text-gray-500 font-mono">
                  <UserSquare2 size={14} />
                  {driver.id}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={14} />
                  {driver.exp || "0 Years"} Experience
                </span>
                {driver.rating && (
                  <span className="flex items-center gap-1 text-amber-400">
                    ★ {driver.rating} Rating
                  </span>
                )}
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/drivers/profiles")}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl text-sm font-semibold transition-all text-gray-300"
            >
              <ChevronLeft size={18} />
              Back
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Essential Info */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Contact Information" icon={Phone}>
            <div className="space-y-4">
              <DetailRow label="Mobile" value={driver.mobile || driver.phone} icon={Phone} />
              <DetailRow label="Email" value={driver.email} icon={Mail} />
              <DetailRow label="Address" value={driver.address} icon={MapPin} />
            </div>
          </InfoCard>

          <InfoCard title="General Details" icon={UserSquare2}>
            <div className="grid grid-cols-2 gap-4">
              <DetailRow label="Height" value={driver.height} />
              <DetailRow label="DOB" value={driver.dob} />
              <DetailRow label="Joining Date" value={driver.joiningDate} />
              <DetailRow label="Status" value={driver.status} />
            </div>
          </InfoCard>
        </div>

        {/* Middle Column: License & Compliance */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="License & Legal" icon={Award}>
            <div className="space-y-4">
              <DetailRow label="License Number" value={driver.licenseNumber} />
              <DetailRow label="License Expiry" value={driver.licenseExpiry} icon={Calendar} />
              <DetailRow label="Personal ID/No" value={driver.personalNumber} />
            </div>
          </InfoCard>

          <InfoCard title="Insurance Info" icon={ShieldCheck}>
            <div className="space-y-4">
              <DetailRow label="Provider" value={driver.insurance} />
              <DetailRow label="Medical Policy" value={driver.medicalPolicyNumber} />
              <DetailRow label="Period" value={driver.medicalStartDate && driver.medicalEndDate ? `${driver.medicalStartDate} - ${driver.medicalEndDate}` : null} />
            </div>
          </InfoCard>
        </div>

        {/* Right Column: Financials & Maintenance */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Financials" icon={DollarSign}>
            <div className="space-y-4">
              <DetailRow label="Salary" value={driver.salary ? `${driver.salary} AED` : null} />
              <DetailRow label="Medical Grade" value={driver.medicalGrade} />
            </div>
          </InfoCard>

          <InfoCard title="Tools & Cards" icon={CreditCard}>
            <div className="space-y-4">
              <DetailRow label="Fuel Card" value={driver.fuelCard} icon={CreditCard} />
            </div>
          </InfoCard>

          <InfoCard title="Compliance History" icon={Activity}>
             <div className="space-y-4">
                <DetailRow label="Traffic Violations" value={driver.trafficViolations} icon={AlertCircle} />
                <DetailRow label="Accident History" value={driver.accident} icon={AlertCircle} />
             </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default DriverDetail;
