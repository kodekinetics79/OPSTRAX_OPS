
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Truck,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle2,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import RegistrationDetailsStep from "./steps/RegistrationDetailsStep";
import VehicleInfoStep from "./steps/VehicleInfoStep";
import CbmDetailsStep from "./steps/CbmDetailsStep";
import InsuranceSafetyStep from "./steps/InsuranceSafetyStep";
import MiscCommentsStep from "./steps/MiscCommentsStep";
import UploadedDocsStep from "./steps/UploadedDocsStep";
import ReviewSubmitStep from "./steps/ReviewSubmitStep";
import { MOCK_VEHICLES } from "@/data/mock/fleet";

const STEPS = [
  { id: "registration", title: "Registration Details" },
  { id: "vehicleInfo", title: "Vehicle Info" },
  { id: "cbmDetails", title: "CBM Details" },
  { id: "insuranceSafety", title: "Insurance & Safety" },
  { id: "misc", title: "Miscellaneous & Comments" },
  { id: "docs", title: "Uploaded Docs" },
  { id: "review", title: "Review & Submit" },
];

const vehicleSchema = yup.object({
  // Step 1: Registration Details
  vehicleId: yup.string().required("Vehicle ID is required"),
  plateOwnerMaster: yup.string().required("Plate Owner Master is required"),
  vehicleOwnerMaster: yup.string().required("Vehicle Owner Master is required"),
  ownerName: yup.string().required("Owner Name is required"),
  purchasePrice: yup
    .number()
    .typeError("Purchase Price must be a number")
    .nullable()
    .optional(),
  leaseAmount: yup
    .number()
    .typeError("Lease Amount must be a number")
    .nullable()
    .optional(),
  buyoutOption: yup
    .number()
    .typeError("Buyout Option must be a number")
    .nullable()
    .optional(),
  leaseStartDate: yup.string().required("Lease Start Date is required"),
  leaseEndDate: yup.string().required("Lease End Date is required"),
  leaseTerm: yup.string().required("Lease Term is required"),
  taxRate: yup
    .number()
    .typeError("Tax Rate must be a number")
    .nullable()
    .optional(),

  // Step 2: Vehicle Info
  unitNo: yup.string().required("Unit No is required"),
  vin: yup.string().required("VIN is required"),
  engineNo: yup.string().required("Engine No is required"),
  plateNo: yup.string().required("Plate No is required"),
  frontTireRadius: yup
    .string()
    .matches(/^[0-9A-Za-z.\/ -]*$/, "Invalid tire radius format")
    .nullable(),
  frontTireDepth: yup
    .string()
    .matches(/^[0-9A-Za-z.\/ -]*$/, "Invalid tire depth format")
    .nullable(),
  backTireRadius: yup
    .string()
    .matches(/^[0-9A-Za-z.\/ -]*$/, "Invalid tire radius format")
    .nullable(),
  backTireDepth: yup
    .string()
    .matches(/^[0-9A-Za-z.\/ -]*$/, "Invalid tire depth format")
    .nullable(),
  vehicleStatus: yup.string().required("Vehicle Status is required"),

  // Step 3: CBM Details
  cbmLength: yup.number().typeError("Length must be a number").min(0, "Min 0").required("Length is required"),
  cbmWidth: yup.number().typeError("Width must be a number").min(0, "Min 0").required("Width is required"),
  cbmHeight: yup.number().typeError("Height must be a number").min(0, "Min 0").required("Height is required"),
  cbmUom: yup.string().required("Unit of Measurement is required"),
  netWeight: yup.number().typeError("Net Weight must be a number").min(0, "Min 0").required("Net Weight is required"),
  grossWeight: yup.number().typeError("Gross Weight must be a number").min(0, "Min 0").required("Gross Weight is required"),
  dimensionalWeight: yup.number().typeError("Dimensional Weight must be a number").min(0, "Min 0").required("Dimensional Weight is required"),

  // Step 4: Insurance & Safety
  insuranceCompany: yup.string().required("Insurance Company is required"),
  insuranceStart: yup.string().required("Insurance Start is required"),
  insuranceEnd: yup.string().required("Insurance End is required"),
  policyNumber: yup.string().required("Policy Number is required"),
  mviSafetyProvince: yup.string().required("MVI Safety Province is required"),
  mviSafetyDue: yup.string().required("MVI Safety Due is required"),
  plateType: yup.string().required("Plate Type is required"),
  plateExpiry: yup.string().required("Plate Expiry is required"),
  plateProvince: yup.string().required("Plate Province is required"),

  // Step 4: Misc & Comments
  fuel: yup.string().nullable().optional(),
  fuelTrackerId: yup.string().nullable().optional(),
  gps: yup.string().nullable().optional(),
  gpsTrackerId: yup.string().nullable().optional(),
  temperature: yup.string().nullable().optional(),
  temperatureTrackerId: yup.string().nullable().optional(),
  speedMonitoring: yup.string().nullable().optional(),
  speedTrackerId: yup.string().nullable().optional(),
  macpassNumber: yup.string().nullable().optional(),
  straightPass: yup.string().nullable().optional(),
  dashcam: yup.string().nullable().optional(),
  comments: yup
    .string()
    .max(500, "Comments must be at most 500 characters")
    .nullable()
    .optional(),

  // Step 5: Uploaded Docs
  files: yup.array().of(yup.mixed()).min(1, "At least one file is required"),
});

