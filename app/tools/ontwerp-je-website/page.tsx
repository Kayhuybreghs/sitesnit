import { withPageMetadata, Breadcrumbs } from '../../seo';
import type { Metadata } from "next";
import WebsiteDesigner from "./website-designer";
import "../workbench.css";
export const metadata: Metadata = withPageMetadata({alternates: { canonical: "/tools/website-ontwerp-tool" }}, '/tools/website-ontwerp-tool');
export default function Page() {
  return <><Breadcrumbs items={[{name:'Home',path:'/'},{name:'Tools & checks',path:'/tools'},{name:'Ontwerp je website',path:'/tools/website-ontwerp-tool'}]}/><WebsiteDesigner /></>;
}
