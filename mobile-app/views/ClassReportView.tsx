import React, { useMemo, useState } from 'react';
import { ArrowDown, ArrowUp, ChevronDown, ChevronUp, Quote, Triangle } from 'lucide-react';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
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
interface ReportSectionProps {
    id: string;
    title: string;
    children: React.ReactNode;
    className?: string;
}

const ReportSection = ({ id, title, children, className = 'p-4' }: ReportSectionProps) => (
    <section aria-labelledby={id} className={`${cardClass} ${className}`}>
        <h2 id={id} className="mb-3 text-[var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">
            {title}
        </h2>
        {children}
    </section>
);

const ChartAnalysis = ({ summary, supplement }: ClassReportChartAnalysis) => (
    <div
        role="note"
        aria-label="图表解析"
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

interface CoverageSortControlsProps {
    sortKey: StudentCoverageSortKey;
    direction: StudentCoverageSortDirection;
    onSortKeyChange: (sortKey: StudentCoverageSortKey) => void;
    onDirectionChange: () => void;
}

const CoverageSortControls = ({
    sortKey,
    direction,
    onSortKeyChange,
    onDirectionChange,
}: CoverageSortControlsProps) => (
    <div className="grid grid-cols-[1fr_1fr_auto] gap-2 py-1" aria-label="学生覆盖排序">
        {([
            { key: 'evaluationCount' as const, label: '评价次数' },
            { key: 'teacherCount' as const, label: '评价老师' },
        ]).map(item => (
            <button
                key={item.key}
                type="button"
                aria-pressed={sortKey === item.key}
                onClick={() => onSortKeyChange(item.key)}
                className={`h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] px-2 text-[var(--tm-font-size-compact)] font-semibold shadow-[var(--tm-shadow-control)] transition duration-200 ${
                    sortKey === item.key
                        ? 'bg-[var(--tm-brand-primary)] text-white active:bg-[var(--tm-brand-primary-pressed)]'
                        : 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]'
                }`}
            >
                {item.label}
            </button>
        ))}
        <button
            type="button"
            onClick={onDirectionChange}
            aria-label={direction === 'asc' ? '当前从少到多，点击切换为从多到少' : '当前从多到少，点击切换为从少到多'}
            className="flex h-[var(--tm-size-touch)] min-w-[76px] items-center justify-center gap-1 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] px-2 text-[var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary)] shadow-[var(--tm-shadow-control)] transition active:bg-[var(--tm-bg-surface-soft)]"
        >
            {direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />}
            {direction === 'asc' ? '少到多' : '多到少'}
        </button>
    </div>
);

interface StudentCoverageListProps {
    rows: StudentCoverageRow[];
    onSelectStudent: (student: Student) => void;
}

const StudentCoverageList = ({ rows, onSelectStudent }: StudentCoverageListProps) => (
    <div>
        <div className="grid grid-cols-[minmax(0,1fr)_64px_64px] items-center gap-1 px-2 pb-1 pt-3 text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
            <span>学生</span>
            <span className="text-center">评价次数</span>
            <span className="text-center">评价老师</span>
        </div>
        <ol>
            {rows.map((row, index) => (
                <li key={row.student.id} className="border-b border-[var(--tm-border-subtle)] last:border-0">
                    <button
                        type="button"
                        onClick={() => onSelectStudent(row.student)}
                        aria-label={`查看${row.student.name}，评价${row.evaluationCount}次，${row.teacherCount}位老师评价`}
                        className="grid min-h-[var(--tm-size-touch)] w-full grid-cols-[minmax(0,1fr)_64px_64px] items-center gap-1 rounded-[8px] px-2 text-left transition active:bg-[var(--tm-bg-surface-soft)]"
                    >
                        <span className="grid min-w-0 grid-cols-[24px_minmax(0,1fr)] items-center gap-1">
                            <span className="text-center text-[var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{index + 1}</span>
                            <span className="truncate text-[var(--tm-font-size-body)] font-medium">{row.student.name}</span>
                        </span>
                        <span className="text-center text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{row.evaluationCount}次</span>
                        <span className="text-center text-[var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">{row.teacherCount}位</span>
                    </button>
                </li>
            ))}
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

    const recordDistributionSeries = useMemo<TeacherReportBarSeries[]>(() => [
        {
            name: '本周期',
            values: [reportData.positiveRecords, reportData.negativeRecords],
            color: 'positive',
        },
        {
            name: '上周期',
            values: [reportData.previousPositiveRecords, reportData.previousNegativeRecords],
            color: 'positive',
            muted: true,
        },
        {
            name: '年级平均',
            values: [reportData.gradeAveragePositiveRecords, reportData.gradeAverageNegativeRecords],
            color: 'peer',
        },
    ], [reportData]);

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
    const toggleCoverageSortDirection = () => setCoverageSortDirection(current => current === 'asc' ? 'desc' : 'asc');

    const reportKey = `${reportSourceKey}-${timeRange}-${customRange.start}-${customRange.end}`;

    return (
        <div className="min-h-full bg-transparent pb-8 text-[var(--tm-text-primary)]">
            <header className="border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-page-glass)] pb-3 backdrop-blur-xl">
                <div className="overflow-x-auto border-b border-[var(--tm-border-subtle)] no-scrollbar" role="tablist" aria-label="报告数据来源">
                    <div className="flex min-w-max px-2">
                        {reportSourceOptions.map(item => (
                            <button
                                key={item.key}
                                type="button"
                                role="tab"
                                aria-selected={reportSourceKey === item.key}
                                aria-controls="class-report-content"
                                aria-label={item.key === 'mine' ? `我的记录，${currentTeacherName}` : item.label}
                                onClick={event => {
                                    setReportSourceKey(item.key);
                                    event.currentTarget.scrollIntoView({ block: 'nearest', inline: 'center' });
                                }}
                                className={`relative h-[var(--tm-size-touch)] min-w-[88px] whitespace-nowrap px-4 text-[var(--tm-font-size-compact)] font-medium transition-colors duration-200 ${
                                    reportSourceKey === item.key
                                        ? '!text-[var(--tm-brand-primary)]'
                                        : 'text-[var(--tm-text-secondary)]'
                                }`}
                            >
                                {item.label}
                                <span
                                    aria-hidden="true"
                                    className={`absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-[var(--tm-brand-primary)] transition-opacity duration-200 ${
                                        reportSourceKey === item.key ? 'opacity-100' : 'opacity-0'
                                    }`}
                                />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mt-3 flex gap-2 overflow-x-auto px-5 py-1 no-scrollbar" aria-label="报告时间范围">
                    {timeRangeTabs.map(item => (
                        <button
                            key={item.key}
                            type="button"
                            aria-pressed={timeRange === item.key}
                            onClick={() => setTimeRange(item.key)}
                            className={`h-[var(--tm-size-touch)] min-w-[64px] flex-1 whitespace-nowrap rounded-[var(--tm-radius-control)] px-2 text-[var(--tm-font-size-meta)] font-semibold shadow-[var(--tm-shadow-control)] transition duration-200 ${
                                timeRange === item.key
                                    ? 'bg-[var(--tm-brand-primary)] text-white active:bg-[var(--tm-brand-primary-pressed)]'
                                    : 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {timeRange === 'custom' && (
                    <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2 px-5">
                        <input
                            type="date"
                            aria-label="开始日期"
                            value={customRange.start}
                            onChange={event => setCustomRange(current => ({ ...current, start: event.target.value }))}
                            className="h-11 min-w-0 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-2 text-[var(--tm-font-size-meta)] text-[var(--tm-text-primary)] outline-none focus:ring-2 focus:ring-[var(--tm-focus-ring)]"
                        />
                        <span className="text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">至</span>
                        <input
                            type="date"
                            aria-label="结束日期"
                            value={customRange.end}
                            onChange={event => setCustomRange(current => ({ ...current, end: event.target.value }))}
                            className="h-11 min-w-0 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-2 text-[var(--tm-font-size-meta)] text-[var(--tm-text-primary)] outline-none focus:ring-2 focus:ring-[var(--tm-focus-ring)]"
                        />
                    </div>
                )}
            </header>

            <div id="class-report-content" className="space-y-6 px-5 pt-5">
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

                <ReportSection id="record-distribution-title" title="评价记录分布" className="px-3 pb-4 pt-4">
                    <TeacherReportBarChart
                        ariaLabel="正向事件和负向事件在本周期、上周期和年级平均的分组对比"
                        categories={['正向事件', '负向事件']}
                        categoryColors={['positive', 'negative']}
                        series={recordDistributionSeries}
                        optionKey={`records-${reportKey}`}
                        className="h-52"
                        showValueAxis={false}
                        valueLabelSuffix="条"
                    />
                    <ChartAnalysis {...recordDistributionAnalysis} />
                </ReportSection>

                <ReportSection id="education-score-title" title="五育得分分布" className="px-3 pb-4 pt-4">
                    <TeacherReportBarChart
                        ariaLabel="德育、智育、体育、美育、劳育的加分、扣分与净得分对比"
                        categories={educationDimensions.map(item => item.label)}
                        series={educationScoreSeries}
                        optionKey={`scores-${reportKey}`}
                        className="h-64"
                    />
                    <ChartAnalysis {...educationScoreAnalysis} />
                </ReportSection>

                <ReportSection id="education-event-title" title="五育事件分布" className="px-3 pb-4 pt-4">
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

                <ReportSection id="ranking-title" title="排行榜" className="overflow-hidden p-3">
                    <div>
                        <div className="mb-3 grid grid-cols-2 gap-2 py-1" aria-label="排行榜类型">
                            {([
                                { key: 'net' as const, label: '净得分排行' },
                                { key: 'progress' as const, label: '进步排行' },
                            ]).map(item => (
                                <button
                                    key={item.key}
                                    type="button"
                                    aria-pressed={rankingMode === item.key}
                                    onClick={() => setRankingMode(item.key)}
                                    className={`h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] text-[var(--tm-font-size-compact)] font-semibold shadow-[var(--tm-shadow-control)] transition duration-200 ${
                                        rankingMode === item.key
                                            ? 'bg-[var(--tm-brand-primary)] text-white active:bg-[var(--tm-brand-primary-pressed)]'
                                            : 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]'
                                    }`}
                                >
                                    {item.label}
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

                <ReportSection id="focus-students-title" title="重点关注对象" className="p-3">
                    <div>
                        <div className="mb-3 flex gap-2 overflow-x-auto py-1 no-scrollbar" aria-label="重点关注维度">
                            {[{ key: 'all' as const, label: '全部' }, ...educationDimensions].map(item => (
                                <button
                                    key={item.key}
                                    type="button"
                                    aria-pressed={activeEducation === item.key}
                                    onClick={() => setActiveEducation(item.key)}
                                    className={`h-[var(--tm-size-touch)] min-w-[56px] rounded-[var(--tm-radius-control)] px-3 text-[var(--tm-font-size-compact)] font-semibold shadow-[var(--tm-shadow-control)] transition duration-200 ${
                                        activeEducation === item.key
                                            ? 'bg-[var(--tm-brand-primary)] text-white active:bg-[var(--tm-brand-primary-pressed)]'
                                            : 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]'
                                    }`}
                                >
                                    {item.label}
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

                <ReportSection id="student-coverage-title" title="学生覆盖情况" className="p-3">
                    <div className="mb-3 flex justify-end px-1">
                        <span className="rounded-full bg-[var(--tm-chart-data-default-soft)] px-3 py-1.5 text-[var(--tm-font-size-meta)] font-semibold text-[var(--tm-chart-data-default-text)]">
                            已覆盖 {coveredStudentCount}/{totalStudents}
                        </span>
                    </div>
                    <CoverageSortControls
                        sortKey={coverageSortKey}
                        direction={coverageSortDirection}
                        onSortKeyChange={setCoverageSortKey}
                        onDirectionChange={toggleCoverageSortDirection}
                    />
                    <StudentCoverageList rows={visibleCoverageRows} onSelectStudent={onSelectStudent} />
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

            <MobileBottomSheet
                open={showAllCoverage}
                title="全部学生覆盖情况"
                onClose={() => setShowAllCoverage(false)}
            >
                <CoverageSortControls
                    sortKey={coverageSortKey}
                    direction={coverageSortDirection}
                    onSortKeyChange={setCoverageSortKey}
                    onDirectionChange={toggleCoverageSortDirection}
                />
                <StudentCoverageList rows={sortedCoverageRows} onSelectStudent={onSelectStudent} />
            </MobileBottomSheet>
        </div>
    );
};

export default ClassReportView;
