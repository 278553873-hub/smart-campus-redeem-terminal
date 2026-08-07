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

requireText(viewSource, 'AssistantSubpageHeader title="班主任助理 V2"', 'V2 页面应使用公共子页标题栏。');
requireText(viewSource, '<HomeroomClassPickerSheet', 'V2 应复用带班班级选择组件。');
requireText(viewSource, '<MobileBottomSheet', '扣分明细应使用公共底部抽屉渐进披露。');
requireText(viewSource, '<AutoResizeTextarea', '自由对话应使用自动增高输入框。');
requireText(viewSource, 'aria-label="发送问题"', '发送按钮应有明确无障碍名称。');
requireText(viewSource, 'h-11 w-11', '发送按钮触控区域不得小于44像素。');
requireText(viewSource, '查看扣分明细', '回答应提供证据明细入口。');
requireText(viewSource, '内容由人工智能基于班级评价台账生成', '页面应披露人工智能内容来源。');
requireText(viewSource, 'ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER', 'Agent 首屏应复用班主任助理虚拟形象。');
requireText(viewSource, 'alt="AI班主任助理形象"', '虚拟形象应提供明确替代文本。');
requireText(viewSource, '本周班级评比', '首屏应展示本周班级评比数据面板。');
requireText(viewSource, '选择评价周期', '数据面板应支持切换任意周。');
requireText(viewSource, 'week.dimensionRankings.map', '展开态应展示五项一级指标的得分和排名。');
requireText(viewSource, '你可以继续问我', '数据面板下方应展示推荐问题。');
requireText(viewSource, 'conversationOpen', '发起提问后应进入独立对话态。');
requireText(viewSource, '返回概览', '对话态应支持返回周评概览。');

console.log('AiHeadteacherAssistantV2View entry assertions passed');
