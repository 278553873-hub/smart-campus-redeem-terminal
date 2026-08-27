import { readFileSync } from 'node:fs';

const viewSource = readFileSync(new URL('./MeView.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');
const bottomNavSource = readFileSync(new URL('../components/TeacherBottomNavigation.tsx', import.meta.url), 'utf8');
const tokenSource = readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');
const sharedThemeTokenSource = readFileSync(new URL('../../shared/questionnaireThemeTokens.ts', import.meta.url), 'utf8');

for (const color of ['#E02727', '#F75C03', '#FA9C00']) {
  if (!tokenSource.includes(color) && !sharedThemeTokenSource.includes(color)) {
    throw new Error(`教师端品牌 Token 缺少“我的”页所需颜色：${color}`);
  }
}

for (const required of [
  'teacherBrandCssVariables',
  'style={teacherBrandCssVariables as React.CSSProperties}',
  "const secondaryIconClass = 'bg-[var(--tm-brand-primary-soft)] text-[var(--tm-brand-primary)]';",
  'bg-[var(--tm-status-negative)]',
]) {
  if (!viewSource.includes(required) && !appSource.includes(required) && !bottomNavSource.includes(required)) {
    throw new Error(`“我的”页未完整接入品牌或语义 Token：${required}`);
  }
}

for (const required of [
  'ASSETS.TEACHER_BOTTOM_NAVIGATION.RECORD.ACTIVE',
  'ASSETS.TEACHER_BOTTOM_NAVIGATION.RECORD.DEFAULT',
  'ASSETS.TEACHER_BOTTOM_NAVIGATION.CLASS.ACTIVE',
  'ASSETS.TEACHER_BOTTOM_NAVIGATION.CLASS.DEFAULT',
  'ASSETS.TEACHER_BOTTOM_NAVIGATION.ME.ACTIVE',
  'ASSETS.TEACHER_BOTTOM_NAVIGATION.ME.DEFAULT',
  "? 'text-[var(--tm-brand-primary)]'",
  ": 'text-[var(--tm-nav-item-default)]'",
  'border-0 bg-white/95 [box-shadow:var(--tm-shadow-navigation)] backdrop-blur-xl',
  'src={isActive ? icon.active : icon.default}',
  'relative flex h-[22px] w-[22px] items-center justify-center',
  "group-active:scale-[0.86] motion-reduce:transition-none ${isActive ? 'scale-100' : 'scale-90'}",
  'text-xs font-medium',
  "aria-current={isActive ? 'page' : undefined}",
  'bg-[var(--tm-status-negative)]',
]) {
  if (!bottomNavSource.includes(required)) {
    throw new Error(`教师手机端底部导航未全局使用品牌红和中性色：${required}`);
  }
}

if (!tokenSource.includes("'--tm-shadow-navigation': '0 -6px 18px -14px rgba(64, 60, 58, 0.06)'")) {
  throw new Error('教师手机端底部导航应使用短距离、极淡的向上中性阴影。');
}

if (bottomNavSource.includes('border-t') || bottomNavSource.includes('lucide-react')) {
  throw new Error('教师手机端底部导航不应保留明显顶部分隔线或通用线性图标。');
}

if (bottomNavSource.includes('active:scale-95') || bottomNavSource.includes("isActive ? 'text-xs font-semibold'")) {
  throw new Error('教师手机端底部导航切换时不应缩放按钮或改变文字字重。');
}

for (const legacyBottomNavColor of ["text-[#1E9AAA]", "text-[#AAB6C4]", 'border-[#EEF4F8]']) {
  if (appSource.includes(legacyBottomNavColor)) {
    throw new Error(`教师手机端底部导航仍残留旧颜色：${legacyBottomNavColor}`);
  }
}

for (const legacyColor of ['#1E9AAA', '#2F9FF4', '#6076D8', 'bg-cyan-', 'text-blue-', 'text-emerald-']) {
  if (viewSource.includes(legacyColor)) {
    throw new Error(`“我的”页仍残留旧视觉颜色：${legacyColor}`);
  }
}
