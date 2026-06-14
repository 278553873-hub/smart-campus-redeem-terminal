import fs from 'node:fs';

const source = fs.readFileSync(new URL('./TeacherCMobileLowFi.tsx', import.meta.url), 'utf8');
const failures = [];
const requireText = (text, message) => {
  if (!source.includes(text)) failures.push(message);
};

requireText("type StudentInputRow", '12 添加学生应使用结构化行数据。');
requireText("const [studentInputRows, setStudentInputRows] = useState<StudentInputRow[]>([{ id: 1, name: '', no: '', gender: '男' }]);", '添加学生默认应只有一行空学生。');
requireText("id: Math.max(...rows.map((row) => row.id)) + 1", '新增学生行 id 应稳定递增。');
requireText("const canSubmitStudents = studentInputRows.every((row) => row.name.trim() && row.no.trim() && row.gender);", '必须所有必填字段完成后才能提交。');
requireText('disabled={!canSubmitStudents}', '完成按钮应在必填未完成时禁用。');
requireText("canSubmitStudents ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-400'", '完成按钮应有可用/禁用视觉状态。');
requireText('updateStudentInputRow(row.id, { name: event.target.value })', '姓名输入应写入对应学生行。');
requireText('updateStudentInputRow(row.id, { no: event.target.value })', '学号输入应写入对应学生行。');
requireText("updateStudentInputRow(row.id, { gender: '男' })", '性别男应写入对应学生行。');
requireText("updateStudentInputRow(row.id, { gender: '女' })", '性别女应写入对应学生行。');
requireText('removeStudentInputRow(row.id)', '多余学生行应支持清除。');
requireText('className="rounded-2xl bg-gray-50 p-3 text-xs font-black"', '每条学生数据应有独立整行卡片。');
requireText('className="flex items-center gap-2.5"', '学生数据行应包含字段区和右侧删除区。');
requireText('className="flex min-w-0 flex-1 items-center gap-2"', '姓名、学号、性别应组成同一字段区。');
requireText('className="flex h-11 w-8 shrink-0 items-center justify-center rounded-xl text-gray-400 active:bg-white active:text-gray-700"', '清除按钮应放在整条数据右侧留白区，并保留足够触控高度。');
requireText('aria-label="清除该学生"', '清除按钮应有明确无障碍标签。');
requireText('setStudentCount((count) => Math.max(count, studentInputRows.length));', '完成后学生数应按有效行数计算。');
requireText('每一行的姓名、学号、性别均填写完成后，底部完成按钮才可点击。', 'PRD 应说明必填完成后才能提交。');
requireText('每个学生行右侧留白区展示清除 icon', 'PRD 应说明清除按钮位于整条数据右侧留白区。');
requireText('不展示学生序号文案', 'PRD 应说明不展示学生1、学生2等低价值序号文案。');

const studentAddStart = source.indexOf("if (page === 'studentAdd')");
const studentAddEnd = source.indexOf("if (page === 'record')", studentAddStart);
const studentAddBlock = source.slice(studentAddStart, studentAddEnd);
const fieldGroupIndex = studentAddBlock.indexOf('className="flex min-w-0 flex-1 items-center gap-2"');
const clearButtonIndex = studentAddBlock.indexOf('aria-label="清除该学生"');
if (studentAddBlock.includes('学生{index + 1}')) {
  failures.push('添加学生行不应展示学生1、学生2等低价值序号文案。');
}
if (fieldGroupIndex < 0 || clearButtonIndex < 0 || !(fieldGroupIndex < clearButtonIndex)) {
  failures.push('清除按钮应位于字段组之后的右侧留白区。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('TeacherCMobileLowFi student add assertions passed');
