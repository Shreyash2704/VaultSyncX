import { parseUnits } from 'viem';
import {
  useWriteContract,
} from 'wagmi';

// ERC20 ABI for approve function
const erc20Abi = [
  {
    inputs: [
      { internalType: 'address', name: 'spender', type: 'address' },
      { internalType: 'uint256', name: 'amount', type: 'uint256' },
    ],
    name: 'approve',
    outputs: [{ internalType: 'bool', name: '', type: 'bool' }],
    stateMutability: 'nonpayable',
    type: 'function',
  },
] as const;

interface UseTokenApprovalProps {
  tokenAddress?: `0x${string}`;
  spenderAddress?: `0x${string}`;
  amount?: bigint;
  decimals?: number;
  enabled?: boolean;
}

export type ApprovalStatus = 'idle' | 'pending' | 'confirming' | 'success' | 'error';

export const useTokenApproval = () => {
  // Convert amount to BigInt
  // Execute the approval transaction
  const { 
    data: hash, 
    error: writeError, 
    isError: isWriteError,
    status: approvalStatus,
    error: receiptError,
    writeContract 
  } = useWriteContract();
  console.log("allowance status", approvalStatus,receiptError);
 

  // Handle the approval process
const handleApprove: (props: UseTokenApprovalProps) => Promise<void> = async ({
  tokenAddress,
  spenderAddress,
  amount,
  decimals = 18, // Default to 18 decimals if not provided
}: UseTokenApprovalProps) => {
  //  const amountWei = amount ? parseUnits(amount, decimals) : BigInt(0);
  
  if (!tokenAddress || !spenderAddress || !amount) return;
  const maxAmount = '10000'; // 2^256 - 1
  const amountWei = maxAmount ? parseUnits(maxAmount, decimals) : BigInt(0);
  console.log("amount", amount, decimals,amountWei);
  try {
    //   setApprovalStatus('pending');
    const data = await writeContract({
      address: tokenAddress,
      abi: erc20Abi,
      functionName: 'approve',
      args: [spenderAddress, amountWei]
    });
  } catch (error) {
    console.error("Error initiating approval:", error);
    //   setApprovalStatus('error');
  }
};


  // Reset approval status
  const resetApproval = () => {
    // setApprovalStatus('idle');
  };

  return {
    // Status
    approvalStatus,
    // isLoading: approvalStatus === 'pending' || approvalStatus === 'confirming',
    // isSuccess: approvalStatus === 'success',
    // isError: approvalStatus === 'error',
    
    // Data
    transactionHash: hash,
    
    // Errors
    error:  writeError ,
    
    // Actions
    handleApprove,
    resetApproval,

    // Transaction states for granular control
    isWriteError,
    
    canApprove: !!writeContract,
  };
};

// Hook for unlimited approval
// export const useTokenApprovalUnlimited = ({
//   tokenAddress,
//   spenderAddress,
//   enabled = true
// }: Omit<UseTokenApprovalProps, 'amount' | 'decimals'>) => {
//   const maxAmount = '115792089237316195423570985008687907853269984665640564039457584007913129639935'; // 2^256 - 1
  
//   return useTokenApproval({
//     tokenAddress,
//     spenderAddress,
//     amount: maxAmount,
//     decimals: 0, // Already in wei
//     enabled
//   });
// };