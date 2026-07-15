import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./AiPrincipalAssistantView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const assetsSource = fs.readFileSync(new URL('../assets/images.ts', import.meta.url), 'utf8');
const cssSource = fs.readFileSync(new URL('../index.css', import.meta.url), 'utf8');

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
requireText(appSource, "currentView !== 'ai_principal_assistant'", 'AI 校长助理页面不应继续显示通用顶部标题栏。');

requireText(viewSource, 'AI校长助理', '子页面顶部标题应为 AI校长助理。');
requireText(viewSource, 'AI校长助理形象', '子页面顶部应展示 AI 校长助理形象。');
requireText(viewSource, "你好，我是校长助理\\n请选择一个分析方向，我将为你发现潜在问题，并提供管理建议。", '子页面应在问候后换行展示校长助理开场白。');
requireText(viewSource, 'typedMessage', '校长助理开场白应按打字机效果逐步显示。');
requireText(viewSource, 'getTypeDelay', '校长助理打字机效果应复用变速节奏。');
requireText(viewSource, 'return 56;', '普通字符打字速度应接近班主任助理页面。');
requireText(viewSource, 'return 280;', '换行处应保留短停顿。');
requireText(viewSource, 'aria-label="返回"', 'AI 校长助理页面应在页面内保留返回按钮。');
requireText(viewSource, 'min-h-[410px]', 'AI 校长助理主视觉区域应复刻班主任助理布局高度。');
requireText(viewSource, 'h-[286px] w-[286px]', 'AI 校长助理形象应放大展示。');
requireText(viewSource, 'h-[286px] w-[286px] scale-[1.04] object-contain drop-shadow', 'AI 校长助理形象应保持原色直接渲染。');
forbidText(viewSource, 'mix-blend-multiply', 'AI 校长助理形象不应使用正片叠底，否则会被背景染脏。');
forbidText(viewSource, 'WebkitMaskImage', 'AI 校长助理形象不应再用前端遮罩伪融合。');
forbidText(viewSource, 'maskImage', 'AI 校长助理形象不应再用前端遮罩伪融合。');
requireText(viewSource, 'ai-assistant-dialog-card', 'AI 校长助理开场白应使用同款对话卡片。');
requireText(viewSource, 'ai-assistant-dialog-tail', 'AI 校长助理对话卡尾巴应与边框风格一致。');
requireText(viewSource, 'ai-assistant-typewriter-shine', 'AI 校长助理开场白应使用同款文字扫光效果。');
requireText(viewSource, 'text-[16px]', 'AI 校长助理开场白字号应与班主任助理一致。');
requireText(viewSource, 'min-h-[92px] w-full rounded-[22px]', 'AI 校长助理对话卡片应与功能卡片同宽。');
requireText(viewSource, '-mt-1 min-h-[92px] w-full rounded-[22px]', '对话卡片应贴近 AI 校长助理形象，避免人物和边框之间出现明显留缝。');
requireText(cssSource, 'ai-assistant-dialog-card', '应存在共享的助理对话卡片样式。');
requireText(assetsSource, 'ai-principal-assistant-character.png', '应接入 pic 生成的女性 AI 校长助理形象资源。');
requireText(assetsSource, 'ai-principal-assistant-icon.png', '应接入裁切后的校长助理入口图标资源。');
requireText(viewSource, 'ASSETS.MANAGEMENT.AI_PRINCIPAL_ASSISTANT_CHARACTER', '子页面顶部应使用校长助理 3D 形象，而不是通用 AI 机器人。');
requireText(viewSource, '生成学校本周管理摘要', '第一个选项应面向校务管理摘要。');
requireText(viewSource, '汇总班级记录与校园币使用情况，提示本周校务关注重点。', '第一个选项应说明管理摘要的数据来源和结果。');
requireText(viewSource, '查看年级发展趋势', '第二个选项应面向年级趋势。');
requireText(viewSource, '按年级整理五育表现变化，辅助判断后续管理动作。', '第二个选项应说明趋势分析用途。');
requireText(viewSource, 'window.alert(`${title}能力建设中`)', '后续分析能力未开放时应只给轻反馈。');

forbidText(viewSource, '校务数据与管理助手', 'AI 校长助理页面不应继续展示额外短标题文案。');
forbidText(viewSource, '选择一个分析方向，我来帮你整理学校管理重点。', 'AI 校长助理页面不应继续使用旧开场白。');
forbidText(viewSource, 'rounded-[32px] border border-white/80', 'AI 校长助理页面不应继续使用旧大卡片包裹主视觉。');
forbidText(viewSource, 'rounded-[34px] object-cover', 'AI 校长助理形象不应继续显示为框内头像。');
forbidText(viewSource, '<textarea', '当前版本不应开放自主输入内容。');
forbidText(viewSource, '<input', '当前版本不应开放自主输入内容。');
forbidText(viewSource, 'ASSETS.MANAGEMENT.AI_BOT', '子页面顶部不应使用通用 AI 机器人占位图。');
forbidText(viewSource, '按住', '当前版本不应开放语音对话入口。');
forbidText(viewSource, '语音', '当前版本不应开放语音对话入口。');
forbidText(viewSource, '发消息', '当前版本不应展示自由对话输入提示。');

console.log('AiPrincipalAssistantView entry assertions passed');
