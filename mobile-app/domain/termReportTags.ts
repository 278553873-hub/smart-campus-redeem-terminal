export const TERM_REPORT_PERIOD = { id: '2026-2027-first', label: '2026—2027学年 · 上学期' } as const;

export function normalizeTermReportTags(tags: readonly string[]): string[] {
  return tags.map(tag => tag.trim());
}

export function validateTermReportTags(tags: readonly string[]): string | null {
  const normalized = normalizeTermReportTags(tags);
  if (normalized.length !== 3 || normalized.some(tag => !tag)) return '请填写全部三个素养标签';
  if (normalized.some(tag => Array.from(tag).length > 8)) return '每个标签最多填写 8 个字';
  if (new Set(normalized).size !== 3) return '三个标签不能重复';
  return null;
}
