import { ProjectPhoneScreen } from "./project-phone-screen";
export function WorkPair() {
  return <figure className="work-proof work-pair" data-scroll-scene="unfold"><div className="pair-stage" data-scene-target>{[
    ["beurswijzer","Beurswijzer"],
    ["beurswatcher","Beurswatcher"],
  ].map(([slug,name])=><div className={`pair-project pair-${slug}`} key={slug}><div className="pair-device"><ProjectPhoneScreen project={slug as "beurswijzer" | "beurswatcher"}/></div><span>{name}</span></div>)}</div><figcaption><strong>Twee platforms. Elk een eigen gezicht.</strong><p>Beurswijzer en Beurswatcher: voorbeelden van websites met een eigen identiteit en interactieve tools.</p></figcaption></figure>;
}
