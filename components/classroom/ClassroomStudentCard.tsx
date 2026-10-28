import React from 'react';
import { Check } from 'lucide-react';
import { DEMO_STUDENT_BASE_SCORE, getStudentCardTotalScore, getStudentCardDisplaySettings } from '../../mobile-app/domain/studentCardDisplay';
import { getStudentPerformanceLevel, type StudentPerformanceSummary } from '../../mobile-app/domain/studentPerformance';
import type { StudentCardDisplaySettings } from '../../mobile-app/types';
import { getClassroomDisplayConfig, type ClassroomDisplayConfig } from '../../shared/classroomDisplay';
import { ClassroomStudentAvatar, ClassroomStudentLevelIcons, ClassroomStudentLevelScore } from '../student-performance/ClassroomStudentPerformance';
import ClassroomPerformanceValues from './ClassroomPerformanceValues';
import ClassroomRosterBadge from './ClassroomRosterBadge';

/**
 * 课堂大屏学生卡片：完全版承载等级与评价信息，卡片高度随可见内容自动变化；
 * 尺寸、字号与间距全部来自大屏分辨率配置，不使用手机端触控 Token。
 */
export interface ClassroomStudentCardStudent {
  baseScore?: number;
  id: string;
  name: string;
  avatar: string;
  studentNo: string;
}

interface ClassroomStudentCardProps {
  student: ClassroomStudentCardStudent;
  performance: StudentPerformanceSummary;
  levelNetScore?: number;
  displaySettings?: StudentCardDisplaySettings;
  selected?: boolean;
  isSelectable?: boolean;
  isFocused?: boolean;
  isRolling?: boolean;
  onClick?: () => void;
  layout?: ClassroomDisplayConfig['studentCard'];
}

const ClassroomStudentCard: React.FC<ClassroomStudentCardProps> = ({
  student,
  performance,
  levelNetScore,
  displaySettings = getStudentCardDisplaySettings(),
  selected = false,
  isSelectable = false,
  isFocused = false,
  isRolling = false,
  onClick,
  layout = getClassroomDisplayConfig('standard').studentCard,
}) => {
  const resolvedLevelNetScore = levelNetScore ?? performance.netScore;
  const level = getStudentPerformanceLevel(resolvedLevelNetScore);
  const shownTotalScore = getStudentCardTotalScore(resolvedLevelNetScore, displaySettings.levelForm, student.baseScore ?? DEMO_STUDENT_BASE_SCORE);
  const showPraise = displaySettings.showEvaluation && displaySettings.showPraise;
  const showCriticism = displaySettings.showEvaluation && displaySettings.showCriticism;
  const showLevelIcons = displaySettings.showLevel && displaySettings.levelForm === 'icon';
  const showLevelScore = displaySettings.showLevel && (displaySettings.levelForm === 'score' || displaySettings.levelForm === 'scoreWithBase');
  const visiblePerformanceLabels = [
    showPraise
      ? `累计表扬${performance.praiseScore}分`
      : '',
    showCriticism
      ? `累计待改进${performance.criticismScore}分`
      : '',
  ].filter(Boolean);
  const ariaLabel = [
    `${student.name}，学号${student.studentNo}`,
    displaySettings.showLevel ? `总分（${displaySettings.levelForm === 'scoreWithBase' ? '含基础分' : '不含基础分'}）${shownTotalScore}分` : '',
    ...visiblePerformanceLabels,
  ].filter(Boolean).join('，');
  const hasVisibleValues = showPraise || showCriticism;
  const visiblePerformanceRowCount = Number(displaySettings.showLevel) + Number(hasVisibleValues);
  const cardHeight = visiblePerformanceRowCount === 2
    ? layout.fullHeight
    : visiblePerformanceRowCount === 1
      ? layout.countsHeight
      : layout.identityOnlyHeight;

  return (
    <div
      onClick={onClick}
      aria-label={ariaLabel}
      className={`relative flex h-auto w-auto flex-col items-center justify-center rounded-lg border-2 bg-white px-1 pb-1 shadow-[0_6px_18px_rgba(50,85,120,0.07)] transition-[transform,border-color,background-color,box-shadow] ${isFocused ? 'border-blue-400 bg-blue-50/80 shadow-md' : 'border-white hover:border-blue-300 hover:shadow-[0_10px_24px_rgba(50,85,120,0.12)]'} ${selected ? 'z-10 border-blue-500 bg-blue-50 shadow-md' : ''} ${isRolling ? 'animate-random-card-shuffle' : ''} ${onClick ? 'cursor-pointer active:scale-95' : ''}`}
      style={{ width: layout.width, height: cardHeight, paddingTop: layout.cardPaddingTop }}
    >
      {isSelectable && (
        <div className={`absolute right-0 top-0 z-20 flex items-center justify-center rounded-md border shadow-sm transition-all ${selected ? 'border-blue-500 bg-blue-500 text-white' : 'border-slate-200 bg-white/90 text-slate-300'}`} style={{ width: Math.max(20, Math.round(layout.rosterFontSize * 2)), height: Math.max(20, Math.round(layout.rosterFontSize * 2)) }}>
          <Check size={Math.max(12, Math.round(layout.rosterFontSize * 0.9))} strokeWidth={3} />
        </div>
      )}
      {displaySettings.showLevel && (
        <div className="flex w-full shrink-0 items-center justify-center" style={{ height: layout.levelHeight }}>
          {showLevelIcons && <ClassroomStudentLevelIcons level={level} compact iconSize={layout.levelIconSize} />}
          {showLevelScore && (
            <ClassroomStudentLevelScore netScore={shownTotalScore} fontSize={layout.levelScoreFontSize} height={layout.levelHeight} />
          )}
        </div>
      )}
      <div className="flex w-full shrink-0 items-center justify-center" style={{ height: layout.avatarSize, marginTop: displaySettings.showLevel ? layout.levelAvatarGap : 0 }}>
        <ClassroomStudentAvatar
          name={student.name}
          avatar={student.avatar}
          level={level}
          compact
          size={layout.avatarSize}
          showLevelProgress={showLevelIcons}
        />
      </div>
      {hasVisibleValues && (
        <div className="flex h-[18px] w-full shrink-0 items-center justify-center" style={{ height: layout.countHeight, marginTop: layout.avatarCountGap }}>
          <ClassroomPerformanceValues
            summary={performance}
            showPraise={showPraise}
            showCriticism={showCriticism}
            fontSize={layout.countFontSize}
            itemHeight={layout.countItemHeight}
            itemMinWidth={layout.countItemMinWidth}
            gap={layout.countGap}
          />
        </div>
      )}
      <div className="flex h-[18px] w-full shrink-0 items-center justify-center text-center" style={{ height: layout.identityHeight, marginTop: layout.countIdentityGap }}>
        <div className="inline-flex min-w-0 items-center justify-center gap-1" style={{ maxWidth: layout.width - 8 }}>
          <ClassroomRosterBadge studentNo={student.studentNo} fontSize={layout.rosterFontSize} width={layout.rosterWidth} height={layout.rosterHeight} />
          <h3 className={`min-w-0 truncate font-semibold tracking-normal text-slate-800 ${isRolling ? 'opacity-80' : ''}`} style={{ maxWidth: layout.width - 8 - layout.rosterWidth - 4, fontSize: layout.nameFontSize, lineHeight: `${layout.nameLineHeight}px` }}>{student.name}</h3>
        </div>
      </div>
    </div>
  );
};

export default ClassroomStudentCard;
