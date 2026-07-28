import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './MagicBento.css';

const CARD_SELECTOR = [
  '.series-portals > button',
  '.work-card',
  '.writing-feature',
  '.writing-methods article',
  '.script-card',
  '.script-character-grid article',
  '.episode-story-copy',
  '.writing-archive',
  '.commercial-lead',
  '.commercial-numbers',
  '.redfruit-strip button',
  '.identity-visual',
  '.about-copy',
  '.experience-list article',
  '.award-strip',
  '.strength-grid article',
].join(',');

const MOBILE_BREAKPOINT = 768;

const closestCard = (root, target) => {
  const card = target instanceof Element ? target.closest(CARD_SELECTOR) : null;
  return card && root.contains(card) ? card : null;
};

const createGlowLayer = () => {
  const layer = document.createElement('span');
  layer.className = 'magic-bento-glow-layer';
  layer.setAttribute('aria-hidden', 'true');
  return layer;
};

const prepareCard = (card) => {
  card.classList.add('magic-bento-card');
  if (!card.querySelector(':scope > .magic-bento-glow-layer')) card.appendChild(createGlowLayer());
};

const clearCardMotion = (card, resetTransform = true) => {
  card.classList.remove('is-magic-active');
  card.style.setProperty('--magic-intensity', '0');
  if (!resetTransform) return;
  gsap.killTweensOf(card);
  gsap.to(card, {
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    duration: 0.38,
    ease: 'power2.out',
    overwrite: true,
  });
};

