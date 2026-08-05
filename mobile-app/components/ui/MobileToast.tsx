import React from 'react';

interface MobileToastProps {
  message: string;
}

const MobileToast: React.FC<MobileToastProps> = ({ message }) => {
  if (!message) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="tm-mobile-toast pointer-events-none absolute left-1/2 top-[calc(env(safe-area-inset-top)+52px)] z-[70] inline-flex w-max max-w-[calc(100%-40px)] -translate-x-1/2 items-center justify-center rounded-full bg-[var(--tm-text-primary)] px-3.5 py-2 text-center text-[length:var(--tm-font-size-compact)] font-semibold leading-5 text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-card-raised)]"
    >
      {message}
    </div>
  );
};

export default MobileToast;
