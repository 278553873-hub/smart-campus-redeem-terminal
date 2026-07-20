import type { ClassInfo, Student } from '../mobile-app/types';

export type ArchiveStage = 'entry' | 'term' | 'transition';
export type ArchiveTemplateStatus = 'recommended' | 'draft' | 'published' | 'disabled';
export type ArchiveSource = 'homeroom' | 'guardian' | 'student' | 'records';
export type ArchiveFieldType = 'short-text' | 'long-text' | 'single-select' | 'multiple-select';
export type ArchiveProgressStatus = 'draft' | 'pending' | 'archived';

export interface ArchiveSection {
  id: string;
  label: string;
  description?: string;
}

export interface ArchiveField {
  id: string;
  semanticKey: string;
  label: string;
  type: ArchiveFieldType;
  group: 'core' | 'stage';
  sectionId: string;
  required: boolean;
  options: string[];
}

export interface ArchiveTemplate {
  id: string;
  spaceId: string;
  name: string;
  origin: 'recommended' | 'school';
  status: ArchiveTemplateStatus;
  version: number;
  stage: ArchiveStage;
  gradeScopes: string[];
  sources: ArchiveSource[];
  sections: ArchiveSection[];
  fields: ArchiveField[];
  updatedAt: string;
}

export interface ArchiveSourceProgress {
  source: ArchiveSource;
  status: 'waiting' | 'received' | 'not-required';
  updatedAt?: string;
}

export interface ArchiveStudentProgress {
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  status: ArchiveProgressStatus;
  answers: Record<string, string>;
  sourceProgress: ArchiveSourceProgress[];
  updatedAt: string;
}

export interface ArchiveClassAssignment {
  classId: string;
  className: string;
  assigneeType: 'homeroom' | 'designated';
  assigneeName?: string;
  assigneeRole: '班主任' | '指定任课教师';
}

export interface ArchiveReminderPolicy {
  notifyOnCreate: boolean;
  beforeDeadlineDays: number[];
  repeatWhenOverdue: boolean;
}

export interface ArchiveTask {
  id: string;
  spaceId: string;
  name: string;
  templateId: string;
  templateName: string;
  templateVersion: number;
  stage: ArchiveStage;
  schoolTerm: string;
  gradeScope: string;
  classIds: string[];
  classAssignments: ArchiveClassAssignment[];
  reminderPolicy: ArchiveReminderPolicy;
  createdBy: string;
  deadline: string;
  status: 'active' | 'completed';
  createdAt: string;
  progress: ArchiveStudentProgress[];
}

export interface ArchiveSourceRecord {
  source: ArchiveSource;
  title: string;
  provider: string;
  submittedAt: string;
  status: '已入档' | '待补充';
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
  stage: ArchiveStage;
  period: string;
  status: 'archived' | 'revision-draft';
  createdAt: string;
  createdBy: string;
  answers: Record<string, string>;
  sourceRecords: ArchiveSourceRecord[];
  revisionOf?: string;
  correctionReason?: string;
}

export interface StudentBaseArchive {
  studentId: string;
  healthNotes: string;
  allergyHistory: string;
  guardianSummary: string;
  classHistory: string[];
  updatedAt: string;
}

export interface ArchiveAuditEvent {
  id: string;
  studentId: string;
  action: '查看档案' | '确认成档' | '申请更正' | '更新底档';
  operator: string;
  operatorRole: string;
  occurredAt: string;
  detail: string;
}

