import { readFileSync } from 'node:fs';

const source = readFileSync(new URL('./LeaderReportView.tsx', import.meta.url), 'utf8');

for (const required of [
  'const useAnimatedNumber',
  'replayKey?: string',
  'setDisplayedNumber(Math.round(target * easedProgress))',
  'const AnimatedNumber',
  'const AnimatedFraction',
  'const [numerator, denominator] = fraction.split',
  '<AnimatedNumber value={Number(numerator)} replayKey={replayKey} />',
  '<AnimatedNumber value={Number(value ?? 0)} replayKey={numberReplayKey} />',
  '<AnimatedFraction fraction={fraction} replayKey={`${animationKey ?? label}-fraction`} />',
  'animationKey={`${animationKey}-records`}',
]) {
  if (!source.includes(required)) {
    throw new Error(`学校数据报表展示型数字需要从 0 动到当前值，缺少：${required}`);
  }
}
