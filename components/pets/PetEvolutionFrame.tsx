import React from 'react';
import PetEvolutionText from './PetEvolutionText';
import './petEvolutionFrame.css';

/** 形象分数独立于实时经验；等待生成时由业务层保留最近一次可用形象。 */
export interface PetEvolutionState {
  artworkScore: number;
  status: 'generating' | 'delayed';
}

export default function PetEvolutionFrame({ children, evolution, detail = false, size }: {
  children: React.ReactNode;
  evolution?: PetEvolutionState;
  detail?: boolean;
  size?: number | string;
}) {
  if (!evolution) return <>{children}</>;
  return (
    <span className="pet-evolution-frame" data-detail={detail} data-status={evolution.status}
      style={{ width: size ?? '100%', height: size ?? '100%' }}>
      {children}
      <PetEvolutionText text="进化中" fontWeight={500} bands={11} detail={detail} />
    </span>
  );
}
