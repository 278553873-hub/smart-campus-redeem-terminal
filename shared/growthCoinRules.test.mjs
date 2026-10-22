import assert from 'node:assert/strict';
import { calculateScoreCoinAward, getGrowthCoinMode, getScoreCoinRule, getScoreCoinRuleSummary } from './growthCoinRules.ts';

const legacy = { enabled: true, period: 'weekly', budgetAmount: 500, sunshineRatio: 60 };
const legacySnapshot = structuredClone(legacy);
assert.equal(getGrowthCoinMode(legacy), 'periodic');
assert.equal(calculateScoreCoinAward(legacy, 5, 0), 0);
assert.deepEqual(legacy, legacySnapshot, '读取新规则不能改写老配置');

const score = { ...legacy, mode: 'score', scoreRule: { coinsPerPoint: 2, limitEnabled: true, limitPeriod: 'weekly', limitAmount: 20 } };
assert.equal(calculateScoreCoinAward(score, 1, 0), 2);
assert.equal(calculateScoreCoinAward(score, -10, 0), 0, '扣分不扣币');
assert.equal(calculateScoreCoinAward(score, 0, 0), 0);
assert.equal(calculateScoreCoinAward(score, 2, 19), 1, '临近上限只发剩余额度');
assert.equal(calculateScoreCoinAward(score, 1, 20), 0);
assert.equal(calculateScoreCoinAward(score, 1, 30), 0, '降低上限不追扣旧币');
assert.equal(calculateScoreCoinAward({ ...score, enabled: false }, 5, 0), 0);
assert.equal(calculateScoreCoinAward(score, Number.NaN, 0), 0);
assert.equal(calculateScoreCoinAward(score, 1, Number.NaN), 0);
assert.equal(calculateScoreCoinAward({ ...score, scoreRule: { ...score.scoreRule, limitEnabled: false } }, 5, 100), 10);

// 两个学生分别计额度；消费、负分和历史总分均不能改变累计发放量。
const issuedByStudent = { a: 20, b: 0 };
assert.equal(calculateScoreCoinAward(score, 1, issuedByStudent.a), 0);
assert.equal(calculateScoreCoinAward(score, 1, issuedByStudent.b), 2);
assert.equal(calculateScoreCoinAward(score, 1, 0), 2, '进入新周期由账本提供新的累计值');
const fractional = { ...score, scoreRule: { ...score.scoreRule, coinsPerPoint: 0.1, limitAmount: 0.3 } };
assert.equal(calculateScoreCoinAward(fractional, 1, 0.2), 0.1);
assert.equal(calculateScoreCoinAward(fractional, 3, 0), 0.3);
assert.equal(getScoreCoinRule({}).limitAmount, 20);
assert.equal(getScoreCoinRule({ scoreRule: { coinsPerPoint: -1, limitAmount: 0 } }).coinsPerPoint, 1);
assert.equal(getScoreCoinRuleSummary(score), '加 1 分得 2 币，每人每周最多获得 20 币');
assert.match(getScoreCoinRuleSummary({ ...score, scoreRule: { ...score.scoreRule, limitPeriod: 'monthly' } }), /每人每月/);
console.log('成长币规则检查通过：旧规则兼容、正向加分、个人上限与小数金额');

const daily = { ...score, scoreRule: { ...score.scoreRule, limitPeriod: 'daily' } };
assert.equal(getScoreCoinRule(daily).limitPeriod, 'daily');
assert.match(getScoreCoinRuleSummary(daily), /每人每天最多获得 20 币/);
assert.equal(calculateScoreCoinAward(daily, 1, 20), 0, '当天达到上限不再发放');
assert.equal(calculateScoreCoinAward(daily, 1, 0), 2, '新一天的累计值归零后可以继续获得');
