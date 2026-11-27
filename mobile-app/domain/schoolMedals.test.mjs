import assert from 'node:assert/strict';
import { DEFAULT_SEMESTER_MEDALS, summarizeStudentMedalsByTerm } from './medal.ts';
import { getTeacherSpaceMenuPolicy } from './teacherSpaceAccess.ts';
import {
  canIssueSchoolMedals, createDefaultSchoolMedalSettings, getManuallyIssuableMedals, validateMedalCompositionRule,
} from './schoolMedals.ts';
import { deleteSchoolCustomMedal, issueSchoolMedals, readSchoolMedalSettings, readSchoolStudentMedals, readSchoolStudentMedalTerms, saveSchoolCustomMedal, updateSchoolMedalAvailability, writeSchoolMedalSettings } from '../data/schoolMedalStore.ts';
import { getSchoolDate } from './studentTerms.ts';

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
const excellentStudent = DEFAULT_SEMESTER_MEDALS.find(medal => medal.id === 'platform-excellent-student');
const semesterAwards = [
  ['2026-08-31T15:59:59Z', 2],
  ['2026-08-31T16:00:00Z', 1],
  ['2025-04-18', 3],
  ['2027-03-12', 4],
  ['invalid', 5],
].map(([awardedAt, quantity], index) => ({
  id: String(index), medalId: excellentStudent.id, studentId: 'student-one', quantity, awardedAt,
}));
const semesterMedals = summarizeStudentMedalsByTerm(semesterAwards, [excellentStudent], '2026-11-26');
assert.deepEqual(semesterMedals.map(({ term, medals }) => [term.value, medals[0]?.quantity ?? 0]), [
  ['2024-spring', 3], ['2025-fall', 0], ['2025-spring', 2], ['2026-fall', 1],
]);
assert.equal(semesterMedals.at(-1).term.isCurrent, true);
assert.deepEqual(summarizeStudentMedalsByTerm(semesterAwards.slice(0, 1), [excellentStudent], '2026-11-26').at(-1).medals, []);

const demoMedalSettings = createDefaultSchoolMedalSettings();
const demoStudentId = '2024101';
const demoSchoolId = 'school-star';
for (const [spaceId, studentId, settings] of [
  [demoSchoolId, demoStudentId, demoMedalSettings],
  [demoSchoolId, 'another-student', demoMedalSettings],
  ['other-school', 'another-student', demoMedalSettings],
  ['personal', 'another-student', null],
]) {
  const demoMedals = readSchoolStudentMedalTerms(spaceId, studentId, settings).at(-1).medals;
  assert.deepEqual(demoMedals.map(medal => medal.quantity), [1, 2, 3, 10]);
  assert.ok(demoMedals.every(medal => medal.awards.length === medal.quantity && medal.awards.every(award => (
    award.quantity === 1 && award.teacherName && Number.isFinite(Date.parse(award.awardedAt))
  ))));
  if (settings) assert.deepEqual(readSchoolStudentMedals(spaceId, studentId, settings), []);
}
const demoSchoolAwardsKey = 'campus-school-medal-awards:v1:' + demoSchoolId;
const awardDay = getSchoolDate(new Date());
storage.set(demoSchoolAwardsKey, JSON.stringify([
  { ...semesterAwards[0], studentId: demoStudentId, teacherId: 'teacher-liufei', awardedAt: `${awardDay}T09:00:00+08:00` },
  { ...semesterAwards[1], studentId: demoStudentId, teacherName: '李明', awardedAt: `${awardDay}T11:00:00+08:00` },
]));
const storedMedals = readSchoolStudentMedalTerms(demoSchoolId, demoStudentId, demoMedalSettings).at(-1).medals;
assert.equal(storedMedals.length, 1);
assert.equal(storedMedals[0].quantity, 3);
assert.deepEqual(storedMedals[0].awards.map(award => award.teacherName), ['李明', '刘飞']);
storage.delete(demoSchoolAwardsKey);

const homeroomTeacher = { id: 'homeroom', homeroomClassIds: ['class-one'], teachingAssignments: [] };
const subjectTeacher = { id: 'subject', name: '陈雨', homeroomClassIds: [], teachingAssignments: [{ classId: 'class-one' }] };
const [first, second, third] = createDefaultSchoolMedalSettings().availableMedalIds;
const customMedals = ['combined', 'advanced', 'school-reading'].map((id, index) => ({
  id, scope: 'school', name: `学校奖章${index + 1}`, icon: 'award', quantity: 1,
}));
const rule = { resultMedalId: 'combined', requiredMedalIds: [first, second] };
const advancedRule = { resultMedalId: 'advanced', requiredMedalIds: ['combined', third] };
const settings = {
  ...createDefaultSchoolMedalSettings(),
  availableMedalIds: [first, second, third, ...customMedals.map(medal => medal.id)],
  customMedals,
  rules: [advancedRule, rule],
};
const defaults = readSchoolMedalSettings(schoolId);
assert.equal(defaults.enabled, true);
assert.equal(new Set(defaults.availableMedalIds).size, 19);
assert.equal(getManuallyIssuableMedals(defaults).length, 19);
assert.ok(canIssueSchoolMedals(defaults, homeroomTeacher, 'class-one'));
assert.ok(canIssueSchoolMedals(defaults, subjectTeacher, 'class-one'));
assert.ok(!canIssueSchoolMedals({ ...settings, enabled: false }, homeroomTeacher, 'class-one'));
assert.ok(canIssueSchoolMedals(settings, homeroomTeacher, 'class-one'));
assert.ok(canIssueSchoolMedals(settings, subjectTeacher, 'class-one'));
assert.ok(!canIssueSchoolMedals(settings, subjectTeacher, 'class-two'));
assert.ok(!canIssueSchoolMedals({ ...settings, homeroomCanIssue: false }, homeroomTeacher, 'class-one'));
assert.ok(canIssueSchoolMedals({ ...settings, subjectTeacherCanIssue: false }, subjectTeacher, 'class-one'));
assert.ok(!canIssueSchoolMedals({ ...settings, enabled: false }, subjectTeacher, 'class-one'));

