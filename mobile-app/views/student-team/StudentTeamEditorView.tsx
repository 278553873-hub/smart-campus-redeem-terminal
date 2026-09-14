import React, { useEffect, useMemo, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { ClassInfo, SchoolStudentTeam, Student } from '../../types';
import { BackIcon, CloseIcon } from '../../components/Icons';
import StudentCompactSelectGrid from '../../components/student/StudentCompactSelectGrid';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import MobileSearchInput from '../../components/ui/MobileSearchInput';
import CompactSegmentedControl from '../../components/ui/CompactSegmentedControl';
import MobileClassCascadePicker, { type MobileClassCascadeGroup } from '../../components/ui/MobileClassCascadePicker';
import MobileRadioOptionCard from '../../components/ui/MobileRadioOptionCard';
import { ASSETS } from '../../assets/images';
import { getTeacherSchoolGradeOptions, type TeacherSpaceOption } from '../../domain/teacherSpaceAccess';

export type StudentTeamEditorMode = 'create' | 'settings' | 'members';
export type StudentTeamSearchResult = Pick<Student, 'id' | 'name' | 'gender' | 'grade' | 'class' | 'avatar'> & {
  classLabel: string;
};
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
  getStudentsForClass: (classId: string) => Student[];
  searchStudentsByExactName: (name: string) => StudentTeamSearchResult[];
  onClose: () => void;
  onSave: (value: StudentTeamEditorValue) => void;
  getClassLabel?: (classInfo: ClassInfo) => string;
  currentSpace?: TeacherSpaceOption;
}

type EditorPage = 'details' | 'members';
type MemberScope = 'authorized' | 'other';
type MemberPickerView = 'students' | 'classes';

