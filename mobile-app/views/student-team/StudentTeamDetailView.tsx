import React, { useMemo, useState } from 'react';
import { Eye } from 'lucide-react';
import type { SchoolStudentTeam, Student, StudentCardDisplaySettings } from '../../types';
import { BackIcon, FemaleIcon, MaleIcon, MenuIcon, SearchIcon } from '../../components/Icons';
import StudentRosterCard from '../../components/student/StudentRosterCard';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import MobileSearchInput from '../../components/ui/MobileSearchInput';
import CardLevelDisplaySettings from '../../components/student-performance/CardLevelDisplaySettings';
import CardEvaluationDisplaySettings from '../../components/student-performance/CardEvaluationDisplaySettings';
import { ASSETS } from '../../assets/images';
import { createDemoStudentPerformanceSummary, type StudentPerformanceSummary } from '../../domain/studentPerformance';
import { getStudentCardDisplaySettings } from '../../domain/studentCardDisplay';

interface StudentTeamDetailViewProps {
  team: SchoolStudentTeam;
  students: Student[];
  onBack: () => void;
  onSelectStudent: (student: Student) => void;
  isSelectionMode: boolean;
  onToggleSelectionMode: () => void;
  selectedIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
  performanceByStudentId?: Record<string, StudentPerformanceSummary>;
}

