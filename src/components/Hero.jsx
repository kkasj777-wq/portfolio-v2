import { useEffect, useRef } from 'react';

export default function Hero({ stats }) {
  const countRef = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    if (countRef.current) {
      countRef.current.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    }
    return () => obs.disconnect();
  }, []);

  const totalWorks = stats.length;
  const totalEps = stats.reduce((acc, w) => acc + (w.ep_count || 0), 0);
  const categories = new Set(stats.map((w) => w.category)).size;
  const featured = stats[0];

  return (
    <section id="top" className="hero">
      <div className="hero-video-bg">
        <div className="hero-mesh" />
        <div className="hero-noise" />
      </div>

      <div className="hero-content" ref={countRef}>
        <div className="container hero-grid">
          <div className="hero-left">
            <div className="hero-label reveal">
              <span className="hero-status" /> AI Director · Designer · Screenwriter
            </div>
            <h1 className="hero-title reveal">
              <span className="gradient-text">王陈鑫</span>
            </h1>
            <p className="hero-subtitle reveal">
              20岁AI导演 / Sora全流程创作专家<br />
              15集AI系列剧集操盘 / 3部商业短剧实战
            </p>
            <p className="hero-desc reveal">
              致力于将实拍导演逻辑注入AIGC生产力。不只是 Prompt 生成，
              而是构建具备一致性、叙事张力与情感内核的 AI 影像宇宙。
            </p>
            <div className="hero-actions reveal">
              <a href="#projects" className="btn btn-primary">浏览作品</a>
              <a href="#contact" className="btn">联系合作</a>
            </div>
          </div>

          <div className="hero-right reveal">
            <div className="hero-featured">
              {featured?.thumb && <img src={featured.thumb} alt={featured.title} />}
              <div className="hero-featured-shade" />
              <div className="hero-featured-top">
                <span>FEATURED / 01</span>
                <span>{featured?.year || '2026'}</span>
              </div>
              <div className="hero-featured-copy">
                <span>{featured?.category || '影像作品'}</span>
                <strong>{featured?.title || 'Selected work'}</strong>
                <small>{featured?.role || '导演 / 创作'}</small>
              </div>
            </div>
            <div className="hero-stats reveal">
              <div className="hero-stat">
                <span className="hero-stat-num">{totalWorks}</span>
                <span className="hero-stat-label">作品</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">{totalEps}</span>
                <span className="hero-stat-label">分集</span>
              </div>
              <div className="hero-stat-divider" />
              <div className="hero-stat">
                <span className="hero-stat-num">{categories}</span>
                <span className="hero-stat-label">分类</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="hero-scroll">
        <span className="hero-scroll-line" />
        <span className="hero-scroll-text">Scroll</span>
      </div>

      <style>{`
        .hero {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding: 160px 48px 120px;
        }
        .hero-video-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          overflow: hidden;
        }
        .hero-mesh {
          position: absolute;
          inset: -20%;
          background:
            radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.22), transparent 40%),
            radial-gradient(circle at 80% 20%, rgba(6, 182, 212, 0.18), transparent 38%),
            radial-gradient(circle at 50% 70%, rgba(236, 72, 153, 0.15), transparent 45%),
            linear-gradient(135deg, #050508 0%, #0b0b14 50%, #050508 100%);
          animation: meshMove 20s ease-in-out infinite alternate;
        }
        @keyframes meshMove {
          0% { transform: translate(0,0) scale(1); }
          100% { transform: translate(-3%, -2%) scale(1.05); }
        }
        .hero-noise {
          position: absolute;
          inset: 0;
          opacity: 0.07;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
        .hero-content {
          position: relative;
          z-index: 1;
          width: 100%;
        }
        .hero-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 60px;
          align-items: center;
        }
        .hero-label {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          font-size: 0.85rem;
          color: var(--txt-dim);
          letter-spacing: 0.08em;
          margin-bottom: 24px;
        }
        .hero-status {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 12px #22c55e;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        .hero-title {
          font-size: clamp(64px, 8.5vw, 140px);
          font-weight: 900;
          letter-spacing: -0.06em;
          line-height: 1;
          margin-bottom: 28px;
        }
        .hero-subtitle {
          font-size: clamp(18px, 1.6vw, 26px);
          color: var(--txt-dim);
          line-height: 1.6;
          margin-bottom: 24px;
          font-weight: 500;
        }
        .hero-desc {
          max-width: 560px;
          font-size: clamp(15px, 1.1vw, 19px);
          color: var(--txt-muted);
          line-height: 1.8;
          margin-bottom: 40px;
        }
        .hero-actions {
          display: flex;
          gap: 16px;
          flex-wrap: wrap;
        }
        .hero-right {
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .hero-stats {
          display: flex;
          align-items: center;
          gap: 36px;
          padding: 36px 48px;
          border-radius: 24px;
        }
        .hero-stat {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
        }
        .hero-stat-num {
          font-size: clamp(40px, 4vw, 64px);
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          line-height: 1;
        }
        .hero-stat-label {
          font-size: 0.85rem;
          color: var(--txt-dim);
          letter-spacing: 0.1em;
        }
        .hero-stat-divider {
          width: 1px;
          height: 56px;
          background: rgba(255,255,255,0.1);
        }
        .hero-scroll {
          position: absolute;
          left: 48px;
          bottom: 40px;
          display: flex;
          align-items: center;
          gap: 12px;
          color: var(--txt-muted);
          font-size: 0.75rem;
          letter-spacing: 0.1em;
        }
        .hero-scroll-line {
          width: 1px;
          height: 60px;
          background: rgba(255,255,255,0.15);
          position: relative;
          overflow: hidden;
        }
        .hero-scroll-line::after {
          content: "";
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 50%;
          background: rgba(255,255,255,0.6);
          animation: scrollLine 1.8s ease-in-out infinite;
        }
        @keyframes scrollLine {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        @media (max-width: 1024px) {
          .hero-grid { grid-template-columns: 1fr; text-align: center; }
          .hero-desc { margin: 0 auto 40px; }
          .hero-actions { justify-content: center; }
          .hero-right { display: none; }
        }
        @media (max-width: 768px) {
          .hero { padding: 140px 24px 100px; }
          .hero-scroll { left: 24px; }
        }
      `}</style>
    </section>
  );
}
