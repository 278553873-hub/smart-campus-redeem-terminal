import fs from 'node:fs';

const read = (path) => fs.readFileSync(new URL(path, import.meta.url), 'utf8');
const appSource = read('../App.tsx');
const classListSource = read('./ClassListView.tsx');
const classDetailSource = read('./ClassDetailView.tsx');
const dashboardSource = read('./DashboardView.tsx');
const basicEditSource = read('./StudentBasicEditView.tsx');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText(appSource, 'getMergedStudentsForClass', 'App 应统一生成合并覆盖后的班级学生列表。');
requireText(appSource, 'handleRestoreStudentStatus', 'App 应提供离校学生恢复为在校的处理函数。');
requireText(appSource, 'getStudentsForClass={getMergedStudentsForClass}', 'App 应把合并后的班级学生数据传给班级列表，由班级列表当前页打开离校学生弹窗。');
requireText(appSource, 'onRestoreStudentStatus={handleRestoreStudentStatus}', 'App 应把恢复学生状态回调传给班级列表。');
if (appSource.includes('handleViewLeftStudents') || appSource.includes('openLeftStudentsOnMount')) {
  throw new Error('离校学生不应再通过跳转班级详情页自动打开，应在班级列表页当前页面打开。');
}
requireText(classDetailSource, "students.filter(student => (student.status ?? 'active') === 'active')", '班级学生页默认只展示在校学生。');
requireText(classListSource, 'getStudentsForClass', '班级列表应接收班级学生数据获取函数。');
requireText(classListSource, 'leftStudents', '班级列表页应在当前页维护离校学生集合。');
requireText(classListSource, 'showLeftStudentSheet', '班级列表页应在当前页打开离校学生轻量抽屉。');
requireText(classListSource, 'relative h-full overflow-hidden', '班级列表页应固定为手机屏幕高度，避免离校学生弹窗挂到长列表底部看不见。');
requireText(classListSource, 'h-full overflow-y-auto', '班级列表内容应自己滚动，让弹窗覆盖当前手机屏幕。');
requireText(classListSource, '离校学生', '班级卡片更多操作里应提供离校学生入口。');
requireText(classListSource, "activeMenuId === cls.id ? 'z-[130]'", '打开更多菜单的班级卡片应提升层级，避免菜单被后续班级卡片和按钮遮挡。');
if (classDetailSource.includes('离校学生{leftStudents.length')) {
  throw new Error('离校学生入口不应放在学生列表工具栏，低频操作应收进班级卡片更多操作。');
}
requireText(classListSource, '恢复', '离校学生轻量抽屉的操作应收敛为“恢复”。');
if (classListSource.includes('恢复在校')) {
  throw new Error('离校学生轻量抽屉按钮不应使用“恢复在校”这种较重文案。');
}
if (classListSource.includes('这里用于找回误设为离校的学生') || classListSource.includes('恢复在校后，学生会重新出现在老师默认学生名单中')) {
  throw new Error('离校学生轻量抽屉不应展示大段说明文案。');
}
requireText(classListSource, 'onRestoreStudentStatus', '班级列表页应通过回调恢复学生状态。');
if (classDetailSource.includes('showLeftStudentSheet') || classDetailSource.includes('openLeftStudentsOnMount')) {
  throw new Error('班级详情页不应再承载离校学生弹窗。');
}
if (basicEditSource.includes('设为离校') || basicEditSource.includes('学籍状态') || basicEditSource.includes('showStatusConfirm')) {
  throw new Error('基础信息编辑页不应包含设置离校入口，避免编辑资料时误操作。');
}
requireText(appSource, 'handleUpdateStudentStatus', 'App 应提供独立的学生状态更新处理函数。');
requireText(appSource, 'onUpdateStudentStatus={handleUpdateStudentStatus}', 'App 应把独立学籍状态操作传给学生详情页。');
requireText(dashboardSource, 'onUpdateStudentStatus', '学生详情页应接收独立学籍状态操作回调。');
requireText(dashboardSource, 'showStatusActionSheet', '学生详情页应有单独的学籍状态入口弹层。');
requireText(dashboardSource, '学籍状态', '学生详情页应显示单独的学籍状态操作行。');
if (dashboardSource.includes('<BadgeCheck className="h-3 w-3" />')) {
  throw new Error('学生顶部信息卡不应重复展示在校/离校状态标签，学籍状态已由独立操作行承载。');
}
requireText(dashboardSource, '>管理<', '学生详情页应通过明确的“管理”按钮进入学籍状态操作，而不是点击信息标签。');
if (dashboardSource.includes('<div className="mt-1 text-xs font-medium text-slate-400">当前：{studentStatusLabel}</div>')) {
  throw new Error('学籍状态操作行不应重复展示两个状态，只保留一个在校/离校标签。');
}
if (dashboardSource.includes('bg-slate-900 px-4 text-xs font-black text-white')) {
  throw new Error('学籍状态管理按钮不应使用黑色强按钮，应使用更轻的页面内操作样式。');
}
requireText(dashboardSource, '设置离校后，该学生将不在学生列表展示。可在班级卡片更多操作中恢复。', '设置离校确认弹窗应简单说明后果和恢复入口。');
if (dashboardSource.includes("onUpdateStudentStatus(student, 'active')")) {
  throw new Error('学生详情页不应提供离校学生恢复入口，恢复应只在班级卡片更多操作的离校学生列表中完成。');
}
if (dashboardSource.includes('onClick={() => setShowStatusActionSheet(true)}') && dashboardSource.includes('aria-label="学籍状态"')) {
  throw new Error('姓名下方的学籍状态标签不应可点击，应通过独立管理按钮操作。');
}

console.log('student status flow assertions passed');
