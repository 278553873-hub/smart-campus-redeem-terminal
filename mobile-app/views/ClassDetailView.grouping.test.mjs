import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const viewSource = read('./ClassDetailView.tsx');
const searchInputSource = read('../components/ui/MobileSearchInput.tsx');
const typesSource = read('../types.ts');
const constantsSource = read('../constants.ts');
const appSource = read('../App.tsx');

const failures = [];
const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText(typesSource, 'StudentGroup', '类型层应定义学生分组 StudentGroup。');
requireText(typesSource, 'GroupPlan', '类型层应定义分组方案 GroupPlan。');
requireText(typesSource, 'memberIds: string[];', '分组应保存学生 ID 列表，避免复制学生业务数据。');
requireText(constantsSource, 'GET_MOCK_GROUP_PLANS_FOR_CLASS', 'Mock 数据应提供按班级生成分组方案的方法。');
requireText(constantsSource, '常用分组', '首套分组应使用老师容易理解的默认名称。');
requireText(constantsSource, '阅读分组', 'Mock 数据应包含其他老师创建的阅读分组。');
requireText(constantsSource, '数学互助分组', 'Mock 数据应包含其他老师创建的数学互助分组。');

requireText(viewSource, "activeView, setActiveView] = useState<'student' | 'group'>('student')", '班级详情页应支持学生/分组双视图切换。');

requireText(viewSource, 'class-detail-titlebar-switcher', '班级详情页应把学生/分组切换放入标题栏。');
requireText(viewSource, 'onBack?: () => void;', '班级详情页应接管返回按钮，避免 App 额外显示班级标题。');
requireText(viewSource, 'aria-label="返回班级列表"', '班级详情标题栏应保留返回入口。');
requireText(appSource, "currentView !== 'class_detail'", 'App 不应再为班级详情渲染显示班级名的 LocalHeader。');
requireText(appSource, 'onBack={goBack}', 'App 应把返回能力传入班级详情内部标题栏。');
if (appSource.includes("case 'class_detail': return MOCK_CLASSES.find")) {
  failures.push('班级详情不应再通过 App 标题栏展示班级名称。');
}
if (viewSource.includes('compact-view-switcher bg-white/88')) {
  failures.push('学生/分组切换不应再作为内容区独立占位，应移动到标题栏。');
}
requireText(viewSource, 'handleRestoreSearchMode', '多选态应保留恢复搜索的快捷入口。');
requireText(viewSource, 'aria-label="恢复搜索"', '多选工具栏左侧应保留搜索图标。');
requireText(viewSource, 'selection-tools-next-to-cancel', '全选、反选、性别批量选择与取消应在同一行直接展示。');
requireText(viewSource, 'searchQuery', '学生全量展示应提供搜索状态。');
requireText(viewSource, 'normalizedSearchQuery', '搜索应统一按去空格后的关键字匹配。');
requireText(viewSource, 'student.studentNo', '搜索应支持按学号匹配。');
requireText(viewSource, 'student.name.includes', '搜索应支持按姓名匹配。');
requireText(viewSource, 'visibleStudents', '多选和全选应基于当前可见学生列表。');
requireText(viewSource, 'studentsByGender', '学生多选态应按性别维护批量选择目标。');
requireText(viewSource, 'handleToggleGenderSelection', '学生多选态应提供按性别批量选择与取消选择。');
requireText(viewSource, "handleToggleGenderSelection('male')", '男生快捷按钮应批量选择男生，而不是筛选列表。');
requireText(viewSource, "handleToggleGenderSelection('female')", '女生快捷按钮应批量选择女生，而不是筛选列表。');
requireText(viewSource, "aria-label={isMaleQuickSelectionActive ? '取消全选男生' : '全选男生'}", '男生快捷按钮应明确表达互斥批量选择状态。');
requireText(viewSource, "aria-label={isFemaleQuickSelectionActive ? '取消全选女生' : '全选女生'}", '女生快捷按钮应明确表达互斥批量选择状态。');
requireText(viewSource, 'aria-pressed={isMaleQuickSelectionActive}', '男生快捷按钮应暴露当前是否为唯一生效的快捷选择。');
requireText(viewSource, 'aria-pressed={isFemaleQuickSelectionActive}', '女生快捷按钮应暴露当前是否为唯一生效的快捷选择。');
requireText(viewSource, 'selectedIds.size === studentsByGender.male.length', '男生快捷按钮只有在当前恰好全选男生时才可高亮。');
requireText(viewSource, 'selectedIds.size === studentsByGender.female.length', '女生快捷按钮只有在当前恰好全选女生时才可高亮。');
requireText(viewSource, ': new Set(genderStudents.map(student => student.id))', '切换性别快捷选择时应替换现有选择，保证男生与女生互斥。');
requireText(viewSource, 'bg-[var(--tm-gender-male-selection-bg)] text-white', '男生快捷按钮选中态应使用明亮嫩绿实底与白色图标。');
requireText(viewSource, 'bg-[var(--tm-gender-female-selection-bg)] text-white', '女生快捷按钮选中态应使用明亮珊瑚红实底与白色图标。');
if (viewSource.includes('selectionGenderFilter') || viewSource.includes('matchesGender')) {
  failures.push('性别快捷选择不得过滤或隐藏学生列表。');
}
requireText(viewSource, 'handleSelectAllVisibleStudents', '学生多选态应提供全选当前可见学生。');
requireText(viewSource, 'handleClearVisibleStudents', '学生多选态应提供取消全选当前可见学生。');
requireText(viewSource, 'handleInvertVisibleStudents', '学生多选态应提供反选当前可见学生。');
requireText(viewSource, 'visibleStudents.forEach(student => {', '反选必须只作用于当前可见学生。');
requireText(viewSource, 'if (next.has(student.id)) next.delete(student.id);', '反选必须取消当前已选学生。');
requireText(viewSource, 'else next.add(student.id);', '反选必须选中当前未选学生。');
requireText(viewSource, 'onClick={handleInvertVisibleStudents}', '反选按钮应在工具栏直接接入反选操作。');
requireText(viewSource, '全选', '学生多选工具栏应展示全选操作。');
requireText(viewSource, '取消全选', '学生多选工具栏应展示取消全选操作。');
requireText(viewSource, '反选', '学生多选工具栏应展示反选操作。');
requireText(viewSource, "isSelectionMode ? '取消' : '多选'", '学生多选工具栏应保留取消操作。');
requireText(viewSource, 'onToggleSelectionMode();', '学生视图应保留显式多选入口。');
if (viewSource.includes('showSelectionToolsSheet') || viewSource.includes('MoreHorizontal') || viewSource.includes('更多选择工具')) {
  failures.push('学生多选的高频操作不应收入“更多”抽屉。');
}
if (viewSource.includes('多选学生')) {
  failures.push('学生视图多选入口不应再显示“多选学生”，应显示“多选”。');
}

