import React from 'react';
import { Check, Ruler, Scale, Target } from 'lucide-react';
import type {
  GrowthCollectionTemplate,
  QuestionnaireAnswer,
  QuestionnaireQuestion,
} from '../../../shared/questionnaireStore';
import { calculateBmi, type GoalSelfAssessment } from '../../../shared/studentGrowthStore';

export const HEIGHT_QUESTION_ID = 'growth-height-cm';
export const WEIGHT_QUESTION_ID = 'growth-weight-kg';

export const GOAL_FIELD_IDS = {
  previousReflection: 'goal-previous-reflection',
  studentMessage: 'goal-student-message',
  teacherMessage: 'goal-teacher-message',
  parentMessage: 'goal-parent-message',
  agreement: 'goal-agreement',
  studentSignature: 'goal-student-signature',
  teacherSignature: 'goal-teacher-signature',
  parentSignature: 'goal-parent-signature',
  signatureDate: 'goal-signature-date',
} as const;

export const getGoalFieldId = (index: number, field: 'dimension' | 'reason' | 'action' | 'assessment') => (
  `goal-${index + 1}-${field}`
);

export const createGrowthCollectionQuestions = (
  template: GrowthCollectionTemplate,
  dimensions: string[],
): QuestionnaireQuestion[] => {
  if (template === 'height_weight') {
    return [
      { id: HEIGHT_QUESTION_ID, type: 'number', title: '身高（厘米）', required: true, options: [], settings: { numberFormat: 'decimal-1' } },
      { id: WEIGHT_QUESTION_ID, type: 'number', title: '体重（千克）', required: true, options: [], settings: { numberFormat: 'decimal-1' } },
    ];
  }

  const questions: QuestionnaireQuestion[] = [
    { id: GOAL_FIELD_IDS.previousReflection, type: 'text', title: '上学期回顾', required: false, options: [] },
  ];
  (['目标1', '目标2', '目标3'] as const).forEach((label, index) => {
    const required = index < 2;
    questions.push(
      { id: getGoalFieldId(index, 'dimension'), type: 'single', title: `${label}·校训维度`, required, options: dimensions },
      { id: getGoalFieldId(index, 'reason'), type: 'text', title: `${label}·原因`, required, options: [] },
      { id: getGoalFieldId(index, 'action'), type: 'text', title: `${label}·具体行动`, required, options: [] },
      { id: getGoalFieldId(index, 'assessment'), type: 'single', title: `${label}·自评`, required, options: ['我能做到', '我需要努力', '我需要帮助'] },
    );
  });
  questions.push(
    { id: GOAL_FIELD_IDS.studentMessage, type: 'text', title: '我想对老师说', required: false, options: [] },
    { id: GOAL_FIELD_IDS.teacherMessage, type: 'text', title: '老师想对你说', required: false, options: [] },
    { id: GOAL_FIELD_IDS.parentMessage, type: 'text', title: '爸爸妈妈想对你说', required: false, options: [] },
    { id: GOAL_FIELD_IDS.agreement, type: 'text', title: '我们的约定', required: true, options: [] },
    { id: GOAL_FIELD_IDS.studentSignature, type: 'short_text', title: '学生签名', required: false, options: [] },
    { id: GOAL_FIELD_IDS.teacherSignature, type: 'short_text', title: '教师签名', required: false, options: [] },
    { id: GOAL_FIELD_IDS.parentSignature, type: 'short_text', title: '家长签名', required: false, options: [] },
    { id: GOAL_FIELD_IDS.signatureDate, type: 'date', title: '落款日期', required: false, options: [] },
  );
  return questions;
};

interface GrowthFormProps {
  answers: Record<string, QuestionnaireAnswer>;
  editable: boolean;
  onAnswerChange: (questionId: string, answer: QuestionnaireAnswer) => void;
}

interface HeightWeightCollectionFormProps extends GrowthFormProps {
  measurementDate: string;
}

const surfaceClass = 'rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]';
const labelClass = 'mb-2 block text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]';
const inputClass = 'w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] px-3.5 text-[length:var(--tm-font-size-body)] font-medium text-[var(--tm-text-primary)] outline-none transition focus:border-[var(--tm-brand-primary)] focus:ring-2 focus:ring-[var(--tm-focus-ring)] disabled:bg-[var(--tm-bg-surface-muted)] disabled:text-[var(--tm-text-secondary)]';

