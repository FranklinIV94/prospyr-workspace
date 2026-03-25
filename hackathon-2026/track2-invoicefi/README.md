# InvoiceFi — BNB Chain RWA Track

## Concept
Tokenize SMB invoices as RWA tokens. Business gets liquidity, investors buy invoice tokens for yield. ALBS acts as the oracle verifying invoice legitimacy.

## Contract Architecture

### InvoiceToken.sol (ERC-20)
Represents a single invoice as a token. Face value + maturity date + payment status.

### InvoiceMarket.sol
P2P trading of invoice tokens. Investors buy at discount, get full face value at maturity.

### InvoiceOracle.sol
ALBS verification — confirms invoice authenticity on-chain.

## How It Works
1. SMB submits invoice → ALBS verifies → InvoiceToken minted
2. Investor buys token → funds SMB immediately
3. Invoice paid → investor receives face value
4. ALBS oracle confirms payment → token burned

## BNB Testnet
- RPC: https://data-seed-prebsc-1-s1.bnbchain.org:8545
- Chain ID: 97
- Faucet: https://testnet.bnbchain.org/faucet-smart

## Getting Started
```bash
npm install hardhat
npx hardhat compile
npx hardhat run scripts/deploy.js --network bnb_testnet
```
