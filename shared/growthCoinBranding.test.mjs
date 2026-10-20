import assert from 'node:assert/strict';
import { COIN_ICON_PRESETS, DEFAULT_COIN_BRANDING, getCoinBrandTerms, validateCoinBranding } from './growthCoinBranding.ts';
import { readCoinBranding, saveCoinBranding, subscribeCoinBranding } from './growthCoinBrandingStore.ts';

const memory = new Map([['student-balance', '320'], ['student-history', '[{"amount":10}]']]);
globalThis.localStorage = { getItem: key => memory.get(key) ?? null, setItem: (key, value) => memory.set(key, value) };
globalThis.window = new EventTarget();
assert.deepEqual(readCoinBranding('school-a'), DEFAULT_COIN_BRANDING);
let events = 0;
const unsubscribe = subscribeCoinBranding('school-a', () => events++);
const own = { name: ' 向阳币 ', iconUrl: COIN_ICON_PRESETS[1].url };
saveCoinBranding('school-a', own);
assert.equal(readCoinBranding('school-a').name, '向阳币');
assert.equal(events, 1);
assert.equal(readCoinBranding('school-a'), readCoinBranding('school-a'), '同一快照引用稳定，避免React反复渲染');
assert.deepEqual(readCoinBranding('school-b'), DEFAULT_COIN_BRANDING, '学校之间不共享名称和图标');
saveCoinBranding('school-b', { name: '笋芽币', iconUrl: COIN_ICON_PRESETS[2].url });
assert.equal(events, 1, '其他学校更新不通知本校');
assert.equal(getCoinBrandTerms(readCoinBranding('school-b')).details, '笋芽币明细');
saveCoinBranding('school-star', { name: '星河币', iconUrl: COIN_ICON_PRESETS[3].url });
assert.equal(readCoinBranding('BS2024').name, '星河币', '家长演示学校编号映射到同一学校');
assert.equal(memory.get('student-balance'), '320');
assert.equal(memory.get('student-history'), '[{"amount":10}]');
assert.throws(() => validateCoinBranding({ ...own, name: ' ' }), /1至8/);
assert.throws(() => validateCoinBranding({ ...own, name: '一二三四五六七八九' }), /1至8/);
assert.throws(() => validateCoinBranding({ ...own, iconUrl: 'javascript:alert(1)' }), /请选择图标/);
assert.throws(() => validateCoinBranding({ ...own, iconUrl: 'data:image/svg+xml;base64,PHN2Zz4=' }), /请选择图标/);
assert.equal(validateCoinBranding({ ...own, iconUrl: 'data:image/png;base64,AAAA' }).iconUrl, 'data:image/png;base64,AAAA');
for (const iconUrl of ['/assets/coin.png', '/assets/c4d_growth.png', '/assets/c4d_shop.png', '/assets/c4d_bank.png', '/assets/growth-coins/coin-sprout.png', '/assets/growth-coins/coin-sun.png', '/assets/growth-coins/coin-laurel.png']) {
  assert.equal(validateCoinBranding({ name: '旧校币', iconUrl }).iconUrl, iconUrl, '旧图标继续兼容');
}
saveCoinBranding('school-a', DEFAULT_COIN_BRANDING);
assert.deepEqual(readCoinBranding('school-a'), DEFAULT_COIN_BRANDING, '可恢复默认');
unsubscribe();
localStorage.setItem = () => { throw new Error('quota'); };
assert.throws(() => saveCoinBranding('school-a', own), /保存失败/);
assert.deepEqual(readCoinBranding('school-a'), DEFAULT_COIN_BRANDING, '保存失败不能假报成功或改内存快照');
console.log('学校货币外观检查通过：学校隔离、跨端映射、校验、恢复默认、写入失败与旧资产保留');
