import assert from 'node:assert/strict';
import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';
import { applyEditableChanges, clone, dateDisplay, dateInput, editorGroups, readField, restoreSaved, scriptJSON, writeField } from './初成像编辑模型.mjs';

const html = await readFile(new URL('./吴浩_工具四_初始成像_手机阅读版.html', import.meta.url), 'utf8');
const initial = JSON.parse(html.match(/<script id="report-data" type="application\/json">([\s\S]*?)<\/script>/)[1]);
const sections = ['cover', ...Object.keys(initial.labels.sections)];

test('仅开放生成值，封面只开放姓名与日期，固定字段均锁定', () => {
  const fields = sections.flatMap((id) => editorGroups(initial, id).flatMap((group) => group.fields));
  const paths = new Set(fields.map((field) => field.path.join('.')));
  assert.deepEqual(editorGroups(initial, 'cover')[0].fields.map(f => f.path.join('.')), ['meta.name', 'data.date']);
  for (const key of ['parent', 'child', 'teacher', 'insight']) assert.ok(paths.has(`data.matrix.3.${key}`));
  for (const path of ['meta.school', 'meta.title', 'data.class', 'coverImage', 'labels.sections.five', 'data.matrix.0.dim', 'data.five.0.0', 'data.three.0.0', 'labels.light.want']) {
    assert.ok(!paths.has(path));
    assert.throws(() => writeField(initial, path.split('.'), '不应写入'), /固定字段/);
  }
  const observations = editorGroups(initial, 'observations');
  assert.equal(observations.length, 5);
  assert.ok(observations.every((group, i) =>
    group.fields.length === 4 && group.fields.every(f => f.path.slice(0, 3).join('.') === `data.matrix.${i}`)
  ));
  assert.deepEqual(editorGroups(initial, 'card').map(group => group.title), Object.values(initial.labels.quotes));
  assert.equal(readField(initial, ['data', 'matrix', 3, 'child']), '');
  assert.match(initial.data.light.parent, /学活.*乐健/);
  assert.equal(initial.data.date, '2026年10月30日');
});

test('保存与恢复额外拦截固定名称的改动，不能通过缓存修改模板', () => {
  const tampered = clone(initial);
  tampered.meta.school = '被改动的校名'; tampered.data.class = '被改动的班级';
  tampered.labels.light.want = '被改动的问题'; tampered.data.five[0][0] = '被改动的五育名称';
  tampered.data.matrix[0].insight = '新的观察';
  const saved = applyEditableChanges(initial, tampered);
  assert.equal(saved.meta.school, initial.meta.school);
  assert.equal(saved.data.class, initial.data.class);
  assert.equal(saved.labels.light.want, initial.labels.light.want);
  assert.equal(saved.data.five[0][0], initial.data.five[0][0]);
  const restored = restoreSaved(initial, JSON.stringify({ revision: initial.revision, savedAt: initial.updatedAt + 1, report: tampered }));
  assert.equal(restored.labels.light.want, initial.labels.light.want);
  assert.equal(restored.data.matrix[0].insight, '新的观察');
});

test('修改草稿不会污染原报告，保存后能恢复，取消草稿可直接丢弃', () => {
  const original = initial.data.matrix[0].insight;
  const draft = writeField(initial, ['data', 'matrix', 0, 'insight'], '老师补充的观察\n第二行');
  assert.equal(initial.data.matrix[0].insight, original);
  const envelope = JSON.stringify({ revision: initial.revision, savedAt: initial.updatedAt + 1, report: draft });
  assert.equal(restoreSaved(initial, envelope).data.matrix[0].insight, '老师补充的观察\n第二行');
  assert.equal(initial.data.matrix[0].insight, original);
  assert.equal(dateDisplay(dateInput(initial.data.date)), initial.data.date);
});

