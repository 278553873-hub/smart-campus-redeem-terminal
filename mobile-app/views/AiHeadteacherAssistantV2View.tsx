import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
    ChartNoAxesCombined,
    CalendarDays,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ClipboardList,
    FileText,
    History,
    Keyboard,
    ListChecks,
    LoaderCircle,
    Mic,
    Send,
    ScanSearch,
    Sparkles,
    Telescope,
} from 'lucide-react';
import { ASSETS } from '../assets/images';
import AssistantClassSwitchButton from '../components/AssistantClassSwitchButton';
import AssistantSubpageHeader from '../components/AssistantSubpageHeader';
import HomeroomClassPickerSheet from '../components/HomeroomClassPickerSheet';
import AutoResizeTextarea from '../components/ui/AutoResizeTextarea';
import {
    CLASS_EVALUATION_WEEKS,
    DEFAULT_CLASS_EVALUATION_WEEK_ID,
    getClassEvaluationRecords,
    getClassEvaluationSnapshot,
    getClassEvaluationWeek,
    type ClassEvaluationDimensionRanking,
    type ClassEvaluationWeek,
} from '../data/classEvaluationAssistantV2';
import {
    CLASS_EVALUATION_WEEKLY_REPORT_PROMPT_VERSION,
    askClassEvaluationQuestion,
    generateClassEvaluationWeeklyReport,
    type ClassEvaluationAssistantAnswer,
    type ClassEvaluationRecord,
    type ClassEvaluationSnapshot,
    type ClassEvaluationWeeklyReport,
} from '../domain/classEvaluationAssistantV2';
import {
    findSavedClassEvaluationReport,
    listSavedClassEvaluationReports,
    saveClassEvaluationReport,
    type SavedClassEvaluationReport,
} from '../services/classEvaluationAssistantV2ReportStore';
import type { ClassInfo } from '../types';

interface AiHeadteacherAssistantV2ViewProps {
    onBack: () => void;
    homeroomClasses: ClassInfo[];
    activeClassId: string;
    onClassChange: (classId: string) => void;
    showStudentEvaluation: boolean;
    showClassEvaluation: boolean;
    onOpenWeeklyActionAdvice: (classId: string) => void;
    onOpenEvaluationReview: (classId: string) => void;
}

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content?: string;
    answer?: ClassEvaluationAssistantAnswer;
}

const formatScore = (score: number) => score.toFixed(1);
const formatCompactScore = (score: number) => Number.isInteger(score) ? String(score) : score.toFixed(1);

const formatRecordDate = (date: string) => {
    const [, month, day] = date.split('-');
    return `${Number(month)}月${Number(day)}日`;
};

const getAssistantIntro = () => {
    const hour = new Date().getHours();
    const greeting = hour < 12 ? '上午好' : hour < 18 ? '下午好' : '晚上好';
    return `${greeting}，\n我将为您提供数据分析和指导建议。`;
};

const getTypeDelay = (char: string) => {
    if (char === '，') return 150;
    if (char === '。') return 220;
    return 56;
};

const REPORT_GENERATION_STEPS = [
    '正在汇总本周班级评价数据',
    '正在分析得分与扣分情况',
    '正在对比指标表现与周变化',
    '正在生成本周分析与指导建议',
] as const;

const OVERVIEW_RECOMMENDED_QUESTIONS = [
    '班级评价主要扣在哪？',
    '班级评价较上周哪项变化最大？',
    '根据班级评价，下周优先关注什么？',
] as const;

const STUDENT_EVALUATION_QUESTIONS = [
    {
        label: '本周学生情况洞察与班级跟进建议',
        action: 'weekly_action_advice',
        icon: Telescope,
    },
    {
        label: '上月评价记录复盘与改进建议',
        action: 'evaluation_review',
        icon: ScanSearch,
    },
] as const;

const getFollowUpQuestions = (answerType: ClassEvaluationAssistantAnswer['answerType']) => {
    if (answerType === 'weekly_performance') {
        return OVERVIEW_RECOMMENDED_QUESTIONS.slice(0, 2);
    }
    if (answerType === 'deduction_patterns') {
        return ['哪一笔扣分影响最大？', OVERVIEW_RECOMMENDED_QUESTIONS[2]];
    }
    if (answerType === 'next_week_focus') {
        return ['这些建议对应哪些扣分记录？', '本周表现最稳定的是哪些项目？'];
    }
    return OVERVIEW_RECOMMENDED_QUESTIONS.slice(0, 2);
};

const ReportInsightList: React.FC<{
    insights: ClassEvaluationWeeklyReport['performanceInsights'];
}> = ({ insights }) => (
    <div className="mt-2 space-y-2">
        {insights.map(item => (
            <p key={item.title} className="text-pretty text-[13px] leading-5 text-[var(--tm-text-secondary)]">
                <span className="font-semibold text-[var(--tm-text-primary)]">{item.title}：</span>{item.body}
            </p>
        ))}
    </div>
);

