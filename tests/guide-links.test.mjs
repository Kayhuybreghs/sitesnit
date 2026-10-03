import test from 'node:test';
import assert from 'node:assert/strict';
import {guideTextParts} from '../lib/guide-links.ts';
test('two authored links render in order without changing the text',()=>{
 const text='Bekijk de kosten en de pakketten. De kosten blijven zichtbaar.';
 const parts=guideTextParts(text,[{phrase:'de pakketten',href:'/pakketten'},{phrase:'de kosten',href:'/kosten'}]);
 assert.equal(parts.map(p=>p.text).join(''),text);
 assert.deepEqual(parts.filter(p=>p.href).map(p=>p.href),['/kosten','/pakketten']);
});
test('only rendered links suppress related targets; overlapping and absent phrases do not',()=>{
 const parts=guideTextParts('Lees de websitecheck.',[{phrase:'website',href:'/absent-overlap'},{phrase:'websitecheck',href:'/check'},{phrase:'onvindbaar',href:'/absent'},{phrase:'',href:'/empty'}]);
 assert.deepEqual(parts.filter(p=>p.href).map(p=>p.href),['/check']);
});
test('evidence remains literal data for React, not parsed HTML',()=>{
 const text='<img src=x onerror=alert(1)> Bekijk kosten & afspraken.';
 const parts=guideTextParts(text,[{phrase:'kosten & afspraken',href:'/kosten'}]);
 assert.equal(parts[0].text,'<img src=x onerror=alert(1)> Bekijk ');
 assert.equal(parts.map(p=>p.text).join(''),text);
 assert.deepEqual(guideTextParts('',[]),[]);
});
