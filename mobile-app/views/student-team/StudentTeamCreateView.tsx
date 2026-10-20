import React, { useEffect, useMemo, useState } from 'react';
import { Check } from 'lucide-react';
import { ChevronDown } from 'lucide-react';
import type { ClassInfo, SchoolStudentTeam, Student, StudentTeamAvatarKey, StudentTeamLabel } from '../../types';
import { BackIcon } from '../../components/Icons';
import StudentCompactSelectGrid from '../../components/student/StudentCompactSelectGrid';
import CompactSegmentedControl from '../../components/ui/CompactSegmentedControl';
import MobileClassPickerSheet from '../../components/ui/MobileClassPickerSheet';
import type { MobileClassCascadeGroup } from '../../components/ui/MobileClassCascadePicker';
import MobileEmptyState from '../../components/ui/MobileEmptyState';
import MobileSearchInput from '../../components/ui/MobileSearchInput';
import MobileRadioOptionCard from '../../components/ui/MobileRadioOptionCard';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import { ASSETS } from '../../assets/images';
import { getStudentTeamAvatarImage, getStudentTeamAvatarOption, studentTeamAvatarOptions } from '../../assets/teamAvatarCatalog';
import { getTeacherSchoolGradeOptions, type TeacherSpaceOption } from '../../domain/teacherSpaceAccess';
import type { StudentTeamSearchResult } from './StudentTeamEditorView';
import StudentTeamSelectedList from './StudentTeamSelectedList';
import StudentTeamPhotoRecognitionFlow, { StudentTeamPhotoRecognitionButton } from './StudentTeamPhotoRecognitionFlow';

export type StudentTeamCreateValue = {
  name: string;
  memberIds: string[];
  visibility: SchoolStudentTeam['visibility'];
  avatarKey?: StudentTeamAvatarKey;
};

interface StudentTeamCreateViewProps {
  mode?: 'create' | 'add';
  initialTeam?: Pick<SchoolStudentTeam, 'name' | 'memberIds' | 'visibility' | 'avatarKey'>;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
  searchStudentsByExactName: (name: string) => StudentTeamSearchResult[];
  getStudentLabelById: (studentId: string) => StudentTeamLabel | undefined;
  onBack: () => void;
  onSave: (value: StudentTeamCreateValue) => void;
  getClassLabel?: (classInfo: ClassInfo) => string;
  currentSpace?: TeacherSpaceOption;
}

type CreatePage = 'details' | 'members';
type MemberScope = 'authorized' | 'other';

