# VaultSyncX

VaultSyncX is a cross-chain crypto portfolio dashboard and DeFi trading platform built with **React**, **TypeScript**, and **Vite**.  
It aggregates wallet balances, enables trustless cross-chain swaps, and provides comprehensive portfolio analytics across multiple EVM chains.

## Features

- **Multi-chain Portfolio Overview:**  
  View your total crypto holdings across Ethereum, Polygon, Arbitrum, Base, and more.

- **Cross-Chain Atomic Swaps:**  
  Execute trustless token swaps across different blockchains using 1inch Fusion+ protocol with cryptographic hashlock security.

- **Interactive Portfolio Visualization:**  
  Professional pie charts showing asset allocation by tokens and chains with real-time data updates.

- **Chain-wise & Category-wise Breakdown:**  
  See your balances grouped by chain and asset category (Tokens, Native, Protocols).

- **Aggregated Token Holdings:**  
  Get a unified view of each token (e.g., ETH, USDC) across all supported chains with automatic aggregation.

- **Real-time Transaction Monitoring:**  
  Track swap progress with detailed status updates (Processing → Signed → Submitted → Placed → Confirmed).

- **Token USD Value Calculation:**  
  Real-time conversion of token balances to USD using CoinGecko price APIs.

- **Advanced Trading Interface:**  
  Professional swap UI with quote comparison, price impact analysis, and slippage protection.

- **Wallet Connect:**  
  Universal wallet connectivity supporting 300+ wallets via WalletConnect v3.

- **Light/Dark Theme Support:**  
  Responsive UI with dynamic theming using CSS variables and ThemeContext.

## Tech Stack

**Frontend Framework:**
- React 18 + TypeScript + Vite
- React Router (SPA navigation)
- Tailwind CSS (utility-first styling)

**Blockchain Integration:**
- Wagmi v2 (Ethereum interactions)
- WalletConnect v3 AppKit (wallet connectivity)
- Viem (low-level Ethereum utilities)

**DeFi Protocols:**
- 1inch Fusion+ API (cross-chain swaps)
- Custom hashlock cryptography (atomic swaps)

**Data & Visualization:**
- Chart.js + react-chartjs-2 (portfolio charts)
- @tanstack/react-query (data fetching & caching)
- Axios (API calls)

**State Management:**
- React Context (global state)
- Custom hooks (business logic)

## Getting Started

1. **Clone the repository:**
   ```sh
   git clone https://github.com/your-username/VaultSyncX.git
   cd VaultSyncX
   ```

2. **Install dependencies:**
   ```sh
   npm install
   ```

3. **Set up environment variables:**
   ```sh
   cp .env.example .env
   # Add your API keys
   ```

4. **Start the development server:**
   ```sh
   npm run dev
   ```

5. **Connect your wallet and explore your portfolio!**

## Core Features Walkthrough

### 📊 Portfolio Dashboard
- Multi-chain balance aggregation
- Interactive pie charts for asset allocation
- Real-time USD valuation
- Token holdings across all chains

### 🔄 Cross-Chain Swaps
- Quote comparison across multiple protocols
- Trustless atomic swaps using hashlock cryptography
- No bridge required - direct chain-to-chain transfers
- Real-time transaction status monitoring

### 📈 Analytics & Visualization
- Asset allocation by tokens and chains
- Portfolio performance tracking
- Interactive charts with Chart.js
- Responsive design for all devices

## API Integration

**Portfolio Management:**
- **Portfolio API:** Fetches balances, categories, and chain data
- **Token Whitelist API:** Provides metadata for supported tokens
- **Balance API:** Returns token balances for specific chains
- **Price API:** Real-time USD conversion rates

**Cross-Chain Swaps:**
- **1inch Fusion+ Quote API:** Real-time cross-chain pricing
- **Order Builder API:** Creates cryptographically signed orders
- **Relayer Network:** Decentralized order execution
- **Secret Management:** Atomic swap completion system

## Folder Structure

```
src/
├── pages/           # Main application pages
│   ├── Dashboard.tsx    # Portfolio overview
│   ├── Swap.tsx         # Cross-chain swap interface
│   ├── Aggregator.tsx   # Token aggregation
│   └── ChartPage.tsx    # Portfolio analytics
├── components/      # Reusable UI components
├── hooks/          # Custom React hooks
├── utils/          # API methods and utilities
├── context/        # Global state providers
└── types/          # TypeScript definitions
```

## Customization

- **Add more chains:**  
  Update supported `chainIds` in configuration to include additional EVM networks.

- **Styling:**  
  Modify CSS variables in `ThemeContext.tsx` for custom color schemes and themes.

- **Add new tokens:**  
  Extend token lists in the whitelist API integration.

## Security Features

- **Non-custodial Architecture:** Users maintain full control of private keys
- **Atomic Swap Security:** Cryptographic guarantees for cross-chain transactions
- **Hashlock Cryptography:** Trustless transaction completion
- **Input Validation:** Comprehensive sanitization and validation

## License

MIT

---

**VaultSyncX** — Your unified cross-chain portfolio manager and DeFi trading platform.
