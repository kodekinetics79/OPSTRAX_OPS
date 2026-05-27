import { CustomInput } from "@/components/index";
import { useFormContext, Controller } from "react-hook-form";
import { CLIENT_CATEGORIES, BUSINESS_TYPES } from "@/components/admin/clients/clients.data";

const BasicInfoStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      <Controller
        name="category"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Client Category"
            type="select"
            options={CLIENT_CATEGORIES.map((cat) => ({ label: cat, value: cat }))}
            {...field}
            error={errors.category?.message}
            required
          />
        )}
      />

      <Controller
        name="companyName"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Company Name"
            {...field}
            error={errors.companyName?.message}
            required
          />
        )}
      />

      <Controller
        name="contactPerson"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Contact Person"
            {...field}
            error={errors.contactPerson?.message}
            required
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Email Address"
            type="email"
            {...field}
            error={errors.email?.message}
            required
          />
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Phone Number"
            type="tel"
            {...field}
            error={errors.phone?.message}
            required
          />
        )}
      />

      <Controller
        name="website"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Company Website"
            placeholder="https://..."
            {...field}
            error={errors.website?.message}
          />
        )}
      />

      <Controller
        name="location"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Location"
            {...field}
            error={errors.location?.message}
            required
          />
        )}
      />

      <Controller
        name="businessType"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Business Type"
            type="select"
            options={BUSINESS_TYPES.map((type) => ({ label: type, value: type }))}
            {...field}
            error={errors.businessType?.message}
            required
          />
        )}
      />

      <div className="md:col-span-2 lg:col-span-3">
        <Controller
          name="address"
          control={control}
          render={({ field }) => (
            <CustomInput
              label="Full Address"
              {...field}
              error={errors.address?.message}
              required
            />
          )}
        />
      </div>
    </div>
  );
};

export default BasicInfoStep;
