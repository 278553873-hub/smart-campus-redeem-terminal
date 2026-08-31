import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./QuestionnaireManagementView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('../MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');
const bottomNavigationSource = fs.readFileSync(new URL('../../components/TeacherBottomNavigation.tsx', import.meta.url), 'utf8');
const parentSource = fs.readFileSync(new URL('../../../components/ParentApp.tsx', import.meta.url), 'utf8');
const storeSource = fs.readFileSync(new URL('../../../shared/questionnaireStore.ts', import.meta.url), 'utf8');
const teacherTokenSource = fs.readFileSync(new URL('../../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const formBuilderSource = fs.readFileSync(new URL('../../components/form-builder/FormBuilder.tsx', import.meta.url), 'utf8');
const autoResizeTextareaSource = fs.readFileSync(new URL('../../components/ui/AutoResizeTextarea.tsx', import.meta.url), 'utf8');
const mobileDocumentTitleInputSource = fs.readFileSync(new URL('../../components/ui/MobileDocumentTitleInput.tsx', import.meta.url), 'utf8');
const mobileBottomSheetSource = fs.readFileSync(new URL('../../components/ui/MobileBottomSheet.tsx', import.meta.url), 'utf8');
const classCascadeSource = fs.readFileSync(new URL('../../components/ui/MobileClassCascadePicker.tsx', import.meta.url), 'utf8');
const floatingCreateSource = fs.readFileSync(new URL('../../components/ui/MobileFloatingCreateButton.tsx', import.meta.url), 'utf8');
const confirmSheetSource = fs.readFileSync(new URL('../../components/ui/MobileConfirmSheet.tsx', import.meta.url), 'utf8');
const qrInviteSheetSource = fs.readFileSync(new URL('../../components/ui/MobileQrInviteSheet.tsx', import.meta.url), 'utf8');
const growthFieldPickerSource = fs.readFileSync(new URL('../../components/growth/GrowthFieldCategoryPicker.tsx', import.meta.url), 'utf8');
const formDefinitionSource = fs.readFileSync(new URL('../../../shared/formDefinition.ts', import.meta.url), 'utf8');
const questionnaireThemeSource = fs.readFileSync(new URL('../../../shared/questionnaireThemeTokens.ts', import.meta.url), 'utf8');
const questionnaireTimeSource = fs.readFileSync(new URL('../../../shared/questionnaireTime.ts', import.meta.url), 'utf8');
const questionnaireHeaderSource = fs.readFileSync(new URL('../../../components/questionnaire/QuestionnaireHeaderImage.tsx', import.meta.url), 'utf8');
const growthFormsSource = fs.readFileSync(new URL('./GrowthCollectionForms.tsx', import.meta.url), 'utf8');
const growthDefinitionSource = fs.readFileSync(new URL('../../../shared/growthCollectionDefinition.ts', import.meta.url), 'utf8');
const growthCatalogSource = fs.readFileSync(new URL('../../../shared/studentGrowthFieldCatalog.ts', import.meta.url), 'utf8');
const growthPersistenceSource = fs.readFileSync(new URL('../../../shared/growthCollectionPersistence.ts', import.meta.url), 'utf8');
const studentGrowthStoreSource = fs.readFileSync(new URL('../../../shared/studentGrowthStore.ts', import.meta.url), 'utf8');
const studentArchiveStoreSource = fs.readFileSync(new URL('../../../shared/studentArchiveStore.ts', import.meta.url), 'utf8');
const archivePersistenceSource = fs.readFileSync(new URL('../../../shared/archiveCollectionPersistence.ts', import.meta.url), 'utf8');
const listSource = viewSource.slice(viewSource.indexOf('const renderList'), viewSource.indexOf('const renderCreate'));
const listHeaderSource = listSource.slice(0, listSource.indexOf('<main'));
const listCardsSource = listSource.slice(listSource.indexOf('{filteredRecords.map'), listSource.indexOf('{filteredRecords.length === 0'));
const listActionsSource = listSource.slice(listSource.indexOf('<MobileBottomSheet open={Boolean(activeListActionRecord)}'), listSource.indexOf('</MobileBottomSheet>', listSource.indexOf('<MobileBottomSheet open={Boolean(activeListActionRecord)}')));
const createSource = viewSource.slice(viewSource.indexOf('const renderCreate'), viewSource.indexOf('const renderStudentCollectionDetail'));
const createStepOneSource = createSource.slice(createSource.indexOf('{createStep === 1'), createSource.indexOf('{createStep === 2'));
const createStepThreeSource = createSource.slice(createSource.indexOf('{createStep === 3'), createSource.indexOf('<BottomAction>'));
const studentDetailSource = viewSource.slice(viewSource.indexOf('const renderStudentCollectionDetail'), viewSource.indexOf('const renderStudentRecordPage'));
const studentRecordPageSource = viewSource.slice(viewSource.indexOf('const renderStudentRecordPage'), viewSource.indexOf('const renderDataSummary'));
const createPreviewSource = viewSource.slice(viewSource.indexOf('const openCreatePreview'), viewSource.indexOf('const openListPreview'));
const completePublishSource = viewSource.slice(viewSource.indexOf('const completePublishQuestionnaire'), viewSource.indexOf('const toggleClass'));
const archiveActiveRecordSource = viewSource.slice(viewSource.indexOf('const archiveActiveRecord'), viewSource.indexOf('const restoreActiveRecord'));
const detailSource = viewSource.slice(viewSource.indexOf('const renderDetail'), viewSource.indexOf('const renderResponseDetail'));
const responseDetailSource = viewSource.slice(viewSource.indexOf('const renderResponseDetail'), viewSource.indexOf('const renderQuestionResponses'));
const answerContextMetaSource = viewSource.slice(viewSource.indexOf('const AnswerContextMeta'), viewSource.indexOf('const editorToolButton'));
const originalPreviewSource = viewSource.slice(viewSource.indexOf('const renderPreview'), viewSource.indexOf('const renderPage'));
const legacyParentQuestionnaireSource = parentSource.slice(parentSource.indexOf('const QuestionnaireForm'), parentSource.indexOf('const ArchiveDetail'));

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
if ((viewSource.match(/ASSETS\.DEFAULT_STATE\.WORRIED_CLIPBOARD/g) ?? []).length !== 3) {
  throw new Error('问卷采集主列表、待填写和已归档空状态必须统一使用担忧清单缺省图。');
}
if ((viewSource.match(/imageSrc=\{ASSETS\.DEFAULT_STATE\.MAGNIFIER\}/g) ?? []).length !== 2) {
  throw new Error('采集详情中的学生搜索和全部回答搜索无结果必须统一使用放大镜缺省图。');
}
requireText(viewSource, 'title="暂无匹配学生"', '采集详情搜索无结果必须保留明确结果文案。');
requireText(viewSource, 'title="暂无匹配回答"', '全部回答搜索无结果必须保留明确结果文案。');
requireText(viewSource, 'title={`暂无${statusMeta[listFilter].label}内容`}', '问卷采集筛选空状态必须保留当前状态文案。');
requireText(viewSource, 'title="暂无待填写采集"', '待填写采集空状态必须保留明确文案。');
requireText(viewSource, 'title="暂无已归档采集"', '已归档采集空状态必须保留明确文案。');

for (const required of [
  '编辑采集',
  '学生范围',
  '确认发布',
  '收集中',
  '已结束',
  '数据',
  '答卷',
  '未绑定家长',
]) {
  requireText(viewSource, required, `教师端问卷流程缺少：${required}`);
}

for (const questionType of ["single: { label: '单选题'", "multiple: { label: '多选题'", "rating: { label: '评分题'", "text: { label: '问答题'", "date: { label: '日期'", "number: { label: '数字'"]) {
  requireText(viewSource, questionType, `教师端缺少题型：${questionType}`);
}

requireText(storeSource, 'getActiveQuestionnaireTargets(record).filter(target => target.reachable).length', '完成率分母必须只使用当前有效且可送达的学生数。');
requireText(storeSource, 'completed / reachable', '完成率必须使用对应采集模式的已完成数除以目标数。');
requireText(storeSource, 'suggestedDeadline: string', '问卷必须将完成时间与状态分开保存。');
requireText(storeSource, 'isQuestionnaireOverdue', '问卷必须能够识别仅用于提示的逾期状态。');
requireText(storeSource, "questionnaire?.status === 'active'", '家长提交时必须再次确认问卷仍在收集中。');
requireText(storeSource, "if (existing && existing.status !== 'draft') return current;", '共享数据层必须拒绝覆盖已发布问卷。');
requireText(storeSource, 'export const publishQuestionnaire', '正式发布必须通过受控的数据层方法。');
requireText(storeSource, 'inviteCode?: string;', '问卷必须保存不含学生隐私信息的邀请凭证。');
requireText(storeSource, 'getQuestionnaireByInviteCode', '家长扫码后必须通过邀请凭证查找问卷。');
requireText(storeSource, "rest.suggestedDeadline ?? deadline ?? ''", '历史问卷的截止时间必须兼容迁移为完成时间。');
for (const mockId of ['survey-autumn-trip-202607', 'survey-uniform-202607', 'survey-meal-202606', 'survey-summer-care-202607', 'survey-campus-activity-202605']) {
  requireText(storeSource, mockId, `演示数据缺少问卷：${mockId}`);
}
requireText(storeSource, ".filter(record => record.status !== 'draft')", '默认演示数据不应预置采集设计草稿。');
requireText(storeSource, '.filter(record => !LEGACY_SEED_DRAFT_IDS.has(record.id))', '历史演示草稿必须从已有本地数据中清理。');
requireText(parentSource, "setScreen('questionnaireForm')", '家长端必须复用现有问卷填写页打开教师发布问卷。');
requireText(parentSource, 'pendingAssignedQuestionnaires', '家长端待办必须读取教师发布的共享问卷。');
requireText(parentSource, 'description?: string;', '家长端旧问卷数据必须支持问卷说明。');
requireText(parentSource, 'const [showLegacyQuestionnaireIntro, setShowLegacyQuestionnaireIntro] = useState(false)', '家长端旧问卷必须维护独立首页状态。');
requireText(parentSource, 'setShowLegacyQuestionnaireIntro(Boolean(questionnaire?.description?.trim()))', '家长端旧问卷必须仅在有说明时从首页开始。');
requireText(legacyParentQuestionnaireSource, 'const hasIntroPage = Boolean(activePendingQuestionnaire.description?.trim())', '家长真实填写必须按说明决定是否展示首页。');
requireText(legacyParentQuestionnaireSource, '!showLegacyQuestionnaireIntro && <span', '家长问卷首页不得展示题目进度。');
requireText(legacyParentQuestionnaireSource, 'setShowLegacyQuestionnaireIntro(false)', '家长问卷首页开始操作必须进入第一题。');
requireText(legacyParentQuestionnaireSource, '开始填写', '家长问卷首页必须使用明确的开始填写文案。');
requireText(legacyParentQuestionnaireSource, 'questionnaireStepIndex === 0 && hasIntroPage', '家长问卷第一题必须能够返回首页。');
requireText(legacyParentQuestionnaireSource, 'const isQuestionRequired = questionOptions.length > 0', '家长旧问卷的必填展示必须与实际作答校验一致。');
requireText(legacyParentQuestionnaireSource, 'isQuestionRequired && <span className="ml-1 text-rose-500" aria-label="必填">*</span>', '家长真实填写题目必须展示可识别的必填星号。');
requireText(legacyParentQuestionnaireSource, "setScreen('todo')", '家长退出填写必须返回待办而不是跳到成长首页。');
requireText(parentSource, 'label: questionnaire.title', '家长待办必须展示具体问卷名称。');
requireText(parentSource, "getQuestionnaireCollectionMode(questionnaire) === 'guardian_questionnaire'", '家长端只能接收家长填写任务，不能收到老师填写任务。');
requireText(parentSource, 'setSharedQuestionnaires(readQuestionnaires())', '家长提交后必须刷新共享问卷状态。');
requireText(parentSource, 'resumeQuestionnaireInvite', '家长登录或绑定后必须恢复扫码对应问卷。');
requireText(parentSource, "type InviteOutcome = 'invalid' | 'ended' | 'submitted' | 'out_of_scope' | null;", '扫码流程必须覆盖失效、结束、已提交和不在范围状态。');
requireText(viewSource, 'useState<QuestionnaireQuestion[]>([])', '新建问卷不应默认创建单选题。');
requireText(viewSource, 'const nextQuestions = record?.questions ?? [];', '新采集必须从空题目状态开始。');
if (viewSource.includes('添加第一题')) {
  throw new Error('0题状态不应重复展示第二个添加题目按钮。');
}
requireText(viewSource, '<FormBuilder', '问卷和学生采集必须接入共享表单构建器。');
requireText(createSource, '<MobileDocumentTitleInput id="survey-title"', '新建和草稿编辑页必须复用公共文档标题输入。');
requireText(createSource, 'value={draftTitle} maxLength={40}', '采集名称必须回显草稿内容并限制40字。');
requireText(createSource, '<AutoResizeTextarea id="survey-description"', '新建和草稿编辑页必须直接展示可编辑的说明输入框。');
requireText(viewSource, "setDraftTitle(record?.title ?? '')", '进入草稿编辑时必须回显问卷标题。');
requireText(viewSource, "setDraftDescription(record?.description ?? '')", '进入草稿编辑时必须回显问卷说明。');
requireText(viewSource, "const [isEditingExistingDraft, setIsEditingExistingDraft] = useState(false)", '创建页必须独立记录是否从既有草稿进入。');
requireText(viewSource, 'setIsEditingExistingDraft(Boolean(record))', '进入创建页时必须按入口记录新建或编辑状态。');
requireText(createSource, "title={isEditingExistingDraft ? '编辑采集' : '新建采集'}", '自动保存生成草稿编号后，新建页标题必须保持不变。');
forbidText(createSource, "title={draftId ? '编辑采集' : '新建采集'}", '页面标题不得使用自动生成的草稿编号判断新建或编辑。');
forbidText(viewSource, 'activeBasicInfoField', '问卷基础信息不应再使用隐藏的点击编辑态。');
requireText(viewSource, "const titlePlaceholder = '请输入采集名称'", '采集名称不应因填写人或字段类型不同而改变。');
requireText(viewSource, "const descriptionPlaceholder = '请输入采集说明(非必填)'", '采集说明应使用统一文案。');
requireText(createSource, 'maxLength={500} maxHeight={Number.POSITIVE_INFINITY}', '问卷说明必须支持500字并随内容完整增高。');
requireText(createSource, '{draftDescription.length}/500', '问卷说明必须展示字数统计。');
requireText(autoResizeTextareaSource, 'rows={1}', '自动增高输入框不应默认预留两行高度。');
requireText(autoResizeTextareaSource, 'Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight)', '自动增高输入框必须在触控高度与最大高度之间调整。');
requireText(mobileDocumentTitleInputSource, 'text-[length:var(--tm-font-size-document-title)]', '公共文档标题输入必须使用独立的文档标题层级。');
requireText(mobileDocumentTitleInputSource, 'aria-describedby={error ? errorId : undefined}', '公共文档标题输入必须将错误文案关联到输入框。');
requireText(teacherTokenSource, "'--tm-font-size-document-title': '26px'", '问卷名称字号必须按评审结果收紧为26像素。');
requireText(viewSource, "document.getElementById(stepOneTitleError ? 'survey-title'", '标题校验失败时必须定位到标题输入框。');
forbidText(viewSource, '请输入问卷说明（选填）', '说明文案不应重复问卷语境或展示非必要的选填说明。');
forbidText(viewSource, '<label htmlFor="survey-title"', '问卷标题不应重复展示可见字段标签。');
forbidText(viewSource, '<label htmlFor="survey-description"', '问卷说明不应重复展示可见字段标签。');
requireText(viewSource, 'allowCustomAnswer', '问卷和学生信息采集的单选、多选都必须支持添加“其他”选项。');
if (viewSource.includes('allowCustomAnswer={!isStudentCollection}')) {
  throw new Error('学生信息采集不应单独关闭“其他”选项。');
}
requireText(formBuilderSource, '添加{addButtonLabel ?? itemLabel}', '共享构建器必须保留可由业务命名的添加入口。');
const flatFieldSection = formBuilderSource.slice(formBuilderSource.indexOf("{layoutMode === 'flat' ? ("), formBuilderSource.indexOf(") : (", formBuilderSource.indexOf("{layoutMode === 'flat' ? (")));
if (flatFieldSection.indexOf('{renderFieldList(fields)}') > flatFieldSection.lastIndexOf('添加{addButtonLabel ?? itemLabel}')) {
  throw new Error('平铺模式的添加入口必须位于题目列表末尾。');
}
requireText(formBuilderSource, 'const copyField =', '题目更多菜单必须支持复制题目。');
requireText(formBuilderSource, 'nextFields.splice(sourceIndex + 1, 0, copy)', '复制题目必须插入原题下一位。');
requireText(formBuilderSource, '<MoreHorizontal', '题目编辑态必须通过更多按钮渐进披露低频设置。');
requireText(formBuilderSource, 'pendingFocusId.current = field.id', '选择题型后必须直接聚焦新题目的输入框。');
requireText(formBuilderSource, 'border border-[var(--tm-border-control)] bg-[var(--tm-bg-surface)]', '题目和选项输入框必须使用教师端控件边框与表面令牌。');
requireText(formBuilderSource, '>{optionIndex + 1}</span>', '选项编辑器应使用中性序号，不应模拟填写控件。');
requireText(formBuilderSource, '<GripVertical', '每道题目前必须提供拖动排序标识。');
requireText(formBuilderSource, 'useSortable({ id: fieldId, disabled: readOnly || !sortable })', '拖动标识必须接入可切换的真实排序能力。');
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
requireText(viewSource, '成长数据用于持续记录身高、视力等学生信息', '自定义采集的成长数据页签必须说明其作用和系统约束。');
forbidText(formBuilderSource, "expanded && !readOnly ? 'min-h-11 items-center py-2'", '展开态不应继续保留题型顶部行。');
requireText(formBuilderSource, ') : expanded && !readOnly ? null : <button', '题目展开后必须直接从题干输入框开始。');
requireText(formBuilderSource, "children ? 'row-span-2' : ''", '展开态题号列必须稳定跨越完整编辑内容。');
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
if ((formBuilderSource.match(/tabular-nums text-\[var\(--tm-text-primary\)\]/g) ?? []).length < 2) {
  throw new Error('题号与字段序号必须在可排序和只读状态统一使用主文字色。');
}
forbidText(formBuilderSource, 'tabular-nums text-[var(--tm-brand-primary-strong)]', '题号与字段序号不应继续使用品牌红。');
requireText(formBuilderSource, 'renderFieldPreview(field, choice, rating, usesSubFields)', '列表态必须复用真实填写控件外观进行预览。');
requireText(formBuilderSource, 'border-transparent', '非编辑题目不应保留常驻描边。');
requireText(formBuilderSource, 'aria-invalid={Boolean(fieldError?.label)}', '题目错误必须向读屏软件暴露无效状态。');
requireText(formBuilderSource, 'aria-invalid={Boolean(fieldError?.options)}', '选项错误必须向读屏软件暴露无效状态。');
requireText(formBuilderSource, 'if (visibleInput)', '同一错误重复校验时必须重新聚焦已经展开的题目输入框。');
requireText(formBuilderSource, '使用分组', '共享构建器必须提供分组开关。');
requireText(formBuilderSource, '<h2 className="text-[length:var(--tm-font-size-card-title)]', '题目标题必须与分组开关共用紧凑标题行。');
requireText(formBuilderSource, 'showItemLabel = true', '共享构建器必须通过配置控制题目或字段标题显隐，不能写死业务规则。');
requireText(createSource, 'showItemLabel={false}', '普通问卷不应因老师或家长填写而重复展示题目标题。');
requireText(viewSource, "['采集内容', '学生范围', '确认发布']", '填写人已在进入编辑器前选择，创建进度第一步只应表达采集内容。');
const stepIndicatorSource = viewSource.slice(viewSource.indexOf('const StepIndicator'), viewSource.indexOf('interface StudentCollectionFormProps'));
requireText(stepIndicatorSource, 'font-semibold text-[var(--tm-text-primary)]', '创建步骤名称必须统一使用主文字色。');
forbidText(stepIndicatorSource, "complete ? 'text-[var(--tm-brand-primary-strong)]'", '创建步骤名称不应通过品牌红重复表达进度。');
requireText(viewSource, "title=\"谁来填写\"", '点击新建采集后必须先选择老师填写或家长填写。');
forbidText(createStepOneSource, '填写人，当前', '填写人已在入口确定，采集内容编辑页不应重复展示或修改。');
forbidText(createStepOneSource, "setRespondentSheetMode('edit')", '采集内容编辑页不应再次打开填写人选择。');
forbidText(createStepThreeSource, 'aria-labelledby="respondent-role-title"', '确认发布页只能确认填写人，不能再次切换填写人。');
requireText(createStepThreeSource, "{isTeacherRespondent ? '老师填写' : '家长填写'}", '确认发布页必须展示第一步已经选择的填写人。');
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
requireText(formBuilderSource, '添加{addButtonLabel ?? itemLabel}到本组', '组内添加动作必须明确说明内容将加入当前分组。');
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
forbidText(viewSource, 'title="选择学生"', '发送范围不应再打开指定学生抽屉。');
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
requireText(assignedSource, '!oneQuestionPerPage && (', '连续模式必须在题目上方展示问卷名称和说明。');
requireText(assignedSource, 'const hasIntroPage = oneQuestionPerPage && Boolean(questionnaire.description.trim())', '逐题模式必须仅在存在问卷说明时生成独立首页。');
requireText(assignedSource, 'const [showIntroPage, setShowIntroPage] = useState(hasIntroPage)', '家长填写与教师预览必须从问卷首页开始。');
requireText(assignedSource, "{preview ? '开始预览' : '开始填写'}", '问卷首页必须按预览或真实填写提供单一开始操作。');
requireText(assignedSource, 'stepIndex === 0 && hasIntroPage ? setShowIntroPage(true)', '逐题模式第一题必须能够返回问卷首页。');
requireText(assignedSource, '(!oneQuestionPerPage || showIntroPage) && <QuestionnaireHeaderImage', '逐题模式头图只能出现在独立问卷首页。');
requireText(assignedSource, 'text-[length:var(--tm-font-size-document-title)]', '问卷预览标题必须使用22像素文档标题层级。');
requireText(assignedSource, 'currentSection && <div className="mb-2 px-1 text-[length:var(--tm-font-size-form-group-label)]', '问卷填写态分组标签必须独立放在题目卡上方。');
forbidText(assignedSource, 'currentSection && <div className="mb-3 rounded-[var(--tm-radius-control)]', '问卷填写态分组标签不得继续放在题目卡内。');
requireText(assignedSource, 'text-[length:var(--tm-font-size-question-title)]', '问卷题目必须使用16像素题目层级。');
requireText(assignedSource, 'text-[length:var(--tm-font-size-control)]', '问卷填写控件必须统一使用14像素文案。');
requireText(assignedSource, 'whitespace-pre-wrap break-words', '问卷说明必须保留换行并完整换行展示。');
requireText(assignedSource, 'placeholder="请补充填写"', '家长端自定义答案输入框应提供清晰占位文案。');
requireText(assignedSource, "questionnaire.status !== 'active'", '家长填写页必须响应老师结束收集。');
requireText(assignedSource, '问卷已结束或已经提交', '状态变化导致提交失败时必须提供明确反馈。');
requireText(assignedSource, "import { getQuestionnaireThemeCssVariables }", '教师预览和家长填写必须引用共享问卷主题 Token。');
requireText(assignedSource, 'getQuestionnaireThemeCssVariables(questionnaire.themeId, { inputAppearance })', '采集选择的主题必须同时作用于教师预览和家长实际填写。');
for (const token of ['--tm-brand-primary', '--tm-input-border', '--tm-input-focus-ring', '--tm-questionnaire-progress']) {
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
requireText(questionnaireThemeSource, "export type QuestionnaireThemeId = 'classic-red' | 'growth-green' | 'learning-blue'", '采集必须提供三种受控主题风格。');
requireText(questionnaireThemeSource, "export type QuestionnaireHeaderImageId = 'none' | 'ambient-flow' | 'ambient-tech' | 'learning' | 'growth' | 'sports' | 'creativity'", '采集必须复用系统预设头图类型。');
for (const headerLabel of ['无头图', '通用头图一', '通用头图二', '学习探索', '成长记录', '活力运动', '兴趣创造']) {
  requireText(questionnaireThemeSource, `label: '${headerLabel}'`, `采集风格缺少系统头图：${headerLabel}`);
}
requireText(viewSource, 'aria-label={`选择采集头图：${option.label}`}', '无名称采集头图选项必须保留明确的无障碍名称。');
forbidText(viewSource, '{option.label}{selected &&', '采集头图缩略图下方不得显示名称。');
requireText(storeSource, 'headerImageId?: QuestionnaireHeaderImageId', '采集任务必须保存头图标识。');
requireText(storeSource, "headerImageId: rest.headerImageId ?? 'none'", '历史采集必须默认兼容为无头图。');
requireText(questionnaireHeaderSource, 'aspect-[16/7]', '共享采集头图必须保持16:7固定比例。');
requireText(questionnaireHeaderSource, 'object-cover', '共享采集头图必须铺满并裁切容器。');
requireText(assignedSource, '<QuestionnaireHeaderImage headerImageId={questionnaire.headerImageId} />', '教师预览和家长填写必须渲染采集头图。');
requireText(questionnaireThemeSource, "'--tm-brand-primary': accent.primary", '共享问卷主题主色必须随所选风格变化。');
requireText(questionnaireThemeSource, "'--tm-bg-page': accent.page", '问卷填写页背景必须随所选风格变化。');
requireText(questionnaireThemeSource, "'--tm-questionnaire-progress': questionnaireThemePalette.neutral[900]", '问卷进度必须使用独立中性色 Token。');
requireText(questionnaireThemeSource, "options?: { inputAppearance?: 'theme' | 'teacher-mobile' }", '共享问卷主题必须支持教师端输入外观适配。');
requireText(questionnaireThemeSource, "useTeacherMobileInput ? questionnaireThemePalette.neutral[200] : accent.primary", '教师端问卷输入聚焦必须使用极浅暖灰，不得跟随主题色。');
for (const [token, value] of [['--tm-font-size-document-title', '22px'], ['--tm-font-size-group-title', '18px'], ['--tm-font-size-form-group-label', '14px'], ['--tm-font-size-question-title', '16px'], ['--tm-font-size-control', '14px']]) {
  requireText(questionnaireThemeSource, `'${token}': '${value}'`, `共享问卷主题缺少排版 Token：${token}`);
}
requireText(teacherTokenSource, "'--tm-font-size-group-title': '18px'", '教师端创建页必须提供18像素分组标题 Token。');
requireText(teacherTokenSource, "'--tm-font-size-form-group-label': '14px'", '教师端填写页必须提供14像素分组标签 Token。');
requireText(viewSource, 'getQuestionnaireSelectedOptions(answer).includes(option)', '题目统计必须将自定义答案计入对应选项。');
requireText(storeSource, 'getQuestionnaireResultRecords', '老师和家长填写必须共用已完成采集结果口径。');
requireText(viewSource, 'const resultRecords = getQuestionnaireResultRecords(record);', '题目统计不得只读取家长答卷。');
requireText(viewSource, "getQuestionnaireRespondentRole(activeRecord) === 'teacher' && recordOrigin === 'assigned-list'", '只有老师待填写入口可直达逐生录入页。');
requireText(viewSource, 'const visibleRecords = ownedRecords;', '我发起的列表必须只展示当前教师创建的采集，不因角色扩大范围。');
requireText(viewSource, "recordOrigin === 'assigned-list'", '他人发起的任务只能从待我填写入口按填写分工访问。');
if (viewSource.includes('canViewAllQuestionnaireResults') || appSource.includes('canViewAllQuestionnaireResults')) {
  throw new Error('教师手机端不得按领导或管理员角色扩大问卷数据可见范围。');
}
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
requireText(viewSource, "setPreviewReturnMode('create')", '从编辑页退出预览后必须返回原编辑流程。');
requireText(createPreviewSource, 'collectionMode,', '创建预览必须保留当前采集类型，不能硬编码为家长问卷。');
forbidText(createPreviewSource, "collectionMode: 'guardian_questionnaire'", '学生信息采集预览不能被错误地创建为家长问卷。');
requireText(createSource, 'grid-cols-[var(--tm-size-touch)_var(--tm-size-touch)_var(--tm-size-touch)_minmax(0,1fr)_minmax(0,1fr)]', '两类采集编辑页底部必须统一使用大纲、风格、设置、预览和下一步五段操作。');
for (const tool of ['aria-label="大纲"', 'aria-label="风格"', 'aria-label="设置"', '>预览</button>']) requireText(createSource, tool, `采集编辑器底部缺少：${tool}`);
requireText(createSource, 'sortingMode="external"', '采集正文不应继续直接承担拖动排序。');
requireText(createSource, '<FormOutlineSorter', '采集排序必须收敛到大纲弹窗。');
requireText(createSource, 'smartDefaultContent', '采集普通题型必须复用档案设计的智能默认内容交互。');
requireText(createSource, 'fixedContentFieldIds={lockedFieldIds}', '成长数据和档案字段必须使用完整的只读编辑态。');
requireText(createSource, 'showLayoutControl={false}', '分组开关必须从正文移入设置弹窗。');
forbidText(studentDetailSource, 'openListPreview(record)', '学生采集详情不应提供原始问卷预览入口。');
requireText(viewSource, 'const StudentCollectionForm: React.FC<StudentCollectionFormProps>', '学生采集预览与真实填写必须复用业务字段组件。');
if ((viewSource.match(/<StudentCollectionForm/g) ?? []).length < 2) {
  throw new Error('学生采集预览与真实逐生填写必须共同调用字段组件。');
}
requireText(viewSource, 'const [previewAnswers, setPreviewAnswers] = useState<Record<string, QuestionnaireAnswer>>({});', '学生采集预览必须使用独立答案状态。');
requireText(viewSource, 'onAnswerChange={(questionId, answer) => setPreviewAnswers', '学生采集预览输入只能写入预览答案状态。');
requireText(viewSource, 'style={getTeacherQuestionnaireThemeStyle(previewRecord.themeId)}', '学生采集预览必须保留主题背景并使用教师端浅边界输入外观。');
requireText(viewSource, '<h1 className="text-pretty text-[length:var(--tm-font-size-document-title)]', '学生采集预览标题必须使用独立文档标题层级。');
requireText(viewSource, 'getStudentCollectionQuestionGroups(record).map(questionGroup', '学生采集必须按分组组织填写内容。');
requireText(viewSource, 'questionGroup.label && <h2 className="mb-2 px-1 text-[length:var(--tm-font-size-form-group-label)]', '学生采集分组标签必须使用14像素弱层级并位于题目卡外。');
forbidText(viewSource, 'bg-[var(--tm-bg-surface-soft)] px-4 py-3 text-[length:var(--tm-font-size-group-title)]', '学生采集分组标签不得继续使用题目卡内的高层级底色标题行。');
requireText(viewSource, 'text-[length:var(--tm-font-size-question-title)] font-bold', '学生采集字段名称必须使用16像素题目层级。');
requireText(viewSource, 'min-h-[52px] w-full items-center gap-2.5', '学生采集选项必须统一为至少52像素并显示选择控件。');
requireText(detailSource, 'rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] p-4 [box-shadow:var(--tm-shadow-card)]', '问卷详情基本信息卡必须复用教师端公共卡片令牌。');
requireText(teacherTokenSource, "'--tm-shadow-card'", '教师端唯一令牌源必须提供公共卡片阴影。');
forbidText(detailSource, 'openListPreview(activeRecord)', '统一采集详情不应提供原始问卷预览入口。');
requireText(listActionsSource, 'onClick={previewListRecord}', '列表操作弹窗必须保留原始问卷预览入口。');
requireText(listActionsSource, "activeListActionRecord.status !== 'active' && <span", '收集中的任务弹窗不应重复展示状态标签。');
requireText(viewSource, "setPreviewReturnMode('list');", '从列表操作弹窗进入预览后必须返回问卷列表。');
forbidText(detailSource, 'line-clamp-2', '问卷详情说明必须完整展示，不能截断为两行。');
if (detailSource.includes('<StatusPill') || detailSource.includes('grid-cols-[0.9fr_1.1fr]') || detailSource.includes('border-t border-slate-100 pt-3')) {
  throw new Error('问卷详情卡不应保留状态工具栏、固定两列或割裂内容的分割线。');
}
if (detailSource.includes('statusMeta[activeRecord.status]') || detailSource.includes('getQuestionnaireTargetLabel(activeRecord)') || detailSource.includes('<UsersRound')) {
  throw new Error('问卷详情卡不应展示问卷状态或发送对象。');
}
requireText(detailSource, 'activeRecord.suggestedDeadline &&', '问卷详情卡只应在设置后展示完成时间。');
if (viewSource.includes('提醒未完成家长') || viewSource.includes('发送提醒') || storeSource.includes('QuestionnaireReminder') || storeSource.includes('sendQuestionnaireReminder') || parentSource.includes('老师提醒')) {
  throw new Error('问卷流程不应提供提醒未完成家长功能。');
}
if (viewSource.includes('{answers.length}条回答') || viewSource.includes('{answers.length}份回答') || viewSource.includes('`已完成 ${record.submissions.length}`')) {
  throw new Error('问卷详情不应在题目卡或答卷筛选中重复展示完成人数。');
}
if (viewSource.includes('描述性统计') || viewSource.includes('不进行自动总结') || viewSource.includes("['overview', '概览']") || viewSource.includes("['analysis', '题目分析']")) {
  throw new Error('问卷数据页不应保留重复页签或解释性统计文案。');
}
requireText(viewSource, '>完成时间</div>', '创建页必须使用完成时间文案。');
forbidText(viewSource, '建议完成时间', '用户界面不应继续使用建议完成时间文案。');
requireText(viewSource, 'const [hasSuggestedDeadline, setHasSuggestedDeadline] = useState(false);', '新问卷默认不设置完成时间。');
requireText(viewSource, 'upsertQuestionnaireDraftForSource(record)', '采集设计必须按当前来源自动覆盖保存一份草稿。');
requireText(viewSource, "if (pageMode !== 'create') return undefined", '自动草稿只应在新建和编辑采集期间保存。');
requireText(viewSource, "if (!hasMeaningfulDraftContent())", '完全空白的采集不应保存草稿。');
forbidText(createSource, '保存草稿', '采集设计底部不应继续展示手动保存草稿按钮。');
requireText(viewSource, 'onClick={createStep === 3 ? () => setShowPublishConfirm(true) : advanceCreateStep}', '下一步必须可点击并主动触发校验，发布前必须进入二次确认。');
requireText(completePublishSource, "setListFilter('active');", '发布成功后必须切换到收集中列表。');
requireText(completePublishSource, "setPageMode('list');", '发布成功后必须返回问卷列表。');
forbidText(completePublishSource, "setPageMode('detail');", '发布成功后不应进入空数据详情页。');
requireText(viewSource, "&& buildTargets(effectiveGrowthFields.length > 0 || Boolean(draftArchiveTemplateId)).length === 0", '发送范围为空时必须通过主动反馈阻止进入发布确认。');
requireText(viewSource, "target?.scrollIntoView({ behavior: 'smooth', block: 'center' })", '校验失败后必须滚动到首个错误。');
requireText(viewSource, 'fieldErrors={stepOneValidationAttempt ? stepOneFieldErrors : undefined}', '题目错误必须在字段内就地展示。');
if (viewSource.includes("disabled={createStep === 1 ? !validStepOne")) {
  throw new Error('第一步的下一步按钮不应因内容未完成而静默禁用。');
}
if (viewSource.includes("createStep === 1 ? persistCurrentDraft") || viewSource.includes("</> : '上一步'")) {
  throw new Error('底部左侧不应在发送范围或确认发布步骤替换为重复的上一步操作。');
}
requireText(viewSource, "'采集已重新开放'", '已结束采集必须支持重新开放。');
requireText(viewSource, '>结束收集</button>', '收集中问卷必须支持人工结束。');
requireText(viewSource, '已到完成时间', '逾期后必须向老师提供结束收集入口。');
if (viewSource.includes('>截止时间<') || viewSource.includes('提前结束问卷')) {
  throw new Error('问卷不应再使用强截止或提前结束文案。');
}
requireText(parentSource, 'formatQuestionnaireCompletionTime(questionnaire.suggestedDeadline)', '家长端完成时间必须使用共享格式化方法。');
forbidText(parentSource, "'不限时间'", '未设置完成时间时，家长端不应展示不限时间。');
requireText(questionnaireTimeSource, '(\\d{1,2})-(\\d{1,2})', '完成时间必须兼容历史未补零的月份和日期。');
requireText(questionnaireTimeSource, '`${Number(month)}月${Number(day)}日`', '完成时间必须按真实月份和日期格式化。');
forbidText(questionnaireTimeSource, "replace('2026-'", '完成时间格式化不得写死年份。');
if (listSource.includes('当前收集中') || listSource.includes('等待家长提交')) {
  throw new Error('问卷列表顶部不应展示重复统计信息。');
}
if (listSource.includes('<StatusPill') || listSource.includes('继续编辑') || listSource.includes('record.questions.length')) {
  throw new Error('问卷列表不应重复显示状态标签或草稿题目统计。');
}
requireText(listSource, "getQuestionnaireRespondentRole(record) === 'guardian' && record.suggestedDeadline", '仅设置了完成时间的家长填写卡片可以展示时间。');
requireText(listSource, 'formatQuestionnaireCompletionTime(record.suggestedDeadline)', '问卷卡片必须使用共享完成时间格式化方法。');
forbidText(listSource, 'formatCollectionDate(record.createdAt)', '老师填写卡片不应展示创建日期。');
forbidText(listSource, "'不限时间'", '未设置完成时间的卡片不应展示不限时间。');
requireText(listSource, 'text-[length:var(--tm-font-size-card-title)] font-bold leading-[22px]', '问卷名称必须使用教师端卡片标题层级。');
requireText(listSource, '{completed}/{reachable}</span>', '问卷采集卡片必须保留直观的完成进度分数。');
requireText(listSource, 'mt-2 h-1.5 w-full overflow-hidden rounded-full', '双列采集卡必须展示完整宽度的紧凑进度条。');
requireText(viewSource, "accentClass: 'bg-[var(--tm-audience-guardian-primary)]'", '家长问卷卡片必须使用教师端家长受众色。');
requireText(viewSource, "accentClass: 'bg-[var(--tm-audience-student-primary)]'", '学生采集卡片必须使用教师端学生受众色。');
requireText(viewSource, 'icon: UsersRound', '家长问卷必须通过家庭图标提供非颜色识别。');
requireText(viewSource, 'icon: UserRoundCheck', '学生采集必须通过学生图标提供非颜色识别。');
requireText(listCardsSource, 'pointer-events-none absolute inset-x-3 top-0 h-[3px] rounded-b-full', '双列采集卡顶部必须使用不改变布局的短类型色条。');
requireText(listCardsSource, '${modeMeta.badgeClass}', '问卷卡片必须同时展示类型标签，不能只靠颜色区分。');
requireText(listCardsSource, "record.status === 'ended' ? 'bg-[var(--tm-text-disabled)]' : modeMeta.progressClass", '收集中卡片的短进度条应与采集类型保持一致。');
requireText(listSource, 'grid grid-cols-2 gap-3', '问卷采集必须使用一行两张的紧凑卡片布局。');
requireText(listSource, 'active:scale-[0.97]', '可点击问卷卡片必须保留克制的按压反馈。');
requireText(listSource, 'aria-label={`打开采集操作：${record.title}`}', '点击采集卡片必须打开操作弹窗。');
for (const actionGroup of ['>查看采集</h4>', '>任务管理</h4>', '>查看详情</button>', '>预览</button>', '>复制采集</button>']) requireText(listSource, actionGroup, `采集操作弹窗缺少层级或操作：${actionGroup}`);
if (listCardsSource.includes('已提交') || listCardsSource.includes('>{completion}%</span>') || listCardsSource.includes('border-t') || listCardsSource.includes('<ChevronRight')) {
  throw new Error('问卷卡片不应显示解释文案、百分比、分割线或展开图标。');
}
if (listSource.includes(' 前')) {
  throw new Error('问卷卡片时间后不应再显示“前”。');
}

requireText(storeSource, "QuestionnaireStatus = 'draft' | 'active' | 'ended' | 'archived'", '问卷生命周期必须包含归档状态。');
requireText(listSource, "[['active', '收集中'], ['ended', '已结束']]", '采集顶部只保留收集中和已结束两个高频状态页签。');
forbidText(listSource, "['draft', '草稿']", '自动草稿不应继续作为列表页签展示。');
if (listSource.includes("['archived', '已归档']")) {
  throw new Error('已归档不应侵入顶部高频状态页签。');
}
requireText(viewSource, "setPageMode('archived-list')", '已归档问卷必须通过二级入口访问。');
requireText(archiveActiveRecordSource, "setListFilter('ended')", '问卷归档后必须保持已结束筛选。');
requireText(archiveActiveRecordSource, "setPageMode('list')", '问卷归档后必须返回主列表。');
forbidText(archiveActiveRecordSource, "setPageMode('archived-list')", '问卷归档后不得自动跳转到已归档列表。');
requireText(listSource, 'mt-2 flex justify-end', '已归档入口必须右对齐。');
if (listSource.includes('>{archivedRecords.length}</span>')) {
  throw new Error('已归档入口不应显示归档数量。');
}
requireText(viewSource, 'title="继续编辑"', '再次新建同来源采集时必须询问是否继续编辑草稿。');
requireText(viewSource, 'const continueCurrentDraft = () =>', '草稿恢复弹窗必须支持继续编辑。');
requireText(viewSource, 'const restartCurrentDraft = () =>', '草稿恢复弹窗必须支持重新创建。');
requireText(storeSource, 'upsertQuestionnaireDraftForSource', '数据层必须按当前用户和填写来源覆盖旧草稿。');
requireText(storeSource, 'deleteQuestionnaireDraftsForSource', '重新创建时必须能清理当前来源草稿。');
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

requireText(viewSource, 'sticky top-0 z-[45] flex h-11 shrink-0 items-center justify-between bg-[var(--tm-page-plain-header-bg)] pl-4 [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))]', '问卷顶部必须使用教师端纯色标题栏 Token、44像素高度并避让微信胶囊安全区。');
requireText(assignedSource, 'preview ? (\n        <header className="sticky top-0 z-[45] flex h-11 shrink-0 items-center justify-between bg-[var(--tm-page-plain-header-bg)]', '家长填写问卷的教师端预览必须切换为教师端标准标题栏。');
if (viewSource.includes('justify-between border-b border-[var(--tm-border-subtle)] bg-[var(--tm-bg-page-glass)]')) {
  throw new Error('问卷顶部标题栏不应保留分割线，应依靠毛玻璃与内容自然分层。');
}
forbidText(listSource, 'overflow-hidden bg-[var(--tm-bg-page)]', '采集列表应继续使用屏幕级背景。');
requireText(createSource, 'bg-[var(--tm-bg-page)] pb-24" style={editorThemeStyle}', '采集编辑画布必须即时使用当前风格背景。');
requireText(viewSource, "getQuestionnaireThemeCssVariables(themeId, { inputAppearance: 'teacher-mobile' })", '教师端问卷主题必须统一适配浅边界输入外观。');
requireText(viewSource, 'inputAppearance="teacher-mobile"', '教师端家长问卷预览必须显式使用教师端浅边界输入外观。');
forbidText(viewSource.slice(viewSource.indexOf('const PageHeader'), viewSource.indexOf('const BottomAction')), 'action?: React.ReactNode', '问卷标题栏不得再提供业务操作插槽。');
requireText(viewSource, 'absolute inset-x-16 truncate text-center', '问卷顶部标题必须保持居中安全区。');
requireText(viewSource, '<ChevronLeft className="h-5 w-5" />', '问卷顶部返回图标必须与管理页保持一致。');
requireText(viewSource, '<div className="h-11 w-11 shrink-0" aria-hidden="true" />', '问卷标题栏右侧必须完整留空给微信原生胶囊。');
requireText(detailSource, '<IconButton label="更多操作" onClick={() => setShowRecordMenu(true)}>', '问卷详情更多操作必须移入首张内容卡。');
requireText(studentDetailSource, '{!assignedContext && <div className="-mr-2 -mt-2 flex shrink-0 items-center">', '待我填写详情不应渲染空的操作区域。');
requireText(studentDetailSource, '<IconButton label="更多操作" onClick={() => setShowRecordMenu(true)}>', '创建人查看学生采集详情时必须保留更多操作。');
requireText(viewSource, 'import MobileFloatingCreateButton', '问卷列表必须复用通用悬浮创建组件。');
requireText(listSource, 'setRespondentSheetMode(\'entry\')', '新建采集必须从右下角悬浮入口先选择填写人。');
requireText(listSource, '<div className="relative flex h-full min-h-0 flex-col overflow-hidden">', '问卷列表外层不得为悬浮按钮增加固定底部占位。');
requireText(listSource, '<main className="min-h-0 flex-1 touch-pan-y overflow-y-auto overscroll-contain px-5 pb-[calc(var(--tm-size-floating-action)+var(--tm-space-5)+var(--tm-space-5)+env(safe-area-inset-bottom))] pt-4 no-scrollbar">', '悬浮按钮避让空间必须放在可滚动列表内部。');
forbidText(listHeaderSource, '待我填写', '问卷列表顶部不得重复展示待我填写快捷入口。');
forbidText(listHeaderSource, '新建采集', '问卷列表顶部不得承载新建采集入口。');
requireText(floatingCreateSource, 'h-[var(--tm-size-floating-action)] w-[var(--tm-size-floating-action)]', '通用悬浮创建按钮必须使用教师端组件尺寸令牌。');
requireText(floatingCreateSource, ": 'calc(var(--tm-space-5) + env(safe-area-inset-bottom))'", '通用悬浮创建按钮必须避让底部安全区。');
if (viewSource.includes('subtitle?: string') || viewSource.includes('subtitle={`第${createStep}步，共3步`}')) {
  throw new Error('问卷顶部不应承载步骤或答卷副标题。');
}
requireText(responseDetailSource, '<PageHeader title="答卷详情"', '点击已完成记录必须进入答卷详情。');
forbidText(responseDetailSource, '<PageHeader title="预览问卷"', '已完成答卷不得继续冒充原始问卷预览。');
requireText(responseDetailSource, '<AnswerContextMeta', '答卷详情必须使用紧凑文本元信息组织学生和填写来源。');
requireText(responseDetailSource, 'studentName={activeResultRecord.studentName}', '答卷详情必须展示采集对象姓名。');
requireText(responseDetailSource, 'studentClassName={activeResultRecord.className}', '答卷详情必须展示采集对象班级。');
requireText(responseDetailSource, 'respondentName={respondentName}', '答卷详情必须在学生身份后展示实际填写人。');
requireText(responseDetailSource, 'completedAt={formatCompletedAt(activeResultRecord.completedAt)}', '答卷详情必须展示格式化后的完成时间。');
requireText(viewSource, "completedAt.match(/^(\\d{4})-(\\d{1,2})-(\\d{1,2})[ T](\\d{1,2}):(\\d{2})/)", '完成时间必须兼容不补零的月、日和小时。');
requireText(viewSource, "`${Number(year)}年${Number(month)}月${Number(day)}日 ${String(Number(hour)).padStart(2, '0')}:${minute}`", '答卷详情填写日期必须显示完整年月日和时间。');
requireText(responseDetailSource, ': activeResultRecord.respondentLabel;', '家长填写人必须与学生身份分开显示。');
forbidText(responseDetailSource, "`${activeResultRecord.studentName}的${activeResultRecord.respondentLabel}`", '家长填写人不得重复拼接学生姓名。');
requireText(responseDetailSource, "`${activeResultRecord.respondentLabel.replace(/老师$/, '')}老师`", '老师填写人必须展示老师姓名和老师后缀。');
requireText(answerContextMetaSource, 'aria-label="答卷对象与填写信息"', '答卷上下文必须提供明确的无障碍语义。');
requireText(answerContextMetaSource, '>采集对象：</span>', '文本元信息必须明确标识采集对象。');
requireText(answerContextMetaSource, '>填写人员：</span>', '文本元信息必须使用填写人员字段名。');
requireText(answerContextMetaSource, '>填写日期：</span>', '文本元信息必须独立展示填写日期字段。');
requireText(answerContextMetaSource, 'space-y-1.5 text-[length:var(--tm-font-size-compact)]', '三行上下文必须统一使用13像素紧凑字号。');
for (const heavyStyle of ['rounded-[var(--tm-radius-card)]', 'border border-[var(--tm-border-subtle)]', 'bg-[var(--tm-bg-surface)]', '[box-shadow:var(--tm-shadow-card)]', 'min-h-[56px]']) {
  forbidText(answerContextMetaSource, heavyStyle, `答卷上下文不应继续使用重卡片样式：${heavyStyle}`);
}
requireText(answerContextMetaSource, 'src={respondentAvatar ?? ASSETS.AVATAR.TEACHER_DEFAULT}', '教师头像缺失时必须回退教师默认头像。');
if ((answerContextMetaSource.match(/h-\[var\(--tm-font-size-compact\)\] w-\[var\(--tm-font-size-compact\)\] shrink-0/g) ?? []).length !== 3) {
  throw new Error('学生头像、教师头像和家长关系图标必须统一为与13像素文字等高。');
}
requireText(answerContextMetaSource, '{studentName}（{studentClassName}）', '采集对象必须以姓名后跟括号班级的文本形式展示。');
requireText(answerContextMetaSource, '<UsersRound className="mr-1 h-[var(--tm-font-size-compact)]', '家长填写必须使用紧凑关系图标而不是伪造真人头像。');
if ((answerContextMetaSource.match(/text-\[var\(--tm-text-secondary\)\]/g) ?? []).length < 6) {
  throw new Error('字段标签、学生姓名班级、填写人员和填写日期必须统一使用灰色文字。');
}
requireText(answerContextMetaSource, '>{respondentName}</span>', '填写人员姓名必须独立展示。');
requireText(answerContextMetaSource, '>{completedAt}</span>', '填写日期必须作为独立字段展示并保持完整。');
forbidText(answerContextMetaSource, '{respondentName}填写', '已有填写人标签后不得在姓名后重复展示填写动作。');
forbidText(responseDetailSource, '填写人：', '答卷详情不得退回字段标签式信息堆叠。');
forbidText(responseDetailSource, '完成时间：', '完成时间应归入填写来源，不得作为并列字段堆叠。');
requireText(storeSource, 'respondentId?: string', '答卷结果必须保留填写教师标识以匹配头像。');
requireText(storeSource, 'respondentId: item.assigneeTeacherId', '老师填写结果必须透传实际负责人标识。');
requireText(appSource, 'teacherAvatar={teacherProfile.avatar}', '问卷页面必须接收当前教师真实头像。');
requireText(responseDetailSource, 'activeResultRecord.respondentId === teacherId', '答卷详情必须按填写教师标识匹配当前教师头像。');
requireText(originalPreviewSource, '<PageHeader title="预览问卷"', '老师填写的原始问卷预览必须使用预览问卷标题。');
forbidText(originalPreviewSource, '填写人：', '原始问卷预览不得展示填写人。');
requireText(assignedSource, '>预览问卷</h1>', '家长填写的原始问卷预览必须使用预览问卷标题。');
requireText(viewSource, 'const StudentIdentityRow: React.FC', '逐生页面必须复用问卷业务内的学生身份行。');
requireText(studentRecordPageSource, '<PageHeader title="采集录入"', '未完成学生必须进入固定标题的采集录入页。');
forbidText(studentRecordPageSource, '<PageHeader title={activeRecord.title}', '采集名称不得占用逐生录入页标题。');
if ((studentRecordPageSource.match(/<StudentIdentityRow/g) ?? []).length !== 2) {
  throw new Error('采集录入的首页与题目页都必须展示学生身份。');
}
requireText(studentRecordPageSource, 'studentName={studentRecord.studentName}', '采集录入必须持续展示当前学生姓名。');
requireText(studentRecordPageSource, 'studentClassName={studentRecord.className}', '采集录入必须持续展示当前学生班级。');

requireText(viewSource, 'typePickerPrimaryLabel="普通题型"', '添加内容必须提供普通题型页签。');
requireText(viewSource, "label: '成长数据'", '添加内容必须提供成长数据页签。');
requireText(viewSource, 'fields={availableGrowthFieldOptions}', '成长数据页签必须把学校已启用字段传入统一分类选择器。');
requireText(viewSource, 'getEnabledGrowthFields(spaceId)', '成长数据页签必须按学校空间读取启用字段。');
requireText(viewSource, '<GrowthFieldCategoryPicker', '问卷采集必须复用成长字段分类选择器。');
requireText(growthFieldPickerSource, 'role="tablist" aria-label="成长数据分类"', '成长字段必须通过分类标签切换。');
requireText(growthFieldPickerSource, 'activeGroup.fields.map', '分类选择器只应展示当前分类的字段。');
requireText(growthFieldPickerSource, 'selectedCount > 0', '分类标签必须反馈跨分类已选数量。');
requireText(growthCatalogSource, "key: 'height_cm', label: '身高'", '平台预置字段必须包含身高。');
requireText(growthCatalogSource, "key: 'weight_kg', label: '体重'", '平台预置字段必须包含体重。');
requireText(growthCatalogSource, "key: 'lung_capacity_ml', label: '肺活量'", '平台预置字段必须包含体质测试字段。');
for (const groupLabel of ['生长发育', '视力健康', '体质测试', '健康体检']) {
  requireText(growthCatalogSource, `label: '${groupLabel}'`, `平台成长字段目录缺少分类：${groupLabel}`);
}
requireText(growthDefinitionSource, "MEASUREMENT_DATE_QUESTION_ID = 'growth-measured-at'", '底层必须保留历史答卷日期题的标准字段标识。');
requireText(storeSource, "GrowthRecordDateMode = 'respondent' | 'fixed'", '底层必须保留历史填写人日期模式的数据兼容。');
requireText(viewSource, 'setShowGrowthDateSheet(true)', '成长字段卡必须提供任务级记录日期设置。');
forbidText(viewSource, "[['respondent', '填写人选择'], ['fixed', '本次统一日期']]", '本期记录日期不应再提供模式选择。');
forbidText(viewSource, 'draftGrowthDateMode', '采集编辑器不应保留记录日期模式状态。');
requireText(viewSource, 'createBodyGrowthQuestions(effectiveGrowthFields, false)', '填写端不得生成成长记录日期题。');
requireText(viewSource, "growthRecordDateMode: effectiveGrowthFields.length > 0 ? 'fixed' : undefined", '保存和发布必须统一写入老师选择的任务记录日期。');
requireText(viewSource, "const stepOneGrowthDateError = effectiveGrowthFields.length > 0 && !draftGrowthRecordDate", '包含成长字段时记录日期必须填写。');
requireText(viewSource, 'aria-label="记录日期"', '记录日期浮层必须直接提供日期选择。');
requireText(growthPersistenceSource, "questionnaire.growthRecordDateMode === 'fixed'", '成长记录必须按任务日期规则读取记录日期。');
requireText(growthPersistenceSource, 'if (!recordedAt) return false;', '记录日期缺失时必须阻止写入成长数据。');
forbidText(growthPersistenceSource, 'recordedAt: _completedAt', '提交时间不得作为成长记录日期兜底。');
forbidText(createSource, '添加成长数据组', '一份任务不应提供第二个成长数据组。');
requireText(growthDefinitionSource, "HEIGHT_QUESTION_ID = 'growth-height-cm'", '身高必须使用标准字段标识。');
requireText(growthDefinitionSource, "WEIGHT_QUESTION_ID = 'growth-weight-kg'", '体重必须使用标准字段标识。');
requireText(viewSource, 'const questions = [...getDraftGrowthQuestions(), ...getDraftArchiveQuestions(), ...draftQuestions]', '统一读取逻辑必须兼容档案采集、自定义采集和历史混合任务。');
requireText(storeSource, "QuestionnaireContentType = 'ordinary' | 'growth' | 'mixed'", '底层必须区分普通、成长和混合采集。');
requireText(storeSource, "QuestionnaireRespondentRole = 'teacher' | 'guardian'", '底层必须独立保存老师填写和家长填写。');
requireText(storeSource, 'getQuestionnaireContentType', '旧采集数据必须可兼容读取内容类型。');
requireText(storeSource, 'getQuestionnaireRespondentRole', '旧采集数据必须可兼容读取填写方式。');
requireText(viewSource, 'getCollectionBadgeLabel(record)', '采集列表必须展示填写方式。');
requireText(viewSource, "return role === 'teacher' ? '老师填写' : '家长填写';", '采集列表标签只区分老师填写和家长填写。');
forbidText(viewSource, "shortLabel: '成长采集'", '成长、普通和混合属于内部数据类型，不应作为采集列表标签。');
requireText(viewSource, 'buildTargets(effectiveGrowthFields.length > 0 || Boolean(draftArchiveTemplateId))', '包含成长或档案字段的采集必须使用学校花名册姓名。');
requireText(viewSource, 'hasGrowthCollectionFields(record) || Boolean(record.archiveTemplateId)', '包含成长或档案字段的已有采集必须持续使用花名册姓名。');
requireText(viewSource, 'shouldSyncRosterName', '已有成长采集的逐生记录必须迁移为花名册姓名。');
requireText(viewSource, 'persistGrowthCollectionAnswers(', '老师完成成长采集后必须通过统一入口写入学生成长数据。');
requireText(viewSource, '<PageHeader title="采集详情"', '普通问卷和成长采集必须统一使用采集详情标题。');
requireText(storeSource, 'growthTemplate?: GrowthCollectionTemplate', '采集任务必须兼容历史平台成长模板类型。');
requireText(assignedSource, "getQuestionnaireContentType(questionnaire) !== 'ordinary'", '家长提交后必须识别成长或混合采集。');
requireText(assignedSource, 'persistGrowthCollectionAnswers(', '家长提交成长信息后必须同步学生成长数据。');
requireText(growthPersistenceSource, 'target.studentId', '家长成长信息必须通过问卷目标匹配到真实学生。');
requireText(viewSource, 'title="选择采集内容"', '选择填写人后必须继续选择按档案采集或自定义采集。');
requireText(viewSource, '>自定义采集</h3>', '自定义采集必须使用独立区块标题。');
requireText(viewSource, '>从空白创建</span>', '自定义采集必须提供明确的创建入口。');
requireText(viewSource, '>按档案采集</h3>', '已启用档案必须使用独立区块展示。');
if (viewSource.indexOf('>自定义采集</h3>') > viewSource.indexOf('>按档案采集</h3>')) {
  throw new Error('自定义采集必须位于按档案采集之前。');
}
requireText(viewSource, '{availableArchiveTemplates.length}份', '按档案采集区块必须展示可用档案数量。');
requireText(viewSource, 'setDraftHeaderImageId(record?.headerImageId ?? archiveTemplateSnapshot?.appearance.headerImageId ?? \'none\')', '按档案采集必须继承档案头图。');
requireText(viewSource, 'getQuestionnaireThemeIdForArchiveTheme(archiveTemplateSnapshot?.appearance.themeId)', '按档案采集必须继承可匹配的档案主题。');
requireText(createSource, '<QuestionnaireHeaderImage headerImageId={draftHeaderImageId} />', '选择头图后必须立即作用于采集编辑画布。');
requireText(createSource, '>采集头图</h3>', '风格弹窗必须提供采集头图选择。');
requireText(viewSource, 'headerImageId: draftHeaderImageId', '预览、草稿和发布必须保存当前头图。');
requireText(viewSource, '<QuestionnaireHeaderImage headerImageId={activeRecord.headerImageId}', '老师逐生填写必须展示采集头图。');
requireText(viewSource, '<QuestionnaireHeaderImage headerImageId={previewRecord.headerImageId}', '学生采集预览必须展示采集头图。');
requireText(viewSource, 'availableArchiveTemplates.map(template =>', '按档案采集必须展示当前已启用档案。');
requireText(viewSource, '<div className="grid grid-cols-2 gap-3">', '按档案采集必须使用一行两张的紧凑卡片。');
requireText(viewSource, 'className="block aspect-[16/7] w-full object-cover"', '按档案采集卡片必须使用铺满顶部的16:7头图。');
requireText(viewSource, 'formatArchiveGradeScope(template.gradeScopes)', '按档案采集卡片必须展示紧凑年级范围。');
requireText(mobileBottomSheetSource, 'min-h-0 flex-1 overflow-y-auto', '多个档案必须在底部抽屉内容区自然滚动。');
requireText(viewSource, "record?.layoutMode ?? archiveTemplateSnapshot?.layoutMode ?? 'flat'", '从档案开始必须继承档案的布局模式。');
requireText(viewSource, 'record?.sections ?? archiveTemplateSnapshot?.sections ?? []', '从档案开始必须继承档案分组。');
requireText(viewSource, 'sectionId: field.sectionId', '档案成长字段必须继承档案中的实际分组。');
forbidText(viewSource, "inheritedSections.unshift({ id: archiveGrowthSectionId, label: '成长数据' })", '按档案采集不得额外创建成长数据分组。');
requireText(viewSource, "getArchiveGrowthMissingPolicy(field) === 'required'", '档案成长字段必须继承档案自身的必填规则。');
requireText(viewSource, 'draftSections.some(section => section.id === field.sectionId)', '档案自定义字段必须保留原分组。');
requireText(createStepOneSource, 'readOnly={isArchiveCollection}', '按档案采集必须使用表单构建器只读态。');
requireText(createSource, 'if (isArchiveCollection) return;', '按档案采集必须在数据回调层阻止结构变更。');
forbidText(createStepOneSource, '内容固定', '按档案采集不应增加解释内容不可修改的状态行。');
requireText(viewSource, 'setDraftTitle(`${archiveTemplateSnapshot.name}采集`)', '按档案采集默认名称必须使用档案名称加采集。');
requireText(formBuilderSource, 'getLockedFieldSubtitle', '共享表单构建器必须支持展示锁定字段。');
requireText(formBuilderSource, 'readOnly && (choice || rating || usesSubFields) && renderFieldPreview', '只读档案必须完整展示选择项、评分和多项填空内容。');
requireText(formBuilderSource, '!readOnly && <IconButton label={`从本次采集中移除', '只读表单必须隐藏字段移除操作。');
requireText(formBuilderSource, '!readOnly && <button type="button" aria-label={`在${section.label}中添加', '只读表单必须隐藏组内添加操作。');
requireText(formBuilderSource, '{(showItemLabel || (!readOnly && showLayoutControl)) && (', '无标题的只读表单或隐藏分组控制的表单不得保留空操作栏。');
forbidText(createStepOneSource, 'draftArchiveTemplateSnapshot.fields.flatMap', '按档案采集不应再改写档案字段快照。');
requireText(createSource, 'setDraftQuestionOrderIds(value.fields.map(field => field.id))', '自定义采集必须保留题目和成长字段排序。');
forbidText(createStepOneSource, '自动带入', '创建页不应向老师暴露系统自动带入概念。');
requireText(storeSource, 'archiveFieldSemanticKey?: string', '采集字段必须保存对应的档案字段标识。');
requireText(storeSource, 'archiveTemplateSnapshot?: ArchiveTemplateSnapshot', '采集任务发布时必须冻结档案字段定义。');
requireText(storeSource, 'archiveSkippedStudentNos?: string[]', '按档案采集任务必须保存因已有待填写而跳过的学生。');
requireText(viewSource, "archivePeriodKey: draftArchiveTemplateSnapshot ? 'current' : undefined", '同一学生和同一档案必须固定写入当前档案。');
requireText(viewSource, '>按档案采集</span>', '发布确认页必须明确本次使用的档案。');
requireText(viewSource, '建立档案', '发布确认页必须展示建立档案人数。');
requireText(viewSource, '更新档案', '发布确认页必须展示更新档案人数。');
requireText(viewSource, '已有待填写', '发布确认页必须展示已有待填写人数。');
requireText(viewSource, '{inputCount}项内容', '按档案采集列表必须只展示内容数量。');
requireText(viewSource, 'persistArchiveCollectionAnswers(activeRecord, studentRecord.studentNo, studentRecordAnswers, completedAt, teacherName)', '老师完成采集后必须用实际完成时间更新学生当前档案。');
requireText(assignedSource, 'persistArchiveCollectionAnswers(questionnaire, child.studentNo, answers, submittedAt, guardianRelation)', '家长提交采集后必须用实际提交时间更新学生当前档案。');
requireText(archivePersistenceSource, 'question.archiveFieldSemanticKey', '档案写回必须只处理明确绑定的字段。');
requireText(viewSource, "template.origin === 'school' && template.status === 'published'", '新建采集只能使用本校已启用的档案模板。');
forbidText(createStepOneSource, 'draftArchiveGrowthFieldSet', '按档案采集锁定后不应在成长字段选择器中维护档案去重状态。');
requireText(viewSource, 'getArchiveCollectionPrefillAnswers(record, studentNo)', '老师打开学生采集记录时必须读取当前档案自定义字段。');
requireText(assignedSource, 'getArchiveCollectionPrefillAnswers(questionnaire, child.studentNo)', '家长打开采集任务时必须读取当前档案自定义字段。');
requireText(viewSource, 'getArchiveCollectionTargetPlan(candidate, records, archiveWorkspace)', '发布前必须按学生规划建立、更新和已有待填写。');
requireText(viewSource, 'targets: eligibleTargets', '已有待填写学生必须从本次发布目标中跳过。');
requireText(viewSource, 'archiveSkippedStudentNos: archivePlan.pendingStudentNos', '跳过学生必须保存在任务中，避免动态班级同步重新加入。');
requireText(archivePersistenceSource, "record.status === 'active'", '已有待填写判断只能读取仍在收集中的任务。');
requireText(archivePersistenceSource, '!hasCompletedArchiveCollection(record, target.studentNo)', '已经完成原任务的学生必须允许再次采集。');
requireText(archivePersistenceSource, 'currentDraft?.answers ?? latestSnapshot?.answers ?? {}', '档案自定义字段必须优先读取当前档案，没有当前档案时读取最近留档。');
forbidText(studentArchiveStoreSource, 'respondentRole', '档案模板和档案分组不应重复保存问卷填写人。');
requireText(archivePersistenceSource, 'upsertStudentArchiveCollectionAnswers', '档案写回必须合并到学生当前档案。');
requireText(studentArchiveStoreSource, 'latestSnapshot?.answers', '新一轮当前档案必须继承最近一次留档内容。');
requireText(archivePersistenceSource, 'item.sourceRecordId === sourceRecordId', '档案成长快照必须只冻结本次采集生成的成长记录。');
requireText(studentArchiveStoreSource, 'mergeArchiveGrowthSnapshots(item.growthSnapshots, update.growthSnapshots)', '重复采集必须更新同一份档案的成长快照。');
requireText(archivePersistenceSource, 'const dataUpdatedAt = hasGrowthFields ? recordDate : completedDate', '包含成长字段时必须用记录日期，否则使用学生实际提交日期。');
requireText(studentArchiveStoreSource, 'dataUpdatedAt: update.dataUpdatedAt', '问卷写回已有档案时必须覆盖旧的业务数据更新日期。');
forbidText(createSource, '学期目标', '学期目标暂缓后，不应出现在新建采集流程。');
requireText(studentGrowthStoreSource, 'sourceRecordId', '成长记录必须保留采集来源记录以支持重复保存而不重复新增。');
if (viewSource.includes('即将开放') || viewSource.includes('<LockKeyhole')) {
  throw new Error('未开放的教师问卷不应侵入新建采集高频流程。');
}
requireText(storeSource, "QuestionnaireCollectionMode = 'guardian_questionnaire' | 'student_information' | 'teacher_questionnaire'", '底层必须按通用采集模式区分填写方和采集对象。');
requireText(storeSource, 'oneQuestionPerPage?: boolean;', '问卷数据模型必须保存一页一题设置。');
requireText(storeSource, "rest.oneQuestionPerPage ?? respondentRole === 'guardian'", '历史问卷必须按填写人兼容一页一题默认值。');
requireText(storeSource, 'export const isQuestionnaireOneQuestionPerPage', '预览与真实填写必须通过共享方法读取一页一题设置。');
requireText(viewSource, "const [draftOneQuestionPerPage, setDraftOneQuestionPerPage] = useState(true)", '配置页必须维护一页一题草稿状态。');
requireText(viewSource, "setDraftOneQuestionPerPage(record?.oneQuestionPerPage ?? resolvedRole === 'guardian')", '老师填写默认关闭、家长填写默认开启。');
if ((viewSource.match(/oneQuestionPerPage: draftOneQuestionPerPage/g) ?? []).length < 3) {
  throw new Error('创建预览、自动草稿和正式发布都必须保存一页一题设置。');
}
requireText(viewSource, '<SettingSwitchRow label="一页一题" checked={draftOneQuestionPerPage} onChange={setDraftOneQuestionPerPage} />', '设置抽屉必须提供一页一题开关。');
requireText(assignedSource, 'const oneQuestionPerPage = isQuestionnaireOneQuestionPerPage(questionnaire)', '家长预览与真实填写必须统一读取一页一题设置。');
requireText(assignedSource, 'questionnaire.questions.map((item, index)', '家长填写关闭一页一题后必须连续展示全部题目。');
requireText(assignedSource, '{oneQuestionPerPage ? (', '家长填写开启一页一题后必须使用逐题操作。');
requireText(viewSource, 'activeQuestionIndex={oneQuestionPerPage ? studentQuestionIndex : undefined}', '老师填写必须按一页一题设置切换逐题与连续展示。');
requireText(studentRecordPageSource, 'const oneQuestionPerPage = isQuestionnaireOneQuestionPerPage(activeRecord)', '老师真实填写必须读取共享的一页一题设置。');
requireText(originalPreviewSource, 'const oneQuestionPerPage = isQuestionnaireOneQuestionPerPage(previewRecord)', '老师预览必须读取共享的一页一题设置。');
requireText(viewSource, 'const [showQuestionnaireIntro, setShowQuestionnaireIntro] = useState(false)', '老师填写与预览必须维护独立问卷首页状态。');
requireText(viewSource, 'setShowQuestionnaireIntro(draftOneQuestionPerPage && Boolean(draftDescription.trim()))', '老师创建预览必须仅在逐题且有说明时从首页开始。');
requireText(studentRecordPageSource, 'const hasIntroPage = oneQuestionPerPage && Boolean(activeRecord.description.trim())', '老师真实填写必须按说明决定是否展示首页。');
requireText(studentRecordPageSource, '>开始填写</PrimaryButton>', '老师真实填写首页必须只提供开始填写主操作。');
requireText(originalPreviewSource, '>开始预览</PrimaryButton>', '老师预览首页必须只提供开始预览主操作。');
requireText(originalPreviewSource, 'studentQuestionIndex === 0 && hasIntroPage', '老师预览第一题必须能够返回问卷首页。');
requireText(viewSource, "{ value: 'unreachable', label: '未绑定' }", '家长问卷答卷筛选必须使用明确的未绑定术语。');
if (viewSource.includes('未送达')) {
  throw new Error('教师端不应使用容易被理解为通知失败的“未送达”。');
}
requireText(viewSource, "['teacher', '老师填写', '由老师逐个学生填写']", '统一采集任务必须支持老师填写。');
requireText(viewSource, "['guardian', '家长填写', '发送给家长填写']", '统一采集任务必须支持家长填写。');
requireText(viewSource, "studentRecords: respondentRole === 'teacher'", '老师填写必须按学生建立逐生记录。');
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
requireText(viewSource, "{ value: 'text', label: '问答题', icon: MessageSquareText }", '普通问卷题型必须提供问答题。');
requireText(viewSource, "{ value: 'multiple', label: '多选题', icon: ListChecks, choice: true }", '普通问卷题型必须提供多选题。');
requireText(viewSource, "type StudentRecordFilter = 'incomplete' | 'completed'", '老师填写答卷只使用未完成和已完成两类筛选。');
requireText(viewSource, "studentRecordFilter === 'incomplete' ? item.status !== 'completed'", '未完成筛选必须只排除已完成记录。');
requireText(viewSource, "{ value: 'completed', label: '已完成' },\n  { value: 'incomplete', label: '未完成' }", '老师填写答卷必须按已完成、未完成排序。');
requireText(viewSource, "{ value: 'completed', label: '已完成' },\n  { value: 'pending', label: '未完成' },\n  { value: 'unreachable', label: '未绑定' }", '家长填写答卷必须按已完成、未完成、未绑定排序。');
if ((viewSource.match(/<CompactSegmentedControl/g) ?? []).length < 3) {
  throw new Error('数据/答卷、答卷状态和教师待办填写进度必须复用同一个紧凑分段控件。');
}
forbidText(viewSource, '<TextSelectionControl', '问卷采集详情的状态筛选是页面级例外，不应继续使用纯文字选择控件。');
requireText(viewSource, 'ariaLabel="答卷状态"', '家长填写答卷筛选必须保留可识别的页签语义。');
for (const filterLabel of ['ariaLabel="答卷状态"', 'ariaLabel="填写进度"']) {
  const controlStart = viewSource.lastIndexOf('<CompactSegmentedControl', viewSource.indexOf(filterLabel));
  const controlEnd = viewSource.indexOf('/>', controlStart);
  const controlSource = viewSource.slice(controlStart, controlEnd);
  requireText(controlSource, 'fullWidth', `${filterLabel}必须使用与数据/答卷相同的单行等分 Tab。`);
}
requireText(viewSource, 'const getStudentAvatar = (studentNo: string)', '老师和家长填写答卷必须复用学生头像规则。');
requireText(viewSource, 'const StudentAnswerRow: React.FC', '老师和家长填写答卷必须复用同一学生名单行。');
requireText(viewSource, 'avatarSrc={getStudentAvatar(item.studentNo)}', '老师填写答卷列表必须使用学生头像。');
requireText(viewSource, 'avatarSrc={getStudentAvatar(row.studentNo)}', '家长填写答卷列表必须使用学生头像。');
requireText(viewSource, 'className={item.className}', '教师逐生答卷的已完成和未完成名单必须都展示学生班级。');
requireText(viewSource, 'className={row.className}', '家长答卷的已完成、未完成和未绑定名单必须都展示学生班级。');
forbidText(viewSource, "item.status === 'completed' ? item.className : undefined", '教师逐生答卷不得按完成状态隐藏班级。');
forbidText(viewSource, 'isCompleted ? row.className : undefined', '家长答卷不得按完成状态隐藏班级。');
if (viewSource.slice(viewSource.indexOf('const renderResponses'), viewSource.indexOf('const renderAnalysis')).includes('<ChevronRight')) {
  throw new Error('已完成答卷名单可点击但不应显示箭头。');
}
if (viewSource.includes('{item.studentName.slice(-1)}</span>')) {
  throw new Error('老师填写答卷列表不得使用姓名字块代替学生头像。');
}
requireText(storeSource, "StudentCollectionRecordStatus = 'pending' | 'completed'", '老师逐生作答第一版只能保存未完成和已完成两种状态。');
forbidText(studentDetailSource, '待继续', '老师逐生作答第一版不应展示草稿状态。');
requireText(studentDetailSource, ': assignedContext ? () => openStudentRecord(record, item.studentNo) : undefined', '只有待我填写入口中的未完成学生可以进入填写。');
requireText(viewSource, "if (recordOrigin !== 'assigned-list') return", '逐生填写入口必须校验来自待我填写。');
requireText(studentRecordPageSource, "recordOrigin === 'assigned-list'", '逐生填写页必须再次校验待办入口上下文。');
requireText(studentRecordPageSource, "studentRecord.status === 'pending'", '只有未完成的逐生记录可以编辑。');
forbidText(studentRecordPageSource, '保存草稿', '老师逐生作答第一版不提供保存草稿。');
requireText(studentRecordPageSource, '<PrimaryButton onClick={saveActiveStudentRecord} className="w-full">', '老师逐生作答只保留完成提交主操作。');
requireText(storeSource, "studentRecord: StudentCollectionRecord & { status: 'completed' }", '数据层只能提交已完成的逐生记录。');
requireText(storeSource, "status: 'pending',\n          updatedAt: '',\n          answers: {},", '历史逐生草稿必须迁移为未完成并清空未提交答案。');
if (viewSource.includes("['all', '全部']") || viewSource.includes("['incomplete', '待完成']")) {
  throw new Error('老师填写答卷不应保留“全部”或“待完成”一级筛选。');
}
requireText(viewSource, "status: 'pending'", '学生范围生成后必须为每名学生建立未填写记录。');
requireText(viewSource, "completeStudentCollectionRecord(activeRecord.id", '教师必须可以完成逐生采集记录。');
requireText(viewSource, "status: 'completed'", '逐生采集记录提交时必须直接标记完成。');
requireText(viewSource, 'getStudentCollectionRecordsForTeacher(activeRecord, teacherId, teacherName)', '逐生记录编辑权限必须按实际填写分配校验。');
requireText(viewSource, '>恢复编辑</button>', '学生信息采集结束后必须支持恢复编辑。');
requireText(storeSource, "getStudentCollectionCompletedCount", '学生信息采集进度必须按已完成学生记录计算。');
for (const mockId of ['collection-enrollment-202607', 'collection-status-check-202606']) {
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
requireText(bottomNavigationSource, 'pendingCollectionCount > 0', '我的底部导航必须按需展示待办数量。');
requireText(appSource, 'pendingCollectionCount={pendingCollectionCount}', '应用层必须向底部导航传入待办数量。');
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

requireText(viewSource, 'focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]', '问卷输入框应统一消费中性聚焦令牌。');
forbidText(viewSource, 'focus:border-[var(--tm-brand-primary)]', '问卷普通输入框聚焦时不应显示品牌红边界。');

requireText(classCascadeSource, 'onToggleGrade?: (classIds: string[]) => void;', '班级级联组件必须支持按当前年级全选。');
requireText(classCascadeSource, "aria-checked={allActiveClassesSelected ? true : hasActiveClassSelected ? 'mixed' : false}", '年级全选必须向读屏暴露未选、半选和全选状态。');
requireText(classCascadeSource, '全选本年级', '发送范围必须提供明确的年级全选入口。');
requireText(viewSource, 'onToggleGrade={toggleGradeClasses}', '问卷发送范围必须接入年级全选能力。');
requireText(viewSource, 'title="确认发布问卷？"', '发布前必须显示明确的二次确认。');
requireText(viewSource, '发布后，问卷内容和学生范围将不能编辑。请确认无误后再发布。', '发布确认必须明确说明不可编辑范围。');
requireText(viewSource, 'publishQuestionnaire as publishQuestionnaireRecord', '教师端发布必须调用受控发布方法。');
requireText(viewSource, '>邀请家长填写</PrimaryButton>', '收集中的家长问卷必须将邀请填写作为主操作。');
requireText(listActionsSource, '>查看采集</h4>', '两类问卷的查看操作必须归入统一的“查看采集”分组。');
requireText(listActionsSource, '>任务管理</h4>', '两类问卷的生命周期操作必须归入统一的“任务管理”分组。');
requireText(listActionsSource, 'requestCloseRecord(activeListActionRecord)', '两类收集中问卷必须从同一任务管理位置发起结束确认。');
forbidText(listActionsSource, "getQuestionnaireRespondentRole(activeListActionRecord) !== 'guardian' ? 'col-span-2'", '复制和结束操作不得因填写人不同而改变位置。');
requireText(viewSource, 'title="确认结束收集？"', '结束收集必须使用明确的二次确认。');
requireText(viewSource, '结束后将停止继续填写；若仍有未完成内容，可以重新开放。', '结束确认必须说明影响和可恢复条件。');
requireText(viewSource, 'tone="danger"', '结束收集确认必须使用危险操作语义。');
requireText(confirmSheetSource, "tone?: 'primary' | 'danger';", '公共确认浮层必须支持危险操作样式。');
requireText(viewSource, '<MobileQrInviteSheet', '教师端必须通过公共二维码邀请浮层展示邀请。');
requireText(confirmSheetSource, '<MobileBottomSheet', '发布确认必须复用带对话框语义的公共底部浮层。');
requireText(qrInviteSheetSource, 'QRCode.toDataURL', '邀请浮层必须生成可扫码的真实二维码。');
requireText(qrInviteSheetSource, '保存二维码', '邀请浮层必须支持保存二维码。');

console.log('Questionnaire management assertions passed');
