import { getWhiteListedTokens, getBalance } from './api-methods';

// Aggregates token balances and info across multiple chains for a wallet address
export async function aggregatorToken(address: string | undefined, chainIds: number[]) {
  if (!address || !chainIds || chainIds.length === 0) return [];

  // Use a map to aggregate by token address
  const tokenMap: Record<string, any> = {};

  for (const chainId of chainIds) {
    // 1. Get whitelisted tokens for this chain
    const whiteListedTokensRes = await getWhiteListedTokens(chainId);
    const whiteListedTokens = whiteListedTokensRes || {};

    // 2. Get balances for this chain and address
    const balancesRes = await getBalance(address, chainId);
    const balances = balancesRes || {};

    // 3. Aggregate tokens with non-zero balance and available info
    Object.entries(balances).forEach(([tokenAddress, rawBalance]: [string, string]) => {
      const tokenInfo = whiteListedTokens[tokenAddress];
      if (!tokenInfo) return; // skip if token info not present
      if (rawBalance === "0" || rawBalance === "0.0") return; // skip zero balance

      if (!tokenMap[tokenAddress]) {
        tokenMap[tokenAddress] = {
          chainId: tokenInfo.chainId,
          symbol: tokenInfo.symbol,
          name: tokenInfo.name,
          address: tokenInfo.address,
          decimals: tokenInfo.decimals,
          logoURI: tokenInfo.logoURI,
          providers: tokenInfo.providers,
          eip2612: tokenInfo.eip2612,
          isFoT: tokenInfo.isFoT,
          displayedSymbol: tokenInfo.displayedSymbol,
          tags: tokenInfo.tags,
          balance: 0,
        };
      }
      // Sum balances (convert to number for addition)
      tokenMap[tokenAddress].balance += Number(rawBalance);
    });
  }

  // Convert map to array and filter out zero balances (shouldn't be needed, but for safety)
  return Object.values(tokenMap).filter(token => token.balance > 0);
}