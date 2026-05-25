import fs from 'node:fs';

const source = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const assetsSource = fs.readFileSync(new URL('../assets/images.ts', import.meta.url), 'utf8');

const requireText = (haystack, needle, message) => {
  if (!haystack.includes(needle)) throw new Error(message);
};

requireText(assetsSource, 'teacher-me-hero-bg.png', '我的页面教师卡片应使用无文字 image-2 背景资源。');
requireText(assetsSource, 'teacher-liu-avatar.png', '刘飞飞老师头像应使用真实中国女教师头像资源。');
requireText(assetsSource, 'TEACHER_ME_HERO_BG', '教师卡片背景资源应收敛到 ASSETS.MANAGEMENT。');
requireText(source, 'ASSETS.MANAGEMENT.TEACHER_ME_HERO_BG', '我的页面应使用 image-2 背景图作为教师卡片与页面扩展背景。');
requireText(source, 'teacherProfile.avatar', '头像必须保持独立真实数据区域，不能固化在整卡图片里。');
requireText(source, '刘飞飞老师', '姓名应保持独立文本区域。');
requireText(source, '成都七中初中附属小学', '学校应保持独立文本区域。');
requireText(source, '编辑教师信息', '编辑按钮应保持独立可点击区域。');
requireText(source, 'top-[190px]', '页面底部背景应延续教师卡片图形向下发散。');
requireText(source, 'scale-150 object-cover object-right-bottom blur-2xl', '扩展背景应使用同一背景图放大模糊。');
requireText(source, 'min-h-[173px]', '教师卡片高度应按浏览器标注调整为 173px。');
requireText(source, 'onClick={onEditTeacherProfile}', '头像和编辑按钮应进入编辑教师信息页。');

if (source.includes('TEACHER_ME_HERO_CARD')) {
  throw new Error('不应使用整张教师卡片截图，头像/姓名/学校/按钮必须独立渲染。');
}

if (source.includes('absolute bottom-0 right-0 flex h-8 w-8')) {
  throw new Error('头像区域不应再叠加相机 icon 角标。');
}

if (source.includes('bg-gradient-to-br from-blue-600 to-cyan-500')) {
  throw new Error('教师卡片不应继续使用旧的深蓝整卡渐变。');
}

console.log('MeView teacher hero layered background assertions passed');
