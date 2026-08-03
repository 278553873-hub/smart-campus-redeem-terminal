import type { ClassInfo, Student } from '../mobile-app/types';
import { normalizeFormFieldSettings, type FormFieldSettings, type FormLayoutMode, type FormSection } from './formDefinition';
import { readStudentGrowthProfile } from './studentGrowthStore';
import {
  PLATFORM_GROWTH_FIELD_CATALOG,
  formatGrowthFieldValue,
  getEnabledGrowthFields,
  getGrowthFieldDefinition,
  getGrowthFieldGroups,
  type GrowthFieldGroupKey,
  type GrowthInputFieldKey,
} from './studentGrowthFieldCatalog';

export type ArchiveTemplateStatus = 'recommended' | 'draft' | 'published' | 'disabled';
export type ArchiveFieldType = 'text' | 'single-select' | 'multiple-select' | 'date' | 'number';
export type ArchiveDataRangeMode = 'semester' | 'school_year' | 'custom';
export type ArchiveSystemFieldKey = 'name' | 'studentNo' | 'gender' | 'birthDate' | 'grade' | 'class';
export type ArchiveGrowthModuleKey = GrowthFieldGroupKey | 'semester_goal' | 'daily_performance';
export type ArchiveGrowthFieldKey =
  | GrowthInputFieldKey
  | 'measurement_date'
  | 'height'
  | 'weight'
  | 'bmi'
  | 'health_exam_date'
  | 'naked_vision'
  | 'corrected_vision'
  | 'glasses_type'
  | 'health_conclusion'
  | 'goal_reflection'
  | 'goal_list'
  | 'goal_messages'
  | 'goal_agreement'
  | 'goal_confirmations'
  | 'daily_performance_summary';

export const ARCHIVE_SYSTEM_FIELD_OPTIONS: Array<{ key: ArchiveSystemFieldKey; label: string }> = [
  { key: 'name', label: '姓名' },
  { key: 'studentNo', label: '学号' },
  { key: 'gender', label: '性别' },
  { key: 'birthDate', label: '出生日期' },
  { key: 'grade', label: '年级' },
  { key: 'class', label: '班级' },
];

export const ARCHIVE_SELECTABLE_SYSTEM_FIELD_OPTIONS = ARCHIVE_SYSTEM_FIELD_OPTIONS.filter(option => option.key !== 'grade');

export const ARCHIVE_GROWTH_MODULE_OPTIONS: Array<{
  key: ArchiveGrowthModuleKey;
  label: string;
  description: string;
}> = [
  { key: 'body_growth', label: '身体成长', description: '身高、体重' },
  { key: 'vision_health', label: '视力健康', description: '裸眼视力、矫正视力与戴镜类型' },
  { key: 'physical_fitness', label: '体能测试', description: '肺活量、跑跳与柔韧项目' },
  { key: 'health_check', label: '健康检查', description: '健康检查结论' },
  { key: 'daily_performance', label: '日常表现', description: '本学期评价记录' },
];

const CATALOG_ARCHIVE_GROWTH_FIELD_GROUPS: Array<{
  key: ArchiveGrowthModuleKey;
  label: string;
  fields: Array<{ key: ArchiveGrowthFieldKey; label: string }>;
}> = getGrowthFieldGroups(PLATFORM_GROWTH_FIELD_CATALOG).map(group => ({
  key: group.key,
  label: group.label,
  fields: group.fields.map(item => ({ key: item.key, label: item.label })),
}));

const LEGACY_ARCHIVE_GROWTH_FIELD_GROUPS: typeof CATALOG_ARCHIVE_GROWTH_FIELD_GROUPS = [
  {
    key: 'body_growth',
    label: '身体成长（历史字段）',
    fields: [
      { key: 'measurement_date', label: '测量日期' },
      { key: 'height', label: '身高' },
      { key: 'weight', label: '体重' },
      { key: 'bmi', label: '身体质量指数' },
    ],
  },
  {
    key: 'health_check',
    label: '健康检查（历史字段）',
    fields: [
      { key: 'health_exam_date', label: '体检日期' },
      { key: 'naked_vision', label: '裸眼视力' },
      { key: 'corrected_vision', label: '矫正视力' },
      { key: 'glasses_type', label: '戴镜类型' },
      { key: 'health_conclusion', label: '健康结论' },
    ],
  },
  {
    key: 'daily_performance',
    label: '日常表现',
    fields: [{ key: 'daily_performance_summary', label: '本学期评价摘要' }],
  },
];

export const ARCHIVE_GROWTH_FIELD_GROUPS = [
  ...CATALOG_ARCHIVE_GROWTH_FIELD_GROUPS,
  ...LEGACY_ARCHIVE_GROWTH_FIELD_GROUPS,
];

export const getArchiveGrowthFieldGroups = (spaceId: string) => (
  getGrowthFieldGroups(getEnabledGrowthFields(spaceId)).map(group => ({
    key: group.key as ArchiveGrowthModuleKey,
    label: group.label,
    fields: group.fields.map(item => ({ key: item.key as ArchiveGrowthFieldKey, label: item.label })),
  }))
);

const SELECTABLE_ARCHIVE_GROWTH_MODULE_KEYS = new Set(ARCHIVE_GROWTH_MODULE_OPTIONS.map(option => option.key));
const SELECTABLE_ARCHIVE_GROWTH_FIELD_KEYS = new Set(ARCHIVE_GROWTH_FIELD_GROUPS.flatMap(group => group.fields.map(field => field.key)));

const growthFieldsForModules = (modules: ArchiveGrowthModuleKey[]): ArchiveGrowthFieldConfig[] => (
  CATALOG_ARCHIVE_GROWTH_FIELD_GROUPS
    .filter(group => modules.includes(group.key))
    .flatMap(group => group.fields.map(field => ({ key: field.key, required: false })))
);

export const getArchiveGrowthModulesForFields = (fields: ArchiveGrowthFieldConfig[]): ArchiveGrowthModuleConfig[] => {
  const modules = new Map<ArchiveGrowthModuleKey, ArchiveGrowthModuleConfig>();
  fields.forEach(field => {
    const group = ARCHIVE_GROWTH_FIELD_GROUPS.find(item => item.fields.some(option => option.key === field.key));
    if (!group) return;
    const existing = modules.get(group.key);
    modules.set(group.key, { key: group.key, required: Boolean(existing?.required || field.required) });
  });
  return Array.from(modules.values());
};

const DEFAULT_ARCHIVE_SYSTEM_FIELDS: ArchiveSystemFieldKey[] = ['name', 'class'];

export type ArchiveSection = FormSection;

export interface ArchiveField {
  id: string;
  semanticKey: string;
  label: string;
  type: ArchiveFieldType;
  sectionId: string;
  required: boolean;
  options: string[];
  customAnswerOptions?: string[];
  settings?: FormFieldSettings;
}

export interface ArchiveChoiceAnswer {
  selectedOptions: string[];
  customText: Record<string, string>;
}

export type ArchiveAnswer = string | ArchiveChoiceAnswer;

export interface ArchiveGrowthModuleConfig {
  key: ArchiveGrowthModuleKey;
  required: boolean;
}

export interface ArchiveGrowthFieldConfig {
  key: ArchiveGrowthFieldKey;
  required: boolean;
}

export interface ArchiveGrowthModuleSnapshot {
  key: ArchiveGrowthModuleKey;
  label: string;
  status: 'available' | 'missing';
  occurredAt: string;
  sourceLabel: string;
  sourceVersion: number;
  items: Array<{
    key?: ArchiveGrowthFieldKey;
    label: string;
    value: string;
    recordedAt?: string;
    sourceType?: string;
    sourceLabel?: string;
    sourceRecordId?: string;
    sourceVersion?: number;
  }>;
}

export interface ArchiveDataRange {
  startDate: string;
  endDate: string;
  label: string;
}

export interface ArchiveTemplate {
  id: string;
  spaceId: string;
  name: string;
  origin: 'recommended' | 'school';
  status: ArchiveTemplateStatus;
  version: number;
  dataRangeMode: ArchiveDataRangeMode;
  customDataRangeStart?: string;
  customDataRangeEnd?: string;
  layoutMode: FormLayoutMode;
  gradeScopes: string[];
  systemFields: ArchiveSystemFieldKey[];
  growthModules: ArchiveGrowthModuleConfig[];
  growthFields: ArchiveGrowthFieldConfig[];
  sections: ArchiveSection[];
  fields: ArchiveField[];
  updatedAt: string;
  deletedAt?: string;
}

