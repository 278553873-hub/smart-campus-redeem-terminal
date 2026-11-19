import type { AssistantReportDocument, AssistantReportInsight, AssistantReportAction } from '../../mobile-app/domain/assistantReport';
import type { EducationKey, EvaluationScreenSnapshot } from './studentEvaluationScreenModel';

export const SCREEN_INSIGHT_INTERVAL = 30_000;
const DAY = 86_400_000;

export interface ScreenInsightItem {
  id: string;
  headline: string;
  summary: string;
  action?: { title: string; body: string };
  source: { reportId: string; findingId: string; actionId?: string; generatedAt: string; dataSnapshotId: string };
}

/** 固定按栏目组织页面。条目不参与轮播，大屏不改写报告内容。 */
export interface ScreenEducationInsight {
  id: 'growth' | 'observation';
  topic: string;
  items: ScreenInsightItem[];
  focusDimension?: EducationKey;
}

export interface ScreenInsightDigest {
  mode: 'demo';
  version: string;
  generatedAt: number;
  periodLabel?: string;
  insights: ScreenEducationInsight[];
}

/** 使用报告覆盖日期，不以生成日期或大屏当前日期代替。 */
export const formatScreenInsightPeriod = (label: string): string | undefined => {
  const range = label.trim().match(/^(\d{4})[./-](\d{1,2})[./-](\d{1,2})\s*[-–—~至]\s*(\d{4})[./-](\d{1,2})[./-](\d{1,2})$/);
  if (!range) return undefined;
  const values = range.slice(1).map(Number);
  const dates = [values.slice(0, 3), values.slice(3)];
  const times = dates.map(([year, month, day]) => Date.UTC(year, month - 1, day));
  if (dates.some(([year, month, day], index) => {
    const date = new Date(times[index]);
    return date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day;
  }) || times[0] > times[1]) return undefined;
  return dates.map(([, month, day]) => `${month}月${day}日`).join('–');
};

export const screenInsightVersion = (snapshot: EvaluationScreenSnapshot) => (
  `${snapshot.schoolName}:${Math.floor((snapshot.updatedAt + DAY / 3) / DAY)}:${JSON.stringify(snapshot.principalReports?.weekly ?? {})}`
);

const insights = (report: AssistantReportDocument, key: string): AssistantReportInsight[] => (
  report.cards.flatMap(card => card.key === key && card.kind === 'insights' ? card.items : [])
);
const actions = (report: AssistantReportDocument): AssistantReportAction[] => (
  report.cards.flatMap(card => card.kind === 'actions' ? card.items : [])
);
const source = (report: AssistantReportDocument, findingId: string, actionId?: string) => ({
  reportId: report.reportId, findingId, actionId, generatedAt: report.generatedAt, dataSnapshotId: report.dataSnapshotId,
});

export const projectPrincipalReport = (report: AssistantReportDocument): ScreenEducationInsight[] => {
  if (report.reportType !== 'principal_weekly') return [];
  const seen = new Set<string>();
  const highlights = insights(report, 'highlights').filter(item => {
    if (!item.title || !item.body || seen.has(item.id) || seen.has(`${item.title}:${item.body}`)) return false;
    seen.add(item.id);
    seen.add(`${item.title}:${item.body}`);
    return true;
  }).slice(0, 3).map(item => ({
    id: item.id, headline: item.title!, summary: item.body, source: source(report, item.id),
  }));
  // 旧版问题与建议尚无关联字段，只使用这组已核对的配对，不按下标或跨报告拼接。
  const finding = insights(report, 'findings').find(item => item.title === '有些孩子在小组任务中参与得不多');
  const action = actions(report).find(item => item.title === '学校可以先把每个孩子的分工安排清楚');
  const concerns: ScreenInsightItem[] = finding?.title && finding.body && action?.title && action.body ? [{
    id: finding.id, headline: finding.title, summary: finding.body,
    action: { title: action.title, body: action.body }, source: source(report, finding.id, action.id),
  }] : [];
  return [
    { id: 'growth', topic: '育人亮点', items: highlights },
    { id: 'observation', topic: '改进重点', items: concerns },
  ];
};

export const buildScreenInsightDigest = (snapshot: EvaluationScreenSnapshot): ScreenInsightDigest => {
  const weekly = snapshot.principalReports?.weekly;
  const report = weekly?.reportType === 'principal_weekly' && weekly.scope.name === snapshot.schoolName ? weekly : undefined;
  return {
    mode: 'demo', version: screenInsightVersion(snapshot), generatedAt: snapshot.updatedAt,
    periodLabel: report ? formatScreenInsightPeriod(report.period.label) : undefined,
    insights: report ? projectPrincipalReport(report) : [],
  };
};

/** 实时评价不改写报告；周报更新则立即刷新，不等第二天。 */
export const refreshScreenInsightDigest = (previous: ScreenInsightDigest | undefined, snapshot: EvaluationScreenSnapshot) => (
  previous?.version === screenInsightVersion(snapshot) ? previous : buildScreenInsightDigest(snapshot)
);
