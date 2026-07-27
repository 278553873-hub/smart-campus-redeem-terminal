import React from 'react';
import { ChevronLeft } from 'lucide-react';

interface AssistantSubpageHeaderAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
}

interface AssistantSubpageHeaderProps {
  title: string;
  onBack: () => void;
  backLabel?: string;
  action?: AssistantSubpageHeaderAction;
}

const AssistantSubpageHeader: React.FC<AssistantSubpageHeaderProps> = ({
  title,
  onBack,
  backLabel = '返回',
  action,
}) => (
  <header className="sticky top-0 z-40 flex h-11 shrink-0 items-center justify-between bg-[var(--tm-bg-page-glass)] px-4 backdrop-blur-xl">
    <button
      type="button"
      onClick={onBack}
      className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition active:scale-[0.96] active:bg-[var(--tm-assistant-role-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
      aria-label={backLabel}
    >
      <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
    </button>

    <h1 className="pointer-events-none absolute inset-x-16 truncate text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">
      {title}
    </h1>

    {action ? (
      <button
        type="button"
        onClick={action.onClick}
        className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition active:scale-[0.96] active:bg-[var(--tm-assistant-role-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
        aria-label={action.label}
        title={action.label}
      >
        {action.icon}
      </button>
    ) : (
      <span className="-mr-2 h-11 w-11 shrink-0" aria-hidden="true" />
    )}
  </header>
);

export default AssistantSubpageHeader;
