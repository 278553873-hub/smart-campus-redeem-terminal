// 宣传手册截图脚本 v2：从用户运行中的 dev 服务器(3000)抓取各端「对应页面」并裁剪到设备屏
import { spawn } from 'child_process';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://127.0.0.1:3000/';
const OUT_DIR = '/Users/mayday/project/校园智能积分兑换终端/deliverables/brochure-assets';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// 按 aria-label 点击（图标按钮、浮动按钮只有 aria-label，没有可见文字）
const clickAriaJs = (label, prefix = false) => {
  const test = prefix ? 'a.startsWith(' + JSON.stringify(label) + ')' : 'a === ' + JSON.stringify(label);
  return `(() => {
  const screen = [...document.querySelectorAll('div[style*="width: 393px"]')].find(e => e.style.height === '852px' && e.className && e.className.includes('bg-white'));
  const scope = screen || document.body;
  const b = [...scope.querySelectorAll('[aria-label]')].find(x => { const a = x.getAttribute('aria-label') || ''; return !x.disabled && (${test}); });
  if (b) { b.click(); return 'click-aria: ${label}'; }
  return 'miss-aria: ${label}';
})()`;
};

// 「学生成长档案」填写页：逐个选项组选第一项、补全文本字段，让档案能通过必填校验
const ARCHIVE_TEXT_VALUES = [
  '喜欢阅读和动手实验，课堂上愿意主动表达自己的想法',
  '先稳定课堂专注习惯，把书写规范保持下来',
  '多用具体表扬，并把任务拆成看得见的小步骤',
  '本学期先稳定课堂专注与作业书写，再逐步增加阅读量',
];
// 截图用的正向取值：命中就用它，没命中就取该组第一项
const ARCHIVE_PREFERRED_OPTIONS = [
  '有基础', '20分钟以上', '主动提问并独立完成', '很喜欢', '自己尝试',
  '经常主动', '自觉', '能够商量', '快速平复', '热爱',
  '父母', '1-2小时', '求真', '兴趣激发', '继续观察兴趣火花', '已确认',
];

const FILL_ARCHIVE_JS = `(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const screen = [...document.querySelectorAll('div[style*="width: 393px"]')].find(e => e.style.height === '852px' && e.className && e.className.includes('bg-white'));
  const root = screen || document.body;
  const preferred = ${JSON.stringify(ARCHIVE_PREFERRED_OPTIONS)};
  let choices = 0;
  for (let pass = 0; pass < 40; pass++) {
    const groups = new Map();
    root.querySelectorAll('button[role=radio],button[role=checkbox]').forEach(b => {
      const box = b.parentElement && b.parentElement.parentElement;
      if (!box) return;
      if (!groups.has(box)) groups.set(box, []);
      groups.get(box).push(b);
    });
    let target = null;
    for (const list of groups.values()) {
      if (list.some(b => b.getAttribute('aria-checked') === 'true')) continue;
      const usable = list.filter(b => !b.disabled);
      target = usable.find(b => preferred.includes((b.textContent || '').trim())) || usable[0];
      if (target) break;
    }
    if (!target) break;
    target.click();
    choices += 1;
    await sleep(150);
  }
  const customInputs = [...root.querySelectorAll('input[aria-label*="补充内容"]')];
  for (const el of customInputs) {
    if (el.value) continue;
    const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    setter.call(el, '待继续观察');
    el.dispatchEvent(new Event('input', { bubbles: true }));
    await sleep(60);
  }
  let texts = 0;
  const values = ${JSON.stringify(ARCHIVE_TEXT_VALUES)};
  const areas = [...root.querySelectorAll('textarea')];
  for (let i = 0; i < areas.length; i += 1) {
    const el = areas[i];
    if (!el.value) {
      const setter = Object.getOwnPropertyDescriptor(HTMLTextAreaElement.prototype, 'value').set;
      setter.call(el, values[i % values.length]);
      el.dispatchEvent(new Event('input', { bubbles: true }));
      await sleep(60);
    }
    texts += 1;
  }
  return '选项' + choices + '组 / 文本' + texts + '项';
})()`;

// 「学生成长档案」完整进入路径：登录 → 班级 → 学生 → 更多操作 → 成长档案 → 新建并填完一份档案
// 启用一份推荐模板：新建档案 → 用模板创建 → 完成 → 启用
const enableTemplateSteps = (templateName) => [
  { clickAria: '新建档案' },
  { clickAria: `使用模板：${templateName}` },
  { click: '使用此模板', exact: true },
  { click: '完成', exact: true },
  { click: '启用档案', exact: true },
  { click: '确认启用', exact: true },
];

