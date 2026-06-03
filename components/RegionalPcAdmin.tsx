import React, { useMemo, useState } from 'react';
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

type RegionalSection = 'overview' | 'indicators' | 'supervision' | 'ai' | 'data' | 'reports';
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

type SchoolRow = {
  key: string;
  name: string;
  area: string;
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
  schoolUsage: number;
  updatedAt: string;
  status: '启用' | '待完善';
};

type SchoolIndicatorRow = {
  key: string;
  school: string;
  version: string;
  districtCoverage: number;
  customItems: number;
  updatedAt: string;
  status: '已对齐' | '待同步' | '需完善';
};

const sectionMeta: Record<RegionalSection, { label: string; icon: LucideIcon }> = {
  overview: { label: '区域驾驶舱', icon: Gauge },
  indicators: { label: '素养指标中心', icon: Layers3 },
  supervision: { label: '风险预警', icon: ClipboardList },
  ai: { label: 'AI 研判', icon: BrainCircuit },
  data: { label: '数据治理', icon: Database },
  reports: { label: '报告中心', icon: FileBarChart },
};

const dimensions: FiveDimension[] = [
  { key: 'de', label: '德', full: '德育', score: 82, trend: '+3.8%', color: '#1677ff', bg: 'bg-blue-50 text-blue-700 border-blue-100' },
  { key: 'zhi', label: '智', full: '智育', score: 88, trend: '+2.1%', color: '#14b8a6', bg: 'bg-teal-50 text-teal-700 border-teal-100' },
  { key: 'ti', label: '体', full: '体育', score: 74, trend: '-1.6%', color: '#f97316', bg: 'bg-orange-50 text-orange-700 border-orange-100' },
  { key: 'mei', label: '美', full: '美育', score: 69, trend: '+0.8%', color: '#8b5cf6', bg: 'bg-violet-50 text-violet-700 border-violet-100' },
  { key: 'lao', label: '劳', full: '劳育', score: 77, trend: '+4.2%', color: '#22c55e', bg: 'bg-green-50 text-green-700 border-green-100' },
];

const schoolRows: SchoolRow[] = [
  { key: 's1', name: '未来实验小学', area: '直属学校', behaviorCount: 18420, studentCoverage: 76, teacherParticipation: 68, dimensionsTouched: 5, indicatorBreadth: 42, alertCount: 1, status: '平稳', weak: '美育活动参与' },
  { key: 's2', name: '星河第二小学', area: '直属学校', behaviorCount: 12680, studentCoverage: 63, teacherParticipation: 51, dimensionsTouched: 4, indicatorBreadth: 34, alertCount: 5, status: '关注', weak: '体育记录偏少' },
  { key: 's3', name: '青禾中学', area: '直属学校', behaviorCount: 15360, studentCoverage: 58, teacherParticipation: 47, dimensionsTouched: 4, indicatorBreadth: 31, alertCount: 8, status: '重点关注', weak: '德育负向行为' },
  { key: 's4', name: '启明九年制学校', area: '直属学校', behaviorCount: 10940, studentCoverage: 54, teacherParticipation: 44, dimensionsTouched: 3, indicatorBreadth: 27, alertCount: 3, status: '关注', weak: '劳育记录不足' },
  { key: 's5', name: '梧桐小学', area: '直属学校', behaviorCount: 20110, studentCoverage: 81, teacherParticipation: 72, dimensionsTouched: 5, indicatorBreadth: 48, alertCount: 0, status: '平稳', weak: '无明显短板' },
];

const districtIndicatorRows: IndicatorRow[] = [
  { key: 'i1', dimension: '德育', level1: '品德发展', level2: '遵纪守法', level3: '友爱同学', schoolUsage: 15, updatedAt: '2026-05-26', status: '启用' },
  { key: 'i2', dimension: '智育', level1: '学习品质', level2: '创新思维', level3: '科创实践', schoolUsage: 14, updatedAt: '2026-05-22', status: '启用' },
  { key: 'i3', dimension: '体育', level1: '身心健康', level2: '运动习惯', level3: '课程参与', schoolUsage: 15, updatedAt: '2026-05-18', status: '启用' },
  { key: 'i4', dimension: '美育', level1: '审美素养', level2: '艺术实践', level3: '作品展示', schoolUsage: 11, updatedAt: '2026-05-16', status: '待完善' },
  { key: 'i5', dimension: '劳育', level1: '劳动素养', level2: '校园劳动', level3: '公共服务', schoolUsage: 13, updatedAt: '2026-05-12', status: '启用' },
];

const schoolIndicatorRows: SchoolIndicatorRow[] = [
  { key: 'si1', school: '未来实验小学', version: '区级方案 V1 + 校本补充', districtCoverage: 100, customItems: 8, updatedAt: '2026-05-28', status: '已对齐' },
  { key: 'si2', school: '星河第二小学', version: '区级方案 V1', districtCoverage: 96, customItems: 3, updatedAt: '2026-05-24', status: '待同步' },
  { key: 'si3', school: '青禾中学', version: '区级方案 V1 + 校本补充', districtCoverage: 92, customItems: 12, updatedAt: '2026-05-20', status: '需完善' },
  { key: 'si4', school: '启明九年制学校', version: '区级方案 V1 + 校本补充', districtCoverage: 98, customItems: 10, updatedAt: '2026-05-18', status: '已对齐' },
  { key: 'si5', school: '梧桐小学', version: '区级方案 V1', districtCoverage: 100, customItems: 5, updatedAt: '2026-05-27', status: '已对齐' },
];

