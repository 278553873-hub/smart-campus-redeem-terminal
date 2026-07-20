import React, { useEffect, useMemo, useState } from 'react';
import {
  BookOpen,
  Building2,
  CalendarDays,
  ChevronLeft,
  CircleAlert,
  LayoutGrid,
  ListChecks,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { SchoolTermConfig } from '../domain/principalTermReport';
import { PRINCIPAL_TERM_REPORT_SAMPLE } from '../data/principalTermReport';

interface PrincipalTermReportViewProps {
  schoolName: string;
  term: SchoolTermConfig;
  generated: boolean;
  onBack: () => void;
  onGenerated: () => void;
}

const ANALYSIS_STEPS = [
  '正在核对本学期学校数据',
  '正在分析班级与教师使用情况',
  '正在提炼典型成果与重点问题',
  '正在生成学校学期报告',
];

const formatDateRange = (term: SchoolTermConfig) => (
  `${term.startDate.replaceAll('-', '.')} - ${term.endDate.replaceAll('-', '.')}`
);

const PrincipalTermReportView: React.FC<PrincipalTermReportViewProps> = ({
  schoolName,
  term,
  generated,
  onBack,
  onGenerated,
}) => {
  const [loading, setLoading] = useState(!generated);
  const [visibleStepCount, setVisibleStepCount] = useState(generated ? ANALYSIS_STEPS.length : 1);
  const generatedDate = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日`;
  }, []);

  useEffect(() => {
    if (generated) {
      setLoading(false);
      setVisibleStepCount(ANALYSIS_STEPS.length);
      return;
    }

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setLoading(false);
      setVisibleStepCount(ANALYSIS_STEPS.length);
      onGenerated();
      return;
    }

    const timers = ANALYSIS_STEPS.slice(1).map((_, index) => (
      window.setTimeout(() => setVisibleStepCount(index + 2), 650 * (index + 1))
    ));
    timers.push(window.setTimeout(() => {
      setLoading(false);
      onGenerated();
    }, 2800));

    return () => timers.forEach(timer => window.clearTimeout(timer));
  }, [generated, onGenerated]);

  return (
    <div className="min-h-full bg-[var(--tm-bg-page)] text-[var(--tm-text-primary)]">
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between bg-[var(--tm-bg-page-glass)] px-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-control)] text-[var(--tm-text-secondary)] transition active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"
          aria-label="返回"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
        <span className="text-[17px] font-semibold">学期学校报告</span>
        <span className="h-11 w-11" aria-hidden="true" />
      </header>

      {loading ? (
        <main className="px-6 pb-12 pt-16" aria-live="polite">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-[var(--tm-radius-card)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-card-raised)]">
            <Sparkles className="h-7 w-7 animate-pulse" strokeWidth={1.9} />
          </div>
          <h1 className="mt-6 text-center text-[20px] font-semibold">正在生成学期报告</h1>
          <div className="mx-auto mt-9 min-h-[190px] max-w-[280px]" role="status" aria-label="正在生成学校学期报告">
            <div className="space-y-4">
              {ANALYSIS_STEPS.slice(0, visibleStepCount).map((step, index) => {
                const active = index === visibleStepCount - 1;
                return (
                  <div key={step} className="animate-in fade-in slide-in-from-bottom-1 flex items-start gap-3 duration-300">
                    <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'animate-pulse bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-border-subtle)]'}`} aria-hidden="true" />
                    <p className={`text-[13px] leading-5 ${active ? 'text-[var(--tm-text-secondary)]' : 'text-[var(--tm-text-tertiary)]'}`}>{step}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      ) : (
        <main className="pb-[calc(32px+env(safe-area-inset-bottom))]">
          <section className="border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-5 pb-6 pt-5">
            <div className="inline-flex min-h-7 items-center gap-1.5 rounded-full bg-[var(--tm-brand-primary-soft)] px-3 text-[12px] font-semibold text-[var(--tm-brand-primary)]">
              <Sparkles className="h-3.5 w-3.5" strokeWidth={2} />
              AI学期综合分析
            </div>
            <p className="mt-5 text-[13px] font-medium text-[var(--tm-text-secondary)]">{schoolName}</p>
            <h1 className="mt-1.5 text-[24px] font-bold leading-8">学生综合素质评价系统学期运营报告</h1>
            <div className="mt-4 flex items-center gap-2 text-[12px] text-[var(--tm-text-secondary)]">
              <CalendarDays className="h-4 w-4" strokeWidth={2} />
              <span>{term.name}</span>
              <span aria-hidden="true">·</span>
              <span>{formatDateRange(term)}</span>
            </div>
          </section>

          <section className="border-b border-[var(--tm-border-subtle)] px-5 py-6">
            <h2 className="text-[17px] font-semibold">学期核心数据</h2>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {PRINCIPAL_TERM_REPORT_SAMPLE.metrics.map(metric => (
                <div key={metric.label} className="min-h-[104px] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] p-3.5 [box-shadow:var(--tm-shadow-card)]">
                  <p className="text-[12px] text-[var(--tm-text-secondary)]">{metric.label}</p>
                  <p className="mt-2 text-[24px] font-bold tabular-nums text-[var(--tm-text-primary)]">{metric.value}</p>
                  <p className="mt-1.5 text-[12px] leading-5 text-[var(--tm-text-secondary)]">{metric.detail}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="border-b border-[var(--tm-border-subtle)] px-5 py-6">
            <div className="flex items-center gap-2.5">
              <Sparkles className="h-5 w-5 text-[var(--tm-brand-primary)]" strokeWidth={2} />
              <h2 className="text-[17px] font-semibold">总体判断</h2>
            </div>
            <p className="mt-3 text-[14px] leading-7 text-[var(--tm-text-secondary)]">{PRINCIPAL_TERM_REPORT_SAMPLE.conclusion}</p>
          </section>

          <section className="border-b border-[var(--tm-border-subtle)] px-5 py-6">
            <div className="flex items-center gap-2.5">
              <Building2 className="h-5 w-5 text-[var(--tm-role-principal-strong)]" strokeWidth={2} />
              <h2 className="text-[17px] font-semibold">班级与教师使用情况</h2>
            </div>
            <div className="mt-4 space-y-5">
              {PRINCIPAL_TERM_REPORT_SAMPLE.usage.map((item, index) => (
                <article key={item.title} className="border-l-2 border-[var(--tm-role-principal-soft-strong)] pl-3.5">
                  <h3 className="text-[15px] font-semibold">{index + 1}. {item.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[var(--tm-text-secondary)]">{item.detail}</p>
                  <p className="mt-2 text-[12px] leading-5 text-[var(--tm-role-principal-strong)]">依据：{item.evidence}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-b border-[var(--tm-border-subtle)] px-5 py-6">
            <div className="flex items-center gap-2.5">
              <TrendingUp className="h-5 w-5 text-[var(--tm-status-positive-strong)]" strokeWidth={2} />
              <h2 className="text-[17px] font-semibold">优秀成果与亮点</h2>
            </div>
            <div className="mt-4 space-y-5">
              {PRINCIPAL_TERM_REPORT_SAMPLE.highlights.map((item, index) => (
                <article key={item.title} className="border-l-2 border-[var(--tm-status-positive)] pl-3.5">
                  <h3 className="text-[15px] font-semibold">{index + 1}. {item.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[var(--tm-text-secondary)]">{item.detail}</p>
                  <p className="mt-2 text-[12px] leading-5 text-[var(--tm-status-positive-strong)]">依据：{item.evidence}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-b border-[var(--tm-border-subtle)] px-5 py-6">
            <div className="flex items-center gap-2.5">
              <BookOpen className="h-5 w-5 text-[var(--tm-role-principal-accent-strong)]" strokeWidth={2} />
              <h2 className="text-[17px] font-semibold">代表性实践</h2>
            </div>
            <div className="mt-4 divide-y divide-[var(--tm-border-subtle)]">
              {PRINCIPAL_TERM_REPORT_SAMPLE.practices.map((item, index) => (
                <article key={item.title} className="py-5 first:pt-0 last:pb-0">
                  <p className="text-[11px] font-medium text-[var(--tm-role-principal-accent-strong)]">案例 {index + 1} · {item.context}</p>
                  <h3 className="mt-1.5 text-[15px] font-semibold">{item.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[var(--tm-text-secondary)]">{item.detail}</p>
                  <p className="mt-2 text-[12px] leading-5 text-[var(--tm-text-tertiary)]">依据：{item.evidence}</p>
                  <p className="mt-2 text-[12px] leading-5 text-[var(--tm-role-principal-strong)]">价值：{item.value}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-b border-[var(--tm-border-subtle)] px-5 py-6">
            <div className="flex items-center gap-2.5">
              <LayoutGrid className="h-5 w-5 text-[var(--tm-brand-secondary-strong)]" strokeWidth={2} />
              <h2 className="text-[17px] font-semibold">五育与指标体系观察</h2>
            </div>
            <div className="mt-4 space-y-5">
              {PRINCIPAL_TERM_REPORT_SAMPLE.indicatorInsights.map((item, index) => (
                <article key={item.title} className="border-l-2 border-[var(--tm-brand-secondary)] pl-3.5">
                  <h3 className="text-[15px] font-semibold">{index + 1}. {item.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[var(--tm-text-secondary)]">{item.detail}</p>
                  <p className="mt-2 text-[12px] leading-5 text-[var(--tm-brand-secondary-strong)]">依据：{item.evidence}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="border-b border-[var(--tm-border-subtle)] px-5 py-6">
            <div className="flex items-center gap-2.5">
              <CircleAlert className="h-5 w-5 text-[var(--tm-status-negative-strong)]" strokeWidth={2} />
              <h2 className="text-[17px] font-semibold">需要关注的问题</h2>
            </div>
            <div className="mt-4 space-y-5">
              {PRINCIPAL_TERM_REPORT_SAMPLE.concerns.map((item, index) => (
                <article key={item.title} className="border-l-2 border-[var(--tm-status-negative)] pl-3.5">
                  <h3 className="text-[15px] font-semibold">{index + 1}. {item.title}</h3>
                  <p className="mt-2 text-[14px] leading-6 text-[var(--tm-text-secondary)]">{item.detail}</p>
                  <p className="mt-2 text-[12px] leading-5 text-[var(--tm-status-negative-strong)]">依据：{item.evidence}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="px-5 py-6">
            <div className="flex items-center gap-2.5">
              <ListChecks className="h-5 w-5 text-[var(--tm-brand-secondary-strong)]" strokeWidth={2} />
              <h2 className="text-[17px] font-semibold">下学期深化建议</h2>
            </div>
            <ol className="mt-4 space-y-5">
              {PRINCIPAL_TERM_REPORT_SAMPLE.actions.map((item, index) => (
                <li key={item.title} className="grid grid-cols-[28px_minmax(0,1fr)] gap-3">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[var(--tm-brand-secondary-soft)] text-[12px] font-bold text-[var(--tm-brand-secondary-strong)]">{index + 1}</span>
                  <div>
                    <h3 className="text-[15px] font-semibold">{item.title}</h3>
                    <p className="mt-1.5 text-[14px] leading-6 text-[var(--tm-text-secondary)]">{item.detail}</p>
                    <p className="mt-2 text-[12px] leading-5 text-[var(--tm-text-secondary)]">责任：{item.owner} · 跟踪：{item.metric}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <footer className="mx-5 border-t border-[var(--tm-border-subtle)] py-5 text-[12px] leading-5 text-[var(--tm-text-tertiary)]">
            本报告由AI基于本学期学校评价数据生成，仅供学校管理与工作复盘参考。生成日期：{generatedDate}
          </footer>
        </main>
      )}
    </div>
  );
};

export default PrincipalTermReportView;