// 从子页面连续返回，直到出现底部标签（我的 / 班级 / 记录）为止
const BACK_TO_TABS_JS = `(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const scr = () => [...document.querySelectorAll('div[style*="width: 393px"]')].find(e => e.style.height === '852px' && e.className && e.className.includes('bg-white'));
  for (let i = 0; i < 4; i += 1) {
    const s = scr();
    if (!s) return 'no-screen';
    const hasTabs = [...s.querySelectorAll('button,[role=button],a')].some(b => (b.textContent || '').trim() === '我的');
    if (hasTabs) return 'tabs-visible';
    const back = [...s.querySelectorAll('[aria-label]')].find(x => (x.getAttribute('aria-label') || '') === '返回');
    if (!back) return 'no-back';
    back.click();
    await sleep(1300);
  }
  return 'give-up';
})()`;

// 截图前清理：去掉预览手机壳的 1px 描边与投影，避免图片自带灰框
const CLEAN_SCREEN_JS = `(() => {
  const screen = [...document.querySelectorAll('div[style*="width: 393px"]')].find(e => e.style.height === '852px' && e.className && e.className.includes('bg-white'))
    || document.querySelector('[data-preview-anchor="terminal-device"]');
  if (!screen) return 'no-target';
  screen.style.border = '0';
  screen.style.boxShadow = 'none';
  let node = screen.parentElement;
  let depth = 0;
  while (node && depth < 12) {
    node.style.background = 'transparent';
    node.style.backgroundColor = 'transparent';
    node = node.parentElement;
    depth += 1;
  }
  document.documentElement.style.background = 'transparent';
  if (document.body) document.body.style.background = 'transparent';
  return 'cleaned';
})()`;

const ARCHIVE_FLOW = [
  'login',
  // 演示环境默认没有已启用的档案模板，先按真实流程启用；两份都启用，保证学生年级能命中其中一份
  { click: '我的', exact: true },
  { click: '档案设计', exact: true },
  ...enableTemplateSteps('一年级初始成长档案'),
  ...enableTemplateSteps('学生个性与特长档案'),
  { backToTabs: true },
  { click: '班级', exact: true },
  { clickAria: '查看小2025级1班学生列表' },
  { clickAria: '王梓涵', ariaPrefix: true },
  { clickAria: '更多学生操作' },
  { click: '成长档案', exact: true },
  { clickAria: '新增档案' },
  // 选择当前学生可用的那份档案（开始填写）
  { click: '开始填写', exact: false },
  { fillArchive: true },
  { click: '保存修改', exact: true },
];

const ARCHIVE_TARGETS = [
  {
    name: 'student-archive', app: 'admin', selector: 'phone',
    actions: ARCHIVE_FLOW,
    // 同一次流程里再拍一张：打开刚建立的档案详情
    then: {
      name: 'student-archive-detail',
      actions: [{ click: '数据更新于', exact: false }],
    },
  },
];


