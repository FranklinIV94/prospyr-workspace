# ALBS Revenue Optimization Framework
**Status:** Draft — 2026-03-18
**Priority:** High

---

## Goal
Increase Average Revenue Per Client (ARPC) by converting one-time engagements into recurring relationships and driving upsells at the right moments.

---

## Core Principle: The Revenue Gap

Every client has a **Service Potential Score** — the difference between what they're buying and what they could be buying based on their profile.

```
Example:
- Client bought: AI Assessment ($999 one-time)
- Service Potential: $3,000-5,000+ (Process Redesign, Automation Build)
- Gap: ~$2,500-4,000 in unrealized value
- Monthly Upsell: $300-500/mo retainer on top
```

The system exists to close that gap at the right moments — not through pressure, but through relevance.

---

## Feature 1: Upsell Engine

### Trigger Points
| When | What | How |
|------|------|-----|
| 7 days post-onboarding | "Recommended next steps" email | Auto-email to client |
| 14 days post-onboarding | AI Assessment → Automation Build push | Admin notification |
| 30 days post-service | Retainer offer | Auto-email |
| 60 days post-onboarding | Health score review | Admin dashboard flag |

### Upsell Mapping (by service bought)
| Client Bought | Upsell Target | Price |
|---------------|---------------|-------|
| AI Assessment | Automation Build / Process Redesign | $1,000-5,000 |
| AI Assessment | Monthly Retainer | $300-500/mo |
| Tax Prep | Payroll & Bookkeeping (monthly) | $695/mo |
| Payroll Setup | Payroll & Bookkeeping (monthly) | $695/mo |
| Any AI Service | Knowledge Systems | $3,000+ |
| Any AI Service | Full Implementation | $5,000-10,000+ |
| Single AI Service | Bundle (2+ services) | 10% off bundle |

### Implementation
- `components/UpsellEngine.tsx` — handles trigger logic and content selection
- API route: `POST /api/upsell/trigger` — called by cron or event
- Email template: dynamic based on purchase history + profile
- Admin dashboard: "Upsell Opportunities" tab showing clients with high gap scores

---

## Feature 2: Monthly Retainer Program

### Tiers
| Tier | Price | What's Included |
|------|-------|----------------|
| Essential | $299/mo | Monthly check-in, 2hrs support, performance report |
| Growth | $499/mo | Everything Essential + ongoing optimization, new features, priority |
| Premium | $999/mo | Everything Growth + dedicated Slack channel, weekly calls |

### Entry Points
- Offered during initial checkout (upsell at payment step)
- Offered 30 days post-onboarding (auto-email)
- Offered to any client who bought 2+ services
- Shown in client portal as "Maintain Your AI" subscription

### Implementation
- Stripe subscription product per tier
- `components/RetainerOffer.tsx` — modal/drawer shown at checkout or post-onboarding
- `app/api/stripe/subscription/route.ts` — already exists, extend for retainers
- Client portal: new "Subscription" tab showing retainer status

---

## Feature 3: Service Health Score

### Scoring Logic
```
Health Score = (Current Spend / Service Potential) × 100

100 = client is fully utilizing services
50 = client has 50% of potential realized
<30 = severely under-served, needs outreach
```

### Data Inputs
- Services client has purchased (history)
- Industry/niche (from intake form)
- Company size (from intake form)
- Onboarding step reached
- Time since last purchase

### Admin Dashboard
- Table of all clients with health scores
- Sortable: most at-risk (low score) first
- Action buttons: "Send Upsell", "Book Check-in Call", "Review Profile"
- Color coding: 🔴 <30, 🟡 30-70, 🟢 70+

### Implementation
- `lib/clientHealth.ts` — scoring engine
- `components/ClientHealthDashboard.tsx` — admin view
- `app/api/clients/health/route.ts` — returns scores for all clients

---

## Feature 4: Annual Commitment Discount

### Mechanics
- 10% off if client commits to 12 months
- Applied at checkout as a coupon code
- Works with Stripe subscriptions
- Shown as "Save $X/year" in checkout UI

### Entry Points
- Checkout flow (radio: monthly vs. annual)
- Retainer offer page
- Admin dashboard (can apply to specific clients)

---

## Feature 5: Add-on Flow at Checkout

### "Clients Who Bought This Also..." Logic
| Primary Purchase | Add-on Recommendation | Price | Display |
|------------------|----------------------|-------|---------|
| AI Assessment | Automation Build | $1,000-3,000 | Checkout step 3 |
| Tax Prep | Payroll Setup | $999-2,095 | Checkout step 3 |
| Payroll Setup | Standalone Bookkeeping | $495/mo | Checkout step 3 |
| Any | Knowledge Systems | $3,000+ | Checkout step 3 |

### Implementation
- `lib/upsellRecommendations.ts` — rules engine
- `components/AddOnCard.tsx` — inline card in checkout
- Auto-applied if client profile matches criteria

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    CLIENT EVENTS                     │
│  (purchase, onboarding_complete, 30_days_post, etc) │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│              UPSELL DECISION ENGINE                  │
│  - Score client health                               │
│  - Select appropriate upsell                          │
│  - Check timing rules                                │
│  - Avoid over-messaging                              │
└─────────────────────┬───────────────────────────────┘
                      │
┌─────────────────────▼───────────────────────────────┐
│               DELIVERY CHANNELS                      │
│  - In-app notification (client portal)               │
│  - Email (via Resend)                                │
│  - Admin dashboard flag                              │
│  - Push notification (future)                        │
└─────────────────────────────────────────────────────┘
```

---

## Revenue Targets

| Metric | Current | 90-Day Target |
|--------|---------|---------------|
| ARPC (avg revenue/client) | $TBD | +40% |
| Recurring revenue % | ~0% | 30% of total |
| Upsell conversion rate | N/A | 15% of eligible clients |
| Retainer subscribers | 0 | 5 active |

---

## Next Steps

- [ ] Franklin reviews and approves this framework
- [ ] Define exact scoring weights for Health Score
- [ ] Write copy for email sequences
- [ ] Design Retainer tier details (exact features per tier)
- [ ] Build database schema for upsell tracking
- [ ] Implement incrementally (Upsell Engine → Retainer → Health Score)
