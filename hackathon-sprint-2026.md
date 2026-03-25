# Hackathon Sprint — March 24-31, 2026

## Track 1: GenLayer × Base — "Intelligent DeFi Agent"
**Deadline:** April 3, 2026
**Core idea:** AI agent that executes DeFi via natural language commands

### ⚠️ CRITICAL: GenLayer is Python-Based (Not Solidity!)
This changes everything. GenLayer Intelligent Contracts are **Python** with built-in NLP — not your standard Solidity setup.

**Key Features:**
- Contracts written in Python using GenVM SDK
- Native NLP integration (LLM-powered contract logic)
- Web connectivity for real-time data
- Non-deterministic operations via "Equivalence Principle" consensus
- Two validation modes: strict output matching OR reasonable bounds

**Contract Decorators:**
```python
@gl.public.view      # Read-only
@gl.public.write     # State-modifying
@gl.public.write.payable  # Receives value
```

### Project Pivot: "Trustless DeFi Assistant"
Since GenLayer has native NLP + web access, build an Intelligent Contract that:
- Accepts natural language DeFi commands ("swap my USDC to higher yield")
- Uses web APIs to compare yields across protocols
- Executes via Equivalence Principle consensus
- No LangChain needed — NLP is built into the contract layer

### Tech Stack
- GenLayer (Python Intelligent Contracts)
- Base (EVM L2 for settlement)
- Next.js (demo UI)
- No external agent framework needed

### Milestones
- [ ] Day 1: GenLayer testnet setup + SDK install
- [ ] Day 2: Write first Intelligent Contract (Python)
- [ ] Day 3: NLP integration + Base settlement logic
- [ ] Day 4-5: Demo UI + end-to-end test
- [ ] Day 6-7: Submission + demo video

### Resources
- Docs: https://docs.genlayer.com
- Discord: https://discord.gg/8Jm4v89VAu (for testnet access)
- Community: Telegram https://t.me/genlayer

---

## Track 2: BNB Chain RWA — "InvoiceFi"
**Deadline:** March 31, 2026
**Core idea:** Invoice tokenization — tokenize SMB receivables as RWA tokens

### Why This Works for ALBS
Your accounting firm sees real invoices daily. You already know:
- Who's creditworthy
- Who pays on time
- Who has legitimate receivables

You're the natural "oracle" verifying invoice authenticity.

### Tech Stack
- BNB Smart Chain (EVM)
- Solidity (ERC-20 token + marketplace)
- Next.js (investor portal)
- Your backend (invoice verification)

### Project Structure
1. **InvoiceToken.sol** — ERC-20 representing each invoice
2. **InvoiceMarket.sol** — P2P trading of invoice tokens
3. **Oracle role** — ALBS verifies invoice legitimacy on-chain

### Milestones
- [ ] Day 1: BNB testnet setup + contract scaffold
- [ ] Day 2-3: InvoiceToken + InvoiceMarket contracts
- [ ] Day 4: Oracle verification logic
- [ ] Day 5-6: Investor portal + demo flow
- [ ] Day 7: Submission + demo video

### BNB Testnet
- Faucet: https://testnet.bnbchain.org/faucet-smart
- RPC: https://data-seed-prebsc-1-s1.bnbchain.org:8545

---

## Team
- Franklin Bryant IV — lead / pitch
- Northstar — devops / docs / contract development

## Status
**Last Updated:** March 24, 2026 — Contracts scaffolded, vault patterns integrated

## Vault Leverage — What We Used

### From Prospyr Vault (March 24, 2026)
- **Palantir AIP Security Research** → Provenance-based tool security integrated into BaseSettlementLayer
- **Claude Architect Certification** → Intent parsing confidence thresholds, explicit completion criteria
- **Agent Guardrails** → Source validation before data storage, rejection of unverified sources

### Key Patterns Applied
1. **Intent confidence >= 0.7** — explicit threshold, not arbitrary caps
2. **Provenance tracking** — every data source logged with confidence score
3. **Source verification** — known good sources whitelisted, unknown flagged
4. **Audit trail** — full history of actions with provenance hashes
5. **Explicit completion criteria** — verify balance before settlement, not after

## Next Action
Franklin → Join GenLayer Discord → get testnet access
Northstar → Scaffold demo UI while waiting
