import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./ArchiveDesignView.tsx', import.meta.url), 'utf8');
const studentViewSource = fs.readFileSync(new URL('./StudentArchiveView.tsx', import.meta.url), 'utf8');
const classBatchViewSource = fs.readFileSync(new URL('./ClassArchiveBatchView.tsx', import.meta.url), 'utf8');
const archiveFormRendererSource = fs.readFileSync(new URL('./ArchiveFormRenderer.tsx', import.meta.url), 'utf8');
const archiveGrowthRendererSource = fs.readFileSync(new URL('./ArchiveGrowthDataRenderer.tsx', import.meta.url), 'utf8');
const storeSource = fs.readFileSync(new URL('../../../shared/studentArchiveStore.ts', import.meta.url), 'utf8');
const dashboardSource = fs.readFileSync(new URL('../DashboardView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('../MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');
const primitivesSource = fs.readFileSync(new URL('./archivePagePrimitives.tsx', import.meta.url), 'utf8');
const floatingCreateSource = fs.readFileSync(new URL('../../components/ui/MobileFloatingCreateButton.tsx', import.meta.url), 'utf8');
const growthFieldPickerSource = fs.readFileSync(new URL('../../components/growth/GrowthFieldCategoryPicker.tsx', import.meta.url), 'utf8');
const accessSource = fs.readFileSync(new URL('../../domain/teacherSpaceAccess.ts', import.meta.url), 'utf8');
const formBuilderSource = fs.readFileSync(new URL('../../components/form-builder/FormBuilder.tsx', import.meta.url), 'utf8');
const formOutlineSorterSource = fs.readFileSync(new URL('../../components/form-builder/FormOutlineSorter.tsx', import.meta.url), 'utf8');
const mobileDocumentTitleInputSource = fs.readFileSync(new URL('../../components/ui/MobileDocumentTitleInput.tsx', import.meta.url), 'utf8');
const formDefinitionSource = fs.readFileSync(new URL('../../../shared/formDefinition.ts', import.meta.url), 'utf8');
const growthCatalogSource = fs.readFileSync(new URL('../../../shared/studentGrowthFieldCatalog.ts', import.meta.url), 'utf8');
const classListSource = fs.readFileSync(new URL('../ClassListView.tsx', import.meta.url), 'utf8');
const archiveAppearanceSource = fs.readFileSync(new URL('./archiveAppearance.ts', import.meta.url), 'utf8');
const questionnaireThemeSource = fs.readFileSync(new URL('../../../shared/questionnaireThemeTokens.ts', import.meta.url), 'utf8');
const assetsSource = fs.readFileSync(new URL('../../assets/images.ts', import.meta.url), 'utf8');

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
requireText(primitivesSource, 'justify-between bg-[var(--tm-bg-surface-glass)] pl-4 [padding-right:max(var(--tm-space-4),var(--mini-program-capsule-right-inset,0px))] backdrop-blur-md', '档案设计标题栏应使用表面玻璃令牌并避让微信胶囊安全区。');
forbidText(primitivesSource, 'border-b border-white/70', '档案设计顶部标题栏不应保留分割线，应依靠毛玻璃与内容自然分层。');
forbidText(primitivesSource, 'slate-', '档案设计基础组件不应残留旧灰色系。');
requireText(primitivesSource, "export const sectionSurface = 'rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)] [box-shadow:var(--tm-shadow-card)]'", '档案普通卡片必须使用无线条表面分层。');
requireText(primitivesSource, 'border border-[var(--tm-border-subtle)] bg-[var(--tm-bg-surface)]', '档案次按钮必须使用浅边界令牌。');
requireText(primitivesSource, '[box-shadow:var(--tm-shadow-control)]', '档案次按钮必须使用控件阴影令牌。');
requireText(primitivesSource, "export const readonlyFieldClass = 'w-full rounded-[var(--tm-radius-control)] border border-[var(--tm-input-readonly-border)] bg-[var(--tm-input-readonly-bg)]", '档案只读字段必须使用只读输入令牌。');
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
  '新建档案',
  '完全新建',
  '使用模板',
  '模板预览',
  '使用此模板',
  '适用年级',
  '高一',
  '高三',
  '启用档案',
  '停用档案',
]) {
  requireText(viewSource, required, `档案设计流程缺少：${required}`);
}

