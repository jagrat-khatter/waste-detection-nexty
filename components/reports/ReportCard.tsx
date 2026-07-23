import { MapPin, Clock, Copy, CheckCircle2, AlertTriangle, Image as ImageIcon } from "lucide-react";
import { ReportWithItems } from "./types";
import { useState } from "react";

interface ReportCardProps {
  report: ReportWithItems;
  onClick: () => void;
}

function getRelativeTime(dateInput: Date | string) {
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const time = new Date(dateInput).getTime();
  const diffInSeconds = (time - Date.now()) / 1000;
  
  const days = Math.round(diffInSeconds / 86400);
  if (Math.abs(days) > 0) return rtf.format(days, "day");
  
  const hours = Math.round(diffInSeconds / 3600);
  if (Math.abs(hours) > 0) return rtf.format(hours, "hour");
  
  const minutes = Math.round(diffInSeconds / 60);
  return rtf.format(minutes, "minute");
}

export function ReportCard({ report, onClick }: ReportCardProps) {
  const [copied, setCopied] = useState(false);

  const shortId = `#RPT-${report.id.slice(-6).toUpperCase()}`;

  const copyToClipboard = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(report.id);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "PROCESSED":
        return { color: "bg-emerald-500", label: "Processed", icon: CheckCircle2 };
      case "FAILED":
        return { color: "bg-rose-500", label: "Failed", icon: AlertTriangle };
      case "PENDING":
      default:
        return { color: "bg-amber-500", label: "Pending", icon: Clock };
    }
  };

  const statusConfig = getStatusConfig(report.status);
  const StatusIcon = statusConfig.icon;

  return (
    <div
      onClick={onClick}
      className="group bg-white dark:bg-neutral-900 rounded-2xl border border-neutral-100 dark:border-neutral-800 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col overflow-hidden"
    >
      {/* Image Header */}
      <div className="relative h-48 w-full bg-neutral-200 dark:bg-neutral-800">
        {report.imageUrl ? (
          <img
            src={report.imageUrl}
            alt="Waste Report"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-neutral-400">
            <ImageIcon className="w-8 h-8 opacity-50" />
          </div>
        )}
        
        {/* Dark overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-transparent" />
        
        {/* Status Badge */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 bg-black/50 backdrop-blur-md text-white text-xs font-semibold rounded-full border border-white/20">
          <div className={`w-2 h-2 rounded-full ${statusConfig.color} ${report.status === 'PENDING' ? 'animate-pulse' : ''}`} />
          {statusConfig.label}
        </div>
      </div>

      {/* Card Body */}
      <div className="p-5 flex flex-col flex-1 gap-4">
        {/* Header: ID & Time */}
        <div className="flex justify-between items-start">
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-1.5 text-xs font-mono font-medium text-neutral-500 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors bg-neutral-100 dark:bg-neutral-800/50 px-2 py-1 rounded-md"
          >
            {shortId}
            {copied ? <CheckCircle2 className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
          </button>
          <span className="text-xs text-neutral-400 font-medium whitespace-nowrap">
            {getRelativeTime(report.createdAt)}
          </span>
        </div>

        {/* Location / Sector */}
        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
          <h3 className="font-bold text-neutral-900 dark:text-white leading-tight">
            {report.address || "Unknown Location"}
          </h3>
        </div>

        {/* ML Chips */}
        {report.detectedItems && report.detectedItems.length > 0 ? (
          <div className="flex flex-wrap gap-2 mt-auto">
            {report.detectedItems.slice(0, 3).map((item) => (
              <span
                key={item.id}
                className="px-2.5 py-1 text-[10px] font-semibold tracking-wide uppercase bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-100 dark:border-emerald-500/20"
              >
                {item.label}
              </span>
            ))}
            {report.detectedItems.length > 3 && (
              <span className="px-2.5 py-1 text-[10px] font-semibold bg-neutral-100 dark:bg-neutral-800 text-neutral-500 rounded-full">
                +{report.detectedItems.length - 3} more
              </span>
            )}
          </div>
        ) : (
          <div className="mt-auto text-xs text-neutral-400 italic">No ML data available</div>
        )}

        <div className="h-px bg-neutral-100 dark:bg-neutral-800 w-full my-1" />

        {/* Footer: User Email */}
        <div className="text-xs text-neutral-500 truncate w-full" title={report.userEmail}>
          Reported by: <span className="font-medium text-neutral-700 dark:text-neutral-300">{report.userEmail}</span>
        </div>
      </div>
    </div>
  );
}
