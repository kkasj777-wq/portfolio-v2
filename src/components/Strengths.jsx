import { useEffect, useRef } from 'react';

const strengths = [
  {
    title: 'AI 全流程导演',
    desc: '从 Sora 底层提示词协议到角色一致性管控，可独立完成 15 集 AI 长剧集的工业化制作管线。',
    icon: '◈',
    color: '#8b5cf6',
  },
  {
    title: '实拍导演思维',
    desc: '将真实拍摄的镜头调度、光影逻辑与节奏控制注入 AIGC，避免“AI 味”的扁平画面。',
    icon: '▣',
    color: '#06b6d4',
  },
  {
    title: '叙事世界观架构',
    desc: '能独立完成 2 万字世界观架构，搭建连续叙事、角色弧光与情感闭环。',
    icon: '◉',
    color: '#ec4899',
  },
  {
    title: '商业短剧节奏',
    desc: '研究“黄金 3 秒”钩子模型与付费转化节奏，具备千万级流量池实战与情绪波峰设计经验。',
    icon: '◆',
    color: '#f59e0b',
  },
  {
    title: '视觉系统设计',
    desc: '平面视觉、动态海报、纹样与色彩系统一体化输出，保证作品视觉语言统一。',
    icon: '◇',
    color: '#10b981',
  },
  {
    title: '现场执行调度',
    desc: '30+ 场次现场调度经验，熟悉分镜脚本数字化、后期调色与剪辑品控全流程。',
    icon: '▦',
    color: '#3b82f6',
  },
];

export default function Strengths() {
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

  return (
    <section id="strengths" className="strengths section" ref={ref}>
      <div className="container">
        <div className="strengths-header reveal">
          <span className="label">Strengths</span>
          <h2 className="title-lg">个人优势</h2>
          <p className="body-lg strengths-intro">
            导演、编剧、设计师三种身份交汇，让我既能从叙事高度思考，也能把细节执行到像素级。
          </p>
        </div>

        <div className="strengths-grid">
          {strengths.map((s, i) => (
            <div
              key={s.title}
              className="strength-card reveal"
              style={{ '--str-color': s.color, '--str-delay': `${i * 60}ms` }}
            >
              <div className="strength-icon" style={{ color: s.color }}>
                {s.icon}
              </div>
              <h3 className="strength-title">{s.title}</h3>
              <p className="strength-desc">{s.desc}</p>
              <div className="strength-line" />
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .strengths { padding-top: 120px; padding-bottom: 160px; }
        .strengths-header { margin-bottom: 64px; }
        .strengths-header .label { display: block; margin-bottom: 16px; }
        .strengths-intro { max-width: 620px; margin-top: 20px; }
        .strengths-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }
        .strength-card {
          position: relative;
          padding: 36px;
          border-radius: 24px;
          background: var(--panel);
          border: 1px solid var(--line);
          overflow: hidden;
          transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
          transition-delay: var(--str-delay);
        }
        .strength-card:hover {
          transform: translateY(-6px);
          border-color: color-mix(in srgb, var(--str-color) 50%, transparent);
          box-shadow: 0 24px 50px rgba(0,0,0,0.3), 0 0 30px color-mix(in srgb, var(--str-color) 18%, transparent);
        }
        .strength-card::before {
          content: "";
          position: absolute;
          top: -40%;
          right: -40%;
          width: 80%;
          height: 80%;
          border-radius: 50%;
          background: radial-gradient(circle, color-mix(in srgb, var(--str-color) 16%, transparent), transparent 60%);
          pointer-events: none;
        }
        .strength-icon {
          font-size: 2rem;
          margin-bottom: 20px;
          opacity: 0.9;
          text-shadow: 0 0 20px currentColor;
        }
        .strength-title {
          font-size: 1.2rem;
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: -0.01em;
        }
        .strength-desc {
          font-size: 0.92rem;
          color: var(--txt-dim);
          line-height: 1.7;
        }
        .strength-line {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          height: 3px;
          background: linear-gradient(90deg, var(--str-color), transparent);
          opacity: 0.5;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.4s ease;
        }
        .strength-card:hover .strength-line { transform: scaleX(1); }
        @media (max-width: 1200px) {
          .strengths-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 768px) {
          .strengths-grid { grid-template-columns: 1fr; }
          .strength-card { padding: 28px; }
        }
      `}</style>
    </section>
  );
}