requireText(viewSource, 'import MobileFloatingCreateButton', '档案设计必须复用通用悬浮创建组件。');
requireText(viewSource, '<MobileFloatingCreateButton label="新建档案" emphasis="raised" onClick={openCreateFlow} />', '档案设计必须从右下角强化悬浮入口进入新建档案流程。');
requireText(viewSource, 'pb-[calc(var(--tm-size-floating-action)+var(--tm-space-5)+var(--tm-space-5)+env(safe-area-inset-bottom))]', '档案设计列表必须为悬浮创建按钮和底部安全区预留空间。');
requireText(viewSource, 'const listHeaderImage = getArchiveHeaderImage(template.appearance);', '档案列表卡片必须展示档案头图。');
requireText(viewSource, 'className="block aspect-[16/7] w-full object-cover"', '档案列表头图必须使用稳定比例并铺满卡片。');
requireText(viewSource, 'line-clamp-2 min-h-12 text-[length:var(--tm-font-size-card-title)] font-bold leading-6', '档案列表名称必须使用清晰的卡片标题层级并预留两行高度。');
requireText(viewSource, '{formatTemplateGradeScope(template.gradeScopes)}', '档案列表卡片必须展示适用年级内容。');
forbidText(viewSource, '适用年级：{formatTemplateGradeScope(template.gradeScopes)}', '档案列表卡片不应重复展示适用年级标签。');
requireText(viewSource, '<StatusPill className={meta.className}>{meta.label}</StatusPill>', '档案列表卡片必须展示状态标签。');
requireText(viewSource, 'className="grid grid-cols-2 gap-3"', '档案设计列表必须使用一行两张的紧凑卡片布局。');
forbidText(viewSource, 'className={`${sectionSurface} flex min-h-[76px]', '档案列表不应继续使用图标式横向摘要卡片。');
requireText(viewSource, 'title="暂无档案"', '档案设计空状态必须保持简洁。');
requireText(viewSource, 'ASSETS.DEFAULT_STATE.WORRIED_CLIPBOARD', '档案设计无内容时必须使用担忧清单缺省图。');
requireText(assetsSource, 'default-states/default-state-giraffe-worried-clipboard-3d-color-v1.png', '彩色长颈鹿缺省图必须统一存放在教师手机端专用资源目录。');
forbidText(viewSource, '>校本档案<', '档案设计首页不应展示校本档案栏目标题。');
forbidText(viewSource, '{school.length}个', '档案设计首页不应展示档案数量统计。');
forbidText(viewSource, '点击上方“新建档案”开始', '档案设计空状态不得保留失效的入口位置说明。');
forbidText(viewSource, 'className={`${primaryButton} mb-6 w-full`}', '档案设计首页不得继续使用全宽新建按钮。');
requireText(floatingCreateSource, 'bg-[var(--tm-brand-primary)]', '通用悬浮创建按钮必须使用教师端品牌令牌。');
requireText(floatingCreateSource, "emphasis?: 'default' | 'raised'", '通用悬浮创建按钮必须提供可复用的强化阴影变体。');
requireText(floatingCreateSource, 'var(--tm-shadow-floating-raised)', '强化悬浮创建按钮必须使用教师端阴影令牌。');
requireText(viewSource, '<MobileBottomSheet open={showCreateSheet} title="新建档案"', '新建档案必须使用公共底部抽屉。');
requireText(viewSource, 'snap-x snap-mandatory overflow-x-auto', '推荐模板必须支持横向滑动。');
requireText(viewSource, '>从模版新建</h3>', '推荐模板区标题必须使用已确认文案。');
requireText(viewSource, '-mx-[var(--tm-space-4)] mt-5 bg-[var(--tm-bg-surface)]', '推荐模板区域必须使用白色表面背景。');
requireText(viewSource, 'min-h-[72px] w-full items-center gap-3 rounded-[var(--tm-radius-card)] bg-[var(--tm-bg-surface)]', '完全新建必须使用横向白色实心卡片。');
requireText(viewSource, 'w-[220px] snap-start overflow-hidden rounded-[var(--tm-radius-card)]', '模板卡片必须保持稳定的横向卡片尺寸。');
requireText(viewSource, '[box-shadow:var(--tm-shadow-card-on-white)]', '纯白承载面上的卡片必须使用中性双层环境阴影。');
requireText(viewSource, 'const thumbnail = getArchiveHeaderImage(template.appearance)', '模板卡片必须读取模板自身的系统头图。');
requireText(viewSource, '<img src={thumbnail} alt="" className="aspect-[16/7] w-full object-cover" />', '模板卡片必须使用全宽16:7头图缩略图。');
forbidText(viewSource, '<Files className=', '带头图的模板卡片不应继续展示通用文件图标。');
forbidText(viewSource, 'ArchiveTemplateThumbnail', '模板卡片不得保留内容缩略预览。');
forbidText(viewSource, 'h-[var(--tm-space-1)] bg-[var(--tm-brand-primary)]', '模板卡片不得保留顶部品牌色条。');

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
requireText(archiveFormRendererSource, 'itemNumber.get(key)', '档案填写与预览时普通字段和成长字段的序号必须跨分组连续计算。');
requireText(formBuilderSource, 'onDragEnd={reorderSections}', '分组排序必须通过独立拖动列表完成。');
requireText(formBuilderSource, 'setActiveSectionMenuId(section.id)', '分组编辑、排序和删除必须收进更多菜单。');
requireText(formBuilderSource, 'label={`分组更多操作：${section.label}`}', '分组更多按钮必须提供明确的无障碍名称。');
forbidText(formBuilderSource, '所属分组<select', '字段更多操作不应继续提供切换分组。');
requireText(formBuilderSource, 'label={`${itemLabel}更多设置`}', '字段编辑态必须通过更多按钮渐进披露设置。');
requireText(formBuilderSource, 'const copyField =', '字段更多菜单必须支持复制。');
requireText(formBuilderSource, "setDeleteTarget({ type: 'field', id: activeField.id", '字段更多菜单删除后必须进入二次确认。');
requireText(formBuilderSource, 'fieldNumber={index + 1}', '字段序号必须单独显示在最左侧。');
requireText(formBuilderSource, 'renderFieldPreview(field, choice, rating, usesSubFields)', '字段列表态必须展示真实填写控件预览。');
requireText(formBuilderSource, "const readonlyPreviewSurfaceClass = 'rounded-[var(--tm-radius-control)] border border-[var(--tm-input-readonly-border)] bg-[var(--tm-input-readonly-bg)]", '共享表单的文字预览必须使用只读输入令牌。');
forbidText(formBuilderSource, 'min-h-[72px] rounded-[var(--tm-radius-control)] border border-[var(--tm-border-control)]', '文字字段预览不得使用较深的交互控件边框。');
requireText(formBuilderSource, 'const toggleFieldEditor =', '点击字段内容区必须统一控制进入和退出编辑态。');
requireText(formBuilderSource, "document.addEventListener('click', closeFieldEditor)", '点击当前字段之外的区域必须退出编辑态。');
requireText(formBuilderSource, "const listenerFrame = window.requestAnimationFrame", '外部点击监听不得吞掉进入字段编辑态的首次点击。');
requireText(formBuilderSource, '添加{addButtonLabel ?? itemLabel}到本组', '组内添加动作必须明确当前分组语境。');
requireText(formBuilderSource, '<FolderPlus', '添加分组必须与添加字段使用不同图标。');
requireText(formBuilderSource, 'border-0 border-b bg-transparent', '字段名称输入框只应保留下边框。');
forbidText(formBuilderSource, '<ChevronUp', '字段编辑态不应展示收起箭头。');
forbidText(formBuilderSource, '<TypeIcon className="h-3.5 w-3.5 shrink-0" />{meta?.label ?? field.type}', '所有字段编辑态都不应重复展示题型图标和题型名称。');
requireText(formBuilderSource, ') : expanded && !readOnly ? null : <button', '字段展开后必须移除题型顶部行且不保留空白占位。');
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
forbidText(viewSource, '自动带入', '档案设计不应让老师配置学生身份信息。');
forbidText(viewSource, 'showSystemFieldPicker', '档案设计不应保留学生身份字段选择浮层。');

