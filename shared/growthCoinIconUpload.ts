/** 图标上传统一校验、解码并缩放，存储结果不携带原始图片元数据。 */
export const readCoinIconUpload = async (file: File): Promise<string> => {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('请上传PNG、JPG或WebP图片');
  if (file.size > 5 * 1024 * 1024) throw new Error('图片不能超过5MB');
  const objectUrl = URL.createObjectURL(file);
  try {
    const image = new Image();
    image.src = objectUrl;
    await image.decode().catch(() => { throw new Error('图片无法读取，请更换图片'); });
    if (!image.naturalWidth || !image.naturalHeight) throw new Error('图片尺寸无效');
    const scale = Math.min(1, 256 / Math.max(image.naturalWidth, image.naturalHeight));
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
    const context = canvas.getContext('2d');
    if (!context) throw new Error('图片处理失败，请重试');
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL('image/png');
  } finally { URL.revokeObjectURL(objectUrl); }
};
