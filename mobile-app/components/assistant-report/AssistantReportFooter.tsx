import React from 'react';
import { Sparkles } from 'lucide-react';
import type { AssistantReportDocument } from '../../domain/assistantReport';

const AssistantReportFooter: React.FC<{
  document: AssistantReportDocument;
  example?: boolean;
  className?: string;
}> = ({ document, example = false, className = '' }) => (
  <footer className={`mx-[var(--tm-report-page-inline)] border-t border-[var(--tm-border-subtle)] py-[var(--tm-space-5)] text-[length:var(--tm-font-size-compact)] leading-5 text-[var(--tm-text-tertiary)] ${className}`}>
    <p className="flex items-start gap-2">
      <Sparkles className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[var(--tm-assistant-role-text)]" strokeWidth={2} aria-hidden="true" />
      <span>{example ? '示例内容，仅用于展示报告结构。' : document.notice} 生成时间：{document.generatedAt}</span>
    </p>
  </footer>
);

export default AssistantReportFooter;
