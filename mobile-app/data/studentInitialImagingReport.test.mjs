import assert from 'node:assert/strict';
import test from 'node:test';
import { initialImagingReportScope, isInitialImagingReportInPeriod, STUDENT_INITIAL_IMAGING_REPORT } from './studentInitialImagingReport.ts';

test('初成像属于2026年秋季学期，标题与示例学生保持明确', () => {
  assert.equal(STUDENT_INITIAL_IMAGING_REPORT.title, '学生初成像（2026年10月30日）');
  assert.equal(STUDENT_INITIAL_IMAGING_REPORT.studentName, '吴浩');
  assert.equal(isInitialImagingReportInPeriod('2026-09-01', '2027-02-28'), true);
  assert.equal(isInitialImagingReportInPeriod('2026-03-01', '2026-08-31'), false);
});

test('不同学校与不同学生入口的修改分别保存，标识不会因连接符碰撞', () => {
  const keys = [initialImagingReportScope('school-a', 'student-1'), initialImagingReportScope('school-b', 'student-1'), initialImagingReportScope('school-a', 'student-2'), initialImagingReportScope('a:b', 'c'), initialImagingReportScope('a', 'b:c')];
  assert.equal(new Set(keys).size, keys.length);
});
