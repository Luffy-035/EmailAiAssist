"""
POST /process-emails
Single-file FastAPI endpoint: Groq LLM analysis + Supermemory storage.
"""
import asyncio
import json
import os
from contextlib import asynccontextmanager
from typing import List, Literal, Optional

from dotenv import load_dotenv
load_dotenv()  # Must run before initialising clients

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from openai import OpenAI
from pydantic import BaseModel, Field
from supermemory import Supermemory

def current_iso_time() -> str:
    from datetime import datetime, timezone
    return datetime.now(timezone.utc).isoformat()


# ── Pydantic Models ────────────────────────────────────────────────────────────

class EmailItem(BaseModel):
    
    email_id: str
    subject: str
    sender_name: str
    sender_email: str
    body: str
    timestamp: str


class ProcessEmailsRequest(BaseModel):

    emails: List[EmailItem]
    user_name: str
    user_email: str


class Priority(BaseModel):

    level: Literal["urgent", "requires_action", "fyi"]
    reasons: List[str]


class SuggestedReply(BaseModel):

    subject: str
    body: str


class CalendarEvent(BaseModel):

    title: str
    date: Optional[str] = None           # YYYY-MM-DD or null
    time: Optional[str] = None           # HH:MM or null
    participants: List[str]
    description: str


class Task(BaseModel):

    title: str
    deadline: Optional[str] = None   # YYYY-MM-DD or null
    priority: Literal["high", "medium", "low"]


class ProcessedEmail(BaseModel):

    email_id: str
    # Remove user_id from LLM output, we'll inject it internally, same for action states
    summary: str
    priority: Priority
    intent: str
    suggested_reply: SuggestedReply
    calendar_event: Optional[CalendarEvent] = None
    tasks: List[Task] = Field(default_factory=list)
    has_meeting: bool
    has_tasks: bool
    
    # Action states (defaults for MongoDB)
    reply_sent: bool = Field(default=False)
    calendar_created: bool = Field(default=False)
    tasks_approved: bool = Field(default=False)
    processed_at: str = Field(default_factory=current_iso_time)


class ProcessEmailsResponse(BaseModel):

    processed: List[ProcessedEmail]


# ── Generate Reply Models ──────────────────────────────────────────────────────

class GenerateReplyRequest(BaseModel):
    email_id: str
    subject: str
    sender_name: str
    body: str
    tone: Literal["professional", "friendly", "formal", "concise"] = "professional"
    user_name: str
    user_email: str
    custom_instruction: Optional[str] = None


class ReplyContent(BaseModel):
    subject: str
    body: str


class GenerateReplyResponse(BaseModel):
    email_id: str
    reply: ReplyContent


# ── Autopilot Models ──────────────────────────────────────────────────────────

class AutopilotRule(BaseModel):
    id: str          # client-generated UUID used for logging
    text: str        # natural language rule, e.g. "Reply to investors formally"


class AutopilotRequest(BaseModel):
    email_id: str
    subject: str
    sender_name: str
    sender_email: str
    summary: str
    priority_level: str               # urgent | requires_action | fyi
    intent: str
    has_meeting: bool
    has_tasks: bool
    suggested_reply_body: str
    user_name: str
    user_email: str
    rules: List[AutopilotRule] = Field(default_factory=list)


class AutopilotDecision(BaseModel):
    email_id: str
    should_reply: bool
    should_create_event: bool
    should_approve_tasks: bool
    matched_rule_id: Optional[str] = None
    matched_rule_text: Optional[str] = None
    reasoning: str


# ── Clients ────────────────────────────────────────────────────────────────────

llm_client = OpenAI(
    base_url="https://integrate.api.nvidia.com/v1",
    api_key=os.environ["NVIDIA_NIM_API_KEY"]
)
memory_client = Supermemory(api_key=os.environ["SUPERMEMORY_API_KEY"])


def sanitize_tag(user_email: str) -> str:
    """Convert an email address to a valid Supermemory container_tag.
    Supermemory only allows: alphanumeric, hyphens, underscores, colons.
    e.g. sarah@gmail.com  →  sarah_at_gmail_com
    """
    return user_email.replace("@", "_at_").replace(".", "_")

LLM_MODEL = "meta/llama-3.3-70b-instruct"

SYSTEM_PROMPT = """You are an intelligent email assistant. Analyse the email provided and return ONLY a JSON object — no markdown, no preamble, no trailing text.

The JSON must follow this exact schema:
{
  "email_id": "<string>",
  "summary": "<one-sentence summary of the email>",
  "priority": {
    "level": "<urgent | requires_action | fyi>",
    "reasons": ["<reason 1>", "..."]
  },
  "intent": "<single label: meeting_request | follow_up | information | action_required | introduction | other>",
  "has_meeting": <true|false>,
  "has_tasks": <true|false>,
  "suggested_reply": {
    "subject": "<reply subject>",
    "body": "<polite, professional reply body>"
  },
  "calendar_event": <null if no meeting, otherwise {
    "title": "<event title>",
    "date": "<YYYY-MM-DD or null>",
    "time": "<HH:MM or null>",
    "participants": ["<email1>", "..."],
    "description": "<short description>"
  }>,
  "tasks": [
    {
      "title": "<task title>",
      "deadline": "<YYYY-MM-DD or null>",
      "priority": "<high | medium | low>"
    }
  ]
}

Rules:
- Set has_meeting=true only when a specific meeting is proposed or confirmed.
- Set has_tasks=true only when explicit action items are required from the recipient.
- tasks array may be empty [].
- calendar_event you should decide whether the email is worth the 
- Use the recipient's name in the suggested_reply signature.
- All dates must be real calendar dates inferred from context; if the year is ambiguous, use the email timestamp year.
"""


