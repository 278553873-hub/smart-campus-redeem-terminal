import { GROWTH_COIN_TERMS } from './growthCoinTerminology.ts';

export interface GrowthCoinBranding {
  name: string;
  iconUrl: string;
  /** 最近一次上传的图片，切换预设后仍保留。 */
  customIconUrl?: string;
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
  { url: '/assets/growth-coins/icon-gem.png', name: '绿宝石' },
] as const;

// 兼容学校已保存的旧图标，不因预设更新重置外观。
const LEGACY_COIN_ICONS = [
  '/assets/coin.png', '/assets/c4d_growth.png', '/assets/c4d_shop.png', '/assets/c4d_bank.png',
  '/assets/growth-coins/coin-sprout.png', '/assets/growth-coins/coin-sun.png', '/assets/growth-coins/coin-laurel.png',
  '/assets/growth-coins/icon-flower.png',
];

export const DEFAULT_COIN_BRANDING: Readonly<GrowthCoinBranding> = {
  name: GROWTH_COIN_TERMS.name,
  iconUrl: COIN_ICON_PRESETS[0].url,
};

export const validateCoinName = (value: string): string => {
  const name = value.trim();
  if (!name || Array.from(name).length > 8 || /[\r\n\t]/.test(name)) throw new Error('请输入1至8个字的货币名称');
  return name;
};

const isUploadedIcon = (url: string) => (
  /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/]+=*$/.test(url) && url.length <= 600000
);

export const validateCoinBranding = (value: GrowthCoinBranding): GrowthCoinBranding => {
  const name = validateCoinName(value.name);
  const validIcon = COIN_ICON_PRESETS.some(icon => icon.url === value.iconUrl)
    || LEGACY_COIN_ICONS.includes(value.iconUrl)
    || isUploadedIcon(value.iconUrl);
  if (!validIcon) throw new Error('请选择图标，或重新上传PNG、JPG、WebP图片');
  if (value.customIconUrl !== undefined && !isUploadedIcon(value.customIconUrl)) throw new Error('请重新上传PNG、JPG、WebP自定义图标');
  const customIconUrl = isUploadedIcon(value.iconUrl) ? value.iconUrl : value.customIconUrl;
  // 旧蓝底金币统一升级为金色星星金币，保留学校名称及其他自选图标。
  return { name, iconUrl: value.iconUrl === '/assets/coin.png' ? DEFAULT_COIN_BRANDING.iconUrl : value.iconUrl, ...(customIconUrl ? { customIconUrl } : {}) };
};

export const getCoinBrandTerms = (branding: GrowthCoinBranding) => ({
  ...GROWTH_COIN_TERMS,
  name: branding.name,
  details: `${branding.name}明细`,
});