requireText(viewSource, 'student-action-row', '学生搜索框与多选入口应放在同一行，减少顶部占高。');
requireText(viewSource, 'density="compact"', '学生搜索框应使用公共组件的紧凑密度，优先释放学生卡片首屏空间。');
requireText(viewSource, 'class-detail-titlebar-switcher', '学生/分组筛选应使用标题栏紧凑容器。');
requireText(viewSource, 'text-[15px] font-bold', '学生/分组筛选字号应压缩，避免喧宾夺主。');
if (viewSource.includes('UsersIcon')) {
  failures.push('学生列表顶部不应再展示班级人数统计。');
}
if (viewSource.includes('按学号') || viewSource.includes('按拼音') || viewSource.includes('sortMode')) {
  failures.push('学生列表顶部不应再展示按学号/按拼音排序，占用首屏空间。');
}
if (viewSource.includes('当前可见 {visibleStudents.length} 人')) {
  failures.push('学生多选态不应再额外展示当前可见人数提示，避免顶部信息过重。');
}

requireText(viewSource, 'isAllVisibleSelected', '多选态应根据当前可见学生判断是否已经全选。');
requireText(viewSource, 'containerClassName="flex min-h-11 items-center"', '紧凑搜索框的整体可点区域应保持44像素高度。');
requireText(viewSource, "isAllVisibleSelected ? '取消全选' : '全选'", '全选按钮应只在已全选后变为取消全选。');
requireText(viewSource, 'bg-white/92', '学生工具栏应使用柔和白色玻璃背景融入页面。');
requireText(searchInputSource, "'h-9 rounded-full border-[var(--tm-border-subtle)] pl-9 pr-3 text-[13px] [box-shadow:var(--tm-shadow-control)]'", '紧凑搜索框应使用白色表面、轻阴影与紧凑尺寸。');
requireText(searchInputSource, 'outline-none', '公共搜索框不应显示浏览器默认轮廓。');
requireText(viewSource, 'min-h-11 shrink-0', '多选工具按钮应使用不低于44像素的触控区域。');
requireText(viewSource, 'inline-flex h-8 items-center justify-center rounded-full', '全选和反选的可见胶囊高度应保持32像素，不应与44像素触控区等大。');
requireText(viewSource, 'flex h-9 w-9 items-center justify-center rounded-full', '多选态搜索按钮的可见圆形应保持36像素。');
requireText(viewSource, 'flex h-8 w-10 items-center justify-center rounded-full', '性别批量选择的可见胶囊高度应保持32像素。');
if (viewSource.includes('bg-[#FFD43B]') || viewSource.includes('bg-amber-400')) {
  failures.push('学生工具栏主按钮不应继续使用高饱和黄色，应改为更贴合页面的中性色方案。');
}

