
import { OrdersList } from "@/components";
export { default as CreateOrder } from "./CreateOrder";
export { default as OrderDetail } from "./OrderDetail";
export { default as EditOrder } from "./EditOrder";

export const OrderManagement = () => {
  return <OrdersList />;
};
