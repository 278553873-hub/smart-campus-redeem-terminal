/** 用户确认：所有学生入口均使用吴浩的同一份示例报告，修改按学校与学生隔离。 */
export const STUDENT_INITIAL_IMAGING_REPORT = {
  id: 'student-initial-imaging-2026-10-30',
  title: '学生初成像（2026年10月30日）',
  date: '2026-10-30',
  studentName: '吴浩',
} as const;

export function initialImagingReportScope(spaceId: string, studentId: string) {
  return JSON.stringify([spaceId, studentId, STUDENT_INITIAL_IMAGING_REPORT.id]);
}

export function isInitialImagingReportInPeriod(startDate: string, endDate: string) {
  return startDate <= STUDENT_INITIAL_IMAGING_REPORT.date && STUDENT_INITIAL_IMAGING_REPORT.date <= endDate;
}
