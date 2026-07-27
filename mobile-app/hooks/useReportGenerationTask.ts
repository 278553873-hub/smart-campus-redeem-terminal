import { useCallback, useEffect, useRef, useState } from 'react';

export type ReportGenerationResult = 'generated' | 'empty' | 'failed';
export type ReportGenerationTaskStatus = 'idle' | 'generating' | ReportGenerationResult;

interface UseReportGenerationTaskOptions {
  stepCount: number;
  durationMs?: number;
  initialStatus?: ReportGenerationTaskStatus;
}

interface ReportGenerationTaskState {
  status: ReportGenerationTaskStatus;
  visibleStepCount: number;
  start: (result?: ReportGenerationResult) => void;
  retry: () => void;
  reset: () => void;
}

export const useReportGenerationTask = ({
  stepCount,
  durationMs = 2800,
  initialStatus = 'idle',
}: UseReportGenerationTaskOptions): ReportGenerationTaskState => {
  const [status, setStatus] = useState<ReportGenerationTaskStatus>(initialStatus);
  const [visibleStepCount, setVisibleStepCount] = useState(initialStatus === 'generated' ? stepCount : 1);
  const startedAtRef = useRef<number | null>(null);
  const resultRef = useRef<ReportGenerationResult>('generated');

  const start = useCallback((result: ReportGenerationResult = 'generated') => {
    if (status !== 'idle') return;
    startedAtRef.current = Date.now();
    resultRef.current = result;
    setVisibleStepCount(1);
    setStatus('generating');
  }, [status]);

  const retry = useCallback(() => {
    startedAtRef.current = Date.now();
    resultRef.current = 'generated';
    setVisibleStepCount(1);
    setStatus('generating');
  }, []);

  const reset = useCallback(() => {
    startedAtRef.current = null;
    resultRef.current = 'generated';
    setVisibleStepCount(1);
    setStatus('idle');
  }, []);

  useEffect(() => {
    if (status !== 'generating') return;

    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduceMotion) {
      setVisibleStepCount(stepCount);
      setStatus(resultRef.current);
      return;
    }

    const effectiveDuration = durationMs;
    const stepDuration = effectiveDuration / Math.max(1, stepCount);
    const startedAt = startedAtRef.current ?? Date.now();
    startedAtRef.current = startedAt;

    const updateProgress = () => {
      const elapsed = Date.now() - startedAt;
      const nextStepCount = Math.min(stepCount, Math.floor(elapsed / stepDuration) + 1);
      setVisibleStepCount(nextStepCount);
    };

    updateProgress();
    const interval = window.setInterval(updateProgress, Math.min(180, stepDuration));
    const timeout = window.setTimeout(() => {
      setVisibleStepCount(stepCount);
      setStatus(resultRef.current);
    }, Math.max(0, effectiveDuration - (Date.now() - startedAt)));

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timeout);
    };
  }, [durationMs, status, stepCount]);

  return { status, visibleStepCount, start, retry, reset };
};
