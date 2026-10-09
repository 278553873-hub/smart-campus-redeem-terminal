import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import SimulatedIosStatusBar from '../../../components/SimulatedIosStatusBar';

interface MobileWechatAppScreenProps {
  open: boolean;
  /** 无障碍名称，例如「微信选择聊天」。 */
  label: string;
  children: React.ReactNode;
}

const EXIT_DURATION = 220;
const STATUS_BAR_HEIGHT = 54;

const getExitDuration = () => (
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 0
    : EXIT_DURATION
);

/**
 * 「跳转微信」整屏仿真容器。
 *
 * 老师从微信小程序发起微信邀请时，真实体验是跳到微信 App 里选择聊天，
 * 而不是在小程序内自建一套聊天列表。这个容器负责那一次跳转的容器层：
 * 铺满手机屏幕、自带系统状态栏、从右侧滑入滑出。
 * 具体是「选择聊天」还是「发送给某个人」由业务内容决定。
 */
const MobileWechatAppScreen: React.FC<MobileWechatAppScreenProps> = ({ open, label, children }) => {
  const screenRef = useRef<HTMLDivElement>(null);
  const exitTimerRef = useRef<number | null>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [rendered, setRendered] = useState(open);
  const [visible, setVisible] = useState(false);

  useLayoutEffect(() => {
    const mobileOverlayRoot = document.getElementById('teacher-mobile-overlay-root');
    if (mobileOverlayRoot) {
      setPortalRoot(mobileOverlayRoot);
      return undefined;
    }

    const resolveFrame = window.requestAnimationFrame(() => {
      setPortalRoot(document.getElementById('teacher-mobile-overlay-root') ?? document.body);
    });
    return () => window.cancelAnimationFrame(resolveFrame);
  }, []);

  useEffect(() => {
    if (!portalRoot) return undefined;

    if (open) {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
      setRendered(true);
      if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setVisible(true);
        return undefined;
      }
      let secondFrame: number | null = null;
      const firstFrame = window.requestAnimationFrame(() => {
        secondFrame = window.requestAnimationFrame(() => setVisible(true));
      });
      return () => {
        window.cancelAnimationFrame(firstFrame);
        if (secondFrame !== null) window.cancelAnimationFrame(secondFrame);
      };
    }

    if (!rendered) return undefined;
    setVisible(false);
    const exitDuration = getExitDuration();
    if (exitDuration === 0) {
      setRendered(false);
      return undefined;
    }
    exitTimerRef.current = window.setTimeout(() => {
      setRendered(false);
      exitTimerRef.current = null;
    }, exitDuration);
    return () => {
      if (exitTimerRef.current !== null) {
        window.clearTimeout(exitTimerRef.current);
        exitTimerRef.current = null;
      }
    };
  }, [open, portalRoot, rendered]);

  useEffect(() => {
    if (!open || !portalRoot) return undefined;
    const previouslyFocused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const focusFrame = window.requestAnimationFrame(() => screenRef.current?.focus({ preventScroll: true }));
    return () => {
      window.cancelAnimationFrame(focusFrame);
      if (previouslyFocused?.isConnected) previouslyFocused.focus({ preventScroll: true });
    };
  }, [open, portalRoot]);

  if (!rendered || !portalRoot) return null;

  return createPortal(
    <div
      ref={screenRef}
      role="dialog"
      aria-modal="true"
      aria-label={label}
      tabIndex={-1}
      style={{ '--wechat-status-bar-height': `${STATUS_BAR_HEIGHT}px` } as React.CSSProperties}
      className={`absolute inset-0 z-[1200] overflow-hidden bg-[#EDEDED] outline-none transition-transform [transition-duration:var(--tm-duration-panel)] [transition-timing-function:cubic-bezier(0.22,1,0.36,1)] motion-reduce:transition-none ${visible ? 'pointer-events-auto translate-x-0' : 'pointer-events-none translate-x-full'}`}
    >
      <div className="absolute inset-0">{children}</div>
      <SimulatedIosStatusBar />
    </div>,
    portalRoot,
  );
};

export default MobileWechatAppScreen;
