import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherDashboard.tsx', import.meta.url), 'utf8');

const requireText = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText('Popconfirm', '考试数据班级视角删除应使用 Arco Popconfirm 二次确认。');
requireText('handleDeleteGradeExam', '考试数据班级视角应有独立删除处理函数。');
requireText('确认删除这条考试记录？', '删除考试记录应展示明确的二次确认标题。');
requireText('删除后将移除', '删除确认应说明会移除考试记录和成绩明细。');
requireText('删除记录', '危险操作按钮文案应明确为删除记录。');
requireText('status="danger"', '班级视角删除按钮应使用危险状态。');
requireText('setGradeExamRows(prev => prev.filter(row => row.id !== exam.id))', '确认删除后应从考试列表移除当前记录。');
requireText('delete nextMap[exam.id]', '确认删除后应同步清理当前考试成绩明细。');
