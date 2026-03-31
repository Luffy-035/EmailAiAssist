import { google } from "googleapis";

// Build an authenticated Gmail client using the user's access token
function getGmailClient(accessToken) {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );
  auth.setCredentials({ access_token: accessToken });
  return google.gmail({ version: "v1", auth });
}

// Decode base64url encoded Gmail message parts
function decodeBase64(data) {
  return Buffer.from(data.replace(/-/g, "+").replace(/_/g, "/"), "base64").toString("utf-8");
}

// Extract both plain text and HTML content from Gmail message payload
// Returns { plainText: string, htmlContent: string }
function extractEmailContent(payload) {
  if (!payload) return { plainText: "", htmlContent: "" };

  let plainText = "";
  let htmlContent = "";

  // Skip image and attachment parts entirely
  if (payload.mimeType?.startsWith("image/")) {
    return { plainText: "", htmlContent: "" };
  }
  if (payload.mimeType?.startsWith("application/")) {
    return { plainText: "", htmlContent: "" };
  }

  // Direct plain-text body
  if (payload.mimeType === "text/plain" && payload.body?.data) {
    plainText = decodeBase64(payload.body.data);
  }

  // Direct HTML body
  if (payload.mimeType === "text/html" && payload.body?.data) {
    htmlContent = decodeBase64(payload.body.data);
  }

  // Multipart — extract both text/plain and text/html
  if (payload.parts) {
    const textPart = payload.parts.find((p) => p.mimeType === "text/plain");
    const htmlPart = payload.parts.find((p) => p.mimeType === "text/html");

    if (textPart?.body?.data) {
      plainText = decodeBase64(textPart.body.data);
    }
    if (htmlPart?.body?.data) {
      htmlContent = decodeBase64(htmlPart.body.data);
    }

    // Recurse into nested parts if we haven't found content yet
    if (!plainText && !htmlContent) {
      for (const part of payload.parts) {
        if (part.mimeType?.startsWith("image/")) continue;
        if (part.mimeType?.startsWith("application/")) continue;

        const nested = extractEmailContent(part);
        if (!plainText && nested.plainText) plainText = nested.plainText;
        if (!htmlContent && nested.htmlContent) htmlContent = nested.htmlContent;

        // Stop if we found both
        if (plainText && htmlContent) break;
      }
    }
  }

  return { plainText, htmlContent };
}

// Sanitize email body for AI processing:
// - Strips HTML tags, scripts, styles
// - Removes base64 blobs and CID references (inline images)
// - Decodes HTML entities
// - Collapses excessive whitespace
// - Truncates to 4000 chars to stay within token limits
function sanitizeForAI(raw) {
  if (!raw) return "";

  let text = raw
    // Remove style and script blocks first
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    // Remove HTML comments
    .replace(/<!--[\s\S]*?-->/g, "")
    // Remove all HTML tags
    .replace(/<[^>]+>/g, " ")
    // Decode common HTML entities
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&[a-z]+;/gi, " ")
    // Remove base64 encoded content (long runs of base64 chars)
    .replace(/[A-Za-z0-9+/]{200,}={0,2}/g, "")
    // Remove CID references (inline image tokens)
    .replace(/cid:[^\s"'>]+/gi, "")
    // Remove data URIs
    .replace(/data:[^;]+;base64,[^\s]*/gi, "")
    // Replace long URLs with placeholder to save tokens
    .replace(/https?:\/\/[^\s]{50,}/g, "[link]")
    // Collapse multiple newlines/spaces
    .replace(/[\r\n]{3,}/g, "\n\n")
    .replace(/[ \t]{2,}/g, " ")
    .trim();

  // Truncate to 4000 characters to stay well within LLM token limits
  if (text.length > 4000) {
    text = text.slice(0, 4000) + "\n...[truncated]";
  }

  return text;
}

// Prepare HTML content for safe display:
// - Removes dangerous scripts and styles
// - Preserves structure and inline images
// - Handles CID references for inline attachments
function sanitizeForDisplay(htmlContent) {
  if (!htmlContent) return "";

  // Remove script and style blocks
  let cleaned = htmlContent
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
    // Remove event handlers
    .replace(/\son\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/\son\w+\s*=\s*[^\s>]*/gi, "")
    // Remove javascript: protocol
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, 'href="#"')
    .trim();

  return cleaned;
}

