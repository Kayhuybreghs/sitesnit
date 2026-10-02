export function speedFixture(device='mobile'){
 const audits=Object.fromEntries(['first-contentful-paint','largest-contentful-paint','total-blocking-time','cumulative-layout-shift','speed-index'].map((id,i)=>[id,{score:.7,scoreDisplayMode:'numeric',title:id,numericValue:[1500,3100,340,.04,3800][i],displayValue:'fixture'}]));
 audits['unused-javascript']={score:.2,scoreDisplayMode:'numeric',title:'Unused JavaScript',description:'Synthetic finding',details:{items:[{url:'https://example.com/app.js',wastedBytes:20480,node:{snippet:'<script src="app.js"></script>'}}]}};
 audits['uses-text-compression']={score:1,scoreDisplayMode:'binary',title:'Tekst wordt gecomprimeerd',description:'De tekstbestanden zijn in deze fixture gecomprimeerd.',details:{items:[{url:'https://example.com/site.css'}]}};
 return {lighthouseResult:{configSettings:{formFactor:device},fetchTime:'2026-10-01T10:00:00Z',lighthouseVersion:'fixture',finalUrl:'https://example.com/',categories:{performance:{score:.76,auditRefs:Object.keys(audits).map(id=>({id}))}},audits,runWarnings:['Geïsoleerde testdata. Geen echte meting.']}};
}
