export const ASSISTANT_REPORT_SCHEMA_VERSION = '1.0' as const;

export type AssistantReportType =
  | 'headteacher_weekly'
  | 'headteacher_monthly'
  | 'principal_weekly'
  | 'principal_monthly'
  | 'principal_term';

export type AssistantReportRole = 'headteacher' | 'principal';
export type AssistantReportStatus = 'generated' | 'partial';

export interface AssistantReportMetric {
  label: string;
  value: string;
  change?: string;
  detail?: string;
}

export interface AssistantReportInsight {
  id: string;
  title?: string;
  body: string;
  evidence?: string;
  interpretation?: string;
  verification?: string;
  context?: string;
  value?: string;
}

export interface AssistantReportAction {
  id: string;
  title?: string;
  body: string;
  owner?: string;
  checkpoint?: string;
  successMetric?: string;
}

export interface AssistantReportSummaryCard {
  key: string;
  kind: 'summary';
  body: string;
}

export interface AssistantReportMetricsCard {
  key: string;
  kind: 'metrics';
  items: AssistantReportMetric[];
}

export interface AssistantReportInsightsCard {
  key: string;
  kind: 'insights' | 'practices';
  items: AssistantReportInsight[];
}

export interface AssistantReportActionsCard {
  key: string;
  kind: 'actions';
  items: AssistantReportAction[];
}

export type AssistantReportCard =
  | AssistantReportSummaryCard
  | AssistantReportMetricsCard
  | AssistantReportInsightsCard
  | AssistantReportActionsCard;

export interface AssistantReportDocument {
  schemaVersion: typeof ASSISTANT_REPORT_SCHEMA_VERSION;
  reportId: string;
  reportType: AssistantReportType;
  status: AssistantReportStatus;
  scope: {
    id: string;
    name: string;
  };
  period: {
    label: string;
    detail?: string;
  };
  generatedAt: string;
  promptVersion: string;
  dataSnapshotId: string;
  notice: string;
  cards: AssistantReportCard[];
}

interface CardDefinition {
  kind: AssistantReportCard['kind'];
  title: string;
}

interface ReportDefinition {
  role: AssistantReportRole;
  cardOrder: string[];
  cards: Record<string, CardDefinition>;
}

export const ASSISTANT_REPORT_DEFINITIONS: Record<AssistantReportType, ReportDefinition> = {
  headteacher_weekly: {
    role: 'headteacher',
    cardOrder: ['actions', 'student_insights', 'class_insights', 'evaluation_insights'],
    cards: {
      actions: { kind: 'actions', title: '本周重点行动' },
      student_insights: { kind: 'insights', title: '需要关注的学生' },
      class_insights: { kind: 'insights', title: '班级信号' },
      evaluation_insights: { kind: 'insights', title: '评价视角' },
    },
  },
  headteacher_monthly: {
    role: 'headteacher',
    cardOrder: ['actions', 'review_summary', 'attention_insights', 'perspective_insights', 'indicator_insights'],
    cards: {
      actions: { kind: 'actions', title: '下月记录建议' },
      review_summary: { kind: 'summary', title: '本月评价画像' },
      attention_insights: { kind: 'insights', title: '关注对象' },
      perspective_insights: { kind: 'insights', title: '评价视角' },
      indicator_insights: { kind: 'insights', title: '指标与表达' },
    },
  },
  principal_weekly: {
    role: 'principal',
    cardOrder: ['judgement', 'actions', 'metrics', 'progress', 'findings'],
    cards: {
      judgement: { kind: 'summary', title: '本周优先判断' },
      actions: { kind: 'actions', title: '本周管理动作' },
      metrics: { kind: 'metrics', title: '上周核心数据' },
      progress: { kind: 'insights', title: '改善进展' },
      findings: { kind: 'insights', title: '上周关键信号' },
    },
  },
  principal_monthly: {
    role: 'principal',
    cardOrder: ['judgement', 'actions', 'metrics', 'progress', 'findings'],
    cards: {
      judgement: { kind: 'summary', title: '月度总体判断' },
      actions: { kind: 'actions', title: '下月管理动作' },
      metrics: { kind: 'metrics', title: '月度核心数据' },
      progress: { kind: 'insights', title: '改善进展' },
      findings: { kind: 'insights', title: '持续问题' },
    },
  },
  principal_term: {
    role: 'principal',
    cardOrder: ['conclusion', 'actions', 'metrics', 'usage', 'highlights', 'practices', 'indicator_insights', 'concerns'],
    cards: {
      conclusion: { kind: 'summary', title: '总体判断' },
      actions: { kind: 'actions', title: '下学期深化建议' },
      metrics: { kind: 'metrics', title: '学期核心数据' },
      usage: { kind: 'insights', title: '班级与教师使用情况' },
      highlights: { kind: 'insights', title: '优秀成果与亮点' },
      practices: { kind: 'practices', title: '代表性实践' },
      indicator_insights: { kind: 'insights', title: '五育与指标体系观察' },
      concerns: { kind: 'insights', title: '需要关注的问题' },
    },
  },
};

