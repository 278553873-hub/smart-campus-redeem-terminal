import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    AlertTriangle,
    CalendarDays,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import ClassRankingList from '../components/ui/ClassRankingList';
import PillSelectionControl from '../components/ui/PillSelectionControl';
import ReportPeriodCalendar, { periodTypeLabels } from '../components/report/ReportPeriodCalendar';
import {
    TeacherReportDonutChart,
    TeacherReportLineChart,
    type TeacherReportChartColor,
} from '../components/report/TeacherReportChart';
import {
    getMoralEducationCockpitPeriods,
    getMoralEducationCockpitSnapshot,
    type MoralEducationCockpitSnapshot,
    type MoralEducationGradeSummary,
    type MoralEducationPeriodOption,
    type MoralEducationPeriodType,
} from '../services/moralEducationCockpitService';
import { teacherBrandCssVariables } from '../styles/teacherMobileTokens';

interface MoralEducationCockpitViewProps {
    onBack: () => void;
}

type TrendMetric = 'averageScore' | 'deduction';

const reportCardClassName = 'rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-report-card-padding)] [box-shadow:var(--tm-shadow-card)]';

const periodTypeNames: Record<MoralEducationPeriodType, string> = {
    week: '周',
    month: '月',
    term: '学期',
};

const reportPeriodType: MoralEducationPeriodType = 'week';

const trendMetricOptions: Array<{ key: TrendMetric; label: string }> = [
    { key: 'averageScore', label: '平均得分' },
    { key: 'deduction', label: '累计扣分' },
];

const trendMetricConfig: Record<TrendMetric, {
    label: string;
    suffix: string;
    color: TeacherReportChartColor;
}> = {
    averageScore: { label: '平均得分', suffix: '分', color: 'data' },
    deduction: { label: '累计扣分', suffix: '分', color: 'negative' },
};

const indicatorChartColors: TeacherReportChartColor[] = [
    'indicator1',
    'indicator2',
    'indicator3',
    'indicator4',
    'indicator5',
    'indicator6',
];

const roundScore = (value: number) => Math.round(value * 10) / 10;

const SectionHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
    <div className="mb-[var(--tm-report-card-content-gap)] flex min-h-11 items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">{title}</h2>
        {action}
    </div>
);

const GradeTabs = ({
    grades,
    value,
    onChange,
    ariaLabel,
}: {
    grades: MoralEducationGradeSummary[];
    value: string;
    onChange: (gradeId: string) => void;
    ariaLabel: string;
}) => (
    <div className="relative -mx-[var(--tm-report-card-padding)]">
        <PillSelectionControl
            value={value}
            items={[{ value: 'all', label: '全校' }, ...grades.map(grade => ({ value: grade.id, label: grade.name }))]}
            onChange={onChange}
            ariaLabel={ariaLabel}
            semantics="tabs"
            className="pl-[var(--tm-report-card-padding)] pr-[calc(var(--tm-report-card-padding)+var(--tm-space-5))]"
        />
        <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 w-[var(--tm-report-scroll-hint-width)] bg-gradient-to-l from-[var(--tm-bg-surface)] via-[var(--tm-bg-surface)]/90 to-transparent"
        />
    </div>
);

