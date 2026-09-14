import assert from 'node:assert/strict';
import { getClassBudgetTotal, isCoinIssuanceEligible, normalizeMinimumEvaluationCount } from './campusCoinIssuance.ts';

assert.equal(normalizeMinimumEvaluationCount(0), 1);
assert.equal(normalizeMinimumEvaluationCount(2.9), 2);
assert.equal(isCoinIssuanceEligible({ enabled: true, periodEvaluationCount: 1, minimumEvaluationCount: 1 }), true);
assert.equal(isCoinIssuanceEligible({ enabled: true, periodEvaluationCount: 0, minimumEvaluationCount: 1 }), false);
assert.equal(isCoinIssuanceEligible({ enabled: false, periodEvaluationCount: 10, minimumEvaluationCount: 1 }), false);
assert.equal(getClassBudgetTotal({ budgetMode: 'per_class', budgetAmount: 500, classStudentCount: 10 }), 500);
assert.equal(getClassBudgetTotal({ budgetMode: 'per_student', budgetAmount: 10, classStudentCount: 50 }), 500);

console.log('Campus coin issuance eligibility assertions passed');
