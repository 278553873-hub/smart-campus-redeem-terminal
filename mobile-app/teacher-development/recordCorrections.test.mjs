import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

const result = await build({
  stdin: { contents: "export * from './data'; export * from './recordCorrections'; export * from './recordMatter'; export * from './recordLevels'; export * from './recordInput'; export * from './domain'; export * from './useDevelopmentStore'; export { default as RecordView } from './RecordView'; export { default as RecordRecognitionEditor } from './RecordRecognitionEditor'; export { createElement } from 'react'; export { renderToStaticMarkup } from 'react-dom/server';", resolveDir: fileURLToPath(new URL('.', import.meta.url)), loader: 'tsx' },
  bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic', loader: { '.jpg': 'dataurl', '.png': 'dataurl' },
  banner: { js: `import { createRequire } from 'node:module'; const require = createRequire(${JSON.stringify(fileURLToPath(new URL('../../package.json', import.meta.url)))});` },
  plugins: [{ name: 'render-sheets-without-browser', setup(build) {
    build.onLoad({ filter: /\/MobileBottomSheet\.tsx$/ }, () => ({ contents: "import React from 'react'; export default function Sheet({title,children,footer}) { return React.createElement('section', {'aria-label': title}, children, footer); }", loader: 'tsx' }));
  } }],
});
const { INDICATORS, INITIAL_RECORDS, TEACHERS, correctRecord, recordMatter, recordLevel, migrateRecordInput, teacherScore, inPeriod, readDevelopmentData, RecordView, RecordRecognitionEditor, createElement, renderToStaticMarkup } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].contents).toString('base64')}`);
const byId = id => structuredClone(INITIAL_RECORDS.find(record => record.id === id));
const indicatorOf = record => INDICATORS.find(indicator => indicator.id === record.indicatorId);
const change = (record, correction, actor = 't1', records = []) => correctRecord(record, indicatorOf(record), actor, correction, records, INDICATORS);

test('日期修改跨周期生效，保留原材料日期和录入时间，拒绝无效日期', () => {
  const original = byId('r1');
  const changed = change(original, { field: 'date', value: '2026-05-10' });
  assert.equal(changed.ok, true);
  assert.equal(changed.record.date, '2026-05-10');
  assert.equal(inPeriod(changed.record, '2026-spring'), true);
  assert.equal(inPeriod(changed.record, '2026-autumn'), false);
  assert.equal(changed.record.recordedAt, original.recordedAt);
  assert.equal(changed.record.inputContext.date, original.date);
  assert.equal(changed.record.imageSampleId, original.imageSampleId);
  assert.equal(original.date, '2026-10-12');
  assert.equal(change(original, { field: 'date', value: '2026-02-30' }).ok, false);
  assert.equal(change(original, { field: 'date', value: '2030-01-01' }).ok, false);
  assert.equal(change(original, { field: 'date', value: original.date }).record, original);
});

test('教师对象固定，管理者可更换对象；原图片事实保持不变且重复事件被拦截', () => {
  const original = byId('r1');
  assert.equal(change(original, { field: 'teacher', value: 't3' }).ok, false);
  const changed = change(original, { field: 'teacher', value: 't3' }, 't2');
  assert.equal(changed.ok, true);
  assert.equal(changed.record.teacherId, 't3');
  assert.equal(changed.record.authorId, original.authorId);
  assert.equal(changed.record.inputContext.teacherId, 't1');
  assert.match(recordMatter(changed.record), /^张敏/);
  assert.equal(change(original, { field: 'teacher', value: 'unknown' }, 't2').ok, false);
  assert.equal(change(original, { field: 'date', value: '2026-10-10' }, 't3').ok, false);
  assert.equal(change(original, { field: 'teacher', value: 't3' }, 't2', [{ ...changed.record, id: 'another' }]).ok, false);
});

test('级别修改同步快照与学校计分，需审核记录重新送审，指标全局开关不变', () => {
  const original = { ...byId('r3'), status: 'approved', reviewerId: 't2' };
  const province = change(original, { field: 'level', value: '省级' });
  assert.equal(province.ok, true);
  assert.equal(recordLevel(province.record), '省级');
  assert.equal(province.record.fieldSnapshot.values.level, '省级');
  assert.equal(province.record.delta, 0);
  assert.equal(province.record.status, 'pending');
  assert.equal(province.record.reviewerId, undefined);
  assert.equal(teacherScore(INDICATORS, [province.record], 't1', '2026-autumn'), 100);
  assert.equal(change(province.record, { field: 'level', value: '市级' }).record.delta, 3);
  const communication = byId('r2');
  const personal = change(communication, { field: 'level', value: '个人' });
  assert.equal(personal.ok, true);
  assert.equal(recordLevel(personal.record), '个人');
  assert.equal(indicatorOf(communication).distinguishLevels, false);
  assert.equal(change(original, { field: 'level', value: '世界级' }).ok, false);
});

test('事项编辑独立保存，去掉计分条件后重算，原话与原图不受影响', () => {
  const original = byId('r3');
  const changed = change(original, { field: 'matter', value: '张敏参与的市级课题尚未结题。' });
  assert.equal(changed.ok, true);
  assert.equal(recordMatter(changed.record), '张敏参与的市级课题尚未结题。');
  assert.equal(changed.record.delta, 0);
  assert.equal(changed.record.text, original.text);
  assert.equal(changed.record.imageSampleId, original.imageSampleId);
  assert.equal(migrateRecordInput(changed.record).matter, changed.record.matter);
  assert.equal(change(original, { field: 'matter', value: '  ' }).ok, false);
});

test('切换学校指标重建明细、分数与审核，保留原始材料并撤掉旧指标的人工分数', () => {
  const original = { ...byId('r3'), status: 'approved', reviewerId: 't2', scoreAdjustment: { value: 2.5, reason: '原指标调整' }, delta: 2.5 };
  const changed = change(original, { field: 'indicator', value: 'C07' });
  assert.equal(changed.ok, true);
  const record = changed.record;
  assert.equal(record.indicatorId, 'C07');
  assert.equal(record.category, '研修培训');
  assert.equal(record.delta, 0);
  assert.equal(record.status, 'approved');
  assert.equal(record.requiresReview, false);
  assert.equal(record.reviewerId, undefined);
  assert.equal(record.scoreAdjustment, undefined);
  assert.equal(record.stage, undefined);
  assert.equal(record.contribution, undefined);
  assert.equal(record.fieldSnapshot.fields.some(field => field.key === 'hours'), true);
  assert.equal(record.fieldSnapshot.fields.some(field => field.key === 'stage'), false);
  assert.equal(recordLevel(record), '市级');
  assert.equal(record.text, original.text);
  assert.equal(record.imageSampleId, original.imageSampleId);
  assert.equal(record.recordedAt, original.recordedAt);
  assert.equal(record.authorId, original.authorId);
  assert.equal(recordMatter(record), recordMatter(original));
  assert.match(record.history.join(' '), /由“科研成果”修改为“研修学习”/);
  assert.equal(teacherScore(INDICATORS, [record], 't1', '2026-autumn'), 100);
  assert.equal(migrateRecordInput(record).indicatorId, 'C07');
  const pending = change(byId('r1'), { field: 'indicator', value: 'C09' });
  assert.equal(pending.record.status, 'pending');
  assert.equal(pending.record.delta, 0);
  assert.equal(pending.record.fieldSnapshot.values.hours, undefined);
  assert.equal(change(original, { field: 'indicator', value: original.indicatorId }).record, original);
});

test('指标切换遵守评价角色，拦截重复事件和未经核实的扣分', () => {
  const original = byId('r1');
  assert.equal(change(original, { field: 'indicator', value: 'unknown' }).ok, false);
  assert.equal(change(original, { field: 'indicator', value: 'C01' }).ok, false);
  assert.equal(change({ ...original, teacherId: 't2' }, { field: 'indicator', value: 'C01' }, 't2').ok, false);
  assert.equal(change(original, { field: 'indicator', value: 'C01' }, 't2').ok, true);
  assert.equal(change(original, { field: 'indicator', value: 'C08' }, 't1', [{ ...original, id: 'duplicate', indicatorId: 'C08' }]).ok, false);
  const complaint = { ...original, text: '接到投诉，张敏公开辱骂学生，尚未核实。' };
  assert.equal(change(complaint, { field: 'indicator', value: 'C02' }, 't2').ok, false);
  const verified = change({ ...complaint, text: '经核实，张敏公开辱骂学生。' }, { field: 'indicator', value: 'C02' }, 't2');
  assert.equal(verified.record.delta, -3);
});

test('人工分数有独立调整依据，不伪称命中学校规则，待审不提前计分且刷新保留', () => {
  const original = byId('r3');
  const changed = change(original, { field: 'score', value: 2.5, reason: '按实际贡献调整' });
  assert.equal(changed.ok, true);
  assert.equal(changed.record.delta, 2.5);
  assert.equal(changed.record.rule, original.rule);
  assert.deepEqual(changed.record.scoreAdjustment, { value: 2.5, reason: '按实际贡献调整' });
  assert.equal(changed.record.status, 'pending');
  assert.equal(teacherScore(INDICATORS, [changed.record], 't1', '2026-autumn'), 100);
  assert.equal(teacherScore(INDICATORS, [{ ...changed.record, status: 'approved' }], 't1', '2026-autumn'), 102.5);
  assert.equal(change(original, { field: 'score', value: NaN, reason: '' }).ok, false);
  assert.equal(change(original, { field: 'score', value: 1.234, reason: '' }).ok, false);
  const previousWindow = globalThis.window;
  globalThis.window = { localStorage: { getItem: () => JSON.stringify({ version: 1, records: [changed.record], indicators: INDICATORS }) } };
  try { assert.deepEqual(readDevelopmentData().records.find(record => record.id === original.id).scoreAdjustment, changed.record.scoreAdjustment); }
  finally { globalThis.window = previousWindow; }
});

test('记录页逐项操作独立，教师无对象编辑入口，管理者有对象入口且不嵌套按钮', () => {
  const render = actorId => renderToStaticMarkup(createElement(RecordView, { records: [byId('r1')], indicators: INDICATORS, teacherNames: Object.fromEntries(TEACHERS.map(teacher => [teacher.id, teacher.name])), actorId, mode: 'record', state: 'all', onOpen() {}, onEdit() {}, onActions() {} }));
  const teacher = render('t1');
  const manager = render('t2');
  const teacherButtons = [...teacher.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].map(match => match[1]);
  const managerButtons = [...manager.matchAll(/<button\b[^>]*>([\s\S]*?)<\/button>/g)].map(match => match[1]);
  assert.equal(teacherButtons.some(content => content.includes('对象')), false);
  assert.equal(managerButtons.some(content => content.includes('对象')), true);
  assert.ok(teacherButtons.some(content => content.includes('时间')));
  assert.ok(teacherButtons.some(content => content.includes('事项')));
  assert.ok(teacherButtons.some(content => content.includes('指标')));
  assert.ok(teacherButtons.every(content => !content.includes('<button')));
  assert.ok(teacherButtons.every(content => !content.includes('AI 智能解读')));
  assert.match(teacher, /修改分数/);
});

test('旧图片在更正日期和对象后仍展示原材料，避免将人工校正写入图片', () => {
  const original = byId('r4');
  const first = change(original, { field: 'date', value: '2026-10-20' }, 't2');
  const second = change(first.record, { field: 'teacher', value: 't3' }, 't2');
  const render = record => renderToStaticMarkup(createElement(RecordView, { records: [record], indicators: INDICATORS, teacherNames: Object.fromEntries(TEACHERS.map(teacher => [teacher.id, teacher.name])), actorId: 't2', mode: 'record', state: 'all', onOpen() {}, onEdit() {} }));
  const imageSources = html => [...html.matchAll(/<img\b[^>]*src="([^"]+)"/g)].map(match => match[1]);
  assert.deepEqual(imageSources(render(second.record)), imageSources(render(original)));
});

test('六类弹窗实际渲染，保留当前值与打分依据，日期只有月份时不默认选中某日', () => {
  const record = byId('r3');
  for (const field of ['date', 'teacher', 'indicator', 'level', 'matter', 'score']) {
    const html = renderToStaticMarkup(createElement(RecordRecognitionEditor, { record, indicator: indicatorOf(record), indicators: INDICATORS, actorId: 't1', field, onSave() { throw new Error('渲染不能保存'); }, onClose() {} }));
    assert.match(html, /保存并重新送审/);
    if (field === 'score') { assert.match(html, /打分依据/); assert.ok(html.includes(record.rule)); assert.match(html, /value="3"/); }
    if (field === 'matter') assert.ok(html.includes(recordMatter(record)));
    if (field === 'level') assert.match(html, /省级/);
    if (field === 'indicator') { assert.match(html, /搜索指标/); assert.match(html, /科研成果/); assert.doesNotMatch(html, /履职尽责/); assert.match(html, /原分数调整不再沿用/); }
  }
  const month = { ...byId('r1'), date: '2026-09' };
  const html = renderToStaticMarkup(createElement(RecordRecognitionEditor, { record: month, indicator: indicatorOf(month), actorId: 't1', field: 'date', onSave() {}, onClose() {} }));
  assert.match(html, /原记录仅到月份/);
  assert.doesNotMatch(html, /aria-pressed="true"/);
});
