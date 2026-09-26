'use client';
/* eslint-disable @next/next/no-location-assign-relative-destination -- Authentication boundaries deliberately reload the document to discard cached private RSC and client state. */
import {useState,type FormEvent,type MouseEvent} from 'react';
import dynamic from 'next/dynamic';
const AuthenticatorSetup=dynamic(()=>import('./authenticator-setup'),{loading:()=> <p>Instelstappen laden…</p>});
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
      if(data.code==='EMAIL_SEND_FAILED'){setMessage(mode==='invite'?'De verificatiemail kon niet worden verstuurd. Je account kan al zijn aangemaakt. Probeer hieronder later opnieuw met ‘Verificatiemail opnieuw aanvragen’.':'De e-mail kon niet worden verstuurd. Probeer later opnieuw of neem contact op met Sitesnit.');return;}
      if(!response.ok){if(data.code==='EMAIL_NOT_VERIFIED'){setMessage('Je e-mailadres is nog niet bevestigd. Open de link in je verificatiemail of vraag hieronder een nieuwe mail aan.');return;}throw new Error();}
      if(data.twoFactorRedirect){setStage('totp');return;}
      if(mode==='enroll'&&stage==='form'){setTotp(String(data.totpURI||''));setRecovery(Array.isArray(data.backupCodes)?data.backupCodes.filter((code):code is string=>typeof code==='string'):[]);setStage('totp');return;}
      if(stage!=='form'||mode==='login'){location.assign('/hub');return;}
      setMessage(mode==='invite'?'Je registratie is verwerkt. Bevestig je e-mailadres via de verificatiemail voordat je inlogt. Geen mail ontvangen? Controleer je spammap of vraag hieronder opnieuw een mail aan.':params.get('token')?'Je wachtwoord is aangepast. Je kunt weer inloggen.':'Als dit e-mailadres bekend is, ontvang je een herstelbericht.');
    }catch{setMessage('Dit is niet gelukt. Controleer je gegevens of tijdelijke code. Blijft dit gebeuren, neem dan contact op met Sitesnit.');}finally{setBusy(false);}
  }
  async function resendVerification(event:MouseEvent<HTMLButtonElement>){
    const field=event.currentTarget.form?.elements.namedItem('email');
    if(!(field instanceof HTMLInputElement)||!field.reportValidity())return;
    const email=field.value;setBusy(true);setMessage('');
    try{
      const response=await fetch('/api/hub-auth/send-verification-email',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({email,callbackURL:'/hub/login'})});
      if(response.status===429){setMessage('Je hebt te vaak een verificatiemail aangevraagd. Probeer het later opnieuw.');return;}
      if(!response.ok)throw new Error();
      setMessage('Als dit account nog bevestiging nodig heeft, is een nieuwe verificatiemail aangevraagd. Controleer ook je spammap. Gebruik de link in de nieuwste mail.');
    }catch{setMessage('De verificatiemail kon niet worden verstuurd. Probeer later opnieuw of neem contact op met Sitesnit.');}finally{setBusy(false);}
  }
  return <form className="hub-auth-form" onSubmit={send}>
    {!enabled&&<p className="hub-notice">Inloggen wordt beschikbaar zodra Sitesnit de klantomgeving heeft aangesloten. Je kunt je website ondertussen gewoon bespreken.</p>}
    {stage==='form'?<>
      {mode==='invite'&&<label>Je naam<input name="name" autoComplete="name" required maxLength={100}/></label>}
      {mode!=='enroll'&&!(mode==='reset'&&hasResetToken)&&<label>E-mailadres<input name="email" type="email" autoComplete="email" required maxLength={254}/></label>}
      {mode==='enroll'&&<div className="hub-enroll-intro"><h2>Tweestapsbeveiliging instellen</h2><p>Bevestig eerst je huidige wachtwoord. Daarna krijg je een QR-code om met je telefoon te scannen.</p></div>}
      {(mode!=='reset'||hasResetToken)&&<label>{mode==='reset'?'Nieuw wachtwoord':mode==='enroll'?'Je huidige wachtwoord':'Wachtwoord'}<input name="password" type="password" autoComplete={mode==='login'||mode==='enroll'?'current-password':'new-password'} required minLength={mode==='invite'||mode==='reset'?12:undefined}/></label>}
      {mode==='invite'&&<p>Gebruik minimaal 12 tekens. Je uitnodiging en e-mailadres bepalen tot welke websites je toegang krijgt.</p>}
    </>:<>
      {totp&&<AuthenticatorSetup uri={totp} codes={recovery}/>}
      <label>{stage==='backup'?'Eenmalige herstelcode':'Zescijferige code uit je authenticator'}<input name="code" autoComplete="one-time-code" inputMode={stage==='backup'?'text':'numeric'} pattern={stage==='backup'?undefined:'[0-9]{6}'} maxLength={stage==='backup'?100:6} placeholder={stage==='backup'?undefined:'123456'} required/></label>
    </>}
    <button className="button" disabled={busy||!enabled}>{busy?'Even controleren…':stage!=='form'?(mode==='enroll'?'Beveiliging aanzetten':'Code controleren'):mode==='invite'?'Account aanmaken':mode==='enroll'?'Verder naar de QR-code':mode==='reset'?'Wachtwoord herstellen':'Inloggen'}</button>
    <p role="status" aria-live="polite">{message}</p>
    {stage==='form'&&(mode==='login'||mode==='invite')&&<button type="button" className="text-link" disabled={busy||!enabled} onClick={resendVerification}>Verificatiemail opnieuw aanvragen</button>}
    {stage==='totp'&&mode!=='enroll'&&<button type="button" className="text-link" onClick={()=>setStage('backup')}>Gebruik een herstelcode</button>}
    <a href={mode==='login'?'/hub/reset-password':'/hub/login'}>{mode==='login'?'Wachtwoord vergeten?':'Terug naar inloggen'}</a>
  </form>;
}
export function HubSignOut(){const [busy,setBusy]=useState(false);return <button className="text-link" disabled={busy} onClick={async()=>{setBusy(true);try{const response=await fetch('/api/hub-auth/sign-out',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'});if(response.ok)location.assign('/hub/login');}finally{setBusy(false);}}}>Uitloggen</button>;}

export function AcceptHubInvitation(){const[message,setMessage]=useState('');const[busy,setBusy]=useState(false);return <div className="hub-auth-form"><p>Voeg deze klantomgeving toe aan je ingelogde account. De uitnodiging moet voor hetzelfde e-mailadres zijn.</p><button className="button" disabled={busy} onClick={async()=>{setBusy(true);try{const response=await fetch('/api/hub/accept-invitation',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token:new URLSearchParams(location.search).get('token')})});if(!response.ok)throw new Error();location.assign('/hub');}catch{setMessage('Niet gelukt. Controleer of je met het juiste e-mailadres bent ingelogd en je uitnodiging nog geldig is.');setBusy(false);}}}>{busy?'Even controleren…':'Uitnodiging accepteren'}</button><p role="status">{message}</p></div>;}
