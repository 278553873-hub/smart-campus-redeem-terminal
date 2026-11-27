import { useEffect, type RefObject } from 'react';

/** 同向滚动及惯性只翻一页；反向累计到阈值可立即切回，不等待惯性结束。 */
export function useDiscreteWheelPaging(
  targetRef: RefObject<HTMLElement | null>,
  onStep: (direction: -1 | 1) => void,
  { allowInertiaInterrupt = false } = {},
) {
  useEffect(() => {
    const target = targetRef.current;
    if (!target) return;
    let previousTime = -Infinity;
    let accumulatedX = 0;
    let lockedDirection: -1 | 0 | 1 = 0;
    let previousMagnitude = 0;
    let decreasingSamples = 0;

    const handleWheel = (event: WheelEvent) => {
      // Ctrl + wheel is also how browsers report trackpad pinch-to-zoom.
      if (event.ctrlKey) return;
      const shiftedVertical = event.shiftKey && event.deltaX === 0;
      const deltaX = shiftedVertical ? event.deltaY : event.deltaX;
      const deltaY = shiftedVertical ? 0 : event.deltaY;
      if (Math.abs(deltaX) <= Math.abs(deltaY)) return;

      if (event.timeStamp - previousTime > 180) {
        accumulatedX = 0;
        lockedDirection = 0;
        previousMagnitude = 0;
        decreasingSamples = 0;
      }
      previousTime = event.timeStamp;

      // Consume only horizontal input, including its inertial tail; vertical page scrolling stays native.
      if (event.cancelable) event.preventDefault();
      const direction = deltaX > 0 ? 1 : -1;
      const width = target.getBoundingClientRect().width;
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? width : 1;
      const magnitude = Math.abs(deltaX * unit);
      const threshold = Math.min(allowInertiaInterrupt ? 24 : 32, width * 0.1);
      if (direction === lockedDirection) {
        // 明显减速后的重新加速，允许识别为下一次同向手势。
        const restarted = allowInertiaInterrupt && decreasingSamples >= 2
          && magnitude >= Math.max(threshold / 2, previousMagnitude * 2);
        if (!restarted) {
          // 连续反向输入已经起步时，少量原方向惯性不清除它。
          const keepReversing = allowInertiaInterrupt && magnitude < threshold / 2
            && Math.abs(accumulatedX) >= threshold / 3;
          if (!keepReversing) accumulatedX = 0;
          decreasingSamples = magnitude <= previousMagnitude ? decreasingSamples + 1 : 0;
          previousMagnitude = magnitude;
          return;
        }
        accumulatedX = 0;
        lockedDirection = 0;
      }
      accumulatedX += deltaX * unit;
      if (Math.abs(accumulatedX) < threshold) return;
      lockedDirection = accumulatedX > 0 ? 1 : -1;
      accumulatedX = 0;
      previousMagnitude = magnitude;
      decreasingSamples = 0;
      onStep(lockedDirection);
    };

    // React's wheel listener is passive; a native listener lets horizontal gestures stay within the carousel.
    target.addEventListener('wheel', handleWheel, { passive: false });
    return () => target.removeEventListener('wheel', handleWheel);
  }, [allowInertiaInterrupt, targetRef, onStep]);
}
