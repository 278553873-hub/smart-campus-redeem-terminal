import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, UserPlus } from 'lucide-react';
import type { ClassInfo, SchoolStudentTeam, Student } from '../../types';
import { BackIcon, CheckIcon, CircleIcon, CloseIcon } from '../../components/Icons';
import StudentCompactSelectGrid from '../../components/student/StudentCompactSelectGrid';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileConfirmSheet from '../../components/ui/MobileConfirmSheet';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import MobileSearchInput from '../../components/ui/MobileSearchInput';
import { ASSETS } from '../../assets/images';

export type StudentTeamEditorMode = 'create' | 'settings' | 'members';
export type StudentTeamEditorValue = {
  name: string;
  memberIds: string[];
  visibility: SchoolStudentTeam['visibility'];
};

interface StudentTeamEditorViewProps {
  open: boolean;
  mode: StudentTeamEditorMode;
  team?: SchoolStudentTeam;
  classes: ClassInfo[];
  allStudents: Student[];
  getStudentsForClass: (classId: string) => Student[];
  onClose: () => void;
  onSave: (value: StudentTeamEditorValue) => void;
}

type EditorPage = 'details' | 'members' | 'exact-search';

const StudentTeamEditorView: React.FC<StudentTeamEditorViewProps> = ({
  open,
  mode,
  team,
  classes,
  allStudents,
  getStudentsForClass,
  onClose,
  onSave,
}) => {
  const gradeOptions = useMemo(() => Array.from(new Set(classes.map(item => item.gradeLevel))), [classes]);
  const classScopeKey = classes.map(item => `${item.id}:${item.gradeLevel}`).join('|');
  const teamDraftKey = team ? `${team.id}:${team.name}:${team.visibility}:${team.memberIds.join(',')}` : '';
  const [page, setPage] = useState<EditorPage>('details');
  const [name, setName] = useState('');
  const [visibility, setVisibility] = useState<SchoolStudentTeam['visibility'] | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeGrade, setActiveGrade] = useState('');
  const [activeClassId, setActiveClassId] = useState('');
  const [classQuery, setClassQuery] = useState('');
  const [exactName, setExactName] = useState('');
  const [submittedExactName, setSubmittedExactName] = useState('');
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  useEffect(() => {
    if (!open) return;
    const initialGrade = Array.from(new Set(classes.map(item => item.gradeLevel)))[0] ?? '';
    const initialClassId = classes.find(item => item.gradeLevel === initialGrade)?.id ?? classes[0]?.id ?? '';
    setPage(mode === 'members' ? 'members' : 'details');
    setName(team?.name ?? '');
    setVisibility(team?.visibility ?? null);
    setSelectedIds(new Set(team?.memberIds ?? []));
    setActiveGrade(initialGrade);
    setActiveClassId(initialClassId);
    setClassQuery('');
    setExactName('');
    setSubmittedExactName('');
    setShowDiscardConfirm(false);
  }, [classScopeKey, mode, open, teamDraftKey]);

  const gradeClasses = useMemo(() => classes.filter(item => item.gradeLevel === activeGrade), [activeGrade, classes]);

  useEffect(() => {
    if (gradeClasses.some(item => item.id === activeClassId)) return;
    setActiveClassId(gradeClasses[0]?.id ?? '');
  }, [activeClassId, gradeClasses]);

  const activeStudents = useMemo(() => (
    getStudentsForClass(activeClassId).filter(student => (student.status ?? 'active') === 'active')
  ), [activeClassId, getStudentsForClass]);
  const normalizedClassQuery = classQuery.trim().replace(/\s+/g, '');
  const visibleStudents = useMemo(() => activeStudents.filter(student => (
    !normalizedClassQuery || student.name.replace(/\s+/g, '').includes(normalizedClassQuery)
  )), [activeStudents, normalizedClassQuery]);
  const allActiveSelected = activeStudents.length > 0 && activeStudents.every(student => selectedIds.has(student.id));
  const authorizedClassNames = useMemo(() => new Set(classes.map(item => item.name)), [classes]);
  const restrictedStudents = useMemo(() => allStudents.filter(student => (
    (student.status ?? 'active') === 'active' && !authorizedClassNames.has(student.class)
  )), [allStudents, authorizedClassNames]);
  const exactMatches = useMemo(() => submittedExactName
    ? restrictedStudents.filter(student => student.name.trim() === submittedExactName)
    : [], [restrictedStudents, submittedExactName]);
  const hasValidDetails = name.trim().length > 0 && visibility !== null;
  const isDirty = name.trim().length > 0 || visibility !== null || selectedIds.size > 0;

  const toggleStudent = (studentId: string) => setSelectedIds(current => {
    const next = new Set(current);
    if (next.has(studentId)) next.delete(studentId);
    else next.add(studentId);
    return next;
  });

  const toggleActiveClass = () => setSelectedIds(current => {
    const next = new Set(current);
    activeStudents.forEach(student => {
      if (allActiveSelected) next.delete(student.id);
      else next.add(student.id);
    });
    return next;
  });

  const requestClose = () => {
    if (mode === 'create' && isDirty) {
      setShowDiscardConfirm(true);
      return;
    }
    onClose();
  };

  const handleBack = () => {
    if (page === 'exact-search') {
      setPage('members');
      setExactName('');
      setSubmittedExactName('');
      return;
    }
    if (mode === 'create' && page === 'members') {
      setPage('details');
      return;
    }
    requestClose();
  };

  const handlePrimaryAction = () => {
    if (mode === 'create' && page === 'details') {
      if (hasValidDetails) setPage('members');
      return;
    }
    if (!visibility) return;
    onSave({ name: name.trim(), memberIds: Array.from(selectedIds), visibility });
  };

  const isMemberPage = page === 'members' || page === 'exact-search';
  const title = page === 'exact-search'
    ? '添加其他班级学生'
    : mode === 'settings'
      ? '团队设置'
      : mode === 'members'
        ? '调整学生'
        : page === 'members'
          ? '选择学生'
          : '新建社团或团队';
  const primaryDisabled = page === 'details' ? !hasValidDetails : selectedIds.size === 0;
  const primaryLabel = mode === 'create' && page === 'details'
    ? '选择学生'
    : mode === 'settings'
      ? '保存'
      : `完成（${selectedIds.size}人）`;

  return (
    <>
      <MobileBottomSheet
        open={open}
        title={title}
        size={isMemberPage ? 'tall' : 'content'}
        contentInset={isMemberPage ? 'compact' : 'standard'}
        contentTone={isMemberPage ? 'plain' : 'surface'}
        footerDivider={false}
        onClose={requestClose}
        header={isMemberPage ? (
          <header className="grid h-14 shrink-0 grid-cols-[44px_1fr_44px] items-center px-2">
            <button type="button" onClick={handleBack} aria-label="返回上一步" className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
              <BackIcon className="h-5 w-5" />
            </button>
            <h2 className="truncate text-center text-[17px] font-semibold text-[var(--tm-text-primary)]">{title}</h2>
            <button type="button" onClick={requestClose} aria-label={`关闭${title}`} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
              <CloseIcon className="h-5 w-5" />
            </button>
          </header>
        ) : undefined}
        footer={page === 'exact-search' ? undefined : (
          <button type="button" disabled={primaryDisabled} onClick={handlePrimaryAction} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-pressed)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">
            {primaryLabel}
          </button>
        )}
      >
        {page === 'details' && (
          <div className="space-y-5 py-2">
            <label className="block">
              <span className="mb-2 block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">名称</span>
              <input value={name} onChange={event => setName(event.target.value)} maxLength={30} placeholder="例如：篮球社" aria-label="名称" className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)]" />
            </label>

            <fieldset>
              <legend className="mb-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">谁可以看到</legend>
              <div className="overflow-hidden rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-control)]">
                {[
                  { value: 'collaborators' as const, label: '仅自己和协作老师' },
                  { value: 'management' as const, label: '管理人员也可见' },
                ].map((option, index) => {
                  const selected = visibility === option.value;
                  return (
                    <button key={option.value} type="button" role="radio" aria-checked={selected} onClick={() => setVisibility(option.value)} className={`flex min-h-[56px] w-full items-center gap-3 px-4 text-left text-[14px] font-semibold transition-colors active:bg-[var(--tm-bg-surface-soft)] ${index > 0 ? 'border-t border-[var(--tm-border-subtle)]' : ''} ${selected ? 'text-[var(--tm-brand-primary)]' : 'text-[var(--tm-text-primary)]'}`}>
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-white' : 'border-[var(--tm-border-control)] bg-white'}`}>
                        {selected && <Check className="h-3 w-3" strokeWidth={3} />}
                      </span>
                      {option.label}
                    </button>
                  );
                })}
              </div>
            </fieldset>
          </div>
        )}

        {page === 'members' && (
          <div className="min-h-full">
            <div className="sticky top-0 z-20 -mx-3 bg-[var(--tm-bg-surface)] px-3 pb-3 pt-1">
              <div className="flex min-h-11 items-center justify-between gap-3 px-1">
                <span className="text-[13px] font-semibold tabular-nums text-[var(--tm-brand-primary)]">已选 {selectedIds.size} 人</span>
                {restrictedStudents.length > 0 && (
                  <button type="button" onClick={() => setPage('exact-search')} className="flex min-h-11 items-center gap-1.5 rounded-[var(--tm-radius-control)] px-2 text-[13px] font-semibold text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
                    <UserPlus className="h-4 w-4 text-[var(--tm-action-icon-neutral)]" />
                    其他班学生
                  </button>
                )}
              </div>

              {classes.length > 0 && (
                <>
                  <div className="grid grid-cols-2 gap-2">
                    <label className="relative min-w-0">
                      <span className="sr-only">选择年级</span>
                      <select value={activeGrade} onChange={event => { setActiveGrade(event.target.value); setClassQuery(''); }} className="min-h-11 w-full appearance-none rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 pr-8 text-[13px] font-medium text-[var(--tm-input-text)] outline-none">
                        {gradeOptions.map(grade => <option key={grade} value={grade}>{grade}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
                    </label>
                    <label className="relative min-w-0">
                      <span className="sr-only">选择班级</span>
                      <select value={activeClassId} onChange={event => { setActiveClassId(event.target.value); setClassQuery(''); }} className="min-h-11 w-full appearance-none rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 pr-8 text-[13px] font-medium text-[var(--tm-input-text)] outline-none">
                        {gradeClasses.map(item => <option key={item.id} value={item.id}>{item.name}</option>)}
                      </select>
                      <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
                    </label>
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <MobileSearchInput value={classQuery} onChange={event => setClassQuery(event.target.value)} placeholder="搜索姓名" aria-label="搜索当前班级学生" className="min-w-0 flex-1" containerClassName="flex min-h-11 min-w-0 flex-1 items-center" density="compact" appearance="filled" />
                    <button type="button" onClick={toggleActiveClass} className="min-h-11 shrink-0 rounded-[var(--tm-radius-control)] px-2.5 text-[13px] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]">{allActiveSelected ? '取消全选' : '全选'}</button>
                  </div>
                </>
              )}
            </div>

            {classes.length > 0 ? (
              <>
                <StudentCompactSelectGrid sections={[{ id: activeClassId || 'authorized-class', students: visibleStudents }]} isSelected={studentId => selectedIds.has(studentId)} onToggle={toggleStudent} className="pt-1" />
                {visibleStudents.length === 0 && <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title="没有匹配的学生" className="min-h-56 py-4" imageClassName="w-[52%] min-w-[140px] max-w-[176px]" />}
              </>
            ) : (
              <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.CHAIR} title="暂无可选班级" className="min-h-[320px] py-4" />
            )}
          </div>
        )}

        {page === 'exact-search' && (
          <div className="min-h-full pt-2">
            <div className="flex items-center gap-2">
              <MobileSearchInput value={exactName} onChange={event => { setExactName(event.target.value); setSubmittedExactName(''); }} onKeyDown={event => { if (event.key === 'Enter') setSubmittedExactName(exactName.trim()); }} placeholder="输入完整姓名" aria-label="输入其他班级学生完整姓名" className="min-w-0 flex-1" containerClassName="flex min-h-11 min-w-0 flex-1 items-center" density="compact" appearance="filled" />
              <button type="button" disabled={!exactName.trim()} onClick={() => setSubmittedExactName(exactName.trim())} className="min-h-11 shrink-0 rounded-[var(--tm-radius-control)] px-3 text-[13px] font-semibold text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)] disabled:text-[var(--tm-text-disabled)]">查找</button>
            </div>

            {submittedExactName && exactMatches.length > 0 && (
              <div className="mt-3 space-y-2">
                {exactMatches.map(student => {
                  const selected = selectedIds.has(student.id);
                  return (
                    <button key={student.id} type="button" onClick={() => toggleStudent(student.id)} aria-pressed={selected} className="flex min-h-14 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-4 text-left [box-shadow:var(--tm-shadow-control)] active:bg-[var(--tm-bg-surface-soft)]">
                      <span className={`flex h-[18px] w-[18px] shrink-0 items-center justify-center rounded-full ${selected ? 'bg-[var(--tm-brand-primary)]' : 'bg-white'}`}>
                        {selected ? <CheckIcon className="h-3 w-3 text-white [stroke-width:3]" /> : <CircleIcon className="h-[18px] w-[18px] fill-white text-[var(--tm-border-subtle)]" />}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-[14px] font-semibold text-[var(--tm-text-primary)]">{student.name}</span>
                        <span className="mt-0.5 block truncate text-[12px] font-medium text-[var(--tm-text-tertiary)]">{student.class}</span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
            {submittedExactName && exactMatches.length === 0 && (
              <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title="未找到该姓名的学生" className="min-h-64 py-4" imageClassName="w-[52%] min-w-[140px] max-w-[176px]" />
            )}
          </div>
        )}
      </MobileBottomSheet>

      <MobileConfirmSheet
        open={showDiscardConfirm}
        title="放弃新建社团或团队"
        description="已填写的名称和选择的学生将不会保留。"
        confirmLabel="放弃创建"
        tone="danger"
        onClose={() => setShowDiscardConfirm(false)}
        onConfirm={() => {
          setShowDiscardConfirm(false);
          onClose();
        }}
      />
    </>
  );
};

export default StudentTeamEditorView;
