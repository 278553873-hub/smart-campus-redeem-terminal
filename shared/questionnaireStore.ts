import { normalizeFormFieldSettings, type FormFieldSettings, type FormLayoutMode, type FormSection, type FormSubField } from './formDefinition';
import type { GrowthInputFieldKey } from './studentGrowthFieldCatalog';
import type { ArchiveTemplateSnapshot } from './studentArchiveStore';
import type { QuestionnaireHeaderImageId, QuestionnaireThemeId } from './questionnaireThemeTokens';
import {
  createGrowthCollectionQuestions,
  isGrowthCollectionQuestion,
} from './growthCollectionDefinition';

export type QuestionnaireStatus = 'draft' | 'active' | 'ended' | 'archived';
export type QuestionnaireCollectionMode = 'guardian_questionnaire' | 'student_information' | 'teacher_questionnaire';
export type QuestionnaireContentType = 'ordinary' | 'growth' | 'mixed';
export type QuestionnaireRespondentRole = 'teacher' | 'guardian';
export type GrowthRecordDateMode = 'respondent' | 'fixed';
export type QuestionnaireQuestionType = 'single' | 'multiple' | 'rating' | 'text' | 'short_text' | 'multi_fill' | 'number' | 'date';
export type QuestionnaireTargetMode = 'all' | 'classes' | 'students';
export type QuestionnaireTargetSyncPolicy = 'fixed' | 'follow_classes';
export type QuestionnaireTargetScopeStatus = 'active' | 'exited';
export type StudentCollectionRecordStatus = 'pending' | 'completed';
export type StudentAssignmentMode = 'creator' | 'homeroom';
export type GrowthCollectionTemplate = 'height_weight' | 'semester_goal';
export type QuestionnaireReviewStatus = 'pending' | 'confirmed' | 'returned';

export interface QuestionnaireChoiceAnswer {
  selectedOptions: string[];
  customText: Record<string, string>;
}

export interface QuestionnaireMultiFillAnswer {
  fillValues: Record<string, string>;
}

export type QuestionnaireAnswer = string | string[] | number | QuestionnaireChoiceAnswer | QuestionnaireMultiFillAnswer;

export interface QuestionnaireQuestion {
  id: string;
  type: QuestionnaireQuestionType;
  title: string;
  required: boolean;
  options: string[];
  customAnswerOptions?: string[];
  subFields?: FormSubField[];
  sectionId?: string;
  settings?: FormFieldSettings;
  growthFieldKey?: GrowthInputFieldKey;
  growthRecordedAt?: boolean;
  archiveTemplateId?: string;
  archiveFieldId?: string;
  archiveFieldSemanticKey?: string;
}

export interface QuestionnaireTarget {
  studentId: string;
  studentNo: string;
  studentName: string;
  classId: string;
  className: string;
  reachable: boolean;
  scopeStatus?: QuestionnaireTargetScopeStatus;
}

