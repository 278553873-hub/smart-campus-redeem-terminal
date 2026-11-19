import { useEffect, useState } from 'react';

export const MORAL_TREND_INTERVAL = 10_000;
export const MORAL_TREND_METRICS = [
  { id: 'averageScore', label: '平均得分' },
  { id: 'deduction', label: '累计待改进' },
] as const;
export type MoralTrendMetric = typeof MORAL_TREND_METRICS[number]['id'];

export function useMoralTrendPlayback(active: boolean) {
  const [metric, setMetric] = useState<MoralTrendMetric>('averageScore');
  useEffect(() => {
    if (!active) return;
    const timer = window.setInterval(() => setMetric(previous => previous === 'averageScore' ? 'deduction' : 'averageScore'), MORAL_TREND_INTERVAL);
    return () => window.clearInterval(timer);
  }, [active, metric]);
  return { metric, setMetric };
}
