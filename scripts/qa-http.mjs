import assert from 'node:assert/strict';import fs from 'node:fs';
const origin='http://127.0.0.1:5184';
const post=(path,body)=>fetch(origin+path,{method:'POST',headers:{'Content-Type':'application/json',Origin:origin},body:JSON.stringify(body)});
const bad=await post('/api/lighthouse',{url:'http://127.0.0.1/'});assert.equal(bad.status,400);
const missing=await post('/api/lighthouse',{url:'https://sitesnit-qa-page-does-not-exist.example.com/'});const error=await missing.json();assert.ok(!missing.ok);assert.ok(error.error&&!error.result);
const invalid=await post('/api/contact',{name:'A',email:'invalid',message:'short'});assert.equal(invalid.status,400);
fs.writeFileSync('.sites-runtime/qa/http.json',JSON.stringify({invalidUrl:bad.status,realFailedScan:{status:missing.status,error},invalidContact:invalid.status},null,2));console.log('Actual invalid URL, unreachable Google scan and invalid contact responses verified.');
