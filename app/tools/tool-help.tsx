import { toolReading } from '../../lib/tool-reading';
import { Arrow } from '../ui';
import './tool-directory.css';

export function ToolHelp({group}:{group:string}) {
  const items=toolReading.filter(guide=>guide.group===group);
  return <section className="wrap tool-reading-choice"><div><span className="eyebrow">Een vraag voor je verdergaat?</span><h2>Pak de uitleg die je nodig hebt.</h2><p>Je kunt de tool direct gebruiken. Deze artikelen helpen bij de keuzes erachter.</p></div><div>{items.map(guide=><details key={guide.id}><summary>{guide.title}</summary><p>{guide.outcome}</p><a href={`/${guide.slug}`}>Lees: {guide.title}<Arrow/></a></details>)}</div></section>;
}
