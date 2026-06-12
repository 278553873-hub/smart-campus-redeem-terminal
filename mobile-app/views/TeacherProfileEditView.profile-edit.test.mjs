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
requireText(typesSource, 'name: string;', '教师资料应保存姓名。');
requireText(typesSource, 'departmentId: string;', '教师资料应保存选中的部门 id。');
requireText(typesSource, 'gradeLeaderGrades: string[];', '年级组长应保存年级列表。');

requireText(editSource, '编辑教师信息', '编辑页标题应为编辑教师信息。');
requireText(editSource, 'applyProfileChange', '字段修改后应立即同步到教师资料。');
requireText(editSource, 'renderNameDialog', '点击姓名编辑按钮后应通过弹窗修改姓名。');
requireText(editSource, 'aria-label="修改姓名"', '姓名应提供明确的编辑按钮。');
requireText(editSource, '更换头像', '编辑页应提供更换头像入口。');
requireText(editSource, '拍照', '头像动作面板应提供拍照。');
requireText(editSource, '从相册选择', '头像动作面板应提供从相册选择。');
requireText(editSource, '新增任教信息', '任教信息应在同一页面新增班级和学科。');
requireText(editSource, 'renderClassSelectorPage', '班级选择应作为完整页面渲染，避免底部下一步按钮被裁切。');
requireText(editSource, 'h-full min-h-0 overflow-hidden', '编辑子页面必须使用容器高度，避免手机壳内底部按钮被 100vh 裁切。');
requireText(editSource, 'selectedSubject', '任教信息应在同一页面选择学科。');
requireText(editSource, '保存任教信息', '任教信息应在班级与学科同页完成保存。');
requireText(editSource, '请先选择学科', '任教信息同页保存前应校验学科。');
requireText(editSource, 'groupTeachingAssignmentsBySubject', '任教范围展示应按学科聚合。');
requireText(editSource, '班级级联选择', '任教、班主任班级选择应采用级联选择。');
requireText(editSource, '左侧先选年级', '班级级联左侧应先选择年级。');
requireText(editSource, '右侧再选该年级下的班级', '班级级联右侧应展示当前年级下的班级。');
requireText(editSource, 'toggleActiveGradeClasses', '班级选择应支持当前年级批量全选/取消。');
requireText(editSource, 'homeroomClassIds', '编辑页应支持维护班主任班级。');
requireText(editSource, '清除班主任班级', '班主任班级应支持清除。');
requireText(editSource, '清除年级组长年级', '年级组长年级应支持清除。');
requireText(editSource, '清除部门', '部门设置应支持清除。');
requireText(editSource, '保存班主任班级', '班主任班级设置页应有明确保存按钮。');
requireText(editSource, '担任年级组长的年级', '年级组长文案应为年级。');
requireText(editSource, 'renderGradeLeaderSelectorPage', '年级组长应选择年级。');
requireText(editSource, 'saveGradeLeaderGrades', '年级组长年级选择应保存后回到编辑页。');
requireText(editSource, '部门设置', '编辑页应新增部门设置。');
requireText(editSource, 'renderDepartmentSelectorPage', '部门应从后端返回的部门列表中选择。');

requireText(editSource, 'teacher-avatar-card', '头像应作为独立卡片展示。');
requireText(editSource, 'teacher-name-card', '姓名应作为独立卡片展示。');
requireText(editSource, 'teacher-teaching-card', '任教信息应作为独立卡片展示。');
requireText(editSource, 'teacher-homeroom-card', '担任班主任的班级应作为独立卡片展示。');
requireText(editSource, 'teacher-grade-leader-card', '担任年级组长的年级应作为独立卡片展示。');
requireText(editSource, 'teacher-department-card', '部门设置应作为独立卡片展示。');
requireText(editSource, '>任教信息<', '任教班级与学科应改名为任教信息。');
if (editSource.includes('teacher-basic-info-card') || editSource.includes('>基本信息<') || editSource.includes('>任教班级与学科<')) {
  throw new Error('编辑页不应继续使用基本信息分组或任教班级与学科旧名称。');
}
if (editSource.includes('teacher-setting-card') || editSource.includes('renderTeacherSettingRows')) {
  throw new Error('同层级字段应拆成独立卡片，不应合并到一个设置卡片。');
}
if (editSource.includes('onSave(draft)') || editSource.includes('>\n                    保存\n')) {
  throw new Error('编辑教师信息页不应保留额外的整页保存按钮。');
}
if (editSource.includes('role-homeroom-card') || editSource.includes('role-grade-leader-card') || editSource.includes('department-setting-card')) {
  throw new Error('班主任、年级组长、部门设置不应再拆成独立卡片。');
}

if (editSource.includes("'teachingSubject'") || editSource.includes('下一步：选择学科')) {
  throw new Error('任教信息不应拆成班级页和学科页，应在同一页面处理。');
}
if (editSource.includes('gradeLeaderClassIds') || editSource.includes('gradeLeaderClasses') || editSource.includes('openGradeLeaderClassSelector') || editSource.includes('saveGradeLeaderClasses') || editSource.includes('担任年级组长的班级') || editSource.includes('年级组长班级')) {
  throw new Error('年级组长应按年级维护，不应改成班级维护。');
}
if (editSource.indexOf('部门设置') < editSource.indexOf('担任年级组长的年级')) {
  throw new Error('部门设置应放在编辑页最下方。');
}
