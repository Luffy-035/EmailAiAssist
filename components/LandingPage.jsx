"use client";

import React, { useEffect, useRef, useState } from 'react';
import {
  Bot, Zap, Calendar, CheckSquare, MessageSquare, ShieldCheck,
  ArrowRight, Mail, Layers, Lock, Clock, RefreshCw, Inbox,
  AlertCircle, Send, Edit3, ThumbsUp, ThumbsDown,
  ChevronDown, Sparkles, Brain, Filter, Users, Star,
  TrendingUp, Database
} from 'lucide-react';
import { IntegrationsBeam } from './IntegrationsBeam';
import { TextAnimate } from './TextAnimate';
import { SmoothCursor } from './SmoothCursor';
import {
  BentoReply,
  BentoPriority,
  BentoCalendar,
  BentoTasks,
  BentoOrchestration,
  BentoControl,
  BentoStatHours,
  BentoStatControl,
  BentoAIThinking,
  BentoNoCost,
} from './BentoFeatures';
import { Highlighter } from './ui/Highlighter';
import { FlickeringGrid } from './ui/FlickeringGrid';
import { SpringButton } from '@/components/ui/SpringButton'; // Updated import path
import { motion } from 'framer-motion';

const C = '#D97757'; // primary color (coral/orange)
const CL = 'white'; // very light tint for backgrounds
const DARK = '#141413'; // dark contrast color for headings and text

/* ─── Floating animated email cards in hero ─── */
function FloatingEmail({ style, priority, subject, from, delay }) {
  const badges = {
    urgent: { bg: '#fecaca', text: '#991b1b' },
    action: { bg: '#bfdbfe', text: '#1e40af' },
    fyi: { bg: '#bbf7d0', text: '#166534' },
  };
  const labels = { urgent: 'Urgent', action: 'Action', fyi: 'FYI' };

  return (
    <div
      className="absolute bg-white shadow-lg p-3 w-56 rounded-lg"
      style={{ ...style, animation: `floatY 6s ease-in-out ${delay} infinite alternate` }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[10px] truncate text-[#D97757]">{from}</span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded"
          style={{ background: badges[priority].bg, color: badges[priority].text }}
        >
          {labels[priority]}
        </span>
      </div>
      <p className="text-xs font-semibold truncate" style={{ color: C }}>{subject}</p>
      <div className="mt-2 space-y-1">
        <div className="h-1.5 rounded bg-white" />
        <div className="h-1.5 rounded w-3/4 bg-white" />
      </div>
    </div>
  );
}

/* ─── Animated pipeline node ─── */
function PipelineNode({ icon, label, shade, delay }) {
  return (
    <div className="flex flex-col items-center gap-2" style={{ animation: `fadeSlideUp 0.6s ease-out ${delay} both` }}>
      <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ background: shade }}>
        {icon}
      </div>
      <span className="text-[10px] font-bold tracking-widest uppercase text-[#D97757]">{label}</span>
    </div>
  );
}

