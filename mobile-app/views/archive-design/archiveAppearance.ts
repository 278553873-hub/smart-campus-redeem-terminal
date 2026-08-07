import learningHeader from '../../assets/resources/highlight-defaults/daily-classroom-thinking.png';
import growthHeader from '../../assets/resources/highlight-defaults/daily-default-growth.png';
import sportsHeader from '../../assets/resources/highlight-defaults/daily-sports-vitality.png';
import creativityHeader from '../../assets/resources/highlight-defaults/daily-art-creativity.png';
import type { CSSProperties } from 'react';
import type {
  ArchiveAppearance,
  ArchiveHeaderImageId,
  ArchiveThemeId,
} from '../../../shared/studentArchiveStore';

export const archiveThemeOptions: Array<{
  id: ArchiveThemeId;
  label: string;
  background: string;
  swatch: string;
  accent: string;
  accentStrong: string;
  accentPressed: string;
  accentSoft: string;
  accentSoftStrong: string;
}> = [
  {
    id: 'clean', label: '简约白', background: 'var(--tm-archive-theme-clean-bg)', swatch: 'var(--tm-archive-theme-clean-swatch)',
    accent: 'var(--tm-archive-theme-clean-accent)', accentStrong: 'var(--tm-archive-theme-clean-accent-strong)', accentPressed: 'var(--tm-archive-theme-clean-accent-pressed)',
    accentSoft: 'var(--tm-archive-theme-clean-accent-soft)', accentSoftStrong: 'var(--tm-archive-theme-clean-accent-soft-strong)',
  },
  {
    id: 'sky', label: '学习蓝', background: 'var(--tm-archive-theme-sky-bg)', swatch: 'var(--tm-archive-theme-sky-swatch)',
    accent: 'var(--tm-archive-theme-sky-accent)', accentStrong: 'var(--tm-archive-theme-sky-accent-strong)', accentPressed: 'var(--tm-archive-theme-sky-accent-pressed)',
    accentSoft: 'var(--tm-archive-theme-sky-accent-soft)', accentSoftStrong: 'var(--tm-archive-theme-sky-accent-soft-strong)',
  },
  {
    id: 'leaf', label: '成长绿', background: 'var(--tm-archive-theme-leaf-bg)', swatch: 'var(--tm-archive-theme-leaf-swatch)',
    accent: 'var(--tm-archive-theme-leaf-accent)', accentStrong: 'var(--tm-archive-theme-leaf-accent-strong)', accentPressed: 'var(--tm-archive-theme-leaf-accent-pressed)',
    accentSoft: 'var(--tm-archive-theme-leaf-accent-soft)', accentSoftStrong: 'var(--tm-archive-theme-leaf-accent-soft-strong)',
  },
  {
    id: 'sunny', label: '温暖黄', background: 'var(--tm-archive-theme-sunny-bg)', swatch: 'var(--tm-archive-theme-sunny-swatch)',
    accent: 'var(--tm-archive-theme-sunny-accent)', accentStrong: 'var(--tm-archive-theme-sunny-accent-strong)', accentPressed: 'var(--tm-archive-theme-sunny-accent-pressed)',
    accentSoft: 'var(--tm-archive-theme-sunny-accent-soft)', accentSoftStrong: 'var(--tm-archive-theme-sunny-accent-soft-strong)',
  },
];

export const archiveHeaderImageOptions: Array<{
  id: ArchiveHeaderImageId;
  label: string;
  image?: string;
}> = [
  { id: 'none', label: '无头图' },
  { id: 'learning', label: '学习探索', image: learningHeader },
  { id: 'growth', label: '成长记录', image: growthHeader },
  { id: 'sports', label: '活力运动', image: sportsHeader },
  { id: 'creativity', label: '兴趣创造', image: creativityHeader },
];

export const getArchiveTheme = (appearance: ArchiveAppearance) => (
  archiveThemeOptions.find(option => option.id === appearance.themeId) ?? archiveThemeOptions[0]
);

export const getArchiveThemeStyle = (appearance: ArchiveAppearance): CSSProperties => {
  const theme = getArchiveTheme(appearance);
  return {
    '--tm-brand-primary': theme.accent,
    '--tm-brand-primary-hover': theme.accentStrong,
    '--tm-brand-primary-strong': theme.accentStrong,
    '--tm-brand-primary-pressed': theme.accentPressed,
    '--tm-brand-primary-soft': theme.accentSoft,
    '--tm-brand-primary-soft-strong': theme.accentSoftStrong,
    '--tm-input-focus-border': theme.accent,
  } as CSSProperties;
};

export const getArchiveHeaderImage = (appearance: ArchiveAppearance) => (
  archiveHeaderImageOptions.find(option => option.id === appearance.headerImageId)?.image
);
