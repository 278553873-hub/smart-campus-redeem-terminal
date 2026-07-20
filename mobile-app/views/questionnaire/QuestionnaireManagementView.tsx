import React, { useEffect, useMemo, useState } from 'react';
import {
  AlignLeft,
  Archive,
  ArchiveRestore,
  CalendarDays,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  ClipboardCheck,
  ClipboardList,
  Copy,
  Eye,
  Hash,
  Inbox,
  ListChecks,
  MessageSquareText,
  Minus,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Star,
  TextCursorInput,
  Trash2,
  UserRoundCheck,
  UsersRound,
  X,
} from 'lucide-react';
import type { ClassInfo, Student } from '../../types';
import AssignedQuestionnaireView from '../../../components/parent-app/AssignedQuestionnaireView';
import {
  QUESTIONNAIRE_STORE_EVENT,
  createQuestionId,
  createQuestionnaireId,
  deleteDraftQuestionnaire,
  formatQuestionnaireAnswer,
  getCompletionRate,
  getQuestionnaireCollectionMode,
  getPendingAssignedStudentCollections,
  getQuestionnaireSelectedOptions,
  getReachableTargetCount,
  getStudentCollectionCompletedCount,
  getStudentCollectionRecordsForTeacher,
  isQuestionnaireCreatedByTeacher,
  isQuestionnaireOverdue,
  isQuestionnaireFullyCollected,
  readQuestionnaires,
  saveStudentCollectionRecord,
  updateQuestionnaireStatus,
  upsertQuestionnaire,
  type QuestionnaireQuestion,
  type QuestionnaireQuestionType,
  type QuestionnaireCollectionMode,
  type QuestionnaireAnswer,
  type QuestionnaireRecord,
  type QuestionnaireSubmission,
  type QuestionnaireTarget,
  type QuestionnaireTargetMode,
  type QuestionnaireStatus,
  type StudentCollectionRecord,
  type StudentCollectionRecordStatus,
  type StudentAssignmentMode,
} from '../../../shared/questionnaireStore';

interface QuestionnaireManagementViewProps {
  onBack: () => void;
  teacherId: string;
  teacherName: string;
  spaceId: string;
  homeroomClassIds: string[];
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
  initialMode?: 'owned' | 'assigned';
}

type ListFilter = 'active' | 'ended' | 'draft';
type DetailTab = 'data' | 'responses';
type PageMode = 'list' | 'assigned-list' | 'archived-list' | 'create' | 'detail' | 'response' | 'preview' | 'question-responses' | 'student-record';
type StudentRecordFilter = 'all' | StudentCollectionRecordStatus;

const statusMeta: Record<QuestionnaireStatus, { label: string }> = {
  active: { label: '收集中' },
  ended: { label: '已结束' },
  draft: { label: '草稿' },
  archived: { label: '已归档' },
};

const questionTypeMeta: Record<QuestionnaireQuestionType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  single: { label: '单选题', icon: CircleDot },
  multiple: { label: '多选题', icon: ListChecks },
  rating: { label: '量表题', icon: Star },
  text: { label: '简答题', icon: MessageSquareText },
  short_text: { label: '单行文本', icon: TextCursorInput },
  number: { label: '数字', icon: Hash },
  date: { label: '日期', icon: CalendarDays },
};

const collectionModeMeta: Record<QuestionnaireCollectionMode, {
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClass: string;
  badgeClass: string;
  progressClass: string;
}> = {
  guardian_questionnaire: {
    label: '家长问卷',
    shortLabel: '家长问卷',
    icon: UsersRound,
    accentClass: 'bg-[var(--tm-audience-guardian-primary)]',
    badgeClass: 'border border-[var(--tm-audience-guardian-border)] bg-[var(--tm-audience-guardian-soft)] text-[var(--tm-audience-guardian-strong)]',
    progressClass: 'bg-[var(--tm-audience-guardian-primary)]',
  },
  student_information: {
    label: '学生信息采集',
    shortLabel: '学生采集',
    icon: UserRoundCheck,
    accentClass: 'bg-[var(--tm-audience-student-primary)]',
    badgeClass: 'border border-[var(--tm-audience-student-border)] bg-[var(--tm-audience-student-soft)] text-[var(--tm-audience-student-strong)]',
    progressClass: 'bg-[var(--tm-audience-student-primary)]',
  },
  teacher_questionnaire: {
    label: '教师问卷',
    shortLabel: '教师问卷',
    icon: ClipboardCheck,
    accentClass: 'bg-[var(--tm-audience-teacher-primary)]',
    badgeClass: 'border border-[var(--tm-audience-teacher-border)] bg-[var(--tm-audience-teacher-soft)] text-[var(--tm-audience-teacher-strong)]',
    progressClass: 'bg-[var(--tm-audience-teacher-primary)]',
  },
};

const MIN_RATING_LEVELS = 2;
const MAX_RATING_LEVELS = 10;
const createRatingOptions = (count: number) => Array.from({ length: count }, (_, index) => String(index + 1));

const formatSuggestedDeadline = (deadline: string) => deadline.replace('2026-', '').replace('-', '月').replace(' ', '日 ');
const formatCollectionDate = (createdAt: string) => `${createdAt.slice(5, 7)}月${createdAt.slice(8, 10)}日`;
const QUESTIONNAIRE_TEXT_STOP_WORDS = new Set([
  '希望', '可以', '学校', '孩子', '一些', '进行', '增加', '提供', '方面', '能够', '建议', '需要', '比较', '定期', '班级',
]);
const getFrequentKeywords = (answers: string[]) => {
  if (answers.length < 6) return [];
  const counts = new Map<string, number>();
  const segmenter = new Intl.Segmenter('zh-CN', { granularity: 'word' });
  answers.forEach(answer => {
    for (const item of segmenter.segment(answer)) {
      const word = item.segment.trim().toLowerCase();
      if (!item.isWordLike || word.length < 2 || QUESTIONNAIRE_TEXT_STOP_WORDS.has(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  });
  return Array.from(counts.entries())
    .filter(([, count]) => count >= 2)
    .sort((left, right) => right[1] - left[1])
    .slice(0, 3);
};
const getDefaultSuggestedDeadline = () => {
  const value = new Date();
  value.setDate(value.getDate() + 7);
  value.setHours(20, 0, 0, 0);
  const pad = (part: number) => String(part).padStart(2, '0');
  return `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}T${pad(value.getHours())}:${pad(value.getMinutes())}`;
};
const nowText = () => new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
const demoLinkedStudentName = (student: Student) => {
  if (student.studentNo === '20250101') return '郑小磊';
  if (student.studentNo === '20250102') return '林小满';
  return student.name;
};

const ProgressBar: React.FC<{ value: number; tone?: 'positive' | 'neutral' }> = ({ value, tone = 'positive' }) => (
  <div className="h-2 overflow-hidden rounded-full bg-[var(--tm-bg-surface-muted)]" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
    <div
      className={`h-full rounded-full transition-[width] [transition-duration:var(--tm-duration-panel)] ${tone === 'positive' ? 'bg-[var(--tm-status-positive)]' : 'bg-[var(--tm-text-disabled)]'}`}
      style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
    />
  </div>
);

const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }> = ({ label, className = '', children, ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition active:scale-[0.96] active:bg-[var(--tm-bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const PageHeader: React.FC<{
  title: string;
  onBack: () => void;
  action?: React.ReactNode;
  wideAction?: boolean;
}> = ({ title, onBack, action, wideAction = false }) => {
  const actionClassName = action ? '-mr-2 h-11 w-11' : 'h-11 w-11';
  return (
  <header className="sticky top-0 z-[45] flex h-11 shrink-0 items-center justify-between border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-page-glass)] px-4 backdrop-blur-md">
    <button
      type="button"
      aria-label="返回"
      onClick={onBack}
      className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"
    >
      <ChevronLeft className="h-5 w-5" />
    </button>
    <h1 className="pointer-events-none absolute inset-x-16 truncate text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">{title}</h1>
    <div className={`flex shrink-0 items-center justify-center ${wideAction && action ? '-mr-2 h-11 w-[88px]' : actionClassName}`} aria-hidden={!action}>
      {action}
    </div>
  </header>
  );
};

const BottomAction: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute inset-x-0 bottom-0 z-30 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 shadow-[var(--tm-shadow-navigation)] backdrop-blur-xl">
    {children}
  </div>
);

const BottomSheet: React.FC<{
  open: boolean;
  label: string;
  onDismiss: () => void;
  children: React.ReactNode;
}> = ({ open, label, onDismiss, children }) => {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex items-end bg-[var(--tm-mask)] backdrop-blur-[2px]" onClick={onDismiss}>
      <section
        className="w-full rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[var(--tm-shadow-sheet)]"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-[var(--tm-border-subtle)]" />
        {children}
      </section>
    </div>
  );
};

const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...props }) => (
  <button
    type="button"
    className={`inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-5 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-inverse)] shadow-[var(--tm-shadow-control)] transition active:scale-[0.98] active:bg-[var(--tm-brand-primary-pressed)] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...props }) => (
  <button
    type="button"
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-4 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)] shadow-[var(--tm-shadow-control)] transition active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)] disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const StepIndicator: React.FC<{ current: number; mode: QuestionnaireCollectionMode }> = ({ current, mode }) => (
  <div className="grid grid-cols-3 gap-2 px-5 py-4" aria-label={`创建进度，第${current}步，共3步`}>
    {(mode === 'student_information'
      ? ['编辑采集表', '学生范围', '确认开始']
      : ['编辑问卷', '发送范围', '确认发布']).map((label, index) => {
      const step = index + 1;
      const active = step === current;
      const complete = step < current;
      return (
        <div key={label} className="min-w-0">
          <div className={`h-1.5 rounded-full ${complete || active ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-bg-surface-muted)]'}`} />
          <div className={`mt-2 truncate text-[length:var(--tm-font-size-meta)] font-semibold ${active ? 'text-[var(--tm-text-primary)]' : complete ? 'text-[var(--tm-brand-primary-strong)]' : 'text-[var(--tm-text-tertiary)]'}`}>
            {label}
          </div>
        </div>
      );
    })}
  </div>
);

const emptyQuestion = (type: QuestionnaireQuestionType): QuestionnaireQuestion => ({
  id: createQuestionId(),
  type,
  title: '',
  required: true,
  options: type === 'single' || type === 'multiple' ? ['选项1', '选项2'] : type === 'rating' ? createRatingOptions(5) : [],
  customAnswerOptions: [],
});

