import React from 'react';
import GhostFibers from './backgrounds/ghost-fibers/GhostFibers';

/** 学校 PC 独立背景；使用同源光纤算法，不引用 Demo 展示层。 */
export function ScreenBackground({ visible, reducedMotion }: { visible: boolean; reducedMotion: boolean }) {
  return <div className="evaluation-screen-background" aria-hidden="true">
    <GhostFibers glowColor="#ff791a" lineColor="#ffd08a" secondaryColor="#c04b35"
      gradient="along" fiberStyle="dots" speed={.18} flow={.12} scale={1.15} rotation={-16}
      rollSpeed={.08} layers={3} threads={84} density={.85} thickness={1.15} spread={1.4}
      volume={.9} waves={1.1} twist={1.2} depthOfField={.85} brightness={2.2} glow={2}
      particles={1.8} sparkle={.7} grain={.015} vignette={.3} mouseInteraction={false}
      hoverEffect="none" pulseOnClick={false} intro={false} paused={!visible || reducedMotion} dpr={.75} />
  </div>;
}
