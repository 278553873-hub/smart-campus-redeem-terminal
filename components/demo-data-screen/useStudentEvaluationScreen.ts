import { useCallback, useEffect, useRef, useState } from 'react';
import { applyEvaluationToPeriods, createDemoScreenEvaluation, type EvaluationScreenPeriods } from './studentEvaluationScreenModel';
import { loadStudentEvaluationScreen } from './studentEvaluationScreenService';

export const SCREEN_EVALUATION_INTERVAL = 5200;

export const useStudentEvaluationScreen = (playing: boolean) => {
  const [periods, setPeriods] = useState<EvaluationScreenPeriods | null>(null);
  const [error, setError] = useState(false);
  const [attempt, setAttempt] = useState(0);
  const [visible, setVisible] = useState(() => typeof document === 'undefined' || document.visibilityState !== 'hidden');
  const [reducedMotion, setReducedMotion] = useState(false);
  const sequence = useRef(8);
  const retry = useCallback(() => setAttempt(value => value + 1), []);

  useEffect(() => {
    let disposed = false;
    setError(false);
    loadStudentEvaluationScreen().then(data => {
      if (!disposed) { sequence.current = 8; setPeriods(data); }
    }).catch(() => { if (!disposed) setError(true); });
    return () => { disposed = true; };
  }, [attempt]);

  useEffect(() => {
    const onVisibility = () => setVisible(document.visibilityState !== 'hidden');
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onMotion = () => setReducedMotion(media.matches);
    onMotion();
    document.addEventListener('visibilitychange', onVisibility);
    media.addEventListener('change', onMotion);
    return () => {
      document.removeEventListener('visibilitychange', onVisibility);
      media.removeEventListener('change', onMotion);
    };
  }, []);

  const ready = Boolean(periods);
  useEffect(() => {
    if (!playing || !visible || !ready) return;
    const timer = window.setInterval(() => {
      const serial = sequence.current++;
      const now = Date.now();
      setPeriods(previous => {
        if (!previous) return previous;
        const event = createDemoScreenEvaluation(previous.week, serial, now);
        return event ? applyEvaluationToPeriods(previous, event) : previous;
      });
    }, SCREEN_EVALUATION_INTERVAL);
    return () => window.clearInterval(timer);
  }, [playing, visible, ready]);

  return { periods, error, retry, visible, reducedMotion };
};
