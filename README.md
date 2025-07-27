# VaultSyncX

VaultSyncX is a cross-chain crypto portfolio dashboard built with **React**, **TypeScript**, and **Vite**.  
It aggregates wallet balances, token holdings, and portfolio analytics across multiple EVM chains.

## Features

- **Multi-chain Portfolio Overview:**  
  View your total crypto holdings across Ethereum, Arbitrum, Base, and more.

- **Chain-wise & Category-wise Breakdown:**  
  See your balances grouped by chain and asset category (Tokens, Native, Protocols).

- **Aggregated Token Holdings:**  
  Get a unified view of each token (e.g., ETH, USDC) across all supported chains.

- **Token USD Value Calculation:**  
  Real-time conversion of token balances to USD using price APIs.

- **Wallet Connect:**  
  Connect your wallet to view and manage your assets securely.

- **Light/Dark Theme Support:**  
  UI adapts to your preferred theme using CSS variables and ThemeContext.

## Tech Stack

- React + TypeScript + Vite
- MobX (state management)
- @tanstack/react-query (data fetching & caching)
- Wagmi (wallet integration)
- Tailwind CSS (styling)
- Axios (API calls)

## Getting Started

1. **Install dependencies:**
   ```sh
   npm install
   ```

2. **Start the development server:**
   ```sh
   npm run dev
   ```

3. **Connect your wallet and explore your portfolio!**

## API Integration

- **Portfolio API:**  
  Fetches balances, categories, and chain data for a wallet address.

- **Token Whitelist API:**  
  Provides metadata for supported tokens on each chain.

- **Balance API:**  
  Returns token balances for a wallet on a specific chain.

- **Price API:**  
  Converts token balances to USD.

## Folder Structure

- `src/pages/` — Main dashboard and swap UI
- `src/utils/` — API methods and aggregator functions
- `src/context/` — Theme context and global providers
- `src/store/` — MobX stores for app state

## Customization

- **Add more chains:**  
  Update `chainIds` in `Dashboard.tsx` to support additional EVM networks.

- **Styling:**  
  Modify CSS variables in `ThemeContext.tsx` for custom themes.

## License

MIT

---

**VaultSyncX** — Your unified cross-chain portfolio manager.
