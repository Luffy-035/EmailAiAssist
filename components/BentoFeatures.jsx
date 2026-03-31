"use client";

import { useState, useEffect } from "react";
import {
  MessageSquare,
  ShieldCheck,
  Calendar,
  CheckSquare,
  Layers,
  Lock,
  Sparkles,
  Clock,
  Zap,
  TrendingUp,
} from "lucide-react";
import { TextAnimate } from "./TextAnimate";

/* ——————————————————————————————————————————
   Shared primitives
   —————————————————————————————————————————— */

function CardShell({ children, accent = false }) {
  return (
    <div
      className={`relative h-full w-full overflow-hidden rounded-xl p-6 ${
        accent ? "bg-[#D97757]" : "bg-white border border-gray-200"
      } transition-colors`}
    >
      {children}
    </div>
  );
}

function CardHeader({ icon: Icon, title, pulse = false }) {
  return (
    <div className="flex items-center gap-3">
      <div className="p-2 rounded-lg bg-[#D97757]/10">
        <Icon className={`w-5 h-5 text-[#D97757] ${pulse ? "animate-pulse" : ""}`} />
      </div>
      <TextAnimate as="h3" by="character" animation="blurInUp" className="text-lg font-bold text-[#141413]">
        {title}
      </TextAnimate>
    </div>
  );
}

function CardDescription({ children }) {
  return <p className="text-sm text-gray-600 leading-relaxed">{children}</p>;
}

function CardContent({ children }) {
  return (
    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
      {children}
    </div>
  );
}

function StatContent({ icon: Icon, value, label }) {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center gap-3">
      <Icon className="w-12 h-12 text-white/90" />
      <div className="text-5xl font-black text-white">{value}</div>
      <div className="text-sm font-medium text-white/90">{label}</div>
    </div>
  );
}

/* ——————————————————————————————————————————
   Feature cards
   —————————————————————————————————————————— */

