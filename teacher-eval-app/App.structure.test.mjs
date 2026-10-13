import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  PRD_DIMENSIONS,
  PRD_FLOWS,
  PRD_RECORD_FIELDS,
  PRD_ROLES,
  PRD_RULES,
  PRD_SOURCES,
} from './prd/prdContent.ts';

const read = path => fs.readFileSync(path, 'utf8');

const app = read('teacher-eval-app/App.tsx');
const nav = read('teacher-eval-app/components/BottomNav.tsx');
const feed = read('teacher-eval-app/views/RecordFeedView.tsx');
const feedCard = read('teacher-eval-app/components/RecordFeedCard.tsx');
const draftCard = read('teacher-eval-app/components/DraftRecordCard.tsx');
const inputBar = read('teacher-eval-app/components/QuickInputBar.tsx');
const growth = read('teacher-eval-app/views/GrowthView.tsx');
const me = read('teacher-eval-app/views/MeView.tsx');
const rule = read('teacher-eval-app/views/PointsRuleView.tsx');
const detail = read('teacher-eval-app/views/RecordDetailView.tsx');
const demoShell = read('teacher-eval-app/TeacherEvalDemo.tsx');
const prdView = read('teacher-eval-app/prd/PrdView.tsx');
const prdFlow = read('teacher-eval-app/prd/FlowDiagram.tsx');
const allCopy = [app, nav, feed, feedCard, draftCard, inputBar, growth, me, rule, detail, demoShell, prdView, prdFlow].join('\n');

