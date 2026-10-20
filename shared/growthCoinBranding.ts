import { GROWTH_COIN_TERMS } from './growthCoinTerminology.ts';

export interface GrowthCoinBranding {
  name: string;
  iconUrl: string;
}

/** 当前演示中的教师学校、家长学校编号与货柜预览对应同一份演示配置。 */
export const DEMO_COIN_SCHOOL_ID = 'school-star';
export const resolveCoinSchoolId = (schoolId: string) => (
  schoolId === 'BS2024' ? DEMO_COIN_SCHOOL_ID : schoolId
);

export const COIN_ICON_PRESETS = [
  { url: '/assets/growth-coins/coin-star.png', name: '星星金币' },
  { url: '/assets/growth-coins/icon-shell.png', name: '星贝' },
  { url: '/assets/growth-coins/icon-cloud.png', name: '云朵' },
  { url: '/assets/growth-coins/icon-flower.png', name: '小红花' },
] as const;

// 兼容学校已保存的旧图标，不因预设更新重置外观。
const LEGACY_COIN_ICONS = [
  '/assets/coin.png', '/assets/c4d_growth.png', '/assets/c4d_shop.png', '/assets/c4d_bank.png',
  '/assets/growth-coins/coin-sprout.png', '/assets/growth-coins/coin-sun.png', '/assets/growth-coins/coin-laurel.png',
];

export const DEFAULT_COIN_BRANDING: Readonly<GrowthCoinBranding> = {
  name: GROWTH_COIN_TERMS.name,
  iconUrl: '/assets/coin.png',
};

export const validateCoinBranding = (value: GrowthCoinBranding): GrowthCoinBranding => {
  const name = value.name.trim();
  if (!name || Array.from(name).length > 8 || /[\r\n\t]/.test(name)) throw new Error('请输入1至8个字的货币名称');
  const validIcon = COIN_ICON_PRESETS.some(icon => icon.url === value.iconUrl)
    || LEGACY_COIN_ICONS.includes(value.iconUrl)
    || (/^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(value.iconUrl) && value.iconUrl.length <= 600000);
  if (!validIcon) throw new Error('请选择图标，或重新上传PNG、JPG、WebP图片');
  return { name, iconUrl: value.iconUrl };
};

export const getCoinBrandTerms = (branding: GrowthCoinBranding) => ({
  ...GROWTH_COIN_TERMS,
  name: branding.name,
  details: `${branding.name}明细`,
});
