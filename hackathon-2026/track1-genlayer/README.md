# GenLayer Track — Trustless DeFi Assistant

## Concept
Natural language DeFi commands executed as GenLayer Intelligent Contracts.
User: "Move my USDC to the highest yielding stablecoin pool"
Contract: Fetches yields, compares, executes via Equivalence Principle consensus.

## Contract Architecture

### 1. YieldOracle.py
Fetches real-time yield data from DeFi protocols via web APIs.

### 2. DeFiCommander.py
Accepts natural language commands, processes via NLP, routes execution.

### 3. SettlementLayer.sol
Base settlement for final transaction execution.

## Getting Started
```bash
# Check GenLayer SDK
pip show genvm || pip install genvm

# Local dev
genlayer devnet
```

## Docs
https://docs.genlayer.com
