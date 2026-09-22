import React, { useMemo } from 'react';
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
    <div className="ai-assistant-theme-principal relative flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent text-[var(--tm-text-primary)]">
      <AssistantSubpageHeader title="学期学校报告" onBack={onBack} surface="transparent" />

      <main data-view-scroll-root className="min-h-0 flex-1 overflow-y-auto no-scrollbar pb-[calc(32px+env(safe-area-inset-bottom))]">
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
          <div className="px-5" role="status" aria-live="polite" aria-label="正在生成学校学期报告">
            <div className="mx-auto mt-8 min-h-[190px] max-w-[280px] space-y-4">
              {ANALYSIS_STEPS.slice(0, visibleStepCount).map((step, index) => {
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
            <section className="relative px-[var(--tm-report-page-inline)] pb-1 pt-2 text-center">
              <div className="relative flex min-h-11 items-center justify-center">
                {onOpenHistory && <AssistantHistoryLink label="往期报告" onClick={onOpenHistory} className="absolute right-0 top-0" />}
              </div>
              <p className="mt-1 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">
                根据{term.name}评价记录生成
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

export default PrincipalTermReportView;
