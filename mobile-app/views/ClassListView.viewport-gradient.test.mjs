import fs from 'node:fs';

const classList = fs.readFileSync('mobile-app/views/ClassListView.tsx', 'utf8');
const css = fs.readFileSync('mobile-app/index.css', 'utf8');
const rootApp = fs.readFileSync('App.tsx', 'utf8');
const mobileApp = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const navCss = fs.readFileSync('mobile-app/styles/navigation.css', 'utf8');
const failures = [];

function requireText(source, text, message) {
  if (!source.includes(text)) failures.push(message);
}

requireText(navCss, 'border: 0;', '底部导航不应保留灰色边框线。');
if (navCss.includes('border: 1px solid rgba(226, 232, 240')) failures.push('底部导航 after 层不应绘制灰色描边。');
if (navCss.includes('border: 1px solid rgba(255, 255, 255, 0.68)')) failures.push('底部导航主容器不应绘制外边框线。');

requireText(mobileApp, 'teacher-mobile-phone-gradient', '班级页面应使用手机壳屏幕级渐变背景。');
requireText(css, '.teacher-mobile-phone-gradient', '需要定义手机壳全屏渐变样式。');
requireText(mobileApp, 'const hasScreenLevelBackground', '有屏幕级背景的页面，内容容器应保持透明。');
requireText(classList, 'text-lg font-semibold text-slate-800', '班级卡片标题字号应为 18px，避免 20px 在手机卡片中过重。');
requireText(classList, 'text-xs px-2 py-0.5 bg-slate-100', '普通学科标签字号应为 12px，提升小标签可读性。');

if (classList.includes('teacher-mobile-viewport-gradient')) failures.push('班级页面不应再把背景层放进滚动内容。');
if (classList.includes('bg-white">')) failures.push('班级页面根容器不应使用白底覆盖背景。');
if (classList.includes('text-xl font-semibold text-slate-800')) failures.push('班级卡片标题不应继续使用 20px。');
if (classList.includes('text-[11px] px-2 py-0.5 bg-slate-100')) failures.push('普通学科标签不应继续使用 11px。');
if (mobileApp.includes("currentView !== 'home_log' && currentView !== 'report_detail'")) failures.push('班级首页不应继续走默认白色 LocalHeader。');

requireText(rootApp, 'const [showPhoneShell, setShowPhoneShell] = useState(false);', '教师手机端模拟真实手机效果应默认关闭。');
requireText(rootApp, 'const [showParentPhoneShell, setShowParentPhoneShell] = useState(false);', '家长手机端模拟真实手机效果应默认关闭。');
requireText(rootApp, 'const [showPhoneShellToggle, setShowPhoneShellToggle] = useState(false);', '模拟真实手机效果开关应默认隐藏。');
requireText(rootApp, 'environmentTitleClickCountRef.current >= 5', '环境切换文案应点击 5 次后显示或隐藏模拟真实手机效果开关。');

if (failures.length) throw new Error(failures.join('\n'));
console.log('class list viewport gradient and phone shell assertions passed');
