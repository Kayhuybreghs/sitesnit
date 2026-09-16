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
const rect=(x,y,w,ht,fill,rx=15)=>h('rect',{x,y,width:w,height:ht,fill,rx});
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
  'atelier-vorm':shell('ONTWERPCONCEPT / ATELIER VORM',[
    headline(['Rust in vorm.','Karakter in detail.'],54,139,62),
    label('Een denkbeeldig interieurmerk.',58,321),
    box({position:'absolute',left:713,top:99,width:433,height:437,background:'#e1cfb9',borderRadius:'200px 200px 28px 28px'},
      svg([h('ellipse',{cx:260,cy:357,rx:130,ry:18,fill:'#bfaa92'}),line('M151 324L173 205H333L354 324','#77563e',14),h('path',{d:'M145 190C143 125 153 74 210 68H295C349 77 359 120 352 190Z',fill:'#89684c'}),h('rect',{x:150,y:186,width:205,height:43,rx:14,fill:'#5e4735'}),line('M166 206L141 359M339 207L365 359','#503c2c',13)],{position:'absolute',left:9,top:21,width:420,height:386})),
    box({position:'absolute',left:60,top:416,width:390,height:4,background:'#ad8e6b'}),
  ]),
  'studio-matcha':shell('ONTWERPCONCEPT / STUDIO MATCHA',[
    headline(['Een frisse blik.','Een eigen ritme.'],54,150,64),
    label('Een denkbeeldige matchabar.',58,328),
    box({position:'absolute',left:770,top:124,width:342,height:342,background:'#dae8a7',borderRadius:171}),
    svg([h('path',{d:'M140 100H350L321 342H171Z',fill:'#f8fae7',stroke:ink,strokeWidth:4}),h('path',{d:'M148 174H342L321 342H171Z',fill:'#7f9b58'}),h('ellipse',{cx:245,cy:176,rx:95,ry:17,fill:'#b9d58a'}),line('M238 49L266 238',ink,10),h('ellipse',{cx:244,cy:100,rx:105,ry:16,fill:'#e8eed4',stroke:ink,strokeWidth:4})],{position:'absolute',left:716,top:112,width:424,height:376,transform:'rotate(9deg)'}),
    text('m.',{position:'absolute',left:79,top:399,fontSize:72,fontWeight:800,color:'#759550'}),
  ]),
  'buiten-gewoon':shell('ONTWERPCONCEPT / BUITEN GEWOON',[
    headline(['Ruimte om','verder te kijken.'],54,142,66),
    label('Een denkbeeldige architectuurstudio.',58,323),
    svg([circle(380,88,49,'#d6e2b4'),h('path',{d:'M60 325V134L249 45L436 138V325Z',fill:'#d6ded3'}),h('path',{d:'M249 45V325H437V137Z',fill:'#aac0b8'}),line('M60 325V134L249 45L436 138V325M249 45V325',ink,4),rect(96,172,116,153,paper,0),rect(287,154,52,97,paper,0),rect(363,189,48,62,paper,0),line('M20 326H474',ink,4)],{position:'absolute',left:664,top:122,width:490,height:390}),
    box({position:'absolute',left:60,top:422,width:170,height:7,background:ink}),
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
