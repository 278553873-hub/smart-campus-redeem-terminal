import { useEffect, useRef, useState } from 'react';

export const HERO_SELECTION = { offset: 13, radiusGrowth: 24, duration: 500 } as const;

// 与手机端饼图的更新动画一致：缓入缓出，打断时从当前帧继续。
export const interpolateHeroEmphasis = (from: number, to: number, elapsed: number) => {
  const time = Math.max(0, Math.min(1, elapsed / HERO_SELECTION.duration));
  const eased = time < .5 ? 4 * time ** 3 : 1 - (-2 * time + 2) ** 3 / 2;
  return from + (to - from) * eased;
};

export function useHeroSectorMotion(activeKey: string | undefined, keys: string, animate: boolean) {
  const targetFor = () => Object.fromEntries(keys.split(',').filter(Boolean).map(key => [key, key === activeKey ? 1 : 0]));
  const [progress, setProgress] = useState<Record<string, number>>(targetFor);
  const current = useRef(progress);
  useEffect(() => {
    const target = targetFor();
    const from = { ...current.current };
    const publish = (next: Record<string, number>) => { current.current = next; setProgress(next); };
    if (!animate || Object.keys(target).every(key => from[key] === target[key])) {
      publish(target);
      return;
    }
    const start = performance.now();
    let frame: number;
    const tick = (now: number) => {
      const elapsed = now - start;
      publish(Object.fromEntries(Object.keys(target).map(key => [key,
        interpolateHeroEmphasis(from[key] ?? 0, target[key], elapsed),
      ])));
      if (elapsed < HERO_SELECTION.duration) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [activeKey, keys, animate]);
  return progress;
}
