import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  PRINCIPAL_REPORT_HISTORY,
  type PrincipalReportHistoryItem,
  type PrincipalReportHistoryKind,
} from '../data/principalReportHistory';
import PrincipalPeriodicReportView from './PrincipalPeriodicReportView';
import PrincipalTermReportView from './PrincipalTermReportView';

interface PrincipalReportHistoryViewProps {
  kind: PrincipalReportHistoryKind;
  schoolName: string;
  onBack: () => void;
}

interface PrincipalHistoryGroup {
  key: string;
  label: string;
  reports: PrincipalReportHistoryItem[];
}

const historyTitle: Record<PrincipalReportHistoryKind, string> = {
  weekly: '往期管理建议',
  monthly: '往期学校复盘',
  term: '往期学期报告',
};

const historyListLabel: Record<PrincipalReportHistoryKind, string> = {
  weekly: '往期管理建议列表',
  monthly: '往期学校复盘列表',
  term: '往期学期报告列表',
};

const noop = () => undefined;

const PrincipalReportHistoryView: React.FC<PrincipalReportHistoryViewProps> = ({
  kind,
  schoolName,
  onBack,
}) => {
  const [selectedReport, setSelectedReport] = useState<PrincipalReportHistoryItem | null>(null);
  const reports = PRINCIPAL_REPORT_HISTORY[kind];
  const groups = useMemo(() => reports.reduce<PrincipalHistoryGroup[]>((result, report) => {
    const existing = result.find((group) => group.key === report.groupKey);
    if (existing) {
      existing.reports.push(report);
    } else {
      result.push({ key: report.groupKey, label: report.groupLabel, reports: [report] });
    }
    return result;
  }, []), [reports]);

  useEffect(() => {
    const scrollContainer = document.getElementById('main-scroll-container');
    if (scrollContainer) scrollContainer.scrollTop = 0;
  }, [kind, selectedReport]);

  if (selectedReport) {
    if (selectedReport.kind === 'term') {
      return (
        <PrincipalTermReportView
          schoolName={schoolName}
          term={selectedReport.term}
          reportData={selectedReport.report}
          generated
          onGenerated={noop}
          onBack={() => setSelectedReport(null)}
        />
      );
    }

    return (
      <PrincipalPeriodicReportView
        kind={selectedReport.kind}
        schoolName={schoolName}
        reportData={selectedReport.report}
        generated
        onGenerated={noop}
        onBack={() => setSelectedReport(null)}
      />
    );
  }

  return (
    <div className="ai-assistant-theme-principal min-h-full bg-[var(--tm-bg-page)] font-sans text-[var(--tm-text-primary)]">
      <header className="sticky top-0 z-30 flex h-14 items-center border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-page-glass)] px-4 backdrop-blur-xl">
        <button
          type="button"
          onClick={onBack}
          className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition active:scale-95 active:bg-[var(--tm-role-principal-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-role-principal-primary)]"
          aria-label="返回当前报告"
        >
          <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
        </button>
        <h1 className="pointer-events-none absolute inset-x-14 text-center text-[17px] font-semibold">{historyTitle[kind]}</h1>
      </header>

      <main className="px-5 pb-10 pt-4">
        <p className="mb-4 text-[13px] font-medium text-[var(--tm-text-secondary)]">{schoolName}</p>
        <section className="space-y-6" aria-label={historyListLabel[kind]}>
          {groups.map((group) => (
            <section key={group.key} aria-labelledby={`principal-history-${kind}-${group.key}`}>
              <div className="relative flex h-6 items-center pl-5">
                <span className="absolute left-0 h-3 w-3 rounded-full border-[3px] border-[var(--tm-role-principal-soft-strong)] bg-[var(--tm-role-principal-primary)]" aria-hidden="true" />
                <h2 id={`principal-history-${kind}-${group.key}`} className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">{group.label}</h2>
              </div>

              <div className="relative mt-2 space-y-3 pl-5">
                <span className="absolute -top-5 bottom-9 left-[5px] w-px bg-[var(--tm-border-subtle)]" aria-hidden="true" />
                {group.reports.map((report) => (
                  <button
                    key={report.id}
                    type="button"
                    onClick={() => setSelectedReport(report)}
                    className="relative flex min-h-[82px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-4 py-3 text-left [box-shadow:var(--tm-shadow-card)] transition active:scale-[0.985] active:bg-[var(--tm-role-principal-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-role-principal-primary)]"
                    aria-label={`${report.title}，${report.periodLabel}，生成于${report.generatedDate}`}
                  >
                    <span className="absolute -left-[19px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-[var(--tm-bg-page)] bg-[var(--tm-role-principal-soft-strong)]" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[15px] font-semibold leading-5">{report.title}</span>
                      <span className="mt-1.5 flex items-center gap-1.5 text-[12px] leading-5 text-[var(--tm-text-secondary)]">
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                        {report.periodLabel}
                      </span>
                      <span className="mt-0.5 block text-[11px] text-[var(--tm-text-tertiary)]">生成于{report.generatedDate}</span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" strokeWidth={2.1} />
                  </button>
                ))}
              </div>
            </section>
          ))}
          {reports.length === 0 && (
            <p className="py-16 text-center text-[13px] text-[var(--tm-text-tertiary)]">暂无往期报告</p>
          )}
        </section>
      </main>
    </div>
  );
};

export default PrincipalReportHistoryView;
