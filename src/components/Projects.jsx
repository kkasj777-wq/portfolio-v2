import { useEffect, useRef } from 'react';

const categoryMeta = {
  '剧情影像': { color: 'var(--cat-drama)', label: 'Drama Film', desc: '连续叙事、角色一致性与情感张力' },
  '实验影像': { color: 'var(--cat-experiment)', label: 'Experimental', desc: '非线性叙事与视听语言探索' },
  '纪录影像': { color: 'var(--cat-doc)', label: 'Documentary', desc: '真实切片与社会观察' },
  '非遗影像': { color: 'var(--cat-heritage)', label: 'Heritage', desc: '传统工艺的动态影像转译' },
  '平面视觉': { color: 'var(--cat-graphic)', label: 'Visual Design', desc: '海报、纹样与视觉系统' },
  '摄影': { color: 'var(--cat-photo)', label: 'Photography', desc: '光影、城市与自然' },
  '商业实战': { color: 'var(--cat-commercial)', label: 'Commercial', desc: '短剧项目与现场执行' },
};

export default function Projects({ works, onOpenWork }) {
  const ref = useRef(null);

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.08 });

    if (ref.current) {
      ref.current.querySelectorAll('.reveal').forEach((el) => obs.observe(el));
    }
    return () => obs.disconnect();
  }, [works]);

  const grouped = works.reduce((acc, w) => {
    const cat = w.category || '其他';
    acc[cat] = acc[cat] || [];
    acc[cat].push(w);
    return acc;
  }, {});

  const categoryOrder = ['剧情影像', '商业实战', '实验影像', '纪录影像', '非遗影像', '平面视觉', '摄影'];
  const categories = categoryOrder.filter((c) => grouped[c]).map((c) => ({ name: c, works: grouped[c] }));

  return (
    <section id="projects" className="projects section" ref={ref}>
      <div className="container">
        <div className="projects-header reveal">
          <span className="label">Selected Works</span>
          <h2 className="title-lg">精选作品</h2>
          <p className="body-lg projects-intro">
            36 件作品按类别归集，从 AI 长剧集到商业短剧、从实验影像到平面视觉，
            每个类别都有独立的主题色与视觉节奏。
          </p>
        </div>

        <div className="projects-body">
          {categories.map((cat, catIndex) => {
            const meta = categoryMeta[cat.name] || { color: '#888', label: 'Work', desc: '' };
            return (
              <div key={cat.name} className="projects-category">
                <div className="category-header reveal">
                  <div className="category-index" style={{ color: meta.color }}>
                    {String(catIndex + 1).padStart(2, '0')}
                  </div>
                  <div className="category-info">
                    <div className="category-name">
                      <span className="category-dot" style={{ background: meta.color }} />
                      {cat.name}
                    </div>
                    <div className="category-meta">
                      <span className="category-label">{meta.label}</span>
                      <span className="category-desc">{meta.desc}</span>
                    </div>
                  </div>
                  <div className="category-count" style={{ color: meta.color }}>
                    {cat.works.length} 件
                  </div>
                </div>

                <div className="category-grid">
                  {cat.works.map((w) => (
                    <div
                      key={w.id}
                      className="project-card reveal"
                      style={{ '--cat-color': meta.color }}
                      onClick={() => onOpenWork(w)}
                    >
                      <div className="project-card-media">
                        <img
                          src={w.thumb || '/assets/noise.png'}
                          alt={w.title}
                          loading="lazy"
                        />
                        <div className="project-card-shine" />
                        <div className="project-card-overlay" />
                      </div>
                      <div className="project-card-body">
                        <div className="project-card-meta">
                          <span className="project-card-year">{w.year || '—'}</span>
                          <span className="project-card-role">{w.role || ''}</span>
                        </div>
                        <h3 className="project-card-title">{w.title}</h3>
                        <p className="project-card-sub">{w.sub || ''}</p>
                      </div>
                      <div className="project-card-glow" />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <style>{`
        .projects { padding-top: 140px; }
        .projects-header { margin-bottom: 80px; }
        .projects-header .label { display: block; margin-bottom: 16px; }
        .projects-intro { max-width: 720px; margin-top: 20px; }

        .projects-category { margin-bottom: 100px; }
        .category-header {
          display: flex;
          align-items: flex-end;
          gap: 24px;
          margin-bottom: 32px;
          padding-bottom: 24px;
          border-bottom: 1px solid rgba(255,255,255,0.08);
        }
        .category-index {
          font-size: clamp(48px, 5vw, 80px);
          font-weight: 900;
          line-height: 1;
          opacity: 0.5;
          letter-spacing: -0.04em;
        }
        .category-info {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .category-name {
          font-size: clamp(24px, 2.2vw, 34px);
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          letter-spacing: -0.02em;
        }
        .category-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          box-shadow: 0 0 12px currentColor;
        }
        .category-meta {
          display: flex;
          align-items: center;
          gap: 16px;
          font-size: 0.9rem;
          color: var(--txt-muted);
        }
        .category-label {
          padding: 4px 10px;
          border-radius: 999px;
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.08);
          font-size: 0.75rem;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .category-count {
          font-size: 1.1rem;
          font-weight: 700;
          opacity: 0.9;
        }

        .category-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .project-card {
          position: relative;
          border-radius: 20px;
          overflow: hidden;
          cursor: pointer;
          background: var(--panel);
          border: 1px solid var(--line);
          transition: transform 0.4s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.4s ease, border-color 0.4s ease;
        }
        .project-card:hover {
          transform: translateY(-8px);
          border-color: var(--cat-color);
          box-shadow: 0 24px 60px rgba(0,0,0,0.35), 0 0 40px color-mix(in srgb, var(--cat-color) 25%, transparent);
        }
        .project-card-media {
          position: relative;
          aspect-ratio: 16 / 10;
          overflow: hidden;
        }
        .project-card-media img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .project-card:hover .project-card-media img { transform: scale(1.06); }
        .project-card-shine {
          position: absolute;
          inset: 0;
          background: linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.08) 50%, transparent 60%);
          transform: translateX(-100%);
          transition: transform 0.7s ease;
          pointer-events: none;
        }
        .project-card:hover .project-card-shine { transform: translateX(100%); }
        .project-card-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(5,5,8,0.85) 0%, transparent 50%);
          pointer-events: none;
        }
        .project-card-body {
          position: relative;
          padding: 22px 24px 24px;
          display: flex;
          flex-direction: column;
          gap: 6px;
          z-index: 2;
        }
        .project-card-meta {
          display: flex;
          justify-content: space-between;
          font-size: 0.75rem;
          color: var(--txt-muted);
          margin-bottom: 6px;
          letter-spacing: 0.04em;
        }
        .project-card-title {
          font-size: 1.15rem;
          font-weight: 700;
          color: var(--txt);
          letter-spacing: -0.01em;
        }
        .project-card-sub {
          font-size: 0.85rem;
          color: var(--txt-dim);
          line-height: 1.5;
        }
        .project-card-glow {
          position: absolute;
          inset: -1px;
          border-radius: 20px;
          pointer-events: none;
          opacity: 0;
          transition: opacity 0.4s ease;
          background: radial-gradient(circle at 50% 0%, color-mix(in srgb, var(--cat-color) 30%, transparent), transparent 60%);
          z-index: 0;
        }
        .project-card:hover .project-card-glow { opacity: 1; }

        @media (max-width: 1200px) {
          .category-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .category-header { flex-direction: column; align-items: flex-start; gap: 12px; }
          .category-grid { grid-template-columns: 1fr; }
          .category-meta { flex-direction: column; align-items: flex-start; gap: 8px; }
        }
      `}</style>
    </section>
  );
}
