import assert from 'node:assert/strict';
import {
  DEFAULT_PARENT_EVALUATION_VISIBILITY,
  DEFAULT_SCHOOL_PARENT_EVALUATION_CONFIG,
  getParentEvaluationVisibilitySettings,
  readSchoolParentEvaluationVisibility,
  writeSchoolParentEvaluationVisibility,
  readParentEvaluationVisibility,
  writeParentEvaluationVisibility,
  getEffectiveParentEvaluationVisibility,
} from './parentEvaluationVisibility.ts';

assert.deepEqual(DEFAULT_PARENT_EVALUATION_VISIBILITY, {
  positive: 'summary',
  negative: 'hidden',
});

assert.deepEqual(getParentEvaluationVisibilitySettings(), DEFAULT_PARENT_EVALUATION_VISIBILITY);
assert.deepEqual(getParentEvaluationVisibilitySettings({ negative: 'hidden' }), {
  positive: 'summary',
  negative: 'hidden',
});

// 模拟 window.localStorage 和 CustomEvent 环境进行存储测试
class LocalStorageMock {
  store = {};
  getItem(key) { return this.store[key] ?? null; }
  setItem(key, value) { this.store[key] = String(value); }
  removeItem(key) { delete this.store[key]; }
  clear() { this.store = {}; }
}
globalThis.window = {
  localStorage: new LocalStorageMock(),
  dispatchEvent: () => true,
};
globalThis.CustomEvent = class CustomEvent { constructor(type, options) { this.type = type; this.detail = options?.detail; } };

// 1. 默认学校配置
assert.deepEqual(readSchoolParentEvaluationVisibility('school_1'), DEFAULT_SCHOOL_PARENT_EVALUATION_CONFIG);

// 2. 班级初始配置
writeParentEvaluationVisibility('class_1', { positive: 'summaryAndDetails', negative: 'summaryAndDetails' });
writeParentEvaluationVisibility('class_2', { positive: 'summary', negative: 'summary' });

// 3. 允许自主设置时，有效配置优先使用班级自身配置，且为可编辑态
const effectiveClass1 = getEffectiveParentEvaluationVisibility('class_1', 'school_1');
assert.equal(effectiveClass1.isReadOnly, false);
assert.equal(effectiveClass1.allowCustomization, true);
assert.equal(effectiveClass1.settings.positive, 'summaryAndDetails');
assert.equal(effectiveClass1.settings.negative, 'summaryAndDetails');

// 4. 管理层设置学校统一规则并关闭自主设置（方案 B：重置所有班级）
writeSchoolParentEvaluationVisibility('school_1', {
  settings: { positive: 'summaryAndDetails', negative: 'hidden' },
  allowHomeroomTeacherCustomization: false,
});

// 5. 校验方案 B 效果：班级配置被同化为学校规则，且变为只读态
const effectiveClass1AfterLock = getEffectiveParentEvaluationVisibility('class_1', 'school_1');
assert.equal(effectiveClass1AfterLock.isReadOnly, true);
assert.equal(effectiveClass1AfterLock.allowCustomization, false);
assert.equal(effectiveClass1AfterLock.settings.positive, 'summaryAndDetails');
assert.equal(effectiveClass1AfterLock.settings.negative, 'hidden');

const effectiveClass2AfterLock = getEffectiveParentEvaluationVisibility('class_2', 'school_1');
assert.equal(effectiveClass2AfterLock.isReadOnly, true);
assert.equal(effectiveClass2AfterLock.allowCustomization, false);
assert.equal(effectiveClass2AfterLock.settings.positive, 'summaryAndDetails');
assert.equal(effectiveClass2AfterLock.settings.negative, 'hidden');

console.log('Parent evaluation visibility assertions passed');
