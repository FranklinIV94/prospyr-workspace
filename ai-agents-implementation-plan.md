# AI Agent Implementation Plan
**Status:** Research — 2026-03-18
**Source:** @zephyr_hg 4-agent framework

---

## What We Have vs. What We Need

| Agent | Zephyr's Description | ALBS Current State | Gap |
|-------|---------------------|-------------------|-----|
| **Lead Qualification** | 24/7 AI, books qualified calls, replaces $60K SDR | Apollo enrichment API live; manual follow-up | Need automated qualification + call booking |
| **Client Onboarding** | Handles docs, setup, 3-day → same day | Portal with 5-step flow; manual admin oversight | Need AI orchestrator + auto-follow-up |
| **Content + Scheduling** | Posts daily, manages calendar for consultants | No automated content; calendar via Graph API | Need content AI + scheduling automation |
| **Invoice Collection** | 40-60% DSO reduction | Stripe payments live; no follow-up automation | Need invoice tracking + AI dunning |

---

## Implementation Roadmap

### Phase 1: Invoice Collection Agent ⚡ (Fastest Win)

**Why first:** 40-60% DSO reduction is concrete, provable ROI. Easy sell to clients.

**What's needed:**
- `Invoice` model in Prisma (status, due date, amount, client link)
- AI agent that checks for overdue invoices daily
- Automated email sequence: Day 1 (friendly), Day 7 (firm), Day 14 (escalation)
- Dashboard: see all invoices, AI actions taken, payment status

**Stack:**
- Resend (already configured) for emails
- AI (Claude/GPT) to personalize each follow-up
- Supabase/Prisma for invoice data
- Stripe as source of truth for payment status

**Deliverable:** `/app/api/agents/invoice-collection/route.ts`

---

### Phase 2: Lead Qualification Agent

**What's needed:**
- AI reads incoming lead data (from intake form or Apollo enrichment)
- Scores lead: hot/warm/cold based on budget, timeline, fit
- Routes accordingly: hot → calendar booking, warm → nurture sequence, cold → periodic follow-up
- Sends personalized first response within minutes

**Already have:**
- Apollo enrichment (`/api/enrich`)
- Lead intake form
- Graph email access

**Deliverable:**
- `/app/api/agents/lead-qualification/route.ts`
- AI prompt that scores and routes leads
- Automated email/SMS response

---

### Phase 3: Client Onboarding Agent

**What's needed:**
- AI monitors onboarding step progress
- Auto-sends reminders if client stalls at any step
- Follows up 7 days post-onboarding with upsell recommendations
- Sends "welcome" sequence introducing retainer offerings

**Already have:**
- Portal with step tracking (`onboardingStep`)
- Chat system
- Service catalog
- Email via Resend

**Deliverable:**
- `/app/api/agents/onboarding-orchestrator/route.ts`
- AI prompt: "For each lead stuck at step X for >Y days, send Z"

---

### Phase 4: Content + Scheduling Agent

**What's needed:**
- AI generates weekly content (social posts, email newsletters)
- Franklin reviews/approves
- Posts to LinkedIn/X or sends to client
- Manages inbound meeting requests

**Already have:**
- No content generation yet
- Graph calendar API
- No social posting API

**Deliverable:**
- `/app/api/agents/content-scheduler/route.ts`
- Prompt library for content by service category
- Integration with LinkedIn API (or manual approval flow)

---

## Invoice Collection Agent — Deep Dive

### Database Model (Prisma)
```prisma
model Invoice {
  id            String       @id @default(cuid())
  leadId        String
  lead          Lead         @relation(fields: [leadId], references: [id])
  stripePaymentIntentId String?  // Links to Stripe
  amount        Int              // In cents
  currency      String       @default("usd")
  status        InvoiceStatus @default(PENDING)
  issueDate     DateTime     @default(now())
  dueDate       DateTime
  paidAt        DateTime?
  
  // AI Dunning
  remindersSent Int          @default(0)
  lastReminderAt DateTime?
  aiPersonality String?      // "friendly", "firm", "aggressive"
  
  createdAt     DateTime     @default(now())
  updatedAt     DateTime     @updatedAt
}

enum InvoiceStatus {
  PENDING
  OVERDUE
  PAID
  CANCELLED
}
```

### AI Dunning Prompt Logic
```
Role: Professional billing collections specialist
Tone: Friendly but firm. Never threatening.

Rules:
- Email 1 (due date): "Hey [Name], friendly reminder that [invoice] is due today..."
- Email 2 (7 days overdue): "Hi [Name], just following up on the invoice from [date]..."
- Email 3 (14 days overdue): "Hi [Name], our records show invoice #[X] is now 14 days overdue..."
- Email 4 (30 days overdue): "Hi [Name], we've escalated this to our collections process..."

Personalization: Reference their company, what service was delivered, exact amount.
```

### Cron Schedule
- Daily at 9 AM EST: Check all OVERDUE invoices, send appropriate reminder
- Weekly: Report to admin on collection status

---

## Next Steps

1. [ ] Franklin approves Phase 1 (Invoice Collection) as first build
2. [ ] Define exact email copy / tone preferences
3. [ ] Build Invoice model + seed test data
4. [ ] Build dunning AI endpoint
5. [ ] Connect to Stripe webhooks for payment status updates
6. [ ] Test with 1-2 real overdue invoices

---

## Competitive Advantage

Once all 4 agents are running:
- ALBS runs on its own AI infrastructure (internal demo)
- ALBS sells the same system to clients (productized service)
- Differentiator: "We don't just consult on AI — we run AI agents for our own business, and we'll build them for yours"

---

## Tech Stack (Reaffirmed)
- **AI:** Claude API or OpenAI (per-call cost vs. subscription)
- **Email:** Resend (already configured)
- **Database:** Supabase/Prisma (already configured)
- **Payments:** Stripe (already configured)
- **Calendar:** Graph API (already configured)
- **Cron:** Vercel Cron or external trigger
