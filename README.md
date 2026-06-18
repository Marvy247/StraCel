# StraCel — Stracel Marketplace on Celo

Stracel decentralized marketplace smart contracts deployed on the Celo blockchain.

## Deployed Contracts with G$ Integration (Celo Mainnet)

| Contract | Address |
|----------|---------|
| CoreMarketPlace | [`0x0Db0b61bd15B642305faDC91e3bBd6cD45ecf179`](https://explorer.celo.org/mainnet/address/0x0Db0b61bd15B642305faDC91e3bBd6cD45ecf179) |
| EscrowService | [`0xc30e7A642E150d392FfC7D4AE56C87b549Ed3500`](https://explorer.celo.org/mainnet/address/0xc30e7A642E150d392FfC7D4AE56C87b549Ed3500) |
| DisputeResolution | [`0xA54B034b0cECD0877cc2d43fe3D1E1EB3A5cD561`](https://explorer.celo.org/mainnet/address/0xA54B034b0cECD0877cc2d43fe3D1E1EB3A5cD561) |
| UserProfile | [`0x7DaE559f4acE0579121C22de722d1E97A6957069`](https://explorer.celo.org/mainnet/address/0x7DaE559f4acE0579121C22de722d1E97A6957069) |

**G$ Token:** [`0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A`](https://explorer.celo.org/mainnet/address/0x62B8B11039FcfE5aB0C56E502b1C372A3d2a9c7A)

**Deployer:** `0x27A2dD1823D883935c9824fbaC0a018cE8e891E5`

## Contracts

- **BSTToken** — ERC-20 token (BST), 1 trillion supply, 6 decimals, pausable
- **CoreMarketPlace** — Create, update, cancel and purchase listings with CELO or G$
- **EscrowService** — Trustless escrow (~7 day duration), supports CELO and G$, buyer/owner release or refund
- **DisputeResolution** — Arbitrator voting system, 24h voting period, min 3 votes
- **UserProfile** — User registration, 5-star ratings, reputation scoring

## Development

```bash
npm install
npx hardhat compile
```

## Deploy

```bash
cp .env.example .env
# Add your PRIVATE_KEY to .env

npx hardhat run scripts/deploy.ts --network celo
```

## Activity Scripts (100 Accounts)

Requires `MNEMONIC` in `.env` — derives 100 accounts via HD path `m/44'/60'/0'/0/i`.

```bash
# 1. Fund all 100 accounts from master wallet (0.05 CELO each)
node scripts/activity/fund-accounts.cjs

# 2. Generate contract interactions across all accounts
node scripts/activity/generate-activity.cjs

# 3. Drain all accounts back to master
node scripts/activity/drain-accounts.cjs
```

## Tech Stack

- Solidity 0.8.24
- Hardhat
- OpenZeppelin Contracts
- Celo Blockchain

## Auto Activity

```bash
# Run continuously, cycling through all 100 wallets every 30 minutes
bash scripts/activity/auto-activity.sh
```

Logs are written to `activity.log` in the project root.
