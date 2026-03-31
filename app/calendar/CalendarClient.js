"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/Navbar";
import { createCalendarEvent } from "@/actions/createCalendarEvent";
import { SpringButton } from "@/components/ui/SpringButton";
import { FlickeringGrid } from "@/components/ui/FlickeringGrid";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Users, FileText, CheckCircle2, Clock, Inbox } from "lucide-react";

// --- Helpers ---
function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [y, m, d] = dateStr.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function formatDate(dateStr) {
  const d = parseLocalDate(dateStr);
  if (!d) return "No date set";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "long", day: "numeric", year: "numeric" });
}

function isSameDay(dateStr, year, month, day) {
  const d = parseLocalDate(dateStr);
  if (!d) return false;
  return d.getFullYear() === year && d.getMonth() === month && d.getDate() === day;
}

const MONTH_NAMES = [
  "January","February","March","April","May","June",
  "July","August","September","October","November","December",
];
const DAY_NAMES = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

// Priority color for event pills - updated for coral brand theme
const PILL_COLORS = [
  "bg-[#D97757] text-white",      // Primary Coral
  "bg-[#141413] text-white",      // Core Black
  "bg-[#D97757]/80 text-white",   // Soft Coral
  "bg-[#141413]/70 text-white",   // Soft Black
];

