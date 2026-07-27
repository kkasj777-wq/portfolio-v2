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

const textGroupSelector = [
  '.section-heading',
  '.series-portals > button',
  '.work-card',
  '.writing-feature',
  '.writing-methods article',
  '.script-library-heading',
  '.script-card',
  '.writing-archive',
  '.commercial-lead',
  '.commercial-numbers',
  '.redfruit-strip button',
  '.identity-visual',
  '.about-copy',
  '.experience-list article',
  '.award-strip',
  '.strength-grid article',
  '.archive-flow-heading',
  '.flowing-menu-item',
  '.contact-inner',
].join(',');

const textElementSelector = 'h2,h3,h4,p,blockquote,small,strong,b,li,dt,dd,time,span,.eyebrow,.work-meta,.series-portal-copy > *,.script-card-code,.script-card-meta,.about-data > div,.tool-stack > span,.writing-numbers > div,.strength-top,.contact-meta';

export default function PortfolioMotion({ scopeRef }) {
  useLayoutEffect(() => {
    const scope = scopeRef.current || document.querySelector('.app');
    if (
      !scope
      || window.matchMedia('(prefers-reduced-motion: reduce)').matches
      || window.matchMedia('(max-width: 768px)').matches
    ) return undefined;

    const context = gsap.context(() => {
      const opening = gsap.timeline({ defaults: { ease: 'expo.out' } });
      opening
        .fromTo('.hero-reel video', { scale: 1.32, filter: 'saturate(.2) contrast(1.32) brightness(.28)' }, { scale: 1, filter: 'saturate(.78) contrast(1.08) brightness(.78)', duration: 3.4 })
        .fromTo('.hero-kicker', { x: -150, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.4 }, 0.34)
        .fromTo('.hero h1 > span', { yPercent: 155, scaleX: 0.42, transformOrigin: 'left center', clipPath: 'inset(0 0 100% 0)' }, { yPercent: 0, scaleX: 1, clipPath: 'inset(0 0 0% 0)', duration: 2.05 }, 0.42)
        .fromTo('.hero h1 > em', { yPercent: 145, x: 180, scaleX: 0.38, transformOrigin: 'left center', clipPath: 'inset(0 100% 0 0)' }, { yPercent: 0, x: 0, scaleX: 1, clipPath: 'inset(0 0% 0 0)', duration: 2.2 }, 0.68)
        .fromTo('.hero-role, .hero-intro', { y: 86, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.35, stagger: 0.2 }, 1.16)
        .fromTo('.hero-actions > *', { y: 74, scale: 0.9, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 1.25, stagger: 0.2 }, 1.38)
        .fromTo('.hero-metrics > div', { y: 110, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.35, stagger: 0.15 }, 1.62)
        .fromTo('.hero-monument, .hero-side, .reel-counter, .scroll-cue', { autoAlpha: 0 }, { autoAlpha: 1, duration: 1.2, stagger: 0.08 }, 1.55);

      gsap.utils.toArray('.portfolio-stage .section').forEach((section) => {
        const heading = section.querySelector('.section-heading');
        if (heading) {
          const headingTimeline = gsap.timeline({
            scrollTrigger: { trigger: heading, start: 'top 76%', once: true },
            defaults: { ease: 'expo.out' },
          });
          headingTimeline
            .fromTo(heading.querySelector('.section-display-title'), { xPercent: -115, scaleX: 0.38, transformOrigin: 'left center', autoAlpha: 0, clipPath: 'inset(0 100% 0 0)' }, { xPercent: 0, scaleX: 1, autoAlpha: 1, clipPath: 'inset(0 0% 0 0)', duration: 2.25 })
            .fromTo(heading.querySelector('.section-index'), { x: -120, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.25 }, 0.26)
            .fromTo(heading.querySelector('.eyebrow'), { x: -150, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.4 }, 0.18);
        }

        const cards = section.querySelectorAll(cardSelector);
        cards.forEach((card, index) => {
          gsap.set(card, {
            x: index % 2 ? 120 : -120,
            y: 150,
            scale: 0.82,
            rotateX: 14,
            rotateZ: index % 2 ? 1.3 : -1.3,
            transformPerspective: 1200,
            transformOrigin: 'center bottom',
            autoAlpha: 0,
            clipPath: 'inset(34% 7% 0 7% round 22px)',
          });
          gsap.to(card, {
            x: 0,
            y: 0,
            scale: 1,
            rotateX: 0,
            rotateZ: 0,
            autoAlpha: 1,
            clipPath: 'inset(0% 0 0 0 round 18px)',
            duration: 1.65,
            ease: 'expo.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: card, start: 'top 68%', once: true },
          });
        });

        section.querySelectorAll('img').forEach((image) => {
          gsap.fromTo(image, { clipPath: 'inset(0 0 100% 0)', scale: 1.22, yPercent: 12 }, {
            clipPath: 'inset(0 0 0% 0)',
            scale: 1.03,
            yPercent: 0,
            duration: 1.8,
            ease: 'expo.out',
            scrollTrigger: { trigger: image, start: 'top 72%', once: true },
          });
          gsap.fromTo(image, { yPercent: -7 }, {
            yPercent: 7,
            ease: 'none',
            scrollTrigger: { trigger: image, start: 'top bottom', end: 'bottom top', scrub: 1.8 },
          });
        });
      });

      scope.querySelectorAll(textGroupSelector).forEach((group, groupIndex) => {
        const candidates = [...group.querySelectorAll(textElementSelector)].filter((item) => (
          !item.closest('.section-display-title, .section-index')
          && !item.matches('.section-heading > .eyebrow')
        ));
        const textItems = candidates.filter(
          (item) => !candidates.some((parent) => parent !== item && parent.contains(item)),
        );
        if (!textItems.length) return;
        gsap.set(textItems, {
          x: groupIndex % 2 ? 72 : -72,
          y: 94,
          scale: 0.86,
          autoAlpha: 0,
          filter: 'blur(20px)',
          clipPath: 'inset(0 0 58% 0)',
        });
        gsap.to(textItems, {
          x: 0,
          y: 0,
          scale: 1,
          autoAlpha: 1,
          filter: 'blur(0px)',
          clipPath: 'inset(0 0 0% 0)',
          duration: 1.5,
          stagger: 0.09,
          ease: 'expo.out',
          scrollTrigger: { trigger: group, start: 'top 66%', once: true },
        });
      });
    }, scope);

    return () => context.revert();
  }, [scopeRef]);

  return null;
}
