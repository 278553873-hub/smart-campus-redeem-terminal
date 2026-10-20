/** 演示外壳中的班级报告布局配置，不改变报告数据口径。 */
export const CLASS_REPORT_SECTIONS = [
  { id: 'class-report-overview-title', label: '概况' },
  { id: 'record-distribution-title', label: '评价记录分布' },
  { id: 'education-score-title', label: '五育得分分布' },
  { id: 'education-event-title', label: '五育事件分布' },
  { id: 'ranking-title', label: '得分排行' },
  { id: 'attention-students-title', label: '需要关注' },
  { id: 'student-coverage-title', label: '学生覆盖情况' },
] as const;
export type ClassReportSectionId = typeof CLASS_REPORT_SECTIONS[number]['id'];
export interface ClassReportOutlineItem { id: ClassReportSectionId; visible: boolean }
export const createDefaultClassReportOutline = (): ClassReportOutlineItem[] => (
  CLASS_REPORT_SECTIONS.map(({ id }) => ({ id, visible: true }))
);

/** 取消后进入可选末尾，重新选择后进入已选末尾，保留两组现有顺序。 */
export function toggleClassReportSection(items: ClassReportOutlineItem[], id: ClassReportSectionId): ClassReportOutlineItem[] {
  const target = items.find(item => item.id === id);
  if (!target) return items;
  const selected = items.filter(item => item.visible && item.id !== id);
  const available = items.filter(item => !item.visible && item.id !== id);
  return target.visible
    ? [...selected, ...available, { ...target, visible: false }]
    : [...selected, { ...target, visible: true }, ...available];
}
