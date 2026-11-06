import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { build } from 'esbuild';

const progressStyles = readFileSync(new URL('./petGrowthProgress.css', import.meta.url), 'utf8');
assert.ok(progressStyles.includes('repeating-linear-gradient'), '共用进度条样式保留静态斜纹');

const result = await build({
  stdin: {
    resolveDir: process.cwd(),
    contents: `
      import React from 'react';
      import { renderToStaticMarkup } from 'react-dom/server.browser';
      import Card from './components/classroom/ClassroomPetCard';
      import { StudentPetEvaluationContent } from './components/classroom/StudentPetEvaluationDialog';
      export * from './components/pets/petGrowth';
      export * from './components/pets/petArtworkPresentation';
      export * from './components/pets/petGrowthDemo';
      export * from './mobile-app/domain/studentPerformance';
      export * from './shared/classroomDisplay';
      export * from './mobile-app/domain/studentCardDisplay';
      export * from './components/classroom/classroomPetCardLayout';
      export const render = (name, props) => renderToStaticMarkup(React.createElement(name === 'card' ? Card : StudentPetEvaluationContent, props));
    `,
  },
  bundle: true, write: false, platform: 'node', format: 'esm', jsx: 'automatic',
  loader: { '.png': 'dataurl', '.svg': 'dataurl', '.jpg': 'dataurl', '.webp': 'dataurl', '.css': 'empty' },
});
const api = await import(`data:text/javascript;base64,${Buffer.from(result.outputFiles[0].text).toString('base64')}`);
const { PET_STAGE_KEYS, PET_STAGE_ARTWORK_SCALE, PET_EVOLUTION_STEPS, PET_LEVEL_STEPS, PET_MAX_LEVEL, getEggGrowth, getPetGrowth, DEMO_PET_GROWTH_CASES, getDemoPetGrowthScore, getDemoPetEvolution, createDemoStudentPerformanceSummary, applyStudentPerformanceEvent, revertStudentPerformanceEvent, getClassroomDisplayConfig, getStudentCardDisplaySettings, getClassroomPetCardLayout, render } = api;
let previousScale = 0;
for (const key of PET_STAGE_KEYS) {
  const scale = PET_STAGE_ARTWORK_SCALE[key];
  assert.ok(scale > previousScale && scale <= 1.1, '展示体量按阶段递增，并控制在基准画布的110%以内');
  previousScale = scale;
}
for (let index = 0; index < DEMO_PET_GROWTH_CASES.length; index += 1) {
  const demoStudent = { id: `demo-${index}`, studentNo: String(index + 1).padStart(2, '0') };
  const initial = createDemoStudentPerformanceSummary(demoStudent);
  const initialGrowth = DEMO_PET_GROWTH_CASES[index];
  assert.equal(getDemoPetGrowthScore(demoStudent, initial.praiseScore), initialGrowth, '初始化混排六个阶段，不继承全部历史积分');
  assert.equal(getDemoPetGrowthScore(demoStudent, applyStudentPerformanceEvent(initial, 1).praiseScore), initialGrowth + 1);
  assert.equal(getDemoPetGrowthScore(demoStudent, applyStudentPerformanceEvent(initial, -1).praiseScore), initialGrowth);
  assert.equal(getDemoPetGrowthScore(demoStudent, revertStudentPerformanceEvent(initial, 1).praiseScore), Math.max(0, initialGrowth - 1));
}
const summary = { netScore: 2, praiseScore: 4, criticismScore: 2, praiseCount: 5, criticismCount: 2 };
const praised = applyStudentPerformanceEvent(summary, 1);
assert.equal(getEggGrowth(summary.praiseScore).ready, false);
assert.equal(getEggGrowth(praised.praiseScore).ready, true);
assert.equal(getEggGrowth(applyStudentPerformanceEvent(praised, -5).praiseScore).current, 5, '普通扣分不减少成长');
assert.equal(getEggGrowth(revertStudentPerformanceEvent(praised, 1).praiseScore).current, 4, '撤销错误加分修正成长');
assert.equal(getEggGrowth(35).earned, 35, '达到门槛后的加分继续保留');
assert.equal(getEggGrowth(35).ratio, 1, '进度不能超出轨道');
assert.equal(getEggGrowth(-5).current, 0);
assert.equal(getEggGrowth(NaN).current, 0);

