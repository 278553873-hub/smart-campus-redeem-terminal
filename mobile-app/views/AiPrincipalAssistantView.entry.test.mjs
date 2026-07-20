import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./AiPrincipalAssistantView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const assetsSource = fs.readFileSync(new URL('../assets/images.ts', import.meta.url), 'utf8');
const cssSource = fs.readFileSync(new URL('../index.css', import.meta.url), 'utf8');
const prdSource = fs.readFileSync(new URL('../../docs/PRD-校长助理周月学期报告.md', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const forbidText = (source, needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

requireText(meSource, 'onOpenAiPrincipalAssistant: () => void;', '我的页应暴露 AI 校长助理入口回调。');
requireText(meSource, "title: '校长助理'", '管理工具应保留校长助理入口。');
requireText(meSource, 'onClick: onOpenAiPrincipalAssistant', '校长助理入口应进入子页面。');
forbidText(meSource, "showDemoFeedback('校长助理')", '校长助理入口不应继续弹出功能演示中。');

requireText(appSource, "import AiPrincipalAssistantView from './views/AiPrincipalAssistantView';", 'App 应导入 AI 校长助理子页面。');
requireText(appSource, "'ai_principal_assistant'", 'App 页面枚举应包含 AI 校长助理子页面。');
requireText(appSource, "onOpenAiPrincipalAssistant={() => navigateTo('ai_principal_assistant')}", 'App 应将我的页入口接到 AI 校长助理页面。');
requireText(appSource, "{currentView === 'ai_principal_assistant' && (", 'App 应渲染 AI 校长助理页面。');
requireText(appSource, 'termConfig={CURRENT_PRINCIPAL_TERM}', 'AI 校长助理应读取当前学期起止时间。');
requireText(appSource, 'hasGeneratedTermReport={principalTermReportGenerated}', 'AI 校长助理应区分已生成报告。');
requireText(appSource, "onOpenWeeklyReport={() => navigateTo('principal_weekly_report')}", 'AI 校长助理应接入本周管理建议页。');
requireText(appSource, "onOpenMonthlyReport={() => navigateTo('principal_monthly_report')}", 'AI 校长助理应接入上月学校复盘页。');
requireText(appSource, "onOpenTermReport={() => navigateTo('principal_term_report')}", 'AI 校长助理应接入学期学校报告页。');
requireText(appSource, "currentView !== 'ai_principal_assistant'", 'AI 校长助理页面不应继续显示通用顶部标题栏。');

requireText(viewSource, 'AI校长助理形象', '子页面顶部应展示 AI 校长助理形象。');
requireText(viewSource, '我会按周提供管理建议，按月复盘学校运行，并在期末生成学期报告。', '开场白应说明周、月、学期三类固定能力。');
requireText(viewSource, 'typedMessage', '校长助理开场白应按打字机效果逐步显示。');
requireText(viewSource, 'getTypeDelay', '校长助理打字机效果应复用变速节奏。');
requireText(viewSource, 'return 56;', '普通字符打字速度应接近班主任助理页面。');
requireText(viewSource, 'return 280;', '换行处应保留短停顿。');
requireText(viewSource, 'aria-label="返回"', 'AI 校长助理页面应在页面内保留返回按钮。');
requireText(viewSource, 'min-h-[365px]', '增加第三个入口后应压缩主视觉高度，保留更多有效信息。');
requireText(viewSource, 'h-[250px] w-[250px]', 'AI 校长助理形象应保持稳定尺寸。');
requireText(viewSource, 'h-[250px] w-[250px] scale-[1.04] object-contain drop-shadow', 'AI 校长助理形象应保持原色直接渲染。');
forbidText(viewSource, 'mix-blend-multiply', 'AI 校长助理形象不应使用正片叠底。');
forbidText(viewSource, 'WebkitMaskImage', 'AI 校长助理形象不应再用前端遮罩伪融合。');
forbidText(viewSource, 'maskImage', 'AI 校长助理形象不应再用前端遮罩伪融合。');
requireText(viewSource, 'ai-assistant-dialog-card', 'AI 校长助理开场白应使用共享对话卡片。');
requireText(viewSource, 'ai-assistant-dialog-tail', 'AI 校长助理对话卡尾巴应与边框风格一致。');
requireText(viewSource, 'ai-assistant-typewriter-shine', 'AI 校长助理开场白应使用共享文字效果。');
requireText(viewSource, 'ai-assistant-theme-principal teacher-assistant-page', '校长助理页面应注入深红与管理金角色主题。');
requireText(viewSource, 'tm-role-principal-primary', '校长助理交互状态应引用角色主色。');
requireText(viewSource, 'text-[15px]', '紧凑面板中的开场白应使用卡片标题字号。');
requireText(viewSource, '-mt-1 min-h-[96px] w-full rounded-[var(--tm-radius-card)]', '对话卡片应使用教师端统一圆角并容纳完整开场白。');
requireText(cssSource, 'ai-assistant-dialog-card', '应存在共享的助理对话卡片样式。');
requireText(assetsSource, 'ai-principal-assistant-character.png', '应接入女性 AI 校长助理形象资源。');
requireText(assetsSource, 'ai-principal-assistant-icon.png', '应接入校长助理入口图标资源。');
requireText(viewSource, 'ASSETS.MANAGEMENT.AI_PRINCIPAL_ASSISTANT_CHARACTER', '子页面顶部应使用校长助理形象。');

requireText(viewSource, '本周管理建议', '第一个选项应提供周管理建议。');
requireText(viewSource, '上月学校复盘', '第二个选项应提供月度学校复盘。');
requireText(viewSource, '学期学校报告', '第三个选项应提供学期学校报告。');
requireText(viewSource, 'onOpenWeeklyReport();', '周管理建议入口应直接进入可用页面。');
requireText(viewSource, 'onOpenMonthlyReport();', '月度学校复盘入口应直接进入可用页面。');
requireText(viewSource, 'getPrincipalTermReportAvailability(termConfig)', '学期报告点击前应按后台学期配置判断生成资格。');
requireText(viewSource, "hasGeneratedTermReport || availability.status === 'available'", '已生成报告应可直接查看，未生成报告仅在窗口内生成。');
requireText(viewSource, '<MobileNoticeSheet', '未到生成时间时应使用统一手机端提示浮层。');
forbidText(viewSource, 'window.alert', '校长助理不应继续使用浏览器原生弹窗。');
forbidText(viewSource, '能力建设中', '三个校长助理入口均应可用，不应保留能力建设中占位。');
forbidText(viewSource, 'showPendingFeedback', '周月报告不应继续走占位提示。');
forbidText(viewSource, 'from-blue-', '校长助理不应继续使用蓝色作为教师端AI主色。');
forbidText(viewSource, 'from-violet-', '校长助理不应继续使用紫色作为教师端AI主色。');
forbidText(viewSource, 'tm-ai-assistant-', '校长助理不应继续绑定固定人工智能颜色。');

forbidText(viewSource, '<textarea', '当前版本不应开放自主输入内容。');
forbidText(viewSource, '<input', '当前版本不应开放自主输入内容。');
forbidText(viewSource, '按住', '当前版本不应开放语音对话入口。');
forbidText(viewSource, '发消息', '当前版本不应展示自由对话输入提示。');

for (const required of [
  '学期结束日期所在月份的前一个月',
  '学期结束日期所在月份',
  '结束月份前一个月的1日',
  '同一学校、同一报告周期只保留一份正式结果',
  '当前不开放对话',
  '三个入口均可点击进入生成或报告阅读页',
  '每天更新学校数据快照、统计指标和异常候选，但不每天调用大模型生成报告',
]) {
  requireText(prdSource, required, `校长助理PRD缺少关键规则：${required}`);
}

console.log('AiPrincipalAssistantView entry assertions passed');
