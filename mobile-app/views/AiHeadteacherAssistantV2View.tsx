import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ArrowLeft,
    CalendarDays,
    Check,
    ChevronDown,
    ChevronRight,
    ChevronUp,
    ClipboardList,
    LoaderCircle,
    Send,
    Sparkles,
} from 'lucide-react';
import { ASSETS } from '../assets/images';
import AssistantSubpageHeader from '../components/AssistantSubpageHeader';
import HomeroomClassPickerSheet from '../components/HomeroomClassPickerSheet';
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
                        <div className="mt-1 text-[12px] text-[var(--tm-text-tertiary)]">{record.date.slice(5).replace('-', '月')}日 · {record.dimension}</div>
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

                <div className="mt-3 font-mono text-[10px] text-[var(--tm-text-disabled)]">{record.id}</div>
            </article>
        ))}
    </div>
);

const WeekOverviewPanel: React.FC<{
    week: ClassEvaluationWeek;
    snapshot: ClassEvaluationSnapshot;
    expanded: boolean;
    onToggleExpanded: () => void;
    onOpenWeekPicker: () => void;
    onOpenRecords: () => void;
}> = ({ week, snapshot, expanded, onToggleExpanded, onOpenWeekPicker, onOpenRecords }) => {
    const firstPlaceCount = week.dimensionRankings.filter(item => item.rank === 1).length;
    const isCurrentWeek = week.status === 'in_progress';

    return (
        <section className="relative z-10 mx-4 -mt-6 overflow-hidden rounded-[var(--tm-radius-card)] border border-white/80 bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]" aria-labelledby="week-overview-title">
            <div className="px-4 pt-4">
                <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                        <h2 id="week-overview-title" className="text-[17px] font-bold text-[var(--tm-text-primary)]">{isCurrentWeek ? '本周班级评比' : '班级评比'}</h2>
                        <button
                            type="button"
                            onClick={onOpenWeekPicker}
                            className="-ml-2 mt-1 flex min-h-12 max-w-full items-center gap-2 rounded-[var(--tm-radius-control)] px-2 text-left transition active:bg-[var(--tm-assistant-role-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                            aria-label={'切换评价周期，当前' + week.label}
                        >
                            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--tm-assistant-role-primary)]" strokeWidth={2.1} aria-hidden="true" />
                            <span className="min-w-0 flex-1">
                                <span className="block whitespace-nowrap text-[13px] font-semibold tabular-nums text-[var(--tm-text-secondary)]">{week.label}</span>
                                <span className="mt-0.5 block whitespace-nowrap text-[10px] font-medium text-[var(--tm-text-tertiary)]">{week.snapshotLabel}</span>
                            </span>
                            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                        </button>
                    </div>
                    <button
                        type="button"
                        onClick={onToggleExpanded}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--tm-assistant-role-soft)] text-[var(--tm-assistant-role-text)] transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                        aria-expanded={expanded}
                        aria-controls="week-dimension-rankings"
                        aria-label={expanded ? '收起五项评比数据' : '展开五项评比数据'}
                    >
                        {expanded ? <ChevronUp className="h-5 w-5" aria-hidden="true" /> : <ChevronDown className="h-5 w-5" aria-hidden="true" />}
                    </button>
                </div>

                <dl className="mt-2 grid grid-cols-3 divide-x divide-[var(--tm-border-subtle)] border-y border-[var(--tm-border-subtle)] py-3">
                    <div className="min-w-0 pr-3">
                        <dt className="text-[11px] font-medium text-[var(--tm-text-tertiary)]">五项合计</dt>
                        <dd className="mt-1 whitespace-nowrap text-[20px] font-bold tabular-nums text-[var(--tm-assistant-role-text)]">{formatScore(snapshot.finalScore)}<span className="ml-0.5 text-[11px] font-medium text-[var(--tm-text-tertiary)]">/100</span></dd>
                    </div>
                    <div className="min-w-0 px-3">
                        <dt className="text-[11px] font-medium text-[var(--tm-text-tertiary)]">{isCurrentWeek ? '暂列第一' : '获评第一'}</dt>
                        <dd className="mt-1 whitespace-nowrap text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{firstPlaceCount}<span className="ml-0.5 text-[11px] font-medium text-[var(--tm-text-tertiary)]">/5项</span></dd>
                    </div>
                    <div className="min-w-0 pl-3">
                        <dt className="text-[11px] font-medium text-[var(--tm-text-tertiary)]">{isCurrentWeek ? '本周扣分' : '周期扣分'}</dt>
                        <dd className="mt-1 whitespace-nowrap text-[20px] font-bold tabular-nums text-[var(--tm-status-negative)]">-{formatScore(snapshot.deduction)}<span className="ml-0.5 text-[11px] font-medium text-[var(--tm-text-tertiary)]">分</span></dd>
                    </div>
                </dl>

                <div className="flex min-h-12 items-center justify-between gap-3">
                    <div className="min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[var(--tm-text-primary)]">{week.summary}</p>
                        <p className="mt-0.5 truncate text-[11px] text-[var(--tm-text-tertiary)]">{week.focus}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-medium tabular-nums text-[var(--tm-text-tertiary)]">{snapshot.recordCount}笔记录</span>
                </div>
            </div>

            {expanded && (
                <div id="week-dimension-rankings" className="border-t border-[var(--tm-border-subtle)] px-4 pb-3 pt-2">
                    <div className="grid grid-cols-[minmax(0,1fr)_48px_42px_54px] items-center gap-2 py-1 text-right text-[10px] font-medium text-[var(--tm-text-tertiary)]" aria-hidden="true">
                        <span className="text-left">评比指标</span>
                        <span>得分</span>
                        <span>排名</span>
                        <span>距第一</span>
                    </div>
                    <div className="divide-y divide-[var(--tm-border-subtle)]">
                        {week.dimensionRankings.map(item => (
                            <div key={item.dimension} className="grid min-h-[50px] grid-cols-[minmax(0,1fr)_48px_42px_54px] items-center gap-2 text-right">
                                <div className="min-w-0 text-left">
                                    <div className="truncate text-[13px] font-semibold text-[var(--tm-text-primary)]">{item.dimension}</div>
                                    <div className="mt-0.5 text-[10px] tabular-nums text-[var(--tm-text-tertiary)]">{item.recordCount}笔记录</div>
                                </div>
                                <div className="text-[13px] font-semibold tabular-nums text-[var(--tm-text-primary)]">{formatScore(item.score)}</div>
                                <div className={'text-[13px] font-bold tabular-nums ' + (item.rank === 1 ? 'text-[var(--tm-assistant-role-text)]' : 'text-[var(--tm-text-primary)]')}>第{item.rank}</div>
                                <div className="text-[11px] font-medium tabular-nums text-[var(--tm-text-secondary)]">{item.gapToFirst === 0 ? (item.tiedForFirst ? '并列' : '第一') : `差${formatScore(item.gapToFirst)}`}</div>
                            </div>
                        ))}
                    </div>
                    <button
                        type="button"
                        onClick={onOpenRecords}
                        disabled={snapshot.recordCount === 0}
                        className="mt-2 flex min-h-11 w-full items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-assistant-role-soft)] px-3 text-[13px] font-semibold text-[var(--tm-assistant-role-text)] transition active:scale-[0.99] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                    >
                        <ClipboardList className="h-4 w-4" strokeWidth={2.2} aria-hidden="true" />
                        查看{isCurrentWeek ? '本周' : '本周期'}{snapshot.recordCount}笔记录
                    </button>
                </div>
            )}
        </section>
    );
};

