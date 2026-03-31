import { useState, useTransition } from "react";
import { approveTasks } from "@/actions/approveTasks";
import { ListChecks, CheckCircle2, Clock, AlertTriangle, ChevronDown } from "lucide-react";

const PRIORITY_STYLES = {
  high: "bg-[#D97757]/15 text-[#D97757] font-bold",
  medium: "bg-[#D97757]/10 text-[#D97757]/80 font-bold",
  low: "bg-[#141413]/10 text-[#141413]/60 font-bold",
};

export default function TaskCard({ email, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [approved, setApproved] = useState(email.tasksApproved);
  const [isPending, startApprove] = useTransition();
  const [error, setError] = useState("");

  function handleApproveAll() {
    if (approved) return;
    startApprove(async () => {
      try {
        setError("");
        await approveTasks({
          emailId: email.emailId,
          subject: email.subject,
          tasks: email.tasks,
        });
        setApproved(true);
        if (onUpdate) onUpdate({ ...email, tasksApproved: true });
      } catch (err) {
        setError(err.message);
      }
    });
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-100/50 shadow-sm overflow-hidden transition-all duration-500">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-8 hover:bg-gray-50/50 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#D97757] flex items-center justify-center text-white shadow-lg shadow-[#D97757]/20">
            <ListChecks className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-[#141413]/30 uppercase tracking-[0.2em]">Tasks</h3>
            <p className="text-[#141413] font-black text-lg">{email.tasks?.length || 0} Identified</p>
          </div>
        </div>
        <div className={`p-2 rounded-full bg-gray-50 text-[#141413]/20 group-hover:text-[#141413] transition-all ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {isOpen && (
        <div className="p-8 pt-0 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="border-t border-gray-50 pt-8">
            <div className="space-y-4 mb-8">
              {(email.tasks || []).map((task, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 bg-gray-50/50 p-5 rounded-lg group transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-base text-[#141413] font-bold truncate">{task.title}</p>
                    {task.deadline && (
                      <div className="flex items-center gap-1.5 mt-1 text-[#141413]/40">
                        <Clock className="w-3.5 h-3.5" />
                        <span className="text-xs font-bold">{task.deadline}</span>
                      </div>
                    )}
                  </div>
                  <span
                    className={`flex-shrink-0 text-[10px] uppercase tracking-wider px-3 py-1 rounded-full ${
                      PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium
                    }`}
                  >
                    {task.priority}
                  </span>
                </div>
              ))}
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 mb-8 bg-[#141413]/10 text-[#141413] rounded-lg text-sm font-bold animate-shake">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            <div className="flex items-center justify-end mt-8">
              <button
                onClick={handleApproveAll}
                disabled={isPending || approved}
                className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-[0.98] border ${
                  approved
                    ? "bg-[#D97757]/10 text-[#D97757] border-[#D97757]/20 cursor-default"
                    : "bg-[#141413] hover:bg-[#141413]/90 text-white border-[#141413] shadow-md shadow-[#141413]/10"
                }`}
              >
                {approved ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    TASKS SAVED
                  </>
                ) : isPending ? (
                  "SAVING..."
                ) : (
                  <>
                    <ListChecks className="w-3.5 h-3.5 text-white/70" />
                    APPROVE ALL TASKS
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
