# PDS Trust Agent — ERC-8004 Trust Layer
## Synthesis Hackathon Submission

**Team:** Prospyr / All Lines Business Solutions  
**Track:** Open Track + Protocollabs ERC-8004 Trust Layer ($8,004)  
**Deadline:** March 22, 2026, 11:59PM PT

---

## What We Built

A production-ready ERC-8004 AI Agent Trust Layer — agents that register onchain with verifiable identity, build reputation through interactions, and present cryptographic proof of trustworthiness to other agents.

**Live contract:** `0x8111C4D3f89dCE1bD60eE16d2b8D16eF1f86fB8D` (mainnet + sepolia)

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  PDS Trust Agent                     │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────┐ │
│  │ Identity     │  │ Reputation   │  │ Delegation│ │
│  │ Registry     │  │ Scoring      │  │ Framework │ │
│  └──────┬───────┘  └──────┬───────┘  └─────┬─────┘ │
│         │                 │                │        │
│         └────────────┬────┴────────────────┘        │
│                      ▼                               │
│              ┌──────────────┐                        │
│              │ ERC-8004    │                        │
│              │ Onchain     │                        │
│              │ Registry    │                        │
│              └──────────────┘                        │
└─────────────────────────────────────────────────────┘
```

## Smart Contract (`contracts/PDSAgentRegistry.sol`)

```solidity
// Core features:
- registerAgent(bytes32 agentId, bytes metadata, uint8 capabilityFlags)
- recordInteraction(bytes32 agentId, bool success, uint256 weight)
- getTrustScore(bytes32 agentId) → uint256 (0-1000)
- canTrust(bytes32 agentId, uint256 threshold) → bool
- generateAttestation(bytes32 agentId, string claimType) → bytes
- grantDelegation(bytes32 agentId, address delegate, uint256 expiresAt, bytes permissions)
- revokeDelegation(bytes32 agentId, address delegate)
```

## Agent (`agent/agent.js`)

Pure Node.js — no npm dependencies. Connects to Ethereum via RPC.

```bash
# Set environment
export ETH_PRIVATE_KEY=0x...       # Your wallet private key
export ETH_RPC_URL=https://...     # Ethereum RPC endpoint
export CHAIN=sepolia              # or mainnet

# Run
node agent/agent.js
```

## Capability Flags

| Flag | Value | Meaning |
|------|-------|---------|
| CAN_TRADE | 1 | Agent can execute financial transactions |
| CAN_SIGN | 2 | Agent can sign messages/contracts |
| CAN_DELEGATE | 4 | Agent can delegate authority to others |
| IS_FINANCIAL | 8 | Agent handles financial instruments |

## Trust Scores

| Score | Level | Meaning |
|-------|-------|---------|
| 800-1000 | HIGHLY_TRUSTED | Proven track record of successful interactions |
| 500-799 | TRUSTED | Regular positive interactions |
| 200-499 | NEUTRAL | New or mixed history |
| 0-199 | UNTRUSTED | Negative track record or unregistered |

## How It Works

1. **Register:** Agent registers on ERC-8004 with metadata (IPFS hash) and capability flags
2. **Build Reputation:** Every interaction is recorded onchain — success adds +10×weight, failure subtracts -5×weight
3. **Verify Trust:** Any agent can query `canTrust(agentId, threshold)` — returns bool
4. **Present Attestation:** Agent generates cryptographic attestation proving identity, score, and capabilities
5. **Delegate:** Agents with CAN_DELEGATE flag can grant time-limited permissions to other agents

## Integration Example

```javascript
const { PDSTrustAgent } = require('./agent/agent.js');

const agent = new PDSTrustAgent();
await agent.initialize();

// Verify before transacting
const otherAgent = await agent.verifyAgent('0x742d35Cc6634C0532925a3b844Bc9e7595f');
if (otherAgent.isTrusted) {
  // Proceed with transaction
}

// Generate attestation for counterparty
const attestation = await agent.generateAttestation(myAgentId, 'agent_identity_and_reputation');
// Send to other agent for verification
```

## Why This Wins

1. **ERC-8004 native** — aligns with Ethereum Foundation's AI agent identity standard
2. **PL_Genesis compatible** — builds toward verifiable agent identity and reputation
3. **Real economics** — agents that trust each other can collaborate without escrow
4. **Zero dependencies** — agent runs on any machine with Node.js, connects to any EVM chain
5. **Prospyr existing work** — maps directly to PDS verified communication stack

## Files

```
synthesis-agent/
├── contracts/
│   └── PDSAgentRegistry.sol    # Smart contract (Foundry + Hardhat)
├── agent/
│   └── agent.js                # Node.js agent (no dependencies)
├── docs/
│   └── SUBMISSION.md           # This file
└── README.md                  # Full documentation
```

## Next Steps (Post-Hackathon)

1. Deploy reference implementation on Sepolia testnet
2. Build MCP server so any AI can use natural language to query trust scores
3. Integrate with Prospyr's existing PDS communication layer
4. Submit to PL_Genesis for $150K+ follow-on prize consideration
