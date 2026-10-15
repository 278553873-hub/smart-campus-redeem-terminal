import { useEffect, useRef, useState, type PointerEvent } from 'react';
import type { TeacherVoicePressState } from './TeacherRecordInputBar';

/** 仅负责持按、滑动取消与事件清理；语音识别和保存由业务提供。 */
export default function useHoldToSpeak(onSend: () => void, enabled: boolean, sessionKey: string) {
    const [voicePressState, setVoicePressState] = useState<TeacherVoicePressState>('idle');
    const sendRef = useRef(onSend);
    sendRef.current = onSend;
    const cancelRef = useRef<(() => void) | null>(null);

    useEffect(() => {
        setVoicePressState('idle');
        return () => cancelRef.current?.();
    }, [enabled, sessionKey]);

    const onVoicePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
        if (!enabled || !event.isPrimary || event.button !== 0 || cancelRef.current) return;
        event.preventDefault();
        const pointerId = event.pointerId;
        const startY = event.clientY;
        let canceled = false;
        let active = true;
        setVoicePressState('listening');
        const finish = (forceCancel = false) => {
            if (!active) return;
            active = false;
            window.removeEventListener('pointermove', move);
            window.removeEventListener('pointerup', up);
            window.removeEventListener('pointercancel', cancel);
            window.removeEventListener('blur', blur);
            document.removeEventListener('visibilitychange', visibility);
            cancelRef.current = null;
            setVoicePressState('idle');
            if (!forceCancel && !canceled) sendRef.current();
        };
        const move = (next: globalThis.PointerEvent) => {
            if (next.pointerId !== pointerId) return;
            next.preventDefault();
            const nextCanceled = startY - next.clientY > 90;
            if (nextCanceled !== canceled) {
                canceled = nextCanceled;
                setVoicePressState(canceled ? 'canceling' : 'listening');
            }
        };
        const up = (next: globalThis.PointerEvent) => { if (next.pointerId === pointerId) finish(); };
        const cancel = (next: globalThis.PointerEvent) => { if (next.pointerId === pointerId) finish(true); };
        const blur = () => finish(true);
        const visibility = () => { if (document.hidden) finish(true); };
        cancelRef.current = blur;
        window.addEventListener('pointermove', move, { passive: false });
        window.addEventListener('pointerup', up);
        window.addEventListener('pointercancel', cancel);
        window.addEventListener('blur', blur);
        document.addEventListener('visibilitychange', visibility);
    };
    return { voicePressState, onVoicePointerDown };
}
