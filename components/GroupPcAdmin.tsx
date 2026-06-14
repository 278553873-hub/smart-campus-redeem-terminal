import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Input,
  Progress,
  Select,
  Table,
  Tag,
} from '@arco-design/web-react';
import {
  Activity,
  AlertTriangle,
  BarChart3,
  BrainCircuit,
  Building2,
  CheckCircle2,
  ClipboardList,
  Database,
  FileBarChart,
  Gauge,
  Layers3,
  Lock,
  LogOut,
  Monitor,
  Radar,
  Search,
  ShieldCheck,
  Sparkles,
  TrendingDown,
  TrendingUp,
  UserRoundCheck,
  type LucideIcon,
} from 'lucide-react';
import PlatformBrandMark from './PlatformBrandMark';

type GroupSection = 'overview' | 'indicators' | 'supervision' | 'ai' | 'reports' | 'data';
type FiveDimensionKey = 'de' | 'zhi' | 'ti' | 'mei' | 'lao';

type FiveDimension = {
  key: FiveDimensionKey;
  label: string;
  full: string;
  score: number;
  trend: string;
  color: string;
  bg: string;
};

type CampusRow = {
  key: string;
  name: string;
  region: string;
  teacherCount: number;
  behaviorCount: number;
  studentCoverage: number;
  teacherParticipation: number;
  dimensionsTouched: number;
  indicatorBreadth: number;
  alertCount: number;
  status: '平稳' | '关注' | '重点关注';
  weak: string;
};

type IndicatorRow = {
  key: string;
  dimension: string;
  level1: string;
  level2: string;
  level3: string;
  campusUsage: number;
  updatedAt: string;
  status: '启用' | '待完善';
};

type CampusIndicatorRow = {
  key: string;
  campus: string;
  version: string;
  groupCoverage: number;
  customItems: number;
  updatedAt: string;
  status: '已对齐' | '待同步' | '需完善';
};

const sectionMeta: Record<GroupSection, { label: string; icon: LucideIcon }> = {
  overview: { label: '集团驾驶舱', icon: Gauge },
  indicators: { label: '素养指标中心', icon: Layers3 },
  supervision: { label: '学情预警中心', icon: ClipboardList },
  ai: { label: 'AI 督导中心', icon: BrainCircuit },
  reports: { label: '成长报告中心', icon: FileBarChart },
  data: { label: '教育治理中心', icon: Database },
};

const dimensions: FiveDimension[] = [
  { key: 'de', label: '德', full: '德育', score: 80, trend: '+3.2%', color: '#1677ff', bg: 'bg-blue-50 text-blue-700 border-blue-100' },
  { key: 'zhi', label: '智', full: '智育', score: 86, trend: '+1.8%', color: '#14b8a6', bg: 'bg-teal-50 text-teal-700 border-teal-100' },
  { key: 'ti', label: '体', full: '体育', score: 73, trend: '-1.2%', color: '#f97316', bg: 'bg-orange-50 text-orange-700 border-orange-100' },
  { key: 'mei', label: '美', full: '美育', score: 71, trend: '+1.1%', color: '#8b5cf6', bg: 'bg-violet-50 text-violet-700 border-violet-100' },
  { key: 'lao', label: '劳', full: '劳育', score: 75, trend: '+3.6%', color: '#22c55e', bg: 'bg-green-50 text-green-700 border-green-100' },
];

const campusRows: CampusRow[] = [
  { key: 'c1', name: '宁康园校区（本部）', region: '本部校区', teacherCount: 68, behaviorCount: 32400, studentCoverage: 92, teacherParticipation: 88, dimensionsTouched: 5, indicatorBreadth: 52, alertCount: 0, status: '平稳', weak: '无明显短板' },
  { key: 'c2', name: '湖畔校区', region: '分校区', teacherCount: 42, behaviorCount: 18600, studentCoverage: 76, teacherParticipation: 68, dimensionsTouched: 5, indicatorBreadth: 40, alertCount: 1, status: '平稳', weak: '美育活动参与' },
  { key: 'c3', name: '朴真校区', region: '分校区', teacherCount: 38, behaviorCount: 15200, studentCoverage: 71, teacherParticipation: 62, dimensionsTouched: 4, indicatorBreadth: 36, alertCount: 2, status: '关注', weak: '体育记录偏少' },
  { key: 'c4', name: '军山小学校区', region: '分校区', teacherCount: 35, behaviorCount: 12800, studentCoverage: 64, teacherParticipation: 55, dimensionsTouched: 4, indicatorBreadth: 32, alertCount: 3, status: '关注', weak: '劳育覆盖偏低' },
  { key: 'c5', name: '育才二小校区', region: '分校区', teacherCount: 45, behaviorCount: 20400, studentCoverage: 80, teacherParticipation: 72, dimensionsTouched: 5, indicatorBreadth: 44, alertCount: 0, status: '平稳', weak: '无明显短板' },
  { key: 'c6', name: '子林校区', region: '分校区', teacherCount: 32, behaviorCount: 10600, studentCoverage: 58, teacherParticipation: 48, dimensionsTouched: 3, indicatorBreadth: 28, alertCount: 4, status: '重点关注', weak: '德育负向行为' },
];

const groupIndicatorRows: IndicatorRow[] = [
  { key: 'i1', dimension: '德育', level1: '品德发展', level2: '遵纪守法', level3: '友爱同学', campusUsage: 6, updatedAt: '2026-05-26', status: '启用' },
  { key: 'i2', dimension: '智育', level1: '学习品质', level2: '创新思维', level3: '科创实践', campusUsage: 5, updatedAt: '2026-05-22', status: '启用' },
  { key: 'i3', dimension: '体育', level1: '身心健康', level2: '运动习惯', level3: '课程参与', campusUsage: 6, updatedAt: '2026-05-18', status: '启用' },
  { key: 'i4', dimension: '美育', level1: '审美素养', level2: '艺术实践', level3: '作品展示', campusUsage: 4, updatedAt: '2026-05-16', status: '待完善' },
  { key: 'i5', dimension: '劳育', level1: '劳动素养', level2: '校园劳动', level3: '公共服务', campusUsage: 5, updatedAt: '2026-05-12', status: '启用' },
];

const campusIndicatorRows: CampusIndicatorRow[] = [
  { key: 'ci1', campus: '宁康园校区（本部）', version: '集团方案 V2 + 本部补充', groupCoverage: 100, customItems: 14, updatedAt: '2026-05-28', status: '已对齐' },
  { key: 'ci2', campus: '湖畔校区', version: '集团方案 V2', groupCoverage: 96, customItems: 6, updatedAt: '2026-05-24', status: '已对齐' },
  { key: 'ci3', campus: '朴真校区', version: '集团方案 V2', groupCoverage: 92, customItems: 4, updatedAt: '2026-05-20', status: '待同步' },
  { key: 'ci4', campus: '军山小学校区', version: '集团方案 V2 + 校区补充', groupCoverage: 86, customItems: 8, updatedAt: '2026-05-18', status: '需完善' },
  { key: 'ci5', campus: '育才二小校区', version: '集团方案 V2', groupCoverage: 100, customItems: 5, updatedAt: '2026-05-27', status: '已对齐' },
  { key: 'ci6', campus: '子林校区', version: '集团方案 V2', groupCoverage: 88, customItems: 3, updatedAt: '2026-05-22', status: '待同步' },
];

const warningItems = [
  { title: '子林校区德育负向行为持续偏高', meta: '三年级"同伴冲突"近 7 日较上周 +18%，需关注', level: '高', tone: 'red' },
  { title: '湖畔校区跳绳达标率偏低', meta: '二年级跳绳达标率 58%，低于集团标准 80%', level: '高', tone: 'red' },
  { title: '军山小学校区立定跳远达标率下降', meta: '四年级立定跳远达标率 64%，较上月下降 12%', level: '中', tone: 'orange' },
];

const dataTasks = [
  { name: '学生基础档案', source: '集团教育数据中台', status: '正常', rate: 99, time: '今日 06:10' },
  { name: '学业成绩数据', source: '教务管理系统', status: '正常', rate: 98, time: '今日 06:35' },
  { name: '体质健康数据', source: '体育测评系统', status: '异常', rate: 72, time: '今日 07:00' },
  { name: '行为与积分流水', source: 'AI 素养评价系统', status: '正常', rate: 100, time: '实时' },
];

const cnFont = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif';

const scoreTone = (score: number) => {
  if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-100';
  return 'text-orange-600 bg-orange-50 border-orange-100';
};

const statusTag = (status: CampusRow['status']) => {
  if (status === '平稳') return <Tag color="green">平稳</Tag>;
  if (status === '关注') return <Tag color="orangered">关注</Tag>;
  return <Tag color="red">重点关注</Tag>;
};