export interface ArchiveTemplateSnapshot {
  name: string;
  version: number;
  dataRangeMode: ArchiveDataRangeMode;
  customDataRangeStart?: string;
  customDataRangeEnd?: string;
  layoutMode: FormLayoutMode;
  systemFields: ArchiveSystemFieldKey[];
  growthModules: ArchiveGrowthModuleConfig[];
  growthFields: ArchiveGrowthFieldConfig[];
  sections: ArchiveSection[];
  fields: ArchiveField[];
}

export interface ArchiveDraft {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  templateId: string;
  templateName: string;
  templateVersion: number;
  templateSnapshot: ArchiveTemplateSnapshot;
  answers: Record<string, ArchiveAnswer>;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

export interface ArchiveSnapshot {
  id: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  templateId: string;
  templateName: string;
  templateVersion: number;
  templateSnapshot: ArchiveTemplateSnapshot;
  period: string;
  periodStart: string;
  periodEnd: string;
  status: 'archived' | 'revision-draft';
  createdAt: string;
  createdBy: string;
  systemValues: Partial<Record<ArchiveSystemFieldKey, string>>;
  growthSnapshots: ArchiveGrowthModuleSnapshot[];
  answers: Record<string, ArchiveAnswer>;
  revisionOf?: string;
  correctionReason?: string;
}

export interface ArchiveAuditEvent {
  id: string;
  studentId: string;
  action: '查看档案' | '确认成档' | '申请更正';
  operator: string;
  operatorRole: string;
  occurredAt: string;
  detail: string;
}

export interface ArchiveWorkspace {
  schemaVersion: 8;
  spaceId: string;
  templates: ArchiveTemplate[];
  drafts: ArchiveDraft[];
  snapshots: ArchiveSnapshot[];
  auditEvents: ArchiveAuditEvent[];
}

interface ArchiveWorkspaceContext {
  spaceId: string;
  teacherName: string;
  classes: ClassInfo[];
  homeroomClassIds: string[];
  getStudentsForClass: (classId: string) => Student[];
}

export const ARCHIVE_STORE_EVENT = 'student-archive-store-updated';
const STORAGE_PREFIX = 'teacher-student-archive-workspace-v1';

const field = (
  semanticKey: string,
  label: string,
  type: ArchiveFieldType,
  sectionId: string,
  required = true,
  options: string[] = [],
): ArchiveField => ({
  id: `field-${semanticKey}`,
  semanticKey,
  label,
  type,
  sectionId,
  required,
  options,
  customAnswerOptions: [],
});

const section = (id: string, label: string): ArchiveSection => ({ id, label });

const summarySection = section('summary', '教师交接摘要');

const coreFields: ArchiveField[] = [
  field('strengths', '优势特点', 'text', 'summary'),
  field('interests', '兴趣倾向', 'multiple-select', 'summary', true, ['阅读表达', '科学探究', '艺术创作', '体育运动', '劳动实践', '同伴交往']),
  field('learning-habits', '学习习惯', 'single-select', 'summary', true, ['需要持续支持', '逐步稳定', '表现稳定', '能主动规划']),
  field('emotion-state', '情绪状态', 'single-select', 'summary', true, ['需要陪伴调节', '提醒后可调节', '基本稳定', '能主动调节']),
  field('peer-relations', '同伴交往', 'single-select', 'summary', true, ['较少参与', '被动加入', '主动合作', '能支持同伴']),
  field('current-focus', '当前关注', 'text', 'summary'),
  field('support-strategy', '有效支持方式', 'text', 'summary'),
  field('stage-goal', '阶段目标', 'text', 'summary'),
];

const entryFields: ArchiveField[] = [
  field('foundation-cognition', '基础认知', 'single-select', 'academic', true, ['零基础', '启蒙阶段', '有基础']),
  field('focus-habit', '专注习惯', 'single-select', 'academic', true, ['少于10分钟', '10-20分钟', '20分钟以上']),
  field('question-task', '提问与任务', 'single-select', 'academic', true, ['主动提问并独立完成', '有时需要鼓励', '较少提问且依赖帮助']),
  field('interest-tendency', '兴趣倾向', 'multiple-select', 'interest', true, ['阅读', '艺术', '运动', '探究', '社交']),
  field('hands-on-creativity', '动手创意', 'single-select', 'interest', true, ['很喜欢', '一般', '不太喜欢']),
  field('learning-style', '学习方式', 'multiple-select', 'cognition', true, ['听讲型', '动手型', '讨论型', '视觉型']),
  field('problem-solving', '问题解决', 'single-select', 'cognition', true, ['自己尝试', '主动求助', '容易放弃']),
  field('help-sharing', '帮助分享', 'single-select', 'social', true, ['经常主动', '有时', '较少']),
  field('rules-manners', '规则礼貌', 'single-select', 'social', true, ['自觉', '需要提醒', '较弱']),
  field('conflict-handling', '冲突处理', 'single-select', 'social', true, ['能够商量', '哭闹或退缩', '容易争抢']),
  field('emotion-stability', '情绪稳定性', 'single-select', 'personality-family', true, ['快速平复', '需要安慰', '持续较久']),
  field('exercise-vitality', '运动活力', 'single-select', 'personality-family', true, ['热爱', '一般', '不爱运动']),
  field('primary-caregiver', '主要照顾人', 'single-select', 'personality-family', true, ['父母', '祖辈', '其他']),
  field('family-time', '家庭陪伴时间', 'single-select', 'personality-family', true, ['少于30分钟', '30分钟-1小时', '1-2小时', '2小时以上']),
  field('guardian-goal', '家长期望', 'multiple-select', 'development-goals', true, ['求真', '从善', '尚美', '学活', '乐健', '悦群']),
  field('student-goal', '学生自选', 'multiple-select', 'development-goals', true, ['求真', '从善', '尚美', '学活', '乐健', '悦群']),
  field('teacher-goal', '教师建议', 'multiple-select', 'development-goals', true, ['求真', '从善', '尚美', '学活', '乐健', '悦群']),
  field('inner-drive-signal', '当前突出内驱力信号', 'single-select', 'inner-drive', true, ['兴趣激发', '胜任感', '归属感', '尚不明确']),
  field('initial-light', '初始光芒定位', 'multiple-select', 'inner-drive', true, ['求真', '从善', '尚美', '学活', '乐健', '悦群']),
  field('next-drive-focus', '下一阶段优先关注方向', 'multiple-select', 'inner-drive', true, ['继续观察兴趣火花', '积累“我能行”的成功体验', '建立信任的师生/同伴关系']),
  field('guardian-confirmation', '家长确认', 'single-select', 'confirmation', false, ['已确认', '待确认', '无需确认']),
  field('strengths', '优势特点', 'text', 'summary'),
  field('current-focus', '当前关注', 'text', 'summary'),
  field('support-strategy', '有效支持方式', 'text', 'summary'),
  field('stage-goal', '阶段目标', 'text', 'summary'),
];

const termFields: ArchiveField[] = [
  field('term-change', '本学期变化', 'text', 'term-growth'),
  field('representative-evidence', '代表性证据', 'text', 'term-growth'),
  field('goal-progress', '目标达成情况', 'single-select', 'term-growth', true, ['尚未显现', '开始进步', '基本达成', '超出预期']),
  field('new-strength', '新发现的优势', 'text', 'term-growth', false),
  field('next-strategy', '下阶段策略', 'text', 'term-growth'),
];

const transitionFields: ArchiveField[] = [
  field('long-term-summary', '长期成长概览', 'text', 'transition-summary'),
  field('best-method', '最有效的教育方式', 'text', 'transition-summary'),
  field('continued-support', '仍需支持事项', 'text', 'transition-summary'),
  field('important-change', '重要变化', 'text', 'transition-summary'),
  field('handoff-advice', '交接建议', 'text', 'transition-summary'),
];

const cloneFields = (items: ArchiveField[]) => items.map(item => ({
  ...item,
  options: [...item.options],
  customAnswerOptions: [...(item.customAnswerOptions ?? [])],
  settings: normalizeFormFieldSettings(item.type, item.settings, item.options),
}));
const cloneSections = (items: ArchiveSection[]) => items.map(item => ({ ...item }));
const cloneGrowthModules = (items: ArchiveGrowthModuleConfig[]) => items.map(item => ({ ...item }));
const cloneGrowthFields = (items: ArchiveGrowthFieldConfig[]) => items.map(item => ({ ...item }));
const cloneGrowthSnapshots = (items: ArchiveGrowthModuleSnapshot[]) => items.map(item => ({
  ...item,
  items: item.items.map(value => ({ ...value })),
}));

export const createArchiveTemplateSnapshot = (template: ArchiveTemplate): ArchiveTemplateSnapshot => ({
  name: template.name,
  version: template.version,
  dataRangeMode: template.dataRangeMode,
  customDataRangeStart: template.customDataRangeStart,
  customDataRangeEnd: template.customDataRangeEnd,
  layoutMode: template.layoutMode,
  systemFields: [...template.systemFields],
  growthModules: cloneGrowthModules(template.growthModules),
  growthFields: cloneGrowthFields(template.growthFields),
  sections: cloneSections(template.sections),
  fields: cloneFields(template.fields),
});

const cloneTemplateSnapshot = (snapshot: ArchiveTemplateSnapshot): ArchiveTemplateSnapshot => ({
  ...snapshot,
  systemFields: [...snapshot.systemFields],
  growthModules: cloneGrowthModules(snapshot.growthModules),
  growthFields: cloneGrowthFields(snapshot.growthFields),
  sections: cloneSections(snapshot.sections),
  fields: cloneFields(snapshot.fields),
});

const entrySections: ArchiveSection[] = [
  section('academic', '学业基础'),
  section('interest', '兴趣偏好'),
  section('cognition', '认知特点'),
  section('social', '交往风格'),
  section('personality-family', '性格与家庭'),
  section('development-goals', '优先发展目标'),
  section('inner-drive', '内驱力特征'),
  section('confirmation', '建档确认'),
  summarySection,
];

const termSections: ArchiveSection[] = [summarySection, section('term-growth', '本学期成长')];
const transitionSections: ArchiveSection[] = [summarySection, section('transition-summary', '转衔与交接')];

const createRecommendedTemplates = (spaceId: string): ArchiveTemplate[] => {
  const defaultGrowthFields: ArchiveGrowthFieldConfig[] = getEnabledGrowthFields(spaceId).map(item => ({ key: item.key, required: false }));
  const defaultGrowthModules = getArchiveGrowthModulesForFields(defaultGrowthFields);
  return [
  {
    id: 'recommended-entry-v1',
    spaceId,
    name: '一年级初始成长档案',
    origin: 'recommended',
    status: 'recommended',
    version: 1,
    dataRangeMode: 'custom',
    customDataRangeStart: '2025-08-01',
    customDataRangeEnd: '2025-09-30',
    layoutMode: 'grouped',
    gradeScopes: ['一年级'],
    systemFields: ['name', 'class', 'birthDate'],
    growthModules: [],
    growthFields: [],
    sections: cloneSections(entrySections),
    fields: cloneFields(entryFields),
    updatedAt: '2026-07-01',
  },
  {
    id: 'recommended-term-v1',
    spaceId,
    name: '学期成长档案',
    origin: 'recommended',
    status: 'recommended',
    version: 1,
    dataRangeMode: 'school_year',
    layoutMode: 'grouped',
    gradeScopes: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    systemFields: ['name', 'class', 'birthDate'],
    growthModules: cloneGrowthModules(defaultGrowthModules),
    growthFields: cloneGrowthFields(defaultGrowthFields),
    sections: cloneSections(termSections),
    fields: cloneFields([...coreFields, ...termFields]),
    updatedAt: '2026-07-01',
  },
  {
    id: 'recommended-transition-v1',
    spaceId,
    name: '毕业与转衔档案',
    origin: 'recommended',
    status: 'recommended',
    version: 1,
    dataRangeMode: 'school_year',
    layoutMode: 'grouped',
    gradeScopes: ['六年级'],
    systemFields: ['name', 'studentNo', 'class'],
    growthModules: cloneGrowthModules(defaultGrowthModules),
    growthFields: cloneGrowthFields(defaultGrowthFields),
    sections: cloneSections(transitionSections),
    fields: cloneFields([...coreFields, ...transitionFields]),
    updatedAt: '2026-07-01',
  },
  ];
};

const commonAnswerSeed: Record<string, string> = {
  strengths: '动手探索意愿强，遇到新任务愿意先自己尝试。',
  interests: '科学探究、艺术创作',
  'learning-habits': '表现稳定',
  'emotion-state': '提醒后可调节',
  'peer-relations': '主动合作',
  'current-focus': '在集体表达时仍需要更多正向鼓励。',
  'support-strategy': '先给予准备时间，再用具体问题邀请表达；完成后及时肯定过程。',
  'stage-goal': '能在小组活动中主动表达自己的观点。',
};

const termAnswerSeed: Record<string, string> = {
  ...commonAnswerSeed,
  'term-change': '从等待老师点名，逐步转为在熟悉的小组中主动发言。',
  'representative-evidence': '本学期科学项目汇报中主动介绍了小组的观察结果。',
  'goal-progress': '开始进步',
  'new-strength': '能够耐心帮助同伴完成实验记录。',
  'next-strategy': '继续安排小组内的固定表达角色，再逐步过渡到全班分享。',
};

const entryAnswerSeed: Record<string, string> = {
  'foundation-cognition': '启蒙阶段',
  'focus-habit': '10-20分钟',
  'question-task': '有时需要鼓励',
  'interest-tendency': '阅读、探究',
  'hands-on-creativity': '很喜欢',
  'learning-style': '动手型、视觉型',
  'problem-solving': '自己尝试',
  'help-sharing': '有时',
  'rules-manners': '自觉',
  'conflict-handling': '能够商量',
  'emotion-stability': '需要安慰',
  'exercise-vitality': '一般',
  'primary-caregiver': '父母',
  'family-time': '1-2小时',
  'guardian-goal': '学活、乐健',
  'student-goal': '求真、尚美',
  'teacher-goal': '学活、悦群',
  'inner-drive-signal': '兴趣激发',
  'initial-light': '求真、学活',
  'next-drive-focus': '积累“我能行”的成功体验、建立信任的师生/同伴关系',
  'guardian-confirmation': '已确认',
  strengths: '动手探索意愿强，遇到新任务愿意先自己尝试。',
  'current-focus': '需要帮助孩子适应集体节奏并建立表达安全感。',
  'support-strategy': '用熟悉同伴带动参与，避免突然要求公开表达。',
  'stage-goal': '愿意加入同伴活动并完成简单分工。',
};

const previousAnswerSeed: Record<string, string> = {
  ...entryAnswerSeed,
};

const getStorageKey = (spaceId: string) => `${STORAGE_PREFIX}:${spaceId}`;
const isoDate = () => new Date().toISOString().slice(0, 10);
const timestampText = () => new Date().toLocaleString('zh-CN', { hour12: false }).replaceAll('/', '-');

type ArchiveDataRangeSource = Pick<ArchiveTemplate, 'dataRangeMode' | 'customDataRangeStart' | 'customDataRangeEnd'>
  | Pick<ArchiveTemplateSnapshot, 'dataRangeMode' | 'customDataRangeStart' | 'customDataRangeEnd'>;

const dateYearMonth = (date: string) => {
  const [yearText, monthText] = date.split('-');
  return { year: Number(yearText), month: Number(monthText) };
};

export const resolveArchiveDataRange = (
  source: ArchiveDataRangeSource,
  referenceDate = isoDate(),
): ArchiveDataRange => {
  if (source.dataRangeMode === 'custom') {
    const startDate = source.customDataRangeStart ?? '';
    const endDate = source.customDataRangeEnd ?? '';
    return {
      startDate,
      endDate,
      label: startDate && endDate ? `${startDate} 至 ${endDate}` : '自定义日期',
    };
  }

  const { year, month } = dateYearMonth(referenceDate);
  if (source.dataRangeMode === 'semester') {
    if (month >= 2 && month <= 7) {
      return { startDate: `${year}-02-01`, endDate: `${year}-07-31`, label: `${year}年春季学期` };
    }
    const startYear = month === 1 ? year - 1 : year;
    return { startDate: `${startYear}-08-01`, endDate: `${startYear + 1}-01-31`, label: `${startYear}年秋季学期` };
  }

  const startYear = month >= 8 ? year : year - 1;
  return {
    startDate: `${startYear}-08-01`,
    endDate: `${startYear + 1}-07-31`,
    label: `${startYear}-${startYear + 1}学年`,
  };
};

export const getArchiveDataRangeModeLabel = (mode: ArchiveDataRangeMode) => ({
  semester: '本学期',
  school_year: '本学年',
  custom: '自定义日期',
}[mode]);

export const getArchiveSystemFieldLabel = (key: ArchiveSystemFieldKey) => (
  ARCHIVE_SYSTEM_FIELD_OPTIONS.find(item => item.key === key)?.label ?? key
);

export const isArchiveChoiceAnswer = (answer: ArchiveAnswer | undefined): answer is ArchiveChoiceAnswer => (
  Boolean(answer)
  && typeof answer === 'object'
  && Array.isArray((answer as ArchiveChoiceAnswer).selectedOptions)
  && typeof (answer as ArchiveChoiceAnswer).customText === 'object'
);

export const getArchiveSelectedOptions = (answer: ArchiveAnswer | undefined): string[] => {
  if (isArchiveChoiceAnswer(answer)) return answer.selectedOptions;
  if (typeof answer !== 'string' || !answer.trim()) return [];
  return answer.split('、').filter(Boolean);
};

export const isArchiveAnswerFilled = (answer: ArchiveAnswer | undefined) => (
  isArchiveChoiceAnswer(answer) ? answer.selectedOptions.length > 0 : Boolean(answer?.trim())
);

export const getArchiveAnswerValidationError = (field: ArchiveField, answer: ArchiveAnswer | undefined): string => {
  if (field.required && !isArchiveAnswerFilled(answer)) return `请先填写“${field.label}”`;
  if (!isArchiveAnswerFilled(answer)) return '';
  if (field.type === 'multiple-select') {
    const selectedOptions = getArchiveSelectedOptions(answer);
    const settings = normalizeFormFieldSettings(field.type, field.settings, field.options);
    const min = settings.minSelections ?? 1;
    const max = settings.maxSelections ?? field.options.length;
    if (selectedOptions.length < min || selectedOptions.length > max) return `“${field.label}”请选择${min}至${max}项`;
  }
  if (field.type === 'single-select' || field.type === 'multiple-select') {
    const customText = isArchiveChoiceAnswer(answer) ? answer.customText : {};
    if (getArchiveSelectedOptions(answer).some(option => field.customAnswerOptions?.includes(option) && !customText[option]?.trim())) return `请补充“${field.label}”中的填写内容`;
  }
  if (field.type === 'date') {
    const format = normalizeFormFieldSettings(field.type, field.settings, field.options).dateFormat ?? 'ymd';
    const pattern = format === 'year' ? /^\d{4}$/u : format === 'ym' ? /^\d{4}-\d{2}$/u : /^\d{4}-\d{2}-\d{2}$/u;
    if (!pattern.test(String(answer))) return `“${field.label}”日期格式不正确`;
  }
  if (field.type === 'number') {
    const text = String(answer).trim();
    const value = Number(text);
    const format = normalizeFormFieldSettings(field.type, field.settings, field.options).numberFormat ?? 'integer';
    const decimalPlaces = text.includes('.') ? text.split('.')[1]?.length ?? 0 : 0;
    const maxDecimals = format === 'integer' ? 0 : format === 'decimal-1' ? 1 : 2;
    if (!Number.isFinite(value) || decimalPlaces > maxDecimals) return `“${field.label}”数字格式不正确`;
  }
  return '';
};

export const formatArchiveAnswer = (answer: ArchiveAnswer | undefined) => {
  if (!isArchiveChoiceAnswer(answer)) return answer ?? '';
  return answer.selectedOptions.map(option => {
    const customText = answer.customText[option]?.trim();
    return customText ? `${option}：${customText}` : option;
  }).join('、');
};

const cloneArchiveAnswers = (answers: Record<string, ArchiveAnswer>): Record<string, ArchiveAnswer> => Object.fromEntries(
  Object.entries(answers).map(([key, answer]) => [key, isArchiveChoiceAnswer(answer) ? {
    selectedOptions: [...answer.selectedOptions],
    customText: { ...answer.customText },
  } : answer]),
);

export const getArchiveSystemValues = (student: Student): Partial<Record<ArchiveSystemFieldKey, string>> => ({
  name: student.name,
  studentNo: student.studentNo ?? '',
  gender: student.gender === 'male' ? '男' : '女',
  birthDate: student.birthDate ?? '',
  grade: student.grade,
  class: student.class,
});

const getGrowthModuleLabel = (key: ArchiveGrowthModuleKey) => (
  ARCHIVE_GROWTH_MODULE_OPTIONS.find(option => option.key === key)?.label ?? key
);

export const buildArchiveGrowthModuleSnapshots = (
  studentId: string,
  fields: ArchiveGrowthFieldConfig[],
  range?: Pick<ArchiveDataRange, 'startDate' | 'endDate'>,
): ArchiveGrowthModuleSnapshot[] => {
  const profile = readStudentGrowthProfile(studentId);
  const withinRange = (date: string) => !range || (
    (!range.startDate || date >= range.startDate)
    && (!range.endDate || date <= range.endDate)
  );
  const growthDataRecords = profile.growthDataRecords.filter(record => withinRange(record.recordedAt));
  const bodyMeasurements = profile.bodyMeasurements.filter(record => withinRange(record.measuredAt));
  const latestHealthExam = profile.healthExamRecords.find(record => withinRange(record.examDate));
  const snapshots = new Map<ArchiveGrowthModuleKey, ArchiveGrowthModuleSnapshot>();

  const appendValue = (
    groupKey: ArchiveGrowthModuleKey,
    item: { key: ArchiveGrowthFieldKey; label: string; value: string } | null,
    source?: {
      occurredAt: string;
      sourceType: string;
      sourceLabel: string;
      sourceRecordId: string;
      sourceVersion: number;
    },
  ) => {
    const snapshot = snapshots.get(groupKey) ?? {
      key: groupKey,
      label: getGrowthModuleLabel(groupKey),
      status: 'missing' as const,
      occurredAt: '',
      sourceLabel: '',
      sourceVersion: 0,
      items: [],
    };
    if (item) {
      snapshot.items.push({
        ...item,
        recordedAt: source?.occurredAt,
        sourceType: source?.sourceType,
        sourceLabel: source?.sourceLabel,
        sourceRecordId: source?.sourceRecordId,
        sourceVersion: source?.sourceVersion,
      });
      if (item.value) snapshot.status = 'available';
      if (item.value && source) {
        if (!snapshot.occurredAt || source.occurredAt > snapshot.occurredAt) snapshot.occurredAt = source.occurredAt;
        snapshot.sourceLabel = snapshot.sourceLabel && snapshot.sourceLabel !== source.sourceLabel ? '学生成长数据' : source.sourceLabel;
        snapshot.sourceVersion = Math.max(snapshot.sourceVersion, source.sourceVersion);
      }
    }
    snapshots.set(groupKey, snapshot);
  };

  fields.forEach(config => {
    const definition = getGrowthFieldDefinition(config.key as GrowthInputFieldKey);
    if (definition) {
      const record = growthDataRecords.find(item => item.values[definition.key] !== undefined && item.values[definition.key] !== '');
      let value = record?.values[definition.key];
      let source = record ? {
        occurredAt: record.recordedAt,
        sourceType: record.sourceType,
        sourceLabel: record.sourceLabel,
        sourceRecordId: record.sourceRecordId,
        sourceVersion: record.version,
      } : undefined;
      if (value === undefined && (definition.key === 'height_cm' || definition.key === 'weight_kg')) {
        const measurement = bodyMeasurements.find(item => definition.key === 'height_cm' ? item.heightCm !== undefined : item.weightKg !== undefined);
        value = definition.key === 'height_cm' ? measurement?.heightCm : measurement?.weightKg;
        source = measurement ? {
          occurredAt: measurement.measuredAt,
          sourceType: measurement.sourceType,
          sourceLabel: measurement.sourceLabel,
          sourceRecordId: measurement.sourceRecordId,
          sourceVersion: measurement.version,
        } : undefined;
      }
      appendValue(definition.groupKey, {
        key: definition.key,
        label: definition.label,
        value: value === undefined ? '' : formatGrowthFieldValue(definition, value),
      }, source);
      return;
    }

    const groupKey: ArchiveGrowthModuleKey = ['measurement_date', 'height', 'weight', 'bmi'].includes(config.key)
      ? 'body_growth'
      : config.key === 'daily_performance_summary'
        ? 'daily_performance'
        : 'health_check';
    if (groupKey === 'body_growth') {
      const measurement = bodyMeasurements.find(record => (
        config.key === 'measurement_date'
        || config.key === 'height' && record.heightCm !== undefined
        || config.key === 'weight' && record.weightKg !== undefined
        || config.key === 'bmi' && record.bmi !== undefined
      ));
      const valueByKey: Partial<Record<ArchiveGrowthFieldKey, string>> = measurement ? {
        measurement_date: measurement.measuredAt,
        height: measurement.heightCm === undefined ? '' : `${measurement.heightCm}厘米`,
        weight: measurement.weightKg === undefined ? '' : `${measurement.weightKg}千克`,
        bmi: measurement.bmi === undefined ? '' : String(measurement.bmi),
      } : {};
      const label = LEGACY_ARCHIVE_GROWTH_FIELD_GROUPS.flatMap(group => group.fields).find(item => item.key === config.key)?.label ?? config.key;
      appendValue(groupKey, { key: config.key, label, value: valueByKey[config.key] ?? '' }, measurement ? {
        occurredAt: measurement.measuredAt,
        sourceType: measurement.sourceType,
        sourceLabel: measurement.sourceLabel,
        sourceRecordId: measurement.sourceRecordId,
        sourceVersion: measurement.version,
      } : undefined);
      return;
    }
    const valueByKey: Partial<Record<ArchiveGrowthFieldKey, string>> = latestHealthExam ? {
      health_exam_date: latestHealthExam.examDate,
      naked_vision: `左${latestHealthExam.nakedVisionLeft || '--'} · 右${latestHealthExam.nakedVisionRight || '--'}`,
      corrected_vision: `左${latestHealthExam.correctedVisionLeft || '--'} · 右${latestHealthExam.correctedVisionRight || '--'}`,
      glasses_type: latestHealthExam.glassesType,
      health_conclusion: latestHealthExam.conclusion || '未填写',
    } : {};
    const label = LEGACY_ARCHIVE_GROWTH_FIELD_GROUPS.flatMap(group => group.fields).find(item => item.key === config.key)?.label ?? config.key;
    appendValue(groupKey, { key: config.key, label, value: valueByKey[config.key] ?? '' }, latestHealthExam ? {
      occurredAt: latestHealthExam.examDate,
      sourceType: latestHealthExam.sourceType,
      sourceLabel: latestHealthExam.sourceLabel,
      sourceRecordId: latestHealthExam.id,
      sourceVersion: latestHealthExam.version,
    } : undefined);
  });

  return Array.from(snapshots.values());
};

const createSeedWorkspace = ({ spaceId, teacherName, classes, homeroomClassIds, getStudentsForClass }: ArchiveWorkspaceContext): ArchiveWorkspace => {
  const recommended = createRecommendedTemplates(spaceId);
  const termRecommended = recommended.find(template => template.id === 'recommended-term-v1')!;
  const entryRecommended = recommended.find(template => template.id === 'recommended-entry-v1')!;
  const schoolTermTemplate: ArchiveTemplate = {
    ...termRecommended,
    id: 'school-term-growth-v2',
    name: '星河成长档案·学期版',
    origin: 'school',
    status: 'published',
    version: 2,
    updatedAt: '2026-07-08',
    sections: cloneSections(termRecommended.sections),
    fields: cloneFields(termRecommended.fields),
  };
  const schoolEntryTemplate: ArchiveTemplate = {
    ...entryRecommended,
    id: 'school-entry-draft-v1',
    name: '一年级适应档案',
    origin: 'school',
    status: 'draft',
    version: 1,
    updatedAt: '2026-07-12',
    sections: cloneSections(entryRecommended.sections),
    fields: cloneFields(entryRecommended.fields),
  };
  const entryRange = resolveArchiveDataRange(entryRecommended, '2025-09-28');
  const termRange = resolveArchiveDataRange(schoolTermTemplate, '2026-07-11');

  const preferredClassId = homeroomClassIds.find(id => classes.some(item => item.id === id)) ?? classes[0]?.id ?? '';
  const preferredClass = classes.find(item => item.id === preferredClassId) ?? classes[0];
  const students = preferredClass ? getStudentsForClass(preferredClass.id).filter(student => student.status !== 'left').slice(0, 12) : [];
  const drafts: ArchiveDraft[] = students.slice(7, 10).map((student, index) => ({
    id: `draft-${student.id}-term-2026`,
    studentId: student.id,
    studentName: student.name,
    classId: preferredClass.id,
    className: preferredClass.name,
    templateId: schoolTermTemplate.id,
    templateName: schoolTermTemplate.name,
    templateVersion: schoolTermTemplate.version,
    templateSnapshot: createArchiveTemplateSnapshot(schoolTermTemplate),
    answers: index === 0 ? { ...termAnswerSeed, 'next-strategy': '' } : index === 1 ? { ...termAnswerSeed } : {},
    createdAt: '2026-07-09',
    updatedAt: index === 0 ? '2026-07-13' : '2026-07-09',
    createdBy: teacherName,
  }));

  const snapshots: ArchiveSnapshot[] = students.flatMap((student, index) => {
    const entry: ArchiveSnapshot = {
      id: `snapshot-${student.id}-entry`,
      studentId: student.id,
      studentName: student.name,
      classId: preferredClass.id,
      className: preferredClass.name,
      templateId: 'recommended-entry-v1',
      templateName: '一年级初始成长档案',
      templateVersion: 1,
      templateSnapshot: createArchiveTemplateSnapshot(entryRecommended),
      period: entryRange.label,
      periodStart: entryRange.startDate,
      periodEnd: entryRange.endDate,
      status: 'archived',
      createdAt: '2025-09-28',
      createdBy: '张林老师',
      systemValues: getArchiveSystemValues(student),
      growthSnapshots: buildArchiveGrowthModuleSnapshots(student.id, entryRecommended.growthFields, entryRange),
      answers: { ...previousAnswerSeed },
    };
    if (index >= 7) return [entry];
    const term: ArchiveSnapshot = {
      id: `snapshot-${student.id}-term-2026`,
      studentId: student.id,
      studentName: student.name,
      classId: preferredClass.id,
      className: preferredClass.name,
      templateId: schoolTermTemplate.id,
      templateName: schoolTermTemplate.name,
      templateVersion: schoolTermTemplate.version,
      templateSnapshot: createArchiveTemplateSnapshot(schoolTermTemplate),
      period: termRange.label,
      periodStart: termRange.startDate,
      periodEnd: termRange.endDate,
      status: 'archived',
      createdAt: '2026-07-11',
      createdBy: teacherName,
      systemValues: getArchiveSystemValues(student),
      growthSnapshots: buildArchiveGrowthModuleSnapshots(student.id, schoolTermTemplate.growthFields, termRange),
      answers: { ...termAnswerSeed },
    };
    return [entry, term];
  });

  const firstStudent = students[0];
  const auditEvents: ArchiveAuditEvent[] = firstStudent ? [
    { id: 'audit-seed-1', studentId: firstStudent.id, action: '确认成档', operator: teacherName, operatorRole: '教师', occurredAt: '2026-07-11 16:20', detail: '确认2025-2026学年下学期成长档案' },
    { id: 'audit-seed-2', studentId: firstStudent.id, action: '查看档案', operator: '周老师', operatorRole: '现任数学教师', occurredAt: '2026-07-14 09:15', detail: '查看最新成长档案' },
  ] : [];

  return {
    schemaVersion: 8,
    spaceId,
    templates: [...recommended, schoolTermTemplate, schoolEntryTemplate],
    drafts,
    snapshots,
    auditEvents,
  };
};

type LegacyField = Omit<ArchiveField, 'type'> & {
  type: ArchiveFieldType | 'short-text' | 'long-text';
  group?: 'core' | 'stage';
};

const getLegacyTemplateGrowthModules = (template: ArchiveTemplate): ArchiveGrowthModuleConfig[] => {
  if (template.id === 'recommended-entry-v1' || template.id === 'school-entry-draft-v1') {
    return [{ key: 'daily_performance', required: false }];
  }
  if (
    template.id === 'recommended-term-v1'
    || template.id === 'recommended-transition-v1'
    || template.id === 'school-term-growth-v2'
  ) {
    return ARCHIVE_GROWTH_MODULE_OPTIONS.map(option => ({ key: option.key, required: false }));
  }
  return [];
};

const normalizeTemplate = (template: ArchiveTemplate): ArchiveTemplate => {
  const growthModules = (template.growthModules ?? getLegacyTemplateGrowthModules(template))
    .filter(module => SELECTABLE_ARCHIVE_GROWTH_MODULE_KEYS.has(module.key));
  return {
    ...template,
    dataRangeMode: template.dataRangeMode ?? 'school_year',
    layoutMode: template.layoutMode ?? ((template.sections ?? []).length > 0 ? 'grouped' : 'flat'),
    systemFields: [...(template.systemFields ?? DEFAULT_ARCHIVE_SYSTEM_FIELDS)].filter(key => key !== 'grade'),
    growthModules: cloneGrowthModules(growthModules),
    growthFields: cloneGrowthFields(template.growthFields ?? growthFieldsForModules(growthModules.map(module => module.key)))
      .filter(field => SELECTABLE_ARCHIVE_GROWTH_FIELD_KEYS.has(field.key)),
    sections: (template.sections ?? []).map(item => ({ id: item.id, label: item.label })),
    fields: ((template.fields ?? []) as LegacyField[]).map(item => ({
      id: item.id,
      semanticKey: item.semanticKey,
      label: item.label,
      type: item.type === 'short-text' || item.type === 'long-text' ? 'text' : item.type,
      sectionId: item.sectionId,
      required: item.required,
      options: [...item.options],
      customAnswerOptions: [...(item.customAnswerOptions ?? [])],
      settings: normalizeFormFieldSettings(item.type, item.settings, item.options),
    })),
  };
};

type StoredTemplateSnapshot = Omit<ArchiveTemplateSnapshot, 'dataRangeMode' | 'customDataRangeStart' | 'customDataRangeEnd' | 'systemFields' | 'growthModules' | 'growthFields'> & {
  dataRangeMode?: ArchiveDataRangeMode;
  customDataRangeStart?: string;
  customDataRangeEnd?: string;
  systemFields?: ArchiveSystemFieldKey[];
  growthModules?: ArchiveGrowthModuleConfig[];
  growthFields?: ArchiveGrowthFieldConfig[];
};
type StoredArchiveDraft = Omit<ArchiveDraft, 'templateSnapshot'> & { templateSnapshot?: StoredTemplateSnapshot };
type StoredArchiveSnapshot = Omit<ArchiveSnapshot, 'templateSnapshot' | 'periodStart' | 'periodEnd' | 'systemValues' | 'growthSnapshots'> & {
  templateSnapshot?: StoredTemplateSnapshot;
  periodStart?: string;
  periodEnd?: string;
  systemValues?: Partial<Record<ArchiveSystemFieldKey, string>>;
  growthSnapshots?: ArchiveGrowthModuleSnapshot[];
};

const normalizeTemplateSnapshot = (snapshot: StoredTemplateSnapshot): ArchiveTemplateSnapshot => ({
  ...snapshot,
  dataRangeMode: snapshot.dataRangeMode ?? 'school_year',
  systemFields: [...(snapshot.systemFields ?? DEFAULT_ARCHIVE_SYSTEM_FIELDS)],
  growthModules: cloneGrowthModules(snapshot.growthModules ?? [])
    .filter(module => SELECTABLE_ARCHIVE_GROWTH_MODULE_KEYS.has(module.key)),
  growthFields: cloneGrowthFields(snapshot.growthFields ?? growthFieldsForModules((snapshot.growthModules ?? []).map(module => module.key)))
    .filter(field => SELECTABLE_ARCHIVE_GROWTH_FIELD_KEYS.has(field.key)),
  sections: cloneSections(snapshot.sections),
  fields: cloneFields(snapshot.fields),
});

const resolveStoredTemplateSnapshot = (
  record: StoredArchiveDraft | StoredArchiveSnapshot,
  templates: ArchiveTemplate[],
  useCurrentTemplateGrowthModules = false,
): ArchiveTemplateSnapshot => {
  if (record.templateSnapshot) {
    const normalized = normalizeTemplateSnapshot(record.templateSnapshot);
    if (useCurrentTemplateGrowthModules && record.templateSnapshot.growthModules === undefined) {
      const template = templates.find(item => item.id === record.templateId && item.version === record.templateVersion);
      normalized.growthModules = cloneGrowthModules(template?.growthModules ?? []);
      normalized.growthFields = cloneGrowthFields(template?.growthFields ?? []);
    }
    return normalized;
  }
  const template = templates.find(item => item.id === record.templateId && item.version === record.templateVersion);
  if (template) return createArchiveTemplateSnapshot(template);
  return {
    name: record.templateName,
    version: record.templateVersion,
    dataRangeMode: 'school_year',
    layoutMode: 'flat',
    systemFields: [...DEFAULT_ARCHIVE_SYSTEM_FIELDS],
    growthModules: [],
    growthFields: [],
    sections: [],
    fields: Object.keys(record.answers).map((semanticKey, index) => ({
      id: `field-restored-${index}`,
      semanticKey,
      label: semanticKey,
      type: 'text',
      sectionId: '',
      required: false,
      options: [],
    })),
  };
};

const hydrateStudentArchiveRecords = (
  drafts: StoredArchiveDraft[],
  snapshots: StoredArchiveSnapshot[],
  templates: ArchiveTemplate[],
): Pick<ArchiveWorkspace, 'drafts' | 'snapshots'> => ({
  drafts: drafts.map(record => ({
    ...record,
    templateSnapshot: resolveStoredTemplateSnapshot(record, templates, true),
  })),
  snapshots: snapshots.map(record => {
    const templateSnapshot = resolveStoredTemplateSnapshot(record, templates);
    const range = resolveArchiveDataRange(templateSnapshot, record.createdAt);
    return {
      ...record,
      templateSnapshot,
      period: record.period || range.label,
      periodStart: record.periodStart ?? range.startDate,
      periodEnd: record.periodEnd ?? range.endDate,
      systemValues: record.systemValues ?? {
        name: record.studentName,
        class: record.className,
      },
      growthSnapshots: cloneGrowthSnapshots(record.growthSnapshots ?? []),
    };
  }),
});

export const readArchiveWorkspace = (context: ArchiveWorkspaceContext): ArchiveWorkspace => {
  const seed = createSeedWorkspace(context);
  if (typeof window === 'undefined') return seed;
  const stored = window.localStorage.getItem(getStorageKey(context.spaceId));
  if (!stored) return seed;
  try {
    const parsed = JSON.parse(stored) as {
      schemaVersion?: number;
      spaceId?: string;
      templates?: ArchiveTemplate[];
      drafts?: StoredArchiveDraft[];
      snapshots?: StoredArchiveSnapshot[];
      auditEvents?: ArchiveAuditEvent[];
    };
    if (parsed.schemaVersion === 3 || parsed.schemaVersion === 4 || parsed.schemaVersion === 5 || parsed.schemaVersion === 6 || parsed.schemaVersion === 7 || parsed.schemaVersion === 8) {
      const templates = (parsed.templates ?? []).map(normalizeTemplate);
      const records = hydrateStudentArchiveRecords(parsed.drafts ?? [], parsed.snapshots ?? [], templates);
      return {
        schemaVersion: 8,
        spaceId: parsed.spaceId ?? context.spaceId,
        templates,
        ...records,
        auditEvents: parsed.auditEvents ?? [],
      };
    }
    if (parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2) return seed;

    const recommended = createRecommendedTemplates(context.spaceId);
    const legacyTemplates = (parsed.templates ?? []) as Array<Omit<ArchiveTemplate, 'fields' | 'layoutMode'> & { fields: LegacyField[]; layoutMode?: FormLayoutMode }>;
    const migratedTemplates = legacyTemplates
      .filter(template => template.origin !== 'recommended')
      .map(template => {
        const legacyFields = template.fields ?? [];
        const hasCore = legacyFields.some(item => item.group === 'core');
        const hasStage = legacyFields.some(item => item.group !== 'core');
        const sections = template.sections?.length ? template.sections : [
          ...(hasCore ? [section('legacy-core', '核心信息')] : []),
          ...(hasStage ? [section('legacy-stage', '阶段信息')] : []),
        ];
        return {
          ...template,
          sections,
          fields: legacyFields.map(item => {
            const { group, ...rest } = item;
            return {
              ...rest,
              sectionId: item.sectionId ?? (group === 'core' ? 'legacy-core' : 'legacy-stage'),
              options: [...item.options],
            };
          }),
        };
      });
    type LegacyTask = {
      templateId: string;
      templateName: string;
      templateVersion: number;
      createdBy?: string;
      createdAt: string;
      progress: Array<{
        studentId: string;
        studentName: string;
        classId: string;
        className: string;
        status: 'draft' | 'pending' | 'archived';
        answers: Record<string, string>;
        updatedAt: string;
      }>;
    };
    const legacyTasks = ((parsed as unknown as { tasks?: LegacyTask[] }).tasks ?? []);
    const drafts: StoredArchiveDraft[] = [
      ...(parsed.drafts ?? []),
      ...legacyTasks.flatMap(task => task.progress
        .filter(item => item.status !== 'archived')
        .map(item => ({
          id: `draft-${item.studentId}-${task.templateId}`,
          studentId: item.studentId,
          studentName: item.studentName,
          classId: item.classId,
          className: item.className,
          templateId: task.templateId,
          templateName: task.templateName,
          templateVersion: task.templateVersion,
          answers: item.answers,
          createdAt: task.createdAt,
          updatedAt: item.updatedAt,
          createdBy: task.createdBy ?? '教师',
        }))),
    ];
    const templates = [...recommended, ...migratedTemplates.map(normalizeTemplate)];
    const records = hydrateStudentArchiveRecords(drafts, parsed.snapshots ?? [], templates);
    return {
      schemaVersion: 8,
      spaceId: parsed.spaceId ?? context.spaceId,
      templates,
      ...records,
      auditEvents: parsed.auditEvents ?? [],
    };
  } catch {
    return seed;
  }
};

export const persistArchiveWorkspace = (workspace: ArchiveWorkspace) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(getStorageKey(workspace.spaceId), JSON.stringify(workspace));
  window.dispatchEvent(new CustomEvent(ARCHIVE_STORE_EVENT, { detail: { spaceId: workspace.spaceId } }));
};

