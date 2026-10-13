/**
 * 教师评价（教师手机端）成长记录模型。
 *
 * 维度口径沿用《教师发展评价》方案的六大维度；类别是教师实际能填报的事项类型，
 * 每条记录落在唯一类别上，由类别决定归属维度，避免同一件事在不同页面归到不同维度。
 */

export const TEACHER_EVAL_DIMENSIONS = [
  '师德与育人',
  '教育教学能力',
  '教研与专业成长',
  '学生发展贡献',
  '组织协同与引领',
  '创新实践与数字素养',
] as const;

export type TeacherEvalDimension = typeof TEACHER_EVAL_DIMENSIONS[number];

export const GROWTH_RECORD_CATEGORIES = [
  '教学比赛',
  '教学成果与课程开发',
  '论文与著作',
  '课题研究',
  '培训进修',
  '荣誉表彰',
  '学生发展与辅导',
  '示范引领',
  '数字素养与创新实践',
] as const;

export type GrowthRecordCategory = typeof GROWTH_RECORD_CATEGORIES[number];

export interface GrowthCategoryDefinition {
  id: GrowthRecordCategory;
  dimension: TeacherEvalDimension;
  /** 选择类别时给老师的一句话提示，减少错填。 */
  hint: string;
}

export const GROWTH_CATEGORY_DEFINITIONS: GrowthCategoryDefinition[] = [
  { id: '教学比赛', dimension: '教育教学能力', hint: '赛课、优质课、技能大赛、教学能手等' },
  { id: '教学成果与课程开发', dimension: '教育教学能力', hint: '教学成果奖、校本课程、教材与课例开发' },
  { id: '论文与著作', dimension: '教研与专业成长', hint: '论文发表、论文评选、专著与编著' },
  { id: '课题研究', dimension: '教研与专业成长', hint: '课题立项与结题、教改项目' },
  { id: '培训进修', dimension: '教研与专业成长', hint: '研修班、专项培训、继续教育' },
  { id: '荣誉表彰', dimension: '师德与育人', hint: '优秀教师、优秀班主任、师德标兵等综合表彰' },
  { id: '学生发展与辅导', dimension: '学生发展贡献', hint: '指导学生获奖、社团与竞赛辅导' },
  { id: '示范引领', dimension: '组织协同与引领', hint: '公开课、讲座、送教、带教与教研组织' },
  { id: '数字素养与创新实践', dimension: '创新实践与数字素养', hint: '数字资源、自制教具、信息化课例' },
];

export const GROWTH_RECORD_LEVELS = ['国家级', '省级', '市级', '区县级', '校级'] as const;
export type GrowthRecordLevel = typeof GROWTH_RECORD_LEVELS[number];

export const GROWTH_RECORD_RANKS = ['一等奖', '二等奖', '三等奖', '参与'] as const;
export type GrowthRecordRank = typeof GROWTH_RECORD_RANKS[number];

/** 「参与」承接没有等次的凭证，例如培训结业、承担公开课。 */
export const GROWTH_RECORD_RANK_HINTS: Record<GrowthRecordRank, string> = {
  一等奖: '含特等奖、第一名、优秀学员',
  二等奖: '含第二名、亚军',
  三等奖: '含第三名、季军',
  参与: '含结业、承担、无等次',
};

export type GrowthRecordSource = 'voice' | 'photo' | 'manual';

export const GROWTH_REVIEW_STATUSES = ['待审核', '已通过', '未通过'] as const;
export type GrowthReviewStatus = typeof GROWTH_REVIEW_STATUSES[number];

export interface GrowthRecord {
  id: string;
  /** 事项名称，例如“四川省高中语文优质课展评” */
  title: string;
  category: GrowthRecordCategory;
  dimension: TeacherEvalDimension;
  level: GrowthRecordLevel;
  rank: GrowthRecordRank;
  /** 颁发（主办）单位，认定以证书落款单位为准 */
  issuer: string;
  /** 证书落款日期，YYYY-MM-DD */
  issuedAt: string;
  points: number;
  source: GrowthRecordSource;
  /** 原始记录文本：语音转写或手动输入的一手描述，作为过程性证据留在记录卡上 */
  inputText?: string;
  /** 语音记录时长（秒），用于原始语音胶囊 */
  voiceSeconds?: number;
  /** 证明材料（证书照片）地址；语音填报的记录可能没有 */
  evidenceImage?: string;
  evidenceLabel?: string;
  reviewStatus: GrowthReviewStatus;
  /** 审核未通过时的原因说明 */
  reviewNote?: string;
}

export const getCategoryDefinition = (category: GrowthRecordCategory): GrowthCategoryDefinition => (
  GROWTH_CATEGORY_DEFINITIONS.find(definition => definition.id === category)
  ?? GROWTH_CATEGORY_DEFINITIONS[0]
);

export const GROWTH_RECORD_SOURCE_LABELS: Record<GrowthRecordSource, string> = {
  voice: '语音填报',
  photo: '拍照识别',
  manual: '手动填报',
};

/** 档案页筛选分组：按老师找材料时的叫法归组，不用六大维度这类评价术语。 */
export const ARCHIVE_FILTER_GROUPS: Array<{ id: string; label: string; categories: GrowthRecordCategory[] }> = [
  { id: 'all', label: '全部', categories: [...GROWTH_RECORD_CATEGORIES] },
  { id: 'honor', label: '荣誉表彰', categories: ['荣誉表彰'] },
  { id: 'teaching', label: '教学比赛', categories: ['教学比赛', '教学成果与课程开发'] },
  { id: 'research', label: '论文课题', categories: ['论文与著作', '课题研究'] },
  { id: 'training', label: '培训进修', categories: ['培训进修'] },
  { id: 'student', label: '学生发展', categories: ['学生发展与辅导'] },
  { id: 'leading', label: '示范引领', categories: ['示范引领'] },
  { id: 'digital', label: '数字素养', categories: ['数字素养与创新实践'] },
];
