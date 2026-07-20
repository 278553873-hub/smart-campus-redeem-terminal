import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
  Files,
  FileText,
  Landmark,
  LogOut,
  PiggyBank,
  Plus,
  ShieldCheck,
  Star,
  UserRound,
  X,
} from 'lucide-react';
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
import TeacherFluidGlassNav from '../mobile-app/components/TeacherFluidGlassNav';
import AssignedQuestionnaireView from './parent-app/AssignedQuestionnaireView';
import { parentSurface } from './parent-app/ParentStyleTokens';
import '../mobile-app/styles/navigation.css';
import { BANK_CONFIG } from '../constants';
import { ASSETS } from '../mobile-app/assets/images';
import {
  QUESTIONNAIRE_STORE_EVENT,
  getQuestionnaireCollectionMode,
  isQuestionnaireOverdue,
  readQuestionnaires,
  type QuestionnaireRecord,
} from '../shared/questionnaireStore';

interface ParentAppProps {
  showPhoneShell?: boolean;
  defaultHasBoundChild?: boolean;
}

type Screen = 'binding' | 'growth' | 'reports' | 'archiveList' | 'archiveDetail' | 'questionnaireForm' | 'questionnaireDetail' | 'reportDetail' | 'bank' | 'growthRecords' | 'todo' | 'mine';
type ReportType = 'month' | 'term';
type BankTab = 'deposit' | 'list';
type GrowthRangeMode = 'day' | 'week' | 'month' | 'term';
type GrowthTermKey = 'first' | 'second';
type MineSheet = 'profile' | 'privacy' | 'logout' | null;

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
  audience: 'parent' | 'student';
  sourceRecordId: string;
}

type QuestionnaireAnswerDraft = Record<string, string[]>;

