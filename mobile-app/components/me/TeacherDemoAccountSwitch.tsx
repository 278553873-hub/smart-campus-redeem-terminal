import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { DemoTeacherSwitchHandler, TeacherSupportDialogPreview } from '../../data/teacherLoginAccounts';
import MobileBottomSheet from '../ui/MobileBottomSheet';
import { mobileSheetActionClass } from '../ui/mobileSheetActionStyles';
import { PasswordRevealButton } from '../ui/PasswordRevealButton';

interface Props {
    children: React.ReactNode;
    className: string;
    onSwitch: DemoTeacherSwitchHandler;
    onOpenChange?: (open: boolean) => void;
    dialogPreview?: TeacherSupportDialogPreview;
}

const LONG_PRESS_DELAY = 1000;
const PRESS_MOVEMENT_LIMIT = 10;
const PHONE_LENGTH = 11;
const inputClass = 'h-[var(--tm-form-action-height)] w-full rounded-[var(--tm-form-control-radius)] border bg-[var(--tm-input-bg)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)]';
const fieldBorder = (invalid: boolean) => invalid ? 'border-[var(--tm-status-negative-strong)]' : 'border-[var(--tm-input-border)]';

export default function TeacherDemoAccountSwitch({ children, className, onSwitch, onOpenChange, dialogPreview }: Props) {
    const phoneId = useId();
    const press = useRef<{ x: number; y: number; timer: number } | null>(null);
    const [open, setOpen] = useState(false);
    const [phone, setPhone] = useState('');
    const [needsCode, setNeedsCode] = useState(false);
    const [code, setCode] = useState('');
    const [showCode, setShowCode] = useState(false);
    const [error, setError] = useState<string>();
    const [submitting, setSubmitting] = useState(false);
    const request = useRef<AbortController | null>(null);

    const cancelPress = useCallback(() => {
        if (!press.current) return;
        window.clearTimeout(press.current.timer);
        press.current = null;
    }, []);

    useEffect(() => {
        window.addEventListener('scroll', cancelPress, true);
        window.addEventListener('blur', cancelPress);
        return () => {
            cancelPress();
            request.current?.abort();
            window.removeEventListener('scroll', cancelPress, true);
            window.removeEventListener('blur', cancelPress);
        };
    }, [cancelPress]);

    useEffect(() => {
        if (!open || !onOpenChange) return;
        onOpenChange(true);
        return () => onOpenChange(false);
    }, [open, onOpenChange]);

    useEffect(() => {
        request.current?.abort();
        request.current = null;
        setSubmitting(false);
        setNeedsCode(false);
        setCode('');
        setShowCode(false);
        setError(undefined);
    }, [dialogPreview?.registered, dialogPreview?.codeEntered]);

    const openSheet = () => {
        cancelPress();
        setPhone('');
        setNeedsCode(false);
        setCode('');
        setShowCode(false);
        setError(undefined);
        setOpen(true);
    };

    const closeSheet = () => {
        request.current?.abort();
        request.current = null;
        setSubmitting(false);
        setCode('');
        setOpen(false);
    };

    const submit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (request.current || phone.length !== PHONE_LENGTH || (needsCode && !code)) return;
        const controller = new AbortController();
        request.current = controller;
        setError(undefined);
        setSubmitting(true);
        try {
            const result = await onSwitch(phone, needsCode ? code : undefined, controller.signal, dialogPreview);
            if (controller.signal.aborted) return;
            if ('error' in result) setError(result.error);
            else if ('needsSecurityCode' in result) setNeedsCode(true);
            else closeSheet();
        } finally {
            if (request.current === controller) {
                request.current = null;
                setSubmitting(false);
            }
        }
    };

    return (
        <>
            <button
                type="button"
                aria-haspopup="dialog"
                aria-expanded={open}
                aria-describedby={`${phoneId}-trigger-help`}
                className={`${className} select-none text-left [-webkit-tap-highlight-color:transparent] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-focus-ring)]`}
                style={{ WebkitTouchCallout: 'none' }}
                onPointerDown={event => {
                    if (open || !event.isPrimary || event.button !== 0) return;
                    cancelPress();
                    press.current = {
                        x: event.clientX,
                        y: event.clientY,
                        timer: window.setTimeout(openSheet, LONG_PRESS_DELAY),
                    };
                }}
                onPointerMove={event => {
                    const origin = press.current;
                    if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > PRESS_MOVEMENT_LIMIT) cancelPress();
                }}
                onPointerUp={cancelPress}
                onPointerCancel={cancelPress}
                onPointerLeave={cancelPress}
                onBlur={cancelPress}
                onContextMenu={event => event.preventDefault()}
                onClick={event => { if (!open && event.detail === 0) openSheet(); }}
            >
                {children}
            </button>
            <span id={`${phoneId}-trigger-help`} className="sr-only">打开问题排查</span>
            <MobileBottomSheet
                open={open}
                title="问题排查"
                onClose={closeSheet}
                flushContentBottom
                footerSafeArea="device"
                footer={(
                    <button
                        type="submit"
                        form={`${phoneId}-form`}
                        disabled={submitting || phone.length !== PHONE_LENGTH || (needsCode && !code)}
                        className={`${mobileSheetActionClass} w-full bg-[var(--tm-brand-primary)] font-semibold text-[var(--tm-text-inverse)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)]`}
                    >
                        {submitting ? '正在校验…' : needsCode ? '验证并登录' : '切换并登录'}
                    </button>
                )}
            >
                <form id={`${phoneId}-form`} className="pt-[var(--tm-sheet-content-gap)]" onSubmit={submit}>
                    <label htmlFor={phoneId} className="sr-only">教师手机号</label>
                    <input
                        id={phoneId}
                        value={phone}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="请输入 11 位教师手机号"
                        readOnly={submitting}
                        aria-invalid={Boolean(error && !needsCode)}
                        aria-describedby={error && !needsCode ? `${phoneId}-error` : undefined}
                        onChange={event => {
                            setPhone(event.target.value.replace(/\D/g, '').slice(0, PHONE_LENGTH));
                            setNeedsCode(false);
                            setCode('');
                            setShowCode(false);
                            setError(undefined);
                        }}
                        className={`${inputClass} ${fieldBorder(Boolean(error && !needsCode))}`}
                    />
                    <div aria-live="polite">
                        {needsCode && (
                            <div className="mt-[var(--tm-space-4)]">
                                <label htmlFor={`${phoneId}-security`} className="mb-2 block text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">安全码</label>
                                <div className="relative">
                                    <input id={`${phoneId}-security`} type={showCode ? 'text' : 'password'} value={code} autoComplete="off"
                                        autoCapitalize="none" spellCheck={false} readOnly={submitting} placeholder="请输入安全码" aria-invalid={Boolean(error)}
                                        aria-describedby={error ? `${phoneId}-error` : `${phoneId}-security-help`}
                                        className={`${inputClass} ${fieldBorder(Boolean(error))} pr-12`}
                                        onChange={event => { setCode(event.target.value); setError(undefined); }} />
                                    <PasswordRevealButton
                                        visible={showCode}
                                        onToggle={() => setShowCode(visible => !visible)}
                                        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-[var(--tm-form-control-radius)] text-[var(--tm-text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-focus-ring)]"
                                        revealLabel="显示安全码"
                                        hideLabel="隐藏安全码"
                                        size={18}
                                    />
                                </div>
                                {!error && <p id={`${phoneId}-security-help`} className="mt-2 text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">首次使用问题排查需验证安全码。</p>}
                            </div>
                        )}
                    </div>
                    {error && <p id={`${phoneId}-error`} role="alert" className="mt-[var(--tm-space-2)] text-[length:var(--tm-font-size-meta)] text-[var(--tm-status-negative-strong)]">{error}</p>}
                </form>
            </MobileBottomSheet>
        </>
    );
}
