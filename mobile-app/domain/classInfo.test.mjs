import assert from 'node:assert/strict';
import {
  buildClassName,
  formatClassCode,
  getAdmissionYearOptions,
  getCurrentAcademicYear,
  getGradeLevel,
  inferAdmissionYear,
  inferClassNumber,
  inferEducationStage,
} from './classInfo.ts';

const legacyClass = {
  id: 'c_2025_4',
  name: '2025级四班',
  classCode: '20250004',
  gradeLevel: '一年级',
  studentCount: 60,
  tags: [],
};

assert.equal(getCurrentAcademicYear(new Date('2026-07-29T00:00:00+08:00')), 2025);
assert.equal(getCurrentAcademicYear(new Date('2026-09-01T00:00:00+08:00')), 2026);
assert.equal(inferEducationStage(legacyClass), 'primary');
assert.equal(inferAdmissionYear(legacyClass), 2025);
assert.equal(inferClassNumber(legacyClass), 4);
assert.equal(getGradeLevel('primary', 2025, 2025), '一年级');
assert.equal(getGradeLevel('middle', 2024, 2025), '初二');
assert.equal(getGradeLevel('high', 2023, 2025), '高三');
assert.equal(getGradeLevel('middle', 2020, 2025), '初三');
assert.deepEqual(getAdmissionYearOptions('middle', 2025), [2026, 2025, 2024, 2023, 2022, 2021]);
assert.equal(buildClassName(2025, 4), '2025级4班');
assert.equal(formatClassCode('20250004'), '2025 0004');

console.log('Class info domain assertions passed');
