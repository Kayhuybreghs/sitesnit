import test from 'node:test';
import assert from 'node:assert/strict';
import {indexingAllowed,productionOrigin,privatePath} from '../lib/seo-policy.ts';
import {contentSecurityPolicy} from '../lib/security-headers.ts';
test('only the actual www production host is indexable; previews and private route policy remain separate',()=>{
  assert.equal(productionOrigin,'https://www.sitesnit.nl');
  for(const h of ['www.sitesnit.nl','WWW.SITESNIT.NL'])assert.equal(indexingAllowed(h,'production'),true);
  for(const h of ['sitesnit.nl','www.sitesnit.nl:443','www.sitesnit.nl.evil.test','preview.vercel.app','localhost:5184',null])assert.equal(indexingAllowed(h,'production'),false);
  for(const env of ['preview','development',undefined])assert.equal(indexingAllowed('www.sitesnit.nl',env),false);
  for(const p of ['/hub/demo','/hub/admin','/hub/login','/api/lighthouse'])assert.ok(privatePath(p));
});
test('production CSP authorizes request nonce, not arbitrary inline code or eval',()=>{
  const nonce='fixture_nonce_01234567890123456789',csp=contentSecurityPolicy(nonce);
  const scripts=csp.split('; ').find(d=>d.startsWith('script-src '));
  assert.ok(scripts.includes(`'nonce-${nonce}'`));assert.ok(scripts.includes("'strict-dynamic'"));assert.ok(!scripts.includes('unsafe-inline'));assert.ok(!scripts.includes('unsafe-eval'));
  assert.ok(csp.includes("object-src 'none'"));assert.ok(csp.includes("script-src-attr 'none'"));assert.ok(contentSecurityPolicy(nonce,true).includes('unsafe-eval'));
  assert.throws(()=>contentSecurityPolicy("bad'; default-src *"));
});
