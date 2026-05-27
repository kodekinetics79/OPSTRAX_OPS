import { CustomInput } from "@/components/index";
import { useFormContext, Controller } from "react-hook-form";

const PersonalInfoStep = () => {
  const {
    control,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in">
      <Controller
        name="name"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Name"
            placeholder="Full Name"
            {...field} // gives value, onChange, onBlur, name
            error={errors.name?.message}
          />
        )}
      />

      <Controller
        name="phone"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Phone"
            type="tel"
            placeholder="(XXX) XXX-XXXX"
            {...field}
            error={errors.phone?.message}
          />
        )}
      />

      <Controller
        name="email"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Email"
            type="email"
            placeholder="driver@example.com"
            {...field}
            error={errors.email?.message}
          />
        )}
      />

      <Controller
        name="dob"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Date of Birth"
            type="date"
            {...field}
            error={errors.dob?.message}
          />
        )}
      />

      <Controller
        name="joiningDate"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Joining Date"
            type="date"
            {...field}
            error={errors.joiningDate?.message}
          />
        )}
      />

      <Controller
        name="address"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Address"
            placeholder="Complete Address"
            {...field}
            error={errors.address?.message}
          />
        )}
      />

      <Controller
        name="experience"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Experience"
            placeholder="e.g. 5 Years"
            {...field}
            error={errors.experience?.message}
          />
        )}
      />

      <Controller
        name="height"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Height"
            placeholder="e.g. 180 cm"
            {...field}
            error={errors.height?.message}
          />
        )}
      />

      <Controller
        name="status"
        control={control}
        render={({ field }) => (
          <CustomInput
            label="Status"
            type="select"
            {...field}
            options={[
              { label: "Active", value: "Active" },
              { label: "Inactive", value: "Inactive" },
            ]}
            error={errors.status?.message}
          />
        )}
      />
    </div>
  );
};

export default PersonalInfoStep;
