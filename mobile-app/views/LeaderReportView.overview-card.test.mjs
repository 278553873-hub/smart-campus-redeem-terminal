import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');
const metricStart = source.indexOf('const MetricUnit');
const overviewStart = source.indexOf('const OverviewCard');
const metricSource = source.slice(metricStart, overviewStart);
const hookStart = source.indexOf('const useAnimatedNumber');
const hookSource = hookStart >= 0 ? source.slice(hookStart, metricStart) : '';
const overviewSource = source.slice(overviewStart, source.indexOf('interface TeacherRowProps'));

if (source.includes('const MiniRing') || metricSource.includes('<MiniRing')) {
  throw new Error('数据总览不应继续使用小环形图，需改为更直观的横向进度条');
}

if (metricSource.includes('h-1.5 w-9') || metricSource.includes('bg-gradient-to-r')) {
  throw new Error('数据总览指标卡不应保留顶部渐变装饰条');
}

for (const required of [
  'const useAnimatedNumber',
  'const useAnimatedPercent',
  'replayKey?: string',
  'requestAnimationFrame(step)',
  'setDisplayedNumber(Math.round(target * easedProgress))',
  '[duration, replayKey, target]',
]) {
  if (!hookSource.includes(required)) {
    throw new Error(`数据总览百分比数字需要跟随进度条动画，且切换周期时重放，缺少：${required}`);
  }
}

for (const required of [
  'animationKey?: string',
  'useAnimatedPercent(safePercent, 650, animationKey)',
  'displayedPercent',
  'style={{ width: `${displayedPercent}%` }}',
  'aria-label={`${label}进度${displayedPercent}%`}',
  'coverageTone.bar',
  'text-3xl font-bold',
  'tracking-normal',
]) {
  if (!metricSource.includes(required)) {
    throw new Error(`数据总览比例指标需要使用同步动画进度条，缺少：${required}`);
  }
}

for (const required of [
  'animationKey: string',
  'animationKey={`${animationKey}-teacher`}',
  'animationKey={`${animationKey}-student`}',
  'animationKey={`${reportAnimationKey}-overview`}',
]) {
  if (!overviewSource.includes(required) && !source.includes(required)) {
    throw new Error(`数据总览需要在切换今日/本周/本月/本学期时重放动画，缺少：${required}`);
  }
}

if (metricSource.includes('text-[26px]') || metricSource.includes('font-extrabold') || metricSource.includes('font-black')) {
  throw new Error('数据总览百分比数字不应降低字号，也不应使用过粗字重');
}
