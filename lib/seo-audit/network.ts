import https from 'node:https';
import {resolve4} from 'node:dns/promises';
import ipaddr from 'ipaddr.js';
export function auditUrl(input:string){
 const url=new URL(input.startsWith('https://')?input:`https://${input}`);
 if(url.protocol!=='https:'||url.port||url.username||url.password||url.search||input.length>1800||!/^([a-z0-9-]+\.)+[a-z]{2,63}$/i.test(url.hostname)||/\.(local|internal|localhost|test|invalid)$/i.test(url.hostname))throw new Error('Gebruik een openbaar HTTPS-adres zonder inloggegevens, poort of URL-parameters.');
 url.hash='';return url;
}
export function publicIpv4(address:string){try{return ipaddr.parse(address).kind()==='ipv4'&&ipaddr.parse(address).range()==='unicast';}catch{return false;}}
export type AuditResponse={status:number;headers:Record<string,string>;body:string;url:string};
/** DNS results are checked, then the exact public address is pinned to the TLS socket. No redirects, cookies, proxy or assets. */
export async function readPublicHtml(input:string):Promise<AuditResponse>{
 const url=auditUrl(input);
 const addresses=await Promise.race([resolve4(url.hostname),new Promise<never>((_,reject)=>{const timer=setTimeout(()=>reject(new Error('DNS-time-out')),4000);timer.unref();})]);
 if(!addresses.length||addresses.some(a=>!publicIpv4(a)))throw new Error('Dit adres kan niet veilig worden onderzocht.');
 return new Promise((resolve,reject)=>{
  const req=https.get(url,{agent:false,servername:url.hostname,family:4,lookup:(_host,_options,callback)=>callback(null,addresses[0],4),headers:{'User-Agent':'SitesnitAudit/1.0 (+https://www.sitesnit.nl/tools/seo-audit)','Accept':'text/html,text/plain,application/xml;q=0.8','Accept-Encoding':'identity'}},res=>{
   const chunks:Buffer[]=[];let size=0;
   const headers=Object.fromEntries(Object.entries(res.headers).map(([k,v])=>[k,Array.isArray(v)?v.join(', '):v||'']));
   if(headers['content-encoding']&&headers['content-encoding']!=='identity'){res.destroy();reject(new Error('Gecomprimeerde response niet onderzocht.'));return;}
   res.on('data',(chunk:Buffer)=>{size+=chunk.length;if(size>1_000_000){req.destroy(new Error('Pagina groter dan de limiet van 1 MB.'));return;}chunks.push(chunk);});
   res.on('end',()=>resolve({status:res.statusCode||0,headers,body:Buffer.concat(chunks).toString('utf8'),url:url.href}));
   res.on('error',reject);
  });
  const timer=setTimeout(()=>req.destroy(new Error('De pagina antwoordt niet binnen 5 seconden.')),5000);
  req.once('close',()=>clearTimeout(timer));req.on('error',reject);
 });
}
