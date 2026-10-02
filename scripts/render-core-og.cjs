/* Original vector compositions, rendered once as crisp static sharing assets. */
const fs = require('node:fs');
const path = require('node:path');
const {ImageResponse} = require('next/og');
const {createElement:h} = require('react');
const folder=path.resolve('../sitesnit-support/og-assets/core-cards');
fs.mkdirSync(folder,{recursive:true});
const fonts=[500,800].map(weight=>({name:'Manrope',weight,style:'normal',data:fs.readFileSync(path.resolve(`../sitesnit-support/og-assets/page-cards/Manrope-${weight}.ttf`))}));
const ink='#123c39',paper='#f6f5ed',blue='#507be7',lime='#d5edaa';
const box=(style,...children)=>h('div',{style:{display:'flex',...style}},...children);
const text=(value,style={})=>box({fontSize:24,lineHeight:1.25,whiteSpace:'pre-wrap',...style},value);
const svg=(children,style={})=>h('svg',{viewBox:'0 0 500 400',width:500,height:400,style},...children);
const line=(d,color=ink,width=5)=>h('path',{d,fill:'none',stroke:color,strokeWidth:width,strokeLinecap:'round',strokeLinejoin:'round'});
const circle=(cx,cy,r,fill)=>h('circle',{cx,cy,r,fill});
const shell=(label,content,tone=paper)=>box({width:1200,height:630,background:tone,color:ink,fontFamily:'Manrope',position:'relative',overflow:'hidden'},
  text('Sitesnit',{position:'absolute',left:54,top:36,fontWeight:800,fontSize:26,letterSpacing:-1}),
  text(label,{position:'absolute',right:54,top:43,fontWeight:800,fontSize:15,letterSpacing:1.5}),
  ...content,
  text('sitesnit.nl',{position:'absolute',left:54,bottom:30,fontSize:18,fontWeight:800}));
