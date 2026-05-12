import { readFileSync } from 'node:fs';

const shopSource = readFileSync(new URL('./ShopView.tsx', import.meta.url), 'utf8');
const appSource = readFileSync(new URL('../App.tsx', import.meta.url), 'utf8');

const failures = [];

if (!shopSource.includes('onPurchase: (p: Product) => Promise<boolean>')) {
  failures.push('ShopView 的 onPurchase 应返回处理结果，不能只表示“已发起兑换”。');
}

if (!shopSource.includes('const purchaseSucceeded = await onPurchase(productToPurchase)')) {
  failures.push('ShopView 应等待父组件处理完成后，再判断是否显示兑换成功。');
}

if (/onPurchase\(confirmingProduct\);\s*setConfirmingProduct\(null\);\s*setShowSuccess\(true\)/s.test(shopSource)) {
  failures.push('ShopView 仍在发起兑换后立即显示成功提示，会和处理中加载层同时出现。');
}

if (!appSource.includes('const handlePurchase = async (product: Product): Promise<boolean>')) {
  failures.push('App.handlePurchase 应异步返回兑换是否成功。');
}

if (!appSource.includes('return await withLoading(() =>')) {
  failures.push('App.handlePurchase 应等待 withLoading 完成后再把结果返回给 ShopView。');
}

if (failures.length) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('shop purchase success timing assertions passed');