const QuestionnaireManagementView: React.FC<QuestionnaireManagementViewProps> = ({
  onBack,
  teacherId,
  teacherName,
  spaceId,
  homeroomClassIds,
  classes,
  getStudentsForClass,
  initialMode = 'owned',
}) => {
  const [records, setRecords] = useState<QuestionnaireRecord[]>(() => readQuestionnaires());
  const [pageMode, setPageMode] = useState<PageMode>(initialMode === 'assigned' ? 'assigned-list' : 'list');
  const [recordOrigin, setRecordOrigin] = useState<'list' | 'assigned-list'>('list');
  const [listFilter, setListFilter] = useState<ListFilter>('active');
  const [activeRecordId, setActiveRecordId] = useState('');
  const [detailTab, setDetailTab] = useState<DetailTab>('data');
  const [activeSubmission, setActiveSubmission] = useState<QuestionnaireSubmission | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState('');
  const [questionResponseSearch, setQuestionResponseSearch] = useState('');
  const [questionResponseClass, setQuestionResponseClass] = useState('all');
  const [visibleQuestionResponseCount, setVisibleQuestionResponseCount] = useState(20);
  const [responseFilter, setResponseFilter] = useState<'completed' | 'pending' | 'unreachable'>('completed');
  const [createStep, setCreateStep] = useState(1);
  const [collectionMode, setCollectionMode] = useState<QuestionnaireCollectionMode>('guardian_questionnaire');
  const [studentAssignmentMode, setStudentAssignmentMode] = useState<StudentAssignmentMode>('creator');
  const [draftId, setDraftId] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftQuestions, setDraftQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [expandedQuestionId, setExpandedQuestionId] = useState('');
  const [pendingQuestionFocusId, setPendingQuestionFocusId] = useState('');
  const [targetMode, setTargetMode] = useState<QuestionnaireTargetMode>('all');
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());
  const [selectedStudentNos, setSelectedStudentNos] = useState<Set<string>>(new Set());
  const [activeClassId, setActiveClassId] = useState(classes[0]?.id ?? '');
  const [hasSuggestedDeadline, setHasSuggestedDeadline] = useState(false);
  const [suggestedDeadline, setSuggestedDeadline] = useState('');
  const [showQuestionTypeSheet, setShowQuestionTypeSheet] = useState(false);
  const [showCreateTypeSheet, setShowCreateTypeSheet] = useState(false);
  const [showAssignmentSheet, setShowAssignmentSheet] = useState(false);
  const [showMoreFieldTypes, setShowMoreFieldTypes] = useState(false);
  const [customOptionQuestionId, setCustomOptionQuestionId] = useState('');
  const [showRecordMenu, setShowRecordMenu] = useState(false);
  const [showDraftMenu, setShowDraftMenu] = useState(false);
  const [showDeleteDraftConfirm, setShowDeleteDraftConfirm] = useState(false);
  const [studentRecordFilter, setStudentRecordFilter] = useState<StudentRecordFilter>('all');
  const [studentRecordSearch, setStudentRecordSearch] = useState('');
  const [activeStudentNo, setActiveStudentNo] = useState('');
  const [studentRecordAnswers, setStudentRecordAnswers] = useState<Record<string, QuestionnaireAnswer>>({});
  const [toast, setToast] = useState('');

  useEffect(() => {
    const refresh = () => setRecords(readQuestionnaires());
    window.addEventListener(QUESTIONNAIRE_STORE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(QUESTIONNAIRE_STORE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!pendingQuestionFocusId || pageMode !== 'create') return;
    const frame = window.requestAnimationFrame(() => {
      document.getElementById(`question-${pendingQuestionFocusId}`)?.focus();
      setPendingQuestionFocusId('');
    });
    return () => window.cancelAnimationFrame(frame);
  }, [pageMode, pendingQuestionFocusId]);

  const availableClasses = useMemo(() => classes, [classes]);
  const activeClassStudents = useMemo(() => (
    getStudentsForClass(activeClassId).filter(student => (student.status ?? 'active') === 'active')
  ), [activeClassId, getStudentsForClass]);
  const allAvailableStudents = useMemo(() => availableClasses.flatMap(classInfo => (
    getStudentsForClass(classInfo.id)
      .filter(student => (student.status ?? 'active') === 'active')
      .map(student => ({ classInfo, student }))
  )), [availableClasses, getStudentsForClass]);

  const activeRecord = records.find(record => record.id === activeRecordId) ?? null;
  const ownedRecords = records.filter(record => (
    record.spaceId === spaceId && isQuestionnaireCreatedByTeacher(record, teacherId, teacherName)
  ));
  const filteredRecords = ownedRecords.filter(record => record.status === listFilter);
  const archivedRecords = ownedRecords.filter(record => record.status === 'archived');
  const assignedRecords = getPendingAssignedStudentCollections(records, teacherId, teacherName, spaceId);
  const validStepOne = Boolean(draftTitle.trim()) && draftQuestions.length > 0 && draftQuestions.every(question => (
    Boolean(question.title.trim())
    && (['text', 'short_text', 'number', 'date'].includes(question.type) || question.options.filter(Boolean).length >= 2)
  ));

  const showToast = (message: string) => setToast(message);

  const openRecord = (record: QuestionnaireRecord, origin: 'list' | 'assigned-list' = 'list') => {
    if (record.status === 'draft') {
      startCreate(record);
      return;
    }
    setActiveRecordId(record.id);
    setRecordOrigin(origin);
    setDetailTab('data');
    setStudentRecordFilter('all');
    setStudentRecordSearch('');
    setPageMode('detail');
  };

  const openQuestionResponses = (questionId: string) => {
    setActiveQuestionId(questionId);
    setQuestionResponseSearch('');
    setQuestionResponseClass('all');
    setVisibleQuestionResponseCount(20);
    setPageMode('question-responses');
  };

  const startCreate = (record?: QuestionnaireRecord, nextMode: QuestionnaireCollectionMode = 'guardian_questionnaire') => {
    const resolvedMode = record ? getQuestionnaireCollectionMode(record) : nextMode;
    setCollectionMode(resolvedMode);
    setStudentAssignmentMode(record?.studentAssignmentMode ?? 'creator');
    setDraftId(record?.id ?? '');
    setDraftTitle(record?.title ?? '');
    setDraftDescription(record?.description ?? '');
    const nextQuestions = record?.questions.length ? record.questions : [];
    setDraftQuestions(nextQuestions);
    setExpandedQuestionId(nextQuestions[0]?.id ?? '');
    setTargetMode(record?.targetMode ?? 'all');
    setSelectedClassIds(new Set(record?.targetClassIds ?? record?.targets.map(target => target.classId) ?? []));
    setSelectedStudentNos(new Set(record?.targets.map(target => target.studentNo) ?? []));
    setHasSuggestedDeadline(Boolean(record?.suggestedDeadline));
    setSuggestedDeadline((record?.suggestedDeadline ?? '').replace(' ', 'T'));
    setActiveClassId(record?.targets[0]?.classId ?? availableClasses[0]?.id ?? '');
    setCreateStep(1);
    setShowCreateTypeSheet(false);
    setShowMoreFieldTypes(false);
    setPageMode('create');
  };

  const buildTargets = (): QuestionnaireTarget[] => allAvailableStudents
    .filter(({ classInfo, student }) => (
      Boolean(student.studentNo)
      && (targetMode === 'all'
        || targetMode === 'classes' && selectedClassIds.has(classInfo.id)
        || targetMode === 'students' && selectedStudentNos.has(student.studentNo!))
    ))
    .map(({ classInfo, student }) => ({
      studentId: student.id,
      studentNo: student.studentNo!,
      studentName: demoLinkedStudentName(student),
      classId: classInfo.id,
      className: classInfo.name,
      reachable: collectionMode === 'student_information'
        || Boolean(student.guardianContacts?.length) && !student.studentNo?.endsWith('07'),
    }));

  const getHomeroomAssignee = (classId: string) => {
    if (homeroomClassIds.includes(classId)) return { id: teacherId, name: teacherName };
    const classNumber = Number(classId.split('_').at(-1) ?? 0);
    return classNumber % 2 === 0
      ? { id: `${spaceId}:王蕾`, name: '王蕾老师' }
      : { id: `${spaceId}:陈老师`, name: '陈老师' };
  };

  const buildStudentRecords = (targets: QuestionnaireTarget[], existing?: QuestionnaireRecord): StudentCollectionRecord[] => {
    const existingByStudentNo = new Map((existing?.studentRecords ?? []).map(item => [item.studentNo, item]));
    return targets.map(target => {
      const existingRecord = existingByStudentNo.get(target.studentNo);
      const assignee = studentAssignmentMode === 'creator'
        ? { id: teacherId, name: teacherName }
        : getHomeroomAssignee(target.classId);
      return {
        ...(existingRecord ?? {
          id: `${existing?.id ?? (draftId || 'collection')}-${target.studentNo}`,
          studentNo: target.studentNo,
          studentName: target.studentName,
          classId: target.classId,
          className: target.className,
          status: 'pending' as const,
          updatedAt: '',
          answers: {},
        }),
        assigneeTeacherId: assignee.id,
        assigneeTeacherName: assignee.name,
      };
    });
  };

  const saveDraft = () => {
    const existing = records.find(record => record.id === draftId);
    const targets = buildTargets();
    const record: QuestionnaireRecord = {
      id: draftId || createQuestionnaireId(),
      title: draftTitle.trim() || (collectionMode === 'student_information' ? '未命名采集表' : '未命名问卷'),
      description: draftDescription.trim(),
      creatorName: teacherName,
      creatorTeacherId: teacherId,
      spaceId,
      createdAt: existing?.createdAt ?? nowText(),
      suggestedDeadline: hasSuggestedDeadline ? suggestedDeadline.replace('T', ' ') : '',
      status: 'draft',
      collectionMode,
      studentAssignmentMode: collectionMode === 'student_information' ? studentAssignmentMode : undefined,
      targetMode,
      targetClassIds: targetMode === 'classes' ? Array.from(selectedClassIds) : [],
      questions: draftQuestions,
      targets,
      submissions: existing?.submissions ?? [],
      studentRecords: collectionMode === 'student_information' ? buildStudentRecords(targets, existing) : [],
    };
    upsertQuestionnaire(record);
    setRecords(readQuestionnaires());
    setListFilter('draft');
    setPageMode('list');
    showToast('草稿已保存');
  };

  const publishQuestionnaire = () => {
    const existing = records.find(record => record.id === draftId);
    const targets = buildTargets();
    const record: QuestionnaireRecord = {
      id: draftId || createQuestionnaireId(),
      title: draftTitle.trim(),
      description: draftDescription.trim(),
      creatorName: teacherName,
      creatorTeacherId: teacherId,
      spaceId,
      createdAt: existing?.createdAt ?? nowText(),
      suggestedDeadline: hasSuggestedDeadline ? suggestedDeadline.replace('T', ' ') : '',
      status: 'active',
      collectionMode,
      studentAssignmentMode: collectionMode === 'student_information' ? studentAssignmentMode : undefined,
      targetMode,
      targetClassIds: targetMode === 'classes' ? Array.from(selectedClassIds) : [],
      questions: draftQuestions,
      targets,
      submissions: existing?.submissions ?? [],
      studentRecords: collectionMode === 'student_information' ? buildStudentRecords(targets, existing) : [],
    };
    upsertQuestionnaire(record);
    setRecords(readQuestionnaires());
    setActiveRecordId(record.id);
    setDetailTab('data');
    setPageMode('detail');
    showToast(collectionMode === 'student_information' ? '已开始采集' : '问卷已发布到家长端');
  };

  const updateQuestion = (id: string, patch: Partial<QuestionnaireQuestion>) => {
    setDraftQuestions(items => items.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  const addQuestion = (type: QuestionnaireQuestionType) => {
    const question = emptyQuestion(type);
    setDraftQuestions(items => [...items, question]);
    setExpandedQuestionId(question.id);
    setPendingQuestionFocusId(question.id);
    setShowQuestionTypeSheet(false);
  };

  const updateRatingLevelCount = (question: QuestionnaireQuestion, nextCount: number) => {
    const count = Math.max(MIN_RATING_LEVELS, Math.min(MAX_RATING_LEVELS, nextCount));
    updateQuestion(question.id, { options: createRatingOptions(count) });
  };

  const addCustomAnswerOption = () => {
    const question = draftQuestions.find(item => item.id === customOptionQuestionId);
    if (!question) return;
    let optionLabel = '其他';
    let suffix = 2;
    while (question.options.includes(optionLabel)) {
      optionLabel = `其他${suffix}`;
      suffix += 1;
    }
    updateQuestion(question.id, {
      options: [...question.options, optionLabel],
      customAnswerOptions: [...(question.customAnswerOptions ?? []), optionLabel],
    });
    setExpandedQuestionId(question.id);
    setCustomOptionQuestionId('');
  };

  const toggleClass = (classId: string) => {
    setSelectedClassIds(previous => {
      const next = new Set(previous);
      if (next.has(classId)) next.delete(classId);
      else next.add(classId);
      return next;
    });
  };

  const toggleAllClasses = () => {
    const allSelected = availableClasses.length > 0 && availableClasses.every(classInfo => selectedClassIds.has(classInfo.id));
    setSelectedClassIds(allSelected ? new Set() : new Set(availableClasses.map(classInfo => classInfo.id)));
  };

  const toggleStudent = (studentNo: string) => {
    setSelectedStudentNos(previous => {
      const next = new Set(previous);
      if (next.has(studentNo)) next.delete(studentNo);
      else next.add(studentNo);
      return next;
    });
  };

  const toggleActiveClass = () => {
    const studentNos = activeClassStudents.map(student => student.studentNo).filter(Boolean) as string[];
    const allSelected = studentNos.length > 0 && studentNos.every(no => selectedStudentNos.has(no));
    setSelectedStudentNos(previous => {
      const next = new Set(previous);
      studentNos.forEach(no => allSelected ? next.delete(no) : next.add(no));
      return next;
    });
  };

  const closeActiveRecord = () => {
    if (!activeRecord || activeRecord.status !== 'active') return;
    if (!updateQuestionnaireStatus(activeRecord.id, 'ended')) return;
    setRecords(readQuestionnaires());
    setShowRecordMenu(false);
    showToast(getQuestionnaireCollectionMode(activeRecord) === 'student_information' ? '采集已结束' : '问卷已结束');
  };

  const reopenActiveRecord = () => {
    if (
      !activeRecord
      || activeRecord.status !== 'ended'
      || getQuestionnaireCollectionMode(activeRecord) === 'guardian_questionnaire' && isQuestionnaireFullyCollected(activeRecord)
    ) return;
    if (!updateQuestionnaireStatus(activeRecord.id, 'active')) return;
    setRecords(readQuestionnaires());
    setShowRecordMenu(false);
    showToast(getQuestionnaireCollectionMode(activeRecord) === 'student_information' ? '已恢复编辑' : '问卷已重新开放');
  };

  const duplicateActiveRecord = () => {
    if (!activeRecord) return;
    const copyRecord: QuestionnaireRecord = {
      ...activeRecord,
      id: createQuestionnaireId(),
      title: `${activeRecord.title}（副本）`,
      createdAt: nowText(),
      status: 'draft',
      submissions: [],
      studentRecords: (activeRecord.studentRecords ?? []).map(item => ({ ...item, status: 'pending', updatedAt: '', answers: {} })),
    };
    upsertQuestionnaire(copyRecord);
    setRecords(readQuestionnaires());
    setShowRecordMenu(false);
    startCreate(copyRecord);
  };

  const archiveActiveRecord = () => {
    if (!activeRecord || activeRecord.status !== 'ended') return;
    if (!updateQuestionnaireStatus(activeRecord.id, 'archived')) return;
    setRecords(readQuestionnaires());
    setShowRecordMenu(false);
    setPageMode('archived-list');
    showToast('问卷已归档');
  };

  const restoreActiveRecord = () => {
    if (!activeRecord || activeRecord.status !== 'archived') return;
    if (!updateQuestionnaireStatus(activeRecord.id, 'ended')) return;
    setRecords(readQuestionnaires());
    setShowRecordMenu(false);
    setListFilter('ended');
    setPageMode('list');
    showToast('问卷已恢复');
  };

  const deleteCurrentDraft = () => {
    if (!draftId || !deleteDraftQuestionnaire(draftId)) {
      setShowDeleteDraftConfirm(false);
      showToast('草稿无法删除');
      return;
    }
    setRecords(readQuestionnaires());
    setShowDeleteDraftConfirm(false);
    setShowDraftMenu(false);
    setDraftId('');
    setListFilter('draft');
    setPageMode('list');
    showToast('草稿已删除');
  };

  const getStudentRecord = (record: QuestionnaireRecord, studentNo: string): StudentCollectionRecord | null => {
    const stored = (record.studentRecords ?? []).find(item => item.studentNo === studentNo);
    if (stored) return stored;
    const target = record.targets.find(item => item.studentNo === studentNo);
    if (!target) return null;
    return {
      id: `${record.id}-${target.studentNo}`,
      studentNo: target.studentNo,
      studentName: target.studentName,
      classId: target.classId,
      className: target.className,
      status: 'pending',
      updatedAt: '',
      answers: {},
    };
  };

  const openStudentRecord = (record: QuestionnaireRecord, studentNo: string) => {
    const studentRecord = getStudentRecord(record, studentNo);
    if (!studentRecord) return;
    setActiveStudentNo(studentNo);
    setStudentRecordAnswers(studentRecord.answers);
    setPageMode('student-record');
  };

  const isStudentAnswerFilled = (answer: QuestionnaireAnswer | undefined) => {
    if (Array.isArray(answer)) return answer.length > 0;
    return answer !== undefined && String(answer).trim().length > 0;
  };

  const saveActiveStudentRecord = (status: 'draft' | 'completed') => {
    if (!activeRecord) return;
    const studentRecord = getStudentRecord(activeRecord, activeStudentNo);
    if (!studentRecord) return;
    if (status === 'completed' && activeRecord.questions.some(question => question.required && !isStudentAnswerFilled(studentRecordAnswers[question.id]))) {
      showToast('请完成必填字段');
      return;
    }
    const saved = saveStudentCollectionRecord(activeRecord.id, {
      ...studentRecord,
      status,
      updatedAt: nowText(),
      answers: studentRecordAnswers,
    }, teacherId, teacherName);
    if (!saved) {
      showToast('当前采集不可编辑');
      return;
    }
    setRecords(readQuestionnaires());
    setPageMode('detail');
    showToast(status === 'completed' ? '已完成' : '草稿已保存');
  };

  const renderList = () => {
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-page)] pb-24">
        <PageHeader
          title="问卷采集"
          onBack={onBack}
          wideAction
          action={(
            <div className="flex items-center">
              {assignedRecords.length > 0 && (
                <IconButton label={`待我填写${assignedRecords.length}项`} onClick={() => setPageMode('assigned-list')} className="relative text-[var(--tm-text-secondary)]">
                  <Inbox className="h-5 w-5" />
                  <span className="absolute right-0.5 top-0.5 flex h-[17px] min-w-[17px] items-center justify-center rounded-full bg-[var(--tm-status-negative)] px-1 text-[length:var(--tm-font-size-badge)] font-bold leading-none tabular-nums text-[var(--tm-text-inverse)]">{assignedRecords.length}</span>
                </IconButton>
              )}
              <IconButton label="新建采集" onClick={() => setShowCreateTypeSheet(true)} className="text-[var(--tm-brand-primary-strong)]"><Plus className="h-5 w-5" /></IconButton>
            </div>
          )}
        />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 pt-4 no-scrollbar">
          <div className="grid grid-cols-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1" role="tablist" aria-label="问卷状态">
            {([['active', '收集中'], ['ended', '已结束'], ['draft', '草稿']] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={listFilter === value}
                onClick={() => setListFilter(value)}
                className={`min-h-11 rounded-[var(--tm-radius-control)] px-2 text-[length:var(--tm-font-size-compact)] font-semibold transition ${listFilter === value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {listFilter === 'ended' && archivedRecords.length > 0 && (
            <div className="mt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setPageMode('archived-list')}
                className="inline-flex min-h-11 items-center gap-1.5 rounded-[var(--tm-radius-control)] px-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-glass)]"
              >
                <Archive className="h-4 w-4 text-[var(--tm-text-tertiary)]" />
                已归档
              </button>
            </div>
          )}

          <section className={`${listFilter === 'ended' && archivedRecords.length > 0 ? 'mt-1' : 'mt-3'} space-y-2.5`}>
            {filteredRecords.map(record => {
              const mode = getQuestionnaireCollectionMode(record);
              const modeMeta = collectionModeMeta[mode];
              const ModeIcon = modeMeta.icon;
              const reachable = getReachableTargetCount(record);
              const completion = getCompletionRate(record);
              const completed = mode === 'student_information' ? getStudentCollectionCompletedCount(record) : record.submissions.length;
              const overdue = isQuestionnaireOverdue(record);
              return (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => openRecord(record, 'list')}
                  className={`relative w-full cursor-pointer overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-4 py-4 text-left shadow-[var(--tm-shadow-card)] transition-[scale,background-color,box-shadow] [transition-duration:var(--tm-duration-fast)] ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)] active:shadow-[var(--tm-shadow-card)] ${record.status === 'draft' ? 'min-h-[76px]' : 'min-h-[92px]'}`}
                >
                  <span className={`pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-r-full ${modeMeta.accentClass}`} aria-hidden="true" />
                  <div className="line-clamp-2 text-pretty text-[length:var(--tm-font-size-card-title)] font-bold leading-[22px] text-[var(--tm-text-primary)]">{record.title}</div>
                  {record.status !== 'draft' && (
                    <div className="mt-3.5 flex min-w-0 items-center justify-between gap-3 text-[length:var(--tm-font-size-meta)]">
                      <div className="flex min-w-0 items-center gap-2 font-medium">
                        <span className={`inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-[length:var(--tm-font-size-badge)] font-semibold ${modeMeta.badgeClass}`}><ModeIcon className="h-3.5 w-3.5" />{modeMeta.shortLabel}</span>
                        <span className={`truncate ${overdue ? 'text-[var(--tm-brand-reward-strong)]' : 'text-[var(--tm-text-tertiary)]'}`}>{mode === 'student_information' ? formatCollectionDate(record.createdAt) : record.suggestedDeadline ? formatSuggestedDeadline(record.suggestedDeadline) : '不限时间'}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[var(--tm-bg-surface-muted)]" aria-hidden="true">
                          <div className={`h-full rounded-full ${record.status === 'ended' ? 'bg-[var(--tm-text-disabled)]' : modeMeta.progressClass}`} style={{ width: `${completion}%` }} />
                        </div>
                        <span className="tabular-nums font-semibold text-[var(--tm-text-secondary)]">{completed}/{reachable}</span>
                      </div>
                    </div>
                  )}
                  {record.status === 'draft' && <div className="mt-2"><span className={`inline-flex h-6 items-center gap-1 rounded-full px-2 text-[length:var(--tm-font-size-badge)] font-semibold ${modeMeta.badgeClass}`}><ModeIcon className="h-3.5 w-3.5" />{modeMeta.shortLabel}</span></div>}
                </button>
              );
            })}
            {filteredRecords.length === 0 && (
              <div className="py-16 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-tertiary)]"><ClipboardList className="h-6 w-6" /></span>
                <div className="mt-4 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-secondary)]">暂无{statusMeta[listFilter].label}内容</div>
              </div>
            )}
          </section>
        </main>
        <BottomSheet open={showCreateTypeSheet} label="新建采集" onDismiss={() => setShowCreateTypeSheet(false)}>
          <h2 className="text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">新建采集</h2>
          <div className="mt-4 overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]">
            <button type="button" onClick={() => startCreate(undefined, 'guardian_questionnaire')} className="flex min-h-[68px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] px-4 text-left active:bg-[var(--tm-audience-guardian-soft)]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-audience-guardian-soft)] text-[var(--tm-audience-guardian-strong)]"><UsersRound className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-primary)]">家长问卷</span><span className="mt-0.5 block text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">由家长填写</span></span>
              <ChevronRight className="h-4 w-4 text-[var(--tm-text-disabled)]" />
            </button>
            <button type="button" onClick={() => startCreate(undefined, 'student_information')} className="flex min-h-[68px] w-full items-center gap-3 px-4 text-left active:bg-[var(--tm-audience-student-soft)]">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-audience-student-soft)] text-[var(--tm-audience-student-strong)]"><UserRoundCheck className="h-5 w-5" /></span>
              <span className="min-w-0 flex-1"><span className="block text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-primary)]">学生信息采集</span><span className="mt-0.5 block text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">由老师逐生填写</span></span>
              <ChevronRight className="h-4 w-4 text-[var(--tm-text-disabled)]" />
            </button>
          </div>
        </BottomSheet>
      </div>
    );
  };

  const renderAssignedList = () => (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-page)] pb-8">
      <PageHeader title="待我填写" onBack={initialMode === 'assigned' ? onBack : () => setPageMode('list')} />
      <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 pt-4 no-scrollbar">
        <section className="space-y-2.5">
          {assignedRecords.map(record => {
            const myRecords = getStudentCollectionRecordsForTeacher(record, teacherId, teacherName);
            const completed = myRecords.filter(item => item.status === 'completed').length;
            const completion = myRecords.length === 0 ? 0 : Math.round((completed / myRecords.length) * 100);
            return (
              <button
                key={record.id}
                type="button"
                onClick={() => openRecord(record, 'assigned-list')}
                className="relative min-h-[96px] w-full overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-4 py-4 text-left shadow-[var(--tm-shadow-card)] transition-[scale,background-color] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)]"
              >
                <span className="pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-r-full bg-[var(--tm-audience-student-primary)]" aria-hidden="true" />
                <div className="line-clamp-2 text-pretty text-[length:var(--tm-font-size-card-title)] font-bold leading-[22px] text-[var(--tm-text-primary)]">{record.title}</div>
                <div className="mt-3.5 flex min-w-0 items-center justify-between gap-3 text-[length:var(--tm-font-size-meta)]">
                  <span className="min-w-0 truncate font-medium text-[var(--tm-text-tertiary)]">{record.creatorName}</span>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[var(--tm-bg-surface-muted)]" aria-hidden="true"><div className="h-full rounded-full bg-[var(--tm-audience-student-primary)]" style={{ width: `${completion}%` }} /></div>
                    <span className="tabular-nums font-semibold text-[var(--tm-text-secondary)]">{completed}/{myRecords.length}</span>
                  </div>
                </div>
              </button>
            );
          })}
          {assignedRecords.length === 0 && (
            <div className="py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-tertiary)]"><ClipboardCheck className="h-6 w-6" /></span>
              <div className="mt-4 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-secondary)]">暂无待填写采集</div>
            </div>
          )}
        </section>
      </main>
    </div>
  );

  const renderArchivedList = () => (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-page)] pb-8">
      <PageHeader title="已归档" onBack={() => { setListFilter('ended'); setPageMode('list'); }} />
      <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 pt-4 no-scrollbar">
        <section className="space-y-2.5">
          {archivedRecords.map(record => {
            const mode = getQuestionnaireCollectionMode(record);
            const modeMeta = collectionModeMeta[mode];
            const ModeIcon = modeMeta.icon;
            const reachable = getReachableTargetCount(record);
            const completion = getCompletionRate(record);
            const completed = mode === 'student_information' ? getStudentCollectionCompletedCount(record) : record.submissions.length;
            return (
              <button
                key={record.id}
                type="button"
                onClick={() => openRecord(record)}
                className="relative min-h-[92px] w-full cursor-pointer overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-4 py-4 text-left shadow-[var(--tm-shadow-card)] transition-[scale,background-color,box-shadow] [transition-duration:var(--tm-duration-fast)] ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)]"
              >
                <span className={`pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-r-full ${modeMeta.accentClass}`} aria-hidden="true" />
                <div className="line-clamp-2 text-pretty text-[length:var(--tm-font-size-card-title)] font-bold leading-[22px] text-[var(--tm-text-primary)]">{record.title}</div>
                <div className="mt-3.5 flex min-w-0 items-center justify-between gap-3 text-[length:var(--tm-font-size-meta)]">
                  <div className="flex min-w-0 items-center gap-2 font-medium text-[var(--tm-text-tertiary)]">
                    <span className={`inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-[length:var(--tm-font-size-badge)] font-semibold ${modeMeta.badgeClass}`}><ModeIcon className="h-3.5 w-3.5" />{modeMeta.shortLabel}</span>
                    <span className="truncate">{mode === 'student_information' ? formatCollectionDate(record.createdAt) : record.suggestedDeadline ? formatSuggestedDeadline(record.suggestedDeadline) : '不限时间'}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-[var(--tm-bg-surface-muted)]" aria-hidden="true">
                      <div className="h-full rounded-full bg-[var(--tm-text-disabled)]" style={{ width: `${completion}%` }} />
                    </div>
                    <span className="tabular-nums font-semibold text-[var(--tm-text-secondary)]">{completed}/{reachable}</span>
                  </div>
                </div>
              </button>
            );
          })}
          {archivedRecords.length === 0 && (
            <div className="py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-tertiary)]"><Archive className="h-6 w-6" /></span>
              <div className="mt-4 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-secondary)]">暂无已归档问卷</div>
            </div>
          )}
        </section>
      </main>
    </div>
  );

  const renderQuestionEditor = (question: QuestionnaireQuestion, index: number) => {
    const expanded = expandedQuestionId === question.id;
    const meta = questionTypeMeta[question.type];
    const typeLabel = collectionMode === 'student_information'
      ? question.type === 'text' ? '多行文本' : question.type === 'single' ? '单选' : question.type === 'multiple' ? '多选' : meta.label
      : meta.label;
    const TypeIcon = meta.icon;
    return (
      <article key={question.id} className={`overflow-hidden rounded-[var(--tm-radius-card)] border bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-card)] transition-colors ${expanded ? 'border-[var(--tm-brand-primary-soft-strong)]' : 'border-[var(--tm-border-subtle)]'}`}>
        <button type="button" onClick={() => setExpandedQuestionId(expanded ? '' : question.id)} className={`flex min-h-[64px] w-full items-center gap-3 px-4 text-left transition-colors active:bg-[var(--tm-brand-primary-soft)] ${expanded ? 'bg-[var(--tm-brand-primary-soft)]' : ''}`}>
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-text-secondary)]">{index + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{question.title || '请输入题目'}</span>
            <span className="mt-0.5 flex items-center gap-1 text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]"><TypeIcon className="h-3 w-3" />{typeLabel}</span>
          </span>
          <ChevronRight className={`h-4 w-4 text-[var(--tm-text-disabled)] transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
        {expanded && (
          <div className="border-t border-[var(--tm-brand-primary-soft-strong)] px-4 pb-4 pt-3">
            <label className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]" htmlFor={`question-${question.id}`}>题目</label>
            <textarea
              id={`question-${question.id}`}
              value={question.title}
              onChange={event => updateQuestion(question.id, { title: event.target.value })}
              rows={2}
              placeholder="请输入问题"
              className="mt-2 min-h-[72px] w-full resize-none rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3.5 py-3 text-[length:var(--tm-font-size-body)] font-medium leading-5 text-[var(--tm-text-primary)] shadow-[var(--tm-shadow-control)] outline-none transition focus:border-[var(--tm-brand-primary)] focus:ring-4 focus:ring-[var(--tm-focus-ring)]"
            />
            {(question.type === 'single' || question.type === 'multiple') && (
              <div className="mt-4 space-y-2">
                <div className="px-0.5 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">选项</div>
                {question.options.map((option, optionIndex) => {
                  const allowsCustomAnswer = question.customAnswerOptions?.includes(option) ?? false;
                  return (
                    <div key={`${question.id}-${optionIndex}`}>
                      <div className="flex items-center gap-2">
                        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[8px] bg-[var(--tm-bg-surface-muted)] text-[length:var(--tm-font-size-badge)] font-bold tabular-nums text-[var(--tm-text-secondary)]">{optionIndex + 1}</span>
                        <input
                          value={option}
                          onChange={event => {
                            const nextValue = event.target.value;
                            updateQuestion(question.id, {
                              options: question.options.map((item, itemIndex) => itemIndex === optionIndex ? nextValue : item),
                              customAnswerOptions: (question.customAnswerOptions ?? []).map(item => item === option ? nextValue : item),
                            });
                          }}
                          aria-label={`选项${optionIndex + 1}`}
                          className="h-11 min-w-0 flex-1 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] shadow-[var(--tm-shadow-control)] outline-none transition focus:border-[var(--tm-brand-primary)] focus:ring-4 focus:ring-[var(--tm-focus-ring)]"
                        />
                        {question.options.length > 2 && (
                          <IconButton
                            label={`删除选项${optionIndex + 1}`}
                            onClick={() => updateQuestion(question.id, {
                              options: question.options.filter((_, itemIndex) => itemIndex !== optionIndex),
                              customAnswerOptions: (question.customAnswerOptions ?? []).filter(item => item !== option),
                            })}
                            className="h-11 w-11 text-[var(--tm-text-tertiary)]"
                          >
                            <X className="h-4 w-4" />
                          </IconButton>
                        )}
                      </div>
                      {allowsCustomAnswer && (
                        <div className="ml-8 mt-1 flex min-h-7 items-center gap-1.5 px-1 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-brand-primary-strong)]">
                          <MessageSquareText className="h-3.5 w-3.5" />
                          选中后需填写
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center justify-between gap-3">
                  <button type="button" onClick={() => updateQuestion(question.id, { options: [...question.options, `选项${question.options.length + 1}`] })} className="flex min-h-11 items-center gap-2 px-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)]">
                    <Plus className="h-4 w-4" /> 添加选项
                  </button>
                  <button type="button" onClick={() => setCustomOptionQuestionId(question.id)} className="flex min-h-11 items-center gap-1.5 px-1 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-tertiary)]">
                    <MoreHorizontal className="h-4 w-4" /> 更多
                  </button>
                </div>
              </div>
            )}
            {question.type === 'rating' && (
              <div className="mt-4 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] p-3">
                <div className="flex min-h-11 items-center justify-between gap-3">
                  <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">量表级数</span>
                  <div className="flex items-center gap-1.5">
                    <IconButton label="减少量表级数" disabled={question.options.length <= MIN_RATING_LEVELS} onClick={() => updateRatingLevelCount(question, question.options.length - 1)} className="h-11 w-11 border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] disabled:opacity-35"><Minus className="h-4 w-4" /></IconButton>
                    <span className="min-w-12 text-center text-[length:var(--tm-font-size-body)] font-bold tabular-nums text-[var(--tm-text-primary)]">{question.options.length}级</span>
                    <IconButton label="增加量表级数" disabled={question.options.length >= MAX_RATING_LEVELS} onClick={() => updateRatingLevelCount(question, question.options.length + 1)} className="h-11 w-11 border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] disabled:opacity-35"><Plus className="h-4 w-4" /></IconButton>
                  </div>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {question.options.map(value => <span key={value} className="flex h-9 w-9 items-center justify-center rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-[length:var(--tm-font-size-compact)] font-bold tabular-nums text-[var(--tm-text-secondary)]">{value}</span>)}
                </div>
              </div>
            )}
            {question.type === 'text' && <div className="mt-3 h-20 rounded-[var(--tm-radius-control)] border border-dashed border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-3 py-3 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-tertiary)]">{collectionMode === 'student_information' ? '多行填写区域' : '家长将在这里填写回答'}</div>}
            {question.type === 'short_text' && <div className="mt-3 h-11 rounded-[var(--tm-radius-control)] border border-dashed border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-3 py-3 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-tertiary)]">单行填写区域</div>}
            {question.type === 'number' && <div className="mt-3 h-11 rounded-[var(--tm-radius-control)] border border-dashed border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-3 py-3 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-tertiary)]">仅填写数字</div>}
            {question.type === 'date' && <div className="mt-3 h-11 rounded-[var(--tm-radius-control)] border border-dashed border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-3 py-3 text-[length:var(--tm-font-size-compact)] text-[var(--tm-text-tertiary)]">选择日期</div>}
            <div className="mt-3 flex items-center justify-between border-t border-[var(--tm-border-subtle)] pt-3">
              <button type="button" onClick={() => updateQuestion(question.id, { required: !question.required })} className="flex min-h-11 items-center gap-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]" aria-pressed={question.required}>
                <span className={`flex h-6 w-10 rounded-full p-0.5 transition ${question.required ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-border-subtle)]'}`}><span className={`h-5 w-5 rounded-full bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-control)] transition ${question.required ? 'translate-x-4' : ''}`} /></span>
                必答
              </button>
              <IconButton label={collectionMode === 'student_information' ? '删除字段' : '删除题目'} onClick={() => setDraftQuestions(items => items.filter(item => item.id !== question.id))} className="h-11 w-11 text-[var(--tm-status-negative-strong)]"><Trash2 className="h-4 w-4" /></IconButton>
            </div>
          </div>
        )}
      </article>
    );
  };

  const renderCreate = () => {
    const isStudentCollection = collectionMode === 'student_information';
    const targets = buildTargets();
    const reachableCount = targets.filter(target => target.reachable).length;
    const unreachableCount = targets.length - reachableCount;
    const activeClassNos = activeClassStudents.map(student => student.studentNo).filter(Boolean) as string[];
    const activeClassAllSelected = activeClassNos.length > 0 && activeClassNos.every(no => selectedStudentNos.has(no));
    const allClassesSelected = availableClasses.length > 0 && availableClasses.every(classInfo => selectedClassIds.has(classInfo.id));
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-page)] pb-24">
        <PageHeader
          title={draftId ? (isStudentCollection ? '编辑采集表' : '编辑问卷') : (isStudentCollection ? '新建采集表' : '新建问卷')}
          onBack={() => createStep > 1 ? setCreateStep(step => step - 1) : setPageMode('list')}
          action={draftId ? <IconButton label="草稿操作" onClick={() => setShowDraftMenu(true)}><MoreHorizontal className="h-5 w-5" /></IconButton> : undefined}
        />
        <StepIndicator current={createStep} mode={collectionMode} />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-28 no-scrollbar">
          {createStep === 1 && (
            <div className="space-y-4">
              <section className="rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]">
                <label htmlFor="survey-title" className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">{isStudentCollection ? '采集名称' : '问卷标题'}</label>
                <input id="survey-title" value={draftTitle} maxLength={40} onChange={event => setDraftTitle(event.target.value)} placeholder={isStudentCollection ? '例如：一年级新生入学信息采集' : '例如：暑期家庭阅读情况调查'} className="mt-2 h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-3.5 text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:bg-[var(--tm-bg-surface)] focus:ring-4 focus:ring-[var(--tm-focus-ring)]" />
                <label htmlFor="survey-description" className="mt-4 block text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]">说明（选填）</label>
                <textarea id="survey-description" value={draftDescription} maxLength={120} onChange={event => setDraftDescription(event.target.value)} rows={3} placeholder={isStudentCollection ? '简要说明需要采集的信息' : '简要说明本次调查目的'} className="mt-2 min-h-[88px] w-full resize-none rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-3.5 py-3 text-[length:var(--tm-font-size-body)] font-medium leading-5 text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:bg-[var(--tm-bg-surface)] focus:ring-4 focus:ring-[var(--tm-focus-ring)]" />
              </section>
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">{isStudentCollection ? '字段' : '题目'} <span className="ml-1 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">{draftQuestions.length}{isStudentCollection ? '项' : '题'}</span></h2>
                <SecondaryButton onClick={() => { setShowMoreFieldTypes(false); setShowQuestionTypeSheet(true); }} className="min-h-11 px-3 text-[var(--tm-brand-primary-strong)]"><Plus className="h-4 w-4" />{isStudentCollection ? '添加字段' : '添加题目'}</SecondaryButton>
              </div>
              <div className="space-y-3">
                {draftQuestions.map(renderQuestionEditor)}
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div>
              <div className="grid grid-cols-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1" role="tablist" aria-label={isStudentCollection ? '学生范围' : '发送范围'}>
                {([['all', '全体学生'], ['classes', '按班级'], ['students', '指定学生']] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={targetMode === mode}
                    onClick={() => setTargetMode(mode)}
                    className={`min-h-11 rounded-[var(--tm-radius-control)] px-1 text-[length:var(--tm-font-size-compact)] font-semibold ${targetMode === mode ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {targetMode === 'classes' && (
                <div className="mt-4">
                  <div className="flex min-h-11 items-center justify-between border-b border-[var(--tm-border-subtle)] px-1">
                    <span className="text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-primary)]">班级</span>
                    <button type="button" onClick={toggleAllClasses} className="min-h-11 px-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)]">{allClassesSelected ? '取消全选' : '全选'}</button>
                  </div>
                  <div className="divide-y divide-[var(--tm-border-subtle)]">
                    {availableClasses.map(classInfo => {
                      const selected = selectedClassIds.has(classInfo.id);
                      return (
                        <button key={classInfo.id} type="button" onClick={() => toggleClass(classInfo.id)} className="flex min-h-[56px] w-full items-center gap-3 text-left active:bg-[var(--tm-bg-surface-soft)]" aria-pressed={selected}>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]'}`}>{selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span>
                          <span className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{classInfo.name}</span>
                          <span className="text-[length:var(--tm-font-size-meta)] font-medium tabular-nums text-[var(--tm-text-tertiary)]">{classInfo.studentCount}人</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {targetMode === 'students' && (
                <div className="mt-4">
                  <select id="survey-class" aria-label="筛选班级" value={activeClassId} onChange={event => setActiveClassId(event.target.value)} className="h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3.5 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-4 focus:ring-[var(--tm-focus-ring)]">
                    {availableClasses.map(classInfo => <option key={classInfo.id} value={classInfo.id}>{classInfo.name}</option>)}
                  </select>
                  <div className="mt-2 flex min-h-11 items-center justify-between border-b border-[var(--tm-border-subtle)] px-1">
                    <span className="text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-tertiary)]">{activeClassStudents.length}名学生</span>
                    <button type="button" onClick={toggleActiveClass} className="min-h-11 px-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)]">{activeClassAllSelected ? '取消全选' : '全选本班'}</button>
                  </div>
                  <div className="divide-y divide-[var(--tm-border-subtle)]">
                    {activeClassStudents.map(student => {
                      const studentNo = student.studentNo ?? student.id;
                      const selected = selectedStudentNos.has(studentNo);
                      const reachable = isStudentCollection || Boolean(student.guardianContacts?.length) && !studentNo.endsWith('07');
                      return (
                        <button key={student.id} type="button" onClick={() => toggleStudent(studentNo)} className="flex min-h-[56px] w-full items-center gap-3 text-left active:bg-[var(--tm-bg-surface-soft)]" aria-pressed={selected}>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]'}`}>{selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span>
                          <span className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{demoLinkedStudentName(student)}</span>
                          {!isStudentCollection && !reachable && <span className="text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-brand-reward-strong)]">未绑定家长</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {createStep === 3 && (
            <div className="space-y-4">
              <section className="rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]">
                <h2 className="text-[length:var(--tm-font-size-card-title)] font-bold leading-6 text-[var(--tm-text-primary)]">{draftTitle}</h2>
                {draftDescription && <p className="mt-2 text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">{draftDescription}</p>}
                <div className={`mt-4 grid gap-2 border-t border-[var(--tm-border-subtle)] pt-4 text-center ${isStudentCollection ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {(isStudentCollection
                    ? [['字段', draftQuestions.length], ['学生', targets.length]]
                    : [['题目', draftQuestions.length], ['目标学生', targets.length], ['可送达', reachableCount]]).map(([label, value]) => (
                    <div key={String(label)}><div className="text-[length:var(--tm-font-size-page-title)] font-bold tabular-nums text-[var(--tm-text-primary)]">{value}</div><div className="mt-1 text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">{label}</div></div>
                  ))}
                </div>
              </section>
              {isStudentCollection && (
                <section className="overflow-hidden rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-card)]">
                  <button type="button" onClick={() => setShowAssignmentSheet(true)} className="flex min-h-[58px] w-full items-center justify-between gap-4 px-4 text-left transition-colors active:bg-[var(--tm-bg-surface-soft)]">
                    <span className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">填写分工</span>
                    <span className="flex min-w-0 items-center gap-1.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">
                      <span className="truncate">{studentAssignmentMode === 'creator' ? '我来填写' : '各班班主任'}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />
                    </span>
                  </button>
                </section>
              )}
              {!isStudentCollection && <section className="rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]">
                <div className="flex min-h-11 items-center justify-between gap-4">
                  <div><div className="text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-text-primary)]">建议完成时间</div><div className="mt-0.5 text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">选填</div></div>
                  <button
                    type="button"
                    aria-label="设置建议完成时间"
                    aria-pressed={hasSuggestedDeadline}
                    onClick={() => {
                      const next = !hasSuggestedDeadline;
                      setHasSuggestedDeadline(next);
                      if (next && !suggestedDeadline) setSuggestedDeadline(getDefaultSuggestedDeadline());
                    }}
                    className="flex h-11 w-14 shrink-0 items-center justify-center rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"
                  >
                    <span className={`flex h-7 w-12 rounded-full p-0.5 transition-colors ${hasSuggestedDeadline ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-border-subtle)]'}`}><span className={`h-6 w-6 rounded-full bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-control)] transition-transform ${hasSuggestedDeadline ? 'translate-x-5' : ''}`} /></span>
                  </button>
                </div>
                {hasSuggestedDeadline && (
                  <input aria-label="建议完成时间" type="datetime-local" value={suggestedDeadline} onChange={event => setSuggestedDeadline(event.target.value)} className="mt-3 h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-3.5 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:bg-[var(--tm-bg-surface)] focus:ring-4 focus:ring-[var(--tm-focus-ring)]" />
                )}
              </section>}
              {!isStudentCollection && unreachableCount > 0 && (
                <section className="flex min-h-11 items-center gap-3 rounded-[var(--tm-radius-inner)] border border-[var(--tm-brand-reward)]/20 bg-[var(--tm-brand-reward-soft)] px-4 py-3">
                  <UsersRound className="h-5 w-5 shrink-0 text-[var(--tm-brand-reward-strong)]" />
                  <div className="text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-brand-reward-strong)]">{unreachableCount}名学生未绑定家长</div>
                </section>
              )}
            </div>
          )}
        </main>

        <BottomAction>
          <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
            <SecondaryButton onClick={saveDraft}>
              <Save className="h-4 w-4" />保存草稿
            </SecondaryButton>
            <PrimaryButton
              disabled={createStep === 1 ? !validStepOne : createStep === 2 && targets.length === 0}
              onClick={createStep === 3 ? publishQuestionnaire : () => setCreateStep(step => Math.min(3, step + 1))}
            >
              {createStep === 3
                ? isStudentCollection ? <><ClipboardCheck className="h-4 w-4" />开始采集</> : <><Send className="h-4 w-4" />确认发布</>
                : '下一步'}
            </PrimaryButton>
          </div>
        </BottomAction>

        <BottomSheet open={showQuestionTypeSheet} label={isStudentCollection ? '选择字段类型' : '选择题型'} onDismiss={() => setShowQuestionTypeSheet(false)}>
          <h2 className="text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">{isStudentCollection ? '选择字段类型' : '选择题型'}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {((isStudentCollection
              ? (showMoreFieldTypes ? ['text', 'number', 'multiple'] : ['short_text', 'single', 'date'])
              : ['single', 'multiple', 'rating', 'text']) as QuestionnaireQuestionType[]).map(type => {
              const meta = questionTypeMeta[type];
              const TypeIcon = meta.icon;
              const label = isStudentCollection
                ? type === 'text' ? '多行文本' : type === 'single' ? '单选' : type === 'multiple' ? '多选' : meta.label
                : meta.label;
              return <button key={type} type="button" onClick={() => addQuestion(type)} className="flex min-h-[76px] items-center gap-3 rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] px-4 text-left active:scale-[0.98] active:bg-[var(--tm-brand-primary-soft)]"><span className="flex h-10 w-10 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] shadow-[var(--tm-shadow-control)]"><TypeIcon className="h-5 w-5" /></span><span className="text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-primary)]">{label}</span></button>;
            })}
          </div>
          {isStudentCollection && (
            <button type="button" onClick={() => setShowMoreFieldTypes(value => !value)} className="mt-3 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-[var(--tm-radius-control)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] active:bg-[var(--tm-brand-primary-soft)]">
              {showMoreFieldTypes ? '常用字段' : '更多字段'}<ChevronDown className={`h-4 w-4 transition-transform ${showMoreFieldTypes ? 'rotate-180' : ''}`} />
            </button>
          )}
        </BottomSheet>
        <BottomSheet open={showAssignmentSheet} label="填写分工" onDismiss={() => setShowAssignmentSheet(false)}>
          <h2 className="text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">填写分工</h2>
          <div className="mt-4 overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]">
            {([['creator', '我来填写'], ['homeroom', '各班班主任']] as const).map(([value, label]) => {
              const selected = studentAssignmentMode === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => { setStudentAssignmentMode(value); setShowAssignmentSheet(false); }}
                  className="flex min-h-[58px] w-full items-center justify-between border-b border-[var(--tm-border-subtle)] px-4 text-left last:border-b-0 active:bg-[var(--tm-bg-surface-soft)]"
                  aria-pressed={selected}
                >
                  <span className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{label}</span>
                  {selected && <Check className="h-5 w-5 text-[var(--tm-brand-primary-strong)]" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
        </BottomSheet>
        <BottomSheet open={Boolean(customOptionQuestionId)} label="更多选项" onDismiss={() => setCustomOptionQuestionId('')}>
          <div className="flex min-h-11 items-center justify-between gap-3">
            <h2 className="text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">更多选项</h2>
            <IconButton label="关闭" onClick={() => setCustomOptionQuestionId('')} className="h-11 w-11 bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]"><X className="h-4 w-4" /></IconButton>
          </div>
          <button type="button" onClick={addCustomAnswerOption} className="mt-3 flex min-h-[58px] w-full items-center gap-3 border-t border-[var(--tm-border-subtle)] text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">
            <span className="flex h-10 w-10 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]"><MessageSquareText className="h-5 w-5" /></span>
            添加“其他（请填写）”
          </button>
        </BottomSheet>
        <BottomSheet open={showDraftMenu} label="草稿操作" onDismiss={() => setShowDraftMenu(false)}>
          <button type="button" onClick={() => { setShowDraftMenu(false); setShowDeleteDraftConfirm(true); }} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-status-negative-strong)]">
            <Trash2 className="h-5 w-5" />删除草稿
          </button>
          <SecondaryButton className="mt-3 w-full" onClick={() => setShowDraftMenu(false)}>取消</SecondaryButton>
        </BottomSheet>
        <BottomSheet open={showDeleteDraftConfirm} label="删除草稿" onDismiss={() => setShowDeleteDraftConfirm(false)}>
          <h2 className="text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">删除草稿？</h2>
          <p className="mt-2 text-center text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">删除后无法恢复</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <SecondaryButton onClick={() => setShowDeleteDraftConfirm(false)}>取消</SecondaryButton>
            <button type="button" onClick={deleteCurrentDraft} className="min-h-11 rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative)] px-4 text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-inverse)] transition active:scale-[0.98] active:bg-[var(--tm-status-negative)]">删除</button>
          </div>
        </BottomSheet>
      </div>
    );
  };

  const renderStudentCollectionDetail = (record: QuestionnaireRecord) => {
    const assignedContext = recordOrigin === 'assigned-list';
    const normalizedSearch = studentRecordSearch.trim().toLowerCase();
    const studentRecords = assignedContext
      ? getStudentCollectionRecordsForTeacher(record, teacherId, teacherName)
      : record.targets.map(target => getStudentRecord(record, target.studentNo)).filter(Boolean) as StudentCollectionRecord[];
    const completed = studentRecords.filter(item => item.status === 'completed').length;
    const completion = studentRecords.length === 0 ? 0 : Math.round((completed / studentRecords.length) * 100);
    const visibleRecords = studentRecords.filter(item => (
      (studentRecordFilter === 'all' || item.status === studentRecordFilter)
      && (!normalizedSearch
        || item.studentName.toLowerCase().includes(normalizedSearch)
        || item.studentNo.toLowerCase().includes(normalizedSearch)
        || item.className.toLowerCase().includes(normalizedSearch))
    ));
    const studentStatusMeta: Record<StudentCollectionRecordStatus, { label: string; className: string }> = {
      pending: { label: '未填写', className: 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]' },
      draft: { label: '草稿', className: 'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]' },
      completed: { label: '已完成', className: 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]' },
    };
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-page)] pb-8">
        <PageHeader
          title="采集详情"
          onBack={() => setPageMode(assignedContext ? 'assigned-list' : record.status === 'archived' ? 'archived-list' : 'list')}
          action={assignedContext ? undefined : <IconButton label="更多操作" onClick={() => setShowRecordMenu(true)}><MoreHorizontal className="h-5 w-5" /></IconButton>}
        />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 no-scrollbar">
          <section className="mt-4 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]">
            <h2 className="text-balance text-[length:var(--tm-font-size-section-title)] font-bold leading-6 text-[var(--tm-text-primary)]">{record.title}</h2>
            {record.description && <p className="mt-1 line-clamp-2 text-pretty text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">{record.description}</p>}
            <div className="mt-4 flex items-end justify-between gap-4">
              <div className="text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">完成进度</div>
              <div className="text-[length:var(--tm-font-size-page-title)] font-bold tabular-nums text-[var(--tm-text-primary)]">{completed}<span className="ml-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-tertiary)]">/{studentRecords.length}</span></div>
            </div>
            <div className="mt-2"><ProgressBar value={completion} tone={record.status === 'ended' || record.status === 'archived' ? 'neutral' : 'positive'} /></div>
          </section>

          <div className="sticky top-0 z-20 -mx-1 mt-4 bg-[var(--tm-bg-page-glass)] px-1 py-3 backdrop-blur-md">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
              <input value={studentRecordSearch} onChange={event => setStudentRecordSearch(event.target.value)} placeholder="搜索学生" aria-label="搜索学生" className="h-11 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] pl-10 pr-3 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-focus-ring)]" />
            </label>
            <div className="mt-2 grid grid-cols-4 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1" role="tablist" aria-label="学生填写状态">
              {([['all', '全部'], ['pending', '未填写'], ['draft', '草稿'], ['completed', '已完成']] as const).map(([value, label]) => (
                <button key={value} type="button" role="tab" aria-selected={studentRecordFilter === value} onClick={() => setStudentRecordFilter(value)} className={`min-h-11 rounded-[var(--tm-radius-control)] px-1 text-[length:var(--tm-font-size-meta)] font-semibold ${studentRecordFilter === value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>{label}</button>
              ))}
            </div>
          </div>

          <section className="overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-card)]">
            {visibleRecords.map(item => (
              <button key={item.id} type="button" onClick={() => openStudentRecord(record, item.studentNo)} className="flex min-h-[64px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] px-4 text-left transition-colors last:border-b-0 active:bg-[var(--tm-bg-surface-soft)]">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-brand-primary-strong)]">{item.studentName.slice(-1)}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{item.studentName}</span><span className="mt-0.5 block truncate text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">{item.className}</span></span>
                <span className={`shrink-0 rounded-full px-2.5 py-1 text-[length:var(--tm-font-size-badge)] font-semibold ${studentStatusMeta[item.status].className}`}>{studentStatusMeta[item.status].label}</span>
              </button>
            ))}
            {visibleRecords.length === 0 && <div className="px-4 py-12 text-center text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-tertiary)]">暂无匹配学生</div>}
          </section>
        </main>

        <BottomSheet open={!assignedContext && showRecordMenu} label="采集操作" onDismiss={() => setShowRecordMenu(false)}>
          {record.status === 'archived' && <button type="button" onClick={restoreActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-brand-primary-strong)]"><ArchiveRestore className="h-5 w-5" />恢复到已结束</button>}
          <button type="button" onClick={duplicateActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]"><Copy className="h-5 w-5 text-[var(--tm-text-tertiary)]" />复制为新采集表</button>
          {record.status === 'active' && <button type="button" onClick={closeActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-status-negative-strong)]"><ClipboardCheck className="h-5 w-5" />结束采集</button>}
          {record.status === 'ended' && (
            <>
              <button type="button" onClick={reopenActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-brand-primary-strong)]"><RotateCcw className="h-5 w-5" />恢复编辑</button>
              <button type="button" onClick={archiveActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)]"><Archive className="h-5 w-5 text-[var(--tm-text-tertiary)]" />归档</button>
            </>
          )}
          <SecondaryButton className="mt-3 w-full" onClick={() => setShowRecordMenu(false)}>取消</SecondaryButton>
        </BottomSheet>
      </div>
    );
  };

  const renderStudentRecordPage = () => {
    if (!activeRecord) return renderList();
    const studentRecord = getStudentRecord(activeRecord, activeStudentNo);
    if (!studentRecord) return renderStudentCollectionDetail(activeRecord);
    const editable = activeRecord.status === 'active';
    const updateAnswer = (questionId: string, answer: QuestionnaireAnswer) => setStudentRecordAnswers(previous => ({ ...previous, [questionId]: answer }));
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-page)] pb-24">
        <PageHeader title={studentRecord.studentName} onBack={() => setPageMode('detail')} />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-28 no-scrollbar">
          <div className="pb-3 pt-4">
            <div className="truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)]">{activeRecord.title}</div>
            <div className="mt-1 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">{studentRecord.className}</div>
          </div>
          <section className="divide-y divide-[var(--tm-border-subtle)] overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-card)]">
            {activeRecord.questions.map((question, index) => {
              const answer = studentRecordAnswers[question.id];
              const selectedOptions = Array.isArray(answer) ? answer : typeof answer === 'string' ? [answer] : [];
              return (
                <div key={question.id} className="px-4 py-4">
                  <label className="block text-[length:var(--tm-font-size-body)] font-semibold leading-5 text-[var(--tm-text-primary)]">{index + 1}. {question.title}{question.required && <span className="ml-1 text-[var(--tm-status-negative-strong)]">*</span>}</label>
                  {question.type === 'short_text' && <input disabled={!editable} value={typeof answer === 'string' ? answer : ''} onChange={event => updateAnswer(question.id, event.target.value)} className="mt-3 h-11 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-4 focus:ring-[var(--tm-focus-ring)] disabled:bg-[var(--tm-bg-surface-soft)] disabled:text-[var(--tm-text-secondary)]" />}
                  {question.type === 'text' && <textarea disabled={!editable} value={typeof answer === 'string' ? answer : ''} onChange={event => updateAnswer(question.id, event.target.value)} rows={4} className="mt-3 min-h-[104px] w-full resize-none rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3 py-3 text-[length:var(--tm-font-size-body)] font-medium leading-5 text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-4 focus:ring-[var(--tm-focus-ring)] disabled:bg-[var(--tm-bg-surface-soft)] disabled:text-[var(--tm-text-secondary)]" />}
                  {question.type === 'number' && <input disabled={!editable} type="number" inputMode="decimal" value={typeof answer === 'number' || typeof answer === 'string' ? answer : ''} onChange={event => updateAnswer(question.id, event.target.value)} className="mt-3 h-11 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3 text-[length:var(--tm-font-size-body)] font-medium tabular-nums text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-4 focus:ring-[var(--tm-focus-ring)] disabled:bg-[var(--tm-bg-surface-soft)] disabled:text-[var(--tm-text-secondary)]" />}
                  {question.type === 'date' && <input disabled={!editable} type="date" value={typeof answer === 'string' ? answer : ''} onChange={event => updateAnswer(question.id, event.target.value)} className="mt-3 h-11 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-4 focus:ring-[var(--tm-focus-ring)] disabled:bg-[var(--tm-bg-surface-soft)] disabled:text-[var(--tm-text-secondary)]" />}
                  {(question.type === 'single' || question.type === 'multiple') && (
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      {question.options.map(option => {
                        const selected = selectedOptions.includes(option);
                        return <button key={option} type="button" disabled={!editable} aria-pressed={selected} onClick={() => updateAnswer(question.id, question.type === 'multiple' ? (selected ? selectedOptions.filter(item => item !== option) : [...selectedOptions, option]) : option)} className={`min-h-11 rounded-[var(--tm-radius-control)] border px-3 text-left text-[length:var(--tm-font-size-compact)] font-semibold transition active:scale-[0.98] disabled:active:scale-100 ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)]'}`}>{option}</button>;
                      })}
                    </div>
                  )}
                  {question.type === 'rating' && <div className="mt-3 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">{formatQuestionnaireAnswer(answer)}</div>}
                </div>
              );
            })}
          </section>
        </main>
        {editable && (
          <BottomAction>
            <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
              <SecondaryButton onClick={() => saveActiveStudentRecord(studentRecord.status === 'completed' ? 'completed' : 'draft')}><Save className="h-4 w-4" />{studentRecord.status === 'completed' ? '保存' : '保存草稿'}</SecondaryButton>
              <PrimaryButton onClick={() => saveActiveStudentRecord('completed')}><CheckCircle2 className="h-4 w-4" />完成</PrimaryButton>
            </div>
          </BottomAction>
        )}
      </div>
    );
  };

  const renderDataSummary = (record: QuestionnaireRecord) => {
    const reachable = getReachableTargetCount(record);
    const completion = getCompletionRate(record);
    const pending = Math.max(0, reachable - record.submissions.length);
    const unreachable = record.targets.length - reachable;
    return (
      <div className="space-y-3">
        <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">完成情况</div>
              <div className="mt-1 text-[length:var(--tm-font-size-metric)] font-bold tabular-nums text-[var(--tm-text-primary)]">{record.submissions.length}<span className="ml-1 text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-tertiary)]">/{reachable}</span></div>
            </div>
            <div className="space-y-1 text-right text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">
              <div>待提交 <span className="ml-1 font-semibold tabular-nums text-[var(--tm-brand-reward-strong)]">{pending}</span></div>
              <div>未送达 <span className="ml-1 font-semibold tabular-nums text-[var(--tm-text-secondary)]">{unreachable}</span></div>
            </div>
          </div>
          <div className="mt-3"><ProgressBar value={completion} tone={record.status === 'ended' ? 'neutral' : 'positive'} /></div>
        </section>
        {record.status === 'active' && isQuestionnaireOverdue(record) && (
          <button type="button" onClick={closeActiveRecord} className="flex min-h-12 w-full items-center gap-3 rounded-[var(--tm-radius-inner)] bg-[var(--tm-brand-reward-soft)] px-4 text-left active:bg-[var(--tm-brand-reward-soft)]">
            <CalendarDays className="h-4 w-4 shrink-0 text-[var(--tm-brand-reward-strong)]" />
            <span className="min-w-0 flex-1 truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-reward-strong)]">已到建议完成时间</span>
            <span className="shrink-0 text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-brand-reward-strong)]">结束收集</span>
          </button>
        )}
      </div>
    );
  };

  const renderResponses = (record: QuestionnaireRecord) => {
    const submittedNos = new Set(record.submissions.map(item => item.studentNo));
    const rows = responseFilter === 'completed'
      ? record.submissions
      : responseFilter === 'pending'
        ? record.targets.filter(target => target.reachable && !submittedNos.has(target.studentNo))
        : record.targets.filter(target => !target.reachable);
    return (
      <div>
        <div className="grid grid-cols-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1">
          {([['completed', '已完成'], ['pending', '未完成'], ['unreachable', '未送达']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setResponseFilter(value)} className={`min-h-11 rounded-[var(--tm-radius-control)] px-1 text-[length:var(--tm-font-size-meta)] font-semibold ${responseFilter === value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>{label}</button>)}
        </div>
        <section className="mt-4 overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] shadow-[var(--tm-shadow-card)]">
          {rows.map(row => {
            const isSubmission = 'answers' in row;
            return (
              <button key={isSubmission ? row.id : row.studentNo} type="button" disabled={!isSubmission} onClick={() => { if (isSubmission) { setActiveSubmission(row); setPageMode('response'); } }} className="flex min-h-[62px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] px-4 text-left last:border-b-0 active:bg-[var(--tm-bg-surface-soft)] disabled:cursor-default">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] ${isSubmission ? 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]' : responseFilter === 'unreachable' ? 'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]' : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-tertiary)]'}`}>{isSubmission ? <CheckCircle2 className="h-4.5 w-4.5" /> : <UserRoundCheck className="h-4.5 w-4.5" />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{row.studentName}</span><span className="mt-0.5 block truncate text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">{isSubmission ? `${row.guardianRelation} · ${row.submittedAt}` : row.className}</span></span>
                {isSubmission && <ChevronRight className="h-4 w-4 text-[var(--tm-text-disabled)]" />}
              </button>
            );
          })}
          {rows.length === 0 && <div className="px-4 py-12 text-center text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-tertiary)]">暂无数据</div>}
        </section>
      </div>
    );
  };

  const renderAnalysis = (record: QuestionnaireRecord) => (
    <div className="space-y-3">
      {record.questions.map((question, questionIndex) => {
        const answers = record.submissions.map(item => item.answers[question.id]).filter(answer => answer !== undefined && answer !== '');
        if (question.type === 'text') {
          const textAnswers = answers.map(answer => String(answer).trim()).filter(Boolean);
          const keywords = getFrequentKeywords(textAnswers);
          const showAllInline = textAnswers.length <= 5;
          const visibleAnswers = showAllInline ? textAnswers : textAnswers.slice(-2).reverse();
          const showEffectiveCount = textAnswers.length !== record.submissions.length;
          return (
            <section key={question.id} className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary-strong)]">{questionIndex + 1} · {questionTypeMeta[question.type].label}</div>
                {showEffectiveCount && <div className="shrink-0 text-[length:var(--tm-font-size-badge)] font-medium tabular-nums text-[var(--tm-text-tertiary)]">有效回答 {textAnswers.length}</div>}
              </div>
              <h3 className="mt-2 text-balance text-[length:var(--tm-font-size-body)] font-bold leading-5 text-[var(--tm-text-primary)]">{question.title}</h3>
              {keywords.length > 0 && (
                <div className="mt-3">
                  <div className="text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">高频词</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {keywords.map(([word, count]) => <span key={word} className="inline-flex h-7 items-center gap-1 rounded-full bg-[var(--tm-brand-primary-soft)] px-2.5 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary-strong)]">{word}<span className="tabular-nums text-[var(--tm-brand-primary-strong)]">{count}</span></span>)}
                  </div>
                </div>
              )}
              {visibleAnswers.length > 0
                ? <div className="mt-3"><div className="mb-2 text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">{showAllInline ? '回答' : '最近回答'}</div><div className="space-y-2">{visibleAnswers.map((answer, index) => <div key={`${question.id}-${index}`} className={`rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3 py-2.5 text-pretty text-[length:var(--tm-font-size-meta)] font-medium leading-5 text-[var(--tm-text-secondary)] ${showAllInline ? '' : 'line-clamp-3'}`}>{answer}</div>)}</div></div>
                : <div className="mt-3 py-3 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">暂无回答</div>}
              {!showAllInline && (
                <button type="button" onClick={() => openQuestionResponses(question.id)} className="mt-3 flex min-h-11 w-full items-center justify-between rounded-[var(--tm-radius-control)] px-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] transition-[transform,background-color] active:scale-[0.96] active:bg-[var(--tm-brand-primary-soft)]">
                  查看全部回答<ChevronRight className="h-4 w-4" />
                </button>
              )}
            </section>
          );
        }
        const options = question.options;
        const counts = options.map(option => answers.filter(answer => (
          question.type === 'rating'
            ? String(answer) === option
            : getQuestionnaireSelectedOptions(answer).includes(option)
        )).length);
        const ratingAverage = question.type === 'rating' && answers.length > 0 ? (answers.reduce<number>((sum, answer) => sum + Number(answer), 0) / answers.length).toFixed(1) : null;
        return (
          <section key={question.id} className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]">
            <div className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary-strong)]">{questionIndex + 1} · {questionTypeMeta[question.type].label}</div>
            <h3 className="mt-2 text-balance text-[length:var(--tm-font-size-body)] font-bold leading-5 text-[var(--tm-text-primary)]">{question.title}</h3>
            {ratingAverage && <div className="mt-3 flex items-baseline gap-2"><span className="text-[length:var(--tm-font-size-metric)] font-bold tabular-nums text-[var(--tm-text-primary)]">{ratingAverage}</span><span className="text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">平均分 / {options.length}</span></div>}
            <div className="mt-4 space-y-3">
              {options.map((option, index) => {
                const percent = answers.length === 0 ? 0 : Math.round((counts[index] / answers.length) * 100);
                return <div key={option}><div className="mb-1.5 flex items-center justify-between gap-3 text-[length:var(--tm-font-size-meta)]"><span className="truncate font-medium text-[var(--tm-text-secondary)]">{option}</span><span className="shrink-0 tabular-nums font-semibold text-[var(--tm-text-secondary)]">{counts[index]}人&nbsp;&nbsp;{percent}%</span></div><div className="h-1.5 rounded-full bg-[var(--tm-bg-surface-muted)]"><div className="h-1.5 rounded-full bg-[var(--tm-brand-primary)] transition-[width] [transition-duration:var(--tm-duration-panel)]" style={{ width: `${percent}%` }} /></div></div>;
              })}
            </div>
          </section>
        );
      })}
    </div>
  );

  const renderData = (record: QuestionnaireRecord) => {
    return (
      <div className="space-y-5">
        {renderDataSummary(record)}
        <section>
          <h3 className="mb-3 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">题目数据</h3>
          {renderAnalysis(record)}
        </section>
      </div>
    );
  };

  const renderDetail = () => {
    if (!activeRecord) return renderList();
    if (getQuestionnaireCollectionMode(activeRecord) === 'student_information') return renderStudentCollectionDetail(activeRecord);
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-page)] pb-8">
        <PageHeader title="问卷详情" onBack={() => setPageMode(activeRecord.status === 'archived' ? 'archived-list' : 'list')} action={<IconButton label="更多操作" onClick={() => setShowRecordMenu(true)}><MoreHorizontal className="h-5 w-5" /></IconButton>} />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 no-scrollbar">
          <section className="mt-4 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-balance text-[length:var(--tm-font-size-section-title)] font-bold leading-6 text-[var(--tm-text-primary)]">{activeRecord.title}</h2>
                {activeRecord.description && <p className="mt-1 line-clamp-2 text-pretty text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">{activeRecord.description}</p>}
              </div>
              <button
                type="button"
                aria-label="预览问卷"
                title="预览问卷"
                onClick={() => setPageMode('preview')}
                className="-mr-2 -mt-2 inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-[var(--tm-radius-control)] px-2.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] transition-[transform,background-color] active:scale-[0.96] active:bg-[var(--tm-brand-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2"
              >
                <Eye className="h-4 w-4" />预览
              </button>
            </div>
            {activeRecord.suggestedDeadline && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[var(--tm-text-tertiary)]" />
                {formatSuggestedDeadline(activeRecord.suggestedDeadline)}
              </div>
            )}
          </section>
          <div className="sticky top-0 z-20 -mx-1 mt-4 grid grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1 backdrop-blur" role="tablist">
            {([['data', '数据'], ['responses', '答卷']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={detailTab === value} onClick={() => setDetailTab(value)} className={`min-h-11 rounded-[var(--tm-radius-control)] px-2 text-[length:var(--tm-font-size-compact)] font-semibold transition-[color,background-color,box-shadow] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] ${detailTab === value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] shadow-[var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>{label}</button>)}
          </div>
          <div className="mt-4">{detailTab === 'data' ? renderData(activeRecord) : renderResponses(activeRecord)}</div>
        </main>
        <BottomSheet open={showRecordMenu} label="问卷操作" onDismiss={() => setShowRecordMenu(false)}>
          {activeRecord.status === 'archived' && <button type="button" onClick={restoreActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-brand-primary-strong)]"><ArchiveRestore className="h-5 w-5" />恢复到已结束</button>}
          <button type="button" onClick={duplicateActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]"><Copy className="h-5 w-5 text-[var(--tm-text-tertiary)]" />复制为新问卷</button>
          {activeRecord.status === 'active' && <button type="button" onClick={closeActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-status-negative-strong)]"><ClipboardCheck className="h-5 w-5" />结束收集</button>}
          {activeRecord.status === 'ended' && (
            <>
              {!isQuestionnaireFullyCollected(activeRecord) && <button type="button" onClick={reopenActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-brand-primary-strong)]"><RotateCcw className="h-5 w-5" />重新开放</button>}
              <button type="button" onClick={archiveActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)]"><Archive className="h-5 w-5 text-[var(--tm-text-tertiary)]" />归档</button>
            </>
          )}
          <SecondaryButton className="mt-3 w-full" onClick={() => setShowRecordMenu(false)}>取消</SecondaryButton>
        </BottomSheet>
      </div>
    );
  };

  const renderResponseDetail = () => {
    if (!activeRecord || !activeSubmission) return renderDetail();
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-page)]">
        <PageHeader title="答卷详情" onBack={() => setPageMode('detail')} />
        <main className="min-h-0 flex-1 touch-pan-y space-y-3 overflow-y-auto overscroll-contain px-5 py-4 no-scrollbar">
          <div className="flex items-center gap-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-status-positive-soft)] px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[var(--tm-status-positive-strong)]" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-text-primary)]">{activeSubmission.studentName}<span className="ml-2 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{activeSubmission.guardianRelation}</span></div>
              <div className="mt-0.5 truncate text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-status-positive-strong)]">提交于 {activeSubmission.submittedAt}</div>
            </div>
          </div>
          {activeRecord.questions.map((question, index) => {
            const answer = activeSubmission.answers[question.id];
            return <section key={question.id} className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]"><div className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary-strong)]">第{index + 1}题 · {questionTypeMeta[question.type].label}</div><h3 className="mt-2 text-balance text-[length:var(--tm-font-size-body)] font-bold leading-5 text-[var(--tm-text-primary)]">{question.title}</h3><div className="mt-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3 py-2.5 text-pretty text-[length:var(--tm-font-size-compact)] font-semibold leading-5 text-[var(--tm-text-secondary)]">{formatQuestionnaireAnswer(answer)}</div></section>;
          })}
        </main>
      </div>
    );
  };

  const renderQuestionResponses = () => {
    if (!activeRecord) return renderList();
    const question = activeRecord.questions.find(item => item.id === activeQuestionId);
    if (!question || question.type !== 'text') return renderDetail();
    const questionIndex = activeRecord.questions.findIndex(item => item.id === question.id);
    const rows = activeRecord.submissions.map(submission => {
      const answer = submission.answers[question.id];
      const target = activeRecord.targets.find(item => item.studentNo === submission.studentNo);
      return {
        id: submission.id,
        studentNo: submission.studentNo,
        studentName: submission.studentName,
        className: target?.className ?? '未分班级',
        submittedAt: submission.submittedAt,
        answer: typeof answer === 'string' ? answer.trim() : '',
      };
    }).filter(row => row.answer).reverse();
    const classOptions = Array.from(new Set(rows.map(row => row.className)));
    const normalizedSearch = questionResponseSearch.trim().toLowerCase();
    const filteredRows = rows.filter(row => (
      (questionResponseClass === 'all' || row.className === questionResponseClass)
      && (!normalizedSearch
        || row.answer.toLowerCase().includes(normalizedSearch)
        || row.studentName.toLowerCase().includes(normalizedSearch)
        || row.studentNo.toLowerCase().includes(normalizedSearch))
    ));
    const visibleRows = filteredRows.slice(0, visibleQuestionResponseCount);
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[var(--tm-bg-page)]">
        <PageHeader title="全部回答" onBack={() => setPageMode('detail')} />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 no-scrollbar">
          <section className="pt-4">
            <div className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary-strong)]">第{questionIndex + 1}题 · 简答题</div>
            <h2 className="mt-2 text-balance text-[length:var(--tm-font-size-section-title)] font-bold leading-6 text-[var(--tm-text-primary)]">{question.title}</h2>
          </section>
          <div className="sticky top-0 z-20 -mx-1 mt-4 bg-[var(--tm-bg-page-glass)] px-1 py-3 backdrop-blur-md">
            <div className={`grid gap-2 ${classOptions.length > 1 ? 'grid-cols-[minmax(0,1fr)_120px]' : 'grid-cols-1'}`}>
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
                <input value={questionResponseSearch} onChange={event => { setQuestionResponseSearch(event.target.value); setVisibleQuestionResponseCount(20); }} placeholder="搜索回答或学生" aria-label="搜索回答或学生" className="h-11 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] pl-10 pr-3 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-focus-ring)]" />
              </label>
              {classOptions.length > 1 && (
                <label className="relative block">
                  <select value={questionResponseClass} onChange={event => { setQuestionResponseClass(event.target.value); setVisibleQuestionResponseCount(20); }} aria-label="按班级筛选回答" className="h-11 w-full appearance-none rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] pl-3 pr-8 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-focus-ring)]">
                    <option value="all">全部班级</option>
                    {classOptions.map(className => <option key={className} value={className}>{className}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
                </label>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {visibleRows.map(row => (
              <article key={row.id} className="rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]">
                <p className="text-pretty text-[length:var(--tm-font-size-body)] font-medium leading-6 text-[var(--tm-text-secondary)]">{row.answer}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">
                  <span>{row.studentName}</span><span aria-hidden="true">·</span><span>{row.className}</span><span aria-hidden="true">·</span><span>{row.submittedAt}</span>
                </div>
              </article>
            ))}
            {visibleRows.length === 0 && <div className="py-14 text-center text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-tertiary)]">暂无匹配回答</div>}
          </div>
          {filteredRows.length > visibleRows.length && (
            <button type="button" onClick={() => setVisibleQuestionResponseCount(count => count + 20)} className="mt-4 min-h-11 w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] shadow-[var(--tm-shadow-card)] active:scale-[0.96]">加载更多</button>
          )}
        </main>
      </div>
    );
  };

  const renderPreview = () => {
    if (!activeRecord) return renderList();
    const previewTarget = activeRecord.targets[0];
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
        <AssignedQuestionnaireView
          questionnaire={activeRecord}
          child={{
            name: previewTarget?.studentName ?? '学生',
            studentNo: previewTarget?.studentNo ?? 'questionnaire-preview',
          }}
          guardianRelation="家长"
          onBack={() => setPageMode('detail')}
          onSubmitted={() => undefined}
          preview
        />
      </div>
    );
  };

  const renderPage = () => {
    if (pageMode === 'list') return renderList();
    if (pageMode === 'assigned-list') return renderAssignedList();
    if (pageMode === 'archived-list') return renderArchivedList();
    if (pageMode === 'create') return renderCreate();
    if (pageMode === 'detail') return renderDetail();
    if (pageMode === 'preview') return renderPreview();
    if (pageMode === 'question-responses') return renderQuestionResponses();
    if (pageMode === 'student-record') return renderStudentRecordPage();
    return renderResponseDetail();
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden font-sans text-[var(--tm-text-primary)]">
      {renderPage()}
      {toast && <div className="pointer-events-none absolute left-1/2 top-16 z-[70] -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--tm-text-primary)] px-4 py-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] shadow-[var(--tm-shadow-card-raised)]">{toast}</div>}
    </div>
  );
};

export default QuestionnaireManagementView;
