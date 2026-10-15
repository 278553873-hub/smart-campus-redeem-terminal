import React from 'react';
import { MoreHorizontal } from 'lucide-react';
import SimulatedIosStatusBar from './SimulatedIosStatusBar';

interface SimulatedMiniProgramChromeProps {
  appearance?: 'light' | 'dark';
}

/** 手机壳和整页共用的原生区域，直接随手机模拟尺寸变量显隐。 */
const SimulatedMiniProgramChrome: React.FC<SimulatedMiniProgramChromeProps> = ({ appearance = 'light' }) => (
  <div className={`pointer-events-none absolute inset-0 z-[90] ${appearance === 'dark' ? 'text-white' : 'text-black'}`} aria-hidden="true">
    <div className="absolute inset-x-0 top-0 overflow-hidden" style={{ height: 'var(--mini-program-status-bar-height, 0px)' }}>
      <SimulatedIosStatusBar appearance={appearance} />
    </div>
    <div className="absolute right-0 h-8 overflow-hidden" style={{ top: 'calc(var(--mini-program-status-bar-height, 0px) + 6px)', width: 'var(--mini-program-capsule-right-inset, 0px)' }}>
      <div className={`absolute right-4 flex h-8 items-center gap-3 rounded-full border px-3 backdrop-blur-md ${appearance === 'dark' ? 'border-white/20 bg-black/30' : 'border-black/5 bg-white/60'}`}>
        <MoreHorizontal size={16} className="opacity-80" />
        <div className="h-3.5 w-px bg-current opacity-10" />
        <div className="relative flex h-4 w-4 items-center justify-center">
          <div className="h-3.5 w-3.5 rounded-full border-[1.8px] border-current opacity-80" />
          <div className="absolute h-1 w-1 rounded-full bg-current opacity-80" />
        </div>
      </div>
    </div>
    <div className="absolute inset-x-0 bottom-0 flex items-end justify-center overflow-hidden" style={{ height: 'var(--mini-program-bottom-safe-area, 0px)' }}>
      <div className={`mb-2 h-1 w-32 shrink-0 rounded-full bg-current ${appearance === 'dark' ? 'opacity-70' : 'opacity-10'}`} />
    </div>
  </div>
);

export default SimulatedMiniProgramChrome;
