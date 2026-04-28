# Flight Guard ✈️🛡️

**Parametric Flight Delay Insurance on Stellar**

Flight Guard is a decentralized, parametric insurance platform built on the Stellar network using Soroban smart contracts. It provides automated payouts to travelers when their flights are significantly delayed, removing the need for manual claims or paperwork.

## 🚀 Problem & Solution

### The Problem
Traditional travel insurance is slow, bureaucratic, and frustrating. If your flight is delayed, you typically have to:
- File complex claim forms.
- Upload boarding passes and delay certificates.
- Wait weeks or months for a decision.

### The Solution
Flight Guard uses **Parametric Insurance**:
- **Automatic:** No claims needed. The smart contract monitors flight data.
- **Instant:** Payouts are triggered as soon as the delay threshold (e.g., 3 hours) is met.
- **Trustless:** Funds are escrowed in a Soroban smart contract and released by an independent oracle.

## 🛠️ How It Works

1.  **Buy Cover:** A traveler pays a small premium (e.g., 5 USDC) before their flight.
2.  **On-Chain Escrow:** The premium and potential payout are secured in the smart contract.
3.  **Oracle Monitoring:** An independent oracle (data provider) monitors airport feeds.
4.  **Automatic Settlement:** If the flight is delayed past the threshold, the contract automatically sends the payout (e.g., 200 USDC) to the traveler's wallet.

## 🔗 Smart Contract Details

- **Network:** Stellar Testnet
- **Contract ID:** `CC7VMNV5B4L3IHKMPUKLBEBVQ42YCH3J57ZI2SLWQF4S45EDPA6T3JUK`
- **Mock USDC Asset:** `CB4EBFPJ4UGELC4DYVB5PL7AZB3QKTTUMK7M7PE2CAEY5NLI24AHTCQ5`
- **Explorer Link:** [Stellar Expert (Testnet)](https://stellar.expert/explorer/testnet/contract/CC7VMNV5B4L3IHKMPUKLBEBVQ42YCH3J57ZI2SLWQF4S45EDPA6T3JUK)
- **Stellar Lab Link:** [Invoke Contract](https://lab.stellar.org/r/testnet/contract/CC7VMNV5B4L3IHKMPUKLBEBVQ42YCH3J57ZI2SLWQF4S45EDPA6T3JUK)

## 💻 Tech Stack

- **Smart Contracts:** Soroban (Rust SDK)
- **Frontend:** React + Vite + Tailwind CSS + Shadcn UI
- **Wallet Support:** Freighter (Stellar)
- **SDKs:** `@stellar/stellar-sdk`, `@stellar/freighter-api`

## 🚦 Getting Started

### Prerequisites
- [Freighter Wallet](https://www.freighter.app/) extension installed.
- Freighter set to **Testnet**.
- Testnet account funded with XLM and the mock USDC asset.

### Local Development
1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
4. Open [http://localhost:8080](http://localhost:8080) in your browser.

---
*Built for the Stellar/Soroban Ecosystem.*
