import React, { useCallback, useMemo, useRef, useState } from 'react';
import {
    ArrowDownNarrowWide,
    ArrowUpDown,
    ArrowUpNarrowWide,
    CalendarRange,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    PencilLine,
    Quote,
    Triangle,
} from 'lucide-react';
import rankingCrownIcon from '../assets/resources/ranking-crown-icon.png';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import ClassReportIndicatorDrilldown, {
    type ClassReportIndicatorDrilldownMode,
} from '../components/report/ClassReportIndicatorDrilldown';
import RecordDistributionComparison, { RecordDistributionDetails } from '../components/report/RecordDistributionComparison';
import {
    TeacherReportBarChart,
    TeacherReportDonutChart,
    type TeacherReportBarSeries,
    type TeacherReportChartColor,
} from '../components/report/TeacherReportChart';
import {
    getEducationEventAnalysis,
    getEducationScoreAnalysis,
    getRecordDistributionAnalysis,
    getRecordDistributionComparisonRows,
    getRecordDistributionOverview,
    type ClassReportChartAnalysis,
} from '../domain/classReportChartSummary';
import {
    buildStudentCoverageRows,
    sortStudentCoverageRows,
    type StudentCoverageRow,
    type StudentCoverageSortDirection,
    type StudentCoverageSortKey,
} from '../domain/classStudentCoverage';
import {
    formatReportSourceRecordCount,
    formatReportSourceRecordCountAria,
    getPeriodForDays,
    getReportSourceRecordCount,
    getReportSourceOptions,
    getValidDaysInRange,
    resolveReportSourceKey,
    type ReportPeriodKey,
    type ReportSourceKey,
    type ReportTimeRange,
} from '../domain/classReportSource';
import { classReportIndicatorDemoPaths } from '../data/classReportIndicatorDemo';
import { buildClassReportIndicatorTree } from '../domain/classReportIndicatorTree';
import { ClassInfo, Student } from '../types';

interface ClassReportViewProps {
    classInfo: ClassInfo;
    students: Student[];
    currentTeacherName: string;
    onSelectStudent: (student: Student) => void;
}

type TimeRange = ReportTimeRange;
type EducationKey = 'all' | string;
type RankingMode = 'net' | 'progress';
type FocusTone = 'positive' | 'negative';

const indicatorChartColors: TeacherReportChartColor[] = [
    'indicator1',
    'indicator2',
    'indicator3',
    'indicator4',
    'indicator5',
    'indicator6',
];

const timeRangeTabs: { key: TimeRange; label: string }[] = [
    { key: 'day', label: '今日' },
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
    { key: 'semester', label: '本学期' },
    { key: 'custom', label: '自定义' },
];

const cardClass = 'rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]';
const inactiveConditionFilterClass = 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]';
const customDateInputClass = 'h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none transition-[border-color,background-color,box-shadow] [transition-duration:var(--tm-duration-standard)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:opacity-100 read-only:border-[var(--tm-input-readonly-border)] read-only:bg-[var(--tm-input-readonly-bg)] read-only:text-[var(--tm-input-readonly-text)]';

interface ReportSectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
}

const ReportSection = ({ id, title, children, action }: ReportSectionProps) => (
    <section aria-labelledby={id} className={`${cardClass} p-[var(--tm-report-card-padding)]`}>
        <div className="mb-[var(--tm-report-card-content-gap)] flex min-h-6 items-center justify-between gap-3">
            <h2 id={id} className="text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">
                {title}
            </h2>
            {action}
        </div>
        {children}
    </section>
);

const ChartAnalysis = ({ summary, supplement }: ClassReportChartAnalysis) => (
    <div
        role="note"
        aria-label="数据解析"
        className="relative mt-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3 py-3"
    >
        <Triangle
            aria-hidden="true"
            fill="currentColor"
            strokeWidth={0}
            className="absolute -top-2 left-1/2 h-3 w-4 -translate-x-1/2 text-[var(--tm-bg-surface-soft)]"
        />
        <div className="flex items-start gap-2">
            <Quote
                aria-hidden="true"
                fill="currentColor"
                strokeWidth={1.5}
                className="mt-0.5 h-4 w-4 shrink-0 text-[var(--tm-chart-data-default)]"
            />
            <div className="min-w-0">
                <p className="text-[var(--tm-font-size-body)] font-semibold leading-5 text-[var(--tm-text-primary)]">{summary}</p>
                {supplement && (
                    <p className="mt-1 text-[var(--tm-font-size-compact)] font-normal leading-5 text-[var(--tm-text-tertiary)]">{supplement}</p>
                )}
            </div>
        </div>
    </div>
);

const rankingCrownToneClasses = [
    'text-[var(--tm-brand-reward-strong)]',
    'text-[var(--tm-text-secondary)]',
    'text-[var(--tm-brand-secondary-strong)]',
] as const;

const RankingPosition = ({ position }: { position: number }) => {
    if (position > 3) {
        return (
            <span className="text-center text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">
                {position}
            </span>
        );
    }

    const toneClass = rankingCrownToneClasses[position - 1];
    return (
        <span role="img" aria-label={`第${position}名`} className={`relative flex h-7 w-7 items-center justify-center ${toneClass}`}>
            <span
                aria-hidden="true"
                className="absolute inset-0 h-7 w-7 bg-current"
                style={{
                    WebkitMaskImage: `url(${rankingCrownIcon})`,
                    maskImage: `url(${rankingCrownIcon})`,
                    WebkitMaskPosition: 'center',
                    maskPosition: 'center',
                    WebkitMaskRepeat: 'no-repeat',
                    maskRepeat: 'no-repeat',
                    WebkitMaskSize: 'contain',
                    maskSize: 'contain',
                }}
            />
            <span aria-hidden="true" className="relative pt-1 text-[10px] font-bold tabular-nums text-[var(--tm-text-inverse)]">
                {position}
            </span>
        </span>
    );
};

