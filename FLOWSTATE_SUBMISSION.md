# Stracel — Decentralized Marketplace on Celo

## What is Stracel?

Stracel is a fully decentralized peer-to-peer marketplace built on the Celo blockchain. It enables anyone to list, buy, and sell goods and services using CELO or G$ (GoodDollar) — with no middlemen, no platform fees, and no censorship.

Smart contracts handle everything: payments, escrow, dispute resolution, and user reputation — giving both buyers and sellers trustless protection on every transaction.

## G$ Integration

Stracel natively supports G$ as a payment currency alongside CELO. Sellers can price listings in G$, and buyers can purchase directly using their G$ balance. The escrow contract also supports G$-denominated escrows, meaning G$ flows through the full transaction lifecycle — from listing creation to secure settlement.

This makes Stracel a direct driver of G$ usage and circulation on Celo, turning everyday commerce into a vector for GoodDollar adoption.

## How It Works

1. **Connect** your Celo wallet (MetaMask or any EVM-compatible wallet)
2. **List** an item — set a name, description, price (in CELO or G$), and duration
3. **Buy** — smart contract holds payment in escrow until the buyer releases funds
4. **Reputation** — both parties build on-chain reputation scores after each transaction
5. **Disputes** — unresolved transactions go to community arbitration via the DisputeResolution contract

## Smart Contracts (Celo Mainnet)

| Contract | Address |
|---|---|
| CoreMarketPlace | `0x01FAD87943D1303E0083391eF4E43Cee8dB06A72` |
| EscrowService | `0x983AB59ab1Ae967E34d72d57E3fF65b411Ad0D5B` |
| DisputeResolution | `0xA54B034b0cECD0877cc2d43fe3D1E1EB3A5cD561` |
| UserProfile | `0x7DaE559f4acE0579121C22de722d1E97A6957069` |
| BSTToken | `0x0dbFcf01d067A075b12c8CFd05dAA2D4071e1003` |
| G$ Token | `0x62b8B11039FCFe5Ab0c56E502B1c372A3d462a4b` |

All contracts are live on Celo mainnet and actively receiving transactions.

## Tech Stack

- **Solidity 0.8.24** — smart contracts with OpenZeppelin
- **Celo Blockchain** — fast, mobile-first, low-fee EVM chain
- **Next.js + viem** — frontend with direct Celo contract interaction
- **G$ (GoodDollar)** — integrated as native payment currency

## What We're Building During the Season

- Frontend marketplace UI (live, deployed)
- G$ payment flows for listings and escrow
- User reputation and rating system
- Mobile-optimized experience for Celo's mobile-first user base
- On-chain activity across 100+ wallets demonstrating real usage

## Why Stracel for GoodBuilders?

G$ is a universal basic income token — Stracel gives it a place to be spent. Every listing priced in G$, every escrow settled in G$, is a real-world use case that gives the token economic utility beyond holding. We're building the commerce layer that G$ needs.

## Links

- GitHub: https://github.com/Marvy247/StraCel
- Explorer: https://explorer.celo.org/mainnet/address/0x01FAD87943D1303E0083391eF4E43Cee8dB06A72
