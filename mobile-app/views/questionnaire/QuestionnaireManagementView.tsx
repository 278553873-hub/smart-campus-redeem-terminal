import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity,
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
  FileText,
  Hash,
  ListChecks,
  ListPlus,
  MessageSquareText,
  Minus,
  MoreHorizontal,
  RotateCcw,
  Ruler,
  Save,
  Search,
  Send,
  Star,
  Target,
  TextCursorInput,
  Trash2,
  UserRoundCheck,
  UsersRound,
} from 'lucide-react';
import type { ClassInfo, Student } from '../../types';
import FormBuilder, { type FormFieldTypeOption } from '../../components/form-builder/FormBuilder';
import AutoResizeTextarea from '../../components/ui/AutoResizeTextarea';
import MobileClassCascadePicker from '../../components/ui/MobileClassCascadePicker';
import MobileFloatingCreateButton from '../../components/ui/MobileFloatingCreateButton';
import MobileBottomSheet from '../../components/ui/MobileBottomSheet';
import AssignedQuestionnaireView from '../../../components/parent-app/AssignedQuestionnaireView';
import {
  normalizeFormFieldSettings,
  createFormSubFieldId,
  type ConfigurableFormField,
  type FormLayoutMode,
  type FormSection,
} from '../../../shared/formDefinition';
import { questionnaireThemeCssVariables } from '../../../shared/questionnaireThemeTokens';
import {
  QUESTIONNAIRE_STORE_EVENT,
  createQuestionId,
  createQuestionnaireId,
  deleteDraftQuestionnaire,
  formatQuestionnaireAnswer,
  getActiveQuestionnaireTargets,
  getQuestionnaireAnswerValidationError,
  getQuestionnaireMultiFillValues,
  getCompletionRate,
  getQuestionnaireCompletedCount,
  getQuestionnaireContentType,
  getQuestionnaireCollectionMode,
  getQuestionnaireRespondentRole,
  hasGrowthCollectionFields,
  inferQuestionnaireContentType,
  isQuestionnaireChoiceAnswer,
  isBodyGrowthQuestion,
  getPendingAssignedStudentCollections,
  getQuestionnaireSelectedOptions,
  getReachableTargetCount,
  getStudentCollectionCompletedCount,
  getStudentCollectionRecordsForTeacher,
  isQuestionnaireCreatedByTeacher,
  isQuestionnaireOverdue,
  isQuestionnaireFullyCollected,
  reconcileQuestionnaireTargets,
  readQuestionnaires,
  saveStudentCollectionRecord,
  updateQuestionnaireStatus,
  upsertQuestionnaire,
  writeQuestionnaires,
  type QuestionnaireQuestion,
  type QuestionnaireQuestionType,
  type QuestionnaireCollectionMode,
  type GrowthRecordDateMode,
  type QuestionnaireRespondentRole,
  type QuestionnaireAnswer,
  type QuestionnaireRecord,
  type QuestionnaireSubmission,
  type QuestionnaireTarget,
  type QuestionnaireStatus,
  type StudentCollectionRecord,
  type StudentCollectionRecordStatus,
  type StudentAssignmentMode,
} from '../../../shared/questionnaireStore';
import { persistGrowthCollectionAnswers } from '../../../shared/growthCollectionPersistence';
import { persistArchiveCollectionAnswers } from '../../../shared/archiveCollectionPersistence';
import {
  createBodyGrowthQuestions,
  getBodyGrowthFieldKeys,
  type BodyGrowthFieldKey,
} from '../../../shared/growthCollectionDefinition';
import {
  GROWTH_FIELD_CONFIG_EVENT,
  getEnabledGrowthFields,
  getGrowthFieldDefinition,
  type GrowthFieldDefinition,
} from '../../../shared/studentGrowthFieldCatalog';
import {
  ARCHIVE_GROWTH_FIELD_GROUPS,
  ARCHIVE_STORE_EVENT,
  createArchiveTemplateSnapshot,
  getArchiveSystemFieldLabel,
  persistArchiveWorkspace,
  readArchiveWorkspace,
  type ArchiveField,
  type ArchiveTemplate,
  type ArchiveTemplateSnapshot,
} from '../../../shared/studentArchiveStore';

interface QuestionnaireManagementViewProps {
  onBack: () => void;
  teacherId: string;
  teacherName: string;
  spaceId: string;
  homeroomClassIds: string[];
  classes: ClassInfo[];
  allScopeLabel?: string;
  getStudentsForClass: (classId: string) => Student[];
  initialMode?: 'owned' | 'assigned';
  initialArchiveTemplateId?: string;
}

type ListFilter = 'active' | 'ended' | 'draft';
type DetailTab = 'data' | 'responses';
type PageMode = 'list' | 'assigned-list' | 'archived-list' | 'create' | 'detail' | 'response' | 'preview' | 'question-responses' | 'student-record';
type StudentRecordFilter = 'all' | 'incomplete' | 'completed';
type PreviewReturnMode = 'create' | 'detail';

const statusMeta: Record<QuestionnaireStatus, { label: string }> = {
  active: { label: '收集中' },
  ended: { label: '已结束' },
  draft: { label: '草稿' },
  archived: { label: '已归档' },
};

const questionTypeMeta: Record<QuestionnaireQuestionType, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
  single: { label: '单选题', icon: CircleDot },
  multiple: { label: '多选题', icon: ListChecks },
  rating: { label: '评分题', icon: Star },
  text: { label: '问答题', icon: MessageSquareText },
  multi_fill: { label: '多项填空题', icon: ListPlus },
  short_text: { label: '单行文本', icon: TextCursorInput },
  number: { label: '数字', icon: Hash },
  date: { label: '日期', icon: CalendarDays },
};

const questionnaireFieldTypes: Array<FormFieldTypeOption<QuestionnaireQuestionType>> = [
  { value: 'single', label: '单选题', icon: CircleDot, choice: true },
  { value: 'multiple', label: '多选题', icon: ListChecks, choice: true },
  { value: 'rating', label: '评分题', icon: Star, rating: true },
  { value: 'multi_fill', label: '多项填空题', icon: ListPlus, subFields: true },
  { value: 'text', label: '问答题', icon: MessageSquareText },
  { value: 'date', label: '日期', icon: CalendarDays },
  { value: 'number', label: '数字', icon: Hash },
];

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

const growthCollectionMeta = {
  label: '成长信息',
  shortLabel: '成长采集',
  icon: Activity,
  accentClass: 'bg-[var(--tm-status-positive)]',
  badgeClass: 'border border-[var(--tm-status-positive-border)] bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]',
  progressClass: 'bg-[var(--tm-status-positive)]',
};

const getCollectionBadgeLabel = (record: QuestionnaireRecord) => {
  const role = getQuestionnaireRespondentRole(record);
  const typeLabel = record.archiveTemplateId
    ? '档案采集'
    : getQuestionnaireContentType(record) === 'mixed'
    ? '混合采集'
    : getQuestionnaireContentType(record) === 'growth'
      ? '成长采集'
      : '普通采集';
  return `${typeLabel} · ${role === 'teacher' ? '老师填写' : '家长填写'}`;
};

const getSubmissionDetailTitle = (record: QuestionnaireRecord) => {
  return getQuestionnaireContentType(record) === 'ordinary' && !record.archiveTemplateId ? '答卷详情' : '采集内容详情';
};

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
}> = ({ title, onBack }) => {
  return (
  <header className="sticky top-0 z-[45] flex h-11 shrink-0 items-center justify-between bg-white/38 pl-4 [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))] backdrop-blur-md">
    <button
      type="button"
      aria-label="返回"
      onClick={onBack}
      className="-ml-2 flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-colors active:bg-[var(--tm-bg-surface-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)]"
    >
      <ChevronLeft className="h-5 w-5" />
    </button>
    <h1 className="pointer-events-none absolute inset-x-16 truncate text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">{title}</h1>
    <div className="h-11 w-11 shrink-0" aria-hidden="true" />
  </header>
  );
};