export const cloneRecommendedTemplate = (workspace: ArchiveWorkspace, templateId: string): { workspace: ArchiveWorkspace; templateId: string } => {
  const source = workspace.templates.find(template => template.id === templateId && !template.deletedAt);
  if (!source) return { workspace, templateId };
  const nextId = `school-template-${Date.now()}`;
  const copy: ArchiveTemplate = {
    ...source,
    id: nextId,
    name: `${source.name}（校本）`,
    origin: 'school',
    status: 'draft',
    version: 1,
    updatedAt: isoDate(),
    systemFields: [...source.systemFields],
    growthModules: cloneGrowthModules(source.growthModules),
    growthFields: cloneGrowthFields(source.growthFields),
    sections: cloneSections(source.sections),
    fields: cloneFields(source.fields),
  };
  return { workspace: { ...workspace, templates: [...workspace.templates, copy] }, templateId: nextId };
};

export const createBlankArchiveTemplate = (workspace: ArchiveWorkspace): { workspace: ArchiveWorkspace; templateId: string } => {
  const templateId = `school-template-blank-${Date.now()}`;
  const template: ArchiveTemplate = {
    id: templateId,
    spaceId: workspace.spaceId,
    name: '未命名档案',
    origin: 'school',
    status: 'draft',
    version: 1,
    dataRangeMode: 'school_year',
    layoutMode: 'flat',
    gradeScopes: [],
    systemFields: [...DEFAULT_ARCHIVE_SYSTEM_FIELDS],
    growthModules: [],
    growthFields: [],
    sections: [],
    fields: [],
    updatedAt: isoDate(),
  };
  return { workspace: { ...workspace, templates: [...workspace.templates, template] }, templateId };
};

