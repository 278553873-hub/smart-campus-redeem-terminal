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
if (meSource.includes("title: '编辑教师信息'")) {
  throw new Error('编辑教师信息不应作为我的资料菜单项出现。');
}

requireText(appSource, "'teacher_profile_edit'", 'App 路由应新增教师信息编辑页状态。');
requireText(appSource, '<TeacherProfileEditView', 'App 应渲染教师信息编辑页。');
requireText(appSource, 'TEACHER_PROFILE_DEPARTMENTS', 'App 应提供后端返回部门列表的 mock 数据。');
requireText(appSource, 'departments={TEACHER_PROFILE_DEPARTMENTS}', '编辑页应接收部门列表。');
requireText(appSource, 'schoolName:', 'App 应为教师资料提供学校名称 mock 数据。');
requireText(appSource, 'currentSpace={activeTeacherSpace}', '编辑页应接收当前班级来源，用于判断学校字段是否可编辑。');

requireText(typesSource, 'TeacherDepartment', '类型层应定义教师部门。');
requireText(typesSource, 'name: string;', '教师资料应保存姓名。');
requireText(typesSource, 'schoolName: string;', '教师资料应保存学校名称。');
requireText(typesSource, 'departmentId: string;', '教师资料应保存选中的部门 id。');
requireText(typesSource, 'gradeLeaderGrades: string[];', '年级组长应保存年级列表。');

requireText(editSource, 'applyProfileChange', '字段修改后应立即同步到教师资料。');
requireText(editSource, 'renderNameDialog', '点击姓名编辑按钮后应通过弹窗修改姓名。');
requireText(editSource, 'aria-label="修改姓名"', '姓名应提供明确的编辑按钮。');
requireText(editSource, 'teacher-school-card', '姓名字段下方应新增学校字段卡片。');
requireText(editSource, '>学校<', '新增字段标签应为学校。');
requireText(editSource, 'currentSpace: TeacherSpaceOption;', '编辑页应声明当前班级来源参数。');
requireText(editSource, "const schoolNameLocked = currentSpace.type === 'school';", '班级来源为学校时，学校字段应锁定不可编辑。');
requireText(editSource, 'const displaySchoolName = schoolNameLocked ? currentSpace.title : draft.schoolName;', '切换到学校来源时，学校字段应展示当前学校来源名称。');
requireText(editSource, 'renderSchoolDialog', '班级来源非学校时应通过弹窗修改学校字段。');
requireText(editSource, 'aria-label="修改学校"', '学校字段可编辑时应提供明确的编辑按钮。');
requireText(editSource, '!schoolNameLocked &&', '班级来源为学校时不应展示学校编辑按钮。');
requireText(editSource, '更换头像', '编辑页应提供更换头像入口。');
requireText(editSource, 'const displayAvatar = draft.avatar === ASSETS.AVATAR.TEACHER_LIU', '编辑页默认教师头像应使用无外框原图展示，避免头像内容被资源留白压小。');
requireText(editSource, 'ASSETS.AVATAR.TEACHER_LIU_RAW', '编辑页默认教师头像展示应回退到无外框原图。');
requireText(editSource, 'object-cover object-center', '编辑页教师头像图片应覆盖圆形容器，不能使用 object-contain 留白。');
requireText(editSource, '拍照', '头像动作面板应提供拍照。');
requireText(editSource, '从相册选择', '头像动作面板应提供从相册选择。');
requireText(editSource, '新增任教班级', '任教班级应在同一页面新增班级和学科。');
requireText(editSource, 'renderClassSelectorSheet', '班级选择应改为当前页面蒙层弹窗。');
requireText(editSource, 'renderSheetFrame', '选择类配置应复用统一蒙层弹窗结构。');
requireText(editSource, 'bottom-sheet', '选择类配置弹窗应使用底部浮层弹窗样式。');
requireText(editSource, 'rounded-t-[28px]', '底部浮层弹窗应贴底并只保留顶部大圆角。');
requireText(editSource, 'role="dialog"', '底部浮层弹窗应具备对话框语义。');
requireText(editSource, 'aria-modal="true"', '底部浮层弹窗应标记为模态对话框。');
requireText(editSource, 'max-h-[86%]', '底部浮层弹窗高度应限制在当前手机页面内。');
requireText(editSource, 'selectedSubject', '任教班级应在同一页面选择学科。');
requireText(editSource, " : '保存'}", '选择类弹窗保存按钮文案应统一为保存。');
requireText(editSource, '请先选择学科', '任教班级同页保存前应校验学科。');
requireText(editSource, 'groupTeachingAssignmentsBySubject', '任教范围展示应按学科聚合。');
requireText(editSource, '班级级联选择', '任教、班主任班级选择应采用级联选择。');
requireText(editSource, '左侧先选年级', '班级级联左侧应先选择年级。');
requireText(editSource, '右侧再选该年级下的班级', '班级级联右侧应展示当前年级下的班级。');
requireText(editSource, 'min-h-0 overflow-y-auto overscroll-contain border-r', '左侧年级列表应支持上下滑动。');
requireText(editSource, 'min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain', '右侧班级列表应支持上下滑动。');
requireText(editSource, '{classInfo.name}', '班级选择应展示完整班级名称。');
requireText(editSource, '下方选择任教学科', '任教班级弹窗应在上方选班级，下方选科目。');
requireText(editSource, 'homeroomClassIds', '编辑页应支持维护班主任班级。');
requireText(editSource, '暂不选择', '选择类弹窗底部应提供弱化的暂不选择入口。');
requireText(editSource, '分管年级', '年级组长主页面文案应改为分管年级。');
requireText(editSource, 'renderGradeLeaderSelectorSheet', '分管年级应在当前页面蒙层弹窗中选择。');
requireText(editSource, 'saveGradeLeaderGrades', '年级组长年级选择应保存后回到编辑页。');
requireText(editSource, '部门设置', '编辑页应新增部门设置。');
requireText(editSource, 'renderDepartmentSelectorSheet', '部门应在当前页面蒙层弹窗中选择。');
requireText(editSource, 'selectedDepartmentId', '部门弹窗应先暂存选择，点击保存后再生效。');

