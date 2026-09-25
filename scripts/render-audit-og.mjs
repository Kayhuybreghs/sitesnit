import fs from 'node:fs/promises';
import {createElement as h} from 'react';
import {ImageResponse} from 'next/og.js';
import {auditGuides} from '../lib/seo-audit/guides.ts';
const font=await fs.readFile('scripts/og-fonts/Manrope-800.ttf');
const items=[{slug:'seo-audit',title:'Zie wat je website tegenhoudt.',diagram:['URL','Bevinding','Volgende stap']},...auditGuides];
const box=(style,...children)=>h('div',{style:{display:'flex',...style}},...children);
for(const [i,g] of items.entries()){
 const palette=['#e7eee1','#e1e9fb','#f8e3d0'];
 const tree=box({width:1200,height:630,background:'#f8f6ef',color:'#123f43',fontFamily:'Manrope',padding:55,position:'relative',flexDirection:'column'},
 box({justifyContent:'space-between',fontSize:26},'sitesnit',box({fontSize:18,color:'#184bce'},i?'SEO-AUDIT / UITLEG '+String(i).padStart(2,'0'):'GRATIS SEO-AUDIT')),
 box({fontSize:55,lineHeight:1.12,letterSpacing:-2,maxWidth:1000,marginTop:65},g.title),
 box({gap:18,marginTop:45},...g.diagram.map((text,j)=>box({width:345,minHeight:135,padding:24,borderRadius:j===i%3?'34px 12px 34px 12px':'14px',background:palette[(i+j)%3],flexDirection:'column',gap:14},box({fontSize:18,color:'#184bce'},'0'+(j+1)),box({fontSize:23,lineHeight:1.2},text)))),
 box({position:'absolute',bottom:35,left:55,fontSize:18},'www.sitesnit.nl · Van signaal naar actie'));
 const png=new ImageResponse(tree,{width:1200,height:630,fonts:[{name:'Manrope',data:font,weight:800,style:'normal'}]});
 await fs.writeFile(`public/og/${i?'audit-'+g.slug:g.slug}.png`,Buffer.from(await png.arrayBuffer()));
}
console.log('Seven unique audit OG images generated.');
