// ...existing code...
import { type Chain } from 'viem';

export type Token = {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
  logo?: string; // Optional logo URL for the token
};

export type ChainOption = Chain & {
  tokens?: Token[] | [];
};

export const PresetEnum = {
  fast: 'fast',
  medium: 'medium',
  slow: 'slow',
} as const;

export type PresetEnum = typeof PresetEnum[keyof typeof PresetEnum];

export const OrderStatus = {
  Created: 'Created',
  Pending: 'Pending',
  Executed: 'Executed',
  Expired: 'Expired',
  Refunded: 'Refunded',
} as const;

export type OrderStatus = typeof OrderStatus[keyof typeof OrderStatus];

// Define HashLockData type
export type HashLockData = {
  hashLock: `0x${string}`;
  secrets: (`0x${string}`)[];
  secretHashes: (`0x${string}`)[];
};

