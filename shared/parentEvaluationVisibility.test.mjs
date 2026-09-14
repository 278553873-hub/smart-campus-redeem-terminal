import assert from 'node:assert/strict';
import {
  DEFAULT_PARENT_EVALUATION_VISIBILITY,
  PARENT_EVALUATION_VISIBILITY_UPDATED_EVENT,
  canShowParentEvaluationDetails,
  canShowParentEvaluationSummary,
  getParentEvaluationVisibilitySettings,
  readParentEvaluationVisibility,
  writeParentEvaluationVisibility,
} from './parentEvaluationVisibility.ts';

const storage = new Map();
let dispatchedEvent = null;
globalThis.window = {
  localStorage: {
    getItem: key => storage.get(key) ?? null,
    setItem: (key, value) => storage.set(key, value),
  },
  dispatchEvent: event => {
    dispatchedEvent = event;
    return true;
  },
};

assert.deepEqual(getParentEvaluationVisibilitySettings(), DEFAULT_PARENT_EVALUATION_VISIBILITY);
assert.deepEqual(DEFAULT_PARENT_EVALUATION_VISIBILITY, {
  positive: 'summary',
  negative: 'hidden',
});
assert.deepEqual(getParentEvaluationVisibilitySettings({ positive: 'summary', negative: 'invalid' }), {
  positive: 'summary',
  negative: 'hidden',
});

assert.equal(canShowParentEvaluationSummary('hidden'), false);
assert.equal(canShowParentEvaluationSummary('summary'), true);
assert.equal(canShowParentEvaluationSummary('summaryAndDetails'), true);
assert.equal(canShowParentEvaluationDetails('hidden'), false);
assert.equal(canShowParentEvaluationDetails('summary'), false);
assert.equal(canShowParentEvaluationDetails('summaryAndDetails'), true);

writeParentEvaluationVisibility('c_2025_1', { positive: 'summary', negative: 'hidden' });
assert.deepEqual(readParentEvaluationVisibility('c_2025_1'), {
  positive: 'summary',
  negative: 'hidden',
});
assert.deepEqual(readParentEvaluationVisibility('c_2025_2'), DEFAULT_PARENT_EVALUATION_VISIBILITY);
assert.equal(dispatchedEvent?.type, PARENT_EVALUATION_VISIBILITY_UPDATED_EVENT);
assert.equal(dispatchedEvent?.detail.classId, 'c_2025_1');

console.log('parent evaluation visibility shared assertions passed');
