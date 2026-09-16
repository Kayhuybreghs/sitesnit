"""Integrate reviewed assets; no network calls. Preserve originals outside the public build."""
import json, shutil, hashlib, subprocess
from pathlib import Path
from PIL import Image, ImageOps

root=Path(__file__).resolve().parents[1]
support=root.parent/'sitesnit-support/og-assets'
out=root/'public/og'
out.mkdir(exist_ok=True)
records={}
# Rebuild the six final code-designed images before the legacy asset imports.
subprocess.run(['node', str(root/'scripts/render-extra-og.cjs')], check=True)
subprocess.run(['node', str(root/'scripts/render-final-og.cjs')], check=True)
subprocess.run(['node', str(root/'scripts/render-apps-og.cjs')], check=True)
final_assets={x['slug']:x for x in json.loads((root/'scripts/og-final-manifest.json').read_text(encoding='utf-8'))}

def record(route,target,alt,source):
    with Image.open(target) as im: width,height=im.size
    records[route]={'url':'/'+target.relative_to(root/'public').as_posix(),'width':width,'height':height,'alt':alt}
    return {'route':route,**records[route],'bytes':target.stat().st_size,'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'source':str(source.relative_to(root.parent))}
manifest=[]
def asset(route,group,slug,alt):
    if slug in final_assets:
        item=final_assets[slug]; target=root/'public'/item['url'].lstrip('/')
        manifest.append(record(item['route'],target,item['alt'],target))
        return
    source=support/group/(slug+'.png')
    target=out/(slug+'.png')
    shutil.copyfile(source,target)
    manifest.append(record(route,target,alt,source))

main={'diensten':'Diensten: webdesign, vindbaarheid en automatisering in één overzicht',
      'kosten':'De Sitesnit-pakketten: één pagina €895, vijf pagina’s €1.895, maatwerk vanaf €2.750',
      'contact':'Een belafspraak met Sitesnit, op werkdagen van 18:00 tot 21:30 of in het weekend',
      'over-sitesnit':'Sitesnit: persoonlijk webdesign met aandacht voor merk, inhoud en techniek',
      'projecten':'Websites Beurswijzer en Beurswatcher, ontworpen en gebouwd door Sitesnit',
      'tools':'Sitesnit-tools voor je website, investering en bedrijfsprocessen',
      'webdesign-venlo':'Sitesnit: webdesign voor ondernemers in Venlo, vanuit Baarlo'}
for slug,alt in main.items(): asset('/'+slug,'page-cards',slug,alt)
services={'webdesign':'Een website met je eigen gezicht, op desktop en mobiel',
 'webshops':'Voorbeeld van een webshop met overzichtelijke productpresentatie',
 'branding':'Merkontwerp: karaktervolle typografie en samenhangende kleuren',
 'seo':'Van een zoekvraag naar een passende pagina en contact',
 'seo-optimalisatie':'Voorbeeld van een duidelijke paginatitel en vindbare inhoud',
 'content':'Redactionele inhoud en copywriting voor je website',
 'social-media':'Voorbeeld van samenhangende socialmediaberichten',
 'onderhoud-hosting':'Hosting en onderhoud: website en beheer in samenhang',
 'ai-automatisering':'Voorbeeldproces: van binnenkomend document naar gecontroleerd factuurconcept',
 'ai-koppelingen':'Softwarekoppelingen verbinden informatie tussen je systemen',
 'formulieren-rekentools':'Van invoer naar inzicht met een formulier of rekentool'}
for slug,alt in services.items(): asset('/diensten/'+slug,'service-cards',slug,alt)
tools={'websitecheck':'Websitecheck: 15 inhoudelijke vragen en een mobiele Lighthouse-analyse',
 'prijscheck':'Prijscheck: je wensen verbinden aan een passend websitepakket',
 'ontwerp-je-website':'Een eigen websitevoorbeeld samenstellen met inhoud, stijl en kleuren',
 'offertevergelijker':'Websiteoffertes vergelijken op werkzaamheden en totale bekende kosten',
 'automatiseringsplan':'Je herhaalwerk in kaart brengen en een eerste proces kiezen'}
for slug,alt in tools.items(): asset(('/' if slug.endswith('check') else '/tools/')+slug,'tool-cards',slug,alt)
asset('/privacy','core-cards','privacy','Sitesnit: zorgvuldig omgaan met je gegevens')
asset('/diensten/webdesign/pakketten','core-cards','pakketten','Onepager, vijf pagina’s en maatwerk: de websitepakketten uitgelegd')

source=support/'core-cards/home.png'
target=root/'public/og.png'
shutil.copyfile(source,target)
manifest.append(record('/',target,'Sitesnit — websites met een eigen gezicht. Webdesign, SEO en AI vanuit Baarlo.',source))
cases=[('beurswijzer','Beurswijzer-case: een eigen groene compositie rond maandruimte en toekomst'),
       ('beurswatcher','Beurswatcher-case: een blauwgele compositie rond inleg, looptijd en scenario’s'),
       ('atelier-vorm','Concept Atelier Vorm: een grafisch ontworpen stoel voor een denkbeeldig interieurmerk'),
       ('studio-matcha','Concept Studio Matcha: een grafische matchabeker voor een denkbeeldige matchabar'),
       ('buiten-gewoon','Concept Buiten Gewoon: een lijnillustratie voor een denkbeeldige architectuurstudio')]
for slug,alt in cases: asset('/projecten/'+slug,'core-cards',slug,alt)
for slug in ['algemene-voorwaarden','cookies','webapps']: asset(final_assets[slug]['route'],'',slug,final_assets[slug]['alt'])
apps_image=json.loads((root/'reports/seo/og-apps-manifest.json').read_text(encoding='utf-8'))
apps_target=root/'public/og/apps.png'
manifest.append(record(apps_image['route'],apps_target,apps_image['alt'],apps_target))
(root/'lib/social-images.ts').write_text('// Reviewed static sharing assets. Regenerate with scripts/prepare-social-images.py.\nexport const socialImages: Record<string, { url: string; width: number; height: number; alt: string }> = '+json.dumps(records,ensure_ascii=False,indent=2)+';\n',encoding='utf-8')
report=root/'reports/seo'; report.mkdir(parents=True,exist_ok=True)
(report/'social-images.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2),encoding='utf-8')
print(json.dumps({'images':len(records),'bytes':sum(x['bytes'] for x in manifest)}))
