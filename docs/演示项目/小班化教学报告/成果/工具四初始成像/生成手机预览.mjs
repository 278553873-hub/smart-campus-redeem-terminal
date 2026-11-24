import { build } from 'esbuild';
import postcss from 'postcss';
import tailwindcss from 'tailwindcss';
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scriptJSON } from './初成像编辑模型.mjs';

const directory = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(directory, '../../../../..');
const [payloadFile, mobileFile, previewFile] = process.argv.slice(2);
if (!payloadFile || !mobileFile || !previewFile) throw new Error('需要内容文件、手机阅读版路径和手机壳预览路径。');
const report = JSON.parse(await readFile(payloadFile, 'utf8'));
const escapeHTML = (text) => String(text).replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const js = async (filename) => {
  const result = await build({
    absWorkingDir: root, entryPoints: [path.join(directory, filename)], bundle: true, write: false,
    platform: 'browser', format: 'iife', target: ['es2022'], minify: true, jsx: 'automatic',
    outdir: path.join(directory, '.inline-bundle'), metafile: true,
    loader: { '.png': 'dataurl', '.jpg': 'dataurl', '.webp': 'dataurl', '.svg': 'dataurl' },
    define: { 'process.env.NODE_ENV': '"production"' }, legalComments: 'none', logLevel: 'silent',
  });
  return {
    code: result.outputFiles.find((file) => file.path.endsWith('.js')).text.replace(/<\/script/gi, '<\\/script'),
    styles: result.outputFiles.filter((file) => file.path.endsWith('.css')).map((file) => file.text).join('\n'),
    inputs: Object.keys(result.metafile.inputs),
  };
};
const page = (title, css, dataId, data, bundle) => `<!doctype html>
<html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><title>${escapeHTML(title)}</title><style>${css}</style></head>
<body><div id="root"></div><script id="${dataId}" type="application/json">${scriptJSON(data)}</script><script>${bundle}</script></body></html>`;
const mobileCSS = await readFile(path.join(directory, '初成像手机稿.css'), 'utf8');
const mobileJS = await js('初成像手机稿.tsx');
const reportFiles = mobileJS.inputs.filter((filename) => filename.endsWith('.tsx') || filename.endsWith('/mobileSheetActionStyles.ts')).map((filename) => path.resolve(root, filename));
const reportContent = await Promise.all(reportFiles.map(async (filename) => ({ raw: await readFile(filename, 'utf8'), extension: 'tsx' })));
const reportUtilities = await postcss([tailwindcss({ content: reportContent, theme: { extend: {} }, plugins: [] })]).process('@tailwind base; @tailwind components; @tailwind utilities;', { from: undefined });
const mobile = page(`${report.meta.name}｜${report.meta.title}`, reportUtilities.css + '\n' + mobileJS.styles + '\n' + mobileCSS, 'report-data', report, mobileJS.code);
await writeFile(mobileFile, mobile);

// 只编译手机壳依赖的通用样式，不读取或打包主应用的业务代码与配置。
const chromeFiles = ['PhoneMockup.tsx', 'SimulatedMiniProgramChrome.tsx', 'SimulatedIosStatusBar.tsx'];
const content = await Promise.all(chromeFiles.map(async (filename) => ({ raw: await readFile(path.join(root, 'components', filename), 'utf8'), extension: 'tsx' })));
const tailwind = await postcss([tailwindcss({ content, corePlugins: { preflight: true }, theme: { extend: {} }, plugins: [] })]).process('@tailwind base; @tailwind components; @tailwind utilities;', { from: undefined });
const previewCSS = `${tailwind.css}
html,body,#root{margin:0;width:100%;height:100%;overflow:hidden;background:#edf0f4;font-family:-apple-system,BlinkMacSystemFont,"PingFang SC","Microsoft YaHei",sans-serif}
.preview-shell{height:100%;height:100dvh;display:flex;flex-direction:column}
.preview-header{display:flex;align-items:center;justify-content:space-between;gap:16px;flex:none;min-height:56px;padding:12px 24px;color:#263e55}
.preview-header h1{font-size:14px;font-weight:600;margin:0}.preview-header a{font-size:13px;color:#2563a6;text-decoration:none;min-height:44px;display:flex;align-items:center}.preview-header a:focus-visible{outline:2px solid #2563a6;outline-offset:4px}
.preview-device{flex:1;min-height:0;width:100%;padding-bottom:8px}
.preview-page-title{display:grid;place-items:center;flex:none;min-height:var(--tm-size-touch);background:var(--tm-page-plain-header-bg);color:var(--tm-text-primary);font-size:var(--tm-font-size-section-title);font-weight:var(--tm-font-weight-bold)}
.report-frame{display:block;flex:1;min-height:0;width:100%;border:0;background:var(--tm-page-plain-content-bg)}
@media(max-width:480px){.preview-header{padding:8px 20px;min-height:48px}.preview-device{padding-bottom:0}}
`;
const previewJS = await js('初成像手机预览.tsx');
await writeFile(previewFile, page(`${report.meta.name}｜教师手机端预览`, previewCSS + previewJS.styles, 'preview-content', { html: mobile, href: path.basename(mobileFile) }, previewJS.code));
console.log(`已生成：${mobileFile}\n已生成：${previewFile}`);
