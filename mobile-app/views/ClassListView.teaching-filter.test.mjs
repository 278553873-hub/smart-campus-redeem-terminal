import fs from 'node:fs';

const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText(classListSource, 'teacherProfile: TeacherProfile;', '班级列表应接收教师资料，用任教关系过滤班级。');
requireText(classListSource, 'showTeachingOnly', '班级列表应有“只显示任教班级”的勾选状态。');
requireText(classListSource, 'teachingClassIds', '班级列表应基于 teachingAssignments 生成任教班级集合。');
requireText(classListSource, 'homeroomClassIds', '任教班级应同时包含班主任班级。');
requireText(classListSource, 'assignedClassIds', '班级列表应合并任教学科和班主任关系。');
requireText(classListSource, 'visibleClasses', '班级列表渲染应使用过滤后的班级列表。');
requireText(classListSource, '只显示任教班级', '顶部操作区应提供“只显示任教班级”选项。');
requireText(classListSource, "isSchoolSpace && gradeFilter !== '全部'", '年级筛选只能作用于学校版。');
requireText(classListSource, 'isSchoolSpace && showTeachingOnly && !assignedClassIds.has(classInfo.id)', '任教筛选只能作用于学校版，并依据真实任教关系过滤。');
requireText(classListSource, 'className={`flex min-h-11 items-center gap-2 rounded-[var(--tm-radius-control)]', '任教班级筛选按钮应使用统一控件圆角，并保留完整触控热区。');
requireText(classListSource, 'min-h-11 w-full appearance-none rounded-[var(--tm-radius-control)]', '学校版年级筛选应提供至少 44px 触控高度。');
requireText(classListSource, 'rounded-[var(--tm-radius-card)] bg-white px-4 py-3 [box-shadow:0_12px_28px_-16px_var(--tm-shadow-neutral-color),0_3px_10px_-7px_var(--tm-shadow-neutral-color)]', '班级卡片应使用统圆角与无边框双层阴影。');
requireText(classListSource, 'flex min-h-11 items-center justify-center gap-2 rounded-[var(--tm-radius-control)]', '班级卡片底部操作按钮应满足 44px 最小触控高度。');
requireText(appSource, 'teacherProfile={teacherProfile}', 'App 应把当前教师资料传给班级列表。');

if (classListSource.includes('共 {classes.length} 个班级')) {
  throw new Error('班级列表顶部不应继续展示“共 x 个班级”统计信息。');
}

console.log('class list teaching-only filter assertions passed');

if (classListSource.includes("showTeachingOnly ? 'border-blue-200")) {
  throw new Error('勾选后筛选按钮不应继续显示蓝色边框。');
}

if (classListSource.includes('h-[10px]') || classListSource.includes('h-[38px]')) {
  throw new Error('任教筛选和班级卡操作不应继续使用低于 44px 的触控高度。');
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
