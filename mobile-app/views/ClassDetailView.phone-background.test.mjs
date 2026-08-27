import fs from 'node:fs';

const appSource = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const detailSource = fs.readFileSync('mobile-app/views/ClassDetailView.tsx', 'utf8');
const failures = [];

function requireText(source, text, message) {
  if (!source.includes(text)) failures.push(message);
}

requireText(appSource, "'class_detail'", '班级详情页应纳入手机壳屏幕级背景页面。');
const plainBackgroundList = appSource.match(/const PLAIN_BACKGROUND_VIEWS: ViewState\[\] = \[([^\]]+)\]/)?.[1] ?? '';
requireText(plainBackgroundList, "'class_detail'", '班级学生列表应使用纯白标题栏、浅灰内容区背景。');
requireText(appSource, '<TeacherMobileScreenBackground variant="plain" />', '班级学生列表应复用公共纯色屏幕背景组件。');
requireText(appSource, "hasPlainBackground ? 'bg-[var(--tm-page-plain-content-bg)]'", '班级学生列表内容外壳应使用浅灰内容背景 Token。');
requireText(appSource, 'h-11 bg-[var(--tm-page-plain-header-bg)]', '班级学生列表顶部应使用纯白标题栏背景 Token。');
requireText(appSource, "hasPlainBackground ? 'z-[2]' : 'z-auto'", '班级学生列表内容层必须高于纯白标题背景，避免返回导航被遮挡。');
requireText(detailSource, 'className="relative flex h-full flex-col bg-transparent"', '班级详情页根容器应透明，不能把背景写进滚动内容。');

if (detailSource.includes('teacher-mobile-soft-page')) {
  failures.push('班级详情页不应使用滚动内容内部的 teacher-mobile-soft-page 背景。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('ClassDetailView phone shell background assertions passed');