requireText(storeSource, 'label: archiveFieldDefaultLabels[type]', '新增档案字段必须使用题型名称作为真实默认值。');
requireText(storeSource, "? ['选项1', '选项2'] : []", '新增单选和多选字段必须默认生成两个可用选项。');
requireText(formBuilderSource, 'smartDefaultContent?: boolean', '共享表单构建器必须将智能默认值收敛为可选能力。');
requireText(viewSource, 'smartDefaultContent', '档案设计必须启用字段智能默认值。');
requireText(formBuilderSource, "placeholder={smartDefaultContent ? '请输入选项内容' : '请输入选项名称'}", '默认选项进入焦点后必须显示选项内容提示。');
requireText(formBuilderSource, "placeholder={itemLabel === '题目' ? '请输入题干' : '请输入字段名称'}", '字段名称进入焦点后必须显示字段名称提示。');
requireText(formBuilderSource, "field.label === fieldDefaultValue", '未修改的字段默认值必须在聚焦时临时让位。');
requireText(formBuilderSource, "option === optionDefaultValue", '未修改的选项默认值必须在聚焦时临时让位。');
requireText(formBuilderSource, "if (!field.label.trim() && fieldDefaultValue)", '字段名称失焦为空时必须恢复默认值。');
requireText(formBuilderSource, "if (!option.trim()) updateField", '选项失焦为空时必须恢复默认值。');
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
requireText(studentViewSource, 'getArchiveAnswerValidationError', '保存档案前必须统一校验必填、可填写项与字段格式。');
requireText(storeSource, 'minSelections', '档案多选字段必须保存并校验选择上下限。');
requireText(archiveFormRendererSource, 'settings.dateFormat', '档案日期字段必须按配置渲染。');
requireText(archiveFormRendererSource, 'settings.numberFormat', '档案数字字段必须按配置渲染。');

requireText(viewSource, '<FormBuilder', '档案详情必须使用统一内容预览。');
requireText(studentViewSource, '<ArchiveFormRenderer', '学生档案填写页必须复用档案表单渲染器。');
requireText(viewSource, 'fixedContentFieldIds={fixedGrowthFieldIds}', '档案编辑必须在统一分组内识别内容固定的成长字段。');
forbidText(viewSource, 'getLockedFieldSubtitle=', '成长字段非编辑态不应额外标注成长数据或单位。');
forbidText(viewSource, '项成长数据 ·', '档案列表和详情不应展示成长数据与手动填写统计。');
forbidText(viewSource, '>成长数据</h2>', '档案详情不应额外生成成长数据展示分组。');
forbidText(viewSource, '>手动填写</h2>', '档案详情不应额外生成手动填写展示分组。');
requireText(archiveFormRendererSource, "mode: 'preview'", '档案表单渲染器必须区分预览和填写模式。');
requireText(archiveFormRendererSource, '`${readonlyFieldClass} min-h-[92px]', '档案文字字段预览必须使用只读字段样式。');
requireText(archiveFormRendererSource, '`${readonlyFieldClass} min-h-12', '档案历史内容必须使用只读字段样式。');
forbidText(archiveFormRendererSource, '`${inputClass} min-h-[92px] py-3 text-[var(--tm-text-tertiary)]`', '档案文字预览不得复用可编辑输入框样式。');
requireText(archiveFormRendererSource, "previewMode ? `${items.length}项`", '预览分组必须展示内容数量，不展示无意义的完成进度。');
requireText(archiveFormRendererSource, 'definition.growthFields.map', '学生档案必须按实际分组合并成长字段与手动字段。');
requireText(storeSource, 'sectionId?: string', '成长字段必须保存所属档案分组。');
requireText(storeSource, 'order?: number', '档案内容必须保存跨类型排序。');
forbidText(viewSource, 'previewAnswers', '档案预览不应维护临时答案状态。');
forbidText(viewSource, 'onAnswersChange={setPreviewAnswers}', '档案预览不应接收答案写入能力。');
forbidText(viewSource, 'readOnly={readOnly}', '档案详情不应继续使用禁用编辑器模拟预览。');

