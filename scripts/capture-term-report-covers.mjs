// 使用真实封面组件生成八张手机宽度截图，并打包为无需外部资源的汇报 HTML。
import fs from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { build } from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import WebSocket from 'ws';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'deliverables/term-report-cover-review-2026-10-16');
const work = await fs.mkdtemp(path.join(os.tmpdir(), 'term-cover-capture-'));
const examples = [
  { id: 'lower-boy', stage: '小学低段', range: '一、二年级', gender: 'male', name: '陈子涵', grade: '一年级', class: '2026级1班', tags: ['好奇善问', '认真专注', '乐于分享'], theme: '放飞纸飞机' },
  { id: 'lower-girl', stage: '小学低段', range: '一、二年级', gender: 'female', name: '林沐晴', grade: '一年级', class: '2026级1班', tags: ['观察细致', '友善待人', '勇敢表达'], theme: '抱书探蝶' },
  { id: 'middle-boy', stage: '小学中段', range: '三、四年级', gender: 'male', name: '周予安', grade: '三年级', class: '2024级1班', tags: ['勤于动手', '善于思考', '坚持不懈'], theme: '制作帆船' },
  { id: 'middle-girl', stage: '小学中段', range: '三、四年级', gender: 'female', name: '许知夏', grade: '三年级', class: '2024级1班', tags: ['细心观察', '创意表达', '自主学习'], theme: '观察绘画' },
  { id: 'upper-boy', stage: '小学高段', range: '五、六年级', gender: 'male', name: '沈亦辰', grade: '五年级', class: '2022级1班', tags: ['主动探究', '合作担当', '严谨求实'], theme: '动手搭建' },
  { id: 'upper-girl', stage: '小学高段', range: '五、六年级', gender: 'female', name: '苏念初', grade: '五年级', class: '2022级1班', tags: ['乐学善思', '表达清晰', '自律笃行'], theme: '阅读想象' },
  { id: 'junior-boy', stage: '初中', range: '七至九年级', gender: 'male', name: '陆景行', grade: '七年级', class: '初2026级1班', tags: ['独立思辨', '实践创新', '责任担当'], theme: '设计创造' },
  { id: 'junior-girl', stage: '初中', range: '七至九年级', gender: 'female', name: '顾星遥', grade: '七年级', class: '初2026级1班', tags: ['求知探索', '缜密思考', '自主规划'], theme: '天文探索' },
];
await fs.mkdir(out, { recursive: true });
const entry = `import React from 'react';
import { createRoot } from 'react-dom/client';
import Cover from './mobile-app/components/term-report/TermReportCover';
import { teacherBrandCssVariables } from './mobile-app/styles/teacherMobileTokens';
const examples = ${JSON.stringify(examples)};
createRoot(document.getElementById('root')).render(<main style={teacherBrandCssVariables} className="font-sans">{examples.map(item => <div id={item.id} key={item.id} style={{width:393,marginBottom:24}}><Cover student={item} mode="mobile" tags={item.tags} onEditTags={() => {}} /></div>)}</main>);`;
await build({ stdin: { contents: entry, resolveDir: root, loader: 'tsx' }, bundle: true, minify: true,
  outfile: path.join(work, 'cover.js'), format: 'iife', jsx: 'automatic',
  define: { 'process.env.NODE_ENV': '"production"' },
  loader: { '.png': 'file', '.jpg': 'file', '.jpeg': 'file', '.webp': 'file', '.svg': 'file' },
});
const css = await postcss([tailwindcss(path.join(root, 'tailwind.config.js'))]).process('@tailwind base; @tailwind utilities;', { from: undefined });
await fs.writeFile(path.join(work, 'base.css'), css.css);
await fs.writeFile(path.join(work, 'index.html'), '<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><link rel="stylesheet" href="base.css"><link rel="stylesheet" href="cover.css"><style>body{margin:0;background:#fff}</style></head><body><div id="root"></div><script src="cover.js"></script></body></html>');

