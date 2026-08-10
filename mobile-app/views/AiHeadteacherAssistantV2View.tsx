import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    ClipboardList,
    Keyboard,
    LoaderCircle,
    Mic,
    Send,
} from 'lucide-react';
import { ASSETS } from '../assets/images';
import AssistantSubpageHeader from '../components/AssistantSubpageHeader';
import HomeroomClassPickerSheet from '../components/HomeroomClassPickerSheet';
import {
    TeacherReportHorizontalBarChart,
    type TeacherReportChartColor,
} from '../components/report/TeacherReportChart';
import AutoResizeTextarea from '../components/ui/AutoResizeTextarea';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import {
    CLASS_EVALUATION_WEEKS,
    DEFAULT_CLASS_EVALUATION_WEEK_ID,
    getClassEvaluationRecords,
    getClassEvaluationSnapshot,
    getClassEvaluationWeek,
    type ClassEvaluationWeek,
} from '../data/classEvaluationAssistantV2';
import {
    askClassEvaluationQuestion,
    getRecordsFromAnswer,
    type ClassEvaluationAssistantAnswer,
    type ClassEvaluationRecord,
    type ClassEvaluationSnapshot,
} from '../domain/classEvaluationAssistantV2';
import type { ClassInfo } from '../types';

interface AiHeadteacherAssistantV2ViewProps {
    onBack: () => void;
    homeroomClasses: ClassInfo[];
    activeClassId: string;
    onClassChange: (classId: string) => void;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content?: string;
    answer?: ClassEvaluationAssistantAnswer;
}

const rectificationLabels: Record<ClassEvaluationRecord['rectificationStatus'], string> = {
    pending: '待整改',
    reviewing: '待复核',
    resolved: '已整改',
};

const formatScore = (score: number) => score.toFixed(1);

const dimensionChartColors: TeacherReportChartColor[] = [
    'indicator1',
    'indicator2',
    'indicator3',
    'indicator4',
    'indicator5',
];

const formatRecordDate = (date: string) => {
    const [, month, day] = date.split('-');
    return `${Number(month)}月${Number(day)}日`;
};

const getAssistantIntro = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? '上午好' : hour < 18 ? '下午好' : '晚上好';
    return `${greeting}，我将为您提供数据分析和指导建议。`;
};

const getTypeDelay = (char: string) => {
    if (char === '，') return 150;
    if (char === '。') return 220;
    return 56;
};

const ClassSwitchButton: React.FC<{
    className?: string;
    activeClass?: ClassInfo;
    onClick: () => void;
}> = ({ className = '', activeClass, onClick }) => (
    <button
        type="button"
        onClick={onClick}
        className={`flex min-h-11 max-w-[190px] min-w-0 items-center justify-center gap-1 rounded-full px-3 text-[14px] font-semibold text-[var(--tm-text-primary)] transition active:bg-[var(--tm-role-headteacher-glass-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)] ${className}`}
        aria-label={'切换班级，当前' + (activeClass?.name ?? '未选择')}
    >
        <span className="truncate">{activeClass?.name ?? '选择班级'}</span>
        <ChevronDown className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" strokeWidth={2.2} aria-hidden="true" />
    </button>
);

