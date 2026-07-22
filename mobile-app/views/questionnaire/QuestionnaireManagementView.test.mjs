import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./QuestionnaireManagementView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('../MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');
const parentSource = fs.readFileSync(new URL('../../../components/ParentApp.tsx', import.meta.url), 'utf8');
const storeSource = fs.readFileSync(new URL('../../../shared/questionnaireStore.ts', import.meta.url), 'utf8');
const teacherTokenSource = fs.readFileSync(new URL('../../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const formBuilderSource = fs.readFileSync(new URL('../../components/form-builder/FormBuilder.tsx', import.meta.url), 'utf8');
const formDefinitionSource = fs.readFileSync(new URL('../../../shared/formDefinition.ts', import.meta.url), 'utf8');
const listSource = viewSource.slice(viewSource.indexOf('const renderList'), viewSource.indexOf('const renderCreate'));
const listCardsSource = listSource.slice(listSource.indexOf('{filteredRecords.map'), listSource.indexOf('{filteredRecords.length === 0'));
const detailSource = viewSource.slice(viewSource.indexOf('const renderDetail'), viewSource.indexOf('const renderResponseDetail'));

const requireText = (source, text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

for (const required of ['科目管理', '部门管理', '货币发放', '建议反馈', '问卷采集']) {
  requireText(meSource, required, `更多工具缺少${required}入口。`);
}

const moreToolsSource = meSource.slice(meSource.indexOf('const moreTools'), meSource.indexOf('const teacherName'));
if (moreToolsSource.indexOf("title: '问卷采集'") < moreToolsSource.indexOf("title: '建议反馈'")) {
  throw new Error('问卷采集必须位于现有四个入口之后，作为第二行首项。');
}
requireText(meSource, '<ToolGrid items={moreTools} columns={4} variant="secondary" />', '更多工具必须显式保持四列布局。');
requireText(appSource, "'questionnaire'", '教师端导航必须注册问卷调查页面。');
requireText(appSource, "case 'questionnaire': return '问卷采集'", '教师端导航标题必须统一为问卷采集。');
const questionnaireScreenBackground = appSource.match(/if \(\[([^\]]+)\]\.includes\(currentView\)\) \{\s*return <TeacherMobileScreenBackground/)?.[1] ?? '';
requireText(questionnaireScreenBackground, "'questionnaire'", '问卷采集应纳入屏幕级背景，标题栏才能与页面氛围光融为一体。');

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
requireText(storeSource, 'completed / reachable', '完成率必须使用对应采集模式的已完成数除以目标数。');
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
requireText(parentSource, "getQuestionnaireCollectionMode(questionnaire) === 'guardian_questionnaire'", '家长端只能接收家长问卷，不能收到学生信息采集。');
requireText(parentSource, 'setSharedQuestionnaires(readQuestionnaires())', '家长提交后必须刷新共享问卷状态。');
requireText(viewSource, 'useState<QuestionnaireQuestion[]>([])', '新建问卷不应默认创建单选题。');
requireText(viewSource, "const nextQuestions = record?.questions.length ? record.questions : [];", '新问卷必须从空题目状态开始。');
if (viewSource.includes('添加第一题')) {
  throw new Error('0题状态不应重复展示第二个添加题目按钮。');
}
requireText(viewSource, '<FormBuilder', '问卷和学生采集必须接入共享表单构建器。');
requireText(formBuilderSource, '添加{itemLabel}', '共享构建器必须保留清晰的添加入口。');
const flatFieldSection = formBuilderSource.slice(formBuilderSource.indexOf("{layoutMode === 'flat' ? ("), formBuilderSource.indexOf(") : (", formBuilderSource.indexOf("{layoutMode === 'flat' ? (")));
if (flatFieldSection.indexOf('{renderFieldList(fields)}') > flatFieldSection.lastIndexOf('添加{itemLabel}')) {
  throw new Error('平铺模式的添加入口必须位于题目列表末尾。');
}
if (viewSource.includes('label="复制题目"')) {
  throw new Error('题目编辑器不应保留复制题目功能。');
}
requireText(formBuilderSource, 'pendingFocusId.current = field.id', '选择题型后必须直接聚焦新题目的输入框。');
requireText(formBuilderSource, 'border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]', '题目和选项输入框必须使用教师端控件边框与表面令牌。');
requireText(formBuilderSource, '>{optionIndex + 1}</span>', '选项编辑器应使用中性序号，不应模拟填写控件。');
requireText(formBuilderSource, '<GripVertical', '每道题目前必须提供拖动排序标识。');
requireText(formBuilderSource, 'useSortable({ id: fieldId, disabled: readOnly })', '拖动标识必须接入真实排序能力。');
requireText(formBuilderSource, 'sortableKeyboardCoordinates', '拖动排序必须支持键盘操作。');
requireText(formBuilderSource, 'touch-none cursor-grab', '拖动把手必须适配手机触控。');
requireText(formBuilderSource, "onDragStart={() => setExpandedFieldId('')}", '开始拖动时必须收起展开题目，缩短手机端拖动距离。');
requireText(formBuilderSource, '按空格键开始拖动${itemLabel}', '拖动排序必须提供中文读屏操作说明。');
requireText(formBuilderSource, '已移动到第${targetIndex + 1}${itemLabel}', '拖动结果必须使用中文题目位置播报。');
if (formBuilderSource.includes('label={`上移${itemLabel}`}') || formBuilderSource.includes('label={`下移${itemLabel}`}')) {
  throw new Error('题目展开区不应再展示上移和下移操作。');
}
requireText(storeSource, 'customAnswerOptions?: string[]', '单选题和多选题必须记录哪些选项支持补充填写。');
requireText(storeSource, 'selectedOptions: string[]', '自定义答案必须结构化保存已选选项。');
requireText(storeSource, 'customText: Record<string, string>', '自定义答案必须结构化保存补充文本。');
if (formBuilderSource.includes('updateFieldType') || formBuilderSource.includes('value={activeField.type}')) {
  throw new Error('字段类型应在新增时确定，编辑阶段不应提供类型切换。');
}
requireText(formBuilderSource, '添加可填写项', '自定义填写项必须与普通选项放在同一编辑上下文。');
requireText(formBuilderSource, "let label = '其他（请填写）'", '可填写项生成后必须直接表达填写含义。');
requireText(formBuilderSource, '选中后需填写', '特殊填写项应明确展示其填写状态。');
requireText(formBuilderSource, '<AutoResizeTextarea', '题目名称输入框必须根据内容自动增高。');
requireText(formBuilderSource, "expanded ? 'border-[var(--tm-border-control)]'", '展开态必须使用中性边框，避免被误认为报错。');
requireText(formBuilderSource, 'aria-invalid={Boolean(fieldError?.label)}', '题目错误必须向读屏软件暴露无效状态。');
requireText(formBuilderSource, 'aria-invalid={Boolean(fieldError?.options)}', '选项错误必须向读屏软件暴露无效状态。');
requireText(formBuilderSource, 'if (visibleInput)', '同一错误重复校验时必须重新聚焦已经展开的题目输入框。');
requireText(formBuilderSource, '使用分组', '共享构建器必须提供分组开关。');
if (formBuilderSource.includes('默认分组') || formBuilderSource.includes('{sections.length}组')) {
  throw new Error('开启分组后只应提供添加分组入口，不应展示默认分组或分组数量。');
}
requireText(formBuilderSource, 'fields.map(field => ({ ...field, sectionId: nextSection.id }))', '创建首个分组后必须将已有题目自动归入该组。');
requireText(formDefinitionSource, "FormLayoutMode = 'flat' | 'grouped'", '中台表单定义必须区分平铺和分组布局。');
requireText(storeSource, 'sectionId?: string', '题目必须支持可选分组关系。');
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
requireText(detailSource, 'rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]', '问卷详情基本信息卡必须复用教师端公共卡片令牌。');
requireText(teacherTokenSource, "'--tm-shadow-card'", '教师端唯一令牌源必须提供公共卡片阴影。');
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
requireText(viewSource, '<SecondaryButton onClick={saveDraft}>', '创建流程的三个步骤都必须支持保存草稿。');
requireText(viewSource, 'onClick={createStep === 3 ? publishQuestionnaire : advanceCreateStep}', '下一步必须可点击并主动触发校验。');
requireText(viewSource, "target?.scrollIntoView({ behavior: 'smooth', block: 'center' })", '校验失败后必须滚动到首个错误。');
requireText(viewSource, 'fieldErrors={stepOneValidationAttempt ? stepOneFieldErrors : undefined}', '题目错误必须在字段内就地展示。');
if (viewSource.includes("disabled={createStep === 1 ? !validStepOne")) {
  throw new Error('第一步的下一步按钮不应因内容未完成而静默禁用。');
}
if (viewSource.includes("createStep === 1 ? saveDraft") || viewSource.includes("</> : '上一步'")) {
  throw new Error('底部左侧不应在发送范围或确认发布步骤替换为重复的上一步操作。');
}
requireText(viewSource, "'问卷已重新开放'", '已结束问卷必须支持重新开放。');
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
requireText(listSource, 'text-[length:var(--tm-font-size-card-title)] font-bold leading-[22px]', '问卷名称必须使用教师端卡片标题层级。');
requireText(listSource, '{completed}/{reachable}</span>', '问卷采集卡片必须保留直观的完成进度分数。');
requireText(listSource, 'h-1.5 w-12 overflow-hidden rounded-full', '问卷卡片右侧必须展示短进度条。');
requireText(viewSource, "accentClass: 'bg-[var(--tm-audience-guardian-primary)]'", '家长问卷卡片必须使用教师端家长受众色。');
requireText(viewSource, "accentClass: 'bg-[var(--tm-audience-student-primary)]'", '学生采集卡片必须使用教师端学生受众色。');
requireText(viewSource, 'icon: UsersRound', '家长问卷必须通过家庭图标提供非颜色识别。');
requireText(viewSource, 'icon: UserRoundCheck', '学生采集必须通过学生图标提供非颜色识别。');
requireText(listCardsSource, 'pointer-events-none absolute inset-y-3 left-0 w-[3px] rounded-r-full', '问卷卡片左侧必须使用不改变布局的短类型色条。');
requireText(listCardsSource, '${modeMeta.badgeClass}', '问卷卡片必须同时展示类型标签，不能只靠颜色区分。');
requireText(listCardsSource, "record.status === 'ended' ? 'bg-[var(--tm-text-disabled)]' : modeMeta.progressClass", '收集中卡片的短进度条应与采集类型保持一致。');
requireText(listSource, "record.status === 'draft' ? 'min-h-[76px]' : 'min-h-[92px]'", '问卷卡片必须增加垂直留白。');
requireText(listSource, 'active:scale-[0.96]', '可点击问卷卡片必须保留克制的按压反馈。');
if (listCardsSource.includes('已提交') || listCardsSource.includes('>{completion}%</span>') || listCardsSource.includes('border-t') || listCardsSource.includes('<ChevronRight')) {
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
requireText(listSource, 'mt-2 flex justify-end', '已归档入口必须右对齐。');
if (listSource.includes('>{archivedRecords.length}</span>')) {
  throw new Error('已归档入口不应显示归档数量。');
}
requireText(viewSource, 'deleteDraftQuestionnaire(draftId)', '已有草稿必须支持永久删除。');
requireText(storeSource, "record.status !== 'draft'", '数据层必须拒绝删除非草稿问卷。');
requireText(storeSource, "active: ['ended']", '收集中问卷只能先结束收集，不能直接归档。');
requireText(storeSource, "ended: ['active', 'archived']", '已结束问卷必须支持重新开放或归档。');
requireText(storeSource, "archived: ['ended']", '已归档问卷必须支持恢复到已结束。');
requireText(storeSource, "getQuestionnaireCollectionMode(record) === 'guardian_questionnaire'", '满额后禁止重新开放只适用于家长问卷。');
requireText(detailSource, '!isQuestionnaireFullyCollected(activeRecord)', '满额问卷详情不能展示重新开放入口。');
requireText(detailSource, '恢复到已结束', '已归档问卷详情必须提供恢复操作。');
requireText(detailSource, '>归档</button>', '已结束问卷详情必须提供归档操作。');
if (detailSource.includes('删除草稿') || detailSource.includes('永久删除')) {
  throw new Error('已发布问卷详情不能提供永久删除入口。');
}
requireText(viewSource, '删除后无法恢复', '永久删除草稿前必须二次确认。');
requireText(formBuilderSource, 'minRatingLevels = 2', '量表最少必须支持2级。');
requireText(formBuilderSource, 'maxRatingLevels = 10', '量表最多必须支持10级。');
requireText(formBuilderSource, '减少量表级数', '量表题必须支持配置级数。');
requireText(viewSource, 'const options = question.options;', '量表统计必须读取题目实际配置。');
requireText(assignedSource, 'ratingValues.map(option =>', '家长端必须按实际量表级数渲染。');
requireText(assignedSource, "rating: `${question.options.length || 5}级量表`", '家长端题型标签必须展示实际量表级数。');

const fixedHeightPageCount = viewSource.match(/relative flex h-full min-h-0 flex-col overflow-hidden/g)?.length ?? 0;
if (fixedHeightPageCount < 4) {
  throw new Error('问卷列表、创建、详情和答卷详情都必须继承固定可用高度，避免内部滚动区被内容撑开。');
}

const scrollRegionCount = viewSource.match(/min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain/g)?.length ?? 0;
if (scrollRegionCount < 3) {
  throw new Error('问卷列表、创建和详情内容区必须允许收缩并独立纵向滚动。');
}

requireText(viewSource, 'min-h-0 flex-1 touch-pan-y space-y-3 overflow-y-auto overscroll-contain', '单份答卷详情必须保留独立纵向滚动区域。');

requireText(viewSource, 'sticky top-0 z-[45] flex h-11 shrink-0 items-center justify-between bg-white/38 px-4 backdrop-blur-md', '问卷顶部必须使用教师端44像素头部，并与通用标题栏一致使用轻薄玻璃、不保留分割线。');
if (viewSource.includes('justify-between border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-page-glass)]')) {
  throw new Error('问卷顶部标题栏不应保留分割线，应依靠毛玻璃与内容自然分层。');
}
if (viewSource.includes('overflow-hidden bg-[var(--tm-bg-page)]')) {
  throw new Error('问卷各页面容器不应再使用不透明底色，顶部氛围光应由屏幕级背景统一提供。');
}
requireText(viewSource, 'absolute inset-x-16 truncate text-center text-[length:var(--tm-font-size-section-title)] font-bold text-[var(--tm-text-primary)]', '问卷顶部标题必须使用教师端区块标题层级。');
requireText(viewSource, '<ChevronLeft className="h-5 w-5" />', '问卷顶部返回图标必须与管理页保持一致。');
requireText(viewSource, "action ? '-mr-2 h-11 w-11' : 'h-11 w-11'", '问卷顶部操作必须保留44像素触控范围。');
requireText(viewSource, 'label="新建采集" onClick={() => setShowCreateTypeSheet(true)} className="text-[var(--tm-brand-primary-strong)]"', '新建采集应使用轻量的品牌加号按钮。');
if (viewSource.includes('subtitle?: string') || viewSource.includes('subtitle={`第${createStep}步，共3步`}')) {
  throw new Error('问卷顶部不应承载步骤或答卷副标题。');
}
requireText(viewSource, '{activeSubmission.studentName}<span className="ml-2 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{activeSubmission.guardianRelation}</span>', '答卷学生与家长关系信息必须移入内容区。');

for (const mode of ['家长问卷', '学生信息采集']) {
  requireText(viewSource, mode, `新建采集类型缺少：${mode}`);
}
if (viewSource.includes('即将开放') || viewSource.includes('<LockKeyhole')) {
  throw new Error('未开放的教师问卷不应侵入新建采集高频流程。');
}
requireText(storeSource, "QuestionnaireCollectionMode = 'guardian_questionnaire' | 'student_information' | 'teacher_questionnaire'", '底层必须按通用采集模式区分填写方和采集对象。');
requireText(viewSource, "startCreate(undefined, 'student_information')", '学生信息采集必须可以从新建类型浮层进入。');
requireText(viewSource, '由老师逐生填写', '学生信息采集类型必须明确填写方。');
for (const fieldType of ["short_text: { label: '单行文本'", "number: { label: '数字'", "date: { label: '日期'"]) {
  requireText(viewSource, fieldType, `学生信息采集缺少字段类型：${fieldType}`);
}
requireText(viewSource, "{ value: 'text', label: '多行文本', icon: AlignLeft, primary: false }", '字段选择必须标记低频字段。');
requireText(formBuilderSource, "showMoreTypes ? '常用类型' : '更多类型'", '共享构建器必须渐进披露低频字段类型。');
requireText(viewSource, "type StudentRecordFilter = 'all' | StudentCollectionRecordStatus", '学生信息采集必须支持按逐生记录状态筛选。');
requireText(viewSource, "status: 'pending'", '学生范围生成后必须为每名学生建立未填写记录。');
requireText(viewSource, "saveStudentCollectionRecord(activeRecord.id", '教师必须可以保存逐生采集记录。');
requireText(viewSource, "saveActiveStudentRecord('completed')", '逐生采集记录必须可以标记完成。');
requireText(viewSource, '>恢复编辑</button>', '学生信息采集结束后必须支持恢复编辑。');
requireText(storeSource, "getStudentCollectionCompletedCount", '学生信息采集进度必须按已完成学生记录计算。');
for (const mockId of ['collection-enrollment-202607', 'collection-status-check-202606', 'collection-health-draft']) {
  requireText(storeSource, mockId, `演示数据缺少学生信息采集：${mockId}`);
}

requireText(storeSource, "StudentAssignmentMode = 'creator' | 'homeroom'", '学生信息采集必须区分创建人填写和班主任填写。');
requireText(storeSource, 'assigneeTeacherId?: string', '逐生记录必须保存负责人标识。');
requireText(storeSource, 'getPendingAssignedStudentCollections', '底层必须能按当前教师计算待填写采集任务。');
requireText(storeSource, "id: 'collection-school-enrollment-202607'", '演示数据必须包含校领导发起的多班级学生采集。');
requireText(storeSource, "creatorName: '李校长'", '校领导发起的演示任务必须明确展示创建人。');
requireText(viewSource, "type PageMode = 'list' | 'assigned-list'", '问卷采集必须提供独立的待我填写列表。');
requireText(viewSource, "['creator', '我来填写'], ['homeroom', '各班班主任']", '确认开始页必须支持选择填写分工。');
requireText(viewSource, 'getStudentCollectionRecordsForTeacher(record, teacherId, teacherName)', '待我填写详情只能展示当前教师负责的学生。');
requireText(meSource, '待填写采集', '我的页面必须按需展示采集待办入口。');
requireText(appSource, 'pendingCollectionCount > 0', '我的底部导航必须按需展示待办数量。');
requireText(appSource, "setQuestionnaireEntryMode('assigned')", '点击我的待办必须直达待我填写列表。');

for (const [pattern, message] of [
  [/(?:#[0-9A-Fa-f]{3,8}\b|rgba?\()/, '问卷页不得保留硬编码颜色。'],
  [/\b(?:slate|cyan|blue|indigo|violet|purple)-[0-9]{2,3}(?:\/[0-9]+)?\b/, '问卷页不得保留旧蓝紫或灰阶主题类。'],
  [/shadow-\[(?!var\(--tm-)/, '问卷页阴影必须引用教师端组件令牌。'],
  [/text-\[[0-9]+px\]/, '问卷页字号必须引用教师端排版令牌。'],
  [/min-h-10\b/, '问卷页交互控件不得低于44像素触控高度。'],
  [/text-\[var\(--tm-brand-primary\)\]/, '品牌主红不得直接承担问卷页普通字号文字。'],
]) {
  if (pattern.test(viewSource)) throw new Error(message);
}

for (const token of [
  "'--tm-brand-primary-strong'",
  "'--tm-record-student-text'",
  "'--tm-text-tertiary'",
  "'--tm-border-control'",
  "'--tm-focus-ring'",
  "'--tm-font-size-metric'",
  "'--tm-audience-guardian-primary'",
  "'--tm-audience-student-primary'",
  "'--tm-audience-student-strong'",
  "'--tm-audience-student-soft'",
]) {
  requireText(teacherTokenSource, token, `教师端唯一令牌源缺少：${token}`);
}

console.log('Questionnaire management assertions passed');
