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
  eyebrow: string;
  reportTitle: string;
  periodLabel: string;
  periodDetail: string;
  generatedDate: string;
  loadingTitle: string;
  analysisSteps: string[];
  metricsTitle: string;
  metrics: PrincipalReportMetric[];
  judgementTitle: string;
  judgement: string;
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
  eyebrow: 'AI周度管理分析',
  reportTitle: '本周学校管理建议',
  periodLabel: '2026.07.13 - 2026.07.19',
  periodDetail: '用于指导 07.20 - 07.26 管理动作',
  generatedDate: '2026年7月20日',
  loadingTitle: '正在生成本周管理建议',
  analysisSteps: [
    '正在核对上周学校数据',
    '正在比较班级与教师参与变化',
    '正在筛选需要优先处理的信号',
    '正在生成本周管理建议',
  ],
  metricsTitle: '上周核心数据',
  metrics: [
    { label: '评价事件', value: '1,843', change: '较前周 +12%', detail: '记录节奏有所提升' },
    { label: '学生覆盖', value: '93.6%', change: '较前周 +2.8%', detail: '仍有52名学生未进入记录' },
    { label: '活跃教师', value: '29/56', change: '较前周 +4人', detail: '参与面继续扩大' },
    { label: '活跃班级', value: '15/16', change: '较前周 +1班', detail: '1个班级上周无新增记录' },
  ],
  judgementTitle: '本周优先判断',
  judgement: '学校整体记录节奏较前周改善，但参与增长仍主要来自少数高频班级。本周应先恢复无新增班级的记录节奏，再推动年级组复制已经验证有效的短时记录方法。',
  progress: [],
  findingsTitle: '上周关键信号',
  findings: [
    {
      title: '低频班级数量继续下降',
      detail: '前周4个低频班级中已有2个恢复到学校周记录中位数附近，年级组跟进开始产生可观察变化。',
      evidence: '低频班级由4个降至2个；其中2个班级活跃教师均增加1人。',
    },
    {
      title: '教师参与仍集中在少数班级',
      detail: '新增记录主要来自三年级12班、14班等高频使用班级，其他班级的任课教师参与仍不稳定。',
      evidence: '前4个班级贡献全校47%的原始评价事件，8个班级仅有1至2名教师记录。',
    },
    {
      title: '过程性学习记录占比偏低',
      detail: '课堂结果和行为提醒记录较充分，但任务过程、合作方法和改进轨迹进入记录的比例较低。',
      evidence: '过程性学习类记录占13.8%，低于近4周均值17.2%。',
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
      title: '补充过程性学习证据',
      detail: '提醒任课教师优先记录学生解决问题、合作分工或改进过程，不要求为覆盖指标而机械补录。',
      owner: '评价负责人、任课教师',
      checkpoint: '本周持续观察',
      metric: '过程性学习记录占比回升',
    },
  ],
  notice: '本报告由AI基于学校上一完整自然周的评价数据生成，仅供学校管理与工作复盘参考。',
};

export const PRINCIPAL_MONTHLY_REPORT_SAMPLE: PrincipalPeriodicReportContent = {
  kind: 'monthly',
  pageTitle: '上月学校复盘',
  eyebrow: 'AI月度运营复盘',
  reportTitle: '2026年6月学校运行复盘',
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

export const PRINCIPAL_PERIODIC_REPORTS: Record<PrincipalPeriodicReportKind, PrincipalPeriodicReportContent> = {
  weekly: PRINCIPAL_WEEKLY_REPORT_SAMPLE,
  monthly: PRINCIPAL_MONTHLY_REPORT_SAMPLE,
};
