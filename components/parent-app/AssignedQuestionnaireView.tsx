import React, { useMemo, useState } from 'react';
import { ArrowLeft, Check, Circle, Send } from 'lucide-react';
import {
  getQuestionnaireSelectedOptions,
  isQuestionnaireChoiceAnswer,
  submitQuestionnaireResponse,
  type QuestionnaireAnswer,
  type QuestionnaireQuestion,
  type QuestionnaireRecord,
} from '../../shared/questionnaireStore';
import {
  ParentBottomSheet,
  ParentCard,
  ParentPageShell,
  ParentPrimaryButton,
  ParentSecondaryButton,
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
  rating: '1-5分',
  text: '简答',
}[question.type]);

const AssignedQuestionnaireView: React.FC<AssignedQuestionnaireViewProps> = ({
  questionnaire,
  child,
  guardianRelation,
  onBack,
  onSubmitted,
  preview = false,
}) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, QuestionnaireAnswer>>({});
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const question = questionnaire.questions[stepIndex];
  const progress = Math.round(((stepIndex + 1) / Math.max(1, questionnaire.questions.length)) * 100);
  const currentAnswer = question ? answers[question.id] : undefined;
  const selectedOptions = getQuestionnaireSelectedOptions(currentAnswer);
  const currentCustomText = isQuestionnaireChoiceAnswer(currentAnswer) ? currentAnswer.customText : {};
  const isLastQuestion = stepIndex === questionnaire.questions.length - 1;
  const canContinue = useMemo(() => {
    if (!question || !question.required) return true;
    if (question.type === 'single' || question.type === 'multiple') {
      if (selectedOptions.length === 0) return false;
      return selectedOptions.every(option => (
        !question.customAnswerOptions?.includes(option) || Boolean(currentCustomText[option]?.trim())
      ));
    }
    return currentAnswer !== undefined && String(currentAnswer).trim().length > 0;
  }, [currentAnswer, currentCustomText, question, selectedOptions]);

  if (!question) return null;

  if (!preview && questionnaire.status !== 'active') {
    return (
      <ParentPageShell className="pb-8">
        <header className="sticky top-0 z-40 border-b border-white/60 bg-white/78 px-4 py-3 backdrop-blur-xl">
          <div className="flex min-h-10 items-center gap-3">
            <button type="button" onClick={onBack} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm active:scale-[0.96]" aria-label="返回待办"><ArrowLeft size={18} /></button>
            <div className="truncate text-[16px] font-black text-slate-800">{questionnaire.title}</div>
          </div>
        </header>
        <ParentCard as="section" className="mx-5 mt-5 p-6 text-center">
          <div className="text-[17px] font-black text-slate-800">问卷已结束</div>
          <ParentSecondaryButton type="button" onClick={onBack} fullWidth className="mt-5 h-12">返回待办</ParentSecondaryButton>
        </ParentCard>
      </ParentPageShell>
    );
  }

  const toggleOption = (option: string) => {
    if (question.type === 'single' || question.type === 'multiple') {
      const nextSelected = question.type === 'multiple'
        ? selectedOptions.includes(option)
          ? selectedOptions.filter(item => item !== option)
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

  const submit = () => {
    const submitted = submitQuestionnaireResponse(questionnaire.id, {
      id: `${questionnaire.id}-${child.studentNo}-${Date.now()}`,
      studentNo: child.studentNo,
      studentName: child.name,
      guardianRelation,
      submittedAt: new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-'),
      answers,
    });
    if (!submitted) {
      setSubmitError('问卷已结束或已经提交');
      return;
    }
    setShowSubmitConfirm(false);
    onSubmitted();
  };

  return (
    <ParentPageShell className="pb-36">
      <header className="sticky top-0 z-40 border-b border-white/60 bg-white/78 px-4 py-3 backdrop-blur-xl">
        <div className="flex min-h-10 items-center gap-3">
          <button type="button" onClick={onBack} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition-transform active:scale-[0.96]" aria-label={preview ? '退出预览' : '返回待办'}>
            <ArrowLeft size={18} />
          </button>
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center justify-between gap-3">
              <span className="truncate text-[13px] font-black text-slate-600">{questionnaire.title}</span>
              <span className="shrink-0 tabular-nums text-[13px] font-black text-emerald-600">{stepIndex + 1}/{questionnaire.questions.length}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-slate-100" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100}>
              <div className="h-full rounded-full bg-gradient-to-r from-[#0DB4F1] to-[#18D0A8] transition-[width] duration-300" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>
      </header>

      <section className="mx-5 mt-4">
        <ParentCard as="section" className="p-5">
          <div className="mb-3 flex items-center justify-between gap-3">
            <span className="inline-flex rounded-full bg-sky-50 px-3 py-1.5 text-[12px] font-black text-sky-600">{getQuestionTypeLabel(question)}</span>
            {question.required && <span className="text-[11px] font-bold text-slate-400">必答</span>}
          </div>
          <h2 className="break-words text-[18px] font-black leading-[1.4] text-slate-950">{question.title}</h2>

          {(question.type === 'single' || question.type === 'multiple') && (
            <div className="mt-5 space-y-2.5">
              {question.options.map(option => {
                const selected = selectedOptions.includes(option);
                const showCustomInput = selected && question.customAnswerOptions?.includes(option);
                return (
                  <div key={option} className={`overflow-hidden rounded-[16px] border ${selected ? 'border-[#18D0A8] bg-emerald-50/60' : 'border-slate-100 bg-white'}`}>
                    <button
                      type="button"
                      onClick={() => toggleOption(option)}
                      aria-pressed={selected}
                      className="flex min-h-[56px] w-full items-center gap-3 px-4 py-3 text-left transition-transform active:scale-[0.98]"
                    >
                      <span className={`flex h-5 w-5 shrink-0 items-center justify-center border ${question.type === 'single' ? 'rounded-full' : 'rounded-[6px]'} ${selected ? 'border-[#18D0A8] bg-[#18D0A8] text-white' : 'border-slate-300 bg-white'}`}>
                        {selected && (question.type === 'single' ? <Circle size={9} fill="currentColor" /> : <Check size={13} strokeWidth={3} />)}
                      </span>
                      <span className="text-[15px] font-bold leading-snug text-slate-800">{option}</span>
                    </button>
                    {showCustomInput && (
                      <div className="px-4 pb-4">
                        <input
                          value={currentCustomText[option] ?? ''}
                          onChange={event => updateCustomText(option, event.target.value)}
                          maxLength={120}
                          placeholder="请补充填写"
                          aria-label={`${option}补充内容`}
                          className="h-12 w-full rounded-[14px] border border-emerald-100 bg-white px-3.5 text-[15px] font-bold text-slate-800 outline-none transition focus:border-[#0DB4F1] focus:ring-4 focus:ring-cyan-100/60"
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
              <div className="flex items-center justify-between gap-1">
                {[1, 2, 3, 4, 5].map(value => {
                  const selected = Number(currentAnswer) === value;
                  return (
                    <button key={value} type="button" onClick={() => toggleOption(String(value))} aria-pressed={selected} className={`flex aspect-square min-w-0 flex-1 max-w-12 items-center justify-center rounded-full text-[16px] font-black transition active:scale-[0.96] ${selected ? 'bg-gradient-to-br from-[#0DB4F1] to-[#18D0A8] text-white shadow-[0_12px_24px_-16px_rgba(13,180,241,0.8)]' : 'bg-slate-50 text-slate-500 ring-1 ring-slate-100'}`}>{value}</button>
                  );
                })}
              </div>
              <div className="mt-3 flex justify-between text-[11px] font-bold text-slate-400"><span>不满意</span><span>非常满意</span></div>
            </div>
          )}

          {question.type === 'text' && (
            <textarea
              value={typeof currentAnswer === 'string' ? currentAnswer : ''}
              onChange={event => setAnswers(previous => ({ ...previous, [question.id]: event.target.value }))}
              rows={5}
              maxLength={300}
              placeholder="请输入您的回答"
              className="mt-5 min-h-[132px] w-full resize-none rounded-[16px] border border-slate-100 bg-slate-50 px-4 py-3 text-[15px] font-bold leading-relaxed text-slate-800 outline-none transition focus:border-[#0DB4F1] focus:bg-white focus:ring-4 focus:ring-cyan-100/60"
            />
          )}
        </ParentCard>
      </section>

      <div className="absolute inset-x-0 bottom-0 z-30 border-t border-white/70 bg-white/88 px-5 pb-[calc(16px+env(safe-area-inset-bottom))] pt-4 backdrop-blur-xl">
        <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
          <ParentSecondaryButton type="button" onClick={() => setStepIndex(index => Math.max(0, index - 1))} disabled={stepIndex === 0} className="h-[52px] text-[16px]">上一题</ParentSecondaryButton>
          <ParentPrimaryButton
            type="button"
            disabled={!preview && !canContinue}
            onClick={() => isLastQuestion ? preview ? onBack() : setShowSubmitConfirm(true) : setStepIndex(index => Math.min(questionnaire.questions.length - 1, index + 1))}
            className="h-[52px] text-[16px]"
          >
            {isLastQuestion ? preview ? '结束预览' : <><Send size={16} />提交</> : '下一题'}
          </ParentPrimaryButton>
        </div>
      </div>

      {showSubmitConfirm && (
        <ParentBottomSheet title="确认提交" onClose={() => setShowSubmitConfirm(false)} className="pb-8">
          <div className="rounded-[20px] bg-slate-50/90 p-4">
            <div className="text-[16px] font-black leading-tight text-slate-900">{questionnaire.title}</div>
            <div className="mt-2 text-[13px] font-bold leading-relaxed text-slate-500">提交后老师将看到本次答卷。</div>
          </div>
          {submitError && <div role="alert" className="mt-3 rounded-[14px] bg-rose-50 px-4 py-3 text-[13px] font-bold text-rose-600">{submitError}</div>}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <ParentSecondaryButton type="button" onClick={() => setShowSubmitConfirm(false)} className="h-[52px] text-[16px]">我再看看</ParentSecondaryButton>
            <ParentPrimaryButton type="button" onClick={submit} className="h-[52px] text-[16px]">确认提交</ParentPrimaryButton>
          </div>
        </ParentBottomSheet>
      )}
    </ParentPageShell>
  );
};

export default AssignedQuestionnaireView;
