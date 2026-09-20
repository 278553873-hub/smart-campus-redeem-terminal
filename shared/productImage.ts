/**
 * 商品图回退与占位图尺寸规则
 *
 * 老师在后台配置商品时可以不上传图片，终端与后台都必须有一致的兜底，避免出现裂图或空白格。
 * 兜底图就是「文创超市」的图标（同时也是后台商品弹窗里的「默认商品图」）。
 *
 * 只用一处常量描述兜底图与占位图的渲染倍数，谁都不许再写死图片路径或页面里临时放大。
 */

/** 未上传商品图时使用的默认图：文创超市图标 */
export const DEFAULT_PRODUCT_IMAGE = '/assets/c4d_shop.png';

/**
 * 默认图的放大倍数：1.08
 *
 * 实拍商品图是满幅方图，object-contain 会铺满限制边，看起来是「整块」；
 * 默认图是透明底 3D 图标，图形本体只占画布 87.3% 高、69.8% 宽，直接渲染会比实拍图小一圈
 * （2 列 138px vs 158px，3 列 117px vs 134px），同一屏里占位商品显得零散。
 *
 * 倍数按「图形本体高度对齐实拍图」算，但默认图上下留白不对称（上 55、下 26），
 * 放大到内容高度恰好齐平的 1.145 倍时，图片区会连图形本体一起裁掉底部约 4px，
 * 所以取 1.08：图形本体高度达到实拍图的 94%（2 列 149px vs 158px，肉眼齐平），
 * 四条边都有余量，图形本体不会被裁掉。图片区必须 overflow-hidden，被放大掉的只是默认图的透明留白。
 */
export const DEFAULT_PRODUCT_IMAGE_CONTENT_SCALE = 1.08;

interface ImagedProduct {
  image?: string | null;
}

/** 取商品图：没上传、空字符串或只有空格时回退到默认图 */
export const getProductImage = (product: ImagedProduct): string => {
  const image = product?.image?.trim();
  return image ? image : DEFAULT_PRODUCT_IMAGE;
};

/**
 * 是否用了默认图。
 * 图片地址级判断，供后台等用 icon 字段承载图片地址的模块直接复用。
 */
export const isDefaultProductImageUrl = (image?: string | null): boolean => !image?.trim();

/** 图片地址级的渲染倍数：默认图放大到与实拍图齐平，实拍图保持 1 倍 */
export const getProductImageUrlScale = (image?: string | null): number =>
  isDefaultProductImageUrl(image) ? DEFAULT_PRODUCT_IMAGE_CONTENT_SCALE : 1;

/** 是否用了默认图：决定要不要放大到与实拍图齐平 */
export const isDefaultProductImage = (product: ImagedProduct): boolean =>
  isDefaultProductImageUrl(product?.image);

/** 商品图渲染倍数：图片区配 overflow-hidden，只放大默认图的透明留白，图形本体不会被裁掉 */
export const getProductImageScale = (product: ImagedProduct): number =>
  getProductImageUrlScale(product?.image);
