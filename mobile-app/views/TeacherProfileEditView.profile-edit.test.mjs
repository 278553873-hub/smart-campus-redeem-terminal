import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const editSource = read('./TeacherProfileEditView.tsx');
const classCascadeSource = read('../components/ui/MobileClassCascadePicker.tsx');
const bottomSheetSource = read('../components/ui/MobileBottomSheet.tsx');
const meSource = read('./MeView.tsx');
const appSource = read('../App.tsx');
const typesSource = read('../types.ts');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText(meSource, 'onEditTeacherProfile', '我的页面头像应提供进入编辑教师信息页的点击入口。');
requireText(meSource, 'aria-label="编辑教师信息"', '头像入口应具备明确的无障碍标签。');
if (meSource.includes("title: '编辑教师信息'")) {
  throw new Error('编辑教师信息不应作为我的资料菜单项出现。');
}

requireText(appSource, "'teacher_profile_edit'", 'App 路由应包含教师信息编辑页状态。');
requireText(appSource, '<TeacherProfileEditView', 'App 应渲染教师信息编辑页。');
requireText(appSource, 'TEACHER_PROFILE_DEPARTMENTS', 'App 应提供部门列表的模拟数据。');
requireText(appSource, 'departments={TEACHER_PROFILE_DEPARTMENTS}', '编辑页应接收部门列表。');
requireText(appSource, 'currentSpace={activeTeacherSpace}', '编辑页应接收当前班级来源，用于判断学校字段是否可编辑。');

requireText(typesSource, 'TeacherDepartment', '类型层应定义教师部门。');
requireText(typesSource, 'departmentId: string;', '教师资料应保存部门 id，并允许使用空字符串表达未设置。');
requireText(typesSource, 'gradeLeaderGrades: string[];', '教师资料应保存分管年级。');

requireText(editSource, 'applyProfileChange', '字段修改后应立即同步到教师资料。');
if (editSource.includes('onSave(draft)')) {
  throw new Error('教师个人信息采用字段独立生效，不应保留整页保存按钮。');
}

requireText(editSource, '>个人信息编辑</h1>', '教师个人信息页应使用明确的页面标题。');
requireText(editSource, 'bg-[var(--tm-page-plain-header-bg)] px-4', '页面应使用教师手机端白色标题栏。');
requireText(editSource, 'h-11 w-11 items-center justify-center', '返回按钮应保留 44 像素触控区域。');
requireText(editSource, 'bg-[var(--tm-bg-page)]', '标题栏下方应使用教师手机端页面底色。');

requireText(editSource, 'teacher-avatar-card', '头像应作为独立卡片展示。');
requireText(editSource, 'teacher-basic-info-card', '姓名、学校和部门应合并为基础资料卡。');
requireText(editSource, 'teacher-teaching-card', '学科和任教范围应合并为任教信息卡。');
requireText(editSource, 'teacher-management-card', '带班班级和分管年级应合并为管理职责卡。');
requireText(editSource, "const showManagementResponsibilities = currentSpace.type !== 'personal';", '个人版不应展示管理职责。');
requireText(editSource, '{showManagementResponsibilities && (', '管理职责卡应根据当前来源类型条件渲染。');
for (const oldCard of ['teacher-name-card', 'teacher-school-card', 'teacher-homeroom-card', 'teacher-grade-leader-card', 'teacher-department-card']) {
  if (editSource.includes(oldCard)) throw new Error(`教师个人信息页不应继续保留碎片化卡片：${oldCard}`);
}
for (const title of ['基础资料', '任教信息', '管理职责']) {
  requireText(editSource, `>${title}</h2>`, `教师个人信息页缺少分组标题：${title}`);
}
if (editSource.includes('<Pencil') || editSource.includes('editButtonClass')) {
  throw new Error('教师个人信息主页面不应重复铺设圆形铅笔按钮，应改为整行点击和右箭头。');
}
requireText(editSource, 'divide-y divide-[var(--tm-border-subtle)]', '组合卡字段之间应保留浅色分隔线。');
requireText(editSource, 'grid-cols-[80px_minmax(0,1fr)]', '字段应采用左侧标签、右侧值的紧凑结构。');
requireText(editSource, '<MobileEditableRow', '教师资料可编辑字段应复用手机端统一字段行按压状态。');
requireText(editSource, "const fieldLabelClass = 'text-sm font-medium text-[var(--tm-text-tertiary)]'", '左侧字段名应统一使用灰色弱层级。');
requireText(editSource, 'font-semibold text-[var(--tm-text-primary)]', '已设置的右侧字段值应使用黑色主信息层级。');
requireText(editSource, "'font-medium text-[var(--tm-text-tertiary)]'", '未设置状态应使用灰色弱层级。');
if ((editSource.match(/<ChevronRight/g) ?? []).length < 6) {
  throw new Error('可编辑字段应通过右箭头统一表达下钻编辑。');
}

requireText(editSource, 'src={draft.avatar}', '编辑页应展示当前教师头像。');
requireText(editSource, 'object-cover object-center', '教师头像应覆盖圆形容器，不能留白。');
requireText(editSource, 'h-24 w-24', '教师头像应保持稳定尺寸。');
requireText(editSource, '更换头像', '头像应支持更换。');
requireText(editSource, '拍照', '头像弹窗应提供拍照。');
requireText(editSource, '从相册选择', '头像弹窗应提供从相册选择。');

