import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MoralEducationScoreDrilldown from '../components/report/MoralEducationScoreDrilldown';
import {
    TeacherReportBarChart,
    TeacherReportLineChart,
    type TeacherReportChartColor,
} from '../components/report/TeacherReportChart';
import {
    getMoralEducationCockpitPeriods,
    getMoralEducationCockpitSnapshot,
    type MoralEducationClassSummary,
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

const periodTypeOptions: Array<{ key: MoralEducationPeriodType; label: string }> = [
    { key: 'week', label: '按周' },
    { key: 'month', label: '按月' },
    { key: 'term', label: '按学期' },
];

const periodTypeNames: Record<MoralEducationPeriodType, string> = {
    week: '周',
    month: '月',
    term: '学期',
};

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
        <div
            className="overflow-x-auto pl-[var(--tm-report-card-padding)] pr-[calc(var(--tm-report-card-padding)+var(--tm-space-5))] no-scrollbar"
            role="tablist"
            aria-label={ariaLabel}
        >
            <div className="flex min-w-max gap-1.5">
            {[{ id: 'all', name: '全校' }, ...grades].map(grade => {
                const selected = grade.id === value;
                return (
                    <button
                        key={grade.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onChange(grade.id)}
                        className="flex min-h-[var(--tm-size-touch)] shrink-0 items-center transition-transform [transition-duration:var(--tm-duration-fast)] active:scale-[0.96]"
                    >
                        <span className={`flex h-[var(--tm-report-grade-pill-height)] items-center rounded-[var(--tm-radius-control)] px-[var(--tm-report-grade-pill-inline)] text-[length:var(--tm-font-size-compact)] font-semibold transition-[color,background-color,box-shadow] [transition-duration:var(--tm-duration-fast)] ${selected
                            ? 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)]'
                            : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]'}`}>
                            {grade.name}
                        </span>
                    </button>
                );
            })}
            </div>
        </div>
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
}) => (
    <div className="-mx-[var(--tm-report-card-padding)] overflow-x-auto px-[var(--tm-report-card-padding)] no-scrollbar" role="tablist" aria-label={ariaLabel}>
        <div className="flex min-w-max gap-5">
            {items.map(item => {
                const selected = item.id === value;
                return (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onChange(item.id)}
                        className={`relative flex min-h-[var(--tm-size-touch)] shrink-0 items-center text-[length:var(--tm-font-size-compact)] font-semibold transition-colors duration-200 ${selected
                            ? 'text-[var(--tm-text-primary)]'
                            : 'text-[var(--tm-text-secondary)]'}`}
                    >
                        {item.name}
                        {selected && <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-[var(--tm-brand-primary)]" />}
                    </button>
                );
            })}
        </div>
    </div>
);

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
    <div className="-mx-[var(--tm-report-card-padding)] overflow-x-auto px-[var(--tm-report-card-padding)] py-1 no-scrollbar" role="tablist" aria-label={ariaLabel}>
        <div className="flex min-w-max gap-1 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1">
            {items.map(item => {
                const selected = item.id === value;
                return (
                    <button
                        key={item.id}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onChange(item.id)}
                        className="flex min-h-10 shrink-0 items-center transition-transform [transition-duration:var(--tm-duration-fast)] active:scale-[0.96]"
                    >
                        <span className={`flex h-8 items-center rounded-[calc(var(--tm-radius-control)-4px)] px-3 text-[length:var(--tm-font-size-compact)] font-semibold transition-[color,background-color,box-shadow] [transition-duration:var(--tm-duration-fast)] ${selected
                            ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)]'
                            : 'text-[var(--tm-text-secondary)]'}`}>
                            {item.name}
                        </span>
                    </button>
                );
            })}
        </div>
    </div>
);

const rankToneClasses = [
    'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]',
    'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]',
    'bg-[var(--tm-brand-secondary-soft)] text-[var(--tm-brand-secondary-strong)]',
];

