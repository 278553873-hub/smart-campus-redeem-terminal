/**
 * 教师手机端页面渲染冒烟的执行体。
 *
 * 由 scripts/audit-teacher-mobile-render.mjs 打包后在 Node 里执行：
 * 先补齐浏览器环境桩，再把关键页面各渲染一遍，结果写进 argv 传入的结果文件。
 * 这里依赖应用源码里的 JSX / 样式 / 图片，所以不能直接用 node 运行本文件。
 */
import fs from 'node:fs';
import React from 'react';
import { renderToString } from 'react-dom/server.browser';

const noop = () => {};
const resultPath = process.argv[2];
const results = [];

const storage = () => ({ getItem: () => null, setItem: noop, removeItem: noop, clear: noop, key: () => null, length: 0 });
const elementStub = {
  style: {},
  classList: { add: noop, remove: noop, toggle: noop, contains: () => false },
  setAttribute: noop,
  removeAttribute: noop,
  appendChild: noop,
  removeChild: noop,
  addEventListener: noop,
  removeEventListener: noop,
};

const define = (name, value) => {
  try {
    Object.defineProperty(globalThis, name, { value, writable: true, configurable: true });
  } catch (error) {
    console.log('浏览器环境桩写入失败，已跳过：' + name);
  }
};

define('window', globalThis);
define('self', globalThis);
define('localStorage', storage());
define('sessionStorage', storage());
define('navigator', { userAgent: 'render-smoke', maxTouchPoints: 0, language: 'zh-CN' });
define('matchMedia', () => ({ matches: false, addEventListener: noop, removeEventListener: noop, addListener: noop, removeListener: noop, media: '' }));
define('requestAnimationFrame', callback => setTimeout(() => callback(Date.now()), 0));
define('cancelAnimationFrame', noop);
define('ResizeObserver', class { observe() {} unobserve() {} disconnect() {} });
define('IntersectionObserver', class { observe() {} unobserve() {} disconnect() {} });
define('getComputedStyle', () => ({ getPropertyValue: () => '' }));
define('Image', class {});
define('HTMLElement', class {});
define('customElements', { get: () => undefined, define: noop });
define('location', { href: 'http://localhost/', search: '', hash: '', pathname: '/' });
define('history', { replaceState: noop, pushState: noop });
define('dispatchEvent', () => true);
define('addEventListener', noop);
define('removeEventListener', noop);
define('CustomEvent', class { constructor(type) { this.type = type; } });
define('document', {
  documentElement: elementStub,
  body: elementStub,
  head: elementStub,
  getElementById: () => null,
  querySelector: () => null,
  querySelectorAll: () => [],
  createElement: () => elementStub,
  addEventListener: noop,
  removeEventListener: noop,
  visibilityState: 'visible',
});

const writeResults = () => {
  fs.writeFileSync(resultPath, JSON.stringify(results));
};

const renderPage = async (name, load, props, verify) => {
  try {
    const module = await load();
    const Component = module.default;
    if (!Component) throw new Error('页面模块没有默认导出组件');
    const html = renderToString(React.createElement(Component, props));
    if (!html || html.length < 400) throw new Error('页面渲染结果为空');
    verify?.(html);
    results.push({ name, ok: true, htmlLength: html.length });
  } catch (error) {
    results.push({
      name,
      ok: false,
      message: error && error.message ? error.message : String(error),
      stack: error && error.stack ? String(error.stack) : '',
    });
  }
  writeResults();
};

const demoStudents = Array.from({ length: 6 }, (_, index) => ({
  id: 'render-smoke-student-' + (index + 1),
  name: '演示学生' + (index + 1),
  gender: index % 2 === 0 ? '男' : '女',
  grade: '三年级',
  class: '三年级1班',
  status: 'active',
  campusCoin: 120 - index * 5,
}));

const { createDemoCoinLedger } = await import('../mobile-app/data/campusCoinLedger');
const { expandCoinLedgerForStudent } = await import('../mobile-app/domain/campusCoinLedger');

// 用真实演示流水渲染，才能覆盖到列表、批次、撤回等分支，而不只是空状态。
const ledgerEntries = createDemoCoinLedger({
  classId: 'render-smoke-class',
  students: demoStudents,
  operator: '演示老师',
  today: new Date(),
});

await renderPage('教师端首页（默认页面）', () => import('../mobile-app/App'), {});

await renderPage('兑换核销页', () => import('../mobile-app/views/reward-verification/RewardVerificationView'), {
  classInfo: { id: 'render-smoke-class', name: '三年级1班', gradeLevel: '三年级' },
  currentSpace: { id: 'render-smoke-space', name: '示范学校' },
  students: demoStudents,
  onBack: noop,
  onViewExchangeRecords: noop,
  onRecordCoinRedeem: noop,
  onRecordCoinClear: noop,
});

await renderPage('成长币记录页', () => import('../mobile-app/views/ClassExchangeRecordView'), {
  students: demoStudents,
  entries: ledgerEntries,
  onRevokeEntry: noop,
  onBack: noop,
});

