import React, { useCallback, useMemo, useState } from 'react';
import {
    ArrowDownNarrowWide,
    ArrowUpDown,
    ArrowUpNarrowWide,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    Quote,
    Triangle,
} from 'lucide-react';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
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
import { ClassInfo, Student } from '../types';

interface ClassReportViewProps {
    classInfo: ClassInfo;
    students: Student[];
    currentTeacherName: string;
    onSelectStudent: (student: Student) => void;
}

type ReportSourceKey = 'all' | 'mine' | `teacher:${string}`;
type TimeRange = 'day' | 'week' | 'month' | 'semester' | 'custom';
type EducationKey = 'all' | 'virtue' | 'wisdom' | 'fitness' | 'aesthetic' | 'labor';
type RankingMode = 'net' | 'progress';

const educationDimensions: {
    key: Exclude<EducationKey, 'all'>;
    label: string;
    color: TeacherReportChartColor;
}[] = [
    { key: 'virtue', label: '德育', color: 'virtue' },
    { key: 'wisdom', label: '智育', color: 'wisdom' },
    { key: 'fitness', label: '体育', color: 'fitness' },
    { key: 'aesthetic', label: '美育', color: 'aesthetic' },
    { key: 'labor', label: '劳育', color: 'labor' },
];

const timeRangeTabs: { key: TimeRange; label: string }[] = [
    { key: 'day', label: '今日' },
    { key: 'week', label: '本周' },
    { key: 'month', label: '本月' },
    { key: 'semester', label: '本学期' },
    { key: 'custom', label: '自定义' },
];

interface ReportSourceOption {
    key: ReportSourceKey;
    label: string;
    recordShare: number;
}

const evaluatingTeacherSources: ReportSourceOption[] = [
    { key: 'teacher:zhou-sanlun', label: '周三论', recordShare: 0.24 },
    { key: 'teacher:zhang-yi', label: '张怡', recordShare: 0.16 },
    { key: 'teacher:wang-lei', label: '王蕾', recordShare: 0.11 },
    { key: 'teacher:chen-jia', label: '陈嘉', recordShare: 0.07 },
];

const reportSourceOptions: ReportSourceOption[] = [
    { key: 'all', label: '全班汇总', recordShare: 1 },
    { key: 'mine', label: '我的记录', recordShare: 0.42 },
    ...evaluatingTeacherSources.filter(source => source.recordShare > 0),
];

const cardClass = 'rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-card)]';
const inactiveConditionFilterClass = 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]';
const customDateInputClass = 'h-11 min-w-0 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-2 text-[var(--tm-font-size-meta)] text-[var(--tm-text-primary)] outline-none transition-colors focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]';

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

