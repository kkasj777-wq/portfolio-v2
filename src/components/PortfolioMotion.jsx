import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const cardSelector = [
  '.series-portals > button',
  '.work-grid > article',
  '.writing-feature',
  '.writing-methods > article',
  '.script-library-grid > article',
  '.commercial-overview > *',
  '.redfruit-strip > *',
  '.about-layout > *',
  '.experience-list > article',
  '.award-strip > article',
  '.strength-grid > article',
].join(',');

export default function PortfolioMotion({ scopeRef }) {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
    if (!scope || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const context = gsap.context(() => {
      const opening = gsap.timeline({ defaults: { ease: 'power4.out' } });
      opening
        .fromTo('.hero-reel video', { scale: 1.17, filter: 'saturate(.35) contrast(1.22) brightness(.42)' }, { scale: 1, filter: 'saturate(.78) contrast(1.08) brightness(.78)', duration: 2.8 })
        .fromTo('.hero-kicker', { x: -90, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.15 }, 0.28)
        .fromTo('.hero h1 > span', { yPercent: 125, scaleX: 0.7, transformOrigin: 'left center', clipPath: 'inset(0 0 100% 0)' }, { yPercent: 0, scaleX: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.55 }, 0.35)
        .fromTo('.hero h1 > em', { yPercent: 110, x: 100, scaleX: 0.62, transformOrigin: 'left center', clipPath: 'inset(0 100% 0 0)' }, { yPercent: 0, x: 0, scaleX: 1, clipPath: 'inset(0 0% 0 0)', duration: 1.7 }, 0.55)
        .fromTo('.hero-role, .hero-intro', { y: 54, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.15, stagger: 0.16 }, 0.92)
        .fromTo('.hero-actions > *', { y: 44, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.05, stagger: 0.16 }, 1.12)
        .fromTo('.hero-metrics > div', { y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, stagger: 0.12 }, 1.34)
        .fromTo('.hero-monument, .hero-side, .reel-counter, .scroll-cue', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, stagger: 0.08 }, 1.55);

      gsap.utils.toArray('.portfolio-stage .section').forEach((section) => {
        const heading = section.querySelector('.section-heading');
        if (heading) {
          const headingTimeline = gsap.timeline({
            scrollTrigger: { trigger: heading, start: 'top 84%', once: true },
            defaults: { ease: 'power4.out' },
          });
          headingTimeline
            .fromTo(heading.querySelector('.section-display-title'), { xPercent: -46, scaleX: 0.58, transformOrigin: 'left center', autoAlpha: 0, clipPath: 'inset(0 100% 0 0)' }, { xPercent: 0, scaleX: 1, autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', duration: 1.75 })
            .fromTo(heading.querySelector('.section-index'), { x: -64, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.05 }, 0.18)
            .fromTo(heading.querySelector('.eyebrow'), { x: -88, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.15 }, 0.08)
            .fromTo(heading.querySelector('h2'), { y: 125, scaleX: 0.72, transformOrigin: 'left center', clipPath: 'inset(0 0 100% 0)' }, { y: 0, scaleX: 1, clipPath: 'inset(0 0 0% 0)', duration: 1.55 }, 0.14);
          const description = heading.querySelector(':scope > p');
          if (description) headingTimeline.fromTo(description, { y: 48, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.05 }, 0.48);
        }

        const cards = section.querySelectorAll(cardSelector);
        if (cards.length) {
          gsap.fromTo(cards, {
            y: 110,
            autoAlpha: 0,
            clipPath: 'inset(12% 0 0 0 round 18px)',
          }, {
            y: 0,
            autoAlpha: 1,
            clipPath: 'inset(0% 0 0 0 round 18px)',
            duration: 1.35,
            stagger: 0.14,
            ease: 'power4.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: cards[0], start: 'top 88%', once: true },
          });
        }

        section.querySelectorAll('img').forEach((image) => {
          gsap.fromTo(image, { clipPath: 'inset(0 0 100% 0)', scale: 1.12 }, {
            clipPath: 'inset(0 0 0% 0)',
            scale: 1.02,
            duration: 1.45,
            ease: 'power3.out',
            scrollTrigger: { trigger: image, start: 'top 90%', once: true },
          });
          gsap.fromTo(image, { yPercent: -3 }, {
            yPercent: 3,
            ease: 'none',
            scrollTrigger: { trigger: image, start: 'top bottom', end: 'bottom top', scrub: 1.4 },
          });
        });
      });
    }, scope);

    return () => context.revert();
  }, [scopeRef]);

  return null;
}
