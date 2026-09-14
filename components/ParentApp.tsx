import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Clock,
  Eye,
  EyeOff,
  Files,
  FileText,
  KeyRound,
  LogOut,
  PiggyBank,
  Plus,
  ShieldCheck,
  Star,
  UserRound,
  X,
  type LucideIcon,
} from 'lucide-react';
import { GROWTH_COIN_TERMS } from '../shared/growthCoinTerminology';
import PhoneMockup from './PhoneMockup';
import {
  ParentBottomSheet,
  ParentCard,
  ParentChildAvatar,
  ParentGradientIcon,
  ParentPageShell,
  ParentPrimaryButton,
  ParentSecondaryButton,
} from './parent-app/ParentUI';
import AssignedQuestionnaireView from './parent-app/AssignedQuestionnaireView';
import {
  parentMobileCssVariables,
  parentSurface,
  parentTypography,
} from './parent-app/ParentStyleTokens';
import { BANK_CONFIG } from '../constants';
import { ASSETS } from '../mobile-app/assets/images';
import {
  QUESTIONNAIRE_STORE_EVENT,
  getActiveQuestionnaireTargets,
  getQuestionnaireCollectionMode,
  getQuestionnaireByInviteCode,
  isQuestionnaireOverdue,
  readQuestionnaires,
  type QuestionnaireRecord,
} from '../shared/questionnaireStore';
import { formatQuestionnaireCompletionTime } from '../shared/questionnaireTime';
import { evaluationScoreSemantic } from '../shared/evaluationScoreTokens';
import TeacherMobileScreenBackground from '../mobile-app/components/TeacherMobileScreenBackground';
import {
  defaultParentGradientPreview,
  type TeacherGradientPreviewConfig,
} from '../mobile-app/styles/teacherGradientPreview';
import {
  EXCHANGE_PASSWORD_LENGTH,
  isValidExchangePassword,
  maskExchangePassword,
  sanitizeExchangePassword,
} from '../shared/exchangePassword';
import {
  canShowParentEvaluationDetails,
  canShowParentEvaluationSummary,
  getParentEvaluationVisibilitySettings,
  type ParentEvaluationVisibilitySettings,
} from '../shared/parentEvaluationVisibility';

interface ParentAppProps {
  showPhoneShell?: boolean;
  gradientPreview?: TeacherGradientPreviewConfig;
  defaultHasBoundChild?: boolean;
  defaultLoggedIn?: boolean;
  initialQuestionnaireInviteCode?: string;
  parentEvaluationVisibility?: ParentEvaluationVisibilitySettings;
  parentBankFeatureEnabled?: boolean;
  onActiveClassIdChange?: (classId: string) => void;
}

type Screen = 'binding' | 'growth' | 'reports' | 'archiveList' | 'archiveDetail' | 'questionnaireForm' | 'questionnaireDetail' | 'reportDetail' | 'bank' | 'growthRecords' | 'todo' | 'mine';
type ReportType = 'month' | 'term';
type BankTab = 'deposit' | 'list';
type GrowthRangeMode = 'day' | 'week' | 'month' | 'term';
type GrowthTermKey = 'first' | 'second';
type MineSheet = 'profile' | 'privacy' | 'logout' | null;
type InviteOutcome = 'invalid' | 'ended' | 'submitted' | 'out_of_scope' | null;

interface EvaluationRecord {
  id: string;
  title: string;
  dimension: string;
  indicatorPath: [string, string, string];
  teacher: string;
  time: string;
  createdAt: number;
  score: number;
  content: string;
}

const formatEvaluationTeacherName = (teacher: string) => {
  const normalizedTeacher = teacher.trim();
  if (!normalizedTeacher) return '老师';
  return normalizedTeacher.endsWith('老师') ? normalizedTeacher : `${normalizedTeacher}老师`;
};

interface BankRecord {
  id: string;
  title: string;
  time: string;
  amount: number;
  detail: string;
}


interface ParentDeposit {
  id: string;
  type: 'fixed' | 'current';
  amount: number;
  startDate: number;
  termDays: number;
  interestRate: number;
  label: string;
}

interface GrowthReport {
  id: string;
  type: ReportType;
  title: string;
  period: string;
  summary: string;
  highlights: string[];
  focus: string;
  suggestion: string;
}

interface ArchiveSourceRecord {
  id: string;
  title: string;
  source: '家长问卷' | '孩子访谈' | '教师观察';
  time: string;
  status: string;
  formIntro: StudentArchiveField[];
  formSections: ArchiveSourceSection[];
}

interface StudentArchiveField {
  label: string;
  value: string;
}

interface ArchiveSourceQuestion {
  id: string;
  dimension: string;
  prompt: string;
  options: string;
  answer: string;
  note?: string;
}

interface ArchiveSourceSection {
  title: string;
  questions: ArchiveSourceQuestion[];
}

interface StudentArchiveSection {
  title: string;
  items: string[];
}

interface StudentArchiveContentGroup {
  title: string;
  sections: StudentArchiveSection[];
}

interface StudentArchive {
  id: string;
  title: string;
  templateName: string;
  stage: string;
  createdAt: string;
  summary: StudentArchiveField[];
  basicInfo: StudentArchiveField[];
  healthInfo: StudentArchiveField[];
  contentGroups: StudentArchiveContentGroup[];
  sourceRecords: ArchiveSourceRecord[];
}

interface PendingQuestionnaire {
  id: string;
  title: string;
  description?: string;
  audience: 'parent' | 'student';
  sourceRecordId: string;
}

type QuestionnaireAnswerDraft = Record<string, string[]>;

interface ChildProfile {
  id: string;
  classId: string;
  name: string;
  gender: 'male' | 'female';
  schoolCode: string;
  school: string;
  className: string;
  studentNo: string;
  avatar: string;
  avatarTone: string;
  availableCoins: number;
  bankBalance: number;
  exchangePassword: string;
  fiveScores: Record<'德' | '智' | '体' | '美' | '劳', number>;
  records: EvaluationRecord[];
  bankRecords: BankRecord[];
  deposits: ParentDeposit[];
  reports: GrowthReport[];
  pendingQuestionnaires: PendingQuestionnaire[];
  canViewArchive: boolean;
  archives: StudentArchive[];
}

interface DemoChildOptions {
  canViewArchive?: boolean;
}

