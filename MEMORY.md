# Project Memory

## AI Security Research (March 2026)

### Palantir AIP Agentic Runtime Security (Mar 15, 2026)
- Read: "Securing Agents in Production" blog post
- Framework: 5 dimensions (reasoning core, orchestration, memory, tools, observability)
- Cross-referenced with PDS-SECURITY-THREAT-MODEL.md
- Key insight: Ontology as unified memory = our Obsidian approach
- Provenance-based tool security worth implementing for toolchains

---

## Corrections Log

*What was wrong → what's right. Learning from failures.*

- **2026-03-24:** Agent claiming "done" without evidence → Now must show file paths/lines written
- **2026-03-24:** Four Laws not codified → Added ACT/PROVE/WRITE/PROACTIVE to SOUL.md
- **2026-03-24:** No anti-amnesia scratch pad → Created SCRATCH.md for task state
- **2026-03-24:** Compaction loses context → Config tuning needed (reserveTokensFloor: 40000)

---

## PEO Acquisition Proposal — Docks Sutherland / ALCC (FINAL — March 28, 2026)

**Files:** `PEO Acquisition Proposal - Docks Sutherland/Executive-Services-Non-Compete-Proposal-FINAL.pdf.docx` + `Internal-Resolution-1-Proceeds-Allocation.pdf.docx`

**ALCC Ownership:** Renee 91% | Mildred and Margie Inc. 9%
**Buyer:** Docks Sutherland (Standard Resources / new national PEO entity)
**Key person:** Renee

**⚠️ CRITICAL STRUCTURAL CHANGE:** This is NOT a sale of ALCC's PEO client contracts. ALCC retains its 10 PEO client contracts. Proposals B & C are non-compete + employment arrangements — Docks is buying Renee's exclusive focus and removing her from the market as a competitor.

**Three Tiers:**

| | Proposal A | Proposal B | Proposal C |
|---|---|---|---|
| Structure | Employment only, no non-compete | Full non-compete + employment | Full non-compete + strategic premium |
| Lump-sum | None | $4,250,000 | $5,750,000 |
| Salary | $400,000 | $425,000 | $450,000 |
| Equity | 3% | 5% + 3-yr vest | 8% + participation rights |
| Renee keeps ALCC? | YES — all ops | NO — full non-compete | NO — full non-compete |
| Referral fee | 5% additive | 5% credit (revenue-neutral) | 5% credit |

**Non-compete scope (B & C):** PEO claims + recorded statements + drug testing + field investigations = $723K-$833K foreclosed annual revenue
**Non-compete payment structured as:** Asset Purchase of PEO Claims System (IRC Section 197 intangibles) — target capital gains treatment, not ordinary income
**Buckets (Internal Resolution 1):** A=Asset sale proceeds (91/9 split), B= Renee's personal employment income (100% Renee), C=Client acquisition credits (100% M&M Inc.)

**ALCC revenue:** $541,200 ARR PEO + $72K-$92K recorded statements + $100K-$200K drug testing/field investigations
**Switching cost (not transacting):** ~$560,300

**Excluded from all proposals:** Recorded Statements, Field Investigations, Drug Testing — stay under ALCC; only restricted under non-compete in B & C

---

### PEO Acquisition — Round 1 Proposals Submitted (Mar 28, 2026)
**ALCC PEO Claims Services Division for Sale — presented to Docks via Mildred and Margie Inc.**

- ALCC does two things: (1) PEO claims services, (2) field investigations/drug testing/recorded statements
- **Target:** PEO claims services only — the other ops go to Mildred and Margie Inc.
- **PEO Claims financials:** $45,100/month = $541,200/year, 10 PEO clients
- **EBITDA post-acquisition:** ~$481,200 (88.9% margin) — Renee's comp shifts to buyer side
- **Switching cost analysis:** $560,300 quantified cost if buyer replaces ALCC instead of acquiring

**Three proposals delivered to Docks (Mar 28, 2026):**
1. **Proposal A (Baseline):** $3.25M — 6.8x EBITDA, $265K salary, 2% equity
2. **Proposal B (Preferred Target):** $4.25M — 8.8x EBITDA, $285K salary, 5% equity + vesting
3. **Proposal C (Strategic Premium):** $5.75M — 11.9x EBITDA, $315K salary, 8% equity + bonus

**Key strategic framing in proposal:**
- 2 of 10 PEO clients are already Docks' entities (Standard Resources + FL Resource Management)
- Argues this is a continuity argument, not a discount argument — ALCC delivers the service, not just the contract
- Renée's post-acq role: national portfolio build-out, NOT new client development
- 5-year revenue projections used only for valuation basis — NOT performance commitments

**Full proposal:** `Documents/Prospyr/PEO Acquisition Proposal - Docks Sutherland/PEO Claims Services Acquisition - Three Proposal Options.md`