/* ─── Animated connector arrow ─── */
function PipelineArrow({ delay }) {
  return (
    <div className="hidden md:flex items-center" style={{ animation: `fadeIn 0.4s ease-out ${delay} both` }}>
      <div className="w-8 h-0.5 bg-[#D97757]" />
      <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[8px] border-l-[#D97757]" />
    </div>
  );
}

/* ─── Feature card ─── */
function FeatureCard({ icon, title, badge, description, flow }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="relative rounded-lg bg-white overflow-hidden transition-all duration-300"
      style={{ boxShadow: hovered ? `0 8px 32px ${C}15` : '0 2px 8px rgba(0,0,0,0.08)', transform: hovered ? 'translateY(-2px)' : 'none' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="h-1 w-full transition-all duration-300" style={{ background: hovered ? C : '#f3f4f6' }} />
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-lg flex items-center justify-center bg-white">
            {icon}
          </div>
          <span className="text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider bg-white" style={{ color: C }}>
            {badge}
          </span>
        </div>
        <h3 className="text-base font-bold mb-2 text-[#141413]">{title}</h3>
        <p className="text-sm mb-5 leading-relaxed text-gray-600">{description}</p>
        <div className="space-y-2.5">
          {flow.map((f, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="mt-0.5 w-5 h-5 rounded flex items-center justify-center shrink-0" style={{ background: C }}>
                <span className="text-white text-[9px] font-black">{i + 1}</span>
              </div>
              <div>
                <span className="text-xs font-bold text-[#141413]">{f.step}</span>
                <p className="text-xs text-gray-600">{f.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Animated stat counter ─── */
function AnimatedStat({ value, label, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const started = useRef(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !started.current) {
        started.current = true;
        let start = 0;
        const step = value / 50;
        const timer = setInterval(() => {
          start += step;
          if (start >= value) { setCount(value); clearInterval(timer); }
          else setCount(Math.floor(start));
        }, 30);
      }
    }, { threshold: 0.5 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value]);

  return (
    <div ref={ref} className="text-center">
      <div className="text-4xl md:text-5xl font-black mb-1" style={{ color: C }}>
        {count}{suffix}
      </div>
      <div className="text-sm font-medium text-[#141413]">{label}</div>
    </div>
  );
}

/* ─── Typewriter text ─── */
function Typewriter({ texts }) {
  const [textIdx, setTextIdx] = useState(0);
  const [charIdx, setCharIdx] = useState(0);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const current = texts[textIdx];
    const timeout = setTimeout(() => {
      if (!deleting && charIdx < current.length) {
        setCharIdx(c => c + 1);
      } else if (!deleting && charIdx === current.length) {
        setTimeout(() => setDeleting(true), 1800);
      } else if (deleting && charIdx > 0) {
        setCharIdx(c => c - 1);
      } else if (deleting && charIdx === 0) {
        setDeleting(false);
        setTextIdx(i => (i + 1) % texts.length);
      }
    }, deleting ? 40 : 70);
    return () => clearTimeout(timeout);
  }, [charIdx, deleting, textIdx, texts]);

  return (
    <span className="font-semibold" style={{ color: C }}>
      {texts[textIdx].slice(0, charIdx)}
      <span className="animate-pulse">|</span>
    </span>
  );
}

/* ─── Scroll-reveal wrapper ─── */
function Reveal({ children, delay = '0s', className = '' }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(28px)',
        transition: `opacity 0.7s ease ${delay}, transform 0.7s ease ${delay}`,
      }}
    >
      {children}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN LANDING PAGE
══════════════════════════════════════════════ */
export function LandingPage({ onStart }) {
  return (
    <div className="min-h-screen font-sans overflow-x-hidden bg-white text-[#D97757] cursor-none">
      <SmoothCursor />
      <style>{`
        @keyframes floatY {
          from { transform: translateY(0px) rotate(-1deg); }
          to   { transform: translateY(-16px) rotate(1deg); }
        }
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }
        @keyframes spinSlow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @keyframes pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.4; }
          100% { transform: scale(2.0); opacity: 0; }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        .animate-spin-slow { animation: spinSlow 20s linear infinite; }
        .animate-spin-slow-reverse { animation: spinSlow 14s linear infinite reverse; }
        .animate-pulse-ring { animation: pulse-ring 2.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite; }
        .animate-bounce-slow { animation: bounce-slow 3s ease-in-out infinite; }
      `}</style>

      {/* ── Navigation ── */}
      <nav className="flex items-center justify-between px-4 sm:px-6 py-4 bg-white sticky top-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <div className="p-2 rounded-lg" style={{ background: C }}>
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-white" style={{ background: C }} />
          </div>
          <span className="text-base sm:text-lg font-black text-[#141413]">
            Email<span style={{ color: C }}>Assist</span>
          </span>
        </div>
        <div className="hidden lg:flex items-center gap-8 text-sm font-medium text-[#141413]">
          <a href="#problem" className="hover:opacity-70 transition-opacity">Problem</a>
          <a href="#pipeline" className="hover:opacity-70 transition-opacity">Pipeline</a>
          <a href="#features" className="hover:opacity-70 transition-opacity">Features</a>
          <a href="#flow" className="hover:opacity-70 transition-opacity">Flow</a>
        </div>
        <SpringButton
          onClick={onStart}
          className="text-xs sm:text-sm !py-2 !px-4"
        >
          Launch
        </SpringButton>
      </nav>

      {/* ══ HERO ══ */}
      <header className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden px-4 sm:px-6 py-16 sm:py-24 bg-white">
        {/* Background Flickering Grid */}
        <FlickeringGrid
          className="absolute inset-0 z-0 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]"
          squareSize={4}
          gridGap={6}
          color={C}
          maxOpacity={0.15}
          flickerChance={0.1}
        />

        {/* Floating orbit rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[560px] h-[400px] sm:h-[560px] rounded-full animate-spin-slow pointer-events-none " />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[380px] h-[280px] sm:h-[380px] rounded-full animate-spin-slow-reverse pointer-events-none " />

        {/* Floating email cards - hidden on mobile */}
        <div className="absolute inset-0 pointer-events-none hidden md:block">
          <FloatingEmail style={{ top: '18%', left: '4%' }} priority="urgent" subject="URGENT: Q3 Report Due Today" from="cfo@company.com" delay="0s" />
          <FloatingEmail style={{ top: '55%', left: '2%' }} priority="action" subject="Meeting Request: Product Review" from="pm@client.com" delay="1.2s" />
          <FloatingEmail style={{ top: '22%', right: '4%' }} priority="action" subject="Contract Approval Needed" from="legal@partner.com" delay="0.6s" />
          <FloatingEmail style={{ top: '58%', right: '3%' }} priority="fyi" subject="Weekly Newsletter: Tech Digest" from="news@techdigest.io" delay="1.8s" />
          <FloatingEmail style={{ top: '80%', left: '18%' }} priority="urgent" subject="Server Down — Immediate Action" from="alerts@devops.io" delay="2.4s" />
        </div>

        <div className="relative z-10 text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2.5 px-3 sm:px-4 py-1.5 rounded-lg text-[10px] sm:text-xs font-bold tracking-widest uppercase mb-8 sm:mb-10 bg-white shadow-sm"
            style={{ color: C, animation: 'fadeSlideUp 0.6s ease-out 0s both' }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: C }} />
              <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: C }} />
            </span>
            <Highlighter action="highlight" color="#D9775720" iterations={1} padding={2}>
              Action-Oriented Inbox System · AI-Powered
            </Highlighter>
          </div>

          <div
            className="flex flex-col items-center text-4xl sm:text-5xl md:text-7xl font-black tracking-tight mb-4 sm:mb-6 leading-[0.9]"
            style={{ animation: 'fadeSlideUp 0.6s ease-out 0.15s both' }}
          >
            <TextAnimate as="span" by="character" animation="blurInUp" className="text-[#141413]">
              Agentic AI
            </TextAnimate>
            <TextAnimate as="span" by="character" animation="blurInUp" className="text-[#D97757]" style={{ delay: 0.2 }}>
              Email Assistant
            </TextAnimate>
          </div>

          <p
            className="text-lg sm:text-xl md:text-2xl mb-3 sm:mb-4 font-light text-[#141413] px-4"
            style={{ animation: 'fadeSlideUp 0.6s ease-out 0.3s both' }}
          >
            Stop reading emails.{' '}
            <span className="font-semibold" style={{ color: C }}>
              Start{' '}
              <Highlighter action="highlight" color="#D9775730" iterations={3} padding={4} delay={800}>
                executing actions.
              </Highlighter>
            </span>
          </p>

          <div
            className="text-base sm:text-lg md:text-xl mb-8 sm:mb-12 h-8 px-4"
            style={{ animation: 'fadeSlideUp 0.6s ease-out 0.45s both' }}
          >
            <Typewriter texts={[
              'Auto-draft context-aware replies',
              'Extract tasks with deadlines',
              'Schedule meetings instantly',
              'Prioritize what truly matters',
              'Orchestrate multi-step actions',
            ]} />
          </div>

          <div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 px-4"
            style={{ animation: 'fadeSlideUp 0.6s ease-out 0.6s both' }}
          >
            <SpringButton
              onClick={onStart}
              className="w-full sm:w-auto px-8 py-4 text-lg"
            >
              Get Started
            </SpringButton>
            <a
              href="#problem"
              className="w-full sm:w-auto px-8 py-4 bg-white rounded-lg font-bold text-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-1 flex items-center justify-center gap-2 text-[#D97757] border border-[#D97757]/20"
            >
              Explore Features <ChevronDown className="w-4 h-4 animate-bounce-slow" />
            </a>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#141413]">
          <span className="text-xs tracking-widest uppercase">Scroll</span>
          <ChevronDown className="w-4 h-4 animate-bounce" />
        </div>
      </header>

      {/* ══ STATS ══ */}
      <section className="py-12 sm:py-16 bg-white border-t border-[#D97757]/10">
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-10">
            <AnimatedStat value={28} label="Hours saved per month" suffix="h" />
            <AnimatedStat value={6} label="Core AI features" />
            <AnimatedStat value={3} label="Action types per email" />
            <AnimatedStat value={100} label="Human control retained" suffix="%" />
          </div>
        </div>
      </section>

      {/* ══ PROBLEM & SOLUTION ══ */}
      <section id="problem" className="py-16 sm:py-28 relative overflow-hidden bg-white border-t border-[#D97757]/10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <Reveal className="text-center mb-12 sm:mb-20">
            <span className="text-xs font-bold uppercase tracking-widest mb-3 block text-[#D97757]">Why This Exists</span>
            <TextAnimate as="h2" by="character" animation="blurInUp" className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-[#141413]">
            Problem & Solution
          </TextAnimate>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#141413] px-4">
              Understanding the root cause and how this system addresses it comprehensively.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 gap-6 sm:gap-8">
            {/* Problem */}
            <Reveal delay="0.1s">
              <div className="h-full rounded-lg bg-white p-6 sm:p-8 ">
                <div className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest mb-6 px-3 py-1.5 rounded-lg bg-[#D97757]/10" style={{ color: C }}>
                  <AlertCircle className="w-4 h-4" /> The Problem
                </div>
                <TextAnimate as="h3" by="character" animation="blurInUp" className="text-xl sm:text-2xl font-black mb-4 text-[#141413]">
            Cognitive Overload & Wasted Time
          </TextAnimate>
                <p className="leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base text-[#141413]">
                  Modern professionals spend{' '}
                  <Highlighter action="underline" color={C} strokeWidth={2} delay={200}>
                    <strong style={{ color: C }}>2–3 hours daily</strong>
                  </Highlighter>{' '}
                  managing emails—reading long threads,
                  identifying required actions, replying, scheduling meetings, and tracking tasks.
                  Existing solutions provide basic categorization or summarization, but{' '}
                  <strong style={{ color: C }}>they never take initiative or prepare executable outcomes.</strong>
                </p>

                <div className="space-y-3">
                  {[
                    { icon: <Brain className="w-4 h-4" />, title: 'Cognitive Overload', desc: 'Too much unstructured information to process manually every day.' },
                    { icon: <Clock className="w-4 h-4" />, title: 'Repetitive Decisions', desc: 'Time wasted composing standard replies and scheduling routine meetings.' },
                    { icon: <AlertCircle className="w-4 h-4" />, title: 'Missed Critical Actions', desc: 'Important tasks buried deep inside long email threads go unnoticed.' },
                    { icon: <Filter className="w-4 h-4" />, title: 'No Intelligent Filtering', desc: 'Important emails sit alongside newsletters and promotional clutter.' },
                  ].map((p, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-3 p-3 rounded-lg "
                    >
                      <div className="mt-0.5 p-1.5 rounded-lg text-white shrink-0" style={{ background: C }}>{p.icon}</div>
                      <div>
                        <p className="text-sm font-bold text-[#141413]">{p.title}</p>
                        <p className="text-xs mt-0.5 text-gray-600">{p.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>

            {/* Solution */}
            <Reveal delay="0.2s">
              <div className="h-full rounded-lg bg-white p-6 sm:p-8 ">
                <div className="inline-flex items-center gap-2 font-black text-xs uppercase tracking-widest mb-6 px-3 py-1.5 rounded-lg text-white" style={{ background: C }}>
                  <Sparkles className="w-4 h-4" /> The Solution
                </div>
                <TextAnimate as="h3" by="character" animation="blurInUp" className="text-xl sm:text-2xl font-black mb-4 text-[#141413]">
            Action-Oriented AI Workflow
          </TextAnimate>
                <p className="leading-relaxed mb-6 sm:mb-8 text-sm sm:text-base text-[#141413]">
                  A web-based AI-powered email assistant that transforms incoming emails into{' '}
                  <Highlighter action="underline" color={C} padding={4} delay={300} strokeWidth={2}>
                    <strong style={{ color: C }}>structured, actionable workflows</strong>
                  </Highlighter>
                  —generating replies, calendar events,
                  and tasks, then presenting them for user approval and execution.
                </p>

                <div className="relative space-y-0">
                  {[
                    { icon: <Mail className="w-4 h-4" />, title: 'Read & Understand', desc: 'AI parses email content, thread context, and sender intent.' },
                    { icon: <Brain className="w-4 h-4" />, title: 'Extract & Analyze', desc: 'Identify priority, deadlines, participants, and required actions.' },
                    { icon: <Layers className="w-4 h-4" />, title: 'Generate Action Objects', desc: 'Create reply drafts, calendar events, and task lists automatically.' },
                    { icon: <CheckSquare className="w-4 h-4" />, title: 'User Approves & Executes', desc: 'One-click approval with full edit control before execution.' },
                  ].map((s, i) => (
                    <div key={i} className="flex gap-4 relative">
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0 z-10" style={{ background: C }}>
                          {s.icon}
                        </div>
                        {i < 3 && <div className="w-0.5 h-full mt-1 bg-[#D97757]" />}
                      </div>
                      <div className="pb-6">
                        <p className="text-sm font-bold mb-0.5 text-[#141413]">{s.title}</p>
                        <p className="text-xs text-gray-600">{s.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ PIPELINE ══ */}
      <section id="pipeline" className="py-16 sm:py-24 bg-white border-t border-[#D97757]/10 relative overflow-hidden">
        {/* Animated rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] sm:w-[500px] h-[400px] sm:h-[500px] rounded-full animate-spin-slow pointer-events-none " />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[280px] sm:w-[340px] h-[280px] sm:h-[340px] rounded-full animate-spin-slow-reverse pointer-events-none " />

        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <Reveal className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest mb-3 block text-[#D97757]">Core Architecture</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-[#141413]">
              <TextAnimate as="span" by="character" animation="blurInUp">The </TextAnimate>
              <Highlighter action="highlight" color="#D9775730" padding={4} delay={400}>
                Unified Pipeline
              </Highlighter>
            </h2>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#141413] px-4">
              Every email flows through a deterministic AI pipeline that transforms raw content into executable outcomes.
            </p>
          </Reveal>

          {/* Pipeline nodes */}
          <div className="flex flex-col md:flex-row items-center justify-center gap-3 md:gap-2 max-w-5xl mx-auto mb-16">
            <PipelineNode icon={<Inbox className="w-5 h-5 sm:w-6 sm:h-6 text-white" />} label="Email In" shade="#D97757" delay="0.1s" />
            <PipelineArrow delay="0.2s" />
            <PipelineNode icon={<Filter className="w-5 h-5 sm:w-6 sm:h-6 text-white" />} label="Filter" shade="#D97757" delay="0.3s" />
            <PipelineArrow delay="0.4s" />
            <PipelineNode icon={<Brain className="w-5 h-5 sm:w-6 sm:h-6 text-white" />} label="AI Analyze" shade={C} delay="0.5s" />
            <PipelineArrow delay="0.6s" />
            <PipelineNode icon={<Layers className="w-5 h-5 sm:w-6 sm:h-6 text-white" />} label="Actions" shade="#D97757" delay="0.7s" />
            <PipelineArrow delay="0.8s" />
            <PipelineNode icon={<ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6 text-white" />} label="Approval" shade="#D97757" delay="0.9s" />
            <PipelineArrow delay="1.0s" />
            <PipelineNode icon={<Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />} label="Execute" shade="#D97757" delay="1.1s" />
          </div>
        </div>
      </section>

      {/* ══ PROCESSING STRATEGY ══ */}
      <section id="process" className="py-16 sm:py-28 relative overflow-hidden bg-white border-t border-[#D97757]/10">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10">
          <Reveal className="text-center mb-12 sm:mb-20">
            <span className="text-xs font-bold uppercase tracking-widest mb-3 block text-[#D97757]">Under the Hood</span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-[#141413]">
              <TextAnimate as="span" by="character" animation="blurInUp">Email </TextAnimate>
              <Highlighter action="underline" color={C} delay={500} strokeWidth={3}>
                Processing Strategy
              </Highlighter>
            </h2>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#141413] px-4">
              Smart decisions about <em>which</em> emails to process and <em>how</em> to do it efficiently at scale.
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: <Filter className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: C }} />,
                title: 'Relevance Filtering',
                points: [
                  'Process only recent emails (last 24 hours)',
                  'Focus on unread and starred messages',
                  'Automatically skip promotions & social tabs',
                  'Filter newsletters, auto-replies, and CC spam',
                ],
              },
              {
                icon: <Database className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: C }} />,
                title: 'Batch Processing',
                points: [
                  'Process 5–10 emails per API batch call',
                  'Reduces LLM token usage by ~60%',
                  'Parallel processing for faster results',
                  'Queue management for large inboxes',
                ],
              },
              {
                icon: <RefreshCw className="w-5 h-5 sm:w-6 sm:h-6" style={{ color: C }} />,
                title: 'Smart Caching',
                points: [
                  'Track processed email IDs in MongoDB',
                  'Never reprocess an already-analyzed email',
                  'Cache AI results for 24-hour sessions',
                  'Incremental sync: fetch only new emails',
                ],
              },
            ].map((s, i) => (
              <Reveal key={i} delay={`${0.1 * i}s`}>
                <div className="h-full rounded-lg bg-[#FAF9F5] p-6 sm:p-7 ">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-lg flex items-center justify-center mb-4 sm:mb-5 bg-[#D97757]/10">{s.icon}</div>
                  <h3 className="text-base sm:text-lg font-black mb-3 sm:mb-4 text-[#141413]">{s.title}</h3>
                  <ul className="space-y-2.5">
                    {s.points.map((p, pi) => (
                      <li key={pi} className="flex items-start gap-2.5 text-xs sm:text-sm text-[#141413]">
                        <div className="mt-2 w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C }} />
                        {p}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ══ FEATURES - BENTO GRID ══ */}
      <section id="features" className="py-28 relative overflow-hidden bg-white border-t border-[#D97757]/10">
        <div className="container mx-auto px-6 max-w-7xl">
          <Reveal className="text-center mb-16">
            <span className="text-xs font-bold uppercase tracking-widest mb-3 block text-[#D97757]">Capabilities</span>
            <TextAnimate as="h2" by="character" animation="blurInUp" className="text-4xl md:text-5xl font-black mb-4 text-[#141413]">
            Key Features
          </TextAnimate>
            <p className="max-w-2xl mx-auto text-lg text-[#141413]">
              Interactive feature showcase — see how each capability transforms your email workflow.
            </p>
          </Reveal>

          {/* Bento Grid Layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 auto-rows-[280px]">
            {/* Row 1 */}
            <Reveal delay="0.1s" className="lg:col-span-2">
              <BentoReply />
            </Reveal>
            <Reveal delay="0.15s">
              <BentoPriority />
            </Reveal>
            <Reveal delay="0.2s">
              <BentoStatHours />
            </Reveal>

            {/* Row 2 */}
            <Reveal delay="0.25s">
              <BentoCalendar />
            </Reveal>
            <Reveal delay="0.3s">
              <BentoTasks />
            </Reveal>
            <Reveal delay="0.35s" className="lg:col-span-2">
              <BentoOrchestration />
            </Reveal>

            {/* Row 3 */}
            <Reveal delay="0.4s">
              <BentoStatControl />
            </Reveal>
            <Reveal delay="0.45s" className="lg:col-span-2">
              <BentoAIThinking />
            </Reveal>
            <Reveal delay="0.5s">
              <BentoControl />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ══ INTEGRATIONS FLOW ══ */}
      <section id="flow" className="py-16 sm:py-28 bg-white border-t border-[#D97757]/10 relative overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
          <Reveal className="text-center mb-12 sm:mb-16">
            <span className="text-xs font-bold uppercase tracking-widest mb-3 block text-[#D97757]">Visual Flow</span>
            <TextAnimate as="h2" by="character" animation="blurInUp" className="text-3xl sm:text-4xl md:text-5xl font-black mb-4 text-[#141413]">
            Emails In. Actions Out.
          </TextAnimate>
            <p className="max-w-2xl mx-auto text-base sm:text-lg text-[#141413] px-4">
              Watch how information flows through the agentic pipeline — from your inbox to executable outcomes.
            </p>
          </Reveal>

          <Reveal delay="0.2s">
            <div className="overflow-x-auto">
              <IntegrationsBeam />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="py-16 sm:py-28 relative overflow-hidden" style={{ background: C }}>
        {/* Animated rings */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          {[300, 450, 600].map((size, i) => (
            <div
              key={i}
              className="absolute rounded-full"
              style={{
                width: size, height: size,
                top: -size / 2, left: -size / 2,
                border: 'none',
                animation: `pulse-ring ${3 + i}s cubic-bezier(0.215, 0.61, 0.355, 1) ${i * 0.8}s infinite`,
              }}
            />
          ))}
        </div>

        <div className="container mx-auto px-6 text-center relative z-10">
          <Reveal>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest mb-8 bg-white/10 text-white">
              <Star className="w-3.5 h-3.5 fill-white text-white" /> Ready to Transform Your Inbox
            </div>
            <h2 className="text-4xl md:text-6xl font-black text-white mb-6">
              Experience It<br />
              <Highlighter action="box" color="white" padding={8} strokeWidth={3}>
                <span className="text-white">Firsthand</span>
              </Highlighter>
            </h2>
            <p className="text-xl mb-12 max-w-2xl mx-auto leading-relaxed text-white/80">
              The complete agentic pipeline — real{' '}
              <Highlighter action="underline" color="white" delay={1500} strokeWidth={2}>
                AI outputs
              </Highlighter>
              , real approval flows, real inbox structure.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <SpringButton
                onClick={onStart}
                primary={false}
                className="w-full sm:w-64 py-5 text-xl shadow-2xl"
              >
                Get Started
              </SpringButton>
            </div>
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-white/70">
              <div className="flex items-center gap-2"><Lock className="w-4 h-4" /> Full control</div>
              <div className="flex items-center gap-2"><TrendingUp className="w-4 h-4" /> All features accessible</div>
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> Secure & Private</div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 sm:py-10 bg-white ">
        <div className="container mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg" style={{ background: C }}>
              <Mail className="w-4 h-4 text-white" />
            </div>
            <span className="font-black text-[#141413]">Email<span style={{ color: C }}>Assist</span></span>
          </div>
          <p className="text-xs sm:text-sm text-[#141413]">© 2026 EmailAssist · AI-Powered Email Management</p>
          <div className="flex gap-4 sm:gap-6 text-xs sm:text-sm text-[#141413]">
            <span className="hover:opacity-70 cursor-pointer transition-opacity">Documentation</span>
            <span className="hover:opacity-70 cursor-pointer transition-opacity">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