requireText(editSource, 'renderNameDialog', '姓名应通过弹窗修改。');
requireText(editSource, 'renderSchoolDialog', '非学校来源下的学校名称应通过弹窗修改。');
requireText(editSource, "const schoolNameLocked = currentSpace.type === 'school';", '学校来源下的学校字段应锁定。');
requireText(editSource, 'schoolNameLocked ? (', '学校锁定时不应渲染编辑入口。');
requireText(editSource, 'focus:border-[var(--tm-input-focus-border)] focus:ring-2 focus:ring-[var(--tm-input-focus-ring)]', '输入框聚焦状态应继续使用透明焦点令牌。');

const basicInfoCardSource = editSource.slice(
  editSource.indexOf('teacher-basic-info-card'),
  editSource.indexOf('teacher-teaching-card'),
);
requireText(basicInfoCardSource, '>部门</span>', '部门应放在基础资料卡内。');
requireText(basicInfoCardSource, "draft.departmentName || '未设置'", '部门为空时应显示未设置。');
requireText(basicInfoCardSource, 'openDepartmentSelector', '点击部门整行应打开部门选择弹窗。');

const teachingCardSource = editSource.slice(
  editSource.indexOf('teacher-teaching-card'),
  editSource.indexOf('teacher-management-card'),
);
requireText(teachingCardSource, '>任教信息</h2>', '任教卡片标题应为任教信息。');
if (teachingCardSource.includes('>部门</span>')) {
  throw new Error('部门不应继续放在任教信息卡。');
}
const teachingTitleSource = teachingCardSource.slice(
  teachingCardSource.indexOf('>任教信息</h2>'),
  teachingCardSource.indexOf('divide-y divide-[var(--tm-border-subtle)]'),
);
requireText(teachingTitleSource, 'openTeachingEditor()', '部门移出后，添加入口应回到任教信息标题右侧。');
if (teachingCardSource.includes('>任教班级</span>')) {
  throw new Error('任教信息卡不应重复展示任教班级文案。');
}
requireText(teachingCardSource, 'group flex h-11 items-center justify-center', '任教信息添加按钮应保留 44 像素触控区域。');
requireText(teachingCardSource, 'flex h-7 items-center gap-1', '任教信息添加按钮的可见高度应为 28 像素。');
requireText(teachingCardSource, 'border border-[var(--tm-brand-primary)] bg-[var(--tm-bg-surface)]', '任教信息添加按钮应使用主题色边框和白色底。');
requireText(teachingCardSource, 'openTeachingEditor(group)', '点击已有任教学科应进入编辑弹窗。');
if (teachingCardSource.includes('<Trash2')) {
  throw new Error('任教信息卡不应直接暴露删除操作。');
}

requireText(editSource, 'selectDepartment()', '部门应支持保存为空。');
if (editSource.includes('<span>未设置</span>')) {
  throw new Error('部门选择列表顶部不应把未设置作为普通选项。');
}
requireText(editSource, 'onClick={() => selectDepartment(department)}', '选择部门后应直接生效。');
requireText(editSource, '清空部门', '已有部门时应在弹窗底部提供灰色清空操作。');
if (editSource.includes('disabled={!selectedDepartmentId}')) {
  throw new Error('部门允许为空，不应因未选择部门而禁用保存。');
}

requireText(editSource, 'groupTeachingAssignmentsBySubject', '任教范围应按学科聚合。');
requireText(editSource, 'editingTeachingSubject', '已有任教信息应支持编辑。');
requireText(editSource, '<MobileClassCascadePicker', '任教和带班选择应复用公共班级级联组件。');
requireText(classCascadeSource, "ariaLabel = '班级级联选择'", '班级选择应具备明确语义。');
requireText(editSource, '下方选择任教学科', '任教信息应在同一弹窗中选择班级和学科。');
requireText(editSource, '请先选择学科', '任教信息保存前应校验学科。');
requireText(editSource, '清空任教信息', '任教信息应与其他可选配置统一使用灰色清空操作。');
requireText(editSource, 'if (group) clearTeachingGroup(group);', '清空任教信息应直接应用，不增加二次确认。');
if (editSource.includes('<MobileConfirmSheet') || editSource.includes('删除任教信息') || editSource.includes('<Trash2')) {
  throw new Error('任教信息不应使用危险删除样式或二次确认。');
}

const managementCardSource = editSource.slice(
  editSource.indexOf('teacher-management-card'),
  editSource.indexOf("{mode === 'avatar'"),
);
requireText(managementCardSource, '>带班班级</span>', '管理职责卡应包含带班班级。');
requireText(managementCardSource, '>分管年级</span>', '管理职责卡应包含分管年级。');
if (managementCardSource.includes('>部门</span>')) {
  throw new Error('部门不应放在管理职责卡，应归入基础资料。');
}

requireText(editSource, '<MobileBottomSheet', '页面弹窗应统一复用公共底部弹窗。');
requireText(bottomSheetSource, 'role="dialog"', '公共底部弹窗应具备对话框语义。');
requireText(bottomSheetSource, 'aria-modal="true"', '公共底部弹窗应标记为模态对话框。');
if (editSource.includes('renderSheetFrame') || editSource.includes('bottom-sheet flex max-h')) {
  throw new Error('业务页面不应继续手写底部弹窗框架。');
}

for (const legacyColor of ['slate-', 'blue-', 'indigo-', 'violet-', 'purple-', 'cyan-', 'rose-']) {
  if (editSource.includes(legacyColor)) {
    throw new Error(`教师信息编辑页仍残留旧视觉颜色：${legacyColor}，应统一使用教师手机端语义令牌。`);
  }
}
