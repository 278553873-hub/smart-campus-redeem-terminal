import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./AiPrincipalAssistantView.tsx', import.meta.url), 'utf8');
const typewriterSource = fs.readFileSync(new URL('../hooks/useAssistantTypewriter.ts', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const assetsSource = fs.readFileSync(new URL('../assets/images.ts', import.meta.url), 'utf8');
const cssSource = fs.readFileSync(new URL('../index.css', import.meta.url), 'utf8');
const prdSource = fs.readFileSync(new URL('../../docs/PRD-校长助理周月学期报告.md', import.meta.url), 'utf8');
const composerSource = fs.readFileSync(new URL('../components/assistant-chat/AssistantComposer.tsx', import.meta.url), 'utf8');
const threadSource = fs.readFileSync(new URL('../components/assistant-chat/AssistantConversationThread.tsx', import.meta.url), 'utf8');
const suggestedSource = fs.readFileSync(new URL('../components/assistant-chat/AssistantSuggestedQuestions.tsx', import.meta.url), 'utf8');
const conversationSource = fs.readFileSync(new URL('../domain/principalAssistantConversation.ts', import.meta.url), 'utf8');
const principalData = fs.readFileSync(new URL('../data/principalAssistant.ts', import.meta.url), 'utf8');

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
requireText(appSource, "hasTermReportTask={principalTermReportTask.status !== 'idle'}", 'AI 校长助理应允许重新进入正在生成或已完成的学期任务。');
requireText(appSource, "useReportGenerationTask({ stepCount: 4, initialStatus: 'generated' })", '演示环境应直接读取已生成的当前学期报告。');
requireText(appSource, 'principalWeeklyReportTask.start();', 'AI 校长助理应在应用层启动本周管理建议任务。');
requireText(appSource, 'principalMonthlyReportTask.start();', 'AI 校长助理应在应用层启动上月学校复盘任务。');
requireText(appSource, 'principalTermReportTask.start();', 'AI 校长助理应在应用层启动学期学校报告任务。');
requireText(appSource, "currentView !== 'ai_principal_assistant'", 'AI 校长助理页面不应继续显示通用顶部标题栏。');

requireText(viewSource, 'AI校长助理形象', '子页面顶部应展示 AI 校长助理形象。');
requireText(viewSource, '我将为您提供学校数据分析和管理建议。', '开场白应说明校长助理的分析与管理建议能力。');
requireText(viewSource, 'typedMessage', '校长助理开场白应按打字机效果逐步显示。');
requireText(viewSource, 'const typedMessage = useAssistantTypewriter(assistantMessage);', '开场白应复用共享打字机能力。');
requireText(viewSource, 'getAssistantGreeting', '开场白应按时段给出问候语，与班主任助理一致。');
forbidText(viewSource, '你好，我是校长助理', '开场白不应重复自我介绍。');
requireText(typewriterSource, 'export const useAssistantTypewriter', '应存在助理共用打字机 Hook。');
requireText(typewriterSource, 'export const getAssistantGreeting', '共用 Hook 应提供统一问候语。');
requireText(typewriterSource, 'return 56;', '普通字符打字速度应与班主任助理一致。');
requireText(typewriterSource, 'return 280;', '换行处应保留短停顿。');
if ('我将为您提供学校数据分析和管理建议。'.length > 20) throw new Error('开场白第二行应控制在20字以内，保证整体不超过三行。');
requireText(viewSource, 'AssistantSubpageHeader onBack={onBack} surface="transparent"', '校长助理入口页应复用公共子页标题栏，并以透明表面承接屏幕级角色背景。');
requireText(viewSource, 'data-view-scroll-root className="min-h-0 flex-1 overflow-y-auto', '校长助理入口页应由页面自己持有滚动容器，标题栏不随内容滚动。');
forbidText(viewSource, 'rounded-full bg-[var(--tm-bg-surface-glass)]', '校长助理入口页返回入口不应再自绘圆形玻璃底按钮。');
requireText(viewSource, 'h-[148px] overflow-hidden px-5', '主视觉应收窄成一条横幅，把首屏高度让给报告入口和对话。');
requireText(viewSource, 'h-[154px] w-[154px]', 'AI 校长助理形象应与班主任助理保持同一档尺寸。');
requireText(viewSource, 'h-[154px] w-[154px] select-none object-contain object-bottom drop-shadow', 'AI 校长助理形象应保持原色直接渲染。');
forbidText(viewSource, 'mix-blend-multiply', 'AI 校长助理形象不应使用正片叠底。');
forbidText(viewSource, 'WebkitMaskImage', 'AI 校长助理形象不应再用前端遮罩伪融合。');
forbidText(viewSource, 'maskImage', 'AI 校长助理形象不应再用前端遮罩伪融合。');
requireText(viewSource, 'ai-assistant-typewriter-shine', 'AI 校长助理开场白应使用共享文字效果。');
requireText(viewSource, 'ai-assistant-theme-principal relative flex min-h-0 flex-1 flex-col overflow-hidden bg-transparent', '校长助理页面应注入深红与管理金角色主题，由页面自己持有滚动容器并保持内容层透明。');
requireText(appSource, 'principal-agent-gradient-page absolute inset-0', '校长助理渐变应铺满手机屏幕并覆盖状态栏安全区。');
requireText(cssSource, '.principal-agent-gradient-page', '应存在校长助理整屏角色渐变样式。');
forbidText(viewSource, 'teacher-assistant-page', '校长助理不应再把渐变绘制在随内容拉伸的页面根节点上。');
requireText(viewSource, 'var(--tm-assistant-role-primary)', '校长助理交互状态应引用由校长助理主题注入的角色主色。');
requireText(viewSource, 'text-[17px] font-bold', '开场白应使用与班主任助理一致的标题字号。');
requireText(viewSource, 'assistant-agent-glass assistant-context-card', '三个报告入口应放进与班主任助理同一套玻璃卡容器。');
requireText(viewSource, 'mx-4 -mt-5 overflow-hidden rounded-[var(--tm-radius-card)] p-2', '报告入口卡应与班主任助理的能力卡片同尺寸、同叠压方式。');
requireText(viewSource, 'min-h-14 w-full items-center gap-2.5 rounded-[var(--tm-radius-control)]', '三个报告入口应改为单行紧凑入口，不再写第二行说明。');
requireText(assetsSource, 'ai-principal-assistant-character.png', '应接入女性 AI 校长助理形象资源。');
requireText(assetsSource, 'ai-principal-assistant-icon.png', '应接入校长助理入口图标资源。');
requireText(viewSource, 'ASSETS.MANAGEMENT.AI_PRINCIPAL_ASSISTANT_CHARACTER', '子页面顶部应使用校长助理形象。');

requireText(viewSource, '本周管理建议', '第一个选项应提供周管理建议。');
requireText(viewSource, '上月学校复盘', '第二个选项应提供月度学校复盘。');
requireText(viewSource, '学期学校报告', '第三个选项应提供学期学校报告。');
requireText(viewSource, 'onOpenWeeklyReport();', '周管理建议入口应直接进入可用页面。');
requireText(viewSource, 'onOpenMonthlyReport();', '月度学校复盘入口应直接进入可用页面。');
requireText(viewSource, 'const TERM_REPORT_ENTRY_ENABLED = false;', '期末报告入口当前应处于隐藏状态。');
requireText(viewSource, '{visibleAssistantOptions.map(item => (', '入口卡只应渲染当前可见的报告入口。');
forbidText(viewSource, '{assistantOptions.map(item => (', '入口卡不应无条件渲染全部入口，否则隐藏开关会失效。');
requireText(viewSource, 'getPrincipalTermReportAvailability(termConfig)', '学期报告点击前应按后台学期配置判断生成资格。');
requireText(viewSource, "hasTermReportTask || availability.status === 'available'", '已有任务应可直接查看，未创建任务仅在窗口内生成。');
requireText(viewSource, '<MobileNoticeSheet', '未到生成时间时应使用统一手机端提示浮层。');
forbidText(viewSource, 'window.alert', '校长助理不应继续使用浏览器原生弹窗。');
forbidText(viewSource, '能力建设中', '三个校长助理入口均应可用，不应保留能力建设中占位。');
forbidText(viewSource, 'showPendingFeedback', '周月报告不应继续走占位提示。');
forbidText(viewSource, 'from-blue-', '校长助理不应继续使用蓝色作为教师端AI主色。');
forbidText(viewSource, 'from-violet-', '校长助理不应继续使用紫色作为教师端AI主色。');
forbidText(viewSource, 'tm-ai-assistant-', '校长助理不应继续绑定固定人工智能颜色。');

requireText(viewSource, '<AssistantComposer', '校长助理底部应提供语音与文字输入控件。');
requireText(viewSource, '<AssistantConversationThread', '校长助理应展示当前会话内容。');
requireText(viewSource, 'PRINCIPAL_ASSISTANT_REPLYING_LABEL', '校长助理回复中应说明正在分析学校数据。');
requireText(viewSource, 'askPrincipalAssistantQuestion', '自由提问应交给学校口径的问答逻辑。');
requireText(viewSource, 'getPrincipalAssistantSnapshot', '回答应基于学校数据快照。');
requireText(viewSource, 'PRINCIPAL_ASSISTANT_FOLLOW_UP_QUESTIONS', '回答后应按回答口径更新三条建议问题。');
requireText(viewSource, 'PRINCIPAL_ASSISTANT_SUGGESTED_QUESTIONS', '新会话应给出固定的建议问题。');
requireText(viewSource, 'space-y-2 pb-2', '三个报告入口应按班主任助理的间距成组排布。');
requireText(composerSource, '按住说话', '语音输入应支持按住说话。');
requireText(composerSource, 'AutoResizeTextarea', '文字输入应支持自动增高。');
requireText(composerSource, 'AssistantSuggestedQuestions', '输入控件上方应展示建议问题。');
requireText(suggestedSource, 'touch-pan-x', '建议问题应支持横向滑动。');
requireText(threadSource, 'assistant-agent-glass', '对话内容应使用助理主题的玻璃气泡。');
requireText(threadSource, '具体来看', '回答应把数据点展开成具体来看一段。');
requireText(conversationSource, '哪些班级需要重点关注？', '建议问题应包含班级关注问题。');
requireText(principalData, '五年级5班', '班级关注回答应点名到具体班级，而不是只给统计。');

for (const required of [
  '学期结束日期所在月份的前一个月',
  '学期结束日期所在月份',
  '结束月份前一个月的1日',
  '同一学校、同一报告周期只保留一份正式结果',
  '入口页自由对话',
  '本周学校需要重点关注什么？',
  '哪些班级需要重点关注？',
  '每次回答后按该回答的口径重新给出三条建议问题',
  '要点名到具体班级，而不是只给统计',
  '入口均可点击进入生成或报告阅读页',
  '当前版本先隐藏`学期学校报告`入口',
  '每天更新学校数据快照、统计指标和异常候选，但不每天调用大模型生成报告',
]) {
  requireText(prdSource, required, `校长助理PRD缺少关键规则：${required}`);
}

console.log('AiPrincipalAssistantView entry assertions passed');
