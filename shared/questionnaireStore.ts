export type QuestionnaireStatus = 'draft' | 'active' | 'ended' | 'archived';
export type QuestionnaireQuestionType = 'single' | 'multiple' | 'rating' | 'text';
export type QuestionnaireTargetMode = 'all' | 'classes' | 'students';

export interface QuestionnaireChoiceAnswer {
  selectedOptions: string[];
  customText: Record<string, string>;
}

export type QuestionnaireAnswer = string | string[] | number | QuestionnaireChoiceAnswer;

export interface QuestionnaireQuestion {
  id: string;
  type: QuestionnaireQuestionType;
  title: string;
  required: boolean;
  options: string[];
  customAnswerOptions?: string[];
}

export interface QuestionnaireTarget {
  studentId: string;
  studentNo: string;
  studentName: string;
  classId: string;
  className: string;
  reachable: boolean;
}

export interface QuestionnaireSubmission {
  id: string;
  studentNo: string;
  studentName: string;
  guardianRelation: string;
  submittedAt: string;
  answers: Record<string, QuestionnaireAnswer>;
}

export interface QuestionnaireRecord {
  id: string;
  title: string;
  description: string;
  creatorName: string;
  spaceId: string;
  createdAt: string;
  suggestedDeadline: string;
  status: QuestionnaireStatus;
  targetMode?: QuestionnaireTargetMode;
  targetClassIds?: string[];
  questions: QuestionnaireQuestion[];
  targets: QuestionnaireTarget[];
  submissions: QuestionnaireSubmission[];
}

const STORAGE_KEY = 'campus-questionnaires-v1';
const DELETED_DRAFT_IDS_STORAGE_KEY = 'campus-questionnaire-deleted-drafts-v1';
export const QUESTIONNAIRE_STORE_EVENT = 'campus-questionnaire-store-updated';

const seedTargets: QuestionnaireTarget[] = [
  ['20250101', '郑小磊', true],
  ['20250102', '林小满', true],
  ['20250103', '王梓涵', true],
  ['20250104', '李欣怡', true],
  ['20250105', '刘浩宇', true],
  ['20250106', '陈思睿', true],
  ['20250107', '杨一诺', false],
  ['20250108', '赵宇轩', true],
  ['20250109', '黄子墨', true],
  ['20250110', '周雨桐', true],
  ['20250111', '吴佳泽', true],
  ['20250112', '徐心怡', true],
].map(([studentNo, studentName, reachable], index) => ({
  studentId: `202510${String(index + 1).padStart(2, '0')}`,
  studentNo: String(studentNo),
  studentName: String(studentName),
  classId: 'c_2025_1',
  className: '2025级一班',
  reachable: Boolean(reachable),
}));

const readingQuestions: QuestionnaireQuestion[] = [
  {
    id: 'reading-frequency',
    type: 'single',
    title: '孩子一周通常会进行几次课外阅读？',
    required: true,
    options: ['0-1次', '2-3次', '4-5次', '几乎每天'],
  },
  {
    id: 'reading-support',
    type: 'multiple',
    title: '家庭通常会用哪些方式支持孩子阅读？',
    required: true,
    options: ['亲子共读', '固定阅读时间', '购买或借阅图书', '交流阅读内容', '其他方式'],
    customAnswerOptions: ['其他方式'],
  },
  {
    id: 'reading-interest',
    type: 'rating',
    title: '您认为孩子目前的阅读兴趣如何？',
    required: true,
    options: ['1', '2', '3', '4', '5'],
  },
  {
    id: 'reading-expectation',
    type: 'text',
    title: '您希望学校在阅读方面提供哪些支持？',
    required: false,
    options: [],
  },
];

