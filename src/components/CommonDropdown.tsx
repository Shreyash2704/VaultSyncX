import React from 'react';
import { type Chain
 } from 'viem';

type Token = {
  name: string;
  address: string;
  symbol: string;
  decimals: number;
};

type ChainOption = Chain & {
  tokens?: Token[];
}

interface CommonDropdownProps {
  label: string;
  value: number | null;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: (ChainOption | Token)[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const CommonDropdown: React.FC<CommonDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = '',
  className = '',
  disabled = false,
}) => (
  <div className="mb-4">
    <label className="block text-white mb-1 font-medium">{label}</label>
    <select
      className={`w-full px-4 py-2 rounded bg-[#223040] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      value={value ?? ""}
      onChange={onChange}
      disabled={disabled}
    >
      {placeholder && <option value="" disabled>{placeholder}</option>}
      {options.map(opt => (
        <option key={opt.name} value={opt.name}>{opt.name}</option>
      ))}
    </select>
  </div>
);

export default CommonDropdown; 