export const saveArchiveTemplate = (workspace: ArchiveWorkspace, template: ArchiveTemplate): ArchiveWorkspace => {
  const savedTemplate = {
    ...template,
    growthModules: getArchiveGrowthModulesForFields(template.growthFields),
    updatedAt: isoDate(),
  };
  const exists = workspace.templates.some(item => item.id === template.id && !item.deletedAt);
  return {
    ...workspace,
    templates: exists
      ? workspace.templates.map(item => item.id === template.id && !item.deletedAt ? savedTemplate : item)
      : [...workspace.templates, savedTemplate],
  };
};

export const deleteArchiveTemplate = (
  workspace: ArchiveWorkspace,
  templateId: string,
): { workspace: ArchiveWorkspace; deleted: boolean } => {
  const template = workspace.templates.find(item => item.id === templateId);
  const canDelete = template?.origin === 'school'
    && !template.deletedAt
    && (template.status === 'draft' || template.status === 'disabled');
  if (!canDelete) return { workspace, deleted: false };
  return {
    workspace: {
      ...workspace,
      templates: workspace.templates.map(item => (
        item.id === templateId ? { ...item, deletedAt: isoDate(), updatedAt: isoDate() } : item
      )),
    },
    deleted: true,
  };
};

export const setArchiveTemplateStatus = (
  workspace: ArchiveWorkspace,
  templateId: string,
  status: Extract<ArchiveTemplateStatus, 'published' | 'disabled'>,
): ArchiveWorkspace => ({
  ...workspace,
  templates: workspace.templates.map(item => (
    item.id === templateId && item.origin === 'school' && item.status !== 'draft' && !item.deletedAt
      ? { ...item, status, updatedAt: isoDate() }
      : item
  )),
});

