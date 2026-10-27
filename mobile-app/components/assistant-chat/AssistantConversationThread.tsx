/** 两类助理共用的思考、增量回复与气泡呈现。 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { AssistantAnswerBreakdown, AssistantAiInsight } from '../../domain/assistantAnswerShape';
import { splitAssistantReply } from './assistantReplyChunks';
import { useAssistantBubbleSurface } from './useAssistantBubbleSurface';
import './assistantReply.css';
import MobileToast from '../ui/MobileToast';
import { Copy, RotateCcw } from 'lucide-react';
import { copyText } from '../../utils/copyText';

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

/** 保留原有四段自然语言结构，动画不介入业务回答。 */
export const getAssistantAnswerParagraphs = (answer: AssistantChatAnswer) => [
    answer.message,
    ...(answer.breakdown.length ? ['具体来看，' + answer.breakdown.map(item =>
        `${item.label}${item.detail ? `（${item.detail}）` : ''}${item.value ? `：${item.value}` : ''}`,
    ).join('；') + '。'] : []),
    ...(answer.analysis.length ? ['从分析结果看，' + answer.analysis.map(item => item.body).join('')] : []),
    ...(answer.suggestions.length ? ['接下来，' + answer.suggestions.map(item => item.body).join('')] : []),
];

const AssistantReplyBubble: React.FC<{
    answer?: AssistantChatAnswer;
    active: boolean;
    thinkingLabel: string;
    onComplete: () => void;
    onRegenerate?: () => void;
    busy?: boolean;
}> = ({ answer, active, thinkingLabel, onComplete, onRegenerate, busy }) => {
    const paragraphs = useMemo(() => answer ? getAssistantAnswerParagraphs(answer).map(splitAssistantReply) : [], [answer]);
    const chunks = useMemo(() => paragraphs.flat(), [paragraphs]);
    const [copyStatus, setCopyStatus] = useState('');
    useEffect(() => {
        setCopyStatus('');
    }, [answer, active, busy]);

    useEffect(() => {
        if (!copyStatus) return;
        const timer = window.setTimeout(() => setCopyStatus(''), 1800);
        return () => window.clearTimeout(timer);
    }, [copyStatus]);

    const [visible, setVisible] = useState(0);
    const [finished, setFinished] = useState(false);
    const { bubbleRef } = useAssistantBubbleSurface();
    const completeRef = useRef(onComplete);
    completeRef.current = onComplete;

    useEffect(() => {
        if (!answer || !active) return;
        const motion = window.matchMedia('(prefers-reduced-motion: reduce)');
        let timer: number;
        let count = 0;
        const complete = () => {
            setVisible(chunks.length);
            setFinished(true);
            completeRef.current();
        };
        const reveal = () => {
            count += 1;
            setVisible(count);
            if (count >= chunks.length) timer = window.setTimeout(complete, 160);
            else timer = window.setTimeout(reveal, /[。！？；\n]\s*$/.test(chunks[count - 1]) ? 100 : 53);
        };
        setVisible(0);
        setFinished(false);
        if (motion.matches || !chunks.length) complete();
        else timer = window.setTimeout(reveal, 40);
        const onMotionChange = () => { if (motion.matches) { window.clearTimeout(timer); complete(); } };
        motion.addEventListener('change', onMotionChange);
        return () => { window.clearTimeout(timer); motion.removeEventListener('change', onMotionChange); };
    }, [answer, active, chunks]);

    const streaming = active && !finished;
    const shown = streaming ? visible : chunks.length;
    let offset = 0;
    return (
        <div ref={bubbleRef} className="min-w-0 assistant-reply-bubble" data-thinking={!answer ? 'true' : undefined}>
            <div className="assistant-agent-glass assistant-reply-surface" aria-hidden="true" />
            <div className="assistant-reply-content px-4 pt-3.5 pb-2">
                {!answer ? (
                    <div className="assistant-thinking" role="status" aria-label={'正在思考，' + thinkingLabel}>
                        <span aria-hidden="true" /><span aria-hidden="true" /><span aria-hidden="true" />
                    </div>
                ) : (
                    <>
                        <div className="space-y-3 text-pretty text-[14px] tm-font-regular leading-6 text-[var(--tm-text-primary)]" aria-hidden={streaming || undefined}>
                            {paragraphs.map((paragraph, index) => {
                                const start = offset;
                                offset += paragraph.length;
                                const count = Math.max(0, Math.min(paragraph.length, shown - start));
                                if (!count && !(streaming && start === 0)) return null;
                                const cursorHere = streaming && shown >= start && shown <= offset
                                    && (shown > start || start === 0);
                                return (
                                    <p key={index} className="whitespace-pre-line">
                                        {paragraph.slice(0, count).map((chunk, chunkIndex) => (
                                            <React.Fragment key={chunkIndex}>
                                                {chunk.split('\n').map((line, lineIndex) => (
                                                    <React.Fragment key={lineIndex}>
                                                        {lineIndex > 0 && <br />}
                                                        {line && <span className={'assistant-reply-chunk' + (active ? ' assistant-reply-chunk-enter' : '')}>{line}</span>}
                                                    </React.Fragment>
                                                ))}
                                            </React.Fragment>
                                        ))}
                                        {cursorHere && <span className="assistant-reply-cursor" aria-hidden="true" />}
                                    </p>
                                );
                            })}
                        </div>
                        {!streaming && <div className="mt-2 flex flex-wrap items-center gap-0 border-t border-[var(--tm-border-subtle)] pt-[5px] text-[13px] text-[var(--tm-text-secondary)]">
                            <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2" aria-label="复制答案" title="复制答案" onClick={async () => {
                                const copied = await copyText(getAssistantAnswerParagraphs(answer).join('\n\n'));
                                setCopyStatus(copied ? '已复制' : '复制失败，请重试');
                            }}><span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--tm-text-primary)_4%,white)]"><Copy size={15} strokeWidth={1.75} aria-hidden="true" /></span></button>
                            {onRegenerate && <button type="button" className="inline-flex h-9 w-9 items-center justify-center rounded-lg focus-visible:outline focus-visible:outline-2 disabled:opacity-50" aria-label="重新生成答案" title="重新生成答案" disabled={busy} onClick={onRegenerate}><span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--tm-text-primary)_4%,white)]"><RotateCcw size={15} strokeWidth={1.75} aria-hidden="true" /></span></button>}
                            <MobileToast message={copyStatus} />
                        </div>}
                        {streaming && <span className="sr-only" role="status">正在回复</span>}
                    </>
                )}
            </div>
        </div>
    );
};

