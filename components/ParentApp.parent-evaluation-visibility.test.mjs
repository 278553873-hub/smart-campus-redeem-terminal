import assert from 'node:assert/strict';
import fs from 'node:fs';

const parentSource = fs.readFileSync(new URL('./ParentApp.tsx', import.meta.url), 'utf8');
const previewControlSource = fs.readFileSync(new URL('./ParentEvaluationVisibilityPreviewControls.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const teacherAppSource = fs.readFileSync(new URL('../mobile-app/App.tsx', import.meta.url), 'utf8');
const evaluationScoreTokens = fs.readFileSync(new URL('../shared/evaluationScoreTokens.ts', import.meta.url), 'utf8');

assert.ok(teacherAppSource.includes('writeParentEvaluationVisibility(classId, settings)'), '教师端弹窗保存应同步班级展示配置。');
assert.ok(appSource.includes('<ParentEvaluationVisibilityPreviewControls'), '家长端右侧应提供评价展示演示控件。');
assert.ok(appSource.includes('parentEvaluationVisibility={parentEvaluationVisibility}'), '家长端页面应接收当前班级展示配置。');
assert.ok(parentSource.includes('classId: string;'), '绑定孩子资料应关联具体班级。');
assert.ok(parentSource.includes('canShowParentEvaluationSummary'), '家长端统计应使用共享可见性规则。');
assert.ok(parentSource.includes('canShowParentEvaluationDetails'), '家长端明细应使用共享可见性规则。');
assert.ok(parentSource.includes('selectedGrowthRangeRecords.filter(isRecordDetailVisible)'), '评价明细应按正负方向配置过滤。');
assert.ok(parentSource.includes('showPositiveSummary && dayRecords.some'), '日期正向标记应受配置控制。');
assert.ok(parentSource.includes('showNegativeSummary && dayRecords.some'), '日期负向标记应受配置控制。');
assert.ok(parentSource.includes("showAnyEvaluationDetails ? '查看明细' : '查看统计'"), '成长页入口应按配置指向统计或明细。');
assert.ok(!parentSource.includes("{showAnyEvaluationSummary && (\n          <ParentCard as=\"article\" className=\"p-4\">"), '成长首页总分卡不应随表扬和待改进配置一起隐藏。');
assert.ok(parentSource.includes('text-[length:var(--pm-font-size-compact)] font-bold text-[var(--pm-text-tertiary)]'), '成长首页应固定展示本月总分。');
assert.ok(parentSource.includes('{showAnyEvaluationSummary && (\n            <div className={`mt-4 grid ${summaryGridClass} gap-2`}>'), '成长首页仅应按配置控制表扬和待改进次数区。');
assert.ok(!parentSource.includes("screen === 'growthRecords' && !showAnyEvaluationSummary"), '评价全部隐藏时不应退出仍需展示总分的成长数据页。');
assert.ok(parentSource.includes('const selectedTotalScore = selectedGrowthRangeRecords.reduce'), '成长数据页总分应始终按该时段全部评价记录计算。');
assert.ok(parentSource.includes('const statisticColumnCount = 1 + Number(showPositiveSummary) + Number(showNegativeSummary)'), '成长数据页统计卡应为固定总分加当前可见次数项。');
assert.ok(parentSource.includes('评价明细'), '统计和明细模式应展示评价明细。');
assert.ok(parentSource.includes('>本月总分</span>'), '家长端月度汇总应固定使用家长易懂的“总分”。');
assert.ok(parentSource.includes('>总分</div>'), '家长端分时段统计应使用家长易懂的“总分”。');
assert.ok(!parentSource.includes('净得分'), '家长端不应继续展示“净得分”文案。');
assert.ok(evaluationScoreTokens.includes("negative: '#D10F3C'"), '家长端与教师端应共享鲜莓红扣分业务色。');
assert.ok(parentSource.includes("'--evaluation-score-negative': evaluationScoreSemantic.negative"), '家长端应从共享色源注入扣分业务变量。');
assert.equal((parentSource.match(/text-\[var\(--evaluation-score-negative\)\]/g) ?? []).length, 5, '家长端待改进统计与负分明细应统一使用扣分业务色。');
assert.equal((parentSource.match(/bg-\[var\(--evaluation-score-negative\)\]/g) ?? []).length, 4, '家长端日、周、月、学期标记应统一使用扣分业务色。');

const growthSummaryStart = parentSource.indexOf('const GrowthSummaryCards = ()');
const growthSummaryEnd = parentSource.indexOf('const GrowthCalendar = ()', growthSummaryStart);
const growthSummarySource = parentSource.slice(growthSummaryStart, growthSummaryEnd);
assert.ok(growthSummarySource.length > 0, '应能定位成长首页的总分卡片。');
assert.ok(!growthSummarySource.includes('最新在校表现'), '成长首页无论展示配置如何都不应展示最近在校表现。');
assert.ok(!growthSummarySource.includes('recentRecords'), '成长首页不应读取最近在校评价记录，评价明细统一在成长数据页查看。');
assert.ok(!growthSummarySource.includes('record.content'), '成长首页不应展示评价正文。');

const detailStart = parentSource.indexOf('id="parent-evaluation-details-title"');
const detailEnd = parentSource.indexOf('该时段暂无评价记录', detailStart);
const detailSource = parentSource.slice(detailStart, detailEnd);
assert.ok(detailSource.includes('{record.content}'), '家长端评价明细应展示评价正文。');
assert.ok(detailSource.includes('formatEvaluationTeacherName(record.teacher)'), '家长端评价明细应展示评价人并补全老师称谓。');
assert.ok(detailSource.includes('{record.time}'), '家长端评价明细应展示评价时间。');
assert.ok(detailSource.includes('record.score'), '家长端评价明细应展示得分。');
assert.ok(!detailSource.includes('record.dimension'), '家长端评价明细不应展示德育等指标维度。');
assert.ok(!detailSource.includes('record.title'), '家长端评价明细不应重复展示评价标题。');

for (const label of ['不展示', '仅统计', '统计和明细', '表扬', '待改进']) {
  assert.ok(previewControlSource.includes(label), `右侧演示控件缺少：${label}`);
}
assert.ok(!previewControlSource.includes('正向评价') && !previewControlSource.includes('负向评价'), '右侧演示控件应与教师端配置统一使用家长易懂文案。');
assert.ok(previewControlSource.includes('aria-pressed={selected}'), '演示控件应暴露当前选中状态。');

console.log('parent app evaluation visibility assertions passed');
