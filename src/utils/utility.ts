import { getTokenPrice } from './api-methods';

export function parseTokenAmount(amount: string, decimals: number): bigint {
  return BigInt(Math.floor(Number(amount) * 10 ** decimals));
}

export function formatTokenAmount(amount: bigint, decimals: number,toFixed:number=2): string {
  console.log("formatTokenAmount", amount, decimals, toFixed);
  return (Number(amount) / 10 ** decimals).toFixed(toFixed).toString();
}

export function formatAddress(address: string): string {
  if (!address || address.length < 10) return address;
  return `${address.slice(0, 6)}...${address.slice(-6)}`;
}

// Converts a token balance to USD using the price API
export async function tokenBalanceToUSD(tokenAddress: string, balance: string, decimals: number): Promise<number> {
  if (!tokenAddress || !balance || !decimals) return 0;

  // Convert balance to human-readable format
  const readableBalance = Number(balance) / Math.pow(10, decimals);

  // Fetch price from price API
  const priceData = await getTokenPrice(tokenAddress);
  const price = priceData?.[tokenAddress] ?? 0;

  // Calculate USD value
  return readableBalance * price;
}

// Usage example:
// const usdValue =