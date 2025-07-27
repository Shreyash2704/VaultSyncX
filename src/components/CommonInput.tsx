import React from 'react';

interface CommonInputProps {
  label: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  type?: string;
  className?: string;
  disabled?: boolean;
}

const CommonInput: React.FC<CommonInputProps> = ({
  label,
  value,
  onChange,
  placeholder = '',
  type = 'text',
  className = '',
  disabled = false,
}) => (
  <div className="mb-4">
    <label className="block text-white mb-1 font-medium">{label}</label>
    <input
      className={`w-full px-4 py-2 rounded bg-[#223040] text-white focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type}
      disabled={disabled}
    />
  </div>
);

export default CommonInput; 