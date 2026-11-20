import { useEffect, type RefObject } from 'react';

/** 同向滚动及惯性只翻一页；反向累计到阈值可立即切回，不等待惯性结束。 */
export function useDiscreteWheelPaging(
  targetRef: RefObject<HTMLElement | null>,
  onStep: (direction: -1 | 1) => void,
) {
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    let previousTime = -Infinity;
    let accumulatedX = 0;
    let lockedDirection: -1 | 0 | 1 = 0;

    const handleWheel = (event: WheelEvent) => {
      // Ctrl + wheel is also how browsers report trackpad pinch-to-zoom.
      if (event.ctrlKey) return;
      if (event.timeStamp - previousTime > 180) {
        accumulatedX = 0;
        lockedDirection = 0;
      }
      previousTime = event.timeStamp;

      const shiftedVertical = event.shiftKey && event.deltaX === 0;
      const deltaX = shiftedVertical ? event.deltaY : event.deltaX;
      const deltaY = shiftedVertical ? 0 : event.deltaY;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

      // Consume only horizontal input, including its inertial tail; vertical page scrolling stays native.
      if (event.cancelable) event.preventDefault();
      const direction = deltaX > 0 ? 1 : -1;
      if (direction === lockedDirection) {
        // Ignore same-direction momentum and discard any tiny opposite-direction jitter.
        accumulatedX = 0;
        return;
      }
      const width = target.getBoundingClientRect().width;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? width : 1;
      accumulatedX += deltaX * unit;
      if (Math.abs(accumulatedX) < Math.min(32, width * 0.1)) return;
      lockedDirection = accumulatedX > 0 ? 1 : -1;
      accumulatedX = 0;
      onStep(lockedDirection);
    };

    // React's wheel listener is passive; a native listener lets horizontal gestures stay within the carousel.
    target.addEventListener('wheel', handleWheel, { passive: false });
    return () => target.removeEventListener('wheel', handleWheel);
  }, [targetRef, onStep]);
}
