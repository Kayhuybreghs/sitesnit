import fs from 'node:fs/promises';import {createElement as h} from 'react';import {ImageResponse} from 'next/og.js';import {speedGuides} from '../lib/speed-guides.ts';
const font=await fs.readFile('scripts/og-fonts/Manrope-800.ttf');
const items=[{slug:'snelheidstest',title:'Weten waar je website op wacht.',steps:['Jouw pagina','De meting','Een gerichte stap']},...speedGuides];
const box=(style,...children)=>h('div',{style:{display:'flex',...style}},...children);
for(const [i,item] of items.entries()){
 const tree=box({width:1200,height:630,background:'#f8f6ef',color:'#123f43',fontFamily:'Manrope',padding:55,flexDirection:'column'},box({justifyContent:'space-between',fontSize:26},'sitesnit',box({fontSize:18,color:'#184bce'},i?'SNELHEIDSTEST / UITLEG':'GRATIS SNELHEIDSTEST')),box({fontSize:58,lineHeight:1.12,letterSpacing:-2,marginTop:65},item.title),box({gap:18,marginTop:45},...item.steps.map((text,j)=>box({width:345,minHeight:125,padding:24,borderRadius:18,background:['#e5eddf','#e1e9fb','#f8e3d0'][j],flexDirection:'column',gap:15},box({fontSize:18,color:'#184bce'},'0'+(j+1)),box({fontSize:24,lineHeight:1.2},text)))),box({marginTop:'auto',fontSize:18},'www.sitesnit.nl · Meet. Begrijp. Verbeter.'));
 const image=new ImageResponse(tree,{width:1200,height:630,fonts:[{name:'Manrope',data:font,weight:800,style:'normal'}]});await fs.writeFile(`public/og/speed-${item.slug}.png`,Buffer.from(await image.arrayBuffer()));
}
console.log('Four speed-test share images generated with local fonts.');