const StatCard: React.FC<{ title: string; value: string; sub: string; icon: LucideIcon; tone: string; trend?: 'up' | 'down' }> = ({ title, value, sub, icon: Icon, tone, trend = 'up' }) => (
  <div className="min-h-[118px] rounded-2xl border border-slate-200 bg-white p-4 shadow-[0_10px_24px_rgba(15,23,42,0.035)]">
    <div className="flex h-full flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 text-[13px] font-bold leading-5 text-slate-500">{title}</div>
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${tone}`}>
          <Icon size={18} />
        </div>
      </div>
      <div className="min-w-0">
        <div className="truncate text-[28px] font-black leading-none tracking-[-0.05em] text-slate-900">{value}</div>
        <div className={`mt-2 inline-flex max-w-full items-center gap-1 rounded-full px-2 py-0.5 text-[12px] font-black leading-4 ${trend === 'up' ? 'bg-emerald-50 text-emerald-600' : 'bg-orange-50 text-orange-600'}`}>
          {trend === 'up' ? <TrendingUp size={12} className="shrink-0" /> : <TrendingDown size={12} className="shrink-0" />}
          <span className="truncate">{sub}</span>
        </div>
      </div>
    </div>
  </div>
);

const SectionShell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <section className="min-h-full p-6">
    {children}
  </section>
);

const DimensionBars: React.FC = () => (
  <div className="space-y-4">
    {dimensions.map((item) => (
      <div key={item.key}>
        <div className="mb-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`flex h-8 w-8 items-center justify-center rounded-xl border text-sm font-black ${item.bg}`}>{item.label}</span>
            <div>
              <div className="text-sm font-black text-slate-800">{item.full}</div>
              <div className="text-xs font-bold text-slate-400">集团均值 {item.score} 分</div>
            </div>
          </div>
          <span className={`text-xs font-black ${item.trend.startsWith('-') ? 'text-orange-600' : 'text-emerald-600'}`}>{item.trend}</span>
        </div>
        <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full" style={{ width: `${item.score}%`, backgroundColor: item.color }} />
        </div>
      </div>
    ))}
  </div>
);

const RadarSketch: React.FC = () => {
  const points = dimensions.map((item, index) => {
    const angle = (-90 + index * 72) * Math.PI / 180;
    const radius = 72 * (item.score / 100);
    return `${100 + Math.cos(angle) * radius},${100 + Math.sin(angle) * radius}`;
  }).join(' ');

  return (
    <div className="relative flex h-[280px] items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_center,#ffffff_0%,#f8fbff_55%,#edf5ff_100%)]">
      <svg width="240" height="240" viewBox="0 0 200 200" className="overflow-visible">
        {[24, 48, 72].map((r) => (
          <polygon
            key={r}
            points={dimensions.map((_, index) => {
              const angle = (-90 + index * 72) * Math.PI / 180;
              return `${100 + Math.cos(angle) * r},${100 + Math.sin(angle) * r}`;
            }).join(' ')}
            fill="none"
            stroke="#dbe7f6"
            strokeWidth="1"
          />
        ))}
        {dimensions.map((item, index) => {
          const angle = (-90 + index * 72) * Math.PI / 180;
          return <line key={item.key} x1="100" y1="100" x2={100 + Math.cos(angle) * 82} y2={100 + Math.sin(angle) * 82} stroke="#e5edf7" strokeWidth="1" />;
        })}
        <polygon points={points} fill="rgba(22,93,255,0.18)" stroke="#165dff" strokeWidth="3" />
        {dimensions.map((item, index) => {
          const angle = (-90 + index * 72) * Math.PI / 180;
          return (
            <g key={item.key}>
              <circle cx={100 + Math.cos(angle) * 72 * (item.score / 100)} cy={100 + Math.sin(angle) * 72 * (item.score / 100)} r="4" fill={item.color} />
              <text x={100 + Math.cos(angle) * 96} y={104 + Math.sin(angle) * 96} textAnchor="middle" className="fill-slate-600 text-[11px] font-bold">{item.full}</text>
            </g>
          );
        })}
      </svg>
      <div className="absolute bottom-4 left-4 rounded-xl border border-blue-100 bg-white/85 px-3 py-2 text-xs font-bold text-slate-500 shadow-sm backdrop-blur">
        集团综合素养指数 <span className="text-blue-600">79.4</span>
      </div>
    </div>
  );
};

const trendPoints = [38, 46, 52, 60, 68, 76, 85, 94, 106];
const behaviorTrend = [
  { month: '9月', positive: 14200, negative: 1180 },
  { month: '10月', positive: 18600, negative: 1520 },
  { month: '11月', positive: 22800, negative: 1960 },
  { month: '12月', positive: 26400, negative: 2240 },
  { month: '1月', positive: 21200, negative: 1780 },
  { month: '2月', positive: 18400, negative: 1360 },
  { month: '3月', positive: 28600, negative: 2480 },
  { month: '4月', positive: 32800, negative: 2860 },
  { month: '5月', positive: 38200, negative: 3240 },
];

const indicatorDistribution = [
  { label: '德育', value: 52400, color: '#1677ff' },
  { label: '智育', value: 24600, color: '#14b8a6' },
  { label: '体育', value: 18200, color: '#f97316' },
  { label: '美育', value: 13400, color: '#8b5cf6' },
  { label: '劳育', value: 21200, color: '#22c55e' },
];

const topIndicators = [
  { name: '德育 / 遵纪守法 / 友爱同学', value: 12600, campuses: 6, tone: 'bg-blue-500' },
  { name: '劳育 / 校园劳动 / 公共服务', value: 9800, campuses: 5, tone: 'bg-green-500' },
  { name: '智育 / 学科素养 / 课堂思考', value: 8400, campuses: 6, tone: 'bg-teal-500' },
  { name: '体育 / 运动习惯 / 课程参与', value: 6800, campuses: 5, tone: 'bg-orange-500' },
  { name: '美育 / 艺术实践 / 文艺活动', value: 4600, campuses: 4, tone: 'bg-violet-500' },
];

const lowIndicators = [
  { name: '美育 / 审美表达 / 校外展陈', dimension: '美育', cycles: '连续 3 个周期低频', action: '补充场景样例' },
  { name: '体育 / 赛事参与 / 集团竞赛', dimension: '体育', cycles: '本学期零命中', action: '确认适用区域' },
  { name: '劳育 / 生活技能 / 家庭维修', dimension: '劳育', cycles: '全集团命中 28 次', action: '优化指标描述' },
];

const warningDistribution = [
  { label: '德育行为', value: 4, color: '#f53f3f' },
  { label: '体质达标', value: 5, color: '#ff7d00' },
  { label: '心理健康', value: 2, color: '#f7ba1e' },
  { label: '教师评价', value: 1, color: '#722ed1' },
  { label: '数据同步', value: 1, color: '#165dff' },
];

const formatNumber = (value: number) => value.toLocaleString('zh-CN');

const BIG_SCREEN_CANVAS_WIDTH = 1920;
const BIG_SCREEN_CANVAS_HEIGHT = 1080;

const BigScreenScaleFrame: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [viewport, setViewport] = useState({ width: BIG_SCREEN_CANVAS_WIDTH, height: BIG_SCREEN_CANVAS_HEIGHT });

  useEffect(() => {
    const updateViewport = () => {
      setViewport({
        width: window.innerWidth || BIG_SCREEN_CANVAS_WIDTH,
        height: window.innerHeight || BIG_SCREEN_CANVAS_HEIGHT,
      });
    };

    updateViewport();
    window.addEventListener('resize', updateViewport);
    return () => window.removeEventListener('resize', updateViewport);
  }, []);

  const scale = Math.min(
    viewport.width / BIG_SCREEN_CANVAS_WIDTH,
    viewport.height / BIG_SCREEN_CANVAS_HEIGHT
  );

  return (
    <div className="relative h-[100dvh] w-screen overflow-hidden bg-[#020817]">
      <div
        className="absolute left-1/2 top-1/2 h-[1080px] w-[1920px] origin-center"
        style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
      >
        {children}
      </div>
    </div>
  );
};

const MiniLineChart: React.FC<{ values: number[]; color?: string }> = ({ values, color = '#165dff' }) => {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = 16 + index * (268 / Math.max(values.length - 1, 1));
    const y = 116 - ((value - min) / Math.max(max - min, 1)) * 82;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg viewBox="0 0 300 140" className="h-[150px] w-full overflow-visible">
      {[34, 75, 116].map((y) => <line key={y} x1="16" x2="284" y1={y} y2={y} stroke="#edf2f7" strokeWidth="1" />)}
      <polyline points={points} fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      {points.split(' ').map((point, index) => {
        const [cx, cy] = point.split(',').map(Number);
        return <circle key={index} cx={cx} cy={cy} r="4" fill="#fff" stroke={color} strokeWidth="3" />;
      })}
      <text x="16" y="134" className="fill-slate-400 text-[10px] font-bold">9月</text>
      <text x="258" y="134" className="fill-slate-400 text-[10px] font-bold">5月</text>
    </svg>
  );
};

const DonutChart: React.FC<{ data: { label: string; value: number; color: string }[]; center: string; subtitle: string }> = ({ data, center, subtitle }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let offset = 25;
  return (
    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
      <div className="relative h-[150px] w-[150px]">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90">
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="#eef2f7" strokeWidth="7" />
          {data.map((item) => {
            const dash = (item.value / total) * 100;
            const node = <circle key={item.label} cx="21" cy="21" r="15.915" fill="transparent" stroke={item.color} strokeWidth="7" strokeDasharray={`${dash} ${100 - dash}`} strokeDashoffset={offset} />;
            offset -= dash;
            return node;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="text-2xl font-black tracking-[-0.04em] text-slate-900">{center}</div>
          <div className="text-xs font-bold text-slate-400">{subtitle}</div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-2 font-bold text-slate-600"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</div>
            <span className="font-black text-slate-900">{formatNumber(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const HorizontalBars: React.FC<{ data: { name: string; value: number; districts?: number; tone: string }[] }> = ({ data }) => {
  const max = Math.max(...data.map((item) => item.value));
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={item.name}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <div className="min-w-0 truncate text-sm font-black text-slate-700"><span className="mr-2 text-slate-400">{index + 1}</span>{item.name}</div>
            <div className="shrink-0 text-xs font-black text-slate-500">{formatNumber(item.value)} 次{item.districts ? ` / ${item.districts} 区` : ''}</div>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
            <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${Math.max((item.value / max) * 100, 8)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const StackedBehaviorChart: React.FC = () => {
  const max = Math.max(...behaviorTrend.map((item) => item.positive + item.negative));
  return (
    <div className="flex h-[220px] items-end gap-3 rounded-2xl bg-slate-50 px-4 pb-4 pt-6">
      {behaviorTrend.map((item) => {
        const positiveHeight = Math.max((item.positive / max) * 160, 8);
        const negativeHeight = Math.max((item.negative / max) * 160, 4);
        return (
          <div key={item.month} className="flex flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-[170px] w-full max-w-[30px] flex-col justify-end overflow-hidden rounded-t-xl bg-white shadow-sm">
              <div className="bg-emerald-500" style={{ height: positiveHeight }} />
              <div className="bg-rose-500" style={{ height: negativeHeight }} />
            </div>
            <span className="text-xs font-bold text-slate-400">{item.month}</span>
          </div>
        );
      })}
    </div>
  );
};

const CampusHeatmap: React.FC = () => {
  const heat = [
    { campus: '宁康园校区（本部）', values: [90, 92, 84, 82, 88] },
    { campus: '湖畔校区', values: [82, 86, 76, 74, 80] },
    { campus: '朴真校区', values: [78, 84, 68, 72, 76] },
    { campus: '军山小学校区', values: [72, 80, 70, 66, 72] },
    { campus: '育才二小校区', values: [86, 90, 82, 78, 84] },
    { campus: '子林校区', values: [66, 78, 64, 60, 68] },
  ];
  const tone = (value: number) => value >= 85 ? 'bg-emerald-500 text-white' : value >= 75 ? 'bg-blue-500 text-white' : value >= 68 ? 'bg-orange-400 text-white' : 'bg-rose-500 text-white';
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[160px_repeat(5,1fr)] gap-2 text-xs font-black text-slate-400">
        <div>区域</div>{dimensions.map((item) => <div key={item.key} className="text-center">{item.full}</div>)}
      </div>
      {heat.map((row) => (
        <div key={row.campus} className="grid grid-cols-[160px_repeat(5,1fr)] gap-2">
          <div className="truncate rounded-xl bg-slate-50 px-3 py-2 text-sm font-black text-slate-700">{row.campus}</div>
          {row.values.map((value, index) => <div key={index} className={`rounded-xl py-2 text-center text-sm font-black ${tone(value)}`}>{value}</div>)}
        </div>
      ))}
    </div>
  );
};

const CampusQuadrant: React.FC = () => (
  <div className="relative h-[280px] rounded-2xl bg-slate-50 p-4">
    <svg viewBox="0 0 360 230" className="h-full w-full">
      <line x1="45" x2="330" y1="115" y2="115" stroke="#d8e0ea" strokeDasharray="5 5" />
      <line x1="185" x2="185" y1="25" y2="205" stroke="#d8e0ea" strokeDasharray="5 5" />
      <text x="48" y="24" className="fill-slate-400 text-[11px] font-bold">五育综合表现</text>
      <text x="250" y="220" className="fill-slate-400 text-[11px] font-bold">日常评价活跃度</text>
      {campusRows.map((campus) => {
        const x = 45 + (campus.behaviorCount / 100000) * 250;
        const y = 198 - (campus.studentCoverage / 90) * 160;
        const color = campus.status === '平稳' ? '#00b42a' : campus.status === '关注' ? '#ff7d00' : '#f53f3f';
        return (
          <g key={campus.key}>
            <circle cx={x} cy={y} r={10 + campus.alertCount} fill={color} opacity="0.84" />
            <text x={x + 12} y={y + 4} className="fill-slate-700 text-[10px] font-bold">{campus.name.slice(0, 4)}</text>
          </g>
        );
      })}
      <text x="215" y="52" className="fill-emerald-600 text-[12px] font-black">示范带动</text>
      <text x="68" y="52" className="fill-blue-600 text-[12px] font-black">稳定观察</text>
      <text x="215" y="172" className="fill-orange-600 text-[12px] font-black">活跃偏低</text>
      <text x="68" y="172" className="fill-rose-600 text-[12px] font-black">重点关注</text>
    </svg>
  </div>
);

/* ==================== 大屏组件 ==================== */

const BigScreenMetric: React.FC<{ label: string; value: string; unit?: string; sub: string; tone: string }> = ({ label, value, unit, sub, tone }) => (
  <div className="group relative min-h-[112px] overflow-hidden border border-sky-300/22 bg-[#071a34]/82 px-4 py-3 shadow-[inset_0_0_32px_rgba(56,189,248,0.1),0_18px_38px_rgba(0,0,0,0.2)]">
    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(125,211,252,0.12),transparent_34%,rgba(34,211,238,0.07))]" />
    <div className={`absolute left-0 top-0 h-full w-[3px] ${tone}`} />
    <div className="relative text-[12px] font-bold tracking-[0.08em] text-sky-100/68">{label}</div>
    <div className="relative mt-3 flex items-end gap-1">
      <span className="font-mono text-[34px] font-black leading-none tracking-[-0.05em] text-white drop-shadow-[0_0_14px_rgba(125,211,252,0.42)]">{value}</span>
      {unit && <span className="mb-1.5 text-xs font-bold text-sky-100/58">{unit}</span>}
    </div>
    <div className="relative mt-2 text-[11px] font-bold text-cyan-200/72">{sub}</div>
  </div>
);

const BigScreenPanel: React.FC<{ title: string; children: React.ReactNode; className?: string; extra?: React.ReactNode }> = ({ title, children, className = '', extra }) => (
  <section className={`relative min-h-0 overflow-hidden border border-sky-300/20 bg-[#061a35]/76 p-3 shadow-[inset_0_0_42px_rgba(14,165,233,0.09),0_22px_46px_rgba(0,0,0,0.24)] ${className}`}>
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/75 to-transparent" />
    <div className="pointer-events-none absolute left-0 top-0 h-5 w-5 border-l border-t border-cyan-200/60" />
    <div className="pointer-events-none absolute right-0 top-0 h-5 w-5 border-r border-t border-cyan-200/60" />
    <div className="pointer-events-none absolute bottom-0 left-0 h-5 w-5 border-b border-l border-cyan-200/35" />
    <div className="pointer-events-none absolute bottom-0 right-0 h-5 w-5 border-b border-r border-cyan-200/35" />
    <div className="relative mb-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="h-2 w-2 rotate-45 bg-cyan-300 shadow-[0_0_14px_rgba(103,232,249,0.9)]" />
        <h2 className="text-[15px] font-black tracking-[0.14em] text-cyan-50">{title}</h2>
      </div>
      {extra}
    </div>
    <div className="relative min-h-0">{children}</div>
  </section>
);

const BigScreenRadar: React.FC = () => {
  const points = dimensions.map((item, index) => {
    const angle = (-90 + index * 72) * Math.PI / 180;
    const radius = 88 * (item.score / 100);
    return `${120 + Math.cos(angle) * radius},${120 + Math.sin(angle) * radius}`;
  }).join(' ');

  return (
    <div className="grid h-full grid-cols-[1fr_112px] items-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg width="250" height="250" viewBox="0 0 240 240" className="overflow-visible drop-shadow-[0_0_20px_rgba(34,211,238,0.25)]">
          {[30, 58, 88].map((r, index) => (
            <g key={r}>
              <polygon
                points={dimensions.map((_, dimIndex) => {
                  const angle = (-90 + dimIndex * 72) * Math.PI / 180;
                  return `${120 + Math.cos(angle) * r},${120 + Math.sin(angle) * r}`;
                }).join(' ')}
                fill="none"
                stroke="rgba(125,211,252,0.28)"
                strokeWidth="1"
              />
              {index === 2 && <text x="122" y="31" className="fill-cyan-100/45 text-[8px] font-bold">100</text>}
            </g>
          ))}
          {dimensions.map((item, index) => {
            const angle = (-90 + index * 72) * Math.PI / 180;
            return <line key={item.key} x1="120" y1="120" x2={120 + Math.cos(angle) * 100} y2={120 + Math.sin(angle) * 100} stroke="rgba(125,211,252,0.18)" strokeWidth="1" />;
          })}
          <polygon points={points} fill="rgba(34,211,238,0.22)" stroke="#67e8f9" strokeWidth="3" />
          {dimensions.map((item, index) => {
            const angle = (-90 + index * 72) * Math.PI / 180;
            const cx = 120 + Math.cos(angle) * 88 * (item.score / 100);
            const cy = 120 + Math.sin(angle) * 88 * (item.score / 100);
            return (
              <g key={item.key}>
                <circle cx={cx} cy={cy} r="5" fill={item.color} stroke="#e0f2fe" strokeWidth="1.8" />
                <text x={120 + Math.cos(angle) * 116} y={125 + Math.sin(angle) * 116} textAnchor="middle" className="fill-cyan-50 text-[12px] font-bold">{item.full}</text>
                <text x={cx} y={cy - 10} textAnchor="middle" className="fill-white text-[10px] font-black">{item.score}</text>
              </g>
            );
          })}
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="rounded-full border border-cyan-300/20 bg-cyan-950/45 px-5 py-4 text-center shadow-[0_0_40px_rgba(34,211,238,0.16)]">
            <div className="font-mono text-[32px] font-black leading-none text-white">79.4</div>
            <div className="mt-1 text-xs font-bold tracking-[0.1em] text-cyan-200/80">五育均衡指数</div>
          </div>
        </div>
      </div>
      <div className="space-y-1.5 border border-cyan-300/12 bg-cyan-950/28 p-3">
        {dimensions.map((item) => (
          <div key={item.key} className="flex items-center justify-between gap-2 text-xs">
            <span className="flex items-center gap-2 font-bold text-cyan-50/75"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.full}</span>
            <span className="font-mono font-black text-white">{item.score}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BigScreenHeroVisual: React.FC = () => {
  const bars = [
    { x: 207, y: 122, w: 42, h: 126, color: '#22d3ee', label: '德' },
    { x: 270, y: 70, w: 48, h: 178, color: '#2dd4bf', label: '智' },
    { x: 338, y: 108, w: 42, h: 140, color: '#38bdf8', label: '体' },
    { x: 405, y: 146, w: 38, h: 102, color: '#14b8a6', label: '美' },
    { x: 154, y: 170, w: 34, h: 78, color: '#67e8f9', label: '劳' },
  ];

  const anchorStats = [
    { label: '覆盖校区', value: '6', unit: '个', className: 'left-8 top-10' },
    { label: '均衡指数', value: '79.4', unit: '', className: 'right-8 top-10' },
    { label: '行为记录', value: '400,900', unit: '条', className: 'left-12 bottom-8' },
    { label: '风险预警', value: '12', unit: '项', className: 'right-12 bottom-8', warn: true },
  ];

  return (
    <div className="relative h-[332px] overflow-hidden">
      <div className="absolute left-1/2 top-1/2 h-[320px] w-[640px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="absolute inset-x-[16%] top-[46px] h-[150px] rounded-full border border-cyan-200/10 bg-cyan-300/5 blur-sm" />

      <svg viewBox="0 0 620 320" className="absolute inset-0 h-full w-full overflow-visible drop-shadow-[0_0_24px_rgba(34,211,238,0.3)]">
        <defs>
          <linearGradient id="heroPlatformTopG" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0%" stopColor="#5eead4" stopOpacity="0.58" />
            <stop offset="55%" stopColor="#0891b2" stopOpacity="0.34" />
            <stop offset="100%" stopColor="#0f766e" stopOpacity="0.16" />
          </linearGradient>
          <linearGradient id="heroPlatformSideG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.48" />
            <stop offset="100%" stopColor="#0f172a" stopOpacity="0.04" />
          </linearGradient>
          <linearGradient id="heroRingG" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#5eead4" stopOpacity="0.08" />
            <stop offset="38%" stopColor="#22d3ee" stopOpacity="0.46" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0.12" />
          </linearGradient>
          <linearGradient id="heroBarG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#ecfeff" stopOpacity="0.92" />
            <stop offset="18%" stopColor="#67e8f9" stopOpacity="0.86" />
            <stop offset="100%" stopColor="#0e7490" stopOpacity="0.2" />
          </linearGradient>
          <filter id="heroGlowG" x="-30%" y="-40%" width="160%" height="190%">
            <feGaussianBlur stdDeviation="5" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <g opacity="0.5">
          {[0, 1, 2, 3].map((item) => (
            <ellipse key={item} cx="310" cy="221" rx={118 + item * 28} ry={34 + item * 8} fill="none" stroke="rgba(125,211,252,0.18)" strokeDasharray="8 10" />
          ))}
        </g>

        <path d="M116 145 C152 88 454 82 506 138 L476 178 C394 143 232 143 146 182 Z" fill="url(#heroRingG)" stroke="rgba(103,232,249,0.46)" strokeWidth="1.5" />
        <path d="M120 144 C184 184 420 181 506 138" fill="none" stroke="rgba(167,243,208,0.48)" strokeWidth="4" strokeLinecap="round" />
        <path d="M144 182 C210 140 378 138 476 178" fill="none" stroke="rgba(34,211,238,0.24)" strokeWidth="2" strokeDasharray="7 9" />

        <g filter="url(#heroGlowG)">
          <ellipse cx="310" cy="244" rx="148" ry="42" fill="url(#heroPlatformTopG)" stroke="#67e8f9" strokeWidth="2" />
          <path d="M162 244 C190 294 427 294 458 244 L458 265 C420 310 196 310 162 265 Z" fill="url(#heroPlatformSideG)" stroke="rgba(34,211,238,0.36)" />
          <ellipse cx="310" cy="244" rx="110" ry="28" fill="rgba(6,182,212,0.12)" stroke="rgba(165,243,252,0.34)" />
          <path d="M216 248 C250 232 370 232 408 248" fill="none" stroke="rgba(236,254,255,0.42)" strokeWidth="2" strokeLinecap="round" />
        </g>

        {bars.map((bar) => (
          <g key={bar.label} filter="url(#heroGlowG)">
            <path d={`M${bar.x} ${bar.y} L${bar.x + bar.w / 2} ${bar.y - 17} L${bar.x + bar.w} ${bar.y} L${bar.x + bar.w / 2} ${bar.y + 18} Z`} fill={bar.color} opacity="0.92" />
            <path d={`M${bar.x} ${bar.y} L${bar.x + bar.w / 2} ${bar.y + 18} L${bar.x + bar.w / 2} ${bar.y + bar.h} L${bar.x} ${bar.y + bar.h - 18} Z`} fill="#0891b2" opacity="0.62" />
            <path d={`M${bar.x + bar.w} ${bar.y} L${bar.x + bar.w / 2} ${bar.y + 18} L${bar.x + bar.w / 2} ${bar.y + bar.h} L${bar.x} ${bar.y + bar.h - 18} Z`} fill="url(#heroBarG)" opacity="0.72" />
            <path d={`M${bar.x} ${bar.y + bar.h - 18} L${bar.x + bar.w / 2} ${bar.y + bar.h} L${bar.x + bar.w} ${bar.y + bar.h - 18} L${bar.x + bar.w / 2} ${bar.y + bar.h - 36} Z`} fill="rgba(34,211,238,0.28)" />
            <line x1={bar.x + bar.w / 2} x2={bar.x + bar.w / 2} y1={bar.y - 50} y2={bar.y - 18} stroke="rgba(125,211,252,0.2)" strokeWidth="12" strokeLinecap="round" />
          </g>
        ))}

        <g opacity="0.72">
          <path d="M94 232 C150 204 202 216 256 188" fill="none" stroke="#67e8f9" strokeWidth="2" strokeDasharray="6 9" />
          <path d="M364 192 C428 201 480 212 534 176" fill="none" stroke="#86efac" strokeWidth="2" strokeDasharray="6 9" />
          <circle cx="256" cy="188" r="4" fill="#ecfeff" />
          <circle cx="534" cy="176" r="4" fill="#bbf7d0" />
          {[130, 162, 194, 470, 500, 528].map((x, index) => (
            <rect key={x} x={x} y={236 - (index % 3) * 12} width="4" height={18 + (index % 3) * 10} rx="2" fill={index > 2 ? '#86efac' : '#67e8f9'} opacity="0.78" />
          ))}
        </g>

        <g>
          {[
            [104, 116], [132, 260], [492, 102], [520, 244], [310, 42], [382, 64],
          ].map(([cx, cy], index) => (
            <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={index % 2 ? 2.4 : 3.4} fill="#ecfeff" opacity="0.76" />
          ))}
        </g>
      </svg>

      {anchorStats.map((item) => (
        <div key={item.label} className={`absolute ${item.className} w-[118px] border border-cyan-300/18 bg-cyan-950/34 px-3 py-2 shadow-[0_0_22px_rgba(34,211,238,0.12)] backdrop-blur-sm`}>
          <div className="text-[10px] font-black tracking-[0.14em] text-cyan-100/55">{item.label}</div>
          <div className={`mt-1 font-mono text-[24px] font-black leading-none ${item.warn ? 'text-amber-200' : 'text-white'}`}>
            {item.value}<span className="ml-1 text-[11px] font-bold text-cyan-100/55">{item.unit}</span>
          </div>
        </div>
      ))}

      <div className="absolute left-1/2 top-[252px] -translate-x-1/2 text-center">
        <div className="font-mono text-[34px] font-black leading-none tracking-[-0.04em] text-white drop-shadow-[0_0_16px_rgba(125,211,252,0.55)]">集团数据中枢</div>
        <div className="mt-1 text-[11px] font-bold tracking-[0.24em] text-cyan-200/65">五育 · 行为 · 预警 · 校区</div>
      </div>
    </div>
  );
};

const BigScreenTrend: React.FC = () => {
  const values = [68, 71, 72, 74, 73, 75, 76, 78, 79];
  const months = ['9月', '10月', '11月', '12月', '1月', '2月', '3月', '4月', '5月'];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = 36 + index * 48;
    const y = 154 - ((value - min) / Math.max(max - min, 1)) * 92;
    return `${x},${y}`;
  }).join(' ');
  return (
    <div>
      <svg viewBox="0 0 450 190" className="h-[190px] w-full">
        <defs>
          <linearGradient id="trendGlowG" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="rgba(34,211,238,0.45)" />
            <stop offset="100%" stopColor="rgba(34,211,238,0)" />
          </linearGradient>
        </defs>
        {[62, 108, 154].map((y, index) => (
          <g key={y}>
            <line x1="36" x2="424" y1={y} y2={y} stroke="rgba(125,211,252,0.14)" />
            <text x="8" y={y + 4} className="fill-cyan-100/45 text-[10px] font-bold">{[85, 78, 72][index]}</text>
          </g>
        ))}
        <polyline points={`36,174 ${points} 424,174`} fill="url(#trendGlowG)" stroke="none" />
        <polyline points={points} fill="none" stroke="#67e8f9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        {points.split(' ').map((point, index) => {
          const [cx, cy] = point.split(',').map(Number);
          return (
            <g key={index}>
              <circle cx={cx} cy={cy} r="4.5" fill="#061b3a" stroke="#67e8f9" strokeWidth="3" />
              <text x={cx} y={cy - 12} textAnchor="middle" className="fill-white text-[10px] font-black">{values[index]}</text>
            </g>
          );
        })}
        {months.map((month, index) => (
          <text key={month} x={36 + index * 48} y="184" textAnchor="middle" className="fill-cyan-100/55 text-[11px] font-bold">{month}</text>
        ))}
      </svg>
    </div>
  );
};

