import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import CustomInput from "@/components/common/CustomInput";

const FuelCardStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Controller
        name="cardNumber"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Card Number"
            placeholder="XXXX-XXXX-XXXX-XXXX"
            {...field}
            error={errors.cardNumber?.message}
          />
        )}
      />

      <Controller
        name="cardProvider"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Provider"
            placeholder="Provider"
            {...field}
            error={errors.cardProvider?.message}
          />
        )}
      />

      <Controller
        name="spendingLimit"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Spending Limit"
            type="number"
            placeholder="e.g. 5000"
            {...field}
            error={errors.spendingLimit?.message}
          />
        )}
      />

      <Controller
        name="assignedVehicle"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Assigned Vehicle"
            placeholder="Assigned Vehicle"
            {...field}
            error={errors.assignedVehicle?.message}
          />
        )}
      />
    </div>
  );
};

export default FuelCardStep;