const chrome = spawn('/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', ['--headless=new', '--remote-debugging-port=0', `--user-data-dir=${path.join(work, 'chrome-profile')}`, '--disable-gpu', '--hide-scrollbars', '--no-first-run', 'about:blank'], { stdio: 'ignore' });
let ws;
try {
  let port;
  for (let attempt = 0; attempt < 80; attempt++) {
    try { port = Number((await fs.readFile(path.join(work, 'chrome-profile/DevToolsActivePort'), 'utf8')).split('\n')[0]); break; } catch { await new Promise(resolve => setTimeout(resolve, 100)); }
  }
  if (!port) throw new Error('截图浏览器启动失败');
  const tabs = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
  ws = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { ws.once('open', resolve); ws.once('error', reject); });
  let nextId = 0;
  const pending = new Map();
  ws.on('message', raw => { const message = JSON.parse(raw); if (pending.has(message.id)) { const { resolve, reject } = pending.get(message.id); pending.delete(message.id); message.error ? reject(new Error(message.error.message)) : resolve(message.result); } });
  const send = (method, params = {}) => new Promise((resolve, reject) => { const id = ++nextId; pending.set(id, { resolve, reject }); ws.send(JSON.stringify({ id, method, params })); });
  const evaluate = async expression => { const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true }); if (response.exceptionDetails) throw new Error(JSON.stringify(response.exceptionDetails)); return response.result.value; };
  await send('Page.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 393, height: 852, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url: pathToFileURL(path.join(work, 'index.html')).href });
  let ready = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    ready = await evaluate('document.querySelectorAll(".term-report-cover").length === 8 && [...document.images].every(image => image.complete && image.naturalWidth > 0)');
    if (ready) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!ready) throw new Error('封面或图片未加载完整');
  await evaluate('document.fonts.ready.then(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))))');
  const shots = [];
  for (const item of examples) {
    const info = await evaluate(`(() => { const el = document.getElementById(${JSON.stringify(item.id)}).firstElementChild; const r = el.getBoundingClientRect(); return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1}; })()`);
    if (info.width !== 393 || info.height < 400) throw new Error('截图尺寸异常');
    const shot = await send('Page.captureScreenshot', { format: 'png', fromSurface: true, captureBeyondViewport: true, clip: info });
    await fs.writeFile(path.join(out, `${item.id}.png`), Buffer.from(shot.data, 'base64'));
    shots.push({ ...item, image: `data:image/png;base64,${shot.data}`, width: info.width, height: info.height });
    console.log(`已截图：${item.stage} ${item.gender === 'male' ? '男生' : '女生'} (${info.width} × ${info.height})`);
  }
  const groups = [0, 2, 4, 6].map((start, groupIndex) => `<section id="stage-${groupIndex}"><div class="section-title"><div><span class="index">0${groupIndex + 1}</span><h2>${shots[start].stage}</h2><span class="range">${shots[start].range}</span></div></div><div class="pair">${shots.slice(start, start + 2).map(item => `<figure><figcaption><strong>${item.gender === 'male' ? '男生封面' : '女生封面'}</strong><span>${item.theme}</span></figcaption><button class="shot" type="button" aria-label="放大查看${item.stage}${item.gender === 'male' ? '男生' : '女生'}封面"><img src="${item.image}" alt="${item.stage}${item.gender === 'male' ? '男生' : '女生'}封面：${item.name}" width="${item.width * 2}" height="${item.height * 2}"></button></figure>`).join('')}</div></section>`).join('');
  const html = `<!doctype html><html lang="zh-CN"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>学生学期成长手册 · 封面方案</title><style>
*{box-sizing:border-box}html{scroll-behavior:smooth}body{margin:0;background:#f5f7fa;color:#19334e;font-family:system-ui,"PingFang SC",sans-serif}main{max-width:1000px;margin:auto;padding:48px 32px 56px}header{border-bottom:1px solid #dce3eb;padding-bottom:28px;margin-bottom:24px}.eyebrow{font-size:13px;letter-spacing:.12em;color:#6d7e90;margin:0 0 12px}h1{font-size:32px;line-height:1.35;margin:0 0 12px;letter-spacing:-.025em}.intro{font-size:14px;color:#62748a;line-height:1.7;margin:0}nav{display:flex;flex-wrap:wrap;gap:8px;margin-top:22px}nav a{color:#365574;text-decoration:none;background:#fff;padding:9px 16px;border:1px solid #dce5ee;border-radius:8px;font-size:13px}section{margin:0 0 38px;scroll-margin-top:24px}.section-title{padding:16px 0}.section-title>div{display:flex;align-items:baseline;gap:12px}.index{color:#90a0af;font-size:13px}h2{font-size:20px;margin:0}.range{font-size:13px;color:#718195}.pair{display:grid;grid-template-columns:1fr 1fr;gap:28px}figure{margin:0;min-width:0}figcaption{display:flex;align-items:baseline;justify-content:space-between;padding:0 2px 12px;font-size:14px}figcaption span{font-size:12px;color:#6f8094}.shot{display:block;width:100%;padding:0;border:1px solid #dde5ed;border-radius:12px;overflow:hidden;background:white;cursor:zoom-in;box-shadow:0 10px 30px -22px #254567}.shot img{display:block;width:100%;height:auto}.shot:focus-visible,a:focus-visible{outline:3px solid #507aa1;outline-offset:4px}footer{padding-top:20px;border-top:1px solid #dde5ed;color:#758496;font-size:12px;line-height:1.8}dialog{border:0;padding:0;background:transparent;max-width:min(94vw,786px);max-height:94vh;overflow:auto}dialog::backdrop{background:rgba(13,25,38,.72)}dialog img{width:100%;display:block}dialog button{position:sticky;top:10px;float:right;margin:10px;border:1px solid #ced9e4;border-radius:8px;padding:10px 16px;background:white;color:#19334e;cursor:pointer}body:has(dialog[open]){overflow:hidden}@media(max-width:640px){main{padding:28px 16px}h1{font-size:26px}.pair{gap:14px}figcaption{display:block}figcaption span{display:block;margin-top:4px}.shot{border-radius:8px}nav a{padding:8px 12px}}@media(max-width:420px){.pair{grid-template-columns:1fr;gap:24px}}@media print{@page{size:A4 portrait;margin:12mm}body{background:white}main{padding:0;max-width:none}header{margin-bottom:12px;padding-bottom:12px}h1{font-size:24px}nav,dialog{display:none!important}section{break-inside:avoid;break-after:page;margin-bottom:0}.pair{gap:8mm}.shot{box-shadow:none;border-radius:0}footer{border:0}section:last-of-type{break-after:auto}a{color:inherit}}
</style></head><body><main><header><p class="eyebrow">教师手机端 · 封面设计展示</p><h1>学生学期成长手册</h1><p class="intro">四个学段，男女八款封面。以下为当前界面截图，学生姓名与素养标签均为示例。<br>点击封面可放大查看；本文件支持离线打开。</p><nav aria-label="学段导航">${['小学低段','小学中段','小学高段','初中'].map((name,i)=>`<a href="#stage-${i}">${name}</a>`).join('')}</nav></header>${groups}<footer>2026年10月16日 · 封面方案汇报<br>同一封面结构，按学段与性别切换插画和背景，素养标签支持针对学生编辑。</footer></main><dialog id="viewer" aria-label="封面大图"><button type="button">关闭</button><img alt=""></dialog><script>const viewer=document.getElementById('viewer');document.querySelectorAll('.shot').forEach(button=>button.addEventListener('click',()=>{const source=button.querySelector('img'),target=viewer.querySelector('img');target.src=source.src;target.alt=source.alt;viewer.showModal()}));viewer.querySelector('button').addEventListener('click',()=>viewer.close());viewer.addEventListener('click',event=>{if(event.target===viewer)viewer.close()});</script></body></html>`;
  await fs.writeFile(path.join(out, '学生成长手册-封面方案汇报.html'), html);
  await fs.writeFile(path.join(out, 'screenshots.json'), JSON.stringify(shots.map(({ image, ...item }) => item), null, 2));
  await send('Emulation.setDeviceMetricsOverride', { width: 1200, height: 1080, deviceScaleFactor: 1, mobile: false });
  await send('Page.navigate', { url: pathToFileURL(path.join(out, '学生成长手册-封面方案汇报.html')).href });
  let reportReady = false;
  for (let attempt = 0; attempt < 80; attempt++) {
    reportReady = await evaluate('document.querySelectorAll(".shot img").length === 8 && [...document.querySelectorAll(".shot img")].every(image => image.complete && image.naturalWidth > 0)');
    if (reportReady) break;
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (!reportReady) throw new Error('汇报文件中的图片未完整加载');
  await evaluate('document.fonts.ready');
  await evaluate('document.querySelector(".shot").click()');
  if (!await evaluate('document.querySelector("dialog").open')) throw new Error('大图查看功能异常');
  await evaluate('document.querySelector("dialog button").click()');
  const preview = await send('Page.captureScreenshot', { format: 'png' });
  await fs.writeFile(path.join(out, 'report-preview.png'), Buffer.from(preview.data, 'base64'));
  console.log('完成：' + path.join(out, '学生成长手册-封面方案汇报.html'));
} finally {
  ws?.close();
  chrome.kill('SIGTERM');
  await new Promise(resolve => setTimeout(resolve, 250));
  await fs.rm(work, { recursive: true, force: true });
}
