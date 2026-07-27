import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import scripts from './data/scripts.json';
import './director-portfolio.css';

const asset = (path = '') => (path.startsWith('/') ? path : `/${path}`);

const projects = [
  {
    id: 'yafobuyu',
    index: '01',
    title: '崖佛不语，岁岁佑我',
    shortTitle: '崖佛不语',
    role: '导演 / 编剧',
    type: '剧情短片 · 大足石刻',
    statement: '石刻不是背景，而是人物记忆的空间。',
    description: '在童年、成年与归来三次时间回望中，让同一处石刻承担不同的情绪重量。减少对白解释，以站位、距离、雨雾和物件完成亲情叙事。',
    video: 'assets/video/previews/yafobuyu.mp4',
    poster: 'assets/frames/yafobuyu/frame_06.jpg',
    facts: ['导演 / 编剧', '两段 15 秒展示', '石刻 · 时间 · 记忆'],
  },
  {
    id: 'shoudian',
    index: '02',
    title: '手电',
    shortTitle: '手电',
    role: '导演 / 编剧',
    type: '剧情短片 · 父子关系',
    statement: '让光替人物说话。',
    description: '以一支旧手电串联家庭记忆。窄光先选择物，再选择人，最后让父子进入同一片亮处；网站保留 04:33 之后至片尾的完整段落。',
    video: 'assets/video/previews/shoudian.mp4',
    poster: 'assets/frames/shoudian/frame_07.jpg',
    facts: ['导演 / 编剧', '04:33 至片尾', '光线 · 观看 · 关系'],
  },
  {
    id: 'tongyoulu',
    index: '03',
    title: '通幽录 · 渝州篇',
    shortTitle: '通幽录',
    role: 'AI 导演 / 剧本开发 / 剪辑',
    type: '中式悬疑 · 7 集系列',
    statement: '世界规则先于奇观。',
    description: '从人物小传、世界规则和文学剧本出发，首集拆解为 176 条镜头指令；统一角色、场景与关键道具资产，完成 7 集连续生产。',
    video: 'assets/video/previews/tongyoulu/ep01.mp4',
    poster: 'assets/frames/tongyoulu/hero-poster.jpg',
    facts: ['7 集', '60+ 分钟', '首集 176 条镜头指令'],
  },
  {
    id: 'maimai',
    index: '04',
    title: '麦麦的魔法面包店',
    shortTitle: '麦麦的魔法面包店',
    role: '导演 / 系列策划 / 制作',
    type: '儿童奇幻 · 15 集系列',
    statement: '重复的是机制，不是每一集的视觉答案。',
    description: '以“一种魔法面包回应一种成长困惑”为单元机制，持续统一角色与面包店世界，同时让能力、空间和冲突在每集中保持独立。',
    video: 'assets/video/previews/maimai/ep01.mp4',
    poster: 'assets/frames/maimai/ep09/frame_06.jpg',
    facts: ['15 集', '30+ 分钟', '15 个独立单元命题'],
  },
];

const episodes = [
  ['01', '浮生无迹 · 归乡逢幽'],
  ['02', '渝州巷年'],
  ['03', '江畔古楼'],
  ['04', '黄桷渡 · 燃茶案'],
  ['05', '傀灵寄忆'],
  ['06', '黄桷渡 · 忌渡'],
  ['07', '南山旧约'],
];

const practices = [
  ['奶茶滚烫', '导演助理 / 30+ 场次', '搜狐视频、乐视 TV 播出'],
  ['反家乡', '摄影 / 剪辑，摄影为共同署名', '共青团重庆市綦江区委员会出品与策划'],
  ['红果商业短剧', '艺人助理 / 现场协作', '以真实剧组执行经验补足导演判断'],
];

function PlayIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M8.2 5.6v12.8L18 12 8.2 5.6Z" fill="currentColor" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ProjectDialog({ project, onClose }) {
  const dialogRef = useRef(null);
  const closeRef = useRef(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return undefined;
    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        onClose();
      }
    };
    document.body.classList.add('director-dialog-open');
    dialog.showModal();
    closeRef.current?.focus();
    window.addEventListener('keydown', handleEscape);
    return () => {
      window.removeEventListener('keydown', handleEscape);
      document.body.classList.remove('director-dialog-open');
      if (dialog.open) dialog.close();
    };
  }, [onClose]);

  return (
    <dialog
      ref={dialogRef}
      className="dc-dialog"
      aria-labelledby={`dialog-title-${project.id}`}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose();
      }}
    >
      <div className="dc-dialog-shell">
        <header className="dc-dialog-head">
          <span>{project.index} / DIRECTOR'S CUT</span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={`关闭${project.title}项目详情`}>
            关闭 <kbd>Esc</kbd>
          </button>
        </header>
        <div className="dc-dialog-media">
          <video
            key={project.video}
            src={asset(project.video)}
            poster={asset(project.poster)}
            autoPlay
            controls
            playsInline
            preload="metadata"
          />
        </div>
        <div className="dc-dialog-copy">
          <div>
            <p>{project.type}</p>
            <h2 id={`dialog-title-${project.id}`}>{project.title}</h2>
          </div>
          <div>
            <strong>{project.statement}</strong>
            <p>{project.description}</p>
          </div>
        </div>
        <dl className="dc-dialog-facts">
          {project.facts.map((fact, index) => (
            <div key={fact}>
              <dt>{String(index + 1).padStart(2, '0')}</dt>
              <dd>{fact}</dd>
            </div>
          ))}
        </dl>
      </div>
    </dialog>
  );
}

