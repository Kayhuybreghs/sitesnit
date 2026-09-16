import CheckTool from "../check-tool";
import { canIndexRequest, withPageMetadata, Breadcrumbs } from '../seo';
export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const s = await searchParams;
  return withPageMetadata({alternates: { canonical: "/prijscheck" }, robots: { index: !s.resultaat && await canIndexRequest(), follow: true }}, '/prijscheck');
}
export default function Prijscheck() {
  return <><Breadcrumbs items={[{name:'Home',path:'/'},{name:'Tools & checks',path:'/tools'},{name:'Prijscheck',path:'/prijscheck'}]}/><CheckTool kind="prijscheck" /></>;
}
