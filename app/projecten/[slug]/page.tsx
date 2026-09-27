import {notFound} from 'next/navigation';
import {clientCases} from '../../portfolio-data';
import {ClientCasePage} from '../../case-components';
import {withPageMetadata,Breadcrumbs} from '../../seo';
import '../../work-story.css';
import '../../case-study.css';
export function generateStaticParams(){return clientCases.map(p=>({slug:p.slug}));}
export const dynamicParams=false;
export async function generateMetadata({params}:{params:Promise<{slug:string}>}){const {slug}=await params;if(!clientCases.some(p=>p.slug===slug))notFound();return withPageMetadata({},`/projecten/${slug}`);}
export default async function Project({params}:{params:Promise<{slug:string}>}){const {slug}=await params;const client=clientCases.find(p=>p.slug===slug);if(!client)notFound();return <><Breadcrumbs items={[{name:'Home',path:'/'},{name:'Projecten',path:'/projecten'},{name:client.name,path:`/projecten/${slug}`}]} /><ClientCasePage project={client}/></>;}
