import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { inflateSync } from 'node:zlib';
import {
  DEFAULT_PRODUCT_IMAGE,
  DEFAULT_PRODUCT_IMAGE_CONTENT_SCALE,
  getProductImage,
  getProductImageScale,
  getProductImageUrlScale,
  isDefaultProductImage,
  isDefaultProductImageUrl,
} from './productImage.ts';

// 1. 默认图就是文创超市图标，且文件真实存在
assert.equal(DEFAULT_PRODUCT_IMAGE, '/assets/c4d_shop.png');
const defaultImageFile = new URL('../public' + DEFAULT_PRODUCT_IMAGE, import.meta.url);
assert.ok(existsSync(defaultImageFile), '默认商品图文件不存在：' + DEFAULT_PRODUCT_IMAGE);

// 2. 没上传图片的商品一律回退到默认图，不能出现空 src（空 src 会渲染成裂图）
assert.equal(getProductImage({ image: '' }), DEFAULT_PRODUCT_IMAGE);
assert.equal(getProductImage({ image: '   ' }), DEFAULT_PRODUCT_IMAGE);
assert.equal(getProductImage({ image: null }), DEFAULT_PRODUCT_IMAGE);
assert.equal(getProductImage({ image: undefined }), DEFAULT_PRODUCT_IMAGE);
assert.equal(getProductImage({}), DEFAULT_PRODUCT_IMAGE);

// 3. 已上传图片的商品保持原图
assert.equal(getProductImage({ image: '/assets/shop/shop_pen.png' }), '/assets/shop/shop_pen.png');

// 4. 占位图判定与放大倍数：默认图放大，实拍图不缩放
assert.equal(isDefaultProductImageUrl(''), true);
assert.equal(isDefaultProductImageUrl('   '), true);
assert.equal(isDefaultProductImageUrl(null), true);
assert.equal(isDefaultProductImageUrl('/assets/shop/shop_pen.png'), false);

assert.equal(getProductImageUrlScale('/assets/shop/shop_pen.png'), 1);
assert.equal(getProductImageUrlScale(''), DEFAULT_PRODUCT_IMAGE_CONTENT_SCALE);
assert.equal(getProductImageScale({ image: '/assets/shop/shop_pen.png' }), 1);
assert.equal(getProductImageScale({ image: '  ' }), DEFAULT_PRODUCT_IMAGE_CONTENT_SCALE);
assert.equal(getProductImageScale({}), DEFAULT_PRODUCT_IMAGE_CONTENT_SCALE);
assert.equal(isDefaultProductImage({ image: '/assets/shop/shop_pen.png' }), false);
assert.equal(isDefaultProductImage({}), true);

/**
 * 读默认图里「图形本体」相对整张画布的占比与四边留白。
 * 默认图是透明底 PNG，放大倍数必须按图形本体算，不能按整张画布算。
 */
const readDefaultImageGeometry = () => {
  const buffer = readFileSync(defaultImageFile);
  let offset = 8;
  let header = null;
  const idatChunks = [];
  while (offset < buffer.length) {
    const length = buffer.readUInt32BE(offset);
    const type = buffer.toString('ascii', offset + 4, offset + 8);
    const data = buffer.subarray(offset + 8, offset + 8 + length);
    if (type === 'IHDR') {
      header = { width: data.readUInt32BE(0), height: data.readUInt32BE(4), colorType: data[9] };
    }
    if (type === 'IDAT') idatChunks.push(data);
    offset += 12 + length;
  }
  assert.ok(header, '默认商品图解析失败：缺少 IHDR');
  assert.equal(header.colorType, 6, '默认商品图应为带透明通道的 PNG，否则占位图放大逻辑需要重写');

  const channels = 4;
  const stride = header.width * channels;
  const raw = inflateSync(Buffer.concat(idatChunks));
  const pixels = Buffer.alloc(header.height * stride);
  let previous = Buffer.alloc(stride);
  for (let y = 0; y < header.height; y += 1) {
    const filter = raw[y * (stride + 1)];
    const line = raw.subarray(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const current = Buffer.alloc(stride);
    for (let x = 0; x < stride; x += 1) {
      const a = x >= channels ? current[x - channels] : 0;
      const b = previous[x];
      const c = x >= channels ? previous[x - channels] : 0;
      let value = line[x];
      if (filter === 1) value += a;
      else if (filter === 2) value += b;
      else if (filter === 3) value += (a + b) >> 1;
      else if (filter === 4) {
        const p = a + b - c;
        const pa = Math.abs(p - a);
        const pb = Math.abs(p - b);
        const pc = Math.abs(p - c);
        value += pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
      }
      current[x] = value & 255;
    }
    current.copy(pixels, y * stride);
    previous = current;
  }

  let minX = header.width;
  let minY = header.height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < header.height; y += 1) {
    for (let x = 0; x < header.width; x += 1) {
      const alpha = pixels[y * stride + x * channels + 3];
      if (alpha > 24) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  assert.ok(maxX > 0 && maxY > 0, '默认商品图没有非透明内容');

  return {
    contentHeight: (maxY - minY + 1) / header.height,
    contentWidth: (maxX - minX + 1) / header.width,
    marginTop: minY / header.height,
    marginBottom: (header.height - 1 - maxY) / header.height,
    marginLeft: minX / header.width,
    marginRight: (header.width - 1 - maxX) / header.width,
  };
};

// 5. 放大倍数与真实图片对齐：图形本体不能比实拍图小一圈，也不能被图片区裁掉
const geometry = readDefaultImageGeometry();
const scale = DEFAULT_PRODUCT_IMAGE_CONTENT_SCALE;
const scaledContentHeight = geometry.contentHeight * scale;
const scaledContentWidth = geometry.contentWidth * scale;
// 图片区按限制边等比放大，四边各裁掉这么多（相对画布）
const clippedEdge = (scale - 1) / 2;

assert.ok(
  scaledContentHeight <= 1.001,
  '默认图放大后图形本体高度不能超过实拍图，否则会被裁掉，当前为 ' + scaledContentHeight.toFixed(3),
);
assert.ok(
  scaledContentHeight >= 0.9,
  '默认图放大后图形本体高度不足实拍图的 90%，占位商品看起来仍然过小，当前为 ' + scaledContentHeight.toFixed(3),
);
assert.ok(
  scaledContentWidth < 1,
  '默认图放大后图形本体宽度会超出图片区被裁掉，当前为 ' + scaledContentWidth.toFixed(3),
);
for (const [name, margin] of Object.entries({
  marginTop: geometry.marginTop,
  marginBottom: geometry.marginBottom,
  marginLeft: geometry.marginLeft,
  marginRight: geometry.marginRight,
})) {
  assert.ok(
    margin * scale > clippedEdge,
    '默认图放大后 ' + name + ' 会被裁到图形本体，当前留白 ' + (margin * scale).toFixed(3) + ' ≤ 裁切 ' + clippedEdge.toFixed(3),
  );
}

console.log('✅ 商品图回退与占位图尺寸规则（未上传图片用文创超市图标，且放大到与实拍图齐平）断言测试通过！');
