import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChains, useSignMessage, useSwitchChain } from "wagmi";
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
  getTokenPrice,
  submitOrder,
} from "../utils/api-methods";
import { useQuery } from "@tanstack/react-query";
import { useCrosschainHooks } from "./use-crosschain-hooks";

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
  const [balance, setBalance] = useState("");

  const {signMessageAsync} = useSignMessage()
  type QuotePreset = {
    secretsCount: number;
    // add other properties if needed
  };

  type QuoteData = {
    presets: Record<string, QuotePreset>;
    // add other properties if needed
  };

  const [quoteData, setQuoteData] = useState<QuoteData | null>(null);

  const { generateSecrets, getHashLock, hashSecret, getMerkleRoot } =
    useCrosschainHooks();

  const { address } = useAccount();

  // Memoized options for dropdowns
  const fromChainOptions = useMemo(() => mutableChains, [mutableChains]);
  const toChainOptions = useMemo(
    () => mutableChains.filter((chain) => chain.id !== fromChain?.id),
    [mutableChains, fromChain]
  );
  const fromTokenOptions = useMemo(
    () => fromChain?.tokens,
    // Array.isArray(fromChain?.tokens)
    //   ? fromChain.tokens.filter((token) => token.address !== toToken?.address)
    //   : [],
    [fromChain, toToken]
  );
  const toTokenOptions = useMemo(
    () => toChain?.tokens,
    // Array.isArray(toChain?.tokens)
    //   ? toChain.tokens.filter((token) => token.address !== fromToken?.address)
    //   : [],
    [toChain, fromToken]
  );

  // Chain selection handler
  const handleOptionChange = useCallback(
    (chain: ChainOption | null, source: string) => {
      if (source === "from") {
        setFromChain(chain);
        if (chain && toChain && chain.id === toChain.id) setToChain(null);
      } else {
        setToChain(chain);
        if (chain && fromChain && chain.id === fromChain.id) setFromChain(null);
      }
    },
    [fromChain, toChain]
  );
  // Fetch quote
  const fetchQuote = useCallback(async () => {
    if (
      !fromChain ||
      !toChain ||
      !fromToken ||
      !toToken ||
      !address ||
      !fromAmount
    )
      return;
    const data = {
      srcChain: fromChain.id,
      dstChain: toChain.id,
      srcTokenAddress: fromToken.address,
      dstTokenAddress: toToken.address,
      amount: parseTokenAmount(fromAmount, fromToken.decimals),
      walletAddress: address,
      enableEstimate: false,
    };
    try {
      const res = await getQuote(data);
      setQuoteData(res);
      setToAmount(formatTokenAmount(res.dstTokenAmount, toToken.decimals, 4));
      console.log(
        "res data",
        res.dstTokenAmount,
        formatTokenAmount(res.dstTokenAmount, toToken.decimals, 4)
      );
    } catch (error) {
      setToAmount("");
      console.error("Quote fetch error:", error);
    }
  }, [fromChain, toChain, fromToken, toToken, address, fromAmount]);

  useEffect(() => {
    if (!fromToken) return;
    const setPrice = async () => {
      const price = await getTokenPrice(fromToken?.address);
      settokenPriceUsd(price[fromToken.address]);
    };
    setPrice();
  }, [fromToken]);

  useEffect(() => {
    fetchQuote();
  }, [fromChain, toChain, fromAmount, fromToken, toToken, address]);
  const signOrderMessage = async (order: Record<string, any>): Promise<string> => {
  // Convert the order object to a string message (you may need to use EIP-712 for production)
  const message = JSON.stringify(order);

  if (!address) throw new Error("Wallet not connected");

  // Sign the message
  const signature = await signMessageAsync({
    message,
    account: address,
  });

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
      amount: parseTokenAmount(fromAmount, fromToken?.decimals || 18).toString(),
      walletAddress: address || "",
    };
    const order = await buildOrderByQuote(quoteData, params, hashlockData.secrets);

    

    const signature = await signOrderMessage(order?.typedData?.message);
    console.log("Order signature:", signature);

    const submitedOrder = await submitOrder(order?.typedData?.message, params, hashlockData.secretHashes, signature,order.extension);

    console.log("Order submitted:", submitedOrder);
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
      fromAmount && tokenPriceUsd
        ? (parseFloat(fromAmount) * parseFloat(tokenPriceUsd)).toLocaleString(
            undefined,
            {
              style: "currency",
              currency: "USD",
            }
          )
        : "$0.00",
    [fromAmount, tokenPriceUsd]
  );

  const handleChainSwitch = async (chainId: number) => {
    await switchChain({
      chainId: chainId,
    });
  };

  useEffect(() => {
    handleChainSwitch(fromChain?.id || 1);
  }, [fromChain]);

  const {
    data: balanceData,
    isLoading: balanceLoading,
    refetch: refetchBalance,
  } = useQuery({
    queryKey: ["balance", address, fromChain?.id],
    queryFn: async () => {
      if (!address || !fromChain?.id) return;
      const balance = await getBalance(address, fromChain.id);
      return balance;
    },
    enabled: !!address && !!fromChain?.id,
  });

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
  };
};
