import type {
  AssistantReportAction,
  AssistantReportCard,
  AssistantReportDocument,
  AssistantReportInsight,
} from './assistantReport';
import { ASSISTANT_REPORT_SCHEMA_VERSION, parseAssistantReportDocument } from './assistantReport';
import type { WeeklyActionAdviceReport } from '../data/weeklyActionAdvice';
import type { TeacherEvaluationReviewReport } from '../data/teacherEvaluationReview';
import type { PrincipalPeriodicReportContent } from '../data/principalPeriodicReports';
import type { PrincipalTermReportContent } from '../data/principalTermReport';
import type { SchoolTermConfig } from './principalTermReport';

const AI_NOTICE = '内容由AI基于已授权的评价数据生成，仅供教育管理与工作复盘参考。';

const toTextActions = (items: string[]): AssistantReportAction[] => items.map((body, index) => ({
  id: `action-${index + 1}`,
  body,
}));

const compactCards = (cards: AssistantReportCard[]) => cards.filter(card => (
  card.kind === 'summary' || card.items.length > 0
));

export const adaptWeeklyActionAdviceReport = (report: WeeklyActionAdviceReport): AssistantReportDocument => ({
  schemaVersion: ASSISTANT_REPORT_SCHEMA_VERSION,
  reportId: report.id,
  reportType: 'headteacher_weekly',
  status: 'generated',
  scope: { id: report.classId, name: report.className },
  period: { label: report.dataRange, detail: `用于指导 ${report.actionWeekStart} 起的班级行动` },
  generatedAt: report.generatedAt,
  promptVersion: 'headteacher-weekly-v1',
  dataSnapshotId: `${report.id}-snapshot`,
  notice: AI_NOTICE,
  cards: compactCards([
    { key: 'actions', kind: 'actions', items: toTextActions(report.content.actions) },
    {
      key: 'student_insights',
      kind: 'insights',
      items: report.content.studentInsights.map((item, index): AssistantReportInsight => ({
        id: `student-${index + 1}`,
        title: `${item.studentNames.join('、')}：${item.finding}`,
        body: item.interpretation,
        evidence: item.evidence,
        verification: item.needVerify ? item.verificationFocus : undefined,
      })),
    },
    {
      key: 'class_insights',
      kind: 'insights',
      items: report.content.classInsights.map((item, index): AssistantReportInsight => ({
        id: `class-${index + 1}`,
        title: item.finding,
        body: item.implication,
        evidence: item.evidence,
        context: item.condition,
      })),
    },
    {
      key: 'evaluation_insights',
      kind: 'insights',
      items: report.content.evaluationInsights.map((item, index): AssistantReportInsight => ({
        id: `evaluation-${index + 1}`,
        title: `${item.teacherNames.join('、')}：${item.finding}`,
        body: item.implication,
        evidence: item.evidence,
      })),
    },
  ]),
});

export const adaptTeacherEvaluationReview = (report: TeacherEvaluationReviewReport): AssistantReportDocument => ({
  schemaVersion: ASSISTANT_REPORT_SCHEMA_VERSION,
  reportId: report.id,
  reportType: 'headteacher_monthly',
  status: 'generated',
  scope: { id: report.classId, name: report.className },
  period: { label: report.dataRange, detail: report.title },
  generatedAt: report.generatedAt,
  promptVersion: 'headteacher-monthly-v1',
  dataSnapshotId: `${report.id}-snapshot`,
  notice: AI_NOTICE,
  cards: compactCards([
    { key: 'actions', kind: 'actions', items: toTextActions(report.content.actions) },
    { key: 'review_summary', kind: 'summary', body: report.content.reviewOverview.join('\n') },
    {
      key: 'attention_insights',
      kind: 'insights',
      items: report.content.attentionInsights.map((body, index) => ({ id: `attention-${index + 1}`, body })),
    },
    {
      key: 'perspective_insights',
      kind: 'insights',
      items: report.content.perspectiveInsights.map((body, index) => ({ id: `perspective-${index + 1}`, body })),
    },
    {
      key: 'indicator_insights',
      kind: 'insights',
      items: report.content.indicatorAndExpressionInsights.map((body, index) => ({ id: `indicator-${index + 1}`, body })),
    },
  ]),
});

