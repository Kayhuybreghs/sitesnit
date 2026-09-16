import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { runtime } from '../lib/server';
import { indexingAllowed } from '../lib/seo-policy';
import { socialImages } from '../lib/social-images';
import { site } from './site-data';
import { pageSeo } from './page-seo-data';

export async function canIndexRequest() {
  return indexingAllowed(runtime().SITESNIT_INDEXING_ENABLED, (await headers()).get('host'));
}

export function withPageMetadata(metadata: Metadata, path: string): Metadata {
  metadata = { ...metadata, ...pageSeo[path] };
  const title = typeof metadata.title === 'string' ? metadata.title :
    metadata.title && 'absolute' in metadata.title ? metadata.title.absolute : site.name;
  const socialTitle = title.includes('Sitesnit') ? title : `${title} | Sitesnit`;
  const image = socialImages[path];
  const images = image ? [{ ...image, url: site.origin + image.url, type: 'image/png' }] : [];
  return {
    ...metadata,
    title: { absolute: socialTitle },
    alternates: { ...metadata.alternates, canonical: path },
    openGraph: {
      type: 'website', locale: 'nl_NL', siteName: site.name,
      title: socialTitle, description: metadata.description || undefined,
      url: site.origin + path,
      images,
    },
    twitter: { card: image ? 'summary_large_image' : 'summary', title: socialTitle, description: metadata.description || undefined, images },
  };
}

export function JsonLd({ data }: { data: Record<string, unknown> }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{__html: JSON.stringify(data).replace(/</g, '\\u003c')}} />;
}

export function BreadcrumbData({ items }: { items: { name: string; path: string }[] }) {
  const path = items[items.length - 1].path;
  return <><PageData path={path} breadcrumb /> <JsonLd data={{
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    '@id': `${site.origin}${path}#breadcrumb`,
    itemListElement: items.map((item,index) => ({'@type':'ListItem',position:index+1,name:item.name,item:site.origin+item.path})),
  }} /></>;
}

export function PageData({ path, breadcrumb = false }: { path: string; breadcrumb?: boolean }) {
  const content = pageSeo[path];
  if (!content) return null;
  const url = site.origin + (path === '/' ? '' : path);
  const image = socialImages[path];
  const isTool = ['/websitecheck', '/prijscheck'].includes(path) || path.startsWith('/tools/');
  const isCase = path.startsWith('/projecten/');
  const isService = path === '/webdesign-venlo' || (path.startsWith('/diensten/') && path !== '/diensten/webdesign/pakketten');
  const type = path === '/contact' ? 'ContactPage' : path === '/over-sitesnit' ? 'AboutPage' :
    ['/diensten', '/projecten', '/tools'].includes(path) ? 'CollectionPage' : 'WebPage';
  const entityId = isTool ? `${url}#tool` : isCase ? `${url}#work` : isService ? `${url}#service` : path === '/kosten' ? `${url}#websitepakketten` : path === '/over-sitesnit' ? `${site.origin}/#kay` : undefined;
  return <>
    <JsonLd data={{
      '@context': 'https://schema.org', '@type': type, '@id': `${url}#webpage`,
      url, name: content.title, description: content.description, inLanguage: 'nl-NL',
      isPartOf: { '@id': `${site.origin}/#website` },
      publisher: { '@id': `${site.origin}/#organization` },
      ...(breadcrumb ? { breadcrumb: { '@id': `${url}#breadcrumb` } } : {}),
      ...(entityId ? { mainEntity: { '@id': entityId } } : {}),
      ...(image ? { primaryImageOfPage: { '@type': 'ImageObject', url: site.origin + image.url, width: image.width, height: image.height, caption: image.alt } } : {}),
    }} />
    {isTool && <JsonLd data={{
      '@context': 'https://schema.org', '@type': 'WebApplication', '@id': entityId,
      name: content.title, description: content.description, url, applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web browser', inLanguage: 'nl-NL', isAccessibleForFree: true,
      provider: { '@id': `${site.origin}/#organization` },
    }} />}
    {isCase && <JsonLd data={{
      '@context': 'https://schema.org', '@type': 'CreativeWork', '@id': entityId,
      name: content.title, description: content.description, url, inLanguage: 'nl-NL',
      creator: { '@id': `${site.origin}/#organization` },
      mainEntityOfPage: { '@id': `${url}#webpage` },
    }} />}
  </>;
}

export function Breadcrumbs({ items }: { items: { name: string; path: string }[] }) {
  return <>
    <nav className="wrap seo-breadcrumb" aria-label="Broodkruimel"><ol>{items.map((item,index) =>
      <li key={item.path}>{index === items.length-1 ? <span aria-current="page">{item.name}</span> : <a href={item.path}>{item.name}</a>}</li>
    )}</ol></nav>
    <BreadcrumbData items={items}/>
  </>;
}
