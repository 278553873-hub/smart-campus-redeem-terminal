import { PRINCIPAL_WEEKLY_SCHOOL_HIGHLIGHTS } from './principalWeeklySchoolEvidence';

export type PrincipalPeriodicReportKind = 'weekly' | 'monthly';

export interface PrincipalReportMetric {
  label: string;
  value: string;
  change: string;
  detail: string;
}

export interface PrincipalReportFinding {
  title: string;
  detail: string;
  evidence: string;
}

export interface PrincipalReportAction {
  title: string;
  detail: string;
  owner: string;
  checkpoint: string;
  metric: string;
}

export interface PrincipalPeriodicReportContent {
  kind: PrincipalPeriodicReportKind;
  pageTitle: string;
  periodLabel: string;
  periodDetail: string;
  generatedDate: string;
  loadingTitle: string;
  analysisSteps: string[];
  metricsTitle: string;
  metrics: PrincipalReportMetric[];
  judgementTitle: string;
  judgement: string;
  highlights?: PrincipalReportFinding[];
  progressTitle?: string;
  progress: PrincipalReportFinding[];
  findingsTitle: string;
  findings: PrincipalReportFinding[];
  actionsTitle: string;
  actions: PrincipalReportAction[];
  notice: string;
}

export const PRINCIPAL_WEEKLY_REPORT_SAMPLE: PrincipalPeriodicReportContent = {
  kind: 'weekly',
  pageTitle: '本周管理建议',
  periodLabel: '2026.07.13 - 2026.07.19',
  periodDetail: '用于指导 07.20 - 07.26 管理动作',
  generatedDate: '2026年7月20日',
  loadingTitle: '正在生成本周管理建议',
  analysisSteps: [
    '正在核对上周学校数据',
    '正在分析各年级和不同活动中的表现',
    '正在筛选需要优先处理的信号',
    '正在生成本周管理建议',
  ],
  metricsTitle: '上周核心数据',
  metrics: [
    { label: '评价事件', value: '1,843', change: '', detail: '本报告周原始评价次数' },
    { label: '学生覆盖', value: '93.6%', change: '', detail: '仍有52名学生未进入记录' },
    { label: '活跃教师', value: '29/56', change: '', detail: '29位教师参与记录' },
    { label: '活跃班级', value: '15/16', change: '', detail: '1个班级上周无新增记录' },
  ],
  judgementTitle: '本周优先判断',
  judgement: '各年级的合作互助、自主尝试和公共事务参与均有具体表现。学校可重点协调中年级合作任务的分工，让更多学生承担实际工作。',
  // 全校输入与分析预设统一维护在principalWeeklySchoolEvidence，两端使用同一报告。
  highlights: PRINCIPAL_WEEKLY_SCHOOL_HIGHLIGHTS,
  progress: [],
  findingsTitle: '上周关键信号',
  findings: [
    {
      title: '仍有班级缺少日常观察记录',
      detail: '15个班级有评价记录，1个班级暂无新增。需要了解实际记录情况，不能把没有记录理解为学生没有表现。',
      evidence: '本报告周16个班级中15个有记录、1个暂无记录；没有使用前周数据或措施执行信息。',
    },
    {
      title: '教师参与仍集中在少数班级',
      detail: '新增记录主要来自三年级12班、14班等高频使用班级，其他班级的任课教师参与仍不稳定。',
      evidence: '前4个班级贡献全校47%的原始评价事件，8个班级仅有1至2名教师记录。',
    },
    {
      title: '有些孩子在小组任务中参与得不多',
      detail: '三、四年级4个班级都有类似记录：少数孩子完成了主要任务，其他孩子在等结果。孩子虽然坐在同一个小组里，实际参与的机会却不一样。',
      evidence: '三、四年级4个班级，固定观察120名学生，其中42名在多次合作任务中出现等待或旁观；由具体行为描述识别，不因缺少记录推断缺少参与。',
    },
  ],
  actionsTitle: '本周管理动作',
  actions: [
    {
      title: '恢复无新增班级的记录节奏',
      detail: '由年级组与该班班主任核实上周无新增记录的具体情况，选择一个真实课堂或活动场景完成记录恢复。',
      owner: '年级组、班主任',
      checkpoint: '周三前完成核实',
      metric: '无新增班级降为0',
    },
    {
      title: '复制高频班级的短时记录方法',
      detail: '安排12班教师用10分钟示范语音记录和指标确认流程，每个年级选择1个班级当周试用。',
      owner: '教务处、年级组',
      checkpoint: '周五前完成示范',
      metric: '至少3个班级完成试用',
    },
    {
      title: '学校可以先把每个孩子的分工安排清楚',
      detail: '教务处组织三、四年级试行轮换分工。两周内，各年级选2次已有的小组任务，让每名孩子承担一项具体工作，轮换讲解、操作和整理。老师结合日常记录，看看孩子是否真正完成了自己的分工。',
      owner: '教务处、年级组',
      checkpoint: '两周内完成2次任务观察',
      metric: '每名孩子是否承担并完成一项具体分工',
    },
  ],
  notice: '本报告由AI基于学校上一完整自然周的评价数据生成，仅供学校管理与工作复盘参考。',
};

