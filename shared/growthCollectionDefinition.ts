import type {
  GrowthCollectionTemplate,
  QuestionnaireQuestion,
  QuestionnaireRespondentRole,
} from './questionnaireStore';
import {
  PLATFORM_GROWTH_FIELD_CATALOG,
  getGrowthFieldDefinition,
  type GrowthInputFieldKey,
} from './studentGrowthFieldCatalog';

export const HEIGHT_QUESTION_ID = 'growth-height-cm';
export const WEIGHT_QUESTION_ID = 'growth-weight-kg';
export const MEASUREMENT_DATE_QUESTION_ID = 'growth-measured-at';

export type BodyGrowthFieldKey = GrowthInputFieldKey;

export const BODY_GROWTH_FIELD_OPTIONS = PLATFORM_GROWTH_FIELD_CATALOG;

export const getBodyGrowthFieldKeys = (questions: QuestionnaireQuestion[]): BodyGrowthFieldKey[] => {
  const keys = questions.flatMap(question => {
    if (question.growthFieldKey) return [question.growthFieldKey];
    if (question.id === HEIGHT_QUESTION_ID) return ['height_cm' as const];
    if (question.id === WEIGHT_QUESTION_ID) return ['weight_kg' as const];
    return [];
  });
  return Array.from(new Set(keys));
};

export const isGrowthCollectionQuestion = (question: QuestionnaireQuestion) => (
  Boolean(question.growthFieldKey)
  || Boolean(question.growthRecordedAt)
  || question.id === MEASUREMENT_DATE_QUESTION_ID
  || question.id === HEIGHT_QUESTION_ID
  || question.id === WEIGHT_QUESTION_ID
  || question.id.startsWith('growth-field-')
);

export const createBodyGrowthQuestions = (
  fields: BodyGrowthFieldKey[],
  includeRecordedAt = true,
): QuestionnaireQuestion[] => {
  if (fields.length === 0) return [];
  const questions: QuestionnaireQuestion[] = includeRecordedAt ? [
    {
      id: MEASUREMENT_DATE_QUESTION_ID,
      type: 'date',
      title: '记录日期',
      required: true,
      options: [],
      settings: { dateFormat: 'ymd' },
      growthRecordedAt: true,
    },
  ] : [];
  fields.forEach(key => {
    const definition = getGrowthFieldDefinition(key);
    if (!definition) return;
    const type = definition.valueType === 'number'
      ? 'number'
      : definition.valueType === 'single-select'
        ? 'single'
        : 'text';
    const numberFormat = definition.decimalPlaces === 2
      ? 'decimal-2'
      : definition.decimalPlaces === 1
        ? 'decimal-1'
        : 'integer';
    questions.push({
      id: key === 'height_cm' ? HEIGHT_QUESTION_ID : key === 'weight_kg' ? WEIGHT_QUESTION_ID : `growth-field-${key}`,
      type,
      title: definition.unit ? `${definition.label}（${definition.unit}）` : definition.label,
      required: true,
      options: definition.options ? [...definition.options] : [],
      settings: type === 'number' ? {
        numberFormat,
        minValue: definition.minValue,
        maxValue: definition.maxValue,
      } : undefined,
      growthFieldKey: key,
    });
  });
  return questions;
};

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
  respondentRole: QuestionnaireRespondentRole = 'teacher',
): QuestionnaireQuestion[] => {
  if (template === 'height_weight') {
    return createBodyGrowthQuestions(['height_cm', 'weight_kg']);
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
  );
  if (respondentRole === 'teacher') {
    questions.push({ id: GOAL_FIELD_IDS.teacherMessage, type: 'text', title: '老师想对你说', required: false, options: [] });
  }
  questions.push(
    { id: GOAL_FIELD_IDS.parentMessage, type: 'text', title: '爸爸妈妈想对你说', required: false, options: [] },
    { id: GOAL_FIELD_IDS.agreement, type: 'text', title: '我们的约定', required: true, options: [] },
    { id: GOAL_FIELD_IDS.studentSignature, type: 'short_text', title: '学生签名', required: false, options: [] },
  );
  if (respondentRole === 'teacher') {
    questions.push({ id: GOAL_FIELD_IDS.teacherSignature, type: 'short_text', title: '教师签名', required: false, options: [] });
  }
  questions.push(
    { id: GOAL_FIELD_IDS.parentSignature, type: 'short_text', title: '家长签名', required: false, options: [] },
    { id: GOAL_FIELD_IDS.signatureDate, type: 'date', title: '落款日期', required: false, options: [] },
  );
  return questions;
};
