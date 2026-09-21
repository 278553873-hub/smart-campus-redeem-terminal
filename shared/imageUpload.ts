/**
 * 图片上传的通用约束（后台各处上传入口共用）
 *
 * 上传入口的展示形态可以不同，但「能传什么格式、最大多大」是同一套硬规则，
 * 收敛在这里，避免每个页面各写一遍、各写一个上限。
 */

/** 允许上传的图片类型：与货柜机商品图的实拍图格式对齐 */
export const IMAGE_UPLOAD_ACCEPT = 'image/png,image/jpeg,image/webp';

/** 单张图片大小上限：2MB */
export const IMAGE_UPLOAD_MAX_BYTES = 2 * 1024 * 1024;

/** 大小上限的展示文案：提示语与错误提示共用，改上限时两处不会走偏 */
export const IMAGE_UPLOAD_MAX_SIZE_TEXT = '2MB';

/** 校验待上传的图片：不通过时返回给老师看的提示，通过返回 null */
export const validateImageUpload = (file: { type?: string; size?: number } | null | undefined): string | null => {
  if (!file) return '请选择要上传的图片';
  const type = (file.type || '').toLowerCase();
  // 浏览器有时给不出类型，这种情况交给 accept 与后续预览兜底，不在这里拦
  if (type && !IMAGE_UPLOAD_ACCEPT.split(',').includes(type)) {
    return '只支持 PNG / JPG / WebP 格式的图片';
  }
  if (typeof file.size === 'number' && file.size > IMAGE_UPLOAD_MAX_BYTES) {
    return '图片不能超过 ' + IMAGE_UPLOAD_MAX_SIZE_TEXT;
  }
  return null;
};
