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
requireText('h-[136px]', '学生卡片应使用稳定的136像素高度。');
requireText('rounded-[var(--tm-radius-inner)]', '学生卡片应使用16像素内层圆角，减轻连续气泡感。');
requireText('px-5 font-mono text-[9px]', '学生卡片应在顶部弱化展示完整学号。');
requireText('StudentPerformanceAvatar', '学生卡片应展示头像等级进度环。');
requireText('StudentPerformanceMeta', '学生卡片应展示等级图标和奖惩次数。');
if (source.indexOf('aria-label={`学号${studentNo}`}') > source.indexOf('<StudentPerformanceAvatar')) {
  throw new Error('完整学号应展示在头像上方。');
}
if (!avatarSource.includes('stroke="var(--tm-student-level-progress)"')) {
  throw new Error('头像进度环应统一使用奖励进度色。');
}
if (avatarSource.includes('rounded-full ring-2 ring-white')) {
  throw new Error('性别图标不应继续使用白色图标和彩色圆底。');
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
if (metaSource.includes("from 'lucide-react'")) {
  throw new Error('等级标识应使用专用金色图片，不应退回通用线性图标。');
}
for (const iconName of ['star', 'moon', 'sun', 'crown']) {
  const iconFile = new URL(`${iconName}.png`, levelIconDirectory);
  const iconBuffer = fs.readFileSync(iconFile);
  if (iconBuffer.readUInt32BE(16) !== 128 || iconBuffer.readUInt32BE(20) !== 128) {
    throw new Error(`${iconName}等级图标应保持128×128像素，兼顾清晰度与加载体积。`);
  }
}
if (!appSource.includes('summarizeStudentPerformance(records)')) {
  throw new Error('应用数据层应把学生评价记录汇总为净得分和奖惩次数。');
}

if (source.includes('grid-cols-3')) {
  throw new Error('学生列表不应继续固定为一行3人。');
}

if (!mobileStyles.includes('repeat(auto-fill, minmax(84px, 1fr))')) {
  throw new Error('学生列表应通过84像素最小卡宽在手机4列和宽屏5列之间自适应。');
}

console.log('学生卡片等级、学号与高密度布局校验通过。');
