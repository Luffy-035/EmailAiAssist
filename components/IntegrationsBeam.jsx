"use client";

import { useRef } from "react";
import { AnimatedBeam } from "./AnimatedBeam";
import { motion } from "motion/react";
import { 
  Mail, 
  Brain, 
  Calendar, 
  CheckSquare, 
  MessageSquare, 
  Sparkles, 
  Zap,
  MousePointer2
} from "lucide-react";

export function IntegrationsBeam() {
  const containerRef = useRef(null);

  // Refs
  const inboxRef = useRef(null);
  const readingRef = useRef(null);
  const contextRef = useRef(null);
  const hubRef = useRef(null);
  const approvalRef = useRef(null);
  const replyRef = useRef(null);
  const meetingRef = useRef(null);
  const tasksRef = useRef(null);

  const Circle = ({ nodeRef, icon: Icon, title, description, className, delay = 0 }) => (
    <motion.div
      ref={nodeRef}
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.5 }}
      className={`z-20 flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-white p-4 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:shadow-[0_20px_40px_rgba(217,119,87,0.1)] hover:-translate-y-1 ${className}`}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#D97757]/10 mb-2">
        <Icon className="h-5 w-5 text-[#D97757]" />
      </div>
      <div className="text-center">
        <div className="text-xs font-bold text-[#141413]">{title}</div>
        {description && (
          <div className="text-[10px] text-gray-500 mt-0.5 max-w-[120px] leading-tight">
            {description}
          </div>
        )}
      </div>
    </motion.div>
  );

  return (
    <div
      ref={containerRef}
      className="relative flex h-[700px] w-full items-center justify-center overflow-hidden rounded-xl bg-[#FAF9F5] p-10 border border-[#D97757]/10"
    >
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ 
        backgroundImage: `radial-gradient(#D97757 1px, transparent 1px)`, 
        backgroundSize: '24px 24px' 
      }} />

      <div className="grid grid-cols-4 gap-4 sm:gap-12 items-center justify-items-center w-full max-w-6xl z-10">
        
        {/* Column 1: Inputs */}
        <div className="flex flex-col gap-16">
          <Circle
            nodeRef={inboxRef}
            icon={Mail}
            title="Daily Emails"
            description="Scans your incoming mail for actions."
            delay={0.1}
          />
          <Circle
            nodeRef={readingRef}
            icon={Sparkles}
            title="Context AI"
            description="Reads between the lines like a human."
            delay={0.2}
          />
          <Circle
            nodeRef={contextRef}
            icon={Brain}
            title="Personality"
            description="Remembers how you usually reply."
            delay={0.3}
          />
        </div>

        {/* Column 2: Brain */}
        <div className="flex flex-col justify-center">
          <motion.div
            ref={hubRef}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 200, delay: 0.5 }}
            className="z-30 flex flex-col items-center justify-center size-32 sm:size-40 rounded-3xl bg-[#D97757] shadow-[0_0_50px_-12px_rgba(217,119,87,0.5)] border-4 border-white"
          >
            <motion.div
              animate={{
                scale: [1, 1.1, 1],
                opacity: [0.9, 1, 0.9]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Zap className="h-10 w-10 sm:h-12 sm:w-12 text-white mb-2" />
            </motion.div>
            <div className="text-[10px] sm:text-xs font-black text-white uppercase tracking-[0.2em] text-center px-2">The AI Brain</div>
          </motion.div>
        </div>

        {/* Column 3: Control */}
        <div className="flex flex-col justify-center">
          <motion.div
            ref={approvalRef}
            initial={{ scale: 0.8, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ type: "spring", stiffness: 100, delay: 0.8 }}
            className="relative z-30 flex flex-col items-center justify-center rounded-2xl border-2 border-[#D97757] bg-white p-6 shadow-xl"
          >
            <div className="absolute -top-3 px-3 py-1 bg-[#D97757] text-white text-[9px] font-bold rounded-full uppercase tracking-wider shadow-sm flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Human Check
            </div>
            <motion.div
              animate={{
                y: [0, -4, 0]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <MousePointer2 className="h-8 w-8 text-[#D97757] mb-3" />
            </motion.div>
            <div className="text-center">
              <div className="text-sm font-black text-[#141413]">In Control</div>
              <div className="text-[10px] text-gray-500 mt-1 max-w-[120px]">You scan and approve it all.</div>
            </div>
          </motion.div>
        </div>

        {/* Column 4: Outputs */}
        <div className="flex flex-col gap-16">
          <Circle
            nodeRef={replyRef}
            icon={MessageSquare}
            title="Auto-Drafts"
            description="Ready for you to hit send."
            delay={1.1}
          />
          <Circle
            nodeRef={meetingRef}
            icon={Calendar}
            title="Meetings"
            description="Books it straight to your calendar."
            delay={1.2}
          />
          <Circle
            nodeRef={tasksRef}
            icon={CheckSquare}
            title="Tasks"
            description="Never forget a follow-up item."
            delay={1.3}
          />
        </div>
      </div>

      {/* Animated Beams */}
      <AnimatedBeam containerRef={containerRef} fromRef={inboxRef} toRef={hubRef} curvature={-40} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={readingRef} toRef={hubRef} duration={3} />
      <AnimatedBeam containerRef={containerRef} fromRef={contextRef} toRef={hubRef} curvature={40} duration={3} />

      <AnimatedBeam containerRef={containerRef} fromRef={hubRef} toRef={approvalRef} duration={2.5} />

      <AnimatedBeam containerRef={containerRef} fromRef={approvalRef} toRef={replyRef} curvature={-60} duration={3} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={approvalRef} toRef={meetingRef} duration={3} reverse />
      <AnimatedBeam containerRef={containerRef} fromRef={approvalRef} toRef={tasksRef} curvature={60} duration={3} reverse />
    </div>
  );
}
