import React from 'react';

interface MobileDocumentTitleInputProps {
  id: string;
  ariaLabel: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  error?: string;
  maxLength?: number;
}

const MobileDocumentTitleInput: React.FC<MobileDocumentTitleInputProps> = ({
  id,
  ariaLabel,
  value,
  placeholder,
  onChange,
  error,
  maxLength = 40,
}) => {
  const errorId = `${id}-error`;

  return (
    <>
      <input
        id={id}
        aria-label={ariaLabel}
        value={value}
        maxLength={maxLength}
        onChange={event => onChange(event.target.value)}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`min-h-[var(--tm-size-touch)] w-full border-0 border-b bg-transparent px-0 py-1 text-[length:var(--tm-font-size-document-title)] font-bold leading-9 text-[var(--tm-text-primary)] outline-none transition-[border-color,border-width] placeholder:font-medium placeholder:text-[var(--tm-text-tertiary)] focus:border-b-2 focus:ring-0 ${error ? 'border-[var(--tm-status-negative-strong)] focus:border-[var(--tm-status-negative-strong)]' : 'border-[var(--tm-border-control)] focus:border-[var(--tm-brand-primary)]'}`}
      />
      {error && <p id={errorId} className="mt-1.5 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-status-negative-strong)]">{error}</p>}
    </>
  );
};

export default MobileDocumentTitleInput;
