import * as yup from "yup";
import { MOCK_CLIENTS } from "@/data/mock/clients";

export const DRIVERS = MOCK_CLIENTS; // Note: This might be a typo in the previous version, should be CLIENTS
export const CLIENTS = MOCK_CLIENTS;

export const CLIENT_CATEGORIES = [
  "Corporate",
  "Individual",
  "Small Business",
  "Government",
  "Other",
];

export const LOAD_TYPES = [
  "FCL",
  "LCL",
  "Reefer",
  "Flatbed",
  "Hazmat",
  "Other",
];

export const PAYMENT_METHODS = [
  "Wire Transfer",
  "Credit Card",
  "Net 30",
  "Net 60",
  "Cash",
  "Other",
];

export const BUSINESS_TYPES = [
  "Manufacturer",
  "Distributor",
  "Retailer",
  "Logistics Provider",
  "Other",
];

export const clientSchema = yup.object({
  // Step 1: Basic Information
  category: yup.string().required("Category is required"),
  companyName: yup.string().required("Company name is required"),
  contactPerson: yup.string().required("Contact person is required"),
  email: yup.string().email("Invalid email").required("Email is required"),
  phone: yup.string().required("Phone is required"),
  website: yup.string().url("Invalid URL").nullable(),
  location: yup.string().required("Location is required"),
  businessType: yup.string().required("Business type is required"),
  address: yup.string().required("Address is required"),

  // Step 2: Contract & Logistics
  contractExpiry: yup.string().required("Contract expiry is required"),
  preferredLoadType: yup.string().required("Preferred load type is required"),
  avgMonthlyLoads: yup
    .number()
    .typeError("Must be a number")
    .required("Required"),
  specialInstruction: yup.string().nullable(),
  deliveryStartTime: yup.string().required("Start time is required"),
  deliveryEndTime: yup.string().required("End time is required"),

  // Step 3: Financials & Documents
  preferredPaymentMethod: yup.string().required("Payment method is required"),
  creditLimit: yup.number().typeError("Must be a number").required("Required"),
  taxId: yup.string().required("Tax ID is required"),
});
