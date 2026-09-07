import assert from 'node:assert/strict';
import fs from 'node:fs';

const settingsSource = fs.readFileSync(new URL('./ParentEvaluationVisibilitySettings.tsx', import.meta.url), 'utf8');
const classListSource = fs.readFileSync(new URL('../../views/ClassListView.tsx', import.meta.url), 'utf8');

assert.ok(classListSource.includes("label: '家长端展示'"), '班级更多操作应包含家长端展示入口。');
assert.ok(classListSource.includes('canConfigureParentEvaluationVisibility'), '入口应使用统一班级权限规则。');
assert.match(classListSource, /<MobileBottomSheet[\s\S]*title="家长端评价展示"[\s\S]*<ParentEvaluationVisibilitySettings/, '家长端展示应在单个底部弹窗内直接配置。');
assert.ok(settingsSource.includes('正向评价'), '弹窗应直接展示正向评价设置。');
assert.ok(settingsSource.includes('负向评价'), '弹窗应直接展示负向评价设置。');
assert.ok(settingsSource.includes("{ value: 'hidden', label: '不展示' }"), '应提供不展示选项。');
assert.ok(settingsSource.includes("{ value: 'summary', label: '仅统计' }"), '应提供仅统计选项。');
assert.ok(settingsSource.includes("{ value: 'summaryAndDetails', label: '统计和明细' }"), '应提供统计和明细选项。');
assert.equal((settingsSource.match(/<CompactSegmentedControl/g) ?? []).length, 2, '正负向选项应在同一弹窗直接展示。');
assert.ok(!settingsSource.includes('MobileBottomSheet'), '配置内容不应再嵌套弹窗。');
assert.ok(!settingsSource.includes('已保存'), '配置后不应显示已保存提示。');

console.log('Parent evaluation visibility settings assertions passed');
