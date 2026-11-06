import React from 'react';
import { Check } from 'lucide-react';
import { getClassroomDisplayConfig, type ClassroomDisplayConfig } from '../../shared/classroomDisplay';
import DemoPetArtwork from '../pets/DemoPetArtwork';
import PetEvolutionFrame, { type PetEvolutionState } from '../pets/PetEvolutionFrame';
import { getPetGrowth } from '../pets/petGrowth';
import ClassroomRosterBadge from './ClassroomRosterBadge';
import type { ClassroomStudentCardStudent } from './ClassroomStudentCard';
import type { StudentCardDisplaySettings } from '../../mobile-app/types';
import { getClassroomPetCardLayout } from './classroomPetCardLayout';
import PetGrowthProgress from '../pets/PetGrowthProgress';
import type { StudentPerformanceSummary } from '../../mobile-app/domain/studentPerformance';
import { DEMO_STUDENT_BASE_SCORE, getStudentCardDisplaySettings, getStudentCardTotalScore } from '../../mobile-app/domain/studentCardDisplay';
import { formatScore } from './ClassroomPerformanceValues';
import './classroomPetCard.css';
import '../pets/petStageBadge.css';

interface ClassroomPetCardProps {
  student: ClassroomStudentCardStudent;
  layout?: ClassroomDisplayConfig['studentCard'];
  displaySettings?: StudentCardDisplaySettings;
  performance?: StudentPerformanceSummary;
  levelNetScore?: number;
  growthScore?: number;
  petGrowth?: ReturnType<typeof getPetGrowth>;
  eggVariant?: 'preview' | 'default';
  claimed?: boolean;
  evolution?: PetEvolutionState;
  renderArtwork?: (artwork: React.ReactNode) => React.ReactNode;
  selected?: boolean;
  isSelectable?: boolean;
  isFocused?: boolean;
  isRolling?: boolean;
  onClick?: () => void;
}

/** 宠物卡保留学生身份、伙伴与成长进度，总分沿用学生卡展示设置。 */
export default function ClassroomPetCard({
  student,
  layout = getClassroomDisplayConfig('standard').studentCard,
  performance,
  levelNetScore,
  displaySettings = getStudentCardDisplaySettings(),
  growthScore,
  petGrowth: resolvedGrowth,
  eggVariant = 'preview',
  claimed = true,
  evolution,
  renderArtwork,
  selected = false,
  isSelectable = false,
  isFocused = false,
  isRolling = false,
  onClick,
}: ClassroomPetCardProps) {
  const petLayout = getClassroomPetCardLayout(layout, displaySettings);
  const petGrowthScore = growthScore ?? performance?.praiseScore ?? 0;
  const petGrowth = resolvedGrowth ?? getPetGrowth(petGrowthScore);
  const artworkScore = resolvedGrowth ? [0, 5, 25, 45, 85, 165][resolvedGrowth.stageIndex] : evolution?.artworkScore ?? petGrowthScore;
  const artworkGrowth = getPetGrowth(artworkScore);
  const resolvedLevelNetScore = levelNetScore ?? performance?.netScore ?? 0;
  const petLevel = petGrowth.level;
  const shownTotalScore = getStudentCardTotalScore(resolvedLevelNetScore, displaySettings.levelForm, student.baseScore ?? DEMO_STUDENT_BASE_SCORE);
  const scoreLabel = displaySettings.showLevel
    ? `，总分（${displaySettings.levelForm === 'scoreWithBase' ? '含基础分' : '不含基础分'}）${shownTotalScore}分`
    : '';
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${student.name}，学号${student.studentNo}，${!claimed ? '尚未领取' : `伙伴${artworkGrowth.stageLabel}`}${evolution ? '，正在进化，经验持续累积' : ''}${claimed ? `，宠物等级${petLevel}` : ''}${scoreLabel}`}
      title={!claimed ? '尚未领取' : evolution ? '进化中，经验持续累积' : petGrowth.stageLabel}
      aria-pressed={isSelectable ? selected : undefined}
      className={`classroom-pet-card pet-interaction-target relative flex shrink-0 flex-col items-center rounded-lg border-0 bg-white transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 ${selected ? 'ring-2 ring-inset ring-blue-500 !bg-blue-50' : isFocused ? 'ring-2 ring-inset ring-blue-400 !bg-blue-50' : ''} ${isRolling ? 'animate-random-card-shuffle motion-reduce:animate-none' : ''}`}
      style={{ width: petLayout.width, height: petLayout.cardHeight, padding: `${petLayout.paddingTop}px ${petLayout.paddingHorizontal}px ${petLayout.paddingBottom}px`, gap: petLayout.gap, '--classroom-pet-meta-font-size': `${petLayout.fontSize}px`, '--classroom-pet-identity-height': `${petLayout.identityHeight}px`, '--classroom-pet-name-line-height': `${petLayout.nameLineHeight}px` } as React.CSSProperties}
    >
      {isSelectable && (
        <span aria-hidden="true" className={`absolute bottom-10 left-2 z-10 flex h-5 w-5 items-center justify-center rounded border ${selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-300 bg-white text-slate-300'}`}>
          <Check size={12} strokeWidth={3} />
        </span>
      )}
      <div className="flex w-full shrink-0 items-start justify-between gap-1" style={{ height: petLayout.headerHeight }}>
        <div className="flex min-w-0 flex-1 items-center gap-1" style={{ height: petLayout.identityHeight }}>
          <ClassroomRosterBadge studentNo={student.studentNo} fontSize={petLayout.rosterFontSize} width={petLayout.rosterWidth} height={petLayout.rosterHeight} />
          <span className="min-w-0 truncate font-semibold text-slate-700" title={student.name} style={{ fontSize: petLayout.nameFontSize, lineHeight: `${petLayout.nameLineHeight}px` }}>{student.name}</span>
        </div>
        <span className="w-10 shrink-0" aria-hidden="true" />
      </div>
      {claimed ? <>
      <span className="classroom-pet-card__badge classroom-pet-card__badge--stage pet-stage-badge" data-pet-stage={artworkGrowth.stageKey} aria-hidden="true">{artworkGrowth.stageLabel}</span>
      <div className="flex w-full shrink-0 items-end justify-center" style={{ height: petLayout.imageHeight }}>
        {renderArtwork ? renderArtwork(<DemoPetArtwork eggVariant={eggVariant} interactive={!evolution} student={student} growthScore={artworkScore} viewportSize={petLayout.artworkViewportSize} />) : <PetEvolutionFrame evolution={evolution} size={petLayout.artworkViewportSize}>
          <DemoPetArtwork eggVariant={eggVariant} interactive={!evolution} student={student} growthScore={artworkScore} viewportSize={petLayout.artworkViewportSize} />
        </PetEvolutionFrame>}
      </div>
      <div className="w-full shrink-0" style={{ height: petLayout.progressHeight }}>
        <PetGrowthProgress
          growth={petGrowth}
          praiseScore={petGrowthScore}
          variant="minimal"
          fontSize={petLayout.fontSize}
          footerStart={<span className="inline-flex items-center gap-1.5">
            <span className="font-semibold tabular-nums text-slate-600" aria-hidden="true">lv{petLevel}</span>
            {displaySettings.showLevel && <span className={shownTotalScore < 0 ? 'text-rose-700' : undefined} title={`总分${shownTotalScore}分`}>{formatScore(shownTotalScore)}</span>}
          </span>}
        />
      </div>
      </> : <span className="flex flex-1 items-center text-slate-500" style={{ fontSize: petLayout.fontSize }}>尚未领取</span>}
    </button>
  );
}