---

### King Audio Platform Project (Mar 28, 2026) 🔊
**T17 Entertainment product line — LIVEVOCAL + T17 STUDIO WORKSTATION confirmed.**

**Scope confirmed tonight:**
- **T17 Studio Workstation** — Beelink SER7 (Ryzen 7 8845HS, 32GB, 1TB) + Focusrite Scarlett 2i2. Stays in studio. ~$720.
- **LiveVocal** — Ventoy-based USB boot. Ubuntu Studio + Reaper + JACK + Demucs. Portable, runs on any x86 laptop at venues. **Target: June 1, 2026.**
- **KingDAW** — Ardour short-term, JUCE long-term. Post-June.
- **LiveVocal kit:** Sennheiser EW IEM G4 (~$700) + IE4 buds (~$80) + UCA222 (~$30) + USB drive (~$25). ~$855.
- **Grand total: ~$1,575**

**Sound analysis:** 3 tracks done — King's vocal chain consistent. Linux VST3 chain: Graillon 2 + TDR Kotelnikov + TDR Slick EQ + Saturn 2 + Valhalla SuperMassive.

**Project brief:** `king-audio-platform/docs/PROJECT-BRIEF.md`
**Source doc (Franklin's):** `king-audio-platform/docs/T17-Studio-Project-Brief-v3.docx`

---

## litellm Supply Chain Attack (March 24-25, 2026) 🔴
- Full technical analysis completed March 25
- Attack: Malicious .pth file in litellm 1.82.7/1.82.8
- Steals SSH keys, cloud creds, Kubernetes secrets, crypto wallets
- Exfil to attacker-controlled `models.litellm.cloud` (not litellm.ai)
- **Franklin NOT affected** — litellm not installed on any system
- Docs updated: pds-supply-chain-monitor.md + Obsidian vault note

---

## Hackathon Sprint 2026

**Tracks:** GenLayer × Base (Track 1) | InvoiceFi BNB Chain (Track 2)
**Sprint doc:** `/workspace/hackathon-sprint-2026.md`
**Contracts:** `/workspace/hackathon-2026/track1-genlayer/contracts/` + `track2-invoicefi/contracts/`

---

## litellm Supply Chain Attack (March 24, 2026) 🔴
- PyPI packages 1.82.7/1.82.8 compromised
- Steals SSH keys, cloud creds, crypto wallets
- Franklin not affected (no litellm installed)
- Monitor: `pds-supply-chain-monitor.md`

---

## ALBS Client Onboarding Portal (Simplifying Businesses)

### Recent Updates (March 11, 2026)

#### Features Completed (Today)

**4. Client Portal (/client/[token])**
- NEW: Created `app/client/[token]/page.tsx` - Self-service client portal
- Three tabs originally: Overview, Subscription, Messages
- Updated to: Overview, Messages & Documents (no subscription viewing)
- **Client restrictions**:
  - Cannot see billing details
  - Can only update payment method (redirects to Stripe portal)
  - Chat messages are emailed to support (not saved)
  - Documents are uploaded and emailed to support (not saved on server)
- Overview: Shows account details, services, and ProgressTracker (always visible)
- Messages: Chat with ALBS via email, upload documents
- API `/api/documents` - Uploads and emails to support via Resend
- API `/api/chat` - Client messages emailed to support, admin messages saved + emailed to client

**1. Progress Tracker**
- Created `components/ProgressTracker.tsx` - A visual progress indicator for onboarding
- Shows completed steps, current step, and percentage complete
- Implemented compact mode for client onboarding page
- Full mode for admin dashboard with milestones
- API: `app/api/progress/route.ts` - Get/update lead progress
- Integrated into client onboarding page (stepper below shows progress)
- Added to admin lead details dialog as a tab

**2. Chat Panel**
- Created `components/ChatPanel.tsx` - Client/admin messaging system
- Uses existing ClientRequest model for message storage
- Admin view: Floating button to access all conversations, opens drawer
- Client view: Embedded chat panel with message history
- API: `app/api/chat/route.ts` - Get messages, send messages, list conversations
- Added to client confirmation page after onboarding complete
- Added to admin lead details dialog as Chat tab

**3. Monthly/Recurring Billing**
- Updated `app/api/stripe/subscription/route.ts` - New subscription checkout
- Supports Monthly and Yearly billing options (10% discount for yearly)
- Client can select billing type during payment step
- Creates Stripe subscription checkout sessions (not one-time)
- Updated webhook `app/api/stripe/webhook/route.ts` to handle:
  - `customer.subscription.created` - Create subscription record
  - `customer.subscription.updated` - Update subscription status
  - `customer.subscription.deleted` - Mark as canceled
  - `invoice.payment_failed` - Mark as past due
  - `invoice.payment_succeeded` - Record payment, update periods

**Database Updates:**
- Added `subscriptions` relation to Lead model in Prisma schema
- Regenerated Prisma client
- Payment model already had `paymentType` (ONE_TIME vs RECURRING)
- Subscription model already added for tracking recurring billing

**Page Updates:**
- `app/onboard/[token]/page.tsx`:
  - Added ProgressTracker component (compact view below stepper)
  - Added ChatPanel to confirmation page
  - Added billing type selection (One-Time / Monthly / Yearly)
  - Updated payment button to call subscription API for recurring
  - Shows discounted pricing for yearly plans
  - **Updated Terms step with dynamic Master Service Agreement** - includes selected services, prices, descriptions from service catalog

**5. Dynamic Service Agreement**
- Updated contract signing step to generate dynamic agreement
- Agreement includes: Service names, prices (from service catalog), descriptions
- Full agreement text stored in database with contract record
- Uses Master Service Agreement template with all legal sections
- `app/admin/page.tsx`:
  - Added tabs to lead details dialog (Info, Services, Progress, Chat)
  - Added ProgressTracker to Progress tab
  - Added ChatPanel to Chat tab (with isAdmin flag)
  - Added quick access to Chat from Info tab

#### Known Issues
- Warning during build about `/api/admin/leads/services` route (pre-existing, not critical)

### Fixes Applied (March 11, 2026 - Evening)
- **Stripe Billing Portal**: Created `/api/stripe/portal` endpoint to properly redirect clients to Stripe's billing portal for payment method updates (was previously a placeholder URL)

### Previous Work (March 10, 2026)
- Stripe checkout integration working
- Service catalog with pricing
- Multi-step onboarding flow
- Admin lead management
- Email notifications system

### NEW Features (March 11, 2026 - Evening updates)

**Admin Portal Enhancements:**
- NEW: **Billing Tab** - View/manage subscription status, amounts, periods
- NEW: **Propose New Service** button - Send service proposals to clients via email
- NEW: **Request Documents** button - Request documents from clients, they'll upload via portal
- Chat tab now properly integrates with client's email-based messaging
## Prospyr Inc Corporate Structure (March 21, 2026)

**Parent:** Prospyr Inc
**Purpose:** AI-accelerated business operations hub

**Subsidiaries:**
- All Lines Business Solutions (ALBS) — consulting and accounting
- All Lines Claims Consultants — claims management
- All Lines Auto — insurance/auto (subsidiary of Prospyr Inc)
- All Lines Business Services — (also under Prospyr)

**Southstar Agent Location:** Office Paled server — 6600 Taylor Rd, 103, Punta Gorda, FL 33950. This is where Paperclip + Southstar run for dashboard and heavier workloads.

**Prospyr:** Oracle VPS — cloud gateway, WhatsApp, Graph email, lightweight monitors.

**Dashboard:** https://prospyr-dashboard.vercel.app — Prospyr Control Center
- Next.js 14 + Tailwind CSS v3 + NextAuth v4 + Lucide React
- Paperclip integration connects to Southstar on the office Paled
- Login: Franklin@simplifyingbusinesses.com / Jordan2026!
- Tabs: Agent Control (agent grid + status), Command Center (chat/assign), Activity Log (runs)
- Source: `/home/franklin-bryant/.openclaw/workspace/prospyr-dashboard`
- **BUG FIXED (Mar 22):** Tailwind v4 was incompatible with Next.js 14 static pages → downgraded to v3

## Twitter/X Article Processing Workflow

Franklin sends articles/threads he finds on Twitter. My job:
1. **Extract** — Pull the useful/applicable information from the content
2. **Discard** — Skip anything not relevant to our work
3. **Update the vault** — Create an Obsidian note with:
   - Clean source link
   - Key takeaways relevant to ALBS/Prospyr
   - How we can apply it
4. **Blog post ideas** — Flag anything worth documenting for a future blog

**I do NOT go looking for articles.** Franklin feeds them to me.

## Microsoft Graph API (ALBS Support Email)
**Used for:** support@simplifyingbusinesses.com inbox monitoring and sending
**Credentials (from TOOLS.md):**
- CLIENT_ID: `d5289bd8-eeaf-4789-8720-39bf4dcc91cf`
- TENANT: `82c42990-313e-4294-983b-f1aa4657c49f`
- SECRET: `ZMQ8Q~HsrlEJ5V9G1y6NL2eY6a2YTnyxQdip6bUB`
- Token file: `~/.msgraph-token` (refresh when expired)
- Uses app-only client credentials flow (not user-delegated)

## Zo Integration Scripts (zo-scripts/)
- `portal_client.py` — Portal API wrapper (leads, chats, services)
- `graph_client.py` — Graph API client for support@ inbox
- `support_agent.py` — First-line customer service agent
- PORTAL_API_KEY: `4c254466258077d5b755273b24f0a46c261ec0e64316f774`
