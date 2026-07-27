import { useCallback, useLayoutEffect, useRef } from 'react';
import Lenis from 'lenis';
import './ScrollStack.css';

export const ScrollStackItem = ({ children, itemClassName = '' }) => (
  <div className={`scroll-stack-card ${itemClassName}`.trim()}>{children}</div>
);

export default function ScrollStack({
  children,
  className = '',
  itemDistance = 120,
  itemScale = 0.016,
  itemStackDistance = 24,
  stackPosition = 120,
  baseScale = 0.84,
  rotationAmount = 0.22,
  blurAmount = 0.45,
  disabled = false,
}) {
  const rootRef = useRef(null);
  const cardsRef = useRef([]);
  const frameRef = useRef(0);
  const lenisRef = useRef(null);

  const updateCards = useCallback(() => {
    const root = rootRef.current;
    const cards = cardsRef.current;
    if (!root || !cards.length) return;

    const rootTop = root.getBoundingClientRect().top + window.scrollY;
    const end = rootTop + root.offsetHeight - window.innerHeight * 0.56;
    let topIndex = 0;

    cards.forEach((card, index) => {
      const cardTop = card.offsetTop + rootTop;
      const pinStart = cardTop - stackPosition - itemStackDistance * index;
      const pinRange = Math.max(1, end - pinStart);
      const progress = Math.min(1, Math.max(0, (window.scrollY - pinStart) / Math.min(420, pinRange)));
      const pinnedY = Math.min(Math.max(0, window.scrollY - pinStart), Math.max(0, end - pinStart));
      const scale = 1 - progress * (1 - Math.min(0.98, baseScale + index * itemScale));
      if (window.scrollY >= pinStart) topIndex = index;
      card.style.transform = `translate3d(0, ${pinnedY}px, 0) scale(${scale}) rotate(${index * rotationAmount * progress}deg)`;
    });

    cards.forEach((card, index) => {
      card.style.filter = index < topIndex ? `blur(${(topIndex - index) * blurAmount}px)` : 'none';
    });
  }, [baseScale, blurAmount, itemScale, itemStackDistance, rotationAmount, stackPosition]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root || disabled || window.matchMedia('(max-width: 768px)').matches || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;
    cardsRef.current = Array.from(root.querySelectorAll(':scope > .scroll-stack-inner > .scroll-stack-card'));
    cardsRef.current.forEach((card, index) => {
      card.style.marginBottom = index === cardsRef.current.length - 1 ? '0px' : `${itemDistance}px`;
    });

    const lenis = new Lenis({
      duration: 1.15,
      smoothWheel: true,
      wheelMultiplier: 0.92,
      touchMultiplier: 1.45,
      easing: (value) => Math.min(1, 1.001 - 2 ** (-10 * value)),
    });
    lenis.on('scroll', updateCards);
    lenisRef.current = lenis;
    const raf = (time) => {
      lenis.raf(time);
      frameRef.current = requestAnimationFrame(raf);
    };
    frameRef.current = requestAnimationFrame(raf);
    updateCards();

    const onResize = () => updateCards();
    window.addEventListener('resize', onResize, { passive: true });
    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', onResize);
      lenis.destroy();
      lenisRef.current = null;
      cardsRef.current.forEach((card) => {
        card.style.removeProperty('transform');
        card.style.removeProperty('filter');
        card.style.removeProperty('margin-bottom');
      });
      cardsRef.current = [];
    };
  }, [disabled, itemDistance, updateCards]);

  return (
    <div className={`scroll-stack ${className}`.trim()} ref={rootRef}>
      <div className="scroll-stack-inner">{children}</div>
    </div>
  );
}
