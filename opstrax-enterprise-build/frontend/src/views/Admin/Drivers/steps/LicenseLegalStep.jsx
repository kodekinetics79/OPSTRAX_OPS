import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import CustomInput from "@/components/common/CustomInput";

const LicenseLegalStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Controller
        name="licenseNumber"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="License Number"
            placeholder="DL-XXXXXXXX"
            {...field}
            error={errors.licenseNumber?.message}
          />
        )}
      />

      <Controller
        name="licenseType"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="License Type"
            type="select"
            {...field}
            options={[
              { label: "Vehicle", value: "Vehicle" },
              { label: "Other", value: "Other" },
            ]}
            placeholder="Select license type"
            error={errors.licenseType?.message}
          />
        )}
      />

      <Controller
        name="expiryDate"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Expiry Date"
            type="date"
            {...field}
            error={errors.expiryDate?.message}
          />
        )}
      />
    </div>
  );
};

export default LicenseLegalStep;
