import React from 'react';
import {
  CalendarDays,
  CircleAlert,
  History,
  ListChecks,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  PRINCIPAL_PERIODIC_REPORTS,
  type PrincipalPeriodicReportKind,
  type PrincipalPeriodicReportContent,
} from '../data/principalPeriodicReports';
import AssistantReportFeedback from '../components/AssistantReportFeedback';
import AssistantSubpageHeader from '../components/AssistantSubpageHeader';
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
}) => {
  const report = reportData ?? PRINCIPAL_PERIODIC_REPORTS[kind];
  const status = statusProp ?? (generated ? 'generated' : 'generating');
  const loading = status === 'idle' || status === 'generating';
  const emptyTitle = kind === 'weekly' ? '上周暂无可分析数据' : '上月暂无可分析数据';
  const emptyMessage = kind === 'weekly'
    ? '上一个完整自然周没有有效评价记录，本周管理建议不会调用人工智能生成。'
    : '上一个完整自然月没有有效评价记录，本次学校复盘不会调用人工智能生成。';

  return (
    <div className="ai-assistant-theme-principal principal-report-page min-h-full bg-transparent font-sans text-[var(--tm-text-primary)]">
      <AssistantSubpageHeader
        title={report.pageTitle}
        onBack={onBack}
        action={onOpenHistory && status === 'generated' ? {
          label: kind === 'weekly' ? '查看往期管理建议' : '查看往期学校复盘',
          icon: <History className="h-5 w-5" strokeWidth={2.2} />,
          onClick: onOpenHistory,
        } : undefined}
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
            <p className="mt-4 text-[13px] text-[var(--tm-text-secondary)]">{schoolName}</p>
            <h2 className="mt-1.5 text-[24px] font-bold leading-8">{report.reportTitle}</h2>
            <div className="mt-3 flex items-start gap-2 text-[12px] leading-5 text-[var(--tm-text-tertiary)]">
              <CalendarDays className="mt-0.5 h-4 w-4 shrink-0" strokeWidth={2} />
              <span>{report.periodLabel}<br />{report.periodDetail}</span>
            </div>
          </section>

          <section className="border-b border-[var(--tm-border-subtle)] px-5 py-6">
            <h2 className="text-[17px] font-semibold">{report.metricsTitle}</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {report.metrics.map((metric) => (
                <article key={metric.label} className="min-h-[124px] rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] p-3.5 [box-shadow:var(--tm-shadow-card)]">
                  <p className="text-[12px] text-[var(--tm-text-tertiary)]">{metric.label}</p>
                  <p className="mt-2 text-[22px] font-bold tabular-nums">{metric.value}</p>
                  <p className="mt-1 text-[11px] font-medium text-[var(--tm-role-principal-strong)]">{metric.change}</p>
                  <p className="mt-1.5 text-[11px] leading-4 text-[var(--tm-text-secondary)]">{metric.detail}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-b border-[var(--tm-border-subtle)] px-5 py-6">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-[var(--tm-role-principal-strong)]" strokeWidth={2} />
              <h2 className="text-[17px] font-semibold">{report.judgementTitle}</h2>
            </div>
            <p className="mt-3 text-[14px] leading-7 text-[var(--tm-text-secondary)]">{report.judgement}</p>
          </section>

          {report.progress.length > 0 && (
            <section className="border-b border-[var(--tm-border-subtle)] px-5 py-6">
              <div className="flex items-center gap-2.5">
                <TrendingUp className="h-5 w-5 text-[var(--tm-status-positive-strong)]" strokeWidth={2} />
                <h2 className="text-[17px] font-semibold">{report.progressTitle}</h2>
              </div>
              <div className="mt-4 space-y-5">
                {report.progress.map((item, index) => (
                  <article key={item.title} className="border-l-2 border-[var(--tm-status-positive)] pl-3.5">
                    <h3 className="text-[15px] font-semibold">{index + 1}. {item.title}</h3>
                    <p className="mt-2 text-[14px] leading-6 text-[var(--tm-text-secondary)]">{item.detail}</p>
                    <p className="mt-2 text-[12px] leading-5 text-[var(--tm-status-positive-strong)]">依据：{item.evidence}</p>
                  </article>
                ))}
              </div>
            </section>
          )}

          <section className="border-b border-[var(--tm-border-subtle)] px-5 py-6">
            <div className="flex items-center gap-2.5">
              <CircleAlert className="h-5 w-5 text-[var(--tm-role-principal-accent-strong)]" strokeWidth={2} />
              <h2 className="text-[17px] font-semibold">{report.findingsTitle}</h2>
            </div>
            <div className="mt-4 space-y-5">
              {report.findings.map((item, index) => (
                <article key={item.title} className="border-l-2 border-[var(--tm-role-principal-accent-border)] pl-3.5">
                  <h3 className="text-[15px] font-semibold">{index + 1}. {item.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[var(--tm-text-secondary)]">{item.detail}</p>
                  <p className="mt-2 text-[12px] leading-5 text-[var(--tm-role-principal-accent-strong)]">依据：{item.evidence}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="px-5 py-6">
            <div className="flex items-center gap-2.5">
              <ListChecks className="h-5 w-5 text-[var(--tm-role-principal-strong)]" strokeWidth={2} />
              <h2 className="text-[17px] font-semibold">{report.actionsTitle}</h2>
            </div>
            <ol className="mt-4 space-y-5">
              {report.actions.map((item, index) => (
                <li key={item.title} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tm-role-principal-soft)] text-[12px] font-bold text-[var(--tm-role-principal-strong)]">{index + 1}</span>
                  <div>
                    <h3 className="text-[15px] font-semibold">{item.title}</h3>
                    <p className="mt-1.5 text-[14px] leading-6 text-[var(--tm-text-secondary)]">{item.detail}</p>
                    <p className="mt-2 text-[12px] leading-5 text-[var(--tm-text-tertiary)]">责任：{item.owner}</p>
                    <p className="text-[12px] leading-5 text-[var(--tm-text-tertiary)]">节点：{item.checkpoint} · 检查：{item.metric}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <footer className="mx-5 border-t border-[var(--tm-border-subtle)] py-5 text-[11px] leading-5 text-[var(--tm-text-tertiary)]">
            {report.notice} 生成日期：{report.generatedDate}
          </footer>
        </main>
      )}
    </div>
  );
};

export default PrincipalPeriodicReportView;
