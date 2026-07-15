import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./WeeklyActionAdviceView.tsx', import.meta.url), 'utf8');
const dataSource = fs.readFileSync(new URL('../data/weeklyActionAdvice.ts', import.meta.url), 'utf8');
const cssSource = fs.readFileSync(new URL('../index.css', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};
const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

requireText(dataSource, "title: '本周行动建议'", '当前报告标题应为本周行动建议。');
requireText(viewSource, '{report.title}', '页面应统一渲染报告标题。');
requireText(viewSource, 'CURRENT_WEEKLY_ACTION_ADVICE', '页面应默认展示数据充足的当前报告。');
requireText(viewSource, 'onOpenHistory', '页面应暴露往期建议入口回调。');
requireText(viewSource, 'aria-label="查看往期建议"', '右上角历史图标应有清晰的无障碍名称。');
requireText(viewSource, 'h-11 w-11', '返回与历史图标应提供44像素触控区域。');
requireText(viewSource, '!loading && <p', '加载阶段不应提前展示数据来源。');
requireText(viewSource, '{getDataSourceText(report)}', '报告完成后应展示对应的数据来源。');
requireText(dataSource, "dataRange: '7月7日-13日'", '当前报告应使用自然语言日期说明数据来源。');
requireText(viewSource, '以上内容由AI基于评价记录生成，仅供参考', '底部应只保留精简的AI参考声明。');
requireText(viewSource, 'aria-label="返回"', '应有返回按钮。');
requireText(viewSource, 'rounded-[22px]', '板块卡片应使用 22px 圆角。');
requireText(viewSource, 'waa-card-enter', '卡片入场应使用语义动画类。');
requireText(cssSource, '@keyframes waa-fade-up', '应定义卡片入场动画。');
requireText(cssSource, 'prefers-reduced-motion: reduce', '动画应支持减少动态效果。');
requireText(dataSource, 'classOverview: string[];', '报告JSON应固定包含班级速览字段。');
requireText(dataSource, 'studentInsights: StudentAdviceInsight[];', '报告JSON应固定包含学生洞察字段。');
requireText(dataSource, 'evaluationInsights: string[];', '报告JSON应固定包含评价洞察字段。');
requireText(dataSource, 'classInsights: string[];', '报告JSON应固定包含班级洞察字段。');
requireText(dataSource, 'actions: string[];', '报告JSON应固定包含行动字段。');
requireText(dataSource, 'needVerify: boolean;', '学生洞察应固定包含核实标记。');
requireText(dataSource, 'dataWindowWeeks: 1 | 2 | 4;', '报告应通过结构化字段记录前1周、2周或4周数据窗口。');
requireText(dataSource, "overview: { records: 52, covered: 41, total: 45, evaluators: 7 }", '当前报告应使用数据充分 mock。');
requireText(dataSource, "'与王小虎单独沟通，核实连续纪律提醒背后的原因。',", '当前报告应提供精简后的第一条行动。');
requireText(dataSource, "'关注周明的作业困难，必要时与家长协同。',", '当前报告应提供精简后的第二条行动。');
requireText(dataSource, "'班会上重申课堂规则，同时表扬互助与稳定进步的同学。',", '当前报告应提供精简后的第三条行动。');
forbidText(dataSource, '趁早干预', '当前报告不应保留旧版过长、过强的判断文案。');
forbidText(dataSource, 'actionRange', '报告数据不应继续包含难理解的建议周期字段。');
forbidText(dataSource, 'windowLabel', '报告数据不应继续包含冗余窗口标签。');
forbidText(dataSource, 'summary:', '报告数据不应包含摘要字段。');
forbidText(dataSource, 'accumulating', '报告数据不应包含数据积累状态。');
forbidText(viewSource, 'AI_HEADTEACHER_ASSISTANT_CHARACTER', '报告顶部不应展示助理形象。');
forbidText(viewSource, '重要判断请结合日常观察核实', '底部不应继续展示过长提示。');
requireText(viewSource, '正在整理上周评价记录', '生成等待应从整理上周评价记录开始。');
requireText(viewSource, '上周记录较少，继续参考前一周', '前两周窗口应解释扩展原因。');
requireText(viewSource, '前两周记录仍较少，继续参考前四周', '前四周窗口应解释再次扩展原因。');
requireText(viewSource, '正在分析前两周评价详情', '前两周窗口应展示对应分析过程。');
requireText(viewSource, '正在分析前四周评价详情', '前四周窗口应展示对应分析过程。');
requireText(viewSource, 'visibleStepCount', '生成等待文案应逐步出现。');
forbidText(viewSource, 'overview.records', '生成等待不应展示记录数。');
forbidText(viewSource, 'overview.covered', '生成等待不应展示覆盖人数。');
forbidText(viewSource, 'overview.evaluators', '生成等待不应展示参与老师数。');
forbidText(viewSource, 'animate-pulse rounded bg-slate-100', '生成等待不应继续展示骨架卡片。');
forbidText(viewSource, 'dataSufficient', '页面不应提供演示数据切换器。');
forbidText(viewSource, '<a ', '当前版本不应有跳转链接。');
forbidText(viewSource, 'window.alert', '结果页不应使用 alert。');

console.log('WeeklyActionAdviceView entry assertions passed');
