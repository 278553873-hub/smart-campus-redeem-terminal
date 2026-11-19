import React, { useEffect, useState } from 'react';
import GhostFibers from './ghost-fibers/GhostFibers';
import './screenParticleBackground.css';

export function ScreenParticleBackground({ visible, reducedMotion = false, className = '' }: { visible: boolean; reducedMotion?: boolean; className?: string }) {
  const [pageVisible, setPageVisible] = useState(true);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const syncVisibility = () => setPageVisible(!document.hidden);
    const syncMotion = () => setPrefersReducedMotion(media.matches);
    syncVisibility(); syncMotion();
    document.addEventListener('visibilitychange', syncVisibility);
    media.addEventListener('change', syncMotion);
    return () => {
      document.removeEventListener('visibilitychange', syncVisibility);
      media.removeEventListener('change', syncMotion);
    };
  }, []);
  return <div className={`screen-particle-background ${className}`} aria-hidden="true">
    <GhostFibers glowColor="#ff791a" lineColor="#ffd08a" secondaryColor="#c04b35" gradient="along" fiberStyle="dots"
      speed={.18} flow={.12} scale={1.15} rotation={-16} rollSpeed={.08} layers={3} threads={84} density={.85}
      thickness={1.15} spread={1.4} volume={.9} waves={1.1} twist={1.2} depthOfField={.85} brightness={2.2} glow={2}
      particles={1.8} sparkle={.7} grain={.015} vignette={.3} mouseInteraction={false} hoverEffect="none" pulseOnClick={false}
      intro={false} paused={!visible || !pageVisible || reducedMotion || prefersReducedMotion} dpr={.75} />
  </div>;
}