const createDemoChild = (name: string, schoolCode: string, studentNo: string, index: number, options: DemoChildOptions = {}): ChildProfile => {
  const safeName = name.trim() || `演示学生${index + 1}`;
  const safeSchoolCode = schoolCode.trim() || 'DEMO001';
  const trimmedStudentNo = studentNo.trim();
  const safeStudentNo = /^\d{8}$/.test(trimmedStudentNo)
    ? trimmedStudentNo
    : `202501${(index + 1).toString().padStart(2, '0')}`;
  const scoreOffset = index % 2 === 0 ? 0 : 4;
  const gender = index % 2 === 0 ? 'male' : 'female';
  const avatarPool = gender === 'male' ? ASSETS.AVATAR.SYSTEM_BOYS : ASSETS.AVATAR.SYSTEM_GIRLS;
  const now = Date.now();
  const dayAgo = (days: number) => now - days * 86400000;
  return {
    id: `child-${Date.now()}-${index}`,
    classId: `c_${2025 - index}_${index + 1}`,
    name: safeName,
    gender,
    schoolCode: safeSchoolCode,
    school: `${safeSchoolCode} 实验学校`,
    className: `${2025 - index}级${index + 1}班`,
    studentNo: safeStudentNo,
    avatar: avatarPool[index % avatarPool.length],
    avatarTone: index % 2 === 0 ? 'from-emerald-400 to-cyan-500' : 'from-rose-400 to-orange-400',
    availableCoins: 368 + index * 42,
    bankBalance: 920 + index * 160,
    exchangePassword: index % 2 === 0 ? '246810' : '135790',
    fiveScores: { 德: 91 + scoreOffset, 智: 86 + scoreOffset, 体: 78 + scoreOffset, 美: 84 + scoreOffset, 劳: 93 + scoreOffset },
    records: [
      { id: `record-${index}-1`, title: '主动整理班级图书角', dimension: '德育', indicatorPath: ['崇德', '仪容仪表', '举止得体'], teacher: '张林老师', time: '今天 10:20', createdAt: dayAgo(0), score: 3, content: '你坐姿端正，展现了良好的形象。' },
      { id: `record-${index}-2`, title: '科学实验记录完整', dimension: '智育', indicatorPath: ['启智', '科学探究', '记录完整'], teacher: '周老师', time: '昨天 15:35', createdAt: dayAgo(1), score: 5, content: '观察记录清晰，能用自己的语言解释实验现象。' },
      { id: `record-${index}-2b`, title: '课前物品整理提醒', dimension: '智育', indicatorPath: ['启智', '学习准备', '材料整理'], teacher: '周老师', time: '昨天 08:25', createdAt: dayAgo(1), score: -1, content: '课前材料整理稍慢，提醒后已完成。' },
      { id: `record-${index}-3`, title: '课间奔跑提醒后已改正', dimension: '体育', indicatorPath: ['健体', '安全习惯', '课间有序'], teacher: '陈老师', time: '本周三 09:12', createdAt: dayAgo(2), score: -1, content: '课间活动安全意识需要加强，提醒后能及时调整。' },
      { id: `record-${index}-4`, title: '红领巾岗位认真负责', dimension: '劳动', indicatorPath: ['乐劳', '岗位责任', '主动服务'], teacher: '王老师', time: '本周二 14:10', createdAt: dayAgo(3), score: 4, content: '值日流程熟练，能主动帮助同学完成公共任务。' },
      { id: `record-${index}-5`, title: '晨跑坚持完成目标', dimension: '体育', indicatorPath: ['健体', '运动习惯', '坚持锻炼'], teacher: '陈老师', time: '本周一 08:05', createdAt: dayAgo(4), score: 2, content: '能按节奏完成晨跑，并主动鼓励同伴。' },
      { id: `record-${index}-6`, title: '美术作品构图完整', dimension: '美育', indicatorPath: ['尚美', '艺术表达', '构图完整'], teacher: '林老师', time: '05-09 16:20', createdAt: dayAgo(6), score: 3, content: '画面构图稳定，色彩搭配有自己的想法。' },
      { id: `record-${index}-7`, title: '课堂准备稍慢', dimension: '智育', indicatorPath: ['启智', '学习准备', '材料整理'], teacher: '周老师', time: '05-06 08:50', createdAt: dayAgo(9), score: -1, content: '上课材料准备不够及时，提醒后能跟上课堂节奏。' },
      { id: `record-${index}-8`, title: '小组讨论主动发言', dimension: '智育', indicatorPath: ['启智', '课堂表达', '主动发言'], teacher: '周老师', time: '05-03 11:05', createdAt: dayAgo(12), score: 4, content: '能提出清晰观点，并回应同伴意见。' },
      { id: `record-${index}-9`, title: '午餐后餐盘归位', dimension: '劳动', indicatorPath: ['乐劳', '生活劳动', '物品归位'], teacher: '王老师', time: '04-25 12:35', createdAt: dayAgo(20), score: 2, content: '能自觉完成餐盘归位并保持桌面整洁。' },
      { id: `record-${index}-10`, title: '排队时提醒后安静', dimension: '德育', indicatorPath: ['崇德', '公共秩序', '安静排队'], teacher: '李老师', time: '04-18 10:15', createdAt: dayAgo(27), score: -1, content: '排队等待时需要更稳定，提醒后能及时调整。' },
      { id: `record-${index}-11`, title: '合唱排练认真投入', dimension: '美育', indicatorPath: ['尚美', '音乐表现', '排练投入'], teacher: '林老师', time: '03-22 15:40', createdAt: dayAgo(54), score: 5, content: '排练时专注度高，能记住声部节奏。' },
      { id: `record-${index}-12`, title: '劳动实践记录补交', dimension: '劳动', indicatorPath: ['乐劳', '劳动记录', '按时提交'], teacher: '王老师', time: '03-08 17:10', createdAt: dayAgo(68), score: -1, content: '实践记录完成较晚，后续需要按时整理。' },
    ],
    bankRecords: [
      { id: `bank-${index}-1`, title: '活期收益到账', time: '昨天 08:00', amount: 6, detail: '积分银行自动结算' },
      { id: `bank-${index}-2`, title: '月度成长奖励入账', time: '05-09 18:00', amount: 35, detail: '来自本月综合表现' },
    ],
    deposits: [
      { id: `deposit-${index}-current`, type: 'current', amount: 80, startDate: Date.now() - 86400000 * 3, termDays: 0, interestRate: BANK_CONFIG.DAILY_RATE, label: '活期存单' },
      { id: `deposit-${index}-week`, type: 'fixed', amount: 120, startDate: Date.now() - 86400000 * 4, termDays: 7, interestRate: 0.001 * 7, label: '定期存单-1周' },
    ],
    reports: [
      {
        id: `report-${index}-month`,
        type: 'month',
        title: '月度报告',
        period: '2026 年 5 月',
        summary: '本月整体表现稳定，劳动与德育维度持续领先，体育维度建议继续关注。',
        highlights: ['表扬行为更集中在公共责任', '科学记录质量提升明显', '课间安全提醒后改善较快'],
        focus: '体育维度仍需持续观察，课间活动和运动习惯可以继续巩固。',
        suggestion: '保持当前公共责任参与，周末安排一次稳定运动打卡。',
      },
      {
        id: `report-${index}-term`,
        type: 'term',
        title: '期末报告',
        period: '2025-2026 学年下学期',
        summary: '综合素质发展均衡，能在班级公共事务中承担稳定角色。',
        highlights: ['五育发展较均衡', '课堂表达更主动', '建议持续建立运动习惯'],
        focus: '课堂主动表达已有提升，但稳定性还可以继续加强。',
        suggestion: '下学期优先鼓励孩子表达观点，同时保持规律运动。',
      },
    ],
    pendingQuestionnaires: [
      {
        id: `pending-${index}-parent`,
        title: '一年级学生家长问卷',
        description: '请结合孩子日常表现如实填写，帮助老师更全面地了解孩子。',
        audience: 'parent',
        sourceRecordId: `source-${index}-parent`,
      },
      {
        id: `pending-${index}-student`,
        title: '一年级学生问卷',
        description: '请由孩子根据自己的真实想法完成填写。',
        audience: 'student',
        sourceRecordId: `source-${index}-student`,
      },
    ],
    canViewArchive: Boolean(options.canViewArchive),
    archives: [
      {
        id: `archive-${index}-grade1-initial`,
        title: `${safeName}的档案`,
        templateName: '一年级学生初始档案袋',
        stage: '一年级入学建档',
        createdAt: '2026年9月',
        summary: [
          { label: '综合印象', value: '学习准备较稳定，适合集体生活中的渐进鼓励。' },
          { label: '优势线索', value: '阅读、动手探索和规则意识有较好基础。' },
          { label: '近期关注', value: '继续帮助孩子积累主动表达和运动坚持的成功体验。' },
        ],
        basicInfo: [
          { label: '学生姓名', value: safeName },
          { label: '档案类型', value: '一年级学生初始档案袋' },
          { label: '班级', value: '一（1）班' },
          { label: '性别', value: gender === 'male' ? '男' : '女' },
          { label: '建档日期', value: '2026年9月' },
          { label: '建档教师签字', value: '张林老师' },
          { label: '家长确认', value: `${safeName}家长` },
        ],
        healthInfo: [
          { label: '特殊健康提醒', value: '无' },
          { label: '过敏史', value: '无' },
        ],
        contentGroups: [
          {
            title: '学习与认知',
            sections: [
              {
                title: '学业基础',
                items: ['基础认知：启蒙', '专注习惯：10-20分钟', '提问与任务：有时需鼓励'],
              },
              {
                title: '认知特点',
                items: ['学习方式：动手型', '问题解决：自己尝试'],
              },
            ],
          },
          {
            title: '兴趣与交往',
            sections: [
              {
                title: '兴趣偏好',
                items: ['兴趣倾向：阅读、探究', '动手创意：很喜欢'],
              },
              {
                title: '交往风格',
                items: ['帮助分享：有时', '规则礼貌：需提醒', '冲突处理：商量'],
              },
            ],
          },
          {
            title: '家庭与发展目标',
            sections: [
              {
                title: '性格与家庭',
                items: ['情绪稳定性：需安慰', '运动活力：一般', '主要照顾人：父母', '家庭陪伴时间：1-2小时'],
              },
              {
                title: '优先发展目标',
                items: ['家长期望：乐健', '学生自选：尚美', '教师建议：悦群'],
              },
              {
                title: '初始光芒定位',
                items: ['求真', '尚美', '悦群'],
              },
              {
                title: '未来一学期内驱力培养的优先关注方向',
                items: ['继续观察兴趣火花', '重点帮孩子积累“我能行”的成功体验'],
              },
            ],
          },
        ],
        sourceRecords: [
          {
            id: `source-${index}-parent`,
            title: '一年级学生家长问卷',
            source: '家长问卷',
            time: '2026年9月',
            status: '已入档',
            formIntro: [
              { label: '孩子姓名', value: safeName },
              { label: '性别', value: gender === 'male' ? '男' : '女' },
              { label: '填表人', value: '妈妈' },
            ],
            formSections: [
              {
                title: '一、基本情况',
                questions: [
                  { id: 'parent-1', dimension: '一、基本情况', prompt: '1.孩子有没有需要老师特别留意的健康问题（如过敏、哮喘等）？', options: '□没有□有（请简单说明：______）', answer: '没有' },
                  { id: 'parent-2', dimension: '一、基本情况', prompt: '2.平时主要是谁在家带孩子？', options: '□爸妈□老人□保姆□混合', answer: '爸妈' },
                ],
              },
              {
                title: '二、学业基础（了解孩子的学习准备状态）',
                questions: [
                  { id: 'parent-3', dimension: '二、学业基础（了解孩子的学习准备状态）', prompt: '1.基础认知 / 孩子目前的识字量、数数或简单计算能力处于什么水平？', options: '□零基础（几乎不识字，不会计算） / □启蒙阶段（认识少量常见字，能数到20） / □有一定基础（能阅读简单绘本，会20以内加减法）', answer: '启蒙阶段（认识少量常见字，能数到20）' },
                  { id: 'parent-4', dimension: '二、学业基础（了解孩子的学习准备状态）', prompt: '2.专注习惯 / 孩子在家做喜欢的事情（如画画、拼图）时，能安静坐住多久？', options: '□<10分钟（容易分心，坐不住） / □10-20分钟（能坚持一会儿，偶尔走动） / □>20分钟（非常专注，不易被打扰）', answer: '10-20分钟（能坚持一会儿，偶尔走动）' },
                  { id: 'parent-5', dimension: '二、学业基础（了解孩子的学习准备状态）', prompt: '3.倾听表达 / 孩子能否听懂并执行连续的2-3个指令（如“去房间把书拿来放在桌上”）？', options: '□较困难（需要重复多次指令） / □基本可以（大部分时候能听懂） / □完全没问题（反应快，表达清晰）', answer: '基本可以（大部分时候能听懂）' },
                ],
              },
              {
                title: '三、兴趣偏好（发现孩子的闪光点）',
                questions: [
                  { id: 'parent-6', dimension: '三、兴趣偏好（发现孩子的闪光点）', prompt: '4.兴趣倾向 / 在自由活动时间，孩子最喜欢做什么？（可多选）', options: '□阅读/听故事（语言类） / □涂画/手工/唱歌（艺术类） / □跑跳/球类/户外（运动类） / □积木/拼图/拆装（科学/动手类） / □角色扮演/过家家（社交/表演类）', answer: '阅读/听故事（语言类）；积木/拼图/拆装（科学/动手类）' },
                  { id: 'parent-7', dimension: '三、兴趣偏好（发现孩子的闪光点）', prompt: '5.探索意愿 / 遇到不懂的问题或新玩具，孩子的反应通常是？', options: '□等待帮助（等着大人教） / □尝试探索（自己先试一试，不行再问） / □刨根问底（非常好奇，喜欢问“为什么”）', answer: '尝试探索（自己先试一试，不行再问）' },
                ],
              },
              {
                title: '四、交往风格（适应集体生活的关键）',
                questions: [
                  { id: 'parent-8', dimension: '四、交往风格（适应集体生活的关键）', prompt: '6.交往主动性 / 到了一个新环境（如公园、游乐场），孩子通常？', options: '□被动等待（粘着家长，看别人玩） / □观察后加入（看一会儿，再慢慢融入） / □主动出击（很快就能找到玩伴，打成一片）', answer: '观察后加入（看一会儿，再慢慢融入）' },
                  { id: 'parent-9', dimension: '四、交往风格（适应集体生活的关键）', prompt: '7.冲突处理 / 如果和小朋友发生争抢或矛盾，孩子通常会？', options: '□退缩/哭闹（不知所措，找大人求助） / □据理力争（大声争辩，互不相让） / □协商解决（愿意交换玩具或轮流玩）', answer: '协商解决（愿意交换玩具或轮流玩）' },
                ],
              },
              {
                title: '五、性格与情绪',
                questions: [
                  { id: 'parent-10', dimension: '五、性格与情绪', prompt: '8.情绪稳定性 / 当孩子遇到挫折（如搭积木倒了、被批评）时，情绪平复速度？', options: '□较慢（哭闹时间长，需要很久哄） / □一般（哭一会儿，转移注意力就好） / □较快（能自我调节，很快翻篇）', answer: '一般（哭一会儿，转移注意力就好）' },
                  { id: 'parent-11', dimension: '五、性格与情绪', prompt: '9.性格特质 / 您觉得孩子最明显的性格是？', options: '□慢热敏感（心思细腻，容易害羞） / □活泼外向（热情大方，精力旺盛） / □稳重内敛（安静听话，做事有条理）', answer: '稳重内敛（安静听话，做事有条理）' },
                ],
              },
              {
                title: '六、您的期望',
                questions: [
                  { id: 'parent-12', dimension: '六、您的期望', prompt: '11.您最希望孩子在一年级特别发展（优先发展）哪个方面？（只选1项）', options: '□“爱思考、求真理”(求真) / □“心地善、品行正”(从善) / □“发现美、创造美”(尚美) / □“会动手、创意多”(学活) / □“身体棒、心态阳光”(乐健) / □“会合作、乐分享”(悦群)', answer: '“身体棒、心态阳光”(乐健)' },
                ],
              },
              {
                title: '七、兴趣激发度',
                questions: [
                  { id: 'parent-13', dimension: '七、兴趣激发度', prompt: '12.没有大人提醒时，孩子会主动去做什么类型的活动？（可多选）', options: '□翻书/听故事　 / □画画/做手工　 / □搭积木/拼图　 / □角色扮演/过家家　□跑跳/户外活动　 / □其他：______', answer: '翻书/听故事；搭积木/拼图' },
                ],
              },
              {
                title: '八、胜任感',
                questions: [
                  { id: 'parent-14', dimension: '八、胜任感', prompt: '13.当接触到新事物（新玩具、新书、新游戏）时，孩子的第一反应通常是？', options: '□两眼放光，马上凑过去　 / □有点好奇，但需要大人引导才开始□不太感兴趣，转身离开', answer: '有点好奇，但需要大人引导才开始' },
                  { id: 'parent-15', dimension: '八、胜任感', prompt: '14.孩子面对一个有点难的新任务时，通常会？', options: '□说“我来试试”并主动动手　 / □站在旁边看，等大人教　 / □直接说“我不会”或“太难了”', answer: '说“我来试试”并主动动手' },
                  { id: 'parent-16', dimension: '八、胜任感', prompt: '15.完成一件事后，孩子会主动说“你看！”或明显表现出自豪感吗？', options: '□经常这样　 / □偶尔这样　 / □很少这样', answer: '偶尔这样' },
                ],
              },
              {
                title: '九、归属感',
                questions: [
                  { id: 'parent-17', dimension: '九、归属感', prompt: '16.孩子回家后会主动提起学校里的某个人或某件事吗？', options: '□经常主动说起　 / □问了才说　 / □几乎不提', answer: '问了才说' },
                  { id: 'parent-18', dimension: '九、归属感', prompt: '17.孩子提到老师或同学时，语气更多的是？', options: '□开心/兴奋　 / □平静/中性　 / □不开心/抗拒', answer: '开心/兴奋' },
                ],
              },
            ],
          },
          {
            id: `source-${index}-student`,
            title: '一年级学生访谈信息表',
            source: '孩子访谈',
            time: '2026年9月',
            status: '已入档',
            formIntro: [
              { label: '你的名字', value: safeName },
              { label: '班级', value: '一（1）班' },
            ],
            formSections: [
              {
                title: '学习习惯',
                questions: [
                  { id: 'student-1', dimension: '学习习惯', prompt: '1.遇到不懂的事，你会问“为什么”吗？', options: '□经常问□有时候□不太问', answer: '有时候' },
                  { id: 'student-2', dimension: '学习习惯', prompt: '2.老师提问时，你敢举手回答吗？', options: '□敢，经常举□有时举□不太敢', answer: '有时举' },
                ],
              },
              {
                title: '兴趣爱好',
                questions: [
                  { id: 'student-3', dimension: '兴趣爱好', prompt: '3.自由活动时，你最喜欢做什么？（选1-2个）', options: '□看书□画画/手工□唱歌跳舞□跑步跳绳□搭积木□过家家□其他', answer: '看书；搭积木' },
                ],
              },
              {
                title: '动手动脑',
                questions: [
                  { id: 'student-4', dimension: '动手动脑', prompt: '4.你喜欢自己动手做东西（折纸、小实验）吗？', options: '□很喜欢□一般□不喜欢', answer: '很喜欢' },
                ],
              },
              {
                title: '交朋友',
                questions: [
                  { id: 'student-5', dimension: '交朋友', prompt: '5.看到小朋友哭了，你会去安慰他/她吗？', options: '□会□有时会□不会', answer: '有时会' },
                  { id: 'student-6', dimension: '交朋友', prompt: '6.你愿意把玩具或零食分给好朋友吗？', options: '□愿意□有时愿意□不愿意', answer: '有时愿意' },
                ],
              },
              {
                title: '心情',
                questions: [
                  { id: 'student-7', dimension: '心情', prompt: '7.遇到不开心的事（被批评、积木倒了），你会？', options: '□很快就好□要别人哄一下□会哭很久', answer: '要别人哄一下' },
                ],
              },
              {
                title: '运动',
                questions: [
                  { id: 'student-8', dimension: '运动', prompt: '8.你喜欢跑跑跳跳、运动吗？', options: '□很喜欢□一般□不喜欢', answer: '一般' },
                ],
              },
              {
                title: '我的小愿望',
                questions: [
                  { id: 'student-9', dimension: '我的小愿望', prompt: '9.一年级你最希望在哪方面得到表扬？（只选1个）', options: '□“爱思考、求真理”小学者(求真) / □“心地善、品行正”小天使(从善) / □“发现美、创造美”小明星(尚美) / □“会动手、创意多”小巧手(学活) / □“身体棒、心态阳光”小健将(乐健) / □“会合作、乐分享”小达人(悦群)', answer: '“发现美、创造美”小明星(尚美)' },
                ],
              },
              {
                title: '兴趣激发度',
                questions: [
                  { id: 'student-10', dimension: '兴趣激发度', prompt: '10.在学校里，你觉得最好玩的是什么时候？', options: '□上课学新东西　□课间跟同学玩　□体育课/美术课/音乐课　□什么都不好玩……', answer: '体育课/美术课/音乐课' },
                  { id: 'student-11', dimension: '兴趣激发度', prompt: '11.如果让你选，你最想多上一节什么课？', options: '□语文　□数学　□体育　□美术　□音乐　□都不想', answer: '美术' },
                ],
              },
              {
                title: '胜任感',
                questions: [
                  { id: 'student-12', dimension: '胜任感', prompt: '12.你觉得自己做什么事做得特别好？', options: '□写字　□画画　□跑步/运动　□算数□交朋友　□唱歌　□其他：______　□没有什么做得好', answer: '画画' },
                  { id: 'student-13', dimension: '胜任感', prompt: '13.遇到不会的事情，你会怎么做？', options: '□自己再试试　 / □找老师帮忙　 / □找同学帮忙　 / □放一边不做了', answer: '自己再试试' },
                ],
              },
              {
                title: '归属感',
                questions: [
                  { id: 'student-14', dimension: '归属感', prompt: '14.在学校里，你觉得谁最喜欢你？', options: '□××老师　 / □××同学　 / □很多同学都喜欢我　 / □好像没有人喜欢我', answer: '张林老师' },
                  { id: 'student-15', dimension: '归属感', prompt: '15.你最喜欢和谁一起玩？', options: '□××同学（具体名字）　 / □谁都可以　 / □更喜欢自己玩', answer: '谁都可以' },
                ],
              },
            ],
          },
          {
            id: `source-${index}-teacher`,
            title: '一年级教师观察表',
            source: '教师观察',
            time: '2026年9月',
            status: '已入档',
            formIntro: [
              { label: '适用阶段', value: '入学第1-4周（建档期）' },
              { label: '学生姓名', value: safeName },
              { label: '班级', value: '一（1）班' },
              { label: '观察教师', value: '张林老师' },
              { label: '综合判断：该生内驱力当前最突出的信号是（选1项）：', value: '敢于尝试——有“我能行”的底气' },
            ],
            formSections: [
              {
                title: '一、学业基础',
                questions: [
                  { id: 'teacher-1', dimension: '一、学业基础', prompt: '1.课堂专注 / (上课/集会)', options: '□全程跟随：眼神跟随老师，指令反应快。 / □偶尔游离：需老师眼神或语言提醒才能回神。 / □难以静坐：频繁离开座位或摆弄文具，注意力分散。', answer: '偶尔游离：需老师眼神或语言提醒才能回神。', note: '数学课能专注听讲15分钟' },
                  { id: 'teacher-2', dimension: '一、学业基础', prompt: '2.倾听表达 / (问答/交流)', options: '□清晰流畅：能完整表达需求，听懂复杂指令。 / □基本听懂：能执行简单指令，表达稍显胆怯。 / □理解困难：听不懂集体指令，需一对一重复。', answer: '基本听懂：能执行简单指令，表达稍显胆怯。' },
                  { id: 'teacher-3', dimension: '一、学业基础', prompt: '3.读写准备 / (书写/阅读)', options: '□握笔规范：姿势正确，控笔有力，对文字敏感。 / □姿势需纠：握笔过低/趴着写，认识少量常见字。 / □基础薄弱：抗拒动笔，完全不识字，控笔无力。', answer: '姿势需纠：握笔过低/趴着写，认识少量常见字。' },
                ],
              },
              {
                title: '二、性格情绪',
                questions: [
                  { id: 'teacher-4', dimension: '二、性格情绪', prompt: '4.情绪反应 / (受挫/批评)', options: '□阳光resilient：被批评后能马上调整，不记仇。 / □敏感波动：容易掉眼泪，需要老师安抚才能平复。 / □激烈对抗：哭闹时间长，甚至出现扔东西/打滚行为', answer: '敏感波动：容易掉眼泪，需要老师安抚才能平复。' },
                  { id: 'teacher-5', dimension: '二、性格情绪', prompt: '5.性格倾向 / (课间/活动)', options: '□热情外向：主动找老师聊天，声音洪亮，爱表现。 / □温和内敛：安静乖巧，不惹事，但在角落独自玩。 / □慢热警惕：对新环境表现出抗拒，粘人，不愿开口。', answer: '温和内敛：安静乖巧，不惹事，但在角落独自玩。' },
                ],
              },
              {
                title: '三、交往风格',
                questions: [
                  { id: 'teacher-6', dimension: '三、交往风格', prompt: '6.交往主动 / (课间/游戏)', options: '□主动发起：主动邀请同学玩，是群体中心。 / □被动跟随：别人叫他玩就玩，不叫就自己待着。 / □游离/冲突：喜欢推搡别人，或完全拒绝与人互动。', answer: '被动跟随：别人叫他玩就玩，不叫就自己待着。' },
                  { id: 'teacher-7', dimension: '三、交往风格', prompt: '7.规则意识 / (排队/午餐)', options: '□自觉守规：排队安静，吃饭不挑食，有服务意识。 / □需督促：排队爱说话，吃饭慢，需老师盯着。 / □规则淡漠：随意插队，抢别人东西，坐不住。', answer: '需督促：排队爱说话，吃饭慢，需老师盯着。' },
                ],
              },
              {
                title: '四、兴趣偏好',
                questions: [
                  { id: 'teacher-8', dimension: '四、兴趣偏好', prompt: '8.兴趣聚焦 / (自由活动)', options: '□运动型：喜欢跑跳、球类，精力旺盛。 / □艺术型：喜欢涂鸦、唱歌、随着音乐律动。 / □探索型：喜欢观察昆虫、玩积木、拆装物品。 / □阅读型：喜欢翻看绘本，安静听故事。', answer: '探索型：喜欢观察昆虫、玩积木、拆装物品。' },
                ],
              },
              {
                title: '综合',
                questions: [
                  { id: 'teacher-9', dimension: '综合', prompt: '教师评语', options: '（优势、待支持领域）', answer: '动手探索意愿较好，课堂表达还需要更多鼓励。' },
                  { id: 'teacher-10', dimension: '综合', prompt: '建议优先发展维度：', options: '□求真□从善□尚美□学活□乐健□悦群', answer: '悦群' },
                ],
              },
              {
                title: '兴趣激发度',
                questions: [
                  { id: 'teacher-11', dimension: '兴趣激发度', prompt: '', options: '□ 主动发起：在自由活动/课堂间隙，主动选择某项学习材料并持续摆弄。 / □ 兴趣触发：遇到感兴趣的内容时，身体前倾、眼睛发亮、主动追问。 / □ 兴趣平淡：对多数活动反应平淡，较少表现出明显的兴奋或投入。', answer: '兴趣触发：遇到感兴趣的内容时，身体前倾、眼睛发亮、主动追问。', note: '该生最容易被哪类内容点燃？ / 动手操作' },
                ],
              },
              {
                title: '胜任感',
                questions: [
                  { id: 'teacher-12', dimension: '胜任感', prompt: '', options: '□ 敢于尝试：遇到新任务不犹豫，直接动手，不观望、不等待。 / □ 困难应对：遇到卡顿时能自己换方法、自言自语推理、或翻看参考。 / □ 完成表达：完成后主动展示成果，或露出明显的满足/自豪表情。 / □ 求助方式：需要帮助时能说出“哪里不会”，而非直接说“我不会”。 / □ 退缩回避：经常选择不参与或等待别人先做。', answer: '敢于尝试：遇到新任务不犹豫，直接动手，不观望、不等待。', note: '本周最能体现“我能行”的一件事（一句话）：独立完成了积木桥的搭建。' },
                ],
              },
              {
                title: '归属感',
                questions: [
                  { id: 'teacher-13', dimension: '归属感', prompt: '', options: '□ 教师效应：教师在身边时投入度明显高于独自时。 / □ 同伴效应：在合作/小组情境中表现优于独立完成任务时。 / □ 表扬响应：被公开肯定后，后续任务投入度明显提升。 / □ 分享主动：愿意把作品、成果或有趣发现主动展示给同伴/老师看。', answer: '表扬响应：被公开肯定后，后续任务投入度明显提升。', note: '该生的动力更多来自：被表扬的成就感' },
                ],
              },
            ],
          },
        ],
      },
    ],
  };
};


const PARENT_SCREEN_CLASS = 'relative flex-1 overflow-y-auto no-scrollbar bg-transparent';
const BINDING_INPUT_CLASS = 'w-full h-[52px] rounded-[var(--pm-radius-control)] border border-[var(--pm-border-control)] bg-[var(--pm-bg-surface)] px-4 text-[length:var(--pm-font-size-body)] font-[var(--pm-font-weight-regular)] text-[var(--pm-text-primary)] placeholder:text-[var(--pm-text-disabled)] outline-none transition-[border-color,box-shadow] [transition-duration:var(--pm-duration-fast)] focus:border-[var(--pm-brand-primary)] focus:ring-4 focus:ring-[var(--pm-focus-ring)]';
const PARENT_ICON_BUTTON_CLASS = 'flex h-10 w-10 items-center justify-center rounded-full text-[var(--pm-text-tertiary)] transition-[transform,background-color,color] [transition-duration:var(--pm-duration-fast)] ease-out active:scale-[0.98] active:bg-[var(--pm-bg-surface-soft)]';
const PARENT_RANGE_SHORTCUT_CLASS = 'ml-2 h-10 rounded-[var(--pm-radius-control)] border border-[var(--pm-brand-primary-soft-strong)] px-4 text-[length:var(--pm-font-size-body)] font-[var(--pm-font-weight-semibold)] text-[var(--pm-brand-primary-strong)] transition-[transform,background-color] [transition-duration:var(--pm-duration-fast)] ease-out active:scale-[0.98] active:bg-[var(--pm-brand-primary-soft)]';
const PARENT_PRESSABLE_CLASS = 'transition-[transform,background-color,box-shadow,border-color] [transition-duration:var(--pm-duration-fast)] ease-out active:scale-[0.98]';
type ParentBankScheme = {
  type: 'current' | 'fixed';
  days: number;
  dailyRate: number;
  rate: number;
  min: number;
  label: string;
  productName: string;
  termLabel: string;
};

const PARENT_BANK_TERMS: ParentBankScheme[] = [
  { type: 'current', days: 0, dailyRate: BANK_CONFIG.DAILY_RATE, rate: BANK_CONFIG.DAILY_RATE, min: 1, label: '活期存单', productName: '活期存单', termLabel: '随存随取' },
  { type: 'fixed', days: 7, dailyRate: 0.001, rate: 0.001 * 7, min: 1, label: '定期存单-7天', productName: '定期7天', termLabel: '7天' },
  { type: 'fixed', days: 30, dailyRate: 0.0015, rate: 0.0015 * 30, min: 1, label: '定期存单-30天', productName: '定期30天', termLabel: '30天' },
  { type: 'fixed', days: 60, dailyRate: 0.003, rate: 0.003 * 60, min: 1, label: '定期存单-60天', productName: '定期60天', termLabel: '60天' },
  { type: 'fixed', days: 90, dailyRate: 0.005, rate: 0.005 * 90, min: 1, label: '定期存单-90天', productName: '定期90天', termLabel: '90天' },
  { type: 'fixed', days: 180, dailyRate: 0.008, rate: 0.008 * 180, min: 1, label: '定期存单-180天', productName: '定期180天', termLabel: '180天' },
];

const CURRENT_DEPOSIT_PROJECTION_DAYS = [7, 30, 60, 90];
const GROWTH_RANGE_TABS: Array<[GrowthRangeMode, string]> = [
  ['day', '日'],
  ['week', '周'],
  ['month', '月'],
  ['term', '学期'],
];
const PARENT_PROFILE = {
  name: '郑小磊家长',
  relation: '妈妈',
  phone: '138****2688',
};
const formatDailyRate = (rate: number) => `${Number((rate * 100).toFixed(2))}%`;

const ParentDiffuseBackdrop: React.FC<{ preview?: TeacherGradientPreviewConfig }> = ({ preview }) => (
  preview ? (
    <TeacherMobileScreenBackground variant="preview" preview={preview} />
  ) : (
    <div aria-hidden="true" className={`${parentSurface.background} pointer-events-none absolute inset-0 overflow-hidden`} />
  )
);

