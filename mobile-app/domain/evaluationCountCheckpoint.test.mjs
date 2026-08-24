import assert from 'node:assert/strict';
import fs from 'node:fs';

const source = fs.readFileSync(new URL('./evaluationCountCheckpoint.ts', import.meta.url), 'utf8');

assert.match(source, /resetAt: string/, '重新计数起点应记录发生时间。');
assert.match(source, /praiseCount: summary\.praiseCount/, '起点应记录当时的表扬次数。');
assert.match(source, /criticismCount: summary\.criticismCount/, '起点应记录当时的批评次数。');
assert.match(source, /Math\.max\(0, summary\.praiseCount - checkpoint\.praiseCount\)/, '表扬次数应从起点后重新统计且不得出现负数。');
assert.match(source, /Math\.max\(0, summary\.criticismCount - checkpoint\.criticismCount\)/, '批评次数应从起点后重新统计且不得出现负数。');
assert.doesNotMatch(source, /netScore|level/, '重新计数领域逻辑不得修改积分或等级。');

console.log('Evaluation count checkpoint assertions passed');
