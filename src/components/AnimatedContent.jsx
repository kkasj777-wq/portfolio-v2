import { useLayoutEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedContent({
  children,
  distance = 120,
  direction = 'vertical',
  reverse = false,
  duration = 1.25,
  ease = 'power4.out',
  initialOpacity = 0,
  scale = 0.94,
  threshold = 0.18,
  delay = 0,
  className = '',
}) {
  const ref = useRef(null);

  useLayoutEffect(() => {
    const element = ref.current;
    if (!element || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    if (window.matchMedia('(max-width: 768px)').matches) {
      element.style.visibility = 'visible';
      return undefined;
    }

    const axis = direction === 'horizontal' ? 'x' : 'y';
    const offset = reverse ? -distance : distance;
    const animation = gsap.fromTo(element, {
      [axis]: offset,
      scale,
      opacity: initialOpacity,
      filter: 'blur(14px)',
      clipPath: direction === 'horizontal' ? 'inset(0 42% 0 0)' : 'inset(28% 0 0 0)',
      visibility: 'visible',
    }, {
      [axis]: 0,
      scale: 1,
      opacity: 1,
      filter: 'blur(0px)',
      clipPath: 'inset(0% 0% 0% 0%)',
      duration,
      delay,
      ease,
      scrollTrigger: {
        trigger: element,
        start: `top ${(1 - threshold) * 100}%`,
        once: true,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, [delay, direction, distance, duration, ease, initialOpacity, reverse, scale, threshold]);

  return <div ref={ref} className={className} style={{ visibility: 'hidden' }}>{children}</div>;
}
