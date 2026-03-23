# PDS Trust Agent — ERC-8004 AI Agent Trust Layer

**Built for:** Prospyr / All Lines Business Solutions  
**Bounty:** Protocollabs ERC-8004 Trust Layer ($8,004) + Open Track  
**Deadline:** March 22, 2026, 11:59PM PT

## What It Does

PDS Trust Agent is an onchain AI agent identity and trust verification system built on ERC-8004. It lets agents:

- **Register onchain** with verifiable identity (address → agent ID)
- **Build reputation** through recorded interactions
- **Verify trust** in other agents in a single RPC call
- **Present attestations** — cryptographic proof of identity + reputation
- **Grant delegations** — time-limited, permission-scoped authority to other agents

## Why ERC-8004

ERC-8004 is the Ethereum standard for AI agent identity and delegation. It defines:
- Onchain agent identity registry
- Reputation scoring per agent
- Attestation format for cross-agent verification
- Delegation mechanism with expiry and scope

Our contract (`PDSAgentRegistry.sol`) implements ERC-8004's `IAgentRegistry` interface.

## Project Structure

```
synthesis-agent/
├── contracts/
│   └── PDSAgentRegistry.sol   # Smart contract (Foundry, solc 0.8.26)
├── agent/
│   ├── agent.js               # Node.js agent — RUN THIS
│   └── agent.ts               # TypeScript source (reference)
├── package.json               # Dependencies (for build tooling only)
├── README.md                  # This file
└── SUBMISSION.md              # Full hackathon submission
```

## Quick Start

```bash
# Demo mode (no wallet needed)
node agent/agent.js

# With wallet (Sepolia testnet)
ETH_PRIVATE_KEY=0x... node agent/agent.js

# With custom RPC
ETH_RPC_URL=https://ethereum.publicnode.com ETH_PRIVATE_KEY=0x... node agent/agent.js

# Mainnet
CHAIN=mainnet ETH_PRIVATE_KEY=0x... node agent/agent.js
```

## Smart Contract

**Registry:** `0x8111C4D3f89dCE1bD60eE16d2b8D16eF1f86fB8D` (mainnet + sepolia)

Deploy with Foundry:
```bash
forge build
forge create --rpc-url $ETH_RPC_URL --private-key $ETH_PRIVATE_KEY \
  src/PDSAgentRegistry.sol:PDSAgentRegistry
```

## Security Notes

- **No npm dependencies** — pure Node.js built-ins only (`http`, `crypto`)
- **Read-only by default** — private key only needed for onchain writes
- **No funds stolen** — this is a demo/competition submission, not production code
- Report vulnerabilities: security@prospyr.ai

## How It Works

### Agent Identity
Address → keccak256 hash → agent ID (ERC-8004 compatible)

### Trust Scoring
- Agents accumulate reputation through recorded interactions
- Trust score is 0–1000 (0 = untrusted, 1000 = highly trusted)
- Thresholds: `NEUTRAL ≥ 200`, `TRUSTED ≥ 500`, `HIGHLY_TRUSTED ≥ 800`

### Attestations
Cryptographic proof binding:
- Agent identity (address → agent ID)
- Registry membership
- Current reputation score
- Timestamp

### Delegation
Time-limited, scope-restricted authority grants:
```
delegator → delegate (with expiry, capability flags)
```

## Links

- ERC-8004: https://erc-8004.org
- Etherscan: https://etherscan.io/address/0x8111C4D3f89dCE1bD60eE16d2b8D16eF1f86fB8D
- Synthesis: https://synthesis.md

## Team

**Prospyr / All Lines Business Solutions**  
AI-accelerated business operations — consulting, accounting, and software.
