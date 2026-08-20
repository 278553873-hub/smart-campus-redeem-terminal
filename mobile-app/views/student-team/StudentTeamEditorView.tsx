import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Search } from 'lucide-react';
import type { ClassInfo, SchoolStudentTeam, Student } from '../../types';
import { BackIcon } from '../../components/Icons';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import { ASSETS } from '../../assets/images';

interface StudentTeamEditorViewProps {
  team?: SchoolStudentTeam;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
  onBack: () => void;
  onSave: (value: { name: string; memberIds: string[] }) => void;
}

const StudentTeamEditorView: React.FC<StudentTeamEditorViewProps> = ({
  team,
  classes,
  getStudentsForClass,
  onBack,
  onSave,
}) => {
  const gradeOptions = useMemo(
    () => Array.from(new Set(classes.map(classInfo => classInfo.gradeLevel))),
    [classes],
  );
  const [name, setName] = useState(team?.name ?? '');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(team?.memberIds ?? []));
  const [activeGrade, setActiveGrade] = useState(gradeOptions[0] ?? '');
  const gradeClasses = useMemo(
    () => classes.filter(classInfo => classInfo.gradeLevel === activeGrade),
    [activeGrade, classes],
  );
  const [activeClassId, setActiveClassId] = useState(gradeClasses[0]?.id ?? classes[0]?.id ?? '');
  const [query, setQuery] = useState('');

  useEffect(() => {
    if (gradeClasses.some(classInfo => classInfo.id === activeClassId)) return;
    setActiveClassId(gradeClasses[0]?.id ?? '');
  }, [activeClassId, gradeClasses]);

  const activeClass = classes.find(classInfo => classInfo.id === activeClassId);
  const activeStudents = useMemo(
    () => getStudentsForClass(activeClassId).filter(student => (student.status ?? 'active') === 'active'),
    [activeClassId, getStudentsForClass],
  );
  const normalizedQuery = query.trim().toLowerCase();
  const visibleStudents = useMemo(() => activeStudents.filter(student => (
    !normalizedQuery
    || student.name.toLowerCase().includes(normalizedQuery)
    || (student.studentNo ?? '').toLowerCase().includes(normalizedQuery)
  )), [activeStudents, normalizedQuery]);
  const allActiveSelected = activeStudents.length > 0 && activeStudents.every(student => selectedIds.has(student.id));
  const canSave = name.trim().length > 0 && selectedIds.size > 0;

  const toggleStudent = (studentId: string) => {
    setSelectedIds(current => {
      const next = new Set(current);
      if (next.has(studentId)) next.delete(studentId);
      else next.add(studentId);
      return next;
    });
  };

  const toggleActiveClass = () => {
    setSelectedIds(current => {
      const next = new Set(current);
      activeStudents.forEach(student => {
        if (allActiveSelected) next.delete(student.id);
        else next.add(student.id);
      });
      return next;
    });
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      <header className="relative z-10 flex h-11 shrink-0 items-center justify-between bg-[var(--tm-page-plain-header-bg)] px-4 [padding-right:var(--mini-program-capsule-right-inset,16px)]">
        <button type="button" onClick={onBack} aria-label="返回" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
          <BackIcon className="h-5 w-5 text-[var(--tm-text-secondary)]" />
        </button>
        <h1 className="pointer-events-none absolute left-1/2 -translate-x-1/2 text-[17px] font-semibold text-[var(--tm-text-primary)]">
          {team ? '编辑社团或团队' : '新建社团或团队'}
        </h1>
        <div className="w-11" aria-hidden="true" />
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-28 pt-4 no-scrollbar">
        <label className="block">
          <span className="text-[13px] font-semibold text-[var(--tm-text-secondary)]">名称</span>
          <input
            value={name}
            onChange={event => setName(event.target.value)}
            maxLength={30}
            placeholder="例如篮球社"
            className="mt-2 min-h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-4 text-[15px] font-medium text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]"
          />
        </label>

        <section className="mt-5" aria-labelledby="student-team-members-title">
          <div className="flex min-h-11 items-center justify-between gap-3">
            <h2 id="student-team-members-title" className="text-[15px] font-semibold text-[var(--tm-text-primary)]">成员</h2>
            <span className="text-[13px] font-semibold tabular-nums text-[var(--tm-brand-primary)]">已选 {selectedIds.size} 人</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <label className="relative min-w-0">
              <span className="sr-only">选择年级</span>
              <select
                value={activeGrade}
                onChange={event => {
                  setActiveGrade(event.target.value);
                  setQuery('');
                }}
                className="min-h-11 w-full appearance-none rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 pr-8 text-[13px] font-medium text-[var(--tm-input-text)] outline-none"
              >
                {gradeOptions.map(grade => <option key={grade} value={grade}>{grade}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
            </label>
            <label className="relative min-w-0">
              <span className="sr-only">选择班级</span>
              <select
                value={activeClassId}
                onChange={event => {
                  setActiveClassId(event.target.value);
                  setQuery('');
                }}
                className="min-h-11 w-full appearance-none rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 pr-8 text-[13px] font-medium text-[var(--tm-input-text)] outline-none"
              >
                {gradeClasses.map(classInfo => <option key={classInfo.id} value={classInfo.id}>{classInfo.name}</option>)}
              </select>
              <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
            </label>
          </div>

          <div className="mt-3 flex items-center gap-2">
            <label className="relative min-w-0 flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-disabled)]" />
              <input
                value={query}
                onChange={event => setQuery(event.target.value)}
                placeholder="搜索姓名或学号"
                className="min-h-11 w-full rounded-[var(--tm-radius-control)] border border-transparent bg-[var(--tm-bg-surface)] pl-9 pr-3 text-[13px] text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)] outline-none focus:border-[var(--tm-input-focus-border)]"
              />
            </label>
            <button type="button" onClick={toggleActiveClass} className="min-h-11 shrink-0 rounded-[var(--tm-radius-control)] px-3 text-[13px] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]">
              {allActiveSelected ? '取消全班' : '全选本班'}
            </button>
          </div>

          <div className="mt-3 overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
            {visibleStudents.map((student, index) => {
              const selected = selectedIds.has(student.id);
              return (
                <button
                  key={student.id}
                  type="button"
                  onClick={() => toggleStudent(student.id)}
                  aria-pressed={selected}
                  className={`flex min-h-14 w-full items-center gap-3 px-4 text-left transition-colors active:bg-[var(--tm-bg-surface-soft)] ${index > 0 ? 'border-t border-[var(--tm-border-subtle)]' : ''}`}
                >
                  <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-white' : 'border-[var(--tm-border-control)] bg-white text-transparent'}`}>
                    <Check className="h-3 w-3" strokeWidth={3} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{student.name}</span>
                    <span className="mt-0.5 block truncate text-[12px] text-[var(--tm-text-tertiary)]">{activeClass?.name} · {student.studentNo || '暂无学号'}</span>
                  </span>
                </button>
              );
            })}
            {visibleStudents.length === 0 && (
              <MobileEmptyState
                imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER}
                title="没有匹配的学生"
                className="min-h-64 py-6"
                imageClassName="w-[58%] min-w-[150px] max-w-[190px]"
              />
            )}
          </div>
        </section>
      </main>

      <footer className="absolute inset-x-0 bottom-0 z-20 bg-[var(--tm-bg-surface-glass)] px-4 pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <button
          type="button"
          disabled={!canSave}
          onClick={() => onSave({ name: name.trim(), memberIds: Array.from(selectedIds) })}
          className="flex min-h-12 w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-4 text-[15px] font-semibold text-white active:bg-[var(--tm-brand-primary-pressed)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]"
        >
          {team ? '保存修改' : '完成创建'}
        </button>
      </footer>
    </div>
  );
};

export default StudentTeamEditorView;
