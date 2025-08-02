import React from "react"
import ChainDropdown from "../components/ChainDropdown";
import TokenDropdown from "../components/TokenDropdown";
import { useAccount } from "wagmi";
import { formatAddress, formatTokenAmount } from "../utils/utility";
import { useBridgeHooks } from "../hooks/use-bridge-hooks";
import { useAppKit } from "@reown/appkit/react";
import TransactionStatus from "../components/TransactionStatus";

const Swap: React.FC = () => {
  const {
    fromChain,
    fromToken,
    setFromToken,
    fromAmount,
    setFromAmount,
    toChain,
    toToken,
    setToToken,
    toAmount,
    setToAmount,
    fromChainOptions,
    toChainOptions,
    fromTokenOptions,
    toTokenOptions,
    handleOptionChange,
    handleSwap,
    usdValue,
    handleChainSwitch,
    balanceData,
    quoteError,
    swappedUsdValue,
    transactionStep,
    transactionError,
    showTransactionStatus,
    setShowTransactionStatus
  } = useBridgeHooks();

  const { address,chain } = useAccount();
  const { open } = useAppKit();
  

  const handleSubmit = async () => {
    if (!address) {
      open({ view: "Connect" });
      return;
    }

    if (chain && fromChain && chain.id !== fromChain.id) {
      await handleChainSwitch(fromChain.id);
    }

    await handleSwap();
  }

  const buttonText = !address ? "Connect" : chain && fromChain && chain.id !== fromChain.id ? "Switch Chain" :quoteError ? quoteError : " Swap";
  const isBtnDisabled = !fromChain || !toChain || !fromToken || !toToken || !fromAmount || quoteError !== "";

  const balance = fromChain && balanceData ? 
   `${formatTokenAmount(
    balanceData[
      fromToken?.address ?? "0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee"],
      fromToken?.decimals || 18,
      4
    )} ${fromToken?.symbol || "ETH"}` :
    "NA";

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen"
      style={{ background: "var(--color-bg)" }}
    >
      <div
        className="w-full max-w-md rounded-2xl shadow-lg p-6 mt-8"
        style={{ background: "var(--color-component)" }}
      >
        <div
          className="text-xs font-semibold mb-2"
          style={{ color: "var(--color-font)", opacity: 0.7 }}
        >
          Bridge
        </div>
        {/* FROM SECTION */}
        <div
          className="rounded-xl p-4 mb-2 relative"
          style={{ background: "var(--color-card-section, #f7f8fa)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ChainDropdown
              label=""
              value={fromChain?.id ?? null}
              onChange={(chain) => handleOptionChange(chain, "from")}
              options={fromChainOptions}
              placeholder="Select Chain"
              className="!bg-transparent !text-[var(--color-font)] !font-semibold !w-auto"
            />
            <span
              className="ml-auto text-xs rounded px-2 py-1 font-mono"
              style={{
                background: "var(--color-highlight-bg, #fffbe6)",
                color: "var(--color-highlight-text, #b59f3b)",
              }}
            >
              {address ? formatAddress(address) : "Connect Wallet"}
            </span>
          </div>
          {/* AMOUNT INPUT */}
          <div className="flex items-center gap-2 mb-1">
            <input
              className={`w-full text-5xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 m-0 text-gray-400 ${
                fromAmount ? "text-red-500" : "text-gray-400"
              }`}
              style={{ letterSpacing: "2px" }}
              type="number"
              min="0"
              placeholder="0"
              value={fromAmount}
              onChange={(e) => setFromAmount(e.target.value)}
            />
            <div className="flex items-center gap-1 bg-[var(--color-input-bg)] rounded-lg px-3 py-2 text-sm font-semibold">
              <TokenDropdown
                label=""
                value={fromToken?.address ?? null}
                onChange={setFromToken}
                options={fromTokenOptions ?? []}
                placeholder="Select Token"
                className="!bg-white !text-[var(--color-font)] !font-semibold !w-auto"
              />
            </div>
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-lg font-semibold">
              {usdValue}
            </span>
            <span className="text-xs text-gray-400">
              Balance:{" "}
              <span className="font-semibold text-gray-700">{balance}</span>{" "}
              <button className="ml-1 text-xs text-blue-500 font-bold">
                MAX
              </button>
            </span>
          </div>
        </div>
        {/* ARROW */}
        <div className="flex justify-center items-center my-2">
          <div
            className="rounded-full shadow p-2 border border-gray-200"
            style={{ background: "var(--color-component)" }}
          >
            <svg
              width="24"
              height="24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path
                d="M12 5v14m0 0l-6-6m6 6l6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>
        {/* TO SECTION */}
        <div
          className="rounded-xl p-4 mb-4 relative"
          style={{ background: "var(--color-card-section, #f7f8fa)" }}
        >
          <div className="flex items-center gap-2 mb-2">
            <ChainDropdown
              label=""
              value={toChain?.id ?? null}
              onChange={(chain) => handleOptionChange(chain, "to")}
              options={toChainOptions}
              placeholder="Select Chain"
              className="!bg-transparent !text-[var(--color-font)] !font-semibold !w-auto"
            />
          </div>
          <div className="flex items-center gap-2 mb-2">
            {/* <input
              className="w-full px-3 py-2 rounded border focus:outline-none focus:ring-2"
              style={{ background: 'var(--color-input-bg, #fff)', color: 'var(--color-font)', borderColor: 'var(--color-highlight-bg, #fffbe6)' }}
              placeholder="Enter Recipient Address"
              value={recipient}
              onChange={e => setRecipient(e.target.value)}
            /> */}
          </div>
          <div className="flex items-center gap-2">
            <input
              className={`w-full text-5xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 m-0 ${
                fromAmount ? "text-red-500" : "text-gray-400"
              }`}
              style={{ letterSpacing: "2px" }}
              type="number"
              min="0"
              placeholder="0"
              value={toAmount}
              disabled
              onChange={(e) => setToAmount(e.target.value)}
            />
            <div className="flex items-center gap-1 bg-[var(--color-input-bg)] rounded-lg px-3 py-2 text-sm font-semibold">
              <TokenDropdown
                label=""
                value={toToken?.address ?? null}
                onChange={setToToken}
                options={toTokenOptions ?? []}
                placeholder="Select Token"
                className="!bg-white !text-[var(--color-font)] !font-semibold !w-auto"
              />
            </div>
          </div>
           <div className="flex items-center justify-between mb-2">
            <span className="text-gray-400 text-lg font-semibold">
              {swappedUsdValue}
            </span>
          </div>
        </div>
        <button
          type="button"
          className="w-full py-3 rounded-xl font-bold text-lg mt-2 bg-[var(--color-primary-btn-bg)]" 
          style={{
            // background: "var(--color-primary-btn-bg)",
            color: quoteError ? "red" : "var(--color-primary-btn-text)",
            cursor: isBtnDisabled ? "not-allowed" : "pointer",
          }}
          disabled={isBtnDisabled}
          onClick={handleSubmit}
        >
          {buttonText}
        </button>
      </div>

      <TransactionStatus
        isOpen={showTransactionStatus}
        onClose={() => setShowTransactionStatus(false)}
        currentStep={transactionStep}
        errorMessage={transactionError}
        fromToken={fromToken}
        toToken={toToken}
        amount={fromAmount}
        toAmount={toAmount}
        fromChain={fromChain}
        toChain={toChain}
      />
    </div>
  );
};

export default Swap;
