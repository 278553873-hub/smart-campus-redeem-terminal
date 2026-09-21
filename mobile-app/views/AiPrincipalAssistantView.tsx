import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Building2, CalendarRange, ChevronRight, ScanSearch } from 'lucide-react';
import { ASSETS } from '../assets/images';
import { getAssistantGreeting, useAssistantTypewriter } from '../hooks/useAssistantTypewriter';
import AssistantComposer from '../components/assistant-chat/AssistantComposer';
import AssistantConversationThread, { type AssistantChatMessage } from '../components/assistant-chat/AssistantConversationThread';
import AssistantSubpageHeader from '../components/AssistantSubpageHeader';
import MobileNoticeSheet from '../components/ui/MobileNoticeSheet';
import { getPrincipalAssistantSnapshot } from '../data/principalAssistant';
import {
    PRINCIPAL_ASSISTANT_FOLLOW_UP_QUESTIONS,
    PRINCIPAL_ASSISTANT_REPLYING_LABEL,
    PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS,
    askPrincipalAssistantQuestion,
    type PrincipalAssistantAnswer,
} from '../domain/principalAssistantConversation';
import {
    getPrincipalTermReportAvailability,
    type SchoolTermConfig,
} from '../domain/principalTermReport';

interface AiPrincipalAssistantViewProps {
    onBack: () => void;
    termConfig: SchoolTermConfig;
    hasTermReportTask: boolean;
    onOpenWeeklyReport: () => void;
    onOpenMonthlyReport: () => void;
    onOpenTermReport: () => void;
}

type AssistantAction = 'weeklyAdvice' | 'monthlyReview' | 'termReport';

interface AssistantOption {
    title: string;
    icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
    action: AssistantAction;
    tone: 'brand' | 'secondary' | 'reward';
}

const assistantOptions: AssistantOption[] = [
    {
        title: '本周管理建议',
        icon: Building2,
        action: 'weeklyAdvice',
        tone: 'brand',
    },
    {
        title: '上月学校复盘',
        icon: ScanSearch,
        action: 'monthlyReview',
        tone: 'secondary',
    },
    {
        title: '学期学校报告',
        icon: CalendarRange,
        action: 'termReport',
        tone: 'reward',
    },
];

const getAssistantMessage = () => `${getAssistantGreeting()}，\n我将为您提供学校数据分析和管理建议。`;

const optionToneClass: Record<AssistantOption['tone'], string> = {
    brand: 'bg-[var(--tm-role-principal-soft)] text-[var(--tm-assistant-role-text)]',
    secondary: 'bg-[var(--tm-role-principal-soft)] text-[var(--tm-assistant-role-text)]',
    reward: 'bg-[var(--tm-role-principal-accent-soft)] text-[var(--tm-role-principal-accent-strong)]',
};

interface AssistantNotice {
    title: string;
    message: string;
}

/** 对话消息沿用公共气泡组件，回答收窄为校长助理的学校口径回答。 */
interface ChatMessage extends AssistantChatMessage {
    answer?: PrincipalAssistantAnswer;
}

