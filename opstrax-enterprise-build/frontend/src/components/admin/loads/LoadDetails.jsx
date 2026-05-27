import { EmptyState } from "@/components";
import { Package } from "lucide-react";

const LoadDetails = () => {
  return <EmptyState icon={Package} title="Select a shipment" subtitle="Choose a shipment to view details" />;
};

export default LoadDetails;
