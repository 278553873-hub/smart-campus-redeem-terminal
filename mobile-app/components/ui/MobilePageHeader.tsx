import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface MobilePageHeaderProps {
  title: string;
  onBack: () => void;
  tone?: 'plain' | 'transparent';
  action?: React.ReactNode;
}

const MobilePageHeader: React.FC<MobilePageHeaderProps> = ({ title, onBack, tone = 'plain', action }) => (
  <header className={`relative z-40 flex h-11 shrink-0 items-center ${tone === 'plain' ? 'bg-[var(--tm-page-plain-header-bg)]' : 'bg-transparent'} pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]`}>
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
    {action && <div className="relative ml-auto shrink-0">{action}</div>}
  </header>
);

export default MobilePageHeader;
