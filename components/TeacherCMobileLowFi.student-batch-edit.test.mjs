import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText("studentBatchEdit: {", '应定义批量修改学生信息页面元信息。');
requireText("title: '批量修改学生信息'", '页面标题应为批量修改学生信息。');
requireText("const [studentBatchEditRows, setStudentBatchEditRows] = useState<StudentInputRow[]>([]);", '批量修改页应使用独立学生编辑行状态。');
requireText('const createStudentBatchEditRows = () => studentRows.map', '批量修改页应从当前学生列表初始化行数据。');
requireText("const openStudentBatchEdit = () =>", '应有打开批量修改页面的独立方法。');
requireText("navigate('studentBatchEdit');", '打开方法应导航到独立批量修改页面。');
requireText("if (page === 'studentBatchEdit')", '应渲染独立批量修改学生信息页面。');
requireText('studentBatchEditRows.map((row)', '页面应按学生行逐行渲染。');
requireText('updateStudentBatchEditRow(row.id, { name: event.target.value })', '页面应支持编辑学生姓名。');
requireText('updateStudentBatchEditRow(row.id, { no: event.target.value })', '页面应支持编辑学生学号。');
requireText("updateStudentBatchEditRow(row.id, { gender: '男' })", '页面应支持切换男。');
requireText("updateStudentBatchEditRow(row.id, { gender: '女' })", '页面应支持切换女。');
requireText("const canSaveStudentBatch = studentBatchEditRows.length > 0 && studentBatchEditRows.every((row) => row.name.trim() && row.gender);", '姓名和性别有效时即可保存，学号选填。');
requireText('placeholder="学号选填"', '批量修改页学号输入应明确为学号选填。');
requireText('disabled={!canSaveStudentBatch}', '保存按钮应根据有效性禁用。');
requireText('保存修改', '底部主按钮应为保存修改。');
requireText("showClassActionToast('已保存学生信息');", '保存后应给出成功反馈。');
requireText("navigate('studentList');", '保存后应回到学生列表。');
requireText("'studentBatchEdit']", '班级流程图应展示 11A 批量修改学生信息页。');
requireText('页面结构参考 12 添加学生，但不提供添加一名和清除学生。', 'PRD 应说明页面参考 12 但不提供新增/删除行。');
requireText('姓名和性别有值时，底部保存修改按钮可点击；学号选填。', 'PRD 应说明批量修改页学号选填。');

const batchStart = source.indexOf("if (page === 'studentBatchEdit')");
const batchEnd = source.indexOf("if (page === 'record')", batchStart);
const batchBlock = source.slice(batchStart, batchEnd);
if (batchBlock.includes('addStudentInputRow') || batchBlock.includes('添加一名')) {
  failures.push('批量修改学生信息页不应提供添加一名。');
}
if (batchBlock.includes('removeStudentInputRow') || batchBlock.includes('清除该学生')) {
  failures.push('批量修改学生信息页不应提供清除学生。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi student batch edit assertions passed');
