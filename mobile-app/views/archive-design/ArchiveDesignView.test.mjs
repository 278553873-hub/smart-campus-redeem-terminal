import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./ArchiveDesignView.tsx', import.meta.url), 'utf8');
const studentViewSource = fs.readFileSync(new URL('./StudentArchiveView.tsx', import.meta.url), 'utf8');
const storeSource = fs.readFileSync(new URL('../../../shared/studentArchiveStore.ts', import.meta.url), 'utf8');
const dashboardSource = fs.readFileSync(new URL('../DashboardView.tsx', import.meta.url), 'utf8');
const meSource = fs.readFileSync(new URL('../MeView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../../App.tsx', import.meta.url), 'utf8');
const primitivesSource = fs.readFileSync(new URL('./archivePagePrimitives.tsx', import.meta.url), 'utf8');
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
const archiveScreenBackground = appSource.match(/if \(\[([^\]]+)\]\.includes\(currentView\)\) \{\s*return <TeacherMobileScreenBackground/)?.[1] ?? '';
requireText(archiveScreenBackground, "'archive_design'", '档案设计应纳入屏幕级背景，标题栏才能与页面氛围光融为一体。');
requireText(primitivesSource, "export const pageBackground = 'bg-transparent'", '档案设计页面容器应保持透明，顶部氛围光由屏幕级背景统一提供。');
requireText(primitivesSource, 'justify-between bg-white/38 px-4 backdrop-blur-md', '档案设计标题栏应与通用标题栏一致使用轻薄玻璃。');
forbidText(primitivesSource, 'border-b border-white/70', '档案设计顶部标题栏不应保留分割线，应依靠毛玻璃与内容自然分层。');
forbidText(primitivesSource, 'slate-', '档案设计基础组件不应残留旧灰色系。');
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

for (const required of ['使用分组', '添加分组', '编辑分组', '所属分组', '添加{itemLabel}']) {
  requireText(formBuilderSource, required, `共享表单构建器缺少：${required}`);
}
forbidText(formBuilderSource, '默认分组', '开启分组后不应自动创建或展示默认分组。');
forbidText(formBuilderSource, '{sections.length}组', '分组配置区不应展示无助于操作的分组数量。');
requireText(formBuilderSource, 'fields.map(field => ({ ...field, sectionId: nextSection.id }))', '创建首个分组后必须将已有字段自动归入该组。');
requireText(formBuilderSource, '<GripVertical', '每个字段前必须提供拖动排序标识。');
requireText(formBuilderSource, 'onDragEnd={event => reorderFields(event, items)}', '字段拖动后必须写回共享表单顺序。');
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

for (const required of [
  '选择档案',
  '未完成',
  '历史档案',
  '保存草稿',
  '确认成档',
  '档案详情',
]) {
  requireText(studentViewSource, required, `学生档案流程缺少：${required}`);
}

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
requireText(viewSource, '请至少新增一个档案字段', '空白档案启用前必须校验档案字段。');
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
requireText(viewSource, "isCreating ? '新建档案'", '新建档案编辑器顶部必须显示“新建档案”。');
requireText(viewSource, 'action={headerAction}', '档案编辑页必须按状态提供右上角操作，不固定展示草稿标签。');
requireText(viewSource, '学生已有草稿和已成档记录不受影响', '删除已禁用档案前必须说明学生档案不受影响。');
requireText(viewSource, 'showDeleteConfirm', '删除档案设计必须二次确认。');
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
forbidText(storeSource, "group: 'core' | 'stage'", '字段模型不应保留成长对比分组。');
requireText(storeSource, "export type ArchiveFieldType = 'text' | 'single-select' | 'multiple-select' | 'date' | 'number'", '字段类型应支持文字、单选、多选、日期、数字。');
forbidText(storeSource, 'export type ArchiveSource', '档案数据层不应保留参与来源模型。');
forbidText(storeSource, 'archiveStageMeta', '档案数据层不应保留档案阶段模型。');
forbidText(storeSource, 'StudentBaseArchive', '档案数据层不应保留学生底档模型。');

console.log('Archive design lightweight flow assertions passed');
