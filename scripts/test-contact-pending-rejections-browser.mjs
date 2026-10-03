/** Regression: a rejected retry cannot disprove prior successful storage; Chromium/WebKit local fixtures only. */
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import {readFileSync,existsSync} from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
const origin=process.env.SEO_TEST_ORIGIN||'http://127.0.0.1:5186';
const target=new URL(origin);
assert.ok(target.protocol==='http:'&&['127.0.0.1','localhost','[::1]'].includes(target.hostname),'Only a local fixture server');
assert.equal(target.origin,origin,'Use an origin without a pathname');
assert.equal(Boolean(process.env.VERCEL),false,'Never run on a deployment');
for(const key of ['POSTGRES_URL','POSTGRES_URL_NON_POOLING','DATABASE_URL','RESEND_API_KEY','PAGESPEED_API_KEY'])assert.equal(Boolean(process.env[key]),false,`Credential-free fixture runner required: ${key}`);
createRequire(import.meta.url)('./fixture-network.cjs');
const out=path.resolve(process.env.BROWSER_REPORT_ROOT||'reports/improvement/browser-ci','contact-pending-rejections');
const reportPath=path.join(out,'report.json');
assert.equal(existsSync(reportPath),false,'Preserve earlier results; use a fresh BROWSER_REPORT_ROOT');
const version={commit:process.env.GITHUB_SHA||null,buildId:readFileSync('.next/BUILD_ID','utf8').trim()};
const {browserType,launchOptions,browserLabel}=await import('./browser-runtime.mjs');
const {createContactChainFixture}=await import('./contact-chain-fixture.mjs');
const {contactPayload}=await import('../tests/fixtures/speed-rich.mjs');
const pendingKey='sitesnit-contact-pending:/contact:contact';
const report={startedAt:new Date().toISOString(),commit:version.commit,buildId:version.buildId,browser:browserLabel,origin,expectedChecks:10,checks:[],limits:['Local browser and real handler with memory-only database and captured provider; no real mail/scan/production storage.','The retry-400 response alone is a synthetic edge/version rejection; 429/403/413 use real handler rejection.','The in-memory network rate counter is cleared before the final retry to model waiting for the next limit window without delaying the test.']};
await fs.mkdir(out,{recursive:true});
const browser=await browserType.launch(launchOptions);
const snapshotDB=async f=>({
  inquiries:(await f.connection.db.prepare('SELECT * FROM inquiries ORDER BY id').all()).results,
  requests:(await f.connection.db.prepare('SELECT * FROM contact_requests ORDER BY inquiry_id').all()).results,
  outbox:(await f.connection.db.prepare('SELECT * FROM contact_outbox ORDER BY id').all()).results,
  mail:f.mail,
});
try{
  for(const width of [390,1440])for(const scenario of ['unknown-429','unknown-403','unknown-400','unknown-413','fresh-429']){
    const fresh=scenario==='fresh-429',rejection=Number(scenario.split('-')[1]);
    const input=contactPayload('SYNTHETISCHE vastgezette samenvatting vóór de mislukte verbinding.',{sourcePage:'/contact',formId:'contact',name:'SYNTHETISCHE pending proef',email:'pending-proef@example.invalid',message:'Mijn eigen oorspronkelijke vraag moet bij alle veilige herpogingen volledig behouden blijven.'});
    const raw=JSON.stringify(input),f=await createContactChainFixture(origin),calls=[],responses=[],errors=[],external=[];
    const context=await browser.newContext({viewport:{width,height:844},reducedMotion:'reduce'});
    const result={scenario,width,rejection,status:'running',calls,responses};
    await context.route('**/*',async route=>{
      const u=new URL(route.request().url());
      if(u.origin!==origin){if(u.hostname==='www.googletagmanager.com')return route.fulfill({contentType:'text/javascript',body:'/* inert fixture */'});external.push(u.origin);return route.abort();}
      if(u.pathname==='/api/contact'){
        const body=route.request().postData();calls.push(body);
        let response;
        if(!fresh&&calls.length===2&&rejection===400)response=Response.json({error:'SYNTHETISCHE huidige poging afgewezen; eerdere opslag onbekend.'},{status:400});
        else response=await f.post(body,!fresh&&calls.length===2&&rejection===403?{origin:'https://foreign.example.invalid'}:!fresh&&calls.length===2&&rejection===413?{headers:{'Content-Length':'65000'}}:{});
        const text=await response.text();responses.push({status:response.status,created:JSON.parse(text).created??null});
        if(!fresh&&calls.length===1){assert.equal(response.status,200,'The earlier request must actually be stored');return route.abort('failed');}
        return route.fulfill({status:response.status,headers:Object.fromEntries(response.headers),body:text});
      }
      if(u.pathname.startsWith('/api/'))throw Error('Unexpected API in pending reproduction: '+u.pathname);
      return route.continue();
    });
    try{
      const page=await context.newPage();page.setDefaultTimeout(15000);page.on('pageerror',e=>errors.push(e.message));
      const state=()=>page.evaluate(key=>{const form=document.querySelector('.contact-form');return{pendingRaw:sessionStorage.getItem(key),disabled:document.querySelector('.contact-fields')?.disabled??null,name:form?.querySelector('[name="name"]')?.value??null,email:form?.querySelector('[name="email"]')?.value??null,message:form?.querySelector('[name="message"]')?.value??null,retryButtons:[...document.querySelectorAll('button')].filter(b=>b.textContent.includes('Controleer en probeer opnieuw')).length};},pendingKey);
      const shot=suffix=>page.locator('.contact-form').screenshot({path:path.join(out,scenario+'-'+width+'-'+suffix+'.png')});
      await page.goto(origin+'/contact',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
      if(fresh){
        const holder=JSON.stringify({...input,email:'quota-holder@example.invalid'});
        for(let i=0;i<8;i++)assert.equal((await f.post(holder)).status,200);
        const dbBefore=JSON.stringify(await snapshotDB(f));
        await page.getByLabel('Je naam',{exact:true}).fill(input.name);
        await page.getByLabel('Je e-mailadres',{exact:true}).fill(input.email);
        await page.getByLabel('Vertel kort over je plannen').fill(input.message);
        await page.getByRole('button',{name:'Verstuur je aanvraag',exact:true}).click();
        await page.locator('.contact-form .error-box[role="alert"]').waitFor();
        result.after=await state();await shot('rejected');
        assert.equal(responses[0].status,429);
        assert.equal(result.after.pendingRaw,null);assert.equal(result.after.disabled,false);assert.equal(result.after.retryButtons,0);
        assert.equal(result.after.name,input.name);assert.equal(result.after.message,input.message);
        assert.equal(JSON.stringify(await snapshotDB(f)),dbBefore,'A rejected fresh submission changes no stored inquiry or mail');
        result.freshRejectedInputEditable=true;
      }else{
        const lost=await page.evaluate(async({key,raw})=>{sessionStorage.setItem(key,raw);try{await fetch('/api/contact',{method:'POST',headers:{'Content-Type':'application/json'},body:raw});return false;}catch{return true;}},{key:pendingKey,raw});
        assert.equal(lost,true);
        await page.reload({waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
        await page.getByText('Je verzendpoging bekijken',{exact:true}).waitFor();
        result.before=await state();assert.equal(result.before.pendingRaw,raw);assert.equal(result.before.disabled,true);await shot('before');
        const dbBefore=JSON.stringify(await snapshotDB(f));
        if(rejection===429)for(let i=0;i<7;i++)assert.equal((await f.post(raw)).status,200);
        await page.getByRole('button',{name:'Controleer en probeer opnieuw',exact:true}).click();
        await page.locator('.contact-form .error-box[role="alert"]').waitFor();
        result.after=await state();await shot('rejected');
        assert.equal(responses[1].status,rejection);
        result.frozenAfterRejection=result.after.pendingRaw===raw&&result.after.disabled===true;
        await page.reload({waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
        result.afterReload=await state();await shot('reloaded');
        result.frozenAfterReload=result.afterReload.pendingRaw===raw&&result.afterReload.disabled===true&&result.afterReload.name===input.name&&result.afterReload.message===input.message;
        // Only the disposable memory fixture's rate counter is advanced; no real clock or DB changes.
        await f.connection.db.prepare('DELETE FROM rate_limits WHERE length(key)=64').run();
        if(result.afterReload.retryButtons===1){
          await page.getByRole('button',{name:'Controleer en probeer opnieuw',exact:true}).click();await page.locator('.success-box').waitFor();await page.locator('.success-box').screenshot({path:path.join(out,scenario+'-'+width+'-confirmed.png')});
          result.exactConfirmedRetry=calls[2]===raw&&responses[2].status===200&&responses[2].created===false;
        }else result.exactConfirmedRetry=false;
        result.originalStoredStateUnchanged=JSON.stringify(await snapshotDB(f))===dbBefore;
        assert.equal(result.frozenAfterRejection,true,'Valid unknown payload must remain frozen after a rejected retry');
        assert.equal(result.frozenAfterReload,true,'Original unknown payload/requestId and own input must survive reload');
        assert.equal(result.exactConfirmedRetry,true,'Next successful retry must use identical raw payload and the same requestId');
        assert.equal(result.originalStoredStateUnchanged,true,'Original inquiry, payload hash, frozen outbox and synthetic sends remain unchanged');
      }
      assert.deepEqual(errors,[]);assert.deepEqual(external,[]);result.status='passed';
    }catch(error){result.status='failed';result.error=String(error.message);}
    finally{result.browserErrors=errors;result.externalRequests=external;result.finalInquiryCount=(await f.summary()).inquiries.length;result.syntheticProviderCalls=f.mail.length;report.checks.push(result);await context.close();await f.close();}
    console.log(JSON.stringify({scenario,width,status:result.status,error:result.error??null}));
  }
}finally{
  await browser.close();report.completedAt=new Date().toISOString();report.failed=report.checks.filter(c=>c.status==='failed').length;report.passed=report.checks.filter(c=>c.status==='passed').length;report.status=report.failed||report.checks.length!==10?'failed':'passed';
  await fs.writeFile(reportPath,JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({reportPath,status:report.status,passed:report.passed,failed:report.failed}));if(report.failed||report.checks.length!==10)process.exitCode=1;
}
