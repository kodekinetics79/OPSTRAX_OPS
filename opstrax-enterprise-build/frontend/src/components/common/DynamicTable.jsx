import { useEffect, useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Search,
  Filter,
} from "lucide-react";

const DynamicTable = ({
  columns,
  data = [],
  hideSearchBar = false,
  hidePageSize = false,
  loading = false,
  // Controlled pagination props
  currentPage: externalCurrentPage,
  setCurrentPage: externalSetCurrentPage,
  totalPages: externalTotalPages,
  pageSize: externalPageSize,
  setPageSize: externalSetPageSize,
  placeholder = "Search...",
  filters,
}) => {
  // Internal state for when external control is not provided
  const [internalSearchTerm, setInternalSearchTerm] = useState("");
  const [internalCurrentPage, setInternalCurrentPage] = useState(1);
  const [internalPageSize, setInternalPageSize] = useState(10);

  // Determine if using internal or external state
  const isControlled = externalCurrentPage !== undefined;
  const currentPage = isControlled ? externalCurrentPage : internalCurrentPage;
  const setCurrentPage = isControlled ? externalSetCurrentPage : setInternalCurrentPage;
  const pageSize = isControlled ? (externalPageSize || 10) : internalPageSize;
  const setPageSize = isControlled ? (externalSetPageSize || (() => {})) : setInternalPageSize;

  // Process data if not controlled
  const filteredData = useMemo(() => {
    if (isControlled) return data;
    return (data || []).filter((item) =>
      Object.values(item).some((val) =>
        String(val).toLowerCase().includes(internalSearchTerm.toLowerCase())
      )
    );
  }, [data, internalSearchTerm, isControlled]);

  const totalPages = isControlled 
    ? (externalTotalPages || 1) 
    : Math.ceil(filteredData.length / pageSize);

  const displayData = isControlled 
    ? data 
    : filteredData.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Non-table actions handled by parent components

  return (
    <div className="w-full space-y-8 animate-fade-in">
      {/* Table Section */}
      <div className="bg-card-dark/40 backdrop-blur-md rounded-[24px] shadow-2xl border border-border-subtle/30 overflow-hidden">
        {/* Controls Toolbar */}
        <div className="p-5 flex flex-col tablet:flex-row tablet:items-center justify-between gap-5 bg-dark-bg/40 border-b border-border-subtle/20">
          {!hideSearchBar && (
            <div className="relative group min-w-[320px]">
              <Search
                size={16}
                className="absolute left-0 top-1/2 -translate-y-1/2 text-text-dim/30 group-focus-within:text-primary transition-colors"
              />
              <input
                type="text"
                placeholder={placeholder}
                value={isControlled ? "" : internalSearchTerm}
                onChange={(e) => !isControlled && setInternalSearchTerm(e.target.value)}
                className="w-full bg-transparent border-b border-border-subtle/50 py-2.5 pl-8 pr-4 text-sm outline-none text-text-main focus:border-primary/50 transition-all font-medium"
              />
            </div>
          )}

          <div className="flex items-center gap-4 ml-auto">
            {filters && <div className="flex items-center gap-2">{filters}</div>}
            
            <button className="flex items-center gap-2 px-4 py-2 border border-border-subtle/50 rounded-xl hover:bg-primary/5 text-text-dim text-xs font-bold transition-all hover:text-text-main">
              <Filter size={14} />
              <span>Filter</span>
            </button>

            {!hidePageSize && (
              <select
                value={pageSize}
                onChange={(e) => setPageSize(Number(e.target.value))}
                className="bg-dark-bg/50 border border-border-subtle/50 rounded-xl px-4 py-2 text-xs outline-none cursor-pointer text-text-main focus:border-primary/30 transition-all font-bold"
              >
                {[5, 10, 20, 50].map((num) => (
                  <option key={num} value={num}>
                    {num} per page
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {/* Table Body */}
        <div className="relative">
          {loading ? (
            <div className="flex items-center justify-center py-32">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary/30 border-t-primary shadow-[0_0_15px_rgba(240,249,65,0.2)]"></div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-dark-bg/20 border-b border-border-subtle/30">
                  <tr>
                    {columns?.map((col, index) => (
                      <th
                        key={index}
                        className="px-6 py-4 text-[11px] font-bold text-text-dim/40 uppercase tracking-[0.15em]"
                      >
                        {col.label || col.header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle/20">
                  {displayData?.length > 0 ? (
                    displayData.map((row, index) => (
                      <tr
                        key={index}
                        className="group hover:bg-primary/2 transition-colors duration-200"
                      >
                        {columns.map((col, colIndex) => (
                          <td
                            key={colIndex}
                            className="px-6 py-4.5 text-sm font-medium text-text-main/80"
                          >
                            <div className="transition-transform duration-300 group-hover:translate-x-1">
                              {col.renderCell
                                ? col.renderCell(row)
                                : col.render
                                ? col.render(row)
                                : col.accessor === "userCount"
                                ? (row[col.accessor]?.length ?? "--")
                                : (row[col.accessor] ?? "--")}
                            </div>
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={columns?.length} className="px-6 py-32 text-center">
                        <div className="flex flex-col items-center gap-4 text-text-dim/20">
                          <Search size={32} strokeWidth={1.5} />
                          <p className="text-[10px] font-black uppercase tracking-[0.2em]">No records found</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-dark-bg/20 border-t border-border-subtle/30">
            <p className="text-[10px] font-bold text-text-dim/30 uppercase tracking-[0.15em]">
              Page {currentPage} of {totalPages}
            </p>
            <div className="flex items-center gap-2">
              <PaginationButton
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                icon={ChevronsLeft}
              />
              <PaginationButton
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                icon={ChevronLeft}
              />

              <div className="flex items-center gap-2 mx-4">
                {getVisiblePages(currentPage, totalPages).map((p, idx) => (
                  p === "..." ? (
                    <span key={`dots-${idx}`} className="px-1 text-text-dim/20">...</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setCurrentPage(p)}
                      className={`min-w-[32px] h-8 rounded-lg text-[11px] font-black transition-all ${
                        currentPage === p
                          ? "bg-primary text-black-fixed shadow-[0_0_15px_rgba(240,249,65,0.3)] scale-105"
                          : "text-text-dim/60 hover:text-text-main"
                      }`}
                    >
                      {p}
                    </button>
                  )
                ))}
              </div>

              <PaginationButton
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                icon={ChevronRight}
              />
              <PaginationButton
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                icon={ChevronsRight}
              />
            </div>
          </div>
        )}
      </div>

    </div>
  );
};

const PaginationButton = ({ onClick, disabled, icon: Icon }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className="w-9 h-9 flex items-center justify-center rounded-xl border border-border-subtle text-text-dim hover:bg-primary/10 hover:text-text-main hover:border-primary/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed group shadow-sm cursor-pointer"
  >
    <Icon size={16} className="group-hover:text-primary transition-colors" />
  </button>
);

const getVisiblePages = (current, total) => {
  const delta = 2;
  const range = [];
  for (let i = Math.max(2, current - delta); i <= Math.min(total - 1, current + delta); i++) {
    range.push(i);
  }

  if (current - delta > 2) range.unshift("...");
  range.unshift(1);
  if (current + delta < total - 1) range.push("...");
  if (total > 1) range.push(total);

  return range;
};

export default DynamicTable;
