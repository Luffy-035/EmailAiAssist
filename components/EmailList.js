import { Inbox, CheckCircle2, Calendar, LayoutList, Ghost } from "lucide-react";

// Priority badge colors and labels
const PRIORITY_CONFIG = {
  high: { label: "High", className: "bg-[#D97757]/15 text-[#D97757] border-[#D97757]/20" },
  medium: { label: "Medium", className: "bg-[#D97757]/10 text-[#D97757]/80 border-[#D97757]/10" },
  low: { label: "Low", className: "bg-[#141413]/10 text-[#141413]/60 border-[#141413]/10" },
  fyi: { label: "FYI", className: "bg-gray-400 text-white" }, // Default for unknown levels
};

export function PriorityBadge({ level }) {
  const config = PRIORITY_CONFIG[level] || PRIORITY_CONFIG.fyi;
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] uppercase tracking-wider font-bold ${config.className}`}>
      {config.label}
    </span>
  );
}

export default function EmailList({ emails, selectedId, onSelect }) {
  if (emails.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-8 text-center relative z-10">
        <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-6 shadow-sm border border-gray-100">
          <Ghost className="w-8 h-8 text-gray-300" />
        </div>
        <p className="text-[#141413] font-bold text-lg mb-2">Your inbox is clear</p>
        <p className="text-gray-400 text-sm leading-relaxed max-w-[200px] mx-auto">
          No emails processed yet. Click Refresh to let AI handle your inbox.
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 pb-12 space-y-2">
      {emails.map((email) => {
        const isSelected = email.emailId === selectedId;
        return (
          <div key={email.emailId}>
            <button
              onClick={() => onSelect(email)}
              className={`w-full text-left p-5 rounded-xl transition-all duration-300 group ${
                isSelected
                  ? "bg-white scale-[1.01] shadow-sm ring-1 ring-[#D97757]/10"
                  : "bg-gray-50/50 hover:bg-white hover:shadow-sm"
              }`}
            >
              {/* Top row: sender name + priority badge */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className={`text-sm font-bold truncate ${isSelected ? "text-[#D97757]" : "text-[#141413]"}`}>
                  {email.senderName}
                </span>
                <PriorityBadge level={email.priority?.level} />
              </div>

              {/* Subject */}
               <p className={`text-sm font-medium truncate mb-2 ${isSelected ? "text-gray-800" : "text-gray-600"}`}>
                {email.subject}
              </p>

              {/* Short summary */}
               <p className={`text-xs leading-relaxed line-clamp-2 ${isSelected ? "text-gray-600" : "text-gray-400"}`}>
                {email.summary}
              </p>

              {/* Status badges */}
              <div className="flex items-center gap-2 mt-4">
                {email.replySent && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[9px] font-black uppercase tracking-widest leading-none">
                    <CheckCircle2 className="w-3 h-3" />
                    Replied
                  </span>
                )}
                {email.calendarCreated && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[9px] font-black uppercase tracking-widest leading-none">
                    <Calendar className="w-3 h-3" />
                    Scheduled
                  </span>
                )}
                 {email.tasksApproved && (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 text-violet-600 text-[9px] font-black uppercase tracking-widest leading-none">
                    <LayoutList className="w-3 h-3" />
                    Tasks
                  </span>
                )}
              </div>
            </button>
          </div>
        );
      })}
    </div>
  );
}
