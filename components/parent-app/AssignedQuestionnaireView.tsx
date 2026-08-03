import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, Circle, Send } from 'lucide-react';
import {
  getQuestionnaireAnswerValidationError,
  getQuestionnaireContentType,
  getQuestionnaireMultiFillValues,
  getQuestionnaireSelectedOptions,
  isQuestionnaireChoiceAnswer,
  submitQuestionnaireResponse,
  type QuestionnaireAnswer,
  type QuestionnaireQuestion,
  type QuestionnaireRecord,
} from '../../shared/questionnaireStore';
import { persistGrowthCollectionAnswers } from '../../shared/growthCollectionPersistence';
import { persistArchiveCollectionAnswers } from '../../shared/archiveCollectionPersistence';
import { normalizeFormFieldSettings } from '../../shared/formDefinition';
import { questionnaireThemeCssVariables } from '../../shared/questionnaireThemeTokens';
import {
  ParentBottomSheet,
} from './ParentUI';

interface AssignedQuestionnaireViewProps {
  questionnaire: QuestionnaireRecord;
  child: {
    name: string;
    studentNo: string;
  };
  guardianRelation: string;
  onBack: () => void;
  onSubmitted: () => void;
  preview?: boolean;
}

const getQuestionTypeLabel = (question: QuestionnaireQuestion) => ({
  single: '单选',
  multiple: '多选',
  rating: `${normalizeFormFieldSettings(question.type, question.settings, question.options).ratingMin ?? 1}-${normalizeFormFieldSettings(question.type, question.settings, question.options).ratingMax ?? 5}分`,
  text: '问答',
  multi_fill: '多项填空',
  short_text: '填空',
  number: '数字',
  date: '日期',
}[question.type]);

const questionnaireButtonBase = 'inline-flex min-h-[52px] items-center justify-center gap-2 rounded-[var(--tm-radius-control)] px-4 text-[length:var(--tm-font-size-card-title)] font-bold transition-[transform,background-color,box-shadow,opacity] [transition-duration:var(--tm-duration-fast)] active:scale-[0.96] disabled:cursor-not-allowed disabled:opacity-45 disabled:active:scale-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--tm-input-focus-ring)]';
const questionnairePrimaryButton = `${questionnaireButtonBase} bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)] shadow-[var(--tm-shadow-control)] active:bg-[var(--tm-brand-primary-pressed)]`;
const questionnaireSecondaryButton = `${questionnaireButtonBase} border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]`;
const questionnaireInputClass = 'w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)] px-4 text-[length:var(--tm-font-size-control)] font-medium text-[var(--tm-text-primary)] outline-none transition-[border-color,background-color,box-shadow] [transition-duration:var(--tm-duration-fast)] placeholder:text-[var(--tm-text-tertiary)] focus:border-[var(--tm-brand-primary)] focus:bg-[var(--tm-bg-surface)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]';