const stepFields = [
  [
    "vehicleId",
    "plateOwnerMaster",
    "vehicleOwnerMaster",
    "ownerName",
    "purchasePrice",
    "leaseAmount",
    "buyoutOption",
    "leaseStartDate",
    "leaseEndDate",
    "leaseTerm",
    "taxRate",
  ],
  [
    "unitNo",
    "vin",
    "engineNo",
    "make",
    "model",
    "year",
    "colour",
    "plateNo",
    "frontTireRadius",
    "frontTireDepth",
    "backTireRadius",
    "backTireDepth",
    "truckLength",
    "typeOfVehicle",
    "vehicleStatus",
    "liftgate",
    "keycode",
  ],
  [
    "cbmLength",
    "cbmWidth",
    "cbmHeight",
    "cbmUom",
    "netWeight",
    "grossWeight",
    "dimensionalWeight",
  ],
  [
    "insuranceCompany",
    "policyNumber",
    "insuranceStart",
    "insuranceEnd",
    "mviSafetyProvince",
    "mviSafetyDue",
    "plateType",
    "plateExpiry",
    "plateProvince",
  ],
  [
    "fuel",
    "fuelTrackerId",
    "gps",
    "gpsTrackerId",
    "temperature",
    "temperatureTrackerId",
    "speedMonitoring",
    "speedTrackerId",
    "macpassNumber",
    "straightPass",
    "dashcam",
    "highway104Toll",
    "station",
    "comments",
  ],
  ["files"],
  [], // review step
];

