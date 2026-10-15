import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SimulatedMiniProgramChrome from '../../../components/SimulatedMiniProgramChrome';

interface MobileFullScreenPageProps {
  open: boolean;
  title: string;
  onBack: () => void;
  children: React.ReactNode;
  appearance?: 'light' | 'dark';
}

/** 在手机内容区打开完整页面，保留调用页草稿，不使用弹窗遮罩和底部抽屉动画。 */
const MobileFullScreenPage: React.FC<MobileFullScreenPageProps> = ({ open, title, onBack, children, appearance = 'light' }) => {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const backRef = useRef(onBack);
  backRef.current = onBack;

  useLayoutEffect(() => {
    if (open) setRoot(document.getElementById('teacher-mobile-overlay-root') ?? document.body);
  }, [open]);

  useEffect(() => {
    if (!open || !root || !pageRef.current) return;
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    pageRef.current.focus({ preventScroll: true });
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        event.stopImmediatePropagation();
        backRef.current();
      }
      if (event.key !== 'Tab' || !pageRef.current) return;
      const controls = Array.from(pageRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), a[href], [tabindex="0"]'));
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (!first) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || document.activeElement === pageRef.current)) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault(); first.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown, true);
    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open, root]);

  if (!open || !root) return null;
  return createPortal(
    <div ref={pageRef} role="region" aria-label={title} tabIndex={-1}
      className={`${root === document.body ? 'fixed' : 'absolute'} inset-0 z-[1200] flex min-h-0 flex-col overflow-hidden outline-none pointer-events-auto ${appearance === 'dark' ? 'bg-[var(--tm-camera-bg)]' : 'bg-[var(--tm-bg-surface)]'}`}>
      <div className="flex min-h-0 flex-1 flex-col pt-[var(--mini-program-status-bar-height,0px)] pb-[var(--mini-program-bottom-safe-area,0px)]">
        {children}
      </div>
      <SimulatedMiniProgramChrome appearance={appearance} />
    </div>, root,
  );
};

export default MobileFullScreenPage;
