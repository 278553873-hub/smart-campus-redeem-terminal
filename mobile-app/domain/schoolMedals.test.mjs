import assert from 'node:assert/strict';
import { getTeacherSpaceMenuPolicy } from './teacherSpaceAccess.ts';
import {
  canIssueSchoolMedals, createDefaultSchoolMedalSettings, getManuallyIssuableMedals, validateMedalCompositionRule,
} from './schoolMedals.ts';
import { issueSchoolMedals, readSchoolMedalSettings, updateSchoolMedalAvailability, writeSchoolMedalSettings } from '../data/schoolMedalStore.ts';

for (const role of ['administrator', 'leader', 'homeroomTeacher', 'teacher']) {
  const school = { id: 'test-school', type: 'school', role };
  assert.equal(getTeacherSpaceMenuPolicy(school).moreTools.includes('medalSettings'), ['administrator', 'leader'].includes(role));
}
assert.ok(!getTeacherSpaceMenuPolicy({ id: 'personal', type: 'personal', role: 'owner' }).moreTools.includes('medalSettings'));

const storage = new Map();
globalThis.window = Object.assign(new EventTarget(), {
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
});

const schoolId = 'test-school';
const homeroomTeacher = { id: 'homeroom', homeroomClassIds: ['class-one'], teachingAssignments: [] };
const subjectTeacher = { id: 'subject', homeroomClassIds: [], teachingAssignments: [{ classId: 'class-one' }] };
const [first, second, third] = createDefaultSchoolMedalSettings().availableMedalIds;
const customMedals = ['combined', 'advanced', 'school-reading'].map((id, index) => ({
  id, scope: 'school', name: `学校奖章${index + 1}`, icon: 'award', quantity: 1,
}));
const rule = { resultMedalId: 'combined', requiredMedalIds: [first, second] };
const advancedRule = { resultMedalId: 'advanced', requiredMedalIds: ['combined', third] };
const settings = {
  ...createDefaultSchoolMedalSettings(),
  subjectTeacherCanIssue: true,
  availableMedalIds: [first, second, third, ...customMedals.map(medal => medal.id)],
  customMedals,
  rules: [advancedRule, rule],
};
const defaults = readSchoolMedalSettings(schoolId);
assert.equal(defaults.enabled, true);
assert.equal(new Set(defaults.availableMedalIds).size, 19);
assert.equal(getManuallyIssuableMedals(defaults).length, 19);
assert.ok(canIssueSchoolMedals(defaults, homeroomTeacher, 'class-one'));
assert.ok(!canIssueSchoolMedals(defaults, subjectTeacher, 'class-one'));
assert.ok(!canIssueSchoolMedals({ ...settings, enabled: false }, homeroomTeacher, 'class-one'));
assert.ok(canIssueSchoolMedals(settings, homeroomTeacher, 'class-one'));
assert.ok(canIssueSchoolMedals(settings, subjectTeacher, 'class-one'));
assert.ok(!canIssueSchoolMedals(settings, subjectTeacher, 'class-two'));
assert.ok(!canIssueSchoolMedals({ ...settings, homeroomCanIssue: false }, homeroomTeacher, 'class-one'));
assert.ok(!canIssueSchoolMedals({ ...settings, subjectTeacherCanIssue: false }, subjectTeacher, 'class-one'));
assert.deepEqual(getManuallyIssuableMedals(settings).map(medal => medal.id), [first, second, third, 'school-reading']);
assert.match(validateMedalCompositionRule(settings, rule), /已有合成规则/);
assert.match(validateMedalCompositionRule(settings, { ...rule, requiredMedalIds: ['advanced', first] }, rule.resultMedalId), /循环依赖/);
assert.match(validateMedalCompositionRule(settings, { ...rule, requiredMedalIds: [first, '未启用'] }, rule.resultMedalId), /已启用/);
assert.equal(validateMedalCompositionRule(settings, rule, rule.resultMedalId), '');

writeSchoolMedalSettings(schoolId, settings);
assert.deepEqual(readSchoolMedalSettings(schoolId), settings);
assert.deepEqual(readSchoolMedalSettings('other-school'), defaults);
assert.deepEqual(await issueSchoolMedals(schoolId, homeroomTeacher, 'class-one', ['student-one', 'student-two'], [first, third]), []);
const rewards = await issueSchoolMedals(schoolId, subjectTeacher, 'class-one', ['student-one'], [second]);
assert.deepEqual(rewards.map(award => [award.studentId, award.medalId]), [['student-one', 'combined'], ['student-one', 'advanced']]);
assert.deepEqual(await issueSchoolMedals(schoolId, subjectTeacher, 'class-one', ['student-one'], [second]), []);
assert.deepEqual((await issueSchoolMedals(schoolId, subjectTeacher, 'class-one', ['student-two'], [second])).map(award => award.medalId), ['combined', 'advanced']);
await assert.rejects(issueSchoolMedals(schoolId, homeroomTeacher, 'class-two', ['student-one'], [first]), /权限/);
await assert.rejects(issueSchoolMedals(schoolId, homeroomTeacher, 'class-one', ['student-one'], ['combined']), /重新选择/);
const historicalAwards = storage.get('campus-school-medal-awards:v1:' + schoolId);
await updateSchoolMedalAvailability(schoolId, 'remove', [first, third, first]);
assert.deepEqual(getManuallyIssuableMedals(readSchoolMedalSettings(schoolId)).map(medal => medal.id), [second, 'school-reading']);
await assert.rejects(issueSchoolMedals(schoolId, homeroomTeacher, 'class-one', ['student-one'], [first]), /重新选择/);
await updateSchoolMedalAvailability(schoolId, 'add', [third, 'combined', first]);
assert.deepEqual(getManuallyIssuableMedals(readSchoolMedalSettings(schoolId)).map(medal => medal.id), [first, second, third, 'school-reading']);
assert.equal(storage.get('campus-school-medal-awards:v1:' + schoolId), historicalAwards);
writeSchoolMedalSettings(schoolId, { ...settings, enabled: false });
await assert.rejects(issueSchoolMedals(schoolId, homeroomTeacher, 'class-one', ['student-one'], [first]), /权限/);
assert.deepEqual(getManuallyIssuableMedals(readSchoolMedalSettings(schoolId)), []);
await updateSchoolMedalAvailability(schoolId, 'add', [second]);
assert.deepEqual(readSchoolMedalSettings(schoolId).availableMedalIds, [second]);
assert.deepEqual(readSchoolMedalSettings('other-school'), defaults);

console.log('School medal settings, permissions, storage and composition passed');
