import type {HubSnapshots, HubWorkItem, HubUptime} from '../../app/hub/hub-dashboard';
import type {ProviderResult, Source} from './providers/common';
import type {Ga4Report, Ga4Row} from './providers/ga4';
import type {SearchReport, SearchRow} from './providers/search-console';

// Deliberately fixed fiction. Never written as provider snapshots or customer metrics.
const period={startDate:'2026-09-14',endDate:'2026-09-20'};
function report<T>(source:Source,data:T):ProviderResult<T>{return {source,data,period,state:'ready',timeZone:'Europe/Amsterdam',fetchedAt:'2026-09-21T08:00:00Z',warnings:['Fictieve demonstratiegegevens; niet door deze bron gemeten.']};}
function ga(rows:Ga4Row[]){return report<Ga4Report>('ga4',{rows,rowCount:rows.length,subjectToThresholding:false,sampled:false,dataLossFromOtherRow:false});}
function breakdown(dimension:string,rows:[string,number,number][]){return ga(rows.map(([label,sessions,totalUsers])=>({dimensions:{[dimension]:label},metrics:{sessions,totalUsers}})));}
function search(rows:SearchRow[],topRowsOnly=false,aggregation:'byProperty'|'byPage'='byProperty'){return report<SearchReport>('search-console',{rows,aggregation,dataState:'final',topRowsOnly});}
export const demoSite={id:'demo-site-local',name:'Voorbeeldbedrijf — fictieve demo',origin:'https://example.com'};
export const demoSnapshots:HubSnapshots={
  ga4:{
    totals:ga([{dimensions:{},metrics:{totalUsers:318,activeUsers:287,sessions:402,screenPageViews:987}}]),
    daily:ga([40,55,48,60,69,58,72].map((sessions,i)=>({dimensions:{date:`202609${14+i}`},metrics:{sessions,totalUsers:Math.floor(sessions*.85),screenPageViews:sessions*2}}))),
    sources:breakdown('sessionSourceMedium',[['google / organic',190,164],['instagram / social',65,54],['(direct) / (none)',112,97],['facebook / social',35,30]]),
    monthly:{...ga([['202607',240,310,750],['202608',318,402,987]].map(([yearMonth,totalUsers,sessions,screenPageViews])=>({dimensions:{yearMonth:String(yearMonth)},metrics:{totalUsers:Number(totalUsers),sessions:Number(sessions),screenPageViews:Number(screenPageViews)}}))),period:{startDate:'2026-07-01',endDate:'2026-08-31'}},
    channels:breakdown('sessionDefaultChannelGroup',[['Organic Search',190,164],['Direct',142,123],['Referral',70,58]]),
    devices:breakdown('deviceCategory',[['mobile',226,192],['desktop',160,138],['tablet',16,14]]),
    landingPages:breakdown('landingPage',[['/',220,180],['/diensten',102,86],['/contact',80,75]]),
    countries:breakdown('country',[['Netherlands',389,308],['Belgium',10,8],['Germany',3,2]]),
    events:ga([['tool_start',42],['tool_complete',26],['cta_click',18]].map(([eventName,eventCount])=>({dimensions:{eventName:String(eventName)},metrics:{eventCount:Number(eventCount)}}))),
  },
  searchConsole:{totals:search([{keys:[],clicks:73,impressions:1290,ctr:73/1290,position:14.2}]),queries:search([{keys:['voorbeeldbedrijf diensten'],clicks:41,impressions:520,ctr:41/520,position:5.1},{keys:['voorbeeldbedrijf contact'],clicks:20,impressions:310,ctr:20/310,position:7.4}],true),pages:search([{keys:['https://example.com/'],clicks:50,impressions:820,ctr:50/820,position:12.3},{keys:['https://example.com/diensten'],clicks:23,impressions:470,ctr:23/470,position:17.5}],true,'byPage')},
  deployments:report('vercel',[{id:'demo-release',status:'READY',target:'production',createdAt:'2026-09-18T09:00:00Z',readyAt:'2026-09-18T09:01:00Z'}]),
};
export const demoWork:HubWorkItem[]=[
  {id:'demo-mobile',title:'Voorbeeld: contactknop op mobiel verduidelijkt',detail:'Fictieve taak: de contactactie staat direct na de uitleg over het aanbod.',status:'completed',evidence:'Voorbeeldnotitie: op 390 pixels gecontroleerd dat de knop zichtbaar en met toetsenbord bereikbaar is. Geen werkelijk klantwerk.',updatedAt:'2026-09-20T12:00:00Z'},
  {id:'demo-content',title:'Voorbeeld: dienstenpagina aanvullen',detail:'Fictieve taak: drie praktische klantvragen uitwerken. Dit laat zien hoe gepland werk herkenbaar blijft.',status:'in_progress',evidence:'Nog geen afgeronde hercontrole in dit voorbeeld.',updatedAt:'2026-09-19T12:00:00Z'},
];
export const demoUptime:HubUptime={period:{startDate:'2026-09-20',endDate:'2026-09-20'},expectedChecks:4,sourceLabel:'Fictieve HTTP-meetreeks',checks:[0,1,3].map(n=>({checkedAt:`2026-09-20T12:${String(n*5).padStart(2,'0')}:00Z`,status:'up',httpStatus:200,latencyMs:120+n*8,location:'Demo'}))};
