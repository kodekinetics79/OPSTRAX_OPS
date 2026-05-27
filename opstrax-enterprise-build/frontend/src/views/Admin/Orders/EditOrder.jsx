import { ShoppingCart, ChevronLeft } from "lucide-react";
import { PremiumHeader, CommonButton } from "@/components";
import LoadManagementForm from "@/components/admin/orders/LoadManagementForm";
import { ORDERS } from "@/components/admin/orders/orders.data";
import { useNavigate, useParams } from "react-router-dom";
import moment from "moment";

const EditOrder = () => {
  const navigate = useNavigate();
  const { orderId } = useParams();

  const order = ORDERS.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="p-8 text-center text-gray-400">
        <h2 className="text-xl font-bold text-white mb-2">Order not found</h2>
        <button
          onClick={() => navigate("/admin/orders")}
          className="text-primary hover:underline"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  const initialValues = {
    clientName: order.customer || "",
    referenceId: order.id || "",
    startLocation: "",
    endLocation: order.destination || "",
    startDate: order.date ? moment(order.date).format("YYYY-MM-DD") : "",
    endDate: order.date ? moment(order.date).format("YYYY-MM-DD") : "",
    payRateDefined: "not_defined",
    comments: "",
    recurringEnabled: false,
    recurrencePattern: "daily",
    driverMode: "single",
    selectDriver: "",
  };

  return (
    <div className="w-full space-y-8 animate-fade-in">
      <PremiumHeader
        icon={ShoppingCart}
        title="Edit Load"
        subtitle="Update shipment configuration"
        gradient="from-purple-900/50 via-slate-900 to-indigo-900"
        actions={
          <div className="flex gap-2">
            <CommonButton
              variant="outline"
              onClick={() => navigate("/admin/orders")}
              icon={ChevronLeft}
              className="bg-white/5 border-white/10 text-gray-300 hover:bg-white/10 hover:text-white"
            >
              Back to Orders
            </CommonButton>
          </div>
        }
      />
      <div className="bg-card-dark rounded-2xl shadow-lg border border-white/5 p-6">
        <LoadManagementForm initialValues={initialValues} />
      </div>
    </div>
  );
};

export default EditOrder;
