
import React, { useState, useMemo } from 'react';
import { ViewState, Student, Product, BankAccount, Deposit, TierLevel } from './types';
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
import VendingAdmin from './components/VendingAdmin';
import SaaSPortal, { type PcPortalApp } from './components/SaaSPortal';
import PlatformBrandMark from './components/PlatformBrandMark';
import { DeviceWrapper } from './components/DeviceWrapper';
import './mobile-app/index.css';
import { ChevronLeft, ChevronDown, Sparkles, ArrowRight, MonitorSmartphone, Monitor, Smartphone, Loader2, Bot, Settings, ShieldCheck, Power, Info, TrendingUp, Plus, Trash2, LayoutGrid, LogOut, X } from 'lucide-react';
import { playSound } from './utils/sound';

// ============================================================
// 档位配置（与 GrowthView 保持一致）
// ============================================================
const GROWTH_TIER_CONFIG: Record<TierLevel, { label: string; weight: number; color: string; bg: string }> = {
  star:    { label: '领航之星', weight: 4.0,  color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
  active:  { label: '卓越先锋', weight: 2.5,  color: 'text-blue-600',   bg: 'bg-blue-50 border-blue-200'   },
  stable:  { label: '稳步成长', weight: 1.5,  color: 'text-green-600',  bg: 'bg-green-50 border-green-200'  },
  improve: { label: '潜力新星', weight: 1.0,  color: 'text-slate-500',  bg: 'bg-slate-50 border-slate-200'  },
};

interface ScoreConfig { score: number; count: number; }
interface SimStudent { name: string; score: number; tier: TierLevel; reward: number; }
interface TeacherProfile { name: string; role: string; school: string; }

const DEMO_TEACHER_PROFILES: TeacherProfile[] = [
  { name: '郭老师', role: '学校管理员', school: '成都七中初中附属小学' },
  { name: '周老师', role: '学校管理员', school: '成都七中初中附属小学' },
  { name: '王老师', role: '学校管理员', school: '成都七中初中附属小学' },
  { name: '曹老师', role: '学校管理员', school: '成都七中初中附属小学' },
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

function computeLeaderboard(bonusPool: number, configs: ScoreConfig[]): SimStudent[] {
  const valid = configs.filter(c => c.score > 0 && c.count > 0);
  
  // 建立分数-档位映射
  const uniqueScores = [...new Set(valid.map(c => c.score))].sort((a, b) => b - a);
  const tiers: TierLevel[] = ['star', 'active', 'stable', 'improve'];
  const scoreToTier = new Map<number, TierLevel>();
  uniqueScores.forEach((score, i) => scoreToTier.set(score, tiers[Math.min(i, tiers.length - 1)]));
  
  let serial = 1;
  const students: SimStudent[] = [];
  
  // 1. 添加有分数的同学
  valid.forEach(config => {
    const tier = scoreToTier.get(config.score)!;
    for (let i = 0; i < config.count; i++) {
      students.push({ name: `学生${serial++}`, score: config.score, tier, reward: 0 });
    }
  });

  // 2. 补齐至 40 人（其余同学默认 0 分）
  const CLASS_SIZE = 40;
  if (students.length < CLASS_SIZE) {
    const remaining = CLASS_SIZE - students.length;
    for (let i = 0; i < remaining; i++) {
      students.push({ name: `学生${serial++}`, score: 0, tier: 'improve', reward: 0 });
    }
  }

  // 3. 计算奖励权重分红（仅正分学生参与瓜分）
  const eligibleStudents = students.filter(st => st.score > 0);
  const totalWeight = eligibleStudents.reduce((s, st) => s + (GROWTH_TIER_CONFIG[st.tier].weight || 0), 0);
  
  if (totalWeight > 0) {
    const unitValue = bonusPool / totalWeight;
    students.forEach(st => {
      if (st.score > 0) {
        st.reward = Math.round(GROWTH_TIER_CONFIG[st.tier].weight * unitValue * 100) / 100;
      } else {
        st.reward = 0;
      }
    });
  } else {
    students.forEach(st => { st.reward = 0; });
  }
  
  students.sort((a, b) => b.score - a.score);
  return students;
}

// ============================================================
// 成长页右侧面板：规则说明 + 试算
// ============================================================
const GrowthSidePanel: React.FC = () => {
  const [bonusPool, setBonusPool] = useState('300');
  const [classSize, setClassSize] = useState('40');
  const [myScore, setMyScore] = useState(''); // 我的得分，用于预览所属档位
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

  const tierGroups: Partial<Record<TierLevel, SimStudent[]>> = {};
  leaderboard.forEach(s => { if (!tierGroups[s.tier]) tierGroups[s.tier] = []; tierGroups[s.tier]!.push(s); });

  // 学生端标杆：取前 3 个分数层，櫳论参与者内部是否同分，只要有人参与就展示标杆
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

  // 实时预览：根据 我的得分 计算所属档位
  // 返回类型：null = 未输入/无法计算；{ eligible: false } = ≤0 不参与；{ eligible: true, tier, myReward } = 正分参与
  const myTierPreview = useMemo(() => {
    const trimmed = myScore.trim();
    if (!trimmed || trimmed === '-') return null; // 空或仅输入负号
    const numScore = Number(trimmed);
    if (!Number.isFinite(numScore)) return null;
    // 得分 ≤ 0：不参与分配
    if (numScore <= 0) return { eligible: false as const };
    // 得分 > 0：计算档位
    const validScores = [...new Set(numericConfigs.map(c => c.score).filter(s => s > 0))].sort((a, b) => b - a);
    if (validScores.length === 0) return { eligible: false as const };
    const higherCount = validScores.filter(s => s > numScore).length;
    const tiers: TierLevel[] = ['star', 'active', 'stable', 'improve'];
    const tier = tiers[Math.min(higherCount, tiers.length - 1)];
    const totalWeight = numericConfigs.reduce((sum, c) => {
      if (c.score <= 0 || c.count <= 0) return sum;
      const higher = validScores.filter(s => s > c.score).length;
      const t = tiers[Math.min(higher, tiers.length - 1)];
      return sum + GROWTH_TIER_CONFIG[t].weight * c.count;
    }, 0);
    const perUnit = totalWeight > 0 ? numericBonus / totalWeight : 0;
    const myReward = perUnit * GROWTH_TIER_CONFIG[tier].weight;
    return { eligible: true as const, tier, myReward };
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
              { icon: '🏆', title: '只奖正分', desc: '净得分 > 0 才参与奖励金瓜分，0分或负分不参与。' },
              { icon: '📊', title: '分值定档位', desc: '最高分 → 领航之星（×4）；其余按分值高低依次归入卓越先锋（×2.5）、稳步成长（×1.5）、潜力新星（×1）。' },
              { icon: '⚖️', title: '同分同奖', desc: '分数相同的学生，档位相同，奖励完全一致。' },
              { icon: '💰', title: '奖励计算', desc: '每份金额 = 总奖励金 ÷ 全班总份数。每人奖励 = 档位系数 × 每份金额。' },
              { icon: '🔒', title: '保护隐私', desc: '学生只看"领航之星"标杆 + 自己的档位/得分/预估分红。不显示具体名次和他人金额。' },
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
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block pl-1">本月排名奖励 (元)</label>
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
              <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">📍 我属于哪个分段？</div>
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
              {/* 态 1：正分，展示档位 + 预估奖励 */}
              {myTierPreview && myTierPreview.eligible && (
                <div className={`mt-2 flex items-center justify-between px-3 py-2 rounded-xl border ${
                  myTierPreview.tier === 'star'    ? 'bg-yellow-50 border-yellow-100' :
                  myTierPreview.tier === 'active'  ? 'bg-purple-50 border-purple-100' :
                  myTierPreview.tier === 'stable'  ? 'bg-green-50 border-green-100' :
                  'bg-blue-50 border-blue-100'
                }`}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">
                      {myTierPreview.tier === 'star' ? '🌟' : myTierPreview.tier === 'active' ? '🚀' : myTierPreview.tier === 'stable' ? '🌱' : '💡'}
                    </span>
                    <div>
                      <div className={`text-xs font-black ${GROWTH_TIER_CONFIG[myTierPreview.tier].color}`}>
                        {GROWTH_TIER_CONFIG[myTierPreview.tier].label}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">系数 ×{GROWTH_TIER_CONFIG[myTierPreview.tier].weight}</div>
                    </div>
                  </div>
                  {numericBonus > 0 && (
                    <div className="text-right">
                      <div className="text-xs font-black text-orange-500 tabular-nums">≈ {myTierPreview.myReward.toFixed(2)}<small className="text-orange-300 ml-0.5">元</small></div>
                      <div className="text-[10px] text-slate-400">预估奖励</div>
                    </div>
                  )}
                </div>
              )}

              {/* 态 2：得分 ≤ 0，显示不参与提示 */}
              {myTierPreview && !myTierPreview.eligible && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2.5 bg-slate-100 rounded-xl border border-slate-200">
                  <span className="text-base">🚫</span>
                  <div>
                    <div className="text-xs font-black text-slate-500">不参与奖励分配</div>
                    <div className="text-[10px] text-slate-400 font-medium">净得分 ≤ 0，根据规则不能获得奖励分红</div>
                  </div>
                </div>
              )}

              {/* 态 3：未输入，显示快捷提示 */}
              {!myTierPreview && (
                <div className="mt-1.5 text-[11px] text-slate-400 font-medium">输入你的当月净得分，立即查看所属档位</div>
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
                📋 完整排行榜
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
                👁️ 仅展示部分学生的排行榜
              </button>
            </div>

            {/* Tab 内容：完整排行榜（教师视角） */}
            {activeTab === 'full' && (
              <div className="space-y-3">
                {(Object.keys(GROWTH_TIER_CONFIG) as TierLevel[]).map(tier => {
                  const group = tierGroups[tier];
                  if (!group || group.length === 0) return null;
                  const cfg = GROWTH_TIER_CONFIG[tier];
                  return (
                    <div key={tier}>
                      <div className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-lg border mb-2 ${cfg.color} ${cfg.bg}`}>
                        {cfg.label}
                        <span className="opacity-40">|</span>
                        <span>系数 ×{cfg.weight}</span>
                      </div>
                      <div className="space-y-1">
                        {group.map((s, idx) => (
                          <div key={idx} className="flex items-center justify-between px-3 py-2.5 bg-white rounded-xl border border-slate-100">
                            <span className="text-sm font-bold text-slate-700">{s.name}</span>
                            <div className="text-right">
                              <div className="text-xs font-black text-slate-500">{s.score}<small className="text-slate-300 font-sans ml-0.5">分</small></div>
                              {s.reward > 0 ? (
                                <div className="text-[11px] font-black text-orange-500">预估 {s.reward.toFixed(2)}<small className="text-orange-300 font-sans ml-0.5">元</small></div>
                              ) : (
                                <div className="text-[10px] text-slate-400 font-bold pt-0.5">无奖励</div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {activeTab === 'student' && (
              <div className="space-y-3">

                {/* ── 没有任何参与者：全班无人参与 ── */}
                {leaderboard.length === 0 && (
                  <div className="px-3 py-3 bg-slate-50 rounded-xl border border-slate-200 text-sm font-bold text-slate-400 text-center">
                    💭 本月暂无同学参与奖励分配
                  </div>
                )}

                {/* ── 标杆展示：前3个分数段全员个人展示 ── */}
                {benchmarkGroups.length > 0 && (
                  <div>
                    <div className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-2 pl-1">🏆 班级标杆榜</div>
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
                                      预估 {s.reward.toFixed(2)}<small className="text-orange-300 font-sans ml-0.5">元</small>
                                    </div>
                                  ) : (
                                    <div className="text-[10px] text-slate-400 font-bold pt-0.5">无奖励</div>
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
                {(myTierPreview || selfStudent) && (() => {
                  // 确定显示内容
                  const isEligible = myTierPreview?.eligible === true;
                  const isIneligible = myTierPreview?.eligible === false;
                  const hasTier = isEligible && myTierPreview?.tier;
                  const displayScore = myTierPreview ? myScore : (selfStudent?.score?.toString() ?? '—');
                  const displayTier = isEligible && myTierPreview?.tier
                    ? myTierPreview.tier
                    : (!myTierPreview && selfStudent ? selfStudent.tier : null);
                  const displayReward = isEligible && myTierPreview?.myReward !== undefined
                    ? myTierPreview.myReward
                    : (!myTierPreview && selfStudent ? selfStudent.reward : null);

                  return (
                    <div>
                      <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 pl-1">我的得分</div>
                      <div className={`flex items-center justify-between px-3 py-3 rounded-xl border ${
                        isIneligible ? 'bg-slate-50 border-slate-200' : 'bg-blue-50 border-blue-100'
                      }`}>
                        {/* 左侧：头像 + 名字 + 档位 */}
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
                            {displayTier && (
                              <div className={`text-[10px] font-black mt-0.5 ${GROWTH_TIER_CONFIG[displayTier].color}`}>
                                {GROWTH_TIER_CONFIG[displayTier].label}
                              </div>
                            )}
                            {isIneligible && (
                              <div className="text-[10px] font-black mt-0.5 text-slate-400">🚫 不参与奖励分配</div>
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
                              {displayReward.toFixed(2)}<small className="text-orange-300 font-sans ml-0.5">元</small>
                            </div>
                          )}
                          {isIneligible && (
                            <div className="text-[10px] text-slate-400 font-medium">无奖励</div>
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

const TerminalApp: React.FC<{ mode?: 'vending' | 'all-in-one'; embedded?: boolean }> = ({ mode = 'vending', embedded = false }) => {
  const isVending = mode === 'vending';
  const [view, setView] = useState<ViewState>(isVending ? 'welcome' : 'scanning');
  const [loginSubView, setLoginSubView] = useState<'face' | 'password'>(isVending ? 'face' : 'password');
  const [student, setStudent] = useState<Student>(INITIAL_STUDENT);
  const [bank, setBank] = useState<BankAccount>(INITIAL_BANK);
  const [products, setProducts] = useState<Product[]>(MOCK_PRODUCTS);
  const [isLoading, setIsLoading] = useState(false);
  const [idleSecondsLeft, setIdleSecondsLeft] = useState(5000);

  // admin login state
  const [showAdminLogin, setShowAdminLogin] = useState(false);
  const [adminAction, setAdminAction] = useState<'restock' | 'restart' | null>(null);
  const [adminPassword, setAdminPassword] = useState('');
  const [loginError, setLoginError] = useState(false);

  // student password modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // 1. Idle Screensaver & Click Sound Feedback
  React.useEffect(() => {
    let idleTimer: ReturnType<typeof setTimeout>;
    let intervalTimer: ReturnType<typeof setInterval>;

    const resetTimer = () => {
      clearTimeout(idleTimer);
      clearInterval(intervalTimer);
      setIdleSecondsLeft(5000);

      if (view !== 'welcome' && view !== 'scanning' && view !== 'vending-admin') {
        intervalTimer = setInterval(() => {
          setIdleSecondsLeft(prev => prev > 0 ? prev - 1 : 0);
        }, 1000);

        idleTimer = setTimeout(() => {
          setView(isVending ? 'welcome' : 'scanning');
          setStudent(INITIAL_STUDENT);
          setBank(INITIAL_BANK);
          setIsLoading(false);
        }, 5000000); // 5000s timeout
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
  const withLoading = (action: () => void, successSound: 'coin' | 'success' = 'success') => {
    if (isLoading) return;
    setIsLoading(true);
    setTimeout(() => {
      action();
      playSound(successSound);
      setIsLoading(false);
    }, 1200);
  };

  const handleAdminLogin = () => {
    if (adminPassword === '123456') {
      setShowAdminLogin(false);
      setAdminPassword('');
      setLoginError(false);

      if (adminAction === 'restart') {
        window.location.reload();
      } else {
        setView('vending-admin');
      }
    } else {
      setLoginError(true);
      setTimeout(() => setLoginError(false), 2000);
    }
  };

  const bankBalance = bank.deposits.reduce((s, d) => s + d.amount, 0);

  const handleExchange = (pointsToRedeem: number) => {
    withLoading(() => {
      const coinsGained = Math.floor(pointsToRedeem / EXCHANGE_RATE);
      setStudent(prev => ({
        ...prev,
        points: prev.points - pointsToRedeem,
        campusCoins: prev.campusCoins + coinsGained
      }));
      setView('dashboard');
    }, 'coin');
  };

  const handlePurchase = (product: Product) => {
    withLoading(() => {
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
      }
    }, 'success');
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
        return (
          <div className="flex flex-col items-center justify-center h-full gap-8 text-center px-10 pt-16 pb-12 animate-in fade-in duration-1000">
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
                <span className="text-blue-600 mt-2 block">{isVending ? '货柜机' : '班级一体机'}</span>
              </h1>
              <div className="text-xl text-slate-400 mt-5 font-bold flex items-center justify-center gap-3">
                <div className="h-px w-6 bg-slate-200"></div>
                点滴进步，成就未来
                <div className="h-px w-6 bg-slate-200"></div>
              </div>
            </div>

            <div className="pt-8 w-full max-w-sm mt-auto">
              <button
                onClick={() => { setView('scanning'); setLoginSubView('face'); }}
                className="w-full px-10 py-6 bg-blue-600 text-white text-3xl font-black rounded-[2.5rem] flex flex-col items-center justify-center gap-1"
                style={{
                  boxShadow: '0 8px 0 #1e40af, 0 15px 20px rgba(0,0,0,0.1)',
                  transform: 'translateY(0)',
                  transition: 'all 0.1s'
                }}
                onMouseDown={e => { e.currentTarget.style.transform = 'translateY(8px)'; e.currentTarget.style.boxShadow = '0 0px 0 #1e40af, 0 5px 10px rgba(0,0,0,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 0 #1e40af, 0 15px 20px rgba(0,0,0,0.1)'; }}
                onTouchStart={e => { e.currentTarget.style.transform = 'translateY(8px)'; e.currentTarget.style.boxShadow = '0 0px 0 #1e40af, 0 5px 10px rgba(0,0,0,0.1)'; }}
                onTouchEnd={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 8px 0 #1e40af, 0 15px 20px rgba(0,0,0,0.1)'; }}
              >
                <div className="flex items-center gap-3">
                  开始刷脸 <ArrowRight size={28} />
                </div>
              </button>

              <button
                onClick={() => {
                  if (isVending) {
                    setShowPasswordModal(true);
                  } else {
                    setView('scanning');
                    setLoginSubView('password');
                  }
                }}
                className="mt-6 w-full py-4 text-blue-600 font-bold bg-[#e8f2ff] active:bg-[#dbeafe] rounded-[2rem] transition-colors text-xl shadow-sm border-2 border-white"
              >
                账号密码登录
              </button>
              <p className="text-slate-300 font-bold mt-8 text-sm uppercase tracking-widest">请靠近终端屏幕</p>
            </div>

            {showPasswordModal && (
              <div className="absolute inset-0 z-[200] bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
                <AccountLogin onSuccess={() => { setView('dashboard'); setShowPasswordModal(false); }} onBack={() => setShowPasswordModal(false)} layout="vertical" />
              </div>
            )}
          </div>
        );
      case 'scanning':
        return loginSubView === 'face' ? (
          <FaceScanner 
            onSuccess={() => { playSound('success'); setView('dashboard'); }} 
            onSwitch={isVending ? undefined : () => setLoginSubView('password')}
            isVending={isVending}
          />
        ) : (
          <AccountLogin 
            onSuccess={() => { setView('dashboard'); }} 
            onBack={undefined}
            onFaceLogin={isVending ? undefined : () => setLoginSubView('face')}
            layout={isVending ? 'vertical' : 'horizontal'}
          />
        );
      case 'dashboard':
        return <Dashboard student={student} onNavigate={(v) => { 
          if (v === 'welcome') {
            setView(isVending ? 'welcome' : 'scanning');
            setLoginSubView(isVending ? 'face' : 'password');
          } else {
            setView(v);
          }
        }} bankBalance={bankBalance} layout={isVending ? 'mobile' : 'pc'} hideShop={!isVending} />;
      case 'exchange':
        return <ExchangeView student={student} onExchange={handleExchange} onBack={() => setView('dashboard')} />;
      case 'shop':
        return <ShopView student={student} products={products} onPurchase={handlePurchase} onBack={() => setView('dashboard')} />;
      case 'bank':
        return <BankView
          student={student}
          bank={bank}
          onDeposit={(amt, days, rate, label, type) => handleCreateDeposit(amt, days, rate, label, type as any)}
          onWithdrawDeposit={handleWithdrawDeposit}
          onBack={() => setView('dashboard')}
        />;
      case 'growth':
        return <GrowthView student={student} onBack={() => setView('dashboard')} />;
      case 'transactions':
        return <TransactionView student={student} onBack={() => setView('dashboard')} />;
      case 'vending-admin':
        return <VendingAdmin products={products} setProducts={setProducts} onExit={() => setView(isVending ? 'welcome' : 'scanning')} />;
      default:
        return <div>错误状态</div>;
    }
  };

  const innerContent = (
    <div
      className={`glass-panel overflow-hidden flex flex-col relative w-full h-full ${isVending ? 'pt-8' : ''}`}
      style={{
        borderRadius: isVending ? '3rem' : '0',
        boxShadow: isVending ? '0 50px 100px -20px rgba(0,0,0,0.15)' : 'none'
      }}
    >
      {/* 顶部硬件模拟 (摄像头区域) */}
      {isVending && (
        <div className="absolute top-0 left-0 w-full h-8 bg-black/5 z-[100] flex justify-center items-center pointer-events-none">
          <div className="w-24 h-4 bg-black/80 rounded-b-xl flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-900/50"></div>
            <div className="w-1 h-1 rounded-full bg-green-400"></div>
          </div>
        </div>
      )}

      {/* 登录页管理员入口 */}
      {view === 'welcome' && isVending && (
        <div className="absolute top-6 right-6 z-[110] flex gap-3">
          <button
            onClick={() => { setAdminAction('restock'); setShowAdminLogin(true); }}
            className="bg-white/50 backdrop-blur-md p-3 rounded-2xl flex items-center justify-center text-slate-400 active:scale-95 transition-all outline-none border border-white/60 shadow-sm"
            title="设备维护"
          >
            <Settings size={24} className="text-slate-600 drop-shadow-sm" />
          </button>
          <button
            onClick={() => { setAdminAction('restart'); setShowAdminLogin(true); }}
            className="bg-white/50 backdrop-blur-md p-3 rounded-2xl flex items-center justify-center text-red-400 active:scale-95 transition-all outline-none border border-white/60 shadow-sm"
            title="重启设备"
          >
            <Power size={24} className="text-red-600 drop-shadow-sm" />
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
            <p className="text-slate-400 font-bold mb-6 text-xs mt-1 tracking-widest">{adminAction === 'restart' ? '重启设备需要密码授权' : '设备维护需要密码授权'}</p>

            <input
              type="password"
              value={adminPassword}
              onChange={e => setAdminPassword(e.target.value)}
              placeholder="密码 (演示: 123456)"
              className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-5 py-4 text-center text-xl font-[NumberFont] font-black tracking-widest focus:border-blue-400 focus:bg-white focus:outline-none mb-1 shadow-inner transition-all placeholder:text-sm placeholder:font-sans placeholder:font-black placeholder:tracking-normal"
            />

            <div className="h-6 flex items-center justify-center mb-3">
              {loginError && <p className="text-red-500 text-[11px] font-bold animate-in slide-in-from-top-1 bg-red-50 px-3 py-1 rounded-full border border-red-100">密码错误，请重试</p>}
            </div>

            <div className="flex w-full gap-3">
              <button onClick={() => { setShowAdminLogin(false); setAdminPassword(''); setLoginError(false); setAdminAction(null); }} className="flex-1 py-3.5 bg-slate-100 text-slate-500 rounded-xl font-black active:bg-slate-200 transition-colors">取消</button>
              <button onClick={handleAdminLogin} className="flex-1 py-3.5 bg-blue-600 text-white rounded-xl font-black shadow-lg shadow-blue-600/20 active:bg-blue-700 transition-colors">验证登录</button>
            </div>
          </div>
        </div>
      )}

      {view !== 'welcome' && view !== 'scanning' && view !== 'vending-admin' && (
        <div className="absolute z-[90] top-10 left-1/2 -translate-x-1/2 bg-slate-900/10 backdrop-blur-md px-3 py-1 rounded-full flex items-center gap-2 pointer-events-none shadow-sm transition-all duration-300">
          <div className={`w-1.5 h-1.5 rounded-full ${idleSecondsLeft <= 10 ? 'bg-red-500 animate-ping' : 'bg-green-500 animate-pulse'}`}></div>
          <span className="text-slate-700/80 text-[10px] font-bold tracking-widest">{idleSecondsLeft}s 后自动退出</span>
        </div>
      )}

      {view !== 'welcome' && view !== 'scanning' && view !== 'dashboard' && view !== 'vending-admin' && (
        <div className="h-16 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 flex items-center justify-between shrink-0 z-50">
          <button
            onClick={() => setView('dashboard')}
            className="flex items-center space-x-1 text-blue-600 font-bold text-lg active:bg-blue-50 px-3 py-1.5 rounded-xl"
          >
            <ChevronLeft size={24} />
            <span>返回首页</span>
          </button>
        </div>
      )}

      <main className="flex-1 overflow-hidden relative">
        {renderView()}
      </main>
      {/* 全局 Loading 拦截层 */}
      {isLoading && (
        <div className="absolute inset-0 z-[100] bg-white/40 backdrop-blur-sm flex items-center justify-center animate-in fade-in duration-200">
          <div className="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center">
            <Loader2 size={48} className="text-blue-500 animate-spin mb-4" />
            <div className="text-lg font-black text-blue-900">处理中...</div>
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

  // Growth 视图：货柜机保持原位居中，右侧面板 absolute 叠加，不影响设备位置
  if (view === 'growth') {
    // 设备在 960px 高度时 scale = min(vh/960, 1.2)，渲染宽 = scale * 540
    // 面板宽度与设备渲染宽度保持一致（用 CSS calc 近似）
    return (
      <div className={`${embedded ? 'w-full h-full' : 'w-screen h-[100dvh]'} bg-[#f0f9ff] flex items-center justify-center overflow-hidden p-6 md:p-8 relative`}>
        {/* 货柜机：与其他页面完全相同的居中布局，位置不变 */}
        <DeviceWrapper width={540} height={960}>
          {innerContent}
        </DeviceWrapper>
        {/* 右侧面板：absolute 叠加，不参与布局流，不影响设备位置 */}
        {/* left = 50%（屏幕中心）+ 设备渲染半宽 + 50px 间距 */}
        {/* 宽度与设备渲染宽度一致 */}
        <div
          className="absolute top-6 bottom-6 overflow-hidden flex flex-col"
          style={{
            left: 'calc(50% + min(100vh * 270 / 960, 324px) + 50px)',
            width: 'min(calc(100vh * 540 / 960), 540px)',
          }}
        >
          <GrowthSidePanel />
        </div>
      </div>
    );
  }


  return (
    <div className={`${embedded ? 'w-full h-full' : 'w-screen h-[100dvh]'} bg-[#f0f9ff] flex items-center justify-center overflow-hidden p-6 md:p-8`}>
      {/* 21.5寸竖屏货柜机比例 540x960 */}
      <DeviceWrapper width={540} height={960}>
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
  const [currentApp, setCurrentApp] = useState<'terminal' | 'admin' | 'companion' | 'all-in-one' | 'parent' | 'pc-workspace'>(() => {
    const params = new URLSearchParams(window.location.search);
    const app = params.get('app');
    if (app === 'terminal' || app === 'admin' || app === 'companion' || app === 'all-in-one' || app === 'parent' || app === 'pc-workspace') {
      return app;
    }
    return 'terminal'; // default
  });
  const [isDemoOpen, setIsDemoOpen] = useState(false);

  return (
    <>
      <div key={currentApp} className="animate-in fade-in duration-300">
        {currentApp === 'terminal' && <TerminalApp mode="vending" />}
        {currentApp === 'all-in-one' && <TerminalApp mode="all-in-one" />}
        {currentApp === 'pc-workspace' && <PcWorkspace />}
        {currentApp === 'admin' && <MobileApp />}
        {currentApp === 'companion' && <CompanionApp />}
        {currentApp === 'parent' && <ParentApp />}
      </div>

      {/* 侧边悬浮控制台 (抽屉效果，避免遮挡导航) */}
      <div
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-[9999] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${isDemoOpen ? 'translate-x-0' : 'translate-x-[calc(100%-32px)]'}`}
        onMouseEnter={() => setIsDemoOpen(true)}
        onMouseLeave={() => setIsDemoOpen(false)}
      >
        <div className="flex bg-white/95 backdrop-blur-md rounded-l-2xl border border-r-0 border-slate-200 shadow-[-10px_0_30px_-10px_rgba(0,0,0,0.15)] overflow-hidden items-center group cursor-pointer">

          {/* 触发把手 (固定 32px 宽) */}
          <div className="w-8 shrink-0 flex flex-col gap-1 items-center justify-center text-slate-400 group-hover:text-blue-600 transition-colors py-6 border-r border-slate-100 bg-slate-50/50 self-stretch">
            <span className="text-[10px] font-black">D</span>
            <span className="text-[10px] font-black">E</span>
            <span className="text-[10px] font-black">M</span>
            <span className="text-[10px] font-black">O</span>
          </div>

          {/* 控制面板 */}
          <div className="flex flex-col gap-2 p-3 bg-white">
            <div className="text-[10px] font-black text-slate-400 text-center uppercase tracking-widest mb-1">
              环境切换
            </div>
            <button
              onClick={() => setCurrentApp('terminal')}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'terminal' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              title="货柜机 - 学生端"
            >
              <MonitorSmartphone size={22} className="mb-1" />
              <span className="text-[9px] font-bold">货柜机</span>
            </button>
            <button
              onClick={() => setCurrentApp('pc-workspace')}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'pc-workspace' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              title="统一SaaS平台 - PC端"
            >
              <Monitor size={22} className="mb-1" />
              <span className="text-[9px] font-bold">PC端</span>
            </button>
            <button
              onClick={() => setCurrentApp('admin')}
              className={`w-14 h-14 flex flex-col items-center justify-center rounded-xl transition-all ${currentApp === 'admin' ? 'bg-slate-900 text-white shadow-md' : 'text-slate-500 hover:bg-slate-100'}`}
              title="管理端 - 教师手机控制"
            >
              <Smartphone size={22} className="mb-1" />
              <span className="text-[9px] font-bold">教师手机端</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default AppSwitcher;
