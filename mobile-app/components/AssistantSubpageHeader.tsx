import React from 'react';
import { ChevronLeft } from 'lucide-react';

const centeredContentClassName = 'absolute left-1/2 flex min-w-0 -translate-x-1/2 justify-center [width:calc(100%-2*max(calc(var(--tm-size-touch)+var(--tm-space-5)),var(--mini-program-capsule-right-inset,0px)))]';

interface AssistantSubpageHeaderProps {
  title?: string;
  centerContent?: React.ReactNode;
  onBack: () => void;
  backLabel?: string;
  surface?: 'glass' | 'transparent';
}

const AssistantSubpageHeader: React.FC<AssistantSubpageHeaderProps> = ({
  title,
  centerContent,
  onBack,
  backLabel = '返回',
  surface = 'glass',
}) => (
  <header className={`sticky top-0 z-40 flex h-11 shrink-0 items-center pl-4 [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))] ${surface === 'transparent' ? 'bg-transparent' : 'bg-[var(--tm-bg-page-glass)] backdrop-blur-xl'}`}>
    <button
      type="button"
      onClick={onBack}
      className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-assistant-role-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
      aria-label={backLabel}
    >
      <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
    </button>

    {centerContent ? (
      <div className={centeredContentClassName}>
        {centerContent}
      </div>
    ) : title ? (
      <h1 className={`${centeredContentClassName} pointer-events-none truncate text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]`}>
        {title}
      </h1>
    ) : null}
  </header>
);

export default AssistantSubpageHeader;