const StudentTeamCreateView: React.FC<StudentTeamCreateViewProps> = ({
  mode = 'create',
  initialTeam,
  classes,
  getStudentsForClass,
  searchStudentsByExactName,
  getStudentLabelById,
  onBack,
  onSave,
  getClassLabel = classInfo => classInfo.name,
  currentSpace,
}) => {
  const gradeOptions = useMemo(() => (
    (currentSpace ? getTeacherSchoolGradeOptions(currentSpace) : undefined)
      ?? Array.from(new Set(classes.map(item => item.gradeLevel)))
  ), [classes, currentSpace]);
  const [page, setPage] = useState<CreatePage>(mode === 'add' ? 'members' : 'details');
  const [classPickerOpen, setClassPickerOpen] = useState(false);
  const [name, setName] = useState(initialTeam?.name ?? '');
  const [avatarKey, setAvatarKey] = useState<StudentTeamAvatarKey>(initialTeam?.avatarKey ?? 'sports-basketball');
  const [avatarPickerOpen, setAvatarPickerOpen] = useState(false);
  const [visibility, setVisibility] = useState<SchoolStudentTeam['visibility'] | null>(initialTeam?.visibility ?? null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(() => new Set(initialTeam?.memberIds ?? []));
  const existingMemberIds = new Set(initialTeam?.memberIds ?? []);
  const newlySelectedIds = new Set(Array.from(selectedIds).filter(id => !existingMemberIds.has(id)));
  const [activeGrade, setActiveGrade] = useState(gradeOptions[0] ?? '');
  const [activeClassId, setActiveClassId] = useState(classes[0]?.id ?? '');
  const [classQuery, setClassQuery] = useState('');
  const [memberScope, setMemberScope] = useState<MemberScope>('authorized');
  const [exactName, setExactName] = useState('');
  const [submittedExactName, setSubmittedExactName] = useState('');
  const [exactSearchResults, setExactSearchResults] = useState<StudentTeamSearchResult[]>([]);
  const [recognitionOpen, setRecognitionOpen] = useState(false);

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
    if (existingMemberIds.has(studentId)) return current;
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

  const handleMemberScopeChange = (scope: MemberScope) => {
    setMemberScope(scope);
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
  };

  const handleExactSearch = () => {
    const normalizedName = exactName.trim().replace(/\s+/g, '');
    setSubmittedExactName(normalizedName);
    setExactSearchResults(normalizedName ? searchStudentsByExactName(normalizedName) : []);
  };

  const handleBack = () => {
    if (avatarPickerOpen) {
      setAvatarPickerOpen(false);
      return;
    }
    if (classPickerOpen) {
      setClassPickerOpen(false);
      return;
    }
    if (page === 'members') {
      if (mode === 'create') setPage('details');
      else onBack();
      return;
    }
    onBack();
  };

  const handlePrimaryAction = () => {
    if (page === 'details') {
      if (hasValidDetails) setPage('members');
      return;
    }
    if (!visibility || (mode === 'add' && newlySelectedIds.size === 0) || selectedIds.size === 0) return;
    onSave({ name: name.trim(), memberIds: Array.from(selectedIds), visibility, avatarKey });
  };

  const title = page === 'details' ? '新建社团或团队' : mode === 'add' ? '添加学生' : '选择学生';
  const primaryDisabled = page === 'details' ? !hasValidDetails : mode === 'add' ? newlySelectedIds.size === 0 : selectedIds.size === 0;
  const primaryLabel = page === 'details' ? '选择学生' : mode === 'add' ? `添加（${newlySelectedIds.size}人）` : `完成（${selectedIds.size}人）`;
  const selectedAvatar = getStudentTeamAvatarOption(avatarKey);
  const selectedAvatarSrc = getStudentTeamAvatarImage(avatarKey);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--tm-page-plain-content-bg)]">
      <header className="relative z-40 flex h-11 shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={handleBack} aria-label={`返回${page === 'details' ? '社团与团队' : '上一步'}`} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-[scale,background-color] duration-150 ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)]">
          <BackIcon className="h-5 w-5" />
        </button>
        <h1 className="pointer-events-none absolute inset-x-16 truncate text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">{title}</h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
        {page === 'details' && (
          <div className="space-y-[var(--tm-layout-card-gap)] bg-[var(--tm-page-plain-content-bg)] px-[var(--tm-space-4)] py-[var(--tm-space-4)]">
            <label className="block rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)] [box-shadow:var(--tm-shadow-card)]">
              <span className="mb-[var(--tm-space-2)] block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">名称</span>
              <input value={name} onChange={event => setName(event.target.value)} maxLength={30} placeholder="例如：篮球社" aria-label="名称" className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control-compact)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none transition-[border-color,box-shadow] [transition-duration:var(--tm-duration-standard)] placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)]" />
            </label>

            <fieldset className="m-0 min-w-0 rounded-[var(--tm-radius-card-compact)] bg-[var(--tm-bg-surface)] p-[var(--tm-space-4)] [box-shadow:var(--tm-shadow-card)]">
              <legend className="mb-[var(--tm-space-2)] block p-0 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">头像</legend>
              <button type="button" onClick={() => setAvatarPickerOpen(true)} className="flex min-h-[72px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]">
                <span className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-avatar)] ring-1 ring-white/90">
                  <img src={selectedAvatarSrc} alt="" className="h-full w-full object-cover" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{selectedAvatar.label}</span>
                  <span className="mt-1 block text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">选择系统头像</span>
                </span>
                <span className="shrink-0 px-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary)]">更换</span>
              </button>
            </fieldset>

            <fieldset className="m-0 min-w-0 border-0 p-0">
              <legend className="mb-[var(--tm-space-2)] block p-0 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">谁可以看到</legend>
              <div className="grid gap-[var(--tm-form-option-gap)]" role="radiogroup" aria-label="团队可见范围">
                {[
                  {
                    value: 'collaborators' as const,
                    id: 'create-team-visibility-collaborators',
                    tag: '私密',
                    tagTone: 'red' as const,
                    title: '仅自己和受邀协作老师可见',
                    description: '适合把需要重点关注的学生单独圈出，进行持续跟进，不在学校社团列表中公开。',
                  },
                  {
                    value: 'management' as const,
                    id: 'create-team-visibility-management',
                    tag: '公开',
                    tagTone: 'jade' as const,
                    title: '管理人员可见并可参与评价',
                    description: '适合学校社团或跨班团队，公开后便于学校统一查看，减少重复建立。',
                  },
                ].map(option => (
                  <MobileRadioOptionCard
                    shape="subtle"
                    key={option.value}
                    id={option.id}
                    tag={option.tag}
                    tagTone={option.tagTone}
                    title={option.title}
                    description={option.description}
                    selected={visibility === option.value}
                    onSelect={() => setVisibility(option.value)}
                  />
                ))}
              </div>
            </fieldset>
          </div>
        )}

        {page === 'members' && (
          <div className="min-h-full">
            <div className="sticky top-0 z-30 bg-[var(--tm-bg-surface)] px-[var(--tm-space-3)] py-[var(--tm-space-2)]">
              <div className="flex items-center gap-2">
                <div className="min-w-0 flex-1">
                  <CompactSegmentedControl
                    shape="subtle"
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
                  <button type="button" onClick={() => setClassPickerOpen(true)} aria-label="选择班级" className="mt-[var(--tm-space-2)] flex min-h-[var(--tm-size-touch)] w-full items-center justify-between gap-[var(--tm-space-3)] rounded-[var(--tm-radius-control-compact)] px-[var(--tm-space-2)] text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]">
                    <span className="min-w-0 truncate text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
                      {gradeClasses.find(item => item.id === activeClassId) ? getClassLabel(gradeClasses.find(item => item.id === activeClassId)!) : activeGrade}
                    </span>
                    <ChevronDown className="h-4 w-4 shrink-0 text-[var(--tm-text-tertiary)]" />
                  </button>
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
                <StudentCompactSelectGrid sections={[{ id: activeClassId || 'authorized-class', students: visibleStudents }]} isSelected={studentId => selectedIds.has(studentId)} isDisabled={studentId => existingMemberIds.has(studentId)} getSecondaryLabel={student => existingMemberIds.has(student.id) ? '已加入' : undefined} onToggle={toggleStudent} className="pt-2" />
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
                    isDisabled={studentId => existingMemberIds.has(studentId)}
                    getSecondaryLabel={student => `${(student as StudentTeamSearchResult).classLabel}${existingMemberIds.has(student.id) ? ' · 已加入' : ''}`}
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
      </main>

      <MobileBottomSheet open={avatarPickerOpen} title="选择头像" onClose={() => setAvatarPickerOpen(false)}>
        <div className="space-y-[var(--tm-form-section-gap)] pb-2">
          {Array.from(new Set(studentTeamAvatarOptions.map(option => option.category))).map(category => (
            <fieldset key={category} className="m-0 border-0 p-0">
              <legend className="mb-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">{category}</legend>
              <div className="grid grid-cols-4 gap-2" role="radiogroup" aria-label={`${category}头像`}>
                {studentTeamAvatarOptions.filter(option => option.category === category).map(option => (
                  <button key={option.key} type="button" role="radio" aria-checked={avatarKey === option.key} aria-label={`选择${option.label}头像`} onClick={() => { setAvatarKey(option.key); setAvatarPickerOpen(false); }} className="relative flex min-h-20 items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-bg-surface)] p-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)]">
                    <img src={option.src} alt={option.label} className="h-16 w-16 rounded-full object-cover" />
                    {avatarKey === option.key && <span className="absolute right-0.5 top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]"><Check className="h-3.5 w-3.5" aria-hidden="true" /></span>}
                  </button>
                ))}
              </div>
            </fieldset>
          ))}
        </div>
      </MobileBottomSheet>

      {page === 'members' && (
        <MobileClassPickerSheet
          open={classPickerOpen}
          selectionMode="single"
          commitMode="immediate"
          groups={classGroups}
          value={{ gradeValue: activeGrade, classId: activeClassId }}
          title="选择班级"
          getClassLabel={getClassLabel}
          onChange={({ gradeValue, classId }) => {
            setActiveGrade(gradeValue);
            handleClassSelect(classId);
          }}
          onClose={() => setClassPickerOpen(false)}
          ariaLabel="选择班级"
        />
      )}

      {page === 'members' && (mode === 'add' ? newlySelectedIds.size > 0 : selectedIds.size > 0) && (
        <div className="shrink-0">
          <StudentTeamSelectedList
            selectedIds={mode === 'add' ? newlySelectedIds : selectedIds}
            getStudentLabelById={getStudentLabelById}
            onRemove={toggleStudent}
            className="h-9 bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)]"
          />
        </div>
      )}

      <footer className="shrink-0 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-5)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)]">
        <button type="button" disabled={primaryDisabled} onClick={handlePrimaryAction} className="flex min-h-[52px] w-full items-center justify-center rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-5)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)] transition-[background-color,transform] [transition-duration:var(--tm-duration-fast)] active:scale-[0.98] active:bg-[var(--tm-brand-primary-pressed)] disabled:cursor-not-allowed disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2">
          {primaryLabel}
        </button>
      </footer>

      <StudentTeamPhotoRecognitionFlow
        open={recognitionOpen}
        classes={classes}
        getStudentsForClass={getStudentsForClass}
        getClassLabel={getClassLabel}
        onClose={() => setRecognitionOpen(false)}
        onConfirm={addRecognizedStudents}
        existingStudentIds={mode === 'add' ? selectedIds : undefined}
      />
    </div>
  );
};

export default StudentTeamCreateView;
