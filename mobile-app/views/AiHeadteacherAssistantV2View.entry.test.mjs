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
requireText(viewSource, '<AutoResizeTextarea', '自由对话应使用自动增高输入框。');
requireText(viewSource, 'aria-label="发送问题"', '发送按钮应有明确无障碍名称。');
requireText(viewSource, "'按住说话'", '底部对话区应提供语音输入。');
requireText(viewSource, 'aria-label="切换到文字输入"', '语音模式应能切换到文字输入。');
requireText(viewSource, 'aria-label="切换到语音输入"', '文字模式应能切换回语音输入。');
assert.ok(!viewSource.includes('Camera'), '班主任 Agent 对话不应提供拍照入口。');
assert.ok(!viewSource.includes('Plus'), '语音输入栏不应保留添加按钮。');
requireText(viewSource, 'headteacher-agent-glass relative h-14 overflow-hidden rounded-full', '语音输入栏应使用参考图的单行胶囊结构。');
requireText(viewSource, 'h-11 w-11', '发送按钮触控区域不得小于44像素。');
requireText(viewSource, '查看扣分明细', '回答应提供证据明细入口。');
requireText(viewSource, '内容由人工智能基于班级评价台账生成', '页面应披露人工智能内容来源。');
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
requireText(viewSource, '当前排名', '收起态应展示当前排名。');
requireText(viewSource, 'h-[148px]', '首屏头图区应保持紧凑，避免数据卡下沉。');
requireText(viewSource, 'recommendedQuestions.slice(0, 2)', '首屏推荐问题应收敛为两条。');
requireText(viewSource, '打开周数据页面', '日期切换入口应打开独立周数据页面。');
requireText(viewSource, 'week.dimensionRankings.map', '展开态应展示五项一级指标的得分和排名。');
requireText(viewSource, '<TeacherReportHorizontalBarChart', '评比大项应使用横向条形图展示。');
requireText(viewSource, 'maxValue={20}', '评比得分图应使用20分统一量尺。');
requireText(viewSource, 'onToggleDimension', '五项数据应支持逐项展开扣分情况。');
requireText(viewSource, 'WeekDataDetailPage', '日期入口应使用独立周数据页。');
requireText(viewSource, 'aria-label="查看上一周"', '周数据页顶部应支持查看上一周。');
requireText(viewSource, 'aria-label="查看下一周"', '周数据页顶部应支持查看下一周。');
requireText(viewSource, '扣分明细', '周数据页应展示扣分明细。');
requireText(viewSource, '你可以继续问我', '数据面板下方应展示推荐问题。');
requireText(viewSource, 'conversationOpen', '发起提问后应进入独立对话态。');
requireText(viewSource, '返回概览', '对话态应支持返回周评概览。');

console.log('AiHeadteacherAssistantV2View entry assertions passed');