const ParentApp: React.FC<ParentAppProps> = ({
  showPhoneShell = true,
  gradientPreview = defaultParentGradientPreview,
  defaultHasBoundChild = true,
  defaultLoggedIn = true,
  initialQuestionnaireInviteCode = '',
  parentEvaluationVisibility: parentEvaluationVisibilityInput,
  parentBankFeatureEnabled = true,
  onActiveClassIdChange,
}) => {
  const [screen, setScreen] = useState<Screen>(() => defaultHasBoundChild ? 'growth' : 'binding');
  const [childrenList, setChildrenList] = useState<ChildProfile[]>(() => (
    defaultHasBoundChild ? [
      createDemoChild('郑小磊', 'BS2024', '20250101', 0),
      createDemoChild('林小满', 'BS2024', '20250102', 1, { canViewArchive: true }),
    ] : []
  ));
  const [activeChildId, setActiveChildId] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(defaultLoggedIn);
  const [loginForm, setLoginForm] = useState({ phone: '', code: '' });
  const [pendingInviteCode, setPendingInviteCode] = useState(() => initialQuestionnaireInviteCode.trim());
  const [inviteOutcome, setInviteOutcome] = useState<InviteOutcome>(null);
  const [inviteCandidateIds, setInviteCandidateIds] = useState<string[]>([]);
  const inviteBootstrappedRef = useRef(false);
  const [showChildSwitcher, setShowChildSwitcher] = useState(false);
  const [activeReportId, setActiveReportId] = useState('');
  const [activeArchiveId, setActiveArchiveId] = useState('');
  const [activeSourceId, setActiveSourceId] = useState('');
  const [bindForm, setBindForm] = useState({ schoolCode: '', studentName: '', studentNo: '' });
  const [bindingReturnTarget, setBindingReturnTarget] = useState<'none' | 'switcher'>('none');
  const [bindingReturnScreen, setBindingReturnScreen] = useState<Screen>('growth');
  const [depositAmount, setDepositAmount] = useState('60');
  const [activeBankTab, setActiveBankTab] = useState<BankTab>('deposit');
  const [selectedBankScheme, setSelectedBankScheme] = useState<ParentBankScheme | null>(PARENT_BANK_TERMS[0]);
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [showDepositReview, setShowDepositReview] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<ParentDeposit | null>(null);
  const [activeQuestionnaireId, setActiveQuestionnaireId] = useState('');
  const [sharedQuestionnaires, setSharedQuestionnaires] = useState<QuestionnaireRecord[]>(() => readQuestionnaires());
  const [activeSharedQuestionnaireId, setActiveSharedQuestionnaireId] = useState('');
  const [questionnaireStepIndex, setQuestionnaireStepIndex] = useState(0);
  const [showLegacyQuestionnaireIntro, setShowLegacyQuestionnaireIntro] = useState(false);
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<QuestionnaireAnswerDraft>({});
  const [questionnaireTextAnswers, setQuestionnaireTextAnswers] = useState<Record<string, string>>({});
  const [showQuestionnaireSubmitConfirm, setShowQuestionnaireSubmitConfirm] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState('');
  const [selectedGrowthDate, setSelectedGrowthDate] = useState(() => new Date());
  const [growthRangeMode, setGrowthRangeMode] = useState<GrowthRangeMode>('day');
  const [mineSheet, setMineSheet] = useState<MineSheet>(null);
  const [exchangePasswordChildId, setExchangePasswordChildId] = useState('');
  const [exchangePasswordDraft, setExchangePasswordDraft] = useState('');
  const [exchangePasswordVisible, setExchangePasswordVisible] = useState(false);
  const [exchangePasswordEditing, setExchangePasswordEditing] = useState(false);
  const [exchangePasswordError, setExchangePasswordError] = useState('');
  const [parentNavActiveIndex, setParentNavActiveIndex] = useState(0);

  const activeChild = useMemo(
    () => childrenList.find(child => child.id === activeChildId) ?? childrenList[0] ?? null,
    [activeChildId, childrenList]
  );
  const exchangePasswordChild = useMemo(
    () => childrenList.find(child => child.id === exchangePasswordChildId) ?? null,
    [childrenList, exchangePasswordChildId],
  );
  const parentEvaluationVisibility = getParentEvaluationVisibilitySettings(parentEvaluationVisibilityInput);
  const showPositiveSummary = canShowParentEvaluationSummary(parentEvaluationVisibility.positive);
  const showNegativeSummary = canShowParentEvaluationSummary(parentEvaluationVisibility.negative);
  const showPositiveDetails = canShowParentEvaluationDetails(parentEvaluationVisibility.positive);
  const showNegativeDetails = canShowParentEvaluationDetails(parentEvaluationVisibility.negative);
  const showAnyEvaluationSummary = showPositiveSummary || showNegativeSummary;
  const showAnyEvaluationDetails = showPositiveDetails || showNegativeDetails;
  const isRecordDetailVisible = (record: EvaluationRecord) => (
    record.score > 0 ? showPositiveDetails : showNegativeDetails
  );

  useEffect(() => {
    if (activeChild) onActiveClassIdChange?.(activeChild.classId);
  }, [activeChild?.classId, onActiveClassIdChange]);

  const activeInviteRecord = pendingInviteCode
    ? getQuestionnaireByInviteCode(pendingInviteCode, sharedQuestionnaires)
    : null;

  const openInviteQuestionnaireForChild = (questionnaire: QuestionnaireRecord, child: ChildProfile) => {
    setActiveChildId(child.id);
    setActiveSharedQuestionnaireId(questionnaire.id);
    setInviteOutcome(null);
    setInviteCandidateIds([]);
    setScreen('questionnaireForm');
  };

  const resumeQuestionnaireInvite = (nextChildren = childrenList, preferredChildId = '') => {
    if (!pendingInviteCode) return false;
    const refreshedQuestionnaires = readQuestionnaires();
    setSharedQuestionnaires(refreshedQuestionnaires);
    const questionnaire = getQuestionnaireByInviteCode(pendingInviteCode, refreshedQuestionnaires);
    setInviteCandidateIds([]);

    if (!questionnaire) {
      setInviteOutcome('invalid');
      return false;
    }
    if (questionnaire.status !== 'active') {
      setInviteOutcome('ended');
      return false;
    }
    if (nextChildren.length === 0) {
      setInviteOutcome(null);
      setScreen('binding');
      return false;
    }

    const targetStudentNos = new Set(
      getActiveQuestionnaireTargets(questionnaire)
        .filter(target => target.reachable)
        .map(target => target.studentNo),
    );
    const eligibleChildren = nextChildren.filter(child => targetStudentNos.has(child.studentNo));
    if (eligibleChildren.length === 0) {
      setInviteOutcome('out_of_scope');
      return false;
    }

    const pendingChildren = eligibleChildren.filter(child => {
      const submission = questionnaire.submissions.find(item => item.studentNo === child.studentNo);
      return !submission || submission.reviewStatus === 'returned';
    });
    if (pendingChildren.length === 0) {
      setInviteOutcome('submitted');
      return false;
    }

    const preferredChild = pendingChildren.find(child => child.id === preferredChildId);
    if (preferredChild) {
      openInviteQuestionnaireForChild(questionnaire, preferredChild);
      return true;
    }
    if (pendingChildren.length === 1) {
      openInviteQuestionnaireForChild(questionnaire, pendingChildren[0]);
      return true;
    }

    setInviteOutcome(null);
    setInviteCandidateIds(pendingChildren.map(child => child.id));
    return true;
  };

  useEffect(() => {
    if (!isLoggedIn || !pendingInviteCode || inviteBootstrappedRef.current) return;
    inviteBootstrappedRef.current = true;
    resumeQuestionnaireInvite();
  }, [isLoggedIn]);

  useEffect(() => {
    const refresh = () => setSharedQuestionnaires(readQuestionnaires());
    window.addEventListener(QUESTIONNAIRE_STORE_EVENT, refresh);
    window.addEventListener('storage', refresh);
    return () => {
      window.removeEventListener(QUESTIONNAIRE_STORE_EVENT, refresh);
      window.removeEventListener('storage', refresh);
    };
  }, []);

  const pendingAssignedQuestionnaires = useMemo(() => {
    if (!activeChild) return [];
    return sharedQuestionnaires.filter(questionnaire => (
      questionnaire.status === 'active'
      && questionnaire.growthTemplate !== 'semester_goal'
      && getQuestionnaireCollectionMode(questionnaire) === 'guardian_questionnaire'
      && getActiveQuestionnaireTargets(questionnaire).some(target => target.studentNo === activeChild.studentNo && target.reachable)
      && !questionnaire.submissions.some(submission => (
        submission.studentNo === activeChild.studentNo
        && submission.reviewStatus !== 'returned'
      ))
    ));
  }, [activeChild, sharedQuestionnaires]);
  const activeSharedQuestionnaire = sharedQuestionnaires.find(item => item.id === activeSharedQuestionnaireId) ?? null;

  const activeReport = activeChild?.reports.find(report => report.id === activeReportId) ?? activeChild?.reports[0] ?? null;
  const activeArchive = activeChild?.archives.find(archive => archive.id === activeArchiveId) ?? activeChild?.archives[0] ?? null;
  const activePendingQuestionnaire = activeChild?.pendingQuestionnaires.find(item => item.id === activeQuestionnaireId)
    ?? activeChild?.pendingQuestionnaires[0]
    ?? null;
  const activeSourceRecord = activeArchive?.sourceRecords.find(record => record.id === activeSourceId)
    ?? activeArchive?.sourceRecords[0]
    ?? null;
  const activeQuestionnaireSourceRecord = activePendingQuestionnaire
    ? activeArchive?.sourceRecords.find(record => record.id === activePendingQuestionnaire.sourceRecordId) ?? null
    : null;
  const activeQuestionnaireQuestions = activeQuestionnaireSourceRecord?.formSections.flatMap(section => (
    section.questions.map(question => ({ sectionTitle: section.title, question }))
  )) ?? [];
  const activeQuestionnaireStep = activeQuestionnaireQuestions[questionnaireStepIndex] ?? null;
  const getDayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime();
  const getWeekStartDate = (date: Date) => {
    const day = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const mondayOffset = (day.getDay() + 6) % 7;
    day.setDate(day.getDate() - mondayOffset);
    return day;
  };
  const getGrowthMonthWeekRanges = (year: number, month: number) => {
    const monthStart = new Date(year, month, 1);
    const rangeStart = getWeekStartDate(monthStart);
    const monthEnd = new Date(year, month + 1, 0);
    const ranges: Array<{ start: Date; end: Date }> = [];
    const cursor = new Date(rangeStart);
    while (cursor <= monthEnd) {
      const start = new Date(cursor);
      const end = new Date(cursor);
      end.setDate(start.getDate() + 6);
      ranges.push({ start, end });
      cursor.setDate(cursor.getDate() + 7);
    }
    return ranges;
  };
  const getGrowthTermInfo = (date: Date) => {
    const month = date.getMonth();
    const year = date.getFullYear();
    const schoolYearStart = month >= 8 ? year : year - 1;
    const term: GrowthTermKey = month >= 8 || month === 0 ? 'first' : 'second';
    return {
      schoolYearStart,
      schoolYearEnd: schoolYearStart + 1,
      term,
      label: `${schoolYearStart}-${schoolYearStart + 1}学年`,
    };
  };
  const getGrowthTermRanges = (schoolYearStart: number): Array<{ key: GrowthTermKey; label: string; start: number; end: number }> => ([
    {
      key: 'first',
      label: '上学期',
      start: new Date(schoolYearStart, 8, 1).getTime(),
      end: new Date(schoolYearStart + 1, 1, 1).getTime() - 1,
    },
    {
      key: 'second',
      label: '下学期',
      start: new Date(schoolYearStart + 1, 1, 1).getTime(),
      end: new Date(schoolYearStart + 1, 7, 1).getTime() - 1,
    },
  ]);
  const getGrowthRangeRecords = (date: Date, mode: GrowthRangeMode) => {
    if (!activeChild) return [];
    let start = getDayStart(date);
    let end = start + 86400000 - 1;
    if (mode === 'week') {
      start = getWeekStartDate(date).getTime();
      end = start + 86400000 * 7 - 1;
    }
    if (mode === 'month') {
      start = new Date(date.getFullYear(), date.getMonth(), 1).getTime();
      end = new Date(date.getFullYear(), date.getMonth() + 1, 1).getTime() - 1;
    }
    if (mode === 'term') {
      const termInfo = getGrowthTermInfo(date);
      const termRange = getGrowthTermRanges(termInfo.schoolYearStart).find(range => range.key === termInfo.term);
      if (termRange) {
        start = termRange.start;
        end = termRange.end;
      }
    }
    return activeChild.records.filter(record => record.createdAt >= start && record.createdAt <= end);
  };
  const getGrowthDayRecords = (date: Date) => {
    if (!activeChild) return [];
    const start = getDayStart(date);
    const end = start + 86400000 - 1;
    return activeChild.records.filter(record => record.createdAt >= start && record.createdAt <= end);
  };
  const selectedDateRecords = useMemo(
    () => getGrowthDayRecords(selectedGrowthDate),
    [activeChild, selectedGrowthDate]
  );
  const selectedGrowthRangeRecords = useMemo(
    () => getGrowthRangeRecords(selectedGrowthDate, growthRangeMode),
    [activeChild, selectedGrowthDate, growthRangeMode]
  );
  const selectedPraiseCount = showPositiveSummary
    ? selectedGrowthRangeRecords.filter(record => record.score > 0).length
    : 0;
  const selectedImproveCount = showNegativeSummary
    ? selectedGrowthRangeRecords.filter(record => record.score < 0).length
    : 0;

  const getParentActiveTabIndex = (nextScreen: Screen) => {
    if (nextScreen === 'reports' || nextScreen === 'reportDetail') return 1;
    if (nextScreen === 'mine') return 2;
    return 0;
  };

  useEffect(() => {
    const nextIndex = getParentActiveTabIndex(screen);
    if (nextIndex === parentNavActiveIndex) return;
    setParentNavActiveIndex(nextIndex);
  }, [screen, parentNavActiveIndex]);

  useEffect(() => {
    if (!submitSuccessMessage) return;
    const timer = setTimeout(() => setSubmitSuccessMessage(''), 1800);
    return () => clearTimeout(timer);
  }, [submitSuccessMessage]);

  const updateBindForm = (field: keyof typeof bindForm, value: string) => {
    setBindForm(prev => field === 'schoolCode' && !value.trim()
      ? { schoolCode: value, studentName: '', studentNo: '' }
      : { ...prev, [field]: value }
    );
  };

  const shouldShowStudentBindFields = bindForm.schoolCode.trim().length > 0;
  const canSubmitBinding = Boolean(bindForm.schoolCode.trim() && bindForm.studentName.trim() && bindForm.studentNo.trim());

  const submitBinding = () => {
    if (!canSubmitBinding) return;
    const newChild = createDemoChild(bindForm.studentName, bindForm.schoolCode, bindForm.studentNo, childrenList.length);
    const nextChildren = [...childrenList, newChild];
    setChildrenList(nextChildren);
    setActiveChildId(newChild.id);
    if (pendingInviteCode) {
      setBindingReturnTarget('none');
      resumeQuestionnaireInvite(nextChildren, newChild.id);
      return;
    }
    setScreen(bindingReturnTarget === 'switcher' ? bindingReturnScreen : 'growth');
    setShowChildSwitcher(bindingReturnTarget === 'switcher');
    setBindingReturnTarget('none');
  };

  const openBinding = (returnTarget: 'none' | 'switcher' = 'none') => {
    setBindForm({ schoolCode: '', studentName: '', studentNo: '' });
    setBindingReturnTarget(returnTarget);
    if (returnTarget === 'switcher') {
      setBindingReturnScreen(screen);
    }
    setShowChildSwitcher(false);
    setInviteOutcome(null);
    setInviteCandidateIds([]);
    setScreen('binding');
  };

  const finishInviteToHome = () => {
    setPendingInviteCode('');
    setInviteOutcome(null);
    setInviteCandidateIds([]);
    setActiveSharedQuestionnaireId('');
    setScreen(childrenList.length > 0 ? 'growth' : 'binding');
  };

  const returnToChildSwitcher = () => {
    setScreen(bindingReturnScreen);
    setBindingReturnTarget('none');
    setShowChildSwitcher(true);
  };

  const formatCoin = (value: number) => Number(value.toFixed(2)).toString();

  const getDepositInterest = (deposit: ParentDeposit) => {
    const elapsedDays = Math.max(0, Math.floor((Date.now() - deposit.startDate) / 86400000));
    const matured = deposit.type === 'current' || elapsedDays >= deposit.termDays;
    const currentInterest = Number((deposit.amount * BANK_CONFIG.DAILY_RATE * elapsedDays).toFixed(2));
    const maturityInterest = Number((deposit.amount * deposit.interestRate).toFixed(2));
    const interest = deposit.type === 'current' || !matured ? currentInterest : maturityInterest;
    const availableAt = deposit.type === 'current' ? null : deposit.startDate + deposit.termDays * 86400000;
    return {
      elapsedDays,
      matured,
      availableAt,
      currentInterest,
      maturityInterest,
      interest: Number(interest.toFixed(2)),
      maturityTotal: Number((deposit.amount + maturityInterest).toFixed(2)),
      withdrawalTotal: Number((deposit.amount + interest).toFixed(2)),
    };
  };

  const calculateProjectedInterest = (amount: number, scheme: ParentBankScheme | null) => {
    if (!scheme) return 0;
    const interestRate = scheme.type === 'current' ? scheme.dailyRate : scheme.dailyRate * scheme.days;
    return Number((amount * interestRate).toFixed(2));
  };

  const formatDate = (timestamp: number) => {
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  };
  const formatWeekRange = (start: Date, end: Date) => {
    const pad = (value: number) => String(value).padStart(2, '0');
    return `${pad(start.getMonth() + 1)}.${pad(start.getDate())}-${pad(end.getMonth() + 1)}.${pad(end.getDate())}`;
  };
  const splitArchiveOptions = (options: string) => options
    .split('□')
    .map(option => option.replace(/^[/\s　]+/, '').replace(/[/\s　]+$/, '').trim())
    .filter(Boolean);
  const splitArchiveAnswers = (answer: string) => answer
    .split(/[；;]/)
    .map(item => item.trim())
    .filter(Boolean);
  const isArchiveOptionSelected = (option: string, answers: string[]) => answers.some(answer => (
    option === answer || option.includes(answer) || answer.includes(option)
  ));

  const isMultiQuestion = (question: ArchiveSourceQuestion) => (
    question.prompt.includes('多选') || question.prompt.includes('选1-2个')
  );
  const getQuestionTypeLabel = (question: ArchiveSourceQuestion) => (isMultiQuestion(question) ? '多选' : '单选');

  const getQuestionDefaultAnswers = (question: ArchiveSourceQuestion) => splitArchiveOptions(question.options)
    .filter(option => isArchiveOptionSelected(option, splitArchiveAnswers(question.answer)));

  const getQuestionDraftAnswers = (question: ArchiveSourceQuestion) => (
    questionnaireAnswers[question.id] ?? []
  );

  const optionNeedsTextInput = (option: string) => (
    option.includes('______') || option.includes('其他') || option.includes('××')
  );

  const updateQuestionnaireAnswer = (question: ArchiveSourceQuestion, option: string) => {
    setQuestionnaireAnswers(prev => {
      const current = prev[question.id] ?? [];
      const next = isMultiQuestion(question)
        ? current.includes(option)
          ? current.filter(item => item !== option)
          : [...current, option]
        : [option];
      return { ...prev, [question.id]: next };
    });
    if (!isMultiQuestion(question)) {
      setQuestionnaireTextAnswers(prev => {
        const next = { ...prev };
        Object.keys(next).forEach(key => {
          if (key.startsWith(`${question.id}::`) && key !== `${question.id}::${option}`) {
            delete next[key];
          }
        });
        return next;
      });
    }
  };

  const openQuestionnaireForm = (questionnaireId: string) => {
    const questionnaire = activeChild?.pendingQuestionnaires.find(item => item.id === questionnaireId);
    setActiveSharedQuestionnaireId('');
    setActiveQuestionnaireId(questionnaireId);
    setQuestionnaireStepIndex(0);
    setShowLegacyQuestionnaireIntro(Boolean(questionnaire?.description?.trim()));
    setQuestionnaireAnswers({});
    setQuestionnaireTextAnswers({});
    setScreen('questionnaireForm');
  };

  const submitQuestionnaire = () => {
    if (!activeChild || !activePendingQuestionnaire) return;
    setChildrenList(prev => prev.map(child => child.id === activeChild.id ? {
      ...child,
      pendingQuestionnaires: child.pendingQuestionnaires.filter(item => item.id !== activePendingQuestionnaire.id),
    } : child));
    setShowQuestionnaireSubmitConfirm(false);
    setSubmitSuccessMessage('提交成功');
    setScreen('growth');
  };

  const submitDeposit = () => {
    if (!activeChild || !selectedBankScheme) return;
    const amount = Math.max(1, Math.min(Number(depositAmount) || 1, activeChild.availableCoins));
    const nextDeposit: ParentDeposit = {
      id: `deposit-${Date.now()}`,
      type: selectedBankScheme.type as 'fixed' | 'current',
      amount,
      startDate: Date.now(),
      termDays: selectedBankScheme.days,
      interestRate: selectedBankScheme.rate,
      label: selectedBankScheme.label,
    };
    setChildrenList(prev => prev.map(child => child.id === activeChild.id ? {
      ...child,
      availableCoins: child.availableCoins - amount,
      bankBalance: child.bankBalance + amount,
      deposits: [nextDeposit, ...child.deposits],
    } : child));
    setShowDepositConfirm(false);
    setShowDepositReview(false);
    setActiveBankTab('list');
  };

  const withdrawDeposit = (deposit: ParentDeposit) => {
    if (!activeChild) return;
    const details = getDepositInterest(deposit);
    const finalAmount = details.withdrawalTotal;
    setChildrenList(prev => prev.map(child => child.id === activeChild.id ? {
      ...child,
      availableCoins: child.availableCoins + finalAmount,
      bankBalance: Math.max(0, child.bankBalance - deposit.amount),
      deposits: child.deposits.filter(item => item.id !== deposit.id),
    } : child));
    setWithdrawTarget(null);
  };

  const confirmLogout = () => {
    setChildrenList([]);
    setActiveChildId('');
    setMineSheet(null);
    setIsLoggedIn(false);
    setScreen('binding');
    setSubmitSuccessMessage('已退出登录');
  };

  const openExchangePasswordSheet = (child: ChildProfile | null = activeChild) => {
    if (!child) return;
    setExchangePasswordChildId(child.id);
    setExchangePasswordDraft(child.exchangePassword);
    setExchangePasswordVisible(false);
    setExchangePasswordEditing(false);
    setExchangePasswordError('');
  };

  const closeExchangePasswordSheet = () => {
    setExchangePasswordChildId('');
    setExchangePasswordDraft('');
    setExchangePasswordVisible(false);
    setExchangePasswordEditing(false);
    setExchangePasswordError('');
  };

  const saveExchangePassword = () => {
    if (!exchangePasswordChild) return;
    const nextPassword = exchangePasswordDraft.trim();
    if (!isValidExchangePassword(nextPassword)) {
      setExchangePasswordError('请输入6位数字密码');
      return;
    }
    setChildrenList(prev => prev.map(child => child.id === exchangePasswordChild.id
      ? { ...child, exchangePassword: nextPassword }
      : child));
    setExchangePasswordDraft(nextPassword);
    setExchangePasswordEditing(false);
    setExchangePasswordError('');
    setExchangePasswordVisible(false);
    setSubmitSuccessMessage('兑换密码已更新');
  };

  useEffect(() => {
    if (parentBankFeatureEnabled) return;
    if (screen === 'bank') setScreen('growth');
    if (exchangePasswordChildId) closeExchangePasswordSheet();
  }, [parentBankFeatureEnabled, screen, exchangePasswordChildId]);

  const Header = ({ title, subtitle, showBack = false, backLabel = '返回成长页', onBack }: { title: string; subtitle?: string; showBack?: boolean; backLabel?: string; onBack?: () => void }) => (
    <div className="sticky top-0 z-40 flex h-[44px] shrink-0 items-center justify-between border-b border-[var(--pm-border-subtle)] bg-[var(--pm-bg-surface)]/90 px-4 py-2 backdrop-blur-xl">
      <div className="relative flex h-full w-full items-center justify-center">
        {showBack && (
          <button type="button" onClick={onBack ?? (() => setScreen('growth'))} className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-[var(--pm-bg-surface)] text-[var(--pm-text-primary)] [box-shadow:var(--pm-shadow-control)] transition-transform [transition-duration:var(--pm-duration-fast)] ease-out active:scale-[0.98]" aria-label={backLabel}>
            <ArrowLeft size={18} />
          </button>
        )}
        {title && <h1 className={`${parentTypography.sectionTitle} max-w-[220px] truncate text-center text-balance text-[var(--pm-text-primary)]`}>{title}</h1>}
      </div>
    </div>
  );

  const Login = () => {
    const canLogin = Boolean(loginForm.phone.trim() && loginForm.code.trim());
    return (
      <ParentPageShell className="pb-12">
        <Header title="家长登录" />
        <div className="px-6 pt-7">
          <ParentCard className="p-5" as="section">
            <div className="mb-5 flex items-center gap-3">
              <ParentGradientIcon tone="green" size="lg"><UserRound size={23} /></ParentGradientIcon>
              <div className="min-w-0">
                <h1 className={parentTypography.pageTitle}>登录家长端</h1>
                {pendingInviteCode && <p className="mt-1 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]">登录后继续填写问卷</p>}
              </div>
            </div>
            <div className="space-y-4">
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]"><UserRound size={15} /> 手机号</span>
                <input
                  value={loginForm.phone}
                  onChange={event => setLoginForm(previous => ({ ...previous, phone: event.target.value }))}
                  inputMode="tel"
                  autoComplete="tel"
                  placeholder="请输入手机号"
                  className={BINDING_INPUT_CLASS}
                />
              </label>
              <label className="block">
                <span className="mb-2 flex items-center gap-2 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]"><KeyRound size={15} /> 验证码</span>
                <input
                  value={loginForm.code}
                  onChange={event => setLoginForm(previous => ({ ...previous, code: event.target.value }))}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  placeholder="请输入验证码"
                  className={BINDING_INPUT_CLASS}
                />
              </label>
            </div>
            <ParentPrimaryButton type="button" onClick={() => setIsLoggedIn(true)} disabled={!canLogin} fullWidth className="mt-6 h-14 text-[16px]">
              登录
            </ParentPrimaryButton>
          </ParentCard>
        </div>
      </ParentPageShell>
    );
  };

  const InviteResultPage = () => {
    const resultCopy = inviteOutcome === 'submitted'
      ? { title: '已完成填写', detail: '这份问卷已经提交，无需重复填写。', tone: 'green' as const }
      : inviteOutcome === 'ended'
        ? { title: '问卷已结束', detail: '老师已结束本次问卷收集。', tone: 'orange' as const }
        : inviteOutcome === 'out_of_scope'
          ? { title: '不在填写范围', detail: '当前已绑定的孩子不在本次问卷范围内。', tone: 'softBlue' as const }
          : { title: '邀请已失效', detail: '没有找到对应问卷，请联系老师重新邀请。', tone: 'orange' as const };
    return (
      <ParentPageShell className="pb-12">
        <Header title="问卷" />
        <div className="px-6 pt-8">
          <ParentCard className="p-6 text-center" as="section">
            <ParentGradientIcon tone={resultCopy.tone} size="lg" className="mx-auto">
              {inviteOutcome === 'submitted' ? <CheckCircle2 size={24} /> : <ClipboardList size={24} />}
            </ParentGradientIcon>
            <h1 className="mt-4 text-[length:var(--pm-font-size-page-title)] font-bold text-[var(--pm-text-primary)]">{resultCopy.title}</h1>
            <p className="mt-2 text-[length:var(--pm-font-size-body)] font-bold leading-6 text-[var(--pm-text-tertiary)]">{resultCopy.detail}</p>
            {inviteOutcome === 'out_of_scope' && (
              <ParentPrimaryButton type="button" onClick={() => openBinding()} fullWidth className="mt-6 h-[52px] text-[16px]">
                绑定其他孩子
              </ParentPrimaryButton>
            )}
            <ParentSecondaryButton type="button" onClick={finishInviteToHome} fullWidth tone="neutral" className={`${inviteOutcome === 'out_of_scope' ? 'mt-3' : 'mt-6'} h-[52px] text-[16px]`}>
              返回首页
            </ParentSecondaryButton>
          </ParentCard>
        </div>
      </ParentPageShell>
    );
  };

  const InviteChildSelect = () => {
    const candidates = childrenList.filter(child => inviteCandidateIds.includes(child.id));
    return (
      <ParentPageShell className="pb-12">
        <Header title="选择填写孩子" />
        <section className="mx-5 mt-5 space-y-2">
          {activeInviteRecord && <h1 className="px-1 pb-2 text-[length:var(--pm-font-size-section-title)] font-bold text-[var(--pm-text-primary)]">{activeInviteRecord.title}</h1>}
          {candidates.map(child => (
            <ParentCard key={child.id} as="article" className="overflow-hidden p-0">
              <button type="button" onClick={() => resumeQuestionnaireInvite(childrenList, child.id)} className={`flex min-h-[76px] w-full items-center gap-3 px-4 py-3 text-left ${PARENT_PRESSABLE_CLASS}`}>
                <ParentChildAvatar name={child.name} src={child.avatar} alt={`${child.name}头像`} className="h-12 w-12 rounded-[var(--pm-radius-inner)]" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[16px] font-bold text-[var(--pm-text-primary)]">{child.name}</span>
                  <span className="mt-1 block truncate text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]">{child.className}</span>
                </span>
                <ChevronRight size={18} className="shrink-0 text-[var(--pm-text-disabled)]" />
              </button>
            </ParentCard>
          ))}
        </section>
      </ParentPageShell>
    );
  };

  const GrowthChildProfileCard = () => {
    if (!activeChild) return null;
    return (
      <ParentCard as="section" className="mx-5 mt-4 p-4">
        <div className="flex min-h-[68px] items-center gap-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <ParentChildAvatar
              name={activeChild.name}
              src={activeChild.avatar}
              alt={`${activeChild.name}头像`}
              className="h-[68px] w-[68px] rounded-[var(--pm-radius-card)] border-2 border-white bg-[var(--pm-bg-surface-soft)] [box-shadow:var(--pm-shadow-avatar)]"
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[length:var(--pm-font-size-section-title)] font-bold leading-tight text-[var(--pm-text-primary)]">{activeChild.name}</h2>
              <p className="mt-1 truncate text-[length:var(--pm-font-size-compact)] font-bold leading-snug text-[var(--pm-text-tertiary)]">
                {activeChild.className}
              </p>
              <button
                type="button"
                onClick={() => setShowChildSwitcher(true)}
                className={`mt-1 inline-flex h-7 max-w-full items-center justify-center gap-0.5 rounded-full border border-[var(--pm-border-subtle)] bg-[var(--pm-bg-surface-soft)] px-2 text-[length:var(--pm-font-size-meta)] font-[var(--pm-font-weight-semibold)] leading-none text-[var(--pm-text-secondary)] ${PARENT_PRESSABLE_CLASS}`}
                aria-label="切换孩子"
              >
                <span className="truncate">切换孩子</span>
                <ChevronRight size={12} strokeWidth={2.6} />
              </button>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <MessageBellEntry />
          </div>
        </div>
        {parentBankFeatureEnabled && <div className="mt-3 border-t border-[var(--pm-border-subtle)] pt-1">
          <button
            type="button"
            onClick={() => openExchangePasswordSheet(activeChild)}
            className={`flex min-h-12 w-full items-center gap-3 rounded-[var(--pm-radius-control)] px-1 py-2 text-left ${PARENT_PRESSABLE_CLASS}`}
            aria-label={`${activeChild.name}的兑换密码，查看或修改`}
          >
            <KeyRound size={17} strokeWidth={2.45} className="shrink-0 text-[var(--pm-brand-primary)]" aria-hidden="true" />
            <span className="min-w-0 flex-1 text-[length:var(--pm-font-size-card-title)] font-[var(--pm-font-weight-semibold)] text-[var(--pm-text-primary)]">兑换密码</span>
            <span className="shrink-0 tabular-nums text-[length:var(--pm-font-size-card-title)] font-[var(--pm-font-weight-semibold)] tracking-[0.18em] text-[var(--pm-text-secondary)]">••••••</span>
            <span className="shrink-0 text-[length:var(--pm-font-size-compact)] font-[var(--pm-font-weight-semibold)] text-[var(--pm-brand-primary-strong)]">查看 / 修改</span>
            <ChevronRight size={16} strokeWidth={2.7} className="shrink-0 text-[var(--pm-text-disabled)]" aria-hidden="true" />
          </button>
        </div>}
      </ParentCard>
    );
  };

  const getPendingQuestionnaireMessages = () => {
    if (!activeChild || activeChild.pendingQuestionnaires.length === 0) return null;
    const pendingQuestionnaireRows: Array<PendingQuestionnaire & { label: string; tone: 'blue' | 'softBlue' }> = activeChild.pendingQuestionnaires.map(questionnaire => ({
      ...questionnaire,
      label: questionnaire.title,
      tone: questionnaire.audience === 'student' ? 'softBlue' : 'blue',
    }));
    return pendingQuestionnaireRows;
  };

  const MessageBellEntry = () => {
    const pendingQuestionnaireRows = getPendingQuestionnaireMessages();
    const messageCount = (pendingQuestionnaireRows?.length ?? 0) + pendingAssignedQuestionnaires.length;
    if (!activeChild || messageCount === 0) return null;
    return (
      <button
        type="button"
        onClick={() => setScreen('todo')}
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--pm-radius-control)] border border-[var(--pm-status-attention)]/30 bg-[var(--pm-status-attention-soft)] text-[var(--pm-status-attention)] ${PARENT_PRESSABLE_CLASS}`}
        aria-label={`待办，${messageCount}项待处理`}
        title="待办"
      >
        <Bell size={18} strokeWidth={2.45} />
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[var(--pm-status-attention)] px-1 text-[length:var(--pm-font-size-meta)] font-[var(--pm-font-weight-bold)] leading-none text-white [box-shadow:var(--pm-shadow-control)]">
          {messageCount}
        </span>
      </button>
    );
  };

  const GrowthSummaryCards = () => {
    const positiveCount = 13;
    const improveCount = 1;
    const totalScore = 45;
    const growthReward = 70.5;
    const scoreReward = 20.38;
    const totalReward = growthReward + scoreReward;
    const summaryGridClass = showPositiveSummary && showNegativeSummary ? 'grid-cols-2' : 'grid-cols-1';

    return (
      <section className="mx-5 mt-4 flex flex-col gap-3">
        <ParentCard as="article" className="p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[length:var(--pm-font-size-compact)] font-[var(--pm-font-weight-semibold)] text-[var(--pm-text-tertiary)]">本月总分</span>
            <span className="rounded-full border border-[var(--pm-status-positive)]/20 bg-[var(--pm-status-positive-soft)] px-2.5 py-1 text-[length:var(--pm-font-size-meta)] font-[var(--pm-font-weight-semibold)] text-[var(--pm-status-positive-strong)]">稳步成长</span>
          </div>
          <div className="mt-4 flex items-baseline justify-center">
            <span className="tabular-nums text-[length:var(--pm-font-size-display)] font-[var(--pm-font-weight-bold)] leading-none text-[var(--pm-brand-primary)]">{totalScore}</span>
            <span className="ml-2 text-[length:var(--pm-font-size-section-title)] font-[var(--pm-font-weight-semibold)] text-[var(--pm-text-disabled)]">分</span>
          </div>
          {showAnyEvaluationSummary && (
            <div className={`mt-4 grid ${summaryGridClass} gap-2`}>
              {showPositiveSummary && (
                <div className="flex items-center justify-center gap-2 rounded-[var(--pm-radius-inner)] border border-[var(--pm-status-positive)]/20 bg-[var(--pm-status-positive-soft)] px-2 py-2">
                  <ParentGradientIcon tone="green" size="sm">
                    <CheckCircle2 size={16} />
                  </ParentGradientIcon>
                  <div className="text-left">
                    <div className="text-[length:var(--pm-font-size-meta)] font-[var(--pm-font-weight-semibold)] text-[var(--pm-status-positive)]">表扬</div>
                    <div className="mt-0.5 tabular-nums text-[length:var(--pm-font-size-section-title)] font-[var(--pm-font-weight-bold)] text-[var(--pm-status-positive-strong)]">{positiveCount}<span className="ml-0.5 text-[length:var(--pm-font-size-meta)]">次</span></div>
                  </div>
                </div>
              )}
              {showNegativeSummary && (
                <div className="flex items-center justify-center gap-2 rounded-[var(--pm-radius-inner)] border border-[var(--pm-status-negative)]/20 bg-[var(--pm-status-negative-soft)] px-2 py-2">
                  <ParentGradientIcon tone="negative" size="sm">
                    <Clock size={16} />
                  </ParentGradientIcon>
                  <div className="text-left">
                    <div className="text-[length:var(--pm-font-size-meta)] font-[var(--pm-font-weight-semibold)] text-[var(--evaluation-score-negative)]">待改进</div>
                    <div className="mt-0.5 tabular-nums text-[length:var(--pm-font-size-section-title)] font-[var(--pm-font-weight-bold)] text-[var(--evaluation-score-negative)]">{improveCount}<span className="ml-0.5 text-[length:var(--pm-font-size-meta)]">次</span></div>
                  </div>
                </div>
              )}
            </div>
          )}
          <button
            type="button"
            onClick={() => setScreen('growthRecords')}
            className="mx-auto mt-3 flex min-h-10 items-center justify-center rounded-full px-3 text-[length:var(--pm-font-size-compact)] font-[var(--pm-font-weight-semibold)] text-[var(--pm-brand-primary-strong)] transition-colors [transition-duration:var(--pm-duration-fast)] active:bg-[var(--pm-brand-primary-soft)]"
          >
            <span>{showAnyEvaluationDetails ? '全部记录' : '查看统计'}</span>
            <ChevronRight size={14} strokeWidth={3} aria-hidden="true" />
          </button>
        </ParentCard>

        {parentBankFeatureEnabled && <ParentCard as="article" className="min-h-[154px] p-4">
          <div className="text-[length:var(--pm-font-size-compact)] font-[var(--pm-font-weight-semibold)] text-[var(--pm-brand-reward-strong)]">预计可得</div>
          <div className="mt-5 flex items-center justify-center gap-2">
            <img src="/assets/coin.png" alt="" className="h-9 w-9 shrink-0" />
            <span className="tabular-nums text-[length:var(--pm-font-size-display)] font-[var(--pm-font-weight-bold)] leading-none text-[var(--pm-brand-reward-strong)]">{totalReward.toFixed(2)}</span>
          </div>
          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="rounded-[var(--pm-radius-inner)] border border-[var(--pm-brand-reward)]/20 bg-[var(--pm-bg-surface)]/76 px-2 py-2 text-center">
              <div className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-brand-reward-strong)]/80">成长奖励</div>
              <div className="mt-1 flex items-center justify-center gap-1 text-[16px] font-bold text-[var(--pm-brand-reward-strong)]">
                <img src="/assets/coin.png" alt="" className="h-4 w-4" /><span className="tabular-nums">{growthReward}</span>
              </div>
            </div>
            <div className="text-[length:var(--pm-font-size-section-title)] font-bold text-[var(--pm-brand-reward)]">+</div>
            <div className="rounded-[var(--pm-radius-inner)] border border-[var(--pm-brand-reward)]/20 bg-[var(--pm-bg-surface)]/76 px-2 py-2 text-center">
              <div className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-brand-reward-strong)]/80">得分奖励</div>
              <div className="mt-1 flex items-center justify-center gap-1 text-[16px] font-bold text-[var(--pm-brand-reward-strong)]">
                <img src="/assets/coin.png" alt="" className="h-4 w-4" /><span className="tabular-nums">{scoreReward}</span>
              </div>
            </div>
          </div>
        </ParentCard>}
      </section>
    );
  };

  const GrowthBankEntry = () => {
    if (!activeChild || !parentBankFeatureEnabled) return null;
    return (
      <ParentCard as="section" className="mx-5 mt-3 overflow-hidden p-0">
        <button
          type="button"
          onClick={() => setScreen('bank')}
          className={`flex min-h-[60px] w-full items-center gap-3 px-4 py-3 text-left ${PARENT_PRESSABLE_CLASS}`}
          aria-label={`进入积分银行，可用${formatCoin(activeChild.availableCoins)}，已存${formatCoin(activeChild.bankBalance)}`}
        >
          <h2 className="shrink-0 text-[length:var(--pm-font-size-card-title)] font-bold text-[var(--pm-text-primary)]">{GROWTH_COIN_TERMS.name}</h2>
          <div className="flex min-w-0 flex-1 items-center justify-center gap-2.5 whitespace-nowrap">
            <span className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-text-tertiary)]">
              {GROWTH_COIN_TERMS.available}
              <strong className="ml-1 tabular-nums text-[16px] text-[var(--pm-brand-reward-strong)]">{formatCoin(activeChild.availableCoins)}</strong>
            </span>
            <span className="h-5 w-px shrink-0 bg-[var(--pm-bg-surface-muted)]" aria-hidden="true" />
            <span className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-text-tertiary)]">
              {GROWTH_COIN_TERMS.saved}
              <strong className="ml-1 tabular-nums text-[16px] text-[var(--pm-brand-primary-strong)]">{formatCoin(activeChild.bankBalance)}</strong>
            </span>
          </div>
          <span className="inline-flex min-h-10 shrink-0 items-center gap-0.5 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-brand-primary-strong)]">
            进入银行
            <ChevronRight size={15} strokeWidth={2.8} aria-hidden="true" />
          </span>
        </button>
      </ParentCard>
    );
  };

  const GrowthCalendar = () => {
    const year = selectedGrowthDate.getFullYear();
    const month = selectedGrowthDate.getMonth();
    const today = new Date();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const leadingBlankCount = (new Date(year, month, 1).getDay() + 6) % 7;
    const calendarCells = [
      ...Array.from({ length: leadingBlankCount }, (_, index) => ({ key: `blank-${index}`, day: 0 })),
      ...Array.from({ length: daysInMonth }, (_, index) => ({ key: `day-${index + 1}`, day: index + 1 })),
    ];

    const changeMonth = (offset: number) => {
      setSelectedGrowthDate(new Date(year, month + offset, 1));
    };

    return (
      <ParentCard as="section" className="mx-5 mt-3 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={() => changeMonth(-1)} className={PARENT_ICON_BUTTON_CLASS} aria-label="上个月">
            <ArrowLeft size={18} />
          </button>
          <div className="text-[length:var(--pm-font-size-section-title)] font-semibold tracking-tight text-[var(--pm-text-primary)]">{year}年 {month + 1}月</div>
          <button type="button" onClick={() => changeMonth(1)} className={PARENT_ICON_BUTTON_CLASS} aria-label="下个月">
            <ArrowRight size={18} />
          </button>
          <button type="button" onClick={() => setSelectedGrowthDate(new Date())} className={PARENT_RANGE_SHORTCUT_CLASS}>
            今天
          </button>
        </div>
        <div className="grid grid-cols-7 gap-y-2 text-center text-[length:var(--pm-font-size-card-title)] font-bold">
          {['一', '二', '三', '四', '五', '六', '日'].map(week => (
            <div key={week} className="pb-2 text-[var(--pm-text-tertiary)]">{week}</div>
          ))}
          {calendarCells.map(cell => {
            if (!cell.day) return <div key={cell.key} className="h-[48px]" aria-hidden="true" />;
            const date = new Date(year, month, cell.day);
            const dayRecords = getGrowthDayRecords(date);
            const hasPraise = showPositiveSummary && dayRecords.some(record => record.score > 0);
            const hasImprove = showNegativeSummary && dayRecords.some(record => record.score < 0);
            const selected = date.getFullYear() === selectedGrowthDate.getFullYear()
              && date.getMonth() === selectedGrowthDate.getMonth()
              && date.getDate() === selectedGrowthDate.getDate();
            const isToday = date.getFullYear() === today.getFullYear()
              && date.getMonth() === today.getMonth()
              && date.getDate() === today.getDate();

            return (
              <button
                key={cell.key}
                type="button"
                onClick={() => setSelectedGrowthDate(date)}
                className={`flex h-[48px] flex-col items-center justify-start rounded-[var(--pm-radius-inner)] pt-1 text-[length:var(--pm-font-size-card-title)] font-bold tabular-nums text-[var(--pm-text-primary)] ${PARENT_PRESSABLE_CLASS}`}
                aria-label={`${month + 1}月${cell.day}日`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${selected ? 'bg-[var(--pm-brand-primary)] text-white' : isToday ? 'bg-[var(--pm-status-positive-soft)] text-[var(--pm-brand-primary-strong)]' : ''}`}>
                  {cell.day}
                </span>
                <span className="mt-1 flex h-2 items-center justify-center gap-1">
                  {hasPraise && <span className="h-2 w-2 rounded-full bg-[var(--pm-status-positive)]" aria-hidden="true" />}
                  {hasImprove && <span className="h-2 w-2 rounded-full bg-[var(--evaluation-score-negative)]" aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      </ParentCard>
    );
  };

  const GrowthRangeTabs = () => (
    <div className="mx-5 mt-4 grid grid-cols-4 rounded-[var(--pm-radius-inner)] bg-[var(--pm-bg-surface-muted)] p-1 [box-shadow:var(--pm-shadow-control)]">
      {GROWTH_RANGE_TABS.map(([mode, label]) => (
        <button
          key={mode}
          type="button"
          onClick={() => setGrowthRangeMode(mode)}
          className={`h-10 rounded-[var(--pm-radius-control)] text-[length:var(--pm-font-size-card-title)] font-bold ${PARENT_PRESSABLE_CLASS} ${growthRangeMode === mode ? 'bg-[var(--pm-bg-surface)] text-[var(--pm-brand-primary)] [box-shadow:var(--pm-shadow-control)]' : 'text-[var(--pm-text-tertiary)] active:bg-[var(--pm-bg-surface-soft)]'}`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const GrowthWeekStrip = () => {
    const year = selectedGrowthDate.getFullYear();
    const month = selectedGrowthDate.getMonth();
    const weekRanges = getGrowthMonthWeekRanges(year, month);
    const changeMonth = (offset: number) => {
      setSelectedGrowthDate(new Date(year, month + offset, 1));
    };

    return (
      <ParentCard as="section" className="mx-5 mt-3 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={() => changeMonth(-1)} className={PARENT_ICON_BUTTON_CLASS} aria-label="上个月">
            <ArrowLeft size={18} />
          </button>
          <div className="text-[length:var(--pm-font-size-section-title)] font-semibold tracking-tight text-[var(--pm-text-primary)]">{year}年 {month + 1}月</div>
          <button type="button" onClick={() => changeMonth(1)} className={PARENT_ICON_BUTTON_CLASS} aria-label="下个月">
            <ArrowRight size={18} />
          </button>
          <button type="button" onClick={() => setSelectedGrowthDate(new Date())} className={PARENT_RANGE_SHORTCUT_CLASS}>
            本周
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {weekRanges.map(({ start, end }) => {
            const monthStart = new Date(year, month, 1);
            const selectedWeekStart = getWeekStartDate(selectedGrowthDate);
            const selected = start.getTime() === selectedWeekStart.getTime();
            const weekRecords = activeChild?.records.filter(record => record.createdAt >= start.getTime() && record.createdAt <= end.getTime() + 86400000 - 1) ?? [];
            const hasPraise = showPositiveSummary && weekRecords.some(record => record.score > 0);
            const hasImprove = showNegativeSummary && weekRecords.some(record => record.score < 0);
            const representativeDate = start < monthStart ? monthStart : start;

            return (
              <button
                key={start.getTime()}
                type="button"
                onClick={() => setSelectedGrowthDate(representativeDate)}
                className={`flex h-[58px] flex-col items-center justify-center rounded-[var(--pm-radius-inner)] px-3 text-[length:var(--pm-font-size-card-title)] font-bold tabular-nums ${PARENT_PRESSABLE_CLASS} ${selected ? 'bg-[var(--pm-brand-primary-soft)] text-[var(--pm-brand-primary)] [box-shadow:var(--pm-shadow-control)]' : 'bg-[var(--pm-bg-surface-soft)] text-[var(--pm-text-secondary)]'}`}
                aria-label={formatWeekRange(start, end)}
              >
                <span>{formatWeekRange(start, end)}</span>
                <span className="mt-1 flex h-2 items-center justify-center gap-1">
                  {hasPraise && <span className={`h-2 w-2 rounded-full ${selected ? 'bg-white' : 'bg-[var(--pm-status-positive)]'}`} aria-hidden="true" />}
                  {hasImprove && <span className="h-2 w-2 rounded-full bg-[var(--evaluation-score-negative)]" aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      </ParentCard>
    );
  };

  const GrowthMonthSummary = () => {
    const year = selectedGrowthDate.getFullYear();
    const monthCells = Array.from({ length: 12 }, (_, index) => index);
    const changeYear = (offset: number) => {
      setSelectedGrowthDate(new Date(year + offset, selectedGrowthDate.getMonth(), 1));
    };

    return (
      <ParentCard as="section" className="mx-5 mt-3 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={() => changeYear(-1)} className={PARENT_ICON_BUTTON_CLASS} aria-label="上一年">
            <ArrowLeft size={18} />
          </button>
          <div className="text-[length:var(--pm-font-size-section-title)] font-semibold tracking-tight text-[var(--pm-text-primary)]">{year}年</div>
          <button type="button" onClick={() => changeYear(1)} className={PARENT_ICON_BUTTON_CLASS} aria-label="下一年">
            <ArrowRight size={18} />
          </button>
          <button type="button" onClick={() => setSelectedGrowthDate(new Date())} className={PARENT_RANGE_SHORTCUT_CLASS}>
            本月
          </button>
        </div>
        <div className="grid grid-cols-3 gap-2">
          {monthCells.map(monthIndex => {
            const selected = year === selectedGrowthDate.getFullYear() && monthIndex === selectedGrowthDate.getMonth();
            const monthStart = new Date(year, monthIndex, 1).getTime();
            const monthEnd = new Date(year, monthIndex + 1, 1).getTime() - 1;
            const monthRecords = activeChild?.records.filter(record => record.createdAt >= monthStart && record.createdAt <= monthEnd) ?? [];
            const hasPraise = showPositiveSummary && monthRecords.some(record => record.score > 0);
            const hasImprove = showNegativeSummary && monthRecords.some(record => record.score < 0);

            return (
              <button
                key={monthIndex}
                type="button"
                onClick={() => setSelectedGrowthDate(new Date(year, monthIndex, 1))}
                className={`flex h-[58px] flex-col items-center justify-center rounded-[var(--pm-radius-inner)] px-3 text-[length:var(--pm-font-size-card-title)] font-bold tabular-nums ${PARENT_PRESSABLE_CLASS} ${selected ? 'bg-[var(--pm-brand-primary-soft)] text-[var(--pm-brand-primary)] [box-shadow:var(--pm-shadow-control)]' : 'bg-[var(--pm-bg-surface-soft)] text-[var(--pm-text-secondary)]'}`}
                aria-label={`${monthIndex + 1}月`}
              >
                <span>{monthIndex + 1}月</span>
                <span className="mt-1 flex h-2 items-center justify-center gap-1">
                  {hasPraise && <span className={`h-2 w-2 rounded-full ${selected ? 'bg-white' : 'bg-[var(--pm-status-positive)]'}`} aria-hidden="true" />}
                  {hasImprove && <span className="h-2 w-2 rounded-full bg-[var(--evaluation-score-negative)]" aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      </ParentCard>
    );
  };

  const GrowthTermSummary = () => {
    const termInfo = getGrowthTermInfo(selectedGrowthDate);
    const termRanges = getGrowthTermRanges(termInfo.schoolYearStart);
    const changeSchoolYear = (offset: number) => {
      const nextSchoolYearStart = termInfo.schoolYearStart + offset;
      const activeRange = getGrowthTermRanges(nextSchoolYearStart).find(range => range.key === termInfo.term) ?? getGrowthTermRanges(nextSchoolYearStart)[0];
      setSelectedGrowthDate(new Date(activeRange.start));
    };

    return (
      <ParentCard as="section" className="mx-5 mt-3 p-4">
        <div className="mb-3 flex items-center justify-between">
          <button type="button" onClick={() => changeSchoolYear(-1)} className={PARENT_ICON_BUTTON_CLASS} aria-label="上一学年">
            <ArrowLeft size={18} />
          </button>
          <div className="text-[length:var(--pm-font-size-section-title)] font-semibold tracking-tight text-[var(--pm-text-primary)]">{termInfo.label}</div>
          <button type="button" onClick={() => changeSchoolYear(1)} className={PARENT_ICON_BUTTON_CLASS} aria-label="下一学年">
            <ArrowRight size={18} />
          </button>
          <button type="button" onClick={() => setSelectedGrowthDate(new Date())} className={PARENT_RANGE_SHORTCUT_CLASS}>
            本学期
          </button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {termRanges.map(range => {
            const selected = range.key === termInfo.term;
            const termRecords = activeChild?.records.filter(record => record.createdAt >= range.start && record.createdAt <= range.end) ?? [];
            const hasPraise = showPositiveSummary && termRecords.some(record => record.score > 0);
            const hasImprove = showNegativeSummary && termRecords.some(record => record.score < 0);

            return (
              <button
                key={range.key}
                type="button"
                onClick={() => setSelectedGrowthDate(new Date(range.start))}
                className={`flex h-[72px] flex-col items-center justify-center rounded-[var(--pm-radius-inner)] px-3 text-[length:var(--pm-font-size-card-title)] font-bold ${PARENT_PRESSABLE_CLASS} ${selected ? 'bg-[var(--pm-brand-primary-soft)] text-[var(--pm-brand-primary)] [box-shadow:var(--pm-shadow-control)]' : 'bg-[var(--pm-bg-surface-soft)] text-[var(--pm-text-secondary)]'}`}
                aria-label={range.label}
              >
                <span>{range.label}</span>
                <span className="mt-1 flex h-2 items-center justify-center gap-1">
                  {hasPraise && <span className={`h-2 w-2 rounded-full ${selected ? 'bg-white' : 'bg-[var(--pm-status-positive)]'}`} aria-hidden="true" />}
                  {hasImprove && <span className="h-2 w-2 rounded-full bg-[var(--evaluation-score-negative)]" aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      </ParentCard>
    );
  };

  const GrowthRecords = () => {
    if (!activeChild) return <Binding />;
    const visibleDetailRecords = selectedGrowthRangeRecords.filter(isRecordDetailVisible);
    const selectedTotalScore = selectedGrowthRangeRecords.reduce((sum, record) => sum + record.score, 0);
    const statisticColumnCount = 1 + Number(showPositiveSummary) + Number(showNegativeSummary);
    const statisticGridClass = statisticColumnCount === 3
      ? 'grid-cols-3'
      : statisticColumnCount === 2
        ? 'grid-cols-2'
        : 'grid-cols-1';
    const statisticTitle = growthRangeMode === 'day' ? '当天统计' : growthRangeMode === 'week' ? '本周统计' : growthRangeMode === 'month' ? '本月统计' : '本学期统计';
    return (
      <ParentPageShell className="pb-8">
        <Header title="成长数据" showBack backLabel="返回成长页" onBack={() => setScreen('growth')} />
        <GrowthRangeTabs />
        {growthRangeMode === 'day' && <GrowthCalendar />}
        {growthRangeMode === 'week' && <GrowthWeekStrip />}
        {growthRangeMode === 'month' && <GrowthMonthSummary />}
        {growthRangeMode === 'term' && <GrowthTermSummary />}
        <ParentCard as="section" className="mx-5 mt-3 p-4">
          <div className="mb-3">
            <h2 className="text-[length:var(--pm-font-size-section-title)] font-bold text-[var(--pm-text-primary)]">{statisticTitle}</h2>
          </div>
          <div className={`grid ${statisticGridClass} gap-2`}>
            <div className="rounded-[var(--pm-radius-inner)] bg-[var(--pm-brand-primary-soft)] px-3 py-3 text-center">
              <div className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-brand-primary-strong)]">总分</div>
              <div className="mt-1 tabular-nums text-[length:var(--pm-font-size-metric)] font-bold text-[var(--pm-brand-primary)]">{selectedTotalScore}</div>
            </div>
            {showPositiveSummary && (
              <div className="rounded-[var(--pm-radius-inner)] bg-[var(--pm-status-positive-soft)] px-3 py-3 text-center">
                <div className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-status-positive)]">表扬</div>
                <div className="mt-1 tabular-nums text-[length:var(--pm-font-size-metric)] font-bold text-[var(--pm-status-positive-strong)]">{selectedPraiseCount}<span className="ml-0.5 text-[length:var(--pm-font-size-meta)]">次</span></div>
              </div>
            )}
            {showNegativeSummary && (
              <div className="rounded-[var(--pm-radius-inner)] bg-[var(--pm-status-negative-soft)] px-3 py-3 text-center">
                <div className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--evaluation-score-negative)]">待改进</div>
                <div className="mt-1 tabular-nums text-[length:var(--pm-font-size-metric)] font-bold text-[var(--evaluation-score-negative)]">{selectedImproveCount}<span className="ml-0.5 text-[length:var(--pm-font-size-meta)]">次</span></div>
              </div>
            )}
          </div>
        </ParentCard>
        {showAnyEvaluationDetails && (
          <section className="mx-5 mt-4" aria-labelledby="parent-evaluation-details-title">
            <h2 id="parent-evaluation-details-title" className="px-1 text-[length:var(--pm-font-size-card-title)] font-bold text-[var(--pm-text-primary)]">评价明细</h2>
            {visibleDetailRecords.length > 0 ? (
              <div className="mt-2 space-y-2">
                {visibleDetailRecords.map(record => {
                  const positive = record.score > 0;
                  return (
                    <ParentCard key={record.id} as="article" className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-[length:var(--pm-font-size-card-title)] font-bold leading-relaxed text-[var(--pm-text-primary)]">{record.content}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-text-tertiary)]">
                            <span>{record.time}</span>
                            <span aria-hidden="true">·</span>
                            <span>{formatEvaluationTeacherName(record.teacher)}</span>
                          </div>
                        </div>
                        <span className={`shrink-0 tabular-nums text-[length:var(--pm-font-size-section-title)] font-bold ${positive ? 'text-[var(--pm-status-positive-strong)]' : 'text-[var(--evaluation-score-negative)]'}`}>
                          {record.score > 0 ? `+${record.score}` : record.score}
                        </span>
                      </div>
                    </ParentCard>
                  );
                })}
              </div>
            ) : (
              <ParentCard className="mt-2 px-4 py-8 text-center text-[length:var(--pm-font-size-body)] font-bold text-[var(--pm-text-tertiary)]">
                该时段暂无评价记录
              </ParentCard>
            )}
          </section>
        )}
      </ParentPageShell>
    );
  };

  const Binding = () => (
    <ParentPageShell className="pb-12">
      <Header title="绑定孩子" showBack={bindingReturnTarget === 'switcher'} backLabel="返回切换孩子" onBack={returnToChildSwitcher} />
      <div className="px-6 pt-7">
        <ParentCard className="p-5" as="section">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]"><ShieldCheck size={15} /> 学校编号</span>
              <input
                value={bindForm.schoolCode}
                onChange={event => updateBindForm('schoolCode', event.target.value)}
                placeholder="例如：BS2024"
                className={BINDING_INPUT_CLASS}
              />
            </label>
            {shouldShowStudentBindFields && ([
              { label: '学生姓名', field: 'studentName' as const, icon: UserRound, placeholder: '例如：郑小磊' },
              { label: '学生学号', field: 'studentNo' as const, icon: Star, placeholder: '例如：20250101' },
            ].map(item => {
              const Icon = item.icon;
              return (
                <label key={item.field} className="block">
                  <span className="mb-2 flex items-center gap-2 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]"><Icon size={15} /> {item.label}</span>
                  <input value={bindForm[item.field]} onChange={event => updateBindForm(item.field, event.target.value)} placeholder={item.placeholder} className={BINDING_INPUT_CLASS} />
                </label>
              );
            }))}
          </div>
          <ParentPrimaryButton type="button" onClick={submitBinding} disabled={!canSubmitBinding} fullWidth className="mt-6 h-14 text-[16px]">
            完成绑定
          </ParentPrimaryButton>
        </ParentCard>
      </div>
    </ParentPageShell>
  );

  const Growth = () => {
    if (!activeChild) return <Binding />;
    return (
      <ParentPageShell className="pb-28">
        <GrowthChildProfileCard />
        <GrowthBankEntry />
        <GrowthSummaryCards />
      </ParentPageShell>
    );
  };

  const Reports = () => {
    if (!activeChild) return <Binding />;
    return (
      <ParentPageShell className="pb-28">
        <section className="px-5 pt-4 space-y-3">
          {activeChild.reports.map(report => (
            <ParentCard key={report.id} as="article" className="overflow-hidden p-0">
              <button type="button" onClick={() => { setActiveReportId(report.id); setScreen('reportDetail'); }} className={`w-full p-4 text-left ${PARENT_PRESSABLE_CLASS}`}>
                <div className="flex items-start gap-3">
                  <ParentGradientIcon tone={report.type === 'month' ? 'blue' : 'green'} size="lg">
                    {report.type === 'month' ? <CalendarDays size={23} /> : <BookOpenCheck size={23} />}
                  </ParentGradientIcon>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-[16px] font-bold text-balance text-[var(--pm-text-primary)]">{report.title}</h2>
                      <ArrowRight size={16} className="shrink-0 text-[var(--pm-text-disabled)]" />
                    </div>
                    <p className="mt-1 text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-status-positive-strong)]">{report.period}</p>
                  </div>
                </div>
              </button>
            </ParentCard>
          ))}
        </section>
      </ParentPageShell>
    );
  };

  const ArchiveList = () => {
    if (!activeChild) return <Binding />;
    return (
      <ParentPageShell className="pb-28">
        <Header title="学生档案" showBack />
        <section className="mx-5 mt-4 space-y-3">
          {activeChild.archives.map(archive => (
            <ParentCard key={archive.id} as="article" className="overflow-hidden p-0">
              <button type="button" onClick={() => { setActiveArchiveId(archive.id); setScreen('archiveDetail'); }} className={`flex w-full min-h-[112px] items-center gap-3 p-4 text-left ${PARENT_PRESSABLE_CLASS}`}>
                <ParentGradientIcon tone="green" size="lg" className="rounded-[var(--pm-radius-inner)]">
                  <Files size={23} />
                </ParentGradientIcon>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[length:var(--pm-font-size-section-title)] font-bold leading-tight text-[var(--pm-text-primary)]">{archive.title}</h2>
                  <p className="mt-1 text-[length:var(--pm-font-size-compact)] font-bold leading-tight text-[var(--pm-status-positive-strong)]">{archive.stage}</p>
                  <div className="mt-3 inline-flex rounded-full bg-[var(--pm-bg-surface-soft)] px-3 py-1.5 text-[length:var(--pm-font-size-meta)] font-bold leading-tight text-[var(--pm-text-tertiary)]">
                    建档日期：{archive.createdAt}
                  </div>
                </div>
                <ArrowRight size={17} className="shrink-0 text-[var(--pm-text-disabled)]" />
              </button>
            </ParentCard>
          ))}
        </section>
      </ParentPageShell>
    );
  };

  const QuestionnaireForm = () => {
    if (!activeChild || !activePendingQuestionnaire || !activeQuestionnaireSourceRecord || !activeQuestionnaireStep) return <Growth />;
    const currentQuestion = activeQuestionnaireStep.question;
    const questionOptions = splitArchiveOptions(currentQuestion.options);
    const selectedAnswers = getQuestionDraftAnswers(currentQuestion);
    const currentStepNumber = questionnaireStepIndex + 1;
    const questionTotal = activeQuestionnaireQuestions.length;
    const progressPercent = Math.round((currentStepNumber / Math.max(1, questionTotal)) * 100);
    const hasIntroPage = Boolean(activePendingQuestionnaire.description?.trim());
    const questionnaireDisplayTitle = activePendingQuestionnaire.title || activeQuestionnaireSourceRecord.title;
    const selectedTextOptionsComplete = selectedAnswers.every(option => (
      !optionNeedsTextInput(option) || Boolean(questionnaireTextAnswers[`${currentQuestion.id}::${option}`]?.trim())
    ));
    const questionPrompt = currentQuestion.prompt
      .replace(/^\d+[.．、]/, '')
      .replace(/\s+\/\s+/g, '：');
    const questionTypeLabel = getQuestionTypeLabel(currentQuestion);
    const isQuestionRequired = questionOptions.length > 0;
    const canGoNext = questionOptions.length === 0 || (selectedAnswers.length > 0 && selectedTextOptionsComplete);
    const isLastQuestion = currentStepNumber === questionTotal;
    return (
      <ParentPageShell className="pb-36">
        <div className="sticky top-0 z-40 border-b border-white/60 bg-white/76 px-4 py-3 backdrop-blur-xl">
          <div className="flex min-h-10 items-center gap-3">
            <button type="button" onClick={() => setScreen('todo')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-[var(--pm-text-secondary)] shadow-sm transition-transform duration-150 ease-out active:scale-[0.96]" aria-label="返回待办">
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-3">
                <span className="min-w-0 flex-1 truncate text-[length:var(--pm-font-size-card-title)] font-bold text-[var(--pm-text-primary)]">{questionnaireDisplayTitle}</span>
                {!showLegacyQuestionnaireIntro && <span className="shrink-0 tabular-nums text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-status-positive-strong)]">{currentStepNumber}/{questionTotal}</span>}
              </div>
              {!showLegacyQuestionnaireIntro && (
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-[var(--pm-bg-surface-muted)]" role="progressbar" aria-valuenow={progressPercent} aria-valuemin={0} aria-valuemax={100}>
                  <div className="h-full rounded-full bg-gradient-to-r from-[var(--pm-brand-primary)] to-[var(--pm-brand-secondary)] transition-[width] duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
                </div>
              )}
            </div>
          </div>
        </div>

        {showLegacyQuestionnaireIntro ? (
          <section className="mx-5 mt-6 px-1">
              <h1 className="break-words text-[length:var(--pm-font-size-page-title)] font-bold leading-tight text-[var(--pm-text-primary)]">{questionnaireDisplayTitle}</h1>
            <p className="mt-3 whitespace-pre-wrap break-words text-[length:var(--pm-font-size-card-title)] font-bold leading-6 text-[var(--pm-text-secondary)]">{activePendingQuestionnaire.description}</p>
          </section>
        ) : <section className="mx-5 mt-4">
          <ParentCard as="section" className="p-5">
            <div className="mb-3 inline-flex rounded-full bg-[var(--pm-brand-primary-soft)] px-3 py-1.5 text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-brand-primary-strong)]">
              {questionTypeLabel}
            </div>
            <h2 className="break-words text-[length:var(--pm-font-size-section-title)] font-bold leading-[1.4] text-[var(--pm-text-primary)]">
              {questionPrompt}{isQuestionRequired && <span className="ml-1 text-[var(--pm-status-negative)]" aria-label="必填">*</span>}
            </h2>

            <div className="mt-5 space-y-2.5">
              {questionOptions.map(option => {
                const selected = selectedAnswers.includes(option);
                const textAnswerKey = `${currentQuestion.id}::${option}`;
                const textAnswerValue = questionnaireTextAnswers[textAnswerKey] ?? '';
                const needsText = selected && optionNeedsTextInput(option);
                const showTextError = needsText && !textAnswerValue.trim();
                return (
                  <div key={option} className={`rounded-[var(--pm-radius-inner)] border ${selected ? 'border-[var(--pm-brand-secondary)] bg-[var(--pm-status-positive-soft)]' : 'border-[var(--pm-border-subtle)] bg-white'}`}>
                    <button
                      type="button"
                      onClick={() => updateQuestionnaireAnswer(currentQuestion, option)}
                      className={`flex min-h-[54px] w-full items-start gap-3 px-4 py-3 text-left ${PARENT_PRESSABLE_CLASS}`}
                      aria-pressed={selected}
                    >
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[var(--pm-brand-secondary)] bg-white' : 'border-[var(--pm-border-control)] bg-white'}`}>
                        {selected && <span className="h-2.5 w-2.5 rounded-full bg-[var(--pm-brand-secondary)]" aria-hidden="true" />}
                      </span>
                      <span className={`text-[length:var(--pm-font-size-card-title)] font-bold leading-snug ${selected ? 'text-[var(--pm-text-primary)]' : 'text-[var(--pm-text-secondary)]'}`}>{option.replace(/[_＿]+/g, '').trim()}</span>
                    </button>
                    {needsText && (
                      <div className="px-4 pb-4">
                        <textarea
                          value={textAnswerValue}
                          onChange={event => setQuestionnaireTextAnswers(prev => ({ ...prev, [textAnswerKey]: event.target.value }))}
                          placeholder="请填写具体内容"
                          aria-invalid={showTextError}
                          rows={3}
                          className={`min-h-[96px] w-full resize-none rounded-[var(--pm-radius-control)] border bg-white px-3.5 py-3 text-[length:var(--pm-font-size-card-title)] font-bold leading-relaxed text-[var(--pm-text-primary)] outline-none transition-colors placeholder:text-[var(--pm-text-tertiary)] focus:border-[var(--pm-brand-primary)] focus:ring-4 focus:ring-[var(--pm-focus-ring)] ${showTextError ? 'border-[var(--pm-status-attention)]/40' : 'border-[var(--pm-status-positive)]/20'}`}
                        />
                        {showTextError && (
                          <div className="mt-1.5 text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-brand-reward-strong)]">请补充内容</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {questionOptions.length === 0 && (
                <div className="rounded-[var(--pm-radius-inner)] bg-[var(--pm-bg-surface-soft)] px-4 py-4 text-[length:var(--pm-font-size-card-title)] font-bold leading-snug text-[var(--pm-text-secondary)]">
                  {currentQuestion.answer}
                </div>
              )}
            </div>
          </ParentCard>
        </section>}

        <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-white/70 bg-white/86 px-5 py-4 backdrop-blur-xl">
          {showLegacyQuestionnaireIntro ? (
            <ParentPrimaryButton type="button" onClick={() => setShowLegacyQuestionnaireIntro(false)} fullWidth className="h-[52px] text-[16px]">
              开始填写
            </ParentPrimaryButton>
          ) : <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
            <ParentSecondaryButton
              type="button"
              onClick={() => questionnaireStepIndex === 0 && hasIntroPage
                ? setShowLegacyQuestionnaireIntro(true)
                : setQuestionnaireStepIndex(index => Math.max(0, index - 1))}
              disabled={questionnaireStepIndex === 0 && !hasIntroPage}
              className="h-[52px] text-[16px]"
            >
              上一题
            </ParentSecondaryButton>
            <ParentPrimaryButton
              type="button"
              onClick={() => {
                if (isLastQuestion) {
                  setShowQuestionnaireSubmitConfirm(true);
                  return;
                }
                setQuestionnaireStepIndex(index => Math.min(questionTotal - 1, index + 1));
              }}
              disabled={!canGoNext}
              className="h-[52px] text-[16px]"
            >
              {isLastQuestion ? '提交' : '下一题'}
            </ParentPrimaryButton>
          </div>}
        </div>

        {showQuestionnaireSubmitConfirm && (
          <ParentBottomSheet title="确认提交" onClose={() => setShowQuestionnaireSubmitConfirm(false)} className="pb-8">
            <div className="rounded-[var(--pm-radius-card)] bg-[var(--pm-bg-surface-soft)] p-4">
              <div className="text-[16px] font-bold leading-tight text-[var(--pm-text-primary)]">{activePendingQuestionnaire.title}</div>
              <div className="mt-2 text-[length:var(--pm-font-size-compact)] font-bold leading-relaxed text-[var(--pm-text-tertiary)]">提交后将完成本次问卷。</div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <ParentSecondaryButton type="button" onClick={() => setShowQuestionnaireSubmitConfirm(false)} className="h-[52px] text-[16px]">
                我再看看
              </ParentSecondaryButton>
              <ParentPrimaryButton type="button" onClick={submitQuestionnaire} className="h-[52px] text-[16px]">
                确认提交
              </ParentPrimaryButton>
            </div>
          </ParentBottomSheet>
        )}
      </ParentPageShell>
    );
  };

  const ArchiveDetail = () => {
    if (!activeChild || !activeArchive) return <ArchiveList />;
    return (
      <ParentPageShell className="pb-28">
        <Header title="档案明细" showBack backLabel="返回学生档案" onBack={() => setScreen('archiveList')} />
        <ParentCard className="mx-5 mt-4 p-5" as="section">
          <div className="flex items-start gap-3">
            <ParentGradientIcon tone="green" size="lg" className="rounded-[var(--pm-radius-inner)]">
              <Files size={24} />
            </ParentGradientIcon>
            <div className="min-w-0 flex-1">
              <h2 className="text-[length:var(--pm-font-size-page-title)] font-bold leading-tight text-balance text-[var(--pm-text-primary)]">{activeArchive.title}</h2>
              <p className="mt-2 text-[length:var(--pm-font-size-compact)] font-bold leading-tight text-[var(--pm-status-positive-strong)]">{activeArchive.stage} · {activeArchive.createdAt}</p>
            </div>
          </div>
        </ParentCard>

        <ParentCard as="section" className="mx-5 mt-3 p-4">
          <h2 className="text-[16px] font-bold text-[var(--pm-text-primary)]">档案摘要</h2>
          <div className="mt-3 space-y-2">
            {activeArchive.summary.map(item => (
              <div key={item.label} className="rounded-[var(--pm-radius-inner)] border border-[var(--pm-status-positive)]/20 bg-[var(--pm-status-positive-soft)]/45 px-3 py-3">
                <div className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-status-positive-strong)]">{item.label}</div>
                <div className="mt-1 text-[length:var(--pm-font-size-body)] font-bold leading-relaxed text-[var(--pm-text-secondary)]">{item.value}</div>
              </div>
            ))}
          </div>
        </ParentCard>

        <section className="mx-5 mt-3 space-y-2">
          <ParentCard as="section" className="p-4">
            <h2 className="text-[16px] font-bold text-[var(--pm-text-primary)]">健康信息</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {activeArchive.healthInfo.map(item => (
                <div key={item.label} className="rounded-[var(--pm-radius-inner)] bg-[var(--pm-status-positive-soft)] px-3 py-3">
                  <div className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-status-positive-strong)]">{item.label}</div>
                  <div className="mt-1 text-[length:var(--pm-font-size-card-title)] font-bold text-[var(--pm-text-primary)]">{item.value}</div>
                </div>
              ))}
            </div>
          </ParentCard>

          <ParentCard as="section" className="p-4">
            <h2 className="text-[16px] font-bold text-[var(--pm-text-primary)]">基础信息</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {activeArchive.basicInfo.map(item => (
                <div key={item.label} className="flex min-h-11 items-center justify-between gap-4 py-2">
                  <span className="shrink-0 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]">{item.label}</span>
                  <span className="min-w-0 truncate text-right text-[length:var(--pm-font-size-body)] font-bold text-[var(--pm-text-primary)]">{item.value}</span>
                </div>
              ))}
            </div>
          </ParentCard>
        </section>

        <section className="mx-5 mt-3 space-y-2">
          <h2 className="px-1 text-[length:var(--pm-font-size-card-title)] font-bold text-[var(--pm-text-primary)]">档案内容</h2>
          {activeArchive.contentGroups.map(group => (
            <ParentCard key={group.title} as="section" className="p-4">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-[var(--pm-status-positive)]" aria-hidden="true" />
                <h3 className="text-[length:var(--pm-font-size-section-title)] font-bold leading-tight text-[var(--pm-text-primary)]">{group.title}</h3>
              </div>
              <div className="mt-4 space-y-4">
                {group.sections.map(section => (
                  <div key={section.title} className="rounded-[var(--pm-radius-inner)] border border-[var(--pm-border-subtle)] bg-[var(--pm-bg-surface-soft)] p-3">
                    <h4 className="text-[length:var(--pm-font-size-body)] font-bold leading-tight text-[var(--pm-brand-primary-strong)]">{section.title}</h4>
                    <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-[var(--pm-radius-control)] border border-[var(--pm-border-subtle)] bg-white">
                      {section.items.map(item => {
                        const [label, ...valueParts] = item.split('：');
                        const value = valueParts.join('：') || item;
                        return (
                          <div key={item} className="flex min-h-11 items-center justify-between gap-3 px-3 py-2.5">
                            <span className="shrink-0 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]">{valueParts.length > 0 ? label : '内容'}</span>
                            <span className="min-w-0 text-right text-[length:var(--pm-font-size-body)] font-bold leading-snug text-[var(--pm-text-primary)]">{value}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </ParentCard>
          ))}
        </section>

        <section className="mx-5 mt-3 space-y-2">
          <h2 className="px-1 text-[length:var(--pm-font-size-card-title)] font-bold text-[var(--pm-text-primary)]">建档来源</h2>
          <div className="overflow-hidden rounded-[var(--pm-radius-inner)] border border-[var(--pm-border-subtle)] bg-white/70">
            {activeArchive.sourceRecords.map(record => (
              <button key={record.id} type="button" onClick={() => { setActiveSourceId(record.id); setScreen('questionnaireDetail'); }} className={`flex w-full items-center justify-between gap-3 border-b border-[var(--pm-border-subtle)] px-4 py-3 text-left last:border-b-0 ${PARENT_PRESSABLE_CLASS}`}>
                <div className="min-w-0">
                  <h3 className="truncate text-[length:var(--pm-font-size-body)] font-bold leading-tight text-[var(--pm-text-primary)]">{record.title}</h3>
                  <p className="mt-1 truncate text-[length:var(--pm-font-size-meta)] font-bold leading-tight text-[var(--pm-text-tertiary)]">{record.source} · {record.time}</p>
                </div>
                <ArrowRight size={15} className="shrink-0 text-[var(--pm-text-disabled)]" />
              </button>
            ))}
          </div>
        </section>
      </ParentPageShell>
    );
  };

  const QuestionnaireDetail = () => {
    if (!activeChild || !activeSourceRecord) return <ArchiveDetail />;
    return (
      <ParentPageShell className="pb-28">
        <Header title="来源记录" showBack backLabel="返回档案明细" onBack={() => setScreen('archiveDetail')} />
        <ParentCard className="mx-5 mt-4 p-5" as="section">
          <ParentGradientIcon tone={activeSourceRecord.source === '家长问卷' ? 'blue' : 'green'} size="lg" className="mb-4">
            <ClipboardList size={24} />
          </ParentGradientIcon>
          <h2 className="text-[length:var(--pm-font-size-page-title)] font-bold leading-tight text-balance text-[var(--pm-text-primary)]">{activeSourceRecord.title}</h2>
          <p className="mt-2 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-status-positive-strong)]">{activeSourceRecord.source} · {activeSourceRecord.time}</p>
          <div className="mt-5 divide-y divide-slate-100 rounded-[var(--pm-radius-inner)] border border-[var(--pm-border-subtle)] bg-[var(--pm-bg-surface-soft)] px-3">
            {activeSourceRecord.formIntro.map(item => {
              const isLongIntroLabel = item.label.length > 14;
              return (
                <div key={item.label} className={`${isLongIntroLabel ? 'py-3' : 'flex min-h-10 items-center justify-between gap-3 py-2'}`}>
                  <span className={`${isLongIntroLabel ? 'block text-[length:var(--pm-font-size-meta)] leading-snug' : 'shrink-0 text-[length:var(--pm-font-size-meta)]'} font-bold text-[var(--pm-text-tertiary)]`}>{item.label}</span>
                  <span className={`${isLongIntroLabel ? 'mt-2 block text-left leading-snug' : 'min-w-0 text-right'} text-[length:var(--pm-font-size-body)] font-bold text-[var(--pm-text-primary)]`}>{item.value}</span>
                </div>
              );
            })}
          </div>
        </ParentCard>

        <section className="mx-5 mt-3 space-y-2">
          {activeSourceRecord.formSections.map(section => (
            <ParentCard key={section.title} as="section" className="p-4">
              <h3 className="text-[16px] font-bold text-[var(--pm-text-primary)]">{section.title}</h3>
              <div className="mt-3 space-y-3">
                {section.questions.map(question => {
                  const questionTypeLabel = getQuestionTypeLabel(question);
                  return (
                    <div key={question.id} className="rounded-[var(--pm-radius-inner)] border border-[var(--pm-border-subtle)] bg-[var(--pm-bg-surface-soft)] p-3">
                      <div className="mb-2 inline-flex rounded-full bg-[var(--pm-brand-primary-soft)] px-2.5 py-1 text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-brand-primary-strong)]">
                        {questionTypeLabel}
                      </div>
                      {question.prompt && (
                        <div className="text-[length:var(--pm-font-size-body)] font-bold leading-snug text-[var(--pm-text-primary)]">{question.prompt}</div>
                      )}
                    <div className="mt-3 space-y-2">
                      {splitArchiveOptions(question.options).length > 0 ? splitArchiveOptions(question.options).map(option => {
                        const selected = isArchiveOptionSelected(option, splitArchiveAnswers(question.answer));
                        return (
                          <div key={option} className={`flex items-start gap-2 rounded-[var(--pm-radius-control)] border px-3 py-2 ${selected ? 'border-[var(--pm-brand-secondary)] bg-white text-[var(--pm-text-primary)]' : 'border-[var(--pm-border-subtle)] bg-white/54 text-[var(--pm-text-tertiary)]'}`}>
                            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[var(--pm-brand-secondary)] bg-white' : 'border-[var(--pm-border-control)] bg-white'}`}>
                              {selected && <span className="h-2 w-2 rounded-full bg-[var(--pm-brand-secondary)]" aria-hidden="true" />}
                            </span>
                            <span className={`text-[length:var(--pm-font-size-compact)] font-bold leading-snug ${selected ? 'text-[var(--pm-text-primary)]' : 'text-[var(--pm-text-tertiary)]'}`}>{option}</span>
                          </div>
                        );
                      }) : (
                        <div className="rounded-[var(--pm-radius-control)] bg-[var(--pm-bg-surface)] px-3 py-2 text-[length:var(--pm-font-size-body)] font-bold leading-snug text-[var(--pm-text-primary)] [box-shadow:var(--pm-shadow-control)]">
                          {question.answer}
                        </div>
                      )}
                    </div>
                    {question.note && (
                      <div className="mt-2 rounded-[var(--pm-radius-control)] bg-white/78 px-3 py-2 text-[length:var(--pm-font-size-compact)] font-bold leading-snug text-[var(--pm-text-secondary)]">
                        {activeSourceRecord.source === '教师观察' ? `典型事例描述：${question.note}` : question.note}
                      </div>
                    )}
                    </div>
                  );
                })}
              </div>
            </ParentCard>
          ))}
        </section>
      </ParentPageShell>
    );
  };

  const ReportDetail = () => {
    if (!activeChild || !activeReport) return <Reports />;
    return (
      <ParentPageShell className="pb-28">
        <Header title="报告详情" subtitle={`${activeReport.title} · ${activeReport.period}`} showBack backLabel="返回报告列表" onBack={() => setScreen('reports')} />
        <ParentCard className="mx-5 mt-5 p-5" as="section">
          <ParentGradientIcon tone={activeReport.type === 'month' ? 'blue' : 'green'} size="lg" className="mb-5">
            {activeReport.type === 'month' ? <CalendarDays size={24} /> : <BookOpenCheck size={24} />}
          </ParentGradientIcon>
          <h2 className="text-[length:var(--pm-font-size-page-title)] font-bold text-balance text-[var(--pm-text-primary)]">{activeReport.title}</h2>
          <p className="mt-1 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-status-positive-strong)]">{activeChild.name} · {activeReport.period}</p>
        </ParentCard>

        <section className="mx-5 mt-3 space-y-2">
          <ParentCard as="section" className="p-4">
            <h3 className="text-[16px] font-bold text-[var(--pm-text-primary)]">总览</h3>
            <p className="mt-2 text-[length:var(--pm-font-size-card-title)] font-bold leading-relaxed text-pretty text-[var(--pm-text-secondary)]">{activeReport.summary}</p>
          </ParentCard>

          <ParentCard as="section" className="p-4">
            <h3 className="text-[16px] font-bold text-[var(--pm-text-primary)]">亮点</h3>
            <div className="mt-3 space-y-2">
              {activeReport.highlights.map(item => (
                <div key={item} className="flex items-start gap-2 rounded-[var(--pm-radius-inner)] bg-[var(--pm-status-positive-soft)] p-3">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-[var(--pm-status-positive-strong)]" />
                  <span className="text-[length:var(--pm-font-size-compact)] font-medium leading-relaxed text-[var(--pm-text-secondary)]">{item}</span>
                </div>
              ))}
            </div>
          </ParentCard>

          <ParentCard as="section" className="p-4">
            <h3 className="text-[16px] font-bold text-[var(--pm-text-primary)]">关注</h3>
            <p className="mt-2 text-[length:var(--pm-font-size-body)] font-bold leading-relaxed text-[var(--pm-text-secondary)]">{activeReport.focus}</p>
          </ParentCard>

          <ParentCard as="section" className="p-4">
            <h3 className="text-[16px] font-bold text-[var(--pm-text-primary)]">建议</h3>
            <p className="mt-2 text-[length:var(--pm-font-size-body)] font-bold leading-relaxed text-[var(--pm-text-secondary)]">{activeReport.suggestion}</p>
          </ParentCard>
        </section>
      </ParentPageShell>
    );
  };

  const Bank = () => {
    if (!activeChild) return <Binding />;
    if (!parentBankFeatureEnabled) return <Growth />;
    const amount = Math.max(1, Math.min(Number(depositAmount) || 1, activeChild.availableCoins));
    const projectedInterest = calculateProjectedInterest(amount, selectedBankScheme);
    const bankTopSpacing = 'mt-3';
    const withdrawDetails = withdrawTarget ? getDepositInterest(withdrawTarget) : null;
    const withdrawIsEarlyFixed = Boolean(withdrawTarget && withdrawTarget.type === 'fixed' && withdrawDetails && !withdrawDetails.matured);

    return (
      <ParentPageShell className="pb-28">
        <Header title="积分银行" showBack backLabel="返回成长页" onBack={() => setScreen('growth')} />
        <ParentCard as="section" className={`parent-bank-balance-strip sticky top-[44px] z-30 mx-5 px-4 py-2 backdrop-blur-xl ${bankTopSpacing}`}>
          <div className="flex min-h-10 items-center text-[var(--pm-text-secondary)]">
            <span className="shrink-0 pr-3 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-primary)]">{GROWTH_COIN_TERMS.name}</span>
            <div className="flex flex-1 items-center justify-center gap-1.5">
              <span className="text-[length:var(--pm-font-size-body)] font-bold">{GROWTH_COIN_TERMS.available}</span>
              <img src="/assets/coin.png" alt="" className="h-4 w-4 shrink-0" />
              <span className="tabular-nums text-[16px] font-bold leading-none">{formatCoin(activeChild.availableCoins)}</span>
            </div>
            <div className="h-5 w-px bg-[var(--pm-border-subtle)]" aria-hidden="true" />
            <div className="flex flex-1 items-center justify-center gap-1.5">
              <span className="text-[length:var(--pm-font-size-body)] font-bold">{GROWTH_COIN_TERMS.saved}</span>
              <img src="/assets/coin.png" alt="" className="h-4 w-4 shrink-0" />
              <span className="tabular-nums text-[16px] font-bold leading-none">{formatCoin(activeChild.bankBalance)}</span>
            </div>
          </div>
        </ParentCard>

        <section className="parent-bank-action-tabs mx-5 mt-3 grid grid-cols-2 gap-3">
          {[
            { key: 'deposit' as const, label: '签署新存单', icon: PiggyBank },
            { key: 'list' as const, label: '我的存单', icon: FileText },
          ].map(item => {
            const Icon = item.icon;
            const active = activeBankTab === item.key;
            const TabButton = active ? ParentPrimaryButton : ParentSecondaryButton;
            return (
              <TabButton key={item.key} type="button" onClick={() => setActiveBankTab(item.key)} className="h-12 rounded-full text-[length:var(--pm-font-size-body)]">
                <Icon size={16} />
                <span>{item.label}</span>
                {item.key === 'list' && (
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 tabular-nums text-[length:var(--pm-font-size-meta)] font-bold ${active ? 'bg-white/22 text-white' : 'bg-[var(--pm-status-positive-soft)] text-[var(--pm-brand-primary-strong)]'}`}>
                    {activeChild.deposits.length}
                  </span>
                )}
              </TabButton>
            );
          })}
        </section>

        {activeBankTab === 'deposit' ? (
          <section className="mx-5 mt-4 space-y-4">
            <ParentCard as="section" className="p-4">
              <h2 className="mb-3 text-[length:var(--pm-font-size-section-title)] font-bold text-[var(--pm-text-primary)]">存钱计划</h2>
              <div className="space-y-2">
                {PARENT_BANK_TERMS.map(scheme => {
                  const active = selectedBankScheme?.label === scheme.label;
                  const isCurrent = scheme.type === 'current';
                  return (
                    <button key={scheme.label} type="button" onClick={() => { setSelectedBankScheme(scheme); setShowDepositConfirm(true); }} className={`flex w-full items-center justify-between rounded-[var(--pm-radius-inner)] border px-4 py-3 text-left ${PARENT_PRESSABLE_CLASS} ${active ? (isCurrent ? 'border-[var(--pm-status-positive)]/60 bg-[var(--pm-status-positive-soft)]' : 'border-[var(--pm-brand-primary)]/60 bg-[var(--pm-brand-primary-soft)]/90') : 'border-[var(--pm-border-subtle)] bg-[var(--pm-bg-surface-soft)]'}`}>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[length:var(--pm-font-size-card-title)] font-bold text-[var(--pm-text-primary)]">{scheme.productName}</div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[length:var(--pm-font-size-meta)] font-bold">
                          <span className={`rounded-full bg-white/80 px-2.5 py-1 ${isCurrent ? 'text-[var(--pm-status-positive-strong)]' : 'text-[var(--pm-text-tertiary)]'}`}>存期 {scheme.termLabel}</span>
                          <span className={`rounded-full px-2.5 py-1 ${isCurrent ? 'bg-[var(--pm-status-positive-soft)] text-[var(--pm-status-positive-strong)]' : 'bg-[var(--pm-brand-primary-soft)] text-[var(--pm-brand-primary-strong)]'}`}>日利率 {formatDailyRate(scheme.dailyRate)}</span>
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 ${active ? (isCurrent ? 'border-[var(--pm-status-positive)] bg-[var(--pm-status-positive-soft)]' : 'border-[var(--pm-brand-primary)] bg-[var(--pm-brand-primary-soft)]') : 'border-[var(--pm-border-control)] bg-[var(--pm-bg-surface)]'} [box-shadow:inset_0_0_0_4px_var(--pm-bg-surface)]`} aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </ParentCard>
          </section>
        ) : (
          <section className="mx-5 mt-4 space-y-2">
            {activeChild.deposits.length === 0 ? (
              <ParentCard as="section" className="p-8 text-center">
                <ParentGradientIcon tone="softBlue" size="lg" className="mx-auto mb-3">
                  <Clock size={24} />
                </ParentGradientIcon>
                <div className="text-[length:var(--pm-font-size-section-title)] font-bold text-[var(--pm-text-secondary)]">还没有存单</div>
                <ParentPrimaryButton type="button" onClick={() => setActiveBankTab('deposit')} className="mt-5 h-12 px-6">
                  签署新存单
                </ParentPrimaryButton>
              </ParentCard>
            ) : activeChild.deposits.map(deposit => {
              const details = getDepositInterest(deposit);
              const isCurrentDeposit = deposit.type === 'current';
              const isEarlyFixedDeposit = !isCurrentDeposit && !details.matured;
              const cardToneClass = isCurrentDeposit
                ? 'bg-[var(--pm-status-positive-soft)]'
                : details.matured
                  ? 'bg-[var(--pm-brand-primary-soft)]'
                  : 'bg-[var(--pm-bg-surface)]';
              const railClass = isCurrentDeposit
                ? 'bg-[var(--pm-status-positive)]'
                : details.matured
                  ? 'bg-[var(--pm-brand-primary)]'
                  : 'bg-[var(--pm-brand-secondary)]';
              const stampClass = isCurrentDeposit
                ? 'border-[var(--pm-status-positive)]/20 bg-[var(--pm-status-positive-soft)] text-[var(--pm-brand-primary-strong)]'
                : details.matured
                  ? 'border-[var(--pm-brand-primary)]/30 bg-[var(--pm-brand-primary-soft)] text-[var(--pm-brand-primary-strong)]'
                  : 'border-[var(--pm-border-subtle)] bg-[var(--pm-bg-surface-soft)] text-[var(--pm-text-secondary)]';
              const valueClass = isCurrentDeposit
                ? 'text-[var(--pm-status-positive-strong)]'
                : details.matured
                  ? 'text-[var(--pm-brand-primary)]'
                  : 'text-[var(--pm-brand-primary-strong)]';
              const depositStatusLabel = isCurrentDeposit ? '随存随取' : details.matured ? '可取出' : '未到期';
              const returnLabel = isCurrentDeposit ? '当前可得' : '到期可得';
              const returnValue = isCurrentDeposit ? details.interest : details.maturityTotal;
              const actionTone = isCurrentDeposit || details.matured ? 'primary' : 'attentionSoft';
              return (
                <ParentCard key={deposit.id} as="article" className={`relative overflow-hidden p-0 ${cardToneClass}`}>
                  <div className={`absolute inset-y-0 left-0 w-1 ${railClass}`} aria-hidden="true" />
                  <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full border border-white/70 bg-white/32" aria-hidden="true" />
                  <div className="py-3 pl-4 pr-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex h-6 shrink-0 items-center rounded-full border px-2.5 text-[length:var(--pm-font-size-meta)] font-bold ${stampClass}`}>
                            {depositStatusLabel}
                          </span>
                          <h3 className="min-w-0 truncate text-[16px] font-bold leading-tight text-[var(--pm-text-primary)]">{deposit.label}</h3>
                        </div>
                      </div>
                      <ParentPrimaryButton type="button" tone={actionTone} onClick={() => setWithdrawTarget(deposit)} className="h-10 min-w-[76px] shrink-0 rounded-[var(--pm-radius-control)] px-3 text-[length:var(--pm-font-size-body)]">
                        {isEarlyFixedDeposit ? '提前取出' : '取出'}
                      </ParentPrimaryButton>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <div className="min-h-[56px] rounded-[var(--pm-radius-control)] bg-[var(--pm-bg-surface)] px-3 py-2 [box-shadow:var(--pm-shadow-control)]">
                        <div className="text-[length:var(--pm-font-size-meta)] font-bold leading-none text-[var(--pm-text-tertiary)]">本金</div>
                        <div className="mt-1 flex items-center gap-1 tabular-nums text-[length:var(--pm-font-size-value)] font-bold leading-none text-[var(--pm-text-primary)]">
                          <img src="/assets/coin.png" alt="" className="h-4 w-4 shrink-0" />
                          <span>{formatCoin(deposit.amount)}</span>
                        </div>
                      </div>
                      <div className="min-h-[56px] rounded-[var(--pm-radius-control)] border border-white/86 bg-white/62 px-3 py-2">
                        <div className="text-[length:var(--pm-font-size-meta)] font-bold leading-none text-[var(--pm-text-tertiary)]">{returnLabel}</div>
                        <div className={`mt-1 tabular-nums text-[length:var(--pm-font-size-value)] font-bold leading-none ${valueClass}`}>{isCurrentDeposit ? '+' : ''}{formatCoin(returnValue)}</div>
                      </div>
                    </div>
                    {!isCurrentDeposit && (
                      <div className="mt-2 flex min-h-[34px] items-center justify-between gap-2 rounded-[var(--pm-radius-control)] bg-[var(--pm-bg-surface)] px-3 py-1.5">
                        <span className="text-[length:var(--pm-font-size-meta)] font-bold leading-tight text-[var(--pm-text-tertiary)]">定期到期日</span>
                        <span className="truncate tabular-nums text-[length:var(--pm-font-size-compact)] font-bold leading-tight text-[var(--pm-text-primary)]">{details.availableAt ? formatDate(details.availableAt) : '-'}</span>
                      </div>
                    )}
                  </div>
                </ParentCard>
              );
            })}
          </section>
        )}

        {showDepositConfirm && selectedBankScheme && (
          <ParentBottomSheet title="存入金额" onClose={() => { setShowDepositConfirm(false); setShowDepositReview(false); }} className="pb-8">
            <p className="mb-4 text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-text-tertiary)]">{selectedBankScheme.productName} · 存期 {selectedBankScheme.termLabel} · 日利率 {formatDailyRate(selectedBankScheme.dailyRate)}</p>
            <div className="rounded-[var(--pm-radius-card)] bg-[var(--pm-bg-surface-soft)] p-4">
              <div className="mb-3 flex items-end justify-between">
                <span className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-text-tertiary)]">存入金额</span>
                <span className="tabular-nums text-[length:var(--pm-font-size-metric)] font-bold leading-none text-[var(--pm-text-primary)]">{amount}</span>
              </div>
              <input
                type="range"
                min="1"
                max={Math.max(1, Math.floor(activeChild.availableCoins))}
                step="1"
                value={amount}
                onChange={event => setDepositAmount(event.target.value)}
                className="h-3 w-full rounded-full accent-[var(--pm-brand-primary)]"
              />
              <div className="mt-2 flex justify-between text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-text-tertiary)]">
                <span>1</span>
                <span className="tabular-nums">最多 {Math.max(1, Math.floor(activeChild.availableCoins))}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-[var(--pm-radius-inner)] bg-[var(--pm-brand-primary-soft)] p-3">
                      <div className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-brand-primary-strong)]">{selectedBankScheme.type === 'current' ? '单日利息' : '到期利息'}</div>
                <div className="mt-1 tabular-nums text-[length:var(--pm-font-size-value)] font-bold text-[var(--pm-brand-primary-strong)]">+{projectedInterest}</div>
              </div>
              <div className="rounded-[var(--pm-radius-inner)] bg-[var(--pm-bg-surface-soft)] p-3">
                <div className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-text-tertiary)]">到期时间</div>
                <div className="mt-1 text-[length:var(--pm-font-size-card-title)] font-bold text-[var(--pm-text-secondary)]">{selectedBankScheme.type === 'current' ? '随时取出' : formatDate(Date.now() + selectedBankScheme.days * 86400000)}</div>
              </div>
            </div>
            {selectedBankScheme.type === 'current' && (
              <div className="mt-3 rounded-[var(--pm-radius-card)] bg-[var(--pm-status-positive-soft)] p-3">
                <div className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-brand-primary-strong)]">活期收益预估</div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {CURRENT_DEPOSIT_PROJECTION_DAYS.map(days => (
                    <div key={days} className="rounded-[var(--pm-radius-control)] bg-white/80 px-2 py-2 text-center">
                      <div className="text-[length:var(--pm-font-size-meta)] font-bold text-[var(--pm-text-tertiary)]">{days}天后</div>
                      <div className="mt-1 tabular-nums text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-status-positive-strong)]">+{(amount * BANK_CONFIG.DAILY_RATE * days).toFixed(2)}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <ParentPrimaryButton type="button" onClick={() => setShowDepositReview(true)} fullWidth className="mt-4 h-[52px] text-[16px]">
              签署存单
            </ParentPrimaryButton>
          </ParentBottomSheet>
        )}

        {showDepositReview && selectedBankScheme && (
            <div className="absolute inset-0 z-[100] flex items-center justify-center bg-[var(--pm-mask)] px-6 backdrop-blur-md" onClick={() => setShowDepositReview(false)}>
            <div className="w-full rounded-[var(--pm-radius-sheet)] bg-[var(--pm-bg-surface)] p-6 [box-shadow:var(--pm-shadow-sheet)]" onClick={event => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <ParentGradientIcon tone={selectedBankScheme.type === 'current' ? 'green' : 'blue'} size="lg" className="h-16 w-16 rounded-[var(--pm-radius-card)]">
                  <FileText size={30} strokeWidth={2.4} />
                </ParentGradientIcon>
                <button type="button" onClick={() => setShowDepositReview(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--pm-bg-surface-soft)] text-[var(--pm-text-tertiary)] transition-[transform,background-color] duration-150 ease-out active:scale-[0.96]">
                  <X size={20} />
                </button>
              </div>
              <h2 className="mt-5 text-[length:var(--pm-font-size-page-title)] font-bold leading-tight text-balance text-[var(--pm-text-primary)]">确认签署这份存单?</h2>
              <div className="mt-5 rounded-[var(--pm-radius-card)] bg-[var(--pm-bg-surface-soft)] p-4">
                <div className="flex items-center justify-between gap-3 py-2 text-[length:var(--pm-font-size-body)] font-bold">
                  <span className="text-[var(--pm-text-tertiary)]">签署计划</span>
                  <span className={`rounded-full px-3 py-1 text-[length:var(--pm-font-size-body)] font-bold ${selectedBankScheme.type === 'current' ? 'bg-[var(--pm-status-positive-soft)] text-[var(--pm-status-positive-strong)]' : 'bg-[var(--pm-brand-primary-soft)] text-[var(--pm-brand-primary-strong)]'}`}>{selectedBankScheme.label}</span>
                </div>
                <div className="flex items-center justify-between gap-3 py-2 text-[length:var(--pm-font-size-body)] font-bold">
                  <span className="text-[var(--pm-text-tertiary)]">投入本金</span>
                  <span className="flex items-center gap-1 tabular-nums text-[length:var(--pm-font-size-value)] font-bold text-[var(--pm-text-primary)]"><img src="/assets/coin.png" alt="" className="h-5 w-5" />{amount}</span>
                </div>
                <div className="flex items-center justify-between gap-3 py-2 text-[length:var(--pm-font-size-body)] font-bold">
                  <span className="text-[var(--pm-text-tertiary)]">预期利息</span>
                  <span className="flex items-center gap-1 tabular-nums text-[length:var(--pm-font-size-value)] font-bold text-[var(--pm-brand-primary-strong)]"><img src="/assets/coin.png" alt="" className="h-5 w-5" />+{projectedInterest}</span>
                </div>
                <div className="mt-2 border-t border-dashed border-[var(--pm-border-control)] pt-3 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-brand-primary-strong)]">
                  到期时间：{selectedBankScheme.type === 'current' ? '随时取出' : formatDate(Date.now() + selectedBankScheme.days * 86400000)}
                </div>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <ParentSecondaryButton type="button" onClick={() => setShowDepositReview(false)} className="h-[52px] text-[16px]">
                  我再想想
                </ParentSecondaryButton>
                <ParentPrimaryButton type="button" onClick={submitDeposit} className="h-[52px] text-[16px]">
                  确认签署
                </ParentPrimaryButton>
              </div>
            </div>
          </div>
        )}

        {withdrawTarget && (
          <ParentBottomSheet title="确认取出" onClose={() => setWithdrawTarget(null)} className="pb-8">
            {withdrawIsEarlyFixed && (
              <div className="mb-3 rounded-[var(--pm-radius-inner)] bg-[var(--pm-status-attention-soft)] px-3 py-3 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-status-attention)]">
                未到期取出将按活期利息计算
              </div>
            )}
            <div className="space-y-3 rounded-[var(--pm-radius-card)] bg-[var(--pm-bg-surface-soft)] p-4">
              <div className="flex justify-between text-[length:var(--pm-font-size-body)] font-bold"><span className="text-[var(--pm-text-tertiary)]">本金</span><span className="tabular-nums text-[var(--pm-text-primary)]">{formatCoin(withdrawTarget.amount)}</span></div>
              <div className="flex justify-between text-[length:var(--pm-font-size-body)] font-bold">
                <span className="text-[var(--pm-text-tertiary)]">{withdrawIsEarlyFixed ? '活期利息' : '利息'}</span>
                <span className="tabular-nums text-[var(--pm-status-positive-strong)]">+{formatCoin(withdrawDetails?.interest ?? 0)}</span>
              </div>
              <div className="border-t border-dashed border-[var(--pm-border-control)] pt-3 flex justify-between text-[length:var(--pm-font-size-card-title)] font-bold">
                <span className="text-[var(--pm-text-secondary)]">到账金额</span>
                <span className="flex items-center gap-1 tabular-nums text-[var(--pm-text-primary)]"><img src="/assets/coin.png" alt="" className="h-4 w-4" />{formatCoin(withdrawDetails?.withdrawalTotal ?? 0)}</span>
              </div>
            </div>
            <ParentPrimaryButton type="button" onClick={() => withdrawDeposit(withdrawTarget)} fullWidth className="mt-4 h-[52px] text-[16px]">
              {withdrawIsEarlyFixed ? '确认提前取出' : '确认取出'}
            </ParentPrimaryButton>
          </ParentBottomSheet>
        )}
      </ParentPageShell>
    );
  };

  const MinePage = () => {
    const boundChildren = childrenList.length;
    return (
      <ParentPageShell className="pb-28">
        <section className="mx-5 mt-4 space-y-3">
          <ParentCard as="section" className="p-4">
            <div className="flex items-center gap-3">
              <ParentGradientIcon tone="green" size="lg">
                <UserRound size={24} strokeWidth={2.45} />
              </ParentGradientIcon>
              <div className="min-w-0 flex-1">
                <h1 className="truncate text-[length:var(--pm-font-size-section-title)] font-bold leading-tight text-[var(--pm-text-primary)]">{PARENT_PROFILE.name}</h1>
                <p className="mt-1 truncate text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]">{PARENT_PROFILE.relation} · {PARENT_PROFILE.phone}</p>
              </div>
              <button type="button" onClick={() => setMineSheet('profile')} className={`flex h-10 shrink-0 items-center justify-center rounded-[var(--pm-radius-control)] bg-[var(--pm-bg-surface-soft)] px-3 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-secondary)] ${PARENT_PRESSABLE_CLASS}`} aria-label="查看家长信息">
                详情
              </button>
            </div>
          </ParentCard>

          <ParentCard as="section" className="p-0">
            {[
              { label: '家长信息', meta: PARENT_PROFILE.phone, icon: UserRound, action: () => setMineSheet('profile') },
              { label: '已绑定孩子', meta: `${boundChildren}名`, icon: Files, action: () => setShowChildSwitcher(true) },
              { label: '隐私协议', meta: '查看', icon: ShieldCheck, action: () => setMineSheet('privacy') },
            ].map(item => {
              const Icon = item.icon;
              return (
                <button key={item.label} type="button" onClick={item.action} className={`flex min-h-[58px] w-full items-center gap-3 border-b border-[var(--pm-border-subtle)] px-4 py-3 text-left last:border-b-0 ${PARENT_PRESSABLE_CLASS}`}>
                  <ParentGradientIcon tone={item.label === '隐私协议' ? 'blue' : 'softBlue'} size="sm">
                    <Icon size={16} strokeWidth={2.6} />
                  </ParentGradientIcon>
                  <span className="min-w-0 flex-1 truncate text-[length:var(--pm-font-size-card-title)] font-bold text-[var(--pm-text-primary)]">{item.label}</span>
                  <span className="max-w-[120px] truncate text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]">{item.meta}</span>
                  <ChevronRight size={15} className="shrink-0 text-[var(--pm-text-disabled)]" />
                </button>
              );
            })}
          </ParentCard>

          <ParentSecondaryButton type="button" onClick={() => setMineSheet('logout')} tone="attentionSoft" fullWidth className="h-12 text-[length:var(--pm-font-size-card-title)]">
            <LogOut size={17} strokeWidth={2.5} />
            退出登录
          </ParentSecondaryButton>
        </section>

        {mineSheet === 'profile' && (
          <ParentBottomSheet title="家长信息" onClose={() => setMineSheet(null)} className="pb-8">
            <div className="space-y-2">
              {[
                ['姓名', PARENT_PROFILE.name],
                ['身份', PARENT_PROFILE.relation],
                ['手机号', PARENT_PROFILE.phone],
                ['绑定孩子', activeChild ? `${activeChild.name} · ${activeChild.className}` : '暂无'],
              ].map(([label, value]) => (
                <div key={label} className="flex min-h-[48px] items-center justify-between gap-4 rounded-[var(--pm-radius-inner)] bg-[var(--pm-bg-surface-soft)] px-4 py-3">
                  <span className="text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]">{label}</span>
                  <span className="min-w-0 truncate text-right text-[length:var(--pm-font-size-card-title)] font-bold text-[var(--pm-text-primary)]">{value}</span>
                </div>
              ))}
            </div>
          </ParentBottomSheet>
        )}

        {mineSheet === 'privacy' && (
          <ParentBottomSheet title="隐私协议" onClose={() => setMineSheet(null)} className="pb-8">
            <div className="space-y-3 text-[length:var(--pm-font-size-body)] font-bold leading-relaxed text-[var(--pm-text-secondary)]">
              <p>我们仅收集登录、绑定学生、查看成长记录所必需的信息，用于展示孩子在校评价、成长报告和积分账户。</p>
              <p>未经授权，不会向无关第三方共享家长手机号、学生身份信息和成长记录。</p>
              <p>如需注销或更正信息，可联系学校管理员处理。</p>
            </div>
          </ParentBottomSheet>
        )}

        {mineSheet === 'logout' && (
          <ParentBottomSheet title="退出登录" onClose={() => setMineSheet(null)} className="pb-8">
            <p className="text-[length:var(--pm-font-size-card-title)] font-bold leading-relaxed text-[var(--pm-text-secondary)]">退出后需要重新完成登录或绑定流程。</p>
            <div className="mt-5 grid grid-cols-2 gap-3">
              <ParentSecondaryButton type="button" onClick={() => setMineSheet(null)} className="h-[52px] text-[16px]">
                取消
              </ParentSecondaryButton>
              <ParentPrimaryButton type="button" tone="attention" onClick={confirmLogout} className="h-[52px] text-[16px]">
                退出
              </ParentPrimaryButton>
            </div>
          </ParentBottomSheet>
        )}
      </ParentPageShell>
    );
  };

  const ChildSwitcherSheet = () => {
    if (!showChildSwitcher) return null;
    return (
      <ParentBottomSheet title="切换孩子" onClose={() => setShowChildSwitcher(false)} className="pb-8">
        <div className="space-y-2">
          {childrenList.map(child => {
            const isCurrentChild = child.id === activeChild?.id;
            return (
              <ParentCard
                key={child.id}
                as="article"
                className={`student-switcher-card relative w-full overflow-hidden !p-0 ${isCurrentChild ? 'bg-[var(--pm-status-positive-soft)] [box-shadow:var(--pm-shadow-card)]' : 'bg-[var(--pm-bg-surface-soft)] shadow-none'}`}
              >
                {isCurrentChild && <div className="absolute inset-y-0 left-0 w-1 bg-[var(--pm-status-positive)]" aria-hidden="true" />}
                <div className="flex min-h-[72px] items-center gap-3 px-4 py-2">
                  <ParentChildAvatar name={child.name} src={child.avatar} alt={`${child.name}头像`} className="h-12 w-12 rounded-[var(--pm-radius-inner)]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[length:var(--pm-font-size-section-title)] font-bold leading-tight text-[var(--pm-text-primary)]">{child.name}</div>
                    <div className="mt-1.5 truncate text-[length:var(--pm-font-size-body)] font-bold leading-snug text-[var(--pm-text-tertiary)]">{child.className}</div>
                  </div>
                  {isCurrentChild ? (
                  <span className="inline-flex h-9 min-w-[58px] shrink-0 items-center justify-center rounded-[var(--pm-radius-control)] bg-[var(--pm-bg-surface)] px-3 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-brand-primary-strong)] [box-shadow:var(--pm-shadow-control)]">
                      当前
                    </span>
                  ) : (
                    <ParentSecondaryButton
                      type="button"
                      onClick={() => { setActiveChildId(child.id); setShowChildSwitcher(false); }}
                      className="h-9 min-h-9 min-w-[58px] shrink-0 px-3 text-[length:var(--pm-font-size-compact)]"
                    >
                      切换
                    </ParentSecondaryButton>
                  )}
                </div>
              </ParentCard>
            );
          })}
        </div>
        <ParentSecondaryButton type="button" onClick={() => openBinding('switcher')} fullWidth tone="neutral" className="mt-3 h-11 min-h-11 text-[length:var(--pm-font-size-card-title)]">
          <Plus size={17} /> 绑定其他孩子
        </ParentSecondaryButton>
      </ParentBottomSheet>
    );
  };

  const ExchangePasswordSheet = () => {
    if (!exchangePasswordChild) return null;
    const password = exchangePasswordEditing ? exchangePasswordDraft : exchangePasswordChild.exchangePassword;
    const maskedPassword = maskExchangePassword(password);

    return (
      <ParentBottomSheet title={`兑换密码 · ${exchangePasswordChild.name}`} onClose={closeExchangePasswordSheet} className="pb-8">
        <div className="rounded-[var(--pm-radius-card)] bg-[var(--pm-bg-surface-soft)] p-4 [box-shadow:var(--pm-shadow-card)]">
          {exchangePasswordEditing ? (
            <div>
              <label className="block">
                <span className="mb-2 block text-[length:var(--pm-font-size-body)] font-bold text-[var(--pm-text-secondary)]">新的6位密码</span>
                <input
                  value={exchangePasswordDraft}
                  onChange={event => {
                    setExchangePasswordDraft(sanitizeExchangePassword(event.target.value));
                    setExchangePasswordError('');
                  }}
                  inputMode="numeric"
                  maxLength={EXCHANGE_PASSWORD_LENGTH}
                  placeholder="请输入6位数字"
                  aria-invalid={Boolean(exchangePasswordError)}
                  className="h-[52px] w-full rounded-[var(--pm-radius-inner)] border border-[var(--pm-border-control)] bg-[var(--pm-bg-surface)] px-4 text-[length:var(--pm-font-size-page-title)] font-bold tracking-[0.28em] text-[var(--pm-text-primary)] outline-none transition-colors placeholder:text-[length:var(--pm-font-size-body)] placeholder:tracking-normal placeholder:text-[var(--pm-text-disabled)] focus:border-[var(--pm-brand-primary)] focus:ring-4 focus:ring-[var(--pm-focus-ring)]"
                />
              </label>
              <div className="mt-2 min-h-5 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-status-negative)]" role="alert">{exchangePasswordError}</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <ParentSecondaryButton type="button" onClick={() => { setExchangePasswordEditing(false); setExchangePasswordDraft(exchangePasswordChild.exchangePassword); setExchangePasswordError(''); }} className="h-[52px] text-[16px]">
                  取消
                </ParentSecondaryButton>
                <ParentPrimaryButton type="button" onClick={saveExchangePassword} className="h-[52px] text-[16px]">
                  保存密码
                </ParentPrimaryButton>
              </div>
            </div>
          ) : (
            <>
              <div className="mb-2 text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]">当前密码</div>
              <div className="flex min-h-[64px] items-center justify-between gap-3 rounded-[var(--pm-radius-inner)] bg-white/85 px-4">
                <span className="tabular-nums text-[28px] font-bold tracking-[0.22em] text-[var(--pm-text-primary)]" aria-live="polite">
                  {exchangePasswordVisible ? (password || '未设置') : maskedPassword}
                </span>
                <button
                  type="button"
                  onClick={() => setExchangePasswordVisible(value => !value)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[var(--pm-radius-control)] bg-[var(--pm-bg-surface-soft)] text-[var(--pm-text-tertiary)] transition-[transform,background-color] duration-150 ease-out active:scale-[0.96]"
                  aria-label={exchangePasswordVisible ? '隐藏兑换密码' : '查看兑换密码'}
                >
                  {exchangePasswordVisible ? <EyeOff size={19} strokeWidth={2.5} /> : <Eye size={19} strokeWidth={2.5} />}
                </button>
              </div>
              <ParentPrimaryButton type="button" onClick={() => { setExchangePasswordEditing(true); setExchangePasswordDraft(exchangePasswordChild.exchangePassword); setExchangePasswordError(''); }} fullWidth className="mt-4 h-[52px] text-[16px]">
                修改密码
              </ParentPrimaryButton>
            </>
          )}
        </div>
      </ParentBottomSheet>
    );
  };

  const TodoPage = () => {
    const pendingQuestionnaireRows = getPendingQuestionnaireMessages();
    if (!activeChild) return <Binding />;
    return (
      <ParentPageShell className="pb-28">
        <Header title="待办" showBack backLabel="返回成长页" onBack={() => setScreen('growth')} />
        <section className="mx-5 mt-4 space-y-2">
          {pendingAssignedQuestionnaires.map(questionnaire => (
            <ParentCard key={questionnaire.id} as="article" className="overflow-hidden p-0">
              <button
                type="button"
                onClick={() => {
                  setActiveSharedQuestionnaireId(questionnaire.id);
                  setScreen('questionnaireForm');
                }}
                className={`flex min-h-[76px] w-full items-center gap-3 px-4 py-3 text-left ${PARENT_PRESSABLE_CLASS}`}
              >
                <ParentGradientIcon tone="blue" size="sm">
                  <ClipboardList size={16} strokeWidth={2.6} />
                </ParentGradientIcon>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[length:var(--pm-font-size-card-title)] font-bold leading-5 text-[var(--pm-text-primary)]">{questionnaire.title}</span>
                  <span className={`mt-1 block truncate text-[length:var(--pm-font-size-meta)] font-bold ${isQuestionnaireOverdue(questionnaire) ? 'text-amber-600' : 'text-[var(--pm-text-tertiary)]'}`}>
                    {questionnaire.creatorName}{questionnaire.suggestedDeadline
                      ? ` · ${formatQuestionnaireCompletionTime(questionnaire.suggestedDeadline)}`
                      : ''}
                  </span>
                </span>
                <span className="flex h-10 min-w-[62px] shrink-0 items-center justify-center rounded-[var(--pm-radius-control)] border border-[var(--pm-brand-primary)]/30 bg-[var(--pm-bg-surface)] px-3 text-[length:var(--pm-font-size-card-title)] font-bold text-[var(--pm-brand-primary-strong)] [box-shadow:var(--pm-shadow-control)]">{questionnaire.submissions.some(submission => submission.studentNo === activeChild.studentNo && submission.reviewStatus === 'returned') ? '修改' : '填写'}</span>
              </button>
            </ParentCard>
          ))}
          {pendingQuestionnaireRows && pendingQuestionnaireRows.length > 0 ? pendingQuestionnaireRows.map(questionnaire => (
            <ParentCard key={questionnaire.id} as="article" className="overflow-hidden p-0">
              <button
                type="button"
                onClick={() => openQuestionnaireForm(questionnaire.id)}
                className={`flex min-h-[70px] w-full items-center gap-3 px-4 py-3 text-left ${PARENT_PRESSABLE_CLASS}`}
              >
                <ParentGradientIcon tone={questionnaire.tone} size="sm">
                  <ClipboardList size={16} strokeWidth={2.6} />
                </ParentGradientIcon>
                <span className="min-w-0 flex-1 truncate text-[16px] font-bold leading-5 text-[var(--pm-text-primary)]">{questionnaire.label}</span>
                <span className="flex h-10 min-w-[62px] shrink-0 items-center justify-center rounded-[var(--pm-radius-control)] border border-[var(--pm-brand-primary)]/30 bg-[var(--pm-bg-surface)] px-3 text-[length:var(--pm-font-size-card-title)] font-bold text-[var(--pm-brand-primary-strong)] [box-shadow:var(--pm-shadow-control)]">
                  填写
                </span>
              </button>
            </ParentCard>
          )) : pendingAssignedQuestionnaires.length === 0 ? (
            <ParentCard as="section" className="p-8 text-center">
              <ParentGradientIcon tone="softBlue" size="lg" className="mx-auto mb-3">
                <CheckCircle2 size={24} />
              </ParentGradientIcon>
              <div className="text-[length:var(--pm-font-size-section-title)] font-bold text-[var(--pm-text-secondary)]">暂无待办</div>
            </ParentCard>
          ) : null}
        </section>
      </ParentPageShell>
    );
  };

  const renderScreen = () => {
    if (!isLoggedIn) return Login();
    if (inviteOutcome) return InviteResultPage();
    if (inviteCandidateIds.length > 1) return InviteChildSelect();
    if (screen === 'binding') return Binding();
    if (screen === 'growthRecords') return GrowthRecords();
    if (screen === 'todo') return TodoPage();
    if (screen === 'reports') return Reports();
    if (screen === 'archiveList') return ArchiveList();
    if (screen === 'archiveDetail') return ArchiveDetail();
    if (screen === 'questionnaireForm' && activeChild && activeSharedQuestionnaire) {
      return (
        <AssignedQuestionnaireView
          questionnaire={activeSharedQuestionnaire}
          child={{ name: activeChild.name, studentNo: activeChild.studentNo }}
          guardianRelation={PARENT_PROFILE.relation}
          onBack={() => pendingInviteCode ? finishInviteToHome() : setScreen('todo')}
          onSubmitted={() => {
            setSharedQuestionnaires(readQuestionnaires());
            if (pendingInviteCode) {
              setInviteOutcome('submitted');
            } else {
              setSubmitSuccessMessage('提交成功');
              setScreen('growth');
            }
          }}
        />
      );
    }
    if (screen === 'questionnaireForm') return QuestionnaireForm();
    if (screen === 'questionnaireDetail') return QuestionnaireDetail();
    if (screen === 'reportDetail') return ReportDetail();
    if (screen === 'bank') return Bank();
    if (screen === 'mine') return MinePage();
    return Growth();
  };

  const tabItems: { key: Screen; label: string; icon: LucideIcon }[] = [
    { key: 'growth', label: '成长', icon: Star },
    { key: 'reports', label: '报告', icon: FileText },
    { key: 'mine', label: '我的', icon: UserRound },
  ];

  const hasParentOverlay = showChildSwitcher || showDepositConfirm || showDepositReview || showQuestionnaireSubmitConfirm || Boolean(withdrawTarget) || Boolean(mineSheet) || Boolean(exchangePasswordChildId);
  const hasInviteStandalonePage = !isLoggedIn || Boolean(inviteOutcome) || inviteCandidateIds.length > 1;
  const showTabs = activeChild && (screen === 'growth' || screen === 'reports' || screen === 'mine') && !hasParentOverlay && !hasInviteStandalonePage;
  const SubmitSuccessToast = () => {
    if (!submitSuccessMessage) return null;
    return (
      <div className="pointer-events-none absolute bottom-24 left-1/2 z-[120] -translate-x-1/2 rounded-full bg-[var(--pm-text-primary)] px-4 py-2 text-[length:var(--pm-font-size-body)] font-bold text-[var(--pm-text-inverse)] [box-shadow:var(--pm-shadow-sheet)]" role="status" aria-live="polite">
        {submitSuccessMessage}
      </div>
    );
  };
  const renderParentBottomNav = () => {
    const goTab = (item: (typeof tabItems)[number], nextIndex: number) => {
      if (nextIndex === parentNavActiveIndex && screen === item.key) return;
      setScreen(item.key);
    };

    return (
      <nav
        className="absolute bottom-0 left-0 right-0 z-50 h-16 border-0 bg-[var(--pm-bg-surface)] [box-shadow:var(--pm-shadow-navigation)]"
        aria-label="家长端底部导航"
      >
        <div className="grid h-full grid-cols-3 items-center text-center">
          {tabItems.map(item => {
            const Icon = item.icon;
            const nextIndex = tabItems.findIndex(tab => tab.key === item.key);
            const active = parentNavActiveIndex === nextIndex;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => goTab(item, nextIndex)}
                aria-current={active ? 'page' : undefined}
                className={`group flex h-full min-w-0 flex-col items-center justify-center gap-1 transition-colors [transition-duration:var(--pm-duration-fast)] ${active ? 'text-[var(--pm-brand-primary)]' : 'text-[var(--pm-nav-item-default)]'}`}
              >
                <span className="relative flex h-[22px] w-[22px] items-center justify-center">
                  <Icon className={`h-[22px] w-[22px] object-contain transition-transform [transition-duration:var(--pm-duration-fast)] ease-out group-active:scale-[0.86] motion-reduce:transition-none ${active ? 'scale-100' : 'scale-90'}`} strokeWidth={active ? 2.65 : 2.25} />
                </span>
                <span className="text-xs font-medium">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    );
  };

  return (
    <div
      className="flex h-[100dvh] w-screen items-center justify-center bg-[var(--pm-bg-page)] p-4 font-sans"
      style={{ ...parentMobileCssVariables, '--evaluation-score-negative': evaluationScoreSemantic.negative } as React.CSSProperties}
    >
      <PhoneMockup showDeviceFrame={showPhoneShell} contentTopInsetMode="status-bar" screenBackground={<ParentDiffuseBackdrop preview={gradientPreview} />}>
        <div className="relative flex flex-1 flex-col overflow-hidden bg-transparent text-[var(--pm-text-primary)]">
          {renderScreen()}
          {showTabs && renderParentBottomNav()}
          <SubmitSuccessToast />
          <ChildSwitcherSheet />
          <ExchangePasswordSheet />
        </div>
      </PhoneMockup>
    </div>
  );
};

export default ParentApp;
