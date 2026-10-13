/**
 * 教师评价 Demo 的 PRD 内容模型。
 *
 * 组件只负责渲染，内容全部收敛在这里，便于评审时改口径、也便于测试守住关键结论。
 */

export interface PrdRole {
  id: string;
  name: string;
  goal: string;
  abilities: string[];
}

export const PRD_ROLES: PrdRole[] = [
  {
    id: 'teacher',
    name: '教师（本人）',
    goal: '用最低成本记录成长证据，确认事实，并把反馈转成下一步行动',
    abilities: ['记录成果材料、过程事件与反思', '核对 AI 识别结果并补充必要字段', '查看证据、认定状态与成长反馈', '确认或调整个人发展目标'],
  },
  {
    id: 'school-admin',
    name: '学校管理员 / 信息中心',
    goal: '维护组织、账号、权限和数据基础，保障评价业务正常运行',
    abilities: ['维护教师、学科组和组织关系', '配置角色权限与评价范围', '维护数据字典和流程节点', '处理数据更正、导入和导出'],
  },
  {
    id: 'subject-leader',
    name: '学科组长 / 教研组长',
    goal: '提供贴近教学实践的同行核验与反馈',
    abilities: ['核对教学事件、本人角色和证据关联', '发起同行观察或教研反馈', '退回并说明可执行的补充要求', '查看本组发展主题与材料完整度'],
  },
  {
    id: 'academic-office',
    name: '教务处 / 教师发展中心',
    goal: '维护学校评价方案，完成认定、周期评价和发展支持',
    abilities: ['配置指标、证据要求、权重和认定权限', '组织材料审核、申诉与复核', '汇总教师档案和周期评价结果', '制定培训、教研和培养任务'],
  },
  {
    id: 'principal',
    name: '校长 / 分管副校长',
    goal: '把评价证据转成队伍建设和资源配置决策',
    abilities: ['查看学校、学科组和教师发展趋势', '关注证据覆盖与评价偏差', '确认重点培养对象与发展主题', '把结论转成培训、教研和岗位支持安排'],
  },
];

export type PrdStepKind = 'start' | 'normal' | 'decision' | 'end';

export interface PrdFlowStep {
  id: string;
  actor: string;
  title: string;
  detail?: string;
  kind?: PrdStepKind;
}

export interface PrdFlowBranch {
  id: string;
  label: string;
  steps: PrdFlowStep[];
}

export interface PrdFlow {
  id: string;
  title: string;
  goal: string;
  steps: PrdFlowStep[];
  branches?: PrdFlowBranch[];
}

export interface PrdSubmissionType {
  id: string;
  name: string;
  purpose: string;
  examples: string[];
  requiredEvidence: string;
  reviewOwner: string;
  scoring: string;
}

export const PRD_SUBMISSION_TYPES: PrdSubmissionType[] = [
  {
    id: 'achievement',
    name: '成果材料',
    purpose: '证明已经完成并可被学校认定的成果',
    examples: ['获奖证书', '论文与著作', '课题立项或结题', '课程、教材、资源包成果'],
    requiredEvidence: '证书、文件、成果附件、主办或认定单位',
    reviewOwner: '学科组长初核；教务处或教师发展中心认定',
    scoring: '可进入学校评价或积分规则，具体按学校方案执行',
  },
  {
    id: 'practice',
    name: '过程记录',
    purpose: '记录日常教学、教研、育人和协作行为，不要求已经形成奖项',
    examples: ['公开课或听评课', '送教、讲座、带教', '社团与学生辅导', '校本教研活动'],
    requiredEvidence: '活动通知、教案、签到、照片、学生作品或参与对象',
    reviewOwner: '学科组长或活动负责人核验',
    scoring: '默认沉淀为成长证据，是否计分由学校方案决定',
  },
  {
    id: 'reflection',
    name: '教学反思',
    purpose: '记录教师对课堂、学生发展或教研实践的观察和判断',
    examples: ['课堂复盘', '学生学习情况分析', '教学策略调整', '问题与改进记录'],
    requiredEvidence: '文字、语音或图片；需要时关联课程、班级或活动',
    reviewOwner: '教师本人提交；学科组可在教研对话中反馈',
    scoring: '不直接计分，用于形成发展反馈和后续行动',
  },
  {
    id: 'goal',
    name: '发展目标与行动',
    purpose: '把评价反馈转成下一周期可执行的个人发展计划',
    examples: ['本学期发展目标', '培训或教研计划', '课堂改进尝试', '需要学校提供的支持'],
    requiredEvidence: '目标、行动、完成时间、支持需求和复盘结果',
    reviewOwner: '教师提出；学科组长或教师发展中心共同确认',
    scoring: '不直接计分，用于周期跟踪和发展复盘',
  },
];