const BottomAction: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="absolute inset-x-0 bottom-0 z-30 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-3 [box-shadow:var(--tm-shadow-navigation)] backdrop-blur-xl">
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
        className="w-full rounded-t-[var(--tm-radius-sheet)] bg-[var(--tm-bg-surface)] px-5 pb-[calc(20px+env(safe-area-inset-bottom))] pt-3 [box-shadow:var(--tm-shadow-sheet)]"
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
    className={`inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary)] px-5 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-control)] transition active:scale-[0.98] active:bg-[var(--tm-brand-primary-pressed)] disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const SecondaryButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement>> = ({ className = '', children, ...props }) => (
  <button
    type="button"
    className={`inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-4 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-secondary)] [box-shadow:var(--tm-shadow-control)] transition active:scale-[0.98] active:bg-[var(--tm-bg-surface-soft)] disabled:opacity-45 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2 ${className}`}
    {...props}
  >
    {children}
  </button>
);

const StepIndicator: React.FC<{ current: number }> = ({ current }) => (
  <div className="grid grid-cols-3 gap-2 px-5 py-4" aria-label={`创建进度，第${current}步，共3步`}>
    {['填写人和内容', '学生范围', '确认发布'].map((label, index) => {
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

interface StudentCollectionFormProps {
  record: QuestionnaireRecord;
  answers: Record<string, QuestionnaireAnswer>;
  editable: boolean;
  onAnswerChange: (questionId: string, answer: QuestionnaireAnswer) => void;
}

interface StudentCollectionQuestionGroup {
  id: string;
  label?: string;
  sectionId?: string;
  questions: Array<{ question: QuestionnaireQuestion; index: number }>;
}

const getStudentCollectionQuestionGroups = (record: QuestionnaireRecord): StudentCollectionQuestionGroup[] => {
  if (record.layoutMode !== 'grouped') {
    return [{ id: 'flat', questions: record.questions.map((question, index) => ({ question, index })) }];
  }

  return record.questions.reduce<StudentCollectionQuestionGroup[]>((groups, question, index) => {
    const section = record.sections?.find(item => item.id === question.sectionId);
    const previousGroup = groups[groups.length - 1];
    if (!previousGroup || previousGroup.sectionId !== question.sectionId) {
      groups.push({
        id: `${question.sectionId ?? 'ungrouped'}-${groups.length}`,
        label: section?.label,
        sectionId: question.sectionId,
        questions: [{ question, index }],
      });
      return groups;
    }

    previousGroup.questions.push({ question, index });
    return groups;
  }, []);
};

const StudentCollectionForm: React.FC<StudentCollectionFormProps> = ({
  record,
  answers,
  editable,
  onAnswerChange,
}) => {
  const renderQuestion = (question: QuestionnaireQuestion, index: number) => {
    const answer = answers[question.id];
    const selectedOptions = getQuestionnaireSelectedOptions(answer);
    const customText = isQuestionnaireChoiceAnswer(answer) ? answer.customText : {};
    const settings = normalizeFormFieldSettings(question.type, question.settings, question.options);
    const inputId = `student-collection-${question.id}`;
    return (
      <div key={question.id} className="px-4 py-4">
        <label htmlFor={['short_text', 'text', 'number', 'date'].includes(question.type) ? inputId : undefined} className="block text-[length:var(--tm-font-size-question-title)] font-bold leading-[1.45] text-[var(--tm-text-primary)]">
          {index + 1}. {question.title}{question.required && <span className="ml-1 text-[var(--tm-status-negative-strong)]" aria-label="必填">*</span>}
        </label>
        {question.type === 'short_text' && <input id={inputId} disabled={!editable} value={typeof answer === 'string' ? answer : ''} onChange={event => onAnswerChange(question.id, event.target.value)} className="mt-3 h-[52px] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 text-[length:var(--tm-font-size-control)] font-medium text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:opacity-100" />}
        {question.type === 'text' && <textarea id={inputId} disabled={!editable} value={typeof answer === 'string' ? answer : ''} onChange={event => onAnswerChange(question.id, event.target.value)} rows={4} className="mt-3 min-h-[120px] w-full resize-none rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 py-3 text-[length:var(--tm-font-size-control)] font-medium leading-6 text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:opacity-100" />}
        {question.type === 'number' && <input id={inputId} disabled={!editable} type="number" inputMode="decimal" min={settings.minValue} max={settings.maxValue} step={settings.numberFormat === 'decimal-1' ? 0.1 : settings.numberFormat === 'decimal-2' ? 0.01 : 1} value={typeof answer === 'number' || typeof answer === 'string' ? answer : ''} onChange={event => onAnswerChange(question.id, event.target.value)} className="mt-3 h-[52px] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 text-[length:var(--tm-font-size-control)] font-medium tabular-nums text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:opacity-100" />}
        {question.type === 'date' && <input id={inputId} disabled={!editable} type={settings.dateFormat === 'year' ? 'number' : settings.dateFormat === 'ym' ? 'month' : 'date'} inputMode={settings.dateFormat === 'year' ? 'numeric' : undefined} min={settings.dateFormat === 'year' ? 1900 : undefined} max={settings.dateFormat === 'year' ? 2100 : undefined} value={typeof answer === 'string' || typeof answer === 'number' ? answer : ''} onChange={event => onAnswerChange(question.id, event.target.value)} className="mt-3 h-[52px] w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 text-[length:var(--tm-font-size-control)] font-medium text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:opacity-100" />}
        {(question.type === 'single' || question.type === 'multiple') && (
          <div className="mt-3 grid grid-cols-2 gap-2" role="group" aria-label={question.title}>
            {question.options.map(option => {
              const selected = selectedOptions.includes(option);
              const maxReached = question.type === 'multiple' && !selected && selectedOptions.length >= (settings.maxSelections ?? question.options.length);
              const showCustomInput = selected && question.customAnswerOptions?.includes(option);
              return (
                <div key={option} className={`overflow-hidden rounded-[var(--tm-radius-control)] border ${selected ? 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]'}`}>
                  <button
                    type="button"
                    disabled={!editable || maxReached}
                    aria-pressed={selected}
                    onClick={() => {
                      const nextSelected = question.type === 'multiple'
                        ? selected ? selectedOptions.filter(item => item !== option) : [...selectedOptions, option]
                        : [option];
                      const nextCustomText = Object.fromEntries(Object.entries(customText).filter(([key]) => nextSelected.includes(key)));
                      onAnswerChange(question.id, question.customAnswerOptions?.length
                        ? { selectedOptions: nextSelected, customText: nextCustomText }
                        : question.type === 'multiple' ? nextSelected : nextSelected[0] ?? '');
                    }}
                    className={`flex min-h-[52px] w-full items-center gap-2.5 px-3 text-left text-[length:var(--tm-font-size-control)] font-medium transition active:scale-[0.98] disabled:active:scale-100 disabled:opacity-45 ${selected ? 'text-[var(--tm-text-primary)]' : 'text-[var(--tm-text-secondary)]'}`}
                  >
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center border ${question.type === 'single' ? 'rounded-full' : 'rounded-[6px]'} ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]'}`}>
                      {selected && (question.type === 'single' ? <span className="h-2 w-2 rounded-full bg-[var(--tm-text-inverse)]" /> : <Check className="h-3 w-3" strokeWidth={3} />)}
                    </span>
                    <span>{option}</span>
                  </button>
                  {showCustomInput && (
                    <div className="px-3 pb-3">
                      <input
                        disabled={!editable}
                        value={customText[option] ?? ''}
                        onChange={event => onAnswerChange(question.id, { selectedOptions, customText: { ...customText, [option]: event.target.value } })}
                        placeholder="请补充填写"
                        aria-label={`${option}补充内容`}
                        className="h-11 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3 text-[length:var(--tm-font-size-control)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)]"
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
        {question.type === 'rating' && <div className="mt-3 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">{formatQuestionnaireAnswer(answer)}</div>}
      </div>
    );
  };

  return (
    <section className="space-y-5">
      {getStudentCollectionQuestionGroups(record).map(questionGroup => (
        <div key={questionGroup.id}>
          {questionGroup.label && <h2 className="mb-2 px-1 text-[length:var(--tm-font-size-form-group-label)] font-semibold leading-5 text-[var(--tm-text-secondary)]">{questionGroup.label}</h2>}
          <section className="divide-y divide-[var(--tm-border-subtle)] overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
            {questionGroup.questions.map(({ question, index }) => renderQuestion(question, index))}
          </section>
        </div>
      ))}
    </section>
  );
};

const emptyQuestion = (type: QuestionnaireQuestionType, sectionId?: string): QuestionnaireQuestion => ({
  id: createQuestionId(),
  type,
  title: '',
  required: true,
  options: type === 'single' || type === 'multiple' ? ['选项1', '选项2'] : type === 'rating' ? createRatingOptions(5) : [],
  customAnswerOptions: [],
  subFields: type === 'multi_fill'
    ? Array.from({ length: 2 }, () => ({ id: createFormSubFieldId(), label: '', required: true }))
    : undefined,
  sectionId,
  settings: normalizeFormFieldSettings(type, undefined, type === 'single' || type === 'multiple' ? ['选项1', '选项2'] : type === 'rating' ? createRatingOptions(5) : []),
});

const archiveQuestionTypeByFieldType: Record<ArchiveField['type'], QuestionnaireQuestionType> = {
  text: 'text',
  'single-select': 'single',
  'multiple-select': 'multiple',
  date: 'date',
  number: 'number',
};

const createArchiveQuestion = (
  templateId: string,
  field: ArchiveField,
  sectionId?: string,
): QuestionnaireQuestion => ({
  id: `archive-${templateId}-${field.id}`,
  type: archiveQuestionTypeByFieldType[field.type],
  title: field.label,
  required: field.required,
  options: [...field.options],
  customAnswerOptions: [...(field.customAnswerOptions ?? [])],
  settings: field.settings,
  sectionId,
  archiveTemplateId: templateId,
  archiveFieldId: field.id,
  archiveFieldSemanticKey: field.semanticKey,
});