requireText(editSource, 'teacher-avatar-card', '头像应作为独立卡片展示。');
requireText(editSource, 'teacher-name-card', '姓名应作为独立卡片展示。');
requireText(editSource, 'teacher-school-card', '学校应作为独立卡片展示。');
requireText(editSource, 'teacher-teaching-card', '任教班级应作为独立卡片展示。');
requireText(editSource, 'teacher-homeroom-card', '带班班级应作为独立卡片展示。');
requireText(editSource, 'teacher-grade-leader-card', '分管年级应作为独立卡片展示。');
requireText(editSource, 'teacher-department-card', '部门设置应作为独立卡片展示。');
requireText(editSource, '>任教班级<', '任教信息应改名为任教班级。');
requireText(editSource, '>带班班级<', '担任班主任的班级应改名为带班班级。');
requireText(editSource, '>分管年级<', '担任年级组长的年级应改名为分管年级。');
requireText(editSource, 'aria-label="添加任教班级"', '添加入口应使用图标按钮并保留无障碍标签。');
requireText(editSource, 'aria-label="修改带班班级"', '带班班级修改入口应使用图标按钮并保留无障碍标签。');
requireText(editSource, 'aria-label="修改分管年级"', '分管年级修改入口应使用图标按钮并保留无障碍标签。');
requireText(editSource, 'aria-label="修改部门设置"', '部门修改入口应使用图标按钮并保留无障碍标签。');
requireText(editSource, 'text-right text-sm font-bold text-slate-700', '除任教班级外的配置值应靠右展示。');
requireText(editSource, 'renderConfigValue', '未选择态配置值应统一弱化展示。');
requireText(editSource, 'font-normal text-slate-300', '未选择态“暂未选择”应更灰且不加粗。');
requireText(editSource, '{draft.name}</h2>', '姓名值应与其他配置值使用同一字号层级。');
requireText(editSource, 'shrink-0 px-5 pt-3', '返回按钮应有独立空间，避免与头像区域重叠。');
if (editSource.includes('teacher-basic-info-card') || editSource.includes('>基本信息<') || editSource.includes('>任教班级与学科<')) {
  throw new Error('编辑页不应继续使用基本信息分组或任教班级与学科旧名称。');
}
if (editSource.includes('>任教信息<') || editSource.includes('>担任班主任的班级<') || editSource.includes('>担任年级组长的年级<')) {
  throw new Error('编辑页主卡片不应继续展示旧配置项名称。');
}
if (editSource.includes('teacher-setting-card') || editSource.includes('renderTeacherSettingRows')) {
  throw new Error('同层级字段应拆成独立卡片，不应合并到一个设置卡片。');
}
if (editSource.includes('onSave(draft)')) {
  throw new Error('编辑教师信息页不应保留额外的整页保存按钮。');
}
if (editSource.includes('<h1') || editSource.includes('>编辑教师信息<')) {
  throw new Error('编辑页不应继续显示“编辑教师信息”标题。');
}
if (editSource.includes('sticky top-0') || editSource.includes('border-b border-slate-100 bg-white/90 px-4 backdrop-blur')) {
  throw new Error('标题文案移除后不应保留顶部标题框。');
}
if (editSource.includes('absolute left-3 top-3')) {
  throw new Error('返回按钮不应覆盖头像卡片。');
}
if (editSource.includes('renderClassSelectorPage') || editSource.includes('renderGradeLeaderSelectorPage') || editSource.includes('renderDepartmentSelectorPage')) {
  throw new Error('选择类配置不应继续跳转完整子页面，应使用当前页面蒙层弹窗。');
}
if (editSource.includes('清除带班班级') || editSource.includes('清除年级组长年级') || editSource.includes('清除部门')) {
  throw new Error('选择类弹窗底部弱操作应统一为“暂不选择”。');
}
if (editSource.includes('全选') || editSource.includes('toggleActiveGradeClasses') || editSource.includes('activeAllSelected')) {
  throw new Error('这些配置项不需要全选功能。');
}
if (editSource.includes('保存任教班级') || editSource.includes('保存带班班级') || editSource.includes('保存分管年级') || editSource.includes('保存部门设置')) {
  throw new Error('选择类弹窗主按钮文案应统一为“保存”。');
}
if (editSource.includes('个学科 ·') || editSource.includes('个班级关系')) {
  throw new Error('任教班级字段名右侧不应展示统计信息。');
}
if (editSource.includes('role-homeroom-card') || editSource.includes('role-grade-leader-card') || editSource.includes('department-setting-card')) {
  throw new Error('班主任、年级组长、部门设置不应再拆成独立卡片。');
}

if (editSource.includes("'teachingSubject'") || editSource.includes('下一步：选择学科')) {
  throw new Error('任教班级不应拆成班级页和学科页，应在同一页面处理。');
}
if (editSource.includes('gradeLeaderClassIds') || editSource.includes('gradeLeaderClasses') || editSource.includes('openGradeLeaderClassSelector') || editSource.includes('saveGradeLeaderClasses') || editSource.includes('担任年级组长的班级') || editSource.includes('年级组长班级')) {
  throw new Error('年级组长应按年级维护，不应改成班级维护。');
}
if (editSource.indexOf('部门设置') < editSource.indexOf('分管年级')) {
  throw new Error('部门设置应放在编辑页最下方。');
}
