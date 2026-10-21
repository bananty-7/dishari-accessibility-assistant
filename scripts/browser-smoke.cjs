/* Optional end-to-end checks. Run with Playwright installed; see docs/TESTING.md. */
const fs=require('node:fs');const path=require('node:path');const assert=require('node:assert/strict');
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=path.resolve(__dirname,'..');
(async()=>{
 const options={headless:true};
 if(process.env.CHROMIUM_PATH){options.executablePath=process.env.CHROMIUM_PATH;options.args=['--no-sandbox','--disable-dev-shm-usage'];}
 const browser=await chromium.launch(options);
 try{
 const context=await browser.newContext({viewport:{width:1400,height:1000}});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(process.env.APP_URL||'http://localhost:4173');await page.evaluate(()=>document.fonts.ready);
 await page.waitForFunction(()=>navigator.serviceWorker.controller!==null,{},{timeout:60000});
 const makeImage=async(name,lines,bangla=false)=>{
  const data=await page.evaluate(async({lines,bangla})=>{
   await document.fonts.load(`400 48px ${bangla?'DishariBangla':'Inter'}`);
   const canvas=document.createElement('canvas');canvas.width=1300;canvas.height=220+lines.length*90;
   const ctx=canvas.getContext('2d');ctx.fillStyle='white';ctx.fillRect(0,0,canvas.width,canvas.height);
   ctx.fillStyle='black';ctx.font=`48px ${bangla?'DishariBangla':'Inter'}`;
   lines.forEach((text,i)=>ctx.fillText(text,60,100+i*90));return canvas.toDataURL('image/png').split(',')[1];
  },{lines,bangla});fs.writeFileSync(path.join(root,'samples',name),Buffer.from(data,'base64'));
 };
 await makeImage('english-note.png',['Dishari reads printed text.','This is a synthetic test document.']);
 await makeImage('bangla-note.png',['আজ একটি সুন্দর দিন।','দিশারী বাংলা লেখা পড়ে।'],true);
 await makeImage('medicine-label.png',['SYNTHETIC LABEL - NOT REAL MEDICINE','Example tablet 500 mg','BATCH SAMPLE-A  EXP 2028-12']);
 await page.evaluate(()=>{const s=JSON.parse(localStorage.getItem('dishari-settings')||'{}');s.autoSpeak=false;localStorage.setItem('dishari-settings',JSON.stringify(s));});
 await page.reload();await page.waitForFunction(()=>navigator.serviceWorker.controller!==null);
 await page.locator('input[type=file]').setInputFiles(path.join(root,'samples','english-note.png'));
 await page.locator('.result-text').waitFor({timeout:120000});assert.match(await page.locator('.result-text').innerText(),/Dishari reads printed text/i);
 console.log('PASS: real local English OCR');
 await page.locator('input[type=file]').setInputFiles(path.join(root,'samples','bangla-note.png'));
 await page.waitForFunction(()=>/[অ-হ]/.test(document.querySelector('.result-text')?.textContent||''),{},{timeout:120000});const bengali=await page.locator('.result-text').innerText();assert.match(bengali,/[অ-হ]/);console.log('PASS: real local Bengali OCR; output:',JSON.stringify(bengali));
 const pdf=path.join(root,'samples','document.pdf');
 if(fs.existsSync(pdf)){
  await page.getByRole('button',{name:/Read a document/}).click();await page.locator('input[type=file]').setInputFiles(pdf);
  await page.waitForFunction(()=>/Dishari sample document/i.test(document.querySelector('.result-text')?.textContent||''),{},{timeout:60000});assert.match(await page.locator('.result-text').innerText(),/Dishari sample document/i);console.log('PASS: PDF extraction');
 }
 await page.getByRole('button',{name:'Settings',exact:true}).click();assert.equal(await page.getByRole('dialog').count(),1);
 await page.keyboard.press('Escape');assert.equal(await page.getByRole('dialog').count(),0);console.log('PASS: settings dialog keyboard dismissal');
 await page.getByRole('button',{name:/জরুরি যোগাযোগ/}).click();assert.equal(await page.getByRole('dialog').count(),1);assert.equal(await page.locator('a[href^="tel:"]').count(),0);await page.keyboard.press('Escape');console.log('PASS: no automatic emergency call');
 await page.screenshot({path:path.join(root,'docs','desktop.png'),fullPage:true});
 await page.setViewportSize({width:390,height:844});await page.evaluate(()=>document.fonts.ready);
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.screenshot({path:path.join(root,'docs','mobile.png'),fullPage:true});console.log('PASS: mobile layout has no horizontal overflow');
 await context.setOffline(true);await page.reload();await page.evaluate(async()=>{for(const db of await indexedDB.databases()){await new Promise((resolve,reject)=>{const request=indexedDB.deleteDatabase(db.name);request.onsuccess=resolve;request.onerror=reject;request.onblocked=()=>reject(new Error('OCR database still open'));});}});await page.getByRole('button',{name:/Read Bangla/}).click();
 await page.locator('input[type=file]').setInputFiles(path.join(root,'samples','english-note.png'));
 await page.locator('.result-text').waitFor({timeout:120000});assert.match(await page.locator('.result-text').innerText(),/Dishari reads printed text/i);console.log('PASS: offline reload and real OCR');
 assert.deepEqual(errors,[]);console.log('PASS: no uncaught browser errors');await context.close();
 }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1;});
