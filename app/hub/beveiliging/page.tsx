import {requireHubUser} from '../../../lib/hub/session';
import {HubAuthForm} from '../auth-form';
import {hasHubMfaProof} from '../../../lib/hub/mfa';
import {SecurityChoice} from '../security-choice';
export default async function Page(){
  const context=await requireHubUser(true);
  const verified=await hasHubMfaProof(context.runtime.connection.db,context.user.id,context.user.sessionId);
  return <section className="wrap section hub-auth hub-security-page"><span className="eyebrow">Sitesnit Hub / Beveiliging</span><h1>Maak je account<br/>een stukje veiliger.</h1>{verified?<><p>Tweestapsbeveiliging staat aan. Je hebt de extra controle voor deze sessie afgerond.</p><a className="button" href="/hub">Naar je overzicht</a></>:<><p>{context.user.twoFactorEnabled?'Open je authenticator en vul de zescijferige code in. Je hoeft niets opnieuw in te stellen.':'Met tweestapsbeveiliging gebruik je naast je wachtwoord een tijdelijke code op je telefoon. Aanbevolen, zeker als je meerdere klantwebsites beheert.'}</p><div className="hub-security-layout"><div><HubAuthForm mode={context.user.twoFactorEnabled?'verify':'enroll'}/></div>{!context.user.twoFactorEnabled&&<SecurityChoice/>}</div></>}</section>;
}
