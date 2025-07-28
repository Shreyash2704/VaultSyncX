// ...existing code...
import { type Chain } from 'viem';

export type Token = {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
};

export type ChainOption = Chain & {
  tokens?: Token[] | [];
};