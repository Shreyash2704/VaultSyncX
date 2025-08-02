import React, { useEffect, useState } from 'react';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';
import { getSupportedChains } from '../utils/api-methods';
import { useQuery } from '@tanstack/react-query';
import { getAggregatedPortfolio } from '../utils/portfolio-aggregator';
import { aggregatorToken } from '../utils/token-aggregator';
import { formatTokenAmount, tokenBalanceToUSD } from '../utils/utility';
import { useUserBalances } from '../hooks/use-user-balances';
import { AiFillWallet } from 'react-icons/ai';
import { FiCopy, FiExternalLink, FiRefreshCw } from 'react-icons/fi';
import AllocationTabs from '../components/AllocationTabs';


declare global {
  namespace JSX {
    interface IntrinsicElements {
      'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export {};

function TokenUSDValue({ token }: { token: any }) {
  const [usd, setUsd] = useState<number | null>(null);

  useEffect(() => {
    let mounted = true;
    tokenBalanceToUSD(token.address, token.balance, token.decimals)
      .then(val => { if (mounted) setUsd(val); });
    return () => { mounted = false; };
  }, [token.address, token.balance, token.decimals]);

  return (
    <span>
      {usd !== null ? `$${usd.toLocaleString(undefined, { maximumFractionDigits: 2 })}` : '...'}
    </span>
  );
}

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum', symbol: 'ETH' },
  { id: 137, name: 'Polygon', symbol: 'MATIC' },
  { id: 42161, name: 'Arbitrum', symbol: 'ARB' },
  { id: 8453, name: 'Base', symbol: 'BASE' },
];

const Dashboard: React.FC = () => {
  // const { walletConnected, loading, connectWallet } = useContext(WalletContext);
  const { open } = useAppKit();
  const { address, isConnected } =
  useAppKitAccount();
  // const {chain, isConnected: isChainConnected} = useAccount();

    const {
      balances,
      loading,
      selectedChain,
      setSelectedChain,
    } = useUserBalances();
    // console.log("User Balances:", balances);

  

  const chainIds = [1, 8453, 42161, 137]; // Example chain IDs

const {
  data: aggregatedPortfolio,
  isLoading: fetchingData,
} = useQuery({
  queryKey: ['aggregatedPortfolio', address, chainIds],
  queryFn: () => getAggregatedPortfolio(address, chainIds),
  enabled: !!address && isConnected,
  staleTime: 60 * 1000, // 1 minute cache
});
const {
  data: aggregatedTokens,
  // isLoading: tokensLoading,
  // error: tokensError,
  // refetch: refetchTokens,
} = useQuery({
  queryKey: ['aggregatedTokens', address, chainIds],
  queryFn: () => aggregatorToken(address, chainIds),
  enabled: !!address && isConnected,
  staleTime: 60 * 1000, // cache for 1 minute
});
const [copiedAddress, setCopiedAddress] = useState<string>('');

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedAddress(text);
      setTimeout(() => setCopiedAddress(''), 2000);
    } catch (err) {
      // console.error('Failed to copy:', err);
    }
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getChainName = (chainId: number) => {
    return SUPPORTED_CHAINS.find(chain => chain.id === chainId)?.name || 'Unknown';
  };

  const getExplorerUrl = (chainId: number, tokenAddress: string) => {
    const explorers = {
      1: 'https://etherscan.io',
      137: 'https://polygonscan.com',
      42161: 'https://arbiscan.io',
      8453: 'https://basescan.org'
    };
    return `${explorers[chainId as keyof typeof explorers] || 'https://etherscan.io'}/token/${tokenAddress}`;
  };

const portfolioValue = aggregatedPortfolio?.total.toFixed(4)

  useEffect(() => {
    const fetchChainData = async () => {
      const res = await getSupportedChains()
    }
    fetchChainData();
  },[])

  

  const handleAccount = () =>{
    if(isConnected){
        open({ view: "Account" })
    }else{
        open({ view: "Connect" })
    }
  }

  // UI: Connect Wallet
  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-font)]">
        {/* <Navbar /> */}
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h2 className="text-2xl font-bold mb-2">Connect your wallet</h2>
          <p className="mb-6 text-center max-w-md">Connect your wallet to start managing your crypto portfolio across multiple EVM chains.</p>
          <div className="flex flex-col gap-3">
            {/* Reown's wallet connect button */}
            
            {/* <appkit-button /> */}
            <button className='bg-[var(--color-component)] p-2' onClick={handleAccount}>{!isConnected ? "Connect wallet" : `${address}`}</button>
          </div>
          <p className="mt-6 text-xs text-gray-400 text-center max-w-xs">
            By connecting, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </div>
    );
  }

  // UI: Loading Data
  if (fetchingData) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-font)]">
      
        <div className="flex flex-col items-center justify-center h-[80vh]">
          <h2 className="text-2xl font-bold mb-2">Portfolio Overview</h2>
          <div className="w-full max-w-2xl bg-[var(--color-component)] rounded-lg p-8 animate-pulse mb-8" style={{ height: 80 }} />
          <div className="w-full max-w-2xl bg-[var(--color-component)] rounded-lg p-8 animate-pulse mb-8" style={{ height: 220 }} />
          <div className="w-full max-w-2xl bg-[var(--color-component)] rounded-lg p-8 animate-pulse" style={{ height: 220 }} />
        </div>
      </div>
    );
  }

  // UI: Dashboard Data
  return (
    <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-font)]">
  
      <div className="max-w-5xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-[var(--color-component)] rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">Total Portfolio Value</div>
            <div className="text-3xl font-bold">${portfolioValue}</div>
            <div className="text-green-400 text-sm mt-1">+1.0%</div>
          </div>
          <div className="bg-[var(--color-component)] rounded-lg p-6">
            <div className="text-sm text-gray-400 mb-1">24h Change</div>
            <div className="text-3xl font-bold">+$123.45</div>
          </div>
        </div>

        {/* ...Portfolio Overview... */}
        {aggregatedPortfolio?.by_category && (
          <div className="bg-[var(--color-component)] rounded-lg p-6 mt-8 mb-8">
            <div className="text-lg font-semibold mb-4">Portfolio by Category</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[var(--color-table-header)]">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Category</th>
                    <th className="px-4 py-2 font-semibold">Value (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {Object.values(aggregatedPortfolio.by_category).map((cat: any) => (
                    <tr key={cat.category_id} className="border-b border-[var(--color-table-header)]">
                      <td className="px-4 py-2">{cat.category_name}</td>
                      <td className="px-4 py-2">${cat.value_usd.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {aggregatedPortfolio?.by_chain && (
          <div className="bg-[var(--color-component)] rounded-lg p-6 mb-8">
            <div className="text-lg font-semibold mb-4">Portfolio by Chain</div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-[var(--color-table-header)]">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Chain</th>
                    <th className="px-4 py-2 font-semibold">Value (USD)</th>
                  </tr>
                </thead>
                <tbody>
                  {aggregatedPortfolio.by_chain.map((chain: any) => (
                    <tr key={chain.chain_id} className="border-b border-[var(--color-table-header)]">
                      <td className="px-4 py-2">{chain.chain_name}</td>
                      <td className="px-4 py-2">${chain.value_usd.toFixed(2)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        
        {/* Controls */}
        <div className="bg-[var(--color-component)] rounded-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            {/* Chain Selector */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium">Chain:</label>
              <select
                value={selectedChain}
                onChange={(e) => setSelectedChain(Number(e.target.value))}
                className="px-3 py-2 rounded border bg-[var(--color-input-bg)] text-[var(--color-input-color)] focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SUPPORTED_CHAINS.map(chain => (
                  <option key={chain.id} value={chain.id}>
                    {chain.name} ({chain.symbol})
                  </option>
                ))}
              </select>
            </div>

            {/* Refresh Button */}
            <div className="flex items-center gap-2">
              {/* <button
                onClick={refetch}
                disabled={loading}
                className="p-2 rounded bg-[var(--color-primary-btn)] text-white hover:opacity-80 disabled:opacity-50 flex items-center gap-2"
              >
                <FiRefreshCw className={loading ? 'animate-spin' : ''} />
                Refresh
              </button> */}
            </div>
          </div>

          {/* Stats */}
          <div className="mt-4 text-sm text-gray-600 mb-4">
            {loading ? 'Loading balances...' : `${balances.length} tokens with balance on ${getChainName(selectedChain)}`}
          </div>

          {/* Balances Table */}
            {!loading && (
            <div className="bg-[var(--color-component)] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                <table className="min-w-full">
                    <thead className="bg-[var(--color-table-header)]">
                    <tr>
                        <th className="px-4 py-3 text-left text-sm font-medium">Token</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Symbol</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Balance</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Address</th>
                        <th className="px-4 py-3 text-left text-sm font-medium">Actions</th>
                    </tr>
                    </thead>
                    <tbody>
                    {balances.map((token) => (
                        <tr key={token.address} className="border-b border-[var(--color-table-header)] hover:bg-[var(--color-table-header)] transition-colors">
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-3">
                            <img
                                src={token.logoURI}
                                alt={token.symbol}
                                className="w-8 h-8 rounded-full"
                                onError={(e) => {
                                e.currentTarget.src = `https://via.placeholder.com/32x32/cccccc/ffffff?text=${token.symbol.charAt(0)}`;
                                }}
                            />
                            <div>
                                <div className="font-medium">{token.name}</div>
                                <div className="text-sm text-gray-500">{getChainName(token.chainId)}</div>
                            </div>
                            </div>
                        </td>
                        <td className="px-4 py-3 font-mono text-sm font-medium">{token.symbol}</td>
                        <td className="px-4 py-3">
                            <div className="font-medium">
                            {parseFloat(token.formattedBalance).toLocaleString(undefined, { 
                                maximumFractionDigits: 6,
                                minimumFractionDigits: 0 
                            })}
                            </div>
                            <div className="text-xs text-gray-500">
                            {token.decimals} decimals
                            </div>
                        </td>
                        <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                            <span className="font-mono text-sm">{formatAddress(token.address)}</span>
                            <button
                                onClick={() => copyToClipboard(token.address)}
                                className="p-1 hover:bg-[var(--color-table-header)] rounded"
                                title="Copy address"
                            >
                                <FiCopy className={`w-3 h-3 ${copiedAddress === token.address ? 'text-green-500' : 'text-gray-400'}`} />
                            </button>
                            </div>
                        </td>
                        <td className="px-4 py-3">
                            <a
                            href={getExplorerUrl(token.chainId, token.address)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1 hover:bg-[var(--color-table-header)] rounded inline-block"
                            title="View on Explorer"
                            >
                            <FiExternalLink className="w-4 h-4 text-gray-400 hover:text-blue-500" />
                            </a>
                        </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
                </div>

                {balances.length === 0 && !loading && (
                    <div>
                    <div className="p-8 text-center text-gray-50">
                        <div>0</div>
                        <AiFillWallet className="mx-auto text-4xl mb-2" />
                        <div>No token balances found on {getChainName(selectedChain)}</div>
                        <div className="text-sm mt-1">Try switching to a different chain or make sure you have tokens on this network</div>
                    </div>
                </div>
                )}
            </div>
            )}

            {/* Loading State */}
            {loading && (
            <div className="bg-[var(--color-component)] rounded-lg p-8">
                <div className="flex items-center justify-center">
                <FiRefreshCw className="animate-spin mr-2" />
                Loading your token balances...
                </div>
            </div>
            )}
        </div>

       
        
        <AllocationTabs
          aggregatedTokens={aggregatedTokens}
          aggregatedPortfolio={aggregatedPortfolio}
        />
        <div className="bg-[var(--color-component)] rounded-lg p-6 mb-8">
          <div className="text-lg font-semibold mb-4">Aggregated Token Holdings</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--color-table-header)]">
                <tr>
                  <th className="px-4 py-2 font-semibold">Token</th>
                  <th className="px-4 py-2 font-semibold">Symbol</th>
                  <th className="px-4 py-2 font-semibold">Balance</th>
                  <th className="px-4 py-2 font-semibold">USD Value</th>
                  {/* <th className="px-4 py-2 font-semibold">Address</th> */}
                  {/* <th className="px-4 py-2 font-semibold">Chain</th> */}
                </tr>
              </thead>
              <tbody>
                {aggregatedTokens && Array.isArray(aggregatedTokens) && aggregatedTokens.length > 0 ? (
                  aggregatedTokens.map((token: any) => (
                    <tr key={token.address} className="border-b border-[var(--color-table-header)]">
                      <td className="px-4 py-2 flex items-center gap-2">
                        {token.logoURI && (
                          <img src={token.logoURI} alt={token.symbol} className="w-5 h-5 rounded-full" />
                        )}
                        {token.name}
                      </td>
                      <td className="px-4 py-2">{token.symbol}</td>
                      <td className="px-4 py-2">{formatTokenAmount(token.balance, token.decimals,6)}</td>
                      <td className="px-4 py-2">
                        {/* USD Value: async call, so you may want to use a state or a child component for each row */}
                        <TokenUSDValue token={token} />
                      </td>
                      {/* <td className="px-4 py-2 font-mono">{token.address}</td> */}
                      {/* <td className="px-4 py-2">{token.chainId}</td> */}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-2" colSpan={6}>No token data available</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        
      </div>
    </div>
  );
};

export default Dashboard;

