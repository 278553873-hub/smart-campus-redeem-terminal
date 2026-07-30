import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  LogOut,
  Pencil,
  Repeat2,
  UserPlus,
} from 'lucide-react';
import { MobileCard } from '../components/ui/MobileCard';
import MobileBottomSheet from '../components/ui/MobileBottomSheet';
import {
  buildClassName,
  EDUCATION_STAGE_OPTIONS,
  getAdmissionYearOptions,
  getGradeLevel,
  inferAdmissionYear,
  inferClassNumber,
  inferEducationStage,
} from '../domain/classInfo';
import { phoneText } from '../styles/teacherMobileTokens';
import type { ClassInfo, EducationStage, Student, TeacherProfile } from '../types';
import { copyText } from '../utils/copyText';

export type ClassInfoRole = 'headTeacher' | 'deputyHeadTeacher' | 'teacher';
export type ClassInfoSpaceType = 'personal' | 'collaboration' | 'school';

interface ClassInfoViewProps {
  classInfo: ClassInfo;
  classRole: ClassInfoRole;
  spaceType: ClassInfoSpaceType;
  teacherProfile: TeacherProfile;
  students: Student[];
  onBack: () => void;
  onSave: (classInfo: ClassInfo) => void;
  onInviteTeacher: () => void;
  onInviteParent: () => void;
}

interface EditDraft {
  educationStage: EducationStage;
  admissionYear: number;
  classNumber: string;
}

interface ClassTeacherItem {
  id: string;
  name: string;
  subjects: string[];
  role: ClassInfoRole;
}

type DetailPage = 'detail' | 'teachers' | 'parents';

const createDraft = (classInfo: ClassInfo): EditDraft => ({
  educationStage: inferEducationStage(classInfo),
  admissionYear: inferAdmissionYear(classInfo),
  classNumber: String(inferClassNumber(classInfo)),
});

const fieldClass = 'h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] outline-none transition focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]';
const iconButtonClass = 'flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]';
const secondaryButtonClass = 'flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]';

const getRoleLabel = (role: ClassInfoRole): string => {
  if (role === 'headTeacher') return '班主任';
  if (role === 'deputyHeadTeacher') return '副班主任';
  return '任课老师';
};

const buildTeachers = (teacherProfile: TeacherProfile, classRole: ClassInfoRole): ClassTeacherItem[] => {
  const currentTeacher: ClassTeacherItem = {
    id: 'current',
    name: teacherProfile.name,
    subjects: teacherProfile.teachingAssignments.slice(0, 2).map(item => item.subject),
    role: classRole,
  };
  const sampleTeachers: ClassTeacherItem[] = [
    { id: 'chen', name: '陈老师', subjects: ['语文', '书法'], role: 'deputyHeadTeacher' },
    { id: 'li', name: '李老师', subjects: ['数学', '科学'], role: classRole === 'headTeacher' ? 'teacher' : 'headTeacher' },
    { id: 'wang', name: '王老师', subjects: ['英语'], role: 'teacher' },
    { id: 'zhao', name: '赵老师', subjects: ['体育', '劳动'], role: 'deputyHeadTeacher' },
    { id: 'liu', name: '刘老师', subjects: ['美术'], role: 'teacher' },
    { id: 'ma', name: '马老师', subjects: ['信息科技'], role: 'teacher' },
    { id: 'gao', name: '高老师', subjects: ['综合实践'], role: 'teacher' },
  ];
  return [currentTeacher, ...sampleTeachers];
};

