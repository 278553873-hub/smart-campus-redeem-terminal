import { classReportColorPreviewStyle } from '../styles/teacherMobileTokens';
import ReportSectionLayout from '../components/report/ReportSectionLayout';
import type { ClassReportOutlineItem } from '../../shared/classReportOutline';
import MobileDatePickerSheet, { type MobileDateRange } from '../components/ui/MobileDatePickerSheet';
import { currentTermToDateRange, localToday } from '../components/ui/mobileDatePickerModel';
import React, { useCallback, useId, useMemo, useRef, useState } from 'react';
import {
    ArrowDownNarrowWide,
    ArrowUpDown,
    ArrowUpNarrowWide,
    ChevronRight,
    Info,
    Quote,
    Triangle,
} from 'lucide-react';
import MobileRankingBadge from '../components/ui/MobileRankingBadge';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import PillSelectionControl from '../components/ui/PillSelectionControl';
import ClassReportIndicatorDrilldown, {
    type ClassReportIndicatorDrilldownMode,
} from '../components/report/ClassReportIndicatorDrilldown';
import RecordDistributionComparison from '../components/report/RecordDistributionComparison';
import ReportDateRangeTabs from '../components/report/ReportDateRangeTabs';
import {
    TeacherReportBarChart,
    TeacherReportDonutChart,
    type TeacherReportBarSeries,
    type TeacherReportChartColor,
} from '../components/report/TeacherReportChart';
import {
    getEducationEventAnalysis,
    getEducationScoreAnalysis,
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
    formatReportSourceEvaluationCount,
    formatReportSourceEvaluationCountAria,
    getReportEvaluationCount,
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
    outline?: ClassReportOutlineItem[];
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

const cardClass = 'rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]';

interface ReportSectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
    action?: React.ReactNode;
    titleAccessory?: React.ReactNode;
}

const ReportSection = ({ id, title, children, action, titleAccessory }: ReportSectionProps) => (
    <section aria-labelledby={id} className={`${cardClass} p-[var(--tm-report-card-padding)]`}>
        <div className="mb-[var(--tm-report-card-content-gap)] flex min-h-6 items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-1">
                <h2 id={id} className="text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">
                    {title}
                </h2>
                {titleAccessory}
            </div>
            {action}
        </div>
        {children}
    </section>
);

const ChartAnalysis = ({ summary, supplement }: ClassReportChartAnalysis) => (
    <div
        role="note"
        aria-label="数据解析"
        className="relative mt-3 rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface-soft)] px-3 py-3"
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
                    <p className="mt-1 text-[var(--tm-font-size-compact)] tm-font-regular leading-5 text-[var(--tm-text-tertiary)]">{supplement}</p>
                )}
            </div>
        </div>
    </div>
);

const formatCustomRangeLabel = (start: string, end: string) => {
    const [startYear, startMonth, startDay] = start.split('-').map(Number);
    const [endYear, endMonth, endDay] = end.split('-').map(Number);
    const endYearLabel = startYear === endYear ? '' : `${endYear}年`;
    return `${startYear}年${startMonth}月${startDay}日 至 ${endYearLabel}${endMonth}月${endDay}日`;
};

const reportOverviewHints = {
    evaluationCount: '发起评价的次数。无论评价对象是1人还是多人，评价1次算1次。示例：全班50人积极参与体育锻炼，只记为1次评价。',
    recordCount: '评价后生成的成长记录数。1名学生算1次。示例：全班50人积极参与体育锻炼，记为50条记录。',
} as const;

const StatCell = ({
    label,
    value,
    unit,
    hint,
    hintAlign = 'left',
}: {
    label: string;
    value: number | string;
    unit: string;
    hint?: string;
    hintAlign?: 'left' | 'center';
}) => {
    const [hintOpen, setHintOpen] = useState(false);
    const hintId = useId();

    return (
        <div className="relative">
            <div className="flex items-center gap-1">
                <span className="text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">{label}</span>
                {hint && (
                    <button
                        type="button"
                        aria-label={`查看${label}定义`}
                        aria-expanded={hintOpen}
                        aria-controls={hintOpen ? hintId : undefined}
                        aria-describedby={hintOpen ? hintId : undefined}
                        onClick={() => setHintOpen(current => !current)}
                        onBlur={() => setHintOpen(false)}
                        onKeyDown={(event) => {
                            if (event.key === 'Escape') setHintOpen(false);
                        }}
                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-tertiary)] transition-colors active:text-[var(--tm-text-primary)]"
                    >
                        <Info aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                )}
            </div>
            <div className="mt-2 flex items-baseline gap-1">
                <strong className="text-[var(--tm-font-size-metric)] leading-none">{value}</strong>
                <span className="text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">{unit}</span>
            </div>
            {hintOpen && hint && (
                <div
                    id={hintId}
                    role="tooltip"
                    className={`absolute top-10 z-20 w-56 rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-text-primary)] px-3 py-2 text-xs font-medium leading-relaxed text-white ${hintAlign === 'center' ? 'left-1/2 -translate-x-1/2' : 'left-0'}`}
                >
                    {hint}
                </div>
            )}
        </div>
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

