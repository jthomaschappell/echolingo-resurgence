# QA Checklist: Communication Flows

Manual QA for the vital communication flows described in [CONTEXT.md](./CONTEXT.md):

```
Worker (Web) → Voice → Cerebras → Claude → PostgreSQL
                         ↓
              [All messages] → WhatsApp to Supervisor
                         ↓
    Supervisor replies → Twilio webhook → PostgreSQL → Socket.io → Worker
```

---

## Prerequisites

- [ ] Both servers running: `npm run dev` (port 3000) and `npm run server` (port 3001)
- [ ] `.env` configured with all API keys (Supabase, Cerebras, Claude, Twilio)
- [ ] Twilio WhatsApp sandbox joined; ngrok tunnel active if testing supervisor replies
- [ ] Browser: Chrome or Edge (Web Speech API required)

---

## Flow 1: Worker → Voice → Cerebras → Claude → PostgreSQL

**Scope:** Worker speaks → transcript sent → translated → analyzed → stored in DB.

### 1.1 Voice capture and transcript

| # | Test | Expected | Pass |
|---|------|----------|------|
| 1 | Click mic; grant permission when prompted | Mic permission dialog appears | ☐ |
| 2 | Speak in Mexican Spanish (e.g. "Necesito más cemento") | Spanish transcript appears in UI immediately after stopping | ☐ |
| 3 | Verify transcript accuracy | Text matches what was spoken | ☐ |
| 4 | No speech / very short utterance | Handle gracefully; no crash | ☐ |

### 1.2 Cerebras translation (Spanish → English)

| # | Test | Expected | Pass |
|---|------|----------|------|
| 5 | After transcript, during processing | "Cargando..." loading state visible | ☐ |
| 6 | Processing completes | English translation appears below Spanish in message bubble | ☐ |
| 7 | Technical phrase (e.g. "tubo de PVC") | Reasonable English translation | ☐ |
| 8 | Cerebras API down or key invalid | User-friendly error; no crash | ☐ |

### 1.3 Claude analysis (category, urgency, formatting)

| # | Test | Expected | Pass |
|---|------|----------|------|
| 9 | Normal message (e.g. "Llegaré tarde mañana") | Category assigned (e.g. delay_report); urgency "normal" | ☐ |
| 10 | Urgency keyword: "emergencia", "peligro", "accidente", "lesión" | Orange "URGENTE" badge visible | ☐ |
| 11 | Safety message (e.g. "Hay peligro en la zona") | Category likely "safety"; urgency "high" | ☐ |
| 12 | Message stored | All fields present in Supabase `Message` table | ☐ |

### 1.4 Database persistence

| # | Test | Expected | Pass |
|---|------|----------|------|
| 13 | Send a message; check Supabase | Row in `Message` with `workerId`, `spanishRaw`, `englishRaw`, `englishFormatted`, `category`, `urgency` | ☐ |
| 14 | Message ID returned | API returns `messageId`; UI updates temp message to real ID | ☐ |

---

## Flow 2: WhatsApp to Supervisor

**Scope:** All messages sent to supervisor via Twilio WhatsApp.

### 2.1 Delivery to supervisor

| # | Test | Expected | Pass |
|---|------|----------|------|
| 15 | Worker sends message | Supervisor receives WhatsApp within ~30s | ☐ |
| 16 | Message content | Formatted English (Claude `englishFormatted`), not raw translation | ☐ |
| 17 | Multiple messages in sequence | Each delivered in order | ☐ |
| 18 | Urgent message | Clearly marked for high urgency in WhatsApp | ☐ |

### 2.2 Twilio integration

| # | Test | Expected | Pass |
|---|------|----------|------|
| 19 | `SUPERVISOR_WHATSAPP` set | WhatsApp sent; message updated with `twilioSid` in DB | ☐ |
| 20 | `SUPERVISOR_WHATSAPP` unset | Message still saved; no crash; log indicates skip | ☐ |
| 21 | Twilio credentials invalid | Error logged; message still saved | ☐ |

