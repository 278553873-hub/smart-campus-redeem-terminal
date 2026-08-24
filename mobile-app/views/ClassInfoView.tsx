import React, { useEffect, useMemo, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  LogOut,
  MoreHorizontal,
  Pencil,
  Phone,
  QrCode,
  Repeat2,
  Share2,
  Trash2,
  UserCog,
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
import type {
  ClassInfo,
  EducationStage,
  GuardianRelation,
  Student,
  StudentLevelDisplayMode,
  TeacherProfile,
} from '../types';
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

interface ParentGuardianItem {
  id: string;
  relation: GuardianRelation;
  relationOther: string;
  phone: string;
}

interface ParentBindingItem {
  student: Student;
  guardians: ParentGuardianItem[];
}

interface GuardianTarget {
  studentId: string;
  guardianId: string;
}

type DetailPage = 'detail' | 'teachers' | 'parents';
type ParentBindingTab = 'unbound' | 'bound';
type InviteAudience = 'teacher' | 'parent';
type InviteStep = 'methods' | 'copy' | 'qr';
type DangerStep = 'check' | 'final';

const LEVEL_DISPLAY_OPTIONS: Array<{ value: StudentLevelDisplayMode; label: string }> = [
  { value: 'term', label: '仅计算本学期' },
  { value: 'cumulative', label: '累计所有学期' },
];

const createDraft = (classInfo: ClassInfo): EditDraft => ({
  educationStage: inferEducationStage(classInfo),
  admissionYear: inferAdmissionYear(classInfo),
  classNumber: String(inferClassNumber(classInfo)),
});

const fieldClass = 'h-[var(--tm-size-touch)] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-3)] text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-input-text)] outline-none transition placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:opacity-100 read-only:border-[var(--tm-input-readonly-border)] read-only:bg-[var(--tm-input-readonly-bg)] read-only:text-[var(--tm-input-readonly-text)]';
const iconButtonClass = 'flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]';
const secondaryButtonClass = 'flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-soft)]';
const primaryButtonClass = 'flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-brand-primary-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]';
const dangerButtonClass = 'flex min-h-[var(--tm-size-touch)] w-full items-center justify-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative)] px-[var(--tm-space-4)] text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] active:bg-[var(--tm-status-negative-strong)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-disabled)]';
const fixedFooterClass = 'shrink-0 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-[var(--tm-space-5)] pb-[calc(var(--tm-space-4)+env(safe-area-inset-bottom))] pt-[var(--tm-space-3)]';

const getRoleLabel = (role: ClassInfoRole): string => {
  if (role === 'headTeacher') return '班主任';
  if (role === 'deputyHeadTeacher') return '副班主任';
  return '任课老师';
};

const getGuardianLabel = (guardian: ParentGuardianItem): string => (
  guardian.relation === '其他' ? guardian.relationOther.trim() || '其他' : guardian.relation
);

const buildTeachers = (teacherProfile: TeacherProfile, classRole: ClassInfoRole): ClassTeacherItem[] => {
  const currentSubjects = Array.from(new Set(teacherProfile.teachingAssignments.map(item => item.subject))).slice(0, 2);
  const currentTeacher: ClassTeacherItem = {
    id: 'current',
    name: teacherProfile.name,
    subjects: currentSubjects,
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

const buildParentBindings = (students: Student[]): ParentBindingItem[] => students
  .filter(student => (student.status ?? 'active') === 'active')
  .map((student, index) => {
    const contacts = student.guardianContacts ?? [];
    const sampleContacts = index < 2 ? [] : [{
      phone: `138****${String(5200 + index).slice(-4)}`,
      relation: (index % 2 === 0 ? '妈妈' : '爸爸') as GuardianRelation,
    }];
    const guardians = (contacts.length > 0 ? contacts : sampleContacts).map((contact, guardianIndex) => ({
      id: `${student.id}-guardian-${guardianIndex}`,
      relation: contact.relation,
      relationOther: contact.relationOther ?? '',
      phone: contact.phone,
    }));
    return { student, guardians };
  });

const sortTeachers = (teachers: ClassTeacherItem[]): ClassTeacherItem[] => [...teachers].sort((left, right) => {
  const roleOrder: Record<ClassInfoRole, number> = { headTeacher: 0, deputyHeadTeacher: 1, teacher: 2 };
  return roleOrder[left.role] - roleOrder[right.role];
});

const TeacherAvatar: React.FC<{ teacher: ClassTeacherItem }> = ({ teacher }) => (
  <div className="w-[var(--tm-size-touch)] shrink-0 text-center">
    <div className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] items-center justify-center rounded-full bg-[var(--tm-bg-surface-soft)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">
      {teacher.name.slice(0, 1)}
    </div>
    <div className="mt-[var(--tm-space-1)] truncate text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-primary)]">
      {teacher.name}
    </div>
  </div>
);

const StudentAvatar: React.FC<{ student: Student }> = ({ student }) => student.avatar ? (
  <img src={student.avatar} alt="" className="h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 rounded-full object-cover" />
) : (
  <div className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface-soft)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">
    {student.name.slice(0, 1)}
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
}) => {
  const [page, setPage] = useState<DetailPage>('detail');
  const [effectiveRole, setEffectiveRole] = useState(classRole);
  const [teacherItems, setTeacherItems] = useState<ClassTeacherItem[]>(() => buildTeachers(teacherProfile, classRole));
  const [parentItems, setParentItems] = useState<ParentBindingItem[]>(() => buildParentBindings(students));
  const [parentTab, setParentTab] = useState<ParentBindingTab>('unbound');
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showLevelDisplaySheet, setShowLevelDisplaySheet] = useState(false);
  const [levelDisplayDraft, setLevelDisplayDraft] = useState<StudentLevelDisplayMode>(classInfo.studentLevelDisplayMode ?? 'term');
  const [activeTeacher, setActiveTeacher] = useState<ClassTeacherItem | null>(null);
  const [removeTeacherTarget, setRemoveTeacherTarget] = useState<ClassTeacherItem | null>(null);
  const [showTransferSheet, setShowTransferSheet] = useState(false);
  const [transferTarget, setTransferTarget] = useState<ClassTeacherItem | null>(null);
  const [activeGuardian, setActiveGuardian] = useState<GuardianTarget | null>(null);
  const [guardianDraft, setGuardianDraft] = useState<ParentGuardianItem | null>(null);
  const [editingGuardian, setEditingGuardian] = useState(false);
  const [removeGuardianTarget, setRemoveGuardianTarget] = useState<GuardianTarget | null>(null);
  const [showDangerSheet, setShowDangerSheet] = useState(false);
  const [dangerStep, setDangerStep] = useState<DangerStep>('check');
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [inviteAudience, setInviteAudience] = useState<InviteAudience | null>(null);
  const [inviteStep, setInviteStep] = useState<InviteStep>('methods');
  const [draft, setDraft] = useState<EditDraft>(() => createDraft(classInfo));
  const [toast, setToast] = useState<{ message: string; success: boolean } | null>(null);

  const canEdit = effectiveRole === 'headTeacher' || effectiveRole === 'deputyHeadTeacher';
  const canConfigureLevelDisplay = effectiveRole === 'headTeacher';
  const canInvite = canEdit;
  const canManageTeachers = effectiveRole === 'headTeacher';
  const canManageParents = effectiveRole === 'headTeacher' || effectiveRole === 'deputyHeadTeacher';
  const canTransfer = effectiveRole === 'headTeacher';
  const isPersonalOwner = spaceType === 'personal' && effectiveRole === 'headTeacher';
  const teachers = useMemo(() => sortTeachers(teacherItems), [teacherItems]);
  const levelDisplayMode = classInfo.studentLevelDisplayMode ?? 'term';
  const levelDisplayLabel = LEVEL_DISPLAY_OPTIONS.find(option => option.value === levelDisplayMode)?.label ?? '仅计算本学期';
  const unboundParents = useMemo(() => parentItems.filter(item => item.guardians.length === 0), [parentItems]);
  const boundParents = useMemo(() => parentItems.filter(item => item.guardians.length > 0), [parentItems]);
  const boundParentCount = boundParents.length;
  const activeGuardianRecord = useMemo(() => {
    if (!activeGuardian) return null;
    const parent = parentItems.find(item => item.student.id === activeGuardian.studentId);
    const guardian = parent?.guardians.find(item => item.id === activeGuardian.guardianId);
    return parent && guardian ? { parent, guardian } : null;
  }, [activeGuardian, parentItems]);
  const removeGuardianRecord = useMemo(() => {
    if (!removeGuardianTarget) return null;
    const parent = parentItems.find(item => item.student.id === removeGuardianTarget.studentId);
    const guardian = parent?.guardians.find(item => item.id === removeGuardianTarget.guardianId);
    return parent && guardian ? { parent, guardian } : null;
  }, [parentItems, removeGuardianTarget]);
  const admissionYearOptions = useMemo(
    () => getAdmissionYearOptions(draft.educationStage),
    [draft.educationStage],
  );
  const classNumber = Number(draft.classNumber);
  const canCompleteEdit = /^\d{1,2}$/.test(draft.classNumber) && classNumber > 0;
  const displayClassName = buildClassName(inferAdmissionYear(classInfo), inferClassNumber(classInfo));
  const title = page === 'teachers' ? '老师列表' : page === 'parents' ? '家长绑定列表' : '班级详情';
  const inviteTitle = inviteAudience === 'teacher' ? '邀请老师加入' : '邀请家长绑定';
  const currentTeacherFullName = teacherProfile.name.trim();
  const parentInviteTeacherName = currentTeacherFullName.endsWith('老师')
    ? currentTeacherFullName
    : `${currentTeacherFullName}老师`;
  const inviteText = inviteAudience === 'teacher'
    ? `${teacherProfile.name}邀请你加入“${displayClassName}”，共同参与班级管理。班级号：${classInfo.classCode}`
    : `家长您好，${parentInviteTeacherName}邀请您绑定「${displayClassName}」的学生，查看孩子的日常评价记录和成长报告。点击链接 ai-literacy://bind-student?code=${classInfo.classCode}，直接完成绑定。`;
  const parentQrInviteText = `家长您好，${parentInviteTeacherName}邀请您绑定「${displayClassName}」的学生，查看孩子的日常评价记录和成长报告。微信扫描上方二维码即可完成绑定。`;
  const inviteQrAsset = inviteAudience === 'teacher' ? '/assets/ai_literacy_qr.png' : '/assets/compass_qr.png';

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

  const openInvite = (audience: InviteAudience) => {
    setInviteAudience(audience);
    setInviteStep('methods');
  };

  const closeInvite = () => {
    setInviteAudience(null);
    setInviteStep('methods');
  };

  const shareInvite = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: inviteTitle, text: inviteText });
        closeInvite();
        return;
      }
      const success = await copyText(inviteText);
      closeInvite();
      showToast(success ? '邀请文案已复制' : '复制失败，请重试', success);
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      showToast('分享失败，请重试', false);
    }
  };

  const copyInvite = async () => {
    const success = await copyText(inviteText);
    if (success) closeInvite();
    showToast(success ? '邀请文案已复制' : '复制失败，请重试', success);
  };

  const toggleDeputyRole = () => {
    if (!activeTeacher) return;
    const nextRole: ClassInfoRole = activeTeacher.role === 'deputyHeadTeacher' ? 'teacher' : 'deputyHeadTeacher';
    setTeacherItems(items => items.map(item => item.id === activeTeacher.id ? { ...item, role: nextRole } : item));
    showToast(`${activeTeacher.name}${nextRole === 'deputyHeadTeacher' ? '已设为副班主任' : '已取消副班主任'}`);
    setActiveTeacher(null);
  };

  const removeTeacher = () => {
    if (!removeTeacherTarget) return;
    setTeacherItems(items => items.filter(item => item.id !== removeTeacherTarget.id));
    showToast(`已移除${removeTeacherTarget.name}`);
    setRemoveTeacherTarget(null);
  };

  const confirmTransfer = () => {
    if (!transferTarget) return;
    setTeacherItems(items => items.map(item => {
      if (item.id === 'current') return { ...item, role: 'teacher' };
      if (item.id === transferTarget.id) return { ...item, role: 'headTeacher' };
      return item.role === 'headTeacher' ? { ...item, role: 'teacher' } : item;
    }));
    setEffectiveRole('teacher');
    showToast(`班主任已转移给${transferTarget.name}`);
    setTransferTarget(null);
  };

  const openGuardianDetail = (target: GuardianTarget) => {
    const parent = parentItems.find(item => item.student.id === target.studentId);
    const guardian = parent?.guardians.find(item => item.id === target.guardianId);
    if (!guardian) return;
    setActiveGuardian(target);
    setGuardianDraft({ ...guardian });
    setEditingGuardian(false);
  };

  const closeGuardianDetail = () => {
    setActiveGuardian(null);
    setGuardianDraft(null);
    setEditingGuardian(false);
  };

  const saveGuardian = () => {
    if (!activeGuardian || !guardianDraft) return;
    setParentItems(items => items.map(item => item.student.id === activeGuardian.studentId ? {
      ...item,
      guardians: item.guardians.map(guardian => guardian.id === activeGuardian.guardianId ? guardianDraft : guardian),
    } : item));
    closeGuardianDetail();
    showToast('家长信息已更新');
  };

  const removeGuardian = () => {
    if (!removeGuardianTarget || !removeGuardianRecord) return;
    setParentItems(items => items.map(item => item.student.id === removeGuardianTarget.studentId ? {
      ...item,
      guardians: item.guardians.filter(guardian => guardian.id !== removeGuardianTarget.guardianId),
    } : item));
    showToast(`已解除${removeGuardianRecord.parent.student.name}${getGuardianLabel(removeGuardianRecord.guardian)}的绑定`);
    setRemoveGuardianTarget(null);
  };

  const closeDangerSheet = () => {
    setShowDangerSheet(false);
    setDangerStep('check');
    setDeleteConfirmText('');
  };

  const completeDangerAction = () => {
    if (isPersonalOwner && dangerStep === 'check') {
      setDangerStep('final');
      return;
    }
    closeDangerSheet();
    showToast(isPersonalOwner ? '已解散班级' : '已退出班级');
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

  const openLevelDisplaySheet = () => {
    setLevelDisplayDraft(levelDisplayMode);
    setShowLevelDisplaySheet(true);
  };

  const saveLevelDisplayMode = () => {
    onSave({ ...classInfo, studentLevelDisplayMode: levelDisplayDraft });
    setShowLevelDisplaySheet(false);
    showToast('等级展示规则已更新');
  };

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
        <h2 className={`truncate text-[length:var(--tm-class-info-title-font-size)] font-bold leading-tight text-[var(--tm-text-primary)] ${canEdit ? 'pr-[calc(var(--tm-size-touch)+var(--tm-space-2))]' : ''}`}>
          {displayClassName}（{classInfo.gradeLevel}）
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
          <span className="shrink-0 tabular-nums">{classInfo.studentCount}人</span>
        </div>
      </MobileCard>

      {canConfigureLevelDisplay && (
        <section className="mt-[var(--tm-space-4)]" aria-label="等级展示规则">
          <button
            type="button"
            onClick={openLevelDisplaySheet}
            className="flex min-h-[var(--tm-size-touch)] w-full items-center justify-between gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] py-[var(--tm-space-2)] text-left [box-shadow:var(--tm-shadow-card)] active:bg-[var(--tm-bg-surface-soft)]"
            aria-label={`等级展示规则，当前为${levelDisplayLabel}`}
          >
            <span className={`${phoneText.body} font-semibold text-[var(--tm-text-primary)]`}>等级展示规则</span>
            <span className="flex shrink-0 items-center gap-[var(--tm-space-1)] text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">
              {levelDisplayLabel}
              <ChevronRight className="h-4 w-4 text-[var(--tm-text-tertiary)]" />
            </span>
          </button>
        </section>
      )}

      <MobileCard variant="card" padding="md" className="mt-[var(--tm-space-4)]">
        {renderSectionHeader('老师列表', `${teachers.length}人`, () => setPage('teachers'), '查看完整老师列表')}
        <div className="mt-[var(--tm-space-3)] flex justify-between gap-[var(--tm-space-2)] overflow-hidden">
          {teachers.slice(0, 5).map(teacher => <TeacherAvatar key={teacher.id} teacher={teacher} />)}
        </div>
      </MobileCard>

      <MobileCard variant="card" padding="md" className="mt-[var(--tm-space-4)]">
        {renderSectionHeader('家长绑定列表', `${boundParentCount}/${parentItems.length}`, () => setPage('parents'), '查看完整家长绑定列表')}
        <div className="mt-[var(--tm-space-3)] grid grid-cols-2 gap-[var(--tm-space-2)]">
          {parentItems.slice(0, 4).map(({ student, guardians }) => (
            <div key={student.id} className="flex min-w-0 items-center gap-[var(--tm-space-2)] rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-2)]">
              <StudentAvatar student={student} />
              <div className="min-w-0">
                <div className="truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{student.name}</div>
                <div className={`mt-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] font-medium ${guardians.length > 0 ? 'text-[var(--tm-status-positive-strong)]' : 'text-[var(--tm-text-tertiary)]'}`}>
                  {guardians.length > 0 ? '已绑定' : '未绑定'}
                </div>
              </div>
            </div>
          ))}
        </div>
      </MobileCard>
    </>
  );

  const renderTeacherList = () => (
    <div className="space-y-[var(--tm-space-3)]">
      {teachers.map(teacher => (
        <MobileCard key={teacher.id} variant="card" padding="md" className="flex min-h-[76px] items-center gap-[var(--tm-space-3)]">
          <div className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface-soft)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{teacher.name.slice(0, 1)}</div>
          <div className="min-w-0 flex-1">
            <div className="truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{teacher.name}{teacher.id === 'current' ? '（我）' : ''}</div>
            <div className="mt-[var(--tm-space-1)] flex flex-wrap gap-[var(--tm-space-1)] text-[length:var(--tm-font-size-meta)] text-[var(--tm-text-secondary)]">
              <span className={teacher.role === 'teacher' ? '' : 'text-[var(--tm-record-class-text)]'}>{getRoleLabel(teacher.role)}</span>
              {teacher.subjects.length > 0 && <span>· {teacher.subjects.join('、')}</span>}
            </div>
          </div>
          {canManageTeachers && teacher.id !== 'current' && teacher.role !== 'headTeacher' && (
            <button type="button" onClick={() => setActiveTeacher(teacher)} className={iconButtonClass} aria-label={`${teacher.name}更多操作`}>
              <MoreHorizontal className="h-5 w-5" />
            </button>
          )}
        </MobileCard>
      ))}
    </div>
  );

  const renderParentList = () => {
    const visibleItems = parentTab === 'unbound' ? unboundParents : boundParents;
    return (
      <>
        <div className="mb-[var(--tm-space-4)] grid grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-[var(--tm-space-1)]" role="tablist" aria-label="家长绑定状态">
          {([
            { key: 'unbound' as const, label: '未绑定', count: unboundParents.length },
            { key: 'bound' as const, label: '已绑定', count: boundParents.length },
          ]).map(item => (
            <button
              key={item.key}
              type="button"
              role="tab"
              aria-selected={parentTab === item.key}
              onClick={() => setParentTab(item.key)}
              className={`min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-inner)] text-[length:var(--tm-font-size-compact)] font-semibold tabular-nums ${parentTab === item.key ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}
            >
              {item.label}({item.count})
            </button>
          ))}
        </div>

        {visibleItems.length === 0 && (
          <div className="flex min-h-32 items-center justify-center text-[length:var(--tm-font-size-body)] text-[var(--tm-text-tertiary)]">
            {parentTab === 'unbound' ? '暂无未绑定学生' : '暂无已绑定家长'}
          </div>
        )}

        {parentTab === 'unbound' && (
          <div className="space-y-[var(--tm-space-3)]">
            {unboundParents.map(({ student }) => (
              <MobileCard key={student.id} variant="card" padding="md" className="flex min-h-[76px] items-center gap-[var(--tm-space-3)]">
                <StudentAvatar student={student} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{student.name}</div>
                  <div className="mt-[var(--tm-space-1)] truncate text-[length:var(--tm-font-size-meta)] tabular-nums text-[var(--tm-text-tertiary)]">{student.studentNo ?? student.id}</div>
                </div>
                <span className="shrink-0 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-tertiary)]">待绑定</span>
              </MobileCard>
            ))}
          </div>
        )}

        {parentTab === 'bound' && (
          <div className="space-y-[var(--tm-space-3)]">
            {boundParents.flatMap(({ student, guardians }) => guardians.map(guardian => (
              <button
                key={guardian.id}
                type="button"
                onClick={() => openGuardianDetail({ studentId: student.id, guardianId: guardian.id })}
                className="flex min-h-[76px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] px-[var(--tm-space-4)] py-[var(--tm-space-3)] text-left [box-shadow:var(--tm-shadow-card)] active:bg-[var(--tm-bg-surface-soft)]"
                aria-label={`查看${student.name}的${getGuardianLabel(guardian)}绑定详情`}
              >
                <StudentAvatar student={student} />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{student.name}的{getGuardianLabel(guardian)}</div>
                  <div className="mt-[var(--tm-space-1)] truncate text-[length:var(--tm-font-size-meta)] tabular-nums text-[var(--tm-text-tertiary)]">{guardian.phone}</div>
                </div>
                <ChevronRight className="h-5 w-5 shrink-0 text-[var(--tm-text-tertiary)]" />
              </button>
            )))}
          </div>
        )}
      </>
    );
  };

  const renderInviteSheet = () => {
    if (!inviteAudience) return null;
    if (inviteStep === 'qr') {
      return (
        <div className="pb-[var(--tm-space-2)] text-center">
          <div className={`${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>{inviteAudience === 'teacher' ? displayClassName : '绑定学生'}</div>
          <img src={inviteQrAsset} alt={`${inviteTitle}二维码`} className="mx-auto mt-[var(--tm-space-4)] aspect-square w-40 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] object-contain p-[var(--tm-space-3)]" />
          {inviteAudience === 'teacher' ? (
            <div className={`mt-[var(--tm-space-3)] ${phoneText.body} text-[var(--tm-text-secondary)]`}>班级号：<span className="font-semibold tabular-nums text-[var(--tm-text-primary)]">{classInfo.classCode}</span></div>
          ) : (
            <p className={`mt-[var(--tm-space-3)] text-left ${phoneText.body} text-[var(--tm-text-secondary)]`}>{parentQrInviteText}</p>
          )}
          <a href={inviteQrAsset} download className={`${secondaryButtonClass} mt-[var(--tm-space-4)]`}>保存二维码</a>
        </div>
      );
    }
    if (inviteStep === 'copy') {
      return (
        <div className="pb-[var(--tm-space-2)]">
          <div className={`rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-4)] ${phoneText.body} text-[var(--tm-text-secondary)]`}>{inviteText}</div>
          <button type="button" onClick={copyInvite} className={`${primaryButtonClass} mt-[var(--tm-space-4)]`}>
            <Copy className="h-[18px] w-[18px]" />复制邀请文案
          </button>
        </div>
      );
    }
    return (
      <div className="space-y-[var(--tm-space-2)] pb-[var(--tm-space-2)]">
        {inviteAudience === 'teacher' && (
          <button type="button" onClick={shareInvite} className={`${secondaryButtonClass} justify-between`}>
            <span className="flex items-center gap-[var(--tm-space-3)]"><Share2 className="h-5 w-5 text-[var(--tm-brand-primary)]" />发送给微信好友</span>
            <ChevronRight className="h-5 w-5 text-[var(--tm-text-tertiary)]" />
          </button>
        )}
        <button type="button" onClick={() => setInviteStep('qr')} className={`${secondaryButtonClass} justify-between`}>
          <span className="flex items-center gap-[var(--tm-space-3)]"><QrCode className="h-5 w-5 text-[var(--tm-brand-primary)]" />二维码邀请</span>
          <ChevronRight className="h-5 w-5 text-[var(--tm-text-tertiary)]" />
        </button>
        <button type="button" onClick={() => setInviteStep('copy')} className={`${secondaryButtonClass} justify-between`}>
          <span className="flex items-center gap-[var(--tm-space-3)]"><Copy className="h-5 w-5 text-[var(--tm-brand-primary)]" />{inviteAudience === 'teacher' ? '复制邀请文案' : '通过链接邀请'}</span>
          <ChevronRight className="h-5 w-5 text-[var(--tm-text-tertiary)]" />
        </button>
      </div>
    );
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent">
      <header className="relative flex h-[var(--tm-size-touch)] shrink-0 items-center bg-[var(--tm-page-plain-header-bg)] pl-[var(--tm-space-4)] [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]">
        <button type="button" onClick={handleBack} className={`${iconButtonClass} -ml-[var(--tm-space-2)]`} aria-label={page === 'detail' ? '返回班级列表' : '返回班级详情'}>
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className={`${phoneText.navTitle} pointer-events-none absolute inset-x-[calc(var(--tm-size-touch)+var(--tm-space-4))] truncate text-center text-[var(--tm-text-primary)]`}>{title}</h1>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-[var(--tm-space-5)] py-[var(--tm-space-4)] no-scrollbar">
        {page === 'detail' && renderDetail()}
        {page === 'teachers' && renderTeacherList()}
        {page === 'parents' && renderParentList()}
      </div>

      {page === 'detail' && (
        <footer className={`${fixedFooterClass} space-y-[var(--tm-space-2)]`}>
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

      {page === 'teachers' && canInvite && (
        <footer className={fixedFooterClass}>
          <button type="button" onClick={() => openInvite('teacher')} className={secondaryButtonClass}>
            <UserPlus className="h-[18px] w-[18px]" />邀请老师
          </button>
        </footer>
      )}

      {page === 'parents' && canInvite && (
        <footer className={fixedFooterClass}>
          <button type="button" onClick={() => openInvite('parent')} className={secondaryButtonClass}>
            <UserPlus className="h-[18px] w-[18px]" />邀请家长绑定
          </button>
        </footer>
      )}

      {toast && (
        <div className="pointer-events-none absolute inset-x-[var(--tm-space-5)] top-[var(--tm-space-3)] z-[80] flex justify-center" role="status" aria-live="polite">
          <div className={`rounded-[var(--tm-radius-control)] px-[var(--tm-space-4)] py-[var(--tm-space-2)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-card-raised)] ${toast.success ? 'bg-[var(--tm-text-primary)]' : 'bg-[var(--tm-status-negative)]'}`}>
            {toast.message}
          </div>
        </div>
      )}

      <MobileBottomSheet
        open={showEditSheet}
        title="编辑班级信息"
        onClose={() => setShowEditSheet(false)}
        footer={(
          <div className="grid grid-cols-2 gap-[var(--tm-space-2)]">
            <button type="button" onClick={() => setShowEditSheet(false)} className={secondaryButtonClass}>取消</button>
            <button type="button" disabled={!canCompleteEdit} onClick={handleSave} className={primaryButtonClass}>完成</button>
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
                  className={`min-h-[var(--tm-size-touch)] rounded-[var(--tm-radius-inner)] text-[length:var(--tm-font-size-body)] font-semibold transition ${draft.educationStage === option.value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <label className="block">
            <span className={`${phoneText.label} text-[var(--tm-text-tertiary)]`}>入学年份</span>
            <select value={draft.admissionYear} onChange={event => setDraft(current => ({ ...current, admissionYear: Number(event.target.value) }))} className={`mt-[var(--tm-space-2)] ${fieldClass}`} aria-label="入学年份">
              {admissionYearOptions.map(year => <option key={year} value={year}>{year}年</option>)}
            </select>
          </label>

          <label className="block">
            <span className={`${phoneText.label} text-[var(--tm-text-tertiary)]`}>班号</span>
            <div className="mt-[var(--tm-space-2)] flex h-[var(--tm-size-touch)] items-center rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-[var(--tm-space-3)] focus-within:border-[var(--tm-input-focus-border)] focus-within:ring-2 focus-within:ring-[var(--tm-input-focus-ring)]">
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
        open={showLevelDisplaySheet}
        title="等级展示规则"
        onClose={() => setShowLevelDisplaySheet(false)}
        footer={(
          <div className="grid grid-cols-2 gap-[var(--tm-space-2)]">
            <button type="button" onClick={() => setShowLevelDisplaySheet(false)} className={secondaryButtonClass}>取消</button>
            <button type="button" onClick={saveLevelDisplayMode} className={primaryButtonClass}>完成</button>
          </div>
        )}
      >
        <div className="space-y-[var(--tm-space-2)] pb-[var(--tm-space-2)]" role="radiogroup" aria-label="选择等级展示方式">
          {LEVEL_DISPLAY_OPTIONS.map(option => {
            const selected = levelDisplayDraft === option.value;
            return (
              <button
                key={option.value}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => setLevelDisplayDraft(option.value)}
                className={`flex min-h-[var(--tm-size-touch)] w-full items-center justify-between gap-[var(--tm-space-3)] rounded-[var(--tm-radius-inner)] px-[var(--tm-space-4)] text-left transition-colors ${selected ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-primary)] active:bg-[var(--tm-bg-surface-muted)]'}`}
              >
                <span className={`${phoneText.body} font-semibold`}>{option.label}</span>
                <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]'}`}>
                  {selected && <Check className="h-3.5 w-3.5" />}
                </span>
              </button>
            );
          })}
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet open={Boolean(activeTeacher)} title="老师更多操作" onClose={() => setActiveTeacher(null)}>
        {activeTeacher && (
          <div className="space-y-[var(--tm-space-3)] pb-[var(--tm-space-2)]">
            <div className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-4)]">
              <div className={`${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>{activeTeacher.name}</div>
              <div className={`mt-[var(--tm-space-1)] ${phoneText.meta} text-[var(--tm-text-secondary)]`}>{getRoleLabel(activeTeacher.role)} · {activeTeacher.subjects.join('、')}</div>
            </div>
            <button type="button" onClick={toggleDeputyRole} className={`${secondaryButtonClass} justify-between`}>
              <span className="flex items-center gap-[var(--tm-space-3)]"><UserCog className="h-5 w-5 text-[var(--tm-brand-primary)]" />{activeTeacher.role === 'deputyHeadTeacher' ? '取消副班主任' : '设为副班主任'}</span>
              <ChevronRight className="h-5 w-5 text-[var(--tm-text-tertiary)]" />
            </button>
            <button type="button" onClick={() => { setRemoveTeacherTarget(activeTeacher); setActiveTeacher(null); }} className={`${secondaryButtonClass} justify-between text-[var(--tm-status-negative-strong)]`}>
              <span className="flex items-center gap-[var(--tm-space-3)]"><Trash2 className="h-5 w-5" />移除老师</span>
              <ChevronRight className="h-5 w-5 text-[var(--tm-text-tertiary)]" />
            </button>
          </div>
        )}
      </MobileBottomSheet>

      <MobileBottomSheet
        open={Boolean(removeTeacherTarget)}
        title="确认移除老师"
        onClose={() => setRemoveTeacherTarget(null)}
        footer={(
          <div className="grid grid-cols-2 gap-[var(--tm-space-2)]">
            <button type="button" onClick={() => setRemoveTeacherTarget(null)} className={secondaryButtonClass}>取消</button>
            <button type="button" onClick={removeTeacher} className={dangerButtonClass}>确认移除</button>
          </div>
        )}
      >
        <p className={`${phoneText.body} pb-[var(--tm-space-2)] text-[var(--tm-text-secondary)]`}>移除后，{removeTeacherTarget?.name}将不再管理“{displayClassName}”。</p>
      </MobileBottomSheet>

      <MobileBottomSheet open={showTransferSheet} title="转移班主任" onClose={() => setShowTransferSheet(false)}>
        <div className="space-y-[var(--tm-space-2)] pb-[var(--tm-space-2)]">
          {teachers.filter(teacher => teacher.id !== 'current' && teacher.role !== 'headTeacher').map(teacher => (
            <button
              key={teacher.id}
              type="button"
              onClick={() => { setShowTransferSheet(false); setTransferTarget(teacher); }}
              className="flex min-h-[68px] w-full items-center gap-[var(--tm-space-3)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)] text-left active:bg-[var(--tm-bg-surface-muted)]"
            >
              <div className="flex h-[var(--tm-size-touch)] w-[var(--tm-size-touch)] shrink-0 items-center justify-center rounded-full bg-[var(--tm-bg-surface)] text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{teacher.name.slice(0, 1)}</div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{teacher.name}</div>
                <div className={`mt-[var(--tm-space-1)] ${phoneText.meta} truncate text-[var(--tm-text-secondary)]`}>{teacher.subjects.join('、')}</div>
              </div>
              <ChevronRight className="h-5 w-5 text-[var(--tm-text-tertiary)]" />
            </button>
          ))}
        </div>
      </MobileBottomSheet>

      <MobileBottomSheet
        open={Boolean(transferTarget)}
        title="确认转移班主任"
        onClose={() => setTransferTarget(null)}
        footer={(
          <div className="grid grid-cols-2 gap-[var(--tm-space-2)]">
            <button type="button" onClick={() => setTransferTarget(null)} className={secondaryButtonClass}>取消</button>
            <button type="button" onClick={confirmTransfer} className={primaryButtonClass}>确认转移</button>
          </div>
        )}
      >
        <p className={`${phoneText.body} pb-[var(--tm-space-2)] text-[var(--tm-text-secondary)]`}>确认后，{transferTarget?.name}将成为“{displayClassName}”的班主任，你将转为任课老师。</p>
      </MobileBottomSheet>

      <MobileBottomSheet open={Boolean(activeGuardianRecord)} title="家长绑定详情" onClose={closeGuardianDetail}>
        {activeGuardianRecord && guardianDraft && (
          <div className="pb-[var(--tm-space-2)]">
            <div className={`${phoneText.sectionTitle} text-[var(--tm-text-primary)]`}>{activeGuardianRecord.parent.student.name}的{getGuardianLabel(guardianDraft)}</div>
            {editingGuardian ? (
              <div className="mt-[var(--tm-space-4)] space-y-[var(--tm-space-4)]">
                <label className="block">
                  <span className={`${phoneText.label} text-[var(--tm-text-tertiary)]`}>关系</span>
                  <select value={guardianDraft.relation} onChange={event => setGuardianDraft(current => current ? { ...current, relation: event.target.value as GuardianRelation } : current)} className={`mt-[var(--tm-space-2)] ${fieldClass}`} aria-label="编辑家长关系">
                    {(['家长', '爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆', '其他'] as GuardianRelation[]).map(relation => <option key={relation} value={relation}>{relation}</option>)}
                  </select>
                </label>
                {guardianDraft.relation === '其他' && (
                  <label className="block">
                    <span className={`${phoneText.label} text-[var(--tm-text-tertiary)]`}>具体关系</span>
                    <input value={guardianDraft.relationOther} onChange={event => setGuardianDraft(current => current ? { ...current, relationOther: event.target.value } : current)} className={`mt-[var(--tm-space-2)] ${fieldClass}`} aria-label="编辑具体关系" />
                  </label>
                )}
                <label className="block">
                  <span className={`${phoneText.label} text-[var(--tm-text-tertiary)]`}>手机号</span>
                  <input value={guardianDraft.phone} onChange={event => setGuardianDraft(current => current ? { ...current, phone: event.target.value } : current)} inputMode="tel" className={`mt-[var(--tm-space-2)] ${fieldClass} tabular-nums`} aria-label="编辑家长手机号" />
                </label>
                <div className="grid grid-cols-2 gap-[var(--tm-space-2)] pt-[var(--tm-space-2)]">
                  <button type="button" onClick={() => { setRemoveGuardianTarget(activeGuardian); closeGuardianDetail(); }} className={`${secondaryButtonClass} text-[var(--tm-status-negative-strong)]`}><Trash2 className="h-[18px] w-[18px]" />解除绑定</button>
                  <button type="button" disabled={!guardianDraft.phone.trim() || (guardianDraft.relation === '其他' && !guardianDraft.relationOther.trim())} onClick={saveGuardian} className={primaryButtonClass}>保存修改</button>
                </div>
              </div>
            ) : (
              <>
                <dl className="mt-[var(--tm-space-4)] divide-y divide-[var(--tm-border-subtle)] rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] px-[var(--tm-space-4)]">
                  <div className="flex min-h-[var(--tm-size-touch)] items-center justify-between gap-[var(--tm-space-3)]"><dt className={`${phoneText.meta} text-[var(--tm-text-tertiary)]`}>关系</dt><dd className={`${phoneText.body} text-[var(--tm-text-primary)]`}>{getGuardianLabel(guardianDraft)}</dd></div>
                  <div className="flex min-h-[var(--tm-size-touch)] items-center justify-between gap-[var(--tm-space-3)]"><dt className={`${phoneText.meta} text-[var(--tm-text-tertiary)]`}>手机号</dt><dd className={`${phoneText.body} tabular-nums text-[var(--tm-text-primary)]`}>{guardianDraft.phone}</dd></div>
                </dl>
                <a href={`tel:${guardianDraft.phone}`} className={`${primaryButtonClass} mt-[var(--tm-space-4)]`}><Phone className="h-[18px] w-[18px]" />拨打电话</a>
                {canManageParents && <button type="button" onClick={() => setEditingGuardian(true)} className={`${secondaryButtonClass} mt-[var(--tm-space-2)]`}><Pencil className="h-[18px] w-[18px]" />编辑</button>}
              </>
            )}
          </div>
        )}
      </MobileBottomSheet>

      <MobileBottomSheet
        open={Boolean(removeGuardianRecord)}
        title="确认解除绑定"
        onClose={() => setRemoveGuardianTarget(null)}
        footer={(
          <div className="grid grid-cols-2 gap-[var(--tm-space-2)]">
            <button type="button" onClick={() => setRemoveGuardianTarget(null)} className={secondaryButtonClass}>取消</button>
            <button type="button" onClick={removeGuardian} className={dangerButtonClass}>确认解除</button>
          </div>
        )}
      >
        <p className={`${phoneText.body} pb-[var(--tm-space-2)] text-[var(--tm-text-secondary)]`}>解除后，{removeGuardianRecord?.parent.student.name}的{removeGuardianRecord ? getGuardianLabel(removeGuardianRecord.guardian) : ''}将不能继续查看该学生的成长信息。</p>
      </MobileBottomSheet>

      <MobileBottomSheet open={Boolean(inviteAudience)} title={inviteTitle} onClose={closeInvite}>
        {renderInviteSheet()}
      </MobileBottomSheet>

      <MobileBottomSheet
        open={showDangerSheet}
        title={isPersonalOwner ? (dangerStep === 'check' ? '解散班级' : '最终确认') : '退出班级'}
        onClose={closeDangerSheet}
        footer={(
          <div className="grid grid-cols-2 gap-[var(--tm-space-2)]">
            <button type="button" onClick={closeDangerSheet} className={secondaryButtonClass}>取消</button>
            <button type="button" disabled={isPersonalOwner && dangerStep === 'final' && deleteConfirmText.trim() !== 'delete'} onClick={completeDangerAction} className={dangerButtonClass}>
              {isPersonalOwner ? (dangerStep === 'check' ? '已确认，继续' : '确认解散') : '确认退出'}
            </button>
          </div>
        )}
      >
        {isPersonalOwner ? (
          dangerStep === 'check' ? (
            <div className="space-y-[var(--tm-space-3)] pb-[var(--tm-space-2)]">
              <div className={`rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] p-[var(--tm-space-4)] ${phoneText.body} text-[var(--tm-text-secondary)]`}>请确认班级中没有其他老师，且没有家长绑定学生。</div>
              <div className={`${phoneText.body} text-[var(--tm-status-negative-strong)]`}>解散后将清空班级与学生信息，且无法恢复。</div>
            </div>
          ) : (
            <label className="block pb-[var(--tm-space-2)]">
              <span className={`${phoneText.label} text-[var(--tm-text-tertiary)]`}>输入英文 delete 确认解散</span>
              <input value={deleteConfirmText} onChange={event => setDeleteConfirmText(event.target.value)} className={`mt-[var(--tm-space-2)] ${fieldClass}`} placeholder="delete" aria-label="输入英文 delete 确认解散" />
            </label>
          )
        ) : (
          <p className={`${phoneText.body} pb-[var(--tm-space-2)] text-[var(--tm-text-secondary)]`}>退出后，你将无法查看和记录「{displayClassName}」的数据。</p>
        )}
      </MobileBottomSheet>
    </div>
  );
};

export default ClassInfoView;
