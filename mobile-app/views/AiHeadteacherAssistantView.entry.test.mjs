import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./AiHeadteacherAssistantView.tsx', import.meta.url), 'utf8');
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

requireText(meSource, 'onOpenAiHeadteacherAssistant: () => void;', '我的页应暴露 AI 班主任助理入口回调。');
requireText(meSource, "title: '班主任助理'", '管理工具应将 AI 班主任助理入口改名为班主任助理。');
requireText(meSource, 'onClick: onOpenAiHeadteacherAssistant', 'AI 班主任助理入口应进入子页面，而不是停留在 toast 演示反馈。');
forbidText(meSource, "showDemoFeedback('AI班主任助理')", 'AI 班主任助理入口不应继续弹出功能演示中。');
forbidText(meSource, "title: 'AI班主任助理'", '管理工具入口不应继续显示 AI班主任助理。');

requireText(appSource, "import AiHeadteacherAssistantView from './views/AiHeadteacherAssistantView';", 'App 应导入 AI 班主任助理子页面。');
requireText(appSource, "'ai_headteacher_assistant'", 'App 页面枚举应包含 AI 班主任助理子页面。');
requireText(appSource, "onOpenAiHeadteacherAssistant={() => navigateTo('ai_headteacher_assistant')}", 'App 应将我的页入口接到 AI 班主任助理页面。');
requireText(appSource, "{currentView === 'ai_headteacher_assistant' && (", 'App 应渲染 AI 班主任助理页面。');
requireText(appSource, 'homeroomClasses={homeroomClasses}', '班主任助理应接收教师的带班班级。');
requireText(appSource, 'activeClassId={weeklyAdviceClassId}', '班主任助理应记住上次选择班级。');
requireText(appSource, 'onOpenWeeklyActionAdvice={(classId) => {', '班主任助理应携带班级进入本周行动建议。');
requireText(appSource, 'setWeeklyAdviceClassId(classId);', '选择班级后应更新当前行动建议班级。');
requireText(appSource, "import WeeklyActionAdviceView from './views/WeeklyActionAdviceView';", 'App 应导入本周行动建议子页面。');
requireText(appSource, "'weekly_action_advice'", 'App 页面枚举应包含本周行动建议子页面。');
requireText(appSource, "{currentView === 'weekly_action_advice' && (", 'App 应渲染本周行动建议页面。');
requireText(appSource, 'report={activeWeeklyAdviceReport}', '本周行动建议应按所选班级加载报告。');
requireText(appSource, "onOpenHistory={() => navigateTo('weekly_action_history')}", '本周行动建议应能进入往期建议。');

