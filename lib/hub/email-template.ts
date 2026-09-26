import type {HubMail} from './mail';

type MailKind='verify'|'reset'|'invite';
const copy={
  verify:{subject:'Bevestig je e-mailadres voor Sitesnit Hub',title:'Nog één klik.\nDan ben je erbij.',intro:'Je hebt een account aangemaakt voor Sitesnit Hub. Bevestig je e-mailadres om toegang te krijgen tot jouw websitegegevens.',button:'E-mailadres bevestigen',after:'Daarna log je in met het wachtwoord dat je zelf hebt gekozen.',notice:'Deze link is 1 uur geldig. Heb je geen account aangevraagd? Dan kun je deze mail negeren.'},
  reset:{subject:'Je Sitesnit Hub-wachtwoord instellen',title:'Een nieuw wachtwoord.\nWeer toegang.',intro:'Er is een nieuw wachtwoord aangevraagd voor jouw Sitesnit Hub-account. Met de knop hieronder kies je zelf een nieuw wachtwoord.',button:'Wachtwoord instellen',after:'Na het instellen kun je opnieuw inloggen in je klantomgeving.',notice:'Deze link is 1 uur geldig. Niet zelf aangevraagd? Je huidige wachtwoord blijft dan gewoon geldig. Je hoeft niets te doen.'},
  invite:{subject:'Je uitnodiging voor Sitesnit Hub',title:'Jouw website.\nAlles bij elkaar.',intro:'Je bent uitgenodigd voor Sitesnit Hub. Hier vind je de beschikbare cijfers, inzichten en werkzaamheden voor jouw website.',button:'Uitnodiging openen',after:'Maak je account aan met het e-mailadres waarop je deze mail ontvangt. Heb je al een account? Log dan eerst in.',notice:'Deze persoonlijke uitnodiging is 48 uur geldig. Deel de link niet met anderen.'},
} satisfies Record<MailKind,{subject:string;title:string;intro:string;button:string;after:string;notice:string}>;
const escape=(value:string)=>value.replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]!));

export function hubActionEmail(kind:MailKind,to:string,url:string):HubMail{
  const target=new URL(url);
  if(target.protocol!=='https:'&&!(['localhost','127.0.0.1'].includes(target.hostname)&&target.protocol==='http:'))throw new Error('Ongeldige e-maillink.');
  const c=copy[kind],link=escape(url);
  const text=`${c.title.replace('\n',' ')}\n\n${c.intro}\n\n${c.button}: ${url}\n\n${c.after}\n\n${c.notice}\n\nVragen? Mail contact@sitesnit.nl.\nKay | Sitesnit\nwww.sitesnit.nl`;
  const html=`<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escape(c.subject)}</title></head>
<body style="margin:0;padding:0;background:#f6f5ee;color:#163f43;font-family:Arial,Helvetica,sans-serif">
<div style="display:none;font-size:1px;color:#f6f5ee;max-height:0;overflow:hidden">${escape(c.intro)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f6f5ee"><tr><td align="center" style="padding:28px 16px">
<table role="presentation" width="560" cellspacing="0" cellpadding="0" style="width:100%;max-width:560px">
<tr><td style="padding:0 4px 24px"><a href="https://www.sitesnit.nl" style="color:#163f43;text-decoration:none;font-size:24px;font-weight:bold"><img src="https://www.sitesnit.nl/brand/sitesnit-horizontal-black-transparent.png" width="140" alt="Sitesnit" style="display:block;width:140px;height:auto;border:0"></a></td></tr>
<tr><td style="padding:36px 28px;background:#e7eedf;border:1px solid #d4dfcd;border-radius:20px 20px 0 0">
<p style="margin:0 0 19px;font-size:11px;letter-spacing:2px;font-weight:bold;color:#184bce">SITESNIT HUB / JOUW KLANTOMGEVING</p>
<h1 style="margin:0;font-size:34px;line-height:1.12;letter-spacing:-1.2px;color:#163f43">${c.title.split('\n').map(escape).join('<br>')}</h1></td></tr>
<tr><td style="padding:28px;background:#ffffff;border:1px solid #d4dfcd;border-top:0;border-radius:0 0 20px 20px">
<p style="margin:0 0 24px;font-size:16px;line-height:1.7">Hoi,</p><p style="margin:0 0 26px;font-size:16px;line-height:1.7">${escape(c.intro)}</p>
<table role="presentation" cellspacing="0" cellpadding="0"><tr><td bgcolor="#184bce" style="border-radius:10px"><a href="${link}" style="display:inline-block;padding:17px 23px;color:#ffffff;text-decoration:none;font-size:16px;font-weight:bold;border:1px solid #184bce;border-radius:10px">${escape(c.button)} &nbsp;→</a></td></tr></table>
<p style="margin:24px 0;font-size:15px;line-height:1.7">${escape(c.after)}</p>
<p style="margin:0;padding:18px;background:#f6f5ee;border-radius:10px;font-size:13px;line-height:1.65;color:#526b6c">${escape(c.notice)}</p>
<p style="margin:26px 0 0;font-size:15px;line-height:1.65">Kom je er niet uit? Mail gerust naar <a href="mailto:contact@sitesnit.nl" style="color:#184bce">contact@sitesnit.nl</a>.<br><br>Groet,<br><strong>Kay van Sitesnit</strong></p></td></tr>
<tr><td style="padding:23px 4px;font-size:12px;line-height:1.7;color:#526b6c">De knop werkt niet? <a href="${link}" style="color:#163f43;text-decoration:underline">Open je persoonlijke link</a>.<br>Dit is een servicebericht voor je Sitesnit Hub-account.<br><a href="https://www.sitesnit.nl" style="color:#163f43">www.sitesnit.nl</a> · Webdesign vanuit Baarlo</td></tr>
</table></td></tr></table></body></html>`;
  return {to,subject:c.subject,text,html};
}