export interface QuestionnaireSubmission {
  id: string;
  studentNo: string;
  studentName: string;
  guardianRelation: string;
  submittedAt: string;
  answers: Record<string, QuestionnaireAnswer>;
  reviewStatus?: QuestionnaireReviewStatus;
  reviewerName?: string;
  reviewedAt?: string;
  teacherMessage?: string;
  returnReason?: string;
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

export interface QuestionnaireResultRecord {
  id: string;
  studentNo: string;
  studentName: string;
  classId: string;
  className: string;
  respondentRole: QuestionnaireRespondentRole;
  respondentLabel: string;
  completedAt: string;
  answers: Record<string, QuestionnaireAnswer>;
}

export interface QuestionnaireRecord {
  id: string;
  inviteCode?: string;
  title: string;
  description: string;
  creatorName: string;
  spaceId: string;
  createdAt: string;
  suggestedDeadline: string;
  status: QuestionnaireStatus;
  creatorTeacherId?: string;
  contentType?: QuestionnaireContentType;
  respondentRole?: QuestionnaireRespondentRole;
  collectionMode?: QuestionnaireCollectionMode;
  growthTemplate?: GrowthCollectionTemplate;
  growthRecordDateMode?: GrowthRecordDateMode;
  growthMeasurementDate?: string;
  growthTerm?: string;
  growthDimensionOptions?: string[];
  archiveTemplateId?: string;
  archiveTemplateName?: string;
  archiveTemplateVersion?: number;
  archiveTemplateSnapshot?: ArchiveTemplateSnapshot;
  archivePeriodKey?: string;
  archivePeriodLabel?: string;
  archiveSkippedStudentNos?: string[];
  studentAssignmentMode?: StudentAssignmentMode;
  themeId?: QuestionnaireThemeId;
  headerImageId?: QuestionnaireHeaderImageId;
  targetMode?: QuestionnaireTargetMode;
  targetClassIds?: string[];
  targetSyncPolicy?: QuestionnaireTargetSyncPolicy;
  layoutMode?: FormLayoutMode;
  sections?: FormSection[];
  oneQuestionPerPage?: boolean;
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
  assigneeTeacherId = 'school-star:刘飞',
  assigneeTeacherName = '刘飞',
): StudentCollectionRecord[] => targets.map((target, index) => {
  const completed = index < completedCount;
  return {
    id: `${prefix}-${target.studentNo}`,
    studentNo: target.studentNo,
    studentName: target.studentName,
    classId: target.classId,
    className: target.className,
    status: completed ? 'completed' : 'pending',
    updatedAt: completed ? `2026-07-${String(12 + (index % 3)).padStart(2, '0')} ${String(9 + index).padStart(2, '0')}:20` : '',
    assigneeTeacherId,
    assigneeTeacherName,
    answers: completed ? {
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
).map((record, index) => {
  const isCurrentTeacherClass = record.classId === 'c_2025_1' || record.classId === 'c_2025_4';
  const completed = index === 0 || index === 6;
  return {
    ...record,
    status: completed ? 'completed' as const : 'pending' as const,
    updatedAt: completed ? record.updatedAt : '',
    answers: completed ? record.answers : {},
    assigneeTeacherId: isCurrentTeacherClass ? 'school-star:刘飞' : 'school-star:王蕾',
    assigneeTeacherName: isCurrentTeacherClass ? '刘飞' : '王蕾老师',
  };
});

const seedQuestionnaires: QuestionnaireRecord[] = [
  {
    id: 'growth-semester-goal-2026-autumn',
    title: '2026年秋季学期目标制定',
    description: '',
    creatorName: '刘飞飞老师',
    creatorTeacherId: 'school-star:刘飞',
    spaceId: 'school-star',
    createdAt: '2026-07-28 09:10',
    suggestedDeadline: '',
    status: 'active',
    contentType: 'growth',
    respondentRole: 'guardian',
    collectionMode: 'guardian_questionnaire',
    growthTemplate: 'semester_goal',
    growthTerm: '2026年秋季学期',
    growthDimensionOptions: ['明德', '善学', '健体', '尚美', '力行'],
    targetMode: 'classes',
    targetClassIds: ['c_2025_1'],
    targetSyncPolicy: 'follow_classes',
    layoutMode: 'flat',
    sections: [],
    questions: createGrowthCollectionQuestions('semester_goal', ['明德', '善学', '健体', '尚美', '力行'], 'guardian'),
    targets: seedTargets.slice(0, 6).map(target => ({ ...target, reachable: true })),
    submissions: [{
      id: 'goal-submission-pending-20250101',
      studentNo: seedTargets[0].studentNo,
      studentName: seedTargets[0].studentName,
      guardianRelation: '妈妈',
      submittedAt: '2026-07-29 20:16',
      reviewStatus: 'pending',
      answers: {
        'goal-previous-reflection': '上学期我开始主动帮助同学，也更敢在课堂上表达。',
        'goal-1-dimension': '明德',
        'goal-1-reason': '帮助别人时我也会感到快乐。',
        'goal-1-action': '每周主动帮助同学2次。',
        'goal-1-assessment': '我能做到',
        'goal-2-dimension': '善学',
        'goal-2-reason': '我想让课堂表达更清楚。',
        'goal-2-action': '每周至少主动举手发言3次。',
        'goal-2-assessment': '我需要努力',
        'goal-student-message': '希望老师提醒我坚持记录。',
        'goal-parent-message': '我们会每周和孩子一起回顾一次。',
        'goal-agreement': '每周日一起回顾目标完成情况。',
        'goal-student-signature': seedTargets[0].studentName,
        'goal-parent-signature': '妈妈',
        'goal-signature-date': '2026-07-29',
      },
    }],
    studentRecords: [],
  },
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
    studentRecords: createStudentCollectionRecords('enrollment', seedTargets, 5),
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
    studentRecords: createStudentCollectionRecords('status-check', seedTargets.slice(0, 8), 8),
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
  const collectionMode = rest.collectionMode ?? 'guardian_questionnaire';
  const respondentRole = rest.respondentRole ?? (collectionMode === 'guardian_questionnaire' ? 'guardian' : 'teacher');
  return {
    ...rest,
    suggestedDeadline: rest.suggestedDeadline ?? deadline ?? '',
    contentType: inferQuestionnaireContentType(rest.questions, rest.growthTemplate),
    respondentRole,
    collectionMode,
    themeId: rest.themeId ?? 'classic-red',
    headerImageId: rest.headerImageId ?? 'none',
    studentAssignmentMode: rest.studentAssignmentMode ?? 'creator',
    targetSyncPolicy: rest.targetSyncPolicy ?? 'fixed',
    layoutMode: rest.layoutMode ?? 'flat',
    sections: rest.sections ?? [],
    oneQuestionPerPage: rest.oneQuestionPerPage ?? respondentRole === 'guardian',
    questions: rest.questions.map(question => ({
      ...question,
      options: [...question.options],
      customAnswerOptions: [...(question.customAnswerOptions ?? [])],
      subFields: question.subFields?.map(subField => ({ ...subField })),
      settings: normalizeFormFieldSettings(question.type, question.settings, question.options),
    })),
    targets: rest.targets.map(target => ({
      ...target,
      scopeStatus: target.scopeStatus ?? 'active',
    })),
    studentRecords: (rest.studentRecords ?? []).map(item => item.status === 'completed'
      ? item
      : {
          ...item,
          status: 'pending',
          updatedAt: '',
          answers: {},
        }),
  };
};

const cloneSeed = () => (JSON.parse(JSON.stringify(seedQuestionnaires)) as StoredQuestionnaireRecord[])
  .map(normalizeQuestionnaire)
  .filter(record => record.status !== 'draft');

const LEGACY_SEED_DRAFT_IDS = new Set([
  'collection-health-draft',
  'survey-summer-draft',
  'survey-home-visit-draft',
]);

export const readQuestionnaires = (): QuestionnaireRecord[] => {
  if (typeof window === 'undefined') return cloneSeed();
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) return cloneSeed();
    const parsed = JSON.parse(stored);
    if (!Array.isArray(parsed)) return cloneSeed();
    const deletedDraftIds = new Set<string>(JSON.parse(window.localStorage.getItem(DELETED_DRAFT_IDS_STORAGE_KEY) ?? '[]'));
    const storedRecords = (parsed as StoredQuestionnaireRecord[])
      .map(normalizeQuestionnaire)
      .filter(record => !LEGACY_SEED_DRAFT_IDS.has(record.id));
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
  const existing = current.find(item => item.id === record.id);
  if (existing && existing.status !== 'draft') return current;
  return writeQuestionnaires(existing
    ? current.map(item => item.id === record.id ? record : item)
    : [record, ...current]);
};

export const createQuestionnaireInviteCode = () => {
  const randomPart = typeof crypto !== 'undefined' && 'randomUUID' in crypto
    ? crypto.randomUUID().replaceAll('-', '')
    : Math.random().toString(36).slice(2) + Math.random().toString(36).slice(2);
  return `questionnaire-${randomPart.slice(0, 24)}`;
};

export const publishQuestionnaire = (record: QuestionnaireRecord): QuestionnaireRecord | null => {
  if (record.status !== 'active') return null;
  const current = readQuestionnaires();
  const existing = current.find(item => item.id === record.id);
  if (existing && existing.status !== 'draft') return null;
  const publishedRecord = {
    ...record,
    inviteCode: record.inviteCode ?? existing?.inviteCode ?? createQuestionnaireInviteCode(),
  };
  writeQuestionnaires(existing
    ? current.map(item => item.id === publishedRecord.id ? publishedRecord : item)
    : [publishedRecord, ...current]);
  return publishedRecord;
};

export const ensureQuestionnaireInviteCode = (id: string): QuestionnaireRecord | null => {
  const records = readQuestionnaires();
  const record = records.find(item => item.id === id);
  if (
    !record
    || record.status !== 'active'
    || getQuestionnaireCollectionMode(record) !== 'guardian_questionnaire'
  ) return null;
  if (record.inviteCode) return record;
  const nextRecord = { ...record, inviteCode: createQuestionnaireInviteCode() };
  writeQuestionnaires(records.map(item => item.id === id ? nextRecord : item));
  return nextRecord;
};

export const getQuestionnaireByInviteCode = (
  inviteCode: string,
  records: QuestionnaireRecord[] = readQuestionnaires(),
) => records.find(record => record.inviteCode === inviteCode) ?? null;

type QuestionnaireDraftSource = Pick<QuestionnaireRecord, 'spaceId' | 'creatorTeacherId' | 'creatorName' | 'respondentRole' | 'collectionMode'>;

const getStoredRespondentRole = (record: Pick<QuestionnaireRecord, 'respondentRole' | 'collectionMode'>): QuestionnaireRespondentRole => (
  record.respondentRole ?? (record.collectionMode === 'student_information' ? 'teacher' : 'guardian')
);

const matchesQuestionnaireDraftSource = (
  record: QuestionnaireRecord,
  source: QuestionnaireDraftSource,
) => record.status === 'draft'
  && record.spaceId === source.spaceId
  && (source.creatorTeacherId
    ? record.creatorTeacherId === source.creatorTeacherId
    : record.creatorName === source.creatorName)
  && getStoredRespondentRole(record) === getStoredRespondentRole(source);

export const upsertQuestionnaireDraftForSource = (record: QuestionnaireRecord) => {
  if (record.status !== 'draft') return upsertQuestionnaire(record);
  const current = readQuestionnaires();
  return writeQuestionnaires([
    record,
    ...current.filter(item => item.id !== record.id && !matchesQuestionnaireDraftSource(item, record)),
  ]);
};

export const deleteQuestionnaireDraftsForSource = (source: QuestionnaireDraftSource) => {
  const current = readQuestionnaires();
  return writeQuestionnaires(current.filter(record => !matchesQuestionnaireDraftSource(record, source)));
};

export const getQuestionnaireCollectionMode = (record: QuestionnaireRecord): QuestionnaireCollectionMode => (
  record.collectionMode ?? (record.respondentRole === 'teacher' ? 'student_information' : 'guardian_questionnaire')
);

export const getQuestionnaireContentType = (record: QuestionnaireRecord): QuestionnaireContentType => (
  inferQuestionnaireContentType(record.questions, record.growthTemplate)
);

export const isBodyGrowthQuestion = isGrowthCollectionQuestion;

export const inferQuestionnaireContentType = (
  questions: QuestionnaireQuestion[],
  legacyTemplate?: GrowthCollectionTemplate,
): QuestionnaireContentType => {
  if (legacyTemplate === 'semester_goal') return 'growth';
  const hasGrowthFields = questions.some(isBodyGrowthQuestion);
  const hasOrdinaryFields = questions.some(question => !isBodyGrowthQuestion(question));
  if (hasGrowthFields && hasOrdinaryFields) return 'mixed';
  return hasGrowthFields || legacyTemplate === 'height_weight' ? 'growth' : 'ordinary';
};

export const hasGrowthCollectionFields = (record: QuestionnaireRecord) => (
  getQuestionnaireContentType(record) !== 'ordinary'
);

export const getQuestionnaireRespondentRole = (record: QuestionnaireRecord): QuestionnaireRespondentRole => (
  record.respondentRole ?? (getQuestionnaireCollectionMode(record) === 'guardian_questionnaire' ? 'guardian' : 'teacher')
);

export const isQuestionnaireOneQuestionPerPage = (record: QuestionnaireRecord) => (
  record.oneQuestionPerPage ?? getQuestionnaireRespondentRole(record) === 'guardian'
);

export const getActiveQuestionnaireTargets = (record: QuestionnaireRecord): QuestionnaireTarget[] => (
  record.targets.filter(target => (target.scopeStatus ?? 'active') === 'active')
);

interface ReconcileQuestionnaireTargetsOptions {
  resolveStudentAssignee?: (target: QuestionnaireTarget) => { id: string; name: string };
}

export const reconcileQuestionnaireTargets = (
  record: QuestionnaireRecord,
  currentClassTargets: QuestionnaireTarget[],
  options: ReconcileQuestionnaireTargetsOptions = {},
): QuestionnaireRecord => {
  if (record.status !== 'active') return record;

  const currentByStudentNo = new Map(currentClassTargets.map(target => [target.studentNo, target]));
  if (record.targetSyncPolicy === 'fixed') {
    let fixedTargetsChanged = false;
    const nextFixedTargets = record.targets.map(target => {
      const currentTarget = currentByStudentNo.get(target.studentNo);
      if (!currentTarget) return target;
      const nextTarget: QuestionnaireTarget = { ...target, ...currentTarget, scopeStatus: target.scopeStatus ?? 'active' };
      if (
        target.studentId !== nextTarget.studentId
        || target.studentName !== nextTarget.studentName
        || target.classId !== nextTarget.classId
        || target.className !== nextTarget.className
        || target.reachable !== nextTarget.reachable
      ) fixedTargetsChanged = true;
      return nextTarget;
    });
    return fixedTargetsChanged ? { ...record, targets: nextFixedTargets } : record;
  }

  if (record.targetSyncPolicy !== 'follow_classes' || !record.targetClassIds?.length) return record;

  const followedClassIds = new Set(record.targetClassIds);
  const followedCurrentByStudentNo = new Map(currentClassTargets
    .filter(target => followedClassIds.has(target.classId))
    .map(target => [target.studentNo, target]));
  const existingByStudentNo = new Map(record.targets.map(target => [target.studentNo, target]));
  let changed = false;

  const nextTargets = record.targets.map(target => {
    if (!followedClassIds.has(target.classId)) return target;
    const currentTarget = followedCurrentByStudentNo.get(target.studentNo);
    if (!currentTarget) {
      if ((target.scopeStatus ?? 'active') === 'exited') return target;
      changed = true;
      return { ...target, scopeStatus: 'exited' as const };
    }
    followedCurrentByStudentNo.delete(target.studentNo);
    const nextTarget: QuestionnaireTarget = { ...target, ...currentTarget, scopeStatus: 'active' };
    if (
      target.studentId !== nextTarget.studentId
      || target.studentName !== nextTarget.studentName
      || target.classId !== nextTarget.classId
      || target.className !== nextTarget.className
      || target.reachable !== nextTarget.reachable
      || (target.scopeStatus ?? 'active') !== 'active'
    ) changed = true;
    return nextTarget;
  });

  followedCurrentByStudentNo.forEach(target => {
    if (existingByStudentNo.has(target.studentNo)) return;
    changed = true;
    nextTargets.push({ ...target, scopeStatus: 'active' });
  });

  if (!changed) return record;

  let nextStudentRecords = record.studentRecords;
  if (getQuestionnaireCollectionMode(record) === 'student_information') {
    const existingRecordNos = new Set((record.studentRecords ?? []).map(item => item.studentNo));
    const additions = nextTargets.filter(target => (
      (target.scopeStatus ?? 'active') === 'active' && !existingRecordNos.has(target.studentNo)
    ));
    nextStudentRecords = [
      ...(record.studentRecords ?? []),
      ...additions.map(target => {
        const assignee = record.studentAssignmentMode === 'creator'
          ? { id: record.creatorTeacherId ?? '', name: record.creatorName }
          : options.resolveStudentAssignee?.(target);
        return {
          id: `${record.id}-${target.studentNo}`,
          studentNo: target.studentNo,
          studentName: target.studentName,
          classId: target.classId,
          className: target.className,
          status: 'pending' as const,
          updatedAt: '',
          answers: {},
          assigneeTeacherId: assignee?.id,
          assigneeTeacherName: assignee?.name,
        };
      }),
    ];
  }

  return { ...record, targets: nextTargets, studentRecords: nextStudentRecords };
};

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
  const studentRecords: StudentCollectionRecord[] = getActiveQuestionnaireTargets(record).map(target => recordsByStudentNo.get(target.studentNo) ?? {
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

export const getStudentCollectionCompletedCount = (record: QuestionnaireRecord) => {
  const activeTargetNos = new Set(getActiveQuestionnaireTargets(record).map(target => target.studentNo));
  return (record.studentRecords ?? []).filter(item => item.status === 'completed' && activeTargetNos.has(item.studentNo)).length;
};

export const getQuestionnaireCompletedCount = (record: QuestionnaireRecord) => {
  const activeTargetNos = new Set(getActiveQuestionnaireTargets(record).map(target => target.studentNo));
  return record.submissions.filter(submission => activeTargetNos.has(submission.studentNo)).length;
};

export const getQuestionnaireResultRecords = (record: QuestionnaireRecord): QuestionnaireResultRecord[] => {
  const activeTargets = getActiveQuestionnaireTargets(record);
  const targetByStudentNo = new Map(activeTargets.map(target => [target.studentNo, target]));

  if (getQuestionnaireRespondentRole(record) === 'teacher') {
    return (record.studentRecords ?? [])
      .filter(item => item.status === 'completed' && targetByStudentNo.has(item.studentNo))
      .map(item => {
        const target = targetByStudentNo.get(item.studentNo)!;
        return {
          id: item.id,
          studentNo: item.studentNo,
          studentName: item.studentName,
          classId: item.classId || target.classId,
          className: item.className || target.className,
          respondentRole: 'teacher' as const,
          respondentLabel: item.assigneeTeacherName ?? record.creatorName,
          completedAt: item.updatedAt,
          answers: item.answers,
        };
      });
  }

  return record.submissions
    .filter(item => targetByStudentNo.has(item.studentNo))
    .map(item => {
      const target = targetByStudentNo.get(item.studentNo)!;
      return {
        id: item.id,
        studentNo: item.studentNo,
        studentName: item.studentName,
        classId: target.classId,
        className: target.className,
        respondentRole: 'guardian' as const,
        respondentLabel: item.guardianRelation,
        completedAt: item.submittedAt,
        answers: item.answers,
      };
    });
};

export const isQuestionnaireFullyCollected = (record: QuestionnaireRecord) => {
  const reachable = getReachableTargetCount(record);
  const completed = getQuestionnaireCollectionMode(record) === 'student_information'
    ? getStudentCollectionCompletedCount(record)
    : getQuestionnaireCompletedCount(record);
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
  const existingSubmission = questionnaire?.submissions.find(existing => existing.studentNo === submission.studentNo);
  const canResubmitReturnedGoal = questionnaire?.growthTemplate === 'semester_goal'
    && existingSubmission?.reviewStatus === 'returned';
  const canSubmit = questionnaire?.status === 'active'
    && getQuestionnaireCollectionMode(questionnaire) === 'guardian_questionnaire'
    && getActiveQuestionnaireTargets(questionnaire).some(target => target.studentNo === submission.studentNo && target.reachable)
    && (!existingSubmission || canResubmitReturnedGoal);
  if (!canSubmit || questionnaire.questions.some(question => getQuestionnaireAnswerValidationError(question, submission.answers[question.id]))) return false;

  const normalizedSubmission: QuestionnaireSubmission = questionnaire.growthTemplate === 'semester_goal'
    ? { ...submission, reviewStatus: 'pending' }
    : submission;
  writeQuestionnaires(records.map(item => item.id === questionnaireId
    ? {
        ...item,
        submissions: existingSubmission
          ? item.submissions.map(existing => existing.studentNo === submission.studentNo ? normalizedSubmission : existing)
          : [...item.submissions, normalizedSubmission],
      }
    : item));
  return true;
};

export const reviewSemesterGoalSubmission = (
  questionnaireId: string,
  submissionId: string,
  action: 'confirm' | 'return',
  payload: { reviewerName: string; teacherMessage?: string; returnReason?: string },
) => {
  const records = readQuestionnaires();
  const questionnaire = records.find(item => item.id === questionnaireId);
  const submission = questionnaire?.submissions.find(item => item.id === submissionId);
  const canReview = questionnaire
    && questionnaire.growthTemplate === 'semester_goal'
    && getQuestionnaireCollectionMode(questionnaire) === 'guardian_questionnaire'
    && (questionnaire.status === 'active' || questionnaire.status === 'ended')
    && submission?.reviewStatus === 'pending';
  const requiredComment = action === 'confirm' ? payload.teacherMessage : payload.returnReason;
  if (!canReview || !submission || !payload.reviewerName.trim() || !requiredComment?.trim()) return null;

  const reviewedAt = new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');
  const reviewedSubmission: QuestionnaireSubmission = {
    ...submission,
    reviewStatus: action === 'confirm' ? 'confirmed' : 'returned',
    reviewerName: payload.reviewerName.trim(),
    reviewedAt,
    teacherMessage: action === 'confirm' ? payload.teacherMessage?.trim() : undefined,
    returnReason: action === 'return' ? payload.returnReason?.trim() : undefined,
  };
  writeQuestionnaires(records.map(item => item.id === questionnaireId
    ? {
        ...item,
        submissions: item.submissions.map(existing => existing.id === submissionId ? reviewedSubmission : existing),
      }
    : item));
  return reviewedSubmission;
};

export const completeStudentCollectionRecord = (
  questionnaireId: string,
  studentRecord: StudentCollectionRecord & { status: 'completed' },
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
    && getActiveQuestionnaireTargets(questionnaire).some(target => target.studentNo === studentRecord.studentNo)
    && (!teacherId || !teacherName || Boolean(assignedRecord));
  if (!canSave || !questionnaire) return false;
  if (questionnaire.questions.some(question => getQuestionnaireAnswerValidationError(question, studentRecord.answers[question.id]))) return false;

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
    ? getActiveQuestionnaireTargets(record).length
    : getActiveQuestionnaireTargets(record).filter(target => target.reachable).length
);

export const getCompletionRate = (record: QuestionnaireRecord) => {
  const reachable = getReachableTargetCount(record);
  const completed = getQuestionnaireCollectionMode(record) === 'student_information'
    ? getStudentCollectionCompletedCount(record)
    : getQuestionnaireCompletedCount(record);
  return reachable === 0 ? 0 : Math.round((completed / reachable) * 100);
};

export const isQuestionnaireChoiceAnswer = (answer: QuestionnaireAnswer | undefined): answer is QuestionnaireChoiceAnswer => (
  Boolean(answer)
  && typeof answer === 'object'
  && !Array.isArray(answer)
  && 'selectedOptions' in answer
  && 'customText' in answer
);

export const isQuestionnaireMultiFillAnswer = (answer: QuestionnaireAnswer | undefined): answer is QuestionnaireMultiFillAnswer => (
  Boolean(answer)
  && typeof answer === 'object'
  && !Array.isArray(answer)
  && 'fillValues' in answer
  && typeof answer.fillValues === 'object'
  && answer.fillValues !== null
);

export const getQuestionnaireMultiFillValues = (answer: QuestionnaireAnswer | undefined): Record<string, string> => (
  isQuestionnaireMultiFillAnswer(answer) ? answer.fillValues : {}
);

export const getQuestionnaireSelectedOptions = (answer: QuestionnaireAnswer | undefined): string[] => {
  if (isQuestionnaireChoiceAnswer(answer)) return answer.selectedOptions;
  if (Array.isArray(answer)) return answer;
  if (typeof answer === 'string' && answer) return [answer];
  return [];
};

export const getQuestionnaireAnswerValidationError = (
  question: QuestionnaireQuestion,
  answer: QuestionnaireAnswer | undefined,
): string => {
  if (question.type === 'multi_fill') {
    const subFields = question.subFields ?? [];
    const fillValues = getQuestionnaireMultiFillValues(answer);
    const missingRequired = subFields.find(subField => subField.required && !fillValues[subField.id]?.trim());
    if (missingRequired) return `请填写“${question.title}”中的“${missingRequired.label}”`;
    const hasAnswer = subFields.some(subField => Boolean(fillValues[subField.id]?.trim()));
    if (question.required && !hasAnswer) return `请填写“${question.title}”`;
    const tooLong = subFields.find(subField => (fillValues[subField.id] ?? '').length > 120);
    if (tooLong) return `“${tooLong.label}”最多填写120个字符`;
    return '';
  }
  const selectedOptions = getQuestionnaireSelectedOptions(answer);
  const empty = question.type === 'single' || question.type === 'multiple'
    ? selectedOptions.length === 0
    : answer === undefined || String(answer).trim() === '';
  if (question.required && empty) return `请填写“${question.title}”`;
  if (empty) return '';

  if (question.type === 'multiple') {
    const settings = normalizeFormFieldSettings(question.type, question.settings, question.options);
    const min = settings.minSelections ?? 1;
    const max = settings.maxSelections ?? question.options.length;
    if (selectedOptions.length < min || selectedOptions.length > max) return `“${question.title}”请选择${min}至${max}项`;
  }
  if (question.type === 'single' || question.type === 'multiple') {
    const customText = isQuestionnaireChoiceAnswer(answer) ? answer.customText : {};
    if (selectedOptions.some(option => question.customAnswerOptions?.includes(option) && !customText[option]?.trim())) return `请补充“${question.title}”中的填写内容`;
  }
  if (question.type === 'rating') {
    const settings = normalizeFormFieldSettings(question.type, question.settings, question.options);
    const value = Number(answer);
    if (!Number.isFinite(value) || value < (settings.ratingMin ?? 1) || value > (settings.ratingMax ?? 5)) return `“${question.title}”评分超出范围`;
  }
  if (question.type === 'date') {
    const format = normalizeFormFieldSettings(question.type, question.settings, question.options).dateFormat ?? 'ymd';
    const pattern = format === 'year' ? /^\d{4}$/u : format === 'ym' ? /^\d{4}-\d{2}$/u : /^\d{4}-\d{2}-\d{2}$/u;
    if (!pattern.test(String(answer))) return `“${question.title}”日期格式不正确`;
  }
  if (question.type === 'number') {
    const text = String(answer).trim();
    const value = Number(text);
    const settings = normalizeFormFieldSettings(question.type, question.settings, question.options);
    const format = settings.numberFormat ?? 'integer';
    const decimalPlaces = text.includes('.') ? text.split('.')[1]?.length ?? 0 : 0;
    const maxDecimals = format === 'integer' ? 0 : format === 'decimal-1' ? 1 : 2;
    if (!Number.isFinite(value) || decimalPlaces > maxDecimals) return `“${question.title}”数字格式不正确`;
    if (settings.minValue !== undefined && value < settings.minValue) return `“${question.title}”不能小于${settings.minValue}`;
    if (settings.maxValue !== undefined && value > settings.maxValue) return `“${question.title}”不能大于${settings.maxValue}`;
  }
  return '';
};

export const formatQuestionnaireAnswer = (answer: QuestionnaireAnswer | undefined, question?: QuestionnaireQuestion) => {
  if (isQuestionnaireMultiFillAnswer(answer)) {
    const subFields = question?.subFields ?? Object.keys(answer.fillValues).map(id => ({ id, label: id, required: false }));
    if (subFields.length === 0) return '未填写';
    return subFields.map(subField => `${subField.label}：${answer.fillValues[subField.id]?.trim() || '未填写'}`).join('；');
  }
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
