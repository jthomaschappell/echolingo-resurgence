# QA Checklist: Supply Intelligence Agent

Manual QA for the supply intelligence feature added in PR #4.

```
Worker (Voice) → Cerebras → Claude (material_need) → Supply Agent Pipeline
                                                        ↓
                                          Detect → Extract → History → Format
                                                                         ↓
                                                              WhatsApp [REQ-xxxx]
                                                                         ↓
                                              Supervisor replies APPROVE/MODIFY/REJECT/ASK
                                                                         ↓
                                                     Approval Handler → Supabase → Socket.io → Worker
```

---

## How to Use This QA Sheet

1. **Go top to bottom.** Complete the Prerequisites first, then work through each Flow in order.
2. **For each test row:** do what the "Test" column says, then check if the "Expected" result happened.
3. **Mark the Pass column:** ✅ if it worked, ❌ if it didn't.
4. **If something fails:** note what actually happened next to the ❌ — this helps debug later.
5. **Smoke Tests at the bottom** are end-to-end walkthroughs — do these last as a final check.
6. **You don't need to test everything** — at minimum, do the Prerequisites + Smoke Tests A and C. The individual Flow tests are for deeper debugging if something goes wrong.

---

## Prerequisites

- [ ] Node 20 active: `nvm use --delete-prefix v20.11.0`
- [ ] `npm install` completed
- [ ] Both servers running: `npm run dev` (port 3000) and `npm run server` (port 3001)
- [ ] `.env` configured with all API keys (Supabase, Cerebras, Claude, Twilio)
- [ ] Supabase tables created: run `supabase/schema.sql` then `supabase/supply-tables.sql` in SQL Editor
- [ ] Seed data loaded: run the sample data SQL in Supabase SQL Editor, or `npx tsx supabase/seed-supply.ts`
- [ ] Worker ID set to `crew-A` in the Control Panel (matches seed data)
- [ ] Twilio WhatsApp sandbox joined; ngrok tunnel active for webhook testing

### Sample Data Summary

| Table | Key Records |
|-------|-------------|
| `Message` | 3 rows: worker-01 (concrete, high), worker-02 (damaged delivery, urgent), worker-03 (gloves, normal) |
| `SupervisorReply` | 2 rows: concrete approved, damaged delivery follow-up |
| `SupplyOrder` | 2 rows: crew-A concrete (10 yards, $2500), crew-B gloves (50 pairs, $320) |
| `SupplyRequest` | 3 rows: crew-A concrete APPROVED, crew-B gloves PENDING, crew-C lumber REJECTED |

### Crew/Worker Mapping for Demo

| Worker ID | Crew ID | Has History For |
|-----------|---------|-----------------|
| worker-01 | crew-A | Concrete |
| worker-03 | crew-B | Gloves |
| worker-09 | crew-C | (none — lumber request was rejected) |

**Important:** Set your Control Panel worker ID to a **crew ID** (e.g. `crew-A`) for history to match, since the supply agent uses workerId as the crew lookup key.

---

## Known TypeScript Issues (pre-existing, not from our code)

| # | File | Issue | Impact |
|---|------|-------|--------|
| 1 | `context/LanguageContext.tsx:25` | `translations` type mismatch between `en` and `es` literal types | Build warning only — runtime OK |
| 2 | `lib/claude.ts:59` | `urgency` string not narrowed to `'normal' \| 'high'` union | Build warning only — runtime OK |

---

## Flow 1: Supply Detection Gate

**Scope:** Only `material_need` messages trigger the supply agent.

| # | Test | Expected | Pass |
|---|------|----------|------|
| 1 | Send supply message: "necesitamos más concreto en la zona norte" | Claude categorizes as `material_need` | ☐ |
| 2 | Send non-supply message: "llegaré tarde mañana" | Claude categorizes as `delay_report` or similar | ☐ |
| 3 | Check server logs for test #2 | Log shows "skipping supply agent" | ☐ |
| 4 | Check server logs for test #1 | Log shows "Material need detected, running supply agent..." | ☐ |

