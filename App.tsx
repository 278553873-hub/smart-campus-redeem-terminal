
import React, { useEffect, useState, useMemo, useRef } from 'react';
import { ViewState, Student, Product, BankAccount, Deposit } from './types';
import { EXCHANGE_RATE, BANK_CONFIG, MOCK_PRODUCTS } from './constants';
import FaceScanner from './components/FaceScanner';
import AccountLogin from './components/AccountLogin';
import Dashboard from './components/Dashboard';
import ExchangeView from './components/ExchangeView';
import ShopView from './components/ShopView';
import BankView from './components/BankView';
import GrowthView from './components/GrowthView';
import TransactionView from './components/TransactionView';
import TeacherDashboard from './components/TeacherDashboard';
import SmartBigScreen from './components/SmartBigScreen';
import AdminApp from './components/AdminApp';
import MobileApp from './mobile-app/App';
import CompanionApp from './components/CompanionApp';
import ParentApp from './components/ParentApp';
import ParentBankFeaturePreviewControls from './components/ParentBankFeaturePreviewControls';
import ParentEvaluationVisibilityPreviewControls from './components/ParentEvaluationVisibilityPreviewControls';
import TerminalLoginMethodPreviewControls, { type StudentLoginPreviewMode } from './components/TerminalLoginMethodPreviewControls';
import TerminalShopLayoutPreviewControls from './components/TerminalShopLayoutPreviewControls';
import TeacherCMobileLowFi from './components/TeacherCMobileLowFi';
import VendingAdmin from './components/VendingAdmin';
import SaaSPortal, { type PcPortalApp } from './components/SaaSPortal';
import RegionalPcAdmin from './components/RegionalPcAdmin';
import UiRenovationDemo from './components/UiRenovationDemo';
import TeacherMobileDeveloperNotes, { type TeacherMobileDeveloperNotesContext } from './components/TeacherMobileDeveloperNotes';
import PlatformBrandMark from './components/PlatformBrandMark';
import Loader from './components/Loader';
import { DeviceWrapper } from './components/DeviceWrapper';
import { ASSETS as MOBILE_ASSETS } from './mobile-app/assets/images';
import {
  readTerminalShopLayoutPresetId,
  writeTerminalShopLayoutPresetId,
} from './shared/terminalShopLayoutPreview';
import type { TerminalShopLayoutPresetId } from './shared/terminalShopLayout';
import type { HeadteacherAssistantScopePreviewMode } from './shared/headteacherAssistantScopePreview';
import HeadteacherAssistantScopePreviewControls from './components/HeadteacherAssistantScopePreviewControls';
import {
  defaultParentGradientPreview,
  defaultTeacherGradientPreview,
  teacherGradientSchemeOptions,
  teacherGradientStyleOptions,
  type TeacherGradientSchemeId,
  type TeacherGradientStyleId,
} from './mobile-app/styles/teacherGradientPreview';
import './mobile-app/index.css';
import { ChevronLeft, ChevronDown, Sparkles, MonitorSmartphone, Monitor, Smartphone, Bot, Settings, ShieldCheck, Info, TrendingUp, Plus, Trash2, LayoutGrid, LogOut, Palette, X, Camera, Check, LoaderCircle, ShoppingBag, KeyRound } from 'lucide-react';
import { playSound } from './utils/sound';
import { exportElementAsPng } from './utils/exportElementAsPng';
import { GROWTH_COIN_TERMS } from './shared/growthCoinTerminology';
import { getRankingReward, sumPositiveScores } from './mobile-app/domain/campusCoinIssuance';
import {
  PARENT_EVALUATION_VISIBILITY_UPDATED_EVENT,
  readParentEvaluationVisibility,
  writeParentEvaluationVisibility,
  type ParentEvaluationVisibilitySettings,
} from './shared/parentEvaluationVisibility';
import {
  PARENT_BANK_FEATURE_UPDATED_EVENT,
  readParentBankFeatureEnabled,
  writeParentBankFeatureEnabled,
} from './shared/parentBankFeature';


interface ScoreConfig { score: number; count: number; }
interface SimStudent { name: string; score: number; reward: number; }
interface TeacherProfile { name: string; role: string; school: string; avatar?: string; }
interface StudentLoginMethods { face: boolean; password: boolean; }

const STUDENT_LOGIN_PREVIEW_OPTIONS: Array<{
  value: StudentLoginPreviewMode;
  label: string;
  methods: StudentLoginMethods;
}> = [
  { value: 'face-only', label: '仅人脸', methods: { face: true, password: false } },
  { value: 'password-only', label: '仅密码', methods: { face: false, password: true } },
  { value: 'both', label: '两种方式', methods: { face: true, password: true } },
];

const TERMINAL_ENTRY_BUTTON_BASE = 'h-[72px] w-full rounded-2xl px-6 text-xl font-black flex items-center justify-center gap-3 transition-[background-color,border-color,color,box-shadow,transform] duration-150 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 active:scale-[0.98]';
const TERMINAL_ENTRY_BUTTON_PRIMARY = 'border-2 border-blue-600 bg-blue-600 text-white shadow-[0_6px_14px_rgba(37,99,235,0.24)] active:border-blue-700 active:bg-blue-700';
const TERMINAL_ENTRY_BUTTON_SECONDARY = 'border-2 border-blue-100 bg-blue-50 text-blue-700 active:border-blue-200 active:bg-blue-100';
const TERMINAL_ENTRY_BUTTON_TERTIARY = 'border-2 border-slate-200 bg-white text-slate-700 shadow-sm active:border-blue-200 active:bg-slate-50';
const TERMINAL_IDLE_SECONDS = 999;

const HeaderCoinBalance: React.FC<{
  label: string;
  value: number;
  tone: 'available' | 'saved';
}> = ({ label, value, tone }) => {
  const isAvailable = tone === 'available';
  return (
    <div
      className={`flex items-center gap-1 rounded-xl border px-2 py-1 shadow-sm shrink-0 ${isAvailable
        ? 'border-orange-100 bg-orange-50 text-orange-600'
        : 'border-blue-100 bg-blue-50 text-blue-600'
        }`}
      aria-label={`${label}${GROWTH_COIN_TERMS.name}${value}`}
    >
      <span className="text-xs font-black leading-none">{label}</span>
      <img src="/assets/coin.png" className="h-3.5 w-3.5 shrink-0" alt="" />
      <span className="font-[NumberFont] text-xl font-black leading-none">{value}</span>
    </div>
  );
};

const DEMO_TEACHER_PROFILES: TeacherProfile[] = [
  { name: '郭老师', role: '学校管理员', school: '成都七中初中附属小学', avatar: MOBILE_ASSETS.AVATAR.TEACHER_DEFAULT },
  { name: '周老师', role: '学校管理员', school: '成都七中初中附属小学', avatar: MOBILE_ASSETS.AVATAR.TEACHER_DEFAULT },
  { name: '王老师', role: '学校管理员', school: '成都七中初中附属小学', avatar: MOBILE_ASSETS.AVATAR.TEACHER_DEFAULT },
  { name: '曹老师', role: '学校管理员', school: '成都七中初中附属小学', avatar: MOBILE_ASSETS.AVATAR.TEACHER_DEFAULT },
];

const resolveTeacherProfile = (loginId: string): TeacherProfile => {
  const trimmed = loginId.trim();
  if (/[一-龥]/.test(trimmed)) {
    const normalizedName = trimmed.endsWith('老师') ? trimmed : `${trimmed}老师`;
    return { ...DEMO_TEACHER_PROFILES[0], name: normalizedName };
  }

  const digits = trimmed.replace(/\D/g, '');
  const seed = digits.split('').reduce((sum, char) => sum + Number(char), 0);
  return DEMO_TEACHER_PROFILES[seed % DEMO_TEACHER_PROFILES.length];
};

