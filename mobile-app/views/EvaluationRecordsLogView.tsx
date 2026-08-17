import React, { useMemo, useState } from 'react';
import { CalendarRange, ChevronDown } from 'lucide-react';
import { ASSETS } from '../assets/images';
import ReportDateRangeTabs from '../components/report/ReportDateRangeTabs';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import type { ClassInfo } from '../types';

interface EvaluationRecordsLogViewProps {
    classes: ClassInfo[];
}

type TimeRange = 'today' | 'week' | 'month' | 'term' | 'custom';

interface EvaluationRecord {
    id: string;
    classId: string;
    className: string;
    indicatorPath: string;
    detail: string;
    score: number;
    operator: string;
    occurredAt: Date;
}

const timeRangeTabs: Array<{ value: TimeRange; label: string }> = [
    { value: 'today', label: '今日' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'term', label: '本学期' },
    { value: 'custom', label: '自定义' },
];

const recordTemplates = [
    { dayOffset: 0, hour: 9, indicatorPath: '安全班级 / 班级安全秩序 / 公共秩序', detail: '课间活动组织有序', score: 2, operator: '李老师' },
    { dayOffset: 1, hour: 15, indicatorPath: '美净班级 / 环境卫生 / 午间清洁', detail: '午间卫生检查达标', score: 1, operator: '王老师' },
    { dayOffset: 3, hour: 10, indicatorPath: '健体班级 / 早操体锻 / 队列姿态', detail: '跑操队列整齐', score: 3, operator: '张老师' },
    { dayOffset: 6, hour: 14, indicatorPath: '文雅班级 / 路队管理 / 文明放学', detail: '放学路队出现讲话现象', score: -1, operator: '李老师' },
    { dayOffset: 12, hour: 8, indicatorPath: '诗意中队 / 少先队礼仪 / 佩戴规范', detail: '红领巾佩戴规范', score: 2, operator: '周老师' },
    { dayOffset: 38, hour: 16, indicatorPath: '安全班级 / 班级安全教育 / 演练参与', detail: '安全演练集合及时', score: 2, operator: '王老师' },
] as const;

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const addDays = (date: Date, days: number) => {
    const next = new Date(date);
    next.setDate(next.getDate() + days);
    return next;
};

const toDateInputValue = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
};

const getGradeLabel = (classInfo: ClassInfo) => classInfo.admissionYear
    ? `${classInfo.admissionYear}级`
    : classInfo.name.match(/^\d{4}级/)?.[0] ?? classInfo.gradeLevel;

const getClassLabel = (classInfo: ClassInfo) => classInfo.name.replace(getGradeLabel(classInfo), '') || classInfo.name;

const createEvaluationRecords = (classes: ClassInfo[], today: Date): EvaluationRecord[] => classes.flatMap((classInfo, classIndex) => (
    recordTemplates.map((template, templateIndex) => {
        const occurredAt = addDays(today, -template.dayOffset);
        occurredAt.setHours(template.hour, (classIndex * 7 + templateIndex * 11) % 60, 0, 0);
        const scoreDirection = (classIndex + templateIndex) % 5 === 0 ? -1 : 1;

        return {
            id: `${classInfo.id}-evaluation-${templateIndex}`,
            classId: classInfo.id,
            className: classInfo.name,
            indicatorPath: template.indicatorPath,
            detail: scoreDirection < 0 && template.score > 0 ? '值日完成不够及时' : template.detail,
            score: Math.abs(template.score) * scoreDirection,
            operator: template.operator,
            occurredAt,
        };
    })
));

const formatRecordTime = (date: Date, today: Date) => {
    const dayDistance = Math.round((startOfDay(today).getTime() - startOfDay(date).getTime()) / 86_400_000);
    const time = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
    if (dayDistance === 0) return `今天 ${time}`;
    if (dayDistance === 1) return `昨天 ${time}`;
    return `${date.getMonth() + 1}月${date.getDate()}日 ${time}`;
};

