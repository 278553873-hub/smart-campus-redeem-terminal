import React, { useEffect, useRef } from 'react';
import { flushSync } from 'react-dom';
import { Camera, Keyboard, Mic, Send } from 'lucide-react';
import MobileVoiceFeedback from './MobileVoiceFeedback';
import './MobileInputComposer.css';

export type VoicePressState = 'idle' | 'listening' | 'canceling';
export interface VoiceController {
    state: VoicePressState;
    levelRef: React.RefObject<number>;
    start: (y?: number) => void;
    move: (y: number) => void;
    release: () => void;
    cancel: () => void;
}
export interface MobileInputComposerProps {
    shadow?: 'subtle' | 'floating';
    mode: 'voice' | 'text';
    value: string;
    placeholder?: string;
    disabled?: boolean;
    voiceLabel?: string;
    sendLabel?: string;
    voice?: VoiceController;
    voiceState?: VoicePressState;
    onModeChange: (mode: 'voice' | 'text') => void;
    onChange: (value: string) => void;
    onSubmit: () => void;
    onCameraClick?: () => void;
    /** 旧演示入口适配；新页面统一传入 voice 控制器。 */
    onVoicePointerDown?: React.PointerEventHandler<HTMLButtonElement>;
    onVoiceKeyboardActivate?: () => void;
}

/** 三处共用的输入面板；只接收能力与输入回调，不处理评价、助理权限或提交业务。 */
export default function MobileInputComposer({
    shadow = 'subtle',
    mode, value, placeholder = '请输入', disabled = false, voiceLabel = '按住说话',
    sendLabel = '发送问题', voice, voiceState = 'idle', onModeChange, onChange, onSubmit,
    onCameraClick, onVoicePointerDown, onVoiceKeyboardActivate,
}: MobileInputComposerProps) {
    const anchor = useRef<HTMLDivElement>(null);
    const input = useRef<HTMLInputElement>(null);
    const pointer = useRef<number | null>(null);
    const keyboard = useRef(false);
    const composing = useRef(false);
    const latestVoice = useRef(voice);
    latestVoice.current = voice;
    const zeroLevel = useRef(0);
    const state = voice?.state ?? voiceState;
    const holding = state !== 'idle';
    const cancel = () => { pointer.current = null; keyboard.current = false; voice?.cancel(); };
    const switchMode = (next: 'voice' | 'text') => {
        cancel();
        flushSync(() => onModeChange(next));
        if (next === 'text') input.current?.focus({ preventScroll: true });
    };
    const submit = () => { if (!disabled && !composing.current && value.trim()) onSubmit(); };
    useEffect(() => {
        if (disabled) latestVoice.current?.cancel();
    }, [disabled]);
    useEffect(() => () => latestVoice.current?.cancel(), []);
    // 保持按住按钮挂载以保留指针捕获；语音反馈由手机公共浮层承载。

    return <div ref={anchor} className="relative">
        <MobileVoiceFeedback state={state} levelRef={voice?.levelRef ?? zeroLevel} anchorRef={anchor} />
        <div data-shadow={shadow} className={`mobile-input-composer relative grid h-[var(--tm-composer-height)] items-center rounded-[var(--tm-composer-panel-radius)] p-1 ${onCameraClick ? 'grid-cols-[44px_minmax(0,1fr)_44px]' : 'grid-cols-[minmax(0,1fr)_44px]'}`}
            style={mode === 'voice' && holding ? { opacity: 0 } : undefined}>
            {onCameraClick && <button type="button" disabled={disabled} onClick={onCameraClick} aria-label="拍照记录" className={`mobile-input-composer__icon ${mode === 'voice' ? 'absolute left-1 top-1 z-10' : ''}`}>
                <Camera className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
            </button>}
            {mode === 'voice' ? <button
                type="button" disabled={disabled} aria-label={holding ? state === 'canceling' ? '松开取消' : '正在聆听，松手发送，上移取消；Escape取消' : voiceLabel}
                className="absolute inset-1 flex h-11 min-w-0 touch-none select-none items-center justify-center rounded-[var(--tm-composer-control-radius)] px-14 text-[15px] font-semibold text-[var(--tm-text-primary)] disabled:text-[var(--tm-text-disabled)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-focus-ring)]"
                style={{ WebkitTouchCallout: 'none' }}
                onPointerDown={event => {
                    if (!event.isPrimary || event.button !== 0 || pointer.current !== null) return;
                    event.preventDefault();
                    pointer.current = event.pointerId;
                    event.currentTarget.setPointerCapture(event.pointerId);
                    if (voice) voice.start(event.clientY);
                    else onVoicePointerDown?.(event);
                }}
                onPointerMove={event => { if (pointer.current === event.pointerId) voice?.move(event.clientY); }}
                onPointerUp={event => {
                    if (pointer.current !== event.pointerId) return;
                    voice?.move(event.clientY);
                    pointer.current = null;
                    voice?.release();
                    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
                }}
                onPointerCancel={cancel}
                onLostPointerCapture={() => { if (pointer.current !== null) cancel(); }}
                onBlur={cancel}
                onContextMenu={event => event.preventDefault()}
                onKeyDown={event => {
                    if (event.key === 'Escape') { event.preventDefault(); cancel(); return; }
                    if ((event.key === 'Enter' || event.key === ' ') && !event.repeat) {
                        event.preventDefault(); keyboard.current = true;
                        if (voice) voice.start(); else onVoiceKeyboardActivate?.();
                    }
                }}
                onKeyUp={event => {
                    if ((event.key === 'Enter' || event.key === ' ') && keyboard.current) {
                        event.preventDefault(); keyboard.current = false; voice?.release();
                    }
                }}
            >{holding ? state === 'canceling' ? '松开取消' : '松手发送，上移取消' : voiceLabel}</button> : <input
                ref={input} autoFocus type="text" value={value} placeholder={placeholder} aria-label={placeholder}
                enterKeyHint="send" autoComplete="off" onChange={event => onChange(event.target.value)}
                onCompositionStart={() => { composing.current = true; }} onCompositionEnd={() => { composing.current = false; }}
                onKeyDown={event => {
                    if (event.key !== 'Enter' || event.nativeEvent.isComposing || event.keyCode === 229) return;
                    event.preventDefault(); submit();
                }}
                className="h-11 min-w-0 w-full border-0 bg-transparent px-3 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] caret-[var(--tm-brand-primary)] outline-none placeholder:text-[var(--tm-input-placeholder)]"
            />}
            {mode === 'voice' ? <button type="button" disabled={holding} onClick={() => switchMode('text')} aria-label="切换到文字输入" className="mobile-input-composer__icon absolute right-1 top-1 z-10">
                <Keyboard className="h-5 w-5" strokeWidth={2.2} aria-hidden="true" />
            </button> : value.trim() ? <button type="button" disabled={disabled} onClick={submit} aria-label={sendLabel} className="mobile-input-composer__icon mobile-input-composer__send">
                <Send className="h-5 w-5" strokeWidth={2.3} aria-hidden="true" />
            </button> : <button type="button" onClick={() => switchMode('voice')} aria-label="切换到语音输入" className="mobile-input-composer__icon">
                <Mic className="h-5 w-5" strokeWidth={2.3} aria-hidden="true" />
            </button>}
        </div>
    </div>;
}
