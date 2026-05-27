import { useState } from "react";
import { MoreHorizontal, MapPin, Clock, ArrowRight, User } from "lucide-react";
import { Card, Badge, PremiumHeader } from "@/components";

// --- Activity Component ---
const ActivityChart = () => {
  const data = [15, 35, 25, 60, 75, 55, 45, 80, 65, 40, 50, 70];
  const days = ["17 Jun", "18 Jun", "19 Jun", "20 Jun", "21 Jun", "22 Jun", "23 Jun"];
  // Mocking a fuller dataset visually for the "bar chart" look
  const bars = [
    { h: 20, active: false },
    { h: 35, active: false },
    { h: 25, active: false },
    { h: 15, active: false },
    { h: 40, active: false },
    { h: 65, active: true }, // Highlighted group start
    { h: 85, active: true },
    { h: 55, active: true },
    { h: 35, active: false },
    { h: 25, active: false },
    { h: 45, active: true },
    { h: 60, active: true },
  ];

  return (
    <div className="flex flex-col h-full justify-between">
       {/* Y-Axis Labels (Visual Only) */}
       <div className="flex justify-between items-end h-40 gap-2 relative">
          {/* Grid lines could go here */}
          
          {bars.map((bar, index) => (
            <div key={index} className="flex flex-col justify-end h-full flex-1 group relative">
              {/* Tooltip for the highest bar or specific one */}
              {index === 6 && (
                <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-bg-card border border-border-subtle text-text-primary px-3 py-1.5 rounded-lg shadow-lg z-20 w-max text-center">
                  <div className="text-[10px] font-bold text-text-muted">20 Jun</div>
                  <div className="text-xs font-bold">40 orders</div>
                  {/* Arrow */}
                  <div className="absolute bottom-[-4px] left-1/2 -translate-x-1/2 w-2 h-2 bg-bg-card border-b border-r border-border-subtle rotate-45"></div>
                </div>
              )}
              
              <div 
                className={`w-full rounded-t-sm transition-all duration-300 hover:opacity-80 ${
                  bar.active ? "bg-primary shadow-[0_0_10px_rgba(240,249,65,0.3)]" : "bg-secondary-light"
                }`}
                style={{ height: `${bar.h}%` }}
              />
            </div>
          ))}
       </div>
       
       {/* Legend / X-Axis */}
       <div className="flex justify-between mt-4 px-2">
          {["17 Jun", "18 Jun", "19 Jun", "20 Jun", "21 Jun", "22 Jun", "23 Jun"].map((day, i) => (
            <span key={i} className="text-[9px] font-medium text-text-muted">{day}</span>
          ))}
       </div>
       
       {/* Legend Indicators */}
       <div className="flex justify-center gap-4 mt-4">
          <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-text-secondary/20"></div>
          <span className="text-[9px] text-text-muted">less than 10 orders</span>
          </div>
          <div className="flex items-center gap-1.5">
          <div className="w-2 h-2 rounded-full bg-text-secondary"></div>
          <span className="text-[9px] text-text-muted">10-19 orders</span>
          </div>
          <div className="flex items-center gap-1.5">
             <div className="w-2 h-2 rounded-full bg-primary shadow-[0_0_5px_rgba(240,249,65,0.5)]"></div>
          <span className="text-[9px] text-text-muted">20+ orders</span>
          </div>
       </div>
    </div>
  );
};

// --- Top Customers Component ---
const CustomerCard = ({ name, company, orders, avatarUrl }) => (
  <div className="bg-bg-card/40 rounded-2xl p-4 border border-border-subtle hover:border-primary/30 hover:bg-bg-card/60 transition-all duration-300 group flex flex-col justify-between h-32 relative overflow-hidden">
    <div className="absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <ArrowRight size={16} className="text-primary -rotate-45" />
    </div>
    
    <div className="flex items-start gap-3">
      <div className="w-10 h-10 rounded-full bg-text-secondary/10 flex items-center justify-center overflow-hidden border border-border-subtle group-hover:border-primary/50 transition-colors">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
            <User size={20} className="text-text-muted group-hover:text-primary" />
        )}
      </div>
      <div>
        <h4 className="text-sm font-bold text-text-primary leading-tight">{name}</h4>
        <p className="text-[10px] text-text-muted mt-0.5">{company}</p>
      </div>
    </div>
    
    <div className="mt-auto">
      <div className="flex items-end gap-1">
        <span className="text-2xl font-bold text-text-primary group-hover:text-primary transition-colors">{orders}</span>
        <span className="text-[10px] text-text-muted mb-1.5 font-medium uppercase tracking-wider">Orders</span>
      </div>
    </div>
  </div>
);

