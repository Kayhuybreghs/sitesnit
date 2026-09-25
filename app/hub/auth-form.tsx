'use client';
/* eslint-disable @next/next/no-location-assign-relative-destination -- Authentication boundaries deliberately reload the document to discard cached private RSC and client state. */
import {useState,type FormEvent} from 'react';
type Mode='login'|'invite'|'reset'|'enroll'|'verify';
export function HubAuthForm({mode='login',enabled=true,hasResetToken=false}:{mode?:Mode;enabled?:boolean;hasResetToken?:boolean}){
  const [stage,setStage]=useState<'form'|'totp'|'backup'>(mode==='verify'?'totp':'form');const [busy,setBusy]=useState(false);const [message,setMessage]=useState('');const [recovery,setRecovery]=useState<string[]>([]);const [totp,setTotp]=useState('');
  async function send(event:FormEvent<HTMLFormElement>){
    event.preventDefault();const form=new FormData(event.currentTarget);setBusy(true);setMessage('');
    try{
      const params=new URLSearchParams(location.search);let action='sign-in/email';let body:Record<string,unknown>={email:form.get('email'),password:form.get('password')};const headers:Record<string,string>={'Content-Type':'application/json'};
      if(stage==='totp'||stage==='backup'){action=stage==='backup'?'two-factor/verify-backup-code':'two-factor/verify-totp';body={code:form.get('code'),trustDevice:false};}
      else if(mode==='invite'){action='sign-up/email';body={...body,name:form.get('name'),callbackURL:'/hub/login'};headers['x-sitesnit-invitation']=params.get('token')||'';}
      else if(mode==='reset'){const token=params.get('token');action=token?'reset-password':'request-password-reset';body=token?{token,newPassword:form.get('password')}:{email:form.get('email'),redirectTo:'/hub/reset-password'};}
      else if(mode==='enroll'){action='two-factor/enable';body={password:form.get('password')};}
      const response=await fetch(`/api/hub-auth/${action}`,{method:'POST',headers,body:JSON.stringify(body)});const raw:unknown=await response.json();if(!raw||typeof raw!=='object')throw new Error();const data=raw as Record<string,unknown>;
      if(!response.ok)throw new Error();
      if(data.twoFactorRedirect){setStage('totp');return;}
      if(mode==='enroll'&&stage==='form'){setTotp(String(data.totpURI||''));setRecovery(Array.isArray(data.backupCodes)?data.backupCodes.filter((code):code is string=>typeof code==='string'):[]);setStage('totp');return;}
      if(stage!=='form'||mode==='login'){location.assign('/hub');return;}
      setMessage(mode==='invite'?'Bevestig je e-mailadres via het ontvangen bericht. Heb je al een account? Log dan in met je bestaande gegevens.':params.get('token')?'Je wachtwoord is aangepast. Je kunt weer inloggen.':'Als dit e-mailadres bekend is, ontvang je een herstelbericht.');
    }catch{setMessage('Dit is niet gelukt. Controleer je gegevens of tijdelijke code. Blijft dit gebeuren, neem dan contact op met Sitesnit.');}finally{setBusy(false);}
  }
  return <form className="hub-auth-form" onSubmit={send}>
    {!enabled&&<p className="hub-notice">Inloggen wordt beschikbaar zodra Sitesnit de klantomgeving heeft aangesloten. Je kunt je website ondertussen gewoon bespreken.</p>}
    {stage==='form'?<>
      {mode==='invite'&&<label>Je naam<input name="name" autoComplete="name" required maxLength={100}/></label>}
      {mode!=='enroll'&&!(mode==='reset'&&hasResetToken)&&<label>E-mailadres<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>}
      {(mode!=='reset'||hasResetToken)&&<label>{mode==='reset'?'Nieuw wachtwoord':'Wachtwoord'}<input name="password" type="password" autoComplete={mode==='login'||mode==='enroll'?'current-password':'new-password'} required minLength={mode==='invite'||mode==='reset'?12:undefined}/></label>}
      {mode==='invite'&&<p>Gebruik minimaal 12 tekens. Je uitnodiging en e-mailadres bepalen tot welke websites je toegang krijgt.</p>}
    </>:<>
      {totp&&<div className="hub-auth-secret"><p>Voeg Sitesnit Hub toe in je authenticator met deze instelgegevens. Bewaar je herstelcodes op een veilige plek.</p><details><summary>Authenticator instellen</summary><code>{totp}</code></details><details><summary>Eenmalige herstelcodes</summary><ul>{recovery.map(code=><li key={code}><code>{code}</code></li>)}</ul></details></div>}
      <label>{stage==='backup'?'Herstelcode':'Code uit je authenticator'}<input name="code" autoComplete="one-time-code" inputMode={stage==='backup'?'text':'numeric'} required/></label>
    </>}
    <button className="button" disabled={busy||!enabled}>{busy?'Even controleren…':stage!=='form'?'Code controleren':mode==='invite'?'Account aanmaken':mode==='enroll'?'Authenticator instellen':mode==='reset'?'Wachtwoord herstellen':'Inloggen'}</button>
    <p role="status" aria-live="polite">{message}</p>
    {stage==='totp'&&mode!=='enroll'&&<button type="button" className="text-link" onClick={()=>setStage('backup')}>Gebruik een herstelcode</button>}
    <a href={mode==='login'?'/hub/reset-password':'/hub/login'}>{mode==='login'?'Wachtwoord vergeten?':'Terug naar inloggen'}</a>
  </form>;
}
export function HubSignOut(){const [busy,setBusy]=useState(false);return <button className="text-link" disabled={busy} onClick={async()=>{setBusy(true);try{const response=await fetch('/api/hub-auth/sign-out',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(response.ok)location.assign('/hub/login');}finally{setBusy(false);}}}>Uitloggen</button>;}

export function AcceptHubInvitation(){const[message,setMessage]=useState('');const[busy,setBusy]=useState(false);return <div className="hub-auth-form"><p>Voeg deze klantomgeving toe aan je ingelogde account. De uitnodiging moet voor hetzelfde e-mailadres zijn.</p><button className="button" disabled={busy} onClick={async()=>{setBusy(true);try{const response=await fetch('/api/hub/accept-invitation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:new URLSearchParams(location.search).get('token')})});if(!response.ok)throw new Error();location.assign('/hub');}catch{setMessage('Niet gelukt. Controleer of je met het juiste e-mailadres bent ingelogd en je uitnodiging nog geldig is.');setBusy(false);}}}>{busy?'Even controleren…':'Uitnodiging accepteren'}</button><p role="status">{message}</p></div>;}