writeSchoolMedalSettings('legacy-school', { ...defaults, subjectTeacherCanIssue: false });
assert.deepEqual(readSchoolMedalSettings('legacy-school'), defaults);
await issueSchoolMedals('legacy-school', subjectTeacher, 'class-one', ['legacy-student'], [first]);
assert.equal(readSchoolStudentMedals('legacy-school', 'legacy-student', readSchoolMedalSettings('legacy-school'))[0].quantity, 1);
await assert.rejects(issueSchoolMedals('legacy-school', subjectTeacher, 'class-two', ['legacy-student'], [first]), /权限/);
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
assert.equal(rewards[0].teacherName, subjectTeacher.name);
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

await saveSchoolCustomMedal(schoolId, { name: '  悦读之星  ', icon: 'book' });
const created = readSchoolMedalSettings(schoolId).customMedals.find(medal => medal.name === '悦读之星');
assert.ok(created);
assert.equal(created.scope, 'school');
assert.ok(getManuallyIssuableMedals(readSchoolMedalSettings(schoolId)).some(medal => medal.id === created.id));
assert.deepEqual(readSchoolMedalSettings('other-school'), defaults);
await assert.rejects(saveSchoolCustomMedal(schoolId, { name: '悦读之星', icon: 'book' }), /同名/);
await assert.rejects(saveSchoolCustomMedal(schoolId, { name: '进步之星', icon: 'star' }), /同名/);
await assert.rejects(saveSchoolCustomMedal(schoolId, { name: ' ', icon: 'book' }), /奖章名称/);
await issueSchoolMedals(schoolId, homeroomTeacher, 'class-one', ['student-one'], [created.id]);
const awardsWithCustom = storage.get('campus-school-medal-awards:v1:' + schoolId);
assert.ok(JSON.parse(awardsWithCustom).some(award => award.medalId === created.id));
await saveSchoolCustomMedal(schoolId, { id: created.id, name: '校园悦读之星', icon: 'star', available: false });
assert.deepEqual(readSchoolMedalSettings(schoolId).customMedals.find(medal => medal.id === created.id), {
  ...created, name: '校园悦读之星', icon: 'star',
});
assert.ok(!getManuallyIssuableMedals(readSchoolMedalSettings(schoolId)).some(medal => medal.id === created.id));
assert.equal(storage.get('campus-school-medal-awards:v1:' + schoolId), awardsWithCustom);
await saveSchoolCustomMedal(schoolId, { id: created.id, name: '校园悦读之星', icon: 'star', available: true });
assert.ok(getManuallyIssuableMedals(readSchoolMedalSettings(schoolId)).some(medal => medal.id === created.id));

const beforeDeletion = readSchoolMedalSettings(schoolId);
const medalsBeforeDeletion = readSchoolStudentMedals(schoolId, 'student-one', beforeDeletion);
assert.ok(medalsBeforeDeletion.some(medal => medal.definition.id === created.id));
await deleteSchoolCustomMedal(schoolId, created.id);
const afterDeletion = readSchoolMedalSettings(schoolId);
assert.ok(!afterDeletion.customMedals.some(medal => medal.id === created.id));
assert.ok(!afterDeletion.availableMedalIds.includes(created.id));
assert.ok(!getManuallyIssuableMedals(afterDeletion).some(medal => medal.id === created.id));
assert.deepEqual(readSchoolStudentMedals(schoolId, 'student-one', afterDeletion), medalsBeforeDeletion);
assert.equal(storage.get('campus-school-medal-awards:v1:' + schoolId), awardsWithCustom);
assert.deepEqual(readSchoolMedalSettings('other-school'), defaults);
await assert.rejects(issueSchoolMedals(schoolId, homeroomTeacher, 'class-one', ['student-two'], [created.id]), /重新选择/);
await assert.rejects(saveSchoolCustomMedal(schoolId, { id: created.id, name: '失效编辑', icon: 'book' }), /已更新/);
await updateSchoolMedalAvailability(schoolId, 'add', [created.id]);
assert.deepEqual(readSchoolMedalSettings(schoolId), afterDeletion);
await Promise.all([deleteSchoolCustomMedal(schoolId, created.id), deleteSchoolCustomMedal(schoolId, created.id)]);
assert.deepEqual(readSchoolMedalSettings(schoolId), afterDeletion);
await deleteSchoolCustomMedal(schoolId, first);
assert.deepEqual(readSchoolMedalSettings(schoolId), afterDeletion);

await saveSchoolCustomMedal(schoolId, { name: '校园悦读之星', icon: 'heart' });
const recreated = readSchoolMedalSettings(schoolId).customMedals.find(medal => medal.name === '校园悦读之星');
assert.ok(recreated);
assert.notEqual(recreated.id, created.id);
assert.deepEqual(readSchoolStudentMedals(schoolId, 'student-one', readSchoolMedalSettings(schoolId)), medalsBeforeDeletion);

const beforeFailedDeletion = readSchoolMedalSettings(schoolId);
const originalSetItem = window.localStorage.setItem;
window.localStorage.setItem = () => { throw new Error('写入失败'); };
try {
  await assert.rejects(deleteSchoolCustomMedal(schoolId, recreated.id), /写入失败/);
} finally {
  window.localStorage.setItem = originalSetItem;
}
assert.deepEqual(readSchoolMedalSettings(schoolId), beforeFailedDeletion);

console.log('School medal settings, permissions, storage and composition passed');