export const PRINCIPAL_MONTHLY_REPORT_SAMPLE: PrincipalPeriodicReportContent = {
  kind: 'monthly',
  pageTitle: '上月学校复盘',
  periodLabel: '2026.06.01 - 2026.06.30',
  periodDetail: '完整自然月数据',
  generatedDate: '2026年7月20日',
  loadingTitle: '正在生成上月学校复盘',
  analysisSteps: [
    '正在汇总上月学校数据',
    '正在核对周度趋势与环比变化',
    '正在复盘上期管理动作结果',
    '正在生成上月学校复盘',
  ],
  metricsTitle: '月度核心数据',
  metrics: [
    { label: '评价事件', value: '4,920', change: '环比 +18.4%', detail: '连续4周保持新增' },
    { label: '学生覆盖', value: '100%', change: '环比持平', detail: '16个班级完成覆盖' },
    { label: '活跃教师', value: '31/56', change: '环比 +5人', detail: '参与面有所扩大' },
    { label: '班级中位数', value: '267', change: '环比 +42条', detail: '低频班级仍需跟进' },
  ],
  judgementTitle: '月度总体判断',
  judgement: '6月学校评价记录的连续性和教师参与面均有改善，上月提出的低频班级跟进已出现阶段结果；但不同班级之间的记录密度、任课教师参与和指标使用结构仍存在持续差异。',
  progressTitle: '改善进展',
  progress: [
    {
      title: '低频班级跟进取得阶段结果',
      detail: '6个低频班级中有3个恢复稳定周记录，其中2个班级连续3周保持新增。',
      evidence: '低频班级由6个降至3个，恢复班级月均活跃教师由1.3人增至3人。',
    },
    {
      title: '任课教师参与面扩大',
      detail: '音乐、体育和科学教师的跨班记录增加，学生成长材料不再只由班主任提供。',
      evidence: '跨班任课教师活跃人数由8人增至13人，相关记录环比增加36%。',
    },
  ],
  findingsTitle: '持续问题',
  findings: [
    {
      title: '班级记录密度差异仍然明显',
      detail: '完成学生覆盖不等于形成连续成长证据，部分班级的记录仍集中在少数日期和单一教师。',
      evidence: '最高与最低班级事件数相差8.6倍，3个班级超过70%的记录来自同一位教师。',
    },
    {
      title: '指标使用集中在少数宽泛类别',
      detail: '责任担当、课堂纪律等指标使用较多，合作过程、审美体验和探究方法的记录材料相对不足。',
      evidence: '前5个三级指标占全部记录61%，12个三级指标整月零覆盖。',
    },
  ],
  actionsTitle: '下月管理动作',
  actions: [
    {
      title: '对3个持续低频班级逐班核实',
      detail: '区分账号、流程、场景和组织安排等不同原因，按班形成一项最小改善动作，不做统一归因。',
      owner: '德育处、年级组',
      checkpoint: '7月第一周',
      metric: '每班形成核实结论和跟进动作',
    },
    {
      title: '推动任课教师共同提供成长证据',
      detail: '每个年级选择一个真实跨学科场景，由班主任和任课教师共同记录，验证协作流程。',
      owner: '教务处、年级组',
      checkpoint: '7月中旬复盘',
      metric: '跨班任课教师活跃人数继续提升',
    },
    {
      title: '按场景补充低频指标记录',
      detail: '围绕真实活动和课堂任务选择低频指标，不下达机械凑齐全部指标的数量要求。',
      owner: '评价负责人',
      checkpoint: '月底检查结构',
      metric: '零覆盖指标减少且证据场景真实',
    },
  ],
  notice: '本报告由AI基于学校上一个完整自然月的评价数据生成，仅供学校管理与工作复盘参考。',
};

/** 演示周报按中国时区的上一个完整自然周组织，正文继续复用同一份预设分析。 */
export const getPrincipalWeeklyReport = (now = Date.now()): PrincipalPeriodicReportContent => {
  const local = new Date(now + 8 * 60 * 60 * 1000);
  const today = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  const monday = today - ((local.getUTCDay() + 6) % 7) * 86_400_000;
  const dateLabel = (time: number) => new Date(time).toISOString().slice(0, 10).replaceAll('-', '.');
  const generated = new Date(monday);
  return {
    ...PRINCIPAL_WEEKLY_REPORT_SAMPLE,
    periodLabel: `${dateLabel(monday - 7 * 86_400_000)} - ${dateLabel(monday - 86_400_000)}`,
    periodDetail: `用于指导 ${dateLabel(monday)} - ${dateLabel(monday + 6 * 86_400_000)} 管理动作`,
    generatedDate: `${generated.getUTCFullYear()}年${generated.getUTCMonth() + 1}月${generated.getUTCDate()}日`,
  };
};

export const PRINCIPAL_PERIODIC_REPORTS: Record<PrincipalPeriodicReportKind, PrincipalPeriodicReportContent> = {
  weekly: getPrincipalWeeklyReport(),
  monthly: PRINCIPAL_MONTHLY_REPORT_SAMPLE,
};
