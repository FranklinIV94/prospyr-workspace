# PDS Trust Agent — ERC-8004 AI Agent Trust Layer

**Hackathon:** Synthesis Hackathon  
**Bounty:** Protocollabs ERC-8004 Trust Layer ($8,004) + Open Track  
**Status:** Built with Northstar + Southstar  

---

## Quick Start

```bash
# Set environment
export ETH_PRIVATE_KEY=0xYourPrivateKey
export ETH_RPC_URL=https://your-ethereum-rpc.com
export CHAIN=sepolia  # or mainnet

# Run agent
node agent/agent.js
```

## What It Does

1. **Registers AI agents on ERC-8004** — gets an onchain identity with verifiable capability flags
2. **Builds trust through interactions** — records every transaction, updates reputation onchain
3. **Verifies other agents** — `canTrust()` query returns bool in one RPC call
4. **Presents cryptographic attestations** — prove identity + reputation to other agents without revealing private data
5. **Delegates limited authority** — time-limited, permission-scoped delegation to other agents

## Architecture

```
User/Franklin → PDS Trust Agent → ERC-8004 Registry (onchain)
                              ↓
                    ┌─────────────────────┐
                    │ Identity Registry   │
                    │ Reputation Scoring  │
                    │ Delegation Framework│
                    └─────────────────────┘
```

## Smart Contract

Deployed at `0x8111C4D3f89dCE1bD60eE16d2b8D16eF1f86fB8D` (mainnet + sepolia)

```solidity
registerAgent(bytes32 agentId, bytes metadata, uint8 capabilityFlags)
recordInteraction(bytes32 agentId, bool success, uint256 weight)
getTrustScore(bytes32 agentId) → uint256
canTrust(bytes32 agentId, uint256 threshold) → bool
generateAttestation(bytes32 agentId, string claimType) → bytes
grantDelegation(bytes32 agentId, address delegate, uint256 expiresAt, bytes permissions)
```

## Capability Flags

| Flag | Value | Description |
|------|-------|-------------|
| CAN_TRADE | 1 | Executes financial transactions |
| CAN_SIGN | 2 | Signs messages and contracts |
| CAN_DELEGATE | 4 | Can delegate authority |
| IS_FINANCIAL | 8 | Handles financial instruments |

## Trust Levels

| Score | Level |
|-------|-------|
| 800-1000 | HIGHLY_TRUSTED |
| 500-799 | TRUSTED |
| 200-499 | NEUTRAL |
| 0-199 | UNTRUSTED |

## Why This Project

ERC-8004 is the Ethereum Foundation's standard for AI agent identity. Most agents today exist in silos — they can't prove who they are to each other. This creates a trust gap that prevents agents from collaborating autonomously.

PDS Trust Agent solves this by:
- Giving every agent an onchain identity tied to a wallet
- Tracking reputation through actual interactions (not self-reported)
- Enabling verifiable cross-agent communication without revealing sensitive data
- Supporting delegation chains (agent A trusts agent B, which trusts agent C)

## Files

```
synthesis-agent/
├── contracts/
│   └── PDSAgentRegistry.sol   # Solidity contract (Foundry)
├── agent/
│   └── agent.js                # Node.js agent — pure, no dependencies
├── docs/
│   └── SUBMISSION.md           # Hackathon submission
└── README.md                  # This file
```

## Tech Stack

- **Smart Contracts:** Solidity 0.8.26, Foundry
- **Agent:** Pure Node.js (built-in crypto + HTTP)
- **Blockchain:** Any EVM chain (tested on mainnet + Sepolia)
- **Standard:** ERC-8004 (AI Agent Identity)

## Team

**Prospyr / All Lines Business Solutions**

- Franklin J Bryant IV — business architecture, agent design
- Northstar — smart contract development, agent implementation  
- Southstar — infrastructure, testing

## Links

- ERC-8004: https://erc-8004.org
- Synthesis: https://synthesis.md
- Registry (mainnet): https://etherscan.io/address/0x8111C4D3f89dCE1bD60eE16d2b8D16eF1f86fB8D