const answerText = (answer: QuestionnaireAnswer | undefined) => (
  typeof answer === 'string' || typeof answer === 'number' ? String(answer) : ''
);

export const HeightWeightCollectionForm: React.FC<HeightWeightCollectionFormProps> = ({
  answers,
  editable,
  measurementDate,
  onAnswerChange,
}) => {
  const height = Number(answerText(answers[HEIGHT_QUESTION_ID])) || 0;
  const weight = Number(answerText(answers[WEIGHT_QUESTION_ID])) || 0;
  const bmi = calculateBmi(height, weight);

  return (
    <section className={surfaceClass}>
      <div className="mb-4 flex min-h-11 items-center justify-between border-b border-[var(--tm-border-subtle)] pb-3">
        <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">测量日期</span>
        <span className="text-[length:var(--tm-font-size-body)] font-bold tabular-nums text-[var(--tm-text-primary)]">{measurementDate}</span>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className={`${labelClass} flex items-center gap-1.5`}><Ruler className="h-4 w-4" />身高（厘米）</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="80"
            max="220"
            disabled={!editable}
            value={answerText(answers[HEIGHT_QUESTION_ID])}
            onChange={event => onAnswerChange(HEIGHT_QUESTION_ID, event.target.value)}
            className={`${inputClass} h-[52px]`}
            placeholder="请输入"
          />
        </label>
        <label>
          <span className={`${labelClass} flex items-center gap-1.5`}><Scale className="h-4 w-4" />体重（千克）</span>
          <input
            type="number"
            inputMode="decimal"
            step="0.1"
            min="10"
            max="200"
            disabled={!editable}
            value={answerText(answers[WEIGHT_QUESTION_ID])}
            onChange={event => onAnswerChange(WEIGHT_QUESTION_ID, event.target.value)}
            className={`${inputClass} h-[52px]`}
            placeholder="请输入"
          />
        </label>
      </div>
      <div className="mt-4 flex min-h-[52px] items-center justify-between rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] px-3.5">
        <span className="text-[length:var(--tm-font-size-compact)] font-semibold text-[var(--tm-text-secondary)]">身体质量指数</span>
        <span className="text-[length:var(--tm-font-size-card-title)] font-bold tabular-nums text-[var(--tm-text-primary)]">{bmi || '--'}</span>
      </div>
    </section>
  );
};

interface SemesterGoalCollectionFormProps extends GrowthFormProps {
  dimensions: string[];
  studentName: string;
  teacherName: string;
}

const selfAssessments: GoalSelfAssessment[] = ['我能做到', '我需要努力', '我需要帮助'];
const goalTypes = ['继续闪亮的地方', '尝试的新方向', '其他方面（选填）'];