const warningItems = [
  { title: '青禾中学德育负向行为异常增加', meta: '近 7 日较上周 +18%，集中在七年级', level: '高', tone: 'red' },
  { title: '星河第二小学体育数据同步失败', meta: '体质健康接口连续 2 次失败', level: '中', tone: 'orange' },
  { title: '启明九年制学校劳育评价覆盖率偏低', meta: '本月覆盖率 72%，低于区级阈值 85%', level: '中', tone: 'orange' },
];

const dataTasks = [
  { name: '学生基础档案', source: '区域教育数据中台', status: '正常', rate: 99, time: '今日 06:10' },
  { name: '学业成绩数据', source: '教务系统', status: '正常', rate: 98, time: '今日 06:35' },
  { name: '体质健康数据', source: '体育测评系统', status: '异常', rate: 76, time: '今日 07:00' },
  { name: '行为与积分流水', source: 'AI 素养评价系统', status: '正常', rate: 100, time: '实时' },
];

const cnFont = '"PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Noto Sans CJK SC", system-ui, sans-serif';

const scoreTone = (score: number) => {
  if (score >= 90) return 'text-emerald-600 bg-emerald-50 border-emerald-100';
  if (score >= 80) return 'text-blue-600 bg-blue-50 border-blue-100';
  return 'text-orange-600 bg-orange-50 border-orange-100';
};

const statusTag = (status: SchoolRow['status']) => {
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
              <div className="text-xs font-bold text-slate-400">区域均值 {item.score} 分</div>
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
        区域综合素养指数 <span className="text-blue-600">81.6</span>
      </div>
    </div>
  );
};

const trendPoints = [42, 58, 64, 71, 83, 92, 101, 112, 126];
const behaviorTrend = [
  { month: '9月', positive: 9200, negative: 860 },
  { month: '10月', positive: 11800, negative: 940 },
  { month: '11月', positive: 14600, negative: 1220 },
  { month: '12月', positive: 17200, negative: 1410 },
  { month: '1月', positive: 15100, negative: 1180 },
  { month: '2月', positive: 13600, negative: 960 },
  { month: '3月', positive: 20900, negative: 1780 },
  { month: '4月', positive: 23800, negative: 2010 },
  { month: '5月', positive: 26900, negative: 2380 },
];

const indicatorDistribution = [
  { label: '德育', value: 48620, color: '#1677ff' },
  { label: '智育', value: 21840, color: '#14b8a6' },
  { label: '体育', value: 16480, color: '#f97316' },
  { label: '美育', value: 12260, color: '#8b5cf6' },
  { label: '劳育', value: 23800, color: '#22c55e' },
];

const topIndicators = [
  { name: '德育 / 遵纪守法 / 友爱同学', value: 8420, schools: 15, tone: 'bg-blue-500' },
  { name: '劳育 / 校园劳动 / 公共服务', value: 7380, schools: 14, tone: 'bg-green-500' },
  { name: '智育 / 学科素养 / 课堂思考', value: 6920, schools: 15, tone: 'bg-teal-500' },
  { name: '体育 / 运动习惯 / 课程参与', value: 5480, schools: 12, tone: 'bg-orange-500' },
  { name: '美育 / 艺术实践 / 文艺活动', value: 3960, schools: 10, tone: 'bg-violet-500' },
];

const lowIndicators = [
  { name: '美育 / 审美表达 / 校外展陈', dimension: '美育', cycles: '连续 3 个周期低频', action: '补充场景样例' },
  { name: '体育 / 赛事参与 / 区级竞赛', dimension: '体育', cycles: '本学期零命中', action: '确认适用学校' },
  { name: '劳育 / 生活技能 / 家庭维修', dimension: '劳育', cycles: '全区命中 6 次', action: '优化指标描述' },
];

const warningDistribution = [
  { label: '行为异常', value: 6, color: '#f53f3f' },
  { label: '五育覆盖', value: 4, color: '#ff7d00' },
  { label: '使用活跃', value: 3, color: '#f7ba1e' },
  { label: '积分异常', value: 2, color: '#722ed1' },
  { label: '数据同步', value: 1, color: '#165dff' },
];

const formatNumber = (value: number) => value.toLocaleString('zh-CN');

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

