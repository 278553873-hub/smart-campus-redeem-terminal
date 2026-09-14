import { readFileSync } from 'node:fs';

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8');
const terminologySource = read('../shared/growthCoinTerminology.ts');
const dashboardSource = read('./Dashboard.tsx');
const growthSource = read('./GrowthView.tsx');
const bankSource = read('./BankView.tsx');
const shopSource = read('./ShopView.tsx');
const exchangeSource = read('./ExchangeView.tsx');
const appSource = read('../App.tsx');

for (const required of ["name: '成长币'", "available: '可用'", "saved: '已存'", "details: '成长币明细'"]) {
  if (!terminologySource.includes(required)) throw new Error(`货柜机缺少统一成长币术语：${required}`);
}

for (const [source, name] of [[dashboardSource, '首页'], [shopSource, '兑换页']]) {
  if (!source.includes('GROWTH_COIN_TERMS.name')) throw new Error(`货柜机${name}未独立展示成长币名称。`);
  if (!source.includes('GROWTH_COIN_TERMS.available')) throw new Error(`货柜机${name}未使用“可用”文案。`);
}

for (const [source, name] of [[dashboardSource, '首页'], [growthSource, '成长详情']]) {
  if (!source.includes('本月总分')) throw new Error(`货柜机${name}应使用“本月总分”。`);
  if (source.includes('净得分')) throw new Error(`货柜机${name}不应继续显示“净得分”。`);
}

if (!dashboardSource.includes('预计可得') || dashboardSource.includes('预估月度分红')) {
  throw new Error('货柜机首页应弱化分红概念，统一显示“预计可得”。');
}

for (const forbidden of ['净得分', '预估分红', '奖励分红']) {
  if (appSource.includes(forbidden)) throw new Error(`货柜机排行榜试算不应继续显示“${forbidden}”。`);
}

for (const required of ['当月总分', '预计可得', '奖励分配']) {
  if (!appSource.includes(required)) throw new Error(`货柜机排行榜试算缺少统一文案“${required}”。`);
}

for (const [source, name] of [[dashboardSource, '首页'], [appSource, '统一标题栏']]) {
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
