import React, { useMemo } from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
 type TooltipItem,
} from 'chart.js';
import { formatTokenAmount } from '../utils/utility';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

interface AssetAllocationChartProps {
  aggregatedTokens?: any[];
  aggregatedPortfolio?: any;
  type: 'tokens' | 'chains';
}

const AssetAllocationChart: React.FC<AssetAllocationChartProps> = ({
  aggregatedTokens,
  aggregatedPortfolio,
  type
}) => {
  const chartData = useMemo(() => {
    if (type === 'chains' && aggregatedPortfolio?.by_chain) {
      // Chain-based allocation
      const chainData = aggregatedPortfolio.by_chain;
      const labels = chainData.map((chain: any) => chain.chain_name);
      const values = chainData.map((chain: any) => chain.value_usd);
      
      return {
        labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#3B82F6', // Blue - Ethereum
            '#8B5CF6', // Purple - Polygon
            '#F59E0B', // Orange - Arbitrum
            '#10B981', // Green - Base
            '#EF4444', // Red - Others
            '#6366F1', // Indigo
            '#EC4899', // Pink
            '#14B8A6', // Teal
          ],
          borderColor: 'var(--color-component)',
          borderWidth: 2,
          hoverBackgroundColor: [
            '#2563EB',
            '#7C3AED',
            '#D97706',
            '#059669',
            '#DC2626',
            '#4F46E5',
            '#DB2777',
            '#0D9488',
          ],
        }]
      };
    }

    if (type === 'tokens' && aggregatedTokens) {
      // Token-based allocation
      const tokenValues = aggregatedTokens.map((token: any) => {return({
        name: token.symbol,
        value: parseFloat(formatTokenAmount(token.balance, token.decimals, 6)) * (token.symbol === "ETH" ? 3600 : 1),
        symbol: token.symbol
      })});

      console.log('Token Values:', tokenValues,aggregatedTokens);

      // Sort by value and take top 8 tokens
      const sortedTokens = tokenValues
        .sort((a, b) => b.value - a.value)
        .slice(0, 8);

      const labels = sortedTokens.map(token => token.symbol);
      const values = sortedTokens.map(token => token.value);

      return {
        labels,
        datasets: [{
          data: values,
          backgroundColor: [
            '#F7931A', // Bitcoin Orange
            '#627EEA', // Ethereum Blue
            '#26A17B', // Tether Green
            '#3C3C3D', // USDC Dark
            '#F0B90B', // Binance Yellow
            '#FF6B6B', // Red
            '#4ECDC4', // Teal
            '#45B7D1', // Light Blue
          ],
          borderColor: 'var(--color-component)',
          borderWidth: 2,
          hoverBackgroundColor: [
            '#E8851F',
            '#5A6FD8',
            '#229068',
            '#333334',
            '#D99F0A',
            '#FF5252',
            '#26A69A',
            '#42A5F5',
          ],
        }]
      };
    }

    return {
      labels: [],
      datasets: [{
        data: [],
        backgroundColor: [],
      }]
    };
  }, [aggregatedTokens, aggregatedPortfolio, type]);

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: {
          padding: 20,
          usePointStyle: true,
          pointStyle: 'circle',
          color: 'var(--color-font)',
          font: {
            size: 12,
          },
        },
      },
      tooltip: {
        backgroundColor: 'var(--color-component)',
        titleColor: 'var(--color-font)',
        bodyColor: 'var(--color-font)',
        borderColor: 'var(--color-border)',
        borderWidth: 1,
        callbacks: {
          label: function(context: TooltipItem<'pie'>) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((sum: number, val: number) => sum + val, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            
            if (type === 'chains') {
              return `${label}: $${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${percentage}%)`;
            } else {
              return `${label}: $${value.toLocaleString(undefined, { maximumFractionDigits: 2 })} (${percentage}%)`;
            }
          }
        }
      }
    },
    elements: {
      arc: {
        borderWidth: 2,
      }
    },
  };

  if (!chartData.labels.length) {
    return (
      <div className="w-full h-64 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <div className="text-lg mb-2">📊</div>
          <div>No data available</div>
          <div className="text-sm">Connect wallet and add tokens to see allocation</div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-64">
      <Pie data={chartData} options={options} />
    </div>
  );
};

export default AssetAllocationChart;