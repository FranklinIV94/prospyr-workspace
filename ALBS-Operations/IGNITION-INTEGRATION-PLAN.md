# Ignition Integration Plan — ALBS Portal Enhancement
**Created:** March 12, 2026  
**Updated:** March 12, 2026 (Refined Scope)  
**Status:** Approved — Ready for Implementation  

---

## Overview

Enhance the existing ALBS portal with targeted improvements:
1. **Proposal Builder** — Admin creative control
2. **Terms Update** — Late payment + IP clauses
3. **Analytics & Payout Tracking** — Dashboard visibility

> ⚠️ **Preserve existing functionality.** This is incremental improvement, not a revamp.

---

## Current ALBS Portal (What's Working)

| Feature | Status |
|---------|--------|
| Lead/Client Management | ✅ Full contact info, status pipeline, Apollo.io enrichment |
| Service Catalog | ✅ Names, categories, pricing, icons |
| Contract Signing | ✅ Signature, IP tracking, terms text |
| Stripe Payments | ✅ Checkout, webhooks, payment records |
| Multi-Step Onboarding | ✅ /onboard/[token] flow |
| Email System | ✅ Resend integration |
| Admin Dashboard | ✅ Leads table, CRUD |
| Activity Tracking | ✅ Already exists |
| Stripe Checkout | ✅ Captures card on file |

---

## Scope: What's Being Built (72-Hour Target)

### 1. Proposal Builder — Admin Creative Control

**Goal:** Give admins ability to pre-select services for custom client packages

**Features:**
- Admin UI to select specific services for a client (vs. showing all)
- Drag-and-drop or checkbox UI for composing packages
- **Per-service pricing override** — both % discount AND flat $ amount
- Custom "notes" field per service (explanation for client)
- Unique proposal link scoped to selected services
- Client sees only pre-selected options (not full catalog)

**Flow:** Admin creates proposal → selects services → sets custom pricing/notes → copies portal link → emails manually

**Status:** ✅ Approved  

---

### 2. Terms Update (Legal Language)

**Approved language (March 12, 2026):**

**Proprietary Information Clause:**
> All methodologies, processes, templates, documents, and materials provided by ALBS in connection with services rendered are proprietary and confidential. Client agrees not to disclose, reproduce, or distribute any materials received without prior written consent.

**Late Payment Clause:**
> Payment is due upon receipt of invoice. If any invoice remains unpaid for more than seven (7) days, all non-payroll services will be suspended until payment is received in full.
> 
> Payroll Services Exception: Managed payroll services will continue uninterrupted until an account becomes thirty (30) days delinquent, at which time all services will be suspended.
> 
> Service resumption after suspension requires payment of all outstanding balances plus any applicable reactivation fees.

**Note:** Dynamic service injection must continue to work (selected services included in terms).

**Status:** ✅ Approved  

---

### 3. Analytics & Payout Tracking

**Analytics Features:**
- Revenue summary: This month, this year
- Revenue goal display: $20K average / $35K target
- Payment status: Collected, outstanding, scheduled
- Simple charts (Recharts)

**Payout Tracking:**
- Stripe payouts tab (read via `stripe.payouts.list()`)
- Display: Date, amount, status

**Status:** ✅ Approved  

---

## What's NOT Needed (Explicitly Deferred)

| Feature | Reason |
|---------|--------|
| Stripe Subscriptions | Manual billing, card on file |
| Automated Email Sequences | Manual link sharing + Resend for docs |
| Client View Tracking | Manual workflow preferred |
| Additional Activity Logging | Already exists |

---

## Implementation Order

| Order | Feature | Estimated Time |
|-------|---------|----------------|
| 1 | Terms Update (legal language) | 0.5 day |
| 2 | Proposal Builder enhancements | 2 days |
| 3 | Analytics + Payout tracking | 1 day |

**Target:** Live within 72 hours

---

## Technical Notes

- **Stack:** Next.js, Prisma, Stripe, Resend, Vercel
- **Approach:** Additive — don't break existing models
- **Admin routes:** Add under `/admin/proposals` and `/admin/analytics`

---

## Next Steps

- ⏳ Wait for idle/slow period
- ✅ Begin implementation when directed

---

*Last updated: March 12, 2026*