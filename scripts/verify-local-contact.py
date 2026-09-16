"""Read only the synthetic contact record created during local browser QA."""
from pathlib import Path
import json, sqlite3
found=[]
for file in Path('.wrangler/state').rglob('*.sqlite'):
    db=sqlite3.connect(file.resolve().as_uri()+'?mode=ro',uri=True)
    try:
        rows=db.execute("SELECT id, message, tool_summary FROM inquiries WHERE name=? AND email=?",('Sitesnit lokale QA','sitesnit-test@example.com')).fetchall()
        for identifier,message,summary in rows:
            found.append({'id':identifier,'saved':True,'updatedDesignIncluded':'Teststudio Noord aangepast' in (summary or ''),'answersIncluded':'Interieuradvies, Lichtplan, Styling' in (summary or ''),'callPreferenceIncluded':'Zaterdag' in message})
    except sqlite3.OperationalError: pass
    finally: db.close()
assert found and all(r['updatedDesignIncluded'] and r['answersIncluded'] and r['callPreferenceIncluded'] for r in found)
Path('reports/seo/contact-local-result.json').write_text(json.dumps({'records':found,'scope':'Local D1 only. No e-mail sent and no production inquiry created.'},indent=2))
print(json.dumps(found))
