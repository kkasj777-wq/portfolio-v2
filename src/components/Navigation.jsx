import { useEffect, useState } from 'react';

export default function Navigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 80);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const links = [
    { label: '作品', href: '#projects' },
    { label: '经历', href: '#about' },
    { label: '优势', href: '#strengths' },
    { label: '联系', href: '#contact' },
  ];

  return (
    <header className={`nav ${scrolled ? 'nav-scrolled' : ''}`}>
      <div className="nav-inner">
        <a className="nav-logo" href="#top">
          <span className="nav-logo-mark">W</span>
          <span className="nav-logo-text">王陈鑫</span>
        </a>
        <nav className="nav-links">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="nav-link">
              {l.label}
            </a>
          ))}
        </nav>
        <a className="btn btn-primary nav-cta" href="#contact">
          联系我
        </a>
      </div>

      <style>{`
        .nav {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          z-index: 100;
          padding: 20px 48px;
          transition: all 0.35s ease;
        }
        .nav-scrolled {
          padding: 14px 48px;
          background: rgba(5, 5, 8, 0.75);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .nav-inner {
          max-width: var(--max-w);
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 24px;
        }
        .nav-logo {
          display: flex;
          align-items: center;
          gap: 12px;
          text-decoration: none;
          color: var(--txt);
          font-weight: 700;
          font-size: 1.1rem;
          letter-spacing: -0.02em;
        }
        .nav-logo-mark {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--accent), var(--accent-2));
          color: white;
          font-weight: 800;
          font-size: 1rem;
        }
        .nav-links {
          display: flex;
          gap: 8px;
          align-items: center;
        }
        .nav-link {
          padding: 10px 18px;
          border-radius: 999px;
          text-decoration: none;
          color: var(--txt-dim);
          font-size: 0.92rem;
          font-weight: 500;
          transition: all 0.2s ease;
        }
        .nav-link:hover {
          color: var(--txt);
          background: rgba(255,255,255,0.06);
        }
        .nav-cta {
          padding: 10px 22px;
          font-size: 0.9rem;
        }
        @media (max-width: 768px) {
          .nav { padding: 14px 20px; }
          .nav-scrolled { padding: 12px 20px; }
          .nav-links { display: none; }
          .nav-cta { display: none; }
        }
      `}</style>
    </header>
  );
}
