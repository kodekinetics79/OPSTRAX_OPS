export { default as AddDriver } from "./AddDriver";
export { default as DriverDetail } from "./DriverDetail";

import { DriverList, DriverProfile } from "@/components";

export const DriverProfiles = () => {
  return <DriverList />;
};

export const HOSCompliance = () => {
  return <DriverProfile />;
};
