import {contactConnection,contactMailConfig} from '../../../../lib/contact/runtime';
import {dispatchContactResponse} from '../../../../lib/contact/dispatch';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function POST(request:Request){
  return dispatchContactResponse(request,{secret:process.env.CRON_SECRET,config:contactMailConfig(),connection:contactConnection});
}