const headline=(lines,x=54,y=145,size=64)=>box({position:'absolute',left:x,top:y,flexDirection:'column',fontWeight:800,fontSize:size,letterSpacing:-3,lineHeight:1.08},...lines.map(t=>text(t,{fontSize:size,lineHeight:1.08})));
const label=(value,x,y)=>text(value,{position:'absolute',left:x,top:y,fontSize:18,fontWeight:800});
const cards={
  home:shell('WEBDESIGN · SEO · AUTOMATISERING',[
    headline(['Goed ontworpen.','Sterk gebouwd.'],54,163,71),
    text('Websites met je eigen gezicht.',{position:'absolute',left:58,top:365,fontSize:27}),
    box({position:'absolute',left:60,top:450,width:180,height:7,background:blue,borderRadius:9}),
    box({position:'absolute',left:820,top:123,width:310,height:383,background:lime,borderRadius:'150px 150px 32px 32px',transform:'rotate(8deg)'}),
    box({position:'absolute',left:840,top:187,width:242,height:267,background:blue,borderRadius:26,transform:'rotate(-9deg)',alignItems:'center',justifyContent:'center'},text('S',{fontSize:230,fontWeight:800,color:paper,letterSpacing:-14})),
    box({position:'absolute',left:796,top:170,width:48,height:48,borderRadius:15,background:ink}),
  ]),
  privacy:shell('PRIVACY',[
    headline(['Jouw gegevens.','Met zorg','behandeld.'],54,146,68),
    box({position:'absolute',left:822,top:163,width:300,height:300,background:ink,borderRadius:150,alignItems:'center',justifyContent:'center'},
      svg([line('M190 170V132C190 55 310 55 310 132V170',lime,12),h('rect',{x:160,y:170,width:180,height:145,rx:25,fill:lime}),circle(250,228,13,ink),line('M250 230V267',ink,10)],{width:280,height:245})),
    label('Helder over gebruik en contact.',58,457),
  ]),
  pakketten:shell('WEBDESIGN / PAKKETTEN',[
    headline(['Ruimte voor','jouw verhaal.'],54,135,64),
    label('Onepager · Vijf pagina’s · Maatwerk',58,319),
    box({position:'absolute',left:55,top:410,width:440,height:90,borderTop:'2px solid #cbd5c9',paddingTop:24,fontSize:24},'Welke opbouw past bij je plannen?'),
    box({position:'absolute',left:595,top:170,width:142,height:305,background:lime,borderRadius:20,padding:22,flexDirection:'column',justifyContent:'space-between'},text('01',{fontWeight:800,fontSize:46}),text('Eén\nverhaal',{fontWeight:800})),
    ...[0,1,2,3,4].map(i=>box({position:'absolute',left:772+i*56,top:128+i*34,width:126,height:210,border:'2px solid #f6f5ed',background:i===4?blue:'#c5d1ed',borderRadius:18,transform:`rotate(${i*3}deg)`},text(String(i+1).padStart(2,'0'),{margin:20,fontWeight:800,color:i===4?paper:ink,fontSize:31}))),
    label('Een eigen indeling.',823,485),
  ]),
  beurswijzer:shell('CASE / BEURSWIJZER',[
    headline(['Van cijfers','naar overzicht.'],54,131,70),
    text('Webdesign & interactieve tools',{position:'absolute',left:58,top:312,fontSize:24}),
    box({position:'absolute',left:58,top:409,background:ink,color:lime,borderRadius:22,padding:'21px 28px',gap:38,fontSize:22,fontWeight:800},'Maandruimte','/','Toekomst'),
    box({position:'absolute',left:708,top:134,width:428,height:362,background:'#e5edcf',borderRadius:32},
      text('Je keuzes in beeld.',{position:'absolute',left:30,top:28,fontSize:27,fontWeight:800}),
      svg([line('M30 285H455', '#bbceae',2),line('M30 225H455','#c8d8bc',2),line('M30 165H455','#c8d8bc',2),h('path',{d:'M30 285C180 268 230 231 455 100V286H30Z',fill:'#cee1b4'}),line('M30 285C180 268 230 231 455 100',ink,6),circle(455,100,8,ink)],{position:'absolute',left:12,top:43,width:398,height:305}),
      text('SCHEMATISCH VOORBEELD',{position:'absolute',left:31,bottom:20,fontSize:13,letterSpacing:1})),
  ]),
  beurswatcher:shell('CASE / BEURSWATCHER',[
    headline(['Verder kijken.','Beter begrijpen.'],54,147,66),
    label('Een eigen merk voor lezen en rekenen.',58,333),
    box({position:'absolute',left:58,top:415,width:515,height:78,background:'#f2ce34',borderRadius:18,padding:'24px 26px',fontWeight:800,fontSize:21,color:'#102f56'},'Inleg   +   Looptijd   =   Scenario'),
    box({position:'absolute',left:716,top:119,width:420,height:396,background:'#102f56',borderRadius:'38px 110px 38px 38px',overflow:'hidden'},
      text('KIJK\nVERDER.',{position:'absolute',left:38,top:36,fontSize:59,fontWeight:800,color:'#f2ce34',lineHeight:1.1}),
      svg([line('M-20 320C100 318 150 120 235 228S365 50 470 75','#f2ce34',9),circle(470,75,14,'#f2ce34')],{position:'absolute',left:0,top:178,width:420,height:210})),
  ]),

};
(async()=>{
  const manifest=[];
  for(const [name,tree] of Object.entries(cards)) {
    const response=new ImageResponse(tree,{width:1200,height:630,fonts});
    const file=path.join(folder,name+'.png'); fs.writeFileSync(file,Buffer.from(await response.arrayBuffer()));
    manifest.push({name,file,width:1200,height:630,bytes:fs.statSync(file).size});
  }
  fs.writeFileSync(path.join(folder,'manifest.json'),JSON.stringify(manifest,null,2));
  console.log(JSON.stringify({count:manifest.length,bytes:manifest.reduce((n,x)=>n+x.bytes,0)}));
})();