const BigScreenFiveEducationSummary: React.FC = () => {
  const values = [68, 71, 72, 74, 73, 75, 76, 78, 79];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = 8 + index * 22;
    const y = 52 - ((value - min) / Math.max(max - min, 1)) * 42;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="grid h-full grid-cols-[220px_1fr] gap-3">
      <div className="flex flex-col justify-between border border-cyan-300/12 bg-cyan-950/28 p-4">
        <div>
          <div className="text-xs font-black tracking-[0.12em] text-cyan-200">五育均衡指数</div>
          <div className="mt-2 font-mono text-[50px] font-black leading-none tracking-[-0.06em] text-white">79.4</div>
          <div className="mt-2 flex items-center gap-2 text-xs font-bold text-emerald-200">
            <TrendingUp size={13} />
            较上月 +2.2
          </div>
        </div>
        <div className="mt-3 bg-cyan-400/10 p-2">
          <div className="mb-1 flex items-center justify-between text-[11px] font-bold text-cyan-100/65"><span>9月</span><span>5月</span></div>
          <svg viewBox="0 0 190 60" className="h-[58px] w-full">
            <polyline points={points} fill="none" stroke="#67e8f9" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            {points.split(' ').map((point, index) => {
              const [cx, cy] = point.split(',').map(Number);
              return <circle key={index} cx={cx} cy={cy} r="3" fill="#061b3a" stroke="#67e8f9" strokeWidth="2" />;
            })}
          </svg>
        </div>
      </div>
      <div className="grid grid-cols-5 gap-3">
        {dimensions.map((item) => (
          <div key={item.key} className="flex flex-col justify-between border border-cyan-300/12 bg-cyan-950/28 p-3">
            <div className="flex items-center justify-between">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl text-sm font-black text-white" style={{ backgroundColor: item.color }}>{item.label}</span>
              <span className={`text-[11px] font-black ${item.trend.startsWith('-') ? 'text-amber-200' : 'text-emerald-200'}`}>{item.trend}</span>
            </div>
            <div>
              <div className="mt-4 font-mono text-[31px] font-black leading-none text-white">{item.score}</div>
              <div className="mt-1 text-xs font-bold text-cyan-100/70">{item.full}得分</div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-cyan-950/80">
                <div className="h-full rounded-full shadow-[0_0_14px_rgba(103,232,249,0.42)]" style={{ width: `${item.score}%`, backgroundColor: item.color }} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const BigScreenBars: React.FC<{ data: { name: string; value: number; districts?: number; tone: string }[] }> = ({ data }) => {
  const max = Math.max(...data.map((item) => item.value));
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={item.name}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <div className="min-w-0 truncate text-[13px] font-bold text-cyan-50/85"><span className="mr-2 font-mono text-cyan-300">{String(index + 1).padStart(2, '0')}</span>{item.name}</div>
            <div className="shrink-0 font-mono text-xs font-black text-cyan-200/80">{formatNumber(item.value)}</div>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-cyan-950/70">
            <div className={`h-full rounded-full ${item.tone} shadow-[0_0_18px_rgba(34,211,238,0.35)]`} style={{ width: `${Math.max((item.value / max) * 100, 8)}%` }} />
          </div>
        </div>
      ))}
    </div>
  );
};

