import fs from 'node:fs';

const source = fs.readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const assetsSource = fs.readFileSync(new URL('../assets/images.ts', import.meta.url), 'utf8');
const appSource = fs.readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

const requireText = (haystack, needle, message) => {
  if (!haystack.includes(needle)) throw new Error(message);
};

requireText(assetsSource, 'teacher-liu-avatar.png', '学校版刘飞头像应使用真实中国女教师头像资源。');
requireText(assetsSource, 'teacher-da-fei-avatar.png', '个人版大飞应使用独立的真实女教师头像资源。');
requireText(source, 'teacherProfile.avatar', '头像必须保持独立真实数据区域，不能固化在整卡图片里。');
requireText(source, 'const displayAvatar = teacherProfile.avatar === ASSETS.AVATAR.TEACHER_LIU', '我的页默认教师头像应使用无外框原图展示，避免头像内容被资源留白压小。');
requireText(source, 'ASSETS.AVATAR.TEACHER_LIU_RAW', '默认教师头像展示应回退到无外框原图，由页面圆形容器负责边框与裁切。');
requireText(source, 'object-cover object-center', '教师头像图片应覆盖圆形容器，不能使用 object-contain 留白。');
requireText(source, "teacherProfile.name || '刘飞'", '姓名应保持独立文本区域，并使用学校版姓名作为缺省值。');
requireText(appSource, "name: '刘飞'", '学校版教师姓名应为刘飞。');
requireText(appSource, "name: '大飞'", '个人版教师姓名应为大飞。');
requireText(appSource, 'avatar: ASSETS.AVATAR.TEACHER_DA_FEI', '个人版应使用独立头像。');
requireText(source, 'text-[22px] font-extrabold leading-tight tracking-tight text-[var(--tm-text-primary)]', '我的页面教师姓名字号应保持 22px，并使用品牌中性色 Token。');
requireText(source, '编辑教师信息', '编辑按钮应保持独立可点击区域。');
requireText(appSource, 'return <TeacherMobileScreenBackground />', '我的页面屏幕级背景应统一使用公共背景组件。');
const screenBackgroundSource = fs.readFileSync(new URL('../components/TeacherMobileScreenBackground.tsx', import.meta.url), 'utf8');
requireText(screenBackgroundSource, 'bg-[var(--tm-bg-page)]', '我的页面屏幕级背景应使用页面背景 Token。');
requireText(source, 'min-h-[144px]', '教师信息展示区应压缩高度，避免头像区域占用过多空间。');
requireText(source, 'Camera', '教师头像右下角应使用相机图标。');
requireText(source, 'border border-white bg-white text-[var(--tm-brand-primary)]', '我的页头像相机图标应使用白色实底和品牌红图标。');
requireText(source, "const settingsButtonClass = 'absolute right-0 top-6 flex h-11 w-11 items-center justify-end text-[var(--tm-text-secondary)] transition active:scale-95 active:text-[var(--tm-brand-primary)]';", '设置图标应无底色，右侧与卡片对齐，并与教师姓名首行视觉居中。');
requireText(source, 'aria-label="设置"', '我的页应保留设置入口的无障碍名称。');
requireText(source, 'Settings className="h-[22px] w-[22px]"', '设置图标应在原 20px 基础上放大 10%。');
requireText(source, '成都市未来实验小学', '教师信息区应保留学校/来源切换入口。');
requireText(source, '管理工具', '我的页应将常用功能分组改为管理工具。');
requireText(source, '更多工具', '我的页应将更多功能分组改为更多工具。');
requireText(source, 'secondaryIconClass', '更多工具的图标容器与图标颜色应共享科目管理样式。');
requireText(source, 'variant="secondary"', '更多工具应使用 secondary 样式，和管理工具拉开层级。');
requireText(source, 'h-[38px] w-[38px] items-center justify-center rounded-full', '更多工具图标容器应缩小到原尺寸约 80%。');
requireText(source, 'h-[19px] w-[19px]', '更多工具图标线条应同步缩小到原尺寸约 80%。');
requireText(source, "const secondaryIconClass = 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]';", '更多工具应统一使用无描边的浅红底和品牌红图标。');
requireText(source, '<ToolGrid items={moreTools} columns={4} variant="secondary" />', '更多工具应显式保持每行 4 个入口。');
requireText(source, '学校报表', '管理工具应包含学校报表。');
requireText(source, '期末报告', '管理工具应包含期末报告。');
requireText(source, "const reportToolImageClass = 'h-16 w-16 max-w-none rounded-[var(--tm-radius-inner)] object-cover';", '学校报表和期末报告图片应通过统一放大补偿资源留白，并保持管理工具图标视觉尺寸一致。');
requireText(source, 'imageClassName: reportToolImageClass', '学校报表和期末报告入口应使用统一的放大图标样式。');
requireText(source, "title: '班主任助理'", '管理工具中班主任助理入口名称不应继续带 AI 前缀。');
requireText(source, "title: '校长助理'", '管理工具中校长助理入口名称不应继续带 AI 前缀。');
requireText(assetsSource, 'ai-art-badge.png', 'AI 角标应使用 pic 生成的独立艺术字资源。');
requireText(source, "imageBadgeSrc: ASSETS.MANAGEMENT.AI_ART_BADGE", 'AI 助理类图标右下角应展示独立 AI 图片角标。');
requireText(source, "const assistantToolImageClass = 'h-12 w-12 rounded-[var(--tm-radius-inner)] object-cover';", 'AI 助理图标应直接裁切图片，并使用统一圆角 Token。');
requireText(source, 'imageClassName: assistantToolImageClass', '班主任助理和校长助理应使用统一的无边框图标样式。');
requireText(source, 'overflow-visible rounded-[var(--tm-radius-inner)]', '图片工具图标容器应允许 AI 角标一半露出图标外部。');
requireText(source, 'absolute -bottom-2 -right-2 h-6 w-6', 'AI 角标应定位在图标右下角，并形成半内半外的位置关系。');
requireText(source, '科目管理', '更多工具应包含科目管理。');
requireText(source, '部门管理', '更多工具应包含部门管理。');
requireText(source, '货币发放', '更多工具应包含货币发放。');
requireText(source, '建议反馈', '更多工具应包含建议反馈。');
requireText(source, "const toolCardSurfaceClass = 'bg-[var(--tm-bg-surface-glass)] shadow-[var(--tm-shadow-card-raised)] backdrop-blur-sm';", '卡片应使用无显性描边的暖白轻玻璃底与统一阴影 Token。');
requireText(source, 'rounded-[var(--tm-radius-card)] p-5 ${toolCardSurfaceClass}', '管理工具、更多工具卡片应共享统一圆角和卡片表面。');
requireText(source, 'active:bg-[var(--tm-brand-primary-soft)] ${toolCardSurfaceClass}', '待填写采集卡片应共享无显性描边的卡片表面。');
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

