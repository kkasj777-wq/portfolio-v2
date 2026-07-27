import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './FlowingMenu.css';

function FlowingMenuItem({ item, speed, colors }) {
  const itemRef = useRef(null);
  const marqueeRef = useRef(null);
  const innerRef = useRef(null);
  const loopRef = useRef(null);
  const [repetitions, setRepetitions] = useState(4);

  useEffect(() => {
    const inner = innerRef.current;
    const firstPart = inner?.querySelector('.flowing-menu-part');
    if (!inner || !firstPart || window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return undefined;
    const update = () => setRepetitions(Math.max(4, Math.ceil(window.innerWidth / Math.max(1, firstPart.offsetWidth)) + 2));
    update();
    window.addEventListener('resize', update, { passive: true });
    return () => window.removeEventListener('resize', update);
  }, [item.image, item.text]);

  useEffect(() => {
    const inner = innerRef.current;
    const firstPart = inner?.querySelector('.flowing-menu-part');
    if (!inner || !firstPart || window.matchMedia('(hover: none), (prefers-reduced-motion: reduce)').matches) return undefined;
    loopRef.current?.kill();
    loopRef.current = gsap.to(inner, { x: -firstPart.offsetWidth, duration: speed, ease: 'none', repeat: -1 });
    return () => loopRef.current?.kill();
  }, [repetitions, speed]);

  const reveal = (event) => {
    const itemElement = itemRef.current;
    const marquee = marqueeRef.current;
    const inner = innerRef.current;
    if (!itemElement || !marquee || !inner) return;
    const rect = itemElement.getBoundingClientRect();
    const fromTop = event?.clientY ? event.clientY - rect.top < rect.height / 2 : false;
    gsap.timeline({ defaults: { duration: 0.72, ease: 'expo.out' } })
      .set(marquee, { yPercent: fromTop ? -102 : 102 })
      .set(inner, { yPercent: fromTop ? 102 : -102 })
      .to([marquee, inner], { yPercent: 0 }, 0);
  };
  const hide = (event) => {
    const rect = itemRef.current?.getBoundingClientRect();
    if (!rect) return;
    const toTop = event?.clientY ? event.clientY - rect.top < rect.height / 2 : true;
    gsap.to(marqueeRef.current, { yPercent: toTop ? -102 : 102, duration: 0.58, ease: 'expo.inOut' });
    gsap.to(innerRef.current, { yPercent: toTop ? 102 : -102, duration: 0.58, ease: 'expo.inOut' });
  };

  return (
    <div ref={itemRef} className="flowing-menu-item" style={{ borderColor: colors.border }}>
      <a className="flowing-menu-link" href={item.link} onMouseEnter={reveal} onMouseLeave={hide} onFocus={reveal} onBlur={hide}>
        <span>{item.text}</span><small>{item.meta}</small>
      </a>
      <div ref={marqueeRef} className="flowing-menu-marquee" style={{ background: colors.marqueeBg }} aria-hidden="true">
        <div ref={innerRef} className="flowing-menu-inner">
          {Array.from({ length: repetitions }, (_, index) => (
            <div className="flowing-menu-part" key={index} style={{ color: colors.marqueeText }}>
              <span>{item.text}</span><i style={{ backgroundImage: `url(${item.image})` }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function FlowingMenu({ items = [], speed = 15 }) {
  const colors = { border: 'rgba(101,255,245,.24)', marqueeBg: '#54f2e2', marqueeText: '#031213' };
  return <nav className="flowing-menu" aria-label="作品集快速导航">{items.map((item) => <FlowingMenuItem item={item} speed={speed} colors={colors} key={item.link} />)}</nav>;
}
