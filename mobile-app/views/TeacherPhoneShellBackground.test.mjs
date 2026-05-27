import fs from 'node:fs';

const appSource = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const cssSource = fs.readFileSync('mobile-app/index.css', 'utf8');
const classListSource = fs.readFileSync('mobile-app/views/ClassListView.tsx', 'utf8');
const meViewSource = fs.readFileSync('mobile-app/views/MeView.tsx', 'utf8');
const failures = [];

function requireText(source, text, message) {
  if (!source.includes(text)) failures.push(message);
}

requireText(appSource, 'const getPhoneScreenBackground = () =>', '教师手机端应通过统一方法为手机壳提供屏幕级背景。');
requireText(appSource, "currentView === 'class_list'", '班级页面应进入屏幕级背景分支。');
requireText(appSource, 'teacher-mobile-phone-gradient', '班级页面应使用可铺满状态栏的手机屏幕渐变。');
requireText(appSource, "currentView === 'me'", '我的页面应进入屏幕级背景分支。');
requireText(appSource, 'ASSETS.MANAGEMENT.TEACHER_ME_HERO_BG', '我的页面屏幕级背景应沿用教师页背景图资源。');
requireText(appSource, 'screenBackground={getPhoneScreenBackground()}', 'PhoneMockup 应接收当前页面的屏幕级背景。');
requireText(cssSource, '.teacher-mobile-phone-gradient', '需要定义手机壳全屏渐变样式。');
requireText(appSource, 'const hasScreenLevelBackground', '有屏幕级背景的页面，内容容器应能切换为透明。');
requireText(appSource, "currentView !== 'class_list'", '班级首页不应显示 LocalHeader 白色标题条。');

if (classListSource.includes('teacher-mobile-viewport-gradient')) {
  failures.push('班级页不应再在滚动内容内部放置粘滞背景层。');
}

if (classListSource.includes('bg-white">')) {
  failures.push('班级页根容器不应使用白底覆盖屏幕级背景。');
}

if (meViewSource.includes('pointer-events-none absolute -left-24 -right-28 top-0')) {
  failures.push('我的页背景图层不应放在滚动内容内部。');
}

if (meViewSource.includes('bg-[#F4FCFF]')) {
  failures.push('我的页根容器不应使用纯色底覆盖屏幕级背景。');
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('teacher phone shell background assertions passed');
