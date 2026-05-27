import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import CustomInput from "@/components/common/CustomInput";

const MiscCommentsStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const booleanOptions = [
    { label: "Yes", value: "yes" },
    { label: "No", value: "no" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Controller
        name="fuel"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Fuel"
            type="select"
            options={booleanOptions}
            placeholder="Select"
            {...field}
          />
        )}
      />

      <Controller
        name="fuelTrackerId"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Fuel Tracker ID"
            placeholder="Tracker ID"
            {...field}
            error={errors.fuelTrackerId?.message}
          />
        )}
      />

      <Controller
        name="gps"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="GPS"
            type="select"
            options={booleanOptions}
            placeholder="Select"
            {...field}
          />
        )}
      />

      <Controller
        name="gpsTrackerId"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="GPS Tracker ID"
            placeholder="Tracker ID"
            {...field}
            error={errors.gpsTrackerId?.message}
          />
        )}
      />

      <Controller
        name="temperature"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Temperature"
            type="select"
            options={booleanOptions}
            placeholder="Select"
            {...field}
          />
        )}
      />

      <Controller
        name="temperatureTrackerId"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Temperature Tracker ID"
            placeholder="Tracker ID"
            {...field}
            error={errors.temperatureTrackerId?.message}
          />
        )}
      />

      <Controller
        name="speedMonitoring"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Speed Monitoring"
            type="select"
            options={booleanOptions}
            placeholder="Select"
            {...field}
          />
        )}
      />

      <Controller
        name="speedTrackerId"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Speed Tracker ID"
            placeholder="Tracker ID"
            {...field}
            error={errors.speedTrackerId?.message}
          />
        )}
      />

      <Controller
        name="macpassNumber"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Macpass Number"
            placeholder="Macpass Number"
            {...field}
            error={errors.macpassNumber?.message}
          />
        )}
      />

      <Controller
        name="straightPass"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="StraightPass"
            placeholder="StraightPass"
            {...field}
            error={errors.straightPass?.message}
          />
        )}
      />

      <Controller
        name="dashcam"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Dashcam"
            placeholder="Yes / No"
            {...field}
            error={errors.dashcam?.message}
          />
        )}
      />

      <Controller
        name="highway104Toll"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Highway 104 Toll"
            placeholder="Yes / No"
            {...field}
          />
        )}
      />

      <Controller
        name="station"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Station"
            placeholder="Station"
            {...field}
          />
        )}
      />

      <div className="md:col-span-2">
        <Controller
          name="comments"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Comments"
              type="textarea"
              placeholder="Additional comments (optional)"
              {...field}
              error={errors.comments?.message}
              rows={4}
            />
          )}
        />
      </div>
    </div>
  );
};

export default MiscCommentsStep;
