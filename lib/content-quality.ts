export type ReviewStatus='draft'|'needs_revision'|'awaiting_owner_facts'|'ready_for_owner_review'|'approved_for_release';
export type ContentReview={
  path:string; status:ReviewStatus; reviewerType:'agent_editorial_review'|'owner';
  contentHash:string; businessHash:string; sourcesHash:string; assetsHash:string;
  technicalStatus:'not_run'|'pass'|'fail'; editorialStatus:'not_run'|'pass'|'revise';
  similarityStatus:'not_run'|'reviewed'|'unresolved'; claimsStatus:'not_run'|'verified'|'unresolved';
  ownerApproved:boolean; evidence:string[]; openIssues:string[];
};
export type CurrentHashes=Pick<ContentReview,'contentHash'|'businessHash'|'sourcesHash'|'assetsHash'>;
export function reviewIsCurrent(review:ContentReview,current:CurrentHashes){
  return (Object.keys(current) as (keyof CurrentHashes)[]).every(key=>review[key]===current[key]&&Boolean(current[key]));
}
/** Readiness never silently turns agent work into owner approval. */
export function reviewBlockers(review:ContentReview,current:CurrentHashes){
  const errors:string[]=[];
  if(!reviewIsCurrent(review,current)) errors.push('Review verouderd door gewijzigde inhoud, bedrijfsfeiten, bronnen of beelden.');
  if(review.technicalStatus!=='pass')errors.push('Technische controle niet geslaagd.');
  if(review.editorialStatus!=='pass')errors.push('Redactionele controle ontbreekt of vraagt revisie.');
  if(review.similarityStatus!=='reviewed')errors.push('Inhoudelijke overlap niet beoordeeld.');
  if(review.claimsStatus!=='verified')errors.push('Claims of bronnen nog niet gecontroleerd.');
  if(!review.evidence.length)errors.push('Review mist herleidbaar bewijs.');
  if(review.openIssues.length)errors.push('Er staan inhoudelijke punten open.');
  return errors;
}
export function releaseApproved(review:ContentReview,current:CurrentHashes){
  return review.status==='approved_for_release'&&review.ownerApproved&&reviewBlockers(review,current).length===0;
}
