"use client";

import { useState, useEffect } from "react";
import SummaryCard from "./SummaryCard";
import ReplyCard from "./ReplyCard";
import CalendarCard from "./CalendarCard";
import TaskCard from "./TaskCard";
import AutopilotPanel from "./AutopilotPanel";
import OriginalEmailCard from "./OriginalEmailCard";
import { Bot, MailOpen, Cpu, Layout, Inbox } from "lucide-react";

export default function ActionPanel({ email, onUpdate, autopilotEnabled, onAutopilotChange }) {
  const [showAutopilot, setShowAutopilot] = useState(false);

  // Auto-switch back to Inbox Focus whenever a different email is selected
  useEffect(() => {
    if (email?.emailId) {
      setShowAutopilot(false);
    }
  }, [email?.emailId]);

  return (
    <div className="flex flex-col h-full bg-transparent text-[#141413] overflow-hidden">
      {/* ── Action Header (Pinned) ────────────────────────────────────────── */}
      <nav className="flex items-center justify-between px-10 py-6 shrink-0 border-b border-[#141413]/5 bg-white/80 backdrop-blur-sm z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#D97757]/10 flex items-center justify-center">
             <Layout className="w-4 h-4 text-[#D97757]" />
          </div>
          <h2 className="text-sm font-black uppercase tracking-[0.2em] text-[#141413]">
            {showAutopilot ? "Autopilot Control" : "Executive View"}
          </h2>
        </div>

        <div className="flex items-center gap-2">
           <button
             onClick={() => setShowAutopilot(false)}
             className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all border ${!showAutopilot ? "bg-[#141413] text-white border-[#141413] shadow-md shadow-[#141413]/20" : "text-gray-400 border-transparent hover:text-[#141413]"}`}
           >
             <Inbox className="w-3 h-3" />
             Inbox Focus
           </button>
           <button
             onClick={() => setShowAutopilot(true)}
             className={`flex items-center gap-2 px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all relative border ${showAutopilot ? "bg-[#141413] text-white border-[#141413] shadow-md shadow-[#141413]/20" : "text-gray-400 border-transparent hover:text-[#141413]"}`}
           >
             <Cpu className="w-3 h-3" />
             Autopilot
             {autopilotEnabled && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-[#D97757] animate-pulse" />
             )}
           </button>
        </div>
      </nav>

      {/* ── Main Content Area ───────────────────────────────────────────── */}
      <div className="flex-1 min-h-0 relative">
        {showAutopilot ? (
          <div className="h-full overflow-y-auto custom-scrollbar">
            <AutopilotPanel onSettingsChange={onAutopilotChange} />
          </div>
        ) : !email ? (
           <div className="flex flex-col items-center justify-center h-full text-center py-24 px-10 animate-in fade-in zoom-in duration-700 bg-gray-50/10">
             <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-8 border border-gray-100">
               <MailOpen className="w-10 h-10 text-gray-200" />
             </div>
             <p className="text-[#141413] font-black text-xl mb-3">Syncing Inbox...</p>
             <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
               Please select a conversation to start the AI analysis and see your executive actions.
             </p>
           </div>
        ) : (
          <div className="flex h-full animate-in fade-in slide-in-from-bottom-6 duration-700">
            {/* ── LEFT: Original Email (Workspace) ── */}
            <div className="w-[55%] h-full border-r border-gray-100 bg-white">
              <OriginalEmailCard email={email} />
            </div>

            {/* ── RIGHT: AI Action Feed (Independently scrollable) ── */}
            <div className="w-[45%] h-full overflow-y-auto custom-scrollbar bg-gray-50/30 p-10 space-y-8 flex flex-col items-center">
               <div className="w-full max-w-2xl space-y-6">
                 {/* 1. Summary Section */}
                 <section id="summary-section">
                    <SummaryCard email={email} />
                 </section>

                 {/* 2. Calendar Section */}
                 {email.hasMeeting && email.calendarEvent && (
                   <section id="calendar-section" className="animate-in fade-in slide-in-from-left-4 duration-500 delay-100">
                      <CalendarCard email={email} onUpdate={onUpdate} />
                   </section>
                 )}

                 {/* 3. Tasks Section */}
                 {email.hasTasks && email.tasks?.length > 0 && (
                   <section id="tasks-section" className="animate-in fade-in slide-in-from-right-4 duration-500 delay-200">
                      <TaskCard email={email} onUpdate={onUpdate} />
                   </section>
                 )}

                 {/* 4. Reply Section */}
                 <section id="reply-section" className="animate-in fade-in slide-in-from-bottom-8 duration-500 delay-300 pb-20">
                    <ReplyCard email={email} onUpdate={onUpdate} />
                 </section>
               </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
