import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ImagePlus, Plus } from 'lucide-react';
import type { ClassInfo, Student } from '../types';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import TextSelectionControl from '../components/ui/TextSelectionControl';
import MobileStudentPickerSheet from '../components/student/MobileStudentPickerSheet';
import MobileSelectionIndicator from '../components/student/MobileSelectionIndicator';
import MedalIconView from '../components/medal/MedalIcon';
import MobileEmptyState from '../components/ui/MobileEmptyState';
import MobileFormActionBar from '../components/ui/MobileFormActionBar';
import MobileToast from '../components/ui/MobileToast';
import { mobileSheetActionClass } from '../components/ui/mobileSheetActionStyles';
import { ASSETS } from '../assets/images';
import { resolveMedalIcon } from '../assets/medals';
import { DEFAULT_CLASS_MEDALS, DEFAULT_PLATFORM_MEDALS, PLATFORM_MEDAL_GROUPS, PLATFORM_MEDALS, type MedalDefinition, type MedalScope } from '../domain/medal';

interface MedalIssuanceViewProps {
  classInfo: ClassInfo;
  students: Student[];
  onBack: () => void;
  schoolMedals?: MedalDefinition[];
  onIssueSchoolMedals?: (studentIds: string[], medalIds: string[]) => Promise<string>;
}

type SheetMode = 'students' | 'confirm' | null;

