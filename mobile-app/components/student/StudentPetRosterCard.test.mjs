import assert from 'node:assert/strict';
import { build } from 'esbuild';
const result = await build({
  stdin: { resolveDir: process.cwd(), contents: `
    import React from 'react';
    import { renderToStaticMarkup } from 'react-dom/server.browser';
    import Card from './mobile-app/components/student/StudentPetRosterCard';
    import star from './components/pets/assets/neutral-egg-star-glazed.png';
    import stripe from './components/pets/assets/neutral-egg-stripe.png';
    export { getClaimedPetGrowth } from './shared/classPetRoster';
    export { DEFAULT_PET_LEVEL_POINTS } from './shared/classPetSettings';
    export { teacherBrandCssVariables } from './mobile-app/styles/teacherMobileTokens';
    export { PET_STAGE_KEYS } from './components/pets/petGrowth';
    export const eggs = [star, stripe];
    export const render = props => renderToStaticMarkup(React.createElement(Card, props));
  ` }, bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic',
  loader: { '.png': 'dataurl', '.svg': 'dataurl', '.jpg': 'dataurl', '.webp': 'dataurl', '.css': 'empty' },
});
const api = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const settings = { enabled: true, claimMethod: 'teacher', deductExperience: false, levelPoints: api.DEFAULT_PET_LEVEL_POINTS };
const student = { id: 'a', studentNo: '01', name: '欧阳同学长姓名', gender: 'male' };
const props = { student, showSelection: false, selected: false, onClick() {} };
for (const score of [0, 5, 25, 45, 85, 165]) {
  const pet = api.getClaimedPetGrowth([{ id: 'r', score }], settings);
  const html = api.render({ ...props, pet });
  const text = html.replace(/<[^>]*>/g, '');
  assert.equal((html.match(/<button\b/g) ?? []).length, 1, '整张卡片为唯一点击入口');
  assert.match(html, new RegExp(`data-pet-stage="${api.PET_STAGE_KEYS[pet.stage]}"`));
  assert.ok(!text.includes('经验'), '小卡片仅显示数字进度，完整语义留给读屏');
  assert.match(html, /role="progressbar"/);
  if (score === 0) assert.ok(api.eggs.some(src => html.includes(`src="${src}"`)), '初始蛋仍为默认两款之一');
  if (score === 165) assert.ok(text.includes('已满级'));
}
const customPet = api.getClaimedPetGrowth([{ id: 'r', score: 3 }], { ...settings, levelPoints: Array(9).fill(10) });
assert.ok(api.render({ ...props, pet: customPet }).includes('3/10'));
const selected = api.render({ ...props, pet: customPet, showSelection: true, selected: true });
assert.match(selected, /aria-pressed="true"/);
assert.match(selected, /title="欧阳同学长姓名"/);
assert.doesNotMatch(api.render({ ...props, pet: 'unclaimed' }), /role="progressbar"/);
const luminance = hex => {
  const rgb = hex.slice(1).match(/../g).map(x => parseInt(x, 16) / 255).map(x => x <= 0.04045 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4);
  return rgb[0] * .2126 + rgb[1] * .7152 + rgb[2] * .0722;
};
const foreground = luminance(api.teacherBrandCssVariables['--tm-text-primary']);
for (const background of ['#DCE3EC', '#6FD16F', '#5FA8FF', '#B07BFF', '#F4C14B', '#FF6F6F']) {
  const bg = luminance(background);
  assert.ok((Math.max(foreground, bg) + .05) / (Math.min(foreground, bg) + .05) >= 4.5, '阶段小字对比度满足4.5:1');
}
console.log('宠物卡片六阶段、默认蛋、自定义进度、满级、多选、未领取与标签对比度检查通过');

// 服务端渲染模块可能保留消息通道，断言完成后结束独立测试进程。
process.exit(0);