const WeeklyReportContent: React.FC<{
    report: ClassEvaluationWeeklyReport;
}> = ({ report }) => (
    <div>
        <p className="text-pretty whitespace-pre-line text-[15px] font-semibold leading-6 text-[var(--tm-text-primary)]">{report.message}</p>

        <section className="mt-4" aria-labelledby="weekly-report-data-overview">
            <h2 id="weekly-report-data-overview" className="flex items-center gap-2 text-[13px] font-bold text-[var(--tm-text-primary)]">
                <ClipboardList className="h-4 w-4 text-[var(--tm-assistant-role-text)]" strokeWidth={2.1} aria-hidden="true" />
                数据概览
            </h2>

            {report.metrics.length > 0 && (
                <dl className="mt-3 grid grid-cols-3 gap-3">
                    {report.metrics.map(metric => (
                        <div key={metric.label} className="min-w-0">
                            <dt className="truncate text-[11px] font-medium text-[var(--tm-text-tertiary)]">{metric.label}</dt>
                            <dd className={'mt-1 truncate text-[18px] font-bold tabular-nums ' + (metric.tone === 'negative' ? 'text-[var(--tm-status-negative)]' : 'text-[var(--tm-assistant-role-text)]')}>{metric.value}</dd>
                        </div>
                    ))}
                </dl>
            )}

            {report.dimensionScores.length > 0 && (
                <div className="mt-3 space-y-0.5">
                    {report.dimensionScores.map((item, index) => (
                        <div key={item.label + '-' + index} className="grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 py-1.5">
                            <div className="min-w-0">
                                <div className="truncate text-[13px] font-semibold text-[var(--tm-text-primary)]">{item.label}</div>
                                <div className="mt-0.5 truncate text-[11px] text-[var(--tm-text-tertiary)]">{item.detail}</div>
                            </div>
                            <div className={'text-[13px] font-bold tabular-nums ' + (item.tone === 'negative' ? 'text-[var(--tm-status-negative)]' : 'text-[var(--tm-text-primary)]')}>{item.value}</div>
                        </div>
                    ))}
                </div>
            )}
        </section>

        {report.performanceInsights.length > 0 && (
            <section className="mt-5" aria-labelledby="weekly-report-performance">
                <h2 id="weekly-report-performance" className="flex items-center gap-2 text-[13px] font-bold text-[var(--tm-text-primary)]">
                    <Sparkles className="h-4 w-4 text-[var(--tm-assistant-role-text)]" strokeWidth={2.1} aria-hidden="true" />
                    本周整体表现
                </h2>
                <ReportInsightList insights={report.performanceInsights} />
            </section>
        )}

        {report.deductionInsights.length > 0 && (
            <section className="mt-5" aria-labelledby="weekly-report-deductions">
                <h2 id="weekly-report-deductions" className="flex items-center gap-2 text-[13px] font-bold text-[var(--tm-text-primary)]">
                    <ClipboardList className="h-4 w-4 text-[var(--tm-status-negative)]" strokeWidth={2.1} aria-hidden="true" />
                    主要扣分问题
                </h2>
                <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1">
                    {report.deductionBreakdown.slice(0, 4).map(item => (
                        <div key={item.label} className="flex min-h-9 items-center justify-between gap-2 text-[12px]">
                            <span className="truncate text-[var(--tm-text-secondary)]">{item.label}</span>
                            <span className="shrink-0 font-bold tabular-nums text-[var(--tm-status-negative)]">{item.value}</span>
                        </div>
                    ))}
                </div>
                <ReportInsightList insights={report.deductionInsights} />
            </section>
        )}

        {report.nextWeekSuggestions.length > 0 && (
            <section className="mt-5" aria-labelledby="weekly-report-next-week">
                <h2 id="weekly-report-next-week" className="flex items-center gap-2 text-[13px] font-bold text-[var(--tm-text-primary)]">
                    <ListChecks className="h-4 w-4 text-[var(--tm-assistant-role-text)]" strokeWidth={2.1} aria-hidden="true" />
                    下周关注重点
                </h2>
                <ReportInsightList insights={report.nextWeekInsights} />
                <ol className="mt-3 space-y-2">
                    {report.nextWeekSuggestions.map((item, index) => (
                        <li key={item.title} className="grid grid-cols-[20px_minmax(0,1fr)] gap-2 text-[13px] leading-5 text-[var(--tm-text-secondary)]">
                            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[var(--tm-assistant-role-soft-strong)] text-[10px] font-bold text-[var(--tm-assistant-role-text)]" aria-hidden="true">{index + 1}</span>
                            <span><span className="font-semibold text-[var(--tm-text-primary)]">{item.title}：</span>{item.body}</span>
                        </li>
                    ))}
                </ol>
            </section>
        )}

    </div>
);

const ConversationAnswerContent: React.FC<{
    answer: ClassEvaluationAssistantAnswer;
}> = ({ answer }) => (
    <div className="space-y-3 text-pretty text-[14px] tm-font-regular leading-6 text-[var(--tm-text-primary)]">
        <p className="whitespace-pre-line">{answer.message}</p>

        {answer.breakdown.length > 0 && (
            <p>
                具体来看，{answer.breakdown.map(item => (
                    `${item.label}${item.detail ? `（${item.detail}）` : ''}${item.value ? `：${item.value}` : ''}`
                )).join('；')}。
            </p>
        )}

        {answer.analysis.length > 0 && (
            <p>从分析结果看，{answer.analysis.map(item => item.body).join('')}</p>
        )}

        {answer.suggestions.length > 0 && (
            <p>接下来，{answer.suggestions.map(item => item.body).join('')}</p>
        )}
    </div>
);

const ConversationThread: React.FC<{
    messages: ChatMessage[];
    replying: boolean;
    latestAssistantRef: React.RefObject<HTMLDivElement | null>;
}> = ({
    messages,
    replying,
    latestAssistantRef,
}) => (
    <section className="mx-4 mt-5 space-y-4" aria-label="班级评价对话" aria-live="polite">
        {messages.map((message, index) => (
            <div
                key={message.id}
                ref={message.role === 'assistant' && index === messages.length - 1 ? latestAssistantRef : undefined}
                className={'flex scroll-mt-2 ' + (message.role === 'user' ? 'justify-end' : 'items-start')}
            >
                {message.role === 'user' ? (
                    <div className="max-w-[82%] rounded-[18px] rounded-br-[6px] bg-[var(--tm-assistant-role-primary)] px-4 py-2.5 text-[15px] font-medium leading-6 text-white [box-shadow:var(--tm-shadow-control)]">
                        {message.content}
                    </div>
                ) : message.answer ? (
                    <div className="headteacher-agent-glass min-w-0 flex-1 rounded-[var(--tm-radius-card)] rounded-tl-[6px] px-4 py-3.5">
                        <ConversationAnswerContent answer={message.answer} />
                    </div>
                ) : null}
            </div>
        ))}

        {replying && (
            <div className="headteacher-agent-glass flex h-11 w-fit items-center gap-2 rounded-[var(--tm-radius-card)] rounded-tl-[6px] px-4 text-[13px] font-medium text-[var(--tm-text-secondary)]" role="status">
                <LoaderCircle className="h-4 w-4 animate-spin text-[var(--tm-assistant-role-primary)]" aria-hidden="true" />
                正在分析班级评价数据
            </div>
        )}

    </section>
);

type ComposerMode = 'voice' | 'text';
type VoiceState = 'idle' | 'listening' | 'error';

const SuggestedQuestionList: React.FC<{
    questions: readonly string[];
    disabled: boolean;
    onSelect: (question: string) => void;
}> = ({ questions, disabled, onSelect }) => (
    <div
        className="-mx-3 mb-1 flex touch-pan-x gap-2 overflow-x-auto overscroll-x-contain px-3 pb-1 pr-12 no-scrollbar"
        aria-label={`共${questions.length}个快捷问题`}
    >
        {questions.map((question, index) => (
            <button
                key={question}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(question)}
                className="min-h-[var(--tm-size-touch)] shrink-0 whitespace-nowrap rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-glass)] px-3 text-[12px] font-semibold text-[var(--tm-assistant-role-text)] [box-shadow:var(--tm-shadow-control)] transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.98] active:bg-[var(--tm-assistant-role-soft)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                aria-label={`快捷问题 ${index + 1}/${questions.length}：${question}`}
            >
                {question}
            </button>
        ))}
    </div>
);

const StudentQuestionList: React.FC<{
    onSelect: (action: typeof STUDENT_EVALUATION_QUESTIONS[number]['action']) => void;
    className?: string;
}> = ({ onSelect, className = '' }) => (
    <section className={`relative z-10 space-y-2 ${className}`} aria-label="报告快捷入口">
        {STUDENT_EVALUATION_QUESTIONS.map(item => (
            <button
                key={item.label}
                type="button"
                onClick={() => onSelect(item.action)}
                className="flex min-h-14 w-full items-center gap-2.5 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] pl-3 pr-3.5 text-left [box-shadow:var(--tm-shadow-control)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
            >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[var(--tm-role-headteacher-soft)] text-[var(--tm-assistant-role-text)]" aria-hidden="true">
                    <item.icon className="h-[17px] w-[17px]" strokeWidth={2} />
                </span>
                <span className="min-w-0 flex-1 whitespace-nowrap text-[length:var(--tm-font-size-body)] font-medium leading-5 text-[var(--tm-text-primary)]">{item.label}</span>
                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
            </button>
        ))}
    </section>
);

