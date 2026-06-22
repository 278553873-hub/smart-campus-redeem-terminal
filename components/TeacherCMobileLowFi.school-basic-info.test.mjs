import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');

function requireText(text, message) {
  if (!source.includes(text)) {
    throw new Error(message);
  }
}

function forbidText(text, message) {
  if (source.includes(text)) {
    throw new Error(message);
  }
}

function requireBlockText(block, text, message) {
  if (!block.includes(text)) {
    throw new Error(message);
  }
}

function forbidBlockText(block, text, message) {
  if (block.includes(text)) {
    throw new Error(message);
  }
}

forbidText("| 'profileEdit'", '教师端页面枚举不应再包含 15 个人信息页。');
forbidText("if (pageKey === 'profileEdit') return '15';", '15 不应再是个人信息页。');
requireText("| 'termManagement'", '教师端页面枚举应新增学期管理页。');
requireText("| 'subjectManagement'", '教师端页面枚举应新增科目管理页。');
requireText("| 'departmentManagement'", '教师端页面枚举应新增部门管理页。');
requireText("if (pageKey === 'teacherBasicInfoPersonal') return '15A';", '个人版基本信息设置页应编号为 15A。');
requireText("if (pageKey === 'teacherBasicInfoSchool') return '15B';", '学校版基本信息设置页应编号为 15B。');
requireText("if (pageKey === 'mineSettings') return '16';", '设置页应编号为 16。');
requireText("if (pageKey === 'termManagement') return '17';", '学期管理页应编号为 17。');
requireText("if (pageKey === 'subjectManagement') return '18';", '科目管理页应编号为 18。');
requireText("if (pageKey === 'departmentManagement') return '19';", '部门管理页应编号为 19。');
requireText("pages: ['minePersonal', 'teacherBasicInfoPersonal']", '我的(个人版)流程应包含 14A 和 15A。');
requireText("pages: ['mineSchool', 'teacherBasicInfoSchool', 'mineSettings', 'termManagement', 'subjectManagement', 'departmentManagement', 'coinIssuanceManagement']", '我的(学校版)流程应包含 14B、15B、16、17、18、19、21。');
requireText('<PageNodeButton item="termManagement" lane={lane.title} />', '页面导航图应展示学期管理节点。');
requireText('<PageNodeButton item="subjectManagement" lane={lane.title} />', '页面导航图应展示科目管理节点。');
requireText('<PageNodeButton item="departmentManagement" lane={lane.title} />', '页面导航图应展示部门管理节点。');
forbidText('<div className="text-sm font-black">学校基础信息</div>', '原学校基础信息卡片标题应改为更多工具。');
requireText("'更多工具'", '我的页应展示更多工具入口。');
requireText("更多工具在 14A 和 14B 都展示", '更多工具入口应同时覆盖 14A 和 14B。');
requireText("onClick: () => openSchoolBasicInfo(item.key)", '我的页更多工具卡片应通过分类入口进入具体管理页。');
requireText("label: '货币发放', icon: Coins, onClick: () => navigate('coinIssuanceManagement')", '更多工具应新增货币发放管理入口。');
requireText("setActiveBasicInfoTab(tab)", '点击学期/科目/部门入口应先设置对应分类。');
requireText("term: 'termManagement'", '学期入口应直达 17 学期管理。');
requireText("subject: 'subjectManagement'", '科目入口应直达 18 科目管理。');
requireText("department: 'departmentManagement'", '部门入口应直达 19 部门管理。');
for (const icon of ['icon: CalendarDays', 'icon: BookOpen', 'icon: Building2']) {
  requireText(icon, `学校基础信息卡片应配置 ${icon} 图标。`);
}
requireText('className="rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"', '更多工具应保留轻卡片效果。');
requireText('className="mt-4 grid grid-cols-3 gap-2"', '更多工具应严格横向展示入口。');
requireText('className="flex min-h-[70px] flex-col items-center justify-center gap-2 rounded-2xl text-center active:bg-gray-100"', '更多工具入口应横向展示 icon + 文案。');
requireText('<Icon size={28} className="text-gray-700" />', '更多工具图标不应再有额外底色容器。');
requireText('<span className="text-xs font-black leading-4">{item.label}</span>', '更多工具入口应保留短文案。');
forbidText('className="flex min-h-[84px] flex-col justify-between rounded-2xl bg-white p-3 text-left active:bg-gray-100"', '学校基础信息不应再使用色块卡片样式。');
forbidText('className="mt-3 divide-y divide-white overflow-hidden rounded-2xl bg-white"', '学校基础信息不应使用纵向列表样式。');
forbidText('className="mt-3 grid grid-cols-3 gap-2 rounded-2xl bg-white px-2 py-3"', '学校基础信息不应在入口区域额外加背景色。');
forbidText('className="flex h-9 w-9 items-center justify-center rounded-xl bg-gray-50 text-gray-600"', '学校基础信息图标不应使用额外灰底。');
requireText("type SchoolBasicInfoTab = 'term' | 'subject' | 'department';", '快捷维护页应聚焦学期、科目、部门三个首期模块。');
requireText("const schoolBasicInfoTabs", '应有学期、科目、部门分段配置。');
requireText("const schoolTermItems", '学期管理应使用系统内置学期列表。');
requireText("schoolYear: '2025-2026学年'", '学期数据应拆分学年字段。');
requireText("schoolYear: '2026-2027学年'", '系统应内置 2026-2027 学年。');
requireText("termType: '下学期'", '学期数据应拆分学期类型字段。');
requireText("termType: '上学期'", '学期数据应支持上学期。');
requireText("const formatTermName", '列表展示应由学年和学期类型组合生成。');
requireText('学年', '新增/编辑学期弹窗应包含学年字段。');
requireText('学期类型', '新增/编辑学期弹窗应包含学期类型字段。');
requireText('设为当前学期', '新增/编辑学期弹窗应包含设为当前学期开关。');
requireText("const [currentTermId, setCurrentTermId] = useState('term-2025-2026-2');", '学期管理应支持设置当前学期。');
requireText("const [activeTermAction, setActiveTermAction] = useState<SchoolTermItem | null>(null);", '学期管理应通过单个操作菜单承载行操作。');
requireText("const [deletedTermIds, setDeletedTermIds] = useState<string[]>([]);", '学期管理应支持删除学期。');
requireText("onClick={() => openTermEditSheet()}", '学期管理应支持新增学期。');
requireText("openTermEditSheet(activeTermAction)", '学期操作菜单应支持编辑。');
requireText("setCurrentTermId(activeTermAction.id)", '学期操作菜单应支持设为当前。');
requireText("setDeletedTermIds((ids) => [...ids, activeTermAction.id])", '学期操作菜单应支持删除。');
requireText("setActiveTermAction(item)", '点击学期行应打开操作菜单。');
requireText("renderTermEditSheet()", '原型应挂载学期时间编辑弹窗。');
requireText("renderTermActionSheet()", '原型应挂载学期操作菜单。');
requireText("openBasicInfoEditSheet", '应通过底部弹窗做轻量编辑。');
requireText("renderSchoolBasicInfoEditSheet()", '原型应挂载基础信息编辑底部弹窗。');
const departmentMetaBlock = source.slice(source.indexOf('departmentManagement: {'), source.indexOf('coinIssuanceManagement: {'));
requireBlockText(departmentMetaBlock, "modules: ['部门列表', '新增部门', '修改部门名称', '删除部门']", '部门管理应只保留部门增删改能力。');
requireBlockText(departmentMetaBlock, "{ label: '删除部门', priority: 'P3', position: '列表行右侧 icon' }", '部门管理应在列表行右侧支持删除部门。');
forbidBlockText(departmentMetaBlock, '状态标签', '部门管理不应展示状态标签。');
forbidBlockText(departmentMetaBlock, '启用/停用', '部门管理不应提供启用或停用功能。');
const departmentPageBlock = source.slice(source.indexOf("if (page === 'departmentManagement')"), source.indexOf("if (page === 'advisor')"));
requireBlockText(departmentPageBlock, "const visibleDepartmentItems = schoolDepartmentItems.filter((item) => !deletedDepartmentIds.includes(item.id));", '部门管理应支持删除后隐藏部门。');
requireBlockText(departmentPageBlock, '新增部门', '部门管理页应提供新增部门入口。');
requireBlockText(departmentPageBlock, 'border border-dashed border-gray-300', '新增部门入口应以卡片形式放在部门列表最后。');
requireBlockText(departmentPageBlock, '<Plus size={16} />', '新增部门卡片应使用新增 icon。');
requireBlockText(departmentPageBlock, 'aria-label={`删除${item.name}`}', '部门删除操作应以列表行 icon 形式提供。');
requireBlockText(departmentPageBlock, '<Trash2 size={16} />', '部门删除操作应使用删除 icon。');
forbidBlockText(departmentPageBlock, 'className="h-9 rounded-xl border border-gray-200 bg-white px-3 text-xs font-black active:bg-gray-100"', '部门管理不应在顶部放新增按钮。');
forbidBlockText(departmentPageBlock, '<FormSectionTitle title={`${activeItems.length} 项`} />', '部门管理页不应统计有多少项。');
forbidBlockText(departmentPageBlock, '<BasicInfoStatusBadge status={item.status} />', '部门管理页不应展示启用/停用状态。');
forbidBlockText(departmentPageBlock, 'item.desc', '部门管理页不应展示部门下老师数量或说明。');
const departmentEditBlock = source.slice(source.indexOf('const isDepartment = activeBasicInfoTab ==='), source.indexOf('const renderSubjectEditSheet = () =>'));
forbidBlockText(departmentEditBlock, '删除部门', '部门编辑弹窗不应提供删除部门操作。');
forbidBlockText(departmentEditBlock, '启用', '基础信息编辑弹窗不应继续提供启用功能。');
forbidBlockText(departmentEditBlock, '停用', '基础信息编辑弹窗不应继续提供停用功能。');
forbidText('className={cx(\'h-10 rounded-xl border border-gray-200 text-xs font-black\', isCurrent ? \'bg-gray-100 text-gray-400\' : \'bg-gray-900 text-white\')}', '学期卡片上不应直接铺设设为当前按钮。');
forbidText('移动端只处理新增、改名、启停、排序', '原型页面不应出现移动端边界说明备注。');
forbidText('复杂批量维护到 PC 后台处理', '原型页面不应出现 PC 后台处理说明备注。');
forbidText('删除历史学期', '原型页面不应出现风险动作备注。');
forbidText('批量导入学生基础信息', '移动端基础信息页不应承载批量导入学生这类 PC 后台能力。');

console.log('TeacherCMobileLowFi 学校基础信息快捷维护结构测试通过');
