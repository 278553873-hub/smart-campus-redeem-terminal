import { readFileSync } from 'node:fs';

const viewSource = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');
const tokenSource = readFileSync(new URL('../styles/teacherMobileTokens.ts', import.meta.url), 'utf8');

for (const color of ['#E02727', '#F75C03', '#FA9C00', '#168252', '#B4233C']) {
  if (!tokenSource.includes(color)) {
    throw new Error(`教师端品牌 Token 缺少已确认的基础颜色：${color}`);
  }
}

for (const required of [
  'teacherBrandCssVariables',
  'teacherBrandSemantic',
  'style={teacherBrandCssVariables as React.CSSProperties}',
  'bg-[var(--tm-bg-page)]',
  'bg-[var(--tm-brand-primary)]',
  'bg-[var(--tm-brand-secondary)]',
  'text-[var(--tm-status-positive)]',
  'text-[var(--tm-status-negative)]',
]) {
  if (!viewSource.includes(required)) {
    throw new Error(`学校数据报表未完整接入品牌或语义 Token：${required}`);
  }
}

for (const legacyColor of ['bg-[#eef7f3]', 'bg-emerald-', 'text-emerald-', 'bg-blue-', 'text-blue-']) {
  if (viewSource.includes(legacyColor)) {
    throw new Error(`学校数据报表仍残留旧主色：${legacyColor}`);
  }
}
