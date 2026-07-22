import type { FormLayoutMode, FormSection } from './formDefinition';

export type QuestionnaireStatus = 'draft' | 'active' | 'ended' | 'archived';
export type QuestionnaireCollectionMode = 'guardian_questionnaire' | 'student_information' | 'teacher_questionnaire';
export type QuestionnaireQuestionType = 'single' | 'multiple' | 'rating' | 'text' | 'short_text' | 'number' | 'date';
export type QuestionnaireTargetMode = 'all' | 'classes' | 'students';
export type StudentCollectionRecordStatus = 'pending' | 'draft' | 'completed';
export type StudentAssignmentMode = 'creator' | 'homeroom';

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
  sectionId?: string;
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

export interface StudentCollectionRecord {
  id: string;
  studentNo: string;
  studentName: string;
  classId: string;
  className: string;
  status: StudentCollectionRecordStatus;
  updatedAt: string;
  answers: Record<string, QuestionnaireAnswer>;
  assigneeTeacherId?: string;
  assigneeTeacherName?: string;
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
  creatorTeacherId?: string;
  collectionMode?: QuestionnaireCollectionMode;
  studentAssignmentMode?: StudentAssignmentMode;
  targetMode?: QuestionnaireTargetMode;
  targetClassIds?: string[];
  layoutMode?: FormLayoutMode;
  sections?: FormSection[];
  questions: QuestionnaireQuestion[];
  targets: QuestionnaireTarget[];
  submissions: QuestionnaireSubmission[];
  studentRecords?: StudentCollectionRecord[];
}

export type StudentCollectionHistoryMode = 'guardian_questionnaire' | 'student_information';

