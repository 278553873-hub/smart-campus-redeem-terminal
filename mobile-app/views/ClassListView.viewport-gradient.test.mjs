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
requireText(classList, 'text-lg font-semibold text-[var(--tm-text-primary)]', '班级卡片标题字号应为 18px，并使用正文 Token。');
requireText(classList, 'px-2 py-0.5 text-xs font-normal text-[var(--tm-text-secondary)]', '普通学科标签字号应为 12px，并使用辅助文字 Token。');
requireText(classList, "addDemoTopBreathingSpace ? 'pt-5' : 'pt-3'", '班级列表顶距应与记录页的来源触发器精确对齐。');
requireText(classList, 'variant="quiet"', '班级页的班级来源触发器应与记录页保持轻量样式一致。');
requireText(classList, 'bg-white px-4 py-3 [box-shadow:0_12px_28px_-16px_var(--tm-shadow-neutral-color),0_3px_10px_-7px_var(--tm-shadow-neutral-color)]', '白色班级卡片应使用无边框的双层中性轻阴影建立层级。');
if (classList.includes('rounded-[var(--tm-radius-card)] border border-[var(--tm-border-subtle)] bg-white')) failures.push('班级卡片不应使用边框分割页面。');
requireText(mobileApp, 'addDemoTopBreathingSpace={!showPhoneShell}', '班级页应获取手机壳环境以调整顶部呼吸空间。');

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
