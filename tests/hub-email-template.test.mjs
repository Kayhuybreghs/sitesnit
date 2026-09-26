import test from 'node:test';
import assert from 'node:assert/strict';
import {hubActionEmail} from '../lib/hub/email-template.ts';
import {parse} from 'parse5';
test('all transactional emails contain matching HTML and plain text actions without leaking tokens to assets',()=>{
  for(const kind of ['verify','reset','invite']){
    const url='https://www.sitesnit.nl/api/hub-auth/verify-email?token=fixture-only&callbackURL=%2Fhub%2Flogin';
    const mail=hubActionEmail(kind,'fixture@example.test',url);
    assert.ok(mail.text.includes(url));assert.ok(mail.html.includes('Kay van Sitesnit'));assert.equal(mail.to,'fixture@example.test');
    const nodes=[];function visit(n){nodes.push(n);for(const child of n.childNodes||[])visit(child);}visit(parse(mail.html));
    const attrs=(n,name)=>n.attrs?.find(a=>a.name===name)?.value;
    assert.equal(nodes.filter(n=>n.tagName==='a'&&attrs(n,'href')===url).length,2);
    for(const n of nodes.filter(n=>n.tagName==='img')){assert.ok(attrs(n,'alt'));assert.ok(!attrs(n,'src').includes('token='));}
    assert.equal(nodes.some(n=>n.tagName==='script'),false);
  }
});
test('email links reject active protocols and escape attribute content',()=>{
  assert.throws(()=>hubActionEmail('verify','fixture@example.test','javascript:alert(1)'));
  const mail=hubActionEmail('verify','fixture@example.test','https://www.sitesnit.nl/path?q="<test>&x=1');
  assert.ok(mail.html.includes('&quot;&lt;test&gt;&amp;x=1'));assert.ok(!mail.html.includes('q="<test>'));
});