requireText(viewSource, 'AI班主任助理', '子页面顶部标题应为 AI 班主任助理。');
requireText(viewSource, 'AI班主任助理形象', '子页面顶部应展示 AI 助理形象。');
requireText(viewSource, "你好，我是班主任助理\\n请选择一个分析方向，我将为你发现潜在问题，并提供管理建议。", '子页面应在问候后换行展示班主任助理开场白。');
forbidText(viewSource, '选择一个分析方向，我来帮你整理下一步重点。', '子页面不应继续使用旧开场白。');
requireText(viewSource, 'typedMessage', '班主任助理开场白应按打字机效果逐步显示。');
requireText(viewSource, 'getTypeDelay', '打字机效果应使用更接近大模型输出的变速节奏。');
requireText(viewSource, 'return 56;', '普通字符打字速度应加快，接近大模型流式输出。');
requireText(viewSource, 'return 280;', '换行处应保留短停顿，模拟大模型换句。');
requireText(viewSource, 'text-left', '打字机文案应左对齐。');
requireText(viewSource, 'text-[16px]', '打字机文案字号应按批注调整为 16px。');
requireText(viewSource, 'min-h-[410px]', '主视觉区域应预留足够高度，避免文字和 AI 形象重叠。');
requireText(viewSource, 'h-[286px] w-[286px] scale-[1.04] object-contain drop-shadow', 'AI 班主任助理形象应保持原色直接渲染。');
forbidText(viewSource, 'mix-blend-multiply', 'AI 班主任助理形象不应使用正片叠底，否则会被背景染脏。');
forbidText(viewSource, 'WebkitMaskImage', 'AI 班主任助理形象不应再用前端遮罩伪融合。');
forbidText(viewSource, 'maskImage', 'AI 班主任助理形象不应再用前端遮罩伪融合。');
requireText(viewSource, 'rounded-[22px]', '打字机文案应放入独立轻量对话面板中。');
requireText(viewSource, 'min-h-[92px] w-full rounded-[22px]', '打字机文案卡片应与下方功能卡片同宽。');
requireText(viewSource, '-mt-1 min-h-[92px] w-full rounded-[22px]', '对话卡片应贴近 AI 班主任助理形象，避免人物和边框之间出现明显留缝。');
requireText(viewSource, 'ai-assistant-typewriter-shine', '打字机文字应使用 Uiverse btn-shine 风格的扫光效果。');
requireText(viewSource, 'ai-assistant-dialog-card', '打字机文案卡片应使用 Uiverse 风格的渐变边框效果。');
requireText(viewSource, 'ai-assistant-dialog-tail', '打字机文案卡片尾巴应与渐变边框风格一致。');
requireText(cssSource, '@keyframes ai-assistant-shine', '应定义打字机文字扫光动画。');
requireText(cssSource, '-webkit-background-clip: text', '扫光效果应使用文字裁剪实现。');
requireText(cssSource, 'animation: ai-assistant-shine 5.6s linear infinite;', '打字机文字扫光速度应放慢 50%。');
requireText(cssSource, 'border: 2px solid transparent;', '卡片边框应使用接近示例的清晰 2px 描边。');
requireText(cssSource, 'rgba(103, 207, 218, 0.48)', '卡片边框应使用更浅的青蓝，避免过重。');
requireText(cssSource, 'rgba(199, 210, 254, 0.42)', '卡片边框应使用更浅的柔紫呼应 AI 形象。');
forbidText(cssSource, 'rgba(30, 154, 170, 0.70)', '卡片边框青蓝不应过重。');
forbidText(cssSource, 'rgba(73, 92, 157, 0.78)', '卡片边框不应使用沉重灰蓝色。');
forbidText(cssSource, '@keyframes ai-assistant-card-border', '卡片边框不应再使用旋转动画。');
forbidText(cssSource, 'conic-gradient', '卡片边框不应再使用环形渐变光效。');
requireText(cssSource, 'prefers-reduced-motion: reduce', '扫光效果应支持减少动态效果设置。');
requireText(assetsSource, 'ai-headteacher-assistant-character.png', '应接入 pic 生成的 3D Q 版女助理形象资源。');
requireText(viewSource, 'ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER', '子页面顶部应使用 3D Q 版女助理形象，而不是通用 AI 机器人。');
requireText(viewSource, '生成班级本周行动建议', '第一个选项应面向班主任班级行动建议。');
requireText(viewSource, '根据近期评价，整理本周关注重点和跟进建议。', '第一个选项应简洁说明近期数据与本周行动之间的关系。');
forbidText(viewSource, '基于学生素养表现，提示下周重点关注对象和跟进动作。', '第一个选项不应继续使用错误的下周口径。');
requireText(viewSource, 'homeroomClasses.length > 1', '多个带班班级时应先选择班级。');
requireText(viewSource, '<HomeroomClassPickerSheet', '班主任助理应复用带班班级选择组件。');
requireText(viewSource, 'if (homeroomClasses[0]) onOpenWeeklyActionAdvice(homeroomClasses[0].id);', '只有一个带班班级时应直接进入报告。');
requireText(viewSource, '诊断我的评价关注点', '第二个选项应面向教师个人评价关注诊断。');
requireText(viewSource, '分析本周评价记录的五育覆盖，提示后续使用建议。', '第二个选项应说明五育覆盖与后续使用建议。');
requireText(viewSource, 'window.alert(`${title}能力建设中`)', '后续分析能力未开放时应只给轻反馈。');

forbidText(viewSource, '<textarea', '当前版本不应开放自主输入内容。');
forbidText(viewSource, '<input', '当前版本不应开放自主输入内容。');
forbidText(viewSource, 'ASSETS.MANAGEMENT.AI_BOT', '子页面顶部不应继续使用通用 AI 机器人占位图。');
forbidText(viewSource, '本周班级与评价助手', '子页面不应展示额外的短标题文案。');
forbidText(viewSource, '按住', '当前版本不应开放语音对话入口。');
forbidText(viewSource, '语音', '当前版本不应开放语音对话入口。');
forbidText(viewSource, '发消息', '当前版本不应展示自由对话输入提示。');

console.log('AiHeadteacherAssistantView entry assertions passed');
