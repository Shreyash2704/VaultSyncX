import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChains, useSignTypedData, useSwitchChain } from "wagmi";
import {
  PresetEnum,
  type ChainOption,
  type HashLockData,
  type Token,
} from "../types/chain-type";
import { useDebounceHook } from "./hooks";
import { formatTokenAmount, parseTokenAmount } from "../utils/utility";
import {
  apikey,
  buildOrderByQuote,
  getBalance,
  getQuote,
  getQuoteData,
  getSupportedTokens,
  getTokenPrice,
  submitOrder,
  submitOrderSecret,
} from "../utils/api-methods";
import { useQuery } from "@tanstack/react-query";
import { useHashLockHook } from "./use-hashlock-hooks";

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
  const [balance, setBalance] = useState("");
  const [quoteError, setquoteError] = useState("")

  const { signTypedDataAsync } = useSignTypedData();

 

  const [quoteData, setQuoteData] = useState<any>(null);

  const { generateSecrets, getHashLock, hashSecret, getMerkleRoot } =
    useHashLockHook();

  const { address } = useAccount();

   // Fetch tokens for fromChain
  const {
    data: fromTokensData,
    isLoading: fromTokensLoading,
    error: fromTokensError,
  } = useQuery({
    queryKey: ["supportedTokens", fromChain?.id],
    queryFn: async () => {
      if (!fromChain?.id) return {};
      return await getSupportedTokens(fromChain.id);
    },
    enabled: !!fromChain?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

   // Fetch tokens for toChain
  const {
    data: toTokensData,
    isLoading: toTokensLoading,
    error: toTokensError,
  } = useQuery({
    queryKey: ["supportedTokens", toChain?.id],
    queryFn: async () => {
      return
      // if (!toChain?.id) return {};
      // return await getSupportedTokens(toChain.id);
    },
    enabled: !!toChain?.id,
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  });

  const {
    data: balanceData,
    isLoading: balanceLoading,
    refetch: refetchBalance,
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

   // Convert API token objects to arrays for easier use
  // const fromTokenOptions = useMemo(() => {
  //   if (!fromTokensData) return [];
  //   return Object.values(fromTokensData) as Token[];
  // }, [fromTokensData]);

  // const toTokenOptions = useMemo(() => {
  //   if (!toTokensData) return [];
  //   return Object.values(toTokensData) as Token[];
  // }, [toTokensData]);

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
    const order = await buildOrderByQuote(quoteData, params, hashlockData.secrets);



    const signature = await signOrderMessage(order?.typedData);
    console.log("Order signature:", signature);
    // Conditionally include secretHashes based on secretsCount
    const secretsCount = quoteData?.presets[preset]?.secretsCount ?? 1;
    const secretHashesToSubmit = secretsCount > 1 ? hashlockData.secretHashes : undefined;

    const submitedOrder = await submitOrder(order?.typedData?.message, params, secretHashesToSubmit, signature, order.extension, quoteData?.quoteId);

    console.log("Order submitted:", submitedOrder);

    const submitSecret = await submitOrderSecret(hashlockData.secrets[0],order.orderHash);
    console.log("Secret submitted:", submitSecret);
  };

  // Placeholder icons (replace with SVGs or images as needed)
  const getChainIcon = (chainName?: string) => {
    if (!chainName) return "🌐";
    if (chainName.toLowerCase().includes("ethereum")) return "🟦";
    if (chainName.toLowerCase().includes("arbitrum")) return "⚪";
    return "🌐";
  };
  const getTokenIcon = (tokenSymbol?: string) => {
    if (!tokenSymbol) return "🪙";
    if (tokenSymbol === "ETH") return "⬡";
    if (tokenSymbol === "USDC") return "💵";
    if (tokenSymbol === "USDT") return "💲";
    return "🪙";
  };

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
    getChainIcon,
    getTokenIcon,
    usdValue,
    handleChainSwitch,
    balanceData,
    quoteError,
    swappedUsdValue,
    handleFromTokenChange,
    handleToTokenChange,
    fromTokensLoading, // Loading states for UI
    toTokensLoading,
    fromTokensError, // Error states for UI
  };
};
