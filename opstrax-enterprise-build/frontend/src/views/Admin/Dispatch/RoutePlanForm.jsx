import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm, FormProvider, useFieldArray } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Map,
  FileText,
  Plus,
  Trash2,
  MapPin,
  Clock,
  Truck,
  Package,
  Navigation,
  Loader2,
} from "lucide-react";
import { PremiumHeader } from "@/components";
import RoutePlanSummary from "./RoutePlanSummary";
import AIProcessingOverlay from "./AIProcessingOverlay";
import { generateSimulationSteps, simulateOptimization } from "./mockAI";

// Schema for a single route (Vehicle/Driver moved to parent)
const routeSchema = yup.object({
  // Route Details
  routeStart: yup.string().required("Route Start is required"),
  routeEnd: yup.string().required("Route End is required"),
  timing: yup.string().nullable(),

  // Stops (Optional)
  stops: yup.array().of(
    yup.object().shape({
      location: yup.string().required("Location is required"),
      notes: yup.string().nullable(),
    })
  ),
});

// Main schema wrapper with Top-Level Vehicle/Driver and Load Details
const schema = yup.object({
  vehicleType: yup.string().required("Vehicle Type is required"),
  driverId: yup.string().required("Driver is required"),

  // Load Details (Global)
  fillLevel: yup
    .number()
    .typeError("Fill Level must be a number")
    .min(0, "Min 0%")
    .max(100, "Max 100%")
    .required("Fill Level is required"),
  noOfCustomers: yup
    .number()
    .typeError("No of Customers must be a number")
    .required("No of Customers is required"),
  boxCount: yup
    .number()
    .nullable()
    .transform((v, o) => (o === "" ? null : v)),
  palletCount: yup
    .number()
    .nullable()
    .transform((v, o) => (o === "" ? null : v)),
  complianceCbm: yup
    .number()
    .nullable()
    .transform((v, o) => (o === "" ? null : v)),

  routes: yup.array().of(routeSchema).min(1, "At least one route is required"),
});

