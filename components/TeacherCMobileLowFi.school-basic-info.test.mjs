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

forbidText("| 'profileEdit'", '教师端页面枚举不应再包含 15 个人信息页。');
forbidText("if (pageKey === 'profileEdit') return '15';", '15 不应再是个人信息页。');
requireText("| 'termManagement'", '教师端页面枚举应新增学期管理页。');
requireText("| 'subjectManagement'", '教师端页面枚举应新增科目管理页。');
requireText("| 'departmentManagement'", '教师端页面枚举应新增部门管理页。');
requireText("if (pageKey === 'termManagement') return '15';", '学期管理页应编号为 15。');
requireText("if (pageKey === 'subjectManagement') return '16';", '科目管理页应编号为 16。');
requireText("if (pageKey === 'departmentManagement') return '17';", '部门管理页应编号为 17。');
requireText("pages: ['minePersonal', 'mineSchool', 'termManagement', 'subjectManagement', 'departmentManagement', 'schoolUsageReport']", '我的流程应包含 14A、14B、学校基础信息管理页和学校数据报表页。');
requireText('<div className="grid shrink-0 grid-rows-2 gap-2">\n                  <PageNodeButton item="minePersonal" lane={lane.title} />\n                  <PageNodeButton item="mineSchool" lane={lane.title} />\n                </div>', '页面导航图应上下平行展示 14A 和 14B。');
requireText('<PageNodeButton item="termManagement" lane={lane.title} />', '页面导航图应展示学期管理节点。');
requireText('<PageNodeButton item="subjectManagement" lane={lane.title} />', '页面导航图应展示科目管理节点。');
requireText('<PageNodeButton item="departmentManagement" lane={lane.title} />', '页面导航图应展示部门管理节点。');
requireText("'学校基础信息'", '我的学校版应展示学校基础信息入口。');
requireText("学校基础信息在 14A 和 14B 都展示", '学校基础信息入口应同时覆盖 14A 和 14B。');
requireText("openSchoolBasicInfo(item.key)", '我的页学校基础信息卡片应通过分类入口进入具体管理页。');
requireText("setActiveBasicInfoTab(tab)", '点击学期/科目/部门入口应先设置对应分类。');
requireText("term: 'termManagement'", '学期入口应直达 15 学期管理。');
requireText("subject: 'subjectManagement'", '科目入口应直达 16 科目管理。');
requireText("department: 'departmentManagement'", '部门入口应直达 17 部门管理。');
for (const icon of ['icon: CalendarDays', 'icon: BookOpen', 'icon: Building2']) {
  requireText(icon, `学校基础信息卡片应配置 ${icon} 图标。`);
}
requireText('className="rounded-3xl border border-gray-100 bg-white p-4 shadow-[0_10px_28px_rgba(15,23,42,0.06)]"', '学校基础信息应保留与教师信息、管理工具一致的卡片效果。');
requireText('className="mt-4 grid grid-cols-3 gap-2"', '学校基础信息应严格横向展示入口。');
requireText('className="flex min-h-[70px] flex-col items-center justify-center gap-2 rounded-2xl text-center active:bg-gray-100"', '学校基础信息入口应横向展示 icon + 文案。');
requireText('<Icon size={28} className="text-gray-700" />', '学校基础信息图标不应再有额外底色容器。');
requireText('<span className="text-xs font-black leading-4">{item.label}管理</span>', '学校基础信息入口应保留文案。');
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
forbidText('className={cx(\'h-10 rounded-xl border border-gray-200 text-xs font-black\', isCurrent ? \'bg-gray-100 text-gray-400\' : \'bg-gray-900 text-white\')}', '学期卡片上不应直接铺设设为当前按钮。');
forbidText('移动端只处理新增、改名、启停、排序', '原型页面不应出现移动端边界说明备注。');
forbidText('复杂批量维护到 PC 后台处理', '原型页面不应出现 PC 后台处理说明备注。');
forbidText('删除历史学期', '原型页面不应出现风险动作备注。');
forbidText('批量导入学生基础信息', '移动端基础信息页不应承载批量导入学生这类 PC 后台能力。');

console.log('TeacherCMobileLowFi 学校基础信息快捷维护结构测试通过');
