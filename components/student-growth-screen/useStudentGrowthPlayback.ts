import { useEffect, useRef } from 'react';

export const STUDENT_GROWTH_HOLD_MS = 60_000;

/** 所有榜单固定同屏；只计整页停留时间，暂停续计，重新进入重新计时。 */
export function useStudentGrowthPlayback(enabled: boolean, cycleKey: number | string, onComplete?: () => void) {
  const clock = useRef({ key: cycleKey, remaining: STUDENT_GROWTH_HOLD_MS });
  useEffect(() => {
    if (clock.current.key !== cycleKey) clock.current = { key: cycleKey, remaining: STUDENT_GROWTH_HOLD_MS };
    if (!enabled || !onComplete) return;
    const current = clock.current;
    const start = Date.now();
    const timer = window.setTimeout(() => {
      onComplete();
    }, current.remaining);
    return () => { window.clearTimeout(timer); current.remaining = Math.max(0, current.remaining - (Date.now() - start)); };
  }, [enabled, cycleKey, onComplete]);
}