test('损坏、过期、版本不符或字段缺失的本地记录不能覆盖新报告', () => {
  for (const raw of ['{broken', null, JSON.stringify({ revision: 99, savedAt: initial.updatedAt + 1, report: initial }), JSON.stringify({ revision: 3, savedAt: 0, report: initial })]) assert.equal(restoreSaved(initial, raw), initial);
  const damaged = clone(initial); delete damaged.data.message;
  assert.equal(restoreSaved(initial, JSON.stringify({ revision: initial.revision, savedAt: initial.updatedAt + 1, report: damaged })), initial);
  const oldBrowser = writeField(initial, ['meta', 'name'], '旧修改');
  const newerDownload = { ...initial, updatedAt: initial.updatedAt + 10 };
  assert.equal(restoreSaved(newerDownload, JSON.stringify({ revision: initial.revision, savedAt: initial.updatedAt + 1, report: oldBrowser })), newerDownload);
});

test('内嵌报告数据可安全携带中文、换行及 HTML 字符', () => {
  const modified = writeField(initial, ['data', 'message', 'need'], '孩子说：“我想试试”\n</script><img src=x onerror=alert(1)>');
  const encoded = scriptJSON(modified);
  assert.ok(!encoded.includes('</script>'));
  assert.deepEqual(JSON.parse(encoded), modified);
});

test('实际渲染报告组件，确认每张卡只有一个编辑入口，保留成像卡正文及寄语下划线', async () => {
  const entry = fileURLToPath(new URL('./初成像手机稿.tsx', import.meta.url));
  const mobile = fileURLToPath(new URL('./吴浩_工具四_初始成像_手机阅读版.html', import.meta.url));
  const result = await build({ stdin: { contents: `import React from 'react'; import {renderToStaticMarkup} from 'react-dom/server'; import {readFileSync} from 'node:fs'; import {App} from ${JSON.stringify(entry)}; const html=readFileSync(${JSON.stringify(mobile)},'utf8'); const data=JSON.parse(html.match(/<script id="report-data" type="application\\/json">([\\s\\S]*?)<\\/script>/)[1]); process.stdout.write(renderToStaticMarkup(React.createElement(App,{source:data})));`, resolveDir: process.cwd(), loader: 'tsx' }, bundle: true, platform: 'node', format: 'cjs', write: false, loader: { '.css': 'empty', '.png': 'dataurl', '.jpg': 'dataurl', '.webp': 'dataurl', '.svg': 'dataurl' }, jsx: 'automatic', define: { 'process.env.NODE_ENV': '"production"' }, logLevel: 'silent' });
  const run = spawnSync(process.execPath, [], { input: result.outputFiles[0].text, encoding: 'utf8', maxBuffer: 5 * 1024 * 1024 });
  assert.equal(run.status, 0, run.stderr);
  assert.equal((run.stdout.match(/class="report-section"/g) || []).length, 7);
  assert.equal((run.stdout.match(/\breport-card"/g) || []).length, 7);
  assert.equal((run.stdout.match(/class="edit-button"/g) || []).length, 8);
  for (const card of run.stdout.matchAll(/<section\b[^>]*>(.*?)<\/section>/gs)) {
    assert.equal((card[1].match(/class="edit-button"/g) || []).length, 1);
  }
  assert.match(run.stdout, /data-page-texture="paper"/);
  assert.match(run.stdout, /id="light"[^>]*data-card-tone="gold"/);
  assert.equal((run.stdout.match(/class="filled-answer"/g) || []).length, 5);
  assert.match(run.stdout, /文明习惯与交往方式/);
  assert.match(run.stdout, /2026年10月30日/);
  assert.ok(!run.stdout.includes('<blockquote'));
  assert.ok(!run.stdout.includes('aria-label="更多操作"'));
  assert.ok(!run.stdout.includes('class="quote-text"'));
});

test('手机壳预览内嵌同一份完整手机稿，资源无需联网加载', async () => {
  const preview = await readFile(new URL('./吴浩_工具四_初始成像_手机壳预览.html', import.meta.url), 'utf8');
  const embedded = JSON.parse(preview.match(/<script id="preview-content" type="application\/json">([\s\S]*?)<\/script>/)[1]);
  assert.equal(embedded.html, html);
  assert.ok(!html.match(/<(script|link)[^>]+(?:src|href)="https?:/));
  assert.ok(!preview.match(/<(script|link)[^>]+(?:src|href)="https?:/));
});
