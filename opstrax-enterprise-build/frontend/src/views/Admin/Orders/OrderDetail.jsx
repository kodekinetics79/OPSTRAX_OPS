import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ShoppingCart,
  MapPin,
  Clock,
  CreditCard,
  ChevronLeft,
  AlertCircle,
  Package,
  Activity,
  User,
  Info,
  Truck,
  CalendarDays,
  DollarSign,
  FileText,
  Calendar,
} from "lucide-react";
import { StatusBadge } from "@/components";
import { ORDERS } from "@/components/admin/orders/orders.data";
import moment from "moment";

// Helper functions for consistent missing value handling
const show = (v) =>
  v !== undefined && v !== null && String(v).trim() !== "" ? v : undefined;
const formatDate = (d) => {
  if (!d) return undefined;
  const m = moment(d);
  return m.isValid() ? m.format("YYYY-MM-DD") : undefined;
};

// Local components matching ClientDetails.jsx exactly
const InfoCard = ({ title, icon: Icon, children, className = "" }) => (
  <div
    className={`bg-card-dark rounded-2xl shadow-lg border border-white/5 p-6 ${className}`}
  >
    <div className="flex items-center gap-3 mb-6">
      <div className="p-2 rounded-xl bg-white/5 text-gray-200 border border-white/5">
        <Icon size={20} />
      </div>
      <h3 className="font-bold text-white tracking-tight">{title}</h3>
    </div>
    {children}
  </div>
);

