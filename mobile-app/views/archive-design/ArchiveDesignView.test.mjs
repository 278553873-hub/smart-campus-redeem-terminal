import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./ArchiveDesignView.tsx', import.meta.url), 'utf8');
const studentViewSource = fs.readFileSync(new URL('./StudentArchiveView.tsx', import.meta.url), 'utf8');
const archiveFormRendererSource = fs.readFileSync(new URL('./ArchiveFormRenderer.tsx', import.meta.url), 'utf8');
const storeSource = fs.readFileSync(new URL('../../../shared/studentArchiveStore.ts', import.meta.url), 'utf8');
const dashboardSource = fs.readFileSync(new URL('../DashboardView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('../MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');
const primitivesSource = fs.readFileSync(new URL('./archivePagePrimitives.tsx', import.meta.url), 'utf8');
const floatingCreateSource = fs.readFileSync(new URL('../../components/ui/MobileFloatingCreateButton.tsx', import.meta.url), 'utf8');
const accessSource = fs.readFileSync(new URL('../../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');
const formBuilderSource = fs.readFileSync(new URL('../../components/form-builder/FormBuilder.tsx', import.meta.url), 'utf8');
const formDefinitionSource = fs.readFileSync(new URL('../../../shared/formDefinition.ts', import.meta.url), 'utf8');

const requireText = (source, text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

const forbidText = (source, text, message) => {
  if (source.includes(text)) throw new Error(message);
};

requireText(meSource, "title: '档案设计'", '教师手机端更多工具缺少档案设计入口。');
requireText(accessSource, 'administrator:', '学校管理员必须具备独立空间角色。');
requireText(accessSource, 'leader:', '学校领导必须具备独立空间角色。');
requireText(accessSource, "'archiveDesign'", '档案设计入口必须由学校空间角色策略控制。');
requireText(appSource, "'archive_design'", '教师端导航必须注册档案设计页面。');
const plainBackgroundList = appSource.match(/const PLAIN_BACKGROUND_VIEWS: ViewState\[\] = \[([^\]]+)\]/)?.[1] ?? '';
requireText(plainBackgroundList, "'archive_design'", '档案设计应使用屏幕级纯色背景。');
requireText(primitivesSource, "export const pageBackground = 'bg-transparent'", '档案设计页面容器应保持透明，由屏幕级背景统一提供底色。');
requireText(primitivesSource, 'justify-between bg-white/38 pl-4 [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))] backdrop-blur-md', '档案设计标题栏应使用轻薄玻璃并避让微信胶囊安全区。');
forbidText(primitivesSource, 'border-b border-white/70', '档案设计顶部标题栏不应保留分割线，应依靠毛玻璃与内容自然分层。');
forbidText(primitivesSource, 'slate-', '档案设计基础组件不应残留旧灰色系。');
requireText(primitivesSource, 'focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]', '档案输入框应使用轻量输入焦点环。');
forbidText(primitivesSource, 'focus:ring-4', '档案输入框不应使用4像素粗焦点环。');
requireText(formBuilderSource, 'focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]', '共享表单输入框应使用轻量输入焦点环。');
forbidText(formBuilderSource, 'focus:ring-4', '共享表单输入框不应使用4像素粗焦点环。');
forbidText(viewSource, 'slate-', '档案设计页面不应残留旧灰色系。');
forbidText(studentViewSource, 'slate-', '学生成长档案页面不应残留旧灰色系。');
for (const legacyColor of ['amber-', 'emerald-', 'cyan-']) {
  forbidText(viewSource, legacyColor, '档案设计状态色应统一改用教师手机端语义令牌：' + legacyColor);
  forbidText(studentViewSource, legacyColor, '学生成长档案状态色应统一改用教师手机端语义令牌：' + legacyColor);
}
requireText(appSource, "'student_archive'", '教师端导航必须注册学生成长档案页面。');
requireText(appSource, '<ArchiveDesignView', '教师端必须渲染档案设计业务页面。');
requireText(appSource, '<StudentArchiveView', '教师端必须渲染学生成长档案业务页面。');
requireText(dashboardSource, '学生成长档案', '学生详情必须提供学生成长档案入口。');

for (const required of [
  '校本档案',
  '新建档案',
  '完全新建',
  '空白档案',
  '从模板创建',
  '模板预览',
  '使用此模板',
  '适用年级',
  '高一',
  '高三',
  '启用档案',
  '禁用档案',
]) {
  requireText(viewSource, required, `档案设计流程缺少：${required}`);
}

requireText(viewSource, 'import MobileFloatingCreateButton', '档案设计必须复用通用悬浮创建组件。');
requireText(viewSource, '<MobileFloatingCreateButton label="新建档案" onClick={() => setPageMode(\'template-create\')} />', '档案设计必须从右下角悬浮入口进入新建方式选择。');
requireText(viewSource, 'pb-[calc(var(--tm-size-floating-action)+var(--tm-space-5)+var(--tm-space-5)+env(safe-area-inset-bottom))]', '档案设计列表必须为悬浮创建按钮和底部安全区预留空间。');
requireText(viewSource, '>暂无校本档案</div>', '档案设计空状态必须保持简洁。');
forbidText(viewSource, '点击上方“新建档案”开始', '档案设计空状态不得保留失效的入口位置说明。');
forbidText(viewSource, 'className={`${primaryButton} mb-6 w-full`}', '档案设计首页不得继续使用全宽新建按钮。');
requireText(floatingCreateSource, 'bg-[var(--tm-brand-primary)]', '通用悬浮创建按钮必须使用教师端品牌令牌。');
requireText(floatingCreateSource, 'shadow-[var(--tm-shadow-floating)]', '通用悬浮创建按钮必须使用教师端悬浮阴影令牌。');

for (const required of ['使用分组', '添加分组', '编辑分组', '分组排序', '添加{addButtonLabel ?? itemLabel}']) {
  requireText(formBuilderSource, required, `共享表单构建器缺少：${required}`);
}
forbidText(formBuilderSource, '默认分组', '开启分组后不应自动创建或展示默认分组。');
forbidText(formBuilderSource, '{sections.length}组', '分组配置区不应展示无助于操作的分组数量。');
requireText(formBuilderSource, 'fields.map(field => ({ ...field, sectionId: nextSection.id }))', '创建首个分组后必须将已有字段自动归入该组。');
requireText(formBuilderSource, '<GripVertical', '每个字段前必须提供拖动排序标识。');
requireText(formBuilderSource, 'onDragEnd={reorderGroupedFields}', '分组模式下字段拖动必须支持写回跨组顺序。');
requireText(formBuilderSource, 'sectionId: targetSectionId', '字段拖到其他分组后必须更新所属分组。');
requireText(formBuilderSource, 'fieldNumberById.get(field.id)', '分组模式下字段序号必须按整份表单连续计算。');
requireText(archiveFormRendererSource, 'fieldNumberById.get(field.id)', '档案填写与预览时字段序号必须跨分组连续计算。');
requireText(formBuilderSource, 'onDragEnd={reorderSections}', '分组排序必须通过独立拖动列表完成。');
requireText(formBuilderSource, 'setActiveSectionMenuId(section.id)', '分组编辑、排序和删除必须收进更多菜单。');
requireText(formBuilderSource, 'label={`分组更多操作：${section.label}`}', '分组更多按钮必须提供明确的无障碍名称。');
forbidText(formBuilderSource, '所属分组<select', '字段更多操作不应继续提供切换分组。');
requireText(formBuilderSource, 'label={`${itemLabel}更多设置`}', '字段编辑态必须通过更多按钮渐进披露设置。');
requireText(formBuilderSource, 'const copyField =', '字段更多菜单必须支持复制。');
requireText(formBuilderSource, "setDeleteTarget({ type: 'field', id: activeField.id", '字段更多菜单删除后必须进入二次确认。');
requireText(formBuilderSource, 'fieldNumber={index + 1}', '字段序号必须单独显示在最左侧。');
requireText(formBuilderSource, 'renderFieldPreview(field, choice, rating, usesSubFields)', '字段列表态必须展示真实填写控件预览。');
requireText(formBuilderSource, 'const toggleFieldEditor =', '点击字段内容区必须统一控制进入和退出编辑态。');
requireText(formBuilderSource, "document.addEventListener('click', closeFieldEditor)", '点击当前字段之外的区域必须退出编辑态。');
requireText(formBuilderSource, "const listenerFrame = window.requestAnimationFrame", '外部点击监听不得吞掉进入字段编辑态的首次点击。');
requireText(formBuilderSource, '添加{addButtonLabel ?? itemLabel}到本组', '组内添加动作必须明确当前分组语境。');
requireText(formBuilderSource, '<FolderPlus', '添加分组必须与添加字段使用不同图标。');
requireText(formBuilderSource, 'border-0 border-b bg-transparent', '字段名称输入框只应保留下边框。');
forbidText(formBuilderSource, '<ChevronUp', '字段编辑态不应展示收起箭头。');
forbidText(formBuilderSource, 'label="上移分组"', '编辑分组不应继续展示上移按钮。');
forbidText(formBuilderSource, 'label="下移分组"', '编辑分组不应继续展示下移按钮。');
requireText(formBuilderSource, "onDragStart={() => setExpandedFieldId('')}", '开始拖动时必须收起展开字段，避免大卡片影响落位。');
forbidText(formBuilderSource, 'label={`上移${itemLabel}`}', '字段展开区不应保留上移操作。');
forbidText(formBuilderSource, 'label={`下移${itemLabel}`}', '字段展开区不应保留下移操作。');
requireText(viewSource, '<FormBuilder', '档案设计必须接入共享表单构建器。');
requireText(formDefinitionSource, "FormLayoutMode = 'flat' | 'grouped'", '中台表单定义必须区分平铺和分组布局。');
for (const fieldType of ["label: '日期'", "label: '数字'"]) {
  requireText(viewSource, fieldType, `档案字段类型缺少：${fieldType}`);
}
requireText(viewSource, 'ARCHIVE_SYSTEM_FIELD_OPTIONS', '档案设计必须提供自动带入字段选择。');
requireText(viewSource, '已选择 {templateDraft.systemFields.length} 项', '自动带入入口必须展示已选数量。');
requireText(storeSource, "ARCHIVE_SYSTEM_FIELD_OPTIONS.filter(option => option.key !== 'grade')", '自动带入候选必须合并年级和班级语义，只保留班级。');
requireText(viewSource, 'ARCHIVE_SELECTABLE_SYSTEM_FIELD_OPTIONS.map', '自动带入浮层必须使用不含年级的候选列表。');

requireText(storeSource, "label: ''", '新增档案字段必须保持空值并使用提示文字。');
requireText(formBuilderSource, 'placeholder="请输入选项名称"', '新增普通选项必须使用提示文字而非默认名称。');
requireText(formBuilderSource, "options: [...field.options, '']", '新增普通选项的真实值必须为空。');
requireText(formBuilderSource, 'pendingOptionFocusId.current', '新增普通选项后必须自动聚焦输入框。');

requireText(viewSource, 'allowCustomAnswer', '档案单选和多选必须开放可填写项。');
requireText(formBuilderSource, '添加“其他”选项', '档案选择字段必须在选项编辑区提供添加“其他”选项。');
if (formBuilderSource.includes('addCustomOption(activeField)')) {
  throw new Error('档案字段设置中不应保留添加“其他”选项操作。');
}
requireText(viewSource, 'customAnswerOptions: field.customAnswerOptions', '档案编辑器必须保存可填写项配置。');
requireText(storeSource, 'export interface ArchiveChoiceAnswer', '档案选择答案必须使用结构化数据。');
requireText(storeSource, 'selectedOptions: string[]', '档案选择答案必须保存已选项。');
requireText(storeSource, 'customText: Record<string, string>', '档案选择答案必须保存补充文本。');
requireText(archiveFormRendererSource, 'showCustomInput', '学生填写档案时必须仅在选中可填写项后展示文本框。');
requireText(archiveFormRendererSource, 'placeholder="请补充填写"', '档案可填写项必须提供清晰提示文字。');
requireText(studentViewSource, 'getArchiveAnswerValidationError', '确认成档前必须统一校验必填、可填写项与字段格式。');
requireText(storeSource, 'minSelections', '档案多选字段必须保存并校验选择上下限。');
requireText(archiveFormRendererSource, 'settings.dateFormat', '档案日期字段必须按配置渲染。');
requireText(archiveFormRendererSource, 'settings.numberFormat', '档案数字字段必须按配置渲染。');

requireText(viewSource, '<ArchiveFormRenderer', '档案详情必须使用真实表单预览。');
requireText(studentViewSource, '<ArchiveFormRenderer', '学生档案填写页必须复用档案表单渲染器。');
requireText(viewSource, 'mode="preview"', '档案详情必须使用不可填写的表单预览模式。');
requireText(viewSource, '手动填写', '档案详情必须明确区分手动填写与成长数据。');
requireText(archiveFormRendererSource, "mode: 'preview'", '档案表单渲染器必须区分预览和填写模式。');
requireText(archiveFormRendererSource, "previewMode ? `${fields.length}题`", '预览分组必须展示题目数量，不展示无意义的完成进度。');
forbidText(viewSource, 'previewAnswers', '档案预览不应维护临时答案状态。');
forbidText(viewSource, 'onAnswersChange={setPreviewAnswers}', '档案预览不应接收答案写入能力。');
forbidText(viewSource, 'readOnly={readOnly}', '档案详情不应继续使用禁用编辑器模拟预览。');

forbidText(viewSource, "updateWorkspace(result.workspace, '已创建空白档案')", '进入空白档案编辑页不得自动保存草稿。');
forbidText(viewSource, "updateWorkspace(result.workspace, '已创建校本档案')", '使用推荐模板进入编辑页不得自动保存草稿。');
requireText(storeSource, ': [...workspace.templates, savedTemplate]', '显式保存时必须支持写入临时新档案。');
requireText(studentViewSource, 'const [transientDraft, setTransientDraft]', '学生新建档案必须先保持临时填写态。');
forbidText(studentViewSource, 'updateWorkspace(result.workspace);', '选择学生档案模板时不得自动保存草稿。');
requireText(studentViewSource, 'setTransientDraft(null);', '退出或保存后必须清理临时草稿。');

for (const required of [
  '选择档案',
  '待继续',
  '保存草稿',
  '确认成档',
  '档案详情',
]) {
  requireText(studentViewSource, required, `学生档案流程缺少：${required}`);
}
requireText(studentViewSource, 'aria-label="新建档案"', '学生档案首页标题栏必须提供可识别的新建入口。');
requireText(studentViewSource, 'className={iconButton}', '学生档案首页新建入口必须复用44像素图标按钮。');
requireText(studentViewSource, 'action={(', '学生档案首页必须通过标题栏承载低频新建操作。');
requireText(studentViewSource, 'drafts.length === 0', '完全空状态才应突出新建档案主按钮。');
forbidText(studentViewSource, 'className={`${primaryButton} w-full`}', '学生档案首页不应再用全宽新建按钮抢占首屏。');
forbidText(studentViewSource, 'action={<StatusPill className="bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]">草稿</StatusPill>}', '学生档案填写页标题栏不应重复展示草稿标签。');
requireText(archiveFormRendererSource, 'open={!previewMode || sectionIndex === 0}', '学生档案填写时必须默认展开全部分组，预览仍默认展开首个分组。');
forbidText(studentViewSource, '>历史档案</h2>', '学生成长档案首页不应重复展示历史档案标题。');
forbidText(studentViewSource, '暂无历史档案', '学生成长档案空状态不应重复强调历史属性。');
requireText(studentViewSource, '暂无档案', '学生成长档案空状态必须使用简洁文案。');
forbidText(studentViewSource, '>已成档</StatusPill>', '学生档案详情标题栏不应重复展示已成档标签。');

for (const required of [
  "export type ArchiveTemplateStatus = 'recommended' | 'draft' | 'published' | 'disabled'",
  'export interface ArchiveDraft',
  'templateVersion: number',
  "status: 'archived' | 'revision-draft'",
  'revisionOf?: string',
  'correctionReason?: string',
  'ArchiveAuditEvent',
  'setArchiveTemplateStatus',
  'getEnabledTemplatesForGrade',
  'createStudentArchiveDraft',
  'saveStudentArchiveDraft',
  'deleteArchiveTemplate',
  'templateSnapshot: ArchiveTemplateSnapshot',
  'deletedAt?: string',
]) {
  requireText(storeSource, required, `档案数据层缺少：${required}`);
}

for (const template of ['一年级初始成长档案', '学期成长档案', '毕业与转衔档案']) {
  requireText(storeSource, template, `推荐模板缺少：${template}`);
}

for (const field of ['优势特点', '兴趣倾向', '学习习惯', '情绪状态', '同伴交往', '当前关注', '有效支持方式', '阶段目标']) {
  requireText(storeSource, field, `稳定核心字段缺少：${field}`);
}

requireText(storeSource, 'createBlankArchiveTemplate', '新建档案必须支持从空白草稿开始。');
requireText(viewSource, 'previewRecommendedTemplate', '从模板创建必须先进入模板预览。');
requireText(viewSource, '请至少新增一个档案分组', '空白档案启用前必须校验档案分组。');
requireText(viewSource, '请至少添加一项档案内容', '空白档案启用前必须校验档案内容。');
requireText(storeSource, "layoutMode: 'flat'", '空白档案默认应关闭分组。');
requireText(storeSource, "layoutMode: 'grouped'", '推荐档案模板应保留分组结构。');
requireText(storeSource, "template.status === 'published'", '教师新建档案时只能选择已启用模板。');
requireText(storeSource, 'workspace.drafts.find', '同一模板已有草稿时必须继续原草稿。');
requireText(studentViewSource, 'workspace.drafts', '禁用后已有草稿必须仍可进入填写。');
requireText(storeSource, 'appendArchiveViewAudit', '完整档案查看必须写入审计记录。');
requireText(storeSource, "template.status === 'draft' || template.status === 'disabled'", '只允许删除草稿或已禁用档案设计。');
requireText(storeSource, 'templateSnapshot: createTemplateSnapshot(template)', '新建学生档案时必须保存不可变结构快照。');
requireText(storeSource, 'templateSnapshot: cloneTemplateSnapshot(draft.templateSnapshot)', '确认成档时必须继承草稿的结构快照。');
requireText(studentViewSource, 'activeDraft?.templateSnapshot', '学生草稿必须使用自身结构快照继续填写。');
requireText(studentViewSource, 'activeSnapshot.templateSnapshot', '历史档案必须使用自身结构快照展示。');
requireText(studentViewSource, '保存并带入', '缺失的学生信息必须支持在档案填写页补充。');
requireText(studentViewSource, 'onUpdateStudent', '档案内补充信息必须同步学生资料。');
requireText(studentViewSource, 'missingSystemField', '确认成档前必须校验自动带入字段。');
requireText(studentViewSource, 'activeSnapshot.systemValues', '历史档案必须展示成档时的学生信息快照。');
requireText(storeSource, 'systemValues: { ...systemValues }', '确认成档必须保存自动带入字段值快照。');
requireText(viewSource, 'ARCHIVE_GROWTH_FIELD_GROUPS', '档案设计必须提供平台预置的具体成长字段。');
for (const required of ['addButtonLabel="内容"', 'typePickerTitle="添加内容"', 'typePickerPrimaryLabel="手动填写"', "typePickerSecondaryTab={{ label: '成长数据'"]) {
  requireText(viewSource, required, `档案添加内容入口缺少：${required}`);
}
for (const field of ['测量日期', '身高', '体重', '身体质量指数', '目标清单', '共同约定']) {
  requireText(storeSource, field, `成长数据选择缺少具体字段：${field}`);
}
requireText(viewSource, 'templateDraft.growthFields.length', '档案页必须按具体成长字段统计已选数量。');
requireText(viewSource, '成档必需', '具体成长字段必须支持设置为成档必需。');
requireText(storeSource, 'buildArchiveGrowthModuleSnapshots', '档案必须从学生成长数据构建字段快照。');
requireText(studentViewSource, 'currentGrowthSnapshots', '档案草稿必须读取当前成长记录。');
requireText(studentViewSource, 'missingGrowthField', '确认成档前必须逐字段校验必需成长数据。');
requireText(storeSource, 'growthSnapshots: cloneGrowthSnapshots(growthSnapshots)', '确认成档必须冻结成长记录快照。');
requireText(studentViewSource, 'activeSnapshot.growthSnapshots', '历史档案必须读取冻结后的成长记录。');
requireText(viewSource, "isCreating ? '新建档案'", '新建档案编辑器顶部必须显示“新建档案”。');
requireText(viewSource, 'action={headerAction}', '档案编辑页必须按状态提供右上角操作，不固定展示草稿标签。');
requireText(viewSource, '学生已有草稿和已成档记录不受影响', '删除已禁用档案前必须说明学生档案不受影响。');
requireText(viewSource, 'showDeleteConfirm', '删除档案设计必须二次确认。');
requireText(viewSource, 'editingDisabledTemplate', '已禁用档案必须提供独立的查看态和编辑态。');
requireText(viewSource, '保存修改', '已禁用档案编辑后必须支持保存修改且保持禁用。');
requireText(viewSource, '编辑档案', '已禁用档案详情必须提供编辑入口。');
requireText(viewSource, "status: enable ? 'published' : 'disabled'", '保存已禁用档案修改时不能错误转为普通草稿。');
forbidText(viewSource, 'V{template.version}', '档案设计列表不应向老师展示内部版本号。');
forbidText(studentViewSource, 'V{activeSnapshot.templateVersion}', '学生历史档案不应向老师展示内部版本号。');

forbidText(viewSource, '>推荐模板</h2>', '档案设计首页不应重复展示推荐模板。');
forbidText(viewSource, '建档任务', '档案设计不应包含建档任务。');
forbidText(viewSource, '发起档案任务', '档案设计不应包含发起任务能力。');
forbidText(viewSource, '填写责任人', '档案设计不应配置填写责任人。');
forbidText(viewSource, '提醒设置', '档案设计不应包含任务提醒。');
forbidText(viewSource, '任务进度', '档案设计不应展示任务进度。');
forbidText(meSource, '待完成建档', '教师“我的”不应出现建档任务待办。');
forbidText(appSource, 'pendingArchiveTaskCount', '底部导航不应统计建档任务角标。');
forbidText(storeSource, 'export interface ArchiveTask', '档案数据层不应保留建档任务模型。');
forbidText(storeSource, 'export interface ArchiveClassAssignment', '档案数据层不应保留任务责任人模型。');
forbidText(storeSource, 'export interface ArchiveReminderPolicy', '档案数据层不应保留任务提醒模型。');
forbidText(viewSource, '档案完成 {overallRate}%', '档案设计顶部不应汇总完成率。');
forbidText(viewSource, '名学生已成档', '档案设计顶部不应统计学生成档总数。');
forbidText(viewSource, 'placeholder="搜索学生"', '档案设计不应提供学生档案查询。');
forbidText(viewSource, '档案阶段', '新建档案不应包含档案阶段配置。');
forbidText(viewSource, '参与来源', '新建档案不应包含参与来源配置。');
forbidText(viewSource, '系统信息', '新建档案不应展示系统信息说明。');
forbidText(viewSource, '用于成长对比', 'MVP 字段编辑不应包含成长对比配置。');
forbidText(viewSource, '简短文字', '字段类型不应区分简短文字。');
forbidText(viewSource, '多行文字', '字段类型不应区分多行文字。');
forbidText(viewSource, '分组说明', '分组不应配置分组说明。');
forbidText(viewSource, '调整顺序', '顺序调整应在列表上直接操作，不出现在弹窗中。');
forbidText(studentViewSource, '上期：', 'MVP 填写页不应展示上期对比内容。');
requireText(archiveFormRendererSource, "role={field.type === 'single-select' ? 'radio' : 'checkbox'}", '档案选项必须使用可识别的单选或多选语义。');
requireText(archiveFormRendererSource, "field.type === 'single-select' ? 'rounded-full'", '单选项必须使用圆形选择符号。');
forbidText(storeSource, "group: 'core' | 'stage'", '字段模型不应保留成长对比分组。');
requireText(storeSource, "export type ArchiveFieldType = 'text' | 'single-select' | 'multiple-select' | 'date' | 'number'", '字段类型应支持文字、单选、多选、日期、数字。');
forbidText(storeSource, 'export type ArchiveSource', '档案数据层不应保留参与来源模型。');
forbidText(storeSource, 'archiveStageMeta', '档案数据层不应保留档案阶段模型。');
forbidText(storeSource, 'StudentBaseArchive', '档案数据层不应保留学生底档模型。');

console.log('Archive design lightweight flow assertions passed');
