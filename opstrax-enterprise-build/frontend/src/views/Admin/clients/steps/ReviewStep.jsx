import { useFormContext } from "react-hook-form";

const ReviewStep = () => {
  const { getValues } = useFormContext();
  const values = getValues();

  const sections = [
    {
      title: "Basic Information",
      items: [
        { label: "Category", value: values.category },
        { label: "Company Name", value: values.companyName },
        { label: "Contact Person", value: values.contactPerson },
        { label: "Email", value: values.email },
        { label: "Phone", value: values.phone },
        { label: "Website", value: values.website },
        { label: "Location", value: values.location },
        { label: "Business Type", value: values.businessType },
        { label: "Address", value: values.address },
      ],
    },
    {
      title: "Contract & Logistics",
      items: [
        { label: "Contract Expiry", value: values.contractExpiry },
        { label: "Preferred Load Type", value: values.preferredLoadType },
        { label: "Avg Monthly Loads", value: values.avgMonthlyLoads },
        { label: "Start Time", value: values.deliveryStartTime },
        { label: "End Time", value: values.deliveryEndTime },
        { label: "Special Instruction", value: values.specialInstruction },
      ],
    },
    {
      title: "Financials",
      items: [
        { label: "Payment Method", value: values.preferredPaymentMethod },
        { label: "Credit Limit", value: values.creditLimit },
        { label: "Tax ID", value: values.taxId },
      ],
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">
      {sections.map((section, idx) => (
        <div key={idx} className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100">
          <h3 className="text-sm font-bold text-indigo-600 uppercase tracking-wider mb-4 border-b border-indigo-100 pb-2">
            {section.title}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {section.items.map((item, i) => (
              <ReviewItem key={i} label={item.label} value={item.value} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const ReviewItem = ({ label, value }) => (
  <div className="flex flex-col">
    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-1">
      {label}
    </span>
    <span className="text-sm font-semibold text-slate-700">
      {value || <span className="text-slate-300 italic">Not provided</span>}
    </span>
  </div>
);

export default ReviewStep;
