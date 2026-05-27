import React from "react";

const StatusBadge = ({ status, variant, pulse = false, className = "" }) => {
  const getStyles = () => {
    // If variant is explicitly provided, use it
    const type = variant || status?.toLowerCase();

    // Map status/variant to styles
    if (["active", "success", "delivered", "completed", "optimized", "available", "deployed"].includes(type)) {
      return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
    }
    if (["on hold", "warning", "pending", "delayed", "draft", "maintenance", "resting", "repair"].includes(type)) {
      return "bg-amber-500/10 text-amber-400 border-amber-500/20";
    }
    if (["inactive", "error", "cancelled", "danger", "out of service", "outofservice", "leave", "terminated"].includes(type)) {
      return "bg-rose-500/10 text-rose-400 border-rose-500/20";
    }
    if (["info", "in transit", "processing", "running", "scheduled", "in progress", "on trip", "assigned", "dispatched"].includes(type)) {
      return "bg-primary text-dark-bg border-transparent font-extrabold shadow-[0_0_10px_rgba(240,249,65,0.4)]";
    }
    
    // Default
    return "bg-white/5 text-soft-gray border-white/5";
  };

  return (
    <span
      className={`
        inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border 
        ${getStyles()} 
        ${className}
      `}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 bg-current"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
        </span>
      )}
      {status}
    </span>
  );
};

export default StatusBadge;
