import React, { useEffect, useState } from 'react';
import {
  CalendarDays,
  Check,
  ChevronLeft,
  CircleAlert,
  ListChecks,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  PRINCIPAL_PERIODIC_REPORTS,
  type PrincipalPeriodicReportKind,
} from '../data/principalPeriodicReports';

interface PrincipalPeriodicReportViewProps {
  kind: PrincipalPeriodicReportKind;
  schoolName: string;
  generated: boolean;
  onGenerated: () => void;
  onBack: () => void;
}

const PrincipalPeriodicReportView: React.FC<PrincipalPeriodicReportViewProps> = ({
  kind,
  schoolName,
  generated,
  onGenerated,
  onBack,
}) => {
  const report = PRINCIPAL_PERIODIC_REPORTS[kind];
  const [loading, setLoading] = useState(!generated);
  const [visibleStepCount, setVisibleStepCount] = useState(generated ? report.analysisSteps.length : 1);

  useEffect(() => {
    if (generated) {
      setLoading(false);
      setVisibleStepCount(report.analysisSteps.length);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setVisibleStepCount(report.analysisSteps.length);
      setLoading(false);
      onGenerated();
      return;
    }

    const timers = report.analysisSteps.slice(1).map((_, index) => (
      window.setTimeout(() => setVisibleStepCount(index + 2), 650 * (index + 1))
    ));
    timers.push(window.setTimeout(() => {
      setLoading(false);
      onGenerated();
    }, 2800));

    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [generated, onGenerated, report.analysisSteps]);

  return (
    <div className="ai-assistant-theme-principal min-h-full bg-[var(--tm-bg-surface)] font-sans text-[var(--tm-text-primary)]">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition active:scale-95 active:bg-[var(--tm-role-principal-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-role-principal-primary)]"
          aria-label="返回"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
        <h1 className="pointer-events-none absolute inset-x-14 text-center text-[17px] font-semibold">{report.pageTitle}</h1>
      </header>

      {loading ? (
        <main className="flex min-h-[620px] flex-col items-center px-7 pt-24">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[var(--tm-role-principal-soft)] text-[var(--tm-role-principal-strong)]">
            <Sparkles className="h-6 w-6" strokeWidth={2} />
          </span>
          <h2 className="mt-6 text-[20px] font-semibold">{report.loadingTitle}</h2>
          <div className="mt-7 w-full max-w-[280px] space-y-4" role="status" aria-label={report.loadingTitle}>
            {report.analysisSteps.slice(0, visibleStepCount).map((step, index) => {
              const complete = index < visibleStepCount - 1;
              return (
                <div key={step} className="flex items-center gap-3 text-[13px] text-[var(--tm-text-secondary)]">
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${complete
                    ? 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]'
                    : 'bg-[var(--tm-role-principal-soft)] text-[var(--tm-role-principal-strong)]'
                  }`}>
                    {complete ? <Check className="h-3.5 w-3.5" strokeWidth={2.5} /> : <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-current" />}
                  </span>
                  <span>{step}</span>
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
