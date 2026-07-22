import React, { useMemo, useState } from 'react';
import { ArrowRight, CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react';
import {
    TeacherReportBarChart,
    TeacherReportDonutChart,
    type TeacherReportBarSeries,
    type TeacherReportChartColor,
} from '../components/report/TeacherReportChart';
import { ClassInfo, Student } from '../types';

interface ClassReportViewProps {
    classInfo: ClassInfo;
    students: Student[];
    onSelectStudent: (student: Student) => void;
    onGoToClassDetail: () => void;
}

type ReportScope = 'mine' | 'all';
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

const cardClass = 'rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-card)]';

const SectionTitle = ({ children }: { children: React.ReactNode }) => (
    <h2 className="mb-3 text-[var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">
        {children}
    </h2>
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
    onSelectStudent,
    onGoToClassDetail,
}) => {
    const [scope, setScope] = useState<ReportScope>('mine');
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [customRange, setCustomRange] = useState({ start: '', end: '' });
    const [rankingMode, setRankingMode] = useState<RankingMode>('net');
    const [activeEducation, setActiveEducation] = useState<EducationKey>('all');
    const [showAllRanking, setShowAllRanking] = useState(false);
    const [showAllFocus, setShowAllFocus] = useState(false);
    const [showAllUnreviewed, setShowAllUnreviewed] = useState(false);

    const totalStudents = students.length || classInfo.studentCount;

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
        const scopeMultiplier = scope === 'all' ? 1 : 0.42;
        const dataMultiplier = selectedPeriodMultiplier * scopeMultiplier;
        const totalRecords = Math.max(1, Math.round(447 * dataMultiplier));
        const positiveRecords = Math.round(totalRecords * 0.84);
        const negativeRecords = totalRecords - positiveRecords;
        const coverageBase = Math.min(1, 0.5 + selectedPeriodMultiplier * 0.14 + (scope === 'all' ? 0.32 : 0.06));
        const coveredStudents = Math.min(totalStudents, Math.round(totalStudents * coverageBase));
        const previousRecords = Math.max(1, Math.round(totalRecords * 0.78));
        const previousCovered = Math.max(0, Math.min(totalStudents, coveredStudents - Math.max(0, Math.round(totalStudents * 0.04))));

        const eventWeights = [0.22, 0.2, 0.18, 0.21, 0.19];
        const educationEvents = educationDimensions.map((dimension, index) => ({
            ...dimension,
            value: Math.max(1, Math.round(totalRecords * eventWeights[index])),
        }));
        const addScores = [116, 175, 394, 332, 288].map(value => Math.max(1, Math.round(value * dataMultiplier)));
        const deductScores = [13, 21, 46, 80, 32].map(value => Math.max(0, Math.round(value * dataMultiplier)));
        const netScores = addScores.map((value, index) => value - deductScores[index]);
        const unreviewedStudents = students.slice(coveredStudents);

        return {
            totalRecords,
            positiveRecords,
            negativeRecords,
            coveredStudents,
            previousRecords,
            previousCovered,
            dataMultiplier,
            educationEvents,
            addScores,
            deductScores,
            netScores,
            unreviewedStudents,
        };
    }, [customRange.end, customRange.start, scope, students, timeRange, totalStudents]);

    const recordDistributionSeries = useMemo<TeacherReportBarSeries[]>(() => {
        const currentValues = reportData.educationEvents.map(item => item.value);
        return [
            { name: '本周期', values: currentValues, color: 'virtue' as const },
            {
                name: '上周期',
                values: currentValues.map(value => Math.max(1, Math.round(value * 0.78))),
                color: 'virtue' as const,
                muted: true,
            },
            {
                name: '年级平均',
                values: currentValues.map(value => Math.max(1, Math.round(value * 0.85))),
                color: 'peer' as const,
            },
        ];
    }, [reportData]);

    const educationScoreSeries = useMemo<TeacherReportBarSeries[]>(() => [
        { name: '加分', values: reportData.addScores, color: 'positive' },
        { name: '扣分', values: reportData.deductScores, color: 'negative' },
        { name: '净得分', values: reportData.netScores, color: 'total' },
    ], [reportData]);

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
    const visibleUnreviewedStudents = showAllUnreviewed
        ? reportData.unreviewedStudents
        : reportData.unreviewedStudents.slice(0, 6);

    const reportKey = `${scope}-${timeRange}-${customRange.start}-${customRange.end}`;

    return (
        <div className="min-h-full bg-transparent pb-8 text-[var(--tm-text-primary)]">
            <header className="border-b border-white/50 bg-[var(--tm-bg-page-glass)] px-5 pb-3 pt-4 backdrop-blur-xl">
                <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="min-w-0">
                        <h1 className="truncate text-[var(--tm-font-size-page-title)] font-bold leading-tight">
                            {classInfo.name}
                        </h1>
                        <p className="mt-1 text-[var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">
                            {totalStudents}名学生
                        </p>
                    </div>
                    <div className="grid shrink-0 grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] p-1">
                        {([
                            { key: 'mine' as const, label: '我的记录' },
                            { key: 'all' as const, label: '全班汇总' },
                        ]).map(item => (
                            <button
                                key={item.key}
                                type="button"
                                aria-pressed={scope === item.key}
                                onClick={() => setScope(item.key)}
                                className={`h-11 min-w-[76px] rounded-[8px] px-3 text-[var(--tm-font-size-compact)] font-semibold transition duration-200 ${
                                    scope === item.key
                                        ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] shadow-[var(--tm-shadow-control)]'
                                        : 'text-[var(--tm-brand-primary-strong)]'
                                }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex overflow-x-auto rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] p-1 no-scrollbar">
                    {timeRangeTabs.map(item => (
                        <button
                            key={item.key}
                            type="button"
                            aria-pressed={timeRange === item.key}
                            onClick={() => setTimeRange(item.key)}
                            className={`h-11 min-w-[64px] flex-1 rounded-[8px] px-2 text-[var(--tm-font-size-meta)] font-semibold transition duration-200 ${
                                timeRange === item.key
                                    ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] shadow-[var(--tm-shadow-control)]'
                                    : 'text-[var(--tm-brand-primary-strong)]'
                            }`}
                        >
                            {item.label}
                        </button>
                    ))}
                </div>

                {timeRange === 'custom' && (
                    <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
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

            <div className="space-y-6 px-5 pt-5">
                <section aria-labelledby="class-report-overview-title">
                    <SectionTitle><span id="class-report-overview-title">概况</span></SectionTitle>
                    <div className={`${cardClass} grid grid-cols-2 p-4`}>
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
                </section>

                <section aria-labelledby="record-distribution-title">
                    <SectionTitle><span id="record-distribution-title">评价记录分布</span></SectionTitle>
                    <div className={`${cardClass} px-3 pb-2 pt-4`}>
                        <TeacherReportBarChart
                            ariaLabel="德智体美劳五类评价记录在本周期、上周期和年级平均的对比"
                            categories={educationDimensions.map(item => item.label)}
                            categoryColors={educationDimensions.map(item => item.color)}
                            series={recordDistributionSeries}
                            optionKey={`records-${reportKey}`}
                            className="h-56"
                        />
                    </div>
                </section>

                <section aria-labelledby="education-score-title">
                    <SectionTitle><span id="education-score-title">五育得分分布</span></SectionTitle>
                    <div className={`${cardClass} px-3 pb-2 pt-4`}>
                        <TeacherReportBarChart
                            ariaLabel="德育、智育、体育、美育、劳育的加分、扣分与净得分对比"
                            categories={educationDimensions.map(item => item.label)}
                            series={educationScoreSeries}
                            optionKey={`scores-${reportKey}`}
                            className="h-64"
                        />
                    </div>
                </section>

                <section aria-labelledby="education-event-title">
                    <SectionTitle><span id="education-event-title">五育事件分布</span></SectionTitle>
                    <div className={`${cardClass} px-3 pb-3 pt-2`}>
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
                    </div>
                </section>

                <section aria-labelledby="ranking-title">
                    <SectionTitle><span id="ranking-title">排行榜</span></SectionTitle>
                    <div className={`${cardClass} overflow-hidden p-3`}>
                        <div className="mb-2 grid grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] p-1">
                            {([
                                { key: 'net' as const, label: '净得分排行' },
                                { key: 'progress' as const, label: '进步排行' },
                            ]).map(item => (
                                <button
                                    key={item.key}
                                    type="button"
                                    aria-pressed={rankingMode === item.key}
                                    onClick={() => setRankingMode(item.key)}
                                    className={`h-11 rounded-[8px] text-[var(--tm-font-size-compact)] font-semibold transition duration-200 ${
                                        rankingMode === item.key
                                            ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] shadow-[var(--tm-shadow-control)]'
                                            : 'text-[var(--tm-brand-primary-strong)]'
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
                                        <span className={`text-[var(--tm-font-size-body)] font-semibold ${rankingMode === 'net' ? 'text-[var(--tm-status-positive-strong)]' : 'text-[var(--tm-brand-secondary-strong)]'}`}>
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
                                className="mt-2 flex min-h-11 w-full items-center justify-center gap-1 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)]"
                            >
                                {showAllRanking ? '收起排行' : '查看前10名'}
                                {showAllRanking ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                            </button>
                        )}
                    </div>
                </section>

                <section aria-labelledby="focus-students-title">
                    <SectionTitle><span id="focus-students-title">重点关注对象</span></SectionTitle>
                    <div className={`${cardClass} p-3`}>
                        <div className="mb-3 flex gap-1 overflow-x-auto rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] p-1 no-scrollbar">
                            {[{ key: 'all' as const, label: '全部' }, ...educationDimensions].map(item => (
                                <button
                                    key={item.key}
                                    type="button"
                                    aria-pressed={activeEducation === item.key}
                                    onClick={() => setActiveEducation(item.key)}
                                    className={`h-11 min-w-[56px] rounded-[8px] px-3 text-[var(--tm-font-size-compact)] font-semibold transition duration-200 ${
                                        activeEducation === item.key
                                            ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] shadow-[var(--tm-shadow-control)]'
                                            : 'text-[var(--tm-brand-primary-strong)]'
                                    }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <div className="mb-1 text-center text-[var(--tm-font-size-meta)] font-semibold text-[var(--tm-status-positive-strong)]">加分 Top 10</div>
                                <ol>
                                    {visiblePositiveFocus.map((row, index) => (
                                        <li key={row.student.id}>
                                            <button
                                                type="button"
                                                onClick={() => onSelectStudent(row.student)}
                                                className="grid min-h-11 w-full grid-cols-[20px_1fr_auto] items-center gap-1 rounded-[8px] px-1 text-left transition active:bg-[var(--tm-status-positive-soft)]"
                                            >
                                                <span className="text-center text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">{index + 1}</span>
                                                <span className="truncate text-[var(--tm-font-size-compact)]">{row.student.name}</span>
                                                <span className="text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-status-positive-strong)]">+{row.score}</span>
                                            </button>
                                        </li>
                                    ))}
                                </ol>
                            </div>
                            <div>
                                <div className="mb-1 text-center text-[var(--tm-font-size-meta)] font-semibold text-[var(--tm-status-negative-strong)]">扣分 Top 10</div>
                                <ol>
                                    {visibleNegativeFocus.map((row, index) => (
                                        <li key={row.student.id}>
                                            <button
                                                type="button"
                                                onClick={() => onSelectStudent(row.student)}
                                                className="grid min-h-11 w-full grid-cols-[20px_1fr_auto] items-center gap-1 rounded-[8px] px-1 text-left transition active:bg-[var(--tm-status-negative-soft)]"
                                            >
                                                <span className="text-center text-[var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">{index + 1}</span>
                                                <span className="truncate text-[var(--tm-font-size-compact)]">{row.student.name}</span>
                                                <span className="text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-status-negative-strong)]">-{row.score}</span>
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
                </section>

                <section aria-labelledby="unreviewed-title">
                    <SectionTitle><span id="unreviewed-title">未点评学生清单</span></SectionTitle>
                    <div className={`${cardClass} p-4`}>
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <span className="text-[var(--tm-font-size-body)] font-medium">学生覆盖进度</span>
                            <span className="rounded-full bg-[var(--tm-status-positive-soft)] px-3 py-1.5 text-[var(--tm-font-size-meta)] font-semibold text-[var(--tm-status-positive-strong)]">
                                已点评 {reportData.coveredStudents}/{totalStudents}
                            </span>
                        </div>

                        {reportData.unreviewedStudents.length === 0 ? (
                            <div className="flex min-h-36 flex-col items-center justify-center text-center">
                                <CheckCircle2 className="mb-3 h-8 w-8 text-[var(--tm-status-positive)]" />
                                <strong className="text-[var(--tm-font-size-card-title)] text-[var(--tm-status-positive-strong)]">全班学生均已点评</strong>
                            </div>
                        ) : (
                            <>
                                <div className="grid grid-cols-2 gap-2">
                                    {visibleUnreviewedStudents.map(student => (
                                        <button
                                            key={student.id}
                                            type="button"
                                            onClick={() => onSelectStudent(student)}
                                            className="min-h-11 truncate rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3 text-left text-[var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] transition active:bg-[var(--tm-brand-primary-soft)]"
                                        >
                                            {student.name}
                                        </button>
                                    ))}
                                </div>
                                {reportData.unreviewedStudents.length > 6 && (
                                    <button
                                        type="button"
                                        onClick={() => setShowAllUnreviewed(value => !value)}
                                        className="mt-2 flex min-h-11 w-full items-center justify-center gap-1 rounded-[var(--tm-radius-control)] text-[var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)]"
                                    >
                                        {showAllUnreviewed ? '收起名单' : `查看剩余${reportData.unreviewedStudents.length - 6}人`}
                                        {showAllUnreviewed ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                                    </button>
                                )}
                                <button
                                    type="button"
                                    onClick={onGoToClassDetail}
                                    className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-4 text-[var(--tm-font-size-body)] font-semibold text-white transition active:bg-[var(--tm-brand-primary-pressed)]"
                                >
                                    去点评
                                    <ArrowRight className="h-4 w-4" />
                                </button>
                            </>
                        )}
                    </div>
                </section>
            </div>
        </div>
    );
};

export default ClassReportView;
