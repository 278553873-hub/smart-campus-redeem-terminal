import { useEffect, useState } from 'react';

/** 无人操作面板共用的轮播状态；隐藏、聚焦或减少动态效果时暂停。 */
export const useScreenPanelPlayback = (length: number, visible: boolean, reducedMotion: boolean, interval = 30_000) => {
  const [step, setStep] = useState(0);
  const [focused, setFocused] = useState(false);
  const [selected, setSelected] = useState<number | null>(null);
  const active = selected ?? (length ? step % length : 0);
  useEffect(() => {
    if (!visible || reducedMotion || focused || length < 2) return;
    const timer = window.setInterval(() => {
      setSelected(null);
      setStep(previous => previous + 1);
    }, interval);
    return () => window.clearInterval(timer);
  }, [visible, reducedMotion, focused, length, selected, interval]);
  const setActive = (index: number) => {
    const count = Math.max(1, length);
    const next = Math.max(0, index) % count;
    setSelected(next);
    // 手动切换也更新播放位置，下一次定时器从当前页继续。
    setStep(previous => Math.floor(previous / count) * count + next);
  };
  return { active: active % Math.max(1, length), page: Math.floor(step / Math.max(1, length)), setActive, setFocused };
};
