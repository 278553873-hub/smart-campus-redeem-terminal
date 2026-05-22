import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');
const pcAdminCss = fs.readFileSync(new URL('../styles/pc-admin.css', import.meta.url), 'utf8');
const guidelines = fs.readFileSync(new URL('../PC_UI_GUIDELINES.md', import.meta.url), 'utf8');
const homeworkSectionStart = source.indexOf("{/* 作业数据 */}");
const homeworkSectionEnd = source.indexOf("{/* 考试数据 */}", homeworkSectionStart);
const homeworkSection = homeworkSectionStart >= 0 && homeworkSectionEnd > homeworkSectionStart
  ? source.slice(homeworkSectionStart, homeworkSectionEnd)
  : '';

const requireText = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

const requireCss = (needle, message) => {
  if (!pcAdminCss.includes(needle)) throw new Error(message);
};

const requireGuideline = (needle, message) => {
  if (!guidelines.includes(needle)) throw new Error(message);
};

const forbidText = (needle, message) => {
  if (source.includes(needle)) throw new Error(message);
};

requireText("children: ['资料文件', '考试数据', '作业数据']", '数据中心应新增作业数据菜单。');
requireText("activeMenu === '考试数据' || activeMenu === '作业数据' || activeMenu === '设备基础配置'", '作业数据应复用 PC 数据页内容区边距。');
requireText("activeMenu === '作业数据'", '应渲染作业数据页面。');
requireText('Button, Cascader, DatePicker, Input, Select as ArcoSelect, Table', '作业数据列表页应使用 Arco 组件。');
requireText('<DatePicker', '作业日期筛选应使用 Arco DatePicker。');
requireText('<Cascader', '班级筛选应使用 Arco Cascader。');
requireText('<ArcoSelect', '科目筛选应使用 Arco Select。');
requireText('<Input', '录入人筛选应使用 Arco Input。');
requireText('<Table', '作业数据列表应使用 Arco Table。');
requireText('columns={homeworkTableColumns}', '作业数据表格应通过 columns 配置列。');
requireText("align: 'right' as const", '作业数据操作列应右对齐。');
requireText('border-t border-[#F2F3F5] mb-5 w-full', '作业数据筛选区和主操作区之间应有分割线。');
requireText('<Button type="primary" onClick={() => {}}>查询</Button>', '作业数据筛选区应包含查询主按钮。');
requireText('onClick={resetHomeworkListFilters}>重置</Button>', '作业数据筛选区应包含重置按钮。');
requireText('<Button type="primary" onClick={openHomeworkCreatePage}>新建作业记录</Button>', '新建作业记录应放在筛选分割线后的主操作区。');
requireText('className="pc-filter-bar mb-6 flex flex-wrap items-center gap-3"', '作业数据筛选区应使用统一 pc-filter-bar 默认态。');
requireCss('.pc-filter-bar .arco-picker,', '日期筛选默认态应在 pc-filter-bar 中统一覆盖。');
requireCss('.pc-filter-bar .arco-select-view,', '选择器默认态应在 pc-filter-bar 中统一覆盖。');
requireCss('.pc-filter-bar .arco-cascader-view,', '级联选择默认态应在 pc-filter-bar 中统一覆盖。');
requireCss('.pc-filter-bar .arco-input-inner-wrapper', '搜索框默认态应在 pc-filter-bar 中统一覆盖。');
requireCss('background: #fff !important;', '筛选控件默认态应保持白底。');
requireCss('border-color: #e5e6eb !important;', '筛选控件默认态应保持可见浅灰边框。');
requireCss('.arco-cascader-multiple .arco-input-tag-inner', '级联多选应有统一单行回显规则。');
requireCss('flex-wrap: nowrap !important;', '级联多选 Tag 不应换行撑高控件。');
requireCss('.arco-cascader-multiple .arco-input-tag-has-placeholder .arco-input-tag-input', '空值态 placeholder 不应被单行规则压缩。');
requireCss('width: 100%;', '空值态 placeholder 应保留完整展示宽度。');
requireGuideline('筛选控件默认态必须是白色背景 + 可见浅灰边框', 'PC UI 规范应明确筛选控件默认态。');
requireGuideline('同类列表页统一使用 `pc-filter-bar` 包裹筛选区', 'PC UI 规范应要求统一筛选区样式入口。');
requireText("value={homeworkSubjectFilter === '全部科目' ? undefined : homeworkSubjectFilter}", '科目筛选不应把全部科目作为真实选中值。');
requireText('HomeworkRecordRow', '应定义作业记录数据结构。');
requireText('homeworkStatusOptions', '作业完成情况应有独立状态枚举。');
requireText("['优', '良', '合格', '待合格', '未交']", '作业状态必须包含优、良、合格、待合格、未交。');
requireText('作业名称', '作业数据应支持可选作业名称。');
requireText('placeholder="例如：阅读理解"', '作业名称示例应体现可辅助识别知识掌握。');
requireText('newHomeworkName.trim() || \'-\'', '作业名称应允许不填写。');
requireText('homeworkSubjectFilter', '作业数据列表应支持科目筛选。');
requireText('newHomeworkSubject', '新建作业记录应选择科目。');
requireText('handleSaveHomeworkRecord', '应提供保存作业记录逻辑。');
requireText('handleFillHomeworkStudents', '应支持填充本班学生姓名。');
requireText('handleBatchSetHomeworkStatus', '应支持批量设置作业完成情况。');
requireText('homeworkStatusCounts', '查看页应展示各完成情况人数统计。');
requireText('暂无符合条件的作业记录', '列表空状态应针对作业数据。');
if (homeworkSection.includes('<table className="w-full border-collapse text-left text-sm font-normal text-[#4E5969]">')) {
  throw new Error('作业数据列表页不应继续使用手写 table。');
}
forbidText('作业名称：</span>\n                                                        <input', '作业名称不应标必填。');
requireText('className="!px-0" onClick={() => handleViewHomeworkRecord(row)}>查看</Button>', '作业数据操作列文字按钮应去掉默认横向内边距。');