interface StudentCoverageListProps {
    rows: StudentCoverageRow[];
    sortKey: StudentCoverageSortKey;
    direction: StudentCoverageSortDirection;
    onSort: (sortKey: StudentCoverageSortKey) => void;
    onSelectStudent: (student: Student) => void;
}

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
            className="grid min-h-[var(--tm-size-touch)] grid-cols-[28px_minmax(0,1fr)_84px_84px] items-center overflow-hidden rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[length:var(--tm-font-size-meta)]"
            aria-label="学生覆盖排序"
        >
            <span className="text-center font-semibold text-[var(--tm-text-tertiary)]">#</span>
            <span className="pl-1 font-semibold text-[var(--tm-text-primary)]">学生姓名</span>
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
                            className={`flex h-full w-full items-center justify-center gap-1 px-1 font-medium transition-[color,background-color,scale] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-muted)] ${
                                selected
                                    ? 'text-[var(--tm-brand-primary)]'
                                    : 'text-[var(--tm-text-secondary)]'
                            }`}
                        >
                            <span className="whitespace-nowrap">{column.label}</span>
                            {selected ? (
                                direction === 'asc'
                                    ? <ArrowUpNarrowWide aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                                    : <ArrowDownNarrowWide aria-hidden="true" className="h-3.5 w-3.5 shrink-0" />
                            ) : (
                                <ArrowUpDown aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-[var(--tm-text-tertiary)]" />
                            )}
                        </button>
                    </span>
                );
            })}
        </div>
        <ol>
            {rows.map((row, index) => {
                const uncovered = row.evaluationCount === 0;
                const evaluationSelected = sortKey === 'evaluationCount';
                const teacherSelected = sortKey === 'teacherCount';
                return (
                    <li key={row.student.id} className="border-b border-[var(--tm-border-subtle)] last:border-0">
                        <button
                            type="button"
                            onClick={() => onSelectStudent(row.student)}
                            aria-label={`查看${row.student.name}，评价${row.evaluationCount}次，${row.teacherCount}位老师评价`}
                            className="grid min-h-[var(--tm-size-touch)] w-full grid-cols-[28px_minmax(0,1fr)_84px_84px] items-center rounded-[6px] px-1 text-left transition-colors active:bg-[var(--tm-bg-surface-soft)]"
                        >
                            <span className="text-center text-[length:var(--tm-font-size-meta)] tabular-nums text-[var(--tm-text-tertiary)]">{index + 1}</span>
                            <span className="truncate pl-1 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)]">{row.student.name}</span>
                            <span
                                className={`mx-auto flex h-7 w-16 items-center justify-center rounded-[8px] text-[length:var(--tm-font-size-compact)] tabular-nums ${
                                    uncovered
                                        ? 'bg-[var(--tm-chart-negative-soft)] font-semibold text-[var(--tm-chart-negative-text)]'
                                        : evaluationSelected
                                            ? 'bg-[var(--tm-bg-surface-soft)] font-semibold text-[var(--tm-text-primary)]'
                                            : 'font-normal text-[var(--tm-text-secondary)]'
                                }`}
                            >
                                {row.evaluationCount}次
                            </span>
                            <span
                                className={`mx-auto flex h-7 w-16 items-center justify-center rounded-[8px] text-[length:var(--tm-font-size-compact)] tabular-nums ${
                                    teacherSelected
                                        ? 'bg-[var(--tm-bg-surface-soft)] font-semibold text-[var(--tm-text-primary)]'
                                        : 'font-normal text-[var(--tm-text-secondary)]'
                                }`}
                            >
                                {row.teacherCount}位
                            </span>
                        </button>
                    </li>
                );
            })}
        </ol>
    </div>
);

const getDaysInRange = (start: string, end: string) => {
    if (!start || !end) return 7;
    const startDate = new Date(start);
    const endDate = new Date(end);
    const difference = endDate.getTime() - startDate.getTime();
    return Math.max(1, Math.ceil(difference / 86_400_000) + 1);
};