await renderPage('学生成长币明细页', () => import('../mobile-app/views/StudentCoinDetailView'), {
  student: demoStudents[0],
  coinDetail: {
    balance: 100,
    issueRecords: [],
    consumeRecords: expandCoinLedgerForStudent(ledgerEntries, demoStudents[0].id),
    settlementEstimate: { period: 'weekly', amount: 0 },
  },
  onBack: noop,
});

const { MOCK_BEHAVIOR_RECORDS } = await import('../mobile-app/constants');
await renderPage('学生详情（实际积分）', () => import('../mobile-app/views/DashboardView'), {
  student: demoStudents[0],
  currentSpace: { id: 'render-smoke-space', name: '示范学校' },
  scores: [
    { category: 'moral', label: '德育', score: 1250 },
    { category: 'intellectual', label: '智育', score: -25 },
    { category: 'physical', label: '体育', score: 0 },
    { category: 'aesthetic', label: '美育', score: 10 },
    { category: 'labor', label: '劳育', score: 15 },
  ],
  growthReports: [],
  collectionHistory: [],
  evaluationRecords: MOCK_BEHAVIOR_RECORDS,
  currentTeacherId: 'render-smoke-teacher',
  currentTeacherName: '演示老师',
  canEditOtherTeachersEvaluationRecords: false,
  campusCoinDetail: { balance: 0, issueRecords: [], consumeRecords: [], settlementEstimate: { period: 'weekly', amount: 0 } },
  onBack: noop,
}, html => {
  const plainHtml = html.replace(/<!--.*?-->/g, '');
  const start = plainHtml.indexOf('本学期五育积分');
  const summary = plainHtml.slice(start, plainHtml.indexOf('</section>', start));
  for (const score of ['1250', '-25', '0', '10', '15']) {
    if (!summary.includes('>' + score + '</span>')) throw new Error('学生详情实际积分未正确展示：' + score);
  }
  if (!summary.includes('总分')) throw new Error('学生详情缺少总分摘要');
  const total = summary.match(/总分<\/span><span[^>]*>([^<]+)<\/span>/)?.[1];
  if (total !== '1250') throw new Error('学生详情总分应为实际分项之和，实际为：' + total);
});

await renderPage('设置兑换密码页', () => import('../mobile-app/views/bank-password/BankPasswordView'), {
  classInfo: { id: 'render-smoke-class', name: '三年级1班', gradeLevel: '三年级' },
  currentSpace: { id: 'render-smoke-space', name: '示范学校' },
  students: demoStudents,
  onBack: noop,
}, html => {
  if (!html.includes('••••••')) throw new Error('兑换密码默认应以掩码展示。');
  const doubleQuote = String.fromCharCode(34);
  const revealLabel = 'aria-label=' + doubleQuote + '查看演示学生1兑换密码' + doubleQuote;
  if (!html.includes(revealLabel)) throw new Error('密码掩码时显隐按钮的无障碍名称应为查看加学生姓名加兑换密码。');
});

await renderPage('教师手机端登录页', () => import('../mobile-app/views/TeacherLoginView'), {
  onLogin: noop,
});

// 班主任助理三种能力组合都要能打开：少挂一个能力分支就会出现打开即白屏。
const assistantClasses = [
  { id: 'c_2025_4', name: '2025级四班', gradeLevel: '四年级', educationStage: 'primary' },
  { id: 'c_2025_1', name: '2025级一班', gradeLevel: '四年级', educationStage: 'primary' },
];

for (const combination of [
  { name: '仅班级评价', showClassEvaluation: true, showStudentEvaluation: false },
  { name: '仅学生评价', showClassEvaluation: false, showStudentEvaluation: true },
  { name: '学生评价和班级评价', showClassEvaluation: true, showStudentEvaluation: true },
]) {
  await renderPage(
    `班主任助理页（${combination.name}）`,
    () => import('../mobile-app/views/AiHeadteacherAssistantV2View'),
    {
      onBack: noop,
      homeroomClasses: assistantClasses,
      activeClassId: 'c_2025_4',
      onClassChange: noop,
      showStudentEvaluation: combination.showStudentEvaluation,
      showClassEvaluation: combination.showClassEvaluation,
      onOpenWeeklyActionAdvice: noop,
      onOpenEvaluationReview: noop,
    },
    html => {
      if (!html.includes('按住说话')) {
        throw new Error('班主任助理底部语音输入控件缺失');
      }
      if (combination.showStudentEvaluation && !combination.showClassEvaluation && !html.includes('哪些学生需要我重点关注？')) {
        throw new Error('仅开通学生评价时应给出学生评价建议问题');
      }
      if (combination.showClassEvaluation && !html.includes('班级评比主要扣在哪？')) {
        throw new Error('开通班级评价时应给出班级评比建议问题');
      }
    },
  );
}

// 渲染结束后主动退出：个别模块会留下常驻定时器，让进程一直挂着不返回。
process.exit(0);