const ReportTextTabs = ({
    items,
    value,
    onChange,
    ariaLabel,
}: {
    items: Array<{ id: string; name: string }>;
    value: string;
    onChange: (id: string) => void;
    ariaLabel: string;
}) => {
    const scrollRef = useRef<HTMLDivElement>(null);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollHint = () => {
        const element = scrollRef.current;
        if (!element) return;
        setCanScrollRight(element.scrollLeft + element.clientWidth < element.scrollWidth - 2);
    };

    useEffect(() => {
        updateScrollHint();
        window.addEventListener('resize', updateScrollHint);
        return () => window.removeEventListener('resize', updateScrollHint);
    }, [items]);

    return (
        <div className="relative -mx-[var(--tm-report-card-padding)]">
            <div
                ref={scrollRef}
                className="overflow-x-auto pl-[var(--tm-report-card-padding)] pr-[calc(var(--tm-report-card-padding)+var(--tm-report-scroll-hint-width))] no-scrollbar"
                role="tablist"
                aria-label={ariaLabel}
                onScroll={updateScrollHint}
            >
                <div className="flex min-w-max gap-6">
                    {items.map(item => {
                        const selected = item.id === value;
                        return (
                            <button
                                key={item.id}
                                type="button"
                                role="tab"
                                aria-selected={selected}
                                onClick={() => onChange(item.id)}
                                className={`relative flex min-h-[var(--tm-size-touch)] shrink-0 items-center text-[15px] font-semibold transition-[color,transform] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] ${selected
                                    ? 'text-[var(--tm-text-primary)]'
                                    : 'text-[var(--tm-text-secondary)]'}`}
                            >
                                {item.name}
                                {selected && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[3px] rounded-full bg-[var(--tm-brand-primary)]" />}
                            </button>
                        );
                    })}
                </div>
            </div>
            {canScrollRight && (
                <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 right-0 flex w-[var(--tm-report-scroll-hint-width)] items-center justify-end bg-gradient-to-l from-[var(--tm-bg-surface)] via-[var(--tm-bg-surface)]/95 to-transparent pr-1 text-[var(--tm-text-secondary)]"
                >
                    <ChevronRight className="h-4 w-4" />
                </span>
            )}
        </div>
    );
};

const ReportSegmentTabs = ({
    items,
    value,
    onChange,
    ariaLabel,
}: {
    items: Array<{ id: string; name: string }>;
    value: string;
    onChange: (id: string) => void;
    ariaLabel: string;
}) => (
    <div className="overflow-x-auto no-scrollbar" role="tablist" aria-label={ariaLabel}>
        <div className="flex min-w-max gap-[var(--tm-space-2)]">
            {items.map(item => {
                const selected = item.id === value;
                return (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onChange(item.id)}
                        className="flex min-h-[var(--tm-size-touch)] shrink-0 items-center transition-transform [transition-duration:var(--tm-duration-fast)] active:scale-[0.96]"
                    >
                        <span className={`flex h-8 items-center px-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] transition-colors [transition-duration:var(--tm-duration-fast)] ${selected
                            ? 'font-bold text-[var(--tm-text-primary)]'
                            : 'font-medium text-[var(--tm-text-secondary)]'}`}>
                            {item.name}
                        </span>
                    </button>
                );
            })}
        </div>
    </div>
);

const getTrendAxisRange = (snapshot: MoralEducationCockpitSnapshot, metric: TrendMetric) => {
    if (metric !== 'averageScore') return {};
    const values = snapshot.trend.map(item => item.averageScore);
    const minimum = Math.floor(Math.min(...values) - 1);
    return { minValue: Math.max(0, minimum), maxValue: snapshot.summary.maxScore };
};

