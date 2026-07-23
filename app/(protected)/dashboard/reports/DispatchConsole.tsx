"use client";

import { useEffect, useState } from "react";
import { ReportFilters } from "@/components/reports/ReportFilters";
import { ReportCard } from "@/components/reports/ReportCard";
import { ReportDrawer } from "@/components/reports/ReportDrawer";
import { SkeletonGrid } from "@/components/reports/SkeletonGrid";
import { FetchReportsResponse, ReportWithItems } from "@/components/reports/types";
import { Inbox, ChevronLeft, ChevronRight } from "lucide-react";

export function DispatchConsole() {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [status, setStatus] = useState("ALL");
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  
  const [data, setData] = useState<FetchReportsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedReport, setSelectedReport] = useState<ReportWithItems | null>(null);

  // Fetch reports when dependencies change
  useEffect(() => {
    let isMounted = true;
    
    async function fetchReports() {
      setIsLoading(true);
      setError(null);
      
      try {
        const res = await fetch("/api/reports/assigned", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ page, limit, status, search }),
        });
        
        if (!res.ok) throw new Error("Failed to fetch reports");
        
        const json = await res.json();
        if (isMounted) setData(json);
      } catch (err: any) {
        if (isMounted) setError(err.message);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }
    
    fetchReports();
    
    return () => { isMounted = false; };
  }, [page, limit, status, search]);

  // Handle Optimistic Update
  const handleStatusUpdate = (id: string, newStatus: string) => {
    if (!data) return;
    
    // If the new status no longer matches the current filter (and it's not ALL),
    // we should ideally remove it, but optimistic update by just changing it is fine,
    // or we can just trigger a refetch. Let's just update local state for speed.
    const updatedData = data.data.map(r => r.id === id ? { ...r, status: newStatus as any } : r);
    setData({ ...data, data: updatedData });
    
    // Optionally refetch in background if we want to be perfectly in sync:
    // fetchReports(); 
  };

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [status, search, limit]);

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">Dispatch Console</h1>
        <p className="text-neutral-500 mt-1">Manage, review, and process municipal waste reports.</p>
      </div>

      <ReportFilters
        status={status}
        setStatus={setStatus}
        search={search}
        setSearch={setSearch}
        limit={limit}
        setLimit={setLimit}
        viewMode={viewMode}
        setViewMode={setViewMode}
      />

      {/* Main Content Area */}
      {error ? (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-200 text-rose-600 p-4 rounded-xl">
          <h3 className="font-semibold">Error Loading Reports</h3>
          <p className="text-sm mt-1">{error}</p>
        </div>
      ) : isLoading ? (
        viewMode === "grid" ? (
          <SkeletonGrid count={limit} />
        ) : (
          <div className="w-full h-96 bg-neutral-100 dark:bg-neutral-800 rounded-xl animate-pulse" />
        )
      ) : data?.data.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 bg-neutral-50 dark:bg-neutral-800/30 rounded-2xl border border-dashed border-neutral-200 dark:border-neutral-700">
          <div className="w-16 h-16 bg-neutral-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-4">
            <Inbox className="w-8 h-8 text-neutral-400" />
          </div>
          <h3 className="text-lg font-semibold text-neutral-900 dark:text-white">No reports found</h3>
          <p className="text-neutral-500 text-sm mt-1 mb-6 text-center max-w-xs">
            We couldn't find any waste reports matching your current filters.
          </p>
          <button 
            onClick={() => { setStatus("ALL"); setSearch(""); }}
            className="px-6 py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 text-neutral-700 dark:text-neutral-300 font-medium rounded-xl hover:border-emerald-500 transition-colors"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.data.map((report) => (
                <ReportCard 
                  key={report.id} 
                  report={report} 
                  onClick={() => setSelectedReport(report)}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-2xl overflow-hidden">
              <table className="w-full text-left text-sm">
                <thead className="bg-neutral-50 dark:bg-neutral-800/50 text-neutral-500 border-b border-neutral-200 dark:border-neutral-800">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Report ID</th>
                    <th className="px-6 py-4 font-semibold">Location</th>
                    <th className="px-6 py-4 font-semibold">Reporter</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
                  {data?.data.map((report) => (
                    <tr key={report.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-800/30 transition-colors">
                      <td className="px-6 py-4 font-mono text-neutral-500">#{report.id.slice(-6).toUpperCase()}</td>
                      <td className="px-6 py-4 font-medium">{report.address || "Unknown"}</td>
                      <td className="px-6 py-4 text-neutral-500">{report.userEmail}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                          report.status === "PROCESSED" ? "bg-emerald-100 text-emerald-700" :
                          report.status === "FAILED" ? "bg-rose-100 text-rose-700" :
                          "bg-amber-100 text-amber-700"
                        }`}>
                          {report.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="text-emerald-600 font-medium hover:text-emerald-700"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination Footer */}
          {data && data.pagination && data.pagination.totalPages > 1 && (
            <div className="flex items-center justify-between border-t border-neutral-200 dark:border-neutral-800 pt-6">
              <p className="text-sm text-neutral-500">
                Showing <span className="font-medium text-neutral-900 dark:text-white">{(page - 1) * limit + 1}</span> to <span className="font-medium text-neutral-900 dark:text-white">{Math.min(page * limit, data.pagination.totalCount)}</span> of <span className="font-medium text-neutral-900 dark:text-white">{data.pagination.totalCount}</span> reports
              </p>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={!data.pagination.hasPrevPage}
                  className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <div className="px-4 text-sm font-medium">
                  Page {page} of {data.pagination.totalPages}
                </div>
                <button
                  onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                  disabled={!data.pagination.hasNextPage}
                  className="p-2 border border-neutral-200 dark:border-neutral-700 rounded-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Details Drawer */}
      <ReportDrawer 
        report={selectedReport} 
        isOpen={!!selectedReport} 
        onClose={() => setSelectedReport(null)}
        onUpdate={handleStatusUpdate}
      />
    </div>
  );
}
