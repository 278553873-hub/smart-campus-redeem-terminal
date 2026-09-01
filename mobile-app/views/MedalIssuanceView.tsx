import React, { useMemo, useState } from 'react';
import { Award, Check, ChevronLeft, ImagePlus, Plus } from 'lucide-react';
import type { ClassInfo, Student } from '../types';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import MobileStudentPickerSheet from '../components/student/MobileStudentPickerSheet';
import MobileSelectionIndicator from '../components/student/MobileSelectionIndicator';
import MedalIconView from '../components/medal/MedalIcon';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import { ASSETS } from '../assets/images';
import { DEFAULT_ACTIVITY_MEDALS, DEFAULT_CLASS_MEDALS, DEFAULT_DAILY_MEDALS, DEFAULT_PLATFORM_MEDALS, DEFAULT_SEMESTER_MEDALS, DEFAULT_SCHOOL_MEDALS, type MedalIcon, type MedalScope } from '../domain/medal';

interface MedalIssuanceViewProps {
  classInfo: ClassInfo;
  students: Student[];
  onBack: () => void;
}

type SheetMode = 'students' | 'confirm' | null;

const PLATFORM_MEDAL_IMAGE_ASSETS: Record<string, string> = {
  'platform-deyu-star': ASSETS.MEDALS.PLATFORM_DEYU_STAR,
  'platform-zhiyu-star': ASSETS.MEDALS.PLATFORM_ZHIYU_STAR,
  'platform-tiyu-star': ASSETS.MEDALS.PLATFORM_TIYU_STAR,
  'platform-meiyu-star': ASSETS.MEDALS.PLATFORM_MEIYU_STAR,
  'platform-laoyu-star': ASSETS.MEDALS.PLATFORM_LAOYU_STAR,
  'platform-three-good-student': ASSETS.MEDALS.SEMESTER_THREE_GOOD,
  'platform-excellent-cadre': ASSETS.MEDALS.SEMESTER_CADRE,
  'platform-excellent-young-pioneer': ASSETS.MEDALS.SEMESTER_YOUNG_PIONEER,
  'platform-excellent-student': ASSETS.MEDALS.SEMESTER_EXCELLENT_STUDENT,
  'platform-progress-star': ASSETS.MEDALS.DAILY_PROGRESS,
  'platform-diligent-star': ASSETS.MEDALS.DAILY_DILIGENT,
  'platform-civilized-star': ASSETS.MEDALS.DAILY_CIVILIZED,
  'platform-disciplined-star': ASSETS.MEDALS.DAILY_DISCIPLINED,
  'platform-friendly-star': ASSETS.MEDALS.DAILY_FRIENDLY,
  'platform-sports-talent': ASSETS.MEDALS.ACTIVITY_SPORTS,
  'platform-art-talent': ASSETS.MEDALS.ACTIVITY_ART,
  'platform-tech-talent': ASSETS.MEDALS.ACTIVITY_TECH,
  'platform-reading-talent': ASSETS.MEDALS.ACTIVITY_READING,
  'platform-performance-talent': ASSETS.MEDALS.ACTIVITY_PERFORMANCE,
};

const PLATFORM_MEDALS = [...DEFAULT_PLATFORM_MEDALS, ...DEFAULT_SEMESTER_MEDALS, ...DEFAULT_DAILY_MEDALS, ...DEFAULT_ACTIVITY_MEDALS];
const PLATFORM_MEDAL_GROUPS = [
  { id: 'daily', label: '日常激励', medals: DEFAULT_DAILY_MEDALS },
  { id: 'activity', label: '活动特长', medals: DEFAULT_ACTIVITY_MEDALS },
  { id: 'honors', label: '综合荣誉', medals: DEFAULT_SEMESTER_MEDALS },
  { id: 'five-education', label: '五育之星', medals: DEFAULT_PLATFORM_MEDALS },
] as const;

