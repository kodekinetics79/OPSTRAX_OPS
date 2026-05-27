import {
  LayoutDashboard,
  Building2,
  Database,
  Users,
  Calculator, // For Rating/Pricing
  ShoppingCart, // Orders
  Truck, // Dispatch/Fleet
  HardHat, // Drivers
  MapPin, // Telematics
  Wrench, // Maintenance
  DollarSign, // Financials
  Briefcase, // Carriers
  Globe, // Portal
  BarChart2, // Performance
  TowerControl, // Control Tower (approx)
  LineChart, // Predictive
  FileText, // Audit
  Package, // Productization
  Shield,
  Heart,
  CreditCard,
  Stethoscope,
  AlertTriangle,
  Car,
} from "lucide-react";

export const menuItems = [
  {
    category: "GENERAL",
    items: [
      { id: "1", link: "/admin", name: "Dashboard", icon: LayoutDashboard },
    ],
  },
  {
    category: "ORGANIZATION",
    items: [
      {
        id: "org-1",
        link: "/admin/org/tenants",
        name: "Tenant Management",
        icon: Building2,
      },
      {
        id: "org-2",
        link: "/admin/org/branches",
        name: "Branch Management",
        icon: Building2,
      }, // reuse icon
      {
        id: "org-3",
        link: "/admin/org/users",
        name: "User Management",
        icon: Users,
      },
      {
        id: "org-4",
        link: "/admin/org/rbac",
        name: "Access Control (RBAC)",
        icon: Shield,
      },
    ],
  },
  {
    category: "DRIVER MANAGEMENT",
    items: [
      {
        id: "drv-1",
        link: "/admin/drivers/profiles",
        name: "Driver Management",
        icon: HardHat,
      },
      {
        id: "drv-2",
        link: "/admin/drivers/hos",
        name: "HOS Compliance",
        icon: AlertTriangle,
      },
    ],
  },
  {
    category: "ASSETS",
    items: [
      {
        id: "flt-1",
        link: "/admin/fleet/vehicles",
        name: "Vehicle List",
        icon: Truck,
      },
      {
        id: "flt-2",
        link: "/admin/fleet/assets",
        name: "Asset Registry",
        icon: Database,
      },
    ],
  },
  {
    category: "MASTER DATA",
    items: [
      {
        id: "md-1",
        link: "/admin/master/locations",
        name: "Locations",
        icon: MapPin,
      },
      {
        id: "md-2",
        link: "/admin/master/status-codes",
        name: "Status Codes",
        icon: Database,
      },
    ],
  },
  {
    category: "COMMERCIAL",
    items: [
      // {
      //   id: "cust-1",
      //   link: "/admin/customers/profiles",
      //   name: "Customers",
      //   icon: Users,
      // },
      {
        id: "cust-2",
        link: "/admin/customers/contracts",
        name: "Contracts",
        icon: FileText,
      },
      {
        id: "clt-mgmt",
        link: "/admin/clients",
        name: "Client Management",
        icon: Building2,
      },
      {
        id: "rate-1",
        link: "/admin/pricing/rates",
        name: "Rate Cards",
        icon: Calculator,
      },
      {
        id: "rate-2",
        link: "/admin/pricing/simulation",
        name: "Price Simulation",
        icon: LineChart,
      },
    ],
  },
  {
    category: "OPERATIONS",
    items: [
      {
        id: "ops-1",
        link: "/admin/orders",
        name: "Orders",
        icon: ShoppingCart,
      },
      {
        id: "ops-2",
        link: "/admin/dispatch/plans",
        name: "Dispatch Plans",
        icon: Truck,
      },
      {
        id: "ops-3",
        link: "/admin/dispatch/routes",
        name: "Route Plans",
        icon: MapPin,
      },
      {
        id: "ops-4",
        link: "/admin/dispatch/ai",
        name: "AI Dispatch",
        icon: Database,
      },
    ],
  },
  {
    category: "TELEM & MAINT",
    items: [
      {
        id: "tel-1",
        link: "/admin/telematics/devices",
        name: "IoT Devices",
        icon: Database,
      },
      {
        id: "tel-2",
        link: "/admin/telematics/cold-chain",
        name: "Cold Chain",
        icon: Database,
      },
      {
        id: "mnt-1",
        link: "/admin/maintenance/work-orders",
        name: "Work Orders",
        icon: Wrench,
      },
      {
        id: "mnt-2",
        link: "/admin/maintenance/downtime",
        name: "Downtime",
        icon: AlertTriangle,
      },
    ],
  },
  {
    category: "FINANCIALS",
    items: [
      {
        id: "fin-1",
        link: "/admin/financials/fuel",
        name: "Fuel Trans.",
        icon: DollarSign,
      },
      {
        id: "fin-2",
        link: "/admin/financials/expenses",
        name: "Expenses",
        icon: DollarSign,
      },
    ],
  },
  {
    category: "EXTERNAL",
    items: [
      {
        id: "car-1",
        link: "/admin/carriers/list",
        name: "Carriers",
        icon: Briefcase,
      },
      {
        id: "car-2",
        link: "/admin/carriers/rates",
        name: "Carrier Rates",
        icon: Calculator,
      },
      {
        id: "ptl-1",
        link: "/admin/portal/bookings",
        name: "Portal Bookings",
        icon: Globe,
      },
      {
        id: "ptl-2",
        link: "/admin/portal/users",
        name: "Portal Users",
        icon: Users,
      },
    ],
  },
  {
    category: "INTELLIGENCE",
    items: [
      {
        id: "perf-1",
        link: "/admin/performance/sla",
        name: "SLA Monitoring",
        icon: BarChart2,
      },
      {
        id: "perf-2",
        link: "/admin/performance/kpi",
        name: "KPI Dashboard",
        icon: BarChart2,
      },
      {
        id: "ct-1",
        link: "/admin/control-tower/inbox",
        name: "Exception Inbox",
        icon: AlertTriangle,
      },
      {
        id: "ct-2",
        link: "/admin/control-tower/resolution",
        name: "Resolution",
        icon: Shield,
      },
      {
        id: "pred-1",
        link: "/admin/predictive/cost",
        name: "Cost Estimation",
        icon: Calculator,
      },
      {
        id: "pred-2",
        link: "/admin/predictive/margin",
        name: "Margin Analysis",
        icon: LineChart,
      },
    ],
  },
  {
    category: "GOVERNANCE",
    items: [
      {
        id: "aud-1",
        link: "/admin/audit/logs",
        name: "Audit Logs",
        icon: FileText,
      },
      {
        id: "aud-2",
        link: "/admin/audit/docs",
        name: "Documents",
        icon: FileText,
      },
      {
        id: "prod-1",
        link: "/admin/product/packs",
        name: "Feature Packs",
        icon: Package,
      },
      {
        id: "prod-2",
        link: "/admin/product/flags",
        name: "Feature Flags",
        icon: Database,
      },
    ],
  },
  {
    category: "DRIVE",
    items: [
      { id: 2, link: "/admin/insurance", name: "Insurance", icon: Shield },
      {
        id: 3,
        link: "/admin/medical-insurance",
        name: "Medical Insurance",
        icon: Heart,
      },
      { id: 4, link: "/admin/fuel-card", name: "Fuel Card", icon: CreditCard },
      {
        id: 5,
        link: "/admin/medical-history",
        name: "Medical History",
        icon: Stethoscope,
      },
      {
        id: 6,
        link: "/admin/traffic-violations",
        name: "Traffic Violations",
        icon: AlertTriangle,
      },
      { id: 7, link: "/admin/accidents", name: "Accidents", icon: Car },
    ],
  },
  {
    category: "CUSTOMER",
    items: [
      { id: 8, link: "/admin/contracts", name: "Contracts", icon: Users },
    ],
  },
  {
    category: "LOGISTICS",
    items: [
      { id: 9, link: "/admin/shipments", name: "Shipments", icon: Package },
    ],
  },
];

// Role-based filtered menu items. Each role has a single Dashboard entry in GENERAL
// that points to that role's base path, plus a subset of admin categories.
const baseDashboardFor = (basePath) => ({
  category: "GENERAL",
  items: [
    { id: "1", link: basePath, name: "Dashboard", icon: LayoutDashboard },
  ],
});

export const roleMenuItems = {
  // Admin keeps the full admin menu
  admin: menuItems,

  // HR: own dashboard + assets/resources section
  hr: [
    baseDashboardFor("/hr"),
    menuItems.find((c) => c.category === "DRIVER MANAGEMENT"),
    menuItems.find((c) => c.category === "ASSETS"),
  ].filter(Boolean),

  // Finance: own dashboard + financials section
  finance: [
    baseDashboardFor("/finance"),
    menuItems.find((c) => c.category === "FINANCIALS"),
  ].filter(Boolean),

  // Employee: only dashboard
  employee: [baseDashboardFor("/employee")],

  // Supervisor: own dashboard + operations section
  supervisor: [
    baseDashboardFor("/supervisor"),
    menuItems.find((c) => c.category === "OPERATIONS"),
  ].filter(Boolean),
};

export default menuItems;
