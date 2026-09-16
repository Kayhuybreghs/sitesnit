'use client';
import { useEffect, useRef, useState } from 'react';

export function PhotoStack() {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.intersectionRatio >= .6) setOpen(true);
      else if (entry.intersectionRatio <= .25) setOpen(false);
    }, { threshold: [0, .25, .6], rootMargin: '0px 0px -8% 0px' });
    if (root.current) observer.observe(root.current);
    return () => observer.disconnect();
  }, []);
  return <div ref={root} className={`kay-photo-stack ${open ? 'is-open' : ''}`}>
    <div className="kay-photo-stage" id="kay-fotos">
      <figure className="kay-photo kay-photo-secondary"><img src="/about/kay-persoonlijk-320.webp" srcSet="/about/kay-persoonlijk-320.webp 320w, /about/kay-persoonlijk-640.webp 640w" sizes="180px" width="1536" height="2048" alt="Kay, de ondernemer achter Sitesnit" /><figcaption>Gewoon Kay.</figcaption></figure>
      <figure className="kay-photo kay-photo-main"><img src="/about/kay-portret-320.webp" srcSet="/about/kay-portret-320.webp 320w, /about/kay-portret-640.webp 640w" sizes="210px" width="1086" height="1448" alt="Kay op een terras bij zonsondergang" /><figcaption>Kay / Sitesnit</figcaption></figure>
      <figure className="kay-photo kay-photo-nova"><img src="/about/nova-sitesnit-hond-320.webp" width="900" height="1600" alt="Nova, de kleine witte Sitesnit-hond" /><figcaption>En Nova natuurlijk.</figcaption></figure>
    </div>
    <button type="button" className="text-link kay-photo-toggle" aria-expanded={open} aria-controls="kay-fotos" onClick={() => setOpen(value => !value)}>{open ? 'Foto’s bij elkaar' : 'Even uitklappen'} <span aria-hidden="true">{open ? '−' : '+'}</span></button>
  </div>;
}
