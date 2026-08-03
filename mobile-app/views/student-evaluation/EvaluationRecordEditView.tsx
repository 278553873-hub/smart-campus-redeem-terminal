import React, { useMemo, useState } from 'react';
import { Check, ChevronLeft, Minus, Plus } from 'lucide-react';
import { phoneText } from '../../styles/teacherMobileTokens';
import type { StudentEvaluationRecord, StudentEvaluationRecordUpdate } from './types';

interface EvaluationRecordEditViewProps {
  record: StudentEvaluationRecord;
  isEditingOthersRecord: boolean;
  termStartDate: string;
  termEndDate: string;
  onCancel: () => void;
  onSave: (update: StudentEvaluationRecordUpdate) => void;
}

const fieldClass = 'mt-2 h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 text-[14px] font-medium text-[var(--tm-input-text)] outline-none transition placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)] disabled:cursor-not-allowed disabled:border-[var(--tm-input-disabled-border)] disabled:bg-[var(--tm-input-disabled-bg)] disabled:text-[var(--tm-input-disabled-text)] disabled:opacity-100 read-only:border-[var(--tm-input-readonly-border)] read-only:bg-[var(--tm-input-readonly-bg)] read-only:text-[var(--tm-input-readonly-text)]';

const EvaluationRecordEditView: React.FC<EvaluationRecordEditViewProps> = ({
  record,
  isEditingOthersRecord,
  termStartDate,
  termEndDate,
  onCancel,
  onSave,
}) => {
  const [evaluationDate, setEvaluationDate] = useState(record.evaluation_date);
  const [indicatorPath, setIndicatorPath] = useState<[string, string, string]>([
    record.indicatorPath[0] ?? '',
    record.indicatorPath[1] ?? '',
    record.indicatorPath[2] ?? '',
  ]);
  const [scoreChange, setScoreChange] = useState(record.scoreChange);
  const [aiComment, setAiComment] = useState(record.aiComment);
  const [reason, setReason] = useState('');
  const [validationAttempted, setValidationAttempted] = useState(false);

  const isValid = useMemo(() => (
    Boolean(evaluationDate)
    && evaluationDate >= termStartDate
    && evaluationDate <= termEndDate
    && indicatorPath.every(item => item.trim().length > 0)
    && scoreChange !== 0
    && scoreChange >= -5
    && scoreChange <= 5
    && aiComment.trim().length > 0
    && (!isEditingOthersRecord || reason.trim().length > 0)
  ), [aiComment, evaluationDate, indicatorPath, isEditingOthersRecord, reason, scoreChange, termEndDate, termStartDate]);

  const updateIndicator = (index: number, value: string) => {
    setIndicatorPath(current => current.map((item, itemIndex) => itemIndex === index ? value : item) as [string, string, string]);
  };

  const updateScore = (nextScore: number) => {
    if (nextScore === 0) nextScore += scoreChange > 0 ? -1 : 1;
    setScoreChange(Math.max(-5, Math.min(5, nextScore)));
  };

  const save = () => {
    setValidationAttempted(true);
    if (!isValid) return;
    onSave({
      evaluation_date: evaluationDate,
      indicatorPath: indicatorPath.map(item => item.trim()),
      scoreChange,
      aiComment: aiComment.trim(),
      reason: reason.trim(),
    });
  };

  return (
    <div className="relative flex h-full min-h-0 flex-col overflow-hidden bg-transparent font-sans">
      <header className="flex h-11 shrink-0 items-center justify-between border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface-glass)] px-4 backdrop-blur-md">
        <button type="button" onClick={onCancel} aria-label="取消修改" className="-ml-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)]">
          <ChevronLeft className="h-5 w-5" />
        </button>
        <h1 className={`${phoneText.navTitle} text-[var(--tm-text-primary)]`}>修改评价</h1>
        <button type="button" onClick={save} aria-label="保存评价修改" className="-mr-2 flex h-11 w-11 items-center justify-center rounded-full text-[var(--tm-brand-primary)] active:bg-[var(--tm-brand-primary-soft)]">
          <Check className="h-5 w-5" />
        </button>
      </header>

      <main className="min-h-0 flex-1 overflow-y-auto px-4 pb-10 pt-4 no-scrollbar">
        <div className="space-y-5">
          <section>
            <label className="text-[13px] font-semibold text-[var(--tm-text-primary)]">
              评价日期
              <input type="date" min={termStartDate} max={termEndDate} value={evaluationDate} onChange={event => setEvaluationDate(event.target.value)} className={fieldClass} />
            </label>
          </section>

          <section>
            <h2 className="text-[13px] font-semibold text-[var(--tm-text-primary)]">评价指标</h2>
            <div className="mt-2 space-y-2.5">
              {['一级指标', '二级指标', '三级指标'].map((label, index) => (
                <label key={label} className="block">
                  <span className="sr-only">{label}</span>
                  <input value={indicatorPath[index]} onChange={event => updateIndicator(index, event.target.value)} placeholder={label} className="h-12 w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 text-[14px] font-medium text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]" />
                </label>
              ))}
            </div>
          </section>

          <section>
            <h2 className="text-[13px] font-semibold text-[var(--tm-text-primary)]">评价分值</h2>
            <div className="mt-2 flex h-12 items-center justify-between rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface)] px-1 [box-shadow:var(--tm-shadow-control)]">
              <button type="button" onClick={() => updateScore(scoreChange - 1)} disabled={scoreChange <= -5} aria-label="减少评价分值" className="flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-control)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)] disabled:text-[var(--tm-text-disabled)]">
                <Minus className="h-4 w-4" />
              </button>
              <span className={`text-[22px] font-bold tabular-nums ${scoreChange < 0 ? 'text-[var(--tm-record-negative-text)]' : 'text-[var(--tm-record-positive-text)]'}`}>
                {scoreChange > 0 ? `+${scoreChange}` : scoreChange}
              </span>
              <button type="button" onClick={() => updateScore(scoreChange + 1)} disabled={scoreChange >= 5} aria-label="增加评价分值" className="flex h-11 w-11 items-center justify-center rounded-[var(--tm-radius-control)] text-[var(--tm-text-secondary)] active:bg-[var(--tm-bg-surface-soft)] disabled:text-[var(--tm-text-disabled)]">
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </section>

          <section>
            <label className="text-[13px] font-semibold text-[var(--tm-text-primary)]">
              评价内容
              <textarea value={aiComment} onChange={event => setAiComment(event.target.value)} rows={5} className="mt-2 min-h-[132px] w-full resize-none rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 py-3 text-[14px] font-medium leading-6 text-[var(--tm-input-text)] outline-none focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]" />
            </label>
          </section>

          {isEditingOthersRecord && (
            <section>
              <label className="text-[13px] font-semibold text-[var(--tm-text-primary)]">
                修改原因
                <textarea value={reason} onChange={event => setReason(event.target.value)} rows={3} placeholder="请简要说明修改原因" className="mt-2 min-h-[88px] w-full resize-none rounded-[var(--tm-radius-control)] border border-[var(--tm-input-border)] bg-[var(--tm-input-bg)] px-3.5 py-3 text-[14px] font-medium leading-5 text-[var(--tm-input-text)] outline-none placeholder:text-[var(--tm-input-placeholder)] focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]" />
              </label>
            </section>
          )}

          {validationAttempted && !isValid && (
            <p role="alert" className="rounded-[var(--tm-radius-control)] bg-[var(--tm-record-negative-bg)] px-3 py-2.5 text-[12px] font-medium text-[var(--tm-record-negative-text)]">
              {isEditingOthersRecord && !reason.trim()
                ? '修改其他老师的评价时，请填写修改原因。'
                : '请完整填写评价信息，分值为 -5 至 +5 且不能为 0。'}
            </p>
          )}
        </div>
      </main>
    </div>
  );
};

export default EvaluationRecordEditView;