assert.deepEqual(PET_EVOLUTION_STEPS.map(step => step.requiredScore), [5, 20, 20, 40, 80]);
assert.equal(PET_EVOLUTION_STEPS.reduce((sum, step) => sum + step.requiredScore, 0), 165);
const student = { id: 'test-1', studentNo: '01', name: '测试同学', avatar: '/avatar.png', gender: 'male' };
for (const mode of ['standard', 'classroom', 'distant']) {
  const layout = getClassroomDisplayConfig(mode).studentCard;
  assert.ok(layout.pet.fontSize < Math.min(layout.pet.nameFontSize, layout.pet.rosterFontSize), '每个档位的辅助文本必须小于姓名与学号');
  for (const showLevel of [true, false]) {
    for (const levelForm of ['icon', 'score', 'scoreWithBase']) {
      const settings = getStudentCardDisplaySettings({ showLevel, levelForm });
      const { imageHeight, cardHeight, artworkViewportSize } = getClassroomPetCardLayout(layout, settings);
      assert.ok(artworkViewportSize <= imageHeight && artworkViewportSize <= layout.pet.width - 12, '基准画布保持上下空间与左右安全边距');
      const html = render('card', { student: { ...student, baseScore: 80 }, performance: summary, levelNetScore: 12, displaySettings: settings, layout });
      assert.ok(html.includes(`width:${layout.pet.width}px`), '宠物卡实际宽度采用独立配置');
      assert.ok(html.includes(`height:${cardHeight}px`));
      assert.ok(html.includes(`height:${imageHeight}px`), '总分开关不改变宠物尺寸');
      assert.equal(html.includes('总分（'), showLevel, '关闭总分后移除总分内容');
      if (showLevel) {
        const total = levelForm === 'scoreWithBase' ? 92 : 12;
        assert.ok(html.includes(`）${total}分`), '总分与学生信息模式共用学期积分及学校基础分');
        assert.ok(!html.includes('下一枚'), '宠物卡总分始终为弱化数字，不显示学生等级图标');
        assert.ok(!html.includes('bg-blue-50 text-blue-700'), '总分不使用大号分数色片');
      } else {
        assert.ok(!html.includes('下一枚'));
        assert.ok(!html.includes('bg-blue-50 text-blue-700'));
        assert.equal(cardHeight, getClassroomPetCardLayout(layout).cardHeight, '总分与进度同排，关闭总分不留额外行或改变宠物大小');
      }
      assert.ok(html.includes('aria-valuenow="4"'), '总分展示方式不影响宠物成长分');
      assert.ok(html.includes('测试同学'));
      assert.ok(html.includes('pet-growth-progress__fill'), '宠物卡采用共用成长进度样式');
      const selectedHtml = render('card', { student, performance: summary, layout, isSelectable: true, selected: true });
      assert.ok(selectedHtml.includes('aria-pressed="true"'));
      assert.ok(selectedHtml.includes('bottom-10 left-2'), '勾选标记与右上方阶段标签分离');
      const zeroHtml = render('card', { student, performance: summary, growthScore: 0, displaySettings: settings, layout });
      assert.ok(zeroHtml.includes('aria-valuenow="0"'), '独立宠物成长值优先于历史累计积分，零分不被忽略');
    }
  }
}
for (const [score, stageIndex, current, target] of [
  [0, 0, 0, 5], [4, 0, 4, 5], [5, 1, 0, 20], [24, 1, 19, 20],
  [25, 2, 0, 20], [44, 2, 19, 20], [45, 3, 0, 40], [84, 3, 39, 40],
  [85, 4, 0, 80], [164, 4, 79, 80], [165, 5, 0, 0], [180, 5, 0, 0],
]) {
  const growth = getPetGrowth(score);
  assert.equal(growth.stageIndex, stageIndex);
  assert.equal(growth.current, current);
  assert.equal(growth.target, target);
  for (const studentNo of ['01', '07']) {
    const html = render('card', { student: { ...student, studentNo }, performance: summary, growthScore: score });
    assert.ok(html.includes(`伙伴${growth.stageLabel}`), '预览形象与阶段一致');
    assert.ok(html.includes(`>lv${growth.level}</span>`), '等级显示采用独立的十级计算');
    assert.ok(html.includes(stageIndex === 0 ? 'pet-egg-artwork' : `alt="${growth.stageLabel}"`), '两条路线均能渲染各阶段形象');
    assert.equal(html.includes('已满级'), stageIndex === 5);
  }
}
assert.equal(PET_MAX_LEVEL, 10);
assert.deepEqual(PET_LEVEL_STEPS, [5, 10, 10, 10, 10, 20, 20, 40, 40]);
for (const [score, level, stageIndex, current, target] of [
  [0, 1, 0, 0, 5], [4, 1, 0, 4, 5],
  [5, 2, 1, 0, 10], [14, 2, 1, 9, 10], [15, 3, 1, 0, 10], [24, 3, 1, 9, 10],
  [25, 4, 2, 0, 10], [34, 4, 2, 9, 10], [35, 5, 2, 0, 10], [44, 5, 2, 9, 10],
  [45, 6, 3, 0, 20], [58, 6, 3, 13, 20], [64, 6, 3, 19, 20], [65, 7, 3, 0, 20], [84, 7, 3, 19, 20],
  [85, 8, 4, 0, 40], [124, 8, 4, 39, 40], [125, 9, 4, 0, 40], [164, 9, 4, 39, 40],
  [165, 10, 5, 0, 0], [180, 10, 5, 0, 0],
]) {
  const growth = getPetGrowth(score);
  assert.equal(growth.level, level, `${score}分的等级`);
  assert.equal(growth.stageIndex, stageIndex, '同阶段升级不改变进化形象');
  assert.equal(growth.levelCurrent, current);
  assert.equal(growth.levelTarget, target);
  assert.equal(growth.isMaxLevel, level === 10);
  assert.equal(growth.levelRatio, level === 10 ? 1 : current / target);
  const html = render('card', { student, growthScore: score });
  assert.ok(html.includes(`>lv${level}</span>`));
  assert.ok(html.includes(`aria-valuenow="${level === 10 ? 1 : current}"`));
  assert.ok(html.includes(`aria-valuemax="${level === 10 ? 1 : target}"`));
  assert.equal(html.includes('已满级'), level === 10, '仅lv10显示满级');
}
for (const score of [-1, NaN, Infinity]) assert.equal(getPetGrowth(score).level, 1);

