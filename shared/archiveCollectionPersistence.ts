import {
  getQuestionnaireRespondentRole,
  isQuestionnaireChoiceAnswer,
  type QuestionnaireAnswer,
  type QuestionnaireRecord,
} from './questionnaireStore';
import {
  buildArchiveGrowthModuleSnapshots,
  isArchiveChoiceAnswer,
  persistArchiveWorkspace,
  readArchiveWorkspace,
  resolveArchivePeriod,
  upsertStudentArchiveCollectionAnswers,
  type ArchiveAnswer,
  type ArchiveWorkspace,
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

const toQuestionnaireAnswer = (answer: ArchiveAnswer): QuestionnaireAnswer => (
  isArchiveChoiceAnswer(answer)
    ? {
        selectedOptions: [...answer.selectedOptions],
        customText: { ...answer.customText },
      }
    : answer
);

const getQuestionnaireArchivePeriod = (questionnaire: QuestionnaireRecord) => {
  const fallback = questionnaire.archiveTemplateSnapshot
    ? resolveArchivePeriod(questionnaire.archiveTemplateSnapshot, questionnaire.createdAt.slice(0, 10))
    : { key: '', label: '' };
  return {
    key: questionnaire.archivePeriodKey ?? fallback.key,
    label: questionnaire.archivePeriodLabel ?? fallback.label,
  };
};

const readQuestionnaireArchiveWorkspace = (questionnaire: QuestionnaireRecord) => readArchiveWorkspace({
  spaceId: questionnaire.spaceId,
  teacherName: questionnaire.creatorName,
  classes: [],
  homeroomClassIds: [],
  getStudentsForClass: () => [],
});

export const getArchiveCollectionPrefillAnswers = (
  questionnaire: QuestionnaireRecord,
  studentNo: string,
): Record<string, QuestionnaireAnswer> => {
  if (!questionnaire.archiveTemplateId) return {};
  const target = questionnaire.targets.find(item => item.studentNo === studentNo);
  if (!target) return {};

  const workspace = readQuestionnaireArchiveWorkspace(questionnaire);
  const period = getQuestionnaireArchivePeriod(questionnaire);
  const currentDraft = workspace.drafts.find(item => (
    item.studentId === target.studentId
    && item.templateId === questionnaire.archiveTemplateId
    && item.periodKey === period.key
  ));
  const latestSnapshot = currentDraft ? undefined : workspace.snapshots
    .filter(item => (
      item.status === 'archived'
      && item.studentId === target.studentId
      && item.templateId === questionnaire.archiveTemplateId
    ))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
  const archiveAnswers = currentDraft?.answers ?? latestSnapshot?.answers ?? {};

  return Object.fromEntries(questionnaire.questions.flatMap(question => {
    if (!question.archiveFieldSemanticKey) return [];
    const answer = archiveAnswers[question.archiveFieldSemanticKey];
    return answer === undefined ? [] : [[question.id, toQuestionnaireAnswer(answer)] as const];
  }));
};

export interface ArchiveCollectionTargetPlan {
  createStudentNos: string[];
  updateStudentNos: string[];
  pendingStudentNos: string[];
}

const hasCompletedArchiveCollection = (record: QuestionnaireRecord, studentNo: string) => (
  getQuestionnaireRespondentRole(record) === 'teacher'
    ? record.studentRecords?.some(item => item.studentNo === studentNo && item.status === 'completed') ?? false
    : record.submissions.some(item => item.studentNo === studentNo)
);

export const getArchiveCollectionTargetPlan = (
  candidate: QuestionnaireRecord,
  records: QuestionnaireRecord[],
  archiveWorkspace?: ArchiveWorkspace,
): ArchiveCollectionTargetPlan => {
  if (!candidate.archiveTemplateId) return { createStudentNos: [], updateStudentNos: [], pendingStudentNos: [] };
  const workspace = archiveWorkspace ?? readQuestionnaireArchiveWorkspace(candidate);
  const existingStudentIds = new Set([
    ...workspace.drafts.flatMap(item => item.templateId === candidate.archiveTemplateId ? [item.studentId] : []),
    ...workspace.snapshots.flatMap(item => item.templateId === candidate.archiveTemplateId ? [item.studentId] : []),
  ]);
  const pendingStudentNos = candidate.targets.flatMap(target => {
    const pending = records.some(record => (
      record.id !== candidate.id
      && record.status === 'active'
      && record.spaceId === candidate.spaceId
      && record.archiveTemplateId === candidate.archiveTemplateId
      && record.targets.some(item => item.studentNo === target.studentNo && item.scopeStatus !== 'exited' && item.reachable)
      && !hasCompletedArchiveCollection(record, target.studentNo)
    ));
    return pending ? [target.studentNo] : [];
  });
  const pendingSet = new Set(pendingStudentNos);
  const eligibleTargets = candidate.targets.filter(target => !pendingSet.has(target.studentNo));
  return {
    createStudentNos: eligibleTargets.flatMap(target => existingStudentIds.has(target.studentId) ? [] : [target.studentNo]),
    updateStudentNos: eligibleTargets.flatMap(target => existingStudentIds.has(target.studentId) ? [target.studentNo] : []),
    pendingStudentNos,
  };
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
    const empty = answer === undefined
      || typeof answer === 'string' && !answer.trim()
      || isArchiveChoiceAnswer(answer) && answer.selectedOptions.length === 0;
    return empty ? [] : [[question.archiveFieldSemanticKey, answer] as const];
  }));
  const workspace = readQuestionnaireArchiveWorkspace(questionnaire);
  const period = getQuestionnaireArchivePeriod(questionnaire);
  const sourceRecordId = `${questionnaire.id}-${studentNo}`;
  const recordDate = questionnaire.growthMeasurementDate ?? '';
  const growthSnapshots = recordDate
    ? buildArchiveGrowthModuleSnapshots(target.studentId, questionnaire.archiveTemplateSnapshot.growthFields, {
        startDate: recordDate,
        endDate: recordDate,
      }).flatMap(module => {
        const items = module.items.filter(item => item.value.trim() && item.sourceRecordId === sourceRecordId);
        return items.length > 0 ? [{ ...module, status: 'available' as const, items }] : [];
      })
    : [];
  if (Object.keys(archiveAnswers).length === 0 && growthSnapshots.length === 0) return false;
  const result = upsertStudentArchiveCollectionAnswers(workspace, {
    templateId: questionnaire.archiveTemplateId,
    templateName: questionnaire.archiveTemplateName ?? questionnaire.archiveTemplateSnapshot.name,
    templateVersion: questionnaire.archiveTemplateVersion ?? questionnaire.archiveTemplateSnapshot.version,
    templateSnapshot: questionnaire.archiveTemplateSnapshot,
    periodKey: period.key,
    periodLabel: period.label,
    target: {
      studentId: target.studentId,
      studentName: target.studentName,
      classId: target.classId,
      className: target.className,
    },
    answers: archiveAnswers,
    growthSnapshots,
    operator,
  });
  if (!result.updated) return false;
  persistArchiveWorkspace(result.workspace);
  return true;
};
