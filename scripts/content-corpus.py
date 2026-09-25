"""Local-only rendered HTML inventory. Similarity findings are review flags, not SEO scores."""
import hashlib,json,re,itertools
from pathlib import Path
from html.parser import HTMLParser
from urllib.request import urlopen,Request
from urllib.error import HTTPError
from urllib.parse import urlsplit,unquote

ROOT=Path('reports/content-corpus'); ROOT.mkdir(parents=True,exist_ok=True)
ORIGIN='http://127.0.0.1:5184'
VOID={'img','input','br','hr','meta','link','source','wbr','area','base','col','embed','param','track'}
class Main(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True); self.stack=[];self.text=[];self.links=[];self.paragraphs=[];self.headings=[]
    def handle_starttag(self,tag,attrs):
        attrs=dict(attrs);main=tag=='main' or any(n['main'] for n in self.stack)
        shared_classes={'guide-next','tool-help','experience-closing','cta-section','contact-form','tool-contact'}
        exclude=tag in ('nav','aside','footer','script','style','noscript') or 'data-quality-shared' in attrs or bool(shared_classes&set(attrs.get('class','').split())) or any(n['exclude'] for n in self.stack)
        node={'tag':tag,'main':main,'exclude':exclude,'text':[]}
        if main and tag=='a' and attrs.get('href','').startswith('/'):
            self.links.append(urlsplit(attrs['href']).path)
        if tag not in VOID:self.stack.append(node)
    def handle_data(self,text):
        if self.stack and self.stack[-1]['main'] and not self.stack[-1]['exclude']:
            self.text.append(text)
            for n in self.stack:n['text'].append(text)
    def handle_endtag(self,tag):
        indices=[i for i,n in enumerate(self.stack) if n['tag']==tag]
        if not indices:return
        i=indices[-1];node=self.stack[i];text=' '.join(''.join(node['text']).split())
        if node['main'] and not node['exclude'] and text:
            if tag=='p':self.paragraphs.append(text)
            if tag in ('h1','h2','h3'):self.headings.append(text)
        self.stack=self.stack[:i]
def normalize(value):return ' '.join(re.findall(r'[\w]+',value.lower()))
def shingles(value):
    words=normalize(value).split();return set(tuple(words[i:i+5]) for i in range(max(0,len(words)-4)))
catalog=json.loads(Path('.sites-runtime/route-catalog.json').read_text())
records=[];errors=[]
for item in catalog:
    path=item['path'];file=path.strip('/').replace('/','__') or 'home'
    try:
        with urlopen(Request(ORIGIN+path,headers={'User-Agent':'SitesnitLocalContentReview/2'}),timeout=60) as response:
            status=response.status;html=response.read().decode('utf-8')
    except HTTPError as e:status=e.code;html=e.read().decode('utf-8')
    parser=Main();parser.feed(html);text=' '.join(' '.join(parser.text).split());norm=normalize(text)
    (ROOT/(file+'.html')).write_text(html,encoding='utf-8');(ROOT/(file+'.txt')).write_text(text,encoding='utf-8')
    (ROOT/(file+'.normalized.txt')).write_text(norm,encoding='utf-8')
    if status!=200:errors.append({'path':path,'error':f'HTTP {status}'})
    records.append({'path':path,'status':status,'hash':hashlib.sha256(norm.encode()).hexdigest(),'words':len(norm.split()),'headings':parser.headings,'paragraphs':parser.paragraphs,'links':sorted(set(parser.links)),'shingles':shingles(text)})
paths={r['path'] for r in records}
for r in records:r['incoming']=[other['path'] for other in records if other['path']!=r['path'] and r['path'] in other['links']]
pairs=[]
for a,b in itertools.combinations(records,2):
    union=a['shingles']|b['shingles'];similarity=len(a['shingles']&b['shingles'])/len(union) if union else 0
    shared=sorted(set(a['paragraphs'])&set(b['paragraphs']))
    if similarity>.08 or any(len(p)>100 for p in shared):pairs.append({'a':a['path'],'b':b['path'],'shingleSimilarity':round(similarity,4),'sharedParagraphs':shared,'disposition':'needs_context_review'})
for r in records:del r['shingles']
report={'method':'Actual local SSR main text, excluding navigation/aside/footer/script/style and marked shared blocks. No ranking score or automatic originality approval.','records':records,'similarityFlags':sorted(pairs,key=lambda p:-p['shingleSimilarity']),'errors':errors}
Path('reports/content-corpus.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
Path('reports/internal-linkmap.json').write_text(json.dumps([{k:r[k] for k in ['path','links','incoming']} for r in records],ensure_ascii=False,indent=2),encoding='utf-8')
manifest=json.loads(Path('reports/content-manifest.json').read_text())
for m in manifest:
    r=next(r for r in records if r['path']==m['path']);m['renderedHash']=r['hash'];m['incoming']=r['incoming']
    m['technicalStatus']='pass' if r['status']==200 and r['incoming'] else 'fail'
    m['similarityStatus']='needs_review' if any(m['path'] in [p['a'],p['b']] for p in pairs) else 'manual_review_still_required'
    Path('reports/content-review/'+m['id']+'.json').write_text(json.dumps(m,ensure_ascii=False,indent=2),encoding='utf-8')
Path('reports/content-manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'pages':len(records),'errors':errors,'newArticleOrphans':[m['path'] for m in manifest if not m['incoming']],'similarityPairsForReview':len(pairs)},ensure_ascii=False))