function FloatingNavigation() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24);
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  return (
    <header className={`dc-nav-wrap${scrolled ? ' is-scrolled' : ''}`}>
      <nav className="dc-nav" aria-label="导演作品集导航">
        <a className="dc-brand" href="#top" aria-label="返回导演作品集首页">
          <i aria-hidden="true" />
          <span>WANG CHENXIN</span>
        </a>
        <div className="dc-nav-links">
          <a href="#works">作品</a>
          <a href="#archive">制作档案</a>
          <a href="#writing">剧本</a>
          <a href="#practice">经历</a>
        </div>
        <a className="dc-nav-action" href="#contact">联系</a>
      </nav>
    </header>
  );
}

function Hero({ onPlay }) {
  const videoRef = useRef(null);

  return (
    <section className="dc-hero" id="top">
      <video
        ref={videoRef}
        className="dc-hero-video"
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster={asset('assets/frames/tongyoulu/hero-poster.jpg')}
        aria-hidden="true"
      >
        <source src={asset('assets/video/tongyoulu-hero-clean.mp4')} type="video/mp4" />
      </video>
      <div className="dc-hero-geometry" aria-hidden="true"><i /><b /></div>
      <div className="dc-hero-shade" aria-hidden="true" />
      <div className="dc-hero-inner">
        <p className="dc-eyebrow">AUTHOR-DIRECTOR / SCREENWRITER / 2026</p>
        <h1>先决定人物为什么行动，<br />再决定镜头如何移动。</h1>
        <p className="dc-hero-note">王陈鑫以剧本、分镜、世界构建和剪辑完成同一条导演判断链。</p>
        <div className="dc-hero-actions">
          <button type="button" className="dc-button dc-button-primary" onClick={onPlay}>
            <PlayIcon />播放 15S SHOWREEL
          </button>
          <a className="dc-button dc-button-ghost" href="#works">查看代表作 <ArrowIcon /></a>
        </div>
      </div>
      <div className="dc-hero-meta" aria-label="作品集摘要">
        <span>DIRECTING</span><b>04 CORE WORKS</b>
        <span>SCREENWRITING</span><b>05 ORIGINAL SCRIPTS</b>
        <span>LOCATION</span><b>CHONGQING</b>
      </div>
    </section>
  );
}

