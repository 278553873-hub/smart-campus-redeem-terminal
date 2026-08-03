export type ReportSourceKey = 'all' | 'mine' | `teacher:${string}`;
export type ReportTimeRange = 'day' | 'week' | 'month' | 'semester' | 'custom';
export type ReportPeriodKey = Exclude<ReportTimeRange, 'custom'>;

export interface ReportSourceDefinition {
  key: ReportSourceKey;
  label: string;
  recordShareByPeriod: Record<ReportPeriodKey, number>;
}

export interface ReportSourceOption {
  key: ReportSourceKey;
  label: string;
  recordShare: number;
}

export const reportSourceDefinitions: ReportSourceDefinition[] = [
  { key: 'all', label: '全班汇总', recordShareByPeriod: { day: 1, week: 1, month: 1, semester: 1 } },
  { key: 'mine', label: '我的记录', recordShareByPeriod: { day: 0.62, week: 0.42, month: 0.31, semester: 0.28 } },
  { key: 'teacher:zhou-sanlun', label: '周三论', recordShareByPeriod: { day: 0, week: 0.32, month: 0.24, semester: 0.23 } },
  { key: 'teacher:zhang-yi', label: '张怡', recordShareByPeriod: { day: 0.38, week: 0.26, month: 0.18, semester: 0.18 } },
  { key: 'teacher:wang-lei', label: '王蕾', recordShareByPeriod: { day: 0, week: 0, month: 0.15, semester: 0.17 } },
  { key: 'teacher:chen-jia', label: '陈嘉', recordShareByPeriod: { day: 0, week: 0, month: 0.12, semester: 0.14 } },
];

export const getReportSourceOptions = (
  period: ReportPeriodKey,
  definitions: ReportSourceDefinition[] = reportSourceDefinitions,
): ReportSourceOption[] => definitions
  .map(source => ({
    key: source.key,
    label: source.label,
    recordShare: source.recordShareByPeriod[period],
  }))
  .filter(source => source.key === 'all' || source.key === 'mine' || source.recordShare > 0);

export const getReportSourceRecordCount = (
  source: ReportSourceOption,
  totalRecordCount: number,
): number => Math.max(0, Math.round(totalRecordCount * source.recordShare));

export const formatReportSourceRecordCount = (recordCount: number): string => (
  recordCount > 999 ? '999+' : String(Math.max(0, Math.round(recordCount)))
);

export const formatReportSourceRecordCountAria = (recordCount: number): string => (
  recordCount > 999 ? '999条以上' : `${Math.max(0, Math.round(recordCount))}条`
);

export const resolveReportSourceKey = (
  options: ReportSourceOption[],
  currentSourceKey: ReportSourceKey,
): ReportSourceKey => options.some(source => source.key === currentSourceKey)
  ? currentSourceKey
  : 'all';

export const getValidDaysInRange = (start: string, end: string): number | null => {
  if (!start || !end) return null;
  const startDate = new Date(start);
  const endDate = new Date(end);
  const difference = endDate.getTime() - startDate.getTime();
  if (!Number.isFinite(difference) || difference < 0) return null;
  return Math.ceil(difference / 86_400_000) + 1;
};

export const getPeriodForDays = (days: number): ReportPeriodKey => {
  if (days <= 1) return 'day';
  if (days <= 7) return 'week';
  if (days <= 31) return 'month';
  return 'semester';
};