interface StudentCoverageListProps {
    rows: StudentCoverageRow[];
    sortKey: StudentCoverageSortKey;
    direction: StudentCoverageSortDirection;
    onSort: (sortKey: StudentCoverageSortKey) => void;
    onSelectStudent: (student: Student) => void;
}

interface FocusStudentRow {
    student: Student;
    score: number;
}

interface FocusStudentListProps {
    rows: FocusStudentRow[];
    tone: FocusTone;
    onSelectStudent: (student: Student) => void;
}

const FocusStudentList = ({ rows, tone, onSelectStudent }: FocusStudentListProps) => (
    <ol>
        {rows.map((row, index) => (
            <li
                key={row.student.id}
                className="grid min-h-[var(--tm-size-touch)] grid-cols-[20px_minmax(0,1fr)_auto] items-center gap-1 px-1"
            >
                <span className="text-center text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
                    {index + 1}
                </span>
                <button
                    type="button"
                    onClick={() => onSelectStudent(row.student)}
                    aria-label={`查看${row.student.name}学生详情`}
                    className="flex min-h-[var(--tm-size-touch)] min-w-0 items-center rounded-[6px] text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] transition-colors active:bg-[var(--tm-bg-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-input-focus-ring)]"
                >
                    <span className="truncate">{row.student.name}</span>
                </button>
                <span className={`text-[length:var(--tm-font-size-body)] font-semibold tabular-nums ${
                    tone === 'positive' ? 'text-[var(--tm-chart-positive-text)]' : 'text-[var(--tm-chart-negative-text)]'
                }`}>
                    {tone === 'positive' ? '+' : '-'}{row.score}
                </span>
            </li>
        ))}
    </ol>
);

const coverageSortColumns: { key: StudentCoverageSortKey; label: string }[] = [
    { key: 'evaluationCount', label: '评价次数' },
    { key: 'teacherCount', label: '评价老师数' },
];

const StudentCoverageList = ({
    rows,
    sortKey,
    direction,
    onSort,
    onSelectStudent,
}: StudentCoverageListProps) => (
    <div>
        <div
            className="grid min-h-[var(--tm-size-touch)] grid-cols-[minmax(0,1fr)_var(--tm-report-coverage-evaluation-column)_var(--tm-report-coverage-teacher-column)] items-center overflow-hidden rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[length:var(--tm-font-size-compact)] font-semibold"
            aria-label="学生覆盖排序"
        >
            <span role="columnheader" className="pl-[var(--tm-report-coverage-name-inset)] text-[var(--tm-text-primary)]">学生姓名</span>
            {coverageSortColumns.map(column => {
                const selected = sortKey === column.key;
                const nextDirection = selected && direction === 'asc' ? '从多到少' : '从少到多';
                return (
                    <span
                        key={column.key}
                        role="columnheader"
                        aria-sort={selected ? (direction === 'asc' ? 'ascending' : 'descending') : 'none'}
                        className="h-full"
                    >
                        <button
                            type="button"
                            aria-pressed={selected}
                            aria-label={selected
                                ? `${column.label}，当前${direction === 'asc' ? '从少到多' : '从多到少'}，点击切换为${nextDirection}`
                                : `按${column.label}从少到多排序`}
                            onClick={() => onSort(column.key)}
                            className={`flex h-full w-full items-center justify-center gap-1 px-1 font-semibold transition-[color,background-color,scale] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-muted)] ${
                                selected
                                    ? 'text-[var(--tm-brand-primary)]'
                                    : 'text-[var(--tm-text-secondary)]'
                            }`}
                        >
                            <span className="whitespace-nowrap">{column.label}</span>
                            {selected ? (
                                direction === 'asc'
                                    ? <ArrowUpNarrowWide aria-hidden="true" className="h-3 w-3 shrink-0" />
                                    : <ArrowDownNarrowWide aria-hidden="true" className="h-3 w-3 shrink-0" />
                            ) : (
                                <ArrowUpDown aria-hidden="true" className="h-3 w-3 shrink-0 text-[var(--tm-text-tertiary)]" />
                            )}
                        </button>
                    </span>
                );
            })}
        </div>
        <ul>
            {rows.map(row => {
                const evaluationMissing = row.evaluationCount === 0;
                const teacherMissing = row.teacherCount === 0;
                return (
                    <li key={row.student.id} className="border-b border-[var(--tm-border-subtle)] last:border-0">
                        <div className="grid min-h-[var(--tm-report-coverage-row-height)] grid-cols-[minmax(0,1fr)_var(--tm-report-coverage-evaluation-column)_var(--tm-report-coverage-teacher-column)] items-center">
                            <button
                                type="button"
                                onClick={() => onSelectStudent(row.student)}
                                aria-label={`查看${row.student.name}学生详情`}
                                className="flex min-h-[var(--tm-report-coverage-row-height)] min-w-0 items-center rounded-[6px] pl-[var(--tm-report-coverage-name-inset)] text-left text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] transition-colors active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-input-focus-ring)]"
                            >
                                <span className="truncate">{row.student.name}</span>
                            </button>
                            <span
                                aria-label={`评价${row.evaluationCount}次`}
                                className={`flex h-[var(--tm-report-coverage-value-height)] items-center justify-center text-[length:var(--tm-font-size-compact)] tabular-nums ${
                                    evaluationMissing
                                        ? 'font-semibold text-[var(--tm-chart-negative-text)]'
                                        : 'font-normal text-[var(--tm-text-secondary)]'
                                }`}
                            >
                                {row.evaluationCount}
                            </span>
                            <span
                                aria-label={`${row.teacherCount}位老师评价`}
                                className={`flex h-[var(--tm-report-coverage-value-height)] items-center justify-center text-[length:var(--tm-font-size-compact)] tabular-nums ${
                                    teacherMissing
                                        ? 'font-semibold text-[var(--tm-chart-negative-text)]'
                                        : 'font-normal text-[var(--tm-text-secondary)]'
                                }`}
                            >
                                {row.teacherCount}
                            </span>
                        </div>
                    </li>
                );
            })}
        </ul>
    </div>
);

