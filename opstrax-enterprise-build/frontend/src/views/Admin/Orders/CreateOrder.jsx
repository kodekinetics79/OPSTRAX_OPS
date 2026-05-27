import { ShoppingCart } from "lucide-react";
import { PremiumHeader } from "@/components";
import LoadManagementForm from "@/components/admin/orders/LoadManagementForm";

export const CreateOrder = () => {
  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader
        icon={ShoppingCart}
        title="Create Load"
        subtitle="Configure single or recurring shipment details"
        gradient="from-purple-900/50 via-slate-900 to-indigo-900"
      />
      <div className="bg-card-dark rounded-2xl shadow-lg border border-white/5 p-6">
        <LoadManagementForm />
      </div>
    </div>
  );
};

export default CreateOrder;
