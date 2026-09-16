import { notFound } from "next/navigation";
import "../../expansion.css";
import "../../service-experience.css";
import type { Metadata } from "next";
import { services } from "../service-data";
import { ServiceHub, ServiceDetail } from "../../service-experience";
import { hubSlugs, specialistParents } from "../../service-experience-data";
import { withPageMetadata, BreadcrumbData, JsonLd } from '../../seo';
import { site } from '../../site-data';

export function generateStaticParams() { return services.map(service => ({dienst: service.slug})); }
export const dynamicParams = false;
export async function generateMetadata({params}: {params: Promise<{dienst: string}>}): Promise<Metadata> {
  const {dienst} = await params;
  const service = services.find(item => item.slug === dienst);
  if (!service) notFound();
  return withPageMetadata({}, `/diensten/${service.slug}`);
}
export default async function ServicePage({params}: {params: Promise<{dienst: string}>}) {
  const {dienst} = await params;
  const service = services.find(item => item.slug === dienst);
  if (!service) notFound();
  const parent = specialistParents[service.slug];
  return <><BreadcrumbData items={[{name:'Home',path:'/'},{name:'Diensten',path:'/diensten'},...(parent ? [{name:parent[0],path:`/diensten/${parent[1]}`}] : []),{name:service.name,path:`/diensten/${service.slug}`}]} />
    <JsonLd data={{'@context':'https://schema.org','@type':'Service','@id':`${site.origin}/diensten/${service.slug}#service`,name:service.name,description:service.meta,url:`${site.origin}/diensten/${service.slug}`,provider:{'@id':`${site.origin}/#organization`},areaServed:{'@type':'AdministrativeArea',name:'Limburg, Nederland'}}}/>
    {hubSlugs.includes(service.slug) ? <ServiceHub service={service}/> : <ServiceDetail service={service}/>}</>;
}
