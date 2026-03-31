---
title: AI Development Methodology
date: 2026-02-19
updated: 2026-03-31
tags: [knowledge, ai, development]
---

# AI Development Methodology

## Core Principles

1. **Architect, then direct** — Franklin designs outcomes and architecture; AI agents execute. The human maintains ownership of every decision.
2. **Leverage, don't rely** — AI accelerates implementation; humans provide judgment. Green CI ≠ safe to ship.
3. **Security-first** — Every system designed with threat modeling from day one.
4. **Show, don't tell** — Prove completion with evidence: file paths, outputs, deployments.

---

## Key Framework: Leveraging vs. Relying

> *"There is a fundamental difference between relying on AI and leveraging it."*
> — Vercel, "Agent responsibly" (March 30, 2026)

### Relying on AI (❌)
- Assumes agent-written code + passing tests = ready to ship
- No mental model of what the code actually does
- Massive PRs full of hidden assumptions
- **Result:** Production incidents from code that "looks correct"

### Leveraging AI (✅)
- Agents iterate quickly; human maintains complete ownership
- Knows exactly how the code behaves under load
- Understands associated risks
- Comfortable owning production outcomes
- **Result:** Accelerated delivery with accountability

**The litmus test:** Would you be comfortable owning a production incident tied to this pull request?

---

## External Validation

### Vercel — "Agent responsibly" (March 30, 2026)
https://share.google/KYqFJ0x9HmjV7fE7p

Vercel published their internal framework for responsible agent deployment. Key points that validate our approach:

| Vercel's Principle | ALBS/Prospyr Practice |
|--------------------|-----------------------|
| Leverage vs. rely | Franklin architects, AI executes |
| Green CI ≠ proof of safety | Manual review + staged deploys |
| Self-driving deployments | Vercel auto-deploy + canary + rollback |
| Judgment is the scarce resource | "I architect systems and direct AI execution" |

### Key Quotes

> *"In an agentic world, passing CI is merely a reflection of the agent's ability to persuade your pipeline that a change is safe, even if it will immediately degrade your infrastructure at scale."*

> *"The gap between 'this PR looks correct' and 'this PR is safe to ship' has always existed. Agents widen that gap by producing code that looks more flawless than ever."*

> *"Implementation is abundant. The scarce resource is the judgment of what is safe to ship."*

---

## Development Lifecycle

### 1. Design (Human)
- Define outcome and architecture
- Threat model the system
- Identify failure modes
- Set deployment strategy

### 2. Build (AI + Human Direction)
- Agents implement against spec
- Human reviews every change
- Security scanning at every step
- Prove completion with evidence

### 3. Deploy (Automated + Verified)
- Staged rollout via Vercel pipeline
- Canary deployments for risky changes
- Auto-rollback on degradation
- Monitor for 24h minimum

### 4. Operate (Continuous)
- Security supply chain monitoring
- Dependency updates via dependabot
- Incident response within 1 hour
- Regular methodology reviews

---

## Related

- [[AI-Development-Methodology-MOCs]]
- [[AI-Development-Methodology/VERCEL-AGENT-RESPONSIBLY]]
