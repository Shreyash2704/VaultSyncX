import React, { createContext, useState, type ReactNode} from 'react';

interface WalletContextProps {
  walletConnected: boolean;
  loading: boolean;
  connectWallet: () => void;
  setLoading: (loading: boolean) => void;
}

export const WalletContext = createContext<WalletContextProps>({
  walletConnected: false,
  loading: false,
  connectWallet: () => {},
  setLoading: () => {},
});

export const WalletProvider = ({ children }: { children: ReactNode }) => {
  const [walletConnected, setWalletConnected] = useState(false);
  const [loading, setLoading] = useState(false);
  

  // Placeholder: Call this when wallet is connected
  const connectWallet = () => {
    setWalletConnected(true);
    setLoading(true);
    // Simulate loading data
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <WalletContext.Provider value={{ walletConnected, loading, connectWallet, setLoading }}>
      {children}
    </WalletContext.Provider>
  );
}; 