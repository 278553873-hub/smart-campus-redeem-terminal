import fs from 'node:fs';

const source = fs.readFileSync(new URL('./ClassDetailView.tsx', import.meta.url), 'utf8');
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
requireText('getClassRosterNumber', '学生卡片应统一派生两位班内学号。');
requireText("padStart(2, '0')", '两位班内学号应保留前导零。');
requireText('inline-flex min-w-0 max-w-full items-center justify-center gap-0.5', '班内学号与姓名应组成完整身份组并整体居中。');
requireText('w-4 shrink-0 items-center justify-center', '班内学号应保持稳定宽度，不因姓名长度发生变化。');
requireText('text-[13px] font-semibold leading-4', '手机端姓名应使用13像素、600字重，保持清晰但不过重。');
if (source.includes('absolute right-full')) {
  throw new Error('班内学号不应再通过绝对定位脱离身份组，避免四字姓名时越出卡片。');
}
requireText('StudentPerformanceAvatar', '学生卡片应展示头像等级进度环。');
requireText('StudentPerformanceLevelIcons', '学生卡片应单独展示居中的等级图标。');
requireText('StudentPerformanceCounts', '学生卡片应单独展示奖惩次数。');
const levelIndex = source.indexOf('displaySettings.showLevel && <StudentPerformanceLevelIcons level={level} />');
const avatarIndex = source.indexOf('<StudentPerformanceAvatar', levelIndex);
const countsIndex = source.indexOf('<StudentPerformanceCounts', avatarIndex);
const rosterIndex = source.indexOf('aria-label={`学号${studentNo}`}', countsIndex);
if (!(levelIndex < avatarIndex && avatarIndex < countsIndex && countsIndex < rosterIndex)) {
  throw new Error('学生卡片应按等级、头像、奖惩次数、学号与姓名的顺序展示。');
}
requireText('showLevelProgress={displaySettings.showLevel}', '隐藏等级时应同步隐藏头像等级进度环。');
requireText('showPraiseCount={displaySettings.showPraiseCount}', '加分次数应支持独立显示设置。');
requireText('showCriticismCount={displaySettings.showCriticismCount}', '扣分次数应支持独立显示设置。');
requireText('flex min-h-0 w-full flex-1 flex-col items-center justify-center', '隐藏部分表现信息后应在当前档位高度内重新居中。');
if (!avatarSource.includes('stroke="var(--tm-student-level-progress)"')) {
  throw new Error('头像进度环应统一使用奖励进度色。');
}
if (!avatarSource.includes('showLevelProgress && (')) {
  throw new Error('头像进度环应受等级显示设置控制。');
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
if (!metaSource.includes('bg-[var(--tm-student-praise-soft)]') || !metaSource.includes('bg-[var(--tm-student-criticism-soft)]')) {
  throw new Error('奖惩次数应使用浅绿、浅红局部色片。');
}
if (!metaSource.includes('min-w-[24px]') || metaSource.includes('w-full grid-cols-2')) {
  throw new Error('奖惩色片应保持局部尺寸，不得再次形成贴边通栏。');
}
if (!metaSource.includes('h-[18px] w-[18px]')) {
  throw new Error('手机花名册等级图标应使用18像素尺寸。');
}
if (!metaSource.includes("level.iconCount === 0") || !metaSource.includes('student-level-icons/sprout.png')) {
  throw new Error('尚未点亮等级图标时应展示一株18像素小豆苗作为成长起步状态。');
}
if (!metaSource.includes("formatSignedCount(summary.praiseCount, '+')") || !metaSource.includes("formatSignedCount(summary.criticismCount, '-')")) {
  throw new Error('奖惩次数应通过正负号与颜色共同表达语义。');
}
if (!metaSource.includes('showPraiseCount && (') || !metaSource.includes('showCriticismCount && (')) {
  throw new Error('加分和扣分次数必须支持独立显示。');
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
if (!appSource.includes('const hasSelectionTarget = !isMultiSelectMode || targetIds.length > 0;') || !appSource.includes('disabled={!hasSelectionTarget}')) {
  throw new Error('多选未选中学生时应禁用底部录入，避免误录全班。');
}

if (source.includes('grid-cols-3')) {
  throw new Error('学生列表不应继续固定为一行3人。');
}

if (!mobileStyles.includes('repeat(auto-fill, minmax(84px, 1fr))')) {
  throw new Error('学生列表应通过84像素最小卡宽在手机4列和宽屏5列之间自适应。');
}

console.log('学生卡片等级、学号与高密度布局校验通过。');
