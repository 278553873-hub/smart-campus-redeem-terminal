import React, { useEffect, useMemo, useState } from 'react';
import {
    AlertTriangle,
    CalendarDays,
    Check,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import { TeacherReportLineChart, type TeacherReportChartColor } from '../components/report/TeacherReportChart';
import {
    getMoralEducationCockpitSnapshot,
    getMoralEducationCockpitWeeks,
    type MoralEducationCockpitSnapshot,
    type MoralEducationDimensionColor,
    type MoralEducationWeekOption,
} from '../services/moralEducationCockpitService';
import { teacherBrandCssVariables } from '../styles/teacherMobileTokens';

interface MoralEducationCockpitViewProps {
    onBack: () => void;
}

type TrendMetric = 'averageScore' | 'deduction';

const reportCardClassName = 'rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-report-card-padding)] [box-shadow:var(--tm-shadow-card)]';

const dimensionColorVariables: Record<MoralEducationDimensionColor, string> = {
    indicator1: 'var(--tm-chart-indicator-1)',
    indicator2: 'var(--tm-chart-indicator-2)',
    indicator3: 'var(--tm-chart-indicator-3)',
    indicator4: 'var(--tm-chart-indicator-4)',
    indicator5: 'var(--tm-chart-indicator-5)',
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

const SectionHeader = ({ title, action }: { title: string; action?: React.ReactNode }) => (
    <div className="mb-[var(--tm-report-card-content-gap)] flex min-h-11 items-center justify-between gap-3">
        <h2 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">{title}</h2>
        {action}
    </div>
);

const getTrendAxisRange = (snapshot: MoralEducationCockpitSnapshot, metric: TrendMetric) => {
    if (metric !== 'averageScore') return {};
    const values = snapshot.trend.map(item => item.averageScore);
    const minimum = Math.floor(Math.min(...values) - 1);
    return { minValue: Math.max(0, minimum), maxValue: snapshot.summary.maxScore };
};

const MoralEducationCockpitView: React.FC<MoralEducationCockpitViewProps> = ({ onBack }) => {
    const [weekOptions, setWeekOptions] = useState<MoralEducationWeekOption[]>([]);
    const [selectedWeekId, setSelectedWeekId] = useState('');
    const [snapshot, setSnapshot] = useState<MoralEducationCockpitSnapshot | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [loadError, setLoadError] = useState('');
    const [reloadKey, setReloadKey] = useState(0);
    const [trendMetric, setTrendMetric] = useState<TrendMetric>('averageScore');
    const [isWeekSheetOpen, setIsWeekSheetOpen] = useState(false);
    const [isRankingSheetOpen, setIsRankingSheetOpen] = useState(false);
    const [rankingGradeId, setRankingGradeId] = useState('all');

    useEffect(() => {
        let disposed = false;
        getMoralEducationCockpitWeeks()
            .then(options => {
                if (disposed) return;
                setWeekOptions(options);
                setSelectedWeekId(current => current || options[options.length - 1]?.id || '');
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
        if (!selectedWeekId) return undefined;
        let disposed = false;
        setIsLoading(true);
        setLoadError('');
        setSnapshot(null);
        getMoralEducationCockpitSnapshot({ weekId: selectedWeekId })
            .then(data => {
                if (!disposed) setSnapshot(data);
            })
            .catch(() => {
                if (!disposed) setLoadError('德育评价数据加载失败，请稍后重试');
            })
            .finally(() => {
                if (!disposed) setIsLoading(false);
            });
        return () => {
            disposed = true;
        };
    }, [selectedWeekId, reloadKey]);

    const selectedWeekIndex = weekOptions.findIndex(item => item.id === selectedWeekId);
    const selectedWeek = weekOptions[selectedWeekIndex];
    const canGoPrevious = selectedWeekIndex > 0;
    const canGoNext = selectedWeekIndex >= 0 && selectedWeekIndex < weekOptions.length - 1;
    const scoreRange = snapshot ? snapshot.summary.highestScore - snapshot.summary.lowestScore : 0;
    const averageMarkerPosition = snapshot && scoreRange > 0
        ? Math.max(0, Math.min(100, ((snapshot.summary.averageScore - snapshot.summary.lowestScore) / scoreRange) * 100))
        : 50;
    const trendConfig = trendMetricConfig[trendMetric];
    const trendAxisRange = snapshot ? getTrendAxisRange(snapshot, trendMetric) : {};
    const filteredRanking = useMemo(() => {
        if (!snapshot) return [];
        if (rankingGradeId === 'all') return snapshot.classRanking;
        return snapshot.classRanking.filter(item => item.gradeId === rankingGradeId);
    }, [rankingGradeId, snapshot]);

    const changeWeek = (offset: number) => {
        const nextWeek = weekOptions[selectedWeekIndex + offset];
        if (nextWeek) setSelectedWeekId(nextWeek.id);
    };

    const openRankingSheet = () => {
        setRankingGradeId('all');
        setIsRankingSheetOpen(true);
    };

    return (
        <div
            className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)] text-[var(--tm-text-primary)]"
            style={teacherBrandCssVariables as React.CSSProperties}
        >
            <header className="relative z-40 flex h-11 shrink-0 items-center justify-between bg-[var(--tm-page-plain-header-bg)] px-4">
                <button
                    type="button"
                    onClick={onBack}
                    aria-label="返回"
                    className="-ml-2 flex h-10 w-10 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-muted)]"
                >
                    <ChevronLeft className="h-5 w-5" />
                </button>
                <h1 className="absolute left-1/2 -translate-x-1/2 text-[17px] font-bold tracking-normal">德育驾驶舱</h1>
                <div className="w-10" aria-hidden="true" />
            </header>

            <div className="relative min-h-0 flex-1 overflow-y-auto pb-8 no-scrollbar">
                <div className="sticky -top-px z-30 -mt-px bg-[var(--tm-page-plain-header-bg)] px-[var(--tm-report-page-inline)] pb-2 pt-1">
                    <div className="grid h-11 grid-cols-[44px_minmax(0,1fr)_44px] items-center">
                        <button
                            type="button"
                            onClick={() => changeWeek(-1)}
                            disabled={!canGoPrevious}
                            aria-label="上一考核周"
                            className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] disabled:opacity-30 active:bg-[var(--tm-bg-surface-muted)]"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsWeekSheetOpen(true)}
                            disabled={weekOptions.length === 0}
                            className="mx-auto flex min-h-11 min-w-0 max-w-full items-center justify-center gap-2 px-2 text-[14px] font-semibold tabular-nums text-[var(--tm-text-primary)]"
                        >
                            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--tm-brand-primary)]" />
                            <span className="truncate">{selectedWeek?.label ?? '加载中'}</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => changeWeek(1)}
                            disabled={!canGoNext}
                            aria-label="下一考核周"
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
                            <section className={reportCardClassName} aria-label="德育数据概况">
                                <SectionHeader title="数据概况" />
                                <div className="flex items-end gap-1">
                                    <span className="text-[38px] font-bold leading-none tabular-nums text-[var(--tm-text-primary)]">{snapshot.summary.averageScore}</span>
                                    <span className="pb-1 text-[14px] font-semibold text-[var(--tm-text-secondary)]">分</span>
                                    <span className="ml-2 pb-1 text-[12px] font-medium text-[var(--tm-text-secondary)]">平均得分</span>
                                </div>
                                <div className="mt-6">
                                    <div className="relative h-2 rounded-full bg-[var(--tm-bg-surface-muted)]">
                                        <span className="absolute inset-0 rounded-full bg-[var(--tm-brand-primary-soft-strong)]" aria-hidden="true" />
                                        <span
                                            className="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[var(--tm-bg-surface)] bg-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]"
                                            style={{ left: `${averageMarkerPosition}%` }}
                                            aria-hidden="true"
                                        />
                                    </div>
                                    <div className="mt-2 flex items-center justify-between text-[11px] text-[var(--tm-text-secondary)]">
                                        <span>最低 <strong className="ml-1 text-[13px] font-semibold tabular-nums text-[var(--tm-text-primary)]">{snapshot.summary.lowestScore}</strong></span>
                                        <span>最高 <strong className="ml-1 text-[13px] font-semibold tabular-nums text-[var(--tm-text-primary)]">{snapshot.summary.highestScore}</strong></span>
                                    </div>
                                </div>
                                <div className="mt-5 grid grid-cols-2 gap-6 border-t border-[var(--tm-border-subtle)] pt-4">
                                    <div>
                                        <div className="text-[20px] font-bold leading-none tabular-nums text-[var(--tm-chart-negative-text)]">-{snapshot.summary.cumulativeDeduction}分</div>
                                        <div className="mt-2 text-[11px] font-medium text-[var(--tm-text-secondary)]">累计扣分</div>
                                    </div>
                                    <div>
                                        <div className="text-[20px] font-bold leading-none tabular-nums text-[var(--tm-chart-warning-text)]">{snapshot.summary.issueCount}笔</div>
                                        <div className="mt-2 text-[11px] font-medium text-[var(--tm-text-secondary)]">问题记录</div>
                                    </div>
                                </div>
                            </section>

                            <section className={reportCardClassName}>
                                <SectionHeader
                                    title="班级排名"
                                    action={(
                                        <button
                                            type="button"
                                            onClick={openRankingSheet}
                                            className="flex min-h-11 items-center gap-0.5 text-[12px] font-semibold text-[var(--tm-brand-primary)]"
                                        >
                                            全部
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    )}
                                />
                                <div>
                                    {snapshot.classRanking.slice(0, 5).map(classItem => (
                                        <div key={classItem.id} className="grid min-h-[56px] grid-cols-[28px_minmax(0,1fr)_64px_58px] items-center gap-2 border-b border-[var(--tm-border-subtle)] text-[13px] last:border-b-0">
                                            <span className="text-center font-bold tabular-nums text-[var(--tm-text-disabled)]">{classItem.rank}</span>
                                            <span className="min-w-0 truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{classItem.name}</span>
                                            <span className="text-right text-[14px] font-bold tabular-nums text-[var(--tm-text-primary)]">{classItem.score}分</span>
                                            <span className="text-right text-[12px] tabular-nums text-[var(--tm-chart-negative-text)]">-{classItem.deduction}分</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className={reportCardClassName}>
                                <SectionHeader title="指标得分" />
                                <div className="space-y-1">
                                    {snapshot.dimensions.map(dimension => (
                                        <div key={dimension.id} className="flex min-h-[62px] items-center gap-3 px-1">
                                            <span className="h-9 w-1 shrink-0 rounded-full" style={{ backgroundColor: dimensionColorVariables[dimension.color] }} aria-hidden="true" />
                                            <span className="min-w-0 flex-1">
                                                <span className="flex items-center justify-between gap-3">
                                                    <span className="truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{dimension.name}</span>
                                                    <span className="shrink-0 text-[14px] font-bold tabular-nums text-[var(--tm-text-primary)]">{dimension.averageScore}/{dimension.maxScore}</span>
                                                </span>
                                                <span className="mt-2 block h-2 overflow-hidden rounded-full bg-[var(--tm-chart-grid)]">
                                                    <span className="block h-full rounded-full" style={{ width: `${(dimension.averageScore / dimension.maxScore) * 100}%`, backgroundColor: dimensionColorVariables[dimension.color] }} />
                                                </span>
                                                <span className="mt-1.5 flex items-center gap-3 text-[11px] text-[var(--tm-text-secondary)]">
                                                    <span>累计扣分 {dimension.deduction}</span>
                                                    <span>{dimension.issueCount}笔记录</span>
                                                </span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className={reportCardClassName}>
                                <SectionHeader title="扣分项目" />
                                <div>
                                    {snapshot.problems.map((problem, index) => (
                                        <div key={problem.id} className="grid min-h-[60px] grid-cols-[28px_minmax(0,1fr)_64px] items-center gap-2 border-b border-[var(--tm-border-subtle)] text-left last:border-b-0">
                                            <span className="text-center text-[13px] font-bold tabular-nums text-[var(--tm-text-disabled)]">{index + 1}</span>
                                            <span className="min-w-0">
                                                <span className="block truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{problem.indicator}</span>
                                                <span className="mt-1 block truncate text-[11px] text-[var(--tm-text-secondary)]">{problem.dimension} · {problem.affectedClassCount}个班级</span>
                                            </span>
                                            <span className="text-right">
                                                <span className="block text-[14px] font-bold tabular-nums text-[var(--tm-text-primary)]">{problem.recordCount}笔</span>
                                                <span className="mt-1 block text-[11px] tabular-nums text-[var(--tm-chart-negative-text)]">-{problem.deduction}分</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <section className={reportCardClassName}>
                                <SectionHeader
                                    title="近周趋势"
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
                                    ariaLabel={`${trendConfig.label}近周趋势`}
                                    categories={snapshot.trend.map(item => item.label)}
                                    series={[{
                                        name: trendConfig.label,
                                        values: snapshot.trend.map(item => item[trendMetric]),
                                        color: trendConfig.color,
                                    }]}
                                    optionKey={`${snapshot.week.id}-${trendMetric}`}
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
                open={isWeekSheetOpen}
                title="选择考核周期"
                onClose={() => setIsWeekSheetOpen(false)}
            >
                <div className="pb-2">
                    {[...weekOptions].reverse().map(week => {
                        const selected = week.id === selectedWeekId;
                        return (
                            <button
                                key={week.id}
                                type="button"
                                onClick={() => {
                                    setSelectedWeekId(week.id);
                                    setIsWeekSheetOpen(false);
                                }}
                                className="flex min-h-[56px] w-full items-center justify-between border-b border-[var(--tm-border-subtle)] text-left last:border-b-0"
                                aria-pressed={selected}
                            >
                                <span className={`text-[14px] tabular-nums ${selected ? 'font-semibold text-[var(--tm-brand-primary)]' : 'font-medium text-[var(--tm-text-primary)]'}`}>{week.label}</span>
                                {selected && <Check className="h-5 w-5 shrink-0 text-[var(--tm-brand-primary)]" />}
                            </button>
                        );
                    })}
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet
                open={isRankingSheetOpen}
                title="班级排名"
                onClose={() => setIsRankingSheetOpen(false)}
            >
                {snapshot && (
                    <>
                        <div className="-mx-4 overflow-x-auto px-4 pb-3 no-scrollbar">
                            <div className="flex min-w-max gap-2">
                                {[{ id: 'all', name: '全部' }, ...snapshot.grades].map(grade => {
                                    const selected = rankingGradeId === grade.id;
                                    return (
                                        <button
                                            key={grade.id}
                                            type="button"
                                            aria-pressed={selected}
                                            onClick={() => setRankingGradeId(grade.id)}
                                            className={`min-h-10 rounded-[var(--tm-radius-control)] px-4 text-[13px] font-semibold ${selected
                                                ? 'bg-[var(--tm-brand-primary)] text-white'
                                                : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]'}`}
                                        >
                                            {grade.name}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        <div className="pb-2">
                            {filteredRanking.map(classItem => (
                                <div key={classItem.id} className="grid min-h-[56px] grid-cols-[34px_minmax(0,1fr)_64px_58px] items-center gap-2 border-b border-[var(--tm-border-subtle)] text-[13px] last:border-b-0">
                                    <span className="font-semibold tabular-nums text-[var(--tm-text-disabled)]">{classItem.rank}</span>
                                    <span className="min-w-0 truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{classItem.name}</span>
                                    <span className="text-right font-bold tabular-nums text-[var(--tm-text-primary)]">{classItem.score}分</span>
                                    <span className="text-right tabular-nums text-[var(--tm-chart-negative-text)]">-{classItem.deduction}分</span>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </MobileBottomSheet>
        </div>
    );
};

export default MoralEducationCockpitView;
