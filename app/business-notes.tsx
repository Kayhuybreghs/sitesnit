import { business, grossPrice, minimumHostingYear } from '../lib/business';
import { euro } from './site-data';

export function BusinessNotes({ compact = false, websitePrice }: { compact?: boolean; websitePrice?: number | null }) {
  return <div className={`business-notes ${compact ? 'business-notes-compact' : ''}`}>
    <div className="business-notes-heading"><span>Helder vooraf</span><strong>Zo spreken we het af.</strong></div>
    <div className="business-notes-grid">
      <div><span className="business-note-label">Betaling in twee delen</span><strong className="business-note-value">{business.depositPercent}% <small>bij de start</small></strong><p>Vóór we beginnen betaal je {business.depositPercent}%. De overige {business.finalPercent}% betaal je bij afronding van de afgesproken opdracht.</p></div>
      <div><span className="business-note-label">Hosting bij je nieuwe website</span><strong className="business-note-value">Vanaf {euro(business.hostingMonthly)} <small>/ maand excl. btw</small></strong><span className="business-note-tax">{euro(grossPrice(business.hostingMonthly))} per maand inclusief 21% btw</span><p>Eerste looptijd: {business.hostingInitialMonths} maanden. Minimaal {euro(grossPrice(minimumHostingYear))} incl. btw voor het eerste hostingjaar, naast de bouwprijs. Daarna maandelijks opzegbaar.</p></div>
    </div>
    {websitePrice != null && <p className="business-note-total"><strong>Bouw + eerste hostingjaar: minimaal {euro(grossPrice(websitePrice + minimumHostingYear))} inclusief btw.</strong> Extra afgesproken functies of diensten komen daar afzonderlijk bij.</p>}
    <div className="business-notes-bottom"><p>Bouwprijzen staan exclusief én inclusief 21% btw vermeld. Technisch onderhoud en nieuwe inhoud kies je afzonderlijk.</p><a href="/algemene-voorwaarden">Alle afspraken <span aria-hidden="true">↗</span></a></div>
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
