import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./QuestionnaireManagementView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('../MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');
const parentSource = fs.readFileSync(new URL('../../../components/ParentApp.tsx', import.meta.url), 'utf8');
const storeSource = fs.readFileSync(new URL('../../../shared/questionnaireStore.ts', import.meta.url), 'utf8');
const teacherTokenSource = fs.readFileSync(new URL('../../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const formBuilderSource = fs.readFileSync(new URL('../../components/form-builder/FormBuilder.tsx', import.meta.url), 'utf8');
const autoResizeTextareaSource = fs.readFileSync(new URL('../../components/ui/AutoResizeTextarea.tsx', import.meta.url), 'utf8');
const mobileBottomSheetSource = fs.readFileSync(new URL('../../components/ui/MobileBottomSheet.tsx', import.meta.url), 'utf8');
const classCascadeSource = fs.readFileSync(new URL('../../components/ui/MobileClassCascadePicker.tsx', import.meta.url), 'utf8');
const floatingCreateSource = fs.readFileSync(new URL('../../components/ui/MobileFloatingCreateButton.tsx', import.meta.url), 'utf8');
const formDefinitionSource = fs.readFileSync(new URL('../../../shared/formDefinition.ts', import.meta.url), 'utf8');
const questionnaireThemeSource = fs.readFileSync(new URL('../../../shared/questionnaireThemeTokens.ts', import.meta.url), 'utf8');
const growthFormsSource = fs.readFileSync(new URL('./GrowthCollectionForms.tsx', import.meta.url), 'utf8');
const studentGrowthStoreSource = fs.readFileSync(new URL('../../../shared/studentGrowthStore.ts', import.meta.url), 'utf8');
const listSource = viewSource.slice(viewSource.indexOf('const renderList'), viewSource.indexOf('const renderCreate'));
const listHeaderSource = listSource.slice(0, listSource.indexOf('<main'));
const listCardsSource = listSource.slice(listSource.indexOf('{filteredRecords.map'), listSource.indexOf('{filteredRecords.length === 0'));
const createSource = viewSource.slice(viewSource.indexOf('const renderCreate'), viewSource.indexOf('const renderStudentCollectionDetail'));
const studentDetailSource = viewSource.slice(viewSource.indexOf('const renderStudentCollectionDetail'), viewSource.indexOf('const renderStudentRecordPage'));
const createPreviewSource = viewSource.slice(viewSource.indexOf('const openCreatePreview'), viewSource.indexOf('const openDetailPreview'));
const detailSource = viewSource.slice(viewSource.indexOf('const renderDetail'), viewSource.indexOf('const renderResponseDetail'));

const requireText = (source, text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

const forbidText = (source, text, message) => {
  if (source.includes(text)) throw new Error(message);
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
const plainBackgroundList = appSource.match(/const PLAIN_BACKGROUND_VIEWS: ViewState\[\] = \[([^\]]+)\]/)?.[1] ?? '';
requireText(plainBackgroundList, "'questionnaire'", '问卷采集应使用屏幕级纯色背景。');

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

for (const questionType of ["single: { label: '单选题'", "multiple: { label: '多选题'", "rating: { label: '评分题'", "text: { label: '问答题'", "date: { label: '日期'", "number: { label: '数字'"]) {
  requireText(viewSource, questionType, `教师端缺少题型：${questionType}`);
}

requireText(storeSource, 'getActiveQuestionnaireTargets(record).filter(target => target.reachable).length', '完成率分母必须只使用当前有效且可送达的学生数。');
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
requireText(createSource, '<input id="survey-title"', '新建和草稿编辑页必须直接展示可编辑的标题输入框。');
requireText(createSource, 'value={draftTitle} maxLength={40}', '问卷标题必须回显草稿内容并限制40字。');
requireText(createSource, '<AutoResizeTextarea id="survey-description"', '新建和草稿编辑页必须直接展示可编辑的说明输入框。');
requireText(viewSource, "setDraftTitle(record?.title ?? '')", '进入草稿编辑时必须回显问卷标题。');
requireText(viewSource, "setDraftDescription(record?.description ?? '')", '进入草稿编辑时必须回显问卷说明。');
forbidText(viewSource, 'activeBasicInfoField', '问卷基础信息不应再使用隐藏的点击编辑态。');
requireText(viewSource, "isStudentCollection ? '请输入采集名称' : '请输入问卷名称'", '问卷与学生采集必须使用对应的名称占位文案。');
requireText(viewSource, "isStudentCollection ? '请输入采集说明(非必填)' : '请输入问卷说明(非必填)'", '问卷与学生采集必须使用对应的非必填说明文案。');
requireText(createSource, 'maxLength={500} maxHeight={Number.POSITIVE_INFINITY}', '问卷说明必须支持500字并随内容完整增高。');
requireText(createSource, '{draftDescription.length}/500', '问卷说明必须展示字数统计。');
requireText(autoResizeTextareaSource, 'rows={1}', '自动增高输入框不应默认预留两行高度。');
requireText(autoResizeTextareaSource, 'Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)', '自动增高输入框必须在触控高度与最大高度之间调整。');
requireText(viewSource, 'text-[length:var(--tm-font-size-document-title)]', '问卷标题必须使用独立的文档标题层级。');
requireText(teacherTokenSource, "'--tm-font-size-document-title': '26px'", '问卷名称字号必须按评审结果收紧为26像素。');
requireText(viewSource, "document.getElementById(stepOneTitleError ? 'survey-title'", '标题校验失败时必须定位到标题输入框。');
forbidText(viewSource, '请输入问卷说明（选填）', '说明文案不应重复问卷语境或展示非必要的选填说明。');
forbidText(viewSource, '<label htmlFor="survey-title"', '问卷标题不应重复展示可见字段标签。');
forbidText(viewSource, '<label htmlFor="survey-description"', '问卷说明不应重复展示可见字段标签。');
requireText(viewSource, 'allowCustomAnswer', '问卷和学生信息采集的单选、多选都必须支持添加“其他”选项。');
if (viewSource.includes('allowCustomAnswer={!isStudentCollection}')) {
  throw new Error('学生信息采集不应单独关闭“其他”选项。');
}
requireText(formBuilderSource, '添加{itemLabel}', '共享构建器必须保留清晰的添加入口。');
const flatFieldSection = formBuilderSource.slice(formBuilderSource.indexOf("{layoutMode === 'flat' ? ("), formBuilderSource.indexOf(") : (", formBuilderSource.indexOf("{layoutMode === 'flat' ? (")));
if (flatFieldSection.indexOf('{renderFieldList(fields)}') > flatFieldSection.lastIndexOf('添加{itemLabel}')) {
  throw new Error('平铺模式的添加入口必须位于题目列表末尾。');
}
requireText(formBuilderSource, 'const copyField =', '题目更多菜单必须支持复制题目。');
requireText(formBuilderSource, 'nextFields.splice(sourceIndex + 1, 0, copy)', '复制题目必须插入原题下一位。');
requireText(formBuilderSource, '<MoreHorizontal', '题目编辑态必须通过更多按钮渐进披露低频设置。');
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
requireText(formBuilderSource, '添加“其他”选项', '“其他”选项必须与普通选项放在同一编辑上下文。');
const optionActionsStart = formBuilderSource.indexOf('onClick={() => addOption(field)}');
const moreSettingsStart = formBuilderSource.indexOf('<BottomSheet open={Boolean(activeField)}');
const customOptionAction = formBuilderSource.indexOf('onClick={() => addCustomOption(field)}');
if (customOptionAction < optionActionsStart || customOptionAction > moreSettingsStart) {
  throw new Error('添加“其他”选项必须紧邻添加普通选项，不能放入题目设置。');
}
if (formBuilderSource.includes('addCustomOption(activeField)')) {
  throw new Error('题目设置中不应保留添加“其他”选项操作。');
}
requireText(formBuilderSource, "let label = '其他（请填写）'", '可填写项生成后必须直接表达填写含义。');
requireText(formBuilderSource, '选中后需填写', '特殊填写项应明确展示其填写状态。');
requireText(formBuilderSource, '<AutoResizeTextarea', '题目名称输入框必须根据内容自动增高。');
requireText(formBuilderSource, "expanded && !readOnly ? 'min-h-11 items-center py-2'", '展开态题型行必须收紧，让题干输入框直接承接在下方。');
requireText(formBuilderSource, "children ? 'row-span-2' : ''", '展开态题号列不得撑高题型行并制造空白区域。');
requireText(formBuilderSource, 'const toggleFieldEditor =', '点击题目内容区必须统一控制进入和退出编辑态。');
requireText(formBuilderSource, 'pendingFocusId.current = field.id', '每次进入题目编辑态都必须自动聚焦题干。');
requireText(formBuilderSource, 'data-form-field-editor={fieldId}', '每个题目必须提供可识别的编辑态边界。');
requireText(formBuilderSource, "document.addEventListener('click', closeFieldEditor)", '点击当前题目之外的区域必须退出编辑态。');
requireText(formBuilderSource, "const listenerFrame = window.requestAnimationFrame", '外部点击监听必须延后一帧挂载，不能吞掉进入题目编辑态的首次点击。');
requireText(formBuilderSource, "current === expandedFieldId ? '' : current", '切换到另一题时不得被旧题目的外部点击逻辑再次关闭。');
requireText(formBuilderSource, 'event.composedPath().find', '删除动态选项或添加“其他”时必须通过原始传播路径保持当前题目编辑态。');
forbidText(formBuilderSource, "target.closest('[data-form-field-editor]')", '动态控件卸载后不能再通过当前 DOM 祖先判断题目边界。');
requireText(formBuilderSource, 'border-0 border-b bg-transparent', '题干输入框只应保留下边框。');
forbidText(formBuilderSource, '<ChevronUp', '题目编辑态不应展示收起箭头。');
forbidText(formBuilderSource, "expanded ? <ChevronUp", '题目列表不应展示展开或收起箭头。');
forbidText(formBuilderSource, 'className="border-t border-[var(--tm-border-subtle)] px-4 pb-4 pt-3"', '题型与题干之间不应保留分隔线。');
forbidText(formBuilderSource, 'items-center justify-between border-t border-[var(--tm-border-subtle)] pt-3', '必填与更多操作上方不应保留分隔线。');
requireText(formBuilderSource, "expanded ? 'border-[var(--tm-brand-primary)]'", '展开态必须使用品牌焦点边框表达当前编辑题目。');
requireText(formBuilderSource, 'fieldNumber={index + 1}', '题号必须作为独立左侧序号列展示。');
requireText(formBuilderSource, 'renderFieldPreview(field, choice, rating, usesSubFields)', '列表态必须复用真实填写控件外观进行预览。');
requireText(formBuilderSource, 'border-transparent', '非编辑题目不应保留常驻描边。');
requireText(formBuilderSource, 'aria-invalid={Boolean(fieldError?.label)}', '题目错误必须向读屏软件暴露无效状态。');
requireText(formBuilderSource, 'aria-invalid={Boolean(fieldError?.options)}', '选项错误必须向读屏软件暴露无效状态。');
requireText(formBuilderSource, 'if (visibleInput)', '同一错误重复校验时必须重新聚焦已经展开的题目输入框。');
requireText(formBuilderSource, '使用分组', '共享构建器必须提供分组开关。');
requireText(formBuilderSource, '<h2 className="text-[length:var(--tm-font-size-card-title)]', '题目标题必须与分组开关共用紧凑标题行。');
requireText(formBuilderSource, 'showItemLabel = true', '共享构建器必须通过配置控制题目或字段标题显隐，不能写死业务规则。');
requireText(createSource, 'showItemLabel={isStudentCollection}', '家长问卷必须隐藏重复的题目标题，同时保留学生采集字段标题。');
forbidText(formBuilderSource, 'min-h-[60px] items-center justify-between gap-4 px-4', '分组开关不应继续使用独立卡片。');
requireText(formBuilderSource, 'setActiveSectionMenuId(section.id)', '分组低频操作必须通过更多菜单渐进披露。');
requireText(formBuilderSource, 'rounded-[var(--tm-radius-control)] bg-[var(--tm-bg-surface-muted)] px-3', '分组标题必须使用浅中性底标题行建立结构层级。');
requireText(formBuilderSource, 'text-[length:var(--tm-font-size-group-title)] font-bold', '分组标题必须使用18像素独立层级和加粗字重。');
const groupedFieldSection = formBuilderSource.slice(formBuilderSource.indexOf("<section className=\"mt-2\">", formBuilderSource.indexOf(") : (")), formBuilderSource.indexOf('</section>', formBuilderSource.indexOf("<section className=\"mt-2\">", formBuilderSource.indexOf(") : ("))));
if (groupedFieldSection.indexOf('{renderGroupedFieldList()}') > groupedFieldSection.lastIndexOf('添加分组')) {
  throw new Error('分组模式的添加分组入口必须位于分组列表末尾。');
}
if (formBuilderSource.includes('默认分组') || formBuilderSource.includes('{sections.length}组')) {
  throw new Error('开启分组后只应提供添加分组入口，不应展示默认分组或分组数量。');
}
requireText(formBuilderSource, 'fields.map(field => ({ ...field, sectionId: nextSection.id }))', '创建首个分组后必须将已有题目自动归入该组。');
requireText(formBuilderSource, '添加{itemLabel}到本组', '组内添加动作必须明确说明题目或字段将加入当前分组。');
requireText(formBuilderSource, '<FolderPlus', '添加分组必须使用区别于添加题目的结构型图标。');
requireText(formBuilderSource, 'bg-[var(--tm-bg-surface-muted)]', '添加分组必须使用中性表面，与组内品牌色添加动作拉开层级。');
forbidText(mobileBottomSheetSource, 'backdrop-blur', '底部抽屉蒙层不应模糊背景内容。');
requireText(mobileBottomSheetSource, 'focus({ preventScroll: true })', '底部抽屉聚焦与焦点恢复不得改变父页面滚动位置。');
requireText(mobileBottomSheetSource, 'tabIndex={-1}', '底部抽屉打开后必须能够聚焦抽屉容器。');
const sectionDraftSheetSource = formBuilderSource.slice(formBuilderSource.indexOf('<BottomSheet open={Boolean(sectionDraft)}'), formBuilderSource.indexOf('<BottomSheet open={showSectionSorter}'));
forbidText(sectionDraftSheetSource, 'autoFocus', '添加分组抽屉不应自动聚焦输入框并主动拉起软键盘。');
requireText(formDefinitionSource, "FormLayoutMode = 'flat' | 'grouped'", '中台表单定义必须区分平铺和分组布局。');
requireText(storeSource, 'sectionId?: string', '题目必须支持可选分组关系。');
if (viewSource.includes("[['all', '全体学生'], ['classes', '按班级'], ['students', '指定学生']]")) {
  throw new Error('发送范围不应继续使用全体学生、按班级、指定学生三段模式。');
}
requireText(viewSource, 'const gradeGroups = useMemo', '发送范围必须将后端权限班级按年级组织。');
requireText(viewSource, 'onClick={toggleAllClasses}', '发送范围必须支持一次选择全部权限班级。');
requireText(viewSource, '<MobileClassCascadePicker', '问卷发送范围必须复用教师个人信息页的班级级联组件。');
requireText(classCascadeSource, 'grid-cols-[92px_1fr]', '班级级联必须使用左侧年级、右侧班级的双栏布局。');
requireText(classCascadeSource, 'aria-label="左侧先选年级"', '班级级联左侧必须先选择年级。');
requireText(classCascadeSource, 'aria-label="右侧再选该年级下的班级"', '班级级联右侧必须选择当前年级下的班级。');
forbidText(viewSource, 'selectedStudentNos', '本期问卷不支持指定学生，不应保留学生选择状态。');
forbidText(viewSource, 'setStudentPickerClassId', '本期问卷不应提供班级下钻学生入口。');
forbidText(viewSource, '<MobileBottomSheet', '发送范围不应再打开指定学生抽屉。');
requireText(viewSource, "allScopeLabel = '全部班级'", '普通教师范围必须使用权限班级口径。');
requireText(appSource, "hasSchoolWideQuestionnaireAccess ? '全部年级' : '全部班级'", '领导和普通教师必须使用不同的全部范围标签。');
requireText(appSource, 'questionnaireAuthorizedClasses', '问卷页面必须只接收权限过滤后的班级集合。');
if (viewSource.includes('已选择学生')) {
  throw new Error('发送范围页不应展示额外的人数摘要卡片。');
}
requireText(storeSource, "QuestionnaireTargetMode = 'all' | 'classes' | 'students'", '数据层必须继续兼容历史发送范围模式。');
requireText(storeSource, "QuestionnaireTargetSyncPolicy = 'fixed' | 'follow_classes'", '数据层必须继续兼容历史固定名单。');
requireText(storeSource, 'reconcileQuestionnaireTargets', '数据层必须统一对账动态班级范围。');
requireText(storeSource, "scopeStatus: 'exited' as const", '转出学生必须标记退出且保留历史接收记录。');
requireText(viewSource, "targetMode: 'classes'", '本期新建问卷必须统一保存为班级范围。');
requireText(viewSource, "targetSyncPolicy: 'follow_classes'", '本期班级范围必须动态跟随成员变化。');
requireText(parentSource, 'getActiveQuestionnaireTargets(questionnaire)', '家长端待办必须排除已退出范围的学生。');
requireText(parentSource, 'pendingAssignedQuestionnaires', '家长端待办必须读取教师发布的共享问卷。');

const assignedSource = fs.readFileSync(new URL('../../../components/parent-app/AssignedQuestionnaireView.tsx', import.meta.url), 'utf8');
requireText(assignedSource, 'showCustomInput', '家长端必须仅在选中可填写选项后展示输入框。');
requireText(assignedSource, 'preview?: boolean', '家长问卷组件必须支持教师预览模式。');
requireText(assignedSource, "preview ? '结束预览'", '教师预览必须提供明确的退出操作。');
requireText(assignedSource, 'stepIndex === 0 && (', '真实家长填写和预览必须在首题展示独立文档头部。');
requireText(assignedSource, 'text-[length:var(--tm-font-size-document-title)]', '问卷预览标题必须使用22像素文档标题层级。');
requireText(assignedSource, 'currentSection && <div className="mb-2 px-1 text-[length:var(--tm-font-size-form-group-label)]', '问卷填写态分组标签必须独立放在题目卡上方。');
forbidText(assignedSource, 'currentSection && <div className="mb-3 rounded-[var(--tm-radius-control)]', '问卷填写态分组标签不得继续放在题目卡内。');
requireText(assignedSource, 'text-[length:var(--tm-font-size-question-title)]', '问卷题目必须使用16像素题目层级。');
requireText(assignedSource, 'text-[length:var(--tm-font-size-control)]', '问卷填写控件必须统一使用14像素文案。');
requireText(assignedSource, 'whitespace-pre-wrap break-words', '问卷说明必须保留换行并完整换行展示。');
requireText(assignedSource, 'placeholder="请补充填写"', '家长端自定义答案输入框应提供清晰占位文案。');
requireText(assignedSource, "questionnaire.status !== 'active'", '家长填写页必须响应老师结束收集。');
requireText(assignedSource, '问卷已结束或已经提交', '状态变化导致提交失败时必须提供明确反馈。');
requireText(assignedSource, "import { questionnaireThemeCssVariables }", '教师预览和家长填写必须引用共享问卷主题 Token。');
requireText(assignedSource, 'style={questionnaireThemeCssVariables as React.CSSProperties}', '共享问卷主题必须同时作用于教师预览和家长实际填写。');
for (const token of ['--tm-brand-primary', '--tm-input-focus-ring', '--tm-questionnaire-progress']) {
  requireText(assignedSource, token, `家长问卷填写态缺少共享语义 Token：${token}`);
}
requireText(assignedSource, 'bg-[var(--tm-questionnaire-progress)]', '问卷进度必须使用中性色进度 Token。');
requireText(assignedSource, 'min-h-[52px]', '单选、多选和操作按钮必须保持至少52像素高度。');
requireText(assignedSource, 'flex h-11 w-11 items-center justify-center rounded-full', '评分按钮必须保持44×44像素。');
requireText(assignedSource, 'question.type !== \'multi_fill\'', '多项填空不得在整题标题重复展示必填标志。');
requireText(assignedSource, 'aria-label="必填">*</span>', '必填题目和子字段必须使用星号标志。');
forbidText(assignedSource, '>必答<', '填写态不得使用“必答”文字。');
forbidText(assignedSource, '含必填项', '多项填空不得使用“含必填项”文字。');
forbidText(assignedSource, 'bg-[var(--tm-brand-primary-soft)]', '题型标签和选项容器不得使用大面积浅红底。');
for (const [pattern, message] of [
  [/(?:#[0-9A-Fa-f]{3,8}\b|rgba?\()/, '家长问卷组件不得保留硬编码颜色。'],
  [/\b(?:sky|cyan|blue|emerald|indigo|violet|purple)-[0-9]{2,3}(?:\/[0-9]+)?\b/, '家长问卷组件不得保留旧蓝青主题类。'],
  [/gradient/, '家长问卷的品牌进度、选中态与主按钮不得继续使用蓝青渐变。'],
]) {
  if (pattern.test(assignedSource)) throw new Error(message);
}
requireText(questionnaireThemeSource, "'--tm-brand-primary': questionnaireThemePalette.red[500]", '共享问卷主题主色必须来自新红色色板。');
requireText(questionnaireThemeSource, "'--tm-bg-page': questionnaireThemePalette.neutral[50]", '问卷填写页背景必须使用中性色。');
requireText(questionnaireThemeSource, "'--tm-questionnaire-progress': questionnaireThemePalette.neutral[900]", '问卷进度必须使用独立中性色 Token。');
for (const [token, value] of [['--tm-font-size-document-title', '22px'], ['--tm-font-size-group-title', '18px'], ['--tm-font-size-form-group-label', '14px'], ['--tm-font-size-question-title', '16px'], ['--tm-font-size-control', '14px']]) {
  requireText(questionnaireThemeSource, `'${token}': '${value}'`, `共享问卷主题缺少排版 Token：${token}`);
}
requireText(teacherTokenSource, "'--tm-font-size-group-title': '18px'", '教师端创建页必须提供18像素分组标题 Token。');
requireText(teacherTokenSource, "'--tm-font-size-form-group-label': '14px'", '教师端填写页必须提供14像素分组标签 Token。');
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
requireText(viewSource, 'const openCreatePreview = () =>', '新建和编辑问卷必须提供当前内容预览。');
requireText(viewSource, "'添加题目后即可预览'", '空问卷预览必须提供可执行的下一步提示。');
requireText(viewSource, "'添加字段后即可预览'", '空学生采集表预览必须提示先添加字段。');
requireText(viewSource, "setPreviewReturnMode('create')", '从编辑页退出预览后必须返回原编辑流程。');
requireText(createPreviewSource, 'collectionMode,', '创建预览必须保留当前采集类型，不能硬编码为家长问卷。');
forbidText(createPreviewSource, "collectionMode: 'guardian_questionnaire'", '学生信息采集预览不能被错误地创建为家长问卷。');
requireText(createSource, 'grid-cols-[44px_minmax(0,0.9fr)_minmax(0,1.35fr)]', '两类采集编辑页底部必须统一使用预览、保存草稿、下一步三段操作。');
requireText(createSource, "label={isStudentCollection ? '预览采集表' : '预览问卷'}", '编辑页底部必须按采集类型提供44像素预览入口。');
requireText(studentDetailSource, 'aria-label="预览采集表"', '学生采集详情首张内容卡必须提供预览入口。');
requireText(viewSource, 'const StudentCollectionForm: React.FC<StudentCollectionFormProps>', '学生采集预览与真实填写必须复用业务字段组件。');
if ((viewSource.match(/<StudentCollectionForm/g) ?? []).length < 2) {
  throw new Error('学生采集预览与真实逐生填写必须共同调用字段组件。');
}
requireText(viewSource, 'const [previewAnswers, setPreviewAnswers] = useState<Record<string, QuestionnaireAnswer>>({});', '学生采集预览必须使用独立答案状态。');
requireText(viewSource, 'onAnswerChange={(questionId, answer) => setPreviewAnswers', '学生采集预览输入只能写入预览答案状态。');
requireText(viewSource, 'style={questionnaireThemeCssVariables as React.CSSProperties}', '学生采集预览必须使用共享红色主题 Token。');
requireText(viewSource, '<h1 className="text-pretty text-[length:var(--tm-font-size-document-title)]', '学生采集预览标题必须使用独立文档标题层级。');
requireText(viewSource, 'getStudentCollectionQuestionGroups(record).map(questionGroup', '学生采集必须按分组组织填写内容。');
requireText(viewSource, 'questionGroup.label && <h2 className="mb-2 px-1 text-[length:var(--tm-font-size-form-group-label)]', '学生采集分组标签必须使用14像素弱层级并位于题目卡外。');
forbidText(viewSource, 'bg-[var(--tm-bg-surface-soft)] px-4 py-3 text-[length:var(--tm-font-size-group-title)]', '学生采集分组标签不得继续使用题目卡内的高层级底色标题行。');
requireText(viewSource, 'text-[length:var(--tm-font-size-question-title)] font-bold', '学生采集字段名称必须使用16像素题目层级。');
requireText(viewSource, 'min-h-[52px] items-center gap-2.5', '学生采集选项必须统一为至少52像素并显示选择控件。');
requireText(detailSource, 'rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 shadow-[var(--tm-shadow-card)]', '问卷详情基本信息卡必须复用教师端公共卡片令牌。');
requireText(teacherTokenSource, "'--tm-shadow-card'", '教师端唯一令牌源必须提供公共卡片阴影。');
requireText(detailSource, 'aria-label="预览问卷"', '问卷预览必须保留清晰的无障碍名称。');
forbidText(detailSource, 'line-clamp-2', '问卷详情说明必须完整展示，不能截断为两行。');
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
requireText(viewSource, '<SecondaryButton onClick={saveDraft}', '创建流程的三个步骤都必须支持保存草稿。');
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
requireText(listSource, "record.status === 'draft' ? 'min-h-[76px] pr-14' : 'min-h-[92px]'", '问卷卡片必须增加垂直留白，并为草稿更多操作预留空间。');
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
requireText(viewSource, 'deleteDraftQuestionnaire(draftActionId)', '已有草稿必须支持从列表更多菜单永久删除。');
requireText(listSource, 'setDraftActionId(record.id); setShowDraftMenu(true)', '草稿列表卡片必须通过更多菜单渐进披露删除操作。');
forbidText(createSource, 'label="草稿操作"', '编辑页标题栏不应继续承载草稿删除入口。');
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
requireText(formBuilderSource, 'maxRatingLevels = 10', '量表最多必须支持10级。');
requireText(formBuilderSource, '减少起始分', '评分题必须支持配置起始分。');
requireText(formBuilderSource, '增加结束分', '评分题必须支持配置结束分且最高不超过10分。');
requireText(formBuilderSource, '最少选择', '多选题必须支持最少选择数。');
requireText(formBuilderSource, '最多选择', '多选题必须支持最多选择数。');
requireText(formBuilderSource, "['ymd', '年-月-日']", '日期题必须支持日期格式设置。');
requireText(formBuilderSource, "['integer', '整数']", '数字题必须支持数字格式设置。');
requireText(formDefinitionSource, 'normalizeFormFieldSettings', '共享字段模型必须为旧数据补齐题型设置默认值。');
requireText(storeSource, 'getQuestionnaireAnswerValidationError', '填写提交必须校验题型个性化设置。');
requireText(viewSource, 'const options = question.options;', '量表统计必须读取题目实际配置。');
requireText(assignedSource, 'ratingValues.map(option =>', '家长端必须按实际量表级数渲染。');
requireText(assignedSource, 'ratingMin', '家长端题型标签必须展示实际评分区间。');

const fixedHeightPageCount = viewSource.match(/relative flex h-full min-h-0 flex-col overflow-hidden/g)?.length ?? 0;
if (fixedHeightPageCount < 4) {
  throw new Error('问卷列表、创建、详情和答卷详情都必须继承固定可用高度，避免内部滚动区被内容撑开。');
}

const scrollRegionCount = viewSource.match(/min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain/g)?.length ?? 0;
if (scrollRegionCount < 3) {
  throw new Error('问卷列表、创建和详情内容区必须允许收缩并独立纵向滚动。');
}

requireText(viewSource, 'min-h-0 flex-1 touch-pan-y space-y-3 overflow-y-auto overscroll-contain', '单份答卷详情必须保留独立纵向滚动区域。');

requireText(viewSource, 'sticky top-0 z-[45] flex h-11 shrink-0 items-center justify-between bg-white/38 pl-4 [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))] backdrop-blur-md', '问卷顶部必须使用教师端44像素头部，并避让微信胶囊安全区。');
if (viewSource.includes('justify-between border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-page-glass)]')) {
  throw new Error('问卷顶部标题栏不应保留分割线，应依靠毛玻璃与内容自然分层。');
}
if (viewSource.includes('overflow-hidden bg-[var(--tm-bg-page)]')) {
  throw new Error('问卷各页面容器不应再使用不透明底色，顶部氛围光应由屏幕级背景统一提供。');
}
forbidText(viewSource.slice(viewSource.indexOf('const PageHeader'), viewSource.indexOf('const BottomAction')), 'action?: React.ReactNode', '问卷标题栏不得再提供业务操作插槽。');
requireText(viewSource, 'absolute inset-x-16 truncate text-center', '问卷顶部标题必须保持居中安全区。');
requireText(viewSource, '<ChevronLeft className="h-5 w-5" />', '问卷顶部返回图标必须与管理页保持一致。');
requireText(viewSource, '<div className="h-11 w-11 shrink-0" aria-hidden="true" />', '问卷标题栏右侧必须完整留空给微信原生胶囊。');
requireText(detailSource, '<IconButton label="更多操作" onClick={() => setShowRecordMenu(true)}>', '问卷详情更多操作必须移入首张内容卡。');
requireText(viewSource, '!assignedContext && <IconButton label="更多操作"', '学生采集详情更多操作必须移入首张内容卡。');
requireText(viewSource, 'import MobileFloatingCreateButton', '问卷列表必须复用通用悬浮创建组件。');
requireText(listSource, '<MobileFloatingCreateButton label="新建采集" onClick={() => { setCreateSheetStage(\'root\'); setShowCreateTypeSheet(true); }} />', '新建采集必须从右下角悬浮入口打开类型选择。');
requireText(listSource, 'pb-[calc(var(--tm-size-floating-action)+var(--tm-space-5)+var(--tm-space-5)+env(safe-area-inset-bottom))]', '问卷列表必须为悬浮创建按钮和底部安全区预留空间。');
forbidText(listHeaderSource, '待我填写', '问卷列表顶部不得重复展示待我填写快捷入口。');
forbidText(listHeaderSource, '新建采集', '问卷列表顶部不得承载新建采集入口。');
requireText(floatingCreateSource, 'h-[var(--tm-size-floating-action)] w-[var(--tm-size-floating-action)]', '通用悬浮创建按钮必须使用教师端组件尺寸令牌。');
requireText(floatingCreateSource, "bottom: 'calc(var(--tm-space-5) + env(safe-area-inset-bottom))'", '通用悬浮创建按钮必须避让底部安全区。');
if (viewSource.includes('subtitle?: string') || viewSource.includes('subtitle={`第${createStep}步，共3步`}')) {
  throw new Error('问卷顶部不应承载步骤或答卷副标题。');
}
requireText(viewSource, '{activeSubmission.studentName}<span className="ml-2 text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{activeSubmission.guardianRelation}</span>', '答卷学生与家长关系信息必须移入内容区。');

for (const mode of ['家长问卷', '学生信息采集']) {
  requireText(viewSource, mode, `新建采集类型缺少：${mode}`);
}
for (const mode of ['成长信息', '问卷调查', '身高体重采集', '新学期目标清单']) {
  requireText(viewSource, mode, `新建采集业务入口缺少：${mode}`);
}
requireText(viewSource, "setCreateSheetStage('growth')", '成长信息必须通过第二层模板选择渐进披露。');
requireText(viewSource, "startGrowthSetup('height_weight')", '身高体重平台模板必须可以进入采集设置。');
requireText(viewSource, "startGrowthSetup('semester_goal')", '学期目标平台模板必须可以进入采集设置。');
requireText(viewSource, 'const targets = buildTargets(true);', '成长采集必须使用学校花名册姓名，不能沿用普通问卷的演示别名。');
requireText(viewSource, 'record.growthTemplate ? student.name : demoLinkedStudentName(student)', '成长采集范围对账时必须持续使用花名册姓名。');
requireText(viewSource, 'shouldSyncRosterName', '已有成长采集的逐生记录必须迁移为花名册姓名。');
requireText(viewSource, 'saveBodyMeasurementRecord', '身高体重完成后必须写入学生成长数据。');
requireText(viewSource, 'saveSemesterGoalPlan', '学期目标完成后必须写入学生成长数据。');
requireText(storeSource, 'growthTemplate?: GrowthCollectionTemplate', '采集任务必须保存平台成长模板类型。');
requireText(growthFormsSource, 'HeightWeightCollectionForm', '成长采集必须提供身高体重逐生表单。');
requireText(growthFormsSource, 'SemesterGoalCollectionForm', '成长采集必须提供学期目标逐生表单。');
requireText(studentGrowthStoreSource, 'sourceRecordId', '成长记录必须保留采集来源记录以支持重复保存而不重复新增。');
if (viewSource.includes('即将开放') || viewSource.includes('<LockKeyhole')) {
  throw new Error('未开放的教师问卷不应侵入新建采集高频流程。');
}
requireText(storeSource, "QuestionnaireCollectionMode = 'guardian_questionnaire' | 'student_information' | 'teacher_questionnaire'", '底层必须按通用采集模式区分填写方和采集对象。');
requireText(viewSource, "['unreachable', '未绑定']", '家长问卷答卷筛选必须使用明确的未绑定术语。');
if (viewSource.includes('未送达')) {
  throw new Error('教师端不应使用容易被理解为通知失败的“未送达”。');
}
requireText(viewSource, "startCreate(undefined, 'student_information')", '学生信息采集必须可以从新建类型浮层进入。');
requireText(viewSource, '由老师逐生填写', '学生信息采集类型必须明确填写方。');
for (const fieldType of ["short_text: { label: '单行文本'", "number: { label: '数字'", "date: { label: '日期'"]) {
  requireText(viewSource, fieldType, `学生信息采集缺少字段类型：${fieldType}`);
}
requireText(viewSource, "multi_fill: { label: '多项填空题'", '问卷题型元数据必须包含多项填空题。');
requireText(viewSource, "{ value: 'multi_fill', label: '多项填空题', icon: ListPlus, subFields: true }", '家长问卷必须开放多项填空题。');
requireText(formBuilderSource, '添加填空项', '表单构建器必须支持渐进添加填空项。');
requireText(formBuilderSource, "disabled={(field.subFields?.length ?? 0) <= 2}", '多项填空题不得少于2个填空项。');
requireText(formBuilderSource, "disabled={(field.subFields?.length ?? 0) >= 6}", '多项填空题不得超过6个填空项。');
requireText(storeSource, 'QuestionnaireMultiFillAnswer', '底层必须使用独立的多项填空答案结构。');
requireText(storeSource, 'getQuestionnaireMultiFillValues', '多项填空答案读取必须收敛到共享方法。');
requireText(assignedSource, "question.type === 'multi_fill'", '家长端必须渲染多项填空输入控件。');
requireText(viewSource, 'openQuestionResponses(question.id, subField.id)', '多项填空统计必须支持按子项查看全部回答。');
requireText(viewSource, "{ value: 'text', label: '多行文本', icon: AlignLeft }", '字段类型选择必须直接展示多行文本。');
requireText(viewSource, "{ value: 'multiple', label: '多选', icon: ListChecks, choice: true }", '字段类型选择必须直接展示多选。');
requireText(viewSource, "type StudentRecordFilter = 'all' | 'incomplete' | 'completed'", '学生信息采集必须使用任务视角的三类筛选。');
requireText(viewSource, "studentRecordFilter === 'incomplete' ? item.status !== 'completed'", '待完成必须合并未填写和草稿记录。');
requireText(viewSource, "[['all', '全部'], ['incomplete', '待完成'], ['completed', '已完成']]", '逐生记录顶部只保留全部、待完成和已完成。');
requireText(viewSource, "draft: { label: '待继续'", '草稿记录应在学生行内表达为待继续。');
requireText(viewSource, "Number(right.status === 'draft') - Number(left.status === 'draft')", '待完成列表必须将待继续记录排在未填写记录之前。');
if (viewSource.includes("[['all', '全部'], ['pending', '未填写'], ['draft', '草稿'], ['completed', '已完成']]")) {
  throw new Error('草稿不应作为逐生记录的一级筛选。');
}
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
  "'--tm-input-focus-ring'",
  "'--tm-font-size-document-title'",
  "'--tm-font-size-metric'",
  "'--tm-audience-guardian-primary'",
  "'--tm-audience-student-primary'",
  "'--tm-audience-student-strong'",
  "'--tm-audience-student-soft'",
]) {
  requireText(teacherTokenSource, token, `教师端唯一令牌源缺少：${token}`);
}

requireText(viewSource, 'focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]', '问卷输入框应使用轻量输入焦点环。');
if (viewSource.includes('focus:ring-4 focus:ring-[var(--tm-focus-ring)]')) {
  throw new Error('问卷输入框不应使用4像素实色焦点环。');
}

console.log('Questionnaire management assertions passed');