const MoralEducationCockpitView: React.FC<MoralEducationCockpitViewProps> = ({ onBack }) => {
    const [periodOptions, setPeriodOptions] = useState<MoralEducationPeriodOption[]>([]);
    const [selectedPeriodId, setSelectedPeriodId] = useState('');
    const [snapshot, setSnapshot] = useState<MoralEducationCockpitSnapshot | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [trendMetric, setTrendMetric] = useState<TrendMetric>('averageScore');
    const [isPeriodSheetOpen, setIsPeriodSheetOpen] = useState(false);
    const [isRankingSheetOpen, setIsRankingSheetOpen] = useState(false);
    const [rankingGradeId, setRankingGradeId] = useState('all');
    const [problemGradeId, setProblemGradeId] = useState('all');
    const [problemDimensionId, setProblemDimensionId] = useState('');
    const [problemCategoryId, setProblemCategoryId] = useState('');

    useEffect(() => {
        let disposed = false;
        setIsLoading(true);
        setLoadError('');
        getMoralEducationCockpitPeriods(reportPeriodType)
            .then(options => {
                if (disposed) return;
                setPeriodOptions(options);
                setSelectedPeriodId(options[options.length - 1]?.id ?? '');
            })
            .catch(() => {
                if (!disposed) {
                    setLoadError('考核周期加载失败，请稍后重试');
                    setIsLoading(false);
                }
            });
        return () => {
            disposed = true;
        };
    }, [reloadKey]);

    useEffect(() => {
        if (!selectedPeriodId) return undefined;
        let disposed = false;
        setIsLoading(true);
        setLoadError('');
        setSnapshot(null);
        getMoralEducationCockpitSnapshot({ periodType: reportPeriodType, periodId: selectedPeriodId })
            .then(data => {
                if (!disposed) setSnapshot(data);
            })
            .catch(() => {
                if (!disposed) setLoadError('班级评价数据加载失败，请稍后重试');
            })
            .finally(() => {
                if (!disposed) setIsLoading(false);
            });
        return () => {
            disposed = true;
        };
    }, [selectedPeriodId, reloadKey]);

    const selectedPeriodIndex = periodOptions.findIndex(item => item.id === selectedPeriodId);
    const selectedPeriod = periodOptions[selectedPeriodIndex];
    const currentPeriod = periodOptions[periodOptions.length - 1];
    const selectedPeriodLabel = selectedPeriod && currentPeriod && selectedPeriod.id === currentPeriod.id
        ? `本周 ${selectedPeriod.label}`
        : selectedPeriod?.label ?? '';
    const canGoPrevious = selectedPeriodIndex > 0;
    const canGoNext = selectedPeriodIndex >= 0 && selectedPeriodIndex < periodOptions.length - 1;
    const trendConfig = trendMetricConfig[trendMetric];
    const trendAxisRange = snapshot ? getTrendAxisRange(snapshot, trendMetric) : {};
    const averageScoreDelta = useMemo(() => {
        if (!snapshot || snapshot.trend.length < 2) return null;
        const current = snapshot.trend[snapshot.trend.length - 1].averageScore;
        const previous = snapshot.trend[snapshot.trend.length - 2].averageScore;
        return roundScore(current - previous);
    }, [snapshot]);
    const filteredRanking = useMemo(() => {
        if (!snapshot) return [];
        if (rankingGradeId === 'all') return snapshot.classRanking;
        return snapshot.grades.find(grade => grade.id === rankingGradeId)?.classes ?? [];
    }, [rankingGradeId, snapshot]);
    const highestRankedClass = snapshot?.classRanking[0];
    const lowestRankedClass = snapshot?.classRanking[snapshot.classRanking.length - 1];
    const problemGradeReport = useMemo(() => (
        snapshot?.gradeReports.find(report => report.gradeId === problemGradeId)
        ?? snapshot?.gradeReports[0]
    ), [problemGradeId, snapshot]);
    const selectedProblemDimension = useMemo(() => (
        problemGradeReport?.problemDimensions.find(dimension => dimension.id === problemDimensionId)
        ?? problemGradeReport?.problemDimensions[0]
    ), [problemDimensionId, problemGradeReport]);
    const selectedProblemCategory = useMemo(() => (
        selectedProblemDimension?.categories.find(category => category.id === problemCategoryId)
        ?? selectedProblemDimension?.categories[0]
    ), [problemCategoryId, selectedProblemDimension]);

    const changeProblemGrade = (gradeId: string) => {
        setProblemGradeId(gradeId);
        setProblemDimensionId('');
        setProblemCategoryId('');
    };

    const changeProblemDimension = (dimensionId: string) => {
        setProblemDimensionId(dimensionId);
        setProblemCategoryId('');
    };

    const changeProblemDimensionByName = (dimensionName: string) => {
        const dimension = problemGradeReport?.problemDimensions.find(item => item.name === dimensionName);
        if (dimension) changeProblemDimension(dimension.id);
    };

    const changePeriod = (offset: number) => {
        const nextPeriod = periodOptions[selectedPeriodIndex + offset];
        if (nextPeriod) setSelectedPeriodId(nextPeriod.id);
    };

    return (
        <div
            className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)] text-[var(--tm-text-primary)]"
            style={teacherBrandCssVariables as React.CSSProperties}
        >
            <header
                className="relative z-40 flex h-11 shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-4"
                style={{ paddingRight: 'var(--mini-program-capsule-right-inset, 0px)' }}
            >
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="返回"
                    className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-muted)]"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="pointer-events-none absolute inset-0 flex items-center justify-center text-[17px] font-semibold text-[var(--tm-text-primary)]">班级评价报表</h1>
            </header>

            <div className="relative min-h-0 flex-1 overflow-y-auto pb-8 no-scrollbar">
                <div className="sticky -top-px z-30 -mt-px bg-[var(--tm-page-plain-header-bg)] px-[var(--tm-report-page-inline)] pb-3 pt-1 [box-shadow:0_8px_20px_-20px_var(--tm-shadow-neutral-color)]">
                    <div className="grid h-11 grid-cols-[44px_minmax(0,1fr)_44px] items-center">
                        <button
                            type="button"
                            onClick={() => changePeriod(-1)}
                            disabled={!canGoPrevious}
                            aria-label={`上一个${periodTypeNames[reportPeriodType]}`}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] disabled:opacity-30 active:bg-[var(--tm-bg-surface-muted)]"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsPeriodSheetOpen(true)}
                            disabled={periodOptions.length === 0}
                            className="mx-auto flex min-h-11 min-w-0 max-w-full items-center justify-center gap-1.5 px-1 text-[13px] font-semibold tabular-nums text-[var(--tm-text-primary)]"
                        >
                            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--tm-brand-primary)]" />
                            <span className="truncate">{selectedPeriodLabel || '加载中'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => changePeriod(1)}
                            disabled={!canGoNext}
                            aria-label={`下一个${periodTypeNames[reportPeriodType]}`}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] disabled:opacity-30 active:bg-[var(--tm-bg-surface-muted)]"
                        >
                            <ChevronRight className="h-5 w-5" />
                        </button>
                    </div>
                </div>

                <div className="space-y-[var(--tm-report-card-gap)] px-[var(--tm-report-page-inline)] pt-[var(--tm-report-card-gap)]">
                    {isLoading && (
                        <div className="rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-4 py-3 text-center text-[12px] text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-card)]">数据加载中...</div>
                    )}

                    {loadError && !isLoading && (
                        <section className={`${reportCardClassName} text-center`}>
                            <AlertTriangle className="mx-auto h-7 w-7 text-[var(--tm-chart-negative-text)]" />
                            <p className="mt-3 text-[14px] font-medium text-[var(--tm-text-primary)]">{loadError}</p>
                            <button
                                type="button"
                                onClick={() => setReloadKey(value => value + 1)}
                                className="mt-3 min-h-11 px-4 text-[14px] font-semibold text-[var(--tm-brand-primary)]"
                            >
                                重新加载
                            </button>
                        </section>
                    )}

                    {snapshot && !loadError && (
                        <>
                            <section aria-label="班级评价数据概况">
                                <SectionHeader title="数据概况" />
                                <div className="min-h-[var(--tm-report-summary-min-height)] overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-report-summary-border)] bg-[var(--tm-report-summary-surface)]">
                                    <div className="grid grid-cols-2 gap-[var(--tm-report-summary-column-gap)] bg-[var(--tm-report-summary-data-surface)] p-[var(--tm-report-summary-padding)]">
                                        <div className="min-w-0">
                                            <div className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">平均得分</div>
                                            <div className="mt-1.5 flex items-end gap-1">
                                                <strong className="text-[length:var(--tm-report-summary-primary-value-size)] font-bold leading-none tabular-nums text-[var(--tm-report-summary-value-text)]">{snapshot.summary.averageScore}</strong>
                                                <span className="pb-0.5 text-[12px] font-semibold text-[var(--tm-text-secondary)]">分</span>
                                            </div>
                                            {averageScoreDelta !== null && (
                                                <div className="mt-1.5 text-[12px] font-medium tabular-nums text-[var(--tm-report-summary-compare-text)]">
                                                    较上期 {averageScoreDelta > 0 ? '+' : ''}{averageScoreDelta}分
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0 text-right">
                                            <div className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">问题记录</div>
                                            <div className="mt-1.5 flex items-end justify-end gap-1">
                                                <strong className="text-[length:var(--tm-report-summary-secondary-value-size)] font-bold leading-none tabular-nums text-[var(--tm-report-summary-value-text)]">{snapshot.summary.issueCount}</strong>
                                                <span className="pb-0.5 text-[12px] font-semibold text-[var(--tm-text-secondary)]">笔</span>
                                            </div>
                                        </div>
                                    </div>
                                    {highestRankedClass && lowestRankedClass && (
                                        <div className="grid bg-[var(--tm-report-summary-surface)] px-[var(--tm-report-summary-padding)] py-1 text-[12px]">
                                            <div className="grid min-h-[var(--tm-report-summary-class-row-height)] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                                                <span className="font-medium text-[var(--tm-text-secondary)]">最高班级</span>
                                                <strong className="truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{highestRankedClass.name}</strong>
                                                <strong className="text-[14px] font-bold tabular-nums text-[var(--tm-report-summary-value-text)]">{highestRankedClass.score}分</strong>
                                            </div>
                                            <div className="grid min-h-[var(--tm-report-summary-class-row-height)] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-2">
                                                <span className="font-medium text-[var(--tm-text-secondary)]">最低班级</span>
                                                <strong className="truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{lowestRankedClass.name}</strong>
                                                <strong className="text-[14px] font-bold tabular-nums text-[var(--tm-report-summary-value-text)]">{lowestRankedClass.score}分</strong>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </section>

                            <section className={reportCardClassName} aria-labelledby="moral-ranking-title">
                                <SectionHeader title="班级排名" />
                                <GradeTabs
                                    grades={snapshot.grades}
                                    value={rankingGradeId}
                                    onChange={setRankingGradeId}
                                    ariaLabel="班级排名年级筛选"
                                />
                                <div className="mt-2">
                                    <ClassRankingList
                                        items={filteredRanking.slice(0, 5)}
                                        ariaLabel="班级排名前五名"
                                        onViewAll={() => setIsRankingSheetOpen(true)}
                                        actionLabel="查看完整排名"
                                    />
                                </div>
                            </section>

                            <section className={reportCardClassName} aria-label="问题分布">
                                <SectionHeader title="问题分布" />
                                <GradeTabs
                                    grades={snapshot.grades}
                                    value={problemGradeId}
                                    onChange={changeProblemGrade}
                                    ariaLabel="问题分布年级筛选"
                                />
                                {problemGradeReport && selectedProblemDimension && selectedProblemCategory && (
                                    <div className="mt-[var(--tm-space-2)]">
                                        <TeacherReportDonutChart
                                            ariaLabel={problemGradeReport.problemDimensions.map(item => `${item.name}扣${item.deduction}分`).join('，')}
                                            data={problemGradeReport.problemDimensions.map(item => {
                                                const dimensionIndex = problemGradeReport.dimensions.findIndex(dimension => dimension.id === item.id);
                                                return {
                                                    name: item.name,
                                                    value: item.deduction,
                                                    color: indicatorChartColors[dimensionIndex >= 0 ? dimensionIndex % indicatorChartColors.length : 0],
                                                };
                                            })}
                                            optionKey={`${snapshot.period.id}-${problemGradeReport.gradeId}-problem-distribution`}
                                            seriesName="问题分布"
                                            valueSuffix="分"
                                            selectedName={selectedProblemDimension.name}
                                            className="h-64"
                                            onCategorySelect={changeProblemDimensionByName}
                                        />
                                        <ReportTextTabs
                                            items={problemGradeReport.problemDimensions}
                                            value={selectedProblemDimension.id}
                                            onChange={changeProblemDimension}
                                            ariaLabel="问题分布一级指标筛选"
                                        />
                                        <div className="mt-[var(--tm-space-3)]">
                                            <ReportSegmentTabs
                                                items={selectedProblemDimension.categories}
                                                value={selectedProblemCategory.id}
                                                onChange={setProblemCategoryId}
                                                ariaLabel={`${selectedProblemDimension.name}下的二级指标筛选`}
                                            />
                                            <div className="mt-[var(--tm-space-3)]" role="table" aria-label={`${selectedProblemDimension.name}下${selectedProblemCategory.name}三级指标扣分明细`}>
                                                <div className="grid min-h-9 grid-cols-[minmax(0,1fr)_72px_64px] items-center gap-2 text-[11px] text-[var(--tm-text-secondary)]" role="row">
                                                    <span role="columnheader">指标名称</span>
                                                    <span className="text-right" role="columnheader">总扣分</span>
                                                    <span className="text-right" role="columnheader">扣分笔数</span>
                                                </div>
                                                {selectedProblemCategory.details.map(detail => (
                                                    <div
                                                        key={detail.id}
                                                        className="grid min-h-[52px] grid-cols-[minmax(0,1fr)_72px_64px] items-center gap-2 border-t border-[var(--tm-border-subtle)]"
                                                        role="row"
                                                    >
                                                        <span className="min-w-0 text-[14px] font-semibold text-[var(--tm-text-primary)]" role="cell">{detail.name}</span>
                                                        <strong className="text-right text-[14px] font-bold tabular-nums text-[var(--tm-chart-negative-text)]" role="cell">-{detail.deduction}分</strong>
                                                        <span className="text-right text-[13px] font-semibold tabular-nums text-[var(--tm-text-primary)]" role="cell">{detail.recordCount}笔</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </section>

                            <section className={reportCardClassName}>
                                <SectionHeader
                                    title="周期趋势"
                                    action={(
                                        <div className="flex h-9 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1">
                                            {trendMetricOptions.map(option => (
                                                <button
                                                    key={option.key}
                                                    type="button"
                                                    aria-pressed={trendMetric === option.key}
                                                    onClick={() => setTrendMetric(option.key)}
                                                    className={`min-w-[66px] rounded-[var(--tm-radius-control)] px-2 text-[11px] font-semibold ${trendMetric === option.key
                                                        ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]'
                                                        : 'text-[var(--tm-text-secondary)]'}`}
                                                >
                                                    {option.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                />
                                <TeacherReportLineChart
                                    ariaLabel={`${periodTypeNames[reportPeriodType]}度${trendConfig.label}趋势`}
                                    categories={snapshot.trend.map(item => item.label)}
                                    series={[{
                                        name: trendConfig.label,
                                        values: snapshot.trend.map(item => item[trendMetric]),
                                        color: trendConfig.color,
                                    }]}
                                    optionKey={`${snapshot.period.id}-${trendMetric}`}
                                    valueLabelSuffix={trendConfig.suffix}
                                    minValue={trendAxisRange.minValue}
                                    maxValue={trendAxisRange.maxValue}
                                />
                            </section>
                        </>
                    )}
                </div>
            </div>

            <MobileBottomSheet
                open={isPeriodSheetOpen}
                title={`选择${periodTypeLabels[reportPeriodType]}`}
                onClose={() => setIsPeriodSheetOpen(false)}
                headerAction={currentPeriod ? {
                    label: '本周',
                    onClick: () => {
                        setSelectedPeriodId(currentPeriod.id);
                        setIsPeriodSheetOpen(false);
                    },
                } : undefined}
            >
                <ReportPeriodCalendar
                    periods={periodOptions}
                    selectedPeriodId={selectedPeriodId}
                    onSelect={periodId => {
                        setSelectedPeriodId(periodId);
                        setIsPeriodSheetOpen(false);
                    }}
                />
            </MobileBottomSheet>

            <MobileBottomSheet
                open={isRankingSheetOpen}
                title="完整班级排名"
                onClose={() => setIsRankingSheetOpen(false)}
            >
                {snapshot && (
                    <>
                        <GradeTabs
                            grades={snapshot.grades}
                            value={rankingGradeId}
                            onChange={setRankingGradeId}
                            ariaLabel="完整班级排名年级筛选"
                        />
                        <div className="mt-2 pb-2">
                            <ClassRankingList items={filteredRanking} ariaLabel="完整班级排名" />
                        </div>
                    </>
                )}
            </MobileBottomSheet>

        </div>
    );
};

export default MoralEducationCockpitView;
