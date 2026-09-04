import React, { useEffect, useMemo, useState } from 'react';
import { CalendarRange, Check, ChevronDown, Pause, Pencil, Play, Trash2, X } from 'lucide-react';
import { ASSETS } from '../assets/images';
import EvaluationIndicatorCascadePicker from '../components/evaluation/EvaluationIndicatorCascadePicker';
import ReportDateRangeTabs from '../components/report/ReportDateRangeTabs';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileClassCascadePicker from '../components/ui/MobileClassCascadePicker';
import MobileConfirmSheet from '../components/ui/MobileConfirmSheet';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import type { ClassInfo } from '../types';
import { getTeacherClassDisplayName, type TeacherSpaceOption } from '../domain/teacherSpaceAccess';

interface EvaluationRecordsLogViewProps {
    classes: ClassInfo[];
    currentSpace: TeacherSpaceOption;
    canEditRecords: boolean;
    canDeleteRecords: boolean;
}

type TimeRange = 'today' | 'week' | 'month' | 'term' | 'custom';

interface EvaluationRecord {
    id: string;
    classId: string;
    className: string;
    indicatorPath: string;
    reason: string;
    originalContent: string;
    sourceType: 'text' | 'voice';
    audioTranscript?: string;
    audioDuration?: string;
    score: number;
    operator: string;
    occurredAt: Date;
    recordedAt: Date;
}

interface EvaluationRecordDraft {
    occurredOn: string;
    classId: string;
    indicatorPath: [string, string, string];
    score: string;
}

type RecordEditScope = 'date' | 'class' | 'indicator' | 'score';

const timeRangeTabs: Array<{ value: TimeRange; label: string }> = [
    { value: 'today', label: '今日' },
    { value: 'week', label: '本周' },
    { value: 'month', label: '本月' },
    { value: 'term', label: '本学期' },
    { value: 'custom', label: '自定义' },
];

const recordTemplates = [
    {
        dayOffset: 0,
        hour: 9,
        indicatorPath: '诗意中队 / 集会礼仪 / 仪容着装',
        reason: '该班在国旗下讲话活动中有3名学生未整齐穿戴校服，按每人0.5分计算，共扣1.50分。',
        originalContent: '{className}在国旗下讲话的活动中，有三名学生没有穿校服。',
        sourceType: 'voice',
        audioDuration: '00:12',
        score: -1.5,
        operator: '李老师',
    },
    {
        dayOffset: 1,
        hour: 15,
        indicatorPath: '美净班级 / 环境卫生 / 午间清洁',
        reason: '该班午间清洁完成及时，地面与公共区域均达到卫生检查标准，共加1.00分。',
        originalContent: '午间卫生检查，{className}地面和公共区域都很干净，值日完成得很好。',
        sourceType: 'text',
        score: 1,
        operator: '王老师',
    },
    {
        dayOffset: 3,
        hour: 10,
        indicatorPath: '健体班级 / 早操体锻 / 队列姿态',
        reason: '该班跑操过程中队列整齐、口令响应一致，符合早操体锻要求，共加2.00分。',
        originalContent: '{className}今天跑操队列很整齐，转弯和口令响应都很好。',
        sourceType: 'voice',
        audioDuration: '00:09',
        score: 2,
        operator: '张老师',
    },
    {
        dayOffset: 6,
        hour: 14,
        indicatorPath: '文雅班级 / 路队管理 / 文明放学',
        reason: '该班放学路队中出现多人交谈，影响队列秩序，按本项规则共扣1.00分。',
        originalContent: '{className}放学路队里有几名学生一直讲话，队伍有些散。',
        sourceType: 'text',
        score: -1,
        operator: '李老师',
    },
    {
        dayOffset: 12,
        hour: 8,
        indicatorPath: '诗意中队 / 少先队礼仪 / 佩戴规范',
        reason: '该班少先队员红领巾佩戴整齐，晨检结果符合规范，共加1.00分。',
        originalContent: '晨检时，{className}少先队员红领巾都佩戴得很规范。',
        sourceType: 'text',
        score: 1,
        operator: '周老师',
    },
    {
        dayOffset: 38,
        hour: 16,
        indicatorPath: '安全班级 / 班级安全教育 / 演练参与',
        reason: '该班安全演练集合及时、疏散过程有序，符合演练参与要求，共加2.00分。',
        originalContent: '{className}安全演练集合很及时，整个疏散过程安静有序。',
        sourceType: 'voice',
        audioDuration: '00:10',
        score: 2,
        operator: '王老师',
    },
] as const;

