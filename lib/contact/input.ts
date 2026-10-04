import { createHash } from 'node:crypto';
import { site } from '../../app/site-data';
import { contactServiceNames } from './options';
import { routeCatalog } from '../route-catalog';
import { ANALYTICS_TOOL_PATHS } from '../analytics-events';
import { CONTACT_SUMMARY_MAX_LENGTH } from './limits';

export class ContactError extends Error {
  status: number;
  code?: string;
  constructor(message: string, status = 400, code?: string) { super(message); this.status = status; this.code = code; }
}
const days = ['Maandag','Dinsdag','Woensdag','Donderdag','Vrijdag','Zaterdag','Zondag'];
export const contactServices = contactServiceNames;
const allowedCare = ['onderhoud-hosting','content','social-media'];
const plans = ['Hosting','Hosting & technisch onderhoud','Hosting, onderhoud & SEO','2 blogs per maand','4 blogs per maand'];
function string(value: unknown, max: number, min = 0) {
  if (value == null) value = '';
  if (typeof value !== 'string' || value.trim().length < min || value.trim().length > max || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value))
    throw new ContactError('Controleer de verplichte velden en de maximale tekstlengte.');
  return value.trim();
}
function choice(value: unknown, options: readonly string[]) {
  const v = string(value, 180);
  if (v && !options.includes(v)) throw new ContactError('Een gekozen optie is niet geldig. Kies deze opnieuw.');
  return v;
}
export function parseContact(b: Record<string, unknown>) {
  if (b.companyCheck) throw new ContactError('De formuliercontrole ging mis. Je gegevens zijn behouden. Probeer je aanvraag nogmaals te versturen.', 400, 'contact_verification');
  const id = string(b.requestId, 36);
  if (!/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i.test(id)) throw new ContactError('Vernieuw het formulier en probeer opnieuw.');
  const name = string(b.name, 100, 2), email = string(b.email, 254, 3).toLowerCase();
  if (!/^[^\s<>(),;:"\\]+@[^\s<>(),;:"\\]+\.[^\s<>(),;:"\\]+$/.test(email)) throw new ContactError('Vul een geldig e-mailadres in.');
  const message = string(b.message, 4000, 10), website = string(b.website, 2000);
  const phone = string(b.phone, 40);
  if (phone && !/^[+\d\s().-]{5,40}$/.test(phone)) throw new ContactError('Controleer je telefoonnummer.');
  const packageId = choice(b.packageId, site.packages.map(p => p.id));
  const serviceId = choice(b.serviceId, Object.keys(contactServices));
  const sourcePage = choice(b.sourcePage || '/contact', routeCatalog.map(r => r.path));
  const formId = choice(b.formId || 'contact', ['contact','tool_contact']);
  const toolId = ANALYTICS_TOOL_PATHS[sourcePage] || '';
  if (formId === 'tool_contact' && !toolId) throw new ContactError('Dit formulier heeft geen geldige toolbron.');
  const appointment = b.appointment === true || b.appointment === 'yes';
  const preferredDay = appointment ? choice(b.preferredDay, days) : '';
  const preferredTime = appointment ? string(b.preferredTime, 5) : '';
  if (preferredTime && (!preferredDay || !/^([01]\d|2[0-3]):[0-5]\d$/.test(preferredTime) ||
    (days.indexOf(preferredDay) < 5 && (preferredTime < '18:00' || preferredTime > '21:30'))))
    throw new ContactError('Kies op werkdagen een beltijd tussen 18:00 en 21:30, of een moment in het weekend.');
  const care = b.careInterests ?? [];
  if (!Array.isArray(care) || care.length > 3 || care.some(c => typeof c !== 'string' || !allowedCare.includes(c))) throw new ContactError('Controleer de extra diensten.');
  const monthlyPlan = choice(b.monthlyPlan, plans);
  const project = choice(b.project, ['beurswijzer','beurswatcher']);
  const rhythm = choice(b.rhythm, ['2 blogs per maand','4 blogs per maand','Iedere week','Eens per twee weken']);
  if (b.includeSummary !== undefined && typeof b.includeSummary !== 'boolean') throw new ContactError('Controleer de toestemming voor je tooloverzicht.');
  const toolSummary = b.includeSummary === true ? string(b.toolSummary, CONTACT_SUMMARY_MAX_LENGTH) : '';
  const payload = { name,email,message,website,phone,packageId,serviceId,sourcePage,formId,toolId,appointment,preferredDay,preferredTime,careInterests:[...new Set(care)].sort() as string[],monthlyPlan,project,rhythm,toolSummary };
  return { id: id.toLowerCase(), ...payload, hash: createHash('sha256').update(JSON.stringify(payload)).digest('hex') };
}
export type ContactInput = ReturnType<typeof parseContact>;
export const contactReference = (id: string) => `SN-${id.replaceAll('-','').toUpperCase()}`;
