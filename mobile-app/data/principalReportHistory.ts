import type { SchoolTermConfig } from '../domain/principalTermReport';
import {
  PRINCIPAL_MONTHLY_REPORT_SAMPLE,
  PRINCIPAL_WEEKLY_REPORT_SAMPLE,
  type PrincipalPeriodicReportContent,
  type PrincipalPeriodicReportKind,
} from './principalPeriodicReports';
import {
  PRINCIPAL_TERM_REPORT_SAMPLE,
  type PrincipalTermReportContent,
} from './principalTermReport';

interface PrincipalReportHistoryBase {
  id: string;
  title: string;
  periodLabel: string;
  generatedDate: string;
  groupKey: string;
  groupLabel: string;
}

export interface PrincipalPeriodicReportHistoryItem extends PrincipalReportHistoryBase {
  kind: PrincipalPeriodicReportKind;
  report: PrincipalPeriodicReportContent;
}

export interface PrincipalTermReportHistoryItem extends PrincipalReportHistoryBase {
  kind: 'term';
  term: SchoolTermConfig;
  report: PrincipalTermReportContent;
}

export type PrincipalReportHistoryItem = PrincipalPeriodicReportHistoryItem | PrincipalTermReportHistoryItem;
export type PrincipalReportHistoryKind = PrincipalPeriodicReportKind | 'term';

const weeklyHistory: PrincipalPeriodicReportHistoryItem[] = [
  {
    id: 'principal-weekly-2026-07-13',
    kind: 'weekly',
    title: '7月13日-7月19日管理建议',
    periodLabel: '基于7月6日-7月12日学校数据',
    generatedDate: '2026年7月13日',
    groupKey: '2026-07',
    groupLabel: '2026年7月',
    report: {
      ...PRINCIPAL_WEEKLY_REPORT_SAMPLE,
      periodLabel: '2026.07.06 - 2026.07.12',
      periodDetail: '用于指导 07.13 - 07.19 管理动作',
      generatedDate: '2026年7月13日',
      metrics: [
        { label: '评价事件', value: '1,645', change: '较前周 +9.6%', detail: '记录节奏继续恢复' },
        { label: '学生覆盖', value: '90.8%', change: '较前周 +3.1%', detail: '仍有75名学生未进入记录' },
        { label: '活跃教师', value: '25/56', change: '较前周 +3人', detail: '新增参与来自3个年级' },
        { label: '活跃班级', value: '14/16', change: '较前周 +2班', detail: '2个班级上周无新增记录' },
      ],
      judgement: '学校周记录量和参与面继续恢复，但两个无新增班级仍缺少可分析材料。本周应先完成逐班核实，同时保持已恢复班级的连续记录节奏。',
    },
  },
  {
    id: 'principal-weekly-2026-07-06',
    kind: 'weekly',
    title: '7月6日-7月12日管理建议',
    periodLabel: '基于6月29日-7月5日学校数据',
    generatedDate: '2026年7月6日',
    groupKey: '2026-07',
    groupLabel: '2026年7月',
    report: {
      ...PRINCIPAL_WEEKLY_REPORT_SAMPLE,
      periodLabel: '2026.06.29 - 2026.07.05',
      periodDetail: '用于指导 07.06 - 07.12 管理动作',
      generatedDate: '2026年7月6日',
      metrics: [
        { label: '评价事件', value: '1,501', change: '较前周 -4.2%', detail: '跨月周记录略有回落' },
        { label: '学生覆盖', value: '87.7%', change: '较前周 -1.4%', detail: '覆盖下降集中在4个班级' },
        { label: '活跃教师', value: '22/56', change: '较前周持平', detail: '参与结构没有明显变化' },
        { label: '活跃班级', value: '12/16', change: '较前周 -1班', detail: '4个班级记录低于周目标' },
      ],
      judgement: '跨月周的记录节奏有所回落，变化主要集中在4个低频班级。现有数据不足以判断具体原因，本周应由年级组先核实场景和组织安排，再确定差异化跟进动作。',
    },
  },
];

