import fs from 'node:fs';

const viewSource = fs.readFileSync(new URL('./ClassDetailView.tsx', import.meta.url), 'utf8');
const cardSource = fs.readFileSync(new URL('../components/student/StudentRosterCard.tsx', import.meta.url), 'utf8');
const rosterNumberSource = fs.readFileSync(new URL('../components/student/StudentRosterNumber.tsx', import.meta.url), 'utf8');
const tokenSource = fs.readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const recordInputBarSource = fs.readFileSync(new URL('../components/TeacherRecordInputBar.tsx', import.meta.url), 'utf8');
const source = `${viewSource}\n${cardSource}`;
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const mobileStyles = fs.readFileSync(new URL('../index.css', import.meta.url), 'utf8');
const avatarSource = fs.readFileSync(new URL('../components/student-performance/StudentPerformanceAvatar.tsx', import.meta.url), 'utf8');
const metaSource = fs.readFileSync(new URL('../components/student-performance/StudentPerformanceMeta.tsx', import.meta.url), 'utf8');
const levelIconDirectory = new URL('../assets/resources/student-level-icons/', import.meta.url);

const requireText = (text, message) => {
  if (!source.includes(text)) throw new Error(message);
};

requireText('student-roster-grid grid shrink-0 gap-x-2.5 gap-y-3', '学生列表应使用横向10像素、纵向12像素间距。');
requireText('px-3 pb-40', '学生列表应保留12像素左右留白。');
requireText('h-[var(--tm-student-card-height-full)]', '完整学生卡片应使用120像素高度 Token。');
requireText('h-[var(--tm-student-card-height-compact)]', '只保留一类表现信息时应使用104像素紧凑高度 Token。');
requireText('h-[var(--tm-student-card-height-minimal)]', '隐藏表现信息后应使用88像素最小高度 Token。');
requireText('overflow-visible rounded-[var(--tm-radius-inner)] bg-[var(--tm-bg-surface)]', '学生卡片应允许右上角多选框跨出卡片，避免遮挡等级图标。');
if (source.includes("isSelectionMode && isSelected ? 'border-[var(--tm-brand-primary)]'")) {
  throw new Error('学生卡片选中时不应显示品牌红边框。');
}
requireText('absolute -right-1 -top-1', '学生多选框应向右上方各外移4像素并跨在卡片边框上。');
requireText('h-[18px] w-[18px]', '学生多选框应保持18像素可见尺寸。');
requireText("selected ? 'bg-[var(--tm-brand-primary)]' : 'bg-white'", '学生多选框选中时应使用实心品牌红圆底。');
requireText('<CheckIcon className="h-3 w-3 text-white [stroke-width:3]" />', '实心选中框中应展示清晰的白色勾选图标。');
if (source.includes('bg-[var(--tm-brand-primary-soft)] ring-2')) {
  throw new Error('选中学生卡片不应整体使用品牌红背景。');
}
requireText('rounded-[var(--tm-radius-inner)]', '学生卡片应使用16像素内层圆角，减轻连续气泡感。');
requireText('StudentRosterNumber', '学生卡片应复用统一的班内学号组件。');
if (!rosterNumberSource.includes("padStart(2, '0')")) throw new Error('两位班内学号应保留前导零。');
requireText('inline-flex min-w-0 max-w-full items-center justify-center gap-0.5', '班内学号与姓名应组成完整身份组并整体居中。');
requireText('StudentRosterNumber studentNo={studentNo}', '班内学号应保持稳定宽度，不因姓名长度发生变化。');
requireText('variant="student-card"', '学生卡片应使用独立的学号强化规格，避免影响其他复用场景。');
requireText('text-[length:var(--tm-student-card-name-font-size)] [font-weight:var(--tm-student-card-name-font-weight)] leading-4', '手机端姓名应使用12像素字号 Token 和500字重。');
if (!rosterNumberSource.includes("variant === 'student-card'")) throw new Error('学号组件应提供学生卡片专用变体。');
if (!rosterNumberSource.includes('h-[var(--tm-student-card-roster-height-strong)] w-[var(--tm-student-card-roster-width-strong)] text-[length:var(--tm-student-card-roster-font-size-strong)] [font-weight:var(--tm-student-card-roster-font-weight-strong)]')) throw new Error('学生卡片学号应使用16像素宽、14像素高、11像素字号和800字重的强化规格。');
if (!rosterNumberSource.includes('h-[var(--tm-student-card-roster-height)] w-4 text-[length:var(--tm-student-card-roster-font-size)]')) throw new Error('非学生卡片场景应保留16像素宽、14像素高和9像素字号的默认规格。');
requireText('self-center', '班内学号应在16像素姓名信息行内垂直居中。');
if (!rosterNumberSource.includes('shrink-0 items-center justify-center rounded-[4px]') || !rosterNumberSource.includes('font-bold')) throw new Error('班内学号应保持稳定宽度并使用700字重。');
if (!rosterNumberSource.includes('text-[var(--tm-student-roster-number-text)]')) throw new Error('班内学号应统一使用公共文字色 Token。');
if (!tokenSource.includes("'--tm-student-roster-number-text': teacherBrandSemantic.textPrimary")) throw new Error('班内学号数字应使用主文字深色，避免真实手机上辨识度不足。');
if (!tokenSource.includes("'--tm-student-card-roster-font-size-strong': '11px'")
  || !tokenSource.includes("'--tm-student-card-roster-width-strong': '16px'")
  || !tokenSource.includes("'--tm-student-card-roster-height-strong': '14px'")
  || !tokenSource.includes("'--tm-student-card-roster-font-weight-strong': '800'")) {
  throw new Error('学生卡片学号强化规格应集中在教师端 Token 中维护。');
}
if (source.includes('absolute right-full')) {
  throw new Error('班内学号不应再通过绝对定位脱离身份组，避免四字姓名时越出卡片。');
}
requireText('StudentPerformanceAvatar', '学生卡片应展示头像等级进度环。');
requireText('StudentPerformanceLevelIcons', '学生卡片应单独展示居中的等级图标。');
requireText('StudentPerformanceValues', '学生卡片应单独展示加扣分数据。');
requireText('variant="student-card"', '学生卡片应使用独立的紧凑奖惩次数规格，避免影响小组卡片。');
const levelIndex = source.indexOf('showLevelIcons && <StudentPerformanceLevelIcons level={level} iconSize="student-card" />');
const avatarIndex = source.indexOf('<StudentPerformanceAvatar', levelIndex);
const valuesIndex = source.indexOf('<StudentPerformanceValues', avatarIndex);
const rosterIndex = source.indexOf('StudentRosterNumber studentNo={studentNo}', valuesIndex);
if (!(levelIndex < avatarIndex && avatarIndex < valuesIndex && valuesIndex < rosterIndex)) {
  throw new Error('学生卡片应按等级、头像、加扣分数据、学号与姓名的顺序展示。');
}
requireText('showLevelProgress={showLevelIcons}', '只有等级图标形式才展示头像等级进度环。');
requireText('const showPraise = displaySettings.showEvaluation && displaySettings.showPraise;', '加分应同时受总开关和显示内容控制。');
requireText('const showCriticism = displaySettings.showEvaluation && displaySettings.showCriticism;', '扣分应同时受总开关和显示内容控制。');
requireText('showPraise={showPraise}', '学生卡片应使用总开关处理后的加分状态。');
requireText('showCriticism={showCriticism}', '学生卡片应使用总开关处理后的扣分状态。');
if (source.includes('valueMode')) throw new Error('可见的加分和扣分固定按分值展示，不应再传递次数或分值模式。');
requireText('flex min-h-0 w-full flex-1 flex-col items-center justify-start gap-[3px]', '等级图标、头像、表现数据和姓名应保持统一间距并整体上移。');
if (!avatarSource.includes('stroke="var(--tm-student-level-progress)"')) {
  throw new Error('头像进度环应统一使用奖励进度色。');
}
if ((avatarSource.match(/strokeWidth="2"/g) ?? []).length !== 2) {
  throw new Error('学生卡片头像进度环应使用2像素描边，降低等级开启后的视觉噪音。');
}
if (!avatarSource.includes('showLevelProgress && (')) {
  throw new Error('头像进度环应受等级显示设置控制。');
}
if (!avatarSource.includes("showLevelProgress ? 'inset-1' : 'inset-0'")) {
  throw new Error('分值形式隐藏进度环时头像应填满58像素盒子，避免上下间距不一致。');
}
if (avatarSource.includes('MaleIcon') || avatarSource.includes('FemaleIcon') || avatarSource.includes('student.gender')) {
  throw new Error('普通花名册头像不应常驻展示性别角标。');
}
if (!avatarSource.includes("compact ? 'h-[58px] w-[58px]'")) {
  throw new Error('手机花名册紧凑卡片的头像进度环应使用58像素尺寸。');
}
if (metaSource.includes('ThumbsUp') || metaSource.includes('ThumbsDown')) {
  throw new Error('奖惩次数应只通过双色数字展示，不增加常驻图标。');
}
if (!metaSource.includes('bg-[var(--tm-student-praise-soft') || !metaSource.includes('bg-[var(--tm-student-criticism-soft)]')) {
  throw new Error('奖惩次数应使用浅绿、浅红局部色片。');
}
if (!metaSource.includes('min-w-[24px]') || metaSource.includes('w-full grid-cols-2')) {
  throw new Error('奖惩色片应保持局部尺寸，不得再次形成贴边通栏。');
}
if (!metaSource.includes("variant === 'student-card'")
  || !metaSource.includes('h-[var(--tm-student-card-count-height)]')
  || !metaSource.includes('text-[length:var(--tm-student-card-count-font-size)] font-bold')) {
  throw new Error('奖惩次数应使用14像素高度、10像素字号和700字重的学生卡片 Token。');
}
if (!metaSource.includes("iconSize === 'student-card'")
  || !metaSource.includes('tm-student-card-level-icon-size')
  || !metaSource.includes('tm-student-card-level-row-height')) {
  throw new Error('手机花名册等级图标应使用独立的16像素尺寸和16像素图标行。');
}
if (!tokenSource.includes("'--tm-student-card-level-icon-size': '16px'")) {
  throw new Error('手机花名册等级图标尺寸 Token 应为16像素。');
}
if (!metaSource.includes("level.iconCount === 0") || !metaSource.includes('student-level-icons/sprout.png')) {
  throw new Error('尚未点亮等级图标时应展示一株18像素小豆苗作为成长起步状态。');
}
if (!metaSource.includes("formatSignedScore(summary.praiseScore, '+')") || !metaSource.includes("formatSignedScore(summary.criticismScore, '-')")) {
  throw new Error('加扣分分值应通过正负号与颜色共同表达语义。');
}
if (!metaSource.includes('showPraise && (') || !metaSource.includes('showCriticism && (')) {
  throw new Error('加分和扣分必须支持独立显示。');
}
if (metaSource.includes("from 'lucide-react'")) {
  throw new Error('等级标识应使用专用金色图片，不应退回通用线性图标。');
}
for (const iconName of ['sprout', 'star', 'moon', 'sun', 'crown']) {
  const iconFile = new URL(`${iconName}.png`, levelIconDirectory);
  const iconBuffer = fs.readFileSync(iconFile);
  if (iconBuffer.readUInt32BE(16) !== 128 || iconBuffer.readUInt32BE(20) !== 128) {
    throw new Error(`${iconName}等级图标应保持128×128像素，兼顾清晰度与加载体积。`);
  }
}
if (!appSource.includes('summarizeStudentPerformance(records)')) {
  throw new Error('应用数据层应把学生评价记录汇总为净得分和奖惩次数。');
}
if (!appSource.includes('const selectedTargetCount = isGroupSelectionTarget ? classGroupSelectionState.count : targetIds.length;')
  || !appSource.includes('const hasSelectionTarget = !isMultiSelectMode || selectedTargetCount > 0;')
  || !appSource.includes('hasSelectionTarget={hasSelectionTarget}')
  || !recordInputBarSource.includes('disabled={!hasSelectionTarget}')) {
  throw new Error('多选未选中学生时应禁用底部录入，避免误录全班。');
}

if (source.includes('grid-cols-3')) {
  throw new Error('学生列表不应继续固定为一行3人。');
}

if (!mobileStyles.includes('repeat(auto-fill, minmax(84px, 1fr))')) {
  throw new Error('学生列表应通过84像素最小卡宽在手机4列和宽屏5列之间自适应。');
}

console.log('学生卡片等级、学号与高密度布局校验通过。');
