import { normalizeTermReportTags, validateTermReportTags } from '../domain/termReportTags';

export function termReportTagKey(spaceId: string, studentId: string, periodId: string) {
  return `teacher-term-report-tags:v1:${JSON.stringify([spaceId, studentId, periodId])}`;
}

export function readTermReportTags(key: string): string[] | null {
  try {
    if (typeof window === 'undefined') return null;
    const value: unknown = JSON.parse(window.localStorage.getItem(key) ?? 'null');
    if (!Array.isArray(value) || !value.every(tag => typeof tag === 'string')) return null;
    return validateTermReportTags(value) ? null : normalizeTermReportTags(value);
  } catch {
    return null;
  }
}

export function saveTermReportTags(key: string, tags: readonly string[]) {
  const error = validateTermReportTags(tags);
  if (error) throw new Error(error);
  // 保存失败向上抛出，弹层保留草稿，不误报成功。
  window.localStorage.setItem(key, JSON.stringify(normalizeTermReportTags(tags)));
}
