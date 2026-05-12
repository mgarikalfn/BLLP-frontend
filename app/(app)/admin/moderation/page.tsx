"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  X,
  ShieldAlert,
  MessageSquare,
  Clock,
  User as UserIcon,
  History
} from "lucide-react";
import { getPendingReports, resolveReport, getModerationHistory } from "@/api/expert.api";
import { ChatReport } from "@/types/learning";
import { format } from "date-fns";

export default function AdminModerationPage() {
  const [reports, setReports] = useState<ChatReport[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ChatReport | null>(null);
  const [isResolving, setIsResolving] = useState(false);
  const [historyMessages, setHistoryMessages] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const fetchReports = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await getPendingReports();
      const payload = response.data;
      const reportsData =
        payload && typeof payload === "object" && "reports" in payload
          ? (payload as { reports?: ChatReport[] }).reports
          : payload && typeof payload === "object" && "data" in payload
            ? (payload as { data?: unknown }).data
            : payload;
      setReports(Array.isArray(reportsData) ? reportsData : []);
    } catch (err) {
      setError("Failed to fetch pending reports.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const fetchHistory = async (conversationId: string) => {
    setIsLoadingHistory(true);
    try {
      const res = await getModerationHistory(conversationId);
      setHistoryMessages(res.data || res);
    } catch (err) {
      showToast("error", "Failed to fetch chat history.");
    } finally {
      setIsLoadingHistory(false);
    }
  };

  useEffect(() => {
    if (selectedReport?.targetId?.conversationId) {
      void fetchHistory(selectedReport.targetId.conversationId);
    } else {
      setHistoryMessages([]);
    }
  }, [selectedReport]);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleResolve = async (actionTaken: "DISMISS" | "WARN" | "DELETE_MESSAGE" | "FLAG_USER") => {
    if (!selectedReport) return;
    setIsResolving(true);
    try {
      await resolveReport(selectedReport._id, { actionTaken });
      showToast("success", `Report resolved: ${actionTaken}`);
      setSelectedReport(null);
      void fetchReports();
    } catch (err) {
      showToast("error", "Failed to resolve report.");
    } finally {
      setIsResolving(false);
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      return format(new Date(dateStr), "MMM d, h:mm a");
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 shadow-inner">
            <ShieldAlert size={24} />
          </div>
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Safety & Security</p>
            <h1 className="text-2xl font-black text-slate-900">Chat Moderation</h1>
          </div>
        </div>
        <p className="mt-4 text-sm font-medium text-slate-500 max-w-2xl leading-relaxed">
          Review and resolve community reports. Maintain a safe learning environment by acting on inappropriate messages and flagging bad actors.
        </p>
      </header>

      <section className="rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="border-b border-slate-100 bg-slate-50/50 px-8 py-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-black text-slate-800">Pending Reports</h2>
            <span className="rounded-full bg-rose-100 px-2.5 py-0.5 text-[10px] font-black text-rose-600 uppercase tracking-wider">
              {reports.length} Required
            </span>
          </div>
          <button 
            onClick={() => void fetchReports()}
            className="text-[10px] font-black uppercase tracking-widest text-indigo-600 hover:text-indigo-700 transition"
          >
            Refresh Queue
          </button>
        </div>

        {error && (
          <div className="border-b border-rose-100 bg-rose-50/60 px-8 py-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-rose-600">
              {error}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
            <p className="text-sm font-black uppercase tracking-widest text-slate-400">Loading Queue...</p>
          </div>
        ) : reports.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-4 rounded-full bg-emerald-50 p-6 text-emerald-500">
              <CheckCircle2 size={48} />
            </div>
            <h3 className="text-xl font-black text-slate-800">All Clear!</h3>
            <p className="text-sm font-medium text-slate-400 mt-1">No pending chat reports at this time.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50/50 text-[10px] font-black uppercase tracking-[0.15em] text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="px-8 py-4">Reported Content</th>
                  <th className="px-8 py-4">Reason</th>
                  <th className="px-8 py-4">Reporter</th>
                  <th className="px-8 py-4">Offender</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reports.map((report) => (
                  <tr key={report._id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="px-8 py-6 max-w-md">
                      <div className="flex items-start gap-3">
                        <div className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.4)]" />
                        <p className="text-sm font-bold text-slate-700 leading-relaxed italic">
                          "{report.context || report.targetId?.text || "Media Content"}"
                        </p>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <span className="rounded-lg bg-rose-50 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-rose-600">
                        {report.reason}
                      </span>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-slate-400">Reporter</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-slate-600 uppercase tracking-wider truncate max-w-[100px]">
                            {report.reporterId?.username || "User"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                      <div className="flex flex-col gap-1">
                        <span className="text-[10px] font-black uppercase text-rose-400">Offender</span>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-black text-rose-600 uppercase tracking-wider truncate max-w-[100px]">
                            {report.reportedUserId?.username || "Offender"}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 text-right">
                      <button 
                        onClick={() => setSelectedReport(report)}
                        className="rounded-xl bg-slate-900 px-5 py-2.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-slate-900/10 transition hover:scale-105 active:scale-95"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Resolution Modal */}
      {selectedReport && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
          <div className="w-full max-w-lg overflow-hidden rounded-[2.5rem] bg-white shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex items-center justify-between border-b border-slate-100 bg-slate-50/50 px-8 py-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-rose-50 text-rose-600">
                  <AlertTriangle size={22} />
                </div>
                <div>
                  <h3 className="text-lg font-black uppercase tracking-wider text-slate-900">Moderate Report</h3>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Action required</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedReport(null)} 
                className="group rounded-full p-2 text-slate-300 transition hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Reported Content</h4>
                  <button 
                    onClick={() => selectedReport?.targetId?.conversationId && fetchHistory(selectedReport.targetId.conversationId)}
                    className="flex items-center gap-1.5 text-[10px] font-black uppercase text-indigo-500 hover:text-indigo-600 transition"
                  >
                    <History size={12} />
                    Refresh History
                  </button>
                </div>
                <div className="group relative rounded-3xl border-2 border-rose-100 bg-rose-50/20 p-6 transition hover:border-rose-200">
                   <p className="text-sm font-bold text-slate-800 leading-relaxed italic">
                     "{selectedReport.context || selectedReport.targetId?.text}"
                   </p>
                   <div className="mt-4 flex items-center justify-between border-t border-rose-100 pt-4">
                     <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-500 uppercase">
                       <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                       Reason: {selectedReport.reason}
                     </span>
                     <span className="text-[10px] font-black text-slate-400 uppercase">{formatDate(selectedReport.createdAt)}</span>
                   </div>
                </div>
              </div>

              {/* Chat History View */}
              <div className="space-y-3">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Contextual History</h4>
                <div className="max-h-[300px] overflow-y-auto rounded-3xl border-2 border-slate-100 bg-slate-50/30 p-4 space-y-3 custom-scrollbar">
                  {isLoadingHistory ? (
                    <div className="flex flex-col items-center justify-center py-8 gap-2">
                       <Loader2 className="h-6 w-6 animate-spin text-slate-300" />
                       <span className="text-[9px] font-black uppercase tracking-widest text-slate-300">Loading History...</span>
                    </div>
                  ) : historyMessages.length === 0 ? (
                    <div className="text-center py-8">
                       <p className="text-[10px] font-bold text-slate-400 uppercase">No history available</p>
                    </div>
                  ) : (
                    historyMessages.map((msg, i) => {
                      const isOffender = msg.senderId?._id === selectedReport.reportedUserId?._id;
                      const isReportedMessage = msg._id === selectedReport.targetId?._id;
                      
                      return (
                        <div 
                          key={msg._id || i} 
                          className={`flex flex-col gap-1 ${isReportedMessage ? 'rounded-2xl bg-rose-50 p-3 ring-2 ring-rose-200 ring-offset-2' : ''}`}
                        >
                          <div className="flex items-center gap-2">
                             <span className={`text-[9px] font-black uppercase tracking-wider ${isOffender ? 'text-rose-500' : 'text-indigo-500'}`}>
                               {msg.senderId?.username || "Unknown"}
                             </span>
                             <span className="text-[8px] font-bold text-slate-300 uppercase">{formatDate(msg.createdAt)}</span>
                             {isReportedMessage && (
                               <span className="rounded-full bg-rose-500 px-1.5 py-0.5 text-[7px] font-black uppercase text-white">Reported</span>
                             )}
                          </div>
                          <p className={`text-xs font-medium leading-relaxed ${isReportedMessage ? 'text-rose-900' : 'text-slate-600'}`}>
                            {msg.text}
                          </p>
                        </div>
                      );
                    })
                  )}
                </div>
                <p className="text-[9px] font-bold text-slate-400 text-center uppercase tracking-widest italic">
                  Showing last 50 messages for context
                </p>
              </div>

              <div className="space-y-4">
                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Select Resolution</h4>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "DISMISS", label: "Ignore", emoji: "👍", color: "slate" },
                    { id: "WARN", label: "Warn", emoji: "🔔", color: "amber" },
                    { id: "DELETE_MESSAGE", label: "Delete", emoji: "✂️", color: "rose" },
                    { id: "FLAG_USER", label: "Flag", emoji: "🚩", color: "indigo" },
                    { id: "BAN_USER", label: "Ban", emoji: "🚫", color: "rose" },
                  ].map((act) => (
                    <button 
                      key={act.id}
                      onClick={() => handleResolve(act.id as any)}
                      disabled={isResolving}
                      className={`flex flex-col items-center gap-2 rounded-3xl border-2 border-slate-50 bg-white p-4 transition-all duration-300 hover:border-${act.color}-200 hover:bg-${act.color}-50/50 hover:shadow-lg group active:scale-95 ${act.id === 'BAN_USER' ? 'border-rose-100 bg-rose-50/20' : ''}`}
                    >
                      <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-300 transform group-hover:scale-110">
                        {act.emoji}
                      </span>
                      <span className={`text-[9px] font-black uppercase tracking-widest text-slate-500 group-hover:text-${act.color}-600`}>
                        {act.label}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Offender Context */}
              <div className="rounded-3xl bg-slate-50 p-6 space-y-3">
                <div className="flex items-center justify-between">
                   <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Offender Details</h4>

                </div>
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-slate-400 shadow-sm">
                    <UserIcon size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-700">{selectedReport.reportedUserId?.username}</p>
                    <p className="text-[10px] font-bold text-slate-400">{selectedReport.reportedUserId?.email}</p>
                  </div>
                </div>
              </div>
              </div>

            {isResolving && (
              <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/70 backdrop-blur-sm">
                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="h-10 w-10 animate-spin text-indigo-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Processing...</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[100] flex items-center gap-3 rounded-3xl px-8 py-5 shadow-2xl transition-all duration-500 animate-in slide-in-from-right-10 ${
          toast.type === "success" 
            ? "bg-slate-900 text-white" 
            : "bg-rose-600 text-white"
        }`}>
          {toast.type === "success" ? (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle2 size={20} />
            </div>
          ) : (
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white/20 text-white">
              <XCircle size={20} />
            </div>
          )}
          <span className="text-sm font-black uppercase tracking-wider">{toast.message}</span>
        </div>
      )}
    </div>
  );
}
