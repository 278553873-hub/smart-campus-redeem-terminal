// 宣传手册截图脚本 v2：从用户运行中的 dev 服务器(3000)抓取各端「对应页面」并裁剪到设备屏
import { spawn } from 'child_process';
import WebSocket from 'ws';
import fs from 'fs';
import path from 'path';

const CHROME = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE = 'http://127.0.0.1:3000/';
const OUT_DIR = '/Users/mayday/project/校园智能积分兑换终端/deliverables/brochure-assets';
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

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
    return ${exact ? `t === '${text}'` : `t.includes('${text}')`};
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
    await send('Page.navigate', { url: `${BASE}?app=${target.app}` });
    await sleep(5000);

    for (const a of target.actions) {
      if (a === 'login') { console.log(`  [${target.name}] ${await ev(LOGIN_JS)}`); await sleep(3500); }
      else { console.log(`  [${target.name}] ${await ev(clickJs(a.click, a.exact))}`); await sleep(2500); }
      // 每次跳转后关闭「广告弹窗」（campaignPreviewEveryEntry 会反复弹出）
      console.log(`  [${target.name}] ${await ev(DISMISS_JS)}`);
      await sleep(900);
    }
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

    let clip = null;
    const findJs = findScript(target.selector);
    if (findJs) {
      const r = await ev(findJs);
      if (!r || !r.ok) throw new Error(`element not found: ${target.name}`);
      clip = { x: r.x, y: r.y, width: r.w, height: r.h, scale: 1 };
    }
    const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: true, ...(clip ? { clip } : {}) });
    const buf = Buffer.from(shot.result.data, 'base64');
    const out = path.join(OUT_DIR, `${target.name}.png`);
    fs.writeFileSync(out, buf);
    console.log(`  OK ${target.name} -> ${out} (${buf.length} bytes)`);
    ws.close();
  } finally {
    chrome.kill('SIGKILL');
  }
}

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const t of TARGETS) { try { await capture(t); } catch (e) { console.error(`FAIL ${t.name}: ${e.message}`); } }
}
main();
