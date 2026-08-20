import React, { useEffect, useMemo, useState } from 'react';
import { CalendarRange, Check, ChevronDown, Mic2, Pause, Pencil, Play, Trash2, X } from 'lucide-react';
import { ASSETS } from '../assets/images';
import ReportDateRangeTabs from '../components/report/ReportDateRangeTabs';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import MobileClassCascadePicker from '../components/ui/MobileClassCascadePicker';
import MobileConfirmSheet from '../components/ui/MobileConfirmSheet';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import type { ClassInfo } from '../types';

interface EvaluationRecordsLogViewProps {
    classes: ClassInfo[];
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
}

interface EvaluationRecordDraft {
    classId: string;
    indicatorPath: [string, string, string];
    score: string;
}

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
        const originalContent = template.originalContent.replace('{className}', classInfo.name);

        return {
            id: `${classInfo.id}-evaluation-${templateIndex}`,
            classId: classInfo.id,
            className: classInfo.name,
            indicatorPath: template.indicatorPath,
            reason: template.reason,
            originalContent,
            sourceType: template.sourceType,
            audioTranscript: template.sourceType === 'voice' ? originalContent : undefined,
            audioDuration: 'audioDuration' in template ? template.audioDuration : undefined,
            score: template.score,
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

const formatScore = (score: number) => `${score > 0 ? '+' : ''}${score.toFixed(2)}`;

const createRecordDraft = (record: EvaluationRecord): EvaluationRecordDraft => {
    const indicatorPath = record.indicatorPath.split(' / ');
    return {
        classId: record.classId,
        indicatorPath: [indicatorPath[0] ?? '', indicatorPath[1] ?? '', indicatorPath[2] ?? ''],
        score: record.score.toFixed(2),
    };
};

const recordFieldClass = 'mt-2 h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]';

const EvaluationIndicatorPath: React.FC<{ indicatorPath: string; className?: string }> = ({ indicatorPath, className = '' }) => {
    const indicatorParts = indicatorPath.split(' / ');

    return (
        <p
            aria-label={`指标：${indicatorParts.join('，')}`}
            className={`flex min-w-0 items-center whitespace-nowrap text-[length:var(--tm-font-size-meta)] font-medium leading-none ${className}`}
        >
            {indicatorParts.map((indicator, index) => (
                <React.Fragment key={`${indicator}-${index}`}>
                    {index > 0 && <span aria-hidden="true" className="shrink-0 px-1 text-[var(--tm-evaluation-indicator-separator)]">›</span>}
                    <span className={`flex h-6 items-center rounded-[var(--tm-radius-inner)] border border-[var(--tm-evaluation-indicator-border)] bg-[var(--tm-evaluation-indicator-bg)] px-1.5 text-[var(--tm-evaluation-indicator-text)] ${index === indicatorParts.length - 1 ? 'shrink-0' : 'min-w-0 truncate'}`}>{indicator}</span>
                </React.Fragment>
            ))}
        </p>
    );
};

const EvaluationRecordsLogView: React.FC<EvaluationRecordsLogViewProps> = ({ classes, canEditRecords, canDeleteRecords }) => {
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
    const [records, setRecords] = useState(() => createEvaluationRecords(classes, today));
    const [activeRecordId, setActiveRecordId] = useState('');
    const [isEditingRecord, setIsEditingRecord] = useState(false);
    const [recordDraft, setRecordDraft] = useState<EvaluationRecordDraft | null>(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [playingRecordId, setPlayingRecordId] = useState('');
    const [statusMessage, setStatusMessage] = useState('');

    useEffect(() => {
        setRecords(createEvaluationRecords(classes, today));
        setActiveRecordId('');
    }, [classes, today]);

    useEffect(() => () => window.speechSynthesis?.cancel(), []);

    const gradeGroups = useMemo(() => classes.reduce<Array<{ grade: string; classes: ClassInfo[] }>>((groups, classInfo) => {
        const grade = getGradeLabel(classInfo);
        const currentGroup = groups.find(group => group.grade === grade);
        if (currentGroup) currentGroup.classes.push(classInfo);
        else groups.push({ grade, classes: [classInfo] });
        return groups;
    }, []), [classes]);
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
    const selectedScopeLabel = selectedClass?.name ?? selectedGradeLabel;
    const activeRecord = records.find(record => record.id === activeRecordId) ?? null;
    const draftScore = Number(recordDraft?.score ?? '');
    const recordDraftInvalid = !recordDraft
        || !classes.some(classInfo => classInfo.id === recordDraft.classId)
        || recordDraft.indicatorPath.some(item => item.trim() === '')
        || !Number.isFinite(draftScore)
        || draftScore === 0
        || draftScore < -100
        || draftScore > 100;

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
        setRecordDraft(null);
    };

    const closeRecordDetail = () => {
        window.speechSynthesis?.cancel();
        setPlayingRecordId('');
        setIsEditingRecord(false);
        setRecordDraft(null);
        setActiveRecordId('');
    };

    const startEditingRecord = () => {
        if (!activeRecord || !canEditRecords) return;
        setRecordDraft(createRecordDraft(activeRecord));
        setIsEditingRecord(true);
    };

    const saveRecordChanges = () => {
        if (!activeRecord || !recordDraft || recordDraftInvalid || !canEditRecords) return;
        const nextClass = classes.find(classInfo => classInfo.id === recordDraft.classId);
        if (!nextClass) return;
        setRecords(current => current.map(record => record.id === activeRecord.id ? {
            ...record,
            classId: nextClass.id,
            className: nextClass.name,
            indicatorPath: recordDraft.indicatorPath.map(item => item.trim()).join(' / '),
            score: Number(draftScore.toFixed(2)),
        } : record));
        setIsEditingRecord(false);
        setRecordDraft(null);
        setStatusMessage('评价记录已更新');
    };

    const deleteActiveRecord = () => {
        if (!activeRecord || !canDeleteRecords) return;
        setRecords(current => current.filter(record => record.id !== activeRecord.id));
        setShowDeleteConfirm(false);
        setActiveRecordId('');
        setIsEditingRecord(false);
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
                                        aria-label={`查看${record.className}评价详情，${formatScore(record.score)}`}
                                        className="w-full rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-[var(--tm-report-card-padding)] text-left [box-shadow:var(--tm-shadow-card)] transition-transform active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                                    >
                                        {selectedClassId === 'all' && (
                                            <p className="truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{record.className}</p>
                                        )}
                                        <div className={`grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-3 ${selectedClassId === 'all' ? 'mt-3' : ''}`}>
                                            <EvaluationIndicatorPath indicatorPath={record.indicatorPath} />
                                            <strong className={`shrink-0 text-[length:var(--tm-font-size-body)] font-semibold tabular-nums ${record.score >= 0 ? 'text-[var(--tm-chart-positive-text)]' : 'text-[var(--tm-chart-negative-text)]'}`}>
                                                {formatScore(record.score)}
                                            </strong>
                                        </div>
                                        <p className="mt-3 text-[length:var(--tm-font-size-body)] font-normal leading-6 text-[var(--tm-text-primary)]">{record.reason}</p>
                                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-[var(--tm-border-subtle)] pt-3">
                                            <time className="text-[length:var(--tm-font-size-meta)] font-normal tabular-nums text-[var(--tm-text-tertiary)]">{formatRecordTime(record.occurredAt, today)}</time>
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
                title={isEditingRecord ? '修改评价' : '评价详情'}
                onClose={closeRecordDetail}
                header={activeRecord ? (
                    <header className="flex h-14 shrink-0 items-center justify-between px-4">
                        <h2 className="text-[17px] font-semibold text-[var(--tm-text-primary)]">{isEditingRecord ? '修改评价' : '评价详情'}</h2>
                        <div className="flex items-center">
                            {!isEditingRecord && canEditRecords && (
                                <button
                                    type="button"
                                    onClick={startEditingRecord}
                                    aria-label="编辑评价记录"
                                    className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]"
                                >
                                    <Pencil aria-hidden="true" className="h-[18px] w-[18px]" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={closeRecordDetail}
                                aria-label={`关闭${isEditingRecord ? '修改评价' : '评价详情'}`}
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
                    <div className="divide-y divide-[var(--tm-border-subtle)]">
                        <section className="pb-4">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <time className="text-[length:var(--tm-font-size-meta)] font-medium tabular-nums text-[var(--tm-text-secondary)]">{formatRecordTime(activeRecord.occurredAt, today)}</time>
                                    <p className="mt-1 text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)]">{activeRecord.className}</p>
                                </div>
                                <strong className={`text-[24px] font-bold leading-none tabular-nums ${activeRecord.score >= 0 ? 'text-[var(--tm-record-positive-text)]' : 'text-[var(--tm-record-negative-text)]'}`}>
                                    {formatScore(activeRecord.score)}
                                </strong>
                            </div>
                            <p className="mt-3 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">评价人：{activeRecord.operator}</p>
                        </section>

                        <section className="py-4">
                            <h3 className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">评分理由</h3>
                            <p className="mt-2 text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-primary)]">{activeRecord.reason}</p>
                        </section>

                        <section className="py-4">
                            <div className="flex items-center justify-between gap-3">
                                <h3 className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">原始记录</h3>
                                {activeRecord.sourceType === 'voice' && (
                                    <button
                                        type="button"
                                        onClick={() => playRecordAudio(activeRecord)}
                                        aria-label={`${playingRecordId === activeRecord.id ? '暂停' : '播放'}原始语音`}
                                        className="flex min-h-[var(--tm-size-touch)] items-center gap-1.5 rounded-full px-2 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]"
                                    >
                                        {playingRecordId === activeRecord.id ? <Pause aria-hidden="true" className="h-4 w-4" /> : <Play aria-hidden="true" className="h-4 w-4" />}
                                        {activeRecord.audioDuration}
                                    </button>
                                )}
                            </div>
                            {activeRecord.sourceType === 'voice' && (
                                <div className="mt-2 flex items-center gap-1.5 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">
                                    <Mic2 aria-hidden="true" className="h-4 w-4" />语音转文字
                                </div>
                            )}
                            <p className="mt-2 text-[length:var(--tm-font-size-body)] leading-6 text-[var(--tm-text-secondary)]">{activeRecord.audioTranscript ?? activeRecord.originalContent}</p>
                        </section>

                        <section className="py-4">
                            <h3 className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">详细指标</h3>
                            <EvaluationIndicatorPath indicatorPath={activeRecord.indicatorPath} className="mt-3" />
                        </section>

                        {canDeleteRecords && (
                            <div className="pt-3">
                                <button
                                    type="button"
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="flex min-h-12 w-full items-center justify-center gap-2 rounded-[var(--tm-radius-control)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-status-negative)] active:bg-[var(--tm-status-negative-soft)]"
                                >
                                    <Trash2 aria-hidden="true" className="h-[18px] w-[18px]" />删除评价
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {activeRecord && isEditingRecord && recordDraft && (
                    <div className="space-y-5 pb-1">
                        <label className="block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">
                            记录对象
                            <select
                                value={recordDraft.classId}
                                onChange={event => setRecordDraft(current => current ? { ...current, classId: event.target.value } : current)}
                                className={recordFieldClass}
                            >
                                {classes.map(classInfo => <option key={classInfo.id} value={classInfo.id}>{classInfo.name}</option>)}
                            </select>
                        </label>

                        <section>
                            <h3 className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">对应指标</h3>
                            <div className="mt-2 space-y-2.5">
                                {['一级指标', '二级指标', '三级指标'].map((label, index) => (
                                    <label key={label} className="block">
                                        <span className="sr-only">{label}</span>
                                        <input
                                            value={recordDraft.indicatorPath[index]}
                                            onChange={event => setRecordDraft(current => current ? {
                                                ...current,
                                                indicatorPath: current.indicatorPath.map((item, itemIndex) => itemIndex === index ? event.target.value : item) as [string, string, string],
                                            } : current)}
                                            placeholder={label}
                                            className={recordFieldClass.replace('mt-2 ', '')}
                                        />
                                    </label>
                                ))}
                            </div>
                        </section>

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

                        {recordDraftInvalid && (
                            <p role="alert" className="rounded-[var(--tm-radius-control)] bg-[var(--tm-record-negative-bg)] px-3 py-2.5 text-[length:var(--tm-font-size-meta)] font-medium leading-5 text-[var(--tm-record-negative-text)]">
                                请完整填写记录对象与三级指标，分数需为 -100.00 至 100.00 且不能为 0。
                            </p>
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
