'use client';
import { useEffect, useRef, useState } from 'react';

export function PhotoStack() {
  const [open, setOpen] = useState(false);
  const trigger = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    let observer: IntersectionObserver;
    const observe = () => {
      observer?.disconnect();
      // Fold while the photos are still visible, above the central reading area.
      const top = Math.round(window.innerHeight * .32);
      const bottom = Math.round(window.innerHeight * .15);
      observer = new IntersectionObserver(([entry]) => setOpen(entry.isIntersecting), {
        rootMargin: `-${top}px 0px -${bottom}px 0px`, threshold: 0,
      });
      if (trigger.current) observer.observe(trigger.current);
    };
    observe();
    window.addEventListener('resize', observe, { passive: true });
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', observe);
    };
  }, []);
  return <div className={`kay-photo-stack ${open ? 'is-open' : ''}`}>
    <div className="kay-photo-stage" id="kay-fotos">
      <span ref={trigger} className="kay-photo-trigger" aria-hidden="true" />
      <figure className="kay-photo kay-photo-secondary"><img src="/about/kay-persoonlijk-320.webp" srcSet="/about/kay-persoonlijk-320.webp 320w, /about/kay-persoonlijk-640.webp 640w" sizes="180px" width="1536" height="2048" alt="Kay, de ondernemer achter Sitesnit" /><figcaption>Gewoon Kay.</figcaption></figure>
      <figure className="kay-photo kay-photo-main"><img src="/about/kay-portret-320.webp" srcSet="/about/kay-portret-320.webp 320w, /about/kay-portret-640.webp 640w" sizes="210px" width="1086" height="1448" alt="Kay op een terras bij zonsondergang" /><figcaption>Kay / Sitesnit</figcaption></figure>
      <figure className="kay-photo kay-photo-nova"><img src="/about/nova-sitesnit-hond-320.webp" width="900" height="1600" alt="Nova, de kleine witte Sitesnit-hond" /><figcaption>En Nova natuurlijk.</figcaption></figure>
    </div>
  </div>;
}
