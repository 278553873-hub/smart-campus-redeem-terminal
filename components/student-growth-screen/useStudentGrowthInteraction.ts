import { useCallback, useEffect, useRef, useState } from 'react';

export const STUDENT_GROWTH_IDLE_MS = 90_000;

/** 操作期间独占阅读；重复操作延长闲置期限，后台暂停计时，闲置后重置浏览范围。 */
export function useStudentGrowthInteraction(enabled: boolean, cycleKey: number, onIdle: () => void) {
  const [session, setSession] = useState({ key: cycleKey, interacting: false, revision: 0 });
  const clock = useRef<{ key: number; remaining: number; startedAt: number | null }>({ key: cycleKey, remaining: STUDENT_GROWTH_IDLE_MS, startedAt: null });
  const interacting = session.key === cycleKey && session.interacting;
  const onActivity = useCallback(() => {
    if (!enabled) return;
    clock.current = { key: cycleKey, remaining: STUDENT_GROWTH_IDLE_MS, startedAt: Date.now() };
    setSession(previous => previous.key === cycleKey && previous.interacting ? previous : {
      key: cycleKey, interacting: true, revision: previous.key === cycleKey ? previous.revision + 1 : 1,
    });
  }, [enabled, cycleKey]);

  useEffect(() => {
    if (clock.current.key !== cycleKey) clock.current = { key: cycleKey, remaining: STUDENT_GROWTH_IDLE_MS, startedAt: null };
    if (!enabled || !interacting) return;
    clock.current.startedAt = Date.now();
    let timer: number;
    const check = () => {
      const current = clock.current;
      const remaining = current.remaining - (Date.now() - (current.startedAt ?? Date.now()));
      if (remaining > 0) { timer = window.setTimeout(check, remaining); return; }
      current.remaining = STUDENT_GROWTH_IDLE_MS;
      current.startedAt = null;
      setSession(previous => previous.key === cycleKey ? { ...previous, interacting: false } : previous);
      onIdle();
    };
    timer = window.setTimeout(check, clock.current.remaining);
    return () => {
      window.clearTimeout(timer);
      const current = clock.current;
      if (current.key === cycleKey && current.startedAt !== null) {
        current.remaining = Math.max(0, current.remaining - (Date.now() - current.startedAt));
        current.startedAt = null;
      }
    };
  }, [enabled, cycleKey, interacting, onIdle]);

  return { interacting, onActivity, playbackKey: `${cycleKey}:${session.key === cycleKey ? session.revision : 0}` };
}
