import React from "react";
import { CheckCircle2, MapPin, Truck, User, Package, Layers, Calendar, Printer, Sparkles } from "lucide-react";
import { StatusBadge } from "@/components";

const RoutePlanSummary = ({ data }) => {
  if (!data || !data.routes || data.routes.length === 0) return null;

  // Flatten the journey into a single sequence
  const journeyPoints = [];

  data.routes.forEach((route, index) => {
    // Leg Start
    journeyPoints.push({
      type: "start",
      location: route.routeStart,
      timing: route.timing,
      legIndex: index + 1,
      notes: "Departing",
      aiNote: route.aiNote,
      id: `start-${index}`
    });

    // Stops
    route.stops?.forEach((stop, sIndex) => {
      if (stop.location) {
         journeyPoints.push({
          type: "stop",
          location: stop.location,
          timing: "-", // Stops don't have explicit timing in form yet
          legIndex: index + 1,
          notes: stop.notes || `Stop ${sIndex + 1}`,
          stopIndex: sIndex + 1,
          id: `stop-${index}-${sIndex}`
        });
      }
    });

    // Leg End
    journeyPoints.push({
      type: "end",
      location: route.routeEnd,
      timing: "-",
      legIndex: index + 1,
      notes: "Arriving",
      id: `end-${index}`
    });
  });

  return (
    <div className="mt-8 animate-fade-in-up space-y-6">
      
      {/* 1. Optimization Result Banner & Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center bg-emerald-500/10 border border-emerald-500/20 rounded-[20px] p-6 shadow-lg shadow-emerald-500/5">
        <div className="flex items-start gap-4">
          <div className="bg-emerald-500/20 p-2.5 rounded-full text-emerald-400 shrink-0 border border-emerald-500/20">
            <CheckCircle2 size={24} />
          </div>
          <div>
            <h3 className="font-bold text-white text-lg">Route Plan Generated Successfully</h3>
            <p className="text-sm text-soft-gray mt-1">
              Optimized travel sequence for <span className="font-bold text-emerald-400">{data.vehicleType}</span>.
              Full journey consolidated into a single itinerary.
            </p>
          </div>
        </div>
        
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 bg-card-dark text-white border border-white/10 hover:bg-white/5 hover:border-white/20 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm print:hidden"
        >
          <Printer size={16} />
          Print Plan
        </button>
      </div>

      {/* 2. Global Resource & Load Configuration */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Vehicle & Driver Card */}
        <div className="bg-card-dark rounded-[20px] shadow-xl border border-white/5 p-6 space-y-4">
           <h4 className="font-bold text-white flex items-center gap-2">
             <Truck size={18} className="text-primary" /> Vehicle & Driver
           </h4>
           <div className="space-y-3">
             <div className="flex justify-between items-center border-b border-white/5 pb-2">
               <span className="text-sm text-soft-gray">Vehicle Type</span>
               <span className="text-sm font-semibold text-white">{data.vehicleType}</span>
             </div>
             <div className="flex justify-between items-center border-b border-white/5 pb-2">
               <span className="text-sm text-soft-gray">Driver</span>
               <span className="text-sm font-semibold text-white">{data.driverId}</span>
             </div>
              <div className="flex justify-between items-center">
               <span className="text-sm text-soft-gray">Total Legs</span>
               <span className="text-sm font-semibold text-white">{data.routes.length}</span>
             </div>
           </div>
        </div>

        {/* Load Capacity Card */}
        <div className="bg-card-dark rounded-[20px] shadow-xl border border-white/5 p-6 space-y-4">
           <h4 className="font-bold text-white flex items-center gap-2">
             <Layers size={18} className="text-sky-400" /> Capacity & Fill
           </h4>
           <div className="space-y-3">
             <div className="flex justify-between items-center border-b border-white/5 pb-2">
               <span className="text-sm text-soft-gray">Fill Level</span>
               <span className="text-sm font-bold text-sky-400">{data.fillLevel}%</span>
             </div>
             <div className="flex justify-between items-center border-b border-white/5 pb-2">
               <span className="text-sm text-soft-gray">Compliance</span>
               <span className="text-sm font-semibold text-white">{data.complianceCbm || "-"} CBM</span>
             </div>
              <div className="flex justify-between items-center">
               <span className="text-sm text-soft-gray">Status</span>
               <StatusBadge status="Optimized" />
             </div>
           </div>
        </div>

        {/* Cargo Details Card */}
        <div className="bg-card-dark rounded-[20px] shadow-xl border border-white/5 p-6 space-y-4">
           <h4 className="font-bold text-white flex items-center gap-2">
             <Package size={18} className="text-amber-400" /> Cargo Details
           </h4>
           <div className="space-y-3">
             <div className="flex justify-between items-center border-b border-white/5 pb-2">
               <span className="text-sm text-soft-gray">Customers</span>
               <span className="text-sm font-semibold text-white">{data.noOfCustomers}</span>
             </div>
             <div className="flex justify-between items-center border-b border-white/5 pb-2">
               <span className="text-sm text-soft-gray">Boxes</span>
               <span className="text-sm font-semibold text-white">{data.boxCount || "-"}</span>
             </div>
              <div className="flex justify-between items-center">
               <span className="text-sm text-soft-gray">Pallets</span>
               <span className="text-sm font-semibold text-white">{data.palletCount || "-"}</span>
             </div>
           </div>
        </div>
      </div>

      {/* 3. Unified Journey Table */}
      <div className="bg-card-dark rounded-[20px] shadow-xl border border-white/5 overflow-hidden">
        <div className="bg-white/5 px-6 py-4 border-b border-white/5 flex justify-between items-center">
           <h4 className="font-bold text-white flex items-center gap-2">
             <MapPin size={18} className="text-soft-gray" /> Full Journey Sequence
           </h4>
           <span className="text-xs font-bold bg-primary/20 text-primary px-3 py-1 rounded-lg border border-primary/20">
             {journeyPoints.length} Steps
           </span>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-soft-gray/60 font-bold uppercase tracking-wider text-[10px] border-b border-white/5">
              <tr>
                <th className="px-6 py-4 w-16 text-center">#</th>
                <th className="px-6 py-4">Event Type</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Notes / Details</th>
                <th className="px-6 py-4">AI Reasoning</th>
                <th className="px-6 py-4">Timing</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {journeyPoints.map((point, idx) => (
                <tr key={idx} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4 text-center text-soft-gray/40 font-mono text-xs font-bold">
                    {idx + 1}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {point.type === "start" && (
                        <span className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                          <MapPin size={14} />
                        </span>
                      )}
                      {point.type === "stop" && (
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                          <span className="font-bold text-xs">{point.stopIndex}</span>
                        </span>
                      )}
                      {point.type === "end" && (
                        <span className="w-8 h-8 rounded-full bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
                          <MapPin size={14} />
                        </span>
                      )}
                      
                      <div>
                        <span className={`block font-bold ${
                          point.type === "start" ? "text-emerald-400" : 
                          point.type === "end" ? "text-rose-400" : "text-primary"
                        }`}>
                          {point.type === "start" ? "Start Leg" : point.type === "end" ? "End Leg" : "Stop"}
                        </span>
                        <span className="text-xs text-soft-gray/50 font-medium">
                           Route Sequence {point.legIndex}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-bold text-white">
                    {point.location}
                  </td>
                  <td className="px-6 py-4 text-soft-gray">
                    {point.notes || "-"}
                  </td>
                  <td className="px-6 py-4">
                    {point.aiNote && (
                      <div className="flex items-start gap-1.5 text-xs text-sky-300 bg-sky-500/10 p-2 rounded-lg border border-sky-500/20 max-w-[200px]">
                        <Sparkles size={12} className="shrink-0 mt-0.5 text-sky-400" />
                        <span>{point.aiNote}</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 text-soft-gray font-mono text-xs">
                    {point.timing !== "-" ? point.timing : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

export default RoutePlanSummary;
