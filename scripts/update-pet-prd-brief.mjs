import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
import { build } from 'esbuild';
import { buildClassroomEvolutionPreview } from './pet-prd-brief/build-classroom-evolution-preview.mjs';

// 保留完整版原文；汇报版复用当前等级规则、课堂尺寸和动效样式，输出仍为离线单文件。
const project = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const read = path => readFile(resolve(project, path), 'utf8');
const destination = resolve(project, 'public/demos/pet-growth-prd.html');
let page = await readFile(destination, 'utf8');
const marker = '<!-- PET_PRD_BRIEF_START -->';
const endMarker = '<!-- PET_PRD_BRIEF_END -->';
const styleMarker = '<!-- PET_PRD_BRIEF_STYLE_START -->';
const styleEndMarker = '<!-- PET_PRD_BRIEF_STYLE_END -->';
const scriptMarker = '<!-- PET_PRD_BRIEF_SCRIPT_START -->';
const scriptEndMarker = '<!-- PET_PRD_BRIEF_SCRIPT_END -->';
function removeBlock(text, start, end) {
  if (!text.includes(start)) return text;
  const a = text.indexOf(start), b = text.indexOf(end, a);
  if (b < 0) throw new Error('汇报版区块缺少结束标记');
  return text.slice(0, a) + text.slice(b + end.length);
}
page = removeBlock(page, styleMarker, styleEndMarker);
page = removeBlock(page, marker, endMarker);
page = removeBlock(page, scriptMarker, scriptEndMarker);
page = page.replace('<div id="full-version" class="doc-panel" role="tabpanel" aria-labelledby="full-tab">', '').replace('<!-- PET_PRD_FULL_END --></div>', '');
const evolutionStart = '<!-- PET_EVOLUTION_REQUIREMENTS_START -->';
const evolutionEnd = '<!-- PET_EVOLUTION_REQUIREMENTS_END -->';
page = removeBlock(page, evolutionStart, evolutionEnd);
const evolutionRequirements = await read('scripts/pet-prd-brief/evolution-requirements.html');
page = page.replace('<section id="release">', () => `${evolutionStart}${evolutionRequirements}${evolutionEnd}<section id="release">`);
const originalBody = page.slice(page.indexOf('<div class="layout">'), page.indexOf('<script>'));
const bundled = await build({ stdin: { resolveDir: project, contents: `export { getPetGrowth, PET_STAGE_KEYS, PET_STAGE_LABELS } from './components/pets/petGrowth'; export { PET_STAGE_ARTWORK_SCALE } from './components/pets/petArtworkPresentation'; export { getClassroomDisplayConfig } from './shared/classroomDisplay'; export { getClassroomPetCardLayout } from './components/classroom/classroomPetCardLayout';` }, bundle: true, write: false, platform: 'node', format: 'esm' });
const api = await import(`data:text/javascript;base64,${Buffer.from(bundled.outputFiles[0].text).toString('base64')}`);
const layout = api.getClassroomPetCardLayout(api.getClassroomDisplayConfig('classroom').studentCard);
const colors = ['#DCE3EC', '#6FD16F', '#5FA8FF', '#B07BFF', '#F4C14B', '#FF6F6F'];
const scores = [0, 8, 32, 58, 113, 165];
const motions = ['轻轻抖动', '柔软小跳', '轻快弹跳', '平缓轻浮', '单层珠光闪卡', '双层光环 + 轮廓流光'];
const stages = scores.map((score, i) => {
  const growth = api.getPetGrowth(score);
  return { key: growth.stageKey, name: growth.stageLabel, level: growth.level, current: growth.levelCurrent, target: growth.levelTarget, ratio: growth.levelRatio, full: growth.isMaxLevel, motion: motions[i] };
});
const assetImage = (name, className = '') => `<img data-report-asset="${name}" class="${className}" alt="" draggable="false" decoding="async">`;
function scene(index, egg = 0) {
  const key = api.PET_STAGE_KEYS[index], size = api.PET_STAGE_ARTWORK_SCALE[key] * 100;
  const inside = index === 0
    ? `<span class="brief-egg-scene">${assetImage('nest', 'brief-egg-nest')}${assetImage('egg' + egg, 'pet-egg-artwork')}${assetImage('nest', 'brief-egg-nest brief-egg-front')}</span>`
    : `<span class="pet-companion-scene" data-pet-stage="${key}" data-pet-theme="forest"><span class="pet-companion-aura" aria-hidden="true"></span>${index >= 4 ? '<span class="pet-companion-holo-light" aria-hidden="true"></span><span class="pet-companion-halo" aria-hidden="true"></span>' : ''}${assetImage('base', 'pet-companion-habitat')}<span class="pet-companion-contact-shadow" aria-hidden="true"></span><span class="pet-companion-depth"><img data-report-art="${index}" class="pet-companion-artwork" alt="" draggable="false" decoding="async">${index === 5 ? '<span class="pet-companion-foil-sweep" aria-hidden="true"></span>' : ''}</span>${index === 5 ? '<span class="pet-companion-sparks" aria-hidden="true"><i></i><i></i><i></i></span>' : ''}</span>`;
  return `<span class="brief-scene-scale" style="--stage-size:${size}%">${inside}</span>`;
}
const scenes = stages.map((_, i) => scene(i));
const eggs = [scene(0, 0), scene(0, 1)];
const gallery = stages.map((stage, i) => `<div class="brief-stage-item"><div class="brief-stage-viewport" aria-hidden="true">${scenes[i]}</div><span class="brief-stage-tag" style="--stage-color:${colors[i]};${i === 0 ? '--stage-ink:#4B5563' : ''}">${stage.name}</span></div>`).join('');
const levels = Array.from({ length: 166 }, (_, i) => api.getPetGrowth(i)).filter((growth, i, all) => i === 0 || growth.level !== all[i - 1].level);
const band = stages.map((stage, i) => {
  const group = levels.filter(level => level.stageIndex === i);
  return `<div class="brief-level-group" style="--level-span:${group.length};--stage-color:${colors[i]}"><strong>${stage.name}</strong><div class="brief-level-numbers">${group.map(level => `<span>lv${level.level}<small>${level.levelStart}分</small></span>`).join('')}</div></div>`;
}).join('');
const escapeAttribute = text => text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const previewDocument = await buildClassroomEvolutionPreview(project);
let fragment = await read('scripts/pet-prd-brief/brief.html');
const substitutions = {
  STAGE_GALLERY: gallery, LEVEL_BAND: band,
  EVOLUTION_STAGE_CHOICES: stages.map((stage, i) => `<button type="button" data-evolution-stage="${i}" aria-pressed="${i === 0}">${stage.name}</button>`).join(''),
  CLASSROOM_EVOLUTION_PREVIEW: `<div class="brief-evolution-viewport"><iframe id="brief-classroom-evolution-preview" title="课堂大屏宠物进化效果" srcdoc="${escapeAttribute(previewDocument)}"></iframe></div>`,
  EGG_CHOICES: ['紫色星纹蛋', '橙色条纹蛋'].map((name, i) => `<button type="button" data-report-egg="${i}" aria-pressed="${i === 0}"><span class="brief-stage-viewport" aria-hidden="true">${eggs[i]}</span>${name}</button>`).join(''),
  INITIAL_SCENE: scenes[0],
  STAGE_CHOICES: stages.map((stage, i) => `<button type="button" data-report-stage="${i}" aria-pressed="${i === 0}">${stage.name}</button>`).join(''),
};
Object.entries(substitutions).forEach(([key, value]) => { fragment = fragment.replace(`{{${key}}}`, () => value); });
if (/\{\{[A-Z_]+\}\}/.test(fragment)) throw new Error('精简版存在未填充内容');
const assets = {};
for (const [name, path] of Object.entries({ waterJuvenile: 'demo-stages/a-juvenile.png', egg1: 'neutral-egg-stripe.png', nest: 'cloud-vine-nest.png', frontMask: 'cloud-vine-nest-front-mask.svg', base: 'pet-universal-base-v1.png' })) {
  const data = await readFile(resolve(project, 'components/pets/assets', path));
  assets[name] = `data:image/${path.endsWith('.svg') ? 'svg+xml' : 'png'};base64,${data.toString('base64')}`;
}
const sharedCss = await Promise.all(['petCompanionMotion.css', 'petEggMotion.css', 'petInteractionReplay.css'].map(name => read(`components/pets/${name}`)));
const css = (await read('scripts/pet-prd-brief/brief.css')) + `\n.brief-report{--brief-card-width:${layout.width}px;--brief-card-height:${layout.cardHeight}px;--brief-image-height:${layout.imageHeight}px;--brief-viewport:${layout.artworkViewportSize}px}\n` + sharedCss.join('\n');
const dataScript = `const REPORT_DATA=${JSON.stringify({ stages, scenes, eggs, assets }).replace(/</g, '\\u003c')};`;
const tabs = '<header class="doc-topbar"><div class="doc-topbar-inner"><div class="doc-topbar-title">成长伙伴<span>产品方案</span></div><div class="doc-tabs" role="tablist" aria-label="文档版本"><button type="button" id="full-tab" role="tab" data-view="full" aria-controls="full-version" aria-selected="true" tabindex="0">完整版</button><button type="button" id="brief-tab" role="tab" data-view="brief" aria-controls="brief-version" aria-selected="false" tabindex="-1">精简版</button></div></div></header>';
page = page.replace('</head>', `${styleMarker}<style>\n${css}\n</style>${styleEndMarker}</head>`);
page = page.replace('<div class="layout">', '<div id="full-version" class="doc-panel" role="tabpanel" aria-labelledby="full-tab"><div class="layout">');
page = page.replace('</main></div><script>', '</main></div><!-- PET_PRD_FULL_END --></div><script>');
const briefScript = await read('scripts/pet-prd-brief/brief.js');
page = page.replace('<div id="full-version"', () => `${marker}${tabs}${fragment}<script>${dataScript}\n${briefScript}</script>${endMarker}<div id="full-version"`);
// 脚本需在完整版原有 ART 数组及两套面板均就绪后执行。
const scriptStart = page.indexOf('<script>' + dataScript);
const scriptEnd = page.indexOf('</script>', scriptStart) + '</script>'.length;
const script = page.slice(scriptStart, scriptEnd);
page = page.slice(0, scriptStart) + page.slice(scriptEnd);
page = page.replace('</body>', () => scriptMarker + script + scriptEndMarker + '</body>');
const preservedBody = page.slice(page.indexOf('<div class="layout">'), page.indexOf('<!-- PET_PRD_FULL_END -->'));
if (preservedBody !== originalBody) throw new Error('完整版正文意外发生变化');
await writeFile(destination, page);
console.log('已更新完整版 / 精简版；保留完整版正文，复用当前等级、卡片尺寸和悬停样式。');