const QuestionComposer: React.FC<{
    draft: string;
    replying: boolean;
    suggestedQuestions: readonly string[];
    onDraftChange: (value: string) => void;
    onSubmit: (question: string) => void;
}> = ({ draft, replying, suggestedQuestions, onDraftChange, onSubmit }) => {
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
            className="shrink-0 bg-transparent px-3 pt-1"
            onSubmit={(event) => {
                event.preventDefault();
                onSubmit(draft);
            }}
        >
            {suggestedQuestions.length > 0 && (
                <SuggestedQuestionList
                    questions={suggestedQuestions}
                    disabled={replying}
                    onSelect={onSubmit}
                />
            )}
            {mode === 'voice' ? (
                <div className="headteacher-agent-glass relative h-[52px] overflow-hidden rounded-full p-1">
                    <button
                        type="button"
                        onClick={() => setMode('text')}
                        className="absolute left-1 top-1 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tm-bg-surface-glass)] text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)]"
                        aria-label="切换到文字输入"
                    >
                        <Keyboard className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
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
                        className={'absolute inset-1 flex select-none items-center justify-center rounded-full px-14 text-[15px] font-semibold transition-[scale,background-color,color] duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)] ' + (voiceState === 'listening' ? 'bg-[var(--tm-assistant-role-primary)] text-white' : 'text-[var(--tm-text-primary)] active:bg-[var(--tm-role-headteacher-glass-surface-strong)]')}
                        aria-label={voiceState === 'listening' ? '正在聆听，松开发送' : '按住说话'}
                    >
                        {voiceState === 'listening' ? '正在聆听，松开发送' : '按住说话'}
                    </button>
                </div>
            ) : (
                <div className="headteacher-agent-glass grid min-h-[52px] grid-cols-[44px_minmax(0,1fr)_44px] items-end overflow-hidden rounded-[26px] p-1">
                    <button
                        type="button"
                        onClick={() => {
                            setVoiceState('idle');
                            setMode('voice');
                        }}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-assistant-role-text)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-assistant-role-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
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
                        minHeight={44}
                        maxHeight={88}
                        placeholder={voiceFallback ? '当前环境暂不支持语音，请输入文字' : '输入班级评价问题'}
                        aria-label="输入班级评价问题"
                        className="w-full resize-none bg-transparent px-2.5 py-2.5 text-[14px] font-medium leading-6 text-[var(--tm-text-primary)] outline-none placeholder:text-[var(--tm-text-disabled)]"
                    />
                    <button
                        type="submit"
                        disabled={!draft.trim() || replying}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tm-assistant-role-primary)] text-white transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)] focus-visible:ring-offset-2"
                        aria-label="发送问题"
                    >
                        <Send className="h-5 w-5" strokeWidth={2.3} aria-hidden="true" />
                    </button>
                </div>
            )}
        </form>
    );
};

const formatGeneratedAt = (date: string) => {
    const value = new Date(date);
    if (Number.isNaN(value.getTime())) return '';
    return `${value.getMonth() + 1}月${value.getDate()}日 ${String(value.getHours()).padStart(2, '0')}:${String(value.getMinutes()).padStart(2, '0')}`;
};

const AgentGenerationProgress: React.FC<{ visibleStepCount: number }> = ({ visibleStepCount }) => (
    <div className="mx-auto mt-8 min-h-[210px] max-w-[280px]" role="status" aria-live="polite" aria-label="正在生成本周班级评比分析">
        <div className="space-y-4">
            {REPORT_GENERATION_STEPS.slice(0, visibleStepCount).map((step, index) => {
                const active = index === visibleStepCount - 1;
                return (
                    <div key={step} className="animate-in fade-in slide-in-from-bottom-1 flex items-start gap-3 duration-300">
                        <span className={'mt-[7px] h-1.5 w-1.5 shrink-0 rounded-full ' + (active
                            ? 'animate-pulse bg-[var(--tm-assistant-role-primary)]'
                            : 'bg-[var(--tm-border-subtle)]')} aria-hidden="true" />
                        <p className={'text-[13px] tm-font-regular leading-5 ' + (active
                            ? 'text-[var(--tm-text-secondary)]'
                            : 'text-[var(--tm-text-tertiary)]')}>{step}</p>
                    </div>
                );
            })}
        </div>
    </div>
);

interface HistoryMonthGroup {
    key: string;
    label: string;
    reports: SavedClassEvaluationReport[];
}

const groupReportsByMonth = (reports: SavedClassEvaluationReport[]) => [...reports]
    .sort((first, second) => second.weekId.localeCompare(first.weekId))
    .reduce<HistoryMonthGroup[]>((groups, report) => {
        const [year, month] = report.weekId.split('_')[0].split('-');
        const key = `${year}-${month}`;
        const existing = groups.find(group => group.key === key);
        if (existing) existing.reports.push(report);
        else groups.push({ key, label: `${year}年${Number(month)}月`, reports: [report] });
        return groups;
    }, []);

