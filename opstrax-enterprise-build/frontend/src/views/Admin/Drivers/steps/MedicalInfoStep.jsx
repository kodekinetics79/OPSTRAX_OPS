import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import CustomInput from "@/components/common/CustomInput";

const MedicalInfoStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Controller
        name="emergencyContact"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Emergency Contact (Phone)"
            placeholder="Emergency contact number"
            type="tel" // optional – good to add for phone formatting
            {...field}
            error={errors.emergencyContact?.message}
          />
        )}
      />
    </div>
  );
};

export default MedicalInfoStep;
