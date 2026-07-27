import { useLayoutEffect, useMemo, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import './ScrollReveal.css';

gsap.registerPlugin(ScrollTrigger);

export default function ScrollReveal({
  children,
  baseOpacity = 0.08,
  enableBlur = true,
  baseRotation = 5,
  blurStrength = 12,
  className = '',
}) {
  const containerRef = useRef(null);
  const text = typeof children === 'string' ? children : '';
  const glyphs = useMemo(() => Array.from(text), [text]);

  useLayoutEffect(() => {
    const element = containerRef.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const context = gsap.context(() => {
      const words = element.querySelectorAll('.scroll-reveal-glyph');
      gsap.fromTo(element, {
        rotate: baseRotation,
        transformOrigin: '0% 50%',
      }, {
        rotate: 0,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top 88%',
          end: 'bottom 48%',
          scrub: 1.35,
        },
      });
      gsap.fromTo(words, {
        opacity: baseOpacity,
        yPercent: 95,
        filter: enableBlur ? `blur(${blurStrength}px)` : 'none',
      }, {
        opacity: 1,
        yPercent: 0,
        filter: 'blur(0px)',
        stagger: 0.035,
        ease: 'none',
        scrollTrigger: {
          trigger: element,
          start: 'top 86%',
          end: 'bottom 46%',
          scrub: 1.2,
        },
      });
    }, element);

    return () => context.revert();
  }, [baseOpacity, baseRotation, blurStrength, enableBlur]);

  return (
    <h2 ref={containerRef} className={`scroll-reveal ${className}`.trim()} aria-label={text}>
      <span aria-hidden="true">
        {glyphs.map((glyph, index) => glyph === ' '
          ? <span key={`space-${index}`}> </span>
          : <span className="scroll-reveal-glyph" key={`${glyph}-${index}`}>{glyph}</span>)}
      </span>
    </h2>
  );
}