const AddVehicle = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const isEditMode = !!id;

  const methods = useForm({
    resolver: yupResolver(vehicleSchema),
    defaultValues: {
      vehicleId: "",
      plateOwnerMaster: "",
      vehicleOwnerMaster: "",
      ownerName: "",
      purchasePrice: "",
      leaseAmount: "",
      buyoutOption: "",
      leaseStartDate: "",
      leaseEndDate: "",
      leaseTerm: "",
      taxRate: "",
      unitNo: "",
      vin: "",
      engineNo: "",
      make: "",
      model: "",
      year: "",
      colour: "",
      plateNo: "",
      frontTireRadius: "",
      frontTireDepth: "",
      backTireRadius: "",
      backTireDepth: "",
      truckLength: "",
      typeOfVehicle: "",
      vehicleStatus: "",
      liftgate: "",
      keycode: "",
      cbmLength: "",
      cbmWidth: "",
      cbmHeight: "",
      cbmUom: "",
      netWeight: "",
      grossWeight: "",
      dimensionalWeight: "",
      insuranceCompany: "",
      policyNumber: "",
      insuranceStart: "",
      insuranceEnd: "",
      mviSafetyProvince: "",
      mviSafetyDue: "",
      plateType: "",
      plateExpiry: "",
      plateProvince: "",
      tracker: "",
      fuel: "",
      gps: "",
      temperature: "",
      speedMonitoring: "",
      macpassNumber: "",
      straightPass: "",
      dashcam: "",
      highway104Toll: "",
      station: "",
      comments: "",
      files: [],
    },
    mode: "onTouched",
  });

  const { trigger, handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode) {
      const vehicle = MOCK_VEHICLES.find((v) => v.vehicle_id === id || v.id === id);
      if (vehicle) {
        reset({
          ...vehicle,
          vehicleId: vehicle.vehicle_id || vehicle.id,
          plateNo: vehicle.plate_number || vehicle.plate,
          typeOfVehicle: vehicle.type_of_vehicle || vehicle.type,
          vehicleStatus: vehicle.vehicle_status || vehicle.status,
          // Map other fields if necessary based on mock data structure
        });
      }
    }
  }, [id, isEditMode, reset]);

  const nextStep = async () => {
    const fields = stepFields[currentStep] || [];

    if (fields.length === 0) {
      setCurrentStep((prev) => Math.min(prev + 1, STEPS.length - 1));
      return;
    }

    const isStepValid = await trigger(fields);

    if (isStepValid) {
      setCurrentStep((prev) => prev + 1);
    } else {
      console.log("Validation failed for fields:", fields);
      console.log("Current Errors:", methods.formState.errors);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const onSubmit = (data) => {
    console.log("Saving Vehicle Data:", data);
    setSubmittedData(data);
    setIsSuccessModalOpen(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <RegistrationDetailsStep />;
      case 1:
        return <VehicleInfoStep />;
      case 2:
        return <CbmDetailsStep />;
      case 3:
        return <InsuranceSafetyStep />;
      case 4:
        return <MiscCommentsStep />;
      case 5:
        return <UploadedDocsStep />;
      case 6:
        return <ReviewSubmitStep />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-blue-900 via-slate-900 to-fade p-8 text-white shadow-xl border border-white/10">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <Truck size={24} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {isEditMode ? "Update Vehicle Record" : "Register New Vehicle"}
              </h1>
            </div>
            <p className="text-gray-400 text-sm font-medium ml-1">
              {isEditMode 
                ? "Modify the vehicle's technical specifications and registration."
                : "Add new assets to your fleet management registry."}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/fleet/vehicles")}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl text-sm font-semibold transition-all text-gray-300"
          >
            Cancel & Exit
          </button>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="bg-card-dark rounded-2xl shadow-lg border border-white/5 p-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
          {STEPS.map((step, idx) => (
            <div
              key={step.id}
              className="relative z-10 flex flex-col items-center group"
            >
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                  idx <= currentStep
                    ? "bg-primary border-primary text-black shadow-lg shadow-primary/20"
                    : "bg-card-dark border-white/10 text-gray-600 group-hover:border-white/20"
                }`}
              >
                {idx < currentStep ? <CheckCircle2 size={20} /> : idx + 1}
              </div>
              <span
                className={`text-[10px] font-bold mt-2 uppercase tracking-wider transition-colors duration-300 hidden md:block ${
                  idx <= currentStep ? "text-primary" : "text-gray-600"
                }`}
              >
                {step.title}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Form Content */}
      <FormProvider {...methods}>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="bg-card-dark rounded-2xl shadow-lg border border-white/5 overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white">
                {STEPS[currentStep].title}
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Step {currentStep + 1} of {STEPS.length}
              </p>
            </div>

            {renderStepContent()}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 bg-black/20 border-t border-white/5 flex justify-between items-center">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold transition-all ${
                currentStep === 0
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:bg-white/5 active:scale-95"
              }`}
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            {currentStep === STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => handleSubmit(onSubmit)()}
                className="flex items-center gap-2 bg-primary text-black px-8 py-2.5 rounded-xl font-bold shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
              >
                <Save size={20} />
                <span>{isEditMode ? "Update Vehicle" : "Register Vehicle"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 bg-white text-black px-8 py-2.5 rounded-xl font-bold shadow-lg hover:bg-gray-100 transition-all active:scale-95"
              >
                <span>Next Step</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </form>
      </FormProvider>

      {/* Success Modal */}
      {isSuccessModalOpen && (
        <Modal
          isOpen={isSuccessModalOpen}
          onClose={() => navigate("/admin/fleet/vehicles")}
          title={isEditMode ? "Vehicle Updated!" : "Vehicle Registered!"}
          subtitle={isEditMode ? "Vehicle record has been successfully updated." : "New vehicle has been successfully added to the registry."}
          icon={CheckCircle2}
          size="sm"
        >
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Vehicle <strong>{submittedData?.vehicleId}</strong> (
              {submittedData?.plateNo}) has been registered. You can now assign
              drivers and track its performance.
            </p>
            <button
              onClick={() => navigate("/admin/fleet/vehicles")}
              className="w-full mt-8 bg-primary text-black py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Go to Vehicle Registry
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AddVehicle;
