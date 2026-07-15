import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./QuestionnaireManagementView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('../MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');
const parentSource = fs.readFileSync(new URL('../../../components/ParentApp.tsx', import.meta.url), 'utf8');
const storeSource = fs.readFileSync(new URL('../../../shared/questionnaireStore.ts', import.meta.url), 'utf8');
const teacherTokenSource = fs.readFileSync(new URL('../../styles/teacherMobileTokens.css', import.meta.url), 'utf8');
const listSource = viewSource.slice(viewSource.indexOf('const renderList'), viewSource.indexOf('const renderQuestionEditor'));
const detailSource = viewSource.slice(viewSource.indexOf('const renderDetail'), viewSource.indexOf('const renderResponseDetail'));

const requireText = (source, text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

for (const required of ['科目管理', '部门管理', '货币发放', '建议反馈', '问卷调查']) {
  requireText(meSource, required, `更多工具缺少${required}入口。`);
}

const moreToolsSource = meSource.slice(meSource.indexOf('const moreTools'), meSource.indexOf('const teacherName'));
if (moreToolsSource.indexOf("title: '问卷调查'") < moreToolsSource.indexOf("title: '建议反馈'")) {
  throw new Error('问卷调查必须位于现有四个入口之后，作为第二行首项。');
}
requireText(meSource, '<ToolGrid items={moreTools} variant="secondary" />', '更多工具必须继续使用默认四列布局。');
requireText(appSource, "'questionnaire'", '教师端导航必须注册问卷调查页面。');

for (const required of [
  '编辑问卷',
  '发送范围',
  '确认发布',
  '收集中',
  '已结束',
  '草稿',
  '数据',
  '答卷',
  '预览问卷',
  '未绑定家长',
]) {
  requireText(viewSource, required, `教师端问卷流程缺少：${required}`);
}

for (const questionType of ["single: { label: '单选题'", "multiple: { label: '多选题'", "rating: { label: '量表题'", "text: { label: '简答题'"]) {
  requireText(viewSource, questionType, `教师端缺少题型：${questionType}`);
}

requireText(storeSource, 'record.targets.filter(target => target.reachable).length', '完成率分母必须使用可送达学生数。');
requireText(storeSource, 'record.submissions.length / reachable', '完成率必须使用已提交数除以可送达数。');
requireText(storeSource, 'suggestedDeadline: string', '问卷必须将建议完成时间与状态分开保存。');
requireText(storeSource, 'isQuestionnaireOverdue', '问卷必须能够识别仅用于提示的逾期状态。');
requireText(storeSource, "questionnaire?.status === 'active'", '家长提交时必须再次确认问卷仍在收集中。');
requireText(storeSource, "rest.suggestedDeadline ?? deadline ?? ''", '历史问卷的截止时间必须兼容迁移为建议完成时间。');
for (const mockId of ['survey-autumn-trip-202607', 'survey-uniform-202607', 'survey-meal-202606', 'survey-summer-care-202607', 'survey-campus-activity-202605', 'survey-home-visit-draft']) {
  requireText(storeSource, mockId, `演示数据缺少问卷：${mockId}`);
}
requireText(storeSource, "cloneSeed().filter(record => !storedIds.has(record.id) && !deletedDraftIds.has(record.id))", '新增演示问卷必须增量补齐，同时不能恢复已删除草稿。');
requireText(parentSource, "setScreen('questionnaireForm')", '家长端必须复用现有问卷填写页打开教师发布问卷。');
requireText(parentSource, 'pendingAssignedQuestionnaires', '家长端待办必须读取教师发布的共享问卷。');
requireText(parentSource, 'setSharedQuestionnaires(readQuestionnaires())', '家长提交后必须刷新共享问卷状态。');
requireText(viewSource, 'useState<QuestionnaireQuestion[]>([])', '新建问卷不应默认创建单选题。');
requireText(viewSource, "const nextQuestions = record?.questions.length ? record.questions : [];", '新问卷必须从空题目状态开始。');
requireText(viewSource, '添加第一题', '空问卷应提供明确的添加第一题入口。');
if (viewSource.includes('label="复制题目"')) {
  throw new Error('题目编辑器不应保留复制题目功能。');
}
requireText(storeSource, 'customAnswerOptions?: string[]', '单选题和多选题必须记录哪些选项支持补充填写。');
requireText(storeSource, 'selectedOptions: string[]', '自定义答案必须结构化保存已选选项。');
requireText(storeSource, 'customText: Record<string, string>', '自定义答案必须结构化保存补充文本。');
if (viewSource.includes('选择后填写')) {
  throw new Error('普通选项不应直接展示低频的选择后填写设置。');
}
requireText(viewSource, '添加“其他（请填写）”', '低频自定义答案能力必须收进更多选项。');
requireText(viewSource, '选中后需填写', '特殊填写项应明确展示其填写状态。');
for (const targetMode of ["['all', '全体学生']", "['classes', '按班级']", "['students', '指定学生']"]) {
  requireText(viewSource, targetMode, `发送范围缺少模式：${targetMode}`);
}
requireText(viewSource, 'onClick={toggleAllClasses}', '按班级模式必须支持一次全选全部班级。');
requireText(viewSource, 'selectedClassIds.has(classInfo.id)', '按班级模式必须支持直接多选班级。');
if (viewSource.includes('已选择学生')) {
  throw new Error('发送范围页不应展示额外的人数摘要卡片。');
}
requireText(storeSource, "QuestionnaireTargetMode = 'all' | 'classes' | 'students'", '草稿必须保存发送范围模式。');
requireText(parentSource, 'pendingAssignedQuestionnaires', '家长端待办必须读取教师发布的共享问卷。');

const assignedSource = fs.readFileSync(new URL('../../../components/parent-app/AssignedQuestionnaireView.tsx', import.meta.url), 'utf8');
requireText(assignedSource, 'showCustomInput', '家长端必须仅在选中可填写选项后展示输入框。');
requireText(assignedSource, 'preview?: boolean', '家长问卷组件必须支持教师预览模式。');
requireText(assignedSource, "preview ? '结束预览'", '教师预览必须提供明确的退出操作。');
requireText(assignedSource, 'placeholder="请补充填写"', '家长端自定义答案输入框应提供清晰占位文案。');
requireText(assignedSource, "questionnaire.status !== 'active'", '家长填写页必须响应老师结束收集。');
requireText(assignedSource, '问卷已结束或已经提交', '状态变化导致提交失败时必须提供明确反馈。');
requireText(viewSource, 'getQuestionnaireSelectedOptions(answer).includes(option)', '题目统计必须将自定义答案计入对应选项。');
requireText(viewSource, "type DetailTab = 'data' | 'responses'", '问卷详情必须合并为数据和答卷两个页签。');
requireText(viewSource, "'question-responses'", '简答题必须支持进入独立的全部回答页。');
requireText(viewSource, "new Intl.Segmenter('zh-CN', { granularity: 'word' })", '简答题高频词必须使用标准中文分词能力。');
requireText(viewSource, '高频词', '简答题数据卡必须展示非人工智能的高频词统计。');
requireText(viewSource, "showAllInline ? '回答' : '最近回答'", '大量简答内容只能在数据卡展示最近回答。');
requireText(viewSource, "showAllInline ? '' : 'line-clamp-3'", '最近回答必须限制高度，避免文本撑高数据卡。');
requireText(viewSource, '查看全部回答', '大量简答内容必须提供全部回答入口。');
requireText(viewSource, '搜索回答或学生', '全部回答页必须支持关键词或学生搜索。');
requireText(viewSource, '按班级筛选回答', '全校问卷回答页必须支持按班级筛选。');
requireText(viewSource, 'setVisibleQuestionResponseCount(count => count + 20)', '大量回答必须分批加载。');
requireText(viewSource, 'filter(row => row.answer).reverse()', '全部回答必须默认按最新提交优先展示。');
requireText(viewSource, 'showEffectiveCount &&', '只有回答数与总答卷数不一致时才显示有效回答数。');
requireText(viewSource, '<AssignedQuestionnaireView', '教师预览必须复用真实家长问卷组件。');
requireText(viewSource, "setPageMode('preview')", '问卷详情必须提供预览入口。');
requireText(detailSource, 'teacher-mobile-token-card mt-4 rounded-[20px] p-4', '问卷详情基本信息卡必须复用教师端公共卡片样式。');
requireText(teacherTokenSource, '.teacher-mobile-token-card', '教师端公共样式必须提供问卷详情卡片类。');
requireText(detailSource, 'aria-label="预览问卷"', '问卷预览必须保留清晰的无障碍名称。');
requireText(detailSource, 'line-clamp-2', '问卷说明最多展示两行，避免挤压首屏数据。');
requireText(detailSource, 'min-h-11', '问卷预览入口必须保留44像素触控高度。');
if (detailSource.includes('<StatusPill') || detailSource.includes('grid-cols-[0.9fr_1.1fr]') || detailSource.includes('border-t border-slate-100 pt-3')) {
  throw new Error('问卷详情卡不应保留状态工具栏、固定两列或割裂内容的分割线。');
}
if (detailSource.includes('statusMeta[activeRecord.status]') || detailSource.includes('getQuestionnaireTargetLabel(activeRecord)') || detailSource.includes('<UsersRound')) {
  throw new Error('问卷详情卡不应展示问卷状态或发送对象。');
}
requireText(detailSource, 'activeRecord.suggestedDeadline &&', '问卷详情卡只应在设置后展示建议完成时间。');
if (viewSource.includes('提醒未完成家长') || viewSource.includes('发送提醒') || storeSource.includes('QuestionnaireReminder') || storeSource.includes('sendQuestionnaireReminder') || parentSource.includes('老师提醒')) {
  throw new Error('问卷流程不应提供提醒未完成家长功能。');
}
if (viewSource.includes('{answers.length}条回答') || viewSource.includes('{answers.length}份回答') || viewSource.includes('`已完成 ${record.submissions.length}`')) {
  throw new Error('问卷详情不应在题目卡或答卷筛选中重复展示完成人数。');
}
if (viewSource.includes('描述性统计') || viewSource.includes('不进行自动总结') || viewSource.includes("['overview', '概览']") || viewSource.includes("['analysis', '题目分析']")) {
  throw new Error('问卷数据页不应保留重复页签或解释性统计文案。');
}
requireText(viewSource, '建议完成时间', '创建与详情页必须使用建议完成时间。');
requireText(viewSource, 'const [hasSuggestedDeadline, setHasSuggestedDeadline] = useState(false);', '新问卷默认不设置建议完成时间。');
requireText(viewSource, "showToast('问卷已重新开放')", '已结束问卷必须支持重新开放。');
requireText(viewSource, '>结束收集</button>', '收集中问卷必须支持人工结束。');
requireText(viewSource, '已到建议完成时间', '逾期后必须向老师提供结束收集入口。');
if (viewSource.includes('>截止时间<') || viewSource.includes('提前结束问卷')) {
  throw new Error('问卷不应再使用强截止或提前结束文案。');
}
requireText(parentSource, "? questionnaire.suggestedDeadline.replace('2026-', '').replace('-', '月').replace(' ', '日 ')", '家长端建议完成时间必须仅显示具体时间。');
if (listSource.includes('当前收集中') || listSource.includes('等待家长提交')) {
  throw new Error('问卷列表顶部不应展示重复统计信息。');
}
if (listSource.includes('<StatusPill') || listSource.includes('继续编辑') || listSource.includes('record.questions.length')) {
  throw new Error('问卷列表不应重复显示状态标签或草稿题目统计。');
}
requireText(listSource, '? formatSuggestedDeadline(record.suggestedDeadline)', '问卷卡片时间必须仅显示具体时间。');
requireText(listSource, 'text-[16px] font-bold leading-[22px]', '问卷名称必须使用清晰的16像素主标题层级。');
requireText(listSource, '{record.submissions.length}/{reachable}</span>', '问卷卡片必须保留直观的提交进度分数。');
requireText(listSource, 'h-1.5 w-12 overflow-hidden rounded-full', '问卷卡片右侧必须展示短进度条。');
requireText(listSource, "record.status === 'draft' ? 'min-h-[76px]' : 'min-h-[92px]'", '问卷卡片必须增加垂直留白。');
requireText(listSource, 'active:scale-[0.96]', '可点击问卷卡片必须保留克制的按压反馈。');
if (listSource.includes('已提交') || listSource.includes('>{completion}%</span>') || listSource.includes('border-t') || listSource.includes('<ChevronRight')) {
  throw new Error('问卷卡片不应显示解释文案、百分比、分割线或展开图标。');
}
if (listSource.includes(' 前')) {
  throw new Error('问卷卡片时间后不应再显示“前”。');
}

requireText(storeSource, "QuestionnaireStatus = 'draft' | 'active' | 'ended' | 'archived'", '问卷生命周期必须包含归档状态。');
requireText(listSource, "[['active', '收集中'], ['ended', '已结束'], ['draft', '草稿']]", '问卷顶部必须继续保持三个高频状态页签。');
if (listSource.includes("['archived', '已归档']")) {
  throw new Error('已归档不应侵入顶部高频状态页签。');
}
requireText(viewSource, "setPageMode('archived-list')", '已归档问卷必须通过二级入口访问。');
requireText(viewSource, 'deleteDraftQuestionnaire(draftId)', '已有草稿必须支持永久删除。');
requireText(storeSource, "record.status !== 'draft'", '数据层必须拒绝删除非草稿问卷。');
requireText(storeSource, "active: ['ended']", '收集中问卷只能先结束收集，不能直接归档。');
requireText(storeSource, "ended: ['active', 'archived']", '已结束问卷必须支持重新开放或归档。');
requireText(storeSource, "archived: ['ended']", '已归档问卷必须支持恢复到已结束。');
requireText(detailSource, '恢复到已结束', '已归档问卷详情必须提供恢复操作。');
requireText(detailSource, '>归档</button>', '已结束问卷详情必须提供归档操作。');
if (detailSource.includes('删除草稿') || detailSource.includes('永久删除')) {
  throw new Error('已发布问卷详情不能提供永久删除入口。');
}
requireText(viewSource, '删除后无法恢复', '永久删除草稿前必须二次确认。');

const fixedHeightPageCount = viewSource.match(/relative flex h-full min-h-0 flex-col overflow-hidden/g)?.length ?? 0;
if (fixedHeightPageCount < 4) {
  throw new Error('问卷列表、创建、详情和答卷详情都必须继承固定可用高度，避免内部滚动区被内容撑开。');
}

const scrollRegionCount = viewSource.match(/min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain/g)?.length ?? 0;
if (scrollRegionCount < 3) {
  throw new Error('问卷列表、创建和详情内容区必须允许收缩并独立纵向滚动。');
}

requireText(viewSource, 'min-h-0 flex-1 touch-pan-y space-y-3 overflow-y-auto overscroll-contain', '单份答卷详情必须保留独立纵向滚动区域。');

requireText(viewSource, 'sticky top-0 z-[45] flex h-11 shrink-0 items-center justify-between border-b border-slate-100/30 bg-white/80 px-4 backdrop-blur-md', '问卷顶部必须与科目管理、部门管理保持相同的44像素高度、背景和分割线。');
requireText(viewSource, 'absolute inset-x-16 truncate text-center text-[17px] font-bold tracking-tight text-slate-800', '问卷顶部标题必须使用17像素居中样式。');
requireText(viewSource, '<ChevronLeft className="h-5 w-5" />', '问卷顶部返回图标必须与管理页保持一致。');
requireText(viewSource, "action ? '-mr-2 h-11 w-11' : 'h-10 w-10'", '问卷顶部操作必须保留44像素触控范围。');
requireText(viewSource, 'label="新建问卷" onClick={() => startCreate()} className="text-[#1E9AAA]"', '新建问卷应使用轻量的青色加号按钮。');
if (viewSource.includes('label="新建问卷" onClick={() => startCreate()} className="bg-[#EAF8FA]')) {
  throw new Error('新建问卷按钮不应常态显示圆形底色。');
}
if (viewSource.includes('subtitle?: string') || viewSource.includes('subtitle={`第${createStep}步，共3步`}')) {
  throw new Error('问卷顶部不应承载步骤或答卷副标题。');
}
requireText(viewSource, '{activeSubmission.studentName}<span className="ml-2 text-[12px] font-medium text-slate-500">{activeSubmission.guardianRelation}</span>', '答卷学生与家长关系信息必须移入内容区。');

console.log('Questionnaire management assertions passed');
