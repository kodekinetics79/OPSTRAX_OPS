import { Navigation, AlertTriangle, ArrowRight, Activity } from "lucide-react";
import { CommonButton } from "@/components";

export const DashboardHero = () => {
  return (
    <div className="grid grid-cols-1 laptop:grid-cols-3 gap-6">
      <div className="laptop:col-span-2 bg-white rounded-xl p-8 border border-slate-200 shadow-sm relative overflow-hidden group">
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="px-3 py-1 bg-blue-50 text-secondary rounded-md text-[11px] font-bold uppercase tracking-wider flex items-center gap-2 border border-blue-100">
              <Activity size={12} />
              System Operational
            </div>
          </div>
          <h1 className="text-3xl laptop:text-4xl font-bold text-slate-400 tracking-tight mb-3">
            Welcome to <span className="text-secondary">OpsTrax</span>
          </h1>
          <p className="text-slate-500 font-medium text-sm laptop:text-base max-w-xl mb-8 leading-relaxed">
            Your fleet is performing at <span className="text-emerald-600 font-bold">94% efficiency</span> today.
            {" "}
            3 shipments are ahead of schedule and 2 require immediate attention.
          </p>
          <div className="flex flex-wrap gap-3">
            <CommonButton icon={Navigation} className="bg-secondary hover:bg-secondary/90 text-white shadow-md shadow-secondary/20">
              Live Tracking
            </CommonButton>
            <CommonButton variant="outline" className="border-slate-200 text-slate-300 hover:bg-slate-50 hover:text-slate-900">
              View Reports
            </CommonButton>
          </div>
        </div>
      </div>

      <div className="bg-secondary rounded-xl p-8 text-white shadow-md shadow-secondary/20 relative overflow-hidden flex flex-col justify-between min-h-[280px]">
        {/* Subtle pattern background */}
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.05)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[gradient_15s_ease_infinite] opacity-30" />
        
        <div className="relative z-10">
          <h3 className="text-white/80 font-bold uppercase tracking-wider text-[11px] mb-6">
            Quick Actions
          </h3>
          <div className="space-y-3">
            <button className="w-full flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all group border border-white/5">
              <span className="font-semibold text-white text-sm">Dispatch Fleet</span>
              <ArrowRight size={16} className="text-white/80 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full flex items-center justify-between p-3.5 bg-white/10 hover:bg-white/20 rounded-lg transition-all group border border-white/5">
              <span className="font-semibold text-white text-sm">Emergency Alert</span>
              <AlertTriangle size={16} className="text-white/80" />
            </button>
          </div>
        </div>
        <div className="mt-6 pt-6 border-t border-white/10 relative z-10">
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_8px_rgba(52,211,153,0.6)]" />
            <span className="text-xs font-semibold text-white/90">London-West Server</span>
          </div>
          <p className="text-[10px] text-white/50 font-medium pl-4.5">Latency: 0.4ms • Stable</p>
        </div>
      </div>
    </div>
  );
};
