import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const editSource = read('./TeacherProfileEditView.tsx');
const meSource = read('./MeView.tsx');
const appSource = read('../App.tsx');
const typesSource = read('../types.ts');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText(meSource, 'onEditTeacherProfile', '我的页面头像应提供进入编辑教师信息页的点击入口。');
requireText(meSource, 'aria-label="编辑教师信息"', '头像入口应具备明确的无障碍标签。');
requireText(meSource, "title: '我的文件'", '我的资料分组应继续只保留我的文件入口。');
if (meSource.includes("title: '编辑教师信息'")) {
  throw new Error('编辑教师信息不应作为我的资料菜单项出现。');
}

requireText(appSource, "'teacher_profile_edit'", 'App 路由应新增教师信息编辑页状态。');
requireText(appSource, '<TeacherProfileEditView', 'App 应渲染教师信息编辑页。');
requireText(appSource, 'TEACHER_PROFILE_DEPARTMENTS', 'App 应提供后端返回部门列表的 mock 数据。');
requireText(appSource, 'departments={TEACHER_PROFILE_DEPARTMENTS}', '编辑页应接收部门列表。');

requireText(typesSource, 'TeacherDepartment', '类型层应定义教师部门。');
requireText(typesSource, 'departmentId: string;', '教师资料应保存选中的部门 id。');
requireText(typesSource, 'gradeLeaderGrades: string[];', '年级组长应保存年级而不是班级。');

requireText(editSource, '编辑教师信息', '编辑页标题应为编辑教师信息。');
requireText(editSource, '更换头像', '编辑页应提供更换头像入口。');
requireText(editSource, '拍照', '头像动作面板应提供拍照。');
requireText(editSource, '从相册选择', '头像动作面板应提供从相册选择。');
requireText(editSource, '选择任教班级', '任教范围流程应先选择班级。');
requireText(editSource, '选择任教学科', '任教范围流程应后选择学科。');
requireText(editSource, 'renderClassSelectorPage', '班级选择应作为完整页面渲染，避免底部下一步按钮被裁切。');
requireText(editSource, 'h-full min-h-0 overflow-hidden', '编辑子页面必须使用容器高度，避免手机壳内底部按钮被 100vh 裁切。');
requireText(editSource, '下一步：选择学科', '任教班级选择后应提供下一步按钮。');
requireText(editSource, 'groupTeachingAssignmentsBySubject', '任教范围展示应按学科聚合。');
requireText(editSource, 'toggleGradeClasses', '班级选择应支持按年级批量全选/取消。');
requireText(editSource, 'homeroomClassIds', '编辑页应支持维护班主任班级。');
requireText(editSource, '清除班主任班级', '班主任班级应支持清除。');
requireText(editSource, '清除年级组长年级', '年级组长年级应支持清除。');
requireText(editSource, '清除部门', '部门设置应支持清除。');
requireText(editSource, '保存班主任班级', '班主任班级设置页应有明确保存按钮。');
requireText(editSource, '担任年级组长的年级', '年级组长文案应改为年级。');
requireText(editSource, 'renderGradeLeaderSelectorPage', '年级组长应选择年级而不是班级。');
requireText(editSource, 'saveGradeLeaderGrades', '年级组长年级选择应保存后回到编辑页。');
requireText(editSource, '部门设置', '编辑页应新增部门设置。');
requireText(editSource, 'renderDepartmentSelectorPage', '部门应从后端返回的部门列表中选择。');

if (editSource.includes('年级组长按年级维护')) {
  throw new Error('年级组长设置页不应出现解释性对话文案。');
}
if (editSource.indexOf('部门设置') < editSource.indexOf('担任年级组长的年级')) {
  throw new Error('部门设置应放在编辑页最下方。');
}
