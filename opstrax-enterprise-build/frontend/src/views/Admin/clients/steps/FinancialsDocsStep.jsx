import { CustomInput } from "@/components/index";
import { useFormContext, Controller } from "react-hook-form";
import { PAYMENT_METHODS } from "@/components/admin/clients/clients.data";
import { Upload } from "lucide-react";

const FinancialsDocsStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      <Controller
        name="preferredPaymentMethod"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Preferred Payment Method"
            type="select"
            options={PAYMENT_METHODS.map((method) => ({ label: method, value: method }))}
            {...field}
            error={errors.preferredPaymentMethod?.message}
            required
          />
        )}
      />

      <Controller
        name="creditLimit"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Credit Limit"
            type="number"
            {...field}
            error={errors.creditLimit?.message}
            required
          />
        )}
      />

      <Controller
        name="taxId"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Tax ID"
            {...field}
            error={errors.taxId?.message}
            required
          />
        )}
      />

      <CustomInput
        label="Contract Agreement"
        type="file"
        onChange={() => {}}
        icon={Upload}
        iconPosition="right"
      />

      <CustomInput
        label="Insurance Certificate"
        type="file"
        onChange={() => {}}
        icon={Upload}
        iconPosition="right"
      />

      <CustomInput
        label="Other Relevant Documents"
        type="file"
        onChange={() => {}}
        icon={Upload}
        iconPosition="right"
      />
    </div>
  );
};

export default FinancialsDocsStep;