export default function CalendarClient({ events, userName }) {
  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [addingId, setAddingId] = useState(null);
  const [addedIds, setAddedIds] = useState(
    new Set(events.filter((e) => e.calendarCreated).map((e) => e.id))
  );

  // Build calendar grid for current month
  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(d);
    return cells;
  }, [viewYear, viewMonth]);

  // Events for current month
  const monthEvents = useMemo(() => {
    return events.filter((e) => {
      const d = parseLocalDate(e.date);
      return d && d.getFullYear() === viewYear && d.getMonth() === viewMonth;
    });
  }, [events, viewYear, viewMonth]);

  // Helper to get events for a specific day
  const getEventsForDay = (day) => {
    return monthEvents.filter((e) => {
      const d = parseLocalDate(e.date);
      return d && d.getDate() === day;
    });
  };

  // Upcoming events — next 30 days from today
  const upcomingEvents = useMemo(() => {
    const todayMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
    const thirtyDaysMs = todayMs + 30 * 24 * 60 * 60 * 1000;
    return events
      .filter((e) => {
        const d = parseLocalDate(e.date);
        if (!d) return false;
        const ms = d.getTime();
        return ms >= todayMs && ms <= thirtyDaysMs;
      })
      .sort((a, b) => parseLocalDate(a.date) - parseLocalDate(b.date));
  }, [events]);

  function prevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1); }
    else setViewMonth((m) => m - 1);
  }
  function nextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1); }
    else setViewMonth((m) => m + 1);
  }

  async function handleAddToCalendar(event) {
    setAddingId(event.id);
    try {
      await createCalendarEvent(event.emailId);
      setAddedIds((prev) => new Set([...prev, event.id]));
      if (selectedEvent?.id === event.id) {
        setSelectedEvent({ ...selectedEvent, calendarCreated: true });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAddingId(null);
    }
  }

  const isToday = (day) =>
    day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();

  return (
    <div className="min-h-screen bg-white relative overflow-hidden text-[#141413]">
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-black text-[#141413] tracking-tight">Calendar</h1>
          <p className="text-gray-500 font-medium mt-2">
            {events.length === 0
              ? "No meeting events found. Process emails to extract meetings."
              : `${events.length} meeting${events.length !== 1 ? "s" : ""} extracted from emails`}
          </p>
        </div>        <div className="bg-white/40 backdrop-blur-md rounded-3xl border border-gray-100 shadow-xl p-8 lg:p-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            {/* --- LEFT: Calendar Grid (2/3 width) --- */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between mb-2">
                <button 
                  onClick={prevMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-gray-400" />
                </button>
                <h2 className="text-xl font-black text-[#141413] tracking-tight">
                  {new Date(viewYear, viewMonth).toLocaleString('default', { month: 'long' })} {viewYear}
                </h2>
                <button 
                  onClick={nextMonth}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {/* Day headers */}
                <div className="grid grid-cols-7 bg-gray-50/50 border-b border-gray-100">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                    <div key={d} className="py-3 text-center text-[10px] font-black uppercase tracking-widest text-gray-400">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Grid */}
                <div className="grid grid-cols-7">
                  {calendarDays.map((day, idx) => {
                    const dayEvents = day ? getEventsForDay(day) : [];
                    const isSelected = day === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
                    
                    return (
                      <div 
                        key={idx} 
                        className={`min-h-[120px] p-4 border-r border-b border-gray-100 last:border-r-0 relative group transition-all duration-300 ${
                          day ? "bg-white hover:bg-gray-50/30" : "bg-gray-50/10"
                        }`}
                      >
                        {day && (
                          <>
                            <div className="flex justify-start mb-3">
                              <span className={`text-xs font-black w-8 h-8 flex items-center justify-center rounded-xl transition-all duration-300 ${
                                isSelected 
                                  ? "bg-[#D97757] text-white shadow-xl shadow-[#D97757]/30 scale-110" 
                                  : "text-[#141413]/40 group-hover:text-[#141413] group-hover:bg-white"
                              }`}>
                                {day}
                              </span>
                            </div>
                            
                            <div className="space-y-1">
                              {dayEvents.slice(0, 3).map((e, i) => (
                                <button
                                  key={e.id}
                                  onClick={() => setSelectedEvent(e)}
                                  className={`w-full text-left px-2 py-1 rounded text-[10px] font-bold truncate transition-all ${PILL_COLORS[i % PILL_COLORS.length]} hover:brightness-95 active:scale-95`}
                                  title={e.title}
                                >
                                  {e.title}
                                </button>
                              ))}
                              {dayEvents.length > 3 && (
                                <span className="text-xs text-gray-500 px-1">
                                  +{dayEvents.length - 3} more
                                </span>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* --- RIGHT: Upcoming Events Sidebar (1/3 width) --- */}
            <div className="space-y-6">
              <div className="bg-white/60 rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-black text-[#141413] uppercase tracking-wider mb-6 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-[#D97757]" />
                  Upcoming meetings
                </h3>

                {upcomingEvents.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 px-8 bg-gray-50/30 rounded-[2rem] border border-dashed border-gray-100 animate-in fade-in zoom-in duration-700">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mb-4 shadow-sm border border-gray-50">
                      <CalendarIcon className="w-5 h-5 text-gray-200" />
                    </div>
                    <p className="text-gray-400 text-xs font-bold text-center leading-relaxed max-w-[180px]">
                      No upcoming meetings in the next 30 days.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                    {upcomingEvents.map((e, i) => (
                      <button
                        key={e.id}
                        onClick={() => setSelectedEvent(e)}
                        className="w-full text-left p-4 rounded-xl bg-white hover:bg-gray-50 transition-all border border-gray-100 hover:border-[#D97757]/20 hover:shadow-md group"
                      >
                        <div className="flex items-start gap-4">
                          <span className={`w-2.5 h-2.5 rounded-full mt-1 flex-shrink-0 ${PILL_COLORS[i % PILL_COLORS.length].split(' ')[0]} group-hover:scale-125 transition-transform`} />
                          <div className="min-w-0">
                            <p className="text-sm font-bold text-[#141413] truncate group-hover:text-[#D97757] transition-colors">{e.title}</p>
                            <p className="text-[11px] text-gray-500 mt-1 font-medium">
                              {formatDate(e.date)}{e.time ? ` · ${e.time}` : ""}
                            </p>
                            <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold mt-2 px-2 py-0.5 rounded-full border ${
                              addedIds.has(e.id) 
                                ? "text-[#D97757] bg-[#D97757]/10 border-[#D97757]/20" 
                                : "text-[#141413] bg-[#141413]/10 border-[#141413]/20"
                            }`}>
                              {addedIds.has(e.id) ? "✓ Added" : "⏳ Pending"}
                            </span>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Stats card */}
              <div className="bg-white/60 rounded-2xl p-6 border border-gray-100 shadow-sm">
                <h3 className="text-xs font-black text-[#141413] uppercase tracking-wider mb-6">Overview</h3>
                <div className="space-y-4">
                  {[
                    { label: "Total meetings", value: events.length, color: "text-[#141413]" },
                    { label: "Added to Google Cal", value: addedIds.size, color: "text-[#D97757]" },
                    { label: "Pending", value: events.length - addedIds.size, color: "text-[#141413]" },
                    { label: "Upcoming (30d)", value: upcomingEvents.length, color: "text-[#D97757]" }
                  ].map((stat) => (
                    <div key={stat.label} className="flex justify-between items-center text-sm">
                      <span className="text-gray-500 font-medium">{stat.label}</span>
                      <span className={`font-black ${stat.color}`}>{stat.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* --- Event Detail Modal --- */}
      <AnimatePresence>
        {selectedEvent && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-[#141413]/40 backdrop-blur-sm"
              onClick={() => setSelectedEvent(null)}
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl border border-gray-100 overflow-hidden flex flex-col"
            >
              {/* Modal header */}
              <div className="flex items-start justify-between p-8 border-b border-gray-50 bg-gray-50/50">
                <div>
                  <h2 className="text-xl font-black text-[#141413] leading-tight tracking-tight">
                    {selectedEvent.title}
                  </h2>
                  <div className="flex items-center gap-2 text-sm text-gray-500 mt-2 font-medium">
                    <Clock className="w-4 h-4 text-[#D97757]/60" />
                    {formatDate(selectedEvent.date)}
                    {selectedEvent.time && <span> · {selectedEvent.time}</span>}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="p-2 rounded-xl text-gray-400 hover:text-[#141413] hover:bg-white transition-all shadow-sm border border-transparent hover:border-gray-100"
                >
                  <ChevronRight className="w-5 h-5 rotate-90" />
                </button>
              </div>

              {/* Modal body */}
              <div className="p-8 space-y-6 overflow-y-auto max-h-[60vh]">
                {/* Participants */}
                {selectedEvent.participants?.length > 0 && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                      <Users className="w-3.5 h-3.5" /> Participants
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {selectedEvent.participants.map((p, i) => (
                        <span key={i} className="text-xs bg-gray-50 text-gray-600 px-3 py-1.5 rounded-lg border border-gray-100 font-bold">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Description */}
                {selectedEvent.description && (
                  <div>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                      <FileText className="w-3.5 h-3.5" /> Description
                    </p>
                    <p className="text-sm text-gray-600 leading-relaxed font-medium">{selectedEvent.description}</p>
                  </div>
                )}

                {/* Source email */}
                <div className="pt-2">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Inbox className="w-3.5 h-3.5" /> Source email
                  </p>
                  <p className="text-sm text-gray-700 italic font-medium bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    {'"'}{selectedEvent.sourceSubject}{'"'}
                  </p>
                  <p className="text-[11px] text-gray-400 mt-2 font-medium">From {selectedEvent.sourceSender}</p>
                </div>

                {/* Status */}
                <div className={`flex items-center gap-2 text-sm px-4 py-3 rounded-xl ${
                  addedIds.has(selectedEvent.id)
                    ? "bg-[#D97757]/10 text-[#D97757] border border-[#D97757]/20"
                    : "bg-[#141413]/10 text-[#141413] border border-[#141413]/20"
                }`}>
                  {addedIds.has(selectedEvent.id) ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                      <span className="font-bold">Added to Google Calendar</span>
                    </>
                  ) : (
                    <>
                      <Clock className="w-4 h-4 flex-shrink-0" />
                      <span className="font-bold">Not yet added to Google Calendar</span>
                    </>
                  )}
                </div>
              </div>

              {/* Modal footer */}
              <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex gap-3">
                {!addedIds.has(selectedEvent.id) && (
                  <SpringButton
                    onClick={() => handleAddToCalendar(selectedEvent)}
                    className="flex-1 !py-3 !px-4 shadow-lg active:scale-95"
                    icon={addingId !== selectedEvent.id}
                  >
                    {addingId === selectedEvent.id ? "Adding…" : "Add to Google Calendar"}
                  </SpringButton>
                )}
                <button
                  onClick={() => setSelectedEvent(null)}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-700 text-sm font-bold py-3 rounded-xl transition-all border border-gray-200 shadow-sm"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