interface ScoreRankingRow {
    student: Student;
    net: number;
    progress: number;
}

const ScoreRankingList = ({ rows, rankingMode, onSelectStudent }: {
    rows: ScoreRankingRow[];
    rankingMode: RankingMode;
    onSelectStudent: (student: Student) => void;
}) => (
    <ol>
        {rows.map((row, index) => {
            const score = rankingMode === 'net' ? row.net : row.progress;
            return (
                <li key={row.student.id} className="border-b border-[var(--tm-border-subtle)] last:border-0">
                    <button
                        type="button"
                        onClick={() => onSelectStudent(row.student)}
                        className="grid min-h-11 w-full grid-cols-[28px_1fr_auto] items-center gap-2 rounded-[8px] px-2 text-left transition active:bg-[var(--tm-bg-surface-soft)]"
                    >
                        <MobileRankingBadge rank={index + 1} />
                        <span className="truncate text-[var(--tm-font-size-body)] font-medium">{row.student.name}</span>
                        <span className={`text-[var(--tm-font-size-body)] font-semibold ${score >= 0
                            ? 'text-[var(--tm-chart-positive-text)]'
                            : 'text-[var(--tm-chart-negative-text)]'}`}>
                            {score >= 0 ? '+' : ''}{score}
                        </span>
                    </button>
                </li>
            );
        })}
    </ol>
);