const EvaluationRecordsLogView: React.FC<EvaluationRecordsLogViewProps> = ({ classes }) => {
    const today = useMemo(() => startOfDay(new Date()), []);
    const [selectedGrade, setSelectedGrade] = useState('all');
    const [selectedClassId, setSelectedClassId] = useState('all');
    const [showClassFilterSheet, setShowClassFilterSheet] = useState(false);
    const [draftSelectedGrade, setDraftSelectedGrade] = useState('all');
    const [draftSelectedClassId, setDraftSelectedClassId] = useState('all');
    const [timeRange, setTimeRange] = useState<TimeRange>('week');
    const [showCustomDatePicker, setShowCustomDatePicker] = useState(false);
    const [customRange, setCustomRange] = useState(() => ({
        start: toDateInputValue(addDays(today, -6)),
        end: toDateInputValue(today),
    }));
    const [draftCustomRange, setDraftCustomRange] = useState(customRange);
    const records = useMemo(() => createEvaluationRecords(classes, today), [classes, today]);

    const gradeGroups = useMemo(() => classes.reduce<Array<{ grade: string; classes: ClassInfo[] }>>((groups, classInfo) => {
        const grade = getGradeLabel(classInfo);
        const currentGroup = groups.find(group => group.grade === grade);
        if (currentGroup) currentGroup.classes.push(classInfo);
        else groups.push({ grade, classes: [classInfo] });
        return groups;
    }, []), [classes]);
    const draftGradeClasses = draftSelectedGrade === 'all'
        ? []
        : gradeGroups.find(group => group.grade === draftSelectedGrade)?.classes ?? [];

    const filteredRecords = useMemo(() => records.filter(record => {
        if (selectedClassId !== 'all' && record.classId !== selectedClassId) return false;
        if (selectedGrade !== 'all') {
            const classBelongsToGrade = gradeGroups
                .find(group => group.grade === selectedGrade)
                ?.classes.some(classInfo => classInfo.id === record.classId);
            if (!classBelongsToGrade) return false;
        }
        const recordDay = startOfDay(record.occurredAt).getTime();
        if (timeRange === 'today') return recordDay === today.getTime();
        if (timeRange === 'week') return recordDay >= addDays(today, -6).getTime();
        if (timeRange === 'month') return recordDay >= addDays(today, -29).getTime();
        if (timeRange === 'term') return recordDay >= addDays(today, -149).getTime();

        const start = startOfDay(new Date(`${customRange.start}T00:00:00`)).getTime();
        const end = startOfDay(new Date(`${customRange.end}T00:00:00`)).getTime();
        return recordDay >= start && recordDay <= end;
    }).sort((left, right) => right.occurredAt.getTime() - left.occurredAt.getTime()), [customRange, gradeGroups, records, selectedClassId, selectedGrade, timeRange, today]);

    const customRangeInvalid = draftCustomRange.start === ''
        || draftCustomRange.end === ''
        || draftCustomRange.start > draftCustomRange.end;
    const selectedClass = classes.find(classInfo => classInfo.id === selectedClassId);
    const selectedGradeLabel = selectedGrade === 'all' ? '全部年级' : selectedGrade;
    const selectedClassLabel = selectedClass ? getClassLabel(selectedClass) : '全部班级';
    const recordScopeLabel = selectedClass?.name ?? (selectedGrade === 'all' ? '全部班级' : `${selectedGrade}全部班级`);

    const openClassFilter = () => {
        setDraftSelectedGrade(selectedGrade);
        setDraftSelectedClassId(selectedClassId);
        setShowClassFilterSheet(true);
    };

    const handleDraftGradeChange = (nextGrade: string) => {
        setDraftSelectedGrade(nextGrade);
        setDraftSelectedClassId('all');
    };

    const applyClassFilter = () => {
        setSelectedGrade(draftSelectedGrade);
        setSelectedClassId(draftSelectedClassId);
        setShowClassFilterSheet(false);
    };

    const handleTimeRangeChange = (nextTimeRange: TimeRange) => {
        if (nextTimeRange === 'custom') {
            setDraftCustomRange(customRange);
            setShowCustomDatePicker(true);
            return;
        }
        setTimeRange(nextTimeRange);
    };

    const applyCustomRange = () => {
        if (customRangeInvalid) return;
        setCustomRange(draftCustomRange);
        setTimeRange('custom');
        setShowCustomDatePicker(false);
    };

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)] text-[var(--tm-text-primary)]">
            <div className="sticky top-0 z-30 shrink-0 bg-[var(--tm-page-plain-header-bg)] [box-shadow:var(--tm-shadow-control)]">
                <button
                    type="button"
                    onClick={openClassFilter}
                    aria-label={`筛选班级范围，当前${selectedGradeLabel}，${selectedClassLabel}`}
                    className="flex h-[var(--tm-size-touch)] w-full items-center justify-between gap-3 px-[var(--tm-report-page-inline)] text-left transition-colors active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
                >
                    <span className="shrink-0 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">班级范围</span>
                    <span className="flex min-w-0 items-center gap-1 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">
                        <span className="truncate">{selectedGradeLabel} · {selectedClassLabel}</span>
                        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
                    </span>
                </button>
                <ReportDateRangeTabs
                    value={timeRange}
                    items={timeRangeTabs}
                    onChange={handleTimeRangeChange}
                    ariaLabel="评价记录时间范围"
                />
                {timeRange === 'custom' && (
                    <button
                        type="button"
                        onClick={() => {
                            setDraftCustomRange(customRange);
                            setShowCustomDatePicker(true);
                        }}
                        className="flex h-[var(--tm-report-custom-range-height)] w-full items-center gap-1 bg-[var(--tm-bg-surface-soft)] px-[var(--tm-report-page-inline)] text-left"
                        aria-label={`修改自定义日期范围，当前为${customRange.start}至${customRange.end}`}
                    >
                        <CalendarRange aria-hidden="true" className="h-3.5 w-3.5 text-[var(--tm-text-secondary)]" />
                        <span className="text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">自定义时间：</span>
                        <strong className="truncate text-[length:var(--tm-font-size-compact)] font-semibold tabular-nums">{customRange.start} 至 {customRange.end}</strong>
                    </button>
                )}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-report-page-inline)] pb-8 pt-[var(--tm-report-card-gap)] no-scrollbar">
                <div className="mb-2 flex min-h-8 items-center justify-between px-1 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
                    <span>{recordScopeLabel}</span>
                    <span className="tabular-nums">{filteredRecords.length}条记录</span>
                </div>

                {filteredRecords.length > 0 ? (
                    <ol className="overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-[var(--tm-report-card-padding)] [box-shadow:var(--tm-shadow-card)]" aria-label={`${recordScopeLabel}评价记录`}>
                        {filteredRecords.map(record => (
                            <li key={record.id} className="border-b border-[var(--tm-border-subtle)] py-4 last:border-0">
                                <div className="flex items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-2">
                                        {selectedClassId === 'all' && <span className="shrink-0 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-primary)]">{record.className}</span>}
                                        <time className="truncate text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{formatRecordTime(record.occurredAt, today)}</time>
                                    </div>
                                    <strong className={`shrink-0 text-[length:var(--tm-font-size-body)] font-semibold tabular-nums ${record.score >= 0 ? 'text-[var(--tm-chart-positive-text)]' : 'text-[var(--tm-chart-negative-text)]'}`}>
                                        {record.score > 0 ? '+' : ''}{record.score}分
                                    </strong>
                                </div>
                                <p className="mt-2 text-[length:var(--tm-font-size-body)] font-semibold leading-5 text-[var(--tm-text-primary)]">{record.detail}</p>
                                <p className="mt-1 text-[length:var(--tm-font-size-meta)] leading-5 text-[var(--tm-text-secondary)]">{record.indicatorPath}</p>
                                <p className="mt-1 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">评价人：{record.operator}</p>
                            </li>
                        ))}
                    </ol>
                ) : (
                    <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title="暂无评价记录" className="py-12" />
                )}
            </div>

            <MobileBottomSheet
                open={showClassFilterSheet}
                title="选择班级范围"
                onClose={() => setShowClassFilterSheet(false)}
                footer={(
                    <button
                        type="button"
                        onClick={applyClassFilter}
                        className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] transition active:bg-[var(--tm-brand-primary-pressed)]"
                    >
                        应用筛选
                    </button>
                )}
            >
                <div className="divide-y divide-[var(--tm-border-subtle)] pb-2">
                    <label className="relative flex h-[var(--tm-size-touch)] items-center gap-3">
                        <span className="shrink-0 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">年级</span>
                        <select
                            value={draftSelectedGrade}
                            onChange={event => handleDraftGradeChange(event.target.value)}
                            aria-label="选择年级"
                            className="h-full min-w-0 flex-1 appearance-none bg-transparent pr-6 text-right text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] outline-none"
                        >
                            <option value="all">全部</option>
                            {gradeGroups.map(group => <option key={group.grade} value={group.grade}>{group.grade}</option>)}
                        </select>
                        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 h-4 w-4 text-[var(--tm-text-tertiary)]" />
                    </label>

                    <label className="relative flex h-[var(--tm-size-touch)] items-center gap-3">
                        <span className="shrink-0 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">班级</span>
                        <select
                            value={draftSelectedClassId}
                            onChange={event => setDraftSelectedClassId(event.target.value)}
                            aria-label="选择班级"
                            disabled={draftSelectedGrade === 'all'}
                            className="h-full min-w-0 flex-1 appearance-none bg-transparent pr-6 text-right text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] outline-none disabled:text-[var(--tm-text-tertiary)]"
                        >
                            <option value="all">全部</option>
                            {draftGradeClasses.map(classInfo => <option key={classInfo.id} value={classInfo.id}>{getClassLabel(classInfo)}</option>)}
                        </select>
                        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-0 h-4 w-4 text-[var(--tm-text-tertiary)]" />
                    </label>
                </div>
            </MobileBottomSheet>

            <MobileBottomSheet
                open={showCustomDatePicker}
                title="选择日期范围"
                onClose={() => setShowCustomDatePicker(false)}
                footer={(
                    <button
                        type="button"
                        disabled={customRangeInvalid}
                        onClick={applyCustomRange}
                        className="flex h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] transition active:bg-[var(--tm-brand-primary-pressed)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)]"
                    >
                        应用日期
                    </button>
                )}
            >
                <div className="grid grid-cols-2 gap-3 pb-2">
                    <label className="space-y-2 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
                        <span>开始日期</span>
                        <input
                            type="date"
                            value={draftCustomRange.start}
                            max={draftCustomRange.end || undefined}
                            onChange={event => setDraftCustomRange(value => ({ ...value, start: event.target.value }))}
                            className="h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-2 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]"
                        />
                    </label>
                    <label className="space-y-2 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
                        <span>结束日期</span>
                        <input
                            type="date"
                            value={draftCustomRange.end}
                            min={draftCustomRange.start || undefined}
                            onChange={event => setDraftCustomRange(value => ({ ...value, end: event.target.value }))}
                            className="h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-2 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]"
                        />
                    </label>
                </div>
            </MobileBottomSheet>
        </div>
    );
};

export default EvaluationRecordsLogView;
