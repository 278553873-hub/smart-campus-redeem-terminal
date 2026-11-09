import { useLayoutEffect, useRef, useState } from 'react';

export const getScreenCanvasLayout = (viewportWidth: number, viewportHeight: number, minimumWidth = 1920, minimumHeight = 1080) => {
  const scale = Math.max(0, Math.min(viewportWidth / minimumWidth, viewportHeight / minimumHeight));
  return { scale, canvasWidth: scale ? viewportWidth / scale : minimumWidth, canvasHeight: scale ? viewportHeight / scale : minimumHeight };
};

/** 保持字号与图形比例，扩展网格可用空间以铺满实际窗口。 */
export const useScreenCanvasLayout = () => {
  const viewportRef = useRef<HTMLDivElement>(null);
  const [layout, setLayout] = useState(() => getScreenCanvasLayout(0, 0));

  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const measure = () => {
      const bounds = viewport.getBoundingClientRect();
      setLayout(getScreenCanvasLayout(bounds.width, bounds.height));
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(viewport);
    return () => observer.disconnect();
  }, []);

  return { viewportRef, ...layout };
};
