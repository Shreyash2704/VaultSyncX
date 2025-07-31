import React, { useState, useEffect } from 'react';
import { getTokenChart, getSupportedTokens } from '../utils/api-methods';
import { FiRefreshCw, FiTrendingUp, FiTrendingDown } from 'react-icons/fi';

interface Token {
  address: string;
  symbol: string;
  name: string;
  logoURI: string;
}

interface ChartDataPoint {
  time: number;
  value: number;
}

interface ChartResponse {
  data: ChartDataPoint[];
}

const SUPPORTED_CHAINS = [
  { id: 1, name: 'Ethereum' },
  { id: 137, name: 'Polygon' },
  { id: 42161, name: 'Arbitrum' },
  { id: 8453, name: 'Base' },
];

const TokenChart: React.FC = () => {
  const [selectedChain, setSelectedChain] = useState(1);
  const [tokens, setTokens] = useState<Token[]>([]);
  const [token1, setToken1] = useState<Token | null>(null);
  const [token2, setToken2] = useState<Token | null>(null);
  const [period, setPeriod] = useState('24H');
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [loadingTokens, setLoadingTokens] = useState(false);

  // Fetch tokens when chain changes
  useEffect(() => {
    fetchTokens();
  }, [selectedChain]);

  // Fetch chart when tokens or period changes
  useEffect(() => {
    if (token1 && token2 && token1.address !== token2.address) {
      fetchChart();
    }
  }, [token1, token2, period, selectedChain]);

  const fetchTokens = async () => {
    setLoadingTokens(true);
    try {
      const response = await getSupportedTokens(selectedChain);
      const tokenArray = Object.values(response) as Token[];
      setTokens(tokenArray);
      
      // Reset selected tokens when chain changes
      setToken1(null);
      setToken2(null);
      setChartData([]);
    } catch (err) {
      console.error('Error fetching tokens:', err);
      setTokens([]);
    } finally {
      setLoadingTokens(false);
    }
  };

  const fetchChart = async () => {
    if (!token1 || !token2) return;
    
    setLoading(true);
    setError('');
    
    try {
      const response: ChartResponse = await getTokenChart(
        selectedChain, 
        token1.address, 
        token2.address, 
        period
      );
      
      setChartData(response.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch chart data');
      setChartData([]);
    } finally {
      setLoading(false);
    }
  };

  const calculatePriceChange = () => {
    if (chartData.length < 2) return { change: 0, percentage: 0 };
    
    const firstPrice = chartData[0].value;
    const lastPrice = chartData[chartData.length - 1].value;
    const change = lastPrice - firstPrice;
    const percentage = (change / firstPrice) * 100;
    
    return { change, percentage };
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp * 1000).toLocaleDateString();
  };

  const renderChart = () => {
    if (chartData.length === 0) return null;

    const width = 800;
    const height = 300;
    const padding = 40;

    const values = chartData.map(d => d.value);
    const times = chartData.map(d => d.time);
    const minValue = Math.min(...values);
    const maxValue = Math.max(...values);
    const valueRange = maxValue - minValue || 1;
    const minTime = Math.min(...times);
    const maxTime = Math.max(...times);
    const timeRange = maxTime - minTime || 1;

    const points = chartData.map((d, i) => {
      const x = padding + ((d.time - minTime) / timeRange) * (width - 2 * padding);
      const y = height - padding - ((d.value - minValue) / valueRange) * (height - 2 * padding);
      return `${x},${y}`;
    }).join(' ');

    const { percentage } = calculatePriceChange();
    const strokeColor = percentage >= 0 ? '#10B981' : '#EF4444';

    return (
      <div className="w-full">
        <svg width="100%" height={height} viewBox={`0 0 ${width} ${height}`} className="border rounded">
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#e5e7eb" strokeWidth="1" opacity="0.3"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
          
          {/* Chart line */}
          <polyline
            fill="none"
            stroke={strokeColor}
            strokeWidth="2"
            points={points}
          />
          
          {/* Gradient fill */}
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={strokeColor} stopOpacity="0.3"/>
              <stop offset="100%" stopColor={strokeColor} stopOpacity="0"/>
            </linearGradient>
          </defs>
          <polygon
            fill="url(#chartGradient)"
            points={`${padding},${height-padding} ${points} ${width-padding},${height-padding}`}
          />
          
          {/* Y-axis labels */}
          <text x="10" y="20" fontSize="12" fill="#6b7280">{maxValue.toFixed(4)}</text>
          <text x="10" y={height-10} fontSize="12" fill="#6b7280">{minValue.toFixed(4)}</text>
          
          {/* X-axis labels */}
          <text x={padding} y={height-5} fontSize="12" fill="#6b7280">{formatTimestamp(minTime)}</text>
          <text x={width-padding-60} y={height-5} fontSize="12" fill="#6b7280">{formatTimestamp(maxTime)}</text>
        </svg>
      </div>
    );
  };

  const { change, percentage } = calculatePriceChange();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-[var(--color-bg)] text-[var(--color-font)]">
      <div className="bg-[var(--color-component)] rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">Token Pair Chart</h2>
        
        {/* Controls */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Chain Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Chain:</label>
            <select
              value={selectedChain}
              onChange={(e) => setSelectedChain(Number(e.target.value))}
              className="w-full px-3 py-2 rounded border bg-[var(--color-input-bg)] text-[var(--color-input-color)]"
            >
              {SUPPORTED_CHAINS.map(chain => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          {/* Token 1 Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Token 1 (Base):</label>
            <select
              value={token1?.address || ''}
              onChange={(e) => {
                const selected = tokens.find(t => t.address === e.target.value);
                setToken1(selected || null);
              }}
              disabled={loadingTokens}
              className="w-full px-3 py-2 rounded border bg-[var(--color-input-bg)] text-[var(--color-input-color)] disabled:opacity-50"
            >
              <option value="">Select Token 1</option>
              {tokens.map(token => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          {/* Token 2 Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Token 2 (Quote):</label>
            <select
              value={token2?.address || ''}
              onChange={(e) => {
                const selected = tokens.find(t => t.address === e.target.value);
                setToken2(selected || null);
              }}
              disabled={loadingTokens}
              className="w-full px-3 py-2 rounded border bg-[var(--color-input-bg)] text-[var(--color-input-color)] disabled:opacity-50"
            >
              <option value="">Select Token 2</option>
              {tokens.map(token => (
                <option key={token.address} value={token.address}>
                  {token.symbol} - {token.name}
                </option>
              ))}
            </select>
          </div>

          {/* Period Selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Period:</label>
            <select
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="w-full px-3 py-2 rounded border bg-[var(--color-input-bg)] text-[var(--color-input-color)]"
            >
              <option value="24H">24 Hours</option>
              <option value="1W">1 Week</option>
              <option value="1M">1 Month</option>
              <option value="1Y">1 Year</option>
              <option value="AllTime">All Time</option>
            </select>
          </div>
        </div>

        {/* Chart Header */}
        {token1 && token2 && (
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <h3 className="text-lg font-semibold">
                {token1.symbol}/{token2.symbol}
              </h3>
              {chartData.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className={`flex items-center gap-1 text-sm font-medium ${
                    percentage >= 0 ? 'text-green-500' : 'text-red-500'
                  }`}>
                    {percentage >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                    {percentage >= 0 ? '+' : ''}{percentage.toFixed(2)}%
                  </span>
                  <span className="text-sm text-gray-500">({period})</span>
                </div>
              )}
            </div>
            
            <button
              onClick={fetchChart}
              disabled={loading || !token1 || !token2}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
            >
              <FiRefreshCw className={loading ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        )}

        {/* Chart Area */}
        <div className="bg-white rounded-lg p-4 min-h-[400px] flex items-center justify-center">
          {loadingTokens && (
            <div className="text-center">
              <FiRefreshCw className="animate-spin mx-auto mb-2 text-xl" />
              <div>Loading tokens...</div>
            </div>
          )}
          
          {!loadingTokens && !token1 && !token2 && (
            <div className="text-center text-gray-500">
              <div className="text-lg mb-2">Select two tokens to view price chart</div>
              <div className="text-sm">Choose a base token and quote token from the dropdowns above</div>
            </div>
          )}
          
          {!loadingTokens && token1 && token2 && token1.address === token2.address && (
            <div className="text-center text-gray-500">
              <div>Please select different tokens to compare</div>
            </div>
          )}
          
          {loading && (
            <div className="text-center">
              <FiRefreshCw className="animate-spin mx-auto mb-2 text-xl" />
              <div>Loading chart data...</div>
            </div>
          )}
          
          {error && (
            <div className="text-center text-red-500">
              <div className="mb-2">Error loading chart:</div>
              <div className="text-sm">{error}</div>
              <button 
                onClick={fetchChart}
                className="mt-2 px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Retry
              </button>
            </div>
          )}
          
          {!loading && !error && chartData.length > 0 && renderChart()}
          
          {!loading && !error && chartData.length === 0 && token1 && token2 && token1.address !== token2.address && (
            <div className="text-center text-gray-500">
              <div>No chart data available for this token pair</div>
              <div className="text-sm mt-1">Try a different time period or token pair</div>
            </div>
          )}
        </div>

        {/* Chart Data Info */}
        {chartData.length > 0 && (
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="bg-[var(--color-table-header)] rounded p-3">
              <div className="text-gray-500">Data Points</div>
              <div className="font-semibold">{chartData.length}</div>
            </div>
            <div className="bg-[var(--color-table-header)] rounded p-3">
              <div className="text-gray-500">Current Price</div>
              <div className="font-semibold">{chartData[chartData.length - 1]?.value.toFixed(6)}</div>
            </div>
            <div className="bg-[var(--color-table-header)] rounded p-3">
              <div className="text-gray-500">Change</div>
              <div className={`font-semibold ${percentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {change >= 0 ? '+' : ''}{change.toFixed(6)}
              </div>
            </div>
            <div className="bg-[var(--color-table-header)] rounded p-3">
              <div className="text-gray-500">Period</div>
              <div className="font-semibold">{period}</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TokenChart;