---

## Flow 2: Entity Extraction

**Scope:** Cerebras LLM extracts item, quantity, unit, urgency from the message.

| # | Test | Expected | Pass |
|---|------|----------|------|
| 5 | Message with explicit quantity: "necesitamos 50 pares de guantes" | Entities: item=gloves, quantity=50, unit=pairs | ☐ |
| 6 | Message without quantity: "se acabó el concreto" | Entities: item=concrete, quantity=null | ☐ |
| 7 | Item normalization: "guantes" | normalizedItem = `gloves` | ☐ |
| 8 | Unit normalization: "pares" | unit = `pairs` | ☐ |
| 9 | Urgency detection: "urgente necesitamos cemento" | urgency = `high` or `critical` | ☐ |

---

## Flow 3: History Lookup

**Scope:** Agent queries `SupplyOrder` table for crew's prior orders.

| # | Test | Expected | Pass |
|---|------|----------|------|
| 10 | Worker ID = `crew-A`, request concrete | History: 1 order, 10 qty, Best Concrete Co, $2500 | ☐ |
| 11 | Worker ID = `crew-B`, request gloves | History: 1 order, 50 qty, Safety Supply, $320 | ☐ |
| 12 | Worker ID = `crew-A`, request gloves | History: 0 orders (crew-A has no glove orders) | ☐ |
| 13 | Worker ID = `crew-C` or unknown | History: 0 orders | ☐ |
| 14 | Check DB: Supabase `SupplyOrder` table | 2 seed rows present | ☐ |

---

## Flow 4: WhatsApp Formatting

**Scope:** Agent builds formatted supply request with [REQ-xxxx] ID.

| # | Test | Expected | Pass |
|---|------|----------|------|
| 15 | Supply request with history match (crew-A + concrete) | Message includes history section with qty, supplier, cost | ☐ |
| 16 | Supply request without history (crew-A + gloves) | Message omits history section | ☐ |
| 17 | Request ID embedded | Header shows `SUPPLY REQUEST [REQ-xxxx]` (last 4 chars of UUID) | ☐ |
| 18 | Urgency emoji | Critical = 🔴, High = 🟡, Normal = 🟢 | ☐ |
| 19 | Quantity fallback | If no explicit qty, uses history average (10 for crew-A concrete) | ☐ |
| 20 | Supplier suggestion | Shows Best Concrete Co (from history) for crew-A concrete | ☐ |
| 21 | Reply instructions | Footer shows "Reply: APPROVE / MODIFY [qty] / REJECT [reason] / ASK [question]" | ☐ |
| 22 | Supervisor receives WhatsApp | Formatted message arrives on supervisor's phone | ☐ |

---

## Flow 5: Database Persistence (SupplyRequest)

**Scope:** Supply requests are saved to `SupplyRequest` table.

| # | Test | Expected | Pass |
|---|------|----------|------|
| 23 | Send supply message | New row in `SupplyRequest` with status=PENDING | ☐ |
| 24 | Check fields | `crewId`, `workerId`, `item`, `normalizedItem`, `suggestedSupplier`, `estimatedTotal` populated | ☐ |
| 25 | `originalMessageId` FK | References the `Message` row from the same request | ☐ |
| 26 | API response | Returns `supplyRequestId` in JSON | ☐ |

---

## Flow 6: Approval Commands

**Scope:** Supervisor replies with APPROVE/MODIFY/REJECT/ASK via WhatsApp.

**Note:** The sample data already has a PENDING gloves request (`ccccccc2`). You can test approval commands against it, or create a new one first.

### 6.1 APPROVE

| # | Test | Expected | Pass |
|---|------|----------|------|
| 27 | Reply "APPROVE" | SupplyRequest status → APPROVED, approvedBy, approvedAt set | ☐ |
| 28 | Worker notification | Worker receives `supply-request-update` via Socket.io | ☐ |
| 29 | Spanish translation | Worker sees notification in Spanish | ☐ |

### 6.2 MODIFY

