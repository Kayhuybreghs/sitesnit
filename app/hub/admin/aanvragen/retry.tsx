'use client';
import {useRef,useState} from 'react';
export function RetryMail({taskId,manual}:{taskId:string;manual:boolean}){
  const [busy,setBusy]=useState(false),[error,setError]=useState('');const flight=useRef(false);
  return <form onSubmit={async e=>{e.preventDefault();if(flight.current)return;flight.current=true;setBusy(true);setError('');const data=new FormData(e.currentTarget);const checked=data.get('checked')==='yes';const providerId=String(data.get('providerId')||'').trim();try{const response=await fetch('/api/hub/contact-mail',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:providerId?'reconcile':'retry',taskId,providerId,confirmedNotSent:checked})});const result=await response.json() as {error?:string};if(!response.ok)throw new Error(result.error);location.reload();}catch(e){setError(e instanceof Error?e.message:'Herstel niet uitgevoerd.');}finally{flight.current=false;setBusy(false);}}}>
    {manual&&<label><input type="checkbox" name="checked" value="yes"/> Ik heb de Resend-log gecontroleerd: dit bericht is niet verstuurd. Opnieuw aanbieden na het beveiligde herhaalvenster kan anders een dubbele mail veroorzaken.</label>}
    {manual&&<label>Of: provider-ID van een al verstuurd bericht <input name="providerId" placeholder="ID uit de Resend-log" maxLength={100}/><small>Sitesnit vergelijkt ontvanger en volledige berichtinhoud voordat de status wordt aangepast.</small></label>}
    <button className="button" disabled={busy}>{busy?'Verwerken…':'Controleer mailstatus'}</button>{error&&<p role="alert">{error}</p>}
  </form>;
}
