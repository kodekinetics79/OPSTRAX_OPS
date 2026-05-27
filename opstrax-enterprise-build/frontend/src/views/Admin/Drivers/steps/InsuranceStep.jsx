import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import CustomInput from "@/components/common/CustomInput";

const InsuranceStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Controller
        name="insuranceCompany"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Company"
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
        name="coveragePeriod"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Coverage Period"
            placeholder="e.g. 2024-01-01 to 2024-12-31"
            {...field}
            error={errors.coveragePeriod?.message}
          />
        )}
      />
    </div>
  );
};

export default InsuranceStep;
