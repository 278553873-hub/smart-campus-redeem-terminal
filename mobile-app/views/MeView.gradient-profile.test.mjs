import fs from 'node:fs';

const source = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const assetsSource = fs.readFileSync(new URL('../assets/images.ts', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

const requireText = (haystack, needle, message) => {
  if (!haystack.includes(needle)) throw new Error(message);
};

requireText(assetsSource, 'teacher-liu-avatar.png', '刘飞飞老师头像应使用真实中国女教师头像资源。');
requireText(source, 'teacherProfile.avatar', '头像必须保持独立真实数据区域，不能固化在整卡图片里。');
requireText(source, 'const displayAvatar = teacherProfile.avatar === ASSETS.AVATAR.TEACHER_LIU', '我的页默认教师头像应使用无外框原图展示，避免头像内容被资源留白压小。');
requireText(source, 'ASSETS.AVATAR.TEACHER_LIU_RAW', '默认教师头像展示应回退到无外框原图，由页面圆形容器负责边框与裁切。');
requireText(source, 'object-cover object-center', '教师头像图片应覆盖圆形容器，不能使用 object-contain 留白。');
requireText(source, '刘飞飞老师', '姓名应保持独立文本区域。');
requireText(source, 'text-[22px] font-extrabold leading-tight tracking-tight text-slate-950', '我的页面教师姓名字号应按方案 7 信息区放大到 22px。');
requireText(source, '编辑教师信息', '编辑按钮应保持独立可点击区域。');
requireText(assetsSource, 'teacher-me-page-bg.png', '我的页面底部背景应使用 pic 生成的真实图片资产。');
requireText(appSource, 'ASSETS.MANAGEMENT.TEACHER_ME_PAGE_BG', '我的页面屏幕级背景应引用真实图片资产，而不是 CSS 绘制。');
requireText(source, 'min-h-[164px]', '教师信息展示区应压缩高度，避免头像区域占用过多空间。');
requireText(source, 'Camera', '教师头像右下角应使用相机图标。');
requireText(source, 'border border-white bg-white text-blue-500', '我的页头像相机图标应使用白色实底，避免透明底导致看不清。');
requireText(source, "const topActionButtonClass = 'flex h-12 w-12 items-center justify-center rounded-full bg-white/74 text-slate-600", '顶部扫一扫和设置应使用统一的次要操作颜色。');
requireText(source, 'absolute right-4 top-2 flex shrink-0 items-center gap-1', '顶部扫一扫和设置应保留独立圆按钮，并通过更近间距体现亲密性。');
requireText(source, '成都市未来实验小学', '教师信息区应保留学校/来源切换入口。');
requireText(source, '管理工具', '我的页应将常用功能分组改为管理工具。');
requireText(source, '更多工具', '我的页应将更多功能分组改为更多工具。');
requireText(source, 'secondaryIconClass', '更多工具应使用统一蓝色小号纯色图标样式。');
requireText(source, 'variant="secondary"', '更多工具应使用 secondary 样式，和管理工具拉开层级。');
requireText(source, 'h-12 w-12 items-center justify-center rounded-full', '更多工具图标应缩小并使用圆形浅底。');
requireText(source, "bg-[#EEF7FF] text-[#2F9FF4]", '更多工具图标应统一采用蓝色系。');
requireText(source, '学校报表', '管理工具应包含学校报表。');
requireText(source, '期末报告', '管理工具应包含期末报告。');
requireText(source, "title: '班主任助理'", '管理工具中班主任助理入口名称不应继续带 AI 前缀。');
requireText(source, "title: '校长助理'", '管理工具中校长助理入口名称不应继续带 AI 前缀。');
requireText(assetsSource, 'ai-art-badge.png', 'AI 角标应使用 pic 生成的独立艺术字资源。');
requireText(source, "imageBadgeSrc: ASSETS.MANAGEMENT.AI_ART_BADGE", 'AI 助理类图标右下角应展示独立 AI 图片角标。');
requireText(source, 'overflow-visible rounded-[17px]', '图片工具图标容器应允许 AI 角标一半露出图标外部。');
requireText(source, 'absolute -bottom-2 -right-2 h-6 w-6', 'AI 角标应定位在图标右下角，并形成半内半外的位置关系。');
requireText(source, '科目管理', '更多工具应包含科目管理。');
requireText(source, '部门管理', '更多工具应包含部门管理。');
requireText(source, '货币发放', '更多工具应包含货币发放。');
requireText(source, '建议反馈', '更多工具应包含建议反馈。');
requireText(source, 'bg-white p-5', '常用功能、更多功能卡片应使用明确白色底。');
requireText(source, 'onClick={onEditTeacherProfile}', '头像和编辑按钮应进入编辑教师信息页。');

if (source.includes('我的文件')) {
  throw new Error('我的页工具区不应继续展示我的文件入口。');
}

if (source.includes('成都七中初中附属小学')) {
  throw new Error('我的页不应展示与切换学校入口重复的学校文案。');
}

if (source.includes('ShieldCheck')) {
  throw new Error('教师头像右下角不应继续使用认证盾牌图标，应改为相机图标。');
}

if (source.includes('ToolSection title="常用功能"') || source.includes('ToolSection title="更多功能"')) {
  throw new Error('我的页工具分组标题不应继续使用常用功能/更多功能。');
}

if (source.includes("title: 'AI校长助理'")) {
  throw new Error('校长助理入口名称不应继续显示为 AI校长助理。');
}

if (source.includes("title: 'AI班主任助理'")) {
  throw new Error('班主任助理入口名称不应继续显示为 AI班主任助理。');
}

if (source.includes('top-11 h-px bg-gradient-to-r')) {
  throw new Error('工具卡片标题区域不应保留横向装饰线。');
}

if (source.includes('secondaryIconToneClass')) {
  throw new Error('更多工具图标不应继续按不同 tone 使用多色样式，应统一为蓝色系。');
}

if (source.includes('TEACHER_ME_HERO_CARD')) {
  throw new Error('不应使用整张教师卡片截图，头像/姓名/学校/按钮必须独立渲染。');
}

if (source.includes('bg-gradient-to-br from-blue-600 to-cyan-500')) {
  throw new Error('教师卡片不应继续使用旧的深蓝整卡渐变。');
}

if (source.includes('ASSETS.MANAGEMENT.TEACHER_ME_HERO_BG')) {
  throw new Error('方案 7 还原后，老师信息区不应再使用整张教师卡背景图。');
}

if (appSource.includes('radial-gradient(circle_at_18%_6%')) {
  throw new Error('我的页面背景不应继续用 CSS 绘制弥散渐变，应使用 pic 生成图片。');
}

if (source.includes('pointer-events-none absolute -left-24 -right-28 top-0')) {
  throw new Error('我的页背景图层不应放在滚动内容内部。');
}

if (source.includes('bg-[#F4FCFF]')) {
  throw new Error('我的页根容器不应使用纯色底覆盖手机壳背景。');
}

if (source.includes('${phoneText.pageTitle} text-slate-950')) {
  throw new Error('我的页面教师姓名不应继续使用全局 pageTitle 24px。');
}

console.log('MeView option 7 restoration assertions passed');