export const adaptPrincipalPeriodicReport = (
  report: PrincipalPeriodicReportContent,
  schoolName: string,
): AssistantReportDocument => ({
  schemaVersion: ASSISTANT_REPORT_SCHEMA_VERSION,
  reportId: `principal-${report.kind}-${report.generatedDate}`,
  reportType: report.kind === 'weekly' ? 'principal_weekly' : 'principal_monthly',
  status: 'generated',
  scope: { id: 'current-school', name: schoolName },
  period: { label: report.periodLabel, detail: report.periodDetail },
  generatedAt: report.generatedDate,
  promptVersion: `principal-${report.kind}-v1`,
  dataSnapshotId: `principal-${report.kind}-${report.periodLabel}`,
  notice: report.notice,
  cards: compactCards([
    { key: 'judgement', kind: 'summary', body: report.judgement },
    {
      key: 'actions',
      kind: 'actions',
      items: report.actions.map((item, index) => ({
        id: `action-${index + 1}`,
        title: item.title,
        body: item.detail,
        owner: item.owner,
        checkpoint: item.checkpoint,
        successMetric: item.metric,
      })),
    },
    { key: 'metrics', kind: 'metrics', items: report.metrics },
    {
      key: 'progress',
      kind: 'insights',
      items: report.progress.map((item, index) => ({
        id: `progress-${index + 1}`,
        title: item.title,
        body: item.detail,
        evidence: item.evidence,
      })),
    },
    {
      key: 'findings',
      kind: 'insights',
      items: report.findings.map((item, index) => ({
        id: `finding-${index + 1}`,
        title: item.title,
        body: item.detail,
        evidence: item.evidence,
      })),
    },
  ]),
});

export const adaptPrincipalTermReport = (
  report: PrincipalTermReportContent,
  schoolName: string,
  term: SchoolTermConfig,
): AssistantReportDocument => ({
  schemaVersion: ASSISTANT_REPORT_SCHEMA_VERSION,
  reportId: `principal-term-${term.id}`,
  reportType: 'principal_term',
  status: 'generated',
  scope: { id: 'current-school', name: schoolName },
  period: {
    label: `${term.startDate.replaceAll('-', '.')} - ${term.endDate.replaceAll('-', '.')}`,
    detail: term.name,
  },
  generatedAt: report.generatedDate,
  promptVersion: 'principal-term-v1',
  dataSnapshotId: `principal-term-${term.id}-snapshot`,
  notice: '本报告由AI基于本学期学校评价数据生成，仅供学校管理与工作复盘参考。',
  cards: [
    { key: 'conclusion', kind: 'summary', body: report.conclusion },
    {
      key: 'actions',
      kind: 'actions',
      items: report.actions.map((item, index) => ({
        id: `action-${index + 1}`,
        title: item.title,
        body: item.detail,
        owner: item.owner,
        successMetric: item.metric,
      })),
    },
    { key: 'metrics', kind: 'metrics', items: report.metrics },
    ...([
      ['usage', report.usage],
      ['highlights', report.highlights],
    ] as const).map(([key, items]) => ({
      key,
      kind: 'insights' as const,
      items: items.map((item, index) => ({
        id: `${key}-${index + 1}`,
        title: item.title,
        body: item.detail,
        evidence: item.evidence,
      })),
    })),
    {
      key: 'practices',
      kind: 'practices',
      items: report.practices.map((item, index) => ({
        id: `practice-${index + 1}`,
        title: item.title,
        context: item.context,
        body: item.detail,
        evidence: item.evidence,
        value: item.value,
      })),
    },
    ...([
      ['indicator_insights', report.indicatorInsights],
      ['concerns', report.concerns],
    ] as const).map(([key, items]) => ({
      key,
      kind: 'insights' as const,
      items: items.map((item, index) => ({
        id: `${key}-${index + 1}`,
        title: item.title,
        body: item.detail,
        evidence: item.evidence,
      })),
    })),
  ],
});

export const resolveAssistantReportDocument = (
  payload: unknown | undefined,
  fallback: AssistantReportDocument,
) => {
  if (payload === undefined) return { document: fallback, issues: [] as string[] };
  const result = parseAssistantReportDocument(payload);
  return result.success
    ? { document: result.data, issues: result.issues }
    : { document: null, issues: result.issues };
};
