import fs from 'node:fs';
import path from 'node:path';

const source = fs.readFileSync(path.resolve('components/TeacherDashboard.tsx'), 'utf8');

const requireText = (text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

const forbidText = (text, message) => {
  if (source.includes(text)) throw new Error(message);
};

requireText("children: ['学校驾驶舱', '评价记录明细表', '学生得分明细表', '学期报告']", '报表中心菜单应新增学生得分明细表，并放在评价记录明细表后。');
requireText('interface StudentScoreDetailRow', '学生得分明细表应有独立数据结构，避免复用考试或作业数据。');
requireText('scoreDate: string;', '学生得分明细表数据应包含得分日期，用于开始日期和结束日期范围查询。');
requireText("const currentStudentScoreTerm = currentGradeTerm", '学生得分明细表仍应保留当前学期口径，便于默认本学期范围和后续后端接入。');
requireText("const [studentScoreQuickRange, setStudentScoreQuickRange] = useState<StudentScoreQuickRange>('本学期')", '默认快捷时间应为本学期。');
requireText('const [studentScoreDateRange, setStudentScoreDateRange] = useState<string[]>(studentScoreQuickRanges.本学期)', '日期范围默认应为本学期。');
requireText('const [appliedStudentScoreDateRange, setAppliedStudentScoreDateRange] = useState<string[]>(studentScoreQuickRanges.本学期)', '默认进入页面应加载本学期数据。');
requireText('handleApplyStudentScoreFilters', '筛选变化不应自动查询，应通过查询按钮应用筛选条件。');
requireText('setAppliedStudentScoreDateRange(studentScoreDateRange)', '点击查询时才应用日期范围。');
requireText('handleResetStudentScoreFilters', '重置应恢复本学期默认查询。');
requireText('handleSelectStudentScoreQuickRange', '应支持本周、本月、本学期快捷定位。');
requireText('pc-filter-bar mb-6 flex flex-wrap items-center gap-3', '学生得分筛选区应和考试数据、作业数据一样使用单行 flex-wrap 规则。');
requireText('inline-flex h-8 overflow-hidden rounded border border-[#E5E6EB] bg-white', '快捷时间控件应和日期范围框保持同高度、同边框、同白底。');
requireText('<Button type="primary" onClick={handleApplyStudentScoreFilters}>查询</Button>', '查询按钮应位于同一筛选行内，并紧跟筛选项。');
requireText('<Button onClick={handleResetStudentScoreFilters}>重置</Button>', '重置按钮应位于同一筛选行内，并紧跟查询按钮。');
for (const range of ['本周', '本月', '本学期']) {
  requireText(`{range}`, `快捷时间应展示${range}。`);
}
requireText('<DatePicker.RangePicker', '时间筛选应使用 Arco 日期范围选择器。');
requireText('placeholder={[\'开始日期\', \'结束日期\']}', '日期范围选择器应明确开始日期和结束日期。');
requireText('disabledDate={isStudentScoreDateDisabled}', '日期选择应限制在当前学期内，避免跨学期大范围查询。');
requireText("{ id: 'score-12'", '学生得分明细表 mock 数据应扩展到 2 页，用分页体现全校学生数据量。');
requireText('pagination={{ pageSize: 6, total: filteredStudentScoreDetailRows.length, showTotal: true }}', '学生得分明细表应展示分页，demo 每页 6 条形成 2 页效果。');
requireText("{ title: '年级', dataIndex: 'grade', width: 120 }", '年级列应直接展示 2025级，不应追加括号年级说明。');
requireText('placeholder="全部年级 / 班级"', '年级和班级筛选应合并为一个级联选择器。');
requireText('checkedStrategy="all"', '年级班级级联选择器应支持选择年级本身，也支持选择具体班级。');
requireText('studentScoreGradeClassFilters', '学生得分明细表应使用统一的年级班级筛选状态。');
requireText('aria-label="学生得分年级班级筛选"', '合并后的级联选择器应有清晰的无障碍标签。');
requireText("activeMenu === '学生得分明细表'", '应渲染学生得分明细表页面。');
requireText('placeholder="搜索学生姓名"', '筛选区应支持按学生姓名搜索。');
requireText('aria-label="学生姓名搜索"', '学生姓名搜索输入框应有无障碍标签。');
forbidText('aria-label="学生得分年级筛选"', '不应再保留单独的年级筛选。');
forbidText('aria-label="学生得分班级筛选"', '不应再保留单独的班级筛选。');
requireText('导出excel', '页面应提供导出excel按钮，文案应与考试数据保持一致。');
requireText('flex h-8 items-center gap-1.5 rounded px-2 text-sm font-normal text-[#165DFF] transition-colors hover:bg-[#E8F3FF] hover:text-[#4080FF] active:text-[#0E42D2] focus:outline-none', '导出excel按钮应复用考试数据里的下载图标加文字按钮样式。');
requireText('studentScoreDetailColumns', '学生得分明细表应定义独立表格列。');
requireText("title: '日期时间段'", '学生得分明细表首列应展示日期时间段，而不是学年-学期。');
requireText("dataIndex: 'dateRange'", '日期时间段列应使用独立列定义。');
requireText('`${appliedStudentScoreDateRange[0]} 至 ${appliedStudentScoreDateRange[1]}`', '日期时间段列应展示当前查询应用后的开始日期至结束日期。');
requireText("title: '总净得分'", '表格应展示总净得分列。');
for (const dimension of ['德', '智', '体', '美', '劳']) {
  requireText(`title: '${dimension}'`, `表格应展示${dimension}一级指标净得分列。`);
}
requireText('暂无符合条件的学生得分记录', '表格空状态应明确。');
forbidText('导入 Excel', '本页按钮应为导出excel，不应出现导入 Excel。');
forbidText('导出 Excel', '导出按钮文案应统一为导出excel。');
forbidText('当前查询：', '表格上方不应展示当前查询口径文案。');
forbidText("{ title: '学年-学期', dataIndex: 'term', width: 180 }", '学生得分明细表不应再展示学年-学期列。');
forbidText('formatGradeLevelLabel(grade)', '学生得分明细表年级列不应显示括号年级说明。');
forbidText('setStudentScoreTermFilter', '学生得分明细表不应再使用学年学期下拉作为主时间筛选。');
