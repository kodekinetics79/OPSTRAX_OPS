export { default as AdminDashboardScreen } from "./AdminDashboard";

// 1. Organization
export * from "./Organization";

// 2. Master Data
export * from "./MasterData";

// 3. Customers
export * from "./Customers";
export * from "./Customer/Contracts"; // Exposes ContractList, ContractDetail
export * from "./clients";

// 4. Rating & Pricing
export * from "./RatingPricing";

// 5. Orders & Shipments
export * from "./Orders";
export { default as ShipmentRecordsScreen } from "./Logistics/Shipments"; // Keep existing

// 6. Dispatch
export * from "./Dispatch";

// 7. Fleet
export * from "./Fleet";

// 8. Drivers
export * from "./Drivers";
// Keep existing Drive exports for backward compatibility until refactor is complete
export {
    Insurance as InsuranceScreen,
    MedicalInsurance as MedicalInsuranceScreen,
    FuelCard as FuelCardScreen,
    MedicalHistory as MedicalHistoryScreen,
    TrafficViolations as TrafficViolationsScreen,
    Accidents as AccidentsScreen,
} from "./Drive";

// 9. Telematics
export * from "./Telematics";

// 10. Maintenance
export * from "./Maintenance";

// 11. Financials
export * from "./Financials";

// 12. Carriers
export * from "./Carriers";

// 13. Customer Portal
export * from "./Portal";

// 14. Performance
export * from "./Performance";

// 15. Control Tower
export * from "./ControlTower";

// 16. Predictive
export * from "./Predictive";

// 17. Audit
export * from "./Audit";

// 18. Productization
export * from "./Productization";