forbidText(viewSource, "updateWorkspace(result.workspace, '已创建空白档案')", '进入空白档案编辑页不得自动保存草稿。');
forbidText(viewSource, "updateWorkspace(result.workspace, '已创建校本档案')", '使用推荐模板进入编辑页不得自动保存草稿。');
forbidText(viewSource, '>保存草稿</button>', '档案设计不应保留手动保存草稿按钮。');
forbidText(viewSource, '已自动保存', '自动保存不应侵入页面信息层级。');
requireText(viewSource, 'saveArchiveDesignDraft(current, templateDraft, draftOwnerKey)', '档案设计编辑记录必须按账号自动保存。');
requireText(viewSource, 'getArchiveDesignDraft(workspace, draftOwnerKey)', '新建档案前必须检查当前账号的最新草稿。');
requireText(viewSource, '>继续编辑</button>', '发现设计草稿时必须支持继续编辑。');
requireText(viewSource, '>重新创建</button>', '发现设计草稿时必须支持重新创建。');
requireText(storeSource, ': [...workspace.templates, savedTemplate]', '显式保存时必须支持写入临时新档案。');
requireText(studentViewSource, 'const [transientDraft, setTransientDraft]', '打开实时档案时必须先保持临时填写态。');
forbidText(studentViewSource, 'updateWorkspace(result.workspace);', '打开实时档案时不得自动保存草稿。');
requireText(studentViewSource, 'setTransientDraft(null);', '退出或保存后必须清理临时草稿。');
requireText(viewSource, 'aria-label="大纲"', '档案编辑器底部必须提供大纲入口。');
requireText(viewSource, 'aria-label="风格"', '档案编辑器底部必须提供风格入口。');
requireText(viewSource, 'aria-label="设置"', '档案编辑器底部必须提供设置入口。');
requireText(viewSource, 'const editorToolButton = \'flex h-11 w-11 flex-col', '档案编辑器底部工具入口必须使用图标加文案的纵向结构。');
for (const label of ['大纲', '风格', '设置']) requireText(viewSource, `<span>${label}</span>`, `档案编辑器工具入口缺少可见文案：${label}`);
requireText(viewSource, 'gap-[var(--tm-space-2)]', '档案编辑器底部五个相邻操作必须使用统一间距。');
requireText(viewSource, 'const renderEditorToolbar = () => (', '档案编辑器的新建态与编辑态必须复用同一底部工具栏。');
requireText(viewSource, "templateEditorMode === 'create' || templateEditorMode === 'edit'", '所有档案进入编辑状态后必须展示完整设计工具栏。');
requireText(viewSource, "if (templateDraft.status === 'published')", '使用中的档案完成编辑后必须保持原状态保存。');
requireText(viewSource, "if (templateDraft.status === 'disabled')", '已停用档案完成编辑后必须保持原状态保存。');
const equalEditorActionSizeCount = viewSource.match(/inline-flex h-11 w-full items-center justify-center/g)?.length ?? 0;
if (equalEditorActionSizeCount < 2) throw new Error('档案编辑器的预览和完成按钮必须使用相同宽度与高度。');
forbidText(viewSource, 'grid-cols-[44px_44px_44px_48px_minmax(56px,1fr)]', '档案编辑器底部不应继续让预览和完成按钮尺寸失衡。');
forbidText(viewSource, '${iconButton} border border-[var(--tm-border-subtle)]', '档案编辑器工具入口不应保留圆形背景、边框或阴影。');
requireText(viewSource, 'sortingMode="external"', '档案正文必须禁用内联拖动排序。');
requireText(viewSource, '<FormOutlineSorter', '档案排序必须收敛到大纲弹窗。');
requireText(formOutlineSorterSource, 'reorderGroupedOutline', '大纲必须支持分组和跨组排序。');
requireText(formOutlineSorterSource, 'sortableKeyboardCoordinates', '大纲拖动排序必须支持键盘操作。');
requireText(viewSource, '>主题风格</h3>', '外观设置必须支持主题风格。');
requireText(viewSource, '>档案头图</h3>', '外观设置必须支持系统预设头图。');
requireText(viewSource, 'style={{ backgroundColor: appearanceTheme.background }}', '主题底色必须在档案编辑画布中即时生效。');
requireText(archiveAppearanceSource, "'--tm-brand-primary': theme.accent", '档案主题必须同步覆盖主操作 Token。');
requireText(archiveAppearanceSource, "'--tm-brand-primary-soft': theme.accentSoft", '档案主题必须同步覆盖浅色交互 Token。');
requireText(viewSource, 'getArchiveThemeStyle(templateDraft.appearance)', '档案设计页必须消费完整主题 Token。');
requireText(studentViewSource, 'getArchiveThemeStyle(activeTemplate.appearance)', '学生档案填写页必须消费完整主题 Token。');
requireText(studentViewSource, 'getArchiveThemeStyle(template.appearance)', '学生档案详情页必须消费完整主题 Token。');
requireText(viewSource, "!isCreating ? '-mt-4' : ''", '系统头图必须在模板预览、档案详情和已有档案编辑态紧贴标题栏下方。');
requireText(viewSource, 'className="block h-full w-full object-cover"', '系统头图必须通过独立全宽容器铺满展示。');
forbidText(viewSource, 'w-[calc(100%+2.5rem)]', '系统头图不得依赖内容宽度计算补偿。');
forbidText(studentViewSource, 'w-[calc(100%+2.5rem)]', '学生档案头图不得依赖内容宽度计算补偿。');
forbidText(viewSource, 'style={showFillPreview ?', '主题底色不得只在预览态和详情态生效。');
requireText(viewSource, '>档案更新规则</h3>', '基础设置必须提供档案更新规则。');
requireText(viewSource, "[['once', '仅填写一次'], ['continuous', '可重复填写']]", '档案更新规则必须收敛为两种老师可理解的模式。');
requireText(storeSource, 'hasArchiveDesignDraftContent', '档案草稿必须提供统一的有效内容判断。');
requireText(viewSource, 'if (!hasArchiveDesignDraftContent(templateDraft))', '完全空白的新建档案不得自动保存草稿。');
requireText(archiveAppearanceSource, 'questionnaireHeaderImageOptions', '档案和采集必须复用同一套系统头图。');
for (const preset of ['learning', 'growth', 'sports', 'creativity']) requireText(questionnaireThemeSource, `id: '${preset}'`, `档案头图缺少系统预设：${preset}`);

for (const required of [
  '当前档案',
  '发起采集',
  '保存修改',
  '档案记录',
  '已建立',
  '待采集',
]) {
  requireText(studentViewSource, required, `学生档案流程缺少：${required}`);
}
requireText(appSource, 'onUpdateArchive={templateId =>', '当前档案的更新入口必须进入统一采集流程。');
requireText(appSource, 'initialArchiveTemplateId={questionnaireInitialArchiveTemplateId || undefined}', '从档案进入采集时必须预选当前档案。');
requireText(storeSource, 'upsertStudentArchiveCollectionAnswers', '采集提交必须合并更新学生当前档案。');
forbidText(studentViewSource, 'aria-label="新建档案"', '学生档案首页不应再提供新建入口。');
forbidText(studentViewSource, 'PageHeader title="选择档案"', '学生档案首页不应再进入模板选择页。');
requireText(studentViewSource, 'enabledTemplates.map(template =>', '学生档案首页必须直接展示已启用档案。');
requireText(studentViewSource, 'const hasArchive = Boolean(draft || latestSnapshot)', '学生档案首页必须区分待采集和已建立状态。');
requireText(studentViewSource, "template.generationMode === 'continuous' && hasArchive", '只有可重复填写的档案才应提供新增一份入口。');
requireText(studentViewSource, 'dataUpdatedAt: newArchiveDataDate', '新增一份档案前必须保存老师选择的数据更新日期。');
requireText(studentViewSource, '数据更新于 {snapshot.dataUpdatedAt}', '学生档案列表必须展示业务数据更新日期。');
requireText(studentViewSource, 'editSnapshot(activeSnapshot)', '历史档案必须能够随时进入纠错。');
requireText(storeSource, 'snapshotId: sourceSnapshot?.id', '编辑已有档案时必须关联原档案记录。');
requireText(storeSource, 'workspace.snapshots.map(item => item.id === existingSnapshot.id ? snapshot : item)', '保存纠错必须覆盖原档案而不是增加数量。');
requireText(storeSource, ': [...workspace.snapshots, snapshot]', '只有新建档案时才应追加一份记录。');
requireText(studentViewSource, '当前年级暂无可用档案', '学生档案空状态必须说明当前年级没有可用档案。');
forbidText(studentViewSource, 'action={<StatusPill className="bg-[var(--tm-brand-reward-soft)] text-[var(--tm-brand-reward-strong)]">草稿</StatusPill>}', '学生档案填写页标题栏不应重复展示草稿标签。');
requireText(archiveFormRendererSource, 'className={`${sectionSurface} overflow-hidden`} open', '档案填写和预览必须默认展开全部分组，方便核对完整内容。');
forbidText(studentViewSource, '>历史档案</h2>', '学生成长档案首页应使用“档案记录”承载多份档案。');
forbidText(studentViewSource, '>已成档</StatusPill>', '学生档案详情标题栏不应重复展示已成档标签。');

