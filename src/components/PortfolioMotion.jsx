import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';

const textRevealSelector = [
  '.portfolio-stage .section-heading h2',
  '.portfolio-stage .section-description-motion',
  '.portfolio-stage .series-portal-copy',
  '.portfolio-stage .work-card h3',
  '.portfolio-stage .work-card > p',
  '.portfolio-stage .work-card-slogan',
  '.portfolio-stage .writing-copy h3',
  '.portfolio-stage .writing-copy p',
  '.portfolio-stage .writing-methods article h3',
  '.portfolio-stage .writing-methods article p',
  '.portfolio-stage .script-library-heading h3',
  '.portfolio-stage .script-library-heading p',
  '.portfolio-stage .script-card h4',
  '.portfolio-stage .script-card p',
  '.portfolio-stage .writing-archive-copy h3',
  '.portfolio-stage .writing-archive-copy p',
  '.portfolio-stage .commercial-lead-copy > *',
  '.portfolio-stage .commercial-numbers p',
  '.portfolio-stage .redfruit-strip button strong',
  '.portfolio-stage .redfruit-strip button i',
  '.portfolio-stage .about-lead',
  '.portfolio-stage .about-body',
  '.portfolio-stage .about-data',
  '.portfolio-stage .experience-list article h3',
  '.portfolio-stage .experience-list article p',
  '.portfolio-stage .strength-grid article h3',
  '.portfolio-stage .strength-grid article p',
  '.portfolio-stage .contact-inner > *:not(.contact-meta)',
].join(',');

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

    const textTargets = [...scope.querySelectorAll(textRevealSelector)];
    textTargets.forEach((target, index) => {
      target.classList.add('portfolio-text-reveal');
      target.style.setProperty('--text-reveal-delay', `${(index % 4) * 70}ms`);
    });

    const pendingTargets = new Set(textTargets);
    let frame = 0;
    const revealVisibleText = () => {
      frame = 0;
      pendingTargets.forEach((target) => {
        const rect = target.getBoundingClientRect();
        if (rect.top >= window.innerHeight * 0.9 || rect.bottom <= 0) return;
        target.classList.add('is-text-visible');
        pendingTargets.delete(target);
      });
    };
    const scheduleReveal = () => {
      if (!frame) frame = window.requestAnimationFrame(revealVisibleText);
    };

    scheduleReveal();
    window.addEventListener('scroll', scheduleReveal, { passive: true });
    window.addEventListener('resize', scheduleReveal);

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener('scroll', scheduleReveal);
      window.removeEventListener('resize', scheduleReveal);
      textTargets.forEach((target) => {
        target.classList.remove('portfolio-text-reveal', 'is-text-visible');
        target.style.removeProperty('--text-reveal-delay');
      });
      context.revert();
    };
  }, [scopeRef]);

  return null;
}
