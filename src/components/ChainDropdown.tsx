import React, { useState, useRef, useEffect } from 'react';
import { type ChainOption } from '../types/chain-type';

interface ChainDropdownProps {
  label: string;
  value: number | null;
  onChange: (chain: ChainOption | null, source: string) => void;
  options: ChainOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

const ChainDropdown: React.FC<ChainDropdownProps> = ({
  label,
  value,
  onChange,
  options,
  placeholder = '',
  className = '',
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const selected = options.find(opt => opt.id === value) || null;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`mb-4 relative ${className}`} ref={dropdownRef}>
      {label && <label className="block text-white mb-1 font-medium">{label}</label>}
      <div
        className="w-full px-4 py-2 rounded cursor-pointer flex items-center justify-between border border-gray-300"
        style={{ background: 'var(--color-input-bg)', color: 'var(--color-input-color)' }}
        onClick={() => !disabled && setOpen(o => !o)}
        tabIndex={0}
      >
        <span>{selected ? selected.name : placeholder}</span>
        <svg className={`ml-2 transition-transform ${open ? 'rotate-180' : ''}`} width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
      </div>
      {open && !disabled && (
        <div className="absolute left-0 right-0 mt-1 z-10 rounded shadow-lg border border-gray-200" style={{ background: 'var(--color-input-bg)' }}>
          {options.map(opt => (
            <div
              key={opt.id}
              className={`px-4 py-2 cursor-pointer hover:bg-[var(--color-card-section)]`}
              style={{ color: 'var(--color-input-color)' }}
              onClick={() => {
                setOpen(false);
                onChange(opt, label);
              }}
            >
              {opt.name}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ChainDropdown; 