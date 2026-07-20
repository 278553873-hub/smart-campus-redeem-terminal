import React, { useEffect, useMemo, useState } from 'react';
import {
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    History,
    ListChecks,
    MessageSquare,
    School,
    Users,
} from 'lucide-react';
import {
    CURRENT_WEEKLY_ACTION_ADVICE,
    WEEKLY_ACTION_ADVICE_SAMPLE_REPORT,
    getWeeklyAdviceTarget,
    type ClassAdviceInsight,
    type StudentAdviceInsight,
    type TeacherEvaluationInsight,
    type WeeklyActionAdviceInsufficient,
    type WeeklyActionAdvicePageData,
    type WeeklyActionAdviceReport,
} from '../data/weeklyActionAdvice';

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

interface PresentationSection {
    title: string;
    icon: IconType;
    gradient: string;
    items: PresentationItem[];
    variant?: 'list';
}

interface PresentationItem {
    key: string;
    summary: string;
    details?: string;
}

const SectionCard: React.FC<{ section: PresentationSection; index: number }> = ({ section, index }) => {
    const Icon = section.icon;

    return (
        <section
            className="waa-card-enter rounded-[22px] border border-white/90 bg-white/95 px-4 py-4 shadow-[0_18px_42px_-34px_rgba(35,96,145,0.34)] ring-1 ring-slate-100/70"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div className="flex items-center gap-2.5">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] bg-gradient-to-br ${section.gradient} text-white shadow-[0_12px_24px_-18px_rgba(30,154,170,0.8)]`}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2.2} />
                </span>
                <h2 className="text-[15px] font-bold text-slate-900">{section.title}</h2>
            </div>

            {section.variant === 'list' ? (
                <ol className="mt-3 space-y-2.5">
                    {section.items.map((item, index) => (
                        <li key={item.key} className="flex gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-[11px] font-bold text-cyan-700">{index + 1}</span>
                            <p className="text-[14px] leading-[1.7] text-slate-600">{item.summary}</p>
                        </li>
                    ))}
                </ol>
            ) : (
                <div className="mt-3 divide-y divide-[var(--tm-border-subtle)]">
                    {section.items.map((item) => item.details ? (
                        <details key={item.key} className="group py-1 first:pt-0 last:pb-0">
                            <summary className="cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                                <p className="text-[14px] leading-[1.72] text-slate-600">{item.summary}</p>
                                <span className="flex min-h-11 items-center gap-1.5 text-[12px] font-medium text-[var(--tm-text-secondary)]">
                                    <span className="group-open:hidden">查看依据</span>
                                    <span className="hidden group-open:inline">收起依据</span>
                                    <ChevronDown className="h-4 w-4 transition-transform duration-200 group-open:rotate-180" strokeWidth={2} aria-hidden="true" />
                                </span>
                            </summary>
                            <p className="mb-3 border-l-2 border-[var(--tm-border-subtle)] pl-3 text-[13px] leading-[1.7] text-[var(--tm-text-secondary)]">{item.details}</p>
                        </details>
                    ) : (
                        <p key={item.key} className="py-2 text-[14px] leading-[1.72] text-slate-600 first:pt-0 last:pb-0">{item.summary}</p>
                    ))}
                </div>
            )}
        </section>
    );
};

const ANALYSIS_STEPS = [
    '正在整理上周评价记录',
    '正在分析评价详情',
    '正在归纳班级重点',
    '正在生成本周行动建议',
];

const formatTeacherEvaluationInsight = (insight: TeacherEvaluationInsight, index: number): PresentationItem => ({
    key: `teacher-${insight.teacherNames.join('-')}-${index}`,
    summary: `${insight.teacherNames.join('、')}：${insight.finding}。${insight.evidence}。`,
    details: `说明：${insight.implication}。`,
});

const formatStudentInsight = (insight: StudentAdviceInsight, index: number): PresentationItem => ({
    key: `student-${insight.studentNames.join('-')}-${index}`,
    summary: `${insight.studentNames.join('、')}：${insight.finding}。${insight.evidence}。`,
    details: `解读：${insight.interpretation}。${insight.needVerify && insight.verificationFocus ? `核实重点：${insight.verificationFocus}。` : ''}`,
});

const formatClassInsight = (insight: ClassAdviceInsight, index: number): PresentationItem => ({
    key: `class-${insight.insightType}-${index}`,
    summary: `${insight.finding}。${insight.evidence}。`,
    details: `${insight.condition ? `发生条件：${insight.condition}。` : ''}说明：${insight.implication}。`,
});

const AnalysisProgress: React.FC<{ visibleStepCount: number }> = ({ visibleStepCount }) => (
    <div className="mx-auto mt-8 min-h-[190px] max-w-[280px]" role="status" aria-live="polite" aria-label="正在生成本周行动建议">
        <div className="space-y-4">
            {ANALYSIS_STEPS.slice(0, visibleStepCount).map((step, index) => {
                const active = index === visibleStepCount - 1;
                return (
                    <div key={step} className="animate-in fade-in slide-in-from-bottom-1 flex items-start gap-3 duration-300">
                        <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'animate-pulse bg-[#1E9AAA]' : 'bg-slate-300'}`} aria-hidden="true" />
                        <p className={`text-[13px] font-normal leading-5 ${active ? 'text-slate-600' : 'text-slate-400'}`}>{step}</p>
                    </div>
                );
            })}
        </div>
    </div>
);

