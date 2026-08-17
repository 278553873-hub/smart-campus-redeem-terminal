import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface MobilePageHeaderProps {
  title: string;
  onBack: () => void;
}

const MobilePageHeader: React.FC<MobilePageHeaderProps> = ({ title, onBack }) => (
  <header className="relative z-40 flex h-11 shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
    <button
      type="button"
      onClick={onBack}
      className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)]"
      aria-label="返回"
    >
      <ChevronLeft className="h-5 w-5 -translate-x-px" strokeWidth={2.2} />
    </button>
    <h1 className="pointer-events-none absolute inset-x-16 truncate text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">
      {title}
    </h1>
  </header>
);

export default MobilePageHeader;
