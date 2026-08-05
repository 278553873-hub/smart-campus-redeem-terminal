import React from 'react';
import { RefreshCw } from 'lucide-react';

const AssistantReportContractError: React.FC<{ onRetry?: () => void }> = ({ onRetry }) => (
  <div className="flex min-h-[420px] flex-col items-center justify-center px-7 text-center" role="alert">
    <span className="flex h-12 w-12 items-center justify-center rounded-[var(--tm-radius-card)] bg-[var(--tm-assistant-role-soft)] text-[var(--tm-assistant-role-text)]">
      <RefreshCw className="h-5 w-5" strokeWidth={2} aria-hidden="true" />
    </span>
    <h2 className="mt-5 text-[20px] font-semibold text-[var(--tm-text-primary)]">报告暂时无法展示</h2>
    <p className="mt-2 text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-secondary)]">报告内容未完整返回，请稍后重试。</p>
    {onRetry && (
      <button
        type="button"
        onClick={onRetry}
        className="mt-5 flex min-h-12 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-assistant-role-primary)] px-5 text-[15px] font-semibold text-white active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)] focus-visible:ring-offset-2"
      >
        <RefreshCw className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
        重新加载
      </button>
    )}
  </div>
);

export default AssistantReportContractError;
