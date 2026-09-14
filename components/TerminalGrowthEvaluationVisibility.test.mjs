import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const growthSource = readFileSync(new URL('./GrowthView.tsx', import.meta.url), 'utf8');

assert.ok(
  appSource.includes('<ParentEvaluationVisibilityPreviewControls')
    && appSource.indexOf('<ParentEvaluationVisibilityPreviewControls') > appSource.indexOf('<TerminalLoginMethodPreviewControls'),
  '货柜机登录方式预览卡片下方应提供家长端评价展示配置。',
);
assert.ok(appSource.includes('terminalView === \'growth\' && (') || appSource.includes('terminalView === \'growth\' &&'), '家长端评价展示配置卡片只应在成长足迹中心详情页显示。');
assert.ok(appSource.includes('onViewChange={setTerminalView}'), '货柜机应把当前详情页同步给预览控件容器。');
assert.ok(appSource.includes('parentEvaluationVisibility={parentEvaluationVisibility}'), '货柜机成长页应接收家长端评价展示配置。');
assert.ok(growthSource.includes('canShowParentEvaluationSummary'), '成长足迹次数展示应使用共享统计可见性规则。');
assert.ok(growthSource.includes('canShowParentEvaluationDetails'), '成长足迹行为记录展示应使用共享明细可见性规则。');
assert.ok(growthSource.includes('showPositiveSummary &&'), '成长足迹应按配置控制表扬次数。');
assert.ok(growthSource.includes('showNegativeSummary &&'), '成长足迹应按配置控制待改进次数。');
assert.ok(growthSource.includes('showAnyEvaluationDetails &&'), '成长足迹应按配置控制行为记录入口和明细。');
assert.ok(growthSource.includes('visibleBehaviorRecords'), '成长足迹行为记录应使用过滤后的记录集合。');

console.log('terminal growth evaluation visibility assertions passed');
