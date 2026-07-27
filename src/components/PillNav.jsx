import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import './PillNav.css';

const PillNav = ({
  logo,
  logoAlt = '王陈鑫个人作品集',
  items = [],
  activeHref,
  className = '',
  ease = 'power3.out',
  baseColor = '#080b10',
  pillColor = '#10151c',
  hoveredPillTextColor = '#03100f',
  pillTextColor = '#cbd4dc',
  onMobileMenuClick,
  initialLoadAnimation = true,
}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const circleRefs = useRef([]);
  const timelineRefs = useRef([]);
  const activeTweenRefs = useRef([]);
  const logoImgRef = useRef(null);
  const logoRef = useRef(null);
  const logoTweenRef = useRef(null);
  const hamburgerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const navItemsRef = useRef(null);

  useEffect(() => {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timelines = timelineRefs.current;
    const activeTweens = activeTweenRefs.current;

    const layout = () => {
      circleRefs.current.forEach((circle, index) => {
        if (!circle?.parentElement) return;

        const pill = circle.parentElement;
        const { width, height } = pill.getBoundingClientRect();
        const radius = ((width * width) / 4 + height * height) / (2 * height);
        const diameter = Math.ceil(2 * radius) + 2;
        const delta = Math.ceil(
          radius - Math.sqrt(Math.max(0, radius * radius - (width * width) / 4)),
        ) + 1;
        const originY = diameter - delta;

        Object.assign(circle.style, {
          width: `${diameter}px`,
          height: `${diameter}px`,
          bottom: `-${delta}px`,
        });

        const label = pill.querySelector('.pill-label');
        const hoverLabel = pill.querySelector('.pill-label-hover');

        gsap.set(circle, {
          xPercent: -50,
          scale: 0,
          transformOrigin: `50% ${originY}px`,
        });
        if (label) gsap.set(label, { y: 0 });
        if (hoverLabel) gsap.set(hoverLabel, { y: height + 12, opacity: 0 });

        timelineRefs.current[index]?.kill();
        const timeline = gsap.timeline({ paused: true });
        const duration = reduceMotion ? 0.01 : 2;

        timeline.to(circle, { scale: 1.2, duration, ease, overwrite: 'auto' }, 0);
        if (label) {
          timeline.to(label, { y: -(height + 8), duration, ease, overwrite: 'auto' }, 0);
        }
        if (hoverLabel) {
          gsap.set(hoverLabel, { y: Math.ceil(height + 100), opacity: 0 });
          timeline.to(hoverLabel, { y: 0, opacity: 1, duration, ease, overwrite: 'auto' }, 0);
        }

        timelineRefs.current[index] = timeline;
      });
    };

    layout();
    window.addEventListener('resize', layout);
    document.fonts?.ready.then(layout).catch(() => {});

    const menu = mobileMenuRef.current;
    if (menu) gsap.set(menu, { visibility: 'hidden', opacity: 0, y: 10 });

    if (initialLoadAnimation && !reduceMotion) {
      if (logoRef.current) {
        gsap.fromTo(
          logoRef.current,
          { scale: 0, opacity: 0 },
          { scale: 1, opacity: 1, duration: 0.65, ease },
        );
      }
      if (navItemsRef.current) {
        gsap.fromTo(
          navItemsRef.current,
          { clipPath: 'inset(0 100% 0 0)', opacity: 0 },
          { clipPath: 'inset(0 0% 0 0)', opacity: 1, duration: 0.75, delay: 0.08, ease },
        );
      }
    }

    return () => {
      window.removeEventListener('resize', layout);
      timelines.forEach((timeline) => timeline?.kill());
      activeTweens.forEach((tween) => tween?.kill());
      logoTweenRef.current?.kill();
    };
  }, [ease, initialLoadAnimation, items]);

  const handleEnter = (index) => {
    const timeline = timelineRefs.current[index];
    if (!timeline) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = timeline.tweenTo(timeline.duration(), {
      duration: 0.3,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLeave = (index) => {
    const timeline = timelineRefs.current[index];
    if (!timeline) return;
    activeTweenRefs.current[index]?.kill();
    activeTweenRefs.current[index] = timeline.tweenTo(0, {
      duration: 0.2,
      ease,
      overwrite: 'auto',
    });
  };

  const handleLogoEnter = () => {
    if (!logoImgRef.current) return;
    logoTweenRef.current?.kill();
    logoTweenRef.current = gsap.fromTo(
      logoImgRef.current,
      { rotate: 0 },
      { rotate: 360, duration: 0.45, ease, overwrite: 'auto' },
    );
  };

  const setMobileMenu = (open) => {
    setIsMobileMenuOpen(open);
    const lines = hamburgerRef.current?.querySelectorAll('.hamburger-line');
    const menu = mobileMenuRef.current;

    if (lines?.length === 2) {
      gsap.to(lines[0], { rotation: open ? 45 : 0, y: open ? 3 : 0, duration: 0.25, ease });
      gsap.to(lines[1], { rotation: open ? -45 : 0, y: open ? -3 : 0, duration: 0.25, ease });
    }

    if (menu && open) {
      gsap.set(menu, { visibility: 'visible' });
      gsap.fromTo(
        menu,
        { opacity: 0, y: 10, scale: 0.97 },
        { opacity: 1, y: 0, scale: 1, duration: 0.3, ease, transformOrigin: 'top center' },
      );
    } else if (menu) {
      gsap.to(menu, {
        opacity: 0,
        y: 10,
        scale: 0.97,
        duration: 0.2,
        ease,
        onComplete: () => gsap.set(menu, { visibility: 'hidden' }),
      });
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenu(!isMobileMenuOpen);
    onMobileMenuClick?.();
  };

  const cssVars = {
    '--pill-base': baseColor,
    '--pill-bg': pillColor,
    '--pill-hover-text': hoveredPillTextColor,
    '--pill-text': pillTextColor ?? baseColor,
  };

  return (
    <div className="pill-nav-container" style={cssVars}>
      <nav className={`pill-nav ${className}`.trim()} aria-label="主导航">
        <a
          className="pill-logo"
          href={items[0]?.href || '#top'}
          aria-label="返回首页"
          onMouseEnter={handleLogoEnter}
          ref={logoRef}
        >
          <img src={logo} alt={logoAlt} ref={logoImgRef} />
        </a>

        <div className="pill-nav-items desktop-only" ref={navItemsRef}>
          <ul className="pill-list">
            {items.map((item, index) => (
              <li key={item.href || `pill-${index}`}>
                <a
                  href={item.href}
                  className={`pill${activeHref === item.href ? ' is-active' : ''}`}
                  aria-label={item.ariaLabel || item.label}
                  aria-current={activeHref === item.href ? 'page' : undefined}
                  onMouseEnter={() => handleEnter(index)}
                  onMouseLeave={() => handleLeave(index)}
                  onFocus={() => handleEnter(index)}
                  onBlur={() => handleLeave(index)}
                >
                  <span
                    className="hover-circle"
                    aria-hidden="true"
                    ref={(element) => { circleRefs.current[index] = element; }}
                  />
                  <span className="label-stack">
                    <span className="pill-label">{item.label}</span>
                    <span className="pill-label-hover" aria-hidden="true">{item.label}</span>
                  </span>
                </a>
              </li>
            ))}
          </ul>
        </div>

        <button
          type="button"
          className="mobile-menu-button mobile-only"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? '关闭导航菜单' : '打开导航菜单'}
          aria-expanded={isMobileMenuOpen}
          aria-controls="mobile-pill-menu"
          ref={hamburgerRef}
        >
          <span className="hamburger-line" />
          <span className="hamburger-line" />
        </button>
      </nav>

      <div
        id="mobile-pill-menu"
        className="mobile-menu-popover mobile-only"
        ref={mobileMenuRef}
        aria-hidden={!isMobileMenuOpen}
      >
        <ul className="mobile-menu-list">
          {items.map((item, index) => (
            <li key={item.href || `mobile-pill-${index}`}>
              <a
                href={item.href}
                className={`mobile-menu-link${activeHref === item.href ? ' is-active' : ''}`}
                aria-current={activeHref === item.href ? 'page' : undefined}
                onClick={() => setMobileMenu(false)}
              >
                <span>{String(index + 1).padStart(2, '0')}</span>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default PillNav;
