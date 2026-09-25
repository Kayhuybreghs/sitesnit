import {timingSafeEqual} from 'node:crypto';
export const privateHeaders={'Cache-Control':'private, no-store','X-Robots-Tag':'noindex, nofollow'};
export function hubJson(body:unknown,status=200){return Response.json(body,{status,headers:privateHeaders});}
export function sameHubOrigin(request:Request,baseURL:string){return request.headers.get('origin')===new URL(baseURL).origin&&request.headers.get('content-type')?.startsWith('application/json');}
export function validJobSecret(request:Request,secret:string|undefined){if(!secret||secret.length<32)return false;const received=Buffer.from(request.headers.get('authorization')||'');const expected=Buffer.from(`Bearer ${secret}`);return received.length===expected.length&&timingSafeEqual(received,expected);}