const AnswerContent: React.FC<{
    answer: ClassEvaluationAssistantAnswer;
    onOpenDetails: (answer: ClassEvaluationAssistantAnswer) => void;
}> = ({ answer, onOpenDetails }) => (
    <div className="space-y-3">
        <p className="whitespace-pre-line text-[15px] font-medium leading-6 text-[var(--tm-text-primary)]">{answer.message}</p>

        {answer.metrics.length > 0 && (
            <dl className={'grid divide-x divide-[var(--tm-border-subtle)] border-y border-[var(--tm-border-subtle)] py-3 ' + (answer.metrics.length === 1 ? 'grid-cols-1' : answer.metrics.length === 2 ? 'grid-cols-2' : 'grid-cols-3')}>
                {answer.metrics.map(metric => (
                    <div key={metric.label} className="min-w-0 px-2 first:pl-0 last:pr-0">
                        <dt className="truncate text-[11px] font-medium text-[var(--tm-text-tertiary)]">{metric.label}</dt>
                        <dd className={'mt-1 truncate text-[19px] font-bold tabular-nums ' + (metric.tone === 'negative' ? 'text-[var(--tm-status-negative)]' : 'text-[var(--tm-assistant-role-text)]')}>{metric.value}</dd>
                    </div>
                ))}
            </dl>
        )}

        {answer.breakdown.length > 0 && (
            <div className="divide-y divide-[var(--tm-border-subtle)]">
                {answer.breakdown.map((item, index) => (
                    <div key={item.label + '-' + index} className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-2">
                        <div className="min-w-0">
                            <div className="truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{item.label}</div>
                            <div className="mt-0.5 truncate text-[11px] text-[var(--tm-text-tertiary)]">{item.detail}</div>
                        </div>
                        <div className="text-[14px] font-bold tabular-nums text-[var(--tm-status-negative)]">{item.value}</div>
                    </div>
                ))}
            </div>
        )}

        {answer.actions.length > 0 && (
            <ol className="space-y-3 border-l-2 border-[var(--tm-assistant-role-border)] pl-3">
                {answer.actions.map(action => (
                    <li key={action.title}>
                        <div className="text-[14px] font-semibold leading-5 text-[var(--tm-text-primary)]">{action.title}</div>
                        <div className="mt-1 text-[12px] leading-5 text-[var(--tm-text-secondary)]">{action.owner} · {action.verification}</div>
                    </li>
                ))}
            </ol>
        )}

        {answer.evidenceRefs.length > 0 && (
            <button
                type="button"
                onClick={() => onOpenDetails(answer)}
                className="-ml-2 flex min-h-[var(--tm-size-touch)] items-center gap-2 rounded-[var(--tm-radius-control)] px-2 text-[13px] font-semibold text-[var(--tm-assistant-role-text)] transition active:bg-[var(--tm-assistant-role-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                aria-label={'查看' + answer.evidenceRefs.length + '笔扣分明细'}
            >
                <ClipboardList className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                查看扣分明细
                <span className="font-medium tabular-nums text-[var(--tm-text-tertiary)]">{answer.evidenceRefs.length}笔</span>
            </button>
        )}
    </div>
);

const RecordDetailList: React.FC<{ records: ClassEvaluationRecord[] }> = ({ records }) => (
    <div className="divide-y divide-[var(--tm-border-subtle)]">
        {records.map(record => (
            <article key={record.id} className="py-4 first:pt-0">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <div className="text-[15px] font-semibold text-[var(--tm-text-primary)]">{record.indicator}</div>
                        <div className="mt-1 text-[12px] text-[var(--tm-text-tertiary)]">{formatRecordDate(record.date)} · {record.dimension}</div>
                    </div>
                    <div className="shrink-0 text-[16px] font-bold tabular-nums text-[var(--tm-status-negative)]">-{record.deduction.toFixed(1)}分</div>
                </div>

                <p className="mt-3 text-[14px] leading-6 text-[var(--tm-text-primary)]">{record.finding}</p>

                <dl className="mt-3 space-y-2 text-[12px] leading-5">
                    <div className="grid grid-cols-[60px_minmax(0,1fr)] gap-2">
                        <dt className="text-[var(--tm-text-tertiary)]">责任拆分</dt>
                        <dd className="text-[var(--tm-text-secondary)]">班级 {record.classDeduction.toFixed(1)}分 · 教师 {record.teacherDeduction.toFixed(1)}分</dd>
                    </div>
                    <div className="grid grid-cols-[60px_minmax(0,1fr)] gap-2">
                        <dt className="text-[var(--tm-text-tertiary)]">扣分依据</dt>
                        <dd className="text-[var(--tm-text-secondary)]">{record.rule}</dd>
                    </div>
                    <div className="grid grid-cols-[60px_minmax(0,1fr)] items-center gap-2">
                        <dt className="text-[var(--tm-text-tertiary)]">整改状态</dt>
                        <dd className={'font-semibold ' + (record.rectificationStatus === 'resolved' ? 'text-[var(--tm-status-positive)]' : 'text-[var(--tm-text-secondary)]')}>{rectificationLabels[record.rectificationStatus]}</dd>
                    </div>
                </dl>
            </article>
        ))}
    </div>
);

const CompactDeductionList: React.FC<{
    records: ClassEvaluationRecord[];
    emptyLabel?: string;
}> = ({ records, emptyLabel = '该项暂无扣分' }) => {
    if (records.length === 0) {
        return <p className="py-3 text-[12px] text-[var(--tm-text-tertiary)]">{emptyLabel}</p>;
    }

    return (
        <div className="divide-y divide-[var(--tm-border-subtle)]">
            {records.map(record => (
                <article key={record.id} className="py-3">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <div className="text-[13px] font-semibold text-[var(--tm-text-primary)]">{record.indicator}</div>
                            <p className="mt-1 text-[11px] leading-5 text-[var(--tm-text-secondary)]">{record.finding}</p>
                            <div className="mt-1 text-[10px] tabular-nums text-[var(--tm-text-tertiary)]">{formatRecordDate(record.date)}</div>
                        </div>
                        <div className="shrink-0 text-[13px] font-bold tabular-nums text-[var(--tm-status-negative)]">-{formatScore(record.deduction)}分</div>
                    </div>
                </article>
            ))}
        </div>
    );
};

