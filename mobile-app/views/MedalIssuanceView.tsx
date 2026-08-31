import React, { useMemo, useState } from 'react';
import { Award, BookOpen, Check, ChevronLeft, Heart, Plus, Search, Star, Trophy } from 'lucide-react';
import type { ClassInfo, Student } from '../types';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import CompactSegmentedControl from '../components/ui/CompactSegmentedControl';
import StudentCompactSelectGrid from '../components/student/StudentCompactSelectGrid';
import { DEFAULT_CLASS_MEDALS, DEFAULT_PLATFORM_MEDALS, DEFAULT_SCHOOL_MEDALS, type MedalIconKey, type MedalScope } from '../domain/medal';

interface MedalIssuanceViewProps {
  classInfo: ClassInfo;
  students: Student[];
  onBack: () => void;
}

type SheetMode = 'students' | 'confirm' | null;

const medalIconMap: Record<MedalIconKey, React.ComponentType<{ className?: string }>> = {
  award: Award,
  book: BookOpen,
  heart: Heart,
  star: Star,
  trophy: Trophy,
};

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
  const [newMedalIcon, setNewMedalIcon] = useState<MedalIconKey>('star');

  const medals = scope === 'platform'
      ? DEFAULT_PLATFORM_MEDALS
      : scope === 'school'
        ? DEFAULT_SCHOOL_MEDALS
      : classMedals;
  const selectedMedals = useMemo(
    () => [...DEFAULT_PLATFORM_MEDALS, ...DEFAULT_SCHOOL_MEDALS, ...classMedals].filter(medal => selectedMedalIds.has(medal.id)),
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
  const allVisibleSelected = visibleStudents.length > 0 && visibleStudents.every(student => selectedStudentIds.has(student.id));

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

  const toggleVisibleStudents = () => {
    setSelectedStudentIds(current => {
      const next = new Set(current);
      if (allVisibleSelected) visibleStudents.forEach(student => next.delete(student.id));
      else visibleStudents.forEach(student => next.add(student.id));
      return next;
    });
  };

  const handleScopeChange = (nextScope: MedalScope) => {
    setScope(nextScope);
  };

  const createClassMedal = () => {
    const name = newMedalName.trim();
    if (!name) return;
    setClassMedals(current => [...current, {
      id: `class-custom-${Date.now()}`,
      name,
      scope: 'class',
      icon: newMedalIcon,
      quantity: 1,
    }]);
    setNewMedalName('');
    setNewMedalIcon('star');
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
  const selectedStudentNames = selectedStudents.slice(0, 4).map(student => student.name).join('、');

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回班级列表"><ChevronLeft className="h-5 w-5" /></button>
        <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">颁发奖章</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-4)] pb-24 pt-[var(--tm-space-4)] no-scrollbar">
        <CompactSegmentedControl
          value={scope}
          onChange={handleScopeChange}
          ariaLabel="奖章分类"
          fullWidth
          density="compact"
          motion="sliding"
          semantics="tabs"
          className="mb-[var(--tm-space-4)] w-full"
          items={[
            { value: 'platform', label: '平台奖章' },
            { value: 'school', label: '学校奖章' },
            { value: 'class', label: '班级奖章' },
          ]}
        />

        <div className="grid grid-cols-3 gap-[var(--tm-space-2)]" role="list" aria-label="可选奖章">
          {medals.map((medal, index) => {
            const selected = selectedMedalIds.has(medal.id);
            const Icon = medalIconMap[medal.icon];
            const medalIconClassName = [
              'flex h-11 w-11 shrink-0 items-center justify-center rounded-full',
              selected ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-reward-strong)]' : 'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward)]',
            ].join(' ');
            const medalCardClassName = [
              'relative flex min-h-[100px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-[var(--tm-radius-card)] px-2 py-2.5 text-center [box-shadow:var(--tm-shadow-card)] transition active:scale-[0.98]',
              medals.length === 4 && index === 3 ? 'col-start-2' : '',
              selected ? 'bg-[var(--tm-brand-reward-soft)] ring-2 ring-inset ring-[var(--tm-brand-reward)]' : 'bg-[var(--tm-bg-surface)]',
            ].filter(Boolean).join(' ');
            return (
              <button key={medal.id} type="button" onClick={() => toggleMedal(medal.id)} aria-pressed={selected} className={medalCardClassName}>
                <span className={medalIconClassName}><Icon className="h-5 w-5" /></span>
                <span className="w-full truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{medal.name}</span>
                {selected && <Check className="absolute right-2 top-2 h-4 w-4 text-[var(--tm-brand-reward-strong)]" aria-hidden="true" />}
              </button>
            );
          })}
          {scope === 'class' && (
            <button type="button" onClick={() => setShowCreateMedal(true)} className="relative flex min-h-[100px] min-w-0 flex-col items-center justify-center gap-1.5 rounded-[var(--tm-radius-card)] border border-dashed border-[var(--tm-border-control)] px-2 py-2.5 text-center text-[var(--tm-text-secondary)] transition active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)]">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface-soft)]"><Plus className="h-5 w-5" /></span>
              <span className="w-full truncate text-[length:var(--tm-font-size-compact)] font-semibold">新增奖章</span>
            </button>
          )}
        </div>
      </div>

      <footer className="absolute inset-x-0 bottom-0 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-4)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)] backdrop-blur-xl">
        <button type="button" disabled={selectedMedalIds.size === 0} onClick={() => selectedStudentIds.size > 0 ? setSheetMode('confirm') : setSheetMode('students')} className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-4 text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">{selectedStudentIds.size > 0 ? '确认颁发' : '选择学生'}</button>
      </footer>

      <MobileBottomSheet open={sheetMode === 'students'} title="选择学生" size="full" onClose={() => setSheetMode(null)} footer={(
        <button type="button" disabled={selectedStudentIds.size === 0} onClick={() => setSheetMode(null)} className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">完成</button>
      )}>
        <div className="space-y-3">
          <label className="flex h-[var(--tm-size-touch)] items-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3 text-[var(--tm-text-tertiary)]"><Search className="h-4 w-4 shrink-0" /><input value={studentSearch} onChange={event => setStudentSearch(event.target.value)} placeholder="搜索姓名或学号" aria-label="搜索学生" className="min-w-0 flex-1 bg-transparent text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)]" /></label>
          <div className="flex items-center justify-end"><button type="button" onClick={toggleVisibleStudents} disabled={visibleStudents.length === 0} className="min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] px-3 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)] disabled:text-[var(--tm-text-disabled)]">{allVisibleSelected ? '取消全选' : '全选当前'}</button></div>
          {visibleStudents.length > 0 ? <StudentCompactSelectGrid sections={[{ id: classInfo.id, students: visibleStudents }]} isSelected={studentId => selectedStudentIds.has(studentId)} onToggle={toggleStudent} /> : <div className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] p-8 text-center text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)]">没有找到匹配的学生</div>}
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet open={sheetMode === 'confirm'} title="确认颁发" onClose={() => setSheetMode(null)} footer={(
        <button type="button" onClick={issueMedals} className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)]"><Award className="h-[18px] w-[18px]" />确认颁发</button>
      )}>
        <div className="space-y-3">
          <div className="rounded-[var(--tm-radius-card)] bg-[var(--tm-brand-reward-soft)] p-4"><div className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-tertiary)]">奖章</div><div className="mt-1 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{selectedMedalNames}</div></div>
          <div className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] p-4"><div className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-tertiary)]">发放对象</div><div className="mt-1 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{selectedStudentNames}{selectedStudents.length > 4 ? '等' : ''}</div></div>
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
              {(Object.keys(medalIconMap) as MedalIconKey[]).map(iconKey => {
                const Icon = medalIconMap[iconKey];
                const selected = newMedalIcon === iconKey;
                return <button key={iconKey} type="button" aria-label={`选择${iconKey}图标`} aria-pressed={selected} onClick={() => setNewMedalIcon(iconKey)} className={`flex h-[var(--tm-size-touch)] items-center justify-center rounded-[var(--tm-radius-control)] ${selected ? 'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)] ring-2 ring-inset ring-[var(--tm-brand-reward)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]'}`}><Icon className="h-5 w-5" /></button>;
              })}
            </div>
          </fieldset>
        </div>
      </MobileBottomSheet>

      {feedback && <div role="status" className="pointer-events-none absolute inset-x-4 top-[calc(var(--tm-size-touch)+var(--tm-space-4))] z-50 flex min-h-[var(--tm-size-touch)] items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-chart-tooltip)] px-4 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-floating)]"><Check className="h-4 w-4" />{feedback}</div>}
    </div>
  );
};

export default MedalIssuanceView;
