import type { ClassInfo, Student } from '../mobile-app/types';
import { normalizeFormFieldSettings, type FormFieldSettings, type FormLayoutMode, type FormSection } from './formDefinition';
import { readStudentGrowthProfile } from './studentGrowthStore';
import {
  PLATFORM_GROWTH_FIELD_CATALOG,
  PLATFORM_GROWTH_FIELD_GROUPS,
  formatGrowthFieldValue,
  getEnabledGrowthFields,
  getGrowthFieldDefinition,
  getGrowthFieldGroups,
  type GrowthFieldGroupKey,
  type GrowthInputFieldKey,
} from './studentGrowthFieldCatalog';

export type ArchiveTemplateStatus = 'recommended' | 'draft' | 'ready' | 'published' | 'disabled';
export type ArchiveFieldType = 'text' | 'single-select' | 'multiple-select' | 'date' | 'number';
export type ArchiveDataRangeMode = 'semester' | 'school_year' | 'custom';
export type ArchiveGenerationMode = 'once' | 'semester' | 'school_year' | 'continuous';
export type ArchiveThemeId = 'clean' | 'sky' | 'leaf' | 'sunny';
export type ArchiveHeaderImageId = 'none' | 'learning' | 'growth' | 'sports' | 'creativity';
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

export const ARCHIVE_GROWTH_MODULE_OPTIONS: Array<{
  key: ArchiveGrowthModuleKey;
  label: string;
  description: string;
}> = [
  ...PLATFORM_GROWTH_FIELD_GROUPS.map(group => ({
    key: group.key as ArchiveGrowthModuleKey,
    label: group.label,
    description: group.description,
  })),
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
    .flatMap(group => group.fields.map(field => ({ key: field.key, required: false, missingPolicy: 'supplement' as const })))
);

export const getArchiveGrowthModulesForFields = (fields: ArchiveGrowthFieldConfig[]): ArchiveGrowthModuleConfig[] => {
  const modules = new Map<ArchiveGrowthModuleKey, ArchiveGrowthModuleConfig>();
  fields.forEach(field => {
    const group = ARCHIVE_GROWTH_FIELD_GROUPS.find(item => item.fields.some(option => option.key === field.key));
    if (!group) return;
    const existing = modules.get(group.key);
    modules.set(group.key, { key: group.key, required: Boolean(existing?.required || getArchiveGrowthMissingPolicy(field) === 'required') });
  });
  return Array.from(modules.values());
};

const DEFAULT_ARCHIVE_SYSTEM_FIELDS: ArchiveSystemFieldKey[] = [];

export type ArchiveSection = FormSection;

export interface ArchiveField {
  id: string;
  semanticKey: string;
  label: string;
  type: ArchiveFieldType;
  sectionId: string;
  order?: number;
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
  sectionId?: string;
  order?: number;
  required: boolean;
  missingPolicy?: ArchiveGrowthMissingPolicy;
}

export type ArchiveGrowthMissingPolicy = 'omit' | 'supplement' | 'required';

export interface ArchiveAppearance {
  themeId: ArchiveThemeId;
  headerImageId: ArchiveHeaderImageId;
}

export const DEFAULT_ARCHIVE_APPEARANCE: ArchiveAppearance = {
  themeId: 'clean',
  headerImageId: 'none',
};

export const getArchiveGrowthMissingPolicy = (field: ArchiveGrowthFieldConfig): ArchiveGrowthMissingPolicy => (
  field.missingPolicy ?? (field.required ? 'required' : 'supplement')
);

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

export interface ArchivePeriod extends ArchiveDataRange {
  key: string;
}

export interface ArchiveTemplate {
  id: string;
  spaceId: string;
  name: string;
  origin: 'recommended' | 'school';
  status: ArchiveTemplateStatus;
  version: number;
  generationMode: ArchiveGenerationMode;
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
  appearance: ArchiveAppearance;
  draftOwnerKey?: string;
  updatedAt: string;
  deletedAt?: string;
}

export const hasArchiveDesignDraftContent = (template: ArchiveTemplate): boolean => (
  Boolean(template.name.trim())
  || template.gradeScopes.length > 0
  || template.fields.length > 0
  || template.growthFields.length > 0
  || template.sections.length > 0
  || template.layoutMode !== 'flat'
  || template.generationMode !== 'once'
  || template.dataRangeMode !== 'semester'
  || template.appearance.themeId !== DEFAULT_ARCHIVE_APPEARANCE.themeId
  || template.appearance.headerImageId !== DEFAULT_ARCHIVE_APPEARANCE.headerImageId
);

