import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import CustomInput from "@/components/common/CustomInput";

const SalaryPayStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Controller
        name="salaryType"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Salary Type"
            type="select"
            {...field}
            options={[
              { label: "Monthly", value: "Monthly" },
              { label: "Other", value: "Other" },
            ]}
            placeholder="Select salary type"
            // error is optional here since salaryType is not required in schema
            // error={errors.salaryType?.message}
          />
        )}
      />

      <Controller
        name="overtimeRate"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Overtime Rate"
            type="number"
            placeholder="e.g. 50"
            {...field}
            error={errors.overtimeRate?.message}
          />
        )}
      />

      <Controller
        name="bonus"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Bonus"
            type="number"
            placeholder="e.g. 1000"
            {...field}
            error={errors.bonus?.message}
          />
        )}
      />
    </div>
  );
};

export default SalaryPayStep;