const RankingRow = ({ item }: { item: MoralEducationClassSummary }) => (
    <div className="grid min-h-[58px] grid-cols-[32px_minmax(0,1fr)_auto] items-center gap-3 border-b border-[var(--tm-border-subtle)] last:border-b-0">
        <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-bold tabular-nums ${rankToneClasses[item.rank - 1] ?? 'text-[var(--tm-text-disabled)]'}`}>
            {item.rank}
        </span>
        <span className="min-w-0 truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{item.name}</span>
        <span className="text-right">
            <strong className="block text-[15px] font-bold tabular-nums text-[var(--tm-text-primary)]">{item.score}分</strong>
            <span className="mt-0.5 block text-[11px] tabular-nums text-[var(--tm-chart-negative-text)]">扣{item.deduction}分</span>
        </span>
    </div>
);

const getTrendAxisRange = (snapshot: MoralEducationCockpitSnapshot, metric: TrendMetric) => {
    if (metric !== 'averageScore') return {};
    const values = snapshot.trend.map(item => item.averageScore);
    const minimum = Math.floor(Math.min(...values) - 1);
    return { minValue: Math.max(0, minimum), maxValue: snapshot.summary.maxScore };
};

const MoralEducationCockpitView: React.FC<MoralEducationCockpitViewProps> = ({ onBack }) => {
    const [periodType, setPeriodType] = useState<MoralEducationPeriodType>('week');
    const [periodOptions, setPeriodOptions] = useState<MoralEducationPeriodOption[]>([]);
    const [selectedPeriodId, setSelectedPeriodId] = useState('');
    const [snapshot, setSnapshot] = useState<MoralEducationCockpitSnapshot | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [trendMetric, setTrendMetric] = useState<TrendMetric>('averageScore');
    const [isPeriodSheetOpen, setIsPeriodSheetOpen] = useState(false);
    const [isRankingSheetOpen, setIsRankingSheetOpen] = useState(false);
    const [isScoreDrilldownOpen, setIsScoreDrilldownOpen] = useState(false);
    const [scoreDrilldownRootId, setScoreDrilldownRootId] = useState('');
    const [lastScoreRootId, setLastScoreRootId] = useState('');
    const [rankingGradeId, setRankingGradeId] = useState('all');
    const [scoreGradeId, setScoreGradeId] = useState('all');
    const [problemGradeId, setProblemGradeId] = useState('all');
    const [problemDimensionId, setProblemDimensionId] = useState('');
    const [problemCategoryId, setProblemCategoryId] = useState('');

    useEffect(() => {
        let disposed = false;
        setIsLoading(true);
        setLoadError('');
        getMoralEducationCockpitPeriods(periodType)
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
    }, [periodType, reloadKey]);

    useEffect(() => {
        if (!selectedPeriodId) return undefined;
        let disposed = false;
        setIsLoading(true);
        setLoadError('');
        setSnapshot(null);
        getMoralEducationCockpitSnapshot({ periodType, periodId: selectedPeriodId })
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
    }, [periodType, selectedPeriodId, reloadKey]);

    const selectedPeriodIndex = periodOptions.findIndex(item => item.id === selectedPeriodId);
    const selectedPeriod = periodOptions[selectedPeriodIndex];
    const canGoPrevious = selectedPeriodIndex > 0;
    const canGoNext = selectedPeriodIndex >= 0 && selectedPeriodIndex < periodOptions.length - 1;
    const trendConfig = trendMetricConfig[trendMetric];
    const trendAxisRange = snapshot ? getTrendAxisRange(snapshot, trendMetric) : {};
    const filteredRanking = useMemo(() => {
        if (!snapshot) return [];
        if (rankingGradeId === 'all') return snapshot.classRanking;
        return snapshot.grades.find(grade => grade.id === rankingGradeId)?.classes ?? [];
    }, [rankingGradeId, snapshot]);
    const scoreGradeReport = useMemo(() => (
        snapshot?.gradeReports.find(report => report.gradeId === scoreGradeId)
        ?? snapshot?.gradeReports[0]
    ), [scoreGradeId, snapshot]);
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

    const changePeriodType = (nextType: MoralEducationPeriodType) => {
        if (nextType === periodType) return;
        setPeriodType(nextType);
        setPeriodOptions([]);
        setSelectedPeriodId('');
        setSnapshot(null);
        setRankingGradeId('all');
        setScoreGradeId('all');
        setProblemGradeId('all');
        setProblemDimensionId('');
        setProblemCategoryId('');
        setIsPeriodSheetOpen(false);
        setIsScoreDrilldownOpen(false);
        setScoreDrilldownRootId('');
        setLastScoreRootId('');
    };

    const changeProblemGrade = (gradeId: string) => {
        setProblemGradeId(gradeId);
        setProblemDimensionId('');
        setProblemCategoryId('');
    };

    const changeProblemDimension = (dimensionId: string) => {
        setProblemDimensionId(dimensionId);
        setProblemCategoryId('');
    };

    const changePeriod = (offset: number) => {
        const nextPeriod = periodOptions[selectedPeriodIndex + offset];
        if (nextPeriod) setSelectedPeriodId(nextPeriod.id);
    };

    const openScoreDrilldown = (dimensionName?: string) => {
        const selectedRoot = scoreGradeReport?.scoreTree.find(root => root.name === dimensionName)
            ?? scoreGradeReport?.scoreTree.find(root => root.id === lastScoreRootId)
            ?? scoreGradeReport?.scoreTree[0];
        if (!selectedRoot) return;
        setScoreDrilldownRootId(selectedRoot.id);
        setLastScoreRootId(selectedRoot.id);
        setIsScoreDrilldownOpen(true);
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
            </header>

            <div className="relative min-h-0 flex-1 overflow-y-auto pb-8 no-scrollbar">
                <div className="sticky -top-px z-30 -mt-px bg-[var(--tm-page-plain-header-bg)] px-[var(--tm-report-page-inline)] pb-3 pt-1 [box-shadow:0_8px_20px_-20px_var(--tm-shadow-neutral-color)]">
                    <div className="grid h-10 grid-cols-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1" role="group" aria-label="统计周期类型">
                        {periodTypeOptions.map(option => (
                            <button
                                key={option.key}
                                type="button"
                                aria-pressed={periodType === option.key}
                                onClick={() => changePeriodType(option.key)}
                                className={`rounded-[var(--tm-radius-control)] text-[13px] font-semibold transition-[color,background-color,box-shadow] duration-200 ${periodType === option.key
                                    ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]'
                                    : 'text-[var(--tm-text-secondary)]'}`}
                            >
                                {option.label}
                            </button>
                        ))}
                    </div>
                    <div className="mt-1 grid h-11 grid-cols-[44px_minmax(0,1fr)_44px] items-center">
                        <button
                            type="button"
                            onClick={() => changePeriod(-1)}
                            disabled={!canGoPrevious}
                            aria-label={`上一个${periodTypeNames[periodType]}`}
                            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] disabled:opacity-30 active:bg-[var(--tm-bg-surface-muted)]"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsPeriodSheetOpen(true)}
                            disabled={periodOptions.length === 0}
                            className="mx-auto flex min-h-11 min-w-0 max-w-full items-center justify-center gap-2 px-2 text-[14px] font-semibold tabular-nums text-[var(--tm-text-primary)]"
                        >
                            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--tm-brand-primary)]" />
                            <span className="truncate">{selectedPeriod?.label ?? '加载中'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => changePeriod(1)}
                            disabled={!canGoNext}
                            aria-label={`下一个${periodTypeNames[periodType]}`}
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
                            <section className={reportCardClassName} aria-label="班级评价数据概况">
                                <SectionHeader title="数据概况" />
                                <div className="grid grid-cols-[minmax(0,1fr)_96px] gap-4">
                                    <div className="min-w-0">
                                        <div className="text-[12px] font-medium text-[var(--tm-text-secondary)]">平均得分</div>
                                        <div className="mt-2 flex items-end gap-1">
                                            <strong className="text-[40px] font-bold leading-none tabular-nums text-[var(--tm-text-primary)]">{snapshot.summary.averageScore}</strong>
                                            <span className="pb-1 text-[13px] font-semibold text-[var(--tm-text-secondary)]">分</span>
                                        </div>
                                    </div>
                                    <div className="grid grid-rows-2 divide-y divide-[var(--tm-border-subtle)] border-l border-[var(--tm-border-subtle)] pl-4">
                                        <div className="pb-2">
                                            <span className="block text-[11px] text-[var(--tm-text-secondary)]">最高得分</span>
                                            <strong className="mt-1 block text-[18px] font-bold tabular-nums text-[var(--tm-status-positive-strong)]">{snapshot.summary.highestScore}</strong>
                                        </div>
                                        <div className="pt-2">
                                            <span className="block text-[11px] text-[var(--tm-text-secondary)]">最低得分</span>
                                            <strong className="mt-1 block text-[18px] font-bold tabular-nums text-[var(--tm-chart-warning-text)]">{snapshot.summary.lowestScore}</strong>
                                        </div>
                                    </div>
                                </div>
                                <div className="mt-5 grid grid-cols-2 divide-x divide-[var(--tm-border-subtle)] border-t border-[var(--tm-border-subtle)] pt-4">
                                    <div className="pr-4">
                                        <div className="text-[22px] font-bold leading-none tabular-nums text-[var(--tm-chart-negative-text)]">-{snapshot.summary.cumulativeDeduction}分</div>
                                        <div className="mt-2 text-[11px] font-medium text-[var(--tm-text-secondary)]">累计扣分</div>
                                    </div>
                                    <div className="pl-4">
                                        <div className="text-[22px] font-bold leading-none tabular-nums text-[var(--tm-chart-warning-text)]">{snapshot.summary.issueCount}笔</div>
                                        <div className="mt-2 text-[11px] font-medium text-[var(--tm-text-secondary)]">问题记录</div>
                                    </div>
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
                                    {filteredRanking.slice(0, 5).map(classItem => (
                                        <RankingRow key={classItem.id} item={classItem} />
                                    ))}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setIsRankingSheetOpen(true)}
                                    className="mt-3 flex min-h-11 w-full items-center justify-center gap-1 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[13px] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-muted)]"
                                >
                                    查看完整排名
                                    <ChevronRight className="h-4 w-4 text-[var(--tm-text-secondary)]" />
                                </button>
                            </section>

                            <section className={reportCardClassName} aria-label="一级指标得分">
                                <SectionHeader
                                    title="指标得分"
                                    action={(
                                        <button
                                            type="button"
                                            onClick={() => openScoreDrilldown()}
                                            className="-mr-2 flex min-h-11 items-center gap-0.5 px-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] transition-transform [transition-duration:var(--tm-duration-fast)] active:scale-[0.96]"
                                        >
                                            查看明细
                                            <ChevronRight aria-hidden="true" className="h-4 w-4" />
                                        </button>
                                    )}
                                />
                                <GradeTabs
                                    grades={snapshot.grades}
                                    value={scoreGradeId}
                                    onChange={setScoreGradeId}
                                    ariaLabel="指标得分年级筛选"
                                />
                                {scoreGradeReport && (
                                    <TeacherReportBarChart
                                        ariaLabel={scoreGradeReport.dimensions.map(item => `${item.name}${item.averageScore}分`).join('，')}
                                        categories={scoreGradeReport.dimensions.map(item => item.name)}
                                        series={[{
                                            name: '平均得分',
                                            values: scoreGradeReport.dimensions.map(item => item.averageScore),
                                            color: 'data',
                                        }]}
                                        optionKey={`${snapshot.period.id}-${scoreGradeReport.gradeId}-indicator-score`}
                                        categoryColors={scoreGradeReport.dimensions.map((_, index) => indicatorChartColors[index % indicatorChartColors.length])}
                                        showLegend={false}
                                        showValueAxis={false}
                                        valueLabelSuffix="分"
                                        chartTop={28}
                                        className="mt-[var(--tm-space-4)] h-56"
                                        onCategorySelect={openScoreDrilldown}
                                    />
                                )}
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
                                                ariaLabel="问题分布二级指标筛选"
                                            />
                                        </div>
                                        <div className="mt-[var(--tm-space-4)]" role="table" aria-label={`${selectedProblemCategory.name}三级指标扣分明细`}>
                                            <div className="grid min-h-8 grid-cols-[minmax(0,1fr)_72px_64px] items-center gap-2 text-[11px] text-[var(--tm-text-secondary)]" role="row">
                                                <span role="columnheader">三级指标</span>
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
                                    ariaLabel={`${periodTypeNames[periodType]}度${trendConfig.label}趋势`}
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
                title={`选择${periodTypeNames[periodType]}`}
                onClose={() => setIsPeriodSheetOpen(false)}
            >
                <div className="pb-2">
                    {[...periodOptions].reverse().map(period => {
                        const selected = period.id === selectedPeriodId;
                        return (
                            <button
                                key={period.id}
                                type="button"
                                onClick={() => {
                                    setSelectedPeriodId(period.id);
                                    setIsPeriodSheetOpen(false);
                                }}
                                className="flex min-h-[56px] w-full items-center justify-between border-b border-[var(--tm-border-subtle)] text-left last:border-b-0"
                                aria-pressed={selected}
                            >
                                <span className={`text-[14px] tabular-nums ${selected ? 'font-semibold text-[var(--tm-brand-primary)]' : 'font-medium text-[var(--tm-text-primary)]'}`}>{period.label}</span>
                                {selected && <Check className="h-5 w-5 shrink-0 text-[var(--tm-brand-primary)]" />}
                            </button>
                        );
                    })}
                </div>
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
                            {filteredRanking.map(classItem => (
                                <RankingRow key={classItem.id} item={classItem} />
                            ))}
                        </div>
                    </>
                )}
            </MobileBottomSheet>

            <MoralEducationScoreDrilldown
                open={isScoreDrilldownOpen}
                roots={scoreGradeReport?.scoreTree ?? []}
                initialRootId={scoreDrilldownRootId}
                onClose={() => setIsScoreDrilldownOpen(false)}
                onRootChange={setLastScoreRootId}
            />
        </div>
    );
};

export default MoralEducationCockpitView;
