import fs from 'node:fs';

const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText(classListSource, 'teacherProfile: TeacherProfile;', '班级列表应接收教师资料，用任教关系过滤班级。');
requireText(classListSource, 'showTeachingOnly', '班级列表应有“只显示任教班级”的勾选状态。');
requireText(classListSource, 'teachingClassIds', '班级列表应基于 teachingAssignments 生成任教班级集合。');
requireText(classListSource, 'visibleClasses', '班级列表渲染应使用过滤后的班级列表。');
requireText(classListSource, '只显示任教班级', '顶部操作区应提供“只显示任教班级”选项。');
requireText(classListSource, "showTeachingOnly ? 'bg-transparent text-slate-500 shadow-none'", '任教筛选选中态不应显示背景、边框或阴影。');
requireText(classListSource, 'h-10 rounded bg-gradient-to-r', '班级排行榜按钮应为 40px 高、4px 圆角。');
requireText(classListSource, 'flex flex-col items-start gap-4 px-1', '“只显示任教班级”应放在班级排行榜下方，并与排行榜保持 16px 间距。');
requireText(classListSource, 'flex flex-col items-start gap-4 px-1', '班级排行榜、任教筛选、班级卡片之间应保持 16px 间距。');
requireText(classListSource, 'h-[10px] rounded-[14px] border-0 px-0', '任教班级筛选按钮应按标注压缩高度、圆角、边框和左右内边距。');
requireText(classListSource, 'classes.filter(cls => teachingClassIds.has(cls.id))', '勾选后应只展示 teachingAssignments 中的班级。');
requireText(classListSource, 'h-[160px] bg-white rounded', '班级卡片高度应收敛为 160px。');
requireText(classListSource, 'h-[38px] rounded', '班级卡片底部操作按钮应为 38px 高、4px 圆角。');
requireText(appSource, 'teacherProfile={teacherProfile}', 'App 应把当前教师资料传给班级列表。');

if (classListSource.includes('共 {classes.length} 个班级')) {
  throw new Error('班级列表顶部不应继续展示“共 x 个班级”统计信息。');
}

console.log('class list teaching-only filter assertions passed');

if (classListSource.includes("showTeachingOnly ? 'border-blue-200")) {
  throw new Error('勾选后筛选按钮不应继续显示蓝色边框。');
}

if (classListSource.includes('min-h-11 rounded-2xl px-3')) {
  throw new Error('任教班级筛选按钮不应继续使用 44px 高和 12px 左右内边距。');
}
if (classListSource.includes('py-3.5')) {
  throw new Error('班级卡片不应继续使用较高的纵向内边距导致高度超过 160px。');
}
if (classListSource.includes('py-2.5 rounded-xl')) {
  throw new Error('卡片底部操作按钮不应继续使用 40px 高和 12px 圆角。');
}

if (classListSource.includes('rounded-2xl text-sm font-semibold shadow-md')) {
  throw new Error('班级排行榜按钮不应继续使用 16px 圆角和 46px 高度。');
}
if (classListSource.includes("showTeachingOnly ? 'bg-blue-50")) {
  throw new Error('任教筛选选中态不应继续显示浅蓝背景。');
}
if (classListSource.includes('shadow-sm shadow-blue-100')) {
  throw new Error('任教筛选选中态不应继续显示阴影。');
}
