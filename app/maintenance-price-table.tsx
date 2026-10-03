import {hostingPlans} from '../lib/pricing';
import {business,grossPrice,minimumHostingYear} from '../lib/business';
import {euro} from './site-data';

/** Server-rendered guide comparison; amounts and coverage come from the service catalogue. */
export function MaintenancePriceTable(){
  return <section id="onderhoudsprijzen">
    <h2>Wat kost onderhoud bij Sitesnit?</h2>
    <p>Dit zijn onze eigen Sitesnit-pakketten, geen Nederlands marktgemiddelde of prijs voor iedere website. Hosting alleen is geen onderhoudspakket.</p>
    <table className="maintenance-price-table" role="table">
      <caption>Eigen Sitesnit-pakketten per maand</caption>
      <thead role="rowgroup"><tr role="row"><th scope="col" role="columnheader">Pakket</th><th scope="col" role="columnheader">Maandbedrag</th><th scope="col" role="columnheader">Belangrijkste verschil in dekking</th></tr></thead>
      <tbody role="rowgroup">{hostingPlans.map((plan,index)=><tr role="row" key={plan.name}>
        <th scope="row" role="rowheader"><span className="maintenance-cell-label" aria-hidden="true">Pakket</span>{plan.name}</th>
        <td role="cell"><span className="maintenance-cell-label" aria-hidden="true">Maandbedrag</span><strong>{index===0?'Vanaf ':''}{euro(plan.price)} excl. btw</strong><span>{index===0?'Vanaf ':''}{euro(grossPrice(plan.price))} incl. {business.vatRate*100}% btw</span></td>
        <td role="cell"><span className="maintenance-cell-label" aria-hidden="true">Dekking</span><ul>{plan.items.map(item=><li key={item}>{item}</li>)}</ul></td>
      </tr>)}</tbody>
    </table>
    <p>Hosting is al inbegrepen in beide combinatiepakketten; tel de losse hostingprijs daar niet nog eens bij op. De losse dienst SEO-onderhoud valt niet automatisch binnen een vast pakket: aanvullend werk buiten de dekking spreken we apart af.</p>
    <p>Bij een nieuwe website geldt voor hosting een eerste looptijd van {business.hostingInitialMonths} maanden: minimaal {euro(minimumHostingYear)} excl. btw ({euro(grossPrice(minimumHostingYear))} incl. btw) voor dat hostingjaar, naast de bouwprijs. {business.hostingRenewal==='monthly'?'Daarna is hosting maandelijks opzegbaar.':''}</p>
    <p>Bij een bestaande website beoordelen we eerst de techniek en toegang. Eenmalige inrichting of aanvullend herstel kan apart worden afgesproken. Nieuwe blogs, functies, grotere uitbreidingen en externe abonnementen zijn niet bij deze maandpakketten inbegrepen.</p>
    <a className="text-link" href="/diensten/onderhoud-hosting#maandpakketten">Bekijk de volledige dekking en afspraken</a>
  </section>;
}
