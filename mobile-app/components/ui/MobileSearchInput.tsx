import React from 'react';
import { Search } from 'lucide-react';

interface MobileSearchInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  density?: 'compact' | 'standard';
  containerClassName?: string;
}

const MobileSearchInput: React.FC<MobileSearchInputProps> = ({
  density = 'standard',
  containerClassName = '',
  className = '',
  ...inputProps
}) => {
  const compact = density === 'compact';

  return (
    <label className={`relative block ${containerClassName}`}>
      <Search
        className={`pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[var(--tm-text-tertiary)] ${compact ? 'h-4 w-4' : 'h-[18px] w-[18px]'}`}
        aria-hidden="true"
      />
      <input
        {...inputProps}
        type="search"
        className={`${compact
          ? 'h-9 rounded-full border-[var(--tm-border-subtle)] pl-9 pr-3 text-[13px] [box-shadow:var(--tm-shadow-control)]'
          : 'h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] border-[var(--tm-input-border)] pl-10 pr-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)]'
        } w-full border bg-[var(--tm-input-bg)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] ${className}`}
      />
    </label>
  );
};

export default MobileSearchInput;
