import React from 'react';
import { ScreenParticleBackground } from '../screen-effects/ScreenParticleBackground';

export const ScreenBackground = ({ visible, reducedMotion }: { visible: boolean; reducedMotion: boolean }) => (
  <ScreenParticleBackground className="demo-evaluation-screen-background" visible={visible} reducedMotion={reducedMotion} />
);
