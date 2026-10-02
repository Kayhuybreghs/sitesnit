/** Navigation graph, independent of a sitemap or a crawler's initial seed list. */
export function analyzeReachability(paths, links, origin = 'https://www.sitesnit.nl') {
  const graph = new Map(paths.map(p => [p,new Set()])), incoming = new Map(paths.map(p => [p,new Set()]));
  for (const link of links) {
    try {
      const source = new URL(link.source,origin).pathname;
      const destination = new URL(link.href,origin + source);
      if (destination.origin !== origin || !graph.has(source) || !graph.has(destination.pathname) || source === destination.pathname) continue;
      graph.get(source).add(destination.pathname); incoming.get(destination.pathname).add(source);
    } catch { /* Invalid hrefs are errors in the existing route checker. */ }
  }
  const reachable = new Set(), shortestPaths = {}, queue = graph.has('/') ? ['/'] : [];
  shortestPaths['/'] = ['/'];
  for (let index = 0; index < queue.length; index++) {
    const item = queue[index]; reachable.add(item);
    for (const next of graph.get(item)) if (!shortestPaths[next]) {shortestPaths[next]=[...shortestPaths[item],next];queue.push(next);}
  }
  // Tarjan distinguishes isolated mutually linked islands from zero-incoming pages.
  let number=0;const indices=new Map(),low=new Map(),stack=[],active=new Set(),components=[];
  function visit(item) {
    indices.set(item,number);low.set(item,number++);stack.push(item);active.add(item);
    for (const next of graph.get(item)) {
      if (!indices.has(next)) {visit(next);low.set(item,Math.min(low.get(item),low.get(next)));}
      else if(active.has(next))low.set(item,Math.min(low.get(item),indices.get(next)));
    }
    if(low.get(item)===indices.get(item)){const group=[];let member;do{member=stack.pop();active.delete(member);group.push(member);}while(member!==item);components.push(group.sort());}
  }
  for (const item of paths) if(!indices.has(item))visit(item);
  const unreachable=paths.filter(p=>!reachable.has(p)),orphans=paths.filter(p=>p!=='/'&&!incoming.get(p).size);
  return {entry:'/',reachableCount:reachable.size,unreachable,orphans,isolatedGroups:components.filter(group=>group.length>1&&group.every(p=>!reachable.has(p))),shortestPaths,incoming:Object.fromEntries([...incoming].map(([p,set])=>[p,[...set].sort()])),failures:unreachable.map(path=>({code:'not-reachable-from-home',path,expected:'visitor path from /',actual:incoming.get(path).size?'isolated navigation group':'no incoming link'}))};
}