const WeekOverviewPanel: React.FC<{
    week: ClassEvaluationWeek;
    snapshot: ClassEvaluationSnapshot;
    records: ClassEvaluationRecord[];
    expanded: boolean;
    expandedDimension: string | null;
    onToggleExpanded: () => void;
    onToggleDimension: (dimension: string) => void;
    onOpenWeekDetail: () => void;
}> = ({
    week,
    snapshot,
    records,
    expanded,
    expandedDimension,
    onToggleExpanded,
    onToggleDimension,
    onOpenWeekDetail,
}) => (
    <section className="headteacher-agent-glass relative z-10 mx-4 -mt-5 overflow-hidden rounded-[var(--tm-radius-card)]" aria-labelledby="week-data-title">
        <div className="px-4 pt-4">
            <div className="flex min-h-11 items-center justify-between gap-3">
                <h2 id="week-data-title" className="shrink-0 text-[17px] font-bold text-[var(--tm-text-primary)]">本周数据</h2>
                <button
                    type="button"
                    onClick={onOpenWeekDetail}
                    className="flex min-h-11 min-w-0 items-center gap-1 rounded-[var(--tm-radius-control)] px-2 text-[11px] font-medium tabular-nums text-[var(--tm-text-tertiary)] transition active:bg-[var(--tm-role-headteacher-glass-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                    aria-label={'打开周数据页面，当前' + week.dataRangeLabel}
                >
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2.1} aria-hidden="true" />
                    <span className="truncate">{week.dataRangeLabel}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </button>
            </div>

            <dl className="mt-1 grid grid-cols-2 divide-x divide-[var(--tm-border-subtle)] border-y border-[var(--tm-border-subtle)] py-4">
                <div className="min-w-0 pr-4">
                    <dt className="text-[12px] font-medium text-[var(--tm-text-tertiary)]">本周总分</dt>
                    <dd className="mt-2 whitespace-nowrap text-[28px] font-bold tabular-nums text-[var(--tm-assistant-role-text)]">{formatScore(snapshot.finalScore)}<span className="ml-1 text-[12px] font-medium text-[var(--tm-text-tertiary)]">分</span></dd>
                </div>
                <div className="min-w-0 pl-4">
                    <dt className="text-[12px] font-medium text-[var(--tm-text-tertiary)]">当前排名</dt>
                    <dd className="mt-2 whitespace-nowrap text-[28px] font-bold tabular-nums text-[var(--tm-text-primary)]">第{week.overallRank}<span className="ml-1 text-[12px] font-medium text-[var(--tm-text-tertiary)]">名</span></dd>
                </div>
            </dl>
        </div>

        <button
            type="button"
            onClick={onToggleExpanded}
            className="flex min-h-12 w-full items-center justify-between px-4 text-[13px] font-semibold text-[var(--tm-assistant-role-text)] transition active:bg-[var(--tm-role-headteacher-glass-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)]"
            aria-expanded={expanded}
            aria-controls="week-dimension-list"
        >
            <span>{expanded ? '收起五项数据' : '查看五项数据'}</span>
            {expanded ? <ChevronUp className="h-4 w-4" aria-hidden="true" /> : <ChevronDown className="h-4 w-4" aria-hidden="true" />}
        </button>

        {expanded && (
            <div id="week-dimension-list" className="border-t border-[var(--tm-border-subtle)]">
                <div className="flex min-h-10 items-center justify-between px-4 pt-1">
                    <h3 className="text-[12px] font-semibold text-[var(--tm-text-primary)]">评比大项</h3>
                    <span className="text-[10px] font-medium text-[var(--tm-text-tertiary)]">得分 · 排名</span>
                </div>
                <TeacherReportHorizontalBarChart
                    ariaLabel={week.dimensionRankings.map(item => `${item.dimension}${formatScore(item.score)}分，第${item.rank}名`).join('；')}
                    data={week.dimensionRankings.map((item, index) => ({
                        name: item.dimension,
                        value: item.score,
                        valueLabel: `${formatScore(item.score)} · 第${item.rank}`,
                        color: dimensionChartColors[index % dimensionChartColors.length],
                    }))}
                    maxValue={20}
                    optionKey={`${week.id}-dimension-score-rank`}
                    className="h-[224px]"
                    onCategorySelect={onToggleDimension}
                />

                {expandedDimension && (
                    <div className="border-t border-[var(--tm-border-subtle)] px-4 pb-1">
                        <button
                            type="button"
                            onClick={() => onToggleDimension(expandedDimension)}
                            className="flex min-h-11 w-full items-center justify-between gap-3 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)]"
                            aria-expanded="true"
                            aria-label={`收起${expandedDimension}扣分情况`}
                        >
                            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-[var(--tm-text-primary)]">{expandedDimension}</span>
                            <span className="text-[10px] tabular-nums text-[var(--tm-text-tertiary)]">{records.filter(record => record.dimension === expandedDimension).length}笔扣分</span>
                            <ChevronUp className="h-4 w-4 shrink-0 text-[var(--tm-text-secondary)]" aria-hidden="true" />
                        </button>
                        <CompactDeductionList
                            records={records.filter(record => record.dimension === expandedDimension)}
                            emptyLabel="本周该项暂无扣分"
                        />
                    </div>
                )}
            </div>
        )}
    </section>
);