const getPresentationSections = (report: WeeklyActionAdviceReport): PresentationSection[] => [
    {
        title: '学生洞察',
        icon: Users,
        gradient: 'from-teal-400 to-cyan-500',
        items: report.content.studentInsights.map(formatStudentInsight),
    },
    {
        title: '评价洞察',
        icon: MessageSquare,
        gradient: 'from-violet-400 to-indigo-500',
        items: report.content.evaluationInsights.map(formatTeacherEvaluationInsight),
    },
    {
        title: '班级洞察',
        icon: School,
        gradient: 'from-blue-400 to-violet-500',
        items: report.content.classInsights.map(formatClassInsight),
    },
    {
        title: '本周重点行动',
        icon: ListChecks,
        gradient: 'from-cyan-500 to-teal-500',
        items: report.content.actions.map((action, index) => ({ key: `action-${index}`, summary: action })),
        variant: 'list',
    },
].filter((section) => section.items.length > 0) as PresentationSection[];

const RequirementRow: React.FC<{
    label: string;
    current: number;
    target: number;
    unit: string;
}> = ({ label, current, target, unit }) => {
    const gap = Math.max(0, target - current);

    return (
        <div className="flex min-h-14 items-center gap-3 py-2.5">
            <span className="w-[72px] shrink-0 text-[13px] text-slate-600">{label}</span>
            <span className="min-w-0 flex-1 text-[15px] font-bold tabular-nums text-slate-900">
                {current}<span className="mx-1 text-[12px] font-medium text-slate-300">/</span>{target}
            </span>
            <span className={`shrink-0 text-[12px] font-medium ${gap === 0 ? 'text-emerald-600' : 'text-rose-500'}`}>
                {gap === 0 ? '已达标' : `还差${gap}${unit}`}
            </span>
        </div>
    );
};

const INSUFFICIENT_MESSAGE_FIRST_LINE = '上周数据不足，';
const INSUFFICIENT_MESSAGE_SECOND_LINE = '暂时无法生成本周行动建议。';
const INSUFFICIENT_MESSAGE = `${INSUFFICIENT_MESSAGE_FIRST_LINE}${INSUFFICIENT_MESSAGE_SECOND_LINE}`;

