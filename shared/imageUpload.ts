/**
 * 图片上传的通用约束（后台各处上传入口共用）
 *
 * 统一校验图片格式与大小。各入口沿用默认上限，或按业务需要传入指定上限。
 */

/** 允许上传的图片类型：与货柜机商品图的实拍图格式对齐 */
export const IMAGE_UPLOAD_ACCEPT = 'image/png,image/jpeg,image/webp';

/** 单张图片大小上限：2MB */
const DEFAULT_IMAGE_UPLOAD_MAX_SIZE_MB = 2;
const BYTES_PER_MB = 1024 * 1024;
export const IMAGE_UPLOAD_MAX_BYTES = DEFAULT_IMAGE_UPLOAD_MAX_SIZE_MB * BYTES_PER_MB;

/** 大小上限的展示文案：提示语与错误提示共用，改上限时两处不会走偏 */
export const IMAGE_UPLOAD_MAX_SIZE_TEXT = `${DEFAULT_IMAGE_UPLOAD_MAX_SIZE_MB}MB`;

/** 校验待上传的图片：不通过时返回给老师看的提示，通过返回 null */
export const validateImageUpload = (file: { type?: string; size?: number } | null | undefined, maxSizeMB = DEFAULT_IMAGE_UPLOAD_MAX_SIZE_MB): string | null => {
  if (!file) return '请选择要上传的图片';
  const type = (file.type || '').toLowerCase();
  // 浏览器有时给不出类型，这种情况交给 accept 与后续预览兜底，不在这里拦
  if (type && !IMAGE_UPLOAD_ACCEPT.split(',').includes(type)) {
    return '只支持 PNG / JPG / WebP 格式的图片';
  }
  if (typeof file.size === 'number' && file.size > maxSizeMB * BYTES_PER_MB) {
    return `图片不能超过 ${maxSizeMB}MB`;
  }
  return null;
};

/** 校验并等比缩小图片，保留透明背景；返回可保存的展示图，不裁切原始比例。 */
export const readImageUpload = async (file: File, maxDimension = 512, maxSizeMB = DEFAULT_IMAGE_UPLOAD_MAX_SIZE_MB): Promise<string> => {
  const error = validateImageUpload(file, maxSizeMB);
  if (error) throw new Error(error);
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode().catch(() => { throw new Error('图片无法读取，请更换图片'); });
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('图片尺寸无效，请更换图片');
    const ratio = Math.min(1, maxDimension / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * ratio));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * ratio));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('图片处理失败，请重试');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    const result = canvas.toDataURL('image/webp', .9);
    if (!/^data:image\/(png|jpeg|webp);base64,/.test(result)) throw new Error('图片处理失败，请更换图片');
    return result;
  } finally { URL.revokeObjectURL(objectUrl); }
};
