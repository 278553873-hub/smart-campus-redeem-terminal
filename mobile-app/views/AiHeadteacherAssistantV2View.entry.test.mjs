import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./AiHeadteacherAssistantV2View.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const accessSource = fs.readFileSync(new URL('../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');

const requireText = (source, text, message) => {
  assert.ok(source.includes(text), message);
};

requireText(accessSource, "| 'headteacherAssistantV2'", '权限类型应包含 V2 能力。');
requireText(accessSource, 'space.enabledManagementTools', '菜单必须优先读取后台明确返回的能力列表。');

requireText(meSource, "id: 'headteacherAssistant'", '现有班主任助理入口必须保留。');
requireText(meSource, "id: 'headteacherAssistantV2'", '管理工具应增加班主任助理 V2。');
requireText(meSource, "title: '班主任助理 V2'", 'V2 入口名称应明确区分版本。');
assert.equal(
  (meSource.match(/imageSrc: ASSETS\.MANAGEMENT\.AI_HEADTEACHER_ASSISTANT/g) ?? []).length,
  2,
  'V1 与 V2 应复用班主任助理图标。',
);
requireText(meSource, 'onOpenAiHeadteacherAssistantV2', '我的页应暴露 V2 导航回调。');

requireText(appSource, "import AiHeadteacherAssistantV2View from './views/AiHeadteacherAssistantV2View';", 'App 应导入 V2 页面。');
requireText(appSource, "'ai_headteacher_assistant_v2'", 'App 页面状态应包含 V2。');
requireText(appSource, "onOpenAiHeadteacherAssistantV2={() => navigateTo('ai_headteacher_assistant_v2')}", 'V2 入口应接入独立导航。');
requireText(appSource, '<AiHeadteacherAssistantV2View', 'App 应渲染 V2 页面。');
requireText(appSource, 'activeClassId={assistantV2ClassId}', 'V2 应使用独立班级状态。');

requireText(viewSource, '<AssistantSubpageHeader', 'V2 页面应使用公共子页标题栏。');
requireText(viewSource, 'centerContent={<ClassSwitchButton', '班级切换应放在标题栏中。');
assert.ok(!viewSource.includes('AssistantSubpageHeader title='), 'V2 标题栏不应继续显示页面名称。');
requireText(viewSource, '<HomeroomClassPickerSheet', 'V2 应复用带班班级选择组件。');
requireText(viewSource, '<MobileBottomSheet', '扣分明细应使用公共底部抽屉渐进披露。');
assert.ok(!viewSource.includes('AutoResizeTextarea'), '固定问题模式不应保留自由文字输入。');
assert.ok(!viewSource.includes('SpeechRecognition'), '固定问题模式不应保留自由语音输入。');
assert.ok(!viewSource.includes('latestSuggestions'), '回答后不应生成新的动态追问。');
assert.ok(!viewSource.includes('Camera'), '班主任 Agent 对话不应提供拍照入口。');
assert.ok(!viewSource.includes('Plus'), '固定问题列表不应提供添加入口。');
requireText(viewSource, '数据概览', '完整周报应先展示确定性数据统计。');
requireText(viewSource, '本周整体表现', '完整周报应包含整体表现分析。');
requireText(viewSource, '主要扣分问题', '完整周报应包含扣分问题分析。');
requireText(viewSource, '下周关注重点', '完整周报应包含下周指导建议。');
requireText(viewSource, '<Sparkles', '人工智能分析应使用清晰、统一的图标。');
requireText(viewSource, '查看依据', '回答应提供逐笔数据依据入口。');
requireText(viewSource, '内容由人工智能基于班级评价台账生成', '页面应披露人工智能内容来源。');
for (const unrelatedCopy of ['责任拆分', '整改状态', '教师组织责任']) {
  assert.ok(!viewSource.includes(unrelatedCopy), `页面不应展示系统不存在的“${unrelatedCopy}”。`);
}
requireText(viewSource, 'ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER', 'Agent 首屏应复用班主任助理虚拟形象。');
requireText(viewSource, 'alt="AI班主任助理形象"', '虚拟形象应提供明确替代文本。');
requireText(viewSource, '我将为您提供数据分析和指导建议', '首屏应使用精简的动态问候文案。');
requireText(viewSource, 'ai-assistant-typewriter-shine', '动态问候应复用 V1 的渐变光效文字。');
requireText(appSource, "currentView === 'ai_headteacher_assistant_v2'", 'V2 应注册独立整屏背景。');
requireText(appSource, 'headteacher-agent-gradient-page absolute inset-0', 'V2 渐变应铺满手机屏幕并覆盖状态栏安全区。');
requireText(viewSource, 'bg-transparent', 'V2 内容层应保持透明，避免渐变在安全区后重新开始。');
requireText(viewSource, 'headteacher-agent-glass', '本周数据卡片应使用拟态玻璃效果。');
requireText(viewSource, '本周数据', '首屏应展示本周数据面板。');
requireText(viewSource, '本周总分', '收起态应展示本周总分。');
requireText(viewSource, '年级排名', '收起态应明确展示年级排名。');
assert.ok(!viewSource.includes('当前排名'), '总分排名不应继续使用含义模糊的当前排名文案。');
assert.ok(!viewSource.includes('班级排名'), '周数据子页不应继续使用含义模糊的班级排名文案。');
requireText(viewSource, 'h-[148px]', '首屏头图区应保持紧凑，避免数据卡下沉。');
requireText(viewSource, '班级周评分析', '首屏应明确展示完整周报任务。');
requireText(viewSource, '生成本周班级评比分析', '未生成时应提供单一主任务入口。');
requireText(viewSource, '查看本周班级评比分析', '已生成时主任务应变为直接查看。');
assert.equal(
  (viewSource.match(/setHistoryOpen\(true\)/g) ?? []).length,
  1,
  '往期报告入口只应出现在报告详情页，不应占用首页外层空间。',
);
requireText(viewSource, '打开周数据页面', '日期切换入口应打开独立周数据页面。');
requireText(viewSource, 'rankings.map', '展开态应展示五项一级指标的得分和排名。');
requireText(viewSource, '<span>分类数据</span>', '收起态入口应命名为分类数据。');
requireText(viewSource, 'justify-end px-4', '分类数据入口应放在数据卡片右侧。');
requireText(viewSource, "aria-label={expanded ? '收起分类数据' : '展开分类数据'}", '分类数据按钮应按展开状态提供准确的无障碍名称。');
requireText(viewSource, 'h-[var(--tm-assistant-secondary-pill-height)] w-[var(--tm-assistant-category-pill-width)]', '分类数据入口应使用紧凑的108×30像素可见胶囊。');
requireText(viewSource, 'h-[var(--tm-assistant-icon-control-visual-size)] w-[var(--tm-assistant-icon-control-visual-size)]', '收起箭头应使用36像素可见圆形按钮。');
requireText(viewSource, 'after:-inset-y-[7px]', '分类数据入口应在30像素外观之外保留44像素触控高度。');
requireText(viewSource, 'after:-inset-1', '收起箭头应在36像素外观之外保留44像素触控区域。');
requireText(viewSource, 'transition-[width,height,scale,background-color,box-shadow]', '分类数据展开与收起应使用可中断的精确属性过渡。');
requireText(viewSource, "expanded ? 'rotate-180' : 'rotate-0'", '分类数据箭头应连续旋转表达展开状态。');
requireText(viewSource, '<DimensionRankingTable', '展开态应使用四列分类数据表。');
requireText(viewSource, 'formatCompactScore(item.score)', '分类数据表的整数分值不应重复显示无效小数位。');
requireText(viewSource, '<DimensionScoreBullet score={item.score} maxScore={item.maxScore} />', '分类数据分数列应使用紧凑子弹图展示当前分与满分。');
requireText(viewSource, '(score / maxScore) * 100', '子弹图长度应按当前分与满分的比例计算。');
requireText(viewSource, '<span>指标</span>', '指标应出现在分类数据表头中。');
for (const header of ['分数/总分', '年级排名', '全校排名']) {
  requireText(viewSource, `<span className="text-center">${header}</span>`, `${header}应出现在分类数据表头中。`);
}
assert.ok(!viewSource.includes('>评比大项</h3>'), '分类数据展开后不应再显示评比大项标题。');
assert.ok(!viewSource.includes('<TeacherReportScoreProgressChart'), '分类数据应使用稳定四列布局，不再展示进度图。');
assert.ok(!viewSource.includes('grid grid-cols-2 divide-x divide-[var(--tm-border-subtle)] border-y'), '本周核心数据不应继续依赖重复分隔线建立层级。');
assert.ok(!viewSource.includes(' transition '), 'V2 页面交互不得使用会监听所有属性的笼统过渡。');
requireText(viewSource, '展示明细', '分类数据下方应提供居中的展示明细入口。');
requireText(viewSource, 'find(item => item.recordCount > 0)?.dimension', '展示明细应默认打开本周期第一项有扣分的指标。');
requireText(viewSource, 'onOpenDimensionDetails={setDetailDimension}', '点击一级指标应直接打开对应指标的扣分明细。');
requireText(viewSource, 'role="tablist" aria-label="一级指标"', '扣分明细弹窗顶部应提供一级指标切换。');
requireText(viewSource, 'records.filter(record => record.dimension === detailDimension)', '弹窗内容应只展示所选一级指标在本周期内的扣分记录。');
requireText(viewSource, "dimensionDeduction > 0 ? '-' : ''", '无扣分指标不应显示负零分。');
requireText(viewSource, '本周期该指标暂无扣分', '无扣分记录时应提供明确空状态。');
assert.ok(!viewSource.includes('expandedDimension'), '分类数据不应继续在主卡片内展开扣分记录。');
requireText(viewSource, 'WeekDataDetailPage', '日期入口应使用独立周数据页。');
requireText(viewSource, 'aria-label="查看上一周"', '周数据页顶部应支持查看上一周。');
requireText(viewSource, 'aria-label="查看下一周"', '周数据页顶部应支持查看下一周。');
requireText(viewSource, 'id="week-dimensions-title"', '周数据页应常驻展示分类数据。');
requireText(viewSource, 'selectedDimension={selectedRanking?.dimension}', '周数据页分类表应突出当前选择的一级指标。');
requireText(viewSource, 'selectedRecords = records.filter', '周数据页扣分明细应跟随一级指标筛选。');
requireText(viewSource, '该周此指标暂无扣分', '周数据页应处理一级指标无扣分记录的状态。');
requireText(viewSource, '扣分明细', '周数据页应展示所选一级指标的完整扣分明细。');
requireText(viewSource, 'ClassEvaluationHistoryPage', '历史报告应使用独立页面展示。');
requireText(viewSource, 'groupReportsByMonth', '往期报告应按月份组织周报列表。');
requireText(viewSource, 'findSavedClassEvaluationReport', '点击周报任务后应先查询同版本缓存。');
requireText(viewSource, 'saveClassEvaluationReport', '首次生成完整周报后应保存历史记录。');
requireText(viewSource, 'CLASS_EVALUATION_WEEKLY_REPORT_PROMPT_VERSION', '缓存身份应包含整份周报的提示词版本。');
requireText(viewSource, 'dataSnapshotId: snapshot.id', '缓存身份应包含当前数据快照。');
requireText(viewSource, 'REPORT_GENERATION_STEPS', '首次生成应展示 Agent 分析过程。');
for (const step of ['正在汇总本周班级评价数据', '正在分析得分与扣分情况', '正在对比指标表现与周变化', '正在生成本周分析与指导建议']) {
  requireText(viewSource, step, `Agent 生成过程缺少阶段：${step}`);
}
requireText(viewSource, 'activeReport.evidenceRecords', '历史报告的查看依据应使用生成时冻结的逐笔记录。');
requireText(viewSource, '返回概览', '报告态应支持返回周评概览。');
assert.ok(!viewSource.includes('继续分析'), '报告页不应重复展示三个固定问题。');
assert.ok(!viewSource.includes('role="tablist" aria-label="报告类型"'), '往期报告不应再按三个问题类型分栏。');
assert.ok(!viewSource.includes('ChatMessage'), '固定报告不应保留聊天消息模型。');
assert.ok(!viewSource.includes('conversationOpen'), '固定报告不应继续使用对话态命名。');
assert.ok(!viewSource.includes('setMessages'), '报告页不应再构造用户消息气泡。');

console.log('AiHeadteacherAssistantV2View entry assertions passed');