const StudentTeamDetailView: React.FC<StudentTeamDetailViewProps> = ({
  team,
  students,
  onBack,
  onSelectStudent,
  isSelectionMode,
  onToggleSelectionMode,
  selectedIds,
  onSelectionChange,
  performanceByStudentId = {},
}) => {
  const [query, setQuery] = useState('');
  const [showMore, setShowMore] = useState(false);
  const [showCardSettings, setShowCardSettings] = useState(false);
  const [displaySettings, setDisplaySettings] = useState<StudentCardDisplaySettings>(() => getStudentCardDisplaySettings());
  const normalizedQuery = query.trim().replace(/\s+/g, '').toLowerCase();
  const visibleStudents = useMemo(() => students.filter(student => (
    !normalizedQuery
    || student.name.replace(/\s+/g, '').toLowerCase().includes(normalizedQuery)
    || (student.studentNo ?? '').toLowerCase().includes(normalizedQuery)
  )), [normalizedQuery, students]);
  const studentsByGender = useMemo(() => ({
    male: students.filter(student => student.gender === 'male'),
    female: students.filter(student => student.gender === 'female'),
  }), [students]);
  const isAllVisibleSelected = visibleStudents.length > 0 && visibleStudents.every(student => selectedIds.has(student.id));
  const isMaleQuickSelectionActive = studentsByGender.male.length > 0
    && selectedIds.size === studentsByGender.male.length
    && studentsByGender.male.every(student => selectedIds.has(student.id));
  const isFemaleQuickSelectionActive = studentsByGender.female.length > 0
    && selectedIds.size === studentsByGender.female.length
    && studentsByGender.female.every(student => selectedIds.has(student.id));
  const toggleStudent = (studentId: string) => {
    const next = new Set(selectedIds);
    if (next.has(studentId)) next.delete(studentId);
    else next.add(studentId);
    onSelectionChange(next);
  };

  const selectAllVisible = () => {
    const next = new Set(selectedIds);
    visibleStudents.forEach(student => next.add(student.id));
    onSelectionChange(next);
  };

  const clearVisible = () => {
    const visibleIds = new Set(visibleStudents.map(student => student.id));
    onSelectionChange(new Set(Array.from(selectedIds).filter(id => !visibleIds.has(id))));
  };

  const invertVisible = () => {
    const next = new Set(selectedIds);
    visibleStudents.forEach(student => {
      if (next.has(student.id)) next.delete(student.id);
      else next.add(student.id);
    });
    onSelectionChange(next);
  };

  const toggleGender = (gender: Student['gender']) => {
    const genderStudents = studentsByGender[gender];
    const active = gender === 'male' ? isMaleQuickSelectionActive : isFemaleQuickSelectionActive;
    onSelectionChange(active ? new Set() : new Set(genderStudents.map(student => student.id)));
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <header className="relative z-10 flex h-11 shrink-0 items-center justify-between bg-[var(--tm-page-plain-header-bg)] px-4 [padding-right:var(--mini-program-capsule-right-inset,16px)]">
        <button type="button" onClick={onBack} aria-label="返回社团与团队" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
          <BackIcon className="h-5 w-5 text-[var(--tm-text-secondary)]" />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 max-w-[52%] -translate-x-1/2 truncate text-[17px] font-semibold text-[var(--tm-text-primary)]">{team.name}</h1>
        <div className="h-11 w-11" aria-hidden="true" />
      </header>

      <div className="student-action-row sticky top-0 z-10 flex min-h-[52px] shrink-0 items-center gap-1.5 bg-[var(--tm-bg-surface)] px-4 py-1">
        <div className={`relative text-left transition-all duration-300 ease-out ${isSelectionMode ? 'w-11 flex-none opacity-70' : 'min-w-0 flex-1 opacity-100'}`}>
          {isSelectionMode ? (
            <button type="button" onClick={onToggleSelectionMode} aria-label="恢复搜索" className="flex h-11 w-11 items-center justify-center rounded-full">
              <span className="flex h-9 w-9 items-center justify-center rounded-full border border-[var(--tm-border-subtle)] bg-white [box-shadow:var(--tm-shadow-control)]"><SearchIcon className="h-4 w-4 text-[var(--tm-text-disabled)]" /></span>
            </button>
          ) : (
            <MobileSearchInput value={query} onChange={event => setQuery(event.target.value)} placeholder="搜索姓名、学号" aria-label="搜索团队学生" density="compact" appearance="filled" containerClassName="flex min-h-11 items-center" />
          )}
        </div>

        <div className="selection-tools-next-to-cancel ml-auto flex shrink-0 items-center gap-1">
          {isSelectionMode && (
            <>
              <button type="button" onClick={isAllVisibleSelected ? clearVisible : selectAllVisible} className="flex min-h-11 shrink-0 items-center justify-center p-0 text-[13px] font-semibold text-[var(--tm-text-secondary)]"><span className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--tm-border-subtle)] bg-white px-3 [box-shadow:var(--tm-shadow-control)]">{isAllVisibleSelected ? '取消全选' : '全选'}</span></button>
              <button type="button" onClick={invertVisible} className="flex min-h-11 shrink-0 items-center justify-center p-0 text-[13px] font-semibold text-[var(--tm-text-secondary)]"><span className="inline-flex h-8 items-center justify-center rounded-full border border-[var(--tm-border-subtle)] bg-white px-3 [box-shadow:var(--tm-shadow-control)]">反选</span></button>
              <button type="button" onClick={() => toggleGender('male')} aria-label={isMaleQuickSelectionActive ? '取消全选男生' : '全选男生'} aria-pressed={isMaleQuickSelectionActive} className="flex h-11 w-11 shrink-0 items-center justify-center"><span className={`flex h-8 w-10 items-center justify-center rounded-full border transition-colors [transition-duration:var(--tm-duration-standard)] [box-shadow:var(--tm-shadow-control)] ${isMaleQuickSelectionActive ? 'border-[var(--tm-gender-male-selection-bg)] bg-[var(--tm-gender-male-selection-bg)] text-white' : 'border-[var(--tm-border-subtle)] bg-white text-[var(--tm-gender-male)]'}`}><MaleIcon className="h-4 w-4" /></span></button>
              <button type="button" onClick={() => toggleGender('female')} aria-label={isFemaleQuickSelectionActive ? '取消全选女生' : '全选女生'} aria-pressed={isFemaleQuickSelectionActive} className="flex h-11 w-11 shrink-0 items-center justify-center"><span className={`flex h-8 w-10 items-center justify-center rounded-full border transition-colors [transition-duration:var(--tm-duration-standard)] [box-shadow:var(--tm-shadow-control)] ${isFemaleQuickSelectionActive ? 'border-[var(--tm-gender-female-selection-bg)] bg-[var(--tm-gender-female-selection-bg)] text-white' : 'border-[var(--tm-border-subtle)] bg-white text-[var(--tm-gender-female)]'}`}><FemaleIcon className="h-4 w-4" /></span></button>
            </>
          )}
          <button type="button" onClick={() => { if (!isSelectionMode) setQuery(''); onToggleSelectionMode(); }} className={`min-h-11 shrink-0 rounded-[var(--tm-radius-control)] px-2.5 text-[13px] font-semibold ${isSelectionMode ? 'text-[var(--tm-text-secondary)]' : 'text-[var(--tm-text-primary)]'}`}>{isSelectionMode ? '取消' : '多选'}</button>
          {!isSelectionMode && students.length > 0 && (
            <button type="button" onClick={() => setShowMore(true)} aria-label="学生更多操作" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)] active:text-[var(--tm-text-primary)]">
              <MenuIcon className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <main className="min-h-0 flex-1 overflow-y-auto px-3 pb-40 pt-3 no-scrollbar">
        <div className="student-roster-grid grid shrink-0 gap-x-2.5 gap-y-3">
          {visibleStudents.map((student, index) => (
            <StudentRosterCard
              key={student.id}
              student={student}
              index={index}
              performance={performanceByStudentId[student.id] ?? createDemoStudentPerformanceSummary(student)}
              displaySettings={displaySettings}
              showSelection={isSelectionMode}
              selected={selectedIds.has(student.id)}
              onClick={() => isSelectionMode ? toggleStudent(student.id) : onSelectStudent(student)}
            />
          ))}
        </div>

        {visibleStudents.length === 0 && (
          <MobileEmptyState imageSrc={normalizedQuery ? ASSETS.DEFAULT_STATE.MAGNIFIER : ASSETS.DEFAULT_STATE.CHAIR} title={normalizedQuery ? '没有匹配的学生' : '暂无成员'} className="min-h-[420px]" />
        )}
      </main>

      <MobileBottomSheet open={showMore} title="更多操作" onClose={() => setShowMore(false)}>
        <div className="space-y-1 pb-2">
          <button type="button" onClick={() => { setShowMore(false); setShowCardSettings(true); }} className="flex min-h-[56px] w-full items-center gap-3 rounded-[var(--tm-radius-inner)] px-3 text-left text-[14px] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]"><Eye className="h-5 w-5 text-[var(--tm-action-icon-neutral)]" />学生卡片展示</button>
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet open={showCardSettings} title="学生卡片展示" onClose={() => setShowCardSettings(false)}>
        <div className="space-y-[var(--tm-space-4)] pb-2">
          <CardLevelDisplaySettings
            showLevel={displaySettings.showLevel}
            levelForm={displaySettings.levelForm}
            onChange={({ showLevel, levelForm }) => setDisplaySettings(current => ({ ...current, showLevel, levelForm }))}
          />
          <CardEvaluationDisplaySettings
            settings={displaySettings}
            onChange={settings => setDisplaySettings(current => ({ ...current, ...settings }))}
          />
        </div>
      </MobileBottomSheet>

    </div>
  );
};

export default StudentTeamDetailView;
