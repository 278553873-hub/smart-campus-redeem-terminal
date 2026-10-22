import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const bundle = await build({ stdin: { contents: "export * from './recordActions'; export * from './recordMatter'; export * from './recordInput'; export * from './useDevelopmentStore'; export * from './data'; export * from './domain';", resolveDir: fileURLToPath(new URL('.', import.meta.url)), loader: 'ts' }, bundle: true, write: false, platform: 'node', format: 'esm' });
const { INITIAL_RECORDS, INDICATORS, recordMatter, migrateRecordInput, recognizeRecord, teacherScore, replaceAnalyzedRecord, deleteOwnRecord, deletedRecordIds, readDevelopmentData } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].contents).toString('base64')}`);

test('图片总结只来自材料，不采用旧描述或历史字段中的扩展事实', () => {
  const record = structuredClone(INITIAL_RECORDS.find(record => record.id === 'r1'));
  record.text = '今天，我完成研修，学到了几种课堂提问的方法。';
  record.fieldSnapshot.values.hours = 999;
  const summary = recordMatter(record);
  assert.match(summary, /^张敏.*6学时/);
  assert.doesNotMatch(summary, /今天|学到了|课堂提问|999/);
  assert.match(recordMatter({ ...record, imageSampleId: 'unrecognized' }), /尚未识别/);
  const migrated = migrateRecordInput({ ...record, text: '今天，我完成了校级新课程教学研修，学到了几种课堂提问的方法。' });
  assert.doesNotMatch(migrated.text, /学到了/);
  assert.equal(migrated.delta, record.delta);
});

test('文本总结转换人称和时间口吻，保留未完成、计划和原始事实', () => {
  const record = { ...INITIAL_RECORDS[0], inputType: 'text', text: '今天，我计划参加研修，尚未完成。' };
  assert.equal(recordMatter(record), '张敏计划参加研修，尚未完成。');
  assert.equal(record.text, '今天，我计划参加研修，尚未完成。');
  assert.equal(recordMatter({ ...record, text: '今天，我与家长沟通学生学习习惯。' }), '张敏与家长沟通学生学习习惯。');
});

test('已通过记录重新分析仍是同一事件，重新送审期间撤销旧计分，拒绝他人修改', () => {
  const original = { ...INITIAL_RECORDS.find(record => record.id === 'r3'), status: 'approved', reviewerId: 't2', note: '旧说明' };
  const result = recognizeRecord({ text: original.text, actorId: 't1', role: 'teacher', date: original.date, inputType: 'image', imageSampleId: original.imageSampleId }, INDICATORS, []);
  assert.equal(result.ok, true);
  const before = [original];
  assert.equal(teacherScore(INDICATORS, before, 't1', '2026-autumn'), 103);
  const updated = replaceAnalyzedRecord(before, result.record, original.id, 't1', '重新分析');
  assert.equal(updated.length, 1);
  assert.equal(updated[0].id, original.id);
  assert.equal(updated[0].recordedAt, original.recordedAt);
  assert.equal(updated[0].status, 'pending');
  assert.equal(updated[0].reviewerId, undefined);
  assert.equal(updated[0].note, undefined);
  assert.ok(updated[0].history.includes('重新分析'));
  assert.equal(teacherScore(INDICATORS, updated, 't1', '2026-autumn'), 100);
  assert.equal(teacherScore(INDICATORS, [{ ...updated[0], status: 'approved' }], 't1', '2026-autumn'), 103);
  assert.equal(replaceAnalyzedRecord(before, { ...result.record, authorId: 't2' }, original.id, 't2', '编辑记录'), before);
  assert.equal(original.status, 'approved');
});

test('删除仅作用于本人提交的记录，刷新不补回，积分与列表同步移除', () => {
  const original = { ...INITIAL_RECORDS.find(record => record.id === 'r3'), status: 'approved' };
  assert.deepEqual(deleteOwnRecord([original], original.id, 't2'), [original]);
  assert.deepEqual(deleteOwnRecord([original], original.id, 't1'), []);
  assert.equal(teacherScore(INDICATORS, [], 't1', '2026-autumn'), 100);
  const records = deleteOwnRecord(INITIAL_RECORDS, 'r12', 't1');
  const deleted = deletedRecordIds(INITIAL_RECORDS, records, ['r12']);
  assert.deepEqual(deleted, ['r12']);
  const previousWindow = globalThis.window;
  globalThis.window = { localStorage: { getItem: () => JSON.stringify({ version: 1, records, indicators: INDICATORS, deletedRecordIds: deleted }) } };
  try {
    const restored = readDevelopmentData();
    assert.equal(restored.records.some(record => record.id === 'r12'), false);
    assert.deepEqual(restored.deletedRecordIds, ['r12']);
    assert.equal(restored.records.length, records.length);
  } finally { globalThis.window = previousWindow; }
});
