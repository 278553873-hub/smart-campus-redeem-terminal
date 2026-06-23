import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowLeftRight, BookOpen, Building2, CalendarDays, Camera, ChartNoAxesColumnIncreasing, CheckCircle2, ChevronDown, ChevronRight, CircleHelp, Clock, Coins, Copy, Edit3, Eye, EyeOff, FileText, Gift, GripVertical, ImagePlus, KeyRound, LogIn, LogOut, MessageCircle, Mic, MoreHorizontal, Phone, Plus, ScanFace, ScanLine, Settings, Shield, Sparkles, Trash2, Type, UserPlus, Users } from 'lucide-react';
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
  | 'classListPersonal'
  | 'classListSchool'
  | 'classDetail'
  | 'classDetailMember'
  | 'classDetailSchoolHead'
  | 'teacherList'
  | 'teacherListMember'
  | 'parentBindingList'
  | 'studentList'
  | 'studentBatchEdit'
  | 'studentDetail'
  | 'classReport'
  | 'termReport'
  | 'minePersonal'
  | 'mineSchool'
  | 'teacherBasicInfoPersonal'
  | 'teacherBasicInfoSchool'
  | 'mineSettings'
  | 'termManagement'
  | 'subjectManagement'
  | 'departmentManagement'
  | 'coinIssuanceManagement'
  | 'advisor';

type ViewState = 'normal' | 'loading' | 'empty' | 'network' | 'denied';
type RecordStage = 'idle' | 'recording' | 'transcribing' | 'identifying' | 'saved';
type Priority = 'P0' | 'P1' | 'P2' | 'P3';
type PhoneLoginTab = 'sms' | 'password';
type ClassActionKey = 'reward' | 'batchStudents' | 'password' | 'face' | 'homework' | 'leftStudents' | 'inviteTeacher' | 'inviteParent' | 'editClass';
type TeachingGrade = '2025级' | '2024级' | '2023级';
type WechatInviteMode = 'select' | 'confirm' | 'received';
type InviteAudience = 'teacher' | 'parent';
type CEndSurface = 'summary' | 'teacher' | 'parent' | 'versionCompare' | 'schoolAdmin' | 'ops';
type ParentPageKey = 'wechatCard' | 'login' | 'bindSelfMatched' | 'bindSelfUnmatched' | 'bindInviteMatched' | 'bindInviteUnmatched' | 'bindInviteBoundUnmatched' | 'bindingLimitNotice' | 'bindingNotice' | 'parentIdentity' | 'landing';
type ParentBindMode = 'school' | 'class';
type ParentIdentityRelation = '家长' | '爸爸' | '妈妈' | '爷爷' | '奶奶' | '外公' | '外婆' | '其他';
type TeacherSpaceId = 'personal' | 'schoolA' | 'schoolB';
type SchoolBasicInfoTab = 'term' | 'subject' | 'department';
type CoinIssuePeriod = 'weekly' | 'monthly';
type SchoolClassGradeFilter = '全部' | '一年级' | '二年级' | '三年级' | '四年级' | '五年级' | '六年级' | '初一' | '初二' | '初三' | '高一' | '高二' | '高三';
type TeacherBasicConfigKey = 'headClass' | 'gradeLeader' | 'department';
type TeachingInfoRow = {
  id: number;
  subject: string;
  classes: string[];
};
type TeacherSpaceProfile = {
  id: TeacherSpaceId;
  title: string;
  type: 'personal' | 'school';
};
type ClassProfile = {
  name: string;
  code: string;
  stage: '小学' | '初中' | '高中';
  entryYearValue: number;
  count: number;
  creatorName: string;
  isCreator: boolean;
};
type ClassTeacherProfile = {
  name: string;
  subjects: string[];
  isHeadTeacher: boolean;
  isDeputyHeadTeacher: boolean;
};
type ParentBindingProfile = {
  name: string;
  no: string;
  gender: '男' | '女';
  reservedPhone?: string;
  guardians: Array<{
    id: string;
    phone: string;
    phoneTail: string;
    relation: ParentIdentityRelation;
    relationOther?: string;
  }>;
};
type ActiveParentBindingCandidate = {
  studentName: string;
  guardianId: string;
  guardianLabel: string;
  phone: string;
  relation: ParentIdentityRelation;
  relationOther: string;
};
type StudentInputRow = {
  id: number;
  name: string;
  no: string;
  gender: '男' | '女';
};
type SchoolBasicInfoItem = {
  id: string;
  name: string;
  desc: string;
  status: 'enabled' | 'disabled' | 'current' | 'draft';
};
type SchoolSubjectItem = {
  id: string;
  name: string;
};
type SchoolTermItem = {
  id: string;
  schoolYear: string;
  termType: '上学期' | '下学期';
  start: string;
  end: string;
  status: 'current' | 'draft';
};

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
  'classListPersonal',
  'classListSchool',
  'classDetail',
  'classDetailMember',
  'classDetailSchoolHead',
  'teacherList',
  'teacherListMember',
  'parentBindingList',
  'studentList',
  'studentBatchEdit',
  'studentAdd',
  'record',
  'minePersonal',
  'mineSchool',
  'teacherBasicInfoPersonal',
  'teacherBasicInfoSchool',
  'mineSettings',
  'termManagement',
  'subjectManagement',
  'departmentManagement',
  'coinIssuanceManagement',
];

type FlowBranch = { text: string; pages: PageKey[] };
type FlowLane = { title: string; pages: PageKey[]; branchGroups?: Array<{ branches: FlowBranch[] }>; tailPages?: PageKey[] };

const flowLanes: FlowLane[] = [
  { title: '登录', pages: ['login', 'profile', 'home', 'classCreate', 'classJoin', 'studentAdd', 'record'] },
  {
    title: '班级(个人版)',
    pages: ['classListPersonal'],
    branchGroups: [
      {
        branches: [
          { text: '班主任', pages: ['classDetail'] },
          { text: '非班主任', pages: ['classDetailMember'] },
        ],
      },
      {
        branches: [
          { text: '班主任', pages: ['teacherList'] },
          { text: '非班主任', pages: ['teacherListMember'] },
        ],
      },
    ],
    tailPages: ['parentBindingList', 'studentList', 'studentBatchEdit'],
  },
  {
    title: '班级(学校版)',
    pages: ['classListSchool'],
    branchGroups: [
      {
        branches: [
          { text: '班主任', pages: ['classDetailSchoolHead'] },
          { text: '非班主任', pages: ['classDetailMember'] },
        ],
      },
      {
        branches: [
          { text: '班主任', pages: ['teacherList'] },
          { text: '非班主任', pages: ['teacherListMember'] },
        ],
      },
    ],
    tailPages: ['parentBindingList', 'studentList', 'studentBatchEdit'],
  },
  { title: '我的(个人版)', pages: ['minePersonal', 'teacherBasicInfoPersonal'] },
  { title: '我的(学校版)', pages: ['mineSchool', 'teacherBasicInfoSchool', 'mineSettings', 'subjectManagement', 'departmentManagement', 'coinIssuanceManagement'] },
];

const pageNumberLabel = (pageKey: PageKey) => {
  if (pageKey === 'classListPersonal') return '07A';
  if (pageKey === 'classListSchool') return '07B';
  if (pageKey === 'classDetail') return '08A';
  if (pageKey === 'classDetailMember') return '08B';
  if (pageKey === 'classDetailSchoolHead') return '08C';
  if (pageKey === 'teacherList') return '09A';
  if (pageKey === 'teacherListMember') return '09B';
  if (pageKey === 'parentBindingList') return '10';
  if (pageKey === 'studentList') return '11';
  if (pageKey === 'studentBatchEdit') return '11A';
  if (pageKey === 'studentAdd') return '12';
  if (pageKey === 'record') return '13';
  if (pageKey === 'minePersonal') return '14A';
  if (pageKey === 'mineSchool') return '14B';
  if (pageKey === 'teacherBasicInfoPersonal') return '15A';
  if (pageKey === 'teacherBasicInfoSchool') return '15B';
  if (pageKey === 'mineSettings') return '16';
  if (pageKey === 'termManagement') return '17';
  if (pageKey === 'subjectManagement') return '18';
  if (pageKey === 'departmentManagement') return '19';
  if (pageKey === 'coinIssuanceManagement') return '21';
  const pageIndex = pageOrder.indexOf(pageKey) + 1;
  return String(pageIndex).padStart(2, '0');
};

type PathTarget =
  | { type: 'page'; page: PageKey }
  | { type: 'classInviteConfirm' }
  | { type: 'inviteWechat' }
  | { type: 'wechatChatConfirm' }
  | { type: 'wechatReceivedCard' };

const invitePathNodes: Array<{ label: string; desc: string; target: PathTarget }> = [
  { label: '收到卡片', desc: '微信聊天对话', target: { type: 'wechatReceivedCard' } },
  { label: '未登录打开', desc: '进入 01 登录页', target: { type: 'page', page: 'login' } },
  { label: '已登录已加入', desc: '进入班级页', target: { type: 'page', page: 'classListSchool' } },
  { label: '已登录未加入', desc: '班级页弹窗', target: { type: 'classInviteConfirm' } },
];

const parentPageLabels: Record<ParentPageKey, { number: string; title: string }> = {
  wechatCard: { number: '00', title: '收到卡片' },
  login: { number: '01', title: '微信登录' },
  bindSelfMatched: { number: '03A', title: '绑定学生' },
  bindSelfUnmatched: { number: '02B', title: '手机号未匹配' },
  bindInviteMatched: { number: '03A', title: '绑定学生' },
  bindInviteUnmatched: { number: '03B', title: '绑定学生' },
  bindInviteBoundUnmatched: { number: '03C', title: '绑定学生' },
  bindingLimitNotice: { number: '04B', title: '绑定提醒' },
  bindingNotice: { number: '04A', title: '绑定提醒' },
  parentIdentity: { number: '04', title: '绑定确认' },
  landing: { number: '05', title: '落地页' },
};

type ParentFlowLane =
  | { title: string; nodes: ParentFlowNode[]; branches?: never }
  | { title: string; source: ParentPageKey; branches: ParentFlowBranch[] };
type ParentFlowNode = { page: ParentPageKey; branches?: ParentFlowBranch[] };
type ParentFlowBranch = { text: string; pages: ParentFlowNode[] };

const parentFlowLanes: ParentFlowLane[] = [
  {
    title: '自主登录',
    source: 'login',
    branches: [
      { text: '未绑定任何学生&手机号匹配成功', pages: [{ page: 'bindSelfMatched' }, { page: 'landing' }] },
      { text: '未绑定任何学生&手机号未匹配', pages: [{ page: 'bindSelfUnmatched' }] },
      { text: '已绑定任何学生', pages: [{ page: 'landing' }] },
    ],
  },
  {
    title: '被邀请',
    source: 'wechatCard',
    branches: [
      {
        text: '未登录打开',
        pages: [{
          page: 'login',
          branches: [
            { text: '手机号匹配成功', pages: [{ page: 'bindInviteMatched' }, { page: 'landing' }] },
            { text: '手机号未匹配成功&未绑定该班级的任意学生', pages: [{ page: 'bindInviteUnmatched' }, { page: 'bindingNotice' }, { page: 'landing' }] },
            { text: '手机号未匹配成功&已绑定该班级的任意学生', pages: [{ page: 'bindInviteBoundUnmatched' }, { page: 'bindingNotice' }, { page: 'landing' }] },
            { text: '手机号未匹配成功&已绑定该班级的2个学生', pages: [{ page: 'bindingLimitNotice' }, { page: 'landing' }] },
          ],
        }],
      },
    ],
  },
  {
    title: '自主新增绑定',
    source: 'landing',
    branches: [
      { text: '检索到有新的绑定信息', pages: [{ page: 'bindSelfMatched' }, { page: 'landing' }] },
      { text: '未检索到新的绑定信息', pages: [{ page: 'bindSelfUnmatched' }] },
    ],
  },
];

const surfaceTabs: Array<{ key: CEndSurface; label: string }> = [
  { key: 'teacher', label: '教师端' },
  { key: 'parent', label: '家长端' },
  { key: 'schoolAdmin', label: '学校后台端' },
  { key: 'ops', label: '运营端' },
  { key: 'versionCompare', label: '版本对比' },
];

const teacherSpaces: TeacherSpaceProfile[] = [
  { id: 'personal', title: '个人版', type: 'personal' },
  { id: 'schoolA', title: '成都七中初中附属小学', type: 'school' },
  { id: 'schoolB', title: '星河实验小学', type: 'school' },
];
const defaultTeacherSpaceId: TeacherSpaceId = 'schoolB';
const TERM_REPORT_SAMPLE_IMAGE = '/assets/term-report-sample.jpg';

const schoolBasicInfoTabs: Array<{ key: SchoolBasicInfoTab; label: string; icon: React.ElementType; summary: string }> = [
  { key: 'term', label: '学期', icon: CalendarDays, summary: '当前学期、下学期时间' },
  { key: 'subject', label: '科目', icon: BookOpen, summary: '任教与成绩常用科目' },
  { key: 'department', label: '部门', icon: Building2, summary: '校内组织与管理分组' },
];
const mineMoreToolTabs = schoolBasicInfoTabs.filter((item) => item.key !== 'term');

const formatTermName = (term: Pick<SchoolTermItem, 'schoolYear' | 'termType'>) => `${term.schoolYear} ${term.termType}`;
const schoolYearOptions = ['2025-2026学年', '2026-2027学年', '2027-2028学年', '2028-2029学年'];
const termTypeOptions: SchoolTermItem['termType'][] = ['上学期', '下学期'];
const parentIdentityRelationOptions: ParentIdentityRelation[] = ['家长', '爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆', '其他'];

const schoolTermItems: SchoolTermItem[] = [
  { id: 'term-2025-2026-2', schoolYear: '2025-2026学年', termType: '下学期', start: '2026.02.17', end: '2026.07.10', status: 'current' },
  { id: 'term-2026-2027-1', schoolYear: '2026-2027学年', termType: '上学期', start: '2026.09.01', end: '2027.01.23', status: 'draft' },
  { id: 'term-2026-2027-2', schoolYear: '2026-2027学年', termType: '下学期', start: '2027.02.22', end: '2027.07.09', status: 'draft' },
  { id: 'term-2027-2028-1', schoolYear: '2027-2028学年', termType: '上学期', start: '2027.09.01', end: '2028.01.21', status: 'draft' },
  { id: 'term-2027-2028-2', schoolYear: '2027-2028学年', termType: '下学期', start: '2028.02.21', end: '2028.07.07', status: 'draft' },
];

const schoolSubjectItems: SchoolSubjectItem[] = [
    { id: 'subject-cn', name: '语文' },
    { id: 'subject-math', name: '数学' },
    { id: 'subject-en', name: '英语' },
    { id: 'subject-calligraphy', name: '书法' },
];

const schoolDepartmentItems: SchoolBasicInfoItem[] = [
    { id: 'department-moral', name: '德育处', desc: '', status: 'enabled' },
    { id: 'department-grade', name: '一年级组', desc: '', status: 'enabled' },
    { id: 'department-art', name: '艺体组', desc: '', status: 'enabled' },
];

const schoolBasicInfoStatusLabels: Record<SchoolBasicInfoItem['status'], string> = {
  current: '当前',
  draft: '未生效',
  enabled: '启用',
  disabled: '停用',
};

const versionCompareRows: Array<{ type: string; items: string[]; personal: string; school: string }> = [
  { type: '基础功能', items: ['学生管理', '班级管理'], personal: '✓', school: '✓' },
  { type: 'AI解析', items: ['语音识别', '奖状识别', '学生识别', '指标识别'], personal: '✓', school: '✓' },
  { type: '家校协同', items: ['邀请老师', '邀请家长', '家长端'], personal: '✓', school: '✓' },
  { type: '指标配置', items: ['自定义指标'], personal: '×', school: '✓' },
  { type: 'AI报告', items: ['期末综合报告'], personal: '✓', school: '✓' },
  { type: '详细报告', items: ['月度成长报告', '各学科明细报告'], personal: '×', school: '✓' },
  { type: '校级报告', items: ['校级分析报告'], personal: '×', school: '✓' },
  { type: '硬件兑换', items: ['货柜机'], personal: '×', school: '✓' },
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
    '新增“转学校版”动作：选择已有学校或创建学校，再选择是否迁移个人版下班级、学生、评价记录、报告。',
    '学校列表仍只展示正式学校，保持现有学校授权、学校配置、提示词、报告、校园银行等管理逻辑清晰。',
  ] },
  { type: 'h3', text: '6. 数据隔离与迁移' },
  { type: 'list', items: [
    '个人版数据不能进入现有学校统计、区域统计、校园银行和货柜机统计，除非明确完成转学校版迁移。',
    '迁移时需要把 personal_space_id 下的数据改挂到目标 school_id，并保留 source_space_id/source_type 追溯来源。',
    '迁移范围需要可选：只迁移老师线索、迁移班级学生、迁移评价记录、迁移报告。',
    '如果个人版班级已有协作老师，迁移时要确认这些老师是否同步加入学校版。',
  ] },
  { type: 'h3', text: '7. 权限与接口范围' },
  { type: 'list', items: [
    '把 X-School-ID 升级为 X-Space-ID 或同时支持 X-School-ID + X-Space-Type，避免个人版接口没有学校 ID 就不可用。',
    'get_school_id() 依赖需要拆为 get_current_scope()：学校版返回 school scope，个人版返回 personal scope。',
    '查询类接口不能在没有 school_id 时默认查全量；必须按当前空间过滤。',
    '个人老师只能管理自己创建或加入的班级；学校管理员继续管理学校版；运营后台只看线索和统计，敏感详情需要权限控制。',
  ] },
  { type: 'h3', text: '8. 版本能力开关' },
  { type: 'list', items: [
    '个人版关闭指标编辑、家长端、货柜机、学校组织管理、区域统计。',
    '学校版开启定制指标、全校师生批量导入、学校级报告、更多 AI 工具额度。',
    '前端页面展示、接口能力、菜单权限都应由版本能力开关控制，避免写死个人版/学校版判断。',
  ] },
  { type: 'h2', text: '二、端侧改造范围' },
  { type: 'list', items: [
    '教师端：新增个人老师登录、完善姓名、创建/加入班级、添加学生、完成首次 AI 记录的新手路径。',
    '家长端：个人版阶段不开放家长绑定；学校版开通后继续承接报告查看。',
    '运营端：新增个人老师线索池、使用行为分析、跟进状态、转学校版和数据迁移入口。',
    '学校 PC 端：学校版承接时需要能导入或接收个人版迁移数据。',
  ] },
];

const parentPrdBlocks: PrdBlock[] = [
  { type: 'h1', text: '家长端：素养指南针' },
  { type: 'p', text: '家长端分为自主登录和被邀请两条路径。自主登录未匹配时提示家长从班主任邀请链接进入；被邀请未匹配时进入绑定提醒。' },
  { type: 'h2', text: '自主登录' },
  { type: 'list', items: [
    '01 微信登录：布局同教师端 01 登录页，但产品名为“素养指南针”，只保留微信授权登录；点击后展示微信原生手机号授权弹窗。',
    '01 后直接分三支：未绑定任何学生&手机号匹配成功、未绑定任何学生&手机号未匹配、已绑定任何学生。',
    '03A 绑定学生：手机号匹配到学生后进入；有多个可绑定学生时按顺序挨个判断，每次只展示当前待判断学生，全部判断后进入 05。',
    '02B 手机号未匹配：展示当前授权手机未匹配，并引导重新授权其他手机号；如无可匹配手机号，则联系班主任分享邀请链接。',
    '04A 绑定提醒：用于承接 03B/03C 后的安全确认，强调同一班级最多绑定 2 名学生。',
  ] },
  { type: 'h2', text: '被邀请' },
  { type: 'list', items: [
    '00 收到卡片：微信聊天对话中展示“素养指南针”小程序卡片。',
    '03A 绑定学生：展示可绑定学生并选择家长身份，多学生时按顺序逐个判断，全部判断后进入 05。',
    '邀请路径手机号未匹配时，根据同班已绑定数量进入 03B、03C 或 04B。',
    '05 落地页：身份确认后进入，展示孩子成长概览。',
  ] },
  { type: 'h2', text: '交互规则' },
  { type: 'list', items: [
    '02/03 都不再输入学生姓名和学生学号。',
    '03A 只展示确认绑定所需信息；自主登录和被邀请手机号匹配成功时共用同一页面。',
    '匹配成功页直接选择家长身份；多学生时不提供左右切换，必须按顺序判断当前学生是否为自己的孩子，直到全部判断完才进入 05。',
    '04A 绑定提醒页展示同班绑定数量安全提醒、学生卡片和家长身份；同一班级最多绑定 2 名学生。',
    '01 微信登录：点击微信授权登录后先展示“申请获取并验证你的手机号”的微信授权弹窗，选择号码后进入对应匹配结果页。',
    '05 落地页点击新增绑定：关闭切换孩子弹窗并展示轻提示检索进度；有新学生进入确认绑定页，无结果进入 02B 提示页。',
    '05 落地页复刻成长页结构：孩子卡、本月净得分、表扬/待改进、预估分红和底部三栏导航。',
    '登录页不展示手机号登录、密码登录或额外说明。',
    '绑定页只承载一个任务，正式内容入口统一放到落地页。',
  ] },
];

const opsPrdBlocks: PrdBlock[] = [
  { type: 'h1', text: '运营端' },
  { type: 'p', text: '用于承接 C 端老师线索、学校开通状态、个人用户转化和期末报告生成待办。' },
  { type: 'h2', text: '功能清单' },
  { type: 'list', items: [
    '必须：首页为工作台，展示学校总数及未开始、合作中、已到期状态分布。',
    '必须：首页展示个人用户总数及已转化、待转化状态分布。',
    '必须：首页展示期末报告生成待办，并支持标记已处理。',
    '必须：在运营端菜单新增个人用户管理。',
    '必须：个人用户管理展示用户、来源、意向学校、转化状态、报告次数、最近活跃和负责人。',
    '应该：支持按学校、老师活跃度、报告生成情况筛选。',
    '不做：不在教师端强行展示推荐学校开通入口。',
  ] },
  { type: 'h2', text: '页面状态' },
  { type: 'list', items: [
    '正常：展示运营工作台、待办和个人用户管理列表。',
    '空数据：暂无 C 端老师线索。',
    '加载：表格骨架屏。',
    '网络错误：表格区域展示重试。',
  ] },
];

const schoolAdminPrdBlocks: PrdBlock[] = [
  { type: 'h1', text: '学校后台端' },
  { type: 'h2', text: '功能清单' },
  { type: 'list', items: [
    '个人空间 / 多个学校空间切换。',
    '默认停留在个人空间。',
    '点击后同步切换选中态。',
  ] },
];

const versionComparePrdBlocks: PrdBlock[] = [
  { type: 'h1', text: '个人版 / 学校版功能对比' },
  { type: 'p', text: '顶部导航新增“版本对比”，用于快速判断个人版缺口，以及学校版承接的完整能力。页面只用表格呈现，不增加解释型长文案。' },
  { type: 'h2', text: '展示规则' },
  { type: 'list', items: [
    '表头固定为“能力类型、个人版、学校版”。',
    '版本单元格只展示 ✓ / ×，不在单元格内写说明。',
    '功能按基础功能、AI解析、家校协同、指标配置、AI报告、详细报告、校级报告、硬件兑换合并展示。',
    '个人版主要缺少月度成长报告、各学科明细报告、货柜机、自定义指标、校级分析报告。',
  ] },
  { type: 'h2', text: '能力类型' },
  { type: 'list', items: versionCompareRows.map((row) => `${row.type}：${row.items.join('、')}｜个人版 ${row.personal}｜学校版 ${row.school}`) },
];

