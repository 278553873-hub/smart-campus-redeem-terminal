import assert from 'node:assert/strict';
import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';

// 只替换依赖浏览器挂载点的弹层外壳，真实渲染内部页签、滚轮与按钮。
const result = await build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server.browser';
      import Sheet from './mobile-app/components/ui/MobileDatePickerSheet';
      export const render = props => renderToStaticMarkup(React.createElement(Sheet, { open: true, onClose() {}, onConfirm() {}, ...props }));
    `,
    resolveDir: fileURLToPath(new URL('../../../', import.meta.url)),
    loader: 'tsx',
  },
  plugins: [{
    name: 'date-sheet-content',
    setup(builder) {
      builder.onLoad({ filter: /[/\\]MobileBottomSheet\.tsx$/ }, () => ({
        contents: `import React from 'react'; export default ({ titleContent, title, children, footer }) => <section aria-label={title}><header>{titleContent ?? title}</header>{children}<footer>{footer}</footer></section>;`,
        loader: 'tsx',
      }));
    },
  }],
  bundle: true,
  platform: 'node',
  format: 'esm',
  loader: { '.css': 'empty', '.png': 'dataurl' },
  banner: { js: `import { createRequire } from 'node:module'; const require = createRequire(${JSON.stringify(import.meta.url)});` },
  write: false,
  logLevel: 'silent',
});
const { render } = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const value = { start: '2024-02-01', end: '2024-02-29' };
const limits = { min: '2024-01-01', max: '2024-12-31' };
const month = render({ mode: 'range', value, ...limits });
assert.match(month, /选择月份/);
assert.match(month, /选择时间段/);
assert.match(month, /role="tabpanel" aria-label="选择月份"/);
assert.equal((month.match(/role="listbox"/g) ?? []).length, 2, '月份模式只提供年、月两列。');
assert.match(month, /aria-selected="true"[^>]*>2024年/);
assert.match(month, /aria-selected="true"[^>]*>2月/);
assert.doesNotMatch(month, /开始日期/);
assert.doesNotMatch(month, /disabled=""/);
const range = render({ mode: 'range', defaultSelectionMode: 'range', value, ...limits });
assert.match(range, /role="tabpanel" aria-label="选择时间段"/);
assert.match(range, /开始日期/);
assert.match(range, /结束日期/);
assert.equal((range.match(/role="listbox"/g) ?? []).length, 3, '时间段模式保留年、月、日三列。');
const empty = render({ mode: 'range', value, min: '2024-03-01', max: '2024-02-29' });
assert.match(empty, /暂无可选月份/);
assert.match(empty, /disabled=""/);
const period = render({ mode: 'month', monthSelection: 'wheel', value: 'school-month', periods: [
  { id: 'school-month', type: 'month', label: '2024年2月', startDate: value.start, endDate: value.end },
] });
assert.equal((period.match(/role="listbox"/g) ?? []).length, 2);
assert.doesNotMatch(period, /role="tablist"/);
assert.doesNotMatch(period, /disabled=""/);
console.log('日期弹层渲染通过：默认月份、时间段、无可选月份和独立业务月份。');
// 共享主题模块存在常驻定时器，断言完成后结束本测试进程。
process.exit(0);
