import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./WeeklyActionAdviceView.tsx', import.meta.url), 'utf8');
const dataSource = fs.readFileSync(new URL('../data/weeklyActionAdvice.ts', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const assistantSource = fs.readFileSync(new URL('./AiHeadteacherAssistantView.tsx', import.meta.url), 'utf8');
const cssSource = fs.readFileSync(new URL('../index.css', import.meta.url), 'utf8');
const promptSource = fs.readFileSync(new URL('../../docs/班主任助理_本周行动建议_内容生成提示词.md', import.meta.url), 'utf8');
const prdSource = fs.readFileSync(new URL('../../docs/PRD-班主任助理本周行动建议.md', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};
const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

requireText(dataSource, "status: 'generated'", '完整报告应使用已生成状态。');
requireText(dataSource, "status: 'insufficient'", '应提供上周数据不足状态。');
requireText(dataSource, "c_2025_4: CURRENT_WEEKLY_ACTION_ADVICE", '2025级四班应展示完整报告。');
requireText(dataSource, "c_2025_1: CURRENT_NO_RECORDS", '2025级一班应展示本周尚无记录。');
requireText(dataSource, "c_2024_2: CURRENT_ACCUMULATING", '2024级二班应展示本周记录积累中。');
requireText(dataSource, "c_2025_7: CURRENT_READY_FOR_NEXT_WEEK", '2025级七班应展示本周已达到下周生成条件。');
requireText(appSource, "homeroomClassIds: ['c_2025_4', 'c_2025_1', 'c_2024_2', 'c_2025_7']", 'Demo 带班班级应覆盖四种行动建议状态。');
requireText(appSource, 'data={activeWeeklyAdvice}', '行动建议页应按班级接收结构化页面状态。');
forbidText(appSource, "onStartRecording={() => switchTab('home_log')}", '数据不足页不应提供返回记录页的快捷入口。');

forbidText(viewSource, '本周暂无行动建议', '数据不足页不应重复展示相同结论。');
requireText(viewSource, "const INSUFFICIENT_MESSAGE_FIRST_LINE = '上周数据不足，';", '数据不足主信息第一行应固定展示原因。');
requireText(viewSource, "const INSUFFICIENT_MESSAGE_SECOND_LINE = '暂时无法生成本周行动建议。';", '数据不足主信息第二行应固定展示结果。');
requireText(viewSource, 'const visibleSecondLine = INSUFFICIENT_MESSAGE_SECOND_LINE.slice(', '逐字展示应在第一行完成后继续第二行。');
requireText(viewSource, '<span className="block">', '两段主信息应使用固定换行，不依赖屏幕宽度自动折行。');
requireText(viewSource, '<span className="sr-only">{INSUFFICIENT_MESSAGE}</span>', '逐字主信息应保留完整的无障碍文本。');
forbidText(viewSource, '上周数据未达到生成条件，因此无法生成本周行动建议。', '页面不应保留合并前的重复原因文案。');
requireText(viewSource, 'visibleMessageLength', '数据不足原因应逐字展示。');
requireText(viewSource, 'visibleRequirementCount', '上周未达标数据应逐条展示。');
requireText(viewSource, "window.matchMedia('(prefers-reduced-motion: reduce)')", '数据不足动效应支持减少动态效果。');
requireText(viewSource, '>上周数据</h2>', '上周数据应成为页面唯一主要信息卡片。');
requireText(viewSource, 'RequirementRow label="记录条数"', '上周数据应展示记录条数的实际值、目标值和差额。');
requireText(viewSource, 'RequirementRow label="覆盖同学"', '上周数据应展示覆盖人数的实际值、目标值和差额。');
requireText(viewSource, '本周达到以上条件后，下周进入班主任助理即可生成。', '未达标时不应重复展示目标数字。');
requireText(viewSource, '本周已达到以上条件，下周进入班主任助理即可生成。', '本周达标时不能暗示系统自动生成。');
forbidText(viewSource, '记录本周表现', '数据不足页不应展示记录本周表现快捷入口。');
forbidText(viewSource, 'onStartRecording', '数据不足页不应保留无效的快捷记录回调。');
requireText(viewSource, '查看报告示例', '数据不足页应提供报告示例入口。');
requireText(viewSource, 'ChevronRight', '报告示例应使用标准向右箭头表达进入详情。');
forbidText(viewSource, 'ProgressMetric', '数据不足页不应继续展示两条进度条。');
forbidText(viewSource, 'BookOpen', '状态区不应保留无信息价值的装饰图标。');
forbidText(viewSource, 'CheckCircle2', '报告示例不应使用容易误解为已完成的图标。');
forbidText(viewSource, '班级速览 · 学生洞察 · 本周重点行动', '报告示例入口不应继续堆叠板块说明。');
forbidText(viewSource, '准备下周建议', '页面不应替老师预设准备下周建议为主任务。');
requireText(dataSource, 'Math.ceil(normalizedClassSize * 0.6)', '记录目标应按班级人数60%动态计算。');
requireText(dataSource, 'Math.ceil(normalizedClassSize * 0.5)', '覆盖目标应按班级人数50%动态计算。');
forbidText(dataSource, 'target: { records: 36, covered: 30 }', 'Mock 不应把60人班级目标写死。');
requireText(viewSource, '示例内容，仅用于展示报告结构', '报告示例应与真实报告明确区分。');
forbidText(viewSource, '下周将为你生成', '页面不能暗示下周自动生成。');
forbidText(viewSource, '即可生成本周建议', '页面不能暗示本周补录后可补生成。');

requireText(viewSource, '正在整理上周评价记录', '生成等待应固定从整理上周记录开始。');
requireText(viewSource, '正在分析评价详情', '生成等待应分析上一个完整自然周。');
forbidText(viewSource, '继续参考前一周', '页面不应向前追溯两周。');
forbidText(viewSource, '前四周', '页面不应向前追溯四周。');
requireText(viewSource, 'visibleStepCount', '生成等待文案应逐步出现。');
requireText(viewSource, 'aria-label="查看往期建议"', '右上角历史图标应有清晰的无障碍名称。');
requireText(viewSource, "const showHeaderTitle = title !== '本周行动建议';", '当前行动建议详情不应重复展示顶部标题。');
requireText(viewSource, '{showHeaderTitle && (', '历史详情和报告示例仍应按需展示标题。');
requireText(viewSource, 'h-11 w-11', '返回与历史图标应提供44像素触控区域。');
requireText(viewSource, 'rounded-[22px]', '报告与进度面板应遵循教师手机端圆角规范。');
requireText(viewSource, 'waa-card-enter', '报告卡片应保留语义入场动画。');
requireText(cssSource, '@keyframes waa-fade-up', '应定义报告卡片入场动画。');
requireText(cssSource, 'prefers-reduced-motion: reduce', '动画应支持减少动态效果。');
requireText(viewSource, '以上内容由AI基于评价记录生成，仅供参考', '真实报告应保留精简的AI参考声明。');

requireText(assistantSource, '根据上周记录，整理本周班级重点。', '班主任助理入口应明确使用上周数据。');
forbidText(assistantSource, '根据近期评价', '入口不应继续使用模糊的近期口径。');
requireText(promptSource, '上一个完整自然周', '提示词应固定上一个完整自然周。');
forbidText(promptSource, 'data_window_weeks', '提示词不应继续传递自适应周数。');
requireText(promptSource, '不发送本周记录或更早历史记录', '提示词应禁止混入本周和更早数据。');
requireText(promptSource, '【教师评价洞察】', '提示词应独立定义教师评价洞察。');
requireText(promptSource, '不设置固定洞察条数上限', '教师评价洞察不应限制为最多2条。');
requireText(promptSource, '只写评价次数、占比、正负向数量、覆盖人数或排名不构成洞察', '提示词应禁止把统计表象直接作为教师洞察。');
requireText(promptSource, '原始评价事件数', '提示词应使用原始评价事件衡量教师参与度。');
requireText(promptSource, '学生明细记录数', '提示词应区分全班评价展开后的学生明细。');
requireText(promptSource, 'teacher_evaluation_statistics_json', '提示词应接收后端教师评价结构化统计。');
requireText(promptSource, 'teacher_names', '评价洞察应返回涉及教师。');
requireText(promptSource, 'insight_type', '评价洞察应返回洞察类型。');
requireText(promptSource, 'finding', '评价洞察应返回模式判断。');
requireText(promptSource, 'evidence', '评价洞察应返回明细证据。');
requireText(promptSource, 'implication', '评价洞察应返回班级意义或边界。');
forbidText(promptSource, 'evaluation_insights 最多2条', '教师评价洞察不应保留旧的2条上限。');
requireText(prdSource, '不是教师排行榜或教师考核', 'PRD 应明确教师评价洞察的使用边界。');
requireText(prdSource, '评价参与度统一使用原始评价事件数', 'PRD 应明确教师参与度统计口径。');
requireText(dataSource, 'export interface TeacherEvaluationInsight', '演示数据应使用结构化教师评价洞察。');
requireText(dataSource, "insightType: 'participation'", '演示内容应包含教师参与结构洞察。');
requireText(dataSource, "insightType: 'orientation'", '演示内容应包含鼓励与纠偏方式洞察。');
requireText(dataSource, "insightType: 'target_scope'", '演示内容应包含评价对象粒度洞察。');
requireText(viewSource, 'formatTeacherEvaluationInsight', '页面应将结构化教师评价洞察转换为可读内容。');

for (const framework of ['学生投入三维框架', '控制-价值', '自我决定理论', '挑战-能力匹配框架', '功能性行为评估框架']) {
  requireText(promptSource, framework, `生成提示词应写明研究框架：${framework}`);
}
requireText(promptSource, '命中德育指标不等于“德育出了问题”', '提示词应区分指标分类和原因诊断。');
requireText(prdSource, '记录数量和学生覆盖率同时达到最低要求', 'PRD 应只保留记录量和覆盖率门槛。');
requireText(prdSource, '允许老师集中补录，不检查活跃记录天数', 'PRD 应允许老师集中补录。');
requireText(prdSource, '学生洞察不设置独立的报告生成门槛', 'PRD 不应为学生洞察增加额外生成门槛。');
requireText(prdSource, '系统不自动生成', 'PRD 应明确下周仍需老师主动生成。');

console.log('WeeklyActionAdviceView entry assertions passed');
