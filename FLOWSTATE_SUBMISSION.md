# Stracel — Decentralized Marketplace on Celo

## What is Stracel?

Stracel is a fully decentralized P2P marketplace on Celo. Anyone can list, buy, and sell goods using CELO or G$ — no middlemen, no fees, no censorship. Smart contracts handle payments directly between buyers and sellers, recorded on-chain.

## G$ Integration

G$ is a first-class currency alongside CELO. Sellers price listings in G$, buyers can purchase with CELO or G$ (cross-currency). The frontend handles the full G$ approval flow (allowance check → approve → purchaseListingGD). This gives G$ real economic utility beyond holding.

## How It Works

1. **Connect** your Celo wallet (MetaMask or any EVM wallet)
2. **List** an item — name, description, price (CELO or G$), duration
3. **Buy** — payment goes directly to seller via smart contract. Track in My Orders with an on-chain verification link
4. **Manage** — sellers can edit or remove listings anytime

## Smart Contracts (Celo Mainnet)

| Contract | Address |
|---|---|
| CoreMarketPlace | `0x0Db0b61bd15B642305faDC91e3bBd6cD45ecf179` |
| EscrowService | `0xc30e7A642E150d392FfC7D4AE56C87b549Ed3500` |
| DisputeResolution | `0xA54B034b0cECD0877cc2d43fe3D1E1EB3A5cD561` |
| UserProfile | `0x7DaE559f4acE0579121C22de722d1E97A6957069` |
| G$ Token | `0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A` |

## Tech Stack

Solidity 0.8.24 + OpenZeppelin, Celo blockchain, Next.js + viem, G$ (GoodDollar).

## What's the Current State?

### Progress Made

Stracel is live on Celo mainnet with 5 contracts deployed:

- **CoreMarketPlace** — dual-currency listings + purchases, cross-currency support, edit/remove
- **EscrowService** — trustless escrow for high-value transactions
- **DisputeResolution** — community arbitration with 24h voting
- **UserProfile** — on-chain registration and reputation scoring
- **Frontend** — full Next.js UI: wallet connect, create/buy/cancel/edit listings, G$ approval flow, order history, transaction tracker (real-time polling), notifications, search, filter, sort, pagination, wallet balances (CELO + G$), gas estimation, "already bought" detection, confirm dialog with clear purchase breakdown

### Milestones Completed

- ✅ All contracts deployed to Celo mainnet
- ✅ G$ integration: G$ listings, G$ purchases, cross-currency (buy G$ items with CELO), full approval flow
- ✅ 12 active listings (CELO + G$) on mainnet — electronics, collectibles, home goods, Digital Art NFT
- ✅ Complete frontend with all marketplace features
- ✅ Edit/remove listings for sellers
- ✅ Transaction tracker, notifications, order history with on-chain verification
- ✅ 100-wallet activity system generating real on-chain transactions

### What's Next

- Frontend deployment to a public URL
- Mobile optimization for Celo's mobile-first base
- Escrow integration in the CoreMarketPlace UI
- Community growth and real user adoption

## Why Stracel for GoodBuilders?

G$ is a UBI token — Stracel gives it a place to be spent. Every G$-priced listing and cross-currency purchase drives real economic utility. We're building the commerce layer G$ needs.

## Links

- GitHub: https://github.com/Marvy247/StraCel
- Explorer: https://explorer.celo.org/mainnet/address/0x0Db0b61bd15B642305faDC91e3bBd6cD45ecf179