export interface StudentCollectionHistoryItem {
  id: string;
  questionnaireId: string;
  collectionMode: StudentCollectionHistoryMode;
  title: string;
  description: string;
  creatorName: string;
  respondentLabel: string;
  completedAt: string;
  questions: QuestionnaireQuestion[];
  answers: Record<string, QuestionnaireAnswer>;
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

const enrollmentInformationFields: QuestionnaireQuestion[] = [
  { id: 'enrollment-address', type: 'short_text', title: '现居住地址', required: true, options: [] },
  { id: 'enrollment-birthday', type: 'date', title: '出生日期', required: true, options: [] },
  { id: 'enrollment-height', type: 'number', title: '身高（厘米）', required: false, options: [] },
  { id: 'enrollment-residence', type: 'single', title: '户籍类型', required: true, options: ['本地户籍', '外地户籍'] },
  { id: 'enrollment-allergy', type: 'multiple', title: '需要关注的过敏原', required: false, options: ['无', '食物', '药物', '花粉'] },
  { id: 'enrollment-notes', type: 'text', title: '其他需要学校关注的情况', required: false, options: [] },
];

const createStudentCollectionRecords = (
  prefix: string,
  targets: QuestionnaireTarget[],
  completedCount: number,
  draftCount: number,
  assigneeTeacherId = 'school-star:刘飞',
  assigneeTeacherName = '刘飞',
): StudentCollectionRecord[] => targets.map((target, index) => {
  const completed = index < completedCount;
  const draft = !completed && index < completedCount + draftCount;
  return {
    id: `${prefix}-${target.studentNo}`,
    studentNo: target.studentNo,
    studentName: target.studentName,
    classId: target.classId,
    className: target.className,
    status: completed ? 'completed' : draft ? 'draft' : 'pending',
    updatedAt: completed || draft ? `2026-07-${String(12 + (index % 3)).padStart(2, '0')} ${String(9 + index).padStart(2, '0')}:20` : '',
    assigneeTeacherId,
    assigneeTeacherName,
    answers: completed || draft ? {
      'enrollment-address': `锦江区春熙路${index + 1}号`,
      'enrollment-birthday': `2019-0${(index % 8) + 1}-${String(8 + index).padStart(2, '0')}`,
      'enrollment-height': 118 + index,
      'enrollment-residence': index % 3 === 0 ? '外地户籍' : '本地户籍',
      'enrollment-allergy': index % 4 === 0 ? ['食物'] : ['无'],
      'enrollment-notes': completed && index % 3 === 0 ? '午休时需要提醒及时补充饮水。' : '',
    } : {},
  };
});

const schoolEnrollmentTargets: QuestionnaireTarget[] = [
  ['20250121', '沈知夏', 'c_2025_1', '2025级一班'],
  ['20250122', '顾晨阳', 'c_2025_1', '2025级一班'],
  ['20250123', '许安然', 'c_2025_1', '2025级一班'],
  ['20250221', '周景行', 'c_2025_2', '2025级二班'],
  ['20250222', '宋予希', 'c_2025_2', '2025级二班'],
  ['20250223', '陈嘉树', 'c_2025_2', '2025级二班'],
  ['20250421', '林星野', 'c_2025_4', '2025级四班'],
  ['20250422', '陆可心', 'c_2025_4', '2025级四班'],
  ['20250423', '赵一川', 'c_2025_4', '2025级四班'],
].map(([studentNo, studentName, classId, className], index) => ({
  studentId: `school-enrollment-${index + 1}`,
  studentNo,
  studentName,
  classId,
  className,
  reachable: true,
}));

const schoolEnrollmentRecords = createStudentCollectionRecords(
  'school-enrollment',
  schoolEnrollmentTargets,
  schoolEnrollmentTargets.length,
  0,
).map((record, index) => {
  const isCurrentTeacherClass = record.classId === 'c_2025_1' || record.classId === 'c_2025_4';
  const hasSavedContent = index === 0 || index === 1 || index === 6 || index === 7;
  return {
    ...record,
    status: index === 0 || index === 6 ? 'completed' as const : index === 1 || index === 7 ? 'draft' as const : 'pending' as const,
    updatedAt: hasSavedContent ? record.updatedAt : '',
    answers: hasSavedContent ? record.answers : {},
    assigneeTeacherId: isCurrentTeacherClass ? 'school-star:刘飞' : 'school-star:王蕾',
    assigneeTeacherName: isCurrentTeacherClass ? '刘飞' : '王蕾老师',
  };
});

const seedQuestionnaires: QuestionnaireRecord[] = [
  {
    id: 'collection-school-enrollment-202607',
    title: '一年级新生入学资料补充',
    description: '补充新生基础资料与入学关注事项。',
    creatorName: '李校长',
    creatorTeacherId: 'school-star:李校长',
    spaceId: 'school-star',
    createdAt: '2026-07-15 08:30',
    suggestedDeadline: '',
    status: 'active',
    collectionMode: 'student_information',
    studentAssignmentMode: 'homeroom',
    targetMode: 'classes',
    targetClassIds: ['c_2025_1', 'c_2025_2', 'c_2025_4'],
    questions: enrollmentInformationFields,
    targets: schoolEnrollmentTargets,
    submissions: [],
    studentRecords: schoolEnrollmentRecords,
  },
  {
    id: 'collection-enrollment-202607',
    title: '一年级新生入学信息采集',
    description: '逐一核对新生基础资料与入学关注事项。',
    creatorName: '刘飞飞老师',
    creatorTeacherId: 'school-star:刘飞',
    spaceId: 'school-star',
    createdAt: '2026-07-11 08:40',
    suggestedDeadline: '',
    status: 'active',
    collectionMode: 'student_information',
    studentAssignmentMode: 'creator',
    targetMode: 'all',
    questions: enrollmentInformationFields,
    targets: seedTargets.map(target => ({ ...target, reachable: true })),
    submissions: [],
    studentRecords: createStudentCollectionRecords('enrollment', seedTargets, 5, 2),
  },
  {
    id: 'collection-status-check-202606',
    title: '学生学籍信息核对',
    description: '核对学生本学期学籍信息。',
    creatorName: '刘飞飞老师',
    creatorTeacherId: 'school-star:刘飞',
    spaceId: 'school-star',
    createdAt: '2026-06-10 10:20',
    suggestedDeadline: '',
    status: 'ended',
    collectionMode: 'student_information',
    studentAssignmentMode: 'creator',
    targetMode: 'all',
    questions: enrollmentInformationFields.slice(0, 4),
    targets: seedTargets.slice(0, 8).map(target => ({ ...target, reachable: true })),
    submissions: [],
    studentRecords: createStudentCollectionRecords('status-check', seedTargets.slice(0, 8), 8, 0),
  },
  {
    id: 'collection-health-draft',
    title: '学生健康信息补充',
    description: '',
    creatorName: '刘飞飞老师',
    creatorTeacherId: 'school-star:刘飞',
    spaceId: 'school-star',
    createdAt: '2026-07-14 14:10',
    suggestedDeadline: '',
    status: 'draft',
    collectionMode: 'student_information',
    studentAssignmentMode: 'creator',
    targetMode: 'all',
    questions: [
      { id: 'health-height', type: 'number', title: '身高（厘米）', required: false, options: [] },
      { id: 'health-note', type: 'text', title: '健康情况补充', required: false, options: [] },
    ],
    targets: [],
    submissions: [],
    studentRecords: [],
  },
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
    collectionMode: rest.collectionMode ?? 'guardian_questionnaire',
    studentAssignmentMode: rest.studentAssignmentMode ?? 'creator',
    layoutMode: rest.layoutMode ?? 'flat',
    sections: rest.sections ?? [],
    studentRecords: rest.studentRecords ?? [],
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

export const getQuestionnaireCollectionMode = (record: QuestionnaireRecord): QuestionnaireCollectionMode => (
  record.collectionMode ?? 'guardian_questionnaire'
);

const normalizeTeacherName = (name: string) => name.replace(/老师$/u, '').trim();

const matchesTeacher = (
  assignedTeacherId: string | undefined,
  assignedTeacherName: string | undefined,
  teacherId: string,
  teacherName: string,
) => {
  if (assignedTeacherId) return assignedTeacherId === teacherId;
  if (!assignedTeacherName) return false;
  const assignedName = normalizeTeacherName(assignedTeacherName);
  const currentName = normalizeTeacherName(teacherName);
  return assignedName === currentName || assignedName.startsWith(currentName) || currentName.startsWith(assignedName);
};

export const isQuestionnaireCreatedByTeacher = (
  record: QuestionnaireRecord,
  teacherId: string,
  teacherName: string,
) => matchesTeacher(record.creatorTeacherId, record.creatorName, teacherId, teacherName);

export const getStudentCollectionRecordsForTeacher = (
  record: QuestionnaireRecord,
  teacherId: string,
  teacherName: string,
): StudentCollectionRecord[] => {
  if (getQuestionnaireCollectionMode(record) !== 'student_information') return [];
  const recordsByStudentNo = new Map((record.studentRecords ?? []).map(item => [item.studentNo, item]));
  const studentRecords: StudentCollectionRecord[] = record.targets.map(target => recordsByStudentNo.get(target.studentNo) ?? {
    id: `${record.id}-${target.studentNo}`,
    studentNo: target.studentNo,
    studentName: target.studentName,
    classId: target.classId,
    className: target.className,
    status: 'pending' as const,
    updatedAt: '',
    answers: {},
  });
  return studentRecords.filter(item => {
    if (item.assigneeTeacherId || item.assigneeTeacherName) {
      return matchesTeacher(item.assigneeTeacherId, item.assigneeTeacherName, teacherId, teacherName);
    }
    return (record.studentAssignmentMode ?? 'creator') === 'creator'
      && isQuestionnaireCreatedByTeacher(record, teacherId, teacherName);
  });
};

export const getPendingAssignedStudentCollections = (
  records: QuestionnaireRecord[],
  teacherId: string,
  teacherName: string,
  spaceId?: string,
) => records.filter(record => {
  if (
    record.status !== 'active'
    || getQuestionnaireCollectionMode(record) !== 'student_information'
    || spaceId && record.spaceId !== spaceId
  ) return false;
  const assignedRecords = getStudentCollectionRecordsForTeacher(record, teacherId, teacherName);
  return assignedRecords.length > 0 && assignedRecords.some(item => item.status !== 'completed');
});

const formatTeacherRespondentLabel = (teacherName: string) => {
  const normalized = teacherName.trim();
  if (!normalized) return '老师更新';
  return `${normalized.endsWith('老师') ? normalized : `${normalized}老师`}更新`;
};

export const getCompletedStudentCollectionHistory = (
  records: QuestionnaireRecord[],
  studentNo: string,
  teacherId: string,
  teacherName: string,
  spaceId?: string,
): StudentCollectionHistoryItem[] => {
  const history: StudentCollectionHistoryItem[] = [];
  records.forEach(record => {
    if (record.status === 'draft' || spaceId && record.spaceId !== spaceId) return;
    const mode = getQuestionnaireCollectionMode(record);
    const createdByCurrentTeacher = isQuestionnaireCreatedByTeacher(record, teacherId, teacherName);

    if (mode === 'guardian_questionnaire') {
      if (!createdByCurrentTeacher) return;
      const submission = record.submissions.find(item => item.studentNo === studentNo);
      if (!submission) return;
      history.push({
        id: `${record.id}-${submission.id}`,
        questionnaireId: record.id,
        collectionMode: mode,
        title: record.title,
        description: record.description,
        creatorName: record.creatorName,
        respondentLabel: `${submission.guardianRelation}填写`,
        completedAt: submission.submittedAt,
        questions: record.questions,
        answers: submission.answers,
      });
      return;
    }

    if (mode === 'student_information') {
      const studentRecord = (record.studentRecords ?? []).find(item => (
        item.studentNo === studentNo && item.status === 'completed'
      ));
      if (!studentRecord) return;
      const assignedToCurrentTeacher = getStudentCollectionRecordsForTeacher(
        record,
        teacherId,
        teacherName,
      ).some(item => item.studentNo === studentNo);
      if (!createdByCurrentTeacher && !assignedToCurrentTeacher) return;
      history.push({
        id: `${record.id}-${studentRecord.id}`,
        questionnaireId: record.id,
        collectionMode: mode,
        title: record.title,
        description: record.description,
        creatorName: record.creatorName,
        respondentLabel: formatTeacherRespondentLabel(studentRecord.assigneeTeacherName ?? record.creatorName),
        completedAt: studentRecord.updatedAt,
        questions: record.questions,
        answers: studentRecord.answers,
      });
    }
  });
  return history.sort((left, right) => right.completedAt.localeCompare(left.completedAt));
};

export const getStudentCollectionCompletedCount = (record: QuestionnaireRecord) => (
  (record.studentRecords ?? []).filter(item => item.status === 'completed').length
);

export const isQuestionnaireFullyCollected = (record: QuestionnaireRecord) => {
  const reachable = getReachableTargetCount(record);
  const completed = getQuestionnaireCollectionMode(record) === 'student_information'
    ? getStudentCollectionCompletedCount(record)
    : record.submissions.length;
  return reachable > 0 && completed >= reachable;
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
  if (
    record.status === 'ended'
    && status === 'active'
    && getQuestionnaireCollectionMode(record) === 'guardian_questionnaire'
    && isQuestionnaireFullyCollected(record)
  ) return false;
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
    && getQuestionnaireCollectionMode(questionnaire) === 'guardian_questionnaire'
    && questionnaire.targets.some(target => target.studentNo === submission.studentNo && target.reachable)
    && !questionnaire.submissions.some(existing => existing.studentNo === submission.studentNo);
  if (!canSubmit) return false;

  writeQuestionnaires(records.map(item => item.id === questionnaireId
    ? { ...item, submissions: [...item.submissions, submission] }
    : item));
  return true;
};

export const saveStudentCollectionRecord = (
  questionnaireId: string,
  studentRecord: StudentCollectionRecord,
  teacherId?: string,
  teacherName?: string,
) => {
  const records = readQuestionnaires();
  const questionnaire = records.find(item => item.id === questionnaireId);
  const assignedRecord = questionnaire && getStudentCollectionRecordsForTeacher(
    questionnaire,
    teacherId ?? '',
    teacherName ?? '',
  ).find(item => item.studentNo === studentRecord.studentNo);
  const canSave = questionnaire?.status === 'active'
    && getQuestionnaireCollectionMode(questionnaire) === 'student_information'
    && questionnaire.targets.some(target => target.studentNo === studentRecord.studentNo)
    && (!teacherId || !teacherName || Boolean(assignedRecord));
  if (!canSave || !questionnaire) return false;

  const currentRecords = questionnaire.studentRecords ?? [];
  const exists = currentRecords.some(item => item.studentNo === studentRecord.studentNo);
  writeQuestionnaires(records.map(item => item.id === questionnaireId
    ? {
        ...item,
        studentRecords: exists
          ? currentRecords.map(existing => existing.studentNo === studentRecord.studentNo ? studentRecord : existing)
          : [...currentRecords, studentRecord],
      }
    : item));
  return true;
};

export const isQuestionnaireOverdue = (record: QuestionnaireRecord, now = new Date()) => {
  if (record.status !== 'active' || !record.suggestedDeadline) return false;
  const deadlineTime = new Date(record.suggestedDeadline.replace(' ', 'T')).getTime();
  return Number.isFinite(deadlineTime) && deadlineTime < now.getTime();
};

export const getReachableTargetCount = (record: QuestionnaireRecord) => (
  getQuestionnaireCollectionMode(record) === 'student_information'
    ? record.targets.length
    : record.targets.filter(target => target.reachable).length
);

export const getCompletionRate = (record: QuestionnaireRecord) => {
  const reachable = getReachableTargetCount(record);
  const completed = getQuestionnaireCollectionMode(record) === 'student_information'
    ? getStudentCollectionCompletedCount(record)
    : record.submissions.length;
  return reachable === 0 ? 0 : Math.round((completed / reachable) * 100);
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
