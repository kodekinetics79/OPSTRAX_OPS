import React from "react";
import { useFormContext } from "react-hook-form";
import { MapPin, Clock, Navigation } from "lucide-react";

const DispatchPlanStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-2">
          <Navigation size={16} />
          Dispatch Plan Details
        </h3>
        <p className="text-xs text-blue-600">
          Define the route range, specific locations, and timing for the dispatch.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Route Start */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Route Start <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              {...register("routeStart")}
              placeholder="e.g. Route 1"
              className={`w-full pl-10 p-2.5 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.routeStart
                  ? "border-red-300 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>
          {errors.routeStart && (
            <p className="text-xs text-red-500 font-medium">
              {errors.routeStart.message}
            </p>
          )}
        </div>

        {/* Route End */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Route End <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              {...register("routeEnd")}
              placeholder="e.g. Route 5"
              className={`w-full pl-10 p-2.5 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.routeEnd
                  ? "border-red-300 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>
          {errors.routeEnd && (
            <p className="text-xs text-red-500 font-medium">
              {errors.routeEnd.message}
            </p>
          )}
        </div>

        {/* Locations */}
        <div className="col-span-1 md:col-span-2 space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Locations (Comma separated) <span className="text-red-500">*</span>
          </label>
          <textarea
            {...register("locations")}
            placeholder="e.g. Clifton, DHA, Saddar"
            rows="2"
            className={`w-full p-2.5 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${
              errors.locations
                ? "border-red-300 focus:border-red-500"
                : "border-slate-200 focus:border-blue-500"
            }`}
          />
          {errors.locations && (
            <p className="text-xs text-red-500 font-medium">
              {errors.locations.message}
            </p>
          )}
        </div>

        {/* Timing */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Timing
          </label>
          <div className="relative">
            <Clock className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="text"
              {...register("timing")}
              placeholder="e.g. 09:00 AM - 05:00 PM"
              className="w-full pl-10 p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default DispatchPlanStep;
