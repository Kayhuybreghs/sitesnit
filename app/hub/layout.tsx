import type {Metadata} from 'next';
import './hub.css';
import './hub-auth.css';
export const dynamic='force-dynamic';
export const metadata:Metadata={title:'Sitesnit Hub',robots:{index:false,follow:false},referrer:'no-referrer'};
export default function HubLayout({children}:{children:React.ReactNode}){return <div className="hub-root">{children}</div>;}