export const getEnabledTemplatesForGrade = (workspace: ArchiveWorkspace, grade: string): ArchiveTemplate[] => (
  workspace.templates.filter(template => (
    template.origin === 'school'
    && template.status === 'published'
    && !template.deletedAt
    && template.gradeScopes.includes(grade)
  ))
);

export interface ArchiveStudentReadiness {
  status: 'ready' | 'missing' | 'archived';
  missingLabels: string[];
  draftId?: string;
}

export const getStudentArchiveReadiness = (
  workspace: ArchiveWorkspace,
  template: ArchiveTemplate,
  student: Student,
): ArchiveStudentReadiness => {
  const draft = workspace.drafts.find(item => item.studentId === student.id && item.templateId === template.id);
  const definition = draft?.templateSnapshot ?? template;
  const range = resolveArchiveDataRange(definition);
  const archived = workspace.snapshots.some(snapshot => (
    snapshot.status === 'archived'
    && snapshot.studentId === student.id
    && snapshot.templateId === template.id
    && snapshot.templateVersion === (draft?.templateVersion ?? template.version)
    && snapshot.periodStart === range.startDate
    && snapshot.periodEnd === range.endDate
  ));
  if (archived) return { status: 'archived', missingLabels: [] };

  const systemValues = getArchiveSystemValues(student);
  const growthSnapshots = buildArchiveGrowthModuleSnapshots(student.id, definition.growthFields, range);
  const missingLabels = [
    ...definition.systemFields
      .filter(key => !systemValues[key]?.trim())
      .map(getArchiveSystemFieldLabel),
    ...definition.growthFields
      .filter(field => field.required && !growthSnapshots.some(snapshot => (
        snapshot.status === 'available'
        && snapshot.items.some(item => item.key === field.key && item.value.trim())
      )))
      .map(field => ARCHIVE_GROWTH_FIELD_GROUPS.flatMap(group => group.fields).find(item => item.key === field.key)?.label ?? '成长数据'),
    ...definition.fields.flatMap(field => {
      const error = getArchiveAnswerValidationError(field, draft?.answers[field.semanticKey]);
      return error ? [field.label] : [];
    }),
  ];

  return {
    status: missingLabels.length > 0 ? 'missing' : 'ready',
    missingLabels: Array.from(new Set(missingLabels)),
    draftId: draft?.id,
  };
};

