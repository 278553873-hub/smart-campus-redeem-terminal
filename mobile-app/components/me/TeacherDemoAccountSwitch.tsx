import React, { useCallback, useEffect, useId, useRef, useState } from 'react';
import { DEMO_TEACHER_ACCOUNTS, type DemoTeacherAccount } from '../../../shared/demoTeacherAccounts';
import MobileBottomSheet from '../ui/MobileBottomSheet';
import { mobileSheetActionClass } from '../ui/mobileSheetActionStyles';

interface Props {
    children: React.ReactNode;
    className: string;
    loginPhone?: string;
    onSwitch: (phone: string) => string | undefined;
    onPreviewChange?: (account: DemoTeacherAccount | null) => void;
}

const LONG_PRESS_DELAY = 1000;
const PRESS_MOVEMENT_LIMIT = 10;
const PHONE_LENGTH = 11;
const [alternatePreviewAccount, , defaultPreviewAccount] = DEMO_TEACHER_ACCOUNTS;

export default function TeacherDemoAccountSwitch({ children, className, loginPhone, onSwitch, onPreviewChange }: Props) {
    const phoneId = useId();
    const press = useRef<{ x: number; y: number; timer: number } | null>(null);
    const [open, setOpen] = useState(false);
    const [phone, setPhone] = useState('');
    const [error, setError] = useState<string>();
    const previewAccount = loginPhone === defaultPreviewAccount.phone ? alternatePreviewAccount : defaultPreviewAccount;

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
            window.removeEventListener('scroll', cancelPress, true);
            window.removeEventListener('blur', cancelPress);
        };
    }, [cancelPress]);

    useEffect(() => {
        if (!open || !onPreviewChange) return;
        onPreviewChange(previewAccount);
        return () => onPreviewChange(null);
    }, [open, onPreviewChange, previewAccount]);

    const openSheet = () => {
        cancelPress();
        setPhone('');
        setError(undefined);
        setOpen(true);
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
                onClose={() => setOpen(false)}
                flushContentBottom
                footerSafeArea="device"
                footer={(
                    <button
                        type="submit"
                        form={`${phoneId}-form`}
                        disabled={phone.length !== PHONE_LENGTH}
                        className={`${mobileSheetActionClass} w-full bg-[var(--tm-brand-primary)] font-semibold text-[var(--tm-text-inverse)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)]`}
                    >
                        切换并登录
                    </button>
                )}
            >
                <form id={`${phoneId}-form`} className="pt-[var(--tm-sheet-content-gap)]" onSubmit={event => { event.preventDefault(); setError(onSwitch(phone)); }}>
                    <label htmlFor={phoneId} className="sr-only">教师手机号</label>
                    <input
                        id={phoneId}
                        value={phone}
                        type="tel"
                        inputMode="numeric"
                        autoComplete="off"
                        placeholder="请输入 11 位教师手机号"
                        aria-invalid={Boolean(error)}
                        aria-describedby={error ? `${phoneId}-error` : undefined}
                        onChange={event => { setPhone(event.target.value.replace(/\D/g, '').slice(0, PHONE_LENGTH)); setError(undefined); }}
                        className={`h-[var(--tm-form-action-height)] w-full rounded-[var(--tm-form-control-radius)] border bg-[var(--tm-input-bg)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] ${error ? 'border-[var(--tm-status-negative-strong)]' : 'border-[var(--tm-input-border)]'}`}
                    />
                    {error && <p id={`${phoneId}-error`} role="alert" className="mt-[var(--tm-space-2)] text-[length:var(--tm-font-size-meta)] text-[var(--tm-status-negative-strong)]">{error}</p>}
                </form>
            </MobileBottomSheet>
        </>
    );
}
