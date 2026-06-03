import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BookOpenCheck,
  CalendarDays,
  CheckCircle2,
  Clock,
  FileText,
  Landmark,
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
import '../mobile-app/styles/navigation.css';
import '../mobile-app/styles/teacherMobileTokens.css';
import { BANK_CONFIG } from '../constants';
import { ASSETS } from '../mobile-app/assets/images';

interface ParentAppProps {
  showPhoneShell?: boolean;
}

type Screen = 'binding' | 'growth' | 'reports' | 'reportDetail' | 'bank';
type ReportType = 'month' | 'term';
type BankTab = 'deposit' | 'list';

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
}

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
}

const createDemoChild = (name: string, schoolCode: string, studentNo: string, index: number): ChildProfile => {
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
      { id: `deposit-${index}-week`, type: 'fixed', amount: 120, startDate: Date.now() - 86400000 * 4, termDays: 7, interestRate: 0.01, label: '定期存单-1周' },
    ],
    reports: [
      { id: `report-${index}-month`, type: 'month', title: '月度报告', period: '2026 年 5 月', summary: '本月整体表现稳定，劳动与德育维度持续领先，体育维度建议继续关注。', highlights: ['表扬行为更集中在公共责任', '科学记录质量提升明显', '课间安全提醒后改善较快'] },
      { id: `report-${index}-term`, type: 'term', title: '期末报告', period: '2025-2026 学年下学期', summary: '综合素质发展均衡，能在班级公共事务中承担稳定角色。', highlights: ['五育发展较均衡', '课堂表达更主动', '建议持续建立运动习惯'] },
    ],
  };
};


const PARENT_SCREEN_CLASS = 'relative flex-1 overflow-y-auto no-scrollbar bg-transparent';
const BINDING_INPUT_CLASS = 'w-full h-[52px] rounded-[16px] border border-[#D8EEF0] bg-white/95 px-4 text-[16px] font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-colors focus:border-[#0DB4F1] focus:ring-4 focus:ring-cyan-100/70';
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
const formatDailyRate = (rate: number) => `${Number((rate * 100).toFixed(2))}%`;

const ParentDiffuseBackdrop = () => (
  <div aria-hidden="true" className="parent-teacher-token-backdrop pointer-events-none absolute inset-0 overflow-hidden" />
);

