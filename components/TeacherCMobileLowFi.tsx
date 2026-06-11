import React, { useMemo, useRef, useState } from 'react';
import { ArrowLeft, BarChart3, Camera, ChevronRight, Copy, Edit3, FileText, Gift, ImagePlus, LogIn, MessageCircle, Mic, MoreHorizontal, Plus, ScanFace, Shield, Trash2, Type, UserPlus, Users, Sparkles } from 'lucide-react';
import PhoneMockup from './PhoneMockup';

type PageKey =
  | 'login'
  | 'profile'
  | 'home'
  | 'classCreate'
  | 'classJoin'
  | 'studentAdd'
  | 'record'
  | 'textInput'
  | 'photoAward'
  | 'aiResult'
  | 'editResult'
  | 'classList'
  | 'studentList'
  | 'studentDetail'
  | 'classReport'
  | 'termReport'
  | 'mine'
  | 'profileEdit'
  | 'advisor';

type ViewState = 'normal' | 'loading' | 'empty' | 'network' | 'denied';
type RecordStage = 'idle' | 'recording' | 'transcribing' | 'identifying' | 'saved';
type Priority = 'P0' | 'P1' | 'P2' | 'P3';
type PhoneLoginTab = 'sms' | 'password';
type ClassActionKey = 'reward' | 'password' | 'face' | 'homework' | 'leftStudents' | 'inviteTeacher' | 'editClass';
type TeachingGrade = '2025级' | '2024级' | '2023级';
type WechatInviteMode = 'select' | 'confirm' | 'received';
type CEndSurface = 'summary' | 'teacher' | 'parent' | 'ops';

interface PageMeta {
  title: string;
  subtitle: string;
  modules: string[];
  ctas: Array<{ label: string; priority: Priority; position: string }>;
  states: Record<ViewState, string>;
}

type PrdBlock =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'list'; items: string[] };

const pageOrder: PageKey[] = [
  'login',
  'profile',
  'home',
  'classCreate',
  'classJoin',
  'studentAdd',
  'classList',
  'studentList',
  'mine',
  'profileEdit',
];

const flowLanes: Array<{ title: string; pages: PageKey[] }> = [
  { title: '首次进入', pages: ['login', 'profile', 'home'] },
  { title: '班级准备', pages: ['classCreate', 'classJoin'] },
  { title: '学生管理', pages: ['studentAdd', 'classList', 'studentList'] },
  { title: '我的', pages: ['mine', 'profileEdit'] },
];

type PathTarget =
  | { type: 'page'; page: PageKey }
  | { type: 'classInviteConfirm' }
  | { type: 'inviteWechat' }
  | { type: 'wechatChatConfirm' }
  | { type: 'wechatReceivedCard' };

const invitePathNodes: Array<{ label: string; desc: string; target: PathTarget }> = [
  { label: '收到卡片', desc: '微信聊天对话', target: { type: 'wechatReceivedCard' } },
  { label: '未登录打开', desc: '进入 01 注册登录', target: { type: 'page', page: 'login' } },
  { label: '已登录已加入', desc: '进入班级页', target: { type: 'page', page: 'classList' } },
  { label: '已登录未加入', desc: '班级页弹窗', target: { type: 'classInviteConfirm' } },
];

const surfaceTabs: Array<{ key: CEndSurface; label: string }> = [
  { key: 'summary', label: '改造点整理' },
  { key: 'teacher', label: '教师端' },
  { key: 'parent', label: '家长端' },
  { key: 'ops', label: '运营端' },
];

const summaryPrdBlocks: PrdBlock[] = [
  { type: 'h1', text: '改造点整理' },
  { type: 'p', text: '本整理基于真实项目 qixiao 代码现状，而不是只按理想产品形态推演。qixiao 当前后端、运营后台、教师小程序都明显以学校为业务上下文；个人版要落地，不能只在小程序加注册入口，需要同步改数据归属、接口上下文、运营线索和版本能力。' },
  { type: 'h2', text: 'qixiao 当前代码判断' },
  { type: 'list', items: [
    '后端 School 是事实上的核心租户：service/app/models/school.py 关联 teachers、classes、students、evaluation_records、evaluation_indicators、student_growth_reports、校园银行等大量模型。',
    'Teacher、Class、Student、EvaluationRecord、EvaluationIndicator、StudentGrowthReport 的 school_id 多数已 nullable，说明数据库层有承接个人版的可能，但业务层尚未形成“个人空间”概念。',
    '教师小程序登录后把 teacher_info.school.id 存为 schoolId，并在 ApiService 请求头里自动带 X-School-ID；个人老师没有学校时，这条链路会断。',
    '后端 deps.py 里 get_school_id() 对很多新增/编辑接口强制要求 X-School-ID，个人版调用这些接口会直接触发 MISSING_SCHOOL_ID。',
    '运营后台 web-admin/src/views/signing-center/school-management/index.vue 当前是学校列表入口，围绕新增学校、更换管理员、登录学校后台、学校配置、提示词管理、导出统计等动作展开，没有个人老师线索池。',
    'EvaluationIndicator 当前按 school_id 过滤；如果个人版直接不传 school_id，部分服务的“无 school_id 查询”可能变成不过滤学校，存在指标混用风险。',
  ] },
  { type: 'h2', text: '一、架构调整' },
  { type: 'h3', text: '1. 产品版本与空间模型' },
  { type: 'list', items: [
    '在 qixiao 现有 school_id 体系外新增 space 概念：space_type=school/personal，学校版空间绑定 school_id，个人版空间绑定 owner_teacher_id。',
    '短期也可以用最小改造：保留 nullable school_id，但给个人版新增 personal_space_id 或 owner_teacher_id，避免所有数据靠 school_id=null 混在一起。',
    'Class、Student、EvaluationRecord、EvaluationRecordGroup、StudentGrowthReport、StudentSemesterReport、EvaluationIndicator 都需要明确归属空间。',
    '学校名称在个人版中只能作为老师线索字段，不应该复用 schools 表创建“假学校”。',
  ] },
  { type: 'h3', text: '2. 账号与老师身份拆分' },
  { type: 'list', items: [
    'qixiao 当前 Teacher.phone 是唯一字段，个人版可以复用手机号作为账号入口，但不能把“手机号唯一”理解为“老师只能属于一个学校”。',
    '建议把登录账号和业务身份拆开：账号负责手机号/微信登录，TeacherProfile 或 TeacherSpaceRelation 负责个人空间、学校空间和班级协作关系。',
    '如果短期不拆账号表，至少需要支持同一 Teacher 同时存在个人空间和学校空间，并在登录后返回当前空间列表。',
    '教师小程序 completeLogin 当前默认保存 schoolId；个人版需要改为保存 currentSpace，而不是只保存 schoolId。',
  ] },
  { type: 'h3', text: '3. 班级与协作关系' },
  { type: 'list', items: [
    'qixiao Class.school_id 已 nullable，但 Student.class_id 非空；因此个人版仍然必须先有班级，学生必须挂到班级下。',
    '新增 class_code 作为 8 位数字全局唯一班级号；加入班级时通过 class_code 定位，不依赖 school_id。',
    '当前 Teacher.managed_classes、teaching_classes 是 JSON 字段，个人版协作可以先复用，但长期建议抽成 teacher_class_members 表，表达创建者、班主任、任教学科、加入状态。',
    '加入已有班级本质是新增老师与班级成员关系；不能复制班级、学生和评价记录。',
  ] },
  { type: 'h3', text: '4. 指标体系' },
  { type: 'list', items: [
    'qixiao EvaluationIndicator 当前有 school_id，并且唯一约束是 school_id + level_one + level_two + level_three。',
    '个人版不能简单用 school_id=null 查询指标，因为部分服务在未传 school_id 时可能不过滤学校，导致拿到多校指标。',
    '建议新增 indicator_package：personal_default 默认指标包、school_custom 学校指标包；AI 匹配时按 currentSpace 取指标包。',
    '短期可用固定 default_school_id 或 platform_default 标记承接默认指标，但必须明确禁止个人版编辑指标。',
  ] },
  { type: 'h3', text: '5. 运营后台改造' },
  { type: 'list', items: [
    'web-admin 当前“学校管理 / 学校列表”不能直接承接个人版，否则会把未开通学校的老师塞进学校表。',
    '新增“个人版线索”菜单：老师姓名、手机号、可选学校名称、注册时间、最近使用时间、班级数、学生数、AI 记录数、报告生成数。',
    '新增跟进状态：未跟进、已联系、有学校意向、已转学校版、无效线索；支持运营备注和下一次跟进时间。',
    '新增“转学校版”动作：选择已有学校或创建学校，再选择是否迁移个人空间下班级、学生、评价记录、报告。',
    '学校列表仍只展示正式学校，保持现有学校授权、学校配置、提示词、报告、校园银行等管理逻辑清晰。',
  ] },
  { type: 'h3', text: '6. 数据隔离与迁移' },
  { type: 'list', items: [
    '个人版数据不能进入现有学校统计、区域统计、校园银行和货柜机统计，除非明确完成转学校版迁移。',
    '迁移时需要把 personal_space_id 下的数据改挂到目标 school_id，并保留 source_space_id/source_type 追溯来源。',
    '迁移范围需要可选：只迁移老师线索、迁移班级学生、迁移评价记录、迁移报告。',
    '如果个人版班级已有协作老师，迁移时要确认这些老师是否同步加入学校空间。',
  ] },
  { type: 'h3', text: '7. 权限与接口范围' },
  { type: 'list', items: [
    '把 X-School-ID 升级为 X-Space-ID 或同时支持 X-School-ID + X-Space-Type，避免个人版接口没有学校 ID 就不可用。',
    'get_school_id() 依赖需要拆为 get_current_scope()：学校版返回 school scope，个人版返回 personal scope。',
    '查询类接口不能在没有 school_id 时默认查全量；必须按当前空间过滤。',
    '个人老师只能管理自己创建或加入的班级；学校管理员继续管理学校空间；运营后台只看线索和统计，敏感详情需要权限控制。',
  ] },
  { type: 'h3', text: '8. 版本能力开关' },
  { type: 'list', items: [
    '个人版关闭指标编辑、家长端、货柜机、学校组织管理、区域统计。',
    '学校版开启定制指标、全校师生批量导入、学校级报告、更多 AI 工具额度。',
    '前端页面展示、接口能力、菜单权限都应由版本能力开关控制，避免写死个人版/学校版判断。',
  ] },
  { type: 'h2', text: '二、端侧改造范围' },
  { type: 'list', items: [
    '教师端：新增个人老师注册登录、完善姓名、创建/加入班级、添加学生、完成首次 AI 记录的新手路径。',
    '家长端：个人版阶段不开放家长绑定；学校版开通后继续承接报告查看。',
    '运营端：新增个人老师线索池、使用行为分析、跟进状态、转学校版和数据迁移入口。',
    '学校 PC 端：学校版承接时需要能导入或接收个人版迁移数据。',
  ] },
];

const parentPrdBlocks: PrdBlock[] = [
  { type: 'h1', text: '家长端' },
  { type: 'p', text: '个人老师 C 端阶段不做家长端完整闭环，仅保留未来学校版数据互通后的查看入口规划。' },
  { type: 'h2', text: '功能清单' },
  { type: 'list', items: [
    '必须：展示孩子身份校验后的成长报告入口。',
    '必须：展示月度/期末报告查看状态。',
    '应该：支持报告分享和保存。',
    '不做：个人版老师自用阶段不开放家长绑定和家长互动。',
  ] },
  { type: 'h2', text: '页面状态' },
  { type: 'list', items: [
    '正常：展示孩子、班级、报告列表。',
    '空数据：未绑定孩子时提示等待学校开通。',
    '网络错误：保留当前页面并提供重试。',
    '权限拒绝：提示身份校验失败。',
  ] },
];

const opsPrdBlocks: PrdBlock[] = [
  { type: 'h1', text: '运营端' },
  { type: 'p', text: '用于承接 C 端老师线索和使用情况，帮助团队判断哪些学校值得跟进。' },
  { type: 'h2', text: '功能清单' },
  { type: 'list', items: [
    '必须：查看个人版老师列表、学校名称补充情况、最近使用时间。',
    '必须：查看老师创建/加入班级、学生数、AI 记录数、报告生成情况。',
    '应该：支持按学校、老师活跃度、报告生成情况筛选。',
    '不做：不在教师端强行展示推荐学校开通入口。',
  ] },
  { type: 'h2', text: '页面状态' },
  { type: 'list', items: [
    '正常：展示老师线索表和关键使用数据。',
    '空数据：暂无 C 端老师线索。',
    '加载：表格骨架屏。',
    '网络错误：表格区域展示重试。',
  ] },
];