export const createStudentArchiveDraft = (
  workspace: ArchiveWorkspace,
  templateId: string,
  student: Student,
  classInfo: { id: string; name: string },
  operator: string,
): { workspace: ArchiveWorkspace; draftId: string } => {
  const template = workspace.templates.find(item => item.id === templateId && !item.deletedAt);
  if (!template || template.status !== 'published') return { workspace, draftId: '' };
  const existing = workspace.drafts.find(item => item.studentId === student.id && item.templateId === templateId);
  if (existing) return { workspace, draftId: existing.id };
  const latestSnapshot = workspace.snapshots
    .filter(item => item.status === 'archived' && item.studentId === student.id && item.templateId === templateId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
  const draftId = `draft-${student.id}-${Date.now()}`;
  const draft: ArchiveDraft = {
    id: draftId,
    studentId: student.id,
    studentName: student.name,
    classId: classInfo.id,
    className: classInfo.name,
    templateId: template.id,
    templateName: template.name,
    templateVersion: template.version,
    templateSnapshot: createArchiveTemplateSnapshot(template),
    answers: cloneArchiveAnswers(latestSnapshot?.answers ?? {}),
    createdAt: isoDate(),
    updatedAt: isoDate(),
    createdBy: operator,
  };
  return { workspace: { ...workspace, drafts: [draft, ...workspace.drafts] }, draftId };
};

export interface ArchiveCollectionTarget {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
}

export interface ArchiveCollectionUpdate {
  templateId: string;
  templateName: string;
  templateVersion: number;
  templateSnapshot: ArchiveTemplateSnapshot;
  target: ArchiveCollectionTarget;
  answers: Record<string, ArchiveAnswer>;
  operator: string;
}

export const upsertStudentArchiveCollectionAnswers = (
  workspace: ArchiveWorkspace,
  update: ArchiveCollectionUpdate,
): { workspace: ArchiveWorkspace; updated: boolean } => {
  if (Object.keys(update.answers).length === 0) return { workspace, updated: false };

  const existingDraft = workspace.drafts.find(item => (
    item.studentId === update.target.studentId
    && item.templateId === update.templateId
  ));
  if (existingDraft) {
    return {
      updated: true,
      workspace: {
        ...workspace,
        drafts: workspace.drafts.map(item => item.id === existingDraft.id ? {
          ...item,
          ...(update.templateVersion > item.templateVersion ? {
            templateName: update.templateName,
            templateVersion: update.templateVersion,
            templateSnapshot: cloneTemplateSnapshot(update.templateSnapshot),
          } : {}),
          answers: cloneArchiveAnswers({ ...item.answers, ...update.answers }),
          updatedAt: isoDate(),
        } : item),
      },
    };
  }

  const latestSnapshot = workspace.snapshots
    .filter(item => item.status === 'archived' && item.studentId === update.target.studentId && item.templateId === update.templateId)
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt))[0];
  const draft: ArchiveDraft = {
    id: `draft-${update.target.studentId}-${Date.now()}`,
    studentId: update.target.studentId,
    studentName: update.target.studentName,
    classId: update.target.classId,
    className: update.target.className,
    templateId: update.templateId,
    templateName: update.templateName,
    templateVersion: update.templateVersion,
    templateSnapshot: cloneTemplateSnapshot(update.templateSnapshot),
    answers: cloneArchiveAnswers({ ...(latestSnapshot?.answers ?? {}), ...update.answers }),
    createdAt: isoDate(),
    updatedAt: isoDate(),
    createdBy: update.operator,
  };
  return {
    updated: true,
    workspace: { ...workspace, drafts: [draft, ...workspace.drafts] },
  };
};

