import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const viewSource = read('./ClassDetailView.tsx');
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
requireText(constantsSource, '语文方案', 'Mock 分组方案应包含语文方案。');
requireText(constantsSource, '数学方案', 'Mock 分组方案应包含数学方案。');
requireText(constantsSource, '英语-阅读', 'Mock 分组方案应包含英语阅读类方案。');

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
requireText(viewSource, 'selection-tools-next-to-cancel', '多选态全选和性别按钮应紧挨取消按钮。');

requireText(viewSource, 'selection-tools-next-to-cancel ml-auto', '多选态全选/性别/取消操作组应右对齐，与学生卡片右边缘对齐。');
requireText(viewSource, 'searchQuery', '学生全量展示应提供搜索状态。');
requireText(viewSource, 'normalizedSearchQuery', '搜索应统一按去空格后的关键字匹配。');
requireText(viewSource, 'student.studentNo', '搜索应支持按学号匹配。');
requireText(viewSource, 'student.name.includes', '搜索应支持按姓名匹配。');
requireText(viewSource, 'visibleStudents', '多选和全选应基于当前可见学生列表。');
requireText(viewSource, 'selectionGenderFilter', '学生多选态应支持按性别筛选。');
requireText(viewSource, "selectionGenderFilter === 'male'", '学生多选态应提供男生筛选。');
requireText(viewSource, "selectionGenderFilter === 'female'", '学生多选态应提供女生筛选。');
requireText(viewSource, 'handleSelectAllVisibleStudents', '学生多选态应提供全选当前可见学生。');
requireText(viewSource, 'handleClearVisibleStudents', '学生多选态应提供取消全选当前可见学生。');
requireText(viewSource, '全选', '学生多选工具栏应展示全选操作。');
requireText(viewSource, '取消全选', '学生多选工具栏应展示取消全选操作。');
requireText(viewSource, "isSelectionMode ? '取消' : '多选'", '学生视图多选入口文案应精简为“多选”。');
if (viewSource.includes('多选学生')) {
  failures.push('学生视图多选入口不应再显示“多选学生”，应显示“多选”。');
}

requireText(viewSource, 'student-action-row', '学生搜索框与多选入口应放在同一行，减少顶部占高。');
requireText(viewSource, 'h-9 w-full rounded-full', '学生搜索框高度应压缩，优先释放学生卡片首屏空间。');
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
requireText(viewSource, "isSelectionMode ? 'w-10 flex-none opacity-70' : 'min-w-0 flex-1 opacity-100'", '进入多选后搜索框应丝滑压缩，而不是继续占据主要空间。');
requireText(viewSource, 'transition-all duration-300 ease-out', '搜索框压缩应具备平滑过渡微交互。');
requireText(viewSource, 'pointer-events-none', '多选态搜索框压缩后不应继续作为主要输入入口。');

requireText(viewSource, 'handleRestoreSearchMode', '多选态点击压缩搜索按钮应恢复初始搜索状态。');
requireText(viewSource, 'aria-label={isSelectionMode ? "恢复搜索" : "搜索学生"}', '压缩搜索按钮应有明确的无障碍名称。');
requireText(viewSource, 'onClick={handleRestoreSearchMode}', '压缩搜索按钮点击后应退出多选并恢复搜索栏。');
requireText(viewSource, "isAllVisibleSelected ? '取消全选' : '全选'", '全选按钮应只在已全选后变为取消全选。');
requireText(viewSource, 'bg-white/92', '学生工具栏应使用柔和白色玻璃背景融入页面。');
requireText(viewSource, 'bg-white pl-9 pr-3', '搜索框应使用白底加轻阴影的真实产品方案，避免原型感灰底。');
requireText(viewSource, 'shadow-[var(--tm-shadow-control)] outline-none', '搜索框应使用教师端控件阴影 Token。');
requireText(viewSource, 'border border-[var(--tm-border-subtle)] bg-white text-[var(--tm-text-primary)]', '多选按钮应使用白底中性方案，避免黑色重按钮。');
if (viewSource.includes('bg-[#FFD43B]') || viewSource.includes('bg-amber-400')) {
  failures.push('学生工具栏主按钮不应继续使用高饱和黄色，应改为更贴合页面的中性色方案。');
}

requireText(viewSource, 'groupPlans', '分组视图应维护分组方案列表。');
requireText(viewSource, 'activeGroupPlan', '分组视图应有当前分组方案。');
requireText(viewSource, 'showGroupPlanSheet', '点击分组方案应打开底部抽屉。');
requireText(viewSource, '分组方案', '底部抽屉标题应为分组方案。');
requireText(viewSource, '添加分组方案', '底部抽屉应提供添加分组方案入口。');
requireText(viewSource, 'handleCreateGroupPlan', '应支持会话内创建分组方案。');
requireText(viewSource, 'handleCreateGroup', '应支持在具体方案下新建分组。');
requireText(viewSource, '+ 新增分组', '分组视图应提供当前方案下新增分组入口。');
requireText(viewSource, '多选分组', '分组视图应提供多选分组入口。');
requireText(viewSource, 'groupSelectionIds', '分组多选状态应与学生多选状态隔离。');

if (viewSource.includes('业务分组样式写入基础组件')) {
  failures.push('分组业务逻辑不应侵入基础组件。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('ClassDetailView grouping assertions passed');
