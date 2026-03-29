---
name: albs-portal
description: ALBS Client Onboarding Portal integration for Zo agent. Fetch leads, track onboarding status, query pipeline, and get revenue analytics from onboarding.simplifyingbusinesses.com. Use when Franklin asks about client pipeline, new leads, lead status, onboarding progress, or revenue. Requires PORTAL_API_KEY_ZO secret stored in Zo Settings → Advanced → Secrets.
---

# ALBS Portal — Zo Agent Integration

## Setup

1. Store the portal API key in **Zo Settings → Advanced → Secrets** as `PORTAL_API_KEY_ZO`
2. Reference: `docs/PORTAL-API-REFERENCE.md` for full endpoint documentation

**Portal base URL:** `https://onboarding.simplifyingbusinesses.com`
**Auth:** Header `x-api-key: {PORTAL_API_KEY_ZO}`

---

## Core Queries

### Get all leads (paginated)
```
GET /api/admin/leads?limit=50&offset=0
```
Returns: leads array with `id, firstName, lastName, email, phone, company, status, serviceCategories, createdAt`

### Filter leads by status
```
GET /api/admin/leads?status=NEW
GET /api/admin/leads?status=ACTIVE
GET /api/admin/leads?status=CONTACTED
GET /api/admin/leads?status=QUALIFIED
GET /api/admin/leads?status=PROPOSAL
GET /api/admin/leads?status=NEGOTIATION
```

### Filter leads by date (new leads today/this week)
```
GET /api/admin/leads?createdAfter=2026-03-29T00:00:00Z
```

### Filter by service category
```
GET /api/admin/leads?serviceCategories=TAX_BUSINESS
GET /api/admin/leads?serviceCategories=AI_SERVICES
```

### Get single lead (with services)
```
GET /api/admin/leads/:leadId
```

### Get lead onboarding progress
```
GET /api/progress?leadId=:leadId
```
Returns: `onboardingStep` (1-7), `onboardingCompleted` (bool), step names

### Get lead services (names + prices)
```
GET /api/admin/leads/services?leadId=:leadId
```

### Get lead messages
```
GET /api/admin/leads/:leadId/messages
```

### Update lead status
```
PATCH /api/admin/leads
Body: { "leadId": "...", "status": "QUALIFIED", "notes": "..." }
```

### Revenue analytics
```
GET /api/admin/analytics?startDate=2026-01-01&endDate=2026-03-31
```
Returns: `totalRevenue`, `payments[]`, `invoices[]`, `revenueByMonth`

---

## Answering Franklin's Questions

| Question | Method |
|---|---|
| "What new clients came in today?" | `GET /api/admin/leads?createdAfter=TODAY&status=NEW` |
| "What's the status of [name]?" | Search leads by name/email → `GET /api/admin/leads/:id` + `GET /api/progress?leadId=:id` |
| "Show me all active clients" | `GET /api/admin/leads?status=ACTIVE` |
| "Any TAX_BUSINESS leads?" | `GET /api/admin/leads?serviceCategories=TAX_BUSINESS` |
| "Pipeline summary?" | `GET /api/admin/leads?limit=50` and count by status |
| "Revenue this month?" | `GET /api/admin/analytics?startDate=2026-03-01&endDate=2026-03-31` |

---

## Lead Statuses (7-stage pipeline)
1. `NEW` — Just created
2. `CONTACTED` — Initial contact made
3. `QUALIFIED` — Qualified and confirmed
4. `PROPOSAL` — Proposal sent
5. `NEGOTIATION` — In negotiation
6. `ACTIVE` — Client is active/onboarding
7. `INACTIVE` — No longer active

## Onboarding Steps (7 stages)
1. Information
2. Services
3. Contract
4. Calendar
5. Payment
6. Review
7. Complete (onboardingCompleted: true)

---

## Example Response — Lead Object
```json
{
  "id": "cmnb7vh7o000013k82848ejba",
  "firstName": "Joseph",
  "lastName": "Collins",
  "email": "polarisproduction@gmail.com",
  "phone": "+17865898378",
  "company": "Polaris Entertainment Inc.",
  "status": "NEW",
  "serviceCategories": "TAX_BUSINESS",
  "onboardingCompleted": false,
  "createdAt": "2026-03-29T03:45:57.714Z",
  "leadServices": [
    {
      "serviceId": "custom-polaris-1120",
      "customPrice": 50000,
      "service": {
        "name": "1120 C-Corporation Filing",
        "priceDisplay": "$500.00",
        "description": "Polaris Entertainment Inc. — 1120 filing."
      }
    }
  ]
}
```

---

## Notes
- All dates in ISO 8601 format (UTC)
- `createdAfter` param accepts ISO date strings
- Lead `status` (pipeline) ≠ `onboardingCompleted` (onboarding flow)
- Use `leadServices` to get assigned services and custom prices
- Onboarding token = `lead.token` → `https://onboarding.simplifyingbusinesses.com/onboard/:token`
