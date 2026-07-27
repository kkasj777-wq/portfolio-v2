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

const textRevealSelector = [
  '.work-card .work-meta',
  '.work-card h3',
  '.work-card > p',
  '.work-card-slogan',
  '.series-portal-copy > *',
  '.writing-copy > *',
  '.writing-methods article > *',
  '.script-library-heading > *',
  '.script-card > *:not(.magic-bento-glow-layer)',
  '.commercial-numbers > *',
  '.redfruit-strip button > strong',
  '.redfruit-strip button > small',
  '.about-lead',
  '.about-data > div',
  '.tool-stack > *',
  '.tool-stack li',
  '.writing-copy dl > div',
  '.writing-numbers > div',
  '.experience-list article > *',
  '.award-strip article > *',
  '.strength-grid article > *:not(.corner):not(.magic-bento-glow-layer)',
  '.strength-grid li',
].join(',');

export default function PortfolioMotion({ scopeRef }) {
  useLayoutEffect(() => {
    const scope = scopeRef.current;
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
          const description = heading.querySelector(':scope > p');
          if (description) headingTimeline.fromTo(description, { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.35 }, 0.68);
        }

        const cards = section.querySelectorAll(cardSelector);
        if (cards.length) {
          gsap.fromTo(cards, {
            y: 190,
            scale: 0.84,
            rotateX: 13,
            transformPerspective: 1200,
            transformOrigin: 'center bottom',
            autoAlpha: 0,
            clipPath: 'inset(28% 0 0 0 round 18px)',
          }, {
            y: 0,
            scale: 1,
            rotateX: 0,
            autoAlpha: 1,
            clipPath: 'inset(0% 0 0 0 round 18px)',
            duration: 1.7,
            stagger: 0.19,
            ease: 'expo.out',
            clearProps: 'transform',
            scrollTrigger: { trigger: cards[0], start: 'top 79%', once: true },
          });
        }

        const textItems = section.querySelectorAll(textRevealSelector);
        if (textItems.length) {
          gsap.fromTo(textItems, {
            y: 86,
            scale: 0.94,
            autoAlpha: 0,
            filter: 'blur(16px)',
            clipPath: 'inset(0 0 52% 0)',
          }, {
            y: 0,
            scale: 1,
            autoAlpha: 1,
            filter: 'blur(0px)',
            clipPath: 'inset(0 0 0% 0)',
            duration: 1.55,
            stagger: 0.075,
            ease: 'power4.out',
            scrollTrigger: { trigger: textItems[0], start: 'top 84%', once: true },
          });
        }

        section.querySelectorAll('img').forEach((image) => {
          gsap.fromTo(image, { clipPath: 'inset(0 0 100% 0)', scale: 1.22, yPercent: 12 }, {
            clipPath: 'inset(0 0 0% 0)',
            scale: 1.03,
            yPercent: 0,
            duration: 1.8,
            ease: 'expo.out',
            scrollTrigger: { trigger: image, start: 'top 82%', once: true },
          });
          gsap.fromTo(image, { yPercent: -7 }, {
            yPercent: 7,
            ease: 'none',
            scrollTrigger: { trigger: image, start: 'top bottom', end: 'bottom top', scrub: 1.8 },
          });
        });
      });

      const contactItems = scope.querySelectorAll('.contact-inner > *');
      if (contactItems.length) {
        gsap.fromTo(contactItems, { y: 84, autoAlpha: 0, filter: 'blur(12px)' }, {
          y: 0,
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration: 1.45,
          stagger: 0.16,
          ease: 'power4.out',
          scrollTrigger: { trigger: '.contact', start: 'top 76%', once: true },
        });
      }

      const flowMenuItems = scope.querySelectorAll('.archive-flow-heading > *, .flowing-menu-item');
      if (flowMenuItems.length) {
        gsap.fromTo(flowMenuItems, { xPercent: -18, autoAlpha: 0, filter: 'blur(14px)' }, {
          xPercent: 0,
          autoAlpha: 1,
          filter: 'blur(0px)',
          duration: 1.45,
          stagger: 0.12,
          ease: 'expo.out',
          scrollTrigger: { trigger: '.archive-flow-section', start: 'top 78%', once: true },
        });
      }
    }, scope);

    return () => context.revert();
  }, [scopeRef]);

  return null;
}
