import { useState } from "react";
import { PriorityBadge } from "./EmailList";
import { Sparkles, FileText, User, Clock, ChevronDown, ChevronUp } from "lucide-react";

// Shows AI-generated summary, priority badge, and reasons
export default function SummaryCard({ email }) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-gray-100/50 shadow-sm overflow-hidden transition-all duration-500">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-8 hover:bg-gray-50/50 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#D97757] flex items-center justify-center text-white shadow-lg shadow-[#D97757]/20">
            <Sparkles className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-[#141413]/30 uppercase tracking-[0.2em]">AI Summary</h3>
            <p className="text-[#141413] font-black text-lg">Detailed Analysis</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-[#141413]/30">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-[10px] font-bold uppercase tracking-wider">
              {new Date(email.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
          <div className={`p-2 rounded-full bg-gray-50 text-[#141413]/20 group-hover:text-[#141413] transition-all ${isOpen ? 'rotate-180' : ''}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {isOpen && (
        <div className="p-8 pt-0 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="mb-8 border-t border-gray-50 pt-8">
        <h1 className="text-2xl font-extrabold text-[#141413] tracking-tight leading-tight mb-3">
          {email.subject}
        </h1>
        <div className="flex items-center gap-2 text-sm text-[#141413]/60 bg-gray-50 px-4 py-2 rounded-lg w-fit">
          <span className="font-bold text-[#141413]/80">{email.senderName}</span>
          <span className="text-[#141413]/30">&lt;{email.senderEmail}&gt;</span>
        </div>
      </div>

      <div className="relative mb-8">
        <div className="absolute -left-4 top-0 bottom-0 w-1 bg-[#D97757]/20 rounded-full" />
        <p className="text-[#141413]/70 text-base leading-relaxed font-medium">
          {email.summary}
        </p>
      </div>

      <div className="mt-8 pt-8 border-t border-[#141413]/5">
        <div className="space-y-6">
          {email.priority?.reasons?.length > 0 && (
            <div>
              <p className="text-[10px] text-[#141413] uppercase tracking-widest font-black mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#141413]" />
                Priority Reasoning
              </p>
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {email.priority.reasons.map((reason, i) => (
                  <li key={i} className="flex items-start gap-3 text-sm text-[#141413]/70 bg-gray-50/50 p-3 rounded-lg">
                    <Sparkles className="w-4 h-4 text-[#141413]/20 mt-0.5 shrink-0" />
                    <span className="font-bold text-[#141413]/80">{reason}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {email.priority?.level && (
            <div className="flex items-center justify-between">
              <p className="text-[10px] text-[#141413]/30 uppercase tracking-widest font-black">Priority Level</p>
              <PriorityBadge level={email.priority.level} />
            </div>
          )}
        </div>
          </div>
        </div>
      )}
    </div>
  );
}
