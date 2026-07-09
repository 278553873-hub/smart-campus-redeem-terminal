import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./AiPrincipalAssistantView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const assetsSource = fs.readFileSync(new URL('../assets/images.ts', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

requireText(meSource, 'onOpenAiPrincipalAssistant: () => void;', '我的页应暴露 AI 校长助理入口回调。');
requireText(meSource, "title: '校长助理'", '管理工具应保留校长助理入口。');
requireText(meSource, 'onClick: onOpenAiPrincipalAssistant', '校长助理入口应进入子页面，而不是停留在 toast 演示反馈。');
forbidText(meSource, "showDemoFeedback('校长助理')", '校长助理入口不应继续弹出功能演示中。');

requireText(appSource, "import AiPrincipalAssistantView from './views/AiPrincipalAssistantView';", 'App 应导入 AI 校长助理子页面。');
requireText(appSource, "'ai_principal_assistant'", 'App 页面枚举应包含 AI 校长助理子页面。');
requireText(appSource, "onOpenAiPrincipalAssistant={() => navigateTo('ai_principal_assistant')}", 'App 应将我的页入口接到 AI 校长助理页面。');
requireText(appSource, "{currentView === 'ai_principal_assistant' && (", 'App 应渲染 AI 校长助理页面。');
requireText(appSource, '<AiPrincipalAssistantView onBack={goBack} />', 'AI 校长助理页面应支持返回。');

requireText(viewSource, 'AI校长助理', '子页面顶部标题应为 AI校长助理。');
requireText(viewSource, 'AI校长助理形象', '子页面顶部应展示 AI 校长助理形象。');
requireText(assetsSource, 'ai-principal-assistant-character.png', '应接入 pic 生成的女性 AI 校长助理形象资源。');
requireText(assetsSource, 'ai-principal-assistant-icon.png', '应接入裁切后的校长助理入口图标资源。');
requireText(viewSource, 'ASSETS.MANAGEMENT.AI_PRINCIPAL_ASSISTANT_CHARACTER', '子页面顶部应使用校长助理 3D 形象，而不是通用 AI 机器人。');
requireText(viewSource, '生成学校本周管理摘要', '第一个选项应面向校务管理摘要。');
requireText(viewSource, '汇总班级记录与校园币使用情况，提示本周校务关注重点。', '第一个选项应说明管理摘要的数据来源和结果。');
requireText(viewSource, '查看年级发展趋势', '第二个选项应面向年级趋势。');
requireText(viewSource, '按年级整理五育表现变化，辅助判断后续管理动作。', '第二个选项应说明趋势分析用途。');
requireText(viewSource, 'window.alert(`${title}能力建设中`)', '后续分析能力未开放时应只给轻反馈。');

forbidText(viewSource, '<textarea', '当前版本不应开放自主输入内容。');
forbidText(viewSource, '<input', '当前版本不应开放自主输入内容。');
forbidText(viewSource, 'ASSETS.MANAGEMENT.AI_BOT', '子页面顶部不应使用通用 AI 机器人占位图。');
forbidText(viewSource, '按住', '当前版本不应开放语音对话入口。');
forbidText(viewSource, '语音', '当前版本不应开放语音对话入口。');
forbidText(viewSource, '发消息', '当前版本不应展示自由对话输入提示。');

console.log('AiPrincipalAssistantView entry assertions passed');
