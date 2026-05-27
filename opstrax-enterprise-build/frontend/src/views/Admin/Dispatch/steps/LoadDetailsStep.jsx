import React from "react";
import { useFormContext } from "react-hook-form";
import { Package, Percent, Users, Box, Scale } from "lucide-react";

const LoadDetailsStep = () => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100 mb-6">
        <h3 className="text-sm font-semibold text-blue-800 mb-1 flex items-center gap-2">
          <Package size={16} />
          Load & Compliance Details
        </h3>
        <p className="text-xs text-blue-600">
          Enter the load specifications, customer count, and compliance requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Fill Level */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Fill Level (%) <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Percent className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="number"
              {...register("fillLevel")}
              placeholder="e.g. 80"
              className={`w-full pl-10 p-2.5 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.fillLevel
                  ? "border-red-300 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>
          {errors.fillLevel && (
            <p className="text-xs text-red-500 font-medium">
              {errors.fillLevel.message}
            </p>
          )}
        </div>

        {/* No of Customers */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            No of Customers <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <Users className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="number"
              {...register("noOfCustomers")}
              placeholder="e.g. 10"
              className={`w-full pl-10 p-2.5 rounded-lg border bg-white focus:ring-2 focus:ring-blue-500/20 transition-all ${
                errors.noOfCustomers
                  ? "border-red-300 focus:border-red-500"
                  : "border-slate-200 focus:border-blue-500"
              }`}
            />
          </div>
          {errors.noOfCustomers && (
            <p className="text-xs text-red-500 font-medium">
              {errors.noOfCustomers.message}
            </p>
          )}
        </div>

        {/* Box Count */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Box Count
          </label>
          <div className="relative">
            <Box className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="number"
              {...register("boxCount")}
              placeholder="e.g. 50"
              className="w-full pl-10 p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Pallet Count */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Pallet Count
          </label>
          <div className="relative">
            <Box className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="number"
              {...register("palletCount")}
              placeholder="e.g. 14"
              className="w-full pl-10 p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>

        {/* Pallet Dimensions */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Pallet Dimensions
          </label>
          <input
            type="text"
            {...register("palletDimensions")}
            placeholder="e.g. 1.2*3"
            className="w-full p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
          />
        </div>

        {/* Compliance (CBM) */}
        <div className="space-y-1.5">
          <label className="text-sm font-medium text-slate-700">
            Compliance (CBM)
          </label>
          <div className="relative">
            <Scale className="absolute left-3 top-3 text-slate-400" size={16} />
            <input
              type="number"
              {...register("complianceCbm")}
              placeholder="e.g. 2"
              className="w-full pl-10 p-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoadDetailsStep;
