// Create src/hooks/use-token-list.ts
import { useState, useEffect, useCallback } from 'react';
import { getSupportedTokens } from '../utils/api-methods';

interface Token {
  chainId: number;
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  logoURI: string;
  providers: string[];
  eip2612: boolean;
  isFoT: boolean;
  tags: string[];
}

export const useTokenList = () => {
  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [selectedChain, setSelectedChain] = useState(1); // Default to Ethereum
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredTokens, setFilteredTokens] = useState<Token[]>([]);

  const fetchTokens = useCallback(async (chainId: number) => {
    setLoading(true);
    setError('');
    
    try {
      const tokenData = await getSupportedTokens(chainId);
      
      // Convert object to array
      const tokenArray = Object.values(tokenData) as Token[];
      setTokens(tokenArray);
      setFilteredTokens(tokenArray);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch tokens');
      setTokens([]);
      setFilteredTokens([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter tokens based on search term
  useEffect(() => {
    if (!searchTerm) {
      setFilteredTokens(tokens);
    } else {
      const filtered = tokens.filter(token =>
        token.symbol.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        token.address.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredTokens(filtered);
    }
  }, [searchTerm, tokens]);

  // Fetch tokens when chain changes
  useEffect(() => {
    fetchTokens(selectedChain);
  }, [selectedChain, fetchTokens]);

  return {
    tokens: filteredTokens,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    selectedChain,
    setSelectedChain,
    refetch: () => fetchTokens(selectedChain),
  };
};