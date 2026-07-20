import React, { useEffect, useMemo, useState } from 'react';
import {
    ChevronLeft,
    ChevronRight,
    Eye,
    FileSearch,
    History,
    ListChecks,
    ScanSearch,
    Tags,
} from 'lucide-react';
import {
    CURRENT_TEACHER_EVALUATION_REVIEW,
    TEACHER_EVALUATION_REVIEW_SAMPLE,
    type TeacherEvaluationReviewInsufficient,
    type TeacherEvaluationReviewPageData,
    type TeacherEvaluationReviewReport,
} from '../data/teacherEvaluationReview';

type IconType = React.ComponentType<{ className?: string; strokeWidth?: number }>;

interface ReviewSection {
    title: string;
    icon: IconType;
    iconClassName: string;
    paragraphs: string[];
    variant?: 'list';
}

const ReviewSectionCard: React.FC<{ section: ReviewSection; index: number }> = ({ section, index }) => {
    const Icon = section.icon;

    return (
        <section
            className="waa-card-enter rounded-[22px] border border-white/90 bg-white/95 px-4 py-4 shadow-[0_18px_42px_-34px_rgba(35,96,145,0.30)] ring-1 ring-slate-100/70"
            style={{ animationDelay: `${index * 80}ms` }}
        >
            <div className="flex items-center gap-2.5">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${section.iconClassName}`}>
                    <Icon className="h-[18px] w-[18px]" strokeWidth={2.1} />
                </span>
                <h2 className="text-[15px] font-bold text-slate-900">{section.title}</h2>
            </div>

            {section.variant === 'list' ? (
                <ol className="mt-3 space-y-2.5">
                    {section.paragraphs.map((paragraph, actionIndex) => (
                        <li key={paragraph} className="flex gap-2.5">
                            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-[11px] font-bold text-cyan-700">{actionIndex + 1}</span>
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

const REVIEW_ANALYSIS_STEPS = [
    '正在整理上月评价记录',
    '正在分析关注对象',
    '正在核对指标与表达',
    '正在生成评价复盘',
];

const ReviewAnalysisProgress: React.FC<{ visibleStepCount: number }> = ({ visibleStepCount }) => (
    <div className="mx-auto mt-8 min-h-[190px] max-w-[280px]" role="status" aria-live="polite" aria-label="正在生成我的评价复盘">
        <div className="space-y-4">
            {REVIEW_ANALYSIS_STEPS.slice(0, visibleStepCount).map((step, index) => {
                const active = index === visibleStepCount - 1;
                return (
                    <div key={step} className="animate-in fade-in slide-in-from-bottom-1 flex items-start gap-3 duration-300">
                        <span className={`mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ${active ? 'animate-pulse bg-[#1E9AAA]' : 'bg-slate-300'}`} aria-hidden="true" />
                        <p className={`text-[13px] leading-5 ${active ? 'text-slate-600' : 'text-slate-400'}`}>{step}</p>
                    </div>
                );
            })}
        </div>
    </div>
);

const getReviewSections = (report: TeacherEvaluationReviewReport): ReviewSection[] => [
    {
        title: '本月评价画像',
        icon: ScanSearch,
        iconClassName: 'bg-cyan-50 text-cyan-700',
        paragraphs: report.content.reviewOverview,
    },
    {
        title: '关注对象',
        icon: Eye,
        iconClassName: 'bg-blue-50 text-blue-700',
        paragraphs: report.content.attentionInsights,
    },
    {
        title: '评价视角',
        icon: FileSearch,
        iconClassName: 'bg-violet-50 text-violet-700',
        paragraphs: report.content.perspectiveInsights,
    },
    {
        title: '指标与表达',
        icon: Tags,
        iconClassName: 'bg-emerald-50 text-emerald-700',
        paragraphs: report.content.indicatorAndExpressionInsights,
    },
    {
        title: '下月记录建议',
        icon: ListChecks,
        iconClassName: 'bg-teal-50 text-teal-700',
        paragraphs: report.content.actions,
        variant: 'list',
    },
].filter((section) => section.paragraphs.length > 0) as ReviewSection[];

const InsufficientReview: React.FC<{
    data: TeacherEvaluationReviewInsufficient;
    onViewSample: () => void;
}> = ({ data, onViewSample }) => {
    const gap = Math.max(0, data.targetRecords - data.overview.records);

    return (
        <div className="mt-5">
            <h2 className="text-center text-[20px] font-bold leading-8 text-slate-900">
                <span className="block">上月记录不足，</span>
                <span className="block">暂时无法生成评价复盘。</span>
            </h2>

            <section className="mt-6 rounded-[22px] border border-white/90 bg-white/95 px-4 py-3 shadow-[0_18px_42px_-34px_rgba(35,96,145,0.30)] ring-1 ring-slate-100/70">
                <h2 className="text-[15px] font-bold text-slate-900">上月记录</h2>
                <div className="mt-1 flex min-h-14 items-center gap-3 py-2.5">
                    <span className="w-[72px] shrink-0 text-[13px] text-slate-600">记录条数</span>
                    <span className="min-w-0 flex-1 text-[15px] font-bold tabular-nums text-slate-900">
                        {data.overview.records}<span className="mx-1 text-[12px] font-medium text-slate-300">/</span>{data.targetRecords}
                    </span>
                    <span className="shrink-0 text-[12px] font-medium text-rose-500">还差{gap}条</span>
                </div>
            </section>

            <p className="mt-5 px-2 text-[13px] leading-6 text-slate-500">本月记录将用于下个月的评价复盘。</p>
            <button
                type="button"
                onClick={onViewSample}
                className="mt-2 flex h-11 w-full items-center justify-between px-2 text-left text-[14px] font-medium text-slate-500 transition active:text-[#1E9AAA]"
                aria-label="查看评价复盘示例"
            >
                <span>查看报告示例</span>
                <ChevronRight className="h-4 w-4 text-slate-300" strokeWidth={2} />
            </button>
        </div>
    );
};

interface TeacherEvaluationReviewViewProps {
    onBack: () => void;
    onOpenHistory?: () => void;
    data?: TeacherEvaluationReviewPageData;
    report?: TeacherEvaluationReviewReport;
    simulateLoading?: boolean;
}

const TeacherEvaluationReviewView: React.FC<TeacherEvaluationReviewViewProps> = ({
    onBack,
    onOpenHistory,
    data,
    report,
    simulateLoading = true,
}) => {
    const pageData = data ?? report ?? CURRENT_TEACHER_EVALUATION_REVIEW;
    const [viewingExample, setViewingExample] = useState(false);
    const activeReport = viewingExample
        ? TEACHER_EVALUATION_REVIEW_SAMPLE
        : pageData.status === 'generated' ? pageData : null;
    const shouldSimulateLoading = Boolean(activeReport && !viewingExample && simulateLoading);
    const [loading, setLoading] = useState(shouldSimulateLoading);
    const [visibleStepCount, setVisibleStepCount] = useState(shouldSimulateLoading ? 1 : REVIEW_ANALYSIS_STEPS.length);
    const sections = useMemo(() => activeReport ? getReviewSections(activeReport) : [], [activeReport]);

    useEffect(() => {
        if (!shouldSimulateLoading) {
            setLoading(false);
            setVisibleStepCount(REVIEW_ANALYSIS_STEPS.length);
            return;
        }

        setLoading(true);
        setVisibleStepCount(1);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const stepDelay = 720;
        const timers: number[] = [];

        if (reduceMotion) {
            setVisibleStepCount(REVIEW_ANALYSIS_STEPS.length);
        } else {
            REVIEW_ANALYSIS_STEPS.slice(1).forEach((_, index) => {
                timers.push(window.setTimeout(() => setVisibleStepCount(index + 2), (index + 1) * stepDelay));
            });
        }

        timers.push(window.setTimeout(
            () => setLoading(false),
            reduceMotion ? 600 : REVIEW_ANALYSIS_STEPS.length * stepDelay + 360,
        ));

        return () => timers.forEach((timer) => window.clearTimeout(timer));
    }, [pageData.id, shouldSimulateLoading]);

    const title = viewingExample ? TEACHER_EVALUATION_REVIEW_SAMPLE.title : pageData.title;
    const className = viewingExample ? TEACHER_EVALUATION_REVIEW_SAMPLE.className : pageData.className;
    const dataRange = viewingExample ? TEACHER_EVALUATION_REVIEW_SAMPLE.dataRange : pageData.dataRange;
    const showHeaderTitle = title !== '我的评价复盘';

    return (
        <div className="relative min-h-full overflow-hidden bg-[linear-gradient(180deg,#F7FCFF_0%,#F1F8FC_42%,#FFFFFF_100%)] font-sans text-slate-950">
            <header className="relative z-20 flex h-14 items-center px-4">
                <button
                    type="button"
                    onClick={viewingExample ? () => setViewingExample(false) : onBack}
                    className="flex h-11 w-11 items-center justify-center rounded-full text-slate-600 transition active:scale-95 active:bg-white/70"
                    aria-label={viewingExample ? '返回我的评价复盘' : '返回'}
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
                        aria-label="查看往期评价复盘"
                        title="查看往期评价复盘"
                    >
                        <History className="h-5 w-5" strokeWidth={2.2} />
                    </button>
                )}
            </header>

            <main className="relative z-10 px-5 pb-10 pt-1">
                <section className="pb-1 text-center">
                    <p className="text-[15px] font-bold text-slate-900">{className}</p>
                    {!loading && activeReport && (
                        <p className="mt-1 text-[12px] text-slate-500">
                            {viewingExample ? '示例内容 · ' : ''}根据你在{dataRange}的评价记录生成
                        </p>
                    )}
                </section>

                {activeReport ? (
                    loading ? (
                        <ReviewAnalysisProgress visibleStepCount={visibleStepCount} />
                    ) : (
                        <div className="mt-4 space-y-3">
                            {sections.map((section, index) => (
                                <ReviewSectionCard key={section.title} section={section} index={index} />
                            ))}
                        </div>
                    )
                ) : (
                    <InsufficientReview
                        data={pageData as TeacherEvaluationReviewInsufficient}
                        onViewSample={() => setViewingExample(true)}
                    />
                )}

                {!loading && activeReport && (
                    <p className="mt-4 text-center text-[11px] leading-relaxed text-slate-400">
                        {viewingExample ? '示例内容，仅用于展示报告结构' : '以上内容由AI基于你的评价记录生成，仅供参考'}
                    </p>
                )}
            </main>
        </div>
    );
};

export default TeacherEvaluationReviewView;
