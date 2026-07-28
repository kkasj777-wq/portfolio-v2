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
    if (!scope) return undefined;

    const loader = scope.querySelector('.page-loader');
    const counter = scope.querySelector('.page-loader-count');
    const progress = { value: 0 };
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const skipLoader = Boolean(window.location.hash && window.location.hash !== '#top');
    const interactiveRoots = [scope.querySelector('.pill-nav-container'), scope.querySelector('main')].filter(Boolean);
    const setPageInteractive = (interactive) => {
      interactiveRoots.forEach((root) => {
        if (interactive) root.removeAttribute('inert');
        else root.setAttribute('inert', '');
      });
    };
    const media = gsap.matchMedia();
    let loaderPlayed = false;

    media.add(
      {
        isDesktop: '(min-width: 769px)',
        isMobile: '(max-width: 768px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isMobile, reduceMotion } = context.conditions;
        if (!loader || reduceMotion || skipLoader || loaderPlayed) {
          if (loader) gsap.set(loader, { autoAlpha: 0, pointerEvents: 'none' });
          document.body.classList.remove('is-page-loading');
          setPageInteractive(true);
          return undefined;
        }

        loaderPlayed = true;
        document.body.classList.add('is-page-loading');
        setPageInteractive(false);
        const pace = isMobile ? 0.82 : 1;
        const heroVideoFrom = isMobile
          ? { scale: 1.12 }
          : { scale: 1.22, filter: 'saturate(.28) contrast(1.22) brightness(.38)' };
        const heroVideoTo = isMobile
          ? { scale: 1, duration: 2.05 * pace, clearProps: 'transform' }
          : { scale: 1, filter: 'saturate(.78) contrast(1.08) brightness(.78)', duration: 2.5 * pace, clearProps: 'transform,filter' };
        progress.value = 0;
        if (counter) counter.textContent = '00';

        const opening = gsap.timeline({
          defaults: { ease: 'expo.out' },
          onComplete: () => {
            document.body.classList.remove('is-page-loading');
            setPageInteractive(true);
          },
        });

        opening
          .addLabel('loader', 0)
          .fromTo(
            '.page-loader-header > *',
            { y: 22, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.68 * pace, stagger: 0.08 },
            'loader+=0.08',
          )
          .fromTo(
            '.page-loader-title-window strong',
            { yPercent: 118, scaleX: 0.68, transformOrigin: 'left center' },
            { yPercent: 0, scaleX: 1, duration: 1.05 * pace, ease: 'power4.out' },
            'loader+=0.18',
          )
          .fromTo(
            '.page-loader-role > *',
            { y: 18, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.62 * pace, stagger: 0.07 },
            'loader+=0.52',
          )
          .fromTo(
            '.page-loader-track i',
            { scaleX: 0, transformOrigin: 'left center' },
            { scaleX: 1, duration: 1.3 * pace, ease: 'power2.inOut' },
            'loader+=0.34',
          )
          .to(
            progress,
            {
              value: 100,
              duration: 1.25 * pace,
              ease: 'power2.inOut',
              onUpdate: () => {
                if (counter) counter.textContent = String(Math.round(progress.value)).padStart(2, '0');
              },
            },
            'loader+=0.34',
          )
          .fromTo(
            '.page-loader-footer > span, .page-loader-count',
            { y: 16, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.56 * pace, stagger: 0.08 },
            'loader+=0.26',
          )
          .addLabel('open', 1.62 * pace)
          .to(
            '.page-loader-content',
            { y: -30, autoAlpha: 0, duration: 0.48 * pace, ease: 'power3.in' },
            'open',
          )
          .to(
            '.page-loader-grid',
            { autoAlpha: 0, duration: 0.42 * pace },
            'open',
          )
          .to(
            '.page-loader-panel-top',
            { yPercent: -102, duration: 1.08 * pace, ease: 'power4.inOut' },
            'open+=0.12',
          )
          .to(
            '.page-loader-panel-bottom',
            { yPercent: 102, duration: 1.08 * pace, ease: 'power4.inOut' },
            '<',
          )
          .set('.page-loader', { autoAlpha: 0, pointerEvents: 'none' }, 'open+=1.22')
          .call(
            () => {
              document.body.classList.remove('is-page-loading');
              setPageInteractive(true);
            },
            [],
            'open+=1.22',
          )
          .fromTo(
            '.hero-reel video',
            heroVideoFrom,
            heroVideoTo,
            'open+=0.18',
          )
          .fromTo(
            '.pill-nav-container',
            { y: -34, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.86 * pace, clearProps: 'transform,opacity,visibility' },
            'open+=0.62',
          )
          .fromTo(
            '.hero-kicker',
            { y: 34, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.9 * pace, clearProps: 'transform,opacity,visibility' },
            'open+=0.58',
          )
          .fromTo(
            '.hero h1 > span, .hero h1 > em',
            { y: 96, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 1.28 * pace, stagger: 0.13, clearProps: 'transform,opacity,visibility' },
            'open+=0.66',
          )
          .fromTo(
            '.hero-role, .hero-intro, .hero-actions > *, .hero-metrics > div',
            { y: 38, autoAlpha: 0 },
            { y: 0, autoAlpha: 1, duration: 0.94 * pace, stagger: 0.07, clearProps: 'transform,opacity,visibility' },
            'open+=1.02',
          )
          .fromTo(
            '.hero-monument, .hero-side, .reel-counter, .scroll-cue',
            { autoAlpha: 0 },
            { autoAlpha: 1, duration: 0.82 * pace, stagger: 0.06, clearProps: 'opacity,visibility' },
            'open+=1.12',
          );

        return () => {
          document.body.classList.remove('is-page-loading');
          setPageInteractive(true);
        };
      },
      scope,
    );

    const textTargets = prefersReducedMotion ? [] : [...scope.querySelectorAll(textRevealSelector)];
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
      document.body.classList.remove('is-page-loading');
      setPageInteractive(true);
      textTargets.forEach((target) => {
        target.classList.remove('portfolio-text-reveal', 'is-text-visible');
        target.style.removeProperty('--text-reveal-delay');
      });
      media.revert();
    };
  }, [scopeRef]);

  return null;
}
