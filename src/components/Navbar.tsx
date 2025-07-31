import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import ThemeToggle from './ThemeToggle';
import { FiLogOut } from 'react-icons/fi';
import { MdLogout } from 'react-icons/md';
import { RiShutDownLine } from 'react-icons/ri';
import { useAppKit, useAppKitAccount } from '@reown/appkit/react';

const navLinks = [
  { name: 'Dashboard', to: '/' },
  { name: 'Swap', to: '/swap' },
  { name: 'Aggregator', to: '/aggregator' },
  { name: 'Charts', to: '/charts' },
  // { name: 'NFTs', to: '/nfts' },
];

const Navbar: React.FC = () => {
  const location = useLocation();
  const { open, close } = useAppKit();
  const { address, isConnected, caipAddress, status, embeddedWalletInfo } =
  useAppKitAccount();
  return (
    <nav className="w-full bg-[var(--color-bg)] border-b border-[#ffffff] px-6 py-3 flex items-center">
      <div className="flex items-center gap-2">
        {/* <span className="w-6 h-6 bg-primary-600 rounded-sm mr-2 inline-block" /> */}
        <span className="font-bold text-lg tracking-tight">VaultSyncX</span>
      </div>
      <div className="flex gap-2 ml-auto">
        {navLinks.map((link) => (
          <Link
            key={link.to}
            to={link.to}
            className={`px-3 py-1 rounded text-sm font-medium transition-colors duration-150 ${location.pathname === link.to ? 'bg-[var(--color-secondary-btn)] text-[var(--color-font)]' : 'hover:bg-[var(--color-table-header)] text-[var(--color-font)]'}`}
          >
            {link.name}
          </Link>
        ))}
      </div>
      <div className="flex items-center gap-3">
        
        {address && <RiShutDownLine onClick={() => open({view:"Account"})} />}
        <button className="w-8 h-8 rounded-full bg-[var(--color-table-header)] flex items-center justify-center">
          <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="10" cy="10" r="7" /><line x1="21" y1="21" x2="15" y2="15" /></svg>
        </button>
        <ThemeToggle />
      </div>
    </nav>
  );
};

export default Navbar; 