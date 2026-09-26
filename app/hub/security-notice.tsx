export function SecurityNotice({enabled}:{enabled:boolean}){
  if(enabled)return null;
  return <aside className="hub-security-notice"><strong>Je gebruikt alleen een wachtwoord.</strong><span>Tweestapsbeveiliging geeft je account extra bescherming.</span><a href="/hub/beveiliging">Beveiliging instellen →</a></aside>;
}