const DetailRow = ({ label, value, icon: Icon }) => (
  <div className="flex items-start gap-4 mb-4 last:mb-0">
    {Icon && (
      <div className="mt-0.5 text-gray-500">
        <Icon size={16} />
      </div>
    )}
    <div className="flex flex-col">
      <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-0.5">
        {label}
      </span>
      <span className="text-sm font-semibold text-gray-200">
        {value || <span className="text-gray-600 italic">Not provided</span>}
      </span>
    </div>
  </div>
);

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const order = ORDERS.find((o) => o.id === orderId);

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-gray-500">
        <AlertCircle size={48} className="mb-4 opacity-20" />
        <p className="text-lg font-medium">Order not found</p>
        <button
          onClick={() => navigate("/admin/orders")}
          className="mt-4 text-primary font-semibold hover:underline"
        >
          Back to Orders
        </button>
      </div>
    );
  }

  // Data preparation
  const clientName = order.customer;
  const referenceId = order.id;
  const startDate = order.startDate
    ? formatDate(order.startDate)
    : order.date
      ? formatDate(order.date)
      : undefined;
  const endDate = order.endDate ? formatDate(order.endDate) : startDate;
  const startTime = show(order.startTime);
  const endTime = show(order.endTime);
  const items = show(order.items);
  const weight = show(order.weight);
  const status = order.status || "New";
  const startLocation = show(order.startLocation);
  const endLocation = show(order.endLocation);
  const forceLoad = order.forceLoad ? "Yes" : "No";

  // Financial calculations
  const miles = Number(order.totalMiles || 0);
  const rateMile = Number(order.ratePerMile || 0);
  const hours = Number(order.totalHours || 0);
  const rateHour = Number(order.ratePerHour || 0);
  const rateStop = Number(order.ratePerStop || 0);
  const rateTrip = Number(order.ratePerTrip || 0);
  const extras = Number(order.extras || 0);
  const totalMilesCost = miles * rateMile;
  const totalHourlyPay = hours * rateHour;
  const totalStopPay = rateStop * (order.stops?.length || 0);
  const totalPay =
    totalMilesCost + totalHourlyPay + totalStopPay + rateTrip + extras;

  const payTotalLabel =
    order.amount ||
    new Intl.NumberFormat("en-AE", {
      style: "currency",
      currency: "AED",
    }).format(totalPay);

  return (
    <div className="w-full space-y-8 animate-fade-in pb-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl bg-linear-to-br from-slate-900 via-blue-900/50 to-fade p-8 text-white shadow-xl border border-white/10">
        <div className="absolute -right-10 -top-10 w-40 h-40 rounded-full bg-primary/5 blur-2xl" />
        <div className="relative flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-2xl bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-3xl font-bold">
              {clientName?.charAt(0) || <ShoppingCart size={36} className="text-primary" />}
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  {clientName}
                </h1>
                <StatusBadge status={status} />
              </div>
              <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm font-medium">
                <span className="flex items-center gap-1 font-mono text-gray-500">
                  <Info size={14} />
                  {show(referenceId)}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays size={14} />
                  {startDate}
                </span>
                <span className="flex items-center gap-1">
                  <Truck size={14} />
                  {items}
                </span>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate("/admin/orders")}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl text-sm font-semibold transition-all text-gray-300"
            >
              <ChevronLeft size={18} />
              Back
            </button>
            <button
              onClick={() => navigate(`/admin/orders/edit/${order.id}`)}
              className="flex items-center gap-2 px-4 py-2 bg-primary hover:bg-primary/90 text-black rounded-xl text-sm font-bold transition-all shadow-lg shadow-primary/20"
            >
              Edit Order
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Order Profile & Scheduling */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Order Profile" icon={ShoppingCart}>
            <div className="space-y-4">
              <DetailRow
                label="Reference ID"
                value={referenceId}
                icon={FileText}
              />
              <DetailRow label="Customer" value={clientName} icon={User} />
              <DetailRow label="Items" value={items} icon={Package} />
              <DetailRow label="Weight" value={weight} icon={Truck} />
              <DetailRow
                label="Amount"
                value={payTotalLabel}
                icon={DollarSign}
              />
            </div>
          </InfoCard>

          <InfoCard title="Scheduling" icon={CalendarDays}>
            <div className="space-y-4">
              <DetailRow label="Start Date" value={startDate} icon={Calendar} />
              <DetailRow label="End Date" value={endDate} icon={Calendar} />
              <DetailRow label="Start Time" value={startTime} icon={Clock} />
              <DetailRow label="End Time" value={endTime} icon={Clock} />
            </div>
          </InfoCard>
        </div>

        {/* Middle Column: Logistics & Stops */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Logistics" icon={MapPin}>
            <div className="space-y-4">
              <DetailRow
                label="Start Location"
                value={startLocation}
                icon={MapPin}
              />
              <DetailRow
                label="End Location"
                value={endLocation}
                icon={MapPin}
              />
              <DetailRow label="Force Load" value={forceLoad} icon={Info} />
            </div>
          </InfoCard>

          <InfoCard title="Stops" icon={Truck}>
            <div className="space-y-4">
              {(order.stops || []).length === 0 ? (
                <p className="text-sm text-gray-600 italic">Not provided</p>
              ) : (
                <div className="space-y-3">
                  {order.stops.map((s, idx) => (
                    <div
                      key={idx}
                      className="p-3 bg-white/5 rounded-lg border border-white/5"
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <MapPin size={14} className="text-gray-400" />
                        <span className="text-sm font-semibold text-gray-200">
                          {s.name}
                        </span>
                      </div>
                      <div className="flex gap-3 text-xs text-gray-500 pl-6">
                        <span>{formatDate(s.date) || "No date"}</span>
                        <span>•</span>
                        <span>{show(s.time) || "No time"}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </InfoCard>

          {(order.recurrences || []).length > 0 && (
            <InfoCard title="Recurrences" icon={Activity}>
              <div className="space-y-4">
                <DetailRow
                  label="Pattern"
                  value={order.recurrencePattern}
                  icon={Calendar}
                />
                <DetailRow
                  label="Driver Mode"
                  value={order.driverMode}
                  icon={Truck}
                />
                <div className="pt-2">
                  <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 block">
                    Recurrence List
                  </span>
                  <div className="max-h-40 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                    {order.recurrences.map((r, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between text-xs p-2 bg-white/5 rounded border border-white/5"
                      >
                        <span className="font-medium text-gray-300">
                          {formatDate(r.date)}
                        </span>
                        <span className="text-gray-500">
                          {show(r.driverId)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </InfoCard>
          )}
        </div>

        {/* Right Column: Financials & Docs */}
        <div className="lg:col-span-1 space-y-8">
          <InfoCard title="Financial Details" icon={CreditCard}>
            <div className="space-y-4">
              <DetailRow
                label="Total Amount"
                value={payTotalLabel}
                icon={CreditCard}
              />
              <div className="pt-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 block">
                  Cost Breakdown
                </span>
                <div className="space-y-2 bg-white/5 p-3 rounded-lg border border-white/5">
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>
                      Miles ({miles} x {rateMile})
                    </span>
                    <span className="font-medium text-gray-200">
                      {new Intl.NumberFormat("en-AE", {
                        style: "currency",
                        currency: "AED",
                      }).format(totalMilesCost)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>
                      Hours ({hours} x {rateHour})
                    </span>
                    <span className="font-medium text-gray-200">
                      {new Intl.NumberFormat("en-AE", {
                        style: "currency",
                        currency: "AED",
                      }).format(totalHourlyPay)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Stops</span>
                    <span className="font-medium text-gray-200">
                      {new Intl.NumberFormat("en-AE", {
                        style: "currency",
                        currency: "AED",
                      }).format(totalStopPay)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Trip Rate</span>
                    <span className="font-medium text-gray-200">
                      {new Intl.NumberFormat("en-AE", {
                        style: "currency",
                        currency: "AED",
                      }).format(rateTrip)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>Extras</span>
                    <span className="font-medium text-gray-200">
                      {new Intl.NumberFormat("en-AE", {
                        style: "currency",
                        currency: "AED",
                      }).format(extras)}
                    </span>
                  </div>
                  <div className="border-t border-white/10 pt-2 mt-2 flex justify-between text-sm font-bold text-white">
                    <span>Total</span>
                    <span className="text-primary">
                      {new Intl.NumberFormat("en-AE", {
                        style: "currency",
                        currency: "AED",
                      }).format(totalPay)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </InfoCard>

          <InfoCard title="Additional Info" icon={FileText}>
            <div className="space-y-4">
              <div className="pt-0">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 block">
                  Documents
                </span>
                {(order.documents || []).length === 0 ? (
                  <p className="text-sm text-gray-600 italic">Not provided</p>
                ) : (
                  <ul className="space-y-2">
                    {order.documents.map((d, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-sm text-primary font-medium"
                      >
                        <FileText size={14} />
                        {d.name}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              <div className="pt-2">
                <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold mb-1 block">
                  Comments
                </span>
                <p className="text-sm font-medium text-gray-300 bg-white/5 p-3 rounded-lg border border-white/5 italic">
                  "{show(order.comments) || "No comments provided."}"
                </p>
              </div>
            </div>
          </InfoCard>
        </div>
      </div>
    </div>
  );
};

export default OrderDetail;