const AssignedQuestionnaireView: React.FC<AssignedQuestionnaireViewProps> = ({
  questionnaire,
  child,
  guardianRelation,
  onBack,
  onSubmitted,
  preview = false,
}) => {
  const returnedSubmission = questionnaire.growthTemplate === 'semester_goal'
    ? questionnaire.submissions.find(submission => (
        submission.studentNo === child.studentNo
        && submission.reviewStatus === 'returned'
      ))
    : undefined;
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionnaireAnswer>>(() => ({
    ...(returnedSubmission?.answers ?? {}),
  }));
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const question = questionnaire.questions[stepIndex];
  const currentSection = questionnaire.layoutMode === 'grouped'
    ? questionnaire.sections?.find(section => section.id === question?.sectionId)
    : undefined;
  const progress = Math.round(((stepIndex + 1) / Math.max(1, questionnaire.questions.length)) * 100);
  const currentAnswer = question ? answers[question.id] : undefined;
  const selectedOptions = getQuestionnaireSelectedOptions(currentAnswer);
  const currentCustomText = isQuestionnaireChoiceAnswer(currentAnswer) ? currentAnswer.customText : {};
  const currentFillValues = getQuestionnaireMultiFillValues(currentAnswer);
  const isLastQuestion = stepIndex === questionnaire.questions.length - 1;
  const ratingValues = question?.type === 'rating'
    ? (question.options.length > 0 ? question.options : ['1', '2', '3', '4', '5'])
    : [];
  const canContinue = useMemo(() => !question || !getQuestionnaireAnswerValidationError(question, currentAnswer), [currentAnswer, question]);

  if (!question) return null;

  if (!preview && questionnaire.status !== 'active') {
    return (
      <div className="relative flex-1 overflow-y-auto bg-[var(--tm-bg-page)] pb-8 text-[var(--tm-text-primary)] no-scrollbar" style={questionnaireThemeCssVariables as React.CSSProperties}>
        <header className="sticky top-0 z-40 border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-page-glass)] px-4 py-3 backdrop-blur-xl [padding-right:max(16px,var(--mini-program-capsule-right-inset,16px))]">
          <div className="flex min-h-11 items-center gap-3">
            <button type="button" onClick={onBack} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-transform active:scale-[0.96] active:bg-[var(--tm-bg-surface-muted)]" aria-label="返回待办"><ArrowLeft size={18} /></button>
            <div className="truncate text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">{questionnaire.title}</div>
          </div>
        </header>
        <section className="mx-5 mt-5 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-6 text-center shadow-[var(--tm-shadow-card)]">
          <div className="text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]">问卷已结束</div>
          <button type="button" onClick={onBack} className={`${questionnaireSecondaryButton} mt-5 w-full`}>返回待办</button>
        </section>
      </div>
    );
  }

  const toggleOption = (option: string) => {
    if (question.type === 'single' || question.type === 'multiple') {
      const nextSelected = question.type === 'multiple'
        ? selectedOptions.includes(option)
          ? selectedOptions.filter(item => item !== option)
          : selectedOptions.length >= (normalizeFormFieldSettings(question.type, question.settings, question.options).maxSelections ?? question.options.length)
            ? selectedOptions
            : [...selectedOptions, option]
        : [option];
      const nextCustomText = Object.fromEntries(
        Object.entries(currentCustomText).filter(([key]) => nextSelected.includes(key)),
      );
      setAnswers(previous => ({
        ...previous,
        [question.id]: { selectedOptions: nextSelected, customText: nextCustomText },
      }));
      return;
    }
    setAnswers(previous => ({ ...previous, [question.id]: Number(option) }));
  };

  const updateCustomText = (option: string, value: string) => {
    setAnswers(previous => ({
      ...previous,
      [question.id]: {
        selectedOptions,
        customText: { ...currentCustomText, [option]: value },
      },
    }));
  };

  const updateFillValue = (subFieldId: string, value: string) => {
    setAnswers(previous => ({
      ...previous,
      [question.id]: { fillValues: { ...currentFillValues, [subFieldId]: value } },
    }));
  };

  const submit = () => {
    const submittedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
    const submitted = submitQuestionnaireResponse(questionnaire.id, {
      id: `${questionnaire.id}-${child.studentNo}-${Date.now()}`,
      studentNo: child.studentNo,
      studentName: child.name,
      guardianRelation,
      submittedAt,
      answers,
    });
    if (!submitted) {
      setSubmitError('问卷已结束或已经提交');
      return;
    }
    if (getQuestionnaireContentType(questionnaire) !== 'ordinary') {
      persistGrowthCollectionAnswers(questionnaire, child.studentNo, answers, submittedAt);
    }
    if (questionnaire.archiveTemplateId) {
      persistArchiveCollectionAnswers(questionnaire, child.studentNo, answers, guardianRelation);
    }
    setShowSubmitConfirm(false);
    onSubmitted();
  };

  return (
    <div className="relative flex-1 overflow-y-auto bg-[var(--tm-bg-page)] pb-36 text-[var(--tm-text-primary)] antialiased no-scrollbar" style={questionnaireThemeCssVariables as React.CSSProperties}>
      <header className="sticky top-0 z-40 border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-page-glass)] px-4 py-3 backdrop-blur-xl [padding-right:max(16px,var(--mini-program-capsule-right-inset,16px))]">
        <div className="flex min-h-11 items-center gap-3">
          <button type="button" onClick={onBack} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[var(--tm-text-secondary)] transition-transform active:scale-[0.96] active:bg-[var(--tm-bg-surface-muted)]" aria-label={preview ? '退出预览' : '返回待办'}>
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex justify-end"><span className="shrink-0 tabular-nums text-[length:var(--tm-font-size-compact)] font-bold text-[var(--tm-text-secondary)]">{stepIndex + 1}/{questionnaire.questions.length}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-[var(--tm-bg-surface-muted)]" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-[var(--tm-questionnaire-progress)] transition-[width] [transition-duration:var(--tm-duration-panel)]" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </header>

      <section className="mx-5 mt-5">
        {stepIndex === 0 && (
          <header className="mb-5 px-1">
            <h1 className="break-words text-[length:var(--tm-font-size-document-title)] font-bold leading-8 text-[var(--tm-text-primary)]">{questionnaire.title}</h1>
            {questionnaire.description && <p className="mt-2 whitespace-pre-wrap break-words text-[length:var(--tm-font-size-body)] font-medium leading-[22px] text-[var(--tm-text-secondary)]">{questionnaire.description}</p>}
          </header>
        )}
        {currentSection && <div className="mb-2 px-1 text-[length:var(--tm-font-size-form-group-label)] font-semibold leading-5 text-[var(--tm-text-secondary)]">{currentSection.label}</div>}
        <section className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-5 shadow-[var(--tm-shadow-card)]">
          <div className="mb-2 text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-tertiary)]">{getQuestionTypeLabel(question)}</div>
          <h2 className="break-words text-[length:var(--tm-font-size-question-title)] font-bold leading-[1.45] text-[var(--tm-text-primary)]">
            {question.title}{question.required && question.type !== 'multi_fill' && <span className="ml-1 text-[var(--tm-status-negative-strong)]" aria-label="必填">*</span>}
          </h2>

          {(question.type === 'single' || question.type === 'multiple') && (
            <div className="mt-5 space-y-2.5">
              {question.options.map(option => {
                const selected = selectedOptions.includes(option);
                const showCustomInput = selected && question.customAnswerOptions?.includes(option);
                return (
                  <div key={option} className={`overflow-hidden rounded-[var(--tm-radius-inner)] border ${selected ? 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface-soft)]' : 'border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]'}`}>
                    <button
                      type="button"
                      onClick={() => toggleOption(option)}
                      aria-pressed={selected}
                      className="flex min-h-[52px] w-full items-center gap-3 px-4 py-3 text-left transition-transform active:scale-[0.98]"
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center border ${question.type === 'single' ? 'rounded-full' : 'rounded-[6px]'} ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]'}`}>
                        {selected && (question.type === 'single' ? <Circle size={9} fill="currentColor" /> : <Check size={13} strokeWidth={3} />)}
                      </span>
                      <span className="text-[length:var(--tm-font-size-control)] font-medium leading-snug text-[var(--tm-text-primary)]">{option}</span>
                    </button>
                    {showCustomInput && (
                      <div className="px-4 pb-4">
                        <input
                          value={currentCustomText[option] ?? ''}
                          onChange={event => updateCustomText(option, event.target.value)}
                          maxLength={120}
                          placeholder="请补充填写"
                          aria-label={`${option}补充内容`}
                          className={`${questionnaireInputClass} h-[52px] px-3.5`}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {question.type === 'rating' && (
            <div className="mt-6">
              <div className="grid grid-cols-5 justify-items-center gap-2.5">
                {ratingValues.map(option => {
                  const value = Number(option);
                  const selected = Number(currentAnswer) === value;
                  return (
                    <button key={value} type="button" onClick={() => toggleOption(String(value))} aria-pressed={selected} className={`flex h-11 w-11 items-center justify-center rounded-full text-[length:var(--tm-font-size-control)] font-semibold transition active:scale-[0.96] ${selected ? 'bg-[var(--tm-brand-primary)] text-[var(--tm-text-inverse)] shadow-[var(--tm-shadow-control)]' : 'bg-[var(--tm-bg-surface-soft)] text-[var(--tm-text-secondary)] ring-1 ring-[var(--tm-border-subtle)]'}`}>{value}</button>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-between text-[length:var(--tm-font-size-badge)] font-semibold text-[var(--tm-text-tertiary)]"><span>低</span><span>高</span></div>
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={event => setAnswers(previous => ({ ...previous, [question.id]: event.target.value }))}
              rows={5}
              maxLength={300}
              placeholder="请输入您的回答"
              className={`${questionnaireInputClass} mt-5 min-h-[132px] resize-none py-3 leading-relaxed`}
            />
          )}

          {question.type === 'multi_fill' && (
            <div className="mt-5 space-y-4">
              {(question.subFields ?? []).map((subField, subFieldIndex) => (
                <label key={subField.id} className="block">
                  <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">{subField.label}{subField.required && <span className="ml-1 text-[var(--tm-status-negative-strong)]" aria-hidden="true">*</span>}</span>
                  <input
                    value={currentFillValues[subField.id] ?? ''}
                    onChange={event => updateFillValue(subField.id, event.target.value)}
                    maxLength={120}
                    placeholder="请输入"
                    required={subField.required}
                    enterKeyHint={subFieldIndex === (question.subFields?.length ?? 0) - 1 ? 'done' : 'next'}
                    className={`${questionnaireInputClass} mt-2 h-[52px] px-3.5`}
                  />
                </label>
              ))}
            </div>
          )}

          {question.type === 'date' && (() => {
            const dateFormat = normalizeFormFieldSettings(question.type, question.settings, question.options).dateFormat ?? 'ymd';
            return <input type={dateFormat === 'year' ? 'number' : dateFormat === 'ym' ? 'month' : 'date'} inputMode={dateFormat === 'year' ? 'numeric' : undefined} min={dateFormat === 'year' ? 1900 : undefined} max={dateFormat === 'year' ? 2100 : undefined} value={typeof currentAnswer === 'string' || typeof currentAnswer === 'number' ? currentAnswer : ''} onChange={event => setAnswers(previous => ({ ...previous, [question.id]: event.target.value }))} className={`${questionnaireInputClass} mt-5 h-[52px]`} />;
          })()}

          {question.type === 'number' && (() => {
            const settings = normalizeFormFieldSettings(question.type, question.settings, question.options);
            const numberFormat = settings.numberFormat ?? 'integer';
            const step = numberFormat === 'integer' ? 1 : numberFormat === 'decimal-1' ? 0.1 : 0.01;
            return <input type="number" inputMode="decimal" min={settings.minValue} max={settings.maxValue} step={step} value={typeof currentAnswer === 'string' || typeof currentAnswer === 'number' ? currentAnswer : ''} onChange={event => setAnswers(previous => ({ ...previous, [question.id]: event.target.value }))} placeholder="请输入数字" className={`${questionnaireInputClass} mt-5 h-[52px]`} />;
          })()}
        </section>
      </section>

      <div className="absolute inset-x-0 bottom-0 z-30 border-t border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl">
        <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
          <button type="button" onClick={() => setStepIndex(index => Math.max(0, index - 1))} disabled={stepIndex === 0} className={questionnaireSecondaryButton}>上一题</button>
          <button
            type="button"
            disabled={!preview && !canContinue}
            onClick={() => isLastQuestion ? preview ? onBack() : setShowSubmitConfirm(true) : setStepIndex(index => Math.min(questionnaire.questions.length - 1, index + 1))}
            className={questionnairePrimaryButton}
          >
            {isLastQuestion ? preview ? '结束预览' : <><Send size={16} />提交</> : '下一题'}
          </button>
        </div>
      </div>

      {showSubmitConfirm && (
        <ParentBottomSheet title="确认提交" onClose={() => setShowSubmitConfirm(false)} className="pb-8">
          <div className="rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface-soft)] p-4">
            <div className="text-[length:var(--tm-font-size-section-title)] font-bold leading-tight text-[var(--tm-text-primary)]">{questionnaire.title}</div>
            <div className="mt-2 text-[length:var(--tm-font-size-compact)] font-semibold leading-relaxed text-[var(--tm-text-secondary)]">{getQuestionnaireContentType(questionnaire) === 'ordinary' ? '提交后老师将看到本次答卷。' : '提交后将同时更新孩子的成长信息。'}</div>
          </div>
          {submitError && <div role="alert" className="mt-3 rounded-[var(--tm-radius-control)] bg-[var(--tm-status-negative-soft)] px-4 py-3 text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-status-negative-strong)]">{submitError}</div>}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button type="button" onClick={() => setShowSubmitConfirm(false)} className={questionnaireSecondaryButton}>我再看看</button>
            <button type="button" onClick={submit} className={questionnairePrimaryButton}>确认提交</button>
          </div>
        </ParentBottomSheet>
      )}
    </div>
  );
};

export default AssignedQuestionnaireView;