const formatLocalScreenshotTimestamp = (date: Date) => {
  const pad = (value: number) => value.toString().padStart(2, '0');
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}-${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}`;
};

const DEFAULT_PARENT_PREVIEW_CLASS_ID = 'c_2025_1';

function computeLeaderboard(bonusPool: number, configs: ScoreConfig[]): SimStudent[] {
  const valid = configs.filter(c => c.score > 0 && c.count > 0);
  
  
  let serial = 1;
  const students: SimStudent[] = [];
  
  // 1. 添加有分数的同学
  valid.forEach(config => {
    for (let i = 0; i < config.count; i++) {
      students.push({ name: `学生${serial++}`, score: config.score, reward: 0 });
    }
  });

  // 2. 补齐至 40 人（其余同学默认 0 分）
  const CLASS_SIZE = 40;
  if (students.length < CLASS_SIZE) {
    const remaining = CLASS_SIZE - students.length;
    for (let i = 0; i < remaining; i++) {
      students.push({ name: `学生${serial++}`, score: 0, reward: 0 });
    }
  }

  // 3. 得分奖励按分数占比分配：得分奖励 = 积分排行池 × 个人总分 ÷ 全班正分总和
  const totalPositiveScore = sumPositiveScores(students.map(st => st.score));
  students.forEach(st => {
    st.reward = getRankingReward({ rankingPool: bonusPool, score: st.score, totalPositiveScore });
  });

  students.sort((a, b) => b.score - a.score);
  return students;
}

// ============================================================
// 成长页右侧面板：规则说明 + 试算
// ============================================================
const GrowthSidePanel: React.FC = () => {
  const [bonusPool, setBonusPool] = useState('200');
  const [classSize, setClassSize] = useState('40');
  const [myScore, setMyScore] = useState(''); // 我的得分，用于预览预计可得
  // 分数段：字符串存储，避免输入时前置零问题；默认只有一行
  const [configs, setConfigs] = useState<{ score: string; count: string }[]>([
    { score: '10', count: '1' },
  ]);
  const [generated, setGenerated] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'full' | 'student'>('full');

  // 转换为数值用于计算
  const numericConfigs: ScoreConfig[] = configs.map(c => ({
    score: Number(c.score) || 0,
    count: Number(c.count) || 0,
  }));
  const numericBonus = Number(bonusPool) || 0;

  const leaderboard = useMemo(
    () => (generated ? computeLeaderboard(numericBonus, numericConfigs) : []),
    [generated, numericBonus, JSON.stringify(numericConfigs)]
  );


  // 学生端标杆：取积分前 3 个分数层，展示该层全部学生
  const benchmarkGroups = useMemo(() => {
    if (!generated || leaderboard.length === 0) return [];
    // 按分数降序建立层组
    const scoreMap = new Map<number, SimStudent[]>();
    leaderboard.forEach(s => {
      if (!scoreMap.has(s.score)) scoreMap.set(s.score, []);
      scoreMap.get(s.score)!.push(s);
    });
    const sorted = [...scoreMap.entries()]
      .filter(([score]) => score > 0) // 仅展示正分标杆
      .sort((a, b) => b[0] - a[0]);
    return sorted.slice(0, 3); // 取前 3 个正分数层
  }, [generated, leaderboard]);

  const selfStudent = leaderboard[0] ?? null;

  // 实时预览：根据 我的得分 计算预计可得
  // 返回类型：null = 未输入/无法计算；{ eligible: false } = ≤0 不参与；{ eligible: true, myReward } = 正分参与
  const myRewardPreview = useMemo(() => {
    const trimmed = myScore.trim();
    if (!trimmed || trimmed === '-') return null; // 空或仅输入负号
    const numScore = Number(trimmed);
    if (!Number.isFinite(numScore)) return null;
    // 得分 ≤ 0：不参与分配
    if (numScore <= 0) return { eligible: false as const };
    // 得分 > 0：按分数占全班正分的比例计算得分奖励
    const totalPositiveScore = numericConfigs.reduce((sum, c) => (
      c.score > 0 && c.count > 0 ? sum + c.score * c.count : sum
    ), 0);
    if (totalPositiveScore <= 0) return { eligible: false as const };
    const myReward = getRankingReward({ rankingPool: numericBonus, score: numScore, totalPositiveScore });
    return { eligible: true as const, myReward };
  }, [myScore, JSON.stringify(numericConfigs), numericBonus]);

  // 配置输入清洗：仅保留正整数·去前导零（允许中间状态 "0"）
  const sanitizeNum = (val: string) => {
    const digits = val.replace(/[^0-9]/g, '');
    return digits.replace(/^0+([1-9])/, '$1'); // "07"→"7", "0"→"0", ""→""
  };
  // 带符号整数清洗：允许负数、零、正数（不限制输入）
  const sanitizeSignedInt = (val: string): string => {
    if (!val) return '';
    const sign = val.startsWith('-') ? '-' : '';
    const digits = val.replace(/[^0-9]/g, '');
    if (!digits) return sign; // 仅输入了负号
    // 去除前导零（保d单个 "0"）
    const noLeadZero = digits.replace(/^0+([1-9])/, '$1');
    return sign + noLeadZero;
  };

  const addConfig = () => setConfigs(prev => [...prev, { score: '0', count: '1' }]);
  const removeConfig = (i: number) => { setConfigs(prev => prev.filter((_, idx) => idx !== i)); setGenerated(false); };
  const updateConfig = (i: number, field: 'score' | 'count', val: string) => {
    // score允许负数和0；count卻只允许正整数
    const sanitized = field === 'score' ? sanitizeSignedInt(val) : sanitizeNum(val);
    setConfigs(prev => prev.map((c, idx) => idx === i ? { ...c, [field]: sanitized } : c));
    setGenerated(false);
  };

  return (
    <div className="h-full overflow-y-auto py-3 space-y-3 pr-1 side-panel-scroll">

      {/* 板块一：规则说明（可折叠，默认收起） */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <button
          onClick={() => setRulesOpen(v => !v)}
          className="w-full flex items-center gap-3 p-4 hover:bg-slate-50 transition-colors text-left"
        >
          <div className="w-8 h-8 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-sm shrink-0">
            <Info size={16} />
          </div>
          <h2 className="text-sm font-black text-slate-800 flex-1">排行榜规则说明</h2>
          <div className={`text-slate-400 transition-transform duration-200 ${rulesOpen ? 'rotate-180' : ''}`}>
            <ChevronDown size={18} />
          </div>
        </button>
        {rulesOpen && (
          <div className="px-4 pb-4 space-y-2 border-t border-slate-50 pt-3 animate-in fade-in slide-in-from-top-1 duration-200">
            {[
              { icon: '奖', title: '只奖正分', desc: '总分 > 0 才参与奖励分配，0分或负分不参与。' },
              { icon: '比', title: '按分比例分', desc: '得分奖励 = 积分排行池 × 个人总分 ÷ 全班正分总和，分数越高分到越多。' },
              { icon: '同', title: '同分同奖', desc: '分数相同的学生，分到的得分奖励完全一致。' },
              { icon: '算', title: '奖励计算', desc: '积分排行池 = 班级预算 × 积分排行比例，余下预算由阳光保底全班平分。' },
              { icon: '隐', title: '保护隐私', desc: '学生只看班级标杆（前 3 个分数层）+ 自己的得分和预计可得。不显示具体名次和他人金额。' },
            ].map((item, i) => (
              <div key={i} className="flex gap-2.5 p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                <span className="text-base shrink-0">{item.icon}</span>
                <div>
                  <div className="font-black text-slate-700 text-xs mb-0.5">{item.title}</div>
                  <div className="text-slate-500 text-[11px] leading-relaxed font-medium">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 板块二：排行榜展示试算 */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-9 h-9 bg-orange-500 text-white rounded-xl flex items-center justify-center shadow-md shrink-0">
            <TrendingUp size={18} />
          </div>
          <h2 className="text-base font-black text-slate-800">排行榜展示试算</h2>
        </div>

        <div className="space-y-4">
          {/* ── 第一行：奖励金额 + 班级人数（并排） ── */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block pl-1">积分排行池 (校园币)</label>
              <input
                type="text"
                inputMode="numeric"
                value={bonusPool}
                onChange={e => { setBonusPool(sanitizeNum(e.target.value)); setGenerated(false); }}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-3 py-3 font-black text-slate-700 focus:outline-none focus:border-blue-400 text-center text-lg transition-colors"
              />
            </div>
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block pl-1">班级人数</label>
              <input
                type="text"
                inputMode="numeric"
                value={classSize}
                onChange={e => { setClassSize(sanitizeNum(e.target.value)); setGenerated(false); }}
                className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-3 py-3 font-black text-slate-700 focus:outline-none focus:border-blue-400 text-center text-lg transition-colors"
              />
            </div>
          </div>

          {/* ── 分数段配置 + 我属于哪个分段 ── */}
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 block pl-1">各分数段人数配置</label>
            <div className="space-y-2">
              {configs.map((cfg, i) => (
                <div key={i} className="flex items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-[10px] font-black text-slate-400 shrink-0 w-8 text-right">得分</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cfg.score}
                      onChange={e => updateConfig(i, 'score', e.target.value)}
                      className="flex-1 min-w-0 bg-white border-2 border-slate-100 rounded-xl px-2 py-2 font-black text-center text-slate-700 focus:outline-none focus:border-blue-400 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 flex-1">
                    <span className="text-[10px] font-black text-slate-400 shrink-0 w-8 text-right">人数</span>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={cfg.count}
                      onChange={e => updateConfig(i, 'count', e.target.value)}
                      className="flex-1 min-w-0 bg-white border-2 border-slate-100 rounded-xl px-2 py-2 font-black text-center text-slate-700 focus:outline-none focus:border-blue-400 text-sm"
                    />
                  </div>
                  {configs.length > 1 && (
                    <button onClick={() => removeConfig(i)} className="p-1.5 text-slate-300 hover:text-red-400 transition-colors shrink-0">
                      <Trash2 size={15} />
                    </button>
                  )}
                </div>
              ))}
            </div>
            <button
              onClick={addConfig}
              className="mt-2 w-full py-2.5 border-2 border-dashed border-slate-200 text-slate-400 rounded-2xl font-black text-sm hover:border-blue-400 hover:text-blue-500 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Plus size={15} /> 新增分数段
            </button>

            {/* 我属于哪个分段 —— 实时预览（允许输入负数和 0） */}
            <div className="mt-3 bg-slate-50 rounded-2xl border border-slate-100 p-3">
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">我属于哪个分段？</div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black text-slate-500 shrink-0">我的得分</span>
                <div className="flex-1 relative">
                  <select
                    value={myScore}
                    onChange={e => setMyScore(e.target.value)}
                    className="w-full bg-white border-2 border-slate-200 rounded-xl px-3 py-1.5 font-black text-slate-700 focus:outline-none focus:border-blue-400 text-sm appearance-none cursor-pointer pr-8"
                  >
                    <option value="" disabled>选择配置分数</option>
                    {[...new Set(configs.map(c => c.score))].filter(s => s !== '').sort((a, b) => Number(b) - Number(a)).map(score => (
                      <option key={score} value={score}>{score}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                </div>
                <span className="text-xs font-black text-slate-400 shrink-0">分</span>
              </div>

              {/* 三态显示 */}
              {/* 态 1：正分，展示预估得分奖励 */}
              {myRewardPreview && myRewardPreview.eligible && (
                <div className="mt-2 flex items-center justify-between px-3 py-2 rounded-xl border bg-blue-50 border-blue-100">
                  <div className="text-xs font-black text-blue-600">我的得分奖励</div>
                  {numericBonus > 0 && (
                    <div className="text-xs font-black text-orange-500 tabular-nums">≈ {myRewardPreview.myReward.toFixed(2)}<small className="text-orange-300 ml-0.5">校园币</small></div>
                  )}
                </div>
              )}

              {/* 态 2：得分 ≤ 0，显示不参与提示 */}
              {myRewardPreview && !myRewardPreview.eligible && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2.5 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-base font-black">!</span>
                  <div>
                    <div className="text-xs font-black text-slate-500">不参与奖励分配</div>
                    <div className="text-[10px] text-slate-400 font-medium">总分 ≤ 0，根据规则暂无预计奖励</div>
                  </div>
                </div>
              )}

              {/* 态 3：未输入，显示快捷提示 */}
              {!myRewardPreview && (
                <div className="mt-1.5 text-[11px] text-slate-400 font-medium">输入你的当月总分，立即查看预计可得</div>
              )}
            </div>
          </div>

          {/* 生成按钮 */}
          <button
            onClick={() => setGenerated(true)}
            className="w-full py-3.5 bg-blue-600 text-white font-black rounded-2xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <Sparkles size={17} /> 生成模拟排行榜
          </button>
        </div>

        {/* 无数据提示 */}
        {generated && leaderboard.length === 0 && (
          <div className="mt-4 py-6 text-center text-slate-400 font-bold text-sm">
            暂无有效数据，请确认分数段得分 &gt; 0
          </div>
        )}

        {/* 结果区：Tab 切换 */}
        {generated && leaderboard.length > 0 && (
          <div className="mt-5 animate-in fade-in slide-in-from-bottom-2 duration-300">

            {/* Tab 栏 */}
            <div className="flex bg-slate-100 rounded-2xl p-1 mb-4">
              <button
                onClick={() => setActiveTab('full')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'full'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                完整排行榜
                <span className="ml-1.5 text-[10px] opacity-60">({leaderboard.length}人)</span>
              </button>
              <button
                onClick={() => setActiveTab('student')}
                className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all ${
                  activeTab === 'student'
                    ? 'bg-white text-orange-500 shadow-sm'
                    : 'text-slate-400 hover:text-slate-600'
                }`}
              >
                仅展示部分学生的排行榜
              </button>
            </div>

            {/* Tab 内容：完整排行榜（教师视角） */}
            {activeTab === 'full' && (
              <div className="space-y-3">
                <div className="space-y-1">
                  {leaderboard.map((s, idx) => (
                    <div key={idx} className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-slate-100">
                      <span className="text-sm font-bold text-slate-700">{s.name}</span>
                      <div className="text-right">
                        <div className="text-xs font-black text-slate-500">{s.score}<small className="text-slate-300 font-sans ml-0.5">分</small></div>
                        {s.reward > 0 ? (
                          <div className="text-[11px] font-black text-orange-500">预估 {s.reward.toFixed(2)}<small className="text-orange-300 font-sans ml-0.5">校园币</small></div>
                        ) : (
                          <div className="text-[10px] text-slate-400 font-bold pt-0.5">无得分奖励</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'student' && (
              <div className="space-y-3">

                {/* ── 没有任何参与者：全班无人参与 ── */}
                {leaderboard.length === 0 && (
                  <div className="px-3 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-400 text-center">
                    本月暂无同学参与奖励分配
                  </div>
                )}

                {/* ── 标杆展示：前3个分数段全员个人展示 ── */}
                {benchmarkGroups.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 pl-1">班级标杆榜</div>
                    <div className="space-y-1">
                      {benchmarkGroups.map(([score, students], groupIdx) => {
                        const isTop = groupIdx === 0;

                        return (
                          <div key={score} className="space-y-1">
                            {students.map((s, idx) => (
                              <div key={idx} className={`flex items-center justify-between px-3 py-2.5 rounded-xl border transition-all ${
                                isTop ? 'bg-amber-50 border-amber-100' : 'bg-slate-50 border-slate-100'
                              }`}>
                                <div className="flex items-center gap-2.5">
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-white font-black text-[10px] shrink-0 shadow-sm ${
                                    isTop ? 'bg-gradient-to-br from-amber-300 to-orange-500' : 'bg-gradient-to-br from-slate-300 to-slate-500'
                                  }`}>
                                    {s.name.replace('学生', '')}
                                  </div>
                                  <span className="font-bold text-slate-700 text-sm">{s.name}</span>
                                </div>
                                <div className="text-right">
                                  <div className={`font-black text-xs tabular-nums ${isTop ? 'text-amber-600' : 'text-slate-500'}`}>
                                    {s.score}<small className="text-slate-300 font-sans ml-0.5">分</small>
                                  </div>
                                  {s.reward > 0 ? (
                                    <div className="font-black text-orange-500 text-[11px] tabular-nums">
                                      预估 {s.reward.toFixed(2)}<small className="text-orange-300 font-sans ml-0.5">校园币</small>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-slate-400 font-bold pt-0.5">无得分奖励</div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* 我的得分：三种状态统一用相同行布局，与截图完全一致 */}
                {(myRewardPreview || selfStudent) && (() => {
                  // 确定显示内容
                  const isEligible = myRewardPreview?.eligible === true;
                  const isIneligible = myRewardPreview?.eligible === false;
                  const displayScore = myRewardPreview ? myScore : (selfStudent?.score?.toString() ?? '—');
                  const displayReward = isEligible && myRewardPreview?.myReward !== undefined
                    ? myRewardPreview.myReward
                    : (!myRewardPreview && selfStudent ? selfStudent.reward : null);

                  return (
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">我的得分</div>
                      <div className={`flex items-center justify-between px-3 py-3 rounded-xl border ${
                        isIneligible ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-100'
                      }`}>
                        {/* 左侧：头像 + 名字 */}
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-[11px] shrink-0 shadow-sm ${
                            isIneligible
                              ? 'bg-slate-300'
                              : 'bg-gradient-to-br from-blue-400 to-blue-600'
                          }`}>
                            我
                          </div>
                          <div>
                            <div className="font-black text-slate-700 text-sm flex items-center gap-1.5">
                              学生1
                              <span className="text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">我</span>
                            </div>
                            {isIneligible && (
                              <div className="text-[10px] font-black mt-0.5 text-slate-400">不参与奖励分配</div>
                            )}
                          </div>
                        </div>
                        {/* 右侧：分数 + 预估 */}
                        <div className="text-right shrink-0">
                          <div className={`font-black text-sm tabular-nums ${isIneligible ? 'text-slate-500' : 'text-blue-600'}`}>
                            {displayScore}<small className="text-slate-400 font-sans ml-0.5">分</small>
                          </div>
                          {displayReward !== null && (
                            <div className="font-black text-orange-500 text-xs tabular-nums flex items-center gap-1 justify-end">
                              <span className="text-slate-400 font-medium text-[10px]">预估</span>
                              {displayReward.toFixed(2)}<small className="text-orange-300 font-sans ml-0.5">校园币</small>
                            </div>
                          )}
                          {isIneligible && (
                            <div className="text-[10px] text-slate-400 font-medium">无得分奖励</div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

              </div>
            )}
          </div>
        )}
      </div>
      <style>{`
        .side-panel-scroll::-webkit-scrollbar { width: 4px; }
        .side-panel-scroll::-webkit-scrollbar-track { background: transparent; }
        .side-panel-scroll::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .side-panel-scroll { scrollbar-width: thin; scrollbar-color: #e2e8f0 transparent; }
      `}</style>
    </div>
  );
};








const INITIAL_STUDENT: Student = {
  id: 'st_001',
  name: '郑小磊',
  avatar: 'https://images.unsplash.com/photo-1595152772835-219674b2a8a6?auto=format&fit=crop&q=80&w=400&h=400',
  points: 1250,
  campusCoins: 245.50,
  class: '四年级一班'
};

const INITIAL_BANK: BankAccount = {
  currentBalance: 0,
  deposits: [
    {
      id: 'dep_1',
      type: 'fixed',
      amount: 100,
      startDate: Date.now() - 86400000 * 5,
      termDays: 7,
      interestRate: 0.01,
      status: 'active',
      label: '1周定期'
    },
    {
      id: 'dep_2',
      type: 'current',
      amount: 50,
      startDate: Date.now() - 86400000 * 2,
      termDays: 0,
      interestRate: BANK_CONFIG.DAILY_RATE,
      status: 'active',
      label: '活期存单'
    }
  ]
};

const TerminalApp: React.FC<{
  mode?: 'vending' | 'all-in-one';
  embedded?: boolean;
  loginMethods?: StudentLoginMethods;
  parentEvaluationVisibility?: ParentEvaluationVisibilitySettings;
  onViewChange?: (view: ViewState) => void;
}> = ({
  mode = 'vending',
  embedded = false,
  loginMethods = { face: true, password: true },
  parentEvaluationVisibility,
  onViewChange,
}) => {
  const isVending = mode === 'vending';
  const faceLoginEnabled = !isVending || loginMethods.face;
  const passwordLoginEnabled = !isVending || loginMethods.password;
  const [view, setView] = useState<ViewState>(isVending ? 'welcome' : 'scanning');
  const [loginSubView, setLoginSubView] = useState<'face' | 'password'>(isVending ? 'face' : 'password');
  const [student, setStudent] = useState<Student>(INITIAL_STUDENT);
  const [bank, setBank] = useState<BankAccount>(INITIAL_BANK);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(TERMINAL_IDLE_SECONDS);

  // admin login state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  // student password modal state
  const [showStudentLoginModal, setShowStudentLoginModal] = useState(false);
  const [isGuestBrowsing, setIsGuestBrowsing] = useState(false);
  const [returnToShopAfterLogin, setReturnToShopAfterLogin] = useState(false);
  const [shopScrollTop, setShopScrollTop] = useState(0);
  const [pendingPurchaseProductId, setPendingPurchaseProductId] = useState<string | null>(null);
  const [pageTransitionDirection, setPageTransitionDirection] = useState<'forward' | 'back'>('forward');

  const navigateTo = (nextView: ViewState, direction: 'forward' | 'back' = 'forward') => {
    setPageTransitionDirection(direction);
    setView(nextView);
  };

  React.useEffect(() => {
    onViewChange?.(view);
  }, [onViewChange, view]);

  // 1. Idle Screensaver & Click Sound Feedback
  React.useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    let intervalTimer: ReturnType<typeof setInterval>;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      clearInterval(intervalTimer);
      setIdleSecondsLeft(TERMINAL_IDLE_SECONDS);

      if (view !== 'welcome' && view !== 'scanning' && view !== 'vending-admin') {
        intervalTimer = setInterval(() => {
          setIdleSecondsLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);

        idleTimer = setTimeout(() => {
          navigateTo(isVending ? 'welcome' : 'scanning', 'back');
          setIsGuestBrowsing(false);
          setReturnToShopAfterLogin(false);
          setShopScrollTop(0);
          setShowStudentLoginModal(false);
          setPendingPurchaseProductId(null);
          setStudent(INITIAL_STUDENT);
          setBank(INITIAL_BANK);
          setIsLoading(false);
        }, TERMINAL_IDLE_SECONDS * 1000);
      }
    };

    const handleInteraction = () => {
      // Don't play click sound in vending admin
      if (view !== 'vending-admin') {
        playSound('click');
      }
      resetTimer();
    };

    document.addEventListener('click', handleInteraction, true);
    document.addEventListener('touchstart', handleInteraction, true);
    resetTimer();

    return () => {
      document.removeEventListener('click', handleInteraction, true);
      document.removeEventListener('touchstart', handleInteraction, true);
      clearTimeout(idleTimer);
      clearInterval(intervalTimer);
    };
  }, [view]);

  // Loading wrapper for actions
  const withLoading = <T,>(action: () => T, successSound: 'coin' | 'success' = 'success'): Promise<T | undefined> => {
    if (isLoading) return Promise.resolve(undefined);
    setIsLoading(true);
    return new Promise(resolve => {
      setTimeout(() => {
        const result = action();
        if (result !== false) {
          playSound(successSound);
        }
        setIsLoading(false);
        resolve(result);
      }, 1200);
    });
  };

  const handleAdminLogin = () => {
    const trimmed = adminPassword.trim();
    if (trimmed === '123456' || trimmed === 'Admin@888' || trimmed.toLowerCase() === 'admin') {
      setShowAdminLogin(false);
      setAdminPassword('');
      setLoginError(false);
      navigateTo('vending-admin');
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const bankBalance = bank.deposits.reduce((s, d) => s + d.amount, 0);

  const handleStudentLoginSuccess = () => {
    setShowStudentLoginModal(false);
    setIsGuestBrowsing(false);
    if (returnToShopAfterLogin) {
      setReturnToShopAfterLogin(false);
      navigateTo('shop');
      return;
    }
    navigateTo('dashboard');
  };

  const handleExchange = (pointsToRedeem: number) => {
    withLoading(() => {
      const coinsGained = Math.floor(pointsToRedeem / EXCHANGE_RATE);
      setStudent(prev => ({
        ...prev,
        points: prev.points - pointsToRedeem,
        campusCoins: prev.campusCoins + coinsGained
      }));
      navigateTo('dashboard');
    }, 'coin');
  };

  const handlePurchase = async (product: Product): Promise<boolean> => {
    return await withLoading(() => {
      if (student.campusCoins >= product.price) {
        setStudent(prev => ({
          ...prev,
          campusCoins: prev.campusCoins - product.price
        }));

        // 扣减实际库存
        if (product.type === 'standard') {
          setProducts(prev => prev.map(p =>
            p.id === product.id ? { ...p, stock: Math.max(0, p.stock - 1) } : p
          ));
        }
        return true;
      }
      return false;
    }, 'success') === true;
  };

  const handleCreateDeposit = (amount: number, days: number, rate: number, label: string, type: 'fixed' | 'current') => {
    withLoading(() => {
      if (student.campusCoins >= amount) {
        const newDeposit: Deposit = {
          id: `dep_${Date.now()}_${Math.random().toString(36).substr(2, 4)}`,
          type,
          amount,
          startDate: Date.now(),
          termDays: days,
          interestRate: rate,
          status: 'active',
          label
        };
        setStudent(prev => ({ ...prev, campusCoins: prev.campusCoins - amount }));
        setBank(prev => ({
          ...prev,
          deposits: [...prev.deposits, newDeposit]
        }));
      }
    }, 'success');
  };

  const handleWithdrawDeposit = (deposit: Deposit) => {
    withLoading(() => {
      const elapsedDays = (Date.now() - deposit.startDate) / 86400000;
      let interestGained = 0;

      if (deposit.type === 'current') {
        interestGained = deposit.amount * BANK_CONFIG.DAILY_RATE * elapsedDays;
      } else {
        const isMatured = elapsedDays >= deposit.termDays;
        if (isMatured) {
          interestGained = deposit.amount * deposit.interestRate;
        } else {
          interestGained = deposit.amount * BANK_CONFIG.DAILY_RATE * elapsedDays;
        }
      }

      const finalAmount = Math.round(deposit.amount + interestGained);

      setBank(prev => ({
        ...prev,
        deposits: prev.deposits.filter(d => d.id !== deposit.id)
      }));
      setStudent(prev => ({
        ...prev,
        campusCoins: prev.campusCoins + finalAmount
      }));
    }, 'coin');
  };

  const renderView = () => {
    switch (view) {
      case 'welcome':
        if (isVending) {
          return (
            <div className="flex flex-col items-center justify-between h-full text-center px-8 pt-8 pb-12 select-none">
              {/* 上半部分：品牌形象与主副标题（自然上移至学生最佳平视区，舒展饱满） */}
              <div className="flex flex-col items-center w-full max-w-[420px] pt-4">
                {/* Logo 带柔和外发光与质感边框 */}
                <div className="relative group mb-6">
                  <div className="absolute -inset-6 bg-blue-400/25 rounded-full blur-[60px] animate-pulse pointer-events-none"></div>
                  <img
                    src="/assets/school_cover.png"
                    alt="校园星光"
                    className="relative w-56 h-56 rounded-[2.75rem] shadow-[0_20px_40px_-12px_rgba(37,99,235,0.22)] mx-auto border-[6px] border-white object-cover"
                  />
                </div>

                {/* 标题区：大字号、紧凑行距 */}
                <div className="space-y-3">
                  <h1 className="text-[52px] font-black text-blue-900 tracking-tight leading-[1.08]">
                    校园星光<br />
                    <span className="text-blue-600 mt-2 block">货柜机</span>
                  </h1>
                  <div className="text-xl text-slate-400 font-bold flex items-center justify-center gap-3 pt-3">
                    <div className="h-px w-8 bg-slate-200"></div>
                    <span>点滴进步，成就未来</span>
                    <div className="h-px w-8 bg-slate-200"></div>
                  </div>
                </div>
              </div>

              {/* 下半部分：入口按钮区（处于抬手最顺手的黄金触控区，高度严格统一 80px，字号统一 22px，图标统一 28px） */}
              <div className="flex w-full max-w-[420px] flex-col gap-4 shrink-0 mb-2">
                {faceLoginEnabled && (
                  <button
                    onClick={() => { navigateTo('scanning'); setLoginSubView('face'); }}
                    className="h-[80px] w-full rounded-2xl px-6 text-[22px] font-black flex items-center justify-center gap-3 transition-all duration-150 border-2 border-blue-600 bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] active:scale-[0.98] active:bg-blue-700 active:border-blue-700 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                  >
                    <Camera size={28} aria-hidden="true" />
                    <span>刷脸登录</span>
                  </button>
                )}

                {passwordLoginEnabled && (
                  <button
                    onClick={() => {
                      setLoginSubView('password');
                      setShowStudentLoginModal(true);
                    }}
                    className={`h-[80px] w-full rounded-2xl px-6 text-[22px] font-black flex items-center justify-center gap-3 transition-all duration-150 border-2 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200 ${
                      faceLoginEnabled
                        ? 'border-blue-100 bg-blue-50 text-blue-700 active:bg-blue-100 active:border-blue-200'
                        : 'border-blue-600 bg-blue-600 text-white shadow-[0_8px_20px_rgba(37,99,235,0.28)] active:bg-blue-700 active:border-blue-700'
                    }`}
                  >
                    <KeyRound size={28} aria-hidden="true" />
                    <span>密码登录</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    if (!returnToShopAfterLogin) setShopScrollTop(0);
                    setIsGuestBrowsing(true);
                    navigateTo('shop');
                  }}
                  className="h-[80px] w-full rounded-2xl px-6 text-[22px] font-black flex items-center justify-center gap-3 transition-all duration-150 border-2 border-slate-200/90 bg-white text-slate-700 shadow-sm hover:border-slate-300 active:scale-[0.98] active:border-blue-300 active:bg-slate-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-blue-200"
                >
                  <ShoppingBag size={28} className="text-blue-600" aria-hidden="true" />
                  <span>查看商品</span>
                </button>
              </div>
            </div>
          );
        }

        return (
          <div className="flex flex-col items-center justify-center h-full gap-8 text-center px-10 pt-16 pb-20">
            <div className="relative group mt-6">
              <div className="absolute -inset-8 bg-blue-400 rounded-full blur-[80px] opacity-20 animate-pulse transition-all"></div>
              <img
                src="/assets/school_cover.png"
                alt="School Feature"
                className="relative w-56 h-56 rounded-[3rem] shadow-2xl mb-8 mx-auto border-8 border-white transition-transform duration-500 object-cover"
              />
            </div>

            <div className="space-y-4">
              <h1 className="text-6xl font-black text-blue-900 tracking-tighter leading-none">
                校园星光<br />
                <span className="text-blue-600 mt-2 block">班级一体机</span>
              </h1>
              <div className="text-xl text-slate-400 mt-5 font-bold flex items-center justify-center gap-3">
                <div className="h-px w-6 bg-slate-200"></div>
                点滴进步，成就未来
                <div className="h-px w-6 bg-slate-200"></div>
              </div>
            </div>

            <div className="mt-auto flex w-full max-w-sm flex-col gap-4 pt-8">
              {faceLoginEnabled && (
                <button
                  onClick={() => { navigateTo('scanning'); setLoginSubView('face'); }}
                  className={`${TERMINAL_ENTRY_BUTTON_BASE} ${TERMINAL_ENTRY_BUTTON_PRIMARY}`}
                >
                  <Camera size={24} aria-hidden="true" />
                  <span>刷脸登录</span>
                </button>
              )}

              {passwordLoginEnabled && (
                <button
                  onClick={() => {
                    navigateTo('scanning');
                    setLoginSubView('password');
                  }}
                  className={`${TERMINAL_ENTRY_BUTTON_BASE} ${faceLoginEnabled
                    ? TERMINAL_ENTRY_BUTTON_SECONDARY
                    : TERMINAL_ENTRY_BUTTON_PRIMARY}`}
                >
                  <KeyRound size={24} aria-hidden="true" />
                  <span>密码登录</span>
                </button>
              )}
            </div>
          </div>
        );
      case 'scanning':
        return loginSubView === 'face' ? (
          <FaceScanner 
            onSuccess={() => { playSound('success'); handleStudentLoginSuccess(); }}
            onSwitch={passwordLoginEnabled ? () => setLoginSubView('password') : undefined}
            isVending={isVending}
          />
        ) : (
          <AccountLogin 
            onSuccess={handleStudentLoginSuccess}
            onBack={undefined}
            onFaceLogin={faceLoginEnabled ? () => setLoginSubView('face') : undefined}
            layout={isVending ? 'vertical' : 'horizontal'}
            demoRelaxedValidation={isVending}
          />
        );
      case 'dashboard':
        return <Dashboard student={student} onNavigate={(v) => { 
          if (v === 'welcome') {
            navigateTo(isVending ? 'welcome' : 'scanning', 'back');
            setLoginSubView(isVending ? 'face' : 'password');
          } else {
            navigateTo(v);
          }
        }} bankBalance={bankBalance} layout={isVending ? 'mobile' : 'pc'} hideShop={!isVending} />;
      case 'exchange':
        return <ExchangeView student={student} onExchange={handleExchange} onBack={() => navigateTo('dashboard', 'back')} />;
      case 'shop':
        return (
          <ShopView
            student={student}
            products={products}
            onPurchase={handlePurchase}
            onBack={() => {
              navigateTo(isGuestBrowsing ? 'welcome' : 'dashboard', 'back');
              setIsGuestBrowsing(false);
            }}
            isGuest={isGuestBrowsing}
            initialScrollTop={shopScrollTop}
            pendingPurchaseProductId={pendingPurchaseProductId}
            onPendingPurchaseHandled={() => setPendingPurchaseProductId(null)}
            onRequireLogin={(product, scrollTop) => {
              setShopScrollTop(scrollTop);
              setReturnToShopAfterLogin(true);
              setPendingPurchaseProductId(product.id);
              setLoginSubView(passwordLoginEnabled ? 'password' : 'face');
              setShowStudentLoginModal(true);
            }}
          />
        );
      case 'bank':
        return <BankView
          student={student}
          bank={bank}
          onDeposit={(amt, days, rate, label, type) => handleCreateDeposit(amt, days, rate, label, type as any)}
          onWithdrawDeposit={handleWithdrawDeposit}
          onBack={() => navigateTo('dashboard', 'back')}
        />;
      case 'growth':
        return <GrowthView
          student={student}
          onBack={() => navigateTo('dashboard', 'back')}
          parentEvaluationVisibility={parentEvaluationVisibility}
        />;
      case 'transactions':
        return <TransactionView student={student} onBack={() => navigateTo('dashboard', 'back')} />;
      case 'vending-admin':
        return (
          <VendingAdmin
            products={products}
            setProducts={setProducts}
            onExit={() => navigateTo(isVending ? 'welcome' : 'scanning', 'back')}
            deviceId="DEV-2026-F1-01"
            deviceName="1号教学楼1层中厅智能柜"
            initialActivationCode="849201"
          />
        );
      default:
        return <div>错误状态</div>;
    }
  };

  const innerContent = (
    <div
      className="glass-panel overflow-hidden flex flex-col relative w-full h-full"
      style={{
        borderRadius: '0',
        boxShadow: isVending ? '0 20px 50px -12px rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08)' : 'none'
      }}
    >
      {/* 登录页管理员入口 */}
      {view === 'welcome' && isVending && (
        <div className="absolute top-6 right-6 z-[110]">
          <button
            onClick={() => { setShowAdminLogin(true); }}
            className="bg-white/50 backdrop-blur-md p-3 rounded-2xl flex items-center justify-center text-slate-400 active:scale-95 transition-all outline-none border border-white/60 shadow-sm"
            title="设备维护"
          >
            <Settings size={24} className="text-slate-600 drop-shadow-sm" />
          </button>
        </div>
      )}

      {/* 管理员登录弹窗 */}
      {showAdminLogin && (
        <div className="absolute inset-0 z-[200] bg-slate-900/60 backdrop-blur-md flex flex-col items-center justify-center p-8 animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-[320px] rounded-[2.5rem] p-8 flex flex-col items-center shadow-2xl relative border-4 border-white/50">
            <div className="w-20 h-20 bg-blue-50 text-blue-500 rounded-[1.5rem] flex items-center justify-center mb-5 shadow-inner">
              <ShieldCheck size={40} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 tracking-tight">管理员验证</h2>
            <p className="text-slate-400 font-bold mb-6 text-xs mt-1 tracking-widest">设备维护需要密码授权</p>

            <input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              placeholder="demo体验密码123456"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-center text-xl font-[NumberFont] font-black tracking-widest focus:border-blue-400 focus:bg-white focus:outline-none mb-1 shadow-inner transition-all placeholder:text-sm placeholder:font-sans placeholder:font-black placeholder:tracking-normal"
            />

            <div className="h-6 flex items-center justify-center mb-3">
              {loginError && <p className="text-red-500 text-[11px] font-bold animate-in slide-in-from-top-1 bg-red-50 px-3 py-1 rounded-full border border-red-100">密码错误，请重试</p>}
            </div>

            <div className="flex w-full gap-3">
              <button onClick={() => { setShowAdminLogin(false); setAdminPassword(''); setLoginError(false); }} className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-xl font-black active:bg-slate-200 transition-colors">取消</button>
              <button onClick={handleAdminLogin} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-600/20 active:bg-blue-700 transition-colors">验证登录</button>
            </div>
          </div>
        </div>
      )}

      {showStudentLoginModal && (
        <div
          className="absolute inset-0 z-[200] bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-label="学生登录"
        >
          {loginSubView === 'password' && passwordLoginEnabled ? (
            <AccountLogin
              onSuccess={handleStudentLoginSuccess}
              onBack={() => {
                setShowStudentLoginModal(false);
                setReturnToShopAfterLogin(false);
                setPendingPurchaseProductId(null);
              }}
              onFaceLogin={faceLoginEnabled ? () => setLoginSubView('face') : undefined}
              layout="vertical"
              demoRelaxedValidation={isVending}
            />
          ) : (
            <div className="h-full w-full p-6 flex items-center justify-center">
              <div className="relative h-[720px] max-h-full w-full max-w-[420px] overflow-hidden rounded-[2.5rem] border-4 border-blue-50 bg-[#f8fbff] shadow-2xl">
                <button
                  type="button"
                  onClick={() => {
                    setShowStudentLoginModal(false);
                    setReturnToShopAfterLogin(false);
                    setPendingPurchaseProductId(null);
                  }}
                  aria-label="关闭登录"
                  className="absolute left-5 top-5 z-[60] flex h-14 w-14 items-center justify-center rounded-[1.25rem] border border-slate-100 bg-white/90 text-slate-500 shadow-lg backdrop-blur-md active:bg-slate-100"
                >
                  <ChevronLeft size={30} strokeWidth={2.5} />
                </button>
                <FaceScanner
                  onSuccess={() => {
                    playSound('success');
                    handleStudentLoginSuccess();
                  }}
                  onSwitch={passwordLoginEnabled ? () => setLoginSubView('password') : undefined}
                  isVending
                />
              </div>
            </div>
          )}
        </div>
      )}

      {view !== 'welcome' && view !== 'scanning' && view !== 'vending-admin' && !isGuestBrowsing && (
        <div className="absolute z-[90] top-8 -translate-y-6 left-1/2 -translate-x-1/2 bg-slate-900/10 backdrop-blur-md px-3.5 py-1 rounded-full flex items-center gap-2 pointer-events-none shadow-sm transition-all duration-300">
          <div className={`w-1.5 h-1.5 rounded-full ${idleSecondsLeft <= 10 ? 'bg-red-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></div>
          <span className="text-slate-700 font-bold text-[11px] tracking-wider">{idleSecondsLeft}s 后自动退出</span>
        </div>
      )}

      {view !== 'welcome' && view !== 'scanning' && view !== 'dashboard' && view !== 'vending-admin' && (
        <div className="h-16 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-50">
          <button
            onClick={() => {
              navigateTo(isGuestBrowsing ? 'welcome' : 'dashboard', 'back');
              setIsGuestBrowsing(false);
              if (view === 'shop') {
                setReturnToShopAfterLogin(false);
                setShopScrollTop(0);
              }
            }}
            className="flex items-center space-x-1 text-blue-600 font-bold text-base active:bg-blue-50 px-2.5 py-1.5 rounded-xl shrink-0"
          >
            <ChevronLeft size={22} />
            <span>返回首页</span>
          </button>
          {((view === 'shop' && !isGuestBrowsing) || view === 'growth' || view === 'bank') && (
            <div
              className="flex items-center gap-1.5 shrink-0"
              aria-label={`${GROWTH_COIN_TERMS.available}${GROWTH_COIN_TERMS.name}${student.campusCoins}，${GROWTH_COIN_TERMS.saved}${GROWTH_COIN_TERMS.name}${bankBalance}`}
            >
              <HeaderCoinBalance label={GROWTH_COIN_TERMS.available} value={student.campusCoins} tone="available" />
              <HeaderCoinBalance label={GROWTH_COIN_TERMS.saved} value={bankBalance} tone="saved" />
            </div>
          )}
        </div>
      )}

      <main className="flex-1 overflow-hidden relative">
        <div
          key={view === 'scanning' ? `${view}-${loginSubView}` : view}
          className={`h-full w-full animate-in ${pageTransitionDirection === 'back' ? 'slide-in-from-left-12' : 'slide-in-from-right-12'} duration-300 ease-out motion-reduce:animate-none`}
        >
          {renderView()}
        </div>
      </main>
      {/* 全局 Loading 拦截层 */}
      {isLoading && (
        <div
          className="absolute inset-0 z-[100] bg-slate-900/20 backdrop-blur-[2px] flex items-center justify-center animate-in fade-in duration-200"
          role="status"
          aria-live="polite"
          aria-label="处理中"
        >
          <div className="bg-white/95 backdrop-blur-md px-8 py-6 rounded-3xl shadow-2xl border border-slate-100 flex flex-col items-center justify-center min-w-[130px]">
            <Loader text="处理中..." size={40} />
          </div>
        </div>
      )}
    </div>
  );

  if (!isVending) {
    return (
      <div className={`${embedded ? 'w-full h-full' : 'w-screen h-[100dvh]'} bg-[#f8fbff] flex items-center justify-center overflow-hidden relative`}>
        {innerContent}
      </div>
    );
  }

  return (
    <div className={`${embedded ? 'w-full h-full' : 'w-screen h-[100dvh]'} bg-[#f0f9ff] flex items-center justify-center overflow-hidden p-2`}>
      {/* 21.5寸竖屏货柜机比例 540x960，保持固定参数确保scale不发生改变，切换开关零跳动 */}
      <DeviceWrapper
        width={540}
        height={960}
        padding={8} safetyGap={32} maxScale={1.1}
        previewAnchor="terminal-device"
      >
        {innerContent}
      </DeviceWrapper>
    </div>
  );
};

type PcWorkspaceTab = 'home' | PcPortalApp;

const PcWorkspace: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [openTabs, setOpenTabs] = useState<PcWorkspaceTab[]>(['home']);
  const [activeTab, setActiveTab] = useState<PcWorkspaceTab>('home');
  const [teacherProfile, setTeacherProfile] = useState<TeacherProfile>(DEMO_TEACHER_PROFILES[0]);

  const tabMeta: Record<PcWorkspaceTab, { label: string; icon: React.ReactNode }> = {
    home: { label: '首页', icon: <LayoutGrid size={15} /> },
    teacher: { label: '学校管理后台', icon: <Settings size={15} /> },
    'all-in-one': { label: '积分银行（一体机）', icon: <MonitorSmartphone size={15} /> },
    'smart-big-screen': { label: '课堂大屏', icon: <Monitor size={15} /> },
  };

  const openTab = (tab: PcPortalApp) => {
    setOpenTabs((prev) => (prev.includes(tab) ? prev : [...prev, tab]));
    setActiveTab(tab);
  };

  const closeTab = (tab: PcPortalApp) => {
    setOpenTabs((prev) => prev.filter((item) => item !== tab));
    setActiveTab((prev) => {
      if (prev !== tab) return prev;
      const nextTabs = openTabs.filter((item) => item !== tab);
      return nextTabs[nextTabs.length - 1] ?? 'home';
    });
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setOpenTabs(['home']);
    setActiveTab('home');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <SaaSPortal
            isLoggedIn
            teacherProfile={teacherProfile}
            onLoginSuccess={(profile) => {
              setTeacherProfile(profile);
              setIsLoggedIn(true);
            }}
            onLogout={handleLogout}
            onNavigate={openTab}
          />
        );
      case 'teacher':
        return <TeacherDashboard embedded onNavigateBigScreen={() => openTab('smart-big-screen')} />;
      case 'all-in-one':
        return <TerminalApp mode="all-in-one" embedded />;
      case 'smart-big-screen':
        return (
          <SmartBigScreen
            embedded
            onBack={() => setActiveTab(openTabs.includes('teacher') ? 'teacher' : 'home')}
          />
        );
      default:
        return null;
    }
  };

  if (!isLoggedIn) {
    return (
      <SaaSPortal
        isLoggedIn={false}
        teacherProfile={teacherProfile}
        onLoginSuccess={(profile) => {
          setTeacherProfile(profile);
          setIsLoggedIn(true);
        }}
        onLogout={handleLogout}
        onNavigate={openTab}
      />
    );
  }

  return (
    <div className="w-screen h-[100dvh] bg-[#edf3f8] flex flex-col overflow-hidden">
      <header className="h-14 bg-white border-b border-slate-200 flex items-center shrink-0 shadow-sm">
        <div className="flex items-center gap-3 min-w-0 pl-5 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#2a68ff] text-white flex items-center justify-center shadow-md shadow-blue-200 shrink-0">
            <PlatformBrandMark size={20} />
          </div>
          <div
            className="min-w-0 text-[18px] font-black text-slate-800 tracking-[0.01em] leading-none"
            style={{ fontFamily: '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif' }}
          >
            乐途 AI 智慧教育平台
          </div>
        </div>

        <div className="flex-1 min-w-0 px-5">
          <div className="flex items-center gap-2 min-w-max overflow-x-auto scrollbar-hide">
            {openTabs.map((tab) => {
              const active = activeTab === tab;
              return (
                <div
                  key={tab}
                  className={`h-9 rounded-xl border flex items-center gap-2 pl-3.5 pr-2.5 transition-all shrink-0 ${
                    active ? 'bg-blue-50 border-blue-200 text-blue-700 shadow-sm' : 'bg-slate-50 border-slate-200 text-slate-500 hover:text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <button
                    onClick={() => setActiveTab(tab)}
                    className="h-full flex items-center gap-2 text-sm font-bold"
                  >
                    {tabMeta[tab].icon}
                    <span>{tabMeta[tab].label}</span>
                  </button>
                  {tab !== 'home' && (
                    <button
                      onClick={() => closeTab(tab)}
                      className="w-6 h-6 rounded-lg hover:bg-white/80 text-slate-400 hover:text-slate-600 transition-colors flex items-center justify-center"
                      title={`关闭${tabMeta[tab].label}`}
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0 pr-5">
          <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
              <span className="text-[13px] font-black">{teacherProfile.name.slice(0, 1)}</span>
            </div>
            <div className="hidden md:block text-[13px] font-bold text-slate-700 leading-none">{teacherProfile.name}</div>
            <button
              onClick={handleLogout}
              className="h-9 px-3 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors flex items-center justify-center gap-1.5 active:scale-95"
              title="退出登录"
            >
              <LogOut size={16} />
              <span className="text-sm font-bold">退出</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 overflow-hidden">{renderContent()}</main>
    </div>
  );
};

const AppSwitcher: React.FC = () => {
  const questionnaireInviteCode = useMemo(() => (
    new URLSearchParams(window.location.search).get('questionnaireInvite')?.trim() ?? ''
  ), []);
  const [currentApp, setCurrentApp] = useState<'terminal' | 'admin' | 'teacher-c-mobile' | 'companion' | 'all-in-one' | 'parent' | 'pc-workspace' | 'region-pc' | 'region-pc-screen' | 'ui-renovation'>(() => {
    const params = new URLSearchParams(window.location.search);
    const app = params.get('app');
    if (app === 'terminal' || app === 'admin' || app === 'teacher-c-mobile' || app === 'companion' || app === 'all-in-one' || app === 'parent' || app === 'pc-workspace' || app === 'region-pc' || app === 'region-pc-screen' || app === 'ui-renovation') {
      return app;
    }
    return 'terminal'; // default
  });
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [studentLoginPreviewMode, setStudentLoginPreviewMode] = useState<StudentLoginPreviewMode>('password-only');
  const [terminalView, setTerminalView] = useState<ViewState>('welcome');
  const [terminalPreviewDockLeft, setTerminalPreviewDockLeft] = useState<number | null>(null);
  const [shopLayoutPresetId, setShopLayoutPresetId] = useState<TerminalShopLayoutPresetId>(() => (
    readTerminalShopLayoutPresetId()
  ));
  const [showPhoneShell, setShowPhoneShell] = useState(true);
  const [teacherGradientScheme, setTeacherGradientScheme] = useState<TeacherGradientSchemeId>(defaultTeacherGradientPreview.schemeId);
  const [teacherGradientStyle, setTeacherGradientStyle] = useState<TeacherGradientStyleId>(defaultTeacherGradientPreview.styleId);
  const [parentGradientScheme, setParentGradientScheme] = useState<TeacherGradientSchemeId>(defaultParentGradientPreview.schemeId);
  const [parentGradientStyle, setParentGradientStyle] = useState<TeacherGradientStyleId>(defaultParentGradientPreview.styleId);
  const [isTeacherGradientControlsOpen, setIsTeacherGradientControlsOpen] = useState(false);
  const [studentTeamInvitePreview, setStudentTeamInvitePreview] = useState(false);
  const [isStudentTeamListViewActive, setIsStudentTeamListViewActive] = useState(false);
  const [headteacherAssistantScopePreview, setHeadteacherAssistantScopePreview] = useState<HeadteacherAssistantScopePreviewMode | null>(null);
  const [headteacherAssistantScopePreviewDefault, setHeadteacherAssistantScopePreviewDefault] = useState<HeadteacherAssistantScopePreviewMode | null>(null);
  const [isHeadteacherAssistantViewActive, setIsHeadteacherAssistantViewActive] = useState(false);
  const headteacherAssistantScopePreviewMode = headteacherAssistantScopePreview ?? headteacherAssistantScopePreviewDefault;
  const showParentPhoneShell = false;
  const [parentPreviewClassId, setParentPreviewClassId] = useState(DEFAULT_PARENT_PREVIEW_CLASS_ID);
  const [parentEvaluationVisibility, setParentEvaluationVisibility] = useState<ParentEvaluationVisibilitySettings>(() => (
    readParentEvaluationVisibility(DEFAULT_PARENT_PREVIEW_CLASS_ID)
  ));
  const [parentBankFeatureEnabled, setParentBankFeatureEnabled] = useState(() => (
    readParentBankFeatureEnabled(DEFAULT_PARENT_PREVIEW_CLASS_ID)
  ));
  const [showAdvancedApps, setShowAdvancedApps] = useState(false);
  const [teacherScreenshotStatus, setTeacherScreenshotStatus] = useState<'idle' | 'capturing' | 'success' | 'error'>('idle');
  const [showTeacherDeveloperNotes, setShowTeacherDeveloperNotes] = useState(false);
  const [teacherDeveloperNotesContext, setTeacherDeveloperNotesContext] = useState<TeacherMobileDeveloperNotesContext | null>(null);

  useEffect(() => {
    if (currentApp !== 'terminal') {
      setTerminalView('welcome');
    }

    if (currentApp !== 'terminal') {
      setTerminalPreviewDockLeft(null);
      return;
    }

    let frame = 0;
    const updateDockPosition = () => {
      const anchor = document.querySelector<HTMLElement>('[data-preview-anchor="terminal-device"]');
      if (!anchor) {
        frame = window.requestAnimationFrame(updateDockPosition);
        return;
      }

      const deviceRight = anchor.getBoundingClientRect().right;
      const controlWidth = 272;
      const viewportPadding = 16;
      const gap = 32;
      const maxLeft = Math.max(viewportPadding, window.innerWidth - controlWidth - viewportPadding);
      setTerminalPreviewDockLeft(Math.min(deviceRight + gap, maxLeft));
    };

    updateDockPosition();
    window.addEventListener('resize', updateDockPosition);
    const observer = new ResizeObserver(() => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateDockPosition);
    });
    observer.observe(document.documentElement);

    return () => {
      window.removeEventListener('resize', updateDockPosition);
      observer.disconnect();
      window.cancelAnimationFrame(frame);
    };
  }, [currentApp, studentLoginPreviewMode]);
  const teacherDeveloperNotesContextRef = useRef<TeacherMobileDeveloperNotesContext | null>(null);
  const [demoPanelPosition, setDemoPanelPosition] = useState<{ left: number; top: number } | null>(null);
  const [demoPanelSide, setDemoPanelSide] = useState<'left' | 'right' | 'top' | 'bottom'>('right');
  const [isDemoPanelSnapped, setIsDemoPanelSnapped] = useState(false);
  const demoPanelRef = useRef<HTMLDivElement | null>(null);
  const teacherPhoneScreenRef = useRef<HTMLDivElement | null>(null);
  const teacherScreenshotResetTimerRef = useRef<number | null>(null);
  const demoDragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    startLeft: number;
    startTop: number;
    moved: boolean;
  } | null>(null);
  const skipDemoToggleRef = useRef(false);
  const environmentTitleClickCountRef = useRef(0);

  useEffect(() => {
    const refreshParentEvaluationVisibility = () => {
      setParentEvaluationVisibility(readParentEvaluationVisibility(parentPreviewClassId));
    };
    refreshParentEvaluationVisibility();
    window.addEventListener(PARENT_EVALUATION_VISIBILITY_UPDATED_EVENT, refreshParentEvaluationVisibility);
    window.addEventListener('storage', refreshParentEvaluationVisibility);
    return () => {
      window.removeEventListener(PARENT_EVALUATION_VISIBILITY_UPDATED_EVENT, refreshParentEvaluationVisibility);
      window.removeEventListener('storage', refreshParentEvaluationVisibility);
    };
  }, [parentPreviewClassId]);

  useEffect(() => {
    const refreshParentBankFeature = () => {
      setParentBankFeatureEnabled(readParentBankFeatureEnabled(parentPreviewClassId));
    };
    refreshParentBankFeature();
    window.addEventListener(PARENT_BANK_FEATURE_UPDATED_EVENT, refreshParentBankFeature);
    window.addEventListener('storage', refreshParentBankFeature);
    return () => {
      window.removeEventListener(PARENT_BANK_FEATURE_UPDATED_EVENT, refreshParentBankFeature);
      window.removeEventListener('storage', refreshParentBankFeature);
    };
  }, [parentPreviewClassId]);

  const updateShopLayoutPresetId = (presetId: TerminalShopLayoutPresetId) => {
    setShopLayoutPresetId(writeTerminalShopLayoutPresetId(presetId));
  };

  const updateParentEvaluationVisibility = (settings: ParentEvaluationVisibilitySettings) => {
    setParentEvaluationVisibility(writeParentEvaluationVisibility(parentPreviewClassId, settings));
  };

  const updateParentBankFeature = (enabled: boolean) => {
    setParentBankFeatureEnabled(writeParentBankFeatureEnabled(parentPreviewClassId, enabled));
  };

  const handleRegionalPcLogout = () => {
    const url = new URL(window.location.href);
    url.searchParams.set('app', 'terminal');
    window.history.replaceState(null, '', url.toString());
    setCurrentApp('terminal');
  };

  const clampDemoPanelPosition = (left: number, top: number) => {
    const panel = demoPanelRef.current;
    const width = panel?.offsetWidth ?? 104;
    const height = panel?.offsetHeight ?? 320;
    const maxLeft = Math.max(0, window.innerWidth - width);
    const maxTop = Math.max(0, window.innerHeight - height);

    return {
      left: Math.min(Math.max(0, left), maxLeft),
      top: Math.min(Math.max(0, top), maxTop),
    };
  };

  const snapDemoPanelToEdge = (left: number, top: number) => {
    const panel = demoPanelRef.current;
    const width = panel?.offsetWidth ?? 104;
    const height = panel?.offsetHeight ?? 320;
    const maxLeft = Math.max(0, window.innerWidth - width);
    const maxTop = Math.max(0, window.innerHeight - height);
    const clamped = clampDemoPanelPosition(left, top);
    const edgeDistances = [
      { side: 'left' as const, distance: clamped.left },
      { side: 'right' as const, distance: maxLeft - clamped.left },
      { side: 'top' as const, distance: clamped.top },
      { side: 'bottom' as const, distance: maxTop - clamped.top },
    ];
    const nearestEdge = edgeDistances.reduce((nearest, item) => (
      item.distance < nearest.distance ? item : nearest
    ));

    setDemoPanelSide(nearestEdge.side);
    setIsDemoPanelSnapped(true);
    setDemoPanelPosition({
      left: nearestEdge.side === 'left' ? 0 : nearestEdge.side === 'right' ? maxLeft : clamped.left,
      top: nearestEdge.side === 'top' ? 0 : nearestEdge.side === 'bottom' ? maxTop : clamped.top,
    });
  };

  const handleDemoDragStart = (event: React.PointerEvent<HTMLButtonElement>) => {
    const panel = demoPanelRef.current;
    if (!panel) return;

    const rect = panel.getBoundingClientRect();
    const currentLeft = demoPanelPosition?.left ?? (
      isDemoOpen
        ? rect.left
        : demoPanelSide === 'left'
          ? rect.left + rect.width - 32
          : demoPanelSide === 'right'
            ? rect.left - rect.width + 32
            : rect.left
    );
    const currentTop = demoPanelPosition?.top ?? (
      isDemoOpen
        ? rect.top
        : demoPanelSide === 'top'
          ? rect.top + rect.height - 32
          : demoPanelSide === 'bottom'
            ? rect.top - rect.height + 32
            : rect.top
    );

    demoDragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: currentLeft,
      startTop: currentTop,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleDemoDragMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = demoDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      drag.moved = true;
      skipDemoToggleRef.current = true;
    }

    if (!drag.moved) return;
    event.preventDefault();
    setIsDemoPanelSnapped(false);
    setDemoPanelPosition(clampDemoPanelPosition(drag.startLeft + deltaX, drag.startTop + deltaY));
  };

  const handleDemoDragEnd = (event: React.PointerEvent<HTMLButtonElement>) => {
    const drag = demoDragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    if (drag.moved) {
      snapDemoPanelToEdge(drag.startLeft + event.clientX - drag.startX, drag.startTop + event.clientY - drag.startY);
      window.setTimeout(() => {
        skipDemoToggleRef.current = false;
      }, 0);
    }
    demoDragRef.current = null;
  };

  const handleDemoToggle = () => {
    if (skipDemoToggleRef.current) {
      skipDemoToggleRef.current = false;
      return;
    }
    setIsDemoOpen(prev => !prev);
  };

  const handleEnvironmentTitleClick = () => {
    environmentTitleClickCountRef.current += 1;
    if (environmentTitleClickCountRef.current >= 2) {
      environmentTitleClickCountRef.current = 0;
      setShowAdvancedApps(prev => !prev);
    }
  };

  useEffect(() => {
    const syncTeacherDeveloperNotesContext = () => {
      const nextContext: TeacherMobileDeveloperNotesContext | null = currentApp !== 'admin'
        ? null
        : teacherPhoneScreenRef.current?.querySelector('[data-teacher-demo-context="student-team-other-search"]')
          ? 'student-team-other-search'
          : teacherPhoneScreenRef.current?.querySelector('.student-compact-select-grid')
            ? 'student-picker-grid'
            : null;
      if (teacherDeveloperNotesContextRef.current !== nextContext) {
        teacherDeveloperNotesContextRef.current = nextContext;
        setShowTeacherDeveloperNotes(false);
      }
      setTeacherDeveloperNotesContext(previous => previous === nextContext ? previous : nextContext);
    };

    syncTeacherDeveloperNotesContext();
    const observer = new MutationObserver(syncTeacherDeveloperNotesContext);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, [currentApp]);

  const handleTeacherScreenshot = async () => {
    const screen = teacherPhoneScreenRef.current;
    if (teacherScreenshotStatus === 'capturing') return;

    if (teacherScreenshotResetTimerRef.current !== null) {
      window.clearTimeout(teacherScreenshotResetTimerRef.current);
      teacherScreenshotResetTimerRef.current = null;
    }

    const resetScreenshotStatusAfter = (delay: number) => {
      teacherScreenshotResetTimerRef.current = window.setTimeout(() => {
        teacherScreenshotResetTimerRef.current = null;
        setTeacherScreenshotStatus('idle');
      }, delay);
    };

    if (!screen) {
      console.error('[教师手机端截图] 未找到手机屏幕内容区域');
      setTeacherScreenshotStatus('error');
      resetScreenshotStatusAfter(3000);
      return;
    }

    setTeacherScreenshotStatus('capturing');
    const timestamp = formatLocalScreenshotTimestamp(new Date());

    try {
      await exportElementAsPng(screen, {
        fileName: `教师手机端-${timestamp}.png`,
        pixelRatio: 3,
      });
      console.info('[教师手机端截图] 导出成功', {
        fileName: `教师手机端-${timestamp}.png`,
        includeNativeChrome: showPhoneShell,
        logicalSize: `${screen.offsetWidth}x${screen.offsetHeight}`,
      });
      setTeacherScreenshotStatus('success');
      resetScreenshotStatusAfter(1800);
    } catch (error) {
      console.error('[教师手机端截图] 导出失败', {
        error,
        includeNativeChrome: showPhoneShell,
        logicalSize: `${screen.offsetWidth}x${screen.offsetHeight}`,
      });
      setTeacherScreenshotStatus('error');
      resetScreenshotStatusAfter(3000);
    }
  };
  const demoPanelClosedClass = demoPanelSide === 'left'
    ? '-translate-x-[calc(100%-32px)]'
    : demoPanelSide === 'top'
      ? '-translate-y-[calc(100%-32px)]'
      : demoPanelSide === 'bottom'
        ? 'translate-y-[calc(100%-32px)]'
        : 'translate-x-[calc(100%-32px)]';
  const demoPanelOpenClass = demoPanelSide === 'top' || demoPanelSide === 'bottom'
    ? 'translate-y-0'
    : 'translate-x-0';
  const demoPanelShapeClass = demoPanelSide === 'left'
    ? 'flex-row-reverse rounded-r-2xl border-l-0'
    : demoPanelSide === 'top'
      ? 'flex-col-reverse rounded-b-2xl border-t-0'
      : demoPanelSide === 'bottom'
        ? 'flex-col rounded-t-2xl border-b-0'
        : 'rounded-l-2xl border-r-0';
  const demoHandleClass = demoPanelSide === 'top' || demoPanelSide === 'bottom'
    ? `h-8 w-full cursor-grab flex-row px-6 ${demoPanelSide === 'top' ? 'border-t' : 'border-b'}`
    : `w-8 cursor-grab flex-col py-6 ${demoPanelSide === 'left' ? 'border-l' : 'border-r'}`;
  const demoPanelStyle = {
    ...(demoPanelPosition
      ? isDemoPanelSnapped
        ? demoPanelSide === 'right'
          ? { right: 0, top: demoPanelPosition.top }
          : demoPanelSide === 'bottom'
            ? { left: demoPanelPosition.left, bottom: 0 }
            : { left: demoPanelPosition.left, top: demoPanelPosition.top }
        : { left: demoPanelPosition.left, top: demoPanelPosition.top }
      : {}),
    transitionTimingFunction: 'cubic-bezier(0.16,1,0.3,1)',
  };
  const teacherScreenshotLabel = teacherScreenshotStatus === 'capturing'
    ? '正在生成截图'
    : teacherScreenshotStatus === 'success'
      ? '截图已保存'
      : teacherScreenshotStatus === 'error'
        ? '截图失败，请重试'
        : '拍照截图';
  const studentLoginMethods = STUDENT_LOGIN_PREVIEW_OPTIONS.find(option => option.value === studentLoginPreviewMode)?.methods
    ?? STUDENT_LOGIN_PREVIEW_OPTIONS[2].methods;

  return (
    <>
      <div key={currentApp} className="animate-in fade-in duration-300">
        {currentApp === 'terminal' && (
          <TerminalApp
            mode="vending"
            loginMethods={studentLoginMethods}
            parentEvaluationVisibility={parentEvaluationVisibility}
            onViewChange={setTerminalView}
          />
        )}
        {currentApp === 'all-in-one' && <TerminalApp mode="all-in-one" />}
        {currentApp === 'pc-workspace' && <PcWorkspace />}
        {currentApp === 'region-pc' && <RegionalPcAdmin onLogout={handleRegionalPcLogout} />}
        {currentApp === 'region-pc-screen' && <RegionalPcAdmin screenOnly />}
        {currentApp === 'admin' && (
          <MobileApp
            showPhoneShell={showPhoneShell}
            screenRef={teacherPhoneScreenRef}
            campaignPreviewEveryEntry
            headteacherAssistantScopePreview={headteacherAssistantScopePreviewMode ?? undefined}
            onHeadteacherAssistantScopePreviewDefaultChange={setHeadteacherAssistantScopePreviewDefault}
            onHeadteacherAssistantScopePreviewChange={setHeadteacherAssistantScopePreview}
            onHeadteacherAssistantViewChange={setIsHeadteacherAssistantViewActive}
            studentTeamInvitePreview={studentTeamInvitePreview}
            onStudentTeamInvitePreviewChange={setStudentTeamInvitePreview}
            onStudentTeamListViewChange={setIsStudentTeamListViewActive}
            gradientPreview={{ schemeId: teacherGradientScheme, styleId: teacherGradientStyle }}
            onGradientPreviewChange={config => {
              setTeacherGradientScheme(config.schemeId);
              setTeacherGradientStyle(config.styleId);
            }}
          />
        )}
        {currentApp === 'ui-renovation' && <UiRenovationDemo />}
        {currentApp === 'teacher-c-mobile' && <TeacherCMobileLowFi />}
        {currentApp === 'companion' && <CompanionApp />}
        {currentApp === 'parent' && (questionnaireInviteCode
          ? <ParentApp showPhoneShell={showParentPhoneShell} gradientPreview={{ schemeId: parentGradientScheme, styleId: parentGradientStyle }} defaultLoggedIn={false} defaultHasBoundChild={false} initialQuestionnaireInviteCode={questionnaireInviteCode} parentEvaluationVisibility={parentEvaluationVisibility} parentBankFeatureEnabled={parentBankFeatureEnabled} onActiveClassIdChange={setParentPreviewClassId} />
          : <ParentApp showPhoneShell={showParentPhoneShell} gradientPreview={{ schemeId: parentGradientScheme, styleId: parentGradientStyle }} parentEvaluationVisibility={parentEvaluationVisibility} parentBankFeatureEnabled={parentBankFeatureEnabled} onActiveClassIdChange={setParentPreviewClassId} />
        )}
      </div>

      {currentApp === 'terminal' && (
        <div
          className={`fixed top-1/2 z-[9998] -translate-y-1/2 max-[1050px]:!left-auto max-[1050px]:right-16 ${terminalPreviewDockLeft === null ? 'invisible' : ''}`}
          style={{ left: terminalPreviewDockLeft ?? '50%' }}
        >
          <div className="flex flex-col gap-3">
            {terminalView === 'welcome' && (
              <TerminalLoginMethodPreviewControls
                value={studentLoginPreviewMode}
                onChange={setStudentLoginPreviewMode}
              />
            )}
            {terminalView === 'growth' && (
              <ParentEvaluationVisibilityPreviewControls
                settings={parentEvaluationVisibility}
                onChange={updateParentEvaluationVisibility}
              />
            )}
            {terminalView === 'shop' && (
              <TerminalShopLayoutPreviewControls
                value={shopLayoutPresetId}
                onChange={updateShopLayoutPresetId}
              />
            )}
          </div>
        </div>
      )}

      {currentApp === 'parent' && !questionnaireInviteCode && (
        <div className="fixed left-1/2 top-1/2 z-[9998] ml-[230px] -translate-y-1/2 max-[900px]:right-4 max-[900px]:left-auto max-[900px]:ml-0">
          <div className="flex flex-col gap-3">
            <div className="w-full rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl" aria-label="家长端渐变预览配置">
              <label className="flex min-h-11 items-center gap-2">
                <span className="w-14 shrink-0 pl-1 text-[11px] font-bold text-slate-500">配色方案</span>
                <span className="relative min-w-0 flex-1">
                  <select
                    aria-label="家长端选择渐变配色方案"
                    value={parentGradientScheme}
                    onChange={event => setParentGradientScheme(event.target.value as TeacherGradientSchemeId)}
                    className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-[12px] font-semibold text-slate-700 outline-none transition-colors focus:border-slate-400"
                  >
                    {teacherGradientSchemeOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </span>
              </label>
              <label className="flex min-h-11 items-center gap-2">
                <span className="w-14 shrink-0 pl-1 text-[11px] font-bold text-slate-500">渐变样式</span>
                <span className="relative min-w-0 flex-1">
                  <select
                    aria-label="家长端选择渐变样式"
                    value={parentGradientStyle}
                    onChange={event => setParentGradientStyle(event.target.value as TeacherGradientStyleId)}
                    className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-[12px] font-semibold text-slate-700 outline-none transition-colors focus:border-slate-400"
                  >
                    {teacherGradientStyleOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </span>
              </label>
            </div>
            <ParentEvaluationVisibilityPreviewControls
              settings={parentEvaluationVisibility}
              onChange={updateParentEvaluationVisibility}
            />
            <ParentBankFeaturePreviewControls
              enabled={parentBankFeatureEnabled}
              onChange={updateParentBankFeature}
            />
          </div>
        </div>
      )}

      {currentApp === 'admin' && (
        <div className="fixed left-1/2 top-4 z-[9998] ml-[230px] max-[900px]:right-4 max-[900px]:left-auto max-[900px]:ml-0">
          <div className="flex w-[232px] flex-col items-end gap-2 max-[900px]:w-[172px]">
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowPhoneShell(previous => !previous)}
                className="flex h-11 items-center gap-2 rounded-full border border-slate-200/80 bg-white/90 px-3 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-colors active:bg-slate-50 max-[900px]:px-1.5"
                aria-pressed={showPhoneShell}
                aria-label="模拟真实手机"
                title="模拟真实手机"
              >
                <Smartphone className="hidden h-4 w-4 text-slate-600 max-[900px]:block" aria-hidden="true" />
                <span className="whitespace-nowrap text-[12px] font-semibold text-slate-700 max-[900px]:sr-only">模拟真实手机</span>
                <span className={`relative h-[22px] w-10 shrink-0 rounded-full p-0.5 transition-colors ${showPhoneShell ? 'bg-slate-800' : 'bg-slate-300'}`} aria-hidden="true">
                  <span className={`block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${showPhoneShell ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                </span>
              </button>
              <button
                type="button"
                onClick={handleTeacherScreenshot}
                disabled={teacherScreenshotStatus === 'capturing'}
                className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-colors active:bg-slate-200/70 disabled:cursor-wait ${teacherScreenshotStatus === 'error' ? 'text-rose-600' : 'text-slate-600'}`}
                aria-label={teacherScreenshotLabel}
                title={teacherScreenshotLabel}
              >
                {teacherScreenshotStatus === 'capturing' ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : teacherScreenshotStatus === 'success' ? (
                  <Check className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Camera className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
              <button
                type="button"
                onClick={() => setIsTeacherGradientControlsOpen(prev => !prev)}
                className={`hidden h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200/80 bg-white/90 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl transition-colors max-[900px]:flex ${isTeacherGradientControlsOpen ? 'text-rose-600' : 'text-slate-600'}`}
                aria-label={isTeacherGradientControlsOpen ? '收起渐变预览配置' : '展开渐变预览配置'}
                aria-expanded={isTeacherGradientControlsOpen}
              >
                <Palette className="h-5 w-5" />
              </button>
            </div>

            {teacherDeveloperNotesContext && (
              <TeacherMobileDeveloperNotes
                open={showTeacherDeveloperNotes}
                onToggle={() => setShowTeacherDeveloperNotes(prev => !prev)}
                context={teacherDeveloperNotesContext}
              />
            )}

            <div className={`w-full rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl ${isTeacherGradientControlsOpen ? 'max-[900px]:block' : 'max-[900px]:hidden'}`}>
              <label className="flex min-h-11 items-center gap-2">
                <span className="w-14 shrink-0 pl-1 text-[11px] font-bold text-slate-500">配色方案</span>
                <span className="relative min-w-0 flex-1">
                  <select
                    aria-label="选择渐变配色方案"
                    value={teacherGradientScheme}
                    onChange={event => setTeacherGradientScheme(event.target.value as TeacherGradientSchemeId)}
                    className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-[12px] font-semibold text-slate-700 outline-none transition-colors focus:border-slate-400"
                  >
                    {teacherGradientSchemeOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </span>
              </label>
              <label className="flex min-h-11 items-center gap-2">
                <span className="w-14 shrink-0 pl-1 text-[11px] font-bold text-slate-500">渐变样式</span>
                <span className="relative min-w-0 flex-1">
                  <select
                    aria-label="选择渐变样式"
                    value={teacherGradientStyle}
                    onChange={event => setTeacherGradientStyle(event.target.value as TeacherGradientStyleId)}
                    className="h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-2.5 pr-7 text-[12px] font-semibold text-slate-700 outline-none transition-colors focus:border-slate-400"
                  >
                    {teacherGradientStyleOptions.map(option => (
                      <option key={option.id} value={option.id}>{option.label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                </span>
              </label>
            </div>

            {isStudentTeamListViewActive && (
            <div className="w-full rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl">
              <button
                type="button"
                role="switch"
                aria-checked={studentTeamInvitePreview}
                onClick={() => setStudentTeamInvitePreview(previous => !previous)}
                className="flex min-h-11 w-full items-center gap-2 text-left"
              >
                <span className="min-w-0 flex-1 pl-1 text-[11px] font-bold text-slate-500">收到社团邀请</span>
                <span className={`relative h-[22px] w-10 shrink-0 rounded-full p-0.5 transition-colors ${studentTeamInvitePreview ? 'bg-slate-800' : 'bg-slate-300'}`} aria-hidden="true">
                  <span className={`block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform ${studentTeamInvitePreview ? 'translate-x-[18px]' : 'translate-x-0'}`} />
                </span>
              </button>
            </div>
            )}

            {isHeadteacherAssistantViewActive && (
              <div className={`w-full rounded-2xl border border-slate-200/80 bg-white/90 p-2 shadow-[0_12px_40px_-18px_rgba(15,23,42,0.45)] backdrop-blur-xl ${isTeacherGradientControlsOpen ? 'max-[900px]:block' : 'max-[900px]:hidden'}`}>
                <span className="mb-1 block pl-1 text-[11px] font-bold text-slate-500">班主任助理</span>
                <HeadteacherAssistantScopePreviewControls
                  value={headteacherAssistantScopePreviewMode}
                  onChange={setHeadteacherAssistantScopePreview}
                />
              </div>
            )}
          </div>
        </div>
      )}

      {/* 区域纯屏汇报模式需要保持正式呈现，不显示内部环境切换浮层。 */}
      {currentApp !== 'region-pc-screen' && (
        <div
          ref={demoPanelRef}
          className={`fixed z-[9999] touch-none select-none transition-[left,right,top,bottom,transform] duration-300 ${demoPanelPosition ? '' : 'right-0 top-1/2 -translate-y-1/2'} ${isDemoOpen ? demoPanelOpenClass : demoPanelClosedClass}`}
          style={demoPanelStyle}
        >
          <div className={`flex bg-white/95 backdrop-blur-md border border-slate-200 shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.15)] overflow-hidden items-center ${demoPanelShapeClass}`}>

          {/* 触发把手 (固定 32px 宽) */}
          <button
            type="button"
            onPointerDown={handleDemoDragStart}
            onPointerMove={handleDemoDragMove}
            onPointerUp={handleDemoDragEnd}
            onPointerCancel={handleDemoDragEnd}
            onClick={handleDemoToggle}
            className={`shrink-0 flex gap-1 items-center justify-center transition-colors bg-slate-50/50 self-stretch active:cursor-grabbing active:bg-slate-100 border-slate-100 ${demoHandleClass} ${isDemoOpen ? 'text-blue-600' : 'text-slate-400'}`}
            aria-label={isDemoOpen ? '收起环境切换' : '展开环境切换'}
          >
            <span className="text-[10px] font-black">D</span>
            <span className="text-[10px] font-black">E</span>
            <span className="text-[10px] font-black">M</span>
            <span className="text-[10px] font-black">O</span>
          </button>

          {/* 控制面板 */}
          <div className="flex flex-col gap-2 p-3 bg-white">
            <button
              type="button"
              onClick={handleEnvironmentTitleClick}
              className="mb-1 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 transition-colors active:text-slate-600"
              aria-label="环境切换"
            >
              环境切换
            </button>
            <button
              onClick={() => setCurrentApp('terminal')}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'terminal' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 active:bg-slate-100'}`}
              title="货柜机 - 学生端"
            >
              <MonitorSmartphone size={22} className="mb-1" />
              <span className="text-[9px] font-bold">货柜机</span>
            </button>
            <button
              onClick={() => setCurrentApp('admin')}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'admin' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 active:bg-slate-100'}`}
              title="管理端 - 教师-手机端"
            >
              <Smartphone size={22} className="mb-1" />
              <span className="text-[9px] font-bold leading-tight">教师-手机端</span>
            </button>
            <button
              onClick={() => setCurrentApp('parent')}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'parent' ? 'bg-emerald-600 text-white shadow-md' : 'text-slate-500 active:bg-slate-100'}`}
              title="家长-手机端 - 微信小程序"
            >
              <Smartphone size={22} className="mb-1" />
              <span className="text-[9px] font-bold leading-tight">家长-手机端</span>
            </button>
            <button
              onClick={() => setCurrentApp('ui-renovation')}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'ui-renovation' ? 'bg-rose-600 text-white shadow-md' : 'text-slate-500 active:bg-slate-100'}`}
              title="UI改造 - 渐变背景探索"
            >
              <Palette size={22} className="mb-1" />
              <span className="text-[9px] font-bold leading-tight">UI改造</span>
            </button>
            <button
              onClick={() => setCurrentApp('pc-workspace')}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'pc-workspace' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 active:bg-slate-100'}`}
              title="统一SaaS平台 - 学校-PC端"
            >
              <Monitor size={22} className="mb-1" />
              <span className="text-[9px] font-bold leading-tight">学校-PC端</span>
            </button>
            {showAdvancedApps && (
              <>
                <button
                  onClick={() => setCurrentApp('region-pc')}
                  className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'region-pc' ? 'bg-blue-700 text-white shadow-md' : 'text-slate-500 active:bg-slate-100'}`}
                  title="区级-PC端 - 区教育局"
                >
                  <ShieldCheck size={22} className="mb-1" />
                  <span className="text-[9px] font-bold leading-tight">区级-PC端</span>
                </button>
                <button
                  onClick={() => setCurrentApp('teacher-c-mobile')}
                  className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'teacher-c-mobile' ? 'bg-black text-white shadow-md' : 'text-slate-500 active:bg-slate-100'}`}
                  title="C端改造 - 低保真原型"
                >
                  <Smartphone size={22} className="mb-1" />
                  <span className="text-[9px] font-bold leading-tight">C端改造</span>
                </button>
              </>
            )}
          </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AppSwitcher;
