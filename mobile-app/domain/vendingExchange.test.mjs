import assert from 'node:assert/strict';
import {
  createVendingExchangeFilter, filterVendingExchangeRecords,
  getVendingExchangeAuthorizedClasses, scopeVendingExchangeRecords,
} from './vendingExchange.ts';
import { getTeacherSpaceMenuPolicy } from './teacherSpaceAccess.ts';

const school = { id: 'school-1', type: 'school', role: 'teacher' };
const classes = [
  { id: 'c1', gradeLevel: '一年级' }, { id: 'c2', gradeLevel: '一年级' },
  { id: 'c3', gradeLevel: '二年级' }, { id: 'c4', gradeLevel: '三年级' },
];
const teacher = { homeroomClassIds: ['c1'], deputyHomeroomClassIds: ['c2'], teachingAssignments: [{ classId: 'c3' }], gradeLeaderGrades: [] };
assert.deepEqual(getVendingExchangeAuthorizedClasses(school, teacher, classes).map(item => item.id), ['c1', 'c2', 'c3']);
assert.equal(getVendingExchangeAuthorizedClasses({ ...school, role: 'administrator' }, teacher, classes).length, 4);
assert.equal(getVendingExchangeAuthorizedClasses({ ...school, type: 'personal' }, teacher, classes).length, 0);
assert.deepEqual(getVendingExchangeAuthorizedClasses(school, { ...teacher, homeroomClassIds: [], deputyHomeroomClassIds: [], teachingAssignments: [], gradeLeaderGrades: ['三年级'] }, classes).map(item => item.id), ['c4']);

for (const role of ['teacher', 'homeroomTeacher', 'administrator', 'leader']) {
  assert.ok(getTeacherSpaceMenuPolicy({ ...school, role }).moreTools.includes('vendingExchange'));
}
assert.ok(!getTeacherSpaceMenuPolicy({ ...school, type: 'personal', role: 'owner' }).moreTools.includes('vendingExchange'));
assert.ok(!getTeacherSpaceMenuPolicy({ ...school, type: 'collaboration', role: 'collaborator' }).moreTools.includes('vendingExchange'));

const base = {
  schoolId: 'school-1', classId: 'c1', gradeName: '一年级', className: '2026级1班',
  studentId: 's1', studentName: '王小明', studentNo: '20260101',
  categoryId: 'stationery', categoryName: '文具', productName: '卡通橡皮',
  terminalDeviceId: 't1', terminalDeviceName: '人北华侨城一楼',
  status: 'completed', refundStatus: 'none',
};
const records = [
  { ...base, id: 'start', time: '2026-11-01 00:00:00' },
  { ...base, id: 'end', time: '2026-11-05 23:59:59' },
  { ...base, id: 'same-name', classId: 'c2', studentId: 's2', time: '2026-11-03 12:00:00' },
  { ...base, id: 'failed', categoryId: 'toy', status: 'failed', refundStatus: 'refunded', terminalDeviceId: 't2', time: '2026-11-02 10:00:00' },
  { ...base, id: 'last-month', time: '2026-10-31 23:59:59' },
  { ...base, id: 'next-day', time: '2026-11-06 00:00:00' },
  { ...base, id: 'other-school', schoolId: 'school-2', time: '2026-11-04 10:00:00' },
  { ...base, id: 'unauthorized', classId: 'c4', time: '2026-11-04 11:00:00' },
];
const scoped = scopeVendingExchangeRecords(records, { schoolId: school.id, classIds: ['c1', 'c2'] });
assert.equal(scoped.length, 6, '不得因班级编号相同混入其他学校，未授权班级也不进入选项和结果');
assert.equal(scopeVendingExchangeRecords(records, { schoolId: school.id, classIds: [] }).length, 0, '空权限不能视为全校');
const filter = createVendingExchangeFilter('2026-11-05');
const query = patch => filterVendingExchangeRecords(scoped, { ...filter, ...patch });
assert.deepEqual(query({}).map(item => item.id), ['end', 'same-name', 'failed', 'start'], '日期包含起止整天，按时间倒序');
assert.equal(query({ studentName: ' 小 明 ' }).length, 4, '只按姓名模糊搜索，忽略首尾及输入空格');
assert.equal(query({ studentName: '20260101' }).length, 0, '不按学号搜索');
assert.equal(query({ studentName: '卡通橡皮' }).length, 0, '不把姓名输入误用为商品搜索');
assert.equal(query({ classId: 'c2' }).length, 1, '同名学生可通过班级区分');
assert.deepEqual(query({ categoryId: 'toy', terminalDeviceId: 't2', status: 'failed' }).map(item => item.id), ['failed']);
assert.equal(query({ gradeName: '二年级' }).length, 0);
assert.equal(query({ categoryId: 'stationery', status: 'completed' }).length, 3, '重复兑换各自保留，不按学生合并');
assert.equal(query({ dateRange: { start: '2026-10-31', end: '2026-10-31' } }).length, 1);
assert.equal(records[0].id, 'start', '筛选排序不得改写原始记录顺序');
console.log('货柜兑换查询与权限校验通过');
