import fs from 'node:fs';

const component = fs.readFileSync('mobile-app/components/TeacherFluidGlassNav.tsx', 'utf8');
const css = fs.readFileSync('mobile-app/styles/navigation.css', 'utf8');
const app = fs.readFileSync('mobile-app/App.tsx', 'utf8');
const failures = [];

function requireText(source, text, message) {
  if (!source.includes(text)) failures.push(message);
}

requireText(css, 'rgba(255, 255, 255, 0.62)', '底部导航底色应为干净的浅色半透明玻璃。');
requireText(css, 'backdrop-filter: blur(22px) saturate(150%)', '底部导航应保留简单玻璃模糊，不要高对比 3D 效果。');
requireText(css, '0 10px 28px rgba(15, 23, 42, 0.08)', '底部导航阴影应轻柔，不要厚重 3D 投影。');
requireText(css, 'background: rgba(255, 255, 255, 0.52);', '选中滑块应是简单浅玻璃底，而不是复杂 3D 高光。');
requireText(component, "slider-jelly-active-", '底部导航选中滑块切换时应保留 Q 弹效果。');
requireText(css, 'slider-jelly-wobble', '底部导航选中滑块应保留 Q 弹关键帧。');
requireText(app, 'className="ai-tabbar-container"', '底部导航容器不应再挂载果冻动画类。');

for (const forbidden of [
  'radial-gradient(circle at 18% 12%',
  'radial-gradient(circle at 82% 88%',
  'tabbar-jelly-active-',
  'container-jelly-wobble',
  '0 18px 46px rgba(47, 72, 116, 0.13)',
]) {
  if (component.includes(forbidden) || css.includes(forbidden) || app.includes(forbidden)) failures.push(`底部导航底板不应保留 3D/厚重效果：${forbidden}`);
}

if (failures.length) throw new Error(failures.join('\n'));
console.log('teacher bottom nav clean glass assertions passed');
