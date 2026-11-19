import { useEffect, useRef, useState } from 'react';
import { buildScreenInsightDigest, refreshScreenInsightDigest, type ScreenInsightDigest } from './studentEvaluationScreenInsights';
import type { EvaluationScreenSnapshot } from './studentEvaluationScreenModel';

/** 日内保留同一份分析，避免每条实时评价到来时改写正在阅读的结论。 */
export const useScreenInsightDigest = (snapshot: EvaluationScreenSnapshot | undefined) => {
  const [digest, setDigest] = useState<ScreenInsightDigest>();
  const builder = useRef(buildScreenInsightDigest);
  useEffect(() => {
    if (!snapshot) return;
    // 预览热更新更换分析文案时重建；普通实时评价仍沿用日内快照。
    const contentChanged = builder.current !== buildScreenInsightDigest;
    builder.current = buildScreenInsightDigest;
    setDigest(previous => contentChanged ? buildScreenInsightDigest(snapshot) : refreshScreenInsightDigest(previous, snapshot));
  }, [snapshot, buildScreenInsightDigest]);
  return digest;
};

export { useScreenPanelPlayback as useScreenInsightPlayback } from './useScreenPanelPlayback';