# ── Core Logic ─────────────────────────────────────────────────────────────────

def analyze_email(
    email: EmailItem,
    user_name: str,
    user_email: str,
    memory_context: str = "",
) -> ProcessedEmail:
    """Call Groq with JSON mode and parse into a ProcessedEmail model."""
    system = SYSTEM_PROMPT
    if memory_context:
        system += f"\n\n--- User memory context ---\n{memory_context}"

    user_prompt = (
        f"You are acting on behalf of this User: {user_name} <{user_email}>\n"
        f"The email was sent BY: {email.sender_name} <{email.sender_email}>\n\n"
        f"Email ID: {email.email_id}\n"
        f"Subject: {email.subject}\n"
        f"Timestamp: {email.timestamp}\n\n"
        f"Body:\n{email.body}"
    )

    response = llm_client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.2,
        top_p=0.7,
        max_tokens=1024,
    )

    data = json.loads(response.choices[0].message.content)
    data["email_id"] = email.email_id  # Always trust the input ID
    return ProcessedEmail.model_validate(data)


def store_email_memory(email: EmailItem, user_email: str) -> None:
    """Store email in Supermemory under the user's container_tag."""
    content = (
        f"Email ID: {email.email_id}\n"
        f"Subject: {email.subject}\n"
        f"From: {email.sender_name} <{email.sender_email}>\n"
        f"Timestamp: {email.timestamp}\n\n"
        f"{email.body}"
    )
    memory_client.add(content=content, container_tag=sanitize_tag(user_email))


def process_single(email: EmailItem, user_name: str, user_email: str) -> ProcessedEmail:
    """Retrieve memory context → LLM analysis → store email."""
    # 1. Pull user profile + relevant memories before calling the LLM
    memory_context = ""
    try:
        profile = memory_client.profile(
            container_tag=sanitize_tag(user_email),
            q=f"{email.subject} {email.body[:200]}",
        )
        static = "\n".join(profile.profile.static or [])
        dynamic = "\n".join(profile.profile.dynamic or [])
        memories = "\n".join(
            r.get("memory", "") for r in (profile.search_results.results or [])
        )
        memory_context = (
            f"Static profile:\n{static}\n\n"
            f"Dynamic profile:\n{dynamic}\n\n"
            f"Relevant memories:\n{memories}"
        ).strip()
    except Exception as e:
        print(f"[Supermemory] profile fetch failed: {e}")

    # 2. Analyse with Groq (memory context injected into system prompt)
    result = analyze_email(email, user_name, user_email, memory_context)

    # 3. Store the email for future context (best-effort)
    try:
        store_email_memory(email, user_email)
    except Exception as e:
        print(f"[Supermemory] store failed: {e}")

    return result


# ── Generate Reply Logic ──────────────────────────────────────────────────────

REPLY_SYSTEM_PROMPT = """You are an expert email assistant. Generate a reply to the given email.
Return ONLY a JSON object with this exact schema — no markdown, no preamble:
{
  "subject": "<reply subject starting with Re: >",
  "body": "<full reply body>"
}

Rules:
- Match the requested tone exactly: professional = polished but warm, friendly = casual and upbeat, formal = strict business language, concise = short and to the point.
- If a custom_instruction is given, follow it precisely — it overrides the default intent.
- Always sign off the email using the User's name.
- If memory context is provided, use it to make the reply more personalised and contextually aware.
"""


AUTOPILOT_SYSTEM_PROMPT = """You are an autonomous email agent. Given an analysed email and a list of user-defined rules, decide which actions to take automatically.

Return ONLY a JSON object — no markdown, no preamble:
{
  "email_id": "<string>",
  "should_reply": <true|false>,
  "should_create_event": <true|false>,
  "should_approve_tasks": <true|false>,
  "matched_rule_id": "<rule id string or null>",
  "matched_rule_text": "<rule text string or null>",
  "reasoning": "<one sentence explaining the decision>"
}

Strict rules:
- If a user rule explicitly matches this email (by sender, subject keywords, intent, or priority), honour it exactly and set matched_rule_id + matched_rule_text.
- If no rules match but priority is "urgent", set should_reply=true as a safe default. Set matched_rule_id and matched_rule_text to null.
- If no rules match and priority is NOT "urgent", set all three action flags to false.
- NEVER set should_create_event=true unless has_meeting is true.
- NEVER set should_approve_tasks=true unless has_tasks is true.
- If the rules list is empty, apply the urgent-only default.
- Keep the reasoning field to one concise sentence.
"""