const pageMeta: Record<PageKey, PageMeta> = {
  login: {
    title: '注册登录',
    subtitle: '从教师微信小程序进入，完成微信授权。',
    modules: ['顶部标题', '产品 icon', '欢迎文案', '微信授权登录', '手机号登录弹窗', '隐私协议勾选'],
    ctas: [
      { label: '微信授权登录', priority: 'P0', position: '页面底部主按钮' },
      { label: '手机号登录/注册', priority: 'P1', position: '页面底部次按钮' },
      { label: '隐私保护指引', priority: 'P2', position: '按钮下方勾选文案' },
    ],
    states: {
      normal: '展示微信授权登录和手机号登录/注册入口。',
      loading: '正在进入，主按钮禁用。',
      empty: '不适用。',
      network: '网络不可用，展示重试。',
      denied: '微信授权被拒绝，可改用手机号登录/注册。',
    },
  },
  profile: {
    title: '完善信息',
    subtitle: '首次体验只填写姓名。',
    modules: ['页面标题', '姓名输入框', '进入体验按钮'],
    ctas: [
      { label: '进入体验', priority: 'P0', position: '页面底部主按钮' },
    ],
    states: {
      normal: '只展示姓名字段，姓名必填。',
      loading: '保存中。',
      empty: '姓名为空时进入体验按钮不可用。',
      network: '保存失败，保留表单。',
      denied: '登录失效时返回注册登录页。',
    },
  },
  home: {
    title: '新手首页',
    subtitle: '先满足评价条件，再引导完成一次 AI 记录体验。',
    modules: ['记录标题', '老师称呼', '新手任务', '获得班级', '确认学生', '完成首次记录', '底部导航'],
    ctas: [
      { label: '创建班级', priority: 'P0', position: '新手任务第 1 步按钮块' },
      { label: '加入班级', priority: 'P0', position: '新手任务第 1 步按钮块' },
      { label: '去添加', priority: 'P0', position: '新手任务第 2 步' },
      { label: '去记录', priority: 'P0', position: '新手任务第 3 步' },
    ],
    states: {
      normal: '展示新手任务和已完成状态。',
      loading: '加载空间、班级、学生和记录状态。',
      empty: '按缺失项引导下一步。',
      network: '首页加载失败，展示重新加载。',
      denied: '登录失效，展示重新登录。',
    },
  },
  classCreate: {
    title: '创建班级',
    subtitle: '选择学段和入学年份，生成默认班级名称。',
    modules: ['学段选择', '入学年份选择', '班级数字输入', '默认班级名称', '自定义名称入口'],
    ctas: [
      { label: '保存并添加学生', priority: 'P0', position: '页面底部主按钮' },
      { label: '自定义名称', priority: 'P1', position: '班级名称输入框右侧' },
    ],
    states: {
      normal: '选择学段和入学年份后生成默认班级名称。',
      loading: '保存中。',
      empty: '班级名称或年级为空时提示。',
      network: '保存失败，保留表单。',
      denied: '登录失效，提示重新登录。',
    },
  },
  classJoin: {
    title: '加入班级',
    subtitle: '输入 8 位数字班级号加入已有班级。',
    modules: ['8 位数字班级号输入框', '加入班级按钮', '已有学生判断'],
    ctas: [
      { label: '加入班级', priority: 'P0', position: '页面底部主按钮' },
    ],
    states: {
      normal: '输入 8 位数字班级号后可加入已有班级。',
      loading: '加入中。',
      empty: '班级号不足 8 位时按钮不可用。',
      network: '加入失败，保留班级号。',
      denied: '登录失效，提示重新登录。',
    },
  },
  studentAdd: {
    title: '添加学生',
    subtitle: '手机端录入姓名、学号、性别。',
    modules: ['学生录入行', '姓名', '学号', '性别点选', '新增一行'],
    ctas: [
      { label: '完成', priority: 'P0', position: '页面底部主按钮' },
      { label: '添加一名', priority: 'P1', position: '录入表单下方' },
    ],
    states: {
      normal: '展示一行学生输入，性别默认男，可新增输入行。',
      loading: '保存或导入中。',
      empty: '无学生时引导添加第一名。',
      network: '保存失败，保留已输入内容。',
      denied: '无班级权限时返回首页。',
    },
  },
  record: {
    title: 'AI记录',
    subtitle: '语音/文字记录，拍照识别奖状。',
    modules: ['默认指标入口', 'AI说明入口', '记录流/空状态', '底部录入条：拍照/按住说话/文字', '语音识别进度浮层'],
    ctas: [
      { label: '按住说话', priority: 'P0', position: '底部悬浮录入条中间' },
      { label: '拍照', priority: 'P1', position: '悬浮录入条左侧' },
      { label: '文字', priority: 'P1', position: '悬浮录入条右侧' },
    ],
    states: {
      normal: '展示记录流和悬浮录入条。',
      loading: '记录流加载中。',
      empty: '提示试着说一句或输入一句。',
      network: '记录流加载失败，可重试。',
      denied: '麦克风/相机拒绝时提供文字替代。',
    },
  },
  textInput: {
    title: '文字记录',
    subtitle: '输入自然语言，一句话可提到多个学生。',
    modules: ['当前班级', '文本输入框', '示例短句', '提交识别'],
    ctas: [
      { label: '提交识别', priority: 'P0', position: '底部主按钮' },
    ],
    states: {
      normal: '展示输入框。',
      loading: '提交识别中。',
      empty: '文本为空时提示。',
      network: '识别失败，保留输入。',
      denied: '不适用。',
    },
  },
  photoAward: {
    title: '拍照识别奖状',
    subtitle: '只聚焦奖状识别。',
    modules: ['相机入口', '相册选择', '奖状预览', '提交识别'],
    ctas: [
      { label: '拍照识别', priority: 'P0', position: '底部主按钮' },
      { label: '从相册选择', priority: 'P1', position: '底部次按钮' },
    ],
    states: {
      normal: '拍摄或选择奖状。',
      loading: '奖状识别中。',
      empty: '未选择图片时不可提交。',
      network: '识别失败，可重试。',
      denied: '相机/相册拒绝时改用文字。',
    },
  },
  aiResult: {
    title: 'AI识别结果',
    subtitle: '识别完成即入库，编辑立即生效。',
    modules: ['原始语音/文字/图片', '语音转文字', '事件时间', '识别对象', '五育指标', '加分/减分', 'AI评语', '入库状态'],
    ctas: [
      { label: '继续记录', priority: 'P0', position: '底部主按钮' },
      { label: '编辑该条', priority: 'P1', position: '结果卡整体点击' },
      { label: '查看班级统计', priority: 'P1', position: '底部次按钮' },
    ],
    states: {
      normal: '展示已入库结果，可编辑。',
      loading: '转文字中/AI识别中/入库中。',
      empty: '未识别有效事件，允许手动补全。',
      network: '识别或入库失败，可重试。',
      denied: '语音/图片读取失败时返回输入方式。',
    },
  },
  editResult: {
    title: '编辑识别结果',
    subtitle: '字段修改后立即生效。',
    modules: ['事件时间', '识别对象', '五育指标', '加分/减分', 'AI评语', '同步状态'],
    ctas: [
      { label: '保存修改', priority: 'P0', position: '底部主按钮' },
    ],
    states: {
      normal: '展示可编辑字段。',
      loading: '保存中。',
      empty: '对象缺失时提示选择学生。',
      network: '保存失败，可重试；离线为待同步。',
      denied: '无权限编辑时只读展示。',
    },
  },
  classList: {
    title: '班级列表',
    subtitle: '查看个人体验空间内的班级。',
    modules: ['创建班级入口', '加入班级入口', '班级卡片', '班级名称', '推断年级', '任教标签', '8 位数字班级号', '班级人数'],
    ctas: [
      { label: '创建班级', priority: 'P0', position: '页面顶部按钮块' },
      { label: '加入班级', priority: 'P0', position: '页面顶部按钮块' },
      { label: '学生列表', priority: 'P1', position: '班级卡片底部' },
      { label: '班级报告', priority: 'P1', position: '班级卡片底部' },
    ],
    states: {
      normal: '展示班级列表。',
      loading: '班级加载中。',
      empty: '无班级时引导新建。',
      network: '加载失败，提供重试。',
      denied: '登录失效，提示重新登录。',
    },
  },
  studentList: {
    title: '学生列表',
    subtitle: '查看、搜索、筛选和新增学生。',
    modules: ['学生/分组切换标题', '搜索学生', '多选模式', '全选/取消全选', '男/女筛选', '一行 3 个学生卡片', '新增学生'],
    ctas: [
      { label: '新增学生', priority: 'P0', position: '搜索区下方' },
      { label: '多选', priority: 'P1', position: '搜索区右侧' },
      { label: '学生详情', priority: 'P1', position: '学生行点击' },
    ],
    states: {
      normal: '展示学生列表。',
      loading: '学生加载中。',
      empty: '无学生时引导新增学生。',
      network: '加载失败，保留重试。',
      denied: '无权限时返回班级页。',
    },
  },
  studentDetail: {
    title: '学生详情',
    subtitle: '查看学生基础信息、记录统计和日常行为。',
    modules: ['姓名', '学号', '性别', '所属班级', '记录统计', '日常行为记录流', '月度/期末报告入口'],
    ctas: [
      { label: '为该学生记录', priority: 'P0', position: '页面底部/顶部' },
      { label: '生成月度报告', priority: 'P1', position: '报告区' },
      { label: '编辑学生', priority: 'P2', position: '基础信息区' },
    ],
    states: {
      normal: '展示学生详情。',
      loading: '学生数据加载中。',
      empty: '无记录时引导为该学生记录。',
      network: '加载失败，提供重试。',
      denied: '无权限时返回学生列表。',
    },
  },
  classReport: {
    title: '班级统计报告',
    subtitle: '有任何记录即可展示统计，不需要 AI 分析。',
    modules: ['记录总数', '覆盖学生数', '加分记录', '减分记录', '五育指标分布'],
    ctas: [
      { label: '生成月度/期末AI报告', priority: 'P0', position: '页面底部主按钮' },
    ],
    states: {
      normal: '展示统计信息。',
      loading: '统计计算中。',
      empty: '无记录时引导去记录。',
      network: '统计加载失败，提供重试。',
      denied: '无权限时返回班级列表。',
    },
  },
  termReport: {
    title: '月度/期末AI报告',
    subtitle: 'AI 基于学生全部日常行为记录生成成长报告。',
    modules: ['生成条件', 'AI报告内容区', '总结', '五育表现', '亮点', '待提升方向', '建议'],
    ctas: [
      { label: '生成报告', priority: 'P0', position: '页面底部主按钮' },
      { label: '复制报告', priority: 'P1', position: '页面底部次按钮' },
    ],
    states: {
      normal: '展示生成入口或已生成报告。',
      loading: 'AI 报告生成中。',
      empty: '记录不足时引导补充记录。',
      network: '生成失败，保留生成入口。',
      denied: '学生不存在或无权限时返回学生列表。',
    },
  },
  mine: {
    title: '我的',
    subtitle: '查看账号、协议和版本入口。',
    modules: ['教师卡片', '头像', '姓名', '个人版标签', '编辑按钮', '升级学校版', '学校版功能弹窗', '顾问微信二维码', '修改密码', '隐私协议', '用户协议', '退出登录'],
    ctas: [
      { label: '升级学校版', priority: 'P0', position: '教师卡片下方主按钮，点击打开底部弹窗' },
      { label: '编辑', priority: 'P1', position: '教师卡片右侧' },
      { label: '修改密码', priority: 'P1', position: '账号设置列表' },
      { label: '退出登录', priority: 'P3', position: '页面底部' },
    ],
    states: {
      normal: '展示教师卡片、版本入口和账号设置。',
      loading: '个人信息加载中。',
      empty: '个人信息缺失时可进入个人信息页补全。',
      network: '加载失败，提供重试。',
      denied: '登录失效，提示重新登录。',
    },
  },
  profileEdit: {
    title: '个人信息',
    subtitle: '编辑头像、姓名和任教信息。',
    modules: ['头像展示', '更换头像 icon', '姓名结果行', '姓名编辑弹窗', '任教信息结果卡片', '删除任教信息', '头像操作弹窗', '任教信息级联多选弹窗'],
    ctas: [
      { label: '编辑姓名', priority: 'P1', position: '姓名行' },
      { label: '新增任教信息', priority: 'P1', position: '任教信息标题右侧' },
      { label: '编辑任教信息', priority: 'P1', position: '任教信息结果卡片' },
      { label: '更换头像', priority: 'P1', position: '头像右下角 icon' },
    ],
    states: {
      normal: '展示可编辑个人信息。',
      loading: '局部保存中。',
      empty: '姓名或任教信息为空时提示。',
      network: '局部保存失败，保留原信息。',
      denied: '登录失效，提示重新登录。',
    },
  },
  advisor: {
    title: '顾问联系方式',
    subtitle: '自然展示顾问联系方式，不强销售。',
    modules: ['顾问微信', '联系电话', '复制微信', '拨打电话'],
    ctas: [
      { label: '复制微信', priority: 'P1', position: '联系方式卡片内' },
      { label: '拨打电话', priority: 'P1', position: '联系方式卡片内' },
      { label: '返回', priority: 'P2', position: '顶部左侧' },
    ],
    states: {
      normal: '展示顾问联系方式。',
      loading: '联系方式加载中。',
      empty: '暂未配置顾问时展示客服电话。',
      network: '加载失败，提供重试。',
      denied: '不适用。',
    },
  },
};

const stateLabels: Record<ViewState, string> = {
  normal: '正常',
  loading: '加载',
  empty: '空数据',
  network: '网络错误',
  denied: '权限拒绝',
};

const stateCycle: ViewState[] = ['normal', 'loading', 'empty', 'network', 'denied'];

const priorityClass: Record<Priority, string> = {
  P0: 'bg-gray-950 text-white border-gray-300',
  P1: 'bg-white text-gray-950 border-gray-300',
  P2: 'bg-white text-gray-950 border-dashed border-gray-300',
  P3: 'bg-white text-gray-950 border-gray-300 line-through',
};

const cx = (...classes: Array<string | false | null | undefined>) => classes.filter(Boolean).join(' ');

