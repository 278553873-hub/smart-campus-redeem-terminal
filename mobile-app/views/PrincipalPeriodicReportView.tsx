import React, { useMemo } from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';
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
import AssistantReportFooter from '../components/assistant-report/AssistantReportFooter';
import {
  adaptPrincipalPeriodicReport,
  resolveAssistantReportDocument,
} from '../domain/assistantReportAdapters';
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

  return (
    <div className="ai-assistant-theme-principal principal-report-page min-h-full bg-transparent font-sans text-[var(--tm-text-primary)]">
      <AssistantSubpageHeader
        title={report.pageTitle}
        onBack={onBack}
      />

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
        <main className="flex min-h-[620px] flex-col items-center px-7 pt-24">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tm-role-principal-soft)] text-[var(--tm-role-principal-strong)]">
            <Sparkles className="h-6 w-6" strokeWidth={2} />
          </span>
          <h2 className="mt-6 text-[20px] font-semibold">{report.loadingTitle}</h2>
          <div className="mt-7 w-full max-w-[280px] space-y-4" role="status" aria-label={report.loadingTitle}>
            {report.analysisSteps.slice(0, visibleStepCount).map((step, index) => {
              const active = index === visibleStepCount - 1;
              return (
                <div key={step} className="flex items-center gap-3 text-[13px] text-[var(--tm-text-secondary)]">
                  <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'animate-pulse bg-[var(--tm-role-principal-primary)]' : 'bg-[var(--tm-border-subtle)]'}`} aria-hidden="true" />
                  <span className={active ? 'text-[var(--tm-text-secondary)]' : 'text-[var(--tm-text-tertiary)]'}>{step}</span>
                </div>
              );
            })}
          </div>
        </main>
      ) : (
        <main>
          <section className="border-b border-[var(--tm-border-subtle)] px-5 pb-6 pt-5">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--tm-role-principal-soft)] px-2.5 py-1 text-[11px] font-semibold text-[var(--tm-role-principal-strong)]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              {report.eyebrow}
            </span>
            <div className="mt-2 flex min-h-11 items-center justify-between gap-3">
              <p className="min-w-0 truncate text-[13px] text-[var(--tm-text-secondary)]">{schoolName}</p>
              {onOpenHistory && (
                <AssistantHistoryLink
                  label={kind === 'weekly' ? '往期建议' : '往期复盘'}
                  onClick={onOpenHistory}
                />
              )}
            </div>
            <h2 className="mt-1.5 text-[24px] font-bold leading-8">{report.reportTitle}</h2>
            <div className="mt-3 flex items-start gap-2 text-[12px] leading-5 text-[var(--tm-text-tertiary)]">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{report.periodLabel}<br />{report.periodDetail}</span>
            </div>
          </section>

          {reportResolution.document ? (
            <>
              <AssistantReportCards
                document={reportResolution.document}
                className="px-[var(--tm-report-page-inline)] py-[var(--tm-report-card-gap)]"
              />
              <AssistantReportFooter document={reportResolution.document} />
            </>
          ) : (
            <AssistantReportContractError onRetry={onRetry} />
          )}
        </main>
      )}
    </div>
  );
};

export default PrincipalPeriodicReportView;