const readingSubmissions: QuestionnaireSubmission[] = seedTargets
  .filter(target => target.reachable)
  .slice(0, 8)
  .map((target, index) => ({
    id: `reading-submission-${index + 1}`,
    studentNo: target.studentNo,
    studentName: target.studentName,
    guardianRelation: index % 3 === 0 ? '爸爸' : '妈妈',
    submittedAt: `2026-07-${String(11 + Math.floor(index / 3)).padStart(2, '0')} ${String(9 + index).padStart(2, '0')}:20`,
    answers: {
      'reading-frequency': ['2-3次', '4-5次', '几乎每天'][index % 3],
      'reading-support': index % 2 === 0
        ? ['亲子共读', '固定阅读时间']
        : ['购买或借阅图书', '交流阅读内容'],
      'reading-interest': 3 + (index % 3),
      'reading-expectation': index % 2 === 0 ? '希望增加班级图书漂流活动。' : '可以定期推荐适龄书单。',
    },
  }));

const createDemoSubmissions = (
  prefix: string,
  targets: QuestionnaireTarget[],
  submittedAt: (index: number) => string,
  answers: (index: number) => Record<string, QuestionnaireAnswer>,
): QuestionnaireSubmission[] => targets.map((target, index) => ({
  id: `${prefix}-submission-${index + 1}`,
  studentNo: target.studentNo,
  studentName: target.studentName,
  guardianRelation: index % 3 === 0 ? '爸爸' : '妈妈',
  submittedAt: submittedAt(index),
  answers: answers(index),
}));