const InsufficientContent: React.FC<{
    data: WeeklyActionAdviceInsufficient;
    onViewSample: () => void;
}> = ({ data, onViewSample }) => {
    const previousTarget = getWeeklyAdviceTarget(data.previousWeek.total);
    const currentTarget = getWeeklyAdviceTarget(data.currentWeek.total);
    const readyForNextWeek = data.currentWeek.records >= currentTarget.records
        && data.currentWeek.covered >= currentTarget.covered;
    const [visibleMessageLength, setVisibleMessageLength] = useState(0);
    const [visibleRequirementCount, setVisibleRequirementCount] = useState(0);
    const visibleFirstLine = INSUFFICIENT_MESSAGE_FIRST_LINE.slice(0, visibleMessageLength);
    const visibleSecondLine = INSUFFICIENT_MESSAGE_SECOND_LINE.slice(
        0,
        Math.max(0, visibleMessageLength - INSUFFICIENT_MESSAGE_FIRST_LINE.length),
    );

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const timers: number[] = [];

        if (reduceMotion) {
            setVisibleMessageLength(INSUFFICIENT_MESSAGE.length);
            setVisibleRequirementCount(2);
            return;
        }

        setVisibleMessageLength(0);
        setVisibleRequirementCount(0);

        INSUFFICIENT_MESSAGE.split('').forEach((_, index) => {
            timers.push(window.setTimeout(() => setVisibleMessageLength(index + 1), 240 + index * 48));
        });

        const messageCompletedAt = 240 + INSUFFICIENT_MESSAGE.length * 48;
        timers.push(window.setTimeout(() => setVisibleRequirementCount(1), messageCompletedAt + 280));
        timers.push(window.setTimeout(() => setVisibleRequirementCount(2), messageCompletedAt + 640));

        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [data.id]);

    return (
        <div className="mt-5">
            <section className="px-2 text-center">
                <h2 className="mx-auto min-h-[60px] max-w-[300px] text-[20px] font-bold leading-[30px] text-slate-900">
                    <span aria-hidden="true">
                        <span className="block">
                            {visibleFirstLine}
                            {visibleMessageLength < INSUFFICIENT_MESSAGE_FIRST_LINE.length && (
                                <span className="ml-0.5 inline-block h-5 w-px animate-pulse bg-[#1E9AAA] align-[-3px]" />
                            )}
                        </span>
                        <span className="block">
                            {visibleSecondLine}
                            {visibleMessageLength >= INSUFFICIENT_MESSAGE_FIRST_LINE.length
                                && visibleMessageLength < INSUFFICIENT_MESSAGE.length && (
                                <span className="ml-0.5 inline-block h-5 w-px animate-pulse bg-[#1E9AAA] align-[-3px]" />
                            )}
                        </span>
                    </span>
                    <span className="sr-only">{INSUFFICIENT_MESSAGE}</span>
                </h2>
            </section>

            {visibleRequirementCount > 0 && (
                <section className="waa-card-enter mt-6 rounded-[22px] border border-white/90 bg-white/95 px-4 py-3 shadow-[0_18px_42px_-34px_rgba(35,96,145,0.34)] ring-1 ring-slate-100/70">
                    <h2 className="text-[15px] font-bold text-slate-900">上周数据</h2>
                    <div className="mt-1 divide-y divide-slate-100">
                        <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                            <RequirementRow label="记录条数" current={data.previousWeek.records} target={previousTarget.records} unit="条" />
                        </div>
                        {visibleRequirementCount > 1 && (
                            <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                                <RequirementRow label="覆盖同学" current={data.previousWeek.covered} target={previousTarget.covered} unit="人" />
                            </div>
                        )}
                    </div>
                </section>
            )}

            {visibleRequirementCount === 2 && (
                <div className="animate-in fade-in slide-in-from-bottom-1 duration-300">
                    <p className="mt-5 px-2 text-[13px] leading-6 text-slate-500">
                        {readyForNextWeek
                            ? '本周已达到以上条件，下周进入班主任助理即可生成。'
                            : '本周达到以上条件后，下周进入班主任助理即可生成。'}
                    </p>

                    <button
                        type="button"
                        onClick={onViewSample}
                        className="mt-2 flex h-11 w-full items-center justify-between px-2 text-left text-[14px] font-medium text-slate-500 transition active:text-[#1E9AAA]"
                        aria-label="查看报告示例"
                    >
                        <span>查看报告示例</span>
                        <ChevronRight className="h-4 w-4 text-slate-300" strokeWidth={2} />
                    </button>
                </div>
            )}
        </div>
    );
};

interface WeeklyActionAdviceViewProps {
    onBack: () => void;
    onOpenHistory?: () => void;
    data?: WeeklyActionAdvicePageData;
    report?: WeeklyActionAdviceReport;
    simulateLoading?: boolean;
}

