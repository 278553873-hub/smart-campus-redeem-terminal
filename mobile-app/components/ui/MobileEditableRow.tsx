import React from 'react';

type MobileEditableRowProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

export const MobileEditableRow: React.FC<MobileEditableRowProps> = ({
  className = '',
  type = 'button',
  children,
  ...props
}) => (
  <button
    {...props}
    type={type}
    className={`relative isolate before:pointer-events-none before:absolute before:inset-y-0 before:-left-4 before:-right-4 before:-z-10 before:transition-colors before:content-[''] active:before:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:before:ring-2 focus-visible:before:ring-inset focus-visible:before:ring-[var(--tm-focus-ring)] ${className}`}
  >
    {children}
  </button>
);
