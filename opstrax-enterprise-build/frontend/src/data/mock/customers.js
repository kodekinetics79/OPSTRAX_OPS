
import { 
  CUSTOMER_INDUSTRIES, 
  CONTRACT_GRADES, 
  VEHICLE_TYPES, 
  LOAD_TYPES, 
  RATE_TYPES 
} from "./constants";

export const MOCK_CUSTOMERS = [
  {
    id: "CUST-001",
    company_name: "Oceanic Seafoods Ltd",
    industry: CUSTOMER_INDUSTRIES.SEAFOOD,
    logo_initials: "OS",
    billing_terms: "Net 30",
    credit_limit: 500000,
    currency: "USD",
    contact_info: {
      name: "Ahmed Al-Farsi",
      role: "Logistics Manager",
      phone: "+971 50 123 4567",
      email: "logistics@oceanicseafoods.com",
    },
    status: "Active",
    contracts: [
      {
        id: "CON-OS-2025-A",
        title: "Annual Cold Chain Agreement",
        grade: CONTRACT_GRADES.PLATINUM,
        period: {
          start: "2025-01-01",
          end: "2025-12-31",
        },
        poc: {
            name: "Sarah Jenkins",
            contact: "+971 55 987 6543"
        },
        load_type: LOAD_TYPES.SEAFOOD,
        vehicle_requirements: [
          {
            type: VEHICLE_TYPES.REEFER_40FT,
            count: 5,
            engaged_details: "Dedicated fleet for daily coastal runs",
          },
          {
            type: VEHICLE_TYPES.DYNA,
            count: 10,
            engaged_details: "Last mile delivery vans",
          }
        ],
        dedicated_resources: {
            drivers_count: 12,
            vehicles_count: 15,
            notes: "Drivers must be certified for cold chain handling."
        },
        destinations: [
            "Jebel Ali Port", "Deira Fish Market", "Abu Dhabi Central Market"
        ],
        rates: [
            {
                type: RATE_TYPES.FIXED_ROUTE,
                origin: "Jebel Ali Port",
                destination: "Deira Fish Market",
                amount: 450,
                currency: "AED",
                vehicle: VEHICLE_TYPES.REEFER_40FT
            },
            {
                type: RATE_TYPES.PER_KM,
                amount: 3.5,
                currency: "AED",
                notes: "For inter-emirate runs exceeding 50km"
            }
        ]
      },
    ],
  },
  {
    id: "CUST-002",
    company_name: "MegaBuild construction",
    industry: CUSTOMER_INDUSTRIES.CONSTRUCTION,
    logo_initials: "MB",
    billing_terms: "Net 60",
    credit_limit: 1200000,
    currency: "AED",
    contact_info: {
      name: "John Smith",
      role: "Procurement Director",
      phone: "+971 52 333 4444",
      email: "procurement@megabuild.ae",
    },
    status: "Active",
    contracts: [
        {
          id: "CON-MB-2025-Q1",
          title: "Q1 Project Transport",
          grade: CONTRACT_GRADES.GOLD,
          period: {
            start: "2025-01-01",
            end: "2025-03-31",
          },
          poc: {
              name: "Eng. Moustafa",
              contact: "+971 50 111 2222"
          },
          load_type: LOAD_TYPES.DRY_GOODS,
          vehicle_requirements: [
            {
              type: VEHICLE_TYPES.FLATBED,
              count: 8,
              engaged_details: "Steel transport",
            },
          ],
          dedicated_resources: {
              drivers_count: 8,
              vehicles_count: 8,
              notes: "Drivers need construction site safety pass."
          },
          destinations: [
              "Industrial Area 1", "Downtown Construction Site"
          ],
          rates: [
              {
                  type: RATE_TYPES.DAILY_HIRE,
                  amount: 1200,
                  currency: "AED",
                  vehicle: VEHICLE_TYPES.FLATBED,
                  notes: "Includes 10 hours duty"
              }
          ]
        },
      ],
  },
  {
    id: "CUST-003",
    company_name: "FreshMart Retail",
    industry: CUSTOMER_INDUSTRIES.RETAIL,
    logo_initials: "FM",
    billing_terms: "Net 15",
    credit_limit: 200000,
    currency: "AED",
    contact_info: {
        name: "Lina K.",
        role: "Operations Head",
        phone: "+971 56 666 7777",
        email: "ops@freshmart.com",
    },
    status: "On Hold",
    contracts: [],
  }
];
