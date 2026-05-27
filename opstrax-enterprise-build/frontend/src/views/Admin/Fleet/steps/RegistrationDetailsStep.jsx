import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import CustomInput from "@/components/common/CustomInput";

const RegistrationDetailsStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Controller
        name="vehicleId"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Vehicle ID"
            placeholder="e.g. V-101"
            {...field}
            error={errors.vehicleId?.message}
          />
        )}
      />

      <Controller
        name="plateOwnerMaster"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Plate Owner Master"
            placeholder="Plate Owner Master"
            {...field}
            error={errors.plateOwnerMaster?.message}
          />
        )}
      />

      <Controller
        name="vehicleOwnerMaster"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Vehicle Owner Master"
            placeholder="Vehicle Owner Master"
            {...field}
            error={errors.vehicleOwnerMaster?.message}
          />
        )}
      />

      <Controller
        name="ownerName"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Owner Name"
            placeholder="Owner Name"
            {...field}
            error={errors.ownerName?.message}
          />
        )}
      />

      <Controller
        name="purchasePrice"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Purchase Price"
            type="number"
            placeholder="e.g. 55000"
            {...field}
            error={errors.purchasePrice?.message}
          />
        )}
      />

      <Controller
        name="leaseAmount"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Lease Amount"
            type="number"
            placeholder="e.g. 1200"
            {...field}
            error={errors.leaseAmount?.message}
          />
        )}
      />

      <Controller
        name="buyoutOption"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Buyout Option"
            type="number"
            placeholder="e.g. 20000"
            {...field}
            error={errors.buyoutOption?.message}
          />
        )}
      />

      <Controller
        name="leaseStartDate"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Lease Start Date"
            type="date"
            {...field}
            error={errors.leaseStartDate?.message}
          />
        )}
      />

      <Controller
        name="leaseEndDate"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Lease End Date"
            type="date"
            {...field}
            error={errors.leaseEndDate?.message}
          />
        )}
      />

      <Controller
        name="leaseTerm"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Lease Term"
            placeholder="e.g. 36 months"
            {...field}
            error={errors.leaseTerm?.message}
          />
        )}
      />

      <Controller
        name="taxRate"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Tax Rate (%)"
            type="number"
            placeholder="e.g. 13"
            {...field}
            error={errors.taxRate?.message}
          />
        )}
      />
    </div>
  );
};

export default RegistrationDetailsStep;