interface AssistantConversationThreadProps {
    messages: AssistantChatMessage[];
    replying: boolean;
    replyingLabel: string;
    ariaLabel: string;
    onRegenerate?: (messageId: string) => void;
    onReplyComplete?: () => void;
    latestAssistantRef?: React.RefObject<HTMLDivElement | null>;
}

const AssistantConversationThread: React.FC<AssistantConversationThreadProps> = ({
    messages, replying, replyingLabel, ariaLabel, onRegenerate, onReplyComplete = () => {}, latestAssistantRef,
}) => (
    <section className="mx-4 mt-5 space-y-4" aria-label={ariaLabel} aria-live="polite" aria-relevant="additions text">
        {messages.map((message, index) => (
            <div key={message.id} ref={message.role === 'assistant' && index === messages.length - 1 ? latestAssistantRef : undefined} className={'flex scroll-mt-2 ' + (message.role === 'user' ? 'justify-end' : 'items-start')}>
                {message.role === 'user' ? (
                    <div className="assistant-user-bubble max-w-[82%] bg-[var(--tm-assistant-role-primary)] px-4 py-2.5 text-[15px] font-medium leading-6 text-white [box-shadow:var(--tm-shadow-control)]">
                        {message.content}
                    </div>
                ) : (
                    <AssistantReplyBubble answer={message.answer} active={replying && index === messages.length - 1}
                        thinkingLabel={replyingLabel} onComplete={onReplyComplete}
                        busy={replying} onRegenerate={onRegenerate && index === messages.length - 1 ? () => onRegenerate(message.id) : undefined} />
                )}
            </div>
        ))}
    </section>
);

export default AssistantConversationThread;
