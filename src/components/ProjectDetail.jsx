import { useEffect, useRef, useState } from 'react';

export default function ProjectDetail({ work, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const accent = work.color || '#8b5cf6';
  const accent2 = work.color2 || '#06b6d4';

  const isEpisodic = work.episodes && work.episodes.length > 0;
  const [activeEp, setActiveEp] = useState(0);
  const railRef = useRef(null);

  // 分集轨道：用 window 级监听做拖拽滚动；点击集数在轨道层用 closest 处理，
  // 避免 setPointerCapture 劫持子按钮 onClick 导致切换失效。
  const drag = useRef({ down: false, startX: 0, scroll: 0, moved: false });
  const onRailDown = (e) => {
    const el = railRef.current; if (!el) return;
    drag.current = { down: true, startX: e.clientX, scroll: el.scrollLeft, moved: false };
    const move = (ev) => {
      const d = drag.current; if (!d.down) return;
      const walk = ev.clientX - d.startX;
      if (Math.abs(walk) > 4) d.moved = true;
      el.scrollLeft = d.scroll - walk;
    };
    const up = () => {
      drag.current.down = false;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
  };
  const onRailClick = (e) => {
    const wasDrag = drag.current.moved;
    drag.current.moved = false;
    if (wasDrag) return; // 刚拖过，忽略
    const chip = e.target.closest('.detail-ep-chip');
    if (!chip) return;
    const i = Number(chip.dataset.idx);
    if (!Number.isNaN(i)) setActiveEp(i);
  };

  const activeEpisode = isEpisodic ? work.episodes[activeEp] : null;
  const heroImg = activeEpisode ? activeEpisode.frames[0] : work.thumb;
  const galleryItems = activeEpisode
    ? activeEpisode.frames.map((src, i) => ({ src, caption: `${activeEpisode.title} · 图 ${i + 1}` }))
    : (work.images || []).map((src, i) => ({ src, caption: `图 ${i + 1}` }));

  return (
    <div className="detail-backdrop" onClick={onClose} style={{ '--c': accent, '--c2': accent2 }}>
      {/* 详情页流动极光背景（主色）——让点进来后依旧有动态氛围 */}
      <div className="detail-ambient" aria-hidden="true" />

      <div className="detail-modal" onClick={(e) => e.stopPropagation()}>
        <button className="detail-close" onClick={onClose}>×</button>

        <div className="detail-hero">
          {/* key={heroImg} 让切换分集时重新挂载，触发淡入 + Ken Burns 推镜 */}
          <img key={heroImg} src={heroImg} alt={work.title} className="detail-hero-img" />
          <div className="detail-hero-gradient" />
          {isEpisodic && (
            <div className="detail-hero-badge">
              {activeEpisode.title} · 第 {activeEp + 1}/{work.episodes.length} 集
            </div>
          )}
        </div>

        <div className="detail-body">
          <div className="detail-meta">
            <span className="detail-cat" style={{ color: accent }}>{work.category}</span>
            <span className="detail-year">{work.year || '—'}</span>
            <span className="detail-role">{work.role || ''}</span>
          </div>
          <h2 className="detail-title">{work.title}</h2>
          <p className="detail-sub">{work.sub || ''}</p>
          <p className="detail-desc">{work.desc || '暂无描述。'}</p>

          {isEpisodic && (
            <div className="detail-episodes">
              <div className="detail-section-head">
                <span className="label">Episodes</span>
                <span className="detail-ep-count">共 {work.episodes.length} 集 · 点击切换 / 可拖动</span>
              </div>
              <div
                className="detail-ep-rail"
                ref={railRef}
                onPointerDown={onRailDown}
                onClick={onRailClick}
              >
                {work.episodes.map((e, i) => (
                  <button
                    key={e.ep}
                    data-idx={i}
                    className={`detail-ep-chip ${i === activeEp ? 'on' : ''}`}
                  >
                    <img src={e.frames[0]} alt={e.title} draggable={false} />
                    <span>{e.title}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="detail-gallery">
            <span className="label">
              {isEpisodic ? `当前分集图集 · ${galleryItems.length} 张` : `Gallery · ${galleryItems.length} 张`}
            </span>
            {/* key 让切换分集时整组图集重新淡入 */}
            <div className="detail-grid" key={isEpisodic ? activeEp : 'static'}>
              {galleryItems.map((g, i) => (
                <div
                  key={i}
                  className="detail-thumb"
                  style={{ animationDelay: `${Math.min(i * 0.05, 0.4)}s` }}
                >
                  <img src={g.src} alt={g.caption || work.title} draggable={false} />
                  {g.caption && <span className="detail-caption">{g.caption}</span>}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .detail-backdrop {
          position: fixed;
          inset: 0;
          z-index: 200;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 48px;
          background: rgba(0,0,0,0.72);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          animation: fadeIn 0.3s ease;
          overflow: hidden;
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* 详情页流动极光背景：随作品主色，持续漂移，不再是死黑遮罩 */
        .detail-ambient {
          position: absolute;
          inset: -20%;
          z-index: 0;
          pointer-events: none;
          background:
            radial-gradient(circle at 25% 25%, color-mix(in srgb, var(--c) 55%, transparent), transparent 42%),
            radial-gradient(circle at 78% 30%, color-mix(in srgb, var(--c2) 45%, transparent), transparent 40%),
            radial-gradient(circle at 55% 82%, color-mix(in srgb, var(--c) 35%, transparent), transparent 45%);
          filter: blur(60px);
          opacity: 0.55;
          animation: detailDrift 22s ease-in-out infinite alternate;
        }
        @keyframes detailDrift {
          0%   { transform: translate(0,0) scale(1) rotate(0deg); }
          50%  { transform: translate(3%, -4%) scale(1.12) rotate(6deg); }
          100% { transform: translate(-3%, 3%) scale(1.06) rotate(-5deg); }
        }

        .detail-modal {
          position: relative;
          z-index: 1;
          width: 100%;
          max-width: 1100px;
          max-height: 92vh;
          overflow-y: auto;
          border-radius: 28px;
          background: rgba(12,12,18,0.86);
          border: 1px solid rgba(255,255,255,0.1);
          box-shadow: 0 40px 100px rgba(0,0,0,0.5), 0 0 70px color-mix(in srgb, var(--c) 22%, transparent);
          animation: slideUp 0.45s cubic-bezier(0.16,1,0.3,1);
        }
        @keyframes slideUp { from { opacity: 0; transform: translateY(48px) scale(0.98); } to { opacity: 1; transform: translateY(0) scale(1); } }

        .detail-close {
          position: absolute;
          top: 20px;
          right: 20px;
          width: 44px;
          height: 44px;
          border-radius: 50%;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.4);
          color: var(--txt);
          font-size: 1.6rem;
          cursor: pointer;
          z-index: 10;
          transition: all 0.2s ease;
        }
        .detail-close:hover { background: rgba(255,255,255,0.12); border-color: var(--txt); transform: rotate(90deg); }

        .detail-hero {
          position: relative;
          width: 100%;
          aspect-ratio: 21 / 9;
          overflow: hidden;
        }
        /* 封面图：切入淡显 + 持续缓慢推镜（Ken Burns），保持画面一直有微动 */
        .detail-hero-img {
          width: 100%; height: 100%; object-fit: cover;
          transform-origin: 50% 42%;
          animation: heroReveal 0.8s ease both, heroZoom 20s ease-in-out 0.8s infinite alternate;
        }
        @keyframes heroReveal { from { opacity: 0; transform: scale(1.14); } to { opacity: 1; transform: scale(1.05); } }
        @keyframes heroZoom { from { transform: scale(1.05); } to { transform: scale(1.15); } }

        .detail-hero-gradient {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(circle at 80% 0%, color-mix(in srgb, var(--c) 32%, transparent), transparent 45%),
            radial-gradient(circle at 20% 100%, color-mix(in srgb, var(--c2) 24%, transparent), transparent 45%),
            linear-gradient(to top, rgba(12,12,18,0.96) 0%, transparent 62%);
          animation: heroGlow 9s ease-in-out infinite alternate;
        }
        @keyframes heroGlow { from { opacity: 0.85; } to { opacity: 1; } }

        .detail-hero-badge {
          position: absolute;
          left: 24px;
          bottom: 24px;
          padding: 8px 16px;
          border-radius: 999px;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(8px);
          border: 1px solid rgba(255,255,255,0.12);
          font-size: 0.85rem;
          font-weight: 600;
          letter-spacing: 0.02em;
          animation: fadeUp 0.6s ease 0.3s both;
        }

        .detail-body { padding: 40px 48px 56px; }
        /* 正文各块依次进场 */
        .detail-body > * { animation: fadeUp 0.6s ease both; }
        .detail-body > .detail-meta { animation-delay: 0.10s; }
        .detail-body > .detail-title { animation-delay: 0.16s; }
        .detail-body > .detail-sub { animation-delay: 0.22s; }
        .detail-body > .detail-desc { animation-delay: 0.28s; }
        .detail-body > .detail-episodes { animation-delay: 0.34s; }
        .detail-body > .detail-gallery { animation-delay: 0.40s; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }

        .detail-meta { display: flex; align-items: center; gap: 16px; margin-bottom: 16px; font-size: 0.85rem; }
        .detail-cat { font-weight: 700; }
        .detail-year, .detail-role { color: var(--txt-muted); }
        .detail-title { font-size: clamp(28px, 3vw, 42px); font-weight: 800; letter-spacing: -0.03em; margin-bottom: 8px; }
        .detail-sub { font-size: 1rem; color: var(--txt-dim); margin-bottom: 20px; }
        .detail-desc { font-size: 1rem; color: var(--txt-dim); line-height: 1.8; max-width: 820px; margin-bottom: 36px; }

        .detail-section-head { display: flex; align-items: baseline; justify-content: space-between; margin-bottom: 16px; }
        .detail-ep-count { font-size: 0.82rem; color: var(--txt-muted); }
        .detail-episodes { margin-bottom: 36px; }
        .detail-ep-rail {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          padding-bottom: 12px;
          cursor: grab;
          scrollbar-width: thin;
          user-select: none;
        }
        .detail-ep-rail:active { cursor: grabbing; }
        .detail-ep-chip {
          flex: 0 0 150px;
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.08);
          background: rgba(255,255,255,0.04);
          cursor: pointer;
          padding: 0;
          text-align: left;
          transition: border-color 0.25s ease, transform 0.25s ease, box-shadow 0.25s ease;
        }
        .detail-ep-chip.on { border-color: var(--c); box-shadow: 0 0 24px color-mix(in srgb, var(--c) 30%, transparent); transform: translateY(-2px); }
        .detail-ep-chip:hover { transform: translateY(-3px); box-shadow: 0 8px 20px rgba(0,0,0,0.35); }
        .detail-ep-chip img { width: 100%; aspect-ratio: 16 / 10; object-fit: cover; display: block; pointer-events: none; transition: transform 0.4s ease; }
        .detail-ep-chip:hover img { transform: scale(1.06); }
        .detail-ep-chip span {
          display: block; padding: 8px 10px; font-size: 0.72rem; color: var(--txt-dim);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        .detail-gallery .label { display: block; margin-bottom: 16px; }
        .detail-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
          gap: 12px;
        }
        /* 每张缩略图依次淡入上浮（切换分集时因 key 变化重新触发） */
        .detail-thumb {
          position: relative; border-radius: 12px; overflow: hidden; aspect-ratio: 16 / 10;
          animation: thumbIn 0.5s ease both;
        }
        @keyframes thumbIn { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
        .detail-thumb img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.4s ease; }
        .detail-thumb:hover img { transform: scale(1.08); }
        .detail-caption {
          position: absolute; bottom: 0; left: 0; right: 0; padding: 10px 12px;
          background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
          font-size: 0.72rem; color: var(--txt-dim);
        }

        @media (prefers-reduced-motion: reduce) {
          .detail-ambient, .detail-hero-img, .detail-hero-gradient { animation: none !important; }
        }
        @media (max-width: 768px) {
          .detail-backdrop { padding: 16px; }
          .detail-body { padding: 28px 24px; }
          .detail-hero { aspect-ratio: 16 / 10; }
          .detail-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>
    </div>
  );
}