const evaluationIndicatorPaths = recordTemplates.map(template => template.indicatorPath.split(' / ') as [string, string, string]);

const getEvaluationIndicatorOptions = (path: readonly string[], depth: number) => Array.from(new Set(
    evaluationIndicatorPaths
        .filter(candidate => candidate.slice(0, depth).every((label, index) => label === path[index]))
        .map(candidate => candidate[depth])
        .filter(Boolean),
));

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

const getGradeLabel = (classInfo: ClassInfo) => classInfo.gradeLevel;

const getClassLabel = (classInfo: ClassInfo) => classInfo.name.replace(getGradeLabel(classInfo), '') || classInfo.name;

const createEvaluationRecords = (classes: ClassInfo[], today: Date, getClassLabel: (classInfo: ClassInfo) => string): EvaluationRecord[] => classes.flatMap((classInfo, classIndex) => (
    recordTemplates.map((template, templateIndex) => {
        const occurredAt = addDays(today, -template.dayOffset);
        occurredAt.setHours(template.hour, (classIndex * 7 + templateIndex * 11) % 60, 0, 0);
        const classLabel = getClassLabel(classInfo);
        const originalContent = template.originalContent.replace('{className}', classLabel);

        return {
            id: `${classInfo.id}-evaluation-${templateIndex}`,
            classId: classInfo.id,
            className: classLabel,
            indicatorPath: template.indicatorPath,
            reason: template.reason,
            originalContent,
            sourceType: template.sourceType,
            audioTranscript: template.sourceType === 'voice' ? originalContent : undefined,
            audioDuration: 'audioDuration' in template ? template.audioDuration : undefined,
            score: template.score,
            operator: template.operator,
            occurredAt,
            recordedAt: new Date(occurredAt),
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

const formatScore = (score: number) => `${score > 0 ? '+' : ''}${score.toFixed(2)}`;

const formatRecognitionDate = (date: Date) => `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;

const createRecordDraft = (record: EvaluationRecord): EvaluationRecordDraft => {
    const indicatorPath = record.indicatorPath.split(' / ');
    return {
        occurredOn: toDateInputValue(record.occurredAt),
        classId: record.classId,
        indicatorPath: [indicatorPath[0] ?? '', indicatorPath[1] ?? '', indicatorPath[2] ?? ''],
        score: record.score.toFixed(2),
    };
};

const recordFieldClass = 'mt-2 h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]';

interface EvaluationIndicatorPathProps {
    indicatorPath: string;
    className?: string;
    variant?: 'default' | 'compact-full';
}

const EvaluationIndicatorPath: React.FC<EvaluationIndicatorPathProps> = ({ indicatorPath, className = '', variant = 'default' }) => {
    const indicatorParts = indicatorPath.split(' / ');
    const compactFull = variant === 'compact-full';

    return (
        <p
            aria-label={`指标：${indicatorParts.join('，')}`}
            className={`flex min-w-0 items-center whitespace-nowrap font-medium leading-none ${compactFull ? 'overflow-x-auto text-[length:var(--tm-font-size-badge)] no-scrollbar' : 'text-[length:var(--tm-font-size-meta)]'} ${className}`}
        >
            {indicatorParts.map((indicator, index) => (
                <React.Fragment key={`${indicator}-${index}`}>
                    {index > 0 && <span aria-hidden="true" className={`shrink-0 text-[var(--tm-evaluation-indicator-separator)] ${compactFull ? 'px-0.5' : 'px-1'}`}>›</span>}
                    <span className={`flex items-center rounded-[var(--tm-radius-inner)] border border-[var(--tm-evaluation-indicator-border)] bg-[var(--tm-evaluation-indicator-bg)] text-[var(--tm-evaluation-indicator-text)] ${compactFull ? 'h-5 shrink-0 px-1' : `h-6 px-1.5 ${index === indicatorParts.length - 1 ? 'shrink-0' : 'min-w-0 truncate'}`}`}>{indicator}</span>
                </React.Fragment>
            ))}
        </p>
    );
};

const EvaluationRecordsLogView: React.FC<EvaluationRecordsLogViewProps> = ({ classes, currentSpace, canEditRecords, canDeleteRecords }) => {
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
    const getClassLabel = (classInfo: ClassInfo) => getTeacherClassDisplayName(classInfo, currentSpace);
    const [records, setRecords] = useState(() => createEvaluationRecords(classes, today, getClassLabel));
    const [activeRecordId, setActiveRecordId] = useState('');
    const [isEditingRecord, setIsEditingRecord] = useState(false);
    const [recordEditScope, setRecordEditScope] = useState<RecordEditScope | null>(null);
    const [recordDraft, setRecordDraft] = useState<EvaluationRecordDraft | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [playingRecordId, setPlayingRecordId] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        setRecords(createEvaluationRecords(classes, today, getClassLabel));
        setActiveRecordId('');
    }, [classes, currentSpace, today]);

    useEffect(() => () => window.speechSynthesis?.cancel(), []);

    const gradeGroups = useMemo(() => {
        const gradeLabels = getTeacherSchoolGradeOptions(currentSpace)
            ?? Array.from(new Set(classes.map(classInfo => getGradeLabel(classInfo))));
        return gradeLabels.map(grade => ({
            grade,
            classes: classes.filter(classInfo => getGradeLabel(classInfo) === grade),
        }));
    }, [classes, currentSpace]);
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
    const selectedScopeLabel = selectedClass ? getClassLabel(selectedClass) : selectedGradeLabel;
    const activeRecord = records.find(record => record.id === activeRecordId) ?? null;
    const getRecordClassLabel = (record: EvaluationRecord) => (
        classes.find(classInfo => classInfo.id === record.classId)
            ? getClassLabel(classes.find(classInfo => classInfo.id === record.classId)!)
            : record.className
    );
    const detailSheetTitle = isEditingRecord && recordEditScope
        ? ({ date: '修改识别日期', class: '修改记录对象', indicator: '修改指标', score: '修改得分' } as const)[recordEditScope]
        : '评价详情';
    const draftScore = Number(recordDraft?.score ?? '');
    const draftIndicatorPath = recordDraft?.indicatorPath ?? ['', '', ''];
    const levelOneIndicatorOptions = getEvaluationIndicatorOptions(draftIndicatorPath, 0);
    const levelTwoIndicatorOptions = getEvaluationIndicatorOptions(draftIndicatorPath, 1);
    const levelThreeIndicatorOptions = getEvaluationIndicatorOptions(draftIndicatorPath, 2);
    const parsedDraftDate = recordDraft?.occurredOn ? new Date(`${recordDraft.occurredOn}T00:00:00`) : null;
    const recordDraftInvalid = !recordDraft
        || !recordEditScope
        || (recordEditScope === 'date' && (!parsedDraftDate || Number.isNaN(parsedDraftDate.getTime())))
        || (recordEditScope === 'class' && !classes.some(classInfo => classInfo.id === recordDraft.classId))
        || (recordEditScope === 'indicator' && recordDraft.indicatorPath.some(item => item.trim() === ''))
        || (recordEditScope === 'score' && (
            !Number.isFinite(draftScore)
            || draftScore === 0
            || draftScore < -100
            || draftScore > 100
        ));

    useEffect(() => {
        if (!statusMessage) return undefined;
        const timer = window.setTimeout(() => setStatusMessage(''), 2400);
        return () => window.clearTimeout(timer);
    }, [statusMessage]);

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

    const openRecordDetail = (record: EvaluationRecord) => {
        setActiveRecordId(record.id);
        setIsEditingRecord(false);
        setRecordEditScope(null);
        setRecordDraft(null);
    };

    const closeRecordDetail = () => {
        window.speechSynthesis?.cancel();
        setPlayingRecordId('');
        setIsEditingRecord(false);
        setRecordEditScope(null);
        setRecordDraft(null);
        setActiveRecordId('');
    };

    const startEditingRecord = (scope: RecordEditScope) => {
        if (!activeRecord || !canEditRecords) return;
        setRecordDraft(createRecordDraft(activeRecord));
        setRecordEditScope(scope);
        setIsEditingRecord(true);
    };

    const updateDraftIndicator = (depth: number, value: string) => {
        setRecordDraft(current => {
            if (!current) return current;
            const nextPath = [...current.indicatorPath] as [string, string, string];
            nextPath[depth] = value;
            for (let index = depth + 1; index < nextPath.length; index += 1) nextPath[index] = '';
            return { ...current, indicatorPath: nextPath };
        });
    };

    const saveRecordChanges = () => {
        if (!activeRecord || !recordDraft || recordDraftInvalid || !canEditRecords) return;
        const nextClass = classes.find(classInfo => classInfo.id === recordDraft.classId);
        if (!nextClass) return;
        const [year, month, day] = recordDraft.occurredOn.split('-').map(Number);
        const nextOccurredAt = new Date(activeRecord.occurredAt);
        nextOccurredAt.setFullYear(year, month - 1, day);
        setRecords(current => current.map(record => record.id === activeRecord.id ? {
            ...record,
            occurredAt: nextOccurredAt,
            classId: nextClass.id,
            className: getClassLabel(nextClass),
            indicatorPath: recordDraft.indicatorPath.map(item => item.trim()).join(' / '),
            score: Number(draftScore.toFixed(2)),
        } : record));
        setIsEditingRecord(false);
        setRecordEditScope(null);
        setRecordDraft(null);
        setStatusMessage('评价记录已更新');
    };

    const deleteActiveRecord = () => {
        if (!activeRecord || !canDeleteRecords) return;
        setRecords(current => current.filter(record => record.id !== activeRecord.id));
        setShowDeleteConfirm(false);
        setActiveRecordId('');
        setIsEditingRecord(false);
        setRecordEditScope(null);
        setRecordDraft(null);
        setStatusMessage('评价记录已删除');
    };

    const playRecordAudio = (record: EvaluationRecord) => {
        if (!record.audioTranscript) return;
        if (!('speechSynthesis' in window)) {
            setStatusMessage('当前环境暂不支持语音播放');
            return;
        }
        if (playingRecordId === record.id) {
            window.speechSynthesis.cancel();
            setPlayingRecordId('');
            return;
        }
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(record.audioTranscript);
        utterance.lang = 'zh-CN';
        utterance.rate = 0.95;
        utterance.onend = () => setPlayingRecordId('');
        utterance.onerror = () => setPlayingRecordId('');
        setPlayingRecordId(record.id);
        window.speechSynthesis.speak(utterance);
    };

    return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)] text-[var(--tm-text-primary)]">
            <div className="sticky top-0 z-30 shrink-0 bg-[var(--tm-page-plain-header-bg)] [box-shadow:var(--tm-shadow-control)]">
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

            <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-report-page-inline)] pb-8 pt-[var(--tm-space-2)] no-scrollbar">
                <div className="mb-2 flex min-h-[var(--tm-size-touch)] items-center justify-between gap-3 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
                    <button
                        type="button"
                        onClick={openClassFilter}
                        aria-label={`筛选班级，当前${selectedScopeLabel}`}
                        className="-ml-2 flex min-h-[var(--tm-size-touch)] min-w-0 items-center gap-1 px-2 text-left transition-colors active:text-[var(--tm-brand-primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                    >
                        <span className="truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{selectedScopeLabel}</span>
                        <ChevronDown aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
                    </button>
                    <span className="tabular-nums">{filteredRecords.length}条记录</span>
                </div>

                {filteredRecords.length > 0 ? (
                    <ol className="space-y-4" aria-label={`${selectedScopeLabel}评价记录`}>
                        {filteredRecords.map(record => {
                            return (
                                <li key={record.id}>
                                    <button
                                        type="button"
                                        onClick={() => openRecordDetail(record)}
                                        aria-label={`查看${getRecordClassLabel(record)}评价详情，${formatScore(record.score)}`}
                                        className="w-full rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-report-card-padding)] text-left [box-shadow:var(--tm-shadow-card)] transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                                    >
                                        {selectedClassId === 'all' && (
                                            <p className="truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{getRecordClassLabel(record)}</p>
                                        )}
                                        <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 ${selectedClassId === 'all' ? 'mt-3' : ''}`}>
                                            <EvaluationIndicatorPath indicatorPath={record.indicatorPath} />
                                            <strong className={`shrink-0 text-[length:var(--tm-font-size-body)] font-semibold tabular-nums ${record.score >= 0 ? 'text-[var(--tm-chart-positive-text)]' : 'text-[var(--tm-chart-negative-text)]'}`}>
                                                {formatScore(record.score)}
                                            </strong>
                                        </div>
                                        <p className="mt-3 text-[length:var(--tm-font-size-body)] tm-font-regular leading-6 text-[var(--tm-text-primary)]">{record.reason}</p>
                                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--tm-border-subtle)] pt-3">
                                            <time className="text-[length:var(--tm-font-size-meta)] tm-font-regular tabular-nums text-[var(--tm-text-tertiary)]">{formatRecordTime(record.occurredAt, today)}</time>
                                            <span className="shrink-0 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{record.operator}</span>
                                        </div>
                                    </button>
                                </li>
                            );
                        })}
                    </ol>
                ) : (
                    <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title="暂无评价记录" className="py-12" />
                )}
            </div>

            <MobileBottomSheet
                open={Boolean(activeRecord)}
                title={detailSheetTitle}
                onClose={closeRecordDetail}
                footerDivider={false}
                header={activeRecord ? (
                    <header className="flex h-14 shrink-0 items-center justify-between px-4">
                        <h2 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">{detailSheetTitle}</h2>
                        <div className="flex items-center">
                            {!isEditingRecord && canDeleteRecords && (
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    aria-label="删除评价记录"
                                    className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-status-negative)] active:bg-[var(--tm-status-negative-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                                >
                                    <Trash2 aria-hidden="true" className="h-[18px] w-[18px]" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={closeRecordDetail}
                                aria-label={`关闭${detailSheetTitle}`}
                                className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                            >
                                <X aria-hidden="true" className="h-5 w-5" />
                            </button>
                        </div>
                    </header>
                ) : undefined}
                footer={isEditingRecord ? (
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            type="button"
                            onClick={() => {
                                setIsEditingRecord(false);
                                setRecordEditScope(null);
                                setRecordDraft(null);
                            }}
                            className="flex min-h-12 items-center justify-center rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]"
                        >
                            取消
                        </button>
                        <button
                            type="button"
                            disabled={recordDraftInvalid}
                            onClick={saveRecordChanges}
                            className="flex min-h-12 items-center justify-center gap-1.5 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)]"
                        >
                            <Check aria-hidden="true" className="h-4 w-4" />保存
                        </button>
                    </div>
                ) : undefined}
            >
                {activeRecord && !isEditingRecord && (
                    <div className="space-y-4">
                        <section>
                            <h3 className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">AI识别</h3>
                            <div className="mt-2.5 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-3 py-2.5">
                                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1">
                                    <span className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">识别日期：</span>
                                    {canEditRecords ? (
                                        <button
                                            type="button"
                                            onClick={() => startEditingRecord('date')}
                                            aria-label={`修改识别日期，当前${formatRecognitionDate(activeRecord.occurredAt)}`}
                                            className="-mr-2 flex min-h-11 min-w-0 items-center gap-1 rounded-[var(--tm-radius-inner)] px-2 text-left text-[var(--tm-evaluation-ai-editable-text)] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                                        >
                                            <time dateTime={toDateInputValue(activeRecord.occurredAt)} className="truncate text-[length:var(--tm-font-size-body)] font-semibold tabular-nums">{formatRecognitionDate(activeRecord.occurredAt)}</time>
                                            <Pencil aria-hidden="true" className="h-3 w-3 shrink-0" />
                                        </button>
                                    ) : (
                                        <time dateTime={toDateInputValue(activeRecord.occurredAt)} className="flex min-h-11 items-center text-[length:var(--tm-font-size-body)] font-semibold tabular-nums text-[var(--tm-text-primary)]">{formatRecognitionDate(activeRecord.occurredAt)}</time>
                                    )}
                                </div>
                                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1">
                                    <span className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">识别对象：</span>
                                    {canEditRecords ? (
                                        <button
                                            type="button"
                                            onClick={() => startEditingRecord('class')}
                                            aria-label={`修改记录对象，当前${getRecordClassLabel(activeRecord)}`}
                                            className="-mr-2 flex min-h-11 min-w-0 items-center gap-1 rounded-[var(--tm-radius-inner)] px-2 text-left text-[var(--tm-evaluation-ai-editable-text)] active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                                        >
                                            <span className="truncate text-[length:var(--tm-font-size-body)] font-semibold">{getRecordClassLabel(activeRecord)}</span>
                                            <Pencil aria-hidden="true" className="h-3 w-3 shrink-0" />
                                        </button>
                                    ) : (
                                        <p className="flex min-h-11 items-center text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{getRecordClassLabel(activeRecord)}</p>
                                    )}
                                </div>
                                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1">
                                    <span className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">匹配指标：</span>
                                    {canEditRecords ? (
                                        <button
                                            type="button"
                                            onClick={() => startEditingRecord('indicator')}
                                            aria-label="修改匹配指标"
                                            className="-mr-2 flex min-h-11 min-w-0 items-center gap-1 rounded-[var(--tm-radius-inner)] px-2 text-left active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                                        >
                                            <EvaluationIndicatorPath indicatorPath={activeRecord.indicatorPath} variant="compact-full" className="flex-1" />
                                            <Pencil aria-hidden="true" className="h-3 w-3 shrink-0 text-[var(--tm-evaluation-ai-editable-text)]" />
                                        </button>
                                    ) : (
                                        <EvaluationIndicatorPath indicatorPath={activeRecord.indicatorPath} variant="compact-full" className="min-h-11" />
                                    )}
                                </div>
                                <div className="grid grid-cols-[auto_minmax(0,1fr)] items-center gap-x-1">
                                    <span className="text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">匹配分数：</span>
                                    {canEditRecords ? (
                                        <button
                                            type="button"
                                            onClick={() => startEditingRecord('score')}
                                            aria-label={`修改得分，当前${formatScore(activeRecord.score)}`}
                                            className="-mr-2 flex min-h-11 min-w-0 items-center gap-1 rounded-[var(--tm-radius-inner)] px-2 text-left active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                                        >
                                            <strong className={`shrink-0 text-[length:var(--tm-font-size-body)] font-semibold leading-none tabular-nums ${activeRecord.score >= 0 ? 'text-[var(--tm-record-positive-text)]' : 'text-[var(--tm-record-negative-text)]'}`}>
                                                {formatScore(activeRecord.score)}
                                            </strong>
                                            <Pencil aria-hidden="true" className="h-3 w-3 shrink-0 text-[var(--tm-evaluation-ai-editable-text)]" />
                                        </button>
                                    ) : (
                                        <strong className={`flex min-h-11 items-center text-[length:var(--tm-font-size-body)] font-semibold leading-none tabular-nums ${activeRecord.score >= 0 ? 'text-[var(--tm-record-positive-text)]' : 'text-[var(--tm-record-negative-text)]'}`}>
                                            {formatScore(activeRecord.score)}
                                        </strong>
                                    )}
                                </div>
                                <div className="mt-1 grid grid-cols-[auto_minmax(0,1fr)] items-start gap-x-1 py-1.5">
                                    <span className="pt-0.5 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">匹配理由：</span>
                                    <p className="text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-primary)]">{activeRecord.reason}</p>
                                </div>
                            </div>
                        </section>

                        <section>
                            <h3 className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">原始记录</h3>
                            <div className="mt-2.5 rounded-[var(--tm-radius-control)] border border-[var(--tm-evaluation-source-border)] bg-[var(--tm-evaluation-source-bg)] px-3 py-2.5">
                                <p className="w-full text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-secondary)]">{activeRecord.audioTranscript ?? activeRecord.originalContent}</p>
                                <div className="mt-3 flex min-h-11 items-center justify-between gap-3">
                                    <div className="flex min-w-0 items-center gap-1.5 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">
                                        <time className="shrink-0 tabular-nums">{formatRecordTime(activeRecord.recordedAt, today)}</time>
                                        <span aria-hidden="true">·</span>
                                        <span className="truncate">{activeRecord.operator}</span>
                                    </div>
                                    {activeRecord.sourceType === 'voice' && (
                                        <button
                                            type="button"
                                            onClick={() => playRecordAudio(activeRecord)}
                                            aria-label={`${playingRecordId === activeRecord.id ? '暂停' : '播放'}原始语音，${activeRecord.audioDuration}`}
                                            className="-mr-1 flex h-11 shrink-0 items-center rounded-[var(--tm-radius-control)] px-1 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-evaluation-source-control-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                                        >
                                            <span className="flex h-7 items-center gap-1 rounded-[var(--tm-radius-control)] border border-[var(--tm-evaluation-source-border)] bg-[var(--tm-bg-surface)] px-2">
                                                {playingRecordId === activeRecord.id ? <Pause aria-hidden="true" className="h-3 w-3 stroke-[2.25]" /> : <Play aria-hidden="true" className="h-3 w-3 fill-current stroke-[1.5]" />}
                                                <span className="tabular-nums">{activeRecord.audioDuration}</span>
                                            </span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                )}

                {activeRecord && isEditingRecord && recordDraft && (
                    <div className="space-y-5 pb-1">
                        {recordEditScope === 'date' && (
                            <label className="block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">
                                识别日期
                                <input
                                    type="date"
                                    value={recordDraft.occurredOn}
                                    onInput={event => {
                                        const occurredOn = event.currentTarget.value;
                                        setRecordDraft(current => current ? { ...current, occurredOn } : current);
                                    }}
                                    className={`${recordFieldClass} tabular-nums`}
                                />
                            </label>
                        )}

                        {recordEditScope === 'class' && (
                            <label className="block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">
                                记录对象
                                <select
                                    value={recordDraft.classId}
                                    onChange={event => setRecordDraft(current => current ? { ...current, classId: event.target.value } : current)}
                                    className={recordFieldClass}
                                >
                                    {classes.map(classInfo => <option key={classInfo.id} value={classInfo.id}>{getClassLabel(classInfo)}</option>)}
                                </select>
                            </label>
                        )}

                        {recordEditScope === 'indicator' && (
                            <section>
                                <h3 className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">对应指标</h3>
                                <div className="mt-2">
                                    <EvaluationIndicatorCascadePicker
                                        value={recordDraft.indicatorPath}
                                        options={[levelOneIndicatorOptions, levelTwoIndicatorOptions, levelThreeIndicatorOptions]}
                                        onChange={updateDraftIndicator}
                                    />
                                </div>
                            </section>
                        )}

                        {recordEditScope === 'score' && (
                            <label className="block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">
                                得分
                                <input
                                    type="number"
                                    inputMode="decimal"
                                    min="-100"
                                    max="100"
                                    step="0.01"
                                    value={recordDraft.score}
                                    onChange={event => setRecordDraft(current => current ? { ...current, score: event.target.value } : current)}
                                    className={`${recordFieldClass} tabular-nums`}
                                />
                            </label>
                        )}

                    </div>
                )}
            </MobileBottomSheet>

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
                <div className="h-[420px] max-h-[58dvh] overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)]">
                    <MobileClassCascadePicker
                        selectionMode="single"
                        groups={[
                            { gradeLabel: 'all', displayLabel: '全部年级', classes: [] },
                            ...gradeGroups.map(group => ({ gradeLabel: group.grade, classes: group.classes })),
                        ]}
                        activeGrade={draftSelectedGrade}
                        onActiveGradeChange={handleDraftGradeChange}
                        selectedClassId={draftSelectedClassId}
                        onSelectClass={setDraftSelectedClassId}
                        getClassLabel={getClassLabel}
                        allClassesLabel="全部班级"
                        ariaLabel="评价记录班级范围级联选择"
                    />
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

            <MobileConfirmSheet
                open={showDeleteConfirm && Boolean(activeRecord)}
                title="删除评价"
                description="删除后，该评价将不再计入班级得分和排行榜，且无法恢复。"
                confirmLabel="确认删除"
                tone="danger"
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={deleteActiveRecord}
            />

            {statusMessage && (
                <div role="status" className="pointer-events-none absolute bottom-5 left-1/2 z-[1200] -translate-x-1/2 rounded-full bg-[var(--tm-text-primary)] px-4 py-2 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-card-raised)]">
                    {statusMessage}
                </div>
            )}
        </div>
    );
};

export default EvaluationRecordsLogView;
