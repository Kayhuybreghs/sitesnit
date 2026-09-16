import { business, hostingSummary, paymentSummary, grossPrice, minimumHostingYear } from '../lib/business';
import { euro } from './site-data';

export function BusinessNotes({ compact = false, websitePrice }: { compact?: boolean; websitePrice?: number | null }) {
  return <div className={`business-notes ${compact ? 'business-notes-compact' : ''}`}>
    <p><strong>Betaling.</strong> {paymentSummary}</p>
    <p><strong>Hosting.</strong> {hostingSummary} Technisch onderhoud en nieuwe inhoud kies je afzonderlijk.</p>
    {websitePrice != null && <p><strong>Bouw + eerste hostingjaar: minimaal {euro(grossPrice(websitePrice + minimumHostingYear))} inclusief btw.</strong> Extra afgesproken functies of diensten komen daar afzonderlijk bij.</p>}
    <p>Bij de bouwprijzen zie je het bedrag exclusief én inclusief 21% btw. Hosting loopt na het eerste jaar door en is daarna maandelijks opzegbaar.</p>
    <a href="/algemene-voorwaarden">Lees de afspraken over bouw, betaling en hosting</a>
  </div>;
}

export function BusinessIdentity() {
  return <address className="business-identity">
    <strong>{business.legalName}</strong>
    {business.ownerName && <span>{business.ownerName}</span>}
    {business.streetAddress && <span>{business.streetAddress}</span>}
    <span>{business.postalCode ? `${business.postalCode} ` : ''}{business.locality}, {business.country}</span>
    {business.email ? <a href={`mailto:${business.email}`}>{business.email}</a> : <span>E-mail: —</span>}
    {business.phone ? <a href={`tel:${business.phone}`}>{business.phone}</a> : <span>Telefoon: —</span>}
    {business.chamberOfCommerce && <span>KvK {business.chamberOfCommerce}</span>}
    {business.vatId && <span>Btw-id {business.vatId}</span>}
  </address>;
}