const ParentApp: React.FC<ParentAppProps> = ({ showPhoneShell = true }) => {
  const [screen, setScreen] = useState<Screen>('binding');
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [activeChildId, setActiveChildId] = useState('');
  const [showChildSwitcher, setShowChildSwitcher] = useState(false);
  const [activeReportId, setActiveReportId] = useState('');
  const [bindForm, setBindForm] = useState({ schoolCode: '', studentName: '', studentNo: '' });
  const [bindingReturnTarget, setBindingReturnTarget] = useState<'none' | 'switcher'>('none');
  const [bindingReturnScreen, setBindingReturnScreen] = useState<Screen>('growth');
  const [depositAmount, setDepositAmount] = useState('60');
  const [activeBankTab, setActiveBankTab] = useState<BankTab>('deposit');
  const [selectedBankScheme, setSelectedBankScheme] = useState<ParentBankScheme | null>(PARENT_BANK_TERMS[0]);
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [showDepositReview, setShowDepositReview] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<ParentDeposit | null>(null);
  const [parentNavActiveIndex, setParentNavActiveIndex] = useState(0);
  const [, setParentNavSlideDirection] = useState<'left' | 'right' | 'none'>('none');
  const [parentNavJellyToggle, setParentNavJellyToggle] = useState<'a' | 'b' | 'none'>('none');
  const parentTabbarRef = useRef<HTMLDivElement>(null);
  const [parentTabbarWidth, setParentTabbarWidth] = useState(320);

  const activeChild = useMemo(
    () => childrenList.find(child => child.id === activeChildId) ?? childrenList[0] ?? null,
    [activeChildId, childrenList]
  );

  const activeReport = activeChild?.reports.find(report => report.id === activeReportId) ?? activeChild?.reports[0] ?? null;

  const getParentActiveTabIndex = (nextScreen: Screen) => {
    if (nextScreen === 'reports' || nextScreen === 'reportDetail') return 1;
    if (nextScreen === 'bank') return 2;
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

  const formatCoin = (value: number) => value.toFixed(2);

  const getDepositInterest = (deposit: ParentDeposit) => {
    const elapsedDays = Math.max(0, Math.floor((Date.now() - deposit.startDate) / 86400000));
    const matured = deposit.type === 'current' || elapsedDays >= deposit.termDays;
    const interest = deposit.type === 'current' || !matured
      ? deposit.amount * BANK_CONFIG.DAILY_RATE * elapsedDays
      : deposit.amount * deposit.interestRate;
    return { elapsedDays, matured, interest: Number(interest.toFixed(2)) };
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
    const finalAmount = Math.round(deposit.amount + details.interest);
    setChildrenList(prev => prev.map(child => child.id === activeChild.id ? {
      ...child,
      availableCoins: child.availableCoins + finalAmount,
      bankBalance: Math.max(0, child.bankBalance - deposit.amount),
      deposits: child.deposits.filter(item => item.id !== deposit.id),
    } : child));
    setWithdrawTarget(null);
  };

  const Header = ({ title, subtitle, showBack = false, backLabel = '返回报告列表', onBack }: { title: string; subtitle?: string; showBack?: boolean; backLabel?: string; onBack?: () => void }) => (
    <div className="sticky top-0 z-40 flex h-[44px] shrink-0 items-center justify-between border-b border-white/40 bg-white/20 px-4 py-2 backdrop-blur-xl">
      <div className="relative flex h-full w-full items-center justify-center">
        {showBack && (
          <button type="button" onClick={onBack ?? (() => setScreen('reports'))} className="absolute left-0 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm transition-transform active:scale-95" aria-label={backLabel}>
            <ArrowLeft size={18} />
          </button>
        )}
        <h1 className="max-w-[220px] truncate text-center text-[17px] font-bold leading-tight text-slate-900">{title}</h1>
      </div>
    </div>
  );

  const GrowthChildProfileCard = () => {
    if (!activeChild) return null;
    return (
      <ParentCard as="section" className="mx-5 mt-4 p-4">
        <div className="flex items-center gap-3.5">
          <ParentChildAvatar
            name={activeChild.name}
            src={activeChild.avatar}
            alt={`${activeChild.name}头像`}
            className="h-[68px] w-[68px] rounded-[24px] border-2 border-white bg-slate-50 shadow-[0_14px_28px_-18px_rgba(15,23,42,0.55)]"
          />
          <div className="min-w-0 flex-1">
            <h2 className="truncate text-[18px] font-black leading-tight tracking-tight text-slate-950">{activeChild.name}</h2>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-[12px] font-bold text-slate-500">
              <span className="rounded-full bg-slate-50 px-2.5 py-1 text-slate-700">{activeChild.className}</span>
              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-blue-600">{activeChild.studentNo}</span>
            </div>
          </div>
          <ParentSecondaryButton
            type="button"
            onClick={() => setShowChildSwitcher(true)}
            className="min-h-9 shrink-0 px-3 text-[13px]"
            aria-label="切换孩子"
          >
            切换
          </ParentSecondaryButton>
        </div>
      </ParentCard>
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
            <span className="text-[52px] font-black leading-none tracking-[-0.08em] text-blue-600">{netScore}</span>
            <span className="ml-2 text-[18px] font-black text-slate-300">分</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="flex items-center justify-center gap-2 rounded-[18px] border border-emerald-100 bg-emerald-50/80 px-2 py-2">
              <ParentGradientIcon tone="green" size="sm">
                <CheckCircle2 size={16} />
              </ParentGradientIcon>
              <div className="text-left">
                <div className="text-[11px] font-black text-emerald-500">表扬</div>
                <div className="mt-0.5 text-[17px] font-black text-emerald-600">{positiveCount}<span className="ml-0.5 text-[11px]">次</span></div>
              </div>
            </div>
            <div className="flex items-center justify-center gap-2 rounded-[18px] border border-orange-100 bg-orange-50/75 px-2 py-2">
              <ParentGradientIcon tone="orange" size="sm">
                <Clock size={16} />
              </ParentGradientIcon>
              <div className="text-left">
                <div className="text-[11px] font-black text-orange-500">待改进</div>
                <div className="mt-0.5 text-[17px] font-black text-orange-500">{improveCount}<span className="ml-0.5 text-[11px]">次</span></div>
              </div>
            </div>
          </div>
        </ParentCard>

        <ParentCard as="article" className="min-h-[154px] p-4 shadow-[0_18px_46px_-36px_rgba(249,115,22,0.55)]">
          <div className="text-[13px] font-black text-orange-500">预估分红总额</div>
          <div className="mt-5 flex items-center justify-center gap-2">
            <img src="/assets/coin.png" alt="" className="h-9 w-9 shrink-0" />
            <span className="text-[42px] font-black leading-none tracking-[-0.08em] text-orange-500">{totalReward.toFixed(2)}</span>
          </div>
          <div className="mt-5 grid grid-cols-[1fr_auto_1fr] items-center gap-2">
            <div className="rounded-[18px] border border-orange-100 bg-white/76 px-2 py-2 text-center">
              <div className="text-[11px] font-black text-orange-500/80">成长奖励</div>
              <div className="mt-1 flex items-center justify-center gap-1 text-[16px] font-black text-orange-500">
                <img src="/assets/coin.png" alt="" className="h-4 w-4" />{growthReward}
              </div>
            </div>
            <div className="text-[18px] font-black text-orange-300">+</div>
            <div className="rounded-[18px] border border-orange-100 bg-white/76 px-2 py-2 text-center">
              <div className="text-[11px] font-black text-orange-500/80">得分奖励</div>
              <div className="mt-1 flex items-center justify-center gap-1 text-[16px] font-black text-orange-500">
                <img src="/assets/coin.png" alt="" className="h-4 w-4" />{scoreReward}
              </div>
            </div>
          </div>
        </ParentCard>
      </section>
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
              <button type="button" onClick={() => { setActiveReportId(report.id); setScreen('reportDetail'); }} className="w-full p-4 text-left transition-transform active:scale-[0.99]">
                <div className="flex items-start gap-3">
                  <ParentGradientIcon tone={report.type === 'month' ? 'blue' : 'green'} size="lg">
                    {report.type === 'month' ? <CalendarDays size={23} /> : <BookOpenCheck size={23} />}
                  </ParentGradientIcon>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-3">
                      <h2 className="text-[16px] font-black text-slate-900">{report.title}</h2>
                      <ArrowRight size={16} className="text-slate-300" />
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

  const ReportDetail = () => {
    if (!activeChild || !activeReport) return <Reports />;
    return (
      <ParentPageShell className="pb-28">
        <Header title="报告详情" subtitle={`${activeReport.title} · ${activeReport.period}`} showBack />
        <ParentCard className="mx-5 mt-5 p-5" as="section">
          <ParentGradientIcon tone={activeReport.type === 'month' ? 'blue' : 'green'} size="lg" className="mb-5">
            {activeReport.type === 'month' ? <CalendarDays size={24} /> : <BookOpenCheck size={24} />}
          </ParentGradientIcon>
          <h2 className="text-[24px] font-black text-slate-950">{activeReport.title}</h2>
          <p className="mt-1 text-[13px] font-bold text-emerald-600">{activeChild.name} · {activeReport.period}</p>
          <p className="mt-5 text-[15px] leading-relaxed text-slate-600">{activeReport.summary}</p>
          <div className="mt-5 space-y-2">
            {activeReport.highlights.map(item => (
              <div key={item} className="flex items-start gap-2 rounded-[18px] bg-emerald-50/70 p-3">
                <CheckCircle2 size={17} className="mt-0.5 text-emerald-600 shrink-0" />
                <span className="text-[13px] leading-relaxed font-medium text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </ParentCard>
      </ParentPageShell>
    );
  };

  const Bank = () => {
    if (!activeChild) return <Binding />;
    const amount = Math.max(1, Math.min(Number(depositAmount) || 1, activeChild.availableCoins));
    const projectedInterest = calculateProjectedInterest(amount, selectedBankScheme);
    const bankTopSpacing = showPhoneShell ? 'mt-14' : 'mt-5';

    return (
      <ParentPageShell className="pb-28">
        <ParentCard as="section" className={`parent-bank-balance-strip sticky top-0 z-30 mx-5 px-4 py-2 backdrop-blur-xl ${bankTopSpacing}`}>
          <div className="flex min-h-10 items-center text-slate-600">
            <div className="flex flex-1 items-center justify-center gap-1.5">
              <span className="text-[14px] font-black">钱包</span>
              <img src="/assets/coin.png" alt="" className="h-4 w-4 shrink-0" />
              <span className="text-[16px] font-black leading-none">{formatCoin(activeChild.availableCoins)}</span>
            </div>
            <div className="h-5 w-px bg-slate-200" aria-hidden="true" />
            <div className="flex flex-1 items-center justify-center gap-1.5">
              <span className="text-[14px] font-black">存款</span>
              <img src="/assets/coin.png" alt="" className="h-4 w-4 shrink-0" />
              <span className="text-[16px] font-black leading-none">{formatCoin(activeChild.bankBalance)}</span>
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
                <Icon size={16} /> {item.label}
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
                    <button key={scheme.label} type="button" onClick={() => { setSelectedBankScheme(scheme); setShowDepositConfirm(true); }} className={`flex w-full items-center justify-between rounded-[18px] border px-4 py-3 text-left transition-colors active:scale-[0.99] ${active ? (isCurrent ? 'border-emerald-300 bg-emerald-50/90' : 'border-sky-300 bg-sky-50/90') : 'border-slate-100 bg-slate-50/80'}`}>
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
          <section className="mx-5 mt-4 space-y-3">
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
              const progress = deposit.type === 'current' ? 100 : Math.min(100, Math.floor((details.elapsedDays / deposit.termDays) * 100));
              return (
                <ParentCard key={deposit.id} as="article" className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="mb-1 text-[11px] font-bold text-sky-500">{deposit.type === 'current' ? '活期存单' : '定期存单'}</div>
                      <h3 className="text-[17px] font-black text-slate-900">{deposit.label}</h3>
                    </div>
                    <ParentGradientIcon tone={details.matured ? 'green' : 'softBlue'} size="md">
                      {details.matured ? <BadgeCheck size={19} /> : <Clock size={19} />}
                    </ParentGradientIcon>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-[18px] bg-slate-50/90 p-3">
                      <div className="text-[11px] font-bold text-slate-400">本金</div>
                      <div className="mt-1 flex items-center gap-1.5 text-[22px] font-black text-slate-900">
                        <img src="/assets/coin.png" alt="" className="h-5 w-5 shrink-0" />
                        <span>{deposit.amount}</span>
                      </div>
                    </div>
                    <div className="rounded-[18px] bg-emerald-50/90 p-3">
                      <div className="text-[11px] font-bold text-emerald-600/70">已得利息</div>
                      <div className="mt-1 text-[22px] font-black text-emerald-600">+{details.interest}</div>
                    </div>
                  </div>
                  {deposit.type === 'fixed' && (
                    <div className="mt-4">
                      <div className="mb-2 flex justify-between text-[11px] font-bold text-slate-400">
                        <span>进度</span><span>{progress}%</span>
                      </div>
                      <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                        <div className="h-full rounded-full bg-gradient-to-r from-[#0DB4F1] to-[#18D0A8]" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                  <ParentPrimaryButton type="button" onClick={() => setWithdrawTarget(deposit)} fullWidth className="mt-4 h-12">
                    取出
                  </ParentPrimaryButton>
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
                <span className="text-[30px] font-black leading-none text-slate-900">{amount}</span>
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
                <span>最多 {Math.max(1, Math.floor(activeChild.availableCoins))}</span>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="rounded-[18px] bg-sky-50 p-3">
                <div className="text-[11px] font-bold text-sky-500/80">{selectedBankScheme.type === 'current' ? '单日利息' : '到期利息'}</div>
                <div className="mt-1 text-[20px] font-black text-sky-600">+{projectedInterest}</div>
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
                      <div className="mt-1 text-[13px] font-black text-emerald-600">+{(amount * BANK_CONFIG.DAILY_RATE * days).toFixed(2)}</div>
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
            <div className="w-full rounded-[34px] bg-white p-6 shadow-[0_28px_90px_-42px_rgba(15,23,42,0.85)]" onClick={event => event.stopPropagation()}>
              <div className="flex items-start justify-between gap-4">
                <ParentGradientIcon tone={selectedBankScheme.type === 'current' ? 'green' : 'blue'} size="lg" className="h-16 w-16 rounded-[22px]">
                  <FileText size={30} strokeWidth={2.4} />
                </ParentGradientIcon>
                <button type="button" onClick={() => setShowDepositReview(false)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-50 text-slate-400">
                  <X size={20} />
                </button>
              </div>
              <h2 className="mt-5 text-[28px] font-black leading-tight tracking-[-0.04em] text-slate-950">确认签署这份存单?</h2>
              <div className="mt-5 rounded-[26px] bg-slate-50 p-4">
                <div className="flex items-center justify-between gap-3 py-2 text-[14px] font-bold">
                  <span className="text-slate-400">签署计划</span>
                  <span className={`rounded-full px-3 py-1 text-[14px] font-black ${selectedBankScheme.type === 'current' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-600'}`}>{selectedBankScheme.label}</span>
                </div>
                <div className="flex items-center justify-between gap-3 py-2 text-[14px] font-bold">
                  <span className="text-slate-400">投入本金</span>
                  <span className="flex items-center gap-1 text-[20px] font-black text-slate-950"><img src="/assets/coin.png" alt="" className="h-5 w-5" />{amount}</span>
                </div>
                <div className="flex items-center justify-between gap-3 py-2 text-[14px] font-bold">
                  <span className="text-slate-400">预期利息</span>
                  <span className="flex items-center gap-1 text-[20px] font-black text-sky-600"><img src="/assets/coin.png" alt="" className="h-5 w-5" />+{projectedInterest}</span>
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
            <div className="space-y-3 rounded-[20px] bg-slate-50/90 p-4">
              <div className="flex justify-between text-[14px] font-bold"><span className="text-slate-500">本金</span><span className="text-slate-900">{withdrawTarget.amount}</span></div>
              <div className="flex justify-between text-[14px] font-bold"><span className="text-slate-500">利息</span><span className="text-emerald-600">+{getDepositInterest(withdrawTarget).interest}</span></div>
            </div>
            <ParentPrimaryButton type="button" onClick={() => withdrawDeposit(withdrawTarget)} fullWidth className="mt-4 h-[52px] text-[16px]">
              确认取出
            </ParentPrimaryButton>
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
          {childrenList.map(child => (
            <ParentCard
              key={child.id}
              as="article"
              className={`student-switcher-card w-full p-4 ${child.id === activeChildId ? 'border-emerald-200 bg-emerald-50/40' : ''}`}
            >
              <div className="flex items-center gap-3">
                <ParentChildAvatar name={child.name} src={child.avatar} alt={`${child.name}头像`} className="h-11 w-11 rounded-[14px]" />
                <div className="min-w-0 flex-1">
                  <div className="truncate text-[16px] font-black leading-tight text-slate-950">{child.name}</div>
                  <div className="mt-2 flex min-w-0 items-center gap-2 whitespace-nowrap text-[12px] font-bold text-slate-500">
                    <span className="shrink-0 text-slate-300">所在班级</span>
                    <span className="max-w-[92px] truncate text-slate-700">{child.className}</span>
                    <span className="shrink-0 text-slate-300">学号</span>
                    <span className="max-w-[54px] truncate text-slate-700">{child.studentNo}</span>
                  </div>
                </div>
                <ParentSecondaryButton
                  type="button"
                  onClick={() => { setActiveChildId(child.id); setShowChildSwitcher(false); }}
                  disabled={child.id === activeChildId}
                  className="h-9 min-h-9 min-w-[58px] shrink-0 px-3 text-[13px]"
                >
                  {child.id === activeChildId ? '当前' : '切换'}
                </ParentSecondaryButton>
              </div>
            </ParentCard>
          ))}
        </div>
        <ParentPrimaryButton type="button" onClick={() => openBinding('switcher')} fullWidth className="mt-4 h-[52px] text-[16px]">
          <Plus size={18} /> 新增绑定
        </ParentPrimaryButton>
      </ParentBottomSheet>
    );
  };

  const renderScreen = () => {
    if (screen === 'binding') return Binding();
    if (screen === 'reports') return Reports();
    if (screen === 'reportDetail') return ReportDetail();
    if (screen === 'bank') return Bank();
    return Growth();
  };

  const tabItems: { key: Screen; label: string; icon: React.ElementType }[] = [
    { key: 'growth', label: '成长', icon: Star },
    { key: 'reports', label: '报告', icon: FileText },
    { key: 'bank', label: '银行', icon: Landmark },
  ];

  const hasParentOverlay = showChildSwitcher || showDepositConfirm || showDepositReview || Boolean(withdrawTarget);
  const showTabs = activeChild && screen !== 'binding' && !hasParentOverlay;
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
              <div className={`flex flex-col items-center justify-center gap-1 transition-all duration-300 active:scale-95 ${active ? 'text-emerald-600 font-bold scale-105 opacity-100' : 'text-slate-400 font-medium scale-100 opacity-70'}`}>
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
          <ChildSwitcherSheet />
        </div>
      </PhoneMockup>
    </div>
  );
};

export default ParentApp;
