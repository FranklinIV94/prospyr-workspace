# ALBS Lead Generation & Marketing Intelligence System

*Created: March 31, 2026*
*Updated: March 31, 2026*

---

## Overview

Three integrated tools form ALBS's lead generation and marketing intelligence stack:

| Tool | Primary Use | Daily Capacity |
|------|-------------|----------------|
| **Apollo.io** | B2B lead discovery & enrichment | 400 lookups/day |
| **IntelBase** | People search & due diligence | 400 lookups/day |
| **Apify** | Web scraping & data extraction | Pay-per-use |

Combined with existing Resend (email) and WordPress (content), this creates a complete inbound + outbound marketing system.

---

## Tool Capabilities

### Apollo.io — B2B Lead Intelligence

**What it does:** Searches and enriches B2B contacts and companies.

**Key features:**
- Company search by industry, size, location, tech stack
- Contact discovery (emails, phones, LinkedIn)
- Enrichment: add data to existing lead lists
- Email sequences and campaigns (separate paid product)
- "Find email" by company + person name

**Our API key:** `EoF8r9_QnIGETsvfhPczgw`

**Use cases for ALBS:**
- Find bookkeeping/accounting prospects in target industries (PEO, staffing, professional services)
- Enrich inbound leads with company data
- Build targeted prospect lists for cold outreach
- Find decision-makers at target companies

**API Docs:** https://www.apollo.io/api

---

### IntelBase — OSINT People Search

**What it does:** Searches people across breach databases, social profiles, and public records.

**Key features:**
- People search by name, email, phone, username
- Breach checking (is someone's data in a breach?)
- KYC/due diligence
- Social profile discovery

**Our API key:** `in_oHY6RrfAwuXPgUMiOhtn`
**Whitelisted IPs:** Northstar `134.56.245.211`

**Use cases for ALBS:**
- Verify inbound lead identity
- Due diligence on potential clients (PEO clients, larger accounts)
- Check if prospects have been in data breaches (relevance to security offerings)
- Background research for high-value engagements

**API Docs:** https://docs.intelbase.is

---

### Apify — Web Scraping & Data Extraction

**What it does:** Scrapes data from 55+ platforms including Instagram, Facebook, LinkedIn, Google Maps, etc.

**Skills installed:**
- `apify-ultimate-scraper` — Universal scraper for all platforms
- `apify-actor-development` — Build custom scraping Actors
- `apify-actorization` — Convert scripts to Actors

**Our API token:** `apify_api_[TOKEN]`
**Account:** luminary_oversight (STARTER BRONZE, $29/mo)

**Use cases for ALBS:**
- Scrape Google Maps for business listings (lead discovery)
- Monitor competitor social media
- Collect data for case studies (with permission)
- Research target industries
- LinkedIn profile data extraction

---

## Lead Generation Workflow

### Phase 1: Prospect Identification (Apollo)

```
1. Define target criteria:
   - Industry: PEO, staffing, professional services
   - Size: 10-500 employees
   - Location: FL, TX, CA (or nationwide)
   - Tech stack: uses common accounting software
   
2. Search Apollo for companies matching criteria
3. Export company list
4. Enrich with contact data (emails, phones)
```

### Phase 2: Contact Verification (IntelBase)

```
1. Run contact emails through IntelBase
2. Check for breach exposure
3. Verify identity if high-value prospect
4. Flag any risk indicators
```

### Phase 3: Data Enrichment (Apify)

```
1. Scrape LinkedIn for company updates
2. Check Google Maps for business info
3. Gather social proof (reviews, case studies)
4. Build comprehensive prospect profile
```

### Phase 4: Outreach (Resend + Portal)

```
1. Import enriched leads to portal
2. Trigger email sequence via Resend
3. Track engagement in portal
4. Move to active client when converted
```

---

## Competitive Intelligence

### TaskBlink Comparison

TaskBlink uses similar tools for cold outreach:
- Scrapes Google for business data → Apollo does this better
- SMS/Email cold blast → We prefer warm inbound
- $497-$1,997/mo for volume → Apollo $29/mo for quality

**Our advantage:** We have the same data capability they do, plus IntelBase for verification, plus Apify for enrichment — at a fraction of the cost.

---

## Quick Start Commands

### Apollo: Search companies
```bash
# TBD - need python-apollo client or direct API calls
```

### IntelBase: People search
```bash
curl -X POST "https://api.intelbase.is/v1/search/person" \
  -H "x-api-key: in_oHY6RrfAwuXPgUMiOhtn" \
  -H "Content-Type: application/json" \
  -d '{"query": "John Smith", "emails": ["john@company.com"]}'
```

### Apify: Run a scraper
```bash
# Via skill - use the apify-ultimate-scraper skill
# Or direct API call
curl -X POST "https://api.apify.com/v2/acts/apify~instagram-profile-scraper/run-sync" \
  -H "Authorization: Bearer apify_api_[TOKEN]" \
  -H "Content-Type: application/json" \
  -d '{"USERNAME": "target_account", "resultsLimit": 10}'
```

---

## Notes

- All three tools have free tiers or $29/mo plans — accessible for bootstrapped sales
- Apollo has 400 lookups/day on our plan — use strategically
- IntelBase has 400 lookups/day — use for verification, not discovery
- Apify is pay-per-use after free tier — good for targeted campaigns

---

## TODO

- [ ] Build Apollo + IntelBase + Apify integration script
- [ ] Create lead scoring system based on enrichment data
- [ ] Set up outreach email templates in Resend
- [ ] Connect to ALBS portal for lead management
