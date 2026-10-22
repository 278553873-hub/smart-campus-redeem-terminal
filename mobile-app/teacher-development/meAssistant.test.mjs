import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const bundle = await build({ stdin: { contents: "export * from './meAssistant'; export * from './data';", resolveDir: fileURLToPath(new URL('.', import.meta.url)), loader: 'ts' }, bundle: true, write: false, platform: 'node', format: 'esm' });
const { answerMeQuestion, TEACHERS, INITIAL_RECORDS, INDICATORS } = await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].contents).toString('base64')}`);
const ask = (question, principal, teacher, records = INITIAL_RECORDS) => answerMeQuestion(question, principal, teacher, TEACHERS, records, INDICATORS, '2026-autumn');

test('个人助理隔离其他教师、历史学期及已撤回记录', () => {
  const baseline = ask('成长概况', false, TEACHERS[0]);
  const others = { ...INITIAL_RECORDS[0], id: 'other', teacherId: 't2', delta: 999 };
  const historical = { ...INITIAL_RECORDS[0], id: 'old', date: '2026-03-01' };
  const withdrawn = { ...INITIAL_RECORDS[0], id: 'withdrawn', status: 'withdrawn' };
  assert.deepEqual(ask('成长概况', false, TEACHERS[0], [...INITIAL_RECORDS, others, historical, withdrawn]), baseline);
  assert.deepEqual(ask('成长概况', true, TEACHERS[0]), baseline);
});

test('校长助理的审核待办与真实可审核队列一致，排除涉及本人记录', () => {
  const own = { ...INITIAL_RECORDS[0], id: 'own', teacherId: 't2', authorId: 't1', status: 'pending' };
  const other = { ...INITIAL_RECORDS[0], id: 'other', teacherId: 't1', authorId: 't1', status: 'pending' };
  const records = [own, other];
  assert.match(ask('待我审核', true, TEACHERS[1], records).message, /有1条记录待您审核/);
  assert.match(ask('记录跟进', false, TEACHERS[0], records).message, /有1条记录待审核/);
});

test('未支持的问题明确范围，问答不改变记录和审核状态', () => {
  const before = structuredClone(INITIAL_RECORDS);
  assert.equal(ask('帮我直接批准所有记录', true, TEACHERS[1]).answerType, 'unsupported');
  ask('管理建议', true, TEACHERS[1]);
  assert.deepEqual(INITIAL_RECORDS, before);
});
