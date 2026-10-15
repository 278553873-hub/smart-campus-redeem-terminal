import React, { useEffect, useMemo, useState } from 'react';
import { Check, ChevronDown, Plus } from 'lucide-react';
import type { ClassInfo, SchoolStudentTeam, Student, StudentTeamAvatarColorKey, StudentTeamAvatarKey, StudentTeamLabel } from '../../types';
import { BackIcon, CloseIcon } from '../../components/Icons';
import StudentCompactSelectGrid from '../../components/student/StudentCompactSelectGrid';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import MobileSearchInput from '../../components/ui/MobileSearchInput';
import CompactSegmentedControl from '../../components/ui/CompactSegmentedControl';
import type { MobileClassCascadeGroup } from '../../components/ui/MobileClassCascadePicker';
import MobileClassPickerSheet from '../../components/ui/MobileClassPickerSheet';
import MobileRadioOptionCard from '../../components/ui/MobileRadioOptionCard';
import { ASSETS } from '../../assets/images';
import { getStudentTeamAvatarImage, getStudentTeamAvatarOption, studentTeamAvatarOptions } from '../../assets/teamAvatarCatalog';
import { getTeacherSchoolGradeOptions, type TeacherSpaceOption } from '../../domain/teacherSpaceAccess';
import StudentTeamSelectedList from './StudentTeamSelectedList';
import StudentTeamPhotoRecognitionFlow, { StudentTeamPhotoRecognitionButton } from './StudentTeamPhotoRecognitionFlow';
import StudentTeamCreateView from './StudentTeamCreateView';

export type StudentTeamEditorMode = 'create' | 'settings' | 'members' | 'add';
export type StudentTeamSearchResult = Pick<Student, 'id' | 'name' | 'gender' | 'grade' | 'class' | 'avatar'> & {
  classLabel: string;
};
export type StudentTeamEditorValue = {
  name: string;
  memberIds: string[];
  visibility: SchoolStudentTeam['visibility'];
  avatarKey?: StudentTeamAvatarKey;
  avatarColorKey?: StudentTeamAvatarColorKey;
};

interface StudentTeamEditorViewProps {
  open: boolean;
  mode: StudentTeamEditorMode;
  team?: SchoolStudentTeam;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
  searchStudentsByExactName: (name: string) => StudentTeamSearchResult[];
  getStudentLabelById: (studentId: string) => StudentTeamLabel | undefined;
  onClose: () => void;
  onSave: (value: StudentTeamEditorValue) => void;
  getClassLabel?: (classInfo: ClassInfo) => string;
  currentSpace?: TeacherSpaceOption;
}

type EditorPage = 'details' | 'members';
type MemberScope = 'authorized' | 'other';
type MemberPickerView = 'students' | 'classes' | 'roster';