const ClassEvaluationHistoryPage: React.FC<{
    reports: SavedClassEvaluationReport[];
    activeClassId: string;
    onOpenReport: (report: SavedClassEvaluationReport) => void;
}> = ({
    reports,
    activeClassId,
    onOpenReport,
}) => {
    const visibleReports = reports.filter(report => report.classId === activeClassId);
    const monthGroups = groupReportsByMonth(visibleReports);

    return (
        <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-6 no-scrollbar">
            <section className="pt-2" aria-labelledby="history-title">
                <h1 id="history-title" className="px-1 text-[20px] font-bold text-[var(--tm-text-primary)]">历史报告</h1>

            </section>

            <section className="mt-4 space-y-5" aria-label="往期班级周评报告">
                {monthGroups.length > 0 ? (
                    monthGroups.map(group => (
                        <section key={group.key} aria-labelledby={`history-month-${group.key}`}>
                            <div className="relative flex h-6 items-center pl-5">
                                <span className="absolute left-0 h-3 w-3 rounded-full border-[3px] border-[var(--tm-assistant-role-soft-strong)] bg-[var(--tm-assistant-role-primary)]" aria-hidden="true" />
                                <h2 id={`history-month-${group.key}`} className="text-[13px] font-semibold text-[var(--tm-text-tertiary)]">{group.label}</h2>
                            </div>
                            <div className="relative mt-2 space-y-3 pl-5">
                                <span className="absolute -top-5 bottom-9 left-[5px] w-px bg-[var(--tm-border-subtle)]" aria-hidden="true" />
                                {group.reports.map(report => (
                                    <button
                                        key={report.id}
                                        type="button"
                                        onClick={() => onOpenReport(report)}
                                        className="headteacher-agent-glass relative flex min-h-[72px] w-full items-center gap-3 rounded-[var(--tm-radius-card)] px-4 py-3 text-left transition-[scale,background-color] duration-150 ease-out active:scale-[0.985] active:bg-[var(--tm-role-headteacher-glass-surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                                    >
                                        <span className="absolute -left-[19px] top-1/2 h-2.5 w-2.5 -translate-y-1/2 rounded-full border-2 border-[var(--tm-bg-surface)] bg-[var(--tm-assistant-role-primary)]" aria-hidden="true" />
                                        <span className="min-w-0 flex-1">
                                            <span className="block text-[15px] font-bold text-[var(--tm-text-primary)]">{report.weekLabel}</span>
                                            <span className="mt-1 block text-[11px] tabular-nums text-[var(--tm-text-tertiary)]">数据截至 {report.dataRangeLabel} · {formatGeneratedAt(report.generatedAt)}生成</span>
                                        </span>
                                        <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" aria-hidden="true" />
                                    </button>
                                ))}
                            </div>
                        </section>
                    ))
                ) : (
                    <div className="py-20 text-center">
                        <History className="mx-auto h-8 w-8 text-[var(--tm-text-disabled)]" strokeWidth={1.8} aria-hidden="true" />
                        <p className="mt-3 text-[14px] font-semibold text-[var(--tm-text-secondary)]">暂无往期报告</p>
                        <p className="mt-1 text-[12px] text-[var(--tm-text-tertiary)]">报告只在主动生成后保存</p>
                    </div>
                )}
            </section>
        </div>
    );
};

const RecordDetailList: React.FC<{
    records: ClassEvaluationRecord[];
}> = ({ records }) => (
    <div className="divide-y divide-[var(--tm-border-subtle)]">
        {records.map(record => (
            <article key={record.id} className="py-4 first:pt-0">
                <div className="flex items-center justify-between gap-3">
                    <time className="text-[12px] tabular-nums text-[var(--tm-text-tertiary)]" dateTime={record.date}>{formatRecordDate(record.date)}</time>
                    <div className="shrink-0 text-[16px] font-bold tabular-nums text-[var(--tm-status-negative)]">-{record.deduction.toFixed(1)}分</div>
                </div>

                <div className="mt-2 text-[12px] leading-5 text-[var(--tm-text-secondary)]">
                    <span className="mr-2 text-[var(--tm-text-tertiary)]">指标</span>
                    <span>{record.indicatorPath?.join(' / ') ?? [record.dimension, record.indicator].join(' / ')}</span>
                </div>

                <div className="mt-3">
                    <div className="text-[11px] font-medium text-[var(--tm-text-tertiary)]">原文</div>
                    <p className="mt-1 text-[14px] leading-6 text-[var(--tm-text-primary)]">{record.finding}</p>
                </div>
            </article>
        ))}
    </div>
);

const DimensionScoreBullet: React.FC<{
    score: number;
    maxScore: number;
}> = ({ score, maxScore }) => {
    const percentage = maxScore > 0
        ? Math.min(100, Math.max(0, (score / maxScore) * 100))
        : 0;

    return (
        <span className="flex min-w-0 flex-col items-center gap-1" aria-hidden="true">
            <span className="text-[10px] font-semibold tabular-nums leading-none text-[var(--tm-text-primary)]">
                {formatCompactScore(score)}/{formatCompactScore(maxScore)}
            </span>
            <span className="relative h-1.5 w-full rounded-full bg-[var(--tm-assistant-role-soft-strong)]">
                <span
                    className="absolute inset-y-0 left-0 rounded-full bg-[var(--tm-assistant-role-primary)]"
                    style={{ width: `${percentage}%` }}
                />
            </span>
        </span>
    );
};

const DimensionRankingTable: React.FC<{
    rankings: ClassEvaluationDimensionRanking[];
    onSelect: (dimension: string) => void;
    selectedDimension?: string;
}> = ({ rankings, onSelect, selectedDimension }) => (
    <div className="px-3 pb-2">
        <div className="grid min-h-8 grid-cols-[minmax(0,1fr)_88px_60px_60px] items-center rounded-[var(--tm-radius-control)] bg-[var(--tm-role-headteacher-glass-surface-strong)] px-2 text-[10px] font-medium text-[var(--tm-text-tertiary)]">
            <span>指标</span>
            <span className="text-center">分数/总分</span>
            <span className="text-center">年级排名</span>
            <span className="text-center">全校排名</span>
        </div>
        <div className="mt-0.5 space-y-0.5">
            {rankings.map(item => (
                <button
                    key={item.dimension}
                    type="button"
                    onClick={() => onSelect(item.dimension)}
                    className={'grid min-h-12 w-full grid-cols-[minmax(0,1fr)_88px_60px_60px] items-center rounded-[var(--tm-radius-control)] px-2 text-left transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface)] focus-visible:bg-[var(--tm-role-headteacher-glass-surface-strong)] focus-visible:outline-none ' + (selectedDimension === item.dimension ? 'bg-[var(--tm-role-headteacher-glass-surface-strong)]' : '')}
                    aria-label={`${item.dimension}，${formatCompactScore(item.score)}/${formatCompactScore(item.maxScore)}分，年级第${item.gradeRank}名，全校第${item.schoolRank}名，查看扣分情况`}
                    aria-pressed={selectedDimension === item.dimension || undefined}
                >
                    <span className="min-w-0 truncate pr-2 text-[12px] font-semibold text-[var(--tm-text-primary)]">{item.dimension}</span>
                    <DimensionScoreBullet score={item.score} maxScore={item.maxScore} />
                    <span className="text-center text-[12px] font-medium tabular-nums text-[var(--tm-text-secondary)]">第{item.gradeRank}</span>
                    <span className="text-center text-[12px] font-medium tabular-nums text-[var(--tm-text-secondary)]">第{item.schoolRank}</span>
                </button>
            ))}
        </div>
    </div>
);

const DimensionTabs: React.FC<{
    rankings: ClassEvaluationDimensionRanking[];
    selectedDimension: string;
    onSelect: (dimension: string) => void;
    className?: string;
}> = ({ rankings, selectedDimension, onSelect, className = '' }) => (
    <div className={`overflow-x-auto no-scrollbar ${className}`} role="tablist" aria-label="一级指标">
        <div className="flex min-w-max">
            {rankings.map(item => {
                const selected = item.dimension === selectedDimension;
                return (
                    <button
                        key={item.dimension}
                        type="button"
                        role="tab"
                        aria-selected={selected}
                        onClick={() => onSelect(item.dimension)}
                        className={'relative min-h-11 shrink-0 px-3 text-[13px] font-semibold transition-[color,background-color] duration-150 ease-out after:absolute after:bottom-0 after:left-1/2 after:h-0.5 after:w-5 after:-translate-x-1/2 after:rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)] ' + (selected
                            ? 'text-[var(--tm-text-primary)] after:bg-[var(--tm-assistant-role-primary)]'
                            : 'text-[var(--tm-text-tertiary)] after:bg-transparent active:bg-[var(--tm-bg-surface-soft)]')}
                    >
                        {item.dimension}
                    </button>
                );
            })}
        </div>
    </div>
);

