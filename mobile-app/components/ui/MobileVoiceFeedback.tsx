import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import './MobileVoiceFeedback.css';

/** 纯展示浮层；不截获按住按钮的指针，也不承载识别业务。 */
export default function MobileVoiceFeedback({ state, levelRef, anchorRef }: {
    state: 'idle' | 'listening' | 'canceling';
    levelRef: React.RefObject<number>;
    anchorRef: React.RefObject<HTMLElement | null>;
}) {
    const [root, setRoot] = useState<HTMLElement | null>(null);
    const barsRef = useRef<(HTMLElement | null)[]>([]);
    const lastActiveState = useRef(state);
    if (state !== 'idle') lastActiveState.current = state;
    const active = state !== 'idle';
    useLayoutEffect(() => {
        // 使用输入框所在手机的浮层，避免多个预览或挂载时序导致相对整个窗口定位。
        let parent = anchorRef.current?.parentElement;
        while (parent && parent !== document.body) {
            const overlay = Array.from(parent.children).find(child => child.id === 'teacher-mobile-overlay-root');
            if (overlay) { setRoot(overlay as HTMLElement); return; }
            parent = parent.parentElement;
        }
        setRoot(document.body);
    }, [active, anchorRef]);
    useEffect(() => {
        barsRef.current.forEach(bar => { if (bar) bar.style.transform = 'scaleY(1)'; });
        if (!active || !root) return;
        const history = Array<number>(24).fill(0);
        let lastSample = -Infinity;
        let frame = 0;
        const draw = (time: number) => {
            if (time - lastSample >= 32) {
                lastSample = time;
                history.unshift(levelRef.current);
                history.pop();
                barsRef.current.forEach((bar, index) => {
                    const distance = Math.floor(Math.abs(index - 23.5));
                    const envelope = 1 - distance / 30;
                    // 适度提升轻声响应与显示幅度，零音量仍保持原来的短线。
                    const amplitude = Math.pow(history[distance], 0.8);
                    if (bar) bar.style.transform = `scaleY(${1 + amplitude * envelope * 8})`;
                });
            }
            frame = requestAnimationFrame(draw);
        };
        frame = requestAnimationFrame(draw);
        return () => cancelAnimationFrame(frame);
    }, [active, root, levelRef]);
    if (!root) return null;
    return createPortal(
        <div className="mobile-voice-feedback" data-active={active} data-canceling={lastActiveState.current === 'canceling'} style={{ position: root === document.body ? 'fixed' : 'absolute' }}>
            <div className="mobile-voice-feedback__glow" aria-hidden="true">
                <div className="mobile-voice-feedback__blue" />
                <div className="mobile-voice-feedback__red" />
            </div>
            <div className="mobile-voice-feedback__content">
                <p role="status" aria-live="polite">{active ? state === 'canceling' ? '松开取消' : '松手发送，上移取消' : ''}</p>
                <div className="mobile-voice-feedback__wave" aria-hidden="true">
                    {Array.from({ length: 48 }, (_, index) => <i key={index} ref={element => { barsRef.current[index] = element; }} style={{ opacity: Math.min(1, (Math.min(index, 47 - index) + 1) / 6) }} />)}
                </div>
            </div>
        </div>, root,
    );
}
