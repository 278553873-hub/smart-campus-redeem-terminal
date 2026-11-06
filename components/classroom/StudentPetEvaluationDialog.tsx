import './classroomControls.css';
import React from 'react';
import { Modal } from '@arco-design/web-react';
import { Settings, X, Mars, Venus } from 'lucide-react';
import DemoPetArtwork from '../pets/DemoPetArtwork';
import PetEvolutionFrame, { type PetEvolutionState } from '../pets/PetEvolutionFrame';
import { getPetGrowth } from '../pets/petGrowth';
import PetGrowthProgress from '../pets/PetGrowthProgress';
import usePetInteractionReplay from '../pets/usePetInteractionReplay';
import { ClassroomFullStudentNumber } from './ClassroomRosterBadge';
import ClassroomEvaluationOptions, { type ClassroomEvaluationOption } from './ClassroomEvaluationOptions';
import type { ClassroomDisplayConfig } from '../../shared/classroomDisplay';
import './studentPetEvaluation.css';
import '../pets/petStageBadge.css';

interface StudentPetEvaluationDialogProps {
  visible: boolean;
  student: { id: string; name: string; studentNo: string; avatar?: string; gender?: 'male' | 'female' };
  praiseScore: number;
  petGrowth?: ReturnType<typeof getPetGrowth>;
  eggVariant?: 'preview' | 'default';
  evolution?: PetEvolutionState;
  renderArtwork?: (artwork: React.ReactNode) => React.ReactNode;
  categories: string[];
  options: ClassroomEvaluationOption[];
  tab: ClassroomEvaluationOption['type'];
  layout: ClassroomDisplayConfig['evaluation'];
  onTabChange: (tab: ClassroomEvaluationOption['type']) => void;
  onSelect: (option: ClassroomEvaluationOption) => void;
  onManage: () => void;
  onClose: () => void;
}

export default function StudentPetEvaluationDialog(props: StudentPetEvaluationDialogProps) {
  const { visible, student, layout, onClose } = props;
  return (
    <Modal
      visible={visible}
      title={<span className="sr-only">{student.name}的伙伴与评价</span>}
      footer={null}
      closable={false}
      onCancel={onClose}
      maskClosable
      escToExit
      unmountOnExit
      focusLock
      alignCenter
      className="student-pet-evaluation-modal"
      style={{ width: `min(${layout.modalWidth + 240}px, calc(100vw - 32px))` }}
    >
      <StudentPetEvaluationContent {...props} />
    </Modal>
  );
}

export function StudentPetEvaluationContent({ student, praiseScore, petGrowth, eggVariant = 'preview', evolution, renderArtwork, categories, options, tab, layout, onTabChange, onSelect, onManage, onClose }: StudentPetEvaluationDialogProps) {
  const growth = petGrowth ?? getPetGrowth(evolution?.artworkScore ?? praiseScore);
  const artworkScore = petGrowth ? [0, 5, 25, 45, 85, 165][petGrowth.stageIndex] : evolution?.artworkScore ?? praiseScore;
  const replayPetInteraction = usePetInteractionReplay();
  const controlSize = Math.max(32, layout.closeButtonSize - 8);
  const headerHeight = Math.max(52, Math.round(layout.headerHeight * 0.75));
  const identityAvatarSize = Math.max(36, layout.avatarSize - 8);
  return (
      <div className="student-pet-evaluation-layout" style={{ height: `min(${layout.managerHeight + layout.headerHeight + 48}px, calc(100dvh - 40px))` }}>
        <aside className="student-pet-evaluation-profile" aria-label={`${student.name}的成长伙伴`}>
          <div className="flex shrink-0 items-center gap-3">
            {student.avatar ? (
              <img src={student.avatar} alt={`${student.name}头像`} className="shrink-0 rounded-full object-cover ring-2 ring-white" style={{ width: identityAvatarSize, height: identityAvatarSize }} />
            ) : (
              <span aria-hidden="true" className="flex shrink-0 items-center justify-center rounded-full bg-white font-medium text-slate-600" style={{ width: identityAvatarSize, height: identityAvatarSize }}>{student.name.slice(0, 1)}</span>
            )}
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h2 className="truncate font-semibold text-slate-800" style={{ fontSize: layout.titleFontSize - 2 }} title={student.name}>{student.name}</h2>
                {student.gender && <span role="img" aria-label={student.gender === 'male' ? '男生' : '女生'} className="shrink-0">{student.gender === 'male' ? <Mars size={layout.studentNoFontSize + 1} className="text-blue-500" /> : <Venus size={layout.studentNoFontSize + 1} className="text-rose-400" />}</span>}
              </div>
              <ClassroomFullStudentNumber studentNo={student.studentNo} fontSize={Math.max(12, layout.studentNoFontSize - 1)} />
            </div>
          </div>
          <div className="student-pet-evaluation-artwork">
            <button type="button" onClick={evolution ? undefined : replayPetInteraction} aria-label={`${growth.stageLabel}成长伙伴${evolution ? '，正在进化' : '，点击互动'}`} className="pet-interaction-target mx-auto flex aspect-square w-full max-w-[280px] shrink-0 items-center justify-center rounded-xl border-0 bg-transparent p-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500">
              {renderArtwork ? renderArtwork(<DemoPetArtwork eggVariant={eggVariant} interactive={!evolution} student={student} growthScore={artworkScore} />) : <PetEvolutionFrame evolution={evolution} detail>
                <DemoPetArtwork eggVariant={eggVariant} interactive={!evolution} student={student} growthScore={artworkScore} />
              </PetEvolutionFrame>}
            </button>
            <span data-pet-stage={growth.stageKey} className="pet-stage-badge mt-4 px-3 py-1 font-medium" style={{ fontSize: layout.studentNoFontSize }}>{growth.stageLabel}</span>
          </div>
          <PetGrowthProgress growth={petGrowth} praiseScore={praiseScore} evolving={Boolean(evolution)} fontSize={layout.studentNoFontSize} />
        </aside>
        <section className="student-pet-evaluation-content" aria-label="评价学生">
          <header className="flex shrink-0 items-center gap-4 border-b border-slate-100 bg-white px-6" style={{ minHeight: headerHeight }}>
            <div className="flex shrink-0 items-center gap-5" role="group" aria-label="评价类型">
              {([{ value: 'positive', label: '表扬' }, { value: 'negative', label: '待改进' }] as const).map(item => (
                <button key={item.value} type="button" aria-pressed={tab === item.value} onClick={() => onTabChange(item.value)}
                  className={`border-b-2 px-0.5 font-medium transition-colors focus-visible:rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500 ${tab === item.value ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                  style={{ height: headerHeight, fontSize: layout.tabFontSize }}>{item.label}</button>
              ))}
            </div>
            <div className="ml-auto flex shrink-0 items-center gap-1">
              <button type="button" aria-label="管理评价项" title="管理评价项" onClick={onManage} className="classroom-control flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500" style={{ width: controlSize, height: controlSize }}><Settings size={layout.closeIconSize - 3} /></button>
              <button type="button" aria-label="关闭评价" title="关闭" onClick={onClose} className="classroom-control flex items-center justify-center text-slate-400 hover:bg-slate-100 hover:text-slate-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-blue-500" style={{ width: controlSize, height: controlSize }}><X size={layout.closeIconSize - 3} /></button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto bg-white custom-scrollbar">
            <ClassroomEvaluationOptions categories={categories} options={options} tab={tab} layout={layout} onSelect={onSelect} adaptive />
          </div>
        </section>
      </div>
  );
}