export interface ArchiveWorkspace {
  schemaVersion: 2;
  spaceId: string;
  templates: ArchiveTemplate[];
  tasks: ArchiveTask[];
  snapshots: ArchiveSnapshot[];
  baseArchives: StudentBaseArchive[];
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

export const archiveStageMeta: Record<ArchiveStage, { label: string; shortLabel: string }> = {
  entry: { label: '入学基线档案', shortLabel: '入学' },
  term: { label: '学期成长档案', shortLabel: '学期' },
  transition: { label: '转衔成长档案', shortLabel: '转衔' },
};

export const archiveSourceMeta: Record<ArchiveSource, { label: string; shortLabel: string }> = {
  homeroom: { label: '班主任观察', shortLabel: '班主任' },
  guardian: { label: '家长问卷', shortLabel: '家长' },
  student: { label: '学生自评', shortLabel: '学生' },
  records: { label: '日常评价数据', shortLabel: '记录' },
};

const field = (
  semanticKey: string,
  label: string,
  type: ArchiveFieldType,
  group: ArchiveField['group'],
  sectionId: string,
  required = true,
  options: string[] = [],
): ArchiveField => ({
  id: `field-${semanticKey}`,
  semanticKey,
  label,
  type,
  group,
  sectionId,
  required,
  options,
});

const section = (id: string, label: string, description?: string): ArchiveSection => ({ id, label, description });

const summarySection = section('summary', '教师交接摘要', '帮助后续教师快速了解学生');

const coreFields: ArchiveField[] = [
  field('strengths', '优势特点', 'long-text', 'core', 'summary'),
  field('interests', '兴趣倾向', 'multiple-select', 'core', 'summary', true, ['阅读表达', '科学探究', '艺术创作', '体育运动', '劳动实践', '同伴交往']),
  field('learning-habits', '学习习惯', 'single-select', 'core', 'summary', true, ['需要持续支持', '逐步稳定', '表现稳定', '能主动规划']),
  field('emotion-state', '情绪状态', 'single-select', 'core', 'summary', true, ['需要陪伴调节', '提醒后可调节', '基本稳定', '能主动调节']),
  field('peer-relations', '同伴交往', 'single-select', 'core', 'summary', true, ['较少参与', '被动加入', '主动合作', '能支持同伴']),
  field('current-focus', '当前关注', 'long-text', 'core', 'summary'),
  field('support-strategy', '有效支持方式', 'long-text', 'core', 'summary'),
  field('stage-goal', '阶段目标', 'long-text', 'core', 'summary'),
];

const entryFields: ArchiveField[] = [
  field('foundation-cognition', '基础认知', 'single-select', 'core', 'academic', true, ['零基础', '启蒙阶段', '有基础']),
  field('focus-habit', '专注习惯', 'single-select', 'core', 'academic', true, ['少于10分钟', '10-20分钟', '20分钟以上']),
  field('question-task', '提问与任务', 'single-select', 'core', 'academic', true, ['主动提问并独立完成', '有时需要鼓励', '较少提问且依赖帮助']),
  field('interest-tendency', '兴趣倾向', 'multiple-select', 'core', 'interest', true, ['阅读', '艺术', '运动', '探究', '社交']),
  field('hands-on-creativity', '动手创意', 'single-select', 'stage', 'interest', true, ['很喜欢', '一般', '不太喜欢']),
  field('learning-style', '学习方式', 'multiple-select', 'core', 'cognition', true, ['听讲型', '动手型', '讨论型', '视觉型']),
  field('problem-solving', '问题解决', 'single-select', 'core', 'cognition', true, ['自己尝试', '主动求助', '容易放弃']),
  field('help-sharing', '帮助分享', 'single-select', 'core', 'social', true, ['经常主动', '有时', '较少']),
  field('rules-manners', '规则礼貌', 'single-select', 'core', 'social', true, ['自觉', '需要提醒', '较弱']),
  field('conflict-handling', '冲突处理', 'single-select', 'core', 'social', true, ['能够商量', '哭闹或退缩', '容易争抢']),
  field('emotion-stability', '情绪稳定性', 'single-select', 'core', 'personality-family', true, ['快速平复', '需要安慰', '持续较久']),
  field('exercise-vitality', '运动活力', 'single-select', 'stage', 'personality-family', true, ['热爱', '一般', '不爱运动']),
  field('primary-caregiver', '主要照顾人', 'single-select', 'stage', 'personality-family', true, ['父母', '祖辈', '其他']),
  field('family-time', '家庭陪伴时间', 'single-select', 'stage', 'personality-family', true, ['少于30分钟', '30分钟-1小时', '1-2小时', '2小时以上']),
  field('guardian-goal', '家长期望', 'multiple-select', 'stage', 'development-goals', true, ['求真', '从善', '尚美', '学活', '乐健', '悦群']),
  field('student-goal', '学生自选', 'multiple-select', 'stage', 'development-goals', true, ['求真', '从善', '尚美', '学活', '乐健', '悦群']),
  field('teacher-goal', '教师建议', 'multiple-select', 'stage', 'development-goals', true, ['求真', '从善', '尚美', '学活', '乐健', '悦群']),
  field('inner-drive-signal', '当前突出内驱力信号', 'single-select', 'core', 'inner-drive', true, ['兴趣激发', '胜任感', '归属感', '尚不明确']),
  field('initial-light', '初始光芒定位', 'multiple-select', 'core', 'inner-drive', true, ['求真', '从善', '尚美', '学活', '乐健', '悦群']),
  field('next-drive-focus', '下一阶段优先关注方向', 'multiple-select', 'core', 'inner-drive', true, ['继续观察兴趣火花', '积累“我能行”的成功体验', '建立信任的师生/同伴关系']),
  field('guardian-confirmation', '家长确认', 'single-select', 'stage', 'confirmation', false, ['已确认', '待确认', '无需确认']),
  field('strengths', '优势特点', 'long-text', 'core', 'summary'),
  field('current-focus', '当前关注', 'long-text', 'core', 'summary'),
  field('support-strategy', '有效支持方式', 'long-text', 'core', 'summary'),
  field('stage-goal', '阶段目标', 'long-text', 'core', 'summary'),
];

const termFields: ArchiveField[] = [
  field('term-change', '本学期变化', 'long-text', 'stage', 'term-growth'),
  field('representative-evidence', '代表性证据', 'long-text', 'stage', 'term-growth'),
  field('goal-progress', '目标达成情况', 'single-select', 'stage', 'term-growth', true, ['尚未显现', '开始进步', '基本达成', '超出预期']),
  field('new-strength', '新发现的优势', 'long-text', 'stage', 'term-growth', false),
  field('next-strategy', '下阶段策略', 'long-text', 'stage', 'term-growth'),
];

const transitionFields: ArchiveField[] = [
  field('long-term-summary', '长期成长概览', 'long-text', 'stage', 'transition-summary'),
  field('best-method', '最有效的教育方式', 'long-text', 'stage', 'transition-summary'),
  field('continued-support', '仍需支持事项', 'long-text', 'stage', 'transition-summary'),
  field('important-change', '重要变化', 'long-text', 'stage', 'transition-summary'),
  field('handoff-advice', '交接建议', 'long-text', 'stage', 'transition-summary'),
];

const cloneFields = (items: ArchiveField[]) => items.map(item => ({ ...item, options: [...item.options] }));
const cloneSections = (items: ArchiveSection[]) => items.map(item => ({ ...item }));

const entrySections: ArchiveSection[] = [
  section('academic', '学业基础'),
  section('interest', '兴趣偏好'),
  section('cognition', '认知特点'),
  section('social', '交往风格'),
  section('personality-family', '性格与家庭'),
  section('development-goals', '优先发展目标', '家长、学生与教师共同选择'),
  section('inner-drive', '内驱力特征', '关注兴趣激发、胜任感与归属感'),
  section('confirmation', '建档确认'),
  summarySection,
];

const termSections: ArchiveSection[] = [summarySection, section('term-growth', '本学期成长')];
const transitionSections: ArchiveSection[] = [summarySection, section('transition-summary', '转衔与交接')];

const createRecommendedTemplates = (spaceId: string): ArchiveTemplate[] => [
  {
    id: 'recommended-entry-v1',
    spaceId,
    name: '一年级初始成长档案',
    origin: 'recommended',
    status: 'recommended',
    version: 1,
    stage: 'entry',
    gradeScopes: ['一年级'],
    sources: ['homeroom', 'guardian', 'student', 'records'],
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
    stage: 'term',
    gradeScopes: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    sources: ['homeroom', 'guardian', 'student', 'records'],
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
    stage: 'transition',
    gradeScopes: ['六年级'],
    sources: ['homeroom', 'student', 'records'],
    sections: cloneSections(transitionSections),
    fields: cloneFields([...coreFields, ...transitionFields]),
    updatedAt: '2026-07-01',
  },
];

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

const makeSourceProgress = (sources: ArchiveSource[], index: number): ArchiveSourceProgress[] => (
  (Object.keys(archiveSourceMeta) as ArchiveSource[]).map(source => {
    if (!sources.includes(source)) return { source, status: 'not-required' };
    const received = source === 'homeroom' || source === 'records' || index % 4 !== 3;
    return { source, status: received ? 'received' : 'waiting', updatedAt: received ? '2026-07-10' : undefined };
  })
);

const createSeedWorkspace = ({ spaceId, teacherName, classes, homeroomClassIds, getStudentsForClass }: ArchiveWorkspaceContext): ArchiveWorkspace => {
  const recommended = createRecommendedTemplates(spaceId);
  const termRecommended = recommended.find(template => template.stage === 'term')!;
  const entryRecommended = recommended.find(template => template.stage === 'entry')!;
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
    sources: ['homeroom', 'guardian', 'student'],
    sections: cloneSections(entryRecommended.sections),
    fields: cloneFields(entryRecommended.fields),
  };

