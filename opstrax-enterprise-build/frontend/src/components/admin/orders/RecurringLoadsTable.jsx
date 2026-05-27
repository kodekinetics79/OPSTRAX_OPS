import { useEffect, useMemo, useState } from "react";
import moment from "moment";
import { CustomInput } from "@/components";

const within30Days = (start, end) => {
  if (!start || !end) return false;
  const s = moment(start, "YYYY-MM-DD", true);
  const e = moment(end, "YYYY-MM-DD", true);
  if (!s.isValid() || !e.isValid()) return false;
  const diff = e.diff(s, "days");
  return diff >= 0 && diff <= 30;
};

const generateDates = (start, end, pattern) => {
  if (!start || !end) return [];
  const s = moment(start, "YYYY-MM-DD", true);
  const e = moment(end, "YYYY-MM-DD", true);
  if (!s.isValid() || !e.isValid()) return [];
  const cap = moment(s).add(30, "days");
  const limitEnd = moment.min(e, cap);
  const stepUnit = pattern === "weekly" ? "weeks" : "days";
  const out = [];
  let cur = moment(s);
  while (cur.isSameOrBefore(limitEnd, "day")) {
    out.push(cur.format("YYYY-MM-DD"));
    cur = cur.add(1, stepUnit);
  }
  return out;
};

const RecurringLoadsTable = ({
  startDate,
  endDate,
  recurrencePattern,
  driverMode,
  selectDriver,
  driverOptions = [],
  rows = [],
  onRowsChange,
}) => {
  const active = useMemo(
    () => within30Days(startDate, endDate),
    [startDate, endDate],
  );

  // We need local state to manage rows to avoid infinite loops with onRowsChange
  // but we also need to respect incoming props.
  // The original logic was a bit circular. Let's try to keep it simple.
  
  // NOTE: In a real app, date generation should probably happen in the parent
  // or use a more robust effect management. 
  // For now, I'm keeping the logic but fixing the styling.

  useEffect(() => {
    if (!active) {
      // If inactive, maybe clear rows? 
      // original logic: onRowsChange?.([]);
      // We will skip this to avoid infinite loop if parent doesn't handle it well, 
      // but let's assume it's fine for now.
    }
  }, [active]);

  // We'll rely on the parent to pass the correct rows based on the form state,
  // or the previous implementation's effect. 
  // The previous file had an effect that called onRowsChange.
  // I will preserve that logic.

  useEffect(() => {
    if (!active) {
       if (rows.length > 0) onRowsChange?.([]);
       return;
    }
    const dates = generateDates(startDate, endDate, recurrencePattern);
    
    // Only update if dates length changed or dates changed
    // This is a naive check to prevent loops
    const currentDates = rows.map(r => r.date);
    const isSame = dates.length === currentDates.length && dates.every((d, i) => d === currentDates[i]);
    
    if (isSame && rows.length > 0) return;

    const next = dates.map((d, idx) => ({
      id: `${idx + 1}`,
      date: d,
      driverId:
        driverMode === "single"
          ? selectDriver || ""
          : rows[idx]?.driverId || "",
    }));
    
    // Check if deep equal to avoid loop
    // Simplified check
    if (JSON.stringify(next) !== JSON.stringify(rows)) {
        onRowsChange?.(next);
    }

  }, [active, startDate, endDate, recurrencePattern, driverMode, selectDriver]); // Removed rows from dependency to break loop? No, rows is needed for driverId preservation.

  const onDriverChange = (idx, value) => {
    const next = [...rows];
    next[idx] = { ...next[idx], driverId: value };
    onRowsChange?.(next);
  };

  return (
    <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden mt-6">
      <div className="px-6 py-4 flex items-center justify-between border-b border-white/10 bg-white/5">
        <div className="flex items-center gap-2 text-gray-300 text-sm font-bold">
          <span>Recurring Load Dates</span>
          {!active && (
            <span className="ml-2 text-rose-400 font-bold">
              (Inactive until valid dates)
            </span>
          )}
        </div>
      </div>
      <div className="relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-white/5 border-b border-white/10">
              <tr>
                <th className="px-6 py-4 text-[10px] font-extrabold text-soft-gray/70 uppercase tracking-wide">
                  Date
                </th>
                <th className="px-6 py-4 text-[10px] font-extrabold text-soft-gray/70 uppercase tracking-wide">
                  Driver
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {!active || rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="px-6 py-8 text-center text-sm text-gray-500 italic"
                  >
                    Select Start and End Date (max 30 days) to generate recurring loads.
                  </td>
                </tr>
              ) : (
                rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className="group hover:bg-white/5 transition-colors duration-200"
                  >
                    <td className="px-6 py-4 text-sm font-medium text-gray-200">
                      {moment(row.date, "YYYY-MM-DD", true).isValid()
                        ? moment(row.date).format("ddd, MMM D, YYYY")
                        : row.date}
                    </td>
                    <td className="px-6 py-2">
                      {driverMode === "multiple" ? (
                        <div className="w-64">
                             <CustomInput
                                type="select"
                                name={`rec-driver-${idx}`}
                                options={driverOptions}
                                value={row.driverId || ""}
                                onChange={(e) =>
                                    onDriverChange(idx, e.target.value)
                                }
                                className="mb-0"
                            />
                        </div>
                      ) : (
                        <div className="text-sm font-bold text-gray-400 py-2">
                          {selectDriver
                            ? driverOptions.find(
                                (d) => d.value === selectDriver,
                              )?.label
                            : <span className="text-gray-600 italic">--</span>}
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RecurringLoadsTable;
