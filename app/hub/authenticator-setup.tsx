'use client';
import {useState} from 'react';
import {QRCodeSVG} from 'qrcode.react';
export default function AuthenticatorSetup({uri,codes}:{uri:string;codes:string[]}){
  const[copyStatus,setCopyStatus]=useState('');
  let secret='';try{secret=new URL(uri).searchParams.get('secret')||'';}catch{}
  return <div className="hub-auth-setup">
    <div className="hub-setup-step"><span>1</span><div><h2>Scan met je authenticator</h2><p>Open bijvoorbeeld Google Authenticator, Microsoft Authenticator of je wachtwoordmanager. Kies ‘Account toevoegen’ en scan deze QR-code.</p></div></div>
    <div className="hub-qr"><QRCodeSVG value={uri} size={192} marginSize={4} title="Scan deze QR-code met je authenticator"/></div>
    <details><summary>Instellen op dezelfde telefoon?</summary><p>Kopieer de onderstaande instelsleutel naar je authenticator. Kies een tijdgebonden code (TOTP) en geef het account de naam Sitesnit Hub.</p><code>{secret}</code></details>
    <div className="hub-setup-step"><span>2</span><div><h2>Bewaar je herstelcodes</h2><p>Deze codes zijn je reserve als je je telefoon kwijtraakt. Bewaar ze in je wachtwoordmanager. Elke code werkt één keer; deel ze met niemand.</p></div></div>
    <details><summary>Herstelcodes bekijken en bewaren</summary><ul className="hub-recovery-grid">{codes.map(code=><li key={code}><code>{code}</code></li>)}</ul><button type="button" className="hub-quiet-button" onClick={async()=>{try{await navigator.clipboard.writeText(codes.join('\n'));setCopyStatus('Gekopieerd. Bewaar de codes op een veilige plek.');}catch{setCopyStatus('Kopiëren lukt niet. Selecteer de codes en kopieer ze handmatig.');}}}>Herstelcodes kopiëren</button><p role="status">{copyStatus}</p></details>
    <label className="hub-security-check"><input type="checkbox" required/><span>Ik heb mijn herstelcodes veilig bewaard.</span></label>
    <div className="hub-setup-step"><span>3</span><div><h2>Bevestig met de tijdelijke code</h2><p>Vul hieronder de zes cijfers uit je authenticator in. Dit is een andere code dan je herstelcodes.</p></div></div>
  </div>;
}
