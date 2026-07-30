import {
  getQuestionnaireRespondentRole,
  getQuestionnaireSelectedOptions,
  type QuestionnaireAnswer,
  type QuestionnaireRecord,
} from './questionnaireStore';
import {
  GOAL_FIELD_IDS,
  HEIGHT_QUESTION_ID,
  WEIGHT_QUESTION_ID,
  getGoalFieldId,
} from './growthCollectionDefinition';
import {
  saveBodyMeasurementRecord,
  saveSemesterGoalPlan,
  type GoalConfirmation,
  type GoalSelfAssessment,
  type SemesterGoalItem,
} from './studentGrowthStore';

const answerText = (answers: Record<string, QuestionnaireAnswer>, id: string) => {
  const answer = answers[id];
  if (typeof answer === 'string' || typeof answer === 'number') return String(answer).trim();
  return getQuestionnaireSelectedOptions(answer)[0]?.trim() ?? '';
};

export const persistGrowthCollectionAnswers = (
  questionnaire: QuestionnaireRecord,
  studentNo: string,
  answers: Record<string, QuestionnaireAnswer>,
  completedAt: string,
) => {
  if (!questionnaire.growthTemplate) return false;
  const target = questionnaire.targets.find(item => item.studentNo === studentNo);
  if (!target) return false;
  const respondentRole = getQuestionnaireRespondentRole(questionnaire);
  const sourceLabel = respondentRole === 'guardian' ? '家庭填报' : questionnaire.title;
  const sourceRecordId = `${questionnaire.id}-${studentNo}`;

  if (questionnaire.growthTemplate === 'height_weight') {
    saveBodyMeasurementRecord(target.studentId, {
      measuredAt: questionnaire.growthMeasurementDate ?? completedAt.slice(0, 10),
      heightCm: Number(answerText(answers, HEIGHT_QUESTION_ID)),
      weightKg: Number(answerText(answers, WEIGHT_QUESTION_ID)),
      sourceRecordId,
      sourceLabel,
      sourceType: 'growth-collection',
    }, respondentRole === 'guardian' ? '家长' : questionnaire.creatorName);
    return true;
  }

  const goals: SemesterGoalItem[] = [0, 1, 2].flatMap(index => {
    const dimension = answerText(answers, getGoalFieldId(index, 'dimension'));
    const action = answerText(answers, getGoalFieldId(index, 'action'));
    if (!dimension && !action) return [];
    return [{
      id: `goal-${index + 1}`,
      type: (['继续闪亮', '尝试新方向', '其他挑战'] as const)[index],
      dimension,
      reason: answerText(answers, getGoalFieldId(index, 'reason')),
      action,
      selfAssessment: (answerText(answers, getGoalFieldId(index, 'assessment')) || '我需要努力') as GoalSelfAssessment,
      optional: index === 2,
    }];
  });
  const signatureDate = answerText(answers, GOAL_FIELD_IDS.signatureDate) || completedAt.slice(0, 10);
  const confirmationInputs = [
    ['学生', GOAL_FIELD_IDS.studentSignature, '访谈确认'],
    ['教师', GOAL_FIELD_IDS.teacherSignature, '账号确认'],
    ['家长', GOAL_FIELD_IDS.parentSignature, '账号确认'],
  ] as const;
  const confirmations: GoalConfirmation[] = confirmationInputs.flatMap(([role, id, method]) => {
    const name = answerText(answers, id);
    return name ? [{ role, name, method, confirmedAt: `${signatureDate} 00:00` }] : [];
  });
  saveSemesterGoalPlan(target.studentId, {
    term: questionnaire.growthTerm ?? '',
    status: confirmations.length >= 3 ? 'active' : 'pending-confirmation',
    previousReflection: answerText(answers, GOAL_FIELD_IDS.previousReflection),
    goals,
    studentMessage: answerText(answers, GOAL_FIELD_IDS.studentMessage),
    teacherMessage: answerText(answers, GOAL_FIELD_IDS.teacherMessage),
    parentMessage: answerText(answers, GOAL_FIELD_IDS.parentMessage),
    agreement: answerText(answers, GOAL_FIELD_IDS.agreement),
    confirmations,
    interviewRecorder: respondentRole === 'teacher' ? questionnaire.creatorName : undefined,
    interviewRecordedAt: respondentRole === 'teacher' ? completedAt : undefined,
    sourceRecordId,
    sourceLabel,
  });
  return true;
};
