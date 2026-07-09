import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./AiHeadteacherAssistantView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const assetsSource = fs.readFileSync(new URL('../assets/images.ts', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

requireText(meSource, 'onOpenAiHeadteacherAssistant: () => void;', '我的页应暴露 AI 班主任助理入口回调。');
requireText(meSource, "title: '班主任助理'", '管理工具应将 AI 班主任助理入口改名为班主任助理。');
requireText(meSource, 'onClick: onOpenAiHeadteacherAssistant', 'AI 班主任助理入口应进入子页面，而不是停留在 toast 演示反馈。');
forbidText(meSource, "showDemoFeedback('AI班主任助理')", 'AI 班主任助理入口不应继续弹出功能演示中。');
forbidText(meSource, "title: 'AI班主任助理'", '管理工具入口不应继续显示 AI班主任助理。');

requireText(appSource, "import AiHeadteacherAssistantView from './views/AiHeadteacherAssistantView';", 'App 应导入 AI 班主任助理子页面。');
requireText(appSource, "'ai_headteacher_assistant'", 'App 页面枚举应包含 AI 班主任助理子页面。');
requireText(appSource, "onOpenAiHeadteacherAssistant={() => navigateTo('ai_headteacher_assistant')}", 'App 应将我的页入口接到 AI 班主任助理页面。');
requireText(appSource, "{currentView === 'ai_headteacher_assistant' && (", 'App 应渲染 AI 班主任助理页面。');
requireText(appSource, '<AiHeadteacherAssistantView onBack={goBack} />', 'AI 班主任助理页面应支持返回。');

requireText(viewSource, 'AI班主任助理', '子页面顶部标题应为 AI 班主任助理。');
requireText(viewSource, 'AI班主任助理形象', '子页面顶部应展示 AI 助理形象。');
requireText(assetsSource, 'ai-headteacher-assistant-character.png', '应接入 pic 生成的 3D Q 版女助理形象资源。');
requireText(viewSource, 'ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER', '子页面顶部应使用 3D Q 版女助理形象，而不是通用 AI 机器人。');
requireText(viewSource, '生成班级本周行动建议', '第一个选项应面向班主任班级行动建议。');
requireText(viewSource, '基于学生素养表现，提示下周重点关注对象和跟进动作。', '第一个选项应说明基于学生数据生成班主任后续动作建议。');
requireText(viewSource, '诊断我的评价关注点', '第二个选项应面向教师个人评价关注诊断。');
requireText(viewSource, '分析本周评价记录的五育覆盖，提示后续使用建议。', '第二个选项应说明五育覆盖与后续使用建议。');
requireText(viewSource, 'window.alert(`${title}能力建设中`)', '后续分析能力未开放时应只给轻反馈。');

forbidText(viewSource, '<textarea', '当前版本不应开放自主输入内容。');
forbidText(viewSource, '<input', '当前版本不应开放自主输入内容。');
forbidText(viewSource, 'ASSETS.MANAGEMENT.AI_BOT', '子页面顶部不应继续使用通用 AI 机器人占位图。');
forbidText(viewSource, '按住', '当前版本不应开放语音对话入口。');
forbidText(viewSource, '语音', '当前版本不应开放语音对话入口。');
forbidText(viewSource, '发消息', '当前版本不应展示自由对话输入提示。');

console.log('AiHeadteacherAssistantView entry assertions passed');