export const saveStudentArchiveDraft = (
  workspace: ArchiveWorkspace,
  draftId: string,
  answers: Record<string, ArchiveAnswer>,
  submit: boolean,
  operator: string,
  systemValues: Partial<Record<ArchiveSystemFieldKey, string>> = {},
  growthSnapshots: ArchiveGrowthModuleSnapshot[] = [],
): ArchiveWorkspace => {
  const draft = workspace.drafts.find(item => item.id === draftId);
  if (!draft) return workspace;
  if (!submit) {
    return {
      ...workspace,
      drafts: workspace.drafts.map(item => item.id === draftId ? { ...item, answers: cloneArchiveAnswers(answers), updatedAt: isoDate() } : item),
    };
  }

  const snapshotRange = resolveArchiveDataRange(draft.templateSnapshot);
  const snapshot: ArchiveSnapshot = {
    id: `snapshot-${draft.studentId}-${Date.now()}`,
    studentId: draft.studentId,
    studentName: draft.studentName,
    classId: draft.classId,
    className: draft.className,
    templateId: draft.templateId,
    templateName: draft.templateName,
    templateVersion: draft.templateVersion,
    templateSnapshot: cloneTemplateSnapshot(draft.templateSnapshot),
    period: snapshotRange.label,
    periodStart: snapshotRange.startDate,
    periodEnd: snapshotRange.endDate,
    status: 'archived',
    createdAt: isoDate(),
    createdBy: operator,
    systemValues: { ...systemValues },
    growthSnapshots: cloneGrowthSnapshots(growthSnapshots),
    answers: cloneArchiveAnswers(answers),
  };
  const audit: ArchiveAuditEvent = {
    id: `audit-${Date.now()}`,
    studentId: draft.studentId,
    action: '确认成档',
    operator,
    operatorRole: '教师',
    occurredAt: timestampText(),
    detail: `确认「${draft.templateName}」`,
  };
  return {
    ...workspace,
    drafts: workspace.drafts.filter(item => item.id !== draftId),
    snapshots: [...workspace.snapshots, snapshot],
    auditEvents: [audit, ...workspace.auditEvents],
  };
};

