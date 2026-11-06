import assert from 'node:assert/strict';
import { PARENT_GROWTH_COIN_FEATURE_UPDATED_EVENT, readParentGrowthCoinFeatures, writeParentGrowthCoinFeatures } from './parentGrowthCoinFeature.ts';

const storage = new Map();
let dispatchedEvent;
globalThis.window = {
  localStorage: { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, value) },
  dispatchEvent: event => { dispatchedEvent = event; return true; },
};
const defaults = { enabled: true, bankEnabled: true };
assert.deepEqual(readParentGrowthCoinFeatures('class-a'), defaults);
storage.set('campus-parent-bank-feature:v1', JSON.stringify({ 'class-a': false, 'class-b': true }));
assert.deepEqual(readParentGrowthCoinFeatures('class-a'), { enabled: false, bankEnabled: false });
assert.deepEqual(readParentGrowthCoinFeatures('class-b'), defaults);
for (const enabled of [true, false]) {
  for (const bankEnabled of [true, false]) {
    const settings = { enabled, bankEnabled };
    assert.deepEqual(writeParentGrowthCoinFeatures('class-a', settings), settings);
    assert.deepEqual(readParentGrowthCoinFeatures('class-a'), settings);
    assert.deepEqual(readParentGrowthCoinFeatures('class-b'), defaults);
  }
}
// 总开关不抹除银行选择，重新开启后继续采用原配置。
writeParentGrowthCoinFeatures('class-a', { enabled: false, bankEnabled: true });
writeParentGrowthCoinFeatures('class-a', { ...readParentGrowthCoinFeatures('class-a'), enabled: true });
assert.deepEqual(readParentGrowthCoinFeatures('class-a'), defaults);
assert.equal(dispatchedEvent.type, PARENT_GROWTH_COIN_FEATURE_UPDATED_EVENT);
assert.equal(dispatchedEvent.detail.classId, 'class-a');
storage.set('campus-parent-growth-coin-feature:v2', '{broken');
assert.deepEqual(readParentGrowthCoinFeatures('class-a'), { enabled: false, bankEnabled: false });
storage.set('campus-parent-growth-coin-feature:v2', JSON.stringify({ 'class-a': { enabled: 'false', bankEnabled: null } }));
assert.deepEqual(readParentGrowthCoinFeatures('class-a'), { enabled: false, bankEnabled: false });
console.log('成长币及银行配置：开关组合、旧配置兼容、班级隔离、银行选择保留与异常恢复通过。');
