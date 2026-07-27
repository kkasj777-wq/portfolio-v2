import { useEffect, useRef } from 'react';

export default function Footer() {
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.15 });

    if (ref.current) {
      ref.current.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    }
    return () => obs.disconnect();
  }, []);

  return (
    <footer id="contact" className="footer" ref={ref}>
      <div className="footer-bg">
        <div className="footer-glow" />
      </div>
      <div className="footer-content">
        <div className="container footer-grid">
          <div className="footer-left reveal">
            <span className="label">Contact</span>
            <h2 className="footer-title">
              一起<br />做点<span className="gradient-text">有趣</span>的事
            </h2>
            <p className="footer-desc">
              如果你正在寻找能把导演逻辑、AI 技术与视觉设计串在一起的人，
              欢迎随时联系。无论是 AI 剧集、商业短剧还是视觉项目，都可以聊聊。
            </p>
            <a href="mailto:hello@wangchenxin.ai" className="btn btn-primary footer-cta">
              发送邮件
            </a>
          </div>

          <div className="footer-right reveal">
            <div className="footer-card glass">
              <div className="footer-row">
                <span className="footer-key">Email</span>
                <span className="footer-val">hello@wangchenxin.ai</span>
              </div>
              <div className="footer-row">
                <span className="footer-key">WeChat</span>
                <span className="footer-val">待补充</span>
              </div>
              <div className="footer-row">
                <span className="footer-key">Location</span>
                <span className="footer-val">重庆 / 全国可远程</span>
              </div>
              <div className="footer-row">
                <span className="footer-key">Role</span>
                <span className="footer-val">AI 导演 / AI 设计师 / 编剧</span>
              </div>
            </div>

            <div className="footer-links">
              {['小红书', 'Bilibili', 'Behance', 'GitHub'].map((l) => (
                <span key={l} className="footer-link reveal">{l}</span>
              ))}
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <div className="container footer-bottom-inner">
            <span className="footer-credit">王陈鑫 · AI Director Portfolio</span>
            <span className="footer-year">2026</span>
          </div>
        </div>
      </div>

      <style>{`
        .footer {
          position: relative;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          overflow: hidden;
          padding: 140px 48px 0;
        }
        .footer-bg {
          position: absolute;
          inset: 0;
          z-index: 0;
          pointer-events: none;
        }
        .footer-glow {
          position: absolute;
          bottom: -30%;
          right: -20%;
          width: 80vw;
          height: 80vw;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(139, 92, 246, 0.22), transparent 60%);
          filter: blur(80px);
          animation: footerGlow 12s ease-in-out infinite alternate;
        }
        @keyframes footerGlow {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(1.15); opacity: 1; }
        }
        .footer-content {
          position: relative;
          z-index: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          flex: 1;
        }
        .footer-grid {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 80px;
          align-items: center;
          flex: 1;
        }
        .footer-left .label { display: block; margin-bottom: 24px; }
        .footer-title {
          font-size: clamp(48px, 6vw, 100px);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.05em;
          margin-bottom: 32px;
        }
        .footer-desc {
          max-width: 520px;
          font-size: clamp(16px, 1.2vw, 20px);
          color: var(--txt-dim);
          line-height: 1.8;
          margin-bottom: 40px;
        }
        .footer-cta { font-size: 1.05rem; padding: 16px 32px; }
        .footer-card {
          padding: 40px;
          border-radius: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .footer-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
          font-size: 0.95rem;
        }
        .footer-row:last-child { border-bottom: none; padding-bottom: 0; }
        .footer-key { color: var(--txt-muted); }
        .footer-val { color: var(--txt); font-weight: 500; }
        .footer-links {
          display: flex;
          gap: 16px;
          margin-top: 28px;
          flex-wrap: wrap;
        }
        .footer-link {
          padding: 10px 20px;
          border-radius: 999px;
          border: 1px solid var(--line);
          color: var(--txt-dim);
          font-size: 0.85rem;
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .footer-link:hover {
          border-color: var(--accent);
          color: var(--txt);
          background: rgba(255,255,255,0.06);
        }
        .footer-bottom {
          padding: 28px 0;
          border-top: 1px solid rgba(255,255,255,0.06);
          margin-top: 80px;
        }
        .footer-bottom-inner {
          display: flex;
          justify-content: space-between;
          align-items: center;
          color: var(--txt-muted);
          font-size: 0.85rem;
        }
        @media (max-width: 1024px) {
          .footer-grid { grid-template-columns: 1fr; gap: 48px; text-align: center; }
          .footer-desc { margin: 0 auto 40px; }
          .footer-cta { margin: 0 auto; display: inline-flex; }
          .footer-links { justify-content: center; }
        }
        @media (max-width: 768px) {
          .footer { padding: 120px 24px 0; }
          .footer-card { padding: 28px; }
        }
      `}</style>
    </footer>
  );
}
