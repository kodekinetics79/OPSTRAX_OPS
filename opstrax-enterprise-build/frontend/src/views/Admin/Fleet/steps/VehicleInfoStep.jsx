import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import CustomInput from "@/components/common/CustomInput";

const VehicleInfoStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Controller
        name="unitNo"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Unit No"
            placeholder="Unit No"
            {...field}
            error={errors.unitNo?.message}
          />
        )}
      />

      <Controller
        name="vin"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="VIN"
            placeholder="Vehicle Identification Number"
            {...field}
            error={errors.vin?.message}
          />
        )}
      />

      <Controller
        name="engineNo"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Engine No"
            placeholder="Engine Number"
            {...field}
            error={errors.engineNo?.message}
          />
        )}
      />

      <Controller
        name="make"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Make"
            placeholder="Make"
            {...field}
          />
        )}
      />

      <Controller
        name="model"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Model"
            placeholder="Model"
            {...field}
          />
        )}
      />

      <Controller
        name="year"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Year"
            placeholder="Year"
            type="number"
            {...field}
          />
        )}
      />

      <Controller
        name="colour"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Colour"
            placeholder="Colour"
            {...field}
          />
        )}
      />

      <Controller
        name="plateNo"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Plate No"
            placeholder="Plate Number"
            {...field}
            error={errors.plateNo?.message}
          />
        )}
      />

      <Controller
        name="frontTireRadius"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Front Tire Radius"
            placeholder="e.g. 11R22.5"
            {...field}
            error={errors.frontTireRadius?.message}
          />
        )}
      />

      <Controller
        name="frontTireDepth"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Front Tire Depth"
            placeholder="Depth"
            {...field}
            error={errors.frontTireDepth?.message}
          />
        )}
      />

      <Controller
        name="backTireRadius"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Back Tire Radius"
            placeholder="e.g. 11R22.5"
            {...field}
            error={errors.backTireRadius?.message}
          />
        )}
      />

      <Controller
        name="backTireDepth"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Back Tire Depth"
            placeholder="Depth"
            {...field}
            error={errors.backTireDepth?.message}
          />
        )}
      />

      <Controller
        name="truckLength"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Truck Length"
            placeholder="e.g. 53 ft"
            {...field}
          />
        )}
      />

      <Controller
        name="typeOfVehicle"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Type of Vehicle"
            placeholder="Type of Vehicle"
            {...field}
          />
        )}
      />

      <Controller
        name="vehicleStatus"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Vehicle Status"
            type="select"
            name="vehicleStatus"
            {...field}
            options={[
              { label: "Active", value: "Active" },
              { label: "Maintenance", value: "Maintenance" },
              { label: "Out of Service", value: "OutOfService" },
            ]}
            error={errors.vehicleStatus?.message}
          />
        )}
      />

      <Controller
        name="liftgate"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Liftgate"
            placeholder="Yes / No"
            {...field}
          />
        )}
      />

      <Controller
        name="keycode"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Keycode"
            placeholder="Keycode"
            {...field}
          />
        )}
      />
    </div>
  );
};

export default VehicleInfoStep;
