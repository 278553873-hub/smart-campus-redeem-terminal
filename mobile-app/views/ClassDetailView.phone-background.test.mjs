import fs from 'node:fs';

const appSource = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const detailSource = fs.readFileSync('mobile-app/views/ClassDetailView.tsx', 'utf8');
const failures = [];

function requireText(source, text, message) {
  if (!source.includes(text)) failures.push(message);
}

requireText(appSource, "['home_log', 'class_list', 'class_detail', 'me']", '班级详情页应纳入手机壳屏幕级背景页面。');
requireText(appSource, "currentView === 'class_list' || currentView === 'class_detail'", '班级列表和班级详情应共用手机壳全屏渐变背景。');
requireText(appSource, 'hasScreenLevelBackground ? \'bg-transparent\' : \'bg-white\'', '班级详情页内容外壳应透明，让底层背景覆盖状态栏和页面。');
requireText(appSource, "hasScreenLevelBackground ? 'bg-white/38", '有屏幕级背景时顶部栏应为半透明玻璃，不应是白色实条。');
requireText(detailSource, 'className="flex flex-col h-full bg-transparent"', '班级详情页根容器应透明，不能把背景写进滚动内容。');

if (detailSource.includes('teacher-mobile-soft-page')) {
  failures.push('班级详情页不应使用滚动内容内部的 teacher-mobile-soft-page 背景。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('ClassDetailView phone shell background assertions passed');
