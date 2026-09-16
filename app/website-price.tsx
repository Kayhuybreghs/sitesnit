import { grossPrice } from '../lib/business';
import { euro } from './site-data';
import './website-price.css';

export function WebsitePrice({ net, from = false }: { net: number; from?: boolean }) {
  return <div className="website-price">
    <div className="website-price-main">
      <span className="website-price-amount">{from && <span>vanaf </span>}<strong>{euro(net).replace(',00', '')}</strong></span>
      <span className="website-price-tax">excl. btw</span>
    </div>
    <p className="website-price-inclusive">{from && 'Vanaf '}{euro(grossPrice(net))} incl. 21% btw</p>
  </div>;
}
