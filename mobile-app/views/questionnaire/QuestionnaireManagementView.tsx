import React, { useEffect, useMemo, useState } from 'react';
import '../../styles/teacherMobileTokens.css';
import {
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
  GripVertical,
  ListChecks,
  MessageSquareText,
  MoreHorizontal,
  Plus,
  RotateCcw,
  Save,
  Search,
  Send,
  Star,
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
  getQuestionnaireSelectedOptions,
  getReachableTargetCount,
  isQuestionnaireOverdue,
  readQuestionnaires,
  updateQuestionnaireStatus,
  upsertQuestionnaire,
  type QuestionnaireQuestion,
  type QuestionnaireQuestionType,
  type QuestionnaireRecord,
  type QuestionnaireSubmission,
  type QuestionnaireTarget,
  type QuestionnaireTargetMode,
  type QuestionnaireStatus,
} from '../../../shared/questionnaireStore';

interface QuestionnaireManagementViewProps {
  onBack: () => void;
  teacherName: string;
  spaceId: string;
  classes: ClassInfo[];
  getStudentsForClass: (classId: string) => Student[];
}

type ListFilter = 'active' | 'ended' | 'draft';
type DetailTab = 'data' | 'responses';
type PageMode = 'list' | 'archived-list' | 'create' | 'detail' | 'response' | 'preview' | 'question-responses';

const statusMeta: Record<QuestionnaireStatus, { label: string }> = {
  active: { label: '收集中' },
  ended: { label: '已结束' },
  draft: { label: '草稿' },
  archived: { label: '已归档' },
};

const questionTypeMeta: Record<QuestionnaireQuestionType, { label: string; icon: React.ElementType }> = {
  single: { label: '单选题', icon: CircleDot },
  multiple: { label: '多选题', icon: ListChecks },
  rating: { label: '量表题', icon: Star },
  text: { label: '简答题', icon: MessageSquareText },
};

const formatSuggestedDeadline = (deadline: string) => deadline.replace('2026-', '').replace('-', '月').replace(' ', '日 ');
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

const ProgressBar: React.FC<{ value: number; tone?: 'aqua' | 'slate' }> = ({ value, tone = 'aqua' }) => (
  <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={value}>
    <div
      className={`h-full rounded-full transition-[width] duration-300 ${tone === 'aqua' ? 'bg-gradient-to-r from-[#58C3CF] to-[#7F9EED]' : 'bg-slate-400'}`}
      style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
    />
  </div>
);

const IconButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }> = ({ label, className = '', children, ...props }) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-slate-600 transition active:scale-[0.96] active:bg-slate-100 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const PageHeader: React.FC<{
  title: string;
  onBack: () => void;
  action?: React.ReactNode;
}> = ({ title, onBack, action }) => (
  <header className="sticky top-0 z-[45] flex h-11 shrink-0 items-center justify-between border-b border-slate-100/30 bg-white/80 px-4 backdrop-blur-md">
    <button
      type="button"
      aria-label="返回"
      onClick={onBack}
      className="-ml-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-slate-500 transition-colors active:bg-slate-100"
    >
      <ChevronLeft className="h-5 w-5" />
    </button>
    <h1 className="pointer-events-none absolute inset-x-16 truncate text-center text-[17px] font-bold tracking-tight text-slate-800">{title}</h1>
    <div className={`flex shrink-0 items-center justify-center ${action ? '-mr-2 h-11 w-11' : 'h-10 w-10'}`} aria-hidden={!action}>
      {action}
    </div>
  </header>
);

const BottomAction: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute inset-x-0 bottom-0 z-30 border-t border-white/80 bg-white/88 px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-14px_34px_-28px_rgba(15,23,42,0.40)] backdrop-blur-xl">
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
    <div className="absolute inset-0 z-50 flex items-end bg-slate-900/18 backdrop-blur-[2px]" onClick={onDismiss}>
      <section
        className="w-full rounded-t-[28px] border border-white bg-white px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 shadow-[0_-20px_50px_-34px_rgba(15,23,42,0.52)]"
        onClick={event => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={label}
      >
        <div className="mx-auto mb-4 h-1.5 w-11 rounded-full bg-slate-200" />
        {children}
      </section>
    </div>
  );
};

const PrimaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...props }) => (
  <button
    type="button"
    className={`inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[16px] bg-gradient-to-r from-[#48B8C5] to-[#6E8FE3] px-5 text-[15px] font-bold text-white shadow-[0_15px_28px_-18px_rgba(61,126,198,0.78)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none ${className}`}
    {...props}
  >
    {children}
  </button>
);

