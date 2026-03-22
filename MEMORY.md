# Project Memory

## AI Security Research (March 2026)

### Palantir AIP Agentic Runtime Security (Mar 15, 2026)
- Read: "Securing Agents in Production" blog post
- Framework: 5 dimensions (reasoning core, orchestration, memory, tools, observability)
- Cross-referenced with PDS-SECURITY-THREAT-MODEL.md
- Key insight: Ontology as unified memory = our Obsidian approach
- Provenance-based tool security worth implementing for toolchains

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

**Dashboard:** https://prospyr-dashboard.vercel.app — Prospyr Control Center (FULLY REBUILT March 21, 2026)
- Paperclip integration connects to Southstar on the office Paled
- Login: Franklin@simplifyingbusinesses.com / Jordan2026!
- Source: `/home/franklin-bryant/.openclaw/workspace/prospyr-dashboard`

**Dashboard:** https://prospyr-dashboard.vercel.app — Prospyr Control Center (FULLY REBUILT March 21, 2026)
- Next.js 14 + Tailwind CSS v3 + NextAuth v4 + Lucide React
- Login: Franklin@simplifyingbusinesses.com / Jordan2026!
- Tabs: Agent Control (agent grid + status), Command Center (chat/assign), Activity Log (runs)
- Sidebar nav with Lucide icons, Inter font, ALBS dark navy glass-morphism design
- Paperclip integration pending (server not running on Northstar)
- Source: `/home/franklin-bryant/.openclaw/workspace/prospyr-dashboard`
- Deploy token: `vcp_6ecUHcZVhHEe9A3NavzcFEGqQTArBfB6Hmls5ID0zQ30lOVufB3E0t3D`
- **KNOWN BUG FIXED:** Tailwind v4 was incompatible with Next.js 14 static pages → downgraded to v3
