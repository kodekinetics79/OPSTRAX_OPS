import React from "react";
import { useFormContext } from "react-hook-form";

const Section = ({ title, children }) => (
  <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-4">
    <h3 className="text-sm font-bold text-slate-400 mb-3">{title}</h3>
    {children}
  </div>
);

const Row = ({ label, value }) => (
  <div className="flex justify-between text-sm mb-1">
    <span className="font-medium text-slate-500">{label}</span>
    <span className="text-slate-400">
      {value || <span className="text-slate-300 italic">Not provided</span>}
    </span>
  </div>
);

const ReviewSubmitStep = () => {
  const { watch } = useFormContext();
  const values = watch();

  return (
    <div className="space-y-4 animate-fade-in text-sm">
      <Section title="Personal Information">
        <Row label="Name" value={values.name} />
        <Row label="Phone" value={values.phone} />
        <Row label="Email" value={values.email} />
        <Row label="DOB" value={values.dob} />
        <Row label="Joining Date" value={values.joiningDate} />
        <Row label="Address" value={values.address} />
        <Row label="Experience" value={values.experience} />
        <Row label="Height" value={values.height} />
        <Row label="Status" value={values.status} />
      </Section>

      <Section title="License & Legal">
        <Row label="License Number" value={values.licenseNumber} />
        <Row label="License Type" value={values.licenseType} />
        <Row label="Expiry Date" value={values.expiryDate} />
      </Section>

      <Section title="Salary & Pay">
        <Row label="Salary Type" value={values.salaryType} />
        <Row label="Overtime Rate" value={values.overtimeRate} />
        <Row label="Bonus" value={values.bonus} />
      </Section>

      <Section title="Insurance">
        <Row label="Company" value={values.insuranceCompany} />
        <Row label="Policy Number" value={values.policyNumber} />
        <Row label="Coverage Period" value={values.coveragePeriod} />
      </Section>

      <Section title="Medical Information">
        <Row label="Emergency Contact" value={values.emergencyContact} />
      </Section>

      <Section title="Fuel Card">
        <Row label="Card Number" value={values.cardNumber} />
        <Row label="Provider" value={values.cardProvider} />
        <Row label="Spending Limit" value={values.spendingLimit} />
        <Row label="Assigned Vehicle" value={values.assignedVehicle} />
      </Section>

      <Section title="Violations">
        {(values.violations || []).map((v, idx) => (
          <Row
            key={idx}
            label={`#${idx + 1}`}
            value={`${v.description || "No description"} | ${v.date || "No date"} | Fine: ${v.fineAmount || "0"}`}
          />
        ))}
      </Section>

      <Section title="Accidents">
        {(values.accidents || []).map((a, idx) => (
          <Row
            key={idx}
            label={`#${idx + 1}`}
            value={`${a.description || "No description"} | ${a.date || "No date"} | Fine: ${a.fineAmount || "0"}`}
          />
        ))}
      </Section>
    </div>
  );
};

export default ReviewSubmitStep;