const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...props }) => (
  <button
    type="button"
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[15px] border border-slate-100 bg-white px-4 text-[14px] font-semibold text-slate-600 shadow-sm transition active:scale-[0.98] active:bg-slate-50 disabled:opacity-45 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="grid grid-cols-3 gap-2 px-5 py-4" aria-label={`创建进度，第${current}步，共3步`}>
    {['编辑问卷', '发送范围', '确认发布'].map((label, index) => {
      const step = index + 1;
      const active = step === current;
      const complete = step < current;
      return (
        <div key={label} className="min-w-0">
          <div className={`h-1.5 rounded-full ${complete || active ? 'bg-[#58C3CF]' : 'bg-slate-100'}`} />
          <div className={`mt-2 truncate text-[12px] font-semibold ${active ? 'text-slate-900' : complete ? 'text-[#1E9AAA]' : 'text-slate-400'}`}>
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
  options: type === 'single' || type === 'multiple' ? ['选项1', '选项2'] : type === 'rating' ? ['1', '2', '3', '4', '5'] : [],
  customAnswerOptions: [],
});

const QuestionnaireManagementView: React.FC<QuestionnaireManagementViewProps> = ({
  onBack,
  teacherName,
  spaceId,
  classes,
  getStudentsForClass,
}) => {
  const [records, setRecords] = useState<QuestionnaireRecord[]>(() => readQuestionnaires());
  const [pageMode, setPageMode] = useState<PageMode>('list');
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
  const [draftId, setDraftId] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftQuestions, setDraftQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [expandedQuestionId, setExpandedQuestionId] = useState('');
  const [targetMode, setTargetMode] = useState<QuestionnaireTargetMode>('all');
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());
  const [selectedStudentNos, setSelectedStudentNos] = useState<Set<string>>(new Set());
  const [activeClassId, setActiveClassId] = useState(classes[0]?.id ?? '');
  const [hasSuggestedDeadline, setHasSuggestedDeadline] = useState(false);
  const [suggestedDeadline, setSuggestedDeadline] = useState('');
  const [showQuestionTypeSheet, setShowQuestionTypeSheet] = useState(false);
  const [customOptionQuestionId, setCustomOptionQuestionId] = useState('');
  const [showRecordMenu, setShowRecordMenu] = useState(false);
  const [showDraftMenu, setShowDraftMenu] = useState(false);
  const [showDeleteDraftConfirm, setShowDeleteDraftConfirm] = useState(false);
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
  const filteredRecords = records.filter(record => record.spaceId === spaceId && record.status === listFilter);
  const archivedRecords = records.filter(record => record.spaceId === spaceId && record.status === 'archived');
  const validStepOne = Boolean(draftTitle.trim()) && draftQuestions.length > 0 && draftQuestions.every(question => (
    Boolean(question.title.trim()) && (question.type === 'text' || question.type === 'rating' || question.options.filter(Boolean).length >= 2)
  ));

  const showToast = (message: string) => setToast(message);

  const openRecord = (record: QuestionnaireRecord) => {
    if (record.status === 'draft') {
      startCreate(record);
      return;
    }
    setActiveRecordId(record.id);
    setDetailTab('data');
    setPageMode('detail');
  };

  const openQuestionResponses = (questionId: string) => {
    setActiveQuestionId(questionId);
    setQuestionResponseSearch('');
    setQuestionResponseClass('all');
    setVisibleQuestionResponseCount(20);
    setPageMode('question-responses');
  };

  const startCreate = (record?: QuestionnaireRecord) => {
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
      reachable: Boolean(student.guardianContacts?.length) && !student.studentNo?.endsWith('07'),
    }));

  const saveDraft = () => {
    const existing = records.find(record => record.id === draftId);
    const record: QuestionnaireRecord = {
      id: draftId || createQuestionnaireId(),
      title: draftTitle.trim() || '未命名问卷',
      description: draftDescription.trim(),
      creatorName: teacherName,
      spaceId,
      createdAt: existing?.createdAt ?? nowText(),
      suggestedDeadline: hasSuggestedDeadline ? suggestedDeadline.replace('T', ' ') : '',
      status: 'draft',
      targetMode,
      targetClassIds: targetMode === 'classes' ? Array.from(selectedClassIds) : [],
      questions: draftQuestions,
      targets: buildTargets(),
      submissions: existing?.submissions ?? [],
    };
    upsertQuestionnaire(record);
    setRecords(readQuestionnaires());
    setListFilter('draft');
    setPageMode('list');
    showToast('草稿已保存');
  };

  const publishQuestionnaire = () => {
    const existing = records.find(record => record.id === draftId);
    const record: QuestionnaireRecord = {
      id: draftId || createQuestionnaireId(),
      title: draftTitle.trim(),
      description: draftDescription.trim(),
      creatorName: teacherName,
      spaceId,
      createdAt: existing?.createdAt ?? nowText(),
      suggestedDeadline: hasSuggestedDeadline ? suggestedDeadline.replace('T', ' ') : '',
      status: 'active',
      targetMode,
      targetClassIds: targetMode === 'classes' ? Array.from(selectedClassIds) : [],
      questions: draftQuestions,
      targets: buildTargets(),
      submissions: existing?.submissions ?? [],
    };
    upsertQuestionnaire(record);
    setRecords(readQuestionnaires());
    setActiveRecordId(record.id);
    setDetailTab('data');
    setPageMode('detail');
    showToast('问卷已发布到家长端');
  };

  const updateQuestion = (id: string, patch: Partial<QuestionnaireQuestion>) => {
    setDraftQuestions(items => items.map(item => item.id === id ? { ...item, ...patch } : item));
  };

  const addQuestion = (type: QuestionnaireQuestionType) => {
    const question = emptyQuestion(type);
    setDraftQuestions(items => [...items, question]);
    setExpandedQuestionId(question.id);
    setShowQuestionTypeSheet(false);
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
    showToast('问卷已结束');
  };

  const reopenActiveRecord = () => {
    if (!activeRecord || activeRecord.status !== 'ended') return;
    if (!updateQuestionnaireStatus(activeRecord.id, 'active')) return;
    setRecords(readQuestionnaires());
    setShowRecordMenu(false);
    showToast('问卷已重新开放');
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

  const renderList = () => {
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,#F4FBFF_0%,#FFFFFF_46%,#F6FAFD_100%)] pb-24">
        <PageHeader
          title="问卷调查"
          onBack={onBack}
          action={<IconButton label="新建问卷" onClick={() => startCreate()} className="text-[#1E9AAA]"><Plus className="h-5 w-5" /></IconButton>}
        />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 pt-4 no-scrollbar">
          <div className="grid grid-cols-3 rounded-[14px] bg-slate-100/80 p-1" role="tablist" aria-label="问卷状态">
            {([['active', '收集中'], ['ended', '已结束'], ['draft', '草稿']] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={listFilter === value}
                onClick={() => setListFilter(value)}
                className={`min-h-10 rounded-[11px] px-2 text-[13px] font-semibold transition ${listFilter === value ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {listFilter === 'ended' && archivedRecords.length > 0 && (
            <button
              type="button"
              onClick={() => setPageMode('archived-list')}
              className="mt-3 flex min-h-11 w-full items-center gap-2 rounded-[14px] px-2 text-left text-[13px] font-semibold text-slate-500 transition-colors active:bg-white/70"
            >
              <Archive className="h-4 w-4 text-slate-400" />
              <span className="flex-1">已归档</span>
              <span className="tabular-nums text-slate-400">{archivedRecords.length}</span>
            </button>
          )}

          <section className={`${listFilter === 'ended' && archivedRecords.length > 0 ? 'mt-1' : 'mt-3'} space-y-2.5`}>
            {filteredRecords.map(record => {
              const reachable = getReachableTargetCount(record);
              const completion = getCompletionRate(record);
              const overdue = isQuestionnaireOverdue(record);
              return (
                <button
                  key={record.id}
                  type="button"
                  onClick={() => openRecord(record)}
                  className={`w-full cursor-pointer rounded-[16px] bg-white px-4 py-4 text-left shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_2px_8px_-4px_rgba(15,23,42,0.12),0_12px_24px_-20px_rgba(35,96,145,0.32)] transition-[scale,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] active:bg-slate-50 active:shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_1px_4px_-2px_rgba(15,23,42,0.10)] ${record.status === 'draft' ? 'min-h-[76px]' : 'min-h-[92px]'}`}
                >
                  <div className="line-clamp-2 text-pretty text-[16px] font-bold leading-[22px] text-slate-900">{record.title}</div>
                  {record.status !== 'draft' && (
                    <div className="mt-3.5 flex min-w-0 items-center justify-between gap-3 text-[12px]">
                      <div className={`flex min-w-0 items-center gap-1.5 font-medium ${overdue ? 'text-amber-600' : 'text-slate-400'}`}>
                        <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                        <span className="truncate">{record.suggestedDeadline ? formatSuggestedDeadline(record.suggestedDeadline) : '不限时间'}</span>
                      </div>
                      <div className="flex shrink-0 items-center gap-2.5">
                        <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                          <div className={`h-full rounded-full ${record.status === 'ended' ? 'bg-slate-400' : 'bg-[#58C3CF]'}`} style={{ width: `${completion}%` }} />
                        </div>
                        <span className="tabular-nums font-semibold text-slate-600">{record.submissions.length}/{reachable}</span>
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
            {filteredRecords.length === 0 && (
              <div className="py-16 text-center">
                <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-100 text-slate-400"><ClipboardList className="h-6 w-6" /></span>
                <div className="mt-4 text-[16px] font-bold text-slate-700">暂无{statusMeta[listFilter].label}问卷</div>
              </div>
            )}
          </section>
        </main>
      </div>
    );
  };

  const renderArchivedList = () => (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,#F4FBFF_0%,#FFFFFF_46%,#F6FAFD_100%)] pb-8">
      <PageHeader title="已归档" onBack={() => { setListFilter('ended'); setPageMode('list'); }} />
      <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 pt-4 no-scrollbar">
        <section className="space-y-2.5">
          {archivedRecords.map(record => {
            const reachable = getReachableTargetCount(record);
            const completion = getCompletionRate(record);
            return (
              <button
                key={record.id}
                type="button"
                onClick={() => openRecord(record)}
                className="min-h-[92px] w-full cursor-pointer rounded-[16px] bg-white px-4 py-4 text-left shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_2px_8px_-4px_rgba(15,23,42,0.12),0_12px_24px_-20px_rgba(35,96,145,0.32)] transition-[scale,background-color,box-shadow] duration-150 ease-out active:scale-[0.96] active:bg-slate-50"
              >
                <div className="line-clamp-2 text-pretty text-[16px] font-bold leading-[22px] text-slate-900">{record.title}</div>
                <div className="mt-3.5 flex min-w-0 items-center justify-between gap-3 text-[12px]">
                  <div className="flex min-w-0 items-center gap-1.5 font-medium text-slate-400">
                    <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                    <span className="truncate">{record.suggestedDeadline ? formatSuggestedDeadline(record.suggestedDeadline) : '不限时间'}</span>
                  </div>
                  <div className="flex shrink-0 items-center gap-2.5">
                    <div className="h-1.5 w-12 overflow-hidden rounded-full bg-slate-100" aria-hidden="true">
                      <div className="h-full rounded-full bg-slate-400" style={{ width: `${completion}%` }} />
                    </div>
                    <span className="tabular-nums font-semibold text-slate-600">{record.submissions.length}/{reachable}</span>
                  </div>
                </div>
              </button>
            );
          })}
          {archivedRecords.length === 0 && (
            <div className="py-16 text-center">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-[20px] bg-slate-100 text-slate-400"><Archive className="h-6 w-6" /></span>
              <div className="mt-4 text-[16px] font-bold text-slate-700">暂无已归档问卷</div>
            </div>
          )}
        </section>
      </main>
    </div>
  );

  const renderQuestionEditor = (question: QuestionnaireQuestion, index: number) => {
    const expanded = expandedQuestionId === question.id;
    const meta = questionTypeMeta[question.type];
    const TypeIcon = meta.icon;
    return (
      <article key={question.id} className="overflow-hidden rounded-[20px] border border-slate-100 bg-white shadow-[0_16px_36px_-32px_rgba(15,23,42,0.34)]">
        <button type="button" onClick={() => setExpandedQuestionId(expanded ? '' : question.id)} className="flex min-h-[64px] w-full items-center gap-3 px-4 text-left active:bg-slate-50">
          <GripVertical className="h-4 w-4 shrink-0 text-slate-300" />
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[11px] bg-slate-100 text-[13px] font-bold text-slate-600">{index + 1}</span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[14px] font-semibold text-slate-900">{question.title || '请输入题目'}</span>
            <span className="mt-0.5 flex items-center gap-1 text-[11px] font-medium text-slate-400"><TypeIcon className="h-3 w-3" />{meta.label}</span>
          </span>
          <ChevronRight className={`h-4 w-4 text-slate-300 transition-transform ${expanded ? 'rotate-90' : ''}`} />
        </button>
        {expanded && (
          <div className="border-t border-slate-100 px-4 pb-4 pt-3">
            <label className="text-[12px] font-semibold text-slate-500" htmlFor={`question-${question.id}`}>题目</label>
            <textarea
              id={`question-${question.id}`}
              value={question.title}
              onChange={event => updateQuestion(question.id, { title: event.target.value })}
              rows={2}
              placeholder="请输入问题"
              className="mt-2 min-h-[72px] w-full resize-none rounded-[14px] border border-slate-100 bg-slate-50 px-3.5 py-3 text-[14px] font-medium leading-5 text-slate-900 outline-none transition focus:border-[#58C3CF] focus:bg-white focus:ring-4 focus:ring-cyan-50"
            />
            {(question.type === 'single' || question.type === 'multiple') && (
              <div className="mt-3 space-y-2">
                {question.options.map((option, optionIndex) => {
                  const allowsCustomAnswer = question.customAnswerOptions?.includes(option) ?? false;
                  return (
                    <div key={`${question.id}-${optionIndex}`}>
                      <div className="flex items-center gap-2">
                        <span className={`h-4 w-4 shrink-0 border border-slate-300 ${question.type === 'single' ? 'rounded-full' : 'rounded-[4px]'}`} />
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
                          className="h-11 min-w-0 flex-1 rounded-[12px] border border-slate-100 bg-slate-50 px-3 text-[14px] font-medium text-slate-800 outline-none focus:border-[#58C3CF] focus:bg-white"
                        />
                        {question.options.length > 2 && (
                          <IconButton
                            label={`删除选项${optionIndex + 1}`}
                            onClick={() => updateQuestion(question.id, {
                              options: question.options.filter((_, itemIndex) => itemIndex !== optionIndex),
                              customAnswerOptions: (question.customAnswerOptions ?? []).filter(item => item !== option),
                            })}
                            className="h-10 w-10 text-slate-400"
                          >
                            <X className="h-4 w-4" />
                          </IconButton>
                        )}
                      </div>
                      {allowsCustomAnswer && (
                        <div className="ml-6 mt-1 flex min-h-7 items-center gap-1.5 px-1 text-[11px] font-semibold text-[#1E9AAA]">
                          <MessageSquareText className="h-3.5 w-3.5" />
                          选中后需填写
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="flex items-center justify-between gap-3">
                  <button type="button" onClick={() => updateQuestion(question.id, { options: [...question.options, `选项${question.options.length + 1}`] })} className="flex min-h-10 items-center gap-2 px-1 text-[13px] font-semibold text-[#1E9AAA]">
                    <Plus className="h-4 w-4" /> 添加选项
                  </button>
                  <button type="button" onClick={() => setCustomOptionQuestionId(question.id)} className="flex min-h-10 items-center gap-1.5 px-1 text-[12px] font-semibold text-slate-400">
                    <MoreHorizontal className="h-4 w-4" /> 更多
                  </button>
                </div>
              </div>
            )}
            {question.type === 'rating' && (
              <div className="mt-3 flex items-center justify-between rounded-[14px] bg-slate-50 px-3 py-3">
                {[1, 2, 3, 4, 5].map(value => <span key={value} className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-[13px] font-bold text-slate-600 shadow-sm">{value}</span>)}
              </div>
            )}
            {question.type === 'text' && <div className="mt-3 h-20 rounded-[14px] border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-[13px] text-slate-400">家长将在这里填写回答</div>}
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              <button type="button" onClick={() => updateQuestion(question.id, { required: !question.required })} className="flex min-h-10 items-center gap-2 text-[13px] font-semibold text-slate-600" aria-pressed={question.required}>
                <span className={`flex h-6 w-10 rounded-full p-0.5 transition ${question.required ? 'bg-[#58C3CF]' : 'bg-slate-200'}`}><span className={`h-5 w-5 rounded-full bg-white shadow-sm transition ${question.required ? 'translate-x-4' : ''}`} /></span>
                必答
              </button>
              <IconButton label="删除题目" onClick={() => setDraftQuestions(items => items.filter(item => item.id !== question.id))} className="h-10 w-10 text-rose-400"><Trash2 className="h-4 w-4" /></IconButton>
            </div>
          </div>
        )}
      </article>
    );
  };

  const renderCreate = () => {
    const targets = buildTargets();
    const reachableCount = targets.filter(target => target.reachable).length;
    const unreachableCount = targets.length - reachableCount;
    const activeClassNos = activeClassStudents.map(student => student.studentNo).filter(Boolean) as string[];
    const activeClassAllSelected = activeClassNos.length > 0 && activeClassNos.every(no => selectedStudentNos.has(no));
    const allClassesSelected = availableClasses.length > 0 && availableClasses.every(classInfo => selectedClassIds.has(classInfo.id));
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,#F5FBFF_0%,#FFFFFF_50%,#F6FAFD_100%)] pb-24">
        <PageHeader
          title={draftId ? '编辑问卷' : '新建问卷'}
          onBack={() => createStep > 1 ? setCreateStep(step => step - 1) : setPageMode('list')}
          action={draftId ? <IconButton label="草稿操作" onClick={() => setShowDraftMenu(true)}><MoreHorizontal className="h-5 w-5" /></IconButton> : undefined}
        />
        <StepIndicator current={createStep} />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-28 no-scrollbar">
          {createStep === 1 && (
            <div className="space-y-4">
              <section className="rounded-[22px] border border-white bg-white p-4 shadow-[0_18px_42px_-34px_rgba(35,96,145,0.34)] ring-1 ring-slate-100/70">
                <label htmlFor="survey-title" className="text-[12px] font-semibold text-slate-500">问卷标题</label>
                <input id="survey-title" value={draftTitle} maxLength={40} onChange={event => setDraftTitle(event.target.value)} placeholder="例如：暑期家庭阅读情况调查" className="mt-2 h-12 w-full rounded-[14px] border border-slate-100 bg-slate-50 px-3.5 text-[15px] font-semibold text-slate-900 outline-none focus:border-[#58C3CF] focus:bg-white focus:ring-4 focus:ring-cyan-50" />
                <label htmlFor="survey-description" className="mt-4 block text-[12px] font-semibold text-slate-500">问卷说明（选填）</label>
                <textarea id="survey-description" value={draftDescription} maxLength={120} onChange={event => setDraftDescription(event.target.value)} rows={3} placeholder="简要说明本次调查目的" className="mt-2 min-h-[88px] w-full resize-none rounded-[14px] border border-slate-100 bg-slate-50 px-3.5 py-3 text-[14px] font-medium leading-5 text-slate-900 outline-none focus:border-[#58C3CF] focus:bg-white focus:ring-4 focus:ring-cyan-50" />
              </section>
              <div className="flex items-center justify-between px-1">
                <h2 className="text-[15px] font-bold text-slate-950">题目 <span className="ml-1 text-[12px] font-medium text-slate-400">{draftQuestions.length}题</span></h2>
                <SecondaryButton onClick={() => setShowQuestionTypeSheet(true)} className="min-h-10 px-3 text-[#1E9AAA]"><Plus className="h-4 w-4" />添加题目</SecondaryButton>
              </div>
              <div className="space-y-3">
                {draftQuestions.map(renderQuestionEditor)}
                {draftQuestions.length === 0 && (
                  <button type="button" onClick={() => setShowQuestionTypeSheet(true)} className="flex min-h-[112px] w-full flex-col items-center justify-center gap-2 rounded-[20px] border border-dashed border-cyan-200 bg-cyan-50/45 text-[#1E9AAA] transition active:scale-[0.99] active:bg-cyan-50">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white shadow-sm"><Plus className="h-5 w-5" /></span>
                    <span className="text-[14px] font-semibold">添加第一题</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {createStep === 2 && (
            <div>
              <div className="grid grid-cols-3 rounded-[14px] bg-slate-100/80 p-1" role="tablist" aria-label="发送范围">
                {([['all', '全体学生'], ['classes', '按班级'], ['students', '指定学生']] as const).map(([mode, label]) => (
                  <button
                    key={mode}
                    type="button"
                    role="tab"
                    aria-selected={targetMode === mode}
                    onClick={() => setTargetMode(mode)}
                    className={`min-h-10 rounded-[11px] px-1 text-[13px] font-semibold ${targetMode === mode ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {targetMode === 'classes' && (
                <div className="mt-4">
                  <div className="flex min-h-11 items-center justify-between border-b border-slate-100 px-1">
                    <span className="text-[14px] font-bold text-slate-900">班级</span>
                    <button type="button" onClick={toggleAllClasses} className="min-h-10 px-2 text-[13px] font-semibold text-[#1E9AAA]">{allClassesSelected ? '取消全选' : '全选'}</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {availableClasses.map(classInfo => {
                      const selected = selectedClassIds.has(classInfo.id);
                      return (
                        <button key={classInfo.id} type="button" onClick={() => toggleClass(classInfo.id)} className="flex min-h-[56px] w-full items-center gap-3 text-left active:bg-slate-50" aria-pressed={selected}>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${selected ? 'border-[#58C3CF] bg-[#58C3CF] text-white' : 'border-slate-300 bg-white'}`}>{selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span>
                          <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-slate-800">{classInfo.name}</span>
                          <span className="text-[12px] font-medium tabular-nums text-slate-400">{classInfo.studentCount}人</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {targetMode === 'students' && (
                <div className="mt-4">
                  <select id="survey-class" aria-label="筛选班级" value={activeClassId} onChange={event => setActiveClassId(event.target.value)} className="h-12 w-full rounded-[14px] border border-slate-100 bg-white px-3.5 text-[14px] font-semibold text-slate-800 outline-none focus:border-[#58C3CF]">
                    {availableClasses.map(classInfo => <option key={classInfo.id} value={classInfo.id}>{classInfo.name}</option>)}
                  </select>
                  <div className="mt-2 flex min-h-11 items-center justify-between border-b border-slate-100 px-1">
                    <span className="text-[13px] font-medium text-slate-400">{activeClassStudents.length}名学生</span>
                    <button type="button" onClick={toggleActiveClass} className="min-h-10 px-2 text-[13px] font-semibold text-[#1E9AAA]">{activeClassAllSelected ? '取消全选' : '全选本班'}</button>
                  </div>
                  <div className="divide-y divide-slate-100">
                    {activeClassStudents.map(student => {
                      const studentNo = student.studentNo ?? student.id;
                      const selected = selectedStudentNos.has(studentNo);
                      const reachable = Boolean(student.guardianContacts?.length) && !studentNo.endsWith('07');
                      return (
                        <button key={student.id} type="button" onClick={() => toggleStudent(studentNo)} className="flex min-h-[56px] w-full items-center gap-3 text-left active:bg-slate-50" aria-pressed={selected}>
                          <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${selected ? 'border-[#58C3CF] bg-[#58C3CF] text-white' : 'border-slate-300 bg-white'}`}>{selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span>
                          <span className="min-w-0 flex-1 truncate text-[14px] font-semibold text-slate-800">{demoLinkedStudentName(student)}</span>
                          {!reachable && <span className="text-[11px] font-medium text-amber-600">未绑定家长</span>}
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
              <section className="rounded-[22px] border border-white bg-white p-4 shadow-[0_18px_42px_-34px_rgba(35,96,145,0.34)] ring-1 ring-slate-100/70">
                <h2 className="text-[16px] font-bold leading-6 text-slate-950">{draftTitle}</h2>
                {draftDescription && <p className="mt-2 text-[13px] font-medium leading-5 text-slate-500">{draftDescription}</p>}
                <div className="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4 text-center">
                  {[['题目', draftQuestions.length], ['目标学生', targets.length], ['可送达', reachableCount]].map(([label, value]) => (
                    <div key={String(label)}><div className="text-[19px] font-bold tabular-nums text-slate-950">{value}</div><div className="mt-1 text-[11px] font-medium text-slate-400">{label}</div></div>
                  ))}
                </div>
              </section>
              <section className="rounded-[22px] border border-white bg-white p-4 shadow-[0_18px_42px_-34px_rgba(35,96,145,0.34)] ring-1 ring-slate-100/70">
                <div className="flex min-h-10 items-center justify-between gap-4">
                  <div><div className="text-[13px] font-bold text-slate-800">建议完成时间</div><div className="mt-0.5 text-[11px] font-medium text-slate-400">选填</div></div>
                  <button
                    type="button"
                    aria-label="设置建议完成时间"
                    aria-pressed={hasSuggestedDeadline}
                    onClick={() => {
                      const next = !hasSuggestedDeadline;
                      setHasSuggestedDeadline(next);
                      if (next && !suggestedDeadline) setSuggestedDeadline(getDefaultSuggestedDeadline());
                    }}
                    className={`flex h-7 w-12 shrink-0 rounded-full p-0.5 transition-colors ${hasSuggestedDeadline ? 'bg-[#58C3CF]' : 'bg-slate-200'}`}
                  >
                    <span className={`h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${hasSuggestedDeadline ? 'translate-x-5' : ''}`} />
                  </button>
                </div>
                {hasSuggestedDeadline && (
                  <input aria-label="建议完成时间" type="datetime-local" value={suggestedDeadline} onChange={event => setSuggestedDeadline(event.target.value)} className="mt-3 h-12 w-full rounded-[14px] border border-slate-100 bg-slate-50 px-3.5 text-[14px] font-semibold text-slate-800 outline-none focus:border-[#58C3CF] focus:bg-white" />
                )}
              </section>
              {unreachableCount > 0 && (
                <section className="flex gap-3 rounded-[18px] border border-amber-100 bg-amber-50/80 p-4">
                  <UsersRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
                  <div><div className="text-[13px] font-bold text-amber-800">{unreachableCount}名学生未绑定家长</div><div className="mt-1 text-[12px] font-medium leading-5 text-amber-700/80">发布后不会生成家长待办，也不计入完成率。</div></div>
                </section>
              )}
            </div>
          )}
        </main>

        <BottomAction>
          <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
            <SecondaryButton onClick={createStep === 1 ? saveDraft : () => setCreateStep(step => step - 1)}>
              {createStep === 1 ? <><Save className="h-4 w-4" />保存草稿</> : '上一步'}
            </SecondaryButton>
            <PrimaryButton
              disabled={createStep === 1 ? !validStepOne : createStep === 2 && targets.length === 0}
              onClick={createStep === 3 ? publishQuestionnaire : () => setCreateStep(step => Math.min(3, step + 1))}
            >
              {createStep === 3 ? <><Send className="h-4 w-4" />确认发布</> : '下一步'}
            </PrimaryButton>
          </div>
        </BottomAction>

        <BottomSheet open={showQuestionTypeSheet} label="选择题型" onDismiss={() => setShowQuestionTypeSheet(false)}>
          <h2 className="text-[17px] font-bold text-slate-950">选择题型</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {(Object.entries(questionTypeMeta) as Array<[QuestionnaireQuestionType, typeof questionTypeMeta[QuestionnaireQuestionType]]>).map(([type, meta]) => {
              const TypeIcon = meta.icon;
              return <button key={type} type="button" onClick={() => addQuestion(type)} className="flex min-h-[76px] items-center gap-3 rounded-[18px] border border-slate-100 bg-slate-50 px-4 text-left active:scale-[0.98] active:bg-cyan-50"><span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-white text-[#1E9AAA] shadow-sm"><TypeIcon className="h-5 w-5" /></span><span className="text-[14px] font-bold text-slate-800">{meta.label}</span></button>;
            })}
          </div>
        </BottomSheet>
        <BottomSheet open={Boolean(customOptionQuestionId)} label="更多选项" onDismiss={() => setCustomOptionQuestionId('')}>
          <div className="flex min-h-11 items-center justify-between gap-3">
            <h2 className="text-[17px] font-bold text-slate-950">更多选项</h2>
            <IconButton label="关闭" onClick={() => setCustomOptionQuestionId('')} className="h-10 w-10 bg-slate-100 text-slate-500"><X className="h-4 w-4" /></IconButton>
          </div>
          <button type="button" onClick={addCustomAnswerOption} className="mt-3 flex min-h-[58px] w-full items-center gap-3 border-t border-slate-100 text-left text-[14px] font-semibold text-slate-800">
            <span className="flex h-10 w-10 items-center justify-center rounded-[13px] bg-cyan-50 text-[#1E9AAA]"><MessageSquareText className="h-5 w-5" /></span>
            添加“其他（请填写）”
          </button>
        </BottomSheet>
        <BottomSheet open={showDraftMenu} label="草稿操作" onDismiss={() => setShowDraftMenu(false)}>
          <button type="button" onClick={() => { setShowDraftMenu(false); setShowDeleteDraftConfirm(true); }} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[14px] font-semibold text-rose-600">
            <Trash2 className="h-5 w-5" />删除草稿
          </button>
          <SecondaryButton className="mt-3 w-full" onClick={() => setShowDraftMenu(false)}>取消</SecondaryButton>
        </BottomSheet>
        <BottomSheet open={showDeleteDraftConfirm} label="删除草稿" onDismiss={() => setShowDeleteDraftConfirm(false)}>
          <h2 className="text-center text-[17px] font-bold text-slate-950">删除草稿？</h2>
          <p className="mt-2 text-center text-[13px] font-medium text-slate-500">删除后无法恢复</p>
          <div className="mt-5 grid grid-cols-2 gap-3">
            <SecondaryButton onClick={() => setShowDeleteDraftConfirm(false)}>取消</SecondaryButton>
            <button type="button" onClick={deleteCurrentDraft} className="min-h-11 rounded-[15px] bg-rose-500 px-4 text-[14px] font-bold text-white transition active:scale-[0.98] active:bg-rose-600">删除</button>
          </div>
        </BottomSheet>
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
        <section className="rounded-[20px] bg-white p-4 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_2px_8px_-4px_rgba(15,23,42,0.12),0_12px_24px_-20px_rgba(35,96,145,0.28)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[13px] font-semibold text-slate-600">完成情况</div>
              <div className="mt-1 text-[30px] font-bold tabular-nums text-slate-950">{record.submissions.length}<span className="ml-1 text-[16px] font-semibold text-slate-400">/{reachable}</span></div>
            </div>
            <div className="space-y-1 text-right text-[12px] font-medium text-slate-400">
              <div>待提交 <span className="ml-1 font-semibold tabular-nums text-amber-600">{pending}</span></div>
              <div>未送达 <span className="ml-1 font-semibold tabular-nums text-slate-500">{unreachable}</span></div>
            </div>
          </div>
          <div className="mt-3"><ProgressBar value={completion} tone={record.status === 'ended' ? 'slate' : 'aqua'} /></div>
        </section>
        {record.status === 'active' && isQuestionnaireOverdue(record) && (
          <button type="button" onClick={closeActiveRecord} className="flex min-h-12 w-full items-center gap-3 rounded-[16px] bg-amber-50 px-4 text-left active:bg-amber-100">
            <CalendarDays className="h-4 w-4 shrink-0 text-amber-600" />
            <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-amber-800">已到建议完成时间</span>
            <span className="shrink-0 text-[13px] font-bold text-amber-700">结束收集</span>
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
        <div className="grid grid-cols-3 rounded-[14px] bg-slate-100/80 p-1">
          {([['completed', '已完成'], ['pending', '未完成'], ['unreachable', '未送达']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setResponseFilter(value)} className={`min-h-10 rounded-[11px] px-1 text-[12px] font-semibold ${responseFilter === value ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>{label}</button>)}
        </div>
        <section className="mt-4 overflow-hidden rounded-[20px] bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_2px_8px_-4px_rgba(15,23,42,0.10),0_12px_24px_-20px_rgba(35,96,145,0.18)]">
          {rows.map(row => {
            const isSubmission = 'answers' in row;
            return (
              <button key={isSubmission ? row.id : row.studentNo} type="button" disabled={!isSubmission} onClick={() => { if (isSubmission) { setActiveSubmission(row); setPageMode('response'); } }} className="flex min-h-[62px] w-full items-center gap-3 border-b border-slate-100 px-4 text-left last:border-b-0 active:bg-slate-50 disabled:cursor-default">
                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[12px] ${isSubmission ? 'bg-emerald-50 text-emerald-600' : responseFilter === 'unreachable' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'}`}>{isSubmission ? <CheckCircle2 className="h-4.5 w-4.5" /> : <UserRoundCheck className="h-4.5 w-4.5" />}</span>
                <span className="min-w-0 flex-1"><span className="block truncate text-[14px] font-semibold text-slate-900">{row.studentName}</span><span className="mt-0.5 block truncate text-[11px] font-medium text-slate-400">{isSubmission ? `${row.guardianRelation} · ${row.submittedAt}` : row.className}</span></span>
                {isSubmission && <ChevronRight className="h-4 w-4 text-slate-300" />}
              </button>
            );
          })}
          {rows.length === 0 && <div className="px-4 py-12 text-center text-[13px] font-medium text-slate-400">暂无数据</div>}
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
            <section key={question.id} className="rounded-[20px] bg-white p-4 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_2px_8px_-4px_rgba(15,23,42,0.12),0_12px_24px_-20px_rgba(35,96,145,0.22)]">
              <div className="flex items-center justify-between gap-3">
                <div className="text-[12px] font-semibold text-[#1E9AAA]">{questionIndex + 1} · {questionTypeMeta[question.type].label}</div>
                {showEffectiveCount && <div className="shrink-0 text-[11px] font-medium tabular-nums text-slate-400">有效回答 {textAnswers.length}</div>}
              </div>
              <h3 className="mt-2 text-balance text-[14px] font-bold leading-5 text-slate-900">{question.title}</h3>
              {keywords.length > 0 && (
                <div className="mt-3">
                  <div className="text-[11px] font-medium text-slate-400">高频词</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {keywords.map(([word, count]) => <span key={word} className="inline-flex h-7 items-center gap-1 rounded-full bg-cyan-50 px-2.5 text-[12px] font-semibold text-[#147F8D]">{word}<span className="tabular-nums text-[#1E9AAA]">{count}</span></span>)}
                  </div>
                </div>
              )}
              {visibleAnswers.length > 0
                ? <div className="mt-3"><div className="mb-2 text-[11px] font-medium text-slate-400">{showAllInline ? '回答' : '最近回答'}</div><div className="space-y-2">{visibleAnswers.map((answer, index) => <div key={`${question.id}-${index}`} className={`rounded-[12px] bg-slate-50 px-3 py-2.5 text-pretty text-[12px] font-medium leading-5 text-slate-600 ${showAllInline ? '' : 'line-clamp-3'}`}>{answer}</div>)}</div></div>
                : <div className="mt-3 py-3 text-[12px] font-medium text-slate-400">暂无回答</div>}
              {!showAllInline && (
                <button type="button" onClick={() => openQuestionResponses(question.id)} className="mt-3 flex min-h-11 w-full items-center justify-between rounded-[13px] px-1 text-[13px] font-semibold text-[#147F8D] transition-[transform,background-color] active:scale-[0.96] active:bg-cyan-50">
                  查看全部回答<ChevronRight className="h-4 w-4" />
                </button>
              )}
            </section>
          );
        }
        const options = question.type === 'rating' ? ['1', '2', '3', '4', '5'] : question.options;
        const counts = options.map(option => answers.filter(answer => (
          question.type === 'rating'
            ? String(answer) === option
            : getQuestionnaireSelectedOptions(answer).includes(option)
        )).length);
        const ratingAverage = question.type === 'rating' && answers.length > 0 ? (answers.reduce<number>((sum, answer) => sum + Number(answer), 0) / answers.length).toFixed(1) : null;
        return (
          <section key={question.id} className="rounded-[20px] bg-white p-4 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_2px_8px_-4px_rgba(15,23,42,0.12),0_12px_24px_-20px_rgba(35,96,145,0.22)]">
            <div className="text-[12px] font-semibold text-[#1E9AAA]">{questionIndex + 1} · {questionTypeMeta[question.type].label}</div>
            <h3 className="mt-2 text-balance text-[14px] font-bold leading-5 text-slate-900">{question.title}</h3>
            {ratingAverage && <div className="mt-3 flex items-baseline gap-2"><span className="text-[26px] font-bold tabular-nums text-slate-950">{ratingAverage}</span><span className="text-[12px] font-medium text-slate-400">平均分 / 5</span></div>}
            <div className="mt-4 space-y-3">
              {options.map((option, index) => {
                const percent = answers.length === 0 ? 0 : Math.round((counts[index] / answers.length) * 100);
                return <div key={option}><div className="mb-1.5 flex items-center justify-between gap-3 text-[12px]"><span className="truncate font-medium text-slate-600">{option}</span><span className="shrink-0 tabular-nums font-semibold text-slate-500">{counts[index]}人&nbsp;&nbsp;{percent}%</span></div><div className="h-1.5 rounded-full bg-slate-100"><div className="h-1.5 rounded-full bg-gradient-to-r from-[#58C3CF] to-[#7F9EED] transition-[width] duration-300" style={{ width: `${percent}%` }} /></div></div>;
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
          <h3 className="mb-3 text-[15px] font-bold text-slate-900">题目数据</h3>
          {renderAnalysis(record)}
        </section>
      </div>
    );
  };

  const renderDetail = () => {
    if (!activeRecord) return renderList();
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,#F5FBFF_0%,#FFFFFF_48%,#F6FAFD_100%)] pb-8">
        <PageHeader title="问卷详情" onBack={() => setPageMode(activeRecord.status === 'archived' ? 'archived-list' : 'list')} action={<IconButton label="更多操作" onClick={() => setShowRecordMenu(true)}><MoreHorizontal className="h-5 w-5" /></IconButton>} />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 no-scrollbar">
          <section className="teacher-mobile-token-card mt-4 rounded-[20px] p-4">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-balance text-[18px] font-bold leading-6 text-slate-950">{activeRecord.title}</h2>
                {activeRecord.description && <p className="mt-1 line-clamp-2 text-pretty text-[13px] font-medium leading-5 text-slate-500">{activeRecord.description}</p>}
              </div>
              <button
                type="button"
                aria-label="预览问卷"
                title="预览问卷"
                onClick={() => setPageMode('preview')}
                className="-mr-2 -mt-2 inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-[13px] px-2.5 text-[13px] font-semibold text-[#147F8D] transition-[transform,background-color] active:scale-[0.96] active:bg-cyan-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#58C3CF] focus-visible:ring-offset-2"
              >
                <Eye className="h-4 w-4" />预览
              </button>
            </div>
            {activeRecord.suggestedDeadline && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[12px] font-medium text-slate-500">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                {formatSuggestedDeadline(activeRecord.suggestedDeadline)}
              </div>
            )}
          </section>
          <div className="sticky top-0 z-20 -mx-1 mt-4 grid grid-cols-2 rounded-[14px] bg-slate-100/90 p-1 backdrop-blur" role="tablist">
            {([['data', '数据'], ['responses', '答卷']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={detailTab === value} onClick={() => setDetailTab(value)} className={`min-h-10 rounded-[11px] px-2 text-[13px] font-semibold transition-[color,background-color,box-shadow] duration-150 active:scale-[0.96] ${detailTab === value ? 'bg-white text-slate-950 shadow-sm' : 'text-slate-500'}`}>{label}</button>)}
          </div>
          <div className="mt-4">{detailTab === 'data' ? renderData(activeRecord) : renderResponses(activeRecord)}</div>
        </main>
        <BottomSheet open={showRecordMenu} label="问卷操作" onDismiss={() => setShowRecordMenu(false)}>
          {activeRecord.status === 'archived' && <button type="button" onClick={restoreActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 border-b border-slate-100 text-left text-[14px] font-semibold text-[#1E9AAA]"><ArchiveRestore className="h-5 w-5" />恢复到已结束</button>}
          <button type="button" onClick={duplicateActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 border-b border-slate-100 text-left text-[14px] font-semibold text-slate-800"><Copy className="h-5 w-5 text-slate-400" />复制为新问卷</button>
          {activeRecord.status === 'active' && <button type="button" onClick={closeActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[14px] font-semibold text-rose-600"><ClipboardCheck className="h-5 w-5" />结束收集</button>}
          {activeRecord.status === 'ended' && (
            <>
              <button type="button" onClick={reopenActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 border-b border-slate-100 text-left text-[14px] font-semibold text-[#1E9AAA]"><RotateCcw className="h-5 w-5" />重新开放</button>
              <button type="button" onClick={archiveActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 text-left text-[14px] font-semibold text-slate-600"><Archive className="h-5 w-5 text-slate-400" />归档</button>
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
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,#F5FBFF_0%,#FFFFFF_48%,#F6FAFD_100%)]">
        <PageHeader title="答卷详情" onBack={() => setPageMode('detail')} />
        <main className="min-h-0 flex-1 touch-pan-y space-y-3 overflow-y-auto overscroll-contain px-5 py-4 no-scrollbar">
          <div className="flex items-center gap-3 rounded-[15px] bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[13px] font-bold text-slate-800">{activeSubmission.studentName}<span className="ml-2 text-[12px] font-medium text-slate-500">{activeSubmission.guardianRelation}</span></div>
              <div className="mt-0.5 truncate text-[11px] font-semibold text-emerald-700">提交于 {activeSubmission.submittedAt}</div>
            </div>
          </div>
          {activeRecord.questions.map((question, index) => {
            const answer = activeSubmission.answers[question.id];
            return <section key={question.id} className="rounded-[20px] bg-white p-4 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_2px_8px_-4px_rgba(15,23,42,0.10),0_12px_24px_-20px_rgba(35,96,145,0.18)]"><div className="text-[12px] font-semibold text-[#1E9AAA]">第{index + 1}题 · {questionTypeMeta[question.type].label}</div><h3 className="mt-2 text-balance text-[14px] font-bold leading-5 text-slate-900">{question.title}</h3><div className="mt-3 rounded-[13px] bg-slate-50 px-3 py-2.5 text-pretty text-[13px] font-semibold leading-5 text-slate-700">{formatQuestionnaireAnswer(answer)}</div></section>;
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
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-[linear-gradient(180deg,#F5FBFF_0%,#FFFFFF_48%,#F6FAFD_100%)]">
        <PageHeader title="全部回答" onBack={() => setPageMode('detail')} />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 no-scrollbar">
          <section className="pt-4">
            <div className="text-[12px] font-semibold text-[#1E9AAA]">第{questionIndex + 1}题 · 简答题</div>
            <h2 className="mt-2 text-balance text-[17px] font-bold leading-6 text-slate-950">{question.title}</h2>
          </section>
          <div className="sticky top-0 z-20 -mx-1 mt-4 bg-[#F7FBFE]/95 px-1 py-3 backdrop-blur-md">
            <div className={`grid gap-2 ${classOptions.length > 1 ? 'grid-cols-[minmax(0,1fr)_120px]' : 'grid-cols-1'}`}>
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input value={questionResponseSearch} onChange={event => { setQuestionResponseSearch(event.target.value); setVisibleQuestionResponseCount(20); }} placeholder="搜索回答或学生" aria-label="搜索回答或学生" className="h-11 w-full rounded-[14px] border border-slate-100 bg-white pl-10 pr-3 text-[13px] font-medium text-slate-800 outline-none focus:border-[#58C3CF] focus:ring-2 focus:ring-cyan-100" />
              </label>
              {classOptions.length > 1 && (
                <label className="relative block">
                  <select value={questionResponseClass} onChange={event => { setQuestionResponseClass(event.target.value); setVisibleQuestionResponseCount(20); }} aria-label="按班级筛选回答" className="h-11 w-full appearance-none rounded-[14px] border border-slate-100 bg-white pl-3 pr-8 text-[13px] font-semibold text-slate-700 outline-none focus:border-[#58C3CF] focus:ring-2 focus:ring-cyan-100">
                    <option value="all">全部班级</option>
                    {classOptions.map(className => <option key={className} value={className}>{className}</option>)}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                </label>
              )}
            </div>
          </div>
          <div className="space-y-3">
            {visibleRows.map(row => (
              <article key={row.id} className="rounded-[18px] bg-white p-4 shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_2px_8px_-4px_rgba(15,23,42,0.10),0_12px_24px_-20px_rgba(35,96,145,0.18)]">
                <p className="text-pretty text-[14px] font-medium leading-6 text-slate-700">{row.answer}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] font-medium text-slate-400">
                  <span>{row.studentName}</span><span aria-hidden="true">·</span><span>{row.className}</span><span aria-hidden="true">·</span><span>{row.submittedAt}</span>
                </div>
              </article>
            ))}
            {visibleRows.length === 0 && <div className="py-14 text-center text-[13px] font-medium text-slate-400">暂无匹配回答</div>}
          </div>
          {filteredRows.length > visibleRows.length && (
            <button type="button" onClick={() => setVisibleQuestionResponseCount(count => count + 20)} className="mt-4 min-h-11 w-full rounded-[14px] bg-white text-[13px] font-semibold text-[#147F8D] shadow-[0_0_0_1px_rgba(15,23,42,0.04),0_2px_8px_-4px_rgba(15,23,42,0.10)] active:scale-[0.96]">加载更多</button>
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
    if (pageMode === 'archived-list') return renderArchivedList();
    if (pageMode === 'create') return renderCreate();
    if (pageMode === 'detail') return renderDetail();
    if (pageMode === 'preview') return renderPreview();
    if (pageMode === 'question-responses') return renderQuestionResponses();
    return renderResponseDetail();
  };

  return (
    <div className="relative h-full min-h-0 overflow-hidden font-sans text-slate-900">
      {renderPage()}
      {toast && <div className="pointer-events-none absolute left-1/2 top-16 z-[70] -translate-x-1/2 whitespace-nowrap rounded-full bg-slate-900/88 px-4 py-2 text-[13px] font-semibold text-white shadow-lg backdrop-blur">{toast}</div>}
    </div>
  );
};

export default QuestionnaireManagementView;
