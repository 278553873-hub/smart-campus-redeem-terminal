import assert from 'node:assert/strict';
import { B_END_SCHOOL_OPTIONS, findBEndSchools } from './teacherSchoolDirectory.ts';

assert.equal(B_END_SCHOOL_OPTIONS.length, 3, 'B端学校清单应来自已有的学校空间');
assert.deepEqual(
  B_END_SCHOOL_OPTIONS.map(school => school.name).sort(),
  ['成都七中初中附属小学', '星河实验学校', '青禾实验小学'].sort(),
  '个人空间和协作空间不应进入B端学校清单',
);

assert.deepEqual(findBEndSchools('七中').map(school => school.name), ['成都七中初中附属小学']);
assert.deepEqual(findBEndSchools('  星河  ').map(school => school.name), ['星河实验学校']);
assert.deepEqual(findBEndSchools('成 都 七 中').map(school => school.name), ['成都七中初中附属小学']);
assert.deepEqual(findBEndSchools('实验').map(school => school.name).sort(), ['星河实验学校', '青禾实验小学'].sort());
assert.deepEqual(findBEndSchools('1'), []);
assert.deepEqual(findBEndSchools(''), []);
assert.deepEqual(findBEndSchools('不存在的学校'), []);

console.log('teacherSchoolDirectory assertions passed');