export const batchArchiveStudents = (
  workspace: ArchiveWorkspace,
  templateId: string,
  students: Student[],
  classInfo: Pick<ClassInfo, 'id' | 'name'>,
  operator: string,
): { workspace: ArchiveWorkspace; archivedStudentIds: string[]; skippedStudentIds: string[] } => {
  const template = workspace.templates.find(item => item.id === templateId && item.status === 'published' && !item.deletedAt);
  if (!template) return { workspace, archivedStudentIds: [], skippedStudentIds: students.map(student => student.id) };

  let nextWorkspace = workspace;
  const archivedStudentIds: string[] = [];
  const skippedStudentIds: string[] = [];

  students.forEach(student => {
    const readiness = getStudentArchiveReadiness(nextWorkspace, template, student);
    if (readiness.status !== 'ready') {
      skippedStudentIds.push(student.id);
      return;
    }
    const draftResult = createStudentArchiveDraft(nextWorkspace, template.id, student, classInfo, operator);
    const draft = draftResult.workspace.drafts.find(item => item.id === draftResult.draftId);
    if (!draft) {
      skippedStudentIds.push(student.id);
      return;
    }
    const archiveDefinition = draft.templateSnapshot;
    const archiveRange = resolveArchiveDataRange(archiveDefinition);
    const systemValues = Object.fromEntries(
      archiveDefinition.systemFields.map(key => [key, getArchiveSystemValues(student)[key] ?? '']),
    ) as Partial<Record<ArchiveSystemFieldKey, string>>;
    const growthSnapshots = buildArchiveGrowthModuleSnapshots(student.id, archiveDefinition.growthFields, archiveRange);
    nextWorkspace = saveStudentArchiveDraft(
      draftResult.workspace,
      draft.id,
      draft.answers,
      true,
      operator,
      systemValues,
      growthSnapshots,
    );
    archivedStudentIds.push(student.id);
  });

  return { workspace: nextWorkspace, archivedStudentIds, skippedStudentIds };
};

export const requestSnapshotCorrection = (
  workspace: ArchiveWorkspace,
  snapshotId: string,
  reason: string,
  operator: string,
): ArchiveWorkspace => {
  const source = workspace.snapshots.find(snapshot => snapshot.id === snapshotId);
  if (!source) return workspace;
  const revision: ArchiveSnapshot = {
    ...source,
    id: `snapshot-revision-${Date.now()}`,
    status: 'revision-draft',
    createdAt: isoDate(),
    createdBy: operator,
    revisionOf: source.id,
    correctionReason: reason,
    templateSnapshot: cloneTemplateSnapshot(source.templateSnapshot),
    growthSnapshots: cloneGrowthSnapshots(source.growthSnapshots),
    answers: cloneArchiveAnswers(source.answers),
  };
  const audit: ArchiveAuditEvent = {
    id: `audit-${Date.now()}`,
    studentId: source.studentId,
    action: '申请更正',
    operator,
    operatorRole: '教师',
    occurredAt: timestampText(),
    detail: reason,
  };
  return { ...workspace, snapshots: [...workspace.snapshots, revision], auditEvents: [audit, ...workspace.auditEvents] };
};

export const appendArchiveViewAudit = (workspace: ArchiveWorkspace, studentId: string, operator: string): ArchiveWorkspace => {
  const audit: ArchiveAuditEvent = {
    id: `audit-view-${Date.now()}`,
    studentId,
    action: '查看档案',
    operator,
    operatorRole: '现任教师',
    occurredAt: timestampText(),
    detail: '查看学生完整档案',
  };
  return { ...workspace, auditEvents: [audit, ...workspace.auditEvents].slice(0, 120) };
};

export const getPendingArchiveTasksForTeacher = (
  workspace: ArchiveWorkspace,
  teacherName: string,
  homeroomClassIds: string[],
): ArchiveDraft[] => workspace.drafts.filter(draft => (
  homeroomClassIds.includes(draft.classId) || draft.createdBy === teacherName
));

export const createArchiveField = (sectionId = ''): ArchiveField => ({
  id: `field-custom-${Date.now()}`,
  semanticKey: `custom-${Date.now()}`,
  label: '',
  type: 'text',
  sectionId,
  required: false,
  options: [],
  customAnswerOptions: [],
  settings: {},
});
