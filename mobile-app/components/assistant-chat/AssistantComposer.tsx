import React, { useEffect, useState } from 'react';
import AssistantSuggestedQuestions from './AssistantSuggestedQuestions';
import MobileInputComposer from '../ui/MobileInputComposer';
import { useHoldToTalk } from '../../hooks/useHoldToTalk';

interface AssistantComposerProps {
    sessionKey?: string;
    draft: string;
    replying: boolean;
    suggestedQuestions: readonly string[];
    placeholder: string;
    onDraftChange: (value: string) => void;
    onSubmit: (question: string) => void;
}

/** 助理仅组合建议问题和业务回调，输入与手势由公共组件提供。 */
export default function AssistantComposer({ sessionKey, draft, replying, suggestedQuestions, placeholder, onDraftChange, onSubmit }: AssistantComposerProps) {
    const [mode, setMode] = useState<'voice' | 'text'>('voice');
    const [unavailable, setUnavailable] = useState(false);
    const voice = useHoldToTalk(question => {
        onDraftChange(question);
        onSubmit(question);
    }, () => { setUnavailable(true); setMode('text'); });

    useEffect(() => { voice.cancel(); }, [sessionKey]);

    return <div className="shrink-0 bg-transparent px-3 pt-1">
        {suggestedQuestions.length > 0 && <AssistantSuggestedQuestions
            shape="subtle" questions={suggestedQuestions} disabled={replying} onSelect={onSubmit}
        />}
        <MobileInputComposer
            shadow="subtle"
            mode={mode} value={draft} disabled={replying} voice={voice}
            placeholder={unavailable ? '当前环境暂不支持语音，请输入文字' : placeholder}
            onModeChange={next => { setUnavailable(false); setMode(next); }}
            onChange={onDraftChange} onSubmit={() => onSubmit(draft)}
        />
    </div>;
}
