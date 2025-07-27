import React, { useContext, useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { WalletContext } from '../context/WalletContext';
import { useAppKit, useAppKitAccount, useDisconnect } from '@reown/appkit/react';
import { getPortfolio, getSupportedChains } from '../utils/api-methods';
import { useQuery } from '@tanstack/react-query';
import { useAccount } from 'wagmi';
import { getAggregatedPortfolio } from '../utils/portfolio-aggregator';
import { aggregatorToken } from '../utils/token-aggregator';
import { tokenBalanceToUSD } from '../utils/utility';


declare global {
  namespace JSX {
    interface IntrinsicElements {
      'appkit-button': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement>;
    }
  }
}

export {};

const Dashboard: React.FC = () => {
  // const { walletConnected, loading, connectWallet } = useContext(WalletContext);
  const { open, close } = useAppKit();
  const { address, isConnected, caipAddress, status, embeddedWalletInfo } =
  useAppKitAccount();
  // const {chain, isConnected: isChainConnected} = useAccount();

  
  const [fetchingData, setfetchingData] = useState(false)

  // const {
  //   data: portfolioData,
  //   isLoading: portfolioLoading,
  //   error: portfolioError,
  //   refetch: refetchPortfolio,
  // } = useQuery({
  //   queryKey: ['portfolio', address],
  //   queryFn: async() => getPortfolio(address,chain?.id),
  //   enabled: !!address && isConnected,
  // });

  

  const chainIds = [1, 8453, 42161]; // Example chain IDs

const {
  data: aggregatedPortfolio,
  isLoading,
  error,
  refetch,
} = useQuery({
  queryKey: ['aggregatedPortfolio', address, chainIds],
  queryFn: () => getAggregatedPortfolio(address, chainIds),
  enabled: !!address && isConnected,
  staleTime: 60 * 1000, // 1 minute cache
});
const {
  data: aggregatedTokens,
  isLoading: tokensLoading,
  error: tokensError,
  refetch: refetchTokens,
} = useQuery({
  queryKey: ['aggregatedTokens', address, chainIds],
  queryFn: () => aggregatorToken(address, chainIds),
  enabled: !!address && isConnected,
  staleTime: 60 * 1000, // cache for 1 minute
});


console.log("Aggregated Portfolio:", aggregatedPortfolio);
console.log("Aggregated Tokens:", aggregatedTokens);

const portfolioValue = aggregatedPortfolio?.total.toFixed(4)

  useEffect(() => {
    const fetchChainData = async () => {
      const res = await getSupportedChains()
      console.log("Supported Chains:", res);
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

        <div className="bg-[var(--color-component)] rounded-lg p-6 mb-8">
          <div className="text-lg font-semibold mb-2">Portfolio Overview</div>
          <div className="text-2xl font-bold mb-1">${portfolioValue}</div>
          <div className="text-green-400 text-sm mb-4">Last 30 Days: +1.0%</div>
          {/* Placeholder for chart */}
          <div className="w-full h-32 bg-[var(--color-table-header)] rounded mb-2 flex items-center justify-center text-gray-400">[Chart]</div>
        </div>
        <div className="bg-[var(--color-component)] rounded-lg p-6 mb-8">
          <div className="text-lg font-semibold mb-2">Asset Allocation</div>
          <div className="text-2xl font-bold mb-1">100%</div>
          <div className="text-green-400 text-sm mb-4">Current: +0.5%</div>
          {/* Placeholder for bar chart */}
          <div className="w-full h-24 bg-[var(--color-table-header)] rounded flex items-center justify-center text-gray-400">[Bar Chart]</div>
        </div>
        <div className="bg-[var(--color-component)] rounded-lg p-6 mb-8">
          <div className="text-lg font-semibold mb-4">Aggregated Token Holdings</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-[var(--color-table-header)]">
                <tr>
                  <th className="px-4 py-2 font-semibold">Token</th>
                  <th className="px-4 py-2 font-semibold">Symbol</th>
                  {/* <th className="px-4 py-2 font-semibold">Balance</th> */}
                  <th className="px-4 py-2 font-semibold">USD Value</th>
                  <th className="px-4 py-2 font-semibold">Address</th>
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
                      {/* <td className="px-4 py-2">{Number(token.balance).toLocaleString(undefined, { maximumFractionDigits: 6 })}</td> */}
                      <td className="px-4 py-2">
                        {/* USD Value: async call, so you may want to use a state or a child component for each row */}
                        <TokenUSDValue token={token} />
                      </td>
                      <td className="px-4 py-2 font-mono">{token.address}</td>
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