export interface PrdEvaluationDimension {
  id: string;
  name: string;
  evidenceSources: string[];
  participants: string[];
  evaluationMode: string;
}

/** 玉林方案提出的教师评价维度，数据既来自教师档案，也来自学校业务和管理评价。 */
export const PRD_EVALUATION_DIMENSIONS: PrdEvaluationDimension[] = [
  { id: 'ethics', name: '师德师风', evidenceSources: ['师德表现记录', '荣誉与失范行为', '民主评测'], participants: ['教师', '学科组长 / 教研组长', '教务处 / 教师发展中心'], evaluationMode: '日常记录与周期评价结合' },
  { id: 'professional', name: '专业能力', evidenceSources: ['教师基础档案', '培训进修', '专业发展计划', '同行评价'], participants: ['教师', '学科组长 / 教研组长', '教务处 / 教师发展中心'], evaluationMode: '材料审核、计划完成和发展评价' },
  { id: 'teaching', name: '教学能力', evidenceSources: ['教学计划与总结', '课堂观察', '教学成果', '学生发展数据'], participants: ['教师', '学科组长 / 教研组长', '教务处 / 教师发展中心'], evaluationMode: '同行观察、项目考核和周期评价' },
  { id: 'research', name: '教研能力', evidenceSources: ['校本教研过程', '课题申报、过程与结题', '论文与成果', '研修资料'], participants: ['教师', '学科组长 / 教研组长', '教务处 / 教师发展中心'], evaluationMode: '过程材料审核与成果认定' },
  { id: 'social', name: '社会影响', evidenceSources: ['示范引领', '公开课、讲座、送教', '荣誉表彰', '区域或学校贡献'], participants: ['教师', '学科组长 / 教研组长', '校长 / 分管副校长'], evaluationMode: '成果认定与管理评价结合' },
];

