import { SharedHeader, Sidebar } from "@/components/index";
import { menuItems } from "@/constants/admin";
import { useState } from "react";
import {
  AdminDashboardScreen,
  // Educational/Legacy
  InsuranceScreen,
  MedicalInsuranceScreen,
  FuelCardScreen,
  MedicalHistoryScreen,
  TrafficViolationsScreen,
  AccidentsScreen,
  ShipmentRecordsScreen,
  // New Modules
  TenantManagement,
  BranchManagement,
  UserManagement,
  RBAC,
  Locations,
  StatusCodes,
  CustomerList,
  CustomerProfile,
  ContractList,
  ContractDetail, // Updated imports
  RateCards,
  PriceSimulation,
  OrderManagement,
  CreateOrder,
  OrderDetail,
  EditOrder,
  DispatchPlans,
  RoutePlans,
  RoutePlanForm,
  RouteDetail,
  AIDispatch,
  VehicleList,
  AssetRegistry,
  AddVehicle,
  VehicleDetail,
  DriverProfiles,
  AddDriver,
  DriverDetail,
  HOSCompliance,
  IoTDevices,
  ColdChain,
  WorkOrders,
  DowntimeTracking,
  FuelTransactions,
  ExpenseTracking,
  CarrierList,
  CarrierRateCards,
  PortalBookings,
  PortalUsers,
  SLAMonitoring,
  KPIDashboard,
  ExceptionInbox,
  ResolutionTracking,
  CostEstimation,
  MarginAnalysis,
  AuditLogs,
  DocumentManagement,
  FeaturePacks,
  FeatureFlags,
  ClientList,
  AddClient,
  ClientDetails,
} from "@/views/index";
import { Routes, Route } from "react-router-dom";

export const AdminLayout = () => {
  const [isCollapsed, setIsCollapsed] = useState(true);

  return (
    <div className="flex bg-dark-bg min-h-screen max-h-screen overflow-hidden">
      <div className="laptop:flex hidden">
        <Sidebar
          menuItems={menuItems}
          isCollapsed={isCollapsed}
          toggleCollapse={() => setIsCollapsed(!isCollapsed)}
        />
      </div>
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative transition-all duration-300">
        <div className="flex-1 overflow-y-auto px-4 laptop:px-8 py-4 relative">
          <div className="max-w-[1600px] mx-auto space-y-6">
            <SharedHeader />
            <main className="w-full pb-8">
              <Routes>
                <Route exact path="/*" element={<AdminDashboardScreen />} />

                {/* Organization */}
                <Route path="/org/tenants" element={<TenantManagement />} />
                <Route path="/org/branches" element={<BranchManagement />} />
                <Route path="/org/users" element={<UserManagement />} />
                <Route path="/org/rbac" element={<RBAC />} />

                {/* Master Data */}
                <Route path="/master/locations" element={<Locations />} />
                <Route path="/master/status-codes" element={<StatusCodes />} />

                {/* Commercial / Customers */}
                <Route path="/customers/profiles" element={<CustomerList />} />
                <Route
                  path="/customers/profiles/:customerId"
                  element={<CustomerProfile />}
                />
                <Route path="/customers/contracts" element={<ContractList />} />
                <Route
                  path="/customers/contracts/:contractId"
                  element={<ContractDetail />}
                />

                <Route path="/pricing/rates" element={<RateCards />} />
                <Route
                  path="/pricing/simulation"
                  element={<PriceSimulation />}
                />

                {/* Operations */}
                <Route path="/orders" element={<OrderManagement />} />
                <Route path="/orders/create" element={<CreateOrder />} />
                <Route path="/orders/:orderId" element={<OrderDetail />} />
                <Route path="/orders/edit/:orderId" element={<EditOrder />} />
                <Route path="/dispatch/plans" element={<DispatchPlans />} />
                <Route path="/dispatch/routes" element={<RoutePlans />} />
                <Route path="/dispatch/routes/new" element={<RoutePlanForm />} />
                <Route path="/dispatch/routes/:id" element={<RouteDetail />} />
                <Route path="/dispatch/ai" element={<AIDispatch />} />

                {/* Assets */}
                <Route path="/fleet/vehicles" element={<VehicleList />} />
                <Route
                  path="/fleet/vehicles/:id"
                  element={<VehicleDetail />}
                />
                <Route
                  path="/fleet/vehicles/edit/:id"
                  element={<AddVehicle />}
                />
                <Route path="/fleet/vehicles/add" element={<AddVehicle />} />
                <Route path="/fleet/assets" element={<AssetRegistry />} />
                <Route path="/drivers/profiles" element={<DriverProfiles />} />
                <Route path="/drivers/profiles/add" element={<AddDriver />} />
                <Route
                  path="/drivers/profiles/:id"
                  element={<DriverDetail />}
                />
                <Route
                  path="/drivers/profiles/edit/:id"
                  element={<AddDriver />}
                />
                <Route path="/drivers/hos" element={<HOSCompliance />} />

                {/* Clients */}
                <Route path="/clients" element={<ClientList />} />
                <Route path="/clients/add" element={<AddClient />} />
                <Route path="/clients/:id" element={<ClientDetails />} />
                <Route path="/clients/edit/:id" element={<AddClient />} />

                {/* Telematics & Maint */}
                <Route path="/telematics/devices" element={<IoTDevices />} />
                <Route path="/telematics/cold-chain" element={<ColdChain />} />
                <Route
                  path="/maintenance/work-orders"
                  element={<WorkOrders />}
                />
                <Route
                  path="/maintenance/downtime"
                  element={<DowntimeTracking />}
                />

                {/* Financials */}
                <Route path="/financials/fuel" element={<FuelTransactions />} />
                <Route
                  path="/financials/expenses"
                  element={<ExpenseTracking />}
                />

                {/* External */}
                <Route path="/carriers/list" element={<CarrierList />} />
                <Route path="/carriers/rates" element={<CarrierRateCards />} />
                <Route path="/portal/bookings" element={<PortalBookings />} />
                <Route path="/portal/users" element={<PortalUsers />} />

                {/* Intelligence */}
                <Route path="/performance/sla" element={<SLAMonitoring />} />
                <Route path="/performance/kpi" element={<KPIDashboard />} />
                <Route
                  path="/control-tower/inbox"
                  element={<ExceptionInbox />}
                />
                <Route
                  path="/control-tower/resolution"
                  element={<ResolutionTracking />}
                />
                <Route path="/predictive/cost" element={<CostEstimation />} />
                <Route path="/predictive/margin" element={<MarginAnalysis />} />

                {/* Governance */}
                <Route path="/audit/logs" element={<AuditLogs />} />
                <Route path="/audit/docs" element={<DocumentManagement />} />
                <Route path="/product/packs" element={<FeaturePacks />} />
                <Route path="/product/flags" element={<FeatureFlags />} />

                {/* LEGACY ROUTES (Keeping for compatibility) */}
                <Route path="/insurance" element={<InsuranceScreen />} />
                <Route
                  path="/medical-insurance"
                  element={<MedicalInsuranceScreen />}
                />
                <Route path="/fuel-card" element={<FuelCardScreen />} />
                <Route
                  path="/medical-history"
                  element={<MedicalHistoryScreen />}
                />
                <Route
                  path="/traffic-violations"
                  element={<TrafficViolationsScreen />}
                />
                <Route path="/accidents" element={<AccidentsScreen />} />
                <Route path="/contracts" element={<ContractList />} />
                <Route path="/shipments" element={<ShipmentRecordsScreen />} />
              </Routes>
            </main>
          </div>
        </div>
      </div>
    </div>
  );
};
