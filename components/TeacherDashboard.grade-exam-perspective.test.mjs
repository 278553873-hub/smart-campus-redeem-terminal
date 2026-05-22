import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');
const pcAdminCss = fs.readFileSync(new URL('../styles/pc-admin.css', import.meta.url), 'utf8');

const requireText = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const requireCss = (needle, message) => {
  if (!pcAdminCss.includes(needle)) throw new Error(message);
};

const forbidText = (needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

requireText("gradeListViewMode", '考试数据应新增列表视角状态。');
requireText('班级视角', '考试数据应提供班级视角标签。');
requireText('考试视角', '考试数据应提供考试视角标签。');
requireText('GradeExamAggregateRow', '考试视角应定义聚合行类型。');
requireText('handleViewGradeExamAggregate', '考试视角应有独立的聚合查看入口。');
requireText("gradePageMode === 'examView'", '考试聚合详情应使用独立只读页面模式。');
requireText('demoGradeExamSubjects', '考试视角 demo 应定义统一的 10 个科目。');
requireText('gradeLevelOptions.flatMap', '考试视角 demo 应覆盖新增考试中的所有年级。');
requireText('getClassOptionsByLevel(level).map', '考试视角 demo 应覆盖新增考试中的所有班级。');
requireText("type: '期末'", '考试视角 demo 应聚合为期末考试。');

forbidText('考试视角按学年-学期和考试类型聚合', '不应展示显而易见的考试视角说明。');
forbidText('一个年级一个表格', '不应展示显而易见的年级表格说明。');
forbidText('请核对是否与本次考试应考科目一致', '不应展示冗余核对提示。');
forbidText('已录入科目', '考试详情不应展示已录入科目统计说明。');
forbidText('覆盖班级', '考试详情不应展示覆盖班级统计说明。');
forbidText('当前已录入数据无空成绩格', '考试详情不应展示空成绩格完成提示。');
forbidText('整体录入完成进度', '考试视角不应展示跨年级整体录入完成进度。');

requireText('录入进度：', '新建/编辑考试应在进度条左侧展示录入进度文案。');
requireText("pr-0 pb-8 overflow-x-auto", '成绩表横向滚动区域应与进度/提示左对齐，并预留底部空间。');
requireText("bg-[#165DFF] px-4 text-sm font-normal text-white", '快捷操作按钮应使用主按钮样式，不使用浅色按钮。');
forbidText("rounded border border-[#E5E6EB] bg-[#F7F8FA] px-3 py-2", '快捷操作不应使用额外浅色卡片底色。');

requireText('ml-[132px] border-collapse', '成绩表应在考试成绩区块内对齐到右侧内容列。');
requireText('w-[120px] shrink-0 text-right text-sm font-medium', '录入进度和快捷操作应复用 120px 右对齐标签列和一致字号。');
requireText('left-5 top-[60px] flex min-h-8', '考试成绩提示信息应与区块标题左侧对齐。');
requireText('ml-3 h-8 rounded border-0 bg-[#165DFF] px-4', '快捷操作按钮应与录入进度内容列左侧对齐。');
requireText('填充本班学生姓名', '快捷操作按钮文案应改为填充本班学生姓名。');
requireText('mb-4 ml-[132px] max-w-[calc(100%-132px)] overflow-x-auto', '班级 Sheet 应限制在内容区内横向滚动，避免超出卡片。');
requireText('flex w-max min-w-full items-center gap-2 rounded border border-[#E5E6EB] bg-[#F7F8FA] p-1', '班级 Sheet 应改为容器内分段切换样式。');
requireText('if (!activeGradeClassSheet)', '班级选择新增非首个班级时不应自动切换当前 Sheet。');

requireText('w-[420px] shrink-0 overflow-hidden rounded-full', '录入进度条应使用中宽度样式，避免在宽屏下过长。');
requireText('{completedGradeStudentCount}/{totalGradeStudentCount}名学生', '录入进度文案应简化为 x/y名学生。');
forbidText('考试录入核查', '考试视角查看详情区块标题应为考试成绩。');
forbidText('成绩导出：', '班级视角查看考试不应再展示成绩导出标签列。');
forbidText('导出 Excel', '导出操作文案应统一为导出excel。');
forbidText('>其他</th>', '成绩统计不应再展示其他列。');
forbidText('>总人数</th>', '成绩统计不应再展示总人数列。');
requireText('gradeScoreStatisticColumns', '成绩统计列应按实际录入等级动态生成。');
requireText('handleExportGradeLevelExcel', '考试视角每个年级应提供独立导出能力。');
requireText('导出excel', '查看考试导出入口应使用下载图标加中文文案。');
requireText('exportGradeScoreExcel', '成绩导出应使用 Excel 文件生成逻辑。');
requireText('application/vnd.ms-excel', '成绩导出应使用 Excel MIME 类型，而不是 CSV。');
requireText('.xls', '成绩导出文件扩展名应为 Excel 格式。');
forbidText('.csv', '成绩导出文件不应再使用 CSV 扩展名。');
forbidText('text/csv', '成绩导出不应再使用 CSV MIME 类型。');
requireText('absolute right-5 top-4 flex h-8 items-center', '班级视角查看考试导出入口应放在考试成绩板块右上角。');
requireText("onClick={() => handleExportGradeLevelExcel(level, rows)}", '考试视角年级标题右侧应绑定该年级导出。');

requireText('w-[60px] whitespace-nowrap', '考试成绩表序号列表头和单元格应禁止换行。');
requireText('gradeClassFilters', '班级视角应新增班级多选筛选状态。');
requireText('gradeSubjectFilters', '班级视角应新增科目多选筛选状态。');
requireText('Cascader', '班级筛选应使用 Arco Cascader。');
requireText('全部班级', '班级视角筛选区应提供全部班级占位。');
requireText('全部科目', '班级视角筛选区应提供全部科目占位。');
requireText('gradeClassFilters.length > 0 && !gradeClassFilters.includes(row.className)', '班级视角列表应按多选班级过滤。');
requireText('gradeSubjectFilters.length > 0 && !gradeSubjectFilters.some(subject => row.subjects.includes(subject))', '班级视角列表应按多选科目过滤。');
requireText('checkedStrategy="child"', '班级 Cascader 应按 Arco checkedStrategy child 只回传班级叶子节点。');
requireText('ArcoSelect', '科目筛选应使用 Arco Select。');
requireText('allowClear', 'Arco 筛选器应支持 allowClear 清空。');
requireText('mode="multiple"', '班级和科目筛选应使用多选模式。');

requireText('gradeClassTableColumns', '考试数据班级视角列表应使用 Arco Table columns。');
requireText('gradeExamAggregateTableColumns', '考试数据考试视角列表应使用 Arco Table columns。');
requireText("columns={gradeListViewMode === 'class' ? gradeClassTableColumns : gradeExamAggregateTableColumns}", '考试数据列表应使用 Arco Table 渲染。');
requireText('className="pc-filter-bar mb-6 flex flex-wrap items-center gap-3"', '考试数据筛选区应使用统一 pc-filter-bar 默认态。');
requireText("value={gradeTermFilter === '全部学期' ? undefined : gradeTermFilter}", '考试数据学期筛选不应把全部学期作为真实选中值。');
requireText("value={gradeExamTypeFilter === '全部类型' ? undefined : gradeExamTypeFilter}", '考试数据类型筛选不应把全部类型作为真实选中值。');
requireText('<Input\n                                                value={gradeCreatorSearch}', '考试数据创建人筛选应使用 Arco Input。');
requireText('<Button type="primary" onClick={() => {}}>查询</Button>', '考试数据查询按钮应使用 Arco 主按钮。');
requireText('<Button type="primary" onClick={openGradeCreatePage}>', '考试数据新建考试应使用 Arco 主按钮。');

const examListSectionStart = source.indexOf("{/* 考试数据 */}");
const examListSectionEnd = source.indexOf('aria-label="返回考试数据列表"', examListSectionStart);
const examListSection = examListSectionStart >= 0 && examListSectionEnd > examListSectionStart
  ? source.slice(examListSectionStart, examListSectionEnd)
  : '';
if (examListSection.includes('<select')) {
  throw new Error('考试数据列表筛选区不应继续使用原生 select。');
}
if (examListSection.includes('<input')) {
  throw new Error('考试数据列表筛选区不应继续使用原生 input。');
}

requireText('<Button type="primary" onClick={openGradeCreatePage}>新建考试</Button>', '考试数据新建考试按钮应只展示文案，不显示加号。');
forbidText("<Plus size={14} />\n                                                    新建考试", '考试数据新建考试按钮不应保留加号图标。');
requireCss('.arco-cascader-multiple .arco-input-tag-inner', '级联多选应有统一单行回显规则。');
requireCss('flex-wrap: nowrap !important;', '级联多选 Tag 不应换行撑高控件。');
requireCss('.arco-cascader-multiple .arco-input-tag-tag-ellipsis', '级联多选数量汇总 Tag 应保持同一行。');
requireCss('.arco-cascader-multiple .arco-input-tag-has-placeholder .arco-input-tag-input', '空值态 placeholder 不应被单行规则压缩。');
requireText('className="!px-0" onClick={() => handleViewGradeExam(row)}>查看</Button>', '考试数据操作列文字按钮应去掉默认横向内边距。');