export function BentoReply() {
  const [isTyping, setIsTyping] = useState(false);
  const [text, setText] = useState("Hi Sarah, I've reviewed the proposal...");

  useEffect(() => {
    const interval = setInterval(() => {
      setIsTyping(true);
      setTimeout(() => {
        setText((prev) =>
          prev === "Hi Sarah, I've reviewed the proposal..."
            ? "Thanks for sending this over. I'll get back to you by EOD..."
            : "Hi Sarah, I've reviewed the proposal..."
        );
        setIsTyping(false);
      }, 600);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <CardShell>
      <div className="flex flex-col h-full gap-5">
        <CardHeader icon={MessageSquare} title="Smart Reply Drafting" />
        <CardDescription>
          AI generates context-aware replies by analyzing thread history and sender relationship.
        </CardDescription>
        <div className="flex-1" />
        <div className="space-y-3">
          <CardContent>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded-full bg-[#D97757]/20" />
              <span className="text-xs font-semibold text-[#141413]">Draft Reply</span>
              {isTyping && (
                <span className="text-xs text-gray-400 animate-pulse">typing...</span>
              )}
            </div>
            <p className="text-xs text-gray-600 leading-relaxed transition-all duration-200">
              {text}
            </p>
          </CardContent>
          <div className="flex gap-3">
            <button className="flex-1 text-xs py-2.5 px-4 rounded-lg bg-[#D97757] text-white font-semibold hover:opacity-90 transition-opacity">
              Send
            </button>
            <button className="text-xs py-2.5 px-4 rounded-lg border border-gray-200 text-[#141413] font-semibold hover:bg-gray-50 transition-colors">
              Edit
            </button>
          </div>
        </div>
      </div>
    </CardShell>
  );
}

export function BentoPriority() {
  const [priorities, setPriorities] = useState([
    { label: "Urgent", color: "bg-red-200", count: 3 },
    { label: "Action", color: "bg-blue-200", count: 7 },
    { label: "FYI", color: "bg-green-200", count: 12 },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setPriorities((prev) =>
        prev
          .map((p) => ({ ...p, count: p.count + Math.floor(Math.random() * 3) - 1 }))
          .map((p) => ({ ...p, count: Math.max(0, p.count) }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CardShell>
      <div className="flex flex-col h-full gap-5">
        <CardHeader icon={ShieldCheck} title="Priority Detection" />
        <CardDescription>
          Automatic classification with transparent reasoning for every decision.
        </CardDescription>
        <div className="flex-1" />
        <div className="space-y-3">
          {priorities.map((p, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${p.color} animate-pulse`} />
                <span className="text-sm font-semibold text-[#141413]">{p.label}</span>
              </div>
              <span className="text-sm font-bold text-[#141413] transition-all duration-300">
                {p.count}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

export function BentoCalendar() {
  const [rotation, setRotation] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 6) % 360);
    }, 100);
    return () => clearInterval(interval);
  }, []);

  return (
    <CardShell>
      <div className="flex flex-col h-full gap-5">
        <CardHeader icon={Calendar} title="Calendar Automation" />
        <CardDescription>
          Detects meeting requests and creates ready-to-confirm calendar events.
        </CardDescription>
        <div className="flex-1" />
        <CardContent>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-gray-500 uppercase">Tomorrow</span>
            <Clock
              className="w-4 h-4 text-gray-400"
              style={{
                transform: `rotate(${rotation}deg)`,
                transition: "transform 0.1s ease-in-out",
              }}
            />
          </div>
          <h4 className="text-sm font-bold text-[#141413] mb-1">Product Review Meeting</h4>
          <p className="text-xs text-gray-600 mb-4">2:00 PM – 3:00 PM</p>
          <button className="w-full text-xs py-2.5 rounded-lg bg-[#D97757] text-white font-semibold hover:opacity-90 transition-opacity">
            Add to Calendar
          </button>
        </CardContent>
      </div>
    </CardShell>
  );
}

export function BentoTasks() {
  const [tasks, setTasks] = useState([
    { text: "Review Q3 report", deadline: "Today", done: false },
    { text: "Send contract to legal", deadline: "Tomorrow", done: false },
    { text: "Update project timeline", deadline: "This week", done: true },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTasks((prev) => {
        const next = [...prev];
        const idx = Math.floor(Math.random() * next.length);
        next[idx] = { ...next[idx], done: !next[idx].done };
        return next;
      });
    }, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <CardShell>
      <div className="flex flex-col h-full gap-5">
        <CardHeader icon={CheckSquare} title="Task Extraction" />
        <CardDescription>
          Identifies actionable items and surfaces them with deadlines.
        </CardDescription>
        <div className="flex-1" />
        <div className="space-y-3">
          {tasks.map((task, i) => (
            <div
              key={i}
              className="flex items-start gap-3 bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all duration-300"
            >
              <input
                type="checkbox"
                checked={task.done}
                readOnly
                className="mt-0.5 w-4 h-4 rounded text-[#D97757] focus:ring-[#D97757] transition-all duration-200"
              />
              <div className="flex-1">
                <p
                  className={`text-xs font-semibold transition-all duration-300 ${
                    task.done ? "line-through text-gray-400" : "text-[#141413]"
                  }`}
                >
                  {task.text}
                </p>
                <span className="text-xs text-gray-500">{task.deadline}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

export function BentoOrchestration() {
  const [actions, setActions] = useState([
    { icon: MessageSquare, label: "Reply Draft", status: "Ready", color: "text-[#D97757]" },
    { icon: Calendar, label: "Meeting", status: "Pending", color: "text-[#141413]" },
    { icon: CheckSquare, label: "3 Tasks", status: "Extracted", color: "text-[#D97757]" },
  ]);

  useEffect(() => {
    const statuses = ["Ready", "Pending", "Processing", "Extracted", "Complete"];
    const interval = setInterval(() => {
      setActions((prev) =>
        prev.map((a) => ({
          ...a,
          status: statuses[Math.floor(Math.random() * statuses.length)],
        }))
      );
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <CardShell>
      <div className="flex flex-col h-full gap-5">
        <CardHeader icon={Layers} title="Multi-Action Orchestration" />
        <CardDescription>
          One email triggers multiple actions reviewed in a unified panel.
        </CardDescription>
        <div className="flex-1" />
        <div className="space-y-3">
          {actions.map((action, i) => (
            <div
              key={i}
              className="flex items-center justify-between bg-gray-50 rounded-lg p-4 border border-gray-200 transition-all duration-300"
            >
              <div className="flex items-center gap-3">
                <action.icon className="w-4 h-4 text-[#D97757]" />
                <span className="text-xs font-semibold text-[#141413]">{action.label}</span>
              </div>
              <span className={`text-xs font-bold ${action.color} transition-all duration-300`}>
                {action.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </CardShell>
  );
}

export function BentoControl() {
  return (
    <CardShell>
      <div className="flex flex-col h-full gap-5">
        <CardHeader icon={Lock} title="Human-in-the-Loop" />
        <CardDescription>
          All AI actions require explicit approval. You stay in control.
        </CardDescription>
        <div className="flex-1" />
        <CardContent>
          <div className="flex items-center gap-2 mb-3">
            <Sparkles className="w-4 h-4 text-[#D97757]" />
            <span className="text-xs font-bold text-[#141413] uppercase">AI Suggestion</span>
          </div>
          <p className="text-xs text-gray-600 mb-4">
            Ready to send reply and create calendar event?
          </p>
          <div className="flex gap-3">
            <button className="flex-1 text-xs py-2.5 rounded-lg bg-[#D97757] text-white font-semibold hover:opacity-90 transition-opacity">
              Approve All
            </button>
            <button className="text-xs py-2.5 px-4 rounded-lg border border-gray-200 text-[#141413] font-semibold hover:bg-gray-50 transition-colors">
              Review
            </button>
          </div>
        </CardContent>
      </div>
    </CardShell>
  );
}

export function BentoAIThinking() {
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    'Deadline detected: "by EOD"',
    "Sender is C-level executive",
    "Requires immediate action",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStep((prev) => (prev + 1) % steps.length);
    }, 1500);
    return () => clearInterval(interval);
  }, []);

  return (
    <CardShell>
      <div className="flex flex-col h-full gap-5">
        <CardHeader icon={Sparkles} title="AI Reasoning" pulse />
        <CardDescription>
          Transparent explanations for every decision made by the AI.
        </CardDescription>
        <div className="flex-1" />
        <CardContent>
          <div className="space-y-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`flex items-start gap-3 transition-all duration-300 ${
                  activeStep === i ? "opacity-100" : "opacity-40"
                }`}
              >
                <div
                  className={`w-1.5 h-1.5 rounded-full bg-[#D97757] mt-1.5 transition-all duration-300 ${
                    activeStep === i ? "scale-150" : "scale-100"
                  }`}
                />
                <p className="text-xs text-gray-600">{step}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-gray-200">
            <span className="text-xs font-bold text-[#D97757] animate-pulse">
              Priority: URGENT
            </span>
          </div>
        </CardContent>
      </div>
    </CardShell>
  );
}

/* ——————————————————————————————————————————
   Stat cards
   —————————————————————————————————————————— */

export function BentoStatHours() {
  return (
    <CardShell accent>
      <StatContent icon={TrendingUp} value="28h" label="Saved per month" />
    </CardShell>
  );
}

export function BentoStatControl() {
  return (
    <CardShell accent>
      <StatContent icon={Lock} value="100%" label="Human Control" />
    </CardShell>
  );
}

export function BentoNoCost() {
  return (
    <CardShell accent>
      <StatContent icon={Zap} value="Free Demo" label="No signup required" />
    </CardShell>
  );
}