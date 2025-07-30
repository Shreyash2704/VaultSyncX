import { keccak256, type ByteArray } from 'viem';
import type { HashLockData } from '../types/chain-type';

// Helper: Generate a random secret as hex string
const generateSecret = (): `0x${string}` => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return `0x${Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')}`;
};

// Helper: Hash a secret
const hashSecret = (secret: `0x${string}`): `0x${string}` => {
  return keccak256(secret);
};

// Helper: Merkle tree root (for multiple fills)
const getMerkleRoot = (hashes: `0x${string}`[]): `0x${string}` => {
  if (hashes.length === 0) throw new Error('No hashes provided');
  let nodes = hashes.slice();
  while (nodes.length > 1) {
    const nextLevel: `0x${string}`[] = [];
    for (let i = 0; i < nodes.length; i += 2) {
      if (i + 1 < nodes.length) {
        nextLevel.push(keccak256(nodes[i] + nodes[i + 1].slice(2)) as `0x${string}`);
      } else {
        nextLevel.push(nodes[i]);
      }
    }
    nodes = nextLevel;
  }
  return nodes[0];
};

// Main HashLock logic
const getHashLock = (secrets: (`0x${string}`)[]): `0x${string}` => {
  const secretHashes = secrets.map(hashSecret);
  if (secrets.length === 1) {
    return secretHashes[0];
  } else {
    return getMerkleRoot(secretHashes);
  }
};

const generateSecrets = (secretsCount: number): HashLockData => {
  // Generate secrets
  const secrets = Array.from({ length: secretsCount }, () => generateSecret());
  // Hash each secret
  const secretHashes = secrets.map(hashSecret);
  // Compute hashLock from secret hashes (single or multiple fill)
  const hashLock = secretsCount === 1
    ? secretHashes[0]
    : getMerkleRoot(secretHashes);

  return {
    hashLock,
    secrets,
    secretHashes
  };
};

export const useHashLockHook = () => ({
  generateSecrets,
  getHashLock,
  hashSecret,
  getMerkleRoot,
});