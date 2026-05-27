import React from "react";
import { useFormContext } from "react-hook-form";
import { Truck, User } from "lucide-react";

const VehicleDriverStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-2">
          <Truck size={16} />
          Vehicle & Driver Selection
        </h3>
        <p className="text-xs text-blue-600">
          Select the vehicle type and assign a driver for this route plan.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vehicle Type */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Type of Vehicle <span className="text-red-500">*</span>
          </label>
          <select
            {...register("vehicleType")}
            className={`w-full p-2.5 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${
              errors.vehicleType
                ? "border-red-300 focus:border-red-500"
                : "border-slate-200 focus:border-blue-500"
            }`}
          >
            <option value="">Select Vehicle Type</option>
            <option value="FlatBed">FlatBed</option>
            <option value="3 Shezore">3 Shezore</option>
            <option value="Container 20ft">Container 20ft</option>
            <option value="Container 40ft">Container 40ft</option>
          </select>
          {errors.vehicleType && (
            <p className="text-xs text-red-500 font-medium">
              {errors.vehicleType.message}
            </p>
          )}
        </div>

        {/* Driver Selection */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Driver Selection <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <User className="absolute left-3 top-3 text-slate-400" size={16} />
            <select
              {...register("driverId")}
              className={`w-full pl-10 p-2.5 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.driverId
                  ? "border-red-300 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            >
              <option value="">Select Driver</option>
              <option value="D001">John Doe (Lic: A123) - FlatBed</option>
              <option value="D002">Jane Smith (Lic: B456) - 3 Shezore</option>
              <option value="D003">Mike Johnson (Lic: C789) - Container</option>
            </select>
          </div>
          {errors.driverId && (
            <p className="text-xs text-red-500 font-medium">
              {errors.driverId.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default VehicleDriverStep;
