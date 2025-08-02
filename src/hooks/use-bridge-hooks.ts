import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChains, useSignTypedData, useSwitchChain } from "wagmi";
import {
  PresetEnum,
  type ChainOption,
  // type HashLockData,
  type Token,
} from "../types/chain-type";
import { useDebounceHook } from "./hooks";
import { formatTokenAmount, parseTokenAmount } from "../utils/utility";
import {
  buildOrderByQuote,
  checkOrderConfirmed,
  getBalance,
  getQuote,
  getTokenPrice,
  submitOrder,
  submitOrderSecret,
} from "../utils/api-methods";
import { useQuery } from "@tanstack/react-query";
import { useHashLockHook } from "./use-hashlock-hooks";
import { useTokenApproval } from "./use-token-approval";
import type { TransactionStep } from "../components/TransactionStatus";

export const useBridgeHooks = () => {
  const chains = useChains();
  const { switchChain } = useSwitchChain();
  const mutableChains = [...chains] as ChainOption[];

  const [fromChain, setFromChain] = useState<ChainOption | null>(
    mutableChains[0]
  );
  const [fromToken, setFromToken] = useState<Token | null>(null);
  const [fromAmount, setFromAmount] = useState("");
  const [toChain, setToChain] = useState<ChainOption | null>(null);
  const [toToken, setToToken] = useState<Token | null>(null);
  const [toAmount, setToAmount] = useState("");
  const [recipient, setRecipient] = useState("");
  const debouncedAmount = useDebounceHook(fromAmount, 1000);
  const [tokenPriceUsd, settokenPriceUsd] = useState("");
  const [toTokenPriceUsd, settoTokenPriceUsd] = useState("")
  const [quoteError, setquoteError] = useState("")

  const [transactionStep, setTransactionStep] = useState<TransactionStep>('signed');
  const [transactionError, setTransactionError] = useState<string>('');
  const [showTransactionStatus, setShowTransactionStatus] = useState(false);

  const [checkContinuouslyForOrder, setCheckContinuouslyForOrder] = useState(false);

  const { signTypedDataAsync } = useSignTypedData();
  const { isWriteError,handleApprove, approvalStatus,error: approvalError } = useTokenApproval();

  const [quoteData, setQuoteData] = useState<any>(null);

  const [txData, settxData] = useState<any>(null);

  const { generateSecrets} =
    useHashLockHook();

  const { address } = useAccount();


  const {
    data: balanceData,
    // isLoading: balanceLoading,
    // refetch: refetchBalance,
  } = useQuery({
    queryKey: ["balance", address, fromChain?.id],
    queryFn: async () => {
      if (!address || !fromChain || !fromChain?.id) return;
      const balance = await getBalance(address, fromChain.id);
      return balance;
    },
    enabled: !!address && !!fromChain?.id,
  });

  const fromChainOptions = useMemo(() => mutableChains, [mutableChains]);
  const toChainOptions = useMemo(
    () => mutableChains.filter((chain) => chain.id !== fromChain?.id),
    [mutableChains, fromChain]
  );
  const fromTokenOptions = useMemo(
    () => fromChain?.tokens,
    [fromChain, toToken]
  );
  const toTokenOptions = useMemo(
    () => toChain?.tokens,
    [toChain, fromToken]
  );


  // Chain selection handler
  const handleOptionChange = useCallback(
    (chain: ChainOption | null, source: string) => {
      if (source === "from") {
        setFromChain(chain);
        setFromToken(null);
        if (chain && toChain && chain.id === toChain.id) setToChain(null);
      } else {
        setToChain(chain);
        setToToken(null);
        if (chain && fromChain && chain.id === fromChain.id) setFromChain(null);
      }
    },
    [fromChain, toChain]
  );

  // Token selection handlers
  const handleFromTokenChange = useCallback((token: Token | null) => {
    setFromToken(token);
  }, []);

  const handleToTokenChange = useCallback((token: Token | null) => {
    setToToken(token);
  }, []);
  // Fetch quote
  const fetchQuote = useCallback(async () => {
    if (
      !fromChain ||
      !toChain ||
      !fromToken ||
      !toToken ||
      !address ||
      !debouncedAmount
    )
      return;
    const data = {
      srcChain: fromChain.id,
      dstChain: toChain.id,
      srcTokenAddress: fromToken.address,
      dstTokenAddress: toToken.address,
      amount: parseTokenAmount(debouncedAmount, fromToken.decimals),
      walletAddress: address,
      enableEstimate: true,
    };
    try {
      setquoteError("");
      const res = await getQuote(data);

      if(res?.status === "success"){
        setQuoteData(res.data);
        setToAmount(formatTokenAmount(res.data.dstTokenAmount, toToken.decimals, 4));
      }
      if(res?.status === "error"){
        setquoteError(res.data.description);
        setToAmount("");
      }
    } catch (error) {
      setToAmount("");
      setquoteError("Something went wrong while fetching quote");
      console.log("Quote fetch error:", error);
    }
  }, [fromChain, toChain, fromToken, toToken, address, debouncedAmount]);


  const signOrderMessage = async (typedData: any): Promise<string> => {
    if (!address) throw new Error("Wallet not connected");

    const signature = await signTypedDataAsync(typedData);

    return signature;
  };

  
  const handleSwap = async () => {
    setShowTransactionStatus(true)
    setTransactionStep('processing');
    const preset = PresetEnum.fast;

    const hashlockData = generateSecrets(
      quoteData?.presets[preset]?.secretsCount ?? 1
    );
    const params = {
      srcChain: fromChain?.id.toString() || "1",
      dstChain: toChain?.id.toString() || "8453",
      srcTokenAddress: fromToken?.address || "",
      dstTokenAddress: toToken?.address || "",
      amount: parseTokenAmount(debouncedAmount, fromToken?.decimals || 18).toString(),
      walletAddress: address || "",
    };
    // Build order using quote data
    const order = await buildOrderByQuote(quoteData, params, hashlockData.secretHashes);
    
    settxData({
      order,
      params,
      hashlockData,
      preset
    })
    await handleApprove({
      // @ts-ignore
      tokenAddress: fromToken?.address,
      spenderAddress: order.typedData?.domain.verifyingContract,
      amount: parseTokenAmount(debouncedAmount, fromToken?.decimals || 18),
      decimals: fromToken?.decimals || 18,
    })



  };

  const continueProcessing = async() =>{
    const signature = await signOrderMessage(txData.order?.typedData);

    if(!signature) {
      setTransactionError("Failed to sign order message");
      setTransactionStep('error');
      return;
    }
    setTransactionStep('signed');
    console.log("Order signature:", signature);
    // Conditionally include secretHashes based on secretsCount
    const secretsCount = quoteData?.presets[txData.preset]?.secretsCount ?? 1;
    const secretHashesToSubmit = secretsCount > 1 ? txData.hashlockData.secretHashes : undefined;

    const submitResult = await submitOrder(txData.order?.typedData?.message, txData.params, secretHashesToSubmit, signature, txData.order.extension, quoteData?.quoteId);
    setTransactionStep('submitted');
    console.log("Order submitted:", submitResult);
    setCheckContinuouslyForOrder(true);
    
    
  }

  const continueProcessing2 = async() =>{
    const submitSecret = await submitOrderSecret(txData.hashlockData.secrets[0], txData.order.orderHash);
    console.log("Secret submitted:", submitSecret);
    setTransactionStep('confirmed');
  }

  

  // USD value calculation
  const usdValue = useMemo(
    () =>
      debouncedAmount && tokenPriceUsd
        ? (parseFloat(debouncedAmount) * parseFloat(tokenPriceUsd)).toLocaleString(
          undefined,
          {
            style: "currency",
            currency: "USD",
          }
        )
        : "$0.00",
    [debouncedAmount, tokenPriceUsd]
  );

  const swappedUsdValue = useMemo(
    () =>
      toAmount && toTokenPriceUsd
        ? (parseFloat(toAmount) * parseFloat(toTokenPriceUsd ?? 1)).toLocaleString(
          undefined,
          {
            style: "currency",
            currency: "USD",
          }
        )
        : `$${toAmount}`,
    [toAmount, toTokenPriceUsd]
  );

  const handleChainSwitch = async (chainId: number) => {
    await switchChain({
      chainId: chainId,
    });
  };

  useEffect(() => {
    handleChainSwitch(fromChain?.id || 1);
  }, [fromChain]);

  useEffect(() => {
    if (!fromToken) return;
    const setPrice = async () => {
      const price = await getTokenPrice(fromToken?.address);
      settokenPriceUsd(price[fromToken.address]);
    };
    setPrice();
  }, [fromToken]);

  useEffect(() => {
    if (!toToken) return;
    const setPrice = async () => {
      const price = await getTokenPrice(toToken?.address);
      settoTokenPriceUsd(price[toToken.address]);
    };
    setPrice();
  }, [toToken]);

  useEffect(() => {
    fetchQuote();
  }, [fromChain, toChain, debouncedAmount, fromToken, toToken, address]);

  useEffect(() => {
    if(isWriteError || approvalStatus === "error"){
      setTransactionError(approvalError?.message || "Token approval failed");
      setTransactionStep('error');
    }
    if(approvalStatus === "success"){
      setTransactionError('');
      continueProcessing()
    }
  }, [approvalStatus,approvalError,isWriteError ])
  
  useEffect(() => {
    if (checkContinuouslyForOrder && txData.order?.orderHash) {
      const interval = setInterval(async () => {
        if (!showTransactionStatus) {
          clearInterval(interval);
          return;
        }
        const orderStatus = await checkOrderConfirmed(txData.order?.orderHash);
        if (orderStatus.fills.length > 0) {
          setTransactionStep('placed')
          continueProcessing2();
          setCheckContinuouslyForOrder(false);
          return
        }
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [checkContinuouslyForOrder,txData,showTransactionStatus]);

  return {
    fromChain,
    setFromChain,
    fromToken,
    setFromToken,
    fromAmount,
    setFromAmount,
    toChain,
    setToChain,
    toToken,
    setToToken,
    toAmount,
    setToAmount,
    recipient,
    setRecipient,
    fromChainOptions,
    toChainOptions,
    fromTokenOptions,
    toTokenOptions,
    handleOptionChange,
    handleSwap,
    // getChainIcon,
    // getTokenIcon,
    usdValue,
    handleChainSwitch,
    balanceData,
    quoteError,
    swappedUsdValue,
    handleFromTokenChange,
    handleToTokenChange,
    transactionStep,
    transactionError,
    showTransactionStatus, 
    setShowTransactionStatus
  };
};
