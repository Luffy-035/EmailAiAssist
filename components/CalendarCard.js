import { useState, useTransition } from "react";
import { createCalendarEvent } from "@/actions/createCalendarEvent";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Video,
  Users,
  Clock,
  AlertTriangle,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  MapPin,
  CalendarDays
} from "lucide-react";

export default function CalendarCard({ email, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("details"); // details, preview
  const [eventData, setEventData] = useState({
    title: email.calendarEvent?.title || "",
    date: email.calendarEvent?.date || "",
    time: email.calendarEvent?.time || "",
    description: email.calendarEvent?.description || "",
    participants: email.calendarEvent?.participants || [],
  });
  const [created, setCreated] = useState(email.calendarCreated);
  const [isPending, startCreate] = useTransition();
  const [error, setError] = useState("");

  function handleChange(field, value) {
    setEventData((prev) => ({ ...prev, [field]: value }));
  }

  function handleCreateEvent() {
    if (created) return;
    startCreate(async () => {
      try {
        setError("");
        await createCalendarEvent({ emailId: email.emailId, eventData });
        setCreated(true);
        if (onUpdate) onUpdate({ ...email, calendarCreated: true });
      } catch (err) {
        setError(err.message);
      }
    });
  }

  const inputClasses = "w-full bg-gray-50/50 rounded-xl px-4 py-3 text-sm text-[#141413] font-semibold focus:outline-none focus:ring-2 focus:ring-[#D97757]/10 focus:bg-white transition-all placeholder:text-[#141413]/20 border border-transparent hover:border-gray-100 group-hover:border-[#D97757]/10";
  const labelClasses = "text-[9px] uppercase tracking-widest font-black text-[#141413]/30 mb-2 ml-1 block";

  // Dummy Calendar Grid for Animation
  const getCalendarDays = () => {
    const days = [];
    for (let i = 1; i <= 31; i++) days.push(i);
    return days;
  };

  return (
    <div className="bg-white rounded-[2rem] border border-gray-100/50 overflow-hidden transition-all duration-700">
      {/* ── CARD HEADER ────────────────────────────────────────────────── */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-8 hover:bg-gray-50/30 transition-all group relative overflow-hidden"
      >
        <div className="flex items-center gap-5 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-[#D97757] flex items-center justify-center text-white transform group-hover:scale-110 transition-transform duration-500">
            <CalendarDays className="w-6 h-6" />
          </div>
          <div className="text-left">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-black text-[#141413]/30 uppercase tracking-[0.2em]">Calendar</h3>
              {created && <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-500 text-[8px] font-black tracking-widest border border-emerald-100 uppercase animate-in fade-in slide-in-from-left-2 transition-all">Synced</span>}
            </div>
            <p className="text-[#141413] font-black text-xl tracking-tight leading-none">{eventData.title || "Meeting Suggested"}</p>
          </div>
        </div>
        <div className={`p-2 rounded-full bg-gray-50 text-[#141413]/20 group-hover:text-[#141413] transition-all duration-500 ${isOpen ? 'rotate-180 bg-[#141413] text-white' : ''}`}>
          <ChevronDown className="w-5 h-5" />
        </div>
      </button>

      {isOpen && (
        <div className="p-8 pt-0 animate-in fade-in slide-in-from-top-6 duration-700">
          <div className="border-t border-gray-50 pt-8">

            <div className="flex flex-col gap-8">
              {/* Form Info */}
              <div className="w-full space-y-6">
                {/* Quick Tabs */}
                <div className="flex gap-1 p-1 bg-gray-50/50 rounded-xl w-fit">
                  <button
                    onClick={() => setActiveTab("details")}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'details' ? 'bg-[#141413] text-white' : 'text-gray-400 hover:text-[#141413]'}`}
                  >
                    Details
                  </button>
                  <button
                    onClick={() => setActiveTab("preview")}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'preview' ? 'bg-[#141413] text-white' : 'text-gray-400 hover:text-[#141413]'}`}
                  >
                    Context
                  </button>
                </div>

                {activeTab === "details" ? (
                  <div className="space-y-6 animate-in fade-in slide-in-from-left-4 duration-500">
                    {/* Title */}
                    <div className="group">
                      <label className={labelClasses}>What's the goal?</label>
                      <input
                        type="text"
                        value={eventData.title}
                        onChange={(e) => handleChange("title", e.target.value)}
                        className={inputClasses}
                        placeholder="Meeting name..."
                      />
                    </div>

                    {/* Grid: Date/Time */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="group flex flex-col">
                        <label className={labelClasses}>Select Date</label>
                        <div className="relative">
                          <CalendarIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141413]/30 pointer-events-none" />
                          <input
                            type="date"
                            value={eventData.date}
                            onChange={(e) => handleChange("date", e.target.value)}
                            className={`${inputClasses} pl-10 pr-2`}
                          />
                        </div>
                      </div>
                      <div className="group flex flex-col">
                        <label className={labelClasses}>Pick Time</label>
                        <div className="relative">
                          <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141413]/30 pointer-events-none" />
                          <select
                            value={eventData.time}
                            onChange={(e) => handleChange("time", e.target.value)}
                            className={`${inputClasses} pl-10 pr-8 appearance-none bg-no-repeat`}
                            style={{
                              backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                              backgroundPosition: "right 0.75rem center",
                              backgroundSize: "1.25rem 1.25rem"
                            }}
                          >
                            <option value="" disabled>Select...</option>
                            {Array.from({ length: 48 }).map((_, i) => {
                              const h = Math.floor(i / 2).toString().padStart(2, "0");
                              const m = i % 2 === 0 ? "00" : "30";
                              const t = `${h}:${m}`;
                              return <option key={t} value={t}>{t}</option>;
                            })}
                          </select>
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="group">
                      <label className={labelClasses}>Internal Description</label>
                      <textarea
                        rows={3}
                        value={eventData.description}
                        onChange={(e) => handleChange("description", e.target.value)}
                        className={`${inputClasses} resize-none`}
                        placeholder="What will be discussed?"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                    {/* Attendees */}
                    <div>
                      <label className={labelClasses}>Attendees</label>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {eventData.participants.map((p) => (
                          <div key={p} className="flex items-center gap-2 pl-2 pr-4 py-1.5 bg-gray-50 border border-gray-100 rounded-lg group transition-all hover:border-[#D97757]/20">
                            <div className="w-5 h-5 rounded-full bg-[#141413] flex items-center justify-center text-[10px] text-white font-bold">{p[0]}</div>
                            <span className="text-xs font-bold text-[#141413]">{p}</span>
                          </div>
                        ))}
                        <button className="flex items-center gap-2 pl-2 pr-4 py-1.5 text-gray-400 hover:text-[#141413] transition-all text-xs font-bold dashed border border-dashed border-gray-200 rounded-lg">
                          + Add Guest
                        </button>
                      </div>
                    </div>
                    <div className="p-6 bg-gray-50/50 rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-2 text-[10px] font-black uppercase text-gray-300 tracking-widest mb-4">
                        <Video className="w-3.5 h-3.5" />
                        Analysis Context
                      </div>
                      <p className="text-xs text-[#141413] font-medium leading-relaxed italic">
                        "Based on the email thread, {email.senderName} has indicated a preference for morning slots this week. This {eventData.title} was drafted to align with the action items discussed."
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Next Step Visual */}
              <div className="w-full">
                <div className="bg-[#141413] rounded-3xl p-6 border border-white/5 flex flex-col relative overflow-hidden group">
                  {/* Grid Effect bg */}
                  <div className="absolute inset-0 grid grid-cols-7 gap-1 p-2 opacity-5 pointer-events-none">
                    {getCalendarDays().map(d => (
                      <div key={d} className="aspect-square border border-white/20 rounded-md" />
                    ))}
                  </div>

                  <div className="relative z-10 w-full animate-in fade-in scale-in duration-1000 flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-[#D97757]/10 flex shrink-0 items-center justify-center text-[#D97757] border border-[#D97757]/20 relative">
                        <CalendarDays className="w-8 h-8" />
                        <div className="absolute inset-0 rounded-full border border-[#D97757]/20 animate-ping opacity-20" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-[10px] font-black text-[#D97757] uppercase tracking-[0.3em]">Next Step</p>
                        <h4 className="text-white font-black text-xl italic tracking-tight">{created ? 'Scheduled' : 'Drafting Event...'}</h4>
                      </div>
                    </div>

                    {/* Interactive Schedule Visual */}
                    <div className="w-full md:w-auto md:ml-auto md:flex-1 max-w-sm bg-white/5 rounded-2xl p-4 text-left border border-white/5 flex flex-col sm:flex-row gap-4">
                      <div className="flex-1 flex items-center justify-between sm:justify-start">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <Clock className="w-4 h-4 text-[#D97757]" />
                          </div>
                          <div className="leading-tight">
                            <p className="text-[10px] font-black text-gray-500 uppercase">Selected</p>
                            <p className="text-xs font-bold text-white uppercase">{eventData.time || '--:--'} Today</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="hidden sm:block w-px bg-white/10 self-stretch" />
                      
                      <div className="flex-1 flex items-center justify-between sm:justify-start opacity-50">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <ExternalLink className="w-4 h-4 text-white" />
                          </div>
                          <div className="leading-tight">
                            <p className="text-[10px] font-black text-gray-500 uppercase">Room</p>
                            <p className="text-xs font-bold text-white uppercase">Google Meet</p>
                          </div>
                        </div>
                        <div className="w-2 h-2 rounded-full bg-emerald-500 sm:ml-auto" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-4 mt-8 bg-red-50 text-red-600 rounded-2xl text-xs font-bold border border-red-100 animate-in slide-in-from-bottom-2">
                <AlertTriangle className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex items-center justify-end mt-10 gap-4">
              <button
                onClick={() => setIsOpen(false)}
                className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#141413] transition-all"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateEvent}
                disabled={isPending || created || !eventData.date}
                className={`flex items-center justify-center gap-3 px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-95 border ${created
                    ? "bg-emerald-50 text-emerald-500 border-emerald-100 cursor-default"
                    : "bg-[#141413] hover:bg-[#141413]/90 text-white border-[#141413]"
                  }`}
              >
                {created ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    CALENDAR UPDATED
                  </>
                ) : isPending ? (
                  <span className="flex items-center gap-2">
                    <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    SYNCING...
                  </span>
                ) : (
                  <>
                    <CalendarDays className="w-4 h-4" />
                    ADD TO CALENDAR
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
