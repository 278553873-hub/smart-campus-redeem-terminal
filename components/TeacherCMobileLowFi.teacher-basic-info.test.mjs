import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');

const requireText = (text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

const forbidText = (text, message) => {
  if (source.includes(text)) throw new Error(message);
};

const pageStart = source.indexOf("if (page === 'teacherBasicInfoPersonal' || page === 'teacherBasicInfoSchool')");
const pageEnd = source.indexOf("if (page === 'mineSettings')", pageStart);
const pageBlock = source.slice(pageStart, pageEnd);

if (pageStart < 0 || pageEnd < 0) {
  throw new Error('应存在 15A/15B 基本信息设置页面实现。');
}

const requirePageText = (text, message) => {
  if (!pageBlock.includes(text)) throw new Error(message);
};

const forbidPageText = (text, message) => {
  if (pageBlock.includes(text)) throw new Error(message);
};

requireText("| 'teacherBasicInfoPersonal'", '应存在 15A 个人版页面 key。');
requireText("| 'teacherBasicInfoSchool'", '应存在 15B 学校版页面 key。');
requireText("'teacherBasicInfoPersonal',", '15A 应加入页面顺序。');
requireText("'teacherBasicInfoSchool',", '15B 应加入页面顺序。');
requireText("if (pageKey === 'teacherBasicInfoPersonal') return '15A';", '个人版基本信息设置编号应为 15A。');
requireText("if (pageKey === 'teacherBasicInfoSchool') return '15B';", '学校版基本信息设置编号应为 15B。');
requireText("teacherBasicInfoPersonal: {", '应存在 15A 元信息。');
requireText("title: '基本信息设置（个人版）'", '15A 标题应标明个人版。');
requireText("modules: ['头像', '姓名', '任教班级', '部门设置']", '15A 应保留头像、姓名、任教班级、部门设置。');
requireText("normal: '个人版展示头像、姓名、任教班级和部门设置。'", '15A 状态说明应体现任教班级配置。');
requireText("teacherBasicInfoSchool: {", '应存在 15B 元信息。');
requireText("title: '基本信息设置（学校版）'", '15B 标题应标明学校版。');
requireText("modules: ['头像', '姓名', '任教班级', '带班班级', '分管年级', '部门设置']", '15B 应保留完整学校版配置。');
requireText("{ title: '我的(个人版)', pages: ['minePersonal', 'teacherBasicInfoPersonal'] }", '页面导图应拆出我的(个人版)：14A 到 15A。');
requireText("{ title: '我的(学校版)', pages: ['mineSchool', 'teacherBasicInfoSchool', 'mineSettings', 'subjectManagement', 'departmentManagement', 'coinIssuanceManagement'] }", '页面导图应拆出我的(学校版)：14B 到 15B/16/18/19/21。');
requireText('<PageNodeButton item="teacherBasicInfoPersonal" lane={lane.title} />', '页面导图应展示 15A 节点。');
requireText('<PageNodeButton item="teacherBasicInfoSchool" lane={lane.title} />', '页面导图应展示 15B 节点。');
requireText("onClick={() => navigate(hasMultipleVersions ? 'teacherBasicInfoSchool' : 'teacherBasicInfoPersonal')}", '14A/14B 头像入口应分别进入 15A/15B。');

requireText("setShowTeachingSheet(true)", '15B 应复用任教班级底部弹窗。');
requireText("aria-label=\"配置任教信息\"", '任教班级配置弹窗应保留可访问语义。');
requireText("const classOptions = Array.from({ length: 12 }).map((_, index) => `${teachingGrade}${index + 1}班`);", '任教班级弹窗应提供完整班级名称。');
requireText("选择学科", '任教班级弹窗应在下方选择学科。');
requireText("grid h-[280px] min-h-0 grid-cols-[92px_1fr]", '任教班级弹窗年级/班级选择区应有固定高度以支持内部滚动。');
requireText("min-h-0 overflow-y-auto overscroll-contain border-r border-gray-200 bg-gray-100 p-2 touch-pan-y", '任教班级弹窗左侧年级应可上下滑动。');
requireText("min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain pr-1 touch-pan-y", '任教班级弹窗右侧班级应可上下滑动。');
requireText('暂不选择', '任教班级和配置项弹窗应提供暂不选择弱操作。');
requireText('const [teachingInfoRows, setTeachingInfoRows] = useState<TeachingInfoRow[]>([', '任教班级应使用真实数组数据，而不是只用数量模拟。');
requireText("{ id: 1, subject: '英语', classes: ['2025级1班', '2025级2班'] }", '任教班级默认应展示完整班级名称。');
requireText('setTeachingInfoRows((rows) => [', '新增任教班级应追加真实条目。');
requireText('setTeachingInfoRows((rows) => rows.length > 1 ? rows.filter((_, rowIndex) => rowIndex !== index) : rows);', '删除任教班级应删除对应条目且至少保留一条。');
requireText('const renderTeacherBasicConfigSheet = () => {', '配置项应复用底部浮层编辑。');
requireText("title: '选择带班班级'", '15B 带班班级应可打开选择弹窗。');
requireText("title: '选择分管年级'", '15B 分管年级应可打开选择弹窗。');
requireText("title: '部门设置'", '15A/15B 部门设置应可打开选择弹窗。');
requireText("className={cx('flex min-h-14 w-full shrink-0 items-center justify-center rounded-2xl border border-gray-200 text-sm font-black'", '配置项弹窗保存按钮应固定足够高度，不被选项列表挤压。');

requirePageText('const isPersonalBasicInfo = page === \'teacherBasicInfoPersonal\';', '页面实现应识别 15A 个人版。');
requirePageText("...(!isPersonalBasicInfo ? [", '15A 应移除学校版专属配置项。');
requirePageText("{ key: 'headClass' as const, label: '带班班级', value: teacherBasicConfigValues.headClass }", '带班班级应只作为 15B 配置项存在。');
requirePageText("{ key: 'gradeLeader' as const, label: '分管年级', value: teacherBasicConfigValues.gradeLeader }", '分管年级应只作为 15B 配置项存在。');
requirePageText("{ key: 'department' as const, label: '部门设置', value: teacherBasicConfigValues.department }", '15A/15B 都应展示部门设置。');
requirePageText('aria-label="新增任教班级"', '15A/15B 任教班级应提供新增入口。');
requirePageText('teachingInfoRows.map((item, index)', '15A/15B 任教班级应根据真实数组渲染多条信息。');
requirePageText('onClick={() => removeTeachingRow(index)}', '15A/15B 任教班级每条信息应可删除。');
requirePageText('openTeacherBasicConfigSheet(row.key)', '配置项行应可点击编辑。');
requirePageText("item.classes.join('、')", '15B 任教班级应展示完整班级名称。');
requirePageText('value: teacherBasicConfigValues.department', '部门设置应展示可编辑状态中的部门值。');
requirePageText('divide-y divide-gray-100', '低保真页面应使用轻分隔线组织列表项。');
requireText('rounded-t-[28px]', '配置相关编辑应使用底部浮层弹窗体系。');

forbidPageText('低保真原型', '15A/15B 页面不应展示低保真说明标签，避免占用空间。');
forbidPageText('border-dashed', '15A/15B 页面不应使用大量虚线边框，避免视觉压力过大。');
forbidPageText('shadow-[0_10px_28px', '15A/15B 页面不应使用卡片阴影堆叠。');
forbidPageText('aria-label={`修改任教班级${index + 1}`}', '已有任教班级只保留删除入口，不应展示编辑按钮。');
forbidPageText('aria-label={`编辑任教班级${index + 1}`}', '已有任教班级只保留删除入口，不应整行进入编辑。');
forbidPageText('<Pencil', '15A/15B 页面不应引用未导入的 Pencil 图标，避免点击导图后白屏。');
forbidPageText('onClick={openTeachingSheet}', '15A/15B 页面不应引用不存在的 openTeachingSheet，避免点击导图后白屏。');
forbidText("modules: ['头像', '姓名', '任教信息', '任教班级', '任教学科', '部门']", '15A/15B 元信息不应保留旧字段。');
forbidText("if (pageKey === 'teacherBasicInfo') return '15';", '不应保留旧的单 15 编号。');
forbidText('<PageNodeButton item="teacherBasicInfo" lane={lane.title} />', '页面导图不应保留旧单 15 节点。');

console.log('TeacherCMobileLowFi 15A/15B 基本信息设置低保真测试通过');
