<div align="center">

<br />

```
███████╗███╗   ███╗ █████╗ ██╗██╗      █████╗ ███████╗███████╗██╗███████╗████████╗
██╔════╝████╗ ████║██╔══██╗██║██║     ██╔══██╗██╔════╝██╔════╝██║██╔════╝╚══██╔══╝
█████╗  ██╔████╔██║███████║██║██║     ███████║███████╗███████╗██║███████╗   ██║   
██╔══╝  ██║╚██╔╝██║██╔══██║██║██║     ██╔══██║╚════██║╚════██║██║╚════██║   ██║   
███████╗██║ ╚═╝ ██║██║  ██║██║███████╗██║  ██║███████║███████║██║███████║   ██║   
╚══════╝╚═╝     ╚═╝╚═╝  ╚═╝╚═╝╚══════╝╚═╝  ╚═╝╚══════╝╚══════╝╚═╝╚══════╝   ╚═╝  
```

### Agentic AI-Powered Email Intelligence Platform

<br />

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.135+-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://python.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Tailwind](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![NVIDIA NIM](https://img.shields.io/badge/NVIDIA_NIM-Llama_3.3_70b-76B900?style=for-the-badge&logo=nvidia&logoColor=white)](https://build.nvidia.com)
[![Supermemory](https://img.shields.io/badge/Supermemory-Memory_Layer-8B5CF6?style=for-the-badge)](https://supermemory.ai)

<br />

---

**EmailAssist AI** is a full-stack, production-grade agentic email management system. It connects directly to your Gmail inbox, processes emails in real-time using a **Llama-3.3-70b** LLM (via NVIDIA NIM), extracts structured insights — summaries, priorities, meeting events, and tasks — and even operates autonomously via a rule-based **Autopilot** engine. Backed by **Supermemory**, every response is context-aware and personalized based on your email history and communication patterns.

---

</div>

<br />

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Detailed Data Flow](#detailed-data-flow)
- [Features](#features)
- [MongoDB Data Schema](#mongodb-data-schema)
- [API Reference](#api-reference)
- [Tech Stack](#tech-stack)
- [Repository Structure](#repository-structure)
- [Environment Variables](#environment-variables)
- [Installation & Setup](#installation--setup)

---

## Architecture Overview

The system is split into two independent services that communicate over HTTP. Both services are designed to run locally (or in Docker) and are coordinated by the Next.js frontend acting as the application orchestrator.

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           CLIENT BROWSER                                         │
│                    http://localhost:3000                                          │
│                                                                                  │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                  NEXT.JS 15 APP (App Router)                               │  │
│  │                                                                            │  │
│  │   ┌─────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  │  │
│  │   │  /           │  │  /dashboard  │  │  /calendar   │  │  /tasks      │  │  │
│  │   │  Login Page  │  │  Main View   │  │  Cal View    │  │  Task View   │  │  │
│  │   └─────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  │  │
│  │                                                                            │  │
│  │   [Next-Auth v5 Session Layer — JWT Strategy]                              │  │
│  │   [Google OAuth2 — gmail.readonly, gmail.send, calendar.events scopes]     │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
└───────────┬─────────────────────────────────┬───────────────────────────────────┘
            │ API Routes (Server Actions)      │ External API Calls
            ▼                                 ▼
┌───────────────────────┐         ┌───────────────────────┐
│   MONGODB DATABASE    │         │   GOOGLE APIS         │
│   localhost:27017     │         │   (googleapis SDK)    │
│                       │         │                       │
│   ProcessedEmail      │         │   Gmail API v1        │
│   AutopilotLog        │         │   Calendar API v3     │
│   User                │         └───────────────────────┘
│   UserPreferences     │
│   Task                │                    │
└───────────────────────┘                    │ HTTP POST
                                             ▼
                              ┌──────────────────────────────┐
                              │   FASTAPI AI BACKEND         │
                              │   http://localhost:8000      │
                              │                              │
                              │   POST /process-emails       │
                              │   POST /generate-reply       │
                              │   POST /autopilot-decide     │
                              │   GET  /health               │
                              │                              │
                              │   ┌──────────────────────┐  │
                              │   │  NVIDIA NIM (Groq)   │  │
                              │   │  Llama-3.3-70b       │  │
                              │   └──────────────────────┘  │
                              │                              │
                              │   ┌──────────────────────┐  │
                              │   │  SUPERMEMORY API     │  │
                              │   │  User Memory Layer   │  │
                              │   └──────────────────────┘  │
                              └──────────────────────────────┘
```

---

## Detailed Data Flow

### Flow 1: Email Ingestion & AI Analysis

This is the primary pipeline. It runs when the user clicks "Process Emails" in the dashboard.

```
[User] ──▶ [Next.js Dashboard] ──▶ [/api/dashboard/process-emails]
                                              │
                                              │ 1. Get user session (Next-Auth JWT)
                                              │    Extract: accessToken, user.email
                                              │
                                              │ 2. Fetch unread emails from Gmail
                                              │    (lib/gmail.js → fetchUnreadEmails)
                                              │    - Filter: promotions / social / spam
                                              │    - Filter: noreply / automated senders
                                              │    - Extract: subject, sender, body
                                              │    - Sanitize body: strip HTML tags,
                                              │      remove base64 blobs, truncate @4000 chars
                                              │
                                              │ 3. Cross-reference with MongoDB
                                              │    - Check ProcessedEmail.emailId
                                              │    - Skip already-processed emails (idempotent)
                                              │
                                              ▼
                              [FastAPI: POST /process-emails]
                                              │
                              Payload: { emails: [...], user_name, user_email }
                                              │
                              ┌───────────────▼──────────────────┐
                              │   Batch Processor (3 at a time)  │
                              │   asyncio.gather() per batch     │
                              └───────────────┬──────────────────┘
                                              │
                              For each email simultaneously:
                                              │
                                    ┌─────────▼─────────┐
                                    │   SUPERMEMORY      │
                                    │   .profile()       │
                                    │   query: subject + │
                                    │   body[:200]       │
                                    │                    │
                                    │   Returns:         │
                                    │   - Static profile │
                                    │   - Dynamic profile│
                                    │   - Relevant past  │
                                    │     email memories │
                                    └─────────┬─────────┘
                                              │ Memory Context
                                              ▼
                                    ┌─────────────────────┐
                                    │   NVIDIA NIM API    │
                                    │   Llama-3.3-70b     │
                                    │   JSON Mode         │
                                    │   temp=0.2          │
                                    │   max_tokens=1024   │
                                    │                     │
                                    │   System Prompt:    │
                                    │   + Memory Context  │
                                    │   + User Identity   │
                                    │   + Email Content   │
                                    └─────────┬───────────┘
                                              │
                              Returns validated JSON (ProcessedEmail):
                              {
                                email_id,
                                summary,         ← one-sentence
                                priority: {
                                  level,          ← urgent|requires_action|fyi
                                  reasons: [...]
                                },
                                intent,           ← meeting_request|follow_up|...
                                has_meeting,      ← boolean
                                has_tasks,        ← boolean
                                suggested_reply: { subject, body },
                                calendar_event: { title, date, time, ... } | null,
                                tasks: [{ title, deadline, priority }]
                              }
                                              │
                              Email stored in Supermemory for future context
                                              │
                                              ▼
                              [Next.js API Route receives results]
                                              │
                                    ┌─────────▼──────────────────┐
                                    │    MONGODB WRITE           │
                                    │    ProcessedEmail.upsert() │
                                    │    + action state flags:   │
                                    │       replySent: false     │
                                    │       calendarCreated:false│
                                    │       tasksApproved: false │
                                    └─────────┬──────────────────┘
                                              │
                                              ▼
                              [Dashboard re-renders with structured data]
```

---

### Flow 2: Autopilot Engine

The Autopilot engine allows users to define natural language rules. The LLM then decides autonomously which actions to execute — no user click required.

```
[User defines Autopilot Rules]
 e.g. "Reply formally to any email from investors"
 e.g. "If an email has meeting in subject, auto-create calendar event"

             │
             │  Rules stored in UserPreferences / passed at runtime
             ▼
[Next.js: POST /api/autopilot/run]
             │
             │  For each ProcessedEmail where no AutopilotLog exists:
             ▼
[FastAPI: POST /autopilot-decide]

Payload: {
  email_id, subject, sender_name, sender_email,
  summary, priority_level, intent,
  has_meeting, has_tasks, suggested_reply_body,
  user_name, user_email,
  rules: [{ id, text }, ...]
}

             │
             ▼
┌────────────────────────────────────────────────────────┐
│   NVIDIA NIM: Llama-3.3-70b                            │
│   AUTOPILOT_SYSTEM_PROMPT (temp=0.1, deterministic)    │
│                                                        │
│   Decision Logic:                                      │
│   1. If rule explicitly matches → honour rule + log    │
│   2. If no match + priority=urgent → should_reply=true │
│   3. If no match + not urgent → all flags = false      │
│                                                        │
│   Constraint enforcement:                              │
│   - should_create_event only if has_meeting=true       │
│   - should_approve_tasks only if has_tasks=true        │
└──────────────────────┬─────────────────────────────────┘
                       │
              Returns: AutopilotDecision {
                should_reply: bool,
                should_create_event: bool,
                should_approve_tasks: bool,
                matched_rule_id: str | null,
                matched_rule_text: str | null,
                reasoning: str (one sentence)
              }
                       │
           ┌───────────┼───────────┐
           │           │           │
           ▼           ▼           ▼
    [Send Reply]  [Create      [Approve
                   Calendar     Tasks]
                   Event]
           │           │           │
           ▼           ▼           ▼
    Gmail API    Google Cal    MongoDB
    .send()      API .insert() Task update
           │           │           │
           └───────────┴─────┬─────┘
                             │
                             ▼
                  MongoDB: AutopilotLog.upsert()
                  (unique index: userId + emailId)
                  {
                    replySent, eventCreated,
                    tasksApproved,
                    matchedRuleId, matchedRuleText,
                    reasoning, status
                  }
```

---

### Flow 3: Manual Reply Generation

```
[User clicks "Regenerate Reply" in ReplyCard]
             │
             │  Selects tone: professional | friendly | formal | concise
             │  Optionally writes custom instruction
             ▼
[Next.js Server Action: actions/sendReply.js]
             │
             ▼
[FastAPI: POST /generate-reply]

Payload: {
  email_id, subject, sender_name, body,
  tone, user_name, user_email,
  custom_instruction (optional)
}

             │
             ▼
┌────────────────────────────────────────────────────────┐
│   SUPERMEMORY .profile()                               │
│   Query: subject + body[:200]                          │
│   Returns: static + dynamic profile + past memories   │
└──────────────────────┬─────────────────────────────────┘
                       │ Memory injected into system prompt
                       ▼
┌────────────────────────────────────────────────────────┐
│   NVIDIA NIM: Llama-3.3-70b                            │
│   REPLY_SYSTEM_PROMPT + Memory Context                 │
│   temp=0.4, max_tokens=1024                            │
│                                                        │
│   Tone rules:                                          │
│   professional → polished but warm                     │
│   friendly     → casual and upbeat                     │
│   formal       → strict business language              │
│   concise      → short and to the point                │
│                                                        │
│   custom_instruction overrides default tone intent     │
└──────────────────────┬─────────────────────────────────┘
                       │
              Returns: { subject: "Re: ...", body: "..." }
                       │
                       ▼
              [User reviews in ReplyCard UI]
                       │
              [User clicks "Send Reply"]
                       │
                       ▼
              [lib/gmail.js: sendEmailReply()]
              Builds RFC 2822 encoded email
              → Gmail API users.messages.send()
                       │
                       ▼
              [MongoDB: ProcessedEmail.replySent = true]
```

---

### Flow 4: Calendar Event Creation

```
[User clicks "Create Event" or Autopilot triggers]
             │
             ▼
[Next.js Server Action: actions/createCalendarEvent.js]
             │
             │  Data source: ProcessedEmail.calendarEvent {
             │    title, date, time, participants, description
             │  }
             ▼
[lib/calendar.js → Google Calendar API v3]
             │
             │  calendar.events.insert({
             │    calendarId: 'primary',
             │    summary, description,
             │    start: { dateTime },
             │    end: { dateTime + 1hr },
             │    attendees: [{ email }...]
             │  })
             ▼
[MongoDB: ProcessedEmail.calendarCreated = true]
```

---

## Features

### Intelligent Email Analysis

The AI backend analyses every email and returns a structured, typed JSON object validated by Pydantic. The result is persisted to MongoDB and displayed in the dashboard with no manual effort.

| Field | Type | Description |
|---|---|---|
| `summary` | `string` | One-sentence summary of the email |
| `priority.level` | `urgent \| requires_action \| fyi` | AI-assigned priority with evidence |
| `priority.reasons` | `string[]` | Bullet-point evidence for the label |
| `intent` | `string` | Classified intent label |
| `has_meeting` | `boolean` | Whether a meeting is proposed |
| `has_tasks` | `boolean` | Whether action items exist |
| `suggested_reply` | `{ subject, body }` | Draft reply with full body |
| `calendar_event` | `object \| null` | Structured Calendar event data |
| `tasks` | `Task[]` | Extracted task list with deadlines |

---

### Supermemory — Long-Term Context Engine

EmailAssist does not treat every email in isolation. It builds a persistent, per-user memory profile through Supermemory. Each processed email is stored in a user-scoped container (keyed by sanitized email address). Before every LLM call, the system fetches:

- **Static Profile** — factual user attributes (name, role, communication style)
- **Dynamic Profile** — evolving patterns inferred from recent emails
- **Relevant Memories** — semantically similar past emails to the current one

This context is injected directly into the LLM system prompt, making every summary, reply draft, and autopilot decision aware of who the user is and how they communicate.

---

### Autopilot Engine — Rule-Based Autonomous Action

Users define natural language rules from the Autopilot panel. The LLM evaluates each incoming email against these rules and decides which combination of actions to execute automatically:

```
Rule → "Reply formally to any email from my CEO"
      + Email from: ceo@company.com → should_reply: true

Rule → "Create a calendar event for any meeting invitation"
      + Email: has_meeting=true  → should_create_event: true

Rule → "Approve all tasks from the engineering team"
      + Email: from=engineering  → should_approve_tasks: true
```

All decisions are logged to the `AutopilotLog` MongoDB collection with a unique compound index `(userId, emailId)` to guarantee idempotency — the same email is never actioned twice.

---

### Gmail Integration — Smart Filtering

The Gmail client (`lib/gmail.js`) applies multi-level filtering before any email reaches the AI:

- Skips `CATEGORY_PROMOTIONS`, `CATEGORY_SOCIAL`, `SPAM` labels
- Skips `noreply`, `no-reply`, `donotreply`, `notifications`, `mailer-daemon` senders  
- Strips HTML tags, base64 blobs, CID image references from bodies
- Truncates bodies at 4,000 characters to stay within LLM token limits
- Parses `From:` headers into structured `{ name, email }` objects

---

### Tone-Aware Reply Generation

The `/generate-reply` endpoint supports four tones, overridable with a custom instruction at runtime:

| Tone | Behaviour |
|---|---|
| `professional` | Polished, warm, businesslike |
| `friendly` | Casual, upbeat, approachable |
| `formal` | Strict business language, no contractions |
| `concise` | Short, action-focused, minimal words |

Custom instructions override the default tone intent and are injected as explicit constraints into the LLM prompt.

---

### Bento Grid Dashboard

The frontend dashboard is built as a non-linear Bento Grid layout. Each email card expands to show:

- `SummaryCard` — Priority badge + one-sentence summary
- `ReplyCard` — Editable reply draft with tone selector
- `CalendarCard` — Event preview with date, time, participants
- `TaskCard` — Extracted tasks with deadlines and priority badges
- `ActionPanel` — One-click buttons for reply / event / task actions
- `AutopilotPanel` — Rule manager + execution log viewer

---

## MongoDB Data Schema

### Collection: `ProcessedEmail`

```
ProcessedEmail {
  emailId          String   (unique, Gmail message ID)
  userId           String   (user email address)
  subject          String
  senderName       String
  senderEmail      String
  body             String
  timestamp        String   (ISO 8601)

  -- AI Generated --
  summary          String
  priority {
    level          "urgent" | "requires_action" | "fyi"
    reasons        String[]
  }
  intent           String
  suggestedReply {
    subject        String
    body           String
  }
  calendarEvent {
    title          String
    date           String | null   (YYYY-MM-DD)
    time           String | null   (HH:MM)
    participants   String[]
    description    String
  }
  tasks [{
    title          String
    deadline       String | null   (YYYY-MM-DD)
    priority       "high" | "medium" | "low"
  }]

  hasMeeting       Boolean  (default: false)
  hasTasks         Boolean  (default: false)

  -- Action State Flags --
  replySent        Boolean  (default: false)
  calendarCreated  Boolean  (default: false)
  tasksApproved    Boolean  (default: false)

  processedAt      String   (ISO 8601)
  createdAt        Date
  updatedAt        Date
}
```

### Collection: `AutopilotLog`

```
AutopilotLog {
  userId           String   (required)
  emailId          String   (required)
  emailSubject     String
  senderName       String

  -- Executed Actions --
  replySent        Boolean  (default: false)
  eventCreated     Boolean  (default: false)
  tasksApproved    Boolean  (default: false)

  -- Rule Match --
  matchedRuleId    String | null
  matchedRuleText  String | null
  reasoning        String   (one sentence from LLM)

  status           "success" | "skipped" | "error"
  errorMessage     String | null

  processedAt      String   (ISO 8601)

  Index: { userId: 1, emailId: 1 } UNIQUE   ← idempotency guarantee
}
```

### Collection: `User`

```
User {
  email            String   (unique)
  name             String
  image            String
  createdAt        Date
}
```

### Collection: `UserPreferences`

```
UserPreferences {
  userId           String   (unique)
  autopilotRules [{
    id             String   (client UUID)
    text           String   (natural language rule)
  }]
  updatedAt        Date
}
```

### Collection: `Task`

```
Task {
  emailId          String
  userId           String
  title            String
  deadline         String | null
  priority         "high" | "medium" | "low"
  status           "pending" | "approved" | "done"
  createdAt        Date
}
```

---

## API Reference

### FastAPI Backend — `http://localhost:8000`

#### `GET /health`

Returns server status.

```json
{ "status": "ok" }
```

---

#### `POST /process-emails`

Analyze a batch of emails with LLM + Supermemory context.

**Request Body:**
```json
{
  "emails": [
    {
      "email_id": "18abc123def",
      "subject": "Project Kickoff Tomorrow",
      "sender_name": "Sarah Chen",
      "sender_email": "sarah@company.com",
      "body": "Hi, just confirming the kickoff meeting tomorrow at 10 AM...",
      "timestamp": "2026-03-23T14:30:00Z"
    }
  ],
  "user_name": "John Doe",
  "user_email": "john@gmail.com"
}
```

**Response:**
```json
{
  "processed": [
    {
      "email_id": "18abc123def",
      "summary": "Sarah confirms the project kickoff meeting scheduled for tomorrow at 10 AM.",
      "priority": {
        "level": "requires_action",
        "reasons": ["Meeting confirmation requires calendar action", "Time-sensitive tomorrow schedule"]
      },
      "intent": "meeting_request",
      "has_meeting": true,
      "has_tasks": false,
      "suggested_reply": {
        "subject": "Re: Project Kickoff Tomorrow",
        "body": "Hi Sarah,\n\nThank you for confirming. I have noted the kickoff meeting at 10 AM..."
      },
      "calendar_event": {
        "title": "Project Kickoff",
        "date": "2026-03-24",
        "time": "10:00",
        "participants": ["sarah@company.com", "john@gmail.com"],
        "description": "Kickoff meeting as confirmed via email."
      },
      "tasks": [],
      "reply_sent": false,
      "calendar_created": false,
      "tasks_approved": false,
      "processed_at": "2026-03-23T15:00:00Z"
    }
  ]
}
```

---

#### `POST /generate-reply`

Generate a tone-aware, memory-enriched email reply.

**Request Body:**
```json
{
  "email_id": "18abc123def",
  "subject": "Project Kickoff Tomorrow",
  "sender_name": "Sarah Chen",
  "body": "Hi, just confirming the kickoff meeting at 10 AM...",
  "tone": "professional",
  "user_name": "John Doe",
  "user_email": "john@gmail.com",
  "custom_instruction": "Mention that I will prepare the slides beforehand."
}
```

**Response:**
```json
{
  "email_id": "18abc123def",
  "reply": {
    "subject": "Re: Project Kickoff Tomorrow",
    "body": "Hi Sarah,\n\nThank you for confirming. I will have the slides prepared before we begin tomorrow at 10 AM.\n\nBest,\nJohn Doe"
  }
}
```

---

#### `POST /autopilot-decide`

Let the LLM decide which actions to take based on user rules.

**Request Body:**
```json
{
  "email_id": "18abc123def",
  "subject": "Project Kickoff Tomorrow",
  "sender_name": "Sarah Chen",
  "sender_email": "sarah@company.com",
  "summary": "Sarah confirms the project kickoff meeting.",
  "priority_level": "requires_action",
  "intent": "meeting_request",
  "has_meeting": true,
  "has_tasks": false,
  "suggested_reply_body": "Hi Sarah, confirmed for 10 AM...",
  "user_name": "John Doe",
  "user_email": "john@gmail.com",
  "rules": [
    { "id": "rule-001", "text": "Create a calendar event for all meeting confirmations" }
  ]
}
```

**Response:**
```json
{
  "email_id": "18abc123def",
  "should_reply": false,
  "should_create_event": true,
  "should_approve_tasks": false,
  "matched_rule_id": "rule-001",
  "matched_rule_text": "Create a calendar event for all meeting confirmations",
  "reasoning": "Email matches the meeting confirmation rule; calendar event will be created automatically."
}
```

---

## Tech Stack

### Frontend

| Technology | Version | Role |
|---|---|---|
| Next.js | 15.x (App Router) | Full-stack React framework, routing, server actions |
| React | 19.x | UI component library |
| Tailwind CSS | v4 | Utility-first styling with JIT compilation |
| Next-Auth | v5-beta | Google OAuth2 session management (JWT strategy) |
| googleapis | v171 | Gmail API + Calendar API SDK |
| mongoose | v9 | MongoDB ODM |
| nanoid | v5 | Autopilot rule ID generation |

### AI Backend

| Technology | Version | Role |
|---|---|---|
| FastAPI | 0.135+ | Async HTTP API framework |
| Pydantic | v2 | Strict request/response validation and model parsing |
| NVIDIA NIM | — | High-performance LLM inference endpoint |
| Llama-3.3-70b-instruct | — | Core reasoning and language model |
| Supermemory | v3.30+ | Persistent per-user email memory and profile |
| openai (SDK) | v2.29+ | NIM-compatible OpenAI client |
| uvicorn | 0.42+ | ASGI production server |
| python-dotenv | v1.2+ | Environment variable management |
| uv | latest | Ultra-fast Python package manager |

### Infrastructure

| Component | Technology |
|---|---|
| Database | MongoDB 7.0 (local or Atlas) |
| Email Source | Gmail API v1 |
| Calendar | Google Calendar API v3 |
| Auth Provider | Google OAuth2 (openid, email, profile, gmail, calendar) |

---

## Repository Structure

```
Auro-Strawhats/submissions/
│
├── emailassist/                        # Next.js Frontend Application
│   │
│   ├── app/
│   │   ├── layout.js                   # Root layout with session provider
│   │   ├── page.js                     # Login page (Google Sign-In)
│   │   ├── Providers.js                # Next-Auth SessionProvider wrapper
│   │   ├── globals.css                 # Global styles
│   │   ├── api/                        # Next.js API route handlers
│   │   ├── dashboard/                  # Main email dashboard view
│   │   ├── calendar/                   # Calendar view
│   │   └── tasks/                      # Task management view
│   │
│   ├── components/
│   │   ├── ActionPanel.js              # Send/Create/Approve action buttons
│   │   ├── AutopilotPanel.js           # Rule manager + execution log viewer
│   │   ├── CalendarCard.js             # Meeting event preview card
│   │   ├── EmailList.js                # Scrollable email list sidebar
│   │   ├── Navbar.js                   # Top navigation bar
│   │   ├── ReplyCard.js                # Editable reply draft + tone selector
│   │   ├── SummaryCard.js              # Priority badge + summary display
│   │   ├── TaskCard.js                 # Task list with deadlines
│   │   └── landing/                    # Landing page components
│   │       ├── LandingPage.jsx         # Main landing hero section
│   │       ├── BentoGrid.jsx           # Feature grid component
│   │       └── IntegrationsBeam.jsx    # Integration visualization
│   │
│   ├── actions/
│   │   ├── sendReply.js                # Gmail reply server action
│   │   ├── createCalendarEvent.js      # Google Calendar insert server action
│   │   ├── approveTasks.js             # Task approval + MongoDB update
│   │   └── updateTaskStatus.js         # Individual task status update
│   │
│   ├── lib/
│   │   ├── auth.js                     # Next-Auth full config (DB callbacks)
│   │   ├── gmail.js                    # Gmail API client + email parser
│   │   ├── calendar.js                 # Google Calendar API client
│   │   └── mongodb.js                  # Mongoose connection singleton
│   │
│   ├── models/
│   │   ├── ProcessedEmail.js           # Core email + AI result schema
│   │   ├── AutopilotLog.js             # Autopilot execution log schema
│   │   ├── User.js                     # User model
│   │   ├── UserPreferences.js          # Autopilot rules storage
│   │   └── Task.js                     # Standalone task model
│   │
│   ├── auth.config.js                  # Edge-safe auth config (middleware)
│   ├── middleware.js                   # Next.js route protection
│   ├── next.config.mjs                 # Next.js configuration
│   ├── jsconfig.json                   # JS path aliases
│   └── package.json                    # Dependencies
│
└── Auro University/                    # FastAPI AI Backend
    │
    ├── main.py                         # All endpoints + LLM logic (single file)
    ├── pyproject.toml                  # uv project manifest + dependencies
    ├── uv.lock                         # Dependency lockfile
    ├── .python-version                 # Python 3.12 pin
    └── .env                            # API keys (not committed)
```

---

## Environment Variables

### Frontend — `emailassist/.env.local`

```env
# ── Google OAuth (from Google Cloud Console) ─────────────────────────────────
GOOGLE_CLIENT_ID=your_google_client_id_here
GOOGLE_CLIENT_SECRET=your_google_client_secret_here

# ── Next-Auth ─────────────────────────────────────────────────────────────────
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET=your_32_character_random_secret
NEXTAUTH_URL=http://localhost:3000

# ── MongoDB ───────────────────────────────────────────────────────────────────
MONGODB_URI=mongodb://127.0.0.1:27017/emailassist

# ── AI Backend ────────────────────────────────────────────────────────────────
FASTAPI_URL=http://127.0.0.1:8000
```

### AI Backend — `Auro University/.env`

```env
# ── NVIDIA NIM (from build.nvidia.com) ───────────────────────────────────────
NVIDIA_NIM_API_KEY=your_nvidia_nim_api_key_here

# ── Supermemory (from supermemory.ai) ────────────────────────────────────────
SUPERMEMORY_API_KEY=your_supermemory_api_key_here
```

> **Google OAuth Scopes Required**
>
> When creating your Google Cloud Console OAuth2 credentials, enable the following APIs and scopes:
> - `Gmail API` — `gmail.readonly`, `gmail.send`
> - `Google Calendar API` — `calendar.events`
>
> Set Authorized Redirect URI to: `http://localhost:3000/api/auth/callback/google`

---

## Installation & Setup

### Prerequisites

| Requirement | Version | Install |
|---|---|---|
| Node.js | 18.x or 20.x LTS | [nodejs.org](https://nodejs.org) |
| Python | 3.12+ | [python.org](https://python.org) |
| uv | latest | `pip install uv` |
| MongoDB | 7.0 | [mongodb.com/try/download](https://www.mongodb.com/try/download/community) |

---

### Step 1: Clone the Repository

```bash
git clone https://github.com/your-org/emailassist-ai.git
cd emailassist-ai/submissions
```

---

### Step 2: Setup the AI Backend

```bash
cd "Auro University"
```

Create and activate the virtual environment, then install dependencies using `uv`:

```bash
# Create the venv (Python 3.12 will be used per .python-version)
uv venv

# Activate — Windows (PowerShell)
.venv\Scripts\Activate.ps1

# Activate — macOS / Linux
source .venv/bin/activate

# Sync all dependencies from lockfile
uv sync
```

Create the environment file:

```bash
# Windows
copy .env.example .env

# macOS / Linux
cp .env.example .env
```

Edit `.env` and fill in your API keys:

```env
NVIDIA_NIM_API_KEY=nvapi-...
SUPERMEMORY_API_KEY=sm-...
```

Start the AI backend server:

```bash
uv run python main.py
```

The backend will be available at `http://localhost:8000`. Verify:

```bash
curl http://localhost:8000/health
# → {"status":"ok"}
```

---

### Step 3: Setup the Frontend

```bash
cd ../emailassist
```

Install Node.js dependencies:

```bash
npm install
```

Create the environment file:

```bash
# Windows
copy .env.local.example .env.local

# macOS / Linux
cp .env.local.example .env.local
```

Edit `.env.local` with your credentials:

```env
GOOGLE_CLIENT_ID=603562959621-...
GOOGLE_CLIENT_SECRET=GOCSPX-...
NEXTAUTH_SECRET=<output of: openssl rand -base64 32>
NEXTAUTH_URL=http://localhost:3000
MONGODB_URI=mongodb://127.0.0.1:27017/emailassist
FASTAPI_URL=http://127.0.0.1:8000
```

Ensure MongoDB is running locally:

```bash
# Windows — start MongoDB service
net start MongoDB

# macOS / Linux
mongod --dbpath /data/db
```

Start the Next.js development server:

```bash
npm run dev
```

The application is now available at `http://localhost:3000`.

---

### Step 4: Verify the Full Stack

Open `http://localhost:3000` in a browser. You should see the EmailAssist login page. Click "Continue with Google", authorize the required Gmail and Calendar scopes, and land on the dashboard. Click "Process Emails" to trigger the full pipeline.

```
localhost:3000  →  Google OAuth  →  Gmail API  →  FastAPI:8000  →  NVIDIA NIM  →  Supermemory  →  MongoDB  →  Dashboard
```

---

### Production Build

To build the Next.js app for production:

```bash
npm run build
npm run start
```

For the Python backend, deploy with uvicorn behind a reverse proxy (e.g., Nginx):

```bash
uv run uvicorn main:app --host 0.0.0.0 --port 8000 --workers 4
```

---

<div align="center">

---

Built by the **Auro-Strawhats** Team · Auro University

[![Python](https://img.shields.io/badge/Python-3.12-3776AB?style=flat-square&logo=python)](https://python.org)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb)](https://mongodb.com)
[![NVIDIA](https://img.shields.io/badge/NVIDIA_NIM-76B900?style=flat-square&logo=nvidia)](https://build.nvidia.com)

</div>