const seedQuestionnaires: QuestionnaireRecord[] = [
  {
    id: 'survey-reading-202607',
    title: '暑期家庭阅读情况调查',
    description: '了解孩子近期阅读习惯，为暑期阅读活动安排提供数据参考。',
    creatorName: '刘飞飞老师',
    spaceId: 'school-star',
    createdAt: '2026-07-10 09:20',
    suggestedDeadline: '2026-07-20 20:00',
    status: 'active',
    questions: readingQuestions,
    targets: seedTargets,
    submissions: readingSubmissions,
  },
  {
    id: 'survey-service-202606',
    title: '课后服务满意度调查',
    description: '收集家庭对本学期课后服务安排的反馈。',
    creatorName: '刘飞飞老师',
    spaceId: 'school-star',
    createdAt: '2026-06-18 15:10',
    suggestedDeadline: '2026-06-25 20:00',
    status: 'ended',
    questions: [
      { id: 'service-rating', type: 'rating', title: '您对本学期课后服务的整体满意度是？', required: true, options: ['1', '2', '3', '4', '5'] },
      { id: 'service-choice', type: 'single', title: '您认为当前放学时间是否合适？', required: true, options: ['偏早', '合适', '偏晚'] },
      { id: 'service-suggestion', type: 'text', title: '您对课后服务还有哪些建议？', required: false, options: [] },
    ],
    targets: seedTargets.slice(0, 10).map(target => ({ ...target, reachable: true })),
    submissions: seedTargets.slice(0, 10).map((target, index) => ({
      id: `service-submission-${index + 1}`,
      studentNo: target.studentNo,
      studentName: target.studentName,
      guardianRelation: index % 2 === 0 ? '妈妈' : '爸爸',
      submittedAt: `2026-06-${String(20 + (index % 4)).padStart(2, '0')} 18:30`,
      answers: {
        'service-rating': 3 + (index % 3),
        'service-choice': index % 4 === 0 ? '偏晚' : '合适',
        'service-suggestion': index % 3 === 0 ? '希望增加户外活动时间。' : '整体安排比较合适。',
      },
    })),
  },
  {
    id: 'survey-autumn-trip-202607',
    title: '秋季研学活动意向调查',
    description: '了解家庭参与意向与时间安排。',
    creatorName: '刘飞飞老师',
    spaceId: 'school-star',
    createdAt: '2026-07-06 14:20',
    suggestedDeadline: '2026-07-12 20:00',
    status: 'active',
    questions: [
      { id: 'trip-intention', type: 'single', title: '您是否愿意让孩子参加秋季研学活动？', required: true, options: ['愿意', '暂不确定', '不参加'] },
      { id: 'trip-note', type: 'text', title: '您还有哪些需要学校关注的问题？', required: false, options: [] },
    ],
    targets: seedTargets.slice(0, 10).map(target => ({ ...target, reachable: true })),
    submissions: createDemoSubmissions(
      'trip',
      seedTargets.slice(0, 4),
      index => `2026-07-${String(8 + index).padStart(2, '0')} 19:10`,
      index => ({ 'trip-intention': index === 3 ? '暂不确定' : '愿意', 'trip-note': index === 1 ? '希望提前公布行程。' : '' }),
    ),
  },
  {
    id: 'survey-uniform-202607',
    title: '校服尺码与增订需求确认',
    description: '收集新学期校服尺码及增订数量。',
    creatorName: '刘飞飞老师',
    spaceId: 'school-star',
    createdAt: '2026-07-13 08:40',
    suggestedDeadline: '',
    status: 'active',
    questions: [
      { id: 'uniform-size', type: 'single', title: '孩子目前适合的校服尺码是？', required: true, options: ['120', '130', '140', '150', '160'] },
      { id: 'uniform-count', type: 'single', title: '是否需要增订校服？', required: true, options: ['不需要', '增订1套', '增订2套'] },
    ],
    targets: seedTargets.slice(0, 8).map(target => ({ ...target, reachable: true })),
    submissions: createDemoSubmissions(
      'uniform',
      seedTargets.slice(0, 2),
      index => `2026-07-14 ${String(9 + index).padStart(2, '0')}:15`,
      index => ({ 'uniform-size': index === 0 ? '140' : '130', 'uniform-count': index === 0 ? '增订1套' : '不需要' }),
    ),
  },
  {
    id: 'survey-meal-202606',
    title: '校园午餐满意度调查',
    description: '收集本学期校园午餐体验反馈。',
    creatorName: '刘飞飞老师',
    spaceId: 'school-star',
    createdAt: '2026-06-10 10:10',
    suggestedDeadline: '2026-06-18 18:00',
    status: 'ended',
    questions: [
      { id: 'meal-rating', type: 'rating', title: '您对校园午餐整体满意度如何？', required: true, options: ['1', '2', '3', '4', '5'] },
      { id: 'meal-suggestion', type: 'text', title: '您对午餐还有哪些建议？', required: false, options: [] },
    ],
    targets: seedTargets.map(target => ({ ...target, reachable: true })),
    submissions: createDemoSubmissions(
      'meal',
      seedTargets.slice(0, 9),
      index => `2026-06-${String(12 + (index % 5)).padStart(2, '0')} 18:30`,
      index => ({ 'meal-rating': 3 + (index % 3), 'meal-suggestion': index % 3 === 0 ? '希望增加水果种类。' : '' }),
    ),
  },
  {
    id: 'survey-summer-care-202607',
    title: '暑期托管需求调查',
    description: '统计暑期托管参与需求。',
    creatorName: '刘飞飞老师',
    spaceId: 'school-star',
    createdAt: '2026-07-01 09:00',
    suggestedDeadline: '2026-07-05 20:00',
    status: 'ended',
    questions: [
      { id: 'care-demand', type: 'single', title: '孩子是否需要参加暑期托管？', required: true, options: ['需要', '不需要', '暂不确定'] },
    ],
    targets: seedTargets.slice(0, 10).map(target => ({ ...target, reachable: true })),
    submissions: createDemoSubmissions(
      'care',
      seedTargets.slice(0, 6),
      index => `2026-07-${String(2 + (index % 3)).padStart(2, '0')} 20:10`,
      index => ({ 'care-demand': index % 3 === 0 ? '需要' : '不需要' }),
    ),
  },
  {
    id: 'survey-campus-activity-202605',
    title: '校园活动参与情况调查',
    description: '了解家庭对校园活动安排的参与情况与反馈。',
    creatorName: '刘飞飞老师',
    spaceId: 'school-star',
    createdAt: '2026-05-20 14:30',
    suggestedDeadline: '2026-05-28 20:00',
    status: 'archived',
    questions: [
      { id: 'activity-frequency', type: 'single', title: '本学期您参加过几次校园活动？', required: true, options: ['未参加', '1次', '2次', '3次及以上'] },
      { id: 'activity-suggestion', type: 'text', title: '您希望学校增加哪些类型的活动？', required: false, options: [] },
    ],
    targets: seedTargets.slice(0, 10).map(target => ({ ...target, reachable: true })),
    submissions: createDemoSubmissions(
      'activity',
      seedTargets.slice(0, 7),
      index => `2026-05-${String(22 + (index % 5)).padStart(2, '0')} 19:20`,
      index => ({
        'activity-frequency': ['1次', '2次', '3次及以上'][index % 3],
        'activity-suggestion': index % 2 === 0 ? '希望增加亲子运动类活动。' : '可以安排更多阅读分享活动。',
      }),
    ),
  },
  {
    id: 'survey-summer-draft',
    title: '暑期安全情况摸排',
    description: '',
    creatorName: '刘飞飞老师',
    spaceId: 'school-star',
    createdAt: '2026-07-14 10:30',
    suggestedDeadline: '',
    status: 'draft',
    questions: [
      { id: 'draft-plan', type: 'single', title: '暑期是否有长途出行计划？', required: true, options: ['有', '没有', '暂未确定'] },
    ],
    targets: [],
    submissions: [],
  },
  {
    id: 'survey-home-visit-draft',
    title: '新学期家访时间调查',
    description: '',
    creatorName: '刘飞飞老师',
    spaceId: 'school-star',
    createdAt: '2026-07-14 11:20',
    suggestedDeadline: '',
    status: 'draft',
    questions: [
      { id: 'visit-period', type: 'multiple', title: '您方便接受家访的时间段是？', required: true, options: ['工作日晚间', '周六上午', '周六下午', '周日上午'] },
      { id: 'visit-note', type: 'text', title: '其他时间安排', required: false, options: [] },
    ],
    targets: [],
    submissions: [],
  },
];

