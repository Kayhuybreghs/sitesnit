import test from 'node:test';
import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';

test('isolated server rejects external fetch and TCP but permits an actual loopback response',()=>{
  const source=`
    const assert=require('node:assert/strict');
    const net=require('node:net');
    const http=require('node:http');
    assert.throws(()=>fetch('https://example.invalid/mail'),/blocked outbound/);
    assert.throws(()=>net.connect({host:'198.51.100.1',port:443}),/blocked non-loopback/);
    assert.throws(()=>net.connect(443,'example.invalid'),/blocked non-loopback/);
    const server=http.createServer((_req,res)=>res.end('fixture only'));
    server.listen(0,'127.0.0.1',async()=>{
      try{assert.equal(await (await fetch('http://127.0.0.1:'+server.address().port)).text(),'fixture only');}
      catch(error){console.error(error);process.exitCode=1;}
      finally{server.close();}
    });
  `;
  const result=spawnSync(process.execPath,['--require','./scripts/fixture-network.cjs','-e',source],{cwd:process.cwd(),encoding:'utf8',timeout:15000});
  assert.equal(result.status,0,result.stderr||String(result.error));
});
