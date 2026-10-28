import assert from 'node:assert/strict';
import { build } from 'esbuild';

const bundle = await build({
  stdin: {
    contents: `export * from './mobile-app/domain/studentCardDisplay.ts';`,
    resolveDir: process.cwd(),
  },
  bundle: true,
  write: false,
  platform: 'node',
  format: 'esm',
});
const { getStudentCardDisplaySettings, getStudentCardTotalScore, STUDENT_TOTAL_DISPLAY_OPTIONS } =
  await import(`data:text/javascript;base64,${Buffer.from(bundle.outputFiles[0].text).toString('base64')}`);

assert.deepEqual(STUDENT_TOTAL_DISPLAY_OPTIONS.map(item => item.label), [
  '图标', '总分', '总分+基础分',
]);
for (const form of ['icon', 'score', 'scoreWithBase']) {
  const disabled = getStudentCardDisplaySettings({ showLevel: false, levelForm: form });
  assert.equal(disabled.levelForm, form, '关闭总开关应保留选择');
  assert.equal(getStudentCardDisplaySettings({ ...disabled, showLevel: true }).levelForm, form);
}
assert.equal(getStudentCardDisplaySettings().levelForm, 'icon');
assert.equal(getStudentCardDisplaySettings({ levelForm: 'score' }).levelForm, 'score');
assert.equal(getStudentCardTotalScore(15, 'score', 100), 15);
assert.equal(getStudentCardTotalScore(15, 'scoreWithBase', 100), 115);
assert.equal(getStudentCardTotalScore(0, 'scoreWithBase', 60), 60);
assert.equal(getStudentCardTotalScore(-105, 'scoreWithBase', 100), -5);
assert.equal(getStudentCardTotalScore(2.5, 'scoreWithBase', 60), 62.5);
console.log('学生卡片总分口径、基础分、负分与配置兼容检查通过');

const renderBundle = await build({
  stdin: {
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server.browser';
      import Settings from './mobile-app/components/student-performance/CardLevelDisplaySettings';
      import MobileCard from './mobile-app/components/student/StudentRosterCard';
      import DesktopCard from './components/classroom/ClassroomStudentCard';
      export const render = (name, props) => renderToStaticMarkup(React.createElement({Settings, MobileCard, DesktopCard}[name], props));
    `,
    resolveDir: process.cwd(),
  },
  bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic',
  loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.svg': 'dataurl', '.webp': 'dataurl' },
});
const { render } = await import(`data:text/javascript;base64,${Buffer.from(renderBundle.outputFiles[0].text).toString('base64')}`);
const onChange = () => {};
const settingsHtml = render('Settings', { showLevel: true, levelForm: 'scoreWithBase', onChange });
for (const option of STUDENT_TOTAL_DISPLAY_OPTIONS) assert.ok(settingsHtml.includes(option.label));
assert.equal((settingsHtml.match(/aria-pressed=/g) ?? []).length, 3);
assert.ok(settingsHtml.includes("data-sliding-indicator"));
assert.ok(!settingsHtml.includes("type=\"radio\""));
assert.ok(!render('Settings', { showLevel: false, levelForm: 'scoreWithBase', onChange }).includes('type="radio"'));
assert.ok(!render('Settings', { target: 'group', showLevel: true, levelForm: 'score', onChange }).includes('含基础分'));
for (const name of ['MobileCard', 'DesktopCard']) {
  const props = {
    student: { id: '1', name: '测试学生', studentNo: '01', gender: 'male', baseScore: 60 },
    index: 0,
    performance: { netScore: 15, praiseScore: 20, criticismScore: 5 },
    displaySettings: getStudentCardDisplaySettings({ levelForm: 'scoreWithBase' }),
    onClick: onChange,
  };
  const html = render(name, props);
  assert.ok(html.includes('总分（含基础分）75分'), `${name}应显示学校实际基础分加净得分`);
  assert.ok(html.includes('>75</span>'), `${name}应渲染正确总分`);
  const withoutBase = render(name, { ...props, displaySettings: { ...props.displaySettings, levelForm: 'score' } });
  assert.ok(withoutBase.includes('总分（不含基础分）15分'));
}
console.log('两端学生卡片和设置组件真实渲染检查通过');
// React 浏览器服务端渲染器会保留调度端口，完成同步断言后结束检查进程。
process.exit(0);
