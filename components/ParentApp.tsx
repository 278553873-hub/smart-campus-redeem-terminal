import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  BookOpenCheck,
  Calendar,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  CircleMinus,
  CirclePlus,
  Clock,
  FileText,
  HeartHandshake,
  Landmark,
  Layers,
  ListFilter,
  PiggyBank,
  Plus,
  ShieldCheck,
  Star,
  Timer,
  UserRound,
  WalletCards,
  X,
} from 'lucide-react';
import PhoneMockup from './PhoneMockup';
import ParentFluidGlassNav from './parent-app/ParentFluidGlassNav';
import { BANK_CONFIG } from '../constants';

interface ParentAppProps {
  showPhoneShell?: boolean;
}

type Screen = 'login' | 'binding' | 'growth' | 'reports' | 'reportDetail' | 'bank';
type EvaluationFilter = 'all' | 'positive' | 'negative';
type GrowthPeriod = 'week' | 'month' | 'term';
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
  const safeStudentNo = studentNo.trim() || `${202600 + index}`;
  const scoreOffset = index % 2 === 0 ? 0 : 4;
  const now = Date.now();
  const dayAgo = (days: number) => now - days * 86400000;
  return {
    id: `child-${Date.now()}-${index}`,
    name: safeName,
    gender: index % 2 === 0 ? 'male' : 'female',
    schoolCode: safeSchoolCode,
    school: `${safeSchoolCode} 实验学校`,
    className: index % 2 === 0 ? '四年级 2 班' : '二年级 1 班',
    studentNo: safeStudentNo,
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


const PARENT_SCREEN_CLASS = 'relative z-10 flex-1 overflow-y-auto no-scrollbar bg-transparent';
const BINDING_INPUT_CLASS = 'w-full h-[52px] rounded-[16px] bg-slate-50 border border-slate-100 px-4 text-[16px] font-bold text-slate-800 placeholder:text-slate-300 outline-none transition-colors focus:bg-slate-50 focus:border-[#F97316]';

const ParentDiffuseBackdrop = () => (
  <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden bg-[linear-gradient(180deg,#FFF2B8_0%,#FFFDF2_34%,#F4FBF1_100%)]">
    <div className="absolute -top-28 -left-24 h-80 w-80 rounded-full bg-[#FFF2B8]/56 blur-[70px]" />
    <div className="absolute -top-20 right-[-88px] h-72 w-72 rounded-full bg-[#FFD1B8]/55 blur-[76px]" />
    <div className="absolute top-[18%] left-[-120px] h-80 w-80 rounded-full bg-[#E7F8D7]/48 blur-[82px]" />
    <div className="absolute top-[30%] right-[-140px] h-96 w-96 rounded-full bg-[#DFF6D6]/54 blur-[92px]" />
    <div className="absolute bottom-[-160px] left-[6%] h-96 w-96 rounded-full bg-[#FFFDF2]/86 blur-[72px]" />
  </div>
);

const dimensionTone: Record<string, string> = {
  德育: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  智育: 'bg-sky-50 text-sky-700 border-sky-100',
  体育: 'bg-orange-50 text-orange-700 border-orange-100',
  美育: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-100',
  劳动: 'bg-amber-50 text-amber-700 border-amber-100',
};

const ParentApp: React.FC<ParentAppProps> = ({ showPhoneShell = true }) => {
  const [screen, setScreen] = useState<Screen>('login');
  const [childrenList, setChildrenList] = useState<ChildProfile[]>([]);
  const [activeChildId, setActiveChildId] = useState('');
  const [showChildSwitcher, setShowChildSwitcher] = useState(false);
  const [growthPeriod, setGrowthPeriod] = useState<GrowthPeriod>('week');
  const [evaluationFilter, setEvaluationFilter] = useState<EvaluationFilter>('all');
  const [visibleRecordCount, setVisibleRecordCount] = useState(6);
  const [activeReportId, setActiveReportId] = useState('');
  const [bindForm, setBindForm] = useState({ schoolCode: '', studentName: '', studentNo: '' });
  const [bindingReturnTarget, setBindingReturnTarget] = useState<'none' | 'switcher'>('none');
  const [bindingReturnScreen, setBindingReturnScreen] = useState<Screen>('growth');
  const [showStudentBindFields, setShowStudentBindFields] = useState(false);
  const [depositAmount, setDepositAmount] = useState('60');
  const [activeBankTab, setActiveBankTab] = useState<BankTab>('deposit');
  const [selectedBankScheme, setSelectedBankScheme] = useState<(typeof BANK_CONFIG.TERMS)[number] | null>(BANK_CONFIG.TERMS[0]);
  const [showDepositConfirm, setShowDepositConfirm] = useState(false);
  const [withdrawTarget, setWithdrawTarget] = useState<ParentDeposit | null>(null);
  const [navTransition, setNavTransition] = useState({ id: 0, direction: 1, fromIndex: 0 });

  const activeChild = useMemo(
    () => childrenList.find(child => child.id === activeChildId) ?? childrenList[0] ?? null,
    [activeChildId, childrenList]
  );

  const activeReport = activeChild?.reports.find(report => report.id === activeReportId) ?? activeChild?.reports[0] ?? null;

  const periodRecords = useMemo(() => {
    if (!activeChild) return [];
    const now = Date.now();
    const periodDays: Record<GrowthPeriod, number> = {
      week: 7,
      month: 31,
      term: 180,
    };
    const cutoff = now - periodDays[growthPeriod] * 86400000;
    return activeChild.records.filter(record => record.createdAt >= cutoff);
  }, [activeChild, growthPeriod]);

  const stats = useMemo(() => {
    return periodRecords.reduce(
      (acc, record) => ({
        positive: acc.positive + (record.score > 0 ? 1 : 0),
        negative: acc.negative + (record.score < 0 ? 1 : 0),
        net: acc.net + record.score,
      }),
      { positive: 0, negative: 0, net: 0 }
    );
  }, [periodRecords]);

  const filteredRecords = useMemo(() => {
    if (evaluationFilter === 'positive') return periodRecords.filter(record => record.score > 0);
    if (evaluationFilter === 'negative') return periodRecords.filter(record => record.score < 0);
    return periodRecords;
  }, [evaluationFilter, periodRecords]);

  const visibleRecords = useMemo(
    () => filteredRecords.slice(0, visibleRecordCount),
    [filteredRecords, visibleRecordCount]
  );

  useEffect(() => {
    setVisibleRecordCount(6);
  }, [activeChildId, evaluationFilter, growthPeriod]);

  const handleGrowthScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const target = event.currentTarget;
    const distanceToBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
    if (distanceToBottom > 120) return;
    setVisibleRecordCount(prev => Math.min(prev + 5, filteredRecords.length));
  };

  const growthPeriodLabel: Record<GrowthPeriod, string> = {
    week: '本周',
    month: '本月',
    term: '本学期',
  };

  const updateBindForm = (field: keyof typeof bindForm, value: string) => {
    setBindForm(prev => ({ ...prev, [field]: value }));
    if (field === 'schoolCode') {
      setShowStudentBindFields(false);
    }
  };

  const revealStudentBindFields = (schoolCode = bindForm.schoolCode) => {
    setShowStudentBindFields(schoolCode.trim().length > 0);
  };

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
    setShowStudentBindFields(false);
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

  const formatCoin = (value: number) => Number.isInteger(value) ? value : Number(value.toFixed(2));

  const getDepositInterest = (deposit: ParentDeposit) => {
    const elapsedDays = Math.max(0, Math.floor((Date.now() - deposit.startDate) / 86400000));
    const matured = deposit.type === 'current' || elapsedDays >= deposit.termDays;
    const interest = deposit.type === 'current' || !matured
      ? deposit.amount * BANK_CONFIG.DAILY_RATE * elapsedDays
      : deposit.amount * deposit.interestRate;
    return { elapsedDays, matured, interest: Number(interest.toFixed(2)) };
  };

  const calculateProjectedInterest = (amount: number, scheme: (typeof BANK_CONFIG.TERMS)[number] | null) => {
    if (!scheme) return 0;
    return Number((amount * scheme.rate).toFixed(2));
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
    <div className="sticky top-0 z-40 flex h-[44px] shrink-0 items-center justify-between border-b border-white/50 bg-white/90 px-4 py-2 backdrop-blur-xl">
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

  const MainStudentTitleBar = () => {
    if (!activeChild) return null;
    return (
      <div className="wechat-titlebar-student sticky top-0 z-40 flex h-[58px] shrink-0 items-center bg-transparent px-5 pt-2">
        <button type="button" aria-label="切换孩子" onClick={() => setShowChildSwitcher(true)} className="student-summary-topbar flex min-w-0 items-center gap-2.5 rounded-full pr-2 text-left transition-transform active:scale-[0.98]">
          <div className={`h-11 w-11 shrink-0 rounded-full bg-gradient-to-br ${activeChild.avatarTone} flex items-center justify-center text-white text-[18px] font-black ring-2 ring-white shadow-sm`}>
              {activeChild.name.slice(0, 1)}
          </div>
          <span className="max-w-[150px] truncate text-[21px] font-black leading-none tracking-tight text-slate-900">{activeChild.name}</span>
          <ChevronDown size={22} strokeWidth={2.5} className="shrink-0 text-slate-900" />
        </button>
      </div>
    );
  };

  const Login = () => (
    <div className="relative z-10 flex-1 px-7 py-8 flex flex-col justify-between overflow-hidden">
      <div className="absolute -top-24 -right-24 w-72 h-72 rounded-full bg-[#FFD7BE]/30 blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full bg-[#E7F8D7]/34 blur-3xl" />
      <div className="relative z-10 pt-8">
        <div className="w-16 h-16 rounded-[24px] bg-[#5886EF] text-white flex items-center justify-center shadow-2xl shadow-emerald-900/20 mb-8">
          <HeartHandshake size={32} />
        </div>
        <h1 className="text-[32px] font-black leading-[1.12] text-slate-950 tracking-tight">用微信查看孩子的<br />校园成长足迹</h1>
      </div>
      <div className="relative z-10 space-y-3 pb-4">
        <button type="button" onClick={() => setScreen('binding')} className="w-full h-14 rounded-[18px] bg-[#07C160] text-white text-[17px] font-bold flex items-center justify-center gap-2 shadow-xl shadow-[#07C160]/24 active:scale-[0.98] transition-transform">
          <ShieldCheck size={20} /> 微信授权登录
        </button>
      </div>
    </div>
  );

  const Binding = () => (
    <div className={`${PARENT_SCREEN_CLASS} pb-12`}>
      <Header title="绑定孩子" showBack={bindingReturnTarget === 'switcher'} backLabel="返回切换孩子" onBack={returnToChildSwitcher} />
      <div className="px-6 pt-7">
        <div className="rounded-[30px] bg-white border border-white p-5 shadow-[0_18px_45px_-30px_rgba(15,23,42,0.45)]">
          <div className="space-y-4">
            <label className="block">
              <span className="mb-2 flex items-center gap-2 text-[13px] font-bold text-slate-500"><ShieldCheck size={15} /> 学校编号</span>
              <input
                value={bindForm.schoolCode}
                onChange={event => updateBindForm('schoolCode', event.target.value)}
                onBlur={event => revealStudentBindFields(event.currentTarget.value)}
                onKeyDown={event => {
                  if (event.key === 'Enter') {
                    revealStudentBindFields(event.currentTarget.value);
                    event.currentTarget.blur();
                  }
                }}
                placeholder="例如：BS2024"
                className={BINDING_INPUT_CLASS}
              />
            </label>
            {showStudentBindFields && ([
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
          <button type="button" onClick={submitBinding} disabled={!canSubmitBinding} className="mt-6 w-full h-14 rounded-[18px] bg-[#FFC210] text-[#653C16] text-[16px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform disabled:bg-slate-200 disabled:text-slate-400 disabled:active:scale-100">
            完成绑定
          </button>
        </div>
      </div>
    </div>
  );

  const Growth = () => {
    if (!activeChild) return <Binding />;
    return (
      <div className={`${PARENT_SCREEN_CLASS} pb-28`} onScroll={handleGrowthScroll}>
        <MainStudentTitleBar />
        <section className="mx-5 mt-4 rounded-[24px] bg-slate-100/70 p-1.5 flex gap-1">
          {[
            { key: 'week' as const, label: '本周' },
            { key: 'month' as const, label: '本月' },
            { key: 'term' as const, label: '本学期' },
          ].map(item => (
            <button
              key={item.key}
              type="button"
              onClick={() => setGrowthPeriod(item.key)}
              className={`flex-1 h-10 rounded-[17px] text-[14px] font-bold transition-colors ${growthPeriod === item.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}
            >
              {item.label}
            </button>
          ))}
        </section>
        <section className="mx-5 mt-3 grid grid-cols-3 gap-2">
          {[
            { label: '表扬次数', value: stats.positive, icon: CirclePlus, tone: 'bg-emerald-50 text-emerald-700' },
            { label: '批评次数', value: stats.negative, icon: CircleMinus, tone: 'bg-rose-50 text-rose-700' },
            { label: '净积分', value: stats.net > 0 ? `+${stats.net}` : stats.net, icon: BarChart3, tone: 'bg-amber-50 text-amber-700' },
          ].map(item => {
            const Icon = item.icon;
            return (
              <div key={item.label} className="rounded-[22px] bg-white border border-white p-3 shadow-[0_14px_40px_-32px_rgba(15,23,42,0.5)]">
                <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${item.tone}`}><Icon size={18} /></div>
                <div className="mt-3 text-[22px] font-black text-slate-900 leading-none">{item.value}</div>
                <div className="mt-1 text-[11px] font-bold text-slate-400">{item.label}</div>
              </div>
            );
          })}
        </section>
        <section className="mx-5 mt-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[17px] font-black text-slate-900 flex items-center gap-2"><ListFilter size={18} className="text-emerald-600" /> 最近评价</h2>
            <div className="flex rounded-full bg-slate-100 p-1">
              {[
                { key: 'all' as const, label: '全部' },
                { key: 'positive' as const, label: '表扬' },
                { key: 'negative' as const, label: '批评' },
              ].map(item => (
                <button key={item.key} type="button" onClick={() => setEvaluationFilter(item.key)} className={`h-8 px-3 rounded-full text-[12px] font-bold transition-colors ${evaluationFilter === item.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-400'}`}>{item.label}</button>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            {visibleRecords.map(record => (
              <article key={record.id} className="rounded-[22px] bg-white border border-white p-4 shadow-[0_14px_40px_-32px_rgba(15,23,42,0.5)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex items-center gap-2">
                      <span className="text-[12px] font-bold text-slate-400">{record.time}</span>
                      <span className={`rounded-full border px-2 py-1 text-[11px] font-bold ${dimensionTone[record.dimension] ?? 'bg-slate-50 text-slate-600 border-slate-100'}`}>{record.dimension}</span>
                    </div>
                    <div className="mb-2 flex flex-wrap items-center gap-1.5 text-[12px] font-bold text-slate-500">
                      {record.indicatorPath.map((item, pathIndex) => (
                        <React.Fragment key={item}>
                          {pathIndex > 0 && <span className="text-slate-300">-</span>}
                          <span className={pathIndex === record.indicatorPath.length - 1 ? 'text-slate-900' : ''}>{item}</span>
                        </React.Fragment>
                      ))}
                    </div>
                    <p className="text-[15px] font-bold leading-snug text-slate-900">{record.content}</p>
                    <div className="mt-3 text-[12px] font-bold text-slate-400">评价老师：{record.teacher}</div>
                  </div>
                  <div className={`shrink-0 rounded-2xl px-2.5 py-2 font-black text-[15px] ${record.score > 0 ? 'bg-orange-50 text-orange-600' : 'bg-rose-50 text-rose-600'}`}>{record.score > 0 ? `+${record.score}` : record.score}</div>
                </div>
              </article>
            ))}
            {filteredRecords.length === 0 && (
              <div className="rounded-[22px] border border-white bg-white p-6 text-center text-[14px] font-bold text-slate-400 shadow-[0_14px_40px_-32px_rgba(15,23,42,0.5)]">
                {growthPeriodLabel[growthPeriod]}暂无评价
              </div>
            )}
            {filteredRecords.length > 0 && visibleRecordCount >= filteredRecords.length && (
              <div className="py-2 text-center text-[12px] font-bold text-slate-300">已显示全部</div>
            )}
          </div>
        </section>
      </div>
    );
  };

  const Reports = () => {
    if (!activeChild) return <Binding />;
    return (
      <div className={`${PARENT_SCREEN_CLASS} pb-28`}>
        <MainStudentTitleBar />
        <section className="px-5 pt-3 space-y-3">
          {activeChild.reports.map(report => (
            <button key={report.id} type="button" onClick={() => { setActiveReportId(report.id); setScreen('reportDetail'); }} className="w-full rounded-[26px] bg-white border border-white p-4 text-left shadow-[0_14px_40px_-32px_rgba(15,23,42,0.5)] active:scale-[0.99] transition-transform">
              <div className="flex items-start gap-3">
                <div className={`w-12 h-12 rounded-2xl text-white flex items-center justify-center shadow-lg ${report.type === 'month' ? 'bg-gradient-to-br from-sky-500 to-cyan-400' : 'bg-gradient-to-br from-emerald-500 to-lime-400'}`}>
                  {report.type === 'month' ? <CalendarDays size={23} /> : <BookOpenCheck size={23} />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-3">
                    <h2 className="text-[16px] font-black text-slate-900">{report.title}</h2>
                    <ArrowRight size={16} className="text-slate-300" />
                  </div>
                  <p className="mt-1 text-[12px] font-bold text-emerald-600">{report.period}</p>
                </div>
              </div>
            </button>
          ))}
        </section>
      </div>
    );
  };

  const ReportDetail = () => {
    if (!activeChild || !activeReport) return <Reports />;
    return (
      <div className={`${PARENT_SCREEN_CLASS} pb-28`}>
        <Header title="报告详情" subtitle={`${activeReport.title} · ${activeReport.period}`} showBack />
        <section className="mx-5 mt-5 rounded-[30px] bg-white border border-white p-5 shadow-[0_20px_58px_-36px_rgba(15,23,42,0.5)]">
          <div className="w-14 h-14 rounded-[22px] bg-slate-900 text-white flex items-center justify-center mb-5"><FileText size={26} /></div>
          <h2 className="text-[24px] font-black text-slate-950">{activeReport.title}</h2>
          <p className="mt-1 text-[13px] font-bold text-emerald-600">{activeChild.name} · {activeReport.period}</p>
          <p className="mt-5 text-[15px] leading-relaxed text-slate-600">{activeReport.summary}</p>
          <div className="mt-5 space-y-2">
            {activeReport.highlights.map(item => (
              <div key={item} className="flex items-start gap-2 rounded-2xl bg-slate-50 p-3">
                <CheckCircle2 size={17} className="mt-0.5 text-emerald-600 shrink-0" />
                <span className="text-[13px] leading-relaxed font-medium text-slate-600">{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    );
  };

  const Bank = () => {
    if (!activeChild) return <Binding />;
    const amount = Math.max(1, Math.min(Number(depositAmount) || 1, activeChild.availableCoins));
    const projectedInterest = calculateProjectedInterest(amount, selectedBankScheme);

    return (
      <div className={`${PARENT_SCREEN_CLASS} pb-28`}>
        <MainStudentTitleBar />
        <section className="mx-5 mt-3 grid grid-cols-2 gap-3">
          <div className="rounded-[24px] bg-gradient-to-br from-orange-50 to-amber-100 p-4 border border-orange-100">
            <WalletCards size={21} className="text-orange-500 mb-3" />
            <div className="text-[12px] font-bold text-orange-700/70">可用货币</div>
            <div className="mt-1 text-[28px] font-black text-orange-600 leading-none">{formatCoin(activeChild.availableCoins)}</div>
          </div>
          <div className="rounded-[24px] bg-gradient-to-br from-blue-50 to-indigo-100 p-4 border border-blue-100">
            <Landmark size={21} className="text-blue-500 mb-3" />
            <div className="text-[12px] font-bold text-blue-700/70">银行存款</div>
            <div className="mt-1 text-[28px] font-black text-blue-600 leading-none">{formatCoin(activeChild.bankBalance)}</div>
          </div>
        </section>

        <section className="mx-5 mt-4 rounded-[24px] bg-slate-100/70 p-1.5 flex gap-1">
          {[
            { key: 'deposit' as const, label: '签署新存单', icon: PiggyBank },
            { key: 'list' as const, label: '我的存单', icon: FileText },
          ].map(item => {
            const Icon = item.icon;
            const active = activeBankTab === item.key;
            return (
              <button key={item.key} type="button" onClick={() => setActiveBankTab(item.key)} className={`flex-1 h-11 rounded-[18px] flex items-center justify-center gap-1.5 text-[14px] font-bold transition-colors ${active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'}`}>
                <Icon size={16} /> {item.label}
              </button>
            );
          })}
        </section>

        {activeBankTab === 'deposit' ? (
          <section className="mx-5 mt-4 space-y-4">
            <div className="rounded-[28px] bg-white border border-white p-4 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.45)]">
              <h2 className="text-[17px] font-black text-slate-900 mb-3">存钱计划</h2>
              <div className="grid grid-cols-2 gap-3">
                {BANK_CONFIG.TERMS.map(scheme => {
                  const active = selectedBankScheme?.label === scheme.label;
                  const Icon = scheme.type === 'current' ? PiggyBank : (scheme.days <= 7 ? Timer : (scheme.days <= 30 ? Calendar : Layers));
                  return (
                    <button key={scheme.label} type="button" onClick={() => setSelectedBankScheme(scheme)} className={`rounded-[20px] border p-3 text-left transition-colors ${active ? 'border-[#5886EF] bg-[#EEF3FF]' : 'border-slate-100 bg-slate-50'}`}>
                      <div className="flex items-center gap-2 mb-3">
                        <div className={`w-9 h-9 rounded-2xl flex items-center justify-center ${active ? 'bg-[#5886EF] text-white' : 'bg-white text-slate-500'}`}><Icon size={17} /></div>
                        <div className="min-w-0">
                          <div className="text-[14px] font-black text-slate-900 truncate">{scheme.label}</div>
                          <div className="text-[11px] font-bold text-slate-400">{scheme.type === 'current' ? '活期存单' : '定期存单'}</div>
                        </div>
                      </div>
                      <div className={`text-[18px] font-black ${scheme.type === 'current' ? 'text-emerald-600' : 'text-blue-600'}`}>{scheme.type === 'current' ? '日计息' : `${Math.round(scheme.rate * 100)}%`}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[28px] bg-white border border-white p-4 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.45)]">
              <h2 className="text-[17px] font-black text-slate-900 mb-3">存入金额</h2>
              <div className="rounded-[22px] bg-slate-50 p-4">
                <div className="flex items-end justify-between mb-3">
                  <span className="text-[12px] font-bold text-slate-500">存入金额</span>
                  <span className="text-[30px] leading-none font-black text-slate-900">{amount}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max={Math.max(1, Math.floor(activeChild.availableCoins))}
                  step="1"
                  value={amount}
                  onChange={event => setDepositAmount(event.target.value)}
                  className="w-full h-3 rounded-full accent-[#5886EF]"
                />
                <div className="mt-2 flex justify-between text-[11px] font-bold text-slate-400">
                  <span>1</span>
                  <span>最多 {Math.max(1, Math.floor(activeChild.availableCoins))}</span>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <div className="rounded-[18px] bg-blue-50 p-3">
                  <div className="text-[11px] font-bold text-blue-500/80">预计利息</div>
                  <div className="mt-1 text-[20px] font-black text-blue-600">+{projectedInterest}</div>
                </div>
                <div className="rounded-[18px] bg-slate-50 p-3">
                  <div className="text-[11px] font-bold text-slate-400">到期时间</div>
                  <div className="mt-1 text-[15px] font-black text-slate-700">{selectedBankScheme?.type === 'current' ? '随时取出' : formatDate(Date.now() + (selectedBankScheme?.days ?? 0) * 86400000)}</div>
                </div>
              </div>
              <button type="button" onClick={() => setShowDepositConfirm(true)} className="mt-4 w-full h-[52px] rounded-[18px] bg-[#FFC210] text-[#653C16] text-[16px] font-bold active:scale-[0.98] transition-transform">
                签署存单
              </button>
            </div>
          </section>
        ) : (
          <section className="mx-5 mt-4 space-y-3">
            {activeChild.deposits.length === 0 ? (
              <div className="rounded-[28px] bg-white border border-white p-8 text-center shadow-[0_18px_50px_-34px_rgba(15,23,42,0.45)]">
                <Clock size={38} className="mx-auto text-slate-300 mb-3" />
                <div className="text-[17px] font-black text-slate-700">还没有存单</div>
                <button type="button" onClick={() => setActiveBankTab('deposit')} className="mt-5 h-12 px-6 rounded-[18px] bg-[#FFC210] text-[#653C16] text-[15px] font-bold">签署新存单</button>
              </div>
            ) : activeChild.deposits.map(deposit => {
              const details = getDepositInterest(deposit);
              const progress = deposit.type === 'current' ? 100 : Math.min(100, Math.floor((details.elapsedDays / deposit.termDays) * 100));
              return (
                <article key={deposit.id} className="rounded-[28px] bg-white border border-white p-4 shadow-[0_18px_50px_-34px_rgba(15,23,42,0.45)]">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-[11px] font-bold text-blue-500 mb-1">{deposit.type === 'current' ? '活期存单' : '定期存单'}</div>
                      <h3 className="text-[17px] font-black text-slate-900">{deposit.label}</h3>
                    </div>
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${details.matured ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-50 text-slate-400'}`}>
                      {details.matured ? <BadgeCheck size={19} /> : <Clock size={19} />}
                    </div>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-[18px] bg-slate-50 p-3">
                      <div className="text-[11px] font-bold text-slate-400">本金</div>
                      <div className="mt-1 text-[22px] font-black text-slate-900">{deposit.amount}</div>
                    </div>
                    <div className="rounded-[18px] bg-emerald-50 p-3">
                      <div className="text-[11px] font-bold text-emerald-600/70">已得利息</div>
                      <div className="mt-1 text-[22px] font-black text-emerald-600">+{details.interest}</div>
                    </div>
                  </div>
                  {deposit.type === 'fixed' && (
                    <div className="mt-4">
                      <div className="flex justify-between text-[11px] font-bold text-slate-400 mb-2">
                        <span>进度</span><span>{progress}%</span>
                      </div>
                      <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                        <div className="h-full rounded-full bg-[#5886EF]" style={{ width: `${progress}%` }} />
                      </div>
                    </div>
                  )}
                  <button type="button" onClick={() => setWithdrawTarget(deposit)} className="mt-4 w-full h-12 rounded-[18px] bg-[#FFC210] text-[#653C16] text-[15px] font-bold active:scale-[0.98] transition-transform">
                    取出
                  </button>
                </article>
              );
            })}
          </section>
        )}

        {showDepositConfirm && selectedBankScheme && (
          <div className="absolute inset-0 z-[90] bg-slate-950/35 backdrop-blur-sm flex items-end" onClick={() => setShowDepositConfirm(false)}>
            <div className="w-full rounded-t-[32px] bg-white p-5 pb-8 shadow-[0_-24px_70px_-38px_rgba(15,23,42,0.7)]" onClick={event => event.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[19px] font-black text-slate-950">确认签署</h2>
                <button type="button" onClick={() => setShowDepositConfirm(false)} className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><X size={18} /></button>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between text-[14px] font-bold"><span className="text-slate-500">计划</span><span className="text-slate-900">{selectedBankScheme.label}</span></div>
                <div className="flex justify-between text-[14px] font-bold"><span className="text-slate-500">本金</span><span className="text-slate-900">{amount}</span></div>
                <div className="flex justify-between text-[14px] font-bold"><span className="text-slate-500">预计利息</span><span className="text-blue-600">+{projectedInterest}</span></div>
              </div>
              <button type="button" onClick={submitDeposit} className="mt-4 w-full h-[52px] rounded-[18px] bg-[#FFC210] text-[#653C16] text-[16px] font-bold active:scale-[0.98] transition-transform">确认签署</button>
            </div>
          </div>
        )}

        {withdrawTarget && (
          <div className="absolute inset-0 z-[90] bg-slate-950/35 backdrop-blur-sm flex items-end" onClick={() => setWithdrawTarget(null)}>
            <div className="w-full rounded-t-[32px] bg-white p-5 pb-8 shadow-[0_-24px_70px_-38px_rgba(15,23,42,0.7)]" onClick={event => event.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[19px] font-black text-slate-950">确认取出</h2>
                <button type="button" onClick={() => setWithdrawTarget(null)} className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><X size={18} /></button>
              </div>
              <div className="rounded-[24px] bg-slate-50 p-4 space-y-3">
                <div className="flex justify-between text-[14px] font-bold"><span className="text-slate-500">本金</span><span className="text-slate-900">{withdrawTarget.amount}</span></div>
                <div className="flex justify-between text-[14px] font-bold"><span className="text-slate-500">利息</span><span className="text-emerald-600">+{getDepositInterest(withdrawTarget).interest}</span></div>
              </div>
              <button type="button" onClick={() => withdrawDeposit(withdrawTarget)} className="mt-4 w-full h-[52px] rounded-[18px] bg-[#FFC210] text-[#653C16] text-[16px] font-bold active:scale-[0.98] transition-transform">确认取出</button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const ChildSwitcherSheet = () => {
    if (!showChildSwitcher) return null;
    return (
      <div className="absolute inset-0 z-[80] bg-slate-950/35 backdrop-blur-sm flex items-end" onClick={() => setShowChildSwitcher(false)}>
        <div className="w-full rounded-t-[32px] bg-[#FAFCF7]/95 backdrop-blur-xl p-5 pb-8 shadow-[0_-24px_70px_-38px_rgba(15,23,42,0.7)]" onClick={event => event.stopPropagation()}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-[19px] font-black text-slate-950">切换孩子</h2>
            </div>
            <button type="button" onClick={() => setShowChildSwitcher(false)} className="w-9 h-9 rounded-full bg-white text-slate-500 flex items-center justify-center"><X size={18} /></button>
          </div>
          <div className="space-y-2">
            {childrenList.map(child => (
              <article key={child.id} className={`student-switcher-card w-full rounded-[22px] border p-4 ${child.id === activeChildId ? 'bg-white text-slate-900 border-[#FFC210]/70 shadow-[0_14px_40px_-30px_rgba(101,60,22,0.5)]' : 'bg-white text-slate-800 border-white'}`}>
                <div className="flex items-center gap-3">
                  <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-[17px] bg-gradient-to-br ${child.avatarTone} text-white font-black`}>{child.name.slice(0, 1)}</div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[16px] font-black leading-tight">{child.name}</div>
                    <div className="mt-2 flex min-w-0 items-center gap-2 whitespace-nowrap text-[12px] font-bold text-slate-500">
                      <span className="shrink-0 text-slate-300">所在班级</span>
                      <span className="max-w-[92px] truncate text-slate-700">{child.className}</span>
                      <span className="shrink-0 text-slate-300">学号</span>
                      <span className="max-w-[54px] truncate text-slate-700">{child.studentNo}</span>
                    </div>
                  </div>
                  <button type="button" onClick={() => { setActiveChildId(child.id); setShowChildSwitcher(false); }} disabled={child.id === activeChildId} className={`h-9 min-w-[58px] shrink-0 rounded-full px-3 text-[13px] font-black transition-transform active:scale-95 disabled:active:scale-100 ${child.id === activeChildId ? 'bg-[#FFF4CC] text-[#653C16]' : 'bg-[#FFC210] text-[#653C16]'}`}>
                    {child.id === activeChildId ? '当前' : '切换'}
                  </button>
                </div>
              </article>
            ))}
          </div>
          <button type="button" onClick={() => openBinding('switcher')} className="mt-4 w-full h-[52px] rounded-[18px] bg-[#FFC210] text-[#653C16] text-[16px] font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-transform">
            <Plus size={18} /> 新增绑定
          </button>
        </div>
      </div>
    );
  };

  const renderScreen = () => {
    if (screen === 'login') return <Login />;
    if (screen === 'binding') return <Binding />;
    if (screen === 'reports') return <Reports />;
    if (screen === 'reportDetail') return <ReportDetail />;
    if (screen === 'bank') return <Bank />;
    return <Growth />;
  };

  const tabItems: { key: Screen; label: string; icon: React.ElementType }[] = [
    { key: 'growth', label: '成长', icon: Star },
    { key: 'reports', label: '报告', icon: FileText },
    { key: 'bank', label: '银行', icon: Landmark },
  ];

  const showTabs = activeChild && screen !== 'login' && screen !== 'binding';
  const ParentBottomNav = () => {
    const activeIndex = Math.max(0, tabItems.findIndex(item => screen === item.key || (screen === 'reportDetail' && item.key === 'reports')));
    const goTab = (item: (typeof tabItems)[number], nextIndex: number) => {
      if (nextIndex === activeIndex && screen === item.key) return;
      setNavTransition(prev => ({
        id: prev.id + 1,
        direction: nextIndex >= activeIndex ? 1 : -1,
        fromIndex: activeIndex,
      }));
      setScreen(item.key);
    };

    return (
      <div className="parent-bottom-nav-wrap absolute bottom-0 left-0 right-0 z-50 px-4 pb-7 pt-5 bg-gradient-to-t from-white/70 via-white/34 to-transparent">
        <style>{`
          .parent-bottom-nav-wrap {
            --active-x: 0%;
            --from-x: 0%;
          }

          .parent-bottom-nav-shell {
            isolation: isolate;
            background:
              radial-gradient(circle at 18% 16%, rgba(255,255,255,0.96), transparent 26%),
              radial-gradient(circle at 82% 10%, rgba(255,255,255,0.84), transparent 28%),
              linear-gradient(180deg, rgba(255,255,255,0.88), rgba(255,255,255,0.72));
            backdrop-filter: blur(26px) saturate(1.72) brightness(1.06);
            -webkit-backdrop-filter: blur(26px) saturate(1.72) brightness(1.06);
            box-shadow:
              inset 0 1px 1px rgba(255,255,255,0.96),
              inset 0 -18px 26px rgba(203,213,225,0.18),
              0 22px 52px -30px rgba(15,23,42,0.28),
              0 8px 22px -18px rgba(15,23,42,0.26);
          }

          .parent-bottom-nav-shell::before,
          .parent-bottom-nav-shell::after {
            content: "";
            position: absolute;
            pointer-events: none;
            border-radius: inherit;
          }

          .parent-bottom-nav-shell::before {
            inset: 0;
            z-index: 1;
            border: 1px solid rgba(255,255,255,0.82);
            background:
              linear-gradient(180deg, rgba(255,255,255,0.86), transparent 40%),
              linear-gradient(90deg, rgba(255,255,255,0.46), transparent 18%, transparent 82%, rgba(255,255,255,0.52));
            box-shadow:
              inset 0 0 0 0.5px rgba(255,255,255,0.68),
              inset 12px 0 18px rgba(255,255,255,0.20),
              inset -12px 0 18px rgba(148,163,184,0.10);
          }

          .parent-bottom-nav-shell::after {
            inset: -18px -12px;
            z-index: 0;
            background:
              radial-gradient(circle at 20% 18%, rgba(255,255,255,0.92), transparent 24%),
              radial-gradient(circle at 80% 16%, rgba(255,255,255,0.72), transparent 32%),
              radial-gradient(circle at 50% 108%, rgba(148,163,184,0.14), transparent 34%);
            filter: blur(16px);
            opacity: 0.74;
          }

          .parent-bottom-nav-indicator {
            background:
              radial-gradient(circle at 68% 20%, rgba(255,255,255,0.98) 0 14%, transparent 36%),
              radial-gradient(circle at 28% 76%, rgba(255,255,255,0.78) 0 16%, transparent 44%),
              linear-gradient(145deg, rgba(255,255,255,0.86), rgba(255,255,255,0.48) 54%, rgba(241,245,249,0.62));
            border: 1px solid rgba(255,255,255,0.92);
            backdrop-filter: blur(18px) saturate(1.85) brightness(1.06);
            -webkit-backdrop-filter: blur(18px) saturate(1.85) brightness(1.06);
            box-shadow:
              inset 8px 9px 18px rgba(255,255,255,0.78),
              inset -12px -12px 22px rgba(148,163,184,0.16),
              0 14px 26px -20px rgba(15,23,42,0.42);
            filter: url("#parent-liquid-glass-filter") drop-shadow(0 10px 14px rgba(15,23,42,0.08));
          }

          .parent-bottom-nav-indicator::before {
            content: "";
            position: absolute;
            inset: 6px 14px 52% 14px;
            border-radius: 999px;
            background: linear-gradient(90deg, transparent, rgba(255,255,255,0.96), transparent);
            opacity: 0.9;
          }

          .parent-bottom-nav-indicator::after {
            content: "";
            position: absolute;
            right: 12px;
            top: 9px;
            width: 26px;
            height: 26px;
            border-radius: 999px;
            background: rgba(255,255,255,0.82);
            filter: blur(7px);
            opacity: 0.72;
          }

          .parent-bottom-nav-ripple {
            background:
              radial-gradient(circle at 28% 44%, rgba(255,255,255,0.92) 0 12%, rgba(74,222,255,0.36) 18%, rgba(255,138,76,0.24) 30%, transparent 44%),
              radial-gradient(circle at 72% 68%, rgba(255,255,255,0.74) 0 10%, rgba(96,165,250,0.24) 18%, rgba(251,146,60,0.20) 27%, transparent 40%),
              linear-gradient(96deg, transparent 8%, rgba(255,255,255,0.46) 48%, transparent 78%);
            mix-blend-mode: screen;
            filter: blur(2px) saturate(1.85) contrast(1.08);
            animation: parentNavRipple 640ms cubic-bezier(0.16,1,0.3,1) both;
          }

          .parent-bottom-nav-button {
            text-shadow: 0 1px 0 rgba(255,255,255,0.74);
          }

          .parent-fluid-glass-canvas {
            position: absolute !important;
            inset: -18px -16px !important;
            z-index: 1;
            pointer-events: none;
            filter: drop-shadow(0 22px 26px rgba(15,23,42,0.12));
          }

          .parent-bottom-nav-button--active .parent-bottom-nav-label {
            text-shadow:
              -0.8px 1.2px 0 rgba(0,210,255,0.30),
              0.8px 1.6px 0 rgba(255,122,64,0.26),
              0 1px 0 rgba(255,255,255,0.92);
          }

          .parent-bottom-nav-button--active .parent-bottom-nav-icon {
            filter:
              drop-shadow(-0.7px 1px 0 rgba(0,210,255,0.22))
              drop-shadow(0.8px 1.3px 0 rgba(255,122,64,0.18));
          }

          @keyframes parentNavRipple {
            0% {
              opacity: 0;
              clip-path: inset(24% 34% 24% 34% round 999px);
              transform: translateX(var(--from-x)) scaleX(0.62) scaleY(0.72);
            }
            42% {
              opacity: 0.74;
              clip-path: inset(4% 4% 4% 4% round 999px);
              transform: translateX(var(--active-x)) scaleX(1.44) scaleY(1.08);
            }
            100% {
              opacity: 0;
              clip-path: inset(16% 22% 16% 22% round 999px);
              transform: translateX(var(--active-x)) scaleX(0.9) scaleY(0.86);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .parent-bottom-nav-indicator,
            .parent-bottom-nav-ripple,
            .parent-bottom-nav-button,
            .parent-bottom-nav-button * {
              animation: none !important;
              transition-duration: 0ms !important;
            }
          }
        `}</style>
        <svg className="absolute h-0 w-0" aria-hidden="true" focusable="false">
          <filter id="parent-liquid-glass-filter" colorInterpolationFilters="sRGB">
            <feTurbulence type="fractalNoise" baseFrequency="0.012 0.032" numOctaves="1" seed="11" result="noise" />
            <feDisplacementMap in="SourceGraphic" in2="noise" scale="1.45" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </svg>
        <nav
          className="parent-bottom-nav-shell relative h-[74px] overflow-hidden rounded-full border border-white/80 p-1.5 ring-1 ring-white/70"
          aria-label="家长端底部导航"
          style={{
            ['--nav-dir' as string]: navTransition.direction,
            ['--from-x' as string]: `${navTransition.fromIndex * 100}%`,
            ['--active-x' as string]: `${activeIndex * 100}%`,
          }}
        >
          <ParentFluidGlassNav activeIndex={activeIndex} itemCount={tabItems.length} />
          <div
            className="parent-bottom-nav-indicator absolute bottom-1 top-1 z-[2] rounded-full transition-transform [transition-duration:640ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)]"
            style={{
              left: '4px',
              width: `calc((100% - 8px) / ${tabItems.length})`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
            aria-hidden="true"
          />
          <div
            key={`ripple-${navTransition.id}`}
            className="parent-bottom-nav-ripple pointer-events-none absolute bottom-1 top-1 z-[3] rounded-full"
            style={{
              left: '4px',
              width: `calc((100% - 8px) / ${tabItems.length})`,
            }}
            aria-hidden="true"
          />
          <div className="relative z-10 grid h-full" style={{ gridTemplateColumns: `repeat(${tabItems.length}, minmax(0, 1fr))` }}>
            {tabItems.map(item => {
              const Icon = item.icon;
              const active = screen === item.key || (screen === 'reportDetail' && item.key === 'reports');
              const nextIndex = tabItems.findIndex(tab => tab.key === item.key);
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => goTab(item, nextIndex)}
                  aria-current={active ? 'page' : undefined}
                  className={`parent-bottom-nav-button relative flex h-full min-w-0 flex-col items-center justify-center gap-1 rounded-full transition-[color,transform,opacity,text-shadow] [transition-duration:420ms] ease-out active:scale-[0.94] ${active ? 'parent-bottom-nav-button--active text-slate-950' : 'text-slate-500/70'}`}
                >
                  <Icon size={24} strokeWidth={active ? 2.65 : 2.25} className={`parent-bottom-nav-icon transition-transform [transition-duration:420ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] ${active ? '-translate-y-0.5 scale-105' : 'scale-100'}`} />
                  <span className={`parent-bottom-nav-label text-[12px] leading-none tracking-[-0.03em] transition-all [transition-duration:420ms] ${active ? 'font-black text-slate-950' : 'font-bold text-slate-400'}`}>
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    );
  };

  return (
    <div className="w-screen h-[100dvh] bg-[#EEF2F6] flex items-center justify-center p-4">
      <PhoneMockup showDeviceFrame={showPhoneShell} contentTopInsetMode="status-bar">
        <div className="flex-1 flex flex-col relative overflow-hidden bg-transparent font-sans">
          <ParentDiffuseBackdrop />
          {renderScreen()}
          {showTabs && <ParentBottomNav />}
          <ChildSwitcherSheet />
        </div>
      </PhoneMockup>
    </div>
  );
};

export default ParentApp;
