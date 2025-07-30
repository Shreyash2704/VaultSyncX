// Create src/hooks/use-user-balances.ts
import { useState, useEffect, useCallback } from 'react';
import { getBalance, getSupportedTokens } from '../utils/api-methods';
import { useAccount } from 'wagmi';

interface UserTokenBalance {
  address: string;
  symbol: string;
  name: string;
  balance: string;
  decimals: number;
  logoURI: string;
  chainId: number;
  formattedBalance: string;
}

export const useUserBalances = () => {
  const { address } = useAccount();
  const [balances, setBalances] = useState<UserTokenBalance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState(1);

  const fetchUserBalances = useCallback(async (chainId: number) => {
    if (!address) {
      setBalances([]);
      return;
    }

    setLoading(true);
    setError('');
    
    try {
      // Fetch user balances and supported tokens in parallel
      const [balanceData, tokenData] = await Promise.all([
        getBalance(address, chainId),
        getSupportedTokens(chainId)
      ]);

      // Filter tokens that have balance > 0
      const userTokens: UserTokenBalance[] = [];
      
      Object.entries(balanceData).forEach(([tokenAddress, balance]) => {
        if (balance && balance !== '0') {
          const tokenInfo = tokenData[tokenAddress];
          if (tokenInfo) {
            const formattedBalance = (Number(balance) / Math.pow(10, tokenInfo.decimals)).toFixed(6);
            
            userTokens.push({
              address: tokenAddress,
              symbol: tokenInfo.symbol,
              name: tokenInfo.name,
              balance: balance as string,
              decimals: tokenInfo.decimals,
              logoURI: tokenInfo.logoURI,
              chainId: chainId,
              formattedBalance: formattedBalance
            });
          }
        }
      });

      setBalances(userTokens);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch balances');
      setBalances([]);
    } finally {
      setLoading(false);
    }
  }, [address]);

  // Fetch balances when chain or address changes
  useEffect(() => {
    fetchUserBalances(selectedChain);
  }, [selectedChain, fetchUserBalances]);

  return {
    balances,
    loading,
    error,
    selectedChain,
    setSelectedChain,
    refetch: () => fetchUserBalances(selectedChain),
  };
};