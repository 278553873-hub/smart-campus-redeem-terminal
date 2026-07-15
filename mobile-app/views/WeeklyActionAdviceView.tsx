import React, { useEffect, useMemo, useState } from 'react';
import {
    ChevronLeft,
    History,
    ListChecks,
    MessageSquare,
    School,
    Sparkles,
    Users,
} from 'lucide-react';
import {
    CURRENT_WEEKLY_ACTION_ADVICE,
    type WeeklyActionAdviceReport,
} from '../data/weeklyActionAdvice';

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

interface PresentationSection {
    title: string;
    icon: IconType;
    gradient: string;
    paragraphs: string[];
    variant?: 'list';
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
                    {section.paragraphs.map((paragraph, index) => (
                        <li key={paragraph} className="flex gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-[11px] font-bold text-cyan-700">{index + 1}</span>
                            <p className="text-[14px] leading-[1.7] text-slate-600">{paragraph}</p>
                        </li>
                    ))}
                </ol>
            ) : (
                <div className="mt-3 space-y-2.5">
                    {section.paragraphs.map((paragraph) => (
                        <p key={paragraph} className="text-[14px] leading-[1.72] text-slate-600">{paragraph}</p>
                    ))}
                </div>
            )}
        </section>
    );
};

const getAnalysisSteps = (weeks: WeeklyActionAdviceReport['dataWindowWeeks']) => {
    if (weeks === 4) {
        return [
            '正在整理上周评价记录',
            '上周记录较少，继续参考前一周',
            '前两周记录仍较少，继续参考前四周',
            '正在分析前四周评价详情',
            '正在生成本周行动建议',
        ];
    }
    if (weeks === 2) {
        return [
            '正在整理上周评价记录',
            '上周记录较少，继续参考前一周',
            '正在分析前两周评价详情',
            '正在生成本周行动建议',
        ];
    }
    return [
        '正在整理上周评价记录',
        '正在分析评价详情',
        '正在归纳班级重点',
        '正在生成本周行动建议',
    ];
};

const getDataSourceText = (report: WeeklyActionAdviceReport) => {
    if (report.dataWindowWeeks === 4) return `前两周记录较少 · 根据${report.dataRange}记录生成`;
    if (report.dataWindowWeeks === 2) return `上周记录较少 · 根据${report.dataRange}记录生成`;
    return `根据${report.dataRange}评价记录生成`;
};

const AnalysisProgress: React.FC<{ steps: string[]; visibleStepCount: number }> = ({ steps, visibleStepCount }) => (
    <div className="mx-auto mt-8 min-h-[190px] max-w-[280px]" role="status" aria-live="polite" aria-label="正在生成本周行动建议">
        <div className="space-y-4">
            {steps.slice(0, visibleStepCount).map((step, index) => {
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

interface WeeklyActionAdviceViewProps {
    onBack: () => void;
    onOpenHistory?: () => void;
    report?: WeeklyActionAdviceReport;
    simulateLoading?: boolean;
}

const WeeklyActionAdviceView: React.FC<WeeklyActionAdviceViewProps> = ({
    onBack,
    onOpenHistory,
    report = CURRENT_WEEKLY_ACTION_ADVICE,
    simulateLoading = true,
}) => {
    const [loading, setLoading] = useState(simulateLoading);
    const analysisSteps = useMemo(() => getAnalysisSteps(report.dataWindowWeeks), [report.dataWindowWeeks]);
    const [visibleStepCount, setVisibleStepCount] = useState(simulateLoading ? 1 : analysisSteps.length);
    const sections = useMemo<PresentationSection[]>(() => [
        {
            title: '班级速览',
            icon: Sparkles,
            gradient: 'from-cyan-400 to-blue-500',
            paragraphs: report.content.classOverview,
        },
        {
            title: '学生洞察',
            icon: Users,
            gradient: 'from-teal-400 to-cyan-500',
            paragraphs: report.content.studentInsights.map((insight) => (
                `${insight.studentName}：${insight.content}。${insight.suggestion}${insight.needVerify ? '（建议核实）' : ''}`
            )),
        },
        {
            title: '评价洞察',
            icon: MessageSquare,
            gradient: 'from-violet-400 to-indigo-500',
            paragraphs: report.content.evaluationInsights,
        },
        {
            title: '班级洞察',
            icon: School,
            gradient: 'from-blue-400 to-violet-500',
            paragraphs: report.content.classInsights,
        },
        {
            title: '本周重点行动',
            icon: ListChecks,
            gradient: 'from-cyan-500 to-teal-500',
            paragraphs: report.content.actions,
            variant: 'list',
        },
    ].filter((section) => section.paragraphs.length > 0), [report]);

    useEffect(() => {
        if (!simulateLoading) {
            setLoading(false);
            setVisibleStepCount(analysisSteps.length);
            return;
        }

        setLoading(true);
        setVisibleStepCount(1);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const stepDelay = 720;
        const timers: number[] = [];

        if (reduceMotion) {
            setVisibleStepCount(analysisSteps.length);
        } else {
            analysisSteps.slice(1).forEach((_, index) => {
                timers.push(window.setTimeout(() => setVisibleStepCount(index + 2), (index + 1) * stepDelay));
            });
        }

        timers.push(window.setTimeout(
            () => setLoading(false),
            reduceMotion ? 600 : analysisSteps.length * stepDelay + 360,
        ));

        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [analysisSteps, report.id, simulateLoading]);

    return (
        <div className="relative min-h-full overflow-hidden bg-[linear-gradient(180deg,#F7FCFF_0%,#EEF8FF_42%,#FFFFFF_100%)] font-sans text-slate-950">
            <div className="pointer-events-none absolute -left-24 top-5 h-72 w-72 rounded-full bg-cyan-200/45 blur-3xl" aria-hidden="true" />
            <div className="pointer-events-none absolute -right-28 top-20 h-72 w-72 rounded-full bg-violet-200/40 blur-3xl" aria-hidden="true" />

            <header className="relative z-20 flex h-14 items-center px-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition active:scale-95 active:bg-white/70"
                    aria-label="返回"
                >
                    <ChevronLeft className="h-5 w-5" strokeWidth={2.2} />
                </button>
                <h1 className="pointer-events-none absolute inset-x-14 text-center text-[17px] font-bold text-slate-900">{report.title}</h1>
                {onOpenHistory && (
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
                    <p className="text-[15px] font-bold text-slate-900">{report.className}</p>
                    {!loading && <p className="mt-1 text-[12px] text-slate-500">{getDataSourceText(report)}</p>}
                </section>

                {loading ? (
                    <AnalysisProgress steps={analysisSteps} visibleStepCount={visibleStepCount} />
                ) : (
                    <div className="mt-4 space-y-3">
                        {sections.map((section, index) => (
                            <SectionCard key={section.title} section={section} index={index} />
                        ))}
                    </div>
                )}

                {!loading && (
                    <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">以上内容由AI基于评价记录生成，仅供参考</p>
                )}
            </main>
        </div>
    );
};

export default WeeklyActionAdviceView;
