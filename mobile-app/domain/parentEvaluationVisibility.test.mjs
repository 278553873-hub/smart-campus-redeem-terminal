import assert from 'node:assert/strict';
import {
  DEFAULT_PARENT_EVALUATION_VISIBILITY,
  getParentEvaluationVisibilitySettings,
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

console.log('Parent evaluation visibility assertions passed');