const WeekOverviewPanel: React.FC<{
    week: ClassEvaluationWeek;
    snapshot: ClassEvaluationSnapshot;
    expanded: boolean;
    onToggleExpanded: () => void;
    onOpenDimensionDetails: (dimension: string) => void;
    onOpenDetails: () => void;
    onOpenWeekDetail: () => void;
}> = ({
    week,
    snapshot,
    expanded,
    onToggleExpanded,
    onOpenDimensionDetails,
    onOpenDetails,
    onOpenWeekDetail,
}) => (
    <section className="overflow-hidden rounded-[var(--tm-radius-control)] bg-[var(--tm-role-headteacher-data-surface)] [box-shadow:var(--tm-role-headteacher-data-shadow)]" aria-labelledby="week-data-title">
        <div className="px-4 pb-3 pt-3">
            <div className="flex min-h-11 items-center justify-between gap-2">
                <div className="flex min-w-0 items-center gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] bg-[var(--tm-bg-surface)] text-[var(--tm-assistant-role-text)] [box-shadow:var(--tm-shadow-control)]" aria-hidden="true">
                        <ChartNoAxesCombined className="h-[17px] w-[17px]" strokeWidth={2.1} />
                    </span>
                    <h2 id="week-data-title" className="shrink-0 text-balance text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">本周数据</h2>
                </div>
                <button
                    type="button"
                    onClick={onOpenWeekDetail}
                    className="flex min-h-11 min-w-0 items-center gap-1 rounded-[var(--tm-radius-control)] pl-2 pr-1.5 text-[11px] font-medium tabular-nums text-[var(--tm-text-tertiary)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                    aria-label={'打开周数据页面，当前' + week.label}
                >
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" strokeWidth={2.1} aria-hidden="true" />
                    <span className="truncate">{week.label}</span>
                    <ChevronRight className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                </button>
            </div>

            <dl className="mt-2 grid grid-cols-[1.18fr_0.82fr] items-end gap-4">
                <div className="min-w-0 pb-1">
                    <dt className="text-[11px] font-medium text-[var(--tm-text-tertiary)]">本周总分</dt>
                    <dd className="mt-1 whitespace-nowrap text-[30px] font-bold tabular-nums leading-none text-[var(--tm-assistant-role-text)]">{formatScore(snapshot.finalScore)}<span className="ml-0.5 text-[11px] font-medium text-[var(--tm-text-tertiary)]">分</span></dd>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[var(--tm-role-headteacher-soft-strong)]" aria-hidden="true">
                        <div className="h-full rounded-full bg-[var(--tm-assistant-role-primary)]" style={{ width: `${Math.min(Math.max(snapshot.finalScore, 0), 100)}%` }} />
                    </div>
                </div>
                <div className="grid min-w-0 grid-cols-2 gap-3 pb-1">
                    <div className="min-w-0">
                        <dt className="whitespace-nowrap text-[10px] font-medium text-[var(--tm-text-tertiary)]">年级排名</dt>
                        <dd className="mt-1.5 whitespace-nowrap text-[20px] font-bold tabular-nums leading-none text-[var(--tm-text-primary)]">第{week.gradeRank}<span className="ml-0.5 text-[10px] font-medium text-[var(--tm-text-tertiary)]">名</span></dd>
                    </div>
                    <div className="min-w-0">
                        <dt className="whitespace-nowrap text-[10px] font-medium text-[var(--tm-text-tertiary)]">学校排名</dt>
                        <dd className="mt-1.5 whitespace-nowrap text-[20px] font-bold tabular-nums leading-none text-[var(--tm-text-primary)]">第{week.schoolRank}<span className="ml-0.5 text-[10px] font-medium text-[var(--tm-text-tertiary)]">名</span></dd>
                    </div>
                </div>
            </dl>
        </div>

        <div className="flex min-h-[var(--tm-size-touch)] items-center justify-end bg-[var(--tm-bg-surface-glass)] px-3">
            <button
                type="button"
                onClick={onToggleExpanded}
                className={'relative flex items-center justify-center overflow-visible rounded-full bg-[var(--tm-bg-surface)] text-[13px] font-medium text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)] after:absolute after:content-[\'\'] transition-[width,height,scale,background-color,box-shadow] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)] focus-visible:bg-[var(--tm-bg-surface-muted)] focus-visible:outline-none ' + (expanded
                    ? 'h-[var(--tm-assistant-icon-control-visual-size)] w-[var(--tm-assistant-icon-control-visual-size)] after:-inset-1'
                    : 'h-[var(--tm-assistant-secondary-pill-height)] w-[92px] after:-inset-y-[7px] after:inset-x-0')}
                aria-expanded={expanded}
                aria-controls="week-dimension-list"
                aria-label={expanded ? '收起分类数据' : '展开分类数据'}
            >
                <span className={'flex min-w-0 items-center justify-center gap-1.5 whitespace-nowrap transition-[max-width,opacity,filter,scale] duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ' + (expanded ? 'max-w-0 scale-[0.25] opacity-0 blur-[4px]' : 'max-w-20 scale-100 opacity-100 blur-0')} aria-hidden="true">
                    <span>分类数据</span>
                </span>
                <ChevronDown className={'h-[18px] w-[18px] shrink-0 transition-transform duration-300 [transition-timing-function:cubic-bezier(0.2,0,0,1)] ' + (expanded ? 'rotate-180' : 'rotate-0')} strokeWidth={2.2} aria-hidden="true" />
            </button>
        </div>

        {expanded && (
            <div id="week-dimension-list">
                <DimensionRankingTable rankings={week.dimensionRankings} onSelect={onOpenDimensionDetails} />
                <div className="flex min-h-[var(--tm-size-touch)] items-center justify-center pb-1">
                    <button
                        type="button"
                        onClick={onOpenDetails}
                        className="flex min-h-11 items-center gap-1 rounded-[var(--tm-radius-control)] px-3 text-[13px] font-semibold text-[var(--tm-assistant-role-text)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface-strong)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                    >
                        展示明细
                        <ChevronRight className="h-4 w-4 translate-x-px" aria-hidden="true" />
                    </button>
                </div>
            </div>
        )}

    </section>
);

