import { useCallback, useEffect, useState } from 'react';

/** 使用布局尺寸绘图，避免整张SVG缩放时连带缩小文字。 */
export function useChartSize(fallback: { width: number; height: number }) {
  const [element, setElement] = useState<HTMLDivElement | null>(null);
  const [size, setSize] = useState(fallback);
  const ref = useCallback((node: HTMLDivElement | null) => { setElement(node); }, []);
  useEffect(() => {
    if (!element) return;
    const update = (width: number, height: number) => {
      if (width <= 0 || height <= 0) return;
      setSize(previous => previous.width === width && previous.height === height ? previous : { width, height });
    };
    update(element.clientWidth, element.clientHeight);
    const observer = new ResizeObserver(entries => {
      const entry = entries[0];
      if (entry) update(entry.contentRect.width, entry.contentRect.height);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [element]);
  return { ref, ...size };
}