const monthlyHistory: PrincipalPeriodicReportHistoryItem[] = [
  {
    id: 'principal-monthly-2026-05',
    kind: 'monthly',
    title: '2026年5月学校复盘',
    periodLabel: '2026.05.01 - 2026.05.31',
    generatedDate: '2026年6月1日',
    groupKey: '2026',
    groupLabel: '2026年',
    report: {
      ...PRINCIPAL_MONTHLY_REPORT_SAMPLE,
      reportTitle: '2026年5月学校运行复盘',
      periodLabel: '2026.05.01 - 2026.05.31',
      generatedDate: '2026年6月1日',
      metrics: [
        { label: '评价事件', value: '4,155', change: '环比 +11.2%', detail: '月内四周均有新增' },
        { label: '学生覆盖', value: '100%', change: '环比 +2.1%', detail: '16个班级完成覆盖' },
        { label: '活跃教师', value: '26/56', change: '环比 +4人', detail: '参与面开始扩大' },
        { label: '班级中位数', value: '225', change: '环比 +31条', detail: '6个班级仍低于中位数' },
      ],
      judgement: '5月已完成学生覆盖，学校记录节奏开始稳定；但6个低频班级和任课教师参与不足仍限制了材料的连续性与多样性，6月应优先解决这些结构性差异。',
    },
  },
  {
    id: 'principal-monthly-2026-04',
    kind: 'monthly',
    title: '2026年4月学校复盘',
    periodLabel: '2026.04.01 - 2026.04.30',
    generatedDate: '2026年5月1日',
    groupKey: '2026',
    groupLabel: '2026年',
    report: {
      ...PRINCIPAL_MONTHLY_REPORT_SAMPLE,
      reportTitle: '2026年4月学校运行复盘',
      periodLabel: '2026.04.01 - 2026.04.30',
      generatedDate: '2026年5月1日',
      metrics: [
        { label: '评价事件', value: '3,737', change: '首次完整月', detail: '形成月度分析基础' },
        { label: '学生覆盖', value: '97.9%', change: '首次完整月', detail: '17名学生未进入记录' },
        { label: '活跃教师', value: '22/56', change: '首次完整月', detail: '参与集中在班主任群体' },
        { label: '班级中位数', value: '194', change: '首次完整月', detail: '班级间差异较大' },
      ],
      judgement: '4月形成了首个完整自然月数据快照，能够识别覆盖、教师参与和班级记录密度差异；由于缺少上一完整月对照，本报告不判断改善或恶化，只提出下一月的核实重点。',
      progressTitle: '本月形成的基础',
    },
  },
];