| # | Test | Expected | Pass |
|---|------|----------|------|
| 30 | Reply "MODIFY 300" | Status → MODIFIED, modifiedQuantity=300 | ☐ |
| 31 | Reply "MODIFY" (no number) | Error: "MODIFY requires a positive number" | ☐ |
| 32 | Worker notification | Worker sees modified quantity | ☐ |

### 6.3 REJECT

| # | Test | Expected | Pass |
|---|------|----------|------|
| 33 | Reply "REJECT too expensive" | Status → REJECTED, rejectionReason="too expensive" | ☐ |
| 34 | Reply "REJECT" (no reason) | Status → REJECTED, reason="No reason provided" | ☐ |

### 6.4 ASK

| # | Test | Expected | Pass |
|---|------|----------|------|
| 35 | Reply "ASK how many do you really need?" | Status → QUESTIONED (not PENDING) | ☐ |
| 36 | After ASK, reply "APPROVE" | Can approve a QUESTIONED request | ☐ |

### 6.5 Request ID targeting

| # | Test | Expected | Pass |
|---|------|----------|------|
| 37 | Reply "APPROVE REQ-xxxx" (matching ID) | Approves that specific request | ☐ |
| 38 | Reply "APPROVE REQ-zzzz" (no match) | "No pending request found matching REQ-zzzz" | ☐ |
| 39 | Non-approval reply (e.g. "thanks") | Falls through to normal supervisor reply flow | ☐ |

---

## Flow 7: Worker UI Notifications

**Scope:** Worker receives supply status updates via Socket.io.

| # | Test | Expected | Pass |
|---|------|----------|------|
| 40 | APPROVE triggers notification | New message in conversation list | ☐ |
| 41 | Notification content | Shows "Supply: APPROVED — ..." with Spanish translation | ☐ |
| 42 | No page refresh needed | Update arrives in real-time | ☐ |

---

## End-to-End Smoke Tests

### Smoke Test A: Concrete request (crew-A, has history)

1. Set workerId to `crew-A` in Control Panel
2. Speak or send: "necesitamos más concreto en la zona norte"
3. **Check:** Claude categorizes as `material_need`
4. **Check:** Server logs show supply agent running
5. **Check:** Supervisor gets WhatsApp with `[REQ-xxxx]`, history showing 10 yards / Best Concrete Co / $2500
6. Reply "APPROVE" from WhatsApp
7. **Check:** Worker UI shows Spanish approval notification (no refresh needed)
8. **Check:** Supabase `SupplyRequest` table has new row with status=APPROVED

### Smoke Test B: Gloves request (crew-B, has history)

1. Set workerId to `crew-B`
2. Send: "¿podemos recibir más guantes de trabajo?"
3. **Check:** WhatsApp shows gloves, history: 50 pairs / Safety Supply / $320
4. Reply "MODIFY 75"
5. **Check:** DB shows status=MODIFIED, modifiedQuantity=75

### Smoke Test C: Non-supply message bypass

1. Set any workerId
2. Send: "llegaré tarde mañana por el tráfico"
3. **Check:** Message translated and categorized (delay_report or similar)
4. **Check:** Server logs show "skipping supply agent"
5. **Check:** No new SupplyRequest row in DB

### Smoke Test D: No history (new crew)

1. Set workerId to `crew-Z` (no seed data)
2. Send: "necesitamos clavos para el techo"
3. **Check:** WhatsApp message has no history section
4. **Check:** Supplier comes from default SUPPLIER_DB (FastenAll for nails)

---

## Notes

- **Worker ID = Crew ID:** The supply agent uses workerId as the crew lookup key. For history to match, set the Control Panel ID to a crew ID from the seed data (`crew-A` or `crew-B`).
- **Twilio webhook:** Approval commands (APPROVE, MODIFY, etc.) are intercepted before the normal supervisor-reply flow. Non-command messages fall through normally.
- **Existing PENDING request:** The seed data has a PENDING gloves request for crew-B. You can test approval commands against it immediately without creating a new supply request first.