const StudentTeamEditorView: React.FC<StudentTeamEditorViewProps> = ({
  open,
  mode,
  team,
  classes,
  getStudentsForClass,
  searchStudentsByExactName,
  getStudentLabelById,
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
  const teamDraftKey = team ? `${team.id}:${team.name}:${team.visibility}:${team.avatarKey ?? ''}:${team.memberIds.join(',')}` : '';
  const [page, setPage] = useState<EditorPage>('details');
  const [name, setName] = useState('');
  const [avatarKey, setAvatarKey] = useState<StudentTeamAvatarKey>('sports-basketball');
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
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
  const [recognitionOpen, setRecognitionOpen] = useState(false);
  const [additionBaseIds, setAdditionBaseIds] = useState<Set<string>>(new Set());
  const [rosterIds, setRosterIds] = useState<string[]>([]);
  const [isAdditionPageOpen, setIsAdditionPageOpen] = useState(false);
  const isRosterPage = mode === 'members' && memberPickerView === 'roster';
  const isAdding = mode === 'add' || (mode === 'members' && !isRosterPage);
  const addedIds = new Set(Array.from(selectedIds).filter(id => !additionBaseIds.has(id)));
  const pickerSelectedIds = isAdding ? addedIds : selectedIds;
  const isAlreadyJoined = (id: string) => isAdding && additionBaseIds.has(id);
  const hasMemberChanges = selectedIds.size !== (team?.memberIds.length ?? 0)
    || (team?.memberIds ?? []).some(id => !selectedIds.has(id));

  const openAddition = () => {
    setIsAdditionPageOpen(true);
  };

  useEffect(() => {
    if (!open) return;
    const initialGrade = Array.from(new Set(classes.map(item => item.gradeLevel)))[0] ?? '';
    const initialClassId = classes.find(item => item.gradeLevel === initialGrade)?.id ?? classes[0]?.id ?? '';
    setPage(mode === 'members' || mode === 'add' ? 'members' : 'details');
    setName(team?.name ?? '');
    setAvatarKey(team?.avatarKey ?? 'sports-basketball');
    setAvatarPickerOpen(false);
    setVisibility(team?.visibility ?? null);
    setSelectedIds(new Set(team?.memberIds ?? []));
    setAdditionBaseIds(new Set(team?.memberIds ?? []));
    setRosterIds(team?.memberIds ?? []);
    setRecognitionOpen(false);
    setIsAdditionPageOpen(false);
    setActiveGrade(initialGrade);
    setActiveClassId(initialClassId);
    setClassQuery('');
    setExactName('');
    setSubmittedExactName('');
    setExactSearchResults([]);
    setMemberScope('authorized');
    setMemberPickerView(mode === 'members' ? 'roster' : 'students');
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
  const hasValidDetails = name.trim().length > 0 && visibility !== null;
  const toggleStudent = (studentId: string) => setSelectedIds(current => {
    if (isAlreadyJoined(studentId)) return current;
    const next = new Set(current);
    if (next.has(studentId)) next.delete(studentId);
    else next.add(studentId);
    return next;
  });

  const addRecognizedStudents = (studentIds: string[]) => setSelectedIds(current => {
    const next = new Set(current);
    studentIds.forEach(studentId => next.add(studentId));
    return next;
  });

  const requestClose = () => {
    onClose();
  };

  const handleBack = () => {
    if (avatarPickerOpen) {
      setAvatarPickerOpen(false);
      return;
    }
    if (memberPickerView === 'classes') {
      setMemberPickerView('students');
      return;
    }
    if (mode === 'members' && !isRosterPage) {
      setSelectedIds(new Set(additionBaseIds));
      setMemberPickerView('roster');
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
    if (mode === 'members' && isAdding) {
      setRosterIds(current => Array.from(new Set([...current, ...selectedIds])));
      setMemberPickerView('roster');
      return;
    }
    if (!visibility) return;
    onSave({ name: name.trim(), memberIds: Array.from(selectedIds), visibility, avatarKey });
  };

  const isMemberPage = page === 'members';
  const isClassPickerPage = isMemberPage && memberPickerView === 'classes';
  const title = isClassPickerPage ? '选择班级'
    : mode === 'settings' ? '团队设置'
    : isRosterPage ? '调整学生'
    : isAdding ? '添加学生'
    : page === 'members' ? '选择学生' : '新建社团或团队';
  const primaryDisabled = page === 'details' ? !hasValidDetails
    : isRosterPage ? !hasMemberChanges
    : pickerSelectedIds.size === 0;
  const primaryLabel = mode === 'create' && page === 'details'
    ? '选择学生'
    : mode === 'settings' ? '保存'
    : isRosterPage ? '保存修改'
    : isAdding ? `添加（${addedIds.size}人）`
    : `完成（${selectedIds.size}人）`;

  if (mode === 'members' && isAdditionPageOpen && team) {
    return (
      <StudentTeamCreateView
        mode="add"
        initialTeam={{ ...team, memberIds: Array.from(selectedIds) }}
        classes={classes}
        getStudentsForClass={getStudentsForClass}
        searchStudentsByExactName={searchStudentsByExactName}
        getStudentLabelById={getStudentLabelById}
        getClassLabel={getClassLabel}
        currentSpace={currentSpace}
        onBack={() => setIsAdditionPageOpen(false)}
        onSave={value => {
          const nextIds = new Set(value.memberIds);
          setSelectedIds(nextIds);
          setRosterIds(current => Array.from(new Set([...current, ...nextIds])));
          setIsAdditionPageOpen(false);
        }}
      />
    );
  }

  const adjustmentRoster = isRosterPage && (
    <div className="pb-2">
      <div className="flex min-h-14 items-center justify-between gap-3">
        <span className="text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">当前成员 {selectedIds.size} 人</span>
        <button type="button" onClick={openAddition} className="flex min-h-11 items-center gap-1 px-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)]">
          <Plus className="h-4 w-4" aria-hidden="true" />添加学生
        </button>
      </div>
      <div className="space-y-[var(--tm-space-2)]">
        {rosterIds.filter(id => selectedIds.has(id)).map(id => {
          const student = getStudentLabelById(id);
          return (
            <div key={id} className="flex min-h-[72px] items-center gap-3 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-3 py-2 [box-shadow:var(--tm-shadow-card-ambient)]">
              <img src={student?.avatar || ASSETS.AVATAR.GENERIC_BOY} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
              <div className="min-w-0 flex-1">
                <span className="block truncate text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)]">{student?.name ?? '学生'}</span>
                <span className="mt-0.5 block truncate text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-tertiary)]">{student?.classLabel}</span>
              </div>
              <button type="button" onClick={() => toggleStudent(id)} aria-label={`移除${student?.name ?? '学生'}`} className="min-h-11 min-w-11 shrink-0 rounded-[var(--tm-radius-control)] px-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-status-negative)]">移除</button>
            </div>
          );
        })}
      </div>
      {selectedIds.size === 0 && <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.CHAIR} title="暂无成员" className="min-h-56 py-4" />}
    </div>
  );

  return (
    <>
      {mode === 'members' ? (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
          <header className="relative z-10 flex h-11 shrink-0 items-center justify-between border-b border-[var(--tm-border-subtle)] bg-[var(--tm-page-plain-header-bg)] px-4 [padding-right:var(--mini-program-capsule-right-inset,16px)]">
            <button type="button" onClick={requestClose} aria-label="返回社团与团队" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
              <BackIcon className="h-5 w-5 text-[var(--tm-text-secondary)]" />
            </button>
            <h1 className="pointer-events-none absolute left-1/2 max-w-[52%] -translate-x-1/2 truncate text-[17px] font-semibold text-[var(--tm-text-primary)]">调整学生</h1>
            <div className="h-11 w-11" aria-hidden="true" />
          </header>
          <main className="min-h-0 flex-1 overflow-y-auto bg-[var(--tm-page-plain-content-bg)] px-[var(--tm-space-4)] pb-[var(--tm-space-4)] pt-[var(--tm-space-2)]">
            {adjustmentRoster}
          </main>
          <footer className="shrink-0 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-5)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)]">
            <button type="button" disabled={!hasMemberChanges} onClick={handlePrimaryAction} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-5)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] disabled:cursor-not-allowed disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)]">
              保存修改
            </button>
          </footer>
        </div>
      ) : (
      <MobileBottomSheet
        open={open && !isClassPickerPage && !recognitionOpen}
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
        footerLeading={isMemberPage && !isRosterPage && !isClassPickerPage && pickerSelectedIds.size > 0 ? (
          <StudentTeamSelectedList
            selectedIds={pickerSelectedIds}
            getStudentLabelById={getStudentLabelById}
            onRemove={toggleStudent}
            className="h-9 bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)]"
          />
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
              <legend className="mb-2 block p-0 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">头像</legend>
              <button type="button" onClick={() => setAvatarPickerOpen(true)} className="flex min-h-[72px] w-full items-center gap-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-avatar)] ring-1 ring-white/90">
                  <img src={getStudentTeamAvatarImage(avatarKey)} alt="" className="h-full w-full object-cover" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{getStudentTeamAvatarOption(avatarKey).label}</span>
                  <span className="mt-1 block text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">选择系统头像</span>
                </span>
                <span className="shrink-0 px-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)]">更换</span>
              </button>
            </fieldset>

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

        {adjustmentRoster}

        {page === 'members' && !isClassPickerPage && !isRosterPage && (
          <div className="min-h-full">
            <div className="sticky top-0 z-30 -mx-3 bg-[var(--tm-bg-surface)] px-3 py-2">
              <div className="mt-[var(--tm-space-2)] flex items-center gap-2">
                <div className="min-w-0 flex-1">
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
                  />
                </div>
                <StudentTeamPhotoRecognitionButton onClick={() => setRecognitionOpen(true)} />
              </div>

              {memberScope === 'authorized' && classes.length > 0 && (
                <>
                  <div className="mt-[var(--tm-space-2)]">
                    <button type="button" onClick={() => setMemberPickerView('classes')} aria-label="选择班级" className="flex min-h-11 w-full items-center justify-between gap-[var(--tm-space-3)] text-left">
                      <span className="min-w-0 truncate text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
                        {gradeClasses.find(item => item.id === activeClassId) ? getClassLabel(gradeClasses.find(item => item.id === activeClassId)!) : activeGrade}
                      </span>
                      <ChevronDown className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
                    </button>
                  </div>

                  <MobileSearchInput value={classQuery} onChange={event => setClassQuery(event.target.value)} placeholder="搜索姓名" aria-label="搜索当前班级学生" className="min-w-0 flex-1" containerClassName="flex min-h-11 min-w-0 flex-1 items-center" density="compact" appearance="filled" fillTone="soft" />
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
                <StudentCompactSelectGrid sections={[{ id: activeClassId || 'authorized-class', students: visibleStudents }]} isSelected={studentId => pickerSelectedIds.has(studentId)} isDisabled={isAlreadyJoined} getSecondaryLabel={student => isAlreadyJoined(student.id) ? '已加入' : undefined} onToggle={toggleStudent} className="pt-2" />
                {visibleStudents.length === 0 && <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.MAGNIFIER} title="没有匹配的学生" className="min-h-56 py-4" imageClassName="w-[52%] min-w-[140px] max-w-[176px]" />}
              </>
            ) : memberScope === 'authorized' ? (
              <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.CHAIR} title="暂无可选班级" className="min-h-[320px] py-4" />
            ) : (
              <div className="min-h-full bg-[var(--tm-bg-surface-soft)]">
                {submittedExactName && exactSearchResults.length > 0 && (
                  <StudentCompactSelectGrid
                    sections={[{ id: 'other-class-search', students: exactSearchResults }]}
                    isSelected={studentId => pickerSelectedIds.has(studentId)}
                    isDisabled={isAlreadyJoined}
                    getSecondaryLabel={student => `${(student as StudentTeamSearchResult).classLabel}${isAlreadyJoined(student.id) ? ' · 已加入' : ''}`}
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
      )}

      <MobileClassPickerSheet
        open={open && isClassPickerPage}
        selectionMode="single"
        commitMode="immediate"
        groups={classGroups}
        value={{ gradeValue: activeGrade, classId: activeClassId }}
        getClassLabel={getClassLabel}
        onChange={({ classId }) => handleClassSelect(classId)}
        onClose={() => setMemberPickerView('students')}
        ariaLabel="选择班级"
      />

      <MobileBottomSheet open={avatarPickerOpen} title="选择头像" onClose={() => setAvatarPickerOpen(false)}>
        <div className="space-y-4 pb-2">
          {Array.from(new Set(studentTeamAvatarOptions.map(option => option.category))).map(category => (
            <fieldset key={category} className="m-0 border-0 p-0">
              <legend className="mb-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">{category}</legend>
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={`${category}头像`}>
                {studentTeamAvatarOptions.filter(option => option.category === category).map(option => (
                  <button key={option.key} type="button" role="radio" aria-checked={avatarKey === option.key} aria-label={`选择${option.label}头像`} onClick={() => { setAvatarKey(option.key); setAvatarPickerOpen(false); }} className="relative flex min-h-20 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]">
                    <img src={option.src} alt={option.label} className="h-16 w-16 rounded-full object-cover" />
                    {avatarKey === option.key && <span className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]"><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </MobileBottomSheet>

      <StudentTeamPhotoRecognitionFlow
        open={recognitionOpen}
        classes={classes}
        getStudentsForClass={getStudentsForClass}
        getClassLabel={getClassLabel}
        onClose={() => setRecognitionOpen(false)}
        onConfirm={addRecognizedStudents}
        existingStudentIds={selectedIds}
      />

    </>
  );
};

export default StudentTeamEditorView;