const createHistoricalTermReport = (
  generatedDate: string,
  eventTotal: string,
  activeRate: string,
  conclusion: string,
  practiceContext: string,
): PrincipalTermReportContent => ({
  ...PRINCIPAL_TERM_REPORT_SAMPLE,
  generatedDate,
  conclusion,
  metrics: [
    { label: '累计评价', value: eventTotal, detail: '形成完整学期数据快照' },
    { label: '学生覆盖', value: '100%', detail: '试用班级全部完成覆盖' },
    { label: '活跃教师', value: activeRate, detail: '教师参与仍有提升空间' },
    { label: '活跃班级', value: '16/16', detail: '全部班级产生有效记录' },
  ],
  usage: [
    {
      title: '班级均已形成学期记录',
      detail: '全部试用班级均有学生进入评价记录，但不同班级的连续性和参与教师数量仍有差异。',
      evidence: `学期累计${eventTotal}条原始评价事件，试用班级覆盖率100%。`,
    },
    {
      title: '教师参与面仍需持续扩大',
      detail: '班主任提供了主要成长材料，部分任课教师开始补充跨学科课堂观察。',
      evidence: `学期活跃教师率为${activeRate}，跨学科记录来自多个独立课堂场景。`,
    },
  ],
  highlights: [
    {
      title: '连续使用班级形成可复盘样本',
      detail: '部分班级保持稳定周记录，并由多位教师共同提供过程材料，可继续提炼其组织方法。',
      evidence: '候选班级均覆盖多个自然周、多个教师和多个独立评价事件。',
    },
    {
      title: '跨学科观察来源开始增加',
      detail: '艺术、体育等任课教师补充了课堂参与和活动表现记录，扩展了班主任的观察视角。',
      evidence: '代表证据来自多个班级、多个学科和不同活动场景。',
    },
  ],
  practices: PRINCIPAL_TERM_REPORT_SAMPLE.practices.map((practice, index) => ({
    ...practice,
    context: index === 0 ? practiceContext : `${practiceContext} · 跨班课堂`,
    evidence: index === 0
      ? '代表班级连续多个自然周保持新增，并有多位教师参与记录。'
      : '跨班任课教师在多个独立课堂事件中提供了不同观察视角。',
  })),
  indicatorInsights: [
    {
      title: '五育记录已覆盖多个真实场景',
      detail: '评价材料已覆盖课堂学习、责任担当、劳动实践、艺术参与和体育活动等场景。',
      evidence: '学期指标快照覆盖多个一级指标和多类独立活动场景。',
    },
    {
      title: '部分低频指标仍缺少连续材料',
      detail: '部分过程性指标记录较少，当前只能说明材料不足，不能推断相应育人领域水平。',
      evidence: '低频指标候选均由后台分布统计识别，并已排除重复展开事件。',
    },
  ],
  concerns: [
    {
      title: '班级记录连续性存在差异',
      detail: '部分班级的记录集中在少数日期，尚不足以支持稳定的成长趋势判断。',
      evidence: '班级周活跃天数和参与教师数分布存在明显差异。',
    },
    {
      title: '教师参与仍集中在部分群体',
      detail: '学校尚未形成更广泛、稳定的多学科参与节奏，具体原因需要结合场景和组织安排核实。',
      evidence: `学期活跃教师率为${activeRate}，记录来源集中度仍较高。`,
    },
  ],
});

const termHistory: PrincipalTermReportHistoryItem[] = [
  {
    id: 'principal-term-2025-2026-1',
    kind: 'term',
    title: '2025-2026学年上学期报告',
    periodLabel: '2025.09.01 - 2026.01.20',
    generatedDate: '2026年1月25日',
    groupKey: '2025-2026',
    groupLabel: '2025-2026学年',
    term: {
      id: 'term-2025-2026-1',
      name: '2025-2026学年上学期',
      startDate: '2025-09-01',
      endDate: '2026-01-20',
    },
    report: createHistoricalTermReport(
      '2026年1月25日',
      '7,680',
      '51.79%',
      '上学期学校完成全部试用班级覆盖，并形成若干连续记录样本；班级记录密度和任课教师参与仍存在差异，下学期需要继续扩大多学科观察来源。',
      '2025年9月至2026年1月',
    ),
  },
  {
    id: 'principal-term-2024-2025-2',
    kind: 'term',
    title: '2024-2025学年下学期报告',
    periodLabel: '2025.02.17 - 2025.07.10',
    generatedDate: '2025年7月15日',
    groupKey: '2024-2025',
    groupLabel: '2024-2025学年',
    term: {
      id: 'term-2024-2025-2',
      name: '2024-2025学年下学期',
      startDate: '2025-02-17',
      endDate: '2025-07-10',
    },
    report: createHistoricalTermReport(
      '2025年7月15日',
      '6,942',
      '46.43%',
      '下学期学校已形成首批完整学期过程材料，学生覆盖基础较好；教师参与和指标分布仍较集中，后续应先提升记录连续性，再扩大使用范围。',
      '2025年2月至7月',
    ),
  },
];

export const PRINCIPAL_REPORT_HISTORY: Record<PrincipalReportHistoryKind, PrincipalReportHistoryItem[]> = {
  weekly: weeklyHistory,
  monthly: monthlyHistory,
  term: termHistory,
};