const coverageSortColumns: { key: StudentCoverageSortKey; label: string }[] = [
    { key: 'evaluationCount', label: '记录条数' },
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
            className="grid min-h-[var(--tm-size-touch)] grid-cols-[minmax(0,1fr)_var(--tm-report-coverage-evaluation-column)_var(--tm-report-coverage-teacher-column)] items-center overflow-hidden rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface-soft)] text-[length:var(--tm-font-size-compact)] font-semibold"
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
                                aria-label={`${row.evaluationCount}条记录`}
                                className={`flex h-[var(--tm-report-coverage-value-height)] items-center justify-center text-[length:var(--tm-font-size-compact)] tabular-nums ${
                                    evaluationMissing
                                        ? 'font-semibold text-[var(--tm-status-negative-strong)]'
                                        : 'tm-font-regular text-[var(--tm-text-secondary)]'
                                }`}
                            >
                                {row.evaluationCount}
                            </span>
                            <span
                                aria-label={`${row.teacherCount}位老师评价`}
                                className={`flex h-[var(--tm-report-coverage-value-height)] items-center justify-center text-[length:var(--tm-font-size-compact)] tabular-nums ${
                                    teacherMissing
                                        ? 'font-semibold text-[var(--tm-status-negative-strong)]'
                                        : 'tm-font-regular text-[var(--tm-text-secondary)]'
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
    outline,
    classInfo,
    students,
    currentTeacherName,
    onSelectStudent,
}) => {
    const [reportSourceKey, setReportSourceKey] = useState<ReportSourceKey>('all');
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [appliedCustomRange, setAppliedCustomRange] = useState<{ start: string; end: string; days: number } | null>(null);
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [rankingMode, setRankingMode] = useState<RankingMode>('net');
    const [activeEducation, setActiveEducation] = useState<EducationKey>('all');
    const [showAllRanking, setShowAllRanking] = useState(false);
    const [showRankingHelp, setShowRankingHelp] = useState(false);
    const [coverageSortKey, setCoverageSortKey] = useState<StudentCoverageSortKey>('evaluationCount');
    const [coverageSortDirection, setCoverageSortDirection] = useState<StudentCoverageSortDirection>('asc');
    const [showAllCoverage, setShowAllCoverage] = useState(false);
    const [indicatorDrilldown, setIndicatorDrilldown] = useState<{
        mode: ClassReportIndicatorDrilldownMode;
        initialPath: string[];
    } | null>(null);
    const [lastIndicatorRootByMode, setLastIndicatorRootByMode] = useState<Record<ClassReportIndicatorDrilldownMode, string | null>>({
        score: null,
        event: null,
    });
    const [resolvedReportPeriod, setResolvedReportPeriod] = useState<ReportPeriodKey>('week');
    const [isReportScrolled, setIsReportScrolled] = useState(false);
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
        // 评价次数按“1 次评价平均覆盖 2 名学生”从记录条数折算，保证评价次数不超过记录条数。
        const evaluationCount = getReportEvaluationCount(totalRecords);
        const positiveRecords = Math.round(totalRecords * 0.84);
        const negativeRecords = totalRecords - positiveRecords;
        const coverageBase = activeReportSource.key === 'all'
            ? Math.min(1, 0.5 + selectedPeriodMultiplier * 0.14 + 0.32)
            : totalRecords === 0
                ? 0
                : Math.min(0.82, 0.38 + selectedPeriodMultiplier * 0.12 + activeReportSource.recordShare * 0.5);
        const coveredStudents = Math.min(totalStudents, Math.round(totalStudents * coverageBase));
        const previousRecords = Math.max(0, Math.round(totalRecords * 0.78));
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
            evaluationCount,
            positiveRecords,
            negativeRecords,
            coveredStudents,
            previousRecords,
            dataMultiplier,
            indicatorTree,
            educationEvents,
            addScores,
            deductScores,
            netScores,
        };
    }, [activeReportSource, currentPeriodRecordCount, selectedPeriodMultiplier, totalStudents]);

    const recordDistributionOverview = useMemo(() => getRecordDistributionOverview({
        positive: reportData.positiveRecords,
        negative: reportData.negativeRecords,
    }), [reportData.negativeRecords, reportData.positiveRecords]);

    const educationScoreSeries = useMemo<TeacherReportBarSeries[]>(() => [
        { name: '表扬', values: reportData.addScores, color: 'positive' },
        { name: '待改进', values: reportData.deductScores, color: 'negative' },
        { name: '总分', values: reportData.netScores, color: 'data' },
    ], [reportData]);

    const educationScoreAnalysis = useMemo(() => getEducationScoreAnalysis(
        reportData.indicatorTree.map((item, index) => ({
            id: item.id,
            label: item.label,
            eventCount: item.metrics.eventCount,
            addScore: reportData.addScores[index],
            deductScore: reportData.deductScores[index],
            netScore: reportData.netScores[index],
        })),
    ), [reportData]);

    const educationEventAnalysis = useMemo(() => getEducationEventAnalysis(
        reportData.educationEvents.map(item => ({ id: item.key, label: item.label, value: item.value })),
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

    const visibleRankingRows = rankingRows.slice(0, 10);
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

    const applyCustomRange = (draftCustomRange: MobileDateRange) => {
        const nextDays = getValidDaysInRange(draftCustomRange.start, draftCustomRange.end);
        if (nextDays == null) return;
        setCustomRange(draftCustomRange);
        setAppliedCustomRange({ ...draftCustomRange, days: nextDays });
        setTimeRange('custom');
        applyReportPeriod(getPeriodForDays(nextDays));
        setShowCustomDatePicker(false);
    };

    const appliedPeriodKey = timeRange === 'custom' && appliedCustomRange != null
        ? `custom-${appliedCustomRange.start}-${appliedCustomRange.end}`
        : resolvedReportPeriod;
    const reportKey = `${reportSourceKey}-${appliedPeriodKey}`;
    return (
        <div style={classReportColorPreviewStyle} className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent text-[var(--tm-text-primary)]">
                <header className={`z-30 shrink-0 border-b bg-[var(--tm-page-plain-content-bg)] ${isReportScrolled ? 'border-[var(--tm-border-subtle)]' : 'border-transparent'}`}>
                    <div className="px-[var(--tm-report-page-inline)]">
                        <div>
                            <ReportDateRangeTabs
                                value={timeRange}
                                items={timeRangeTabs.map(item => ({ value: item.key, label: item.label }))}
                                onChange={handleTimeRangeChange}
                                ariaLabel="报告时间范围"
                                className="-mx-[var(--tm-report-page-inline)]"
                            />
                            {timeRange === 'custom' && appliedCustomRange && (
                                <button
                                    type="button"
                                    onClick={openCustomDatePicker}
                                    aria-label={`当前自定义日期范围：${appliedCustomRange.start}至${appliedCustomRange.end}，修改日期`}
                                    aria-haspopup="dialog"
                                    className="-mx-[var(--tm-report-page-inline)] flex min-h-[var(--tm-report-custom-range-height)] w-[calc(100%+var(--tm-report-page-inline)*2)] items-center gap-x-[var(--tm-space-2)] bg-[var(--tm-bg-surface)] pl-[var(--tm-report-custom-range-inline-start)] pr-[var(--tm-report-page-inline)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
                                >
                                    <span className="min-w-0 flex-1 text-right text-[length:var(--tm-font-size-body)] font-medium tabular-nums text-[var(--tm-text-primary)]">
                                        {formatCustomRangeLabel(appliedCustomRange.start, appliedCustomRange.end)}
                                    </span>
                                    <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--tm-text-secondary)]" />
                                </button>
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
                                    const evaluationCount = getReportEvaluationCount(item.recordCount);
                                    const displayedEvaluationCount = formatReportSourceEvaluationCount(evaluationCount);
                                    const accessibleEvaluationCount = formatReportSourceEvaluationCountAria(evaluationCount);

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
                                                    ? `我的记录，${currentTeacherName}，${accessibleEvaluationCount}`
                                                    : `${item.label}，${accessibleEvaluationCount}`}
                                            data-report-source-key={item.key}
                                            onClick={() => setReportSourceKey(item.key)}
                                            className="flex h-[var(--tm-size-touch)] shrink-0 items-center whitespace-nowrap text-[length:var(--tm-font-size-compact)]"
                                        >
                                            <span className={`inline-flex h-[var(--tm-report-source-pill-height)] items-center rounded-full px-[var(--tm-report-source-pill-inline)] font-semibold transition-[background-color,color,box-shadow] [transition-duration:var(--tm-duration-standard)] ${
                                                selected
                                                    ? 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)] active:bg-[var(--tm-brand-primary-pressed)]'
                                                    : 'text-[var(--tm-text-secondary)] active:text-[var(--tm-text-primary)]'
                                            }`}>
                                                {item.label}
                                                {isTeacherSource && (
                                                    <span className={`ml-0.5 text-[length:var(--tm-font-size-badge)] font-medium tabular-nums ${
                                                        selected ? 'text-[var(--tm-text-inverse)]' : 'text-[var(--tm-text-tertiary)]'
                                                    }`}>
                                                        ({displayedEvaluationCount})
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

            <div className="min-h-0 flex-1 overflow-y-auto pb-8 no-scrollbar" onScroll={event => {
                const scrolled = event.currentTarget.scrollTop > 0;
                setIsReportScrolled(current => current === scrolled ? current : scrolled);
            }}>
            <div
                id="class-report-content"
                className="space-y-[var(--tm-layout-card-gap)] px-[var(--tm-report-page-inline)] pt-[var(--tm-space-3)]"
            >
                <ReportSectionLayout outline={outline}>
                <ReportSection id="class-report-overview-title" title="概况">
                    <div className="grid grid-cols-3 gap-3">
                        <StatCell
                            label="评价次数"
                            value={reportData.evaluationCount}
                            unit="次"
                            hint={reportOverviewHints.evaluationCount}
                            hintAlign="left"
                        />
                        <StatCell
                            label="记录条数"
                            value={reportData.totalRecords}
                            unit="条"
                            hint={reportOverviewHints.recordCount}
                            hintAlign="center"
                        />
                        <StatCell
                            label="覆盖学生"
                            value={`${coveredStudentCount}/${totalStudents}`}
                            unit="人"
                        />
                    </div>
                </ReportSection>

                <ReportSection id="record-distribution-title" title="评价记录分布">
                    <RecordDistributionComparison overview={recordDistributionOverview} />
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
                    <div
                        role="region"
                        aria-label="五育得分分布，可左右滑动查看全部指标"
                        tabIndex={0}
                        className="overflow-x-auto overscroll-x-contain focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                    >
                        <div style={{ minWidth: `max(100%, calc(${reportData.indicatorTree.length} * var(--tm-report-score-category-width) + var(--tm-report-score-axis-space)))` }}>
                            <TeacherReportBarChart
                                ariaLabel={`${reportData.indicatorTree.map(item => item.label).join('、')}的表扬、待改进与总分对比`}
                                categories={reportData.indicatorTree.map(item => item.label)}
                                series={educationScoreSeries}
                                optionKey={`scores-${reportKey}`}
                                className="h-64"
                                onCategorySelect={label => openIndicatorDrilldown('score', label)}
                            />
                        </div>
                    </div>
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

                <ReportSection id="ranking-title" title="得分排行" titleAccessory={(
                    <button type="button" onClick={() => setShowRankingHelp(true)} aria-label="查看得分排行与进步幅度说明" aria-haspopup="dialog"
                        className="relative -my-2 flex h-[var(--tm-size-touch)] w-5 shrink-0 items-center justify-start text-[var(--tm-text-tertiary)] after:absolute after:inset-y-0 after:left-0 after:w-[var(--tm-size-touch)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]">
                        <Info aria-hidden="true" className="h-3.5 w-3.5" />
                    </button>
                )}>
                    <div>
                        <CompactSegmentedControl
                            shape="subtle"
                            value={rankingMode}
                            items={[
                                { value: 'net', label: '总分' },
                                { value: 'progress', label: '进步幅度' },
                            ]}
                            onChange={setRankingMode}
                            ariaLabel="得分排行类型"
                            className="mb-3"
                        />
                        <ScoreRankingList rows={visibleRankingRows} rankingMode={rankingMode} onSelectStudent={onSelectStudent} />
                        {rankingRows.length > 10 && (
                            <button
                                type="button"
                                onClick={() => setShowAllRanking(true)}
                                aria-haspopup="dialog"
                                className="mt-1 flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-1 text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] transition-colors active:text-[var(--tm-brand-primary-pressed)]"
                            >
                                {`查看全部${rankingRows.length}名学生`}
                                <ChevronRight aria-hidden="true" className="h-4 w-4" />
                            </button>
                        )}
                    </div>
                </ReportSection>

                <ReportSection id="attention-students-title" title="需要关注">
                    <div>
                        <PillSelectionControl
                            value={activeEducation}
                            items={[{ value: 'all', label: '全部' }, ...reportData.indicatorTree.map(item => ({ value: item.id, label: item.label }))]}
                            onChange={setActiveEducation}
                            ariaLabel="需要关注维度"
                            className="mb-3"
                        />

                        <div className="grid grid-cols-2 gap-2">
                            <div className="min-w-0 rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-chart-positive-soft)] px-[var(--tm-space-1)] py-[var(--tm-space-2)]">
                                <div className="flex h-10 items-center justify-between gap-0.5 border-b border-[var(--tm-border-subtle)] text-[var(--tm-chart-positive-text)]">
                                    <span className="min-w-0 whitespace-nowrap">
                                        <span className="text-[length:var(--tm-font-size-body)] font-bold">表扬TOP10</span>
                                    </span>
                                    <span className="shrink-0 whitespace-nowrap text-[length:var(--tm-font-size-badge)] font-medium">表现突出</span>
                                </div>
                                <FocusStudentList rows={focusRows.positive} tone="positive" onSelectStudent={onSelectStudent} />
                            </div>
                            <div className="min-w-0 rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-chart-negative-soft)] px-[var(--tm-space-1)] py-[var(--tm-space-2)]">
                                <div className="flex h-10 items-center justify-between gap-0.5 border-b border-[var(--tm-border-subtle)] text-[var(--tm-chart-negative-text)]">
                                    <span className="min-w-0 whitespace-nowrap">
                                        <span className="text-[length:var(--tm-font-size-body)] font-bold">待改进TOP10</span>
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
                </ReportSectionLayout>
            </div>
            </div>

            <MobileDatePickerSheet shape="subtle"
                open={showCustomDatePicker}
                mode="range"
                value={customRange}
                currentTerm={currentTermToDateRange(localToday())}
                onConfirm={applyCustomRange}
                onClose={() => setShowCustomDatePicker(false)}
            />

            <ClassReportIndicatorDrilldown
                colorStyle={classReportColorPreviewStyle}
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

            <MobileBottomSheet open={showRankingHelp} title="得分排行说明" onClose={() => setShowRankingHelp(false)}>
                <div className="space-y-4 text-[length:var(--tm-font-size-body)] leading-relaxed text-[var(--tm-text-primary)]">
                    <p>总分＝当前时间范围内的加分－扣分，按总分从高到低排序。</p>
                    <p>进步幅度＝本期总分－上期总分，按增加的分数从高到低排序，表示分数差值。</p>
                    <p>示例：本期总分80分，上期总分60分，进步幅度为+20分。</p>
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet open={showAllRanking} title="全部得分排行" onClose={() => setShowAllRanking(false)}>
                <div style={classReportColorPreviewStyle}>
                <CompactSegmentedControl
                    shape="subtle"
                    value={rankingMode}
                    items={[{ value: 'net', label: '总分' }, { value: 'progress', label: '进步幅度' }]}
                    onChange={setRankingMode}
                    ariaLabel="完整得分排行类型"
                    className="mb-3"
                />
                <ScoreRankingList rows={rankingRows} rankingMode={rankingMode} onSelectStudent={student => {
                    setShowAllRanking(false);
                    onSelectStudent(student);
                }} />
                </div>
            </MobileBottomSheet>

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
