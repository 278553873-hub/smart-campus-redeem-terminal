import { useEffect, useRef, type MouseEvent } from 'react';
import './petInteractionReplay.css';

/** 预览点击重播原有悬停动作，兼容键盘和触控；不增加常驻动画循环。 */
export default function usePetInteractionReplay() {
  const timeout = useRef<number | undefined>(undefined);
  useEffect(() => () => window.clearTimeout(timeout.current), []);

  return (event: MouseEvent<HTMLElement>) => {
    if (!window.matchMedia('(prefers-reduced-motion: no-preference)').matches) return;
    const target = event.currentTarget;
    window.clearTimeout(timeout.current);
    // 点击时可能已在悬停中，用一次样式刷新重置现有动作，保证可重复触发。
    target.dataset.petRestarting = 'true';
    void target.offsetWidth;
    delete target.dataset.petRestarting;
    target.dataset.petPlaying = 'true';
    timeout.current = window.setTimeout(() => {
      delete target.dataset.petPlaying;
    }, 1200);
  };
}
