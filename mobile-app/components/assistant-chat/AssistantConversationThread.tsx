/**
 * 助理对话气泡流与回答呈现结构
 *
 * 回答统一转换为「结论 + 具体来看 + 从分析结果看 + 接下来」四个自然段，
 * 班主任助理的班级评比、学生评价回答与校长助理的学校回答共用同一套呈现。
 */
import React from 'react';
import { LoaderCircle } from 'lucide-react';
import type { AssistantAnswerBreakdown, AssistantAiInsight } from '../../domain/assistantAnswerShape';

/** 气泡渲染需要的最小回答结构，三类助理回答都满足。 */
export interface AssistantChatAnswer {
    answerType: string;
    message: string;
    breakdown: AssistantAnswerBreakdown[];
    analysis: AssistantAiInsight[];
    suggestions: AssistantAiInsight[];
}

export interface AssistantChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content?: string;
    answer?: AssistantChatAnswer;
}

const ConversationAnswerContent: React.FC<{
    answer: AssistantChatAnswer;
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

interface AssistantConversationThreadProps {
    messages: AssistantChatMessage[];
    replying: boolean;
    replyingLabel: string;
    ariaLabel: string;
    latestAssistantRef: React.RefObject<HTMLDivElement | null>;
}

const AssistantConversationThread: React.FC<AssistantConversationThreadProps> = ({
    messages,
    replying,
    replyingLabel,
    ariaLabel,
    latestAssistantRef,
}) => (
    <section className="mx-4 mt-5 space-y-4" aria-label={ariaLabel} aria-live="polite">
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
                    <div className="assistant-agent-glass min-w-0 flex-1 rounded-[var(--tm-radius-card)] rounded-tl-[6px] px-4 py-3.5">
                        <ConversationAnswerContent answer={message.answer} />
                    </div>
                ) : null}
            </div>
        ))}

        {replying && (
            <div className="assistant-agent-glass flex h-11 w-fit items-center gap-2 rounded-[var(--tm-radius-card)] rounded-tl-[6px] px-4 text-[13px] font-medium text-[var(--tm-text-secondary)]" role="status">
                <LoaderCircle className="h-4 w-4 animate-spin text-[var(--tm-assistant-role-primary)]" aria-hidden="true" />
                {replyingLabel}
            </div>
        )}
    </section>
);

export default AssistantConversationThread;
