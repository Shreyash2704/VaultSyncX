// hooks/useFusionPlusSwap.ts
import { type Address } from 'viem';
// Example React component for Fusion+ (Cross-Chain)
import React, { useState } from 'react';
import { useAccount, useConnect, useDisconnect,useSignTypedData } from 'wagmi';
import { injected } from 'wagmi/connectors';

const FUSION_PLUS_API_BASE = 'https://api.1inch.dev/fusion-plus';
const API_KEY = import.meta.env.VITE_1INCH_API_KEY;

interface CrossChainSwapParams {
  amount: string;
  srcChainId: number;
  dstChainId: number;
  srcTokenAddress: Address;
  dstTokenAddress: Address;
  enableEstimate?: boolean;
}

interface Quote {
  presets: {
    [key: string]: {
      secretsCount: number;
      auctionStartAmount: string;
      auctionEndAmount: string;
    };
  };
  srcChainId: number;
  dstChainId: number;
}

interface HashLockData {
  hashLock: string;
  secrets: string[];
  secretHashes: string[];
}

interface Order {
  // Order structure for cross-chain swaps
  maker: Address;
  receiver: Address;
  makerAsset: Address;
  takerAsset: Address;
  makingAmount: string;
  takingAmount: string;
  salt: string;
  makerTraits: string;
}

enum PresetEnum {
  fast = 'fast',
  medium = 'medium',
  slow = 'slow'
}

enum OrderStatus {
  Created = 'Created',
  Pending = 'Pending',
  Executed = 'Executed',
  Expired = 'Expired',
  Refunded = 'Refunded'
}

