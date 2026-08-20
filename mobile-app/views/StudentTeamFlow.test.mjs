import assert from 'node:assert/strict';
import fs from 'node:fs';

const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const recordSource = fs.readFileSync(new URL('./ClassRecordLogView.tsx', import.meta.url), 'utf8');
const inputSource = fs.readFileSync(new URL('./RecordInputView.tsx', import.meta.url), 'utf8');
const detailSource = fs.readFileSync(new URL('./student-team/StudentTeamDetailView.tsx', import.meta.url), 'utf8');
const editorSource = fs.readFileSync(new URL('./student-team/StudentTeamEditorView.tsx', import.meta.url), 'utf8');
const typeSource = fs.readFileSync(new URL('../types.ts', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  assert.ok(source.includes(needle), message);
};

requireText(classListSource, "{ value: 'class', label: '班级' }", '班级页必须保留老师可理解的“班级”页签。');
requireText(classListSource, "{ value: 'team', label: '社团与团队' }", '班级页必须提供“社团与团队”页签。');
requireText(classListSource, "activeListTab: 'class' | 'team';", '班级页签必须由导航层持有，返回团队列表时不得重置。');
requireText(appSource, "const [classListTab, setClassListTab]", 'App 必须保存班级页签状态。');
requireText(classListSource, "activeListTab === 'team' && studentTeams.map(renderStudentTeamCard)", '社团与团队页签必须展示团队列表。');
requireText(typeSource, 'export interface SchoolStudentTeam', '学校社团与团队必须使用独立领域模型。');
requireText(typeSource, "status: 'active' | 'archived';", '解散团队必须采用归档状态，保留历史评价。');

requireText(editorSource, 'classes: ClassInfo[];', '创建团队必须接收学校内多个班级。');
requireText(editorSource, 'const [selectedIds, setSelectedIds]', '跨班切换时必须保留已选成员。');
requireText(editorSource, 'activeStudents.forEach(student =>', '成员选择必须支持按班全选。');
requireText(editorSource, "onSave({ name: name.trim(), memberIds: Array.from(selectedIds) })", '创建团队只保存名称和成员。');
assert.ok(!editorSource.includes('类型'), '创建团队不得要求老师理解或选择团队类型。');

requireText(detailSource, 'student.class', '团队成员页必须展示学生原班级以辅助辨认。');
requireText(appSource, "const selectedStudentTeamCandidateIds = selectedStudentTeamStudents.map(student => student.id);", '团队录入候选范围必须等于当前有效成员。');
requireText(appSource, "currentView === 'student_team_detail' ? selectedStudentTeamCandidateIds : []", '只有团队成员页录入时才应注入团队候选范围。');
requireText(inputSource, 'candidateStudentIds?: string[];', '原有录入控件必须接收候选成员编号。');
requireText(inputSource, 'candidateStudentIds,', '语音、拍照和文字提交必须原样回传候选成员编号。');
requireText(appSource, "setCurrentView('student_team_detail');", '团队录入完成后必须回到团队成员页。');

assert.ok(!recordSource.includes('社团与团队'), '记录页不得增加社团与团队入口。');
assert.ok(!recordSource.includes('candidateStudentIds'), '记录页展示流程不得承担团队候选范围识别。');

const featureSources = [appSource, classListSource, detailSource, editorSource].join('\n');
for (const forbiddenCopy of ['特殊群体', '群组类型', '可评价学生名单', '行政班']) {
  assert.ok(!featureSources.includes(forbiddenCopy), `页面不得出现“${forbiddenCopy}”。`);
}

console.log('Student team flow assertions passed');
