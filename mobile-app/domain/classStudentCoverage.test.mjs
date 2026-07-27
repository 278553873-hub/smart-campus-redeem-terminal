import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./classStudentCoverage.ts', import.meta.url), 'utf8');

for (const required of [
  'buildStudentCoverageRows',
  'sortStudentCoverageRows',
  "StudentCoverageSortKey = 'evaluationCount' | 'teacherCount'",
  "StudentCoverageSortDirection = 'asc' | 'desc'",
  'evaluationCount === 0',
  "direction === 'asc'",
]) {
  assert.ok(source.includes(required), `学生覆盖统计缺少必要能力：${required}`);
}

assert.ok(source.includes('totalRecords - coveredCount'), '评价次数分配应保证已覆盖学生至少有1次评价。');
assert.ok(source.includes('Math.min(evaluationCount, teacherLimit'), '评价老师数不得超过评价次数或老师总数。');
assert.ok(source.includes("localeCompare(right.student.name, 'zh-Hans-CN')"), '同值学生应使用稳定的中文姓名排序。');

console.log('Class student coverage domain assertions passed');