const MedalIssuanceView: React.FC<MedalIssuanceViewProps> = ({ classInfo, students, onBack }) => {
  const [scope, setScope] = useState<MedalScope>('platform');
  const [classMedals, setClassMedals] = useState(DEFAULT_CLASS_MEDALS);
  const [selectedMedalIds, setSelectedMedalIds] = useState<Set<string>>(new Set());
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [feedback, setFeedback] = useState('');
  const [showCreateMedal, setShowCreateMedal] = useState(false);
  const [newMedalName, setNewMedalName] = useState('');
  const [newMedalIconId, setNewMedalIconId] = useState<string | null>(PLATFORM_MEDALS[0].id);
  const [newMedalUploadedIcon, setNewMedalUploadedIcon] = useState<string | null>(null);

  const medals = scope === 'class' ? classMedals : [];
  const schoolMedals = DEFAULT_SCHOOL_MEDALS;
  const resolveMedalIcon = (medalId: string, icon: MedalIcon): MedalIcon => (
    PLATFORM_MEDAL_IMAGE_ASSETS[medalId]
      ? { type: 'image' as const, src: PLATFORM_MEDAL_IMAGE_ASSETS[medalId], alt: '' }
      : icon
  );
  const selectedNewMedal = PLATFORM_MEDALS.find(medal => medal.id === newMedalIconId) ?? PLATFORM_MEDALS[0];
  const selectedMedals = useMemo(
    () => [...PLATFORM_MEDALS, ...schoolMedals, ...classMedals].filter(medal => selectedMedalIds.has(medal.id)),
    [classMedals, selectedMedalIds],
  );
  const activeStudents = useMemo(() => students.filter(student => (student.status ?? 'active') === 'active'), [students]);
  const visibleStudents = useMemo(() => {
    const query = studentSearch.trim().toLowerCase();
    if (!query) return activeStudents;
    return activeStudents.filter(student => (
      student.name.toLowerCase().includes(query)
      || (student.studentNo ?? student.id).toLowerCase().includes(query)
    ));
  }, [activeStudents, studentSearch]);
  const selectedStudents = useMemo(
    () => activeStudents.filter(student => selectedStudentIds.has(student.id)),
    [activeStudents, selectedStudentIds],
  );
  const allStudentsSelected = activeStudents.length > 0 && activeStudents.every(student => selectedStudentIds.has(student.id));

  const toggleMedal = (medalId: string) => {
    setSelectedMedalIds(current => {
      const next = new Set(current);
      if (next.has(medalId)) next.delete(medalId);
      else next.add(medalId);
      return next;
    });
  };

  const toggleStudent = (studentId: string) => {
    setSelectedStudentIds(current => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleAllStudents = () => {
    setSelectedStudentIds(current => {
      const next = new Set(current);
      if (allStudentsSelected) activeStudents.forEach(student => next.delete(student.id));
      else activeStudents.forEach(student => next.add(student.id));
      return next;
    });
  };

  const handleScopeChange = (nextScope: MedalScope) => {
    setScope(nextScope);
  };

  const handleMedalIconUpload = (file: File | undefined) => {
    if (!file || !file.type.startsWith('image/')) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      setNewMedalUploadedIcon(reader.result);
      setNewMedalIconId(null);
    };
    reader.readAsDataURL(file);
  };

  const createClassMedal = () => {
    const name = newMedalName.trim();
    if (!name) return;
    setClassMedals(current => [...current, {
      id: `class-custom-${Date.now()}`,
      name,
      scope: 'class',
      icon: newMedalUploadedIcon
        ? { type: 'image' as const, src: newMedalUploadedIcon, alt: '' }
        : resolveMedalIcon(selectedNewMedal.id, selectedNewMedal.icon),
      quantity: 1,
    }]);
    setNewMedalName('');
    setNewMedalIconId(PLATFORM_MEDALS[0].id);
    setNewMedalUploadedIcon(null);
    setShowCreateMedal(false);
  };

  const issueMedals = () => {
    if (selectedMedals.length === 0 || selectedStudents.length === 0) return;
    setSelectedStudentIds(new Set());
    setSelectedMedalIds(new Set());
    setSheetMode(null);
    setFeedback('颁发成功');
    window.setTimeout(() => setFeedback(''), 1800);
  };

  const selectedMedalNames = selectedMedals.map(medal => medal.name).join('、');

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-surface)]">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回班级列表"><ChevronLeft className="h-5 w-5" /></button>
        <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">颁发奖章</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-[calc(var(--tm-size-touch)+var(--tm-space-8)+var(--tm-space-8)+var(--tm-space-4))] no-scrollbar">
        <div className="sticky top-0 z-30 -mx-[var(--tm-space-4)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] pb-[var(--tm-space-3)] pt-[var(--tm-space-4)]">
          <CompactSegmentedControl
            value={scope}
            onChange={handleScopeChange}
            ariaLabel="奖章分类"
            fullWidth
            motion="sliding"
            semantics="tabs"
            className="w-full"
            items={[
              { value: 'platform', label: '平台奖章' },
              { value: 'school', label: '学校奖章' },
              { value: 'class', label: '班级奖章' },
            ]}
          />
        </div>

        {scope === 'platform' && (
          <div className="space-y-5" aria-label="平台奖章分类">
            {PLATFORM_MEDAL_GROUPS.map(group => (
              <section key={group.id} aria-labelledby={`medal-group-${group.id}`}>
                <h2 id={`medal-group-${group.id}`} className="mb-2 text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-text-secondary)]">{group.label}</h2>
                <div className="grid grid-flow-row grid-cols-4 gap-[var(--tm-space-1)]" role="list" aria-label={`${group.label}奖章`}>
                  {group.medals.map(medal => {
                  const selected = selectedMedalIds.has(medal.id);
                  const medalCardClassName = [
                    'relative flex min-h-[var(--tm-medal-grid-item-min-height)] min-w-0 flex-col items-center justify-center rounded-[var(--tm-radius-control)] border border-transparent px-0 py-[var(--tm-space-2)] text-center [gap:var(--tm-space-1)] transition active:scale-[0.98]',
                  ].join(' ');
                  return (
                    <button key={medal.id} type="button" onClick={() => toggleMedal(medal.id)} aria-pressed={selected} className={medalCardClassName}>
                      <span className="relative flex h-[var(--tm-medal-grid-icon-size)] w-[var(--tm-medal-grid-icon-size)] shrink-0 items-center justify-center"><MedalIconView icon={resolveMedalIcon(medal.id, medal.icon)} className="h-[var(--tm-medal-grid-icon-size)] w-[var(--tm-medal-grid-icon-size)] shrink-0 text-[var(--tm-brand-reward)]" /><MobileSelectionIndicator selected={selected} showUnselected={false} className="absolute -right-1 -top-1" /></span>
                      <span className="w-full truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{medal.name}</span>
                    </button>
                  );
                })}
                </div>
              </section>
            ))}
          </div>
        )}

        {scope === 'school' && (
          <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.BOX_CLIPBOARD} title="请联系学校管理员添加" className="min-h-[360px]" imageClassName="w-[58%] min-w-[152px] max-w-[196px]" />
        )}

        {scope === 'class' && <div className="grid grid-flow-row grid-cols-4 gap-[var(--tm-space-1)]" role="list" aria-label="班级奖章">
          {medals.map(medal => {
            const selected = selectedMedalIds.has(medal.id);
            const medalCardClassName = [
              'relative flex min-h-[var(--tm-medal-grid-item-min-height)] min-w-0 flex-col items-center justify-center rounded-[var(--tm-radius-control)] border border-transparent px-0 py-[var(--tm-space-2)] text-center [gap:var(--tm-space-1)] transition active:scale-[0.98]',
            ].filter(Boolean).join(' ');
            return (
              <button key={medal.id} type="button" onClick={() => toggleMedal(medal.id)} aria-pressed={selected} className={medalCardClassName}>
                <span className="relative flex h-[var(--tm-medal-grid-icon-size)] w-[var(--tm-medal-grid-icon-size)] shrink-0 items-center justify-center"><MedalIconView icon={resolveMedalIcon(medal.id, medal.icon)} className="h-[var(--tm-medal-grid-icon-size)] w-[var(--tm-medal-grid-icon-size)] shrink-0 text-[var(--tm-brand-reward)]" /><MobileSelectionIndicator selected={selected} showUnselected={false} className="absolute -right-1 -top-1" /></span>
                <span className="w-full truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{medal.name}</span>
              </button>
            );
          })}
          {scope === 'class' && (
            <button type="button" onClick={() => setShowCreateMedal(true)} className="relative flex min-h-[var(--tm-medal-grid-item-min-height)] min-w-0 flex-col items-center justify-center px-0 py-[var(--tm-space-2)] text-center text-[var(--tm-text-secondary)] [gap:var(--tm-space-1)] transition active:scale-[0.98] active:text-[var(--tm-text-primary)]">
              <span className="flex h-[var(--tm-medal-grid-icon-size)] w-[var(--tm-medal-grid-icon-size)] shrink-0 items-center justify-center"><Plus className="h-7 w-7" /></span>
              <span className="w-full truncate text-[length:var(--tm-font-size-compact)] font-semibold">新增奖章</span>
            </button>
          )}
        </div>}
      </div>

      <footer className="absolute inset-x-0 bottom-0 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-4)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)] backdrop-blur-xl">
        {selectedMedals.length > 0 && (
          <div aria-live="polite" className="mb-[var(--tm-space-2)] flex min-h-6 items-center gap-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold">
            <span className="shrink-0 text-[var(--tm-brand-primary)]">已选 {selectedMedals.length} 枚</span>
            <span className="min-w-0 flex-1 overflow-x-auto whitespace-nowrap text-[var(--tm-text-secondary)] no-scrollbar">{selectedMedalNames}</span>
          </div>
        )}
        <button type="button" disabled={selectedMedalIds.size === 0} onClick={() => setSheetMode('students')} className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-4 text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">选择学生</button>
      </footer>

      <MobileStudentPickerSheet
        open={sheetMode === 'students'}
        title="选择学生"
        onClose={() => setSheetMode(null)}
        searchValue={studentSearch}
        onSearchChange={event => setStudentSearch(event.target.value)}
        sections={[{ id: classInfo.id, students: visibleStudents }]}
        isSelected={studentId => selectedStudentIds.has(studentId)}
        onToggle={toggleStudent}
        emptyImageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER}
        emptyTitle="没有匹配的学生"
        selectAllAction={{
          allSelected: allStudentsSelected,
          disabled: activeStudents.length === 0,
          onToggle: toggleAllStudents,
        }}
        footer={(
          <button type="button" disabled={selectedStudentIds.size === 0} onClick={() => setSheetMode('confirm')} className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-4 text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">
            {selectedStudentIds.size > 0 ? `颁发奖章（${selectedStudentIds.size}人）` : '颁发奖章'}
          </button>
        )}
      />

      <MobileBottomSheet open={sheetMode === 'confirm'} title="确认发放" onClose={() => setSheetMode(null)} footer={(
        <div className="grid grid-cols-2 gap-[var(--tm-space-3)]">
          <button type="button" onClick={() => setSheetMode('students')} className="flex min-h-[var(--tm-size-touch)] items-center justify-center gap-[var(--tm-space-1)] rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]"><ChevronLeft className="h-4 w-4" />返回修改</button>
          <button type="button" onClick={issueMedals} className="flex min-h-[var(--tm-size-touch)] items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-3 text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)]"><Award className="h-[18px] w-[18px]" />确认发放</button>
        </div>
      )}>
        <div className="space-y-[var(--tm-space-5)] pb-[var(--tm-space-2)]">
          <section aria-labelledby="confirm-medals-title">
            <div className="flex items-center justify-between gap-[var(--tm-space-3)]">
              <h3 id="confirm-medals-title" className="text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-primary)]">发放奖章</h3>
              <span className="shrink-0 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-tertiary)]">{selectedMedals.length}枚</span>
            </div>
            <div className="mt-[var(--tm-space-3)] grid grid-cols-2 gap-x-[var(--tm-space-4)] gap-y-[var(--tm-space-3)]">
              {selectedMedals.map(medal => (
                <div key={medal.id} className="flex min-w-0 items-center gap-[var(--tm-space-2)]">
                  <MedalIconView icon={resolveMedalIcon(medal.id, medal.icon)} className="h-9 w-9 shrink-0" />
                  <span className="min-w-0 truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{medal.name}</span>
                </div>
              ))}
            </div>
          </section>
          <section aria-labelledby="confirm-students-title" className="border-t border-[var(--tm-border-subtle)] pt-[var(--tm-space-4)]">
            <div className="flex items-center justify-between gap-[var(--tm-space-3)]">
              <h3 id="confirm-students-title" className="text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-primary)]">发放学生</h3>
              <span className="shrink-0 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-tertiary)]">{selectedStudents.length}人</span>
            </div>
            <div className="mt-[var(--tm-space-3)] grid grid-cols-3 gap-x-[var(--tm-space-3)] gap-y-[var(--tm-space-2)]" role="list" aria-label="待发放学生">
              {selectedStudents.map(student => <span key={student.id} role="listitem" className="min-w-0 break-words text-center text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-primary)]">{student.name}</span>)}
            </div>
          </section>
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet open={showCreateMedal} title="新增班级奖章" onClose={() => setShowCreateMedal(false)} footer={(
        <button type="button" disabled={!newMedalName.trim()} onClick={createClassMedal} className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">保存奖章</button>
      )}>
        <div className="space-y-4">
          <label className="block space-y-2">
            <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">奖章名称</span>
            <input value={newMedalName} onChange={event => setNewMedalName(event.target.value)} maxLength={12} placeholder="请输入奖章名称" aria-label="奖章名称" className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-input-bg)] px-3 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)]" />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">选择图标</legend>
            <div className="grid grid-cols-5 gap-2">
              {PLATFORM_MEDALS.map(platformMedal => {
                const selected = !newMedalUploadedIcon && selectedNewMedal.id === platformMedal.id;
                return <button key={platformMedal.id} type="button" aria-label={`选择${platformMedal.name}图标`} aria-pressed={selected} onClick={() => { setNewMedalIconId(platformMedal.id); setNewMedalUploadedIcon(null); }} className={`flex min-h-[var(--tm-size-touch)] items-center justify-center rounded-[var(--tm-radius-control)] px-1 ${selected ? 'bg-[var(--tm-brand-reward-soft)] ring-2 ring-inset ring-[var(--tm-brand-reward)]' : 'bg-[var(--tm-bg-surface-soft)]'}`}><MedalIconView icon={resolveMedalIcon(platformMedal.id, platformMedal.icon)} className="h-9 w-9" /></button>;
              })}
              <label className={`relative flex min-h-[var(--tm-size-touch)] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[var(--tm-radius-control)] px-1 text-[var(--tm-text-secondary)] ${newMedalUploadedIcon ? 'bg-[var(--tm-brand-reward-soft)] ring-2 ring-inset ring-[var(--tm-brand-reward)]' : 'bg-[var(--tm-bg-surface-soft)]'}`}>
                {newMedalUploadedIcon ? <img src={newMedalUploadedIcon} alt="已上传图标" className="h-9 w-9 object-contain" /> : <ImagePlus className="h-5 w-5" aria-hidden="true" />}
                <span className="text-[10px] font-semibold leading-4">上传图片</span>
                <input type="file" accept="image/*" className="sr-only" aria-label="上传奖章图标" onChange={event => handleMedalIconUpload(event.target.files?.[0])} />
              </label>
            </div>
          </fieldset>
        </div>
      </MobileBottomSheet>

      {feedback && <div role="status" className="pointer-events-none absolute inset-x-4 top-[calc(var(--tm-size-touch)+var(--tm-space-4))] z-50 flex min-h-[var(--tm-size-touch)] items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-chart-tooltip)] px-4 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-floating)]"><Check className="h-4 w-4" />{feedback}</div>}
    </div>
  );
};

export default MedalIssuanceView;
