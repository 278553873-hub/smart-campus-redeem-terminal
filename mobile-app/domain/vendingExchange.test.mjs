import assert from 'node:assert/strict';
import {
  createVendingExchangeFilter, filterVendingExchangeRecords,
  getVendingExchangeAuthorizedClasses, groupVendingExchangeRecordsByMonth, scopeVendingExchangeRecords, VENDING_EXCHANGE_STATUS_LABELS,
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
  categoryId: 'stationery', categoryName: '文具', productId: 'eraser-1', productName: '卡通橡皮',
  terminalDeviceId: 't1', terminalDeviceName: '人北华侨城一楼',
  status: 'completed', refundStatus: 'none',
};
const records = [
  { ...base, id: 'start', time: '2026-11-01 00:00:00' },
  { ...base, id: 'end', time: '2026-11-05 23:59:59' },
  { ...base, id: 'same-name', classId: 'c2', studentId: 's2', productId: 'eraser-2', time: '2026-11-03 12:00:00' },
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
assert.deepEqual(filter.dateRange, { start: '', end: '2026-11-05' }, '默认从当前月份向前浏览，不截断历史月份，也不展示未来记录');
assert.equal(filter.status, '', '默认展示全部状态');
assert.deepEqual(VENDING_EXCHANGE_STATUS_LABELS, { completed: '兑换成功', failed: '兑换失败' }, '使用完整的兑换状态名称');
const query = patch => filterVendingExchangeRecords(scoped, { ...filter, ...patch });
assert.deepEqual(query({}).map(item => item.id), ['end', 'same-name', 'failed', 'start', 'last-month'], '默认包含成功、失败及历史月份，最新记录在最上面');
assert.equal(query({ studentName: ' 小 明 ' }).length, 5, '只按姓名模糊搜索，忽略首尾及输入空格');
assert.equal(query({ studentName: '20260101' }).length, 0, '不按学号搜索');
assert.equal(query({ studentName: '卡通橡皮' }).length, 0, '不把姓名输入误用为商品搜索');
assert.equal(query({ classId: 'c2' }).length, 1, '同名学生可通过班级区分');
assert.equal(query({ classIds: ['c2'] }).length, 1, '班级多选按班级编号筛选');
assert.deepEqual(query({ classIds: ['c1', 'c2'] }).map(item => item.id), query({}).map(item => item.id), '多个班级取并集，保持时间倒序');
assert.equal(query({ classIds: ['c4'] }).length, 0, '班级多选不得扩大授权范围');
assert.equal(query({ classIds: [] }).length, query({}).length, '空选择不限制班级');
assert.deepEqual(query({ categoryId: 'toy', terminalDeviceId: 't2', status: 'failed' }).map(item => item.id), ['failed']);
assert.deepEqual(query({ status: 'failed' }).map(item => item.id), ['failed'], '状态下拉切换失败时不混入成功记录');
assert.equal(query({ terminalDeviceId: 't2' }).length, 1, '货柜筛选默认包含失败记录');
assert.equal(query({ terminalDeviceId: 't2', status: 'completed' }).length, 0, '货柜与兑换状态共同筛选');
assert.deepEqual(query({ terminalDeviceId: 't1', productId: 'eraser-2' }).map(item => item.id), ['same-name'], '外层货柜筛选与弹窗商品筛选同时生效');
assert.equal(query({ gradeName: '二年级' }).length, 0);
assert.equal(query({ categoryId: 'stationery', status: 'completed' }).length, 4, '重复兑换各自保留，不按学生合并');
assert.deepEqual(query({ status: 'completed' }).map(item => item.id), ['end', 'same-name', 'start', 'last-month'], '兑换成功筛选不混入失败记录');
assert.equal(query({ dateRange: { start: '2026-11-01', end: '2026-11-05' } }).length, 4, '选择时间段时严格包含起止整天');
assert.deepEqual(query({ dateRange: { start: '', end: '2026-10-31' } }).map(item => item.id), ['last-month'], '选择历史月份后从该月向更早月份浏览');
assert.equal(query({ dateRange: { start: '2026-10-31', end: '2026-10-31' } }).length, 1);
assert.equal(records[0].id, 'start', '筛选排序不得改写原始记录顺序');
assert.deepEqual(query({ productId: 'eraser-2' }).map(item => item.id), ['same-name'], '按商品编号筛选，不混入同名商品');
assert.deepEqual(query({ categoryId: 'stationery', productId: 'eraser-1' }).map(item => item.id), ['end', 'start', 'last-month'], '选择具体商品时同时限定分类，并保留历史月份');
assert.equal(query({ categoryId: 'toy', productId: 'eraser-2' }).length, 0, '分类和商品条件不能相互覆盖');
assert.deepEqual(query({ productIds: ['eraser-2'] }).map(item => item.id), ['same-name'], '商品多选按编号过滤，同名商品不混入');
assert.deepEqual(query({ productIds: ['eraser-1', 'eraser-2'] }).map(item => item.id), query({}).map(item => item.id), '跨分类多选取并集，保留倒序');
assert.equal(query({ productIds: ['eraser-2'], terminalDeviceId: 't2' }).length, 0, '商品多选与货柜条件组合生效');
assert.deepEqual(query({ productIds: [] }).map(item => item.id), query({}).map(item => item.id), '空商品选择不限制商品');
assert.equal(createVendingExchangeFilter('2026-11-05').productId, '', '默认不限定具体商品');
const groups = groupVendingExchangeRecordsByMonth(query({}), '2026-11');
assert.deepEqual(groups.map(item => item.month), ['2026-11', '2026-10'], '列表按月份分组倒序展示');
assert.deepEqual(groups[0].records.map(item => item.id), ['end', 'same-name', 'failed', 'start'], '同月记录保持时间倒序且不合并重复兑换');
const noCurrentMonth = groupVendingExchangeRecordsByMonth(query({}).filter(item => item.id === 'last-month'), '2026-11');
assert.equal(noCurrentMonth[0].records.length, 0, '当前月为空时仍保留当前月的日期选择入口');
assert.equal(noCurrentMonth[1].records[0].id, 'last-month', '当前月为空不妨碍继续浏览历史月份');
assert.deepEqual(groupVendingExchangeRecordsByMonth([], '2026-11'), [{ month: '2026-11', records: [] }], '空结果也保留月份入口');
assert.deepEqual(groupVendingExchangeRecordsByMonth([
  ...query({}), { ...base, id: 'previous-year', time: '2025-12-31 23:59:59' },
], '2026-11').map(item => item.month), ['2026-11', '2026-10', '2025-12'], '跨年份按真实年月倒序');
console.log('货柜兑换查询与权限校验通过');
