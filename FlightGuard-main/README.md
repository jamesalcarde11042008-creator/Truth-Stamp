# Flight Guard ✈️🛡️

**Parametric Flight Delay Insurance on Stellar**

Flight Guard is a decentralized, parametric insurance platform built on the Stellar network using Soroban smart contracts. It provides automated payouts to travelers when their flights are significantly delayed, removing the need for manual claims or paperwork.

## 🚀 The Vision

Traditional travel insurance is broken. It's slow, bureaucratic, and often feels like it's designed to avoid paying out. Flight Guard changes that by using **Parametric Insurance**—insurance that pays out automatically based on predefined data triggers (like a flight delay) rather than a lengthy claims process.

### Why Flight Guard?
- **Automatic:** No claims, no forms, no calls. The contract settles itself.
- **Instant:** Funds move on Stellar in seconds, often before you even leave the airport.
- **Transparent:** Everything is governed by a Soroban smart contract. You can see the rules and the funds in escrow.
- **Accessible:** Cash out your USDC payout at any of the 350,000+ MoneyGram locations worldwide.

## 🛠️ Project Structure

This repository contains both the smart contract and the interactive dashboard:

- `/FlightGuard-main`: The Soroban smart contract (Rust).
- `/dashboard`: The React-based web application.

## 🔗 Smart Contract Architecture

The core logic resides in a Soroban smart contract that:
1. **Escrows Premiums:** Securely holds user premiums and potential payouts.
2. **Oracle Integration:** Listens for authenticated flight delay reports from a trusted oracle.
3. **Auto-Settlement:** Automatically transfers the payout to the passenger's wallet if the delay threshold (e.g., 180 minutes) is met.

### Key Functions
- `initialize(oracle, usdc)`: Sets up the contract with the authorized oracle and token address.
- `purchase_cover(passenger, flight_id, premium, payout, delay_min)`: Allows a user to buy insurance.
- `oracle_report(flight_id, delay_minutes)`: Triggered by the oracle to report flight status and initiate payouts.
- `claim_payout(flight_id, reported_delay)`: Fallback for manual claims if conditions are met.

## 🚦 Getting Started

### Prerequisites
- [Stellar CLI](https://developers.stellar.org/docs/build/smart-contracts/getting-started/setup#install-the-stellar-cli)
- [Rust & Cargo](https://rustup.rs/)
- [Node.js & npm](https://nodejs.org/)
- [Freighter Wallet](https://www.freighter.app/)

### Contract Development
```bash
cd FlightGuard-main/contracts/FlightGuard
cargo test
```

### Dashboard Setup
```bash
cd dashboard
npm install
npm run dev
```

## 📜 License
This project is licensed under the MIT License - see the LICENSE file for details.

---
*Built for the Stellar/Soroban Ecosystem.*