const HorizontalBars: React.FC<{ data: { name: string; value: number; schools?: number; tone: string }[] }> = ({ data }) => {
  const max = Math.max(...data.map((item) => item.value));
  return (
    <div className="space-y-3">
      {data.map((item, index) => (
        <div key={item.name}>
          <div className="mb-1.5 flex items-center justify-between gap-3">
            <div className="min-w-0 truncate text-sm font-black text-slate-700"><span className="mr-2 text-slate-400">{index + 1}</span>{item.name}</div>
            <div className="shrink-0 text-xs font-black text-slate-500">{formatNumber(item.value)} 次{item.schools ? ` / ${item.schools} 校` : ''}</div>
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

const SchoolHeatmap: React.FC = () => {
  const heat = [
    { school: '未来实验小学', values: [86, 89, 78, 74, 82] },
    { school: '星河第二小学', values: [81, 85, 66, 71, 76] },
    { school: '青禾中学', values: [70, 84, 75, 68, 73] },
    { school: '启明九年制学校', values: [78, 82, 73, 61, 64] },
    { school: '梧桐小学', values: [88, 91, 81, 79, 85] },
  ];
  const tone = (value: number) => value >= 85 ? 'bg-emerald-500 text-white' : value >= 75 ? 'bg-blue-500 text-white' : value >= 68 ? 'bg-orange-400 text-white' : 'bg-rose-500 text-white';
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[130px_repeat(5,1fr)] gap-2 text-xs font-black text-slate-400">
        <div>学校</div>{dimensions.map((item) => <div key={item.key} className="text-center">{item.full}</div>)}
      </div>
      {heat.map((row) => (
        <div key={row.school} className="grid grid-cols-[130px_repeat(5,1fr)] gap-2">
          <div className="truncate rounded-xl bg-slate-50 px-3 py-2 text-sm font-black text-slate-700">{row.school}</div>
          {row.values.map((value, index) => <div key={index} className={`rounded-xl py-2 text-center text-sm font-black ${tone(value)}`}>{value}</div>)}
        </div>
      ))}
    </div>
  );
};

const SchoolQuadrant: React.FC = () => (
  <div className="relative h-[280px] rounded-2xl bg-slate-50 p-4">
    <svg viewBox="0 0 360 230" className="h-full w-full">
      <line x1="45" x2="330" y1="115" y2="115" stroke="#d8e0ea" strokeDasharray="5 5" />
      <line x1="185" x2="185" y1="25" y2="205" stroke="#d8e0ea" strokeDasharray="5 5" />
      <text x="48" y="24" className="fill-slate-400 text-[11px] font-bold">五育综合表现</text>
      <text x="250" y="220" className="fill-slate-400 text-[11px] font-bold">日常评价活跃度</text>
      {schoolRows.map((school, index) => {
        const x = 45 + (school.behaviorCount / 22000) * 250;
        const y = 198 - (school.studentCoverage / 90) * 160;
        const color = school.status === '平稳' ? '#00b42a' : school.status === '关注' ? '#ff7d00' : '#f53f3f';
        return (
          <g key={school.key}>
            <circle cx={x} cy={y} r={10 + school.alertCount} fill={color} opacity="0.84" />
            <text x={x + 12} y={y + 4} className="fill-slate-700 text-[10px] font-bold">{school.name.slice(0, 4)}</text>
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

const BigScreenMetric: React.FC<{ label: string; value: string; unit?: string; sub: string; tone: string }> = ({ label, value, unit, sub, tone }) => (
  <div className="relative overflow-hidden rounded-[18px] border border-cyan-300/20 bg-cyan-950/25 px-4 py-3 shadow-[inset_0_0_30px_rgba(34,211,238,0.08),0_18px_40px_rgba(0,0,0,0.18)]">
    <div className={`absolute left-0 top-0 h-1 w-full ${tone}`} />
    <div className="text-[12px] font-bold tracking-[0.06em] text-cyan-100/70">{label}</div>
    <div className="mt-2 flex items-end gap-1">
      <span className="font-mono text-[29px] font-black leading-none tracking-[-0.06em] text-white">{value}</span>
      {unit && <span className="mb-1 text-xs font-bold text-cyan-100/60">{unit}</span>}
    </div>
    <div className="mt-1 text-[11px] font-bold text-cyan-200/70">{sub}</div>
  </div>
);

const BigScreenPanel: React.FC<{ title: string; children: React.ReactNode; className?: string; extra?: React.ReactNode }> = ({ title, children, className = '', extra }) => (
  <section className={`relative overflow-hidden rounded-[22px] border border-cyan-300/18 bg-[#08234b]/72 p-3 shadow-[inset_0_0_48px_rgba(20,184,166,0.08),0_22px_46px_rgba(0,0,0,0.24)] ${className}`}>
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />
    <div className="mb-2 flex items-center justify-between gap-3">
      <div className="flex items-center gap-2">
        <span className="h-3 w-1 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.9)]" />
        <h2 className="text-[16px] font-black tracking-[0.08em] text-cyan-50">{title}</h2>
      </div>
      {extra}
    </div>
    {children}
  </section>
);

const BigScreenRadar: React.FC = () => {
  const points = dimensions.map((item, index) => {
    const angle = (-90 + index * 72) * Math.PI / 180;
    const radius = 88 * (item.score / 100);
    return `${120 + Math.cos(angle) * radius},${120 + Math.sin(angle) * radius}`;
  }).join(' ');

  return (
    <div className="grid h-full grid-cols-[1fr_140px] items-center gap-2">
      <div className="relative flex items-center justify-center">
        <svg width="255" height="255" viewBox="0 0 240 240" className="overflow-visible drop-shadow-[0_0_20px_rgba(34,211,238,0.25)]">
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
            <div className="font-mono text-[32px] font-black leading-none text-white">81.6</div>
            <div className="mt-1 text-xs font-bold tracking-[0.1em] text-cyan-200/80">五育均衡指数</div>
          </div>
        </div>
      </div>
      <div className="space-y-1.5 rounded-2xl border border-cyan-300/12 bg-cyan-950/30 p-3">
        <div className="text-xs font-black tracking-[0.12em] text-cyan-200">图表说明</div>
        <div className="text-[10px] font-bold leading-4 text-cyan-100/70">每个节点代表一个五育维度得分，越靠外表示该维度表现越高。</div>
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

const BigScreenTrend: React.FC = () => {
  const values = [72, 75, 76, 78, 77, 79, 80, 81, 82];
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
      <div className="mb-2 flex items-center justify-between gap-3 rounded-2xl border border-cyan-300/12 bg-cyan-950/28 px-4 py-2">
        <div className="text-xs font-bold text-cyan-100/70">口径：五育均衡指数 = 德、智、体、美、劳五个维度得分的加权结果，用于观察区域整体均衡发展趋势。</div>
        <div className="shrink-0 font-mono text-xs font-black text-cyan-200">0-100 分</div>
      </div>
      <svg viewBox="0 0 450 190" className="h-[190px] w-full">
        <defs>
          <linearGradient id="trendGlow" x1="0" x2="0" y1="0" y2="1">
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
        <polyline points={`36,174 ${points} 424,174`} fill="url(#trendGlow)" stroke="none" />
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
  const values = [72, 75, 76, 78, 77, 79, 80, 81, 82];
  const max = Math.max(...values);
  const min = Math.min(...values);
  const points = values.map((value, index) => {
    const x = 8 + index * 22;
    const y = 52 - ((value - min) / Math.max(max - min, 1)) * 42;
    return `${x},${y}`;
  }).join(' ');

  return (
    <div className="grid h-full grid-cols-[200px_1fr] gap-4">
      <div className="flex flex-col justify-between rounded-2xl border border-cyan-300/12 bg-cyan-950/30 p-4">
        <div>
          <div className="text-xs font-black tracking-[0.12em] text-cyan-200">五育均衡指数</div>
          <div className="mt-2 font-mono text-[50px] font-black leading-none tracking-[-0.06em] text-white">81.6</div>
          <div className="mt-2 text-xs font-bold leading-5 text-cyan-100/70">由德、智、体、美、劳五个维度得分加权形成，用于观察区域五育发展是否均衡。</div>
        </div>
        <div className="mt-3 rounded-xl bg-cyan-400/10 p-2">
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
          <div key={item.key} className="flex flex-col justify-between rounded-2xl border border-cyan-300/12 bg-cyan-950/30 p-3">
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


const BigScreenBars: React.FC<{ data: { name: string; value: number; schools?: number; tone: string }[] }> = ({ data }) => {
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
  const schools = [
    { school: '未来实验小学', values: [86, 89, 78, 74, 82] },
    { school: '星河第二小学', values: [81, 85, 66, 71, 76] },
    { school: '青禾中学', values: [70, 84, 75, 68, 73] },
    { school: '启明九年制学校', values: [78, 82, 73, 61, 64] },
    { school: '梧桐小学', values: [88, 91, 81, 79, 85] },
    { school: '明德小学', values: [82, 86, 77, 73, 80] },
    { school: '河畔学校', values: [76, 81, 70, 66, 71] },
    { school: '云阶中学', values: [79, 88, 74, 70, 77] },
  ];
  const tone = (value: number) => value >= 85 ? 'bg-emerald-400/90 text-[#031c1b]' : value >= 75 ? 'bg-cyan-400/85 text-[#04213e]' : value >= 68 ? 'bg-amber-300/90 text-[#3a2703]' : 'bg-rose-400/90 text-white';
  return (
    <div className="space-y-2">
      <div className="grid grid-cols-[120px_repeat(5,1fr)] gap-2 text-xs font-black tracking-[0.12em] text-cyan-100/55">
        <div>学校</div>{dimensions.map((item) => <div key={item.key} className="text-center">{item.label}</div>)}
      </div>
      {schools.map((row) => (
        <div key={row.school} className="grid grid-cols-[120px_repeat(5,1fr)] gap-2">
          <div className="truncate rounded-lg border border-cyan-300/10 bg-cyan-950/45 px-3 py-2 text-xs font-black text-cyan-50">{row.school}</div>
          {row.values.map((value, index) => <div key={index} className={`rounded-lg py-2 text-center font-mono text-xs font-black ${tone(value)}`}>{value}</div>)}
        </div>
      ))}
    </div>
  );
};

const BigScreenWarningList: React.FC = () => (
  <div className="space-y-3">
    {[
      { type: '行为异常', school: '青禾中学', title: '德育负向行为短期上升', level: '高' },
      { type: '五育覆盖', school: '启明九年制学校', title: '劳育记录覆盖偏低', level: '中' },
      { type: '指标运行', school: '全区', title: '3 个指标连续低频', level: '中' },
      { type: '使用活跃', school: '星河第二小学', title: '教师参与度偏低', level: '中' },
    ].map((item) => (
      <div key={item.title} className="rounded-2xl border border-cyan-300/12 bg-cyan-950/35 p-3">
        <div className="mb-2 flex items-center justify-between gap-3">
          <span className="text-xs font-black tracking-[0.1em] text-cyan-300">{item.type}</span>
          <span className={`rounded-full px-2 py-0.5 text-xs font-black ${item.level === '高' ? 'bg-rose-400 text-white' : 'bg-amber-300 text-amber-950'}`}>{item.level}</span>
        </div>
        <div className="text-sm font-black text-white">{item.school}</div>
        <div className="mt-1 text-xs font-bold leading-5 text-cyan-100/65">{item.title}</div>
      </div>
    ))}
  </div>
);

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
            <span className="text-[11px] font-bold text-cyan-100/55">{item.month}</span>
          </div>
        );
      })}
    </div>
  );
};


const BigScreenBehaviorOperation: React.FC = () => (
  <div className="grid h-full grid-cols-[1fr_150px] items-stretch gap-3">
    <div className="min-h-0">
      <BigScreenStackedBehaviorChart />
    </div>
    <div className="flex min-h-0 flex-col gap-2 rounded-2xl border border-cyan-300/12 bg-cyan-950/24 p-3">
      <div className="text-xs font-black tracking-[0.12em] text-cyan-200">记录构成</div>
      {[
        { label: '正向', value: '87.2%', width: 87, tone: 'bg-emerald-300', text: 'text-emerald-200' },
        { label: '负向', value: '12.8%', width: 13, tone: 'bg-rose-400', text: 'text-rose-200' },
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
          <div className="font-mono text-lg font-black text-white">1,630</div>
        </div>
        <div className="rounded-xl border border-cyan-300/10 bg-cyan-950/35 px-3 py-2">
          <div className="text-[11px] font-bold text-cyan-100/55">负向关联预警</div>
          <div className="font-mono text-lg font-black text-amber-200">6 项</div>
        </div>
      </div>
    </div>
  </div>
);

const BigScreenIndicatorInsight: React.FC = () => {
  const total = indicatorDistribution.reduce((sum, item) => sum + item.value, 0);
  const max = Math.max(...topIndicators.map((item) => item.value));
  return (
    <div className="grid h-full grid-cols-[178px_1fr] gap-3">
      <div className="flex min-h-0 flex-col rounded-2xl border border-cyan-300/12 bg-cyan-950/30 p-3">
        <div className="mb-2 flex items-end justify-between">
          <div>
            <div className="text-xs font-black tracking-[0.12em] text-cyan-200">五育记录分布</div>
            <div className="mt-1 font-mono text-[23px] font-black text-white">全区</div>
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
          <div className="mt-0.5 font-mono text-xl font-black text-amber-100">3 个</div>
        </div>
      </div>
      <div className="flex min-h-0 flex-col rounded-2xl border border-cyan-300/12 bg-cyan-950/22 p-3">
        <div className="flex items-center justify-between">
          <div className="text-xs font-black tracking-[0.12em] text-cyan-200">高频指标 TOP4</div>
          <div className="text-[11px] font-bold text-cyan-100/55">记录数 · 覆盖学校</div>
        </div>
        <div className="mt-3 space-y-2">
          {topIndicators.slice(0, 4).map((item, index) => (
            <div key={item.name}>
              <div className="mb-1 grid grid-cols-[28px_1fr_94px] items-center gap-2">
                <span className="font-mono text-sm font-black text-cyan-300">{String(index + 1).padStart(2, '0')}</span>
                <span className="truncate text-[13px] font-bold text-cyan-50/88">{item.name}</span>
                <span className="text-right font-mono text-xs font-black text-cyan-200/80">{formatNumber(item.value)} · {item.schools}校</span>
              </div>
              <div className="ml-9 h-2 overflow-hidden rounded-full bg-cyan-950/70">
                <div className={`h-full rounded-full ${item.tone} shadow-[0_0_18px_rgba(34,211,238,0.35)]`} style={{ width: `${Math.max((item.value / max) * 100, 8)}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div className="mt-auto grid grid-cols-4 gap-2 pt-3">
          {[
            { label: '覆盖学校', value: '15 所' },
            { label: '五育触达', value: '10 所' },
            { label: '校本指标', value: '28 个' },
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

const BigScreenSchools: React.FC = () => (
  <div className="grid grid-cols-3 gap-2">
    {schoolRows.concat([
      { key: 's6', name: '明德小学', area: '直属学校', behaviorCount: 11820, studentCoverage: 67, teacherParticipation: 59, dimensionsTouched: 5, indicatorBreadth: 39, alertCount: 1, status: '平稳' as const, weak: '无明显短板' },
      { key: 's7', name: '河畔学校', area: '直属学校', behaviorCount: 9340, studentCoverage: 49, teacherParticipation: 43, dimensionsTouched: 4, indicatorBreadth: 28, alertCount: 4, status: '关注' as const, weak: '美育记录不足' },
      { key: 's8', name: '云阶中学', area: '直属学校', behaviorCount: 13670, studentCoverage: 61, teacherParticipation: 52, dimensionsTouched: 5, indicatorBreadth: 36, alertCount: 2, status: '平稳' as const, weak: '体育波动' },
      { key: 's9', name: '松石小学', area: '直属学校', behaviorCount: 10460, studentCoverage: 55, teacherParticipation: 48, dimensionsTouched: 4, indicatorBreadth: 30, alertCount: 2, status: '关注' as const, weak: '劳育记录不足' },
    ]).slice(0, 9).map((school) => (
      <div key={school.key} className="rounded-xl border border-cyan-300/12 bg-cyan-950/35 px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <span className="truncate text-xs font-black text-cyan-50">{school.name}</span>
          <span className={`h-2 w-2 rounded-full ${school.status === '重点关注' ? 'bg-rose-400' : school.status === '关注' ? 'bg-amber-300' : 'bg-emerald-300'}`} />
        </div>
        <div className="mt-1 font-mono text-[11px] font-bold text-cyan-100/55">记录 {formatNumber(school.behaviorCount)}</div>
      </div>
    ))}
  </div>
);

const BigScreenOverviewContent: React.FC = () => (
  <div className="relative h-[100dvh] w-screen overflow-hidden bg-[#030b1f] text-white" style={{ fontFamily: cnFont }}>
    <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_18%,rgba(14,165,233,0.26),transparent_34%),radial-gradient(circle_at_8%_18%,rgba(34,211,238,0.16),transparent_28%),linear-gradient(180deg,#06163a_0%,#041027_52%,#020716_100%)]" />
    <div className="absolute inset-0 opacity-[0.18]" style={{ backgroundImage: 'linear-gradient(rgba(125,211,252,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(125,211,252,0.18) 1px, transparent 1px)', backgroundSize: '42px 42px' }} />
    <div className="relative z-10 flex h-full flex-col p-4">
      <header className="mb-3 flex h-[68px] shrink-0 items-center justify-between rounded-[24px] border border-cyan-300/18 bg-cyan-950/20 px-6 shadow-[inset_0_0_40px_rgba(34,211,238,0.08)]">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-200/25 bg-cyan-400/15 text-cyan-100 shadow-[0_0_24px_rgba(34,211,238,0.25)]">
            <PlatformBrandMark size={23} />
          </div>
          <div>
            <div className="text-[25px] font-black tracking-[0.08em] text-white">区域五育并举综合素质评价驾驶舱</div>
            <div className="mt-1 text-xs font-bold tracking-[0.2em] text-cyan-200/70">区教育局 · 15 所学校 · 学生日常行为评价运行监测</div>
          </div>
        </div>
        <div className="text-right">
          <div className="font-mono text-[19px] font-black text-cyan-100">2026-06-02 14:30</div>
          <div className="mt-1 text-[11px] font-bold tracking-[0.16em] text-cyan-200/60">数据每 5 分钟刷新</div>
        </div>
      </header>

      <div className="mb-3 grid shrink-0 grid-cols-6 gap-3">
        <BigScreenMetric label="五育触达学校 / 接入学校" value="10/15" sub="五类维度均有记录" tone="bg-cyan-300" />
        <BigScreenMetric label="评价覆盖学生 / 在读学生" value="9,836/12,860" sub="本月有评价记录" tone="bg-emerald-300" />
        <BigScreenMetric label="参与评价老师 / 在校老师" value="426/620" sub="本月参与日常评价" tone="bg-blue-300" />
        <BigScreenMetric label="本月行为记录" value="48,920" unit="条" sub="日常评价持续沉淀" tone="bg-violet-300" />
        <BigScreenMetric label="正向行为占比" value="87.2%" sub="较上月提升 2.8%" tone="bg-teal-300" />
        <BigScreenMetric label="风险预警" value="9" unit="项" sub="高优先级 2 项" tone="bg-amber-300" />
      </div>

      <main className="grid min-h-0 flex-1 grid-cols-[38%_34%_28%] grid-rows-[45%_55%] gap-3">
        <BigScreenPanel title="五育发展总览" className="col-span-2">
          <BigScreenFiveEducationSummary />
        </BigScreenPanel>

        <BigScreenPanel title="风险预警">
          <BigScreenWarningList />
        </BigScreenPanel>

        <BigScreenPanel title="行为记录运行">
          <BigScreenBehaviorOperation />
        </BigScreenPanel>

        <BigScreenPanel title="指标运行洞察">
          <BigScreenIndicatorInsight />
        </BigScreenPanel>

        <BigScreenPanel title="学校运行概览">
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl border border-cyan-300/12 bg-cyan-950/35 p-3 text-center">
                <div className="font-mono text-[22px] font-black text-white">10/15</div>
                <div className="text-[11px] font-bold text-cyan-100/60">五育触达</div>
              </div>
              <div className="rounded-xl border border-cyan-300/12 bg-cyan-950/35 p-3 text-center">
                <div className="font-mono text-[22px] font-black text-white">9</div>
                <div className="text-[11px] font-bold text-cyan-100/60">风险预警</div>
              </div>
              <div className="rounded-xl border border-cyan-300/12 bg-cyan-950/35 p-3 text-center">
                <div className="font-mono text-[22px] font-black text-white">3</div>
                <div className="text-[11px] font-bold text-cyan-100/60">重点关注</div>
              </div>
            </div>
            <BigScreenSchools />
          </div>
        </BigScreenPanel>
      </main>
    </div>
  </div>
);

const AdminOverviewContent: React.FC = () => {
  const schoolColumns = useMemo(() => [
    { title: '学校', dataIndex: 'name', width: 170, render: (name: string, row: SchoolRow) => <div><div className="font-black text-slate-800">{name}</div><div className="text-xs text-slate-400">{row.area}</div></div> },
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
        <StatCard title="五育触达学校 / 接入学校" value="10/15" sub="五类维度均有记录" icon={Radar} tone="bg-teal-50 text-teal-600" />
        <StatCard title="评价覆盖学生 / 在读学生" value="9,836/12,860" sub="本月有评价记录" icon={UserRoundCheck} tone="bg-emerald-50 text-emerald-600" />
        <StatCard title="参与评价老师 / 在校老师" value="426/620" sub="本月参与日常评价" icon={Building2} tone="bg-blue-50 text-blue-600" />
        <StatCard title="本月行为记录" value="48,920" sub="+18%" icon={Activity} tone="bg-cyan-50 text-cyan-600" />
        <StatCard title="正向行为占比" value="87.2%" sub="较上月 +2.8%" icon={Layers3} tone="bg-violet-50 text-violet-600" />
        <StatCard title="风险预警" value="9" sub="需关注" icon={AlertTriangle} tone="bg-orange-50 text-orange-600" trend="down" />
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
        <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">风险预警分布</span>}>
          <div className="grid grid-cols-[320px_1fr] items-center gap-4">
            <DonutChart data={warningDistribution} center="9" subtitle="当前预警" />
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
        <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">学校五育热力图</span>}>
          <SchoolHeatmap />
        </Card>
      </div>

      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">学校日常评价运行状态</span>} extra={<Button type="text">查看全部</Button>}>
        <Table columns={schoolColumns} data={schoolRows} pagination={false} rowKey="key" />
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
    { title: '使用学校', dataIndex: 'schoolUsage', width: 110, render: (value: number) => <span className="font-black text-slate-700">{value}/15 所</span> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 120 },
    { title: '状态', dataIndex: 'status', width: 100, render: (value: IndicatorRow['status']) => value === '启用' ? <Tag color="green">启用</Tag> : <Tag color="orangered">待完善</Tag> },
    { title: '操作', dataIndex: 'action', width: 110, render: () => <Button type="text">编辑</Button> },
  ], []);

  const schoolIndicatorColumns = useMemo(() => [
    { title: '学校', dataIndex: 'school', width: 170, render: (value: string) => <span className="font-black text-slate-800">{value}</span> },
    { title: '指标体系版本', dataIndex: 'version', width: 220 },
    { title: '区级指标覆盖', dataIndex: 'districtCoverage', width: 150, render: (value: number) => <Progress percent={value} size="small" color={value >= 98 ? '#00b42a' : value >= 95 ? '#165dff' : '#ff7d00'} /> },
    { title: '校本指标', dataIndex: 'customItems', width: 110, render: (value: number) => <span className="font-black text-slate-700">{value} 条</span> },
    { title: '更新时间', dataIndex: 'updatedAt', width: 120 },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (value: SchoolIndicatorRow['status']) => {
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
            <div className="mt-4 rounded-xl bg-slate-50 px-3 py-2 text-xs font-black text-slate-500">已配置 {item.key === 'de' ? 42 : item.key === 'zhi' ? 38 : item.key === 'ti' ? 31 : item.key === 'mei' ? 26 : 29} 条指标</div>
          </div>
        ))}
      </div>

      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">区级指标体系设置</span>} extra={<Button type="primary">新增区级指标</Button>}>
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
        <Table columns={indicatorColumns} data={districtIndicatorRows} pagination={false} rowKey="key" />
      </Card>

      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">学校指标体系查看</span>} extra={<Button>导出对齐情况</Button>}>
        <div className="pc-filter-bar mb-4 flex items-center gap-3">
          <Input allowClear prefix={<Search size={15} />} placeholder="搜索学校名称" style={{ width: 220 }} />
          <Select placeholder="对齐状态" allowClear style={{ width: 150 }}>
            <Select.Option value="aligned">已对齐</Select.Option>
            <Select.Option value="sync">待同步</Select.Option>
            <Select.Option value="improve">需完善</Select.Option>
          </Select>
          <Button type="primary">查询</Button>
          <Button>重置</Button>
        </div>
        <Table columns={schoolIndicatorColumns} data={schoolIndicatorRows} pagination={false} rowKey="key" />
      </Card>
    </div>
  );
};

const SupervisionContent: React.FC = () => (
  <div className="space-y-5">
    <div className="grid grid-cols-[1fr_1fr_1fr_1fr] gap-4">
      <StatCard title="当前风险预警" value="16" sub="高优先级 3" icon={AlertTriangle} tone="bg-orange-50 text-orange-600" trend="down" />
      <StatCard title="行为异常预警" value="6" sub="同伴冲突上升" icon={Activity} tone="bg-rose-50 text-rose-600" trend="down" />
      <StatCard title="五育覆盖预警" value="4" sub="美育/劳育偏低" icon={Radar} tone="bg-violet-50 text-violet-600" trend="down" />
      <StatCard title="指标运行预警" value="5" sub="低频指标待优化" icon={Layers3} tone="bg-blue-50 text-blue-600" />
    </div>

    <div className="grid grid-cols-[0.85fr_1.15fr] gap-5">
      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">预警类型分布</span>}>
        <DonutChart data={warningDistribution} center="16" subtitle="风险预警" />
        <div className="mt-5 rounded-2xl bg-slate-50 p-4 text-sm font-bold leading-6 text-slate-500">
          本期只做风险识别与关注提醒，不包含行政流转。预警用于辅助区级人员判断重点学校、重点维度和重点指标。
        </div>
      </Card>

      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">重点关注事项</span>}>
        <div className="grid grid-cols-2 gap-4">
          {[
            { type: '行为异常', school: '青禾中学', title: '德育负向行为短期上升', desc: '七年级近 7 日“同伴冲突/课堂纪律”相关记录较上周上升 18%。', level: '高' },
            { type: '五育覆盖', school: '启明九年制学校', title: '劳育记录覆盖偏低', desc: '本月劳育相关行为记录占比 4.6%，低于全区均值 12.8%。', level: '中' },
            { type: '指标运行', school: '全区', title: '3 个指标连续低频', desc: '部分美育、劳育指标长期缺少日常场景命中，建议补充行为样例。', level: '中' },
            { type: '使用活跃', school: '星河第二小学', title: '教师参与度偏低', desc: '本月记录教师占比 51%，记录集中在少数班主任。', level: '中' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-4">
              <div className="mb-3 flex items-center justify-between"><Tag color={item.level === '高' ? 'red' : 'orangered'}>{item.level}</Tag><span className="text-xs font-black text-slate-400">{item.type}</span></div>
              <div className="text-sm font-black text-slate-900">{item.school}｜{item.title}</div>
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
  <div className="grid grid-cols-[1fr_360px] gap-5">
    <div className="space-y-5">
      <Alert type="warning" showIcon content="AI 分析仅作为辅助研判，不直接作为行政结论。所有建议都展示数据依据，并需要区级人员确认后进入督导台账。" />
      <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">区域薄弱点识别</span>}>
        <div className="space-y-4">
          {[
            { title: '美育活动参与不足', desc: '全区均值 69 分，低于五育均值 12.6 分；集中在部分学校。', action: '建议补充校际艺术展演与作品沉淀指标。', value: 69 },
            { title: '体育达标波动', desc: '体质健康数据同步异常叠加运动打卡覆盖不足，导致部分学校体育画像不稳定。', action: '建议先核查体育数据源与学校记录口径。', value: 74 },
            { title: '德育负向行为集中', desc: '近 7 日负向行为记录集中于七年级，主要匹配“遵纪守法/友爱同学”。', action: '建议开展班级治理专项督导。', value: 82 },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2"><Sparkles size={16} className="text-blue-600" /><span className="font-black text-slate-900">{item.title}</span></div>
                  <div className="mt-2 text-sm font-bold leading-6 text-slate-500">{item.desc}</div>
                  <div className="mt-3 rounded-xl bg-blue-50 px-3 py-2 text-sm font-bold leading-6 text-blue-700">{item.action}</div>
                </div>
                <div className="w-28 shrink-0 text-right">
                  <div className="text-[30px] font-black leading-none text-slate-900">{item.value}</div>
                  <div className="mt-1 text-xs font-bold text-slate-400">维度均值</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
    <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">模型解释</span>}>
      <div className="space-y-4 text-sm font-bold leading-6 text-slate-500">
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 font-black text-slate-800"><Radar size={16} /> 参与指标</div>
          德育、智育、体育、美育、劳育 5 个一级维度，当前使用方案文档指标作为初始版本。
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 font-black text-slate-800"><Database size={16} /> 数据来源</div>
          中台客观数据 + 行为识别积分流水 + 学校过程性评价数据。
        </div>
        <div className="rounded-2xl bg-slate-50 p-4">
          <div className="mb-2 flex items-center gap-2 font-black text-slate-800"><Lock size={16} /> 下钻边界</div>
          区级当前聚焦区域、学校等聚合数据；学生个人数据按授权机制分级管理。
        </div>
        <Button long type="primary">确认生成督导建议</Button>
      </div>
    </Card>
  </div>
);

const DataContent: React.FC = () => (
  <div className="space-y-5">
    <Alert type="warning" showIcon content="数据中台接口正在接入准备中，当前展示数据源管理、同步任务、质量台账与异常处理的标准工作流程。" />
    <div className="grid grid-cols-4 gap-4">
      {dataTasks.map((task) => (
        <div key={task.name} className="rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="font-black text-slate-900">{task.name}</div>
              <div className="mt-1 text-xs font-bold text-slate-400">{task.source}</div>
            </div>
            <Tag color={task.status === '正常' ? 'green' : 'red'}>{task.status}</Tag>
          </div>
          <div className="mt-5"><Progress percent={task.rate} size="small" color={task.status === '正常' ? '#00b42a' : '#f53f3f'} /></div>
          <div className="mt-3 text-xs font-bold text-slate-400">最近同步：{task.time}</div>
        </div>
      ))}
    </div>
    <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">数据治理台账</span>}>
      <Table
        pagination={false}
        rowKey="name"
        data={dataTasks}
        columns={[
          { title: '数据对象', dataIndex: 'name' },
          { title: '来源', dataIndex: 'source' },
          { title: '同步状态', dataIndex: 'status', render: (value: string) => <Tag color={value === '正常' ? 'green' : 'red'}>{value}</Tag> },
          { title: '成功率', dataIndex: 'rate', render: (value: number) => <span className="font-black text-slate-800">{value}%</span> },
          { title: '最近同步', dataIndex: 'time' },
          { title: '操作', render: (_: unknown, row: typeof dataTasks[number]) => <Button size="small" type={row.status === '异常' ? 'primary' : 'text'}>{row.status === '异常' ? '处理异常' : '查看台账'}</Button> },
        ]}
      />
    </Card>
  </div>
);

const ReportsContent: React.FC = () => (
  <div className="grid grid-cols-[1fr_360px] gap-5">
    <Card className="!rounded-2xl !border-slate-200" title={<span className="font-black text-slate-900">报告能力规划</span>}>
      <div className="grid grid-cols-2 gap-4">
        {['全区五育发展月报', '学校评价落实报告', '薄弱维度专题报告', '督导整改跟踪报告'].map((title, index) => (
          <div key={title} className="rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-blue-600 shadow-sm"><FileBarChart size={22} /></div>
            <div className="font-black text-slate-900">{title}</div>
            <div className="mt-2 text-sm font-bold leading-6 text-slate-500">支持按学期、学校、五育维度生成报告初稿。</div>
            <Button className="!mt-4" disabled={index > -1}>导出能力建设中</Button>
          </div>
        ))}
      </div>
    </Card>
    <Card className="!rounded-2xl !border-slate-200">
      <div className="flex h-full min-h-[320px] flex-col items-center justify-center text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-400"><Lock size={28} /></div>
        <div className="text-lg font-black text-slate-900">报告导出能力建设中</div>
        <div className="mt-2 max-w-[260px] text-sm font-bold leading-6 text-slate-500">围绕区域态势、指标运行、过程监管和 AI 研判，沉淀可导出、可归档的标准报告体系。</div>
      </div>
    </Card>
  </div>
);

interface RegionalPcAdminProps {
  screenOnly?: boolean;
  onLogout?: () => void;
}

const RegionalPcAdmin: React.FC<RegionalPcAdminProps> = ({ screenOnly = false, onLogout }) => {
  const [activeSection, setActiveSection] = useState<RegionalSection>('overview');

  const content = {
    overview: <AdminOverviewContent />,
    indicators: <IndicatorsContent />,
    supervision: <SupervisionContent />,
    ai: <AiContent />,
    data: <DataContent />,
    reports: <ReportsContent />,
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
                <div className="text-[18px] font-black tracking-[-0.02em]">区域五育评价平台</div>
                <div className="mt-0.5 text-xs font-bold text-slate-300">五育综合素质评价</div>
              </div>
            </div>
          </div>
          <nav className="flex-1 space-y-1 overflow-y-auto p-3">
            {(Object.keys(sectionMeta) as RegionalSection[]).map((section) => {
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
                onClick={() => window.open(`${window.location.origin}${window.location.pathname}?app=region-pc-screen`, '_blank')}
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

export default RegionalPcAdmin;
