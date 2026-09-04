import fs from 'node:fs';

const classListSource = fs.readFileSync(new URL('./ClassListView.tsx', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

const requireText = (source, needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText(classListSource, 'teacherProfile: TeacherProfile;', '班级列表应接收教师资料，用任教关系过滤班级。');
requireText(classListSource, 'showTeachingOnly', '班级列表应有“任教班级”的勾选状态。');
requireText(classListSource, 'teachingClassIds', '班级列表应基于 teachingAssignments 生成任教班级集合。');
requireText(classListSource, 'homeroomClassIds', '任教班级应同时包含班主任班级。');
requireText(classListSource, 'assignedClassIds', '班级列表应合并任教学科和班主任关系。');
requireText(classListSource, 'visibleClasses', '班级列表渲染应使用过滤后的班级列表。');
requireText(classListSource, '任教班级', '学校版筛选行应提供“任教班级”选项。');
requireText(classListSource, "isSchoolSpace && gradeFilter !== '全部'", '年级筛选只能作用于学校版。');
requireText(classListSource, 'isSchoolSpace && showTeachingOnly && !assignedClassIds.has(classInfo.id)', '任教筛选只能作用于学校版，并依据真实任教关系过滤。');
requireText(classListSource, 'className={`flex min-h-11 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-[var(--tm-radius-control)] bg-transparent', '任教班级筛选按钮应保持透明，并保留完整触控热区。');
requireText(classListSource, 'inline-flex min-h-11 w-[96px] shrink-0 items-center gap-[var(--tm-space-1)]', '学校版年级筛选触发器应保持 96px 固定宽度，并提供至少 44px 触控高度。');
requireText(classListSource, 'gap-[var(--tm-space-1)]', '学校版年级筛选的当前值与箭头应紧邻排列。');
requireText(classListSource, "option === '全部' ? '全部年级' : option", '学校版年级筛选默认文案应明确展示“全部年级”。');
requireText(classListSource, "showTeachingOnly ? 'bg-[var(--tm-brand-primary)] text-white'", '任教班级选中态应只强化勾选框本体。');
requireText(classListSource, '{visibleClasses.length}个班级', '学校版筛选行应展示年级与任教条件共同作用后的班级数量。');
requireText(classListSource, 'aria-live="polite"', '筛选结果数量变化应提供动态读屏反馈。');
requireText(classListSource, 'rounded-[var(--tm-class-list-card-radius)] bg-white px-4 pb-1 pt-3 [box-shadow:var(--tm-shadow-card)]', '班级卡片应使用统一圆角与普通卡片阴影令牌。');
requireText(classListSource, 'flex min-h-11 items-center justify-center gap-2 rounded-[var(--tm-radius-control)]', '班级卡片底部操作按钮应满足 44px 最小触控高度。');
requireText(appSource, 'teacherProfile={teacherProfile}', 'App 应把当前教师资料传给班级列表。');

if (classListSource.includes('共 {classes.length} 个班级')) {
  throw new Error('学校版筛选结果不得继续展示未经过筛选的班级总数。');
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
if (classListSource.includes("showTeachingOnly ? 'bg-[var(--tm-brand-primary)] text-white' : 'bg-[var(--tm-bg-surface)]")) {
  throw new Error('任教筛选选中态不得继续使用整块品牌红填充。');
}
