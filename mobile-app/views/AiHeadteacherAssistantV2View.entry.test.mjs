import assert from 'node:assert/strict';
import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./AiHeadteacherAssistantV2View.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const accessSource = fs.readFileSync(new URL('../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');
const unifiedPrdSource = fs.readFileSync(new URL('../../docs/PRD-班主任助理.md', import.meta.url), 'utf8');

const requireText = (source, text, message) => {
  assert.ok(source.includes(text), message);
};

requireText(accessSource, "| 'headteacherAssistantV2'", '权限类型应包含 V2 能力。');
requireText(accessSource, 'space.enabledManagementTools', '菜单必须优先读取后台明确返回的能力列表。');
requireText(accessSource, "export type HeadteacherAssistantScope = 'student' | 'class';", '统一助理应区分学生评价和班级评价能力范围。');
requireText(accessSource, 'getHeadteacherAssistantScopes', '统一助理应从学校配置解析能力范围。');

requireText(meSource, "id: 'headteacherAssistant'", '管理工具应保留统一班主任助理入口。');
assert.ok(!meSource.includes("id: 'headteacherAssistantV2'"), '管理工具不应再显示第二个班主任助理入口。');
assert.ok(!meSource.includes("title: '班主任助理 V2'"), '用户界面不应再显示 V2 产品名称。');
assert.equal(
  (meSource.match(/imageSrc: ASSETS\.MANAGEMENT\.AI_HEADTEACHER_ASSISTANT/g) ?? []).length,
  1,
  '我的页只能展示一个班主任助理入口。',
);
assert.ok(!meSource.includes('onOpenAiHeadteacherAssistantV2'), '我的页不应再暴露独立 V2 导航回调。');

requireText(appSource, "import AiHeadteacherAssistantV2View from './views/AiHeadteacherAssistantV2View';", 'App 应复用现有对话页面实现统一助理。');
requireText(appSource, "onOpenAiHeadteacherAssistant={() => navigateTo('ai_headteacher_assistant')}", '统一入口应进入班主任助理页面。');
requireText(appSource, "currentView === 'ai_headteacher_assistant' || currentView === 'ai_headteacher_assistant_v2'", '旧 V2 路由应仅作为统一页面兼容别名。');
requireText(appSource, 'const isHeadteacherAssistantView =', '统一助理的新旧兼容路由应共用页面能力判定。');
requireText(appSource, "'archive_design'].includes(currentView) || isHeadteacherAssistantView", '统一助理应接管页面滚动并占满剩余屏幕。');
requireText(appSource, "showStudentEvaluation={headteacherAssistantScopes.includes('student')}", '统一页面应按学生评价能力组合内容。');
requireText(appSource, "showClassEvaluation={headteacherAssistantScopes.includes('class')}", '统一页面应按班级评价能力组合内容。');
assert.ok(!appSource.includes('onOpenAiHeadteacherAssistantV2={()'), 'App 不应再生成独立 V2 菜单导航。');

for (const rule of ['仅学生评价', '仅班级评价', '学生评价和班级评价', '不显示班主任助理入口']) {
  requireText(unifiedPrdSource, rule, `统一 PRD 应覆盖规则：${rule}`);
}

requireText(viewSource, '<AssistantSubpageHeader', '统一页面应使用公共子页标题栏。');
requireText(viewSource, '<ClassContextPanel', '概览页应使用统一班级上下文卡片。');
requireText(viewSource, 'aria-label="当前班级数据与分析功能"', '班级切换、本周数据和分析功能应收拢在一张总卡中。');
requireText(viewSource, '<AssistantClassSwitchButton', '统一页面应复用班主任助理班级切换控件。');
requireText(viewSource, 'centerContent={(activeReport || isGenerating || historyOpen)', '概览态标题栏不应显示班级切换，报告和历史状态仍应保留切班能力。');
assert.ok(!viewSource.includes('AssistantSubpageHeader title='), 'V2 标题栏不应继续显示页面名称。');
requireText(viewSource, '<HomeroomClassPickerSheet', 'V2 应复用带班班级选择组件。');
assert.ok(!viewSource.includes('<MobileBottomSheet'), '班主任助理 V2 不应提供依据明细抽屉。');
for (const label of ['本周学生情况洞察与班级跟进建议', '上月评价记录复盘与改进建议']) {
  requireText(viewSource, label, `统一页面应提供学生评价单行能力：${label}`);
}
requireText(viewSource, 'aria-label="报告快捷入口"', '两项报告应作为独立高层级快捷入口。');
requireText(viewSource, 'min-h-14 w-full items-center', '学生评价能力块应保持紧凑且满足触控高度。');
requireText(viewSource, 'whitespace-nowrap text-[length:var(--tm-font-size-body)] font-medium leading-5', '学生评价能力应使用舒展的正文级单行文字层级。');
requireText(viewSource, 'headteacher-agent-glass headteacher-context-card', '班级上下文总卡应使用独立表面层级。');
requireText(viewSource, 'bg-[var(--tm-role-headteacher-data-surface)] [box-shadow:var(--tm-role-headteacher-data-shadow)]', '本周数据应通过浅色表面和环境阴影与总卡建立清晰边界。');
requireText(viewSource, 'rounded-[var(--tm-radius-card)] p-2', '总卡与内部内容应使用同心圆角和八像素间距。');
requireText(viewSource, 'rounded-[var(--tm-radius-control)] bg-[var(--tm-role-headteacher-data-surface)]', '本周数据内卡应使用十二像素圆角。');
requireText(viewSource, 'variant="quiet"', '概览态班级切换应使用弱化文字样式。');
requireText(viewSource, '{canSwitchClass && (', '概览态只有存在多个带班班级时才应展示班级切换控件。');
requireText(viewSource, '<div className="mx-2">', '本周数据卡应相对总卡主动缩进。');
requireText(viewSource, 'className={`mx-3 pb-2 ${showClassEvaluation ? \'mt-3\' : \'\'}`}', '报告入口应比数据卡进一步缩进，并与总卡底边保留十六像素空间。');
for (const icon of ['ChartNoAxesCombined', 'Telescope', 'ScanSearch']) {
  requireText(viewSource, icon, `概览应使用语义图标：${icon}`);
}
assert.ok(!viewSource.includes('description:'), '学生评价能力入口不应继续维护第二行描述。');
requireText(viewSource, 'showClassEvaluation={showClassEvaluation}', '班级上下文卡应按班级评价能力组合数据面板。');
requireText(viewSource, 'showStudentEvaluation={showStudentEvaluation}', '班级上下文卡应按学生评价能力组合功能块。');
assert.ok(
  viewSource.indexOf('<WeekOverviewPanel') < viewSource.indexOf('<StudentQuestionList'),
  '双开时应先展示班级数据面板，再展示学生评价问题。',
);
assert.ok(
  viewSource.indexOf('<StudentQuestionList') < viewSource.indexOf('<ConversationThread'),
  '学生评价问题应位于会话内容之前。',
);
requireText(viewSource, '<AutoResizeTextarea', '自由对话应使用自动增高文字输入框。');
requireText(viewSource, 'SpeechRecognitionConstructor', '自由对话应支持浏览器语音识别能力。');
requireText(viewSource, "'按住说话'", '底部输入区应提供语音输入。');
requireText(viewSource, 'aria-label="切换到文字输入"', '语音模式应能切换到文字输入。');
requireText(viewSource, 'aria-label="切换到语音输入"', '文字模式应能切换回语音输入。');
requireText(viewSource, 'aria-label="发送问题"', '文字模式应提供明确的发送入口。');
assert.ok(!viewSource.includes('Camera'), '班主任 Agent 对话不应提供拍照入口。');
assert.ok(!viewSource.includes('Plus'), '对话输入栏不应提供添加入口。');
requireText(viewSource, '数据概览', '完整周报应先展示确定性数据统计。');
requireText(viewSource, '本周整体表现', '完整周报应包含整体表现分析。');
requireText(viewSource, '主要扣分问题', '完整周报应包含扣分问题分析。');
requireText(viewSource, '下周关注重点', '完整周报应包含下周指导建议。');
requireText(viewSource, '<Sparkles', '人工智能分析应使用清晰、统一的图标。');
assert.ok(!viewSource.includes('查看依据'), '班主任助理 V2 不应提供查看依据入口。');
requireText(viewSource, '内容由AI生成仅供参考。', '页面应在输入栏下方披露人工智能内容。');
requireText(viewSource, '<footer className="relative z-30 shrink-0 bg-transparent">', '快捷问题和输入控件应收拢在不随正文滚动的底部栏。');
assert.ok(
  viewSource.indexOf('<QuestionComposer') < viewSource.indexOf('内容由AI生成仅供参考。'),
  '人工智能内容提示应放在对话输入控件下方。',
);
requireText(viewSource, 'className="shrink-0 bg-transparent px-3 pt-1"', '输入控件不应再单独占用底部安全区。');
for (const unrelatedCopy of ['责任拆分', '整改状态', '教师组织责任']) {
  assert.ok(!viewSource.includes(unrelatedCopy), `页面不应展示系统不存在的“${unrelatedCopy}”。`);
}
requireText(viewSource, 'ASSETS.MANAGEMENT.AI_HEADTEACHER_ASSISTANT_CHARACTER', 'Agent 首屏应复用班主任助理虚拟形象。');
requireText(viewSource, 'alt="AI班主任助理形象"', '虚拟形象应提供明确替代文本。');
requireText(viewSource, '我将为您提供数据分析和指导建议', '首屏应使用精简的动态问候文案。');
requireText(viewSource, '`${greeting}，\\n我将为您提供数据分析和指导建议。`', '时段问候后应固定换行展示说明文案。');
requireText(viewSource, 'whitespace-pre-line text-pretty', '打字机文案容器应保留问候后的换行。');
requireText(viewSource, 'ai-assistant-typewriter-shine', '动态问候应复用 V1 的渐变光效文字。');
requireText(appSource, "currentView === 'ai_headteacher_assistant' || currentView === 'ai_headteacher_assistant_v2'", '统一助理及旧兼容路由应使用同一整屏背景。');
requireText(appSource, 'headteacher-agent-gradient-page absolute inset-0', 'V2 渐变应铺满手机屏幕并覆盖状态栏安全区。');
requireText(appSource, '|| isHeadteacherAssistantView || hasPrincipalReportBackground', '统一助理内容承载层必须透明，不能用白底覆盖整屏渐变。');
requireText(viewSource, 'bg-transparent', 'V2 内容层应保持透明，避免渐变在安全区后重新开始。');
requireText(viewSource, 'headteacher-agent-glass', '本周数据卡片应使用拟态玻璃效果。');
requireText(viewSource, '本周数据', '首屏应展示本周数据面板。');
requireText(viewSource, '本周总分', '收起态应展示本周总分。');
requireText(viewSource, '年级排名', '收起态应明确展示年级排名。');
requireText(viewSource, '学校排名', '收起态应明确展示学校排名。');
requireText(viewSource, 'grid grid-cols-[1.18fr_0.82fr]', '本周数据应突出总分，并将两个排名收为次级信息。');
requireText(viewSource, 'style={{ width: `${Math.min(Math.max(snapshot.finalScore, 0), 100)}%` }}', '总分应通过紧凑进度线提供视觉表达。');
assert.ok(!viewSource.includes('{week.summary}'), '本周数据卡不应为了装饰增加额外结论文案。');
assert.ok(!viewSource.includes('当前排名'), '总分排名不应继续使用含义模糊的当前排名文案。');
assert.ok(!viewSource.includes('班级排名'), '周数据子页不应继续使用含义模糊的班级排名文案。');
requireText(viewSource, 'h-[148px]', '首屏头图区应保持紧凑，避免数据卡下沉。');
assert.ok(!viewSource.includes('weekly-analysis-title'), '首页不应再展示班级周评分析板块。');
assert.equal(
  (viewSource.match(/setHistoryOpen\(true\)/g) ?? []).length,
  1,
  '往期报告入口只应出现在报告详情页，不应占用首页外层空间。',
);
requireText(viewSource, '打开周数据页面', '日期切换入口应打开独立周数据页面。');
requireText(viewSource, "'\u6253\u5f00\u5468\u6570\u636e\u9875\u9762\uff0c\u5f53\u524d' + week.label", '首页本周日期应展示完整自然周。');
requireText(viewSource, 'OVERVIEW_RECOMMENDED_QUESTIONS', '首页应提供紧凑的推荐问题。');
assert.ok(!viewSource.includes('可以这样问'), '快捷问题上方不应增加说明文案。');
for (const question of ['班级评价主要扣在哪？', '班级评价较上周哪项变化最大？', '根据班级评价，下周优先关注什么？']) {
  requireText(viewSource, question, `班级评价快捷问题应使用明确且自然的文案：${question}`);
}
requireText(viewSource, 'suggestedQuestions={messages.length > 0 ? followUpQuestions : OVERVIEW_RECOMMENDED_QUESTIONS}', '输入区应根据对话状态展示首轮建议或连续追问。');
assert.ok(
  viewSource.indexOf('<SuggestedQuestionList') < viewSource.indexOf("{mode === 'voice' ? ("),
  '建议问题应位于语音或文字输入控件上方。',
);
requireText(viewSource, 'touch-pan-x gap-2 overflow-x-auto overscroll-x-contain', '建议问题应支持单行左右滑动。');
requireText(viewSource, 'shrink-0 whitespace-nowrap', '快捷问题按内容自然定宽，不应填充多余空间。');
requireText(viewSource, '共${questions.length}个快捷问题', '快捷问题应对辅助技术明确总数。');
assert.ok(!viewSource.includes('activeIndex'), '紧凑快捷问题不应增加轮播指示状态。');
assert.ok(!viewSource.includes('w-[calc(100%-48px)]'), '快捷问题不应使用制造空白的固定卡片宽度。');
requireText(viewSource, 'min-h-[var(--tm-size-touch)] shrink-0', '建议问题应保持44像素触控高度。');
assert.ok(!viewSource.includes('recommendedQuestions: readonly string[];'), '本周数据卡不应再承载建议问题。');
requireText(viewSource, '<ConversationThread', '发起提问后应在概览页内追加对话消息。');
requireText(viewSource, 'latestAssistant.offsetTop - 8', 'Agent 回复后应只滚动中部内容区并保留顶部间距。');
assert.ok(!viewSource.includes('latestAssistantRef.current?.scrollIntoView'), 'Agent 回复不得通过全局滚动带动固定底部栏。');
assert.ok(!viewSource.includes(') : conversationOpen ? ('), '推荐问题不应跳转到独立对话页面。');
assert.ok(!viewSource.includes('AgentMessageIdentity'), 'Agent 回复不应展示额外头像。');
assert.ok(!viewSource.includes('>班主任助理</div>'), 'Agent 回复不应重复展示身份名称。');
requireText(viewSource, 'headteacher-agent-glass min-w-0 flex-1', 'Agent 回复应直接使用左侧浅色内容气泡。');
requireText(viewSource, '正在分析班级评价数据', 'Agent 回复前应展示分析中的对话反馈。');
const conversationAnswerSource = viewSource.slice(
  viewSource.indexOf('const ConversationAnswerContent'),
  viewSource.indexOf('const ConversationThread'),
);
requireText(conversationAnswerSource, 'space-y-3 text-pretty text-[14px] font-normal leading-6 text-[var(--tm-text-primary)]', '快捷问题回答应使用统一的普通正文样式。');
requireText(conversationAnswerSource, '具体来看，{answer.breakdown.map', '分类数据应转换为自然文本段落。');
requireText(conversationAnswerSource, "<p>从分析结果看，{answer.analysis.map(item => item.body).join('')}</p>", '分析内容应通过承接语合并为一个自然段。');
requireText(conversationAnswerSource, "<p>接下来，{answer.suggestions.map(item => item.body).join('')}</p>", '行动建议应通过承接语合并为一个自然段。');
assert.ok(!conversationAnswerSource.includes('answer.metrics.map'), '关键数据不应机械重复首段已经表达的结论。');
assert.ok(!conversationAnswerSource.includes('answer.evidenceRefs'), '快捷问题回答不应保留依据功能。');
for (const forbidden of ['<Sparkles', '<ListChecks', 'aria-label="人工智能分析"', 'aria-label="人工智能建议"', 'text-[var(--tm-status-negative)]', 'text-[var(--tm-assistant-role-text)]']) {
  assert.ok(!conversationAnswerSource.includes(forbidden), `快捷问题回答不应使用特殊分区或彩色文字：${forbidden}`);
}
requireText(viewSource, 'getFollowUpQuestions', '回答后应提供不重复当前问题的连续追问。');
requireText(viewSource, 'askClassEvaluationQuestion', '自由问题应进入班级评价问答领域逻辑。');
assert.ok(!viewSource.includes('getRecordsFromAnswer'), '对话回答不应再按证据编号打开逐笔记录。');
requireText(viewSource, 'rankings.map', '展开态应展示五项一级指标的得分和排名。');
requireText(viewSource, '<span>分类数据</span>', '收起态入口应命名为分类数据。');
requireText(viewSource, 'items-center justify-end bg-[var(--tm-bg-surface-glass)] px-3', '数据卡底部只应保留右侧分类入口。');
requireText(viewSource, "aria-label={expanded ? '收起分类数据' : '展开分类数据'}", '分类数据按钮应按展开状态提供准确的无障碍名称。');
requireText(viewSource, 'h-[var(--tm-assistant-secondary-pill-height)] w-[92px]', '分类数据入口应使用更紧凑的92×30像素可见胶囊。');
requireText(viewSource, 'h-[var(--tm-assistant-icon-control-visual-size)] w-[var(--tm-assistant-icon-control-visual-size)]', '收起箭头应使用36像素可见圆形按钮。');
requireText(viewSource, 'after:-inset-y-[7px]', '分类数据入口应在30像素外观之外保留44像素触控高度。');
requireText(viewSource, 'after:-inset-1', '收起箭头应在36像素外观之外保留44像素触控区域。');
requireText(viewSource, 'transition-[width,height,scale,background-color,box-shadow]', '分类数据展开与收起应使用可中断的精确属性过渡。');
requireText(viewSource, "expanded ? 'rotate-180' : 'rotate-0'", '分类数据箭头应连续旋转表达展开状态。');
requireText(viewSource, '<DimensionRankingTable', '展开态应使用四列分类数据表。');
requireText(viewSource, 'formatCompactScore(item.score)', '分类数据表的整数分值不应重复显示无效小数位。');
requireText(viewSource, '<DimensionScoreBullet score={item.score} maxScore={item.maxScore} />', '分类数据分数列应使用紧凑子弹图展示当前分与满分。');
requireText(viewSource, '(score / maxScore) * 100', '子弹图长度应按当前分与满分的比例计算。');
assert.ok(!viewSource.includes('-right-px -top-0.5 h-2.5 w-px'), '分类数据进度条不应再展示竖向满分标记。');
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
requireText(viewSource, 'initialDimension={detailInitialDimension ?? undefined}', '分类明细应在子页定位到当前一级指标。');
requireText(viewSource, 'setWeekDetailOpen(true)', '点击分类行或展示明细应进入周数据子页。');
assert.ok(!viewSource.includes('DimensionDetailSheetHeader'), '分类明细不应再使用底部弹窗。');
requireText(viewSource, 'role="tablist" aria-label="一级指标"', '周数据子页应提供一级指标切换。');
assert.ok(!viewSource.includes('expandedDimension'), '分类数据不应继续在主卡片内展开扣分记录。');
requireText(viewSource, 'WeekDataDetailPage', '日期入口应使用独立周数据页。');
requireText(viewSource, 'aria-label="查看上一周"', '周数据页顶部应支持查看上一周。');
requireText(viewSource, 'aria-label="查看下一周"', '周数据页顶部应支持查看下一周。');
assert.ok(!viewSource.includes('本周数据已结算'), '周数据子页不应展示已结算信息。');
assert.ok(!viewSource.includes('week.snapshotLabel'), '周数据子页不应展示数据截止时间。');
assert.ok(!viewSource.includes('>累计扣分</span>'), '周数据子页的基本统计不应展示累计扣分。');
requireText(viewSource, 'id="week-dimensions-title"', '周数据页应常驻展示分类数据。');
assert.ok(!viewSource.includes('<span className="text-[11px] tabular-nums text-[var(--tm-text-tertiary)]">{week.dataRangeLabel}</span>'), '分类数据不应重复展示顶部已有的时间周期。');
requireText(viewSource, 'selectedDimension={selectedRanking?.dimension}', '周数据页分类表应突出当前选择的一级指标。');
requireText(viewSource, 'selectedRecords = records.filter', '周数据页扣分明细应跟随一级指标筛选。');
requireText(viewSource, "record.indicatorPath?.join(' / ')", '每笔扣分明细应展示一、二、三级完整指标路径。');
requireText(viewSource, '>原文</div>', '每笔扣分明细应展示评价原文。');
assert.ok(!viewSource.includes('selectedDeduction'), '多笔扣分明细不应汇总扣分合计。');
assert.ok(!viewSource.includes('>扣分依据</dt>'), '扣分明细不应展示扣分依据。');
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
assert.ok(!viewSource.includes('activeReport.evidenceRecords'), '历史报告也不应提供查看依据入口。');
requireText(viewSource, '返回概览', '报告态应支持返回周评概览。');
assert.ok(!viewSource.includes('继续分析'), '报告页不应重复展示三个固定问题。');
assert.ok(!viewSource.includes('role="tablist" aria-label="报告类型"'), '往期报告不应再按三个问题类型分栏。');
requireText(viewSource, 'interface ChatMessage', '自由对话应使用独立消息模型，不写入周报历史。');
requireText(viewSource, '返回概览', '对话态应支持返回 V2 概览。');

console.log('AiHeadteacherAssistantV2View entry assertions passed');
