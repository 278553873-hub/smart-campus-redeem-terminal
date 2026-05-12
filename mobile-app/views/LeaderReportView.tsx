import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { EChartsCoreOption, EChartsType } from 'echarts/core';
import {
    ChevronLeft,
    ClipboardList,
    Trophy,
    UserCheck,
    Users,
    X,
} from 'lucide-react';

import { phoneShadow } from '../styles/phoneTokens';
import {
    getLeaderReportSnapshot,
    leaderReportPeriods,
    rate,
    type LeaderReportClassCoverage,
    type LeaderReportGradeCoverage,
    type LeaderReportFiveEducationStat,
    type LeaderReportIndicatorGroupUsage,
    type LeaderReportIndicatorSecondUsage,
    type LeaderReportIndicatorThirdUsage,
    type LeaderReportPeriod,
    type LeaderReportSnapshot,
    type LeaderReportTeacherScoreSummary,
    type LeaderReportTeacherUsage,
} from '../services/leaderReportService';

type RankingType = 'active' | 'low';
type ReportTab = 'teacher' | 'event';
type ScoreRankingSort = 'net' | 'plus' | 'minus';
type EventDistributionMetric = 'positive' | 'negative' | 'total';
type FiveEducationChartValueKey = 'plusScore' | 'minusScore' | 'netScore' | 'score' | 'eventCount';
type IndicatorUsageLevel = 'second' | 'third';
type IndicatorUsageSort = 'asc' | 'desc';
type IndicatorGroupFilter = LeaderReportFiveEducationStat['key'];

interface LeaderReportViewProps {
    onBack: () => void;
}

const getCoverageTone = (percent: number) => {
    if (percent >= 80) return { bar: 'bg-emerald-500', text: 'text-emerald-600', soft: 'bg-emerald-50 border-emerald-100' };
    if (percent >= 60) return { bar: 'bg-blue-500', text: 'text-blue-600', soft: 'bg-blue-50 border-blue-100' };
    if (percent >= 40) return { bar: 'bg-amber-500', text: 'text-amber-600', soft: 'bg-amber-50 border-amber-100' };
    return { bar: 'bg-rose-500', text: 'text-rose-600', soft: 'bg-rose-50 border-rose-100' };
};

const useAnimatedNumber = (targetValue: number, duration = 650, replayKey?: string) => {
    const target = Number.isFinite(targetValue) ? targetValue : 0;
    const [displayedNumber, setDisplayedNumber] = useState(0);

    useEffect(() => {
        let frameId = 0;
        let startTime: number | null = null;

        const step = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            setDisplayedNumber(Math.round(target * easedProgress));

            if (progress < 1) {
                frameId = requestAnimationFrame(step);
            }
        };

        setDisplayedNumber(0);
        frameId = requestAnimationFrame(step);

        return () => cancelAnimationFrame(frameId);
    }, [duration, replayKey, target]);

    return displayedNumber;
};

const useAnimatedProgress = (replayKey: string, duration = 650) => {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        let frameId = 0;
        let startTime: number | null = null;

        const step = (timestamp: number) => {
            if (startTime === null) startTime = timestamp;
            const rawProgress = Math.min((timestamp - startTime) / duration, 1);
            const easedProgress = 1 - Math.pow(1 - rawProgress, 3);
            setProgress(easedProgress);

            if (rawProgress < 1) {
                frameId = requestAnimationFrame(step);
            }
        };

        setProgress(0);
        frameId = requestAnimationFrame(step);

        return () => cancelAnimationFrame(frameId);
    }, [duration, replayKey]);

    return progress;
};

const useAnimatedPercent = (targetPercent: number, duration = 650, replayKey?: string) => (
    useAnimatedNumber(Math.max(0, Math.min(100, targetPercent)), duration, replayKey)
);

const AnimatedNumber = ({ value, replayKey }: { value: number; replayKey?: string }) => (
    <>{useAnimatedNumber(value, 650, replayKey)}</>
);

const AnimatedFraction = ({ fraction, replayKey }: { fraction: string; replayKey?: string }) => {
    const [numerator, denominator] = fraction.split('/').map(part => part.trim());
    return (
        <>
            <AnimatedNumber value={Number(numerator)} replayKey={replayKey} /> / {denominator}
        </>
    );
};

