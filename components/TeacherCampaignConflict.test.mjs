import assert from 'node:assert/strict';
import fs from 'node:fs';

const dashboard = fs.readFileSync('components/TeacherDashboard.tsx', 'utf8');

assert.match(dashboard, /item\.edition !== campaignForm\.edition/, '冲突活动必须按投放版本筛选。');
assert.match(dashboard, /同版本、同时段存在/, '冲突提示应说明版本和时间共同重叠。');
assert.match(dashboard, /投放版本/, '冲突详情应展示投放版本。');
assert.match(dashboard, /展示频率/, '冲突详情应展示展示频率。');
assert.match(dashboard, /达到展示频率后自动展示下一个活动/, '冲突提示应说明活动达到频率后会继续展示下一条。');
assert.match(dashboard, /老师下次进入时可继续看到其他活动/, '仅一次活动应说明老师后续仍能看到其他活动。');

console.log('活动冲突提示断言通过');
