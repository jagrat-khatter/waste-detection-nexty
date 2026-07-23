import { Search, LayoutGrid, List } from "lucide-react";
import { useEffect, useState } from "react";

interface ReportFiltersProps {
  status: string;
  setStatus: (s: string) => void;
  search: string;
  setSearch: (s: string) => void;
  limit: number;
  setLimit: (l: number) => void;
  viewMode: "grid" | "table";
  setViewMode: (v: "grid" | "table") => void;
}

export function ReportFilters({
  status,
  setStatus,
  search,
  setSearch,
  limit,
  setLimit,
  viewMode,
  setViewMode,
}: ReportFiltersProps) {
  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    const handler = setTimeout(() => {
      setSearch(localSearch);
    }, 400);
    return () => clearTimeout(handler);
  }, [localSearch, setSearch]);

  const tabs = ["ALL", "PENDING", "PROCESSED", "FAILED"];

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        {/* Status Tabs */}
        <div className="flex space-x-1 bg-neutral-100 dark:bg-neutral-800 p-1 rounded-xl w-full sm:w-auto overflow-x-auto">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setStatus(t)}
              className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors whitespace-nowrap ${
                status === t
                  ? "bg-white dark:bg-neutral-900 text-emerald-600 dark:text-emerald-400 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700 dark:hover:text-neutral-300"
              }`}
            >
              {t.charAt(0) + t.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative flex-1 sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search ID, Email, Sector..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm outline-none focus:border-emerald-500 transition-colors"
            />
          </div>

          {/* Page Limit */}
          <select
            value={limit}
            onChange={(e) => setLimit(Number(e.target.value))}
            className="px-3 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl text-sm font-medium outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>

          {/* View Toggle */}
          <div className="flex items-center bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-1">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "grid" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === "table" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600" : "text-neutral-400 hover:text-neutral-600"
              }`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
