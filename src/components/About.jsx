import { useEffect, useRef } from 'react';

export default function About() {
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.12 });

    if (ref.current) {
      ref.current.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    }
    return () => obs.disconnect();
  }, []);

  const stats = [
    { value: '15', label: 'AI 系列剧集分集' },
    { value: '3', label: '商业短剧实战' },
    { value: '30+', label: '现场场次调度' },
    { value: '2万字', label: '世界观架构' },
  ];

  const tech = [
    { group: 'AI 生成', items: ['Sora', 'Runway Gen-3', 'Luma Dream', 'Midjourney'] },
    { group: '传统工具', items: ['Pr / DaVinci', 'After Effects', 'Audition'] },
  ];

  const accolades = [
    '重庆“金色之秋”三等奖',
    '纪录片获团中央平台转载',
    '校团委宣传部负责人',
  ];

  return (
    <section id="about" className="about section" ref={ref}>
      <div className="container">
        <div className="about-grid">
          <div className="about-media reveal">
            <div className="about-avatar">
              <div className="about-avatar-gradient" />
              <div className="about-avatar-ring" />
              <span className="about-avatar-text">W</span>
            </div>
            <div className="about-contact glass">
              <div className="about-contact-row">
                <span className="about-contact-label">身份</span>
                <span>AI 导演 / AI 设计师 / 编剧</span>
              </div>
              <div className="about-contact-row">
                <span className="about-contact-label">院校</span>
                <span>重庆工程学院 · 数字媒体艺术</span>
              </div>
              <div className="about-contact-row">
                <span className="about-contact-label">邮箱</span>
                <span>hello@wangchenxin.ai</span>
              </div>
              <div className="about-contact-row">
                <span className="about-contact-label">微信</span>
                <span>待补充</span>
              </div>
            </div>
          </div>

          <div className="about-content">
            <div className="about-header reveal">
              <span className="label">Director Bio</span>
              <h2 className="title-lg">把实拍导演逻辑<br />注入 AIGC 生产力</h2>
            </div>

            <div className="about-body glass reveal">
              <p className="body-lg">
                不只是 Prompt 生成，而是构建具备一致性、叙事张力与情感内核的 AI 影像宇宙。
                从 2 万字世界观架构到 Sora 底层提示词协议，从 15 集 AI 长剧集的角色一致性管控，
                到商业短剧千万级流量池中的情绪波峰设计，我关注的是技术背后可被观众感知的叙事。
              </p>
              <div className="about-stats-row">
                {stats.map((s) => (
                  <div key={s.label} className="about-stat">
                    <span className="about-stat-value">{s.value}</span>
                    <span className="about-stat-label">{s.label}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="about-cards">
              <div className="about-card glass reveal">
                <span className="label">Tech Stack</span>
                <div className="about-tech">
                  {tech.map((t) => (
                    <div key={t.group} className="about-tech-group">
                      <span className="about-tech-title">{t.group}</span>
                      <div className="about-tech-tags">
                        {t.items.map((item) => (
                          <span key={item} className="about-tech-tag">{item}</span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="about-card glass reveal">
                <span className="label">Accolades</span>
                <ul className="about-list">
                  {accolades.map((a) => (
                    <li key={a}>{a}</li>
                  ))}
                </ul>
              </div>

              <div className="about-card glass reveal">
                <span className="label">Education</span>
                <div className="about-edu">
                  <div className="about-edu-school">重庆工程学院</div>
                  <div className="about-edu-major">数字媒体艺术 · 2023 - 2027</div>
                  <p className="about-edu-courses">
                    AI 图像叙事 · 视听语言 · 虚拟制片技术 · 高级剧本创作
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .about { padding-top: 140px; }
        .about-grid {
          display: grid;
          grid-template-columns: 0.9fr 1.4fr;
          gap: 80px;
          align-items: start;
        }
        .about-media {
          position: sticky;
          top: 120px;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }
        .about-avatar {
          position: relative;
          aspect-ratio: 1;
          border-radius: 24px;
          overflow: hidden;
          display: grid;
          place-items: center;
          background: var(--panel-strong);
          border: 1px solid var(--line);
        }
        .about-avatar-gradient {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(139,92,246,0.25), rgba(6,182,212,0.2), rgba(236,72,153,0.15));
          filter: blur(40px);
          animation: avatarGlow 8s ease-in-out infinite alternate;
        }
        @keyframes avatarGlow {
          0% { transform: scale(1) rotate(0deg); }
          100% { transform: scale(1.1) rotate(10deg); }
        }
        .about-avatar-ring {
          position: absolute;
          inset: 24px;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 50%;
        }
        .about-avatar-text {
          position: relative;
          font-size: clamp(80px, 10vw, 140px);
          font-weight: 900;
          background: linear-gradient(135deg, #fff, #a5b4fc, #67e8f9);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.06em;
        }
        .about-contact {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 14px;
        }
        .about-contact-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.92rem;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }
        .about-contact-row:last-child { border: none; padding-bottom: 0; }
        .about-contact-label { color: var(--txt-muted); font-size: 0.85rem; }
        .about-header {
          margin-bottom: 40px;
        }
        .about-header .label { display: block; margin-bottom: 16px; }
        .about-body {
          padding: 36px;
          margin-bottom: 32px;
        }
        .about-stats-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-top: 32px;
          padding-top: 32px;
          border-top: 1px solid rgba(255,255,255,0.08);
        }
        .about-stat {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .about-stat-value {
          font-size: 1.8rem;
          font-weight: 800;
          background: linear-gradient(135deg, #fff, #a5b4fc);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .about-stat-label {
          font-size: 0.8rem;
          color: var(--txt-dim);
        }
        .about-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .about-card {
          padding: 28px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .about-tech-group {
          margin-bottom: 16px;
        }
        .about-tech-title {
          display: block;
          font-size: 0.75rem;
          color: var(--txt-muted);
          margin-bottom: 10px;
          letter-spacing: 0.08em;
        }
        .about-tech-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .about-tech-tag {
          padding: 6px 12px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid var(--line);
          font-size: 0.8rem;
          color: var(--txt-dim);
        }
        .about-list {
          list-style: none;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .about-list li {
          position: relative;
          padding-left: 18px;
          font-size: 0.95rem;
          color: var(--txt-dim);
          line-height: 1.5;
        }
        .about-list li::before {
          content: "▸";
          position: absolute;
          left: 0;
          color: var(--accent-2);
        }
        .about-edu-school {
          font-size: 1.1rem;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .about-edu-major {
          font-size: 0.85rem;
          color: var(--txt-dim);
          margin-bottom: 12px;
        }
        .about-edu-courses {
          font-size: 0.85rem;
          color: var(--txt-muted);
          line-height: 1.6;
        }
        @media (max-width: 1200px) {
          .about-grid { grid-template-columns: 1fr; gap: 48px; }
          .about-media { position: static; }
          .about-cards { grid-template-columns: 1fr; }
          .about-stats-row { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .about-body { padding: 24px; }
          .about-stats-row { grid-template-columns: 1fr 1fr; }
        }
      `}</style>
    </section>
  );
}