const BigScreenHeatmap: React.FC = () => {
  const campuses = [
    { campus: '宁康园校区（本部）', values: [90, 92, 84, 82, 88] },
    { campus: '湖畔校区', values: [82, 86, 76, 74, 80] },
    { campus: '朴真校区', values: [78, 84, 68, 72, 76] },
    { campus: '军山小学校区', values: [72, 80, 70, 66, 72] },
    { campus: '育才二小校区', values: [86, 90, 82, 78, 84] },
    { campus: '子林校区', values: [66, 78, 64, 60, 68] },
  ];
  const tone = (value: number) => value >= 85 ? 'bg-emerald-400/90 text-[#031c1b]' : value >= 75 ? 'bg-cyan-400/85 text-[#04213e]' : value >= 68 ? 'bg-amber-300/90 text-[#3a2703]' : 'bg-rose-400/90 text-white';
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[160px_repeat(5,1fr)] gap-2 text-xs font-black tracking-[0.12em] text-cyan-100/55">
        <div>区域</div>{dimensions.map((item) => <div key={item.key} className="text-center">{item.label}</div>)}
      </div>
      {schools.map((row) => (
        <div key={row.campus} className="grid grid-cols-[160px_repeat(5,1fr)] gap-2">
          <div className="truncate rounded-lg border border-cyan-300/10 bg-cyan-950/45 px-3 py-2 text-xs font-black text-cyan-50">{row.campus}</div>
          {row.values.map((value, index) => <div key={index} className={`rounded-lg py-2 text-center font-mono text-xs font-black ${tone(value)}`}>{value}</div>)}
        </div>
      ))}
    </div>
  );
};

// 预警数据（按校区分组）
const allWarnings = [
  { type: '德育行为', campus: '子林校区', title: '同伴冲突持续偏高', level: '高' },
  { type: '体质达标', campus: '湖畔校区', title: '跳绳达标率偏低', level: '高' },
  { type: '体质达标', campus: '军山小学校区', title: '立定跳远达标率下降', level: '中' },
  { type: '德育行为', campus: '朴真校区', title: '课堂纪律问题集中', level: '中' },
  { type: '运行指标', campus: '子林校区', title: '教师期末集中录入', level: '中' },
  { type: '运行指标', campus: '军山小学校区', title: '劳育记录覆盖偏低', level: '中' },
];

