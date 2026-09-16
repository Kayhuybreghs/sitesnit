import { withPageMetadata, Breadcrumbs } from '../../seo';
import type { Metadata } from "next";
import AutomationPlanner from "./automation-planner";
import "../workbench.css";
export const metadata: Metadata = withPageMetadata({alternates: { canonical: "/tools/automatiseringsplan" }}, '/tools/automatiseringsplan');
export default function Page() {
  return <><Breadcrumbs items={[{name:'Home',path:'/'},{name:'Tools & checks',path:'/tools'},{name:'Automatiseringsplan',path:'/tools/automatiseringsplan'}]}/><AutomationPlanner /></>;
}
