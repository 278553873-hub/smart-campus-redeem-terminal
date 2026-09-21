/**
 * 助理对话的输入控件：语音与文字两种模式
 *
 * 语音模式按住说话、松开发送；文字模式支持回车发送与自动增高；
 * 两种模式可互相切换，环境不支持语音识别时回落到文字输入并给出提示。
 */
import React, { useEffect, useRef, useState } from 'react';
import { Keyboard, Mic, Send } from 'lucide-react';
import AutoResizeTextarea from '../ui/AutoResizeTextarea';
import AssistantSuggestedQuestions from './AssistantSuggestedQuestions';

type ComposerMode = 'voice' | 'text';
type VoiceState = 'idle' | 'listening' | 'error';

interface AssistantComposerProps {
    draft: string;
    replying: boolean;
    suggestedQuestions: readonly string[];
    placeholder: string;
    onDraftChange: (value: string) => void;
    onSubmit: (question: string) => void;
}

const AssistantComposer: React.FC<AssistantComposerProps> = ({
    draft,
    replying,
    suggestedQuestions,
    placeholder,
    onDraftChange,
    onSubmit,
}) => {
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
                <AssistantSuggestedQuestions
                    questions={suggestedQuestions}
                    disabled={replying}
                    onSelect={onSubmit}
                />
            )}
            {mode === 'voice' ? (
                <div className="assistant-agent-glass relative h-[52px] overflow-hidden rounded-full p-1">
                    <button
                        type="button"
                        onClick={() => setMode('text')}
                        className="absolute left-1 top-1 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tm-bg-surface-glass)] text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)]"
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
                        className={'absolute inset-1 flex select-none items-center justify-center rounded-full px-14 text-[15px] font-semibold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-assistant-role-primary)] ' + (voiceState === 'listening' ? 'bg-[var(--tm-assistant-role-primary)] text-white' : 'text-[var(--tm-text-primary)]')}
                        aria-label={voiceState === 'listening' ? '正在聆听，松开发送' : '按住说话'}
                    >
                        {voiceState === 'listening' ? '正在聆听，松开发送' : '按住说话'}
                    </button>
                </div>
            ) : (
                <div className="assistant-agent-glass grid min-h-[52px] grid-cols-[44px_minmax(0,1fr)_44px] items-end overflow-hidden rounded-[26px] p-1">
                    <button
                        type="button"
                        onClick={() => {
                            setVoiceState('idle');
                            setMode('voice');
                        }}
                        className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-assistant-role-text)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)]"
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
                        placeholder={voiceFallback ? '当前环境暂不支持语音，请输入文字' : placeholder}
                        aria-label={placeholder}
                        className="w-full resize-none bg-transparent px-2.5 py-2.5 text-[14px] font-medium leading-6 text-[var(--tm-text-primary)] outline-none placeholder:text-[var(--tm-text-disabled)]"
                    />
                    <button
                        type="submit"
                        disabled={!draft.trim() || replying}
                        className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--tm-assistant-role-primary)] text-white disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-assistant-role-primary)] focus-visible:ring-offset-2"
                        aria-label="发送问题"
                    >
                        <Send className="h-5 w-5" strokeWidth={2.3} aria-hidden="true" />
                    </button>
                </div>
            )}
        </form>
    );
};

export default AssistantComposer;
