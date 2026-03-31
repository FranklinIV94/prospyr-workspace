# PRD: Prospyr Inc — AI-Powered Business Operations Platform

**Version:** 1.0
**Date:** March 31, 2026
**Project:** Prospyr Inc
**Phase:** Planning

---

## 1. Overview

**Project Name:** Prospyr Inc — AI Agent System

**What it does:**
Prospyr is an AI-powered business operations platform that combines multi-agent orchestration with persistent memory, enabling automated client management, business process automation, and intelligent service delivery for All Lines Business Solutions (ALBS) and its subsidiaries.

**Target Users:**
- Internal: Franklin Bryant IV (CEO/COO), Prospyr AI agents
- External: ALBS clients (through client portal), prospects (through inbound marketing)

---

## 2. Vision & Mission

**Vision:** Demonstrate AI-accelerated business operations through our own company, then replicate the methodology for clients.

**Mission:** Replace reactive business operations with proactive AI-driven systems that anticipate needs, automate workflows, and deliver measurable efficiency gains.

---

## 3. Company Structure

```
Prospyr Inc (Parent)
├── All Lines Business Solutions (ALBS) — Consulting & Accounting
├── All Lines Claims Consultants — Claims Management  
├── All Lines Auto — Insurance/Auto (subsidiary)
├── All Lines Business Services — General business services
```

**Agent Team:**
| Agent | Role | Host |
|-------|------|------|
| Prospyr Prime | Primary business agent — Discord, WhatsApp, email, client comms | Oracle VPS (cloud) |
| Northstar | Operations agent — heavy development, vault management, local infrastructure | Northstar hardware (local) |
| Southstar | Dashboard agent — web hosting, client demos, sandboxed builds | Office Paled server (6600 Taylor Rd, Punta Gorda) |
| Zo | Demo/prototype agent — web hosting, client demos | Zo Cloud |

---

## 4. Core Capabilities

### 4.1 Multi-Agent Orchestration
- **Sub-agent spawning:** Tasks delegated to specialized agents based on capability requirements
- **Persistent sessions:** State maintained across conversations
- **Team coordination:** Prospyr as primary, Northstar/Southstar/Zo as specialized workers
- **Scheduled triggers:** Cron-based task execution for recurring operations

### 4.2 Persistent Memory System
- **Long-term memory:** MEMORY.md — curated learnings, decisions, key context
- **Daily notes:** memory/YYYY-MM-DD.md — raw activity logs
- **Obsidian vault:** Structured knowledge base at /home/franklin-bryant/Documents/Prospyr
- **Session continuity:** SCRATCH.md for mid-session task state

### 4.3 Communication Channels
| Channel | Purpose | Agent |
|---------|---------|-------|
| Discord | Primary alerts & direct comms | Prospyr Prime |
| WhatsApp | Internal agent comms | Prospyr Prime |
| Email (Graph API) | Client comms via support@ | Prospyr Prime |
| Client Portal | Onboarding & self-service | Southstar |

### 4.4 Client-Facing Systems
- **ALBS Onboarding Portal:** https://onboarding.simplifyingbusinesses.com
  - Multi-step onboarding flow with Stripe billing
  - Client portal for document upload and messaging
  - Progress tracker for onboarding status
- **Prospyr Dashboard:** https://prospyr-dashboard.vercel.app
  - Agent control center
  - Activity log and task management

### 4.5 Data & Integration Layer
- **Apollo.io:** B2B lead intelligence (400 lookups/day)
- **IntelBase:** OSINT people search (due diligence, KYC)
- **Resend:** Transactional email
- **Stripe:** Billing and subscriptions
- **Supabase:** Database (via Prisma ORM)
- **WordPress:** Content management

---

## 5. Service Offerings

### 5.1 AI-Accelerated Development
*"I architect systems using AI-accelerated development tools. My background is in business operations, insurance, and data security. I understand what needs to be built and how to ensure it's built securely."*

### 5.2 Bookkeeping & Accounting
- Small business bookkeeping
- Tax preparation (2024/2025 active)
- PEO expense management

### 5.3 Claims Management
- PEO claims services (10 active clients)
- Field investigations
- Drug testing coordination
- Recorded statements

### 5.4 AI Integration & Training
- AI tool implementation for businesses
- Workflow automation
- Agent training and deployment

---

## 6. Security & Compliance

### 6.1 Active Supply Chain Monitoring
- PyPI package monitoring (telnyx, litellm, axios)
- NPM supply chain tracking
- Source map exposure alerts

### 6.2 Access Control
- **Prospyr access:** Whitelist of authorized phone numbers only
- **Discord:** Primary alert channel
- **WhatsApp:** Internal agent communication only

### 6.3 Infrastructure Security
- Local infrastructure (Northstar, Southstar) vs cloud (Prospyr on Oracle VPS)
- Tailscale VPN for secure tunnel access
- Obsidian vault with authenticated API access

---

## 7. Competitive Position

**Differentiators:**
- Multi-agent team architecture (not solo AI consultant)
- Persistent memory across sessions
- In-house development methodology demonstrated on own operations
- Security-first approach to AI implementation

**Market positioning:** "We eat our own cooking" — all methodologies tested internally before client delivery.

---

## 8. Key Documentation

| Document | Purpose |
|----------|---------|
| `SOUL.md` | Agent persona and Four Laws |
| `PRINCIPLES.md` | Decision-making framework |
| `MEMORY.md` | Long-term curated memory |
| `TOOLS.md` | Infrastructure and API credentials |
| `HEARTBEAT.md` | Scheduled monitoring checks |
| `OpSec-One-Pager.md` | Security service offerings |
| `CLAUDE-CODE-INTELLIGENCE-ROADMAP.md` | Competitive analysis |
| `COMPETITIVE-INTELLIGENCE.md` | Competitor tracking |
| `pds-supply-chain-monitor.md` | Active threat intelligence |

---

## 9. Success Metrics

- Client onboarding completion rate
- Response time to client inquiries
- Supply chain threat detection-to-remediation time
- Number of active clients (current: PEO with 10 clients)
- Agent task completion rate via CodeBake

---

## 10. Next Phase

**Phase 1 (Current):** Planning
- [x] Project initialized in CodeBake
- [ ] PRD complete (current task)
- [ ] Source project created
- [ ] GitHub repository set up

**Phase 2:** Foundation
- CI/CD pipeline
- Development environment setup
- Documentation scaffolding

**Phase 3:** Core Development
- Agent system refinement
- Client portal enhancements
- Integration expansion

---

*PRD created by Northstar — March 31, 2026*
