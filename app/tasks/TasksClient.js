"use client";

import { useState, useTransition } from "react";
import { updateTaskStatus } from "@/actions/updateTaskStatus";
import { SpringButton } from "@/components/ui/SpringButton";
import { FlickeringGrid } from "@/components/ui/FlickeringGrid";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle2, Clock, Inbox, ArrowRight } from "lucide-react";

const PRIORITY_STYLES = {
  high: { bg: "bg-[#D97757]/15", text: "text-[#D97757]", border: "border-[#D97757]/20" },
  medium: { bg: "bg-[#D97757]/10", text: "text-[#D97757]/80", border: "border-[#D97757]/10" },
  low: { bg: "bg-[#141413]/10", text: "text-[#141413]/60", border: "border-[#141413]/10" },
};

function TaskRow({ task, index }) {
  const [status, setStatus] = useState(task.status);
  const [isPending, start] = useTransition();
  const style = PRIORITY_STYLES[task.priority] || PRIORITY_STYLES.medium;

  function toggleStatus() {
    const newStatus = status === "completed" ? "pending" : "completed";
    start(async () => {
      await updateTaskStatus({ taskId: task._id, status: newStatus });
      setStatus(newStatus);
    });
  }

  const isCompleted = status === "completed";

  return (
    <motion.li 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`bg-white rounded-xl px-10 py-8 flex items-start justify-between gap-6 border border-gray-100 shadow-sm transition-all ${
        isCompleted ? "opacity-60 grayscale-[0.5]" : "hover:shadow-md hover:border-[#D97757]/20"
      }`}
    >
      <div className="flex-1 min-w-0">
        {/* Task title */}
        <p className={`font-bold text-base leading-tight ${isCompleted ? "line-through text-gray-400" : "text-[#141413]"}`}>
          {task.title}
        </p>

        {/* Source email */}
        <div className="flex items-center gap-1.5 mt-2">
          <Inbox className="w-3 h-3 text-gray-400" />
          <p className="text-xs text-gray-500 truncate">
            From: <span className="text-gray-400 font-medium">{task.sourceEmailSubject || "Unknown email"}</span>
          </p>
        </div>

        {/* Deadline */}
        {task.deadline && (
          <div className="flex items-center gap-1.5 mt-1">
            <Clock className="w-3 h-3 text-[#D97757]/60" />
            <p className="text-xs text-gray-500">
              Due:{" "}
              <span className={`font-bold ${isCompleted ? "text-gray-400" : "text-[#D97757]/80"}`}>
                {task.deadline}
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="flex items-center gap-4 flex-shrink-0">
        {/* Priority badge */}
        <span className={`text-[10px] uppercase tracking-wider font-extrabold px-3 py-1 rounded-full border ${style.bg} ${style.text} ${style.border}`}>
          {task.priority}
        </span>

        {/* Mark complete / reopen button */}
        <SpringButton
          onClick={toggleStatus}
          primary={!isCompleted}
          icon={false}
          className="text-xs !py-2 !px-4"
        >
          {isPending ? "…" : isCompleted ? "Reopen" : "Complete"}
        </SpringButton>
      </div>
    </motion.li>
  );
}

export default function TasksClient({ initialTasks }) {
  const [filter, setFilter] = useState("all"); // "all" | "pending" | "completed"
  const tasks = initialTasks;

  const filtered = tasks.filter((t) => {
    if (filter === "pending") return t.status === "pending";
    if (filter === "completed") return t.status === "completed";
    return true;
  });

  const pendingCount = tasks.filter((t) => t.status === "pending").length;
  const doneCount = tasks.filter((t) => t.status === "completed").length;

  return (
    <div className="relative min-h-screen bg-white">
      {/* Background Grid */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <FlickeringGrid 
          squareSize={4}
          gridGap={6}
          color="#D97757"
          maxOpacity={0.1}
          flickerChance={0.05}
        />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-10 py-16">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-10">
          <div>
            <h1 className="text-4xl font-black text-[#141413] tracking-tight">
              Task Dashboard
            </h1>
            <p className="text-gray-500 font-medium mt-2 flex items-center gap-2">
              <span className="text-[#D97757] font-bold">{pendingCount} pending</span>
              <span className="text-gray-300">·</span>
              <span className="text-gray-400">{doneCount} completed</span>
            </p>
          </div>

          {/* Filter tabs */}
          <div className="flex p-1 bg-gray-50 rounded-xl border border-gray-100">
            {["all", "pending", "completed"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-lg text-sm font-bold transition-all duration-200 capitalize ${
                  filter === f 
                    ? "bg-white text-[#D97757] shadow-sm ring-1 ring-gray-200" 
                    : "text-gray-400 hover:text-[#141413]"
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Task list */}
        <AnimatePresence mode="popLayout">
          {filtered.length === 0 ? (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-32 bg-gray-50/50 rounded-3xl border border-dashed border-gray-200"
            >
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 shadow-sm">
                <CheckCircle2 className="w-8 h-8 text-gray-200" />
              </div>
              <p className="text-gray-600 font-bold text-lg">No tasks here yet</p>
              <p className="text-gray-400 text-sm mt-1">Approve tasks from emails in your inbox.</p>
            </motion.div>
          ) : (
            <ul className="space-y-6">
              {filtered.map((task, idx) => (
                <TaskRow key={task._id} task={task} index={idx} />
              ))}
            </ul>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