// Get a header value from a Gmail message by header name
function getHeader(headers, name) {
  const header = headers?.find((h) => h.name.toLowerCase() === name.toLowerCase());
  return header?.value || "";
}

// Parse "Name <email@example.com>" or just "email@example.com"
function parseSender(fromHeader) {
  const match = fromHeader.match(/^(.+?)\s*<(.+?)>\s*$/);
  if (match) {
    return { name: match[1].replace(/"/g, "").trim(), email: match[2].trim() };
  }
  return { name: fromHeader.trim(), email: fromHeader.trim() };
}

/**
 * Fetch recent unread emails from Gmail inbox.
 * Returns an array of structured email objects.
 * Applies label filters (skips CATEGORY_PROMOTIONS, CATEGORY_SOCIAL, SPAM).
 */
export async function fetchUnreadEmails(accessToken, maxResults = 20) {
  const gmail = getGmailClient(accessToken);

  // Get list of unread message IDs (inbox only, skip promotions/social/spam)
  const listRes = await gmail.users.messages.list({
    userId: "me",
    q: "is:unread in:inbox",
    maxResults,
  });

  const messages = listRes.data.messages || [];
  if (messages.length === 0) return [];

  // Fetch full details for each message
  const emails = await Promise.all(
    messages.map(async (msg) => {
      try {
        const res = await gmail.users.messages.get({
          userId: "me",
          id: msg.id,
          format: "full",
        });

        const { id, payload, labelIds, internalDate } = res.data;
        const headers = payload?.headers || [];

        // Skip promotions, social, spam by label
        const skipLabels = ["CATEGORY_PROMOTIONS", "CATEGORY_SOCIAL", "SPAM"];
        if (labelIds && labelIds.some((l) => skipLabels.includes(l))) {
          return null;
        }

        const fromHeader = getHeader(headers, "from");
        const { name: senderName, email: senderEmail } = parseSender(fromHeader);

        // Skip noreply/automated senders
        const noReplyPatterns = ["noreply", "no-reply", "donotreply", "notifications", "mailer-daemon"];
        if (noReplyPatterns.some((p) => senderEmail.toLowerCase().includes(p))) {
          return null;
        }

        const subject = getHeader(headers, "subject") || "(No Subject)";

        // Extract both plain text and HTML content
        const { plainText, htmlContent } = extractEmailContent(payload);

        // For AI: prefer plain text, fallback to HTML, then sanitize aggressively
        const bodyForAI = sanitizeForAI(plainText || htmlContent);

        // For display: prefer HTML (with images), fallback to plain text
        const bodyForDisplay = htmlContent ? sanitizeForDisplay(htmlContent) : plainText;

        const timestamp = internalDate
          ? new Date(parseInt(internalDate)).toISOString()
          : new Date().toISOString();

        return {
          emailId: id,
          subject,
          senderName,
          senderEmail,
          body: bodyForAI,           // Sanitized text for AI processing
          bodyHtml: bodyForDisplay,   // HTML or plain text for user display
          timestamp
        };
      } catch (err) {
        console.error(`Failed to fetch email ${msg.id}:`, err.message);
        return null;
      }
    })
  );

  // Filter out nulls (skipped emails)
  return emails.filter(Boolean);
}

/**
 * Send an email reply via Gmail API.
 * threadId links the reply to the original conversation thread.
 */
export async function sendEmailReply(accessToken, { to, subject, body, threadId }) {
  const gmail = getGmailClient(accessToken);

  // Build RFC 2822 email string
  const rawEmail = [
    `To: ${to}`,
    `Subject: ${subject}`,
    "Content-Type: text/plain; charset=utf-8",
    "MIME-Version: 1.0",
    "",
    body,
  ].join("\n");

  // Base64url encode the email
  const encodedEmail = Buffer.from(rawEmail)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  await gmail.users.messages.send({
    userId: "me",
    requestBody: {
      raw: encodedEmail,
      threadId,
    },
  });
}
