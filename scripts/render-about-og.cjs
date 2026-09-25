const fs=require('node:fs');
const {ImageResponse}=require('next/og');
const {createElement:h}=require('react');
const sharp=require('sharp');
async function main(){
const photos={};
for(const src of ['public/about/kay-portret-640.webp','public/about/nova-sitesnit-hond-320.webp'])photos[src]=await sharp(src).png().toBuffer();
const fonts=[500,800].map(weight=>({name:'Manrope',weight,style:'normal',data:fs.readFileSync(`scripts/og-fonts/Manrope-${weight}.ttf`)}));
const box=(style,...children)=>h('div',{style:{display:'flex',...style}},...children);
const text=(value,style={})=>box({fontSize:24,...style},value);
const picture=(src,style)=>h('img',{src:`data:image/png;base64,${photos[src].toString('base64')}`,style});
const card=box({width:1200,height:630,background:'#f8f6ef',color:'#123f43',fontFamily:'Manrope',position:'relative',overflow:'hidden'},
 text('Sitesnit',{position:'absolute',left:58,top:38,fontSize:29,fontWeight:800}),
 text('DE MAKER ACHTER JE WEBSITE',{position:'absolute',left:58,top:148,fontSize:16,letterSpacing:2,fontWeight:800}),
 text('Hoi, ik ben Kay.',{position:'absolute',left:54,top:203,fontSize:69,letterSpacing:-3,fontWeight:800}),
 text('Jouw verhaal.\nEen eigen plek online.',{position:'absolute',left:58,top:310,fontSize:34,lineHeight:1.35,whiteSpace:'pre-wrap',color:'#184bce',fontWeight:800}),
 text('Webdesign & ontwikkeling vanuit Baarlo',{position:'absolute',left:58,top:455,fontSize:20}),
 text('www.sitesnit.nl / over-sitesnit',{position:'absolute',left:58,bottom:38,fontSize:17,fontWeight:800}),
 box({position:'absolute',left:745,top:60,width:480,height:530,borderRadius:'200px 200px 40px 40px',background:'#e4ebdd'}),
 box({position:'absolute',left:735,top:101,padding:10,paddingBottom:18,background:'#fffdf8',borderRadius:18,transform:'rotate(-5deg)',flexDirection:'column'},picture('public/about/kay-portret-640.webp',{width:278,height:350,objectFit:'cover',borderRadius:10}),text('Kay / Sitesnit',{fontSize:17,paddingTop:12,paddingLeft:6,fontWeight:800})),
 box({position:'absolute',left:978,top:344,padding:8,paddingBottom:12,background:'#fffdf8',borderRadius:15,transform:'rotate(8deg)',flexDirection:'column'},picture('public/about/nova-sitesnit-hond-320.webp',{width:148,height:165,objectFit:'cover',borderRadius:8}),text('En Nova natuurlijk.',{fontSize:12,paddingTop:10,fontWeight:800})));
const result=new ImageResponse(card,{width:1200,height:630,fonts});fs.writeFileSync('public/og/over-sitesnit.png',Buffer.from(await result.arrayBuffer()));console.log('Updated about share image: 1200 × 630');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
