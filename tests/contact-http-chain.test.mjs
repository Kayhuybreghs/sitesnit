import test from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {createContactChainFixture} from '../scripts/contact-chain-fixture.mjs';
const payload=()=>({requestId:randomUUID(),name:'Synthetic route fixture',email:'visitor@example.invalid',message:'Een geïsoleerde aanvraag zonder echte mail.',sourcePage:'/contact',serviceId:'seo-optimalisatie'});
test('real contact POST stores one inquiry and two correct deliveries despite a lost response and exact retry',async()=>{
  const f=await createContactChainFixture();try{
    const raw=JSON.stringify(payload()),first=await f.post(raw);assert.equal(first.status,200); // Browser never receives this response.
    const second=await f.post(raw),receipt=await second.json();assert.equal(second.status,200);assert.equal(receipt.created,false);
    assert.deepEqual(receipt.mail,{owner:'provider_accepted',confirmation:'provider_accepted'});
    const state=await f.summary();assert.equal(state.inquiries.length,1);assert.equal(state.tasks.length,2);assert.equal(f.mail.length,2);
    const owner=state.tasks.find(task=>task.kind==='owner'),confirmation=state.tasks.find(task=>task.kind==='confirmation');
    assert.equal(owner.payload.to,'contact@sitesnit.nl');assert.equal(confirmation.payload.to,'visitor@example.invalid');
    assert.equal(owner.payload.reply_to,'visitor@example.invalid');assert.equal(confirmation.payload.reply_to,'contact@sitesnit.nl');
    assert.ok(state.tasks.every(task=>task.state==='provider_accepted'));
    assert.equal(new Set(f.mail.map(mail=>mail.key)).size,2);
  }finally{await f.close();}
});
test('real contact POST rejects invalid input/origin/oversize and rolls failed storage back before claiming success',async()=>{
  const f=await createContactChainFixture();try{
    assert.equal((await f.post(JSON.stringify({...payload(),email:'invalid'}))).status,400);
    assert.equal((await f.post(JSON.stringify(payload()),{origin:'https://foreign.example.invalid'})).status,403);
    assert.equal((await f.post('{invalid')).status,400);
    assert.equal((await f.post(JSON.stringify({...payload(),message:'a'.repeat(65000)}))).status,413);
    await f.connection.executeSchema("CREATE TRIGGER fail_fixture BEFORE INSERT ON contact_outbox WHEN NEW.kind='confirmation' BEGIN SELECT RAISE(ABORT,'isolated failure'); END;");
    assert.equal((await f.post(JSON.stringify(payload()))).status,503);
    const state=await f.summary();assert.equal(state.inquiries.length,0);assert.equal(state.tasks.length,0);assert.equal(f.mail.length,0);
  }finally{await f.close();}
});
