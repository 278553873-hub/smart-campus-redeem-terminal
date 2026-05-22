import fs from 'node:fs';

const source = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');

const requireText = (needle, message) => {
  if (!source.includes(needle)) throw new Error(message);
};

requireText('bg-gradient-to-br from-blue-600 to-cyan-500', '我的页面老师基本信息卡片应复刻作业录入页渐变背景。');
requireText('text-white', '渐变资料卡应使用白色文字保证对比度。');
requireText('bg-white/16', '老师标签应改为适配渐变背景的半透明样式。');
requireText('ring-2 ring-white/80', '头像应增加白色描边以适配渐变背景。');
