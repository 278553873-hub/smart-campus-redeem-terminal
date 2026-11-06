import React from 'react';
import { getPetGrowth } from './petGrowth';
import './petGrowthProgress.css';

interface PetGrowthProgressProps {
  praiseScore: number;
  growth?: ReturnType<typeof getPetGrowth>;
  evolving?: boolean;
  compact?: boolean;
  variant?: 'default' | 'minimal';
  fontSize?: number;
  footerStart?: React.ReactNode;
}

export default function PetGrowthProgress({ praiseScore, growth: resolvedGrowth, evolving = false, compact = false, variant = 'default', fontSize = 14, footerStart }: PetGrowthProgressProps) {
  const growth = resolvedGrowth ?? getPetGrowth(praiseScore);
  const track = (
    <div
      role="progressbar"
      aria-label={growth.stageIndex === 0 ? '孵化进度' : '升级进度'}
      aria-valuemin={0}
      aria-valuemax={growth.isMaxLevel ? 1 : growth.levelTarget}
      aria-valuenow={growth.isMaxLevel ? 1 : growth.levelCurrent}
      aria-valuetext={growth.isMaxLevel ? 'lv10，究极体，已满级' : `lv${growth.level}，${growth.stageLabel}，本级${growth.levelCurrent}分，还需${growth.levelRemaining}分升至lv${growth.level + 1}`}
      className="pet-growth-progress__track w-full shrink-0 overflow-hidden rounded-full"
      style={{ height: variant === 'minimal' ? 8 : compact ? 4 : 6 }}
    >
      <div className="pet-growth-progress__fill h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${growth.levelRatio * 100}%` }} />
    </div>
  );
  if (variant === 'minimal') {
    return (
      <div className="flex w-full flex-col gap-1 font-medium" style={{ fontSize }}>
        <div className="flex min-w-0 items-center justify-between gap-2 leading-4 text-slate-500">
          <span className="min-w-0 tabular-nums">{footerStart}</span>
          <span className="shrink-0 whitespace-nowrap font-semibold tabular-nums" aria-label={growth.isMaxLevel ? '已满级' : `当前${growth.levelCurrent}分，目标${growth.levelTarget}分`}>
            {growth.isMaxLevel ? '已满级' : <><span className="font-semibold text-slate-600">{growth.levelCurrent}</span>/{growth.levelTarget}</>}
          </span>
        </div>
        {track}
      </div>
    );
  }
  if (compact) {
    return (
      <div className="flex h-full w-full flex-col gap-1" style={{ fontSize }}>
        {track}
        <div className="flex w-full min-w-0 items-center justify-between gap-2">
          <div className="min-w-0 flex-1">{footerStart}</div>
          <span className="shrink-0 whitespace-nowrap tabular-nums" style={{ lineHeight: `${fontSize + 4}px` }} aria-label={growth.isMaxLevel ? '已满级' : `当前${growth.levelCurrent}分，目标${growth.levelTarget}分`}>
            {growth.isMaxLevel ? <span className="font-normal text-slate-500">已满级</span> : <><span className="font-medium text-blue-600">{growth.levelCurrent}</span><span className="font-normal text-slate-500">/{growth.levelTarget}</span></>}
          </span>
        </div>
      </div>
    );
  }
  return (
    <div className="w-full" style={{ fontSize }}>
      <div className="mb-2 flex items-center justify-between gap-2 text-slate-500">
        <span>{growth.stageIndex === 0 ? '孵化进度' : '升级进度'}</span><span className="tabular-nums">{growth.isMaxLevel ? '已满级' : `${growth.levelCurrent}/${growth.levelTarget}`}</span>
      </div>
      {track}
      <p className="mt-2 leading-relaxed text-slate-500" style={{ fontSize: Math.max(12, fontSize - 1) }}>
        {evolving ? '新形象准备中，经验持续累积' : growth.isMaxLevel ? '已成长为究极体' : <>再获得 <span className="font-medium text-slate-700">{growth.remaining}</span> 分{growth.stageIndex === 0 ? '自动孵化' : `自动进化为${growth.nextStageLabel}`}</>}
      </p>
    </div>
  );
}