const StudentTeamEditorView: React.FC<StudentTeamEditorViewProps> = ({
  open,
  mode,
  team,
  classes,
  getStudentsForClass,
  searchStudentsByExactName,
  onClose,
  onSave,
  getClassLabel = classInfo => classInfo.name,
  currentSpace,
}) => {
  const gradeOptions = useMemo(() => (
    (currentSpace ? getTeacherSchoolGradeOptions(currentSpace) : undefined)
      ?? Array.from(new Set(classes.map(item => item.gradeLevel)))
  ), [classes, currentSpace]);
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
  const [exactSearchResults, setExactSearchResults] = useState<StudentTeamSearchResult[]>([]);
  const [memberScope, setMemberScope] = useState<MemberScope>('authorized');
  const [memberPickerView, setMemberPickerView] = useState<MemberPickerView>('students');

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
    setExactSearchResults([]);
    setMemberScope('authorized');
    setMemberPickerView('students');
  }, [classScopeKey, mode, open, teamDraftKey]);

  const gradeClasses = useMemo(() => classes.filter(item => item.gradeLevel === activeGrade), [activeGrade, classes]);
  const classGroups = useMemo<MobileClassCascadeGroup[]>(() => gradeOptions.map(grade => ({
    gradeLabel: grade,
    classes: classes.filter(item => item.gradeLevel === grade),
  })).filter(group => group.classes.length > 0), [classes, gradeOptions]);

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
  const hasValidDetails = name.trim().length > 0 && visibility !== null;
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
    onClose();
  };

  const handleBack = () => {
    if (memberPickerView === 'classes') {
      setMemberPickerView('students');
      return;
    }
    if (mode === 'create' && page === 'members') {
      setPage('details');
      return;
    }
    requestClose();
  };

  const handleExactSearch = () => {
    const normalizedName = exactName.trim().replace(/\s+/g, '');
    setSubmittedExactName(normalizedName);
    setExactSearchResults(normalizedName ? searchStudentsByExactName(normalizedName) : []);
  };

  const handleMemberScopeChange = (scope: MemberScope) => {
    setMemberScope(scope);
    setMemberPickerView('students');
    setClassQuery('');
    setExactName('');
    setSubmittedExactName('');
    setExactSearchResults([]);
  };

  const handleClassSelect = (classId: string) => {
    const selectedClass = classes.find(item => item.id === classId);
    if (!selectedClass) return;
    setActiveGrade(selectedClass.gradeLevel);
    setActiveClassId(classId);
    setClassQuery('');
    setMemberPickerView('students');
  };

  const handlePrimaryAction = () => {
    if (mode === 'create' && page === 'details') {
      if (hasValidDetails) setPage('members');
      return;
    }
    if (!visibility) return;
    onSave({ name: name.trim(), memberIds: Array.from(selectedIds), visibility });
  };

  const isMemberPage = page === 'members';
  const isClassPickerPage = isMemberPage && memberPickerView === 'classes';
  const title = mode === 'settings'
      ? '团队设置'
      : mode === 'members'
        ? isClassPickerPage ? '选择班级' : '调整学生'
        : page === 'members'
          ? isClassPickerPage ? '选择班级' : '选择学生'
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
            <button type="button" onClick={handleBack} aria-label="返回上一步" className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)]">
              <BackIcon className="h-5 w-5" />
            </button>
            <h2 className="truncate text-center text-[17px] font-semibold text-[var(--tm-text-primary)]">{title}</h2>
            <button type="button" onClick={requestClose} aria-label={`关闭${title}`} className="flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)]">
              <CloseIcon className="h-5 w-5" />
            </button>
          </header>
        ) : undefined}
        footer={!isClassPickerPage && (
          <button type="button" disabled={primaryDisabled} onClick={handlePrimaryAction} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-inverse)] disabled:cursor-not-allowed disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">
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

            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-2 block p-0 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">谁可以看到</legend>
              <div className="mt-3 grid gap-2.5" role="radiogroup" aria-label="团队可见范围">
                {[
                  {
                    value: 'collaborators' as const,
                    id: 'team-visibility-collaborators',
                    tag: '私密',
                    tagTone: 'red' as const,
                    title: '仅自己和受邀协作老师可见',
                    description: '适合把需要重点关注的学生单独圈出，进行持续跟进，不在学校社团列表中公开。',
                  },
                  {
                    value: 'management' as const,
                    id: 'team-visibility-management',
                    tag: '公开',
                    tagTone: 'jade' as const,
                    title: '管理人员可见并可参与评价',
                    description: '适合学校社团或跨班团队，公开后便于学校统一查看，减少重复建立。',
                  },
                ].map(option => {
                  const selected = visibility === option.value;
                  return (
                    <MobileRadioOptionCard
                      key={option.value}
                      id={option.id}
                      tag={option.tag}
                      tagTone={option.tagTone}
                      title={option.title}
                      description={option.description}
                      selected={selected}
                      onSelect={() => setVisibility(option.value)}
                    />
                  );
                })}
              </div>
            </fieldset>
          </div>
        )}

        {page === 'members' && isClassPickerPage && (
          <div className="-mx-3 h-[min(420px,56dvh)]">
            <MobileClassCascadePicker
              selectionMode="single"
              groups={classGroups}
              activeGrade={activeGrade}
              onActiveGradeChange={setActiveGrade}
              selectedClassId={activeClassId}
              onSelectClass={handleClassSelect}
              getClassLabel={getClassLabel}
              ariaLabel="选择班级"
            />
          </div>
        )}

        {page === 'members' && !isClassPickerPage && (
          <div className="min-h-full">
            <div className="sticky top-0 z-30 -mx-3 bg-[var(--tm-bg-surface)] px-3 py-2">
              <CompactSegmentedControl
                value={memberScope}
                items={[
                  { value: 'authorized', label: '我的班级' },
                  { value: 'other', label: '其他班级' },
                ]}
                onChange={handleMemberScopeChange}
                ariaLabel="学生来源"
                fullWidth
                motion="sliding"
                className="mt-[var(--tm-space-2)]"
              />

              {memberScope === 'authorized' && classes.length > 0 && (
                <>
                  <div className="mt-[var(--tm-space-2)]">
                    <button type="button" onClick={() => setMemberPickerView('classes')} aria-label="选择班级" className="flex min-h-11 w-full items-center justify-between gap-[var(--tm-space-3)] text-left">
                      <span className="min-w-0 truncate text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
                        {activeGrade}{gradeClasses.find(item => item.id === activeClassId) ? ` · ${getClassLabel(gradeClasses.find(item => item.id === activeClassId)!)}` : ''}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
                    </button>
                  </div>

                  <div className="flex items-center gap-[var(--tm-space-2)]">
                    <MobileSearchInput value={classQuery} onChange={event => setClassQuery(event.target.value)} placeholder="搜索姓名" aria-label="搜索当前班级学生" className="min-w-0 flex-1" containerClassName="flex min-h-11 min-w-0 flex-1 items-center" density="compact" appearance="filled" fillTone="soft" />
                    <button type="button" onClick={toggleActiveClass} className="min-h-11 shrink-0 px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)]">{allActiveSelected ? '取消全选' : '全选'}</button>
                  </div>
                </>
              )}

              {memberScope === 'other' && (
                <div className="mt-[var(--tm-space-2)] flex items-center gap-[var(--tm-space-2)]" data-teacher-demo-context="student-team-other-search">
                  <MobileSearchInput value={exactName} onChange={event => { setExactName(event.target.value); setSubmittedExactName(''); setExactSearchResults([]); }} onKeyDown={event => { if (event.key === 'Enter') handleExactSearch(); }} placeholder="输入完整姓名" aria-label="输入其他班级学生完整姓名" className="min-w-0 flex-1" containerClassName="flex min-h-11 min-w-0 flex-1 items-center" density="compact" appearance="filled" fillTone="soft" />
                  <button type="button" disabled={!exactName.trim()} onClick={handleExactSearch} className="min-h-11 shrink-0 px-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)] disabled:text-[var(--tm-text-disabled)]">查找</button>
                </div>
              )}
            </div>

            {memberScope === 'authorized' && classes.length > 0 ? (
              <>
                <StudentCompactSelectGrid sections={[{ id: activeClassId || 'authorized-class', students: visibleStudents }]} isSelected={studentId => selectedIds.has(studentId)} onToggle={toggleStudent} className="pt-2" />
                {visibleStudents.length === 0 && <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title="没有匹配的学生" className="min-h-56 py-4" imageClassName="w-[52%] min-w-[140px] max-w-[176px]" />}
              </>
            ) : memberScope === 'authorized' ? (
              <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.CHAIR} title="暂无可选班级" className="min-h-[320px] py-4" />
            ) : (
              <div className="min-h-full bg-[var(--tm-bg-surface-soft)]">
                {submittedExactName && exactSearchResults.length > 0 && (
                  <StudentCompactSelectGrid
                    sections={[{ id: 'other-class-search', students: exactSearchResults }]}
                    isSelected={studentId => selectedIds.has(studentId)}
                    getSecondaryLabel={student => (student as StudentTeamSearchResult).classLabel}
                    showRosterNumber={false}
                    onToggle={toggleStudent}
                    className="pt-3"
                  />
                )}
                {submittedExactName && exactSearchResults.length === 0 && (
                  <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title="未找到该姓名的学生" className="min-h-64 py-4" imageClassName="w-[52%] min-w-[140px] max-w-[176px]" />
                )}
              </div>
            )}
          </div>
        )}
      </MobileBottomSheet>

    </>
  );
};

export default StudentTeamEditorView;