interface ChildProfile {
  id: string;
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
  const avatarPool = gender === 'male' ? ASSETS.AVATAR.BOYS : ASSETS.AVATAR.GIRLS;
  const now = Date.now();
  const dayAgo = (days: number) => now - days * 86400000;
  return {
    id: `child-${Date.now()}-${index}`,
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
      { id: `pending-${index}-parent`, title: '家长问卷', audience: 'parent', sourceRecordId: `source-${index}-parent` },
      { id: `pending-${index}-student`, title: '孩子问卷', audience: 'student', sourceRecordId: `source-${index}-student` },
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
const BINDING_INPUT_CLASS = 'w-full h-[52px] rounded-[16px] border border-[#D8EEF0] bg-white/95 px-4 text-[16px] font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-colors focus:border-[#0DB4F1] focus:ring-4 focus:ring-cyan-100/70';
const PARENT_ICON_BUTTON_CLASS = 'flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition-[transform,background-color,color] duration-150 ease-out active:scale-[0.96] active:bg-slate-50';
const PARENT_RANGE_SHORTCUT_CLASS = 'ml-2 h-10 rounded-full border border-emerald-200 px-4 text-[16px] font-bold text-emerald-600 transition-[transform,background-color] duration-150 ease-out active:scale-[0.96] active:bg-emerald-50';
const PARENT_PRESSABLE_CLASS = 'transition-[transform,background-color,box-shadow,border-color] duration-150 ease-out active:scale-[0.96]';
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

const ParentDiffuseBackdrop = () => (
  <div aria-hidden="true" className={`${parentSurface.background} pointer-events-none absolute inset-0 overflow-hidden`} />
);

const ParentApp: React.FC<ParentAppProps> = ({ showPhoneShell = true, defaultHasBoundChild = true }) => {
  const [screen, setScreen] = useState<Screen>(() => defaultHasBoundChild ? 'growth' : 'binding');
  const [childrenList, setChildrenList] = useState<ChildProfile[]>(() => (
    defaultHasBoundChild ? [
      createDemoChild('郑小磊', 'BS2024', '20250101', 0),
      createDemoChild('林小满', 'BS2024', '20250102', 1, { canViewArchive: true }),
    ] : []
  ));
  const [activeChildId, setActiveChildId] = useState('');
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
  const [questionnaireAnswers, setQuestionnaireAnswers] = useState<QuestionnaireAnswerDraft>({});
  const [questionnaireTextAnswers, setQuestionnaireTextAnswers] = useState<Record<string, string>>({});
  const [showQuestionnaireSubmitConfirm, setShowQuestionnaireSubmitConfirm] = useState(false);
  const [submitSuccessMessage, setSubmitSuccessMessage] = useState('');
  const [selectedGrowthDate, setSelectedGrowthDate] = useState(() => new Date());
  const [growthRangeMode, setGrowthRangeMode] = useState<GrowthRangeMode>('day');
  const [mineSheet, setMineSheet] = useState<MineSheet>(null);
  const [parentNavActiveIndex, setParentNavActiveIndex] = useState(0);
  const [, setParentNavSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [parentNavJellyToggle, setParentNavJellyToggle] = useState<'a' | 'b' | 'none'>('none');
  const parentTabbarRef = useRef<HTMLDivElement>(null);
  const [parentTabbarWidth, setParentTabbarWidth] = useState(320);

  const activeChild = useMemo(
    () => childrenList.find(child => child.id === activeChildId) ?? childrenList[0] ?? null,
    [activeChildId, childrenList]
  );

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
      && getQuestionnaireCollectionMode(questionnaire) === 'guardian_questionnaire'
      && questionnaire.targets.some(target => target.studentNo === activeChild.studentNo && target.reachable)
      && !questionnaire.submissions.some(submission => submission.studentNo === activeChild.studentNo)
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
  const selectedPraiseCount = selectedGrowthRangeRecords.filter(record => record.score > 0).length;
  const selectedImproveCount = selectedGrowthRangeRecords.filter(record => record.score < 0).length;

  const getParentActiveTabIndex = (nextScreen: Screen) => {
    if (nextScreen === 'reports' || nextScreen === 'reportDetail') return 1;
    if (nextScreen === 'mine') return 2;
    return 0;
  };

  useLayoutEffect(() => {
    if (parentTabbarRef.current) {
      setParentTabbarWidth(parentTabbarRef.current.offsetWidth);
    }
    const handleResize = () => {
      if (parentTabbarRef.current) {
        setParentTabbarWidth(parentTabbarRef.current.offsetWidth);
      }
    };
    window.addEventListener('resize', handleResize);
    const timer = setTimeout(() => {
      if (parentTabbarRef.current) {
        setParentTabbarWidth(parentTabbarRef.current.offsetWidth);
      }
    }, 50);
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timer);
    };
  }, [screen]);

  useEffect(() => {
    const nextIndex = getParentActiveTabIndex(screen);
    if (nextIndex === parentNavActiveIndex) return;
    if (nextIndex > parentNavActiveIndex) {
      setParentNavSlideDirection('right');
    } else if (nextIndex < parentNavActiveIndex) {
      setParentNavSlideDirection('left');
    }
    setParentNavActiveIndex(nextIndex);
    setParentNavJellyToggle(prev => {
      if (prev === 'none') return 'a';
      return prev === 'a' ? 'b' : 'a';
    });

    const timer = setTimeout(() => {
      setParentNavSlideDirection('none');
    }, 350);
    return () => clearTimeout(timer);
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
    setChildrenList(prev => [...prev, newChild]);
    setActiveChildId(newChild.id);
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
    setScreen('binding');
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
    setActiveSharedQuestionnaireId('');
    setActiveQuestionnaireId(questionnaireId);
    setQuestionnaireStepIndex(0);
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
    setScreen('binding');
    setSubmitSuccessMessage('已退出登录');
  };

  const Header = ({ title, subtitle, showBack = false, backLabel = '返回成长页', onBack }: { title: string; subtitle?: string; showBack?: boolean; backLabel?: string; onBack?: () => void }) => (
    <div className="sticky top-0 z-40 flex h-[44px] shrink-0 items-center justify-between border-b border-white/40 bg-white/20 px-4 py-2 backdrop-blur-xl">
      <div className="relative flex h-full w-full items-center justify-center">
        {showBack && (
          <button type="button" onClick={onBack ?? (() => setScreen('growth'))} className="absolute left-0 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition-transform duration-150 ease-out active:scale-[0.96]" aria-label={backLabel}>
            <ArrowLeft size={18} />
          </button>
        )}
        {title && <h1 className="max-w-[220px] truncate text-center text-[17px] font-bold leading-tight text-balance text-slate-900">{title}</h1>}
      </div>
    </div>
  );

  const GrowthChildProfileCard = () => {
    if (!activeChild) return null;
    const canViewArchive = activeChild.canViewArchive && activeChild.archives.length > 0;
    return (
      <ParentCard as="section" className="mx-5 mt-4 p-4">
        <div className="flex min-h-[68px] items-center gap-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-3.5">
            <ParentChildAvatar
              name={activeChild.name}
              src={activeChild.avatar}
              alt={`${activeChild.name}头像`}
              className="h-[68px] w-[68px] rounded-[22px] border-2 border-white bg-slate-50 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.55)]"
            />
            <div className="min-w-0 flex-1">
              <h2 className="truncate text-[18px] font-black leading-tight text-slate-950">{activeChild.name}</h2>
              <p className="mt-1 truncate text-[13px] font-bold leading-snug text-slate-500">
                {activeChild.className}
              </p>
              <button
                type="button"
                onClick={() => setShowChildSwitcher(true)}
                className={`mt-1 inline-flex h-7 max-w-full items-center justify-center gap-0.5 rounded-full border border-slate-100 bg-slate-50/90 px-2 text-[12px] font-black leading-none text-slate-600 shadow-[inset_0_1px_0_rgba(255,255,255,0.82)] ${PARENT_PRESSABLE_CLASS}`}
                aria-label="切换孩子"
              >
                <span className="truncate">切换孩子</span>
                <ChevronRight size={12} strokeWidth={2.6} />
              </button>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {canViewArchive && (
              <button
                type="button"
                onClick={() => setScreen('archiveList')}
                className={`flex h-10 shrink-0 items-center justify-center gap-1.5 rounded-[14px] bg-sky-50/80 px-2.5 text-[13px] font-black text-sky-700 shadow-[inset_0_0_0_1px_rgba(14,165,233,0.14)] ${PARENT_PRESSABLE_CLASS}`}
                aria-label={`查看${activeChild.name}档案`}
                title="档案"
              >
                <Files size={17} strokeWidth={2.45} />
                <span>档案</span>
              </button>
            )}
            <MessageBellEntry />
          </div>
        </div>
      </ParentCard>
    );
  };

  const getPendingQuestionnaireMessages = () => {
    if (!activeChild || activeChild.pendingQuestionnaires.length === 0) return null;
    const pendingQuestionnaireRows: Array<PendingQuestionnaire & { label: string; tone: 'blue' | 'softBlue' }> = activeChild.pendingQuestionnaires.map(questionnaire => ({
      ...questionnaire,
      label: questionnaire.audience === 'student' ? '待学生填写问卷' : '待家长填写问卷',
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
        className={`relative flex h-10 w-10 shrink-0 items-center justify-center rounded-[14px] border border-orange-100 bg-orange-50/78 text-orange-500 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.74)] ${PARENT_PRESSABLE_CLASS}`}
        aria-label={`待办，${messageCount}项待处理`}
        title="待办"
      >
        <Bell size={18} strokeWidth={2.45} />
        <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-gradient-to-br from-[#FFB36C] to-[#FF7E6B] px-1 text-[11px] font-black leading-none text-white shadow-[0_8px_18px_-10px_rgba(255,126,107,0.82)]">
          {messageCount}
        </span>
      </button>
    );
  };

  const GrowthSummaryCards = () => {
    const positiveCount = 13;
    const improveCount = 1;
    const netScore = 45;
    const growthReward = 70.5;
    const scoreReward = 20.38;
    const totalReward = growthReward + scoreReward;

    return (
      <section className="mx-5 mt-4 flex flex-col gap-3">
        <ParentCard as="article" className="min-h-[154px] p-4">
          <div className="flex items-center justify-between gap-2">
            <span className="text-[13px] font-black text-slate-400">本月净得分</span>
            <span className="rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-[12px] font-black text-emerald-600">稳步成长</span>
          </div>
          <div className="mt-4 flex items-baseline justify-center">
            <span className="tabular-nums text-[52px] font-black leading-none text-blue-600">{netScore}</span>
            <span className="ml-2 text-[18px] font-black text-slate-300">分</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex items-center justify-center gap-2 rounded-[18px] border border-emerald-100 bg-emerald-50/80 px-2 py-2">
              <ParentGradientIcon tone="green" size="sm">
                <CheckCircle2 size={16} />
              </ParentGradientIcon>
              <div className="text-left">
                <div className="text-[11px] font-black text-emerald-500">表扬</div>
                <div className="mt-0.5 tabular-nums text-[17px] font-black text-emerald-600">{positiveCount}<span className="ml-0.5 text-[11px]">次</span></div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-[18px] border border-orange-100 bg-orange-50/75 px-2 py-2">
              <ParentGradientIcon tone="orange" size="sm">
                <Clock size={16} />
              </ParentGradientIcon>
              <div className="text-left">
                <div className="text-[11px] font-black text-orange-500">待改进</div>
                <div className="mt-0.5 tabular-nums text-[17px] font-black text-orange-500">{improveCount}<span className="ml-0.5 text-[11px]">次</span></div>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setScreen('growthRecords')}
            className="mx-auto mt-3 flex min-h-8 items-center justify-center rounded-full px-3 text-[13px] font-black text-emerald-700 transition-colors active:bg-emerald-50"
          >
            <span>全部记录</span>
            <ChevronRight size={14} strokeWidth={3} aria-hidden="true" />
          </button>
        </ParentCard>

        <ParentCard as="article" className="min-h-[154px] p-4 shadow-[0_18px_46px_-36px_rgba(249,115,22,0.55)]">
          <div className="text-[13px] font-black text-orange-500">预计可得</div>
          <div className="mt-5 flex items-center justify-center gap-2">
            <img src="/assets/coin.png" alt="" className="h-9 w-9 shrink-0" />
            <span className="tabular-nums text-[42px] font-black leading-none text-orange-500">{totalReward.toFixed(2)}</span>
          </div>
          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="rounded-[18px] border border-orange-100 bg-white/76 px-2 py-2 text-center">
              <div className="text-[11px] font-black text-orange-500/80">成长奖励</div>
              <div className="mt-1 flex items-center justify-center gap-1 text-[16px] font-black text-orange-500">
                <img src="/assets/coin.png" alt="" className="h-4 w-4" /><span className="tabular-nums">{growthReward}</span>
              </div>
            </div>
            <div className="text-[18px] font-black text-orange-300">+</div>
            <div className="rounded-[18px] border border-orange-100 bg-white/76 px-2 py-2 text-center">
              <div className="text-[11px] font-black text-orange-500/80">得分奖励</div>
              <div className="mt-1 flex items-center justify-center gap-1 text-[16px] font-black text-orange-500">
                <img src="/assets/coin.png" alt="" className="h-4 w-4" /><span className="tabular-nums">{scoreReward}</span>
              </div>
            </div>
          </div>
        </ParentCard>
      </section>
    );
  };

  const GrowthBankEntry = () => {
    if (!activeChild) return null;
    return (
      <ParentCard as="section" className="mx-5 mt-3 overflow-hidden p-0">
        <button type="button" onClick={() => setScreen('bank')} className={`flex w-full items-center gap-3 px-4 py-3 text-left ${PARENT_PRESSABLE_CLASS}`} aria-label="进入积分银行">
          <ParentGradientIcon tone="blue" size="md">
            <Landmark size={21} strokeWidth={2.45} />
          </ParentGradientIcon>
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-[16px] font-black leading-tight text-slate-950">积分银行</h2>
              <ChevronRight size={16} className="shrink-0 text-slate-300" />
            </div>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <div className="rounded-[14px] bg-orange-50/80 px-3 py-2">
                <div className="text-[11px] font-black text-orange-500/80">钱包</div>
                <div className="mt-1 flex items-center gap-1 tabular-nums text-[16px] font-black text-orange-500">
                  <img src="/assets/coin.png" alt="" className="h-4 w-4" />
                  {formatCoin(activeChild.availableCoins)}
                </div>
              </div>
              <div className="rounded-[14px] bg-sky-50/85 px-3 py-2">
                <div className="text-[11px] font-black text-sky-500/80">存款</div>
                <div className="mt-1 flex items-center gap-1 tabular-nums text-[16px] font-black text-sky-600">
                  <img src="/assets/coin.png" alt="" className="h-4 w-4" />
                  {formatCoin(activeChild.bankBalance)}
                </div>
              </div>
            </div>
          </div>
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
          <div className="text-[20px] font-medium tracking-tight text-slate-900">{year}年 {month + 1}月</div>
          <button type="button" onClick={() => changeMonth(1)} className={PARENT_ICON_BUTTON_CLASS} aria-label="下个月">
            <ArrowRight size={18} />
          </button>
          <button type="button" onClick={() => setSelectedGrowthDate(new Date())} className={PARENT_RANGE_SHORTCUT_CLASS}>
            今天
          </button>
        </div>
        <div className="grid grid-cols-7 gap-y-2 text-center text-[15px] font-bold">
          {['一', '二', '三', '四', '五', '六', '日'].map(week => (
            <div key={week} className="pb-2 text-slate-400">{week}</div>
          ))}
          {calendarCells.map(cell => {
            if (!cell.day) return <div key={cell.key} className="h-[48px]" aria-hidden="true" />;
            const date = new Date(year, month, cell.day);
            const dayRecords = getGrowthDayRecords(date);
            const hasPraise = dayRecords.some(record => record.score > 0);
            const hasImprove = dayRecords.some(record => record.score < 0);
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
                className={`flex h-[48px] flex-col items-center justify-start rounded-[16px] pt-1 text-[15px] font-bold tabular-nums text-slate-900 ${PARENT_PRESSABLE_CLASS}`}
                aria-label={`${month + 1}月${cell.day}日`}
              >
                <span className={`flex h-9 w-9 items-center justify-center rounded-full ${selected ? 'bg-emerald-600 text-white' : isToday ? 'bg-emerald-50 text-emerald-700' : ''}`}>
                  {cell.day}
                </span>
                <span className="mt-1 flex h-2 items-center justify-center gap-1">
                  {hasPraise && <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden="true" />}
                  {hasImprove && <span className="h-2 w-2 rounded-full bg-orange-400" aria-hidden="true" />}
                </span>
              </button>
            );
          })}
        </div>
      </ParentCard>
    );
  };

  const GrowthRangeTabs = () => (
    <div className="mx-5 mt-4 grid grid-cols-4 rounded-[18px] border border-white/70 bg-white/75 p-1 shadow-[0_18px_38px_-30px_rgba(37,99,235,0.45)]">
      {GROWTH_RANGE_TABS.map(([mode, label]) => (
        <button
          key={mode}
          type="button"
          onClick={() => setGrowthRangeMode(mode)}
          className={`h-10 rounded-[14px] text-[15px] font-black ${PARENT_PRESSABLE_CLASS} ${growthRangeMode === mode ? 'bg-emerald-600 text-white shadow-[0_12px_24px_-18px_rgba(5,150,105,0.9)]' : 'text-slate-500 active:bg-slate-50'}`}
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
          <div className="text-[20px] font-medium tracking-tight text-slate-900">{year}年 {month + 1}月</div>
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
            const hasPraise = weekRecords.some(record => record.score > 0);
            const hasImprove = weekRecords.some(record => record.score < 0);
            const representativeDate = start < monthStart ? monthStart : start;

            return (
              <button
                key={start.getTime()}
                type="button"
                onClick={() => setSelectedGrowthDate(representativeDate)}
                className={`flex h-[58px] flex-col items-center justify-center rounded-[18px] px-3 text-[15px] font-bold tabular-nums ${PARENT_PRESSABLE_CLASS} ${selected ? 'bg-emerald-600 text-white shadow-[0_14px_28px_-20px_rgba(5,150,105,0.9)]' : 'bg-slate-50 text-slate-700'}`}
                aria-label={formatWeekRange(start, end)}
              >
                <span>{formatWeekRange(start, end)}</span>
                <span className="mt-1 flex h-2 items-center justify-center gap-1">
                  {hasPraise && <span className={`h-2 w-2 rounded-full ${selected ? 'bg-white' : 'bg-emerald-500'}`} aria-hidden="true" />}
                  {hasImprove && <span className={`h-2 w-2 rounded-full ${selected ? 'bg-orange-200' : 'bg-orange-400'}`} aria-hidden="true" />}
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
          <div className="text-[20px] font-medium tracking-tight text-slate-900">{year}年</div>
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
            const hasPraise = monthRecords.some(record => record.score > 0);
            const hasImprove = monthRecords.some(record => record.score < 0);

            return (
              <button
                key={monthIndex}
                type="button"
                onClick={() => setSelectedGrowthDate(new Date(year, monthIndex, 1))}
                className={`flex h-[58px] flex-col items-center justify-center rounded-[18px] px-3 text-[15px] font-bold tabular-nums ${PARENT_PRESSABLE_CLASS} ${selected ? 'bg-emerald-600 text-white shadow-[0_14px_28px_-20px_rgba(5,150,105,0.9)]' : 'bg-slate-50 text-slate-700'}`}
                aria-label={`${monthIndex + 1}月`}
              >
                <span>{monthIndex + 1}月</span>
                <span className="mt-1 flex h-2 items-center justify-center gap-1">
                  {hasPraise && <span className={`h-2 w-2 rounded-full ${selected ? 'bg-white' : 'bg-emerald-500'}`} aria-hidden="true" />}
                  {hasImprove && <span className={`h-2 w-2 rounded-full ${selected ? 'bg-orange-200' : 'bg-orange-400'}`} aria-hidden="true" />}
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
          <div className="text-[20px] font-medium tracking-tight text-slate-900">{termInfo.label}</div>
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
            const hasPraise = termRecords.some(record => record.score > 0);
            const hasImprove = termRecords.some(record => record.score < 0);

            return (
              <button
                key={range.key}
                type="button"
                onClick={() => setSelectedGrowthDate(new Date(range.start))}
                className={`flex h-[72px] flex-col items-center justify-center rounded-[18px] px-3 text-[16px] font-bold ${PARENT_PRESSABLE_CLASS} ${selected ? 'bg-emerald-600 text-white shadow-[0_14px_28px_-20px_rgba(5,150,105,0.9)]' : 'bg-slate-50 text-slate-700'}`}
                aria-label={range.label}
              >
                <span>{range.label}</span>
                <span className="mt-1 flex h-2 items-center justify-center gap-1">
                  {hasPraise && <span className={`h-2 w-2 rounded-full ${selected ? 'bg-white' : 'bg-emerald-500'}`} aria-hidden="true" />}
                  {hasImprove && <span className={`h-2 w-2 rounded-full ${selected ? 'bg-orange-200' : 'bg-orange-400'}`} aria-hidden="true" />}
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
    const selectedNetScore = selectedGrowthRangeRecords.reduce((sum, record) => sum + record.score, 0);
    const selectedTermInfo = getGrowthTermInfo(selectedGrowthDate);
    const selectedTermLabel = getGrowthTermRanges(selectedTermInfo.schoolYearStart).find(range => range.key === selectedTermInfo.term)?.label ?? '上学期';
    const statisticTitle = growthRangeMode === 'day' ? '当天统计' : growthRangeMode === 'week' ? '本周统计' : growthRangeMode === 'month' ? '本月统计' : '本学期统计';
    const statisticDate = growthRangeMode === 'day'
      ? formatDate(selectedGrowthDate.getTime())
      : growthRangeMode === 'week'
        ? `${formatDate(getWeekStartDate(selectedGrowthDate).getTime())} - ${formatDate(getWeekStartDate(selectedGrowthDate).getTime() + 86400000 * 6)}`
        : growthRangeMode === 'month'
          ? `${selectedGrowthDate.getFullYear()}年${selectedGrowthDate.getMonth() + 1}月`
          : `${selectedTermInfo.label} ${selectedTermLabel}`;
    return (
      <ParentPageShell className="pb-8">
        <Header title="成长数据" showBack backLabel="返回成长页" onBack={() => setScreen('growth')} />
        <GrowthRangeTabs />
        {growthRangeMode === 'day' && <GrowthCalendar />}
        {growthRangeMode === 'week' && <GrowthWeekStrip />}
        {growthRangeMode === 'month' && <GrowthMonthSummary />}
        {growthRangeMode === 'term' && <GrowthTermSummary />}
        <ParentCard as="section" className="mx-5 mt-3 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-[17px] font-black text-slate-900">{statisticTitle}</h2>
            <span className="tabular-nums text-[12px] font-bold text-slate-400">{statisticDate}</span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="rounded-[18px] bg-blue-50 px-3 py-3 text-center">
              <div className="text-[11px] font-black text-blue-500">净得分</div>
              <div className="mt-1 tabular-nums text-[22px] font-black text-blue-600">{selectedNetScore}</div>
            </div>
            <div className="rounded-[18px] bg-emerald-50 px-3 py-3 text-center">
              <div className="text-[11px] font-black text-emerald-500">表扬</div>
              <div className="mt-1 tabular-nums text-[22px] font-black text-emerald-600">{selectedPraiseCount}<span className="ml-0.5 text-[11px]">次</span></div>
            </div>
            <div className="rounded-[18px] bg-orange-50 px-3 py-3 text-center">
              <div className="text-[11px] font-black text-orange-500">待改进</div>
              <div className="mt-1 tabular-nums text-[22px] font-black text-orange-500">{selectedImproveCount}<span className="ml-0.5 text-[11px]">次</span></div>
            </div>
          </div>
        </ParentCard>
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
              <span className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-500"><ShieldCheck size={15} /> 学校编号</span>
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
                  <span className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-500"><Icon size={15} /> {item.label}</span>
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
        <GrowthSummaryCards />
        <GrowthBankEntry />
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
                      <h2 className="text-[16px] font-black text-balance text-slate-900">{report.title}</h2>
                      <ArrowRight size={16} className="shrink-0 text-slate-300" />
                    </div>
                    <p className="mt-1 text-[12px] font-bold text-emerald-600">{report.period}</p>
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
                <ParentGradientIcon tone="green" size="lg" className="rounded-[16px]">
                  <Files size={23} />
                </ParentGradientIcon>
                <div className="min-w-0 flex-1">
                  <h2 className="truncate text-[18px] font-black leading-tight text-slate-950">{archive.title}</h2>
                  <p className="mt-1 text-[13px] font-bold leading-tight text-emerald-600">{archive.stage}</p>
                  <div className="mt-3 inline-flex rounded-full bg-slate-50 px-3 py-1.5 text-[12px] font-black leading-tight text-slate-500">
                    建档日期：{archive.createdAt}
                  </div>
                </div>
                <ArrowRight size={17} className="shrink-0 text-slate-300" />
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
    const selectedTextOptionsComplete = selectedAnswers.every(option => (
      !optionNeedsTextInput(option) || Boolean(questionnaireTextAnswers[`${currentQuestion.id}::${option}`]?.trim())
    ));
    const questionPrompt = currentQuestion.prompt
      .replace(/^\d+[.．、]/, '')
      .replace(/\s+\/\s+/g, '：');
    const questionTypeLabel = getQuestionTypeLabel(currentQuestion);
    const canGoNext = questionOptions.length === 0 || (selectedAnswers.length > 0 && selectedTextOptionsComplete);
    const isLastQuestion = currentStepNumber === questionTotal;
    return (
      <ParentPageShell className="pb-36">
        <div className="sticky top-0 z-40 border-b border-white/60 bg-white/76 px-4 py-3 backdrop-blur-xl">
          <div className="flex min-h-10 items-center gap-3">
            <button type="button" onClick={() => setScreen('growth')} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition-transform duration-150 ease-out active:scale-[0.96]" aria-label="返回成长页">
              <ArrowLeft size={18} />
            </button>
            <div className="min-w-0 flex-1">
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="text-[13px] font-black text-slate-500">填写进度</span>
                <span className="tabular-nums text-[13px] font-black text-emerald-600">{currentStepNumber}/{questionTotal}</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-gradient-to-r from-[#0DB4F1] to-[#18D0A8] transition-[width] duration-300 ease-out" style={{ width: `${progressPercent}%` }} />
              </div>
            </div>
          </div>
        </div>

        <section className="mx-5 mt-4">
          <ParentCard as="section" className="p-5">
            <div className="mb-3 inline-flex rounded-full bg-sky-50 px-3 py-1.5 text-[12px] font-black text-sky-600">
              {questionTypeLabel}
            </div>
            <h2 className="break-words text-[18px] font-black leading-[1.4] text-slate-950">
              {questionPrompt}
            </h2>

            <div className="mt-5 space-y-2.5">
              {questionOptions.map(option => {
                const selected = selectedAnswers.includes(option);
                const textAnswerKey = `${currentQuestion.id}::${option}`;
                const textAnswerValue = questionnaireTextAnswers[textAnswerKey] ?? '';
                const needsText = selected && optionNeedsTextInput(option);
                const showTextError = needsText && !textAnswerValue.trim();
                return (
                  <div key={option} className={`rounded-[16px] border ${selected ? 'border-[#18D0A8] bg-emerald-50/55' : 'border-slate-100 bg-white'}`}>
                    <button
                      type="button"
                      onClick={() => updateQuestionnaireAnswer(currentQuestion, option)}
                      className={`flex min-h-[54px] w-full items-start gap-3 px-4 py-3 text-left ${PARENT_PRESSABLE_CLASS}`}
                      aria-pressed={selected}
                    >
                      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[#18D0A8] bg-white' : 'border-slate-300 bg-white'}`}>
                        {selected && <span className="h-2.5 w-2.5 rounded-full bg-[#18D0A8]" aria-hidden="true" />}
                      </span>
                      <span className={`text-[15px] font-bold leading-snug ${selected ? 'text-slate-950' : 'text-slate-700'}`}>{option.replace(/[_＿]+/g, '').trim()}</span>
                    </button>
                    {needsText && (
                      <div className="px-4 pb-4">
                        <textarea
                          value={textAnswerValue}
                          onChange={event => setQuestionnaireTextAnswers(prev => ({ ...prev, [textAnswerKey]: event.target.value }))}
                          placeholder="请填写具体内容"
                          aria-invalid={showTextError}
                          rows={3}
                          className={`min-h-[96px] w-full resize-none rounded-[14px] border bg-white px-3.5 py-3 text-[15px] font-bold leading-relaxed text-slate-800 outline-none transition-colors placeholder:text-slate-400 focus:border-[#0DB4F1] focus:ring-4 focus:ring-cyan-100/70 ${showTextError ? 'border-orange-200' : 'border-emerald-100'}`}
                        />
                        {showTextError && (
                          <div className="mt-1.5 text-[12px] font-bold text-orange-500">请补充内容</div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
              {questionOptions.length === 0 && (
                <div className="rounded-[18px] bg-slate-50 px-4 py-4 text-[15px] font-bold leading-snug text-slate-700">
                  {currentQuestion.answer}
                </div>
              )}
            </div>
          </ParentCard>
        </section>

        <div className="absolute bottom-0 left-0 right-0 z-30 border-t border-white/70 bg-white/86 px-5 py-4 backdrop-blur-xl">
          <div className="grid grid-cols-[0.8fr_1.2fr] gap-3">
            <ParentSecondaryButton
              type="button"
              onClick={() => setQuestionnaireStepIndex(index => Math.max(0, index - 1))}
              disabled={questionnaireStepIndex === 0}
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
          </div>
        </div>

        {showQuestionnaireSubmitConfirm && (
          <ParentBottomSheet title="确认提交" onClose={() => setShowQuestionnaireSubmitConfirm(false)} className="pb-8">
            <div className="rounded-[20px] bg-slate-50/90 p-4">
              <div className="text-[16px] font-black leading-tight text-slate-900">{activePendingQuestionnaire.title}</div>
              <div className="mt-2 text-[13px] font-bold leading-relaxed text-slate-500">提交后将完成本次问卷。</div>
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
            <ParentGradientIcon tone="green" size="lg" className="rounded-[16px]">
              <Files size={24} />
            </ParentGradientIcon>
            <div className="min-w-0 flex-1">
              <h2 className="text-[23px] font-black leading-tight text-balance text-slate-950">{activeArchive.title}</h2>
              <p className="mt-2 text-[13px] font-bold leading-tight text-emerald-600">{activeArchive.stage} · {activeArchive.createdAt}</p>
            </div>
          </div>
        </ParentCard>

        <ParentCard as="section" className="mx-5 mt-3 p-4">
          <h2 className="text-[16px] font-black text-slate-900">档案摘要</h2>
          <div className="mt-3 space-y-2">
            {activeArchive.summary.map(item => (
              <div key={item.label} className="rounded-[16px] border border-emerald-100/72 bg-emerald-50/45 px-3 py-3">
                <div className="text-[12px] font-black text-emerald-600">{item.label}</div>
                <div className="mt-1 text-[14px] font-bold leading-relaxed text-slate-700">{item.value}</div>
              </div>
            ))}
          </div>
        </ParentCard>

        <section className="mx-5 mt-3 space-y-2">
          <ParentCard as="section" className="p-4">
            <h2 className="text-[16px] font-black text-slate-900">健康信息</h2>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {activeArchive.healthInfo.map(item => (
                <div key={item.label} className="rounded-[16px] bg-emerald-50/70 px-3 py-3">
                  <div className="text-[12px] font-black text-emerald-600">{item.label}</div>
                  <div className="mt-1 text-[15px] font-black text-slate-900">{item.value}</div>
                </div>
              ))}
            </div>
          </ParentCard>

          <ParentCard as="section" className="p-4">
            <h2 className="text-[16px] font-black text-slate-900">基础信息</h2>
            <div className="mt-3 divide-y divide-slate-100">
              {activeArchive.basicInfo.map(item => (
                <div key={item.label} className="flex min-h-11 items-center justify-between gap-4 py-2">
                  <span className="shrink-0 text-[13px] font-bold text-slate-400">{item.label}</span>
                  <span className="min-w-0 truncate text-right text-[14px] font-black text-slate-900">{item.value}</span>
                </div>
              ))}
            </div>
          </ParentCard>
        </section>

        <section className="mx-5 mt-3 space-y-2">
          <h2 className="px-1 text-[15px] font-black text-slate-900">档案内容</h2>
          {activeArchive.contentGroups.map(group => (
            <ParentCard key={group.title} as="section" className="border-slate-100/90 p-4 shadow-[0_18px_44px_-40px_rgba(28,42,58,0.48)]">
              <div className="flex items-center gap-2">
                <span className="h-5 w-1 rounded-full bg-emerald-500" aria-hidden="true" />
                <h3 className="text-[17px] font-black leading-tight text-slate-950">{group.title}</h3>
              </div>
              <div className="mt-4 space-y-4">
                {group.sections.map(section => (
                  <div key={section.title} className="rounded-[16px] border border-slate-100 bg-slate-50/65 p-3">
                    <h4 className="text-[14px] font-black leading-tight text-emerald-700">{section.title}</h4>
                    <div className="mt-3 divide-y divide-slate-100 overflow-hidden rounded-[12px] border border-slate-100 bg-white">
                      {section.items.map(item => {
                        const [label, ...valueParts] = item.split('：');
                        const value = valueParts.join('：') || item;
                        return (
                          <div key={item} className="flex min-h-11 items-center justify-between gap-3 px-3 py-2.5">
                            <span className="shrink-0 text-[13px] font-bold text-slate-500">{valueParts.length > 0 ? label : '内容'}</span>
                            <span className="min-w-0 text-right text-[14px] font-black leading-snug text-slate-900">{value}</span>
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
          <h2 className="px-1 text-[15px] font-black text-slate-900">建档来源</h2>
          <div className="overflow-hidden rounded-[18px] border border-slate-100 bg-white/70">
            {activeArchive.sourceRecords.map(record => (
              <button key={record.id} type="button" onClick={() => { setActiveSourceId(record.id); setScreen('questionnaireDetail'); }} className={`flex w-full items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 ${PARENT_PRESSABLE_CLASS}`}>
                <div className="min-w-0">
                  <h3 className="truncate text-[14px] font-black leading-tight text-slate-800">{record.title}</h3>
                  <p className="mt-1 truncate text-[12px] font-bold leading-tight text-slate-400">{record.source} · {record.time}</p>
                </div>
                <ArrowRight size={15} className="shrink-0 text-slate-300" />
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
          <h2 className="text-[23px] font-black leading-tight text-balance text-slate-950">{activeSourceRecord.title}</h2>
          <p className="mt-2 text-[13px] font-bold text-emerald-600">{activeSourceRecord.source} · {activeSourceRecord.time}</p>
          <div className="mt-5 divide-y divide-slate-100 rounded-[16px] border border-slate-100 bg-slate-50/70 px-3">
            {activeSourceRecord.formIntro.map(item => {
              const isLongIntroLabel = item.label.length > 14;
              return (
                <div key={item.label} className={`${isLongIntroLabel ? 'py-3' : 'flex min-h-10 items-center justify-between gap-3 py-2'}`}>
                  <span className={`${isLongIntroLabel ? 'block text-[12px] leading-snug' : 'shrink-0 text-[12px]'} font-bold text-slate-400`}>{item.label}</span>
                  <span className={`${isLongIntroLabel ? 'mt-2 block text-left leading-snug' : 'min-w-0 text-right'} text-[14px] font-black text-slate-900`}>{item.value}</span>
                </div>
              );
            })}
          </div>
        </ParentCard>

        <section className="mx-5 mt-3 space-y-2">
          {activeSourceRecord.formSections.map(section => (
            <ParentCard key={section.title} as="section" className="p-4">
              <h3 className="text-[16px] font-black text-slate-900">{section.title}</h3>
              <div className="mt-3 space-y-3">
                {section.questions.map(question => {
                  const questionTypeLabel = getQuestionTypeLabel(question);
                  return (
                    <div key={question.id} className="rounded-[16px] border border-slate-100 bg-slate-50/65 p-3">
                      <div className="mb-2 inline-flex rounded-full bg-sky-50 px-2.5 py-1 text-[11px] font-black text-sky-600">
                        {questionTypeLabel}
                      </div>
                      {question.prompt && (
                        <div className="text-[14px] font-black leading-snug text-slate-900">{question.prompt}</div>
                      )}
                    <div className="mt-3 space-y-2">
                      {splitArchiveOptions(question.options).length > 0 ? splitArchiveOptions(question.options).map(option => {
                        const selected = isArchiveOptionSelected(option, splitArchiveAnswers(question.answer));
                        return (
                          <div key={option} className={`flex items-start gap-2 rounded-[12px] border px-3 py-2 ${selected ? 'border-[#18D0A8] bg-white text-slate-900' : 'border-slate-100 bg-white/54 text-slate-400'}`}>
                            <span className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${selected ? 'border-[#18D0A8] bg-white' : 'border-slate-200 bg-white'}`}>
                              {selected && <span className="h-2 w-2 rounded-full bg-[#18D0A8]" aria-hidden="true" />}
                            </span>
                            <span className={`text-[13px] font-bold leading-snug ${selected ? 'text-slate-900' : 'text-slate-400'}`}>{option}</span>
                          </div>
                        );
                      }) : (
                        <div className="rounded-[12px] bg-white px-3 py-2 text-[14px] font-black leading-snug text-slate-900 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.82)]">
                          {question.answer}
                        </div>
                      )}
                    </div>
                    {question.note && (
                      <div className="mt-2 rounded-[12px] bg-white/78 px-3 py-2 text-[13px] font-bold leading-snug text-slate-600">
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
          <h2 className="text-[24px] font-black text-balance text-slate-950">{activeReport.title}</h2>
          <p className="mt-1 text-[13px] font-bold text-emerald-600">{activeChild.name} · {activeReport.period}</p>
        </ParentCard>

        <section className="mx-5 mt-3 space-y-2">
          <ParentCard as="section" className="p-4">
            <h3 className="text-[16px] font-black text-slate-900">总览</h3>
            <p className="mt-2 text-[15px] font-bold leading-relaxed text-pretty text-slate-600">{activeReport.summary}</p>
          </ParentCard>

          <ParentCard as="section" className="p-4">
            <h3 className="text-[16px] font-black text-slate-900">亮点</h3>
            <div className="mt-3 space-y-2">
              {activeReport.highlights.map(item => (
                <div key={item} className="flex items-start gap-2 rounded-[16px] bg-emerald-50/70 p-3">
                  <CheckCircle2 size={17} className="mt-0.5 shrink-0 text-emerald-600" />
                  <span className="text-[13px] font-medium leading-relaxed text-slate-600">{item}</span>
                </div>
              ))}
            </div>
          </ParentCard>

          <ParentCard as="section" className="p-4">
            <h3 className="text-[16px] font-black text-slate-900">关注</h3>
            <p className="mt-2 text-[14px] font-bold leading-relaxed text-slate-600">{activeReport.focus}</p>
          </ParentCard>

          <ParentCard as="section" className="p-4">
            <h3 className="text-[16px] font-black text-slate-900">建议</h3>
            <p className="mt-2 text-[14px] font-bold leading-relaxed text-slate-600">{activeReport.suggestion}</p>
          </ParentCard>
        </section>
      </ParentPageShell>
    );
  };

  const Bank = () => {
    if (!activeChild) return <Binding />;
    const amount = Math.max(1, Math.min(Number(depositAmount) || 1, activeChild.availableCoins));
    const projectedInterest = calculateProjectedInterest(amount, selectedBankScheme);
    const bankTopSpacing = 'mt-3';
    const withdrawDetails = withdrawTarget ? getDepositInterest(withdrawTarget) : null;
    const withdrawIsEarlyFixed = Boolean(withdrawTarget && withdrawTarget.type === 'fixed' && withdrawDetails && !withdrawDetails.matured);

    return (
      <ParentPageShell className="pb-28">
        <Header title="积分银行" showBack backLabel="返回成长页" onBack={() => setScreen('growth')} />
        <ParentCard as="section" className={`parent-bank-balance-strip sticky top-[44px] z-30 mx-5 px-4 py-2 backdrop-blur-xl ${bankTopSpacing}`}>
          <div className="flex min-h-10 items-center text-slate-600">
            <div className="flex flex-1 items-center justify-center gap-1.5">
              <span className="text-[14px] font-black">钱包</span>
              <img src="/assets/coin.png" alt="" className="h-4 w-4 shrink-0" />
              <span className="tabular-nums text-[16px] font-black leading-none">{formatCoin(activeChild.availableCoins)}</span>
            </div>
            <div className="h-5 w-px bg-slate-200" aria-hidden="true" />
            <div className="flex flex-1 items-center justify-center gap-1.5">
              <span className="text-[14px] font-black">存款</span>
              <img src="/assets/coin.png" alt="" className="h-4 w-4 shrink-0" />
              <span className="tabular-nums text-[16px] font-black leading-none">{formatCoin(activeChild.bankBalance)}</span>
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
              <TabButton key={item.key} type="button" onClick={() => setActiveBankTab(item.key)} className="h-12 rounded-full text-[14px]">
                <Icon size={16} />
                <span>{item.label}</span>
                {item.key === 'list' && (
                  <span className={`flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 tabular-nums text-[11px] font-black ${active ? 'bg-white/22 text-white' : 'bg-emerald-50 text-emerald-700'}`}>
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
              <h2 className="mb-3 text-[17px] font-black text-slate-900">存钱计划</h2>
              <div className="space-y-2">
                {PARENT_BANK_TERMS.map(scheme => {
                  const active = selectedBankScheme?.label === scheme.label;
                  const isCurrent = scheme.type === 'current';
                  return (
                    <button key={scheme.label} type="button" onClick={() => { setSelectedBankScheme(scheme); setShowDepositConfirm(true); }} className={`flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left ${PARENT_PRESSABLE_CLASS} ${active ? (isCurrent ? 'border-emerald-300 bg-emerald-50/90' : 'border-sky-300 bg-sky-50/90') : 'border-slate-100 bg-slate-50/80'}`}>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-[15px] font-black text-slate-900">{scheme.productName}</div>
                        <div className="mt-2 grid grid-cols-2 gap-2 text-[12px] font-bold">
                          <span className={`rounded-full bg-white/80 px-2.5 py-1 ${isCurrent ? 'text-emerald-600' : 'text-slate-500'}`}>存期 {scheme.termLabel}</span>
                          <span className={`rounded-full px-2.5 py-1 ${isCurrent ? 'bg-emerald-100/80 text-emerald-600' : 'bg-sky-100/80 text-sky-600'}`}>日利率 {formatDailyRate(scheme.dailyRate)}</span>
                        </div>
                      </div>
                      <div className={`h-5 w-5 rounded-full border-2 ${active ? (isCurrent ? 'border-emerald-500 bg-emerald-500' : 'border-sky-500 bg-sky-500') : 'border-slate-200 bg-white'} shadow-[inset_0_0_0_4px_white]`} aria-hidden="true" />
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
                <div className="text-[17px] font-black text-slate-700">还没有存单</div>
                <ParentPrimaryButton type="button" onClick={() => setActiveBankTab('deposit')} className="mt-5 h-12 px-6">
                  签署新存单
                </ParentPrimaryButton>
              </ParentCard>
            ) : activeChild.deposits.map(deposit => {
              const details = getDepositInterest(deposit);
              const isCurrentDeposit = deposit.type === 'current';
              const isEarlyFixedDeposit = !isCurrentDeposit && !details.matured;
              const cardToneClass = isCurrentDeposit
                ? 'border-emerald-100 bg-[linear-gradient(135deg,#ffffff_0%,#ffffff_46%,#ECFDF5_100%)] shadow-[0_22px_54px_-42px_rgba(16,185,129,0.72)]'
                : details.matured
                  ? 'border-cyan-100 bg-[linear-gradient(135deg,#ffffff_0%,#ffffff_42%,#ECFEFF_100%)] shadow-[0_22px_54px_-42px_rgba(6,182,212,0.72)]'
                  : 'border-sky-100 bg-[linear-gradient(135deg,#ffffff_0%,#ffffff_42%,#EFF6FF_100%)] shadow-[0_22px_54px_-42px_rgba(14,165,233,0.7)]';
              const railClass = isCurrentDeposit
                ? 'from-emerald-400 to-teal-400'
                : details.matured
                  ? 'from-cyan-400 to-emerald-400'
                  : 'from-sky-400 to-blue-500';
              const stampClass = isCurrentDeposit
                ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                : details.matured
                  ? 'border-cyan-100 bg-cyan-50 text-cyan-700'
                  : 'border-sky-100 bg-sky-50 text-sky-700';
              const valueClass = isCurrentDeposit
                ? 'text-emerald-600'
                : details.matured
                  ? 'text-cyan-600'
                  : 'text-sky-600';
              const depositStatusLabel = isCurrentDeposit ? '随存随取' : details.matured ? '可取出' : '未到期';
              const returnLabel = isCurrentDeposit ? '当前可得' : '到期可得';
              const returnValue = isCurrentDeposit ? details.interest : details.maturityTotal;
              const actionTone = isCurrentDeposit || details.matured ? 'primary' : 'attentionSoft';
              return (
                <ParentCard key={deposit.id} as="article" className={`relative overflow-hidden p-0 ${cardToneClass}`}>
                  <div className={`absolute inset-y-0 left-0 w-1 bg-gradient-to-b ${railClass}`} aria-hidden="true" />
                  <div className="pointer-events-none absolute -right-8 -top-10 h-24 w-24 rounded-full border border-white/70 bg-white/32" aria-hidden="true" />
                  <div className="py-3 pl-4 pr-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex h-6 shrink-0 items-center rounded-full border px-2.5 text-[11px] font-black ${stampClass}`}>
                            {depositStatusLabel}
                          </span>
                          <h3 className="min-w-0 truncate text-[16px] font-black leading-tight text-slate-950">{deposit.label}</h3>
                        </div>
                      </div>
                      <ParentPrimaryButton type="button" tone={actionTone} onClick={() => setWithdrawTarget(deposit)} className="h-10 min-w-[76px] shrink-0 rounded-[14px] px-3 text-[14px]">
                        {isEarlyFixedDeposit ? '提前取出' : '取出'}
                      </ParentPrimaryButton>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-2">
                      <div className="min-h-[56px] rounded-[12px] border border-white/86 bg-white/70 px-3 py-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
                        <div className="text-[11px] font-bold leading-none text-slate-400">本金</div>
                        <div className="mt-1 flex items-center gap-1 tabular-nums text-[20px] font-black leading-none text-slate-950">
                          <img src="/assets/coin.png" alt="" className="h-4 w-4 shrink-0" />
                          <span>{formatCoin(deposit.amount)}</span>
                        </div>
                      </div>
                      <div className="min-h-[56px] rounded-[12px] border border-white/86 bg-white/62 px-3 py-2">
                        <div className="text-[11px] font-bold leading-none text-slate-400">{returnLabel}</div>
                        <div className={`mt-1 tabular-nums text-[21px] font-black leading-none ${valueClass}`}>{isCurrentDeposit ? '+' : ''}{formatCoin(returnValue)}</div>
                      </div>
                    </div>
                    {!isCurrentDeposit && (
                      <div className="mt-2 flex min-h-[34px] items-center justify-between gap-2 rounded-[12px] bg-white/38 px-3 py-1.5 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.62)]">
                        <span className="text-[11px] font-black leading-tight text-slate-400">定期到期日</span>
                        <span className="truncate tabular-nums text-[13px] font-black leading-tight text-slate-900">{details.availableAt ? formatDate(details.availableAt) : '-'}</span>
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
            <p className="mb-4 text-[12px] font-bold text-slate-400">{selectedBankScheme.productName} · 存期 {selectedBankScheme.termLabel} · 日利率 {formatDailyRate(selectedBankScheme.dailyRate)}</p>
            <div className="rounded-[20px] bg-slate-50/90 p-4">
              <div className="mb-3 flex items-end justify-between">
                <span className="text-[12px] font-bold text-slate-500">存入金额</span>
                <span className="tabular-nums text-[30px] font-black leading-none text-slate-900">{amount}</span>
              </div>
              <input
                type="range"
                min="1"
                max={Math.max(1, Math.floor(activeChild.availableCoins))}
                step="1"
                value={amount}
                onChange={event => setDepositAmount(event.target.value)}
                className="h-3 w-full rounded-full accent-[#0DB4F1]"
              />
              <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-400">
                <span>1</span>
                <span className="tabular-nums">最多 {Math.max(1, Math.floor(activeChild.availableCoins))}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-sky-50 p-3">
                <div className="text-[11px] font-bold text-sky-500/80">{selectedBankScheme.type === 'current' ? '单日利息' : '到期利息'}</div>
                <div className="mt-1 tabular-nums text-[20px] font-black text-sky-600">+{projectedInterest}</div>
              </div>
              <div className="rounded-[18px] bg-slate-50 p-3">
                <div className="text-[11px] font-bold text-slate-400">到期时间</div>
                <div className="mt-1 text-[15px] font-black text-slate-700">{selectedBankScheme.type === 'current' ? '随时取出' : formatDate(Date.now() + selectedBankScheme.days * 86400000)}</div>
              </div>
            </div>
            {selectedBankScheme.type === 'current' && (
              <div className="mt-3 rounded-[20px] bg-emerald-50 p-3">
                <div className="text-[12px] font-black text-emerald-700">活期收益预估</div>
                <div className="mt-3 grid grid-cols-4 gap-2">
                  {CURRENT_DEPOSIT_PROJECTION_DAYS.map(days => (
                    <div key={days} className="rounded-[14px] bg-white/80 px-2 py-2 text-center">
                      <div className="text-[11px] font-bold text-slate-400">{days}天后</div>
                      <div className="mt-1 tabular-nums text-[13px] font-black text-emerald-600">+{(amount * BANK_CONFIG.DAILY_RATE * days).toFixed(2)}</div>
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
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-slate-950/55 px-6 backdrop-blur-md" onClick={() => setShowDepositReview(false)}>
            <div className="w-full rounded-[30px] bg-white p-6 shadow-[0_28px_90px_-42px_rgba(15,23,42,0.85)]" onClick={event => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <ParentGradientIcon tone={selectedBankScheme.type === 'current' ? 'green' : 'blue'} size="lg" className="h-16 w-16 rounded-[22px]">
                  <FileText size={30} strokeWidth={2.4} />
                </ParentGradientIcon>
                <button type="button" onClick={() => setShowDepositReview(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400 transition-[transform,background-color] duration-150 ease-out active:scale-[0.96]">
                  <X size={20} />
                </button>
              </div>
              <h2 className="mt-5 text-[28px] font-black leading-tight text-balance text-slate-950">确认签署这份存单?</h2>
              <div className="mt-5 rounded-[26px] bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3 py-2 text-[14px] font-bold">
                  <span className="text-slate-400">签署计划</span>
                  <span className={`rounded-full px-3 py-1 text-[14px] font-black ${selectedBankScheme.type === 'current' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-600'}`}>{selectedBankScheme.label}</span>
                </div>
                <div className="flex items-center justify-between gap-3 py-2 text-[14px] font-bold">
                  <span className="text-slate-400">投入本金</span>
                  <span className="flex items-center gap-1 tabular-nums text-[20px] font-black text-slate-950"><img src="/assets/coin.png" alt="" className="h-5 w-5" />{amount}</span>
                </div>
                <div className="flex items-center justify-between gap-3 py-2 text-[14px] font-bold">
                  <span className="text-slate-400">预期利息</span>
                  <span className="flex items-center gap-1 tabular-nums text-[20px] font-black text-sky-600"><img src="/assets/coin.png" alt="" className="h-5 w-5" />+{projectedInterest}</span>
                </div>
                <div className="mt-2 border-t border-dashed border-slate-200 pt-3 text-[13px] font-black text-sky-600">
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
              <div className="mb-3 rounded-[18px] bg-orange-50 px-3 py-3 text-[13px] font-black text-orange-600">
                未到期取出将按活期利息计算
              </div>
            )}
            <div className="space-y-3 rounded-[20px] bg-slate-50/90 p-4">
              <div className="flex justify-between text-[14px] font-bold"><span className="text-slate-500">本金</span><span className="tabular-nums text-slate-900">{formatCoin(withdrawTarget.amount)}</span></div>
              <div className="flex justify-between text-[14px] font-bold">
                <span className="text-slate-500">{withdrawIsEarlyFixed ? '活期利息' : '利息'}</span>
                <span className="tabular-nums text-emerald-600">+{formatCoin(withdrawDetails?.interest ?? 0)}</span>
              </div>
              <div className="border-t border-dashed border-slate-200 pt-3 flex justify-between text-[15px] font-black">
                <span className="text-slate-600">到账金额</span>
                <span className="flex items-center gap-1 tabular-nums text-slate-950"><img src="/assets/coin.png" alt="" className="h-4 w-4" />{formatCoin(withdrawDetails?.withdrawalTotal ?? 0)}</span>
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
                <h1 className="truncate text-[20px] font-black leading-tight text-slate-950">{PARENT_PROFILE.name}</h1>
                <p className="mt-1 truncate text-[13px] font-bold text-slate-500">{PARENT_PROFILE.relation} · {PARENT_PROFILE.phone}</p>
              </div>
              <button type="button" onClick={() => setMineSheet('profile')} className={`flex h-10 shrink-0 items-center justify-center rounded-[14px] bg-slate-50 px-3 text-[13px] font-black text-slate-600 ${PARENT_PRESSABLE_CLASS}`} aria-label="查看家长信息">
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
                <button key={item.label} type="button" onClick={item.action} className={`flex min-h-[58px] w-full items-center gap-3 border-b border-slate-100 px-4 py-3 text-left last:border-b-0 ${PARENT_PRESSABLE_CLASS}`}>
                  <ParentGradientIcon tone={item.label === '隐私协议' ? 'blue' : 'softBlue'} size="sm">
                    <Icon size={16} strokeWidth={2.6} />
                  </ParentGradientIcon>
                  <span className="min-w-0 flex-1 truncate text-[15px] font-black text-slate-900">{item.label}</span>
                  <span className="max-w-[120px] truncate text-[13px] font-bold text-slate-400">{item.meta}</span>
                  <ChevronRight size={15} className="shrink-0 text-slate-300" />
                </button>
              );
            })}
          </ParentCard>

          <ParentSecondaryButton type="button" onClick={() => setMineSheet('logout')} tone="attentionSoft" fullWidth className="h-12 text-[15px]">
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
                <div key={label} className="flex min-h-[48px] items-center justify-between gap-4 rounded-[16px] bg-slate-50 px-4 py-3">
                  <span className="text-[13px] font-bold text-slate-400">{label}</span>
                  <span className="min-w-0 truncate text-right text-[15px] font-black text-slate-800">{value}</span>
                </div>
              ))}
            </div>
          </ParentBottomSheet>
        )}

        {mineSheet === 'privacy' && (
          <ParentBottomSheet title="隐私协议" onClose={() => setMineSheet(null)} className="pb-8">
            <div className="space-y-3 text-[14px] font-bold leading-relaxed text-slate-600">
              <p>我们仅收集登录、绑定学生、查看成长记录所必需的信息，用于展示孩子在校评价、成长报告和积分账户。</p>
              <p>未经授权，不会向无关第三方共享家长手机号、学生身份信息和成长记录。</p>
              <p>如需注销或更正信息，可联系学校管理员处理。</p>
            </div>
          </ParentBottomSheet>
        )}

        {mineSheet === 'logout' && (
          <ParentBottomSheet title="退出登录" onClose={() => setMineSheet(null)} className="pb-8">
            <p className="text-[15px] font-bold leading-relaxed text-slate-600">退出后需要重新完成登录或绑定流程。</p>
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
                className={`student-switcher-card relative w-full overflow-hidden !p-0 ${isCurrentChild ? 'border-emerald-200 bg-emerald-50/55 shadow-[0_16px_34px_-30px_rgba(16,185,129,0.58)]' : 'border-slate-100 bg-slate-50/80 shadow-none'}`}
              >
                {isCurrentChild && <div className="absolute inset-y-0 left-0 w-1 bg-emerald-400" aria-hidden="true" />}
                <div className="flex min-h-[72px] items-center gap-3 px-4 py-2">
                  <ParentChildAvatar name={child.name} src={child.avatar} alt={`${child.name}头像`} className="h-12 w-12 rounded-[15px]" />
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[17px] font-black leading-tight text-slate-950">{child.name}</div>
                    <div className="mt-1.5 truncate text-[14px] font-bold leading-snug text-slate-500">{child.className}</div>
                  </div>
                  {isCurrentChild ? (
                    <span className="inline-flex h-9 min-w-[58px] shrink-0 items-center justify-center rounded-[14px] bg-white/82 px-3 text-[13px] font-black text-emerald-700 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]">
                      当前
                    </span>
                  ) : (
                    <ParentSecondaryButton
                      type="button"
                      onClick={() => { setActiveChildId(child.id); setShowChildSwitcher(false); }}
                      className="h-9 min-h-9 min-w-[58px] shrink-0 px-3 text-[13px]"
                    >
                      切换
                    </ParentSecondaryButton>
                  )}
                </div>
              </ParentCard>
            );
          })}
        </div>
        <ParentSecondaryButton type="button" onClick={() => openBinding('switcher')} fullWidth tone="neutral" className="mt-3 h-11 min-h-11 text-[15px]">
          <Plus size={17} /> 绑定其他孩子
        </ParentSecondaryButton>
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
                  <span className="block truncate text-[15px] font-black leading-5 text-slate-950">{questionnaire.title}</span>
                  <span className={`mt-1 block truncate text-[12px] font-bold ${isQuestionnaireOverdue(questionnaire) ? 'text-amber-600' : 'text-slate-400'}`}>
                    {questionnaire.creatorName} · {questionnaire.suggestedDeadline
                      ? questionnaire.suggestedDeadline.replace('2026-', '').replace('-', '月').replace(' ', '日 ')
                      : '不限时间'}
                  </span>
                </span>
                <span className="flex h-10 min-w-[62px] shrink-0 items-center justify-center rounded-[14px] border border-[#BFEAED] bg-white px-3 text-[15px] font-black text-[#0797A8] shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">填写</span>
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
                <span className="min-w-0 flex-1 truncate text-[16px] font-extrabold leading-5 text-slate-950">{questionnaire.label}</span>
                <span className="flex h-10 min-w-[62px] shrink-0 items-center justify-center rounded-[14px] border border-[#BFEAED] bg-white px-3 text-[15px] font-black text-[#0797A8] shadow-[inset_0_1px_0_rgba(255,255,255,0.86)]">
                  填写
                </span>
              </button>
            </ParentCard>
          )) : pendingAssignedQuestionnaires.length === 0 ? (
            <ParentCard as="section" className="p-8 text-center">
              <ParentGradientIcon tone="softBlue" size="lg" className="mx-auto mb-3">
                <CheckCircle2 size={24} />
              </ParentGradientIcon>
              <div className="text-[17px] font-black text-slate-700">暂无待办</div>
            </ParentCard>
          ) : null}
        </section>
      </ParentPageShell>
    );
  };

  const renderScreen = () => {
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
          onBack={() => setScreen('todo')}
          onSubmitted={() => {
            setSharedQuestionnaires(readQuestionnaires());
            setSubmitSuccessMessage('问卷提交成功');
            setScreen('growth');
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

  const tabItems: { key: Screen; label: string; icon: React.ElementType }[] = [
    { key: 'growth', label: '成长', icon: Star },
    { key: 'reports', label: '报告', icon: FileText },
    { key: 'mine', label: '我的', icon: UserRound },
  ];

  const hasParentOverlay = showChildSwitcher || showDepositConfirm || showDepositReview || showQuestionnaireSubmitConfirm || Boolean(withdrawTarget) || Boolean(mineSheet);
  const showTabs = activeChild && (screen === 'growth' || screen === 'reports' || screen === 'mine') && !hasParentOverlay;
  const SubmitSuccessToast = () => {
    if (!submitSuccessMessage) return null;
    return (
      <div className="pointer-events-none absolute bottom-24 left-1/2 z-[120] -translate-x-1/2 rounded-full bg-slate-950/88 px-4 py-2 text-[14px] font-black text-white shadow-[0_18px_44px_-28px_rgba(15,23,42,0.9)]" role="status" aria-live="polite">
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
        ref={parentTabbarRef}
        className="ai-tabbar-container"
        aria-label="家长端底部导航"
      >
        <TeacherFluidGlassNav activeIndex={parentNavActiveIndex} itemCount={tabItems.length} jellyToggle={parentNavJellyToggle} tabbarWidth={parentTabbarWidth} />
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
              className="tabbar-item-btn"
            >
              <div className={`flex flex-col items-center justify-center gap-1 transition-[transform,opacity,color] duration-300 ease-out active:scale-[0.96] ${active ? 'text-emerald-600 font-bold scale-105 opacity-100' : 'text-slate-400 font-medium scale-100 opacity-70'}`}>
                <div className="tabbar-icon-wrap">
                  <Icon className="w-5 h-5" strokeWidth={active ? 2.65 : 2.25} />
                </div>
                <span className="tabbar-item-label">{item.label}</span>
              </div>
            </button>
          );
        })}
      </nav>
    );
  };

  return (
    <div className="w-screen h-[100dvh] bg-[#EEF2F6] flex items-center justify-center p-4">
      <PhoneMockup showDeviceFrame={showPhoneShell} contentTopInsetMode="status-bar" screenBackground={<ParentDiffuseBackdrop />}>
        <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent font-sans">
          {renderScreen()}
          {showTabs && renderParentBottomNav()}
          <SubmitSuccessToast />
          <ChildSwitcherSheet />
        </div>
      </PhoneMockup>
    </div>
  );
};

export default ParentApp;
