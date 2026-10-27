const fs = require('fs');
const path = require('path');
const { pathToFileURL } = require('url');
const { chromium } = require('/Users/mayday/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async () => {
  const out = path.resolve(__dirname,'..');
  const browser = await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
  const summary=[];
  try {
    for (const name of ['周智皓','任芊语']) {
      const page=await browser.newPage({viewport:{width:1100,height:1400}});
      const errors=[];
      page.on('pageerror', e=>errors.push(e.message));
      await page.goto(pathToFileURL(path.join(out,name+'个人成长报告.html')).href);
      await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));});
      await page.emulateMedia({media:'print'});
      const pages=await page.evaluate(()=>[...document.querySelectorAll('.page')].map((p,i)=>{
        const b=p.querySelector('.body'); const f=p.querySelector('footer');
        const base=p.getBoundingClientRect().top;
        const end=b.lastElementChild.getBoundingClientRect().bottom-base;
        const limit=f.getBoundingClientRect().top-base;
        return {page:i+1,height:b.clientHeight,content:b.scrollHeight,end:Math.round(end),limit:Math.round(limit),overflow:b.scrollHeight>b.clientHeight+2||end>limit+1};
      }));
      const issues=pages.filter(p=>p.overflow);
      if(pages.length!==13) errors.push('页数与预期不符');
      const previews=path.join(__dirname,'预览'); fs.mkdirSync(previews,{recursive:true});
      for(const n of [1,3,4,6,7,8,9,11]) await page.locator('#page-'+n).screenshot({path:path.join(previews,name+'-'+n+'.png')});
      const result={name,pages,issues,errors};
      summary.push(result);
      console.log(JSON.stringify({name,issues,errors}));
      if(!issues.length&&!errors.length){
        await page.pdf({path:path.join(out,name+'个人成长报告.pdf'),format:'A4',preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
        for(const n of [1,2,3,4,5,6,7,8,9,10,11,12,13]) await page.locator('#page-'+n).screenshot({path:path.join(previews,name+'-'+n+'.png')});
        await page.emulateMedia({media:'screen'}); await page.setViewportSize({width:390,height:844});
        result.mobile=await page.evaluate(()=>({width:innerWidth,content:document.documentElement.scrollWidth}));
        if(result.mobile.content>result.mobile.width) errors.push('手机出现横向滚动');
        await page.evaluate(()=>{window.__printCalled=false;window.print=()=>{window.__printCalled=true}});
        await page.getByRole('button',{name:'导出 PDF / 打印'}).click();
        result.printButton=await page.evaluate(()=>window.__printCalled);
        if(!result.printButton) errors.push('打印按钮未触发');
        await page.screenshot({path:path.join(previews,name+'-手机.png'),fullPage:false});
        console.log(JSON.stringify({name,pdf:'已导出',mobile:result.mobile,printButton:result.printButton}));
      }
      await page.close();
    }
    fs.writeFileSync(path.join(__dirname,'排版检查.json'),JSON.stringify(summary,null,2));
    if(summary.some(s=>s.issues.length||s.errors.length)) process.exitCode=1;
  } finally {await browser.close();}
})();
