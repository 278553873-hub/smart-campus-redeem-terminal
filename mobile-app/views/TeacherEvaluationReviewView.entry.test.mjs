import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./TeacherEvaluationReviewView.tsx', import.meta.url), 'utf8');
const historySource = fs.readFileSync(new URL('./TeacherEvaluationReviewHistoryView.tsx', import.meta.url), 'utf8');
const dataSource = fs.readFileSync(new URL('../data/teacherEvaluationReview.ts', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const promptSource = fs.readFileSync(new URL('../../docs/班主任助理_我的评价复盘_内容生成提示词.md', import.meta.url), 'utf8');
const prdSource = fs.readFileSync(new URL('../../docs/PRD-班主任助理本周行动建议.md', import.meta.url), 'utf8');
const adapterSource = fs.readFileSync(new URL('../domain/assistantReportAdapters.ts', import.meta.url), 'utf8');
const contractSource = fs.readFileSync(new URL('../domain/assistantReport.ts', import.meta.url), 'utf8');
const footerSource = fs.readFileSync(new URL('../components/assistant-report/AssistantReportFooter.tsx', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

requireText(dataSource, "reviewMonth: '2026-06'", '当前评价复盘应固定分析上一个完整自然月。');
requireText(dataSource, 'Math.max(15, Math.ceil(Math.max(0, classSize) * 0.5))', '评价复盘记录门槛应随班级人数调整且最低15条。');
requireText(dataSource, "status: 'generated'", 'Mock 应包含已生成的月度复盘。');
requireText(dataSource, "status: 'insufficient'", 'Mock 应包含上月记录不足状态。');
requireText(dataSource, 'TEACHER_EVALUATION_REVIEW_HISTORY_BY_CLASS', '评价复盘应提供按班级组织的历史数据。');
requireText(dataSource, 'attentionInsights', 'AI报告应分析关注对象分布。');
requireText(dataSource, 'perspectiveInsights', 'AI报告应分析评价事件触发方式。');
requireText(dataSource, 'indicatorAndExpressionInsights', 'AI报告应分析指标使用和评价表达质量。');

requireText(viewSource, '正在整理上月评价记录', 'AI等待阶段应明确分析上月记录。');
requireText(viewSource, '正在分析关注对象', 'AI等待阶段应体现关注对象分析。');
requireText(viewSource, '正在核对指标与表达', 'AI等待阶段应体现指标与表达分析。');
for (const required of ["key: 'actions'", "key: 'review_summary'", "key: 'attention_insights'", "key: 'perspective_insights'", "key: 'indicator_insights'"]) {
  requireText(adapterSource, required, `评价复盘适配器缺少区块：${required}`);
}
requireText(contractSource, "cardOrder: ['actions', 'review_summary', 'attention_insights', 'perspective_insights', 'indicator_insights']", '评价复盘应优先展示下月记录建议。');
requireText(viewSource, '<AssistantReportCards', '评价复盘应使用共享报告卡片。');
requireText(footerSource, 'document.notice', '月度复盘应明确由AI生成并保留参考声明。');
requireText(viewSource, '<AssistantHistoryLink', '当前复盘应复用带文字的历史入口组件。');
requireText(viewSource, 'label="往期复盘"', '当前复盘历史入口应显示明确文案。');
requireText(viewSource, '<AssistantClassSwitchButton', '当前评价复盘标题栏应提供班级切换。');
requireText(viewSource, '<HomeroomClassPickerSheet', '当前评价复盘应复用带班班级选择组件。');
requireText(viewSource, 'setViewingExample(false);', '切班时应退出评价复盘示例并加载目标班级数据。');
requireText(viewSource, 'surface="transparent"', '当前评价复盘标题栏应保持透明。');
requireText(viewSource, '上月记录不足', '数据不足时应明确上月记录不足。');
requireText(viewSource, '查看报告示例', '数据不足时应允许查看有意义的报告示例。');
requireText(viewSource, '!loading && activeReport', '只有真实或示例报告生成后才能显示数据来源。');
forbidText(viewSource, '正向占比', '复盘正文不应退化为现有统计报表。');
forbidText(viewSource, '负向占比', '复盘正文不应退化为现有统计报表。');

requireText(historySource, 'title="往期复盘"', '历史页标题应为往期复盘。');
requireText(historySource, 'formatReviewMonth', '历史列表应按自然月展示。');
requireText(historySource, 'TeacherEvaluationReviewView', '历史记录应能进入只读详情。');
requireText(historySource, '<HomeroomClassPickerSheet', '历史页应支持切换带班班级。');

requireText(appSource, "import TeacherEvaluationReviewView from './views/TeacherEvaluationReviewView';", 'App 应导入评价复盘页面。');
requireText(appSource, "'teacher_evaluation_review'", 'App 页面枚举应包含评价复盘。');
requireText(appSource, "'teacher_evaluation_review_history'", 'App 页面枚举应包含往期复盘。');
requireText(appSource, 'data={activeEvaluationReview}', '评价复盘应按所选班级加载数据。');
requireText(appSource, 'activeClassId={headteacherAssistantClassId}', '评价复盘应复用班主任助理当前班级状态。');
requireText(appSource, 'onClassChange={setHeadteacherAssistantClassId}', '评价复盘切班应同步统一班级状态。');
requireText(appSource, "onOpenHistory={() => navigateTo('teacher_evaluation_review_history')}", '当前复盘应能进入历史页。');

requireText(promptSource, '上一个完整自然月', '提示词应固定分析上一个完整自然月。');
requireText(promptSource, '班级学生名单', '识别未被关注学生必须提供完整班级名单。');
requireText(promptSource, '学校指标体系', '提示词应接收学校完整指标体系。');
requireText(promptSource, '结构化统计', '精确计数应由后端提供结构化统计。');
requireText(promptSource, '不得只复述数量、占比或排名', 'AI输出必须超越统计报表。');
requireText(promptSource, '观察事实与评价判断', 'AI应分析评价表达是否越过证据边界。');
requireText(promptSource, 'indicator_and_expression_insights', '提示词应输出指标与表达洞察。');

requireText(prdSource, '上一个完整自然月', 'PRD 应明确评价复盘的数据周期。');
requireText(prdSource, '每个班级每个复盘月只生成一份', 'PRD 应定义月度报告唯一性。');
requireText(prdSource, '不把学生覆盖率作为生成门槛', '覆盖集中本身是洞察，不应阻止生成。');
requireText(prdSource, '评价表达质量', 'PRD 应明确AI洞察需要超越统计报表。');

console.log('TeacherEvaluationReviewView entry assertions passed');