export const useFusionPlusSwap = () => {
  const { address } = useAccount();
  const { signTypedDataAsync } = useSignTypedData();
  const [isLoading, setIsLoading] = useState(false);
  const [orderHash, setOrderHash] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('idle');

  // Generate random secret for atomic swaps
  const generateSecret = (): string => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return '0x' + Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  };

  // Hash secret using keccak256 (simplified version)
  const hashSecret = (secret: string): string => {
    // In a real implementation, you'd use keccak256 from ethers or viem
    // This is a placeholder - you should use proper keccak256 hashing
    return secret; // Replace with actual hashing
  };

  // Step 1: Get Cross-Chain Quote
  const getQuote = async (params: CrossChainSwapParams): Promise<Quote> => {
    const queryParams = new URLSearchParams({
      amount: params.amount,
      srcChainId: params.srcChainId.toString(),
      dstChainId: params.dstChainId.toString(),
      srcTokenAddress: params.srcTokenAddress,
      dstTokenAddress: params.dstTokenAddress,
      walletAddress: address!,
      enableEstimate: (params.enableEstimate || true).toString()
    });

    const response = await fetch(
      `${FUSION_PLUS_API_BASE}/v1.0/quote?${queryParams}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get cross-chain quote');
    }

    return await response.json();
  };

  // Step 2: Generate Secrets and Hash Locks
  const generateSecrets = (secretsCount: number): HashLockData => {
    const secrets = Array.from({ length: secretsCount }, () => generateSecret());
    const secretHashes = secrets.map(secret => hashSecret(secret));
    
    // For single fill, use the secret directly as hashLock
    // For multiple fills, you'd need to create a Merkle tree
    const hashLock = secrets.length === 1 
      ? secrets[0] 
      : secrets[0]; // Simplified - implement Merkle tree for multiple fills

    return {
      hashLock,
      secrets,
      secretHashes
    };
  };

  // Step 3: Create Cross-Chain Order
  const createOrder = async (
    quote: Quote, 
    hashLockData: HashLockData, 
    preset: PresetEnum = PresetEnum.fast
  ) => {
    const response = await fetch(
      `${FUSION_PLUS_API_BASE}/v1.0/order`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          walletAddress: address!,
          hashLock: hashLockData.hashLock,
          preset,
          source: 'vite-wagmi-fusion-plus',
          secretHashes: hashLockData.secretHashes,
          srcChainId: quote.srcChainId,
          dstChainId: quote.dstChainId
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to create cross-chain order');
    }

    return await response.json();
  };

  // Step 4: Sign Cross-Chain Order
  const signOrder = async (order: Order, srcChainId: number) => {
    const domain = {
      name: '1inch Fusion+',
      version: '1',
      chainId: BigInt(srcChainId),
      verifyingContract: order.salt as Address
    };

    const types = {
      Order: [
        { name: 'salt', type: 'uint256' },
        { name: 'maker', type: 'address' },
        { name: 'receiver', type: 'address' },
        { name: 'makerAsset', type: 'address' },
        { name: 'takerAsset', type: 'address' },
        { name: 'makingAmount', type: 'uint256' },
        { name: 'takingAmount', type: 'uint256' },
        { name: 'makerTraits', type: 'uint256' }
      ]
    } as const;

    const signature = await signTypedDataAsync({
      domain,
      types,
      primaryType: 'Order',
      message: {
        salt: BigInt(order.salt),
        maker: order.maker,
        receiver: order.receiver,
        makerAsset: order.makerAsset,
        takerAsset: order.takerAsset,
        makingAmount: BigInt(order.makingAmount),
        takingAmount: BigInt(order.takingAmount),
        makerTraits: BigInt(order.makerTraits)
      }
    });

    return signature;
  };

  // Step 5: Submit Cross-Chain Order
  const submitOrder = async (
    srcChainId: number,
    order: Order,
    quoteId: string,
    secretHashes: string[]
  ) => {
    const response = await fetch(
      `${FUSION_PLUS_API_BASE}/v1.0/order/submit`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          srcChainId,
          order,
          quoteId,
          secretHashes
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to submit cross-chain order');
    }

    const result = await response.json();
    return result.hash;
  };

  // Step 6: Get Ready-to-Accept Secret Fills
  const getReadyToAcceptSecretFills = async (orderHash: string) => {
    const response = await fetch(
      `${FUSION_PLUS_API_BASE}/v1.0/orders/${orderHash}/ready-to-accept-secret-fills`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get ready fills');
    }

    return await response.json();
  };

  // Step 7: Submit Secret for Escrow
  const submitSecret = async (orderHash: string, secret: string) => {
    const response = await fetch(
      `${FUSION_PLUS_API_BASE}/v1.0/orders/${orderHash}/secret`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'accept': 'application/json'
        },
        body: JSON.stringify({
          secret
        })
      }
    );

    if (!response.ok) {
      throw new Error('Failed to submit secret');
    }

    return await response.json();
  };

  // Step 8: Get Order Status
  const getOrderStatus = async (orderHash: string) => {
    const response = await fetch(
      `${FUSION_PLUS_API_BASE}/v1.0/orders/${orderHash}`,
      {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'accept': 'application/json'
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to get order status');
    }

    return await response.json();
  };

  // Main cross-chain swap function
  const executeCrossChainSwap = async (params: CrossChainSwapParams) => {
    if (!address) {
      throw new Error('Wallet not connected');
    }

    setIsLoading(true);
    setCurrentStep('Getting quote...');

    try {
      // 1. Get cross-chain quote
      console.log('Getting cross-chain quote...');
      const quote = await getQuote(params);
      console.log('Quote received:', quote);

      setCurrentStep('Generating secrets...');
      
      // 2. Generate secrets for atomic swap
      const preset = PresetEnum.fast;
      const secretsCount = quote.presets[preset].secretsCount;
      const hashLockData = generateSecrets(secretsCount);
      console.log('Secrets generated:', hashLockData.secrets.length);

      setCurrentStep('Creating order...');

      // 3. Create cross-chain order
      const orderData = await createOrder(quote, hashLockData, preset);
      console.log('Order created:', orderData);

      setCurrentStep('Requesting signature...');

      // 4. Sign order
      const signature = await signOrder(orderData.order, params.srcChainId);
      console.log('Order signed');

      setCurrentStep('Submitting order...');

      // 5. Submit order
      const hash = await submitOrder(
        params.srcChainId,
        orderData.order,
        orderData.quoteId,
        hashLockData.secretHashes
      );
      console.log('Order submitted with hash:', hash);
      
      setOrderHash(hash);
      setCurrentStep('Monitoring swap...');

      // 6. Monitor and handle secret sharing
      await monitorAndHandleSecrets(hash, hashLockData.secrets);

      return hash;

    } catch (error) {
      console.error('Cross-chain swap failed:', error);
      setCurrentStep('Failed');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // Monitor order and handle secret sharing
  const monitorAndHandleSecrets = async (orderHash: string, secrets: string[]) => {
    const pollInterval = 2000; // 2 seconds

    while (true) {
      try {
        // Check for ready-to-accept secret fills
        const secretsToShare = await getReadyToAcceptSecretFills(orderHash);
        
        if (secretsToShare.fills && secretsToShare.fills.length > 0) {
          setCurrentStep('Sharing secrets...');
          
          for (const fill of secretsToShare.fills) {
            const secretIndex = fill.idx;
            const secret = secrets[secretIndex];
            
            await submitSecret(orderHash, secret);
            console.log(`Shared secret for fill ${secretIndex}`);
          }
        }

        // Check order status
        const statusResponse = await getOrderStatus(orderHash);
        setCurrentStep(`Status: ${statusResponse.status}`);

        if (
          statusResponse.status === OrderStatus.Executed ||
          statusResponse.status === OrderStatus.Expired ||
          statusResponse.status === OrderStatus.Refunded
        ) {
          console.log('Order finished:', statusResponse);
          setCurrentStep(`Completed: ${statusResponse.status}`);
          break;
        }

        // Wait before next poll
        await new Promise(resolve => setTimeout(resolve, pollInterval));

      } catch (error) {
        console.error('Error in monitoring:', error);
        await new Promise(resolve => setTimeout(resolve, pollInterval * 2));
      }
    }
  };

  return {
    executeCrossChainSwap,
    getQuote,
    getOrderStatus,
    isLoading,
    orderHash,
    currentStep
  };
};



const CHAIN_NAMES = {
  1: 'Ethereum',
  56: 'BSC',
  137: 'Polygon',
  42161: 'Arbitrum',
  10: 'Optimism'
};

export const FusionPlusSwapComponent: React.FC = () => {
  const { address, isConnected } = useAccount();
  const { connect } = useConnect();
  const { disconnect } = useDisconnect();
  const { executeCrossChainSwap, isLoading, orderHash, currentStep } = useFusionPlusSwap();
  
  const [swapParams, setSwapParams] = useState<CrossChainSwapParams>({
    amount: '10000000', // 10 USDT (6 decimals)
    srcChainId: 137, // Polygon
    dstChainId: 56, // BSC
    srcTokenAddress: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f' as Address, // USDT on Polygon
    dstTokenAddress: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee' as Address, // BNB on BSC
    enableEstimate: true
  });

  const handleCrossChainSwap = async () => {
    try {
      const hash = await executeCrossChainSwap(swapParams);
      console.log('Cross-chain swap initiated with hash:', hash);
    } catch (error) {
      console.error('Cross-chain swap failed:', error);
    }
  };

  if (!isConnected) {
    return (
      <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
        <h2 className="text-xl font-bold mb-4">1inch Fusion+ Cross-Chain Swap</h2>
        <button 
          onClick={() => connect({ connector: injected() })}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-md mx-auto bg-white rounded-lg shadow-md">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-2">1inch Fusion+ Cross-Chain Swap</h2>
        <p className="text-sm text-gray-600">Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
        <button 
          onClick={() => disconnect()}
          className="text-sm text-red-500 hover:underline"
        >
          Disconnect
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">From Chain</label>
          <select
            value={swapParams.srcChainId}
            onChange={(e) => setSwapParams(prev => ({
              ...prev, 
              srcChainId: parseInt(e.target.value)
            }))}
            className="w-full p-2 border rounded"
          >
            {Object.entries(CHAIN_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">From Token</label>
          <input
            type="text"
            value={swapParams.srcTokenAddress}
            onChange={(e) => setSwapParams(prev => ({
              ...prev, 
              srcTokenAddress: e.target.value as Address
            }))}
            className="w-full p-2 border rounded"
            placeholder="Source token address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">To Chain</label>
          <select
            value={swapParams.dstChainId}
            onChange={(e) => setSwapParams(prev => ({
              ...prev, 
              dstChainId: parseInt(e.target.value)
            }))}
            className="w-full p-2 border rounded"
          >
            {Object.entries(CHAIN_NAMES).map(([id, name]) => (
              <option key={id} value={id}>{name}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">To Token</label>
          <input
            type="text"
            value={swapParams.dstTokenAddress}
            onChange={(e) => setSwapParams(prev => ({
              ...prev, 
              dstTokenAddress: e.target.value as Address
            }))}
            className="w-full p-2 border rounded"
            placeholder="Destination token address"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Amount</label>
          <input
            type="text"
            value={swapParams.amount}
            onChange={(e) => setSwapParams(prev => ({
              ...prev, 
              amount: e.target.value
            }))}
            className="w-full p-2 border rounded"
            placeholder="Amount in token's smallest unit"
          />
        </div>

        <button
          onClick={handleCrossChainSwap}
          disabled={isLoading}
          className="w-full bg-purple-500 text-white py-3 rounded disabled:opacity-50 hover:bg-purple-600"
        >
          {isLoading ? 'Processing...' : 'Execute Cross-Chain Swap'}
        </button>

        {currentStep !== 'idle' && (
          <div className="mt-4 p-3 bg-blue-50 rounded">
            <p className="text-sm font-medium text-blue-800">Status:</p>
            <p className="text-sm text-blue-600">{currentStep}</p>
          </div>
        )}

        {orderHash && (
          <div className="mt-4 p-3 bg-gray-50 rounded">
            <p className="text-sm font-medium">Order Hash:</p>
            <p className="font-mono text-xs break-all">{orderHash}</p>
          </div>
        )}
      </div>

      <div className="mt-6 p-3 bg-yellow-50 rounded">
        <p className="text-xs text-yellow-800">
          <strong>Note:</strong> Cross-chain swaps use atomic swap technology. 
          You'll need to share secrets when escrows are deployed. The process is automated.
        </p>
      </div>
    </div>
  );
};