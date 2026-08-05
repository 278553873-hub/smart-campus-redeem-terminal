import React, { useMemo } from 'react';
import { CalendarDays, Sparkles } from 'lucide-react';
import type { SchoolTermConfig } from '../domain/principalTermReport';
import {
  PRINCIPAL_TERM_REPORT_SAMPLE,
  type PrincipalTermReportContent,
} from '../data/principalTermReport';
import AssistantReportFeedback from '../components/AssistantReportFeedback';
import AssistantHistoryLink from '../components/AssistantHistoryLink';
import AssistantSubpageHeader from '../components/AssistantSubpageHeader';
import AssistantReportCards from '../components/assistant-report/AssistantReportCards';
import AssistantReportContractError from '../components/assistant-report/AssistantReportContractError';
import AssistantReportFooter from '../components/assistant-report/AssistantReportFooter';
import {
  adaptPrincipalTermReport,
  resolveAssistantReportDocument,
} from '../domain/assistantReportAdapters';
import type { ReportGenerationTaskStatus } from '../hooks/useReportGenerationTask';

interface PrincipalTermReportViewProps {
  schoolName: string;
  term: SchoolTermConfig;
  status?: ReportGenerationTaskStatus;
  generated?: boolean;
  visibleStepCount?: number;
  onBack: () => void;
  onRetry?: () => void;
  onOpenHistory?: () => void;
  reportData?: PrincipalTermReportContent;
  reportPayload?: unknown;
}

const ANALYSIS_STEPS = [
  '正在核对本学期学校数据',
  '正在分析班级与教师使用情况',
  '正在提炼典型成果与重点问题',
  '正在生成学校学期报告',
];

const PrincipalTermReportView: React.FC<PrincipalTermReportViewProps> = ({
  schoolName,
  term,
  status: statusProp,
  generated = false,
  visibleStepCount = 1,
  onBack,
  onRetry,
  onOpenHistory,
  reportData,
  reportPayload,
}) => {
  const report = reportData ?? PRINCIPAL_TERM_REPORT_SAMPLE;
  const status = statusProp ?? (generated ? 'generated' : 'generating');
  const loading = status === 'idle' || status === 'generating';
  const reportResolution = useMemo(() => resolveAssistantReportDocument(
    reportPayload,
    adaptPrincipalTermReport(report, schoolName, term),
  ), [report, reportPayload, schoolName, term]);

  return (
    <div className="ai-assistant-theme-principal principal-report-page min-h-full bg-transparent text-[var(--tm-text-primary)]">
      <AssistantSubpageHeader title="学期学校报告" onBack={onBack} />

      {status === 'empty' ? (
        <AssistantReportFeedback
          status="empty"
          title="本学期暂无可分析数据"
          message="当前学期没有有效评价记录，系统不会调用人工智能生成学校学期报告。"
        />
      ) : status === 'failed' ? (
        <AssistantReportFeedback
          status="failed"
          title="学期报告生成失败"
          message="本次报告没有生成成功，请检查网络后重试；已冻结的数据快照不会重复计入。"
          onRetry={onRetry}
        />
      ) : loading ? (
        <main className="px-6 pb-12 pt-16" aria-live="polite">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--tm-radius-card)] bg-[var(--tm-role-principal-soft)] text-[var(--tm-role-principal-strong)] [box-shadow:var(--tm-shadow-card-raised)]">
            <Sparkles className="h-7 w-7 animate-pulse" strokeWidth={1.9} aria-hidden="true" />
          </div>
          <h1 className="mt-6 text-center text-[20px] font-semibold">正在生成学期报告</h1>
          <div className="mx-auto mt-9 min-h-[190px] max-w-[280px]" role="status" aria-label="正在生成学校学期报告">
            <div className="space-y-4">
              {ANALYSIS_STEPS.slice(0, visibleStepCount).map((step, index) => {
                const active = index === visibleStepCount - 1;
                return (
                  <div key={step} className="animate-in fade-in slide-in-from-bottom-1 flex items-start gap-3 duration-300">
                    <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'animate-pulse bg-[var(--tm-role-principal-primary)]' : 'bg-[var(--tm-border-subtle)]'}`} aria-hidden="true" />
                    <p className={`text-[13px] leading-5 ${active ? 'text-[var(--tm-text-secondary)]' : 'text-[var(--tm-text-tertiary)]'}`}>{step}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      ) : (
        <main className="pb-[calc(32px+env(safe-area-inset-bottom))]">
          <section className="border-b border-[var(--tm-border-subtle)] px-[var(--tm-report-page-inline)] pb-6 pt-5">
            <span className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-[var(--tm-role-principal-soft)] px-3 text-[12px] font-semibold text-[var(--tm-role-principal-strong)]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden="true" />
              AI学期综合分析
            </span>
            <div className="mt-3 flex min-h-11 items-center justify-between gap-3">
              <p className="min-w-0 truncate text-[13px] font-medium text-[var(--tm-text-secondary)]">{schoolName}</p>
              {onOpenHistory && <AssistantHistoryLink label="往期报告" onClick={onOpenHistory} />}
            </div>
            <h1 className="mt-1.5 text-[24px] font-bold leading-8">学生综合素质评价系统学期运营报告</h1>
            <div className="mt-4 flex items-start gap-2 text-[12px] leading-5 text-[var(--tm-text-secondary)]">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} aria-hidden="true" />
              <span>{reportResolution.document?.period.label}<br />{reportResolution.document?.period.detail}</span>
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

export default PrincipalTermReportView;
