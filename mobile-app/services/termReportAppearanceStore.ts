import { simplifyReportAppearance, createReportAppearance, pruneCoverAssets, validateReportAppearance, type ReportAppearance, type CoverAsset } from '../domain/termReportAppearance';
export const appearanceKey = (spaceId: string) => `teacher-report-appearance:v2:${encodeURIComponent(spaceId)}`;
export const COVER_UPLOAD_MAX_MB = 10;
export const APPEARANCE_CHANGED = 'teacher-report-appearance-changed';
export function readReportAppearance(spaceId: string, schoolName: string): ReportAppearance {
  try {
    const value = JSON.parse(window.localStorage.getItem(appearanceKey(spaceId)) ?? 'null');
    if (value?.version === 2 && value.stages && value.assets && !validateReportAppearance(value)) return simplifyReportAppearance({ ...value, schoolName });
    // 旧年级配置保留在原存储中，不自动套用到整个学段；新功能默认关闭。
    if (!value) {
      const legacy = JSON.parse(window.localStorage.getItem(`teacher-report-appearance:v1:${encodeURIComponent(spaceId)}`) ?? 'null');
      if (legacy?.version === 1 && legacy.defaultCover && legacy.assets) {
        const migrated = { ...createReportAppearance(schoolName), schoolName, logoId: legacy.logoId, defaultCover: legacy.defaultCover, assets: legacy.assets };
        if (!validateReportAppearance(migrated)) return simplifyReportAppearance(migrated);
      }
    }
  } catch { /* 无有效存储时使用学校默认封面。 */ }
  return createReportAppearance(schoolName);
}
export function saveReportAppearance(spaceId: string, value: ReportAppearance): ReportAppearance {
  const error = validateReportAppearance(value);
  if (error) throw new Error(error);
  const next = pruneCoverAssets(simplifyReportAppearance(value));
  try { window.localStorage.setItem(appearanceKey(spaceId), JSON.stringify(next)); }
  catch { throw new Error('保存失败，可能是图片占用空间过大。请换用较小图片后重试，当前修改已保留。'); }
  window.dispatchEvent(new Event(APPEARANCE_CHANGED));
  return next;
}
export async function readCoverUpload(file: File): Promise<CoverAsset> {
  if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) throw new Error('请选择 PNG、JPG 或 WebP 图片。');
  if (file.size > COVER_UPLOAD_MAX_MB * 1024 * 1024) throw new Error(`图片不能超过 ${COVER_UPLOAD_MAX_MB} MB，请换一张或压缩后上传。`);
  const src = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error('图片读取失败，请重新选择。'));
    reader.readAsDataURL(file);
  });
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const decoded = new Image();
    decoded.onload = () => resolve(decoded);
    decoded.onerror = () => reject(new Error('无法打开这张图片，请换一张。'));
    decoded.src = src;
  });
  const width = image.naturalWidth; const height = image.naturalHeight;
  if (!width || !height) throw new Error('图片尺寸无效，请换一张。');
  // 浏览器演示使用本地存储；大原图转为保留透明度的手机展示图，避免直接写入十几 MB 的 Base64。
  const targetBytes = 600 * 1024;
  if (file.size <= targetBytes && Math.max(width, height) <= 2048) return { src, width, height, name: file.name };
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) throw new Error('图片处理失败，请重试。');
  let longest = Math.min(2048, Math.max(width, height));
  while (longest > 0) {
    const ratio = longest / Math.max(width, height);
    canvas.width = Math.max(1, Math.round(width * ratio));
    canvas.height = Math.max(1, Math.round(height * ratio));
    context.clearRect(0, 0, canvas.width, canvas.height);
    context.drawImage(image, 0, 0, canvas.width, canvas.height);
    for (const quality of [.9, .8, .7]) {
      // 不铺白底，PNG/WebP 中的透明区域保持透明；不支持 WebP 的浏览器会回退 PNG。
      const encoded = canvas.toDataURL('image/webp', quality);
      if (encoded.startsWith('data:image/') && encoded.length * .75 <= targetBytes) return { src: encoded, width: canvas.width, height: canvas.height, name: file.name };
    }
    if (longest <= 512) break;
    longest = Math.max(512, Math.floor(longest * .8));
  }
  throw new Error('这张图片处理后仍过大，请压缩后重试。');
}