// --- Orders Component ---
const OrderRow = ({ id, address, expiry, status }) => {
  const isTransit = status === "In Transit";
  
  return (
    <div className="grid grid-cols-12 gap-4 items-center p-4 border-b border-border-subtle hover:bg-bg-card/40 transition-colors last:border-0">
      <div className="col-span-2 text-sm font-bold text-text-primary">#{id}</div>
      <div className="col-span-10 sm:col-span-5 flex items-center gap-2 text-sm text-text-secondary">
        <MapPin size={14} className="text-text-muted shrink-0" />
        <span className="truncate">{address}</span>
      </div>
      <div className="col-span-6 sm:col-span-3 flex items-center gap-2 text-xs text-text-muted">
        <Clock size={14} className="text-text-muted shrink-0" />
        <span>{expiry}</span>
      </div>
      <div className="col-span-6 sm:col-span-2 flex justify-end">
        <Badge variant={isTransit ? "neon" : "default"} size="sm" className="rounded-full px-3">
          {status}
        </Badge>
      </div>
    </div>
  );
};

export const DashboardOperationsPanel = () => {
  const [activeTab, setActiveTab] = useState("Pending");
  const tabs = ["Pending", "Responded", "Assigned", "Completed"];

  return (
    <div className="grid grid-cols-1 laptop:grid-cols-3 gap-6">
      
      {/* Left Column */}
      <div className="laptop:col-span-1 space-y-6">
        
        {/* Activity Card */}
        <Card variant="default" className="h-[380px] flex flex-col">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-lg font-bold text-text-primary">Activity</h3>
            <button className="text-xs text-text-muted hover:text-text-primary transition-colors flex items-center gap-1 bg-bg-card/40 px-3 py-1 rounded-lg">
              This week <ArrowRight size={12} className="rotate-90" />
            </button>
          </div>
          <div className="flex-1 mt-4">
            <ActivityChart />
          </div>
        </Card>

        {/* Top Customers Card */}
        <Card variant="default">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-text-primary">Top Customers</h3>
            <button className="text-xs text-text-muted hover:text-primary transition-colors flex items-center gap-1">
              This Week <ArrowRight size={12} className="rotate-90" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <CustomerCard name="Adem Barnes" company="TechNova Inc." orders="185" />
            <CustomerCard name="Issac Bowman" company="AeroSupply Co." orders="210" />
          </div>
        </Card>

      </div>

      {/* Right Column: Orders */}
      <div className="laptop:col-span-2">
        <Card variant="default" className="h-full flex flex-col min-h-[500px]">
          {/* Header & Tabs */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-xl font-bold text-text-primary">Orders</h3>
            
            <div className="flex bg-bg-primary p-1 rounded-xl">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`
                    px-4 py-1.5 rounded-lg text-xs font-bold transition-all duration-300
                    ${activeTab === tab 
                    ? "bg-primary text-[#000000] shadow-lg"
                    : "text-text-muted hover:text-text-primary hover:bg-bg-card/40"
                    }
                  `}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table Headers */}
          <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold text-text-muted uppercase tracking-wider border-b border-border-subtle">
            <div className="col-span-2">Order ID</div>
            <div className="col-span-5">Address</div>
            <div className="col-span-3">Expiry</div>
            <div className="col-span-2 text-right">Status</div>
          </div>

          {/* Table Body */}
          <div className="flex-1 overflow-y-auto custom-scrollbar">
            <OrderRow 
              id="8492" 
              address="4521 Santa Monica Blvd, Los Angeles" 
              expiry="2 hrs 15 min" 
              status="In Transit" 
            />
            <OrderRow 
              id="8493" 
              address="1200 Market St, San Francisco, CA" 
              expiry="4 hrs 30 min" 
              status="Picked up" 
            />
            <OrderRow 
              id="8494" 
              address="8900 Wilshire Blvd, Beverly Hills" 
              expiry="5 hrs 00 min" 
              status="In Transit" 
            />
            <OrderRow 
              id="8495" 
              address="350 5th Ave, New York, NY 10118" 
              expiry="1 day left" 
              status="Picked up" 
            />
            <OrderRow 
              id="8496" 
              address="20 W 34th St, New York, NY 10001" 
              expiry="2 days left" 
              status="Picked up" 
            />
          </div>

          <div className="mt-4 pt-4 border-t border-border-subtle flex justify-end">
             <button className="flex items-center gap-2 text-xs font-bold text-primary hover:text-primary/80 transition-colors">
               View All Orders <ArrowRight size={14} />
             </button>
          </div>
        </Card>
      </div>

    </div>
  );
};