export const PRD_FLOWS: PrdFlow[] = [
  {
    id: 'standard-flow',
    title: '学校：先配置标准，再开始评价',
    goal: '先明确评价目标、证据要求和认定权限，避免把通用模板误当成学校规则',
    steps: [
      { id: 'c1', actor: '教务处 / 教师发展中心', title: '确定评价目标', detail: '明确本周期关注的教学、教研、育人或发展主题', kind: 'start' },
      { id: 'c2', actor: '教务处 / 教师发展中心', title: '配置指标与证据要求', detail: '设置指标、权重、周期、必填字段、证据类型与认定权限' },
      { id: 'c3', actor: '教务处 / 教师发展中心', title: '发布评价周期', detail: '指定适用教师、时间范围、提交截止时间和反馈方式' },
      { id: 'c4', actor: '教务处 / 教师发展中心', title: '说明采集与审核要求', detail: '向教师说明本周期要提交的内容、证据和处理方式' },
      { id: 'c5', actor: '校长 / 分管副校长', title: '确认重点方向', detail: '审阅周期目标和资源支持安排', kind: 'end' },
    ],
  },
  {
    id: 'teacher-flow',
    title: '教师：从成长事件到可用证据',
    goal: '教师负责描述事实和确认内容，学校负责登记、核验与归档',
    steps: [
      { id: 't1', actor: '教师', title: '记录事件或上传材料', detail: '口述、拍照、文本填写，也可以记录无积分的教学反思或过程事件', kind: 'start' },
      { id: 't2', actor: '教师', title: '整理为待确认记录', detail: '补充事实、时间、对象、本人角色、证据和关联指标' },
      { id: 't3', actor: '教师', title: '补充与确认', detail: '修正事实，补齐必要字段，确认是否提交认定' },
      { id: 't4', actor: '学校管理员 / 信息中心', title: '登记并归档材料', detail: '按教师、周期和指标归档，保留修改记录' },
      { id: 't5', actor: '教师', title: '查看处理状态', detail: '区分草稿、待核验、待认定、已确认和需补充', kind: 'end' },
    ],
    branches: [
      { id: 'insufficient', label: '信息或证据不足', steps: [{ id: 't6', actor: '教师', title: '保存草稿并稍后补充', detail: '不强迫用级别、等次填满空字段' }] },
      { id: 'submit', label: '提交认定', steps: [{ id: 't7', actor: '教务处 / 教师发展中心', title: '分派核验任务', detail: '按照学校安排分派给学科组或指定审核人', kind: 'end' }] },
    ],
  },
  {
    id: 'assessment-flow',
    title: '管理人员：发起一次教师考核',
    goal: '管理人员可以发起考核任务、组织评价并确认结果，教师提交只是其中一个数据来源',
    steps: [
      { id: 'a1', actor: '教务处 / 教师发展中心', title: '创建考核项目', detail: '选择评价维度、对象范围、考核周期、指标、权重和评分标准', kind: 'start' },
      { id: 'a2', actor: '教务处 / 教师发展中心', title: '配置参与方式', detail: '确定教师自评、学科组评价、民主评测、材料申报或数据导入' },
      { id: 'a3', actor: '学校管理员 / 信息中心', title: '发布任务并分派人员', detail: '把任务发送给教师、评委、学科组和相关管理人员' },
      { id: 'a4', actor: '教师 / 学科组长 / 教务处', title: '分别提交评价数据', detail: '教师补充材料和自评；学科组提交观察与核验；管理人员提交评分、评语或审核结果' },
      { id: 'a5', actor: '教务处 / 教师发展中心', title: '汇总并复核', detail: '检查数据完整性，处理异常、重复、冲突和申诉', kind: 'decision' },
      { id: 'a6', actor: '教务处 / 教师发展中心', title: '确认考核结果', detail: '形成个人结果、评价依据和后续发展建议', kind: 'end' },
    ],
    branches: [
      { id: 'a-return', label: '数据不完整或有异议', steps: [{ id: 'a7', actor: '教务处 / 教师发展中心', title: '退回补充或发起复核', detail: '明确责任人、补充内容和截止时间' }, { id: 'a8', actor: '教师 / 学科组长', title: '补交材料或提交说明', detail: '回到本次考核任务继续处理', kind: 'end' }] },
      { id: 'a-pass', label: '结果确认', steps: [{ id: 'a9', actor: '校长 / 分管副校长', title: '审阅重点结果', detail: '确认培养对象、资源支持或管理动作', kind: 'end' }] },
    ],
  },
  {
    id: 'review-flow',
    title: '核验与认定：证据先于分数',
    goal: '同行核验教学事实，管理者依据学校标准作出认定',
    steps: [
      { id: 'r1', actor: '学校管理员 / 信息中心', title: '检查材料完整性', detail: '检查必填项、材料是否齐全和是否存在重复提交' },
      { id: 'r2', actor: '学科组长 / 教研组长', title: '核验教学事实', detail: '确认活动是否发生、本人角色、教学影响和证据关联' },
      { id: 'r3', actor: '教务处 / 教师发展中心', title: '按学校标准认定', detail: '确认指标、权重、是否计分和正式状态', kind: 'decision' },
      { id: 'r4', actor: '学校管理员 / 信息中心', title: '归档认定结果', detail: '记录认定结果、依据、审核人、时间和版本', kind: 'end' },
    ],
    branches: [
      { id: 'approved', label: '通过', steps: [{ id: 'r8', actor: '学校管理员 / 信息中心', title: '确认入档并汇总', detail: '写入正式档案，结果和依据可追溯', kind: 'end' }] },
      { id: 'return', label: '不通过', steps: [{ id: 'r5', actor: '审核人', title: '退回并说明原因', detail: '明确缺什么、补什么、由谁补' }, { id: 'r6', actor: '教师', title: '补充后重新提交', detail: '保留原版本与修改记录', kind: 'end' }] },
      { id: 'appeal', label: '教师有异议', steps: [{ id: 'r7', actor: '教师', title: '发起申诉或复核', detail: '提交补充证据，由指定复核人处理', kind: 'end' }] },
    ],
  },
  {
    id: 'feedback-flow',
    title: '发展反馈：从认定结果回到行动',
    goal: '评价的终点不是分数，而是教师下一步可执行的发展行动',
    steps: [
      { id: 'f1', actor: '教务处 / 教师发展中心', title: '汇总已确认证据', detail: '按周期、指标、证据类型和教师目标组织材料' },
      { id: 'f2', actor: '教师', title: '查看个人反馈', detail: '看到事实依据、优势、待补证据和发展建议' },
      { id: 'f3', actor: '学科组长 / 教研组长', title: '开展反馈或教研对话', detail: '围绕课堂、教研或育人证据共同确定改进方向' },
      { id: 'f4', actor: '教师', title: '确认发展行动', detail: '形成目标、行动、支持需求和完成时间', kind: 'decision' },
      { id: 'f5', actor: '教务处 / 教师发展中心', title: '跟踪与复盘', detail: '在下一周期回看行动完成和证据变化', kind: 'end' },
    ],
    branches: [
      { id: 'support', label: '需要学校支持', steps: [{ id: 'f6', actor: '校长 / 分管副校长', title: '配置培训或资源', detail: '把发展主题转成学校支持安排', kind: 'end' }] },
      { id: 'next-cycle', label: '进入下一周期', steps: [{ id: 'f7', actor: '学校管理员 / 信息中心', title: '形成连续成长记录', detail: '关联上一周期目标与新证据，支持后续查看', kind: 'end' }] },
    ],
  },
  {
    id: 'decision-flow',
    title: '管理决策：从数据使用到改进',
    goal: '管理者看结构和变化，用于培养与资源配置，不用单一总分给教师贴标签',
    steps: [
      { id: 'd1', actor: '教务处 / 教师发展中心', title: '汇总评价结果', detail: '整理证据覆盖、发展主题、认定结果和周期变化' },
      { id: 'd2', actor: '校长 / 分管副校长', title: '查看学校与学科组趋势', detail: '结合学科、岗位和发展阶段比较，关注数据缺口' },
      { id: 'd3', actor: '校长 / 分管副校长', title: '确定培养与资源动作', detail: '安排培训、教研、导师支持或项目机会' },
      { id: 'd4', actor: '教务处 / 教师发展中心', title: '执行并记录结果', detail: '把管理动作回写到教师发展周期，形成闭环', kind: 'end' },
    ],
  },
];