def generate_reply_for_email(req: GenerateReplyRequest) -> GenerateReplyResponse:
    """Fetch Supermemory context → generate tone-aware reply with Groq."""
    # 1. Pull relevant memories for this user + email subject
    memory_context = ""
    try:
        profile = memory_client.profile(
            container_tag=sanitize_tag(req.user_email),
            q=f"{req.subject} {req.body[:200]}",
        )
        static = "\n".join(profile.profile.static or [])
        dynamic = "\n".join(profile.profile.dynamic or [])
        memories = "\n".join(
            r.get("memory", "") for r in (profile.search_results.results or [])
        )
        memory_context = (
            f"Static profile:\n{static}\n\n"
            f"Dynamic profile:\n{dynamic}\n\n"
            f"Relevant past email memories:\n{memories}"
        ).strip()
    except Exception as e:
        print(f"[Supermemory] profile fetch failed (generate-reply): {e}")

    # 2. Build prompt
    system = REPLY_SYSTEM_PROMPT
    if memory_context:
        system += f"\n\n--- User memory context ---\n{memory_context}"

    instruction_line = (
        f"\nCustom instruction: {req.custom_instruction}" if req.custom_instruction else ""
    )
    user_prompt = (
        f"You are acting as the User: {req.user_name} <{req.user_email}>\n"
        f"You are writing a reply TO: {req.sender_name}\n\n"
        f"Original Subject: {req.subject}\n"
        f"Tone: {req.tone}{instruction_line}\n\n"
        f"Original email body:\n{req.body}"
    )

    # 3. Call Groq
    response = llm_client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
        top_p=0.7,
        max_tokens=1024,
    )
    data = json.loads(response.choices[0].message.content)
    return GenerateReplyResponse(
        email_id=req.email_id,
        reply=ReplyContent(subject=data["subject"], body=data["body"]),
    )


# ── Autopilot Decision Logic ───────────────────────────────────────────────────

def decide_autopilot(req: AutopilotRequest) -> AutopilotDecision:
    """Single-shot LLM call to decide which autopilot actions to take for one email."""
    rules_text = (
        "\n".join(f"- [id={r.id}] {r.text}" for r in req.rules)
        if req.rules
        else "No rules defined."
    )

    user_prompt = (
        f"User: {req.user_name} <{req.user_email}>\n\n"
        f"Email ID: {req.email_id}\n"
        f"Subject: {req.subject}\n"
        f"From: {req.sender_name} <{req.sender_email}>\n"
        f"Summary: {req.summary}\n"
        f"Priority: {req.priority_level}\n"
        f"Intent: {req.intent}\n"
        f"Has meeting: {req.has_meeting}\n"
        f"Has tasks: {req.has_tasks}\n\n"
        f"User Rules:\n{rules_text}"
    )

    response = llm_client.chat.completions.create(
        model=LLM_MODEL,
        messages=[
            {"role": "system", "content": AUTOPILOT_SYSTEM_PROMPT},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.1,  # Low temp — deterministic rule matching
        top_p=0.9,
        max_tokens=256,
    )

    try:
        data = json.loads(response.choices[0].message.content)
        data["email_id"] = req.email_id  # Always trust the input ID, never the LLM
        return AutopilotDecision.model_validate(data)
    except (json.JSONDecodeError, Exception) as e:
        print(f"[Autopilot] LLM parse failed: {e}")
        # Safe fallback — no actions taken on parse failure
        return AutopilotDecision(
            email_id=req.email_id,
            should_reply=False,
            should_create_event=False,
            should_approve_tasks=False,
            matched_rule_id=None,
            matched_rule_text=None,
            reasoning="LLM parse error — no actions taken to avoid unintended behaviour.",
        )


# ── FastAPI App ────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    yield

app = FastAPI(
    title="Email AI Processor",
    description="Analyses emails with Groq LLM and persists them in Supermemory.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Tighten in production
    allow_methods=["*"],
    allow_headers=["*"],
)


BATCH_SIZE = 3


@app.post("/process-emails", response_model=ProcessEmailsResponse)
async def process_emails(request: ProcessEmailsRequest):
    if not request.emails:
        raise HTTPException(status_code=400, detail="emails list must not be empty")

    loop = asyncio.get_event_loop()
    all_results: list[ProcessedEmail] = []

    # Process in batches of BATCH_SIZE (3 at a time)
    for i in range(0, len(request.emails), BATCH_SIZE):
        batch = request.emails[i : i + BATCH_SIZE]
        batch_results = await asyncio.gather(*[
            loop.run_in_executor(
                None, process_single, email, request.user_name, request.user_email
            )
            for email in batch
        ])
        all_results.extend(batch_results)

    return ProcessEmailsResponse(processed=all_results)


@app.post("/generate-reply", response_model=GenerateReplyResponse)
async def generate_reply(request: GenerateReplyRequest):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, generate_reply_for_email, request)


@app.post("/autopilot-decide", response_model=AutopilotDecision)
async def autopilot_decide(request: AutopilotRequest):
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, decide_autopilot, request)


@app.get("/health")
async def health():
    return {"status": "ok"}