const RouteCard = ({
  routeIndex,
  remove,
  canRemove,
  control,
  register,
  errors,
}) => {
  const {
    fields,
    append,
    remove: removeStop,
  } = useFieldArray({
    control,
    name: `routes.${routeIndex}.stops`,
  });

  const routeErrors = errors.routes?.[routeIndex] || {};

  return (
    <div className="bg-card-dark rounded-[20px] shadow-xl border border-white/5 p-6 relative animate-fade-in-up">
      {/* Route Header */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-white/5">
        <h3 className="font-bold text-lg text-white flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm border border-primary/20">
            {routeIndex + 1}
          </div>
          Route Sequence {routeIndex + 1}
        </h3>
        {canRemove && (
          <button
            type="button"
            onClick={() => remove(routeIndex)}
            className="text-rose-400 hover:bg-rose-500/10 p-2 rounded-xl transition-colors flex items-center gap-2 text-sm font-bold"
          >
            <Trash2 size={16} /> Remove Route
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Left Column: Path */}
        <div className="space-y-6">
          {/* Path Section */}
          <div className="space-y-4">
            <h4 className="font-bold text-soft-gray flex items-center gap-2 text-sm uppercase tracking-wide">
              <Navigation size={16} className="text-soft-gray/50" /> Route Path
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white/5 p-4 rounded-xl border border-white/5">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-soft-gray/60 uppercase tracking-wide">
                  START POINT
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-2.5 text-emerald-400"
                    size={16}
                  />
                  <input
                    {...register(`routes.${routeIndex}.routeStart`)}
                    placeholder="Depot / Start"
                    className="w-full pl-9 p-2.5 rounded-xl border border-white/10 bg-dark-bg text-white text-sm focus:border-primary/50 focus:bg-dark-bg outline-none transition-all"
                  />
                </div>
                {routeErrors.routeStart && (
                  <p className="text-xs text-rose-400 font-bold mt-1">
                    {routeErrors.routeStart.message}
                  </p>
                )}
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-soft-gray/60 uppercase tracking-wide">
                  END POINT
                </label>
                <div className="relative">
                  <MapPin
                    className="absolute left-3 top-2.5 text-rose-400"
                    size={16}
                  />
                  <input
                    {...register(`routes.${routeIndex}.routeEnd`)}
                    placeholder="Destination"
                    className="w-full pl-9 p-2.5 rounded-xl border border-white/10 bg-dark-bg text-white text-sm focus:border-primary/50 focus:bg-dark-bg outline-none transition-all"
                  />
                </div>
                {routeErrors.routeEnd && (
                  <p className="text-xs text-rose-400 font-bold mt-1">
                    {routeErrors.routeEnd.message}
                  </p>
                )}
              </div>
            </div>

            <div className="relative">
              <Clock
                className="absolute left-3 top-2.5 text-soft-gray/50"
                size={16}
              />
              <input
                {...register(`routes.${routeIndex}.timing`)}
                placeholder="Estimated Timing (e.g. 09:00 AM - 05:00 PM)"
                className="w-full pl-9 p-2.5 rounded-xl border border-white/10 bg-dark-bg text-white text-sm focus:border-primary/50 focus:bg-dark-bg outline-none transition-all"
              />
            </div>
          </div>
        </div>

        {/* Right Column: Stops */}
        <div className="space-y-6">
          {/* Stops Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <h4 className="font-bold text-soft-gray flex items-center gap-2 text-sm uppercase tracking-wide">
                <MapPin size={16} className="text-soft-gray/50" /> Stops
              </h4>
              <button
                type="button"
                onClick={() => append({ location: "", notes: "" })}
                className="text-xs flex items-center gap-1 text-primary font-bold hover:text-dark-bg hover:bg-primary px-3 py-1.5 rounded-lg transition-colors border border-primary/20 hover:border-transparent"
              >
                <Plus size={14} /> Add Stop
              </button>
            </div>

            <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {fields.length === 0 && (
                <div className="text-sm text-soft-gray/40 italic text-center py-6 bg-white/5 rounded-xl border border-dashed border-white/10">
                  No stops added. Direct route from Start to End.
                </div>
              )}
              {fields.map((field, stopIndex) => (
                <div key={field.id} className="flex items-start gap-2 group">
                  <div className="mt-2.5 w-6 h-6 rounded-full bg-white/5 text-soft-gray flex items-center justify-center text-[10px] font-bold shrink-0 border border-white/10">
                    {stopIndex + 1}
                  </div>
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <input
                      {...register(
                        `routes.${routeIndex}.stops.${stopIndex}.location`
                      )}
                      placeholder="Location"
                      className={`w-full p-2.5 rounded-xl border bg-dark-bg text-white text-sm focus:border-primary/50 outline-none transition-all ${routeErrors.stops?.[stopIndex]?.location ? "border-rose-400" : "border-white/10"}`}
                    />
                    <input
                      {...register(
                        `routes.${routeIndex}.stops.${stopIndex}.notes`
                      )}
                      placeholder="Notes"
                      className="w-full p-2.5 rounded-xl border border-white/10 bg-dark-bg text-white text-sm focus:border-primary/50 outline-none transition-all"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeStop(stopIndex)}
                    className="mt-2 text-soft-gray/30 hover:text-rose-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
            {routeErrors.stops && (
              <p className="text-xs text-rose-400 font-bold">
                {routeErrors.stops.message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};;

const RoutePlanForm = () => {
  const navigate = useNavigate();
  const [summaryData, setSummaryData] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);
  const [formDataCache, setFormDataCache] = useState(null);

  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      vehicleType: "",
      driverId: "",
      fillLevel: "",
      noOfCustomers: "",
      boxCount: "",
      palletCount: "",
      complianceCbm: "",
      routes: [
        {
          routeStart: "",
          routeEnd: "",
          timing: "",
          stops: [],
        },
      ],
    },
    mode: "onChange",
  });

  const {
    control,
    handleSubmit,
    register,
    formState: { errors },
  } = methods;

  const { fields, append, remove } = useFieldArray({
    control,
    name: "routes",
  });

  const onSubmit = (data) => {
    setFormDataCache(data);
    setIsSimulating(true);
    setSummaryData(null);
  };

  const handleSimulationComplete = async () => {
    if (!formDataCache) return;
    
    const optimizedResult = await simulateOptimization(formDataCache);
    setSummaryData(optimizedResult);
    setIsSimulating(false);
    setFormDataCache(null);
  };

  return (
    <div className="w-full space-y-6 pb-20 animate-fade-in">
      <AIProcessingOverlay 
        isVisible={isSimulating} 
        steps={generateSimulationSteps()} 
        onComplete={handleSimulationComplete} 
      />
      
      <div className="print:hidden space-y-6">
        <PremiumHeader
          icon={Map}
          title="AI Route Planner"
          subtitle="Simulate and generate optimized route plans"
          actions={
            <button
              onClick={() => navigate("/admin/dispatch/routes")}
              className="text-slate-500 hover:text-slate-700 font-medium text-sm transition-colors"
            >
              Cancel
            </button>
          }
        />

        <div className="max-w-7xl mx-auto">
          <FormProvider {...methods}>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Top Level: Vehicle & Driver Configuration */}
            <div className="bg-card-dark rounded-[20px] shadow-xl border border-white/5 p-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-6">
                <Truck className="text-primary" size={24} />
                Vehicle & Driver Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-soft-gray/60 uppercase tracking-wide">
                    Vehicle Type <span className="text-primary">*</span>
                  </label>
                  <select
                    {...register("vehicleType")}
                    className={`w-full p-3 rounded-xl border bg-dark-bg text-white text-sm focus:border-primary/50 outline-none transition-all ${errors.vehicleType ? "border-rose-400" : "border-white/10"}`}
                  >
                    <option value="">Select Vehicle Type</option>
                    <option value="FlatBed">FlatBed</option>
                    <option value="3 Shezore">3 Shezore</option>
                    <option value="Container 20ft">Container 20ft</option>
                    <option value="Container 40ft">Container 40ft</option>
                  </select>
                  {errors.vehicleType && (
                    <p className="text-xs text-rose-400 font-bold mt-1">
                      {errors.vehicleType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-soft-gray/60 uppercase tracking-wide">
                    Driver <span className="text-primary">*</span>
                  </label>
                  <select
                    {...register("driverId")}
                    className={`w-full p-3 rounded-xl border bg-dark-bg text-white text-sm focus:border-primary/50 outline-none transition-all ${errors.driverId ? "border-rose-400" : "border-white/10"}`}
                  >
                    <option value="">Select Driver</option>
                    <option value="D001">John Doe (Lic: A123)</option>
                    <option value="D002">Jane Smith (Lic: B456)</option>
                  </select>
                  {errors.driverId && (
                    <p className="text-xs text-rose-400 font-bold mt-1">
                      {errors.driverId.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Top Level: Load Details Configuration */}
            <div className="bg-card-dark rounded-[20px] shadow-xl border border-white/5 p-6">
              <h3 className="font-bold text-lg text-white flex items-center gap-2 mb-6">
                <Package className="text-primary" size={24} />
                Load Details
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-soft-gray/60 uppercase tracking-wide">
                    Fill Level % <span className="text-primary">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("fillLevel")}
                    className={`w-full p-3 rounded-xl border bg-dark-bg text-white text-sm focus:border-primary/50 outline-none transition-all ${errors.fillLevel ? "border-rose-400" : "border-white/10"}`}
                    placeholder="0-100"
                  />
                  {errors.fillLevel && (
                    <p className="text-xs text-rose-400 font-bold mt-1">
                      {errors.fillLevel.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-soft-gray/60 uppercase tracking-wide">
                    Customers <span className="text-primary">*</span>
                  </label>
                  <input
                    type="number"
                    {...register("noOfCustomers")}
                    className={`w-full p-3 rounded-xl border bg-dark-bg text-white text-sm focus:border-primary/50 outline-none transition-all ${errors.noOfCustomers ? "border-rose-400" : "border-white/10"}`}
                    placeholder="Count"
                  />
                  {errors.noOfCustomers && (
                    <p className="text-xs text-rose-400 font-bold mt-1">
                      {errors.noOfCustomers.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-soft-gray/60 uppercase tracking-wide">
                    Boxes
                  </label>
                  <input
                    type="number"
                    {...register("boxCount")}
                    className="w-full p-3 rounded-xl border border-white/10 bg-dark-bg text-white text-sm focus:border-primary/50 outline-none transition-all"
                    placeholder="Optional"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-soft-gray/60 uppercase tracking-wide">
                    Pallets
                  </label>
                  <input
                    type="number"
                    {...register("palletCount")}
                    className="w-full p-3 rounded-xl border border-white/10 bg-dark-bg text-white text-sm focus:border-primary/50 outline-none transition-all"
                    placeholder="Optional"
                  />
                </div>
                
                 <div className="space-y-2">
                  <label className="text-xs font-bold text-soft-gray/60 uppercase tracking-wide">
                    Compliance (CBM)
                  </label>
                  <input
                    type="number"
                    {...register("complianceCbm")}
                    className="w-full p-3 rounded-xl border border-white/10 bg-dark-bg text-white text-sm focus:border-primary/50 outline-none transition-all"
                    placeholder="Optional"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {fields.map((field, index) => (
                <RouteCard
                  key={field.id}
                  routeIndex={index}
                  remove={remove}
                  canRemove={fields.length > 1}
                  control={control}
                  register={register}
                  errors={errors}
                />
              ))}
            </div>

            <div className="flex justify-center">
              <button
                type="button"
                onClick={() =>
                  append({
                    routeStart: "",
                    routeEnd: "",
                    timing: "",
                    stops: [],
                  })
                }
                className="flex items-center gap-2 text-primary bg-primary/10 hover:bg-primary/20 px-6 py-3 rounded-full font-bold transition-all border border-primary/20"
              >
                <Plus size={20} />
                Add Another Route
              </button>
            </div>

            <div className="sticky bottom-6 bg-card-dark/90 backdrop-blur-md p-4 rounded-[20px] border border-white/10 shadow-xl flex justify-end">
              <button
                type="submit"
                disabled={isSimulating}
                className="flex items-center justify-center gap-2 bg-primary text-dark-bg px-8 py-3 rounded-xl font-extrabold shadow-[0_0_15px_rgba(240,249,65,0.4)] hover:shadow-[0_0_25px_rgba(240,249,65,0.6)] hover:scale-105 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed min-w-[240px]"
              >
                {isSimulating ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Simulating AI Optimization...
                  </>
                ) : (
                  <>
                    <FileText size={20} />
                    Generate Optimized Plan
                  </>
                )}
              </button>
            </div>
          </form>
          </FormProvider>
        </div>
      </div>

      {/* Summary Table */}
      {summaryData && (
        <div className="max-w-7xl mx-auto print:max-w-none">
          <RoutePlanSummary data={summaryData} />
        </div>
      )}
    </div>
  );
};

export default RoutePlanForm;
