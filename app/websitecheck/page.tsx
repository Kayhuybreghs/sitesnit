import CheckTool from "../check-tool";
import { canIndexRequest, withPageMetadata, Breadcrumbs } from '../seo';
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const s = await searchParams;
  return withPageMetadata({alternates: { canonical: "/tools/website-check" }, robots: { index: !s.resultaat && await canIndexRequest(), follow: true }}, '/tools/website-check');
}
export default function Websitecheck() {
  return <><Breadcrumbs items={[{name:'Home',path:'/'},{name:'Tools & checks',path:'/tools'},{name:'Websitecheck',path:'/tools/website-check'}]}/><CheckTool kind="websitecheck" /></>;
}