export const getAssistantReportRole = (reportType: AssistantReportType) => (
  ASSISTANT_REPORT_DEFINITIONS[reportType].role
);

export const getAssistantReportCardTitle = (reportType: AssistantReportType, key: string) => (
  ASSISTANT_REPORT_DEFINITIONS[reportType].cards[key]?.title ?? ''
);

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null && !Array.isArray(value)
);

const readString = (value: unknown, maxLength: number) => {
  if (typeof value !== 'string') return null;
  const normalized = value.trim();
  if (!normalized || normalized.length > maxLength) return null;
  return normalized;
};

const readOptionalString = (value: unknown, maxLength: number) => {
  if (value === undefined || value === null || value === '') return undefined;
  return readString(value, maxLength) ?? undefined;
};

const parseMetric = (value: unknown): AssistantReportMetric | null => {
  if (!isRecord(value)) return null;
  const label = readString(value.label, 24);
  const metricValue = readString(value.value, 32);
  if (!label || !metricValue) return null;
  return {
    label,
    value: metricValue,
    change: readOptionalString(value.change, 40),
    detail: readOptionalString(value.detail, 80),
  };
};

const parseInsight = (value: unknown, index: number): AssistantReportInsight | null => {
  if (!isRecord(value)) return null;
  const body = readString(value.body, 400);
  if (!body) return null;
  return {
    id: readOptionalString(value.id, 80) ?? `insight-${index}`,
    title: readOptionalString(value.title, 80),
    body,
    evidence: readOptionalString(value.evidence, 400),
    interpretation: readOptionalString(value.interpretation, 400),
    verification: readOptionalString(value.verification, 240),
    context: readOptionalString(value.context, 120),
    value: readOptionalString(value.value, 240),
  };
};

const parseAction = (value: unknown, index: number): AssistantReportAction | null => {
  if (!isRecord(value)) return null;
  const body = readString(value.body, 300);
  if (!body) return null;
  return {
    id: readOptionalString(value.id, 80) ?? `action-${index}`,
    title: readOptionalString(value.title, 80),
    body,
    owner: readOptionalString(value.owner, 100),
    checkpoint: readOptionalString(value.checkpoint, 100),
    successMetric: readOptionalString(value.successMetric, 120),
  };
};