type ComposerMode = 'voice' | 'text';
type VoiceState = 'idle' | 'listening' | 'error';

const QuestionComposer: React.FC<{
    draft: string;
    replying: boolean;
    onDraftChange: (value: string) => void;
    onSubmit: (question: string) => void;
}> = ({ draft, replying, onDraftChange, onSubmit }) => {
    const [mode, setMode] = useState<ComposerMode>('voice');
    const [voiceState, setVoiceState] = useState<VoiceState>('idle');
    const [voiceFallback, setVoiceFallback] = useState(false);
    const recognitionRef = useRef<any>(null);

    const stopVoiceInput = () => {
        try {
            recognitionRef.current?.stop?.();
        } catch {
            recognitionRef.current = null;
            setVoiceState('idle');
        }
    };

    const startVoiceInput = () => {
        if (replying || voiceState === 'listening') return;

        const SpeechRecognitionConstructor = (window as any).SpeechRecognition
            ?? (window as any).webkitSpeechRecognition;
        if (!SpeechRecognitionConstructor) {
            setVoiceFallback(true);
            setVoiceState('error');
            setMode('text');
            return;
        }

        const recognition = new SpeechRecognitionConstructor();
        recognition.lang = 'zh-CN';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;
        recognition.onresult = (event: any) => {
            let transcript = '';
            for (let index = event.resultIndex; index < event.results.length; index += 1) {
                transcript += event.results[index][0]?.transcript ?? '';
            }
            const question = transcript.trim();
            if (!question) return;
            onDraftChange(question);
            onSubmit(question);
        };
        recognition.onerror = () => {
            setVoiceFallback(true);
            setVoiceState('error');
            setMode('text');
        };
        recognition.onend = () => {
            recognitionRef.current = null;
            setVoiceState(current => current === 'error' ? current : 'idle');
        };
        recognitionRef.current = recognition;
        setVoiceFallback(false);
        setVoiceState('listening');
        try {
            recognition.start();
        } catch {
            recognitionRef.current = null;
            setVoiceFallback(true);
            setVoiceState('error');
            setMode('text');
        }
    };

    useEffect(() => () => recognitionRef.current?.abort?.(), []);

    return (
        <form
            className="shrink-0 bg-transparent px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit(draft);
            }}
        >
            {mode === 'voice' ? (
                <div className="headteacher-agent-glass relative h-14 overflow-hidden rounded-full">
                    <button
                        type="button"
                        onClick={() => setMode('text')}
                        className="absolute inset-y-0 left-0 z-10 flex w-14 items-center justify-center rounded-full bg-[var(--tm-bg-surface-glass)] text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)] transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)]"
                        aria-label="切换到文字输入"
                    >
                        <Keyboard className="h-[22px] w-[22px]" strokeWidth={2.2} aria-hidden="true" />
                    </button>
                    <button
                        type="button"
                        disabled={replying}
                        onPointerDown={startVoiceInput}
                        onPointerUp={stopVoiceInput}
                        onPointerCancel={stopVoiceInput}
                        onPointerLeave={stopVoiceInput}
                        onKeyDown={(event) => {
                            if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
                                event.preventDefault();
                                startVoiceInput();
                            }
                        }}
                        onKeyUp={(event) => {
                            if (event.key === 'Enter' || event.key === ' ') {
                                event.preventDefault();
                                stopVoiceInput();
                            }
                        }}
                        className={'absolute inset-0 flex select-none items-center justify-center rounded-full px-16 text-[16px] font-bold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)] ' + (voiceState === 'listening' ? 'bg-[var(--tm-assistant-role-primary)] text-white' : 'bg-transparent text-[var(--tm-text-primary)] active:bg-[var(--tm-role-headteacher-glass-surface-strong)]')}
                        aria-label={voiceState === 'listening' ? '正在聆听，松开发送' : '按住说话'}
                    >
                        <span>{voiceState === 'listening' ? '正在聆听，松开发送' : '按住说话'}</span>
                    </button>
                </div>
            ) : (
                <div className="headteacher-agent-glass grid min-h-14 grid-cols-[48px_minmax(0,1fr)_48px] items-end overflow-hidden rounded-[28px] p-1">
                    <button
                        type="button"
                        onClick={() => {
                            setVoiceState('idle');
                            setMode('voice');
                        }}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tm-bg-surface-glass)] text-[var(--tm-assistant-role-text)] [box-shadow:var(--tm-shadow-control)] transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                        aria-label="切换到语音输入"
                    >
                        <Mic className="h-5 w-5" strokeWidth={2.3} aria-hidden="true" />
                    </button>
                    <AutoResizeTextarea
                        value={draft}
                        onChange={event => onDraftChange(event.target.value)}
                        onKeyDown={event => {
                            if (event.key === 'Enter' && !event.shiftKey) {
                                event.preventDefault();
                                onSubmit(draft);
                            }
                        }}
                        minHeight={48}
                        maxHeight={88}
                        placeholder={voiceFallback ? '当前环境暂不支持语音，请输入文字' : '输入班级评价问题'}
                        aria-label="输入班级评价问题"
                        className="w-full resize-none bg-transparent px-3 py-3 text-[14px] font-medium leading-6 text-[var(--tm-text-primary)] outline-none placeholder:text-[var(--tm-text-disabled)]"
                    />
                    <button
                        type="submit"
                        disabled={!draft.trim() || replying}
                        className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--tm-assistant-role-primary)] text-white transition active:scale-95 disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)] focus-visible:ring-offset-2"
                        aria-label="发送问题"
                    >
                        <Send className="h-5 w-5" strokeWidth={2.3} aria-hidden="true" />
                    </button>
                </div>
            )}
            <p className="mt-1.5 text-center text-[10px] leading-4 text-[var(--tm-text-disabled)]">内容由人工智能基于班级评价台账生成，请以学校复核记录为准</p>
        </form>
    );
};