const MedalIssuanceView: React.FC<MedalIssuanceViewProps> = ({ classInfo, students, onBack, schoolMedals, onIssueSchoolMedals }) => {
  const [selectedScope, setScope] = useState<MedalScope>(() => (
    schoolMedals?.some(medal => medal.scope === 'school') && !schoolMedals.some(medal => medal.scope === 'platform')
      ? 'school'
      : 'platform'
  ));
  const [classMedals, setClassMedals] = useState(DEFAULT_CLASS_MEDALS);
  const [selectedMedalIds, setSelectedMedalIds] = useState<Set<string>>(new Set());
  const [selectedStudentIds, setSelectedStudentIds] = useState<Set<string>>(new Set());
  const [sheetMode, setSheetMode] = useState<SheetMode>(null);
  const [studentSearch, setStudentSearch] = useState('');
  const [feedback, setFeedback] = useState('');
  const [issueError, setIssueError] = useState('');
  const [isIssuing, setIsIssuing] = useState(false);
  const submitting = useRef(false);
  const feedbackTimer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(feedbackTimer.current), []);
  const [showCreateMedal, setShowCreateMedal] = useState(false);
  const [newMedalName, setNewMedalName] = useState('');
  const [newMedalIconId, setNewMedalIconId] = useState<string | null>(DEFAULT_PLATFORM_MEDALS[0].id);
  const [newMedalUploadedIcon, setNewMedalUploadedIcon] = useState<string | null>(null);

  const isSchoolIssuance = schoolMedals !== undefined;
  const permittedMedals = schoolMedals ?? PLATFORM_MEDALS;
  const permittedIds = new Set(permittedMedals.map(medal => medal.id));
  const platformGroups = PLATFORM_MEDAL_GROUPS
    .map(group => ({ ...group, medals: group.medals.filter(medal => permittedIds.has(medal.id)) }))
    .filter(group => group.medals.length > 0);
  const customMedals = schoolMedals?.filter(medal => medal.scope === 'school') ?? [];
  const scopes: { value: MedalScope; label: string }[] = [
    { value: 'platform', label: '平台奖章' },
    { value: 'school', label: '学校特色奖章' },
    ...(!isSchoolIssuance ? [{ value: 'class' as const, label: '班级奖章' }] : []),
  ];
  const scope = scopes.some(item => item.value === selectedScope) ? selectedScope : scopes[0]?.value;
  const selectedNewMedal = PLATFORM_MEDALS.find(medal => medal.id === newMedalIconId) ?? DEFAULT_PLATFORM_MEDALS[0];
  const selectableMedals = isSchoolIssuance ? permittedMedals : [...PLATFORM_MEDALS, ...classMedals];
  const selectedMedals = selectableMedals.filter(medal => selectedMedalIds.has(medal.id));
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
    setNewMedalIconId(DEFAULT_PLATFORM_MEDALS[0].id);
    setNewMedalUploadedIcon(null);
    setShowCreateMedal(false);
  };

  const issueMedals = async () => {
    if (submitting.current || selectedMedals.length === 0 || selectedStudents.length === 0) return;
    submitting.current = true;
    setIsIssuing(true);
    setIssueError('');
    try {
      if (isSchoolIssuance && !onIssueSchoolMedals) throw new Error('发放失败，请重试');
      const result = await onIssueSchoolMedals?.(selectedStudents.map(student => student.id), selectedMedals.map(medal => medal.id));
      setSelectedStudentIds(new Set());
      setSelectedMedalIds(new Set());
      setSheetMode(null);
      setFeedback(result || '发放成功');
      clearTimeout(feedbackTimer.current);
      feedbackTimer.current = setTimeout(() => setFeedback(''), 1800);
    } catch (error) {
      setIssueError(error instanceof Error && error.name === 'Error' ? error.message : '发放失败，请重试');
    } finally {
      submitting.current = false;
      setIsIssuing(false);
    }
  };

  const renderMedal = (medal: MedalDefinition) => {
    const selected = selectedMedalIds.has(medal.id);
    return (
      <button key={medal.id} type="button" onClick={() => toggleMedal(medal.id)} aria-pressed={selected}
        className="relative flex min-h-[var(--tm-medal-grid-item-min-height)] min-w-0 flex-col items-center justify-center gap-[var(--tm-space-1)] rounded-[var(--tm-radius-card-compact)] border border-transparent bg-[var(--tm-bg-surface)] py-[var(--tm-space-2)] text-center">
        <MobileSelectionIndicator selected={selected} showUnselected={false} className="absolute -right-1 -top-1 z-20" />
        <MedalIconView icon={resolveMedalIcon(medal.id, medal.icon)} className="h-[var(--tm-medal-grid-icon-size)] w-[var(--tm-medal-grid-icon-size)] shrink-0 text-[var(--tm-brand-reward)]" />
        <span className="w-full truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{medal.name}</span>
      </button>
    );
  };
  const medalGridClass = 'grid grid-flow-row grid-cols-4 gap-x-[var(--tm-space-2)] gap-y-[var(--tm-space-3)]';

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-page-plain-content-bg)] text-[var(--tm-text-primary)]">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={onBack} className="-ml-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]" aria-label="返回班级列表"><ChevronLeft className="h-5 w-5" /></button>
        <h1 className="pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[length:var(--tm-font-size-section-title)] font-semibold text-[var(--tm-text-primary)]">发放奖章</h1>
      </header>

      {scope && scopes.length > 1 && <TextSelectionControl<MedalScope>
        value={scope}
        onChange={setScope}
        ariaLabel="奖章分类"
        variant="page"
        items={scopes}
      />}

      <div className="min-h-0 flex-1 overflow-y-auto bg-[var(--tm-page-plain-content-bg)] px-[var(--tm-space-4)] pt-[var(--tm-layout-first-card-gap)] pb-[var(--tm-space-4)] no-scrollbar">

        {scope === 'platform' && (platformGroups.length > 0 ? (
          <div className="space-y-[var(--tm-layout-card-gap)]" aria-label="平台奖章分类">
            {platformGroups.map(group => (
              <section key={group.id} aria-labelledby={`medal-group-${group.id}`}>
                <h2 id={`medal-group-${group.id}`} className="mb-2 text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-text-secondary)]">{group.label}</h2>
                <div className={medalGridClass}>{group.medals.map(renderMedal)}</div>
              </section>
            ))}
          </div>
        ) : <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.BOX_CLIPBOARD} title="暂无可发放的奖章" className="min-h-[360px]" />)}

        {scope === 'school' && (customMedals.length > 0
          ? <div className={medalGridClass} aria-label="学校特色奖章">{customMedals.map(renderMedal)}</div>
          : <MobileEmptyState imageSrc={ASSETS.DEFAULT_STATE.BOX_CLIPBOARD} title="请联系学校管理员添加" className="min-h-[360px]" />)}

        {scope === 'class' && <div className={medalGridClass} aria-label="班级奖章">
          {classMedals.map(renderMedal)}
          <button type="button" onClick={() => setShowCreateMedal(true)} className="relative flex min-h-[var(--tm-medal-grid-item-min-height)] min-w-0 flex-col items-center justify-center px-0 py-[var(--tm-space-2)] text-center text-[var(--tm-text-secondary)] [gap:var(--tm-space-1)] transition active:text-[var(--tm-text-primary)]">
            <span className="flex h-[var(--tm-medal-grid-icon-size)] w-[var(--tm-medal-grid-icon-size)] shrink-0 items-center justify-center"><Plus className="h-7 w-7" /></span>
            <span className="w-full truncate text-[length:var(--tm-font-size-compact)] font-semibold">新增奖章</span>
          </button>
        </div>}
      </div>

      <MobileFormActionBar
        label="选择学生"
        type="button"
        disabled={selectedMedals.length === 0}
        onClick={() => setSheetMode('students')}
      />

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
          <button type="button" disabled={selectedStudentIds.size === 0} onClick={() => setSheetMode('confirm')} className={`${mobileSheetActionClass} flex w-full items-center justify-center bg-[var(--tm-brand-primary)] px-4 font-bold text-[var(--tm-text-inverse)] enabled:active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2 disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]`}>
            {selectedStudentIds.size > 0 ? `发放奖章（${selectedStudentIds.size}人）` : '发放奖章'}
          </button>
        )}
      />

      <MobileBottomSheet open={sheetMode === 'confirm'} title="确认发放" onClose={() => { if (!isIssuing) setSheetMode(null); }} footer={(
        <div className="grid grid-cols-2 gap-[var(--tm-space-3)]">
          <button type="button" disabled={isIssuing} onClick={() => { setIssueError(''); setSheetMode('students'); }} className={`${mobileSheetActionClass} flex items-center justify-center border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3 font-semibold text-[var(--tm-text-secondary)] enabled:active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2 disabled:opacity-50`}>返回修改</button>
          <button type="button" disabled={isIssuing || !selectedMedals.length || !selectedStudents.length} onClick={issueMedals} className={`${mobileSheetActionClass} flex items-center justify-center bg-[var(--tm-brand-primary)] px-3 font-bold text-[var(--tm-text-inverse)] enabled:active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2 disabled:opacity-50`}>{isIssuing ? '发放中…' : '确认发放'}</button>
        </div>
      )}>
        <div className="space-y-[var(--tm-space-5)] pb-[var(--tm-space-2)]">
          {issueError && <p role="alert" className="text-[length:var(--tm-font-size-compact)] text-[var(--tm-status-negative)]">{issueError}</p>}
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
            <div className="mt-[var(--tm-space-3)] grid grid-cols-3 gap-[var(--tm-space-3)]" role="list" aria-label="待发放学生">
              {selectedStudents.map(student => (
                <div key={student.id} role="listitem" className="flex min-w-0 flex-col items-center gap-[var(--tm-space-1)] text-center">
                  <img
                    src={student.avatar || (student.gender === 'female' ? ASSETS.AVATAR.GENERIC_GIRL : ASSETS.AVATAR.GENERIC_BOY)}
                    alt=""
                    decoding="async"
                    className="h-12 w-12 shrink-0 rounded-full bg-[var(--tm-bg-surface-muted)] object-cover"
                  />
                  <span className="w-full break-words text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-primary)]">{student.name}</span>
                </div>
              ))}
            </div>
          </section>
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet open={showCreateMedal} title="新增班级奖章" onClose={() => setShowCreateMedal(false)} footer={(
        <button type="button" disabled={!newMedalName.trim()} onClick={createClassMedal} className={`${mobileSheetActionClass} flex w-full items-center justify-center bg-[var(--tm-brand-primary)] font-bold text-[var(--tm-text-inverse)] enabled:active:bg-[var(--tm-brand-primary-pressed)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-focus-ring)] focus-visible:ring-offset-2 disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]`}>保存奖章</button>
      )}>
        <div className="space-y-[var(--tm-form-section-gap)]">
          <label className="block space-y-2">
            <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">奖章名称</span>
            <input value={newMedalName} onChange={event => setNewMedalName(event.target.value)} maxLength={12} placeholder="请输入奖章名称" aria-label="奖章名称" className="h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control-compact)] bg-[var(--tm-input-bg)] px-3 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)]" />
          </label>
          <fieldset className="space-y-2">
            <legend className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">选择图标</legend>
            <div className="grid grid-cols-5 gap-2">
              {PLATFORM_MEDALS.map(platformMedal => {
                const selected = !newMedalUploadedIcon && selectedNewMedal.id === platformMedal.id;
                return <button key={platformMedal.id} type="button" aria-label={`选择${platformMedal.name}图标`} aria-pressed={selected} onClick={() => { setNewMedalIconId(platformMedal.id); setNewMedalUploadedIcon(null); }} className={`flex min-h-[var(--tm-size-touch)] items-center justify-center rounded-[var(--tm-radius-control-compact)] px-1 ${selected ? 'bg-[var(--tm-brand-reward-soft)] ring-2 ring-inset ring-[var(--tm-brand-reward)]' : 'bg-[var(--tm-bg-surface-soft)]'}`}><MedalIconView icon={resolveMedalIcon(platformMedal.id, platformMedal.icon)} className="h-9 w-9" /></button>;
              })}
              <label className={`relative flex min-h-[var(--tm-size-touch)] cursor-pointer flex-col items-center justify-center gap-0.5 rounded-[var(--tm-radius-control-compact)] px-1 text-[var(--tm-text-secondary)] ${newMedalUploadedIcon ? 'bg-[var(--tm-brand-reward-soft)] ring-2 ring-inset ring-[var(--tm-brand-reward)]' : 'bg-[var(--tm-bg-surface-soft)]'}`}>
                {newMedalUploadedIcon ? <img src={newMedalUploadedIcon} alt="已上传图标" className="h-9 w-9 object-contain" /> : <ImagePlus className="h-5 w-5" aria-hidden="true" />}
                <span className="text-[10px] font-semibold leading-4">上传图片</span>
                <input type="file" accept="image/*" className="sr-only" aria-label="上传奖章图标" onChange={event => handleMedalIconUpload(event.target.files?.[0])} />
              </label>
            </div>
          </fieldset>
        </div>
      </MobileBottomSheet>

      <MobileToast message={feedback} />
    </div>
  );
};

export default MedalIssuanceView;
