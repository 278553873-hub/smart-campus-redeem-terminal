import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./ClassReportIndicatorDrilldown.tsx', import.meta.url), 'utf8');

for (const required of [
  'MobileBottomSheet',
  "ClassReportIndicatorDrilldownMode = 'score' | 'event'",
  'getClassReportIndicatorNode',
  '加分',
  '扣分',
  '总分',
  'aria-label="一级指标切换"',
  'aria-label="指标层级"',
  'min-h-[var(--tm-size-touch)]',
  'TeacherReportBarChart',
  'TeacherReportDonutChart',
  'ScoreLegend',
  'showLegend={false}',
  'scoreSeries',
  'eventData',
  "optionKey={`indicator-score-${path.join('-')}`}",
  "optionKey={`indicator-event-${path.join('-')}`}",
  'Math.max(360, visibleNodes.length * 84)',
  'onCategorySelect={hasNextLevel ? selectCategory : undefined}',
  'onRootChange?.(root.id)',
  'aria-pressed={selected}',
]) {
  assert.ok(source.includes(required), `五育下钻抽屉缺少必要能力：${required}`);
}

assert.ok(source.includes('node.children.length > 0'), '只有存在子级的指标才能继续下钻。');
assert.ok(source.includes('currentNode?.children ?? []'), '下钻抽屉应从选中的一级指标开始逐层披露，不重复一级概览。');
assert.ok(source.includes('roots.map(root =>') && source.includes('setPath([root.id])'), '抽屉顶部应支持直接切换一级指标。');
assert.ok(source.includes('pathNodes.length > 1') && source.includes('setPath(path.slice(0, 1))'), '只有进入三级时才应展示可返回二级的指标路径。');
assert.ok(source.includes("{ name: '加分'") && source.includes("{ name: '扣分'") && source.includes("{ name: '总分'"), '得分下钻应与一级概览保持相同的三系列柱状图。');
assert.ok(source.includes("visibleNodes.find(item => item.label === label)") && source.includes('selectNode(node)'), '点击得分柱组或指标名称应继续进入下一层。');
assert.ok(source.includes('value: node.metrics.eventCount') && source.includes('TeacherReportDonutChart'), '事件下钻应与一级概览保持环形图语义一致。');
assert.ok(!source.includes('ScoreHeader') && !source.includes('EventHeader'), '下钻主体不应继续使用表格表头。');
assert.ok(!source.includes('scoreScaleMax') && !source.includes('grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)]'), '得分下钻不应继续使用横向正负条。');
assert.ok(!source.includes('getBarWidth') && !source.includes('eventScaleMax'), '事件下钻不应继续使用横向数量条。');
assert.ok(!source.includes('点击指标') && !source.includes('操作说明'), '真实页面不应展示操作教学或逻辑说明。');

console.log('Class report indicator drilldown interaction assertions passed');