export const SemesterGoalCollectionForm: React.FC<SemesterGoalCollectionFormProps> = ({
  answers,
  dimensions,
  editable,
  studentName,
  teacherName,
  onAnswerChange,
}) => (
  <div className="space-y-3">
    <section className={surfaceClass}>
      <label>
        <span className={labelClass}>上学期回顾</span>
        <textarea
          disabled={!editable}
          value={answerText(answers[GOAL_FIELD_IDS.previousReflection])}
          onChange={event => onAnswerChange(GOAL_FIELD_IDS.previousReflection, event.target.value)}
          className={`${inputClass} min-h-[88px] resize-none py-3 leading-6`}
          placeholder="简短写下一句话"
        />
      </label>
    </section>

    {[0, 1, 2].map(index => {
      const dimensionId = getGoalFieldId(index, 'dimension');
      const reasonId = getGoalFieldId(index, 'reason');
      const actionId = getGoalFieldId(index, 'action');
      const assessmentId = getGoalFieldId(index, 'assessment');
      return (
        <section key={index} className={surfaceClass}>
          <h2 className="flex items-center gap-2 text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-[var(--tm-radius-control)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]"><Target className="h-4 w-4" /></span>
            目标{index + 1}：{goalTypes[index]}
          </h2>
          <div className="mt-4 space-y-4">
            <label>
              <span className={labelClass}>校训维度{index < 2 && <span className="ml-0.5 text-[var(--tm-brand-primary)]">*</span>}</span>
              <select
                disabled={!editable}
                value={answerText(answers[dimensionId])}
                onChange={event => onAnswerChange(dimensionId, event.target.value)}
                className={`${inputClass} h-[52px] appearance-none`}
              >
                <option value="">请选择</option>
                {dimensions.map(option => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label>
              <span className={labelClass}>因为{index < 2 && <span className="ml-0.5 text-[var(--tm-brand-primary)]">*</span>}</span>
              <textarea disabled={!editable} value={answerText(answers[reasonId])} onChange={event => onAnswerChange(reasonId, event.target.value)} className={`${inputClass} min-h-[76px] resize-none py-3 leading-6`} placeholder="写下原因" />
            </label>
            <label>
              <span className={labelClass}>我想要{index < 2 && <span className="ml-0.5 text-[var(--tm-brand-primary)]">*</span>}</span>
              <textarea disabled={!editable} value={answerText(answers[actionId])} onChange={event => onAnswerChange(actionId, event.target.value)} className={`${inputClass} min-h-[76px] resize-none py-3 leading-6`} placeholder="写下可以做到的具体行动" />
            </label>
            <div>
              <span className={labelClass}>我的自评{index < 2 && <span className="ml-0.5 text-[var(--tm-brand-primary)]">*</span>}</span>
              <div className="grid grid-cols-3 gap-2">
                {selfAssessments.map(option => {
                  const selected = answerText(answers[assessmentId]) === option;
                  return (
                    <button
                      key={option}
                      type="button"
                      disabled={!editable}
                      aria-pressed={selected}
                      onClick={() => onAnswerChange(assessmentId, option)}
                      className={`flex min-h-[52px] items-center justify-center gap-1 rounded-[var(--tm-radius-control)] border px-1 text-center text-[length:var(--tm-font-size-badge)] font-semibold leading-4 transition ${selected ? 'border-[var(--tm-brand-primary)] bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary-strong)]' : 'border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)] text-[var(--tm-text-secondary)]'}`}
                    >
                      {selected && <Check className="h-3.5 w-3.5 shrink-0" />}{option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </section>
      );
    })}

    <section className={`${surfaceClass} space-y-4`}>
      {([
        [GOAL_FIELD_IDS.studentMessage, '我想对老师说'],
        [GOAL_FIELD_IDS.teacherMessage, '老师想对你说'],
        [GOAL_FIELD_IDS.parentMessage, '爸爸妈妈想对你说'],
      ] as const).map(([id, label]) => (
        <label key={id}>
          <span className={labelClass}>{label}</span>
          <textarea disabled={!editable} value={answerText(answers[id])} onChange={event => onAnswerChange(id, event.target.value)} className={`${inputClass} min-h-[76px] resize-none py-3 leading-6`} placeholder="请输入" />
        </label>
      ))}
    </section>

    <section className={surfaceClass}>
      <label>
        <span className={labelClass}>我们的约定<span className="ml-0.5 text-[var(--tm-brand-primary)]">*</span></span>
        <textarea disabled={!editable} value={answerText(answers[GOAL_FIELD_IDS.agreement])} onChange={event => onAnswerChange(GOAL_FIELD_IDS.agreement, event.target.value)} className={`${inputClass} min-h-[92px] resize-none py-3 leading-6`} placeholder="写下共同约定" />
      </label>
    </section>

    <section className={surfaceClass}>
      <h2 className="text-[length:var(--tm-font-size-card-title)] font-bold text-[var(--tm-text-primary)]">确认签名</h2>
      <div className="mt-4 grid grid-cols-2 gap-3">
        {([
          [GOAL_FIELD_IDS.studentSignature, '学生', studentName],
          [GOAL_FIELD_IDS.teacherSignature, '教师', teacherName],
          [GOAL_FIELD_IDS.parentSignature, '家长', ''],
        ] as const).map(([id, label, placeholder]) => (
          <label key={id} className={id === GOAL_FIELD_IDS.parentSignature ? 'col-span-2' : ''}>
            <span className={labelClass}>{label}签名</span>
            <input disabled={!editable} value={answerText(answers[id])} onChange={event => onAnswerChange(id, event.target.value)} className={`${inputClass} h-[52px]`} placeholder={placeholder || '请输入姓名'} />
          </label>
        ))}
        <label className="col-span-2">
          <span className={labelClass}>落款日期</span>
          <input type="date" disabled={!editable} value={answerText(answers[GOAL_FIELD_IDS.signatureDate])} onChange={event => onAnswerChange(GOAL_FIELD_IDS.signatureDate, event.target.value)} className={`${inputClass} h-[52px]`} />
        </label>
      </div>
    </section>
  </div>
);
