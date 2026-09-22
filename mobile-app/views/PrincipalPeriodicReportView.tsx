import React, { useMemo } from 'react';
import {
  PRINCIPAL_PERIODIC_REPORTS,
  type PrincipalPeriodicReportKind,
  type PrincipalPeriodicReportContent,
} from '../data/principalPeriodicReports';
import AssistantReportFeedback from '../components/AssistantReportFeedback';
import AssistantHistoryLink from '../components/AssistantHistoryLink';
import AssistantSubpageHeader from '../components/AssistantSubpageHeader';
import AssistantReportCards from '../components/assistant-report/AssistantReportCards';
import AssistantReportContractError from '../components/assistant-report/AssistantReportContractError';
import {
  adaptPrincipalPeriodicReport,
  resolveAssistantReportDocument,
} from '../domain/assistantReportAdapters';
import { formatPrincipalReportDataRange } from '../domain/principalPeriodicReport';
import type { ReportGenerationTaskStatus } from '../hooks/useReportGenerationTask';

interface PrincipalPeriodicReportViewProps {
  kind: PrincipalPeriodicReportKind;
  schoolName: string;
  status?: ReportGenerationTaskStatus;
  generated?: boolean;
  visibleStepCount?: number;
  onRetry?: () => void;
  onBack: () => void;
  onOpenHistory?: () => void;
  reportData?: PrincipalPeriodicReportContent;
  reportPayload?: unknown;
}

const PrincipalPeriodicReportView: React.FC<PrincipalPeriodicReportViewProps> = ({
  kind,
  schoolName,
  status: statusProp,
  generated = false,
  visibleStepCount = 1,
  onRetry,
  onBack,
  onOpenHistory,
  reportData,
  reportPayload,
}) => {
  const report = reportData ?? PRINCIPAL_PERIODIC_REPORTS[kind];
  const status = statusProp ?? (generated ? 'generated' : 'generating');
  const loading = status === 'idle' || status === 'generating';
  const emptyTitle = kind === 'weekly' ? '上周暂无可分析数据' : '上月暂无可分析数据';
  const emptyMessage = kind === 'weekly'
    ? '上一个完整自然周没有有效评价记录，本周管理建议不会调用人工智能生成。'
    : '上一个完整自然月没有有效评价记录，本次学校复盘不会调用人工智能生成。';
  const reportResolution = useMemo(() => resolveAssistantReportDocument(
    reportPayload,
    adaptPrincipalPeriodicReport(report, schoolName),
  ), [report, reportPayload, schoolName]);

  const dataRange = formatPrincipalReportDataRange(report.periodLabel);

  return (
    <div className="ai-assistant-theme-principal relative flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent font-sans text-[var(--tm-text-primary)]">
      <AssistantSubpageHeader
        title={report.pageTitle}
        onBack={onBack}
        surface="transparent"
      />

      <main data-view-scroll-root className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        {status === 'empty' ? (
          <AssistantReportFeedback
            status="empty"
            title={emptyTitle}
            message={emptyMessage}
          />
        ) : status === 'failed' ? (
          <AssistantReportFeedback
            status="failed"
            title="报告生成失败"
            message="本次报告没有生成成功，请检查网络后重试；已冻结的数据快照不会重复计入。"
            onRetry={onRetry}
          />
        ) : loading ? (
          <div className="px-5" role="status" aria-live="polite" aria-label={report.loadingTitle}>
            <div className="mx-auto mt-8 min-h-[190px] max-w-[280px] space-y-4">
              {report.analysisSteps.slice(0, visibleStepCount).map((step, index) => {
                const active = index === visibleStepCount - 1;
                return (
                  <div key={step} className="animate-in fade-in slide-in-from-bottom-1 flex items-start gap-3 duration-300">
                    <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'animate-pulse bg-[var(--tm-role-principal-primary)]' : 'bg-[var(--tm-border-subtle)]'}`} aria-hidden="true" />
                    <p className={`text-[length:var(--tm-font-size-meta)] tm-font-regular leading-5 ${active ? 'text-[var(--tm-text-secondary)]' : 'text-[var(--tm-text-tertiary)]'}`}>{step}</p>
                  </div>
                );
              })}
            </div>
          </div>
        ) : (
          <>
            <section className="relative px-5 pb-1 pt-2 text-center">
              <div className="relative flex min-h-11 items-center justify-center">
                {onOpenHistory && (
                  <AssistantHistoryLink
                    label={kind === 'weekly' ? '往期建议' : '往期复盘'}
                    onClick={onOpenHistory}
                    className="absolute right-0 top-0"
                  />
                )}
              </div>
              <p className="mt-1 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">
                根据{dataRange}评价记录生成
              </p>
            </section>

            {reportResolution.document ? (
              <>
                <AssistantReportCards
                  document={reportResolution.document}
                  className="px-[var(--tm-report-page-inline)] py-[var(--tm-report-card-gap)]"
                />
              </>
            ) : (
              <AssistantReportContractError onRetry={onRetry} />
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default PrincipalPeriodicReportView;
