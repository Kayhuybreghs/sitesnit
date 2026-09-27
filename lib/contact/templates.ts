import { contactReference, contactServices, type ContactInput } from './input';
import { site } from '../../app/site-data';

export const CONTACT_RECIPIENT = 'contact@sitesnit.nl';
export type ContactMail = { from: string; to: string; reply_to: string; subject: string; text: string; html: string };
const escape = (s: string) => s.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
function html(title: string, text: string) {
  return `<!doctype html><html lang="nl"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body style="margin:0;background:#f7f5ed;color:#173f43;font-family:Arial,sans-serif"><table role="presentation" style="width:100%;padding:28px 16px"><tr><td><table role="presentation" style="max-width:600px;width:100%;margin:auto;background:#fff;border:1px solid #d3dfd6;border-radius:16px"><tr><td style="padding:28px 32px;border-bottom:1px solid #d3dfd6"><a href="https://www.sitesnit.nl" style="font-size:24px;font-weight:700;color:#173f43;text-decoration:none">Sitesnit</a><p style="margin:8px 0 0;font-size:13px">Persoonlijk contact met Kay</p></td></tr><tr><td style="padding:32px"><h1 style="font-size:24px;line-height:1.3;margin:0 0 24px">${escape(title)}</h1>${text.split('\n\n').map(p=>`<p style="font-size:16px;line-height:1.7;margin:0 0 20px;overflow-wrap:anywhere">${escape(p).replaceAll('\n','<br>')}</p>`).join('')}</td></tr><tr><td style="padding:20px 32px;background:#edf1e6;font-size:13px">Sitesnit · Baarlo · <a href="mailto:contact@sitesnit.nl" style="color:#173f43">contact@sitesnit.nl</a></td></tr></table></td></tr></table></body></html>`;
}
export function contactMails(input: ContactInput, from: string, now: number): Record<'owner'|'confirmation', ContactMail> {
  const reference = contactReference(input.id);
  const details = [
    `Referentie: ${reference}`, `Ontvangen: ${new Date(now).toISOString()}`,
    `Naam: ${input.name}`, `E-mail: ${input.email}`, input.phone && `Telefoon: ${input.phone}`,
    input.website && `Website: ${input.website}`, `Bron: ${input.sourcePage} (${input.formId})`,
    input.serviceId && `Dienst: ${contactServices[input.serviceId]}`,
    input.packageId && `Websitepakket: ${site.packages.find(p=>p.id===input.packageId)?.name}`,
    input.project && `Voorbeeldproject: ${input.project}`, input.rhythm && `Ritme: ${input.rhythm}`,
    input.monthlyPlan && `Maandpakket: ${input.monthlyPlan}`,
    input.careInterests.length > 0 && `Extra interesse: ${input.careInterests.map(id=>contactServices[id]||id).join(', ')}`,
    input.appointment && `Belafspraak gewenst: ${input.preferredDay || 'dag afstemmen'} ${input.preferredTime} (nog te bevestigen)`,
  ].filter(Boolean).join('\n');
  const ownerText = `${details}\n\nBericht:\n${input.message}${input.toolSummary ? `\n\nBewust meegestuurd tooloverzicht:\n${input.toolSummary}` : ''}`;
  const confirmationText = `Bedankt voor je bericht. Je aanvraag is ontvangen onder referentie ${reference}.\n\nIk bekijk je vraag en neem contact met je op via dit e-mailadres.${input.appointment ? ' Heb je een voorkeursmoment voor bellen doorgegeven? Dan stemmen we die afspraak nog samen af.' : ''}\n\nJe kunt op deze e-mail reageren om iets aan te vullen.\n\nKay Huybreghs\nSitesnit\ncontact@sitesnit.nl`;
  return {
    owner: {from,to:CONTACT_RECIPIENT,reply_to:input.email,subject:`Nieuwe aanvraag via Sitesnit — ${reference}`,text:ownerText,html:html('Een nieuwe aanvraag',ownerText)},
    confirmation: {from,to:input.email,reply_to:CONTACT_RECIPIENT,subject:'Je aanvraag bij Sitesnit is ontvangen',text:confirmationText,html:html('Je bericht is goed ontvangen.',confirmationText)},
  };
}
