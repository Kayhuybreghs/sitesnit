import 'server-only';
import {hubSession} from '../hub/session';
import {isHubAdmin} from '../hub/access';

export async function isAuditAdmin(headers:Headers){
 if(!headers.get('cookie')?.includes('sitesnit-hub'))return false;
 try{const context=await hubSession(headers);return !!context&&await isHubAdmin(context.runtime.connection.db,context.user);}catch{return false;}
}
