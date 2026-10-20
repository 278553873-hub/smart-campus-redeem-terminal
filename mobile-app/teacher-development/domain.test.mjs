import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const result = await build({ stdin: { contents: "export * from './domain'; export * from './data'; export * from './recordInput'; export * from './indicatorFields'; export * from './recordLevels';", resolveDir: fileURLToPath(new URL('.', import.meta.url)), loader: 'ts' }, bundle: true, write: false, platform: 'node', format: 'esm' });
const { INDICATORS, INITIAL_RECORDS, recognizeRecord, indicatorScore, teacherScore, canReview, recordInbox, reviewInbox, reviewRecord, effectiveRecords, saveRecord, migrateRecordInput, recordFieldRows, withRecordFields, recordLevel, recordLevelGroup, RECORD_LEVELS } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].contents).toString('base64')}`);
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

test('已有输入类型的旧示例仍更新口吻，保留日期、积分与审核状态', () => {
  const seed = INITIAL_RECORDS.find(r => r.id === 'r2');
  const typedSeed = { ...seed, text: '与家长沟通学生学习习惯' };
  assert.equal(migrateRecordInput(typedSeed).text, '今天，我与刘甜家长沟通学生学习习惯。');
  const oldVoice = { ...seed, id: 'event-old-voice', date: '2026-10-14', inputType: 'text', text: '张敏老师于2026年10月14日完成一次家校沟通，与家长沟通了学生的阅读习惯。', status: 'returned', note: '请核对', reviewerId: 't2' };
  const updated = migrateRecordInput(oldVoice);
  assert.equal(updated.text, '今天，我与刘甜家长沟通学生学习习惯。'); assert.equal(updated.inputType, 'voice');
  for (const key of ['id', 'date', 'delta', 'status', 'note', 'reviewerId']) assert.equal(updated[key], oldVoice[key]);
  const custom = { ...oldVoice, text: '今天，我与小华家长沟通了作业安排。' };
  assert.equal(migrateRecordInput(custom).text, custom.text);
  const revised = { ...oldVoice, history: [...oldVoice.history, '修改后重新提交'] };
  assert.equal(migrateRecordInput(revised).text, revised.text);
});

test('补录事件日期与真实录入时间独立，旧数据优先保留已有录入时间', () => {
  const before = Date.now();
  const result = identify('今天，我完成了一次研修。', { date: '2026-05-16' });
  assert.equal(result.ok, true); assert.equal(result.record.date, '2026-05-16');
  assert.ok(Date.parse(result.record.recordedAt) >= before && Date.parse(result.record.recordedAt) <= Date.now());
  const seed = INITIAL_RECORDS.find(r => r.id === 'r2');
  const saved = { ...seed, recordedAt: '2026-10-10T03:20:00Z' };
  assert.equal(migrateRecordInput(saved).recordedAt, saved.recordedAt);
  const { recordedAt, ...oldSeed } = seed;
  assert.equal(migrateRecordInput(oldSeed).recordedAt, seed.recordedAt);
  const oldEvent = { ...oldSeed, id: 'event-1791763200000-previous' };
  assert.equal(migrateRecordInput(oldEvent).recordedAt, new Date(1791763200000).toISOString());
  assert.equal(migrateRecordInput({ ...oldSeed, id: 'unknown-legacy' }).recordedAt, undefined);
});


test('按所匹配指标提取字段；没有配置的级别或身份不出现在结果中', () => {
  const communication = identify('今天，我与校级活动中的刘甜家长沟通学生学习习惯。').record;
  assert.equal(communication.indicatorId, 'C06');
  assert.equal(communication.level, undefined);
  assert.deepEqual(recordFieldRows(communication), []);
  const training = identify('今天，我完成了区级研修，共6学时，主办单位：区教师发展中心。').record;
  assert.equal(training.level, '区级');
  assert.equal(training.delta, 1);
  assert.deepEqual(training.fieldSnapshot.values, { level: '区级', hours: 6, organizer: '区教师发展中心' });
  assert.equal(training.contribution, undefined);
  const configured = INDICATORS.map(i => i.id === 'C07' ? { ...i, distinguishLevels: false, fields: [{ key: 'activityName', label: '活动名称', type: 'text', required: false, hint: '本次活动名称' }] } : i);
  const custom = identify('我完成了校级研修，活动名称：阅读方法学习。', {}, configured).record;
  assert.equal(custom.level, undefined);
  assert.deepEqual(custom.fieldSnapshot.values, { activityName: '阅读方法学习' });
});

test('必填缺失、枚举冲突或无效数字得到校验；可选缺失不妨碍日常录入', () => {
  const configured = INDICATORS.map(i => i.id === 'C07' ? { ...i, fields: i.fields.map(f => ({ ...f, required: f.key === 'level' || f.key === 'hours' })) } : i);
  assert.equal(identify('今天，我完成了研修学习。').record.delta, 1);
  for (const text of ['我完成了研修。', '我完成了校级研修，共-3学时。', '我完成了校级和市级研修，共6学时。', '我完成了校级研修，共2学时和6学时。']) {
    const result = identify(text, {}, configured);
    assert.equal(result.ok, false);
    assert.match(result.question, /尚未提交/);
  }
  assert.equal(identify('我完成了校级研修，共0学时。', {}, configured).record.fieldSnapshot.values.hours, 0);
  const research = identify('今天，我主持的市级课题尚未结题。').record;
  assert.equal(research.fieldSnapshot.values.stage, undefined);
  assert.equal(research.delta, 0);
  assert.equal(identify('市级论文已结题，本人主持。').record.delta, 0);
});

test('历史字段保留提交时定义；旧数据兼容不改变得分、原话和审核结果', () => {
  const original = identify('今天，我完成了校级研修，共6学时。').record;
  const indicator = structuredClone(INDICATORS.find(i => i.id === 'C07'));
  indicator.fields[0].label = '后来修改的字段名称';
  indicator.fields[0].options = [];
  assert.equal(recordFieldRows(original, indicator)[0].label, '活动级别');
  assert.equal(recordFieldRows(original, indicator)[0].display, '校级');
  const { fieldSnapshot, ...old } = INITIAL_RECORDS.find(r => r.id === 'r1');
  const legacy = { ...old, contribution: '参训教师', status: 'returned', delta: 0, note: '原审核意见' };
  const migrated = withRecordFields(legacy, INDICATORS.find(i => i.id === 'C07'));
  assert.equal(migrated.status, 'returned'); assert.equal(migrated.delta, 0);
  assert.equal(migrated.text, legacy.text); assert.equal(migrated.note, legacy.note);
  assert.deepEqual(recordFieldRows(migrated).map(f => f.key), ['level']);
  assert.deepEqual(withRecordFields(migrated, indicator), migrated);
});


test('等级开关控制新记录；不区分与未识别均不冒充校级', () => {
  const disabled = INDICATORS.map(i => i.id === 'C07' ? { ...i, distinguishLevels: false } : i);
  const off = identify('今天，我完成了校级研修，共6学时。', {}, disabled).record;
  assert.equal(off.distinguishLevels, false);
  assert.equal(off.delta, 1);
  assert.equal(off.level, undefined);
  assert.equal(recordLevel(off), undefined);
  assert.equal(recordLevelGroup(off), '不区分等级');
  assert.deepEqual(recordFieldRows(off).map(row => row.key), ['hours']);
  const unknown = identify('今天，我完成了研修。').record;
  assert.equal(unknown.distinguishLevels, true);
  assert.equal(recordLevel(unknown), undefined);
  assert.equal(recordLevelGroup(unknown), '未识别等级');
  const enabled = INDICATORS.map(i => i.id === 'C06' ? { ...i, distinguishLevels: true } : i);
  assert.equal(recordLevel(identify('我与家长沟通校级活动。', {}, enabled).record), '校级');
});

test('统一五档，县级及旧区县级归一为区级，过滤和报表使用相同等级', () => {
  assert.deepEqual(RECORD_LEVELS.map(level => level.short), ['校', '区', '市', '省', '国']);
  for (const inputLevel of ['区级', '县级', '区县级']) {
    const recognized = identify(`我完成了${inputLevel}公开课，本人为执教人。`).record;
    assert.equal(recognized.delta, 2);
    assert.equal(recordLevel(recognized), '区级');
    assert.equal(recordLevelGroup(recognized), '区级');
  }
  const legacy = { ...INITIAL_RECORDS.find(r => r.id === 'r4'), distinguishLevels: undefined, level: '区县级', fieldSnapshot: { version: 1, fields: [{ key: 'level', label: '活动级别', type: 'enum', required: false, hint: '', options: [{ value: '区县级' }] }], values: { level: '区县级' } } };
  assert.equal(recordLevel(legacy), '区级');
  assert.equal(recordFieldRows(legacy)[0].display, '区级');
  assert.equal(recordLevel(identify('我完成了集团级研修。').record), undefined);
});

test('修改开关不改历史认定；关闭等级不能沿用按等级计分的规则', () => {
  const historical = identify('今天，我完成了校级研修。').record;
  const updatedIndicator = { ...INDICATORS.find(i => i.id === 'C07'), distinguishLevels: false };
  assert.equal(recordLevel(historical, updatedIndicator), '校级');
  assert.equal(recordLevelGroup(historical, updatedIndicator), '校级');
  const disabled = INDICATORS.map(i => i.id === 'C09' ? { ...i, distinguishLevels: false } : i);
  const result = identify('我主持的市级课题已经结题。', {}, disabled);
  assert.equal(result.ok, false);
  assert.match(result.question, /评分标准包含等级条件/);
});
