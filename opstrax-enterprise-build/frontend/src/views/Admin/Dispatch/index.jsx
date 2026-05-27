
import { DispatchPlans as DispatchPlansComponent, RoutePlans as RoutePlansComponent, AIDispatch as AIDispatchComponent } from "@/components";

export const DispatchPlans = () => {
  return <DispatchPlansComponent />;
};

export const RoutePlans = () => {
  return <RoutePlansComponent />;
};

export const AIDispatch = () => {
  return <AIDispatchComponent />;
};

export { default as RouteDetail } from "./RouteDetail";
export { default as RoutePlanForm } from "./RoutePlanForm";