const ClassContextPanel: React.FC<{
    activeClass?: ClassInfo;
    canSwitchClass: boolean;
    showClassEvaluation: boolean;
    showStudentEvaluation: boolean;
    week: ClassEvaluationWeek;
    snapshot: ClassEvaluationSnapshot;
    expanded: boolean;
    onClassPickerOpen: () => void;
    onToggleExpanded: () => void;
    onOpenDimensionDetails: (dimension: string) => void;
    onOpenDetails: () => void;
    onOpenWeekDetail: () => void;
    onStudentQuestionSelect: (action: typeof STUDENT_EVALUATION_QUESTIONS[number]['action']) => void;
}> = ({
    activeClass,
    canSwitchClass,
    showClassEvaluation,
    showStudentEvaluation,
    week,
    snapshot,
    expanded,
    onClassPickerOpen,
    onToggleExpanded,
    onOpenDimensionDetails,
    onOpenDetails,
    onOpenWeekDetail,
    onStudentQuestionSelect,
}) => (
    <section className="headteacher-agent-glass headteacher-context-card relative z-10 mx-4 -mt-5 overflow-hidden rounded-[var(--tm-radius-card)] p-2" aria-label="当前班级数据与分析功能">
        {canSwitchClass && (
            <div className="mb-1 flex min-h-10 items-center px-3">
                <AssistantClassSwitchButton
                    activeClass={activeClass}
                    onClick={onClassPickerOpen}
                    variant="quiet"
                    className="-ml-1 justify-start"
                />
            </div>
        )}

        {showClassEvaluation && (
            <div className="mx-2">
                <WeekOverviewPanel
                    week={week}
                    snapshot={snapshot}
                    expanded={expanded}
                    onToggleExpanded={onToggleExpanded}
                    onOpenDimensionDetails={onOpenDimensionDetails}
                    onOpenDetails={onOpenDetails}
                    onOpenWeekDetail={onOpenWeekDetail}
                />
            </div>
        )}

        {showStudentEvaluation && (
            <StudentQuestionList
                className={`mx-3 pb-2 ${showClassEvaluation ? 'mt-3' : ''}`}
                onSelect={onStudentQuestionSelect}
            />
        )}
    </section>
);