export interface PrdDimension {
  id: string;
  name: string;
  value: string;
  categories: string[];
  fields: string[];
  evidence: string;
  scoring: string;
  owner: string;
}

/** 教师评价的六个价值维度：每个维度说明"为什么评、填什么、凭什么认定、谁来认定"。 */
export const PRD_DIMENSIONS: PrdDimension[] = [
  {
    id: 'virtue',
    name: '师德与育人',
    value: '师德师风是第一标准：师德表现作为业绩考核、评优奖励的首要要求',
    categories: ['荣誉表彰', '师德事件记录（只记录、不计分）'],
    fields: ['表彰名称', '认定单位', '级别', '等次', '认定日期'],
    evidence: '表彰文件或学校认定记录',
    scoring: '综合表彰按级别与等次计分；师德事件单独记录不参与积分',
    owner: '师德考核小组 / 教务处',
  },
  {
    id: 'teaching',
    name: '教育教学能力',
    value: '突出教育教学实绩：课堂与教学质量是教师评价的核心依据',
    categories: ['教学比赛', '教学成果与课程开发'],
    fields: ['活动或成果名称', '主办单位', '级别', '等次', '落款日期', '本人角色'],
    evidence: '获奖证书、成果鉴定文件、课程与教材材料',
    scoring: '按级别 × 等次分档计分，同类别取最高一条',
    owner: '教务处',
  },
  {
    id: 'research',
    name: '教研与专业成长',
    value: '从结果性证书扩展到过程性成长：研修、论文与课题体现持续发展能力',
    categories: ['论文与著作', '课题研究', '培训进修'],
    fields: ['题名或项目名称', '刊物或立项单位', '级别', '本人角色（主持 / 参与）', '日期', '结题或结业状态'],
    evidence: '论文原件、立项与结题文件、结业证书',
    scoring: '课题通过结题按一等奖档、批准立项按三等奖档；成员按平均分计入；培训凭结业证书计分',
    owner: '教研部门',
  },
  {
    id: 'student',
    name: '学生发展贡献',
    value: '教师育人成效最终落在学生身上，对应增值评价的取向',
    categories: ['学生发展与辅导'],
    fields: ['竞赛或活动名称', '主办单位', '级别', '等次', '学生人数', '指导教师角色'],
    evidence: '获奖名单与证书',
    scoring: '以教育主管部门组织的竞赛为准，同类竞赛取最高一次',
    owner: '教务处',
  },
  {
    id: 'leading',
    name: '组织协同与引领',
    value: '从个人优秀到带动团队：公开课、讲座、送教、带教是教研共同体的贡献',
    categories: ['示范引领'],
    fields: ['活动名称', '形式（公开课 / 讲座 / 送教 / 带教）', '对象与人数', '级别', '日期'],
    evidence: '活动通知、签到表、聘书',
    scoring: '同一次活动只计一次；跨年重复举办的活动按学年分别计入',
    owner: '教研部门',
  },
  {
    id: 'innovation',
    name: '创新实践与数字素养',
    value: '面向未来的教师能力：数字化教学与创新实践的产出',
    categories: ['数字素养与创新实践'],
    fields: ['成果名称', '形式（资源包 / 自制教具 / 信息化课例）', '应用范围', '级别', '等次'],
    evidence: '作品文件与评比结果',
    scoring: '按级别与等次计分',
    owner: '信息中心 / 教研部门',
  },
];

