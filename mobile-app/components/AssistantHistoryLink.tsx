import React from 'react';
import { History } from 'lucide-react';

interface AssistantHistoryLinkProps {
  label: string;
  onClick: () => void;
  className?: string;
}

const AssistantHistoryLink: React.FC<AssistantHistoryLinkProps> = ({
  label,
  onClick,
  className = '',
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`flex min-h-11 shrink-0 items-center gap-1.5 px-1 text-[13px] font-semibold text-[var(--tm-assistant-role-text)] transition active:scale-[0.98] active:text-[var(--tm-assistant-role-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)] ${className}`}
    aria-label={`查看${label}`}
  >
    <History className="h-[18px] w-[18px]" strokeWidth={2.2} aria-hidden="true" />
    <span>{label}</span>
  </button>
);

export default AssistantHistoryLink;
