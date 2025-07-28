import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useChains, useSwitchChain } from "wagmi";
import type { ChainOption, Token } from "../types/chain-type";
import { useDebounceHook } from "./hooks";
import { formatTokenAmount, parseTokenAmount } from "../utils/utility";
import { getBalance, getQuote, getTokenPrice } from "../utils/api-methods";
import { useQuery } from "@tanstack/react-query";

export const useBridgeHooks = () => {
     const chains = useChains();
     const { switchChain } = useSwitchChain()
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
        () =>toChain?.tokens,
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
          setToAmount(formatTokenAmount(res.dstTokenAmount, toToken.decimals,4));
          console.log(
            "res data",res.dstTokenAmount,
            formatTokenAmount(res.dstTokenAmount, toToken.decimals,4)
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
    
      const handleSwap = () => {
        
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

      const handleChainSwitch = async (chainId:number) => {
        await switchChain({
          chainId: chainId
        });
      };

      useEffect(() => {
        handleChainSwitch(fromChain?.id || 1);
      }, [fromChain])
      

      const {
        data: balanceData,
        isLoading: balanceLoading,  
        refetch: refetchBalance,
      } = useQuery({
        queryKey:["balance", address, fromChain?.id],
        queryFn: async () => {
          if (!address || !fromChain?.id) return;
          const balance = await getBalance(address, fromChain.id);
          return balance;
        },
        enabled: !!address && !!fromChain?.id,
      })

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
        balanceData
    }
}