const BigScreenWarningList: React.FC<{ campus?: string }> = ({ campus }) => {
  const items = campus
    ? allWarnings.filter((w) => w.campus === campus || w.campus.includes(campus!.replace('校区', '')))
    : allWarnings.slice(0, 4);

  return (
  <div className={`grid gap-2 ${items.length <= 4 ? 'grid-rows-4' : 'grid-rows-5'}`}>
    {items.slice(0, 5).map((item) => (
      <div key={item.title} className="min-h-0 border border-cyan-300/16 bg-cyan-950/30 px-3 py-2">
        <div className="mb-1 flex items-center justify-between gap-3">
          <span className="text-xs font-black tracking-[0.1em] text-cyan-300">{item.type}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-black ${item.level === '高' ? 'bg-rose-400 text-white' : 'bg-amber-300 text-amber-950'}`}>{item.level}</span>
        </div>
        <div className="text-sm font-black text-white">{item.campus}</div>
        <div className="mt-0.5 truncate text-xs font-bold leading-4 text-cyan-100/65">{item.title}</div>
      </div>
    ))}
    {items.length === 0 && (
      <div className="flex items-center justify-center h-full border border-cyan-300/10 bg-cyan-950/20 rounded-lg">
        <span className="text-sm font-bold text-cyan-100/40">暂无预警</span>
      </div>
    )}
  </div>
  );
};

const BigScreenDonut: React.FC<{ data: { label: string; value: number; color: string }[]; center: string; subtitle: string }> = ({ data, center, subtitle }) => {
  const total = data.reduce((sum, item) => sum + item.value, 0);
  let offset = 25;
  return (
    <div className="grid grid-cols-[150px_1fr] items-center gap-4">
      <div className="relative h-[150px] w-[150px]">
        <svg viewBox="0 0 42 42" className="h-full w-full -rotate-90 drop-shadow-[0_0_18px_rgba(34,211,238,0.2)]">
          <circle cx="21" cy="21" r="15.915" fill="transparent" stroke="rgba(8,47,73,0.9)" strokeWidth="7" />
          {data.map((item) => {
            const dash = (item.value / total) * 100;
            const node = <circle key={item.label} cx="21" cy="21" r="15.915" fill="transparent" stroke={item.color} strokeWidth="7" strokeDasharray={`${dash} ${100 - dash}`} strokeDashoffset={offset} />;
            offset -= dash;
            return node;
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="font-mono text-[25px] font-black tracking-[-0.04em] text-white">{center}</div>
          <div className="text-xs font-bold text-cyan-200/65">{subtitle}</div>
        </div>
      </div>
      <div className="space-y-2">
        {data.map((item) => (
          <div key={item.label} className="flex items-center justify-between gap-3 text-sm">
            <div className="flex min-w-0 items-center gap-2 font-bold text-cyan-50/75"><span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</div>
            <span className="font-mono text-xs font-black text-cyan-200/80">{formatNumber(item.value)}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const BigScreenStackedBehaviorChart: React.FC = () => {
  const max = Math.max(...behaviorTrend.map((item) => item.positive + item.negative));
  return (
    <div className="flex h-full min-h-0 items-end gap-3 rounded-2xl border border-cyan-300/10 bg-cyan-950/25 px-4 pb-4 pt-6">
      {behaviorTrend.map((item) => {
        const positiveHeight = Math.max((item.positive / max) * 155, 8);
        const negativeHeight = Math.max((item.negative / max) * 155, 4);
        return (
          <div key={item.month} className="flex flex-1 flex-col items-center justify-end gap-2">
            <div className="flex h-full max-h-[170px] min-h-[120px] w-full max-w-[28px] flex-col justify-end overflow-hidden rounded-t-xl bg-cyan-950/70 shadow-[0_0_18px_rgba(34,211,238,0.1)]">
              <div className="bg-emerald-300 shadow-[0_0_14px_rgba(110,231,183,0.5)]" style={{ height: positiveHeight }} />
              <div className="bg-rose-400 shadow-[0_0_14px_rgba(251,113,133,0.45)]" style={{ height: negativeHeight }} />
            </div>
            <span className="whitespace-nowrap text-[11px] font-bold text-cyan-100/55">{item.month}</span>
          </div>
        );
      })}
    </div>
  );
};

const BigScreenBehaviorOperation: React.FC<{ campus?: string }> = ({ campus }) => {
  const behaviorData = campus
    ? campusBehaviorData.find((c) => c.campus === campus)
    : null;
  const positive = behaviorData ? ((behaviorData.positive / (behaviorData.positive + behaviorData.negative)) * 100).toFixed(1) : '87.2';
  const negative = (100 - parseFloat(positive)).toFixed(1);
  const dailyAvg = behaviorData
    ? Math.round((behaviorData.positive + behaviorData.negative) / 30).toLocaleString()
    : '3,660';
  const warnings = campus
    ? (campusWarningData.find((c) => c.campus === campus)?.count ?? 0)
    : 12;

  return (
  <div className="grid h-full grid-cols-[1fr_150px] items-stretch gap-3">
    <div className="min-h-0">
      <BigScreenStackedBehaviorChart />
    </div>
    <div className="flex min-h-0 flex-col gap-2 rounded-2xl border border-cyan-300/12 bg-cyan-950/24 p-3">
      <div className="text-xs font-black tracking-[0.12em] text-cyan-200">记录构成</div>
      {[
        { label: '正向', value: positive + '%', width: parseFloat(positive), tone: 'bg-emerald-300', text: 'text-emerald-200' },
        { label: '负向', value: negative + '%', width: parseFloat(negative), tone: 'bg-rose-400', text: 'text-rose-200' },
      ].map((item) => (
        <div key={item.label} className="rounded-xl border border-cyan-300/10 bg-cyan-950/35 px-3 py-2">
          <div className="flex items-center justify-between text-xs font-bold text-cyan-50/72">
            <span>{item.label}</span>
            <span className={`font-mono text-sm font-black ${item.text}`}>{item.value}</span>
          </div>
          <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-cyan-950/80">
            <div className={`h-full rounded-full ${item.tone}`} style={{ width: `${item.width}%` }} />
          </div>
        </div>
      ))}
      <div className="mt-auto grid gap-2">
        <div className="rounded-xl border border-cyan-300/10 bg-cyan-950/35 px-3 py-2">
          <div className="text-[11px] font-bold text-cyan-100/55">日均记录</div>
          <div className="font-mono text-lg font-black text-white">{dailyAvg}</div>
        </div>
        <div className="rounded-xl border border-cyan-300/10 bg-cyan-950/35 px-3 py-2">
          <div className="text-[11px] font-bold text-cyan-100/55">学情预警</div>
          <div className="font-mono text-lg font-black text-amber-200">{warnings} 项</div>
        </div>
      </div>
    </div>
  </div>
  );
};

const BigScreenIndicatorInsight: React.FC = () => {
  const total = indicatorDistribution.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(...topIndicators.map((item) => item.value));
  return (
    <div className="grid h-full grid-cols-[178px_1fr] gap-3">
      <div className="flex min-h-0 flex-col rounded-2xl border border-cyan-300/12 bg-cyan-950/30 p-3">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <div className="text-xs font-black tracking-[0.12em] text-cyan-200">五育记录分布</div>
            <div className="mt-1 font-mono text-[23px] font-black text-white">全集团</div>
          </div>
          <div className="text-[11px] font-bold text-cyan-100/60">占比</div>
        </div>
        <div className="space-y-2">
          {indicatorDistribution.map((item) => {
            const percent = Math.round((item.value / total) * 100);
            return (
              <div key={item.label}>
                <div className="mb-1 flex items-center justify-between gap-2 text-xs">
                  <span className="flex items-center gap-2 font-bold text-cyan-50/80"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: item.color }} />{item.label}</span>
                  <span className="font-mono font-black text-cyan-200/80">{percent}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-cyan-950/75">
                  <div className="h-full rounded-full" style={{ width: `${percent}%`, backgroundColor: item.color }} />
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-auto rounded-xl border border-amber-300/15 bg-amber-300/10 px-3 py-2">
          <div className="text-[11px] font-bold text-amber-100/70">低频待优化指标</div>
          <div className="mt-0.5 font-mono text-xl font-black text-amber-100">4 个</div>
        </div>
      </div>
      <div className="flex min-h-0 flex-col rounded-2xl border border-cyan-300/12 bg-cyan-950/22 p-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black tracking-[0.12em] text-cyan-200">高频指标 TOP4</div>
          <div className="text-[11px] font-bold text-cyan-100/55">记录数 · 覆盖校区</div>
        </div>
        <div className="mt-3 space-y-2">
          {topIndicators.slice(0, 4).map((item, index) => (
            <div key={item.name}>
              <div className="mb-1 grid grid-cols-[28px_1fr_94px] items-center gap-2">
                <span className="font-mono text-sm font-black text-cyan-300">{String(index + 1).padStart(2, '0')}</span>
                <span className="truncate text-[13px] font-bold text-cyan-50/88">{item.name}</span>
                <span className="text-right font-mono text-xs font-black text-cyan-200/80">{formatNumber(item.value)} · {item.campuses}校区</span>
              </div>
              <div className="ml-9 h-2 overflow-hidden rounded-full bg-cyan-950/70">
                <div className={`h-full rounded-full ${item.tone} shadow-[0_0_18px_rgba(34,211,238,0.35)]`} style={{ width: `${Math.max((item.value / max) * 100, 8)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto grid grid-cols-4 gap-2 pt-3">
          {[
            { label: '覆盖校区', value: '6 个' },
            { label: '五育触达', value: '6 个' },
            { label: '校区指标', value: '40 个' },
            { label: '零记录指标', value: '1 个' },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border border-cyan-300/10 bg-cyan-950/35 px-2 py-2 text-center">
              <div className="font-mono text-[16px] font-black text-white">{item.value}</div>
              <div className="mt-0.5 text-[10px] font-bold text-cyan-100/55">{item.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const BigScreenCampuses: React.FC<{ onCampusClick?: (name: string) => void }> = ({ onCampusClick }) => (
  <div className="grid grid-cols-3 gap-2">
    {campusRows.map((campus) => (
      <div
        key={campus.key}
        className={`group relative border border-cyan-300/12 bg-cyan-950/35 px-3 py-2 transition-all ${onCampusClick ? 'cursor-pointer hover:bg-cyan-800/50 hover:border-cyan-300/40 hover:shadow-[0_0_20px_rgba(34,211,238,0.15)]' : ''}`}
        onClick={() => onCampusClick?.(campus.name)}
      >
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-black text-cyan-50">{campus.name}</span>
          <span className={`h-2 w-2 rounded-full ${campus.status === '重点关注' ? 'bg-rose-400' : campus.status === '关注' ? 'bg-amber-300' : 'bg-emerald-300'}`} />
        </div>
        <div className="mt-1 font-mono text-[11px] font-bold text-cyan-100/55">记录 {formatNumber(campus.behaviorCount)}</div>
        {onCampusClick && (
          <div className="absolute bottom-1 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-[9px] font-bold text-cyan-300/70">点击下钻</span>
            <span className="text-[10px] text-cyan-300/70">→</span>
          </div>
        )}
      </div>
    ))}
  </div>
);


// 6 校区五育得分数据
const campusFiveData = [
  { campus: '宁康园校区（本部）', de: 90, zhi: 92, ti: 84, mei: 82, lao: 88, total: 88.6 },
  { campus: '湖畔校区', de: 82, zhi: 86, ti: 76, mei: 74, lao: 80, total: 79.6 },
  { campus: '朴真校区', de: 78, zhi: 84, ti: 68, mei: 72, lao: 76, total: 75.6 },
  { campus: '军山小学校区', de: 72, zhi: 80, ti: 70, mei: 66, lao: 72, total: 72.0 },
  { campus: '育才二小校区', de: 86, zhi: 90, ti: 82, mei: 78, lao: 84, total: 84.0 },
  { campus: '子林校区', de: 66, zhi: 78, ti: 64, mei: 60, lao: 68, total: 67.2 },
];

// 校区行为数据
const campusBehaviorData = [
  { campus: '宁康园校区（本部）', positive: 14200, negative: 1180, studentCount: 2860 },
  { campus: '湖畔校区', positive: 8600, negative: 720, studentCount: 1680 },
  { campus: '朴真校区', positive: 6800, negative: 640, studentCount: 1520 },
  { campus: '军山小学校区', positive: 5200, negative: 560, studentCount: 1280 },
  { campus: '育才二小校区', positive: 9400, negative: 780, studentCount: 2040 },
  { campus: '子林校区', positive: 4000, negative: 560, studentCount: 1260 },
];

// 校区指标数据
const campusIndicatorData = [
  { campus: '宁康园校区（本部）', top: '德育 / 遵纪守法 / 友爱同学', value: 3200 },
  { campus: '宁康园校区（本部）', top: '智育 / 学科素养 / 课堂思考', value: 2800 },
  { campus: '湖畔校区', top: '德育 / 遵纪守法 / 友爱同学', value: 1800 },
  { campus: '育才二小校区', top: '劳育 / 校园劳动 / 公共服务', value: 2200 },
  { campus: '朴真校区', top: '智育 / 学科素养 / 课堂思考', value: 1600 },
  { campus: '子林校区', top: '体育 / 运动习惯 / 课程参与', value: 980 },
];

// 校区预警数据
const campusWarningData = [
  { campus: '子林校区', level: '高', count: 4, items: ['德育负向行为偏高', '跳绳达标率偏低', '教师录入不及时', '评价维度单一'] },
  { campus: '军山小学校区', level: '中', count: 3, items: ['立定跳远达标率下降', '劳育覆盖偏低', '数据同步异常'] },
  { campus: '朴真校区', level: '中', count: 3, items: ['课堂纪律问题', '教师参与度偏低', '期末集中录入'] },
  { campus: '湖畔校区', level: '中', count: 2, items: ['跳绳达标率偏低', '美育记录不足'] },
  { campus: '育才二小校区', level: '低', count: 1, items: ['体育数据波动'] },
  { campus: '宁康园校区（本部）', level: '低', count: 0, items: [] },
];

// 大屏校区选择器组件
const CampusSelector: React.FC<{ value: string; onChange: (v: string) => void }> = ({ value, onChange }) => (
  <div className="flex items-center gap-2">
    <span className="text-[11px] font-bold tracking-[0.12em] text-cyan-200/60">数据范围</span>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none border border-cyan-300/30 bg-cyan-950/60 px-4 py-1.5 pr-8 text-[13px] font-black text-cyan-50 outline-none backdrop-blur-sm"
        style={{ borderRadius: 0 }}
      >
        <option value="group">集团汇总</option>
        {campusFiveData.map((c) => (
          <option key={c.campus} value={c.campus}>{c.campus}</option>
        ))}
      </select>
      <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-cyan-300/60">▼</div>
    </div>
  </div>
);

// 大屏校区五育对比柱状图
// 校区颜色映射（6校各一色）
const campusColors = ['#22d3ee', '#2dd4bf', '#f97316', '#38bdf8', '#8b5cf6', '#22c55e'];
const campusShortName = (name: string) => name.replace('校区', '').replace('（本部）', '').replace('小学校区', '');

const CampusComparisonChart: React.FC<{ campus?: string }> = ({ campus }) => {
  const showAll = !campus;
  const dimKeys: Array<{ key: 'de' | 'zhi' | 'ti' | 'mei' | 'lao'; full: string; label: string }> = [
    { key: 'de', full: '德育', label: '德' },
    { key: 'zhi', full: '智育', label: '智' },
    { key: 'ti', full: '体育', label: '体' },
    { key: 'mei', full: '美育', label: '美' },
    { key: 'lao', full: '劳育', label: '劳' },
  ];

  if (!showAll) {
    // 单校区模式
    const item = campusFiveData.find((c) => c.campus === campus);
    if (!item) return null;
    return (
      <div className="grid h-full grid-cols-[200px_1fr] gap-3">
        <div className="flex flex-col justify-between border border-cyan-300/12 bg-cyan-950/28 p-4">
          <div>
            <div className="text-[13px] font-black text-cyan-50">{item.campus}</div>
            <div className="mt-2 font-mono text-[42px] font-black leading-none text-white">{item.total}</div>
            <div className="mt-1 text-xs font-bold text-cyan-100/60">五育均衡指数</div>
          </div>
          <div className="mt-3 space-y-2">
            {dimKeys.map((d) => (
              <div key={d.key} className="flex items-center gap-2">
                <span className="w-6 text-center text-[11px] font-black text-cyan-300">{d.label}</span>
                <div className="flex-1 h-2 overflow-hidden rounded-full bg-cyan-950/70">
                  <div className="h-full rounded-full" style={{ width: `${item[d.key]}%`, backgroundColor: '#67e8f9' }} />
                </div>
                <span className="w-8 text-right font-mono text-[12px] font-black text-white">{item[d.key]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-5 gap-2">
          {dimKeys.map((d) => (
            <div key={d.key} className="flex flex-col items-center justify-end border border-cyan-300/12 bg-cyan-950/28 p-3">
              <div className="mb-2 text-center">
                <div className="font-mono text-[28px] font-black text-white">{item[d.key]}</div>
                <div className="mt-1 text-[11px] font-bold text-cyan-100/60">{d.full}</div>
              </div>
              <div className="w-full h-[120px] flex items-end justify-center">
                <div className="w-10 rounded-t-lg" style={{ height: `${(item[d.key] / 100) * 100}%`, backgroundColor: '#67e8f9', boxShadow: '0 0 16px rgba(103,232,249,0.4)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 集团汇总模式：按维度分行，6校并排对比
  // 找出每个维度的最高分和最低分，用于高亮
  const dimStats = dimKeys.map((d) => {
    const scores = campusFiveData.map((c) => c[d.key]);
    return { ...d, max: Math.max(...scores), min: Math.min(...scores) };
  });

  return (
    <div className="h-full flex flex-col">
      {/* 图例 */}
      <div className="flex items-center gap-3 mb-3 flex-wrap">
        {campusFiveData.map((c, i) => (
          <div key={c.campus} className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: campusColors[i] }} />
            <span className="text-[11px] font-bold text-cyan-100/70">{campusShortName(c.campus)}</span>
          </div>
        ))}
      </div>
      {/* 按维度分行 */}
      <div className="flex-1 space-y-3">
        {dimStats.map((d) => (
          <div key={d.key}>
            <div className="mb-1.5 flex items-center gap-2">
              <span className="w-10 text-center text-[13px] font-black text-cyan-300">{d.full}</span>
              <div className="flex-1 h-5 flex items-center">
                {campusFiveData.map((c, i) => {
                  const val = c[d.key];
                  const isMax = val === d.max;
                  const isMin = val === d.min;
                  return (
                    <div key={c.campus} className="flex items-center gap-1 mr-3">
                      <div className="relative h-4 rounded-sm overflow-hidden" style={{ width: `${val * 1.1}px` }}>
                        <div className="absolute inset-0" style={{ backgroundColor: campusColors[i], opacity: isMin ? 0.5 : 1 }} />
                        {isMax && <div className="absolute inset-0 bg-white/15" />}
                      </div>
                      <span className={`font-mono text-[11px] font-black ${isMax ? 'text-emerald-300' : isMin ? 'text-rose-300' : 'text-cyan-100/60'}`}>{val}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// 大屏校区详情下钻面板
const CampusDrillDown: React.FC<{ campus: string; onClose: () => void }> = ({ campus, onClose }) => {
  const data = campusFiveData.find((c) => c.campus === campus);
  const behavior = campusBehaviorData.find((c) => c.campus === campus);
  const warnings = campusWarningData.find((c) => c.campus === campus);
  if (!data || !behavior) return null;

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-[1680px] h-[1000px] border border-cyan-300/30 bg-[#061a35]/95 p-5 overflow-y-auto" style={{ fontFamily: cnFont }}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-[20px] font-black text-white">{campus}</div>
            <div className="font-mono text-[32px] font-black text-cyan-300">{data.total}</div>
            <div className="text-xs font-bold text-cyan-100/50">五育均衡指数</div>
          </div>
          <button onClick={onClose} className="flex h-8 w-8 items-center justify-center border border-cyan-300/30 bg-cyan-950/60 text-cyan-300 hover:bg-cyan-800/60">
            ✕
          </button>
        </div>

        <div className="grid grid-cols-[1fr_1fr] gap-4">
          {/* 五育维度详情 */}
          <div className="border border-cyan-300/16 bg-cyan-950/30 p-4">
            <div className="text-sm font-black text-cyan-50 mb-3">五育维度得分</div>
            <div className="space-y-3">
              {[
                { label: '德育', score: data.de, color: '#22d3ee', full: '品德发展 / 遵纪守法 / 友爱同学' },
                { label: '智育', score: data.zhi, color: '#2dd4bf', full: '学习品质 / 创新思维 / 科创实践' },
                { label: '体育', score: data.ti, color: '#38bdf8', full: '身心健康 / 运动习惯 / 课程参与' },
                { label: '美育', score: data.mei, color: '#14b8a6', full: '审美素养 / 艺术实践 / 作品展示' },
                { label: '劳育', score: data.lao, color: '#67e8f9', full: '劳动素养 / 校园劳动 / 公共服务' },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-3">
                  <span className="w-8 text-center text-sm font-black" style={{ color: item.color }}>{item.label}</span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[11px] font-bold text-cyan-100/50">{item.full}</span>
                      <span className="font-mono text-sm font-black text-white">{item.score}</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-cyan-950/70">
                      <div className="h-full rounded-full" style={{ width: `${item.score}%`, backgroundColor: item.color }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 行为数据 */}
          <div className="border border-cyan-300/16 bg-cyan-950/30 p-4">
            <div className="text-sm font-black text-cyan-50 mb-3">行为记录概览</div>
            <div className="grid grid-cols-3 gap-3 mb-4">
              <div className="text-center p-3 border border-cyan-300/12 bg-cyan-950/40">
                <div className="font-mono text-xl font-black text-white">{(behavior.positive + behavior.negative).toLocaleString()}</div>
                <div className="text-[11px] font-bold text-cyan-100/50">总记录</div>
              </div>
              <div className="text-center p-3 border border-cyan-300/12 bg-cyan-950/40">
                <div className="font-mono text-xl font-black text-emerald-300">{(behavior.positive / (behavior.positive + behavior.negative) * 100).toFixed(1)}%</div>
                <div className="text-[11px] font-bold text-cyan-100/50">正向占比</div>
              </div>
              <div className="text-center p-3 border border-cyan-300/12 bg-cyan-950/40">
                <div className="font-mono text-xl font-black text-white">{behavior.studentCount.toLocaleString()}</div>
                <div className="text-[11px] font-bold text-cyan-100/50">覆盖学生</div>
              </div>
            </div>
            {warnings && warnings.items.length > 0 && (
              <div>
                <div className="text-[11px] font-black text-cyan-200 mb-2">预警事项（{warnings.count} 项）</div>
                <div className="space-y-1.5">
                  {warnings.items.map((item) => (
                    <div key={item} className="flex items-center gap-2 px-3 py-1.5 border border-cyan-300/10 bg-cyan-950/30">
                      <span className={`h-1.5 w-1.5 rounded-full ${warnings.level === '高' ? 'bg-rose-400' : warnings.level === '中' ? 'bg-amber-300' : 'bg-cyan-400'}`} />
                      <span className="text-[11px] font-bold text-cyan-100/70">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const BigScreenOverviewContent: React.FC = () => {
  const [selectedCampus, setSelectedCampus] = useState('group');
  const [drillCampus, setDrillCampus] = useState<string | null>(null);
  const isGroup = selectedCampus === 'group';

  // 根据选择获取当前校区数据
  const currentData = isGroup
    ? { total: '79.4', positive: '87.2%', record: '110,000', warning: '13', students: '8,640/11,200', teachers: '260/320' }
    : (() => {
        const c = campusFiveData.find((d) => d.campus === selectedCampus)!;
        const b = campusBehaviorData.find((d) => d.campus === selectedCampus)!;
        const w = campusWarningData.find((d) => d.campus === selectedCampus)!;
        return {
          total: String(c.total),
          positive: ((b.positive / (b.positive + b.negative)) * 100).toFixed(1) + '%',
          record: (b.positive + b.negative).toLocaleString(),
          warning: String(w.count),
          students: b.studentCount.toLocaleString() + '/' + b.studentCount.toLocaleString(),
          teachers: Math.round(b.studentCount * 0.03).toString() + '/' + Math.round(b.studentCount * 0.04).toString(),
        };
      })();

  return (
  <BigScreenScaleFrame>
    <div className="relative h-[1080px] w-[1920px] overflow-hidden bg-[#020817] text-white" style={{ fontFamily: cnFont }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_4%,rgba(56,189,248,0.34),transparent_28%),radial-gradient(circle_at_12%_16%,rgba(20,184,166,0.16),transparent_26%),radial-gradient(circle_at_86%_18%,rgba(59,130,246,0.16),transparent_28%),linear-gradient(180deg,#061735_0%,#031028_48%,#010511_100%)]" />
      <div className="absolute inset-0 opacity-[0.16]" style={{ backgroundImage: 'linear-gradient(rgba(125,211,252,0.22) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,0.22) 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <div className="absolute inset-x-0 top-0 h-[130px] bg-[linear-gradient(180deg,rgba(56,189,248,0.18),transparent)]" />
      <div className="relative z-10 flex h-full flex-col px-4 pb-4 pt-3">
        <header className="relative mb-3 h-[74px] shrink-0">
          <div className="absolute left-0 top-3 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center border border-cyan-200/30 bg-cyan-400/12 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.26)]">
              <PlatformBrandMark size={22} />
            </div>
            <div className="text-xs font-bold tracking-[0.18em] text-cyan-100/66">{isGroup ? '神龙小学集团 · 6 个校区' : selectedCampus}</div>
          </div>
          <div className="absolute inset-x-[22%] top-0 flex flex-col items-center">
            <div className="relative flex h-[60px] w-full items-center justify-center">
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-200/70 to-transparent" />
              <div className="absolute bottom-0 h-px w-[68%] bg-gradient-to-r from-transparent via-cyan-300/65 to-transparent" />
              <div className="absolute bottom-0 left-[16%] h-5 w-px rotate-[28deg] bg-cyan-300/40" />
              <div className="absolute bottom-0 right-[16%] h-5 w-px -rotate-[28deg] bg-cyan-300/40" />
              <div className="text-center text-[27px] font-black tracking-[0.18em] text-white drop-shadow-[0_0_16px_rgba(125,211,252,0.55)]">神龙小学集团五育并举综合素质评价驾驶舱</div>
            </div>
            <div className="mt-1 flex items-center gap-2 text-[11px] font-bold tracking-[0.22em] text-cyan-200/70">
              <span className="h-px w-10 bg-cyan-300/40" />
              {isGroup ? '多校区学生日常行为评价运行监测' : selectedCampus + ' 学生日常行为评价运行监测'}
              <span className="h-px w-10 bg-cyan-300/40" />
            </div>
          </div>
          <div className="absolute right-0 top-3 flex items-start gap-4">
            <CampusSelector value={selectedCampus} onChange={setSelectedCampus} />
            <div className="text-right">
              <div className="font-mono text-[19px] font-black text-cyan-100">2026-06-02 14:30</div>
              <div className="mt-1 text-[11px] font-bold tracking-[0.16em] text-cyan-200/60">每 5 分钟刷新</div>
            </div>
          </div>
        </header>

        <div className="mb-3 grid shrink-0 grid-cols-6 gap-3">
          <BigScreenMetric label="五育触达校区 / 接入校区" value={isGroup ? '6/6' : '5/5'} sub="五类维度均有记录" tone="bg-cyan-300" />
          <BigScreenMetric label="评价覆盖学生" value={currentData.students} sub="本月有评价记录" tone="bg-emerald-300" />
          <BigScreenMetric label="参与评价老师" value={currentData.teachers} sub="本月参与日常评价" tone="bg-blue-300" />
          <BigScreenMetric label="本月行为记录" value={currentData.record} unit="条" sub="日常评价持续沉淀" tone="bg-violet-300" />
          <BigScreenMetric label="正向行为占比" value={currentData.positive} sub="较上月提升" tone="bg-teal-300" />
          <BigScreenMetric label="学情预警" value={currentData.warning} unit="项" sub={isGroup ? '高优先级 4 项' : '需关注'} tone="bg-amber-300" />
        </div>

        <main className="grid min-h-0 flex-1 grid-cols-[minmax(0,27fr)_minmax(0,46fr)_minmax(0,27fr)] grid-rows-[48%_52%] gap-3">
          <BigScreenPanel title="行为记录运行">
            <BigScreenBehaviorOperation campus={isGroup ? undefined : selectedCampus} />
          </BigScreenPanel>

          <BigScreenPanel title="态势总览">
            <BigScreenHeroVisual />
          </BigScreenPanel>

          <BigScreenPanel title="学情预警">
            <BigScreenWarningList campus={isGroup ? undefined : selectedCampus} />
          </BigScreenPanel>

          <BigScreenPanel title="指标运行洞察">
            <BigScreenIndicatorInsight />
          </BigScreenPanel>

          <BigScreenPanel title={isGroup ? '各校五育对比' : '五育发展详情'}>
            <CampusComparisonChart campus={isGroup ? undefined : selectedCampus} />
          </BigScreenPanel>

          <BigScreenPanel title="校区运行概览">
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-2">
                <div className="border border-cyan-300/12 bg-cyan-950/35 p-3 text-center">
                  <div className="font-mono text-[22px] font-black text-white">{isGroup ? '6/6' : '5/5'}</div>
                  <div className="text-[11px] font-bold text-cyan-100/60">五育触达</div>
                </div>
                <div className="border border-cyan-300/12 bg-cyan-950/35 p-3 text-center">
                  <div className="font-mono text-[22px] font-black text-white">{currentData.warning}</div>
                  <div className="text-[11px] font-bold text-cyan-100/60">学情预警</div>
                </div>
                <div className="border border-cyan-300/12 bg-cyan-950/35 p-3 text-center">
                  <div className="font-mono text-[22px] font-black text-white">{isGroup ? '2' : '0'}</div>
                  <div className="text-[11px] font-bold text-cyan-100/60">重点关注</div>
                </div>
              </div>
              <BigScreenCampuses onCampusClick={(name) => setDrillCampus(name)} />
            </div>
          </BigScreenPanel>
        </main>
      </div>

      {drillCampus && <CampusDrillDown campus={drillCampus} onClose={() => setDrillCampus(null)} />}
    </div>
  </BigScreenScaleFrame>
  );
};

/* ==================== PC 后台各模块内容 ==================== */

const AdminOverviewContent: React.FC = () => {
  const districtColumns = useMemo(() => [
    { title: '区域', dataIndex: 'name', width: 160, render: (name: string, row: CampusRow) => <div><div className="font-black text-slate-800">{name}</div><div className="text-xs text-slate-400">{row.region} · {row.teacherCount} 名教师</div></div> },
    { title: '本月记录', dataIndex: 'behaviorCount', width: 110, render: (value: number) => <span className="font-black text-slate-800">{formatNumber(value)}</span> },
    { title: '学生覆盖', dataIndex: 'studentCoverage', width: 130, render: (value: number) => <Progress percent={value} size="small" color="#165dff" /> },
    { title: '教师参与', dataIndex: 'teacherParticipation', width: 130, render: (value: number) => <Progress percent={value} size="small" color="#14b8a6" /> },
    { title: '五育触达', dataIndex: 'dimensionsTouched', width: 90, render: (value: number) => <span className="font-black text-slate-700">{value}/5</span> },
    { title: '指标广度', dataIndex: 'indicatorBreadth', width: 90, render: (value: number) => <span className="font-black text-slate-700">{value}%</span> },
    { title: '预警', dataIndex: 'alertCount', width: 80, render: (value: number) => <span className={value > 0 ? 'font-black text-orange-600' : 'font-black text-emerald-600'}>{value} 条</span> },
    { title: '状态', dataIndex: 'status', width: 90, render: statusTag },
  ], []);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-6 gap-3">
        <StatCard title="五育触达校区 / 接入校区" value="6/6" sub="五类维度均有记录" icon={Radar} tone="bg-teal-50 text-teal-600" />
        <StatCard title="评价覆盖学生 / 在读学生" value="8,640/11,200" sub="本月有评价记录" icon={UserRoundCheck} tone="bg-emerald-50 text-emerald-600" />
        <StatCard title="参与评价老师 / 在校老师" value="260/320" sub="本月参与日常评价" icon={Building2} tone="bg-blue-50 text-blue-600" />
        <StatCard title="本月行为记录" value="110,000" sub="+16%" icon={Activity} tone="bg-cyan-50 text-cyan-600" />
        <StatCard title="正向行为占比" value="87.2%" sub="较上月 +2.8%" icon={Layers3} tone="bg-violet-50 text-violet-600" />
        <StatCard title="学情预警统计" value="13" sub="高优先级 4" icon={AlertTriangle} tone="bg-orange-50 text-orange-600" trend="down" />
      </div>

      <div className="grid items-start grid-cols-[1fr_1fr] gap-4">
        <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">五育态势概览</span>}>
          <div className="grid grid-cols-[270px_1fr] gap-5">
            <RadarSketch />
            <div className="space-y-4">
              <div className="rounded-2xl bg-slate-50 p-4">
                <div className="mb-2 font-black text-slate-800">五育均衡指数趋势</div>
                <MiniLineChart values={trendPoints} />
              </div>
              <DimensionBars />
            </div>
          </div>
        </Card>
        <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">德育与身心健康预警分布</span>}>
          <div className="grid grid-cols-[320px_1fr] items-center gap-4">
            <DonutChart data={warningDistribution} center="13" subtitle="学情预警" />
            <div className="space-y-3">
              {warningItems.slice(0, 3).map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                  <div className="mb-2 flex items-center justify-between"><Tag color={item.tone === 'red' ? 'red' : 'orangered'}>{item.level}</Tag><span className="text-xs font-black text-slate-400">重点关注</span></div>
                  <div className="text-sm font-black text-slate-800">{item.title}</div>
                  <div className="mt-1 text-xs font-bold leading-5 text-slate-500">{item.meta}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>

      <div className="grid items-start grid-cols-[0.95fr_1.05fr] gap-4">
        <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">指标运行洞察</span>}>
          <HorizontalBars data={topIndicators} />
        </Card>
        <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">校区五育热力图</span>}>
          <CampusHeatmap />
        </Card>
      </div>

      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">校区日常评价运行状态</span>} extra={<Button type="text">查看全部</Button>}>
        <Table columns={districtColumns} data={campusRows} pagination={false} rowKey="key" />
      </Card>
    </div>
  );
};

const IndicatorsContent: React.FC = () => {
  const indicatorColumns = useMemo(() => [
    { title: '五育维度', dataIndex: 'dimension', width: 100, render: (value: string) => <Tag color="blue">{value}</Tag> },
    { title: '一级指标', dataIndex: 'level1', width: 150, render: (value: string) => <span className="font-black text-slate-800">{value}</span> },
    { title: '二级指标', dataIndex: 'level2', width: 150 },
    { title: '三级指标', dataIndex: 'level3', width: 170 },
    { title: '使用校区', dataIndex: 'districtUsage', width: 110, render: (value: number) => <span className="font-black text-slate-700">{value}/6 个</span> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 120 },
    { title: '状态', dataIndex: 'status', width: 100, render: (value: IndicatorRow['status']) => value === '启用' ? <Tag color="green">启用</Tag> : <Tag color="orangered">待完善</Tag> },
    { title: '操作', dataIndex: 'action', width: 110, render: () => <Button type="text">编辑</Button> },
  ], []);

  const districtIndicatorColumns = useMemo(() => [
    { title: '区域', dataIndex: 'district', width: 160, render: (value: string) => <span className="font-black text-slate-800">{value}</span> },
    { title: '指标体系版本', dataIndex: 'version', width: 220 },
    { title: '集团指标覆盖', dataIndex: 'groupCoverage', width: 150, render: (value: number) => <Progress percent={value} size="small" color={value >= 98 ? '#00b42a' : value >= 95 ? '#165dff' : '#ff7d00'} /> },
    { title: '区域指标', dataIndex: 'customItems', width: 110, render: (value: number) => <span className="font-black text-slate-700">{value} 条</span> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: CampusIndicatorRow['status']) => {
        if (value === '已对齐') return <Tag color="green">已对齐</Tag>;
        if (value === '待同步') return <Tag color="arcoblue">待同步</Tag>;
        return <Tag color="orangered">需完善</Tag>;
      },
    },
    { title: '操作', dataIndex: 'action', width: 120, render: () => <Button type="text">查看体系</Button> },
  ], []);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-5 gap-4">
        {dimensions.map((item) => (
          <div key={item.key} className="rounded-2xl border border-slate-200 bg-white p-5">
            <div className={`mb-4 inline-flex h-10 w-10 items-center justify-center rounded-2xl border text-lg font-black ${item.bg}`}>{item.label}</div>
            <div className="text-lg font-black text-slate-900">{item.full}</div>
            <div className="mt-2 text-xs font-bold leading-5 text-slate-500">
              {item.key === 'de' && '思想品德、文明礼仪、遵纪守法、集体荣誉'}
              {item.key === 'zhi' && '学业发展、学科素养、创新思维、竞赛成果'}
              {item.key === 'ti' && '体质健康、运动习惯、赛事参与、课程参与'}
              {item.key === 'mei' && '艺术素养、审美能力、文艺活动、作品沉淀'}
              {item.key === 'lao' && '校园劳动、社会实践、生活技能、公共服务'}
            </div>
            <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-500">已配置 {item.key === 'de' ? 48 : item.key === 'zhi' ? 42 : item.key === 'ti' ? 36 : item.key === 'mei' ? 28 : 34} 条指标</div>
          </div>
        ))}
      </div>

      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">集团指标体系设置</span>} extra={<Button type="primary">新增集团指标</Button>}>
        <div className="pc-filter-bar mb-4 flex items-center gap-3">
          <Input allowClear prefix={<Search size={15} />} placeholder="搜索一级、二级、三级指标" style={{ width: 260 }} />
          <Select placeholder="五育维度" allowClear style={{ width: 160 }}>
            {dimensions.map((item) => <Select.Option key={item.key} value={item.full}>{item.full}</Select.Option>)}
          </Select>
          <Select placeholder="状态" allowClear style={{ width: 140 }}>
            <Select.Option value="enabled">启用</Select.Option>
            <Select.Option value="draft">待完善</Select.Option>
          </Select>
          <Button type="primary">查询</Button>
          <Button>重置</Button>
        </div>
        <Table columns={indicatorColumns} data={groupIndicatorRows} pagination={false} rowKey="key" />
      </Card>

      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">校区指标体系查看</span>} extra={<Button>导出对齐情况</Button>}>
        <div className="pc-filter-bar mb-4 flex items-center gap-3">
          <Input allowClear prefix={<Search size={15} />} placeholder="搜索校区名称" style={{ width: 220 }} />
          <Select placeholder="对齐状态" allowClear style={{ width: 150 }}>
            <Select.Option value="aligned">已对齐</Select.Option>
            <Select.Option value="sync">待同步</Select.Option>
            <Select.Option value="improve">需完善</Select.Option>
          </Select>
          <Button type="primary">查询</Button>
          <Button>重置</Button>
        </div>
        <Table columns={districtIndicatorColumns} data={campusIndicatorRows} pagination={false} rowKey="key" />
      </Card>
    </div>
  );
};

const SupervisionContent: React.FC = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4">
      <StatCard title="异常行为预警" value="5" sub="德育/纪律集中" icon={AlertTriangle} tone="bg-rose-50 text-rose-600" trend="down" />
      <StatCard title="五育短板预警" value="4" sub="跳绳/跳远偏低" icon={Activity} tone="bg-orange-50 text-orange-600" trend="down" />
      <StatCard title="运行指标预警" value="3" sub="数据同步/录入" icon={Radar} tone="bg-violet-50 text-violet-600" trend="down" />
      <StatCard title="综合预警统计" value="13" sub="高优先级 4" icon={Layers3} tone="bg-blue-50 text-blue-600" />
    </div>

    <div className="grid grid-cols-[0.85fr_1.15fr] gap-5">
      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">预警类型分布</span>}>
        <DonutChart data={warningDistribution} center="13" subtitle="学情预警" />
        <div className="mt-5 rounded-2xl bg-slate-50 p-4">
          <div className="mb-2 text-sm font-black text-slate-800">重点监测维度</div>
          <div className="space-y-2 text-xs font-bold leading-5 text-slate-500">
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-rose-500" />异常行为：同伴冲突、课堂纪律、文明礼仪</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-orange-500" />五育短板：跳绳达标、立定跳远、坐位体前屈</div>
            <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full bg-violet-500" />运行指标：教师录入及时率、评价维度覆盖</div>
          </div>
        </div>
      </Card>

      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">重点关注事项</span>}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { type: '异常行为', campus: '子林校区', title: '三年级同伴冲突持续偏高', desc: '近 7 日"同伴冲突"记录较上周上升 18%，主要集中在课间活动时段。', level: '高' },
            { type: '五育短板', campus: '湖畔校区', title: '二年级跳绳达标率偏低', desc: '跳绳达标率 58%，低于集团标准 80%，建议加强课间跳绳训练。', level: '高' },
            { type: '五育短板', campus: '军山小学校区', title: '四年级立定跳远达标率下降', desc: '立定跳远达标率 64%，较上月下降 12%，需关注体育课质量。', level: '中' },
            { type: '运行指标', campus: '朴真校区', title: '教师期末集中录入严重', desc: '42% 行为记录在期末最后两周录入，过程性评价落实不足。', level: '中' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between"><Tag color={item.level === '高' ? 'red' : 'orangered'}>{item.level}</Tag><span className="text-xs font-black text-slate-400">{item.type}</span></div>
              <div className="text-sm font-black text-slate-900">{item.campus}｜{item.title}</div>
              <div className="mt-2 text-xs font-bold leading-5 text-slate-500">{item.desc}</div>
              <Button className="!mt-3" size="small" type="secondary">查看依据</Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  </div>
);

const AiContent: React.FC = () => (
  <div className="space-y-5">
    <Alert type="info" showIcon content="AI 督导中心基于 AI 能力深挖数据潜力，洞察各校区育人发展态势，为教育决策提供智能辅助。分析结论仅供参考，不直接作为行政依据。" />

    <div className="grid grid-cols-3 gap-4">
      <StatCard title="育人态势评分" value="79.4" sub="较上月 +2.4" icon={Gauge} tone="bg-teal-50 text-teal-600" />
      <StatCard title="AI 洞察报告" value="12" sub="本学期已生成" icon={BrainCircuit} tone="bg-blue-50 text-blue-600" />
      <StatCard title="待确认建议" value="4" sub="需集团确认" icon={Sparkles} tone="bg-orange-50 text-orange-600" />
    </div>

    <div className="grid grid-cols-[1fr_1fr] gap-5">
      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">育人发展态势洞察</span>}>
        <div className="space-y-4">
          {[
            { title: '子林校区德育发展承压', desc: '近 30 日德育维度得分持续下降，同伴冲突与课堂纪律问题集中。三年级为高发群体。', suggestion: '建议加强班主任德育案例研讨，安排心理教师驻点辅导。', icon: TrendingDown, iconColor: 'text-rose-600' },
            { title: '湖畔校区体质健康需关注', desc: '二年级跳绳达标率 58%，远低于集团 80% 标准。体质健康测评数据波动较大。', suggestion: '建议核查体育课质量，增加课间体能训练频次。', icon: TrendingDown, iconColor: 'text-orange-600' },
            { title: '宁康园校区（本部）示范效应显著', desc: '五育均衡指数 88.6，各维度均高于集团均值，教师评价个性化程度最高。', suggestion: '建议组织跨校区教研交流，推广本部评价经验。', icon: TrendingUp, iconColor: 'text-emerald-600' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="flex items-start gap-3">
                <div className={`mt-0.5 shrink-0 ${item.iconColor}`}><item.icon size={18} /></div>
                <div className="min-w-0">
                  <div className="font-black text-slate-900">{item.title}</div>
                  <div className="mt-1.5 text-xs font-bold leading-5 text-slate-500">{item.desc}</div>
                  <div className="mt-2 rounded-xl bg-blue-50 px-3 py-2 text-xs font-bold leading-5 text-blue-700">{item.suggestion}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">AI 分析模型说明</span>}>
        <div className="space-y-4 text-sm font-bold leading-6 text-slate-500">
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 font-black text-slate-800"><Radar size={16} /> 分析维度</div>
            德育、智育、体育、美育、劳育 5 个一级维度，重点关注德育行为与体质健康达标。
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 font-black text-slate-800"><Database size={16} /> 数据来源</div>
            中台客观数据 + 行为识别积分流水 + 校区过程性评价 + 体质健康测评 + 教师评价质量数据。
          </div>
          <div className="rounded-2xl bg-slate-50 p-4">
            <div className="mb-2 flex items-center gap-2 font-black text-slate-800"><Lock size={16} /> 洞察边界</div>
            聚焦校区级聚合趋势分析，学生个人数据按授权机制分级管理。
          </div>
          <Button long type="primary">生成本月 AI 督导报告</Button>
        </div>
      </Card>
    </div>
  </div>
);

const DataContent: React.FC = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="数据源总数" value="8" sub="已接入 6 个" icon={Database} tone="bg-blue-50 text-blue-600" />
      <StatCard title="对接正常" value="5" sub="同步成功率 >95%" icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
      <StatCard title="对接异常" value="1" sub="体质健康数据" icon={AlertTriangle} tone="bg-orange-50 text-orange-600" trend="down" />
      <StatCard title="待接入" value="2" sub="家访/社团数据" icon={ClipboardList} tone="bg-violet-50 text-violet-600" />
    </div>

    <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">数据来源与对接状态</span>}>
      <Table
        pagination={false}
        rowKey="name"
        data={[
          { name: '学生基础档案', source: '集团教育数据中台', dimension: '基础信息', rate: 99, status: '正常', time: '实时同步', campuses: '6/6' },
          { name: '学业成绩数据', source: '教务管理系统', dimension: '智育', rate: 98, status: '正常', time: '每日 06:35', campuses: '6/6' },
          { name: '体质健康数据', source: '体育测评系统', dimension: '体育', rate: 72, status: '异常', time: '同步中断', campuses: '4/6' },
          { name: '行为与积分流水', source: 'AI 素养评价系统', dimension: '五育', rate: 100, status: '正常', time: '实时', campuses: '6/6' },
          { name: '德育行为记录', source: '校园德育管理平台', dimension: '德育', rate: 96, status: '正常', time: '每日 07:00', campuses: '6/6' },
          { name: '美育活动记录', source: '艺术教育管理系统', dimension: '美育', rate: 88, status: '正常', time: '每日 08:00', campuses: '5/6' },
          { name: '劳育实践记录', source: '劳动教育平台', dimension: '劳育', rate: 94, status: '正常', time: '每日 07:30', campuses: '6/6' },
          { name: '心理健康数据', source: '待接入', dimension: '心理健康', rate: 0, status: '待接入', time: '—', campuses: '0/6' },
        ]}
        columns={[
          { title: '数据对象', dataIndex: 'name', width: 150, render: (v: string) => <span className="font-black text-slate-800">{v}</span> },
          { title: '数据来源', dataIndex: 'source', width: 170 },
          { title: '评价维度', dataIndex: 'dimension', width: 100, render: (v: string) => <Tag color="blue">{v}</Tag> },
          { title: '覆盖校区', dataIndex: 'campuses', width: 100 },
          { title: '对接状态', dataIndex: 'status', width: 100, render: (v: string) => <Tag color={v === '正常' ? 'green' : v === '异常' ? 'red' : 'orangered'}>{v}</Tag> },
          { title: '同步频率', dataIndex: 'time', width: 120 },
          { title: '成功率', dataIndex: 'rate', width: 90, render: (v: number) => <span className={`font-black ${v >= 95 ? 'text-emerald-600' : v > 0 ? 'text-orange-600' : 'text-slate-400'}`}>{v > 0 ? v + '%' : '—'}</span> },
          { title: '操作', width: 100, render: (_: unknown, row: any) => <Button size="small" type={row.status === '异常' ? 'primary' : 'text'}>{row.status === '异常' ? '处理异常' : row.status === '待接入' ? '配置接入' : '查看日志'}</Button> },
        ]}
      />
    </Card>

    <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">各校区数据覆盖情况</span>}>
      <Table
        pagination={false}
        rowKey="campus"
        data={[
          { campus: '宁康园校区（本部）', dimensions: 5, rate: 99, status: '全量接入' },
          { campus: '湖畔校区', dimensions: 5, rate: 97, status: '全量接入' },
          { campus: '朴真校区', dimensions: 5, rate: 95, status: '全量接入' },
          { campus: '军山小学校区', dimensions: 4, rate: 88, status: '体育数据异常' },
          { campus: '育才二小校区', dimensions: 5, rate: 96, status: '全量接入' },
          { campus: '子林校区', dimensions: 5, rate: 94, status: '全量接入' },
        ]}
        columns={[
          { title: '校区', dataIndex: 'campus', width: 170, render: (v: string) => <span className="font-black text-slate-800">{v}</span> },
          { title: '已接入维度', dataIndex: 'dimensions', width: 120, render: (v: number) => <span className="font-black text-slate-700">{v}/5</span> },
          { title: '数据完整度', dataIndex: 'rate', width: 150, render: (v: number) => <Progress percent={v} size="small" color={v >= 95 ? '#00b42a' : v >= 85 ? '#165dff' : '#ff7d00'} /> },
          { title: '状态', dataIndex: 'status', width: 140, render: (v: string) => <Tag color={v === '全量接入' ? 'green' : 'orangered'}>{v}</Tag> },
        ]}
      />
    </Card>
  </div>
);




const ReportsContent: React.FC = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-4 gap-4">
      <StatCard title="报告模板" value="8" sub="已配置推送" icon={FileBarChart} tone="bg-blue-50 text-blue-600" />
      <StatCard title="本月已推送" value="24" sub="覆盖 6 个校区" icon={CheckCircle2} tone="bg-emerald-50 text-emerald-600" />
      <StatCard title="待推送" value="3" sub="本周待发" icon={ClipboardList} tone="bg-orange-50 text-orange-600" />
      <StatCard title="覆盖对象" value="4" sub="校领导/班主任/教师/家长" icon={UserRoundCheck} tone="bg-violet-50 text-violet-600" />
    </div>

    <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">报告推送管理</span>}>
      <Table
        pagination={false}
        rowKey="name"
        data={[
          { name: '集团五育发展月报', audience: '集团校领导', frequency: '每月 5 日', campus: '全集团', format: 'PDF + 在线', status: '已启用' },
          { name: '校区五育发展周报', audience: '校区校领导', frequency: '每周一', campus: '各校区', format: '在线', status: '已启用' },
          { name: '班级学情分析报告', audience: '班主任', frequency: '每两周', campus: '各班级', format: '在线', status: '已启用' },
          { name: '学生个人成长报告', audience: '家长', frequency: '每月 + 期末', campus: '各班级', format: 'PDF + 在线', status: '已启用' },
          { name: '教师评价质量报告', audience: '校区教务处', frequency: '每月', campus: '各校区', format: '在线', status: '已启用' },
          { name: '德育专项诊断报告', audience: '集团德育处', frequency: '按需', campus: '指定校区', format: 'PDF', status: '已启用' },
          { name: '体质健康达标报告', audience: '集团体育组', frequency: '每学期', campus: '全集团', format: 'PDF', status: '已启用' },
          { name: '督导整改跟踪报告', audience: '集团督导室', frequency: '按需', campus: '指定校区', format: 'PDF', status: '已启用' },
        ]}
        columns={[
          { title: '报告名称', dataIndex: 'name', width: 180, render: (v: string) => <span className="font-black text-slate-800">{v}</span> },
          { title: '推送对象', dataIndex: 'audience', width: 130 },
          { title: '推送频率', dataIndex: 'frequency', width: 120 },
          { title: '覆盖范围', dataIndex: 'campus', width: 100 },
          { title: '报告格式', dataIndex: 'format', width: 100 },
          { title: '状态', dataIndex: 'status', width: 90, render: (v: string) => <Tag color="green">{v}</Tag> },
          { title: '操作', width: 120, render: () => <Button type="text" size="small">配置</Button> },
        ]}
      />
    </Card>

    <div className="grid grid-cols-[1fr_1fr] gap-5">
      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">推送对象覆盖</span>}>
        <div className="space-y-4">
          {[
            { audience: '集团校领导', reports: 3, desc: '集团月报、德育专项、督导跟踪', next: '2026-06-05 推送月报' },
            { audience: '校区校领导', reports: 2, desc: '校区周报、教师评价质量', next: '2026-06-09 推送周报' },
            { audience: '班主任', reports: 2, desc: '班级学情、学生个人成长', next: '2026-06-16 推送学情' },
            { audience: '家长', reports: 1, desc: '学生个人成长报告', next: '2026-06-30 推送月报' },
          ].map((item) => (
            <div key={item.audience} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-center justify-between">
                <span className="font-black text-slate-900">{item.audience}</span>
                <Tag color="blue">{item.reports} 份报告</Tag>
              </div>
              <div className="mt-1 text-xs font-bold text-slate-500">{item.desc}</div>
              <div className="mt-2 text-xs font-bold text-blue-600">下次推送：{item.next}</div>
            </div>
          ))}
        </div>
      </Card>

      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">教师评价质量报告</span>}>
        <div className="space-y-3">
          <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
            <div className="mb-1 text-xs font-black text-orange-800">通用话术预警</div>
            <div className="text-sm font-bold text-orange-700">342 条评价使用"全班怎么样"等通用话术，涉及 28 名教师。</div>
          </div>
          <div className="rounded-2xl border border-red-100 bg-red-50 p-4">
            <div className="mb-1 text-xs font-black text-red-800">录入时间集中预警</div>
            <div className="text-sm font-bold text-red-700">42% 行为记录在期末最后两周录入，过程性评价落实不足。</div>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <div className="mb-1 text-xs font-black text-blue-800">评价维度单一预警</div>
            <div className="text-sm font-bold text-blue-700">26% 教师仅录课堂表现与成绩，未覆盖五育全维度。</div>
          </div>
        </div>
      </Card>
    </div>
  </div>
);

/* ==================== 主组件 ==================== */

interface GroupPcAdminProps {
  screenOnly?: boolean;
  onLogout?: () => void;
}

const GroupPcAdmin: React.FC<GroupPcAdminProps> = ({ screenOnly = false, onLogout }) => {
  const [activeSection, setActiveSection] = useState<GroupSection>('overview');

  const content = {
    overview: <AdminOverviewContent />,
    indicators: <IndicatorsContent />,
    supervision: <SupervisionContent />,
    ai: <AiContent />,
    reports: <ReportsContent />,
    data: <DataContent />,
  }[activeSection];

  if (screenOnly) {
    return <BigScreenOverviewContent />;
  }

  return (
    <div className="h-[100dvh] w-screen overflow-hidden bg-[#eef3f8] text-slate-900" style={{ fontFamily: cnFont }}>
      <div className="flex h-full">
        <aside className="flex w-[276px] shrink-0 flex-col border-r border-slate-200 bg-[#102033] text-white">
          <div className="flex h-[88px] shrink-0 items-center border-b border-white/10 px-5">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-500 shadow-[0_14px_30px_rgba(22,93,255,0.32)]">
                <PlatformBrandMark size={22} />
              </div>
              <div>
                <div className="text-[18px] font-black tracking-[-0.02em]">小灵龙五育评价平台</div>
                <div className="mt-0.5 text-xs font-bold text-slate-300">五育综合素质评价</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {(Object.keys(sectionMeta) as GroupSection[]).map((section) => {
              const meta = sectionMeta[section];
              const Icon = meta.icon;
              const active = activeSection === section;
              return (
                <button
                  key={section}
                  type="button"
                  onClick={() => setActiveSection(section)}
                  className={`w-full rounded-2xl px-4 py-3 text-left transition-all ${active ? 'bg-white text-slate-950 shadow-lg' : 'text-slate-300 hover:bg-white/8 hover:text-white'}`}
                >
                  <div className="flex items-center gap-3">
                    <Icon size={18} />
                    <div className="min-w-0 flex-1">
                      <div className="text-sm font-black">{meta.label}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </nav>
          <div className="border-t border-white/10 p-4">
            <button
              type="button"
              onClick={onLogout}
              className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/8 text-sm font-black text-slate-100 transition-colors hover:border-red-300/40 hover:bg-red-500/18 hover:text-white"
            >
              <LogOut size={16} />
              退出登录
            </button>
          </div>
        </aside>

        <main className="flex min-w-0 flex-1 flex-col">
          <header className="flex h-[88px] shrink-0 items-center justify-between gap-6 border-b border-slate-200 bg-white px-6">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_12px_28px_rgba(22,93,255,0.18)]">
                {React.createElement(sectionMeta[activeSection].icon, { size: 20 })}
              </div>
              <div className="min-w-0">
                <h1 className="truncate text-[24px] font-black tracking-[-0.03em] text-slate-900">{sectionMeta[activeSection].label}</h1>
              </div>
            </div>
            <div className="pc-filter-bar flex shrink-0 items-center gap-2">
              <Button size="large">刷新数据</Button>
              <button
                type="button"
                className="flex h-10 w-[128px] shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 text-sm font-black leading-none text-white shadow-sm transition-colors hover:bg-blue-700"
                onClick={() => window.open(`${window.location.origin}${window.location.pathname}?app=group-pc-screen`, '_blank')}
              >
                <Monitor size={16} className="shrink-0" />
                <span className="block whitespace-nowrap leading-none">大屏模式</span>
              </button>
            </div>
          </header>
          <div className="min-h-0 flex-1 overflow-y-auto">
            <SectionShell>{content}</SectionShell>
          </div>
        </main>
      </div>
    </div>
  );
};

export default GroupPcAdmin;