// 设计 Token 只认教师手机端唯一来源，不得另建色板文件。
assert.match(app, /from '\.\.\/mobile-app\/styles\/teacherMobileTokens\.ts'/, '教师评价应用必须复用教师手机端设计 Token 源。');
assert.match(app, /teacherBrandCssVariables/, '教师评价应用必须在根节点注入教师端设计 Token。');
assert.equal(fs.existsSync('teacher-eval-app/styles/teacherMobileTokens.ts'), false);
assert.equal(fs.existsSync('teacher-eval-app/styles/teacherBrandTokens.ts'), false);
assert.doesNotMatch(allCopy, /(?:blue|indigo|violet|purple|sky|slate)-[0-9]{3}/, '教师评价页面不得引入蓝紫靛色系。');
assert.doesNotMatch(allCopy, /#[0-9A-Fa-f]{6}/, '教师评价页面不得写死颜色值，一律使用设计 Token。');

// 对外口径：只讲成长档案与发展性评价，不承诺与绩效挂钩。
assert.doesNotMatch(allCopy, /绩效|考核分配|一票否决/, '教师端不得出现绩效与考核分配口径。');
assert.doesNotMatch(allCopy, /TODO|FIXME|设计说明|内部使用|实现逻辑/, '页面不得展示内部说明类文案。');
assert.doesNotMatch(allCopy, /修改/, '字段行不得出现“修改”文字按钮，值本身即为可点入口。');

// 一级导航：录入（AI 记录）/ 成长（数据维度）/ 我的。
assert.match(app, /type ViewName = 'feed' \| 'growth' \| 'me' \| 'record' \| 'points-rule' \| 'review-records'/);
assert.match(nav, /label: '录入'/);
assert.match(nav, /label: '成长'/);
assert.match(nav, /label: '我的'/);

// 录入页沿用记录页范式：原始输入区 + AI 智能解读区 + 悬浮录入条。
assert.match(feed, /<QuickInputBar/, '录入页必须挂悬浮录入条。');
assert.match(feed, /内容由AI生成/, '录入页顶部统一展示一次 AI 生成声明。');
assert.match(inputBar, /按住 说话/, '悬浮录入条中间为按住说话。');
assert.match(inputBar, /onPointerDown=\{onVoiceStart\}/, '语音录入必须在当前页原位开始。');
assert.doesNotMatch(feed, /window\.location|href=/, '语音录入不得跳转到独立录音页。');
assert.match(feedCard, /AI 智能解读/);
assert.match(feedCard, /原始语音/, '语音记录必须保留原始语音播放入口。');
assert.match(detail, /积分依据/);

// 三种录入方式都要有：拍照识别、语音口述、手动选指标。
assert.match(feed, /PHOTO_CAPTURE_SCENES/, '必须提供拍照识别入口。');
assert.match(feed, /VOICE_CAPTURE_SCENE/, '必须提供语音口述入口。');
assert.match(feed, /buildManualDraft/, '必须提供手动选指标填报入口。');
assert.match(feed, /buildDraftFromScene/, '拍照与语音必须复用同一张待确认卡片。');
assert.match(draftCard, /确认入档/, '待确认卡片必须有确认入档动作。');

// 成长页：学分 + 六大维度呈现 + 三种档案视图。
assert.match(growth, /六大维度/, '成长页必须呈现六大维度。');
assert.match(growth, /label: '时光轴'/);
assert.match(growth, /label: '按类别'/);
assert.match(growth, /label: '证书墙'/);
assert.match(growth, /ARCHIVE_FILTER_GROUPS/);

// 我的：只留入口，菜单项不再挂说明文案。
assert.match(me, /label: '积分规则'/);
assert.match(me, /label: '填报与审核记录'/);
assert.doesNotMatch(me, /description:/, '菜单项不得再挂显而易见说明文案。');
assert.match(rule, /GROWTH_SCORING_GLOBAL_RULES/);
assert.match(rule, /GROWTH_SCORE_YEARLY_CAP/);

// 演示外壳：顶部「原型 / PRD」大页签，原型走手机壳、PRD 走文档版式。
assert.match(demoShell, /\{ id: 'prototype', label: '原型' \}/);
assert.match(demoShell, /\{ id: 'prd', label: 'PRD' \}/);
assert.match(demoShell, /role="tablist"/);
assert.match(demoShell, /activeTab === 'prototype' \? <TeacherEvalApp showPhoneShell=\{showPhoneShell\} \/> : <PrdView \/>/);

// PRD：角色、分角色流程、六个价值维度、字段模型、关键规则都要在。
assert.equal(PRD_ROLES.length, 5, 'PRD 需覆盖教师、AI、学科组长、教务处、校长五类角色');
assert.equal(PRD_DIMENSIONS.length, 6, '教师评价价值维度必须是六个');
assert.ok(PRD_FLOWS.length >= 4, 'PRD 至少要给出教师、审核、管理者、状态机四条流程');
assert.ok(PRD_RECORD_FIELDS.length >= 10, '成长记录字段模型不应少于十个字段');
assert.ok(PRD_RULES.length >= 5, '关键计分规则不应少于五条');
assert.ok(PRD_SOURCES.length >= 4, '建模依据不应少于四条');

for (const role of PRD_ROLES) {
  assert.ok(role.goal.length > 4, role.name + ' 必须有流程目标');
  assert.ok(role.abilities.length > 0, role.name + ' 必须说明系统能力');
}
for (const dimension of PRD_DIMENSIONS) {
  for (const key of ['value', 'evidence', 'scoring']) {
    assert.ok(dimension[key].length > 4, dimension.name + ' 缺少 ' + key);
  }
  assert.ok(dimension.owner.length >= 2, dimension.name + ' 必须写明认定角色');
  assert.ok(dimension.categories.length > 0, dimension.name + ' 必须给出可填报类别');
  assert.ok(dimension.fields.length >= 4, dimension.name + ' 必须给出核心字段');
}
for (const flow of PRD_FLOWS) {
  assert.ok(flow.steps.length >= 2, flow.title + ' 至少要有两个流程步骤');
  for (const step of flow.steps) {
    assert.ok(step.actor.length > 0 && step.title.length > 0, flow.title + ' 的步骤必须标注角色与动作');
  }
}
assert.ok(
  PRD_FLOWS.some(flow => (flow.branches ?? []).some(branch => branch.label === '通过')),
  '审核流程必须给出通过分支',
);
assert.ok(
  PRD_FLOWS.some(flow => (flow.branches ?? []).some(branch => branch.label === '不通过')),
  '审核流程必须给出不通过分支',
);
const fieldNames = PRD_RECORD_FIELDS.map(field => field.name);
for (const required of ['归属维度', '归属类别', '级别', '等次', '颁发（主办）单位', '落款日期', '加分分值', '审核状态']) {
  assert.ok(fieldNames.includes(required), '字段模型缺少：' + required);
}

assert.match(prdView, /学校人员角色/);
assert.match(prdView, /角色业务流程图/);
assert.match(prdView, /系统、人工智能和技术实现暂不纳入/);
assert.match(prdView, /<FlowDiagram/);
assert.match(prdFlow, /aria-label=\{flow.title\}/);

console.log('教师评价页面结构与口径断言通过');