type StoredQuestionnaireRecord = Omit<QuestionnaireRecord, 'suggestedDeadline'> & {
  suggestedDeadline?: string;
  deadline?: string;
};

const normalizeQuestionnaire = (record: StoredQuestionnaireRecord): QuestionnaireRecord => {
  const { deadline, ...rest } = record;
  return {
    ...rest,
    suggestedDeadline: rest.suggestedDeadline ?? deadline ?? '',
  };
};

const cloneSeed = () => (JSON.parse(JSON.stringify(seedQuestionnaires)) as StoredQuestionnaireRecord[])
  .map(normalizeQuestionnaire);

export const readQuestionnaires = (): QuestionnaireRecord[] => {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return cloneSeed();
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return cloneSeed();
    const deletedDraftIds = new Set<string>(JSON.parse(window.localStorage.getItem(DELETED_DRAFT_IDS_STORAGE_KEY) ?? '[]'));
    const storedRecords = (parsed as StoredQuestionnaireRecord[]).map(normalizeQuestionnaire);
    const storedIds = new Set(storedRecords.map(record => record.id));
    return [
      ...storedRecords,
      ...cloneSeed().filter(record => !storedIds.has(record.id) && !deletedDraftIds.has(record.id)),
    ];
  } catch {
    return cloneSeed();
  }
};

const emitStoreUpdate = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(QUESTIONNAIRE_STORE_EVENT));
  }
};

export const writeQuestionnaires = (records: QuestionnaireRecord[]) => {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
    emitStoreUpdate();
  }
  return records;
};

export const upsertQuestionnaire = (record: QuestionnaireRecord) => {
  const current = readQuestionnaires();
  const exists = current.some(item => item.id === record.id);
  return writeQuestionnaires(exists
    ? current.map(item => item.id === record.id ? record : item)
    : [record, ...current]);
};