export interface PrdRecordField {
  name: string;
  type: string;
  required: string;
  source: string;
  note: string;
}

/** 一条成长记录的字段模型：AI 能填的都让 AI 填，老师只补必须本人判断的部分。 */
export const PRD_RECORD_FIELDS: PrdRecordField[] = [
  { name: '事项名称', type: '文本', required: '必填', source: 'AI 识别 / 手填', note: '例如"四川省高中语文优质课展评"' },
  { name: '归属维度', type: '枚举（六维之一）', required: '必填', source: '系统按类别推导', note: '老师不选维度，避免同一件事归到不同维度' },
  { name: '归属类别', type: '枚举（九类）', required: '必填', source: 'AI 推荐 / 手选', note: '维度由类别决定' },
  { name: '级别', type: '枚举（国家 / 省 / 市 / 区县 / 校）', required: '必填', source: 'AI 识别', note: '决定分档' },
  { name: '等次', type: '枚举（一等 / 二等 / 三等 / 参与）', required: '必填', source: 'AI 识别', note: '无等次的凭证按"参与"计' },
  { name: '颁发（主办）单位', type: '文本', required: '必填', source: 'AI 识别', note: '须为教育行政部门或其直属单位' },
  { name: '落款日期', type: '日期', required: '必填', source: 'AI 识别', note: '以证书落款为准，决定归属学年' },
  { name: '本人角色', type: '枚举（主持 / 参与 / 指导教师）', required: '条件必填', source: '手填', note: '课题与团队成果用于分摊分值' },
  { name: '原始输入', type: '图片 / 语音 / 文本', required: '必填（三选一）', source: '录入方式决定', note: '过程性证据，语音保留原始录音与转写' },
  { name: '加分分值', type: '数值', required: '系统生成', source: '赋分表', note: '老师不可改，只显示计算依据' },
  { name: '审核状态', type: '枚举（待审核 / 已通过 / 未通过）', required: '系统生成', source: '审核流程', note: '待审核已计入积分但会标注' },
  { name: '审核意见', type: '文本', required: '未通过必填', source: '审核人', note: '直接展示给教师，指导补充材料' },
  { name: '学年学期', type: '文本', required: '系统生成', source: '按落款日期推导', note: '积分统计的周期口径' },
];