const pageMeta: Record<PageKey, PageMeta> = {
  login: {
    title: '登录页',
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
    subtitle: '首次体验填写姓名和学校。',
    modules: ['页面标题', '姓名输入框', '学校输入框', '进入体验按钮'],
    ctas: [
      { label: '进入体验', priority: 'P0', position: '页面底部主按钮' },
    ],
    states: {
      normal: '展示姓名和学校字段，学校只收文本名称，不做强校验。',
      loading: '保存中。',
      empty: '姓名或学校为空时进入体验按钮不可用。',
      network: '保存失败，保留表单。',
      denied: '登录失效时返回注册登录页。',
    },
  },
  home: {
    title: '新手首页',
    subtitle: '先获得班级并确认学生，再进入记录页。',
    modules: ['记录标题', '老师称呼', '新手任务', '获得班级', '确认学生', '底部导航'],
    ctas: [
      { label: '创建班级', priority: 'P0', position: '新手任务第 1 步按钮块' },
      { label: '加入班级', priority: 'P0', position: '新手任务第 1 步按钮块' },
      { label: '去添加', priority: 'P0', position: '新手任务第 2 步' },
    ],
    states: {
      normal: '展示新手任务和已完成状态。',
      loading: '加载班级、学生和记录状态。',
      empty: '按缺失项引导下一步。',
      network: '首页加载失败，展示重新加载。',
      denied: '登录失效，展示重新登录。',
    },
  },
  classCreate: {
    title: '创建班级',
    subtitle: '选择学段、入学年份和班号，生成班级名称。',
    modules: ['学段选择', '入学年份选择', '班级数字输入'],
    ctas: [
      { label: '保存并添加学生', priority: 'P0', position: '页面底部主按钮' },
    ],
    states: {
      normal: '选择学段、入学年份和班号后生成班级名称。',
      loading: '保存中。',
      empty: '学段、入学年份或班号为空时提示。',
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
    subtitle: '手机端录入姓名、选填学号、性别，支持扫码识别表格。',
    modules: ['扫码识别表格', '学生录入行', '姓名', '学号', '性别点选', '新增一行'],
    ctas: [
      { label: '扫码识别表格', priority: 'P0', position: '学生录入列表上方' },
      { label: '完成', priority: 'P0', position: '页面底部主按钮' },
      { label: '添加一名', priority: 'P1', position: '录入表单下方' },
      { label: '清除该学生', priority: 'P2', position: '多行录入时学生行右侧留白区' },
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
    title: '记录页',
    subtitle: '语音/文字记录，拍照识别奖状。',
    modules: ['默认指标入口', '记录引导示例', '记录流/空状态', '底部录入条：拍照/按住说话/文字', '语音识别进度浮层'],
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
  classListPersonal: {
    title: '班级列表（个人版）',
    subtitle: '查看个人体验内的班级。',
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
  classListSchool: {
    title: '班级列表（学校版）',
    subtitle: '查看学校统一管理的班级。',
    modules: ['班级卡片', '班级名称', '推断年级', '任教标签', '8 位数字班级号', '班级人数'],
    ctas: [
      { label: '学生列表', priority: 'P1', position: '班级卡片底部' },
      { label: '班级报告', priority: 'P1', position: '班级卡片底部' },
    ],
    states: {
      normal: '展示学校版班级列表，不展示创建班级和加入班级入口。',
      loading: '班级加载中。',
      empty: '暂无可查看班级。',
      network: '加载失败，提供重试。',
      denied: '无权限时提示联系学校管理员。',
    },
  },
  classDetail: {
    title: '班级详情',
    subtitle: '维护班级基础信息、协同老师和班级状态。',
    modules: ['班级基本信息卡片', '班级名称', '班级学段', '8 位数字班级号', '老师列表卡片', '家长绑定列表卡片', '转移班主任', '解散班级'],
    ctas: [
      { label: '编辑班号', priority: 'P1', position: '班级名称右侧 icon' },
      { label: '编辑班级学段', priority: 'P1', position: '班级学段右侧 icon' },
      { label: '复制班级号', priority: 'P1', position: '班级号右侧 icon' },
      { label: '邀请老师', priority: 'P0', position: '老师列表卡片内' },
      { label: '更多老师', priority: 'P1', position: '老师列表卡片右上角' },
      { label: '更多家长绑定情况', priority: 'P1', position: '家长绑定列表卡片右上角' },
      { label: '转移班主任', priority: 'P2', position: '页面底部，解散班级上方' },
      { label: '解散班级', priority: 'P3', position: '页面底部' },
    ],
    states: {
      normal: '展示班级基础信息、一行老师列表、转移班主任和解散班级按钮。',
      loading: '班级详情加载中。',
      empty: '老师列表为空时保留邀请老师入口。',
      network: '加载失败，提供重试。',
      denied: '非班主任不可修改班级详情。',
    },
  },
  classDetailMember: {
    title: '班级详情',
    subtitle: '非班主任可查看班级基础信息、协同老师，并退出班级。',
    modules: ['班级基本信息卡片', '班级名称', '班级学段', '8 位数字班级号', '老师列表卡片', '家长绑定列表卡片', '退出班级'],
    ctas: [
      { label: '复制班级号', priority: 'P1', position: '班级号右侧 icon' },
      { label: '邀请老师', priority: 'P0', position: '老师列表卡片内' },
      { label: '更多老师', priority: 'P1', position: '老师列表卡片右上角' },
      { label: '更多家长绑定情况', priority: 'P1', position: '家长绑定列表卡片右上角' },
      { label: '退出班级', priority: 'P3', position: '页面底部' },
    ],
    states: {
      normal: '展示非班主任视角的班级详情和退出班级按钮，不展示编辑班级入口。',
      loading: '班级详情加载中。',
      empty: '老师列表为空时保留邀请老师入口。',
      network: '加载失败，提供重试。',
      denied: '无班级查看权限时返回班级页。',
    },
  },
  classDetailSchoolHead: {
    title: '班级详情(学校版)',
    subtitle: '学校版班主任维护班级基础信息、协同老师和班级状态，不支持解散班级。',
    modules: ['班级基本信息卡片', '班级名称', '班级学段', '8 位数字班级号', '老师列表卡片', '家长绑定列表卡片', '转移班主任'],
    ctas: [
      { label: '编辑班号', priority: 'P1', position: '班级名称右侧 icon' },
      { label: '编辑班级学段', priority: 'P1', position: '班级学段右侧 icon' },
      { label: '复制班级号', priority: 'P1', position: '班级号右侧 icon' },
      { label: '邀请老师', priority: 'P0', position: '老师列表卡片内' },
      { label: '更多老师', priority: 'P1', position: '老师列表卡片右上角' },
      { label: '更多家长绑定情况', priority: 'P1', position: '家长绑定列表卡片右上角' },
      { label: '转移班主任', priority: 'P2', position: '页面底部' },
    ],
    states: {
      normal: '展示班级基础信息、一行老师列表、转移班主任按钮，不展示解散班级。',
      loading: '班级详情加载中。',
      empty: '老师列表为空时保留邀请老师入口。',
      network: '加载失败，提供重试。',
      denied: '无班级管理权限时返回班级页。',
    },
  },
  teacherList: {
    title: '老师列表',
    subtitle: '班主任维护老师身份和成员。',
    modules: ['老师列表', '头像', '姓名', '班主任标签', '副班主任标签', '多学科标签', '更多操作'],
    ctas: [
      { label: '更多操作', priority: 'P1', position: '老师卡片右侧' },
    ],
    states: {
      normal: '展示全部已加入老师。',
      loading: '老师列表加载中。',
      empty: '无其他老师时在列表下方保留邀请老师卡片。',
      network: '加载失败，提供重试。',
      denied: '无权限查看时返回班级详情。',
    },
  },
  teacherListMember: {
    title: '老师列表',
    subtitle: '查看当前班级全部老师。',
    modules: ['老师列表', '头像', '姓名', '班主任标签', '副班主任标签', '多学科标签'],
    ctas: [],
    states: {
      normal: '展示全部已加入老师，不展示操作入口。',
      loading: '老师列表加载中。',
      empty: '无其他老师时只展示当前老师。',
      network: '加载失败，提供重试。',
      denied: '无权限查看时返回班级详情。',
    },
  },
  parentBindingList: {
    title: '家长绑定列表',
    subtitle: '查看当前班级学生家长绑定情况。',
    modules: ['未绑定/已绑定切换', '未填手机号', '待家长绑定', '学生头像', '姓名', '家长身份', '拨打电话', '移除绑定'],
    ctas: [
      { label: '邀请家长绑定', priority: 'P0', position: '页面底部固定按钮' },
    ],
    states: {
      normal: '通过未绑定/已绑定切换查看学生；未绑定学生区分未填手机号和待家长绑定，已绑定学生按学生聚合展示每个家长的身份和操作入口。',
      loading: '绑定情况加载中。',
      empty: '暂无学生。',
      network: '加载失败，提供重试。',
      denied: '无权限查看时返回班级详情。',
    },
  },
  studentList: {
    title: '学生列表',
    subtitle: '查看、搜索、筛选和新增学生。',
    modules: ['学生/分组切换标题', '搜索学生', '多选模式', '全选/取消全选', '男/女筛选', '一行 3 个学生卡片', '新增学生'],
    ctas: [
      { label: '新增学生', priority: 'P0', position: '学生卡片列表下方' },
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
  studentBatchEdit: {
    title: '批量修改学生信息',
    subtitle: '批量维护学生姓名、性别和学号。',
    modules: ['学生行列表', '姓名输入', '学号输入', '性别点选', '保存修改'],
    ctas: [
      { label: '保存修改', priority: 'P0', position: '底部主按钮' },
    ],
    states: {
      normal: '展示当前班级学生，可逐行编辑。',
      loading: '保存中。',
      empty: '暂无学生。',
      network: '保存失败，保留已编辑内容。',
      denied: '无班级管理权限时返回班级列表。',
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
  minePersonal: {
    title: '我的（仅有个人版）',
    subtitle: '查看教师信息、个人版和常用工具入口。',
    modules: ['教师信息', '头像', '姓名', '扫一扫', '设置', '了解学校版', '管理工具', '生成期末报告', '更多工具', '科目管理', '部门管理', '货币发放管理', '学校版功能弹窗', '顾问微信二维码'],
    ctas: [
      { label: '头像', priority: 'P0', position: '教师信息区，点击进入基本信息设置页' },
      { label: '扫一扫', priority: 'P1', position: '页面右上角 icon' },
      { label: '设置', priority: 'P1', position: '页面右上角 icon，点击进入设置页' },
      { label: '货币发放管理', priority: 'P1', position: '更多工具卡片，点击进入货币发放管理' },
      { label: '生成期末报告', priority: 'P0', position: '管理工具卡片，点击后提示未到学期末并可预览样例' },
      { label: '了解学校版', priority: 'P1', position: '教师卡片下方按钮，点击打开底部弹窗' },
    ],
    states: {
      normal: '展示教师信息、了解学校版入口和常用管理入口。',
      loading: '账号信息加载中。',
      empty: '账号信息缺失。',
      network: '加载失败，提供重试。',
      denied: '登录失效，提示重新登录。',
    },
  },
  mineSchool: {
    title: '我的（拥有多个版本）',
    subtitle: '查看教师信息、当前版本和常用工具入口。',
    modules: ['教师信息', '头像', '姓名', '扫一扫', '设置', '当前版本入口', '管理工具', '学校数据报表', '生成期末报告', '更多工具', '科目管理', '部门管理', '货币发放管理', '切换版本弹窗'],
    ctas: [
      { label: '头像', priority: 'P0', position: '教师信息区，点击进入基本信息设置页' },
      { label: '扫一扫', priority: 'P1', position: '页面右上角 icon' },
      { label: '设置', priority: 'P1', position: '页面右上角 icon，点击进入设置页' },
      { label: '切换版本', priority: 'P0', position: '教师信息区学校/版本胶囊，点击打开底部弹窗' },
      { label: '货币发放管理', priority: 'P1', position: '更多工具卡片，点击进入货币发放管理' },
      { label: '学校数据报表', priority: 'P0', position: '当前切换到学校版时展示在管理工具卡片' },
      { label: '生成期末报告', priority: 'P0', position: '管理工具卡片，点击后提示未到学期末并可预览样例' },
    ],
    states: {
      normal: '展示教师信息、当前版本入口和常用管理入口，不展示了解学校版按钮。',
      loading: '账号信息加载中。',
      empty: '账号信息缺失。',
      network: '加载失败，提供重试。',
      denied: '登录失效，提示重新登录。',
    },
  },
  teacherBasicInfoPersonal: {
    title: '基本信息设置（个人版）',
    subtitle: '编辑头像、姓名和个人版基础配置。',
    modules: ['头像', '姓名', '任教班级', '部门设置'],
    ctas: [
      { label: '头像', priority: 'P0', position: '顶部头像区，点击打开更换头像弹窗' },
      { label: '姓名', priority: 'P1', position: '头像下方行，点击打开修改姓名弹窗' },
      { label: '任教班级', priority: 'P1', position: '配置项右侧 icon，点击打开底部弹窗' },
      { label: '部门设置', priority: 'P1', position: '配置项行，点击打开底部弹窗' },
    ],
    states: {
      normal: '个人版展示头像、姓名、任教班级和部门设置。',
      loading: '基本信息加载中。',
      empty: '基本信息缺失。',
      network: '加载失败，提供重试。',
      denied: '无权限时返回我的页。',
    },
  },
  teacherBasicInfoSchool: {
    title: '基本信息设置（学校版）',
    subtitle: '编辑头像、姓名和教师基础配置。',
    modules: ['头像', '姓名', '任教班级', '带班班级', '分管年级', '部门设置'],
    ctas: [
      { label: '头像', priority: 'P0', position: '顶部头像区，点击打开更换头像弹窗' },
      { label: '姓名', priority: 'P1', position: '头像下方行，点击打开修改姓名弹窗' },
      { label: '任教班级', priority: 'P1', position: '配置项右侧 icon，点击打开底部弹窗' },
    ],
    states: {
      normal: '学校版展示头像、姓名、任教班级、带班班级、分管年级和部门设置。',
      loading: '基本信息加载中。',
      empty: '基本信息缺失。',
      network: '加载失败，提供重试。',
      denied: '无权限时返回我的页。',
    },
  },
  mineSettings: {
    title: '设置',
    subtitle: '管理账号安全和查看协议。',
    modules: ['登录账号', '修改密码', '隐私协议', '用户协议', '退出登录'],
    ctas: [
      { label: '修改密码', priority: 'P1', position: '账号安全区，展开密码表单' },
      { label: '退出登录', priority: 'P3', position: '页面底部' },
    ],
    states: {
      normal: '展示账号安全和协议入口。',
      loading: '设置加载中。',
      empty: '无设置项。',
      network: '加载失败，提供重试。',
      denied: '登录失效，提示重新登录。',
    },
  },
  termManagement: {
    title: '学期管理',
    subtitle: '维护系统内置学期时间并设置当前学期。',
    modules: ['系统内置学期', '学期起止时间', '当前学期标签', '新增入口', '更多操作菜单', '编辑学期弹窗'],
    ctas: [
      { label: '新增', priority: 'P0', position: '列表标题右侧' },
      { label: '编辑', priority: 'P1', position: '更多操作菜单' },
      { label: '设为当前', priority: 'P1', position: '更多操作菜单' },
      { label: '删除', priority: 'P3', position: '更多操作菜单底部' },
    ],
    states: {
      normal: '展示系统内置学期列表。',
      loading: '学期加载中。',
      empty: '暂无学期时展示空列表。',
      network: '加载失败，提供重试。',
      denied: '登录失效，提示重新登录。',
    },
  },
  subjectManagement: {
    title: '科目管理',
    subtitle: '维护学校常用科目。',
    modules: ['科目列表', '新增入口', '拖动排序', '编辑底部弹窗', '删除科目'],
    ctas: [
      { label: '新增科目', priority: 'P0', position: '页面顶部右侧' },
      { label: '修改科目名称', priority: 'P1', position: '列表行点击或编辑图标' },
      { label: '删除科目', priority: 'P3', position: '列表行删除图标，二次确认后删除' },
    ],
    states: {
      normal: '展示科目列表。',
      loading: '科目加载中。',
      empty: '暂无科目时保留新增入口。',
      network: '加载失败，提供重试。',
      denied: '无学校管理权限时隐藏入口并返回我的页。',
    },
  },
  departmentManagement: {
    title: '部门管理',
    subtitle: '维护学校部门名称。',
    modules: ['部门列表', '新增部门', '修改部门名称', '删除部门'],
    ctas: [
      { label: '新增部门', priority: 'P0', position: '页面顶部右侧' },
      { label: '编辑部门', priority: 'P1', position: '列表行点击' },
      { label: '删除部门', priority: 'P3', position: '列表行右侧 icon' },
    ],
    states: {
      normal: '展示部门列表。',
      loading: '部门加载中。',
      empty: '暂无部门时保留新增入口。',
      network: '加载失败，提供重试。',
      denied: '无学校管理权限时隐藏入口并返回我的页。',
    },
  },
  coinIssuanceManagement: {
    title: '货币发放管理',
    subtitle: '配置校园币自动发放规则。',
    modules: ['开启货币发放', '长按提示', '发放周期', '班级总预算', '阳光保底比例', '积分排行比例', '保存按钮'],
    ctas: [
      { label: '开启货币发放', priority: 'P0', position: '页面顶部配置项开关' },
      { label: '保存', priority: 'P0', position: '页面底部主按钮' },
    ],
    states: {
      normal: '默认关闭，只展示开关；开启后展示发放周期、预算和比例配置。',
      loading: '配置加载中。',
      empty: '未配置时使用默认值。',
      network: '保存失败，保留已编辑内容。',
      denied: '无学校管理权限时返回我的页。',
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

const classDetailComparisonPrdBlocks: PrdBlock[] = [
  { type: 'h1', text: '08 班级详情差异对比' },
  { type: 'p', text: '这组 PRD 重点说明页面差异、权限边界和路由条件，不重复低保真图上已经可见的按钮和卡片。' },
  { type: 'h2', text: '页面分工' },
  { type: 'list', items: [
    '08A 个人版班主任：个人老师自己创建或拥有班主任权限的班级，允许编辑班级、转移班主任、管理老师角色，并可解散个人版班级。',
    '08B 非班主任：任课老师或被邀请加入的协作老师，只能查看班级资料、邀请老师/家长、进入老师列表和学生列表，不能编辑班级，也不能解散班级。',
    '08C 学校版班主任：学校统一管理下的班主任，允许维护班级协作和转移班主任，但班级归属学校，不允许在手机端解散。',
    '08D 暂不落独立页面：如果后续需要区分“学校版非班主任”，可作为 08D；当前它与 08B 权限一致，继续复用 08B，避免为了概念完整而增加低价值页面。',
  ] },
  { type: 'h2', text: '进入条件' },
  { type: 'list', items: [
    '从 07A 个人版班级列表进入时，如果当前老师是班主任，进入 08A；否则进入 08B。',
    '从 07B 学校版班级列表进入时，如果当前老师是班主任，进入 08C；否则仍进入 08B。',
    '被邀请老师已加入班级后再次打开邀请卡片，按是否班主任和当前版本归属落到 08A、08B 或 08C，不新增邀请承接页。',
  ] },
  { type: 'h2', text: '核心差异' },
  { type: 'list', items: [
    '编辑班级信息：08A、08C 可以编辑；08B 不展示编辑入口。',
    '老师角色管理：08A、08C 进入 09A，可设置副班主任、移除老师、转移班主任；08B 进入 09B，只查看老师和邀请老师。',
    '家长绑定：三者都可查看家长绑定概览并邀请家长；完整管理能力收敛到 10 家长绑定列表，不在 08 页面展开。',
    '危险操作：08A 是解散班级；08B 是退出班级；08C 也是退出班级，因为学校版班级由学校统一管理。',
  ] },
  { type: 'h2', text: '确认规则' },
  { type: 'list', items: [
    '解散班级只出现在 08A，并要求二次确认和输入 delete，避免误删个人版班级。',
    '退出班级出现在 08B、08C，只需要二次确认，不要求输入 delete，因为不会删除班级数据。',
    '转移班主任必须先选中接收老师，再二次确认；确认后原班主任立刻失去班主任权限。',
  ] },
  { type: 'h2', text: '设计取舍' },
  { type: 'list', items: [
    '08A/08B/08C 保持同一信息骨架，是为了让老师切换身份时认知成本最低；差异只体现在权限和危险操作。',
    '不把所有角色差异都拆成页面，是为了避免页面地图变复杂；只有会影响关键权限或学校/个人版归属的状态才独立编号。',
    '08D 先作为预留口径记录在 PRD 中，等学校版非班主任出现独特能力时再落页面。',
  ] },
];

const pagePrdDetails: Partial<Record<PageKey, PrdBlock[]>> = {
  login: [
    { type: 'h2', text: '登录流程' },
    { type: 'list', items: [
      '页面导航地图中，01 登录页后合并展示三条分支：新用户首次登录、新用户已填写姓名但未完成新手引导、老用户登录。',
      '新用户首次登录时进入 02 完善信息 → 03 新手首页。',
      '新用户已填写姓名但未完成新手引导时直接进入 03 新手首页，后续节点不重复展示。',
      '老用户登录时直接进入 13 记录页。',
      '空间选择不作为首次进入流程中的独立页面节点。',
      '已登录老师再次进入时，系统按上次使用空间直接进入对应首页。',
    ] },
    { type: 'h2', text: '邀请入口未登录' },
    { type: 'list', items: [
      '老师从微信小程序卡片或邀请链接进入时，如果未登录，直接进入 01 登录页。',
      '登录页不展示额外邀请承接内容，保持登录主流程简洁。',
      '完成微信或手机号授权后，继续校验是否已加入被邀请班级。',
      '如果已加入该班级，进入班级页；如果未加入该班级，进入班级页并展示加入确认弹窗。',
    ] },
  ],
  minePersonal: [
    { type: 'h2', text: '14A 仅有个人版' },
    { type: 'list', items: [
      '14A 用于老师只有个人版的状态。',
      '教师信息直接铺开到页面顶部，不使用教师信息卡片。',
      '头像点击进入 15A 基本信息设置（个人版）。',
      '右上角展示扫一扫和设置 icon。',
      '更多工具在 14A 和 14B 都展示，以卡片承载科目管理、部门管理和货币发放管理。',
      '点击货币发放管理进入 21 货币发放管理，默认关闭货币发放，开启后展示发放周期、班级总预算、阳光保底比例和积分排行比例。',
      '点击生成期末报告展示未到学期末提示，并提供期末报告样例预览。',
      '页面展示“了解学校版”按钮。',
      '弹窗先说明学校版适合全校统一使用，再展示学校统一使用能力和顾问微信二维码。',
      '学校版能力用“能力标题 + 学校收益”表达，避免只罗列功能名。',
      '核心优势包括统一评价标准、统一管理全校师生数据、支持更高频 AI 使用、形成更完整的班级/学生/学校报告。',
      '弹窗只提供关闭动作和二维码展示，不在产品内强行推动提交线索。',
    ] },
  ],
  mineSchool: [
    { type: 'h2', text: '14B 拥有多个版本' },
    { type: 'list', items: [
      '14B 用于老师拥有多个版本的状态；即使当前切换到个人版，也仍停留在 14B。',
      '头像点击进入 15B 基本信息设置（学校版）。',
      '教师卡片头像姓名学校行右侧展示同组操作按钮：编辑资料和切换版本。切换版本点击后从底部上滑展示“切换版本”。',
      '切换版本弹窗只展示版本名称和当前标签，不展示“个人体验数据”“学校统一数据”等备注文案。',
      '管理工具随当前切换版本变化：当前为学校版时展示学校数据报表、生成期末报告；当前为个人版时只展示生成期末报告。',
      '更多工具在 14A 和 14B 都展示，以卡片承载科目管理、部门管理和货币发放管理。',
      '点击货币发放管理进入 21 货币发放管理，默认关闭货币发放，开启后展示发放周期、班级总预算、阳光保底比例和积分排行比例。',
      '点击生成期末报告展示未到学期末提示，并提供期末报告样例预览。',
      '14B 不展示“了解学校版”按钮。',
    ] },
  ],
  home: [
    { type: 'h2', text: '新手引导规则' },
    { type: 'list', items: [
      '老师必须先获得班级，路径包括创建班级和加入班级。',
      '如果加入已有班级且班级已有学生，添加学生步骤自动完成。',
      '03 新手首页只保留 2 个步骤：获得班级、确认学生。',
      '完成第 2 步确认学生后，直接进入 13 记录页。',
      '首次记录引导放在 13 记录页内，不再作为 03 新手首页第 3 步。',
    ] },
  ],
  classListPersonal: [
    { type: 'h2', text: '班级卡片结构' },
    { type: 'list', items: [
      '个人版班级列表展示创建班级和加入班级入口。',
      '班级名称右侧展示基于学段和入学年份推断的年级。',
      '班级名下方展示当前登录账号的任教标签，例如班主任、语文、数学。',
      '班级号和人数在同一行展示。',
      '卡片 CTA 为学生列表和班级报告。',
    ] },
    { type: 'h2', text: '邀请老师加入' },
    { type: 'list', items: [
      '从班级卡片更多操作进入“邀请老师加入”。',
      '先展示邀请方式弹窗：邀请微信好友、通过班级号邀请、取消。',
      '选择微信好友时调用微信原生“选择聊天”页，包含关闭、多选、搜索、最近转发、最近聊天。',
      '选择任意聊天后进入微信原生发送确认半屏，展示接收人、小程序卡片、消息输入、取消和发送。',
      '点击发送后完成转发，小程序卡片打开后按登录态和班级关系直接进入登录页或班级页。',
      '被邀请方先在微信聊天对话中看到小程序卡片，点击卡片后再进入小程序。',
      '选择班级号邀请时只展示可复制文案，文案包含班级号、班级名称和快速加入链接。',
      '邀请链接打开后不出现额外承接页：未登录进登录页，已登录进班级页。',
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
  classListSchool: [
    { type: 'h2', text: '班级卡片结构' },
    { type: 'list', items: [
      '学校版班级列表不展示创建班级和加入班级入口。',
      '班级名称右侧展示基于学段和入学年份推断的年级。',
      '班级名下方展示当前登录账号的任教标签，例如班主任、语文、数学。',
      '班级号和人数在同一行展示。',
      '卡片 CTA 为学生列表和班级报告。',
    ] },
  ],
  classDetail: [
    ...classDetailComparisonPrdBlocks,
    { type: 'h2', text: '共用细节规则' },
    { type: 'list', items: [
      '从班级卡片更多操作点击“编辑班级信息”进入。',
      '班级基本信息以班级卡片展示，班级名称格式为“2025级1班（一年级）”，不单独展示学段标签。',
      '班级详情不展示班主任、语文等任教标签，这些标签属于当前登录账号与班级的关系，不属于班级基础信息。',
      '卡片右上角只有一个编辑 icon，点击从底部上滑编辑弹窗。',
      '编辑弹窗字段顺序为：学段、入学年份、班号；班级名称按“入学年份级 + 班号 + 班”自动生成。',
      '班级详情卡片不展示班主任字段。',
      '班级号和人数同一行展示：左侧班级号文案，右侧人数。',
      '班级号文案后展示复制 icon，点击班级号区域复制班级号。',
      '班级号为连续 8 位数字展示，不加空格或分隔符。',
      '老师列表标题展示人数，例如“老师列表(8人)”，括号数字使用辅助字重和灰色。',
      '老师列表卡片外层一行展示 5 个老师，避免页面过长。',
      '点击右上角 icon 进入老师列表，查看当前班级全部老师。',
      '家长绑定列表标题展示绑定进度，例如“家长绑定列表(48/50)”，括号数字使用辅助字重和灰色。',
      '家长绑定列表默认以两列学生聚合卡片展示首批学生，未绑定学生优先。',
      '点击家长绑定列表右上角 icon 进入完整列表，通过 tab 查看未绑定和已绑定学生。',
      '完整家长绑定列表不展示学号；未绑定卡片展示学生头像、学生姓名，并按是否已预留手机号展示“未填手机号”或“待家长绑定”。',
      '已绑定预览按学生聚合展示，例如“王小明”卡片内展示“爸爸、姑姑”等关系标签；08A/08B 预览不展示电话 icon。',
      '班级详情和完整家长绑定列表均提供“邀请家长绑定”按钮，层级同老师列表板块的邀请老师。',
      '邀请家长绑定流程完成后回到发起邀请的当前页面。',
      '点击邀请老师复用班级邀请流程。',
      '08A 班主任可点击“转移班主任”，从底部老师列表弹窗中选择一位非班主任老师。',
      '选中老师后必须展示二次确认弹窗；确认后班主任身份转移给该老师，原班主任不再拥有班级班主任权限。',
      '页面底部按权限展示危险操作：班主任显示解散班级，非班主任显示退出班级。',
      '解散班级需要二次确认，并输入 delete 后才可点击确认解散。',
      '退出班级同样需要二次确认，但不需要输入 delete。',
    ] },
  ],
  classDetailSchoolHead: [
    ...classDetailComparisonPrdBlocks,
    { type: 'h2', text: '学校版班主任补充' },
    { type: 'list', items: [
      '学校版班主任从 07B 班级列表进入时，跳转到 08C 班级详情（班主任-学校版）。',
      '08C 与 08A 共享编辑班级、转移班主任、邀请老师等能力。',
      '08C 不展示解散班级按钮；学校版班级由学校统一管理，班主任无权解散。',
      '08C 点击老师列表 icon 进入 09A 班主任老师列表。',
    ] },
  ],
  classDetailMember: [
    ...classDetailComparisonPrdBlocks,
    { type: 'h2', text: '非班主任补充' },
    { type: 'list', items: [
      '从 07A/07B 班级列表进入非班主任身份的班级时，跳转到 08B 班级详情（非班主任）。',
      '非班主任可以查看班级基础信息、复制班级号、邀请老师和查看老师列表，但不能修改班级详情。',
      '班级卡片沿用班主任详情结构：不展示班主任字段，班级号和人数同一行。',
      '页面底部不展示解散班级，只展示退出班级。',
      '退出班级需要二次确认；确认后当前老师不再管理该班级，班级数据仍由创建人保留。',
      '08A 点击老师列表 icon 进入 09A 班主任老师列表，08B 点击老师列表 icon 进入 09B 非班主任老师列表。',
    ] },
  ],
  teacherList: [
    { type: 'h2', text: '09A 老师列表规则' },
    { type: 'list', items: [
      '09A 是班主任视角，个人版中创建班级的人默认成为班主任。',
      '老师卡片包含头像、姓名、班主任标签、副班主任标签和多个任教学科标签。',
      '老师列表中的每位老师使用独立卡片展示，班主任和副班主任置顶。',
      '老师列表内容区可滚动，邀请老师按钮固定在页面底部。',
      '班主任和副班主任下方用一条横线分隔其余老师。',
      '班主任点击老师卡片右侧更多 icon，可设置一个或多个老师为副班主任，也可取消副班主任或移除老师。',
      '点击移除老师后必须展示二次确认弹窗；确认后该老师不再管理当前班级。',
    ] },
  ],
  teacherListMember: [
    { type: 'h2', text: '09B 老师列表规则' },
    { type: 'list', items: [
      '09B 是非班主任视角。',
      '老师卡片包含头像、姓名、班主任标签、副班主任标签和多个任教学科标签。',
      '非班主任可查看老师列表，班主任和副班主任置顶并用横线分隔其余老师；列表可滚动，底部展示邀请老师按钮；不展示移除或更多操作。',
    ] },
  ],
  parentBindingList: [
    { type: 'h2', text: '10 家长绑定列表规则' },
    { type: 'list', items: [
      '10 是统一的家长绑定列表页，班主任和非班主任看到相同内容。',
      '页面使用“未绑定/已绑定”tab 切换查看学生，tab 内数字即统计。',
      '邀请家长绑定按钮固定在页面底部，与 09 老师列表保持一致。',
      'mock 数据为 48/50：50 个学生中 48 个学生已绑定，未绑定学生优先展示。',
      '未绑定卡片展示学生头像、学生姓名，并按是否已预留手机号展示“未填手机号”或“待家长绑定”。',
      '未填手机号表示老师还没有录入可用于自动匹配的家长手机号；待家长绑定表示老师已预留手机号，只等家长微信授权绑定。',
      '已绑定 tab 每个家长绑定关系展示为一张可点击卡片，卡片只展示学生头像和“学生姓名+关系”，例如“王小明的爸爸”；姓名字号应克制，关系作为轻层级信息展示。',
      '同一个学生有多个家长绑定时，多个家长卡片连续排列；不同学生之间用弱化线条分隔。',
      '已绑定卡片列表态不展示手机号、不展示 icon 操作；点击卡片后在弹窗中展示并支持编辑完整手机号和关系，同时提供拨打电话和移除绑定操作。',
      '家长身份来自信息确认页的爸爸、妈妈、爷爷、奶奶、外公、外婆或其他文本。',
      '一个学生可以被多个家长绑定，班主任和副班主任可以移除单个家长绑定关系；详情弹窗和移除确认均展示完整手机号，帮助确认是否绑定错误。',
      '从 08A/08B 班级详情进入时，邀请家长绑定流程完成后回到当前页。',
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
      '新增学生入口放在学生卡片列表下方，样式与学生卡片一致。',
    ] },
  ],
  studentBatchEdit: [
    { type: 'h2', text: '批量修改学生信息规则' },
    { type: 'list', items: [
      '从 07 班级列表的班级更多操作进入。',
      '页面结构参考 12 添加学生，但不提供添加一名和清除学生。',
      '每行包含姓名、较短学号输入框、男/女点选。',
      '姓名和性别有值时，底部保存修改按钮可点击；学号选填。',
      '保存后回到 11 学生列表，并展示保存成功反馈。',
    ] },
  ],
  studentAdd: [
    { type: 'h2', text: '添加学生规则' },
    { type: 'list', items: [
      '进入页面时默认只展示一行。',
      '列表上方提供扫码识别表格入口，点击后打开底部浮层。',
      '扫码识别表格浮层展示弱提示“拍摄纸质名单，识别后可再修改”，识别结果回填到当前学生录入列表。',
      '点击添加一名后再新增一行。',
      '每行包含姓名、较短学号输入框、男/女点选。',
      '性别默认男，且每行可独立切换。',
      '每一行的姓名和性别填写完成后，底部完成按钮才可点击；学号选填。',
      '学号选填，填写后可支持学号进行评价，例如“1号和3号同学打架”。',
      '当存在多行时，每个学生行右侧留白区展示清除 icon，用于删除误添加的整条学生数据；不展示学生序号文案。',
      '不提供批量粘贴入口。',
    ] },
  ],
  termManagement: [
    { type: 'h2', text: '学期管理规则' },
    { type: 'list', items: [
      '学期列表优先展示名称、时间和当前状态，不在卡片上平铺操作按钮。',
      '新增放在列表标题右侧；编辑、设为当前、删除收进单个更多操作菜单。',
      '每个学期维护学期名称、开始日期和结束日期。',
      '当前学期用于默认筛选、报告周期和本学期统计口径。',
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

const buildClassName = (entryYearValue: string | number, classNumberValue: string | number) => `${entryYearValue}级${classNumberValue}班`;
const getClassNumberFromName = (name: string) => name.match(/级(\d+)班/)?.[1] ?? '1';
const maskChineseName = (name: string) => {
  if (name.length <= 1) return name;
  if (name.length === 2) return `${name.slice(0, 1)}*`;
  return `${name.slice(0, 1)}*${name.slice(-1)}`;
};
const formatClassCode = (code: string) => code.replace(/\D/g, '').slice(0, 8);
const bottomSheetBackdropClass = 'absolute inset-0 flex items-end animate-in fade-in duration-200 ease-out motion-reduce:animate-none';
const bottomSheetPanelClass = 'relative w-full animate-in slide-in-from-bottom-6 fade-in duration-300 ease-out motion-reduce:animate-none';
const getPrototypeWidthMax = (currentSurface: CEndSurface) => (currentSurface === 'ops' || currentSurface === 'schoolAdmin' ? 82 : 52);
const formatCoinAmount = (amount: number) => {
  if (!Number.isFinite(amount)) return '0';
  return Number.isInteger(amount) ? String(amount) : amount.toFixed(2).replace(/\.?0+$/, '');
};

const SwitchControl = ({
  checked,
  onChange,
  ariaLabel,
}: {
  checked: boolean;
  onChange: (checked: boolean) => void;
  ariaLabel: string;
}) => (
  <button
    type="button"
    role="switch"
    aria-label={ariaLabel}
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cx(
      'relative h-7 w-12 shrink-0 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-900/15 active:scale-[0.98]',
      checked ? 'bg-gray-900' : 'bg-gray-300'
    )}
  >
    <span
      className={cx(
        'absolute left-0.5 top-0.5 h-6 w-6 rounded-full bg-white shadow-[0_1px_4px_rgba(15,23,42,0.22)] transition-transform',
        checked ? 'translate-x-5' : 'translate-x-0'
      )}
    />
  </button>
);

const TeacherCMobileLowFi: React.FC = () => {
  const [surface, setSurface] = useState<CEndSurface>('teacher');
  const [prototypeWidths, setPrototypeWidths] = useState<Record<CEndSurface, number>>({
    summary: 34,
    teacher: 34,
    parent: 34,
    versionCompare: 34,
    schoolAdmin: 60,
    ops: 60,
  });
  const prototypeWidth = prototypeWidths[surface];
  const resizeDragRef = useRef<{
    pointerId: number;
    startX: number;
    startWidth: number;
    containerWidth: number;
  } | null>(null);
  const [page, setPage] = useState<PageKey>('login');
  const [activeLane, setActiveLane] = useState<string>('登录');
  const [activeInviteNode, setActiveInviteNode] = useState<number>(-1);
  const [viewState, setViewState] = useState<ViewState>('normal');
  const [history, setHistory] = useState<PageKey[]>([]);
  const [recordStage, setRecordStage] = useState<RecordStage>('idle');
  const [classCreated, setClassCreated] = useState(false);
  const [joinedClassHasStudents, setJoinedClassHasStudents] = useState(false);
  const [recordCount, setRecordCount] = useState(0);
  const [studentCount, setStudentCount] = useState(0);
  const [showMultiResult, setShowMultiResult] = useState(false);
  const [showWechatPhoneSheet, setShowWechatPhoneSheet] = useState(false);
  const [showParentWechatPhoneSheet, setShowParentWechatPhoneSheet] = useState(false);
  const [teacherName, setTeacherName] = useState('');
  const [teacherSchoolName, setTeacherSchoolName] = useState('');
  const [schoolStage, setSchoolStage] = useState('');
  const [entryYear, setEntryYear] = useState('');
  const [classNumber, setClassNumber] = useState('1');
  const [classCode, setClassCode] = useState('');
  const [studentSearch, setStudentSearch] = useState('');
  const [studentGenderFilter, setStudentGenderFilter] = useState<'all' | '男' | '女'>('all');
  const [studentSelectionMode, setStudentSelectionMode] = useState(false);
  const [selectedStudentNos, setSelectedStudentNos] = useState<string[]>([]);
  const [studentListMode, setStudentListMode] = useState<'student' | 'group'>('student');
  const [schoolClassGradeFilter, setSchoolClassGradeFilter] = useState<SchoolClassGradeFilter>('全部');
  const [schoolClassTeachingOnly, setSchoolClassTeachingOnly] = useState(false);
  const [studentInputRows, setStudentInputRows] = useState<StudentInputRow[]>([{ id: 1, name: '', no: '', gender: '男' }]);
  const [studentBatchEditRows, setStudentBatchEditRows] = useState<StudentInputRow[]>([]);
  const [teachingInfoRows, setTeachingInfoRows] = useState<TeachingInfoRow[]>([
    { id: 1, subject: '英语', classes: ['2025级1班', '2025级2班'] },
    { id: 2, subject: '音乐', classes: ['2023级1班'] },
  ]);
  const [showPhoneLoginSheet, setShowPhoneLoginSheet] = useState(false);
  const [phoneLoginTab, setPhoneLoginTab] = useState<PhoneLoginTab>('sms');
  const [showAvatarSheet, setShowAvatarSheet] = useState(false);
  const [showNameSheet, setShowNameSheet] = useState(false);
  const [draftTeacherName, setDraftTeacherName] = useState('');
  const [showSchoolUpgradeSheet, setShowSchoolUpgradeSheet] = useState(false);
  const [showSpaceSelectSheet, setShowSpaceSelectSheet] = useState(false);
  const [showStudentScanSheet, setShowStudentScanSheet] = useState(false);
  const [showFinalReportConfirmSheet, setShowFinalReportConfirmSheet] = useState(false);
  const [showFinalReportSamplePreview, setShowFinalReportSamplePreview] = useState(false);
  const [coinIssuanceEnabled, setCoinIssuanceEnabled] = useState(false);
  const [coinIssuePeriod, setCoinIssuePeriod] = useState<CoinIssuePeriod>('weekly');
  const [coinClassBudget, setCoinClassBudget] = useState(500);
  const [sunshineRatio, setSunshineRatio] = useState(30);
  const [rankingRatio, setRankingRatio] = useState(70);
  const [showCoinIssueHelpOverlay, setShowCoinIssueHelpOverlay] = useState(false);
  const [currentSpaceId, setCurrentSpaceId] = useState<TeacherSpaceId>(defaultTeacherSpaceId);
  const [showSchoolAdminSpaceMenu, setShowSchoolAdminSpaceMenu] = useState(true);
  const [opsPage, setOpsPage] = useState<'home' | 'personalUsers'>('home');
  const [handledOpsTodoIds, setHandledOpsTodoIds] = useState<string[]>([]);
  const [activeBasicInfoTab, setActiveBasicInfoTab] = useState<SchoolBasicInfoTab>('term');
  const [editingBasicInfoItem, setEditingBasicInfoItem] = useState<SchoolBasicInfoItem | null>(null);
  const [subjectItems, setSubjectItems] = useState<SchoolSubjectItem[]>(schoolSubjectItems);
  const [editingSubjectItem, setEditingSubjectItem] = useState<SchoolSubjectItem | null>(null);
  const [deletingSubjectItem, setDeletingSubjectItem] = useState<SchoolSubjectItem | null>(null);
  const [showSubjectEditSheet, setShowSubjectEditSheet] = useState(false);
  const [draggingSubjectId, setDraggingSubjectId] = useState<string | null>(null);
  const [editingTermItem, setEditingTermItem] = useState<SchoolTermItem | null>(null);
  const [activeTermAction, setActiveTermAction] = useState<SchoolTermItem | null>(null);
  const [deletedTermIds, setDeletedTermIds] = useState<string[]>([]);
  const [deletedDepartmentIds, setDeletedDepartmentIds] = useState<string[]>([]);
  const [showBasicInfoEditSheet, setShowBasicInfoEditSheet] = useState(false);
  const [showTermEditSheet, setShowTermEditSheet] = useState(false);
  const [currentTermId, setCurrentTermId] = useState('term-2025-2026-2');
  const [showTeachingSheet, setShowTeachingSheet] = useState(false);
  const [showInviteOptionsSheet, setShowInviteOptionsSheet] = useState(false);
  const [showWechatChatSheet, setShowWechatChatSheet] = useState(false);
  const [wechatInviteMode, setWechatInviteMode] = useState<WechatInviteMode>('select');
  const [showClassCodeInviteSheet, setShowClassCodeInviteSheet] = useState(false);
  const [showInviteConfirmSheet, setShowInviteConfirmSheet] = useState(false);
  const [inviteAudience, setInviteAudience] = useState<InviteAudience>('teacher');
  const [inviteReturnPage, setInviteReturnPage] = useState<PageKey>('classListPersonal');
  const [wechatShareSentTo, setWechatShareSentTo] = useState('');
  const [pendingInviteAfterLogin, setPendingInviteAfterLogin] = useState(false);
  const [inviteeLoggedIn, setInviteeLoggedIn] = useState(false);
  const [inviteeAlreadyJoined, setInviteeAlreadyJoined] = useState(false);
  const [editingTeachingIndex, setEditingTeachingIndex] = useState<number | null>(null);
  const [teachingGrade, setTeachingGrade] = useState<TeachingGrade>('2025级');
  const [teachingSelectedClasses, setTeachingSelectedClasses] = useState<string[]>(['2025级1班', '2025级2班']);
  const [teachingSubject, setTeachingSubject] = useState('英语');
  const [activeTeacherBasicConfig, setActiveTeacherBasicConfig] = useState<TeacherBasicConfigKey | null>(null);
  const [teacherBasicConfigValues, setTeacherBasicConfigValues] = useState<Record<TeacherBasicConfigKey, string>>({
    headClass: '2025级1班',
    gradeLeader: '2025级',
    department: '学发中心',
  });
  const [draftTeacherBasicConfigValue, setDraftTeacherBasicConfigValue] = useState('');
  const [activeClassAction, setActiveClassAction] = useState<{ name: string; code: string } | null>(null);
  const [inviteClass, setInviteClass] = useState<{ name: string; code: string; inviter: string }>({ name: '2025级1班', code: '58273914', inviter: '郭老师' });
  const [activeClassProfile, setActiveClassProfile] = useState<ClassProfile>({
    name: '2025级1班',
    code: '58273914',
    stage: '小学',
    entryYearValue: 2025,
    count: 2,
    creatorName: '郭老师',
    isCreator: true,
  });
  const [showClassExitSheet, setShowClassExitSheet] = useState(false);
  const [showClassEditSheet, setShowClassEditSheet] = useState(false);
  const [draftClassNumber, setDraftClassNumber] = useState('1');
  const [draftClassStage, setDraftClassStage] = useState<'小学' | '初中' | '高中'>('小学');
  const [draftClassEntryYear, setDraftClassEntryYear] = useState(2025);
  const [classDeleteConfirmText, setClassDeleteConfirmText] = useState('');
  const [activeTeacherAction, setActiveTeacherAction] = useState<ClassTeacherProfile | null>(null);
  const [removeTeacherCandidate, setRemoveTeacherCandidate] = useState<ClassTeacherProfile | null>(null);
  const [removeParentBindingCandidate, setRemoveParentBindingCandidate] = useState<{ studentName: string; guardianLabel: string; phone: string } | null>(null);
  const [activeParentBindingCandidate, setActiveParentBindingCandidate] = useState<ActiveParentBindingCandidate | null>(null);
  const [showTransferHeadTeacherSheet, setShowTransferHeadTeacherSheet] = useState(false);
  const [transferHeadTeacherCandidate, setTransferHeadTeacherCandidate] = useState<ClassTeacherProfile | null>(null);
  const [classHeadTeacherName, setClassHeadTeacherName] = useState('郭老师');
  const [classActionToast, setClassActionToast] = useState('');
  const classActionToastTimerRef = useRef<number | null>(null);
  const [parentPage, setParentPage] = useState<ParentPageKey>('wechatCard');
  const [activeParentDirectoryNodeKey, setActiveParentDirectoryNodeKey] = useState('被邀请-source-wechatCard');
  const [parentBindMode, setParentBindMode] = useState<ParentBindMode>('school');
  const [parentLoginTarget, setParentLoginTarget] = useState<ParentPageKey>('bindSelfMatched');
  const [parentBindingReturnPage, setParentBindingReturnPage] = useState<ParentPageKey>('login');
  const [parentBindingNoticeBackPage, setParentBindingNoticeBackPage] = useState<ParentPageKey>('login');
  const [activeParentMatchedStudentIndex, setActiveParentMatchedStudentIndex] = useState(0);
  const parentBindingLookupTimerRef = useRef<number | null>(null);
  const [parentIdentityForm, setParentIdentityForm] = useState<{ phone: string; relation: ParentIdentityRelation; relationOther: string }>({
    phone: '15200001332',
    relation: '家长',
    relationOther: '',
  });
  const [parentInviteStudentForm, setParentInviteStudentForm] = useState({ name: '', no: '' });
  const [showParentChildSwitcherSheet, setShowParentChildSwitcherSheet] = useState(false);
  const [showParentMismatchConfirmSheet, setShowParentMismatchConfirmSheet] = useState(false);

  const meta = pageMeta[page];

  useEffect(() => () => {
    if (classActionToastTimerRef.current !== null) {
      window.clearTimeout(classActionToastTimerRef.current);
    }
    if (parentBindingLookupTimerRef.current !== null) {
      window.clearTimeout(parentBindingLookupTimerRef.current);
    }
  }, []);

  const showClassActionToast = (message: string) => {
    setClassActionToast(message);
    if (classActionToastTimerRef.current !== null) {
      window.clearTimeout(classActionToastTimerRef.current);
    }
    classActionToastTimerRef.current = window.setTimeout(() => {
      setClassActionToast('');
      classActionToastTimerRef.current = null;
    }, 2000);
  };
  const demoAcademicStartYear = 2025;
  const normalizedClassNumber = classNumber.trim();
  const classDisplayName = entryYear && normalizedClassNumber ? buildClassName(entryYear, normalizedClassNumber) : '';
  const canSaveClass = Boolean(schoolStage && entryYear && normalizedClassNumber);
  const canJoinClass = classCode.trim().length === 8;
  const studentRows = [
    { name: '王小明', no: '20250101', gender: '男' as const },
    { name: '李小红', no: '20250102', gender: '女' as const },
    { name: '陈一诺', no: '20250103', gender: '女' as const },
    { name: '周子航', no: '20250104', gender: '男' as const },
  ];
  const currentTeacherDisplayName = teacherName.trim() || '郭老师';
  const activeHeadTeacherName = classHeadTeacherName === '郭老师' ? currentTeacherDisplayName : classHeadTeacherName;
  const classTeachers: ClassTeacherProfile[] = [
    { name: currentTeacherDisplayName, subjects: ['语文', '道德与法治'], isHeadTeacher: false, isDeputyHeadTeacher: false },
    { name: '陈老师', subjects: ['语文', '书法'], isHeadTeacher: false, isDeputyHeadTeacher: true },
    { name: '李老师', subjects: ['数学', '科学'], isHeadTeacher: false, isDeputyHeadTeacher: false },
    { name: '王老师', subjects: ['英语'], isHeadTeacher: false, isDeputyHeadTeacher: false },
    { name: '赵老师', subjects: ['体育', '劳动'], isHeadTeacher: false, isDeputyHeadTeacher: true },
    { name: '刘老师', subjects: ['美术'], isHeadTeacher: false, isDeputyHeadTeacher: false },
    { name: '马老师', subjects: ['信息科技'], isHeadTeacher: false, isDeputyHeadTeacher: false },
    { name: '高老师', subjects: ['综合实践'], isHeadTeacher: false, isDeputyHeadTeacher: false },
  ].map((teacher) => ({
    ...teacher,
    isHeadTeacher: teacher.name === activeHeadTeacherName,
  }));
  const transferHeadTeacherCandidates = classTeachers.filter((teacher) => !teacher.isHeadTeacher);
  const primaryClassTeachers = classTeachers.filter((teacher) => teacher.isHeadTeacher || teacher.isDeputyHeadTeacher);
  const otherClassTeachers = classTeachers.filter((teacher) => !teacher.isHeadTeacher && !teacher.isDeputyHeadTeacher);
  const parentMatchedStudentCandidates: ParentBindingProfile[] = [
    {
      name: '张天天',
      no: '20250101',
      gender: '女' as const,
      reservedPhone: '15200001332',
      guardians: [],
    },
    {
      name: '张弟弟',
      no: '20250103',
      gender: '男' as const,
      reservedPhone: '15200001332',
      guardians: [],
    },
  ];
  const parentBindingRows: ParentBindingProfile[] = [
    {
      name: '张天天',
      no: '20250101',
      gender: '女' as const,
      reservedPhone: '15200001332',
      guardians: [],
    },
    {
      name: '林小杰',
      no: '20250102',
      gender: '男' as const,
      guardians: [],
    },
    ...Array.from({ length: 48 }).map((_, index) => {
      const phoneTail = ['5678', '2186', '9035', '7421'][index % 4];
      const secondPhoneTail = ['6612', '3908', '1205'][index % 3];
      return {
        name: ['王小明', '李小红', '陈一诺', '周子航', '赵昕然', '钱嘉乐', '孙雨萌', '李浩宇'][index % 8] + (index > 7 ? String(index + 1) : ''),
        no: `202502${String(index + 1).padStart(2, '0')}`,
        gender: index % 2 === 0 ? '男' as const : '女' as const,
        guardians: [
          {
            id: `guardian-${index + 1}-1`,
            phone: `138${String(1200 + index).padStart(4, '0')}${phoneTail}`,
            phoneTail,
            relation: (['爸爸', '妈妈', '爷爷', '奶奶', '外公', '外婆'] as ParentIdentityRelation[])[index % 6],
          },
          ...(index % 12 === 0 ? [{
            id: `guardian-${index + 1}-2`,
            phone: `139${String(6500 + index).padStart(4, '0')}${secondPhoneTail}`,
            phoneTail: secondPhoneTail,
            relation: '其他' as ParentIdentityRelation,
            relationOther: index % 24 === 0 ? '姑姑' : '监护人',
          }] : []),
        ],
      };
    }),
  ];
  const [parentBindingTab, setParentBindingTab] = useState<'unbound' | 'bound'>('unbound');
  const hasParentBinding = (student: ParentBindingProfile) => student.guardians.length > 0;
  const sortedParentBindingRows = [...parentBindingRows].sort((a, b) => Number(hasParentBinding(a)) - Number(hasParentBinding(b)));
  const unboundParentBindingRows = parentBindingRows.filter((student) => !hasParentBinding(student));
  const boundParentBindingRows = parentBindingRows.filter((student) => hasParentBinding(student));
  const boundParentCount = boundParentBindingRows.length;
  const visibleStudentRows = studentRows.filter((student) => {
    const keyword = studentSearch.trim();
    const matchesSearch = !keyword || student.name.includes(keyword) || student.no.includes(keyword);
    const matchesGender = studentGenderFilter === 'all' || student.gender === studentGenderFilter;
    return matchesSearch && matchesGender;
  });
  const createStudentBatchEditRows = () => studentRows.map((student, index) => ({
    id: index + 1,
    name: student.name,
    no: student.no,
    gender: student.gender,
  }));
  const activeClassTitle = `${activeClassProfile.name}（${inferGradeLabel(activeClassProfile.stage, activeClassProfile.entryYearValue)}）`;
  const isParentInviteBinding = parentPage === 'bindInviteMatched';
  const isParentMatchedBinding = parentPage === 'bindSelfMatched' || parentPage === 'bindInviteMatched';
  const matchedParentStudents = parentMatchedStudentCandidates.filter((student) => student.reservedPhone === parentIdentityForm.phone);
  const parentMatchedStudents = matchedParentStudents.length ? matchedParentStudents : parentMatchedStudentCandidates;
  const normalizedParentMatchedStudentIndex = Math.min(activeParentMatchedStudentIndex, parentMatchedStudents.length - 1);
  const matchedParentStudent = parentMatchedStudents[normalizedParentMatchedStudentIndex] ?? parentMatchedStudents[0];
  const parentStudentName = matchedParentStudent?.name ?? '张天天';
  const parentStudentMaskedName = parentStudentName;
  const parentMaskedPhone = parentIdentityForm.phone.replace(/^(\d{3})\d{4}(\d+)$/, '$1****$2');
  const parentIdentityComplete = parentIdentityForm.relation !== '其他' || Boolean(parentIdentityForm.relationOther.trim());
  const parentInviteStudentComplete = Boolean(parentInviteStudentForm.name.trim() && parentInviteStudentForm.no.trim());
  const hasNextParentMatchedStudent = normalizedParentMatchedStudentIndex < parentMatchedStudents.length - 1;
  const continueParentBindingFlow = () => {
    const nextIndex = normalizedParentMatchedStudentIndex + 1;
    if (hasNextParentMatchedStudent) {
      setActiveParentMatchedStudentIndex(nextIndex);
      return;
    }
    jumpToParentPage('landing');
  };

  const renderParentStudentCard = (studentName = parentStudentMaskedName) => (
    <article className="min-h-[132px] rounded-3xl border border-gray-900 bg-gray-50 p-4 text-left">
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white text-xl font-black text-gray-500">{studentName.slice(0, 1)}</div>
        <div className="min-w-0 flex-1">
          <div className="truncate text-xl font-black leading-7 text-gray-950">{studentName}</div>
          <div className="mt-1 text-sm font-semibold text-gray-500">2025级1班</div>
          <div className="mt-1 text-xs font-medium text-gray-400">星河实验小学</div>
        </div>
      </div>
    </article>
  );

  const startParentBindingLookup = (hasResult = true) => {
    setParentBindingReturnPage('landing');
    showClassActionToast('正在查找可绑定学生');
    if (parentBindingLookupTimerRef.current !== null) {
      window.clearTimeout(parentBindingLookupTimerRef.current);
    }
    parentBindingLookupTimerRef.current = window.setTimeout(() => {
      parentBindingLookupTimerRef.current = null;
      jumpToParentPage(hasResult ? 'bindSelfMatched' : 'bindSelfUnmatched');
    }, 1100);
  };

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
    setPrototypeWidths((widths) => ({
      ...widths,
      [surface]: Math.min(getPrototypeWidthMax(surface), Math.max(24, drag.startWidth + deltaPercent)),
    }));
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
    setShowSpaceSelectSheet(false);
    setShowStudentScanSheet(false);
    setShowBasicInfoEditSheet(false);
    setShowTermEditSheet(false);
    setActiveTermAction(null);
    setShowTeachingSheet(false);
    setShowInviteOptionsSheet(false);
    setShowWechatChatSheet(false);
    setShowClassCodeInviteSheet(false);
    setShowInviteConfirmSheet(false);
    setShowClassExitSheet(false);
    setShowClassEditSheet(false);
    setClassDeleteConfirmText('');
    setEditingTeachingIndex(null);
    setActiveClassAction(null);
    setActiveTeacherAction(null);
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
    setShowSpaceSelectSheet(false);
    setShowStudentScanSheet(false);
    setShowBasicInfoEditSheet(false);
    setShowTermEditSheet(false);
    setActiveTermAction(null);
    setShowTeachingSheet(false);
    setShowInviteOptionsSheet(false);
    setShowWechatChatSheet(false);
    setShowClassCodeInviteSheet(false);
    setShowInviteConfirmSheet(false);
    setShowClassExitSheet(false);
    setShowClassEditSheet(false);
    setClassDeleteConfirmText('');
    setEditingTeachingIndex(null);
    setActiveClassAction(null);
    setActiveTeacherAction(null);
    setClassActionToast('');
    setHistory([]);
    if (next === 'classDetail' || next === 'classDetailSchoolHead') {
      setActiveClassProfile({
        name: '2025级1班',
        code: '58273914',
        stage: '小学',
        entryYearValue: 2025,
        count: 2,
        creatorName: teacherName.trim() || '郭老师',
        isCreator: true,
      });
    }
    if (next === 'classDetailMember') {
      setActiveClassProfile({
        name: '2024级2班',
        code: '73948162',
        stage: '初中',
        entryYearValue: 2024,
        count: 0,
        creatorName: '陈老师',
        isCreator: false,
      });
    }
    if (next === 'minePersonal') setCurrentSpaceId('personal');
    if (next === 'mineSchool') setCurrentSpaceId(defaultTeacherSpaceId);
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
      setStudentInputRows([{ id: 1, name: '', no: '', gender: '男' }]);
      setStudentBatchEditRows([]);
      return;
    }
    if (next === 'home') {
      if (!teacherName.trim()) setTeacherName('郭');
      setClassCreated(false);
      setJoinedClassHasStudents(false);
      setStudentCount(0);
      setRecordCount(0);
      setShowMultiResult(false);
      setStudentInputRows([{ id: 1, name: '', no: '', gender: '男' }]);
      setStudentBatchEditRows([]);
      return;
    }
    if (!teacherName.trim()) setTeacherName('郭');
    if (next !== 'profile') setClassCreated(true);
    if (['record', 'aiResult', 'editResult', 'classReport', 'termReport', 'studentDetail'].includes(next)) {
      setStudentCount((count) => Math.max(count, 2));
      setRecordCount((count) => Math.max(count, 2));
    }
    if (['studentList', 'studentBatchEdit', 'classReport', 'termReport', 'studentDetail'].includes(next)) {
      setStudentCount((count) => Math.max(count, 2));
    }
    if (next === 'studentAdd') {
      setStudentInputRows([{ id: 1, name: '', no: '', gender: '男' }]);
    }
    if (next === 'studentBatchEdit' && studentBatchEditRows.length === 0) {
      setStudentBatchEditRows(createStudentBatchEditRows());
    }
  };

  const jumpToPath = (target: PathTarget) => {
    if (target.type === 'page') {
      jumpToPage(target.page);
      if (target.page === 'login') setPendingInviteAfterLogin(true);
      return;
    }

    jumpToPage(getClassListPageForCurrentSpace());
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

  const getClassListPageForCurrentSpace = (): PageKey => {
    const currentSpace = teacherSpaces.find((space) => space.id === currentSpaceId) ?? teacherSpaces[0];
    return currentSpace.type === 'school' ? 'classListSchool' : 'classListPersonal';
  };

  const getDefaultParentDirectoryNodeKey = (next: ParentPageKey) => {
    const findNodeKey = (nodes: ParentFlowNode[], keyPrefix: string): string | null => {
      for (const node of nodes) {
        const nodeKey = `${keyPrefix}-${node.page}`;
        if (node.page === next) return nodeKey;
        if (node.branches) {
          for (const branch of node.branches) {
            const branchKey = findNodeKey(branch.pages, `${nodeKey}-${branch.text}`);
            if (branchKey) return branchKey;
          }
        }
      }
      return null;
    };

    for (const lane of parentFlowLanes) {
      if ('branches' in lane) {
        if (lane.source === next) return `${lane.title}-source-${next}`;
        for (const branch of lane.branches) {
          const branchKey = findNodeKey(branch.pages, `${lane.title}-${branch.text}`);
          if (branchKey) return branchKey;
        }
      } else {
        const nodeKey = findNodeKey(lane.nodes, `${lane.title}-node`);
        if (nodeKey) return nodeKey;
      }
    }
    return `${next}`;
  };

  const isSameParentDirectoryPage = (pageA: ParentPageKey, pageB: ParentPageKey) => {
    const normalize = (page: ParentPageKey) => (
      page === 'bindSelfMatched' || page === 'bindInviteMatched' ? 'matchedBinding' : page
    );
    return normalize(pageA) === normalize(pageB);
  };

  const jumpToParentPage = (next: ParentPageKey, directoryNodeKey?: string) => {
    setParentPage(next);
    setActiveParentDirectoryNodeKey(directoryNodeKey || getDefaultParentDirectoryNodeKey(next));
    setParentBindingLookupState('idle');
    if ((next === 'bindSelfMatched' || next === 'bindSelfUnmatched' || next === 'bindInviteMatched' || next === 'bindInviteUnmatched' || next === 'bindInviteBoundUnmatched' || next === 'bindingLimitNotice' || next === 'bindingNotice') && directoryNodeKey) {
      setParentBindingReturnPage(directoryNodeKey.startsWith('自主新增绑定') ? 'landing' : 'login');
    }
    if (next === 'bindSelfMatched' || next === 'bindSelfUnmatched') setParentBindMode('school');
    if (next === 'bindInviteMatched' || next === 'bindInviteUnmatched' || next === 'bindInviteBoundUnmatched') setParentBindMode('class');
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
      navigate(getClassListPageForCurrentSpace());
      return;
    }
    navigate(getClassListPageForCurrentSpace());
    setShowInviteConfirmSheet(true);
  };

  const openStudentAdd = () => {
    setStudentInputRows([{ id: 1, name: '', no: '', gender: '男' }]);
    navigate('studentAdd');
  };

  const openStudentBatchEdit = () => {
    setStudentBatchEditRows(createStudentBatchEditRows());
    navigate('studentBatchEdit');
  };

  const addStudentInputRow = () => {
    setStudentInputRows((rows) => [...rows, { id: Math.max(...rows.map((row) => row.id)) + 1, name: '', no: '', gender: '男' }]);
  };

  const fillStudentsFromScannedTable = () => {
    setStudentInputRows([
      { id: 1, name: '林小杰', no: '20250101', gender: '男' },
      { id: 2, name: '周雨晴', no: '', gender: '女' },
      { id: 3, name: '陈浩然', no: '20250103', gender: '男' },
    ]);
    setShowStudentScanSheet(false);
  };

  const updateStudentInputRow = (id: number, patch: Partial<Omit<StudentInputRow, 'id'>>) => {
    setStudentInputRows((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  const updateStudentBatchEditRow = (id: number, patch: Partial<Omit<StudentInputRow, 'id'>>) => {
    setStudentBatchEditRows((rows) => rows.map((row) => row.id === id ? { ...row, ...patch } : row));
  };

  const removeStudentInputRow = (id: number) => {
    setStudentInputRows((rows) => rows.length > 1 ? rows.filter((row) => row.id !== id) : rows);
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
    setTeachingSelectedClasses(['2025级1班']);
    setTeachingSubject('英语');
    setShowTeachingSheet(true);
  };

  const openTeachingEdit = (index: number) => {
    const row = teachingInfoRows[index];
    if (!row) return;
    setEditingTeachingIndex(index);
    const rowGrade = (row.classes[0]?.slice(0, 5) || '2025级') as TeachingGrade;
    setTeachingGrade(rowGrade);
    setTeachingSelectedClasses(row.classes);
    setTeachingSubject(row.subject);
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
    if (teachingSelectedClasses.length === 0) return;
    if (editingTeachingIndex === null) {
      setTeachingInfoRows((rows) => [
        ...rows,
        {
          id: Math.max(0, ...rows.map((row) => row.id)) + 1,
          subject: teachingSubject,
          classes: teachingSelectedClasses,
        },
      ]);
    } else {
      setTeachingInfoRows((rows) => rows.map((row, index) => (
        index === editingTeachingIndex ? { ...row, subject: teachingSubject, classes: teachingSelectedClasses } : row
      )));
    }
    setShowTeachingSheet(false);
  };

  const removeTeachingRow = (index: number) => {
    setTeachingInfoRows((rows) => rows.length > 1 ? rows.filter((_, rowIndex) => rowIndex !== index) : rows);
    if (editingTeachingIndex === index) setEditingTeachingIndex(null);
  };

  const openTeacherBasicConfigSheet = (key: TeacherBasicConfigKey) => {
    setActiveTeacherBasicConfig(key);
    setDraftTeacherBasicConfigValue(teacherBasicConfigValues[key]);
  };

  const submitTeacherBasicConfigSheet = () => {
    if (!activeTeacherBasicConfig || !draftTeacherBasicConfigValue) return;
    setTeacherBasicConfigValues((values) => ({
      ...values,
      [activeTeacherBasicConfig]: draftTeacherBasicConfigValue,
    }));
    setActiveTeacherBasicConfig(null);
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
      <button type="button" onClick={() => navigate(getClassListPageForCurrentSpace())} className={cx((page === 'classListPersonal' || page === 'classListSchool') && 'bg-gray-950 text-white')}>班级</button>
      <button type="button" onClick={() => navigate((teacherSpaces.find((space) => space.id === currentSpaceId)?.type ?? 'personal') === 'school' ? 'mineSchool' : 'minePersonal')} className={cx('rounded-r-[14px]', (page === 'minePersonal' || page === 'mineSchool') && 'bg-gray-950 text-white')}>我的</button>
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

  const openBasicInfoEditSheet = (item?: SchoolBasicInfoItem) => {
    setEditingBasicInfoItem(item ?? null);
    setShowBasicInfoEditSheet(true);
  };

  const openSubjectEditSheet = (item?: SchoolSubjectItem) => {
    setEditingSubjectItem(item ?? null);
    setShowSubjectEditSheet(true);
  };

  const moveSubjectItem = (dragId: string, targetId: string) => {
    if (dragId === targetId) return;
    setSubjectItems((items) => {
      const fromIndex = items.findIndex((item) => item.id === dragId);
      const toIndex = items.findIndex((item) => item.id === targetId);
      if (fromIndex < 0 || toIndex < 0) return items;
      const nextItems = [...items];
      const [movedItem] = nextItems.splice(fromIndex, 1);
      nextItems.splice(toIndex, 0, movedItem);
      return nextItems;
    });
  };

  const openSchoolBasicInfo = (tab: SchoolBasicInfoTab) => {
    setActiveBasicInfoTab(tab);
    const pageMap: Record<SchoolBasicInfoTab, PageKey> = {
      term: 'termManagement',
      subject: 'subjectManagement',
      department: 'departmentManagement',
    };
    navigate(pageMap[tab]);
  };

  const updateSunshineRatio = (value: number) => {
    const nextValue = Math.max(0, Math.min(100, value));
    setSunshineRatio(nextValue);
    setRankingRatio(100 - nextValue);
  };

  const updateRankingRatio = (value: number) => {
    const nextValue = Math.max(0, Math.min(100, value));
    setRankingRatio(nextValue);
    setSunshineRatio(100 - nextValue);
  };

  const openFinalReportConfirmSheet = () => {
    setShowFinalReportSamplePreview(false);
    setShowFinalReportConfirmSheet(true);
  };

  const openTermEditSheet = (item?: SchoolTermItem) => {
    setEditingTermItem(item ?? null);
    setShowTermEditSheet(true);
  };

  const BasicInfoStatusBadge = ({ status }: { status: SchoolBasicInfoItem['status'] }) => (
    <span className={cx(
      'shrink-0 rounded-lg px-2 py-1 text-[11px] font-black',
      status === 'current' && 'bg-teal-50 text-teal-700',
      status === 'draft' && 'bg-blue-50 text-blue-700',
      status === 'enabled' && 'bg-gray-900 text-white',
      status === 'disabled' && 'bg-gray-100 text-gray-500'
    )}>
      {schoolBasicInfoStatusLabels[status]}
    </span>
  );

  const openInviteForClass = (audience: InviteAudience, returnPage: PageKey, classInfo?: { name: string; code: string }) => {
    setInviteClass({ ...(classInfo ?? { name: activeClassProfile.name, code: activeClassProfile.code }), inviter: teacherName.trim() || '郭老师' });
    setInviteAudience(audience);
    setInviteReturnPage(returnPage);
    setShowInviteOptionsSheet(true);
  };

  const runClassAction = (key: ClassActionKey) => {
    if (key === 'batchStudents') {
      openStudentBatchEdit();
      return;
    }
    if (key === 'reward' || key === 'homework' || key === 'leftStudents') {
      navigate('studentList');
      return;
    }
    if (key === 'editClass') {
      navigate(getClassDetailPageForProfile(activeClassProfile));
      return;
    }
    if (key === 'inviteTeacher' || key === 'inviteParent') {
      openInviteForClass(key === 'inviteTeacher' ? 'teacher' : 'parent', getClassListPageForCurrentSpace(), activeClassAction ?? undefined);
      setActiveClassAction(null);
      return;
    }
    const toastMap: Record<Exclude<ClassActionKey, 'reward' | 'homework' | 'batchStudents' | 'leftStudents' | 'editClass' | 'inviteTeacher' | 'inviteParent'>, string> = {
      password: '设置兑换密码',
      face: '更新人脸数据',
    };
    showClassActionToast(toastMap[key]);
    setActiveClassAction(null);
  };

  const openClassDetail = (profile: ClassProfile) => {
    setActiveClassProfile(profile);
    setActiveClassAction(null);
    navigate(getClassDetailPageForProfile(profile));
  };

  const openClassEditSheet = () => {
    setDraftClassNumber(getClassNumberFromName(activeClassProfile.name));
    setDraftClassStage(activeClassProfile.stage);
    setDraftClassEntryYear(activeClassProfile.entryYearValue);
    setShowClassEditSheet(true);
  };

  const submitClassEditSheet = () => {
    const nextClassNumber = draftClassNumber.trim();
    if (!nextClassNumber) return;
    setActiveClassProfile((profile) => ({
      ...profile,
      name: buildClassName(draftClassEntryYear, nextClassNumber),
      stage: draftClassStage,
      entryYearValue: draftClassEntryYear,
    }));
    setShowClassEditSheet(false);
  };

  const classActionGroups = [
    {
      title: '日常操作',
      items: [
        { key: 'homework' as const, label: '作业录入', icon: FileText },
        { key: 'reward' as const, label: '兑换奖励', icon: Gift },
      ],
    },
    {
      title: '学生信息更新',
      items: [
        { key: 'batchStudents' as const, label: '批量修改学生', icon: Users },
        { key: 'face' as const, label: '更新人脸数据', icon: ScanFace },
        { key: 'password' as const, label: '设置兑换密码', icon: Shield },
      ],
    },
    {
      title: '协同管理',
      items: [
        { key: 'inviteTeacher' as const, label: '邀请老师加入', icon: UserPlus },
        { key: 'inviteParent' as const, label: '邀请家长加入', icon: MessageCircle },
      ],
    },
    {
      title: '班级维护',
      items: [
        { key: 'leftStudents' as const, label: '离校学生管理', icon: Users },
        { key: 'editClass' as const, label: '编辑班级信息', icon: Edit3 },
      ],
    },
  ];

  const ClassCard = ({ name, code, stage, entryYearValue, tags, count, creatorName, isCreator }: { name: string; code: string; stage: '小学' | '初中' | '高中'; entryYearValue: number; tags: string[]; count: number; creatorName: string; isCreator: boolean }) => (
    <div className="relative rounded-2xl bg-gray-50 p-4">
      <button
        type="button"
        aria-label={`${name}更多操作`}
        onClick={() => {
          setActiveClassProfile({ name, code, stage, entryYearValue, count, creatorName, isCreator });
          setActiveClassAction({ name, code });
        }}
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

  const renderTeacherActionSheet = () => {
    if (!activeTeacherAction) return null;
    const deputyHeadTeacherActionLabel = activeTeacherAction.isDeputyHeadTeacher ? '取消副班主任' : '设为副班主任';
    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="老师更多操作">
        <button type="button" aria-label="关闭老师更多操作" className="absolute inset-0 cursor-default" onClick={() => setActiveTeacherAction(null)} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="truncate text-lg font-black">{activeTeacherAction.name}</div>
              <TeacherRoleTags teacher={activeTeacherAction} />
            </div>
            <button type="button" onClick={() => setActiveTeacherAction(null)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg font-black active:bg-gray-100">×</button>
          </div>
          <div className="space-y-2">
            <button
              type="button"
              onClick={() => {
                showClassActionToast(`${activeTeacherAction.name}${activeTeacherAction.isDeputyHeadTeacher ? '已取消副班主任' : '已设为副班主任'}`);
                setActiveTeacherAction(null);
              }}
              className="flex h-12 w-full items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-black active:bg-gray-100"
            >
              <span>{deputyHeadTeacherActionLabel}</span>
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              onClick={() => {
                setRemoveTeacherCandidate(activeTeacherAction);
                setActiveTeacherAction(null);
              }}
              className="flex h-12 w-full items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 text-sm font-black text-gray-950 active:bg-gray-100"
            >
              <span>移除老师</span>
              <Trash2 size={16} />
            </button>
          </div>
        </section>
      </div>
    );
  };

  const renderRemoveTeacherConfirmSheet = () => {
    if (!removeTeacherCandidate) return null;
    const close = () => setRemoveTeacherCandidate(null);

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[130] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="确认移除老师">
        <button type="button" aria-label="关闭移除老师确认弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">确认移除老师</h3>
          <p className="mt-3 text-sm font-medium leading-7 text-gray-700">
            移除后，{removeTeacherCandidate.name}将不再管理「{activeClassProfile.name}」。
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={close} className="h-12 rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100">取消</button>
            <button
              type="button"
              onClick={() => {
                showClassActionToast(`已移除${removeTeacherCandidate.name}`);
                close();
              }}
              className="h-12 rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white"
            >
              确认移除
            </button>
          </div>
        </section>
      </div>
    );
  };

  const renderRemoveParentBindingConfirmSheet = () => {
    if (!removeParentBindingCandidate) return null;
    const close = () => setRemoveParentBindingCandidate(null);

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[130] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="确认移除家长绑定">
        <button type="button" aria-label="关闭移除家长绑定确认弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">确认移除绑定</h3>
          <p className="mt-3 text-sm font-medium leading-7 text-gray-700">
            移除后，{removeParentBindingCandidate.guardianLabel}将不能继续查看{removeParentBindingCandidate.studentName}的成长信息。
          </p>
          <div className="mt-3 rounded-2xl bg-gray-50 px-3 py-2 text-sm font-black tabular-nums text-gray-950">
            {removeParentBindingCandidate.phone}
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={close} className="h-12 rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100">取消</button>
            <button
              type="button"
              onClick={() => {
                showClassActionToast(`已移除${removeParentBindingCandidate.studentName}${removeParentBindingCandidate.guardianLabel}绑定`);
                close();
              }}
              className="h-12 rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white"
            >
              确认移除
            </button>
          </div>
        </section>
      </div>
    );
  };

  const renderParentBindingDetailSheet = () => {
    if (!activeParentBindingCandidate) return null;
    const close = () => setActiveParentBindingCandidate(null);
    const currentGuardianLabel = activeParentBindingCandidate.relation === '其他'
      ? activeParentBindingCandidate.relationOther.trim() || '其他'
      : activeParentBindingCandidate.relation;
    const canSaveParentBinding = activeParentBindingCandidate.phone.trim().length >= 7
      && (activeParentBindingCandidate.relation !== '其他' || Boolean(activeParentBindingCandidate.relationOther.trim()));

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[130] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="家长绑定详情">
        <button type="button" aria-label="关闭家长绑定详情弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <div className="mb-4 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-base font-black">家长绑定详情</h3>
              <div className="mt-1 truncate text-sm font-semibold text-gray-500">{activeParentBindingCandidate.studentName}的{currentGuardianLabel}</div>
            </div>
            <button type="button" onClick={close} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg font-black active:bg-gray-100">×</button>
          </div>
          <div className="space-y-3 rounded-2xl bg-gray-50 p-3">
            <label className="block">
              <span className="text-xs font-black text-gray-500">关系</span>
              <select
                value={activeParentBindingCandidate.relation}
                onChange={(event) => setActiveParentBindingCandidate((current) => current ? { ...current, relation: event.target.value as ParentIdentityRelation } : current)}
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-950 outline-none focus:border-gray-900"
                aria-label="编辑家长关系"
              >
                {parentIdentityRelationOptions.map((relation) => (
                  <option key={relation} value={relation}>{relation}</option>
                ))}
              </select>
            </label>
            {activeParentBindingCandidate.relation === '其他' && (
              <label className="block">
                <span className="text-xs font-black text-gray-500">具体关系</span>
                <input
                  value={activeParentBindingCandidate.relationOther}
                  onChange={(event) => setActiveParentBindingCandidate((current) => current ? { ...current, relationOther: event.target.value } : current)}
                  className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold text-gray-950 outline-none focus:border-gray-900"
                  placeholder="请输入关系"
                  aria-label="编辑其他关系"
                />
              </label>
            )}
            <label className="block">
              <span className="text-xs font-black text-gray-500">手机号</span>
              <input
                value={activeParentBindingCandidate.phone}
                onChange={(event) => setActiveParentBindingCandidate((current) => current ? { ...current, phone: event.target.value } : current)}
                className="mt-2 h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-semibold tabular-nums text-gray-950 outline-none focus:border-gray-900"
                inputMode="tel"
                aria-label="编辑家长手机号"
              />
            </label>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => showClassActionToast(`正在拨打${activeParentBindingCandidate.studentName}${currentGuardianLabel}电话`)}
              className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white active:bg-gray-800"
            >
              <Phone size={16} />
              拨打电话
            </button>
            {canRemoveParentBinding && (
              <button
                type="button"
                onClick={() => {
                  setRemoveParentBindingCandidate({
                    studentName: activeParentBindingCandidate.studentName,
                    guardianLabel: currentGuardianLabel,
                    phone: activeParentBindingCandidate.phone,
                  });
                  close();
                }}
                className="flex h-12 items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white text-sm font-black text-red-600 active:bg-red-50"
              >
                <Trash2 size={16} />
              移除绑定
            </button>
          )}
          </div>
          <button
            type="button"
            disabled={!canSaveParentBinding}
            onClick={() => {
              showClassActionToast(`已保存${activeParentBindingCandidate.studentName}家长信息`);
              close();
            }}
            className={cx(
              'mt-2 h-12 w-full rounded-2xl border border-gray-200 text-sm font-black',
              canSaveParentBinding ? 'bg-white text-gray-950 active:bg-gray-50' : 'bg-gray-100 text-gray-400'
            )}
          >
            保存修改
          </button>
        </section>
      </div>
    );
  };

  const renderTransferHeadTeacherSheet = () => {
    if (!showTransferHeadTeacherSheet) return null;
    const close = () => setShowTransferHeadTeacherSheet(false);

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="选择新班主任">
        <button type="button" aria-label="关闭选择新班主任弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'flex max-h-[82%] flex-col rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <div className="mb-3 flex items-center justify-between gap-3">
            <h3 className="text-base font-black">转移班主任</h3>
            <button type="button" onClick={close} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-50 text-lg font-black active:bg-gray-100">×</button>
          </div>
          <div className="min-h-0 flex-1 space-y-2 overflow-y-auto">
            {transferHeadTeacherCandidates.map((teacher) => (
              <button
                key={teacher.name}
                type="button"
                onClick={() => {
                  setShowTransferHeadTeacherSheet(false);
                  setTransferHeadTeacherCandidate(teacher);
                }}
                className="flex min-h-[74px] w-full items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-3 text-left active:bg-gray-100"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black">{teacher.name.slice(0, 1)}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-black">{teacher.name}</div>
                  <TeacherRoleTags teacher={teacher} />
                </div>
                <ChevronRight size={16} className="shrink-0 text-gray-400" />
              </button>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const renderTransferHeadTeacherConfirmSheet = () => {
    if (!transferHeadTeacherCandidate) return null;
    const close = () => setTransferHeadTeacherCandidate(null);

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[130] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="确认转移班主任">
        <button type="button" aria-label="关闭转移班主任确认弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">确认转移班主任</h3>
          <p className="mt-3 text-sm font-medium leading-7 text-gray-700">
            将「{activeClassProfile.name}」班主任转移给{transferHeadTeacherCandidate.name}。确认后，你不再拥有该班级班主任权限。
          </p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={close} className="h-12 rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100">取消</button>
            <button
              type="button"
              onClick={() => {
                setClassHeadTeacherName(transferHeadTeacherCandidate.name);
                showClassActionToast(`班主任已转移给${transferHeadTeacherCandidate.name}`);
                close();
              }}
              className="h-12 rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white"
            >
              确认转移
            </button>
          </div>
        </section>
      </div>
    );
  };

  const inviteCopy = {
    title: inviteAudience === 'teacher' ? '邀请老师加入' : '邀请家长加入',
    ariaLabel: inviteAudience === 'teacher' ? '邀请老师加入' : '邀请家长加入',
    appName: inviteAudience === 'teacher' ? 'AI素养评价' : '素养指南针',
    cardTitle: inviteAudience === 'teacher'
      ? `${inviteClass.inviter}邀请你加入「${inviteClass.name}」`
      : `${inviteClass.inviter}邀请你绑定学生`,
    cardHero: inviteAudience === 'teacher' ? '邀请' : '指南针',
    cardAction: inviteAudience === 'teacher' ? '立即加入' : '立即查看',
    codeTitle: inviteAudience === 'teacher' ? '班级号邀请' : '家长邀请',
    copiedToast: inviteAudience === 'teacher' ? '已复制邀请文案' : '已复制家长邀请文案',
    codeText: inviteAudience === 'teacher'
      ? `Hi，我正在用「AI素养评价」记录学生日常表现。你可以输入班级号 ${inviteClass.code}，加入「${inviteClass.name}」一起管理班级；也可以点击链接 ai-literacy://join-class?code=${inviteClass.code} 直接加入。`
      : `家长您好，${inviteClass.inviter}邀请您绑定「${inviteClass.name}」学生，查看孩子的日常评价记录和成长报告。请在「素养指南针」中输入班级号 ${inviteClass.code}，或点击链接 ai-literacy://bind-student?code=${inviteClass.code} 完成绑定。`,
    confirmText: inviteAudience === 'teacher'
      ? `${inviteClass.inviter}邀请你一起管理「${inviteClass.name}」。加入后，你可以查看班级学生，并使用 AI 记录学生日常行为、生成评价报告。`
      : `${inviteClass.inviter}邀请你绑定「${inviteClass.name}」学生。绑定后，你可以查看孩子的日常评价记录和成长报告。`,
  };

  const renderInviteOptionsSheet = () => {
    if (!showInviteOptionsSheet) return null;
    const close = () => setShowInviteOptionsSheet(false);

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label={inviteCopy.ariaLabel}>
        <button type="button" aria-label="关闭邀请方式弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">{inviteCopy.title}</h3>
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
    const displayShareTo = wechatShareSentTo;
    const openReceivedCard = () => {
      close();
      setWechatShareSentTo('');
      if (inviteAudience === 'parent') {
        setSurface('parent');
        setParentLoginTarget('bindInviteMatched');
        jumpToParentPage('login');
        return;
      }
      setInviteeLoggedIn(false);
      setInviteeAlreadyJoined(false);
      setPendingInviteAfterLogin(true);
      navigate('login');
    };
    const sendCard = () => {
      close();
      setWechatShareSentTo('');
      if (inviteAudience === 'parent' || inviteAudience === 'teacher') {
        setWechatInviteMode('select');
        setActiveClassAction(null);
        setShowInviteOptionsSheet(false);
        setShowClassCodeInviteSheet(false);
        jumpToPage(inviteReturnPage);
        return;
      }
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
                  <div className="text-xs font-medium text-gray-500">{inviteCopy.appName}</div>
                  <div className="mt-2 text-base font-black leading-6">{inviteCopy.cardTitle}</div>
                  <div className="mt-3 flex aspect-[4/3] flex-col items-center justify-center rounded-xl bg-gray-50">
                    <div className="text-3xl font-black">{inviteCopy.cardHero}</div>
                    <div className="mt-3 rounded-full bg-white px-5 py-2 text-sm font-black">{inviteCopy.cardAction}</div>
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
                    <div className="truncate text-lg font-black">{displayShareTo}</div>
                  </div>
                  <ChevronRight size={18} className="text-gray-400" />
                </div>
                <div className="mx-auto mt-5 w-56 rounded-xl border border-gray-200 bg-white p-3 shadow-sm">
                  <div className="text-xs font-medium text-gray-500">{inviteCopy.appName}</div>
                  <div className="mt-2 text-sm font-black leading-5">{inviteCopy.cardTitle}</div>
                  <div className="mt-3 flex aspect-[4/3] flex-col items-center justify-center rounded-xl bg-gray-50">
                    <div className="text-xl font-black">{inviteCopy.cardHero}</div>
                    <div className="mt-2 rounded-full bg-white px-4 py-1.5 text-xs font-black">{inviteCopy.cardAction}</div>
                  </div>
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

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="班级号邀请">
        <button type="button" aria-label="关闭班级号邀请弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'max-h-[86%] overflow-y-auto rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">{inviteCopy.codeTitle}</h3>
          <div className="mt-4 rounded-2xl bg-gray-50 p-4 text-sm font-medium leading-7 text-gray-700">{inviteCopy.codeText}</div>
          <button
            type="button"
            onClick={() => {
              close();
              showClassActionToast(inviteCopy.copiedToast);
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
          <h3 className="text-base font-black">{inviteAudience === 'teacher' ? '加入班级邀请' : '绑定学生邀请'}</h3>
          <p className="mt-3 text-sm font-medium leading-7 text-gray-700">{inviteCopy.confirmText}</p>
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
                navigate(getClassListPageForCurrentSpace());
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

  const renderClassEditSheet = () => {
    if (!showClassEditSheet) return null;
    const close = () => setShowClassEditSheet(false);
    const canSubmit = Boolean(draftClassNumber.trim());

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="编辑班级信息">
        <button type="button" aria-label="关闭编辑班级信息弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">编辑班级信息</h3>
          <div className="mt-4 space-y-3">
            <div>
              <div className="text-xs font-black text-gray-500">学段</div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {(['小学', '初中', '高中'] as const).map((stage) => (
                  <button
                    key={stage}
                    type="button"
                    onClick={() => setDraftClassStage(stage)}
                    className={cx('h-11 rounded-2xl border border-gray-200 text-sm font-black active:bg-gray-100', draftClassStage === stage ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-950')}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
            <label className="block text-xs font-black text-gray-500">
              入学年份
              <select
                value={draftClassEntryYear}
                onChange={(event) => setDraftClassEntryYear(Number(event.target.value))}
                className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm font-black text-gray-950"
                aria-label="入学年份"
              >
                {[2026, 2025, 2024, 2023, 2022, 2021].map((year) => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </label>
            <label className="block text-xs font-black text-gray-500">
              班号
              <div className="mt-2 flex h-12 items-center rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-950">
                <span className="shrink-0">{draftClassEntryYear}级</span>
                <input
                  value={draftClassNumber}
                  onChange={(event) => setDraftClassNumber(event.target.value.replace(/[^0-9]/g, ''))}
                  className="mx-2 h-8 w-16 rounded-xl border border-gray-200 bg-white text-center text-sm font-black text-gray-950"
                  inputMode="numeric"
                  aria-label="班号数字"
                />
                <span className="shrink-0">班</span>
              </div>
            </label>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <button type="button" onClick={close} className="h-12 rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100">取消</button>
            <button
              type="button"
              disabled={!canSubmit}
              onClick={submitClassEditSheet}
              className={cx('h-12 rounded-2xl border border-gray-200 text-sm font-black', canSubmit ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400')}
            >
              完成
            </button>
          </div>
        </section>
      </div>
    );
  };

  const renderClassExitSheet = () => {
    if (!showClassExitSheet) return null;
    const close = () => {
      setShowClassExitSheet(false);
      setClassDeleteConfirmText('');
    };
    const isCreator = activeClassProfile.isCreator;
    const isSchoolHead = page === 'classDetailSchoolHead';
    const canDissolve = classDeleteConfirmText.trim() === 'delete';
    const isDissolveMode = isCreator && !isSchoolHead;

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label={isDissolveMode ? '确认解散班级' : '确认退出班级'}>
        <button type="button" aria-label="关闭班级操作确认弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">{isDissolveMode ? '解散班级' : '退出班级'}</h3>
          <p className="mt-3 text-sm font-medium leading-7 text-gray-700">
            {isDissolveMode
              ? `你是「${activeClassProfile.name}」的创建人。解散后，老师将无法继续共同管理该班级。`
              : `退出后，你将不再管理「${activeClassProfile.name}」，该班级数据仍由创建人保留。`}
          </p>
          {isDissolveMode && (
            <label className="mt-4 block text-xs font-black text-gray-500">
              输入 delete 确认解散
              <input
                value={classDeleteConfirmText}
                onChange={(event) => setClassDeleteConfirmText(event.target.value)}
                className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm font-normal text-gray-950"
                placeholder="delete"
                aria-label="输入 delete 确认解散"
              />
            </label>
          )}
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={close} className="h-12 rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100">取消</button>
            <button
              type="button"
              disabled={isDissolveMode && !canDissolve}
              onClick={() => {
                close();
                showClassActionToast(isDissolveMode ? '已解散班级' : '已退出班级');
                navigate(getClassListPageForCurrentSpace());
              }}
              className={cx(
                'h-12 rounded-2xl border border-gray-200 text-sm font-black',
                isDissolveMode && !canDissolve ? 'bg-gray-100 text-gray-400' : 'bg-gray-900 text-white'
              )}
            >
              {isDissolveMode ? '确认解散' : '确认退出'}
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

  const TeacherRoleTags = ({ teacher }: { teacher: ClassTeacherProfile }) => (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {teacher.isHeadTeacher && <span className="rounded-lg bg-gray-900 px-2 py-0.5 text-[11px] font-black text-white">班主任</span>}
      {teacher.isDeputyHeadTeacher && <span className="rounded-lg bg-gray-300 px-2 py-0.5 text-[11px] font-black text-gray-900">副班主任</span>}
      {teacher.subjects.map((subject) => (
        <span key={`${teacher.name}-${subject}`} className="rounded-lg border border-gray-200 bg-white px-2 py-0.5 text-[11px] font-bold text-gray-600">{subject}</span>
      ))}
    </div>
  );

  const CountText = ({ children }: { children: React.ReactNode }) => (
    <span className="ml-1 align-baseline text-xs font-semibold text-gray-400 tabular-nums">{children}</span>
  );

  const getParentGuardianLabel = (guardian: ParentBindingProfile['guardians'][number]) => (
    guardian.relation === '其他' ? guardian.relationOther?.trim() || '其他' : guardian.relation
  );
  const canRemoveParentBinding = activeClassProfile.isCreator || classTeachers.some((teacher) => teacher.name === currentTeacherDisplayName && (teacher.isHeadTeacher || teacher.isDeputyHeadTeacher));

  const ParentBindingCard = ({ student, compact = false }: { student: ParentBindingProfile; compact?: boolean }) => {
    const guardians = student.guardians;
    const visibleGuardians = compact ? guardians.slice(0, 2) : guardians;
    const hiddenGuardianCount = guardians.length - visibleGuardians.length;
    const isUnbound = guardians.length === 0;
    const unboundLabel = student.reservedPhone ? '待家长绑定' : '未填手机号';

    return (
      <div className={cx(
        'min-w-0 bg-white',
        compact ? 'rounded-2xl p-2.5' : 'rounded-2xl border border-gray-100 px-3 py-3',
        isUnbound && 'ring-1 ring-gray-100'
      )}>
        <div className={cx('flex min-w-0 gap-2.5', isUnbound ? 'items-start' : 'items-center')}>
          <div className={cx('flex shrink-0 items-center justify-center rounded-full bg-gray-100 font-black', compact ? 'h-8 w-8 text-xs' : 'h-10 w-10 text-sm')}>
            {student.name.slice(0, 1)}
          </div>
          <div className="min-w-0 flex-1">
            <div className={cx('whitespace-nowrap font-black leading-5', compact ? 'text-sm' : 'text-base')}>{student.name}</div>
            {isUnbound && (
              <div className={cx('mt-1 inline-flex rounded-full bg-gray-100 font-black text-gray-500', compact ? 'px-2 py-0.5 text-[10px]' : 'px-2 py-0.5 text-[11px]')}>{unboundLabel}</div>
            )}
          </div>
        </div>
        {guardians.length > 0 && (
          <div className={cx('flex flex-wrap gap-1.5', compact ? 'mt-2 pl-10' : 'mt-3 pl-[50px]')}>
            {visibleGuardians.map((guardian) => {
              const guardianLabel = getParentGuardianLabel(guardian);
              return (
                <span
                  key={guardian.id}
                  className={cx(
                    'inline-flex items-center rounded-full bg-gray-50 font-black text-gray-600',
                    compact ? 'gap-1 px-2 py-0.5 text-[10px]' : 'gap-1 px-2 py-1 text-xs'
                  )}
                >
                  <span className="max-w-[88px] truncate px-0.5">{guardianLabel}</span>
                </span>
              );
            })}
            {hiddenGuardianCount > 0 && (
              <span className={cx('rounded-full bg-gray-50 font-black text-gray-400', compact ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-xs')}>+{hiddenGuardianCount}</span>
            )}
          </div>
        )}
        </div>
    );
  };

  const ParentBindingGuardianCard = ({ student, guardian }: { student: ParentBindingProfile; guardian: ParentBindingProfile['guardians'][number] }) => {
    const guardianLabel = getParentGuardianLabel(guardian);

    return (
      <button
        type="button"
        onClick={() => setActiveParentBindingCandidate({
          studentName: student.name,
          guardianId: guardian.id,
          guardianLabel,
          phone: guardian.phone,
          relation: guardian.relation,
          relationOther: guardian.relationOther || '',
        })}
        className="flex min-h-14 w-full min-w-0 items-center gap-2.5 rounded-2xl bg-white px-3 py-2 text-left active:bg-gray-50"
        aria-label={`查看${student.name}的${guardianLabel}绑定详情`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100 text-sm font-black text-gray-700">
          {student.name.slice(0, 1)}
        </div>
        <div className="flex min-w-0 flex-1 items-baseline gap-0.5">
          <span className="truncate text-[15px] font-bold leading-5 text-gray-950">{student.name}</span>
          <span className="shrink-0 text-sm font-semibold leading-5 text-gray-500">的</span>
          <span className="shrink-0 text-sm font-semibold leading-5 text-gray-700">{guardianLabel}</span>
        </div>
      </button>
    );
  };

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

  const PageNodeButton = ({ item, lane }: { item: PageKey; lane?: string }) => {
    const active = page === item && activeInviteNode < 0;
    return (
      <button
        type="button"
        onClick={() => { setActiveLane(lane ?? '登录'); setActiveInviteNode(-1); jumpToPage(item); }}
        className={cx(
          'flex h-10 shrink-0 items-center rounded-xl border px-3 text-left active:bg-gray-100',
          active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700'
        )}
      >
        <span className={cx('mr-2 text-sm font-black', active ? 'text-white' : 'text-gray-400')}>
          {pageNumberLabel(item)}
        </span>
        <span className="text-xs font-black">{pageMeta[item].title}</span>
      </button>
    );
  };

  const renderPageDirectory = () => (
    <section className="overflow-x-auto rounded-2xl bg-white p-4">
      <div className="w-max min-w-full space-y-3">
        {flowLanes.map((lane) => (
          <div key={lane.title} className="grid min-w-full grid-cols-[96px_max-content] items-center gap-3">
            <div className="whitespace-nowrap text-xs font-black text-gray-500">{lane.title}</div>
            {lane.title === '登录' ? (
              <div className="flex items-center gap-2">
                <PageNodeButton item="login" lane={lane.title} />
                <div className="grid shrink-0 gap-2">
                  <div className="flex items-center gap-2">
                    <div className="grid w-[152px] shrink-0 grid-cols-[20px_1fr_12px] items-center gap-2 text-[11px] font-black leading-4 text-gray-500">
                      <span className="h-px bg-gray-300" />
                      <span>新用户首次登录</span>
                      <span className="text-sm text-gray-400">→</span>
                    </div>
                    <PageNodeButton item="profile" lane={lane.title} />
                    <span className="shrink-0 text-sm font-black text-gray-400">→</span>
                    <PageNodeButton item="home" lane={lane.title} />
                    <span className="shrink-0 text-sm font-black text-gray-400">→</span>
                    <div className="grid shrink-0 grid-rows-2 gap-2">
                      <PageNodeButton item="classCreate" lane={lane.title} />
                      <PageNodeButton item="classJoin" lane={lane.title} />
                    </div>
                    <span className="shrink-0 text-sm font-black text-gray-400">→</span>
                    <PageNodeButton item="studentAdd" lane={lane.title} />
                    <span className="shrink-0 text-sm font-black text-gray-400">→</span>
                    <PageNodeButton item="record" lane={lane.title} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="grid w-[152px] shrink-0 grid-cols-[20px_1fr_12px] items-center gap-2 text-[11px] font-black leading-4 text-gray-500">
                      <span className="h-px bg-gray-300" />
                      <span>新用户已填写姓名，但未完成新手引导</span>
                      <span className="text-sm text-gray-400">→</span>
                    </div>
                    <PageNodeButton item="home" lane={lane.title} />
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="grid w-[152px] shrink-0 grid-cols-[20px_1fr_12px] items-center gap-2 text-[11px] font-black leading-4 text-gray-500">
                      <span className="h-px bg-gray-300" />
                      <span>老用户登录</span>
                      <span className="text-sm text-gray-400">→</span>
                    </div>
                    <PageNodeButton item="record" lane={lane.title} />
                  </div>
                </div>
              </div>
            ) : lane.title === '我的(个人版)' ? (
              <div className="flex items-center gap-2">
                <PageNodeButton item="minePersonal" lane={lane.title} />
                <span className="shrink-0 text-sm font-black text-gray-400">→</span>
                <PageNodeButton item="teacherBasicInfoPersonal" lane={lane.title} />
              </div>
            ) : lane.title === '我的(学校版)' ? (
              <div className="flex items-center gap-2">
                <PageNodeButton item="mineSchool" lane={lane.title} />
                <span className="shrink-0 text-sm font-black text-gray-400">→</span>
                <div className="grid shrink-0 grid-cols-3 gap-2">
                  <PageNodeButton item="teacherBasicInfoSchool" lane={lane.title} />
                  <PageNodeButton item="mineSettings" lane={lane.title} />
                  <PageNodeButton item="subjectManagement" lane={lane.title} />
                  <PageNodeButton item="departmentManagement" lane={lane.title} />
                  <PageNodeButton item="coinIssuanceManagement" lane={lane.title} />
                </div>
              </div>
            ) : lane.branchGroups ? (
              <div className="flex items-center gap-2">
                {lane.pages.map((item, index) => (
                  <React.Fragment key={item}>
                    {index > 0 && <span className="shrink-0 text-sm font-black text-gray-400">→</span>}
                    <PageNodeButton item={item} lane={lane.title} />
                  </React.Fragment>
                ))}
                {lane.branchGroups.map((group, groupIndex) => (
                  <React.Fragment key={`${lane.title}-branch-group-${groupIndex}`}>
                    <span className="shrink-0 text-sm font-black text-gray-400">→</span>
                    <div className="grid shrink-0 gap-2">
                      {group.branches.map((branch) => (
                        <div key={`${groupIndex}-${branch.text}`} className="flex items-center gap-2">
                          <div className="grid w-fit shrink-0 grid-cols-[20px_max-content_12px] items-center gap-2 text-[11px] font-black leading-4 text-gray-500">
                            <span className="h-px bg-gray-300" />
                            <span className="whitespace-nowrap">{branch.text}</span>
                            <span className="text-sm text-gray-400">→</span>
                          </div>
                          <div className="flex items-center gap-2">
                            {branch.pages.map((item, index) => (
                              <React.Fragment key={`${groupIndex}-${branch.text}-${item}`}>
                                {index > 0 && <span className="shrink-0 text-sm font-black text-gray-400">→</span>}
                                <PageNodeButton item={item} lane={lane.title} />
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </React.Fragment>
                ))}
                {lane.tailPages && (
                  <>
                    <span className="shrink-0 text-sm font-black text-gray-400">→</span>
                    <div className="flex items-center gap-2">
                      {lane.tailPages.map((item, index) => (
                        <React.Fragment key={item}>
                          {index > 0 && <span className="shrink-0 text-sm font-black text-gray-400">→</span>}
                          <PageNodeButton item={item} lane={lane.title} />
                        </React.Fragment>
                      ))}
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                {lane.pages.map((item, index) => (
                  <React.Fragment key={item}>
                    {index > 0 && <span className="shrink-0 text-sm font-black text-gray-400">→</span>}
                    <PageNodeButton item={item} lane={lane.title} />
                  </React.Fragment>
                ))}
              </div>
            )}
          </div>
        ))}
        <div className="grid min-w-full grid-cols-[96px_max-content] items-start gap-3 border-t border-gray-100 pt-3">
          <div className="whitespace-nowrap text-xs font-black text-gray-500">被邀请</div>
          <div className="flex items-center gap-3">
            {(() => {
              const srcActive = activeInviteNode === 0;
              return (
                <button type="button" onClick={() => { setActiveLane('被邀请'); setActiveInviteNode(0); jumpToPath(invitePathNodes[0].target); }} className={cx('min-h-12 shrink-0 rounded-xl border px-3 py-2 text-left active:bg-gray-100', srcActive ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700')}>
                  <span className={cx('block text-xs font-black', srcActive ? 'text-white' : 'text-gray-950')}>00 收到卡片</span>
                </button>
              );
            })()}
            <div className="grid shrink-0 gap-2">
              {([
                { cond: '未登录打开', node: invitePathNodes[1], idx: 1 },
                { cond: '已登录已加入', node: invitePathNodes[2], idx: 2 },
                { cond: '已登录未加入', node: invitePathNodes[3], idx: 3 },
              ] as const).map((branch) => {
                const destActive = activeInviteNode === branch.idx;
                const destPage = branch.node.target.type === 'page' ? branch.node.target.page : 'classListSchool';
                return (
                  <div key={branch.cond} className="flex items-center gap-2">
                    <div className="flex w-fit max-w-[180px] items-center gap-2 text-[11px] font-black leading-4 text-gray-500">
                      <span className="h-px w-6 bg-gray-300" />
                      <span>{branch.cond}</span>
                      <span className="text-sm text-gray-400">→</span>
                    </div>
                    <button type="button" onClick={() => { setActiveLane('被邀请'); setActiveInviteNode(branch.idx); jumpToPath(branch.node.target); }} className={cx('min-h-10 shrink-0 rounded-xl border px-3 py-2 text-left active:bg-gray-100', destActive ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700')}>
                      <span className={cx('block text-xs font-black', destActive ? 'text-white' : 'text-gray-950')}>{pageNumberLabel(destPage)} {pageMeta[destPage].title}</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );

  const renderParentFlowNodes = (nodes: ParentFlowNode[], keyPrefix: string): React.ReactNode => (
    <div className="flex items-center gap-2">
      {nodes.map((node, index) => {
        const nodeKey = `${keyPrefix}-${node.page}`;
        const active = isSameParentDirectoryPage(parentPage, node.page);
        return (
          <React.Fragment key={nodeKey}>
            {index > 0 && <span className="shrink-0 text-sm font-black text-gray-400">→</span>}
            <button
              type="button"
              onClick={() => jumpToParentPage(node.page, nodeKey)}
              className={cx(
                'min-h-10 shrink-0 rounded-xl border px-3 py-2 text-left active:bg-gray-100',
                active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700'
              )}
            >
              <span className={cx('block text-xs font-black', active ? 'text-white' : 'text-gray-950')}>
                {parentPageLabels[node.page].number} {parentPageLabels[node.page].title}
              </span>
            </button>
            {node.branches && (
              <>
                <span className="shrink-0 text-sm font-black text-gray-400">→</span>
                <div className="grid shrink-0 gap-2">
                  {node.branches.map((branch) => (
                    <div key={`${nodeKey}-${branch.text}`} className="flex items-center gap-2">
                      <div className="flex w-fit max-w-[180px] items-center gap-2 text-[11px] font-black leading-4 text-gray-500">
                        <span className="h-px w-6 bg-gray-300" />
                        <span>{branch.text}</span>
                        <span className="text-sm text-gray-400">→</span>
                      </div>
                      {renderParentFlowNodes(branch.pages, `${nodeKey}-${branch.text}`)}
                    </div>
                  ))}
                </div>
              </>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );

  const renderParentPageDirectory = () => (
    <section className="rounded-2xl bg-white p-4">
      <div className="space-y-3">
        {parentFlowLanes.map((lane) => (
          <div key={lane.title} className="grid grid-cols-[72px_1fr] items-start gap-3">
            <div className="text-xs font-black text-gray-500">{lane.title}</div>
            {'branches' in lane ? (
              <div className="flex min-w-0 items-center gap-3 overflow-x-auto">
                {(() => {
                  const sourceNodeKey = `${lane.title}-source-${lane.source}`;
                  const sourceActive = isSameParentDirectoryPage(parentPage, lane.source);
                  return (
                <button
                  type="button"
                  onClick={() => jumpToParentPage(lane.source, sourceNodeKey)}
                  className={cx(
                    'min-h-12 shrink-0 rounded-xl border px-3 py-2 text-left active:bg-gray-100',
                    sourceActive ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700'
                  )}
                >
                  <span className={cx('block text-xs font-black', sourceActive ? 'text-white' : 'text-gray-950')}>
                    {parentPageLabels[lane.source].number} {parentPageLabels[lane.source].title}
                  </span>
                </button>
                  );
                })()}
                <div className="grid shrink-0 gap-2">
                  {lane.branches.map((branch) => (
                      <div key={branch.text} className="flex items-center gap-2">
                        <div className="flex w-fit max-w-[180px] items-center gap-2 text-[11px] font-black leading-4 text-gray-500">
                          <span className="h-px w-6 bg-gray-300" />
                          <span>{branch.text}</span>
                          <span className="text-sm text-gray-400">→</span>
                        </div>
                        {renderParentFlowNodes(branch.pages, `${lane.title}-${branch.text}`)}
                      </div>
                    ))}
                </div>
              </div>
            ) : (
              <div className="flex min-w-0 items-center gap-2 overflow-x-auto">
                {lane.nodes.map((node, index) => {
                  const nodeKey = `${lane.title}-node-${node.page}`;
                  const active = isSameParentDirectoryPage(parentPage, node.page);
                  return (
                    <React.Fragment key={`${lane.title}-${node.page}-${index}`}>
                      {index > 0 && <span className="shrink-0 text-sm font-black text-gray-400">→</span>}
                      <button
                        type="button"
                        onClick={() => jumpToParentPage(node.page, nodeKey)}
                        className={cx(
                          'min-h-12 shrink-0 rounded-xl border px-3 py-2 text-left active:bg-gray-100',
                          active ? 'border-gray-900 bg-gray-900 text-white' : 'border-gray-200 bg-white text-gray-700'
                        )}
                      >
                        <span className={cx('block text-xs font-black', active ? 'text-white' : 'text-gray-950')}>
                          {parentPageLabels[node.page].number} {parentPageLabels[node.page].title}
                        </span>
                      </button>
                    </React.Fragment>
                  );
                })}
              </div>
            )}
          </div>
        ))}
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

  const renderParentPrdPanel = () => (
    <aside className="min-h-[60dvh] w-full min-w-0 overflow-y-auto border-t border-gray-200 bg-gray-50 xl:h-full xl:min-h-0 xl:flex-1 xl:border-l xl:border-t-0">
      <div className="mx-auto max-w-[1120px] space-y-6 px-8 py-6">
        {renderSurfaceTabs()}
        {renderParentPageDirectory()}
        <section className="space-y-5 rounded-2xl bg-white p-6">
          {parentPrdBlocks.map(renderPrdBlock)}
        </section>
      </div>
    </aside>
  );

  const renderParentWechatCard = () => (
    <div className="flex h-full flex-col bg-gray-100 text-gray-950">
      <header className="grid h-16 shrink-0 grid-cols-[56px_1fr_56px] items-center border-b border-gray-200 px-4">
        <button type="button" className="text-left text-2xl leading-none">‹</button>
        <div className="truncate text-center text-base font-black">家校沟通群</div>
        <button type="button" className="text-right text-xl leading-none">…</button>
      </header>
      <div className="flex-1 overflow-y-auto px-5 py-5">
        <button type="button" onClick={() => { setParentLoginTarget('bindInviteMatched'); setParentBindMode('class'); jumpToParentPage('login'); }} className="ml-auto block w-[78%] rounded-xl bg-white p-3 text-left shadow-sm active:bg-gray-50">
          <div className="text-xs font-medium text-gray-500">素养指南针</div>
          <div className="mt-2 text-base font-black leading-6">郭老师邀请你绑定学生</div>
          <div className="mt-3 flex aspect-[4/3] flex-col items-center justify-center rounded-xl bg-gray-50">
            <div className="text-3xl font-black">指南针</div>
            <div className="mt-3 rounded-full bg-white px-5 py-2 text-sm font-black">立即查看</div>
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
  );

  const renderParentLogin = () => (
    <div className="flex h-full w-full flex-col bg-white text-gray-950">
      <header className="flex h-16 items-center justify-center border-b border-gray-100 bg-white px-4">
        <h2 className="text-base font-black">素养指南针</h2>
      </header>
      <div className="flex min-h-[calc(100%-64px)] flex-col p-5">
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gray-100">
            <Sparkles size={34} />
          </div>
          <h3 className="mt-6 text-2xl font-black">欢迎使用 素养指南针</h3>
        </div>
        <div className="space-y-3 pb-3">
          <button type="button" onClick={() => setShowParentWechatPhoneSheet(true)} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">微信授权登录</button>
          <label className="flex items-center justify-center gap-2 text-[11px] leading-5">
            <input type="checkbox" defaultChecked className="h-4 w-4 accent-black" />
            <span>我已阅读并同意《隐私保护指引》</span>
          </label>
        </div>
      </div>
    </div>
  );

  const renderParentBinding = () => (
    <div className="flex h-full w-full flex-col bg-white text-gray-950">
      <header className="grid h-16 items-center border-b border-gray-100 bg-white px-4 [grid-template-columns:44px_1fr_44px]">
        <button type="button" onClick={() => jumpToParentPage(parentBindingReturnPage)} className="flex h-11 w-11 items-center justify-center rounded-xl active:bg-gray-100" aria-label="返回">
          <ArrowLeft size={19} />
        </button>
        <h2 className="text-center text-base font-black">{isParentMatchedBinding ? '绑定学生' : '手机号未匹配'}</h2>
        <span />
      </header>
      <div className="flex h-[calc(100%-64px)] flex-col p-5">
        {isParentMatchedBinding ? (
          <>
            <div className="flex-1 overflow-y-auto">
              <div className="mb-3 text-center text-xs font-black text-gray-500">
                {normalizedParentMatchedStudentIndex + 1}/{parentMatchedStudents.length}
              </div>
              {matchedParentStudent && renderParentStudentCard(matchedParentStudent.name)}
              <div className="mt-4 rounded-2xl bg-gray-50 p-3">
                <div className="text-xs font-black text-gray-500">您的家长身份</div>
                <div className="mt-2 grid grid-cols-[minmax(0,1fr)_132px] items-center gap-2">
                  <div className="flex h-11 min-w-0 items-center px-1 text-sm font-black text-gray-950">
                    <span className="truncate">{parentStudentMaskedName}的</span>
                  </div>
                  <select
                    value={parentIdentityForm.relation}
                    onChange={(event) => setParentIdentityForm((form) => ({ ...form, relation: event.target.value as ParentIdentityRelation }))}
                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-normal"
                    aria-label="选择家长关系"
                  >
                    {parentIdentityRelationOptions.map((relation) => (
                      <option key={relation} value={relation}>{relation}</option>
                    ))}
                  </select>
                </div>
              </div>
              {parentIdentityForm.relation === '其他' && (
                <label className="mt-3 block rounded-2xl bg-gray-50 p-3 text-xs font-black">
                  具体关系
                  <input
                    value={parentIdentityForm.relationOther}
                    onChange={(event) => setParentIdentityForm((form) => ({ ...form, relationOther: event.target.value }))}
                    className="mt-2 h-11 w-full border border-gray-200 bg-white px-3 text-sm font-normal"
                    placeholder={`请输入与${parentStudentMaskedName}的关系`}
                    aria-label="具体关系"
                  />
                </label>
              )}
            </div>
            <div className="space-y-2 pt-3">
              <button
                type="button"
                disabled={!parentIdentityComplete}
                onClick={() => {
                  if (parentIdentityComplete) continueParentBindingFlow();
                }}
                className={cx(
                  'h-12 w-full rounded-2xl border border-gray-200 text-sm font-black',
                  parentIdentityComplete ? 'bg-gray-900 text-white active:bg-gray-700' : 'bg-gray-100 text-gray-400'
                )}
              >
                确认绑定
              </button>
              <button
                type="button"
                onClick={() => setShowParentMismatchConfirmSheet(true)}
                className="h-11 w-full rounded-2xl bg-white text-sm font-medium text-gray-500 active:bg-gray-50"
              >
                不是我的孩子
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-1 flex-col justify-center text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-gray-50">
                <CircleHelp size={30} className="text-gray-500" />
              </div>
              <h3 className="mt-5 text-lg font-black text-gray-950">暂未匹配到学生</h3>
              <p className="mx-auto mt-2 max-w-[276px] text-sm font-medium leading-6 text-gray-500">当前授权的手机（{parentIdentityForm.phone}）未查询到可绑定的学生，请联系班主任，让班主任分享邀请链接。</p>
            </div>
            <div className="space-y-2 pt-3">
              <button
                type="button"
                onClick={() => jumpToParentPage(parentBindingReturnPage)}
                className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white active:bg-gray-700"
              >
                返回
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );

  const renderParentBindingNotice = () => (
    <div className="flex h-full w-full flex-col bg-white text-gray-950">
      <header className="grid h-16 items-center border-b border-gray-100 bg-white px-4 [grid-template-columns:44px_1fr_44px]">
        <button type="button" onClick={() => jumpToParentPage(parentBindingNoticeBackPage)} className="flex h-11 w-11 items-center justify-center rounded-xl active:bg-gray-100" aria-label="返回">
          <ArrowLeft size={19} />
        </button>
        <h2 className="text-center text-base font-black">绑定提醒</h2>
        <span />
      </header>
      <div className="flex h-[calc(100%-64px)] flex-col px-5 pb-5 pt-5">
        <div className="flex-1 space-y-3 overflow-y-auto">
          <section className="rounded-2xl bg-gray-50 p-4">
            <h3 className="text-xs font-black text-gray-500">安全提醒</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-gray-700">
              为保障学生信息安全，同一班级最多绑定 2 名学生。请确认当前绑定均为自己的孩子。
            </p>
          </section>

          {renderParentStudentCard()}

          <section className="rounded-2xl bg-gray-50 p-3">
            <div className="text-xs font-black text-gray-500">您的家长身份</div>
            <div className="mt-2 grid grid-cols-[minmax(0,1fr)_132px] items-center gap-2">
              <div className="flex h-11 min-w-0 items-center px-1 text-sm font-black text-gray-950">
                <span className="truncate">{parentStudentMaskedName}的</span>
              </div>
              <select
                value={parentIdentityForm.relation}
                onChange={(event) => setParentIdentityForm((form) => ({ ...form, relation: event.target.value as ParentIdentityRelation }))}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-normal"
                aria-label="选择家长关系"
              >
                {parentIdentityRelationOptions.map((relation) => (
                  <option key={relation} value={relation}>{relation}</option>
                ))}
              </select>
            </div>
          </section>

          {parentIdentityForm.relation === '其他' && (
            <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
              具体关系
              <input
                value={parentIdentityForm.relationOther}
                onChange={(event) => setParentIdentityForm((form) => ({ ...form, relationOther: event.target.value }))}
                className="mt-2 h-11 w-full border border-gray-200 bg-white px-3 text-sm font-normal"
                placeholder={`请输入与${parentStudentMaskedName}的关系`}
                aria-label="具体关系"
              />
            </label>
          )}

        </div>
        <div className="space-y-3 pt-4">
          <button
            type="button"
            onClick={() => jumpToParentPage(parentBindingNoticeBackPage)}
            className="h-12 w-full rounded-2xl border border-gray-300 bg-white text-sm font-black text-gray-700 active:bg-gray-50"
          >
            返回
          </button>
          <button
            type="button"
            disabled={!parentIdentityComplete}
            onClick={() => {
              if (parentIdentityComplete) jumpToParentPage('landing');
            }}
            className={cx(
              'h-12 w-full rounded-2xl border border-gray-200 text-sm font-black',
              parentIdentityComplete ? 'bg-gray-900 text-white active:bg-gray-700' : 'bg-gray-100 text-gray-400'
            )}
          >
            确认绑定
          </button>
        </div>
      </div>
    </div>
  );

  const renderParentBindingLimitNotice = () => (
    <div className="flex h-full w-full flex-col bg-white text-gray-950">
      <header className="grid h-16 items-center border-b border-gray-100 bg-white px-4 [grid-template-columns:44px_1fr_44px]">
        <button type="button" onClick={() => jumpToParentPage('landing')} className="flex h-11 w-11 items-center justify-center rounded-xl active:bg-gray-100" aria-label="返回首页">
          <ArrowLeft size={19} />
        </button>
        <h2 className="text-center text-base font-black">绑定提醒</h2>
        <span />
      </header>
      <div className="flex h-[calc(100%-64px)] flex-col px-5 pb-5 pt-5">
        <div className="flex-1 space-y-3 overflow-y-auto">
          <section className="rounded-2xl bg-gray-50 p-4">
            <h3 className="text-xs font-black text-gray-500">安全提醒</h3>
            <p className="mt-2 text-sm font-semibold leading-6 text-gray-700">
              为保障学生信息安全，同一班级最多绑定 2 名学生。当前班级已绑定 2 个孩子，如需调整，请联系班主任先解绑后再重新绑定。
            </p>
          </section>

          {renderParentStudentCard('郑小磊')}
          {renderParentStudentCard('郑小雅')}
        </div>
        <button
          type="button"
          onClick={() => jumpToParentPage('landing')}
          className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white active:bg-gray-700"
        >
          回到首页
        </button>
      </div>
    </div>
  );

  const renderParentInviteStudentBinding = (variant: 'unbound' | 'bound') => (
    <div className="flex h-full w-full flex-col bg-white text-gray-950">
      <header className="grid h-16 items-center border-b border-gray-100 bg-white px-4 [grid-template-columns:44px_1fr_44px]">
        <button type="button" onClick={() => jumpToParentPage('login')} className="flex h-11 w-11 items-center justify-center rounded-xl active:bg-gray-100" aria-label="返回">
          <ArrowLeft size={19} />
        </button>
        <h2 className="text-center text-base font-black">绑定学生</h2>
        <span />
      </header>
      <div className="flex h-[calc(100%-64px)] flex-col px-5 pb-5 pt-5">
        <div className="flex-1 space-y-4 overflow-y-auto">
          <section className="rounded-3xl bg-gray-50 px-4 py-5">
            <div className="text-sm font-black text-gray-500">邀请班级</div>
            <div className="mt-4 text-xl font-black leading-7 text-gray-950">2025级1班</div>
          </section>
          <label className="block rounded-3xl bg-gray-50 px-4 py-5 text-base font-black text-gray-950">
            学生姓名
            <input
              value={parentInviteStudentForm.name}
              onChange={(event) => setParentInviteStudentForm((form) => ({ ...form, name: event.target.value }))}
              className="mt-4 h-14 w-full rounded-none border border-gray-200 bg-white px-4 text-base font-normal text-gray-950 placeholder:text-gray-400"
              placeholder="请输入学生姓名"
              aria-label="学生姓名"
            />
          </label>
          <label className="block rounded-3xl bg-gray-50 px-4 py-5 text-base font-black text-gray-950">
            学生学号
            <input
              value={parentInviteStudentForm.no}
              onChange={(event) => setParentInviteStudentForm((form) => ({ ...form, no: event.target.value }))}
              className="mt-4 h-14 w-full rounded-none border border-gray-200 bg-white px-4 text-base font-normal text-gray-950 placeholder:text-gray-400"
              placeholder="请输入学生学号"
              aria-label="学生学号"
              inputMode="numeric"
            />
          </label>
        </div>
        <button
          type="button"
          disabled={!parentInviteStudentComplete}
          onClick={() => {
            if (parentInviteStudentComplete) {
              setParentBindingNoticeBackPage(variant === 'bound' ? 'bindInviteBoundUnmatched' : 'bindInviteUnmatched');
              jumpToParentPage('bindingNotice');
            }
          }}
          className={cx(
            'h-14 w-full rounded-3xl border border-gray-200 text-base font-black',
            parentInviteStudentComplete ? 'bg-gray-900 text-white active:bg-gray-700' : 'bg-gray-100 text-gray-400'
          )}
        >
          绑定学生
        </button>
        {variant === 'bound' && (
          <button
            type="button"
            onClick={() => jumpToParentPage('landing')}
            className="mt-2 h-12 w-full rounded-2xl bg-white text-sm font-medium text-gray-500 active:bg-gray-50"
          >
            暂不绑定
          </button>
        )}
      </div>
    </div>
  );

  const renderParentIdentity = () => (
    <div className="flex h-full w-full flex-col bg-white text-gray-950">
      <header className="grid h-16 items-center border-b border-gray-100 bg-white px-4 [grid-template-columns:44px_1fr_44px]">
        <button type="button" onClick={() => jumpToParentPage(parentBindMode === 'class' ? 'bindInviteMatched' : 'bindSelfMatched')} className="flex h-11 w-11 items-center justify-center rounded-xl active:bg-gray-100" aria-label="返回">
          <ArrowLeft size={19} />
        </button>
        <h2 className="text-center text-base font-black">绑定确认</h2>
        <span />
      </header>
      <div className="flex h-[calc(100%-64px)] flex-col p-5">
        <div className="flex-1 space-y-3 overflow-y-auto">
          {renderParentStudentCard()}

          <div className="rounded-2xl bg-gray-50 p-3">
            <div className="text-xs font-black text-gray-500">您的家长身份</div>
            <div className="mt-2 grid grid-cols-[minmax(0,1fr)_132px] items-center gap-2">
              <div className="flex h-11 min-w-0 items-center px-1 text-sm font-black text-gray-950">
                <span className="truncate">{parentStudentMaskedName}的</span>
              </div>
              <select
                value={parentIdentityForm.relation}
                onChange={(event) => setParentIdentityForm((form) => ({ ...form, relation: event.target.value as ParentIdentityRelation }))}
                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-normal"
                aria-label="选择家长关系"
              >
                {parentIdentityRelationOptions.map((relation) => (
                  <option key={relation} value={relation}>{relation}</option>
                ))}
              </select>
            </div>
          </div>

          {parentIdentityForm.relation === '其他' && (
            <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
              具体关系
              <input
                value={parentIdentityForm.relationOther}
                onChange={(event) => setParentIdentityForm((form) => ({ ...form, relationOther: event.target.value }))}
                className="mt-2 h-11 w-full border border-gray-200 bg-white px-3 text-sm font-normal"
                placeholder={`请输入与${parentStudentMaskedName}的关系`}
                aria-label="具体关系"
              />
            </label>
          )}

          <div className="rounded-2xl bg-gray-50 p-3">
            <div className="text-xs font-black text-gray-500">您的联系手机</div>
            <div className="mt-2 flex min-h-11 items-center justify-between gap-3 px-1">
              <span className="text-sm font-black text-gray-950">{parentMaskedPhone}</span>
              <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-[11px] font-black text-gray-500">当前授权手机</span>
            </div>
          </div>
        </div>
        <div className="space-y-2 pt-3">
          <button
            type="button"
            onClick={() => jumpToParentPage(parentBindMode === 'class' ? 'bindInviteMatched' : 'bindSelfMatched')}
            className="h-12 w-full rounded-2xl border border-gray-300 bg-white text-sm font-black text-gray-700 active:bg-gray-50"
          >
            返回修改
          </button>
          <button
            type="button"
            disabled={!parentIdentityComplete}
            onClick={() => {
            if (parentIdentityComplete) jumpToParentPage('landing');
          }}
          className={cx(
              'h-12 w-full rounded-2xl border border-gray-200 text-sm font-black',
              parentIdentityComplete ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
            )}
          >
            确认绑定
          </button>
        </div>
      </div>
    </div>
  );

  const renderParentLanding = () => (
    <div className="relative flex h-full w-full flex-col overflow-hidden bg-white text-gray-950">
      <div className="relative flex-1 overflow-y-auto pb-24 pt-5">
        <section className="mx-5 rounded-3xl bg-gray-50 p-4">
          <div className="flex items-center gap-3.5">
            <div className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-2xl bg-white text-2xl font-black text-gray-400">郑</div>
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[18px] font-black leading-tight text-gray-950">郑小磊</h2>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-bold text-gray-500">
                <span className="rounded-xl bg-white px-2.5 py-1 text-gray-700">2025级1班</span>
                <span className="rounded-xl bg-white px-2.5 py-1 text-gray-600">20250101</span>
              </div>
            </div>
            <button type="button" onClick={() => setShowParentChildSwitcherSheet(true)} className="min-h-9 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-[13px] font-black text-gray-600">切换</button>
          </div>
        </section>

        <section className="mx-5 mt-4 flex flex-col gap-3">
          <article className="min-h-[154px] rounded-3xl bg-gray-50 p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[13px] font-black text-gray-400">本月净得分</span>
              <span className="rounded-xl bg-white px-2.5 py-1 text-[12px] font-black text-gray-500">稳步成长</span>
            </div>
            <div className="mt-4 flex items-baseline justify-center">
              <span className="text-[52px] font-black leading-none text-gray-900">45</span>
              <span className="ml-2 text-[18px] font-black text-gray-300">分</span>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2">
              {[
                { label: '表扬', value: '13', icon: CheckCircle2 },
                { label: '待改进', value: '1', icon: Clock },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} className="flex items-center justify-center gap-2 rounded-2xl bg-white px-2 py-2">
                    <span className="flex h-[30px] w-[30px] items-center justify-center rounded-[10px] bg-white text-gray-500">
                      <Icon size={16} />
                    </span>
                    <div className="text-left">
                      <div className="text-[11px] font-black text-gray-500">{item.label}</div>
                      <div className="mt-0.5 text-[17px] font-black text-gray-900">{item.value}<span className="ml-0.5 text-[11px]">次</span></div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button type="button" className="mx-auto mt-3 flex min-h-8 items-center justify-center rounded-full px-3 text-[13px] font-black text-gray-600">
              <span>全部记录</span>
              <ChevronRight size={14} strokeWidth={3} aria-hidden="true" />
            </button>
          </article>

          <article className="min-h-[154px] rounded-3xl bg-gray-50 p-4">
            <div className="text-[13px] font-black text-gray-500">预估分红总额</div>
            <div className="mt-5 flex items-center justify-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-sm font-black text-gray-500">币</span>
              <span className="text-[42px] font-black leading-none text-gray-900">90.88</span>
            </div>
            <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
              <div className="rounded-2xl bg-white px-2 py-2 text-center">
                <div className="text-[11px] font-black text-gray-500">成长奖励</div>
                <div className="mt-1 text-[16px] font-black text-gray-900">70.5</div>
              </div>
              <div className="text-[18px] font-black text-gray-300">+</div>
              <div className="rounded-2xl bg-white px-2 py-2 text-center">
                <div className="text-[11px] font-black text-gray-500">得分奖励</div>
                <div className="mt-1 text-[16px] font-black text-gray-900">20.38</div>
              </div>
            </div>
          </article>
        </section>
      </div>
      <nav className="absolute inset-x-5 bottom-4 grid h-14 grid-cols-3 gap-2 rounded-2xl border border-gray-200 bg-white p-2 text-[12px] font-black text-gray-500">
        {['成长', '报告', '银行'].map((item, index) => (
          <button key={item} type="button" className={cx('rounded-xl', index === 0 ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-500')}>
            {item}
          </button>
        ))}
      </nav>
    </div>
  );

  const renderParentChildSwitcherSheet = () => {
    if (!showParentChildSwitcherSheet) return null;
    const close = () => setShowParentChildSwitcherSheet(false);
    const addBinding = () => {
      close();
      startParentBindingLookup(true);
    };

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="切换孩子">
        <button type="button" aria-label="关闭切换孩子弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <div className="flex items-start justify-between gap-3">
            <h3 className="pt-2 text-base font-black leading-tight text-gray-950">切换孩子</h3>
            <button type="button" onClick={close} className="flex h-10 w-10 items-center justify-center rounded-xl bg-gray-50 text-lg font-black leading-none text-gray-500 active:bg-gray-100" aria-label="关闭">
              ×
            </button>
          </div>
          <div className="mt-4 flex min-h-14 items-center gap-3 rounded-2xl bg-gray-50 px-4 py-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-sm font-black text-gray-400">郑</div>
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-black leading-5 text-gray-950">郑小磊</div>
              <div className="mt-1 truncate text-[11px] font-black leading-4 text-gray-500">2025级1班 · 20250101</div>
            </div>
            <button type="button" className="h-10 shrink-0 rounded-xl border border-gray-200 bg-white px-3 text-xs font-black text-gray-700 active:bg-gray-50">
              切换
            </button>
          </div>
          <button type="button" onClick={addBinding} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white active:bg-gray-700">
            <Plus size={16} />
            新增绑定
          </button>
        </section>
      </div>
    );
  };

  const renderParentMismatchConfirmSheet = () => {
    if (!showParentMismatchConfirmSheet) return null;
    const close = () => setShowParentMismatchConfirmSheet(false);
    const confirmMismatch = () => {
      close();
      continueParentBindingFlow();
    };

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="确认不是我的孩子">
        <button type="button" aria-label="关闭确认弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black leading-tight text-gray-950">确认不是你的孩子？</h3>
          <p className="mt-3 text-sm leading-6 text-gray-600">将不绑定当前学生，请确认是否继续。</p>
          <div className="mt-5 space-y-2">
            <button type="button" onClick={confirmMismatch} className="h-12 w-full rounded-2xl bg-gray-900 text-sm font-black text-white active:bg-gray-700">
              确认不是我的孩子
            </button>
            <button type="button" onClick={close} className="h-11 w-full rounded-2xl bg-white text-sm font-medium text-gray-500 active:bg-gray-50">
              取消
            </button>
          </div>
        </section>
      </div>
    );
  };

  const renderParentWechatPhoneSheet = () => {
    if (!showParentWechatPhoneSheet) return null;

    const allowPhone = (phone: string) => {
      const isMatchedPhone = phone === '15200001332';
      const hasReachedClassBindingLimit = phone === '19900008610';
      const target: ParentPageKey = isMatchedPhone
        ? parentLoginTarget
        : parentLoginTarget === 'bindInviteMatched' ? (hasReachedClassBindingLimit ? 'bindingLimitNotice' : 'bindInviteUnmatched') : 'bindSelfUnmatched';
      setParentIdentityForm((form) => ({ ...form, phone }));
      setActiveParentMatchedStudentIndex(0);
      setParentBindingReturnPage('login');
      setParentBindingNoticeBackPage(target);
      if (parentLoginTarget === 'bindInviteMatched') setParentBindMode('class');
      setShowParentWechatPhoneSheet(false);
      jumpToParentPage(target);
    };

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="微信手机号授权">
        <button type="button" aria-label="关闭授权弹窗" className="absolute inset-0 cursor-default" onClick={() => setShowParentWechatPhoneSheet(false)} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gray-50">
                <Sparkles size={20} />
              </div>
              <div className="text-base font-black">素养指南针</div>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-sm font-black">i</div>
          </div>

          <div className="mt-5">
            <h3 className="text-xl font-black leading-tight">申请获取并验证你的手机号</h3>
            <p className="mt-2 text-sm leading-5 text-slate-600">用户正常进行授权登录</p>
          </div>

          <div className="mt-5 overflow-hidden rounded-2xl bg-gray-50">
            <button type="button" onClick={() => allowPhone('15200001332')} className="block min-h-16 w-full border-b border-gray-100 px-4 py-3 text-center active:bg-slate-100">
              <div className="text-lg font-medium">152****1332</div>
              <div className="mt-1 text-xs font-black text-slate-600">上次提供</div>
            </button>
            <button type="button" onClick={() => allowPhone('19900008610')} className="block min-h-16 w-full px-4 py-3 text-center active:bg-slate-100">
              <div className="text-lg font-medium">199****8610</div>
            </button>
          </div>

          <button type="button" onClick={() => setShowParentWechatPhoneSheet(false)} className="mt-4 min-h-12 w-full rounded-2xl border border-gray-200 bg-white text-base font-black active:bg-slate-100">
            不允许
          </button>
          <button type="button" className="mt-7 min-h-11 w-full text-sm font-black underline underline-offset-4">
            管理号码
          </button>
        </section>
      </div>
    );
  };

  const renderParentPrototype = () => (
    <PhoneMockup showDeviceFrame={false} safeAreaTop={false}>
      <div className="relative h-full w-full overflow-hidden bg-white">
        {parentPage === 'wechatCard' && renderParentWechatCard()}
        {parentPage === 'login' && renderParentLogin()}
        {(parentPage === 'bindSelfMatched' || parentPage === 'bindSelfUnmatched' || parentPage === 'bindInviteMatched') && renderParentBinding()}
        {parentPage === 'bindInviteUnmatched' && renderParentInviteStudentBinding('unbound')}
        {parentPage === 'bindInviteBoundUnmatched' && renderParentInviteStudentBinding('bound')}
        {parentPage === 'bindingLimitNotice' && renderParentBindingLimitNotice()}
        {parentPage === 'bindingNotice' && renderParentBindingNotice()}
        {parentPage === 'parentIdentity' && renderParentIdentity()}
        {parentPage === 'landing' && renderParentLanding()}
        {renderParentWechatPhoneSheet()}
        {renderParentChildSwitcherSheet()}
        {renderParentMismatchConfirmSheet()}
        {classActionToast && (
          <div className="absolute inset-x-12 top-20 z-50 rounded-2xl bg-gray-950 px-4 py-3 text-center text-xs font-black text-white shadow-[0_16px_36px_rgba(15,23,42,0.2)]">
            {classActionToast}
          </div>
        )}
      </div>
    </PhoneMockup>
  );

  const renderOpsPrototype = () => {
    const schoolStats = [
      { label: '未开始', value: 8 },
      { label: '合作中', value: 46 },
      { label: '已到期', value: 6 },
    ];
    const personalStats = [
      { label: '已转化', value: 328 },
      { label: '待转化', value: 514 },
    ];
    const todos = [
      { id: 'school-report-1', target: '未来实验小学', type: '学校', time: '10:24' },
      { id: 'user-report-1', target: '李明老师', type: '个人用户', time: '09:48' },
      { id: 'school-report-2', target: '星河第二小学', type: '学校', time: '昨天' },
      { id: 'user-report-2', target: '周婷婷老师', type: '个人用户', time: '昨天' },
    ];
    const userRows = [
      { phone: '138****2468', name: '李明老师', classCount: 3, studentCount: 128, recordCount: 42, schoolVersion: '否' },
      { phone: '186****5179', name: '周婷婷老师', classCount: 1, studentCount: 36, recordCount: 11, schoolVersion: '否' },
      { phone: '139****8021', name: '王晨老师', classCount: 5, studentCount: 216, recordCount: 97, schoolVersion: '是' },
      { phone: '158****6390', name: '赵晓老师', classCount: 2, studentCount: 84, recordCount: 28, schoolVersion: '是' },
    ];
    const pendingCount = todos.filter((item) => !handledOpsTodoIds.includes(item.id)).length;

    const markTodoHandled = (id: string) => {
      setHandledOpsTodoIds((prev) => (prev.includes(id) ? prev : [...prev, id]));
    };

    return (
      <div className="h-full w-full max-w-[950px] overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-950">
        <div className="flex h-14 items-center border-b border-gray-200 px-4">
          <div className="text-base font-black">C端改造 · 运营端</div>
          <button type="button" className="ml-auto h-9 rounded-xl border border-gray-200 px-3 text-sm font-black">退出登录</button>
        </div>
        <div className="flex h-[calc(100%-57px)]">
          <aside className="w-[148px] shrink-0 border-r border-gray-200 bg-gray-50 p-3">
            {[
              { key: 'home' as const, label: '首页' },
              { key: 'personalUsers' as const, label: '个人用户管理' },
            ].map((item) => {
              const active = opsPage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setOpsPage(item.key)}
                  className={cx('mb-2 h-10 w-full rounded-xl px-3 text-left text-sm font-black', active ? 'bg-gray-950 text-white' : 'text-gray-600 active:bg-gray-200')}
                >
                  {item.label}
                </button>
              );
            })}
          </aside>

          <main className="min-w-0 flex-1 overflow-y-auto p-4">
            {opsPage === 'home' && (
              <div className="space-y-4">
                <section className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-black">学校总数</div>
                      <div className="text-2xl font-black">60</div>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-2">
                      {schoolStats.map((item) => (
                        <div key={item.label} className="rounded-xl bg-gray-50 px-3 py-2">
                          <div className="text-[11px] font-black text-gray-500">{item.label}</div>
                          <div className="mt-2 text-lg font-black">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="rounded-2xl border border-gray-200 p-4">
                    <div className="flex items-center justify-between">
                      <div className="text-sm font-black">个人用户</div>
                      <div className="text-2xl font-black">842</div>
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-2">
                      {personalStats.map((item) => (
                        <div key={item.label} className="rounded-xl bg-gray-50 px-3 py-2">
                          <div className="text-[11px] font-black text-gray-500">{item.label}</div>
                          <div className="mt-2 text-lg font-black">{item.value}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

                <section className="overflow-hidden rounded-2xl border border-gray-200">
                  <div className="flex items-center justify-between border-b border-gray-100 bg-gray-50 px-4 py-3">
                    <div className="text-sm font-black">待办</div>
                    <div className="rounded-xl bg-white px-2.5 py-1 text-xs font-black text-gray-600">{pendingCount} 条待处理</div>
                  </div>
                  {todos.map((item) => {
                    const handled = handledOpsTodoIds.includes(item.id);
                    return (
                      <div key={item.id} className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0">
                        <div className={cx('flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-xs font-black', handled ? 'bg-gray-100 text-gray-400' : 'bg-gray-950 text-white')}>
                          {handled ? '✓' : '!'}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className={cx('truncate text-sm font-black', handled ? 'text-gray-400' : 'text-gray-900')}>
                            {item.target} 发起了2025-2026学年下学期的期末报告生成
                          </div>
                          <div className="mt-1 text-xs font-medium text-gray-500">{item.type} · {item.time}</div>
                        </div>
                        <button
                          type="button"
                          disabled={handled}
                          onClick={() => markTodoHandled(item.id)}
                          className={cx('h-8 shrink-0 rounded-xl px-3 text-xs font-black', handled ? 'bg-gray-100 text-gray-400' : 'bg-gray-950 text-white')}
                        >
                          {handled ? '已处理' : '标记处理'}
                        </button>
                      </div>
                    );
                  })}
                </section>
              </div>
            )}

            {opsPage === 'personalUsers' && (
              <div className="space-y-3">
                <div className="grid grid-cols-[1fr_1fr_0.8fr_auto] gap-2 rounded-2xl border border-gray-200 bg-gray-50 p-3 text-xs font-black text-gray-500">
                  <div className="rounded-xl bg-white px-3 py-2">搜索姓名 / 学校</div>
                  <div className="rounded-xl bg-white px-3 py-2">全部状态</div>
                  <div className="rounded-xl bg-white px-3 py-2">全部来源</div>
                  <button type="button" className="h-9 rounded-xl bg-gray-950 px-4 text-white">查询</button>
                </div>
                <div className="overflow-hidden rounded-2xl border border-gray-200">
                  <div>
                    <div className="grid grid-cols-[1.02fr_0.72fr_0.58fr_0.62fr_0.58fr_0.72fr_1.8fr] border-b border-gray-100 bg-gray-50 px-4 py-3 text-xs font-black text-gray-500">
                      <div>手机号</div>
                      <div>姓名</div>
                      <div className="text-right">拥有班级数</div>
                      <div className="text-right">拥有学生数</div>
                      <div className="text-right">记录条数</div>
                      <div>是否转学校版</div>
                      <div>操作</div>
                    </div>
                    {userRows.map((row) => (
                      <div key={row.phone} className="grid grid-cols-[1.02fr_0.72fr_0.58fr_0.62fr_0.58fr_0.72fr_1.8fr] items-center border-b border-gray-100 px-4 py-3 text-sm font-medium last:border-b-0">
                        <div className="truncate pr-2 font-black text-gray-900">{row.phone}</div>
                        <div className="truncate pr-2">{row.name}</div>
                        <div className="pr-4 text-right font-black">{row.classCount}</div>
                        <div className="pr-4 text-right font-black">{row.studentCount}</div>
                        <div className="pr-4 text-right font-black">{row.recordCount}</div>
                        <div className={cx('font-black', row.schoolVersion === '是' ? 'text-gray-500' : 'text-gray-950')}>{row.schoolVersion}</div>
                        <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs font-black">
                          {['登录学校后台', '个性化配置', '提示词管理', '手动触发'].map((action) => (
                            <button key={action} type="button" className="text-gray-900 underline-offset-4 active:underline">{action}</button>
                          ))}
                          <button type="button" className="text-red-600 underline-offset-4 active:underline">删除</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    );
  };

  const renderSchoolAdminPrototype = () => {
    const currentSpace = teacherSpaces.find((space) => space.id === currentSpaceId) ?? teacherSpaces[0];
    const selectSchoolAdminSpace = (spaceId: TeacherSpaceId) => {
      setCurrentSpaceId(spaceId);
      setShowSchoolAdminSpaceMenu(false);
    };

    return (
      <div className="h-full w-full max-w-[760px] overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-950">
        <div className="relative flex h-16 items-center border-b border-gray-200 px-5">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gray-950 text-white text-sm font-black">盾</div>
            <div className="shrink-0 text-base font-black">乐途 AI 智慧教育平台</div>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowSchoolAdminSpaceMenu((open) => !open)}
                className="flex h-11 min-w-[184px] items-center gap-3 rounded-2xl border border-gray-200 bg-white px-3 text-left active:bg-gray-50"
                aria-label="切换空间"
                aria-expanded={showSchoolAdminSpaceMenu}
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 text-xs font-black">{currentSpace.type === 'personal' ? '个' : '管'}</span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-black leading-4">{currentSpace.type === 'personal' ? '个人老师' : '管理员'}</span>
                  <span className="mt-1 block truncate text-xs font-black leading-4 text-gray-500">{currentSpace.title}</span>
                </span>
                <ChevronDown size={14} className="shrink-0 text-gray-400" />
              </button>
              {showSchoolAdminSpaceMenu && (
                <div className="absolute right-0 top-[52px] z-10 w-[224px] rounded-2xl border border-gray-200 bg-white p-2 shadow-[0_16px_36px_rgba(15,23,42,0.12)]">
                  {teacherSpaces.map((space) => {
                    const active = currentSpaceId === space.id;
                    return (
                      <button
                        key={space.id}
                        type="button"
                        onClick={() => selectSchoolAdminSpace(space.id)}
                        className={cx(
                          'flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-sm font-black transition-colors',
                          active ? 'bg-gray-950 text-white' : 'text-gray-700 active:bg-gray-100'
                        )}
                        aria-pressed={active}
                      >
                        <span className="min-w-0 truncate">{space.title}</span>
                        <span className={cx('shrink-0 rounded-lg px-2 py-1 text-[10px] font-black', active ? 'bg-white text-gray-950' : 'bg-gray-100 text-gray-500')}>{space.type === 'personal' ? '个人' : '学校'}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
            <button type="button" className="h-10 rounded-2xl px-3 text-sm font-black text-gray-500">退出</button>
          </div>
        </div>

        <div className="p-5">
          <section className="rounded-2xl bg-gray-50 p-5">
            <div className="text-xs font-black text-gray-500">当前版本</div>
            <div className="mt-3 text-xl font-black">
              {currentSpace.title}
            </div>
            <div className="mt-4 grid grid-cols-3 gap-2 text-xs font-black text-gray-500">
              {(currentSpace.type === 'personal' ? ['个人班级', '默认指标', '体验报告'] : ['学校班级', '学校指标', '学校报告']).map((item) => (
                <div key={item} className="rounded-xl bg-white px-3 py-2">{item}</div>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  };

  const renderVersionComparePrototype = () => (
    <div className="h-full w-full max-w-[760px] overflow-hidden rounded-2xl border border-gray-200 bg-white text-gray-950">
      <div className="border-b border-gray-200 px-5 py-4">
        <div className="text-base font-black">版本能力对比</div>
      </div>
      <div className="h-[calc(100%-57px)] overflow-y-auto p-5">
        <div className="overflow-hidden rounded-2xl border border-gray-200">
          <div className="grid grid-cols-[1.7fr_0.7fr_0.7fr] border-b border-gray-200 bg-gray-50 px-4 py-3 text-xs font-black text-gray-500">
            <div>能力类型</div>
            <div className="text-center">个人版</div>
            <div className="text-center">学校版</div>
          </div>
          {versionCompareRows.map((row, index) => (
            <div key={row.type} className={cx('grid grid-cols-[1.7fr_0.7fr_0.7fr] items-center px-4 py-3', index > 0 && 'border-t border-gray-100')}>
              <div className="min-w-0 pr-3">
                <div className="truncate text-sm font-black text-gray-800">{row.type}</div>
                <div className="mt-1 truncate text-[11px] font-medium text-gray-500">{row.items.join(' / ')}</div>
              </div>
              <div className={cx('text-center text-base font-black', row.personal === '✓' ? 'text-gray-950' : 'text-gray-300')}>{row.personal}</div>
              <div className={cx('text-center text-base font-black', row.school === '✓' ? 'text-gray-950' : 'text-gray-300')}>{row.school}</div>
            </div>
          ))}
        </div>
      </div>
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
    if (surface === 'versionCompare') return renderVersionComparePrototype();
    if (surface === 'schoolAdmin') return renderSchoolAdminPrototype();
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
          {renderSpaceSelectSheet()}
          {renderFinalReportConfirmSheet()}
          {showCoinIssueHelpOverlay && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/55 px-8" onClick={() => setShowCoinIssueHelpOverlay(false)}>
              <div className="rounded-3xl bg-white p-5 text-center text-sm font-black leading-7 text-gray-900 shadow-[0_20px_60px_rgba(15,23,42,0.25)]">
                开启后，会按照每周/每月基于学生的评价情况，发放校园币。
              </div>
            </div>
          )}
          {renderSchoolBasicInfoEditSheet()}
          {renderSubjectEditSheet()}
          {renderSubjectDeleteConfirmSheet()}
          {renderTermEditSheet()}
          {renderTermActionSheet()}
          {renderAvatarSheet()}
          {renderNameSheet()}
          {renderSchoolUpgradeSheet()}
          {renderTeachingSheet()}
          {renderTeacherBasicConfigSheet()}
          {renderInviteOptionsSheet()}
          {renderWechatChatSheet()}
          {renderClassCodeInviteSheet()}
          {renderInviteConfirmSheet()}
          {renderClassEditSheet()}
          {renderClassExitSheet()}
          {renderRemoveTeacherConfirmSheet()}
          {renderRemoveParentBindingConfirmSheet()}
          {renderParentBindingDetailSheet()}
          {renderTransferHeadTeacherSheet()}
          {renderTransferHeadTeacherConfirmSheet()}
          {renderClassActionSheet()}
          {renderTeacherActionSheet()}
        </div>
      </PhoneMockup>
    );
  };

  const renderPrdPanel = () => {
    if (surface === 'summary') return renderStaticPrdPanel(summaryPrdBlocks);
    if (surface === 'parent') return renderParentPrdPanel();
    if (surface === 'versionCompare') return renderStaticPrdPanel(versionComparePrdBlocks);
    if (surface === 'schoolAdmin') return renderStaticPrdPanel(schoolAdminPrdBlocks);
    if (surface === 'ops') return renderStaticPrdPanel(opsPrdBlocks);

    const isClassDetailPrd = page === 'classDetail' || page === 'classDetailMember' || page === 'classDetailSchoolHead';
    const blocks: PrdBlock[] = [
      ...(!isClassDetailPrd ? [
        { type: 'h1' as const, text: meta.title },
        { type: 'p' as const, text: meta.subtitle },
        { type: 'h2' as const, text: '页面模块' },
        { type: 'list' as const, items: meta.modules },
        { type: 'h2' as const, text: 'CTA 按钮' },
        { type: 'list' as const, items: meta.ctas.map((cta) => `${cta.label}｜${cta.priority}｜${cta.position}`) },
        { type: 'h2' as const, text: '页面状态' },
        { type: 'list' as const, items: stateCycle.map((state) => `${stateLabels[state]}：${meta.states[state]}`) },
      ] : []),
      ...(pagePrdDetails[page] || []),
    ];

    return (
      <aside className="min-h-[60dvh] w-full min-w-0 overflow-y-auto border-t border-gray-200 bg-gray-50 xl:h-full xl:min-h-0 xl:flex-1 xl:border-l xl:border-t-0">
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
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="了解学校版">
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

  const renderSpaceSelectSheet = () => {
    if (!showSpaceSelectSheet) return null;
    const close = () => {
      setShowSpaceSelectSheet(false);
    };
    const selectSpace = (spaceId: TeacherSpaceId) => {
      setCurrentSpaceId(spaceId);
      setShowSpaceSelectSheet(false);
      navigate('mineSchool');
    };

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="切换版本">
        <button type="button" aria-label="关闭版本选择弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">切换版本</h3>
          <div className="mt-4 space-y-2">
            {teacherSpaces.map((space) => {
              const active = currentSpaceId === space.id;
              return (
                <button
                  key={space.id}
                  type="button"
                  onClick={() => selectSpace(space.id)}
                  className={cx('flex min-h-16 w-full items-center justify-between gap-3 rounded-2xl border px-4 text-left active:bg-gray-100', active ? 'border-gray-900 bg-gray-50' : 'border-gray-200 bg-white')}
                >
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-black">{space.title}</span>
                    </span>
                  {active && <span className="shrink-0 rounded-lg bg-gray-100 px-2 py-1 text-[11px] font-black text-gray-600">当前</span>}
                </button>
              );
            })}
          </div>
        </section>
      </div>
    );
  };

  const renderFinalReportConfirmSheet = () => {
    if (!showFinalReportConfirmSheet) return null;
    const close = () => {
      setShowFinalReportConfirmSheet(false);
      setShowFinalReportSamplePreview(false);
    };

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[130] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label={showFinalReportSamplePreview ? '期末报告样例预览' : '期末报告提示'}>
        <button type="button" aria-label="关闭期末报告弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, showFinalReportSamplePreview ? 'max-h-[92%] rounded-t-[28px] border border-gray-200 bg-white px-4 pb-6 pt-4 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]' : 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          {showFinalReportSamplePreview ? (
            <>
              <div className="mb-3 flex items-center justify-between gap-3">
                <h3 className="text-base font-black">期末报告样例</h3>
                <button type="button" onClick={close} className="h-10 rounded-xl px-3 text-sm font-black text-gray-500 active:bg-gray-100">关闭</button>
              </div>
              <div className="max-h-[72vh] overflow-y-auto rounded-2xl bg-gray-50">
                <img src={TERM_REPORT_SAMPLE_IMAGE} alt="期末报告样例" className="block w-full" loading="lazy" />
              </div>
            </>
          ) : (
            <>
              <h3 className="text-base font-black">生成期末报告</h3>
              <p className="mt-3 text-sm leading-6 text-gray-700">还未到学期末，暂时无法生成期末报告。</p>
              <div className="mt-5 space-y-2">
                <button
                  type="button"
                  onClick={() => setShowFinalReportSamplePreview(true)}
                  className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gray-950 text-sm font-black text-white active:bg-gray-800"
                >
                  <Eye size={16} />
                  预览期末报告样例
                </button>
                <button type="button" onClick={close} className="h-11 w-full rounded-2xl text-sm font-medium text-gray-500 active:bg-gray-100">知道了</button>
              </div>
            </>
          )}
        </section>
      </div>
    );
  };

  const renderSchoolBasicInfoEditSheet = () => {
    if (!showBasicInfoEditSheet) return null;
    const close = () => {
      setEditingBasicInfoItem(null);
      setShowBasicInfoEditSheet(false);
    };
    const tabLabel = schoolBasicInfoTabs.find((item) => item.key === activeBasicInfoTab)?.label ?? '基础信息';
    const isDepartment = activeBasicInfoTab === 'department';
    const isEditing = Boolean(editingBasicInfoItem);
    const title = `${isEditing ? '编辑' : '新增'}${tabLabel}`;
    const currentName = editingBasicInfoItem?.name ?? '';

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" aria-label="关闭基础信息编辑弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">{title}</h3>

          <label className="mt-4 block text-xs font-black text-gray-600">
            名称
            <input
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-base font-normal text-gray-950 outline-none focus:border-gray-900"
              defaultValue={currentName}
              placeholder={`请输入${tabLabel}名称`}
            />
          </label>

          {activeBasicInfoTab === 'term' && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              <label className="block text-xs font-black text-gray-600">
                开始日期
                <input className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm font-normal" defaultValue="2026-09-01" />
              </label>
              <label className="block text-xs font-black text-gray-600">
                结束日期
                <input className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm font-normal" defaultValue="2027-01-23" />
              </label>
            </div>
          )}

          <button type="button" onClick={close} className="mt-4 h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">
            完成
          </button>
        </section>
      </div>
    );
  };

  const renderSubjectEditSheet = () => {
    if (!showSubjectEditSheet) return null;
    const close = () => {
      setShowSubjectEditSheet(false);
      setEditingSubjectItem(null);
    };
    const isEditing = Boolean(editingSubjectItem);
    const title = isEditing ? '修改科目名称' : '新增科目';
    const inputId = 'school-subject-name-input';

    const saveSubject = () => {
      const input = document.getElementById(inputId) as HTMLInputElement | null;
      const name = input?.value.trim();
      if (!name) return;
      if (editingSubjectItem) {
        setSubjectItems((items) => items.map((item) => item.id === editingSubjectItem.id ? { ...item, name } : item));
      } else {
        setSubjectItems((items) => [...items, { id: `subject-${Date.now()}`, name }]);
      }
      close();
    };

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label={title}>
        <button type="button" aria-label="关闭科目编辑弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">{title}</h3>

          <label className="mt-4 block text-xs font-black text-gray-600">
            科目名称
            <input
              id={inputId}
              className="mt-2 h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-base font-normal text-gray-950 outline-none focus:border-gray-900"
              defaultValue={editingSubjectItem?.name ?? ''}
              placeholder="请输入科目名称"
            />
          </label>

          <button type="button" onClick={saveSubject} className="mt-4 h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">
            完成
          </button>
        </section>
      </div>
    );
  };

  const renderSubjectDeleteConfirmSheet = () => {
    if (!deletingSubjectItem) return null;
    const close = () => setDeletingSubjectItem(null);
    const confirmDelete = () => {
      setSubjectItems((items) => items.filter((item) => item.id !== deletingSubjectItem.id));
      close();
    };

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[121] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="确认删除科目">
        <button type="button" aria-label="关闭删除科目确认弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">删除科目</h3>
          <div className="mt-3 rounded-2xl bg-gray-50 px-4 py-3 text-sm font-black text-gray-900">{deletingSubjectItem.name}</div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <button type="button" onClick={close} className="h-12 rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100">
              取消
            </button>
            <button type="button" onClick={confirmDelete} className="h-12 rounded-2xl border border-red-100 bg-red-50 text-sm font-black text-red-600 active:bg-red-100">
              确认删除
            </button>
          </div>
        </section>
      </div>
    );
  };

  const renderTermEditSheet = () => {
    if (!showTermEditSheet) return null;
    const close = () => {
      setShowTermEditSheet(false);
      setEditingTermItem(null);
    };
    const isEditing = Boolean(editingTermItem);

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label={isEditing ? '编辑学期' : '新增学期'}>
        <button type="button" aria-label="关闭学期时间编辑弹窗" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">{isEditing ? '编辑学期' : '新增学期'}</h3>
          <label className="mt-4 block text-xs font-black text-gray-600">
            学年
            <select className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm font-normal" defaultValue={editingTermItem?.schoolYear ?? schoolYearOptions[0]}>
              {schoolYearOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <label className="mt-3 block text-xs font-black text-gray-600">
            学期类型
            <select className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm font-normal" defaultValue={editingTermItem?.termType ?? '上学期'}>
              {termTypeOptions.map((item) => (
                <option key={item} value={item}>{item}</option>
              ))}
            </select>
          </label>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <label className="block text-xs font-black text-gray-600">
              开始日期
              <input className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm font-normal" defaultValue={editingTermItem?.start ?? ''} placeholder="YYYY.MM.DD" />
            </label>
            <label className="block text-xs font-black text-gray-600">
              结束日期
              <input className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm font-normal" defaultValue={editingTermItem?.end ?? ''} placeholder="YYYY.MM.DD" />
            </label>
          </div>
          <button
            type="button"
            onClick={() => {
              if (editingTermItem) setCurrentTermId(editingTermItem.id);
            }}
            className="mt-4 flex h-12 w-full items-center justify-between rounded-2xl bg-gray-50 px-4 text-left text-sm font-black active:bg-gray-100"
          >
            设为当前学期
            <span className={cx('h-7 w-12 rounded-full p-1', editingTermItem?.id === currentTermId ? 'bg-gray-900' : 'bg-gray-300')}>
              <span className={cx('block h-5 w-5 rounded-full bg-white transition-transform', editingTermItem?.id === currentTermId && 'translate-x-5')} />
            </span>
          </button>
          <button type="button" onClick={close} className="mt-5 h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">
            完成
          </button>
        </section>
      </div>
    );
  };

  const renderTermActionSheet = () => {
    if (!activeTermAction) return null;
    const close = () => setActiveTermAction(null);
    const isCurrent = activeTermAction.id === currentTermId;

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label="学期操作">
        <button type="button" aria-label="关闭学期操作菜单" className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">{formatTermName(activeTermAction)}</h3>
          <div className="mt-4 overflow-hidden rounded-2xl bg-gray-50">
            <button
              type="button"
              onClick={() => {
                close();
                openTermEditSheet(activeTermAction);
              }}
              className="flex h-12 w-full items-center justify-between border-b border-white px-4 text-left text-sm font-black active:bg-gray-100"
            >
              编辑
              <ChevronRight size={16} />
            </button>
            <button
              type="button"
              disabled={isCurrent}
              onClick={() => {
                setCurrentTermId(activeTermAction.id);
                close();
              }}
              className={cx('flex h-12 w-full items-center justify-between border-b border-white px-4 text-left text-sm font-black', isCurrent ? 'text-gray-400' : 'active:bg-gray-100')}
            >
              设为当前
              {isCurrent && <span className="text-xs font-black">当前</span>}
            </button>
            <button
              type="button"
              onClick={() => {
                setDeletedTermIds((ids) => [...ids, activeTermAction.id]);
                if (activeTermAction.id === currentTermId) {
                  const nextTerm = schoolTermItems.find((item) => item.id !== activeTermAction.id && !deletedTermIds.includes(item.id));
                  if (nextTerm) setCurrentTermId(nextTerm.id);
                }
                close();
              }}
              className="flex h-12 w-full items-center justify-between px-4 text-left text-sm font-black text-rose-600 active:bg-rose-50"
            >
              删除
              <Trash2 size={16} />
            </button>
          </div>
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
              <div className="grid h-[280px] min-h-0 grid-cols-[92px_1fr]">
                <div className="min-h-0 overflow-y-auto overscroll-contain border-r border-gray-200 bg-gray-100 p-2 touch-pan-y">
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
                <div className="flex min-h-0 min-w-0 flex-col p-3">
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

          <button type="button" onClick={submitTeachingSheet} disabled={teachingSelectedClasses.length === 0} className={cx('mt-5 h-12 w-full rounded-2xl border border-gray-200 text-sm font-black', teachingSelectedClasses.length > 0 ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400')}>保存</button>
          <button type="button" onClick={close} className="mt-3 h-10 w-full text-sm font-normal text-gray-400 active:text-gray-600">暂不选择</button>
        </section>
      </div>
    );
  };

  const renderTeacherBasicConfigSheet = () => {
    if (!activeTeacherBasicConfig) return null;
    const close = () => setActiveTeacherBasicConfig(null);
    const configMeta: Record<TeacherBasicConfigKey, { title: string; options: string[] }> = {
      headClass: {
        title: '选择带班班级',
        options: Array.from({ length: 12 }).map((_, index) => `2025级${index + 1}班`),
      },
      gradeLeader: {
        title: '选择分管年级',
        options: ['2025级', '2024级', '2023级', '2022级', '2021级', '2020级'],
      },
      department: {
        title: '部门设置',
        options: schoolDepartmentItems.map((item) => item.name),
      },
    };
    const currentMeta = configMeta[activeTeacherBasicConfig];

    return (
      <div className={cx(bottomSheetBackdropClass, 'z-[120] bg-gray-900/45')} role="dialog" aria-modal="true" aria-label={currentMeta.title}>
        <button type="button" aria-label={`关闭${currentMeta.title}弹窗`} className="absolute inset-0 cursor-default" onClick={close} />
        <section className={cx(bottomSheetPanelClass, 'flex max-h-[78%] flex-col rounded-t-[28px] border border-gray-200 bg-white px-5 pb-7 pt-5 shadow-[0_-16px_40px_rgba(0,0,0,0.10)]')}>
          <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
          <h3 className="text-base font-black">{currentMeta.title}</h3>
          <div className="mt-4 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 touch-pan-y">
            {currentMeta.options.map((item) => {
              const selected = draftTeacherBasicConfigValue === item;
              return (
                <button
                  key={item}
                  type="button"
                  onClick={() => setDraftTeacherBasicConfigValue(item)}
                  className={cx('flex min-h-12 w-full items-center justify-between gap-3 rounded-2xl px-4 text-left text-sm font-normal active:bg-gray-100', selected ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900')}
                >
                  <span className="min-w-0 flex-1 truncate">{item}</span>
                  {selected && <CheckCircle2 size={16} className="shrink-0" />}
                </button>
              );
            })}
          </div>
          <div className="shrink-0 pt-5">
            <button
              type="button"
              onClick={submitTeacherBasicConfigSheet}
              disabled={!draftTeacherBasicConfigValue}
              className={cx('flex min-h-14 w-full shrink-0 items-center justify-center rounded-2xl border border-gray-200 text-sm font-black', draftTeacherBasicConfigValue ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400')}
            >
              保存
            </button>
            <button type="button" onClick={close} className="mt-3 flex min-h-11 w-full shrink-0 items-center justify-center text-sm font-normal text-gray-400 active:text-gray-600">暂不选择</button>
          </div>
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
      const canEnterExperience = Boolean(teacherName.trim() && teacherSchoolName.trim());
      return (
        <>
          <ScreenHeader title="完善信息" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-3">
              <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
                姓名
                <input
                  value={teacherName}
                  onChange={(event) => setTeacherName(event.target.value)}
                  className="mt-2 h-11 w-full border border-gray-200 px-2 text-sm font-normal"
                  placeholder="请输入姓名"
                />
              </label>
              <label className="block rounded-2xl bg-gray-50 p-3 text-xs font-black">
                学校
                <input
                  value={teacherSchoolName}
                  onChange={(event) => setTeacherSchoolName(event.target.value)}
                  className="mt-2 h-11 w-full border border-gray-200 px-2 text-sm font-normal"
                  placeholder="请输入学校名称"
                />
                <span className="mt-2 block text-xs font-normal text-gray-500">填写学校后，可更快找到同校老师创建的班级</span>
              </label>
            </div>
            <button
              type="button"
              disabled={!canEnterExperience}
              onClick={() => navigate('home')}
              className={cx(
                'h-12 w-full rounded-2xl border border-gray-200 text-sm font-black',
                canEnterExperience ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'
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
      const stepsDone = classCreated && hasStudents;
      const currentStep = !classCreated ? 'class' : !hasStudents ? 'student' : 'done';
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
                    {displayName}老师，先做好这两步准备吧
                  </div>
                  <div className="mt-1 text-sm font-medium leading-5 text-gray-600">
                    想用 AI 记录学生的日常行为？先完成两个小步骤。
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
                  <TaskRow done={hasStudents} active={currentStep === 'student'} index={2} label="2. 确认学生" action="去添加" onClick={openStudentAdd} isLast />
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
                  <div className="mt-2 flex h-11 items-center gap-2 bg-white px-3 text-sm font-normal">
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
            <button
              type="button"
              disabled={!canSaveClass}
              onClick={() => {
                if (!canSaveClass) return;
                setClassCreated(true);
                setJoinedClassHasStudents(false);
                navigate('home');
              }}
              className="h-11 w-full text-center text-sm font-black text-gray-400 active:text-gray-600"
            >
              稍后添加
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
        navigate('record');
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
      const canSubmitStudents = studentInputRows.every((row) => row.name.trim() && row.gender);

      return (
        <>
          <ScreenHeader title="添加学生" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              <button
                type="button"
                onClick={() => setShowStudentScanSheet(true)}
                className="flex h-9 w-fit items-center gap-1.5 rounded-full px-1 text-sm font-semibold text-gray-600 active:text-gray-900"
              >
                <ScanLine size={15} />
                扫码识别表格
              </button>
              {studentInputRows.map((row) => {
                const selectedGender = row.gender;
                return (
                  <div key={row.id} className="rounded-2xl bg-gray-50 p-3 text-xs font-black">
                    <div className="flex items-center gap-2.5">
                      <div className="flex min-w-0 flex-1 items-center gap-2">
                        <input
                          value={row.name}
                          onChange={(event) => updateStudentInputRow(row.id, { name: event.target.value })}
                          className="h-11 min-w-0 flex-1 border border-gray-200 bg-white px-2 text-sm font-normal"
                          placeholder="姓名"
                          aria-label="学生姓名"
                        />
                        <input
                          value={row.no}
                          onChange={(event) => updateStudentInputRow(row.id, { no: event.target.value })}
                          className="h-11 w-24 shrink-0 border border-gray-200 bg-white px-2 text-sm font-normal"
                          placeholder="学号选填"
                          aria-label="学生学号"
                        />
                        <div className="grid h-11 w-20 shrink-0 grid-cols-2 gap-1 text-xs font-black">
                          <button type="button" onClick={() => updateStudentInputRow(row.id, { gender: '男' })} className={cx('rounded-xl border border-gray-200', selectedGender === '男' ? 'bg-gray-900 text-white' : 'bg-white')}>男</button>
                          <button type="button" onClick={() => updateStudentInputRow(row.id, { gender: '女' })} className={cx('rounded-xl border border-gray-200', selectedGender === '女' ? 'bg-gray-900 text-white' : 'bg-white')}>女</button>
                        </div>
                      </div>
                      {studentInputRows.length > 1 && (
                        <button type="button" onClick={() => removeStudentInputRow(row.id)} className="flex h-11 w-8 shrink-0 items-center justify-center rounded-xl text-gray-400 active:bg-white active:text-gray-700" aria-label="清除该学生">
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
              <div className="px-1 text-xs font-normal text-gray-500">学号选填，填写后可支持学号进行评价，例如“1号和3号同学打架”</div>
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
              disabled={!canSubmitStudents}
              onClick={() => {
                setClassCreated(true);
                setStudentCount((count) => Math.max(count, studentInputRows.length));
                navigate('record');
              }}
              className={cx('h-12 w-full rounded-2xl border border-gray-200 text-sm font-black', canSubmitStudents ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400')}
            >
              完成
            </button>
          </div>
          {showStudentScanSheet && (
            <div className={cx(bottomSheetBackdropClass, 'z-40 bg-black/35')} role="dialog" aria-modal="true" aria-label="扫码识别表格">
              <button type="button" aria-label="关闭扫码识别表格" className="absolute inset-0 cursor-default" onClick={() => setShowStudentScanSheet(false)} />
              <section className={cx(bottomSheetPanelClass, 'rounded-t-3xl bg-white p-5 shadow-[0_-18px_44px_rgba(15,23,42,0.18)]')}>
                <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300" aria-hidden="true" />
                <div className="text-base font-black">扫码识别表格</div>
                <div className="mt-1 text-xs font-normal text-gray-500">拍摄纸质名单，识别后可再修改</div>
                <button type="button" onClick={fillStudentsFromScannedTable} className="mt-5 h-12 w-full rounded-2xl bg-gray-900 text-sm font-black text-white active:bg-gray-800">
                  开始识别
                </button>
                <button type="button" onClick={() => setShowStudentScanSheet(false)} className="mt-2 h-11 w-full rounded-2xl bg-white text-sm font-medium text-gray-500 active:bg-gray-50">
                  暂不识别
                </button>
              </section>
            </div>
          )}
        </>
      );
    }

    if (page === 'studentBatchEdit') {
      const canSaveStudentBatch = studentBatchEditRows.length > 0 && studentBatchEditRows.every((row) => row.name.trim() && row.gender);

      return (
        <>
          <ScreenHeader title="批量修改学生信息" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              {studentBatchEditRows.map((row) => {
                const selectedGender = row.gender;
                return (
                  <div key={row.id} className="rounded-2xl bg-gray-50 p-3 text-xs font-black">
                    <div className="flex min-w-0 items-center gap-2">
                      <input
                        value={row.name}
                        onChange={(event) => updateStudentBatchEditRow(row.id, { name: event.target.value })}
                        className="h-11 min-w-0 flex-1 border border-gray-200 bg-white px-2 text-sm font-normal"
                        placeholder="姓名"
                        aria-label="学生姓名"
                      />
                      <input
                        value={row.no}
                        onChange={(event) => updateStudentBatchEditRow(row.id, { no: event.target.value })}
                        className="h-11 w-24 shrink-0 border border-gray-200 bg-white px-2 text-sm font-normal"
                        placeholder="学号选填"
                        aria-label="学生学号"
                      />
                      <div className="grid h-11 w-20 shrink-0 grid-cols-2 gap-1 text-xs font-black">
                        <button type="button" onClick={() => updateStudentBatchEditRow(row.id, { gender: '男' })} className={cx('rounded-xl border border-gray-200', selectedGender === '男' ? 'bg-gray-900 text-white' : 'bg-white')}>男</button>
                        <button type="button" onClick={() => updateStudentBatchEditRow(row.id, { gender: '女' })} className={cx('rounded-xl border border-gray-200', selectedGender === '女' ? 'bg-gray-900 text-white' : 'bg-white')}>女</button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              type="button"
              disabled={!canSaveStudentBatch}
              onClick={() => {
                setStudentCount((count) => Math.max(count, studentBatchEditRows.length));
                showClassActionToast('已保存学生信息');
                navigate('studentList');
              }}
              className={cx('h-12 w-full rounded-2xl border border-gray-200 text-sm font-black', canSaveStudentBatch ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400')}
            >
              保存修改
            </button>
          </div>
        </>
      );
    }

    if (page === 'record') {
      const recordGuideExamples = [
        '张三同学今天主动帮助同学解决问题，值得表扬。',
        '2025级1班全体同学积极参加体育锻炼。',
        '2025级1班的1号，2号，3号，4号，7号同学在语文课堂上积极举手发言。',
        '李四同学昨天言语辱骂王五同学。',
      ];
      return (
        <>
          <div className="space-y-3 p-5 pb-28">
            <div className="flex gap-2 text-xs"><button className="rounded-xl bg-gray-50 px-3 py-2">查看默认指标</button></div>
            <section className="rounded-3xl bg-gray-50 p-4">
              <div className="text-sm font-black leading-6">试试通过语音描述一下内容：</div>
              <div className="mt-3 space-y-2">
                {recordGuideExamples.map((example, index) => (
                  <button
                    key={example}
                    type="button"
                    onClick={() => navigate('textInput')}
                    className="flex w-full gap-3 rounded-2xl bg-white p-3 text-left active:bg-gray-100"
                  >
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-gray-900 text-xs font-black text-white">{index + 1}</span>
                    <span className="min-w-0 text-sm font-medium leading-6 text-gray-800">{example}</span>
                  </button>
                ))}
              </div>
            </section>
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

    if (page === 'classListPersonal' || page === 'classListSchool') {
      const isSchoolList = page === 'classListSchool';
      const gradeFilterOptions: SchoolClassGradeFilter[] = ['全部', '一年级', '二年级', '三年级', '四年级', '五年级', '六年级', '初一', '初二', '初三', '高一', '高二', '高三'];
      const classCards = [
        { name: '2025级1班', code: '58273914', stage: '小学' as const, entryYearValue: 2025, tags: ['班主任', '语文'], count: 2, creatorName: teacherName.trim() || '郭老师', isCreator: true },
        { name: '2024级2班', code: '73948162', stage: '小学' as const, entryYearValue: 2024, tags: ['数学'], count: 0, creatorName: '陈老师', isCreator: false },
        { name: '2023级3班', code: '41862753', stage: '小学' as const, entryYearValue: 2023, tags: ['英语'], count: 36, creatorName: '李老师', isCreator: false },
      ];
      const personalClassCards = classCards
        .slice(0, 2)
        .sort((a, b) => Number(b.isCreator) - Number(a.isCreator));
      const createdClassCards = personalClassCards.filter((item) => item.isCreator);
      const joinedClassCards = personalClassCards.filter((item) => !item.isCreator);
      const schoolVisibleClassCards = classCards.filter((item) => {
        const matchGrade = schoolClassGradeFilter === '全部' || inferGradeLabel(item.stage, item.entryYearValue) === schoolClassGradeFilter;
        const matchTeaching = !schoolClassTeachingOnly || item.tags.some((tag) => tag !== '班主任');
        return matchGrade && matchTeaching;
      });
      const visibleClassCards = isSchoolList ? schoolVisibleClassCards : personalClassCards;

      return (
        <>
          <div className="space-y-3 p-5 pb-24">
            {!isSchoolList && (
              <div className="grid grid-cols-2 gap-3">
                <ClassEntryCard type="create" onClick={() => navigate('classCreate')} />
                <ClassEntryCard type="join" onClick={() => navigate('classJoin')} />
              </div>
            )}
            {isSchoolList && (
              <section className="flex items-center justify-between gap-3">
                <div className="relative w-28">
                  <select
                    id="school-class-grade-filter"
                    value={schoolClassGradeFilter}
                    onChange={(event) => setSchoolClassGradeFilter(event.target.value as SchoolClassGradeFilter)}
                    className="h-9 w-full appearance-none rounded-full bg-white px-3 pr-8 text-sm font-semibold text-gray-900 shadow-[0_8px_24px_rgba(15,23,42,0.06)] outline-none ring-1 ring-gray-100 focus:ring-gray-300"
                    aria-label="选择年级筛选班级"
                  >
                    {gradeFilterOptions.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                  <ChevronDown size={15} className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500" />
                </div>
                <button
                  type="button"
                  onClick={() => setSchoolClassTeachingOnly((current) => !current)}
                  className={cx(
                    'h-9 rounded-full px-3 text-sm font-semibold shadow-[0_8px_24px_rgba(15,23,42,0.06)] ring-1 active:bg-gray-100',
                    schoolClassTeachingOnly ? 'bg-gray-900 text-white ring-gray-900' : 'bg-white text-gray-700 ring-gray-100'
                  )}
                  aria-pressed={schoolClassTeachingOnly}
                >
                  任教班级
                </button>
              </section>
            )}
            {isSchoolList ? (
              visibleClassCards.map((item) => (
                <ClassCard key={item.code} {...item} />
              ))
            ) : (
              <>
                {createdClassCards.length > 0 && (
                  <section className="space-y-2">
                    <div className="px-1 text-xs font-medium text-gray-500">创建的班级</div>
                    {createdClassCards.map((item) => (
                      <ClassCard key={item.code} {...item} />
                    ))}
                  </section>
                )}
                {joinedClassCards.length > 0 && (
                  <section className="space-y-2">
                    <div className="px-1 text-xs font-medium text-gray-500">加入的班级</div>
                    {joinedClassCards.map((item) => (
                      <ClassCard key={item.code} {...item} />
                    ))}
                  </section>
                )}
              </>
            )}
          </div>
          <BottomNav />
        </>
      );
    }

    if (page === 'classDetail' || page === 'classDetailMember' || page === 'classDetailSchoolHead') {
      const isHeadTeacherDetail = page === 'classDetail' || page === 'classDetailSchoolHead';
      const openInviteFromDetail = () => {
        openInviteForClass('teacher', page);
      };
      const openInviteParentFromDetail = () => {
        openInviteForClass('parent', page);
      };
      const isSchoolVersionHead = page === 'classDetailSchoolHead';
      const classDangerLabel = isHeadTeacherDetail ? (isSchoolVersionHead ? '退出班级' : '解散班级') : '退出班级';

      return (
        <>
          <ScreenHeader title={isHeadTeacherDetail ? '班级详情（班主任）' : '班级详情（非班主任）'} />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-3 overflow-y-auto pb-4">
              <section className="relative rounded-3xl border border-gray-200 bg-gray-50 p-4">
                {isHeadTeacherDetail && (
                  <button type="button" onClick={openClassEditSheet} className="absolute right-4 top-4 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white active:bg-gray-100" aria-label="编辑班级信息">
                    <Edit3 size={16} />
                  </button>
                )}
                <div className="space-y-3 pr-12">
                  <div className="min-w-0">
                    <h3 className="truncate text-xl font-black leading-7">{activeClassTitle}</h3>
                    <div className="mt-3 flex items-center justify-between gap-3 text-xs font-medium text-gray-600">
                      <button
                        type="button"
                        onClick={() => showClassActionToast('已复制班级号')}
                        className="flex min-w-0 items-center gap-1.5 text-left tabular-nums active:text-gray-950"
                        aria-label="复制班级号"
                      >
                        <span className="shrink-0 whitespace-nowrap">班级号：{formatClassCode(activeClassProfile.code)}</span>
                        <Copy size={13} className="shrink-0 text-gray-500" />
                      </button>
                      <span className="shrink-0 tabular-nums">{activeClassProfile.count}人</span>
                    </div>
                  </div>
                </div>
              </section>

              <section className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black">老师列表<CountText>({classTeachers.length}人)</CountText></div>
                  <button type="button" onClick={() => navigate(isHeadTeacherDetail ? 'teacherList' : 'teacherListMember')} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white active:bg-gray-100" aria-label="查看更多老师">
                    <ChevronRight size={17} />
                  </button>
                </div>
                <div className="mt-3 flex gap-2 overflow-hidden">
                  {classTeachers.slice(0, 5).map((teacher) => (
                    <div key={teacher.name} className="w-[62px] shrink-0 text-center">
                      <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-white text-sm font-black">{teacher.name.slice(0, 1)}</div>
                      <div className="mt-1 truncate text-xs font-black">{teacher.name}</div>
                    </div>
                  ))}
                </div>
                <button type="button" onClick={openInviteFromDetail} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white text-xs font-black active:bg-gray-100">
                  <UserPlus size={16} />
                  邀请老师
                </button>
              </section>

              <section className="rounded-2xl bg-gray-50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm font-black">家长绑定列表<CountText>({boundParentCount}/{parentBindingRows.length})</CountText></div>
                  <button type="button" onClick={() => navigate('parentBindingList')} className="flex h-10 w-10 items-center justify-center rounded-xl bg-white active:bg-gray-100" aria-label="查看更多家长绑定情况">
                    <ChevronRight size={17} />
                  </button>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {sortedParentBindingRows.slice(0, 4).map((student) => (
                    <ParentBindingCard key={student.no} student={student} compact />
                  ))}
                </div>
                <button type="button" onClick={openInviteParentFromDetail} className="mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white text-xs font-black active:bg-gray-100">
                  <UserPlus size={16} />
                  邀请家长绑定
                </button>
              </section>
          </div>
            {isHeadTeacherDetail && (
              <button type="button" onClick={() => setShowTransferHeadTeacherSheet(true)} className="mb-2 h-12 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black text-gray-950 active:bg-gray-100">
                转移班主任
              </button>
            )}
            <button type="button" onClick={() => setShowClassExitSheet(true)} className="h-12 w-full rounded-2xl border border-gray-300 bg-white text-sm font-black text-gray-950 active:bg-gray-100">
              {classDangerLabel}
            </button>
          </div>
        </>
      );
    }

    if (page === 'teacherList') {
      const openInviteFromList = () => {
        openInviteForClass('teacher', 'teacherList', { name: '2025级1班', code: '58273914' });
      };

      return (
        <>
          <ScreenHeader title="老师列表" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-3">
              {primaryClassTeachers.map((teacher) => (
                <div key={teacher.name} className="flex min-h-[92px] items-center gap-3 rounded-2xl bg-gray-50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black">{teacher.name.slice(0, 1)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">{teacher.name}</div>
                    <TeacherRoleTags teacher={teacher} />
                  </div>
                  {teacher.name !== currentTeacherDisplayName && (
                    <button type="button" onClick={() => setActiveTeacherAction(teacher)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500 active:bg-gray-100" aria-label={`${teacher.name}更多操作`}>
                      <MoreHorizontal size={17} />
                    </button>
                  )}
                </div>
              ))}
              {otherClassTeachers.map((teacher) => (
                <div key={teacher.name} className="flex min-h-[92px] items-center gap-3 rounded-2xl bg-gray-50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black">{teacher.name.slice(0, 1)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">{teacher.name}</div>
                    <TeacherRoleTags teacher={teacher} />
                  </div>
                  {teacher.name !== currentTeacherDisplayName && (
                    <button type="button" onClick={() => setActiveTeacherAction(teacher)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500 active:bg-gray-100" aria-label={`${teacher.name}更多操作`}>
                      <MoreHorizontal size={17} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button type="button" onClick={openInviteFromList} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100">
              <UserPlus size={16} />
              邀请老师
            </button>
          </div>
        </>
      );
    }

    if (page === 'teacherListMember') {
      const openInviteFromMemberList = () => {
        openInviteForClass('teacher', 'teacherListMember', { name: activeClassProfile.name, code: activeClassProfile.code });
      };

      return (
        <>
          <ScreenHeader title="老师列表" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="min-h-0 flex-1 space-y-3 overflow-y-auto pb-3">
              {primaryClassTeachers.map((teacher) => (
                <div key={teacher.name} className="flex min-h-[92px] items-center gap-3 rounded-2xl bg-gray-50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black">{teacher.name.slice(0, 1)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">{teacher.name}</div>
                    <TeacherRoleTags teacher={teacher} />
                  </div>
                </div>
              ))}
              {primaryClassTeachers.length > 0 && otherClassTeachers.length > 0 && <div className="h-px bg-gray-200" />}
              {otherClassTeachers.map((teacher) => (
                <div key={teacher.name} className="flex min-h-[92px] items-center gap-3 rounded-2xl bg-gray-50 p-4">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-sm font-black">{teacher.name.slice(0, 1)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-black">{teacher.name}</div>
                    <TeacherRoleTags teacher={teacher} />
                  </div>
                </div>
              ))}
            </div>
            <button type="button" onClick={openInviteFromMemberList} className="mt-3 flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white text-sm font-black active:bg-gray-100">
              <UserPlus size={16} />
              邀请老师
            </button>
          </div>
        </>
      );
    }

    if (page === 'parentBindingList') {
      const parentBindingVisibleRows = parentBindingTab === 'unbound' ? unboundParentBindingRows : boundParentBindingRows;
      const openInviteParentFromBindingList = () => {
        openInviteForClass('parent', page);
      };

      return (
        <>
          <ScreenHeader title="家长绑定列表" />
          <div className="relative flex h-[calc(100%-64px)] flex-col p-5">
            <div className="mb-3 grid grid-cols-2 rounded-2xl bg-gray-100 p-1">
              {[
                { key: 'unbound' as const, label: '未绑定', count: unboundParentBindingRows.length },
                { key: 'bound' as const, label: '已绑定', count: boundParentBindingRows.length },
              ].map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => setParentBindingTab(item.key)}
                  className={cx(
                    'h-10 rounded-xl text-xs font-black tabular-nums active:bg-white',
                    parentBindingTab === item.key ? 'bg-white text-gray-950 shadow-sm' : 'text-gray-500'
                  )}
                >
                  {item.label}({item.count})
                </button>
              ))}
            </div>
            <div className="min-h-0 flex-1 space-y-2 overflow-y-auto pb-20">
              {parentBindingTab === 'unbound' ? unboundParentBindingRows.map((student) => (
                <ParentBindingCard key={student.no} student={student} />
              )) : (
                <div className="space-y-2">
                  {boundParentBindingRows.map((student, index) => (
                    <div key={student.no} className={cx(index > 0 && 'border-t border-gray-100 pt-2')}>
                      <div className="space-y-1.5">
                        {student.guardians.map((guardian) => (
                          <ParentBindingGuardianCard key={guardian.id} student={student} guardian={guardian} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="absolute inset-x-5 bottom-5 bg-white pt-3">
              <button type="button" onClick={openInviteParentFromBindingList} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white text-sm font-black shadow-[0_-10px_24px_rgba(15,23,42,0.06)] active:bg-gray-100">
                <UserPlus size={16} />
                邀请家长绑定
              </button>
            </div>
          </div>
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
                    <button
                      type="button"
                      onClick={openStudentAdd}
                      className="min-h-32 rounded-2xl border border-dashed border-gray-200 bg-gray-50 p-3 text-center active:bg-gray-100"
                    >
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white">
                        <Plus size={18} />
                      </div>
                      <div className="mt-4 text-sm font-black">新增学生</div>
                    </button>
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

    if (page === 'minePersonal' || page === 'mineSchool') {
      const currentSpace = teacherSpaces.find((space) => space.id === currentSpaceId) ?? teacherSpaces.find((space) => space.id === defaultTeacherSpaceId) ?? teacherSpaces[0];
      const hasMultipleVersions = page === 'mineSchool';
      const isCurrentSchoolVersion = currentSpace.type === 'school';
      const currentSpaceTitle = currentSpace.title;
      const managementToolItems: Array<{ key: string; label: string; icon: React.ElementType; onClick: () => void }> = [
        ...(hasMultipleVersions && isCurrentSchoolVersion ? [{
          key: 'schoolDataReport',
          label: '学校数据报表',
          icon: ChartNoAxesColumnIncreasing,
          onClick: () => showClassActionToast('学校数据报表演示中'),
        }] : []),
        {
          key: 'finalReport',
          label: '生成期末报告',
          icon: FileText,
          onClick: openFinalReportConfirmSheet,
        },
      ];
      const moreToolItems: Array<{ key: string; label: string; icon: React.ElementType; onClick: () => void }> = [
        ...mineMoreToolTabs.map((item) => ({
          key: item.key,
          label: `${item.label}管理`,
          icon: item.icon,
          onClick: () => openSchoolBasicInfo(item.key),
        })),
        { key: 'coinIssuanceManagement', label: '货币发放', icon: Coins, onClick: () => navigate('coinIssuanceManagement') },
      ];
      return (
        <>
          <div className="space-y-3 p-5 pb-24">
            <div className="flex items-start gap-3 px-1 pb-1 pt-1">
              <button
                type="button"
                onClick={() => navigate(hasMultipleVersions ? 'teacherBasicInfoSchool' : 'teacherBasicInfoPersonal')}
                className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gray-100 text-lg font-black text-gray-800 active:bg-gray-200"
                aria-label="进入基本信息设置"
              >
                郭
              </button>
              <div className="min-w-0 flex-1">
                  <div className="truncate text-xl font-black">郭老师</div>
                  {hasMultipleVersions && (
                    <button
                      type="button"
                      onClick={() => setShowSpaceSelectSheet(true)}
                      className="mt-2 inline-flex max-w-full items-center gap-1.5 rounded-xl bg-white px-2.5 py-1.5 text-xs font-black text-gray-600 active:bg-gray-100"
                      aria-label="切换版本"
                      aria-expanded={showSpaceSelectSheet}
                    >
                      <span className="min-w-0 truncate">{currentSpaceTitle}</span>
                      <ArrowLeftRight size={13} className="shrink-0" />
                    </button>
                  )}
                  {!hasMultipleVersions && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-lg bg-white px-2 py-1 text-xs font-black">个人版</span>
                    </div>
                  )}
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    onClick={() => showClassActionToast('扫一扫功能演示中')}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-gray-700 active:bg-gray-100"
                    aria-label="扫一扫"
                  >
                    <ScanLine size={18} />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigate('mineSettings')}
                    className="flex h-11 w-11 items-center justify-center rounded-2xl text-gray-700 active:bg-gray-100"
                    aria-label="设置"
                  >
                    <Settings size={18} />
                  </button>
                </div>
              </div>

            <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="text-sm font-black">管理工具</div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                {managementToolItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={item.onClick}
                      className="flex min-h-[86px] flex-col justify-between rounded-2xl border border-gray-200 bg-gray-50 p-3 text-left active:bg-gray-100"
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white text-gray-900 shadow-[0_6px_16px_rgba(15,23,42,0.08)]">
                        <Icon size={18} />
                      </span>
                      <span className="text-sm font-black leading-5">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="text-sm font-black">更多工具</div>
              <div className="mt-4 grid grid-cols-3 gap-2">
                {moreToolItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.key}
                      type="button"
                      onClick={item.onClick}
                      className="flex min-h-[70px] flex-col items-center justify-center gap-2 rounded-2xl text-center active:bg-gray-100"
                    >
                      <Icon size={28} className="text-gray-700" />
                      <span className="text-xs font-black leading-4">{item.label}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {!hasMultipleVersions && (
              <button type="button" onClick={() => setShowSchoolUpgradeSheet(true)} className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white">了解学校版</button>
            )}


          </div>
          <BottomNav />
        </>
      );
    }

    if (page === 'teacherBasicInfoPersonal' || page === 'teacherBasicInfoSchool') {
      const isPersonalBasicInfo = page === 'teacherBasicInfoPersonal';
      const basicInfoRows = [
        ...(!isPersonalBasicInfo ? [
          { key: 'headClass' as const, label: '带班班级', value: teacherBasicConfigValues.headClass },
          { key: 'gradeLeader' as const, label: '分管年级', value: teacherBasicConfigValues.gradeLeader },
        ] : []),
        { key: 'department' as const, label: '部门设置', value: teacherBasicConfigValues.department },
      ];
      return (
        <>
          <ScreenHeader title="基本信息设置" />
          <div className="teacher-basic-info-lowfi space-y-3 bg-gray-50 p-4 pb-24">
            <section className="overflow-hidden rounded-3xl bg-white">
              <button type="button" onClick={() => setShowAvatarSheet(true)} className="teacher-basic-info-avatar-wireframe flex min-h-[104px] w-full items-center justify-center bg-white active:bg-gray-50" aria-label="更换头像">
                <div className="relative">
                  <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-100 text-2xl font-semibold text-gray-700">郭</div>
                  <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-white text-gray-600 shadow-[0_2px_8px_rgba(15,23,42,0.10)]">
                    <Camera size={15} />
                  </span>
                </div>
              </button>

              <button type="button" onClick={openNameSheet} className="flex min-h-[52px] w-full items-center justify-between gap-3 border-t border-gray-100 px-4 text-left active:bg-gray-50" aria-label="修改姓名">
                <span className="text-sm font-normal text-gray-500">姓名</span>
                <span className="flex min-w-0 items-center gap-2 text-sm font-normal text-gray-900">
                  <span className="truncate">{teacherName || '郭老师'}</span>
                  <Edit3 size={15} className="shrink-0 text-gray-500" />
                </span>
              </button>
            </section>

            <section className="overflow-hidden rounded-3xl bg-white">
              <div className="px-4 py-3">
                <div className="text-sm font-semibold text-gray-900">教师基础配置</div>
              </div>

              <div className="divide-y divide-gray-100">
                <div className="px-4 py-3">
                  <div className="flex min-h-9 items-center justify-between gap-3">
                    <span className="text-sm font-normal text-gray-500">任教班级</span>
                    <button type="button" onClick={openTeachingCreate} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gray-100 text-gray-700 active:bg-gray-200" aria-label="新增任教班级">
                      <Plus size={16} />
                    </button>
                  </div>
                  <div className="mt-2 space-y-2">
                    {teachingInfoRows.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2">
                        <div className="min-w-0 flex-1">
                          <span className="flex items-center justify-between gap-2">
                            <span className="text-sm font-semibold text-gray-900">{item.subject}</span>
                            <span className="rounded-full bg-white px-2 py-1 text-[10px] font-medium text-gray-500">{item.classes.length} 个班</span>
                          </span>
                          <span className="mt-1 block truncate text-xs font-normal text-gray-500">{item.classes.join('、')}</span>
                        </div>
                        <button type="button" onClick={() => removeTeachingRow(index)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white text-red-500 active:bg-red-50" aria-label={`删除任教班级${index + 1}`}>
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {basicInfoRows.map((row) => (
                  <button key={row.label} type="button" onClick={() => openTeacherBasicConfigSheet(row.key)} className="flex min-h-[52px] w-full items-center justify-between gap-3 px-4 text-left active:bg-gray-50" aria-label={`编辑${row.label}`}>
                    <span className="text-sm font-normal text-gray-500">{row.label}</span>
                    <span className="flex min-w-0 items-center gap-2 text-right text-sm font-normal text-gray-900">
                      <span className="min-w-0 truncate">{row.value}</span>
                      <Edit3 size={15} className="shrink-0 text-gray-400" />
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </>
      );
    }

    if (page === 'mineSettings') {
      return (
        <>
          <ScreenHeader title="设置" />
          <div className="space-y-3 p-5 pb-5">
            <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
              <div className="px-4 py-3 text-sm font-black">账号安全</div>
              <div className="h-px bg-gray-100" />
              <div className="flex h-12 items-center justify-between px-4 text-sm font-black">
                <span>登录账号</span>
                <span className="font-medium text-gray-500">139****0121</span>
              </div>
              <div className="flex h-12 items-center justify-between border-t border-gray-100 px-4 text-sm font-black">
                <span className="flex items-center gap-2"><KeyRound size={16} />修改密码</span>
                <ChevronRight size={16} />
              </div>
            </section>

            <div className="overflow-hidden rounded-2xl bg-gray-50">
              {['隐私协议', '用户协议'].map((item) => (
                <button key={item} type="button" className="flex h-12 w-full items-center justify-between border-b border-white px-4 text-left text-sm font-black last:border-b-0">
                  <span>{item}</span>
                  <ChevronRight size={16} />
                </button>
              ))}
            </div>

            <button type="button" className="h-11 w-full rounded-2xl border border-gray-200 bg-white text-sm font-black">退出登录</button>
          </div>
        </>
      );
    }

    if (page === 'termManagement') {
      const visibleTermItems = schoolTermItems.filter((item) => !deletedTermIds.includes(item.id));
      const currentTerm = visibleTermItems.find((item) => item.id === currentTermId) ?? visibleTermItems[0] ?? schoolTermItems[0];

      return (
        <>
          <ScreenHeader title="学期管理" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-3 overflow-y-auto pb-24">
              <section className="rounded-3xl bg-gray-50 p-4">
                <div className="text-xs font-black text-gray-500">当前学期</div>
                <div className="mt-2 text-base font-black">{formatTermName(currentTerm)}</div>
                <div className="mt-1 text-xs font-medium text-gray-500">{currentTerm.start} - {currentTerm.end}</div>
              </section>

              <section className="space-y-2">
                <div className="flex items-center justify-between px-1">
                  <FormSectionTitle title={`${visibleTermItems.length} 个学期`} />
                  <button type="button" onClick={() => openTermEditSheet()} className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-black active:bg-gray-100">新增</button>
                </div>
                {visibleTermItems.map((item) => {
                  const isCurrent = item.id === currentTermId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setActiveTermAction(item)}
                      className="flex min-h-20 w-full items-center justify-between gap-3 rounded-2xl bg-gray-50 px-4 py-3 text-left active:bg-gray-100"
                    >
                      <div className="flex min-w-0 flex-1 items-center gap-3">
                        <div className={cx('h-2.5 w-2.5 shrink-0 rounded-full', isCurrent ? 'bg-teal-500' : 'bg-gray-300')} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate text-sm font-black">{formatTermName(item)}</div>
                          <div className="mt-1 text-xs font-medium text-gray-500">{item.start} - {item.end}</div>
                        </div>
                      </div>
                      <div className="flex shrink-0 items-center gap-2">
                        {isCurrent && <BasicInfoStatusBadge status="current" />}
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white text-gray-500">
                          <MoreHorizontal size={18} />
                        </span>
                      </div>
                    </button>
                  );
                })}
              </section>
            </div>
          </div>
        </>
      );
    }

    if (page === 'subjectManagement') {
      return (
        <>
          <ScreenHeader title="科目管理" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-3 overflow-y-auto pb-24">
              <section className="space-y-2">
                {subjectItems.map((item) => (
                  <div
                    key={item.id}
                    draggable
                    onDragStart={() => setDraggingSubjectId(item.id)}
                    onDragOver={(event) => {
                      event.preventDefault();
                      if (draggingSubjectId) moveSubjectItem(draggingSubjectId, item.id);
                    }}
                    onDragEnd={() => setDraggingSubjectId(null)}
                    className={cx(
                      'flex min-h-14 w-full items-center gap-3 rounded-2xl bg-gray-50 px-3 py-2 text-left active:bg-gray-100',
                      draggingSubjectId === item.id && 'opacity-60'
                    )}
                  >
                    <span className="flex h-10 w-8 shrink-0 cursor-grab items-center justify-center rounded-xl text-gray-400 active:cursor-grabbing" aria-label="拖动排序">
                      <GripVertical size={18} />
                    </span>
                    <button type="button" onClick={() => openSubjectEditSheet(item)} className="min-w-0 flex-1 truncate text-left text-sm font-black">
                      {item.name}
                    </button>
                    <button type="button" onClick={() => openSubjectEditSheet(item)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500 active:bg-gray-100" aria-label={`修改${item.name}`}>
                      <Edit3 size={16} />
                    </button>
                    <button type="button" onClick={() => setDeletingSubjectItem(item)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-red-500 active:bg-red-50" aria-label={`删除${item.name}`}>
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => openSubjectEditSheet()}
                  className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-2 text-sm font-black text-gray-600 active:bg-gray-50"
                >
                  <Plus size={16} />
                  新增
                </button>
              </section>
            </div>
          </div>
        </>
      );
    }

    if (page === 'departmentManagement') {
      const visibleDepartmentItems = schoolDepartmentItems.filter((item) => !deletedDepartmentIds.includes(item.id));

      return (
        <>
          <ScreenHeader title="部门管理" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-2 overflow-y-auto pb-24">
              <section className="space-y-2">
                {visibleDepartmentItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex min-h-14 w-full items-center gap-2 rounded-2xl bg-gray-50 px-3 py-2"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBasicInfoTab('department');
                        openBasicInfoEditSheet(item);
                      }}
                      className="min-w-0 flex-1 truncate px-1 text-left text-sm font-black active:text-gray-600"
                    >
                      {item.name}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setActiveBasicInfoTab('department');
                        openBasicInfoEditSheet(item);
                      }}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-gray-500 active:bg-gray-100"
                      aria-label={`修改${item.name}`}
                    >
                      <Edit3 size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletedDepartmentIds((ids) => [...ids, item.id])}
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-rose-500 active:bg-rose-50"
                      aria-label={`删除${item.name}`}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => {
                    setActiveBasicInfoTab('department');
                    openBasicInfoEditSheet();
                  }}
                  className="flex min-h-14 w-full items-center justify-center gap-2 rounded-2xl border border-dashed border-gray-300 bg-white px-4 py-3 text-sm font-black text-gray-600 active:bg-gray-50"
                >
                  <Plus size={16} />
                  新增部门
                </button>
              </section>
            </div>
          </div>
        </>
      );
    }

    if (page === 'coinIssuanceManagement') {
      const budgetSentencePrefix = coinIssuePeriod === 'weekly' ? '每周每个班级发放' : '每月每个班级发放';
      const sliderClass = 'h-2 w-full accent-gray-900';
      const sunshinePoolAmount = coinClassBudget * sunshineRatio / 100;
      const rankingPoolAmount = coinClassBudget * rankingRatio / 100;
      return (
        <>
          <ScreenHeader title="货币发放管理" />
          <div className="flex h-[calc(100%-64px)] flex-col p-5">
            <div className="flex-1 space-y-3 overflow-y-auto pb-24">
              <section className="rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                <div className="flex min-h-12 items-center justify-between gap-3">
                  <div className="flex min-w-0 items-center gap-2">
                    <span className="truncate text-sm font-black">开启货币发放</span>
                    <button
                      type="button"
                      onPointerDown={() => setShowCoinIssueHelpOverlay(true)}
                      onContextMenu={(event) => event.preventDefault()}
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-gray-500 active:bg-gray-100"
                      aria-label="长按查看货币发放说明"
                    >
                      <CircleHelp size={16} />
                    </button>
                  </div>
                  <SwitchControl
                    checked={coinIssuanceEnabled}
                    onChange={setCoinIssuanceEnabled}
                    ariaLabel="开启货币发放"
                  />
                </div>
              </section>

              {coinIssuanceEnabled && (
                <section className="space-y-3 rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]">
                  <label className="block">
                    <span className="text-sm font-black">发放周期</span>
                    <select
                      value={coinIssuePeriod}
                      onChange={(event) => setCoinIssuePeriod(event.target.value as CoinIssuePeriod)}
                      className="mt-2 h-11 w-full rounded-2xl border border-gray-200 bg-gray-50 px-3 text-sm font-black"
                    >
                      <option value="weekly">每周一发放</option>
                      <option value="monthly">每月一号发放</option>
                    </select>
                  </label>

                  <label className="block">
                    <span className="text-sm font-black">班级总预算</span>
                    <div className="mt-2 flex min-h-12 items-center gap-2 rounded-2xl border border-gray-200 bg-gray-50 px-3">
                      <span className="shrink-0 text-sm font-black text-gray-700">{budgetSentencePrefix}</span>
                      <input
                        type="number"
                        min={0}
                        value={coinClassBudget}
                        onChange={(event) => setCoinClassBudget(Number(event.target.value || 0))}
                        className="h-9 min-w-0 flex-1 rounded-xl border border-gray-200 bg-white px-2 text-center text-sm font-black text-gray-950"
                        aria-label={budgetSentencePrefix}
                      />
                      <span className="shrink-0 text-sm font-black text-gray-700">币</span>
                    </div>
                  </label>

                  <label className="block rounded-2xl bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black">阳光保底比例</span>
                      <span className="text-sm font-black">{sunshineRatio}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={sunshineRatio}
                      onChange={(event) => updateSunshineRatio(Number(event.target.value))}
                      className={sliderClass}
                    />
                    <div className="mt-2 space-y-1 text-xs leading-5 text-gray-500">
                      <div className="font-medium">每位学生无论评价如何，都可以获得的奖励。</div>
                      <div className="font-black text-gray-900">全班平分：{formatCoinAmount(sunshinePoolAmount)}币</div>
                    </div>
                  </label>

                  <label className="block rounded-2xl bg-gray-50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-black">积分排行比例</span>
                      <span className="text-sm font-black">{rankingRatio}%</span>
                    </div>
                    <input
                      type="range"
                      min={0}
                      max={100}
                      step={1}
                      value={rankingRatio}
                      onChange={(event) => updateRankingRatio(Number(event.target.value))}
                      className={sliderClass}
                    />
                    <div className="mt-2 space-y-1 text-xs leading-5 text-gray-500">
                      <div className="font-medium">评分为正的学生，可按比例分配的奖励。</div>
                      <div className="font-black text-gray-900">奖池金额：{formatCoinAmount(rankingPoolAmount)}币</div>
                    </div>
                  </label>

                  <button
                    type="button"
                    onClick={() => showClassActionToast('货币发放配置已保存')}
                    className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-900 text-sm font-black text-white active:bg-gray-800"
                  >
                    保存
                  </button>
                </section>
              )}
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
    <main
      className="flex h-[100dvh] w-screen flex-col overflow-y-auto bg-white text-gray-950 xl:flex-row xl:overflow-hidden"
      style={{ '--prototype-width': `${prototypeWidth}%` } as React.CSSProperties}
    >
      <section
        className={cx('flex h-[100dvh] w-full shrink-0 items-center justify-center bg-white xl:h-full xl:w-[min(var(--prototype-width),100%)]', surface === 'ops' ? 'p-2 xl:p-4' : 'p-4')}
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
        className="hidden h-full w-2 shrink-0 cursor-col-resize items-center justify-center bg-gray-100 transition-colors active:bg-gray-200 xl:flex"
      >
        <span className="h-12 w-1 rounded-full bg-gray-300" />
      </button>
      {renderPrdPanel()}
    </main>
  );
};

export default TeacherCMobileLowFi;