const QuestionComposer: React.FC<{
    draft: string;
    replying: boolean;
    onDraftChange: (value: string) => void;
    onSubmit: (question: string) => void;
}> = ({ draft, replying, onDraftChange, onSubmit }) => (
    <form
        className="shrink-0 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-3 pb-[calc(8px+env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl"
        onSubmit={(event) => {
            event.preventDefault();
            onSubmit(draft);
        }}
    >
        <div className="grid grid-cols-[minmax(0,1fr)_44px] items-end gap-2 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] p-1.5">
            <AutoResizeTextarea
                value={draft}
                onChange={event => onDraftChange(event.target.value)}
                onKeyDown={event => {
                    if (event.key === 'Enter' && !event.shiftKey) {
                        event.preventDefault();
                        onSubmit(draft);
                    }
                }}
                minHeight={44}
                maxHeight={88}
                placeholder="问问本周得分、排名或扣分原因"
                aria-label="输入班级评价问题"
                className="w-full resize-none bg-transparent px-3 py-2.5 text-[14px] font-medium leading-6 text-[var(--tm-text-primary)] outline-none placeholder:text-[var(--tm-text-disabled)]"
            />
            <button
                type="submit"
                disabled={!draft.trim() || replying}
                className="flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-assistant-role-primary)] text-white transition active:scale-95 disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)] focus-visible:ring-offset-2"
                aria-label="发送问题"
            >
                <Send className="h-5 w-5" strokeWidth={2.3} aria-hidden="true" />
            </button>
        </div>
        <p className="mt-1.5 text-center text-[10px] leading-4 text-[var(--tm-text-disabled)]">内容由人工智能基于班级评价台账生成，请以学校复核记录为准</p>
    </form>
);

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
    const [selectedWeekId, setSelectedWeekId] = useState(DEFAULT_CLASS_EVALUATION_WEEK_ID);
    const selectedWeek = useMemo(() => getClassEvaluationWeek(selectedWeekId), [selectedWeekId]);
    const snapshot = useMemo(() => getClassEvaluationSnapshot(resolvedClassId, selectedWeekId), [resolvedClassId, selectedWeekId]);
    const records = useMemo(() => getClassEvaluationRecords(resolvedClassId, selectedWeekId), [resolvedClassId, selectedWeekId]);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [conversationOpen, setConversationOpen] = useState(false);
    const [overviewExpanded, setOverviewExpanded] = useState(false);
    const [draft, setDraft] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [showClassPicker, setShowClassPicker] = useState(false);
    const [showWeekPicker, setShowWeekPicker] = useState(false);
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
        if (previousClassIdRef.current === resolvedClassId) return;
        previousClassIdRef.current = resolvedClassId;
        clearConversation();
        setOverviewExpanded(false);
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

    const selectWeek = (weekId: string) => {
        setSelectedWeekId(weekId);
        setShowWeekPicker(false);
        setOverviewExpanded(false);
        clearConversation();
    };

    const latestSuggestions = [...messages]
        .reverse()
        .find(message => message.answer)?.answer?.followUpSuggestions ?? [];
    const focusDimension = selectedWeek.dimensionRankings.find(item => item.gapToFirst > 0)?.dimension ?? '本周评比';
    const recommendedQuestions = [
        `${selectedWeek.status === 'in_progress' ? '本周' : '这周'}为什么扣了${formatScore(snapshot.deduction)}分？`,
        '哪些属于教师组织责任？',
        `${focusDimension}怎么改？`,
    ];

    return (
        <div className="ai-assistant-theme-headteacher relative flex min-h-0 flex-1 flex-col overflow-hidden bg-[var(--tm-bg-page)] text-[var(--tm-text-primary)]">
            <AssistantSubpageHeader title="班主任助理 V2" onBack={onBack} />

            {conversationOpen ? (
                <>
                    <div className="flex min-h-16 shrink-0 items-center gap-2 border-b border-[var(--tm-border-subtle)] bg-[var(--tm-assistant-role-soft)] px-3">
                        <img
                            src={ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER}
                            alt=""
                            className="h-14 w-14 shrink-0 object-contain object-bottom"
                        />
                        <button
                            type="button"
                            onClick={() => setShowClassPicker(true)}
                            className="min-w-0 flex-1 rounded-[var(--tm-radius-control)] px-1 py-1 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                            aria-label={'切换班级，当前' + (activeClass?.name ?? '未选择')}
                        >
                            <span className="block truncate text-[13px] font-bold text-[var(--tm-text-primary)]">{activeClass?.name ?? '选择班级'} · {selectedWeek.label}</span>
                            <span className="mt-0.5 block truncate text-[11px] text-[var(--tm-text-tertiary)]">正在基于该周期评价台账回答</span>
                        </button>
                        <button
                            type="button"
                            onClick={() => setConversationOpen(false)}
                            className="flex min-h-11 shrink-0 items-center gap-1 rounded-[var(--tm-radius-control)] px-2 text-[12px] font-semibold text-[var(--tm-assistant-role-text)] transition active:bg-[var(--tm-assistant-role-soft-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
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
                                        <div className="w-full rounded-[var(--tm-radius-card)] rounded-tl-[6px] bg-[var(--tm-bg-surface)] px-4 py-3.5 [box-shadow:var(--tm-shadow-card)]">
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
                                    <div className="flex h-11 items-center gap-2 rounded-[var(--tm-radius-card)] rounded-tl-[6px] bg-[var(--tm-bg-surface)] px-4 text-[13px] font-medium text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-card)]">
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
                                        className="min-h-[var(--tm-size-touch)] rounded-full border border-[var(--tm-assistant-role-border)] bg-[var(--tm-bg-surface)] px-3 text-left text-[12px] font-semibold leading-5 text-[var(--tm-assistant-role-text)] transition active:scale-[0.98] active:bg-[var(--tm-assistant-role-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
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
                    <section className="relative h-[204px] overflow-hidden bg-[var(--tm-assistant-role-soft)] px-5 pt-2">
                        <button
                            type="button"
                            onClick={() => setShowClassPicker(true)}
                            className="relative z-10 -ml-2 flex min-h-11 max-w-[170px] items-center gap-1 rounded-[var(--tm-radius-control)] px-2 text-[13px] font-semibold text-[var(--tm-text-primary)] transition active:bg-[var(--tm-assistant-role-soft-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                            aria-label={'切换班级，当前' + (activeClass?.name ?? '未选择')}
                        >
                            <span className="truncate">{activeClass?.name ?? '选择班级'}</span>
                            <ChevronDown className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" strokeWidth={2.2} aria-hidden="true" />
                        </button>
                        <div className="relative z-10 mt-4 max-w-[58%]">
                            <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--tm-assistant-role-text)]">
                                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                                班主任 Agent
                            </div>
                            <h2 className="mt-2 text-[23px] font-bold leading-8 text-[var(--tm-text-primary)]">下午好</h2>
                            <p className="mt-0.5 text-[16px] font-semibold leading-6 text-[var(--tm-text-primary)]">我已看过{selectedWeek.status === 'in_progress' ? '本周' : '该周'}评比</p>
                            <p className="mt-1 text-[12px] font-medium leading-5 text-[var(--tm-assistant-role-text)]">{selectedWeek.focus}</p>
                        </div>
                        <img
                            src={ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER}
                            alt="AI班主任助理形象"
                            className="pointer-events-none absolute -bottom-2 -right-3 h-[184px] w-[184px] select-none object-contain object-bottom"
                        />
                    </section>

                    <WeekOverviewPanel
                        week={selectedWeek}
                        snapshot={snapshot}
                        expanded={overviewExpanded}
                        onToggleExpanded={() => setOverviewExpanded(current => !current)}
                        onOpenWeekPicker={() => setShowWeekPicker(true)}
                        onOpenRecords={() => setDetailRecords(records)}
                    />

                    <section className="mx-4 mt-5" aria-labelledby="recommended-questions-title">
                        <h2 id="recommended-questions-title" className="mb-2 px-1 text-[14px] font-bold text-[var(--tm-text-primary)]">你可以继续问我</h2>
                        <div className="overflow-hidden rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]">
                            {recommendedQuestions.map((question, index) => (
                                <button
                                    key={question}
                                    type="button"
                                    onClick={() => submitQuestion(question)}
                                    className={'flex min-h-14 w-full items-center gap-3 px-4 text-left transition active:bg-[var(--tm-assistant-role-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)] ' + (index > 0 ? 'border-t border-[var(--tm-border-subtle)]' : '')}
                                >
                                    <Sparkles className="h-4 w-4 shrink-0 text-[var(--tm-assistant-role-primary)]" strokeWidth={2.1} aria-hidden="true" />
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

            <MobileBottomSheet
                open={showWeekPicker}
                title="选择评价周期"
                onClose={() => setShowWeekPicker(false)}
            >
                <div className="divide-y divide-[var(--tm-border-subtle)]">
                    {CLASS_EVALUATION_WEEKS.map(week => {
                        const selected = week.id === selectedWeekId;
                        return (
                            <button
                                key={week.id}
                                type="button"
                                onClick={() => selectWeek(week.id)}
                                className="flex min-h-16 w-full items-center gap-3 text-left transition active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)]"
                                aria-current={selected ? 'true' : undefined}
                            >
                                <CalendarDays className={'h-5 w-5 shrink-0 ' + (selected ? 'text-[var(--tm-assistant-role-primary)]' : 'text-[var(--tm-text-tertiary)]')} aria-hidden="true" />
                                <span className="min-w-0 flex-1">
                                    <span className="block text-[15px] font-semibold tabular-nums text-[var(--tm-text-primary)]">{week.label}</span>
                                    <span className="mt-1 block text-[11px] text-[var(--tm-text-tertiary)]">{week.status === 'in_progress' ? week.snapshotLabel : '周评已结算'}</span>
                                </span>
                                {selected && <Check className="h-5 w-5 shrink-0 text-[var(--tm-assistant-role-primary)]" strokeWidth={2.3} aria-hidden="true" />}
                            </button>
                        );
                    })}
                </div>
            </MobileBottomSheet>

            {showClassPicker && (
                <HomeroomClassPickerSheet
                    classes={homeroomClasses}
                    selectedClassId={resolvedClassId}
                    onSelect={(classId) => {
                        onClassChange(classId);
                        setShowClassPicker(false);
                    }}
                    onClose={() => setShowClassPicker(false)}
                />
            )}
        </div>
    );
};

export default AiHeadteacherAssistantV2View;