const ClassReportView: React.FC<ClassReportViewProps> = ({
    classInfo,
    students,
    currentTeacherName,
    onSelectStudent,
}) => {
    const [reportSourceKey, setReportSourceKey] = useState<ReportSourceKey>('all');
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [rankingMode, setRankingMode] = useState<RankingMode>('net');
    const [activeEducation, setActiveEducation] = useState<EducationKey>('all');
    const [showAllRanking, setShowAllRanking] = useState(false);
    const [showAllFocus, setShowAllFocus] = useState(false);
    const [coverageSortKey, setCoverageSortKey] = useState<StudentCoverageSortKey>('evaluationCount');
    const [coverageSortDirection, setCoverageSortDirection] = useState<StudentCoverageSortDirection>('asc');
    const [showAllCoverage, setShowAllCoverage] = useState(false);
    const [showRecordDistributionDetails, setShowRecordDistributionDetails] = useState(false);
    const [isFilterPinned, setIsFilterPinned] = useState(false);

    const totalStudents = students.length || classInfo.studentCount;
    const activeReportSource = reportSourceOptions.find(source => source.key === reportSourceKey) ?? reportSourceOptions[0];

    const reportData = useMemo(() => {
        const periodMultiplier: Record<Exclude<TimeRange, 'custom'>, number> = {
            day: 0.2,
            week: 1,
            month: 4,
            semester: 18,
        };
        const selectedPeriodMultiplier = timeRange === 'custom'
            ? Math.max(0.2, getDaysInRange(customRange.start, customRange.end) / 7)
            : periodMultiplier[timeRange];
        const dataMultiplier = selectedPeriodMultiplier * activeReportSource.recordShare;
        const totalRecords = Math.max(1, Math.round(447 * dataMultiplier));
        const positiveRecords = Math.round(totalRecords * 0.84);
        const negativeRecords = totalRecords - positiveRecords;
        const coverageBase = activeReportSource.key === 'all'
            ? Math.min(1, 0.5 + selectedPeriodMultiplier * 0.14 + 0.32)
            : Math.min(0.82, 0.38 + selectedPeriodMultiplier * 0.12 + activeReportSource.recordShare * 0.5);
        const coveredStudents = Math.min(totalStudents, Math.round(totalStudents * coverageBase));
        const previousRecords = Math.max(1, Math.round(totalRecords * 0.78));
        const previousPositiveRecords = Math.round(previousRecords * 0.76);
        const previousNegativeRecords = previousRecords - previousPositiveRecords;
        const gradeAverageRecords = Math.max(1, Math.round(totalRecords * 1.08));
        const gradeAveragePositiveRecords = Math.round(gradeAverageRecords * 0.82);
        const gradeAverageNegativeRecords = gradeAverageRecords - gradeAveragePositiveRecords;
        const previousCovered = Math.max(0, Math.min(totalStudents, coveredStudents - Math.max(0, Math.round(totalStudents * 0.04))));

        const eventWeights = [0.22, 0.2, 0.18, 0.21, 0.19];
        const educationEvents = educationDimensions.map((dimension, index) => ({
            ...dimension,
            value: Math.max(1, Math.round(totalRecords * eventWeights[index])),
        }));
        const addScores = [116, 175, 394, 332, 288].map(value => Math.max(1, Math.round(value * dataMultiplier)));
        const deductScores = [13, 21, 46, 80, 32].map(value => Math.max(0, Math.round(value * dataMultiplier)));
        const netScores = addScores.map((value, index) => value - deductScores[index]);

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
            educationEvents,
            addScores,
            deductScores,
            netScores,
        };
    }, [activeReportSource, customRange.end, customRange.start, students, timeRange, totalStudents]);

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
        { name: '净得分', values: reportData.netScores, color: 'data' },
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
        educationDimensions.map((item, index) => ({
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
        const rows = students.map((student, index) => {
            const plus = Math.max(6, Math.round((58 - index * 0.8) * Math.max(0.5, reportData.dataMultiplier)));
            const minus = index % 4 === 0 ? Math.round((index + 3) * Math.max(0.3, reportData.dataMultiplier)) : 0;
            return {
                student,
                plus,
                minus,
                net: plus - minus,
                progress: Math.max(1, 48 - index + (index % 3) * 4),
            };
        });

        return rows.sort((a, b) => (
            rankingMode === 'net' ? b.net - a.net : b.progress - a.progress
        ));
    }, [rankingMode, reportData.dataMultiplier, students]);

    const focusRows = useMemo(() => {
        const dimensionOffset = Math.max(0, educationDimensions.findIndex(item => item.key === activeEducation));
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
    }, [activeEducation, reportData.dataMultiplier, students]);

    const visibleRankingRows = showAllRanking ? rankingRows.slice(0, 10) : rankingRows.slice(0, 5);
    const visiblePositiveFocus = showAllFocus ? focusRows.positive : focusRows.positive.slice(0, 5);
    const visibleNegativeFocus = showAllFocus ? focusRows.negative : focusRows.negative.slice(0, 5);
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

    const reportKey = `${reportSourceKey}-${timeRange}-${customRange.start}-${customRange.end}`;

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent text-[var(--tm-text-primary)]">
            <div className="min-h-0 flex-1 overflow-y-auto pb-8 no-scrollbar" onScroll={handleReportScroll}>
                <header className={`sticky top-0 z-30 transition-all [transition-duration:var(--tm-duration-panel)] ease-out motion-reduce:duration-0 ${
                    isFilterPinned
                        ? 'border-b border-[var(--tm-border-subtle)] bg-[var(--tm-page-plain-header-bg)] pb-[var(--tm-space-1)] shadow-[var(--tm-shadow-card)]'
                        : 'bg-transparent'
                }`}>
                    <div
                        className={`overflow-x-auto bg-[var(--tm-bg-surface)] no-scrollbar transition-all [transition-duration:var(--tm-duration-panel)] ease-out motion-reduce:duration-0 ${
                            isFilterPinned
                                ? 'py-0'
                                : 'pb-[var(--tm-report-source-area-padding-bottom)] pt-[var(--tm-report-source-area-padding-top)] shadow-[var(--tm-shadow-control)]'
                        }`}
                        role="tablist"
                        aria-label="报告数据来源"
                    >
                        <div className={`flex min-w-max transition-all [transition-duration:var(--tm-duration-panel)] ease-out motion-reduce:duration-0 ${
                            isFilterPinned
                                ? 'px-[var(--tm-report-source-list-inline-pinned)]'
                                : 'px-[var(--tm-report-source-list-inline)]'
                        }`}>
                            {reportSourceOptions.map(item => {
                                const selected = reportSourceKey === item.key;
                                return (
                                    <button
                                        key={item.key}
                                        type="button"
                                        role="tab"
                                        aria-selected={selected}
                                        aria-controls="class-report-content"
                                        aria-label={item.key === 'mine' ? `我的记录，${currentTeacherName}` : item.label}
                                        onClick={event => {
                                            setReportSourceKey(item.key);
                                            const sourceScroller = event.currentTarget.parentElement?.parentElement;
                                            if (sourceScroller) {
                                                const centeredLeft = event.currentTarget.offsetLeft
                                                    - (sourceScroller.clientWidth - event.currentTarget.offsetWidth) / 2;
                                                sourceScroller.scrollTo({ left: Math.max(0, centeredLeft), behavior: 'smooth' });
                                            }
                                        }}
                                        className={`relative flex h-[var(--tm-size-touch)] shrink-0 justify-center whitespace-nowrap transition-[width,padding,font-size,color] [transition-duration:var(--tm-duration-panel)] ease-out motion-reduce:duration-0 ${
                                            isFilterPinned
                                                ? `w-[var(--tm-report-source-item-width-pinned)] items-center px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] ${selected ? 'font-semibold' : 'font-medium'}`
                                                : `w-[var(--tm-report-source-item-width)] items-center px-[var(--tm-space-1)] ${selected ? 'text-[length:var(--tm-font-size-section-title)] font-bold' : 'text-[length:var(--tm-font-size-body)] font-medium'}`
                                        } ${selected ? '!text-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-secondary)]'}`}
                                    >
                                        <span className={`relative inline-flex items-center ${
                                            isFilterPinned
                                                ? 'pb-[var(--tm-report-source-indicator-gap-pinned)]'
                                                : 'h-[var(--tm-report-source-visual-height)] pb-[var(--tm-report-source-indicator-gap)]'
                                        }`}>
                                            {item.label}
                                            <span
                                                aria-hidden="true"
                                                className={`absolute bottom-0 left-1/2 w-[var(--tm-report-source-indicator-width)] -translate-x-1/2 rounded-full bg-[var(--tm-brand-primary)] transition-[height,opacity] [transition-duration:var(--tm-duration-panel)] ease-out motion-reduce:duration-0 ${
                                                    isFilterPinned
                                                        ? 'h-[var(--tm-report-source-indicator-height-pinned)]'
                                                        : 'h-[var(--tm-report-source-indicator-height)]'
                                                } ${selected ? 'opacity-100' : 'opacity-0'}`}
                                            />
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`bg-[var(--tm-bg-surface)] transition-all [transition-duration:var(--tm-duration-panel)] ease-out motion-reduce:duration-0 ${
                        isFilterPinned
                            ? 'mx-[var(--tm-report-date-card-inline-pinned)] mt-[var(--tm-report-filter-gap-pinned)] rounded-[var(--tm-radius-control)] px-[var(--tm-report-date-card-padding)] shadow-[var(--tm-shadow-control)]'
                            : 'mx-[var(--tm-report-page-inline)] mt-[var(--tm-report-filter-gap)] rounded-[var(--tm-radius-card)] p-[var(--tm-report-date-card-padding)] shadow-[var(--tm-shadow-card)]'
                    }`}>
                        <div className="grid h-[var(--tm-size-touch)] grid-cols-5" aria-label="报告时间范围">
                            {timeRangeTabs.map(item => (
                                <button
                                    key={item.key}
                                    type="button"
                                    aria-pressed={timeRange === item.key}
                                    onClick={() => setTimeRange(item.key)}
                                    className="flex h-[var(--tm-size-touch)] min-w-0 items-center justify-center whitespace-nowrap px-[var(--tm-space-1)]"
                                >
                                    <span
                                        className={`flex items-center justify-center rounded-[calc(var(--tm-radius-control)-4px)] px-[var(--tm-space-1)] transition-all [transition-duration:var(--tm-duration-panel)] ease-out motion-reduce:duration-0 ${
                                            isFilterPinned
                                                ? 'h-[var(--tm-report-date-option-height-pinned)] w-[var(--tm-report-date-option-width-pinned)] text-[length:var(--tm-font-size-meta)]'
                                                : 'h-[var(--tm-report-date-option-height)] w-[var(--tm-report-date-option-width)] text-[length:var(--tm-font-size-compact)]'
                                        } ${
                                            timeRange === item.key
                                                ? 'bg-[var(--tm-brand-primary)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)]'
                                                : 'font-medium text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'
                                        }`}
                                    >
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        {timeRange === 'custom' && (
                            <div className={`grid grid-cols-[1fr_auto_1fr] items-center gap-[var(--tm-space-2)] transition-all [transition-duration:var(--tm-duration-panel)] ease-out motion-reduce:duration-0 ${
                                isFilterPinned
                                    ? 'px-[var(--tm-space-1)] pb-[var(--tm-space-1)] pt-[var(--tm-space-1)]'
                                    : 'px-[var(--tm-space-1)] pb-[var(--tm-space-1)] pt-[var(--tm-space-2)]'
                            }`}>
                                <input
                                    type="date"
                                    aria-label="开始日期"
                                    value={customRange.start}
                                    onChange={event => setCustomRange(current => ({ ...current, start: event.target.value }))}
                                    className={customDateInputClass}
                                />
                                <span className="text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">至</span>
                                <input
                                    type="date"
                                    aria-label="结束日期"
                                    value={customRange.end}
                                    onChange={event => setCustomRange(current => ({ ...current, end: event.target.value }))}
                                    className={customDateInputClass}
                                />
                            </div>
                        )}
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

                <ReportSection id="education-score-title" title="五育得分分布">
                    <TeacherReportBarChart
                        ariaLabel="德育、智育、体育、美育、劳育的加分、扣分与净得分对比"
                        categories={educationDimensions.map(item => item.label)}
                        series={educationScoreSeries}
                        optionKey={`scores-${reportKey}`}
                        className="h-64"
                    />
                    <ChartAnalysis {...educationScoreAnalysis} />
                </ReportSection>

                <ReportSection id="education-event-title" title="五育事件分布">
                    <TeacherReportDonutChart
                        ariaLabel="德育、智育、体育、美育、劳育的评价事件占比"
                        data={reportData.educationEvents.map(item => ({
                            name: item.label,
                            value: item.value,
                            color: item.color,
                        }))}
                        optionKey={`events-${reportKey}`}
                        className="h-64"
                    />
                    <ChartAnalysis {...educationEventAnalysis} />
                </ReportSection>

                <ReportSection id="ranking-title" title="排行榜">
                    <div>
                        <div className="mb-3 grid h-11 grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)]" role="tablist" aria-label="排行榜类型">
                            {([
                                { key: 'net' as const, label: '净得分排行' },
                                { key: 'progress' as const, label: '进步排行' },
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
                                            ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] shadow-[var(--tm-shadow-control)]'
                                            : 'text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]'
                                    }`}>
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>
                        <ol>
                            {visibleRankingRows.map((row, index) => (
                                <li key={row.student.id} className="border-b border-[var(--tm-border-subtle)] last:border-0">
                                    <button
                                        type="button"
                                        onClick={() => onSelectStudent(row.student)}
                                        className="grid min-h-11 w-full grid-cols-[28px_1fr_auto] items-center gap-2 rounded-[8px] px-2 text-left transition active:bg-[var(--tm-bg-surface-soft)]"
                                    >
                                        <span className="text-center text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">{index + 1}</span>
                                        <span className="truncate text-[var(--tm-font-size-body)] font-medium">{row.student.name}</span>
                                        <span className={`text-[var(--tm-font-size-body)] font-semibold ${rankingMode === 'progress' || row.net >= 0 ? 'text-[var(--tm-chart-positive-text)]' : 'text-[var(--tm-chart-negative-text)]'}`}>
                                            {rankingMode === 'net' ? `${row.net >= 0 ? '+' : ''}${row.net}` : `+${row.progress}`}
                                        </span>
                                    </button>
                                </li>
                            ))}
                        </ol>
                        {rankingRows.length > 5 && (
                            <button
                                type="button"
                                onClick={() => setShowAllRanking(value => !value)}
                                className="mt-2 flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-1 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] transition active:bg-[var(--tm-bg-surface-muted)]"
                            >
                                {showAllRanking ? '收起排行' : '查看前10名'}
                                {showAllRanking ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                        )}
                    </div>
                </ReportSection>

                <ReportSection id="focus-students-title" title="重点关注对象">
                    <div>
                        <div className="mb-3 flex gap-2 overflow-x-auto py-1 no-scrollbar" aria-label="重点关注维度">
                            {[{ key: 'all' as const, label: '全部' }, ...educationDimensions].map(item => (
                                <button
                                    key={item.key}
                                    type="button"
                                    aria-pressed={activeEducation === item.key}
                                    onClick={() => setActiveEducation(item.key)}
                                    className="flex h-[var(--tm-size-touch)] min-w-[60px] shrink-0 items-center justify-center"
                                >
                                    <span className={`flex h-8 w-full items-center justify-center rounded-[8px] border px-3 text-[var(--tm-font-size-compact)] font-semibold transition-colors duration-200 ${
                                        activeEducation === item.key
                                            ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)]'
                                            : inactiveConditionFilterClass
                                    }`}>
                                        {item.label}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="mb-1 text-center text-[var(--tm-font-size-meta)] font-semibold text-[var(--tm-chart-positive-text)]">加分 Top 10</div>
                                <ol>
                                    {visiblePositiveFocus.map((row, index) => (
                                        <li key={row.student.id}>
                                            <button
                                                type="button"
                                                onClick={() => onSelectStudent(row.student)}
                                                className="grid min-h-11 w-full grid-cols-[20px_1fr_auto] items-center gap-1 rounded-[8px] px-1 text-left transition active:bg-[var(--tm-chart-positive-soft)]"
                                            >
                                                <span className="text-center text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">{index + 1}</span>
                                                <span className="truncate text-[var(--tm-font-size-compact)]">{row.student.name}</span>
                                                <span className="text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-chart-positive-text)]">+{row.score}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <div>
                                <div className="mb-1 text-center text-[var(--tm-font-size-meta)] font-semibold text-[var(--tm-chart-negative-text)]">扣分 Top 10</div>
                                <ol>
                                    {visibleNegativeFocus.map((row, index) => (
                                        <li key={row.student.id}>
                                            <button
                                                type="button"
                                                onClick={() => onSelectStudent(row.student)}
                                                className="grid min-h-11 w-full grid-cols-[20px_1fr_auto] items-center gap-1 rounded-[8px] px-1 text-left transition active:bg-[var(--tm-chart-negative-soft)]"
                                            >
                                                <span className="text-center text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">{index + 1}</span>
                                                <span className="truncate text-[var(--tm-font-size-compact)]">{row.student.name}</span>
                                                <span className="text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-chart-negative-text)]">-{row.score}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                        </div>

                        {focusRows.positive.length > 5 && (
                            <button
                                type="button"
                                onClick={() => setShowAllFocus(value => !value)}
                                className="mt-2 flex min-h-11 w-full items-center justify-center gap-1 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]"
                            >
                                {showAllFocus ? '收起名单' : '查看完整 Top 10'}
                                {showAllFocus ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                        )}
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
                            className="mt-2 flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-1 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] transition active:bg-[var(--tm-bg-surface-muted)]"
                        >
                            查看全部{sortedCoverageRows.length}名学生
                            <ChevronUp className="h-4 w-4" />
                        </button>
                    )}
                </ReportSection>
            </div>
            </div>

            <MobileBottomSheet
                open={showRecordDistributionDetails}
                title="评价记录对比"
                onClose={() => setShowRecordDistributionDetails(false)}
            >
                <RecordDistributionDetails rows={recordDistributionRows} />
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
