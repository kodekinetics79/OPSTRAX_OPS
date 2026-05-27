
import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useEffect } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  UserSquare2,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle2,
} from "lucide-react";
import Modal from "@/components/common/Modal";
import PersonalInfoStep from "./steps/PersonalInfoStep";
import LicenseLegalStep from "./steps/LicenseLegalStep";
import SalaryPayStep from "./steps/SalaryPayStep";
import InsuranceStep from "./steps/InsuranceStep";
import MedicalInfoStep from "./steps/MedicalInfoStep";
import FuelCardStep from "./steps/FuelCardStep";
import ViolationsAccidentsStep from "./steps/ViolationsAccidentsStep";
import ReviewSubmitStep from "./steps/ReviewSubmitStep";
import { MOCK_DRIVERS } from "@/data/mock/fleet";

const STEPS = [
  { id: "personal", title: "Personal Information" },
  { id: "license", title: "License & Legal" },
  { id: "salary", title: "Salary & Pay" },
  { id: "insurance", title: "Insurance" },
  { id: "medical", title: "Medical Information" },
  { id: "fuel", title: "Fuel Card" },
  { id: "violations", title: "Violations & Accidents" },
  { id: "review", title: "Review & Submit" },
];

const driverSchema = yup.object({
  // Step 1: Personal
  name: yup.string().required("Name is required"),
  phone: yup.string().required("Phone is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  dob: yup.string().required("Date of Birth is required"),
  joiningDate: yup.string().required("Joining Date is required"),
  address: yup.string().required("Address is required"),
  experience: yup.string().required("Experience is required"),
  height: yup.string().required("Height is required"),
  status: yup.string().oneOf(["Active", "Inactive"]).nullable(),

  // Step 2: License & Legal
  licenseNumber: yup.string().required("License Number is required"),
  licenseType: yup.string().nullable(),
  expiryDate: yup.string().required("Expiry Date is required"),

  // Step 3: Salary & Pay
  salaryType: yup.string().nullable(),
  overtimeRate: yup
    .number()
    .typeError("Overtime Rate must be a number")
    .nullable()
    .optional(),
  bonus: yup.number().typeError("Bonus must be a number").nullable().optional(),

  // Step 4: Insurance
  insuranceCompany: yup.string().required("Company is required"),
  policyNumber: yup.string().required("Policy Number is required"),
  coveragePeriod: yup.string().nullable(),

  // Step 5: Medical Information
  emergencyContact: yup.string().required("Emergency Contact is required"),

  // Step 6: Fuel Card
  cardNumber: yup.string().required("Card Number is required"),
  cardProvider: yup.string().nullable(),
  spendingLimit: yup
    .number()
    .typeError("Spending Limit must be a number")
    .required("Spending Limit is required"),
  assignedVehicle: yup.string().nullable(),

  // Step 7: Violations & Accidents
  violations: yup.array().of(
    yup.object({
      description: yup.string().required("Description is required"),
      date: yup.string().nullable(),
      fineAmount: yup
        .number()
        .typeError("Fine Amount must be a number")
        .required("Fine Amount is required"),
    }),
  ),
  accidents: yup.array().of(
    yup.object({
      description: yup.string().required("Description is required"),
      date: yup.string().nullable(),
      fineAmount: yup
        .number()
        .typeError("Fine Amount must be a number")
        .required("Fine Amount is required"),
    }),
  ),
});

const stepFields = [
  ["name", "phone", "email", "dob", "joiningDate", "address", "experience", "height", "status"],
  ["licenseNumber", "licenseType", "expiryDate"],
  ["salaryType", "overtimeRate", "bonus"],
  ["insuranceCompany", "policyNumber", "coveragePeriod"],
  ["emergencyContact"],
  ["cardNumber", "cardProvider", "spendingLimit", "assignedVehicle"],
  ["violations", "accidents"],
  [], // review step - no new validation
];

const AddDriver = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const isEditMode = !!id;

  const methods = useForm({
    resolver: yupResolver(driverSchema),
    defaultValues: {
      name: "",
      phone: "",
      email: "",
      dob: "",
      joiningDate: "",
      address: "",
      experience: "",
      height: "",
      status: "",
      licenseNumber: "",
      licenseType: "",
      expiryDate: "",
      salaryType: "",
      overtimeRate: "",
      bonus: "",
      insuranceCompany: "",
      policyNumber: "",
      coveragePeriod: "",
      emergencyContact: "",
      cardNumber: "",
      cardProvider: "",
      spendingLimit: "",
      assignedVehicle: "",
      violations: [],
      accidents: [],
    },
    mode: "onTouched",
  });

  const { trigger, handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode) {
      const driver = MOCK_DRIVERS.find((d) => d.id === id);
      if (driver) {
        reset({
          ...driver,
          insuranceCompany: driver.insurance,
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

    // Trigger validation for ONLY the current fields
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
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data) => {
    console.log("Saving Driver Data:", data);
    setSubmittedData(data);
    setIsSuccessModalOpen(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <PersonalInfoStep />;
      case 1:
        return <LicenseLegalStep />;
      case 2:
        return <SalaryPayStep />;
      case 3:
        return <InsuranceStep />;
      case 4:
        return <MedicalInfoStep />;
      case 5:
        return <FuelCardStep />;
      case 6:
        return <ViolationsAccidentsStep />;
      case 7:
        return <ReviewSubmitStep />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-indigo-900/50 via-gray-900/50 to-fade p-8 text-white shadow-xl border border-white/10">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10">
                <UserSquare2 size={24} className="text-primary" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                {isEditMode ? "Update Driver Record" : "Onboard New Driver"}
              </h1>
            </div>
            <p className="text-gray-400 text-sm font-medium ml-1">
              {isEditMode 
                ? "Modify the driver's profile and documentation."
                : "Follow the steps to complete the driver registration process."}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/drivers/profiles")}
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
                <span>Save & Onboard</span>
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
          onClose={() => navigate("/admin/drivers/profiles")}
          title={isEditMode ? "Driver Updated!" : "Driver Onboarded!"}
          subtitle={isEditMode ? "Driver record has been successfully updated." : "New driver record has been successfully created."}
          icon={CheckCircle2}
          size="sm"
        >
          <div className="py-6 text-center">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20">
              <CheckCircle2 size={32} />
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              The driver <strong>{submittedData?.name}</strong> has been added
              to the fleet. You can now assign vehicles and manage their
              compliance logs.
            </p>
            <button
              onClick={() => navigate("/admin/drivers/profiles")}
              className="w-full mt-8 bg-primary text-black py-3 rounded-xl font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20"
            >
              Go to Driver List
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default AddDriver;
