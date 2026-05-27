import React from "react";
import { useFormContext, Controller } from "react-hook-form";
import CustomInput from "@/components/common/CustomInput";

const CbmDetailsStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const uomOptions = [
    { value: "cm", label: "Centimeters (cm)" },
    { value: "m", label: "Meters (m)" },
    { value: "in", label: "Inches (in)" },
    { value: "ft", label: "Feet (ft)" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Controller
        name="cbmLength"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Length"
            placeholder="0.00"
            type="number"
            {...field}
            error={errors.cbmLength?.message}
          />
        )}
      />

      <Controller
        name="cbmWidth"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Width"
            placeholder="0.00"
            type="number"
            {...field}
            error={errors.cbmWidth?.message}
          />
        )}
      />

      <Controller
        name="cbmHeight"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Height"
            placeholder="0.00"
            type="number"
            {...field}
            error={errors.cbmHeight?.message}
          />
        )}
      />

      <Controller
        name="cbmUom"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Unit of Measurement"
            type="select"
            options={uomOptions}
            placeholder="Select UOM"
            {...field}
            error={errors.cbmUom?.message}
          />
        )}
      />

      <div className="md:col-span-2 border-t border-white/10 my-2"></div>

      <Controller
        name="netWeight"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Net Weight"
            placeholder="0.00"
            type="number"
            {...field}
            error={errors.netWeight?.message}
          />
        )}
      />

      <Controller
        name="grossWeight"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Gross Weight"
            placeholder="0.00"
            type="number"
            {...field}
            error={errors.grossWeight?.message}
          />
        )}
      />

      <Controller
        name="dimensionalWeight"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Dimensional Weight"
            placeholder="0.00"
            type="number"
            {...field}
            error={errors.dimensionalWeight?.message}
          />
        )}
      />
    </div>
  );
};

export default CbmDetailsStep;