const QuestionnaireManagementView: React.FC<QuestionnaireManagementViewProps> = ({
  onBack,
  teacherId,
  teacherName,
  spaceId,
  homeroomClassIds,
  classes,
  allScopeLabel = '全部班级',
  getStudentsForClass,
  initialMode = 'owned',
  initialArchiveTemplateId,
}) => {
  const [records, setRecords] = useState<QuestionnaireRecord[]>(() => readQuestionnaires());
  const [pageMode, setPageMode] = useState<PageMode>(initialMode === 'assigned' ? 'assigned-list' : 'list');
  const [recordOrigin, setRecordOrigin] = useState<'list' | 'assigned-list'>('list');
  const [listFilter, setListFilter] = useState<ListFilter>('active');
  const [activeRecordId, setActiveRecordId] = useState('');
  const [detailTab, setDetailTab] = useState<DetailTab>('data');
  const [activeSubmission, setActiveSubmission] = useState<QuestionnaireSubmission | null>(null);
  const [activeQuestionId, setActiveQuestionId] = useState('');
  const [activeQuestionSubFieldId, setActiveQuestionSubFieldId] = useState('');
  const [questionResponseSearch, setQuestionResponseSearch] = useState('');
  const [questionResponseClass, setQuestionResponseClass] = useState('all');
  const [visibleQuestionResponseCount, setVisibleQuestionResponseCount] = useState(20);
  const [responseFilter, setResponseFilter] = useState<'completed' | 'pending' | 'unreachable'>('completed');
  const [createStep, setCreateStep] = useState(1);
  const [respondentRole, setRespondentRole] = useState<QuestionnaireRespondentRole>('guardian');
  const [collectionMode, setCollectionMode] = useState<QuestionnaireCollectionMode>('guardian_questionnaire');
  const [studentAssignmentMode, setStudentAssignmentMode] = useState<StudentAssignmentMode>('creator');
  const [draftId, setDraftId] = useState('');
  const [draftTitle, setDraftTitle] = useState('');
  const [draftDescription, setDraftDescription] = useState('');
  const [draftLayoutMode, setDraftLayoutMode] = useState<FormLayoutMode>('flat');
  const [draftSections, setDraftSections] = useState<FormSection[]>([]);
  const [draftQuestions, setDraftQuestions] = useState<QuestionnaireQuestion[]>([]);
  const [draftGrowthFields, setDraftGrowthFields] = useState<BodyGrowthFieldKey[]>([]);
  const [draftGrowthDateMode, setDraftGrowthDateMode] = useState<GrowthRecordDateMode>('respondent');
  const [draftGrowthFixedDate, setDraftGrowthFixedDate] = useState('');
  const [enabledGrowthFields, setEnabledGrowthFields] = useState<GrowthFieldDefinition[]>(() => getEnabledGrowthFields(spaceId));
  const [draftGrowthSectionId, setDraftGrowthSectionId] = useState('');
  const [draftArchiveTemplateId, setDraftArchiveTemplateId] = useState('');
  const [draftArchiveTemplateSnapshot, setDraftArchiveTemplateSnapshot] = useState<ArchiveTemplateSnapshot | null>(null);
  const [previewRecord, setPreviewRecord] = useState<QuestionnaireRecord | null>(null);
  const [previewAnswers, setPreviewAnswers] = useState<Record<string, QuestionnaireAnswer>>({});
  const [previewReturnMode, setPreviewReturnMode] = useState<PreviewReturnMode>('detail');
  const [selectedClassIds, setSelectedClassIds] = useState<Set<string>>(new Set());
  const [activeScopeGrade, setActiveScopeGrade] = useState(classes[0]?.gradeLevel ?? '');
  const [hasSuggestedDeadline, setHasSuggestedDeadline] = useState(false);
  const [suggestedDeadline, setSuggestedDeadline] = useState('');
  const [showAssignmentSheet, setShowAssignmentSheet] = useState(false);
  const [showGrowthDateSheet, setShowGrowthDateSheet] = useState(false);
  const [showArchiveTemplateSheet, setShowArchiveTemplateSheet] = useState(false);
  const [showRecordMenu, setShowRecordMenu] = useState(false);
  const [showDraftMenu, setShowDraftMenu] = useState(false);
  const [showDeleteDraftConfirm, setShowDeleteDraftConfirm] = useState(false);
  const [draftActionId, setDraftActionId] = useState('');
  const [studentRecordFilter, setStudentRecordFilter] = useState<StudentRecordFilter>('all');
  const [studentRecordSearch, setStudentRecordSearch] = useState('');
  const [activeStudentNo, setActiveStudentNo] = useState('');
  const [studentRecordAnswers, setStudentRecordAnswers] = useState<Record<string, QuestionnaireAnswer>>({});
  const [toast, setToast] = useState('');
  const [stepOneValidationAttempt, setStepOneValidationAttempt] = useState(0);
  const readCurrentArchiveWorkspace = () => readArchiveWorkspace({
    spaceId,
    teacherName,
    classes,
    homeroomClassIds,
    getStudentsForClass,
  });
  const [archiveWorkspace, setArchiveWorkspace] = useState(readCurrentArchiveWorkspace);

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
    const refresh = () => setEnabledGrowthFields(getEnabledGrowthFields(spaceId));
    refresh();
    window.addEventListener(GROWTH_FIELD_CONFIG_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(GROWTH_FIELD_CONFIG_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [spaceId]);

  useEffect(() => {
    const refresh = () => setArchiveWorkspace(readCurrentArchiveWorkspace());
    window.addEventListener(ARCHIVE_STORE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(ARCHIVE_STORE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, [spaceId, teacherName, classes, homeroomClassIds, getStudentsForClass]);

  useEffect(() => {
    if (!toast) return;
    const timer = window.setTimeout(() => setToast(''), 1800);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const availableClasses = useMemo(() => classes, [classes]);
  const gradeGroups = useMemo(() => {
    const groups = new Map<string, ClassInfo[]>();
    availableClasses.forEach(classInfo => {
      const gradeClasses = groups.get(classInfo.gradeLevel) ?? [];
      gradeClasses.push(classInfo);
      groups.set(classInfo.gradeLevel, gradeClasses);
    });
    return Array.from(groups, ([gradeLevel, gradeClasses]) => ({
      gradeLevel,
      classes: gradeClasses,
    }));
  }, [availableClasses]);
  const allAvailableStudents = useMemo(() => availableClasses.flatMap(classInfo => (
    getStudentsForClass(classInfo.id)
      .filter(student => (student.status ?? 'active') === 'active')
      .map(student => ({ classInfo, student }))
  )), [availableClasses, getStudentsForClass]);
  const activeStudentCountByClassId = useMemo(() => {
    const counts = new Map<string, number>();
    allAvailableStudents.forEach(({ classInfo }) => counts.set(classInfo.id, (counts.get(classInfo.id) ?? 0) + 1));
    return counts;
  }, [allAvailableStudents]);
  const activeRecord = records.find(record => record.id === activeRecordId) ?? null;
  const ownedRecords = records.filter(record => (
    record.spaceId === spaceId
    && record.growthTemplate !== 'semester_goal'
    && isQuestionnaireCreatedByTeacher(record, teacherId, teacherName)
  ));
  const filteredRecords = ownedRecords.filter(record => record.status === listFilter);
  const archivedRecords = ownedRecords.filter(record => record.status === 'archived');
  const assignedRecords = getPendingAssignedStudentCollections(records, teacherId, teacherName, spaceId)
    .filter(record => record.growthTemplate !== 'semester_goal');
  const availableArchiveTemplates = useMemo(() => archiveWorkspace.templates
    .filter(template => template.origin === 'school' && template.status === 'published' && !template.deletedAt)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt)), [archiveWorkspace.templates]);
  const draftArchiveGrowthFields = useMemo(() => (draftArchiveTemplateSnapshot?.growthFields ?? [])
    .flatMap(field => getGrowthFieldDefinition(field.key as BodyGrowthFieldKey) ? [field.key as BodyGrowthFieldKey] : []), [draftArchiveTemplateSnapshot]);
  const effectiveGrowthFields = useMemo(() => Array.from(new Set([
    ...draftArchiveGrowthFields,
    ...draftGrowthFields,
  ])), [draftArchiveGrowthFields, draftGrowthFields]);
  const draftArchiveGrowthFieldSet = useMemo(() => new Set(draftArchiveGrowthFields), [draftArchiveGrowthFields]);
  const draftArchiveSystemLabels = useMemo(() => (draftArchiveTemplateSnapshot?.systemFields ?? []).map(getArchiveSystemFieldLabel), [draftArchiveTemplateSnapshot]);
  const draftArchiveInputLabels = useMemo(() => [
    ...(draftArchiveTemplateSnapshot?.growthFields ?? []).map(field => (
      getGrowthFieldDefinition(field.key as BodyGrowthFieldKey)?.label
      ?? ARCHIVE_GROWTH_FIELD_GROUPS.flatMap(group => group.fields).find(item => item.key === field.key)?.label
      ?? String(field.key)
    )),
    ...(draftArchiveTemplateSnapshot?.fields ?? []).map(field => field.label),
  ], [draftArchiveTemplateSnapshot]);
  const availableGrowthFieldOptions = useMemo(() => {
    const enabledKeys = new Set(enabledGrowthFields.map(item => item.key));
    const legacySelected = effectiveGrowthFields
      .filter(key => !enabledKeys.has(key))
      .map(getGrowthFieldDefinition)
      .filter((item): item is GrowthFieldDefinition => Boolean(item));
    return [...enabledGrowthFields, ...legacySelected];
  }, [effectiveGrowthFields, enabledGrowthFields]);
  const getDraftGrowthQuestions = () => {
    const sectionId = draftLayoutMode === 'grouped'
      ? draftSections.some(section => section.id === draftGrowthSectionId)
        ? draftGrowthSectionId
        : draftSections[0]?.id
      : undefined;
    return createBodyGrowthQuestions(effectiveGrowthFields, draftGrowthDateMode === 'respondent').map(question => ({ ...question, sectionId }));
  };
  const getDraftArchiveQuestions = () => (draftArchiveTemplateSnapshot?.fields ?? []).map(field => (
    createArchiveQuestion(
      draftArchiveTemplateId,
      field,
      draftLayoutMode === 'grouped' ? draftSections[0]?.id : undefined,
    )
  ));
  const getAllDraftQuestions = () => [...getDraftGrowthQuestions(), ...getDraftArchiveQuestions(), ...draftQuestions];
  const validStructure = draftLayoutMode === 'flat' || (
    draftSections.length > 0
    && getAllDraftQuestions().every(question => Boolean(question.sectionId) && draftSections.some(section => section.id === question.sectionId))
  );
  const stepOneFieldErrors = useMemo(() => Object.fromEntries(draftQuestions.flatMap(question => {
    const error: { label?: string; options?: string; subFields?: string } = {};
    if (!question.title.trim()) error.label = '请输入题目名称';
    if (!['text', 'short_text', 'multi_fill', 'number', 'date'].includes(question.type) && question.options.filter(option => option.trim()).length < 2) {
      error.options = '请至少填写2个选项';
    }
    if (question.type === 'multi_fill') {
      const subFields = question.subFields ?? [];
      const labels = subFields.map(subField => subField.label.trim());
      if (subFields.length < 2) error.subFields = '请至少添加2个填空项';
      else if (subFields.length > 6) error.subFields = '最多添加6个填空项';
      else if (labels.some(label => !label)) error.subFields = '请填写所有填空项名称';
      else if (new Set(labels).size !== labels.length) error.subFields = '填空项名称不能重复';
    }
    return error.label || error.options || error.subFields ? [[question.id, error] as const] : [];
  })), [draftQuestions]);
  const stepOneTitleError = !draftTitle.trim()
    ? '请输入标题'
    : '';
  const stepOneListError = draftLayoutMode === 'grouped' && draftSections.length === 0
    ? '请先添加分组'
    : getAllDraftQuestions().length === 0
      ? '请至少添加1个题目'
      : !validStructure
        ? '请为所有题目选择分组'
        : '';
  const stepOneGrowthDateError = effectiveGrowthFields.length > 0 && draftGrowthDateMode === 'fixed' && !draftGrowthFixedDate
    ? '请设置本次统一日期'
    : '';
  const validStepOne = !stepOneTitleError && !stepOneListError && !stepOneGrowthDateError && Object.keys(stepOneFieldErrors).length === 0;

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

  const openQuestionResponses = (questionId: string, subFieldId = '') => {
    setActiveQuestionId(questionId);
    setActiveQuestionSubFieldId(subFieldId);
    setQuestionResponseSearch('');
    setQuestionResponseClass('all');
    setVisibleQuestionResponseCount(20);
    setPageMode('question-responses');
  };

  const startCreate = (
    record?: QuestionnaireRecord,
    nextRespondentRole: QuestionnaireRespondentRole = 'guardian',
    nextArchiveTemplateId = '',
  ) => {
    const resolvedRole = record ? getQuestionnaireRespondentRole(record) : nextRespondentRole;
    const resolvedMode: QuestionnaireCollectionMode = resolvedRole === 'teacher' ? 'student_information' : 'guardian_questionnaire';
    const archiveTemplateId = record?.archiveTemplateId ?? nextArchiveTemplateId;
    const archiveTemplate = archiveWorkspace.templates.find(item => item.id === archiveTemplateId && !item.deletedAt);
    const archiveTemplateSnapshot = record?.archiveTemplateSnapshot
      ?? (archiveTemplate ? createArchiveTemplateSnapshot(archiveTemplate) : null);
    setRespondentRole(resolvedRole);
    setCollectionMode(resolvedMode);
    setStudentAssignmentMode(record?.studentAssignmentMode ?? 'creator');
    setDraftId(record?.id ?? '');
    setDraftTitle(record?.title ?? '');
    if (!record && archiveTemplateSnapshot) setDraftTitle(`更新${archiveTemplateSnapshot.name}`);
    setDraftDescription(record?.description ?? '');
    setDraftLayoutMode(record?.layoutMode ?? 'flat');
    setDraftSections((record?.sections ?? []).map(section => ({ ...section })));
    const nextQuestions = record?.questions ?? [];
    setDraftGrowthFields(getBodyGrowthFieldKeys(nextQuestions));
    setDraftGrowthDateMode(record?.growthRecordDateMode ?? (record?.growthMeasurementDate ? 'fixed' : 'respondent'));
    setDraftGrowthFixedDate(record?.growthMeasurementDate ?? '');
    setDraftGrowthSectionId(nextQuestions.find(isBodyGrowthQuestion)?.sectionId ?? '');
    setDraftArchiveTemplateId(archiveTemplateId);
    setDraftArchiveTemplateSnapshot(archiveTemplateSnapshot);
    setDraftQuestions(nextQuestions.filter(question => !isBodyGrowthQuestion(question) && !question.archiveFieldSemanticKey));
    setPreviewRecord(null);
    setPreviewAnswers({});
    const nextTargetMode = record?.targetMode ?? 'classes';
    const storedClassIds = record?.targetClassIds ?? [];
    const recordClassIds = nextTargetMode === 'classes' && storedClassIds.length === 0
      ? Array.from(new Set(record?.targets.map(target => target.classId) ?? []))
      : storedClassIds;
    const nextSelectedClassIds = nextTargetMode === 'all'
      ? availableClasses.map(classInfo => classInfo.id)
      : recordClassIds;
    setSelectedClassIds(new Set(nextSelectedClassIds));
    const firstSelectedClass = availableClasses.find(classInfo => nextSelectedClassIds.includes(classInfo.id));
    setActiveScopeGrade(firstSelectedClass?.gradeLevel ?? gradeGroups[0]?.gradeLevel ?? '');
    setHasSuggestedDeadline(Boolean(record?.suggestedDeadline));
    setSuggestedDeadline((record?.suggestedDeadline ?? '').replace(' ', 'T'));
    setCreateStep(1);
    setStepOneValidationAttempt(0);
    setPageMode('create');
  };

  useEffect(() => {
    if (!initialArchiveTemplateId) return;
    startCreate(undefined, 'teacher', initialArchiveTemplateId);
  }, [initialArchiveTemplateId]);

  const selectArchiveTemplate = (template?: ArchiveTemplate) => {
    const previousAutoTitle = draftArchiveTemplateSnapshot ? `更新${draftArchiveTemplateSnapshot.name}` : '';
    const nextSnapshot = template ? createArchiveTemplateSnapshot(template) : null;
    setDraftArchiveTemplateId(template?.id ?? '');
    setDraftArchiveTemplateSnapshot(nextSnapshot);
    if (!draftTitle.trim() || draftTitle === previousAutoTitle) {
      setDraftTitle(nextSnapshot ? `更新${nextSnapshot.name}` : '');
    }
    setShowArchiveTemplateSheet(false);
  };

  const buildTargets = (useRosterName = false): QuestionnaireTarget[] => allAvailableStudents
    .filter(({ classInfo, student }) => (
      Boolean(student.studentNo)
      && selectedClassIds.has(classInfo.id)
    ))
    .map(({ classInfo, student }) => ({
      studentId: student.id,
      studentNo: student.studentNo!,
      studentName: useRosterName ? student.name : demoLinkedStudentName(student),
      classId: classInfo.id,
      className: classInfo.name,
      reachable: respondentRole === 'teacher'
        || Boolean(student.guardianContacts?.length) && !student.studentNo?.endsWith('07'),
      scopeStatus: 'active',
    }));

  const openCreatePreview = () => {
    const allQuestions = getAllDraftQuestions();
    if (allQuestions.length === 0) {
      showToast('添加题目后即可预览');
      return;
    }
    const targets = buildTargets(effectiveGrowthFields.length > 0 || Boolean(draftArchiveTemplateId));
    const existing = records.find(record => record.id === draftId);
    setPreviewRecord({
      id: draftId || 'questionnaire-preview',
      title: draftTitle.trim() || '未命名问卷',
      description: draftDescription.trim(),
      creatorName: teacherName,
      creatorTeacherId: teacherId,
      spaceId,
      createdAt: existing?.createdAt ?? nowText(),
      suggestedDeadline: hasSuggestedDeadline ? suggestedDeadline.replace('T', ' ') : '',
      status: 'draft',
      contentType: inferQuestionnaireContentType(allQuestions),
      respondentRole,
      collectionMode,
      growthRecordDateMode: effectiveGrowthFields.length > 0 ? draftGrowthDateMode : undefined,
      growthMeasurementDate: effectiveGrowthFields.length > 0 && draftGrowthDateMode === 'fixed' ? draftGrowthFixedDate : undefined,
      archiveTemplateId: draftArchiveTemplateId || undefined,
      archiveTemplateName: draftArchiveTemplateSnapshot?.name,
      archiveTemplateVersion: draftArchiveTemplateSnapshot?.version,
      archiveTemplateSnapshot: draftArchiveTemplateSnapshot ?? undefined,
      targetMode: 'classes',
      targetClassIds: Array.from(selectedClassIds),
      targetSyncPolicy: 'follow_classes',
      layoutMode: draftLayoutMode,
      sections: draftSections,
      questions: allQuestions.map((question, index) => ({
        ...question,
        title: question.title.trim() || `未填写题目 ${index + 1}`,
      })),
      targets,
      submissions: existing?.submissions ?? [],
    });
    setPreviewAnswers({});
    setPreviewReturnMode('create');
    setPageMode('preview');
  };

  const openDetailPreview = (record: QuestionnaireRecord) => {
    setPreviewRecord(record);
    setPreviewAnswers({});
    setPreviewReturnMode('detail');
    setPageMode('preview');
  };

  const advanceCreateStep = () => {
    if (createStep === 1) {
      setStepOneValidationAttempt(attempt => attempt + 1);
      if (!validStepOne) {
        window.requestAnimationFrame(() => {
          const target = document.getElementById(stepOneTitleError ? 'survey-title' : stepOneGrowthDateError ? 'growth-record-date' : stepOneListError ? 'form-builder-list-error' : '');
          target?.focus({ preventScroll: true });
          target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        });
        return;
      }
      setStepOneValidationAttempt(0);
    }
    setCreateStep(step => Math.min(3, step + 1));
  };

  const getHomeroomAssignee = (classId: string) => {
    if (homeroomClassIds.includes(classId)) return { id: teacherId, name: teacherName };
    const classNumber = Number(classId.split('_').at(-1) ?? 0);
    return classNumber % 2 === 0
      ? { id: `${spaceId}:王蕾`, name: '王蕾老师' }
      : { id: `${spaceId}:陈老师`, name: '陈老师' };
  };

  useEffect(() => {
    const availableClassIds = new Set(availableClasses.map(classInfo => classInfo.id));
    const nextRecords = records.map(record => {
      if (
        record.spaceId !== spaceId
        || !isQuestionnaireCreatedByTeacher(record, teacherId, teacherName)
        || !record.targetClassIds?.every(classId => availableClassIds.has(classId))
      ) return record;
      const followedClassIds = new Set(record.targetClassIds);
      const existingTargetNos = new Set(record.targets.map(target => target.studentNo));
      const currentClassTargets = allAvailableStudents
        .filter(({ classInfo, student }) => Boolean(student.studentNo) && (
          followedClassIds.has(classInfo.id) || existingTargetNos.has(student.studentNo!)
        ))
        .map(({ classInfo, student }) => ({
          studentId: student.id,
          studentNo: student.studentNo!,
          studentName: hasGrowthCollectionFields(record) || Boolean(record.archiveTemplateId) ? student.name : demoLinkedStudentName(student),
          classId: classInfo.id,
          className: classInfo.name,
          reachable: getQuestionnaireRespondentRole(record) === 'teacher'
            || Boolean(student.guardianContacts?.length) && !student.studentNo?.endsWith('07'),
          scopeStatus: 'active' as const,
        }));
      const reconciledRecord = reconcileQuestionnaireTargets(record, currentClassTargets, {
        resolveStudentAssignee: target => getHomeroomAssignee(target.classId),
      });
      if ((!hasGrowthCollectionFields(record) && !record.archiveTemplateId) || !reconciledRecord.studentRecords) return reconciledRecord;
      const currentTargetByStudentNo = new Map(currentClassTargets.map(target => [target.studentNo, target]));
      const shouldSyncRosterName = reconciledRecord.studentRecords.some(item => {
        const target = currentTargetByStudentNo.get(item.studentNo);
        return target && (item.studentName !== target.studentName || item.className !== target.className);
      });
      if (!shouldSyncRosterName) return reconciledRecord;
      return {
        ...reconciledRecord,
        studentRecords: reconciledRecord.studentRecords.map(item => {
          const target = currentTargetByStudentNo.get(item.studentNo);
          return target ? { ...item, studentName: target.studentName, className: target.className } : item;
        }),
      };
    });
    if (nextRecords.some((record, index) => record !== records[index])) writeQuestionnaires(nextRecords);
  }, [allAvailableStudents, availableClasses, homeroomClassIds, records, spaceId, teacherId, teacherName]);

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
    const questions = getAllDraftQuestions();
    const targets = buildTargets(effectiveGrowthFields.length > 0 || Boolean(draftArchiveTemplateId));
    const record: QuestionnaireRecord = {
      id: draftId || createQuestionnaireId(),
      title: draftTitle.trim() || '未命名问卷',
      description: draftDescription.trim(),
      creatorName: teacherName,
      creatorTeacherId: teacherId,
      spaceId,
      createdAt: existing?.createdAt ?? nowText(),
      suggestedDeadline: hasSuggestedDeadline ? suggestedDeadline.replace('T', ' ') : '',
      status: 'draft',
      contentType: inferQuestionnaireContentType(questions),
      respondentRole,
      collectionMode,
      growthRecordDateMode: effectiveGrowthFields.length > 0 ? draftGrowthDateMode : undefined,
      growthMeasurementDate: effectiveGrowthFields.length > 0 && draftGrowthDateMode === 'fixed' ? draftGrowthFixedDate : undefined,
      archiveTemplateId: draftArchiveTemplateId || undefined,
      archiveTemplateName: draftArchiveTemplateSnapshot?.name,
      archiveTemplateVersion: draftArchiveTemplateSnapshot?.version,
      archiveTemplateSnapshot: draftArchiveTemplateSnapshot ?? undefined,
      studentAssignmentMode: respondentRole === 'teacher' ? studentAssignmentMode : undefined,
      targetMode: 'classes',
      targetClassIds: Array.from(selectedClassIds),
      targetSyncPolicy: 'follow_classes',
      layoutMode: draftLayoutMode,
      sections: draftSections,
      questions,
      targets,
      submissions: existing?.submissions ?? [],
      studentRecords: respondentRole === 'teacher' ? buildStudentRecords(targets, existing) : [],
    };
    if (draftArchiveTemplateId) persistArchiveWorkspace(archiveWorkspace);
    upsertQuestionnaire(record);
    setRecords(readQuestionnaires());
    setListFilter('draft');
    setPageMode('list');
    showToast('草稿已保存');
  };

  const publishQuestionnaire = () => {
    const existing = records.find(record => record.id === draftId);
    const questions = getAllDraftQuestions();
    const targets = buildTargets(effectiveGrowthFields.length > 0 || Boolean(draftArchiveTemplateId));
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
      contentType: inferQuestionnaireContentType(questions),
      respondentRole,
      collectionMode,
      growthRecordDateMode: effectiveGrowthFields.length > 0 ? draftGrowthDateMode : undefined,
      growthMeasurementDate: effectiveGrowthFields.length > 0 && draftGrowthDateMode === 'fixed' ? draftGrowthFixedDate : undefined,
      archiveTemplateId: draftArchiveTemplateId || undefined,
      archiveTemplateName: draftArchiveTemplateSnapshot?.name,
      archiveTemplateVersion: draftArchiveTemplateSnapshot?.version,
      archiveTemplateSnapshot: draftArchiveTemplateSnapshot ?? undefined,
      studentAssignmentMode: respondentRole === 'teacher' ? studentAssignmentMode : undefined,
      targetMode: 'classes',
      targetClassIds: Array.from(selectedClassIds),
      targetSyncPolicy: 'follow_classes',
      layoutMode: draftLayoutMode,
      sections: draftSections,
      questions,
      targets,
      submissions: existing?.submissions ?? [],
      studentRecords: respondentRole === 'teacher' ? buildStudentRecords(targets, existing) : [],
    };
    if (draftArchiveTemplateId) persistArchiveWorkspace(archiveWorkspace);
    upsertQuestionnaire(record);
    setRecords(readQuestionnaires());
    setActiveRecordId(record.id);
    setDetailTab('data');
    setPageMode('detail');
    showToast(respondentRole === 'teacher' ? '已开始采集' : '已发布到家长端');
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

  const closeActiveRecord = () => {
    if (!activeRecord || activeRecord.status !== 'active') return;
    if (!updateQuestionnaireStatus(activeRecord.id, 'ended')) return;
    setRecords(readQuestionnaires());
    setShowRecordMenu(false);
    showToast('采集已结束');
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
    showToast(getQuestionnaireCollectionMode(activeRecord) === 'student_information' ? '已恢复编辑' : '采集已重新开放');
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
    showToast('采集已归档');
  };

  const restoreActiveRecord = () => {
    if (!activeRecord || activeRecord.status !== 'archived') return;
    if (!updateQuestionnaireStatus(activeRecord.id, 'ended')) return;
    setRecords(readQuestionnaires());
    setShowRecordMenu(false);
    setListFilter('ended');
    setPageMode('list');
    showToast('采集已恢复');
  };

  const deleteCurrentDraft = () => {
    if (!draftActionId || !deleteDraftQuestionnaire(draftActionId)) {
      setShowDeleteDraftConfirm(false);
      showToast('草稿无法删除');
      return;
    }
    setRecords(readQuestionnaires());
    setShowDeleteDraftConfirm(false);
    setShowDraftMenu(false);
    setDraftActionId('');
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
    setStudentRecordAnswers({ ...studentRecord.answers });
    setPageMode('student-record');
  };

  const saveActiveStudentRecord = (status: 'draft' | 'completed') => {
    if (!activeRecord) return;
    const studentRecord = getStudentRecord(activeRecord, activeStudentNo);
    if (!studentRecord) return;
    const validationError = activeRecord.questions.map(question => getQuestionnaireAnswerValidationError(question, studentRecordAnswers[question.id])).find(Boolean);
    if (status === 'completed' && validationError) {
      showToast(validationError);
      return;
    }
    const completedAt = nowText();
    const saved = saveStudentCollectionRecord(activeRecord.id, {
      ...studentRecord,
      status,
      updatedAt: completedAt,
      answers: studentRecordAnswers,
    }, teacherId, teacherName);
    if (!saved) {
      showToast('当前采集不可编辑');
      return;
    }
    const growthUpdated = status === 'completed' && hasGrowthCollectionFields(activeRecord)
      ? persistGrowthCollectionAnswers(activeRecord, studentRecord.studentNo, studentRecordAnswers, completedAt)
      : false;
    const archiveUpdated = status === 'completed' && Boolean(activeRecord.archiveTemplateId)
      ? persistArchiveCollectionAnswers(activeRecord, studentRecord.studentNo, studentRecordAnswers, teacherName)
      : false;
    setRecords(readQuestionnaires());
    setPageMode('detail');
    showToast(status === 'completed'
      ? activeRecord.archiveTemplateId && (archiveUpdated || growthUpdated) ? '已完成并更新档案' : growthUpdated ? '已完成并更新成长数据' : '已完成'
      : '草稿已保存');
  };

  const renderList = () => {
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden pb-[calc(var(--tm-size-floating-action)+var(--tm-space-5)+var(--tm-space-5)+env(safe-area-inset-bottom))]">
        <PageHeader title="采集管理" onBack={onBack} />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 pt-4 no-scrollbar">
          <div className="grid h-11 grid-cols-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)]" role="tablist" aria-label="采集状态">
            {([['active', '收集中'], ['ended', '已结束'], ['draft', '草稿']] as const).map(([value, label]) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={listFilter === value}
                onClick={() => setListFilter(value)}
                className="flex h-11 items-center p-1 text-[length:var(--tm-font-size-compact)] font-semibold"
              >
                <span className={`flex h-9 w-full items-center justify-center rounded-[calc(var(--tm-radius-control)-4px)] transition-all ${listFilter === value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>
                  {label}
                </span>
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
              const modeMeta = getQuestionnaireContentType(record) === 'ordinary' ? collectionModeMeta[mode] : growthCollectionMeta;
              const ModeIcon = modeMeta.icon;
              const reachable = getReachableTargetCount(record);
              const completion = getCompletionRate(record);
              const completed = mode === 'student_information' ? getStudentCollectionCompletedCount(record) : getQuestionnaireCompletedCount(record);
              const overdue = isQuestionnaireOverdue(record);
              return (
                <article key={record.id} className="relative">
                  <button
                    type="button"
                    onClick={() => openRecord(record, 'list')}
                    className={`relative w-full cursor-pointer overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-4 py-4 text-left [box-shadow:var(--tm-shadow-card)] transition-[scale,background-color,box-shadow] [transition-duration:var(--tm-duration-fast)] ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)] active:[box-shadow:var(--tm-shadow-card)] ${record.status === 'draft' ? 'min-h-[76px] pr-14' : 'min-h-[92px]'}`}
                  >
                    <span className={`pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-r-full ${modeMeta.accentClass}`} aria-hidden="true" />
                    <div className="line-clamp-2 text-pretty text-[length:var(--tm-font-size-card-title)] font-bold leading-[22px] text-[var(--tm-text-primary)]">{record.title}</div>
                    {record.status !== 'draft' && (
                      <div className="mt-3.5 flex min-w-0 items-center justify-between gap-3 text-[length:var(--tm-font-size-meta)]">
                        <div className="flex min-w-0 items-center gap-2 font-medium">
                          <span className={`inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-[length:var(--tm-font-size-badge)] font-semibold ${modeMeta.badgeClass}`}><ModeIcon className="h-3.5 w-3.5" />{getCollectionBadgeLabel(record)}</span>
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
                    {record.status === 'draft' && <div className="mt-2"><span className={`inline-flex h-6 items-center gap-1 rounded-full px-2 text-[length:var(--tm-font-size-badge)] font-semibold ${modeMeta.badgeClass}`}><ModeIcon className="h-3.5 w-3.5" />{getCollectionBadgeLabel(record)}</span></div>}
                  </button>
                  {record.status === 'draft' && (
                    <IconButton
                      label="草稿操作"
                      onClick={() => { setDraftActionId(record.id); setShowDraftMenu(true); }}
                      className="absolute right-1.5 top-1.5 z-10"
                    >
                      <MoreHorizontal className="h-5 w-5" />
                    </IconButton>
                  )}
                </article>
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
        <MobileFloatingCreateButton label="新建采集" onClick={() => startCreate()} />
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

  const renderAssignedList = () => (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden pb-8">
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
                className="relative min-h-[96px] w-full overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-4 py-4 text-left [box-shadow:var(--tm-shadow-card)] transition-[scale,background-color] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)]"
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
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden pb-8">
      <PageHeader title="已归档" onBack={() => { setListFilter('ended'); setPageMode('list'); }} />
      <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 pt-4 no-scrollbar">
        <section className="space-y-2.5">
          {archivedRecords.map(record => {
            const mode = getQuestionnaireCollectionMode(record);
            const modeMeta = getQuestionnaireContentType(record) === 'ordinary' ? collectionModeMeta[mode] : growthCollectionMeta;
            const ModeIcon = modeMeta.icon;
            const reachable = getReachableTargetCount(record);
            const completion = getCompletionRate(record);
            const completed = mode === 'student_information' ? getStudentCollectionCompletedCount(record) : getQuestionnaireCompletedCount(record);
            return (
              <button
                key={record.id}
                type="button"
                onClick={() => openRecord(record)}
                className="relative min-h-[92px] w-full cursor-pointer overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] px-4 py-4 text-left [box-shadow:var(--tm-shadow-card)] transition-[scale,background-color,box-shadow] [transition-duration:var(--tm-duration-fast)] ease-out active:scale-[0.96] active:bg-[var(--tm-bg-surface-soft)]"
              >
                <span className={`pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-r-full ${modeMeta.accentClass}`} aria-hidden="true" />
                <div className="line-clamp-2 text-pretty text-[length:var(--tm-font-size-card-title)] font-bold leading-[22px] text-[var(--tm-text-primary)]">{record.title}</div>
                <div className="mt-3.5 flex min-w-0 items-center justify-between gap-3 text-[length:var(--tm-font-size-meta)]">
                  <div className="flex min-w-0 items-center gap-2 font-medium text-[var(--tm-text-tertiary)]">
                    <span className={`inline-flex h-6 shrink-0 items-center gap-1 rounded-full px-2 text-[length:var(--tm-font-size-badge)] font-semibold ${modeMeta.badgeClass}`}><ModeIcon className="h-3.5 w-3.5" />{getCollectionBadgeLabel(record)}</span>
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
              <div className="mt-4 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-secondary)]">暂无已归档采集</div>
            </div>
          )}
        </section>
      </main>
    </div>
  );

  const renderCreate = () => {
    const isTeacherRespondent = respondentRole === 'teacher';
    const titlePlaceholder = '请输入采集名称';
    const descriptionPlaceholder = '请输入采集说明(非必填)';
    const targets = buildTargets(effectiveGrowthFields.length > 0 || Boolean(draftArchiveTemplateId));
    const allQuestions = getAllDraftQuestions();
    const reachableCount = targets.filter(target => target.reachable).length;
    const unreachableCount = targets.length - reachableCount;
    const allClassesSelected = availableClasses.length > 0 && availableClasses.every(classInfo => selectedClassIds.has(classInfo.id));
    const hasSelectedClasses = selectedClassIds.size > 0;
    const builderFields: Array<ConfigurableFormField<QuestionnaireQuestionType>> = draftQuestions.map(question => ({
      id: question.id,
      label: question.title,
      type: question.type,
      required: question.required,
      options: question.options,
      customAnswerOptions: question.customAnswerOptions,
      sectionId: question.sectionId,
      settings: question.settings,
      subFields: question.subFields,
    }));
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden pb-24">
        <PageHeader
          title={draftId ? '编辑采集' : '新建采集'}
          onBack={() => createStep > 1 ? setCreateStep(step => step - 1) : setPageMode('list')}
        />
        <StepIndicator current={createStep} />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-28 no-scrollbar">
          {createStep === 1 && (
            <div className="space-y-4">
              <section className="-mx-5 bg-[var(--tm-bg-surface)] px-5 py-4">
                <div className="mb-5">
                  <h2 id="respondent-role-title" className="text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-text-primary)]">填写人</h2>
                  <div className="mt-3 grid grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1" role="tablist" aria-labelledby="respondent-role-title">
                    {([['teacher', '老师填写'], ['guardian', '家长填写']] as const).map(([role, label]) => {
                      const RoleIcon = role === 'teacher' ? UserRoundCheck : UsersRound;
                      return (
                        <button
                          key={role}
                          type="button"
                          role="tab"
                          aria-selected={respondentRole === role}
                          onClick={() => {
                            setRespondentRole(role);
                            setCollectionMode(role === 'teacher' ? 'student_information' : 'guardian_questionnaire');
                          }}
                          className={`inline-flex min-h-11 items-center justify-center gap-1.5 rounded-[calc(var(--tm-radius-control)-4px)] px-2 text-[length:var(--tm-font-size-body)] font-semibold transition ${respondentRole === role ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-brand-primary-strong)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}
                        >
                          <RoleIcon className="h-4 w-4 shrink-0" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="mb-5">
                  <h2 className="text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-text-primary)]">更新档案</h2>
                  <button
                    type="button"
                    onClick={() => setShowArchiveTemplateSheet(true)}
                    className="mt-3 flex min-h-[60px] w-full items-center gap-3 border-y border-[var(--tm-border-subtle)] py-2.5 text-left transition-colors active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-brand-primary)]"
                  >
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] ${draftArchiveTemplateSnapshot ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]' : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-tertiary)]'}`}>
                      <Archive className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{draftArchiveTemplateSnapshot?.name ?? '不更新档案'}</span>
                      <span className="mt-0.5 block truncate text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">{draftArchiveTemplateSnapshot ? `${draftArchiveInputLabels.length}项需填写` : '仅保留本次采集结果'}</span>
                    </span>
                    <ChevronRight className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-disabled)]" />
                  </button>
                  {draftArchiveTemplateSnapshot && (
                    <div className="space-y-2 border-b border-[var(--tm-border-subtle)] py-3 text-[length:var(--tm-font-size-meta)] leading-5">
                      {draftArchiveSystemLabels.length > 0 && <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-2"><span className="font-semibold text-[var(--tm-text-tertiary)]">自动带入</span><span className="font-medium text-[var(--tm-text-secondary)]">{draftArchiveSystemLabels.join('、')}</span></div>}
                      {draftArchiveInputLabels.length > 0 && <div className="grid grid-cols-[64px_minmax(0,1fr)] gap-2"><span className="font-semibold text-[var(--tm-text-tertiary)]">本次填写</span><span className="font-medium text-[var(--tm-text-secondary)]">{draftArchiveInputLabels.join('、')}</span></div>}
                    </div>
                  )}
                </div>
                <input id="survey-title" aria-label="采集标题" value={draftTitle} maxLength={40} onChange={event => setDraftTitle(event.target.value)} placeholder={titlePlaceholder} aria-invalid={Boolean(stepOneValidationAttempt && stepOneTitleError)} aria-describedby={stepOneValidationAttempt && stepOneTitleError ? 'survey-title-error' : undefined} className={`min-h-[var(--tm-size-touch)] w-full border-0 border-b bg-transparent px-0 py-1 text-[length:var(--tm-font-size-document-title)] font-bold leading-9 text-[var(--tm-text-primary)] outline-none transition-[border-color,border-width] placeholder:font-medium placeholder:text-[var(--tm-text-tertiary)] focus:border-b-2 focus:ring-0 ${stepOneValidationAttempt && stepOneTitleError ? 'border-[var(--tm-status-negative-strong)] focus:border-[var(--tm-status-negative-strong)]' : 'border-[var(--tm-border-control)] focus:border-[var(--tm-brand-primary)]'}`} />
                {stepOneValidationAttempt > 0 && stepOneTitleError && <p id="survey-title-error" className="mt-1.5 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-status-negative-strong)]">{stepOneTitleError}</p>}
                <div className="mt-[var(--tm-space-4)]">
                  <AutoResizeTextarea id="survey-description" aria-label="采集说明" value={draftDescription} maxLength={500} maxHeight={Number.POSITIVE_INFINITY} onChange={event => setDraftDescription(event.target.value)} placeholder={descriptionPlaceholder} className="min-h-[var(--tm-size-touch)] w-full resize-none border-0 border-b border-[var(--tm-border-control)] bg-transparent px-0 py-2 text-[length:var(--tm-font-size-body)] font-medium leading-5 text-[var(--tm-text-primary)] outline-none transition-[border-color,border-width] placeholder:text-[var(--tm-text-tertiary)] focus:border-b-2 focus:border-[var(--tm-brand-primary)] focus:ring-0" />
                  <div className="mt-1 text-right text-[length:var(--tm-font-size-badge)] font-medium tabular-nums text-[var(--tm-text-tertiary)]" aria-live="polite">{draftDescription.length}/500</div>
                </div>
              </section>
              {effectiveGrowthFields.length > 0 && (
                <section className="overflow-hidden rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]" aria-label="已选成长数据">
                  <button
                    id="growth-record-date"
                    type="button"
                    onClick={() => setShowGrowthDateSheet(true)}
                    aria-invalid={Boolean(stepOneValidationAttempt && stepOneGrowthDateError)}
                    className="flex min-h-[56px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] px-4 text-left active:bg-[var(--tm-bg-surface-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[var(--tm-brand-primary)]"
                  >
                    <CalendarDays className="h-4.5 w-4.5 shrink-0 text-[var(--tm-status-positive-strong)]" />
                    <span className="min-w-0 flex-1">
                      <span className="block text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">记录日期</span>
                      <span className={`mt-0.5 block text-[length:var(--tm-font-size-badge)] font-medium ${stepOneValidationAttempt && stepOneGrowthDateError ? 'text-[var(--tm-status-negative-strong)]' : 'text-[var(--tm-text-tertiary)]'}`}>
                        {draftGrowthDateMode === 'respondent' ? '填写人选择' : draftGrowthFixedDate || '待设置'}
                      </span>
                    </span>
                    <ChevronRight className="h-4.5 w-4.5 shrink-0 text-[var(--tm-text-disabled)]" />
                  </button>
                  {availableGrowthFieldOptions.filter(option => draftGrowthFields.includes(option.key) && !draftArchiveGrowthFieldSet.has(option.key)).map(option => (
                    <div key={option.key} className="flex min-h-[56px] items-center gap-3 border-b border-[var(--tm-border-subtle)] px-4 last:border-b-0">
                      {option.key === 'height_cm' ? <Ruler className="h-4.5 w-4.5 shrink-0 text-[var(--tm-status-positive-strong)]" /> : <Activity className="h-4.5 w-4.5 shrink-0 text-[var(--tm-status-positive-strong)]" />}
                      <span className="min-w-0 flex-1"><span className="block text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{option.label}</span>{option.unit && <span className="mt-0.5 block text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">{option.unit}</span>}</span>
                      <IconButton label={`移除${option.label}`} onClick={() => setDraftGrowthFields(fields => fields.filter(key => key !== option.key))}><Trash2 className="h-4.5 w-4.5" /></IconButton>
                    </div>
                  ))}
                </section>
              )}
              <FormBuilder
                layoutMode={draftLayoutMode}
                sections={draftSections}
                fields={builderFields}
                itemLabel="题目"
                showItemLabel={false}
                addButtonLabel="内容"
                typePickerTitle="添加内容"
                typePickerPrimaryLabel="普通题型"
                typePickerSecondaryTab={{
                  label: '成长数据',
                  render: (close, sectionId) => (
                    <div>
                      <div className="overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]">
                        {availableGrowthFieldOptions.map(option => {
                          const selected = effectiveGrowthFields.includes(option.key);
                          const lockedByArchive = draftArchiveGrowthFieldSet.has(option.key);
                          return (
                            <button
                              key={option.key}
                              type="button"
                              role="checkbox"
                              aria-checked={selected}
                              disabled={lockedByArchive}
                              onClick={() => {
                                setDraftGrowthSectionId(sectionId ?? '');
                                setDraftGrowthFields(fields => selected
                                  ? fields.filter(key => key !== option.key)
                                  : [...fields, option.key]);
                              }}
                              className="flex min-h-[64px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] px-4 text-left last:border-b-0 active:bg-[var(--tm-status-positive-soft)] disabled:opacity-70"
                            >
                              <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${selected ? 'border-[var(--tm-status-positive)] bg-[var(--tm-status-positive)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]'}`}>{selected && <Check className="h-3.5 w-3.5" strokeWidth={3} />}</span>
                              <span className="min-w-0 flex-1"><span className="block text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{option.label}</span><span className="mt-0.5 block text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">{lockedByArchive ? `来自${draftArchiveTemplateSnapshot?.name}` : `${option.groupLabel}${option.unit ? ` · ${option.unit}` : ''}`}</span></span>
                            </button>
                          );
                        })}
                      </div>
                      <PrimaryButton onClick={close} className="mt-4 w-full">完成</PrimaryButton>
                    </div>
                  ),
                }}
                fieldTypes={questionnaireFieldTypes}
                allowCustomAnswer
                fieldErrors={stepOneValidationAttempt ? stepOneFieldErrors : undefined}
                listError={stepOneValidationAttempt ? stepOneListError : ''}
                validationAttempt={stepOneValidationAttempt}
                focusInvalidField={Boolean(!stepOneTitleError && !stepOneListError)}
                createField={(type, sectionId) => {
                  const question = emptyQuestion(type, sectionId);
                  return { ...question, label: question.title };
                }}
                onChange={value => {
                  setDraftLayoutMode(value.layoutMode);
                  setDraftSections(value.sections);
                  setDraftQuestions(value.fields.map(field => ({
                    id: field.id,
                    type: field.type,
                    title: field.label,
                    required: field.required,
                    options: field.options,
                    customAnswerOptions: field.customAnswerOptions,
                    sectionId: field.sectionId,
                    settings: field.settings,
                    subFields: field.subFields,
                  })));
                }}
              />
            </div>
          )}

          {createStep === 2 && (
            <section aria-label="学生范围" className="-mx-5 bg-[var(--tm-bg-surface)] px-5 pb-5">
              {availableClasses.length > 0 ? (
                <>
                  <button type="button" role="checkbox" onClick={toggleAllClasses} aria-checked={allClassesSelected ? true : hasSelectedClasses ? 'mixed' : false} className="flex min-h-[60px] w-full items-center gap-3 text-left active:bg-[var(--tm-bg-surface-soft)]">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[6px] border ${allClassesSelected || hasSelectedClasses ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]'}`}>
                      {allClassesSelected ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : hasSelectedClasses ? <Minus className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                    </span>
                    <span className="min-w-0 flex-1 text-[length:var(--tm-font-size-body)] font-bold text-[var(--tm-text-primary)]">{allScopeLabel}</span>
                    <span className="shrink-0 text-[length:var(--tm-font-size-meta)] font-medium tabular-nums text-[var(--tm-text-tertiary)]">{targets.length}名学生</span>
                  </button>
                  <div className="h-[420px] overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-soft)]">
                    <MobileClassCascadePicker
                      groups={gradeGroups.map(group => ({ gradeLabel: group.gradeLevel, classes: group.classes }))}
                      selectedClassIds={selectedClassIds}
                      activeGrade={activeScopeGrade}
                      onActiveGradeChange={setActiveScopeGrade}
                      onToggleClass={toggleClass}
                      getClassMeta={classInfo => `${activeStudentCountByClassId.get(classInfo.id) ?? 0}人`}
                      ariaLabel="采集范围班级级联选择"
                    />
                  </div>
                </>
              ) : (
                <div className="py-16 text-center text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-tertiary)]">暂无可发送班级</div>
              )}
            </section>
          )}

          {createStep === 3 && (
            <div className="space-y-4">
              <section className="rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]">
                <h2 className="text-[length:var(--tm-font-size-card-title)] font-bold leading-6 text-[var(--tm-text-primary)]">{draftTitle}</h2>
                {draftDescription && <p className="mt-2 text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">{draftDescription}</p>}
                <div className="mt-3 inline-flex min-h-7 items-center gap-1.5 rounded-full bg-[var(--tm-bg-surface-muted)] px-2.5 text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-text-secondary)]">
                  {isTeacherRespondent ? <UserRoundCheck className="h-3.5 w-3.5" /> : <UsersRound className="h-3.5 w-3.5" />}
                  {isTeacherRespondent ? '老师填写' : '家长填写'}
                </div>
                {draftArchiveTemplateSnapshot && (
                  <div className="mt-3 flex min-h-11 items-center gap-2 border-t border-[var(--tm-border-subtle)] pt-3 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">
                    <Archive className="h-4 w-4 shrink-0 text-[var(--tm-brand-primary-strong)]" />
                    <span className="truncate">更新{draftArchiveTemplateSnapshot.name}</span>
                  </div>
                )}
                <div className={`mt-4 grid gap-2 border-t border-[var(--tm-border-subtle)] pt-4 text-center ${isTeacherRespondent ? 'grid-cols-2' : 'grid-cols-3'}`}>
                  {(isTeacherRespondent
                    ? [['内容', allQuestions.length], ['学生', targets.length]]
                    : [['内容', allQuestions.length], ['目标学生', targets.length], ['可送达', reachableCount]]).map(([label, value]) => (
                    <div key={String(label)}><div className="text-[length:var(--tm-font-size-page-title)] font-bold tabular-nums text-[var(--tm-text-primary)]">{value}</div><div className="mt-1 text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">{label}</div></div>
                  ))}
                </div>
              </section>
              {isTeacherRespondent && (
                <section className="overflow-hidden rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
                  <button type="button" onClick={() => setShowAssignmentSheet(true)} className="flex min-h-[58px] w-full items-center justify-between gap-4 px-4 text-left transition-colors active:bg-[var(--tm-bg-surface-soft)]">
                    <span className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">填写分工</span>
                    <span className="flex min-w-0 items-center gap-1.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">
                      <span className="truncate">{studentAssignmentMode === 'creator' ? '我来填写' : '各班班主任'}</span>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[var(--tm-text-disabled)]" />
                    </span>
                  </button>
                </section>
              )}
              {!isTeacherRespondent && <section className="rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]">
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
                    <span className={`flex h-7 w-12 rounded-full p-0.5 transition-colors ${hasSuggestedDeadline ? 'bg-[var(--tm-brand-primary)]' : 'bg-[var(--tm-border-subtle)]'}`}><span className={`h-6 w-6 rounded-full bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-control)] transition-transform ${hasSuggestedDeadline ? 'translate-x-5' : ''}`} /></span>
                  </button>
                </div>
                {hasSuggestedDeadline && (
                  <input aria-label="建议完成时间" type="datetime-local" value={suggestedDeadline} onChange={event => setSuggestedDeadline(event.target.value)} className="mt-3 h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]" />
                )}
              </section>}
              {!isTeacherRespondent && unreachableCount > 0 && (
                <section className="flex min-h-11 items-center gap-3 rounded-[var(--tm-radius-inner)] border border-[var(--tm-brand-reward)]/20 bg-[var(--tm-brand-reward-soft)] px-4 py-3">
                  <UsersRound className="h-5 w-5 shrink-0 text-[var(--tm-brand-reward-strong)]" />
                  <div className="text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-brand-reward-strong)]">{unreachableCount}名学生未绑定家长</div>
                </section>
              )}
            </div>
          )}
        </main>

        <BottomAction>
          <div className="grid grid-cols-[44px_minmax(0,0.9fr)_minmax(0,1.35fr)] items-center gap-2.5">
            <IconButton label="预览问卷" onClick={openCreatePreview} className="border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-control)]">
              <Eye className="h-5 w-5" />
            </IconButton>
            <SecondaryButton onClick={saveDraft} className="px-2">
              <Save className="h-4 w-4" />保存草稿
            </SecondaryButton>
            <PrimaryButton
              disabled={createStep === 2 && targets.length === 0}
              onClick={createStep === 3 ? publishQuestionnaire : advanceCreateStep}
              className="px-3"
            >
              {createStep === 3
                ? isTeacherRespondent ? <><ClipboardCheck className="h-4 w-4" />开始采集</> : <><Send className="h-4 w-4" />确认发布</>
                : '下一步'}
            </PrimaryButton>
          </div>
        </BottomAction>

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
        <BottomSheet open={showGrowthDateSheet} label="记录日期" onDismiss={() => setShowGrowthDateSheet(false)}>
          <h2 className="text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">记录日期</h2>
          <div className="mt-4 overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]">
            {([['respondent', '填写人选择'], ['fixed', '本次统一日期']] as const).map(([value, label]) => {
              const selected = draftGrowthDateMode === value;
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDraftGrowthDateMode(value)}
                  className="flex min-h-[56px] w-full items-center justify-between border-b border-[var(--tm-border-subtle)] px-4 text-left last:border-b-0 active:bg-[var(--tm-bg-surface-soft)]"
                  role="radio"
                  aria-checked={selected}
                >
                  <span className="text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{label}</span>
                  <span className={`flex h-5 w-5 items-center justify-center rounded-full border ${selected ? 'border-[var(--tm-brand-primary)]' : 'border-[var(--tm-border-control)]'}`}>
                    {selected && <span className="h-2.5 w-2.5 rounded-full bg-[var(--tm-brand-primary)]" />}
                  </span>
                </button>
              );
            })}
          </div>
          {draftGrowthDateMode === 'fixed' && (
            <input
              type="date"
              aria-label="本次统一日期"
              value={draftGrowthFixedDate}
              onChange={event => setDraftGrowthFixedDate(event.target.value)}
              className="mt-4 h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)] px-3.5 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)] outline-none focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]"
            />
          )}
          <PrimaryButton disabled={draftGrowthDateMode === 'fixed' && !draftGrowthFixedDate} onClick={() => setShowGrowthDateSheet(false)} className="mt-4 w-full">完成</PrimaryButton>
        </BottomSheet>
        <MobileBottomSheet open={showArchiveTemplateSheet} title="选择要更新的档案" onClose={() => setShowArchiveTemplateSheet(false)}>
          <div className="overflow-hidden rounded-[var(--tm-radius-inner)] border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]">
            <button
              type="button"
              onClick={() => selectArchiveTemplate()}
              className="flex min-h-[60px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] px-4 text-left active:bg-[var(--tm-bg-surface-soft)]"
              aria-pressed={!draftArchiveTemplateId}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-tertiary)]"><ClipboardList className="h-4.5 w-4.5" /></span>
              <span className="min-w-0 flex-1 text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">不更新档案</span>
              {!draftArchiveTemplateId && <Check className="h-5 w-5 shrink-0 text-[var(--tm-brand-primary-strong)]" strokeWidth={2.5} />}
            </button>
            {availableArchiveTemplates.map(template => {
              const selected = draftArchiveTemplateId === template.id;
              const inputCount = template.growthFields.length + template.fields.length;
              return (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => selectArchiveTemplate(template)}
                  className="flex min-h-[72px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] px-4 text-left last:border-b-0 active:bg-[var(--tm-brand-primary-soft)]"
                  aria-pressed={selected}
                >
                  <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--tm-radius-control)] ${selected ? 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]' : 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]'}`}><Archive className="h-4.5 w-4.5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]">{template.name}</span>
                    <span className="mt-0.5 block text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">{inputCount}项需填写 · {template.systemFields.length}项自动带入</span>
                  </span>
                  {selected && <Check className="h-5 w-5 shrink-0 text-[var(--tm-brand-primary-strong)]" strokeWidth={2.5} />}
                </button>
              );
            })}
          </div>
          {availableArchiveTemplates.length === 0 && <div className="py-12 text-center text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-tertiary)]">暂无可用档案</div>}
        </MobileBottomSheet>
      </div>
    );
  };

  const renderStudentCollectionDetail = (record: QuestionnaireRecord) => {
    const assignedContext = recordOrigin === 'assigned-list';
    const normalizedSearch = studentRecordSearch.trim().toLowerCase();
    const studentRecords = assignedContext
      ? getStudentCollectionRecordsForTeacher(record, teacherId, teacherName)
      : getActiveQuestionnaireTargets(record).map(target => getStudentRecord(record, target.studentNo)).filter(Boolean) as StudentCollectionRecord[];
    const completed = studentRecords.filter(item => item.status === 'completed').length;
    const completion = studentRecords.length === 0 ? 0 : Math.round((completed / studentRecords.length) * 100);
    const visibleRecords = studentRecords.filter(item => {
      const matchesStatus = studentRecordFilter === 'all'
        || (studentRecordFilter === 'incomplete' ? item.status !== 'completed' : item.status === 'completed');
      return matchesStatus && (!normalizedSearch
        || item.studentName.toLowerCase().includes(normalizedSearch)
        || item.studentNo.toLowerCase().includes(normalizedSearch)
        || item.className.toLowerCase().includes(normalizedSearch));
    }).sort((left, right) => {
      if (studentRecordFilter !== 'incomplete') return 0;
      return Number(right.status === 'draft') - Number(left.status === 'draft');
    });
    const studentStatusMeta: Record<StudentCollectionRecordStatus, { label: string; className: string }> = {
      pending: { label: '未填写', className: 'bg-[var(--tm-bg-surface-muted)] text-[var(--tm-text-secondary)]' },
      draft: { label: '待继续', className: 'bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]' },
      completed: { label: '已完成', className: 'bg-[var(--tm-status-positive-soft)] text-[var(--tm-status-positive-strong)]' },
    };
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden pb-8">
        <PageHeader
          title="采集详情"
          onBack={() => setPageMode(assignedContext ? 'assigned-list' : record.status === 'archived' ? 'archived-list' : 'list')}
        />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 no-scrollbar">
          <section className="mt-4 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]">
            <div className="flex items-start gap-2">
              <div className="min-w-0 flex-1">
                <h2 className="text-balance text-[length:var(--tm-font-size-section-title)] font-bold leading-6 text-[var(--tm-text-primary)]">{record.title}</h2>
                {record.description && <p className="mt-1 whitespace-pre-wrap break-words text-pretty text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">{record.description}</p>}
              </div>
              <div className="-mr-2 -mt-2 flex shrink-0 items-center">
                <button
                  type="button"
                  aria-label="预览采集表"
                  title="预览采集表"
                  onClick={() => openDetailPreview(record)}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-[var(--tm-radius-control)] px-2.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] transition-[transform,background-color] active:scale-[0.96] active:bg-[var(--tm-brand-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2"
                >
                  <Eye className="h-4 w-4" />预览
                </button>
                {!assignedContext && <IconButton label="更多操作" onClick={() => setShowRecordMenu(true)}><MoreHorizontal className="h-5 w-5" /></IconButton>}
              </div>
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <div className="text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-secondary)]">完成进度</div>
              <div className="text-[length:var(--tm-font-size-page-title)] font-bold tabular-nums text-[var(--tm-text-primary)]">{completed}<span className="ml-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-tertiary)]">/{studentRecords.length}</span></div>
            </div>
            <div className="mt-2"><ProgressBar value={completion} tone={record.status === 'ended' || record.status === 'archived' ? 'neutral' : 'positive'} /></div>
          </section>

          <div className="sticky top-0 z-20 -mx-1 mt-4 bg-[var(--tm-bg-page-glass)] px-1 py-3 backdrop-blur-md">
            <label className="relative block">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
              <input value={studentRecordSearch} onChange={event => setStudentRecordSearch(event.target.value)} placeholder="搜索学生" aria-label="搜索学生" className="h-11 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] pl-10 pr-3 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]" />
            </label>
            <div className="mt-2 grid grid-cols-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1" role="tablist" aria-label="填写进度">
              {([['all', '全部'], ['incomplete', '待完成'], ['completed', '已完成']] as const).map(([value, label]) => (
                <button key={value} type="button" role="tab" aria-selected={studentRecordFilter === value} onClick={() => setStudentRecordFilter(value)} className={`min-h-11 rounded-[var(--tm-radius-control)] px-1 text-[length:var(--tm-font-size-meta)] font-semibold ${studentRecordFilter === value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>{label}</button>
              ))}
            </div>
          </div>

          <section className="overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
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
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden pb-24">
        <PageHeader title={studentRecord.studentName} onBack={() => setPageMode('detail')} />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-28 no-scrollbar">
          <div className="pb-3 pt-4">
            <div className="truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)]">{activeRecord.title}</div>
            <div className="mt-1 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">{studentRecord.className}</div>
          </div>
          <StudentCollectionForm
            record={activeRecord}
            answers={studentRecordAnswers}
            editable={editable}
            onAnswerChange={updateAnswer}
          />
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
    const completed = getQuestionnaireCompletedCount(record);
    const completion = getCompletionRate(record);
    const activeTargets = getActiveQuestionnaireTargets(record);
    const pending = Math.max(0, reachable - completed);
    const unreachable = activeTargets.length - reachable;
    return (
      <div className="space-y-3">
        <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">完成情况</div>
              <div className="mt-1 text-[length:var(--tm-font-size-metric)] font-bold tabular-nums text-[var(--tm-text-primary)]">{completed}<span className="ml-1 text-[length:var(--tm-font-size-card-title)] font-semibold text-[var(--tm-text-tertiary)]">/{reachable}</span></div>
            </div>
            <div className="space-y-1 text-right text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">
              <div>待提交 <span className="ml-1 font-semibold tabular-nums text-[var(--tm-brand-reward-strong)]">{pending}</span></div>
              <div>未绑定 <span className="ml-1 font-semibold tabular-nums text-[var(--tm-text-secondary)]">{unreachable}</span></div>
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
    const activeTargets = getActiveQuestionnaireTargets(record);
    const rows = responseFilter === 'completed'
      ? record.submissions
      : responseFilter === 'pending'
        ? activeTargets.filter(target => target.reachable && !submittedNos.has(target.studentNo))
        : activeTargets.filter(target => !target.reachable);
    return (
      <div>
        <div className="grid grid-cols-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1">
          {([['completed', '已完成'], ['pending', '未完成'], ['unreachable', '未绑定']] as const).map(([value, label]) => <button key={value} type="button" onClick={() => setResponseFilter(value)} className={`min-h-11 rounded-[var(--tm-radius-control)] px-1 text-[length:var(--tm-font-size-meta)] font-semibold ${responseFilter === value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>{label}</button>)}
        </div>
        <section className="mt-4 overflow-hidden rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]">
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
        if (question.type === 'multi_fill') {
          return (
            <section key={question.id} className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]">
              <div className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary-strong)]">{questionIndex + 1} · {questionTypeMeta[question.type].label}</div>
              <h3 className="mt-2 text-balance text-[length:var(--tm-font-size-body)] font-bold leading-5 text-[var(--tm-text-primary)]">{question.title}</h3>
              <div className="mt-3 divide-y divide-[var(--tm-border-subtle)]">
                {(question.subFields ?? []).map(subField => {
                  const subFieldAnswers = record.submissions
                    .map(submission => getQuestionnaireMultiFillValues(submission.answers[question.id])[subField.id]?.trim() ?? '')
                    .filter(Boolean);
                  const showAllInline = subFieldAnswers.length <= 5;
                  const visibleAnswers = showAllInline ? subFieldAnswers : subFieldAnswers.slice(-2).reverse();
                  const showEffectiveCount = subFieldAnswers.length !== record.submissions.length;
                  return (
                    <div key={subField.id} className="py-3 first:pt-1 last:pb-0">
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0 truncate text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-primary)]">{subField.label}</div>
                        {showEffectiveCount && <div className="shrink-0 text-[length:var(--tm-font-size-badge)] font-medium tabular-nums text-[var(--tm-text-tertiary)]">有效回答 {subFieldAnswers.length}</div>}
                      </div>
                      {visibleAnswers.length > 0
                        ? <div className="mt-2 space-y-2">{visibleAnswers.map((answer, index) => <div key={`${subField.id}-${index}`} className={`rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3 py-2.5 text-pretty text-[length:var(--tm-font-size-meta)] font-medium leading-5 text-[var(--tm-text-secondary)] ${showAllInline ? '' : 'line-clamp-3'}`}>{answer}</div>)}</div>
                        : <div className="mt-2 py-2 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">暂无回答</div>}
                      {!showAllInline && (
                        <button type="button" onClick={() => openQuestionResponses(question.id, subField.id)} className="mt-2 flex min-h-11 w-full items-center justify-between rounded-[var(--tm-radius-control)] px-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] transition-[transform,background-color] active:scale-[0.96] active:bg-[var(--tm-brand-primary-soft)]">
                          查看全部回答<ChevronRight className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        }
        if (question.type === 'text') {
          const textAnswers = answers.map(answer => String(answer).trim()).filter(Boolean);
          const keywords = getFrequentKeywords(textAnswers);
          const showAllInline = textAnswers.length <= 5;
          const visibleAnswers = showAllInline ? textAnswers : textAnswers.slice(-2).reverse();
          const showEffectiveCount = textAnswers.length !== record.submissions.length;
          return (
            <section key={question.id} className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]">
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
          <section key={question.id} className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]">
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
    const detailPreviewLabel = '预览采集内容';
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden pb-8">
        <PageHeader title="采集详情" onBack={() => setPageMode(activeRecord.status === 'archived' ? 'archived-list' : 'list')} />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 no-scrollbar">
          <section className="mt-4 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]">
            <div className="flex items-start gap-3">
              <div className="min-w-0 flex-1">
                <h2 className="text-balance text-[length:var(--tm-font-size-section-title)] font-bold leading-6 text-[var(--tm-text-primary)]">{activeRecord.title}</h2>
                {activeRecord.description && <p className="mt-1 whitespace-pre-wrap break-words text-pretty text-[length:var(--tm-font-size-compact)] font-medium leading-5 text-[var(--tm-text-secondary)]">{activeRecord.description}</p>}
              </div>
              <div className="-mr-2 -mt-2 flex shrink-0 items-center">
                <button
                  type="button"
                  aria-label={detailPreviewLabel}
                  title={detailPreviewLabel}
                  onClick={() => openDetailPreview(activeRecord)}
                  className="inline-flex min-h-11 shrink-0 items-center gap-1.5 rounded-[var(--tm-radius-control)] px-2.5 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] transition-[transform,background-color] active:scale-[0.96] active:bg-[var(--tm-brand-primary-soft)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-brand-primary)] focus-visible:ring-offset-2"
                >
                  <Eye className="h-4 w-4" />预览
                </button>
                <IconButton label="更多操作" onClick={() => setShowRecordMenu(true)}><MoreHorizontal className="h-5 w-5" /></IconButton>
              </div>
            </div>
            {activeRecord.suggestedDeadline && (
              <div className="mt-2.5 inline-flex items-center gap-1.5 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">
                <CalendarDays className="h-3.5 w-3.5 shrink-0 text-[var(--tm-text-tertiary)]" />
                {formatSuggestedDeadline(activeRecord.suggestedDeadline)}
              </div>
            )}
          </section>
          <div className="sticky top-0 z-20 -mx-1 mt-4 grid grid-cols-2 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] p-1 backdrop-blur" role="tablist">
            {([['data', '数据'], ['responses', '答卷']] as const).map(([value, label]) => <button key={value} type="button" role="tab" aria-selected={detailTab === value} onClick={() => setDetailTab(value)} className={`min-h-11 rounded-[var(--tm-radius-control)] px-2 text-[length:var(--tm-font-size-compact)] font-semibold transition-[color,background-color,box-shadow] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] ${detailTab === value ? 'bg-[var(--tm-bg-surface)] text-[var(--tm-text-primary)] [box-shadow:var(--tm-shadow-control)]' : 'text-[var(--tm-text-secondary)]'}`}>{label}</button>)}
          </div>
          <div className="mt-4">{detailTab === 'data' ? renderData(activeRecord) : renderResponses(activeRecord)}</div>
        </main>
        <BottomSheet open={showRecordMenu} label="采集操作" onDismiss={() => setShowRecordMenu(false)}>
          {activeRecord.status === 'archived' && <button type="button" onClick={restoreActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-brand-primary-strong)]"><ArchiveRestore className="h-5 w-5" />恢复到已结束</button>}
          <button type="button" onClick={duplicateActiveRecord} className="flex min-h-[56px] w-full items-center gap-3 border-b border-[var(--tm-border-subtle)] text-left text-[length:var(--tm-font-size-body)] font-semibold text-[var(--tm-text-primary)]"><Copy className="h-5 w-5 text-[var(--tm-text-tertiary)]" />复制为新采集</button>
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
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
        <PageHeader title={getSubmissionDetailTitle(activeRecord)} onBack={() => setPageMode('detail')} />
        <main className="min-h-0 flex-1 touch-pan-y space-y-3 overflow-y-auto overscroll-contain px-5 py-4 no-scrollbar">
          <div className="flex items-center gap-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-status-positive-soft)] px-4 py-3 text-[var(--tm-status-positive-strong)]">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="truncate text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-text-primary)]">{activeSubmission.studentName}<span className="ml-2 text-[length:var(--tm-font-size-meta)] font-medium text-current opacity-75">{activeSubmission.guardianRelation}</span></div>
              <div className="mt-0.5 truncate text-[length:var(--tm-font-size-badge)] font-semibold">已提交 · {activeSubmission.submittedAt}</div>
            </div>
          </div>
          {activeRecord.questions.map((question, index) => {
            const answer = activeSubmission.answers[question.id];
            return <section key={question.id} className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]"><div className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary-strong)]">第{index + 1}题 · {questionTypeMeta[question.type].label}</div><h3 className="mt-2 text-balance text-[length:var(--tm-font-size-body)] font-bold leading-5 text-[var(--tm-text-primary)]">{question.title}</h3><div className="mt-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-soft)] px-3 py-2.5 text-pretty text-[length:var(--tm-font-size-compact)] font-semibold leading-5 text-[var(--tm-text-secondary)]">{formatQuestionnaireAnswer(answer, question)}</div></section>;
          })}
        </main>
      </div>
    );
  };

  const renderQuestionResponses = () => {
    if (!activeRecord) return renderList();
    const question = activeRecord.questions.find(item => item.id === activeQuestionId);
    const activeSubField = question?.type === 'multi_fill'
      ? question.subFields?.find(subField => subField.id === activeQuestionSubFieldId)
      : undefined;
    if (!question || (question.type !== 'text' && !activeSubField)) return renderDetail();
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
        answer: question.type === 'text'
          ? typeof answer === 'string' ? answer.trim() : ''
          : activeSubField ? getQuestionnaireMultiFillValues(answer)[activeSubField.id]?.trim() ?? '' : '',
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
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
        <PageHeader title="全部回答" onBack={() => setPageMode('detail')} />
        <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-8 no-scrollbar">
          <section className="pt-4">
            <div className="text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-brand-primary-strong)]">第{questionIndex + 1}题 · {questionTypeMeta[question.type].label}</div>
            <h2 className="mt-2 text-balance text-[length:var(--tm-font-size-section-title)] font-bold leading-6 text-[var(--tm-text-primary)]">{question.title}</h2>
            {activeSubField && <div className="mt-1 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">{activeSubField.label}</div>}
          </section>
          <div className="sticky top-0 z-20 -mx-1 mt-4 bg-[var(--tm-bg-page-glass)] px-1 py-3 backdrop-blur-md">
            <div className={`grid gap-2 ${classOptions.length > 1 ? 'grid-cols-[minmax(0,1fr)_120px]' : 'grid-cols-1'}`}>
              <label className="relative block">
                <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--tm-text-tertiary)]" />
                <input value={questionResponseSearch} onChange={event => { setQuestionResponseSearch(event.target.value); setVisibleQuestionResponseCount(20); }} placeholder="搜索回答或学生" aria-label="搜索回答或学生" className="h-11 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] pl-10 pr-3 text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]" />
              </label>
              {classOptions.length > 1 && (
                <label className="relative block">
                  <select value={questionResponseClass} onChange={event => { setQuestionResponseClass(event.target.value); setVisibleQuestionResponseCount(20); }} aria-label="按班级筛选回答" className="h-11 w-full appearance-none rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] pl-3 pr-8 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]">
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
              <article key={row.id} className="rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]">
                <p className="text-pretty text-[length:var(--tm-font-size-body)] font-medium leading-6 text-[var(--tm-text-secondary)]">{row.answer}</p>
                <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-[length:var(--tm-font-size-badge)] font-medium text-[var(--tm-text-tertiary)]">
                  <span>{row.studentName}</span><span aria-hidden="true">·</span><span>{row.className}</span><span aria-hidden="true">·</span><span>{row.submittedAt}</span>
                </div>
              </article>
            ))}
            {visibleRows.length === 0 && <div className="py-14 text-center text-[length:var(--tm-font-size-compact)] font-medium text-[var(--tm-text-tertiary)]">暂无匹配回答</div>}
          </div>
          {filteredRows.length > visibleRows.length && (
            <button type="button" onClick={() => setVisibleQuestionResponseCount(count => count + 20)} className="mt-4 min-h-11 w-full rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-brand-primary-strong)] [box-shadow:var(--tm-shadow-card)] active:scale-[0.96]">加载更多</button>
          )}
        </main>
      </div>
    );
  };

  const renderPreview = () => {
    if (!previewRecord) return renderList();
    const previewTarget = getActiveQuestionnaireTargets(previewRecord)[0];
    if (getQuestionnaireCollectionMode(previewRecord) === 'student_information') {
      return (
        <div className="relative flex h-full min-h-0 flex-col overflow-hidden pb-24" style={questionnaireThemeCssVariables as React.CSSProperties}>
          <PageHeader title={previewTarget?.studentName ?? '学生'} onBack={() => setPageMode(previewReturnMode)} />
          <main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain bg-[var(--tm-bg-page)] px-5 pb-28 no-scrollbar">
            <div className="pb-5 pt-5">
              <h1 className="text-pretty text-[length:var(--tm-font-size-document-title)] font-bold leading-8 text-[var(--tm-text-primary)]">{previewRecord.title}</h1>
              {previewTarget?.className && <div className="mt-1 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-tertiary)]">{previewTarget.className}</div>}
              {previewRecord.description && <p className="mt-2 whitespace-pre-wrap break-words text-pretty text-[length:var(--tm-font-size-body)] font-medium leading-[22px] text-[var(--tm-text-secondary)]">{previewRecord.description}</p>}
            </div>
            <StudentCollectionForm
              record={previewRecord}
              answers={previewAnswers}
              editable
              onAnswerChange={(questionId, answer) => setPreviewAnswers(previous => ({ ...previous, [questionId]: answer }))}
            />
          </main>
          <BottomAction>
            <PrimaryButton onClick={() => setPageMode(previewReturnMode)} className="w-full">结束预览</PrimaryButton>
          </BottomAction>
        </div>
      );
    }
    return (
      <div className="relative flex h-full min-h-0 flex-col overflow-hidden">
        <AssignedQuestionnaireView
          questionnaire={previewRecord}
          child={{
            name: previewTarget?.studentName ?? '学生',
            studentNo: previewTarget?.studentNo ?? 'questionnaire-preview',
          }}
          guardianRelation="家长"
          onBack={() => setPageMode(previewReturnMode)}
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
      {toast && <div className="pointer-events-none absolute left-1/2 top-16 z-[70] -translate-x-1/2 whitespace-nowrap rounded-full bg-[var(--tm-text-primary)] px-4 py-2 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-inverse)] [box-shadow:var(--tm-shadow-card-raised)]">{toast}</div>}
    </div>
  );
};

export default QuestionnaireManagementView;
