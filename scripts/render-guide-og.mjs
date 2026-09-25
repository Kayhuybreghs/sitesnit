import fs from 'node:fs';
import path from 'node:path';
import { createElement as h } from 'react';
import { ImageResponse } from 'next/og.js';
import { guides } from '../lib/guides.ts';

const fonts=[500,800].map(weight=>({name:'Manrope',weight,style:'normal',data:fs.readFileSync(new URL(`./og-fonts/Manrope-${weight}.ttf`,import.meta.url))}));
const box=(style,...children)=>h('div',{style:{display:'flex',...style}},...children.flat());
const text=(value,style={})=>box({fontSize:24,lineHeight:1.25,...style},value);
const accent={websitecheck:'#dce9c6',prijscheck:'#f5ddca',offertevergelijker:'#dbe7f4',automatiseringsplan:'#d6e6df','ontwerp-je-website':'#d9e2ff'};
const entries=[...guides.map(g=>({slug:g.slug,title:g.title,tag:g.group,steps:g.sections.slice(0,3).map(s=>s.heading)})),
  {slug:'seo-venlo',title:'SEO voor je bedrijf in Venlo.',tag:'websitecheck',steps:['Vanuit Baarlo','Inhoud en techniek','Gericht verbeteren']},
  {slug:'seo-onderhoud',title:'Een rapport is nog geen verbetering.',tag:'websitecheck',steps:['Prioriteiten kiezen','Werk uitvoeren','Opnieuw controleren']},
];
fs.mkdirSync('public/og/guides',{recursive:true});
for(const entry of entries){
  const art=box({width:1200,height:630,background:'#f7f5ed',color:'#133f46',fontFamily:'Manrope',padding:54,position:'relative',overflow:'hidden'},
    text('sitesnit',{position:'absolute',left:54,top:35,fontWeight:800,fontSize:35,letterSpacing:-2}),
    text('PRAKTISCHE UITLEG',{position:'absolute',right:54,top:49,fontSize:14,fontWeight:800,letterSpacing:2}),
    box({width:590,flexDirection:'column',justifyContent:'center',paddingBottom:12},text(entry.title.replaceAll('\u00ad',''),{fontSize:entry.title.length>65?51:59,fontWeight:800,letterSpacing:-2,lineHeight:1.12}),text('Begrijp je opties. Kies je volgende stap.',{fontSize:22,marginTop:28,maxWidth:470})),
    box({position:'absolute',left:710,top:122,width:432,height:390,background:accent[entry.tag],borderRadius:'28px 92px 28px 28px',padding:28,flexDirection:'column',gap:18},text('VAN VRAAG NAAR KEUZE',{fontSize:12,fontWeight:800,letterSpacing:1}),entry.steps.map((step,index)=>box({background:'#fffdf7',borderRadius:16,padding:18,alignItems:'center',gap:16,minHeight:78},text(`0${index+1}`,{fontSize:18,color:'#194cd4',fontWeight:800}),text(step,{fontSize:17,fontWeight:800,maxWidth:282})))),
    text('sitesnit.nl',{position:'absolute',left:54,bottom:32,fontSize:18,fontWeight:800}),
    text('Websites · Inhoud · Techniek',{position:'absolute',right:54,bottom:32,fontSize:16}));
  const response=new ImageResponse(art,{width:1200,height:630,fonts});
  fs.writeFileSync(path.join('public/og/guides',`${entry.slug}.png`),Buffer.from(await response.arrayBuffer()));
}
console.log(`${entries.length} unique guide/service sharing images rendered from local fonts.`);