const pagePrdDetails: Partial<Record<PageKey, PrdBlock[]>> = {
  login: [
    { type: 'h2', text: '邀请入口未登录' },
    { type: 'list', items: [
      '老师从微信小程序卡片或邀请链接进入时，如果未登录，直接进入 01 注册登录页。',
      '登录页不展示额外邀请承接内容，保持注册登录主流程简洁。',
      '完成微信或手机号授权后，继续校验是否已加入被邀请班级。',
      '如果已加入该班级，进入班级页；如果未加入该班级，进入班级页并展示加入确认弹窗。',
    ] },
  ],
  mine: [
    { type: 'h2', text: '学校版入口' },
    { type: 'list', items: [
      '点击升级学校版后，从底部上滑展示弹窗，不跳转新页面。',
      '弹窗先说明学校版适合全校统一使用，再展示学校版核心优势和顾问微信二维码。',
      '学校版优势用“能力标题 + 学校收益”表达，避免只罗列功能名。',
      '核心优势包括统一评价标准、统一管理全校师生数据、支持更高频 AI 使用、形成更完整的班级/学生/学校报告。',
      '弹窗只提供关闭动作和二维码展示，不在产品内强行推动提交线索。',
    ] },
  ],
  home: [
    { type: 'h2', text: '新手引导规则' },
    { type: 'list', items: [
      '老师必须先获得班级，路径包括创建班级和加入班级。',
      '如果加入已有班级且班级已有学生，添加学生步骤自动完成。',
      '班级里有学生后即可进行评价，首次记录是核心体验引导，不是使用门槛。',
      '完成首次日常行为记录后隐藏新手任务，展示日常行为记录历史。',
    ] },
  ],
  classList: [
    { type: 'h2', text: '班级卡片结构' },
    { type: 'list', items: [
      '班级名称右侧展示基于学段和入学年份推断的年级。',
      '班级名下方展示任教标签，例如班主任、语文、数学。',
      '班级号和人数在同一行展示。',
      '卡片 CTA 为学生列表和班级报告。',
    ] },
    { type: 'h2', text: '邀请老师加入' },
    { type: 'list', items: [
      '从班级卡片更多操作进入“邀请老师加入”。',
      '先展示邀请方式弹窗：邀请微信好友、通过班级号邀请、取消。',
      '选择微信好友时调用微信原生“选择聊天”页，包含关闭、多选、搜索、最近转发、最近聊天。',
      '选择任意聊天后进入微信原生发送确认半屏，展示接收人、小程序卡片、消息输入、取消和发送。',
      '点击发送后完成转发，小程序卡片打开后按登录态和班级关系直接进入注册登录页或班级页。',
      '被邀请方先在微信聊天对话中看到小程序卡片，点击卡片后再进入小程序。',
      '选择班级号邀请时只展示可复制文案，文案包含班级号、班级名称和快速加入链接。',
      '邀请链接打开后不出现额外承接页：未登录进注册登录页，已登录进班级页。',
      '已登录但没有该班级时，班级页展示加入确认弹窗。',
      '右侧页面总览下方的“被邀请”用于展示被邀请方路径，从微信聊天对话收到小程序卡片开始。',
    ] },
    { type: 'h2', text: '被邀请方路由' },
    { type: 'list', items: [
      '已登录且已有该班级：直接进入班级页，不展示加入确认。',
      '已登录但没有该班级：进入班级页，并在页面上展示加入确认弹窗。',
      '确认弹窗说明邀请老师、班级名称和加入后可共同管理学生日常评价。',
      '点击同意加入后关闭弹窗并留在班级页；点击暂不加入后关闭弹窗，不加入班级。',
    ] },
  ],
  studentList: [
    { type: 'h2', text: '学生列表交互' },
    { type: 'list', items: [
      '标题区直接承载学生/分组切换。',
      '学生视图默认展示搜索框和多选按钮。',
      '点击多选后搜索框隐藏，展示全选、男、女、取消。',
      '点击全选后文案变为取消全选。',
      '学生以一行 3 个卡片展示，卡片包含头像、性别、姓名、学号。',
    ] },
  ],
  studentAdd: [
    { type: 'h2', text: '添加学生规则' },
    { type: 'list', items: [
      '进入页面时默认只展示一行。',
      '点击添加一名后再新增一行。',
      '每行包含姓名、较短学号输入框、男/女点选。',
      '性别默认男，且每行可独立切换。',
      '不提供批量粘贴入口。',
    ] },
  ],
  profileEdit: [
    { type: 'h2', text: '个人信息编辑' },
    { type: 'list', items: [
      '头像区只展示当前头像和右下角更换 icon；上传图片、拍照通过底部弹窗选择。',
      '姓名以结果行展示，点击姓名行后从底部弹出编辑弹窗。',
      '姓名弹窗内为空时禁用完成；点击完成后自动生效并关闭弹窗。',
      '页面不提供统一保存按钮，头像、姓名、任教信息均为编辑后局部生效。',
      '任教信息在页面中按学科、班级数量、班级列表展示，并支持删除。',
      '新增或编辑任教信息时，底部弹窗使用级联选择器：左侧选择年级，右侧展示对应班级并支持多选。',
      '当一个年级班级较多时，右侧班级区使用独立纵向滚动列表展示，避免双列按钮挤压信息。',
      '班级列表只保留班级名称和选中态，不展示人数、已选数量或重复标题。',
      '学科在班级选择后单独点选，所有选择项均有可点击选中态。',
      '提交后关闭弹窗，并将配置结果回显到任教信息列表。',
    ] },
  ],
  aiResult: [
    { type: 'h2', text: 'AI 识别结果入库' },
    { type: 'list', items: [
      'AI 识别完成后直接入库，不设置草稿。',
      '一段话提到多个学生时可拆成多条记录。',
      '结果页展示事件时间、对象、五育指标、加减分。',
      '老师发现不准时点击结果进入编辑，保存后立即生效。',
    ] },
  ],
};

const inferGradeLabel = (stage: '小学' | '初中' | '高中', entryYearValue: number) => {
  const gradeIndex = Math.max(1, 2025 - entryYearValue + 1);
  const gradeMap = {
    小学: ['一年级', '二年级', '三年级', '四年级', '五年级', '六年级'],
    初中: ['初一', '初二', '初三'],
    高中: ['高一', '高二', '高三'],
  };
  return gradeMap[stage][Math.min(gradeIndex, gradeMap[stage].length) - 1];
};

const formatClassCode = (code: string) => code.replace(/\s/g, '').replace(/(\d{4})(?=\d)/g, '$1-').trim();
const bottomSheetBackdropClass = 'absolute inset-0 flex items-end animate-in fade-in duration-200 ease-out motion-reduce:animate-none';
const bottomSheetPanelClass = 'relative w-full animate-in slide-in-from-bottom-6 fade-in duration-300 ease-out motion-reduce:animate-none';

