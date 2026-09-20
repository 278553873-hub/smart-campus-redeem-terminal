import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const shopSource = readFileSync(new URL('./ShopView.tsx', import.meta.url), 'utf8');

const failures = [];
const requireText = (text, message) => {
  if (!shopSource.includes(text)) failures.push(message);
};

// 1. 商品图要按自身比例缩放：宽高上限 + 自身比例，样式缺失时也不会被拉成竖长条
requireText(
  'max-h-full max-w-full w-auto h-auto object-contain',
  '商品图必须同时给「宽高上限 + 自身比例」，只写 w-full h-full 时一旦 object-fit 没生效，正方形商品图就会被拉成长方形。',
);
if (shopSource.includes('w-full h-full object-contain')) {
  failures.push('商品图不要再用 w-full h-full 的写法：3 列版式下图片区是竖长条，会被拉伸。');
}

// 2. 商品图统一走默认图回退，不能出现空 src
requireText('src={getProductImage(product)}', '商品图应走 getProductImage，没上传图片时回退默认商品图。');

// 3. 图片区高度必须由版式规则推导（3 列与 2 列的图片区比例不同）
requireText('height: shopImageHeight', '图片区高度应由当前版式推导。');

// 4. 默认商品图要放大到与实拍图齐平（倍数来自 shared/productImage，页面里不许写死）
requireText(
  'scale: getProductImageScale(product)',
  '默认商品图要按 shared/productImage 的倍数放大，否则没上传图片的商品会比实拍图小一圈。',
);
if (/scale:\s*[0-9]/.test(shopSource)) {
  failures.push('商品图放大倍数必须来自 shared/productImage，不要在页面里写死数字。');
}

if (failures.length > 0) {
  for (const failure of failures) console.log('❌ ' + failure);
  throw new Error('货柜机商品图缩放检查未通过');
}

console.log('✅ 货柜机商品图缩放检查通过（按自身比例缩放，不会被拉长）');
