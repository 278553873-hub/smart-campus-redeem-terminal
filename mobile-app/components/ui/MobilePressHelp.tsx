import React, { useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Info } from 'lucide-react';

/** 按住查看的轻量说明；内容由业务层传入，浮层挂载到手机壳公共层。 */
export default function MobilePressHelp({ label, description }: { label: string; description: string }) {
    const id = useId();
    const buttonRef = useRef<HTMLButtonElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const pressOrigin = useRef<{ x: number; y: number } | null>(null);
    const [open, setOpen] = useState(false);
    const [root, setRoot] = useState<HTMLElement | null>(null);
    const [position, setPosition] = useState({ left: 0, top: 0, width: 0 });

    useLayoutEffect(() => {
        if (!open || !buttonRef.current) return;
        const overlay = document.getElementById('teacher-mobile-overlay-root');
        const target = overlay ?? document.body;
        const bounds = overlay?.getBoundingClientRect();
        // 手机壳预览可能缩放：将屏幕坐标换回浮层根节点的布局坐标。
        const scale = bounds && target.clientWidth ? bounds.width / target.clientWidth : 1;
        const width = Math.min(256, (overlay ? target.clientWidth : window.innerWidth) - 32);
        const anchor = buttonRef.current.getBoundingClientRect();
        const center = (anchor.left + anchor.width / 2 - (bounds?.left ?? 0)) / scale;
        const top = (anchor.top - (bounds?.top ?? 0)) / scale;
        setRoot(target);
        setPosition({ left: Math.max(16, Math.min(center - width / 2, (overlay ? target.clientWidth : window.innerWidth) - width - 16)), top, width });
    }, [open]);

    useLayoutEffect(() => {
        if (!open || !root || !tooltipRef.current || !buttonRef.current) return;
        const height = tooltipRef.current.offsetHeight;
        const overlay = root === document.body ? null : root;
        const bounds = overlay?.getBoundingClientRect();
        const scale = bounds && root.clientWidth ? bounds.width / root.clientWidth : 1;
        const anchor = buttonRef.current.getBoundingClientRect();
        const top = (anchor.top - (bounds?.top ?? 0)) / scale;
        const bottom = (anchor.bottom - (bounds?.top ?? 0)) / scale;
        const availableHeight = overlay ? root.clientHeight : window.innerHeight;
        setPosition(current => ({ ...current, top: Math.max(16, Math.min(top >= height + 24 ? top - height - 8 : bottom + 8, availableHeight - height - 16)) }));
    }, [open, root, position.width]);

    useEffect(() => {
        if (!open) return;
        const close = () => setOpen(false);
        const onKeyDown = (event: KeyboardEvent) => { if (event.key === 'Escape') close(); };
        window.addEventListener('scroll', close, true);
        window.addEventListener('resize', close);
        window.addEventListener('blur', close);
        document.addEventListener('keydown', onKeyDown);
        return () => {
            window.removeEventListener('scroll', close, true);
            window.removeEventListener('resize', close);
            window.removeEventListener('blur', close);
            document.removeEventListener('keydown', onKeyDown);
        };
    }, [open]);

    const closePress = () => { pressOrigin.current = null; setOpen(false); };

    return (
        <>
            <button
                ref={buttonRef}
                type="button"
                aria-label={`按住查看${label}说明`}
                aria-describedby={id}
                onPointerDown={event => {
                    if (event.button !== 0) return;
                    pressOrigin.current = { x: event.clientX, y: event.clientY };
                    event.currentTarget.setPointerCapture(event.pointerId);
                    setOpen(true);
                }}
                onPointerMove={event => {
                    const origin = pressOrigin.current;
                    if (origin && Math.hypot(event.clientX - origin.x, event.clientY - origin.y) > 10) closePress();
                }}
                onPointerUp={closePress}
                onPointerCancel={closePress}
                onLostPointerCapture={closePress}
                onPointerLeave={closePress}
                onFocus={event => { if (event.currentTarget.matches(':focus-visible')) setOpen(true); }}
                onBlur={closePress}
                onContextMenu={event => event.preventDefault()}
                className="inline-flex min-h-[var(--tm-size-touch)] min-w-[var(--tm-size-touch)] select-none items-center justify-end gap-1 whitespace-nowrap text-[var(--tm-text-secondary)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-[var(--tm-focus-ring)]"
                style={{ WebkitTouchCallout: 'none' }}
            >
                <span>{label}</span>
                <Info aria-hidden="true" className="h-3 w-3 shrink-0" />
            </button>
            <span id={id} className="sr-only">{description}</span>
            {open && root && createPortal(
                <div
                    ref={tooltipRef}
                    role="tooltip"
                    aria-hidden="true"
                    className="pointer-events-none z-[1300] rounded-[var(--tm-radius-control)] bg-[var(--tm-chart-tooltip)] px-3 py-2 text-left text-[length:var(--tm-font-size-meta)] font-medium leading-relaxed text-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-floating)]"
                    style={{ position: root === document.body ? 'fixed' : 'absolute', ...position }}
                >
                    {description}
                </div>, root,
            )}
        </>
    );
}