const AiPrincipalAssistantView: React.FC<AiPrincipalAssistantViewProps> = ({
    onBack,
    termConfig,
    hasTermReportTask,
    onOpenWeeklyReport,
    onOpenMonthlyReport,
    onOpenTermReport,
}) => {
    const assistantMessage = useMemo(getAssistantMessage, []);
    const typedMessage = useAssistantTypewriter(assistantMessage);
    const [notice, setNotice] = useState<AssistantNotice | null>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [draft, setDraft] = useState('');
    const [isReplying, setIsReplying] = useState(false);
    const snapshot = useMemo(() => getPrincipalAssistantSnapshot(), []);
    const scrollRef = useRef<HTMLDivElement>(null);
    const latestAssistantRef = useRef<HTMLDivElement>(null);
    const replyTimerRef = useRef<number | null>(null);

    useEffect(() => () => {
        if (replyTimerRef.current !== null) window.clearTimeout(replyTimerRef.current);
    }, []);

    useEffect(() => {
        const latestMessage = messages[messages.length - 1];
        if (!latestMessage) return undefined;

        const frame = window.requestAnimationFrame(() => {
            if (latestMessage.role === 'assistant' && latestAssistantRef.current) {
                const scroller = scrollRef.current;
                if (scroller) {
                    scroller.scrollTo({ top: Math.max(0, latestAssistantRef.current.offsetTop - 8), behavior: 'smooth' });
                    return;
                }
            }
            scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [isReplying, messages]);

    const handleOption = (item: AssistantOption) => {
        if (item.action === 'weeklyAdvice') {
            onOpenWeeklyReport();
            return;
        }

        if (item.action === 'monthlyReview') {
            onOpenMonthlyReport();
            return;
        }

        const availability = getPrincipalTermReportAvailability(termConfig);
        if (hasTermReportTask || availability.status === 'available') {
            onOpenTermReport();
            return;
        }

        setNotice(availability);
    };

    const submitQuestion = (rawQuestion: string) => {
        const question = rawQuestion.trim();
        if (!question || isReplying) return;

        setMessages(current => [...current, {
            id: 'user-' + Date.now(),
            role: 'user',
            content: question,
        }]);
        setDraft('');
        setIsReplying(true);

        replyTimerRef.current = window.setTimeout(() => {
            setMessages(current => [...current, {
                id: 'assistant-' + Date.now(),
                role: 'assistant',
                answer: askPrincipalAssistantQuestion({ question, snapshot }),
            }]);
            setIsReplying(false);
            replyTimerRef.current = null;
        }, 620);
    };

    const conversationActive = messages.length > 0;
    const latestAnswer = [...messages]
        .reverse()
        .find(message => message.role === 'assistant' && message.answer)?.answer;
    const suggestedQuestions = latestAnswer
        ? PRINCIPAL_ASSISTANT_FOLLOW_UP_QUESTIONS[latestAnswer.answerType]
        : PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS;

    return (
        <div className="ai-assistant-theme-principal relative flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent font-sans text-[var(--tm-text-primary)]">
            <AssistantSubpageHeader onBack={onBack} surface="transparent" />

            <div ref={scrollRef} data-view-scroll-root className="min-h-0 flex-1 overflow-y-auto pb-5 no-scrollbar">
                <section className="relative h-[148px] overflow-hidden px-5">
                    <div className="relative z-10 max-w-[59%] pt-3" aria-live="polite">
                        <p className="ai-assistant-typewriter-shine min-h-16 whitespace-pre-line text-pretty text-[17px] font-bold leading-7">
                            {typedMessage}
                            {typedMessage.length < assistantMessage.length && (
                                <span className="ml-0.5 inline-block h-5 w-[1.5px] translate-y-1 animate-pulse rounded-full bg-[var(--tm-assistant-role-primary)]" aria-hidden="true" />
                            )}
                        </p>
                    </div>
                    <img
                        src={ASSETS.MANAGEMENT.AI_PRINCIPAL_ASSISTANT_CHARACTER}
                        alt="AI校长助理形象"
                        className="pointer-events-none absolute -bottom-1 -right-1 h-[154px] w-[154px] select-none object-contain object-bottom drop-shadow-[0_20px_28px_var(--tm-role-principal-shadow)]"
                    />
                </section>

                <section className="assistant-agent-glass assistant-context-card relative z-10 mx-4 -mt-5 overflow-hidden rounded-[var(--tm-radius-card)] p-2" aria-label="校长助理分析能力">
                    <div className="mx-3 space-y-2 pb-2">
                        {assistantOptions.map(item => (
                            <button
                                key={item.title}
                                type="button"
                                onClick={() => handleOption(item)}
                                className="flex min-h-14 w-full items-center gap-2.5 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] pl-3 pr-3.5 text-left [box-shadow:var(--tm-shadow-control)] transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
                            >
                                <span className={'flex h-8 w-8 shrink-0 items-center justify-center rounded-[10px] ' + optionToneClass[item.tone]} aria-hidden="true">
                                    <item.icon className="h-[17px] w-[17px]" strokeWidth={2} />
                                </span>
                                <span className="min-w-0 flex-1 whitespace-nowrap text-[length:var(--tm-font-size-body)] font-medium leading-5 text-[var(--tm-text-primary)]">{item.title}</span>
                                <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" aria-hidden="true" />
                            </button>
                        ))}
                    </div>
                </section>

                {conversationActive && (
                    <AssistantConversationThread
                        messages={messages}
                        replying={isReplying}
                        replyingLabel={PRINCIPAL_ASSISTANT_REPLYING_LABEL}
                        ariaLabel="校长助理对话"
                        latestAssistantRef={latestAssistantRef}
                    />
                )}
            </div>

            <footer className="relative z-30 shrink-0 bg-transparent">
                <AssistantComposer
                    draft={draft}
                    replying={isReplying}
                    suggestedQuestions={suggestedQuestions}
                    placeholder="输入学校管理问题"
                    onDraftChange={setDraft}
                    onSubmit={submitQuestion}
                />
                <p className="px-4 pb-[calc(6px+env(safe-area-inset-bottom))] pt-1 text-center text-[10px] leading-4 text-[var(--tm-text-disabled)]">内容由AI生成仅供参考。</p>
            </footer>

            <MobileNoticeSheet
                open={Boolean(notice)}
                title={notice?.title ?? ''}
                message={notice?.message ?? ''}
                onDismiss={() => setNotice(null)}
            />
        </div>
    );
};

export default AiPrincipalAssistantView;