const WeekDataDetailPage: React.FC<{
    weekId: string;
    classId: string;
    activeClass?: ClassInfo;
    onBack: () => void;
    onClassPickerOpen: () => void;
    onWeekChange: (weekId: string) => void;
}> = ({ weekId, classId, activeClass, onBack, onClassPickerOpen, onWeekChange }) => {
    const weekIndex = CLASS_EVALUATION_WEEKS.findIndex(item => item.id === weekId);
    const week = getClassEvaluationWeek(weekId);
    const snapshot = getClassEvaluationSnapshot(classId, weekId);
    const records = getClassEvaluationRecords(classId, weekId);
    const olderWeek = CLASS_EVALUATION_WEEKS[weekIndex + 1];
    const newerWeek = CLASS_EVALUATION_WEEKS[weekIndex - 1];

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
            <AssistantSubpageHeader
                onBack={onBack}
                surface="transparent"
                centerContent={<ClassSwitchButton activeClass={activeClass} onClick={onClassPickerOpen} />}
            />

            <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(24px+env(safe-area-inset-bottom))] no-scrollbar">
                <section className="pt-2" aria-label="周数据切换">
                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            disabled={!olderWeek}
                            onClick={() => olderWeek && onWeekChange(olderWeek.id)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition active:bg-[var(--tm-role-headteacher-glass-surface)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                            aria-label="查看上一周"
                        >
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <div className="min-w-0 flex-1 text-center">
                            <h1 className="truncate text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{week.label}</h1>
                            <p className="mt-1 text-[11px] text-[var(--tm-text-tertiary)]">{week.status === 'in_progress' ? week.snapshotLabel : '本周数据已结算'}</p>
                        </div>
                        <button
                            type="button"
                            disabled={!newerWeek}
                            onClick={() => newerWeek && onWeekChange(newerWeek.id)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition active:bg-[var(--tm-role-headteacher-glass-surface)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                            aria-label="查看下一周"
                        >
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </section>

                <section className="headteacher-agent-glass mt-4 rounded-[var(--tm-radius-card)] px-4 py-4" aria-label="周数据概览">
                    <dl className="grid grid-cols-2 divide-x divide-[var(--tm-border-subtle)]">
                        <div className="pr-4">
                            <dt className="text-[12px] text-[var(--tm-text-tertiary)]">周总分</dt>
                            <dd className="mt-2 text-[26px] font-bold tabular-nums text-[var(--tm-assistant-role-text)]">{formatScore(snapshot.finalScore)}<span className="ml-1 text-[11px] font-medium text-[var(--tm-text-tertiary)]">分</span></dd>
                        </div>
                        <div className="pl-4">
                            <dt className="text-[12px] text-[var(--tm-text-tertiary)]">班级排名</dt>
                            <dd className="mt-2 text-[26px] font-bold tabular-nums text-[var(--tm-text-primary)]">第{week.overallRank}<span className="ml-1 text-[11px] font-medium text-[var(--tm-text-tertiary)]">名</span></dd>
                        </div>
                    </dl>
                    <div className="mt-4 flex items-center justify-between border-t border-[var(--tm-border-subtle)] pt-3 text-[12px]">
                        <span className="text-[var(--tm-text-secondary)]">累计扣分</span>
                        <span className="font-bold tabular-nums text-[var(--tm-status-negative)]">-{formatScore(snapshot.deduction)}分 · {snapshot.recordCount}笔</span>
                    </div>
                </section>

                <section className="mt-5" aria-labelledby="week-records-title">
                    <div className="mb-2 flex items-center justify-between px-1">
                        <h2 id="week-records-title" className="text-[16px] font-bold text-[var(--tm-text-primary)]">扣分明细</h2>
                        <span className="text-[11px] tabular-nums text-[var(--tm-text-tertiary)]">{records.length}笔</span>
                    </div>
                    <div className="headteacher-agent-glass rounded-[var(--tm-radius-card)] px-4">
                        <CompactDeductionList records={records} emptyLabel="该周暂无扣分记录" />
                    </div>
                </section>
            </main>
        </div>
    );
};

const AiHeadteacherAssistantV2View: React.FC<AiHeadteacherAssistantV2ViewProps> = ({
    onBack,
    homeroomClasses,
    activeClassId,
    onClassChange,
}) => {
    const resolvedClassId = homeroomClasses.some(classInfo => classInfo.id === activeClassId)
        ? activeClassId
        : homeroomClasses[0]?.id ?? 'c_2025_4';
    const activeClass = homeroomClasses.find(classInfo => classInfo.id === resolvedClassId);
    const currentWeek = useMemo(() => getClassEvaluationWeek(DEFAULT_CLASS_EVALUATION_WEEK_ID), []);
    const snapshot = useMemo(() => getClassEvaluationSnapshot(resolvedClassId), [resolvedClassId]);
    const records = useMemo(() => getClassEvaluationRecords(resolvedClassId), [resolvedClassId]);
    const assistantIntro = useMemo(getAssistantIntro, []);
    const [typedIntro, setTypedIntro] = useState('');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversationOpen, setConversationOpen] = useState(false);
    const [overviewExpanded, setOverviewExpanded] = useState(false);
    const [expandedDimension, setExpandedDimension] = useState<string | null>(null);
    const [weekDetailOpen, setWeekDetailOpen] = useState(false);
    const [detailWeekId, setDetailWeekId] = useState(DEFAULT_CLASS_EVALUATION_WEEK_ID);
    const [draft, setDraft] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [showClassPicker, setShowClassPicker] = useState(false);
    const [detailRecords, setDetailRecords] = useState<ClassEvaluationRecord[] | null>(null);
    const scrollRef = useRef<HTMLDivElement>(null);
    const replyTimerRef = useRef<number | null>(null);
    const previousClassIdRef = useRef(resolvedClassId);

    const clearConversation = () => {
        if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
        replyTimerRef.current = null;
        setMessages([]);
        setConversationOpen(false);
        setDraft('');
        setDetailRecords(null);
        setIsReplying(false);
    };

    useEffect(() => {
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (reduceMotion) {
            setTypedIntro(assistantIntro);
            return undefined;
        }

        let index = 0;
        let timer: number | undefined;
        const typeNext = () => {
            index += 1;
            setTypedIntro(assistantIntro.slice(0, index));
            if (index >= assistantIntro.length) return;
            timer = window.setTimeout(typeNext, getTypeDelay(assistantIntro[index - 1]));
        };
        timer = window.setTimeout(typeNext, 240);
        return () => {
            if (timer) window.clearTimeout(timer);
        };
    }, [assistantIntro]);

    useEffect(() => {
        if (previousClassIdRef.current === resolvedClassId) return;
        previousClassIdRef.current = resolvedClassId;
        clearConversation();
        setOverviewExpanded(false);
        setExpandedDimension(null);
    }, [resolvedClassId]);

    useEffect(() => {
        if (!conversationOpen) return undefined;
        const frame = window.requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [conversationOpen, isReplying, messages]);

    useEffect(() => () => {
        if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
    }, []);

    const submitQuestion = (rawQuestion: string) => {
        const question = rawQuestion.trim();
        if (!question || isReplying) return;

        const previousContext = [...messages]
            .reverse()
            .find(message => message.role === 'assistant' && message.answer)?.answer?.context;
        setConversationOpen(true);
        setMessages(current => [...current, {
            id: 'user-' + Date.now(),
            role: 'user',
            content: question,
        }]);
        setDraft('');
        setIsReplying(true);

        replyTimerRef.current = window.setTimeout(() => {
            const answer = askClassEvaluationQuestion({ question, snapshot, records, previousContext });
            setMessages(current => [...current, {
                id: 'assistant-' + Date.now(),
                role: 'assistant',
                answer,
            }]);
            setIsReplying(false);
            replyTimerRef.current = null;
        }, 420);
    };

    const latestSuggestions = [...messages]
        .reverse()
        .find(message => message.answer)?.answer?.followUpSuggestions ?? [];
    const recommendedQuestions = [
        `本周为什么扣了${formatScore(snapshot.deduction)}分？`,
        '哪些属于教师组织责任？',
        '健体班级怎么提升？',
    ];

    const handleClassSelect = (classId: string) => {
        onClassChange(classId);
        setShowClassPicker(false);
    };

    if (weekDetailOpen) {
        return (
            <div className="ai-assistant-theme-headteacher relative flex min-h-0 flex-1 overflow-hidden text-[var(--tm-text-primary)]">
                <WeekDataDetailPage
                    weekId={detailWeekId}
                    classId={resolvedClassId}
                    activeClass={activeClass}
                    onBack={() => setWeekDetailOpen(false)}
                    onClassPickerOpen={() => setShowClassPicker(true)}
                    onWeekChange={setDetailWeekId}
                />
                {showClassPicker && (
                    <HomeroomClassPickerSheet
                        classes={homeroomClasses}
                        selectedClassId={resolvedClassId}
                        onSelect={handleClassSelect}
                        onClose={() => setShowClassPicker(false)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="ai-assistant-theme-headteacher relative flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent text-[var(--tm-text-primary)]">
            <AssistantSubpageHeader
                onBack={onBack}
                surface="transparent"
                centerContent={<ClassSwitchButton activeClass={activeClass} onClick={() => setShowClassPicker(true)} />}
            />

            {conversationOpen ? (
                <>
                    <div className="headteacher-agent-glass mx-4 mt-2 flex min-h-16 shrink-0 items-center gap-2 rounded-[var(--tm-radius-inner)] px-3">
                        <img
                            src={ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER}
                            alt=""
                            className="h-14 w-14 shrink-0 object-contain object-bottom"
                        />
                        <div className="min-w-0 flex-1">
                            <span className="block truncate text-[13px] font-bold text-[var(--tm-text-primary)]">班级评价分析</span>
                            <span className="mt-0.5 block truncate text-[11px] tabular-nums text-[var(--tm-text-tertiary)]">{currentWeek.dataRangeLabel}</span>
                        </div>
                        <button
                            type="button"
                            onClick={() => setConversationOpen(false)}
                            className="flex min-h-11 shrink-0 items-center gap-1 rounded-[var(--tm-radius-control)] px-2 text-[12px] font-semibold text-[var(--tm-assistant-role-text)] transition active:bg-[var(--tm-role-headteacher-glass-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                        >
                            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                            返回概览
                        </button>
                    </div>

                    <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-4 no-scrollbar" aria-live="polite">
                        <div className="space-y-4">
                            {messages.map(message => (
                                <div key={message.id} className={'flex ' + (message.role === 'user' ? 'justify-end' : 'justify-start')}>
                                    {message.role === 'user' ? (
                                        <div className="max-w-[82%] rounded-[18px] rounded-br-[6px] bg-[var(--tm-assistant-role-primary)] px-4 py-2.5 text-[15px] font-medium leading-6 text-white [box-shadow:var(--tm-shadow-control)]">
                                            {message.content}
                                        </div>
                                    ) : message.answer ? (
                                        <div className="headteacher-agent-glass w-full rounded-[var(--tm-radius-card)] rounded-tl-[6px] px-4 py-3.5">
                                            <AnswerContent
                                                answer={message.answer}
                                                onOpenDetails={answer => setDetailRecords(getRecordsFromAnswer(answer, records))}
                                            />
                                        </div>
                                    ) : null}
                                </div>
                            ))}

                            {isReplying && (
                                <div className="flex justify-start">
                                    <div className="headteacher-agent-glass flex h-11 items-center gap-2 rounded-[var(--tm-radius-card)] rounded-tl-[6px] px-4 text-[13px] font-medium text-[var(--tm-text-secondary)]">
                                        <LoaderCircle className="h-4 w-4 animate-spin text-[var(--tm-assistant-role-primary)]" aria-hidden="true" />
                                        正在查询班级评价台账
                                    </div>
                                </div>
                            )}
                        </div>

                        {!isReplying && latestSuggestions.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2" aria-label="建议问题">
                                {latestSuggestions.slice(0, 3).map(suggestion => (
                                    <button
                                        key={suggestion}
                                        type="button"
                                        onClick={() => submitQuestion(suggestion)}
                                        className="min-h-[var(--tm-size-touch)] rounded-full border border-[var(--tm-assistant-role-border)] bg-[var(--tm-role-headteacher-glass-surface)] px-3 text-left text-[12px] font-semibold leading-5 text-[var(--tm-assistant-role-text)] backdrop-blur-md transition active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                                    >
                                        {suggestion}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </>
            ) : (
                <div className="min-h-0 flex-1 overflow-y-auto pb-5 no-scrollbar">
                    <section className="relative h-[148px] overflow-hidden px-5">
                        <div className="relative z-10 max-w-[59%] pt-3" aria-live="polite">
                            <p className="ai-assistant-typewriter-shine min-h-16 text-[17px] font-bold leading-7">
                                {typedIntro}
                                {typedIntro.length < assistantIntro.length && (
                                    <span className="ml-0.5 inline-block h-5 w-[1.5px] translate-y-1 animate-pulse rounded-full bg-[var(--tm-assistant-role-primary)]" aria-hidden="true" />
                                )}
                            </p>
                        </div>
                        <img
                            src={ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER}
                            alt="AI班主任助理形象"
                            className="pointer-events-none absolute -bottom-1 -right-1 h-[154px] w-[154px] select-none object-contain object-bottom drop-shadow-[0_20px_28px_var(--tm-role-headteacher-shadow)]"
                        />
                    </section>

                    <WeekOverviewPanel
                        week={currentWeek}
                        snapshot={snapshot}
                        records={records}
                        expanded={overviewExpanded}
                        expandedDimension={expandedDimension}
                        onToggleExpanded={() => {
                            setOverviewExpanded(current => !current);
                            if (overviewExpanded) setExpandedDimension(null);
                        }}
                        onToggleDimension={(dimension) => setExpandedDimension(current => current === dimension ? null : dimension)}
                        onOpenWeekDetail={() => {
                            setDetailWeekId(DEFAULT_CLASS_EVALUATION_WEEK_ID);
                            setWeekDetailOpen(true);
                        }}
                    />

                    <section className="mx-4 mt-3" aria-labelledby="recommended-questions-title">
                        <h2 id="recommended-questions-title" className="mb-2 px-1 text-[14px] font-bold text-[var(--tm-text-primary)]">你可以继续问我</h2>
                        <div className="headteacher-agent-glass overflow-hidden rounded-[var(--tm-radius-card)]">
                            {recommendedQuestions.slice(0, 2).map((question, index) => (
                                <button
                                    key={question}
                                    type="button"
                                    onClick={() => submitQuestion(question)}
                                    className={'flex min-h-12 w-full items-center gap-3 px-4 text-left transition active:bg-[var(--tm-role-headteacher-glass-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)] ' + (index > 0 ? 'border-t border-[var(--tm-border-subtle)]' : '')}
                                >
                                    <span className="min-w-0 flex-1 text-[13px] font-semibold leading-5 text-[var(--tm-text-primary)]">{question}</span>
                                    <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" aria-hidden="true" />
                                </button>
                            ))}
                        </div>
                    </section>
                </div>
            )}

            <QuestionComposer
                draft={draft}
                replying={isReplying}
                onDraftChange={setDraft}
                onSubmit={submitQuestion}
            />

            <MobileBottomSheet
                open={detailRecords !== null}
                title={'扣分明细' + (detailRecords?.length ? ' · ' + detailRecords.length + '笔' : '')}
                onClose={() => setDetailRecords(null)}
            >
                <RecordDetailList records={detailRecords ?? []} />
            </MobileBottomSheet>

            {showClassPicker && (
                <HomeroomClassPickerSheet
                    classes={homeroomClasses}
                    selectedClassId={resolvedClassId}
                    onSelect={handleClassSelect}
                    onClose={() => setShowClassPicker(false)}
                />
            )}
        </div>
    );
};

export default AiHeadteacherAssistantV2View;
