import { useLayoutEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const headingFrameSelector = '.portfolio-stage .section-heading';

const contentFrameSelector = [
  '.portfolio-stage .archive-switch',
  '.portfolio-stage .series-portals > button',
  '.portfolio-stage .work-filters',
  '.portfolio-stage .archive-status',
  '.portfolio-stage .work-grid > .work-card',
  '.portfolio-stage .load-more',
  '.portfolio-stage .writing-feature',
  '.portfolio-stage .writing-methods',
  '.portfolio-stage .script-library-heading',
  '.portfolio-stage .script-library-grid > .script-card',
  '.portfolio-stage .writing-archive',
  '.portfolio-stage .commercial-overview > *',
  '.portfolio-stage .redfruit-strip > button',
  '.portfolio-stage .about-layout > *',
  '.portfolio-stage .experience-list > article',
  '.portfolio-stage .award-strip',
  '.portfolio-stage .strength-grid > article',
  '.portfolio-stage .contact-inner',
].join(',');

const frameImageSelector = '.work-image img, .series-portals img, .writing-still img, .commercial-lead > img, .redfruit-frame img';

export default function PortfolioMotion({ scopeRef }) {
  useLayoutEffect(() => {
    const scope = scopeRef.current || document.querySelector('.app');
    if (!scope) return undefined;

    const loader = scope.querySelector('.page-loader');
    const counter = scope.querySelector('.page-loader-count');
    const progress = { value: 0 };
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

    media.add(
      {
        isDesktop: '(min-width: 769px)',
        isMobile: '(max-width: 768px)',
        reduceMotion: '(prefers-reduced-motion: reduce)',
      },
      (context) => {
        const { isMobile, reduceMotion } = context.conditions;
        const allFrameSelector = `${headingFrameSelector},${contentFrameSelector}`;
        const boundTargets = new Set();
        const triggerByTarget = new Map();
        const motionTriggers = new Set();
        const pendingAddedNodes = new Set();
        let mutationFrame = 0;
        let active = true;

        const clearFrameStyles = (target) => {
          gsap.killTweensOf(target);
          const images = [...target.querySelectorAll(frameImageSelector)];
          if (images.length) {
            gsap.killTweensOf(images);
            gsap.set(images, { clearProps: 'transform' });
          }
          gsap.set(target, { clearProps: 'transform,opacity,visibility,clipPath,transformOrigin,willChange' });
          target.removeAttribute('data-portfolio-motion-bound');
        };

        const releaseTarget = (target) => {
          const trigger = triggerByTarget.get(target);
          if (trigger) {
            trigger.kill();
            motionTriggers.delete(trigger);
            triggerByTarget.delete(target);
          }
          clearFrameStyles(target);
          boundTargets.delete(target);
        };

        if (reduceMotion) {
          scope.querySelectorAll(allFrameSelector).forEach(clearFrameStyles);
          return undefined;
        }

        const bindHeadings = (targets) => {
          targets.forEach((target) => {
            if (boundTargets.has(target)) return;
            boundTargets.add(target);
            target.setAttribute('data-portfolio-motion-bound', 'heading');

            const tween = gsap.fromTo(
              target,
              {
                autoAlpha: 0,
                xPercent: isMobile ? -4 : -8,
                y: isMobile ? 24 : 36,
                scaleX: isMobile ? 0.95 : 0.86,
                clipPath: 'inset(0 100% 0 0)',
                transformOrigin: 'left center',
              },
              {
                autoAlpha: 1,
                xPercent: 0,
                y: 0,
                scaleX: 1,
                clipPath: 'inset(0 0% 0 0)',
                duration: isMobile ? 0.9 : 1.28,
                ease: 'expo.out',
                onStart: () => {
                  target.style.willChange = 'transform,opacity,clip-path';
                },
                clearProps: 'transform,opacity,visibility,clipPath,transformOrigin,willChange',
                scrollTrigger: {
                  trigger: target,
                  start: 'top 86%',
                  once: true,
                },
              },
            );

            if (tween.scrollTrigger) {
              motionTriggers.add(tween.scrollTrigger);
              triggerByTarget.set(target, tween.scrollTrigger);
            }
          });
        };

        const bindContentFrames = (targets) => {
          const freshTargets = targets.filter((target) => !boundTargets.has(target));
          if (!freshTargets.length) return;

          freshTargets.forEach((target) => {
            boundTargets.add(target);
            target.setAttribute('data-portfolio-motion-bound', 'content');
          });

          gsap.set(
            freshTargets,
            isMobile
              ? {
                  autoAlpha: 0,
                  y: 48,
                  scale: 0.975,
                  transformOrigin: '50% 85%',
                }
              : {
                  autoAlpha: 0,
                  y: 88,
                  scale: 0.935,
                  rotationX: 8,
                  clipPath: 'inset(10% 0 0 0 round 20px)',
                  transformPerspective: 1200,
                  transformOrigin: '50% 85%',
                },
          );

          const created = ScrollTrigger.batch(freshTargets, {
            start: 'top 88%',
            once: true,
            interval: 0.12,
            batchMax: isMobile ? 2 : 4,
            onEnter: (batch) => {
              const connectedBatch = batch.filter((target) => active && target.isConnected && scope.contains(target));
              if (!connectedBatch.length) return;
              gsap.set(connectedBatch, { willChange: isMobile ? 'transform,opacity' : 'transform,opacity,clip-path' });
              gsap.to(connectedBatch, {
                autoAlpha: 1,
                y: 0,
                scale: 1,
                rotationX: 0,
                clipPath: isMobile ? undefined : 'inset(0% 0 0 0 round 20px)',
                duration: isMobile ? 0.82 : 1.12,
                stagger: isMobile ? 0.08 : 0.11,
                ease: 'power4.out',
                overwrite: 'auto',
                clearProps: 'transform,opacity,visibility,clipPath,transformOrigin,willChange',
              });

              const images = connectedBatch.flatMap((target) => [...target.querySelectorAll(frameImageSelector)]);
              if (images.length) {
                gsap.fromTo(
                  images,
                  { scale: isMobile ? 1.025 : 1.075 },
                  {
                    scale: 1,
                    duration: isMobile ? 1 : 1.45,
                    stagger: 0.025,
                    ease: 'power3.out',
                    overwrite: 'auto',
                    clearProps: 'transform',
                  },
                );
              }
            },
          });

          created.forEach((trigger) => {
            motionTriggers.add(trigger);
            triggerByTarget.set(trigger.trigger, trigger);
          });
        };

        const collectTargets = (node, selector) => {
          if (!(node instanceof Element)) return [];
          const targets = [];
          if (node.matches(selector)) targets.push(node);
          node.querySelectorAll(selector).forEach((target) => targets.push(target));
          return targets;
        };

        const bindWithin = (node) => {
          const headings = collectTargets(node, headingFrameSelector);
          const frames = collectTargets(node, contentFrameSelector);
          bindHeadings(headings);
          bindContentFrames(frames);
          return headings.length + frames.length;
        };

        const releaseWithin = (node) => {
          if (!(node instanceof Element)) return;
          const targets = [];
          if (node.hasAttribute('data-portfolio-motion-bound')) targets.push(node);
          node.querySelectorAll('[data-portfolio-motion-bound]').forEach((target) => targets.push(target));
          targets.forEach(releaseTarget);
        };

        bindHeadings([...scope.querySelectorAll(headingFrameSelector)]);
        bindContentFrames([...scope.querySelectorAll(contentFrameSelector)]);

        const observer = new MutationObserver((records) => {
          records.forEach((record) => {
            record.removedNodes.forEach(releaseWithin);
            record.addedNodes.forEach((node) => {
              if (node instanceof Element) pendingAddedNodes.add(node);
            });
          });
          if (!pendingAddedNodes.size || mutationFrame) return;
          mutationFrame = window.requestAnimationFrame(() => {
            mutationFrame = 0;
            const addedNodes = [...pendingAddedNodes].filter((node) => node.isConnected && scope.contains(node));
            pendingAddedNodes.clear();
            const boundCount = addedNodes.reduce((count, node) => count + bindWithin(node), 0);
            if (boundCount) ScrollTrigger.refresh();
          });
        });
        observer.observe(scope, { childList: true, subtree: true });

        document.fonts?.ready.then(() => {
          if (active) ScrollTrigger.refresh();
        });

        return () => {
          active = false;
          observer.disconnect();
          if (mutationFrame) window.cancelAnimationFrame(mutationFrame);
          pendingAddedNodes.clear();
          motionTriggers.forEach((trigger) => trigger.kill());
          [...boundTargets].forEach(clearFrameStyles);
          motionTriggers.clear();
          triggerByTarget.clear();
          boundTargets.clear();
        };
      },
      scope,
    );

    let hashFrame = 0;
    if (skipLoader) {
      hashFrame = window.requestAnimationFrame(() => {
        const target = document.getElementById(window.location.hash.slice(1));
        const previousScrollBehavior = document.documentElement.style.scrollBehavior;
        document.documentElement.style.scrollBehavior = 'auto';
        target?.scrollIntoView({ block: 'start' });
        document.documentElement.style.scrollBehavior = previousScrollBehavior;
        ScrollTrigger.refresh();
      });
    }

    return () => {
      if (hashFrame) window.cancelAnimationFrame(hashFrame);
      document.body.classList.remove('is-page-loading');
      setPageInteractive(true);
      media.revert();
    };
  }, [scopeRef]);

  return null;
}