  const preferredClassId = homeroomClassIds.find(id => classes.some(item => item.id === id)) ?? classes[0]?.id ?? '';
  const preferredClass = classes.find(item => item.id === preferredClassId) ?? classes[0];
  const students = preferredClass ? getStudentsForClass(preferredClass.id).filter(student => student.status !== 'left').slice(0, 12) : [];
  const progress: ArchiveStudentProgress[] = students.map((student, index) => ({
    studentId: student.id,
    studentName: student.name,
    classId: preferredClass.id,
    className: preferredClass.name,
    status: index < 7 ? 'archived' : index < 9 ? 'pending' : 'draft',
    answers: index < 7 ? { ...termAnswerSeed } : index < 9 ? { ...termAnswerSeed, 'next-strategy': '' } : {},
    sourceProgress: makeSourceProgress(schoolTermTemplate.sources, index).map(item => index < 7 && item.status !== 'not-required' ? ({ ...item, status: 'received' as const, updatedAt: '2026-07-10' }) : item),
    updatedAt: index < 7 ? '2026-07-11' : index < 9 ? '2026-07-13' : '2026-07-09',
  }));

  const task: ArchiveTask = {
    id: 'task-2026-spring-term',
    spaceId,
    name: '2025-2026学年下学期成长档案',
    templateId: schoolTermTemplate.id,
    templateName: schoolTermTemplate.name,
    templateVersion: schoolTermTemplate.version,
    stage: 'term',
    schoolTerm: '2025-2026学年 下学期',
    gradeScope: preferredClass?.gradeLevel ?? '一年级',
    classIds: preferredClass ? [preferredClass.id] : [],
    classAssignments: preferredClass ? [{
      classId: preferredClass.id,
      className: preferredClass.name,
      assigneeType: 'homeroom',
      assigneeRole: '班主任',
    }] : [],
    reminderPolicy: {
      notifyOnCreate: true,
      beforeDeadlineDays: [3, 1],
      repeatWhenOverdue: true,
    },
    createdBy: '学校档案管理员',
    deadline: '2026-07-20',
    status: 'active',
    createdAt: '2026-07-08',
    progress,
  };

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
      stage: 'entry',
      period: '一年级入学第4周',
      status: 'archived',
      createdAt: '2025-09-28',
      createdBy: '张林老师',
      answers: { ...previousAnswerSeed },
      sourceRecords: [
        { source: 'guardian', title: '一年级学生家长问卷', provider: `${student.name}家长`, submittedAt: '2025-09-12', status: '已入档' },
        { source: 'student', title: '一年级学生访谈', provider: student.name, submittedAt: '2025-09-18', status: '已入档' },
        { source: 'homeroom', title: '入学第1-4周教师观察', provider: '张林老师', submittedAt: '2025-09-26', status: '已入档' },
      ],
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
      stage: 'term',
      period: '2025-2026学年 下学期',
      status: 'archived',
      createdAt: '2026-07-11',
      createdBy: teacherName,
      answers: { ...termAnswerSeed },
      sourceRecords: schoolTermTemplate.sources.map(source => ({
        source,
        title: archiveSourceMeta[source].label,
        provider: source === 'homeroom' ? teacherName : source === 'guardian' ? `${student.name}家长` : source === 'student' ? student.name : '系统汇总',
        submittedAt: '2026-07-10',
        status: '已入档' as const,
      })),
    };
    return [entry, term];
  });

  const baseArchives = students.map(student => ({
    studentId: student.id,
    healthNotes: '无特殊健康提醒',
    allergyHistory: '无已知过敏史',
    guardianSummary: student.guardianContacts?.map(item => `${item.relation} ${item.phone.slice(0, 3)}****${item.phone.slice(-4)}`).join('、') || '家长信息待完善',
    classHistory: [preferredClass.name],
    updatedAt: '2026-06-28',
  }));

  const firstStudent = students[0];
  const auditEvents: ArchiveAuditEvent[] = firstStudent ? [
    { id: 'audit-seed-1', studentId: firstStudent.id, action: '确认成档', operator: teacherName, operatorRole: '班主任', occurredAt: '2026-07-11 16:20', detail: '确认2025-2026学年下学期成长档案' },
    { id: 'audit-seed-2', studentId: firstStudent.id, action: '查看档案', operator: '周老师', operatorRole: '现任数学教师', occurredAt: '2026-07-14 09:15', detail: '查看最新成长档案' },
  ] : [];

  return {
    schemaVersion: 2,
    spaceId,
    templates: [...recommended, schoolTermTemplate, schoolEntryTemplate],
    tasks: [task],
    snapshots,
    baseArchives,
    auditEvents,
  };
};