const TeacherCMobileLowFi: React.FC = () => {
  const [surface, setSurface] = useState<CEndSurface>('teacher');
  const [prototypeWidth, setPrototypeWidth] = useState(34);
  const resizeDragRef = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
    containerWidth: number;
  } | null>(null);
  const [page, setPage] = useState<PageKey>('login');
  const [viewState, setViewState] = useState<ViewState>('normal');
  const [history, setHistory] = useState<PageKey[]>([]);
  const [recordStage, setRecordStage] = useState<RecordStage>('idle');
  const [classCreated, setClassCreated] = useState(false);
  const [joinedClassHasStudents, setJoinedClassHasStudents] = useState(false);
  const [recordCount, setRecordCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [showMultiResult, setShowMultiResult] = useState(false);
  const [showWechatPhoneSheet, setShowWechatPhoneSheet] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [schoolStage, setSchoolStage] = useState('');
  const [entryYear, setEntryYear] = useState('');
  const [classNumber, setClassNumber] = useState('1');
  const [isCustomClassName, setIsCustomClassName] = useState(false);
  const [customClassName, setCustomClassName] = useState('');
  const [classCode, setClassCode] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentGenderFilter, setStudentGenderFilter] = useState<'all' | '男' | '女'>('all');
  const [studentSelectionMode, setStudentSelectionMode] = useState(false);
  const [selectedStudentNos, setSelectedStudentNos] = useState<string[]>([]);
  const [studentListMode, setStudentListMode] = useState<'student' | 'group'>('student');
  const [studentInputRows, setStudentInputRows] = useState(1);
  const [studentInputGenders, setStudentInputGenders] = useState<Array<'男' | '女'>>(['男']);
  const [teachingRows, setTeachingRows] = useState(2);
  const [showPhoneLoginSheet, setShowPhoneLoginSheet] = useState(false);
  const [phoneLoginTab, setPhoneLoginTab] = useState<PhoneLoginTab>('sms');
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [showNameSheet, setShowNameSheet] = useState(false);
  const [draftTeacherName, setDraftTeacherName] = useState('');
  const [showSchoolUpgradeSheet, setShowSchoolUpgradeSheet] = useState(false);
  const [showTeachingSheet, setShowTeachingSheet] = useState(false);
  const [showInviteOptionsSheet, setShowInviteOptionsSheet] = useState(false);
  const [showWechatChatSheet, setShowWechatChatSheet] = useState(false);
  const [wechatInviteMode, setWechatInviteMode] = useState<WechatInviteMode>('select');
  const [showClassCodeInviteSheet, setShowClassCodeInviteSheet] = useState(false);
  const [showInviteConfirmSheet, setShowInviteConfirmSheet] = useState(false);
  const [wechatShareSentTo, setWechatShareSentTo] = useState('');
  const [pendingInviteAfterLogin, setPendingInviteAfterLogin] = useState(false);
  const [inviteeLoggedIn, setInviteeLoggedIn] = useState(false);
  const [inviteeAlreadyJoined, setInviteeAlreadyJoined] = useState(false);
  const [editingTeachingIndex, setEditingTeachingIndex] = useState<number | null>(null);
  const [teachingGrade, setTeachingGrade] = useState<TeachingGrade>('2025级');
  const [teachingSelectedClasses, setTeachingSelectedClasses] = useState<string[]>(['2025级1班', '2025级2班']);
  const [teachingSubject, setTeachingSubject] = useState('英语');
  const [activeClassAction, setActiveClassAction] = useState<{ name: string; code: string } | null>(null);
  const [inviteClass, setInviteClass] = useState<{ name: string; code: string; inviter: string }>({ name: '2025级1班', code: '58273914', inviter: '郭老师' });
  const [classActionToast, setClassActionToast] = useState('');

  const meta = pageMeta[page];
  const demoAcademicStartYear = 2025;
  const defaultClassName = entryYear ? `${entryYear}级${classNumber || '1'}班` : '';
  const classDisplayName = isCustomClassName ? customClassName : defaultClassName;
  const canSaveClass = Boolean(schoolStage && entryYear && classNumber.trim() && classDisplayName.trim());
  const canJoinClass = classCode.trim().length === 8;
  const studentRows = [
    { name: '王小明', no: '20250101', gender: '男' as const },
    { name: '李小红', no: '20250102', gender: '女' as const },
    { name: '陈一诺', no: '20250103', gender: '女' as const },
    { name: '周子航', no: '20250104', gender: '男' as const },
  ];
  const visibleStudentRows = studentRows.filter((student) => {
    const keyword = studentSearch.trim();
    const matchesSearch = !keyword || student.name.includes(keyword) || student.no.includes(keyword);
    const matchesGender = studentGenderFilter === 'all' || student.gender === studentGenderFilter;
    return matchesSearch && matchesGender;
  });

  const handleResizeStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    const container = event.currentTarget.closest('main');
    resizeDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startWidth: prototypeWidth,
      containerWidth: container?.clientWidth ?? window.innerWidth,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleResizeMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = resizeDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const deltaPercent = ((event.clientX - drag.startX) / drag.containerWidth) * 100;
    setPrototypeWidth(Math.min(52, Math.max(24, drag.startWidth + deltaPercent)));
  };

  const handleResizeEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = resizeDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    resizeDragRef.current = null;
  };


  const navigate = (next: PageKey) => {
    setShowWechatPhoneSheet(false);
    setShowPhoneLoginSheet(false);
    setShowAvatarSheet(false);
    setShowNameSheet(false);
    setShowSchoolUpgradeSheet(false);
    setShowTeachingSheet(false);
    setShowInviteOptionsSheet(false);
    setShowWechatChatSheet(false);
    setShowClassCodeInviteSheet(false);
    setShowInviteConfirmSheet(false);
    setEditingTeachingIndex(null);
    setActiveClassAction(null);
    setClassActionToast('');
    setHistory((prev) => [...prev, page]);
    setPage(next);
    setViewState('normal');
    if (next !== 'record') setRecordStage('idle');
  };

  const jumpToPage = (next: PageKey) => {
    setShowWechatPhoneSheet(false);
    setShowPhoneLoginSheet(false);
    setShowAvatarSheet(false);
    setShowNameSheet(false);
    setShowSchoolUpgradeSheet(false);
    setShowTeachingSheet(false);
    setShowInviteOptionsSheet(false);
    setShowWechatChatSheet(false);
    setShowClassCodeInviteSheet(false);
    setShowInviteConfirmSheet(false);
    setEditingTeachingIndex(null);
    setActiveClassAction(null);
    setClassActionToast('');
    setHistory([]);
    setPage(next);
    setViewState('normal');
    setRecordStage('idle');
    if (next === 'login') {
      setClassCreated(false);
      setJoinedClassHasStudents(false);
      setStudentCount(0);
      setRecordCount(0);
      setTeacherName('');
      setPendingInviteAfterLogin(false);
      setInviteeLoggedIn(false);
      setInviteeAlreadyJoined(false);
      setStudentInputRows(1);
      setStudentInputGenders(['男']);
      return;
    }
    if (!teacherName.trim()) setTeacherName('郭');
    if (next !== 'profile') setClassCreated(true);
    if (['record', 'aiResult', 'editResult', 'classReport', 'termReport', 'studentDetail'].includes(next)) {
      setStudentCount((count) => Math.max(count, 2));
      setRecordCount((count) => Math.max(count, 2));
    }
    if (['studentList', 'classReport', 'termReport', 'studentDetail'].includes(next)) {
      setStudentCount((count) => Math.max(count, 2));
    }
    if (next === 'studentAdd') {
      setStudentInputRows(1);
      setStudentInputGenders(['男']);
    }
  };

  const jumpToPath = (target: PathTarget) => {
    if (target.type === 'page') {
      jumpToPage(target.page);
      if (target.page === 'login') setPendingInviteAfterLogin(true);
      return;
    }

    jumpToPage('classList');
    if (target.type === 'inviteWechat') {
      setInviteeAlreadyJoined(false);
      setShowInviteConfirmSheet(false);
      setShowInviteOptionsSheet(true);
      return;
    }
    if (target.type === 'wechatChatConfirm') {
      setInviteeAlreadyJoined(false);
      setShowInviteConfirmSheet(false);
      setWechatShareSentTo('陈老师');
      setWechatInviteMode('confirm');
      setShowWechatChatSheet(true);
      return;
    }
    if (target.type === 'wechatReceivedCard') {
      setInviteeAlreadyJoined(false);
      setShowInviteConfirmSheet(false);
      setWechatShareSentTo('陈老师');
      setWechatInviteMode('received');
      setShowWechatChatSheet(true);
      return;
    }
    setInviteeAlreadyJoined(false);
    setShowInviteConfirmSheet(true);
  };

  const back = () => {
    const prev = history[history.length - 1];
    if (!prev) return;
    setHistory((items) => items.slice(0, -1));
    setPage(prev);
    setViewState('normal');
  };

  const completeLogin = () => {
    if (!pendingInviteAfterLogin) {
      navigate('profile');
      return;
    }
    setInviteeLoggedIn(true);
    setPendingInviteAfterLogin(false);
    if (inviteeAlreadyJoined) {
      navigate('classList');
      return;
    }
    navigate('classList');
    setShowInviteConfirmSheet(true);
  };

  const openStudentAdd = () => {
    setStudentInputRows(1);
    setStudentInputGenders(['男']);
    navigate('studentAdd');
  };

  const addStudentInputRow = () => {
    setStudentInputRows((count) => count + 1);
    setStudentInputGenders((items) => [...items, '男']);
  };

  const updateStudentInputGender = (index: number, gender: '男' | '女') => {
    setStudentInputGenders((items) => items.map((item, itemIndex) => itemIndex === index ? gender : item));
  };

  const openNameSheet = () => {
    setDraftTeacherName(teacherName.trim() || '郭老师');
    setShowNameSheet(true);
  };

  const submitNameSheet = () => {
    const nextName = draftTeacherName.trim();
    if (!nextName) return;
    setTeacherName(nextName);
    setShowNameSheet(false);
  };

  const openTeachingCreate = () => {
    setEditingTeachingIndex(null);
    setTeachingGrade('2025级');
    setTeachingSelectedClasses(['2025级1班', '2025级2班']);
    setTeachingSubject('英语');
    setShowTeachingSheet(true);
  };

  const openTeachingEdit = (index: number) => {
    setEditingTeachingIndex(index);
    if (index === 0) {
      setTeachingGrade('2025级');
      setTeachingSelectedClasses(['2025级1班', '2025级2班']);
      setTeachingSubject('英语');
    } else {
      setTeachingGrade('2023级');
      setTeachingSelectedClasses(['2023级1班']);
      setTeachingSubject('音乐');
    }
    setShowTeachingSheet(true);
  };

  const selectTeachingGrade = (grade: TeachingGrade) => {
    setTeachingGrade(grade);
    setTeachingSelectedClasses([`${grade}1班`]);
  };

  const toggleTeachingClass = (className: string) => {
    setTeachingSelectedClasses((items) => (
      items.includes(className) ? items.filter((item) => item !== className) : [...items, className]
    ));
  };

  const submitTeachingSheet = () => {
    if (editingTeachingIndex === null) setTeachingRows((count) => count + 1);
    setShowTeachingSheet(false);
  };

  const removeTeachingRow = (index: number) => {
    setTeachingRows((count) => Math.max(1, count - 1));
    if (editingTeachingIndex === index) setEditingTeachingIndex(null);
  };

  const startVoice = () => {
    setViewState('loading');
    setRecordStage('recording');
  };

  const finishVoice = () => {
    setRecordStage('transcribing');
    window.setTimeout(() => setRecordStage('identifying'), 450);
    window.setTimeout(() => {
      setRecordStage('saved');
      setRecordCount((count) => Math.max(count + 2, 3));
      setShowMultiResult(true);
      navigate('aiResult');
    }, 950);
  };

  const cancelVoice = () => {
    setRecordStage('idle');
    setViewState('normal');
  };

  const statusText = useMemo(() => meta.states[viewState], [meta, viewState]);

  const renderStateContent = () => {
    if (viewState === 'normal') return null;
    return (
      <div className="absolute inset-x-4 top-24 z-20 rounded-2xl bg-white p-4 text-center shadow-[0_16px_36px_rgba(15,23,42,0.14)]">
        <div className="text-sm font-black">{stateLabels[viewState]}</div>
        <p className="mt-2 text-xs leading-5">{statusText}</p>
        <button type="button" onClick={() => setViewState('normal')} className="mt-3 h-11 rounded-xl bg-gray-50 px-5 text-sm font-black">
          回到正常态
        </button>
      </div>
    );
  };

  const ScreenHeader = ({ title, sub }: { title: string; sub?: string }) => (
    <header className="flex h-16 items-center gap-3 border-b border-gray-100 bg-white px-4">
      <button type="button" onClick={history.length ? back : undefined} className="flex h-11 w-11 items-center justify-center rounded-xl active:bg-gray-100 disabled:opacity-30" disabled={!history.length} aria-label="返回">
        <ArrowLeft size={18} />
      </button>
      <div className="min-w-0 flex-1 text-center">
        <h2 className="truncate text-base font-black">{title}</h2>
      </div>
      <div className="h-11 w-11" aria-hidden="true" />
    </header>
  );

  const TabHeader = ({ title }: { title: string }) => (
    <header className="flex h-16 items-center justify-center border-b border-gray-100 bg-white px-4">
      <h2 className="text-base font-black">{title}</h2>
    </header>
  );

  const StudentListHeader = () => (
    <header className="flex h-16 items-center gap-3 border-b border-gray-100 bg-white px-4">
      <button type="button" onClick={history.length ? back : undefined} className="flex h-11 w-11 items-center justify-center rounded-xl active:bg-gray-100 disabled:opacity-30" disabled={!history.length} aria-label="返回">
        <ArrowLeft size={18} />
      </button>
      <div className="mx-auto grid w-36 grid-cols-2 text-center text-sm font-black">
        <button type="button" onClick={() => setStudentListMode('student')} className="relative h-10">
          学生
          {studentListMode === 'student' && <span className="absolute bottom-0 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-gray-900" />}
        </button>
        <button type="button" onClick={() => setStudentListMode('group')} className="relative h-10">
          分组
          {studentListMode === 'group' && <span className="absolute bottom-0 left-1/2 h-0.5 w-7 -translate-x-1/2 rounded-full bg-gray-900" />}
        </button>
      </div>
      <div className="h-11 w-11" aria-hidden="true" />
    </header>
  );

  const BottomNav = () => (
    <nav className="absolute inset-x-4 bottom-4 grid h-14 grid-cols-3 rounded-2xl border border-gray-100 bg-white shadow-[0_-8px_28px_rgba(15,23,42,0.06)] text-center text-[11px] font-black">
      <button type="button" onClick={() => navigate('home')} className={cx('rounded-l-[14px]', (page === 'home' || page === 'record') && 'bg-gray-950 text-white')}>记录</button>
      <button type="button" onClick={() => navigate('classList')} className={cx(page === 'classList' && 'bg-gray-950 text-white')}>班级</button>
      <button type="button" onClick={() => navigate('mine')} className={cx('rounded-r-[14px]', page === 'mine' && 'bg-gray-950 text-white')}>我的</button>
    </nav>
  );

  const StepNumber = ({ done, active, index }: { done?: boolean; active?: boolean; index: number }) => (
    <div className={cx('relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl text-sm font-black', done ? 'bg-gray-200 text-gray-500' : active ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400')}>
      {index}
    </div>
  );

  const TimelineRail = ({ children, isLast }: { children: React.ReactNode; isLast?: boolean }) => (
    <div className="relative flex w-10 shrink-0 justify-center self-stretch">
      {!isLast && <div className="absolute left-1/2 top-11 bottom-[-18px] w-0.5 -translate-x-1/2 rounded-full bg-gray-300" aria-hidden="true" />}
      {children}
    </div>
  );

  const TaskRow = ({ done, active, index, label, action, onClick, isLast }: { done?: boolean; active?: boolean; index: number; label: string; action: string; onClick: () => void; isLast?: boolean }) => (
    <div className={cx('relative flex items-stretch gap-3 rounded-2xl p-3', done ? 'bg-gray-100 text-gray-400' : active ? 'bg-gray-50' : 'bg-white')}>
      <TimelineRail isLast={isLast}>
        <StepNumber done={done} active={active} index={index} />
      </TimelineRail>
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div className="min-w-0 flex-1 text-sm font-black leading-5">{label}</div>
        {done ? (
          <span className="text-xs font-medium">已完成</span>
        ) : active ? (
          <button type="button" onClick={onClick} className="h-11 rounded-xl bg-gray-900 px-3 text-xs font-black text-white">{action}</button>
        ) : (
          <span className="text-xs font-medium text-gray-400">待完成</span>
        )}
      </div>
    </div>
  );

  const ClassEntryCard = ({ type, onClick }: { type: 'create' | 'join'; onClick: () => void }) => {
    const Icon = type === 'create' ? Plus : LogIn;
    return (
      <button type="button" onClick={onClick} className="h-[100px] rounded-2xl border border-gray-200 bg-gray-50 px-3 py-2.5 text-left active:bg-gray-100">
        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-white">
          <Icon size={16} />
        </div>
        <div className="mt-2 text-sm font-black leading-5">{type === 'create' ? '创建班级' : '加入班级'}</div>
        <div className="mt-0.5 text-[11px] font-medium leading-4 text-gray-500">{type === 'create' ? '新建班级' : '输入班级号'}</div>
      </button>
    );
  };

  const FormSectionTitle = ({ title }: { title: string }) => (
    <div className="px-1 text-xs font-black text-gray-500">{title}</div>
  );

  const AvatarActionButton = ({ icon: Icon, label, onClick }: { icon: React.ElementType; label: string; onClick?: () => void }) => (
    <button type="button" onClick={onClick} className="flex h-11 items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-xs font-black active:bg-gray-100">
      <Icon size={15} />
      <span>{label}</span>
    </button>
  );

  const runClassAction = (key: ClassActionKey) => {
    if (key === 'reward' || key === 'homework' || key === 'leftStudents') {
      navigate('studentList');
      return;
    }
    if (key === 'editClass') {
      navigate('classCreate');
      return;
    }
    if (key === 'inviteTeacher') {
      if (activeClassAction) setInviteClass({ ...activeClassAction, inviter: teacherName.trim() || '郭老师' });
      setActiveClassAction(null);
      setShowInviteOptionsSheet(true);
      return;
    }
    const toastMap: Record<Exclude<ClassActionKey, 'reward' | 'homework' | 'leftStudents' | 'editClass' | 'inviteTeacher'>, string> = {
      password: '设置兑换密码',
      face: '更新人脸数据',
    };
    setClassActionToast(toastMap[key]);
    setActiveClassAction(null);
  };

  const classActionGroups = [
    {
      title: '日常操作',
      items: [
        { key: 'reward' as const, label: '兑换奖励', icon: Gift },
        { key: 'homework' as const, label: '作业录入', icon: FileText },
      ],
    },
    {
      title: '班级维护',
      items: [
        { key: 'password' as const, label: '设置兑换密码', icon: Shield },
        { key: 'face' as const, label: '更新人脸数据', icon: ScanFace },
        { key: 'leftStudents' as const, label: '离校学生', icon: Users },
        { key: 'editClass' as const, label: '编辑班级信息', icon: Edit3 },
      ],
    },
    {
      title: '协同管理',
      items: [
        { key: 'inviteTeacher' as const, label: '邀请老师加入', icon: UserPlus },
      ],
    },
  ];

  const ClassCard = ({ name, code, stage, entryYearValue, tags, count }: { name: string; code: string; stage: '小学' | '初中' | '高中'; entryYearValue: number; tags: string[]; count: number }) => (
    <div className="relative rounded-2xl bg-gray-50 p-4">
      <button
        type="button"
        aria-label={`${name}更多操作`}
        onClick={() => setActiveClassAction({ name, code })}
        className="absolute right-2 top-2 flex h-10 w-10 items-center justify-center rounded-xl bg-white active:bg-gray-100"
      >
        <MoreHorizontal size={18} />
      </button>
      <div className="min-w-0 pr-10">
        <div className="truncate text-base font-black">{name}（{inferGradeLabel(stage, entryYearValue)}）</div>
      </div>
      <div className="mt-2 flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className="rounded-lg bg-white px-2 py-1 text-xs font-black">{tag}</span>
        ))}
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-xs font-medium text-gray-600">
        <span>班级号：{formatClassCode(code)}</span>
        <span className="shrink-0 text-right">{count}人</span>
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2">
        <button type="button" onClick={() => navigate('studentList')} className="h-11 rounded-xl border border-gray-200 bg-white text-xs font-black">学生列表</button>
        <button type="button" onClick={() => navigate('classReport')} className="h-11 rounded-xl border border-gray-200 bg-gray-900 text-xs font-black text-white">班级报告</button>
      </div>
    </div>
  );

  const renderClassActionSheet = () => {
    if (!activeClassAction) return null;
    return (
      <div className={cx(bottomSheetBackdropClass, 'z-40 bg-black/35')}>
        <button type="button" aria-label="关闭班级更多操作" className="absolute inset-0" onClick={() => setActiveClassAction(null)} />
        <div className={cx(bottomSheetPanelClass, 'rounded-t-3xl bg-white p-5 shadow-[0_-18px_44px_rgba(15,23,42,0.18)]')}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-black">{activeClassAction.name}</div>
              <div className="mt-1 text-xs font-medium text-gray-500">班级号：{formatClassCode(activeClassAction.code)}</div>
            </div>
            <button type="button" onClick={() => setActiveClassAction(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg font-black active:bg-gray-100">×</button>
          </div>
          <div className="space-y-4">
            {classActionGroups.map((group) => (
              <section key={group.title}>
                <h3 className="mb-2 text-xs font-black text-gray-400">{group.title}</h3>
                <div className="grid grid-cols-2 gap-2">
                  {group.items.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => runClassAction(item.key)}
                        className="flex min-h-[54px] items-center gap-2 rounded-2xl border border-gray-100 bg-gray-50 px-3 text-left text-xs font-black active:bg-gray-100"
                      >
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white">
                          <Icon size={17} />
                        </span>
                        <span className="leading-4">{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderInviteOptionsSheet = () => {
    if (!showInviteOptionsSheet) return null;
    const close = () => setShowInviteOptionsSheet(false);

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="邀请老师加入">
        <button type="button" aria-label="关闭邀请方式弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">邀请老师加入</h3>
          <div className="mt-4 space-y-2">
            <button
              type="button"
              onClick={() => {
                close();
                setWechatShareSentTo('');
                setWechatInviteMode('select');
                setShowWechatChatSheet(true);
              }}
              className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-gray-50 px-4 text-left active:bg-gray-100"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white"><MessageCircle size={18} /></span>
              <span className="text-sm font-black">邀请微信好友</span>
            </button>
            <button
              type="button"
              onClick={() => {
                close();
                setShowClassCodeInviteSheet(true);
              }}
              className="flex min-h-14 w-full items-center gap-3 rounded-2xl bg-gray-50 px-4 text-left active:bg-gray-100"
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white"><Copy size={18} /></span>
              <span className="text-sm font-black">通过班级号邀请</span>
            </button>
          </div>
          <button type="button" onClick={close} className="mt-3 h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100">取消</button>
        </section>
      </div>
    );
  };

  const renderWechatChatSheet = () => {
    if (!showWechatChatSheet) return null;
    const close = () => setShowWechatChatSheet(false);
    const chats = ['陈老师', '一年级语文组', '文件传输助手', '数学备课组', '综合素养评价群'];
    const recentChats = ['文件传输助手', '陈老师', '一年级语文组'];
    const openReceivedCard = () => {
      close();
      setWechatShareSentTo('');
      setInviteeLoggedIn(false);
      setInviteeAlreadyJoined(false);
      setPendingInviteAfterLogin(true);
      navigate('login');
    };
    const sendCard = () => {
      close();
      setWechatShareSentTo('');
      setInviteeLoggedIn(false);
      setInviteeAlreadyJoined(false);
      setPendingInviteAfterLogin(true);
      navigate('login');
    };

    return (
      <div className="absolute inset-0 z-[120] bg-gray-100" role="dialog" aria-modal="true" aria-label="微信选择聊天">
          {wechatInviteMode === 'received' ? (
            <div className="flex h-full flex-col bg-gray-100">
              <header className="grid h-16 shrink-0 grid-cols-[56px_1fr_56px] items-center border-b border-gray-200 px-4">
                <button type="button" onClick={close} className="text-left text-2xl leading-none">‹</button>
                <div className="truncate text-center text-base font-black">{wechatShareSentTo || '文件传输助手'}</div>
                <button type="button" className="text-right text-xl leading-none">…</button>
              </header>
              <div className="flex-1 overflow-y-auto px-5 py-5">
                <button type="button" onClick={openReceivedCard} className="ml-auto block w-[78%] rounded-xl bg-white p-3 text-left shadow-sm active:bg-gray-50">
                  <div className="text-xs font-medium text-gray-500">AI素养评价</div>
                  <div className="mt-2 text-base font-black leading-6">{inviteClass.inviter}邀请你加入「{inviteClass.name}」</div>
                  <div className="mt-3 flex aspect-[4/3] flex-col items-center justify-center rounded-xl bg-gray-50">
                    <div className="text-3xl font-black">邀请</div>
                    <div className="mt-3 rounded-full bg-white px-5 py-2 text-sm font-black">立即加入</div>
                  </div>
                  <div className="mt-2 text-xs font-medium text-gray-500">小程序</div>
                </button>
              </div>
              <div className="flex h-16 shrink-0 items-center gap-2 border-t border-gray-200 bg-white px-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-xl">◉</span>
                <div className="h-11 min-w-0 flex-1 rounded-xl bg-gray-50" />
                <Mic size={20} className="text-gray-500" />
                <span className="flex h-10 w-10 items-center justify-center rounded-full border border-gray-300 text-xl">＋</span>
              </div>
            </div>
          ) : !wechatShareSentTo ? (
            <div className="flex h-full flex-col">
              <header className="grid h-16 grid-cols-[72px_1fr_72px] items-center px-4">
                <button type="button" onClick={close} className="text-left text-sm font-black">关闭</button>
                <div className="text-center text-base font-black">选择聊天</div>
                <button type="button" className="text-right text-sm font-black">多选</button>
              </header>
              <div className="px-4">
                <div className="flex h-11 items-center justify-center rounded-xl bg-white text-sm font-medium text-gray-400">搜索</div>
              </div>
              <div className="mt-5 px-4">
                <div className="mb-3 text-sm font-black">最近转发</div>
                <div className="flex gap-4 overflow-hidden">
                  {recentChats.map((chat, index) => (
                    <button
                      key={chat}
                      type="button"
                      onClick={() => {
                        setWechatInviteMode('confirm');
                        setWechatShareSentTo(chat);
                      }}
                      className="w-20 shrink-0 text-center active:opacity-70"
                    >
                      <div className={cx('mx-auto h-14 w-14 rounded-xl', index === 0 ? 'bg-gray-900' : 'bg-white')} />
                      <div className="mt-2 line-clamp-2 text-xs font-medium leading-4 text-gray-600">{chat}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="mt-6 flex-1 overflow-y-auto rounded-t-3xl bg-white px-4 pt-5">
                <div className="mb-2 flex items-center justify-between">
                  <div className="text-sm font-black">最近聊天</div>
                  <div className="text-xs font-medium text-gray-500">创建聊天｜转发到企业微信</div>
                </div>
                {chats.map((chat, index) => (
                  <button
                    key={chat}
                    type="button"
                    onClick={() => {
                      setWechatInviteMode('confirm');
                      setWechatShareSentTo(chat);
                    }}
                    className="flex h-16 w-full items-center gap-3 border-b border-gray-100 text-left active:bg-gray-50"
                  >
                    <span className="h-10 w-10 shrink-0 rounded-xl bg-gray-100" />
                    <span className="min-w-0 flex-1 truncate text-sm font-black">{chat}{index > 1 ? `（${20 + index}人）` : ''}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="relative h-full bg-gray-900/45">
              <div className="absolute inset-x-0 bottom-0 rounded-t-[28px] bg-white px-5 pb-7 pt-6">
                <h3 className="text-base font-black">发送给</h3>
                <div className="mt-5 flex items-center justify-between">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="h-12 w-12 shrink-0 rounded-xl bg-gray-100" />
                    <div className="truncate text-lg font-black">{wechatShareSentTo}</div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
                <div className="mx-auto mt-5 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="text-xs font-medium text-gray-500">AI素养评价</div>
                  <div className="mt-2 text-sm font-black leading-5">{inviteClass.inviter}邀请你加入「{inviteClass.name}」</div>
                  <div className="mt-3 flex aspect-[4/3] items-center justify-center rounded-xl bg-gray-50 text-xl font-black">邀请</div>
                  <div className="mt-2 text-xs font-medium text-gray-500">小程序</div>
                </div>
                <div className="mt-5 flex h-12 items-center gap-3 rounded-2xl bg-gray-50 px-3">
                  <span className="min-w-0 flex-1 text-sm font-medium text-gray-400">发消息</span>
                  <Mic size={18} className="text-gray-500" />
                  <span className="flex h-7 w-7 items-center justify-center rounded-full border border-gray-500 text-sm font-black">＋</span>
                </div>
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <button type="button" onClick={() => setWechatShareSentTo('')} className="h-12 rounded-2xl bg-gray-100 text-sm font-black active:bg-gray-200">取消</button>
                  <button type="button" onClick={sendCard} className="h-12 rounded-2xl bg-gray-900 text-sm font-black text-white active:bg-gray-700">发送</button>
                </div>
              </div>
            </div>
          )}
      </div>
    );
  };

  const renderClassCodeInviteSheet = () => {
    if (!showClassCodeInviteSheet) return null;
    const close = () => setShowClassCodeInviteSheet(false);
    const inviteLink = `ai-literacy://join-class?code=${inviteClass.code}`;
    const inviteText = `Hi～我正在用小程序「AI素养评价」快速记录学生日常表现，并生成成长报告。你可以输入班级号 ${inviteClass.code}，加入我创建的「${inviteClass.name}」一起管理；也可以点击链接 ${inviteLink} 直接加入。一起体验 AI 记录和报告生成吧～`;

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="班级号邀请">
        <button type="button" aria-label="关闭班级号邀请弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'max-h-[86%] overflow-y-auto rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">班级号邀请</h3>
          <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm font-medium leading-7 text-gray-700">{inviteText}</div>
          <button
            type="button"
            onClick={() => {
              close();
              setClassActionToast('已复制邀请文案');
            }}
            className="mt-4 h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white"
          >
            复制文案
          </button>
        </section>
      </div>
    );
  };

  const renderInviteConfirmSheet = () => {
    if (!showInviteConfirmSheet) return null;
    const close = () => setShowInviteConfirmSheet(false);

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="确认加入班级">
        <button type="button" aria-label="关闭加入班级确认弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">加入班级邀请</h3>
          <p className="mt-3 text-sm font-medium leading-7 text-gray-700">{inviteClass.inviter}邀请你一起管理「{inviteClass.name}」。加入后，你可以查看班级学生，并使用 AI 记录学生日常行为、生成评价报告。</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={close} className="h-12 rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100">暂不加入</button>
            <button
              type="button"
              onClick={() => {
                close();
                setInviteeAlreadyJoined(true);
                setClassCreated(true);
                setJoinedClassHasStudents(true);
                setStudentCount((count) => Math.max(count, 2));
                navigate('classList');
              }}
              className="h-12 rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white"
            >
              同意加入
            </button>
          </div>
        </section>
      </div>
    );
  };

  const AiResultCard = ({ second = false }: { second?: boolean }) => (
    <button type="button" onClick={() => navigate('editResult')} className="w-full rounded-2xl bg-gray-50 p-3 text-left">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-black">AI 识别结果 {second ? '2' : '1'}</span>
        <span className="rounded-lg border border-gray-200 px-2 py-1 text-xs font-black">{second ? '+1' : '+2'}</span>
      </div>
      <div className="grid gap-1 text-xs leading-5">
        <div><b>时间</b>：今天 10:20</div>
        <div><b>对象</b>：{second ? '李小红｜20250102' : '王小明｜20250101'}</div>
        <div><b>指标</b>：劳育-劳动习惯-主动劳动</div>
        <div><b>加减分</b>：加分 {second ? '+1' : '+2'}</div>
        <div><b>评语</b>：主动参与班级劳动，表现积极。</div>
      </div>
    </button>
  );

  const renderPrdBlock = (block: PrdBlock, index: number) => {
    if (block.type === 'h1') return <h1 key={index} className="text-2xl font-black leading-tight">{block.text}</h1>;
    if (block.type === 'h2') return <h2 key={index} className="text-lg font-black leading-tight">{block.text}</h2>;
    if (block.type === 'h3') return <h3 key={index} className="text-sm font-black leading-tight">{block.text}</h3>;
    if (block.type === 'p') return <p key={index} className="text-sm leading-6 text-gray-700">{block.text}</p>;
    return (
      <ul key={index} className="space-y-2 text-sm leading-6 text-gray-700">
        {block.items.map((item) => <li key={item} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-gray-400" />{item}</li>)}
      </ul>
    );
  };

  const renderPageDirectory = () => (
    <section className="rounded-2xl bg-white p-4">
      <div className="space-y-3">
        {flowLanes.map((lane) => (
          <div key={lane.title} className="grid grid-cols-[72px_1fr] items-center gap-3">
            <div className="text-xs font-black text-gray-500">{lane.title}</div>
            <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
              {lane.pages.map((item, index) => {
                const active = page === item;
                const pageIndex = pageOrder.indexOf(item) + 1;
                return (
                  <React.Fragment key={item}>
                    {index > 0 && <span className="shrink-0 text-sm font-black text-gray-400">→</span>}
                    <button
                      type="button"
                      onClick={() => jumpToPage(item)}
                      className={cx(
                        'flex h-10 shrink-0 items-center rounded-xl border px-3 text-left active:bg-gray-100',
                        active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700'
                      )}
                    >
                      <span className={cx('mr-2 text-sm font-black', active ? 'text-white' : 'text-gray-400')}>
                        {String(pageIndex).padStart(2, '0')}
                      </span>
                      <span className="text-xs font-black">{pageMeta[item].title}</span>
                    </button>
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        ))}
        <div className="grid grid-cols-[72px_1fr] items-start gap-3 border-t border-gray-100 pt-3">
          <div className="text-xs font-black text-gray-500">被邀请</div>
          <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
            {invitePathNodes.map((node, index) => (
              <React.Fragment key={node.label}>
                {index > 0 && <span className="shrink-0 text-sm font-black text-gray-400">→</span>}
                <button
                  type="button"
                  onClick={() => jumpToPath(node.target)}
                  className="min-h-12 shrink-0 rounded-xl border border-gray-200 bg-white px-3 py-2 text-left active:bg-gray-100"
                >
                  <span className="block text-xs font-black text-gray-950">{node.label}</span>
                  <span className="mt-1 block text-[11px] font-medium text-gray-500">{node.desc}</span>
                </button>
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    </section>
  );

  const renderSurfaceTabs = () => (
    <div className="flex w-fit overflow-hidden rounded-2xl border border-gray-200 bg-white">
      {surfaceTabs.map((tab, index) => {
        const active = surface === tab.key;
        return (
          <button
            key={tab.key}
            type="button"
            onClick={() => setSurface(tab.key)}
            className={cx(
              'h-10 px-4 text-sm font-black transition-colors',
              index > 0 && 'border-l border-gray-200',
              active ? 'bg-gray-950 text-white' : 'text-gray-600 active:bg-gray-100'
            )}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  const renderStaticPrdPanel = (blocks: PrdBlock[]) => (
    <aside className="hidden h-full min-w-0 flex-1 overflow-y-auto border-l border-gray-200 bg-gray-50 lg:block">
      <div className="mx-auto max-w-[1120px] space-y-6 px-8 py-6">
        {renderSurfaceTabs()}
        <section className="space-y-5 rounded-2xl bg-white p-6">
          {blocks.map(renderPrdBlock)}
        </section>
      </div>
    </aside>
  );

  const renderParentPrototype = () => (
    <PhoneMockup showDeviceFrame={false} safeAreaTop={false}>
      <div className="flex h-full w-full flex-col bg-white text-gray-950">
        <div className="border-b border-gray-100 px-5 pb-3 pt-5 text-center text-base font-black">成长报告</div>
        <div className="flex-1 space-y-3 overflow-y-auto p-5">
          <div className="rounded-2xl bg-gray-50 p-4">
            <div className="text-lg font-black">王小明</div>
            <div className="mt-2 text-sm font-medium text-gray-500">2025级1班｜20250101</div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="text-xs font-black text-gray-500">本月记录</div>
              <div className="mt-2 text-2xl font-black">18</div>
            </div>
            <div className="rounded-2xl border border-gray-200 p-4">
              <div className="text-xs font-black text-gray-500">报告状态</div>
              <div className="mt-2 text-base font-black">可查看</div>
            </div>
          </div>
          <button type="button" className="flex h-14 w-full items-center justify-between rounded-2xl bg-gray-950 px-4 text-left text-sm font-black text-white">
            查看月度报告
            <ChevronRight size={18} />
          </button>
          <button type="button" className="flex h-14 w-full items-center justify-between rounded-2xl border border-gray-200 px-4 text-left text-sm font-black">
            查看期末报告
            <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </PhoneMockup>
  );

  const renderOpsPrototype = () => (
    <div className="h-full w-full max-w-[760px] overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-950">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
        <div>
          <div className="text-base font-black">C端老师线索</div>
          <div className="mt-1 text-xs font-medium text-gray-500">按使用深度判断跟进优先级</div>
        </div>
        <button type="button" className="h-10 rounded-xl border border-gray-200 px-4 text-sm font-black">导出</button>
      </div>
      <div className="grid grid-cols-4 gap-3 border-b border-gray-100 p-4">
        {['新增老师 128', '活跃老师 76', '生成报告 31', '高意向 12'].map((item) => {
          const [label, value] = item.split(' ');
          return (
            <div key={item} className="rounded-2xl bg-gray-50 p-3">
              <div className="text-xs font-black text-gray-500">{label}</div>
              <div className="mt-2 text-xl font-black">{value}</div>
            </div>
          );
        })}
      </div>
      <div className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-black text-gray-500">
        <div>老师</div>
        <div>学校</div>
        <div>班级</div>
        <div>AI记录</div>
        <div>状态</div>
      </div>
      {[
        ['郭老师', '星河实验小学', '2', '68', '高意向'],
        ['陈老师', '未填写', '1', '21', '活跃'],
        ['李老师', '南城一中', '3', '96', '高意向'],
      ].map((row) => (
        <div key={row.join('-')} className="grid grid-cols-[1.2fr_1fr_0.8fr_0.8fr_0.8fr] border-b border-gray-100 px-4 py-4 text-sm font-medium">
          {row.map((cell) => <div key={cell} className="truncate pr-2">{cell}</div>)}
        </div>
      ))}
    </div>
  );

  const renderSummaryPrototype = () => (
    <div className="h-full w-full max-w-[760px] overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-950">
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="text-base font-black">qixiao C端改造架构</div>
        <div className="mt-1 text-xs font-medium text-gray-500">从 school_id 到 space 上下文</div>
      </div>
      <div className="grid grid-cols-2 gap-4 p-5">
        <div className="rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-black">现有学校版</div>
          <div className="mt-4 space-y-2 text-xs font-medium text-gray-600">
            <div className="rounded-xl bg-gray-50 px-3 py-2">schools 表</div>
            <div className="rounded-xl bg-gray-50 px-3 py-2">老师 / 学生 / 班级</div>
            <div className="rounded-xl bg-gray-50 px-3 py-2">X-School-ID</div>
            <div className="rounded-xl bg-gray-50 px-3 py-2">学校报告 / 区域统计</div>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 p-4">
          <div className="text-sm font-black">新增个人版</div>
          <div className="mt-4 space-y-2 text-xs font-medium text-gray-600">
            <div className="rounded-xl bg-gray-50 px-3 py-2">personal_space</div>
            <div className="rounded-xl bg-gray-50 px-3 py-2">创建 / 加入班级</div>
            <div className="rounded-xl bg-gray-50 px-3 py-2">默认指标包</div>
            <div className="rounded-xl bg-gray-50 px-3 py-2">AI 记录 / 体验报告</div>
          </div>
        </div>
      </div>
      <div className="mx-5 rounded-2xl bg-gray-50 p-4">
        <div className="mb-3 text-sm font-black">web-admin 新增线索池</div>
        <div className="grid grid-cols-[1fr_1fr_1fr] gap-2 text-xs font-medium text-gray-600">
          <div className="rounded-xl bg-white px-3 py-2">老师线索</div>
          <div className="rounded-xl bg-white px-3 py-2">使用行为</div>
          <div className="rounded-xl bg-white px-3 py-2">转学校版</div>
        </div>
      </div>
      <div className="mx-5 mt-4 rounded-2xl border border-gray-200 p-4">
        <div className="text-xs font-black text-gray-500">关键改造</div>
        <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-medium text-gray-600">
          {['scope 过滤', '身份切换', '数据隔离', '指标包选择', '权限判断', '迁移流程'].map((item) => (
            <div key={item} className="rounded-xl bg-gray-50 px-3 py-2">{item}</div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderPrototypePanel = () => {
    if (surface === 'summary') return renderSummaryPrototype();
    if (surface === 'parent') return renderParentPrototype();
    if (surface === 'ops') return renderOpsPrototype();
    return (
      <PhoneMockup showDeviceFrame={false} safeAreaTop={false}>
        <div className="relative h-full w-full overflow-hidden bg-white">
          {renderStateContent()}
          {renderPhonePage()}
          {classActionToast && (
            <div className="absolute inset-x-12 top-20 z-50 rounded-2xl bg-gray-950 px-4 py-3 text-center text-xs font-black text-white shadow-[0_16px_36px_rgba(15,23,42,0.2)]">
              {classActionToast}
            </div>
          )}
          {renderWechatPhoneSheet()}
          {renderPhoneLoginSheet()}
          {renderAvatarSheet()}
          {renderNameSheet()}
          {renderSchoolUpgradeSheet()}
          {renderTeachingSheet()}
          {renderInviteOptionsSheet()}
          {renderWechatChatSheet()}
          {renderClassCodeInviteSheet()}
          {renderInviteConfirmSheet()}
          {renderClassActionSheet()}
        </div>
      </PhoneMockup>
    );
  };

  const renderPrdPanel = () => {
    if (surface === 'summary') return renderStaticPrdPanel(summaryPrdBlocks);
    if (surface === 'parent') return renderStaticPrdPanel(parentPrdBlocks);
    if (surface === 'ops') return renderStaticPrdPanel(opsPrdBlocks);

    const blocks: PrdBlock[] = [
      { type: 'h1', text: meta.title },
      { type: 'p', text: meta.subtitle },
      { type: 'h2', text: '页面模块' },
      { type: 'list', items: meta.modules },
      { type: 'h2', text: 'CTA 按钮' },
      { type: 'list', items: meta.ctas.map((cta) => `${cta.label}｜${cta.priority}｜${cta.position}`) },
      { type: 'h2', text: '页面状态' },
      { type: 'list', items: stateCycle.map((state) => `${stateLabels[state]}：${meta.states[state]}`) },
      ...(pagePrdDetails[page] || []),
    ];

    return (
      <aside className="hidden h-full min-w-0 flex-1 overflow-y-auto border-l border-gray-200 bg-gray-50 lg:block">
        <div className="mx-auto max-w-[1120px] space-y-6 px-8 py-6">
          {renderSurfaceTabs()}
          {renderPageDirectory()}
          <section className="space-y-5 rounded-2xl bg-white p-6">
            {blocks.map(renderPrdBlock)}
          </section>
        </div>
      </aside>
    );
  };


  const renderWechatPhoneSheet = () => {
    if (!showWechatPhoneSheet) return null;

    const allowPhone = () => {
      setShowWechatPhoneSheet(false);
      completeLogin();
    };

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="微信手机号授权">
        <button type="button" aria-label="关闭授权弹窗" className="absolute inset-0 cursor-default" onClick={() => setShowWechatPhoneSheet(false)} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50">
                <Sparkles size={20} />
              </div>
              <div className="text-base font-black">AI素养评价</div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-sm font-black">i</div>
          </div>

          <div className="mt-5">
            <h3 className="text-xl font-black leading-tight">申请获取并验证你的手机号</h3>
            <p className="mt-2 text-sm leading-5 text-slate-600">用户正常进行授权登录</p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl bg-gray-50">
            <button type="button" onClick={allowPhone} className="block min-h-16 w-full border-b border-gray-100 px-4 py-3 text-center active:bg-slate-100">
              <div className="text-lg font-medium">152****1332</div>
              <div className="mt-1 text-xs font-black text-slate-600">上次提供</div>
            </button>
            <button type="button" onClick={allowPhone} className="block min-h-16 w-full px-4 py-3 text-center active:bg-slate-100">
              <div className="text-lg font-medium">199****8610</div>
            </button>
          </div>

          <button type="button" onClick={() => setShowWechatPhoneSheet(false)} className="mt-4 min-h-12 w-full rounded-2xl border border-gray-200 bg-white text-base font-black active:bg-slate-100">
            不允许
          </button>
          <button type="button" className="mt-7 min-h-11 w-full text-sm font-black underline underline-offset-4">
            管理号码
          </button>
        </section>
      </div>
    );
  };

  const renderPhoneLoginSheet = () => {
    if (!showPhoneLoginSheet) return null;

    const loginByPhone = () => {
      setShowPhoneLoginSheet(false);
      completeLogin();
    };

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="手机号登录注册">
        <button type="button" aria-label="关闭手机号登录弹窗" className="absolute inset-0 cursor-default" onClick={() => setShowPhoneLoginSheet(false)} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />

          <div className="grid grid-cols-2 rounded-2xl bg-gray-50 p-1 text-sm font-black">
            <button
              type="button"
              onClick={() => setPhoneLoginTab('sms')}
              className={cx('h-10 rounded-xl', phoneLoginTab === 'sms' ? 'bg-white shadow-sm' : 'text-gray-500')}
            >
              手机号登录
            </button>
            <button
              type="button"
              onClick={() => setPhoneLoginTab('password')}
              className={cx('h-10 rounded-xl', phoneLoginTab === 'password' ? 'bg-white shadow-sm' : 'text-gray-500')}
            >
              账号登录
            </button>
          </div>

          <div className="mt-5 space-y-3">
            <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
              手机号
              <input className="mt-2 h-11 w-full border border-gray-200 bg-white px-3 text-sm font-normal" inputMode="tel" placeholder="请输入手机号" />
            </label>

            {phoneLoginTab === 'sms' ? (
              <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
                验证码
                <div className="mt-2 flex gap-2">
                  <input className="h-11 min-w-0 flex-1 border border-gray-200 bg-white px-3 text-sm font-normal" inputMode="numeric" placeholder="请输入验证码" />
                  <button type="button" className="h-11 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-xs font-black">
                    获取验证码
                  </button>
                </div>
              </label>
            ) : (
              <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
                密码
                <input className="mt-2 h-11 w-full border border-gray-200 bg-white px-3 text-sm font-normal" type="password" placeholder="请输入密码" />
              </label>
            )}
          </div>

          <button type="button" onClick={loginByPhone} className="mt-5 h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">
            登录/注册
          </button>
        </section>
      </div>
    );
  };

  const renderAvatarSheet = () => {
    if (!showAvatarSheet) return null;
    const close = () => setShowAvatarSheet(false);

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="更换头像">
        <button type="button" aria-label="关闭更换头像弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">更换头像</h3>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <AvatarActionButton icon={ImagePlus} label="上传图片" onClick={close} />
            <AvatarActionButton icon={Camera} label="拍照" onClick={close} />
          </div>
          <button type="button" onClick={close} className="mt-4 h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100">取消</button>
        </section>
      </div>
    );
  };

  const renderNameSheet = () => {
    if (!showNameSheet) return null;
    const close = () => setShowNameSheet(false);
    const canSubmit = Boolean(draftTeacherName.trim());

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="修改姓名">
        <button type="button" aria-label="关闭姓名编辑弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">修改姓名</h3>
          <label className="mt-4 block text-xs font-black text-gray-600">
            姓名
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-base font-normal text-gray-950 outline-none focus:border-gray-900"
              value={draftTeacherName}
              onChange={(event) => setDraftTeacherName(event.target.value)}
              placeholder="请输入姓名"
              autoFocus
            />
          </label>
          <button
            type="button"
            onClick={submitNameSheet}
            disabled={!canSubmit}
            className={cx('mt-5 h-12 w-full rounded-2xl border border-gray-200 text-sm font-black', canSubmit ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400')}
          >
            完成
          </button>
        </section>
      </div>
    );
  };

  const renderSchoolUpgradeSheet = () => {
    if (!showSchoolUpgradeSheet) return null;
    const close = () => setShowSchoolUpgradeSheet(false);
    const features = [
      { title: '统一评价标准', desc: '按学校要求定制五育指标，让不同班级使用同一套评价口径。' },
      { title: '统一数据管理', desc: '全校师生批量导入，班级、学生、任课信息集中维护。' },
      { title: '更高额度 AI 使用', desc: '支持更多老师高频记录、识别奖状和生成报告。' },
      { title: '更完整的成长报告', desc: '面向学生、班级和学校，输出更细、更有针对性的分析。' },
    ];

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="升级学校版">
        <button type="button" aria-label="关闭学校版介绍弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'max-h-[86%] overflow-y-auto rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <div>
            <h3 className="text-lg font-black">学校版</h3>
            <p className="mt-2 text-sm font-medium leading-6 text-gray-600">适合学校统一推进评价标准、师生数据和成长报告。</p>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2 rounded-3xl bg-gray-50 p-3 text-center">
            {['统一指标', '统一数据', '统一报告'].map((item) => (
              <div key={item} className="rounded-2xl bg-white px-2 py-3 text-xs font-black">{item}</div>
            ))}
          </div>

          <div className="mt-4 space-y-2">
            {features.map((item, index) => (
              <div key={item.title} className="flex gap-3 rounded-2xl bg-gray-50 p-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-black">{index + 1}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black leading-5">{item.title}</span>
                  <span className="mt-1 block text-xs font-medium leading-5 text-gray-600">{item.desc}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 rounded-3xl bg-gray-50 p-4 text-center">
            <div className="mx-auto grid h-32 w-32 grid-cols-5 gap-1 rounded-2xl bg-white p-3" aria-label="顾问微信二维码占位">
              {Array.from({ length: 25 }).map((_, index) => (
                <span key={index} className={cx('rounded-[3px]', [0, 1, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20, 21, 23, 24].includes(index) ? 'bg-gray-900' : 'bg-gray-200')} />
              ))}
            </div>
            <div className="mt-3 text-center text-sm font-black">顾问微信二维码</div>
            <div className="mt-1 text-xs font-medium text-gray-500">了解学校整体开通方案</div>
          </div>

          <button type="button" onClick={close} className="mt-4 h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100">关闭</button>
        </section>
      </div>
    );
  };

  const renderTeachingSheet = () => {
    if (!showTeachingSheet) return null;
    const close = () => setShowTeachingSheet(false);
    const gradeOptions: TeachingGrade[] = ['2025级', '2024级', '2023级'];
    const classOptions = Array.from({ length: 12 }).map((_, index) => `${teachingGrade}${index + 1}班`);
    const subjectOptions = ['语文', '数学', '英语', '音乐', '体育', '美术'];

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="配置任教信息">
        <button type="button" aria-label="关闭任教信息弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'flex max-h-[86%] flex-col rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">{editingTeachingIndex === null ? '新增任教信息' : `编辑任教信息 ${editingTeachingIndex + 1}`}</h3>

          <div className="mt-4 min-h-0 flex-1 space-y-4">
            <div className="overflow-hidden rounded-2xl bg-gray-50">
              <div className="grid h-80 grid-cols-[92px_1fr]">
                <div className="border-r border-gray-200 bg-gray-100 p-2">
                  {gradeOptions.map((item) => (
                    <button
                      key={item}
                      type="button"
                      onClick={() => selectTeachingGrade(item)}
                      className={cx('mb-2 h-11 w-full rounded-xl text-[13px] font-normal last:mb-0', teachingGrade === item ? 'bg-gray-900 text-white' : 'bg-white text-gray-600')}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <div className="flex min-w-0 flex-col p-3">
                  <div className="min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 touch-pan-y">
                    {classOptions.map((item) => {
                      const selected = teachingSelectedClasses.includes(item);
                      return (
                        <button
                          key={item}
                          type="button"
                          onClick={() => toggleTeachingClass(item)}
                          className={cx('flex min-h-12 w-full items-center gap-2 rounded-xl border border-gray-200 px-3 text-left', selected ? 'bg-gray-900 text-white' : 'bg-white')}
                        >
                          <span className={cx('flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-black', selected ? 'border-white bg-white text-gray-900' : 'border-gray-300 text-transparent')}>✓</span>
                          <span className="min-w-0 flex-1 truncate text-[13px] font-normal">{item}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 p-3">
              <div className="text-xs font-black text-gray-500">选择学科</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {subjectOptions.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => setTeachingSubject(item)}
                    className={cx('h-10 rounded-xl border border-gray-200 text-xs font-black', teachingSubject === item ? 'bg-gray-900 text-white' : 'bg-white')}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button type="button" onClick={submitTeachingSheet} disabled={teachingSelectedClasses.length === 0} className={cx('mt-5 h-12 w-full rounded-2xl border border-gray-200 text-sm font-black', teachingSelectedClasses.length > 0 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400')}>提交</button>
        </section>
      </div>
    );
  };

  const renderPhonePage = () => {
    if (page === 'login') {
      return (
        <>
          <header className="flex h-16 items-center justify-center border-b border-gray-100 bg-white px-4">
            <h2 className="text-base font-black">AI素养评价</h2>
          </header>
          <div className="flex min-h-[calc(100%-64px)] flex-col p-5">
            <div className="flex flex-1 flex-col items-center justify-center text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100">
                <Sparkles size={34} />
              </div>
              <h3 className="mt-6 text-2xl font-black">欢迎使用 AI素养评价</h3>
            </div>
            <div className="space-y-3 pb-3">
              <button type="button" onClick={() => setShowWechatPhoneSheet(true)} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">微信授权登录</button>
              <button type="button" onClick={() => { setPhoneLoginTab('sms'); setShowPhoneLoginSheet(true); }} className="h-12 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black">手机号登录/注册</button>
              <label className="flex items-center justify-center gap-2 text-[11px] leading-5">
                <input type="checkbox" defaultChecked className="h-4 w-4 accent-black" />
                <span>我已阅读并同意《隐私保护指引》</span>
              </label>
            </div>
          </div>
        </>
      );
    }

    if (page === 'profile') {
      return (
        <>
          <ScreenHeader title="完善信息" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1">
              <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
                姓名
                <input
                  value={teacherName}
                  onChange={(event) => setTeacherName(event.target.value)}
                  className="mt-2 h-11 w-full border border-gray-200 px-2 text-sm font-normal"
                  placeholder="请输入姓名"
                />
              </label>
            </div>
            <button
              type="button"
              disabled={!teacherName.trim()}
              onClick={() => navigate('home')}
              className={cx(
                'h-12 w-full rounded-2xl border border-gray-200 text-sm font-black',
                teacherName.trim() ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
              )}
            >
              进入体验
            </button>
          </div>
        </>
      );
    }

    if (page === 'home') {
      const hasStudents = studentCount > 0 || joinedClassHasStudents;
      const stepsDone = classCreated && hasStudents && recordCount > 0;
      const currentStep = !classCreated ? 'class' : !hasStudents ? 'student' : recordCount === 0 ? 'record' : 'done';
      const displayName = teacherName.trim() || '老师';

      return (
        <>
          <header className="flex h-16 items-center justify-center border-b border-gray-100 bg-white px-4">
            <h2 className="text-base font-black">记录</h2>
          </header>
          <div className="space-y-3 p-5 pb-28">
            {!stepsDone ? (
              <>
                <div className="rounded-3xl bg-gray-50 p-4">
                  <div className="text-base font-black leading-6">
                    {displayName}老师，完成一次 AI 评价体验
                  </div>
                  <div className="mt-1 text-sm font-medium leading-5 text-gray-600">
                    先获得班级并确认学生，再记录一条日常行为。
                  </div>
                </div>
                <div className="space-y-2">
                  <div className={cx('relative flex items-stretch gap-3 rounded-2xl p-3', classCreated ? 'bg-gray-100 text-gray-400' : currentStep === 'class' ? 'bg-gray-50' : 'bg-white')}>
                    <TimelineRail>
                      <StepNumber done={classCreated} active={currentStep === 'class'} index={1} />
                    </TimelineRail>
                    <div className="min-w-0 flex-1">
                      <div className="flex min-h-10 items-center gap-3">
                        <div className="min-w-0 flex-1 text-sm font-black leading-5">1. 获得班级</div>
                        {classCreated && <span className="text-xs font-medium">已完成</span>}
                      </div>
                      {!classCreated && (
                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <ClassEntryCard type="create" onClick={() => navigate('classCreate')} />
                          <ClassEntryCard type="join" onClick={() => navigate('classJoin')} />
                        </div>
                      )}
                    </div>
                  </div>
                  <TaskRow done={hasStudents} active={currentStep === 'student'} index={2} label="2. 确认学生" action="去添加" onClick={openStudentAdd} />
                  <TaskRow done={recordCount > 0} active={currentStep === 'record'} index={3} label="3. 完成首次记录" action="去记录" onClick={() => navigate('record')} isLast />
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs">
                  <button className="rounded-xl bg-gray-50 px-3 py-2">查看默认指标</button>
                  <button className="rounded-xl bg-gray-50 px-3 py-2">本周</button>
                </div>
                <button type="button" onClick={() => navigate('aiResult')} className="w-full rounded-3xl bg-gray-50 p-4 text-left text-xs">
                  <div className="font-black">今天 10:20</div>
                  <div className="mt-2 rounded-xl border border-dashed border-gray-200 p-2">原始语音 + 转文字：1班1号和2号主动打扫卫生。</div>
                  <div className="mt-2 rounded-xl bg-white p-2">AI解读：2名学生｜劳育｜+3</div>
                </button>
              </>
            )}
          </div>
          {stepsDone && (
            <div className="absolute inset-x-5 bottom-20 grid h-14 grid-cols-[1fr_2fr_1fr] gap-2 rounded-2xl bg-white p-2 text-xs font-black shadow-[0_-8px_28px_rgba(15,23,42,0.06)]">
              <button type="button" onClick={() => navigate('photoAward')} className="rounded-xl bg-gray-50"><Camera size={16} className="mx-auto" />拍照</button>
              <button type="button" onMouseDown={startVoice} onMouseUp={finishVoice} onTouchStart={startVoice} onTouchEnd={finishVoice} className="rounded-xl bg-gray-950 text-white"><Mic size={16} className="mx-auto" />按住说话</button>
              <button type="button" onClick={() => navigate('textInput')} className="rounded-xl bg-gray-50"><Type size={16} className="mx-auto" />文字</button>
            </div>
          )}
          <BottomNav />
        </>
      );
    }

    if (page === 'classCreate') {
      return (
        <>
          <ScreenHeader title="创建班级" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-3">
              <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
                学段
                <select
                  value={schoolStage}
                  onChange={(event) => setSchoolStage(event.target.value)}
                  className="mt-2 h-11 w-full border border-gray-200 bg-white px-2 text-sm font-normal"
                >
                  <option value="">请选择学段</option>
                  <option value="小学">小学</option>
                  <option value="初中">初中</option>
                  <option value="高中">高中</option>
                </select>
              </label>

              <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
                入学年份
                <select
                  value={entryYear}
                  onChange={(event) => setEntryYear(event.target.value)}
                  className="mt-2 h-11 w-full border border-gray-200 bg-white px-2 text-sm font-normal"
                >
                  <option value="">请选择入学年份</option>
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                </select>
              </label>

              {schoolStage && entryYear && (
                <div className="rounded-2xl bg-gray-50 p-3 text-xs font-black">
                  班级名称
                  {isCustomClassName ? (
                    <div className="mt-2 flex items-center gap-2">
                      <input
                        value={customClassName}
                        onChange={(event) => setCustomClassName(event.target.value)}
                        className="h-11 min-w-0 flex-1 border border-gray-200 bg-white px-3 text-sm font-normal"
                        aria-label="自定义班级名称"
                      />
                      <button
                        type="button"
                        className="h-11 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-xs font-black"
                      >
                        自定义名称
                      </button>
                    </div>
                  ) : (
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex h-11 min-w-0 flex-1 items-center gap-2 bg-white px-3 text-sm font-normal">
                        <span>{entryYear}级</span>
                        <input
                          value={classNumber}
                          onChange={(event) => setClassNumber(event.target.value.replace(/[^0-9]/g, ''))}
                          className="h-8 w-14 border border-gray-200 text-center"
                          inputMode="numeric"
                          aria-label="班级数字"
                        />
                        <span>班</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setCustomClassName(classDisplayName || defaultClassName);
                          setIsCustomClassName(true);
                        }}
                        className="h-11 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-xs font-black"
                      >
                        自定义名称
                      </button>
                    </div>
                  )}
                </div>
              )}

            </div>

            <button
              type="button"
              disabled={!canSaveClass}
              onClick={() => {
                if (!canSaveClass) return;
                setClassCreated(true);
                setJoinedClassHasStudents(false);
                openStudentAdd();
              }}
              className={cx(
                'h-12 w-full rounded-2xl border border-gray-200 text-sm font-black',
                canSaveClass ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
              )}
            >
              保存并添加学生
            </button>
          </div>
        </>
      );
    }

    if (page === 'classJoin') {
      const joinClassAndGo = () => {
        if (!canJoinClass) return;
        setClassCreated(true);
        setJoinedClassHasStudents(true);
        navigate('home');
      };

      return (
        <>
          <ScreenHeader title="加入班级" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-3">
              <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
                班级号
                <input
                  value={classCode}
                  onChange={(event) => setClassCode(event.target.value.replace(/[^0-9]/g, '').slice(0, 8))}
                  className="mt-2 h-11 w-full border border-gray-200 bg-white px-3 text-sm font-normal"
                  placeholder="输入8位班级号"
                  inputMode="numeric"
                  maxLength={8}
                  aria-label="班级号"
                />
              </label>
            </div>
            <button
              type="button"
              disabled={!canJoinClass}
              onClick={joinClassAndGo}
              className={cx(
                'h-12 w-full rounded-2xl border border-gray-200 text-sm font-black',
                canJoinClass ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
              )}
            >
              加入班级
            </button>
          </div>
        </>
      );
    }

    if (page === 'studentAdd') {
      return (
        <>
          <ScreenHeader title="添加学生" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              {Array.from({ length: studentInputRows }).map((_, index) => {
                const selectedGender = studentInputGenders[index] || '男';
                return (
                <div key={index} className="rounded-2xl bg-gray-50 p-3 text-xs font-black">
                  <div className="flex items-center gap-2">
                    <input className="h-11 min-w-0 flex-1 border border-gray-200 bg-white px-2 text-sm font-normal" placeholder="姓名" />
                    <input className="h-11 w-20 shrink-0 border border-gray-200 bg-white px-2 text-sm font-normal" placeholder="学号" />
                    <div className="grid h-11 w-20 shrink-0 grid-cols-2 gap-1 text-xs font-black">
                      <button type="button" onClick={() => updateStudentInputGender(index, '男')} className={cx('rounded-xl border border-gray-200', selectedGender === '男' ? 'bg-gray-900 text-white' : 'bg-white')}>男</button>
                      <button type="button" onClick={() => updateStudentInputGender(index, '女')} className={cx('rounded-xl border border-gray-200', selectedGender === '女' ? 'bg-gray-900 text-white' : 'bg-white')}>女</button>
                    </div>
                  </div>
                </div>
                );
              })}
              <button
                type="button"
                onClick={addStudentInputRow}
                className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black"
              >
                添加一名
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                setClassCreated(true);
                setStudentCount((count) => Math.max(count, studentInputRows));
                navigate('record');
              }}
              className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white"
            >
              完成
            </button>
          </div>
        </>
      );
    }

    if (page === 'record') {
      return (
        <>
          <ScreenHeader title="记录" />
          <div className="space-y-3 p-5 pb-28">
            <div className="flex gap-2 text-xs"><button className="rounded-xl bg-gray-50 px-3 py-2">查看默认指标</button><button className="rounded-xl bg-gray-50 px-3 py-2">AI说明</button></div>
            {recordCount === 0 ? (
              <div className="rounded-3xl border border-dashed border-gray-200 p-8 text-center text-sm font-black">试着说一句或输入一句</div>
            ) : (
              <button type="button" onClick={() => navigate('aiResult')} className="w-full rounded-3xl bg-gray-50 p-4 text-left text-xs">
                <div className="font-black">今天 10:20</div>
                <div className="mt-2 rounded-xl border border-dashed border-gray-200 p-2">原始语音 + 转文字：1班1号和2号主动打扫卫生。</div>
                <div className="mt-2 rounded-xl bg-gray-50 p-2">AI解读：2名学生｜劳育｜+3</div>
              </button>
            )}
          </div>
          <div className="absolute inset-x-5 bottom-20 grid h-14 grid-cols-[1fr_2fr_1fr] gap-2 rounded-2xl bg-white p-2 text-xs font-black">
            <button type="button" onClick={() => navigate('photoAward')} className="rounded-xl bg-gray-50"><Camera size={16} className="mx-auto" />拍照</button>
            <button type="button" onMouseDown={startVoice} onMouseUp={finishVoice} onTouchStart={startVoice} onTouchEnd={finishVoice} className="rounded-xl bg-gray-950 text-white"><Mic size={16} className="mx-auto" />按住说话</button>
            <button type="button" onClick={() => navigate('textInput')} className="rounded-xl bg-gray-50"><Type size={16} className="mx-auto" />文字</button>
          </div>
          {recordStage !== 'idle' && (
            <div className="absolute inset-x-8 bottom-40 rounded-2xl bg-white p-3 text-center text-xs font-black shadow-[0_12px_32px_rgba(0,0,0,0.12)]">
              {recordStage === 'recording' && '录音中：松手提交，上滑取消'}
              {recordStage === 'transcribing' && '语音转文字中...'}
              {recordStage === 'identifying' && 'AI识别时间、对象、指标、加减分...'}
              {recordStage === 'saved' && '已入库'}
              {recordStage === 'recording' && <button onClick={cancelVoice} className="ml-2 underline">取消</button>}
            </div>
          )}
          <BottomNav />
        </>
      );
    }

    if (page === 'textInput') {
      return (
        <>
          <ScreenHeader title="文字记录" sub="支持一句话多个学生" />
          <div className="space-y-3 p-5">
            <textarea className="h-40 w-full rounded-2xl bg-gray-50 p-3 text-sm" defaultValue="1班1号和2号今天主动打扫卫生。" />
            <div className="rounded-2xl border border-dashed border-gray-200 p-3 text-xs">示例：王小明帮助同学整理图书角。</div>
            <button type="button" onClick={() => { setRecordCount((count) => count + 2); setShowMultiResult(true); navigate('aiResult'); }} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">提交识别</button>
          </div>
        </>
      );
    }

    if (page === 'photoAward') {
      return (
        <>
          <ScreenHeader title="拍照识别奖状" />
          <div className="space-y-3 p-5">
            <div className="flex h-64 items-center justify-center rounded-3xl border border-dashed border-gray-200 text-sm font-black">奖状图片预览区</div>
            <button type="button" onClick={() => { setRecordCount((count) => count + 1); navigate('aiResult'); }} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">拍照识别</button>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-xs font-black">从相册选择</button>
          </div>
        </>
      );
    }

    if (page === 'aiResult') {
      return (
        <>
          <ScreenHeader title="AI识别结果" sub="已入库，可直接修正" />
          <div className="space-y-3 p-5 pb-20">
            <div className="rounded-2xl border border-dashed border-gray-200 p-3 text-xs">原始输入：1班1号和2号主动打扫卫生。</div>
            <AiResultCard />
            {showMultiResult && <AiResultCard second />}
            <button type="button" onClick={() => navigate('record')} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">继续记录</button>
            <button type="button" onClick={() => navigate('classReport')} className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-xs font-black">查看班级统计</button>
          </div>
        </>
      );
    }

    if (page === 'editResult') {
      return (
        <>
          <ScreenHeader title="编辑识别结果" sub="修改立即生效" />
          <div className="space-y-3 p-5">
            {['事件时间：今天 10:20', '识别对象：王小明｜20250101', '五育指标：劳育-劳动习惯-主动劳动', '加分/减分：加分 +2', 'AI评语：主动参与班级劳动'].map((item) => (
              <button key={item} type="button" className="flex w-full items-center justify-between rounded-2xl bg-gray-50 p-3 text-left text-xs font-black">
                {item}<ChevronRight size={16} />
              </button>
            ))}
            <div className="rounded-2xl border border-dashed border-gray-200 p-3 text-xs">同步状态：已生效 / 保存中 / 待同步 / 同步失败</div>
            <button type="button" onClick={() => navigate('aiResult')} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">保存修改</button>
          </div>
        </>
      );
    }

    if (page === 'classList') {
      return (
        <>
          <TabHeader title="班级" />
          <div className="space-y-3 p-5 pb-24">
            <div className="grid grid-cols-2 gap-3">
              <ClassEntryCard type="create" onClick={() => navigate('classCreate')} />
              <ClassEntryCard type="join" onClick={() => navigate('classJoin')} />
            </div>
            <ClassCard name="2025级1班" code="58273914" stage="小学" entryYearValue={2025} tags={['班主任', '语文']} count={2} />
            <ClassCard name="2024级2班" code="73948162" stage="初中" entryYearValue={2024} tags={['数学']} count={0} />
          </div>
          <BottomNav />
        </>
      );
    }

    if (page === 'studentList') {
      const toggleStudentSelection = (studentNo: string) => {
        setSelectedStudentNos((items) => (
          items.includes(studentNo) ? items.filter((item) => item !== studentNo) : [...items, studentNo]
        ));
      };
      const visibleStudentNos = visibleStudentRows.map((student) => student.no);
      const allVisibleSelected = visibleStudentNos.length > 0 && visibleStudentNos.every((no) => selectedStudentNos.includes(no));
      const toggleSelectAllVisible = () => {
        setSelectedStudentNos((items) => {
          if (allVisibleSelected) return items.filter((no) => !visibleStudentNos.includes(no));
          return Array.from(new Set([...items, ...visibleStudentNos]));
        });
      };

      return (
        <>
          <StudentListHeader />
          <div className="flex h-[calc(100%-64px)] flex-col pb-20">
            {studentListMode === 'student' ? (
              <div className="flex-1 overflow-y-auto p-5">
                <div className="rounded-2xl bg-gray-50 p-3">
                  {studentSelectionMode ? (
                    <div className="grid grid-cols-4 gap-2 text-xs font-black">
                      <button type="button" onClick={toggleSelectAllVisible} className="h-11 rounded-xl border border-gray-200 bg-white">
                        {allVisibleSelected ? '取消全选' : '全选'}
                      </button>
                      {(['男', '女'] as const).map((gender) => (
                        <button
                          key={gender}
                          type="button"
                          onClick={() => setStudentGenderFilter(gender)}
                          className={cx('h-11 rounded-xl border border-gray-200', studentGenderFilter === gender ? 'bg-gray-900 text-white' : 'bg-white')}
                        >
                          {gender}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => {
                          setStudentSelectionMode(false);
                          setStudentGenderFilter('all');
                          setSelectedStudentNos([]);
                        }}
                        className="h-11 rounded-xl border border-gray-200 bg-white"
                      >
                        取消
                      </button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        value={studentSearch}
                        onChange={(event) => setStudentSearch(event.target.value)}
                        className="h-11 min-w-0 flex-1 border border-gray-200 bg-white px-3 text-sm font-normal"
                        placeholder="搜索姓名/学号"
                        aria-label="搜索学生"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setStudentSelectionMode(true);
                          setStudentGenderFilter('all');
                          setSelectedStudentNos([]);
                        }}
                        className="h-11 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-xs font-black"
                      >
                        多选
                      </button>
                    </div>
                  )}
                </div>

                <button type="button" onClick={openStudentAdd} className="mt-3 h-11 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">新增学生</button>

                {visibleStudentRows.length === 0 ? (
                  <div className="mt-3 rounded-2xl border border-dashed border-gray-200 p-5 text-center text-xs text-gray-500">暂无匹配学生</div>
                ) : (
                  <div className="mt-3 grid grid-cols-3 gap-3">
                    {visibleStudentRows.map((student) => {
                      const selected = selectedStudentNos.includes(student.no);
                      return (
                        <button
                          key={student.no}
                          type="button"
                          onClick={() => studentSelectionMode ? toggleStudentSelection(student.no) : navigate('studentDetail')}
                          className={cx('relative min-h-32 rounded-2xl bg-gray-50 p-3 text-center', selected && 'ring-2 ring-gray-900')}
                        >
                          {studentSelectionMode && <span className="absolute right-2 top-2 flex h-5 w-5 items-center justify-center rounded-full border border-gray-300 bg-white text-[10px] font-black">{selected ? '✓' : ''}</span>}
                          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-base font-black">{student.name.slice(-1)}</div>
                          <div className="mt-1 flex justify-center">
                            <span className="rounded-md bg-white px-1.5 py-0.5 text-[10px] font-black">{student.gender}</span>
                          </div>
                          <div className="mt-2 truncate text-sm font-black">{student.name}</div>
                          <div className="mt-1 truncate text-[10px] font-medium text-gray-500">{student.no}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 overflow-y-auto p-5">
                <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">新增分组</button>
                <div className="mt-3 space-y-2">
                  {['第一组｜王小明、李小红', '第二组｜陈一诺、周子航'].map((item, index) => (
                    <button key={item} type="button" className="w-full rounded-2xl bg-gray-50 p-4 text-left text-sm font-black">
                      {index + 1}. {item}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </>
      );
    }

    if (page === 'studentDetail') {
      return (
        <>
          <ScreenHeader title="王小明" sub="20250101｜男｜2025级1班" />
          <div className="space-y-3 p-5">
            <div className="grid grid-cols-3 gap-2 text-center text-xs font-black"><div className="rounded-2xl bg-gray-50 p-3">总记录<br />12</div><div className="rounded-2xl bg-gray-50 p-3">加分<br />10</div><div className="rounded-2xl bg-gray-50 p-3">减分<br />2</div></div>
            <button onClick={() => navigate('record')} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">为该学生记录</button>
            <button onClick={() => navigate('termReport')} className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-xs font-black">生成月度报告</button>
          </div>
        </>
      );
    }

    if (page === 'classReport') {
      return (
        <>
          <ScreenHeader title="班级统计报告" sub="有记录即可统计" />
          <div className="space-y-3 p-5">
            <div className="grid grid-cols-2 gap-2 text-center text-xs font-black"><div className="rounded-2xl bg-gray-50 p-3">记录总数<br />{recordCount}</div><div className="rounded-2xl bg-gray-50 p-3">覆盖学生<br />2</div><div className="rounded-2xl bg-gray-50 p-3">加分记录<br />2</div><div className="rounded-2xl bg-gray-50 p-3">减分记录<br />0</div></div>
            <div className="rounded-2xl bg-gray-50 p-3 text-xs">五育指标分布：劳育 2 / 德育 0 / 智育 0 / 体育 0 / 美育 0</div>
            <button type="button" onClick={() => navigate('termReport')} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">生成月度/期末AI报告</button>
          </div>
        </>
      );
    }

    if (page === 'termReport') {
      return (
        <>
          <ScreenHeader title="AI成长报告" sub="月度/期末" />
          <div className="space-y-3 p-5">
            <div className="rounded-2xl bg-gray-50 p-3 text-xs">生成条件：当前 {recordCount} 条日常行为记录。</div>
            <div className="rounded-3xl border border-dashed border-gray-200 p-5 text-xs leading-6">AI 报告内容区：总结 / 五育表现 / 亮点 / 待提升方向 / 建议。</div>
            <button type="button" className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">生成报告</button>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-xs font-black">复制报告</button>
          </div>
        </>
      );
    }

    if (page === 'mine') {
      return (
        <>
          <TabHeader title="我的" />
          <div className="space-y-3 p-5 pb-24">
            <div className="rounded-3xl bg-gray-50 p-4">
              <div className="flex items-center gap-3">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-black">郭</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-base font-black">郭老师</div>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-lg bg-white px-2 py-1 text-xs font-black">个人版</span>
                  </div>
                </div>
                <button type="button" onClick={() => navigate('profileEdit')} className="h-10 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-xs font-black">编辑</button>
              </div>
            </div>

            <button type="button" onClick={() => setShowSchoolUpgradeSheet(true)} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">升级学校版</button>

            <div className="overflow-hidden rounded-2xl bg-gray-50">
              {['修改密码', '隐私协议', '用户协议'].map((item) => (
                <button key={item} type="button" className="flex h-12 w-full items-center justify-between border-b border-white px-4 text-left text-sm font-black last:border-b-0">
                  <span>{item}</span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>

            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black">退出登录</button>
          </div>
          <BottomNav />
        </>
      );
    }

    if (page === 'profileEdit') {
      const teachingSamples = [
        { classes: ['2025级1班', '2025级2班'], subject: '英语' },
        { classes: ['2023级1班'], subject: '音乐' },
      ];
      const classOptions = ['2025级1班', '2025级2班', '2023级1班'];
      const subjectOptions = ['语文', '数学', '英语', '音乐', '体育', '美术'];

      return (
        <>
          <ScreenHeader title="个人信息" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-4 overflow-y-auto pb-4">
              <section className="rounded-3xl bg-gray-50 p-5">
                <div className="flex flex-col items-center">
                  <div className="relative">
                    <button type="button" onClick={() => setShowAvatarSheet(true)} className="flex h-24 w-24 items-center justify-center rounded-full border-4 border-white bg-gray-200 text-2xl font-black shadow-sm active:bg-gray-300" aria-label="更换头像">郭</button>
                    <button type="button" onClick={() => setShowAvatarSheet(true)} className="absolute -bottom-1 -right-1 flex h-11 w-11 items-center justify-center rounded-full border-4 border-white bg-gray-900 text-white active:bg-gray-700" aria-label="更换头像">
                      <Camera size={18} />
                    </button>
                  </div>
                </div>
              </section>

              <button type="button" onClick={openNameSheet} className="flex min-h-14 w-full items-center justify-between rounded-2xl bg-gray-50 px-4 text-left active:bg-gray-100">
                <span className="text-sm font-normal text-gray-500">姓名</span>
                <span className="flex min-w-0 items-center gap-2">
                  <span className="max-w-40 truncate text-sm font-black text-gray-950">{teacherName.trim() || '郭老师'}</span>
                  <ChevronRight size={18} className="shrink-0 text-gray-400" />
                </span>
              </button>

              <section className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <FormSectionTitle title="任教信息" />
                  <button type="button" onClick={openTeachingCreate} className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-black active:bg-gray-100">新增</button>
                </div>
                {Array.from({ length: teachingRows }).map((_, index) => {
                  const sample = teachingSamples[index] || { classes: ['2025级1班'], subject: '语文' };
                  return (
                    <div key={index} className="relative rounded-2xl bg-gray-50 p-4">
                      <button type="button" onClick={() => openTeachingEdit(index)} className="block w-full text-left active:opacity-70">
                        <div className="flex items-center gap-2 pr-10">
                          <div className="text-lg font-black">{sample.subject}</div>
                          <span className="rounded-xl bg-white px-2.5 py-1 text-xs font-black text-gray-700">{sample.classes.length} 个班</span>
                        </div>
                        <div className="mt-3 text-sm font-medium leading-5 text-gray-600">{sample.classes.join('、')}</div>
                      </button>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          removeTeachingRow(index);
                        }}
                        className="absolute right-3 top-4 flex h-10 w-10 items-center justify-center rounded-xl text-gray-400 active:bg-white"
                        aria-label={`删除任教信息 ${index + 1}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  );
                })}
              </section>
            </div>
          </div>
        </>
      );
    }

    if (page === 'advisor') {
      return (
        <>
          <ScreenHeader title="顾问联系方式" sub="需要时主动联系" />
          <div className="space-y-3 p-5">
            <div className="rounded-3xl bg-gray-50 p-5 text-center text-sm font-black">顾问微信二维码占位</div>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black">复制微信</button>
            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black">拨打电话</button>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <main className="flex h-[100dvh] w-screen overflow-hidden bg-white text-gray-950">
      <section
        className="flex h-full w-full shrink-0 items-center justify-center bg-white p-4 lg:w-auto"
        style={{ width: `min(${prototypeWidth}%, 100%)` }}
      >
        {renderPrototypePanel()}
      </section>
      <button
        type="button"
        aria-label="拖动调整原型区和PRD区宽度"
        onPointerDown={handleResizeStart}
        onPointerMove={handleResizeMove}
        onPointerUp={handleResizeEnd}
        onPointerCancel={handleResizeEnd}
        className="hidden h-full w-2 shrink-0 cursor-col-resize items-center justify-center bg-gray-100 transition-colors active:bg-gray-200 lg:flex"
      >
        <span className="h-12 w-1 rounded-full bg-gray-300" />
      </button>
      {renderPrdPanel()}
    </main>
  );
};

export default TeacherCMobileLowFi;