const WeeklyActionAdviceView: React.FC<WeeklyActionAdviceViewProps> = ({
    onBack,
    onOpenHistory,
    data,
    report,
    simulateLoading = true,
}) => {
    const pageData = data ?? report ?? CURRENT_WEEKLY_ACTION_ADVICE;
    const [viewingExample, setViewingExample] = useState(false);
    const activeReport = viewingExample
        ? WEEKLY_ACTION_ADVICE_SAMPLE_REPORT
        : pageData.status === 'generated' ? pageData : null;
    const shouldSimulateLoading = Boolean(activeReport && !viewingExample && simulateLoading);
    const [loading, setLoading] = useState(shouldSimulateLoading);
    const [visibleStepCount, setVisibleStepCount] = useState(shouldSimulateLoading ? 1 : ANALYSIS_STEPS.length);
    const sections = useMemo(() => activeReport ? getPresentationSections(activeReport) : [], [activeReport]);

    useEffect(() => {
        if (!shouldSimulateLoading) {
            setLoading(false);
            setVisibleStepCount(ANALYSIS_STEPS.length);
            return;
        }

        setLoading(true);
        setVisibleStepCount(1);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const stepDelay = 720;
        const timers: number[] = [];

        if (reduceMotion) {
            setVisibleStepCount(ANALYSIS_STEPS.length);
        } else {
            ANALYSIS_STEPS.slice(1).forEach((_, index) => {
                timers.push(window.setTimeout(() => setVisibleStepCount(index + 2), (index + 1) * stepDelay));
            });
        }

        timers.push(window.setTimeout(
            () => setLoading(false),
            reduceMotion ? 600 : ANALYSIS_STEPS.length * stepDelay + 360,
        ));

        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [pageData.id, shouldSimulateLoading]);

    const title = viewingExample ? WEEKLY_ACTION_ADVICE_SAMPLE_REPORT.title : pageData.title;
    const className = viewingExample ? WEEKLY_ACTION_ADVICE_SAMPLE_REPORT.className : pageData.className;
    const showHeaderTitle = title !== '本周行动建议';

    return (
        <div className="relative min-h-full overflow-hidden bg-[linear-gradient(180deg,#F7FCFF_0%,#EEF8FF_42%,#FFFFFF_100%)] font-sans text-slate-950">
            <div className="pointer-events-none absolute -left-24 top-5 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-28 top-20 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" aria-hidden="true" />

            <header className="relative z-20 flex h-14 items-center px-4">
                <button
                    type="button"
                    onClick={viewingExample ? () => setViewingExample(false) : onBack}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition active:scale-95 active:bg-white/70"
                    aria-label={viewingExample ? '返回本周行动建议' : '返回'}
                >
                    <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
                </button>
                {showHeaderTitle && (
                    <h1 className="pointer-events-none absolute inset-x-14 text-center text-[17px] font-bold text-slate-900">{title}</h1>
                )}
                {!viewingExample && onOpenHistory && (
                    <button
                        type="button"
                        onClick={onOpenHistory}
                        className="ml-auto flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition active:scale-95 active:bg-white/70"
                        aria-label="查看往期建议"
                        title="查看往期建议"
                    >
                        <History className="h-5 w-5" strokeWidth={2.2} />
                    </button>
                )}
            </header>

            <main className="relative z-10 px-5 pb-10 pt-1">
                <section className="pb-1 text-center">
                    <p className={activeReport ? 'text-[15px] font-bold text-slate-900' : 'text-[13px] font-medium text-slate-500'}>{className}</p>
                    {!loading && activeReport && (
                        <p className="mt-1 text-[12px] text-slate-500">
                            {viewingExample ? '示例内容 · ' : ''}根据{activeReport.dataRange}评价记录生成
                        </p>
                    )}
                </section>

                {activeReport ? (
                    loading ? (
                        <AnalysisProgress visibleStepCount={visibleStepCount} />
                    ) : (
                        <div className="mt-4 space-y-3">
                            {sections.map((section, index) => (
                                <SectionCard key={section.title} section={section} index={index} />
                            ))}
                        </div>
                    )
                ) : (
                    <InsufficientContent
                        data={pageData as WeeklyActionAdviceInsufficient}
                        onViewSample={() => setViewingExample(true)}
                    />
                )}

                {!loading && activeReport && (
                    <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
                        {viewingExample ? '示例内容，仅用于展示报告结构' : '以上内容由AI基于评价记录生成，仅供参考'}
                    </p>
                )}
            </main>
        </div>
    );
};

export default WeeklyActionAdviceView;