const TeacherAvatar: React.FC<{ teacher: ClassTeacherItem }> = ({ teacher }) => (
  <div className="w-[var(--tm-size-touch)] shrink-0 text-center">
    <div className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full bg-[var(--tm-bg-surface-soft)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">
      {teacher.name.slice(0, 1)}
    </div>
    <div className="mt-[var(--tm-space-1)] truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">
      {teacher.name}
    </div>
  </div>
);

const ClassInfoView: React.FC<ClassInfoViewProps> = ({
  classInfo,
  classRole,
  spaceType,
  teacherProfile,
  students,
  onBack,
  onSave,
  onInviteTeacher,
  onInviteParent,
}) => {
  const [page, setPage] = useState<DetailPage>('detail');
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showTransferSheet, setShowTransferSheet] = useState(false);
  const [showDangerSheet, setShowDangerSheet] = useState(false);
  const [transferTeacherId, setTransferTeacherId] = useState('');
  const [draft, setDraft] = useState<EditDraft>(() => createDraft(classInfo));
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  const canEdit = classRole === 'headTeacher' || classRole === 'deputyHeadTeacher';
  const canInvite = canEdit;
  const canTransfer = classRole === 'headTeacher';
  const isPersonalOwner = spaceType === 'personal' && classRole === 'headTeacher';
  const activeStudents = useMemo(
    () => students.filter(student => (student.status ?? 'active') === 'active'),
    [students],
  );
  const teachers = useMemo(() => buildTeachers(teacherProfile, classRole), [classRole, teacherProfile]);
  const parentRows = useMemo(() => activeStudents.map((student, index) => ({
    student,
    bound: index >= 2,
  })), [activeStudents]);
  const boundParentCount = parentRows.filter(row => row.bound).length;
  const admissionYearOptions = useMemo(
    () => getAdmissionYearOptions(draft.educationStage),
    [draft.educationStage],
  );
  const classNumber = Number(draft.classNumber);
  const canCompleteEdit = /^\d{1,2}$/.test(draft.classNumber) && classNumber > 0;
  const title = page === 'teachers' ? '老师列表' : page === 'parents' ? '家长绑定列表' : '班级详情';

  useEffect(() => {
    if (!toast) return undefined;
    const timer = window.setTimeout(() => setToast(null), 1600);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const showToast = (message: string, success = true) => setToast({ message, success });

  const handleBack = () => {
    if (page !== 'detail') {
      setPage('detail');
      return;
    }
    onBack();
  };

  const openEditSheet = () => {
    setDraft(createDraft(classInfo));
    setShowEditSheet(true);
  };

  const updateEducationStage = (educationStage: EducationStage) => {
    const nextYears = getAdmissionYearOptions(educationStage);
    setDraft(current => ({
      ...current,
      educationStage,
      admissionYear: nextYears.includes(current.admissionYear) ? current.admissionYear : nextYears[0],
    }));
  };

  const handleCopyClassCode = async () => {
    const success = await copyText(classInfo.classCode);
    showToast(success ? '班级号已复制' : '复制失败，请重试', success);
  };

  const handleSave = () => {
    if (!canCompleteEdit) return;
    onSave({
      ...classInfo,
      name: buildClassName(draft.admissionYear, classNumber),
      gradeLevel: getGradeLevel(draft.educationStage, draft.admissionYear),
      educationStage: draft.educationStage,
      admissionYear: draft.admissionYear,
      classNumber,
    });
    setShowEditSheet(false);
    showToast('班级信息已更新');
  };

  const confirmTransfer = () => {
    const target = teachers.find(teacher => teacher.id === transferTeacherId);
    if (!target) return;
    setShowTransferSheet(false);
    showToast(`已将班主任转移给${target.name}`);
  };

  const renderSectionHeader = (label: string, count: string, onViewAll: () => void, ariaLabel: string) => (
    <div className="flex min-h-[var(--tm-size-touch)] items-center justify-between gap-[var(--tm-space-3)]">
      <h2 className={`${phoneText.sectionTitle} min-w-0 text-[var(--tm-text-primary)]`}>
        {label}<span className="ml-[var(--tm-space-1)] text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-tertiary)]">({count})</span>
      </h2>
      <button type="button" onClick={onViewAll} className={iconButtonClass} aria-label={ariaLabel}>
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  );

  const renderDetail = () => (
    <>
      <MobileCard variant="card" padding="md" className="relative">
        {canEdit && (
          <button
            type="button"
            onClick={openEditSheet}
            className={`${iconButtonClass} absolute right-[var(--tm-space-3)] top-[var(--tm-space-3)] text-[var(--tm-brand-primary)]`}
            aria-label="编辑班级信息"
          >
            <Pencil className="h-[18px] w-[18px]" />
          </button>
        )}
        <h2 className={`${phoneText.pageTitle} truncate text-[var(--tm-text-primary)] ${canEdit ? 'pr-[calc(var(--tm-size-touch)+var(--tm-space-2))]' : ''}`}>
          {classInfo.name}（{classInfo.gradeLevel}）
        </h2>
        <div className="mt-[var(--tm-space-3)] flex min-h-[var(--tm-size-touch)] items-center justify-between gap-[var(--tm-space-3)] text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-secondary)]">
          <button
            type="button"
            onClick={handleCopyClassCode}
            className="-ml-[var(--tm-space-2)] inline-flex min-h-[var(--tm-size-touch)] min-w-0 items-center gap-[var(--tm-space-1)] rounded-[var(--tm-radius-control)] px-[var(--tm-space-2)] text-left active:bg-[var(--tm-bg-surface-soft)]"
            aria-label={`复制班级号${classInfo.classCode}`}
          >
            <span className="shrink-0">班级号：</span>
            <span className="truncate font-semibold tabular-nums text-[var(--tm-text-primary)]">{classInfo.classCode}</span>
            {toast?.success && toast.message === '班级号已复制'
              ? <Check className="h-4 w-4 shrink-0 text-[var(--tm-status-positive)]" />
              : <Copy className="h-4 w-4 shrink-0 text-[var(--tm-brand-primary)]" />}
          </button>
          <span className="shrink-0 tabular-nums">{activeStudents.length}人</span>
        </div>
      </MobileCard>

      <MobileCard variant="card" padding="md" className="mt-[var(--tm-space-4)]">
        {renderSectionHeader('老师列表', `${teachers.length}人`, () => setPage('teachers'), '查看完整老师列表')}
        <div className="mt-[var(--tm-space-3)] flex justify-between gap-[var(--tm-space-2)] overflow-hidden">
          {teachers.slice(0, 5).map(teacher => <TeacherAvatar key={teacher.id} teacher={teacher} />)}
        </div>
        {canInvite && (
          <button type="button" onClick={onInviteTeacher} className={`${secondaryButtonClass} mt-[var(--tm-space-4)]`}>
            <UserPlus className="h-[18px] w-[18px]" />
            邀请老师
          </button>
        )}
      </MobileCard>

      <MobileCard variant="card" padding="md" className="mt-[var(--tm-space-4)]">
        {renderSectionHeader('家长绑定列表', `${boundParentCount}/${parentRows.length}`, () => setPage('parents'), '查看完整家长绑定列表')}
        <div className="mt-[var(--tm-space-3)] grid grid-cols-2 gap-[var(--tm-space-2)]">
          {parentRows.slice(0, 4).map(({ student, bound }) => (
            <div key={student.id} className="flex min-w-0 items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-2)]">
              {student.avatar ? (
                <img src={student.avatar} alt="" className="h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 rounded-full object-cover" />
              ) : (
                <div className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{student.name.slice(0, 1)}</div>
              )}
              <div className="min-w-0">
                <div className="truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{student.name}</div>
                <div className={`mt-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] ${bound ? 'text-[var(--tm-status-positive-strong)]' : 'text-[var(--tm-text-tertiary)]'}`}>
                  {bound ? '已绑定' : '未绑定'}
                </div>
              </div>
            </div>
          ))}
        </div>
        {canInvite && (
          <button type="button" onClick={onInviteParent} className={`${secondaryButtonClass} mt-[var(--tm-space-4)]`}>
            <UserPlus className="h-[18px] w-[18px]" />
            邀请家长绑定
          </button>
        )}
      </MobileCard>
    </>
  );

  const renderTeacherList = () => (
    <MobileCard variant="card" padding="none" className="overflow-hidden">
      {teachers.map((teacher, index) => (
        <div key={teacher.id} className={`flex min-h-[72px] items-center gap-[var(--tm-space-3)] px-[var(--tm-space-4)] py-[var(--tm-space-3)] ${index > 0 ? 'border-t border-[var(--tm-border-subtle)]' : ''}`}>
          <div className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface-soft)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{teacher.name.slice(0, 1)}</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{teacher.name}{teacher.id === 'current' ? '（我）' : ''}</div>
            <div className="mt-[var(--tm-space-1)] flex flex-wrap gap-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
              <span className={teacher.role === 'teacher' ? '' : 'text-[var(--tm-record-class-text)]'}>{getRoleLabel(teacher.role)}</span>
              {teacher.subjects.length > 0 && <span>· {teacher.subjects.join('、')}</span>}
            </div>
          </div>
        </div>
      ))}
      {canInvite && (
        <div className="border-t border-[var(--tm-border-subtle)] p-[var(--tm-space-4)]">
          <button type="button" onClick={onInviteTeacher} className={secondaryButtonClass}>
            <UserPlus className="h-[18px] w-[18px]" />邀请老师
          </button>
        </div>
      )}
    </MobileCard>
  );

  const renderParentList = () => (
    <MobileCard variant="card" padding="none" className="overflow-hidden">
      {parentRows.map(({ student, bound }, index) => (
        <div key={student.id} className={`flex min-h-[72px] items-center gap-[var(--tm-space-3)] px-[var(--tm-space-4)] py-[var(--tm-space-3)] ${index > 0 ? 'border-t border-[var(--tm-border-subtle)]' : ''}`}>
          {student.avatar ? (
            <img src={student.avatar} alt="" className="h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface-soft)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{student.name.slice(0, 1)}</div>
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{student.name}</div>
            <div className="mt-[var(--tm-space-1)] truncate text-[length:var(--tm-font-size-meta)] tabular-nums text-[var(--tm-text-tertiary)]">{student.studentNo ?? student.id}</div>
          </div>
          <span className={`shrink-0 text-[length:var(--tm-font-size-compact)] font-semibold ${bound ? 'text-[var(--tm-status-positive-strong)]' : 'text-[var(--tm-text-tertiary)]'}`}>
            {bound ? '已绑定' : '未绑定'}
          </span>
        </div>
      ))}
      {canInvite && (
        <div className="border-t border-[var(--tm-border-subtle)] p-[var(--tm-space-4)]">
          <button type="button" onClick={onInviteParent} className={secondaryButtonClass}>
            <UserPlus className="h-[18px] w-[18px]" />邀请家长绑定
          </button>
        </div>
      )}
    </MobileCard>
  );

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={handleBack} className={`${iconButtonClass} -ml-[var(--tm-space-2)]`} aria-label={page === 'detail' ? '返回班级列表' : '返回班级详情'}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className={`${phoneText.navTitle} pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[var(--tm-text-primary)]`}>{title}</h1>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-5)] py-[var(--tm-space-4)] no-scrollbar">
        {page === 'detail' && renderDetail()}
        {page === 'teachers' && renderTeacherList()}
        {page === 'parents' && renderParentList()}
      </main>

      {page === 'detail' && (
        <footer className="shrink-0 space-y-[var(--tm-space-2)] border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-5)] pb-safe pt-[var(--tm-space-3)]">
          {canTransfer && (
            <button type="button" onClick={() => setShowTransferSheet(true)} className={secondaryButtonClass}>
              <Repeat2 className="h-[18px] w-[18px]" />转移班主任
            </button>
          )}
          <button type="button" onClick={() => setShowDangerSheet(true)} className={`${secondaryButtonClass} text-[var(--tm-status-negative-strong)]`}>
            <LogOut className="h-[18px] w-[18px]" />{isPersonalOwner ? '解散班级' : '退出班级'}
          </button>
        </footer>
      )}

      {toast && (
        <div className="pointer-events-none absolute inset-x-[var(--tm-space-5)] top-[var(--tm-space-3)] z-[80] flex justify-center" role="status" aria-live="polite">
          <div className={`rounded-[var(--tm-radius-control)] px-[var(--tm-space-4)] py-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] shadow-[var(--tm-shadow-card-raised)] ${toast.success ? 'bg-[var(--tm-text-primary)]' : 'bg-[var(--tm-status-negative)]'}`}>
            {toast.message}
          </div>
        </div>
      )}

      <MobileBottomSheet
        open={showEditSheet}
        title="编辑班级信息"
        onClose={() => setShowEditSheet(false)}
        footer={(
          <div className="mb-[var(--tm-space-4)] grid grid-cols-2 gap-[var(--tm-space-2)]">
            <button type="button" onClick={() => setShowEditSheet(false)} className={secondaryButtonClass}>取消</button>
            <button
              type="button"
              disabled={!canCompleteEdit}
              onClick={handleSave}
              className="min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]"
            >
              完成
            </button>
          </div>
        )}
      >
        <div className="space-y-[var(--tm-space-5)] pb-[var(--tm-space-2)]">
          <fieldset>
            <legend className={`${phoneText.label} text-[var(--tm-text-tertiary)]`}>学段</legend>
            <div className="mt-[var(--tm-space-2)] grid min-h-[var(--tm-size-touch)] grid-cols-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-1)]">
              {EDUCATION_STAGE_OPTIONS.map(option => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => updateEducationStage(option.value)}
                  aria-pressed={draft.educationStage === option.value}
                  className={`min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-inner)] text-[length:var(--tm-font-size-body)] font-semibold transition ${draft.educationStage === option.value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className={`${phoneText.label} text-[var(--tm-text-tertiary)]`}>入学年份</span>
            <select
              value={draft.admissionYear}
              onChange={event => setDraft(current => ({ ...current, admissionYear: Number(event.target.value) }))}
              className={`mt-[var(--tm-space-2)] ${fieldClass}`}
              aria-label="入学年份"
            >
              {admissionYearOptions.map(year => <option key={year} value={year}>{year}年</option>)}
            </select>
          </label>

          <label className="block">
            <span className={`${phoneText.label} text-[var(--tm-text-tertiary)]`}>班号</span>
            <div className="mt-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] items-center rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-3)] focus-within:border-[var(--tm-brand-primary)] focus-within:ring-2 focus-within:ring-[var(--tm-input-focus-ring)]">
              <span className="shrink-0 text-[length:var(--tm-font-size-body)] text-[var(--tm-text-secondary)]">{draft.admissionYear}级</span>
              <input
                value={draft.classNumber}
                onChange={event => setDraft(current => ({ ...current, classNumber: event.target.value.replace(/\D/g, '').slice(0, 2) }))}
                inputMode="numeric"
                pattern="[0-9]*"
                className="mx-[var(--tm-space-2)] h-[var(--tm-size-touch)] min-w-0 flex-1 bg-transparent text-center text-[length:var(--tm-font-size-body)] font-semibold tabular-nums text-[var(--tm-text-primary)] outline-none"
                aria-label="班号数字"
              />
              <span className="shrink-0 text-[length:var(--tm-font-size-body)] text-[var(--tm-text-secondary)]">班</span>
            </div>
          </label>
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={showTransferSheet}
        title="转移班主任"
        onClose={() => setShowTransferSheet(false)}
        footer={(
          <div className="mb-[var(--tm-space-4)] grid grid-cols-2 gap-[var(--tm-space-2)]">
            <button type="button" onClick={() => setShowTransferSheet(false)} className={secondaryButtonClass}>取消</button>
            <button type="button" disabled={!transferTeacherId} onClick={confirmTransfer} className="min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]">完成</button>
          </div>
        )}
      >
        <div className="space-y-[var(--tm-space-2)] pb-[var(--tm-space-2)]">
          {teachers.filter(teacher => teacher.id !== 'current').map(teacher => (
            <button
              key={teacher.id}
              type="button"
              onClick={() => setTransferTeacherId(teacher.id)}
              aria-pressed={transferTeacherId === teacher.id}
              className={`flex min-h-[var(--tm-size-touch)] w-full items-center justify-between rounded-[var(--tm-radius-inner)] px-[var(--tm-space-4)] text-left text-[length:var(--tm-font-size-body)] font-semibold ${transferTeacherId === teacher.id ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-primary)]'}`}
            >
              <span>{teacher.name}</span>
              {transferTeacherId === teacher.id && <Check className="h-[18px] w-[18px]" />}
            </button>
          ))}
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={showDangerSheet}
        title={isPersonalOwner ? '解散班级' : '退出班级'}
        onClose={() => setShowDangerSheet(false)}
        footer={(
          <div className="mb-[var(--tm-space-4)] grid grid-cols-2 gap-[var(--tm-space-2)]">
            <button type="button" onClick={() => setShowDangerSheet(false)} className={secondaryButtonClass}>取消</button>
            <button
              type="button"
              onClick={() => {
                setShowDangerSheet(false);
                showToast(isPersonalOwner ? '已解散班级' : '已退出班级');
              }}
              className="min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-status-negative-strong)]"
            >
              {isPersonalOwner ? '确认解散' : '确认退出'}
            </button>
          </div>
        )}
      >
        <p className={`${phoneText.body} pb-[var(--tm-space-2)] text-[var(--tm-text-secondary)]`}>
          {isPersonalOwner
            ? `解散后将清空“${classInfo.name}”的班级与学生信息，且无法恢复。`
            : `退出后，你将无法继续查看和记录“${classInfo.name}”的数据。`}
        </p>
      </MobileBottomSheet>
    </div>
  );
};

export default ClassInfoView;
