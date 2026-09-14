import assert from 'node:assert/strict';
import {
  PARENT_BANK_FEATURE_UPDATED_EVENT,
  readParentBankFeatureEnabled,
  writeParentBankFeatureEnabled,
} from './parentBankFeature.ts';

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

assert.equal(readParentBankFeatureEnabled('c_2025_1'), true);
assert.equal(writeParentBankFeatureEnabled('c_2025_1', false), false);
assert.equal(readParentBankFeatureEnabled('c_2025_1'), false);
assert.equal(readParentBankFeatureEnabled('c_2025_2'), true);
assert.equal(dispatchedEvent?.type, PARENT_BANK_FEATURE_UPDATED_EVENT);
assert.equal(dispatchedEvent?.detail.classId, 'c_2025_1');
assert.equal(dispatchedEvent?.detail.enabled, false);

console.log('parent bank feature shared assertions passed');
