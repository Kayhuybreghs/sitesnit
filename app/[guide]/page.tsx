import { notFound } from 'next/navigation';
import { guides } from '../../lib/guides';
import GuidePage from '../guide-page';
import { withPageMetadata } from '../seo';

export function generateStaticParams() { return guides.map(g=>({guide:g.slug})); }
export async function generateMetadata({params}:{params:Promise<{guide:string}>}) {
  const {guide:slug} = await params;
  const guide = guides.find(g=>g.slug===slug);
  if (!guide) notFound();
  return withPageMetadata({title:guide.title,description:guide.description},`/${slug}`);
}
export default async function Page({params}:{params:Promise<{guide:string}>}) {
  const {guide:slug} = await params;
  const guide = guides.find(g=>g.slug===slug);
  if (!guide) notFound();
  return <GuidePage guide={guide}/>;
}