const parseCard = (
  value: unknown,
  definition: ReportDefinition,
): AssistantReportCard | null => {
  if (!isRecord(value)) return null;
  const key = readString(value.key, 60);
  if (!key) return null;
  const cardDefinition = definition.cards[key];
  if (!cardDefinition || value.kind !== cardDefinition.kind) return null;

  if (cardDefinition.kind === 'summary') {
    const body = readString(value.body, 600);
    return body ? { key, kind: 'summary', body } : null;
  }

  if (!Array.isArray(value.items)) return null;
  if (cardDefinition.kind === 'metrics') {
    const items = value.items.slice(0, 6).map(parseMetric).filter((item): item is AssistantReportMetric => Boolean(item));
    return items.length > 0 ? { key, kind: 'metrics', items } : null;
  }
  if (cardDefinition.kind === 'actions') {
    const items = value.items.slice(0, 5).map(parseAction).filter((item): item is AssistantReportAction => Boolean(item));
    return items.length > 0 ? { key, kind: 'actions', items } : null;
  }

  const items = value.items.slice(0, 6).map(parseInsight).filter((item): item is AssistantReportInsight => Boolean(item));
  return items.length > 0 ? { key, kind: cardDefinition.kind, items } : null;
};

export type AssistantReportParseResult =
  | { success: true; data: AssistantReportDocument; issues: string[] }
  | { success: false; issues: string[] };

export const parseAssistantReportDocument = (input: unknown): AssistantReportParseResult => {
  const issues: string[] = [];
  if (!isRecord(input)) return { success: false, issues: ['报告响应不是对象'] };
  if (input.schemaVersion !== ASSISTANT_REPORT_SCHEMA_VERSION) issues.push('报告协议版本不受支持');

  const reportType = input.reportType;
  if (typeof reportType !== 'string' || !(reportType in ASSISTANT_REPORT_DEFINITIONS)) {
    issues.push('报告类型不受支持');
  }
  if (issues.length > 0) return { success: false, issues };

  const typedReportType = reportType as AssistantReportType;
  const definition = ASSISTANT_REPORT_DEFINITIONS[typedReportType];
  const reportId = readString(input.reportId, 120);
  const generatedAt = readString(input.generatedAt, 80);
  const promptVersion = readString(input.promptVersion, 80);
  const dataSnapshotId = readString(input.dataSnapshotId, 120);
  const notice = readString(input.notice, 240);
  const scope = isRecord(input.scope) ? input.scope : null;
  const period = isRecord(input.period) ? input.period : null;
  const scopeId = readString(scope?.id, 120);
  const scopeName = readString(scope?.name, 80);
  const periodLabel = readString(period?.label, 120);
  const status = input.status === 'generated' || input.status === 'partial' ? input.status : null;

  if (!reportId) issues.push('缺少报告编号');
  if (!generatedAt) issues.push('缺少生成时间');
  if (!promptVersion) issues.push('缺少提示词版本');
  if (!dataSnapshotId) issues.push('缺少数据快照编号');
  if (!notice) issues.push('缺少人工智能内容说明');
  if (!scopeId || !scopeName) issues.push('缺少报告对象');
  if (!periodLabel) issues.push('缺少报告周期');
  if (!status) issues.push('报告状态不受支持');
  if (!Array.isArray(input.cards)) issues.push('缺少报告区块');
  if (issues.length > 0) return { success: false, issues };

  const cards = (input.cards as unknown[])
    .slice(0, 12)
    .map(card => parseCard(card, definition))
    .filter((card): card is AssistantReportCard => Boolean(card));
  const uniqueCards = new Map(cards.map(card => [card.key, card]));
  const orderedCards = definition.cardOrder
    .map(key => uniqueCards.get(key))
    .filter((card): card is AssistantReportCard => Boolean(card));

  if (orderedCards.length === 0) return { success: false, issues: ['没有可展示的报告内容'] };
  if (orderedCards.length < (input.cards as unknown[]).length) issues.push('部分未知或无效区块已忽略');

  return {
    success: true,
    issues,
    data: {
      schemaVersion: ASSISTANT_REPORT_SCHEMA_VERSION,
      reportId: reportId!,
      reportType: typedReportType,
      status: status!,
      scope: { id: scopeId!, name: scopeName! },
      period: {
        label: periodLabel!,
        detail: readOptionalString(period?.detail, 160),
      },
      generatedAt: generatedAt!,
      promptVersion: promptVersion!,
      dataSnapshotId: dataSnapshotId!,
      notice: notice!,
      cards: orderedCards,
    },
  };
};
