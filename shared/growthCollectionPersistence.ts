import {
  getQuestionnaireRespondentRole,
  getQuestionnaireSelectedOptions,
  type QuestionnaireAnswer,
  type QuestionnaireRecord,
} from './questionnaireStore';
import {
  MEASUREMENT_DATE_QUESTION_ID,
  getBodyGrowthFieldKeys,
} from './growthCollectionDefinition';
import {
  saveStudentGrowthDataRecord,
} from './studentGrowthStore';
import type { GrowthInputFieldKey } from './studentGrowthFieldCatalog';

const answerText = (answers: Record<string, QuestionnaireAnswer>, id: string) => {
  const answer = answers[id];
  if (typeof answer === 'string' || typeof answer === 'number') return String(answer).trim();
  return getQuestionnaireSelectedOptions(answer)[0]?.trim() ?? '';
};

export const persistGrowthCollectionAnswers = (
  questionnaire: QuestionnaireRecord,
  studentNo: string,
  answers: Record<string, QuestionnaireAnswer>,
  _completedAt: string,
  _options?: {
    semesterGoalStatus?: 'pending-confirmation' | 'active';
    reviewerName?: string;
  },
) => {
  const target = questionnaire.targets.find(item => item.studentNo === studentNo);
  if (!target) return false;
  const growthFieldKeys = getBodyGrowthFieldKeys(questionnaire.questions);
  if (growthFieldKeys.length === 0) return false;
  const respondentRole = getQuestionnaireRespondentRole(questionnaire);
  const sourceLabel = respondentRole === 'guardian' ? '家庭填报' : questionnaire.title;
  const sourceRecordId = `${questionnaire.id}-${studentNo}`;
  const values = Object.fromEntries(growthFieldKeys.flatMap(key => {
    const question = questionnaire.questions.find(item => item.growthFieldKey === key)
      ?? questionnaire.questions.find(item => item.id === (key === 'height_cm' ? 'growth-height-cm' : key === 'weight_kg' ? 'growth-weight-kg' : `growth-field-${key}`));
    if (!question) return [];
    const value = answerText(answers, question.id);
    if (value === '') return [];
    return [[key, question.type === 'number' ? Number(value) : value] as const];
  })) as Partial<Record<GrowthInputFieldKey, string | number>>;
  if (Object.keys(values).length === 0) return false;

  const recordedAt = questionnaire.growthRecordDateMode === 'fixed'
    ? questionnaire.growthMeasurementDate ?? ''
    : answerText(answers, questionnaire.questions.find(question => question.growthRecordedAt)?.id ?? MEASUREMENT_DATE_QUESTION_ID);
  if (!recordedAt) return false;

  saveStudentGrowthDataRecord(target.studentId, {
    recordedAt,
    values,
    sourceRecordId,
    sourceLabel,
    sourceType: 'growth-collection',
  }, respondentRole === 'guardian' ? '家长' : questionnaire.creatorName);
  return true;
};