// 每个目标：name, app, selector('phone'|'device'|null=整页), actions[]（登录/点击序列）
const TARGETS = [
  {
    name: 'teacher-record', app: 'admin', selector: 'phone',
    actions: ['login'],
  },
  {
    name: 'class-report', app: 'admin', selector: 'phone',
    actions: ['login', { click: '班级', exact: true }, { click: '班级报告', exact: true }],
  },
  {
    name: 'terminal-shop', app: 'terminal', selector: 'device',
    actions: [{ click: '查看商品', exact: true }],
  },
  {
    name: 'parent-growth', app: 'parent', selector: 'phone',
    actions: [],
  },
  {
    name: 'bigscreen', app: 'region-pc-screen', selector: null,
    actions: [],
  },
  {
    name: 'student-term-report', app: 'admin', selector: 'phone',
    actions: [
      'login',
      { click: '班级', exact: true },
      { clickAria: '查看小2025级1班学生列表' },
      { clickAria: '王梓涵', ariaPrefix: true },
      { click: '成长报告', exact: true },
      { click: '期末综合素质报告', exact: false },
      { click: '查看', exact: true },
    ],
  },
  {
    name: 'assistant-headteacher', app: 'admin', selector: 'phone',
    actions: [
      'login',
      { click: '我的', exact: true },
      { click: '班主任助理', exact: true },
    ],
    then: {
      name: 'assistant-principal',
      actions: [
        { backToTabs: true },
        { click: '校长助理', exact: true },
      ],
    },
  },
  {
    name: 'parent-report-detail', app: 'parent', selector: 'phone',
    actions: [
      { click: '报告', exact: true },
      { click: '月度报告', exact: false },
    ],
  },
  {
    name: 'term-report-advice', app: 'admin', selector: 'phone',
    actions: [
      'login',
      { click: '班级', exact: true },
      { clickAria: '查看小2025级1班学生列表' },
      { clickAria: '王梓涵', ariaPrefix: true },
      { click: '成长报告', exact: true },
      { click: '期末综合素质报告', exact: false },
      { click: '查看', exact: true },
      { wait: 2500 },
      { scrollText: '成长建议', offset: 96 },
    ],
    viewportCapture: true,
  },
  {
    name: 'term-report-activities', app: 'admin', selector: 'phone',
    actions: [
      'login',
      { click: '班级', exact: true },
      { clickAria: '查看小2025级1班学生列表' },
      { clickAria: '王梓涵', ariaPrefix: true },
      { click: '成长报告', exact: true },
      { click: '期末综合素质报告', exact: false },
      { click: '查看', exact: true },
      { wait: 2500 },
      { scrollText: '亲子活动指南', offset: 96 },
    ],
    viewportCapture: true,
  },
  {
    name: 'assistant-headteacher-report', app: 'admin', selector: 'phone',
    actions: [
      'login',
      { click: '我的', exact: true },
      { click: '班主任助理', exact: true },
      { click: '本周学生评价洞察与跟进建议', exact: false },
      { wait: 9000 },
    ],
  },
  {
    name: 'assistant-principal-report', app: 'admin', selector: 'phone',
    actions: [
      'login',
      { click: '我的', exact: true },
      { click: '校长助理', exact: true },
      { click: '本周管理建议', exact: false },
      { wait: 6000 },
    ],
  },
  {
    name: 'terminal-bank', app: 'terminal', selector: 'device',
    actions: [
      { click: '密码登录', exact: true },
      { fillInputs: ['20250101', '123456'] },
      { click: '登录', exact: true },
      { wait: 1500 },
      { click: '储蓄银行', exact: false },
      { wait: 1200 },
    ],
  },
  {
    name: 'terminal-confirm', app: 'terminal', selector: 'device',
    actions: [
      { click: '查看商品', exact: true },
      { click: '卡通橡皮擦三件套', exact: false },
      { fillInputs: ['20250101', '123456'] },
      { click: '登录', exact: true },
      { wait: 1400 },
      { click: '卡通橡皮擦三件套', exact: false },
      { wait: 900 },
    ],
  },
  {
    name: 'terminal-done', app: 'terminal', selector: 'device',
    actions: [
      { click: '查看商品', exact: true },
      { click: '卡通橡皮擦三件套', exact: false },
      { fillInputs: ['20250101', '123456'] },
      { click: '登录', exact: true },
      { wait: 1400 },
      { click: '卡通橡皮擦三件套', exact: false },
      { wait: 900 },
      { click: '确认兑换', exact: true },
      { wait: 1600 },
    ],
  },
  {
    name: 'terminal-home', app: 'terminal', selector: 'device',
    actions: [],
  },
  {
    name: 'terminal-exchange', app: 'terminal', selector: 'device',
    actions: [
      { click: '查看商品', exact: true },
      { click: '卡通橡皮擦三件套', exact: false },
      { wait: 900 },
    ],
  },
  {
    name: 'terminal-done', app: 'terminal', selector: 'device',
    actions: [
      { click: '查看商品', exact: true },
      { click: '卡通橡皮擦三件套', exact: false },
      { click: '确认兑换', exact: true },
      { wait: 1400 },
    ],
  },
  ...ARCHIVE_TARGETS,
];

const LOGIN_JS = `(async () => {
  const sleep = (ms) => new Promise(r => setTimeout(r, ms));
  const cb = document.querySelector('input[type=checkbox]');
  if (cb && !cb.checked) cb.click();
  await sleep(300);
  for (let i = 0; i < 20; i++) {
    const b = [...document.querySelectorAll('button')].find(x => (x.textContent || '').includes('最近登录'));
    if (b) { b.click(); return 'login-ok'; }
    await sleep(250);
  }
  return 'login-miss';
})()`;

const clickJs = (text, exact) => `(() => {
  const b = [...document.querySelectorAll('button,[role=button],a')].find(x => {
    const t = (x.textContent || '').trim();
    return !x.disabled && (${exact ? `t === '${text}'` : `t.includes('${text}')`});
  });
  if (b) { b.click(); return 'click-${text}'; }
  return 'miss-${text}';
})()`;

