import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const source = fs.readFileSync(new URL('./mobileDatePickerModel.ts', import.meta.url), 'utf8');
const code = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 } }).outputText;
const { isCalendarDate, shiftDate, calendarCells, setRangeEndpoint, dateRangePresets, daysInCalendarMonth, replaceCalendarPart, rangeError, dateAllowed } = await import(`data:text/javascript;base64,${Buffer.from(code).toString('base64')}`);
assert.equal(isCalendarDate('2024-02-29'), true);
for (const invalid of ['2025-02-29', '2026-02-31', '2026-13-01', '', '2026-1-1']) assert.equal(isCalendarDate(invalid), false);
assert.equal(shiftDate('2026-12-31', 1), '2027-01-01');
assert.equal(shiftDate('2024-03-01', -1), '2024-02-29');
assert.equal(shiftDate('2026-03-08', 1), '2026-03-09'); // 夏令时不影响日历日期。
const cells = calendarCells('2026-10');
assert.equal(cells.length, 42);
assert.equal(cells[0], '2026-09-28');
assert.equal(cells.filter(d => d.startsWith('2026-10')).length, 31);
assert.deepEqual(setRangeEndpoint({ start: '2026-12-01', end: '2026-12-20' }, 'start', '2026-12-25'), { start: '2026-12-25', end: '' });
assert.deepEqual(setRangeEndpoint({ start: '2026-12-01', end: '2026-12-20' }, 'start', '2026-12-10'), { start: '2026-12-10', end: '2026-12-20' });
assert.deepEqual(setRangeEndpoint({ start: '2026-12-31', end: '' }, 'end', '2027-01-03'), { start: '2026-12-31', end: '2027-01-03' });
const term = { start: '2026-09-01', end: '2027-01-31' };
assert.deepEqual(dateRangePresets('2026-10-14', term), [
  { label: '本周', value: { start: '2026-10-12', end: '2026-10-18' } },
  { label: '本月', value: { start: '2026-10-01', end: '2026-10-31' } },
  { label: '上周', value: { start: '2026-10-05', end: '2026-10-11' } },
  { label: '上月', value: { start: '2026-09-01', end: '2026-09-30' } },
  { label: '本学期', value: term },
]);
assert.deepEqual(dateRangePresets('2026-01-01')[0].value, { start: '2025-12-29', end: '2026-01-04' });
assert.deepEqual(dateRangePresets('2024-03-01')[3].value, { start: '2024-02-01', end: '2024-02-29' });
assert.equal(dateRangePresets('2026-10-18')[0].value.start, '2026-10-12'); // 周日仍属于当周。
assert.equal(dateRangePresets('2026-10-14').length, 4); // 不猜测未配置的学期。
assert.deepEqual(dateRangePresets('2026-10-14', term, '2026-10-01', '2026-10-14')[0].value, { start: '2026-10-12', end: '2026-10-14' });
assert.notEqual(rangeError(dateRangePresets('2026-10-14', term, '2026-10-01')[3].value), ''); // 完全越界的快捷项不可提交。
assert.equal(rangeError({ start: '2026-10-13', end: '2026-10-13' }), '');
assert.notEqual(rangeError({ start: '2026-10-14', end: '2026-10-13' }), '');
assert.notEqual(rangeError({ start: '2026-10-13', end: '' }), '');
assert.equal(dateAllowed('2026-10-13', '2026-10-01', '2026-10-13'), true);
assert.equal(dateAllowed('2026-10-14', '2026-10-01', '2026-10-13'), false);
assert.notEqual(rangeError({ start: '2026-09-30', end: '2026-10-13' }, '2026-10-01'), '');
console.log('日期逻辑验证通过：起止编辑、五个快捷范围、跨月跨年、闰年与上下限。');

const limits = ['1900-01-01', '2100-12-31'];
assert.equal(daysInCalendarMonth(2024, 2), 29);
assert.equal(daysInCalendarMonth(2026, 2), 28);
assert.equal(replaceCalendarPart('2026-01-31', 'month', 2, ...limits), '2026-02-28');
assert.equal(replaceCalendarPart('2024-02-29', 'year', 2025, ...limits), '2025-02-28');
assert.equal(replaceCalendarPart('2026-03-31', 'month', 4, ...limits), '2026-04-30');
assert.equal(replaceCalendarPart('2026-10-14', 'month', 9, '2026-10-01', '2026-10-31'), '2026-10-01');
assert.equal(replaceCalendarPart('2026-10-14', 'day', 25, '2026-10-01', '2026-10-20'), '2026-10-20');
console.log('日期滚轮联动通过：大小月、闰年和日期上下限。');
