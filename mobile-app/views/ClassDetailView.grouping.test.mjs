import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const viewSource = read('./ClassDetailView.tsx');
const bottomSheetSource = read('../components/ui/MobileBottomSheet.tsx');
const searchInputSource = read('../components/ui/MobileSearchInput.tsx');
const compactSelectSource = read('../components/student/StudentCompactSelectItem.tsx');
const compactSelectGridSource = read('../components/student/StudentCompactSelectGrid.tsx');
const groupPerformanceSource = read('../components/group/GroupPerformanceMeta.tsx');
const groupPerformanceDomainSource = read('../domain/groupPerformance.ts');
const typesSource = read('../types.ts');
const constantsSource = read('../constants.ts');
const groupAvatarCatalogSource = read('../assets/groupAvatarCatalog.ts');
const teacherMobileTokensSource = read('../styles/teacherMobileTokens.ts');
const appSource = read('../App.tsx');
const teacherMobileGuidelines = read('../../design-system/teacher-mobile/TEACHER_MOBILE_UI_GUIDELINES.md');

const failures = [];
const requireText = (source, text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText(typesSource, 'StudentGroup', '类型层应定义学生分组 StudentGroup。');
requireText(typesSource, 'GroupPlan', '类型层应定义分组方案 GroupPlan。');
requireText(typesSource, 'memberIds: string[];', '分组应保存学生 ID 列表，避免复制学生业务数据。');
requireText(typesSource, 'avatarKey?: StudentGroupAvatarKey;', '小组应保存可替换的系统头像标识。');
requireText(constantsSource, 'GET_MOCK_GROUP_PLANS_FOR_CLASS', 'Mock 数据应提供按班级生成分组方案的方法。');
requireText(constantsSource, '): GroupPlan[] => [];', 'Mock 数据不应预置任何分组方案，应从首次分组开始体验。');
if (constantsSource.includes("name: '常用分组'") || constantsSource.includes("name: '阅读分组'") || constantsSource.includes("name: '数学互助分组'")) {
  failures.push('Mock 数据不应注入预置分组方案。');
}
requireText(groupAvatarCatalogSource, 'studentGroupAvatarOptions', '小组头像应由独立资源目录统一管理。');
requireText(groupAvatarCatalogSource, 'getAvailableStudentGroupAvatarKey', '新增小组应优先分配当前方案未使用的头像。');
const groupAvatarImports = groupAvatarCatalogSource.match(/resources\/group-avatars\/[a-z-]+\.png/g) ?? [];
if (groupAvatarImports.length !== 16 || new Set(groupAvatarImports).size !== 16) {
  failures.push('正式小组头像目录应完整接入16张不重复图片。');
}

requireText(viewSource, "activeView, setActiveView] = useState<'student' | 'group'>('student')", '班级详情页应支持学生/分组双视图切换。');

requireText(viewSource, 'class-detail-titlebar-switcher', '班级详情页应把学生/分组切换放入标题栏。');
requireText(viewSource, 'onBack?: () => void;', '班级详情页应接管返回按钮，避免 App 额外显示班级标题。');
requireText(viewSource, "aria-label={recountTarget ? '退出重新计数' : '返回班级列表'}", '班级详情标题栏应保留返回入口，并在重新计数时明确退出当前任务。');
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
requireText(viewSource, 'activeStudentSelectionIds.size === studentsByGender.male.length', '男生快捷按钮只有在当前任务恰好全选男生时才可高亮。');
requireText(viewSource, 'activeStudentSelectionIds.size === studentsByGender.female.length', '女生快捷按钮只有在当前任务恰好全选女生时才可高亮。');
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
requireText(viewSource, "active ? '取消' : '多选'", '共享多选按钮应保留取消操作。');
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
if (viewSource.includes('按学号') || viewSource.includes('按拼音') || viewSource.includes('sortMode')) {
  failures.push('学生列表顶部不应再展示按学号/按拼音排序，占用首屏空间。');
}
if (viewSource.includes('当前可见 {visibleStudents.length} 人')) {
  failures.push('学生多选态不应再额外展示当前可见人数提示，避免顶部信息过重。');
}

requireText(viewSource, 'isAllVisibleSelected', '多选态应根据当前可见学生判断是否已经全选。');
requireText(viewSource, 'containerClassName="flex min-h-11 items-center"', '紧凑搜索框的整体可点区域应保持44像素高度。');
requireText(viewSource, "isAllVisibleSelected ? '取消全选' : '全选'", '全选按钮应只在已全选后变为取消全选。');
requireText(viewSource, 'class-detail-tab-toolbar sticky top-0 z-10 shrink-0 bg-[var(--tm-bg-surface)] px-4 py-1', '学生与分组应共享52像素高的不透明白色工具栏。');
requireText(viewSource, '<ClassDetailTabToolbar rowClassName="student-action-row gap-1.5">', '学生 Tab 应复用班级详情公共工具栏。');
requireText(viewSource, '<ClassDetailTabToolbar rowClassName="justify-between gap-2">', '分组 Tab 应复用班级详情公共工具栏。');
requireText(viewSource, 'const ClassDetailMultiSelectButton', '学生与分组应共享同一多选按钮组件。');
requireText(viewSource, "active ? 'text-[var(--tm-text-secondary)]' : 'text-[var(--tm-text-primary)]'", '多选与取消状态应在两个 Tab 使用一致的文字颜色。');
requireText(viewSource, 'handleOpenStudentGroupDetail', '具体小组卡片应支持直接打开成员详情。');
requireText(viewSource, ': handleOpenStudentGroupDetail(group.id)', '普通态点击具体小组应直接查看成员。');
requireText(viewSource, ': `查看${group.name}`', '小组卡片的读屏文案应表达查看预期。');
if (viewSource.includes('disabled={!isGroupSelectionMode && !isActiveGroupPlanOwnedByCurrentTeacher}')) {
  failures.push('其他老师的小组卡片也应允许查看成员，不得禁用。');
}
requireText(viewSource, 'groupDetailMode, setGroupDetailMode', '小组详情应在同一弹窗维护查看与调整状态。');
requireText(viewSource, "useState<'view' | 'adjust' | 'settings'>('view')", '小组详情应在同一弹窗维护查看、调整和设置状态。');
requireText(viewSource, "groupDetailMode === 'settings' ? '小组设置' : '小组详情'", '小组详情、调整与设置应复用同一个高底部弹窗。');
const groupDetailSheet = viewSource.match(/<MobileBottomSheet\n\s+open=\{Boolean\(groupDetailTarget\)\}[\s\S]*?<\/MobileBottomSheet>/)?.[0] || '';
requireText(viewSource, 'groupDetailMembers?.map((student, index)', '小组详情应直接展示全部成员。');
requireText(viewSource, 'onClick={() => handleOpenGroupMemberStudent(student)}', '小组详情中的学生卡应可继续进入学生详情。');
requireText(groupDetailSheet, '{isActiveGroupPlanOwnedByCurrentTeacher && (', '编辑入口应只在本人方案的小组详情查看态出现。');
requireText(groupDetailSheet, 'onClick={handleStartEditStudentGroup}', '头像与组名旁应提供轻量编辑入口。');
requireText(groupDetailSheet, 'aria-label="编辑小组信息"', '小组信息编辑入口应提供明确的读屏名称。');
requireText(groupDetailSheet, 'text-[var(--tm-text-secondary)] active:text-[var(--tm-text-primary)]', '小组编辑入口应使用中性色，不得与底部品牌主按钮争抢。');
requireText(groupDetailSheet, 'text-[length:var(--tm-font-size-meta)] font-semibold text-[var(--tm-text-secondary)]', '小组人数应使用600字重的次级文字。');
if (groupDetailSheet.includes('<GroupPerformanceMeta')) failures.push('小组详情不应重复展示小组加分和减分次数。');
requireText(groupDetailSheet, 'onClick={handleRequestDissolveStudentGroup}', '小组详情信息带应直接提供解散入口。');
requireText(groupDetailSheet, 'aria-label="解散小组"', '小组解散入口应提供明确的读屏名称。');
requireText(groupDetailSheet, 'onClick={handleStartAdjustStudentGroup}', '详情底部应直接提供唯一的调整学生主操作。');
if (viewSource.includes('aria-label="更多小组操作"')) failures.push('小组详情不得继续展示更多操作入口。');
requireText(viewSource, 'aria-label="返回小组详情"', '调整学生时应能在同一弹窗返回成员详情。');
requireText(viewSource, 'handleSaveStudentGroupSettings', '小组设置应一次保存头像与组名。');
requireText(viewSource, 'studentGroupAvatarOptions.map', '小组设置应展示系统预设头像。');
const dissolveEntryCount = groupDetailSheet.match(/onClick=\{handleRequestDissolveStudentGroup\}/g)?.length || 0;
if (dissolveEntryCount !== 1) failures.push('小组详情应只在信息带展示一次解散入口，小组设置不得重复。');
if (viewSource.includes('groupActionTarget')) failures.push('小组详情不得继续叠加更多操作弹窗。');
requireText(viewSource, 'getGroupMemberSummary', '小组卡片应集中生成简洁的成员摘要。');
requireText(viewSource, 'members.slice(0, 3)', '小组卡片成员摘要最多展示前三名学生。');
requireText(viewSource, '等${members.length}名学生', '人数较多时应按“姓名等总人数”展示。');
requireText(viewSource, 'text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{getGroupMemberSummary(members)}', '小组卡片成员摘要应使用500字重。');
requireText(viewSource, '<img src={avatar.src}', '小组卡片应展示正式图片头像，不再使用线性占位图标。');
requireText(viewSource, "size === 'sheet' ? 'h-14 w-14' : 'h-11 w-11'", '小组卡片中的系统头像应保持44×44像素。');
requireText(viewSource, 'studentGroupAvatarOptions.map', '小组设置应展示完整的系统预设头像目录。');
requireText(viewSource, 'getAvailableStudentGroupAvatarKey(', '新增小组应避免与当前方案已有头像重复。');
if (viewSource.includes('handleEditActiveGrouping') || viewSource.includes('调整分组')) failures.push('顶部不得继续保留整套调整分组入口或旧文案。');
if (viewSource.includes('min-h-[60px]')) failures.push('分组工具栏不得继续使用60像素高度。');
requireText(searchInputSource, "appearance?: 'outlined' | 'filled';", '公共搜索框应支持描边与填充两种外观。');
requireText(searchInputSource, "'border-[var(--tm-border-subtle)] [box-shadow:var(--tm-shadow-control)]'", '紧凑搜索框默认应保留白色表面、浅边界和轻阴影。');
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
requireText(viewSource, 'title="切换分组方案"', '分组方案切换弹窗应使用明确的完整标题。');
requireText(viewSource, 'flex min-h-11 min-w-0 flex-1 items-center', '当前分组应使用左对齐的单行轻量下拉入口。');
requireText(viewSource, 'text-[length:var(--tm-font-size-body)] font-medium', '当前分组应使用正文字号，不应伪装成页面标题。');
if (viewSource.includes('max-w-[80%] items-center justify-center gap-1.5 px-3 text-[length:var(--tm-font-size-section-title)]')) {
  failures.push('当前分组不得继续使用居中的板块标题样式。');
}
if (viewSource.includes('{activeGroupPlan.ownerName}创建')) {
  failures.push('分组主页不得显示创建老师，创建人信息只在切换抽屉披露。');
}
requireText(viewSource, '新建另一套分组', '切换抽屉应提供新建另一套分组入口。');
requireText(viewSource, 'onClick={groupPlans.length > 0 ? handleStartNewGrouping : handleStartFirstGrouping}', '班级已有任意分组方案时，新建入口都应先进入方案命名。');
requireText(viewSource, "{groupPlans.length > 0 ? '新建另一套分组' : '开始分组'}", '已有其他老师方案时也应明确显示“新建另一套分组”。');
if (viewSource.includes('groupPlans.some(plan => plan.ownerName === currentTeacherName) ? handleStartNewGrouping')) {
  failures.push('是否需要方案命名应由班级是否已有方案决定，不能只判断当前老师是否已有方案。');
}
const createNamedGroupingSheet = viewSource.match(/<MobileBottomSheet open=\{showNewGroupNameSheet\}[\s\S]*?<\/MobileBottomSheet>/)?.[0] || '';
requireText(createNamedGroupingSheet, '分组方案名称', '新建另一套分组时应明确填写用于切换识别的方案名称。');
requireText(createNamedGroupingSheet, 'aria-label="分组方案名称"', '分组方案名称输入框应提供一致的读屏名称。');
requireText(createNamedGroupingSheet, 'placeholder="例如：数学分组"', '分组方案名称应使用数学分组作为简洁示例。');
requireText(createNamedGroupingSheet, '第一个小组名称', '新建另一套分组时应同时定义第一个小组名称。');
requireText(createNamedGroupingSheet, 'aria-label="第一个小组名称"', '第一个小组名称输入框应提供一致的读屏名称。');
requireText(createNamedGroupingSheet, 'placeholder="例如：数学1组"', '第一个小组名称应与方案名称示例保持同一学科语境。');
if (createNamedGroupingSheet.includes('用于在不同分组之间切换')) {
  failures.push('新建另一套分组弹窗不应展示额外的方案用途说明。');
}
requireText(createNamedGroupingSheet, 'maxLength={20}', '方案名称应限制为可在切换列表清晰展示的长度。');
requireText(createNamedGroupingSheet, 'disabled={!newGroupName.trim() || !newStudentGroupName.trim()}', '两个名称均填写完整后才可选择学生。');
requireText(createNamedGroupingSheet, '>选择学生</button>', '填写名称后的主按钮应直接说明下一步任务。');
requireText(createNamedGroupingSheet, 'onClose={handleCloseNewGroupingDetails}', '新方案名称弹窗应使用统一关闭收口。');
requireText(createNamedGroupingSheet, 'footerDivider={false}', '新方案名称弹窗底部不应增加横线。');
requireText(viewSource, 'plan.ownerName', '每套分组应展示创建老师。');
requireText(viewSource, 'text-[length:var(--tm-font-size-meta)] font-medium text-[var(--tm-text-secondary)]">{plan.ownerName}创建', '分组方案切换列表的元信息应使用500字重。');
requireText(viewSource, '<EditIcon className="h-5 w-5 text-[var(--tm-action-icon-neutral)]" />', '重命名使用主文字色时应搭配次级灰图标。');
requireText(viewSource, '<DeleteIcon className="h-5 w-5 text-[var(--tm-action-icon-danger)]" />', '删除分组方案应使用负向图标 Token。');
requireText(teacherMobileTokensSource, "'--tm-action-icon-neutral': teacherActionSemantic.iconNeutral", '普通操作图标应使用统一中性 Token。');
requireText(teacherMobileTokensSource, "'--tm-action-icon-brand': teacherActionSemantic.iconBrand", '品牌操作图标应使用统一品牌 Token。');
requireText(teacherMobileTokensSource, "'--tm-action-icon-danger': teacherActionSemantic.iconDanger", '危险操作图标应使用统一负向 Token。');
requireText(viewSource, 'isActiveGroupPlanOwnedByCurrentTeacher', '小组权限应统一继承当前分组方案的创建人。');
requireText(viewSource, 'hasActiveStudentGroups', '分组缺省态应以当前是否存在实际小组判断，不应只判断方案对象。');
requireText(viewSource, 'activeGroupPlan && hasActiveStudentGroups ? (', '当前方案不存在小组时应回到统一缺省态。');
requireText(viewSource, 'handleStartFirstGrouping', '无分组时应提供统一的开始分组入口。');
const startFirstGroupingHandler = viewSource.match(/const handleStartFirstGrouping = \(\) => \{[\s\S]*?\n    \};/)?.[0] || '';
requireText(startFirstGroupingHandler, "name: '常用分组'", '首次分组应在内部创建默认的常用分组方案。');
requireText(startFirstGroupingHandler, "setAddStudentGroupStep('name')", '点击开始分组后应先进入小组名称步骤。');
requireText(startFirstGroupingHandler, 'setShowNewStudentGroupNameSheet(true)', '点击开始分组后应复用添加小组弹窗。');
if (startFirstGroupingHandler.includes("setGroupEditor({ mode: 'create'")) {
  failures.push('首次分组不应跳转到专属全屏编辑页。');
}
requireText(viewSource, 'handleStartNewGrouping', '新增另一套分组时应先命名再开始选择。');
const createNamedGroupingHandler = viewSource.match(/const handleCreateNamedGrouping = \(\) => \{[\s\S]*?\n    \};/)?.[0] || '';
requireText(createNamedGroupingHandler, 'const groupName = newStudentGroupName.trim();', '新方案应同时读取第一个小组名称。');
requireText(createNamedGroupingHandler, "setGroupEditor({ mode: 'create', planId, name, groups })", '新方案应建立独立的创建草稿。');
requireText(createNamedGroupingHandler, "setAddStudentGroupStep('members')", '名称填写完成后应直接复用选人步骤。');
requireText(createNamedGroupingHandler, 'setShowNewStudentGroupNameSheet(true)', '新方案应进入公共选人弹窗。');
requireText(viewSource, 'handleToggleDraftStudent', '分组编辑应支持直接点选学生进组。');
requireText(viewSource, 'handleStartAddStudentGroup', '小组列表末尾应提供独立的添加小组入口。');
const addStudentGroupButtonClass = viewSource.match(/onClick=\{handleStartAddStudentGroup\}[\s\S]*?className="([^"]+)"/)?.[1] || '';
if (!addStudentGroupButtonClass || addStudentGroupButtonClass.includes('border')) {
  failures.push('添加小组入口应依靠白色表面建立层级，不得使用四周线条描边。');
}
requireText(teacherMobileGuidelines, '### 2.5 边界与分隔', '教师手机端规范应独立定义边界与分隔规则。');
requireText(teacherMobileGuidelines, '禁止使用纯黑、近黑、深灰或其他高对比线条', '教师手机端规范应明确禁止高对比四周线框。');
requireText(viewSource, 'showNewStudentGroupNameSheet', '添加小组应先通过底部抽屉填写名称。');
requireText(viewSource, 'handleConfirmStudentGroupName', '填写小组名称后应进入学生选择流程。');
const addStudentGroupSheet = viewSource.match(/<MobileBottomSheet\n\s+open=\{showNewStudentGroupNameSheet\}[\s\S]*?<\/MobileBottomSheet>/)?.[0] || '';
requireText(addStudentGroupSheet, '>选择学生</button>', '首次分组和添加小组的名称步骤应使用明确的“选择学生”主按钮。');
requireText(addStudentGroupSheet, 'placeholder="例如：语文1组"', '首次分组和添加小组应使用语文1组作为小组名称示例。');
requireText(viewSource, "addStudentGroupStep, setAddStudentGroupStep] = useState<'name' | 'members'>('name')", '添加小组应在同一弹窗内维护名称和选人两步状态。');
requireText(viewSource, 'setAddStudentGroupStep(\'members\')', '填写小组名称后应在同一弹窗切换到选人步骤。');
requireText(viewSource, 'aria-label="返回上一步"', '添加小组选人步骤应允许返回修改名称。');
requireText(viewSource, "groups: groupEditor.groups.map((group, index) => index === 0 ? { ...group, name: groupName } : group)", '修改小组名称时应保留已选择的学生。');
requireText(viewSource, 'handleCloseStudentGroupNameSheet', '从名称步骤关闭时应收口放弃添加流程。');
const closeStudentGroupSheetHandler = viewSource.match(/const handleCloseStudentGroupNameSheet = \(\) => \{[\s\S]*?\n    \};/)?.[0] || '';
requireText(closeStudentGroupSheetHandler, 'setGroupEditor(null)', '关闭添加小组弹窗时应直接清理本次草稿。');
requireText(closeStudentGroupSheetHandler, "if (groupEditor?.mode === 'create')", '关闭整套分组创建流程时应识别未保存的新方案草稿。');
requireText(closeStudentGroupSheetHandler, 'setShowDiscardGroupingConfirm(true)', '关闭整套分组创建流程时应避免误丢已选学生。');
if (viewSource.includes('放弃本次添加？')) {
  failures.push('关闭添加小组弹窗时不应再出现二次确认。');
}
requireText(viewSource, "size={addStudentGroupStep === 'members' ? 'tall' : 'content'}", '选人步骤应切换为高底部抽屉。');
requireText(bottomSheetSource, "size?: 'content' | 'tall' | 'full';", '公共底部抽屉应提供稳定的高抽屉与近全屏规格。');
requireText(bottomSheetSource, "size === 'tall' ? 'h-[86%] max-h-[86%]'", '高底部抽屉应使用稳定高度承载学生选择。');
requireText(bottomSheetSource, "size === 'full' ? 'h-[94%] max-h-[94%]'", '近全屏底部抽屉应提高高频编辑区的可视范围。');
requireText(bottomSheetSource, 'overflow-hidden rounded-t-[var(--tm-radius-sheet)]', '公共底部抽屉应裁切滚动内容，避免卡片穿出弹窗圆角。');
requireText(bottomSheetSource, 'relative z-20 shrink-0 bg-[var(--tm-bg-surface)]', '公共底部抽屉标题区应稳定覆盖滚动内容。');
requireText(bottomSheetSource, 'relative z-0 isolate min-h-0 flex-1 overflow-y-auto overscroll-contain [clip-path:inset(0)]', '公共底部抽屉正文应使用独立低层级滚动容器，并裁切越界的列表内容。');
requireText(bottomSheetSource, 'relative z-20 shrink-0 bg-[var(--tm-bg-surface-glass)]', '公共底部抽屉底部操作区应稳定覆盖滚动内容。');
requireText(viewSource, "contentTone={addStudentGroupStep === 'members' ? 'plain' : 'surface'}", '选人步骤应使用浅灰内容底承载紧凑学生选择项。');
requireText(bottomSheetSource, "contentTone?: 'surface' | 'plain';", '公共底部抽屉应提供语义化内容底色。');
requireText(viewSource, 'sticky top-0 z-20 -mx-3 bg-[var(--tm-bg-surface)] px-3 py-2', '选人步骤的搜索工具条应覆盖滚动学生卡并使用横向铺满的白色矩形底。');
const selectionSearchBars = viewSource.match(/<div className="sticky top-0 z-20 -mx-3 bg-\[var\(--tm-bg-surface\)\] px-3 py-2">[\s\S]*?<\/div>/g) || [];
if (selectionSearchBars.length < 2 || selectionSearchBars.some(searchBar => searchBar.includes('<OnlyUngroupedFilter'))) {
  failures.push('添加和调整学生时，仅看未分组与人数都不得继续放在白色搜索操作区内。');
}
requireText(viewSource, 'appearance="filled"', '选人步骤的搜索框应使用无边框填充样式。');
const filledSearchUsages = viewSource.match(/appearance="filled"/g)?.length || 0;
if (filledSearchUsages < 2) failures.push('学生 Tab 与添加小组选人弹窗应统一使用无边框填充搜索框。');
if (viewSource.includes('aria-label="搜索学生"\n                            density="compact"\n                            appearance="filled"\n                            fillTone="surface"')) {
  failures.push('学生 Tab 应由整条工具栏承载白色分区，搜索输入框自身继续使用浅灰填充。');
}
requireText(searchInputSource, "'bg-[var(--tm-bg-surface)]' : 'bg-[var(--tm-bg-surface-soft)]'", '填充搜索框应支持白色与浅灰两种语义底色。');
requireText(compactSelectGridSource, 'student-compact-select-grid grid grid-cols-5 gap-x-1 gap-y-2', '分组选人应使用一行5人的紧凑网格。');
requireText(compactSelectSource, 'min-h-[76px]', '紧凑学生选择项应保持稳定高度和有效触控范围。');
requireText(compactSelectSource, 'h-12 w-12', '紧凑学生选择项应使用48像素真实头像。');
requireText(compactSelectSource, 'text-[12px] font-medium', '紧凑学生姓名应使用12像素、500字重。');
requireText(compactSelectSource, 'bg-[var(--tm-bg-surface-muted)] font-mono text-[8px]', '所有学生姓名前应显示灰底两位班内号。');
if (compactSelectSource.includes('duplicateRosterNumber')) failures.push('学生头像上不得再按同名条件显示01、02数字角标。');
if (compactSelectSource.includes('StudentPerformance') || compactSelectSource.includes('praiseCount') || compactSelectSource.includes('criticismCount')) {
  failures.push('紧凑学生选择项不得展示等级、成长进度或表扬批评信息。');
}
requireText(viewSource, 'footerDivider={false}', '添加小组弹窗底部操作区不应显示顶部分隔线。');
requireText(bottomSheetSource, 'footerDivider?: boolean;', '公共底部抽屉应支持按场景关闭底部分隔线。');
requireText(bottomSheetSource, 'footerDivider = false', '公共底部抽屉的按钮区应默认不显示顶部分隔线。');
requireText(bottomSheetSource, '[border-top-width:var(--tm-sheet-footer-divider-width)]', '公共底部抽屉分隔线宽度必须由组件 Token 控制。');
requireText(teacherMobileTokensSource, "'--tm-sheet-footer-divider-width': '0px'", '底部弹窗按钮区分隔线 Token 应固定为0像素。');
requireText(viewSource, 'title="重命名分组" onClose={() => setRenameGroupPlanTarget(null)} footerDivider={false}', '重命名分组弹窗的保存按钮上方不得显示横线。');
requireText(teacherMobileGuidelines, '`--tm-sheet-footer-divider-width` 固定为 `0px`', '教师手机端规范应明确底部弹窗按钮区不使用顶部横线。');
requireText(viewSource, "mode: 'add-group'", '添加小组应使用独立编辑模式，避免侵入调整分组。');
requireText(viewSource, 'const OnlyUngroupedFilter', '添加和调整小组应复用“仅看未分组”筛选组件。');
requireText(addStudentGroupSheet, "groupEditor?.mode === 'add-group' && (", '仅添加现有方案的小组时才应展示“仅看未分组”。');
requireText(addStudentGroupSheet, "const assignedGroup = groupEditor?.mode === 'add-group'", '新方案选人不得读取当前方案的学生归属。');
requireText(addStudentGroupSheet, "return assignedGroup ? `当前在${assignedGroup.name}` : '未分组';", '添加小组时应向紧凑学生选择项传入归组信息。');
requireText(compactSelectSource, "${selectionDescription ? `，${selectionDescription}` : ''}", '紧凑学生选择项应通过读屏名称保留归组信息。');
requireText(viewSource, 'type="checkbox"', '仅看未分组应使用符合筛选语义的复选框。');
requireText(viewSource, '{checked && (', '“仅看未分组”人数应只在筛选开启时显示。');
requireText(viewSource, '>{ungroupedCount}人</span>', '筛选开启时应在筛选行显示未分组人数。');
if (viewSource.includes('totalCount={activeStudents.length}')) failures.push('筛选关闭时不应在筛选行重复显示全部人数。');
if (viewSource.includes('`全班${totalCount}人`')) failures.push('人数统计不得增加“全班”等额外口径文案。');
requireText(viewSource, 'addGroupShowOnlyUngrouped, setAddGroupShowOnlyUngrouped] = useState(true)', '添加小组默认应只看未分组学生。');
requireText(viewSource, 'adjustStudentGroupShowOnlyUngrouped, setAdjustStudentGroupShowOnlyUngrouped] = useState(true)', '调整小组默认应只看未分组学生和当前成员。');
requireText(viewSource, 'addGroupUngroupedStudentIds', '添加小组应识别当前方案中的未分组学生。');
requireText(viewSource, "groupEditor?.mode === 'add-group' && addGroupShowOnlyUngrouped", '添加小组只应在筛选开启时收敛候选范围。');
requireText(viewSource, '&& !isSelected) return false;', '添加小组筛选开启后仍应持续展示当前已选学生。');
requireText(viewSource, 'activeGroupMembershipByStudentId', '调整学生应识别每名学生当前所属小组。');
requireText(viewSource, 'assignedGroup?.id === groupDetailTarget?.id || adjustStudentGroupMemberIds.has(student.id)', '调整学生时应持续展示当前小组成员和本次已选学生。');
requireText(viewSource, 'setStudentSelectionMoveNotice(`${student.name}将从${assignedGroup.name}移入`)', '勾选其他小组学生后应通过短时轻提示说明移动来源。');
requireText(viewSource, '<MobileActionToast message={studentSelectionMoveNotice} />', '跨组移动提示应出现在选人弹窗底部主操作上方。');
requireText(viewSource, 'addGroupMovedStudentCount', '添加小组应计算本次跨组移动人数。');
requireText(viewSource, 'adjustStudentGroupMovedStudentCount', '调整学生应计算本次跨组移动人数。');
requireText(viewSource, '，含移动${addGroupMovedStudentCount}人', '添加小组的完成按钮应同时披露总人数和跨组移动人数。');
requireText(viewSource, '，含移动${adjustStudentGroupMovedStudentCount}人', '调整学生的保存按钮应同时披露总人数和跨组移动人数。');
requireText(viewSource, 'MobileToast message={groupingToastMessage}', '跨组移动保存后应复用公共轻提示反馈结果。');
requireText(viewSource, 'setGroupingToastMessage(`${movedStudentCount}名学生已从原小组移入`)', '跨组移动成功提示应只保留移动结果。');
if (viewSource.includes('已添加小组，${movedStudentCount}') || viewSource.includes('已保存，${movedStudentCount}')) {
  failures.push('跨组移动成功提示不应重复说明已添加或已保存。');
}
if (viewSource.includes('确认移动') || viewSource.includes('showMoveStudentConfirm')) {
  failures.push('跨组移动是可恢复操作，不应增加阻断式二次确认。');
}
requireText(viewSource, 'handleSaveAdjustStudentGroup', '调整学生应保存到当前具体小组。');
requireText(viewSource, 'handleSaveStudentGroupSettings', '小组设置应同时保存当前小组的名称和头像。');
requireText(viewSource, '? { ...group, name, avatarKey: studentGroupAvatarKey }', '小组设置不得影响其他小组。');
requireText(viewSource, "relative aspect-square min-w-0 overflow-hidden rounded-[var(--tm-radius-inner)] border-2 bg-[var(--tm-bg-surface-soft)]", '小组头像选择应复用学生系统头像的方形图片规格。');
requireText(viewSource, "border-[var(--tm-brand-primary)] ring-2 ring-[var(--tm-brand-primary-soft-strong)]", '小组头像选中态应复用学生系统头像的品牌边框和轻外环。');
requireText(viewSource, 'absolute bottom-1 right-1 flex h-6 w-6 items-center justify-center rounded-full border-2 border-white bg-[var(--tm-brand-primary)]', '小组头像选中态应复用学生系统头像右下角的实心勾选角标。');
if (viewSource.includes("${selected ? 'bg-[var(--tm-brand-primary-soft)]'")) {
  failures.push('小组头像选中态不应使用整块浅粉背景。');
}
if (viewSource.includes('>{preset.label}</span>')) {
  failures.push('小组头像选择不应展示图片名称，名称只用于无障碍标签。');
}
const studentGroupNameInput = viewSource.split('\n').find(line => line.includes('aria-label="小组名称"')) || '';
requireText(studentGroupNameInput, 'border-[var(--tm-input-border)]', '小组名称输入框应使用统一输入框边界 Token。');
if (studentGroupNameInput.includes('focus:border-[var(--tm-brand-primary)]') || studentGroupNameInput.includes('focus:ring-')) {
  failures.push('小组名称输入框聚焦时不应切换为品牌红边框。');
}
requireText(teacherMobileGuidelines, '头像选择不展示图片名称等可见说明', '教师手机端规范应明确小组头像不展示文字说明。');
requireText(teacherMobileGuidelines, '小组名称输入框聚焦时继续保持默认极浅边框', '教师手机端规范应明确小组名称输入框不使用红色聚焦边框。');
requireText(viewSource, 'disabled={!draftActiveGroup?.memberIds.length}', '添加小组至少选择一名学生后才可完成。');
requireText(viewSource, 'memberIds: group.memberIds.filter(studentId => !nextMemberIds.has(studentId))', '添加小组时应先从原小组移除被选中的学生。');
requireText(viewSource, 'memberIds: group.memberIds.filter(studentId => !memberIdSet.has(studentId))', '调整小组时应先从其他小组移除被选中的学生。');
requireText(viewSource, 'nextGroup,', '完成添加后应把新小组追加到当前分组。');
if (viewSource.includes('renderGroupEditor') || viewSource.includes("groupEditor && groupEditor.mode !== 'add-group'")) {
  failures.push('新建整套分组不得再进入旧的全屏编辑页。');
}
if (viewSource.includes('handleAddDraftGroup')) {
  failures.push('调整分组页不应继续承担新增小组。');
}
requireText(viewSource, 'visibleStudents.filter(student => !membershipByStudentId.has(student.id))', '取消筛选后应先按花名册顺序展示未分组学生。');
requireText(viewSource, "sections.push({ id: 'ungrouped', label: '未分组'", '取消筛选后应提供明确的未分组分区。');
requireText(viewSource, 'sections.push({ id: group.id, label: group.name', '取消筛选后应按具体小组名称继续分区。');
requireText(viewSource, "import StudentCompactSelectGrid, { type StudentCompactSelectSection } from '../components/student/StudentCompactSelectGrid'", '添加与调整选人应复用通用层紧凑学生选择网格。');
const compactSelectGridUsages = viewSource.match(/<StudentCompactSelectGrid/g)?.length || 0;
if (compactSelectGridUsages !== 2) failures.push('紧凑学生选择网格应只用于添加小组和调整学生两个选人状态。');
requireText(viewSource, 'const StudentRosterCard', '学生列表与小组详情应继续复用完整花名册卡片。');
const rosterCardUsages = viewSource.match(/<StudentRosterCard\s/g)?.length || 0;
if (rosterCardUsages !== 2) failures.push('完整花名册卡片只应用于班级学生列表和小组详情，不得重新侵入选人状态。');
if (addStudentGroupSheet.includes('<StudentRosterCard')) failures.push('添加小组选人状态不得重新使用完整花名册卡片。');
requireText(viewSource, '<GroupPerformanceMeta', '小组列表卡片应展示小组正负向评价次数。');
requireText(viewSource, 'showPraiseCount={groupCardDisplaySettings.showPraiseCount}', '小组列表和详情应继承加分次数显示设置。');
requireText(viewSource, 'showCriticismCount={groupCardDisplaySettings.showCriticismCount}', '小组列表和详情应继承扣分次数显示设置。');
requireText(viewSource, 'orientation="vertical"', '小组列表评价次数应使用竖排。');
requireText(viewSource, 'className="w-6 shrink-0"', '小组列表评价次数应使用24像素窄列。');
if (viewSource.includes('ChevronRightIcon')) failures.push('小组卡片整卡可点击，不应继续显示右侧箭头。');
requireText(viewSource, 'min-h-[76px]', '去掉等级后应收紧小组卡片高度。');
requireText(groupPerformanceSource, '<StudentPerformanceCounts', '小组表现应复用正负向评价次数色片。');
if (groupPerformanceSource.includes('StudentPerformanceLevelIcons')) failures.push('小组表现不得展示学生等级图标。');
if (groupPerformanceDomainSource.includes('netScore')) failures.push('小组表现数据不应继续包含等级分值。');
requireText(groupPerformanceDomainSource, 'if (record.groupId !== groupId) return summary;', '小组表现只应汇总直接指向该小组的原始评价事件。');
if (groupPerformanceDomainSource.includes('memberIds')) failures.push('小组表现汇总不得依赖当前成员名单。');
requireText(viewSource, '<StudentPerformanceAvatar', '共享学生卡应展示带进度环的学生头像。');
requireText(viewSource, '<StudentPerformanceCounts', '共享学生卡应展示表扬与批评次数。');
requireText(viewSource, 'displaySettings={studentCardDisplaySettings}', '小组详情共享学生卡应继承当前班级的显示设置。');
requireText(teacherMobileGuidelines, '统一复用通用层的紧凑学生选择项', '教师手机端规范应明确分组选人使用独立紧凑组件。');
requireText(teacherMobileGuidelines, '`仅看未分组 / 人数`整行移入其下浅灰滚动内容区', '教师手机端规范应明确筛选行与学生项共用浅灰底。');
requireText(teacherMobileGuidelines, '取消筛选后，筛选行不显示人数，人数分别由`未分组 → 当前方案内各小组`分区标题承载', '教师手机端规范应明确取消筛选后的数量展示与分区顺序。');
requireText(teacherMobileGuidelines, '取消勾选后按原顺序展示全班，允许直接选择其他小组学生', '教师手机端规范应明确跨组移动的渐进披露方式。');
requireText(teacherMobileGuidelines, '首次进入和解散最后一个小组后必须共用同一个', '教师手机端规范应明确统一分组缺省态。');
requireText(teacherMobileGuidelines, '先填写小组名称，再选择学生', '教师手机端规范应明确首次分组的两步流程。');
requireText(teacherMobileGuidelines, '主按钮统一使用明确动作`选择学生`', '教师手机端规范应统一名称步骤的主按钮文案。');
requireText(teacherMobileGuidelines, '同时填写`分组方案名称`和`第一个小组名称`', '教师手机端规范应明确新方案首弹窗的两个名称。');
requireText(teacherMobileGuidelines, '选人步骤不展示“仅看未分组”筛选', '教师手机端规范应明确新方案归组与当前方案相互独立。');
requireText(teacherMobileGuidelines, '主要任务是直接查看全部成员，不先展示操作菜单', '教师手机端规范应明确小组卡片先进入成员详情。');
requireText(teacherMobileGuidelines, '本人和其他老师创建的分组都可查看成员', '教师手机端规范应明确只读方案仍可查看成员。');
requireText(teacherMobileGuidelines, '在同一个高底部弹窗内切换为选人状态', '教师手机端规范应明确详情与调整复用同一个弹窗。');
requireText(teacherMobileGuidelines, '底部只保留唯一实心主操作`调整学生`', '教师手机端规范应明确详情查看态的操作层级。');
requireText(teacherMobileGuidelines, '在当前高底部弹窗内切换为`小组设置`', '教师手机端规范应明确设置不再叠加普通弹窗。');
requireText(teacherMobileGuidelines, '编辑图标和文字使用次级中性色', '教师手机端规范应明确编辑入口不使用品牌色。');
requireText(teacherMobileGuidelines, '人数使用600字重的次级文字', '教师手机端规范应明确小组人数的字重。');
requireText(teacherMobileGuidelines, '头像与组名右侧并列展示轻量`编辑 / 解散`', '教师手机端规范应明确详情层直接展示解散入口。');
requireText(teacherMobileGuidelines, '危险确认是唯一允许叠加在小组详情上的临时决策浮层', '教师手机端规范应明确危险确认是弹窗叠加的唯一例外。');
requireText(teacherMobileGuidelines, '只统计评价对象明确为该小组 ID 的原始评价事件', '教师手机端规范应明确小组表现数据口径。');
requireText(teacherMobileGuidelines, '不因学生移入、移出、调整或解散而回算历史', '教师手机端规范应明确成员变化不影响小组历史表现。');
requireText(teacherMobileGuidelines, '小组只在分组列表卡片展示正向次数和负向次数，不展示等级', '教师手机端规范应明确小组次数只在列表展示且不展示等级。');
requireText(teacherMobileGuidelines, '正向次数在上、负向次数在下', '教师手机端规范应明确列表卡片的评价次数竖排顺序。');
requireText(viewSource, 'MobileBottomSheet', '分组浮层应复用教师端公共底部抽屉。');
if (viewSource.includes('Math.random')) {
  failures.push('分组创建不得随机安排学生。');
}
requireText(viewSource, 'groupSelectionIds', '分组多选状态应与学生多选状态隔离。');
requireText(viewSource, 'handleOpenGroupPlanActions', '本人创建的整套分组应通过切换抽屉的更多操作管理。');
requireText(viewSource, "plan.ownerName !== currentTeacherName", '其他老师的分组必须禁止管理操作。');
requireText(viewSource, '删除这套分组', '本人分组的更多操作应提供删除整套分组。');
requireText(viewSource, 'handleConfirmDeleteGroupPlan', '删除整套分组应有完整状态收口。');
requireText(viewSource, 'handleConfirmDissolveStudentGroup', '小组操作应支持解散当前小组。');
requireText(viewSource, 'plan.groups.filter(group => group.id !== dissolveStudentGroupTarget.id)', '解散时应只移除当前小组并保留分组方案。');
requireText(viewSource, '组内${dissolveStudentGroupTarget?.memberIds.length || 0}名学生将变为未分组，学生信息不会删除。', '解散确认应明确学生去向和数据影响。');
requireText(viewSource, 'showDiscardGroupingConfirm', '新建分组中返回应确认放弃，避免误丢内容。');
requireText(viewSource, '<MobileConfirmSheet', '删除与放弃创建应复用公共危险操作确认抽屉。');

if (viewSource.includes('业务分组样式写入基础组件')) {
  failures.push('分组业务逻辑不应侵入基础组件。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('ClassDetailView grouping assertions passed');
