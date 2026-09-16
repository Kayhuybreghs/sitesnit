import { withPageMetadata, Breadcrumbs } from '../../seo';
import type { Metadata } from "next";
import WebsiteDesigner from "./website-designer";
import "../workbench.css";
export const metadata: Metadata = withPageMetadata({alternates: { canonical: "/tools/ontwerp-je-website" }}, '/tools/ontwerp-je-website');
export default function Page() {
  return <><Breadcrumbs items={[{name:'Home',path:'/'},{name:'Tools & checks',path:'/tools'},{name:'Ontwerp je website',path:'/tools/ontwerp-je-website'}]}/><WebsiteDesigner /></>;
}
