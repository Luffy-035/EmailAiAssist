"use client";

import { useState, useEffect } from "react";
import { X, Clock, Zap, CheckCircle2, Mail, Calendar, ListChecks, SkipForward, XCircle, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function ActionBadge({ label, color, icon: Icon }) {
  const colors = {
    green: "bg-green-50 text-green-600 border-green-100",
    blue: "bg-blue-50 text-blue-600 border-blue-100",
    purple: "bg-purple-50 text-purple-600 border-purple-100",
  };
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${colors[color] || colors.green}`}>
      <Icon className="w-3 h-3" />
      {label}
    </span>
  );
}

function LogEntry({ log }) {
  const statusStyles = {
    success: { icon: CheckCircle2, iconColor: "text-[#D97757]", label: "Action Taken" },
    skipped: { icon: SkipForward, iconColor: "text-gray-300", label: "Skipped" },
    error: { icon: XCircle, iconColor: "text-[#141413]", label: "Error" },
  };

  const style = statusStyles[log.status] || statusStyles.success;
  const StatusIcon = style.icon;

  return (
    <div className="bg-gray-50/50 hover:bg-white p-6 rounded-xl transition-all duration-300 hover:shadow-sm group mb-2 border-none">
      {/* Top row — icon + label + time */}
      <div className="flex items-center justify-between gap-4 mb-3">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-3.5 h-3.5 ${style.iconColor}`} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            {style.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-white/50 px-2 py-0.5 rounded-md">
          <Clock className="w-2.5 h-2.5" />
          {log.processedAt ? new Date(log.processedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }) : "Just now"}
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-bold text-[#141413] tracking-tight mb-0.5">
            {log.senderName || "Unknown Sender"}
          </h4>
          <p className="text-xs font-medium text-gray-400 truncate">
            {log.emailSubject || "(No Subject)"}
          </p>
        </div>

        {/* Action badges */}
        {log.status === "success" && (
          <div className="flex flex-wrap gap-2">
            {log.replySent && <ActionBadge label="Replied" color="green" icon={Mail} />}
            {log.eventCreated && <ActionBadge label="Event" color="blue" icon={Calendar} />}
            {log.tasksApproved && <ActionBadge label="Tasks" color="purple" icon={ListChecks} />}
          </div>
        )}

        {/* AI reasoning box */}
        <div className="p-4 bg-white/80 rounded-lg border-none shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
          <div className="flex gap-3">
            <Zap className="w-3.5 h-3.5 text-[#D97757]/60 shrink-0 mt-0.5" />
            <div className="space-y-2">
              <p className="text-[11px] font-medium text-[#141413]/70 leading-relaxed italic">
                {log.status === "error" 
                  ? `System error: ${log.errorMessage}`
                  : log.reasoning || "AI context matched for optimal action."
                }
              </p>
              {log.matchedRuleText && log.status !== "error" && (
                <div className="flex items-center gap-2 text-[#D97757]/60 uppercase tracking-widest text-[9px] font-black pt-1">
                  <ShieldAlert className="w-2.5 h-2.5" />
                  Trigger: {log.matchedRuleText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LogModal({ isOpen, onClose }) {
  const [logs, setLogs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;
    setIsLoading(true);
    fetch("/api/autopilot/logs")
      .then((r) => r.json())
      .then((d) => setLogs(Array.isArray(d.logs) ? d.logs : []))
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-white/60 backdrop-blur-sm z-[100]"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-x-4 inset-y-8 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:top-24 md:bottom-24 md:w-[600px] bg-white rounded-3xl shadow-2xl shadow-[#141413]/10 z-[101] flex flex-col overflow-hidden border border-gray-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-gray-50 bg-white/80 backdrop-blur-md sticky top-0 z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Zap className="w-5 h-5 text-[#D97757]" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-[#141413] tracking-tighter">Autopilot History</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Operation Audit Logs</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-100 group"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-[#141413] transition-colors" />
              </button>
            </div>

            {/* Content area */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gray-50/10">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full gap-4">
                  <div className="w-8 h-8 border-2 border-gray-100 border-t-[#D97757] rounded-full animate-spin" />
                  <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">Syncing logs...</p>
                </div>
              ) : logs.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-8 text-center">
                  <div className="w-16 h-16 rounded-3xl bg-gray-50 flex items-center justify-center mb-6 border border-gray-100 shadow-sm">
                    <Clock className="w-8 h-8 text-gray-200" />
                  </div>
                  <p className="text-[#141413] font-black text-lg mb-2">No activity recorded</p>
                  <p className="text-gray-400 text-sm font-medium leading-relaxed max-w-xs mx-auto">
                    Autopilot hasn't taken any autonomous actions yet.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <LogEntry key={log._id} log={log} />
                  ))}
                  
                  <div className="text-center py-8">
                     <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]"> End of Logs </p>
                  </div>
                </div>
              )}
            </div>
            
             {/* Footer footer */}
            <div className="px-8 py-5 border-t border-gray-50 bg-gray-50/30">
               <p className="text-[10px] font-bold text-gray-400 leading-relaxed text-center">
                 Logs are retained for 30 days. Rules matching heuristic and manual triggers are logged here.
               </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
