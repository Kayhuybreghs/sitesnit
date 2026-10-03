import type {SpeedGuideExample} from '../../../lib/speed-guides';
export function GuideExample({example}:{example:SpeedGuideExample}){return <aside className="speed-guide-example" aria-label={example.title}>
  <p className="eyebrow">Uitgewerkt leesvoorbeeld</p><h3>{example.title}</h3><p><strong>{example.context}</strong></p>
  <div className="speed-example-table" role="table" aria-label={example.title}><div role="row" className="speed-example-head">{example.headers.map(header=><b role="columnheader" key={header}>{header}</b>)}</div>{example.rows.map((row,i)=><div role="row" key={i}>{row.map((cell,j)=><div role="cell" key={j}><span className="speed-example-label" aria-hidden="true">{example.headers[j]}</span>{cell}</div>)}</div>)}</div>
  {example.evidence&&<pre>{example.evidence}</pre>}<h4>Zo ga je verder</h4><ol>{example.steps.map(step=><li key={step}>{step}</li>)}</ol><p>{example.conclusion}</p>
</aside>;}