---

## Flow 3: Supervisor Reply → Twilio Webhook → PostgreSQL → Socket.io → Worker

**Scope:** Supervisor replies via WhatsApp → webhook → DB → real-time push to worker.

### 3.1 Twilio webhook

| # | Test | Expected | Pass |
|---|------|----------|------|
| 22 | Reply to worker message on WhatsApp | Webhook receives POST at `/webhook/twilio` | ☐ |
| 23 | Webhook finds original message | By `twilioSid` or falls back to latest message | ☐ |
| 24 | Reply stored | Row in `SupervisorReply` with `messageId`, `englishRaw`, `spanishTrans`, `actionSummary` | ☐ |
| 25 | Twilio returns 200 + XML | Twilio does not retry; logs show success | ☐ |

### 3.2 Cerebras reply translation (English → Spanish)

| # | Test | Expected | Pass |
|---|------|----------|------|
| 26 | Supervisor replies in English | `spanishTrans` populated in DB | ☐ |
| 27 | Action summary | Claude `extractActionItems` produces Spanish summary | ☐ |

### 3.3 Socket.io delivery to worker

| # | Test | Expected | Pass |
|---|------|----------|------|
| 28 | Worker joined room before reply | Worker receives `supervisor-reply` event without refresh | ☐ |
| 29 | Reply UI | Green box with action summary and Spanish translation | ☐ |
| 30 | Worker ID matches | Only worker who sent original message receives reply | ☐ |
| 31 | Worker reconnects after disconnect | Socket reconnects; `join-worker-room` re-emitted | ☐ |

### 3.4 End-to-end reply flow

| # | Test | Expected | Pass |
|---|------|----------|------|
| 32 | Full flow: Worker sends → Supervisor replies via WhatsApp | Reply appears in worker UI within ~30s | ☐ |
| 33 | Multiple workers | Worker A sends; Worker B sends; Supervisor replies; only correct worker sees reply | ☐ |
| 34 | Reply arrives while worker disconnected | Reply stored in DB; worker does not see it (no history fetch on load—known limitation) | ☐ |

---

## Flow 4: Worker room and Socket.io

**Scope:** Worker joins room; correct routing for replies.

### 4.1 Connection and room

| # | Test | Expected | Pass |
|---|------|----------|------|
| 35 | Page load | Socket connects to `NEXT_PUBLIC_SOCKET_SERVER_URL` | ☐ |
| 36 | Worker ID entered | `join-worker-room` emitted with current `workerId` | ☐ |
| 37 | Worker ID changed | `join-worker-room` emitted again with new ID | ☐ |
| 38 | Server logs | Socket.io logs "Worker X joined room: worker:X" | ☐ |

---

## Flow 5: Error handling and edge cases

| # | Test | Expected | Pass |
|---|------|----------|------|
| 39 | Socket server down | Worker UI does not crash; voice flow still works | ☐ |
| 40 | Missing `workerId` or `spanishText` in API | 400; "Missing workerId or spanishText" | ☐ |
| 41 | Supabase error on insert | 500; message not duplicated; no crash | ☐ |
| 42 | Claude API error | Fallback used; message still saved and sent | ☐ |
| 43 | Webhook: original message not found | 404; Twilio receives XML | ☐ |

---

## Quick smoke test (minimal)

1. Worker speaks → sees transcript and translation.
2. Supervisor receives WhatsApp.
3. Supervisor replies via WhatsApp → worker sees reply without refresh.

---

## Notes

- **Twilio webhook:** Requires ngrok for local testing; URL must be `https://<ngrok>/webhook/twilio`.
- **Worker ID:** Must match for reply routing; ensure Control Panel worker ID is set before sending.
- **Chrome/Edge:** Use a supported browser for Web Speech API.
