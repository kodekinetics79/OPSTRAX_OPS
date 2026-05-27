import { DynamicTable, StatusBadge, CustomInput, PremiumHeader, StatsCard, Modal } from "@/components";
import { Users, UserCheck } from "lucide-react";
import { PORTAL_USERS } from "./portal.data";
import { useState } from "react";

const PortalUsers = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const stats = [
    { label: "Portal Users", value: PORTAL_USERS.length, icon: Users, variant: "info" },
    { label: "Active Now", value: "12", icon: UserCheck, variant: "success" },
  ];

  const modalContent = (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <CustomInput label="User Name" placeholder="John Doe" />
      <CustomInput label="Email" placeholder="user@client.com" />
      <CustomInput label="Company" placeholder="Client Co" />
      <CustomInput type="select" label="Role" options={[{ value: "admin", label: "Admin" }]} />
    </div>
  );

  const columns = [
    { header: "User Name", accessor: "name", render: (row) => <span className="font-medium text-gray-900">{row.name}</span> },
    { header: "Company", accessor: "company" },
    { header: "Email", accessor: "email" },
    { header: "Last Login", accessor: "last_login" },
    { header: "Status", accessor: "status", render: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader icon={Users} title="Portal Users" subtitle="External users access management" onAddClick={() => setIsModalOpen(true)} />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {stats.map((s, idx) => (
          <StatsCard key={idx} icon={s.icon} label={s.label} value={s.value} variant={s.variant} />
        ))}
      </div>
      <DynamicTable data={PORTAL_USERS} columns={columns} />
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Invite User" subtitle="Enter user details" icon={Users} size="lg">
        {modalContent}
      </Modal>
    </div>
  );
};

export default PortalUsers;
