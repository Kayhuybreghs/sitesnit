import { withPageMetadata, Breadcrumbs } from '../../seo';
import type { Metadata } from "next";
import OfferComparer from "./offer-comparer";
import "../workbench.css";
export const metadata: Metadata = withPageMetadata({alternates: { canonical: "/tools/website-offerte-vergelijken" }}, '/tools/website-offerte-vergelijken');
export default function Page() {
  return <><Breadcrumbs items={[{name:'Home',path:'/'},{name:'Tools & checks',path:'/tools'},{name:'Offertevergelijker',path:'/tools/website-offerte-vergelijken'}]}/><OfferComparer /></>;
}