for (const required of [
  "export type ArchiveTemplateStatus = 'recommended' | 'draft' | 'ready' | 'published' | 'disabled'",
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

for (const template of ['一年级初始成长档案', '学生个性与特长档案']) {
  requireText(storeSource, template, `推荐模板缺少：${template}`);
}
for (const removedTemplate of ['学期成长档案', '毕业与转衔档案']) {
  forbidText(storeSource, removedTemplate, `已移除模板不应保留定义或演示数据：${removedTemplate}`);
}

const studentProfileFieldsSource = storeSource.slice(
  storeSource.indexOf('const studentProfileFields:'),
  storeSource.indexOf('const cloneFields ='),
);
const profileFieldCount = studentProfileFieldsSource.match(/profileField\(/g)?.length ?? 0;
if (profileFieldCount !== 13) throw new Error(`学生个性与特长档案应固定包含13项，当前为${profileFieldCount}项。`);
for (const field of ['性格特点', '兴趣爱好', '代表性特长', '与老师沟通偏好', '有效激励方式', '需要老师留意的情况']) {
  requireText(studentProfileFieldsSource, field, `学生个性与特长档案缺少：${field}`);
}
const studentProfileTemplateSource = storeSource.slice(
  storeSource.indexOf("id: 'recommended-student-profile-v1'"),
  storeSource.indexOf("updatedAt: '2026-08-05'") + "updatedAt: '2026-08-05'".length,
);
requireText(studentProfileTemplateSource, 'systemFields: []', '学生个性与特长档案不应重复学生身份信息。');
requireText(studentProfileTemplateSource, 'growthModules: []', '学生个性与特长档案不应包含成长模块。');
requireText(studentProfileTemplateSource, 'growthFields: []', '学生个性与特长档案不应包含成长字段。');
requireText(storeSource, "const recommendedEntryAppearance: ArchiveAppearance = { themeId: 'leaf', headerImageId: 'growth' }", '一年级初始成长档案必须默认使用成长绿和成长记录头图。');
requireText(storeSource, "const recommendedStudentProfileAppearance: ArchiveAppearance = { themeId: 'sky', headerImageId: 'learning' }", '学生个性与特长档案必须默认使用学习蓝和学习探索头图。');
requireText(storeSource, 'appearance: cloneArchiveAppearance(recommendedEntryAppearance)', '一年级初始成长档案必须写入自身外观配置。');
requireText(storeSource, 'appearance: cloneArchiveAppearance(recommendedStudentProfileAppearance)', '学生个性与特长档案必须写入自身外观配置。');

for (const field of ['优势特点', '兴趣倾向', '当前关注', '有效支持方式', '阶段目标']) {
  requireText(storeSource, field, `稳定核心字段缺少：${field}`);
}

requireText(storeSource, 'createBlankArchiveTemplate', '新建档案必须支持从空白草稿开始。');
const blankTemplateSource = storeSource.slice(storeSource.indexOf('export const createBlankArchiveTemplate'), storeSource.indexOf('export const saveArchiveTemplate'));
requireText(blankTemplateSource, "generationMode: 'once'", '空白档案默认只能填写一次。');
requireText(storeSource, 'generationMode: template.generationMode,', '档案结构快照必须保留真实更新规则。');
forbidText(storeSource, "generationMode: 'continuous' as const", '保存档案时不得强制改成可重复填写。');
requireText(storeSource, 'appearance: ArchiveAppearance', '档案模板和结构快照必须保存外观配置。');
requireText(viewSource, 'previewRecommendedTemplate', '从模板创建必须先进入模板预览。');
requireText(storeSource, 'name: source.name,', '使用推荐模板创建档案时必须原样保留模板名称。');
forbidText(storeSource, '`${source.name}（校本）`', '使用推荐模板创建档案时不得自动追加“校本”。');
requireText(storeSource, "name: '',", '从空白创建档案时名称必须保持为空。');
forbidText(storeSource, "name: '未命名档案'", '从空白创建档案时不得自动带入默认名称。');
requireText(viewSource, '<MobileDocumentTitleInput', '新建档案必须复用采集名称的公共文档标题输入。');
requireText(viewSource, 'id="archive-title"', '新建档案名称必须提供稳定的校验定位点。');
requireText(viewSource, 'error={templateNameValidationAttempt > 0 ? templateNameError : undefined}', '档案名称为空时必须使用行内错误反馈。');
requireText(viewSource, "document.getElementById('archive-title')", '档案名称校验失败时必须自动定位到名称输入。');
requireText(viewSource, '>档案名称</span>', '编辑已有档案时必须保留明确的档案名称标签。');
requireText(mobileDocumentTitleInputSource, 'text-[length:var(--tm-font-size-document-title)]', '新建档案名称必须与新建采集使用同一文档标题层级。');
forbidText(viewSource, '>模板名称</span>', '档案编辑字段不得继续使用“模板名称”。');
requireText(viewSource, 'placeholder="请输入档案名称"', '档案名称为空时必须显示填写提示。');
requireText(viewSource, '${phoneRadius.sm} px-3', '档案适用年级必须使用8像素小圆角令牌。');
forbidText(viewSource, 'min-h-[var(--tm-size-touch)] rounded-full px-3', '档案适用年级不应继续使用胶囊圆角。');
requireText(viewSource, '请至少新增一个档案分组', '空白档案启用前必须校验档案分组。');
requireText(viewSource, '请至少添加一项档案内容', '空白档案启用前必须校验档案内容。');
requireText(storeSource, "layoutMode: 'flat'", '空白档案默认应关闭分组。');
requireText(storeSource, "layoutMode: 'grouped'", '推荐档案模板应保留分组结构。');
requireText(storeSource, "template.status === 'published'", '实时档案只能读取已启用模板。');
requireText(storeSource, 'workspace.drafts.find', '同一模板已有草稿时必须继续原草稿。');
requireText(studentViewSource, 'workspace.drafts', '禁用后已有草稿必须仍可进入填写。');
requireText(storeSource, 'appendArchiveViewAudit', '完整档案查看必须写入审计记录。');
requireText(storeSource, "&& template.status !== 'recommended'", '除系统推荐模板外，学校档案的各状态都必须允许删除。');
requireText(storeSource, 'sourceSnapshot ? cloneTemplateSnapshot(sourceSnapshot.templateSnapshot) : createArchiveTemplateSnapshot(template)', '新建学生档案必须冻结当前结构，编辑已有档案必须继承原结构快照。');
requireText(storeSource, 'templateSnapshot: cloneTemplateSnapshot(draft.templateSnapshot)', '确认成档时必须继承草稿的结构快照。');
requireText(studentViewSource, 'activeDraft?.templateSnapshot', '学生草稿必须使用自身结构快照继续填写。');
requireText(studentViewSource, 'activeSnapshot.templateSnapshot', '历史档案必须使用自身结构快照展示。');
forbidText(studentViewSource, '补充学生信息', '档案填写页不应承担学生资料维护。');
forbidText(studentViewSource, 'onUpdateStudent', '档案填写页不应修改学生基本资料。');
forbidText(studentViewSource, 'missingSystemField', '学生身份信息缺失不应阻止留档。');
forbidText(studentViewSource, 'templateSnapshot.systemFields', '学生详情内的档案不应重复展示身份信息。');
requireText(studentViewSource, 'getArchiveSystemValues(student)', '正式留档必须由系统自动保存学生身份快照。');
requireText(storeSource, 'systemValues: { ...systemValues }', '确认成档必须由系统保存学生身份信息快照。');
requireText(viewSource, 'getEnabledGrowthFields(spaceId)', '档案设计必须读取当前学校已启用的成长字段。');
requireText(viewSource, '<GrowthFieldCategoryPicker', '档案设计必须复用成长字段分类选择器。');
requireText(viewSource, '成长数据用于持续记录身高、视力等学生信息', '切换到成长数据后必须说明与自定义字段的区别和复用价值。');
requireText(formBuilderSource, "typePickerTab === 'secondary' && typePickerSecondaryTab?.description", '成长数据说明只应在切换到对应标签后展示。');
requireText(growthFieldPickerSource, 'role="tablist" aria-label="成长数据分类"', '档案成长字段必须通过分类标签切换。');
requireText(growthFieldPickerSource, 'activeGroup.fields.map', '档案成长字段只应展示当前分类内容。');
forbidText(viewSource, 'renderFieldAccessory={field =>', '档案分类选择器勾选后不应在行尾显示选填或必填。');
for (const required of ['addButtonLabel="内容"', 'typePickerTitle="添加内容"', 'typePickerPrimaryLabel="手动填写"', 'typePickerSecondaryTab={{', "label: '成长数据'"]) {
  requireText(viewSource, required, `档案添加内容入口缺少：${required}`);
}
for (const field of ['PLATFORM_GROWTH_FIELD_CATALOG', 'getEnabledGrowthFields', 'formatGrowthFieldValue']) {
  requireText(storeSource, field, `档案成长数据未复用统一字段能力：${field}`);
}
const selectableGrowthSource = storeSource.slice(
  storeSource.indexOf('export const ARCHIVE_GROWTH_MODULE_OPTIONS'),
  storeSource.indexOf('const SELECTABLE_ARCHIVE_GROWTH_MODULE_KEYS'),
);
forbidText(selectableGrowthSource, '学期目标', '学期目标暂缓后，不应出现在档案成长数据选择中。');
requireText(viewSource, 'templateDraft.growthFields.length', '档案页必须按具体成长字段统计已选数量。');
requireText(viewSource, 'required: false,', '新增成长字段必须默认选填。');
requireText(viewSource, "missingPolicy: 'supplement',", '新增成长字段必须默认使用可补录策略。');
requireText(viewSource, 'required: field.required,', '成长字段必须从统一字段编辑态写回必填状态。');
requireText(viewSource, "missingPolicy: field.required ? 'required' : 'supplement',", '成长字段必填状态必须同步写回缺失处理策略。');
requireText(formBuilderSource, 'fixedContentFieldIds?: ReadonlySet<string>', '共享构建器必须提供内容固定但可设置必填的字段能力。');
requireText(formBuilderSource, 'getFieldPreviewMeta?: (field: ConfigurableFormField<TType>)', '共享构建器必须允许业务层传入字段精度和单位。');
requireText(viewSource, 'getFieldPreviewMeta={getBuilderFieldPreviewMeta}', '档案详情和编辑必须使用成长字段自身的预览信息。');
requireText(viewSource, "? '请输入整数'", '整数成长字段必须展示整数输入提示。');
requireText(viewSource, "`请输入数字，保留${definition.decimalPlaces === 2 ? '两' : '一'}位小数`", '小数成长字段必须按目录精度生成提示。');
requireText(formBuilderSource, 'previewMeta?.suffix', '数字成长字段必须展示目录中的单位。');
requireText(formBuilderSource, 'readOnly={fixedContent}', '成长字段名称必须完整展示且不可修改。');
requireText(formBuilderSource, "'cursor-default rounded-[var(--tm-radius-control)] border border-[var(--tm-input-readonly-border)] bg-[var(--tm-input-readonly-bg)] px-3 text-[var(--tm-input-readonly-text)]'", '成长字段展开后的固定文本必须使用灰色只读状态。');
requireText(formBuilderSource, 'fixedContent && (choice ? (', '内容固定的选择字段展开后必须展示选项。');
requireText(formBuilderSource, 'renderFieldPreview(field, choice, rating, usesSubFields)', '成长字段展开后必须保留对应题型的完整只读内容。');
requireText(growthCatalogSource, "key: 'height_cm', label: '身高', groupKey: 'body_growth', valueType: 'number', unit: '厘米', minValue: 50, maxValue: 250, decimalPlaces: 2", '身高必须使用两位小数精度和厘米单位。');
requireText(formBuilderSource, '!activeFieldHasFixedContent && <button', '内容固定字段的更多菜单不应提供复制操作。');
forbidText(formBuilderSource, '<CalendarDays className="h-4.5 w-4.5"', '日期字段非编辑态不应单独展示题型图标。');
forbidText(formBuilderSource, '<Hash className="h-4.5 w-4.5"', '数字字段非编辑态不应单独展示题型图标。');
requireText(formBuilderSource, 'text-[length:var(--tm-font-size-compact)] font-normal text-[var(--tm-input-readonly-text)]', '字段提示文案必须弱于字段标题。');
requireText(formBuilderSource, 'text-[length:var(--tm-font-size-card-title)] font-semibold leading-5', '字段标题必须统一使用卡片标题字号。');
requireText(formBuilderSource, 'text-[var(--tm-status-negative)]"><Trash2', '删除字段和分组必须使用标准警示色。');
requireText(viewSource, 'text-[var(--tm-status-negative)]', '档案删除操作必须使用标准警示色。');
for (const removedPolicy of ['有则带入', '缺失可补', '本档案必填']) forbidText(viewSource, removedPolicy, `档案设计不应保留旧带入策略：${removedPolicy}`);
requireText(storeSource, "export type ArchiveGrowthMissingPolicy = 'omit' | 'supplement' | 'required'", '档案数据层必须明确三种缺失处理策略。');
requireText(storeSource, "missingPolicy: 'supplement'", '新增成长字段必须默认为缺失可补。');
requireText(storeSource, 'buildArchiveGrowthModuleSnapshots', '档案必须从学生成长数据构建字段快照。');
requireText(studentViewSource, 'activeDraft?.growthSnapshots ?? []', '学生档案必须读取该档案已经冻结的成长数据快照。');
requireText(studentViewSource, 'missingGrowthField', '保存档案前必须逐字段校验必需成长数据。');
requireText(studentViewSource, "sourceLabel: `档案补录·${activeDraft.templateName}`", '档案补录必须保存可识别的数据来源。');
requireText(studentViewSource, 'saveStudentGrowthDataRecord(student.id', '档案补录必须写入统一成长数据。');
requireText(studentViewSource, 'availableGrowthSnapshots', '保存档案前必须过滤未填写的空字段。');
forbidText(studentViewSource, 'value: event.currentTarget.value', '档案补录不得在函数式状态更新中延迟读取事件对象，否则输入后会导致页面崩溃。');
forbidText(studentViewSource, 'recordedAt: event.currentTarget.value', '档案补录日期不得在函数式状态更新中延迟读取事件对象。');
requireText(storeSource, 'growthSnapshots: cloneGrowthSnapshots(growthSnapshots)', '保存档案必须冻结成长记录快照。');
requireText(studentViewSource, 'activeSnapshot.growthSnapshots', '历史档案必须读取冻结后的成长记录。');
forbidText(viewSource, '成长数据范围', '档案设计不应再配置成长数据范围。');
forbidText(viewSource, 'setShowDataRangePicker', '档案设计不应保留成长数据范围浮层。');
requireText(storeSource, "return { key: 'current', label: '', startDate: '', endDate: '' }", '同一学生和同一档案必须统一写入当前档案。');
requireText(storeSource, 'item.studentId === update.target.studentId', '采集写回必须按学生定位当前档案。');
requireText(storeSource, 'item.templateId === update.templateId', '采集写回必须按档案模板定位当前档案。');
requireText(storeSource, 'mergeArchiveGrowthSnapshots(item.growthSnapshots, update.growthSnapshots)', '重复采集必须更新档案自身的成长快照。');
forbidText(studentViewSource, '档案归属', '学生当前档案不应展示抽象归属周期。');
requireText(storeSource, 'sourceRecordId?: string', '成长字段快照必须保存来源记录。');
requireText(storeSource, 'sourceVersion?: number', '成长字段快照必须保存来源版本。');
requireText(archiveGrowthRendererSource, 'item.recordedAt', '实时档案和历史档案必须逐字段展示记录日期。');

for (const required of ['可留档', '待补充', '已留档', '批量留档 {selectedStudentIds.size} 人']) {
  requireText(classBatchViewSource, required, `班级批量留档流程缺少：${required}`);
}
requireText(storeSource, 'getStudentArchiveReadiness', '单人和批量留档必须共用资料完整性判断。');
requireText(storeSource, 'batchArchiveStudents', '档案数据层必须提供班级批量留档能力。');
requireText(classListSource, "label: '批量留档'", '班级更多操作的学生管理分组必须提供批量留档入口。');
requireText(appSource, '<ClassArchiveBatchView', '教师端必须注册班级批量留档页面。');
requireText(viewSource, "? '新建档案'", '新建档案编辑器顶部必须显示“新建档案”。');
forbidText(viewSource, 'action={headerAction}', '档案标题栏不应承载预览、更多或状态操作。');
requireText(viewSource, "ready: { label: '待启用'", '档案列表和详情必须提供待启用状态。');
requireText(viewSource, "published: { label: '使用中'", '已启用档案应使用老师可理解的“使用中”状态。');
requireText(viewSource, "disabled: { label: '已停用'", '禁用状态应使用老师可理解的“已停用”文案。');
requireText(viewSource, 'const completeTemplateDesign = () =>', '档案编辑器必须提供独立的完成设计动作。');
requireText(viewSource, "status: 'ready'", '完成设计必须保存为待启用状态。');
requireText(viewSource, "setTemplateEditorMode('detail')", '完成设计后必须直接进入档案详情。');
requireText(viewSource, '>完成</button>', '档案编辑页主按钮必须使用紧凑的“完成”文案。');
requireText(viewSource, '>预览</button>', '档案编辑页底部必须提供文案预览入口。');
requireText(viewSource, '>继续编辑</button>', '待启用详情必须提供继续编辑入口。');
requireText(viewSource, '>启用档案</button>', '待启用详情必须保留启用入口。');
requireText(studentViewSource, 'renderGrowthField={(config, number) =>', '学生档案必须在实际分组内渲染成长字段。');
requireText(archiveGrowthRendererSource, '待采集', '档案成长数据预览必须展示真实待采集状态。');
forbidText(viewSource, '<dt className="shrink-0 text-[12px] font-semibold text-[var(--tm-text-tertiary)]">档案周期</dt>', '待启用详情不应提前展示使用周期。');
requireText(viewSource, '学生已有档案和更新记录不受影响', '删除已禁用档案前必须说明学生档案不受影响。');
requireText(viewSource, '启用后，老师可以在采集管理中按此档案发起采集。', '启用确认必须只说明启用后的直接结果。');
requireText(viewSource, '确认启用', '待启用档案必须能够直接确认启用。');
requireText(viewSource, 'showDeleteConfirm', '删除档案设计必须二次确认。');
requireText(viewSource, 'activeTemplateActionId', '档案列表必须记录当前操作对象。');
requireText(viewSource, 'aria-label={`打开档案操作：${template.name}`}', '点击档案列表卡片必须打开对应档案操作。');
requireText(viewSource, '<MobileBottomSheet open={Boolean(activeTemplateAction)}', '档案操作必须复用公共底部抽屉。');
requireText(viewSource, "title={activeTemplateAction?.name ?? ''}", '档案操作抽屉必须直接使用档案名称作为标题。');
forbidText(viewSource, 'title="档案操作"', '档案操作抽屉不得展示通用标题。');
for (const action of ['>编辑</button>', '>预览</button>', '>停用档案</button>', ">{activeTemplateAction.status === 'disabled' ? '重新启用' : '启用档案'}</button>", '>复制档案</button>', '>删除档案</button>']) {
  requireText(viewSource, action, `档案列表操作抽屉缺少：${action}`);
}
requireText(viewSource, '>问卷设计</h4>', '预览和编辑必须归入问卷设计分组。');
requireText(viewSource, '>更多操作</h4>', '复制和删除必须归入更多操作分组。');
requireText(viewSource, 'className={`${primaryButton} mt-3 w-full`}', '启用和重新启用必须使用独立全宽主按钮。');
requireText(viewSource, 'bg-[var(--tm-bg-surface-muted)]', '停用档案必须保持同位置高层级，但使用中性表面避免鼓励感。');
const actionSheetStart = viewSource.indexOf('<MobileBottomSheet open={Boolean(activeTemplateAction)}');
const actionSheetEnd = viewSource.indexOf('<MobileBottomSheet open={showCreateSheet}', actionSheetStart);
const actionSheetSource = viewSource.slice(actionSheetStart, actionSheetEnd);
if (actionSheetSource.split('grid grid-cols-2 gap-[var(--tm-space-2)]').length - 1 !== 2) {
  throw new Error('问卷设计和更多操作必须分别使用无线条双列布局。');
}
for (const action of ['previewActiveTemplate', 'editActiveTemplate', 'duplicateActiveTemplate', 'deleteActiveTemplate']) {
  requireText(actionSheetSource, `onClick={${action}} className={\`\${archiveActionTile}`, `档案次级操作必须统一复用操作块样式：${action}`);
}
requireText(viewSource, "const archiveActionTile = 'flex min-h-[52px] w-full", '档案次级操作必须统一使用紧凑且满足触控要求的操作块。');
requireText(viewSource, 'bg-[var(--tm-bg-surface-soft)]', '档案次级操作必须使用教师端浅表面令牌。');
forbidText(actionSheetSource, 'divide-y', '档案操作抽屉不应使用组内分隔线。');
forbidText(actionSheetSource, 'border-y', '档案操作抽屉不应使用操作区上下边线。');
forbidText(actionSheetSource, 'border-b border-[var(--tm-border-subtle)]', '档案状态与操作区之间不应使用分隔线。');
requireText(viewSource, 'const deleteActiveTemplate = () =>', '删除档案必须从列表操作抽屉发起。');
requireText(viewSource, 'const duplicateActiveTemplate = () =>', '档案列表必须支持复制为新草稿。');
requireText(viewSource, 'const savePublishedTemplate = () =>', '使用中的档案必须允许编辑并保持使用中状态。');
const basicSettingsStart = viewSource.indexOf('<MobileBottomSheet open={showBasicSettingsSheet}');
const deleteConfirmStart = viewSource.indexOf('<BottomSheet open={showDeleteConfirm}', basicSettingsStart);
const basicSettingsSource = viewSource.slice(basicSettingsStart, deleteConfirmStart);
forbidText(basicSettingsSource, '删除档案', '基础设置中不得继续展示删除档案。');
forbidText(basicSettingsSource, '<Trash2', '基础设置中不得继续展示删除图标。');
forbidText(viewSource, 'renderDeleteArchiveAction', '删除操作不应继续出现在档案正文中。');
requireText(viewSource, '<section className={`${sectionSurface} mt-3 p-4`}>', '档案详情的适用年级必须使用独立卡片。');
requireText(viewSource, '<section className={`${sectionSurface} p-4 ${isCreating ? \'mt-4\' : \'mt-3\'}`}>', '档案编辑态的适用年级必须使用独立卡片。');
forbidText(viewSource, 'setShowTemplateMenu', '删除档案不得继续占用名称或适用年级卡片的更多入口。');
requireText(viewSource, "templateEditorMode === 'create' || templateEditorMode === 'edit'", '已禁用档案必须提供独立的查看态和完整编辑态。');
requireText(viewSource, 'saveDisabledTemplate();', '已禁用档案点击完成后必须保存修改且保持禁用。');
requireText(viewSource, '编辑档案', '已禁用档案详情必须提供编辑入口。');
requireText(viewSource, "status: 'disabled'", '保存已禁用档案修改时不能改变启用状态。');
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
const archiveVisualSources = [viewSource, studentViewSource, classBatchViewSource, archiveFormRendererSource, archiveGrowthRendererSource, primitivesSource].join('\n');
for (const rawStyle of ['text-white', 'bg-white/38', 'shadow-sm', 'shadow-[', 'backdrop-blur-[2px]']) {
  forbidText(archiveVisualSources, rawStyle, `档案页面不得残留未收敛到设计令牌的样式：${rawStyle}`);
}
requireText(archiveFormRendererSource, "role={field.type === 'single-select' ? 'radio' : 'checkbox'}", '档案选项必须使用可识别的单选或多选语义。');
requireText(archiveFormRendererSource, "field.type === 'single-select' ? 'rounded-full'", '单选项必须使用圆形选择符号。');
forbidText(storeSource, "group: 'core' | 'stage'", '字段模型不应保留成长对比分组。');
requireText(storeSource, "export type ArchiveFieldType = 'text' | 'single-select' | 'multiple-select' | 'date' | 'number'", '字段类型应支持文字、单选、多选、日期、数字。');
forbidText(storeSource, 'export type ArchiveSource', '档案数据层不应保留参与来源模型。');
forbidText(storeSource, 'archiveStageMeta', '档案数据层不应保留档案阶段模型。');
forbidText(storeSource, 'StudentBaseArchive', '档案数据层不应保留学生底档模型。');

console.log('Archive design lightweight flow assertions passed');
