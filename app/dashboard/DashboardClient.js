"use client";

import { useState, useEffect, useTransition, useMemo } from "react";
import EmailList from "@/components/EmailList";
import ActionPanel from "@/components/ActionPanel";
import LogModal from "@/components/LogModal";
import { SpringButton } from "@/components/ui/SpringButton";
import { FlickeringGrid } from "@/components/ui/FlickeringGrid";
import { RefreshCw, AlertCircle, Zap, ShieldAlert, Search, History } from "lucide-react";

export default function DashboardClient({ initialEmails }) {
  const [emails, setEmails] = useState(initialEmails);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [isRefreshing, startRefresh] = useTransition();
  const [fastApiDown, setFastApiDown] = useState(false);
  const [refreshMsg, setRefreshMsg] = useState("");
  const [maxResults, setMaxResults] = useState(20);
  const [autopilotEnabled, setAutopilotEnabled] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Filter emails based on search term
  const filteredEmails = useMemo(() => {
    if (!searchTerm.trim()) return emails;
    const term = searchTerm.toLowerCase();
    return emails.filter(
      (e) =>
        e.senderName?.toLowerCase().includes(term) ||
        e.subject?.toLowerCase().includes(term) ||
        e.summary?.toLowerCase().includes(term)
    );
  }, [emails, searchTerm]);

  // Check FastAPI health + load autopilot pref on mount
  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((d) => setFastApiDown(d.fastapi !== "ok"))
      .catch(() => setFastApiDown(true));

    fetch("/api/preferences")
      .then((r) => r.json())
      .then((d) => setAutopilotEnabled(d.autopilotEnabled ?? false))
      .catch(() => {});
  }, []);

  // Trigger the email processing pipeline, then run autopilot, then reload the list
  function handleRefresh() {
    startRefresh(async () => {
      setRefreshMsg("");
      try {
        const processRes = await fetch("/api/emails/process", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ maxResults }),
        });
        const processData = await processRes.json();
        
        // Fire autopilot
        fetch("/api/autopilot/run", { method: "POST" }).catch(() => {});

        // Reload the full email list from DB
        const listRes = await fetch("/api/emails");
        const listData = await listRes.json();
        setEmails(listData.emails || []);
        setRefreshMsg(processData.message || "Done");
      } catch (err) {
        setRefreshMsg("Error: " + err.message);
      }
    });
  }

  function handleEmailUpdate(updatedEmail) {
    setEmails((prev) =>
      prev.map((e) => (e.emailId === updatedEmail.emailId ? updatedEmail : e))
    );
    setSelectedEmail(updatedEmail);
  }

  return (
    <div className="flex flex-col h-full bg-white relative overflow-hidden">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <FlickeringGrid 
          squareSize={4}
          gridGap={6}
          color="#D97757"
          maxOpacity={0.15}
          flickerChance={0.1}
        />
      </div>

      {/* FastAPI warning banner */}
      {fastApiDown && (
        <div className="relative z-20 bg-[#141413]/10 text-[#141413] text-xs text-center py-3 px-6 font-medium flex items-center justify-center gap-2 border-b border-[#141413]/10">
          <AlertCircle className="w-4 h-4" />
          AI service (FastAPI) is not reachable. Email processing may be unavailable.
        </div>
      )}

      <div className="relative z-10 flex flex-1 overflow-hidden">
        {/* ── Left Panel: Email List ── */}
        <aside className="w-96 flex-shrink-0 flex flex-col pt-4 border-r border-[#141413]/5 bg-white/50 backdrop-blur-sm">
          {/* Header */}
          <div className="px-6 pt-4 pb-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-black text-[#141413] tracking-tighter">
                Inbox{" "}
                <span className="text-gray-400 font-bold text-sm ml-1.5 opacity-50">
                  {emails.length}
                </span>
              </h2>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsLogOpen(true)}
                  className="w-8 h-8 rounded-lg bg-gray-50 flex items-center justify-center hover:bg-gray-100 transition-colors border border-gray-100 group"
                  title="View AI Autopilot History"
                >
                  <History className="w-3.5 h-3.5 text-gray-400 group-hover:text-[#D97757] transition-colors" />
                </button>

                <select
                  value={maxResults}
                  onChange={(e) => setMaxResults(Number(e.target.value))}
                  disabled={isRefreshing}
                  className="text-[10px] bg-gray-50 text-[#141413] border border-gray-100 rounded-lg px-2 py-1.5 focus:outline-none font-bold cursor-pointer transition-all"
                >
                  {[10, 20, 50].map(v => <option key={v} value={v}>{v}</option>)}
                </select>

                <SpringButton
                  onClick={handleRefresh}
                  className="!py-1.5 !px-3 text-[10px] font-black uppercase tracking-widest"
                  icon={!isRefreshing}
                >
                  {isRefreshing ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : "Refresh"}
                </SpringButton>
              </div>
            </div>

            {/* Search Bar */}
            <div className="relative mb-4">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search emails..."
                className="w-full bg-white border border-gray-100 rounded-xl pl-11 pr-4 py-3 text-sm font-medium text-[#141413] placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-[#D97757]/5 focus:border-[#D97757]/20 transition-all shadow-sm"
              />
            </div>
            
            {/* Autopilot Indicator */}
            {autopilotEnabled && (
              <div className="flex items-center gap-2 mb-4 px-3 py-2 bg-[#D97757]/5 rounded-lg border border-[#D97757]/10 animate-in fade-in slide-in-from-top-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D97757] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#D97757]"></span>
                </span>
                <span className="text-[10px] font-black text-[#D97757] uppercase tracking-wider">
                  Autopilot ACTIVE
                </span>
              </div>
            )}
          </div>

          {/* Refresh message */}
          {refreshMsg && (
            <div className="mx-6 mb-4 px-4 py-2 rounded-lg bg-[#141413]/5 text-[10px] text-center text-[#141413]/60 font-black uppercase tracking-widest">
              {refreshMsg}
            </div>
          )}

          {/* Email list — scrollable */}
          <div className="flex-1 overflow-y-auto custom-scrollbar pt-2 pb-10">
            <EmailList
              emails={filteredEmails}
              selectedId={selectedEmail?.emailId}
              onSelect={setSelectedEmail}
            />
          </div>
        </aside>

        {/* ── Right Panel: Tabbed Action Panel ── */}
        <main className="flex-1 overflow-hidden bg-white/40 backdrop-blur-md">
          <ActionPanel
            email={selectedEmail}
            onUpdate={handleEmailUpdate}
            autopilotEnabled={autopilotEnabled}
            onAutopilotChange={setAutopilotEnabled}
          />
        </main>
      </div>

      <LogModal isOpen={isLogOpen} onClose={() => setIsLogOpen(false)} />
    </div>
  );
}