const ClassReportView: React.FC<ClassReportViewProps> = ({
    classInfo,
    students,
    currentTeacherName,
    onSelectStudent,
}) => {
    const [reportSourceKey, setReportSourceKey] = useState<ReportSourceKey>('all');
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [draftCustomRange, setDraftCustomRange] = useState({ start: '', end: '' });
    const [appliedCustomRange, setAppliedCustomRange] = useState<{ start: string; end: string; days: number } | null>(null);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [rankingMode, setRankingMode] = useState<RankingMode>('net');
    const [activeEducation, setActiveEducation] = useState<EducationKey>('all');
    const [showAllRanking, setShowAllRanking] = useState(false);
    const [coverageSortKey, setCoverageSortKey] = useState<StudentCoverageSortKey>('evaluationCount');
    const [coverageSortDirection, setCoverageSortDirection] = useState<StudentCoverageSortDirection>('asc');
    const [showAllCoverage, setShowAllCoverage] = useState(false);
    const [showRecordDistributionDetails, setShowRecordDistributionDetails] = useState(false);
    const [indicatorDrilldown, setIndicatorDrilldown] = useState<{
        mode: ClassReportIndicatorDrilldownMode;
        initialPath: string[];
    } | null>(null);
    const [lastIndicatorRootByMode, setLastIndicatorRootByMode] = useState<Record<ClassReportIndicatorDrilldownMode, string | null>>({
        score: null,
        event: null,
    });
    const [isFilterPinned, setIsFilterPinned] = useState(false);
    const [resolvedReportPeriod, setResolvedReportPeriod] = useState<ReportPeriodKey>('week');
    const sourceScrollerRef = useRef<HTMLDivElement>(null);

    const totalStudents = students.length || classInfo.studentCount;
    const periodMultiplier: Record<Exclude<TimeRange, 'custom'>, number> = {
        day: 0.2,
        week: 1,
        month: 4,
        semester: 18,
    };
    const selectedPeriodMultiplier = timeRange === 'custom'
        ? appliedCustomRange == null
            ? periodMultiplier[resolvedReportPeriod]
            : Math.max(0.2, appliedCustomRange.days / 7)
        : periodMultiplier[timeRange];
    const currentPeriodRecordCount = Math.max(0, Math.round(447 * selectedPeriodMultiplier));
    const reportSourceOptions = useMemo(
        () => getReportSourceOptions(resolvedReportPeriod).map(source => ({
            ...source,
            recordCount: getReportSourceRecordCount(source, currentPeriodRecordCount),
        })),
        [currentPeriodRecordCount, resolvedReportPeriod],
    );
    const activeReportSource = reportSourceOptions.find(source => source.key === reportSourceKey) ?? reportSourceOptions[0];

    const reportData = useMemo(() => {
        const dataMultiplier = selectedPeriodMultiplier * activeReportSource.recordShare;
        const totalRecords = activeReportSource.key === 'all'
            ? currentPeriodRecordCount
            : activeReportSource.recordCount;
        const positiveRecords = Math.round(totalRecords * 0.84);
        const negativeRecords = totalRecords - positiveRecords;
        const coverageBase = activeReportSource.key === 'all'
            ? Math.min(1, 0.5 + selectedPeriodMultiplier * 0.14 + 0.32)
            : totalRecords === 0
                ? 0
                : Math.min(0.82, 0.38 + selectedPeriodMultiplier * 0.12 + activeReportSource.recordShare * 0.5);
        const coveredStudents = Math.min(totalStudents, Math.round(totalStudents * coverageBase));
        const previousRecords = Math.max(0, Math.round(totalRecords * 0.78));
        const previousPositiveRecords = Math.round(previousRecords * 0.76);
        const previousNegativeRecords = previousRecords - previousPositiveRecords;
        const gradeAverageRecords = Math.max(0, Math.round(totalRecords * 1.08));
        const gradeAveragePositiveRecords = Math.round(gradeAverageRecords * 0.82);
        const gradeAverageNegativeRecords = gradeAverageRecords - gradeAveragePositiveRecords;
        const previousCovered = Math.max(0, Math.min(totalStudents, coveredStudents - Math.max(0, Math.round(totalStudents * 0.04))));

        const indicatorTree = buildClassReportIndicatorTree(classReportIndicatorDemoPaths, totalRecords);
        const educationEvents = indicatorTree.map((node, index) => ({
            key: node.id,
            label: node.label,
            color: indicatorChartColors[index % indicatorChartColors.length],
            value: node.metrics.eventCount,
        }));
        const addScores = indicatorTree.map(node => node.metrics.addScore);
        const deductScores = indicatorTree.map(node => node.metrics.deductScore);
        const netScores = indicatorTree.map(node => node.metrics.netScore);

        return {
            totalRecords,
            positiveRecords,
            negativeRecords,
            previousPositiveRecords,
            previousNegativeRecords,
            gradeAveragePositiveRecords,
            gradeAverageNegativeRecords,
            coveredStudents,
            previousRecords,
            previousCovered,
            dataMultiplier,
            indicatorTree,
            educationEvents,
            addScores,
            deductScores,
            netScores,
        };
    }, [activeReportSource, currentPeriodRecordCount, selectedPeriodMultiplier, totalStudents]);

    const recordDistributionRows = useMemo(() => getRecordDistributionComparisonRows({
        positive: reportData.positiveRecords,
        negative: reportData.negativeRecords,
        previousPositive: reportData.previousPositiveRecords,
        previousNegative: reportData.previousNegativeRecords,
        gradeAveragePositive: reportData.gradeAveragePositiveRecords,
        gradeAverageNegative: reportData.gradeAverageNegativeRecords,
    }), [reportData]);

    const recordDistributionOverview = useMemo(() => getRecordDistributionOverview({
        positive: reportData.positiveRecords,
        negative: reportData.negativeRecords,
    }), [reportData.negativeRecords, reportData.positiveRecords]);

    const educationScoreSeries = useMemo<TeacherReportBarSeries[]>(() => [
        { name: '加分', values: reportData.addScores, color: 'positive' },
        { name: '扣分', values: reportData.deductScores, color: 'negative' },
        { name: '总分', values: reportData.netScores, color: 'data' },
    ], [reportData]);

    const recordDistributionAnalysis = useMemo(() => getRecordDistributionAnalysis({
        positive: reportData.positiveRecords,
        negative: reportData.negativeRecords,
        previousPositive: reportData.previousPositiveRecords,
        previousNegative: reportData.previousNegativeRecords,
        gradeAveragePositive: reportData.gradeAveragePositiveRecords,
        gradeAverageNegative: reportData.gradeAverageNegativeRecords,
    }), [reportData]);

    const educationScoreAnalysis = useMemo(() => getEducationScoreAnalysis(
        reportData.indicatorTree.map((item, index) => ({
            label: item.label,
            addScore: reportData.addScores[index],
            deductScore: reportData.deductScores[index],
            netScore: reportData.netScores[index],
        })),
    ), [reportData]);

    const educationEventAnalysis = useMemo(() => getEducationEventAnalysis(
        reportData.educationEvents.map(item => ({ label: item.label, value: item.value })),
    ), [reportData]);

    const rankingRows = useMemo(() => {
        const previousPeriodRatio = reportData.totalRecords > 0
            ? reportData.previousRecords / reportData.totalRecords
            : 0;
        const rows = students.map((student, index) => {
            const plus = Math.max(6, Math.round((58 - index * 0.8) * Math.max(0.5, reportData.dataMultiplier)));
            const minus = index % 4 === 0 ? Math.round((index + 3) * Math.max(0.3, reportData.dataMultiplier)) : 0;
            const net = plus - minus;
            const previousPlus = Math.round(plus * previousPeriodRatio);
            const previousMinus = Math.round(minus * previousPeriodRatio);
            return {
                student,
                plus,
                minus,
                net,
                progress: net - (previousPlus - previousMinus),
            };
        });

        return rows.sort((a, b) => (
            rankingMode === 'net' ? b.net - a.net : b.progress - a.progress
        ));
    }, [rankingMode, reportData.dataMultiplier, reportData.previousRecords, reportData.totalRecords, students]);

    const focusRows = useMemo(() => {
        const dimensionOffset = Math.max(0, reportData.indicatorTree.findIndex(item => item.id === activeEducation));
        const orderedStudents = [...students].sort((a, b) => a.id.localeCompare(b.id));
        const rotatedStudents = orderedStudents.map((_, index) => orderedStudents[(index + dimensionOffset * 3) % orderedStudents.length]);

        return {
            positive: rotatedStudents.slice(0, 10).map((student, index) => ({
                student,
                score: Math.max(8, Math.round((56 - index * 2) * Math.max(0.5, reportData.dataMultiplier))),
            })),
            negative: [...rotatedStudents].reverse().slice(0, 10).map((student, index) => ({
                student,
                score: Math.max(1, Math.round((14 - index) * Math.max(0.4, reportData.dataMultiplier))),
            })),
        };
    }, [activeEducation, reportData.dataMultiplier, reportData.indicatorTree, students]);

    const openIndicatorDrilldown = useCallback((
        mode: ClassReportIndicatorDrilldownMode,
        selectedLabel?: string,
    ) => {
        const selectedNode = selectedLabel
            ? reportData.indicatorTree.find(node => node.label === selectedLabel)
            : reportData.indicatorTree.find(node => node.id === lastIndicatorRootByMode[mode])
                ?? reportData.indicatorTree[0];
        if (!selectedNode) return;

        setLastIndicatorRootByMode(current => ({ ...current, [mode]: selectedNode.id }));
        setIndicatorDrilldown({ mode, initialPath: [selectedNode.id] });
    }, [lastIndicatorRootByMode, reportData.indicatorTree]);

    const visibleRankingRows = showAllRanking ? rankingRows : rankingRows.slice(0, 10);
    const studentCoverageRows = useMemo(() => buildStudentCoverageRows({
        students,
        coveredStudentCount: reportData.coveredStudents,
        totalEvaluationCount: reportData.totalRecords,
        maxTeacherCount: reportSourceKey === 'all'
            ? Math.min(8, Math.max(1, Math.round(3 + Math.log2(Math.max(1, reportData.dataMultiplier)))))
            : 1,
    }), [reportData.coveredStudents, reportData.dataMultiplier, reportData.totalRecords, reportSourceKey, students]);
    const sortedCoverageRows = useMemo(() => sortStudentCoverageRows(
        studentCoverageRows,
        coverageSortKey,
        coverageSortDirection,
    ), [coverageSortDirection, coverageSortKey, studentCoverageRows]);
    const visibleCoverageRows = sortedCoverageRows.slice(0, 10);
    const coveredStudentCount = studentCoverageRows.filter(row => row.evaluationCount > 0).length;
    const handleCoverageSort = (nextSortKey: StudentCoverageSortKey) => {
        if (nextSortKey === coverageSortKey) {
            setCoverageSortDirection(current => current === 'asc' ? 'desc' : 'asc');
            return;
        }
        setCoverageSortKey(nextSortKey);
        setCoverageSortDirection('asc');
    };
    const handleReportScroll = useCallback((event: React.UIEvent<HTMLDivElement>) => {
        const nextPinned = event.currentTarget.scrollTop > 12;
        setIsFilterPinned(current => (current === nextPinned ? current : nextPinned));
    }, []);

    const centerSourceAfterPeriodChange = (sourceKey: ReportSourceKey) => {
        requestAnimationFrame(() => {
            const sourceScroller = sourceScrollerRef.current;
            const sourceButton = sourceScroller?.querySelector<HTMLElement>(`[data-report-source-key="${sourceKey}"]`);
            if (!sourceScroller || !sourceButton) return;
            const centeredLeft = sourceButton.offsetLeft - (sourceScroller.clientWidth - sourceButton.offsetWidth) / 2;
            sourceScroller.scrollTo({ left: Math.max(0, centeredLeft), behavior: 'smooth' });
        });
    };

    const applyReportPeriod = (nextPeriod: ReportPeriodKey) => {
        const nextSourceOptions = getReportSourceOptions(nextPeriod);
        const nextSourceKey = resolveReportSourceKey(nextSourceOptions, reportSourceKey);
        setResolvedReportPeriod(nextPeriod);
        if (nextSourceKey !== reportSourceKey) setReportSourceKey(nextSourceKey);
        centerSourceAfterPeriodChange(nextSourceKey);
    };

    const openCustomDatePicker = () => {
        setDraftCustomRange(appliedCustomRange == null
            ? customRange
            : { start: appliedCustomRange.start, end: appliedCustomRange.end });
        setShowCustomDatePicker(true);
    };

    const handleTimeRangeChange = (nextTimeRange: TimeRange) => {
        if (nextTimeRange === 'custom') {
            openCustomDatePicker();
            return;
        }
        setTimeRange(nextTimeRange);
        applyReportPeriod(nextTimeRange);
    };

    const applyCustomRange = () => {
        const nextDays = getValidDaysInRange(draftCustomRange.start, draftCustomRange.end);
        if (nextDays == null) return;
        setCustomRange(draftCustomRange);
        setAppliedCustomRange({ ...draftCustomRange, days: nextDays });
        setTimeRange('custom');
        applyReportPeriod(getPeriodForDays(nextDays));
        setShowCustomDatePicker(false);
    };

    const draftCustomRangeDays = getValidDaysInRange(draftCustomRange.start, draftCustomRange.end);
    const customRangeError = draftCustomRange.start && draftCustomRange.end && draftCustomRangeDays == null
        ? '结束日期不能早于开始日期'
        : null;

    const appliedPeriodKey = timeRange === 'custom' && appliedCustomRange != null
        ? `custom-${appliedCustomRange.start}-${appliedCustomRange.end}`
        : resolvedReportPeriod;
    const reportKey = `${reportSourceKey}-${appliedPeriodKey}`;

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent text-[var(--tm-text-primary)]">
            <div className="min-h-0 flex-1 overflow-y-auto pb-8 no-scrollbar" onScroll={handleReportScroll}>
                <header className={`sticky top-0 z-30 border-b bg-[var(--tm-page-plain-header-bg)] transition-[border-color,box-shadow] [transition-duration:var(--tm-duration-panel)] ease-out motion-reduce:duration-0 ${
                    isFilterPinned
                        ? 'border-[var(--tm-border-subtle)] [box-shadow:var(--tm-shadow-control)]'
                        : 'border-transparent'
                }`}>
                    <div className={`px-[var(--tm-report-page-inline)] transition-[padding] [transition-duration:var(--tm-duration-panel)] ease-out motion-reduce:duration-0 ${
                        isFilterPinned
                            ? 'py-[var(--tm-report-filter-padding-pinned)]'
                            : 'pb-[var(--tm-report-filter-padding-bottom)] pt-[var(--tm-report-filter-padding-top)]'
                    }`}>
                        <div>
                            <div className="grid h-[var(--tm-size-touch)] grid-cols-5" role="group" aria-label="报告时间范围">
                                {timeRangeTabs.map(item => (
                                    <button
                                        key={item.key}
                                        type="button"
                                        aria-pressed={timeRange === item.key}
                                        onClick={() => handleTimeRangeChange(item.key)}
                                        className={`relative flex h-full min-w-0 items-center justify-center whitespace-nowrap px-[var(--tm-space-1)] text-[length:var(--tm-font-size-body)] transition-[color,scale] [transition-duration:var(--tm-duration-standard)] active:scale-[0.96] motion-reduce:transform-none ${
                                            timeRange === item.key
                                                ? 'font-semibold text-[var(--tm-brand-primary)]'
                                                : 'font-medium text-[var(--tm-text-secondary)] active:text-[var(--tm-text-primary)]'
                                        }`}
                                    >
                                        <span>{item.label}</span>
                                        <span
                                            aria-hidden="true"
                                            className={`absolute bottom-0 left-1/2 h-[var(--tm-report-date-indicator-height)] w-[var(--tm-report-date-indicator-width)] -translate-x-1/2 rounded-full bg-[var(--tm-brand-primary)] transition-opacity [transition-duration:var(--tm-duration-standard)] ${
                                                timeRange === item.key ? 'opacity-100' : 'opacity-0'
                                            }`}
                                        />
                                    </button>
                                ))}
                            </div>
                            {timeRange === 'custom' && appliedCustomRange && (
                                <div
                                    aria-label={`当前自定义日期范围：${appliedCustomRange.start}至${appliedCustomRange.end}`}
                                    className="-mx-[var(--tm-report-page-inline)] flex h-[var(--tm-report-custom-range-height)] items-center justify-between gap-0.5 bg-[var(--tm-bg-surface-soft)] px-[var(--tm-report-page-inline)]"
                                >
                                    <div className="flex min-w-0 items-center gap-1">
                                        <CalendarRange aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[var(--tm-text-secondary)]" />
                                        <span className="shrink-0 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">
                                            自定义时间：
                                        </span>
                                        <strong className="truncate text-[length:var(--tm-font-size-compact)] font-semibold tabular-nums text-[var(--tm-text-primary)]">
                                            {appliedCustomRange.start} 至 {appliedCustomRange.end}
                                        </strong>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={openCustomDatePicker}
                                        aria-label="修改自定义日期范围"
                                        className="relative flex h-8 shrink-0 items-center gap-0.5 rounded-full bg-[var(--tm-bg-surface)] px-1.5 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)] transition-[color,scale] [transition-duration:var(--tm-duration-standard)] after:absolute after:-inset-y-1.5 after:inset-x-0 active:scale-[0.96] active:text-[var(--tm-text-primary)] motion-reduce:transform-none"
                                    >
                                        修改日期
                                        <PencilLine aria-hidden="true" className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                        <div
                            ref={sourceScrollerRef}
                            className="-mx-[var(--tm-report-page-inline)] overflow-x-auto pb-[var(--tm-report-source-padding-bottom)] pt-[var(--tm-report-source-padding-top)] no-scrollbar"
                            role="tablist"
                            aria-label="当前日期范围的数据来源"
                        >
                            <div className="flex min-w-max items-center gap-[var(--tm-report-source-item-gap)] px-[var(--tm-report-source-list-inline)]">
                                {reportSourceOptions.map(item => {
                                    const selected = reportSourceKey === item.key;
                                    const isTeacherSource = item.key !== 'all';
                                    const displayedRecordCount = formatReportSourceRecordCount(item.recordCount);
                                    const accessibleRecordCount = formatReportSourceRecordCountAria(item.recordCount);

                                    return (
                                        <button
                                            key={item.key}
                                            type="button"
                                            role="tab"
                                            aria-selected={selected}
                                            aria-controls="class-report-content"
                                            aria-label={item.key === 'all'
                                                ? item.label
                                                : item.key === 'mine'
                                                    ? `我的记录，${currentTeacherName}，${accessibleRecordCount}`
                                                    : `${item.label}，${accessibleRecordCount}`}
                                            data-report-source-key={item.key}
                                            onClick={() => {
                                                setReportSourceKey(item.key);
                                                centerSourceAfterPeriodChange(item.key);
                                            }}
                                            className="flex h-[var(--tm-size-touch)] shrink-0 items-center whitespace-nowrap text-[length:var(--tm-font-size-compact)]"
                                        >
                                            <span className={`inline-flex h-[var(--tm-report-source-pill-height)] items-center rounded-full transition-[background-color,color,box-shadow,scale] [transition-duration:var(--tm-duration-standard)] active:scale-[0.96] motion-reduce:transform-none ${
                                                selected
                                                    ? 'bg-[var(--tm-brand-primary)] px-[var(--tm-report-source-pill-inline)] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)] active:bg-[var(--tm-brand-primary-pressed)]'
                                                    : 'px-[var(--tm-report-source-item-inline)] font-medium text-[var(--tm-text-secondary)] active:text-[var(--tm-text-primary)]'
                                            }`}>
                                                {item.label}
                                                {isTeacherSource && (
                                                    <span className={`ml-0.5 text-[length:var(--tm-font-size-badge)] font-medium tabular-nums ${
                                                        selected ? 'text-[var(--tm-text-inverse)]' : 'text-[var(--tm-text-tertiary)]'
                                                    }`}>
                                                        ({displayedRecordCount})
                                                    </span>
                                                )}
                                            </span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </header>

            <div
                id="class-report-content"
                className="space-y-[var(--tm-report-card-gap)] px-[var(--tm-report-page-inline)] pt-[var(--tm-report-card-gap)]"
            >
                <ReportSection id="class-report-overview-title" title="概况">
                    <div className="grid grid-cols-2">
                        <div className="border-r border-[var(--tm-border-subtle)] pr-4">
                            <div className="text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">评价记录</div>
                            <div className="mt-2 flex items-baseline gap-1">
                                <strong className="text-[var(--tm-font-size-metric)] leading-none">{reportData.totalRecords}</strong>
                                <span className="text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">条</span>
                            </div>
                            <div className="mt-2 text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
                                上周期 {reportData.previousRecords}条
                            </div>
                        </div>
                        <div className="pl-4">
                            <div className="text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">覆盖学生</div>
                            <div className="mt-2 flex items-baseline gap-1">
                                <strong className="text-[var(--tm-font-size-metric)] leading-none">{reportData.coveredStudents}</strong>
                                <span className="text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">人</span>
                            </div>
                            <div className="mt-2 text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
                                上周期 {reportData.previousCovered}人
                            </div>
                        </div>
                    </div>
                </ReportSection>

                <ReportSection
                    id="record-distribution-title"
                    title="评价记录分布"
                    action={(
                        <button
                            type="button"
                            onClick={() => setShowRecordDistributionDetails(true)}
                            className="-my-2 flex min-h-[var(--tm-size-touch)] items-center gap-0.5 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-brand-primary)] transition active:text-[var(--tm-brand-primary-pressed)]"
                            aria-label="查看评价记录对比详情"
                        >
                            对比详情
                            <ChevronRight aria-hidden="true" className="h-4 w-4" />
                        </button>
                    )}
                >
                    <RecordDistributionComparison overview={recordDistributionOverview} />
                    <ChartAnalysis {...recordDistributionAnalysis} />
                </ReportSection>

                <ReportSection
                    id="education-score-title"
                    title="五育得分分布"
                    action={(
                        <button
                            type="button"
                            onClick={() => openIndicatorDrilldown('score')}
                            className="-my-2 flex min-h-[var(--tm-size-touch)] items-center gap-0.5 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-brand-primary)] transition-colors active:text-[var(--tm-brand-primary-pressed)]"
                            aria-label="查看五育得分二级和三级指标明细"
                        >
                            查看明细
                            <ChevronRight aria-hidden="true" className="h-4 w-4" />
                        </button>
                    )}
                >
                    <TeacherReportBarChart
                        ariaLabel={`${reportData.indicatorTree.map(item => item.label).join('、')}的加分、扣分与总分对比`}
                        categories={reportData.indicatorTree.map(item => item.label)}
                        series={educationScoreSeries}
                        optionKey={`scores-${reportKey}`}
                        className="h-64"
                        onCategorySelect={label => openIndicatorDrilldown('score', label)}
                    />
                    <ChartAnalysis {...educationScoreAnalysis} />
                </ReportSection>

                <ReportSection
                    id="education-event-title"
                    title="五育事件分布"
                    action={(
                        <button
                            type="button"
                            onClick={() => openIndicatorDrilldown('event')}
                            className="-my-2 flex min-h-[var(--tm-size-touch)] items-center gap-0.5 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-brand-primary)] transition-colors active:text-[var(--tm-brand-primary-pressed)]"
                            aria-label="查看五育事件二级和三级指标明细"
                        >
                            查看明细
                            <ChevronRight aria-hidden="true" className="h-4 w-4" />
                        </button>
                    )}
                >
                    <TeacherReportDonutChart
                        ariaLabel={`${reportData.indicatorTree.map(item => item.label).join('、')}的评价事件占比`}
                        data={reportData.educationEvents.map(item => ({
                            name: item.label,
                            value: item.value,
                            color: item.color,
                        }))}
                        optionKey={`events-${reportKey}`}
                        className="h-64"
                        onCategorySelect={label => openIndicatorDrilldown('event', label)}
                    />
                    <ChartAnalysis {...educationEventAnalysis} />
                </ReportSection>

                <ReportSection id="ranking-title" title="积分排行">
                    <div>
                        <div className="mb-3 grid h-11 grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)]" role="tablist" aria-label="积分排行类型">
                            {([
                                { key: 'net' as const, label: '总分' },
                                { key: 'progress' as const, label: '进步幅度' },
                            ]).map(item => (
                                <button
                                    key={item.key}
                                    type="button"
                                    role="tab"
                                    aria-selected={rankingMode === item.key}
                                    onClick={() => setRankingMode(item.key)}
                                    className="flex h-[var(--tm-size-touch)] items-center p-1 text-[var(--tm-font-size-compact)] font-semibold"
                                >
                                    <span className={`flex h-9 w-full items-center justify-center rounded-[calc(var(--tm-radius-control)-4px)] transition-all duration-200 ${
                                        rankingMode === item.key
                                            ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]'
                                            : 'text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'
                                    }`}>
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <ol id="class-ranking-list">
                            {visibleRankingRows.map((row, index) => (
                                <li key={row.student.id} className="border-b border-[var(--tm-border-subtle)] last:border-0">
                                    <button
                                        type="button"
                                        onClick={() => onSelectStudent(row.student)}
                                        className="grid min-h-11 w-full grid-cols-[28px_1fr_auto] items-center gap-2 rounded-[8px] px-2 text-left transition active:bg-[var(--tm-bg-surface-soft)]"
                                    >
                                        <RankingPosition position={index + 1} />
                                        <span className="truncate text-[var(--tm-font-size-body)] font-medium">{row.student.name}</span>
                                        <span className={`text-[var(--tm-font-size-body)] font-semibold ${
                                            (rankingMode === 'net' ? row.net : row.progress) >= 0
                                                ? 'text-[var(--tm-chart-positive-text)]'
                                                : 'text-[var(--tm-chart-negative-text)]'
                                        }`}>
                                            {rankingMode === 'net'
                                                ? `${row.net >= 0 ? '+' : ''}${row.net}`
                                                : `${row.progress >= 0 ? '+' : ''}${row.progress}`}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                        {rankingRows.length > 10 && (
                            <button
                                type="button"
                                onClick={() => setShowAllRanking(value => !value)}
                                aria-expanded={showAllRanking}
                                aria-controls="class-ranking-list"
                                className="mt-2 flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-1 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] transition active:bg-[var(--tm-bg-surface-muted)]"
                            >
                                {showAllRanking ? '收起排行' : `查看全部${rankingRows.length}名`}
                                {showAllRanking ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                        )}
                    </div>
                </ReportSection>

                <ReportSection id="attention-students-title" title="需要关注">
                    <div>
                        <div className="mb-3 flex gap-2 overflow-x-auto py-1 no-scrollbar" aria-label="需要关注维度">
                            {[{ id: 'all', label: '全部' }, ...reportData.indicatorTree].map(item => (
                                <button
                                    key={item.id}
                                    type="button"
                                    aria-pressed={activeEducation === item.id}
                                    onClick={() => setActiveEducation(item.id)}
                                    className="flex h-[var(--tm-size-touch)] min-w-[60px] shrink-0 items-center justify-center"
                                >
                                    <span className={`flex h-8 w-full items-center justify-center rounded-[8px] border px-3 text-[var(--tm-font-size-compact)] font-semibold transition-colors duration-200 ${
                                        activeEducation === item.id
                                            ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)]'
                                            : inactiveConditionFilterClass
                                    }`}>
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="min-w-0 rounded-[var(--tm-radius-control)] bg-[var(--tm-chart-positive-soft)] px-[var(--tm-space-1)] py-[var(--tm-space-2)]">
                                <div className="flex h-10 items-center justify-between gap-0.5 border-b border-[var(--tm-border-subtle)] text-[var(--tm-chart-positive-text)]">
                                    <span className="min-w-0 whitespace-nowrap">
                                        <span className="text-[length:var(--tm-font-size-body)] font-bold">加分TOP10</span>
                                    </span>
                                    <span className="shrink-0 whitespace-nowrap text-[length:var(--tm-font-size-badge)] font-medium">表现突出</span>
                                </div>
                                <FocusStudentList rows={focusRows.positive} tone="positive" onSelectStudent={onSelectStudent} />
                            </div>
                            <div className="min-w-0 rounded-[var(--tm-radius-control)] bg-[var(--tm-chart-negative-soft)] px-[var(--tm-space-1)] py-[var(--tm-space-2)]">
                                <div className="flex h-10 items-center justify-between gap-0.5 border-b border-[var(--tm-border-subtle)] text-[var(--tm-chart-negative-text)]">
                                    <span className="min-w-0 whitespace-nowrap">
                                        <span className="text-[length:var(--tm-font-size-body)] font-bold">扣分TOP10</span>
                                    </span>
                                    <span className="shrink-0 whitespace-nowrap text-[length:var(--tm-font-size-badge)] font-medium">需关注</span>
                                </div>
                                <FocusStudentList rows={focusRows.negative} tone="negative" onSelectStudent={onSelectStudent} />
                            </div>
                        </div>
                    </div>
                </ReportSection>

                <ReportSection
                    id="student-coverage-title"
                    title="学生覆盖情况"
                    action={(
                        <span className="rounded-full bg-[var(--tm-chart-data-default-soft)] px-2.5 py-1 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-chart-data-default-text)]">
                            已覆盖{' '}
                            <strong className="font-semibold tabular-nums">
                                {coveredStudentCount}/{totalStudents}
                            </strong>
                        </span>
                    )}
                >
                    <StudentCoverageList
                        rows={visibleCoverageRows}
                        sortKey={coverageSortKey}
                        direction={coverageSortDirection}
                        onSort={handleCoverageSort}
                        onSelectStudent={onSelectStudent}
                    />
                    {sortedCoverageRows.length > 10 && (
                        <button
                            type="button"
                            onClick={() => setShowAllCoverage(true)}
                            className="mt-1 flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-1 text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] transition-colors active:text-[var(--tm-brand-primary-pressed)]"
                        >
                            查看全部{sortedCoverageRows.length}名学生
                            <ChevronRight aria-hidden="true" className="h-4 w-4" />
                        </button>
                    )}
                </ReportSection>
            </div>
            </div>

            <MobileBottomSheet
                open={showCustomDatePicker}
                title="选择日期范围"
                onClose={() => setShowCustomDatePicker(false)}
                footer={(
                    <button
                        type="button"
                        disabled={draftCustomRangeDays == null}
                        onClick={applyCustomRange}
                        className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] transition-[background-color,opacity,scale] [transition-duration:var(--tm-duration-standard)] active:scale-[0.96] active:bg-[var(--tm-brand-primary-pressed)] disabled:opacity-40 disabled:active:scale-100 motion-reduce:transform-none"
                    >
                        应用日期
                    </button>
                )}
            >
                <div className="space-y-[var(--tm-space-4)] pb-[var(--tm-space-2)]">
                    <label className="block">
                        <span className="mb-2 block text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">开始日期</span>
                        <input
                            type="date"
                            aria-label="开始日期"
                            value={draftCustomRange.start}
                            onInput={event => {
                                const value = event.currentTarget.value;
                                setDraftCustomRange(current => ({ ...current, start: value }));
                            }}
                            className={customDateInputClass}
                        />
                    </label>
                    <label className="block">
                        <span className="mb-2 block text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">结束日期</span>
                        <input
                            type="date"
                            aria-label="结束日期"
                            value={draftCustomRange.end}
                            onInput={event => {
                                const value = event.currentTarget.value;
                                setDraftCustomRange(current => ({ ...current, end: value }));
                            }}
                            className={customDateInputClass}
                        />
                    </label>
                    {customRangeError && (
                        <p role="alert" className="text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-status-negative)]">
                            {customRangeError}
                        </p>
                    )}
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet
                open={showRecordDistributionDetails}
                title="评价记录对比"
                onClose={() => setShowRecordDistributionDetails(false)}
            >
                <RecordDistributionDetails rows={recordDistributionRows} />
            </MobileBottomSheet>

            <ClassReportIndicatorDrilldown
                open={indicatorDrilldown != null}
                mode={indicatorDrilldown?.mode ?? 'score'}
                roots={reportData.indicatorTree}
                initialPath={indicatorDrilldown?.initialPath}
                onClose={() => setIndicatorDrilldown(null)}
                onRootChange={rootId => setLastIndicatorRootByMode(current => ({
                    ...current,
                    [indicatorDrilldown?.mode ?? 'score']: rootId,
                }))}
            />

            <MobileBottomSheet
                open={showAllCoverage}
                title="全部学生覆盖情况"
                onClose={() => setShowAllCoverage(false)}
            >
                <StudentCoverageList
                    rows={sortedCoverageRows}
                    sortKey={coverageSortKey}
                    direction={coverageSortDirection}
                    onSort={handleCoverageSort}
                    onSelectStudent={onSelectStudent}
                />
            </MobileBottomSheet>
        </div>
    );
};

export default ClassReportView;
