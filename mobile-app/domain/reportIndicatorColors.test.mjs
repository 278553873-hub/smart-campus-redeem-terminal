import assert from 'node:assert/strict';
import { buildReportIndicatorColorMap, REPORT_INDICATOR_COLORS } from './reportIndicatorColors.ts';

const ids = Array.from({ length: 10 }, (_, index) => `school-indicator-${index + 1}`);
for (const size of [5, 6, 10]) {
  const colors = buildReportIndicatorColorMap(ids.slice(0, size));
  assert.equal(new Set(colors.values()).size, size, `${size}育必须使用不重复的分类色`);
  assert.deepEqual([...colors.values()], REPORT_INDICATOR_COLORS.slice(0, size));
}
const fullMap = buildReportIndicatorColorMap(ids);
const filtered = [ids[7], ids[2], ids[9]];
assert.deepEqual(filtered.map(id => fullMap.get(id)), ['indicator8', 'indicator3', 'indicator10'], '过滤及展示顺序变化不应重新分配颜色');
console.log('班级报告五育、六育、十育及颜色稳定性检查通过');
