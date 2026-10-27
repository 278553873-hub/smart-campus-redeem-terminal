// 用户已授权的本地报告排版检查与 PDF 导出，不访问线上产品。
const path = require('path');
const fs = require('fs');
const { pathToFileURL } = require('url');
const { chromium } = require('/Users/mayday/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const out = path.resolve(__dirname, '..');
  const browser = await chromium.launch({ executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 1400 }, deviceScaleFactor: 1 });
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    await page.goto(pathToFileURL(path.join(out, '小班化教学阶段报告.html')).href);
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: 'print' });
    const sizes = await page.evaluate(() => Array.from(document.querySelectorAll('.page')).map((p, i) => {
      const body = p.querySelector('.body');
      const source = p.querySelector('.source');
      const footer = p.querySelector('footer');
      const last = body.lastElementChild;
      return { page: i + 1, bodyHeight: Math.round(body.clientHeight), contentHeight: Math.round(body.scrollHeight), contentBottom: Math.round(last.getBoundingClientRect().bottom - p.getBoundingClientRect().top), sourceTop: Math.round((p.classList.contains('cover') ? footer : source).getBoundingClientRect().top - p.getBoundingClientRect().top), footerTop: Math.round(footer.getBoundingClientRect().top - p.getBoundingClientRect().top), overflow: body.scrollHeight > body.clientHeight + 2 };
    }));
    const issues = sizes.filter(x => x.overflow || x.contentBottom > x.sourceTop + 1);
    fs.writeFileSync(path.join(__dirname, '排版检查.json'), JSON.stringify({ pages: sizes, errors }, null, 2));
    console.log(JSON.stringify({ pageCount: sizes.length, issues, errors }, null, 2));
    if (issues.length || errors.length) { process.exitCode = 1; return; }
    await page.pdf({ path: path.join(out, '小班化教学阶段报告.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true, displayHeaderFooter: false });
    fs.mkdirSync(path.join(__dirname, '预览'), { recursive: true });
    for (const n of [1, 2, 4, 6, 8, 10, 14, 16, 18]) {
      await page.locator('#page-' + n).screenshot({ path: path.join(__dirname, '预览', '第' + n + '页.png') });
    }
    await page.emulateMedia({ media: 'screen' });
    await page.setViewportSize({ width: 390, height: 844 });
    const responsive = await page.evaluate(() => ({ viewport: innerWidth, contentWidth: document.documentElement.scrollWidth, pages: document.querySelectorAll('.page').length }));
    console.log(JSON.stringify({ pdf: '已导出', responsive }, null, 2));
  } finally { await browser.close(); }
})();