function EvidenceRail() {
  const evidence = [
    ['7', '《通幽录》连续剧集'],
    ['60+', '分钟系列成片'],
    ['176', '首集镜头指令'],
    ['15', '《麦麦》独立单元'],
  ];
  return (
    <section className="dc-evidence" aria-label="项目数据">
      <p>DIRECTOR'S PROOF</p>
      <dl>
        {evidence.map(([value, label]) => (
          <div key={label}>
            <dt>{value}</dt>
            <dd>{label}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function Works({ onSelect }) {
  return (
    <section className="dc-section dc-works" id="works">
      <header className="dc-section-head">
        <div>
          <p className="dc-eyebrow">SELECTED DIRECTING WORK</p>
          <h2>作品不是技能分类，<br />而是判断留下的证据。</h2>
        </div>
        <p>四部项目采用四种叙事机制：空间记忆、光线组织、世界连续性与儿童单元结构。点击任一项目播放真实片段。</p>
      </header>
      <div className="dc-projects">
        {projects.map((project, index) => (
          <article className={`dc-project dc-project-${project.id}`} key={project.id}>
            <button type="button" className="dc-project-media" onClick={() => onSelect(project)} aria-label={`播放并查看${project.title}`}>
              <img
                src={asset(project.poster)}
                alt={`${project.title}项目剧照`}
                width="1600"
                height="900"
                fetchPriority={index === 0 ? 'high' : undefined}
                loading={index === 0 ? 'eager' : 'lazy'}
              />
              <span><PlayIcon />PLAY PROJECT</span>
            </button>
            <div className="dc-project-copy">
              <p><span>{project.index}</span>{project.type}</p>
              <h3>{project.title}</h3>
              <blockquote>“{project.statement}”</blockquote>
              <p>{project.description}</p>
              <button type="button" className="dc-inline-action" onClick={() => onSelect(project)}>
                打开项目 <ArrowIcon />
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

function ProductionArchive() {
  return (
    <section className="dc-section dc-archive" id="archive">
      <header className="dc-archive-title">
        <p className="dc-eyebrow">WORLD BUILDING ARCHIVE / TONGYOULU</p>
        <h2>连续性来自系统，<br />不是来自运气。</h2>
        <p>七集不是一个数字，而是角色、场景、道具、镜头语法和剪辑节奏被持续证明。</p>
      </header>
      <div className="dc-archive-console">
        <div className="dc-console-head">
          <span>YUZHOU_ARCHIVE.EXE</span>
          <code>EP 01—07 / 60+ MIN / 176 SHOTS</code>
        </div>
        <div className="dc-console-media">
          <img src={asset('assets/frames/tongyoulu/hero-poster.jpg')} alt="《通幽录·渝州篇》世界观画面" width="1600" height="900" loading="lazy" />
          <div className="dc-console-scan" aria-hidden="true" />
        </div>
        <ol className="dc-episode-list">
          {episodes.map(([number, title]) => (
            <li key={number}>
              <span>{number}</span><strong>{title}</strong><i>READY</i>
            </li>
          ))}
        </ol>
        <div className="dc-archive-method">
          <article><span>01</span><h3>故事规则</h3><p>先确定人物被遗忘的代价，再让精怪与山城空间进入叙事。</p></article>
          <article><span>02</span><h3>镜头预演</h3><p>用图示分镜固定站位、空间尺度与动作方向，再进入影像生成。</p></article>
          <article><span>03</span><h3>资产连续</h3><p>重复调用角色、场景与关键道具，维持跨镜头、跨集的识别。</p></article>
        </div>
      </div>
    </section>
  );
}

function Writing() {
  const scriptRows = useMemo(() => scripts.slice(0, 5), []);
  return (
    <section className="dc-section dc-writing" id="writing">
      <header className="dc-section-head">
        <div>
          <p className="dc-eyebrow">ORIGINAL SCREENPLAYS</p>
          <h2>剧本写的不是对白，<br />是选择与代价。</h2>
        </div>
        <p>五部原创剧本均保留完整终稿。网页只展示题材、体量与核心命题，不用虚构奖项代替文本。</p>
      </header>
      <ol className="dc-script-list">
        {scriptRows.map((script, index) => (
          <li key={script.id}>
            <span>{String(index + 1).padStart(2, '0')}</span>
            <div><h3>{script.title}</h3><p>{script.format}</p></div>
            <code>FINAL DRAFT</code>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Practice() {
  return (
    <section className="dc-section dc-practice" id="practice">
      <header className="dc-section-head">
        <div>
          <p className="dc-eyebrow">FIELD PRACTICE</p>
          <h2>真实协作，<br />让署名边界成为创作的一部分。</h2>
        </div>
        <p>导演判断不只发生在个人项目里，也发生在剧组执行、纪录影像与商业生产的现场。</p>
      </header>
      <div className="dc-practice-layout">
        <figure>
          <img src={asset('assets/frames/fanjiagxiang/frame_00.jpg')} alt="《反家乡》纪录短片项目画面" width="1280" height="720" loading="lazy" />
          <figcaption>《反家乡》/ 共青团伙伴计划纪录短片</figcaption>
        </figure>
        <ul>
          {practices.map(([title, role, proof], index) => (
            <li key={title}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <div><h3>{title}</h3><p>{role}</p><small>{proof}</small></div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function Contact() {
  return (
    <footer className="dc-contact" id="contact">
      <div className="dc-contact-inner">
        <p className="dc-eyebrow">NEXT FRAME / 2026</p>
        <h2>下一镜，<br />一起完成。</h2>
        <div className="dc-contact-actions">
          <a className="dc-button dc-button-primary" href="mailto:3146652776@qq.com">发送邮件 <ArrowIcon /></a>
          <a className="dc-button dc-button-ghost" href="tel:13002860718">13002860718</a>
        </div>
        <div className="dc-contact-meta">
          <span>3146652776@qq.com</span><i>|</i><span>CHONGQING</span><i>|</i><span>AUTHOR-DIRECTOR</span>
        </div>
        <a className="dc-back-link" href="/">返回原版网站</a>
      </div>
    </footer>
  );
}

export default function DirectorPortfolio() {
  const [selectedProject, setSelectedProject] = useState(null);
  const openerRef = useRef(null);

  useEffect(() => {
    const previousTitle = document.title;
    document.title = '王陈鑫｜作者型导演作品集';
    document.body.classList.add('director-cut-page');
    return () => {
      document.title = previousTitle;
      document.body.classList.remove('director-cut-page');
    };
  }, []);

  const openProject = (project) => {
    openerRef.current = document.activeElement;
    setSelectedProject(project);
  };

  const closeProject = useCallback(() => {
    setSelectedProject(null);
    requestAnimationFrame(() => openerRef.current?.focus());
  }, []);

  return (
    <div className="director-cut">
      <a className="dc-skip" href="#works">跳到代表作品</a>
      <FloatingNavigation />
      <main>
        <Hero onPlay={() => openProject(projects[2])} />
        <EvidenceRail />
        <Works onSelect={openProject} />
        <ProductionArchive />
        <Writing />
        <Practice />
      </main>
      <Contact />
      {selectedProject && <ProjectDialog project={selectedProject} onClose={closeProject} />}
    </div>
  );
}
