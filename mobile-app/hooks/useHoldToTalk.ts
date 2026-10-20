import { useEffect, useRef, useState } from 'react';
import { createVoicePressSession } from './voicePressSession';
import { startMicrophoneLevel } from '../services/microphoneLevel';

/** 按住与识别分离：识别提前结束也必须等松手，取消后丢弃迟到结果。 */
type VoiceSession = Pick<ReturnType<typeof createVoicePressSession>, 'start' | 'release' | 'cancel'>;
export interface VoiceSessionCallbacks {
    submit: (text: string) => void;
    fail: () => void;
    finish: () => void;
}

export function useHoldToTalk(onSubmit: (text: string) => void, onUnavailable: () => void, options?: {
    createSession: (callbacks: VoiceSessionCallbacks) => VoiceSession;
}) {
    const [state, setState] = useState<'idle' | 'listening' | 'canceling'>('idle');
    const session = useRef<VoiceSession | null>(null);
    const startY = useRef(0);
    const canceling = useRef(false);
    const pressing = useRef(false);
    const levelRef = useRef(0);
    const stopMeter = useRef<(() => void) | null>(null);
    const clearMeter = () => {
        stopMeter.current?.();
        stopMeter.current = null;
        levelRef.current = 0;
    };
    const callbacks = useRef({ onSubmit, onUnavailable });
    callbacks.current = { onSubmit, onUnavailable };

    const cancel = () => {
        clearMeter();
        pressing.current = false;
        session.current?.cancel();
        session.current = null;
        canceling.current = false;
        setState('idle');
    };
    const start = (y = 0) => {
        if (session.current) return;
        const Constructor = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
        if (!options && !Constructor) { callbacks.current.onUnavailable(); return; }
        startY.current = y;
        pressing.current = true;
        canceling.current = false;
        const sessionCallbacks: VoiceSessionCallbacks = {
            submit: text => callbacks.current.onSubmit(text),
            fail: () => callbacks.current.onUnavailable(),
            finish: () => {
                if (session.current === current) {
                    clearMeter();
                    pressing.current = false;
                    session.current = null;
                    setState('idle');
                }
            },
        };
        const current = options ? options.createSession(sessionCallbacks) : createVoicePressSession(new Constructor(), sessionCallbacks);
        session.current = current;
        setState('listening');
        // 音量采集独立于识别/评价会话，演示适配器同样使用真实麦克风。
        stopMeter.current = startMicrophoneLevel(level => { levelRef.current = level; });
        current.start();
    };
    const move = (y: number) => {
        if (!session.current || !pressing.current) return;
        canceling.current = startY.current - y >= 90;
        setState(canceling.current ? 'canceling' : 'listening');
    };
    const release = () => {
        clearMeter();
        pressing.current = false;
        if (canceling.current) { cancel(); return; }
        setState('idle');
        session.current?.release();
    };

    useEffect(() => {
        const onBlur = () => cancel();
        const onVisibility = () => { if (document.hidden) cancel(); };
        window.addEventListener('blur', onBlur);
        document.addEventListener('visibilitychange', onVisibility);
        return () => {
            clearMeter();
            window.removeEventListener('blur', onBlur);
            document.removeEventListener('visibilitychange', onVisibility);
            session.current?.cancel();
            session.current = null;
        };
    }, []);

    return { state, levelRef, start, move, release, cancel };
}