const MetricUnit = ({
    label,
    percent,
    fraction,
    value,
    icon: Icon,
    tone,
    animationKey,
}: {
    label: string;
    percent?: number;
    fraction?: string;
    value?: string;
    icon: React.ElementType;
    tone: 'teal' | 'blue' | 'amber';
    animationKey?: string;
}) => {
    const theme = {
        teal: { icon: 'bg-emerald-50 text-emerald-600', bar: 'bg-emerald-500' },
        blue: { icon: 'bg-blue-50 text-blue-600', bar: 'bg-blue-500' },
        amber: { icon: 'bg-amber-50 text-amber-600', bar: 'bg-amber-500' },
    }[tone];
    const showProgress = percent !== undefined;
    const safePercent = Math.max(0, Math.min(100, percent ?? 0));
    const displayedPercent = useAnimatedPercent(safePercent, 650, animationKey);
    const numberReplayKey = showProgress ? animationKey : `${animationKey ?? label}-value`;

    return (
        <div className="min-w-0 rounded-2xl bg-slate-50/90 p-3.5">
            <div className="flex items-center justify-between gap-2">
                <div className="truncate text-xs font-medium text-slate-500">{label}</div>
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${theme.icon}`}>
                    <Icon className="h-4 w-4" />
                </div>
            </div>
            <div className="mt-3">
                <div className="flex items-end justify-between gap-2">
                    <div className="text-3xl font-bold leading-none tracking-normal text-slate-950">
                        {showProgress ? `${displayedPercent}%` : <AnimatedNumber value={Number(value ?? 0)} replayKey={numberReplayKey} />}
                    </div>
                    {fraction && (
                        <div className="pb-0.5 text-right text-xs font-semibold text-slate-500">
                            <AnimatedFraction fraction={fraction} replayKey={`${animationKey ?? label}-fraction`} />
                        </div>
                    )}
                </div>
                {showProgress && (
                    <div className="mt-3 h-2.5 overflow-hidden rounded-full bg-white ring-1 ring-slate-100" aria-label={`${label}进度${displayedPercent}%`}>
                        <div className={`h-full rounded-full ${theme.bar}`} style={{ width: `${displayedPercent}%` }} />
                    </div>
                )}
            </div>
        </div>
    );
};

const OverviewCard = ({ snapshot, animationKey }: { snapshot: LeaderReportSnapshot | null; animationKey: string }) => (
    <section className={`rounded-3xl bg-white p-4 ${phoneShadow.raised} border border-white/80`}>
        <h2 className="text-[17px] font-semibold text-slate-900">数据总览</h2>
        <div className="mt-3 grid grid-cols-1 gap-3">
            <div className="grid grid-cols-2 gap-3">
                <MetricUnit label="使用教师" percent={snapshot?.summary.teacherPercent ?? 0} fraction={`${snapshot?.summary.activeTeachers ?? 0} / ${snapshot?.summary.totalTeachers ?? 0}`} icon={UserCheck} tone="teal" animationKey={`${animationKey}-teacher`} />
                <MetricUnit label="覆盖学生" percent={snapshot?.summary.studentPercent ?? 0} fraction={`${snapshot?.summary.totalCoveredStudents ?? 0} / ${snapshot?.summary.totalStudents ?? 0}`} icon={Users} tone="amber" animationKey={`${animationKey}-student`} />
            </div>
            <MetricUnit label="评价次数" value={`${snapshot?.summary.totalRecords ?? 0}`} icon={ClipboardList} tone="blue" animationKey={`${animationKey}-records`} />
        </div>
    </section>
);

interface TeacherRowProps {
    teacher: LeaderReportTeacherUsage;
    rank?: number;
    showAward?: boolean;
}

const teacherUsageHeaderColumns = ['老师', '评价次数', '覆盖学生'] as const;

const TeacherUsageRankingHeader = () => (
    <div className="mb-2 grid grid-cols-[minmax(0,1.15fr)_56px_64px] gap-2 px-3 text-[11px] font-semibold text-slate-400">
        {teacherUsageHeaderColumns.map((label, index) => (
            <span key={label} className={index === 0 ? undefined : 'text-right'}>{label}</span>
        ))}
    </div>
);

const awardStyles = [
    'bg-amber-400 text-white shadow-amber-200',
    'bg-slate-300 text-white shadow-slate-200',
    'bg-orange-400 text-white shadow-orange-200',
];

const TeacherRankBadge = ({ rank }: { rank?: number }) => {
    if (!rank || rank > 3) return null;

    return (
        <span className={`inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full shadow-sm ${awardStyles[rank - 1]}`} aria-label={`第${rank}名`}>
            <Trophy className="h-3 w-3" />
        </span>
    );
};

const TeacherRow: React.FC<TeacherRowProps> = ({
    teacher,
    rank,
    showAward,
}) => (
    <div className="grid min-h-[48px] grid-cols-[minmax(0,1.15fr)_56px_64px] items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/90 px-3 py-2.5 text-xs">
        <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[15px] font-medium text-slate-900">{teacher.name}</span>
            {showAward && <TeacherRankBadge rank={rank} />}
        </div>
        <div className="text-right font-semibold text-slate-700">{teacher.records}</div>
        <div className="text-right font-semibold text-slate-700">{teacher.coveredStudents}</div>
    </div>
);

const FullTeacherRow: React.FC<TeacherRowProps> = ({ teacher, rank, showAward }) => (
    <div className="grid min-h-[48px] grid-cols-[minmax(0,1.15fr)_56px_64px_72px] items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/90 px-3 py-2.5 text-xs">
        <div className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-[15px] font-medium text-slate-900">{teacher.name}</span>
            {showAward && <TeacherRankBadge rank={rank} />}
        </div>
        <div className="text-right font-semibold text-slate-700">{teacher.records}</div>
        <div className="text-right font-semibold text-slate-700">{teacher.coveredStudents}</div>
        <div className="truncate text-right text-slate-500">{teacher.lastUsedAt}</div>
    </div>
);

const scoreSortTabs: { key: ScoreRankingSort; label: string }[] = [
    { key: 'plus', label: '加分' },
    { key: 'minus', label: '减分' },
    { key: 'net', label: '净赋分' },
];

const fiveEducationScoreTabs: { key: ScoreRankingSort; label: string }[] = [
    { key: 'plus', label: '加分' },
    { key: 'minus', label: '减分' },
    { key: 'net', label: '净得分' },
];

const eventDistributionTabs: { key: EventDistributionMetric; label: string }[] = [
    { key: 'positive', label: '正向' },
    { key: 'negative', label: '负向' },
    { key: 'total', label: '合计' },
];

const eventDistributionMetricLabelMap: Record<EventDistributionMetric, string> = {
    positive: '正向事件',
    negative: '负向事件',
    total: '合计事件',
};

const indicatorGroupTabs: { key: IndicatorGroupFilter; label: string }[] = [
    { key: 'virtue', label: '明礼' },
    { key: 'wisdom', label: '求知' },
    { key: 'fitness', label: '健体' },
    { key: 'aesthetic', label: '尚美' },
    { key: 'labor', label: '劳行' },
];

const indicatorLevelTabs: { key: IndicatorUsageLevel; label: string }[] = [
    { key: 'second', label: '二级指标' },
    { key: 'third', label: '三级指标' },
];

const indicatorSortTabs: { key: IndicatorUsageSort; label: string }[] = [
    { key: 'asc', label: '低到高' },
    { key: 'desc', label: '高到低' },
];

const fiveEducationScoreValueKeyMap: Record<ScoreRankingSort, FiveEducationChartValueKey> = {
    plus: 'plusScore',
    minus: 'minusScore',
    net: 'netScore',
};

const fiveEducationScoreYAxisNameMap: Record<ScoreRankingSort, string> = {
    plus: '加分',
    minus: '减分',
    net: '净得分',
};

const formatPlusScore = (value: number) => `+${value}`;
const formatMinusScore = (value: number) => value === 0 ? '0' : `-${value}`;
const formatNetScore = (value: number) => value > 0 ? `+${value}` : `${value}`;
const netScoreTone = (value: number) => value > 0 ? 'text-emerald-600' : value < 0 ? 'text-rose-600' : 'text-slate-500';

const getIndicatorCount = (item: LeaderReportIndicatorThirdUsage, period: LeaderReportPeriod) => {
    if (period === 'today') return Math.round(item.weekCount * 0.18);
    if (period === 'week') return item.weekCount;
    if (period === 'month') return item.monthCount;
    return item.termCount;
};

const countIndicatorChildren = (groups: LeaderReportIndicatorGroupUsage[]) => groups.reduce((sum, group) => (
    sum + group.children.reduce((secondSum, second) => secondSum + second.children.length, 0)
), 0);

const getIndicatorUsageSummary = (groups: LeaderReportIndicatorGroupUsage[], period: LeaderReportPeriod) => {
    const counters = { total: 0, covered: 0, uncovered: 0 };
    groups.forEach(group => {
        group.children.forEach(second => {
            second.children.forEach(third => {
                const covered = getIndicatorCount(third, period) > 0;
                counters.total += 1;
                counters[covered ? 'covered' : 'uncovered'] += 1;
            });
        });
    });
    return {
        ...counters,
        coverageRate: counters.total > 0 ? Math.round((counters.covered / counters.total) * 100) : 0,
    };
};

const getIndicatorSecondUsageSummary = (groups: LeaderReportIndicatorGroupUsage[], period: LeaderReportPeriod) => {
    const counters = { total: 0, covered: 0, uncovered: 0 };
    groups.forEach(group => {
        group.children.forEach(second => {
            const covered = second.children.some(third => getIndicatorCount(third, period) > 0);
            counters.total += 1;
            counters[covered ? 'covered' : 'uncovered'] += 1;
        });
    });
    return {
        ...counters,
        coverageRate: counters.total > 0 ? Math.round((counters.covered / counters.total) * 100) : 0,
    };
};

interface IndicatorUsageListItem {
    id: string;
    name: string;
    path: string;
    count: number;
    coverage?: string;
}

const getIndicatorUsageItems = (
    groups: LeaderReportIndicatorGroupUsage[],
    period: LeaderReportPeriod,
    level: IndicatorUsageLevel,
    sort: IndicatorUsageSort,
    groupFilter: IndicatorGroupFilter,
): IndicatorUsageListItem[] => {
    const filteredGroups = groups.filter(group => group.id === groupFilter);
    const items = filteredGroups.flatMap(group => group.children.flatMap(second => {
        if (level === 'second') {
            const count = second.children.reduce((sum, child) => sum + getIndicatorCount(child, period), 0);
            const coveredChildren = second.children.filter(child => getIndicatorCount(child, period) > 0).length;
            return [{
                id: second.id,
                name: second.name,
                path: `${group.name}-${second.name}`,
                count,
            }];
        }

        return second.children.map(third => ({
            id: third.id,
            name: third.name,
            path: `${group.name}-${second.name}-${third.name}`,
            count: getIndicatorCount(third, period),
        }));
    }));

    return items.sort((a, b) => {
        const countDiff = sort === 'asc' ? a.count - b.count : b.count - a.count;
        if (countDiff !== 0) return countDiff;
        return a.path.localeCompare(b.path, 'zh-Hans-CN') || a.name.localeCompare(b.name, 'zh-Hans-CN');
    });
};

const IndicatorUsageRow = ({ item }: { item: IndicatorUsageListItem }) => (
    <div className="flex min-h-[44px] items-center justify-between gap-3 rounded-2xl bg-slate-50/90 px-3 py-2">
        <div className="min-w-0 truncate text-[15px] font-semibold text-slate-900">{item.path}</div>
        <div className={`w-14 shrink-0 text-right text-xl font-black tabular-nums ${item.count > 0 ? 'text-slate-950' : 'text-slate-300'}`}>{item.count}</div>
    </div>
);

const getSortedTeacherScores = (items: LeaderReportTeacherScoreSummary[], sort: ScoreRankingSort) => {
    const sortValue = (item: LeaderReportTeacherScoreSummary) => {
        if (sort === 'plus') return item.plusScore;
        if (sort === 'minus') return item.minusScore;
        return item.netScore;
    };

    return [...items].sort((a, b) => sortValue(b) - sortValue(a) || b.plusScore - a.plusScore || a.teacherName.localeCompare(b.teacherName, 'zh-Hans-CN'));
};

const SegmentedTabs = <T extends string>({
    value,
    onChange,
    tabs,
}: {
    value: T;
    onChange: (value: T) => void;
    tabs: { key: T; label: string }[];
}) => (
    <div className="flex rounded-2xl bg-slate-100 p-1">
        {tabs.map(tab => (
            <button
                key={tab.key}
                type="button"
                onClick={() => onChange(tab.key)}
                className={`min-h-[34px] rounded-xl px-3 text-sm font-semibold transition-all ${value === tab.key ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
            >
                {tab.label}
            </button>
        ))}
    </div>
);

const ScoreSortTabs = ({
    value,
    onChange,
    tabs = scoreSortTabs,
}: {
    value: ScoreRankingSort;
    onChange: (value: ScoreRankingSort) => void;
    tabs?: { key: ScoreRankingSort; label: string }[];
}) => <SegmentedTabs value={value} onChange={onChange} tabs={tabs} />;

const EventDistributionTabs = ({
    value,
    onChange,
}: {
    value: EventDistributionMetric;
    onChange: (value: EventDistributionMetric) => void;
}) => <SegmentedTabs value={value} onChange={onChange} tabs={eventDistributionTabs} />;

const TeacherScoreRow: React.FC<{ item: LeaderReportTeacherScoreSummary }> = ({ item }) => (
    <div className="grid min-h-[44px] grid-cols-[minmax(0,1.1fr)_56px_56px_64px] items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50/90 px-3 py-2.5 text-xs">
        <div className="truncate text-[15px] font-medium text-slate-900">{item.teacherName}</div>
        <div className="text-right font-semibold text-emerald-600">{formatPlusScore(item.plusScore)}</div>
        <div className="text-right font-semibold text-rose-500">{formatMinusScore(item.minusScore)}</div>
        <div className={`text-right font-bold ${netScoreTone(item.netScore)}`}>{formatNetScore(item.netScore)}</div>
    </div>
);

