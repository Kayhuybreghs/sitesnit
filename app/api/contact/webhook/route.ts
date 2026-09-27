import {contactConnection} from '../../../../lib/contact/runtime';
import {recordContactWebhook} from '../../../../lib/contact/webhook';
import {readTextBody} from '../../../../lib/request-body';
export const runtime='nodejs';
export async function POST(request:Request){
  const headers={'Cache-Control':'no-store','X-Robots-Tag':'noindex, nofollow'};
  const secret=process.env.RESEND_CONTACT_WEBHOOK_SECRET;
  if(!secret) return Response.json({error:'Webhook not configured'},{status:503,headers});
  try {
    const raw=await readTextBody(request,65536);
    return Response.json({ok:true,...await recordContactWebhook(await contactConnection(),raw,request.headers,secret)},{headers});
  } catch {return Response.json({error:'Webhook not accepted'},{status:400,headers});}
}