if (source.includes('ScanLine') || source.includes('扫一扫') || source.includes('showDemoFeedback')) {
  throw new Error('我的页顶部不应继续展示扫一扫入口或保留无用演示逻辑。');
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

if ((source.match(/imageClassName: reportToolImageClass/g) ?? []).length !== 2) {
  throw new Error('学校报表和期末报告应同时使用放大图标样式。');
}

if ((source.match(/imageClassName: assistantToolImageClass/g) ?? []).length !== 2) {
  throw new Error('班主任助理和校长助理应同时使用无边框图标样式。');
}

if (source.includes('top-11 h-px bg-gradient-to-r')) {
  throw new Error('工具卡片标题区域不应保留横向装饰线。');
}

if (source.includes('bg-[#EEF7FF]') || source.includes('text-[#2F9FF4]')) {
  throw new Error('更多工具图标不应残留旧蓝色，应统一使用品牌 Token。');
}

if (source.includes('secondaryIconToneClass') || source.includes("tone: 'secondary'") || source.includes("tone: 'reward'")) {
  throw new Error('更多工具图标不应再保留橙色或金色前景配置。');
}

const secondaryIconClassMatch = source.match(/const secondaryIconClass = '([^']+)'/);
if (!secondaryIconClassMatch || secondaryIconClassMatch[1].includes('ring-')) {
  throw new Error('更多工具图标容器不应保留描边。');
}

if (source.includes('TEACHER_ME_HERO_CARD')) {
  throw new Error('不应使用整张教师卡片截图，头像/姓名/学校/按钮必须独立渲染。');
}

if (appSource.includes('ASSETS.MANAGEMENT.TEACHER_ME_PAGE_BG')) {
  throw new Error('我的页面不应继续渲染图片背景。');
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
