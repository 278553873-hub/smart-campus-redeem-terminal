import assert from 'node:assert/strict';
import {
  getPrincipalTermReportAvailability,
  getPrincipalTermReportKey,
} from './principalTermReport.ts';

const summerTerm = {
  id: 'term-2025-2026-2',
  name: '2025-2026学年下学期',
  startDate: '2026-02-23',
  endDate: '2026-07-15',
};

const tooEarly = getPrincipalTermReportAvailability(summerTerm, new Date(2026, 4, 31));
assert.equal(
  tooEarly.status,
  'too_early',
  '结束月份的前一个月之前不能生成',
);
assert.equal(
  tooEarly.message,
  '2025-2026学年下学期报告将于2026年6月1日起开放生成。',
  '未到时间时应明确提示最早可生成日期',
);
assert.equal(
  getPrincipalTermReportAvailability(summerTerm, new Date(2026, 5, 1)).status,
  'available',
  '结束月份的前一个月第一天应开放生成',
);
assert.equal(
  getPrincipalTermReportAvailability(summerTerm, new Date(2026, 6, 31)).status,
  'available',
  '结束月份最后一天仍可生成',
);
assert.equal(
  getPrincipalTermReportAvailability(summerTerm, new Date(2026, 7, 1)).status,
  'closed',
  '结束月份之后不应新生成报告',
);

const crossYearTerm = {
  id: 'term-2026-2027-1',
  name: '2026-2027学年上学期',
  startDate: '2026-09-01',
  endDate: '2027-01-20',
};
const crossYearWindow = getPrincipalTermReportAvailability(crossYearTerm, new Date(2026, 11, 1));
assert.equal(crossYearWindow.status, 'available', '跨年学期应在上一年12月开放');
assert.equal(crossYearWindow.eligibleStartDate, '2026-12-01');
assert.equal(crossYearWindow.eligibleEndDate, '2027-01-31');

const invalidTerm = {
  id: 'invalid',
  name: '错误学期',
  startDate: '2026-09-01',
  endDate: '2026-02-30',
};
assert.equal(getPrincipalTermReportAvailability(invalidTerm).status, 'invalid');
assert.equal(
  getPrincipalTermReportKey('school-star', summerTerm.id),
  'school-star:term-2025-2026-2:principal-term-report',
);

console.log('Principal term report availability assertions passed');
