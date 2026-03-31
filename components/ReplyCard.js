import { useState, useEffect, useTransition } from "react";
import { sendReply } from "@/actions/sendReply";
import { Reply, Sparkles, Send, CheckCircle2, MessageSquare, Wand2, Info, ChevronDown, Briefcase, Smile, Zap } from "lucide-react";

const TONES = [
  { id: "formal", label: "Formal", icon: Briefcase },
  { id: "friendly", label: "Friendly", icon: Smile },
  { id: "assertive", label: "Assertive", icon: Zap },
];

export default function ReplyCard({ email, onUpdate }) {
  const [isOpen, setIsOpen] = useState(false);
  const [replyBody, setReplyBody] = useState(email.suggestedReply?.body || "");
  const [replySubject, setReplySubject] = useState(email.suggestedReply?.subject || `Re: ${email.subject}`);
  const [tone, setTone] = useState("formal");
  const [customInstruction, setCustomInstruction] = useState("");
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [isSending, startSending] = useTransition();
  const [sent, setSent] = useState(email.replySent);
  const [error, setError] = useState("");

  useEffect(() => {
    setReplyBody(email.suggestedReply?.body || "");
    setReplySubject(email.suggestedReply?.subject || `Re: ${email.subject}`);
    setTone("formal");
    setCustomInstruction("");
    setSent(email.replySent || false);
    setError("");
  }, [email.emailId]);

  async function handleRegenerate() {
    setIsRegenerating(true);
    setError("");
    try {
      const res = await fetch("/api/emails/reply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          emailId: email.emailId,
          subject: email.subject,
          senderName: email.senderName,
          emailBody: email.body,
          tone,
          customInstruction,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Regeneration failed");
      setReplyBody(data.reply?.body || replyBody);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsRegenerating(false);
    }
  }

  function handleSend() {
    if (sent) return;
    startSending(async () => {
      try {
        setError("");
        await sendReply({
          emailId: email.emailId,
          to: email.senderEmail,
          subject: replySubject,
          body: replyBody,
          threadId: email.emailId,
        });
        setSent(true);
        if (onUpdate) onUpdate({ ...email, replySent: true });
      } catch (err) {
        setError(err.message);
      }
    });
  }

  const inputClasses = "w-full bg-gray-50 rounded-lg px-6 py-5 text-base text-[#141413] font-medium focus:outline-none focus:ring-2 focus:ring-[#141413]/5 focus:bg-white transition-all placeholder:text-[#141413]/20";
  const labelClasses = "text-[10px] uppercase tracking-widest font-black text-[#141413]/30 mb-2 ml-1";

  return (
    <div className="bg-white rounded-2xl border border-gray-100/50 shadow-sm overflow-hidden transition-all duration-500">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-8 hover:bg-gray-50/50 transition-colors group"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-lg bg-[#D97757] flex items-center justify-center text-white shadow-lg shadow-[#D97757]/20">
            <Reply className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h3 className="text-sm font-black text-[#141413]/30 uppercase tracking-[0.2em]">Response</h3>
            <p className="text-[#141413] font-black text-lg">AI Generated Draft</p>
          </div>
        </div>
        <div className={`p-2 rounded-full bg-gray-50 text-[#141413]/20 group-hover:text-[#141413] transition-all ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>

      {isOpen && (
        <div className="p-8 pt-0 animate-in fade-in slide-in-from-top-4 duration-500">
          <div className="border-t border-gray-50 pt-8">
            {/* Tone selector */}
            <div className="mb-6">
              <label className={labelClasses}>Tone Selection</label>
              <div className="flex flex-wrap gap-2">
                {TONES.map((t) => (
                  <button
                    key={t.id}
                    onClick={() => setTone(t.id)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      tone === t.id
                        ? "bg-[#D97757] text-white"
                        : "bg-white text-[#141413]/40 hover:text-[#D97757]"
                    }`}
                  >
                    <t.icon className="w-3.5 h-3.5" />
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Editable reply body */}
            <div className="mb-6 group">
              <label className={labelClasses}>Email Content</label>
              <textarea
                value={replyBody}
                onChange={(e) => setReplyBody(e.target.value)}
                rows={8}
                className={`${inputClasses} resize-none leading-relaxed`}
                placeholder="Start typing your response..."
              />
            </div>

            {/* Custom instruction */}
            <div className="mb-8">
              <label className={labelClasses}>AI Refinement (Optional)</label>
              <div className="relative">
                <Wand2 className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-[#141413]/30" />
                <input
                  type="text"
                  value={customInstruction}
                  onChange={(e) => setCustomInstruction(e.target.value)}
                  placeholder='e.g. "Suggest a coffee meeting for tomorrow"'
                  className={`${inputClasses} pl-14`}
                />
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 p-4 mt-8 bg-[#141413]/10 text-[#141413] rounded-lg text-sm font-bold animate-shake">
                <Info className="w-4 h-4" />
                {error}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex items-center justify-end gap-3">
              <button
                onClick={handleRegenerate}
                disabled={isRegenerating || sent}
                className={`flex items-center justify-center gap-2 px-5 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-[0.98] border ${
                  sent
                    ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed"
                    : "bg-white text-[#D97757] border-[#D97757]/20 hover:border-[#D97757] hover:bg-[#D97757]/5"
                }`}
              >
                {isRegenerating ? (
                  <span className="w-4 h-4 border-2 border-t-[#D97757] border-[#D97757]/10 rounded-full animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                {isRegenerating ? "DRAFTING..." : "REGENERATE"}
              </button>

              <button
                onClick={handleSend}
                disabled={isSending || sent}
                className={`flex items-center justify-center gap-2 px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-300 active:scale-[0.98] border ${
                  sent
                    ? "bg-[#D97757]/10 text-[#D97757] border-[#D97757]/20 cursor-default"
                    : "bg-[#141413] hover:bg-[#141413]/90 text-white border-[#141413] shadow-md shadow-[#141413]/10"
                }`}
              >
                {sent ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    SENT SUCCESSFULLY
                  </>
                ) : isSending ? (
                  "SENDING..."
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 text-white/70" />
                    SEND EMAIL
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
