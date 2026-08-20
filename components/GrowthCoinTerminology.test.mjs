import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const terminologySource = read('../shared/growthCoinTerminology.ts');
const dashboardSource = read('./Dashboard.tsx');
const bankSource = read('./BankView.tsx');
const shopSource = read('./ShopView.tsx');
const exchangeSource = read('./ExchangeView.tsx');

for (const required of ["name: '成长币'", "available: '可用'", "saved: '已存'", "details: '成长币明细'"]) {
  if (!terminologySource.includes(required)) throw new Error(`货柜机缺少统一成长币术语：${required}`);
}

for (const [source, name] of [[dashboardSource, '首页'], [bankSource, '积分银行'], [shopSource, '兑换页']]) {
  if (!source.includes('GROWTH_COIN_TERMS.name')) throw new Error(`货柜机${name}未独立展示成长币名称。`);
  if (!source.includes('GROWTH_COIN_TERMS.available')) throw new Error(`货柜机${name}未使用“可用”文案。`);
}

for (const [source, name] of [[dashboardSource, '首页'], [bankSource, '积分银行']]) {
  if (!source.includes('GROWTH_COIN_TERMS.saved')) throw new Error(`货柜机${name}未使用“已存”文案。`);
}

if (!exchangeSource.includes('GROWTH_COIN_TERMS.name')) {
  throw new Error('货柜机积分兑换页未统一使用成长币名称。');
}

for (const [source, name] of [[dashboardSource, '首页'], [bankSource, '积分银行'], [shopSource, '兑换页']]) {
  if (source.includes('>钱包<') || source.includes('>存款<') || source.includes('我的钱包') || source.includes('钱包余额') || source.includes('我的存款')) {
    throw new Error(`货柜机${name}仍有旧余额文案。`);
  }
}

console.log('成长币术语检查通过');
