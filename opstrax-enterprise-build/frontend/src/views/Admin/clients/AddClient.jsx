import { useNavigate, useParams } from "react-router-dom";
import { useForm, FormProvider } from "react-hook-form";
import { useEffect, useState } from "react";
import { yupResolver } from "@hookform/resolvers/yup";
import {
  Building2,
  ChevronRight,
  ChevronLeft,
  Save,
  CheckCircle2,
} from "lucide-react";
import { Modal } from "@/components";
import { CLIENTS, clientSchema } from "@/components/admin/clients/clients.data";
import BasicInfoStep from "./steps/BasicInfoStep";
import ContractLogisticsStep from "./steps/ContractLogisticsStep";
import FinancialsDocsStep from "./steps/FinancialsDocsStep";
import ReviewStep from "./steps/ReviewStep";

const STEPS = [
  { id: "basic", title: "Basic Information" },
  { id: "contract", title: "Contract & Logistics" },
  { id: "financials", title: "Financials & Documents" },
  { id: "review", title: "Review & Submit" },
];

const stepFields = [
  ["category", "companyName", "contactPerson", "email", "phone", "location", "businessType", "address"],
  ["contractExpiry", "preferredLoadType", "avgMonthlyLoads", "deliveryStartTime", "deliveryEndTime"],
  ["preferredPaymentMethod", "creditLimit", "taxId"],
  [], // review step
];

const AddClient = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [submittedData, setSubmittedData] = useState(null);
  const isEditMode = !!id;

  const methods = useForm({
    resolver: yupResolver(clientSchema),
    defaultValues: {
      category: "",
      companyName: "",
      contactPerson: "",
      email: "",
      phone: "",
      website: "",
      location: "",
      businessType: "",
      address: "",
      contractExpiry: "",
      preferredLoadType: "",
      avgMonthlyLoads: "",
      specialInstruction: "",
      deliveryStartTime: "",
      deliveryEndTime: "",
      preferredPaymentMethod: "",
      creditLimit: "",
      taxId: "",
    },
    mode: "onTouched",
  });

  const { trigger, handleSubmit, reset } = methods;

  useEffect(() => {
    if (isEditMode) {
      const client = CLIENTS.find((c) => c.id === id);
      if (client) {
        reset({
          ...client,
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
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const onSubmit = (data) => {
    const newClient = {
      ...data,
      id: `CLT-${String(CLIENTS.length + 1).padStart(3, "0")}`,
      status: "Active",
    };
    CLIENTS.push(newClient);
    setSubmittedData(newClient);
    setIsSuccessModalOpen(true);
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return <BasicInfoStep />;
      case 1:
        return <ContractLogisticsStep />;
      case 2:
        return <FinancialsDocsStep />;
      case 3:
        return <ReviewStep />;
      default:
        return null;
    }
  };

  return (
    <div className="w-full space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[20px] bg-card-dark border border-white/5 p-8 text-white shadow-xl">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 text-primary shadow-[0_0_10px_rgba(240,249,65,0.1)]">
                <Building2 size={24} />
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                {isEditMode ? "Update Client Profile" : "Add New Client"}
              </h1>
            </div>
            <p className="text-soft-gray/60 text-sm font-bold uppercase tracking-widest ml-1">
              {isEditMode 
                ? "Modify the client's business details and contracts."
                : "Complete the steps to register a new client."}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/clients")}
            className="px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl text-sm font-bold text-soft-gray hover:text-white transition-all"
          >
            Cancel & Exit
          </button>
        </div>
      </div>

      {/* Stepper Progress */}
      <div className="bg-card-dark rounded-[20px] shadow-xl border border-white/5 p-6">
        <div className="flex items-center justify-between relative">
          <div className="absolute top-1/2 left-0 w-full h-0.5 bg-white/5 -translate-y-1/2 z-0" />
          {STEPS.map((step, idx) => (
            <div key={step.id} className="relative z-10 flex flex-col items-center group">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 font-bold ${
                  idx <= currentStep
                    ? "bg-primary border-primary text-dark-bg shadow-[0_0_10px_rgba(240,249,65,0.4)]"
                    : "bg-card-dark border-white/10 text-soft-gray/30"
                }`}
              >
                {idx < currentStep ? <CheckCircle2 size={20} /> : idx + 1}
              </div>
              <span
                className={`text-[10px] font-bold mt-2 uppercase tracking-wider transition-colors duration-300 hidden md:block ${
                  idx <= currentStep ? "text-primary" : "text-soft-gray/30"
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
          className="bg-card-dark rounded-[20px] shadow-xl border border-white/5 overflow-hidden"
        >
          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h2 className="text-xl font-bold text-white tracking-tight">{STEPS[currentStep].title}</h2>
              <p className="text-sm text-soft-gray/50 mt-1 font-medium">
                Step {currentStep + 1} of {STEPS.length}
              </p>
            </div>
            {renderStepContent()}
          </div>

          {/* Footer Actions */}
          <div className="px-8 py-6 bg-white/5 border-t border-white/5 flex justify-between items-center">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                currentStep === 0
                  ? "text-soft-gray/30 cursor-not-allowed"
                  : "text-soft-gray hover:bg-white/5 hover:text-white active:scale-95"
              }`}
            >
              <ChevronLeft size={20} />
              <span>Previous</span>
            </button>

            {currentStep === STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => handleSubmit(onSubmit)()}
                className="flex items-center gap-2 bg-primary text-dark-bg px-8 py-2.5 rounded-xl font-extrabold shadow-[0_0_15px_rgba(240,249,65,0.4)] hover:shadow-[0_0_25px_rgba(240,249,65,0.6)] hover:bg-primary/90 transition-all active:scale-95"
              >
                <Save size={20} />
                <span>{isEditMode ? "Update Client" : "Save Client"}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={nextStep}
                className="flex items-center gap-2 bg-white/10 text-white border border-white/10 px-8 py-2.5 rounded-xl font-bold hover:bg-white/20 hover:border-white/20 transition-all active:scale-95"
              >
                <span>Next Step</span>
                <ChevronRight size={20} />
              </button>
            )}
          </div>
        </form>
      </FormProvider>

      <Modal
        isOpen={isSuccessModalOpen}
        onClose={() => navigate("/admin/clients")}
        title={isEditMode ? "Client Updated" : "Client Registered"}
        subtitle={isEditMode ? "The client profile has been updated successfully." : "The client profile has been created successfully."}
        icon={Building2}
        size="sm"
      >
        <div className="py-6 text-center">
          <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <CheckCircle2 size={32} />
          </div>
          <p className="text-soft-gray text-sm leading-relaxed">
            Client <strong className="text-white">{submittedData?.companyName}</strong> has been added successfully.
          </p>
          <button
            onClick={() => navigate("/admin/clients")}
            className="w-full mt-8 bg-primary text-dark-bg py-3 rounded-xl font-extrabold shadow-[0_0_15px_rgba(240,249,65,0.4)] hover:bg-primary/90 transition-all"
          >
            Go to Client List
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default AddClient;
