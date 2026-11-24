export interface SchoolBasicInfo {
  displayName: string;
  logoUrl: string;
  features: string;
}

export type SchoolBasicInfoErrors = Partial<Record<keyof SchoolBasicInfo, string>>;
export const SCHOOL_DISPLAY_NAME_MAX_LENGTH = 40;
export const SCHOOL_FEATURES_MAX_LENGTH = 2000;
export const SCHOOL_LOGO_MAX_SIZE_MB = 5;

export const createSchoolBasicInfo = (schoolName: string): SchoolBasicInfo => ({ displayName: schoolName, logoUrl: '', features: '' });

export const normalizeSchoolBasicInfo = (value: SchoolBasicInfo): SchoolBasicInfo => ({
  displayName: value.displayName.trim(),
  logoUrl: value.logoUrl,
  features: value.features.replace(/\r\n?/g, '\n').trim(),
});

export const validateSchoolBasicInfo = (value: SchoolBasicInfo): SchoolBasicInfoErrors => {
  const errors: SchoolBasicInfoErrors = {};
  if (!value.displayName.trim()) errors.displayName = '请输入学校对外展示名称';
  else if (value.displayName.trim().length > SCHOOL_DISPLAY_NAME_MAX_LENGTH) errors.displayName = `学校对外展示名称不能超过${SCHOOL_DISPLAY_NAME_MAX_LENGTH}个字`;
  else if (/[\r\n]/.test(value.displayName)) errors.displayName = '学校对外展示名称不能换行';
  if (value.features.length > SCHOOL_FEATURES_MAX_LENGTH) errors.features = `学校特色信息不能超过${SCHOOL_FEATURES_MAX_LENGTH}个字`;
  if (value.logoUrl && !/^data:image\/(?:png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(value.logoUrl)) errors.logoUrl = 'Logo图片无效，请重新上传';
  return errors;
};

export const sameSchoolBasicInfo = (a: SchoolBasicInfo, b: SchoolBasicInfo) => a.displayName === b.displayName && a.logoUrl === b.logoUrl && a.features === b.features;
