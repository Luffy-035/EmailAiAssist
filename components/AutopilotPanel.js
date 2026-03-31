"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { nanoid } from "nanoid";
import { 
  Bot, 
  Plus, 
  Trash2, 
  Zap, 
  ShieldAlert, 
  ChevronRight, 
  Sparkles, 
  ListChecks, 
  Mail, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  SkipForward, 
  XCircle,
  Activity,
  ArrowRight
} from "lucide-react";
import { Switch } from "@/components/ui/switch";

// ── Shared Subcomponents ───────────────────────────────────────────────────────

function ActionBadge({ label, color, icon: Icon }) {
  const colors = {
    green: "bg-green-50 text-green-600",
    blue: "bg-blue-50 text-blue-600",
    purple: "bg-purple-50 text-purple-600",
  };
  return (
    <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${colors[color] || colors.green}`}>
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
    <div className="bg-white p-6 rounded-2xl border border-gray-100 transition-all duration-300 hover:border-[#D97757]/20 group mb-3 shadow-[0_2px_10px_-4px_rgba(0,0,0,0.02)]">
      <div className="flex items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-2">
          <StatusIcon className={`w-3.5 h-3.5 ${style.iconColor}`} />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
            {style.label}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-300 uppercase tracking-widest bg-gray-50 px-2 py-0.5 rounded-md">
          <Clock className="w-2.5 h-2.5" />
          {log.processedAt ? new Date(log.processedAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }) : "Just now"}
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h4 className="text-sm font-bold text-[#141413] tracking-tight mb-0.5">
            {log.senderName || "Unknown Sender"}
          </h4>
          <p className="text-xs font-medium text-gray-400 truncate">
            {log.emailSubject || "(No Subject)"}
          </p>
        </div>

        {log.status === "success" && (
          <div className="flex flex-wrap gap-2">
            {log.replySent && <ActionBadge label="Replied" color="green" icon={Mail} />}
            {log.eventCreated && <ActionBadge label="Event" color="blue" icon={Calendar} />}
            {log.tasksApproved && <ActionBadge label="Tasks" color="purple" icon={ListChecks} />}
          </div>
        )}

        <div className="p-4 bg-gray-50/50 rounded-xl">
          <div className="flex gap-3">
            <Zap className="w-3.5 h-3.5 text-[#D97757]/60 shrink-0 mt-0.5" />
            <div className="space-y-2 text-left">
              <p className="text-[11px] font-medium text-[#141413]/60 leading-relaxed italic">
                {log.status === "error" 
                  ? `System error: ${log.errorMessage}`
                  : log.reasoning || "Contextually relevant action determined by AI."
                }
              </p>
              {log.matchedRuleText && log.status !== "error" && (
                <div className="flex items-center gap-2 text-[#D97757]/40 uppercase tracking-widest text-[9px] font-black pt-1">
                  <ShieldAlert className="w-2.5 h-2.5" />
                  Rule Trigger: {log.matchedRuleText}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Rule Editor Subcomponent ───────────────────────────────────────────────────

function RuleEditor({ rules, onChange }) {
  const handleDelete = (id) => {
    onChange(rules.filter((r) => r.id !== id));
  };

  const handleTextChange = (id, text) => {
    onChange(rules.map((r) => (r.id === id ? { ...r, text } : r)));
  };

  const handleAdd = () => {
    onChange([...rules, { id: nanoid(), text: "" }]);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
              <ListChecks className="w-4 h-4 text-gray-400" />
           </div>
           <h3 className="text-sm font-bold text-[#141413] uppercase tracking-widest">Neural Rules</h3>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-4 py-2 bg-[#D97757] text-white rounded-lg text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          Add Logic
        </button>
      </div>

      <div className="space-y-2">
        {rules.length === 0 ? (
          <div className="py-12 bg-gray-50/30 rounded-2xl flex flex-col items-center justify-center text-center px-8 border border-gray-50">
            <p className="text-[#141413]/30 text-xs font-bold uppercase tracking-widest">No custom rules established</p>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.id} className="group flex items-center gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  value={rule.text}
                  onChange={(e) => handleTextChange(rule.id, e.target.value)}
                  placeholder='Enter rule description...'
                  className="w-full bg-gray-50/50 hover:bg-white rounded-xl px-6 py-3.5 text-xs font-bold text-[#141413] placeholder:text-gray-200 focus:outline-none focus:ring-1 focus:ring-[#D97757]/20 focus:bg-white transition-all border border-gray-100/50"
                />
              </div>
              <button
                onClick={() => handleDelete(rule.id)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ── Main Panel ────────────────────────────────────────────────────────────────

export default function AutopilotPanel({ onSettingsChange }) {
  const [enabled, setEnabled] = useState(false);
  const [rules, setRules] = useState([]);
  const [logs, setLogs] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pollRef = useRef(null);

  // Load preferences + logs
  const fetchData = useCallback(async () => {
    try {
      const [prefRes, logRes] = await Promise.all([
        fetch("/api/preferences"),
        fetch("/api/autopilot/logs")
      ]);
      const prefData = await prefRes.json();
      const logData = await logRes.json();

      setEnabled(prefData.autopilotEnabled ?? false);
      setRules(Array.isArray(prefData.rules) ? prefData.rules : []);
      setLogs(Array.isArray(logData.logs) ? logData.logs : []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Polling for logs
  useEffect(() => {
    if (pollRef.current) clearInterval(pollRef.current);
    if (enabled) {
      pollRef.current = setInterval(async () => {
        const res = await fetch("/api/autopilot/logs");
        const data = await res.json();
        setLogs(Array.isArray(data.logs) ? data.logs : []);
      }, 6000);
    }
    return () => clearInterval(pollRef.current);
  }, [enabled]);

  const savePreferences = async (newEnabled, newRules) => {
    setIsSaving(true);
    try {
      await fetch("/api/preferences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          autopilotEnabled: newEnabled,
          rules: newRules,
        }),
      });
      onSettingsChange?.(newEnabled);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggle = (val) => {
    const next = val ?? !enabled;
    setEnabled(next);
    savePreferences(next, rules);
  };

  const handleRulesUpdate = (updatedRules) => {
    setRules(updatedRules);
    savePreferences(enabled, updatedRules);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-8 h-8 rounded-full border-2 border-gray-50 border-t-[#D97757] animate-spin" />
        <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.3em]">Neural Sync...</p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-4 animate-in fade-in duration-700 pb-20">
      {/* ── Status Header ───────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between gap-6 mb-8">
           <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-all ${enabled ? "bg-[#D97757] text-white" : "bg-gray-50 text-gray-300"}`}>
                <Bot className="w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-[#141413] tracking-tight">AI Autopilot</h2>
                 <p className={`text-[10px] font-black uppercase tracking-widest ${enabled ? "text-[#D97757]" : "text-gray-300"}`}>
                   {enabled ? "Governance Live" : "Governance Standby"}
                 </p>
              </div>
           </div>
           <Switch checked={enabled} onCheckedChange={handleToggle} />
        </div>
        
        <p className="text-gray-400 font-medium text-xs leading-relaxed">
          Autonomous mode processes emails automatically based on your neural rules. The AI will reply, create events, and manage tasks independently.
        </p>

        {isSaving && (
          <div className="mt-4 flex items-center gap-2 text-[9px] font-black text-[#D97757] uppercase tracking-widest animate-pulse">
            <Zap className="w-3 h-3" />
            Synchronizing neural core...
          </div>
        )}
      </div>

      {/* ── Rule Configuration ────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
        <RuleEditor rules={rules} onChange={handleRulesUpdate} />
      </div>

      {/* ── Activity Logs ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-[0_2px_15px_-3px_rgba(0,0,0,0.02)]">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center border border-gray-100">
                <Activity className="w-4 h-4 text-gray-400" />
             </div>
             <h3 className="text-sm font-bold text-[#141413] uppercase tracking-widest">History</h3>
          </div>
          {logs.length > 0 && (
             <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">Last 50 actions</span>
          )}
        </div>

        {logs.length === 0 ? (
          <div className="text-center py-20 bg-gray-50/20 rounded-2xl border border-gray-50 border-dashed">
            <p className="text-xs font-bold text-gray-300 uppercase tracking-widest">No activities recorded</p>
          </div>
        ) : (
          <div className="space-y-4">
            {logs.slice(0, 10).map((log) => (
              <LogEntry key={log._id || log.emailId} log={log} />
            ))}
            {logs.length > 10 && (
              <button className="w-full py-4 text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 hover:text-[#D97757] transition-colors">
                 Load more history
              </button>
            )}
          </div>
        )}
      </div>
      
      {/* ── Compliance Footer ── */}
      <div className="flex items-center justify-center gap-10 text-[9px] font-bold text-gray-300 uppercase tracking-widest pt-4">
         <div className="flex items-center gap-2">
            <ShieldAlert className="w-3 h-3 text-gray-200" />
            Neural Security
         </div>
         <div className="flex items-center gap-2">
            <Sparkles className="w-3 h-3 text-gray-200" />
            ISO Verified AI
         </div>
      </div>
    </div>
  );
}
