import { useEffect } from 'react';
import './ClickPulse.css';

const interactiveSelector = 'button, a[href], [role="button"]';

export default function ClickPulse() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined;

    const createPulse = (x, y, warm = false) => {
      const pulse = document.createElement('span');
      pulse.className = `global-click-pulse${warm ? ' is-warm' : ''}`;
      pulse.style.left = `${x}px`;
      pulse.style.top = `${y}px`;
      pulse.addEventListener('animationend', () => pulse.remove(), { once: true });
      document.body.appendChild(pulse);
    };

    const onPointerDown = (event) => {
      const target = event.target instanceof Element ? event.target.closest(interactiveSelector) : null;
      if (!target) return;
      createPulse(event.clientX, event.clientY, Boolean(target.closest('.commercial, .flow-warm')));
    };
    const onKeyDown = (event) => {
      if (event.key !== 'Enter' && event.key !== ' ') return;
      const target = event.target instanceof Element ? event.target.closest(interactiveSelector) : null;
      if (!target) return;
      const rect = target.getBoundingClientRect();
      createPulse(rect.left + rect.width / 2, rect.top + rect.height / 2, Boolean(target.closest('.commercial, .flow-warm')));
    };

    document.addEventListener('pointerdown', onPointerDown, { passive: true });
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
      document.querySelectorAll('.global-click-pulse').forEach((pulse) => pulse.remove());
    };
  }, []);

  return null;
}