const TeacherScoreRankingCard = ({
    items,
    sort,
    onSortChange,
    onViewAll,
}: {
    items: LeaderReportTeacherScoreSummary[];
    sort: ScoreRankingSort;
    onSortChange: (value: ScoreRankingSort) => void;
    onViewAll: () => void;
}) => {
    const visibleItems = getSortedTeacherScores(items, sort).slice(0, 10);

    return (
        <section className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
                <h2 className="text-[17px] font-semibold text-slate-900">教师赋分排行榜</h2>
                <button className="shrink-0 text-xs font-medium text-emerald-600 active:opacity-70" onClick={onViewAll}>查看全部</button>
            </div>
            <div className="mb-3 flex items-center justify-between gap-3">
                <ScoreSortTabs value={sort} onChange={onSortChange} />
            </div>
            <div className="mb-2 grid grid-cols-[minmax(0,1.1fr)_56px_56px_64px] gap-2 px-3 text-[11px] font-semibold text-slate-400">
                <span>老师</span>
                <span className="text-right">加分</span>
                <span className="text-right">减分</span>
                <span className="text-right">净赋分</span>
            </div>
            <div className="space-y-2.5">
                {visibleItems.map(item => <TeacherScoreRow key={item.teacherId} item={item} />)}
            </div>
        </section>
    );
};

type EChartsRuntime = typeof import('echarts/core');

let reportChartsRuntimePromise: Promise<EChartsRuntime> | null = null;

const loadReportChartsRuntime = async () => {
    if (!reportChartsRuntimePromise) {
        reportChartsRuntimePromise = Promise.all([
            import('echarts/core'),
            import('echarts/charts'),
            import('echarts/components'),
            import('echarts/renderers'),
        ]).then(([echartsCore, charts, components, renderers]) => {
            echartsCore.use([
                charts.BarChart,
                charts.PieChart,
                components.GridComponent,
                components.TooltipComponent,
                renderers.CanvasRenderer,
            ]);
            return echartsCore;
        });
    }

    return reportChartsRuntimePromise;
};

const gradeChartColors = {
    strong: '#10b981',
    normal: '#3b82f6',
    warning: '#f59e0b',
    danger: '#f43f5e',
    muted: '#cbd5e1',
} as const;

const getDefaultCoverageGradeId = (grades: LeaderReportGradeCoverage[]) => {
    if (!grades.length) return null;
    return grades[0].id;
};

const getCoverageHex = (percent: number) => {
    if (percent >= 80) return gradeChartColors.strong;
    if (percent >= 60) return gradeChartColors.normal;
    if (percent >= 40) return gradeChartColors.warning;
    return gradeChartColors.danger;
};

const fiveEducationColors: Record<LeaderReportFiveEducationStat['key'], string> = {
    virtue: '#4ade20',
    wisdom: '#2594f2',
    fitness: '#ff4f1f',
    aesthetic: '#14b8a6',
    labor: '#7c3aed',
};

const toZeroBarDatum = (datum: unknown) => {
    if (typeof datum === 'number') return 0;
    if (datum && typeof datum === 'object' && 'value' in datum) {
        return { ...datum, value: 0 };
    }
    return datum;
};

const buildZeroStartBarOption = (option: EChartsCoreOption): EChartsCoreOption => ({
    ...option,
    animationDuration: 0,
    animationDurationUpdate: 0,
    series: Array.isArray(option.series)
        ? option.series.map(series => (
            series && typeof series === 'object' && 'type' in series && series.type === 'bar' && Array.isArray(series.data)
                ? { ...series, data: series.data.map(toZeroBarDatum) }
                : series
        ))
        : option.series,
});

const animateBarChartFromZero = (
    chart: EChartsType,
    option: EChartsCoreOption,
    afterAnimationStart?: () => void,
) => {
    chart.setOption(buildZeroStartBarOption(option), true);
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            chart.setOption(option, false);
            afterAnimationStart?.();
        });
    });
};

const setBarChartOptionWithReplay = (
    chart: EChartsType,
    option: EChartsCoreOption,
    animationKey: string,
    lastAnimationKeyRef: React.MutableRefObject<string | null>,
    afterAnimationStart?: () => void,
) => {
    if (lastAnimationKeyRef.current !== animationKey) {
        lastAnimationKeyRef.current = animationKey;
        animateBarChartFromZero(chart, option, afterAnimationStart);
        return;
    }

    chart.setOption(option, false);
    afterAnimationStart?.();
};

const FiveEducationBarChart = ({
    title,
    yAxisName,
    valueKey,
    data,
    toolbar,
    animationKey,
}: {
    title: string;
    yAxisName: string;
    valueKey: FiveEducationChartValueKey;
    data: LeaderReportFiveEducationStat[];
    toolbar?: React.ReactNode;
    animationKey: string;
}) => {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const chartInstanceRef = useRef<EChartsType | null>(null);
    const chartCoreRef = useRef<typeof import('echarts/core') | null>(null);
    const lastAnimationKeyRef = useRef<string | null>(null);
    const [chartReady, setChartReady] = useState(false);

    useEffect(() => {
        if (!chartRef.current) return;

        let disposed = false;
        let resizeObserver: ResizeObserver | null = null;

        const loadChart = async () => {
            const echartsCore = await loadReportChartsRuntime();
            if (disposed || !chartRef.current) return;

            const chart = echartsCore.init(chartRef.current, undefined, { renderer: 'canvas' });
            chartCoreRef.current = echartsCore;
            chartInstanceRef.current = chart;
            setChartReady(true);

            const handleResize = () => chart.resize();
            resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(chartRef.current);
            requestAnimationFrame(handleResize);
        };

        loadChart();

        return () => {
            disposed = true;
            resizeObserver?.disconnect();
            chartInstanceRef.current?.dispose();
            chartInstanceRef.current = null;
            chartCoreRef.current = null;
        };
    }, []);

    useEffect(() => {
        const chart = chartInstanceRef.current;
        const echartsCore = chartCoreRef.current;
        if (!chart || !echartsCore) return;

        const getChartValue = (item: LeaderReportFiveEducationStat) => {
            const value = item[valueKey];
            if (valueKey === 'minusScore') return value === 0 ? 0 : -Math.abs(value);
            return value;
        };
        const values = data.map(getChartValue);
        const allowsNegativeValue = valueKey === 'score' || valueKey === 'netScore' || valueKey === 'minusScore';
        const minValue = Math.min(0, ...values);
        const maxValue = Math.max(0, ...values);
        const axisStep = 10;
        const paddedMinValue = minValue < 0 ? minValue - axisStep : minValue;
        const axisMin = allowsNegativeValue
            ? Math.floor(paddedMinValue / axisStep) * axisStep
            : 0;
        const axisMax = allowsNegativeValue
            ? (maxValue === 0 && minValue < 0 ? 0 : Math.max(axisStep, Math.ceil(maxValue / axisStep) * axisStep))
            : undefined;
        const formatDisplayValue = (value: number | undefined) => {
            if (typeof value !== 'number') return '';
            return `${value}`;
        };
        const option: EChartsCoreOption = {
            backgroundColor: 'transparent',
            animationDuration: 650,
            animationEasing: 'cubicOut',
            animationDurationUpdate: 650,
            animationEasingUpdate: 'cubicOut',
            grid: { left: 34, right: 10, top: 36, bottom: 36, containLabel: false },
            tooltip: { show: false },
            xAxis: {
                type: 'category',
                position: 'bottom',
                data: data.map(item => item.name),
                axisLine: { show: false, onZero: false },
                axisTick: { show: false },
                axisLabel: { color: '#6b7280', fontSize: 11, fontWeight: 700, interval: 0, margin: 10, hideOverlap: false },
            },
            yAxis: {
                type: 'value',
                name: yAxisName,
                min: axisMin,
                max: axisMax,
                nameTextStyle: { color: '#6b7280', fontSize: 11, fontWeight: 700, align: 'left' },
                axisLabel: { color: '#6b7280', fontSize: 10 },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { lineStyle: { color: '#e2e8f0', type: 'solid' } },
            },
            series: [
                {
                    type: 'bar',
                    data: data.map(item => {
                        const color = fiveEducationColors[item.key];
                        const value = getChartValue(item);
                        return {
                            value,
                            label: {
                                show: true,
                                position: value < 0 ? 'bottom' : 'top',
                                formatter: (params: { value?: number }) => formatDisplayValue(params.value),
                                color: value < 0 ? '#ef4444' : '#334155',
                                fontSize: 12,
                                fontWeight: 800,
                                valueAnimation: true,
                                precision: 0,
                                distance: 6,
                            },
                            itemStyle: {
                                color: new echartsCore.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color },
                                    { offset: 1, color: `${color}d9` },
                                ]),
                                borderRadius: value >= 0 ? [6, 6, 0, 0] : [0, 0, 6, 6],
                            },
                        };
                    }),
                    barWidth: 26,
                    silent: true,
                    emphasis: { disabled: true },
                },
            ],
        };

        setBarChartOptionWithReplay(chart, option, animationKey, lastAnimationKeyRef);
    }, [animationKey, chartReady, data, valueKey, yAxisName]);

    return (
        <div className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm">
            <h2 className="text-[17px] font-semibold text-slate-900">{title}</h2>
            {toolbar && (
                <div className="mt-3 flex items-center">
                    {toolbar}
                </div>
            )}
            <div className="mt-3 rounded-3xl bg-slate-50/90 px-2 pb-2 pt-3">
                <div ref={chartRef} className="h-56 w-full" />
                {!chartReady && (
                    <div className="-mt-56 flex h-56 items-center justify-center text-xs text-slate-400">图表加载中...</div>
                )}
            </div>
        </div>
    );
};

