import { CustomInput } from "@/components/index";
import { useFormContext, Controller } from "react-hook-form";
import { LOAD_TYPES } from "@/components/admin/clients/clients.data";

const ContractLogisticsStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      <Controller
        name="contractExpiry"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Contract Expiry"
            type="date"
            {...field}
            error={errors.contractExpiry?.message}
            required
          />
        )}
      />

      <Controller
        name="preferredLoadType"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Preferred Load Type"
            type="select"
            options={LOAD_TYPES.map((type) => ({ label: type, value: type }))}
            {...field}
            error={errors.preferredLoadType?.message}
            required
          />
        )}
      />

      <Controller
        name="avgMonthlyLoads"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Average Monthly Loads"
            type="number"
            {...field}
            error={errors.avgMonthlyLoads?.message}
            required
          />
        )}
      />

      <Controller
        name="deliveryStartTime"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Preferred Delivery Start Time"
            type="time"
            {...field}
            error={errors.deliveryStartTime?.message}
            required
          />
        )}
      />

      <Controller
        name="deliveryEndTime"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Preferred Delivery End Time"
            type="time"
            {...field}
            error={errors.deliveryEndTime?.message}
            required
          />
        )}
      />

      <div className="md:col-span-2 lg:col-span-3">
        <Controller
          name="specialInstruction"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Special Instructions"
              type="textarea"
              {...field}
              error={errors.specialInstruction?.message}
            />
          )}
        />
      </div>
    </div>
  );
};

export default ContractLogisticsStep;
