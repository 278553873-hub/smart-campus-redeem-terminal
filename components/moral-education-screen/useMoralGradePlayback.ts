import { useEffect, useState } from 'react';

export const MORAL_GRADE_INTERVAL = 30_000;

/** 无人值守展示只自动换屏；离开全景或浏览器隐藏时由active暂停。 */
export function useMoralGradePlayback(pageCount: number, active: boolean) {
  const [step, setStep] = useState(0);
  const pages = Math.max(1, pageCount);
  const page = step % pages;
  useEffect(() => {
    if (!active || pages < 2) return;
    const timer = window.setInterval(() => setStep(previous => previous + 1), MORAL_GRADE_INTERVAL);
    return () => window.clearInterval(timer);
  }, [active, pages]);
  return { page, pages };
}
