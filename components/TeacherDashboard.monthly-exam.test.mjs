import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');

const requireText = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText("type: string;\n    month?: string;", '考试数据行应新增可选月份字段。');
requireText("const gradeExamTypeOptions = ['期中', '期末', '月考', '单元测评'];", '考试类型应新增月考。');
requireText('gradeMonthOptions', '应定义月份枚举供月考选择。');
requireText('newGradeExamMonth', '新建/编辑考试应维护月考月份状态。');
requireText("setNewGradeExamMonth(exam.month || '')", '编辑或查看考试时应回显月考月份。');
requireText("setNewGradeExamMonth('')", '重置或清空考试类型时应清理月考月份。');
requireText("newGradeExamType === '月考'", '只有选择月考时才展示或校验月份。');
requireText('请选择月份', '月考月份应提供明确占位。');
requireText('请补全月考月份。', '月考保存时未选月份应有明确提示。');
requireText('month: newGradeExamType === \'月考\' ? newGradeExamMonth : undefined', '保存考试时只有月考写入月份。');
requireText('formatGradeExamTypeLabel', '列表和详情应使用统一考试类型展示文案。');
requireText("`${row.type}（${row.month}）`", '月考列表应展示为月考（X月）。');
