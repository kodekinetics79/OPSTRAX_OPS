
import { useNavigate } from "react-router-dom";
import { DynamicTable, StatusBadge, Modal, CustomInput, PremiumHeader, StatsCard } from "@/components";
import { DRIVERS } from "./drivers.data";
import { UserSquare2, Clock, Users, ShieldCheck, AlertTriangle, Eye, Pencil } from "lucide-react";
import { useState } from "react";

const DriverList = () => {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState(DRIVERS);
  const [formValues, setFormValues] = useState({
    fullName: "",
    height: "",
    salary: "",
    licenseNumber: "",
    licenseExpiry: "",
    personalNumber: "",
    insurance: "",
    medicalPolicyNumber: "",
    medicalStartDate: "",
    medicalEndDate: "",
    medicalCompanyName: "",
    medicalGrade: "",
    fuelCard: "",
    medicalHistory: "",
    trafficViolations: "",
    accident: "",
  });
  const [errors, setErrors] = useState({});
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const stats = [
    { label: "Total Drivers", value: drivers.length, icon: Users, variant: "primary" },
    { label: "Active Duty", value: drivers.filter((d) => d.status === "Active").length, icon: ShieldCheck, variant: "success" },
    { label: "On Leave", value: "2", icon: Clock, variant: "warning" },
    { label: "Expiring CDL", value: "1", icon: AlertTriangle, variant: "danger" },
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveDriver = () => {
    const newErrors = {};
    if (!formValues.fullName?.trim()) newErrors.fullName = "Full Name is required";
    if (!formValues.height?.trim()) newErrors.height = "Height is required";
    if (!formValues.salary?.trim()) newErrors.salary = "Salary is required";
    if (!formValues.licenseNumber?.trim()) newErrors.licenseNumber = "License Number is required";
    if (!formValues.licenseExpiry?.trim()) newErrors.licenseExpiry = "License Expiry Date is required";
    if (!formValues.personalNumber?.trim()) newErrors.personalNumber = "Personal Number is required";

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      return false;
    }

    const newId = `DRV-${String(drivers.length + 1).padStart(3, "0")}`;
    const newDriver = {
      id: newId,
      name: formValues.fullName,
      height: formValues.height,
      salary: formValues.salary,
      licenseNumber: formValues.licenseNumber,
      licenseExpiry: formValues.licenseExpiry,
      personalNumber: formValues.personalNumber,
      insurance: formValues.insurance,
      medicalPolicyNumber: formValues.medicalPolicyNumber,
      medicalStartDate: formValues.medicalStartDate,
      medicalEndDate: formValues.medicalEndDate,
      medicalCompanyName: formValues.medicalCompanyName,
      medicalGrade: formValues.medicalGrade,
      fuelCard: formValues.fuelCard,
      medicalHistory: formValues.medicalHistory,
      trafficViolations: formValues.trafficViolations,
      accident: formValues.accident,
      status: "Active",
    };

    setDrivers((prev) => [...prev, newDriver]);
    setFormValues({
      fullName: "",
      height: "",
      salary: "",
      licenseNumber: "",
      licenseExpiry: "",
      personalNumber: "",
      insurance: "",
      medicalPolicyNumber: "",
      medicalStartDate: "",
      medicalEndDate: "",
      medicalCompanyName: "",
      medicalGrade: "",
      fuelCard: "",
      medicalHistory: "",
      trafficViolations: "",
      accident: "",
    });
    setErrors({});
    setIsSuccessModalOpen(true);
    return true;
  };

  const columns = [
    {
      header: "Full Name",
      accessor: "name",
      render: (row) => (
        <div>
          <p className="font-semibold text-white">{row.name}</p>
          <p className="text-xs text-gray-500">{row.id}</p>
        </div>
      ),
    },
    { header: "Height", accessor: "height" },
    { header: "Salary", accessor: "salary" },
    { header: "License Number", accessor: "licenseNumber" },
    { header: "License Expiry Date", accessor: "licenseExpiry" },
    { header: "Personal Number", accessor: "personalNumber" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
    {
      header: "Actions",
      accessor: "actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/admin/drivers/profiles/${row.id}`)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-primary transition-all group"
            title="View Details"
          >
            <Eye size={18} className="group-hover:scale-110 transition-transform" />
          </button>
          <button
            onClick={() => navigate(`/admin/drivers/profiles/edit/${row.id}`)}
            className="p-1.5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-amber-400 transition-all group"
            title="Edit Driver"
          >
            <Pencil size={18} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={UserSquare2} title="Driver Profiles" subtitle="Manage driver records and qualifications" gradient="from-indigo-900/50 via-gray-900 to-fade" onAddClick={() => navigate("/admin/drivers/profiles/add")} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={drivers} columns={columns} />
      {isSuccessModalOpen && (
        <Modal isOpen={isSuccessModalOpen} onClose={() => setIsSuccessModalOpen(false)} title="Driver Created" subtitle="The driver record has been saved successfully." icon={UserSquare2} size="sm">
          <div className="py-4">
            <p className="text-sm text-gray-300">Your new driver has been added to the list.</p>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default DriverList;