const props = {
  student, praiseScore: 4, visible: true, categories: ['课堂表现'],
  options: [{ id: 'p', label: '积极发言', type: 'positive', category: '课堂表现' }, { id: 'n', label: '交头接耳', type: 'negative', category: '课堂表现' }],
  tab: 'positive', layout: getClassroomDisplayConfig('standard').evaluation,
  onTabChange() {}, onSelect() {}, onManage() {}, onClose() {},
};
const positive = render('detail', props);
assert.ok(positive.includes('积极发言'));
assert.ok(!positive.includes('交头接耳'));
assert.ok(!positive.includes('待孵化'));
assert.ok(positive.includes('测试同学头像'));
assert.ok(positive.includes('aria-label="男生"'));
assert.ok(positive.includes('再获得'));
assert.ok(!positive.includes('role="status"'), '评价弹窗不保留完成反馈文案或空白反馈区');
assert.ok(positive.includes('初生蛋成长伙伴，点击互动'), '宠物预览提供可点击、可键盘操作的互动入口');
assert.doesNotMatch(positive, /style="[^"]*NaN/, '分段控件和进度条尺寸必须有效');
const ready = render('detail', { ...props, praiseScore: 5, tab: 'negative' });
assert.ok(!ready.includes('可孵化'));
assert.ok(ready.includes('自动进化'));
assert.ok(ready.includes('交头接耳'));
assert.ok(!ready.includes('积极发言'));
assert.ok(!ready.includes('正在孵化'), '没有生图任务时不能虚构生成状态');
// 生图等待时保留上一形象，经验条继续使用实时经验，完成后恢复新形象。
for (const status of ['generating', 'delayed']) {
  const evolution = { artworkScore: 19, status };
  for (const score of [25, 28]) {
    const card = render('card', { student, growthScore: score, evolution });
    assert.ok(card.includes('alt="幼年期"'), '经验跨阶段后仍保留最近可用形象');
    assert.ok(card.includes(`aria-valuenow="${score - 25}"`), '等待期间经验继续累计');
    assert.ok(card.includes('data-detail="false"'), '列表采用悬停播放的文字球');
    assert.ok(card.includes('pet-evolution-text--front'), '列表使用共用文字球');
    assert.ok(!card.includes('pet-evolution-frame__glint'), '列表不创建持续流光');
    const detail = render('detail', { ...props, praiseScore: score, evolution });
    assert.ok(detail.includes('alt="幼年期"'));
    assert.ok(detail.includes('data-detail="true"'));
    assert.ok(detail.includes('经验持续累积'));
    assert.ok(!detail.includes('自动进化'), '等待状态不重复提示尚未达标');
  }
}
const completed = render('card', { student, growthScore: 28 });
assert.ok(completed.includes('alt="成长期"'));
assert.ok(!completed.includes('pet-evolution-text--front'), '完成后移除等待特效');
// 模拟任务与实时经验分离；撤销跨阶段加分后不显示虚假等待态。
for (const [serial, earned, artworkScore, threshold] of [[4, 8, 0, 5], [8, 32, 8, 25], [11, 58, 32, 45]]) {
  const demoStudent = { studentNo: `202501${String(serial).padStart(2, '0')}` };
  assert.deepEqual(getDemoPetEvolution(demoStudent, earned), { artworkScore, status: 'generating' });
  assert.equal(getDemoPetEvolution(demoStudent, earned + 1).artworkScore, artworkScore, '继续加分不会提前换图');
  assert.equal(getDemoPetEvolution(demoStudent, threshold - 1), undefined, '未达阶段门槛不模拟生成');
}
assert.equal(getDemoPetEvolution({ studentNo: '20250101' }, 32), undefined, '普通学生不虚构生成任务');
console.log('十级升级与进化边界、成长计分、三档卡片和单人点评渲染检查通过');
process.exit(0);