const WeekDataDetailPage: React.FC<{
    weekId: string;
    classId: string;
    initialDimension?: string;
    activeClass?: ClassInfo;
    onBack: () => void;
    onClassPickerOpen: () => void;
    onWeekChange: (weekId: string) => void;
}> = ({ weekId, classId, initialDimension, activeClass, onBack, onClassPickerOpen, onWeekChange }) => {
    const weekIndex = CLASS_EVALUATION_WEEKS.findIndex(item => item.id === weekId);
    const week = getClassEvaluationWeek(weekId);
    const snapshot = getClassEvaluationSnapshot(classId, weekId);
    const records = getClassEvaluationRecords(classId, weekId);
    const olderWeek = CLASS_EVALUATION_WEEKS[weekIndex + 1];
    const newerWeek = CLASS_EVALUATION_WEEKS[weekIndex - 1];
    const defaultDimension = week.dimensionRankings.find(item => item.recordCount > 0)?.dimension
        ?? week.dimensionRankings[0]?.dimension
        ?? '';
    const [selectedDimension, setSelectedDimension] = useState(initialDimension ?? defaultDimension);
    const selectedRanking = week.dimensionRankings.find(item => item.dimension === selectedDimension)
        ?? week.dimensionRankings[0];
    const selectedRecords = records.filter(record => record.dimension === selectedRanking?.dimension);
    useEffect(() => {
        if (week.dimensionRankings.some(item => item.dimension === selectedDimension)) return;
        setSelectedDimension(defaultDimension);
    }, [defaultDimension, selectedDimension, week.dimensionRankings]);

    return (
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent">
            <AssistantSubpageHeader
                onBack={onBack}
                surface="transparent"
                centerContent={<AssistantClassSwitchButton activeClass={activeClass} onClick={onClassPickerOpen} />}
            />

            <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(24px+env(safe-area-inset-bottom))] no-scrollbar">
                <section className="pt-2" aria-label="周数据切换">
                    <div className="flex items-center justify-between gap-3">
                        <button
                            type="button"
                            disabled={!olderWeek}
                            onClick={() => olderWeek && onWeekChange(olderWeek.id)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                            aria-label="查看上一周"
                        >
                            <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <div className="min-w-0 flex-1 text-center">
                            <h1 className="truncate text-[20px] font-bold tabular-nums text-[var(--tm-text-primary)]">{week.label}</h1>
                        </div>
                        <button
                            type="button"
                            disabled={!newerWeek}
                            onClick={() => newerWeek && onWeekChange(newerWeek.id)}
                            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-[scale,background-color,color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-role-headteacher-glass-surface)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                            aria-label="查看下一周"
                        >
                            <ChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </div>
                </section>

                <section className="headteacher-agent-glass mt-4 rounded-[var(--tm-radius-card)] px-4 py-4" aria-label="周数据概览">
                    <dl className="grid grid-cols-3 gap-3">
                        <div>
                            <dt className="text-[11px] text-[var(--tm-text-tertiary)]">本周总分</dt>
                            <dd className="mt-2 whitespace-nowrap text-[23px] font-bold tabular-nums text-[var(--tm-assistant-role-text)]">{formatScore(snapshot.finalScore)}<span className="ml-0.5 text-[10px] font-medium text-[var(--tm-text-tertiary)]">分</span></dd>
                        </div>
                        <div>
                            <dt className="text-[11px] text-[var(--tm-text-tertiary)]">年级排名</dt>
                            <dd className="mt-2 whitespace-nowrap text-[23px] font-bold tabular-nums text-[var(--tm-text-primary)]">第{week.gradeRank}<span className="ml-0.5 text-[10px] font-medium text-[var(--tm-text-tertiary)]">名</span></dd>
                        </div>
                        <div>
                            <dt className="text-[11px] text-[var(--tm-text-tertiary)]">学校排名</dt>
                            <dd className="mt-2 whitespace-nowrap text-[23px] font-bold tabular-nums text-[var(--tm-text-primary)]">第{week.schoolRank}<span className="ml-0.5 text-[10px] font-medium text-[var(--tm-text-tertiary)]">名</span></dd>
                        </div>
                    </dl>
                </section>

                <section className="mt-4" aria-labelledby="week-dimensions-title">
                    <div className="mb-2 px-1">
                        <h2 id="week-dimensions-title" className="text-[16px] font-bold text-[var(--tm-text-primary)]">分类数据</h2>
                    </div>
                    <div className="headteacher-agent-glass rounded-[var(--tm-radius-card)] pt-3">
                        <DimensionRankingTable
                            rankings={week.dimensionRankings}
                            selectedDimension={selectedRanking?.dimension}
                            onSelect={setSelectedDimension}
                        />
                    </div>
                </section>

                <section className="mt-4" aria-labelledby="week-records-title">
                    <div className="mb-2 px-1">
                        <h2 id="week-records-title" className="text-[16px] font-bold text-[var(--tm-text-primary)]">扣分明细</h2>
                    </div>
                    <div className="headteacher-agent-glass overflow-hidden rounded-[var(--tm-radius-card)]">
                        <DimensionTabs
                            rankings={week.dimensionRankings}
                            selectedDimension={selectedRanking?.dimension ?? ''}
                            onSelect={setSelectedDimension}
                            className="px-1"
                        />
                        <div className="px-4">
                            {selectedRecords.length > 0 ? (
                                <RecordDetailList records={selectedRecords} />
                            ) : (
                                <p className="py-12 text-center text-[13px] text-[var(--tm-text-tertiary)]">该周此指标暂无扣分</p>
                            )}
                        </div>
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
    showStudentEvaluation,
    showClassEvaluation,
    onOpenWeeklyActionAdvice,
    onOpenEvaluationReview,
}) => {
    const resolvedClassId = homeroomClasses.some(classInfo => classInfo.id === activeClassId)
        ? activeClassId
        : homeroomClasses[0]?.id ?? 'c_2025_4';
    const activeClass = homeroomClasses.find(classInfo => classInfo.id === resolvedClassId);
    const currentWeek = useMemo(() => getClassEvaluationWeek(DEFAULT_CLASS_EVALUATION_WEEK_ID), []);
    const snapshot = useMemo(() => getClassEvaluationSnapshot(resolvedClassId), [resolvedClassId]);
    const records = useMemo(() => getClassEvaluationRecords(resolvedClassId), [resolvedClassId]);
    const previousWeek = useMemo(() => {
        const week = CLASS_EVALUATION_WEEKS[1];
        if (!week) return undefined;
        const previousSnapshot = getClassEvaluationSnapshot(resolvedClassId, week.id);
        return {
            label: week.label,
            finalScore: previousSnapshot.finalScore,
            gradeRank: week.gradeRank,
            dimensionRankings: week.dimensionRankings,
        };
    }, [resolvedClassId]);
    const assistantIntro = useMemo(getAssistantIntro, []);
    const [typedIntro, setTypedIntro] = useState('');
    const [savedReports, setSavedReports] = useState<SavedClassEvaluationReport[]>(() => listSavedClassEvaluationReports());
    const [activeReport, setActiveReport] = useState<SavedClassEvaluationReport | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generationStepCount, setGenerationStepCount] = useState(1);
    const [historyOpen, setHistoryOpen] = useState(false);
    const [reportOrigin, setReportOrigin] = useState<'overview' | 'history'>('overview');
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const [overviewExpanded, setOverviewExpanded] = useState(false);
    const [detailInitialDimension, setDetailInitialDimension] = useState<string | null>(null);
    const [weekDetailOpen, setWeekDetailOpen] = useState(false);
    const [detailWeekId, setDetailWeekId] = useState(DEFAULT_CLASS_EVALUATION_WEEK_ID);
    const [showClassPicker, setShowClassPicker] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const latestAssistantRef = useRef<HTMLDivElement>(null);
    const generationTimersRef = useRef<number[]>([]);
    const replyTimerRef = useRef<number | null>(null);
    const previousClassIdRef = useRef(resolvedClassId);

    const clearGenerationTimers = () => {
        generationTimersRef.current.forEach(timer => window.clearTimeout(timer));
        generationTimersRef.current = [];
    };

    const closeReport = () => {
        clearGenerationTimers();
        setActiveReport(null);
        setIsGenerating(false);
        setGenerationStepCount(1);
    };

    const clearConversation = () => {
        if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
        replyTimerRef.current = null;
        setMessages([]);
        setDraft('');
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
        closeReport();
        clearConversation();
        setOverviewExpanded(false);
        setDetailInitialDimension(null);
        setReportOrigin('overview');
    }, [resolvedClassId]);

    useEffect(() => {
        const latestMessage = messages[messages.length - 1];
        if (latestMessage?.role === 'assistant') {
            const frame = window.requestAnimationFrame(() => {
                const scroller = scrollRef.current;
                const latestAssistant = latestAssistantRef.current;
                if (!scroller || !latestAssistant) return;
                scroller.scrollTo({
                    top: Math.max(0, latestAssistant.offsetTop - 8),
                    behavior: 'smooth',
                });
            });
            return () => window.cancelAnimationFrame(frame);
        }
        if (latestMessage?.role === 'user' || isReplying) {
            const frame = window.requestAnimationFrame(() => {
                scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
            });
            return () => window.cancelAnimationFrame(frame);
        }
        if (!activeReport && !isGenerating) return undefined;
        const frame = window.requestAnimationFrame(() => {
            scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [activeReport, isGenerating, isReplying, messages]);

    useEffect(() => () => {
        clearGenerationTimers();
        if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
    }, []);

    const currentSavedReport = useMemo(() => savedReports.find(report => (
        report.classId === resolvedClassId
        && report.weekId === currentWeek.id
        && report.dataSnapshotId === snapshot.id
        && report.promptVersion === CLASS_EVALUATION_WEEKLY_REPORT_PROMPT_VERSION
    )), [currentWeek.id, resolvedClassId, savedReports, snapshot.id]);

    const openWeeklyReport = () => {
        if (isGenerating) return;

        const cachedReport = findSavedClassEvaluationReport({
            classId: resolvedClassId,
            weekId: currentWeek.id,
            promptVersion: CLASS_EVALUATION_WEEKLY_REPORT_PROMPT_VERSION,
            dataSnapshotId: snapshot.id,
        });

        setReportOrigin('overview');
        if (cachedReport) {
            setActiveReport(cachedReport);
            setIsGenerating(false);
            return;
        }

        setActiveReport(null);
        setIsGenerating(true);
        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        setGenerationStepCount(reduceMotion ? REPORT_GENERATION_STEPS.length : 1);

        if (!reduceMotion) {
            REPORT_GENERATION_STEPS.slice(1).forEach((_, index) => {
                generationTimersRef.current.push(window.setTimeout(
                    () => setGenerationStepCount(index + 2),
                    (index + 1) * 680,
                ));
            });
        }

        const finishDelay = reduceMotion ? 600 : REPORT_GENERATION_STEPS.length * 680 + 260;
        generationTimersRef.current.push(window.setTimeout(() => {
            try {
                const reportContent = generateClassEvaluationWeeklyReport({
                    snapshot,
                    records,
                    gradeRank: currentWeek.gradeRank,
                    rankings: currentWeek.dimensionRankings,
                    previousWeek,
                });
                const report = saveClassEvaluationReport({
                    classId: resolvedClassId,
                    className: activeClass?.name ?? '当前班级',
                    weekId: currentWeek.id,
                    weekLabel: currentWeek.label,
                    dataRangeLabel: currentWeek.dataRangeLabel,
                    report: reportContent,
                    records,
                });
                setActiveReport(report);
                setSavedReports(listSavedClassEvaluationReports());
            } finally {
                setIsGenerating(false);
                setGenerationStepCount(1);
                generationTimersRef.current = [];
            }
        }, finishDelay));
    };

    const openHistoryReport = (report: SavedClassEvaluationReport) => {
        setReportOrigin('history');
        setActiveReport(report);
    };

    const submitQuestion = (rawQuestion: string) => {
        const question = rawQuestion.trim();
        if (!question || isReplying) return;

        const previousContext = [...messages]
            .reverse()
            .find(message => message.role === 'assistant' && message.answer)?.answer?.context;
        setMessages(current => [...current, {
            id: 'user-' + Date.now(),
            role: 'user',
            content: question,
        }]);
        setDraft('');
        setIsReplying(true);

        replyTimerRef.current = window.setTimeout(() => {
            const answer = askClassEvaluationQuestion({
                question,
                snapshot,
                records,
                gradeRank: currentWeek.gradeRank,
                rankings: currentWeek.dimensionRankings,
                previousWeek,
                previousContext,
            });
            setMessages(current => [...current, {
                id: 'assistant-' + Date.now(),
                role: 'assistant',
                answer,
            }]);
            setIsReplying(false);
            replyTimerRef.current = null;
        }, 620);
    };

    const handleHeaderBack = () => {
        if (activeReport || isGenerating) {
            closeReport();
            return;
        }
        if (historyOpen) {
            setHistoryOpen(false);
            return;
        }
        onBack();
    };

    const latestAnswer = [...messages]
        .reverse()
        .find(message => message.role === 'assistant' && message.answer)?.answer;
    const askedQuestions = new Set(messages
        .filter(message => message.role === 'user' && message.content)
        .map(message => message.content));
    const followUpQuestions = latestAnswer
        ? getFollowUpQuestions(latestAnswer.answerType).filter(question => !askedQuestions.has(question))
        : [];

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
                    initialDimension={detailInitialDimension ?? undefined}
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
                onBack={handleHeaderBack}
                backLabel={activeReport || isGenerating
                    ? (reportOrigin === 'history' ? '返回历史报告' : '返回概览')
                    : historyOpen ? '返回概览' : '返回'}
                surface="transparent"
                centerContent={(activeReport || isGenerating || historyOpen)
                    ? <AssistantClassSwitchButton activeClass={activeClass} onClick={() => setShowClassPicker(true)} />
                    : undefined}
            />

            {activeReport || isGenerating ? (
                <main ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 pt-3 no-scrollbar" aria-live="polite">
                    <section className="px-1" aria-labelledby="active-report-title">
                        <div className="flex items-start justify-between gap-3">
                            <h1 id="active-report-title" className="min-w-0 text-pretty text-[20px] font-bold leading-7 text-[var(--tm-text-primary)]">本周班级评比分析</h1>
                            {activeReport && reportOrigin === 'overview' && (
                                <button
                                    type="button"
                                    onClick={() => {
                                        closeReport();
                                        setHistoryOpen(true);
                                    }}
                                    className="flex min-h-11 shrink-0 items-center gap-1 px-1 text-[12px] font-semibold text-[var(--tm-assistant-role-text)] transition-[scale,color] duration-150 ease-out active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                                    aria-label="查看往期报告"
                                >
                                    <History className="h-4 w-4" strokeWidth={2} aria-hidden="true" />
                                    往期报告
                                </button>
                            )}
                        </div>
                        <p className="mt-1 text-[11px] tabular-nums text-[var(--tm-text-tertiary)]">
                            {activeReport?.weekLabel ?? currentWeek.label} · 数据截至 {activeReport?.dataRangeLabel ?? currentWeek.dataRangeLabel}
                            {activeReport && ` · 生成于 ${formatGeneratedAt(activeReport.generatedAt)}`}
                        </p>
                    </section>

                    {isGenerating ? (
                        <AgentGenerationProgress visibleStepCount={generationStepCount} />
                    ) : activeReport ? (
                        <div className="headteacher-agent-glass mt-4 rounded-[var(--tm-radius-card)] px-4 py-4">
                            <WeeklyReportContent report={activeReport.report} />
                        </div>
                    ) : null}
                </main>
            ) : historyOpen ? (
                <ClassEvaluationHistoryPage
                    reports={savedReports}
                    activeClassId={resolvedClassId}
                    onOpenReport={openHistoryReport}
                />
            ) : (
                <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto pb-5 no-scrollbar">
                    <section className="relative h-[148px] overflow-hidden px-5">
                        <div className="relative z-10 max-w-[59%] pt-3" aria-live="polite">
                            <p className="ai-assistant-typewriter-shine min-h-16 whitespace-pre-line text-pretty text-[17px] font-bold leading-7">
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

                    {(showClassEvaluation || showStudentEvaluation) && (
                        <ClassContextPanel
                            activeClass={activeClass}
                            canSwitchClass={homeroomClasses.length > 1}
                            showClassEvaluation={showClassEvaluation}
                            showStudentEvaluation={showStudentEvaluation}
                            week={currentWeek}
                            snapshot={snapshot}
                            expanded={overviewExpanded}
                            onClassPickerOpen={() => setShowClassPicker(true)}
                            onToggleExpanded={() => {
                                setOverviewExpanded(current => !current);
                            }}
                            onOpenDimensionDetails={(dimension) => {
                                setDetailWeekId(DEFAULT_CLASS_EVALUATION_WEEK_ID);
                                setDetailInitialDimension(dimension);
                                setWeekDetailOpen(true);
                            }}
                            onOpenDetails={() => {
                                setDetailWeekId(DEFAULT_CLASS_EVALUATION_WEEK_ID);
                                setDetailInitialDimension(
                                    currentWeek.dimensionRankings.find(item => item.recordCount > 0)?.dimension
                                    ?? currentWeek.dimensionRankings[0]?.dimension
                                    ?? null,
                                );
                                setWeekDetailOpen(true);
                            }}
                            onOpenWeekDetail={() => {
                                setDetailWeekId(DEFAULT_CLASS_EVALUATION_WEEK_ID);
                                setDetailInitialDimension(null);
                                setWeekDetailOpen(true);
                            }}
                            onStudentQuestionSelect={(action) => {
                                if (action === 'weekly_action_advice') onOpenWeeklyActionAdvice(resolvedClassId);
                                else onOpenEvaluationReview(resolvedClassId);
                            }}
                        />
                    )}

                    {messages.length > 0 && (
                        <ConversationThread
                            messages={messages}
                            replying={isReplying}
                            latestAssistantRef={latestAssistantRef}
                        />
                    )}
                </div>
            )}

            <footer className="relative z-30 shrink-0 bg-transparent">
                {showClassEvaluation && !activeReport && !isGenerating && !historyOpen && (
                    <QuestionComposer
                        draft={draft}
                        replying={isReplying}
                        suggestedQuestions={messages.length > 0 ? followUpQuestions : OVERVIEW_RECOMMENDED_QUESTIONS}
                        onDraftChange={setDraft}
                        onSubmit={submitQuestion}
                    />
                )}

                {(showStudentEvaluation || showClassEvaluation) && (
                    <p className="px-4 pb-[calc(6px+env(safe-area-inset-bottom))] pt-1 text-center text-[10px] leading-4 text-[var(--tm-text-disabled)]">内容由AI生成仅供参考。</p>
                )}
            </footer>

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
