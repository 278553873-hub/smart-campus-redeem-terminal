const fs=require('fs'),path=require('path');
const {pathToFileURL}=require('url');
const {chromium}=require('/Users/mayday/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const dir=__dirname, preview=path.join(dir,'预览');fs.mkdirSync(preview,{recursive:true});
 const browser=await chromium.launch({executablePath:'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',headless:true});
 const results=[];
 try{
 for(const name of ['谌芷晞','李林卿','吴浩']){
  const page=await browser.newPage({viewport:{width:1100,height:1400}}),errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  await page.goto(pathToFileURL(path.join(dir,`${name}_工具四_初始成像.html`)).href);
  await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});
  await page.emulateMedia({media:'print'});
  const pages=await page.evaluate(()=>[...document.querySelectorAll('.page')].map((p,i)=>{
   const content=[...p.children].filter(x=>x.tagName!=='FOOTER');
   const b=p.getBoundingClientRect(),f=p.querySelector('footer').getBoundingClientRect();
   const bottom=Math.max(...content.map(x=>x.getBoundingClientRect().bottom));
   return {page:i+1,bottom:Math.round(bottom-b.top),limit:Math.round(f.top-b.top),overflow:bottom>f.top-8||p.scrollHeight>p.clientHeight+2};
  }));
  if(pages.length!==5)errors.push('页数不为5');
  for(const p of pages)await page.locator(`#page-${p.page}`).screenshot({path:path.join(preview,`${name}-${p.page}.png`)});
  const issues=pages.filter(x=>x.overflow);
  if(!issues.length&&!errors.length)await page.pdf({path:path.join(dir,`${name}_工具四_初始成像.pdf`),format:'A4',preferCSSPageSize:true,printBackground:true,displayHeaderFooter:false});
  await page.emulateMedia({media:'screen'});await page.setViewportSize({width:390,height:844});
  const mobile=await page.evaluate(()=>({width:innerWidth,content:document.documentElement.scrollWidth}));
  if(mobile.content>mobile.width)errors.push('手机横向滚动');
  const result={name,pages,issues,errors,mobile};results.push(result);
  console.log(JSON.stringify({name,issues,errors,mobile}));
  await page.close();
 }
 fs.writeFileSync(path.join(dir,'排版检查.json'),JSON.stringify(results,null,2));
 if(results.some(r=>r.errors.length||r.issues.length))process.exitCode=1;
 }finally{await browser.close()}
})();
