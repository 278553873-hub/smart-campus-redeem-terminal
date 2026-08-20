import assert from 'node:assert/strict';
import {
  extractSpokenStudentNumbers,
  parseSpokenStudentNumber,
  resolveStudentsBySpokenNumbers,
} from './classroom/classroomVoiceTargets.mjs';

assert.equal(parseSpokenStudentNumber('1'), 1);
assert.equal(parseSpokenStudentNumber('十'), 10);
assert.equal(parseSpokenStudentNumber('二十三'), 23);
assert.deepEqual(extractSpokenStudentNumbers('1号积极回答问题'), [1]);
assert.deepEqual(extractSpokenStudentNumbers('1号和3号同学主动发言'), [1, 3]);
assert.deepEqual(extractSpokenStudentNumbers('2025级1班的1号到7号同学积极举手'), [1, 2, 3, 4, 5, 6, 7]);
assert.deepEqual(extractSpokenStudentNumbers('一号至三号认真听讲'), [1, 2, 3]);
assert.deepEqual(extractSpokenStudentNumbers('2025级1班全班认真听讲'), []);

const demoStudents = [
  { id: 'student-1', name: '林燕姿', studentNo: '20250101' },
  { id: 'student-3', name: '王可欣', studentNo: '20250103' },
];
assert.deepEqual(
  resolveStudentsBySpokenNumbers('1号和3号积极回答问题', demoStudents).students.map(student => student.name),
  ['林燕姿', '王可欣'],
);
assert.deepEqual(resolveStudentsBySpokenNumbers('41号积极回答问题', demoStudents), { numbers: [41], students: [] });

console.log('SmartBigScreen voice student number checks passed.');
