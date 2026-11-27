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
      className="tm-mobile-toast"
    >
      {message}
    </div>
  );
};

export default MobileToast;