export interface PrdRule {
  id: string;
  title: string;
  detail: string;
}

export const PRD_RULES: PrdRule[] = [
  { id: 'highest', title: '同类取最高', detail: '同一类别在同一学年只计入分值最高的一条记录，避免同类材料反复累计。' },
  { id: 'cap', title: '学年合计封顶', detail: '每学年成长积分合计不超过 30 分，防止用数量堆分。' },
  { id: 'evidence', title: '以证书认定', detail: '以证书上的颁发单位与落款时间为准，主办方须为教育行政部门或其直属单位。' },
  { id: 'virtue-first', title: '师德第一标准', detail: '师德表现单独记录、单独评议，不参与积分累加。' },
  { id: 'process', title: '过程与结果并重', detail: '除了获奖证书，公开课、送教、培训、带教等过程性材料同样计入对应维度。' },
  { id: 'no-performance', title: '不直接绑定绩效', detail: '客户端只呈现成长档案与发展性评价，是否纳入绩效考核由学校端配置决定。' },
];


export interface PrdSource {
  id: string;
  title: string;
  detail: string;
}

/** 建模依据：口径不靠感觉，来自政策文件与公开的学校赋分办法。 */
export const PRD_SOURCES: PrdSource[] = [
  {
    id: 'oecd-talis',
    title: 'OECD TALIS：教师专业学习与反馈研究',
    detail: '公开研究持续强调教师反馈、协作学习和专业发展机会的关联。流程设计因此保留教师自我反思、同行反馈与周期复盘，而不是只收集结果材料。参考：https://www.oecd.org/education/school/talis/。',
  },
  {
    id: 'coaching-meta-analysis',
    title: 'Kraft、Blazar、Hogan（2018）教师指导元分析',
    detail: '对 60 项因果研究的元分析显示，教师指导对教学实践和学生成绩有积极影响，但规模化时需要稳定的反馈与实施机制。流程因此增加教研对话、发展行动和下一周期复盘。DOI：https://doi.org/10.3102/0034654318759268。',
  },
  {
    id: 'edthena',
    title: 'Edthena 教师专业学习产品公开方案',
    detail: '成熟产品将自我观察、目标设定、行动计划、同行协作和基于课堂证据的反馈串成连续 coaching cycle（指导循环），而不是一次性提交表单。参考：https://www.edthena.com/。',
  },
  {
    id: 'policy',
    title: '中共中央、国务院《深化新时代教育评价改革总体方案》（2020）',
    detail: '改进结果评价、强化过程评价、探索增值评价、健全综合评价；坚持把师德师风作为第一标准，突出教育教学实绩。',
  },
  {
    id: 'lanling',
    title: '兰陵县思源实验学校教师专业发展赋分办法（县政府公开）',
    detail: '按「级别 × 等次」分档赋分；同类奖项依最高级别计分，各项合计封顶；以证书颁发单位和落款时间为准，按学年度两学期统计。',
  },
  {
    id: 'yunhe',
    title: '云和县教育局《关于实行积分制管理促进教师发展的实施意见（试行）》（2020）',
    detail: '建立县、校级赋分项目库，每学年初可按重点工作调整赋分项目。',
  },
  {
    id: 'shuhe',
    title: '临沂沭河学校教师专业发展评价办法',
    detail: '单项设置累计上限，避免同类材料重复刷分。',
  },
];
