import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import { WalletProvider } from './context/WalletContext';
import { AppKitProvider } from './context/AppkitContext';
import Swap from './pages/Swap';
import Navbar from './components/Navbar';
import Aggregator from './pages/Aggregator';
import ChartPage from './pages/ChartPage';


function App() {
  return (
    <AppKitProvider>
    <BrowserRouter>
      <WalletProvider>
      <div className="min-h-screen bg-[var(--color-bg)] text-[var(--color-font)]">
      <Navbar />
      <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/swap" element={<Swap />} />
          <Route path="/aggregator" element={<Aggregator />} />
          <Route path="/charts" element={<ChartPage />} />
          {/* Add more routes here as you create more pages */}
          {/* <Route path="/nfts" element={<NFTs />} /> */}
          {/* Add more routes here as you create more pages */}
        </Routes>
      </div>
       
      </WalletProvider>
    </BrowserRouter>
    </AppKitProvider>
    
        
  )
}

export default App
