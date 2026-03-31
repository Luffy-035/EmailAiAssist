import { useState } from "react";
import { Mail, Clock, User, ArrowUpRight, Check } from "lucide-react";
import DOMPurify from "isomorphic-dompurify";

export default function OriginalEmailCard({ email }) {
  const [copied, setCopied] = useState(false);
  const [imageErrors, setImageErrors] = useState(new Set());

  if (!email) return null;

  const gmailUrl = `https://mail.google.com/mail/u/0/#all/${email.emailId}`;

  const handleOpenAndCopy = () => {
    if (!email.emailId) return;

    // Open in new tab
    window.open(gmailUrl, "_blank");

    // Copy to clipboard
    navigator.clipboard.writeText(gmailUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  // Sanitize HTML content for safe rendering
  const sanitizedHtml = email.bodyHtml && email.bodyHtml.trim().length > 0
    ? DOMPurify.sanitize(email.bodyHtml, {
        ALLOWED_TAGS: [
          'p', 'br', 'strong', 'b', 'em', 'i', 'u', 'a', 'ul', 'ol', 'li',
          'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'img', 'div', 'span', 'table',
          'thead', 'tbody', 'tr', 'td', 'th', 'blockquote', 'pre', 'code', 'hr'
        ],
        ALLOWED_ATTR: [
          'href', 'src', 'alt', 'title', 'width', 'height', 'style', 'class',
          'target', 'rel', 'align', 'border', 'cellpadding', 'cellspacing'
        ],
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        ALLOW_DATA_ATTR: false,
        KEEP_CONTENT: true,
      })
    : null;

  // Check if content is HTML or plain text
  const isHtmlContent = sanitizedHtml && sanitizedHtml.length > 0;

  return (
    <div className="w-full h-full overflow-y-auto custom-scrollbar bg-white">
      {/* Native-Style Header */}
      <div className="p-10 border-b border-gray-100/60">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl font-black text-[#141413] tracking-tighter mb-4 leading-[1.1]">
              {email.subject}
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center border border-gray-200 shrink-0 shadow-sm">
                <User className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex flex-col min-w-0">
                <span className="text-sm font-black text-[#141413] flex items-center gap-1.5">
                  {email.senderName}
                  <span className="text-gray-300 font-bold text-[10px]">&lt;{email.senderEmail}&gt;</span>
                </span>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1.5 mt-0.5">
                  <Clock className="w-3 h-3" />
                  {email.timestamp ? new Date(email.timestamp).toLocaleString(undefined, {
                    weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit'
                  }) : "Received recently"}
                </span>
              </div>
            </div>
          </div>
          <button
            onClick={handleOpenAndCopy}
            className={`flex items-center gap-2 group whitespace-nowrap px-4 py-2 rounded-xl border transition-all active:scale-95 ${copied ? 'bg-emerald-50 border-emerald-100 px-6' : 'bg-gray-50 border-gray-100 hover:bg-white hover:border-[#D97757]/20 shadow-sm'}`}
          >
            {copied ? (
              <>
                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest leading-none">Copied Link</span>
                <Check className="w-3.5 h-3.5 text-emerald-500 animate-in zoom-in duration-300" />
              </>
            ) : (
              <>
                <span className="text-[10px] font-black text-[#141413]/40 group-hover:text-[#D97757] uppercase tracking-widest transition-colors leading-none">Gmail View</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-[#D97757] transition-colors" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* Body Area (High Fidelity) */}
      <div className="p-10 bg-white">
        {isHtmlContent ? (
          <div
            className="email-content prose prose-sm max-w-none text-[#141413]/80
              [&_p]:leading-relaxed [&_p]:mb-4 [&_p:last-child]:mb-0
              [&_a]:text-[#D97757] [&_a]:underline [&_a]:break-words hover:[&_a]:text-[#D97757]/80
              [&_img]:max-w-full [&_img]:h-auto [&_img]:rounded-lg [&_img]:my-4 [&_img]:border [&_img]:border-gray-200
              [&_ul]:list-disc [&_ul]:ml-6 [&_ul]:mb-4 [&_ol]:list-decimal [&_ol]:ml-6 [&_ol]:mb-4
              [&_li]:mb-2 [&_li]:leading-relaxed
              [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mb-4 [&_h1]:text-[#141413]
              [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mb-3 [&_h2]:text-[#141413]
              [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mb-2 [&_h3]:text-[#141413]
              [&_blockquote]:border-l-4 [&_blockquote]:border-gray-300 [&_blockquote]:pl-4 [&_blockquote]:italic [&_blockquote]:my-4
              [&_pre]:bg-gray-50 [&_pre]:p-4 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre]:my-4
              [&_code]:bg-gray-100 [&_code]:px-1 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-sm [&_code]:font-mono
              [&_table]:w-full [&_table]:border-collapse [&_table]:my-4
              [&_th]:border [&_th]:border-gray-300 [&_th]:bg-gray-50 [&_th]:px-4 [&_th]:py-2 [&_th]:text-left [&_th]:font-bold
              [&_td]:border [&_td]:border-gray-300 [&_td]:px-4 [&_td]:py-2
              [&_hr]:my-6 [&_hr]:border-gray-200
              [&_strong]:font-bold [&_b]:font-bold [&_em]:italic [&_i]:italic
              selection:bg-[#D97757]/10"
            dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
          />
        ) : (
          <div className="text-[15px] leading-relaxed text-[#141413]/80 font-medium whitespace-pre-wrap break-words selection:bg-[#D97757]/10">
            {email.body || email.bodyHtml || "No email content available."}
          </div>
        )}
      </div>
    </div>
  );
}
