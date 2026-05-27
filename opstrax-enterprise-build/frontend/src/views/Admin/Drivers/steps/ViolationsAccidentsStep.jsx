import React from "react";
import { useFormContext, useFieldArray, Controller } from "react-hook-form";
import CustomInput from "@/components/common/CustomInput";

const ViolationsAccidentsStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  const {
    fields: violationFields,
    append: appendViolation,
    remove: removeViolation,
  } = useFieldArray({ control, name: "violations" });

  const {
    fields: accidentFields,
    append: appendAccident,
    remove: removeAccident,
  } = useFieldArray({ control, name: "accidents" });

  return (
    <div className="space-y-8 animate-fade-in">
      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400">Violations</h3>
          <button
            type="button"
            onClick={() =>
              appendViolation({ description: "", date: "", fineAmount: "" })
            }
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            + Add Violation
          </button>
        </div>

        <div className="space-y-4">
          {violationFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            >
              <Controller
                name={`violations.${index}.description`}
                control={control}
                render={({ field }) => (
                  <CustomInput
                    label="Description"
                    placeholder="Description"
                    {...field}
                    error={errors.violations?.[index]?.description?.message}
                  />
                )}
              />

              <Controller
                name={`violations.${index}.date`}
                control={control}
                render={({ field }) => (
                  <CustomInput label="Date" type="date" {...field} />
                )}
              />

              <Controller
                name={`violations.${index}.fineAmount`}
                control={control}
                render={({ field }) => (
                  <CustomInput
                    label="Fine Amount"
                    type="number"
                    placeholder="e.g. 200"
                    {...field}
                    error={errors.violations?.[index]?.fineAmount?.message}
                  />
                )}
              />

              <button
                type="button"
                onClick={() => removeViolation(index)}
                className="text-xs text-red-500 hover:text-red-600 font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-slate-400">Accidents</h3>
          <button
            type="button"
            onClick={() =>
              appendAccident({ description: "", date: "", fineAmount: "" })
            }
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
          >
            + Add Accident
          </button>
        </div>

        <div className="space-y-4">
          {accidentFields.map((field, index) => (
            <div
              key={field.id}
              className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end"
            >
              <Controller
                name={`accidents.${index}.description`}
                control={control}
                render={({ field }) => (
                  <CustomInput
                    label="Description"
                    placeholder="Description"
                    {...field}
                    error={errors.accidents?.[index]?.description?.message}
                  />
                )}
              />

              <Controller
                name={`accidents.${index}.date`}
                control={control}
                render={({ field }) => (
                  <CustomInput label="Date" type="date" {...field} />
                )}
              />

              <Controller
                name={`accidents.${index}.fineAmount`}
                control={control}
                render={({ field }) => (
                  <CustomInput
                    label="Fine Amount"
                    type="number"
                    placeholder="e.g. 500"
                    {...field}
                    error={errors.accidents?.[index]?.fineAmount?.message}
                  />
                )}
              />

              <button
                type="button"
                onClick={() => removeAccident(index)}
                className="text-xs text-red-500 hover:text-red-600 font-semibold"
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ViolationsAccidentsStep;
