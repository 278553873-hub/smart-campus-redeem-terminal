/** 仅供演示容器使用，不参与正式列表请求。 */
export interface ClassListLoadingPreview {
  durationMs: number;
  replayKey: number;
  mode: 'timed' | 'hold' | 'ready';
}

export const defaultClassListLoadingPreview: ClassListLoadingPreview = {
  durationMs: 1800,
  replayKey: 0,
  mode: 'timed',
};

/** 只保存在当前页面内存，刷新或重新打开演示会清空；不代表线上数据缓存。 */
export const createClassListLoadingPreviewSession = () => {
  const completedKeys = new Set<string>();
  return {
    hasLoaded: (key: string) => completedKeys.has(key),
    complete: (key: string) => { completedKeys.add(key); },
  };
};

export const classListLoadingPreviewSession = createClassListLoadingPreviewSession();