// 关闭「广告弹窗」（活动弹窗遮罩），否则会盖住整个页面
const DISMISS_JS = `(() => {
  const b = document.querySelector('[aria-label="关闭广告弹窗"]');
  if (b) { b.click(); return 'campaign-closed'; }
  return 'no-campaign';
})()`;

function findScript(kind) {
  if (kind === 'phone') {
    return `(() => {
      const els = [...document.querySelectorAll('div[style*="width: 393px"]')];
      const el = els.find(e => e.style.height === '852px' && e.className && e.className.includes('bg-white'));
      if (!el) return { ok: false };
      let p = el.parentElement;
      while (p) { if (p.style && p.style.transform) p.style.transform = 'none'; p = p.parentElement; }
      const r = el.getBoundingClientRect();
      return { ok: true, x: r.x, y: r.y, w: r.width, h: r.height };
    })()`;
  }
  if (kind === 'device') {
    return `(() => {
      const el = document.querySelector('[data-preview-anchor="terminal-device"]');
      if (!el) return { ok: false };
      let p = el.parentElement;
      while (p) { if (p.style && p.style.transform) p.style.transform = 'none'; p = p.parentElement; }
      const r = el.getBoundingClientRect();
      return { ok: true, x: r.x, y: r.y, w: r.width, h: r.height };
    })()`;
  }
  return null;
}

