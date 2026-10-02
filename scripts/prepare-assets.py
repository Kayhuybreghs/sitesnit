"""Offline validation of existing checked-in fonts; no image import or font download."""
from pathlib import Path
import hashlib
import json
root = Path(__file__).resolve().parents[1]
records = []
for name in ('manrope', 'instrument-serif', 'instrument-serif-italic'):
    font = root / 'public/fonts' / (name + '.woff2')
    data = font.read_bytes()
    if data[:4] != b'wOF2':
        raise ValueError('Invalid local WOFF2 font: ' + name)
    records.append({'file': str(font.relative_to(root)), 'sha256': hashlib.sha256(data).hexdigest()})
print(json.dumps({'mode': 'offline-validation-only', 'fonts': records}))
