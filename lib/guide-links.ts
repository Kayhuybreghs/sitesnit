export type AuthoredLink = {phrase:string;href:string};
export type GuideTextPart = {text:string;href?:string};

/** Literal editorial links, each at most once. Earliest match wins; longest wins a tie. */
export function guideTextParts(text:string, links:readonly AuthoredLink[]=[]):GuideTextPart[] {
  const parts:GuideTextPart[]=[];
  const remaining=links.filter(link=>link.phrase.length>0);
  let cursor=0;
  while(cursor<text.length){
    const next=remaining.map((link,index)=>({link,index,start:text.indexOf(link.phrase,cursor)}))
      .filter(match=>match.start>=0).sort((a,b)=>a.start-b.start||b.link.phrase.length-a.link.phrase.length)[0];
    if(!next){parts.push({text:text.slice(cursor)});break;}
    if(next.start>cursor)parts.push({text:text.slice(cursor,next.start)});
    parts.push({text:next.link.phrase,href:next.link.href});
    cursor=next.start+next.link.phrase.length;
    remaining.splice(next.index,1);
  }
  return parts;
}
