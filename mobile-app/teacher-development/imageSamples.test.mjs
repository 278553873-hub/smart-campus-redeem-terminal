import test from 'node:test';
import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
import { readFileSync } from 'node:fs';

const result = await build({
  stdin: { contents: "export * from './imageSamples'; export * from './data'; export * from './domain'; export * from './recordInput'; export * from './recordDates'; export * from './demoImages'; export { default as ImageSamplePicker } from './ImageSamplePicker'; export { default as RecordInputContent } from './RecordInputContent'; export { createElement } from 'react'; export { renderToStaticMarkup } from 'react-dom/server';", resolveDir: fileURLToPath(new URL('.', import.meta.url)), loader: 'tsx' },
  bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic', loader: { '.jpg': 'dataurl', '.png': 'dataurl' },
  banner: { js: `import { createRequire } from 'node:module'; const require = createRequire(${JSON.stringify(fileURLToPath(new URL('../../package.json', import.meta.url)))});` },
});
const { IMAGE_SAMPLES, INDICATORS, INITIAL_RECORDS, recognizeRecord, inPeriod, migrateRecordInput, formatRecordDate, demoInputImage, ImageSamplePicker, RecordInputContent, createElement, renderToStaticMarkup } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].contents).toString('base64')}`);
const sampleById = id => IMAGE_SAMPLES.find(sample => sample.id === id);
const recognize = (id, extra = {}, existing = []) => recognizeRecord({ text: '不会用于替代图片内容', actorId: 't1', role: 'teacher', date: '2026-10-15', inputType: 'image', imageSampleId: id, ...extra }, INDICATORS, existing);

test('十张实图全部进入选图入口，已排除的材料不再提供', () => {
  assert.equal(IMAGE_SAMPLES.length, 10);
  assert.equal(new Set(IMAGE_SAMPLES.map(sample => sample.id)).size, 10);
  for (const sample of IMAGE_SAMPLES) {
    assert.equal(sample.teacherId, 't1');
    assert.match(demoInputImage(sample.id, '张敏', sample.date), /^data:image\/jpeg;base64,/);
    const bytes = readFileSync(new URL(`../assets/resources/teacher-growth-samples/${sample.file}.jpg`, import.meta.url));
    assert.equal(bytes.readUInt16BE(0), 0xffd8);
  }
  const html = renderToStaticMarkup(createElement(ImageSamplePicker, { onSelect() {} }));
  assert.equal((html.match(/<button /g) ?? []).length, 10);
  assert.equal((html.match(/<img /g) ?? []).length, 10);
  assert.doesNotMatch(html, /公开授课|家校沟通记录|青年教师带教|团队协作材料/);
});

test('九类有指标的材料按学校规则识别，专业荣誉明确说明未提交', () => {
  for (const sample of IMAGE_SAMPLES.filter(item => item.indicatorId)) {
    const result = recognize(sample.id);
    assert.equal(result.ok, true, sample.label);
    assert.equal(result.record.teacherId, 't1');
    assert.equal(result.record.indicatorId, sample.indicatorId);
    assert.equal(result.record.date, sample.date);
    assert.equal(result.record.text, sample.text);
    assert.equal(result.record.category, sample.category);
  }
  const honor = recognize('professional-honor');
  assert.equal(honor.ok, false);
  assert.match(honor.question, /专业荣誉.*配置后再提交/);
  assert.equal(recognize('teaching-award').record.delta, 0);
  assert.equal(recognize('journal-article').record.delta, 0);
  assert.equal(recognize('student-award').record.delta, 0);
  assert.equal(recognize('teaching-practice').record.delta, 2);
});

test('账号与日期不改写图片事实，管理者为张敏代录且不能重复提交', () => {
  assert.equal(recognize('online-learning', { actorId: 't3' }).ok, false);
  assert.equal(recognize('online-learning', { actorId: 't2', role: 'manager', targetId: 't2' }).ok, false);
  const result = recognize('online-learning', { actorId: 't2', role: 'manager', targetId: 't1', date: '2026-05-01' });
  assert.equal(result.ok, true);
  assert.equal(result.record.teacherId, 't1');
  assert.equal(result.record.date, '2026-10-11');
  assert.equal(result.record.fieldSnapshot.values.hours, 12);
  assert.equal(result.record.authorId, 't2');
  assert.equal(recognize('training-certificate', {}, INITIAL_RECORDS).ok, false);
  assert.equal(recognize('online-learning', {}, [result.record]).ok, false);
});

test('论文只保存月份，个人研修不伪造学时，学生奖项保留指导身份', () => {
  const paper = recognize('journal-article').record;
  assert.equal(paper.date, '2026-09');
  assert.equal(formatRecordDate(paper.date), '2026年09月');
  assert.equal(inPeriod(paper, '2026-autumn'), true);
  assert.equal(inPeriod(paper, '2026-spring'), false);
  const personal = recognize('personal-reading').record;
  assert.equal(personal.level, '个人');
  assert.equal(personal.fieldSnapshot.values.hours, undefined);
  const award = recognize('student-award').record;
  assert.match(award.text, /学生A.*指导教师为张敏/);
  assert.equal(award.delta, 0);
});

test('旧预置事件安全升级实图，保留用户修改、审核结果与其他教师材料', () => {
  for (const id of ['r1', 'r3', 'r5']) {
    const seed = INITIAL_RECORDS.find(item => item.id === id);
    const old = { ...seed, inputType: id === 'r3' ? 'image' : 'text', imageSampleId: id === 'r3' ? 'research' : undefined, status: 'returned', note: '请核对材料', history: ['教师提交记录'], reviewerId: 't2' };
    const updated = migrateRecordInput(old);
    assert.equal(updated.imageSampleId, seed.imageSampleId);
    for (const key of ['status', 'note', 'delta', 'reviewerId', 'date']) assert.equal(updated[key], old[key]);
    const custom = { ...old, text: '用户自己修改的事件' };
    assert.equal(migrateRecordInput(custom).imageSampleId, custom.imageSampleId);
  }
  const other = INITIAL_RECORDS.find(item => item.id === 'r9');
  assert.equal(migrateRecordInput(other).imageSampleId, 'research');
  assert.match(demoInputImage('research', '陈晨', other.date), /^data:image\/svg\+xml/);
});

test('记录缩略图与详情读取同一原图，详情不限制长图高度', () => {
  const record = recognize('online-learning').record;
  const compact = renderToStaticMarkup(createElement(RecordInputContent, { record }));
  const detail = renderToStaticMarkup(createElement(RecordInputContent, { record, fullImage: true }));
  assert.equal(compact.match(/src="([^"]+)"/)[1], detail.match(/src="([^"]+)"/)[1]);
  assert.match(compact, /max-h-\[180px\]/);
  assert.doesNotMatch(detail, /max-h-/);
  assert.match(detail, /网络研修截图/);
});