export const readArchiveWorkspace = (context: ArchiveWorkspaceContext): ArchiveWorkspace => {
  const seed = createSeedWorkspace(context);
  if (typeof window === 'undefined') return seed;
  const stored = window.localStorage.getItem(getStorageKey(context.spaceId));
  if (!stored) return seed;
  try {
    const parsed = JSON.parse(stored) as Omit<ArchiveWorkspace, 'schemaVersion'> & { schemaVersion?: number };
    if (parsed.schemaVersion === 2) {
      return {
        ...parsed,
        tasks: parsed.tasks.map(task => ({
          ...task,
          classAssignments: task.classAssignments ?? task.classIds.map(classId => ({
            classId,
            className: context.classes.find(item => item.id === classId)?.name ?? classId,
            assigneeType: 'homeroom' as const,
            assigneeRole: '班主任' as const,
          })),
          reminderPolicy: task.reminderPolicy ?? {
            notifyOnCreate: true,
            beforeDeadlineDays: [3, 1],
            repeatWhenOverdue: true,
          },
          createdBy: task.createdBy ?? '学校档案管理员',
        })),
      };
    }
    if (parsed.schemaVersion !== 1) return seed;

    const recommended = createRecommendedTemplates(context.spaceId);
    const migratedTemplates = parsed.templates
      .filter(template => template.origin !== 'recommended')
      .map(template => {
        const legacyFields = template.fields as Array<ArchiveField & { sectionId?: string }>;
        const hasCore = legacyFields.some(item => item.group === 'core');
        const hasStage = legacyFields.some(item => item.group !== 'core');
        const sections = [
          ...(hasCore ? [section('legacy-core', '核心信息')] : []),
          ...(hasStage ? [section('legacy-stage', '阶段信息')] : []),
        ];
        return {
          ...template,
          sections,
          fields: legacyFields.map(item => ({
            ...item,
            sectionId: item.sectionId ?? (item.group === 'core' ? 'legacy-core' : 'legacy-stage'),
            options: [...item.options],
          })),
        };
      });
    return {
      ...parsed,
      schemaVersion: 2,
      templates: [...recommended, ...migratedTemplates],
      tasks: parsed.tasks.map(task => ({
        ...task,
        classAssignments: task.classIds.map(classId => ({
          classId,
          className: context.classes.find(item => item.id === classId)?.name ?? classId,
          assigneeType: 'homeroom' as const,
          assigneeRole: '班主任' as const,
        })),
        reminderPolicy: {
          notifyOnCreate: true,
          beforeDeadlineDays: [3, 1],
          repeatWhenOverdue: true,
        },
        createdBy: '学校档案管理员',
      })),
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
  const source = workspace.templates.find(template => template.id === templateId);
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
    sections: cloneSections(source.sections),
    fields: cloneFields(source.fields),
  };
  return { workspace: { ...workspace, templates: [...workspace.templates, copy] }, templateId: nextId };
};

export const saveArchiveTemplate = (workspace: ArchiveWorkspace, template: ArchiveTemplate): ArchiveWorkspace => ({
  ...workspace,
  templates: workspace.templates.map(item => item.id === template.id ? { ...template, updatedAt: isoDate() } : item),
});

export const createTemplateVersion = (workspace: ArchiveWorkspace, templateId: string): { workspace: ArchiveWorkspace; templateId: string } => {
  const source = workspace.templates.find(template => template.id === templateId);
  if (!source) return { workspace, templateId };
  const nextId = `${source.id}-v${source.version + 1}-${Date.now()}`;
  const copy: ArchiveTemplate = {
    ...source,
    id: nextId,
    status: 'draft',
    version: source.version + 1,
    updatedAt: isoDate(),
    sections: cloneSections(source.sections),
    fields: cloneFields(source.fields),
  };
  return { workspace: { ...workspace, templates: [...workspace.templates, copy] }, templateId: nextId };
};

export const createArchiveTask = (
  workspace: ArchiveWorkspace,
  input: Omit<ArchiveTask, 'id' | 'spaceId' | 'createdAt' | 'status' | 'progress'>,
  classes: ClassInfo[],
  getStudentsForClass: (classId: string) => Student[],
): ArchiveWorkspace => {
  const template = workspace.templates.find(item => item.id === input.templateId);
  if (!template) return workspace;
  const progress = input.classIds.flatMap(classId => {
    const classInfo = classes.find(item => item.id === classId);
    if (!classInfo) return [];
    return getStudentsForClass(classId)
      .filter(student => student.status !== 'left')
      .map((student, index) => ({
        studentId: student.id,
        studentName: student.name,
        classId,
        className: classInfo.name,
        status: 'draft' as const,
        answers: {},
        sourceProgress: makeSourceProgress(template.sources, index + 3).map(item => item.source === 'homeroom' ? { ...item, status: 'waiting' as const, updatedAt: undefined } : item),
        updatedAt: isoDate(),
      }));
  });
  const task: ArchiveTask = {
    ...input,
    id: `archive-task-${Date.now()}`,
    spaceId: workspace.spaceId,
    createdAt: isoDate(),
    status: 'active',
    progress,
  };
  return { ...workspace, tasks: [task, ...workspace.tasks] };
};

export const saveStudentArchiveDraft = (
  workspace: ArchiveWorkspace,
  taskId: string,
  studentId: string,
  answers: Record<string, string>,
  submit: boolean,
  operator: string,
): ArchiveWorkspace => {
  const task = workspace.tasks.find(item => item.id === taskId);
  const progress = task?.progress.find(item => item.studentId === studentId);
  const template = task ? workspace.templates.find(item => item.id === task.templateId) : undefined;
  if (!task || !progress || !template) return workspace;
  const nextProgress: ArchiveStudentProgress = {
    ...progress,
    answers,
    status: submit ? 'archived' : 'pending',
    updatedAt: isoDate(),
    sourceProgress: progress.sourceProgress.map(item => item.source === 'homeroom' ? { ...item, status: 'received', updatedAt: isoDate() } : item),
  };
  const nextTasks = workspace.tasks.map(item => {
    if (item.id !== taskId) return item;
    const nextItems = item.progress.map(student => student.studentId === studentId ? nextProgress : student);
    return { ...item, progress: nextItems, status: nextItems.every(student => student.status === 'archived') ? 'completed' as const : item.status };
  });
  if (!submit) return { ...workspace, tasks: nextTasks };

  const snapshot: ArchiveSnapshot = {
    id: `snapshot-${studentId}-${Date.now()}`,
    studentId,
    studentName: progress.studentName,
    classId: progress.classId,
    className: progress.className,
    templateId: template.id,
    templateName: template.name,
    templateVersion: template.version,
    stage: task.stage,
    period: task.schoolTerm,
    status: 'archived',
    createdAt: isoDate(),
    createdBy: operator,
    answers,
    sourceRecords: nextProgress.sourceProgress
      .filter(item => item.status !== 'not-required')
      .map(item => ({
        source: item.source,
        title: archiveSourceMeta[item.source].label,
        provider: item.source === 'homeroom' ? operator : item.source === 'guardian' ? `${progress.studentName}家长` : item.source === 'student' ? progress.studentName : '系统汇总',
        submittedAt: item.updatedAt ?? isoDate(),
        status: item.status === 'received' ? '已入档' : '待补充',
      })),
  };
  const audit: ArchiveAuditEvent = {
    id: `audit-${Date.now()}`,
    studentId,
    action: '确认成档',
    operator,
    operatorRole: '班主任',
    occurredAt: timestampText(),
    detail: `确认${task.schoolTerm}${archiveStageMeta[task.stage].label}`,
  };
  return { ...workspace, tasks: nextTasks, snapshots: [...workspace.snapshots, snapshot], auditEvents: [audit, ...workspace.auditEvents] };
};

export const markArchiveSourceReceived = (
  workspace: ArchiveWorkspace,
  taskId: string,
  studentId: string,
  source: ArchiveSource,
): ArchiveWorkspace => ({
  ...workspace,
  tasks: workspace.tasks.map(task => task.id !== taskId ? task : ({
    ...task,
    progress: task.progress.map(student => student.studentId !== studentId ? student : ({
      ...student,
      sourceProgress: student.sourceProgress.map(item => item.source !== source ? item : ({
        ...item,
        status: 'received',
        updatedAt: isoDate(),
      })),
      updatedAt: isoDate(),
    })),
  })),
});

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
    answers: { ...source.answers },
    sourceRecords: source.sourceRecords.map(record => ({ ...record })),
  };
  const audit: ArchiveAuditEvent = {
    id: `audit-${Date.now()}`,
    studentId: source.studentId,
    action: '申请更正',
    operator,
    operatorRole: '班主任',
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

export const updateStudentBaseArchive = (
  workspace: ArchiveWorkspace,
  studentId: string,
  values: Pick<StudentBaseArchive, 'healthNotes' | 'allergyHistory' | 'guardianSummary'>,
  operator: string,
): ArchiveWorkspace => {
  const nextBaseArchives = workspace.baseArchives.map(item => item.studentId === studentId ? ({
    ...item,
    ...values,
    updatedAt: isoDate(),
  }) : item);
  const audit: ArchiveAuditEvent = {
    id: `audit-${Date.now()}`,
    studentId,
    action: '更新底档',
    operator,
    operatorRole: '班主任',
    occurredAt: timestampText(),
    detail: '更新健康提醒、过敏史或家庭联系人',
  };
  return { ...workspace, baseArchives: nextBaseArchives, auditEvents: [audit, ...workspace.auditEvents] };
};

export const getTaskCompletionRate = (task: ArchiveTask) => (
  task.progress.length === 0 ? 0 : Math.round(task.progress.filter(item => item.status === 'archived').length / task.progress.length * 100)
);

export const getPendingArchiveTasksForTeacher = (
  workspace: ArchiveWorkspace,
  teacherName: string,
  homeroomClassIds: string[],
) => workspace.tasks.filter(task => {
  if (task.status !== 'active') return false;
  const assignedClassIds = task.classAssignments
    .filter(assignment => (
      assignment.assigneeType === 'homeroom'
        ? homeroomClassIds.includes(assignment.classId)
        : assignment.assigneeName === teacherName
    ))
    .map(assignment => assignment.classId);
  return task.progress.some(item => assignedClassIds.includes(item.classId) && item.status !== 'archived');
});

export const createArchiveField = (sectionId = ''): ArchiveField => ({
  id: `field-custom-${Date.now()}`,
  semanticKey: `custom-${Date.now()}`,
  label: '新字段',
  type: 'short-text',
  group: 'stage',
  sectionId,
  required: false,
  options: [],
});
