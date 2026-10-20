import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { build } from 'esbuild';

const { outputFiles } = await build({
  entryPoints: [fileURLToPath(new URL('./termReportTagStore.ts', import.meta.url))],
  bundle: true, write: false, platform: 'node', format: 'esm',
});
const { termReportTagKey, readTermReportTags, saveTermReportTags } = await import(
  `data:text/javascript;base64,${Buffer.from(outputFiles[0].text).toString('base64')}`
);
const storage = new Map();
globalThis.window = { localStorage: {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, value),
} };
const key = termReportTagKey('school-a', 'student-1', 'term-1');
assert.equal(readTermReportTags(key), null);
saveTermReportTags(key, [' 乐于助人 ', '善于观察', '勇于探索']);
assert.deepEqual(readTermReportTags(key), ['乐于助人', '善于观察', '勇于探索']);
for (const other of [
  termReportTagKey('school-b', 'student-1', 'term-1'),
  termReportTagKey('school-a', 'student-2', 'term-1'),
  termReportTagKey('school-a', 'student-1', 'term-2'),
]) assert.equal(readTermReportTags(other), null, '学校、学生和学期应分别隔离');
for (const invalid of [
  ['善于观察', '勇于探索'],
  ['善于观察', ' ', '勇于探索'],
  ['善于观察', ' 善于观察 ', '勇于探索'],
  ['一二三四五六七八九', '善于观察', '勇于探索'],
]) assert.throws(() => saveTermReportTags(key, invalid));
assert.deepEqual(readTermReportTags(key), ['乐于助人', '善于观察', '勇于探索'], '校验失败不覆盖已存内容');
storage.set(key, '{broken');
assert.equal(readTermReportTags(key), null, '损坏数据应回退默认标签');
storage.set(key, JSON.stringify([1, 2, 3]));
assert.equal(readTermReportTags(key), null);
window.localStorage.setItem = () => { throw new Error('quota'); };
assert.throws(() => saveTermReportTags(key, ['乐于助人', '善于观察', '勇于探索']), /quota/, '持久化失败必须通知调用方');
delete globalThis.window;
assert.equal(readTermReportTags(key), null, '服务端渲染不访问浏览器存储');
console.log('素养标签校验、保存读取、数据隔离与异常恢复检查通过');
