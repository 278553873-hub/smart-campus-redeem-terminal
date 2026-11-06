import type { CSSProperties } from 'react';
import { parentGrowthColors as color, parentGrowthPaint as paint } from './parentMobileColors';

export type ParentGrowthScheme = 'original' | 'teacher';
type ParentGrowthThemeStyle = CSSProperties & Record<`--pg-${string}`, string>;
export const parentGrowthSchemeOptions = [
  { id: 'original', label: '方案一 · 初版薄荷青绿' },
  { id: 'teacher', label: '方案二 · 教师端配色' },
] as const;

const original: ParentGrowthThemeStyle = {
  '--pg-ink': '#073E34', '--pg-muted': '#536F69', '--pg-brand': '#007E60',
  '--pg-positive': '#008464', '--pg-action-start': '#00B98B', '--pg-action-end': '#009C78',
  '--pg-background': 'radial-gradient(ellipse at 0 0,#a6f0d9 0,transparent 57%),radial-gradient(ellipse at 100% 15%,#aee9f5 0,transparent 58%),linear-gradient(#d9f7f1,#edf6f4 78%)',
  '--pg-surface': '#E0FFF4', '--pg-border': '#A2D9CF', '--pg-alert': '#D93643',
  '--pg-evaluation-background': 'linear-gradient(115deg,#effff8ed,#e1f9fbed) padding-box,linear-gradient(125deg,#00ca9a,#45d5dc 70%,#a4bdfb) border-box',
  '--pg-evaluation-border': 'transparent', '--pg-bank-surface': '#FFFFFFDF',
  '--pg-balance-background': 'linear-gradient(110deg,#e9faf4,#e3f8f5)',
  '--pg-message-surface': '#FFFFFF91', '--pg-inverse': '#FFFFFF',
  '--pg-card-shadow': '0 8px 22px #427d7410', '--pg-action-shadow': '0 6px 14px #00a37b20',
  '--pg-avatar-shadow': '0 3px 10px #186f5a12', '--pg-mascot-shadow': '0 9px 10px #137b5b15',
  '--pg-orbit': '#FFFFFF55', '--pg-orbit-soft': '#FFFFFF15', '--pg-orbit-faint': '#FFFFFF12',
};

// 方案二只从家长配色源读取颜色；这里的局部阴影尺寸保留成长页既有呈现，不进入通用令牌。
const teacherTheme: ParentGrowthThemeStyle = {
  '--pg-ink': color.ink, '--pg-muted': color.muted,
  '--pg-brand': color.brand, '--pg-positive': color.positive,
  '--pg-action-start': color.actionStart, '--pg-action-end': color.actionEnd,
  '--pg-background': paint.background,
  '--pg-surface': color.surface, '--pg-border': color.border, '--pg-alert': color.alert,
  '--pg-evaluation-background': paint.evaluationBackground,
  '--pg-evaluation-border': 'transparent',
  '--pg-bank-surface': color.cardSurface,
  '--pg-balance-background': paint.balanceBackground,
  '--pg-message-surface': color.messageSurface, '--pg-inverse': color.inverse,
  '--pg-card-shadow': `0 8px 22px ${color.shadowCard}`, '--pg-action-shadow': `0 6px 14px ${color.shadowAction}`,
  '--pg-avatar-shadow': `0 3px 10px ${color.shadowAvatar}`, '--pg-mascot-shadow': `0 9px 10px ${color.shadowIllustration}`,
  '--pg-orbit': color.orbit, '--pg-orbit-soft': color.orbitSoft, '--pg-orbit-faint': color.orbitFaint,
};
export const getParentGrowthTheme = (scheme: ParentGrowthScheme): CSSProperties => scheme === 'teacher' ? teacherTheme : original;
