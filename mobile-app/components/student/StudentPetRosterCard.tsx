import React from 'react';
import DemoPetArtwork from '../../../components/pets/DemoPetArtwork';
import { PET_STAGE_KEYS, PET_STAGE_LABELS } from '../../../components/pets/petGrowth';
import type { getClaimedPetGrowth } from '../../../shared/classPetRoster';
import type { Student } from '../../types';
import { CheckIcon, CircleIcon } from '../Icons';
import StudentRosterNumber from './StudentRosterNumber';
import '../../../components/pets/petStageBadge.css';
import '../../../components/pets/petGrowthProgress.css';
import './studentPetRosterCard.css';

export type StudentRosterPet = ReturnType<typeof getClaimedPetGrowth> | 'unclaimed';
interface Props {
  student: Student;
  pet: StudentRosterPet;
  showSelection: boolean;
  selected: boolean;
  onClick: () => void;
}

/** 手机列表沿用大屏的身份、阶段缎带、伙伴和精简进度层级。 */
export default function StudentPetRosterCard({ student, pet, showSelection, selected, onClick }: Props) {
  const studentNo = student.studentNo || student.id;
  return (
    <button type="button" onClick={onClick} aria-pressed={showSelection ? selected : undefined}
      aria-label={`${student.name}，学号${studentNo}，${pet === 'unclaimed' ? '尚未领取宠物' : `${PET_STAGE_LABELS[pet.stage]}，${pet.level}级，经验${pet.experience}`}`}
      data-selectable={showSelection || undefined} className="tm-student-pet-card">
      {showSelection && <span aria-hidden="true" className="absolute -right-1 -top-1 z-20 rounded-full bg-[var(--tm-bg-surface)]">{selected ? <CheckIcon className="h-[18px] w-[18px] text-[var(--tm-brand-primary)]" /> : <CircleIcon className="h-[18px] w-[18px] text-[var(--tm-border-subtle)]" />}</span>}
      <span className="tm-student-pet-card__identity">
        <StudentRosterNumber studentNo={studentNo} variant="student-card" />
        <span title={student.name} className="min-w-0 truncate text-[length:var(--tm-student-card-name-font-size)] font-semibold">{student.name}</span>
      </span>
      {pet === 'unclaimed' ? <span className="tm-student-pet-card__empty">尚未领取</span> : <>
        <span aria-hidden="true" data-pet-stage={PET_STAGE_KEYS[pet.stage]} className="pet-stage-badge tm-student-pet-card__stage">{PET_STAGE_LABELS[pet.stage]}</span>
        <span className="tm-student-pet-card__artwork" aria-hidden="true">
          <DemoPetArtwork student={student} growthScore={[0, 5, 25, 45, 85, 165][pet.stage]} eggVariant="default" interactive={false} />
        </span>
        <span className="tm-student-pet-card__progress">
        <span className="tm-student-pet-card__values">
          <span>lv{pet.level}</span><span>{pet.isMaxLevel ? '已满级' : `${pet.levelCurrent}/${pet.levelTarget}`}</span>
        </span>
        <span role="progressbar" aria-label={pet.stage === 0 ? '孵化进度' : '升级进度'} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(pet.ratio * 100)} aria-valuetext={pet.isMaxLevel ? '已满级' : `本级经验${pet.levelCurrent}，目标${pet.levelTarget}`} className="pet-growth-progress__track h-[var(--tm-student-pet-progress-height)] w-full shrink-0 overflow-hidden rounded-full">
          <span className="pet-growth-progress__fill block h-full rounded-full" style={{ width: `${pet.ratio * 100}%` }} />
        </span>
        </span>
      </>}
    </button>
  );
}