const allowedStatusTransitions: Record<QuestionnaireStatus, QuestionnaireStatus[]> = {
  draft: ['active'],
  active: ['ended'],
  ended: ['active', 'archived'],
  archived: ['ended'],
};

export const updateQuestionnaireStatus = (id: string, status: QuestionnaireStatus) => {
  const records = readQuestionnaires();
  const record = records.find(item => item.id === id);
  if (!record || !allowedStatusTransitions[record.status].includes(status)) return false;
  writeQuestionnaires(records.map(item => item.id === id ? { ...item, status } : item));
  return true;
};

export const deleteDraftQuestionnaire = (id: string) => {
  const records = readQuestionnaires();
  const record = records.find(item => item.id === id);
  if (!record || record.status !== 'draft') return false;
  if (typeof window !== 'undefined') {
    const deletedIds = new Set<string>(JSON.parse(window.localStorage.getItem(DELETED_DRAFT_IDS_STORAGE_KEY) ?? '[]'));
    deletedIds.add(id);
    window.localStorage.setItem(DELETED_DRAFT_IDS_STORAGE_KEY, JSON.stringify(Array.from(deletedIds)));
  }
  writeQuestionnaires(records.filter(item => item.id !== id));
  return true;
};

export const submitQuestionnaireResponse = (
  questionnaireId: string,
  submission: QuestionnaireSubmission,
) => {
  const records = readQuestionnaires();
  const questionnaire = records.find(item => item.id === questionnaireId);
  const canSubmit = questionnaire?.status === 'active'
    && questionnaire.targets.some(target => target.studentNo === submission.studentNo && target.reachable)
    && !questionnaire.submissions.some(existing => existing.studentNo === submission.studentNo);
  if (!canSubmit) return false;

  writeQuestionnaires(records.map(item => item.id === questionnaireId
    ? { ...item, submissions: [...item.submissions, submission] }
    : item));
  return true;
};

export const isQuestionnaireOverdue = (record: QuestionnaireRecord, now = new Date()) => {
  if (record.status !== 'active' || !record.suggestedDeadline) return false;
  const deadlineTime = new Date(record.suggestedDeadline.replace(' ', 'T')).getTime();
  return Number.isFinite(deadlineTime) && deadlineTime < now.getTime();
};

export const getReachableTargetCount = (record: QuestionnaireRecord) => (
  record.targets.filter(target => target.reachable).length
);

export const getCompletionRate = (record: QuestionnaireRecord) => {
  const reachable = getReachableTargetCount(record);
  return reachable === 0 ? 0 : Math.round((record.submissions.length / reachable) * 100);
};

export const isQuestionnaireChoiceAnswer = (answer: QuestionnaireAnswer | undefined): answer is QuestionnaireChoiceAnswer => (
  Boolean(answer)
  && typeof answer === 'object'
  && !Array.isArray(answer)
  && 'selectedOptions' in answer
  && 'customText' in answer
);

export const getQuestionnaireSelectedOptions = (answer: QuestionnaireAnswer | undefined): string[] => {
  if (isQuestionnaireChoiceAnswer(answer)) return answer.selectedOptions;
  if (Array.isArray(answer)) return answer;
  if (typeof answer === 'string' && answer) return [answer];
  return [];
};

export const formatQuestionnaireAnswer = (answer: QuestionnaireAnswer | undefined) => {
  if (isQuestionnaireChoiceAnswer(answer)) {
    return answer.selectedOptions.map(option => {
      const text = answer.customText[option]?.trim();
      return text ? `${option}：${text}` : option;
    }).join('、');
  }
  if (Array.isArray(answer)) return answer.join('、');
  return answer === undefined || answer === '' ? '未填写' : String(answer);
};

export const createQuestionnaireId = () => `survey-${Date.now()}`;
export const createQuestionId = () => `question-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
