import assert from 'node:assert/strict';
import {
  HOMEWORK_STATUS_META,
  buildHomeworkResults,
  getCurrentRosterVersions,
  getHomeworkAssignmentKey,
  getHomeworkConflict,
  getHomeworkStatusFromCode,
  normalizeHomeworkTitle,
  sortStudentsByNumber,
} from './homework.ts';

assert.equal(getHomeworkStatusFromCode('A'), 'excellent');
assert.equal(getHomeworkStatusFromCode('b'), 'good');
assert.equal(getHomeworkStatusFromCode(' C '), 'pass');
assert.equal(getHomeworkStatusFromCode('D'), 'pending_pass');
assert.equal(getHomeworkStatusFromCode('X'), 'missing');
assert.equal(getHomeworkStatusFromCode(''), null, '空白格必须保持未登记。');
assert.equal(getHomeworkStatusFromCode(' '), null, '纯空格不能识别为未交。');
assert.equal(getHomeworkStatusFromCode('O'), null, '未知符号不能猜测等级。');
assert.deepEqual(
  Object.values(HOMEWORK_STATUS_META).map(item => item.code),
  ['A', 'B', 'C', 'D', 'X'],
);

const sorted = sortStudentsByNumber([
  { studentNo: '10', name: '十号' },
  { studentNo: '2', name: '二号' },
  { studentNo: '1', name: '一号' },
]);
assert.deepEqual(sorted.map(item => item.studentNo), ['1', '2', '10']);

const results = buildHomeworkResults([
  { id: 'student-2', studentNo: '2', name: '二号', status: 'active' },
  { id: 'student-left', studentNo: '3', name: '离班', status: 'left' },
  { id: 'student-1', studentNo: '1', name: '一号', status: 'active' },
]);
assert.deepEqual(results.map(item => item.studentNo), ['1', '2']);
assert.deepEqual(results.map(item => item.classSequence), [1, 2]);
assert.ok(results.every(item => item.status === null), '新建作业时所有学生都应为尚未登记。');

const assignment = {
  id: 'assignment-1',
  schoolId: 'school-1',
  schoolName: '测试学校',
  classId: 'class-1',
  className: '2025级1班',
  subject: '数学',
  teacherName: '刘老师',
  date: '2026-08-21',
  title: ' 分数 应用题 ',
  source: 'manual',
  creatorName: '刘老师',
  createdAt: '2026-08-21T00:00:00.000Z',
  updatedAt: '2026-08-21T00:00:00.000Z',
  results: [
    { studentId: 'student-1', studentNo: '1', studentName: '一号', status: 'excellent' },
    { studentId: 'student-2', studentNo: '2', studentName: '二号', status: null },
  ],
};
assert.equal(normalizeHomeworkTitle(assignment.title), '分数应用题');
assert.equal(
  getHomeworkAssignmentKey(assignment),
  'school-1|2025级1班|数学|2026-08-21|分数应用题',
);
assert.equal(getHomeworkConflict({ ...assignment, id: 'assignment-2' }, [assignment]), 'duplicate');
assert.equal(
  getHomeworkConflict({
    ...assignment,
    id: 'assignment-3',
    results: assignment.results.map(result => result.studentId === 'student-2' ? { ...result, status: 'missing' } : result),
  }, [assignment]),
  'conflict',
);
assert.equal(getHomeworkConflict({ ...assignment, id: 'assignment-4', title: '另一份作业' }, [assignment]), 'none');

const currentRosters = getCurrentRosterVersions([
  { id: 'class-1-v1', classId: 'class-1', className: '2025级1班', version: 1 },
  { id: 'class-2-v1', classId: 'class-2', className: '2025级2班', version: 1 },
  { id: 'class-1-v2', classId: 'class-1', className: '2025级1班', version: 2 },
]);
assert.deepEqual(currentRosters.map(item => item.id), ['class-1-v2', 'class-2-v1']);

console.log('Homework domain assertions passed');
