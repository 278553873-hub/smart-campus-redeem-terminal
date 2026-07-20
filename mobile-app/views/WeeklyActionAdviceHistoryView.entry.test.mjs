import fs from 'node:fs';

const historySource = fs.readFileSync(new URL('./WeeklyActionAdviceHistoryView.tsx', import.meta.url), 'utf8');
const dataSource = fs.readFileSync(new URL('../data/weeklyActionAdvice.ts', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const pickerSource = fs.readFileSync(new URL('../components/HomeroomClassPickerSheet.tsx', import.meta.url), 'utf8');
const prdSource = fs.readFileSync(new URL('../../docs/PRD-班主任助理本周行动建议.md', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText(appSource, "import WeeklyActionAdviceHistoryView from './views/WeeklyActionAdviceHistoryView';", 'App 应导入往期建议页面。');
requireText(appSource, "'weekly_action_history'", 'App 页面状态应包含往期建议。');
requireText(appSource, "{currentView === 'weekly_action_history' && (", 'App 应渲染往期建议页面。');
requireText(appSource, 'classes={homeroomClasses}', '往期建议应接收全部带班班级。');
requireText(appSource, 'initialClassId={weeklyAdviceClassId}', '往期建议应默认显示当前报告班级。');

requireText(historySource, '往期建议', '历史页面名称应精简为往期建议。');
requireText(historySource, 'WEEKLY_ACTION_ADVICE_HISTORY_BY_CLASS', '历史页面应按班级读取往期建议。');
requireText(historySource, 'setSelectedReport(report)', '点击历史项应进入详情。');
requireText(historySource, 'simulateLoading={false}', '历史详情应直接展示，不重复模拟生成。');
requireText(historySource, "document.getElementById('main-scroll-container')", '历史列表与详情切换时应回到页面顶部。');
requireText(historySource, "title.replace(/行动建议$/, '')", '历史卡片应只展示精确日期，不重复页面名称。');
requireText(historySource, 'groupReportsByMonth', '历史建议应按月分组。');
requireText(historySource, 'second.actionWeekStart.localeCompare(first.actionWeekStart)', '历史建议应按建议开始时间倒序排列。');
requireText(historySource, 'getHistoryMonthGroup(report.actionWeekStart)', '月份分组不应依赖实际生成时间。');
requireText(historySource, '`${year}年${normalizedMonth}月`', '月份节点应同时展示年份，支持跨年查找。');
requireText(historySource, '-top-5 bottom-9 left-[5px] w-px bg-slate-200', '历史分组应使用克制的细时间线。');
requireText(historySource, '基于{report.dataRange}评价记录', '历史卡片应只补充精简的评价记录来源。');
requireText(historySource, 'min-h-[72px]', '历史卡片应保持紧凑稳定高度。');
requireText(historySource, 'classes.length > 1', '多个带班班级时历史页应提供班级切换。');
requireText(historySource, 'setActiveClassId(classId)', '历史页切换班级后应直接刷新列表。');
requireText(historySource, '<HomeroomClassPickerSheet', '历史页应复用带班班级选择组件。');

requireText(pickerSource, 'aria-label="选择班级"', '共用班级选择组件应提供对话框语义。');
requireText(pickerSource, 'classes.map', '共用班级选择组件应渲染带班班级。');
requireText(pickerSource, 'min-h-14', '班级选项应提供足够触控高度。');

requireText(dataSource, "'6月30日-7月6日'", '历史报告应只使用前一个完整自然周。');
requireText(dataSource, "c_2025_7: []", 'Demo 应包含暂无往期建议的班级。');
requireText(dataSource, 'WEEKLY_ACTION_ADVICE_CURRENT_BY_CLASS', '应按班级提供当前报告。');
requireText(dataSource, 'WEEKLY_ACTION_ADVICE_HISTORY_BY_CLASS', '应按班级提供历史报告。');
requireText(dataSource, 'actionWeekStart: string;', '报告应结构化保存行动周开始日期。');

for (const forbidden of ['report.status', '数据积累中', '按建议执行周期倒序排列', 'report.summary', 'report.overview.records', 'report.overview.covered']) {
  if (historySource.includes(forbidden)) throw new Error(`历史列表不应包含冗余信息：${forbidden}`);
}
for (const forbidden of ["status: 'accumulating'", 'summary:', 'accumulationTips', 'dataWindowWeeks']) {
  if (dataSource.includes(forbidden)) throw new Error(`报告数据不应包含未生成状态或摘要：${forbidden}`);
}

requireText(prdSource, '固定为行动周之前的一个完整自然周', 'PRD 应说明固定的上周数据窗口。');
requireText(prdSource, '数据水位线', 'PRD 应说明如何避免重复消费旧数据。');
requireText(prdSource, '学校编号 + 班级编号 + 行动周开始日期', 'PRD 应定义报告唯一键。');
requireText(prdSource, '同一班级同一行动周的模型重复调用率', 'PRD 应定义重复生成目标。');
requireText(prdSource, '数据不足时不调用模型', 'PRD 应明确低数据不消耗模型。');
requireText(prdSource, '本周重点行动最多3条', 'PRD 应限制行动建议数量。');
requireText(prdSource, '所有成功报告字段完全一致', 'PRD 应规定统一的AI输出字段。');
requireText(prdSource, '不展示排序说明、摘要、记录数、覆盖人数和状态标签', 'PRD 应规定历史列表的信息收敛。');
requireText(prdSource, '往期建议可以在页面内切换带班班级', 'PRD 应允许历史页直接切换班级。');
requireText(prdSource, '加载阶段不展示数据来源', 'PRD 应规定数据来源只在完成后出现。');
requireText(prdSource, '按建议开始日期归入对应年月', 'PRD 应明确历史建议的月份分组规则。');
requireText(prdSource, '不使用“第几周”', 'PRD 应避免使用有口径歧义的周次名称。');

console.log('WeeklyActionAdviceHistoryView entry assertions passed');
