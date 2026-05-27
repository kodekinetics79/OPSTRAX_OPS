import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import CustomInput from "@/components/common/CustomInput";

const InsuranceSafetyStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      {/* Insurance */}
      <Controller
        name="insuranceCompany"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Insurance Company"
            placeholder="Insurance Company"
            {...field}
            error={errors.insuranceCompany?.message}
          />
        )}
      />

      <Controller
        name="policyNumber"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Policy Number"
            placeholder="Policy Number"
            {...field}
            error={errors.policyNumber?.message}
          />
        )}
      />

      <Controller
        name="insuranceStart"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Insurance Start"
            type="date"
            {...field}
            error={errors.insuranceStart?.message}
          />
        )}
      />

      <Controller
        name="insuranceEnd"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Insurance End"
            type="date"
            {...field}
            error={errors.insuranceEnd?.message}
          />
        )}
      />

      {/* Safety */}
      <Controller
        name="mviSafetyProvince"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="MVI Safety Province"
            placeholder="Province"
            {...field}
            error={errors.mviSafetyProvince?.message}
          />
        )}
      />

      <Controller
        name="mviSafetyDue"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="MVI Safety Due"
            type="date"
            {...field}
            error={errors.mviSafetyDue?.message}
          />
        )}
      />

      <Controller
        name="plateType"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Plate Type"
            placeholder="Plate Type"
            {...field}
            error={errors.plateType?.message}
          />
        )}
      />

      <Controller
        name="plateExpiry"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Plate Expiry"
            type="date"
            {...field}
            error={errors.plateExpiry?.message}
          />
        )}
      />

      <Controller
        name="plateProvince"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Plate Province"
            placeholder="Province"
            {...field}
            error={errors.plateProvince?.message}
          />
        )}
      />
    </div>
  );
};

export default InsuranceSafetyStep;
