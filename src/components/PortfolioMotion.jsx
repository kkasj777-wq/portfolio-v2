import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';

export default function PortfolioMotion({ scopeRef }) {
  useLayoutEffect(() => {
    const scope = scopeRef.current || document.querySelector('.app');
    if (!scope || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const context = gsap.context(() => {
      const opening = gsap.timeline({ defaults: { ease: 'expo.out' } });
      opening
        .fromTo('.hero-reel video', { scale: 1.2, filter: 'saturate(.35) contrast(1.2) brightness(.45)' }, { scale: 1, filter: 'saturate(.78) contrast(1.08) brightness(.78)', duration: 2.8 })
        .fromTo('.hero-kicker', { y: 32, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1 }, 0.25)
        .fromTo('.hero h1 > span, .hero h1 > em', { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.4, stagger: 0.14 }, 0.35)
        .fromTo('.hero-role, .hero-intro, .hero-actions > *, .hero-metrics > div, .reel-counter, .scroll-cue', { y: 38, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.07 }, 0.82);

    }, scope);

    return () => context.revert();
  }, [scopeRef]);

  return null;
}