export interface ArchiveTemplateSnapshot {
  name: string;
  version: number;
  generationMode: ArchiveGenerationMode;
  dataRangeMode: ArchiveDataRangeMode;
  customDataRangeStart?: string;
  customDataRangeEnd?: string;
  layoutMode: FormLayoutMode;
  systemFields: ArchiveSystemFieldKey[];
  growthModules: ArchiveGrowthModuleConfig[];
  growthFields: ArchiveGrowthFieldConfig[];
  sections: ArchiveSection[];
  fields: ArchiveField[];
  appearance: ArchiveAppearance;
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
  periodKey: string;
  periodLabel: string;
  dataUpdatedAt: string;
  snapshotId?: string;
  answers: Record<string, ArchiveAnswer>;
  growthSnapshots: ArchiveGrowthModuleSnapshot[];
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
  periodKey: string;
  period: string;
  periodStart: string;
  periodEnd: string;
  status: 'archived' | 'revision-draft';
  dataUpdatedAt: string;
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
  action: '查看档案' | '确认成档' | '更新档案' | '申请更正';
  operator: string;
  operatorRole: string;
  occurredAt: string;
  detail: string;
}

export interface ArchiveWorkspace {
  schemaVersion: 11;
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

const profileField = (
  semanticKey: string,
  label: string,
  type: ArchiveFieldType,
  sectionId: string,
  required = true,
  options: string[] = [],
): ArchiveField => ({
  ...field(semanticKey, label, type, sectionId, required, options),
  customAnswerOptions: options.includes('其他') ? ['其他'] : [],
});

const section = (id: string, label: string): ArchiveSection => ({ id, label });

const summarySection = section('summary', '教师交接摘要');

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

const studentProfileFields: ArchiveField[] = [
  profileField('personality-traits', '性格特点', 'multiple-select', 'personality-social', true, ['开朗健谈', '安静细致', '活泼好动', '独立自主', '慢热谨慎', '好奇主动', '责任感强', '待继续观察', '其他']),
  profileField('emotion-expression', '情绪表达方式', 'multiple-select', 'personality-social', true, ['愿意主动表达', '需要耐心引导', '更习惯通过行动表达', '情绪变化较明显', '通常较为平稳', '待继续观察', '其他']),
  profileField('peer-interaction', '同伴相处特点', 'multiple-select', 'personality-social', true, ['主动结交同伴', '更喜欢固定伙伴', '擅长合作', '乐于帮助同伴', '需要支持融入集体', '待继续观察', '其他']),
  profileField('teacher-communication', '与老师沟通偏好', 'multiple-select', 'personality-social', true, ['当面直接交流', '一对一交流', '先给予准备时间', '通过具体问题引导', '通过书面或作品表达', '待继续观察', '其他']),
  profileField('personal-interests', '兴趣爱好', 'multiple-select', 'interests-strengths', true, ['阅读表达', '科学探究', '艺术创作', '音乐表演', '体育运动', '劳动实践', '编程科技', '自然观察', '同伴交往', '其他']),
  profileField('strong-areas', '擅长领域', 'multiple-select', 'interests-strengths', true, ['语言表达', '逻辑思考', '动手实践', '艺术表现', '体育运动', '组织协作', '观察发现', '待继续观察', '其他']),
  profileField('representative-strength', '代表性特长', 'text', 'interests-strengths', false),
  profileField('preferred-activities', '喜欢参与的活动', 'multiple-select', 'interests-strengths', true, ['独立任务', '同伴合作', '公开展示', '竞赛挑战', '实践体验', '户外活动', '公益服务', '其他']),
  profileField('class-participation', '课堂参与特点', 'multiple-select', 'learning-support', true, ['主动发言', '小组讨论', '动手实践', '独立思考', '倾听观察', '需要邀请后参与', '待继续观察', '其他']),
  profileField('preferred-learning-style', '适合的学习方式', 'multiple-select', 'learning-support', true, ['讲解示范', '图像观察', '动手实践', '讨论合作', '自主探索', '反复练习', '其他']),
  profileField('difficulty-response', '遇到困难时的表现', 'multiple-select', 'learning-support', true, ['先自行尝试', '主动寻求帮助', '观察同伴做法', '容易暂时停下', '需要情绪支持', '待继续观察', '其他']),
  profileField('effective-motivation', '有效激励方式', 'multiple-select', 'learning-support', true, ['具体表扬', '阶段目标', '展示机会', '责任任务', '同伴合作', '私下鼓励', '自主选择', '其他']),
  profileField('teacher-attention', '需要老师留意的情况', 'text', 'learning-support', false),
];

const cloneFields = (items: ArchiveField[]) => items.map(item => ({
  ...item,
  options: [...item.options],
  customAnswerOptions: [...(item.customAnswerOptions ?? [])],
  settings: normalizeFormFieldSettings(item.type, item.settings, item.options),
}));
const cloneSections = (items: ArchiveSection[]) => items.map(item => ({ ...item }));
const cloneGrowthModules = (items: ArchiveGrowthModuleConfig[]) => items.map(item => ({ ...item }));
const cloneGrowthFields = (items: ArchiveGrowthFieldConfig[]) => items.map(item => {
  const missingPolicy = getArchiveGrowthMissingPolicy(item);
  return { ...item, required: missingPolicy === 'required', missingPolicy };
});
const cloneGrowthSnapshots = (items: ArchiveGrowthModuleSnapshot[]) => items.map(item => ({
  ...item,
  items: item.items.map(value => ({ ...value })),
}));
const cloneArchiveAppearance = (appearance?: ArchiveAppearance): ArchiveAppearance => ({
  ...(appearance ?? DEFAULT_ARCHIVE_APPEARANCE),
});

export const createEmptyArchiveGrowthSnapshots = (
  fields: ArchiveGrowthFieldConfig[],
): ArchiveGrowthModuleSnapshot[] => getArchiveGrowthModulesForFields(fields).map(module => {
  const group = ARCHIVE_GROWTH_FIELD_GROUPS.find(item => item.key === module.key);
  return {
    key: module.key,
    label: group?.label ?? module.key,
    status: 'missing',
    occurredAt: '',
    sourceLabel: '',
    sourceVersion: 0,
    items: fields.flatMap(config => {
      const field = group?.fields.find(item => item.key === config.key);
      return field ? [{ key: config.key, label: field.label, value: '' }] : [];
    }),
  };
});

export const mergeArchiveGrowthSnapshots = (
  current: ArchiveGrowthModuleSnapshot[],
  incoming: ArchiveGrowthModuleSnapshot[],
): ArchiveGrowthModuleSnapshot[] => {
  const nextByModule = new Map(current.map(module => [module.key, {
    ...module,
    items: module.items.map(item => ({ ...item })),
  }]));
  incoming.forEach(module => {
    const currentModule = nextByModule.get(module.key);
    if (!currentModule) {
      nextByModule.set(module.key, cloneGrowthSnapshots([module])[0]);
      return;
    }
    const nextItems = new Map(currentModule.items.map(item => [item.key ?? item.label, item]));
    module.items.forEach(item => {
      if (item.value.trim()) nextItems.set(item.key ?? item.label, { ...item });
    });
    const items = Array.from(nextItems.values());
    nextByModule.set(module.key, {
      ...currentModule,
      ...module,
      status: items.some(item => item.value.trim()) ? 'available' : 'missing',
      items,
    });
  });
  return Array.from(nextByModule.values());
};

export const createArchiveTemplateSnapshot = (template: ArchiveTemplate): ArchiveTemplateSnapshot => ({
  name: template.name,
  version: template.version,
  generationMode: template.generationMode,
  dataRangeMode: template.dataRangeMode,
  customDataRangeStart: template.customDataRangeStart,
  customDataRangeEnd: template.customDataRangeEnd,
  layoutMode: template.layoutMode,
  systemFields: [...template.systemFields],
  growthModules: cloneGrowthModules(template.growthModules),
  growthFields: cloneGrowthFields(template.growthFields),
  sections: cloneSections(template.sections),
  fields: cloneFields(template.fields),
  appearance: cloneArchiveAppearance(template.appearance),
});

const cloneTemplateSnapshot = (snapshot: ArchiveTemplateSnapshot): ArchiveTemplateSnapshot => ({
  ...snapshot,
  systemFields: [...snapshot.systemFields],
  growthModules: cloneGrowthModules(snapshot.growthModules),
  growthFields: cloneGrowthFields(snapshot.growthFields),
  sections: cloneSections(snapshot.sections),
  fields: cloneFields(snapshot.fields),
  appearance: cloneArchiveAppearance(snapshot.appearance),
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
const studentProfileSections: ArchiveSection[] = [
  section('personality-social', '性格与相处'),
  section('interests-strengths', '兴趣与特长'),
  section('learning-support', '学习与支持'),
];

const recommendedEntryAppearance: ArchiveAppearance = { themeId: 'leaf', headerImageId: 'growth' };
const recommendedStudentProfileAppearance: ArchiveAppearance = { themeId: 'sky', headerImageId: 'learning' };

const createRecommendedTemplates = (spaceId: string): ArchiveTemplate[] => {
  return [
    {
      id: 'recommended-entry-v1',
      spaceId,
      name: '一年级初始成长档案',
      origin: 'recommended',
      status: 'recommended',
      version: 1,
      generationMode: 'once',
      dataRangeMode: 'custom',
      customDataRangeStart: '2025-08-01',
      customDataRangeEnd: '2025-09-30',
      layoutMode: 'grouped',
      gradeScopes: ['一年级'],
      systemFields: [],
      growthModules: [],
      growthFields: [],
      sections: cloneSections(entrySections),
      fields: cloneFields(entryFields),
      appearance: cloneArchiveAppearance(recommendedEntryAppearance),
      updatedAt: '2026-07-01',
    },
    {
      id: 'recommended-student-profile-v1',
      spaceId,
      name: '学生个性与特长档案',
      origin: 'recommended',
      status: 'recommended',
      version: 1,
      generationMode: 'once',
      dataRangeMode: 'school_year',
      layoutMode: 'grouped',
      gradeScopes: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '七年级', '八年级', '九年级', '高一', '高二', '高三'],
      systemFields: [],
      growthModules: [],
      growthFields: [],
      sections: cloneSections(studentProfileSections),
      fields: cloneFields(studentProfileFields),
      appearance: cloneArchiveAppearance(recommendedStudentProfileAppearance),
      updatedAt: '2026-08-05',
    },
  ];
};

const REMOVED_DEMO_ARCHIVE_TEMPLATE_IDS = new Set([
  'recommended-term-v1',
  'recommended-transition-v1',
  'school-term-growth-v2',
  'school-entry-draft-v1',
]);

const isRemovedDemoArchiveTemplateId = (templateId: string) => REMOVED_DEMO_ARCHIVE_TEMPLATE_IDS.has(templateId);
const isRemovedDemoArchiveAuditEvent = (event: ArchiveAuditEvent) => event.id === 'audit-seed-1' || event.id === 'audit-seed-2';
const isLegacyEntryDemoSnapshot = (snapshot: StoredArchiveSnapshot) => (
  snapshot.templateId === 'recommended-entry-v1'
  && snapshot.createdAt === '2025-09-28'
  && snapshot.createdBy === '张林老师'
  && snapshot.id.endsWith('-entry')
);

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

export const getArchiveGenerationModeLabel = (mode: ArchiveGenerationMode) => ({
  once: '仅填写一次',
  semester: '每学期生成一份',
  school_year: '每学年生成一份',
  continuous: '可重复填写',
}[mode]);

type ArchiveGenerationSource = Pick<ArchiveTemplate, 'generationMode'>
  | Pick<ArchiveTemplateSnapshot, 'generationMode'>;

export const resolveArchivePeriod = (
  _source: ArchiveGenerationSource,
  _referenceDate = isoDate(),
): ArchivePeriod => {
  return { key: 'current', label: '', startDate: '', endDate: '' };
};

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

const createSeedWorkspace = ({ spaceId }: ArchiveWorkspaceContext): ArchiveWorkspace => {
  const recommended = createRecommendedTemplates(spaceId);
  const drafts: ArchiveDraft[] = [];
  const snapshots: ArchiveSnapshot[] = [];

  const auditEvents: ArchiveAuditEvent[] = [];

  return {
    schemaVersion: 11,
    spaceId,
    templates: recommended,
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
  if (template.id === 'recommended-entry-v1') {
    return [{ key: 'daily_performance', required: false }];
  }
  return [];
};

const inferArchiveGenerationMode = (source: { id?: string; dataRangeMode?: ArchiveDataRangeMode }): ArchiveGenerationMode => {
  if (source.id?.includes('entry') || source.id?.includes('transition')) return 'once';
  if (source.dataRangeMode === 'custom') return 'once';
  if (source.dataRangeMode === 'semester') return 'semester';
  return 'school_year';
};

const normalizeTemplate = (template: ArchiveTemplate, fallbackDraftOwnerKey?: string): ArchiveTemplate => {
  const growthModules = (template.growthModules ?? getLegacyTemplateGrowthModules(template))
    .filter(module => SELECTABLE_ARCHIVE_GROWTH_MODULE_KEYS.has(module.key));
  const sections = (template.sections ?? []).map(item => ({ id: item.id, label: item.label }));
  const layoutMode = template.layoutMode ?? (sections.length > 0 ? 'grouped' : 'flat');
  const fallbackSectionId = layoutMode === 'grouped' ? sections[0]?.id : undefined;
  return {
    ...template,
    generationMode: template.generationMode === 'continuous' ? 'continuous' : 'once',
    dataRangeMode: template.dataRangeMode ?? 'school_year',
    layoutMode,
    systemFields: [],
    growthModules: cloneGrowthModules(growthModules),
    growthFields: cloneGrowthFields(template.growthFields ?? growthFieldsForModules(growthModules.map(module => module.key)))
      .filter(field => SELECTABLE_ARCHIVE_GROWTH_FIELD_KEYS.has(field.key))
      .map(field => ({
        ...field,
        sectionId: layoutMode === 'grouped'
          ? sections.some(section => section.id === field.sectionId) ? field.sectionId : fallbackSectionId
          : undefined,
      })),
    sections,
    appearance: cloneArchiveAppearance(template.appearance),
    draftOwnerKey: template.status === 'draft' ? template.draftOwnerKey ?? fallbackDraftOwnerKey : undefined,
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

type StoredTemplateSnapshot = Omit<ArchiveTemplateSnapshot, 'generationMode' | 'dataRangeMode' | 'customDataRangeStart' | 'customDataRangeEnd' | 'systemFields' | 'growthModules' | 'growthFields' | 'appearance'> & {
  generationMode?: ArchiveGenerationMode;
  dataRangeMode?: ArchiveDataRangeMode;
  customDataRangeStart?: string;
  customDataRangeEnd?: string;
  systemFields?: ArchiveSystemFieldKey[];
  growthModules?: ArchiveGrowthModuleConfig[];
  growthFields?: ArchiveGrowthFieldConfig[];
  appearance?: ArchiveAppearance;
};
type StoredArchiveDraft = Omit<ArchiveDraft, 'templateSnapshot' | 'periodKey' | 'periodLabel' | 'growthSnapshots' | 'dataUpdatedAt'> & {
  templateSnapshot?: StoredTemplateSnapshot;
  periodKey?: string;
  periodLabel?: string;
  growthSnapshots?: ArchiveGrowthModuleSnapshot[];
  dataUpdatedAt?: string;
};
type StoredArchiveSnapshot = Omit<ArchiveSnapshot, 'templateSnapshot' | 'periodKey' | 'periodStart' | 'periodEnd' | 'systemValues' | 'growthSnapshots' | 'dataUpdatedAt'> & {
  templateSnapshot?: StoredTemplateSnapshot;
  periodKey?: string;
  periodStart?: string;
  periodEnd?: string;
  systemValues?: Partial<Record<ArchiveSystemFieldKey, string>>;
  growthSnapshots?: ArchiveGrowthModuleSnapshot[];
  dataUpdatedAt?: string;
};

const normalizeTemplateSnapshot = (snapshot: StoredTemplateSnapshot): ArchiveTemplateSnapshot => {
  const sections = cloneSections(snapshot.sections);
  const layoutMode = snapshot.layoutMode ?? (sections.length > 0 ? 'grouped' : 'flat');
  const fallbackSectionId = layoutMode === 'grouped' ? sections[0]?.id : undefined;
  return {
    ...snapshot,
    generationMode: snapshot.generationMode === 'continuous' ? 'continuous' : 'once',
    dataRangeMode: snapshot.dataRangeMode ?? 'school_year',
    layoutMode,
    systemFields: [...(snapshot.systemFields ?? DEFAULT_ARCHIVE_SYSTEM_FIELDS)],
    growthModules: cloneGrowthModules(snapshot.growthModules ?? [])
      .filter(module => SELECTABLE_ARCHIVE_GROWTH_MODULE_KEYS.has(module.key)),
    growthFields: cloneGrowthFields(snapshot.growthFields ?? growthFieldsForModules((snapshot.growthModules ?? []).map(module => module.key)))
      .filter(field => SELECTABLE_ARCHIVE_GROWTH_FIELD_KEYS.has(field.key))
      .map(field => ({
        ...field,
        sectionId: layoutMode === 'grouped'
          ? sections.some(section => section.id === field.sectionId) ? field.sectionId : fallbackSectionId
          : undefined,
      })),
    sections,
    fields: cloneFields(snapshot.fields),
    appearance: cloneArchiveAppearance(snapshot.appearance),
  };
};

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
    generationMode: 'school_year',
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
    appearance: cloneArchiveAppearance(DEFAULT_ARCHIVE_APPEARANCE),
  };
};

const hydrateStudentArchiveRecords = (
  drafts: StoredArchiveDraft[],
  snapshots: StoredArchiveSnapshot[],
  templates: ArchiveTemplate[],
): Pick<ArchiveWorkspace, 'drafts' | 'snapshots'> => ({
  drafts: drafts.map(record => {
    const templateSnapshot = resolveStoredTemplateSnapshot(record, templates, true);
    const period = resolveArchivePeriod(templateSnapshot, record.createdAt);
    const latestSnapshot = snapshots
      .filter(snapshot => snapshot.status === 'archived' && snapshot.studentId === record.studentId && snapshot.templateId === record.templateId)
      .sort((left, right) => (right.dataUpdatedAt ?? right.createdAt).localeCompare(left.dataUpdatedAt ?? left.createdAt))[0];
    return {
      ...record,
      templateSnapshot,
      periodKey: period.key,
      periodLabel: period.label,
      dataUpdatedAt: record.dataUpdatedAt ?? latestSnapshot?.dataUpdatedAt ?? record.updatedAt ?? record.createdAt,
      snapshotId: record.snapshotId ?? latestSnapshot?.id,
      growthSnapshots: cloneGrowthSnapshots(record.growthSnapshots ?? []),
    };
  }),
  snapshots: snapshots.map(record => {
    const templateSnapshot = resolveStoredTemplateSnapshot(record, templates);
    const range = resolveArchiveDataRange(templateSnapshot, record.createdAt);
    const period = resolveArchivePeriod(templateSnapshot, record.createdAt);
    return {
      ...record,
      templateSnapshot,
      periodKey: period.key,
      period: period.label,
      periodStart: record.periodStart ?? (period.startDate || range.startDate),
      periodEnd: record.periodEnd ?? (period.endDate || range.endDate),
      dataUpdatedAt: record.dataUpdatedAt ?? record.createdAt,
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
    if (parsed.schemaVersion === 3 || parsed.schemaVersion === 4 || parsed.schemaVersion === 5 || parsed.schemaVersion === 6 || parsed.schemaVersion === 7 || parsed.schemaVersion === 8 || parsed.schemaVersion === 9 || parsed.schemaVersion === 10 || parsed.schemaVersion === 11) {
      const draftOwnerKey = `${context.spaceId}:${context.teacherName}`;
      const templates = [
        ...createRecommendedTemplates(context.spaceId),
        ...(parsed.templates ?? [])
          .filter(template => template.origin !== 'recommended' && !isRemovedDemoArchiveTemplateId(template.id))
          .map(template => normalizeTemplate(template, draftOwnerKey)),
      ];
      const records = hydrateStudentArchiveRecords(
        (parsed.drafts ?? []).filter(record => !isRemovedDemoArchiveTemplateId(record.templateId)),
        (parsed.snapshots ?? []).filter(record => !isRemovedDemoArchiveTemplateId(record.templateId) && !isLegacyEntryDemoSnapshot(record)),
        templates,
      );
      return {
        schemaVersion: 11,
        spaceId: parsed.spaceId ?? context.spaceId,
        templates,
        ...records,
        auditEvents: (parsed.auditEvents ?? []).filter(event => !isRemovedDemoArchiveAuditEvent(event)),
      };
    }
    if (parsed.schemaVersion !== 1 && parsed.schemaVersion !== 2) return seed;

    const recommended = createRecommendedTemplates(context.spaceId);
    const legacyTemplates = (parsed.templates ?? []) as Array<Omit<ArchiveTemplate, 'fields' | 'layoutMode'> & { fields: LegacyField[]; layoutMode?: FormLayoutMode }>;
    const migratedTemplates = legacyTemplates
      .filter(template => template.origin !== 'recommended' && !isRemovedDemoArchiveTemplateId(template.id))
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
    const legacyTasks = ((parsed as unknown as { tasks?: LegacyTask[] }).tasks ?? [])
      .filter(task => !isRemovedDemoArchiveTemplateId(task.templateId));
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
    const templates = [
      ...recommended,
      ...migratedTemplates.map(template => normalizeTemplate(template as ArchiveTemplate, `${context.spaceId}:${context.teacherName}`)),
    ];
    const records = hydrateStudentArchiveRecords(
      drafts.filter(record => !isRemovedDemoArchiveTemplateId(record.templateId)),
      (parsed.snapshots ?? []).filter(record => !isRemovedDemoArchiveTemplateId(record.templateId) && !isLegacyEntryDemoSnapshot(record)),
      templates,
    );
    return {
      schemaVersion: 11,
      spaceId: parsed.spaceId ?? context.spaceId,
      templates,
      ...records,
      auditEvents: (parsed.auditEvents ?? []).filter(event => !isRemovedDemoArchiveAuditEvent(event)),
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

export const cloneRecommendedTemplate = (workspace: ArchiveWorkspace, templateId: string, draftOwnerKey?: string): { workspace: ArchiveWorkspace; templateId: string } => {
  const source = workspace.templates.find(template => template.id === templateId && !template.deletedAt);
  if (!source) return { workspace, templateId };
  const nextId = `school-template-${Date.now()}`;
  const copy: ArchiveTemplate = {
    ...source,
    id: nextId,
    name: source.name,
    origin: 'school',
    status: 'draft',
    draftOwnerKey,
    version: 1,
    updatedAt: isoDate(),
    systemFields: [...source.systemFields],
    growthModules: cloneGrowthModules(source.growthModules),
    growthFields: cloneGrowthFields(source.growthFields),
    sections: cloneSections(source.sections),
    fields: cloneFields(source.fields),
    appearance: cloneArchiveAppearance(source.appearance),
  };
  return { workspace: { ...workspace, templates: [...workspace.templates, copy] }, templateId: nextId };
};

export const createBlankArchiveTemplate = (workspace: ArchiveWorkspace, draftOwnerKey?: string): { workspace: ArchiveWorkspace; templateId: string } => {
  const templateId = `school-template-blank-${Date.now()}`;
  const template: ArchiveTemplate = {
    id: templateId,
    spaceId: workspace.spaceId,
    name: '',
    origin: 'school',
    status: 'draft',
    draftOwnerKey,
    version: 1,
    generationMode: 'once',
    dataRangeMode: 'semester',
    layoutMode: 'flat',
    gradeScopes: [],
    systemFields: [...DEFAULT_ARCHIVE_SYSTEM_FIELDS],
    growthModules: [],
    growthFields: [],
    sections: [],
    fields: [],
    appearance: cloneArchiveAppearance(DEFAULT_ARCHIVE_APPEARANCE),
    updatedAt: isoDate(),
  };
  return { workspace: { ...workspace, templates: [...workspace.templates, template] }, templateId };
};

export const saveArchiveTemplate = (workspace: ArchiveWorkspace, template: ArchiveTemplate): ArchiveWorkspace => {
  const savedTemplate = {
    ...template,
    generationMode: template.generationMode === 'continuous' ? 'continuous' as const : 'once' as const,
    appearance: cloneArchiveAppearance(template.appearance),
    draftOwnerKey: template.status === 'draft' ? template.draftOwnerKey : undefined,
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

export const getArchiveDesignDraft = (workspace: ArchiveWorkspace, draftOwnerKey: string): ArchiveTemplate | undefined => (
  workspace.templates
    .filter(template => template.origin === 'school' && template.status === 'draft' && template.draftOwnerKey === draftOwnerKey && !template.deletedAt)
    .sort((left, right) => right.updatedAt.localeCompare(left.updatedAt))[0]
);

export const discardArchiveDesignDrafts = (workspace: ArchiveWorkspace, draftOwnerKey: string): ArchiveWorkspace => ({
  ...workspace,
  templates: workspace.templates.filter(template => !(
    template.origin === 'school'
    && template.status === 'draft'
    && template.draftOwnerKey === draftOwnerKey
  )),
});

export const saveArchiveDesignDraft = (
  workspace: ArchiveWorkspace,
  template: ArchiveTemplate,
  draftOwnerKey: string,
): ArchiveWorkspace => {
  const withoutOtherDrafts = discardArchiveDesignDrafts(workspace, draftOwnerKey);
  return saveArchiveTemplate(withoutOtherDrafts, {
    ...template,
    status: 'draft',
    draftOwnerKey,
  });
};

export const deleteArchiveTemplate = (
  workspace: ArchiveWorkspace,
  templateId: string,
): { workspace: ArchiveWorkspace; deleted: boolean } => {
  const template = workspace.templates.find(item => item.id === templateId);
  const canDelete = template?.origin === 'school'
    && !template.deletedAt
    && template.status !== 'recommended';
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

export const createStudentArchiveDraft = (
  workspace: ArchiveWorkspace,
  templateId: string,
  student: Student,
  classInfo: { id: string; name: string },
  operator: string,
  options: { dataUpdatedAt?: string; snapshotId?: string } = {},
): { workspace: ArchiveWorkspace; draftId: string } => {
  const template = workspace.templates.find(item => item.id === templateId && (options.snapshotId || !item.deletedAt));
  if (!template || (!options.snapshotId && template.status !== 'published')) return { workspace, draftId: '' };
  const period = resolveArchivePeriod(template);
  const existing = workspace.drafts.find(item => (
    item.studentId === student.id
    && item.templateId === templateId
    && item.periodKey === period.key
    && (!options.snapshotId || item.snapshotId === options.snapshotId)
  ));
  if (existing) return { workspace, draftId: existing.id };
  const latestSnapshot = workspace.snapshots
    .filter(item => item.status === 'archived' && item.studentId === student.id && item.templateId === templateId)
    .sort((left, right) => right.dataUpdatedAt.localeCompare(left.dataUpdatedAt) || right.createdAt.localeCompare(left.createdAt))[0];
  const sourceSnapshot = options.snapshotId
    ? workspace.snapshots.find(item => (
        item.id === options.snapshotId
        && item.status === 'archived'
        && item.studentId === student.id
        && item.templateId === templateId
      ))
    : latestSnapshot;
  const draftId = `draft-${student.id}-${Date.now()}`;
  const draft: ArchiveDraft = {
    id: draftId,
    studentId: student.id,
    studentName: student.name,
    classId: classInfo.id,
    className: classInfo.name,
    templateId: template.id,
    templateName: sourceSnapshot?.templateName ?? template.name,
    templateVersion: sourceSnapshot?.templateVersion ?? template.version,
    templateSnapshot: sourceSnapshot ? cloneTemplateSnapshot(sourceSnapshot.templateSnapshot) : createArchiveTemplateSnapshot(template),
    periodKey: period.key,
    periodLabel: period.label,
    dataUpdatedAt: options.dataUpdatedAt ?? sourceSnapshot?.dataUpdatedAt ?? isoDate(),
    snapshotId: sourceSnapshot?.id,
    answers: cloneArchiveAnswers(sourceSnapshot?.answers ?? latestSnapshot?.answers ?? {}),
    growthSnapshots: cloneGrowthSnapshots(sourceSnapshot?.growthSnapshots ?? latestSnapshot?.growthSnapshots ?? []),
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
  periodKey: string;
  periodLabel: string;
  target: ArchiveCollectionTarget;
  answers: Record<string, ArchiveAnswer>;
  growthSnapshots: ArchiveGrowthModuleSnapshot[];
  dataUpdatedAt: string;
  operator: string;
}

export const upsertStudentArchiveCollectionAnswers = (
  workspace: ArchiveWorkspace,
  update: ArchiveCollectionUpdate,
): { workspace: ArchiveWorkspace; updated: boolean } => {
  const hasGrowthValues = update.growthSnapshots.some(module => module.items.some(item => item.value.trim()));
  if (Object.keys(update.answers).length === 0 && !hasGrowthValues) return { workspace, updated: false };

  const existingDraft = workspace.drafts.find(item => (
    item.studentId === update.target.studentId
    && item.templateId === update.templateId
    && item.periodKey === update.periodKey
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
          growthSnapshots: mergeArchiveGrowthSnapshots(item.growthSnapshots, update.growthSnapshots),
          dataUpdatedAt: update.dataUpdatedAt,
          updatedAt: isoDate(),
        } : item),
        auditEvents: [{
          id: `audit-collection-${Date.now()}`,
          studentId: update.target.studentId,
          action: '更新档案',
          operator: update.operator,
          operatorRole: '填写人',
          occurredAt: timestampText(),
          detail: `通过采集更新「${update.templateName}」`,
        }, ...workspace.auditEvents],
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
    periodKey: update.periodKey,
    periodLabel: update.periodLabel,
    dataUpdatedAt: update.dataUpdatedAt,
    snapshotId: latestSnapshot?.id,
    answers: cloneArchiveAnswers({ ...(latestSnapshot?.answers ?? {}), ...update.answers }),
    growthSnapshots: mergeArchiveGrowthSnapshots(latestSnapshot?.growthSnapshots ?? [], update.growthSnapshots),
    createdAt: isoDate(),
    updatedAt: isoDate(),
    createdBy: update.operator,
  };
  return {
    updated: true,
    workspace: {
      ...workspace,
      drafts: [draft, ...workspace.drafts],
      auditEvents: [{
        id: `audit-collection-${Date.now()}`,
        studentId: update.target.studentId,
        action: '更新档案',
        operator: update.operator,
        operatorRole: '填写人',
        occurredAt: timestampText(),
        detail: `通过采集建立「${update.templateName}」`,
      }, ...workspace.auditEvents],
    },
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
      drafts: workspace.drafts.map(item => item.id === draftId ? {
        ...item,
        answers: cloneArchiveAnswers(answers),
        growthSnapshots: cloneGrowthSnapshots(growthSnapshots),
        updatedAt: isoDate(),
      } : item),
    };
  }

  const snapshotRange = resolveArchiveDataRange(draft.templateSnapshot);
  const snapshotPeriod = resolveArchivePeriod(draft.templateSnapshot, draft.createdAt);
  const existingSnapshot = draft.snapshotId
    ? workspace.snapshots.find(item => item.id === draft.snapshotId && item.status === 'archived')
    : undefined;
  const snapshot: ArchiveSnapshot = {
    id: existingSnapshot?.id ?? `snapshot-${draft.studentId}-${Date.now()}`,
    studentId: draft.studentId,
    studentName: draft.studentName,
    classId: draft.classId,
    className: draft.className,
    templateId: draft.templateId,
    templateName: draft.templateName,
    templateVersion: draft.templateVersion,
    templateSnapshot: cloneTemplateSnapshot(draft.templateSnapshot),
    periodKey: draft.periodKey,
    period: draft.periodLabel,
    periodStart: snapshotPeriod.startDate || snapshotRange.startDate,
    periodEnd: snapshotPeriod.endDate || snapshotRange.endDate,
    status: 'archived',
    dataUpdatedAt: draft.dataUpdatedAt,
    createdAt: existingSnapshot?.createdAt ?? isoDate(),
    createdBy: operator,
    systemValues: { ...systemValues },
    growthSnapshots: cloneGrowthSnapshots(growthSnapshots),
    answers: cloneArchiveAnswers(answers),
  };
  const audit: ArchiveAuditEvent = {
    id: `audit-${Date.now()}`,
    studentId: draft.studentId,
    action: '更新档案',
    operator,
    operatorRole: '教师',
    occurredAt: timestampText(),
    detail: `保存「${draft.templateName}」修改`,
  };
  return {
    ...workspace,
    drafts: workspace.drafts.filter(item => item.id !== draftId),
    snapshots: existingSnapshot
      ? workspace.snapshots.map(item => item.id === existingSnapshot.id ? snapshot : item)
      : [...workspace.snapshots, snapshot],
    auditEvents: [audit, ...workspace.auditEvents],
  };
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

const archiveFieldDefaultLabels: Record<ArchiveFieldType, string> = {
  text: '文字',
  'single-select': '单选',
  'multiple-select': '多选',
  date: '日期',
  number: '数字',
};

export const createArchiveField = (type: ArchiveFieldType = 'text', sectionId = ''): ArchiveField => ({
  id: `field-custom-${Date.now()}`,
  semanticKey: `custom-${Date.now()}`,
  label: archiveFieldDefaultLabels[type],
  type,
  sectionId,
  required: false,
  options: type === 'single-select' || type === 'multiple-select' ? ['选项1', '选项2'] : [],
  customAnswerOptions: [],
  settings: {},
});
