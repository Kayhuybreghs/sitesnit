from pathlib import Path
from PIL import Image
import urllib.request,re
root=Path(__file__).resolve().parents[1]
src=Path(r'C:/Users/Gebruiker/.codex/visualizations/2026/09/13/01a099bf-a28b-76f1-9ca9-d46b7cbaa74c')
out=root/'public/images';out.mkdir(parents=True,exist_ok=True)
for name,filename in [('chair','oak-chair'),('matcha','matcha'),('architecture','architecture')]:
 im=Image.open(src/f'sitesnit-concept-{filename}.png').convert('RGB')
 for w in (240,480,640,960,1536):im.resize((w,round(w*im.height/im.width)),Image.Resampling.LANCZOS).save(out/f'{name}-{w}.webp',quality=84)
fonts=root/'public/fonts';fonts.mkdir(parents=True,exist_ok=True)
for name,q in [('manrope','Manrope:wght@200..800'),('instrument-serif','Instrument+Serif'),('instrument-serif-italic','Instrument+Serif:ital@1')]:
 req=urllib.request.Request(f'https://fonts.googleapis.com/css2?family={q}&display=swap',headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'})
 css=urllib.request.urlopen(req).read().decode()
 urls=re.findall(r'url\((https://[^)]+)\)',css)
 urllib.request.urlretrieve(urls[-1],fonts/f'{name}.woff2')
 (fonts/f'{name}-source.css').write_text(css)
print('Prepared 9 WebP images and 3 local fonts')
