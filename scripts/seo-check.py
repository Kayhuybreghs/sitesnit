"""Crawl original HTML, not a browser-mutated DOM. Only explicit localhost previews."""
import csv, hashlib, json, os, re, sys
from collections import Counter, deque
from datetime import datetime, timezone
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, urljoin, unquote
from urllib.request import Request, urlopen
from urllib.error import HTTPError

origin = os.environ.get('SEO_ORIGIN', 'http://127.0.0.1:5184').rstrip('/')
if urlsplit(origin).hostname not in ('127.0.0.1', 'localhost'):
    raise SystemExit('This script is limited to the local preview; production checks require separate approval.')
phase = sys.argv[1] if len(sys.argv) > 1 else 'after'
if not phase.replace('-', '').isalnum(): raise SystemExit('Invalid report phase')
folder = Path('reports/seo') / phase
folder.mkdir(parents=True, exist_ok=True)
catalog = json.loads(Path('.sites-runtime/route-catalog.json').read_text(encoding='utf-8'))
facts = json.loads(Path('.sites-runtime/seo-facts.json').read_text(encoding='utf-8'))
if phase == 'before': catalog = [r for r in catalog if r['path'] != '/webdesign-venlo']
VOID = {'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}

class Document(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack=[]; self.meta={}; self.title=[]; self.h1=[]; self.ids=[]; self.links=[]
        self.images=[]; self.jsonld=[]; self.resources=[]; self.lang=''; self.main_text=[]
    def handle_starttag(self, tag, attrs):
        a=dict(attrs); ancestors=[x['tag'] for x in self.stack]
        item={'tag':tag,'attrs':a,'text':[]}
        if tag == 'html': self.lang=a.get('lang','')
        if a.get('id'): self.ids.append(a['id'])
        if tag == 'meta': self.meta.setdefault(a.get('name',a.get('property','')),[]).append(a.get('content',''))
        if tag == 'link' and a.get('rel') == 'canonical': self.meta.setdefault('canonical',[]).append(a.get('href',''))
        if tag == 'img': self.images.append(a)
        if tag in ('img','script') and a.get('src'): self.resources.append(a['src'])
        if tag == 'link' and a.get('rel') in ('stylesheet','preload','icon'): self.resources.append(a.get('href',''))
        if tag == 'a':
            placement='noscript' if 'noscript' in ancestors else 'footer' if 'footer' in ancestors else 'header' if 'header' in ancestors else 'main' if 'main' in ancestors else 'other'
            if any(x['attrs'].get('aria-label') == 'Broodkruimel' for x in self.stack): placement='breadcrumb'
            item['link']={'href':a.get('href',''),'label':a.get('aria-label',''),'placement':placement}
        if tag not in VOID: self.stack.append(item)
    def handle_startendtag(self,tag,attrs):
        self.handle_starttag(tag,attrs)
        if tag not in VOID: self.handle_endtag(tag)
    def handle_data(self,data):
        for x in self.stack: x['text'].append(data)
        if any(x['tag']=='main' for x in self.stack) and not any(x['tag'] in ('script','style') for x in self.stack): self.main_text.append(data)
    def handle_endtag(self,tag):
        index=next((i for i in range(len(self.stack)-1,-1,-1) if self.stack[i]['tag']==tag),None)
        if index is None: return
        for item in self.stack[index:]:
            text=' '.join(''.join(item['text']).split())
            if item['tag']=='title': self.title.append(text)
            if item['tag']=='h1': self.h1.append(text)
            if item['tag']=='a':
                item['link']['label']=item['link']['label'] or text
                self.links.append(item['link'])
            if item['tag']=='script' and item['attrs'].get('type')=='application/ld+json':
                try: self.jsonld.append(json.loads(''.join(item['text'])))
                except ValueError: self.jsonld.append({'INVALID_JSON':True})
        self.stack=self.stack[:index]

def fetch(path):
    request=Request(urljoin(origin+'/',path),headers={'User-Agent':'SitesnitLocalSeoAudit/1.0'})
    try:
        with urlopen(request,timeout=35) as response: return response.status, dict(response.headers), response.read(), response.url
    except HTTPError as e: return e.code,dict(e.headers),e.read(),e.url

def native_build_snapshot():
    """Identify native artifacts only. Older dist-hashed reports stay historical."""
    artifact = Path('.next/server/app/page.js')
    try:
        build_id = Path('.next/BUILD_ID').read_text(encoding='utf-8').strip()
        if not re.fullmatch(r'[A-Za-z0-9_-]{1,128}', build_id): raise ValueError()
        return {'framework':'nextjs','diskBuildId':build_id,'artifact':artifact.as_posix(),
                'artifactSha256':hashlib.sha256(artifact.read_bytes()).hexdigest()}
    except (OSError, ValueError):
        return {'framework':'nextjs','diskBuildId':None,'artifact':artifact.as_posix(),'artifactSha256':None}

def html_build_ids(html):
    """Decode the Next Flight string chunks as JSON, never execute inline scripts."""
    chunks = []
    for match in re.finditer(r'self\.__next_f\.push\(\[1,("(?:\\.|[^"\\])*")\]\)', html):
        try: chunks.append(json.loads(match.group(1)))
        except ValueError: pass
    return sorted(set(re.findall(r'"b"\s*:\s*"([A-Za-z0-9_-]{1,128})"', ''.join(chunks))))

native_build = native_build_snapshot()
homepage_build_ids = []
docs={}; rows=[]; issues=[]; resources={}; links=[]
def fail(route,message): issues.append({'route':route,'message':message})
for record in catalog:
    route=record['path']; status,headers,body,final=fetch(route)
    html = body.decode('utf-8','replace')
    if route == '/' and status == 200: homepage_build_ids = html_build_ids(html)
    doc=Document(); doc.feed(html); docs[route]=(doc,status)
    (folder / ((route.strip('/').replace('/','__') or 'home')+'.html')).write_bytes(body)
    meta=lambda key: ' | '.join(doc.meta.get(key,[]))
    json_types=[x.get('@type','') for x in doc.jsonld]
    row={**record,'status':status,'title': ' | '.join(doc.title),'description':meta('description'),
         'h1':' | '.join(doc.h1),'h1_count':len(doc.h1),'canonical':meta('canonical'),
         'robots':meta('robots'),'x_robots_tag':headers.get('X-Robots-Tag',''),
         'og_title':meta('og:title'),'og_description':meta('og:description'),'og_image':meta('og:image'),
         'jsonld_types':' | '.join(json_types),'html_bytes':len(body),'original_html_words':len(' '.join(doc.main_text).split()),
         'preview_indexable': 'noindex' not in (meta('robots')+headers.get('X-Robots-Tag',''))}
    rows.append(row)
    if status != 200: fail(route,f'HTTP {status}')
    if len(doc.title)!=1 or not row['title']: fail(route,'Missing or duplicate title')
    if len(doc.meta.get('description',[]))!=1 or not row['description']: fail(route,'Missing or duplicate description')
    if len(doc.h1)!=1: fail(route,f'{len(doc.h1)} H1 headings')
    if doc.lang != 'nl': fail(route,'Incorrect page language')
    if Counter(doc.ids).most_common(1) and Counter(doc.ids).most_common(1)[0][1]>1: fail(route,'Duplicate IDs')
    if any('alt' not in img for img in doc.images): fail(route,'Image missing alt attribute')
    if any(x.get('INVALID_JSON') for x in doc.jsonld): fail(route,'Invalid JSON-LD')
    if phase != 'before':
        page_types = ('WebPage', 'CollectionPage', 'ContactPage', 'AboutPage')
        page_nodes = [x for x in doc.jsonld if x.get('@type') in page_types]
        if len(page_nodes) != 1: fail(route,'Missing or duplicate page-specific JSON-LD')
        for page_node in page_nodes:
            expected_url = facts['origin'] + (route if route != '/' else '')
            if page_node.get('url') != expected_url: fail(route,'Page JSON-LD URL mismatch')
            if page_node.get('description') != row['description']: fail(route,'Page JSON-LD description mismatch')
            if page_node.get('name') != row['title'].removesuffix(' | Sitesnit'): fail(route,'Page JSON-LD title mismatch')
            if page_node.get('inLanguage') != 'nl-NL': fail(route,'Page JSON-LD language mismatch')
            for relation in ('breadcrumb','mainEntity'):
                target_id = page_node.get(relation,{}).get('@id')
                if target_id and not any(x.get('@id') == target_id for x in doc.jsonld): fail(route,'Unresolved page JSON-LD '+relation)
        if route != '/' and not any(x.get('@type') == 'BreadcrumbList' for x in doc.jsonld): fail(route,'Missing page hierarchy')
        canonical_matches = row['canonical'] in ('https://sitesnit.nl','https://sitesnit.nl/') if route=='/' else row['canonical']=='https://sitesnit.nl'+route
        if not canonical_matches: fail(route,'Canonical does not match release URL')
        if row['preview_indexable']: fail(route,'Preview is indexable')
        for key in ('og:title','og:description','og:url','og:image','og:image:alt','twitter:image'):
            if not meta(key): fail(route,'Missing '+key)
        og_matches = meta('og:url') in ('https://sitesnit.nl','https://sitesnit.nl/') if route=='/' else meta('og:url')=='https://sitesnit.nl'+route
        if not og_matches: fail(route,'OG URL mismatch')
        if meta('og:description') != row['description']: fail(route,'OG description mismatch')
        if not row['title'].startswith(meta('og:title').removesuffix(' | Sitesnit')): fail(route,'OG title mismatch')
        if not meta('og:image').startswith('https://sitesnit.nl/'): fail(route,'Untrusted OG image origin')
        for data in doc.jsonld:
            if data.get('@type') in ('Review','AggregateRating','Product','LocalBusiness'): fail(route,'Unapproved schema type')
            if data.get('@type') == 'Organization' and data.get('address',{}).get('addressLocality') != facts['base']: fail(route,'Organization locality mismatch')
            if data.get('@type') == 'BreadcrumbList':
                crumbs=data.get('itemListElement',[])
                if not crumbs or crumbs[-1].get('item') != facts['origin']+route: fail(route,'Breadcrumb current route mismatch')
                if [c.get('position') for c in crumbs] != list(range(1,len(crumbs)+1)): fail(route,'Breadcrumb sequence mismatch')
                if any(urlsplit(c.get('item','')).path not in [r['path'] for r in catalog] for c in crumbs): fail(route,'Breadcrumb points outside route catalog')
            if data.get('@type') == 'OfferCatalog':
                offers=data.get('itemListElement',[])
                if len(offers) != len(facts['packages']): fail(route,'Package catalog length mismatch')
                for offer,p in zip(offers,facts['packages']):
                    value=offer.get('price',offer.get('priceSpecification',{}).get('minPrice'))
                    if value != p['price']: fail(route,'Structured package price mismatch')
        for key in ('og:image','twitter:image'):
            if meta(key): doc.resources.append(urlsplit(meta(key)).path)
    for target in doc.resources:
        if target.startswith('/') and target not in resources:
            rs,rh,rb,rf=fetch(target); resources[target]={'status':rs,'bytes':len(rb),'type':rh.get('Content-Type','')}
            if rs != 200: fail(route,'Broken asset '+target)
    for link in doc.links:
        target=urljoin(origin+route,link['href']); u=urlsplit(target)
        if u.netloc == urlsplit(origin).netloc:
            links.append({'source':route,'target':u.path or '/', 'query':u.query, 'fragment':unquote(u.fragment),
                          'anchor':link['label'],'placement':link['placement']})

for link in links:
    target=link['target']; dest=docs.get(target)
    if not dest:
        st,hd,b,fi=fetch(target); d=Document(); d.feed(b.decode('utf-8','replace')); dest=(d,st); docs[target]=dest
    link['status']=dest[1]
    link['fragment_exists']=not link['fragment'] or link['fragment'] in dest[0].ids
    if dest[1] != 200: fail(link['source'],'Broken internal link: '+target)
    if not link['fragment_exists']: fail(link['source'],'Missing anchor: '+target+'#'+link['fragment'])

depth={'/':0}; queue=deque(['/'])
while queue:
    source=queue.popleft()
    for link in links:
        if link['source']==source and link['target'] not in depth and link['status']==200:
            depth[link['target']]=depth[source]+1; queue.append(link['target'])
for row in rows:
    route=row['path']; row['click_depth']=depth.get(route,'unreachable')
    row['inlinks_main']=sum(1 for l in links if l['target']==route and l['source']!=route and l['placement']=='main')
    if route not in depth: fail(route,'Unreachable from homepage HTML links')
for field in ('title','description'):
    values=Counter(r[field] for r in rows)
    for row in rows:
        if values[row[field]]>1: fail(row['path'],'Duplicate '+field)
if phase != 'before' and len(set(r['og_image'] for r in rows)) != len(rows): fail('all','Sharing image is reused across pages')

checks={}
status,headers,body,final=fetch('/sitesnit-audit-page-does-not-exist')
checks['real_404']=status==404
if not checks['real_404']: fail('/404','Unknown route does not return 404')
status,headers,body,final=fetch('/sitemap.xml')
checks['preview_sitemap_empty']='<loc>' not in body.decode()
if phase!='before' and not checks['preview_sitemap_empty']: fail('/sitemap.xml','Preview sitemap advertises URLs')
status,headers,body,final=fetch('/robots.txt')
checks['robots_can_read_noindex']='Disallow: /\n' not in body.decode()
checks['robots_text']=body.decode()
if phase!='before' and not checks['robots_can_read_noindex']: fail('/robots.txt','Robots blocks reading noindex')
for route in ('/prijscheck?resultaat=1','/websitecheck?resultaat=1','/kosten?utm_source=seo-audit','/contact?pakket=onepager'):
    status,headers,body,final=fetch(route); doc=Document(); doc.feed(body.decode())
    checks[route]={'status':status,'canonical':doc.meta.get('canonical'), 'robots':doc.meta.get('robots')}
    if phase!='before' and (status!=200 or 'noindex' not in ' '.join(doc.meta.get('robots',[]))): fail(route,'Query page is not protected')
status,headers,body,final=fetch('/kosten/')
checks['trailing_slash']={'status':status,'final_url':final}
status,headers,body,final=fetch('/index.html')
checks['index_html_status']=status

def csv_write(name, data):
    with (folder/name).open('w',newline='',encoding='utf-8-sig') as out:
        writer=csv.DictWriter(out,fieldnames=list(data[0]) if data else []); writer.writeheader(); writer.writerows(data)
csv_write('routes.csv',rows); csv_write('internal-links.csv',links)
build_verified = bool(native_build['diskBuildId']) and homepage_build_ids == [native_build['diskBuildId']] and native_build == native_build_snapshot()
native_build.update({'homepageBuildIds':homepage_build_ids,'verified':build_verified,
                     'scope':'Homepage Flight build ID matches BUILD_ID; the native server page entry hash and BUILD_ID stayed unchanged during this crawl. This is not a hash of every dependency or deployment attestation.'})
if not build_verified: fail('__build__','Native Next build identity missing, mismatched, or changed during the crawl; restart the intended build and rerun.')
summary={'phase':phase,'measuredAt':datetime.now(timezone.utc).isoformat(),'origin':origin,
         'builtCodeHash':native_build['artifactSha256'] if build_verified else None,'nativeBuild':native_build,
         'routes':len(rows),'links':len(links),'assets':resources,'issues':issues,'checks':checks,
         'releaseCandidates':[r['path'] for r in catalog if r['releaseCandidate']],
         'note':'Local original-HTML checks of native Next only. Previous dist-hashed reports remain historical. Does not prove public hosting, Google indexing or search rankings.'}
(folder/'summary.json').write_text(json.dumps(summary,ensure_ascii=False,indent=2),encoding='utf-8')
if phase=='after':
    for name in ('routes.csv','internal-links.csv'): (Path('reports/seo')/name).write_bytes((folder/name).read_bytes())
print(json.dumps({'phase':phase,'routes':len(rows),'links':len(links),'issues':issues,'report':str(folder/'summary.json')},ensure_ascii=False))
sys.exit(1 if not build_verified or (issues and phase!='before') else 0)
