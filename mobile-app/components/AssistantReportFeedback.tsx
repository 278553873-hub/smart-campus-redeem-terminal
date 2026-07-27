import React from 'react';
import { DatabaseZap, RefreshCw } from 'lucide-react';

interface AssistantReportFeedbackProps {
  status: 'empty' | 'failed';
  title: string;
  message: string;
  onRetry?: () => void;
}

const AssistantReportFeedback: React.FC<AssistantReportFeedbackProps> = ({
  status,
  title,
  message,
  onRetry,
}) => {
  const Icon = status === 'empty' ? DatabaseZap : RefreshCw;

  return (
    <main className="flex min-h-[620px] flex-col items-center px-7 pt-24 text-center" role={status === 'failed' ? 'alert' : 'status'}>
      <span className="flex h-14 w-14 items-center justify-center rounded-[var(--tm-radius-card)] border border-[var(--tm-role-principal-accent-border)] bg-[var(--tm-role-principal-accent-soft)] text-[var(--tm-role-principal-accent-strong)] [box-shadow:var(--tm-shadow-card)]">
        <Icon className="h-6 w-6" strokeWidth={2} />
      </span>
      <h2 className="mt-6 text-[20px] font-semibold text-[var(--tm-text-primary)]">{title}</h2>
      <p className="mt-3 max-w-[300px] text-[14px] leading-6 text-[var(--tm-text-secondary)]">{message}</p>
      {status === 'failed' && onRetry && (
        <button
          type="button"
          onClick={onRetry}
          className="mt-6 flex min-h-12 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-role-principal-primary)] px-5 text-[15px] font-semibold text-white transition active:scale-[0.99] active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-role-principal-primary)] focus-visible:ring-offset-2"
        >
          <RefreshCw className="h-4.5 w-4.5" strokeWidth={2.2} />
          重新生成
        </button>
      )}
    </main>
  );
};

export default AssistantReportFeedback;
