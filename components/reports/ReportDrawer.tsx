import { X, ExternalLink, MapPin, Target, Activity, CheckCircle2, Clock, AlertTriangle } from "lucide-react";
import { ReportWithItems } from "./types";
import { useState } from "react";

interface ReportDrawerProps {
  report: ReportWithItems | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, newStatus: string) => void;
}

export function ReportDrawer({ report, isOpen, onClose, onUpdate }: ReportDrawerProps) {
  const [status, setStatus] = useState<string>(report?.status || "PENDING");
  const [notes, setNotes] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Sync state when report changes
  if (report && status !== report.status && !isSaving) {
    setStatus(report.status);
    setNotes("");
  }

  if (!isOpen || !report) return null;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch(`/api/reports/${report.id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, notes }),
      });
      if (res.ok) {
        onUpdate(report.id, status);
        onClose();
      } else {
        alert("Failed to update status.");
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40" 
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="fixed inset-y-0 right-0 w-full max-w-md bg-white dark:bg-neutral-900 shadow-2xl z-50 overflow-y-auto flex flex-col transition-transform transform translate-x-0">
        
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-neutral-100 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900/90 backdrop-blur-md">
          <h2 className="font-mono text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate pr-4">
            #{report.id}
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-neutral-500" />
          </button>
        </div>

        <div className="flex-1 p-5 space-y-8">
          
          {/* Image Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Evidence Image</h3>
            <div className="relative rounded-xl overflow-hidden bg-neutral-100 dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-800 group">
              <img 
                src={report.imageUrl} 
                alt="High-res report evidence" 
                className="w-full h-auto object-contain max-h-[300px]"
              />
              <a 
                href={report.imageUrl}
                target="_blank"
                rel="noreferrer"
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white"
              >
                <ExternalLink className="w-8 h-8 mb-2" />
                <span className="font-medium text-sm">Open Original</span>
              </a>
            </div>
          </div>

          {/* Location Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Location Data</h3>
            <div className="bg-neutral-50 dark:bg-neutral-800/50 p-4 rounded-xl border border-neutral-100 dark:border-neutral-800">
              <div className="flex items-start gap-3 mb-4">
                <MapPin className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                <div>
                  <div className="font-medium text-neutral-900 dark:text-white leading-snug">
                    {report.address || "No address provided"}
                  </div>
                  {report.latitude && report.longitude && (
                    <div className="text-xs text-neutral-400 mt-1 font-mono">
                      {report.latitude.toFixed(6)}, {report.longitude.toFixed(6)}
                    </div>
                  )}
                </div>
              </div>
              {report.latitude && report.longitude && (
                <a 
                  href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg text-sm font-medium hover:border-emerald-500 hover:text-emerald-600 transition-colors"
                >
                  <MapPin className="w-4 h-4" />
                  View on Google Maps
                </a>
              )}
            </div>
          </div>

          {/* ML Analysis Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider flex items-center justify-between">
              <span>ML Analysis</span>
              <span className="text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 px-2 py-0.5 rounded-full normal-case flex items-center gap-1">
                <Activity className="w-3 h-3" />
                {report.detectedItems?.length || 0} objects
              </span>
            </h3>
            
            <div className="space-y-2">
              {!report.detectedItems || report.detectedItems.length === 0 ? (
                <p className="text-sm text-neutral-400 italic bg-neutral-50 dark:bg-neutral-800/30 p-4 rounded-xl">No items were detected in this image.</p>
              ) : (
                report.detectedItems.map((item) => (
                  <div key={item.id} className="bg-neutral-50 dark:bg-neutral-800/50 p-3 rounded-xl border border-neutral-100 dark:border-neutral-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-500" />
                      <span className="font-medium text-sm text-neutral-800 dark:text-neutral-200 capitalize">
                        {item.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-neutral-200 dark:bg-neutral-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full" 
                          style={{ width: `${item.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-neutral-500 w-8 text-right font-mono">
                        {Math.round(item.confidence * 100)}%
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action Box */}
          <div className="space-y-4 pt-4 border-t border-neutral-100 dark:border-neutral-800">
            <h3 className="text-sm font-semibold text-neutral-500 uppercase tracking-wider">Update Status</h3>
            
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setStatus("PENDING")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                  status === "PENDING" ? "border-amber-500 bg-amber-50 dark:bg-amber-900/10 text-amber-600" : "border-neutral-100 dark:border-neutral-800 hover:border-amber-200 text-neutral-500"
                }`}
              >
                <Clock className="w-5 h-5" />
                <span className="text-xs font-semibold">Pending</span>
              </button>
              
              <button
                onClick={() => setStatus("PROCESSED")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                  status === "PROCESSED" ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/10 text-emerald-600" : "border-neutral-100 dark:border-neutral-800 hover:border-emerald-200 text-neutral-500"
                }`}
              >
                <CheckCircle2 className="w-5 h-5" />
                <span className="text-xs font-semibold">Processed</span>
              </button>
              
              <button
                onClick={() => setStatus("FAILED")}
                className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-colors ${
                  status === "FAILED" ? "border-rose-500 bg-rose-50 dark:bg-rose-900/10 text-rose-600" : "border-neutral-100 dark:border-neutral-800 hover:border-rose-200 text-neutral-500"
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
                <span className="text-xs font-semibold">Failed</span>
              </button>
            </div>

            <div>
              <label className="block text-xs font-medium text-neutral-500 mb-1">Optional Notes</label>
              <textarea 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add context for this status change..."
                className="w-full bg-neutral-50 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-xl p-3 text-sm outline-none focus:border-emerald-500 transition-colors resize-none h-24"
              />
            </div>
            
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSaving ? "Saving..." : "Save Changes"}
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
}