const FiveEducationDonutChart = ({
    title,
    metric,
    data,
    toolbar,
    animationKey,
}: {
    title: string;
    metric: EventDistributionMetric;
    data: LeaderReportFiveEducationStat[];
    toolbar?: React.ReactNode;
    animationKey: string;
}) => {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const chartInstanceRef = useRef<EChartsType | null>(null);
    const chartCoreRef = useRef<typeof import('echarts/core') | null>(null);
    const [chartReady, setChartReady] = useState(false);
    const [selectedDonutKey, setSelectedDonutKey] = useState<LeaderReportFiveEducationStat['key'] | null>(null);
    const metricLabel = eventDistributionMetricLabelMap[metric];
    const chartItems = useMemo(() => (
        data.map(item => {
            const value = metric === 'positive'
                ? item.positiveEventCount
                : metric === 'negative'
                    ? item.negativeEventCount
                    : item.eventCount;
            return { ...item, value };
        })
    ), [data, metric]);
    const totalEvents = useMemo(() => chartItems.reduce((sum, item) => sum + item.value, 0), [chartItems]);
    const displayedTotalEvents = useAnimatedNumber(totalEvents, 650, animationKey);
    const showDonutTip = useCallback((key: LeaderReportFiveEducationStat['key']) => {
        const chart = chartInstanceRef.current;
        if (!chart) return;
        const dataIndex = chartItems.findIndex(item => item.key === key);
        if (dataIndex < 0) return;
        chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex });
    }, [chartItems]);

    useEffect(() => {
        setSelectedDonutKey(current => (
            chartItems.some(item => item.key === current)
                ? current
                : null
        ));
    }, [chartItems]);

    useEffect(() => {
        if (!chartRef.current) return;

        let disposed = false;
        let resizeObserver: ResizeObserver | null = null;

        const loadChart = async () => {
            const echartsCore = await loadReportChartsRuntime();
            if (disposed || !chartRef.current) return;

            const chart = echartsCore.init(chartRef.current, undefined, { renderer: 'canvas' });
            chartCoreRef.current = echartsCore;
            chartInstanceRef.current = chart;
            setChartReady(true);

            const handleResize = () => chart.resize();
            resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(chartRef.current);
            requestAnimationFrame(handleResize);
        };

        loadChart();

        return () => {
            disposed = true;
            resizeObserver?.disconnect();
            chartInstanceRef.current?.dispose();
            chartInstanceRef.current = null;
            chartCoreRef.current = null;
        };
    }, []);

    useEffect(() => {
        const chart = chartInstanceRef.current;
        if (!chart) return;

        const hasData = totalEvents > 0;
        const option: EChartsCoreOption = {
            backgroundColor: 'transparent',
            animationDuration: 650,
            animationEasing: 'cubicOut',
            animationDurationUpdate: 650,
            animationEasingUpdate: 'cubicOut',
            tooltip: {
                show: true,
                trigger: 'item',
                triggerOn: 'click',
                alwaysShowContent: selectedDonutKey !== null,
                confine: true,
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                borderWidth: 0,
                borderRadius: 12,
                padding: [8, 10],
                textStyle: { color: '#fff', fontSize: 12 },
                formatter: (params: unknown) => {
                    const itemIndex = (params as { dataIndex?: number })?.dataIndex;
                    if (typeof itemIndex !== 'number') return '';
                    const item = chartItems[itemIndex];
                    if (!item || !hasData) return '';
                    const percent = totalEvents > 0 ? Math.round((item.value / totalEvents) * 100) : 0;
                    return `${item.name}<br/>${metricLabel}：${item.value}次<br/>占比：${percent}%`;
                },
            },
            series: [
                {
                    type: 'pie',
                    radius: ['58%', '78%'],
                    center: ['50%', '48%'],
                    avoidLabelOverlap: true,
                    minAngle: hasData ? 8 : 360,
                    label: { show: false },
                    labelLine: { show: false },
                    data: hasData
                        ? chartItems.map(item => ({
                            name: item.name,
                            value: item.value,
                            itemStyle: {
                                color: fiveEducationColors[item.key],
                                borderColor: '#f8fafc',
                                borderWidth: 3,
                                borderRadius: 8,
                            },
                        }))
                        : [{
                            name: '暂无数据',
                            value: 1,
                            itemStyle: { color: '#e2e8f0', borderColor: '#f8fafc', borderWidth: 3 },
                        }],
                    emphasis: { disabled: true },
                },
            ],
        };

        chart.setOption(option, false);
        if (selectedDonutKey) {
            requestAnimationFrame(() => showDonutTip(selectedDonutKey));
        } else {
            chart.dispatchAction({ type: 'hideTip' });
        }

        const handleClick = (params: { dataIndex?: number; name?: string }) => {
            const clicked = typeof params.dataIndex === 'number'
                ? chartItems[params.dataIndex]
                : chartItems.find(item => item.name === params.name);
            if (!clicked) return;
            setSelectedDonutKey(clicked.key);
            showDonutTip(clicked.key);
        };

        chart.off('click');
        chart.on('click', handleClick);

        return () => {
            chart.off('click', handleClick);
        };
    }, [animationKey, chartItems, chartReady, metricLabel, selectedDonutKey, showDonutTip, totalEvents]);

    return (
        <div className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm">
            <h2 className="text-[17px] font-semibold text-slate-900">{title}</h2>
            {toolbar && (
                <div className="mt-3 flex items-center">
                    {toolbar}
                </div>
            )}
            <div className="mt-3 rounded-3xl bg-slate-50/90 px-3 pb-3 pt-3">
                <div className="relative h-56 w-full">
                    <div ref={chartRef} className="h-56 w-full" />
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                        <div className="text-[11px] font-semibold text-slate-400">{metricLabel}</div>
                        <div className="mt-1 text-3xl font-bold leading-none tracking-normal text-slate-950">{displayedTotalEvents}</div>
                        <div className="mt-1 text-[11px] font-medium text-slate-400">次</div>
                    </div>
                    {!chartReady && (
                        <div className="absolute inset-0 flex items-center justify-center text-xs text-slate-400">图表加载中...</div>
                    )}
                </div>
                <div className="mt-2 grid grid-cols-2 gap-2">
                    {chartItems.map(item => (
                        <button
                            key={item.key}
                            type="button"
                            onClick={() => {
                                setSelectedDonutKey(item.key);
                                showDonutTip(item.key);
                            }}
                            aria-label={`查看${item.name}事件占比`}
                            className={`flex min-w-0 items-center justify-between gap-2 rounded-2xl px-3 py-2 text-left text-xs transition-colors active:bg-slate-100 ${selectedDonutKey === item.key ? 'bg-white ring-1 ring-slate-200' : 'bg-white/80'}`}
                        >
                            <div className="flex min-w-0 items-center gap-2">
                                <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: fiveEducationColors[item.key] }} />
                                <span className="truncate font-medium text-slate-600">{item.name}</span>
                            </div>
                            <span className="shrink-0 font-bold text-slate-900">
                                <AnimatedNumber value={item.value} replayKey={`${animationKey}-${item.key}`} />
                            </span>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const IndicatorUsageSummaryCard = ({
    groups,
    period,
    onViewAll,
}: {
    groups: LeaderReportIndicatorGroupUsage[];
    period: LeaderReportPeriod;
    onViewAll: () => void;
}) => {
    const secondSummary = getIndicatorSecondUsageSummary(groups, period);
    const thirdSummary = getIndicatorUsageSummary(groups, period);
    const coverageItems = [
        {
            key: 'second',
            label: '二级指标覆盖率',
            coverageRate: secondSummary.coverageRate,
            uncovered: secondSummary.uncovered,
            tone: 'emerald',
        },
        {
            key: 'third',
            label: '三级指标覆盖率',
            coverageRate: thirdSummary.coverageRate,
            uncovered: thirdSummary.uncovered,
            tone: 'sky',
        },
    ] as const;

    return (
        <section className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between gap-3">
                <h2 className="text-[17px] font-semibold text-slate-900">指标使用情况</h2>
                <button
                    type="button"
                    onClick={onViewAll}
                    className="shrink-0 rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 active:bg-emerald-100"
                >
                    查看完整名单
                </button>
            </div>
            <div className="mt-3 space-y-3 rounded-3xl bg-slate-50/90 p-3">
                {coverageItems.map(item => (
                    <React.Fragment key={item.key}>
                        <IndicatorCoverageChartRow item={item} />
                    </React.Fragment>
                ))}
            </div>
        </section>
    );
};

const IndicatorCoverageChartRow = ({
    item,
}: {
    item: {
        label: string;
        coverageRate: number;
        uncovered: number;
        tone: 'emerald' | 'sky';
    };
}) => {
    const tone = item.tone === 'emerald'
        ? {
            shell: 'bg-emerald-50/80',
            track: 'bg-emerald-100/70',
            bar: 'bg-gradient-to-r from-emerald-400 to-emerald-600',
            text: 'text-emerald-700',
        }
        : {
            shell: 'bg-sky-50/80',
            track: 'bg-sky-100/80',
            bar: 'bg-gradient-to-r from-sky-400 to-blue-600',
            text: 'text-sky-700',
        };

    return (
        <div className={`rounded-2xl p-3 ${tone.shell}`}>
            <div className="flex items-start justify-between gap-3">
                <div>
                    <div className={`text-[13px] font-semibold ${tone.text}`}>{item.label}</div>
                    <div className={`mt-1 text-[11px] font-medium ${tone.text}/70`}>未覆盖 {item.uncovered}</div>
                </div>
                <div className={`shrink-0 tabular-nums ${tone.text}`}>
                    <span className="text-2xl font-bold leading-none">{item.coverageRate}</span>
                    <span className="ml-0.5 text-sm font-semibold">%</span>
                </div>
            </div>
            <div className={`mt-3 h-3 overflow-hidden rounded-full ${tone.track}`} aria-label={`${item.label}${item.coverageRate}%`}>
                <div className={`h-full rounded-full ${tone.bar} transition-all duration-700 ease-out`} style={{ width: `${item.coverageRate}%` }} />
            </div>
            <div className="mt-2 flex justify-between text-[10px] font-semibold text-slate-400">
                <span>0%</span>
                <span>50%</span>
                <span>100%</span>
            </div>
        </div>
    );
};

const IndicatorUsageSheet = ({
    groups,
    period,
    level,
    groupFilter,
    onLevelChange,
    onGroupFilterChange,
    onClose,
}: {
    groups: LeaderReportIndicatorGroupUsage[];
    period: LeaderReportPeriod;
    level: IndicatorUsageLevel;
    groupFilter: IndicatorGroupFilter;
    onLevelChange: (value: IndicatorUsageLevel) => void;
    onGroupFilterChange: (value: IndicatorGroupFilter) => void;
    onClose: () => void;
}) => {
    const visibleGroups = groups.filter(group => group.id === groupFilter);

    return (
        <div className="absolute inset-0 z-[120] flex items-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
            <div className="flex max-h-[88%] w-full flex-col rounded-t-[32px] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                <div className="flex shrink-0 items-center justify-between border-b border-slate-100 px-5 py-4">
                    <h3 className="text-lg font-semibold text-slate-900">指标使用情况</h3>
                    <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 active:bg-slate-100" onClick={onClose}>
                        <X className="h-5 w-5" />
                    </button>
                </div>
                <div className="shrink-0 border-b border-slate-100 px-5 py-3">
                    <SegmentedTabs value={level} onChange={onLevelChange} tabs={indicatorLevelTabs} />
                    <div className="mt-3 flex gap-2 overflow-x-auto no-scrollbar">
                        {indicatorGroupTabs.map(tab => (
                            <button
                                key={tab.key}
                                type="button"
                                onClick={() => onGroupFilterChange(tab.key)}
                                className={`min-h-[34px] shrink-0 rounded-full px-3 text-xs font-semibold transition-all ${groupFilter === tab.key ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
                <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50/70 p-4 pb-8">
                    {visibleGroups.map(group => {
                        const color = fiveEducationColors[group.id];
                        const secondItems = group.children
                            .map(second => ({
                                ...second,
                                count: second.children.reduce((sum, child) => sum + getIndicatorCount(child, period), 0),
                            }))
                            .sort((a, b) => a.count - b.count || a.name.localeCompare(b.name, 'zh-Hans-CN'));

                        return level === 'second' ? (
                            <section key={group.id} className="space-y-2">
                                {secondItems.map(second => (
                                    <div key={second.id} className="flex min-h-[44px] items-center justify-between gap-3 rounded-2xl bg-white px-3 py-2.5 shadow-sm ring-1 ring-slate-100">
                                        <div className="min-w-0 truncate text-[15px] font-semibold text-slate-900">{second.name}</div>
                                        <div className={`w-14 shrink-0 text-right text-xl font-black tabular-nums ${second.count > 0 ? 'text-slate-950' : 'text-slate-300'}`}>{second.count}</div>
                                    </div>
                                ))}
                            </section>
                        ) : (
                            <section key={group.id} className="space-y-2.5">
                                {secondItems.map(second => {
                                    const thirdItems = second.children
                                        .map(third => ({ ...third, count: getIndicatorCount(third, period) }))
                                        .sort((a, b) => a.count - b.count || a.name.localeCompare(b.name, 'zh-Hans-CN'));
                                    return (
                                        <div key={second.id} className="rounded-3xl bg-white p-2.5 shadow-sm ring-1 ring-slate-100">
                                            <div className="mb-1.5 flex items-center gap-2 px-1">
                                                <span className="h-5 w-1 rounded-full" style={{ backgroundColor: color }} />
                                                <div className="text-[13px] font-bold text-slate-500">{second.name}</div>
                                            </div>
                                            <div className="space-y-1.5">
                                                {thirdItems.map(third => (
                                                    <div key={third.id} className="flex min-h-[38px] items-center justify-between gap-3 rounded-xl bg-slate-50/90 px-3 py-2">
                                                        <div className="min-w-0 truncate text-sm font-semibold text-slate-900">{third.name}</div>
                                                        <div className={`w-14 shrink-0 text-right text-lg font-black tabular-nums ${third.count > 0 ? 'text-slate-950' : 'text-slate-300'}`}>{third.count}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </section>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

const GradeCoverageChart = ({
    grades,
    selectedGradeId,
    onSelect,
    tooltipEnabled = true,
    animationKey,
}: {
    grades: LeaderReportGradeCoverage[];
    selectedGradeId: string | null;
    onSelect: (gradeId: string) => void;
    tooltipEnabled?: boolean;
    animationKey: string;
}) => {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const chartInstanceRef = useRef<EChartsType | null>(null);
    const chartCoreRef = useRef<typeof import('echarts/core') | null>(null);
    const lastAnimationKeyRef = useRef<string | null>(null);
    const [chartReady, setChartReady] = useState(false);

    useEffect(() => {
        if (!chartRef.current) return;

        let disposed = false;
        let resizeObserver: ResizeObserver | null = null;

        const loadChart = async () => {
            const echartsCore = await loadReportChartsRuntime();

            if (disposed || !chartRef.current) return;

            const chart = echartsCore.init(chartRef.current, undefined, { renderer: 'canvas' });
            chartCoreRef.current = echartsCore;
            chartInstanceRef.current = chart;
            setChartReady(true);

            const handleResize = () => chart.resize();
            resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(chartRef.current);
            window.addEventListener('resize', handleResize);
            requestAnimationFrame(handleResize);

            chartInstanceRef.current?.on('finished', handleResize);
        };

        loadChart();

        return () => {
            disposed = true;
            resizeObserver?.disconnect();
            chartInstanceRef.current?.dispose();
            chartInstanceRef.current = null;
            chartCoreRef.current = null;
        };
    }, []);

    useEffect(() => {
        const chart = chartInstanceRef.current;
        const echartsCore = chartCoreRef.current;
        if (!chart || !echartsCore) return;

        const option: EChartsCoreOption = {
            backgroundColor: 'transparent',
            animationDuration: 650,
            animationEasing: 'cubicOut',
            animationDurationUpdate: 650,
            animationEasingUpdate: 'cubicOut',
            grid: { left: 28, right: 8, top: 34, bottom: 56, containLabel: false },
            tooltip: {
                show: tooltipEnabled,
                trigger: 'axis',
                triggerOn: 'click',
                alwaysShowContent: false,
                axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(15, 23, 42, 0.06)' } },
                confine: true,
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                borderWidth: 0,
                borderRadius: 12,
                padding: [8, 10],
                textStyle: { color: '#fff', fontSize: 12 },
                formatter: (params: unknown) => {
                    const first = Array.isArray(params) ? params[0] as { dataIndex?: number; value?: number } : params as { dataIndex?: number; value?: number };
                    if (typeof first?.dataIndex !== 'number') return '';
                    const grade = grades[first.dataIndex];
                    if (!grade) return '';
                    return `${grade.name}<br/>覆盖率：${first.value}%<br/>覆盖学生：${grade.covered}/${grade.total}`;
                },
            },
            xAxis: {
                type: 'category',
                data: grades.map(grade => grade.name),
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: {
                    color: '#64748b',
                    fontSize: 11,
                    fontWeight: 700,
                    interval: 0,
                    margin: 12,
                    formatter: (value: string) => value,
                },
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 100,
                interval: 25,
                axisLabel: {
                    color: '#94a3b8',
                    fontSize: 10,
                    formatter: '{value}%',
                },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
            },
            series: [
                {
                    type: 'bar',
                    data: grades.map(grade => {
                        const percent = rate(grade.covered, grade.total);
                        const baseColor = getCoverageHex(percent);
                        return {
                            value: percent,
                            itemStyle: {
                                color: new echartsCore.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: baseColor },
                                    { offset: 1, color: `${baseColor}cc` },
                                ]),
                                borderRadius: [10, 10, 4, 4],
                                opacity: 0.96,
                            },
                            label: {
                                show: true,
                                position: 'top',
                                formatter: '{c}%',
                                color: baseColor,
                                fontSize: 12,
                                fontWeight: 800,
                                valueAnimation: true,
                                precision: 0,
                                distance: 6,
                            },
                        };
                    }),
                    barWidth: 22,
                    barGap: '40%',
                    emphasis: { disabled: true },
                },
            ],
        };

        setBarChartOptionWithReplay(chart, option, animationKey, lastAnimationKeyRef, () => {
            if (!tooltipEnabled) {
                chart.dispatchAction({ type: 'hideTip' });
            }
        });

        const handleClick = (params: { dataIndex?: number }) => {
            if (typeof params.dataIndex !== 'number') return;
            const grade = grades[params.dataIndex];
            if (!grade) return;
            onSelect(grade.id);
            if (tooltipEnabled) {
                chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: params.dataIndex });
            }
        };

        chart.off('click');
        chart.on('click', handleClick);

        return () => {
            chart.off('click', handleClick);
        };
    }, [animationKey, chartReady, grades, onSelect, selectedGradeId, tooltipEnabled]);

    return (
        <div className="rounded-3xl bg-slate-50/90 px-2 pb-2 pt-3">
            <div ref={chartRef} className="h-56 w-full" />
            {!chartReady && (
                <div className="-mt-56 flex h-56 items-center justify-center text-xs text-slate-400">图表加载中...</div>
            )}
        </div>
    );
};

const ClassCoverageRow: React.FC<{ item: LeaderReportClassCoverage }> = ({ item }) => {
    const percent = rate(item.covered, item.total);
    const tone = getCoverageTone(percent);

    return (
        <div className="rounded-2xl bg-white/80 p-3">
            <div className="flex items-center justify-between gap-3">
                <div className="text-[15px] font-medium text-slate-900">{item.name}</div>
                <div className="text-sm font-semibold text-slate-700">{percent}%</div>
            </div>
            <div className="mt-1.5 flex items-center gap-3">
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                    <div className={`h-full rounded-full ${tone.bar}`} style={{ width: `${percent}%` }} />
                </div>
                <div className="w-14 text-right text-xs text-slate-500">{item.covered}/{item.total}</div>
            </div>
        </div>
    );
};

const getClassShortName = (name: string) => {
    const match = name.match(/(\d+班)$/);
    return match ? match[1] : name;
};

const getClassOrder = (name: string) => {
    const match = name.match(/(\d+)班$/);
    return match ? Number(match[1]) : Number.MAX_SAFE_INTEGER;
};

const ClassCoverageChart = ({ classes, animationKey }: { classes: LeaderReportClassCoverage[]; animationKey: string }) => {
    const chartRef = useRef<HTMLDivElement | null>(null);
    const chartInstanceRef = useRef<EChartsType | null>(null);
    const chartCoreRef = useRef<typeof import('echarts/core') | null>(null);
    const lastAnimationKeyRef = useRef<string | null>(null);
    const [chartReady, setChartReady] = useState(false);
    const sortedClasses = useMemo(() => (
        [...classes].sort((a, b) => getClassOrder(a.name) - getClassOrder(b.name) || a.name.localeCompare(b.name, 'zh-Hans-CN'))
    ), [classes]);
    const dataAnimationKey = `${animationKey}-${sortedClasses.map(item => `${item.id}:${item.covered}/${item.total}`).join('|')}`;
    const displayedProgress = useAnimatedProgress(dataAnimationKey);
    const shouldScroll = sortedClasses.length > 6;
    const chartWidth = shouldScroll ? sortedClasses.length * 34 : 320;

    useEffect(() => {
        if (!chartRef.current) return;

        let disposed = false;
        let resizeObserver: ResizeObserver | null = null;

        const loadChart = async () => {
            const echartsCore = await loadReportChartsRuntime();
            if (disposed || !chartRef.current) return;

            const chart = echartsCore.init(chartRef.current, undefined, { renderer: 'canvas' });
            chartCoreRef.current = echartsCore;
            chartInstanceRef.current = chart;
            setChartReady(true);

            const handleResize = () => chart.resize();
            resizeObserver = new ResizeObserver(handleResize);
            resizeObserver.observe(chartRef.current);
            requestAnimationFrame(handleResize);
        };

        loadChart();

        return () => {
            disposed = true;
            resizeObserver?.disconnect();
            chartInstanceRef.current?.dispose();
            chartInstanceRef.current = null;
            chartCoreRef.current = null;
        };
    }, []);

    useEffect(() => {
        const chart = chartInstanceRef.current;
        const echartsCore = chartCoreRef.current;
        if (!chart || !echartsCore) return;

        const option: EChartsCoreOption = {
            backgroundColor: 'transparent',
            animationDuration: 650,
            animationEasing: 'cubicOut',
            animationDurationUpdate: 650,
            animationEasingUpdate: 'cubicOut',
            grid: { left: 24, right: 10, top: 30, bottom: 34, containLabel: false },
            tooltip: {
                trigger: 'axis',
                triggerOn: 'click',
                alwaysShowContent: false,
                axisPointer: { type: 'shadow', shadowStyle: { color: 'rgba(15, 23, 42, 0.06)' } },
                confine: true,
                backgroundColor: 'rgba(15, 23, 42, 0.92)',
                borderWidth: 0,
                borderRadius: 12,
                padding: [8, 10],
                textStyle: { color: '#fff', fontSize: 12 },
                formatter: (params: unknown) => {
                    const first = Array.isArray(params) ? params[0] as { dataIndex?: number; value?: number } : params as { dataIndex?: number; value?: number };
                    if (typeof first?.dataIndex !== 'number') return '';
                    const item = sortedClasses[first.dataIndex];
                    if (!item) return '';
                    return `${item.name}<br/>覆盖率：${first.value}%<br/>覆盖学生：${item.covered}/${item.total}`;
                },
            },
            xAxis: {
                type: 'category',
                data: sortedClasses.map(item => getClassShortName(item.name)),
                axisLine: { show: false },
                axisTick: { show: false },
                axisLabel: { color: '#64748b', fontSize: 11, fontWeight: 700, interval: 0, margin: 10 },
            },
            yAxis: {
                type: 'value',
                min: 0,
                max: 100,
                interval: 25,
                axisLabel: { color: '#94a3b8', fontSize: 10, formatter: '{value}%' },
                axisLine: { show: false },
                axisTick: { show: false },
                splitLine: { lineStyle: { color: '#e2e8f0', type: 'dashed' } },
            },
            series: [
                {
                    type: 'bar',
                    data: sortedClasses.map(item => {
                        const targetPercent = rate(item.covered, item.total);
                        const percent = Math.round(rate(item.covered, item.total) * displayedProgress);
                        const baseColor = getCoverageHex(targetPercent);
                        return {
                            value: percent,
                            itemStyle: {
                                color: new echartsCore.graphic.LinearGradient(0, 0, 0, 1, [
                                    { offset: 0, color: baseColor },
                                    { offset: 1, color: `${baseColor}cc` },
                                ]),
                                borderRadius: [8, 8, 3, 3],
                            },
                            label: {
                                show: true,
                                position: 'top',
                                formatter: '{c}%',
                                color: baseColor,
                                fontSize: 12,
                                fontWeight: 800,
                                valueAnimation: true,
                                precision: 0,
                                distance: 5,
                            },
                        };
                    }),
                    barWidth: 18,
                    barCategoryGap: '8%',
                    animation: false,
                    emphasis: { disabled: true },
                },
            ],
        };

        setBarChartOptionWithReplay(chart, option, dataAnimationKey, lastAnimationKeyRef, () => {
            chart.resize();
        });

        const handleClick = (params: { dataIndex?: number }) => {
            if (typeof params.dataIndex !== 'number') return;
            chart.dispatchAction({ type: 'showTip', seriesIndex: 0, dataIndex: params.dataIndex });
        };

        chart.off('click');
        chart.on('click', handleClick);

        return () => {
            chart.off('click', handleClick);
        };
    }, [dataAnimationKey, displayedProgress, chartReady, sortedClasses]);

    return (
        <div className={`rounded-3xl bg-slate-50/90 px-2 pb-2 pt-3 ${shouldScroll ? 'overflow-x-auto no-scrollbar' : 'overflow-hidden'}`}>
            <div ref={chartRef} className="h-56" style={{ width: shouldScroll ? `${chartWidth}px` : '100%' }} />
            {!chartReady && (
                <div className="flex h-56 items-center justify-center text-xs text-slate-400">图表加载中...</div>
            )}
        </div>
    );
};

const LeaderReportView: React.FC<LeaderReportViewProps> = ({ onBack }) => {
    const [activeReportTab, setActiveReportTab] = useState<ReportTab>('teacher');
    const [activePeriod, setActivePeriod] = useState<LeaderReportPeriod>('week');
    const [rankingTab, setRankingTab] = useState<RankingType>('active');
    const [scoreRankingSort, setScoreRankingSort] = useState<ScoreRankingSort>('plus');
    const [fiveEducationScoreMetric, setFiveEducationScoreMetric] = useState<ScoreRankingSort>('net');
    const [eventDistributionMetric, setEventDistributionMetric] = useState<EventDistributionMetric>('total');
    const [fullScoreRankingSort, setFullScoreRankingSort] = useState<ScoreRankingSort>('plus');
    const [fullRankingType, setFullRankingType] = useState<RankingType | null>(null);
    const [showFullScoreRanking, setShowFullScoreRanking] = useState(false);
    const [showIndicatorUsageSheet, setShowIndicatorUsageSheet] = useState(false);
    const [indicatorUsageLevel, setIndicatorUsageLevel] = useState<IndicatorUsageLevel>('third');
    const [indicatorGroupFilter, setIndicatorGroupFilter] = useState<IndicatorGroupFilter>('virtue');
    const [selectedGradeId, setSelectedGradeId] = useState<string | null>(null);
    const [showClassCoverageSheet, setShowClassCoverageSheet] = useState(false);
    const [isFilterPinned, setIsFilterPinned] = useState(false);
    const [snapshot, setSnapshot] = useState<LeaderReportSnapshot | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        let disposed = false;
        setIsLoading(true);

        getLeaderReportSnapshot(activePeriod)
            .then(data => {
                if (disposed) return;
                setSnapshot(data);
                setSelectedGradeId(current => (
                    data.gradeCoverages.some(grade => grade.id === current)
                        ? current
                        : getDefaultCoverageGradeId(data.gradeCoverages)
                ));
            })
            .finally(() => {
                if (!disposed) setIsLoading(false);
            });

        return () => {
            disposed = true;
        };
    }, [activePeriod]);

    const visibleRanking = snapshot ? (rankingTab === 'active' ? snapshot.activeRanking : snapshot.lowRanking) : [];
    const fullRanking = snapshot ? (fullRankingType === 'active' ? snapshot.activeRanking : snapshot.lowRanking) : [];
    const fullScoreRanking = snapshot ? getSortedTeacherScores(snapshot.teacherScoreSummaries, fullScoreRankingSort) : [];
    const selectedGrade = snapshot?.gradeCoverages.find(grade => grade.id === selectedGradeId)
        ?? snapshot?.gradeCoverages.find(grade => grade.id === getDefaultCoverageGradeId(snapshot.gradeCoverages))
        ?? null;
    const reportAnimationKey = `${activeReportTab}-${activePeriod}-${isLoading ? 'loading' : 'ready'}`;

    const openClassCoverageSheet = (gradeId?: string) => {
        if (!snapshot?.gradeCoverages.length) return;
        const fallbackGradeId = getDefaultCoverageGradeId(snapshot.gradeCoverages);
        const fallbackGrade = snapshot.gradeCoverages.find(grade => grade.id === fallbackGradeId) ?? snapshot.gradeCoverages[0];
        setSelectedGradeId(gradeId ?? selectedGradeId ?? fallbackGrade.id);
        setShowClassCoverageSheet(true);
    };
    const handleReportScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const nextPinned = event.currentTarget.scrollTop > 12;
        setIsFilterPinned(current => (current === nextPinned ? current : nextPinned));
    }, []);

    return (
        <div className="relative flex h-full min-h-full flex-col overflow-hidden bg-[#eef7f3] text-slate-900">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-[radial-gradient(circle_at_20%_0%,rgba(16,185,129,0.22),transparent_34%),radial-gradient(circle_at_88%_8%,rgba(59,130,246,0.20),transparent_32%)]" />
            <div className="relative z-40 flex h-[44px] shrink-0 items-center justify-between border-b border-white/50 bg-white/90 px-4 py-2 backdrop-blur-xl">
                <button onClick={onBack} className="flex h-10 w-10 -ml-2 items-center justify-center rounded-full text-slate-700 transition-colors active:bg-slate-100">
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <div className="absolute left-1/2 -translate-x-1/2 text-[17px] font-bold tracking-tight">学校数据报表</div>
                <div className="w-10" aria-hidden="true" />
            </div>

            <div className="relative flex-1 space-y-4 overflow-y-auto px-4 pb-8 pt-0 no-scrollbar" onScroll={handleReportScroll}>
                {isLoading && (
                    <div className="mt-4 rounded-3xl bg-white/80 px-4 py-3 text-center text-xs text-slate-400 shadow-sm">数据加载中...</div>
                )}
                <div className={`sticky top-0 z-50 -mx-4 px-4 transition-all duration-300 ease-out ${isFilterPinned
                    ? 'h-[108px] bg-white pb-0 pt-0 shadow-[0_18px_42px_-30px_rgba(15,23,42,0.46)]'
                    : 'h-[148px] bg-transparent pb-0 pt-4'}`}
                >
                    {/* 完整筛选：首屏保留两层完整信息，滚动后收起 */}
                    <div className={`space-y-3 transition-all duration-300 ease-out ${isFilterPinned ? 'pointer-events-none -translate-y-4 scale-[0.94] opacity-0 blur-[2px]' : 'translate-y-0 scale-100 opacity-100 blur-0'}`}>
                        <section className={`rounded-3xl bg-white p-1.5 transition-all duration-300 ease-out ${isFilterPinned ? 'shadow-md shadow-slate-200/70' : 'shadow-[0_14px_38px_-28px_rgba(15,23,42,0.38)]'}`}>
                            <div className="grid grid-cols-2 gap-1.5">
                                <button
                                    type="button"
                                    onClick={() => setActiveReportTab('teacher')}
                                    className={`rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.98] ${isFilterPinned ? 'min-h-[38px]' : 'min-h-[48px]'} ${activeReportTab === 'teacher'
                                        ? 'bg-emerald-600 text-white shadow-[0_8px_18px_-12px_rgba(5,150,105,0.9)]'
                                        : 'bg-emerald-50 text-emerald-800 active:bg-emerald-100'}`}
                                >
                                    教师使用
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveReportTab('event')}
                                    className={`rounded-2xl text-[15px] font-semibold transition-all active:scale-[0.98] ${isFilterPinned ? 'min-h-[38px]' : 'min-h-[48px]'} ${activeReportTab === 'event'
                                        ? 'bg-emerald-600 text-white shadow-[0_8px_18px_-12px_rgba(5,150,105,0.9)]'
                                        : 'bg-emerald-50 text-emerald-800 active:bg-emerald-100'}`}
                                >
                                    事件分布
                                </button>
                            </div>
                        </section>

                        <section className={`rounded-[22px] bg-white p-2 transition-all duration-300 ease-out ${isFilterPinned ? 'shadow-[0_14px_34px_-26px_rgba(5,150,105,0.7)]' : 'shadow-[0_12px_30px_-22px_rgba(15,23,42,0.36)]'}`}>
                            <div className={`grid grid-cols-4 rounded-[18px] transition-all duration-300 ease-out ${isFilterPinned ? 'gap-1.5 p-1' : 'gap-2'}`}>
                                {leaderReportPeriods.map(period => (
                                    <button
                                        key={period.key}
                                        onClick={() => setActivePeriod(period.key)}
                                        className={`rounded-[16px] border text-[14px] font-semibold transition-all active:scale-95 ${isFilterPinned ? 'min-h-[34px]' : 'min-h-[38px]'} ${activePeriod === period.key
                                            ? 'border-transparent bg-emerald-500 text-white shadow-sm'
                                            : 'border-transparent bg-emerald-50/70 text-emerald-800 shadow-[0_4px_14px_-12px_rgba(15,23,42,0.45)] active:bg-emerald-100'}`}
                                    >
                                        {period.label}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* 紧凑筛选：吸顶后压缩成单条胶囊，类似货柜机入口卡片收束后的操作区 */}
                    <div className={`pointer-events-none absolute inset-x-0 top-0 transition-all duration-300 ease-out ${isFilterPinned ? 'opacity-100 translate-y-0 scale-100 blur-0' : 'opacity-0 translate-y-4 scale-[1.04] blur-[2px]'}`}>
                        <div className="pointer-events-auto flex flex-col gap-1.5 rounded-b-none border-b border-slate-100/80 bg-white px-4 pb-2 pt-3 shadow-[0_14px_34px_-24px_rgba(15,23,42,0.45)]">
                            <div className="grid h-12 grid-cols-2 rounded-[22px] bg-emerald-50/90 p-1">
                                <button
                                    type="button"
                                    onClick={() => setActiveReportTab('teacher')}
                                    aria-label="教师使用报表"
                                    className={`rounded-[16px] text-[14px] font-semibold transition-all active:scale-95 ${activeReportTab === 'teacher' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-800 active:bg-white/80'}`}
                                >
                                    教师使用
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setActiveReportTab('event')}
                                    aria-label="事件分布报表"
                                    className={`rounded-[16px] text-[14px] font-semibold transition-all active:scale-95 ${activeReportTab === 'event' ? 'bg-emerald-600 text-white shadow-sm' : 'text-emerald-800 active:bg-white/80'}`}
                                >
                                    事件分布
                                </button>
                            </div>
                            <div className="grid h-9 min-w-0 grid-cols-4 gap-1 rounded-[18px] bg-white p-0.5">
                                {leaderReportPeriods.map(period => (
                                    <button
                                        key={period.key}
                                        onClick={() => setActivePeriod(period.key)}
                                        className={`rounded-[14px] text-[14px] font-semibold transition-all active:scale-95 ${activePeriod === period.key
                                            ? 'bg-emerald-500 text-white shadow-sm'
                                            : 'text-emerald-800 active:bg-emerald-50'}`}
                                    >
                                        {period.label.replace('本学期', '学期')}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {activeReportTab === 'teacher' ? (
                    <>
                <OverviewCard snapshot={snapshot} animationKey={`${reportAnimationKey}-overview`} />

                <section className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="text-[17px] font-semibold text-slate-900">年级覆盖率</h2>
                        <button
                            type="button"
                            onClick={() => openClassCoverageSheet()}
                            className="rounded-full bg-emerald-50 px-3 py-1.5 text-[11px] font-semibold text-emerald-700 active:bg-emerald-100"
                        >
                            查看班级明细
                        </button>
                    </div>
                    <GradeCoverageChart
                        grades={snapshot?.gradeCoverages ?? []}
                        selectedGradeId={selectedGrade?.id ?? selectedGradeId}
                        onSelect={setSelectedGradeId}
                        tooltipEnabled={!showClassCoverageSheet}
                        animationKey={`${reportAnimationKey}-grade-coverage`}
                    />
                </section>


                <section className="rounded-3xl border border-white/80 bg-white p-4 shadow-sm">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <h2 className="text-[17px] font-semibold text-slate-900">教师使用排行榜</h2>
                        <button
                            className="shrink-0 text-xs font-medium text-emerald-600 active:opacity-70"
                            onClick={() => setFullRankingType(rankingTab)}
                        >
                            查看全部
                        </button>
                    </div>
                    <div className="mb-3">
                        <div className="inline-flex rounded-2xl bg-slate-100 p-1">
                            <button
                                type="button"
                                onClick={() => setRankingTab('active')}
                                className={`min-h-[36px] rounded-xl px-4 text-sm font-semibold transition-all ${rankingTab === 'active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                积极使用
                            </button>
                            <button
                                type="button"
                                onClick={() => setRankingTab('low')}
                                className={`min-h-[36px] rounded-xl px-4 text-sm font-semibold transition-all ${rankingTab === 'low' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
                            >
                                使用较少
                            </button>
                        </div>
                    </div>
                    <TeacherUsageRankingHeader />
                    <div className="space-y-2.5">
                        {visibleRanking.slice(0, 10).map((teacher, index) => (
                            <TeacherRow
                                key={teacher.id}
                                teacher={teacher}
                                rank={rankingTab === 'active' ? index + 1 : undefined}
                                showAward={rankingTab === 'active'}
                            />
                        ))}
                    </div>
                </section>

                <TeacherScoreRankingCard
                    items={snapshot?.teacherScoreSummaries ?? []}
                    sort={scoreRankingSort}
                    onSortChange={setScoreRankingSort}
                    onViewAll={() => {
                        setFullScoreRankingSort(scoreRankingSort);
                        setShowFullScoreRanking(true);
                    }}
                />


                    </>
                ) : (
                    <section className="space-y-3">
                        <FiveEducationBarChart
                            title="五育得分对比图"
                            yAxisName={fiveEducationScoreYAxisNameMap[fiveEducationScoreMetric]}
                            valueKey={fiveEducationScoreValueKeyMap[fiveEducationScoreMetric]}
                            data={snapshot?.fiveEducationStats ?? []}
                            animationKey={`${reportAnimationKey}-five-education-${fiveEducationScoreMetric}`}
                            toolbar={
                                <ScoreSortTabs
                                    value={fiveEducationScoreMetric}
                                    onChange={setFiveEducationScoreMetric}
                                    tabs={fiveEducationScoreTabs}
                                />
                            }
                        />
                        <FiveEducationDonutChart
                            title="五育事件分布图"
                            metric={eventDistributionMetric}
                            data={snapshot?.fiveEducationStats ?? []}
                            animationKey={`${reportAnimationKey}-event-donut-${eventDistributionMetric}`}
                            toolbar={
                                <EventDistributionTabs
                                    value={eventDistributionMetric}
                                    onChange={setEventDistributionMetric}
                                />
                            }
                        />
                        <IndicatorUsageSummaryCard
                            groups={snapshot?.indicatorUsage ?? []}
                            period={activePeriod}
                            onViewAll={() => setShowIndicatorUsageSheet(true)}
                        />
                    </section>
                )}
            </div>

            {showClassCoverageSheet && selectedGrade && snapshot && (
                <div className="absolute inset-0 z-[115] flex items-end bg-black/40 backdrop-blur-sm" onClick={() => setShowClassCoverageSheet(false)}>
                    <div className="max-h-[76%] w-full rounded-t-[32px] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">班级覆盖率明细</h3>
                                
                            </div>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 active:bg-slate-100" onClick={() => setShowClassCoverageSheet(false)}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="border-b border-slate-100 px-5 py-3">
                            <div className="flex gap-2 overflow-x-auto no-scrollbar">
                                {snapshot.gradeCoverages.map(grade => {
                                    const selected = selectedGradeId === grade.id;
                                    return (
                                        <button
                                            key={grade.id}
                                            type="button"
                                            onClick={() => setSelectedGradeId(grade.id)}
                                            className={`min-h-[36px] shrink-0 rounded-full px-3 text-sm font-semibold transition-all ${selected ? 'bg-emerald-500 text-white shadow-sm' : 'bg-slate-100 text-slate-500'}`}
                                        >
                                            {grade.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="max-h-[46vh] overflow-y-auto p-4 pb-8">
                            <div className="mb-2 flex items-center justify-between px-1">
                                <div className="text-base font-semibold text-slate-900">{selectedGrade.name}班级覆盖率</div>
                                <div className="text-right">
                                    <span className="text-xl font-black leading-none text-emerald-700">
                                        <AnimatedNumber value={rate(selectedGrade.covered, selectedGrade.total)} replayKey={`${selectedGrade.id}-${selectedGrade.covered}/${selectedGrade.total}-summary`} />%
                                    </span>
                                </div>
                            </div>
                            <ClassCoverageChart classes={selectedGrade.classes} animationKey={`${selectedGrade.id}-${selectedGrade.covered}/${selectedGrade.total}`} />
                        </div>
                    </div>
                </div>
            )}

            {showFullScoreRanking && (
                <div className="absolute inset-0 z-[118] flex items-end bg-black/40 backdrop-blur-sm" onClick={() => setShowFullScoreRanking(false)}>
                    <div className="max-h-[82%] w-full rounded-t-[32px] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">教师赋分完整榜单</h3>
                                <p className="mt-0.5 text-xs text-slate-400">可按加分、减分、净赋分排序</p>
                            </div>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 active:bg-slate-100" onClick={() => setShowFullScoreRanking(false)}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="border-b border-slate-100 px-5 py-3">
                            <div className="mb-3">
                                <ScoreSortTabs value={fullScoreRankingSort} onChange={setFullScoreRankingSort} />
                            </div>
                            <div className="grid grid-cols-[minmax(0,1.1fr)_56px_56px_64px] gap-2 px-3 text-[11px] font-semibold text-slate-400">
                                <span>老师</span>
                                <span className="text-right">加分</span>
                                <span className="text-right">减分</span>
                                <span className="text-right">净赋分</span>
                            </div>
                        </div>
                        <div className="max-h-[58vh] space-y-2.5 overflow-y-auto p-4 pb-8">
                            {fullScoreRanking.map(item => <TeacherScoreRow key={item.teacherId} item={item} />)}
                        </div>
                    </div>
                </div>
            )}

            {showIndicatorUsageSheet && snapshot && (
                <IndicatorUsageSheet
                    groups={snapshot.indicatorUsage}
                    period={activePeriod}
                    level={indicatorUsageLevel}
                    groupFilter={indicatorGroupFilter}
                    onLevelChange={setIndicatorUsageLevel}
                    onGroupFilterChange={setIndicatorGroupFilter}
                    onClose={() => setShowIndicatorUsageSheet(false)}
                />
            )}

            {fullRankingType && (
                <div className="absolute inset-0 z-[120] flex items-end bg-black/40 backdrop-blur-sm" onClick={() => setFullRankingType(null)}>
                    <div className="max-h-[82%] w-full rounded-t-[32px] bg-white shadow-2xl" onClick={(event) => event.stopPropagation()}>
                        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
                            <div>
                                <h3 className="text-lg font-semibold text-slate-900">教师使用完整榜单</h3>
                                <p className="mt-0.5 text-xs text-slate-400">同一份教师使用数据，可切换不同排序视角</p>
                            </div>
                            <button className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-50 text-slate-500 active:bg-slate-100" onClick={() => setFullRankingType(null)}>
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                        <div className="border-b border-slate-100 px-5 py-3">
                            <div className="mb-3 grid grid-cols-2 gap-1.5 rounded-2xl bg-slate-100 p-1">
                                <button
                                    type="button"
                                    onClick={() => setFullRankingType('active')}
                                    className={`min-h-[36px] rounded-xl text-sm font-semibold transition-all ${fullRankingType === 'active' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    积极使用
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFullRankingType('low')}
                                    className={`min-h-[36px] rounded-xl text-sm font-semibold transition-all ${fullRankingType === 'low' ? 'bg-white text-orange-600 shadow-sm' : 'text-slate-500'}`}
                                >
                                    使用较少
                                </button>
                            </div>
                            <div className="grid grid-cols-[minmax(0,1.15fr)_56px_64px_72px] gap-2 px-3 text-[11px] font-semibold text-slate-400">
                                <span>老师</span>
                                <span className="text-right">评价次数</span>
                                <span className="text-right">覆盖学生</span>
                                <span className="text-right">最近评价</span>
                            </div>
                        </div>
                        <div className="max-h-[58vh] space-y-2.5 overflow-y-auto p-4 pb-8">
                            {fullRanking.map((teacher, index) => (
                                <FullTeacherRow key={teacher.id} teacher={teacher} rank={fullRankingType === 'active' ? index + 1 : undefined} showAward={fullRankingType === 'active'} />
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default LeaderReportView;
