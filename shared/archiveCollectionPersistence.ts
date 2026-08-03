import {
  isQuestionnaireChoiceAnswer,
  type QuestionnaireAnswer,
  type QuestionnaireRecord,
} from './questionnaireStore';
import {
  persistArchiveWorkspace,
  readArchiveWorkspace,
  upsertStudentArchiveCollectionAnswers,
  type ArchiveAnswer,
} from './studentArchiveStore';

const toArchiveAnswer = (answer: QuestionnaireAnswer | undefined): ArchiveAnswer | undefined => {
  if (typeof answer === 'string' || typeof answer === 'number') return String(answer);
  if (Array.isArray(answer)) return { selectedOptions: [...answer], customText: {} };
  if (isQuestionnaireChoiceAnswer(answer)) {
    return {
      selectedOptions: [...answer.selectedOptions],
      customText: { ...answer.customText },
    };
  }
  return undefined;
};

export const persistArchiveCollectionAnswers = (
  questionnaire: QuestionnaireRecord,
  studentNo: string,
  answers: Record<string, QuestionnaireAnswer>,
  operator: string,
) => {
  if (!questionnaire.archiveTemplateId || !questionnaire.archiveTemplateSnapshot) return false;
  const target = questionnaire.targets.find(item => item.studentNo === studentNo);
  if (!target) return false;

  const archiveAnswers = Object.fromEntries(questionnaire.questions.flatMap(question => {
    if (!question.archiveFieldSemanticKey) return [];
    const answer = toArchiveAnswer(answers[question.id]);
    return answer === undefined ? [] : [[question.archiveFieldSemanticKey, answer] as const];
  }));
  if (Object.keys(archiveAnswers).length === 0) return false;

  const workspace = readArchiveWorkspace({
    spaceId: questionnaire.spaceId,
    teacherName: questionnaire.creatorName,
    classes: [],
    homeroomClassIds: [],
    getStudentsForClass: () => [],
  });
  const result = upsertStudentArchiveCollectionAnswers(workspace, {
    templateId: questionnaire.archiveTemplateId,
    templateName: questionnaire.archiveTemplateName ?? questionnaire.archiveTemplateSnapshot.name,
    templateVersion: questionnaire.archiveTemplateVersion ?? questionnaire.archiveTemplateSnapshot.version,
    templateSnapshot: questionnaire.archiveTemplateSnapshot,
    target: {
      studentId: target.studentId,
      studentName: target.studentName,
      classId: target.classId,
      className: target.className,
    },
    answers: archiveAnswers,
    operator,
  });
  if (!result.updated) return false;
  persistArchiveWorkspace(result.workspace);
  return true;
};
