import assert from 'node:assert/strict';
import { formatPrincipalReportDataRange } from './principalPeriodicReport.ts';

const cases = [
  ['2026.07.13 - 2026.07.19', '7月13日-19日'],
  ['2026.06.01 - 2026.06.30', '6月'],
  ['2026.02.01 - 2026.02.28', '2月'],
  ['2026.06.29 - 2026.07.05', '6月29日-7月5日'],
  ['2025.12.29 - 2026.01.04', '12月29日-1月4日'],
];

for (const [periodLabel, expected] of cases) {
  assert.equal(
    formatPrincipalReportDataRange(periodLabel),
    expected,
    `数据周期 ${periodLabel} 应展示为老师能直接读懂的口径`,
  );
}

assert.equal(formatPrincipalReportDataRange(''), '', '空周期应原样返回，不造出脏文案');
assert.equal(formatPrincipalReportDataRange('2026年7月'), '2026年7月', '无法解析的周期应原样返回');

console.log('principalPeriodicReport assertions passed');
