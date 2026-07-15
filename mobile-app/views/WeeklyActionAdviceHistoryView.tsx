import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react';
import HomeroomClassPickerSheet from '../components/HomeroomClassPickerSheet';
import { WEEKLY_ACTION_ADVICE_HISTORY_BY_CLASS, type WeeklyActionAdviceReport } from '../data/weeklyActionAdvice';
import type { ClassInfo } from '../types';
import WeeklyActionAdviceView from './WeeklyActionAdviceView';

interface WeeklyActionAdviceHistoryViewProps {
    onBack: () => void;
    classes: ClassInfo[];
    initialClassId: string;
}

interface HistoryMonthGroup {
    key: string;
    label: string;
    reports: WeeklyActionAdviceReport[];
}

const getActionPeriodLabel = (title: string) => title.replace(/行动建议$/, '');

const getHistoryMonthGroup = (actionWeekStart: string) => {
    const [year, month] = actionWeekStart.split('-');
    const normalizedMonth = Number(month);

    return {
        key: `${year}-${month}`,
        label: `${year}年${normalizedMonth}月`,
    };
};

const groupReportsByMonth = (reports: WeeklyActionAdviceReport[]) => [...reports]
    .sort((first, second) => second.actionWeekStart.localeCompare(first.actionWeekStart))
    .reduce<HistoryMonthGroup[]>((groups, report) => {
        const month = getHistoryMonthGroup(report.actionWeekStart);
        const existingGroup = groups.find((group) => group.key === month.key);

        if (existingGroup) {
            existingGroup.reports.push(report);
        } else {
            groups.push({ ...month, reports: [report] });
        }

        return groups;
    }, []);

const WeeklyActionAdviceHistoryView: React.FC<WeeklyActionAdviceHistoryViewProps> = ({ onBack, classes, initialClassId }) => {
    const [selectedReport, setSelectedReport] = useState<WeeklyActionAdviceReport | null>(null);
    const [activeClassId, setActiveClassId] = useState(initialClassId);
    const [showClassPicker, setShowClassPicker] = useState(false);
    const activeClass = classes.find((classInfo) => classInfo.id === activeClassId) ?? classes[0];
    const reports = WEEKLY_ACTION_ADVICE_HISTORY_BY_CLASS[activeClass?.id] ?? [];
    const monthGroups = useMemo(() => groupReportsByMonth(reports), [reports]);

    useEffect(() => {
        const scrollContainer = document.getElementById('main-scroll-container');
        if (scrollContainer) scrollContainer.scrollTop = 0;
    }, [activeClassId, selectedReport]);

    if (selectedReport) {
        return (
            <WeeklyActionAdviceView
                report={selectedReport}
                onBack={() => setSelectedReport(null)}
                simulateLoading={false}
            />
        );
    }

    return (
        <div className="relative min-h-full overflow-hidden bg-[linear-gradient(180deg,#F7FCFF_0%,#EEF8FF_42%,#FFFFFF_100%)] font-sans text-slate-950">
            <div className="pointer-events-none absolute -left-24 top-5 h-72 w-72 rounded-full bg-cyan-200/38 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-28 top-20 h-72 w-72 rounded-full bg-violet-200/34 blur-3xl" aria-hidden="true" />

            <header className="relative z-10 flex h-14 items-center px-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition active:scale-95 active:bg-white/70"
                    aria-label="返回本周行动建议"
                >
                    <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
                </button>
                <h1 className="pointer-events-none absolute inset-x-14 text-center text-[17px] font-bold text-slate-900">往期建议</h1>
            </header>

            <main className="relative z-10 px-5 pb-10 pt-2">
                {activeClass && (
                    classes.length > 1 ? (
                        <button
                            type="button"
                            onClick={() => setShowClassPicker(true)}
                            className="mb-3 flex h-11 items-center gap-1 text-[14px] font-semibold text-slate-700 active:text-[#1E9AAA]"
                            aria-label={`切换班级，当前${activeClass.name}`}
                        >
                            {activeClass.name}
                            <ChevronDown className="h-4 w-4 text-slate-400" strokeWidth={2.1} />
                        </button>
                    ) : (
                        <p className="mb-3 flex h-11 items-center text-[14px] font-semibold text-slate-700">{activeClass.name}</p>
                    )
                )}
                <section className="space-y-5" aria-label="往期行动建议列表">
                    {monthGroups.map((group) => (
                        <section key={group.key} aria-labelledby={`history-month-${group.key}`}>
                            <div className="relative flex h-6 items-center pl-5">
                                <span className="absolute left-0 h-3 w-3 rounded-full border-[3px] border-cyan-100 bg-[#1E9AAA]" aria-hidden="true" />
                                <h2 id={`history-month-${group.key}`} className="text-[13px] font-semibold text-slate-500">{group.label}</h2>
                            </div>

                            <div className="relative mt-2 space-y-3 pl-5">
                                <span className="absolute -top-5 bottom-9 left-[5px] w-px bg-slate-200" aria-hidden="true" />
                                {group.reports.map((report) => (
                                    <button
                                        key={report.id}
                                        type="button"
                                        onClick={() => setSelectedReport(report)}
                                        className="waa-card-enter relative flex min-h-[72px] w-full items-center gap-3 rounded-[20px] border border-white/90 bg-white/94 px-4 py-3 text-left shadow-[0_18px_42px_-34px_rgba(35,96,145,0.34)] ring-1 ring-slate-100/70 transition active:scale-[0.985] active:bg-cyan-50/35"
                                        aria-label={`${getActionPeriodLabel(report.title)}行动建议，基于${report.dataRange}评价记录`}
                                    >
                                        <span className="absolute -left-[19px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-white bg-cyan-300 shadow-[0_0_0_1px_rgba(30,154,170,0.18)]" aria-hidden="true" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[15px] font-bold text-slate-900">{getActionPeriodLabel(report.title)}</span>
                                            <span className="mt-1 block text-[12px] text-slate-500">基于{report.dataRange}评价记录</span>
                                        </span>
                                        <ChevronRight className="h-4 w-4 shrink-0 text-slate-300" strokeWidth={2.1} />
                                    </button>
                                ))}
                            </div>
                        </section>
                    ))}
                    {reports.length === 0 && (
                        <p className="py-16 text-center text-[13px] text-slate-400">暂无往期建议</p>
                    )}
                </section>
            </main>

            {showClassPicker && (
                <HomeroomClassPickerSheet
                    classes={classes}
                    selectedClassId={activeClassId}
                    onClose={() => setShowClassPicker(false)}
                    onSelect={(classId) => {
                        setActiveClassId(classId);
                        setShowClassPicker(false);
                    }}
                />
            )}
        </div>
    );
};

export default WeeklyActionAdviceHistoryView;
