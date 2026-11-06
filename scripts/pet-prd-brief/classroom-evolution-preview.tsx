import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import ClassroomPetCard from '../../components/classroom/ClassroomPetCard';
import { StudentPetEvaluationContent } from '../../components/classroom/StudentPetEvaluationDialog';
import { getClassroomDisplayConfig } from '../../shared/classroomDisplay';
import { getClassroomPetCardLayout } from '../../components/classroom/classroomPetCardLayout';
import { getStudentCardDisplaySettings } from '../../mobile-app/domain/studentCardDisplay';
import { getPetGrowth, PET_STAGE_LABELS } from '../../components/pets/petGrowth';
import PetEvolutionFrame from '../../components/pets/PetEvolutionFrame';
import '@arco-design/web-react/dist/css/arco.css';
import './classroom-evolution-preview.css';

const scores = [0, 8, 32, 58, 113, 165];
const student = { id: 'water-evolution-preview', name: '林思齐', studentNo: '01', avatar: '', gender: 'male' as const };
function Artwork({ children, size, detail = false }: { children: React.ReactNode; size: number | string; detail?: boolean }) {
  return <PetEvolutionFrame evolution={{ artworkScore: 0, status: 'generating' }} detail={detail} size={size}>{children}</PetEvolutionFrame>;
}
function Preview() {
  const [stage, setStage] = useState(0);
  const [preset, setPreset] = useState<'standard' | 'classroom' | 'distant'>('classroom');
  const [extra, setExtra] = useState(0);
  const [tab, setTab] = useState<'positive' | 'negative'>('positive');
  const [manage, setManage] = useState(false);
  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.source !== parent || event.data?.type !== 'pet-evolution-preview') return;
      if (Number.isInteger(event.data.stage) && event.data.stage >= 0 && event.data.stage < 6) { setStage(event.data.stage); setExtra(0); }
      if (['standard', 'classroom', 'distant'].includes(event.data.preset)) setPreset(event.data.preset);
    };
    window.addEventListener('message', listener);
    parent.postMessage({ type: 'pet-evolution-preview-ready' }, '*');
    const observer = new ResizeObserver(() => { parent.postMessage({ type: 'pet-evolution-preview-size', height: Math.ceil(document.querySelector('main')!.getBoundingClientRect().height) }, '*'); });
    observer.observe(document.querySelector('main')!);
    return () => { window.removeEventListener('message', listener); observer.disconnect(); };
  }, []);
  const layout = getClassroomDisplayConfig(preset);
  const settings = { ...getStudentCardDisplaySettings(), showLevel: false };
  const petLayout = getClassroomPetCardLayout(layout.studentCard, settings);
  const score = scores[stage];
  const options = [
    { id: '1', label: '积极参与', category: '课堂表现', type: 'positive' as const },
    { id: '2', label: '专注听讲', category: '课堂表现', type: 'positive' as const },
    { id: '3', label: '主动思考', category: '课堂表现', type: 'positive' as const },
    { id: '4', label: '帮助同学', category: '同伴相处', type: 'positive' as const },
    { id: '5', label: '课堂分心', category: '课堂表现', type: 'negative' as const },
  ];
  return <main className="preview-workspace">
    <div className="preview-toolbar"><span>{PET_STAGE_LABELS[stage]} · lv{getPetGrowth(score + extra).level}</span></div>
    <h2 className="preview-section-title">列表卡片</h2>
    <div className="preview-list">
      <ClassroomPetCard student={student} layout={layout.studentCard} displaySettings={settings} growthScore={score + extra}
        evolution={{ artworkScore: score, status: 'generating' }}
        renderArtwork={artwork => <Artwork size={petLayout.artworkViewportSize}>{artwork}</Artwork>} />
    </div>
    <h2 className="preview-section-title">评价弹窗</h2>
    <div role="group" aria-label="评价弹窗预览" className="arco-modal student-pet-evaluation-modal preview-inline-modal" style={{ width: `min(${layout.evaluation.modalWidth + 240}px, 100%)` }}>
    <StudentPetEvaluationContent visible student={student} praiseScore={score + extra}
      evolution={{ artworkScore: score, status: 'generating' }} categories={['课堂表现', '同伴相处']}
      options={options} tab={tab} layout={layout.evaluation} onTabChange={setTab} onSelect={option => { if (option.type === 'positive') setExtra(value => value + 1); }}
      onManage={() => setManage(true)} onClose={() => {}}
      renderArtwork={artwork => <Artwork size="100%" detail>{artwork}</Artwork>} />
    </div>
    {manage && <div role="dialog" aria-modal="true" aria-label="评价项" className="preview-manager"><div><h2>评价项</h2>{options.map(option => <p key={option.id}>{option.label}</p>)}<button onClick={() => setManage(false)}>返回评价</button></div></div>}
  </main>;
}
createRoot(document.getElementById('evolution-preview-root')!).render(<Preview />);
