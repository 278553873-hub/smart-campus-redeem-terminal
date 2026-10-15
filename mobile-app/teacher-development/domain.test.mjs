import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const result = await build({ stdin: { contents: "export * from './domain'; export * from './data'; export * from './recordInput';", resolveDir: fileURLToPath(new URL('.', import.meta.url)), loader: 'ts' }, bundle: true, write: false, platform: 'node', format: 'esm' });
const { INDICATORS, INITIAL_RECORDS, recognizeRecord, indicatorScore, teacherScore, canReview, recordInbox, reviewInbox, reviewRecord, effectiveRecords, saveRecord, migrateRecordInput } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].contents).toString('base64')}`);
const input = (text, extra = {}) => ({ text, actorId: 't1', role: 'teacher', date: '2026-10-14', ...extra });
const identify = (text, extra, indicators = INDICATORS, records = []) => recognizeRecord(input(text, extra), indicators, records);
test('免审研修提交直接生效；待审核科研不影响得分', () => {
  const learning = identify('张敏已完成一次校级新课程研修。'); assert.equal(learning.ok, true); assert.equal(learning.record.status, 'approved'); assert.equal(learning.record.delta, 1);
  const research = identify('张敏主持的市级课题于2026年10月14日结题。', { inputType: 'image', imageSampleId: 'research' }); assert.equal(research.record.status, 'pending'); assert.equal(teacherScore(INDICATORS, [research.record], 't1', '2026-autumn'), 100);
  assert.equal(teacherScore(INDICATORS, [learning.record, research.record], 't1', '2026-autumn'), 101);
});
test('同一个审核开关作用于教师与管理者；仅管理者指标不能自评', () => {
  const configured = INDICATORS.map(i => i.id === 'C07' ? { ...i, requiresReview: true } : i);
  assert.equal(identify('完成一次研修', undefined, configured).record.status, 'pending');
  assert.equal(identify('张敏完成一次研修', { actorId: 't2', role: 'manager', targetId: 't1' }, configured).record.status, 'pending');
  assert.equal(identify('经核实张敏老师无故缺课。').ok, false);
  assert.equal(identify('经核实李岩老师无故缺课。', { actorId: 't2', role: 'manager', targetId: 't2' }).ok, false);
});
test('管理者不能审核本人提交或涉及本人的事件，另一位管理者可以', () => {
  const r = INITIAL_RECORDS.find(r => r.id === 'r6'); assert.equal(canReview(r, 't2'), false); assert.equal(canReview(r, 't4'), true); assert.equal(canReview(r, 't1'), false);
  const byMe = { ...INITIAL_RECORDS.find(r => r.id === 'r3'), authorId: 't2' }; assert.equal(canReview(byMe, 't2'), false);
  assert.equal(reviewRecord([r], r.id, 't2', true)[0].status, 'pending');
  assert.equal(reviewRecord([r], r.id, 't4', true)[0].status, 'approved');
  assert.equal(reviewRecord([r], r.id, 't4', false, '')[0].status, 'pending');
  assert.equal(reviewRecord([r], r.id, 't4', false, '需补充反馈')[0].status, 'returned');
});
test('投诉待核实不扣分；核实事实才按规则扣分', () => {
  const unverified = identify('张敏老师在课堂播放歌星作品，引发家长投诉，尚未核实。', { actorId: 't2', role: 'manager', targetId: 't1' }); assert.equal(unverified.ok, false); assert.match(unverified.question, /尚未提交/); assert.equal(teacherScore(INDICATORS, [], 't1', '2026-autumn'), 100);
  const verified = identify('经核实，张敏老师在课堂播放与教学无关的歌星作品并影响教学。', { actorId: 't2', role: 'manager', targetId: 't1' }); assert.equal(verified.record.status, 'approved'); assert.equal(verified.record.delta, -3); assert.equal(teacherScore(INDICATORS, [verified.record], 't1', '2026-autumn'), 97);
});
test('未来学习、未完成事项、未命中规则的级别不生成加分', () => {
  assert.equal(identify('计划参加新课程研修').record.delta, 0); assert.equal(identify('尚未完成家校沟通').record.delta, 0);
  assert.equal(identify('张敏主持的校级课题结题', { inputType: 'image', imageSampleId: 'research' }).record.delta, 0);
  assert.equal(identify('张敏参与市级课题立项', { inputType: 'image', imageSampleId: 'research' }).record.delta, 0);
});
test('材料归属、重复提交及无效日期得到可操作反馈', () => {
  assert.equal(identify('王悦完成一次研修').ok, false);
  assert.equal(identify('王悦完成一次研修', { role: 'manager', actorId: 't2', targetId: 't1' }).ok, false);
  assert.equal(identify('完成一次研修', { role: 'manager', actorId: 't2' }).ok, false);
  assert.equal(identify('完成一次研修', { date: '2026-99-99' }).ok, false);
  assert.equal(identify('完成一次研修', { date: '2026-02-30' }).ok, false);
  const first = identify('完成一次研修').record; assert.equal(identify('完成一次研修', {}, INDICATORS, [first]).ok, false);
});
test('周期隔离、无记录基础分、上下限与撤回恢复', () => {
  assert.equal(teacherScore(INDICATORS, INITIAL_RECORDS, 't6', '2026-autumn'), 100);
  assert.equal(teacherScore(INDICATORS, INITIAL_RECORDS, 't1', '2026-autumn'), 105);
  assert.equal(teacherScore(INDICATORS, INITIAL_RECORDS, 't1', '2026-spring'), 101);
  const indicator = { ...INDICATORS.find(i => i.id === 'C06'), upper: 8, lower: 2 };
  const template = identify('完成一次家校沟通').record;
  const many = Array.from({ length: 30 }, (_, index) => ({ ...template, id: String(index) }));
  assert.equal(indicatorScore(indicator, many, 't1', '2026-autumn'), 8);
  assert.equal(indicatorScore(indicator, many.map(r => ({ ...r, delta: -1 })), 't1', '2026-autumn'), 2);
  assert.equal(indicatorScore(indicator, many.map(r => ({ ...r, status: 'withdrawn' })), 't1', '2026-autumn'), 5);
  assert.equal(effectiveRecords(INITIAL_RECORDS, '2026-autumn').length, 8);
});

test('退回补充更新同一事件，不重复生成记录；不能改写他人事件', () => {
  const next = identify('张敏完成一次研修').record;
  const previous = { ...next, id: 'original', status: 'returned', history: ['原提交', '需补充'] };
  const updated = saveRecord([previous], next, 't1', 'original');
  assert.equal(updated.length, 1); assert.equal(updated[0].id, 'original'); assert.equal(updated[0].status, 'approved'); assert.equal(updated[0].history.includes('需补充'), true);
  assert.deepEqual(saveRecord([previous], next, 't2', 'original'), [previous]);
  const saved = saveRecord([], next, 't1'); assert.equal(saveRecord(saved, next, 't1').length, 1);
});

test('记录与审核独立；待办跨周期，排除自审，未通过回到提交人的记录', () => {
  const pending = { ...INITIAL_RECORDS.find(r => r.id === 'r3'), date: '2026-05-10' };
  const submittedByMe = { ...pending, id: 'my-submission', authorId: 't2' };
  const ownTeacherEvent = INITIAL_RECORDS.find(r => r.id === 'r6');
  const records = [pending, submittedByMe, ownTeacherEvent];
  assert.deepEqual(reviewInbox(records, 't2').map(r => r.id), ['r3']);
  assert.equal(reviewInbox(records, 't1').length, 0);
  assert.deepEqual(recordInbox(records, 't2').map(r => r.id), ['my-submission', 'r6']);
  const rejected = reviewRecord(records, 'r3', 't2', false, '材料不能证明本人主持');
  assert.equal(reviewInbox(rejected, 't2').length, 0);
  assert.equal(reviewInbox(rejected, 't2', 'returned')[0].note, '材料不能证明本人主持');
  assert.equal(recordInbox(rejected, 't1').find(r => r.id === 'r3').status, 'returned');
  assert.equal(effectiveRecords(rejected, 'all').length, 0);
  const replacement = identify('张敏主持的市级课题于2026年5月10日结题。', { inputType: 'image', imageSampleId: 'research' }).record;
  const resubmitted = saveRecord(rejected, replacement, 't1', 'r3');
  assert.equal(resubmitted.length, records.length);
  assert.equal(resubmitted.find(r => r.id === 'r3').note, undefined);
  assert.equal(resubmitted.find(r => r.id === 'r3').reviewerId, undefined);
  assert.equal(reviewInbox(resubmitted, 't2').length, 1);
  assert.equal(reviewInbox(resubmitted, 't2', 'returned').length, 0);
});

test('第一人称文本和语音归属本人；管理者自述不能记给他人', () => {
  const text = '今天，我与刘甜家长沟通学生学习习惯。';
  for (const inputType of ['text', 'voice']) {
    const result = identify(text, { inputType });
    assert.equal(result.ok, true); assert.equal(result.record.teacherId, 't1');
    assert.equal(result.record.inputType, inputType); assert.equal(result.record.indicatorId, 'C06'); assert.equal(result.record.delta, 1);
  }
  assert.equal(identify(text, { actorId: 't2', role: 'manager' }).record.teacherId, 't2');
  assert.equal(identify(text, { actorId: 't2', role: 'manager', targetId: 't1' }).ok, false);
  assert.equal(identify('王悦告诉我她完成一次研修').ok, false);
});
test('图片输入保留图片来源，拒绝无效样张和附件输入类型', () => {
  const result = identify('张敏主持的市级课题已结题。', { inputType: 'image', imageSampleId: 'research' });
  assert.equal(result.ok, true); assert.equal(result.record.inputType, 'image'); assert.equal(result.record.imageSampleId, 'research');
  assert.equal(identify('我完成了一次研修', { inputType: 'attachment' }).ok, false);
  assert.equal(identify('我完成了一次研修', { inputType: 'image', imageSampleId: 'missing' }).ok, false);
});
test('旧预置输入更新口吻，保留审核结果与自定义修改', () => {
  const { inputType, imageSampleId, ...seed } = INITIAL_RECORDS.find(r => r.id === 'r1');
  const old = { ...seed, text: '张敏于2026年10月12日完成新课程教学研修。', status: 'returned', reviewerId: 't4', note: '请核对时间', evidence: '研修证明' };
  const updated = migrateRecordInput(old);
  assert.match(updated.text, /^今天，我/); assert.equal(updated.inputType, 'text');
  assert.equal(updated.status, 'returned'); assert.equal(updated.reviewerId, 't4'); assert.equal(updated.note, '请核对时间');
  assert.equal('evidence' in updated, false);
  const custom = migrateRecordInput({ ...old, text: '今天，我完成了自己的研修记录。' });
  assert.equal(custom.text, '今天，我完成了自己的研修记录。');
});