async function capture(target) {
  const port = 10100 + Math.floor(Math.random() * 800);
  const chrome = spawn(CHROME, [
    '--headless=new', `--remote-debugging-port=${port}`, '--no-sandbox', '--disable-gpu',
    '--hide-scrollbars', '--force-device-scale-factor=1', '--window-size=1400,1000', 'about:blank',
  ], { stdio: ['ignore', 'ignore', 'ignore'] });

  try {
    let wsUrl = null;
    for (let i = 0; i < 50; i++) {
      try { const l = await (await fetch(`http://127.0.0.1:${port}/json`)).json(); const p = l.find(t => t.type === 'page'); if (p) { wsUrl = p.webSocketDebuggerUrl; break; } } catch {}
      await sleep(200);
    }
    if (!wsUrl) throw new Error('no ws url');
    const ws = new WebSocket(wsUrl);
    let id = 0; const pend = new Map();
    ws.on('message', d => { const m = JSON.parse(d); if (m.id && pend.has(m.id)) { pend.get(m.id)(m); pend.delete(m.id); } });
    await new Promise((r, j) => { ws.on('open', r); ws.on('error', j); });
    const send = (method, params = {}) => new Promise(res => { const i = ++id; pend.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
    const ev = async (expr) => { const r = await send('Runtime.evaluate', { expression: expr, returnByValue: true, awaitPromise: true }); return r.result && r.result.result ? r.result.result.value : undefined; };

    await send('Page.enable'); await send('Runtime.enable');
    if (target.selector === 'phone' || target.selector === 'device') {
      await send('Emulation.setDefaultBackgroundColorOverride', { color: { r: 255, g: 255, b: 255, a: 1 } });
    }
    await send('Page.navigate', { url: `${BASE}?app=${target.app}` });
    await sleep(5000);

    const runActions = async (actions) => {
    for (const a of actions) {
      if (a === 'login') {
        console.log(`  [${target.name}] ${await ev(LOGIN_JS)}`);
        await sleep(3500);
      } else if (a.fillInputs) {
        const fillJs = `(() => {
  const scope = document.querySelector('[data-preview-anchor="terminal-device"]') || document;
  const inputs = [...scope.querySelectorAll('input')].filter(i => i.offsetWidth > 0 && i.type !== 'checkbox' && i.type !== 'radio');
  const values = ${JSON.stringify(a.fillInputs)};
  let filled = 0;
  inputs.forEach((el, index) => {
    if (values[index] === undefined) return;
    const proto = el.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
    const setter = Object.getOwnPropertyDescriptor(proto, 'value').set;
    setter.call(el, values[index]);
    el.dispatchEvent(new Event('input', { bubbles: true }));
    filled += 1;
  });
  return 'filled=' + filled + '/' + inputs.length;
})()`;
        console.log(`  [${target.name}] ${await ev(fillJs)}`);
        await sleep(500);
      } else if (a.scrollText) {
        const offset = a.offset || 60;
        const scrollJs = `(() => {
  const screen = [...document.querySelectorAll('div[style*="width: 393px"]')].find(e => e.style.height === '852px' && e.className && e.className.includes('bg-white'));
  if (!screen) return 'no-screen';
  const visible = [...screen.querySelectorAll('*')].filter(e => (e.textContent || '').trim() === '${a.scrollText}' && e.children.length === 0 && e.getClientRects().length > 0 && e.offsetWidth > 0);
  const hit = visible[0];
  if (!hit) return 'miss:${a.scrollText}';
  let moved = 0;
  for (let pass = 0; pass < 5; pass += 1) {
    const delta = Math.round(hit.getBoundingClientRect().top - screen.getBoundingClientRect().top - ${offset});
    if (Math.abs(delta) < 16) break;
    let node = hit;
    let acted = false;
    while (node && node !== document.body) {
      const canScroll = node.scrollHeight > node.clientHeight + 1;
      if (canScroll) {
        const before = node.scrollTop;
        const max = node.scrollHeight - node.clientHeight;
        node.scrollTop = Math.max(0, Math.min(max, before + delta));
        if (node.scrollTop !== before) { moved += 1; acted = true; break; }
      }
      node = node.parentElement;
    }
    if (!acted) break;
  }
  const finalTop = Math.round(hit.getBoundingClientRect().top - screen.getBoundingClientRect().top);
  return 'scroll-containers=' + moved + ' 目标距屏幕顶部=' + finalTop + 'px';
})()`;
        console.log(`  [${target.name}] ${await ev(scrollJs)}`);
        await sleep(1200);
      } else if (a.wait) {
        await sleep(a.wait);
        console.log(`  [${target.name}] 等待 ${a.wait}ms`);
      } else if (a.fillArchive) {
        console.log(`  [${target.name}] 填写档案 ${await ev(FILL_ARCHIVE_JS)}`);
        await sleep(600);
      } else if (a.backToTabs) {
        console.log(`  [${target.name}] ${await ev(BACK_TO_TABS_JS)}`);
        await sleep(1200);
      } else if (a.clickAria) {
        console.log(`  [${target.name}] ${await ev(clickAriaJs(a.clickAria, Boolean(a.ariaPrefix)))}`);
        await sleep(2200);
      } else {
        console.log(`  [${target.name}] ${await ev(clickJs(a.click, a.exact))}`);
        await sleep(2200);
      }
      // 每次跳转后关闭「广告弹窗」（campaignPreviewEveryEntry 会反复弹出）
      console.log(`  [${target.name}] ${await ev(DISMISS_JS)}`);
      await sleep(700);
    }
    };
    await runActions(target.actions);


    // 截图前再兜底关一次
    console.log(`  [${target.name}] ${await ev(DISMISS_JS)}`);
    await sleep(700);

    // 页面文字校验（打印出来，人工核对是否命中正确页面）
    const verifyJs = target.selector === 'phone'
      ? `(() => { const els=[...document.querySelectorAll('div[style*="width: 393px"]')]; const s=els.find(e=>e.style.height==='852px'&&e.className.includes('bg-white')); return s ? s.innerText.replace(/\\s+/g,' ').slice(0,180) : '(none)'; })()`
      : target.selector === 'device'
        ? `(() => { const el=document.querySelector('[data-preview-anchor="terminal-device"]'); return el ? el.innerText.replace(/\\s+/g,' ').slice(0,120) : '(none)'; })()`
        : `(() => document.body.innerText.replace(/\\s+/g,' ').slice(0,120))()`;
    const vt = await ev(verifyJs);
    console.log(`  [${target.name}] 页面: ${vt}`);

    const shoot = async (name) => {
      if (target.selector === 'phone' || target.selector === 'device') console.log(`  [${name}] 清理预览描边: ${await ev(CLEAN_SCREEN_JS)}`);
      let clip = null;
      const findJs = findScript(target.selector);
      if (findJs) {
        const r = await ev(findJs);
        if (!r || !r.ok) throw new Error(`element not found: ${name}`);
        clip = { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 };
      }
      const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: !target.viewportCapture, ...(clip ? { clip } : {}) });
      const buf = Buffer.from(shot.result.data, 'base64');
      const out = path.join(OUT_DIR, `${name}.png`);
      fs.writeFileSync(out, buf);
      console.log(`  OK ${name} -> ${out} (${buf.length} bytes)`);
    };

    await shoot(target.name);
    if (target.then) {
      await runActions(target.then.actions);
      const vt2 = await ev(verifyJs);
      console.log(`  [${target.name}] 页面: ${vt2}`);
      await shoot(target.then.name);
    }
    ws.close();
  } finally {
    chrome.kill('SIGKILL');
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const only = (process.env.CAPTURE_ONLY || '').split(',').filter(Boolean);
  for (const t of TARGETS.filter(item => !only.length || only.includes(item.name))) { try { await capture(t); } catch (e) { console.error(`FAIL ${t.name}: ${e.message}`); } }
}
main();