function useEffectsDisabled(disableAnimations) {
  const [disabled, setDisabled] = useState(disableAnimations);

  useEffect(() => {
    const mobile = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT}px)`);
    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setDisabled(disableAnimations || mobile.matches || reducedMotion.matches);

    update();
    mobile.addEventListener('change', update);
    reducedMotion.addEventListener('change', update);
    return () => {
      mobile.removeEventListener('change', update);
      reducedMotion.removeEventListener('change', update);
    };
  }, [disableAnimations]);

  return disabled;
}

export default function MagicBento({
  children,
  className = '',
  disableAnimations = false,
  enableStars = true,
  enableSpotlight = true,
  enableBorderGlow = true,
  enableTilt = true,
  enableMagnetism = true,
  clickEffect = true,
  spotlightRadius = 280,
  particleCount = 7,
}) {
  const rootRef = useRef(null);
  const disabled = useEffectsDisabled(disableAnimations);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return undefined;

    const syncCards = (scope = root) => {
      if (scope instanceof Element && scope.matches(CARD_SELECTOR)) prepareCard(scope);
      scope.querySelectorAll?.(CARD_SELECTOR).forEach(prepareCard);
    };

    syncCards();
    const mutations = new MutationObserver((records) => {
      records.forEach((record) => record.addedNodes.forEach((node) => {
        if (node instanceof Element) syncCards(node);
      }));
    });
    mutations.observe(root, { childList: true, subtree: true });

    if (disabled) {
      return () => mutations.disconnect();
    }

    const spotlight = root.querySelector(':scope > .magic-bento-spotlight');
    let frame = 0;
    let point = null;
    let activeCard = null;
    const resetCardTransform = enableTilt || enableMagnetism;

    const cards = () => Array.from(root.querySelectorAll(CARD_SELECTOR));
    const resetCards = (except = null) => cards().forEach((card) => {
      if (card !== except) {
        card.style.setProperty('--magic-intensity', '0');
        card.classList.remove('is-magic-near');
      }
    });

    const updatePointerEffect = () => {
      frame = 0;
      if (!point) return;

      const hovered = closestCard(root, point.target);
      activeCard = hovered;
      const proximity = spotlightRadius * 0.52;
      const fadeDistance = spotlightRadius * 1.05;

      cards().forEach((card) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const distance = Math.max(0, Math.hypot(point.x - centerX, point.y - centerY) - Math.max(rect.width, rect.height) / 2);
        const intensity = distance <= proximity
          ? 1
          : Math.max(0, (fadeDistance - distance) / (fadeDistance - proximity));

        card.style.setProperty('--magic-x', `${((point.x - rect.left) / rect.width) * 100}%`);
        card.style.setProperty('--magic-y', `${((point.y - rect.top) / rect.height) * 100}%`);
        card.style.setProperty('--magic-radius', `${spotlightRadius}px`);
        card.style.setProperty('--magic-intensity', enableBorderGlow ? intensity.toFixed(3) : '0');
        card.classList.toggle('is-magic-near', intensity > 0.08);
      });

      if (enableSpotlight && spotlight) {
        spotlight.style.left = `${point.x}px`;
        spotlight.style.top = `${point.y}px`;
        spotlight.style.opacity = hovered ? '0.68' : '0.28';
      }

      if (hovered && (enableTilt || enableMagnetism)) {
        const rect = hovered.getBoundingClientRect();
        const offsetX = point.x - (rect.left + rect.width / 2);
        const offsetY = point.y - (rect.top + rect.height / 2);
        const canMove = hovered.matches('button, a') || Boolean(hovered.querySelector('button, a'));

        gsap.to(hovered, {
          x: enableMagnetism && canMove ? offsetX * 0.012 : 0,
          y: enableMagnetism && canMove ? offsetY * 0.012 : 0,
          rotateX: enableTilt && canMove ? Math.max(-1.4, Math.min(1.4, (-offsetY / rect.height) * 3)) : 0,
          rotateY: enableTilt && canMove ? Math.max(-1.4, Math.min(1.4, (offsetX / rect.width) * 3)) : 0,
          transformPerspective: 1100,
          duration: 0.22,
          ease: 'power2.out',
          overwrite: 'auto',
        });
      }
    };

    const requestPointerUpdate = (event) => {
      point = { x: event.clientX, y: event.clientY, target: event.target };
      if (!frame) frame = window.requestAnimationFrame(updatePointerEffect);
    };

    const spawnParticles = (card, event) => {
      if (!enableStars) return;
      const rect = card.getBoundingClientRect();
      const originX = event.clientX - rect.left;
      const originY = event.clientY - rect.top;

      Array.from({ length: particleCount }, (_, index) => {
        const particle = document.createElement('span');
        const angle = (Math.PI * 2 * index) / particleCount + Math.random() * 0.45;
        const distance = 28 + Math.random() * 64;
        particle.className = 'magic-bento-particle';
        particle.style.left = `${originX}px`;
        particle.style.top = `${originY}px`;
        particle.style.setProperty('--particle-x', `${Math.cos(angle) * distance}px`);
        particle.style.setProperty('--particle-y', `${Math.sin(angle) * distance}px`);
        particle.style.setProperty('--particle-delay', `${index * 24}ms`);
        particle.addEventListener('animationend', () => particle.remove(), { once: true });
        card.appendChild(particle);
        return particle;
      });
    };

    const handlePointerOver = (event) => {
      const card = closestCard(root, event.target);
      if (!card || (event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) return;
      if (activeCard && activeCard !== card) clearCardMotion(activeCard, resetCardTransform);
      activeCard = card;
      card.classList.add('is-magic-active');
      spawnParticles(card, event);
    };

    const handlePointerOut = (event) => {
      const card = closestCard(root, event.target);
      if (!card || (event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) return;
      clearCardMotion(card, resetCardTransform);
      activeCard = null;
    };

    const handleClick = (event) => {
      if (!clickEffect) return;
      const card = closestCard(root, event.target);
      if (!card) return;
      const rect = card.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const maxDistance = Math.max(
        Math.hypot(x, y),
        Math.hypot(x - rect.width, y),
        Math.hypot(x, y - rect.height),
        Math.hypot(x - rect.width, y - rect.height),
      );
      const ripple = document.createElement('span');
      ripple.className = 'magic-bento-ripple';
      ripple.style.width = `${maxDistance * 2}px`;
      ripple.style.height = `${maxDistance * 2}px`;
      ripple.style.left = `${x - maxDistance}px`;
      ripple.style.top = `${y - maxDistance}px`;
      card.appendChild(ripple);
      gsap.fromTo(ripple, { scale: 0, opacity: 0.64 }, {
        scale: 1,
        opacity: 0,
        duration: 0.76,
        ease: 'power2.out',
        onComplete: () => ripple.remove(),
      });
    };

    const handleFocusIn = (event) => {
      const card = closestCard(root, event.target);
      if (!card) return;
      card.classList.add('is-magic-active');
      card.style.setProperty('--magic-x', '50%');
      card.style.setProperty('--magic-y', '50%');
      card.style.setProperty('--magic-intensity', '1');
    };

    const handleFocusOut = (event) => {
      const card = closestCard(root, event.target);
      if (!card || (event.relatedTarget instanceof Node && card.contains(event.relatedTarget))) return;
      clearCardMotion(card, resetCardTransform);
    };

    const handleScopeLeave = () => {
      point = null;
      resetCards();
      if (spotlight) spotlight.style.opacity = '0';
      if (activeCard) clearCardMotion(activeCard, resetCardTransform);
      activeCard = null;
    };

    root.addEventListener('pointermove', requestPointerUpdate, { passive: true });
    root.addEventListener('pointerover', handlePointerOver, { passive: true });
    root.addEventListener('pointerout', handlePointerOut, { passive: true });
    root.addEventListener('pointerleave', handleScopeLeave, { passive: true });
    root.addEventListener('click', handleClick);
    root.addEventListener('focusin', handleFocusIn);
    root.addEventListener('focusout', handleFocusOut);

    return () => {
      mutations.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
      root.removeEventListener('pointermove', requestPointerUpdate);
      root.removeEventListener('pointerover', handlePointerOver);
      root.removeEventListener('pointerout', handlePointerOut);
      root.removeEventListener('pointerleave', handleScopeLeave);
      root.removeEventListener('click', handleClick);
      root.removeEventListener('focusin', handleFocusIn);
      root.removeEventListener('focusout', handleFocusOut);
      cards().forEach((card) => {
        card.classList.remove('magic-bento-card', 'is-magic-active', 'is-magic-near');
        card.querySelector(':scope > .magic-bento-glow-layer')?.remove();
      });
    };
  }, [clickEffect, disabled, enableBorderGlow, enableMagnetism, enableSpotlight, enableStars, enableTilt, particleCount, spotlightRadius]);

  return (
    <div className={`magic-bento-scope ${className}`} ref={rootRef}>
      <span className="magic-bento-spotlight" aria-hidden="true" />
      {children}
    </div>
  );
}
