import React, { useState } from 'react';
import AssetAllocationChart from './AssetAllocationChart';

interface AllocationTabsProps {
  aggregatedTokens?: any[];
  aggregatedPortfolio?: any;
}

const AllocationTabs: React.FC<AllocationTabsProps> = ({
  aggregatedTokens,
  aggregatedPortfolio
}) => {
  const [activeTab, setActiveTab] = useState<'tokens' | 'chains'>('tokens');

  const totalValue = aggregatedPortfolio?.total || 0;
  const changePercent = '+0.5%'; // You can calculate this from your data

  return (
    <div className="bg-[var(--color-component)] rounded-lg p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
        <div>
          <div className="text-lg font-semibold mb-2">Asset Allocation</div>
          <div className="text-2xl font-bold mb-1">
            ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <div className="text-green-400 text-sm mb-4">
            Current: {changePercent}
          </div>
        </div>

        {/* Tab Buttons */}
        <div className="flex bg-[var(--color-table-header)] rounded-lg p-1">
          <button
            onClick={() => setActiveTab('tokens')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'tokens'
                ? 'bg-[var(--color-primary-btn-bg)] text-[var(--color-primary-btn-text)]'
                : 'text-[var(--color-font)] hover:bg-[var(--color-component)]'
            }`}
          >
            By Tokens
          </button>
          <button
            onClick={() => setActiveTab('chains')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
              activeTab === 'chains'
                ? 'bg-[var(--color-primary-btn-bg)] text-[var(--color-primary-btn-text)]'
                : 'text-[var(--color-font)] hover:bg-[var(--color-component)]'
            }`}
          >
            By Chains
          </button>
        </div>
      </div>

      {/* Chart Container */}
      <AssetAllocationChart
        aggregatedTokens={aggregatedTokens}
        aggregatedPortfolio={aggregatedPortfolio}
        type={activeTab}
      />

      {/* Summary Stats */}
      <div className="mt-6 pt-4 border-t border-[var(--color-table-header)]">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-sm text-gray-400">Total Assets</div>
            <div className="font-semibold">
              {activeTab === 'tokens' 
                ? aggregatedTokens?.length || 0 
                : aggregatedPortfolio?.by_chain?.length || 0
              }
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Largest Position</div>
            <div className="font-semibold">
              {activeTab === 'tokens' ? 'ETH' : 'Ethereum'}
            </div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Diversification</div>
            <div className="font-semibold text-green-400">Good</div>
          </div>
          <div>
            <div className="text-sm text-gray-400">Risk Level</div>
            <div className="font-semibold text-yellow-400">Medium</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AllocationTabs;