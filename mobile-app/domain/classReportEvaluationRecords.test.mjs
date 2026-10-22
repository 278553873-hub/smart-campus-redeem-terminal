import assert from 'node:assert/strict';
import { buildClassReportEvaluationRecords, getClassReportRecordRange } from './classReportEvaluationRecords.ts';
const input = {
  classId: 'class-a', count: 8, positiveCount: 6,
  studentCounts: [
    { student: { id: 'a', name: '小明' }, evaluationCount: 5 },
    { student: { id: 'b', name: '小红' }, evaluationCount: 3 },
  ],
  paths: [['体育', '运动', '积极锻炼']], teachers: [{ id: 'mine', name: '李老师' }],
  start: '2026-10-19', end: '2026-10-21',
};
const records = buildClassReportEvaluationRecords(input);
assert.equal(records.length, 8);
assert.equal(records.filter(row => row.scoreChange > 0).length, 6);
assert.equal(records.filter(row => row.studentId === 'a').length, 5);
assert.equal(new Set(records.map(row => row.studentId)).size, 2);
assert.ok(records.every(row => row.evaluation_date >= input.start && row.evaluation_date.slice(0, 10) <= input.end));
assert.ok(records.every((row, index) => index === 0 || row.evaluation_date <= records[index - 1].evaluation_date));
assert.ok(records.every(row => row.teacherName === '李老师'));
assert.deepEqual(buildClassReportEvaluationRecords({ ...input, count: 0 }), []);
assert.deepEqual(getClassReportRecordRange('week', '2026-10-21'), { start: '2026-10-19', end: '2026-10-21' });
assert.deepEqual(getClassReportRecordRange('semester', '2026-01-03'), { start: '2025-09-01', end: '2026-01-03' });
assert.deepEqual(getClassReportRecordRange('month', '2026-10-21'), { start: '2026-10-01', end: '2026-10-21' });
console.log('班级报告评价明细数量、来源、覆盖人数、日期和倒序检查通过');