if (homeworkSection.includes("title: '已录入'")) {
  throw new Error('作业数据列表不应展示已录入字段。');
}
if (homeworkSection.includes("title: '未交'")) {
  throw new Error('作业数据列表不应展示未交字段。');
}
requireText('newHomeworkClasses', '作业新建/编辑应支持班级多选。');
requireText('activeHomeworkClassSheet', '作业新建/编辑应支持班级 Sheet 切换。');
requireText('homeworkStudentsByClass', '作业新建/编辑应按班级保存学生作业完成情况。');
requireText('handleToggleHomeworkClass', '作业基本信息班级应支持多选切换。');
requireText('handleSwitchHomeworkClassSheet', '作业完成情况应支持班级 Sheet 切换。');
requireText('grid grid-cols-[112px_minmax(0,1fr)] gap-2', '作业基本信息班级多选应复刻考试的年级-班级分组布局。');
requireText('作业完成情况</h3>', '作业完成情况应保留独立录入区块。');
requireText('可以从 Excel 直接复制粘贴学生姓名和完成情况', '作业完成情况填写说明应复刻考试录入提示。');
requireText('录入进度：', '作业完成情况应复刻考试录入进度。');
requireText('flex w-max min-w-full items-center gap-2 rounded border border-[#E5E6EB] bg-[#F7F8FA] p-1', '作业完成情况应复刻考试班级 Sheet 样式。');
requireText('homeworkColumnFillStatus', '作业完成情况应支持表头批量设置。');
requireText('handleBatchSetHomeworkStatus', '作业完成情况应支持批量设置。');
requireText('handleChangeHomeworkName', '作业完成情况姓名应使用可编辑表格输入。');
requireText('handleChangeHomeworkStatus(student.id, event.target.value)', '作业完成情况应使用可编辑表格输入。');
requireText('buildHomeworkStudentsWithNames', '作业快捷操作应像考试一样单独填充本班学生姓名。');
requireText("buildMockHomeworkStudents(className).map(student => ({ ...student, studentNo: '', name: '', status: '' }))", '作业选择班级后应先提供空白录入表格。');