requireText(viewSource, 'groupPlans', '分组视图应维护分组方案列表。');
requireText(viewSource, 'activeGroupPlan', '分组视图应有当前分组方案。');
requireText(viewSource, 'showGroupPlanSheet', '点击分组方案应打开底部抽屉。');
requireText(viewSource, 'currentTeacherName: string;', '班级详情应接收当前教师姓名以判断编辑权限。');
requireText(appSource, 'currentTeacherName={teacherProfile.name}', 'App 应把当前教师身份传给分组页。');
requireText(appSource, 'onGroupingEditorChange={setIsClassGroupingEditorOpen}', '进入分组编辑时应通知应用外壳隐藏全局录入条。');
requireText(viewSource, 'title="切换分组"', '底部抽屉应使用老师可理解的“切换分组”。');
requireText(viewSource, '新建另一套分组', '切换抽屉应提供新建另一套分组入口。');
requireText(viewSource, 'plan.ownerName', '每套分组应展示创建老师。');
requireText(viewSource, 'isActiveGroupPlanOwnedByCurrentTeacher', '只有创建老师可以进入分组调整。');
requireText(viewSource, 'handleStartFirstGrouping', '无分组时应直接开始逐组选择，不要求名称。');
requireText(viewSource, 'handleStartNewGrouping', '新增另一套分组时应先命名再开始选择。');
requireText(viewSource, 'handleToggleDraftStudent', '分组编辑应支持直接点选学生进组。');
requireText(viewSource, 'handleAddDraftGroup', '分组编辑应按需添加小组，不预设总组数。');
requireText(viewSource, 'draftMembershipByStudentId', '编辑时应保留全班学生位置并标记已有归组。');
requireText(viewSource, 'draftVisibleStudents.map((student, index)', '分组编辑网格应固定使用完整学生顺序。');
requireText(viewSource, 'MobileBottomSheet', '分组浮层应复用教师端公共底部抽屉。');
if (viewSource.includes('Math.random')) {
  failures.push('分组创建不得随机安排学生。');
}
requireText(viewSource, 'groupSelectionIds', '分组多选状态应与学生多选状态隔离。');
requireText(viewSource, 'handleOpenGroupPlanActions', '本人创建的整套分组应通过切换抽屉的更多操作管理。');
requireText(viewSource, "plan.ownerName !== currentTeacherName", '其他老师的分组必须禁止管理操作。');
requireText(viewSource, '删除这套分组', '本人分组的更多操作应提供删除整套分组。');
requireText(viewSource, 'handleConfirmDeleteGroupPlan', '删除整套分组应有完整状态收口。');
requireText(viewSource, 'handleConfirmDeleteDraftGroup', '调整页应支持删除当前小组。');
requireText(viewSource, 'groupEditor.groups.length <= 1', '每套分组必须至少保留一个小组。');
requireText(viewSource, 'group.id !== deleteDraftGroupTarget.id', '删除小组时应只移除当前小组，使原成员回到未分组。');
requireText(viewSource, "name: `第${index + 1}组`", '删除中间小组后应自动连续编号，不保留缺号。');
requireText(viewSource, '组内${deleteDraftGroupTarget?.memberIds.length || 0}名学生将变为未分组', '删除小组的确认抽屉应告知成员去向。');
requireText(viewSource, 'showDiscardGroupingConfirm', '新建分组中返回应确认放弃，避免误丢内容。');
requireText(viewSource, '<MobileConfirmSheet', '删除与放弃创建应复用公共危险操作确认抽屉。');

if (viewSource.includes('业务分组样式写入基础组件')) {
  failures.push('分组业务逻辑不应侵入基础组件。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('ClassDetailView grouping assertions passed');
